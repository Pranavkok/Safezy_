import React, { Dispatch, SetStateAction } from 'react';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectGroup,
  SelectItem
} from '@/components/ui/select';
import { ProductFilterType } from '@/validations/product/product-filter';
import { SORT_OPTIONS } from '@/constants/product';

const ProductsSortingSection = ({
  filter,
  setFilter,
  _debouncedSubmit
}: {
  filter: ProductFilterType;
  setFilter: Dispatch<SetStateAction<ProductFilterType>>;
  _debouncedSubmit: () => void;
}) => {
  const handleSort = (value: (typeof SORT_OPTIONS)[number]['value']) => {
    setFilter(prev => ({
      ...prev,
      sort: value,
      page: 1
    }));
    _debouncedSubmit();
  };
  return (
    <Select value={filter.sort || 'none'} onValueChange={handleSort}>
      <SelectTrigger className="w-full sm:w-48">
        <SelectValue placeholder="Sort by" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          {SORT_OPTIONS.map(option => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
};

export default ProductsSortingSection;
