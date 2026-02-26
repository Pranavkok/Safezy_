import AdminTopbarLayout from '@/layouts/AdminTopbarLayout';
import { AppRoutes } from '@/constants/AppRoutes';
import UpdateProductDetailsSection from '@/sections/admin/products/UpdateProductSection';
import { notFound } from 'next/navigation';
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
    notFound();
  }
  return <UpdateProductDetailsSection productDetails={productDetails} />;
};
