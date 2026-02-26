'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Edit, ExternalLink, Plus, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { AppRoutes } from '@/constants/AppRoutes';
import { Button } from '@/components/ui/button';
import ConfirmDeleteNews from './ConfirmDeleteNews';
import { PaginationSection } from '@/components/PaginationSection';
import { getEhsNews } from '@/actions/admin/ehs/news';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { formattedDate } from '@/lib';
import Image from 'next/image';
import AddNewsModal from '@/components/modals/ehs/AddNewsModal';

const ITEM_PER_PAGE = 12;

const EhsNewsListingSection = () => {
  const [isAddNewsModalOpen, setIsAddNewsModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const {
    data: newsData,
    isLoading,
    error
  } = useQuery({
    queryKey: ['EhsNews', currentPage],
    queryFn: () => getEhsNews(currentPage, ITEM_PER_PAGE),
    placeholderData: keepPreviousData,
    refetchOnWindowFocus: false
  });

  const paginatedNews = newsData?.data || [];

  // Loading state
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
        <p className="text-lg text-gray-600">Loading EHS News...</p>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <div className="text-red-500 text-center">
          <h3 className="text-lg font-semibold">Error Loading News</h3>
          <p className="text-gray-600">Please try again later</p>
        </div>
        <Button onClick={() => window.location.reload()} variant="outline">
          Retry
        </Button>
      </div>
    );
  }

  // No data state
  if (!paginatedNews.length) {
    return (
      <>
        <div className="flex justify-end my-5">
          <Button onClick={() => setIsAddNewsModalOpen(true)}>
            <Plus className="w-5 h-5" />
            Add New EHS News
          </Button>
        </div>

        <AddNewsModal
          isOpen={isAddNewsModalOpen}
          setIsOpen={setIsAddNewsModalOpen}
        />

        <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
          <div className="text-center">
            <h3 className="text-lg font-semibold">No News Available</h3>
            <p className="text-gray-600 mt-2">
              There are currently no EHS news items to display.
            </p>
          </div>
          <Button onClick={() => setIsAddNewsModalOpen(true)} variant="outline">
            Create First News Item
          </Button>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="flex justify-end my-5">
        <Button onClick={() => setIsAddNewsModalOpen(true)}>
          <Plus className="w-5 h-5" />
          Add New EHS News
        </Button>
      </div>

      <AddNewsModal
        isOpen={isAddNewsModalOpen}
        setIsOpen={setIsAddNewsModalOpen}
      />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {paginatedNews.map(news => (
          <Card
            key={news.id}
            className="overflow-hidden hover:shadow-lg transition-shadow"
          >
            <CardHeader className="p-0">
              <div className="h-48 w-full">
                <Image
                  width={1024}
                  height={768}
                  src={news.image_url ?? ''}
                  alt={news.title ?? ''}
                  className="w-full h-full object-cover"
                />
              </div>
            </CardHeader>

            <CardContent className="p-4 space-y-4">
              <div className="flex justify-between items-start gap-2">
                <h3 className="text-lg font-semibold line-clamp-2">
                  {news.title}
                </h3>
                <div className="flex gap-2 flex-shrink-0">
                  <ConfirmDeleteNews id={news.id} isFromListing={true} />

                  <Link
                    href={AppRoutes.ADMIN_EHS_NEWS_SAVE(news.id)}
                    className="text-primary transition-colors"
                  >
                    <Edit className="w-5 h-5" />
                  </Link>
                  {news.preview_url && (
                    <a
                      href={news.preview_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary flex-shrink-0"
                    >
                      <ExternalLink className="w-5 h-5" />
                    </a>
                  )}
                </div>
              </div>

              <p className="text-gray-600 line-clamp-3">{news.description}</p>

              <div className="text-sm text-gray-500">
                {news.created_at && formattedDate(news.created_at)}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="pt-10 pb-2">
        <PaginationSection
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          postsPerPage={ITEM_PER_PAGE}
          totalPosts={newsData?.count || 0}
        />
      </div>
    </>
  );
};

export default EhsNewsListingSection;
