import Spinner from '@/components/loaders/Spinner';
import { AppRoutes } from '@/constants/AppRoutes';
import ContractorTopbarLayout from '@/layouts/ContractorTopbarLayout';
import WorkSitesListingSection from '@/sections/contractor/worksites/WorkSitesListingSection';
import { SearchParamsType } from '@/types/index.types';
import { Suspense } from 'react';

const BREADCRUMBS = [
  { label: 'Dashboard', route: AppRoutes.CONTRACTOR_DASHBOARD },
  {
    label: 'Worksites',
    route: AppRoutes.CONTRACTOR_WORKSITE_LISTING
  }
] as const;

const ContractorWorksitesPage = ({ searchParams }: SearchParamsType) => {
  return (
    <ContractorTopbarLayout title="Worksites" breadcrumbOptions={BREADCRUMBS}>
      <Suspense
        fallback={
          <div className="flex justify-center items-center w-full h-[50vh]">
            <Spinner />
          </div>
        }
      >
        <WorkSitesListingSection searchParams={searchParams} />
      </Suspense>
    </ContractorTopbarLayout>
  );
};

export default ContractorWorksitesPage;
