'use server';

import { ProductQueryParams, SearchResultType } from '@/types/product.types';
import {
  ProductType,
  ProductWithPriceAndImagesType
} from '@/types/index.types';
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from '@/constants/constants';
import { createClient } from '@/utils/supabase/server';
import { getUserIdFromAuth } from '../user';
import { PRODUCT_CATEGORIES } from '@/constants/product';

// Filters and sorting for product listing main page
export const fetchProducts = async ({
  searchQuery,
  filters,
  sortBy,
  page = 1,
  pageSize = 10
}: ProductQueryParams): Promise<{
  data?: Partial<ProductType>[];
  success: boolean;
  message: string;
  count?: number;
}> => {
  const supabase = await createClient();

  try {
    const query = supabase
      .from('product')
      .select(
        'id,ppe_name,ppe_category,color,price,avg_rating,image,is_out_of_stock,sub_category',
        {
          count: 'exact'
        }
      )
      .eq('is_deleted', false);

    if (filters) {
      const {
        ppeCategory,
        color,
        minPrice,
        maxPrice,
        rating,
        geographicalLocation,
        subcategory,
        brand
      } = filters;

      if (ppeCategory?.length && !ppeCategory.includes('all')) {
        query.in('ppe_category', ppeCategory);
      }

      if (subcategory.length > 0) {
        query.in('sub_category', subcategory);
      }

      if (color) {
        query.eq('color', color);
      }

      if (minPrice && maxPrice) {
        query.gte('price', minPrice).lte('price', maxPrice);
      }

      if (rating) {
        query.gte('avg_rating', rating);
      }

      if (geographicalLocation) {
        query.contains('geographical_location', geographicalLocation);
      }

      if (brand) {
        query.eq('brand_name', brand);
      }
    }

    if (searchQuery?.trim()) {
      query.or(`ppe_name.ilike.%${searchQuery.trim()}%`);
    }

    if (sortBy) {
      const isAscending = sortBy === 'price-asc';
      if (sortBy.startsWith('price-')) {
        query.order('price', { ascending: isAscending });
      }
    }

    const from = (page - 1) * pageSize;
    query.range(from, from + pageSize - 1);

    const { data, error, count } = await query;

    if (error) {
      throw new Error(`Error fetching products: ${error.message}`);
    }

    return {
      data,
      count: count || 0,
      success: true,
      message: SUCCESS_MESSAGES.PRODUCT_FETCHED
    };
  } catch (error) {
    console.error('Product fetch error:', error);
    return {
      success: false,
      message:
        error instanceof Error ? error.message : ERROR_MESSAGES.UNEXPECTED_ERROR
    };
  }
};

// Related Products
export const getProductByCategory = async (
  ppeCategory: string,
  productId: string
): Promise<{
  data: Partial<ProductType>[];
  success: boolean;
  message: string;
}> => {
  const supabase = await createClient();

  try {
    const { data, error } = await supabase
      .from('product')
      .select('id, ppe_name, ppe_category, price, image')
      .eq('ppe_category', ppeCategory)
      .neq('id', productId)
      .eq('is_deleted', false)
      .limit(10);

    if (error) {
      console.error('Error fetching related products', error);
      return {
        data: [],
        success: false,
        message: ERROR_MESSAGES.PRODUCT_NOT_FETCHED
      };
    }

    return {
      data: data ?? [],
      success: true,
      message: SUCCESS_MESSAGES.PRODUCT_FETCHED
    };
  } catch (err) {
    console.error(
      'Unexpected error occurred while fetching sorted products:',
      err
    );
    return {
      data: [],
      success: false,
      message: ERROR_MESSAGES.UNEXPECTED_ERROR
    };
  }
};

export const fetchProductsByUserLocation = async ({
  page = 1,
  pageSize = 10
}: {
  page?: number;
  pageSize?: number;
}): Promise<{
  data?: Partial<ProductType>[];
  success: boolean;
  message: string;
  count?: number;
}> => {
  const supabase = await createClient();

  try {
    const userId = await getUserIdFromAuth();

    if (!userId) {
      throw new Error('User not authenticated');
    }

    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('geographical_location')
      .eq('id', userId)
      .single();

    if (userError) {
      throw new Error(`Error fetching user location: ${userError.message}`);
    }

    if (
      !userData?.geographical_location ||
      (userData.geographical_location as string[]).length === 0
    ) {
      return {
        success: false,
        message: 'User location not found'
      };
    }

    const query = supabase
      .from('product')
      .select('id,ppe_name,ppe_category,color,price,avg_rating,image', {
        count: 'exact'
      })
      .eq('is_deleted', false);

    const locationFilters = (userData.geographical_location as string[]).map(
      location => `geographical_location.cs.{${location}}`
    );
    query.or(locationFilters.join(','));

    const from = (page - 1) * pageSize;
    query.range(from, from + pageSize - 1);

    const { data: products, error: productsError, count } = await query;

    if (productsError) {
      throw new Error(`Error fetching products: ${productsError.message}`);
    }

    return {
      data: products,
      count: count ?? 0,
      success: true,
      message: SUCCESS_MESSAGES.PRODUCT_FETCHED
    };
  } catch (error) {
    console.error('Product fetch error:', error);
    return {
      success: false,
      message:
        error instanceof Error ? error.message : ERROR_MESSAGES.UNEXPECTED_ERROR
    };
  }
};

// Function to get a product by its ID (Admin , Contractor)
export const getProductById = async (
  productId: string
): Promise<{
  success: boolean;
  message: string;
  data?: ProductWithPriceAndImagesType | null | undefined;
}> => {
  const supabase = await createClient();
  try {
    const { data, error } = await supabase
      .from('product')
      .select('*, price_tiers(*), images(id, image_url)')
      .eq('id', productId)
      .maybeSingle();

    if (error) {
      console.error('Error fetching product by ID:', error.message);
      return {
        success: false,
        message: ERROR_MESSAGES.PRODUCT_NOT_FETCHED
      };
    }

    return {
      success: true,
      message: SUCCESS_MESSAGES.PRODUCT_FETCHED,
      data
    };
  } catch (err) {
    console.error('Unexpected error fetching product by ID:', err);
    return {
      success: false,
      message: ERROR_MESSAGES.UNEXPECTED_ERROR
    };
  }
};

export const searchProductNavbar = async (
  searchQuery: string
): Promise<{
  success: boolean;
  message: string;
  data?: SearchResultType[];
}> => {
  const supabase = await createClient();

  try {
    let productQuery = supabase
      .from('product')
      .select(`id, ppe_name, ppe_category`)
      .eq('is_deleted', false);

    if (searchQuery?.trim()) {
      productQuery = productQuery.or(`ppe_name.ilike.%${searchQuery.trim()}%`);
    }

    const { data: products, error: productError } = await productQuery;

    if (productError) {
      console.error('Error while fetching product details', productError);
      return {
        success: false,
        message: ERROR_MESSAGES.PRODUCT_NOT_FETCHED
      };
    }

    let ehsQuery = supabase.from('ehs_toolbox_talk').select(`id, topic_name`);

    if (searchQuery?.trim()) {
      ehsQuery = ehsQuery.or(`topic_name.ilike.%${searchQuery.trim()}%`);
    }

    const { data: ehsData, error: ehsError } = await ehsQuery;

    if (ehsError) {
      console.error('Error while fetching EHS toolbox talk details', ehsError);
      return {
        success: false,
        message: ERROR_MESSAGES.TOOLBOX_DETAILS_NOT_FETCHED
      };
    }

    let checklist = supabase
      .from('ehs_checklist_topics')
      .select(`id, topic_name`);

    if (searchQuery?.trim()) {
      checklist = checklist.or(`topic_name.ilike.%${searchQuery.trim()}%`);
    }

    const { data: checklistData, error: checklistError } = await checklist;

    if (checklistError) {
      console.error('Error while fetching EHS toolbox talk details', ehsError);
      return {
        success: false,
        message: ERROR_MESSAGES.CHECKLIST_DETAILS_NOT_FETCHED
      };
    }

    const productResults: SearchResultType[] =
      products?.map(product => ({
        label: product.ppe_name,
        url: `/products/${product.id}`
      })) || [];

    const ehsToolbox: SearchResultType[] =
      ehsData?.map(ehs => ({
        label: ehs.topic_name,
        url: `/ehs/toolbox-talk`
      })) || [];

    const ehsChecklist: SearchResultType[] =
      checklistData?.map(ehs => ({
        label: ehs.topic_name,
        url: `/ehs/checklist`
      })) || [];

    const matchedCategories = PRODUCT_CATEGORIES.filter(category =>
      category.label.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const categoryResults: SearchResultType[] = matchedCategories.map(
      category => ({
        label: category.label,
        url: `/products?category=${category.value}`
      })
    );

    const combinedResults = [
      ...productResults,
      ...ehsToolbox,
      ...ehsChecklist,
      ...categoryResults
    ];

    return {
      success: true,
      message: SUCCESS_MESSAGES.PRODUCT_FETCHED,
      data: combinedResults
    };
  } catch (error) {
    console.error('Unexpected error fetching details:', error);
    return {
      success: false,
      message: ERROR_MESSAGES.UNEXPECTED_ERROR
    };
  }
};
