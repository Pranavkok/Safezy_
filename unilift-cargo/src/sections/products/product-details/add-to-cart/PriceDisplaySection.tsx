import { useCart } from '@/context/CartContext';
import { getProductPriceFromPriceTiers } from '@/utils';
import { ShoppingCart } from 'lucide-react';
import React from 'react';
import { useFormContext } from 'react-hook-form';

const PriceDisplay = ({
  currentPrice,
  mrp,
  isNull
}: {
  currentPrice: number;
  mrp: number;
  isNull: boolean;
}) => {
  const discount = Math.round(((mrp - currentPrice) / mrp) * 100);

  if (isNull || discount <= 0) {
    return (
      <div className="flex flex-wrap items-center gap-x-3">
        <div className="flex items-center gap-2">
          <div className="flex items-baseline">
            <span className="text-2xl font-bold">₹ {mrp}</span>
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="flex flex-wrap items-center gap-x-3">
      <div className="flex items-center gap-2">
        <div className="flex items-baseline">
          <span className="text-2xl font-bold">₹ {currentPrice}</span>
        </div>
        <span className="text-red-600 font-semibold">-{discount}%</span>
      </div>

      <div className="flex items-center">
        <span className="text-sm text-gray-500">M.R.P.: </span>
        <span className="text-sm text-gray-500 line-through ml-1">₹{mrp}</span>
      </div>
    </div>
  );
};

type PriceDisplaySectionPropsType = {
  productId: string;
  priceTiers: {
    minQuantity: number;
    maxQuantity: number;
    price: number;
  }[];
};
const PriceDisplaySection = ({
  productId,
  priceTiers
}: PriceDisplaySectionPropsType) => {
  const {
    state: { cartItems }
  } = useCart();

  const { watch } = useFormContext();

  const cartItemQuantity = cartItems
    .filter(item => item.product.id === productId)
    .reduce((sum, item) => sum + item.quantity, 0);

  const productQuantity = watch('quantity');

  return (
    <div>
      <label>Price</label>
      <div className="flex flex-col  h-9 ">
        {cartItemQuantity === 0 ? (
          <PriceDisplay
            currentPrice={getProductPriceFromPriceTiers(
              productQuantity,
              priceTiers
            )}
            mrp={getProductPriceFromPriceTiers(1, priceTiers)}
            isNull={!productQuantity}
          />
        ) : (
          <PriceDisplay
            currentPrice={getProductPriceFromPriceTiers(
              productQuantity + cartItemQuantity,
              priceTiers
            )}
            mrp={getProductPriceFromPriceTiers(1, priceTiers)}
            isNull={!productQuantity}
          />
        )}
      </div>
      {cartItemQuantity > 0 && (
        <div className="flex items-center mt-2 p-2 bg-green-50 rounded-md border border-green-100 w-fit">
          <ShoppingCart className="w-4 h-4 text-green-600 mr-2" />
          <div className="flex items-center space-x-1">
            <span className="text-sm text-green-700 font-medium">
              {cartItemQuantity}
            </span>
            <span className="text-sm text-green-600">
              {cartItemQuantity === 1 ? 'item' : 'items'} already in cart
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default PriceDisplaySection;
