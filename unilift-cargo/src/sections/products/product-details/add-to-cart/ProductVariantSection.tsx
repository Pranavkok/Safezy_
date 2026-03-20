import React from 'react';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import ColorSelection from '@/components/inputs-fields/ColorSelection';
import { Controller, useFormContext } from 'react-hook-form';

export type ProductColorType = {
  id: string;
  color: string;
};

export type ProductSizeType = {
  id: string;
  size: string;
};

type ProductVariantSectionPropsType = {
  productSizes: ProductSizeType[];
  productColors: ProductColorType[];
};

const ProductVariantSection = ({
  productColors,
  productSizes
}: ProductVariantSectionPropsType) => {
  const {
    control,
    formState: { errors }
  } = useFormContext();

  return (
    <div className="flex flex-col gap-4 md:flex-row md:gap-16">
      {/* Size Selection */}
      <div className="max-w-72">
        <label>
          Size
          <Controller
            name="size"
            control={control}
            render={({ field }) => (
              <Select onValueChange={field.onChange} value={field.value}>
                <SelectTrigger className="w-full sm:w-72 mt-2">
                  <SelectValue placeholder="Choose size" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Available Sizes</SelectLabel>
                    {productSizes?.map(size => (
                      <SelectItem key={size.id} value={size.id}>
                        {size.size}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            )}
          />
        </label>
        {errors.size && (
          <p className="text-sm text-red-500 mt-1">
            {errors.size.message as string}
          </p>
        )}
      </div>

      {/* Color Selection */}
      <div>
        <label htmlFor="colors"> Color</label>
        <div className="flex gap-4 mt-2">
          <Controller
            name="color"
            control={control}
            render={({ field }) => (
              <>
                {productColors.map(data => (
                  <ColorSelection
                    key={data.color}
                    className="w-6 h-6 sm:h-8 sm:w-8"
                    color={data.color}
                    isSelected={field.value === data.color}
                    onClick={() => field.onChange(data.color)}
                  />
                ))}
              </>
            )}
          />
        </div>
        {errors.color && (
          <p className="text-sm text-red-500 mt-1">
            {errors.color.message as string}
          </p>
        )}
      </div>
    </div>
  );
};

export default ProductVariantSection;
