import React from 'react';
import PrincipalEmployerTopbarLayout from '@/layouts/PrincipalEmployerTopbarLayout';
import PrincipalEmployerDashboardSection from '@/sections/principal-employer/dashboard/PrincipalEmployerDashBoardSection';
import { cookies } from 'next/headers';

const PrincipalEmployerDashboardPage = () => {
  const cookieStore = cookies();
  const result = cookieStore.get('uniqueCode')?.value ?? '';
  const cookieUniqueCode = result;

  return (
    <PrincipalEmployerTopbarLayout title="Dashboard">
      <PrincipalEmployerDashboardSection cookieUniqueCode={cookieUniqueCode} />
    </PrincipalEmployerTopbarLayout>
  );
};

export default PrincipalEmployerDashboardPage;
