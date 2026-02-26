import { useMemo } from 'react';
import { CartItemType } from '@/context/CartContext';

export type GroupedCartItemType = {
  id: string;
  name: string;
  category: string;
  items: CartItemType[];
  totalQuantity: number;
  totalPrice: number;
  gst: number;
};

export type CartSummary = {
  groupedItems: GroupedCartItemType[];
  subtotal: number;
};

const SHIPPING_CHARGE = 0;

export const useCartCalculations = (cartItems: CartItemType[]) => {
  const { groupedItems, subtotal }: CartSummary = useMemo(() => {
    const groupedByProductAndColor = cartItems.reduce<
      Record<string, GroupedCartItemType>
    >((acc, item) => {
      const { product } = item;
      const groupKey = product.id;

      if (!acc[groupKey]) {
        const initialQuantity = item.quantity;
        const unitPrice = item.unitPrice;
        acc[groupKey] = {
          id: groupKey,
          name: product.name,
          category: product.category,
          items: [item],
          totalQuantity: initialQuantity,
          totalPrice: initialQuantity * unitPrice,
          gst: item.gst
        };
      } else {
        const existingGroup = acc[groupKey];
        const newTotalQuantity = existingGroup.totalQuantity + item.quantity;

        existingGroup.items.push(item);
        existingGroup.totalQuantity = newTotalQuantity;
        existingGroup.totalPrice = newTotalQuantity * item.unitPrice;
      }

      return acc;
    }, {});

    const groupedArray = Object.values(groupedByProductAndColor);
    const total = groupedArray.reduce(
      (sum, group) =>
        sum + group.totalPrice + (group.totalPrice * group.gst) / 100,
      0
    );

    return {
      groupedItems: groupedArray,
      subtotal: total
    };
  }, [cartItems]);

  const shipping = SHIPPING_CHARGE;

  // Calculate GST for each group and sum it up
  const totalGST = groupedItems.reduce((sum, group) => {
    const gstAmount = (group.totalPrice * group.gst) / 100;
    return sum + gstAmount;
  }, 0);

  // Add GST to the final total
  const total = subtotal + shipping;

  return {
    groupedItems,
    subtotal,
    shipping,
    total,
    totalGST
  };
};
