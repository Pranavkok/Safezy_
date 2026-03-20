'use server';

import { ERROR_MESSAGES, SUCCESS_MESSAGES } from '@/constants/constants';
import { getAuthId, getUserIdFromAuth } from '../user';
import { createClient } from '@/utils/supabase/server';
import { CartItemType } from '@/context/CartContext';
import { LeadTimeTiersType } from '@/types/index.types';
import type { SupabaseClient } from '@supabase/supabase-js';

async function updateCartReminderTracking(userId: string, supabase: SupabaseClient) {
  await supabase.from('cart_reminder_tracking').upsert(
    {
      user_id: userId,
      last_cart_activity: new Date().toISOString(),
      reminders_sent: 0,
      last_reminder_at: null
    },
    { onConflict: 'user_id' }
  );
}

async function resetCartReminderTracking(userId: string, supabase: SupabaseClient) {
  await supabase.from('cart_reminder_tracking').upsert(
    {
      user_id: userId,
      last_cart_activity: null,
      reminders_sent: 0,
      last_reminder_at: null
    },
    { onConflict: 'user_id' }
  );
}

// [#] Get all cart items for a specific user
export const getCartItems = async (): Promise<{
  success: boolean;
  message: string;
  data?: CartItemType[];
}> => {
  const supabase = await createClient();
  try {
    const authId = await getAuthId();

    if (!authId) {
      return {
        success: false,
        message: ERROR_MESSAGES.USER_NOT_FOUND
      };
    }

    const { data, error } = await supabase
      .from('cart_items')
      .select(
        `
                 id, 
                 quantity, 
                 product_size,
                 product_color,
                 item_price,
                 product (
                    id,
                    ppe_name, 
                    ppe_category,
                    brand_name, 
                    image, 
                    gst,
                    price_tiers ( 
                        max_quantity,
                        min_quantity,
                        price   
                    ),
                    lead_time
                ),
                users!inner(auth_id)
        `
      )
      .eq('users.auth_id', authId);

    if (error) {
      return {
        success: false,
        message: ERROR_MESSAGES.CART_ITEMS_NOT_FETCHED
      };
    }

    const formattedData: CartItemType[] = data.map(item => ({
      id: item.id,
      quantity: item.quantity,
      color: item.product_color,
      size: item.product_size,
      unitPrice: item.item_price || 0,
      gst: item.product?.gst ?? 0,
      product: {
        category: item.product?.ppe_category,
        id: item.product?.id,
        image: item.product?.image,
        name: item.product?.ppe_name,
        priceTiers: (item.product?.price_tiers || []).map(priceTier => ({
          maxQuantity: priceTier.max_quantity,
          minQuantity: priceTier.min_quantity,
          price: priceTier.price
        })),
        leadTimeTiers:
          ((item.product?.lead_time || []) as LeadTimeTiersType[]).map(
            leadTime => ({
              minQuantity: parseInt(leadTime.qtyFrom),
              maxQuantity: parseInt(leadTime.qtyTo),
              days: parseInt(leadTime.timeInDays)
            })
          ) || []
      }
    }));

    return {
      success: true,
      message: SUCCESS_MESSAGES.CART_ITEMS_FETCHED,
      data: formattedData
    };
  } catch (err) {
    console.error('Error fetching cart items:', err.message);
    return {
      success: false,
      message: ERROR_MESSAGES.UNEXPECTED_ERROR
    };
  }
};

// [#] Add items to the cart
export const addToCart = async (cartItems: {
  productId: string;
  quantity: number;
  color: string;
  size: string;
  itemPrice: number;
}): Promise<{ success: boolean; message: string; data?: CartItemType }> => {
  const supabase = await createClient();

  try {
    const { quantity, color, size, productId, itemPrice } = cartItems;

    const userId = await getUserIdFromAuth();

    if (!userId) {
      return {
        success: false,
        message: ERROR_MESSAGES.USER_NOT_FOUND
      };
    }

    const { data: insertedData, error: insertError } = await supabase
      .from('cart_items')
      .insert({
        user_id: userId,
        product_id: productId,
        product_color: color,
        product_size: size,
        quantity,
        item_price: itemPrice
      })
      .select(
        `
          id,
          quantity,
          product_size,
          product_color,
          item_price,
          product(
            id,
            ppe_name,
            ppe_category,
            image,
            gst,
            price_tiers(
              max_quantity,
              min_quantity,
              price
            ),
            lead_time
          )
        `
      )
      .maybeSingle();

    if (insertError || !insertedData) throw insertError;

    updateCartReminderTracking(userId, supabase).catch(() => {});

    const cartItemData: CartItemType = {
      id: insertedData.id,
      quantity: insertedData.quantity,
      color: insertedData.product_color,
      size: insertedData.product_size,
      unitPrice: insertedData.item_price,
      gst: insertedData.product?.gst ?? 0,
      product: {
        category: insertedData.product?.ppe_category,
        id: insertedData.product?.id,
        image: insertedData.product?.image,
        name: insertedData.product?.ppe_name,
        priceTiers: (insertedData.product?.price_tiers || []).map(data => ({
          maxQuantity: data.max_quantity,
          minQuantity: data.min_quantity,
          price: data.price
        })),
        leadTimeTiers:
          ((insertedData.product?.lead_time || []) as LeadTimeTiersType[]).map(
            leadTime => ({
              minQuantity: parseInt(leadTime.qtyFrom),
              maxQuantity: parseInt(leadTime.qtyTo),
              days: parseInt(leadTime.timeInDays)
            })
          ) || []
      }
    };

    return {
      success: true,
      message: SUCCESS_MESSAGES.CART_ITEMS_ADDED,
      data: cartItemData
    };
  } catch (error) {
    console.error('Error adding item to cart:', error);
    return {
      success: false,
      message: ERROR_MESSAGES.CART_ITEMS_NOT_ADDED
    };
  }
};

// [#] Clear all items from the cart for a specific user
export const clearCart = async () => {
  const supabase = await createClient();

  try {
    const userId = await getUserIdFromAuth();

    if (!userId) {
      return {
        success: false,
        message: ERROR_MESSAGES.USER_NOT_FOUND
      };
    }

    const { error } = await supabase
      .from('cart_items')
      .delete()
      .eq('user_id', userId);

    if (error) {
      return {
        success: false,
        message: ERROR_MESSAGES.CART_NOT_CLEARED
      };
    }

    resetCartReminderTracking(userId, supabase).catch(() => {});

    return {
      success: true,
      message: SUCCESS_MESSAGES.CART_CLEARED
    };
  } catch (err) {
    console.error('Error clearing cart:', err.message);
    return {
      success: false,
      message: ERROR_MESSAGES.UNEXPECTED_ERROR
    };
  }
};

// [#] Remove a specific item from the cart
export const removeCartItem = async (cartItemId: number) => {
  const supabase = await createClient();

  try {
    const { data: deleted, error } = await supabase
      .from('cart_items')
      .delete()
      .eq('id', cartItemId)
      .select('user_id')
      .maybeSingle();

    if (error) {
      return {
        success: false,
        message: ERROR_MESSAGES.CART_ITEM_NOT_REMOVED
      };
    }

    if (deleted?.user_id) {
      updateCartReminderTracking(deleted.user_id, supabase).catch(() => {});
    }

    return {
      success: true,
      message: SUCCESS_MESSAGES.CART_ITEMS_REMOVED
    };
  } catch (err) {
    console.error('Error removing cart item:', err.message);
    return {
      success: false,
      message: ERROR_MESSAGES.UNEXPECTED_ERROR
    };
  }
};

// [#] Update the cart items quantity
export const updateQuantity = async (
  cartItemId: number,
  updatedQuantity: number,
  updatedUnitPrice: number
): Promise<{ success: boolean; message: string }> => {
  const supabase = await createClient();
  try {
    const { data: updated, error: updateError } = await supabase
      .from('cart_items')
      .update({ quantity: updatedQuantity, item_price: updatedUnitPrice })
      .eq('id', cartItemId)
      .select('user_id')
      .maybeSingle();

    if (updateError) throw updateError;

    if (updated?.user_id) {
      updateCartReminderTracking(updated.user_id, supabase).catch(() => {});
    }

    return {
      success: true,
      message: SUCCESS_MESSAGES.CART_ITEMS_QUANTITY_UPDATED
    };
  } catch (error) {
    console.error('Error updating item quantity:', error);
    return {
      success: false,
      message: ERROR_MESSAGES.CART_ITEM_QUANTITY_NOT_UPDATED
    };
  }
};

// [#] Update the cart items price while bulk quantity changes
export const updatePrice = async (
  itemPrice: number,
  productId: string
): Promise<{ success: boolean; message: string }> => {
  const supabase = await createClient();

  try {
    const { error } = await supabase
      .from('cart_items')
      .update({ item_price: itemPrice })
      .eq('product_id', productId);

    if (error) {
      console.error('Error while updating price', error);
      return {
        success: false,
        message: ERROR_MESSAGES.ITEM_PRICE_NOT_UPDATED
      };
    }

    return {
      success: true,
      message: SUCCESS_MESSAGES.ITEM_PRICE_UPDATED
    };
  } catch (error) {
    console.error('An unexpected error occurred', error);
    return {
      success: false,
      message: ERROR_MESSAGES.UNEXPECTED_ERROR
    };
  }
};
