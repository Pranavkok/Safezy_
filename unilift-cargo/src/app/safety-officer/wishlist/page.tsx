import AdminTopbarLayout from '@/layouts/AdminTopbarLayout';
import WishlistSection from '@/sections/wishlist';
import { AppRoutes } from '@/constants/AppRoutes';

const BREADCRUMBS = [
  { label: 'Dashboard', route: AppRoutes.SAFETY_OFFICER_DASHBOARD },
  { label: 'Wishlist', route: AppRoutes.SAFETY_OFFICER_WISHLIST }
] as const;

const SafetyOfficerWishlistPage = () => {
  return (
    <AdminTopbarLayout title="Wishlist" breadcrumbOptions={BREADCRUMBS}>
      <WishlistSection />
    </AdminTopbarLayout>
  );
};

export default SafetyOfficerWishlistPage;
