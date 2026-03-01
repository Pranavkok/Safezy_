'use server';

import { createClient } from '@/utils/supabase/server';
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from '@/constants/constants';
import { revalidatePath } from 'next/cache';
import { ToolboxNoteType } from '@/types/ehs.types';
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
