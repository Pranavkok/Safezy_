import { SearchParamsType } from '@/types/index.types';
import EquipmentsStockSection from './EquipmentsStockSection';
import {
  fetchInTransitProducts,
  fetchOrderedProducts
} from '@/actions/contractor/inventory';

const EquipmentsSection = async ({ searchParams }: SearchParamsType) => {
  const worksiteId = searchParams?.worksite;

  const [orderedData, transitData] = worksiteId
    ? await Promise.all([
        fetchOrderedProducts(worksiteId),
        fetchInTransitProducts(worksiteId)
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
