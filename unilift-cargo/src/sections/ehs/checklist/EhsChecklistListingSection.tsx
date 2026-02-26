'use client';
import React, { useCallback, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, ChevronRight, X } from 'lucide-react';
import { getAllChecklistTopic } from '@/actions/admin/ehs/checklist';
import { useRouter } from 'next/navigation';
import { PaginationSection } from '@/components/PaginationSection';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { useUser } from '@/context/UserContext';
import toast from 'react-hot-toast';
import debounce from 'lodash.debounce';
import Image from 'next/image';
import ASSETS from '@/assets';
import { AppRoutes } from '@/constants/AppRoutes';
import EhsListingSkeleton from '@/skeleton/EhsListingSkeleton';
import { EmptyState } from '@/components/EmptyState';
import EHSChecklistModal from '@/components/modals/ehs/EHSChecklistModal';
import SuggestChecklistModal from '@/components/modals/ehs/SuggestChecklistModal';

const ITEM_PER_PAGE = 12;
const DEBOUNCE_DELAY = 400;

type ChecklistFilterType = {
  page: number;
  search: string;
};

const INITIAL_CHECKLIST = {
  page: 1,
  search: ''
} as const;

const EhsChecklistListingSection = () => {
  const router = useRouter();

  const [filter, setFilter] = useState<ChecklistFilterType>(INITIAL_CHECKLIST);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const user = useUser();
  const {
    data: checklistData,
    isLoading,
    isRefetching,
    refetch
  } = useQuery({
    queryKey: ['allChecklistTopics'],
    queryFn: async () =>
      await getAllChecklistTopic(filter.page, ITEM_PER_PAGE, filter.search),
    refetchOnWindowFocus: false
  });

  const _debouncedSubmit = useCallback(
    debounce(() => refetch(), DEBOUNCE_DELAY),
    [refetch]
  );

  const filteredTopics = checklistData?.data || [];

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const searchValue = e.target.value;
    setFilter(prev => ({
      ...prev,
      search: searchValue,
      page: 1
    }));

    _debouncedSubmit();
  };

  const handlePageChange = useCallback(
    (val: number) => {
      setFilter(prev => ({ ...prev, page: val }));
      _debouncedSubmit();
    },
    [_debouncedSubmit]
  );

  const handleCardClick = (id: number) => {
    if (!user.userId) {
      toast.dismiss();
      toast.error('Please Login or signup to access this checklist');
      return;
    }
    router.push(AppRoutes.EHS_CHECKLIST_DETAILS(id));
  };

  const handleSuggestionClick = () => {
    if (!user.userId) {
      toast.dismiss();
      toast.error('Please Login or Signup to suggest any checklist topics');
      return;
    }
    setIsModalOpen(true);
  };

  return (
    <div className="relative overflow-hidden">
      <div className="w-full h-full pointer-events-none">
        <div className="absolute -left-32 top-44 rotate-90">
          <Image
            src={ASSETS.IMG.SAFEZY_TEXT}
            alt="Safety Text"
            height={512}
            width={512}
            className="w-[450px] h-auto"
            priority
          />
        </div>
        <div className="absolute right-0 bottom-0 translate-x-1/2  ">
          <Image
            src={ASSETS.IMG.HELMET}
            alt="Decorative Helmet"
            height={512}
            width={512}
            className="w-[550px] h-auto "
            priority
          />
        </div>
      </div>
      <div className="w-full max-w-7xl mx-auto px-4 py-8 ">
        {/* Header and Search */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div className="flex gap-2">
            <button
              className="bg-primary py-2 px-4 rounded-sm text-white font-bold text-sm sm:text-base uppercase cursor-pointer"
              onClick={handleSuggestionClick}
            >
              Have a Topic? Share with us!
            </button>

            <EHSChecklistModal />
          </div>

          <div className="relative w-full md:w-72">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              type="text"
              placeholder="Search topics..."
              className="pl-10 w-full bg-white z-20"
              value={filter.search || ''}
              onChange={handleSearch}
            />

            {filter.search && (
              <button
                onClick={() => {
                  setFilter(prev => ({ ...prev, search: '' }));
                  _debouncedSubmit();
                }}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 
                 hover:text-gray-600 transition-colors duration-200"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        {(isLoading || isRefetching) && <EhsListingSkeleton />}
        {!isLoading && !isRefetching && filteredTopics.length === 0 && (
          <EmptyState searchQuery={filter.search} contentType="Checklists" />
        )}
        {!isLoading && !isRefetching && filteredTopics.length !== 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTopics.map(topic => (
              <Card
                key={topic.id}
                className="group cursor-pointer border-primary hover:shadow-lg transition-all duration-300 hover:-translate-y-1 z-20"
                onClick={() => handleCardClick(topic.id)}
              >
                <CardContent className="p-6">
                  <div className="flex justify-between items-center">
                    <div className="space-y-2">
                      <h3 className="text-xl font-semibold text-gray-800 group-hover:text-primary transition-colors">
                        {topic.topic_name}
                      </h3>
                      <p className="text-sm text-gray-600">
                        Click to view checklist details
                      </p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-primary transition-colors group-hover:translate-x-1 duration-300" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Pagination */}
        {filteredTopics.length !== 0 && (
          <div className="mt-10">
            <PaginationSection
              currentPage={filter.page}
              setCurrentPage={handlePageChange}
              postsPerPage={ITEM_PER_PAGE}
              totalPosts={checklistData?.count ?? 0}
            />
          </div>
        )}

        {isModalOpen && (
          <SuggestChecklistModal
            isOpen={isModalOpen}
            setIsOpen={setIsModalOpen}
          />
        )}
      </div>
    </div>
  );
};

export default EhsChecklistListingSection;
