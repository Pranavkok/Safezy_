'use server';

import { ERROR_MESSAGES, SUCCESS_MESSAGES } from '@/constants/constants';
import { getUserIdFromAuth } from '../user';
import { createClient } from '@/utils/supabase/server';
import { WishlistItemType } from '@/types/wishlist.types';

// [#] Get all wishlist items for the current user (excludes soft-deleted products)
export const getWishlistItems = async (): Promise<{
  success: boolean;
  message: string;
  data?: WishlistItemType[];
}> => {
  const supabase = await createClient();
  try {
    const userId = await getUserIdFromAuth();

    if (!userId) {
      return { success: false, message: ERROR_MESSAGES.USER_NOT_FOUND };
    }

    const { data, error } = await supabase
      .from('wishlist')
      .select(
        `
        id,
        product_id,
        created_at,
        product!inner (
          ppe_name,
          image,
          ppe_category,
          price,
          avg_rating,
          is_out_of_stock,
          is_deleted
        )
      `
      )
      .eq('user_id', userId)
      .eq('product.is_deleted', false);

    if (error) {
      return { success: false, message: ERROR_MESSAGES.WISHLIST_NOT_FETCHED };
    }

    const formattedData: WishlistItemType[] = data.map(item => ({
      id: item.id,
      productId: item.product_id,
      name: item.product?.ppe_name ?? '',
      image: item.product?.image ?? '',
      category: item.product?.ppe_category ?? '',
      price: item.product?.price ?? 0,
      avgRating: item.product?.avg_rating ?? 0,
      isOutOfStock: item.product?.is_out_of_stock ?? false,
      createdAt: item.created_at
    }));

    return {
      success: true,
      message: SUCCESS_MESSAGES.WISHLIST_FETCHED,
      data: formattedData
    };
  } catch (err) {
    console.error('Error fetching wishlist:', err);
    return { success: false, message: ERROR_MESSAGES.UNEXPECTED_ERROR };
  }
};

// [#] Get wishlist item count for the current user (lightweight — no join)
export const getWishlistCount = async (): Promise<{
  success: boolean;
  message: string;
  data?: number;
}> => {
  const supabase = await createClient();
  try {
    const userId = await getUserIdFromAuth();

    if (!userId) {
      return { success: false, message: ERROR_MESSAGES.USER_NOT_FOUND };
    }

    const { count, error } = await supabase
      .from('wishlist')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    if (error) {
      return { success: false, message: ERROR_MESSAGES.WISHLIST_NOT_FETCHED };
    }

    return {
      success: true,
      message: SUCCESS_MESSAGES.COUNT_FETCHED,
      data: count ?? 0
    };
  } catch (err) {
    console.error('Error fetching wishlist count:', err);
    return { success: false, message: ERROR_MESSAGES.UNEXPECTED_ERROR };
  }
};

// [#] Add a product to wishlist
export const addToWishlist = async (
  productId: string
): Promise<{
  success: boolean;
  message: string;
  data?: WishlistItemType;
}> => {
  const supabase = await createClient();
  try {
    const userId = await getUserIdFromAuth();

    if (!userId) {
      return { success: false, message: ERROR_MESSAGES.USER_NOT_FOUND };
    }

    const { data, error } = await supabase
      .from('wishlist')
      .insert({ user_id: userId, product_id: productId })
      .select(
        `
        id,
        product_id,
        created_at,
        product!inner (
          ppe_name,
          image,
          ppe_category,
          price,
          avg_rating,
          is_out_of_stock
        )
      `
      )
      .maybeSingle();

    // Unique constraint violation — already wishlisted, treat as success
    if (error?.code === '23505') {
      return {
        success: true,
        message: SUCCESS_MESSAGES.WISHLIST_ALREADY_ADDED
      };
    }

    if (error || !data) {
      return { success: false, message: ERROR_MESSAGES.WISHLIST_ITEM_NOT_ADDED };
    }

    const wishlistItem: WishlistItemType = {
      id: data.id,
      productId: data.product_id,
      name: data.product?.ppe_name ?? '',
      image: data.product?.image ?? '',
      category: data.product?.ppe_category ?? '',
      price: data.product?.price ?? 0,
      avgRating: data.product?.avg_rating ?? 0,
      isOutOfStock: data.product?.is_out_of_stock ?? false,
      createdAt: data.created_at
    };

    return {
      success: true,
      message: SUCCESS_MESSAGES.WISHLIST_ITEM_ADDED,
      data: wishlistItem
    };
  } catch (err) {
    console.error('Error adding to wishlist:', err);
    return { success: false, message: ERROR_MESSAGES.UNEXPECTED_ERROR };
  }
};

// [#] Remove a product from wishlist by productId
export const removeFromWishlist = async (
  productId: string
): Promise<{ success: boolean; message: string }> => {
  const supabase = await createClient();
  try {
    const userId = await getUserIdFromAuth();

    if (!userId) {
      return { success: false, message: ERROR_MESSAGES.USER_NOT_FOUND };
    }

    const { error } = await supabase
      .from('wishlist')
      .delete()
      .eq('user_id', userId)
      .eq('product_id', productId);

    if (error) {
      return {
        success: false,
        message: ERROR_MESSAGES.WISHLIST_ITEM_NOT_REMOVED
      };
    }

    return { success: true, message: SUCCESS_MESSAGES.WISHLIST_ITEM_REMOVED };
  } catch (err) {
    console.error('Error removing from wishlist:', err);
    return { success: false, message: ERROR_MESSAGES.UNEXPECTED_ERROR };
  }
};

// [#] Check if a specific product is wishlisted by the current user
export const isProductWishlisted = async (
  productId: string
): Promise<{ success: boolean; message: string; data?: boolean }> => {
  const supabase = await createClient();
  try {
    const userId = await getUserIdFromAuth();

    if (!userId) {
      return { success: true, message: '', data: false };
    }

    const { data, error } = await supabase
      .from('wishlist')
      .select('id')
      .eq('user_id', userId)
      .eq('product_id', productId)
      .maybeSingle();

    if (error) {
      return { success: false, message: ERROR_MESSAGES.WISHLIST_NOT_FETCHED };
    }

    return { success: true, message: '', data: !!data };
  } catch (err) {
    console.error('Error checking wishlist status:', err);
    return { success: false, message: ERROR_MESSAGES.UNEXPECTED_ERROR };
  }
};
