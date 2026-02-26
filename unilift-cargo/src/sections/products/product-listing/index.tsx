'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import debounce from 'lodash.debounce';
import { ProductFilterType } from '@/validations/product/product-filter';
import { fetchProducts } from '@/actions/contractor/product';
import NavigationBreadcrumbs from '@/components/NavigationBreadcrumbs';
import { PaginationSection } from '@/components/PaginationSection';
import ProductItemSection from './ProductItemSection';
import ProductFilterSection from './ProductFilterSection';
import ProductSearchingSortingSection from './ProductSearchingSortingSection';
import ProductItemSkeleton from '@/skeleton/ProductItemSkeleton';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowRight, ChevronLeft } from 'lucide-react';
import { Capacitor } from '@capacitor/core';
import { Button } from '@/components/ui/button';
import { AppRoutes } from '@/constants/AppRoutes';

export const DEFAULT_CUSTOM_PRICE: [number, number] = [1, 100000];
const ITEMS_PER_PAGE = 12;
const DEBOUNCE_DELAY = 400;

export const DEFAULT_FILTER: ProductFilterType = {
  category: ['all'],
  price: { range: DEFAULT_CUSTOM_PRICE },
  geographical: [''],
  brand: '',
  color: '',
  page: 1,
  rating: 0,
  search: '',
  subCategory: [],
  sort: 'featured'
} as const;

const VALID_CATEGORIES = [
  'all',
  'head_protection',
  'respiratory_protection',
  'face_protection',
  'eye_protection',
  'hand_protection',
  'leg_protection',
  'fall_protection',
  'body_protection',
  'ear_protection'
] as const;

type ValidCategoryType = (typeof VALID_CATEGORIES)[number];

const ProductListing = ({
  category,
  isFromHome = false
}: {
  category: string;
  isFromHome?: boolean;
}) => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const fromPage = searchParams.get('page');
  const initialPage = fromPage ? parseInt(fromPage) : 1;

  const validatedCategory: ValidCategoryType = VALID_CATEGORIES.includes(
    category as ValidCategoryType
  )
    ? (category as ValidCategoryType)
    : 'all';

  const [filter, setFilter] = useState<ProductFilterType>({
    ...DEFAULT_FILTER,
    category: [validatedCategory],
    page: initialPage
  });

  useEffect(() => {
    if (category && validatedCategory === 'all' && category !== 'all') {
      router.replace('/products?category=all');
      return;
    }
    if (filter.category[0] !== validatedCategory) {
      setFilter(prev => ({ ...prev, category: [validatedCategory] }));
      _debouncedSubmit();
    }
  }, [category, validatedCategory, router]);

  useEffect(() => {
    if (initialPage) {
      setFilter(prev => ({ ...prev, page: initialPage }));
      _debouncedSubmit();
    }
  }, [initialPage]);

  const {
    data: products,
    isLoading,
    isRefetching,
    refetch
  } = useQuery({
    queryKey: ['products'],
    queryFn: () =>
      fetchProducts({
        filters: {
          color: filter.color,
          maxPrice: filter.price.range[1],
          minPrice: filter.price.range[0],
          ppeCategory: filter.category,
          rating: filter.rating,
          geographicalLocation: filter.geographical,
          brand: filter.brand,
          subcategory: filter.subCategory
        },
        page: filter.page,
        pageSize: ITEMS_PER_PAGE,
        searchQuery: filter.search,
        sortBy: filter.sort
      }),
    refetchOnWindowFocus: false
  });

  const filterProducts = products?.data || [];

  const _debouncedSubmit = useCallback(
    debounce(() => refetch(), DEBOUNCE_DELAY),
    [refetch]
  );
  const renderSkeletons = useMemo(
    () => (
      <div
        className={
          Capacitor.isNativePlatform() && isFromHome
            ? 'flex w-[100%] overflow-x-auto pt-4 gap-2'
            : 'grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 3xl:grid-cols-4 gap-5 py-5'
        }
      >
        {Array.from({ length: ITEMS_PER_PAGE }).map((_, index) => (
          <ProductItemSkeleton key={index} />
        ))}
      </div>
    ),
    [isFromHome]
  );

  const renderProducts = useMemo(
    () => (
      <div
        className={
          Capacitor.isNativePlatform() && isFromHome
            ? 'flex w-[100%] overflow-x-auto pt-4 gap-2'
            : 'grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 3xl:grid-cols-4 gap-5 py-5'
        }
      >
        {filterProducts.map(product => (
          <ProductItemSection key={product.id} product={product} />
        ))}
      </div>
    ),
    [filterProducts, isFromHome, filter.page]
  );

  const handlePageChange = useCallback(
    (val: number) => {
      setFilter(prev => ({ ...prev, page: val }));
      const url = new URL(window.location.href);
      url.searchParams.set('page', val.toString());
      window.history.pushState({}, '', url);
      _debouncedSubmit();
    },
    [_debouncedSubmit]
  );

  return (
    <div
      className={
        Capacitor.isNativePlatform() ? 'w-full p-2' : 'w-[90vw] m-auto'
      }
    >
      {!Capacitor.isNativePlatform() && !isFromHome && (
        <div className="flex gap-1  my-5 h-14 lg:h-16 rounded items-center">
          <button
            className="h-full w-[4.25rem] aspect-square bg-white flex justify-center items-center hover:bg-slate-50 cursor-pointer"
            onClick={() => {
              router.push(AppRoutes.HOME);
            }}
          >
            <ChevronLeft />
          </button>
          <div className=" bg-white flex h-full w-full  flex-col justify-center px-4">
            <h1 className="font-bold uppercase text-sm lg:text-xl">Products</h1>
            <NavigationBreadcrumbs
              breadcrumbOptions={[
                { label: 'Home', route: AppRoutes.HOME },
                { label: 'Products', route: AppRoutes.PRODUCT_LISTING }
              ]}
            />
          </div>
        </div>
      )}
      <div className="flex gap-5">
        <div className="w-96 hidden lg:block mb-5">
          <div className="bg-white shadow-lg rounded-lg sticky top-20">
            <ProductFilterSection
              filter={filter}
              setFilter={setFilter}
              _debouncedSubmit={_debouncedSubmit}
            />
          </div>
        </div>

        <div className={`flex-col w-full`}>
          {!isFromHome && (
            <ProductSearchingSortingSection
              filter={filter}
              setFilter={setFilter}
              _debouncedSubmit={_debouncedSubmit}
            />
          )}
          <div>
            {(isLoading || isRefetching) && renderSkeletons}

            {!isLoading && !isRefetching && filterProducts.length === 0 && (
              <div className="flex flex-col items-center justify-center h-80 ">
                <h2 className="text-xl font-bold text-gray-700 mb-3">
                  No Products Found
                </h2>
                <p className="text-center text-gray-600 mb-6 max-w-md">
                  Sorry, we couldn’t find any products matching your criteria.
                  You may want to adjust your filters or try a different search
                  term.
                </p>
              </div>
            )}

            {!isLoading &&
              !isRefetching &&
              filterProducts.length !== 0 &&
              renderProducts}

            {filterProducts.length > 0 &&
              !isLoading &&
              (!isFromHome ? (
                <div className="my-10">
                  <PaginationSection
                    currentPage={filter.page}
                    postsPerPage={ITEMS_PER_PAGE}
                    setCurrentPage={handlePageChange}
                    totalPosts={products?.count ?? 0}
                  />
                </div>
              ) : (
                <div className="w-full flex  mt-4">
                  <Button
                    className="w-[210px] text-[#ff914d]  font-bold ml-auto hover:bg-[transparent]"
                    variant={'ghost'}
                    onClick={() => router.push(AppRoutes.PRODUCT_LISTING)}
                  >
                    {'View More Product'.toUpperCase()}{' '}
                    <ArrowRight className="font-bold " />
                  </Button>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductListing;
