# UA / UC / Near Miss Reporting Module — Implementation Plan

## Overview

A single unified reporting module for **Unsafe Act (UA)**, **Unsafe Condition (UC)**, and **Near Miss** observations.
The user selects the observation type, uploads an **image, video, or voice note**, and AI (Gemini) auto-analyzes the media to pre-fill the report fields.
Reports have an **Open / Closed** status with action tracking.

---

## Architecture Summary

| Layer | Pattern (mirrors Incident Analysis) |
|-------|--------------------------------------|
| Database | Single Supabase table `ehs_ua_uc_near_miss` |
| Migration | New `.sql` file under `unilift-cargo-BE/supabase/migrations/` |
| Types | Added to `src/types/ehs.types.ts` |
| Validation | New Zod schema at `src/validations/contractor/add-ua-uc-near-miss.ts` |
| Server Actions | New file `src/actions/contractor/ua-uc-near-miss.ts` |
| AI Route | New API route `src/app/api/generate-ua-uc-analysis/route.ts` |
| UI Form | `src/sections/ehs/ua-uc-near-miss/index.tsx` (single-page form) |
| Report Viewer | `src/sections/ehs/ua-uc-near-miss/UaUcReportViewer.tsx` |
| PDF | `src/sections/ehs/ua-uc-near-miss/UaUcReportPdf.tsx` |

---

## Form Sections (Single-Page Form)

```
┌─────────────────────────────────────────────────────────┐
│ SECTION 1 — Basic Information (mostly auto-filled)      │
│  • Report No        → auto-generated (UA-2026-0001)     │
│  • Date & Time      → auto (current, locked, no past)   │
│  • Location / Dept  → text input (only user input here) │
│  • Reported By      → from auth session (display only)  │
│  • Employee ID      → from user profile (display only)  │
├─────────────────────────────────────────────────────────┤
│ SECTION 2 — Type of Observation (radio, pick one)       │
│  ○ Unsafe Act (UA)                                      │
│  ○ Unsafe Condition (UC)                                │
│  ○ Near Miss                                            │
├─────────────────────────────────────────────────────────┤
│ SECTION 3 — Upload Media + AI Analysis                  │
│  • Upload button (image / video / voice note)           │
│    – Accepted: image/*, video/*, audio/*                │
│    – Max size: image 10 MB, video 100 MB, audio 25 MB   │
│  • Media type badge shown after upload (Image/Video/    │
│    Voice)                                               │
│  • What happened / observed  → AI fills (editable)      │
│  • Equipment involved        → AI fills (editable)      │
│  • Activity at time          → auto = reporting time    │
├─────────────────────────────────────────────────────────┤
│ SECTION 4 — Classification (dynamic by type)            │
│                                                         │
│  If UA selected:                                        │
│    □ Not using PPE                                      │
│    □ Improper handling of equipment                     │
│    □ Bypassing safety devices                           │
│    □ Unsafe lifting / posture                           │
│    □ Operating without authorization                    │
│    □ Other: _______                                     │
│                                                         │
│  If UC selected:                                        │
│    □ Oil spill / slippery floor                         │
│    □ Damaged tools / equipment                          │
│    □ Poor housekeeping                                  │
│    □ Exposed wiring                                     │
│    □ Inadequate guarding                                │
│    □ Poor lighting / ventilation                        │
│    □ Other: _______                                     │
│                                                         │
│  If Near Miss selected:                                 │
│    • Potential injury type  (text input)                │
│    • What could have happened (textarea)                │
│    • Severity potential: ○ Low  ○ Medium  ○ High        │
├─────────────────────────────────────────────────────────┤
│ SECTION 5 — Evidence                                    │
│  • Media preview based on type:                         │
│    – image → <img> thumbnail                            │
│    – video → <video> player with controls               │
│    – voice → <audio> player with controls               │
├─────────────────────────────────────────────────────────┤
│ SECTION 6 — Status & Action                             │
│  Status: ○ Open  ○ Closed                               │
│                                                         │
│  If Closed → show:                                      │
│    • Action taken   (textarea)                          │
│    • By Whom        (text input)                        │
│    • Date           (date picker)                       │
└─────────────────────────────────────────────────────────┘
```

---

## Database Schema

### Table: `ehs_ua_uc_near_miss`

```sql
id                    BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY
report_no             TEXT NOT NULL UNIQUE          -- e.g. UA-2026-0001
observation_type      TEXT NOT NULL                 -- 'UA' | 'UC' | 'NearMiss'
reported_at           TIMESTAMPTZ NOT NULL DEFAULT now()
location_department   TEXT NOT NULL

-- Auth
reported_by_user_id   UUID REFERENCES auth.users(id)
reported_by_name      TEXT                          -- snapshot from user profile
employee_id           TEXT                          -- snapshot from user profile

-- AI-analyzed fields (Section 3)
what_happened         TEXT                          -- AI-generated, editable
equipment_involved    TEXT                          -- AI-generated, editable
activity_at_time      TEXT                          -- auto = time of reporting

-- Media
media_url             TEXT                          -- Supabase storage URL
media_type            TEXT                          -- 'image' | 'video' | 'voice'

-- Classification: UA (Section 4 — UA)
ua_classifications    JSONB DEFAULT '[]'            -- array of selected checkboxes
ua_other              TEXT                          -- free text if "Other" checked

-- Classification: UC (Section 4 — UC)
uc_classifications    JSONB DEFAULT '[]'            -- array of selected checkboxes
uc_other              TEXT                          -- free text if "Other" checked

-- Classification: Near Miss (Section 4 — NearMiss)
nm_potential_injury   TEXT
nm_what_could_happen  TEXT
nm_severity           TEXT                          -- 'Low' | 'Medium' | 'High'

-- Status & Action (Section 6)
status                TEXT NOT NULL DEFAULT 'Open'  -- 'Open' | 'Closed'
action_taken          TEXT
action_by             TEXT
action_date           DATE

created_at            TIMESTAMPTZ DEFAULT now()
updated_at            TIMESTAMPTZ DEFAULT now()
```

---

## Report No Auto-Generation Logic

Format: `{TYPE}-{YEAR}-{4-digit-sequence}`
Examples: `UA-2026-0001`, `UC-2026-0023`, `NM-2026-0005`

Generated in the server action before insert using:
```sql
SELECT COUNT(*) FROM ehs_ua_uc_near_miss
WHERE observation_type = $1
AND EXTRACT(YEAR FROM reported_at) = EXTRACT(YEAR FROM now())
```
Then pad to 4 digits: `type_prefix + '-' + year + '-' + (count + 1).toString().padStart(4, '0')`

---

## AI Analysis Flow

```
User selects media file (image / video / voice)
       ↓
Detect media_type from MIME:
  image/*  → 'image'
  video/*  → 'video'
  audio/*  → 'voice'
       ↓
Media uploaded to Supabase Storage → media_url + media_type saved
       ↓
POST /api/generate-ua-uc-analysis
  Body: { media_url, media_type, observation_type }
       ↓
Fetch media → base64 encode
       ↓
Build Gemini inlineData part:
  image → { mimeType: 'image/jpeg', data: base64 }
  video → { mimeType: 'video/mp4',  data: base64 }
  voice → { mimeType: 'audio/mpeg', data: base64 }
       ↓
Gemini prompt (tailored by observation_type + media_type):
  "You are an EHS expert. Analyze this [image/video/voice note] and identify:
   1. what_happened: What unsafe act/condition/near miss is visible/described?
   2. equipment_involved: What equipment or tools are involved?"
       ↓
Returns JSON: { what_happened, equipment_involved }
       ↓
Form fields auto-filled (user can edit before submitting)
```

---

## Step-by-Step Implementation

---

### STEP 1 — Database Migration

**File to create:**
`unilift-cargo-BE/supabase/migrations/20260320000001_Create_UA_UC_Near_Miss_Table.sql`

**What to write:**
- `CREATE TABLE ehs_ua_uc_near_miss` with all columns defined above
- `CREATE INDEX` on `observation_type`, `status`, `reported_by_user_id`
- Enable RLS: `ALTER TABLE ehs_ua_uc_near_miss ENABLE ROW LEVEL SECURITY`
- RLS policy: authenticated users can insert/select their own rows

---

### STEP 2 — TypeScript Types

**File to modify:**
`src/types/ehs.types.ts`

**What to add:**
```typescript
// Import from the new validation schema (after step 3)
import { UaUcNearMissSchema, UaUcNearMissCloseSchema } from '@/validations/contractor/add-ua-uc-near-miss';

export type ObservationType = 'UA' | 'UC' | 'NearMiss';
export type ObservationStatus = 'Open' | 'Closed';
export type NearMissSeverity = 'Low' | 'Medium' | 'High';

export type UaUcNearMissFormType = z.infer<typeof UaUcNearMissSchema>;
export type UaUcNearMissCloseType = z.infer<typeof UaUcNearMissCloseSchema>;

export type UaUcNearMissRecord = {
  id: number;
  report_no: string;
  observation_type: ObservationType;
  reported_at: string;
  location_department: string;
  reported_by_name: string;
  employee_id: string;
  what_happened: string | null;
  equipment_involved: string | null;
  activity_at_time: string | null;
  media_url: string | null;
  media_type: 'image' | 'video' | 'voice' | null;
  ua_classifications: string[];
  ua_other: string | null;
  uc_classifications: string[];
  uc_other: string | null;
  nm_potential_injury: string | null;
  nm_what_could_happen: string | null;
  nm_severity: NearMissSeverity | null;
  status: ObservationStatus;
  action_taken: string | null;
  action_by: string | null;
  action_date: string | null;
  created_at: string;
  updated_at: string;
};

export type MediaType = 'image' | 'video' | 'voice';

export type UaUcAiAnalysisResponse = {
  what_happened: string;
  equipment_involved: string;
};
```

---

### STEP 3 — Zod Validation Schema

**File to create:**
`src/validations/contractor/add-ua-uc-near-miss.ts`

**Schemas to define:**

```typescript
// UaUcNearMissSchema — full form submission
export const UaUcNearMissSchema = z.object({
  location_department: z.string().min(2, 'Location is required'),
  observation_type: z.enum(['UA', 'UC', 'NearMiss']),

  // Media (image / video / voice)
  media: z.instanceof(File).optional(),
  media_type: z.enum(['image', 'video', 'voice']).optional(),

  // AI fields (editable by user after AI fills them)
  what_happened: z.string().min(5, 'Required').optional(),
  equipment_involved: z.string().optional(),
  activity_at_time: z.string().optional(),

  // UA classification
  ua_classifications: z.array(z.string()).optional(),
  ua_other: z.string().optional(),

  // UC classification
  uc_classifications: z.array(z.string()).optional(),
  uc_other: z.string().optional(),

  // Near Miss classification
  nm_potential_injury: z.string().optional(),
  nm_what_could_happen: z.string().optional(),
  nm_severity: z.enum(['Low', 'Medium', 'High']).optional(),

  // Status
  status: z.enum(['Open', 'Closed']),

  // Close fields (required only when status = Closed)
  action_taken: z.string().optional(),
  action_by: z.string().optional(),
  action_date: z.string().optional(),
}).superRefine((data, ctx) => {
  // Validate classification based on type
  if (data.observation_type === 'NearMiss') {
    if (!data.nm_potential_injury) ctx.addIssue({ ... });
    if (!data.nm_what_could_happen) ctx.addIssue({ ... });
    if (!data.nm_severity) ctx.addIssue({ ... });
  }
  // Validate close fields
  if (data.status === 'Closed') {
    if (!data.action_taken) ctx.addIssue({ ... });
    if (!data.action_by) ctx.addIssue({ ... });
    if (!data.action_date) ctx.addIssue({ ... });
  }
});
```

---

### STEP 4 — AI API Route

**File to create:**
`src/app/api/generate-ua-uc-analysis/route.ts`

**What it does:**
1. Receives `{ media_url, media_type, observation_type }` in POST body
2. Fetches media from Supabase storage → processes based on `media_type`:
   - **image**: base64 encode → inline Gemini `inlineData` part
   - **video**: base64 encode → inline Gemini `inlineData` part (use `video/mp4` or detected MIME)
   - **voice**: base64 encode → inline Gemini `inlineData` part (use `audio/mpeg` or detected MIME) — Gemini transcribes + analyzes audio
3. Calls Gemini with a prompt tailored by **both** `observation_type` and `media_type`
4. Returns `{ what_happened, equipment_involved }`

**Prompt strategy by observation type:**
- **UA**: "Identify the unsafe human behavior or action visible/audible. What rule or safety standard is being violated?"
- **UC**: "Identify the unsafe physical condition or hazard visible/audible. What environmental or equipment risk is present?"
- **Near Miss**: "Describe the near miss situation visible/audible. What almost happened and what is the potential injury?"

**Media-type note added to all prompts:**
- image → "Analyze this image..."
- video → "Analyze this video clip. Describe what is happening across the footage..."
- voice → "This is a voice note recorded at a worksite. Transcribe and analyze the described situation..."

**Response JSON structure:**
```json
{
  "what_happened": "Worker observed not wearing helmet while operating machinery",
  "equipment_involved": "Lathe machine, safety helmet"
}
```

---

### STEP 5 — Server Actions

**File to create:**
`src/actions/contractor/ua-uc-near-miss.ts`

**Functions to write:**

#### `submitUaUcReport(formData: UaUcNearMissFormType)`
- Get auth user from session
- Get user profile (name, employee_id)
- Generate report_no (query count + format)
- Detect `media_type` from File MIME type
- Upload media to Supabase Storage (`ehs-ua-uc-media` bucket)
- Insert row into `ehs_ua_uc_near_miss`
- `revalidatePath('/contractor/ehs/ua-uc-near-miss')`
- Return `{ success, message, data: { id, report_no } }`

#### `updateReportStatus(id: number, status: 'Open' | 'Closed', closeData?)`
- Update `status`, `action_taken`, `action_by`, `action_date`
- `revalidatePath`
- Return `{ success, message }`

#### `getUaUcReportById(id: number)`
- Fetch single report from `ehs_ua_uc_near_miss` by id
- Return full `UaUcNearMissRecord`

#### `getUaUcReportsList()`
- Fetch all reports for the current contractor
- Return list with `id, report_no, observation_type, status, reported_at, location_department`

---

### STEP 6 — Form UI Component

**File to create:**
`src/sections/ehs/ua-uc-near-miss/index.tsx`

**Component: `UaUcNearMissForm`**

This is a **single-page form** (no stepper needed — keep it fast, especially for Near Miss under 30 seconds).

```
UaUcNearMissForm
├── Section1_BasicInfo        (auto-display fields, 1 text input)
├── Section2_TypeSelector     (radio group: UA / UC / Near Miss)
├── Section3_ImageAndAI       (image upload + AI result display)
├── Section4_Classification   (conditional render based on type)
├── Section5_Evidence         (image preview)
└── Section6_StatusAndAction  (Open/Closed + conditional close fields)
```

**Key behaviors:**
- On image upload → immediately call `/api/generate-ua-uc-analysis` → fill `what_happened` and `equipment_involved`
- Show loading spinner on AI fields while analyzing
- Classification section re-renders when observation_type radio changes
- Close fields appear/disappear based on status radio
- On submit → call `submitUaUcReport()` server action → show toast → redirect to report view

**Libraries to use (same as existing):**
- `react-hook-form` + `zodResolver`
- `@/components/ui` (Input, Textarea, Button, Card, Label)
- `react-hot-toast` for notifications
- `useRouter` for post-submit navigation

---

### STEP 7 — Report Viewer

**File to create:**
`src/sections/ehs/ua-uc-near-miss/UaUcReportViewer.tsx`

**Displays the submitted report as a formatted card/page:**

```
┌─────────────────────────────────────────────────┐
│  [Logo]   UA/UC/Near Miss Report                │
│  Report No: UA-2026-0001    Date: 20 Mar 2026   │
├─────────────────────────────────────────────────┤
│  BASIC INFORMATION                              │
│  Location/Dept: Warehouse B                     │
│  Reported By:   John Doe (EMP-1042)             │
├─────────────────────────────────────────────────┤
│  TYPE OF OBSERVATION: Unsafe Act (UA)           │
├─────────────────────────────────────────────────┤
│  OBSERVATION DETAILS                            │
│  What happened: Worker not wearing helmet...    │
│  Equipment:     Lathe machine, helmet           │
│  Activity time: 14:32                           │
├─────────────────────────────────────────────────┤
│  CLASSIFICATION                                 │
│  ✓ Not using PPE                                │
│  ✓ Bypassing safety devices                     │
├─────────────────────────────────────────────────┤
│  EVIDENCE                                       │
│  [Image thumbnail]  or  [▶ Video player]        │
│                     or  [🎙 Audio player]        │
├─────────────────────────────────────────────────┤
│  STATUS: ● OPEN — Action needs to be taken      │
│  (or if CLOSED:)                                │
│  STATUS: ● CLOSED                               │
│  Action: Safety briefing conducted              │
│  By:     Site Manager                           │
│  Date:   21 Mar 2026                            │
└─────────────────────────────────────────────────┘
```

---

### STEP 8 — PDF Report

**File to create:**
`src/sections/ehs/ua-uc-near-miss/UaUcReportPdf.tsx`

Uses `@react-pdf/renderer` (same as `IncidentReportPdf.tsx`).

**PDF sections:**
1. Header with company logo + report title + report number
2. Basic Information table
3. Type of Observation
4. Observation Details (AI-analyzed fields)
5. Classification checklist
6. Evidence — if image: embed the photo; if video/voice: show media type label + public URL as a link (PDF cannot embed video/audio)
7. Status section:
   - If Open: "Action Needs to Be Taken" banner
   - If Closed: Action taken, By Whom, Date

**Download button:** `UaUcReportDownloadButton.tsx` (mirrors `IncidentReportDownloadButton.tsx`)

---

### STEP 9 — Listing Page

**File to create:**
`src/sections/ehs/ua-uc-near-miss/UaUcNearMissListingSection.tsx`

**Displays table of all submitted reports with:**
- Report No, Type badge (UA/UC/NM), Location, Date, Status badge (Open=red, Closed=green)
- Filter by type (All / UA / UC / Near Miss)
- Filter by status (All / Open / Closed)
- Click row → go to report viewer

---

### STEP 10 — Navigation & Routing

**Files to modify:**

1. **EHS nav menu** — add "UA / UC / Near Miss" entry
2. **Next.js app routes** — create page files:
   - `src/app/(contractor)/ehs/ua-uc-near-miss/page.tsx` — listing page
   - `src/app/(contractor)/ehs/ua-uc-near-miss/add/page.tsx` — new report form
   - `src/app/(contractor)/ehs/ua-uc-near-miss/[id]/page.tsx` — report viewer

---

## File Creation Order (Do NOT skip steps)

```
Step 1  →  Migration SQL file
Step 2  →  Types in ehs.types.ts
Step 3  →  Zod validation schema
Step 4  →  AI API route
Step 5  →  Server actions
Step 6  →  Form UI (index.tsx)
Step 7  →  Report viewer
Step 8  →  PDF component + download button
Step 9  →  Listing section
Step 10 →  Routes + navigation
```

---

## Constants to Define

```typescript
export const UA_CLASSIFICATIONS = [
  'Not using PPE',
  'Improper handling of equipment',
  'Bypassing safety devices',
  'Unsafe lifting / posture',
  'Operating without authorization',
];

export const UC_CLASSIFICATIONS = [
  'Oil spill / slippery floor',
  'Damaged tools / equipment',
  'Poor housekeeping',
  'Exposed wiring',
  'Inadequate guarding',
  'Poor lighting / ventilation',
];

export const NEAR_MISS_SEVERITY = ['Low', 'Medium', 'High'];

export const OBSERVATION_TYPES = [
  { value: 'UA', label: 'Unsafe Act (UA)' },
  { value: 'UC', label: 'Unsafe Condition (UC)' },
  { value: 'NearMiss', label: 'Near Miss' },
];
```

---

## Key Technical Notes

| Point | Detail |
|-------|--------|
| AI trigger | Fire AI call immediately on media selection (not on form submit) |
| AI fields editable | `what_happened` and `equipment_involved` are pre-filled but user can edit |
| Media types accepted | image/*, video/*, audio/* — one file per report |
| Media size limits | Image: 10 MB, Video: 100 MB, Voice: 25 MB — validate client-side before upload |
| media_type detection | Derived from `File.type` MIME on the client; stored in DB alongside URL |
| Date locked | `reported_at` is `DEFAULT now()` in DB — no date picker shown to user |
| Report No prefix | UA → `UA`, UC → `UC`, Near Miss → `NM` |
| Media storage bucket | `ehs-ua-uc-media` (create if not exists, replace old `ehs-ua-uc-images`) |
| Status default | All new reports start as `Open` |
| Close fields | Only shown + validated when status = `Closed` |
| PDF evidence | Image → embed inline; Video/Voice → show media type + clickable URL |
| Fast submission | Near Miss form should be completable in <30 seconds — keep it minimal |

---

## What NOT to Build (Out of Scope)

- No stepper / multi-page form (single page only)
- No separate forms for UA, UC, Near Miss (it's ONE unified form)
- No approval workflow
- No email notifications (unless already in project pattern)
- No analytics dashboard (out of scope for this phase)
