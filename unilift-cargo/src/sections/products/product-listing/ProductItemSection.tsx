'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import CustomRating from '@/components/CustomRating';
import Image from 'next/image';
import { getProductCategoryLabel } from '@/utils';
import { ProductType } from '@/types/index.types';
import { ArrowRight } from 'lucide-react';
import { Capacitor } from '@capacitor/core';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

type ColorType = {
  id: string;
  color: string;
};

type ProductItemPropsType = {
  product: Partial<ProductType>;
};

const ProductItemSection: React.FC<ProductItemPropsType> = ({ product }) => {
  const router = useRouter();

  const {
    id,
    image = '',
    ppe_name = '',
    ppe_category,
    price,
    color,
    avg_rating = 5
  } = product;

  const productColors = (color as ColorType[]) || [];

  return (
    <Link
      href={`/products/${id}`}
      className={`relative bg-white rounded-lg overflow-hidden shadow-lg hover:shadow-2xl transition-shadow duration-300 ease-in-out p-4 cursor-pointer ${Capacitor.getPlatform() !== 'web' && 'min-w-full'}`}
    >
      {product.is_out_of_stock && (
        <div className="absolute top-2 left-2 bg-red-600 text-white font-bold text-sm px-3 py-1 rounded-md z-30 shadow-lg opacity-100 backdrop-blur-md mb-2">
          Out of Stock
        </div>
      )}

      {/* Product Image */}
      <div className="relative w-full h-40 sm:h-56 xl:h-52 2xl:h-56 bg-white">
        <Image
          src={image}
          alt={ppe_name}
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          fill
          className="object-contain object-center rounded"
          priority
        />
      </div>

      {/* Product Details */}
      <div className="mt-4 space-y-2 flex flex-col justify-end">
        {/* Title and Category */}
        <div className="flex flex-col">
          <h3
            className="font-semibold text-lg text-gray-900 line-clamp-2"
            style={{ textTransform: 'capitalize' }}
          >
            {ppe_name
              .split(' ')
              .map(
                word =>
                  word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
              )
              .join(' ')}{' '}
          </h3>
          <p className="text-sm text-gray-600 mb-2">
            {ppe_category && getProductCategoryLabel(ppe_category)}
          </p>

          {productColors.length > 0 && (
            <div className="flex gap-2">
              {productColors.map(({ id, color }) => (
                <div
                  key={id}
                  className="w-4 h-4 rounded-full border border-gray-300"
                  style={{ backgroundColor: color }}
                  aria-label={`Color: ${color}`}
                />
              ))}
            </div>
          )}
        </div>

        {/* Product Information */}
        <div className="flex flex-col xs:flex-row  xs:justify-between xs:items-end lg:flex-col lg:items-start 2xl:flex-row 2xl:items-end mb-4 gap-4 ">
          <div className="space-y-2 ">
            {/* Price */}
            {price && (
              <p className="text-xl md:text-2xl font-bold text-gray-800">
                ₹{price}
              </p>
            )}

            {/* Rating */}
            <CustomRating
              size={18}
              initialRating={avg_rating as number}
              readonly
            />
          </div>

          {/* Call to Action */}
          <Button
            onClick={() => {
              router.push(`/products/${id}`);
            }}
            className="px-4 py-2 text-sm capitalize"
            aria-label="Add to cart"
          >
            View Product <ArrowRight className="font-bold " />
          </Button>
        </div>
      </div>
    </Link>
  );
};

export default ProductItemSection;
