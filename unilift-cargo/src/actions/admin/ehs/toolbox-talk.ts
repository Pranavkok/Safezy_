'use server';

import { getAuthId, getUserIdFromAuth } from '@/actions/user';
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from '@/constants/constants';
import { ToolboxTalkType, SuggestionType } from '@/types/index.types';
import {
  addSuggestionType,
  addToolboxType,
  addToolboxUserType,
  ToolboxCompleteDataType,
  ToolboxUserEntry,
  toolboxValidDataType,
  updateToolboxType,
  UserDetails
} from '@/types/ehs.types';
import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';
import { notifyAllContractors } from '@/lib/notify-all-contractors';
import { sendPushNotification } from '@/lib/web-push';

export const getAllToolboxTalkDetails = async (
  searchQuery: string,
  page: number = 1,
  pageSize: number = 10
): Promise<{
  success: boolean;
  message: string;
  data?: ToolboxTalkType[];
  pageCount?: number;
  count?: number;
}> => {
  const supabase = await createClient();

  try {
    let query = supabase
      .from('ehs_toolbox_talk')
      .select('*', { count: 'exact' });

    if (searchQuery) {
      query.or(`topic_name.ilike.%${searchQuery}%`);
    }

    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;
    query = query.range(from, to);

    const { data, error, count } = await query;

    if (error) {
      console.error('Error while feteching toolbox talk details', error);
      return {
        success: false,
        message: ERROR_MESSAGES.TOOLBOX_DETAILS_NOT_FETCHED
      };
    }

    return {
      success: true,
      message: SUCCESS_MESSAGES.TOOLBOX_DETAILS_FETCHED,
      data,
      pageCount: count ? Math.ceil(count / pageSize) : 1,
      count: count ? count : 0
    };
  } catch (error) {
    console.error(
      'An unexpected error occurred while fetching toolbox talk details',
      error
    );
    return {
      success: false,
      message: ERROR_MESSAGES.UNEXPECTED_ERROR
    };
  }
};

export const getToolboxTalkDetailsById = async (
  toolboxId: number
): Promise<{
  success: boolean;
  message: string;
  data?: ToolboxTalkType;
}> => {
  const supabase = await createClient();

  try {
    const { data, error } = await supabase
      .from('ehs_toolbox_talk')
      .select('*')
      .eq('id', toolboxId)
      .single();

    if (error) {
      console.error('Error while fetching toolbox talk details', error);
      return {
        success: false,
        message: ERROR_MESSAGES.TOOLBOX_DETAILS_NOT_FETCHED
      };
    }

    return {
      success: true,
      message: SUCCESS_MESSAGES.TOOLBOX_DETAILS_FETCHED,
      data
    };
  } catch (error) {
    console.error(
      'An unexpected error occurred while fetching toolbox talk details',
      error
    );
    return {
      success: false,
      message: ERROR_MESSAGES.UNEXPECTED_ERROR
    };
  }
};

export const getAllToolboxUserDetailsById = async (
  toolboxTalkId: number
): Promise<{
  success: boolean;
  message: string;
  data?: ToolboxCompleteDataType[];
}> => {
  const supabase = await createClient();

  try {
    const query = supabase
      .from('ehs_toolbox_users')
      .select(
        `
      best_performer,
      users (
        first_name,
        last_name
      ),
      ehs_toolbox_talk (
        topic_name
      )
      `
      )
      .eq('toolbox_talk_id', toolboxTalkId)
      .order('created_at', { ascending: false })
      .limit(1);

    const { data, error } = await query;

    if (error) {
      console.error('Error adding toolbox topic', error);
      return {
        success: false,
        message: ERROR_MESSAGES.TOOLBOX_USERS_NOT_FETCHED
      };
    }

    return {
      success: true,
      message: SUCCESS_MESSAGES.TOOLBOX_USERS_FETCHED,
      data
    };
  } catch (error) {
    console.error(
      'An unexpected error occurred while fetching toolbox talk details',
      error
    );
    return {
      success: false,
      message: ERROR_MESSAGES.UNEXPECTED_ERROR
    };
  }
};

export const addToolboxUserDetails = async (
  userDetails: addToolboxUserType,
  uploadImages: { publicUrl: string }[],
  toolboxTalkId: number | null,
  rating: number
): Promise<{
  success: boolean;
  message: string;
  data?: toolboxValidDataType;
}> => {
  const supabase = await createClient();

  try {
    const userId = await getUserIdFromAuth();

    if (!userId) {
      return {
        success: false,
        message: ERROR_MESSAGES.USER_NOT_FOUND
      };
    }
    const newUser = {
      superior_email: userDetails.superior_email,
      best_performer: userDetails.best_performer,
      user_id: userId,
      toolbox_talk_id: toolboxTalkId,
      ...(rating > 0 && { rating })
    };

    const { data: userData, error: userError } = await supabase
      .from('ehs_toolbox_users')
      .insert(newUser)
      .select()
      .single();

    if (userError) {
      console.error('Failed to add toolbox users', userError);
      return {
        success: false,
        message: ERROR_MESSAGES.TOOLBOX_USERS_NOT_ADDED
      };
    }

    const toolboxUserId = userData.id;

    const toolboxImages = uploadImages.map(image => {
      return {
        image_url: image.publicUrl,
        toolbox_user_id: toolboxUserId
      };
    });

    const { error: imageError } = await supabase
      .from('images')
      .insert(toolboxImages);

    if (imageError) {
      console.error('Failed to add images', imageError);
      return {
        success: false,
        message: ERROR_MESSAGES.TOOLBOX_IMAGE_NOT_ADDED
      };
    }

    const validData: toolboxValidDataType = {
      bestPerformer: userData.best_performer
    };

    getAuthId().then((authId) => {
      if (authId) {
        sendPushNotification(authId, 'toolbox_talk_completion', {
          title: 'Toolbox Talk Completed',
          body: 'Well done! You have completed a toolbox talk.',
          url: '/contractor/ehs/toolbox-talks',
        }).catch((err) => console.error('[push] toolbox completion notification failed:', err));
      }
    }).catch(() => {});

    return {
      success: true,
      message: SUCCESS_MESSAGES.TOOLBOX_USERS_ADDED,
      data: validData
    };
  } catch (error) {
    console.error(
      'An unexpected error occurred while fetching toolbox talk details',
      error
    );
    return {
      success: false,
      message: ERROR_MESSAGES.UNEXPECTED_ERROR
    };
  }
};

export const getToolboxTopicUserDetails = async (toolboxTalkId: number) => {
  const supabase = await createClient();

  try {
    const query = supabase
      .from('ehs_toolbox_users')
      .select(
        `
        user_id,
        created_at,
        users (
          first_name,
          last_name,
          email
        ),
        ehs_toolbox_talk (
          topic_name
        )
        `
      )
      .eq('toolbox_talk_id', toolboxTalkId)
      .order('created_at', { ascending: false });

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching toolbox topic users', error);
      return {
        success: false,
        message: ERROR_MESSAGES.TOOLBOX_USERS_NOT_FETCHED
      };
    }

    if (!data || data.length === 0) {
      return { success: true, message: 'No users found' };
    }

    const userMap = new Map<string, ToolboxUserEntry>();

    data.forEach(entry => {
      const userId = entry.user_id;
      if (!userMap.has(userId)) {
        userMap.set(userId, entry as ToolboxUserEntry);
      }
    });

    const userDetails: UserDetails[] = Array.from(userMap.values()).map(
      user => ({
        firstName: user.users?.first_name || '',
        lastName: user.users?.last_name || '',
        email: user.users?.email || '',
        topicName: user.ehs_toolbox_talk?.topic_name || '',
        sessionDate: new Date(user.created_at).toLocaleString()
      })
    );

    return {
      success: true,
      message: SUCCESS_MESSAGES.TOOLBOX_USERS_FETCHED,
      data: userDetails
    };
  } catch (error) {
    console.error(
      'An unexpected error occurred while fetching toolbox talk details',
      error
    );
    return {
      success: false,
      message: ERROR_MESSAGES.UNEXPECTED_ERROR
    };
  }
};

export const addToolboxTalkDetails = async (
  toolbox: addToolboxType
): Promise<{ success: boolean; message: string }> => {
  const supabase = await createClient();

  try {
    const newToolBoxTalk = {
      topic_name: toolbox.topic_name,
      description: toolbox.description,
      pdf_url: toolbox.pdf_url,
      summarized: toolbox.summarize
    };

    const { data: insertedTbt, error } = await supabase
      .from('ehs_toolbox_talk')
      .insert(newToolBoxTalk)
      .select('id')
      .single();

    if (error) {
      console.error('Error adding toolbox topic', error);
      return {
        success: false,
        message: ERROR_MESSAGES.TOOLBOX_DETAILS_NOT_ADDED
      };
    }

    revalidatePath('/admin/ehs/toolbox-talk');

    notifyAllContractors('portal_toolbox_talk', {
      title: 'New Toolbox Talk Available',
      body: `"${toolbox.topic_name}" has been added. Complete it to stay compliant.`,
      url: '/contractor/ehs/toolbox-talks',
    }, { toolbox_talk_id: insertedTbt.id }).catch((err) => console.error('[push] toolbox talk notification failed:', err));

    return {
      success: true,
      message: SUCCESS_MESSAGES.TOOLBOX_DETAILS_ADDED
    };
  } catch (error) {
    console.error(
      'An unexpected error occurred while adding toolbox talk details',
      error
    );
    return {
      success: false,
      message: ERROR_MESSAGES.UNEXPECTED_ERROR
    };
  }
};

export const updateToolboxTalkDetails = async (
  toolbox: updateToolboxType,
  toolboxId: number
): Promise<{ success: boolean; message: string }> => {
  const supabase = await createClient();

  try {
    const toolBoxTalk = {
      topic_name: toolbox.topic_name,
      pdf_url: toolbox.pdf_url,
      description: toolbox.description,
      summarized: toolbox.summarize
    };

    const { error } = await supabase
      .from('ehs_toolbox_talk')
      .update(toolBoxTalk)
      .eq('id', toolboxId);

    if (error) {
      console.error('Error updating toolbox topic', error);
      return {
        success: false,
        message: ERROR_MESSAGES.TOOLBOX_DETAILS_NOT_UPDATED
      };
    }
    revalidatePath('/admin/ehs/toolbox-talk');

    return {
      success: true,
      message: SUCCESS_MESSAGES.TOOLBOX_DETAILS_UPDATED
    };
  } catch (error) {
    console.error(
      'An unexpected error occurred while updating toolbox talk details',
      error
    );
    return {
      success: false,
      message: ERROR_MESSAGES.UNEXPECTED_ERROR
    };
  }
};

export const deleteToolboxTalk = async (toolboxId: number) => {
  const supabase = await createClient();

  try {
    const { error } = await supabase
      .from('ehs_toolbox_talk')
      .delete()
      .eq('id', toolboxId);

    if (error) {
      console.error('Error deleting toolbox topic', error);
      return {
        success: false,
        message: ERROR_MESSAGES.TOOLBOX_DETAILS_NOT_DELETED
      };
    }

    revalidatePath('/admin/ehs/toolbox-talk');

    return {
      success: true,
      message: SUCCESS_MESSAGES.TOOLBOX_DETAILS_DELETED
    };
  } catch (error) {
    console.error(
      'An unexpected error occurred while deleting toolbox talk details',
      error
    );
    return {
      success: false,
      message: ERROR_MESSAGES.UNEXPECTED_ERROR
    };
  }
};

export const addToolboxTalkSuggestion = async (
  suggestion: addSuggestionType
) => {
  const supabase = await createClient();

  try {
    const { error } = await supabase
      .from('ehs_suggestions')
      .insert({
        topic_name: suggestion.topic_name,
        suggestion_type: 'toolbox_talk'
      })
      .single();

    if (error) {
      console.error('Error while adding toolbox talk suggestion', error);
      return {
        success: false,
        message: ERROR_MESSAGES.TOOLBOX_SUGGESTION_NOT_ADDED
      };
    }

    return {
      success: true,
      message: SUCCESS_MESSAGES.TOOLBOX_SUGGESTION_ADDED
    };
  } catch (error) {
    console.error(
      'An unexpected error occurred while adding toolbox talk suggestion',
      error
    );
    return {
      success: false,
      message: ERROR_MESSAGES.UNEXPECTED_ERROR
    };
  }
};

export const getToolboxTalkSuggestions = async (): Promise<{
  success: boolean;
  message: string;
  data?: SuggestionType[];
}> => {
  const supabase = await createClient();

  try {
    const { data, error } = await supabase
      .from('ehs_suggestions')
      .select('*')
      .eq('suggestion_type', 'toolbox_talk');

    if (error) {
      console.error('Error while fetching toolbox talk suggestions', error);
      return {
        success: false,
        message: ERROR_MESSAGES.TOOLBOX_SUGGESTION_NOT_FETCHED
      };
    }

    return {
      success: true,
      message: SUCCESS_MESSAGES.TOOLBOX_SUGGESTION_FETCHED,
      data
    };
  } catch (error) {
    console.error(
      'An unexpected error occurred while fetching toolbox talk suggestion',
      error
    );
    return {
      success: false,
      message: ERROR_MESSAGES.UNEXPECTED_ERROR
    };
  }
};
