import React, { Suspense } from 'react';
import ASSETS from '@/assets';
import Spinner from '@/components/loaders/Spinner';
import PageBanner from '@/components/PageBanner';
import { AppRoutes } from '@/constants/AppRoutes';
import { Metadata } from 'next';
import { fetchBlogMetadataById } from '@/actions/metadata';
import BlogSection from '@/sections/blog/blog-details';

const BREADCRUMBS = [
  { label: 'HOME', route: AppRoutes.HOME },
  { label: 'BLOGS', route: AppRoutes.BLOG },
  { label: 'DETAILS', route: AppRoutes.BLOG_DETAILS(0) }
] as const;

export async function generateMetadata({
  params
}: {
  params: { id: number };
}): Promise<Metadata> {
  return await fetchBlogMetadataById(params.id);
}

const BlogDetailsPage = ({
  params
}: {
  params: {
    id: number;
  };
}) => {
  const blogId = params.id;

  return (
    <div className="bg-gray-50 relative flex-col items-center gap-4 justify-center">
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
        <BlogSection blogId={blogId} />
      </Suspense>
    </div>
  );
};

export default BlogDetailsPage;
