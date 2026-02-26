import EquipmentBox from '@/components/common/EquipmentBox';
import { AppRoutes } from '@/constants/AppRoutes';
import { Plus } from 'lucide-react';
import { useMemo } from 'react';
import { OrderedProductType } from '@/types/inventory.types';
import Link from 'next/link';

type InTransitProductType = {
  productId: string;
  name: string;
  inTransit: number;
};

type GroupedItem = {
  productId: string;
  name: string;
  total: number;
  assigned: number;
  inTransit: number;
};

type Stats = {
  totalEquipments: number;
  assignedEquipments: number;
  unassignedEquipments: number;
};

const calculateStats = (items: GroupedItem[]): Stats => {
  const totalEquipments = items.reduce((acc, item) => acc + item.total, 0);

  const assignedEquipments = items.reduce(
    (acc, item) => acc + item.assigned,
    0
  );
  const unassignedEquipments = totalEquipments - assignedEquipments;

  return { totalEquipments, assignedEquipments, unassignedEquipments };
};

const combineEquipmentData = (
  orderedData: OrderedProductType[],
  inTransitData: {
    productId: string;
    name: string;
    inTransit: number;
  }[]
): GroupedItem[] => {
  let groupedItems: GroupedItem[] = [];

  // Process ordered products
  if (orderedData) {
    groupedItems = orderedData.map(item => ({
      productId: item.product_id ?? '',
      name: item.name ?? 'Unnamed',
      total: item.totalQuantity ?? 0,
      assigned: item.assigned ?? 0,
      inTransit: 0
    }));
  }

  // Process in-transit products
  inTransitData.forEach(transitItem => {
    const existingItem = groupedItems.find(
      item => item.productId === transitItem.productId
    );
    if (existingItem) {
      existingItem.inTransit += transitItem.inTransit;
    } else {
      groupedItems.push({
        productId: transitItem.productId,
        name: transitItem.name,
        total: 0,
        assigned: 0,
        inTransit: transitItem.inTransit || 0
      });
    }
  });

  // Combine products with the same productId
  return groupedItems.reduce((acc, item) => {
    const existingItem = acc.find(
      product => product.productId === item.productId
    );
    if (existingItem) {
      existingItem.total += item.total;
      existingItem.assigned += item.assigned;
      existingItem.inTransit += item.inTransit;
    } else {
      acc.push(item);
    }
    return acc;
  }, [] as GroupedItem[]);
};

const EquipmentsStockSection = ({
  isFromPrincipal = false,
  orderedProducts,
  inTransitProducts
}: {
  isFromPrincipal?: boolean;
  orderedProducts: OrderedProductType[];
  inTransitProducts: InTransitProductType[];
}) => {
  const equipmentItems = useMemo(() => {
    if (orderedProducts.length === 0 && inTransitProducts.length === 0)
      return [];

    return combineEquipmentData(orderedProducts, inTransitProducts);
  }, [orderedProducts, inTransitProducts]);

  const stats = useMemo(() => calculateStats(equipmentItems), [equipmentItems]);

  const statItems = [
    { label: 'Total Equipments', value: stats.totalEquipments },
    { label: 'Assigned Equipments', value: stats.assignedEquipments },
    { label: 'Unassigned Equipments', value: stats.unassignedEquipments }
  ];

  return (
    <>
      {isFromPrincipal && (
        <div className="flex justify-end  items-center mb-4 gap-4">
          <Link
            className="flex items-center bg-primary rounded px-4 py-2 hover:bg-primary/90 text-white transition-colors duration-300 ease-in-out"
            href={AppRoutes.PRODUCT_LISTING}
          >
            <Plus className="w-5 h-5 sm:mr-2" />
            <p className="hidden sm:block capitalize font-bold ">
              Purchase Equipment{' '}
            </p>
          </Link>
        </div>
      )}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-y-5 gap-x-10">
        {statItems.map(stat => (
          <div
            key={stat.label}
            className="flex items-center justify-between border-2 py-2 px-3 rounded-lg font-bold"
          >
            <p>{stat.label}</p>
            <p className="bg-primary rounded-xl px-2 flex justify-center items-center">
              {stat.value}
            </p>
          </div>
        ))}
      </div>
      <div
        className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 mt-10 gap-8 `}
      >
        {equipmentItems.length > 0 ? (
          equipmentItems.map(item => (
            <EquipmentBox
              key={item.productId}
              name={item.name}
              assigned={item.assigned}
              total={item.total - item.assigned}
              inTransit={item.inTransit}
            />
          ))
        ) : (
          <p>No equipment data available.</p>
        )}
      </div>
    </>
  );
};

export default EquipmentsStockSection;
