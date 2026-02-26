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
  teamMemberBasicSchema,
  teamMemberSchema
} from '@/validations/contractor/add-incident-analysis';
import { AddToolboxNoteSchema } from '@/validations/contractor/add-toolbox-note';
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
> & { image_url: string };
export type EhsChecklistType = z.infer<typeof EhsChecklistFormSchema>;
export type sendChecklistMailType = Omit<
  ChecklistResponseByContractorType,
  'topicId'
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
  users: User;
  ehs_toolbox_talk: EhsToolboxTalk;
};

export type UserDetails = {
  firstName: string;
  lastName: string;
  email: string;
  topicName: string;
  sessionDate: string;
};

export type ChecklistType = {
  id: number;
  topic_name: string;
  performed?: {
    count: number;
  }[];
};

export type ToolboxNoteType = z.infer<typeof AddToolboxNoteSchema>;

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
