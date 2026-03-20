import { Suspense } from 'react';
import AdminTopbarLayout from '@/layouts/AdminTopbarLayout';
import { AppRoutes } from '@/constants/AppRoutes';
import ContractorListingSection from '@/sections/admin/contractors/ContractorListingSection';
import { SearchParamsType } from '@/types/index.types';
import Spinner from '@/components/loaders/Spinner';

const BREADCRUMBS = [
  { label: 'Dashboard', route: AppRoutes.ADMIN_DASHBOARD },
  { label: 'Customers', route: AppRoutes.ADMIN_CONTRACTOR_LISTING }
] as const;

const AdminContractorsListingPage = ({ searchParams }: SearchParamsType) => {
  return (
    <AdminTopbarLayout title="Customers" breadcrumbOptions={BREADCRUMBS}>
      <Suspense
        fallback={
          <div className="flex justify-center items-center w-full h-[50vh]">
            <Spinner />
          </div>
        }
      >
        <ContractorListingSection searchParams={searchParams} />
      </Suspense>
    </AdminTopbarLayout>
  );
};

export default AdminContractorsListingPage;
