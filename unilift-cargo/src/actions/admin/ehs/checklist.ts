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
import { SuggestionType } from '@/types/index.types';
import { createClient } from '@/utils/supabase/server';
import { notifyAllContractors } from '@/lib/notify-all-contractors';

export const addChecklistTopic = async (
  checklist: EhsChecklistFormType
): Promise<{ success: boolean; message: string }> => {
  const supabase = await createClient();

  try {
    const { data, error } = await supabase
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

    const { error: checklistQuestionError } = await supabase
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
  const supabase = await createClient();
  const topicId = initialData.id;

  try {
    // Update topic name if changed
    if (
      initialData.topic_name !== checklist.topic_name ||
      initialData.image_url !== checklist.image_url
    ) {
      const { error: topicError } = await supabase
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
      const { error: deleteError } = await supabase
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
      const { error: insertError } = await supabase
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
  const supabase = await createClient();

  try {
    const query = supabase
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
  const supabase = await createClient();

  try {
    const query = supabase
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
  const supabase = await createClient();

  try {
    const { data, error } = await supabase
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
  const supabase = await createClient();

  try {
    const { data, error } = await supabase
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
  const supabase = await createClient();

  try {
    const { error: checklistQuestionError } = await supabase
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

    const { error: checklistTopicError } = await supabase
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
  const supabase = await createClient();

  try {
    const { error } = await supabase
      .from('ehs_suggestions')
      .insert({
        topic_name: suggestion.topic_name,
        suggestion_type: 'checklist'
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

export const getChecklistSuggestions = async (): Promise<{
  success: boolean;
  message: string;
  data?: SuggestionType[];
}> => {
  const supabase = await createClient();

  try {
    const { data, error } = await supabase
      .from('ehs_suggestions')
      .select('*')
      .eq('suggestion_type', 'checklist');

    if (error) {
      console.error('Error while fetching checklist suggestions', error);
      return {
        success: false,
        message: ERROR_MESSAGES.CHECKLIST_SUGGESTION_NOT_FETCHED
      };
    }

    return {
      success: true,
      message: SUCCESS_MESSAGES.CHECKLIST_SUGGESTION_FETCHED,
      data
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
