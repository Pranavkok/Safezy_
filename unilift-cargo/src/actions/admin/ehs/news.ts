'use server';

import { ERROR_MESSAGES, SUCCESS_MESSAGES } from '@/constants/constants';
import { EhsNewsFormType } from '@/sections/admin/ehs/ehs-news/EhsAddUpdateSection';
import { EhsNewsType } from '@/types/index.types';
import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

export const addEhsNews = async (newsData: EhsNewsFormType) => {
  const supabase = await createClient();

  try {
    const { data, error } = await supabase
      .from('ehs_news')
      .insert({
        title: newsData.title,
        description: newsData.description,
        image_url: newsData.image,
        preview_url: newsData.link
      })
      .select();

    if (error) {
      console.error('Database error:', error);
      return {
        success: false,
        message: ERROR_MESSAGES.NEWS_NOT_ADDED
      };
    }

    revalidatePath('/admin/ehs/news');

    return {
      success: true,
      data,
      message: SUCCESS_MESSAGES.NEWS_ADDED
    };
  } catch (err) {
    console.error('Error adding EHS news:', err);
    return {
      success: false,
      message: ERROR_MESSAGES.UNEXPECTED_ERROR
    };
  }
};

export const getEhsNews = async (
  page: number = 1,
  pageSize: number = 10
): Promise<{
  success: boolean;
  data?: EhsNewsType[];
  message: string;
  count?: number;
}> => {
  const supabase = await createClient();

  try {
    const query = supabase
      .from('ehs_news')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false });

    const from = (page - 1) * pageSize;
    query.range(from, from + pageSize - 1);

    const { data: ehsNews, error, count } = await query;

    if (error) {
      console.error('Database error:', error);
      return {
        success: false,
        message: ERROR_MESSAGES.NEWS_NOT_FETCHED
      };
    }

    return {
      success: true,
      data: ehsNews || [],
      message: SUCCESS_MESSAGES.NEWS_FETCHED,
      count: count || 0
    };
  } catch (err) {
    console.error('Error fetching EHS news:', err);
    return {
      success: false,
      message: ERROR_MESSAGES.UNEXPECTED_ERROR
    };
  }
};

export const updateEhsNews = async (id: number, newsData: EhsNewsFormType) => {
  const supabase = await createClient();

  try {
    const { data, error } = await supabase
      .from('ehs_news')
      .update({
        title: newsData.title,
        description: newsData.description,
        image_url: newsData.image,
        preview_url: newsData.link,
        updated_at: new Date().toISOString()
      })
      .eq('id', id);

    if (error) {
      console.error('Database error:', error);
      return {
        success: false,
        message: ERROR_MESSAGES.NEWS_NOT_UPDATED
      };
    }

    revalidatePath('/admin/ehs/news');

    return {
      success: true,
      data,
      message: SUCCESS_MESSAGES.NEWS_UPDATED
    };
  } catch (err) {
    console.error('Error updating EHS news:', err);
    return {
      success: false,
      message: ERROR_MESSAGES.UNEXPECTED_ERROR
    };
  }
};

export const getEhsNewsById = async (
  id: number
): Promise<{
  success: boolean;
  data?: EhsNewsType;
  message: string;
}> => {
  const supabase = await createClient();

  try {
    const { data: ehsNews, error } = await supabase
      .from('ehs_news')
      .select('*')
      .eq('id', Number(id))
      .order('created_at', { ascending: false })
      .single();

    if (error) {
      console.error('Database error:', error);
      return {
        success: false,
        message: ERROR_MESSAGES.NEWS_NOT_FETCHED
      };
    }

    return {
      success: true,
      data: ehsNews,
      message: SUCCESS_MESSAGES.NEWS_FETCHED
    };
  } catch (err) {
    console.error('Error fetching EHS news:', err);
    return {
      success: false,
      message: ERROR_MESSAGES.UNEXPECTED_ERROR
    };
  }
};

export const deleteEhsNews = async (id: number) => {
  const supabase = await createClient();

  try {
    const { error } = await supabase.from('ehs_news').delete().eq('id', id);

    if (error) {
      console.error('Error while deleting news item', error);
      return {
        success: false,
        message: ERROR_MESSAGES.NEWS_NOT_DELETED
      };
    }

    revalidatePath('/admin/ehs/news');

    return {
      success: true,
      message: SUCCESS_MESSAGES.NEWS_DELETED
    };
  } catch (error) {
    console.error('Error deleting EHS news:', error);
    return {
      success: false,
      message: ERROR_MESSAGES.UNEXPECTED_ERROR
    };
  }
};
