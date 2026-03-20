import React from 'react';
import AdminTopbarLayout from '@/layouts/AdminTopbarLayout';
import { AppRoutes } from '@/constants/AppRoutes';
import dynamic from 'next/dynamic';
const BlogAddUpdateSection = dynamic(
  () => import('@/sections/admin/blogs/BlogAddUpdateSection'),
  {
    ssr: false
  }
);

const BREADCRUMBS = [
  { label: 'Dashboard', route: `${AppRoutes.ADMIN_DASHBOARD}` },
  {
    label: 'Blogs',
    route: AppRoutes.ADMIN_BLOG
  },
  {
    label: 'Add',
    route: AppRoutes.ADMIN_ADD_BLOG
  }
] as const;

const AdminAddBlogPage = () => {
  return (
    <AdminTopbarLayout title="BLOGS" breadcrumbOptions={BREADCRUMBS}>
      <BlogAddUpdateSection />
    </AdminTopbarLayout>
  );
};

export default AdminAddBlogPage;
