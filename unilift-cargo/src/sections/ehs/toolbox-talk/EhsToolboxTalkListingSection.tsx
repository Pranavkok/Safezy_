'use client';

import { useCallback, useState } from 'react';
import ASSETS from '@/assets';
import { Input } from '@/components/ui/input';
import { AppRoutes } from '@/constants/AppRoutes';
import { useQuery } from '@tanstack/react-query';
import { getAllToolboxTalkDetails } from '@/actions/admin/ehs/toolbox-talk';
import debounce from 'lodash.debounce';
import { Card, CardContent } from '@/components/ui/card';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { ChevronRight, Search, X } from 'lucide-react';
import { PaginationSection } from '@/components/PaginationSection';
import { useUser } from '@/context/UserContext';
import toast from 'react-hot-toast';
import CustomRating from '@/components/CustomRating';
import EhsListingSkeleton from '@/skeleton/EhsListingSkeleton';
import { EmptyState } from '@/components/EmptyState';
import EHSToolboxModal from '@/components/modals/ehs/EHSToolboxTalksModal';
import SuggestToolboxTalkModal from '@/components/modals/ehs/SuggestToolboxTalkModal';

const DEBOUNCE_DELAY = 400;
const ITEMS_PER_PAGE = 12;

export const BREADCRUMBS = [
  { label: 'HOME', route: AppRoutes.HOME },
  { label: 'TOOLBOX TALKS', route: AppRoutes.EHS_TOOLBOX_TALK }
] as const;

export type ToolboxFilterType = {
  search: string;
  page: number;
};

export const DEFAULT_FILTER = {
  search: '',
  page: 1
} as const;

export const EHSToolboxTalkListingSection = () => {
  const router = useRouter();
  const user = useUser();
  const [filter, setFilter] = useState<ToolboxFilterType>(DEFAULT_FILTER);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const {
    data: toolboxTalks,
    isLoading,
    isRefetching,
    refetch
  } = useQuery({
    queryKey: ['toolbox-talks'],
    queryFn: async () =>
      await getAllToolboxTalkDetails(
        filter.search || '',
        filter.page || 1,
        ITEMS_PER_PAGE
      ),
    refetchOnWindowFocus: false
  });

  const _debouncedSubmit = useCallback(
    debounce(() => refetch(), DEBOUNCE_DELAY),
    [refetch]
  );

  const filteredTopics = toolboxTalks?.data || [];

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
      toast.error('Please Login or Signup to access this toolbox talks');
      return;
    }
    router.push(AppRoutes.EHS_TOOLBOX_TALK_DETAILS(id));
  };

  const handleSuggestionClick = () => {
    if (!user.userId) {
      toast.dismiss();
      toast.error('Please Login or Signup to suggest any toolbox talks');
      return;
    }
    setIsModalOpen(true);
  };

  return (
    <div className="relative overflow-hidden ">
      <div className="w-full h-full pointer-events-none ">
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
        <div className="absolute right-0 bottom-0 translate-x-1/2">
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

            <EHSToolboxModal />
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
          <EmptyState searchQuery={filter.search} contentType="Toolbox talks" />
        )}

        {!isLoading && !isRefetching && filteredTopics.length !== 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTopics.map(topic => (
              <Card
                key={topic.id}
                className="group cursor-pointer hover:shadow-lg transition-all duration-300 hover:-translate-y-1 z-20 border border-primary"
                onClick={() => handleCardClick(topic.id)}
              >
                <CardContent className="p-6">
                  <div className="flex justify-between items-center">
                    <div className="space-y-2">
                      <h3 className="text-xl font-semibold text-gray-800 group-hover:text-primary transition-colors">
                        {topic.topic_name}
                      </h3>

                      <p className="text-sm text-gray-600">
                        Click to view toolbox talks
                      </p>
                      <div className="flex items-center space-x-2 ">
                        <CustomRating
                          initialRating={topic.avg_rating ?? 0}
                          readonly={true}
                          size={14}
                        />
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-primary transition-colors group-hover:translate-x-1 duration-300" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {filteredTopics.length > 0 && (
          <div className="mt-10">
            <PaginationSection
              currentPage={filter.page}
              setCurrentPage={handlePageChange}
              postsPerPage={ITEMS_PER_PAGE}
              totalPosts={toolboxTalks?.count ?? 0}
            />
          </div>
        )}

        {isModalOpen && (
          <SuggestToolboxTalkModal
            isOpen={isModalOpen}
            setIsOpen={setIsModalOpen}
          />
        )}
      </div>
    </div>
  );
};
