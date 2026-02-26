import React from 'react';
import NavigationBreadcrumbs from '@/components/NavigationBreadcrumbs';
import ProductAddToCartSection from './add-to-cart';
import ProductFeaturesSection from './ProductFeaturesSection';
import RelatedProductSection from './RelatedProductSection';
import {
  ProductType,
  ProductWithPriceAndImagesType
} from '@/types/index.types';
import BackButtonHeader from '@/components/BackButton';
import ProductReviewSection from './ProductReviewSection';
import { PRODUCT_CATEGORIES } from '@/constants/product';

const ProductDetailsSection = ({
  productDetails,
  relatedProducts
}: {
  productDetails: ProductWithPriceAndImagesType;
  relatedProducts: Partial<ProductType>[];
}) => {
  const formattedCategory =
    PRODUCT_CATEGORIES.find(c => c.value === productDetails.ppe_category)
      ?.label || 'Product Details';

  const breadcrumbItems = [
    { label: 'Home', route: '/' },
    { label: 'Products', route: '/products' },
    { label: formattedCategory, route: '#' }
  ] as const;

  return (
    <div className=" flex flex-col ">
      <div className="w-[95vw] sm:w-[90vw] mx-auto space-y-4">
        <div className="flex gap-1  my-5 h-14 lg:h-16 rounded items-center">
          <BackButtonHeader />
          <div className=" bg-white flex h-full w-full  flex-col justify-center px-4">
            <h1 className="font-bold uppercase text-sm lg:text-xl">Products</h1>
            <NavigationBreadcrumbs breadcrumbOptions={breadcrumbItems} />
          </div>
        </div>

        <div className="bg-white rounded shadow-sm p-4 sm:p-6">
          <ProductAddToCartSection productDetails={productDetails} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12  gap-4  ">
          <div className="lg:col-span-8 bg-white    rounded shadow-sm">
            <ProductFeaturesSection productDetails={productDetails} />
          </div>

          <div className=" lg:col-span-4  bg-white rounded shadow-sm  p-4 sm:p-6 ">
            <RelatedProductSection relatedProducts={relatedProducts} />
          </div>
        </div>

        <div className="mb-5">
          <ProductReviewSection
            averageRating={productDetails.avg_rating ?? 5}
            productId={productDetails.id}
          />
        </div>
      </div>
    </div>
  );
};

export default ProductDetailsSection;
