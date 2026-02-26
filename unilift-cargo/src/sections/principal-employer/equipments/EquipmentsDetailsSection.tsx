import { fetchOrderedProductDetails } from '@/actions/contractor/inventory';
import Spinner from '@/components/loaders/Spinner';
import { Suspense } from 'react';
import { EquipmentListingTable } from './equipments-table/EquipmentDetailsTable';

interface EquipmentDetailsSectionProps {
  searchParams: {
    name?: string;
    page?: string;
    per_page?: string;
  };
  productId: string;
}

const EquipmentDetailsSection: React.FC<EquipmentDetailsSectionProps> = ({
  searchParams,
  productId
}) => {
  const searchQuery = searchParams?.name || undefined;
  const page = parseInt(searchParams?.page || '1', 10);
  const pageSize = parseInt(searchParams?.per_page || '10', 10);

  const equipmentListingPromise = fetchOrderedProductDetails(
    productId,
    searchQuery,
    page,
    pageSize
  );

  return (
    <Suspense
      fallback={
        <Spinner className="absolute inset-0 w-full h-full grid place-content-center" />
      }
    >
      <EquipmentListingTable
        equipmentListingPromise={equipmentListingPromise}
      />
    </Suspense>
  );
};

export default EquipmentDetailsSection;
