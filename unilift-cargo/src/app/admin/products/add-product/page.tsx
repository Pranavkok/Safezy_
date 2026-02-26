import AdminTopbarLayout from '@/layouts/AdminTopbarLayout';
import AddNewProductSection from '@/sections/admin/products/AddNewProductSection';
import { AppRoutes } from '@/constants/AppRoutes';

const BREADCRUMBS = [
  { label: 'Dashboard', route: AppRoutes.ADMIN_DASHBOARD },
  {
    label: 'Products',
    route: AppRoutes.ADMIN_PRODUCT_LISTING
  },
  {
    label: 'Add new Product',
    route: AppRoutes.ADMIN_ADD_PRODUCT
  }
] as const;

const AdminAddProductPage = () => {
  return (
    <AdminTopbarLayout title="Add new Product" breadcrumbOptions={BREADCRUMBS}>
      <AddNewProductSection />
    </AdminTopbarLayout>
  );
};

export default AdminAddProductPage;
