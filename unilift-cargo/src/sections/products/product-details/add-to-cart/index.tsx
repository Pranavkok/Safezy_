'use client';

import React, { useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  // LeadTimeTiersType,
  ProductWithPriceAndImagesType
} from '@/types/index.types';
import { useCart } from '@/context/CartContext';
import ProductImageGallery from './ProductImageGallerySection';
import FetchOffersForProducts from '@/components/modals/FetchOffersForProduct';
import AvailableOffersSection from './AvailableOffersSection';
import ProductHeaderSection from './ProductHeaderSection';
import ProductVariantSection, {
  ProductColorType,
  ProductSizeType
} from './ProductVariantSection';
import {
  AddToCartSchema,
  AddToCartType
} from '@/validations/contractor/add-to-cart';
import PriceDisplaySection from './PriceDisplaySection';
import QuantitySection from './QuantitySection';
import ActionButtons from './ActionButtons';
import FullScreenComponent from '@/components/FullScreen';

const ProductAddToCartSection = ({
  productDetails
}: {
  productDetails: ProductWithPriceAndImagesType;
}) => {
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const {
    id: productId,
    ppe_name,
    ppe_category,
    price_tiers,
    size,
    color,
    description,
    image,
    images,
    is_out_of_stock,
    training_video,
    avg_rating
    // lead_time
  } = productDetails;

  const productColors = (color as ProductColorType[]) || [];
  const productSizes = (size as ProductSizeType[]) || [];

  const { addItemToCart } = useCart();

  const methods = useForm<AddToCartType>({
    resolver: zodResolver(AddToCartSchema),
    defaultValues: {
      quantity: 1
    }
  });

  const { handleSubmit, reset } = methods;

  const priceTiers = price_tiers.map(data => {
    return {
      minQuantity: data.min_quantity,
      maxQuantity: data.max_quantity,
      price: data.price
    };
  });

  const onSubmit = async (data: AddToCartType) => {
    setLoading(true);
    const selectedQuantity = data.quantity;
    const validTier = priceTiers.find(
      tier =>
        selectedQuantity >= tier.minQuantity &&
        selectedQuantity <= tier.maxQuantity
    );
    const nextHigherTier = priceTiers.find(
      tier => selectedQuantity < tier.minQuantity
    );
    const isCloseToNextTier =
      nextHigherTier && nextHigherTier.minQuantity - selectedQuantity <= 15;
    if (validTier && isCloseToNextTier) {
      setLoading(false);
      setIsModalOpen(true);
      return;
    }
    await addItemToCart({
      color: data.color,
      quantity: data.quantity,
      productId: productDetails.id,
      size: productSizes.find(s => s.id === data.size)?.size || data.size,
      priceTiers: priceTiers
    });
    reset({
      size: '',
      color: '',
      quantity: 1
    });
    setLoading(false);
  };

  const productImages = images.map(image => image.image_url);

  return (
    <FormProvider {...methods}>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col lg:flex-row gap-6"
      >
        <div className="w-full lg:w-96">
          <FullScreenComponent>
            <ProductImageGallery
              mainImage={image}
              images={productImages}
              productName={ppe_name}
              productVideo={training_video}
            />
          </FullScreenComponent>
        </div>

        <div className="lg:w-9/12 space-y-4">
          <ProductHeaderSection
            avgRating={avg_rating || 5}
            description={description}
            ppeCategory={ppe_category}
            ppeName={ppe_name}
            isOutOfStock={is_out_of_stock || false}
          />

          <div className="space-y-4">
            <PriceDisplaySection
              productId={productId}
              priceTiers={priceTiers}
            />
            <ProductVariantSection
              productColors={productColors}
              productSizes={productSizes}
            />

            <QuantitySection
            // leadTime={lead_time as LeadTimeTiersType[]}
            // productId={productId}
            />

            <div className="grid grid-cols-1 lg:grid-cols-10 items-end">
              <div className="col-span-6 lg:pr-5 3xl:pr-16">
                <AvailableOffersSection quantityRanges={price_tiers} />
              </div>

              <div className="col-span-4 flex flex-col sm:flex-row lg:flex-col 3xl:flex-row sm:flex-grow gap-3 mt-5">
                <ActionButtons
                  loading={loading}
                  isOutOfStock={is_out_of_stock || false}
                />
                <FetchOffersForProducts
                  productDetails={productDetails}
                  isOpen={isModalOpen}
                  setIsOpen={setIsModalOpen}
                />
              </div>
            </div>
          </div>
        </div>
      </form>
    </FormProvider>
  );
};

export default ProductAddToCartSection;
