'use client';
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { ProductType } from '@/types/index.types';
import { getProductCategoryLabel } from '@/utils';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

interface RelatedProductProps {
  name: string;
  price: number;
  image: string;
  category: string;
}

const RelatedProduct = ({
  name,
  price,
  image,
  category
}: RelatedProductProps) => {
  return (
    <CardContent className="p-2 flex gap-3 sm:gap-4">
      <Image
        src={image}
        alt={name}
        height={640}
        width={640}
        className="h-16 w-16 sm:h-20 sm:w-20 object-fit object-center rounded transition-transform hover:scale-105"
      />

      <div className="flex flex-col">
        <h3 className="font-medium text-sm sm:text-base">{name}</h3>
        <p className="text-xs text-muted-foreground mb-2">
          {getProductCategoryLabel(category)}
        </p>
        <p className="text-sm sm:text-base">₹{price.toLocaleString()}</p>
      </div>
    </CardContent>
  );
};

const RelatedProductSection = ({
  relatedProducts
}: {
  relatedProducts: Partial<ProductType>[];
}) => {
  const router = useRouter();

  return (
    <>
      <h2 className="text-lg sm:text-xl font-semibold mb-4 sm:mb-6">
        Related Products
      </h2>
      <div className="grid grid-cols-1 gap-3 overflow-y-auto max-h-80 scrollbar-hide">
        {relatedProducts?.map(product => {
          if (!product.id || !product.ppe_name || !product.price) return null;

          return (
            <Card
              key={product.id}
              onClick={() => router.push(`/products/${product.id}`)}
              className="cursor-pointer transition-shadow hover:shadow-sm"
            >
              <RelatedProduct
                name={product.ppe_name}
                price={product.price}
                image={product.image || ''}
                category={product.ppe_category || ''}
              />
            </Card>
          );
        })}
      </div>
    </>
  );
};
export default RelatedProductSection;
