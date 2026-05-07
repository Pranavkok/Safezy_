'use server';

import { getAuthId, getUserIdFromAuth } from '@/actions/user';
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from '@/constants/constants';
import { ToolboxTalkType, SuggestionType, SuggestionWithUserType } from '@/types/index.types';
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
import { createServiceClient } from '@/utils/supabase/service';
import { revalidatePath } from 'next/cache';
import { notifyAllContractors } from '@/lib/notify-all-contractors';
import { sendPushNotification } from '@/lib/web-push';

type ToolboxSuggestionReviewStatus = 'completed' | 'rejected';

const TOOLBOX_SUGGESTIONS_PATH = '/ehs/toolbox-talk/my-suggestions';

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
  const serviceClient = createServiceClient();

  try {
    let query = serviceClient
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
  const serviceClient = createServiceClient();

  try {
    const { data, error } = await serviceClient
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
  const serviceClient = createServiceClient();

  try {
    const query = serviceClient
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
  userDetails: addToolboxUserType & { superior_email: string },
  uploadImages: { publicUrl: string }[],
  toolboxTalkId: number | null,
  rating: number,
  durationSeconds?: number
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
      best_performer: userDetails.comments || '',
      user_id: userId,
      toolbox_talk_id: toolboxTalkId,
      ...(rating > 0 && { rating }),
      ...(durationSeconds !== undefined && durationSeconds > 0 && { duration_seconds: durationSeconds })
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

    const toolboxImages = uploadImages
      .filter(image => image.publicUrl)
      .map(image => ({
        image_url: image.publicUrl,
        toolbox_user_id: toolboxUserId
      }));

    if (toolboxImages.length > 0) {
      const serviceClient = createServiceClient();
      const { error: imageError } = await serviceClient
        .from('images')
        .insert(toolboxImages);

      if (imageError) {
        console.error('Failed to add images', imageError);
        return {
          success: false,
          message: ERROR_MESSAGES.TOOLBOX_IMAGE_NOT_ADDED
        };
      }
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
  const serviceClient = createServiceClient();

  try {
    const query = serviceClient
      .from('ehs_toolbox_users')
      .select(
        `
        user_id,
        created_at,
        duration_seconds,
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
        sessionDate: user.created_at,
        durationSeconds: user.duration_seconds ?? null
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
  const supabase = createServiceClient();

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
  const supabase = createServiceClient();

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
    revalidatePath('/admin/ehs/toolbox-talk', 'layout');

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
  const supabase = createServiceClient();

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
  const serviceClient = createServiceClient();

  try {
    const userId = await getAuthId();
    const { error } = await serviceClient
      .from('ehs_suggestions')
      .insert({
        topic_name: suggestion.topic_name,
        suggestion_type: 'toolbox_talk',
        user_id: userId ?? null
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

export const getMyToolboxSuggestions = async (): Promise<{
  success: boolean;
  message: string;
  data?: SuggestionType[];
}> => {
  const serviceClient = createServiceClient();

  try {
    const userId = await getAuthId();
    if (!userId) return { success: false, message: 'Not authenticated', data: [] };

    const { data, error } = await serviceClient
      .from('ehs_suggestions')
      .select('*')
      .eq('suggestion_type', 'toolbox_talk')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching my toolbox suggestions', error);
      return { success: false, message: ERROR_MESSAGES.UNEXPECTED_ERROR };
    }

    return { success: true, message: 'Fetched successfully', data: data as SuggestionType[] };
  } catch (error) {
    console.error('Unexpected error fetching my toolbox suggestions', error);
    return { success: false, message: ERROR_MESSAGES.UNEXPECTED_ERROR };
  }
};

export const getToolboxTalkSuggestions = async (): Promise<{
  success: boolean;
  message: string;
  data?: SuggestionWithUserType[];
}> => {
  const serviceClient = createServiceClient();

  try {
    const { data, error } = await serviceClient
      .from('ehs_suggestions')
      .select('*')
      .eq('suggestion_type', 'toolbox_talk')
      .eq('review_status', 'pending')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error while fetching toolbox talk suggestions', error);
      return {
        success: false,
        message: ERROR_MESSAGES.TOOLBOX_SUGGESTION_NOT_FETCHED
      };
    }

    const userIds = [...new Set(data.filter(s => s.user_id).map(s => s.user_id as string))];
    const userMap = new Map<string, { first_name: string; last_name: string }>();

    if (userIds.length > 0) {
      const { data: users } = await serviceClient
        .from('users')
        .select('auth_id, first_name, last_name')
        .in('auth_id', userIds);
      users?.forEach(u => userMap.set(u.auth_id, { first_name: u.first_name, last_name: u.last_name }));
    }

    const enrichedData: SuggestionWithUserType[] = data.map(s => ({
      ...s,
      user: s.user_id ? (userMap.get(s.user_id) ?? null) : null
    }));

    return {
      success: true,
      message: SUCCESS_MESSAGES.TOOLBOX_SUGGESTION_FETCHED,
      data: enrichedData
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

const reviewToolboxSuggestion = async (
  suggestionId: number,
  reviewStatus: ToolboxSuggestionReviewStatus
) => {
  const serviceClient = createServiceClient();

  try {
    const { data: suggestion, error: fetchError } = await serviceClient
      .from('ehs_suggestions')
      .select('id, topic_name, user_id, review_status')
      .eq('id', suggestionId)
      .eq('suggestion_type', 'toolbox_talk')
      .maybeSingle();

    if (fetchError || !suggestion) {
      console.error('Error while fetching toolbox suggestion', fetchError);
      return {
        success: false,
        message: 'Toolbox talk suggestion not found.'
      };
    }

    if (suggestion.review_status !== 'pending') {
      return {
        success: false,
        message: 'Toolbox talk suggestion has already been reviewed.'
      };
    }

    const { error: updateError } = await serviceClient
      .from('ehs_suggestions')
      .update({
        review_status: reviewStatus,
        reviewed_at: new Date().toISOString()
      })
      .eq('id', suggestionId);

    if (updateError) {
      console.error('Error while reviewing toolbox suggestion', updateError);
      return {
        success: false,
        message: 'Failed to update toolbox talk suggestion. Please try again.'
      };
    }

    if (suggestion.user_id) {
      const isCompleted = reviewStatus === 'completed';

      await sendPushNotification(
        suggestion.user_id,
        isCompleted
          ? 'toolbox_suggestion_completed'
          : 'toolbox_suggestion_rejected',
        {
          title: isCompleted
            ? 'Toolbox Suggestion Completed'
            : 'Toolbox Suggestion Rejected',
          body: isCompleted
            ? `Your toolbox talk suggestion "${suggestion.topic_name}" has been marked as completed.`
            : `Your toolbox talk suggestion "${suggestion.topic_name}" has been rejected.`,
          url: TOOLBOX_SUGGESTIONS_PATH
        },
        {
          suggestion_id: suggestion.id,
          suggestion_type: 'toolbox_talk',
          review_status: reviewStatus
        }
      );
    }

    revalidatePath('/admin/ehs/toolbox-talk');
    revalidatePath(TOOLBOX_SUGGESTIONS_PATH);

    return {
      success: true,
      message:
        reviewStatus === 'completed'
          ? 'Toolbox talk suggestion marked as completed.'
          : 'Toolbox talk suggestion rejected.'
    };
  } catch (error) {
    console.error(
      'An unexpected error occurred while reviewing toolbox suggestion',
      error
    );
    return {
      success: false,
      message: ERROR_MESSAGES.UNEXPECTED_ERROR
    };
  }
};

export const approveToolboxSuggestion = async (suggestionId: number) =>
  reviewToolboxSuggestion(suggestionId, 'completed');

export const rejectToolboxSuggestion = async (suggestionId: number) =>
  reviewToolboxSuggestion(suggestionId, 'rejected');

export type ToolboxTalkReportEntry = {
  topic: string;
  date: string;
  rating: number | null;
  submittedBy: string;
};

export const getToolboxTalkReportEntries = async (): Promise<{
  success: boolean;
  message: string;
  data?: ToolboxTalkReportEntry[];
}> => {
  const serviceClient = createServiceClient();

  try {
    const { data, error } = await serviceClient
      .from('ehs_toolbox_users')
      .select(
        `
        created_at,
        rating,
        users (
          first_name,
          last_name
        ),
        ehs_toolbox_talk (
          topic_name
        )
        `
      )
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching toolbox report entries', error);
      return {
        success: false,
        message: ERROR_MESSAGES.TOOLBOX_USERS_NOT_FETCHED
      };
    }

    const reportEntries: ToolboxTalkReportEntry[] = (data ?? []).map(entry => {
      const usersData = Array.isArray(entry.users) ? entry.users[0] : entry.users;
      const talkData = Array.isArray(entry.ehs_toolbox_talk)
        ? entry.ehs_toolbox_talk[0]
        : entry.ehs_toolbox_talk;

      const firstName = usersData?.first_name?.trim() ?? '';
      const lastName = usersData?.last_name?.trim() ?? '';
      const fullName = `${firstName} ${lastName}`.trim();

      return {
        topic: talkData?.topic_name ?? '—',
        date: entry.created_at,
        rating: entry.rating ?? null,
        submittedBy: fullName || '—'
      };
    });

    return {
      success: true,
      message: SUCCESS_MESSAGES.TOOLBOX_USERS_FETCHED,
      data: reportEntries
    };
  } catch (error) {
    console.error(
      'An unexpected error occurred while fetching toolbox talk report entries',
      error
    );
    return {
      success: false,
      message: ERROR_MESSAGES.UNEXPECTED_ERROR
    };
  }
};
