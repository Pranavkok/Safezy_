import { ProductWithPriceTiersType } from '@/types/index.types';
import { getProductBrandLabel } from '@/utils';
import React, { ReactNode } from 'react';

interface ProductFeatureProps {
  label: string;
  value: ReactNode;
}

const ProductFeature = ({ label, value }: ProductFeatureProps) => (
  <div className="flex text-sm sm:text-md flex-col sm:flex-row sm:items-center ">
    <span className="font-semibold w-full sm:w-52 whitespace-nowrap">
      {label}:
    </span>
    <span className="mt-1 sm:mt-0">{value}</span>
  </div>
);

type ColorType = {
  id: string;
  color: string;
};
type SizeType = {
  id: string;
  size: string;
};

type IndustryUseType = {
  id: string;
  recommendedIndustryUse: string;
};

const ProductFeaturesSection = ({
  productDetails
}: {
  productDetails: ProductWithPriceTiersType;
}) => {
  const { size, color, industry_use, use_life, brand_name, gst, hsn_code } =
    productDetails;

  const productColors = (color as ColorType[]) || [];
  const industryUses = (industry_use as IndustryUseType[]) || [];
  const productSizes = (size as SizeType[]) || [];

  return (
    <>
      <div>
        <p className="px-4 sm:px-6 py-4 font-medium">
          Features and Description
        </p>
      </div>
      <hr />
      <div className="space-y-4 p-4 sm:p-6">
        <ProductFeature
          label="Brand Name"
          value={
            <div className=" w-fit h-8 px-4 rounded-full bg-primary flex justify-center items-center text-white">
              {getProductBrandLabel(brand_name ?? '')}
            </div>
          }
        />
        <ProductFeature
          label="Size "
          value={
            <div className="flex gap-2 flex-wrap">
              {productSizes.map(data => (
                <div
                  key={data.id}
                  className="w-fit h-8 px-4 rounded-full bg-primary flex justify-center items-center text-white whitespace-nowrap"
                >
                  {data.size}
                </div>
              ))}
            </div>
          }
        />
        <ProductFeature
          label="Color"
          value={
            <div className="flex gap-2 flex-wrap">
              {productColors?.map(data => (
                <div
                  key={data.id}
                  className="w-8 h-8 rounded-full ring-1 ring-gray-200"
                  style={{ backgroundColor: data.color }}
                />
              ))}
            </div>
          }
        />

        {gst && (
          <ProductFeature
            label="Gst"
            value={
              <div className=" w-fit h-8 px-4 rounded-full bg-primary flex justify-center items-center text-white">
                {gst + '%' || '-'}
              </div>
            }
          />
        )}

        {hsn_code && (
          <ProductFeature
            label="HSN Code"
            value={
              <div className=" w-fit  h-8 px-4 rounded-full bg-primary flex justify-center items-center text-white">
                {hsn_code || '-'}
              </div>
            }
          />
        )}

        {use_life && (
          <ProductFeature
            label="Recommended Use Life"
            value={
              <div className=" w-fit  h-8 px-4 rounded-full bg-primary flex justify-center items-center text-white">
                {use_life + ' Months'}
              </div>
            }
          />
        )}
        <ProductFeature
          label="Recommended Industry Use"
          value={
            <div className="flex gap-2 flex-wrap">
              {industryUses.map(data => (
                <div
                  key={data.id}
                  className="w-fit h-8 px-4 rounded-full bg-primary flex justify-center items-center text-white"
                >
                  {data.recommendedIndustryUse}
                </div>
              ))}
            </div>
          }
        />
      </div>
    </>
  );
};

export default ProductFeaturesSection;
