import CustomRating from '@/components/CustomRating';
import { getProductCategoryLabel } from '@/utils';
import React from 'react';

type ProductHeaderSectionPropsType = {
  ppeCategory: string;
  ppeName: string;
  description: string;
  avgRating: number;
  isOutOfStock: boolean;
};
const ProductHeaderSection = ({
  ppeCategory,
  ppeName,
  description,
  avgRating,
  isOutOfStock
}: ProductHeaderSectionPropsType) => {
  return (
    <div>
      {isOutOfStock && (
        <div className=" bg-red-600 text-white font-bold text-sm px-4 py-2 rounded-md z-30 shadow-lg opacity-100 backdrop-blur-md max-w-max mb-4">
          Out of Stock
        </div>
      )}
      <p className="text-muted-foreground text-xs">
        {ppeCategory && getProductCategoryLabel(ppeCategory)}
      </p>
      <div className="flex items-center gap-2">
        <h1 className="text-xl sm:text-2xl font-bold">{ppeName}</h1>
      </div>
      <p className="my-1 text-sm sm:text-base leading-relaxed mb-2">
        {description}
      </p>
      <CustomRating initialRating={avgRating || 5} readonly={true} size={18} />
    </div>
  );
};
export default ProductHeaderSection;
