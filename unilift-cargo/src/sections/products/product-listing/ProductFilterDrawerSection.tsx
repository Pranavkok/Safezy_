import { Button } from '@/components/ui/button';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger
} from '@/components/ui/drawer';
import { Filter } from 'lucide-react';
import ProductFilterSection from './ProductFilterSection';
import { ProductFilterType } from '@/validations/product/product-filter';
import { Dispatch, SetStateAction } from 'react';

const ProductFilterDrawerSection = ({
  filter,
  setFilter,
  _debouncedSubmit
}: {
  filter: ProductFilterType;
  setFilter: Dispatch<SetStateAction<ProductFilterType>>;
  _debouncedSubmit: () => void;
}) => {
  return (
    <div className="lg:hidden">
      <Drawer>
        <DrawerTrigger asChild>
          <Button
            variant="outline"
            className="flex items-center gap-2 w-auto bg-white hover:bg-gray-50 px-4"
          >
            <Filter className="h-4 w-4" />
          </Button>
        </DrawerTrigger>

        <DrawerContent className="bg-white lg:hidden">
          <div className="mx-auto w-full max-w-lg px-4">
            <DrawerHeader className="px-0">
              <DrawerTitle className="text-lg font-semibold">
                Filter Products
              </DrawerTitle>
              <p className="text-sm text-gray-500 mt-1">
                Refine your search with specific criteria
              </p>
              <div className="h-px bg-gray-200 mt-4" />
            </DrawerHeader>

            {/* Scrollable content with padding for better spacing */}
            <div className="h-[65vh] overflow-y-auto px-0 pb-4 ">
              <ProductFilterSection
                filter={filter}
                setFilter={setFilter}
                _debouncedSubmit={_debouncedSubmit}
              />
            </div>

            {/* Footer with apply button */}
            <DrawerFooter className="px-0 pt-4 border-t border-gray-200">
              <div className="flex gap-3">
                <DrawerClose asChild>
                  <Button variant="outline" className="flex-1">
                    Cancel
                  </Button>
                </DrawerClose>
                <DrawerClose asChild>
                  <Button className="flex-1 text-sm capitalize">
                    Apply Filters
                  </Button>
                </DrawerClose>
              </div>
            </DrawerFooter>
          </div>
        </DrawerContent>
      </Drawer>
    </div>
  );
};

export default ProductFilterDrawerSection;
