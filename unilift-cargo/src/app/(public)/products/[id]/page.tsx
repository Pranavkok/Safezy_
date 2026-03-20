import React from 'react';
import ProductDetailsSection from '@/sections/products/product-details';
import { notFound } from 'next/navigation';
import {
  getProductByCategory,
  getProductById
} from '@/actions/contractor/product';
import { Metadata } from 'next';
import { fetchProductMetadataById } from '@/actions/metadata';

export async function generateMetadata({
  params
}: {
  params: { id: string };
}): Promise<Metadata> {
  return await fetchProductMetadataById(params.id);
}

const ProductDetailsPage = async ({
  params
}: {
  params: {
    id: string;
  };
}) => {
  const productId = params.id;

  const { data: productDetails } = await getProductById(productId);

  if (!productDetails) {
    notFound();
  }

  const { data: relatedProducts } = await getProductByCategory(
    productDetails.ppe_category,
    productDetails.id
  );

  return (
    <ProductDetailsSection
      productDetails={productDetails}
      relatedProducts={relatedProducts}
    />
  );
};

export default ProductDetailsPage;
