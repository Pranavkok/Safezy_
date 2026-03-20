import Spinner from '@/components/loaders/Spinner';
import { AppRoutes } from '@/constants/AppRoutes';
import AdminTopbarLayout from '@/layouts/AdminTopbarLayout';
import BlogsListingSection from '@/sections/admin/blogs/BlogsListingSection';
import { SearchParamsType } from '@/types/index.types';
import { Suspense } from 'react';

const BREADCRUMBS = [
  {
    label: 'Dashboard',
    route: AppRoutes.ADMIN_DASHBOARD
  },
  {
    label: 'blogs',
    route: AppRoutes.ADMIN_BLOG
  }
];
const AadminBlogsListingPage = ({ searchParams }: SearchParamsType) => {
  return (
    <AdminTopbarLayout title="Blogs" breadcrumbOptions={BREADCRUMBS}>
      <Suspense
        fallback={
          <div className="flex justify-center items-center w-full h-[50vh]">
            <Spinner />
          </div>
        }
      >
        <BlogsListingSection searchParams={searchParams} />
      </Suspense>
    </AdminTopbarLayout>
  );
};

export default AadminBlogsListingPage;
