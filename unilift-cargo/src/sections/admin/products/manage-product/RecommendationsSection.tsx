import InputFieldWithLabel from '@/components/inputs-fields/InputFieldWithLabel';
import { MultiSelect } from '@/components/inputs-fields/MultiSelect';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { GEOGRAPHICAL_LOCATIONS_OPTIONS } from '@/constants/contractor';
import { Plus, Trash } from 'lucide-react';
import { Controller, useFieldArray, useFormContext } from 'react-hook-form';

type RecommendationsSectionPropsType = {
  defaultGeographicalLocation?: string[];
};

const RecommendationsSection = ({
  defaultGeographicalLocation
}: RecommendationsSectionPropsType) => {
  const {
    register,
    control,
    formState: { errors }
  } = useFormContext();

  const {
    fields: recommendedIndustryUseFields,
    append: appendRecommendedIndustryUse,
    remove: removeRecommendedIndustryUse
  } = useFieldArray({
    control,
    name: 'recommendedIndustryUses'
  });

  return (
    <>
      <div className="space-y-2 pb-5">
        <label className="capitalize">
          Geographical Location<span className="ml-[2px] text-red-500">*</span>
        </label>
        <Controller
          name="geographicalLocation"
          control={control}
          render={({ field }) => (
            <MultiSelect
              defaultValue={defaultGeographicalLocation}
              options={GEOGRAPHICAL_LOCATIONS_OPTIONS}
              onValueChange={val => {
                field.onChange(val);
              }}
              variant={'inverted'}
            />
          )}
        />
        {errors.geographicalLocation?.message && (
          <div className="text-sm text-red-500">
            {errors.geographicalLocation?.message as string}
          </div>
        )}
      </div>

      <div className="space-y-2 pb-5">
        <label className="capitalize">Recommended Industry Use</label>
        <div className="flex flex-col xl:flex-row gap-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-2">
            {recommendedIndustryUseFields.map((industryUseField, index) => (
              <div
                key={industryUseField.id}
                className="flex items-center gap-2"
              >
                <Input
                  type="text"
                  {...register(
                    `recommendedIndustryUses.${index}.recommendedIndustryUse`
                  )}
                />
                <Button
                  type="button"
                  onClick={() => removeRecommendedIndustryUse(index)}
                  className="font-medium"
                  disabled={recommendedIndustryUseFields.length === 1}
                >
                  <Trash className="w-5 h-5" />
                </Button>
              </div>
            ))}
          </div>
          <Button
            className="max-w-44"
            type="button"
            variant="outline"
            onClick={() =>
              appendRecommendedIndustryUse({
                id: Date.now().toString(),
                recommendedIndustryUse: ''
              })
            }
          >
            <Plus className="mr-2" /> Add New Field
          </Button>
        </div>
      </div>
      <InputFieldWithLabel
        labelHelper="(Months)"
        type="number"
        label="Recommended Use Life"
        {...register('recommendedUseLife')}
        errorText={errors.recommendedUseLife?.message as string}
      />
      <div className=" grid grid-cols-2 gap-2 ">
        <InputFieldWithLabel
          type="number"
          label="GST(%)"
          {...register('gst')}
          errorText={errors.gst?.message as string}
          required
        />
        <InputFieldWithLabel
          type="number"
          label="HSN Code"
          {...register('hsn_code')}
          errorText={errors.hsn_code?.message as string}
          required
        />
      </div>
    </>
  );
};

export default RecommendationsSection;
