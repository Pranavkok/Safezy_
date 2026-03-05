import ContractorTopbarLayout from '@/layouts/ContractorTopbarLayout';
import WishlistSection from '@/sections/wishlist';
import { AppRoutes } from '@/constants/AppRoutes';

const BREADCRUMBS = [
  { label: 'Dashboard', route: AppRoutes.CONTRACTOR_DASHBOARD },
  { label: 'Wishlist', route: AppRoutes.CONTRACTOR_WISHLIST }
] as const;

const WishlistPage = () => {
  return (
    <ContractorTopbarLayout title="Wishlist" breadcrumbOptions={BREADCRUMBS}>
      <WishlistSection />
    </ContractorTopbarLayout>
  );
};

export default WishlistPage;
