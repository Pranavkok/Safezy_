'use server';

import {
  addProductWithImageUrlType,
  SortedProductDataType,
  updateProductWithImageUrlType
} from '@/types/product.types';
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from '@/constants/constants';
import { revalidatePath } from 'next/cache';
import { createClient } from '@/utils/supabase/server';

// Fetch all products and fetch them by their properties too
export const fetchSortedProducts = async (
  searchQuery?: string,
  filters?: string,
  sortBy?: string,
  sortOrder?: string,
  page: number = 1,
  pageSize: number = 10
): Promise<{
  data?: SortedProductDataType[];
  success: boolean;
  message: string;
  pageCount?: number;
}> => {
  const supabase = await createClient();
  try {
    const query = supabase.rpc('get_products_with_filters', {
      p_ppe_category: filters || undefined,
      p_search_query: searchQuery || undefined,
      p_sort_by: sortBy || '',
      p_sort_order: sortOrder || 'dsc',
      p_page_size: pageSize,
      p_page: page
    });

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching sorted products', error);
      return {
        success: false,
        message: ERROR_MESSAGES.PRODUCT_NOT_FETCHED
      };
    }

    return {
      data,
      success: true,
      message: SUCCESS_MESSAGES.PRODUCT_FETCHED,
      pageCount: data[0].total_count
        ? Math.ceil(data[0].total_count / pageSize)
        : 1
    };
  } catch (err) {
    console.error(
      'Unexpected error occurred while fetching sorted products',
      err
    );
    return {
      success: false,
      message: ERROR_MESSAGES.UNEXPECTED_ERROR
    };
  }
};

// Add new product
export const addNewProduct = async (
  product: addProductWithImageUrlType,
  uploadImages: { publicUrl: string }[]
): Promise<{ success: boolean; message: string }> => {
  const supabase = await createClient();

  try {
    const newProduct = {
      ppe_category: product.category,
      sub_category: product.subCategory,
      ppe_name: product.productName,
      product_ID: product.productId,
      description: product.productDescription,
      brand_name: product.brandName,
      image: product.image,
      size: product.sizes,
      color: product.colors,
      use_life: parseInt(product.recommendedUseLife),
      industry_use: product.recommendedIndustryUses,
      training_video: product.trainingVideo,
      price: product.priceWithQty[0]?.price
        ? Number(product.priceWithQty[0].price)
        : undefined,
      lead_time: product.leadTimeWithQty,
      gst: parseFloat(product.gst || '0'),
      hsn_code: product.hsn_code,
      geographical_location: product.geographicalLocation
    };

    const { data: productDataResponse, error: productError } = await supabase
      .from('product')
      .insert(newProduct)
      .select()
      .single();

    if (productError) {
      console.error('Error adding product:', productError);
      return {
        success: false,
        message: ERROR_MESSAGES.PRODUCT_NOT_ADDED
      };
    }
    const productId = productDataResponse.id;

    const productImages = uploadImages.map(image => {
      return {
        image_url: image.publicUrl,
        product_id: productId
      };
    });

    const { error: productImageError } = await supabase
      .from('images')
      .insert(productImages);
    if (productImageError) {
      console.error('Error adding product images:', productImageError);
      return {
        success: false,
        message: ERROR_MESSAGES.PRODUCT_IMAGE_NOT_ADDED
      };
    }

    const formattedTiers = product.priceWithQty.map(
      (tier: {
        id: string;
        qtyFrom?: string;
        qtyTo?: string;
        price?: string;
      }) => ({
        product_id: productId,
        min_quantity: Number(tier.qtyFrom) || 0,
        max_quantity: Number(tier.qtyTo) || 0,
        price: Number(tier.price) || 0
      })
    );

    const { error: tiersError } = await supabase
      .from('price_tiers')
      .insert(formattedTiers);

    if (tiersError) {
      console.error('Error adding price tiers:', tiersError);
      return {
        success: false,
        message: ERROR_MESSAGES.PRICE_TIERS_NOT_ADDED
      };
    }

    revalidatePath('/admin');

    return {
      success: true,
      message: SUCCESS_MESSAGES.PRODUCT_ADDED
    };
  } catch (err) {
    console.error('Unexpected error adding product:', err);
    return {
      success: false,
      message: ERROR_MESSAGES.UNEXPECTED_ERROR
    };
  }
};

// Update existing product
export const updateProduct = async (
  product: updateProductWithImageUrlType,
  productId: string,
  uploadImages: { publicUrl: string }[]
): Promise<{ success: boolean; message: string }> => {
  const supabase = await createClient();

  try {
    const updatedProduct = {
      ppe_category: product.category,
      ppe_name: product.productName,
      sub_category: product.subCategory,
      product_ID: product.productId,
      description: product.productDescription,
      brand_name: product.brandName,
      size: product.sizes,
      color: product.colors,
      use_life: parseInt(product.recommendedUseLife),
      industry_use: product.recommendedIndustryUses,
      image: product.image,
      training_video: product.trainingVideo,
      price: product.priceWithQty[0]?.price
        ? Number(product.priceWithQty[0].price)
        : undefined,
      lead_time: product.leadTimeWithQty,
      gst: parseFloat(product.gst || '0'),
      hsn_code: product.hsn_code,
      geographical_location: product.geographicalLocation,
      is_out_of_stock: product.isOutOfStock
    };

    const { error: productError } = await supabase
      .from('product')
      .update(updatedProduct)
      .eq('id', productId)
      .select()
      .maybeSingle();

    if (productError) {
      console.error('Error updating product:', productError);
      return {
        success: false,
        message: ERROR_MESSAGES.PRODUCT_NOT_UPDATED
      };
    }

    const productImages = uploadImages.map(image => {
      return {
        image_url: image.publicUrl,
        product_id: productId
      };
    });

    const { error: productImageError } = await supabase
      .from('images')
      .insert(productImages);

    if (productImageError) {
      console.error('Error adding price tiers:', productImageError);
      return {
        success: false,
        message: ERROR_MESSAGES.PRODUCT_IMAGE_NOT_ADDED
      };
    }

    const { error: deleteError } = await supabase
      .from('price_tiers')
      .delete()
      .eq('product_id', productId);

    if (deleteError) {
      console.error('Error deleting existing price tiers:', deleteError);
      return {
        success: false,
        message: ERROR_MESSAGES.PRICE_TIERS_NOT_DELETED
      };
    }

    const formattedTiers = product.priceWithQty.map(tier => ({
      product_id: productId,
      min_quantity: Number(tier.qtyFrom) || 0,
      max_quantity: Number(tier.qtyTo) || 0,
      price: Number(tier.price) || 0
    }));

    const { error: insertError } = await supabase
      .from('price_tiers')
      .insert(formattedTiers);

    if (insertError) {
      console.error('Error inserting new price tiers:', insertError);
      return {
        success: false,
        message: ERROR_MESSAGES.PRICE_TIERS_NOT_ADDED
      };
    }

    revalidatePath('/admin');

    return {
      success: true,
      message: SUCCESS_MESSAGES.PRODUCT_UPDATED
    };
  } catch (err) {
    console.error('Unexpected error updating product:', err);
    return {
      success: false,
      message: ERROR_MESSAGES.UNEXPECTED_ERROR
    };
  }
};

// Delete a product
export const deleteProduct = async (
  id: string
): Promise<{ success: boolean; message: string }> => {
  const supabase = await createClient();
  try {
    const { error: tiersError } = await supabase
      .from('price_tiers')
      .delete()
      .eq('product_id', id);

    if (tiersError) {
      console.error('Error deleting price tiers', tiersError);
      return {
        success: false,
        message: ERROR_MESSAGES.PRODUCT_NOT_DELETED
      };
    }
    const { error: productError } = await supabase
      .from('product')
      .update({ is_deleted: true })
      .eq('id', id);

    if (productError) {
      console.error('Error deleting product', productError);
      return {
        success: false,
        message: ERROR_MESSAGES.PRODUCT_NOT_DELETED
      };
    }

    revalidatePath('/admin');

    return {
      success: true,
      message: SUCCESS_MESSAGES.PRODUCT_DELETED
    };
  } catch (err) {
    console.error('Unexpected error deleting product:', err);
    return {
      success: false,
      message: ERROR_MESSAGES.UNEXPECTED_ERROR
    };
  }
};

export const deleteProductImage = async (
  imageId: number
): Promise<{ success: boolean; message: string }> => {
  const supabase = await createClient();
  try {
    const { error: deleteError } = await supabase
      .from('images')
      .delete()
      .eq('id', imageId);

    if (deleteError) {
      console.error('Error deleting product image', deleteError);
      return {
        success: false,
        message: ERROR_MESSAGES.PRODUCT_IMAGE_NOT_DELETED
      };
    }

    revalidatePath('/admin');

    return {
      success: true,
      message: SUCCESS_MESSAGES.PRODUCT_IMAGE_DELETED
    };
  } catch (err) {
    console.error('Unexpected error deleting product image:', err);
    return {
      success: false,
      message: ERROR_MESSAGES.UNEXPECTED_ERROR
    };
  }
};
