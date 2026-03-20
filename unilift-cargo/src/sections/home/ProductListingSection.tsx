'use client';
import { Capacitor } from '@capacitor/core';
import ProductListing from '../products/product-listing';

const ProductListingSection = () => {
  const isFromWeb = Capacitor.getPlatform() === 'web';

  return (
    <>{!isFromWeb && <ProductListing category="all" isFromHome={true} />}</>
  );
};

export default ProductListingSection;
