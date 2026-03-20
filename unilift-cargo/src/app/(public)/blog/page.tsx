import React, { Suspense } from 'react';
import ASSETS from '@/assets';
import PageBanner from '@/components/PageBanner';
import { AppRoutes } from '@/constants/AppRoutes';
import Spinner from '@/components/loaders/Spinner';
import { Metadata } from 'next';
import { BlogListingSection } from '@/sections/blog/BlogListingSection';

export const metadata: Metadata = {
  title: 'Blogs | Safezy',
  description:
    'Discover informative and engaging blogs to stay updated on workplace safety, health, and industry insights.'
};

const BREADCRUMBS = [
  { label: 'HOME', route: AppRoutes.HOME },
  { label: 'BLOGS', route: AppRoutes.BLOG }
] as const;

const BlogPage = () => {
  return (
    <div className="relative bg-gray-50 ">
      <PageBanner
        image={ASSETS.IMG.BLOGS_BANNER}
        pageHeading="BLOGS"
        breadcrumbs={BREADCRUMBS}
      />
      <Suspense
        fallback={
          <div className="flex justify-center items-center w-full h-[50vh]">
            <Spinner />
          </div>
        }
      >
        <BlogListingSection />
      </Suspense>
    </div>
  );
};

export default BlogPage;
