import { SearchParamsType } from '@/types/index.types';
import {
  fetchInTransitProductsPUser,
  fetchOrderedProductsPUser
} from '@/actions/principal-employer/principal';
import EquipmentsStockSection from '@/sections/contractor/equipments/EquipmentsStockSection';

const EquipmentsSection = async ({ searchParams }: SearchParamsType) => {
  const worksiteId = searchParams?.uniqueCode;

  const [orderedData, transitData] = worksiteId
    ? await Promise.all([
        fetchOrderedProductsPUser(worksiteId),
        fetchInTransitProductsPUser(worksiteId)
      ])
    : [];

  return (
    <>
      {worksiteId && (
        <EquipmentsStockSection
          inTransitProducts={transitData?.data || []}
          orderedProducts={orderedData?.data || []}
        />
      )}
    </>
  );
};

export default EquipmentsSection;
