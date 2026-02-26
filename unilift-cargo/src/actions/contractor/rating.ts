'use server';

import { ERROR_MESSAGES, SUCCESS_MESSAGES } from '@/constants/constants';
import { createClient } from '@/utils/supabase/server';
import { getUserIdFromAuth } from '../user';
import { ProductFeedback } from '@/components/modals/contractor/ProductRating';
import { RatingType } from '@/types/rating.types';

// Add product feedback
export const addProductFeedback = async (
  feedbackList: ProductFeedback[],
  orderId: string
) => {
  const supabase = await createClient();

  try {
    const userId = await getUserIdFromAuth();

    if (!userId) {
      return {
        success: false,
        message: ERROR_MESSAGES.USER_NOT_FOUND
      };
    }

    const newRatings = feedbackList.map(
      ({ rating, description, productId }) => ({
        rating,
        description: description || null,
        user_id: userId,
        product_id: productId,
        order_id: orderId
      })
    );

    const [ratingResult, orderResult] = await Promise.all([
      supabase.from('product_rating').insert(newRatings).select(),
      supabase
        .from('order')
        .update({ is_feedback_added: true })
        .eq('id', orderId)
    ]);

    if (ratingResult.error) {
      console.error(
        'Failed to add product ratings:',
        ratingResult.error.message
      );
      return {
        success: false,
        message: ERROR_MESSAGES.RATING_NOT_ADDED
      };
    }

    if (orderResult.error) {
      console.error(
        'Failed to update order status:',
        orderResult.error.message
      );
      return {
        success: false,
        message: ERROR_MESSAGES.ORDER_NOT_UPDATED
      };
    }

    return {
      success: true,
      message: SUCCESS_MESSAGES.RATING_ADDED,
      data: ratingResult.data
    };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';
    console.error('Critical error in product feedback:', errorMessage);
    return {
      success: false,
      message: ERROR_MESSAGES.UNEXPECTED_ERROR
    };
  }
};

export const fetchProductsForFeedback = async (): Promise<{
  success: boolean;
  message: string;
  data: {
    productsForFeedbacks: {
      id: string;
      name: string;
      image: string;
    }[];
    orderId?: string;
  };
}> => {
  const supabase = await createClient();

  try {
    const userId = await getUserIdFromAuth();

    if (!userId) {
      return {
        data: { productsForFeedbacks: [] },
        success: false,
        message: ERROR_MESSAGES.USER_NOT_FOUND
      };
    }

    const { data: orderData, error: orderError } = await supabase
      .from('order')
      .select('id')
      .eq('user_id', userId)
      .eq('is_feedback_added', false)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (orderError || !orderData) {
      return {
        data: { productsForFeedbacks: [] },
        success: false,
        message: ERROR_MESSAGES.ORDER_NOT_FOUND
      };
    }

    const orderId = orderData.id;

    const { data, error } = await supabase
      .from('order_items')
      .select('product(id, ppe_name, image)')
      .eq('order_id', orderId);

    if (error) {
      console.error('Error while fetching products for feedback', error);
      return {
        data: { productsForFeedbacks: [] },

        success: false,
        message: ERROR_MESSAGES.ORDER_ITEMS_NOT_FETCHED
      };
    }

    const productsForFeedbacks = data.map(product => {
      return {
        id: product.product?.id || '',
        name: product.product?.ppe_name || '',
        image: product.product?.image || ''
      };
    });

    return {
      success: true,
      message: SUCCESS_MESSAGES.ORDER_ITEMS_FETCHED,
      data: { productsForFeedbacks: productsForFeedbacks, orderId: orderId }
    };
  } catch (error) {
    console.error(
      'An unexpected error occurred while fetching products for feedback',
      error
    );
    return {
      data: { productsForFeedbacks: [] },
      success: false,
      message: ERROR_MESSAGES.UNEXPECTED_ERROR
    };
  }
};

export const getProductReviews = async (
  productId: string,
  page = 1,
  pageSize = 10
): Promise<{
  success: boolean;
  message: string;
  data?: RatingType[];
  count?: number;
}> => {
  const supabase = await createClient();

  try {
    const from = (page - 1) * pageSize;

    const { data, error, count } = await supabase
      .from('product_rating')
      .select(
        `
        id,
        rating,
        description,
        created_at,
        users(
          first_name,
          last_name
        )
        `,
        { count: 'exact' }
      )
      .eq('product_id', productId)
      .order('created_at', { ascending: false })
      .range(from, from + pageSize - 1);

    if (error) {
      console.error('Failed to fetch product reviews', error);
      return {
        success: false,
        message: ERROR_MESSAGES.PRODUCT_REVIEWS_NOT_FETCHED
      };
    }

    const reviews: RatingType[] = data.map(review => ({
      id: review.id,
      firstName: review.users?.first_name || '',
      lastName: review.users?.last_name || '',
      rating: review.rating,
      reviewDate: review.created_at,
      reviewText: review.description || ''
    }));

    return {
      success: true,
      message: SUCCESS_MESSAGES.PRODUCT_REVIEWS_FETCHED,
      data: reviews,
      count: count || 0
    };
  } catch (error) {
    console.error('Unexpected error in fetching product reviews', error);
    return {
      success: false,
      message: ERROR_MESSAGES.UNEXPECTED_ERROR
    };
  }
};
