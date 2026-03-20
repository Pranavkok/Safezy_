import AdminTopbarLayout from '@/layouts/AdminTopbarLayout';
import EhsNewsSaveSection from '@/sections/admin/ehs/ehs-news/EhsNewsSaveSection';
import { AppRoutes } from '@/constants/AppRoutes';
import Spinner from '@/components/loaders/Spinner';
import { Suspense } from 'react';

const BREADCRUMBS = [
  { label: 'Dashboard', route: AppRoutes.ADMIN_DASHBOARD },
  {
    label: 'News Feed',
    route: AppRoutes.ADMIN_EHS_NEWS_LISTING
  },
  {
    label: 'Details',
    route: AppRoutes.ADMIN_EHS_NEWS_SAVE(0)
  }
] as const;

const AdminEhsNewsUpdatePage = ({ params }: { params: { id: number } }) => {
  return (
    <AdminTopbarLayout title="EHS News Feed" breadcrumbOptions={BREADCRUMBS}>
      <Suspense
        fallback={
          <div className="flex justify-center items-center w-full h-[50vh]">
            <Spinner />
          </div>
        }
      >
        <EhsNewsSaveSection ehsNewsId={params.id} />
      </Suspense>
    </AdminTopbarLayout>
  );
};

export default AdminEhsNewsUpdatePage;
