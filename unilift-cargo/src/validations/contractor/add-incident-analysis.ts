import { z } from 'zod';

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/png'];

export const teamMemberSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().optional(),
  contact: z.string().min(10, 'Contact number must be at least 10 digits')
});

export const equipmentSchema = z.object({
  name: z.string().optional(),
  is_ehs_checklist_completed: z.string().optional(),
  condition: z.string().optional()
});

export const AddPreIncidentOperationDetailsSchema = z
  .object({
    process_details: z
      .string()
      .min(10, 'Process details must be at least 10 characters')
      .nonempty('Process details are required'),
    team_members: z
      .array(teamMemberSchema)
      .min(1, 'At least one team member is required'),
    training_communicated: z.enum(['Yes', 'No'], {
      required_error: 'Please select if training was communicated'
    }),
    is_regular_process: z.enum(['Yes', 'No'], {
      required_error: 'Please select if this is a regular process'
    }),
    process_frequency: z.string().optional(),
    equipment: z.array(equipmentSchema).optional()
  })
  .refine(
    data => {
      if (data.is_regular_process === 'Yes') {
        return !!data.process_frequency && data.process_frequency.trim() !== '';
      }
      return true;
    },
    {
      message: 'Process frequency is required for regular processes',
      path: ['process_frequency']
    }
  );

export const AddWitnessDetailsSchema = z
  .object({
    witness_name: z
      .string()
      .min(2, 'Name must be at least 2 characters')
      .nonempty('Witness name is required'),
    witness_designation: z.string().nonempty('Witness designation is required'),
    has_recordings: z.enum(['Yes', 'No'], {
      required_error: 'Please select if recordings are available'
    }),
    images: z
      .array(
        z
          .instanceof(File)
          .refine(file => file.size <= MAX_FILE_SIZE, 'Max file size is 5MB.')
          .refine(
            file => ACCEPTED_IMAGE_TYPES.includes(file.type),
            'Only .jpg, .jpeg, .png and files are accepted.'
          )
      )
      .optional()
  })
  .superRefine((data, ctx) => {
    if (
      data.has_recordings === 'Yes' &&
      (!data.images || data.images.length === 0)
    ) {
      ctx.addIssue({
        path: ['images'],
        message: 'At least one image is required when recordings are available',
        code: z.ZodIssueCode.custom
      });
    }
  });

export const AddHistoricalDataSchema = z
  .object({
    has_past_incidents: z.enum(['Yes', 'No'], {
      required_error: 'Please select if there were past incidents'
    }),
    past_incidents_remarks: z.string().optional(),
    has_training_records: z.enum(['Yes', 'No'], {
      required_error: 'Please select if training records exist'
    }),
    training_records_remarks: z.string().optional()
  })
  .superRefine((data, ctx) => {
    if (data.has_past_incidents === 'Yes' && !data.past_incidents_remarks) {
      ctx.addIssue({
        path: ['past_incidents_remarks'],
        message: 'Remarks are required when past incidents exist',
        code: z.ZodIssueCode.custom
      });
    }
    if (data.has_training_records === 'Yes' && !data.training_records_remarks) {
      ctx.addIssue({
        path: ['training_records_remarks'],
        message: 'Remarks are required when training records exist',
        code: z.ZodIssueCode.custom
      });
    }
  });

export const entityDetailsSchema = z.object({
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .nonempty('Name is required'),
  designation: z.string().optional(),
  department: z.string().nonempty('Department is required')
});

export const AddAffectedPersonDetailsSchema = z.object({
  cause_details: z
    .string()
    .min(10, 'Cause details must be at least 10 characters')
    .nonempty('Cause details is required'),
  entity_details: z
    .array(entityDetailsSchema)
    .min(1, 'At least one entity is required'),
  shift_start: z.string().nonempty('Shift start date and time is required'),
  shift_details: z.string().nonempty('Shift details is required')
});

// Define the team member schema
export const teamMemberBasicSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email().optional(),
  contact: z
    .string()
    .trim()
    .min(1, 'Contact Number is required')
    .regex(/^[0-9]{10}$/, {
      message: 'Please enter a valid 10-digit contact number.'
    })
    .length(10, { message: 'Contact number must be 10 digits.' })
});

export const AddIncidentBasicDetails = z.object({
  narrative: z
    .string({ required_error: 'Narrative is required' })
    .min(10, 'Narrative must be at least 10 characters'),
  investigation_team: z
    .array(teamMemberSchema)
    .min(1, 'At least one team member is required'),
  incident_datetime: z
    .string({ required_error: 'Date and time is required' })
    .nonempty('Date and time is required'),
  location: z
    .string({ required_error: 'Location is required' })
    .nonempty('Location is required'),
  affected_entity: z.array(
    z.string({ required_error: 'Affected entity is required' })
  ),
  custom_affected_entity: z.string().optional()
});

export const AddIncidentTitleSchema = z.object({
  title: z
    .string({ required_error: 'Title is required' })
    .min(3, 'Title must be at least 3 characters')
    .max(100, 'Title must not exceed 100 characters')
});

export const employeeInterviewSchema = z.object({
  name: z.string().nonempty('Name is required'),
  designation: z.string().nonempty('Designation is required'),
  relation: z.string().nonempty('Relation with affected entity is required'),
  comments: z
    .string()
    .min(10, 'Comments must be at least 10 characters')
    .nonempty('Comments are required')
});

export const AddInvestigationChecklistSchema = z.object({
  interviews: z
    .array(employeeInterviewSchema)
    .min(1, 'At least one interview is required')
});

export const AddAdditionalCommentsSchema = z.object({
  additionalComments: z.string().optional()
});
