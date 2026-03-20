'use server';

import { ERROR_MESSAGES, SUCCESS_MESSAGES } from '@/constants/constants';
import {
  addFirstPrinciplesDataType,
  addSuggestionType
} from '@/types/ehs.types';
import { FirstPrinciplesType, SuggestionType } from '@/types/index.types';
import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

export const addFirstPrinciples = async (
  principles: addFirstPrinciplesDataType
): Promise<{ success: boolean; message: string }> => {
  const supabase = await createClient();

  try {
    const principleDetails = {
      title: principles.title,
      description: principles.description,
      image_url: principles.image_url
    };
    const { error } = await supabase
      .from('ehs_first_principles')
      .insert(principleDetails);

    if (error) {
      console.error('Error while adding first principles', error);
      return {
        success: false,
        message: ERROR_MESSAGES.FIRST_PRINCIPLES_NOT_ADDED
      };
    }

    revalidatePath('/admin/ehs/first-principles');

    return {
      success: true,
      message: SUCCESS_MESSAGES.FIRST_PRINCIPLES_ADDED
    };
  } catch (error) {
    console.error(
      'An unexpected error occurred while adding first principles',
      error
    );
    return {
      success: false,
      message: ERROR_MESSAGES.UNEXPECTED_ERROR
    };
  }
};

export const updateFirstPrinciples = async (
  principles: addFirstPrinciplesDataType,
  id: number
): Promise<{ success: boolean; message: string }> => {
  const supabase = await createClient();

  try {
    const principleDetails = {
      title: principles.title,
      description: principles.description,
      image_url: principles.image_url
    };

    const { error } = await supabase
      .from('ehs_first_principles')
      .update(principleDetails)
      .eq('id', id);

    if (error) {
      console.error('Error while adding first principles', error);
      return {
        success: false,
        message: ERROR_MESSAGES.FIRST_PRINCIPLES_NOT_UPDATED
      };
    }

    revalidatePath('/admin/ehs/first-principles');

    return {
      success: true,
      message: SUCCESS_MESSAGES.FIRST_PRINCIPLES_UPDATED
    };
  } catch (error) {
    console.error(
      'An unexpected error occurred while updating first principles',
      error
    );
    return {
      success: false,
      message: ERROR_MESSAGES.UNEXPECTED_ERROR
    };
  }
};

export const getAllFirstPrinciples = async (
  searchQuery: string,
  page: number = 1,
  pageSize: number = 10
): Promise<{
  success: boolean;
  message: string;
  data?: FirstPrinciplesType[];
  pageCount?: number;
  count?: number;
}> => {
  const supabase = await createClient();

  try {
    let query = supabase
      .from('ehs_first_principles')
      .select('*', { count: 'exact' });

    if (searchQuery?.trim()) {
      query = query.or(`title.ilike.%${searchQuery.trim()}%`);
    }

    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;
    query = query.range(from, to);

    const { data, error, count } = await query;

    if (error) {
      console.error('Error while fetching first principle details', error);
      return {
        success: false,
        message: ERROR_MESSAGES.FIRST_PRINCIPLES_NOT_FETCHED
      };
    }

    return {
      success: true,
      message: SUCCESS_MESSAGES.FIRST_PRINCIPLES_FETCHED,
      data,
      pageCount: count ? Math.ceil(count / pageSize) : 1,
      count: count ? count : 0
    };
  } catch (error) {
    console.error(
      'An unexpected error occurred while fetching first principles',
      error
    );
    return {
      success: false,
      message: ERROR_MESSAGES.UNEXPECTED_ERROR
    };
  }
};

export const getFirstPrincipleById = async (
  principleId: number
): Promise<{
  success: boolean;
  message: string;
  data?: FirstPrinciplesType;
}> => {
  const supabase = await createClient();

  try {
    const { data, error } = await supabase
      .from('ehs_first_principles')
      .select('*')
      .eq('id', principleId)
      .single();

    if (error) {
      console.error('Error while fetching first principle details', error);
      return {
        success: false,
        message: ERROR_MESSAGES.FIRST_PRINCIPLES_NOT_FETCHED
      };
    }

    return {
      success: true,
      message: SUCCESS_MESSAGES.FIRST_PRINCIPLES_FETCHED,
      data
    };
  } catch (error) {
    console.error(
      'An unexpected error occurred while fetching first principles',
      error
    );
    return {
      success: false,
      message: ERROR_MESSAGES.UNEXPECTED_ERROR
    };
  }
};

export const deleteFirstPrinciple = async (
  principleId: number
): Promise<{ success: boolean; message: string }> => {
  const supabase = await createClient();

  try {
    const { error } = await supabase
      .from('ehs_first_principles')
      .delete()
      .eq('id', principleId);

    if (error) {
      console.error('Error while deleting first principle', error);
      return {
        success: false,
        message: ERROR_MESSAGES.FIRST_PRINCIPLES_NOT_DELETED
      };
    }

    revalidatePath('/admin/ehs/first-principles');

    return {
      success: true,
      message: SUCCESS_MESSAGES.FIRST_PRINCIPLE_DELETED
    };
  } catch (error) {
    console.error(
      'An unexpected error occurred while deleting first principle',
      error
    );
    return {
      success: false,
      message: ERROR_MESSAGES.UNEXPECTED_ERROR
    };
  }
};

export const addFirstPrincipleSuggestion = async (
  suggestion: addSuggestionType
) => {
  const supabase = await createClient();

  try {
    const { error } = await supabase
      .from('ehs_suggestions')
      .insert({
        topic_name: suggestion.topic_name,
        suggestion_type: 'first_principle'
      })
      .single();

    if (error) {
      console.error('Error while adding first principle suggestion', error);
      return {
        success: false,
        message: ERROR_MESSAGES.FIRST_PRINCIPLE_SUGGESTION_NOT_ADDED
      };
    }

    return {
      success: true,
      message: SUCCESS_MESSAGES.FIRST_PRINCIPLE_SUGGESTION_ADDED
    };
  } catch (error) {
    console.error(
      'An unexpected error occurred while adding first principle suggestion',
      error
    );
    return {
      success: false,
      message: ERROR_MESSAGES.UNEXPECTED_ERROR
    };
  }
};

export const getFirstPrincipleSuggestions = async (): Promise<{
  success: boolean;
  message: string;
  data?: SuggestionType[];
}> => {
  const supabase = await createClient();

  try {
    const { data, error } = await supabase
      .from('ehs_suggestions')
      .select('*')
      .eq('suggestion_type', 'first_principle');

    if (error) {
      console.error('Error while fetching first principle suggestions', error);
      return {
        success: false,
        message: ERROR_MESSAGES.FIRST_PRINCIPLE_SUGGESTION_NOT_FETCHED
      };
    }

    return {
      success: true,
      message: SUCCESS_MESSAGES.FIRST_PRINCIPLE_SUGGESTION_FETCHED,
      data
    };
  } catch (error) {
    console.error(
      'An unexpected error occurred while fetching first principle suggestion',
      error
    );
    return {
      success: false,
      message: ERROR_MESSAGES.UNEXPECTED_ERROR
    };
  }
};
