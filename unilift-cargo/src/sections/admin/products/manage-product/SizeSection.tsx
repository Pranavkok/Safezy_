import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Trash } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useFieldArray, useFormContext } from 'react-hook-form';

const SizeSection = () => {
  const { register, control } = useFormContext();

  const {
    fields: sizesFields,
    append: appendSize,
    remove: removeSize
  } = useFieldArray({
    control,
    name: 'sizes'
  });

  return (
    <div className="space-y-2 pb-5">
      <label className="capitalize">Size</label>
      <div className="flex flex-col xl:flex-row gap-2">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-2">
          {sizesFields.map((sizeField, index) => (
            <div key={sizeField.id} className="flex items-center gap-2">
              <Input type="text" {...register(`sizes.${index}.size`)} />
              <Button
                type="button"
                onClick={() => removeSize(index)}
                className="font-medium"
                disabled={sizesFields.length === 1}
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
            appendSize({
              id: Date.now().toString(),
              size: ''
            })
          }
        >
          <Plus className="mr-2" /> Add New Size
        </Button>
      </div>
    </div>
  );
};

export default SizeSection;
