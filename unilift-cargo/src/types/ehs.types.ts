import {
  AddBlogSchema,
  SubscribeToBlogSchema
} from '@/validations/admin/add-blog';
import {
  EhsChecklistFormSchema,
  formSchema
} from '@/validations/admin/add-checklist';
import { AddSuggestionSchema } from '@/validations/admin/add-ehs-suggestions';
import { addFirstPrinciplesSchema } from '@/validations/admin/add-first-principles';
import {
  AddToolboxTalkSchema,
  AddToolboxTalkUserSchema
} from '@/validations/admin/add-toolbox-talk';
import {
  AddAdditionalCommentsSchema,
  AddAffectedPersonDetailsSchema,
  AddHistoricalDataSchema,
  AddIncidentBasicDetails,
  AddIncidentTitleSchema,
  AddInvestigationChecklistSchema,
  AddPreIncidentOperationDetailsSchema,
  AddWitnessDetailsSchema,
  employeeInterviewSchema,
  entityDetailsSchema,
  equipmentSchema,
  IncidentPage1Schema,
  IncidentPage2Schema,
  teamMemberBasicSchema,
  teamMemberSchema
} from '@/validations/contractor/add-incident-analysis';
import { AddToolboxNoteSchema } from '@/validations/contractor/add-toolbox-note';
import { UaUcNearMissSchema } from '@/validations/contractor/add-ua-uc-near-miss';
import { z } from 'zod';

export type addToolboxType = Omit<
  z.infer<typeof AddToolboxTalkSchema>,
  'pdf_url'
> & {
  pdf_url: string;
};

export type updateToolboxType = Omit<
  z.infer<typeof AddToolboxTalkSchema>,
  'pdf_url'
> & {
  pdf_url: string;
};

export type AddBlogType = Omit<z.infer<typeof AddBlogSchema>, 'image_url'> & {
  image_url: string;
};

export type UpdateBlogType = Omit<
  z.infer<typeof AddBlogSchema>,
  'image_url'
> & {
  image_url: string;
};

export type addToolboxTalkType = z.infer<typeof AddToolboxTalkSchema>;
export type updateToolboxTalkType = z.infer<typeof AddToolboxTalkSchema>;

export type addToolboxUserType = z.infer<typeof AddToolboxTalkUserSchema>;

export type addFirstPrinciplesType = z.infer<typeof addFirstPrinciplesSchema>;
export type addFirstPrinciplesDataType = Omit<
  z.infer<typeof addFirstPrinciplesSchema>,
  'image_url'
> & {
  image_url: string;
};
export type updateFirstPrinciplesType = z.infer<
  typeof addFirstPrinciplesSchema
>;

export type addSuggestionType = z.infer<typeof AddSuggestionSchema>;

export type ChecklistResponseByContractorType = z.infer<typeof formSchema>;
export type EhsChecklistFormType = Omit<
  z.infer<typeof EhsChecklistFormSchema>,
  'image_url'
> & { image_url: string; header_fields: { label: string }[] };
export type EhsChecklistType = z.infer<typeof EhsChecklistFormSchema>;
export type sendChecklistMailType = Omit<
  ChecklistResponseByContractorType,
  'topicId' | 'cc_emails'
> & {
  topicName: string;
};

export type AddBlogFormType = z.infer<typeof AddBlogSchema>;
export type UpdateBlogFormType = z.infer<typeof AddBlogSchema>;
export type SubscribeToBlogFormType = z.infer<typeof SubscribeToBlogSchema>;

export type AddPreIncidentOperationDetailsType = z.infer<
  typeof AddPreIncidentOperationDetailsSchema
>;

export type AddWitnessDetailsType = z.infer<typeof AddWitnessDetailsSchema>;

export type EquipmentsType = z.infer<typeof equipmentSchema>;
export type TeamMemberType = z.infer<typeof teamMemberSchema>;
export type AddHistoricalDataType = z.infer<typeof AddHistoricalDataSchema>;

export type AddIncidentTitleType = z.infer<typeof AddIncidentTitleSchema>;

export type IncidentPage1Type = z.infer<typeof IncidentPage1Schema>;
export type IncidentPage2Type = z.infer<typeof IncidentPage2Schema>;

export type EmployeeInterviewsType = z.infer<typeof employeeInterviewSchema>;

export type AddInvestigationChecklistType = z.infer<
  typeof AddInvestigationChecklistSchema
>;

export type AddAdditionalCommentsType = z.infer<
  typeof AddAdditionalCommentsSchema
>;

export type AddAffectedPersonDetailsType = z.infer<
  typeof AddAffectedPersonDetailsSchema
>;

export type TeamMemberBasicType = z.infer<typeof teamMemberBasicSchema>;

export type EntityDetailsType = z.infer<typeof entityDetailsSchema>;

export type AddIncidentBasicDetailsType = z.infer<
  typeof AddIncidentBasicDetails
>;

export type ChecklistTopicAndQuestionsType = {
  id: number;
  topic_name: string;
  image_url: string;
  header_fields?: { label: string }[];
  ehs_checklist_questions: {
    id: number;
    question: string;
    weightage: number;
  }[];
};

export type ChecklistProgressType = {
  id: number;
  progress: {
    date: string;
    progress: number;
  }[];
};

export type ToolboxCompleteDataType = {
  best_performer: string;
  users: {
    first_name: string;
    last_name: string;
  } | null;
  ehs_toolbox_talk: {
    topic_name: string;
  } | null;
};

export type toolboxValidDataType = {
  bestPerformer: string;
};

export type ContractorChecklistType = {
  users: { first_name: string; last_name: string; email: string } | null;
};

export type ChecklistDetailsType =
  | {
      id: number;
      progress: { date: string; progress: number }[];
      topics: {
        topic_name: string;
      } | null;
      questions: {
        question_id: number;
        remarks: string | null;
        is_completed: 'Yes' | 'No' | 'N/A';
        questions: {
          question: string;
        };
      }[];
    }[]
  | null;

export type User = {
  first_name: string;
  last_name: string;
  email: string;
};

export type EhsToolboxTalk = {
  topic_name: string;
};

export type ToolboxUserEntry = {
  user_id: string;
  created_at: string;
  duration_seconds?: number | null;
  users: User;
  ehs_toolbox_talk: EhsToolboxTalk;
};

export type UserDetails = {
  firstName: string;
  lastName: string;
  email: string;
  topicName: string;
  sessionDate: string;
  durationSeconds: number | null;
};

export type ChecklistType = {
  id: number;
  topic_name: string;
  performed?: {
    count: number;
  }[];
};

export type ToolboxNoteType = z.infer<typeof AddToolboxNoteSchema>;

export type ToolboxTalkCompletionReport = {
  id: number;
  created_at: string;
  duration_seconds: number | null;
  rating: number | null;
  superior_email: string;
  comments: string;
  topic_name: string;
  first_name: string;
  last_name: string;
  email: string;
  attendance_images: string[];
};

export type FiveWhysPointType = {
  question: string;
  answer: string;
};

export type FiveWhysAnalysisJsonType = {
  points: FiveWhysPointType[];
};

export type FlowchartJsonType = {
  no: number;
  title: string;
  description: string;
};

export type ContributingFactorsType = {
  people: string;
  process: string;
  equipment: string;
  environment: string;
};

export type RootCausePointType = {
  cause: string;
  effect: string;
};

export type RootCausesJsonType = {
  points: RootCausePointType[];
};

// ─── UA / UC / Near Miss ───────────────────────────────────────────────────

export type ObservationType = 'UA' | 'UC' | 'NearMiss';
export type ObservationStatus = 'Open' | 'Assigned' | 'Closed';
export type NearMissSeverity = 'Low' | 'Medium' | 'High';
export type MediaType = 'image' | 'video' | 'voice';

export type UaUcNearMissFormType = z.infer<typeof UaUcNearMissSchema>;

export type UaUcNearMissRecord = {
  id: number;
  report_no: string;
  observation_type: ObservationType;
  reported_at: string;
  location_department: string;
  reported_by_user_id: string;
  reported_by_name: string;
  employee_id: string;
  what_happened: string | null;
  equipment_involved: string | null;
  activity_at_time: string | null;
  media_url: string | null;
  media_type: MediaType | null;
  media_urls?: string[] | null;
  media_types?: MediaType[] | null;
  ua_classifications: string[];
  ua_other: string | null;
  uc_classifications: string[];
  uc_other: string | null;
  uc_severity: 'Low' | 'Medium' | 'High' | null;
  uc_temporary_controls: string | null;
  nm_potential_injury: string | null;
  nm_what_could_happen: string | null;
  nm_severity: NearMissSeverity | null;
  status: ObservationStatus;
  action_taken: string | null;
  action_by: string | null;
  action_date: string | null;
  assigned_to_user_id: string | null;
  assigned_to_name: string | null;
  closure_image_url: string | null;
  final_approval: string | null;
  final_approval_remarks: string | null;
  final_approval_at: string | null;
  created_at: string;
  updated_at: string;
};

export type UaUcAiAnalysisResponse = {
  what_happened: string;
  equipment_involved: string;
  action_taken?: string;
  // UA
  ua_classifications?: string[];
  ua_other?: string;
  // UC
  uc_classifications?: string[];
  uc_other?: string;
  uc_severity?: 'Low' | 'Medium' | 'High';
  uc_temporary_controls?: string;
  // Near Miss
  nm_potential_injury?: string;
  nm_what_could_happen?: string;
  nm_severity?: 'Low' | 'Medium' | 'High';
};

export type UaUcNearMissListItem = Pick<
  UaUcNearMissRecord,
  'id' | 'report_no' | 'observation_type' | 'status' | 'reported_at' | 'location_department'
>;

// ─── Incident Analysis ──────────────────────────────────────────────────────

export type IncidentAnalysisStatus = 'Open' | 'Assigned' | 'Closed';

export type IncidentAnalysisListItem = {
  id: number;
  title: string;
  incident_type: string | null;
  severity_level: string | null;
  location: string | null;
  date: string | null;
  is_completed: boolean | null;
  assigned_to_user_id: string | null;
  created_at: string;
};
