'use client';

import React, { useState } from 'react';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import CustomRating from '@/components/CustomRating';
import { getProductReviews } from '@/actions/contractor/rating';
import { formattedDate } from '@/lib';
import { PaginationSection } from '@/components/PaginationSection';
import Spinner from '@/components/loaders/Spinner';

const REVIEWS_PER_PAGE = 5;

const ProductReviewSection = ({
  productId,
  averageRating
}: {
  productId: string;
  averageRating: number;
}) => {
  const [currentPage, setCurrentPage] = useState(1);

  const { data: reviewsData, isLoading } = useQuery({
    queryKey: ['productReviews', productId, currentPage],
    queryFn: () => getProductReviews(productId, currentPage, REVIEWS_PER_PAGE),
    placeholderData: keepPreviousData,
    refetchOnWindowFocus: false
  });

  const paginatedReviews = reviewsData?.data || [];

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 mb-5">
        <h2 className="text-lg sm:text-xl font-bold text-gray-800">
          Customer Reviews
        </h2>
        <div className="text-center text-gray-500 py-8">
          <Spinner />
        </div>
      </div>
    );
  }

  if (paginatedReviews.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 mb-5">
        <h2 className="text-lg sm:text-xl font-bold mb-4 text-gray-800">
          Customer Reviews
        </h2>
        <p className="text-center text-gray-500 py-8">No reviews yet</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md mb-5 ">
      <div className="p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center sm:gap-3 mb-6">
          <h2 className="text-lg sm:text-xl font-bold text-gray-800 ">
            Customer Reviews
          </h2>
          {averageRating && (
            <div className="flex items-center ">
              <CustomRating
                initialRating={Math.round(averageRating)}
                readonly={true}
                size={24}
              />
              <span className="ml-2 text-sm sm:text-base text-gray-600">
                ({averageRating} / 5)
              </span>
            </div>
          )}
        </div>

        <div className="space-y-6">
          {paginatedReviews.map(review => (
            <div key={review.id} className="border-b last:border-b-0 pb-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="bg-primary w-8 h-8 rounded-full text-sm flex justify-center items-center text-white shrink-0">
                  {review.firstName[0]}
                  {review.lastName[0]}
                </div>
                <div className="min-w-0">
                  <p className="font-medium text-sm sm:text-base truncate">
                    {review.firstName} {review.lastName}
                  </p>
                  <p className="text-xs sm:text-sm text-gray-500">
                    {formattedDate(review.reviewDate)}
                  </p>
                </div>
              </div>

              <div>
                <div className="flex items-center mb-2">
                  <CustomRating
                    initialRating={review.rating}
                    readonly={true}
                    size={20}
                  />
                </div>
                <div className="text-sm sm:text-base text-gray-600 space-y-2">
                  <p className="break-words">{review.reviewText}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {reviewsData?.count && reviewsData?.count > REVIEWS_PER_PAGE && (
          <div className="mt-6">
            <PaginationSection
              currentPage={currentPage}
              totalPosts={reviewsData?.count || 0}
              setCurrentPage={setCurrentPage}
              postsPerPage={REVIEWS_PER_PAGE}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductReviewSection;
