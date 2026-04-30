import ContractorTopbarLayout from '@/layouts/ContractorTopbarLayout';
import { AppRoutes } from '@/constants/AppRoutes';
import AssignedPpeSection from '@/sections/contractor/assigned-ppe/AssignedPpeSection';

const BREADCRUMBS = [
  { label: 'Dashboard', route: AppRoutes.CONTRACTOR_DASHBOARD },
  { label: 'My Assigned PPE', route: AppRoutes.CONTRACTOR_ASSIGNED_PPE }
] as const;

const ContractorAssignedPpePage = () => {
  return (
    <ContractorTopbarLayout title="My Assigned PPE" breadcrumbOptions={BREADCRUMBS}>
      <AssignedPpeSection />
    </ContractorTopbarLayout>
  );
};

export default ContractorAssignedPpePage;
