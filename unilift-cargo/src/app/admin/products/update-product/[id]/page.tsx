import AdminTopbarLayout from '@/layouts/AdminTopbarLayout';
import { AppRoutes } from '@/constants/AppRoutes';
import UpdateProductDetailsSection from '@/sections/admin/products/UpdateProductSection';
import { getProductById } from '@/actions/contractor/product';
import Spinner from '@/components/loaders/Spinner';
import { Suspense } from 'react';

const BREADCRUMBS = [
  { label: 'Dashboard', route: AppRoutes.ADMIN_DASHBOARD },
  {
    label: 'Products',
    route: AppRoutes.ADMIN_PRODUCT_LISTING
  },
  {
    label: 'Update Product',
    route: AppRoutes.ADMIN_UPDATE_PRODUCT('_')
  }
] as const;

const AdminUpdateProductPage = ({
  params
}: {
  params: {
    id: string;
  };
}) => {
  return (
    <AdminTopbarLayout title="Update Product" breadcrumbOptions={BREADCRUMBS}>
      <Suspense
        fallback={
          <div className="flex justify-center items-center w-full h-[50vh]">
            <Spinner />
          </div>
        }
      >
        <UpdateProduct productId={params.id} />
      </Suspense>
    </AdminTopbarLayout>
  );
};

export default AdminUpdateProductPage;

const UpdateProduct = async ({ productId }: { productId: string }) => {
  const { data: productDetails } = await getProductById(productId);

  if (!productDetails) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-sm text-gray-600">
        Failed to load the product details. Please go back and try again.
      </div>
    );
  }
  return <UpdateProductDetailsSection productDetails={productDetails} />;
};
