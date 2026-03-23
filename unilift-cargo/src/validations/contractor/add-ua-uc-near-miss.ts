import { z } from 'zod';

// ─── File size limits ─────────────────────────────────────────────────────────
const MAX_IMAGE_SIZE  = 10  * 1024 * 1024; //  10 MB
const MAX_VIDEO_SIZE  = 100 * 1024 * 1024; // 100 MB
const MAX_AUDIO_SIZE  = 25  * 1024 * 1024; //  25 MB

const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const ACCEPTED_VIDEO_TYPES = ['video/mp4', 'video/quicktime', 'video/webm'];
const ACCEPTED_AUDIO_TYPES = ['audio/mpeg', 'audio/mp4', 'audio/wav', 'audio/webm', 'audio/ogg'];

// ─── Constants ────────────────────────────────────────────────────────────────

export const UA_CLASSIFICATIONS = [
  'Not using PPE',
  'Improper handling of equipment',
  'Bypassing safety devices',
  'Unsafe lifting / posture',
  'Operating without authorization',
] as const;

export const UC_CLASSIFICATIONS = [
  'Oil spill / slippery floor',
  'Damaged tools / equipment',
  'Poor housekeeping',
  'Exposed wiring',
  'Inadequate guarding',
  'Poor lighting / ventilation',
] as const;

export const NEAR_MISS_SEVERITY = ['Low', 'Medium', 'High'] as const;

export const OBSERVATION_TYPES = [
  { value: 'UA',       label: 'Unsafe Act (UA)' },
  { value: 'UC',       label: 'Unsafe Condition (UC)' },
  { value: 'NearMiss', label: 'Near Miss' },
] as const;

// ─── Main form schema ─────────────────────────────────────────────────────────

export const UaUcNearMissSchema = z
  .object({
    // Section 1 — auto-filled, only this field is user input
    location_department: z
      .string({ required_error: 'Location / Department is required' })
      .min(2, 'Location must be at least 2 characters'),

    // Section 2 — observation type
    observation_type: z.enum(['UA', 'UC', 'NearMiss'], {
      required_error: 'Please select a type of observation',
    }),

    // Section 3 — media upload
    media: z
      .instanceof(File)
      .refine(file => {
        const allAccepted = [...ACCEPTED_IMAGE_TYPES, ...ACCEPTED_VIDEO_TYPES, ...ACCEPTED_AUDIO_TYPES];
        return allAccepted.includes(file.type);
      }, 'Unsupported file type. Accepted: image (jpg/png/webp), video (mp4/mov/webm), audio (mp3/wav/ogg).')
      .refine(file => {
        if (ACCEPTED_IMAGE_TYPES.includes(file.type)) return file.size <= MAX_IMAGE_SIZE;
        if (ACCEPTED_VIDEO_TYPES.includes(file.type)) return file.size <= MAX_VIDEO_SIZE;
        if (ACCEPTED_AUDIO_TYPES.includes(file.type)) return file.size <= MAX_AUDIO_SIZE;
        return false;
      }, 'File exceeds the size limit (image: 10MB, video: 100MB, audio: 25MB).')
      .optional(),

    media_type: z.enum(['image', 'video', 'voice']).optional(),

    // Section 3 — AI-analyzed fields (pre-filled, user can edit)
    what_happened:      z.string().optional(),
    equipment_involved: z.string().optional(),
    activity_at_time:   z.string().optional(),

    // Section 4 — UA classification
    ua_classifications: z.array(z.string()).optional(),
    ua_other:           z.string().optional(),

    // Section 4 — UC classification
    uc_classifications:    z.array(z.string()).optional(),
    uc_other:              z.string().optional(),
    uc_severity:           z.enum(['Low', 'Medium', 'High']).optional(),
    uc_temporary_controls: z.string().optional(),

    // Section 4 — Near Miss classification
    nm_potential_injury:  z.string().optional(),
    nm_what_could_happen: z.string().optional(),
    nm_severity:          z.enum(['Low', 'Medium', 'High']).optional(),

    // Section 6 — status
    status: z.enum(['Open', 'Closed'], {
      required_error: 'Please select a status',
    }),

    // Section 6 — close fields (required only when status = Closed)
    action_taken: z.string().optional(),
    action_by:    z.string().optional(),
    action_date:  z.string().optional(),
  })
  .superRefine((_data, _ctx) => {
    // Classification and status fields are AI-filled or system-set.
    // No client-side required validation needed for these.
  });
