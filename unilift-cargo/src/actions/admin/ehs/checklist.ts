'use server';

import { ERROR_MESSAGES, SUCCESS_MESSAGES } from '@/constants/constants';
import {
  addSuggestionType,
  ChecklistDetailsType,
  ChecklistTopicAndQuestionsType,
  ChecklistType,
  ContractorChecklistType,
  EhsChecklistFormType
} from '@/types/ehs.types';
import { SuggestionType, SuggestionWithUserType } from '@/types/index.types';
import { createClient } from '@/utils/supabase/server';
import { createServiceClient } from '@/utils/supabase/service';
import { getAuthId } from '@/actions/user';
import { notifyAllContractors } from '@/lib/notify-all-contractors';
import { sendPushNotification } from '@/lib/web-push';
import { revalidatePath } from 'next/cache';

type ChecklistSuggestionReviewStatus = 'completed' | 'rejected';

const CHECKLIST_SUGGESTIONS_PATH = '/ehs/checklist/my-suggestions';

export const addChecklistTopic = async (
  checklist: EhsChecklistFormType
): Promise<{ success: boolean; message: string }> => {
  const serviceClient = createServiceClient();

  try {
    const { data, error } = await serviceClient
      .from('ehs_checklist_topics')
      .insert({
        topic_name: checklist.topic_name,
        image_url: checklist.image_url
      })
      .select('id')
      .single();

    if (error) {
      console.error('Error while adding checklist topic', error);
      return {
        success: false,
        message: ERROR_MESSAGES.CHECKLIST_TOPIC_NOT_ADDED
      };
    }

    const question = checklist.questions.map(question => {
      return {
        question: question.question,
        weightage: parseInt(question.weight),
        topic_id: data.id
      };
    });

    const { error: checklistQuestionError } = await serviceClient
      .from('ehs_checklist_questions')
      .insert(question);

    if (checklistQuestionError) {
      console.error('Error while adding checlist questions', error);
      return {
        success: false,
        message: ERROR_MESSAGES.CHECKLIST_TOPIC_NOT_ADDED
      };
    }

    notifyAllContractors('portal_checklist', {
      title: 'New Checklist Published',
      body: `"${checklist.topic_name}" checklist is now available for you to complete.`,
      url: '/contractor/ehs/checklists',
    }, { checklist_id: data.id }).catch((err) => console.error('[push] checklist topic notification failed:', err));

    return {
      success: true,
      message: SUCCESS_MESSAGES.CHECKLIST_TOPIC_ADDED
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

export const updateChecklistTopic = async (
  initialData: ChecklistTopicAndQuestionsType,
  checklist: EhsChecklistFormType,
  questionIdsToDelete: number[]
): Promise<{ success: boolean; message: string }> => {
  const serviceClient = createServiceClient();
  const topicId = initialData.id;

  try {
    // Update topic name if changed
    if (
      initialData.topic_name !== checklist.topic_name ||
      initialData.image_url !== checklist.image_url
    ) {
      const { error: topicError } = await serviceClient
        .from('ehs_checklist_topics')
        .update({
          topic_name: checklist.topic_name,
          image_url: checklist.image_url
        })
        .eq('id', topicId);

      if (topicError) {
        console.error('Error while updating checklist topic', topicError);
        return {
          success: false,
          message: ERROR_MESSAGES.CHECKLIST_TOPIC_NOT_UPDATED
        };
      }
    }

    if (questionIdsToDelete.length > 0) {
      const { error: deleteError } = await serviceClient
        .from('ehs_checklist_questions')
        .delete()
        .in('id', questionIdsToDelete);

      if (deleteError) {
        console.error('Error while deleting questions', deleteError);
        return {
          success: false,
          message: ERROR_MESSAGES.CHECKLIST_QUESTION_NOT_DELETED
        };
      }
    }

    const questionsToAdd = checklist.questions
      .filter(question => !question.question_id)
      .map(q => {
        return {
          topic_id: initialData.id,
          question: q.question,
          weightage: parseInt(q.weight)
        };
      });

    if (questionsToAdd.length > 0) {
      const { error: insertError } = await serviceClient
        .from('ehs_checklist_questions')
        .insert(questionsToAdd);

      if (insertError) {
        console.error('Error while adding new questions', insertError);
        return {
          success: false,
          message: ERROR_MESSAGES.CHECKLIST_QUESTION_NOT_UPDATED
        };
      }
    }

    const questionsToUpdate = checklist.questions.filter(q => !!q.question_id);
    for (const q of questionsToUpdate) {
      const { error: updateError } = await serviceClient
        .from('ehs_checklist_questions')
        .update({ question: q.question, weightage: parseInt(q.weight) })
        .eq('id', parseInt(q.question_id!));

      if (updateError) {
        console.error('Error while updating question', updateError);
        return {
          success: false,
          message: ERROR_MESSAGES.CHECKLIST_QUESTION_NOT_UPDATED
        };
      }
    }

    revalidatePath('/admin/ehs/checklist', 'layout');

    return {
      success: true,
      message: SUCCESS_MESSAGES.CHECKLIST_TOPIC_UPDATED
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

export const getAllChecklistTopic = async (
  page: number = 1,
  pageSize: number = 10,
  search: string = ''
): Promise<{
  success: boolean;
  data?: ChecklistType[];
  message: string;
  count?: number;
}> => {
  const serviceClient = createServiceClient();

  try {
    const query = serviceClient
      .from('ehs_checklist_topics')
      .select('id, topic_name ', { count: 'exact' })
      .order('created_at', { ascending: false });

    if (search) {
      query.ilike('topic_name', `%${search}%`);
    }

    const from = (page - 1) * pageSize;
    query.range(from, from + pageSize - 1);

    const { data: checklistTopics, error, count } = await query;

    if (error) {
      console.error('Error while fetching checklist topics', error);
      return {
        success: false,
        message: ERROR_MESSAGES.CHECKLIST_TOPICS_NOT_FETCHED,
        data: []
      };
    }

    return {
      success: true,
      data: checklistTopics || [],
      message: SUCCESS_MESSAGES.CHECKLIST_TOPICS_FETCHED,
      count: count || 0
    };
  } catch (error) {
    console.error(
      'An unexpected error occurred while fetching checklists',
      error
    );
    return {
      success: false,
      message: ERROR_MESSAGES.UNEXPECTED_ERROR,
      data: []
    };
  }
};

export const getAllChecklistTopicWithPerformedCount = async (
  page: number = 1,
  pageSize: number = 10,
  search: string = ''
): Promise<{
  success: boolean;
  data?: ChecklistType[];
  message: string;
  count?: number;
}> => {
  const serviceClient = createServiceClient();

  try {
    const query = serviceClient
      .from('ehs_checklist_topics')
      .select('id, topic_name, performed:ehs_checklist_users(count) ', {
        count: 'exact'
      })
      .order('created_at', { ascending: false });

    if (search) {
      query.ilike('topic_name', `%${search}%`);
    }

    const from = (page - 1) * pageSize;
    query.range(from, from + pageSize - 1);

    const { data: checklistTopics, error, count } = await query;

    if (error) {
      console.error('Error while fetching checklist topics', error);
      return {
        success: false,
        message: ERROR_MESSAGES.CHECKLIST_TOPICS_NOT_FETCHED,
        data: []
      };
    }

    return {
      success: true,
      data: checklistTopics || [],
      message: SUCCESS_MESSAGES.CHECKLIST_TOPICS_FETCHED,
      count: count || 0
    };
  } catch (error) {
    console.error(
      'An unexpected error occurred while fetching checklists',
      error
    );
    return {
      success: false,
      message: ERROR_MESSAGES.UNEXPECTED_ERROR,
      data: []
    };
  }
};

export const getAllContractorsDoneChecklist = async (
  topicId: number
): Promise<{
  success: boolean;
  message: string;
  data?: ContractorChecklistType[];
}> => {
  const serviceClient = createServiceClient();

  try {
    const { data, error } = await serviceClient
      .from('ehs_checklist_users')
      .select(
        `users(
        first_name,
        last_name,
        email
      )`
      )
      .eq('topic_id', topicId);

    if (error) {
      console.error('Error while fetching contractor details', error);
      return {
        success: false,
        message: ERROR_MESSAGES.CHECKLIST_CONTRACTOR_NOT_FETCHED
      };
    }

    return {
      success: true,
      message: SUCCESS_MESSAGES.CHECKLIST_CONTRACTOR_FETCHED,
      data
    };
  } catch (error) {
    console.error(
      'An unexpected error occurred while fetching contractor details',
      error
    );
    return {
      success: false,
      message: ERROR_MESSAGES.UNEXPECTED_ERROR
    };
  }
};

export const getChecklistResponseByUser = async (
  userId: string,
  topicId: number
): Promise<{
  success: boolean;
  message: string;
  data?: ChecklistDetailsType;
}> => {
  const serviceClient = createServiceClient();

  try {
    const { data, error } = await serviceClient
      .from('ehs_checklist_users')
      .select(
        `
      id,
      progress,
      topics: ehs_checklist_topics (
        topic_name
      ),
      questions:ehs_checklist_done_questions (
          question_id,
          remarks,
          is_completed,
          questions:question_id (question)
        )
      `
      )
      .eq('user_id', userId)
      .eq('topic_id', topicId);

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
      data: data as ChecklistDetailsType
    };
  } catch (error) {
    console.error(
      'An unexpected error occurred while fetching contractor response details',
      error
    );
    return {
      success: false,
      message: ERROR_MESSAGES.UNEXPECTED_ERROR
    };
  }
};

export const deleteChecklist = async (topicId: number) => {
  const serviceClient = createServiceClient();

  try {
    const { error: checklistQuestionError } = await serviceClient
      .from('ehs_checklist_questions')
      .delete()
      .eq('topic_id', topicId);

    if (checklistQuestionError) {
      console.error(
        'Error while deleting checklist questions',
        checklistQuestionError
      );
      return {
        success: false,
        message: ERROR_MESSAGES.CHECKLIST_QUESTION_NOT_DELETED
      };
    }

    const { error: checklistTopicError } = await serviceClient
      .from('ehs_checklist_topics')
      .delete()
      .eq('id', topicId);

    if (checklistTopicError) {
      console.error(
        'Error while deleting the checklist topic',
        checklistTopicError
      );
      return {
        success: false,
        message: ERROR_MESSAGES.CHECKLIST_TOPIC_NOT_DELETED
      };
    }

    return {
      success: true,
      message: SUCCESS_MESSAGES.CHECKLIST_DELETED
    };
  } catch (error) {
    console.error(
      'An unexpected error occurred while deleting checklist',
      error
    );
    return {
      success: false,
      message: ERROR_MESSAGES.UNEXPECTED_ERROR
    };
  }
};

export const addChecklistSuggestion = async (suggestion: addSuggestionType) => {
  const serviceClient = createServiceClient();

  try {
    const userId = await getAuthId();
    const { error } = await serviceClient
      .from('ehs_suggestions')
      .insert({
        topic_name: suggestion.topic_name,
        suggestion_type: 'checklist',
        user_id: userId ?? null
      })
      .single();

    if (error) {
      console.error('Error while adding checklist suggestion', error);
      return {
        success: false,
        message: ERROR_MESSAGES.CHECKLIST_SUGGESTION_NOT_ADDED
      };
    }

    return {
      success: true,
      message: SUCCESS_MESSAGES.CHECKLIST_SUGGESTION_ADDED
    };
  } catch (error) {
    console.error(
      'An unexpected error occurred while adding checklist suggestion',
      error
    );
    return {
      success: false,
      message: ERROR_MESSAGES.UNEXPECTED_ERROR
    };
  }
};

export const getMyChecklistSuggestions = async (): Promise<{
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
      .eq('suggestion_type', 'checklist')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching my checklist suggestions', error);
      return { success: false, message: ERROR_MESSAGES.UNEXPECTED_ERROR };
    }

    return { success: true, message: 'Fetched successfully', data: data as SuggestionType[] };
  } catch (error) {
    console.error('Unexpected error fetching my checklist suggestions', error);
    return { success: false, message: ERROR_MESSAGES.UNEXPECTED_ERROR };
  }
};

export const getChecklistSuggestions = async (): Promise<{
  success: boolean;
  message: string;
  data?: SuggestionWithUserType[];
}> => {
  const serviceClient = createServiceClient();

  try {
    const { data, error } = await serviceClient
      .from('ehs_suggestions')
      .select('*')
      .eq('suggestion_type', 'checklist')
      .eq('review_status', 'pending')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error while fetching checklist suggestions', error);
      return {
        success: false,
        message: ERROR_MESSAGES.CHECKLIST_SUGGESTION_NOT_FETCHED
      };
    }

    const userIds = Array.from(new Set(data.filter(s => s.user_id).map(s => s.user_id as string)));
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
      message: SUCCESS_MESSAGES.CHECKLIST_SUGGESTION_FETCHED,
      data: enrichedData
    };
  } catch (error) {
    console.error(
      'An unexpected error occurred while fetching checklist suggestion',
      error
    );
    return {
      success: false,
      message: ERROR_MESSAGES.UNEXPECTED_ERROR
    };
  }
};

const reviewChecklistSuggestion = async (
  suggestionId: number,
  reviewStatus: ChecklistSuggestionReviewStatus
) => {
  const serviceClient = createServiceClient();

  try {
    const { data: suggestion, error: fetchError } = await serviceClient
      .from('ehs_suggestions')
      .select('id, topic_name, user_id, review_status')
      .eq('id', suggestionId)
      .eq('suggestion_type', 'checklist')
      .maybeSingle();

    if (fetchError || !suggestion) {
      console.error('Error while fetching checklist suggestion', fetchError);
      return {
        success: false,
        message: 'Checklist suggestion not found.'
      };
    }

    if (suggestion.review_status !== 'pending') {
      return {
        success: false,
        message: 'Checklist suggestion has already been reviewed.'
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
      console.error('Error while reviewing checklist suggestion', updateError);
      return {
        success: false,
        message: 'Failed to update checklist suggestion. Please try again.'
      };
    }

    if (suggestion.user_id) {
      const isCompleted = reviewStatus === 'completed';

      await sendPushNotification(
        suggestion.user_id,
        isCompleted
          ? 'checklist_suggestion_completed'
          : 'checklist_suggestion_rejected',
        {
          title: isCompleted
            ? 'Checklist Suggestion Completed'
            : 'Checklist Suggestion Rejected',
          body: isCompleted
            ? `Your checklist suggestion "${suggestion.topic_name}" has been marked as completed.`
            : `Your checklist suggestion "${suggestion.topic_name}" has been rejected.`,
          url: CHECKLIST_SUGGESTIONS_PATH
        },
        {
          suggestion_id: suggestion.id,
          suggestion_type: 'checklist',
          review_status: reviewStatus
        }
      );
    }

    revalidatePath('/admin/ehs/checklist');
    revalidatePath(CHECKLIST_SUGGESTIONS_PATH);

    return {
      success: true,
      message:
        reviewStatus === 'completed'
          ? 'Checklist suggestion marked as completed.'
          : 'Checklist suggestion rejected.'
    };
  } catch (error) {
    console.error(
      'An unexpected error occurred while reviewing checklist suggestion',
      error
    );
    return {
      success: false,
      message: ERROR_MESSAGES.UNEXPECTED_ERROR
    };
  }
};

export const approveChecklistSuggestion = async (suggestionId: number) =>
  reviewChecklistSuggestion(suggestionId, 'completed');

export const rejectChecklistSuggestion = async (suggestionId: number) =>
  reviewChecklistSuggestion(suggestionId, 'rejected');
