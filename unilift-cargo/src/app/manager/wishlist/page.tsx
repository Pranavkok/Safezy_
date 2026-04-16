import AdminTopbarLayout from '@/layouts/AdminTopbarLayout';
import WishlistSection from '@/sections/wishlist';
import { AppRoutes } from '@/constants/AppRoutes';

const BREADCRUMBS = [
  { label: 'Dashboard', route: AppRoutes.MANAGER_DASHBOARD },
  { label: 'Wishlist', route: AppRoutes.MANAGER_WISHLIST }
] as const;

const ManagerWishlistPage = () => {
  return (
    <AdminTopbarLayout title="Wishlist" breadcrumbOptions={BREADCRUMBS}>
      <WishlistSection />
    </AdminTopbarLayout>
  );
};

export default ManagerWishlistPage;
