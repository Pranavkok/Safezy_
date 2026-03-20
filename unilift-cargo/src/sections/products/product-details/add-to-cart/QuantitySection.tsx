import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Minus, Plus } from 'lucide-react';
import { Controller, useFormContext } from 'react-hook-form';
// import { getProductLeadTimeFromLeadTimeTiers } from '@/utils';
// import { useCart } from '@/context/CartContext';
// import { LeadTimeTiersType } from '@/types/index.types';

// type QuantitySectionPropsType = {
//   leadTime: LeadTimeTiersType[];
//   productId: string;
// };

// const QuantitySection = ({ leadTime, productId }: QuantitySectionPropsType) => {
const QuantitySection = () => {
  const {
    control,
    getValues,
    setValue,
    // watch,
    formState: { errors }
  } = useFormContext();

  // const {
  //   state: { cartItems }
  // } = useCart();

  // const cartItemQuantity = cartItems
  //   .filter(item => item.product.id === productId)
  //   .reduce((sum, item) => sum + item.quantity, 0);

  // const productQuantity = watch('quantity') || 0;

  // const totalQuantity = cartItemQuantity
  //   ? cartItemQuantity + productQuantity
  //   : productQuantity;

  const handleQuantityChange = (increment: boolean) => {
    const currentValue = getValues('quantity');
    setValue(
      'quantity',
      increment ? currentValue + 1 : Math.max(1, currentValue - 1)
    );
  };

  // const leadTimeTiers =
  //   leadTime?.map(time => {
  //     return {
  //       minQuantity: parseInt(time.qtyFrom),
  //       maxQuantity: parseInt(time.qtyTo),
  //       days: parseInt(time.timeInDays)
  //     };
  //   }) || [];
  return (
    <div>
      <label>Quantity</label>
      <div className="flex  flex-col sm:flex-row sm:items-center gap-4 mt-2">
        <div className="flex items-center gap-4 ">
          {' '}
          <Button
            type="button"
            size="icon"
            onClick={() => handleQuantityChange(false)}
          >
            <Minus className="h-4 w-4" />
          </Button>
          <Controller
            name="quantity"
            control={control}
            render={({ field }) => (
              <Input
                type="number"
                min="0"
                className="w-24 text-center  hide-arrows"
                {...field}
                onChange={e => field.onChange(parseInt(e.target.value))}
              />
            )}
          />
          <Button
            type="button"
            size="icon"
            onClick={() => handleQuantityChange(true)}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        <div>
          Expected Delivery: Delivery time depends on availability, will update
          you soon.
          <span className="font-semibold">
            {/* {getProductLeadTimeFromLeadTimeTiers(totalQuantity, leadTimeTiers)}{' '}
            days */}
          </span>
        </div>
      </div>
      {errors.quantity && (
        <p className="text-sm text-red-500 mt-1">
          {errors.quantity.message as string}
        </p>
      )}
    </div>
  );
};

export default QuantitySection;
