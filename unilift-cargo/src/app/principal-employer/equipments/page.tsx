import Spinner from '@/components/loaders/Spinner';
import { AppRoutes } from '@/constants/AppRoutes';
import PrincipalEmployerTopbarLayout from '@/layouts/PrincipalEmployerTopbarLayout';
import EquipmentsSection from '@/sections/principal-employer/equipments/EquipmentSection';
import { SearchParamsType } from '@/types/index.types';
import { Suspense } from 'react';

const equipmentsBreadcrumbs = [
  { label: 'Dashboard', route: `${AppRoutes.PRINCIPAL_EMPLOYER_DASHBOARD}` },
  {
    label: 'Equipments',
    route: `${AppRoutes.PRINCIPAL_EMPLOYER_EQUIPMENT_LISTING}`
  }
] as const;

const PrincipalEmployerEquipmentsPage = ({
  searchParams
}: SearchParamsType) => {
  return (
    <PrincipalEmployerTopbarLayout
      title="Equipments"
      breadcrumbOptions={equipmentsBreadcrumbs}
    >
      <Suspense
        fallback={
          <Spinner className="absolute inset-0 w-full h-full grid place-content-center" />
        }
      >
        <EquipmentsSection searchParams={searchParams} />
      </Suspense>
    </PrincipalEmployerTopbarLayout>
  );
};

export default PrincipalEmployerEquipmentsPage;
