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
  AddWitnessDetailsType,
  ContributingFactorsType,
  IncidentAnalysisListItem,
  IncidentPage1Type,
  IncidentPage2Type,
  RootCausesJsonType
} from '@/types/ehs.types';
import { IncidentAnalysisWithImageType } from '@/types/index.types';
import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';
import { getAuthId } from '../user';
import { sendPushNotification } from '@/lib/web-push';

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
    const authId = await getAuthId();

    const { data, error } = await supabase
      .from('ehs_incident_analysis')
      .insert({ title: incidentTitle.title, reported_by_user_id: authId ?? undefined })
      .select('id')
      .single();

    if (error) {
      console.error('Error while adding incident title', error);
      return {
        success: false,
        message: ERROR_MESSAGES.INCIDENT_TITLE_NOT_ADDED
      };
    }

    getAuthId().then((authId) => {
      if (authId) {
        sendPushNotification(authId, 'incident_report', {
          title: 'Incident Report Filed',
          body: 'Your incident report has been created. Continue filling in the details.',
          url: '/contractor/ehs/incident-analysis',
        }).catch((err) => console.error('[push] incident notification failed:', err));
      }
    }).catch(() => {});

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
  flowchart?: { [key: string]: string },
  immediate_cause?: string,
  contributing_factors?: ContributingFactorsType,
  root_causes?: RootCausesJsonType,
  system_gaps?: string[],
  rca_conclusion?: string
): Promise<{ success: boolean; message: string }> => {
  const supabase = await createClient();

  const data = {
    evidence_employee_list: checklistDetails.interviews,
    updated_at: new Date().toISOString(),
    ...(correctives ? { corrective_actions: correctives } : {}),
    ...(preventives ? { preventive_actions: preventives } : {}),
    ...(viva_analysis ? { viva_analysis: viva_analysis } : {}),
    ...(flowchart ? { flowchart_points: flowchart } : {}),
    severity_level: severity_level,
    ...(immediate_cause ? { immediate_cause } : {}),
    ...(contributing_factors ? { contributing_factors } : {}),
    ...(root_causes ? { root_causes } : {}),
    ...(system_gaps ? { system_gaps } : {}),
    ...(rca_conclusion ? { rca_conclusion } : {})
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

export const savePage1 = async (
  data: IncidentPage1Type,
  uploadImages: { publicUrl: string }[],
  incidentId?: number
): Promise<{ success: boolean; message: string; id?: number }> => {
  const supabase = await createClient();

  try {
    const payload = {
      title: data.title,
      incident_type: data.incident_type,
      incident_type_other: data.incident_type === 'Other' ? (data.incident_type_other || null) : null,
      severity_level: data.severity_level,
      location: data.location,
      date: data.date,
      time: data.time,
      activity_type: data.activity_type,
      pre_incident_activity: data.pre_incident_activity,
      failure_type: data.failure_type,
      failure_type_other: data.failure_type === 'Other' ? (data.failure_type_other || null) : null,
      initial_investigation_findings: data.initial_investigation_findings?.trim() || null,
      narrative: data.narrative,
      how_stopped: data.how_stopped,
      updated_at: new Date().toISOString()
    };

    let savedId = incidentId;

    if (incidentId) {
      // UPDATE existing record
      const { error } = await supabase
        .from('ehs_incident_analysis')
        .update(payload)
        .eq('id', incidentId);
      if (error) {
        console.error('Error updating page 1', error);
        return { success: false, message: ERROR_MESSAGES.UNEXPECTED_ERROR };
      }
    } else {
      // INSERT new record — include reported_by_user_id so the listing can filter by user
      const authId = await getAuthId();
      const { data: inserted, error } = await supabase
        .from('ehs_incident_analysis')
        .insert({ ...payload, reported_by_user_id: authId ?? undefined, is_completed: false })
        .select('id')
        .single();
      if (error || !inserted) {
        console.error('Error inserting page 1', error);
        return { success: false, message: ERROR_MESSAGES.UNEXPECTED_ERROR };
      }
      savedId = inserted.id;

      getAuthId().then((authId) => {
        if (authId) {
          sendPushNotification(authId, 'incident_report', {
            title: 'Incident Report Filed',
            body: 'Your incident report has been created. Continue filling in the details.',
            url: '/contractor/ehs/incident-analysis',
          }).catch((err) => console.error('[push] incident notification failed:', err));
        }
      }).catch(() => {});
    }

    // Upload images (filter out any failed uploads with null/empty publicUrl)
    const validImages = uploadImages.filter(img => !!img.publicUrl);
    if (validImages.length > 0 && savedId) {
      const incidentImages = validImages.map(image => ({
        image_url: image.publicUrl,
        incident_analysis_id: savedId
      }));
      const { error: imgError } = await supabase.from('images').insert(incidentImages);
      if (imgError) {
        console.error('Error saving images', imgError);
        // Don't block the form — incident was saved, just images failed
        console.warn('Images could not be saved but incident was created successfully');
      }
    }

    revalidatePath('/ehs/incident-analysis');
    return { success: true, message: 'Page 1 saved successfully', id: savedId };
  } catch (error) {
    console.error('Unexpected error saving page 1', error);
    return { success: false, message: ERROR_MESSAGES.UNEXPECTED_ERROR };
  }
};

export const savePage2 = async (
  data: IncidentPage2Type,
  incidentId: number,
  correctives?: string[],
  preventives?: string[],
  severity_level?: string,
  viva_analysis?: object,
  flowchart?: object[],
  immediate_cause?: string,
  contributing_factors?: ContributingFactorsType,
  root_causes?: RootCausesJsonType,
  system_gaps?: string[],
  rca_conclusion?: string
): Promise<{ success: boolean; message: string }> => {
  const supabase = await createClient();

  try {
    const updatePayload = {
      controls_failed: data.controls_failed,
      sop_deviation: data.sop_deviation,
      sop_deviation_remarks: data.sop_deviation ? (data.sop_deviation_remarks || null) : null,
      authorization_competence: data.authorization_competence,
      authorization_competence_remarks: data.authorization_competence ? (data.authorization_competence_remarks || null) : null,
      pressure_constraints: data.pressure_constraints,
      has_incident_occurred: data.has_incident_occurred,
      historical_incident_date: data.has_incident_occurred ? (data.historical_incident_date || null) : null,
      past_incidents_text: data.has_incident_occurred ? (data.past_incidents_text || null) : null,
      impact_description: data.impact_description,
      worst_case_potential: data.worst_case_potential,
      immediate_actions: data.immediate_actions,
      is_completed: false,
      updated_at: new Date().toISOString(),
      ...(correctives ? { corrective_actions: correctives } : {}),
      ...(preventives ? { preventive_actions: preventives } : {}),
      ...(viva_analysis ? { viva_analysis } : {}),
      ...(flowchart ? { flowchart_points: flowchart } : {}),
      ...(severity_level ? { severity_level } : {}),
      ...(immediate_cause ? { immediate_cause } : {}),
      ...(contributing_factors ? { contributing_factors: contributing_factors as unknown as import('@/types/supabase').Json } : {}),
      ...(root_causes ? { root_causes: root_causes as unknown as import('@/types/supabase').Json } : {}),
      ...(system_gaps ? { system_gaps } : {}),
      ...(rca_conclusion ? { rca_conclusion } : {})
    };

    const { error } = await supabase
      .from('ehs_incident_analysis')
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .update(updatePayload as any)
      .eq('id', incidentId);

    if (error) {
      console.error('Error saving page 2', error);
      return { success: false, message: ERROR_MESSAGES.UNEXPECTED_ERROR };
    }

    revalidatePath('/ehs/incident-analysis');
    return { success: true, message: 'Report generated successfully' };
  } catch (error) {
    console.error('Unexpected error saving page 2', error);
    return { success: false, message: ERROR_MESSAGES.UNEXPECTED_ERROR };
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

export const updateIncidentReportFull = async (
  incidentId: number,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: Record<string, any>
): Promise<{ success: boolean; message: string }> => {
  const supabase = await createClient();

  try {
    const { error } = await supabase
      .from('ehs_incident_analysis')
      .update({ ...data, updated_at: new Date().toISOString() })
      .eq('id', incidentId);

    if (error) {
      console.error('Error updating incident report', error);
      return { success: false, message: ERROR_MESSAGES.UNEXPECTED_ERROR };
    }

    revalidatePath('/ehs/incident-analysis');
    return { success: true, message: 'Report updated successfully' };
  } catch (error) {
    console.error('Unexpected error updating incident report', error);
    return { success: false, message: ERROR_MESSAGES.UNEXPECTED_ERROR };
  }
};

export const resubmitIncidentReport = async (
  incidentId: number
): Promise<{ success: boolean; message: string }> => {
  const supabase = await createClient();

  try {
    const { error } = await supabase
      .from('ehs_incident_analysis')
      .update({ is_completed: false, assigned_to_user_id: null })
      .eq('id', incidentId);

    if (error) {
      console.error('Error while resubmitting incident report', error);
      return { success: false, message: ERROR_MESSAGES.UNEXPECTED_ERROR };
    }

    revalidatePath('/ehs/incident-analysis');
    return { success: true, message: 'Report reopened for resubmission' };
  } catch (error) {
    console.error('Unexpected error while resubmitting incident report', error);
    return { success: false, message: ERROR_MESSAGES.UNEXPECTED_ERROR };
  }
};

// ─── getIncidentAnalysisList ──────────────────────────────────────────────────

export const getIncidentAnalysisList = async (): Promise<{
  success: boolean;
  message: string;
  data?: IncidentAnalysisListItem[];
}> => {
  const supabase = await createClient();

  try {
    const authId = await getAuthId();
    if (!authId) {
      return { success: false, message: 'You must be logged in to view reports' };
    }

    const { data, error } = await supabase
      .from('ehs_incident_analysis')
      .select('id, title, incident_type, severity_level, location, date, is_completed, assigned_to_user_id, created_at')
      .eq('reported_by_user_id', authId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[getIncidentAnalysisList] error:', error);
      return { success: false, message: ERROR_MESSAGES.UNEXPECTED_ERROR };
    }

    return {
      success: true,
      message: 'Reports fetched successfully',
      data: (data ?? []) as IncidentAnalysisListItem[]
    };
  } catch (error) {
    console.error('[getIncidentAnalysisList] unexpected error:', error);
    return { success: false, message: ERROR_MESSAGES.UNEXPECTED_ERROR };
  }
};
