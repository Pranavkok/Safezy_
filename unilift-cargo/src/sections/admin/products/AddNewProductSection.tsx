'use client';

import React, { useState } from 'react';
import { useForm, SubmitHandler, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  AddProductSchema,
  addProductType
} from '@/validations/admin/add-update-product';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import BasicInfoSection from './manage-product/BasicInfoSection';
import MediaUploadSection from './manage-product/MediaUploadSection';
import RecommendationsSection from './manage-product/RecommendationsSection';
import SizeSection from './manage-product/SizeSection';
import ColorSection from './manage-product/ColorSection';
import PricingSection from './manage-product/PricingSection';
import SubmitButton from './manage-product/SubmitButton';
import { uploadFile, uploadMultipleFiles } from '@/utils';
import { AppRoutes } from '@/constants/AppRoutes';
import ImageUploadSection from './manage-product/ImageUploadSection';
import { addNewProduct } from '@/actions/admin/product';

const AddNewProductSection = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const methods = useForm<addProductType>({
    resolver: zodResolver(AddProductSchema),
    defaultValues: {
      priceWithQty: [
        { id: Date.now().toString(), price: '', qtyFrom: '1', qtyTo: '' }
      ],
      leadTimeWithQty: [
        { id: Date.now().toString(), timeInDays: '', qtyFrom: '1', qtyTo: '' }
      ],
      sizes: [{ id: Date.now().toString(), size: '' }],
      colors: [{ id: Date.now().toString(), color: '' }],
      recommendedIndustryUses: [
        { id: Date.now().toString(), recommendedIndustryUse: '' }
      ]
    }
  });

  const { handleSubmit, setError } = methods;

  const onSubmit: SubmitHandler<addProductType> = async data => {
    setLoading(true);

    try {
      let uploadImages: {
        publicUrl: string;
      }[] = [];
      let videoUrl = '';

      // Upload image if provided
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

      // Upload video if provided
      if (data.trainingVideo?.[0]) {
        try {
          videoUrl = await uploadFile(
            data.trainingVideo[0],
            'product_videos',
            'videos'
          );
        } catch (error) {
          setError('trainingVideo', { message: error.message });
          throw error;
        }
      }

      const response = await addNewProduct(
        {
          ...data,
          image: uploadImages[0]?.publicUrl,
          trainingVideo: videoUrl
        },
        uploadImages
      );

      if (response.success) {
        toast.success(response.message);
        router.push(AppRoutes.ADMIN_PRODUCT_LISTING);
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      console.error('Error adding product:', error);
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid lg:grid-cols-2 lg:gap-x-4 gap-x-10">
          <BasicInfoSection isUpdateSection={false} />

          <div className="space-y-4">
            <ImageUploadSection />
            <MediaUploadSection />
          </div>
          <RecommendationsSection />
          <SizeSection />
          <ColorSection />
          <PricingSection />
        </div>
        <SubmitButton loading={loading} />
      </form>
    </FormProvider>
  );
};

export default AddNewProductSection;
