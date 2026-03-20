'use client';
// React and core dependencies
import React, { useCallback, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';

// Types

// API actions
import { fetchProductsByUserLocation } from '@/actions/contractor/product';

// Components
import { PaginationSection } from '@/components/PaginationSection';

import ProductItemSkeleton from '@/skeleton/ProductItemSkeleton';
import ProductItemSection from '../products/product-listing/ProductItemSection';

// Constants
const ITEMS_PER_PAGE = 12;

const RecommendationProductListing = () => {
  const [filter, setFilter] = useState({ page: 1 });

  const { data, isLoading, isRefetching } = useQuery({
    queryKey: ['recommendationProducts', filter],
    queryFn: () =>
      fetchProductsByUserLocation({
        page: filter.page,
        pageSize: ITEMS_PER_PAGE
      })
  });

  // Memoized skeleton loader component
  const renderSkeletons = useMemo(
    () => (
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 3xl:grid-cols-4 gap-5 py-5">
        {Array.from({ length: ITEMS_PER_PAGE }).map((_, index) => (
          <ProductItemSkeleton key={index} />
        ))}
      </div>
    ),
    []
  );

  // Memoized product grid component
  const renderProducts = useMemo(
    () => (
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 3xl:grid-cols-4 gap-5 py-5">
        {data?.data?.map(product => (
          <ProductItemSection key={product.id} product={product} />
        ))}
      </div>
    ),
    [data?.data]
  );
  const handlePageChange = useCallback((val: number) => {
    setFilter(prev => ({ ...prev, page: val }));
  }, []);

  if (isLoading || isRefetching) return renderSkeletons;

  return (
    <div>
      {data?.data && data.data.length > 0 ? (
        <>
          {renderProducts}
          <div className="my-10">
            <PaginationSection
              currentPage={filter.page}
              postsPerPage={ITEMS_PER_PAGE}
              setCurrentPage={handlePageChange}
              totalPosts={data?.count ?? 0}
            />
          </div>
        </>
      ) : (
        <div className="flex flex-col items-center justify-center h-80 ">
          <h2 className="text-xl font-bold text-gray-700 mb-3">
            No Products Found
          </h2>
          <p className="text-center text-gray-600 mb-6 max-w-md">
            Sorry, we couldn’t find any products matching your criteria. You may
            want to adjust your filters or try a different search term.
          </p>
        </div>
      )}
    </div>
  );
};

export default RecommendationProductListing;
