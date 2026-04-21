'use server';

import { ERROR_MESSAGES, SUCCESS_MESSAGES } from '@/constants/constants';
import {
  ChecklistProgressType,
  ChecklistResponseByContractorType,
  ChecklistTopicAndQuestionsType,
  sendChecklistMailType
} from '@/types/ehs.types';
import { ChecklistTopicType } from '@/types/index.types';
import { createClient } from '@/utils/supabase/server';
import { createServiceClient } from '@/utils/supabase/service';
import { getAuthId, getUserIdFromAuth } from '../user';
import { checklistCompletionEmailHTML } from '@/data/checklistCompletionEmail';
import { sendPushNotification } from '@/lib/web-push';

export const getAllChecklistTopics = async (): Promise<{
  success: boolean;
  message: string;
  data?: ChecklistTopicType[];
}> => {
  const supabase = await createClient();

  try {
    const { data, error } = await supabase
      .from('ehs_checklist_topics')
      .select('*');

    if (error) {
      console.error('Error while fetching checklist details', error);
      return {
        success: false,
        message: ERROR_MESSAGES.CHECKLIST_DETAILS_NOT_FETCHED
      };
    }

    return {
      success: true,
      message: SUCCESS_MESSAGES.CHECKLIST_DETAILS_FETCHED,
      data
    };
  } catch (error) {
    console.error(
      'An unexpected error occurred while fetching checklist details',
      error
    );
    return {
      success: false,
      message: ERROR_MESSAGES.UNEXPECTED_ERROR
    };
  }
};

export const getChecklistDetailsById = async (
  topicId: number
): Promise<{
  success: boolean;
  message: string;
  data?: ChecklistTopicAndQuestionsType;
}> => {
  const supabase = await createClient();

  try {
    const { data, error } = await supabase
      .from('ehs_checklist_topics')
      .select(
        `
          id,
          topic_name,
          image_url,
          ehs_checklist_questions(
            id,
            question,
            weightage
          )
        `
      )
      .eq('id', topicId)
      .single();

    if (error) {
      console.error('Error while fetching checklist details', error);
      return {
        success: false,
        message: ERROR_MESSAGES.CHECKLIST_DETAILS_NOT_FETCHED
      };
    }

    return {
      success: true,
      message: SUCCESS_MESSAGES.CHECKLIST_DETAILS_FETCHED,
      data: data as ChecklistTopicAndQuestionsType
    };
  } catch (error) {
    console.error(
      'An unexpected error occurred while fetching checklist details',
      error
    );
    return {
      success: false,
      message: ERROR_MESSAGES.UNEXPECTED_ERROR
    };
  }
};

export const addChecklistResponseByContractor = async (
  checklist: ChecklistResponseByContractorType,
  userId: string,
  totalWeightage: number
) => {
  const supabase = await createClient();

  try {
    const { data: addedChecklist, error: addChecklistError } = await supabase
      .from('ehs_checklist_users')
      .insert({
        user_id: userId,
        topic_id: checklist.topicId,
        progress: [
          { date: new Date().toISOString(), progress: totalWeightage }
        ],
        date: checklist.date,
        inspected_by: checklist.inspected_by,
        site_name: checklist.site_name
      })
      .select('id')
      .single();

    if (addChecklistError) {
      console.error(
        'Error while adding checklist questions',
        addChecklistError
      );
      return {
        success: false,
        message: ERROR_MESSAGES.CHECKLIST_DETAILS_NOT_ADDED
      };
    }

    const insertQuestions = checklist.answers.map(question => {
      return {
        question_id: Number(question.questionId),
        checklist_user_id: addedChecklist.id,
        remarks: question.remark ?? '',
        is_completed: question.answer ?? 'N/A'
      };
    });

    const { error } = await supabase
      .from('ehs_checklist_done_questions')
      .insert(insertQuestions);

    if (error) {
      console.error(
        'Error while adding checklist questions',
        addChecklistError
      );
      return {
        success: false,
        message: ERROR_MESSAGES.CHECKLIST_DETAILS_NOT_ADDED
      };
    }

    getAuthId().then((authId) => {
      if (authId) {
        sendPushNotification(authId, 'checklist_submission', {
          title: 'Checklist Submitted',
          body: 'Your checklist has been submitted successfully.',
          url: '/contractor/ehs/checklists',
        }).catch((err) => console.error('[push] checklist notification failed:', err));
      }
    }).catch(() => {});

    return {
      success: true,
      message: SUCCESS_MESSAGES.CHECKLIST_DETAILS_ADDED
    };
  } catch (error) {
    console.error(
      'An unexpected error occurred while adding checklist details',
      error
    );
    return {
      success: false,
      message: ERROR_MESSAGES.UNEXPECTED_ERROR
    };
  }
};

export const updateChecklistResponseByContractor = async (
  checklist: ChecklistResponseByContractorType,
  userId: string,
  prevProgress: ChecklistProgressType,
  totalWeightage: number
) => {
  const supabase = createServiceClient();

  try {
    const prevProgressArray = Array.isArray(prevProgress.progress) ? prevProgress.progress : [];

    // First, update the main checklist entry
    const { error: updateChecklistError } = await supabase
      .from('ehs_checklist_users')
      .update({
        progress: [
          ...prevProgressArray,
          { date: new Date().toISOString(), progress: totalWeightage }
        ],
        date: checklist.date,
        inspected_by: checklist.inspected_by,
        site_name: checklist.site_name
      })
      .eq('id', prevProgress.id)
      .eq('user_id', userId);

    if (updateChecklistError) {
      console.error('Error while updating checklist', updateChecklistError);
      return {
        success: false,
        message: ERROR_MESSAGES.CHECKLIST_UPDATE_FAILED
      };
    }

    // Delete existing questions for this checklist
    const { error: deleteError } = await supabase
      .from('ehs_checklist_done_questions')
      .delete()
      .eq('checklist_user_id', prevProgress.id);

    if (deleteError) {
      console.error(
        'Error while deleting existing checklist questions',
        deleteError
      );
      return {
        success: false,
        message: ERROR_MESSAGES.CHECKLIST_UPDATE_FAILED
      };
    }

    // Insert updated questions
    const insertQuestions = checklist.answers.map(question => ({
      question_id: Number(question.questionId),
      checklist_user_id: prevProgress.id,
      remarks: question.remark ?? '',
      is_completed: question.answer ?? 'N/A'
    }));

    const { error: insertError } = await supabase
      .from('ehs_checklist_done_questions')
      .insert(insertQuestions);

    if (insertError) {
      console.error(
        '[STEP 3] Error while inserting updated checklist questions',
        insertError
      );
      return {
        success: false,
        message: ERROR_MESSAGES.CHECKLIST_UPDATE_FAILED
      };
    }

    return {
      success: true,
      message: SUCCESS_MESSAGES.CHECKLIST_UPDATED
    };
  } catch (error) {
    console.error(
      'An unexpected error occurred while updating checklist details',
      error
    );
    return {
      success: false,
      message: ERROR_MESSAGES.UNEXPECTED_ERROR
    };
  }
};

export const getChecklistProgressByContractor = async (topicId: number) => {
  const supabase = await createClient();

  try {
    const userId = await getUserIdFromAuth();

    if (!userId) {
      return {
        data: null,
        success: false,
        message: ERROR_MESSAGES.USER_NOT_FOUND
      };
    }
    const { data, error } = await supabase
      .from('ehs_checklist_users')
      .select(
        `
        id,
        progress
      `
      )
      .eq('user_id', userId)
      .eq('topic_id', topicId)
      .maybeSingle();

    if (error) {
      console.error('Error fetching checklist responses', error);
      return {
        data: null,
        success: false,
        message: ERROR_MESSAGES.CHECKLIST_FETCH_FAILED
      };
    }

    return {
      success: true,
      data: data
    };
  } catch (error) {
    console.error('Unexpected error fetching checklist responses', error);
    return {
      data: null,
      success: false,
      message: ERROR_MESSAGES.UNEXPECTED_ERROR
    };
  }
};

export const getMyChecklistSubmissions = async (): Promise<{
  success: boolean;
  message: string;
  data?: {
    id: number;
    topic_id: number;
    topic_name: string;
    date: string;
    site_name: string;
    inspected_by: string;
    progress: { date: string; progress: number }[];
  }[];
}> => {
  const supabase = createServiceClient();

  try {
    const userId = await getUserIdFromAuth();

    if (!userId) {
      return { success: false, message: `USER_NOT_FOUND` };
    }

    const { data: submissions, error } = await supabase
      .from('ehs_checklist_users')
      .select('id, topic_id, date, site_name, inspected_by, progress')
      .eq('user_id', userId)
      .order('date', { ascending: false });

    if (error) {
      console.error('Error fetching checklist submissions', error);
      return { success: false, message: ERROR_MESSAGES.CHECKLIST_FETCH_FAILED };
    }

    if (!submissions || submissions.length === 0) {
      return { success: true, message: `NO_DATA_FOR_USER:${userId}`, data: [] };
    }

    const topicIds = Array.from(new Set(submissions.map(r => r.topic_id).filter((id): id is number => id !== null)));
    const { data: topics } = await supabase
      .from('ehs_checklist_topics')
      .select('id, topic_name')
      .in('id', topicIds);

    const topicMap: Record<number, string> = {};
    (topics ?? []).forEach((t: any) => { topicMap[t.id] = t.topic_name; });

    return {
      success: true,
      message: SUCCESS_MESSAGES.CHECKLIST_DETAILS_FETCHED,
      data: submissions.map((row: any) => ({
        id: row.id,
        topic_id: row.topic_id,
        topic_name: topicMap[row.topic_id] ?? '',
        date: row.date,
        site_name: row.site_name,
        inspected_by: row.inspected_by,
        progress: row.progress ?? []
      }))
    };
  } catch (error) {
    console.error('Unexpected error fetching checklist submissions', error);
    return { success: false, message: ERROR_MESSAGES.UNEXPECTED_ERROR };
  }
};

export const sendChecklistCompleteEmail = async (
  superiorEmail: string,
  emailContext: sendChecklistMailType,
  userName: string,
  ccEmails?: string[]
) => {
  try {
    const supabase = await createClient();
    const subject = 'Safezy | Checklist Completion Notification';

    const payload: Record<string, unknown> = {
      to: superiorEmail,
      subject,
      html: checklistCompletionEmailHTML(userName, emailContext)
    };

    if (ccEmails && ccEmails.length > 0) {
      payload.cc = ccEmails.join(',');
    }

    await supabase.functions.invoke('send-email', {
      body: payload
    });

    return {
      success: true,
      message: SUCCESS_MESSAGES.CHECKLIST_COMPLETE
    };
  } catch (error) {
    console.error('Error in sending checklist complete email:', error);
    return {
      success: false,
      message: ERROR_MESSAGES.CHECKLIST_COMPLETE_NOT_SENT
    };
  }
};
