import { Skeleton } from '@/components/ui/skeleton';
import { Capacitor } from '@capacitor/core';
import React from 'react';

const ProductItemSkeleton = () => {
  return (
    <div
      className={`relative bg-white rounded-lg overflow-hidden shadow-lg p-4  ${Capacitor.getPlatform() !== 'web' && 'min-w-full'}`}
    >
      {/* Image Skeleton */}
      <Skeleton className="w-full h-40 sm:h-56 xl:h-52 2xl:h-56 rounded" />

      {/* Content Skeleton */}
      <div className="mt-4 space-y-2">
        {/* Title and Category Skeleton */}
        <div className="space-y-2">
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>

        <div className="flex flex-col xs:flex-row xs:justify-between xs:items-end gap-4 mt-4">
          <div className="space-y-2">
            {/* Color Options Skeleton */}
            <div className="flex gap-2">
              {Array(4)
                .fill(null)
                .map((_, i) => (
                  <Skeleton key={i} className="w-4 h-4 rounded-full" />
                ))}
            </div>

            {/* Price Skeleton */}
            <Skeleton className="h-8 w-24" />

            {/* Rating Skeleton */}
            <Skeleton className="h-4 w-32" />
          </div>

          {/* Button Skeleton */}
          <Skeleton className="h-9 w-24" />
        </div>
      </div>
    </div>
  );
};

export default ProductItemSkeleton;
