import AdminTopbarLayout from '@/layouts/AdminTopbarLayout';
import ContractorDetailsSection from '@/sections/admin/contractors/ContractorDetailsSection';
import { AppRoutes } from '@/constants/AppRoutes';
import { SearchParamsType } from '@/types/index.types';
import Spinner from '@/components/loaders/Spinner';
import { Suspense } from 'react';

const BREADCRUMBS = [
  { label: 'Dashboard', route: AppRoutes.ADMIN_DASHBOARD },
  {
    label: 'Customers',
    route: AppRoutes.ADMIN_CONTRACTOR_LISTING
  },
  {
    label: 'Customer Details',
    route: '#'
  }
] as const;

type AdminContractorDetailsPagePropsType = SearchParamsType & {
  params: {
    id: string;
  };
};

// Define the AdminContractorDetailsPage component
const AdminContractorDetailsPage = ({
  params,
  searchParams
}: AdminContractorDetailsPagePropsType) => {
  return (
    <AdminTopbarLayout title="Customers" breadcrumbOptions={BREADCRUMBS}>
      <Suspense
        fallback={
          <div className="flex justify-center items-center w-full h-[50vh]">
            <Spinner />
          </div>
        }
      >
        <ContractorDetailsSection
          contractorId={params.id}
          searchParams={searchParams}
        />
      </Suspense>
    </AdminTopbarLayout>
  );
};

export default AdminContractorDetailsPage;
