import React, { Suspense } from 'react';
import Spinner from '@/components/loaders/Spinner';
import { SearchParamsType } from '@/types/index.types';
import { getAllBlogDetails } from '@/actions/admin/blog';
import { BlogsListingTable } from './blogs-listing-table.tsx/BlogsListingTable';

const BlogsListingSection = async ({ searchParams }: SearchParamsType) => {
  const searchQuery = searchParams.title;
  const page = parseInt(searchParams.page ?? '1');
  const pageSize = parseInt(searchParams.per_page ?? '10');

  const blogs = await getAllBlogDetails(searchQuery as string, page, pageSize);

  return (
    <Suspense
      fallback={
        <Spinner className="absolute inset-0 w-full h-full grid place-content-center" />
      }
    >
      <BlogsListingTable blogs={blogs} />
    </Suspense>
  );
};

export default BlogsListingSection;
