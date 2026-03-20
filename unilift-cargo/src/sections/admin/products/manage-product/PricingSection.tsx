import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Trash } from 'lucide-react';
import { useFieldArray, useFormContext } from 'react-hook-form';
import { FieldErrors } from 'react-hook-form';
import { addProductType } from '@/validations/admin/add-update-product';

const PricingSection = () => {
  const {
    register,
    control,
    watch,
    setError,
    clearErrors,
    formState: { errors }
  } = useFormContext();

  const errorWithType: FieldErrors<addProductType> = errors;

  const watchPriceWithQty = watch('priceWithQty');
  const watchLeadTimeWithQty = watch('leadTimeWithQty');

  const {
    fields: priceWithQtyFields,
    append: appendPriceWithQty,
    remove: removePriceWithQty
  } = useFieldArray({
    control,
    name: 'priceWithQty'
  });
  const {
    fields: leadTimeWithQtyFields,
    append: appendLeadTimeWithQty,
    remove: removeLeadTimeWithQty
  } = useFieldArray({
    control,
    name: 'leadTimeWithQty'
  });

  const handleAppendPriceWithQty = () => {
    const lastQtyTo =
      watchPriceWithQty.length > 0
        ? watchPriceWithQty[watchPriceWithQty.length - 1].qtyTo
        : '1';

    const lastPriceQtyTo = parseInt(
      watchPriceWithQty[watchPriceWithQty.length - 1].qtyTo || '0'
    );
    const lastPriceQtyFrom = parseInt(
      watchPriceWithQty[watchPriceWithQty.length - 1].qtyFrom || '0'
    );

    if (lastPriceQtyTo <= lastPriceQtyFrom) {
      // Add the error using setError
      setError(`priceWithQty.${watchPriceWithQty.length - 1}.qtyTo`, {
        type: 'custom',
        message: 'Max Qty must be greater than Min Qty '
      });
      return;
    } else {
      clearErrors(`priceWithQty.${watchPriceWithQty.length - 1}.qtyTo`);
    }

    appendPriceWithQty({
      id: Date.now().toString(),
      price: '',
      qtyFrom: String(parseInt(lastQtyTo as string, 10) + 1),
      qtyTo: ''
    });
  };

  const handleAppendLEadTimeWithQty = () => {
    const lastQtyTo =
      watchLeadTimeWithQty.length > 0
        ? watchLeadTimeWithQty[watchLeadTimeWithQty.length - 1].qtyTo
        : '1';

    const lastPriceQtyTo = parseInt(
      watchLeadTimeWithQty[watchLeadTimeWithQty.length - 1].qtyTo || '0'
    );
    const lastPriceQtyFrom = parseInt(
      watchLeadTimeWithQty[watchLeadTimeWithQty.length - 1].qtyFrom || '0'
    );

    if (lastPriceQtyTo <= lastPriceQtyFrom) {
      setError(`leadTimeWithQty.${watchLeadTimeWithQty.length - 1}.qtyTo`, {
        type: 'custom',
        message: 'Max Qty must be greater than Min Qty '
      });
      return;
    } else {
      clearErrors(`leadTimeWithQty.${watchLeadTimeWithQty.length - 1}.qtyTo`);
    }

    appendLeadTimeWithQty({
      id: Date.now().toString(),
      timeInDays: '',
      qtyFrom: String(parseInt(lastQtyTo as string, 10) + 1),
      qtyTo: ''
    });
  };

  return (
    <>
      <div className="space-y-2 pb-5">
        <label className="capitalize">
          Price<span className="ml-[2px] text-red-500">*</span>
        </label>
        {priceWithQtyFields.map((priceWithQty, index) => (
          <div
            key={priceWithQty.id}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-2"
          >
            <div className="flex gap-1">
              <div>
                <label className="text-xs font-medium">Min Qty</label>
                <Input
                  type="number"
                  placeholder="Qty From"
                  {...register(`priceWithQty.${index}.qtyFrom`)}
                  disabled={true}
                />
              </div>
              <div>
                <label className="text-xs font-medium">Max Qty</label>
                <Input
                  type="number"
                  placeholder="Qty To"
                  {...register(`priceWithQty.${index}.qtyTo`)}
                  disabled={index !== watchPriceWithQty?.length - 1}
                  onKeyDown={e => {
                    if (['e', 'E'].includes(e.key)) {
                      e.preventDefault();
                    }
                  }}
                />
              </div>
            </div>
            <div className="flex gap-1">
              <div>
                <label className="font-medium text-xs">Price</label>
                <Input
                  type="number"
                  placeholder="Price"
                  {...register(`priceWithQty.${index}.price`)}
                />
              </div>
              <Button
                type="button"
                onClick={() => removePriceWithQty(index)}
                className="font-medium mt-6"
                disabled={index === 0}
              >
                <Trash className="w-5 h-5" />
              </Button>
            </div>
            {errorWithType?.priceWithQty &&
              errorWithType.priceWithQty[index]?.qtyTo && (
                <div className="text-red-500 text-sm">
                  {errorWithType.priceWithQty[index].qtyTo.message}
                </div>
              )}
            {errorWithType?.priceWithQty &&
              errorWithType.priceWithQty[index]?.price && (
                <div className="text-red-500 text-sm">
                  {errorWithType.priceWithQty[index].price.message}
                </div>
              )}
          </div>
        ))}
        <Button
          type="button"
          variant="outline"
          onClick={handleAppendPriceWithQty}
          disabled={!watchPriceWithQty?.[watchPriceWithQty.length - 1]?.qtyTo}
        >
          <Plus className="mr-2" /> Add Price Range
        </Button>
      </div>

      <div className="space-y-2 pb-5">
        <label className="capitalize">
          Lead Time<span className="ml-[2px] text-red-500">*</span>
        </label>
        {leadTimeWithQtyFields.map((leadTimeWithQty, index) => (
          <div
            key={leadTimeWithQty.id}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-2"
          >
            <div className="flex gap-1">
              <div>
                <label className="text-xs font-medium">Min Qty</label>
                <Input
                  type="number"
                  placeholder="Qty From"
                  {...register(`leadTimeWithQty.${index}.qtyFrom`)}
                  disabled={true}
                />
              </div>
              <div>
                <label className="text-xs font-medium">Max Qty</label>
                <Input
                  type="number"
                  placeholder="Qty To"
                  {...register(`leadTimeWithQty.${index}.qtyTo`)}
                  disabled={index !== watchLeadTimeWithQty?.length - 1}
                  onKeyDown={e => {
                    if (['e', 'E'].includes(e.key)) {
                      e.preventDefault();
                    }
                  }}
                />
              </div>
            </div>
            <div className="flex gap-1">
              <div>
                <label className="font-medium text-xs">Time in days</label>
                <Input
                  type="number"
                  placeholder="10 Days"
                  {...register(`leadTimeWithQty.${index}.timeInDays`)}
                />
              </div>
              <Button
                type="button"
                onClick={() => removeLeadTimeWithQty(index)}
                className="font-medium mt-6"
                disabled={index === 0}
              >
                <Trash className="w-5 h-5" />
              </Button>
            </div>
            {errorWithType?.leadTimeWithQty &&
              errorWithType.leadTimeWithQty[index]?.qtyTo && (
                <div className="text-red-500 text-sm">
                  {errorWithType.leadTimeWithQty[index].qtyTo.message}
                </div>
              )}
            {errorWithType?.leadTimeWithQty &&
              errorWithType.leadTimeWithQty[index]?.timeInDays && (
                <div className="text-red-500 text-sm">
                  {errorWithType.leadTimeWithQty[index].timeInDays.message}
                </div>
              )}
          </div>
        ))}
        <Button
          type="button"
          variant="outline"
          onClick={handleAppendLEadTimeWithQty}
          disabled={
            !watchLeadTimeWithQty?.[watchLeadTimeWithQty.length - 1]?.qtyTo
          }
        >
          <Plus className="mr-2" /> Add Lead Time Range
        </Button>
      </div>
    </>
  );
};

export default PricingSection;
