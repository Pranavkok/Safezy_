import React, { Dispatch, SetStateAction } from 'react';
import { RotateCcw } from 'lucide-react';
import CustomRating from '@/components/CustomRating';
// import ColorSelection from "@/components/inputs-fields/ColorSelection";
import ProductsSortingSection from './search-sort-filter/ProductsSortingSection';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import {
  CATEGORY_SUBCATEGORIES,
  PRODUCT_BRANDS,
  PRODUCT_CATEGORIES
} from '@/constants/product';
import { ProductFilterType } from '@/validations/product/product-filter';
import { DEFAULT_CUSTOM_PRICE, DEFAULT_FILTER } from '.';
import { GEOGRAPHICAL_LOCATIONS_OPTIONS } from '@/constants/contractor';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { useRouter } from 'next/navigation';

import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from '@/components/ui/accordion';
import toast from 'react-hot-toast';

type ProductFilterSectionProps = {
  filter: ProductFilterType;
  setFilter: Dispatch<SetStateAction<ProductFilterType>>;
  _debouncedSubmit: () => void;
};

const ProductFilterSection = ({
  filter,
  setFilter,
  _debouncedSubmit
}: ProductFilterSectionProps) => {
  // const colors = ["#FF914D", "#BBFF2B", "#B8B8B8", "#4B76E3"];

  const router = useRouter();

  // Calculate min and max price from the filter range
  const minPrice = filter.price.range[0];
  const maxPrice = filter.price.range[1];

  // Check if any filters are currently applied
  const hasActiveFilters = () => {
    return (
      filter.category[0] !== 'all' ||
      filter.color !== DEFAULT_FILTER.color ||
      filter.rating !== DEFAULT_FILTER.rating ||
      filter.price.range[0] !== DEFAULT_CUSTOM_PRICE[0] ||
      filter.price.range[1] !== DEFAULT_CUSTOM_PRICE[1] ||
      filter.sort !== DEFAULT_FILTER.sort ||
      filter.search.trim() !== DEFAULT_FILTER.search ||
      filter.geographical !== DEFAULT_FILTER.geographical ||
      filter.brand !== DEFAULT_FILTER.brand
    );
  };

  const handleGeographicalLocation = (value: string) => {
    setFilter(prev => ({
      ...prev,
      geographical: [value],
      page: 1
    }));
    _debouncedSubmit();
  };

  const handlePriceInputChange = (value: string, type: 'min' | 'max') => {
    const numericValue = parseInt(value.replace(/₹\s*/g, '')) || 0;

    if (numericValue > DEFAULT_CUSTOM_PRICE[1]) {
      toast.remove();
      toast.error(`Max price should not exceed ${DEFAULT_CUSTOM_PRICE[1]}`);
      return;
    }

    setFilter(prev => {
      return {
        ...prev,
        price: {
          range:
            type === 'min'
              ? [numericValue, prev.price.range[1]]
              : [prev.price.range[0], numericValue]
        },
        page: 1
      };
    });

    _debouncedSubmit();
  };

  const handleCategoryChange = (value: string) => {
    setFilter(prev => {
      return { ...prev, category: [value] as never, subCategory: [] };
    });

    _debouncedSubmit();
  };

  const handleBrandName = (value: string) => {
    setFilter(prev => ({
      ...prev,
      brand: value,
      page: 1
    }));
    _debouncedSubmit();
  };

  const handleSubcategoryChange = (value: string) => {
    setFilter(prev => {
      const isFilterApplied = prev.subCategory.includes(value);

      let updatedCategories = prev.subCategory;

      if (isFilterApplied) {
        updatedCategories = updatedCategories.filter(cat => cat !== value);
      } else {
        updatedCategories = [...updatedCategories, value];
      }

      return { ...prev, subCategory: updatedCategories };
    });

    _debouncedSubmit();
  };

  const handleResetFilters = () => {
    setFilter(DEFAULT_FILTER);
    router.replace('/products');
    _debouncedSubmit();
  };

  const selectedCategory = filter.category[0] || 'all';

  return (
    <>
      <div
        className={`flex items-center justify-between px-6 py-4  relative  animate-in fade-in slide-in-from-top-2 duration-200`}
      >
        <h2 className="text-xl font-semibold hidden lg:block">Filter</h2>
        {hasActiveFilters() && (
          <Button
            size="sm"
            onClick={handleResetFilters}
            className="absolute right-6 transition-all duration-200 capitalize"
          >
            <RotateCcw className="mr-2 h-4 w-4" />
            Clear Filters
          </Button>
        )}
      </div>

      <hr className="border-gray-300 hidden lg:block" />

      {/* Sorting Section for Mobile */}
      <div className="lg:hidden px-6">
        <p className="font-semibold text-lg mb-3">Sort By</p>
        <ProductsSortingSection
          filter={filter}
          setFilter={setFilter}
          _debouncedSubmit={_debouncedSubmit}
        />
      </div>

      <div className="px-6 py-4 space-y-6">
        <div className="space-y-4">
          <p className="font-semibold text-lg mb-3">Categories</p>

          <RadioGroup
            value={filter.category[0]}
            onValueChange={handleCategoryChange}
            className="space-y-3"
          >
            {/* All Categories option */}
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="all" id="all" />
              <Label htmlFor="all">All Categories</Label>
            </div>

            {/* Other categories */}
            {PRODUCT_CATEGORIES.map(category => (
              <div key={category.value} className="space-y-2">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value={category.value} id={category.value} />
                  <Label className="cursor-pointer" htmlFor={category.value}>
                    {category.label}
                  </Label>
                </div>

                {/* Show accordion for subcategories only if category is selected */}
                {selectedCategory === category.value &&
                  CATEGORY_SUBCATEGORIES[category.value] && (
                    <Accordion type="single" collapsible className="ml-6">
                      <AccordionItem value="subcategories">
                        <AccordionTrigger className="text-sm py-2">
                          Subcategories
                        </AccordionTrigger>
                        <AccordionContent>
                          <div className="space-y-4">
                            {CATEGORY_SUBCATEGORIES[category.value].map(
                              subcategory => (
                                <div
                                  key={subcategory.value}
                                  className="flex items-center space-x-2"
                                >
                                  <Checkbox
                                    id={subcategory.value}
                                    checked={filter.subCategory.includes(
                                      subcategory.value
                                    )}
                                    onCheckedChange={() =>
                                      handleSubcategoryChange(subcategory.value)
                                    }
                                  />
                                  <label
                                    htmlFor={subcategory.value}
                                    className="text-sm leading-none cursor-pointer"
                                  >
                                    {subcategory.label}
                                  </label>
                                </div>
                              )
                            )}
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
                  )}
              </div>
            ))}
          </RadioGroup>
        </div>

        <div>
          <p className="font-semibold text-lg mb-2">Brand</p>
          <div>
            <Select value={filter.brand} onValueChange={handleBrandName}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select brand" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {PRODUCT_BRANDS.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div>
          <p className="font-semibold text-lg mb-2">Industry</p>
          <div>
            <Select
              value={filter.geographical[0]}
              onValueChange={handleGeographicalLocation}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select industry" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {GEOGRAPHICAL_LOCATIONS_OPTIONS.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div>
          <p className="font-semibold text-lg mb-2">Price</p>
          <div className="flex gap-4 mb-4">
            {[
              { label: 'Min', value: minPrice, type: 'min' },
              { label: 'Max', value: maxPrice, type: 'max' }
            ].map((data, id) => (
              <div key={id} className="flex flex-col flex-1">
                <p className="text-xs">{data.label}</p>
                <Input
                  value={'₹ ' + `${data.value === 0 ? '' : data.value}`}
                  onChange={e =>
                    handlePriceInputChange(
                      e.target.value,
                      data.type as 'min' | 'max'
                    )
                  }
                  onBlur={() => _debouncedSubmit()}
                />
              </div>
            ))}
          </div>
          <Slider
            className=" cursor-pointer"
            value={filter.price.range}
            onValueChange={range => {
              const [newMin, newMax] = range;
              setFilter(prev => ({
                ...prev,
                price: { range: [newMin, newMax] }
              }));

              _debouncedSubmit();
            }}
            min={DEFAULT_CUSTOM_PRICE[0]}
            max={DEFAULT_CUSTOM_PRICE[1]}
            defaultValue={DEFAULT_CUSTOM_PRICE}
            step={5}
          />
        </div>
        {/* Hide the color-filter */}
        {/* <div>
          <p className="font-semibold text-lg mb-2">Color</p>
          <div className="flex gap-3">
            {colors.map((color) => (
              <ColorSelection
                key={color}
                className="w-7 h-7"
                color={color}
                isSelected={color === filter.color}
                onClick={() => {
                  setFilter((prev) => ({
                    ...prev,
                    color: color,
                  }));
                  _debouncedSubmit();
                }}
              />
            ))}
          </div>
        </div> */}
        <div>
          <p className="font-semibold text-lg mb-2">Rating</p>
          <CustomRating
            initialRating={filter.rating}
            size={30}
            onRatingChange={val => {
              setFilter(prev => ({
                ...prev,
                rating: val
              }));
              _debouncedSubmit();
            }}
          />
        </div>
      </div>
    </>
  );
};

export default ProductFilterSection;
