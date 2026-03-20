'use client';

import { useCallback, useState } from 'react';
import ASSETS from '@/assets';
import { Input } from '@/components/ui/input';
import { AppRoutes } from '@/constants/AppRoutes';
import { useQuery } from '@tanstack/react-query';
import debounce from 'lodash.debounce';
import { Card, CardContent } from '@/components/ui/card';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { ChevronRight, Search, X } from 'lucide-react';
import { PaginationSection } from '@/components/PaginationSection';
import { EmptyState } from '@/components/EmptyState';
import BlogListingSkeleton from '@/skeleton/BlogListingSkeleton';
import { getAllBlogDetails } from '@/actions/admin/blog';
import BlogSubscribeModal from '@/components/modals/BlogSubscribeModal';

const DEBOUNCE_DELAY = 400;
const ITEMS_PER_PAGE = 12;

export type BlogFilterType = {
  search: string;
  page: number;
};

export const DEFAULT_FILTER = {
  search: '',
  page: 1
} as const;

export const BlogListingSection = () => {
  const router = useRouter();
  const [filter, setFilter] = useState<BlogFilterType>(DEFAULT_FILTER);

  const {
    data: blogs,
    isLoading,
    isRefetching,
    refetch
  } = useQuery({
    queryKey: ['blogs'],
    queryFn: async () =>
      await getAllBlogDetails(
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

  const filteredBlogs = blogs?.data || [];

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
    router.push(AppRoutes.BLOG_DETAILS(id));
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
        {/* Search */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div className="flex gap-2">
            <BlogSubscribeModal />
          </div>
          <div className="relative w-full md:w-72">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              type="text"
              placeholder="Search blogs..."
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

        {(isLoading || isRefetching) && <BlogListingSkeleton />}

        {!isLoading && !isRefetching && filteredBlogs.length === 0 && (
          <EmptyState searchQuery={filter.search} contentType="Blogs" />
        )}

        {!isLoading && !isRefetching && filteredBlogs.length !== 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredBlogs.map(blog => (
              <Card
                key={blog.id}
                className="group cursor-pointer hover:shadow-lg transition-all duration-300 hover:-translate-y-1 z-20 border border-primary"
                onClick={() => handleCardClick(blog.id)}
              >
                <CardContent className="p-6">
                  <div className="flex justify-between items-center">
                    <div className="space-y-2 flex-1 min-w-0">
                      <h3 className="text-xl font-semibold text-gray-800 group-hover:text-primary transition-colors">
                        {blog.title}
                      </h3>

                      <p className="text-sm text-gray-600">
                        Click to view blogs
                      </p>
                    </div>
                    <div className="flex-shrink-0 ml-3">
                      <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-primary transition-all duration-300 group-hover:translate-x-1" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {filteredBlogs.length > 0 && (
          <div className="mt-10">
            <PaginationSection
              currentPage={filter.page}
              setCurrentPage={handlePageChange}
              postsPerPage={ITEMS_PER_PAGE}
              totalPosts={blogs?.count ?? 0}
            />
          </div>
        )}
      </div>
    </div>
  );
};
