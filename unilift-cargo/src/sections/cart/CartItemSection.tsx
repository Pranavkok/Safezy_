import { Button } from '@/components/ui/button';
import { CartItemType, useCart } from '@/context/CartContext';
import { Trash } from 'lucide-react';
import React, { useCallback } from 'react';
import CartSpinner from '@/components/loaders/CartSpinner';
import CartQuantityChangeModal from '@/components/modals/CartQuantityChangeModal';

interface CartItemSectionProps {
  item: CartItemType;
}

const QuantityButton = ({
  action,
  onClick,
  isLoading,
  className
}: {
  action: 'increase' | 'decrease';
  onClick: () => void;
  isLoading: boolean;
  className?: string;
}) => (
  <Button
    size="sm"
    className={`h-8 w-8 border-gray-200 ${className}`}
    onClick={onClick}
    disabled={isLoading}
  >
    {isLoading && <CartSpinner />}
    {!isLoading && action === 'increase' && '+'}
    {!isLoading && action === 'decrease' && '-'}
  </Button>
);

const CartItemSection = ({ item }: CartItemSectionProps) => {
  const { decreaseQuantity, increaseQuantity, removeItemFromCart } = useCart();
  const [loadingState, setLoadingState] = React.useState<{
    type: 'increase' | 'decrease' | 'remove' | null;
  }>({ type: null });

  const handleAction = useCallback(
    async (
      action: () => Promise<void>,
      type: 'increase' | 'decrease' | 'remove'
    ) => {
      try {
        setLoadingState({ type });

        await action();
      } finally {
        setLoadingState({ type: null });
      }
    },
    []
  );

  return (
    <div className="relative grid grid-cols-1  gap-4 p-4 bg-white border border-gray-200 rounded-lg hover:border-gray-300 transition-colors">
      {/* Remove Button */}
      <Button
        variant="ghost"
        size="sm"
        className="absolute top-1 right-1 text-gray-400 hover:text-red-600 hover:bg-red-50"
        onClick={() =>
          handleAction(() => removeItemFromCart(item.id), 'remove')
        }
        disabled={loadingState.type === 'remove'}
      >
        {loadingState.type === 'remove' ? (
          <CartSpinner className="w-5 h-6" />
        ) : (
          <Trash className="h-4 w-4" />
        )}
      </Button>

      <div className="flex flex-1 gap-6">
        <div className="flex flex-col space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-700">Size:</span>
            <span className="text-sm bg-gray-50 px-2 py-1 rounded-md text-gray-600">
              {item.size}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-700">Color:</span>
            <div className="flex items-center gap-2">
              <div
                className="h-4 w-4 rounded-full ring-2 ring-gray-200 ring-offset-2 shadow-sm"
                style={{ backgroundColor: item.color }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Quantity Controls */}
      <div className="flex items-center mt-4 md:mt-0 ">
        <QuantityButton
          action="decrease"
          onClick={() =>
            handleAction(() => decreaseQuantity(item.id), 'decrease')
          }
          isLoading={loadingState.type === 'decrease'}
          className="rounded-l-md rounded-r-none"
        />

        <CartQuantityChangeModal key={item.quantity} item={item} />
        <QuantityButton
          action="increase"
          onClick={() =>
            handleAction(() => increaseQuantity(item.id), 'increase')
          }
          isLoading={loadingState.type === 'increase'}
          className="rounded-r-md rounded-l-none"
        />
      </div>
    </div>
  );
};

export default CartItemSection;
