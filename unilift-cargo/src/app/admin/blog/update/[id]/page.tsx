import React, { Suspense } from 'react';
import AdminTopbarLayout from '@/layouts/AdminTopbarLayout';
import { notFound } from 'next/navigation';
import { AppRoutes } from '@/constants/AppRoutes';
import Spinner from '@/components/loaders/Spinner';
import { getBlogDetailsById } from '@/actions/admin/blog';
import BlogAddUpdateSection from '@/sections/admin/blogs/BlogAddUpdateSection';

const BREADCRUMBS = [
  { label: 'Dashboard', route: `${AppRoutes.ADMIN_DASHBOARD}` },
  {
    label: 'Blogs',
    route: AppRoutes.ADMIN_BLOG
  },
  {
    label: 'Update',
    route: AppRoutes.ADMIN_UPDATE_BLOG(0)
  }
] as const;

const AdminUpdateBlogPage = ({
  params
}: {
  params: {
    id: number;
  };
}) => {
  const blogId = params.id;

  return (
    <AdminTopbarLayout title="Ehs Toolbox Talk" breadcrumbOptions={BREADCRUMBS}>
      <Suspense
        fallback={
          <div className="flex justify-center items-center w-full h-[50vh]">
            <Spinner />
          </div>
        }
      >
        <BlogUpdateSection blogId={blogId} />
      </Suspense>
    </AdminTopbarLayout>
  );
};
export default AdminUpdateBlogPage;

const BlogUpdateSection = async ({ blogId }: { blogId: number }) => {
  const { data: blogDetails } = await getBlogDetailsById(blogId);

  if (!blogDetails) {
    notFound();
  }
  return <BlogAddUpdateSection blogDetails={blogDetails} />;
};
