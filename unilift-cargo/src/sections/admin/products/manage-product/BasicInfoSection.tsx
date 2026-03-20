import InputFieldWithLabel from '@/components/inputs-fields/InputFieldWithLabel';
import SelectWithLabel from '@/components/inputs-fields/SelectWithLabel';
import { Textarea } from '@/components/ui/textarea';
import {
  CATEGORY_SUBCATEGORIES,
  PRODUCT_BRANDS,
  PRODUCT_CATEGORIES
} from '@/constants/product';
import { Controller, useFormContext } from 'react-hook-form';
import { Switch } from '@/components/ui/switch';

const BasicInfoSection = ({
  isUpdateSection
}: {
  isUpdateSection: boolean;
}) => {
  const {
    register,
    control,
    watch,
    formState: { errors }
  } = useFormContext();

  const selectedCategory = watch('category') || '';
  const subCategoryOptions = CATEGORY_SUBCATEGORIES[selectedCategory] || [];

  return (
    <>
      {isUpdateSection && (
        <Controller
          control={control}
          name="isOutOfStock"
          defaultValue={false}
          render={({ field: { value, onChange } }) => (
            <div className="flex sm:col-span-1 md:justify-end lg:col-span-2 sm:justify-start sm:mb-2 md:mb-0 min-h-[40px]">
              <div className="flex items-center gap-2 text-lg">
                <Switch
                  id="isOutOfStock"
                  checked={value}
                  onCheckedChange={onChange}
                />
                <label htmlFor="isOutOfStock">Out of Stock</label>
              </div>
            </div>
          )}
        />
      )}

      <InputFieldWithLabel
        type="text"
        label="Product Name"
        {...register('productName')}
        errorText={errors.productName?.message as string}
        required
      />

      <Controller
        control={control}
        name="category"
        render={({ field }) => (
          <SelectWithLabel
            label="Category"
            name="category"
            options={PRODUCT_CATEGORIES}
            errorText={errors.category?.message as string}
            onChange={field.onChange}
            value={field.value}
            required
          />
        )}
      />

      <InputFieldWithLabel
        type="text"
        label="Product Id"
        {...register('productId')}
        errorText={errors.productId?.message as string}
        required
      />

      <Controller
        control={control}
        name="subCategory"
        render={({ field }) => (
          <SelectWithLabel
            label="Sub Category"
            name="sub_category"
            options={subCategoryOptions}
            errorText={errors.subCategory?.message as string}
            onChange={field.onChange}
            value={field.value}
            disabled={!selectedCategory}
            required
          />
        )}
      />

      <div className="space-y-2 pb-5">
        <label className="capitalize">
          Product Description
          <span className="ml-[2px] text-red-500">*</span>
        </label>
        <Textarea
          rows={4}
          className="w-full h-32"
          {...register('productDescription')}
        />
        {errors.productDescription && (
          <div className="text-sm text-red-500">
            {errors.productDescription.message as string}
          </div>
        )}
      </div>

      <Controller
        control={control}
        name="brandName"
        render={({ field }) => (
          <SelectWithLabel
            label="Brand Name"
            name="brandName"
            options={PRODUCT_BRANDS}
            errorText={errors.brandName?.message as string}
            onChange={field.onChange}
            value={field.value}
            required
          />
        )}
      />
    </>
  );
};

export default BasicInfoSection;
