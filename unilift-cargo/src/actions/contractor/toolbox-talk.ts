'use server';

import { createClient } from '@/utils/supabase/server';
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from '@/constants/constants';
import { revalidatePath } from 'next/cache';
import { ToolboxNoteType, ToolboxTalkCompletionReport } from '@/types/ehs.types';
import { getAuthId, getUserIdFromAuth } from '../user';
import { sendPushNotification } from '@/lib/web-push';

export const addToolboxNote = async (
  note: string,
  toolboxId: number,
  userId: string
): Promise<{ success: boolean; message: string }> => {
  const supabase = await createClient();

  try {
    const { error } = await supabase
      .from('ehs_toolbox_notes')
      .insert([{ note, toolbox_talk_id: toolboxId, user_id: userId }]);

    if (error) {
      console.error('Error while updating toolbox note:', error);
      return {
        success: false,
        message: ERROR_MESSAGES.TOOLBOX_NOTE_NOT_ADDED
      };
    }

    revalidatePath('/ehs/toolbox-talk');

    getAuthId().then((authId) => {
      if (authId) {
        sendPushNotification(authId, 'toolbox_talk_completion', {
          title: 'Toolbox Talk',
          body: 'Note saved for toolbox talk',
          url: '/contractor/ehs/toolbox-talks',
        }).catch((err) => console.error('[push] toolbox note notification failed:', err));
      }
    }).catch(() => {});

    return {
      success: true,
      message: SUCCESS_MESSAGES.TOOLBOX_NOTE_ADDED
    };
  } catch (error) {
    console.error(
      'An unexpected error occurred while updating toolbox note:',
      error
    );
    return {
      success: false,
      message: ERROR_MESSAGES.UNEXPECTED_ERROR
    };
  }
};

export const updateToolboxNote = async (
  note: string,
  toolboxId: number,
  userId: string
): Promise<{ success: boolean; message: string }> => {
  const supabase = await createClient();
  try {
    const { error } = await supabase
      .from('ehs_toolbox_notes')
      .update({ note })
      .match({ toolbox_talk_id: toolboxId, user_id: userId });

    if (error) {
      console.error('Error while updating toolbox note:', error);
      return {
        success: false,
        message: ERROR_MESSAGES.TOOLBOX_NOTE_NOT_UPDATED
      };
    }

    revalidatePath('/ehs/toolbox-talk');

    return {
      success: true,
      message: SUCCESS_MESSAGES.TOOLBOX_NOTE_UPDATED
    };
  } catch (error) {
    console.error(
      'An unexpected error occurred while updating toolbox note:',
      error
    );
    return {
      success: false,
      message: ERROR_MESSAGES.UNEXPECTED_ERROR
    };
  }
};

export const getMyToolboxCompletion = async (
  toolboxTalkId: number
): Promise<{ success: boolean; message: string; data?: ToolboxTalkCompletionReport }> => {
  const supabase = await createClient();

  try {
    const userId = await getUserIdFromAuth();
    if (!userId) return { success: false, message: ERROR_MESSAGES.USER_NOT_FOUND };

    const { data, error } = await supabase
      .from('ehs_toolbox_users')
      .select(`
        id,
        created_at,
        duration_seconds,
        rating,
        superior_email,
        best_performer,
        users (first_name, last_name, email),
        ehs_toolbox_talk (topic_name),
        images (image_url)
      `)
      .eq('toolbox_talk_id', toolboxTalkId)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) return { success: false, message: ERROR_MESSAGES.TOOLBOX_USERS_NOT_FETCHED };
    if (!data) return { success: false, message: 'No completion record found' };

    const usersData = Array.isArray(data.users) ? data.users[0] : data.users;
    const talkData = Array.isArray(data.ehs_toolbox_talk) ? data.ehs_toolbox_talk[0] : data.ehs_toolbox_talk;
    const imagesData = Array.isArray(data.images) ? data.images : [];

    return {
      success: true,
      message: SUCCESS_MESSAGES.TOOLBOX_USERS_FETCHED,
      data: {
        id: data.id,
        created_at: data.created_at,
        duration_seconds: data.duration_seconds,
        rating: data.rating,
        superior_email: data.superior_email,
        comments: data.best_performer,
        topic_name: talkData?.topic_name ?? '',
        first_name: usersData?.first_name ?? '',
        last_name: usersData?.last_name ?? '',
        email: usersData?.email ?? '',
        attendance_images: imagesData.map((img: { image_url: string }) => img.image_url)
      }
    };
  } catch {
    return { success: false, message: ERROR_MESSAGES.UNEXPECTED_ERROR };
  }
};

export const getMyToolboxSubmissions = async (): Promise<{
  success: boolean;
  message: string;
  data?: {
    id: number;
    toolbox_talk_id: number;
    topic_name: string;
    created_at: string;
    rating: number | null;
    duration_seconds: number | null;
  }[];
}> => {
  const supabase = await createClient();

  try {
    const userId = await getUserIdFromAuth();

    if (!userId) {
      return { success: false, message: ERROR_MESSAGES.USER_NOT_FOUND };
    }

    const { data: submissions, error } = await supabase
      .from('ehs_toolbox_users')
      .select('id, toolbox_talk_id, created_at, rating, duration_seconds')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching toolbox submissions', error);
      return { success: false, message: ERROR_MESSAGES.TOOLBOX_USERS_NOT_FETCHED };
    }

    if (!submissions || submissions.length === 0) {
      return { success: true, message: SUCCESS_MESSAGES.TOOLBOX_USERS_FETCHED, data: [] };
    }

    const talkIds = Array.from(new Set(submissions.map(r => r.toolbox_talk_id)));
    const { data: talks } = await supabase
      .from('ehs_toolbox_talk')
      .select('id, topic_name')
      .in('id', talkIds);

    const talkMap: Record<number, string> = {};
    (talks ?? []).forEach((t: any) => { talkMap[t.id] = t.topic_name; });

    return {
      success: true,
      message: SUCCESS_MESSAGES.TOOLBOX_USERS_FETCHED,
      data: submissions.map((row: any) => ({
        id: row.id,
        toolbox_talk_id: row.toolbox_talk_id,
        topic_name: talkMap[row.toolbox_talk_id] ?? '',
        created_at: row.created_at,
        rating: row.rating,
        duration_seconds: row.duration_seconds
      }))
    };
  } catch (error) {
    console.error('Unexpected error fetching toolbox submissions', error);
    return { success: false, message: ERROR_MESSAGES.UNEXPECTED_ERROR };
  }
};

export const getToolboxNoteByUserId = async (
  toolboxId: number
): Promise<{ success: boolean; message: string; data?: ToolboxNoteType }> => {
  const supabase = await createClient();

  try {
    const user_id = await getUserIdFromAuth();

    if (!user_id) {
      return {
        success: false,
        message: ERROR_MESSAGES.USER_NOT_FOUND
      };
    }

    const { data, error } = await supabase
      .from('ehs_toolbox_notes')
      .select('note')
      .eq('user_id', user_id)
      .eq('toolbox_talk_id', toolboxId)
      .maybeSingle();

    if (error) {
      console.error('Error while fetching toolbox notes:', error);
      return {
        success: false,
        message: ERROR_MESSAGES.TOOLBOX_NOTE_NOT_FETCHED
      };
    }

    return {
      success: true,
      message: SUCCESS_MESSAGES.TOOLBOX_NOTE_FETCHED,
      data: data as ToolboxNoteType
    };
  } catch (error) {
    console.error(
      'An unexpected error occurred while fetching toolbox notes:',
      error
    );
    return {
      success: false,
      message: ERROR_MESSAGES.UNEXPECTED_ERROR
    };
  }
};
