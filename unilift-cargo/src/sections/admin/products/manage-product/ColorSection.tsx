import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Trash } from 'lucide-react';
import { useFieldArray, useFormContext } from 'react-hook-form';

const ColorSection = () => {
  const { register, control } = useFormContext();

  const {
    fields: colorFields,
    append: appendColor,
    remove: removeColor
  } = useFieldArray({
    control,
    name: 'colors'
  });
  return (
    <div className="space-y-2 pb-5">
      <label className="capitalize">Color</label>
      <div className="flex flex-col xl:flex-row gap-2 w-full">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 2xl:grid-cols-2 gap-2 w-full">
          {colorFields.map((colorField, index) => (
            <div key={colorField.id} className="flex items-center gap-2 w-full">
              <div className="w-full border flex justify-end items-center rounded h-10">
                <Input
                  type="color"
                  {...register(`colors.${index}.color`)}
                  className="w-20 h-9 border-none cursor-pointer focus:outline-none rounded"
                />
              </div>
              <Button
                type="button"
                onClick={() => removeColor(index)}
                className="font-medium"
                disabled={colorFields.length === 1}
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
            appendColor({
              id: Date.now().toString(),
              color: ''
            })
          }
        >
          <Plus className="mr-2" /> Add New Color
        </Button>
      </div>
    </div>
  );
};

export default ColorSection;
