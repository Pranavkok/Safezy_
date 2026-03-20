'use client';

import { useCallback, useState } from 'react';
import ASSETS from '@/assets';
import { AppRoutes } from '@/constants/AppRoutes';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { ChevronRight, Search, X } from 'lucide-react';
import { PaginationSection } from '@/components/PaginationSection';
import { getAllFirstPrinciples } from '@/actions/admin/ehs/first-principles';
import { useUser } from '@/context/UserContext';
import toast from 'react-hot-toast';
import { Input } from '@/components/ui/input';
import debounce from 'lodash.debounce';
import EhsListingSkeleton from '@/skeleton/EhsListingSkeleton';
import { EmptyState } from '@/components/EmptyState';
import EHSFirstPrinciplesModal from '@/components/modals/ehs/EHSFirstPrincipleModal';
import SuggestFirstPrincipleModal from '@/components/modals/ehs/SuggestFirstPrincipleModal';

const ITEMS_PER_PAGE = 12;
const DEBOUNCE_DELAY = 400;

export const BREADCRUMBS = [
  { label: 'HOME', route: AppRoutes.HOME },
  { label: 'FIRST PRINCIPLES', route: AppRoutes.EHS_FIRST_PRINCIPLES }
] as const;

export type PrincipleFilterType = {
  search: string;
};

const DEFAULT_FILTER: PrincipleFilterType = {
  search: ''
} as const;

export const EHSFirstPrinciplesListingSection = () => {
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState(1);
  const [filter, setFilter] = useState<PrincipleFilterType>(DEFAULT_FILTER);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data, isLoading, isRefetching, refetch } = useQuery({
    queryKey: ['firstPrinciples', currentPage],
    queryFn: () =>
      getAllFirstPrinciples(filter.search, currentPage, ITEMS_PER_PAGE),
    refetchOnWindowFocus: false
  });

  const filteredTopics = data?.data || [];
  const user = useUser();

  const _debouncedSubmit = useCallback(
    debounce(() => refetch(), DEBOUNCE_DELAY),
    [refetch]
  );

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const searchValue = e.target.value;
    setFilter(prev => ({
      ...prev,
      search: searchValue
    }));

    _debouncedSubmit();
  };

  const handleCardClick = (id: number) => {
    if (!user.userId) {
      toast.dismiss();
      toast.error('Please Login or Signup to access this first principle');
      return;
    }
    router.push(AppRoutes.EHS_FIRST_PRINCIPLES_DETAILS(id));
  };

  const handleSuggestionClick = () => {
    if (!user.userId) {
      toast.dismiss();

      toast.error('Please Login or Signup to suggest any first principle');
      return;
    }
    setIsModalOpen(true);
  };

  return (
    <div className="relative overflow-hidden">
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
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div className="flex gap-2">
            <button
              className="bg-primary py-2 px-4 rounded-sm text-white font-bold text-sm sm:text-base uppercase cursor-pointer"
              onClick={handleSuggestionClick}
            >
              Have a Principle? Share with us!
            </button>

            <EHSFirstPrinciplesModal />
          </div>

          <div className="relative w-full md:w-72">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              type="text"
              placeholder="Search titles..."
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
          <EmptyState
            searchQuery={filter.search}
            contentType="First Principle"
          />
        )}
        {!isLoading && !isRefetching && filteredTopics.length !== 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTopics.map(principle => (
              <Card
                key={principle.id}
                className="group cursor-pointer hover:shadow-lg transition-all duration-300 hover:-translate-y-1 z-20 border-primary"
                onClick={() => handleCardClick(principle.id)}
              >
                <CardContent className="p-6">
                  <div className="flex justify-between items-center">
                    <div className="space-y-2 flex-[0.75]">
                      <div className="text-xl font-semibold text-gray-800 group-hover:text-primary transition-colors line-clamp-2">
                        {principle.title}
                      </div>
                      <p className="text-sm text-gray-600">
                        Click to view principle
                      </p>
                    </div>
                    <div className="flex flex-[0.25] justify-center">
                      <ChevronRight className="w-100 h-5 text-black group-hover:text-primary transition-colors group-hover:translate-x-1 duration-300" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {filteredTopics.length > 0 && (
          <div className="mt-10">
            <PaginationSection
              currentPage={currentPage}
              setCurrentPage={setCurrentPage}
              postsPerPage={ITEMS_PER_PAGE}
              totalPosts={data?.count ?? 0}
            />
          </div>
        )}

        {isModalOpen && (
          <SuggestFirstPrincipleModal
            isOpen={isModalOpen}
            setIsOpen={setIsModalOpen}
          />
        )}
      </div>
    </div>
  );
};
