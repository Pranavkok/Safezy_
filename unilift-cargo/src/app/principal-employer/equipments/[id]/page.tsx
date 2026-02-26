import React from 'react';
import { AppRoutes } from '@/constants/AppRoutes';
import PrincipalEmployerTopbarLayout from '@/layouts/PrincipalEmployerTopbarLayout';
import EquipmentDetailsSection from '@/sections/principal-employer/equipments/EquipmentsDetailsSection';
import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';
import { SearchParamsType } from '@/types/index.types';

type PrincipalEmployerEquipmentListingPagePropsType = SearchParamsType & {
  params: {
    id: string;
  };
};

const PrincipalEmployerEquipmentsAssignPage = ({
  params,
  searchParams
}: PrincipalEmployerEquipmentListingPagePropsType) => {
  const productId = params?.id;

  if (!productId) {
    notFound();
  }

  const cookieStore = cookies();
  const result = cookieStore.get('uniqueCode')?.value || '';
  const cookieUniqueCode = result as string;

  const equipmentsBreadcrumbs = [
    { label: 'Dashboard', route: AppRoutes.PRINCIPAL_EMPLOYER_DASHBOARD },
    {
      label: 'Equipments',
      route: `${AppRoutes.PRINCIPAL_EMPLOYER_EQUIPMENT_LISTING}?uniqueCode=${cookieUniqueCode}`
    },
    {
      label: 'Equipment Details',
      route: `${AppRoutes.PRINCIPAL_EMPLOYER_EQUIPMENT_DETAILS}`
    }
  ] as const;

  return (
    <PrincipalEmployerTopbarLayout
      title="Equipments"
      breadcrumbOptions={equipmentsBreadcrumbs}
    >
      <EquipmentDetailsSection
        searchParams={searchParams}
        productId={productId}
      />
    </PrincipalEmployerTopbarLayout>
  );
};

export default PrincipalEmployerEquipmentsAssignPage;
