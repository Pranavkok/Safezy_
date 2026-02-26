'use client';

import React, { useState } from 'react';
import { useForm, SubmitHandler, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  UpdateProductSchema,
  updateProductType
} from '@/validations/admin/add-update-product';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import {
  LeadTimeTiersType,
  PriceTiersType,
  ProductWithPriceAndImagesType
} from '@/types/index.types';
import { AppRoutes } from '@/constants/AppRoutes';
import BasicInfoSection from './manage-product/BasicInfoSection';
import MediaUploadSection from './manage-product/MediaUploadSection';
import RecommendationsSection from './manage-product/RecommendationsSection';
import SizeSection from './manage-product/SizeSection';
import ColorSection from './manage-product/ColorSection';
import PricingSection from './manage-product/PricingSection';
import SubmitButton from './manage-product/SubmitButton';
import { uploadFile, uploadMultipleFiles } from '@/utils';
import ImageUploadSection from './manage-product/ImageUploadSection';
import { updateProduct } from '@/actions/admin/product';

const UpdateProductDetailsSection = ({
  productDetails
}: {
  productDetails: ProductWithPriceAndImagesType;
}) => {
  const router = useRouter();

  const [loading, setLoading] = useState(false);

  const methods = useForm<updateProductType>({
    resolver: zodResolver(UpdateProductSchema),
    defaultValues: {
      productName: productDetails.ppe_name,
      category: productDetails.ppe_category,
      subCategory: productDetails?.sub_category ?? '',
      productId: productDetails.product_ID as string,
      brandName: productDetails.brand_name,
      productDescription: productDetails.description,
      trainingVideo: productDetails.training_video,
      recommendedUseLife: (productDetails?.use_life || '').toString(),
      recommendedIndustryUses: productDetails.industry_use as {
        id: string;
        size: string;
      }[],
      priceWithQty: productDetails.price_tiers.map(
        (priceWithQty: PriceTiersType) => {
          return {
            id: priceWithQty.id.toString(),
            price: priceWithQty.price.toString(),
            qtyFrom: priceWithQty.min_quantity.toString(),
            qtyTo: priceWithQty.max_quantity.toString()
          };
        }
      ),
      leadTimeWithQty: productDetails.lead_time
        ? (productDetails.lead_time as LeadTimeTiersType[]).map(
            leatTimeWithQty => {
              return {
                id: leatTimeWithQty.id.toString(),
                timeInDays: leatTimeWithQty.timeInDays.toString(),
                qtyFrom: leatTimeWithQty.qtyFrom?.toString(),
                qtyTo: leatTimeWithQty.qtyTo?.toString()
              };
            }
          )
        : [],
      sizes: productDetails.size as { id: string; size: string }[],
      colors: productDetails.color as { id: string; color: string }[],
      gst: productDetails.gst?.toString() ?? undefined,
      hsn_code: productDetails.hsn_code ?? '',
      geographicalLocation: productDetails.geographical_location as string[],
      isOutOfStock: productDetails.is_out_of_stock || undefined
    }
  });

  const { handleSubmit, setError } = methods;

  const onSubmit: SubmitHandler<updateProductType> = async data => {
    setLoading(true);

    try {
      for (let i = 0; i < data.priceWithQty.length; i++) {
        const current = data.priceWithQty[i];
        const prev = data.priceWithQty[i - 1];

        const qtyFrom = parseInt(current.qtyFrom || '0', 10);
        const qtyTo = parseInt(current.qtyTo || '0', 10);
        const price = parseFloat(current.price || '0');
        const prevPrice = prev
          ? parseFloat(prev.price || '0')
          : Number.MAX_VALUE;

        if (!qtyTo || qtyTo <= qtyFrom) {
          setError(`priceWithQty.${i}.qtyTo`, {
            type: 'custom',
            message: 'Max Qty must be greater than Min Qty'
          });
          throw new Error(
            'Invalid price range: Max Qty must be greater than Min Qty.'
          );
        }

        if (price >= prevPrice) {
          setError(`priceWithQty.${i}.price`, {
            type: 'custom',
            message: 'Price must be lower than the previous range'
          });
          throw new Error(
            'Invalid price range: Price must decrease as quantity increases.'
          );
        }
      }

      for (let i = 0; i < data.leadTimeWithQty.length; i++) {
        const current = data.leadTimeWithQty[i];

        const qtyFrom = parseInt(current.qtyFrom || '0', 10);
        const qtyTo = parseInt(current.qtyTo || '0', 10);

        if (!qtyTo || qtyTo <= qtyFrom) {
          setError(`leadTimeWithQty.${i}.qtyTo`, {
            type: 'custom',
            message: 'Max Qty must be greater than Min Qty'
          });
          throw new Error(
            'Invalid lead time range: Max Qty must be greater than Min Qty.'
          );
        }
      }

      let uploadImages: {
        publicUrl: string;
      }[] = [];

      let videoUrl = productDetails.training_video;

      if (data.image) {
        try {
          uploadImages = await uploadMultipleFiles(
            data.image,
            'product_images',
            'images'
          );
        } catch (error) {
          setError('image', { message: error.message });
          throw error;
        }
      }

      if (
        data.trainingVideo &&
        Array.isArray(data.trainingVideo) &&
        data.trainingVideo[0] instanceof File
      ) {
        try {
          const uploadedVideoUrl = await uploadFile(
            data.trainingVideo[0],
            'product_videos',
            'videos'
          );
          if (uploadedVideoUrl) {
            videoUrl = uploadedVideoUrl;
          }
        } catch (error) {
          setError('trainingVideo', { message: error.message });
          throw error;
        }
      }

      const response = await updateProduct(
        {
          ...data,
          image: uploadImages[0]?.publicUrl || productDetails.image,
          trainingVideo: videoUrl
        },
        productDetails.id,
        uploadImages
      );

      if (response.success) {
        // toast.success(response.message);
        router.push(AppRoutes.ADMIN_PRODUCT_LISTING);
      } else {
        throw new Error(response.message);
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid lg:grid-cols-2 lg:gap-x-4 gap-x-10">
          <BasicInfoSection isUpdateSection />

          <div className="space-y-4">
            <ImageUploadSection prevImages={productDetails.images} />
            <MediaUploadSection />
          </div>
          <RecommendationsSection
            defaultGeographicalLocation={
              (productDetails.geographical_location as string[]) || []
            }
          />
          <SizeSection />
          <ColorSection />
          <PricingSection />
        </div>
        <SubmitButton isUpdate loading={loading} />
      </form>
    </FormProvider>
  );
};

export default UpdateProductDetailsSection;
