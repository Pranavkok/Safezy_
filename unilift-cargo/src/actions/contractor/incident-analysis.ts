'use server';

import { ERROR_MESSAGES, SUCCESS_MESSAGES } from '@/constants/constants';
import {
  AddAdditionalCommentsType,
  AddAffectedPersonDetailsType,
  AddHistoricalDataType,
  AddIncidentBasicDetailsType,
  AddIncidentTitleType,
  AddInvestigationChecklistType,
  AddPreIncidentOperationDetailsType,
  AddWitnessDetailsType
} from '@/types/ehs.types';
import { IncidentAnalysisWithImageType } from '@/types/index.types';
import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

export const getIncidentDetailsById = async (
  incidentId: number
): Promise<{
  success: boolean;
  message: string;
  data?: IncidentAnalysisWithImageType;
}> => {
  const supabase = await createClient();

  try {
    const { data, error } = await supabase
      .from('ehs_incident_analysis')
      .select('*, images(id, image_url)')
      .eq('id', incidentId)
      .single();

    if (error) {
      console.error('Error while fetching incident details', error);
      return {
        success: false,
        message: ERROR_MESSAGES.INCIDENT_DETAILS_NOT_FETCHED
      };
    }

    return {
      success: true,
      message: SUCCESS_MESSAGES.INCIDENT_DETAILS_FETCHED,
      data
    };
  } catch (error) {
    console.error(
      'An unexpected error occurred while fetching incident details',
      error
    );
    return {
      success: false,
      message: ERROR_MESSAGES.UNEXPECTED_ERROR
    };
  }
};

export const addIncidentTitle = async (
  incidentTitle: AddIncidentTitleType
): Promise<{
  data?: { id: number };
  success: boolean;
  message: string;
}> => {
  const supabase = await createClient();

  try {
    const { data, error } = await supabase
      .from('ehs_incident_analysis')
      .insert({ title: incidentTitle.title })
      .select('id')
      .single();

    if (error) {
      console.error('Error while adding incident title', error);
      return {
        success: false,
        message: ERROR_MESSAGES.INCIDENT_TITLE_NOT_ADDED
      };
    }

    return {
      data: data,
      success: true,
      message: SUCCESS_MESSAGES.INCIDENT_TITLE_ADDED
    };
  } catch (error) {
    console.error(
      'An unexpected error occurred while adding incident title',
      error
    );
    return {
      success: false,
      message: ERROR_MESSAGES.UNEXPECTED_ERROR
    };
  }
};

export const updateIncidentTitle = async (
  incidentTitle: AddIncidentTitleType,
  incidentId: number
): Promise<{
  success: boolean;
  message: string;
}> => {
  const supabase = await createClient();

  try {
    const { error } = await supabase
      .from('ehs_incident_analysis')
      .update({ title: incidentTitle.title })
      .eq('id', incidentId);

    if (error) {
      console.error('Error while updating incident title', error);
      return {
        success: false,
        message: ERROR_MESSAGES.INCIDENT_TITLE_NOT_UPDATED
      };
    }

    revalidatePath('/ehs/incident-analysis');

    return {
      success: true,
      message: SUCCESS_MESSAGES.INCIDENT_TITLE_UPDATED
    };
  } catch (error) {
    console.error(
      'An unexpected error occurred while updating incident title',
      error
    );
    return {
      success: false,
      message: ERROR_MESSAGES.UNEXPECTED_ERROR
    };
  }
};

export const addIncidentBasicDetails = async (
  incidentDetails: AddIncidentBasicDetailsType,
  incidentId: number
): Promise<{
  success: boolean;
  message: string;
}> => {
  const supabase = await createClient();

  try {
    const { error } = await supabase
      .from('ehs_incident_analysis')
      .update({
        narrative: incidentDetails.narrative,
        investigation_team: incidentDetails.investigation_team,
        date: incidentDetails.incident_datetime,
        location: incidentDetails.location,
        affected_entity: incidentDetails.affected_entity,
        custom_affected_entity: incidentDetails.custom_affected_entity,
        updated_at: new Date().toISOString()
      })
      .eq('id', incidentId);

    if (error) {
      console.error('Error while adding incident details', error);
      return {
        success: false,
        message: ERROR_MESSAGES.INCIDENT_BASIC_DETAILS_NOT_ADDED
      };
    }
    revalidatePath('/ehs/incident-analysis');

    return {
      success: true,
      message: SUCCESS_MESSAGES.INCIDENT_BASIC_DETAILS_ADDED
    };
  } catch (error) {
    console.error(
      'An unexpected error occurred while adding incident title',
      error
    );
    return {
      success: false,
      message: ERROR_MESSAGES.UNEXPECTED_ERROR
    };
  }
};

export const addAffectedPersonDetails = async (
  personDetails: AddAffectedPersonDetailsType,
  incidentId: number
): Promise<{
  success: boolean;
  message: string;
}> => {
  const supabase = await createClient();

  try {
    const incident = {
      entity_details: personDetails.entity_details,
      cause_to_entity: personDetails.cause_details,
      entity_shift_date: personDetails.shift_start,
      entity_shift_details: personDetails.shift_details,
      updated_at: new Date().toISOString()
    };

    const { error } = await supabase
      .from('ehs_incident_analysis')
      .update(incident)
      .eq('id', incidentId);

    if (error) {
      console.error("Error while adding affectd person's details", error);
      return {
        success: false,
        message: ERROR_MESSAGES.AFFECTED_PERSON_DETAILS_NOT_ADDED
      };
    }
    revalidatePath('/ehs/incident-analysis');

    return {
      success: true,
      message: SUCCESS_MESSAGES.AFFECTED_PERSON_DETAILS_ADDED
    };
  } catch (error) {
    console.error(
      'An unexpected error occurred while adding incident title',
      error
    );
    return {
      success: false,
      message: ERROR_MESSAGES.UNEXPECTED_ERROR
    };
  }
};

export const addPreIncidentOperationDetails = async (
  operationDetails: AddPreIncidentOperationDetailsType,
  incidentId: number
): Promise<{
  success: boolean;
  message: string;
}> => {
  const supabase = await createClient();

  try {
    const { error } = await supabase
      .from('ehs_incident_analysis')
      .update({
        process_before_incident: operationDetails.process_details,
        team_involved: operationDetails.team_members,
        instructions_communicated: operationDetails.training_communicated,
        tools_involved: operationDetails.equipment,
        regular_process: operationDetails.is_regular_process,
        process_frequency: operationDetails.process_frequency,
        updated_at: new Date().toISOString()
      })
      .eq('id', incidentId);

    if (error) {
      console.error('Error while adding pre-incident details', error);
      return {
        success: false,
        message: ERROR_MESSAGES.PRE_INCIDENT_DETAILS_NOT_ADDED
      };
    }

    revalidatePath('/ehs/incident-analysis');

    return {
      success: true,
      message: SUCCESS_MESSAGES.PRE_INCIDENT_DETAILS_ADDED
    };
  } catch (error) {
    console.error(
      'An unexpected error occurred while adding incident title',
      error
    );
    return {
      success: false,
      message: ERROR_MESSAGES.UNEXPECTED_ERROR
    };
  }
};

export const addHistoricalData = async (
  historicalData: AddHistoricalDataType,
  incidentId: number
): Promise<{ success: boolean; message: string }> => {
  const supabase = await createClient();

  try {
    const { error } = await supabase
      .from('ehs_incident_analysis')
      .update({
        training_provided: historicalData.has_training_records,
        training_remarks: historicalData.training_records_remarks,
        is_a_past_incident: historicalData.has_past_incidents,
        past_incident_remarks: historicalData.past_incidents_remarks,
        updated_at: new Date().toISOString()
      })
      .eq('id', incidentId);

    if (error) {
      console.error('Error while adding historical data', error);
      return {
        success: false,
        message: ERROR_MESSAGES.INCIDENT_HISTORY_DETAILS_NOT_ADDED
      };
    }

    revalidatePath('/ehs/incident-analysis');

    return {
      success: true,
      message: SUCCESS_MESSAGES.INCIDENT_HISTORY_DETAILS_ADDED
    };
  } catch (error) {
    console.error(
      'An unexpected error occurred while adding incident title',
      error
    );
    return {
      success: false,
      message: ERROR_MESSAGES.UNEXPECTED_ERROR
    };
  }
};

export const addInvestigationChecklist = async (
  checklistDetails: AddInvestigationChecklistType,
  incidentId: number,
  correctives?: string[],
  preventives?: string[],
  severity_level?: string,
  viva_analysis?: { [key: string]: string },
  flowchart?: { [key: string]: string }
): Promise<{ success: boolean; message: string }> => {
  const supabase = await createClient();

  const data = {
    evidence_employee_list: checklistDetails.interviews,
    updated_at: new Date().toISOString(),
    is_completed: true,
    ...(correctives ? { corrective_actions: correctives } : {}),
    ...(preventives ? { preventive_actions: preventives } : {}),
    ...(viva_analysis ? { viva_analysis: viva_analysis } : {}),
    ...(flowchart ? { flowchart_points: flowchart } : {}),
    severity_level: severity_level
  };

  try {
    const { error } = await supabase
      .from('ehs_incident_analysis')
      .update(data)
      .eq('id', incidentId);

    if (error) {
      console.error(
        'Error while adding investigation checklist details',
        error
      );
      return {
        success: false,
        message: ERROR_MESSAGES.INVESTIGATION_CHECKLIST_NOT_ADDED
      };
    }

    revalidatePath('/ehs/incident-analysis');

    return {
      success: true,
      message: SUCCESS_MESSAGES.INVESTIGATION_CHECKLIST_ADDED
    };
  } catch (error) {
    console.error(
      'An unexpected error occurred while adding incident title',
      error
    );
    return {
      success: false,
      message: ERROR_MESSAGES.UNEXPECTED_ERROR
    };
  }
};

export const addAdditionalComments = async (
  comments: AddAdditionalCommentsType,
  incidentId: number
): Promise<{ success: boolean; message: string }> => {
  const supabase = await createClient();

  const data = {
    additional_comments: comments.additionalComments
  };

  try {
    const { error } = await supabase
      .from('ehs_incident_analysis')
      .update(data)
      .eq('id', incidentId);

    if (error) {
      console.error(
        'Error while adding investigation checklist details',
        error
      );
      return {
        success: false,
        message: ERROR_MESSAGES.ADDITIONAL_COMMENTS_NOT_ADDED
      };
    }

    revalidatePath('/ehs/incident-analysis');

    return {
      success: true,
      message: SUCCESS_MESSAGES.ADDITIONAL_COMMENTS_ADDED
    };
  } catch (error) {
    console.error(
      'An unexpected error occurred while adding incident title',
      error
    );
    return {
      success: false,
      message: ERROR_MESSAGES.UNEXPECTED_ERROR
    };
  }
};

export const addIncidentWitnessDetails = async (
  witnessDetails: Omit<AddWitnessDetailsType, 'images' | 'videos'>,
  incidentId: number,
  uploadImages: { publicUrl: string }[]
  // uploadVideos: { publicUrl: string }[]
) => {
  const supabase = await createClient();

  try {
    const incidentImages = uploadImages?.map(image => ({
      image_url: image.publicUrl,
      incident_analysis_id: incidentId
    }));

    // const incidentVideos = uploadVideos.map(video => ({
    //   video_url: video.publicUrl,
    //   incident_analysis_id: incidentId
    // }));

    const [
      updateWitnessResult,
      imageInsertResult
      // videoInsertResult
    ] = await Promise.all([
      supabase
        .from('ehs_incident_analysis')
        .update({
          witness_name: witnessDetails.witness_name,
          witness_designation: witnessDetails.witness_designation,
          witness_records: witnessDetails.has_recordings,
          updated_at: new Date().toISOString()
        })
        .eq('id', incidentId),
      supabase.from('images').insert(incidentImages)
      // supabase.from('videos').insert(incidentVideos)
    ]);

    if (updateWitnessResult.error) {
      console.error(
        'Error while adding witness details',
        updateWitnessResult.error
      );
      return {
        success: false,
        message: ERROR_MESSAGES.WITNESS_DETAILS_NOT_ADDED
      };
    }

    if (imageInsertResult.error) {
      console.error('Failed to add images', imageInsertResult.error);
      return {
        success: false,
        message: ERROR_MESSAGES.INCIDENT_IMAGE_NOT_ADDED
      };
    }

    // if (videoInsertResult.error) {
    //   console.error('Failed to add videos', videoInsertResult.error);
    //   return {
    //     success: false,
    //     message: ERROR_MESSAGES.INCIDENT_VIDEO_NOT_ADDED
    //   };
    // }

    revalidatePath('/ehs/incident-analysis');

    return {
      success: true,
      message: SUCCESS_MESSAGES.WITNESS_DETAILS_ADDED
    };
  } catch (error) {
    console.error(
      'An unexpected error occurred while adding witness details',
      error
    );
    return {
      success: false,
      message: ERROR_MESSAGES.UNEXPECTED_ERROR
    };
  }
};
