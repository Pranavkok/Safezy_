import Spinner from '@/components/loaders/Spinner';
import WorksiteSelect from '@/components/WorksiteSelect';
import { AppRoutes } from '@/constants/AppRoutes';
import ContractorTopbarLayout from '@/layouts/ContractorTopbarLayout';
import EquipmentsSection from '@/sections/contractor/equipments/EquipmentsSection';
import { SearchParamsType } from '@/types/index.types';
import { Suspense } from 'react';

const BREADCRUMBS = [
  { label: 'Dashboard', route: AppRoutes.CONTRACTOR_DASHBOARD },
  {
    label: 'Equipments',
    route: AppRoutes.CONTRACTOR_EQUIPMENT_LISTING
  }
] as const;

const ContractorEquipmentsPage = ({ searchParams }: SearchParamsType) => {
  return (
    <ContractorTopbarLayout title="Equipments" breadcrumbOptions={BREADCRUMBS}>
      <div className="flex justify-center items-center mb-4">
        <WorksiteSelect dynamicText="equipments" />
      </div>
      <Suspense
        key={searchParams?.worksite}
        fallback={
          <div className="flex justify-center items-center w-full h-[50vh]">
            <Spinner />
          </div>
        }
      >
        <EquipmentsSection searchParams={searchParams} />
      </Suspense>
    </ContractorTopbarLayout>
  );
};

export default ContractorEquipmentsPage;
