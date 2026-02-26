import React, { Dispatch, SetStateAction } from 'react';
import { Input } from '@/components/ui/input';
import { ProductFilterType } from '@/validations/product/product-filter';
import ProductFilterDrawerSection from './ProductFilterDrawerSection';
import ProductsSortingSection from './search-sort-filter/ProductsSortingSection';

const ProductSearchingSortingSection = ({
  filter,
  setFilter,
  _debouncedSubmit
}: {
  filter: ProductFilterType;
  setFilter: Dispatch<SetStateAction<ProductFilterType>>;
  _debouncedSubmit: () => void;
}) => {
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const searchValue = e.target.value;
    setFilter(prev => ({
      ...prev,
      search: searchValue,
      page: 1
    }));

    _debouncedSubmit();
  };

  return (
    <div className="w-full p-4 bg-white shadow-md rounded-lg">
      <div className="flex  gap-2 lg:gap-0 sm:flex-row sm:space-y-0  sm:items-center sm:justify-between">
        <ProductFilterDrawerSection
          filter={filter}
          setFilter={setFilter}
          _debouncedSubmit={_debouncedSubmit}
        />

        <div className="w-full sm:max-w-xs">
          <Input
            type="text"
            placeholder="Search Product"
            value={filter.search || ''}
            onChange={handleSearch}
            className="w-full"
          />
        </div>

        <div className="w-full sm:w-auto hidden lg:block">
          <ProductsSortingSection
            filter={filter}
            setFilter={setFilter}
            _debouncedSubmit={_debouncedSubmit}
          />
        </div>
      </div>
    </div>
  );
};

export default ProductSearchingSortingSection;
