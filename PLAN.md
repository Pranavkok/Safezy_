# RBAC — Manager & Safety Officer Roles Implementation Plan

## Overview

The client requires two new EHS-focused roles in addition to the existing Admin, Contractor, Principal Employer, and Warehouse Operator roles.

| Role | What They Do |
|------|--------------|
| **Manager** | View all EHS reports across the platform. Assign open reports/incidents to Safety Officers for investigation. |
| **Safety Officer / Supervisor** | View reports assigned to them. Investigate incidents. Close actions by filling investigation details. |

Neither role is involved in orders, products, or e-commerce — their portal is **100% EHS-focused**.

---

## Workflow (End-to-End)

```
[Field Worker / Contractor]
  Submits UA/UC/Near Miss or Incident Analysis report
  → Status: Open
         ↓
[Manager]
  Views the Open report on their dashboard
  Assigns it to a Safety Officer
  → Status: Assigned (assigned_to_user_id, assigned_to_name set)
         ↓
[Safety Officer]
  Sees the report in "My Assigned" list
  Investigates the incident on-site
  Fills: action_taken, action_by, action_date, investigation_notes
  Marks it Closed
  → Status: Closed
```

This 3-state status (`Open → Assigned → Closed`) applies to both:
- `ehs_ua_uc_near_miss` table
- `ehs_incident_analysis` table

---

## Roles Summary

### Manager
- **Can**: View all EHS reports (UA/UC/Near Miss + Incident Analysis), assign reports to Safety Officers, filter/search reports
- **Cannot**: Submit reports, close reports, edit report content

### Safety Officer
- **Can**: View reports assigned to them, close reports (fill investigation + action details), mark status as Closed
- **Cannot**: View reports not assigned to them, submit reports, assign reports to others

---

## What Needs to Be Built — Complete File List

### Phase 1: Core Infrastructure

| # | File | Action | What Changes |
|---|------|--------|--------------|
| 1a | `unilift-cargo-BE/supabase/migrations/20260322000001_Add_Manager_Safety_Officer_Roles.sql` | **Create** | Add `manager` and `safety_officer` to `app_role` enum + insert into `user_roles` table |
| 1b | `unilift-cargo-BE/supabase/migrations/20260322000002_Add_Assignment_Fields.sql` | **Create** | Add `assigned_to_user_id`, `assigned_to_name`, update status to 3-value on both EHS tables |
| 1c | `unilift-cargo/src/types/supabase.ts` | **Modify** | Add `'manager' \| 'safety_officer'` to `app_role` enum (lines 1813 & 1967) |
| 1d | `unilift-cargo/src/constants/constants.ts` | **Modify** | Add `MANAGER` and `SAFETY_OFFICER` to `USER_ROLES` constant |
| 1e | `unilift-cargo/src/constants/AppRoutes.ts` | **Modify** | Add dashboard + EHS routes for both new roles |
| 1f | `unilift-cargo/src/middleware.ts` | **Modify** | Add `/manager` and `/safety-officer` to protected prefixes, redirect rules, and `hasAccessToPath` |

---

### Phase 2: Admin — Create & Manage Staff Accounts

Admin is the only one who can create Manager and Safety Officer accounts. This requires a new "Staff" section in the Admin panel.

| # | File | Action | What It Does |
|---|------|--------|--------------|
| 2a | `unilift-cargo/src/app/admin/staff/page.tsx` | **Create** | Listing page — shows all managers and safety officers |
| 2b | `unilift-cargo/src/app/admin/staff/add/page.tsx` | **Create** | Form page — admin creates a new Manager or Safety Officer account |
| 2c | `unilift-cargo/src/sections/admin/staff/StaffListingSection.tsx` | **Create** | Table component showing staff members (name, email, role, status) |
| 2d | `unilift-cargo/src/sections/admin/staff/AddStaffSection.tsx` | **Create** | Form: First name, Last name, Email, Password, Role (Manager / Safety Officer), Contact Number |
| 2e | `unilift-cargo/src/actions/admin/staff.ts` | **Create** | Server actions: `createStaffUser()`, `getStaffList()`, `deactivateStaffUser()` |
| 2f | `unilift-cargo/src/validations/admin/add-staff.ts` | **Create** | Zod schema for staff creation form |
| 2g | `unilift-cargo/src/layouts/AdminDashboardLayout.tsx` | **Modify** | Add "Staff" menu item to admin sidebar |
| 2h | `unilift-cargo/src/constants/AppRoutes.ts` | **Modify** | Add `ADMIN_STAFF_LISTING`, `ADMIN_STAFF_ADD` routes |

---

### Phase 3: Manager Portal

#### 3A — Layout & Navigation

| # | File | Action | What It Does |
|---|------|--------|--------------|
| 3a | `unilift-cargo/src/layouts/ManagerDashboardLayout.tsx` | **Create** | Manager sidebar with: Dashboard, EHS Reports (submenu: UA/UC/Near Miss, Incident Analysis) |
| 3b | `unilift-cargo/src/app/manager/layout.tsx` | **Create** | Next.js layout file wrapping all `/manager/*` pages with `ManagerDashboardLayout` |

#### 3B — Manager Dashboard

| # | File | Action | What It Does |
|---|------|--------|--------------|
| 3c | `unilift-cargo/src/app/manager/dashboard/page.tsx` | **Create** | Dashboard page using `ManagerDashboardSection` |
| 3d | `unilift-cargo/src/sections/manager/ManagerDashboardSection.tsx` | **Create** | Stats cards: Total Open, Total Assigned, Total Closed (for both report types). Quick links to each report listing. |

#### 3C — UA/UC/Near Miss (Manager View)

| # | File | Action | What It Does |
|---|------|--------|--------------|
| 3e | `unilift-cargo/src/app/manager/ehs/ua-uc-near-miss/page.tsx` | **Create** | Listing page — all UA/UC/Near Miss reports |
| 3f | `unilift-cargo/src/app/manager/ehs/ua-uc-near-miss/[id]/page.tsx` | **Create** | Detail view + assign action panel |
| 3g | `unilift-cargo/src/sections/manager/ehs/ManagerUaUcListingSection.tsx` | **Create** | Table with all reports. Columns: Report No, Type, Location, Submitted By, Date, Status badge, Assigned To. Filters: Type (UA/UC/NM), Status (All/Open/Assigned/Closed). |
| 3h | `unilift-cargo/src/sections/manager/ehs/ManagerUaUcDetailSection.tsx` | **Create** | Full report view (read-only) + "Assign to Safety Officer" panel at the bottom. Manager picks a Safety Officer from a dropdown (fetches all safety_officer users), clicks "Assign". |
| 3i | `unilift-cargo/src/actions/manager/ehs.ts` | **Create** | `assignUaUcReport(reportId, safetyOfficerId, safetyOfficerName)`, `getAllUaUcReports()`, `getAllIncidentReports()`, `getSafetyOfficersList()` |

#### 3D — Incident Analysis (Manager View)

| # | File | Action | What It Does |
|---|------|--------|--------------|
| 3j | `unilift-cargo/src/app/manager/ehs/incident-analysis/page.tsx` | **Create** | Listing page — all Incident Analysis reports |
| 3k | `unilift-cargo/src/app/manager/ehs/incident-analysis/[id]/page.tsx` | **Create** | Detail view + assign action panel |
| 3l | `unilift-cargo/src/sections/manager/ehs/ManagerIncidentListingSection.tsx` | **Create** | Table with all incidents. Columns: Report ID, Incident Type, Location, Date, Status, Assigned To. |
| 3m | `unilift-cargo/src/sections/manager/ehs/ManagerIncidentDetailSection.tsx` | **Create** | Full incident report view (read-only) + assign panel. Same pattern as UA/UC. |

---

### Phase 4: Safety Officer Portal

#### 4A — Layout & Navigation

| # | File | Action | What It Does |
|---|------|--------|--------------|
| 4a | `unilift-cargo/src/layouts/SafetyOfficerDashboardLayout.tsx` | **Create** | Safety Officer sidebar with: Dashboard, My Assignments (submenu: UA/UC/Near Miss, Incident Analysis) |
| 4b | `unilift-cargo/src/app/safety-officer/layout.tsx` | **Create** | Next.js layout file wrapping all `/safety-officer/*` pages |

#### 4B — Safety Officer Dashboard

| # | File | Action | What It Does |
|---|------|--------|--------------|
| 4c | `unilift-cargo/src/app/safety-officer/dashboard/page.tsx` | **Create** | Dashboard page |
| 4d | `unilift-cargo/src/sections/safety-officer/SafetyOfficerDashboardSection.tsx` | **Create** | Stats: My Open Assignments, My Closed Reports. Lists the most recent assigned items with a "View" button. |

#### 4C — UA/UC/Near Miss (Safety Officer View)

| # | File | Action | What It Does |
|---|------|--------|--------------|
| 4e | `unilift-cargo/src/app/safety-officer/ehs/ua-uc-near-miss/page.tsx` | **Create** | Listing — only reports assigned to this safety officer |
| 4f | `unilift-cargo/src/app/safety-officer/ehs/ua-uc-near-miss/[id]/page.tsx` | **Create** | Detail view + close action form |
| 4g | `unilift-cargo/src/sections/safety-officer/ehs/SoUaUcListingSection.tsx` | **Create** | Table of assigned reports. Columns: Report No, Type, Location, Date, Status. Filter by Status. |
| 4h | `unilift-cargo/src/sections/safety-officer/ehs/SoUaUcDetailSection.tsx` | **Create** | Full report view (read-only) + "Close Report" panel. Form fields: Action Taken (textarea), By Whom (pre-filled with officer's name, editable), Investigation Notes (textarea), Date. Submit → status becomes Closed. |
| 4i | `unilift-cargo/src/actions/safety-officer/ehs.ts` | **Create** | `getMyAssignedUaUcReports()`, `closeUaUcReport(id, closeData)`, `getMyAssignedIncidents()`, `closeIncidentReport(id, closeData)` |

#### 4D — Incident Analysis (Safety Officer View)

| # | File | Action | What It Does |
|---|------|--------|--------------|
| 4j | `unilift-cargo/src/app/safety-officer/ehs/incident-analysis/page.tsx` | **Create** | Listing — only incidents assigned to this safety officer |
| 4k | `unilift-cargo/src/app/safety-officer/ehs/incident-analysis/[id]/page.tsx` | **Create** | Detail view + close action form |
| 4l | `unilift-cargo/src/sections/safety-officer/ehs/SoIncidentListingSection.tsx` | **Create** | Table of assigned incidents |
| 4m | `unilift-cargo/src/sections/safety-officer/ehs/SoIncidentDetailSection.tsx` | **Create** | Full incident view (read-only) + close form. Same pattern as UA/UC. |

---

## Database Changes (Detailed)

### Migration 1 — New Enum Values & Role Rows
**File:** `20260322000001_Add_Manager_Safety_Officer_Roles.sql`

```sql
ALTER TYPE "app_role" ADD VALUE IF NOT EXISTS 'manager';
ALTER TYPE "app_role" ADD VALUE IF NOT EXISTS 'safety_officer';

INSERT INTO public.user_roles ("role")
VALUES ('manager'), ('safety_officer');
```

---

### Migration 2 — Assignment Fields on EHS Tables
**File:** `20260322000002_Add_Assignment_Fields.sql`

#### On `ehs_ua_uc_near_miss`:
```sql
-- Add assignment fields
ALTER TABLE ehs_ua_uc_near_miss
  ADD COLUMN assigned_to_user_id UUID REFERENCES auth.users(id),
  ADD COLUMN assigned_to_name    TEXT;

-- Status now has 3 valid values: 'Open' | 'Assigned' | 'Closed'
-- No enum change needed — it's already a TEXT column with CHECK constraint
-- Update the check constraint:
ALTER TABLE ehs_ua_uc_near_miss
  DROP CONSTRAINT IF EXISTS ehs_ua_uc_near_miss_status_check,
  ADD CONSTRAINT ehs_ua_uc_near_miss_status_check
    CHECK (status IN ('Open', 'Assigned', 'Closed'));
```

#### On `ehs_incident_analysis`:
```sql
-- Add assignment fields (check actual column names first)
ALTER TABLE ehs_incident_analysis
  ADD COLUMN IF NOT EXISTS assigned_to_user_id UUID REFERENCES auth.users(id),
  ADD COLUMN IF NOT EXISTS assigned_to_name    TEXT;

-- Update status to allow 'Assigned' (if status is a text column)
-- Check existing constraint name before running
```

> **NOTE:** Check `ehs_incident_analysis` schema before writing migration 2. Confirm column names for status and whether a check constraint already exists.

---

## Type Updates (Detailed)

### `src/types/supabase.ts`
Two places to update:

```typescript
// Line ~1813
app_role: "admin" | "contractor" | "principle" | "warehouse_operator" | "manager" | "safety_officer"

// Line ~1967
app_role: ["admin", "contractor", "principle", "warehouse_operator", "manager", "safety_officer"],
```

### `src/constants/constants.ts`
```typescript
export const USER_ROLES: {
  CONTRACTOR: AppRole;
  ADMIN: AppRole;
  PRINCIPAL_EMPLOYER: AppRole;
  WAREHOUSE_OPERATOR: AppRole;
  MANAGER: AppRole;
  SAFETY_OFFICER: AppRole;
} = {
  CONTRACTOR: 'contractor',
  ADMIN: 'admin',
  PRINCIPAL_EMPLOYER: 'principle',
  WAREHOUSE_OPERATOR: 'warehouse_operator',
  MANAGER: 'manager',
  SAFETY_OFFICER: 'safety_officer'
} as const;
```

---

## AppRoutes Additions

```typescript
// In AppRoutesType and AppRoutes object:

// Manager routes
MANAGER_DASHBOARD: string;
MANAGER_EHS_UA_UC_NEAR_MISS_LISTING: string;
MANAGER_EHS_UA_UC_NEAR_MISS_DETAILS: (id: string) => string;
MANAGER_EHS_INCIDENT_ANALYSIS_LISTING: string;
MANAGER_EHS_INCIDENT_ANALYSIS_DETAILS: (id: number) => string;

// Safety Officer routes
SAFETY_OFFICER_DASHBOARD: string;
SAFETY_OFFICER_EHS_UA_UC_NEAR_MISS_LISTING: string;
SAFETY_OFFICER_EHS_UA_UC_NEAR_MISS_DETAILS: (id: string) => string;
SAFETY_OFFICER_EHS_INCIDENT_ANALYSIS_LISTING: string;
SAFETY_OFFICER_EHS_INCIDENT_ANALYSIS_DETAILS: (id: number) => string;

// Admin staff routes
ADMIN_STAFF_LISTING: string;
ADMIN_STAFF_ADD: string;
```

---

## Middleware Changes

### New protected prefixes:
```typescript
const PROTECTED_PATH_PREFIXES = [
  '/admin',
  '/contractor',
  '/warehouse-operator',
  '/principal-employer',
  '/manager',          // NEW
  '/safety-officer'    // NEW
];
```

### New redirect paths:
```typescript
const ROLE_REDIRECT_PATHS: Record<string, string> = {
  [USER_ROLES.ADMIN]: AppRoutes.ADMIN_DASHBOARD,
  [USER_ROLES.CONTRACTOR]: AppRoutes.HOME,
  [USER_ROLES.WAREHOUSE_OPERATOR]: AppRoutes.WAREHOUSE_OPERATOR_DASHBOARD,
  [USER_ROLES.PRINCIPAL_EMPLOYER]: AppRoutes.PRINCIPAL_EMPLOYER_DASHBOARD,
  [USER_ROLES.MANAGER]: AppRoutes.MANAGER_DASHBOARD,           // NEW
  [USER_ROLES.SAFETY_OFFICER]: AppRoutes.SAFETY_OFFICER_DASHBOARD  // NEW
};
```

### New strict-redirect rules (mirror the existing Admin/WO/PE pattern):
```typescript
// Add to the existing OR block:
(userRole === USER_ROLES.MANAGER && !pathname.startsWith('/manager')) ||
(userRole === USER_ROLES.SAFETY_OFFICER && !pathname.startsWith('/safety-officer'))
```

### Update `hasAccessToPath`:
```typescript
if (pathname.startsWith('/manager') && role !== USER_ROLES.MANAGER) return false;
if (pathname.startsWith('/safety-officer') && role !== USER_ROLES.SAFETY_OFFICER) return false;
```

---

## Server Actions (Detailed)

### `src/actions/admin/staff.ts`

```typescript
// Create a Manager or Safety Officer account
createStaffUser(data: {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  contactNumber: string;
  role: 'manager' | 'safety_officer';
}): Promise<{ success: boolean; message: string }>

// The function:
// 1. supabase.auth.signUp({ email, password })
// 2. Get role ID from user_roles table
// 3. Insert into users table with role_id, name, email, contact
// 4. Return result

// Get all staff (managers + safety officers)
getStaffList(): Promise<StaffMember[]>

// Deactivate a staff account
deactivateStaffUser(userId: number): Promise<{ success: boolean; message: string }>
```

### `src/actions/manager/ehs.ts`

```typescript
// Get all UA/UC/Near Miss reports (all statuses, all users)
getAllUaUcReports(filters?: { type?: ObservationType; status?: string }): Promise<UaUcNearMissRecord[]>

// Assign a UA/UC report to a safety officer
assignUaUcReport(reportId: number, safetyOfficerId: string, safetyOfficerName: string): Promise<{ success: boolean; message: string }>
// → Sets assigned_to_user_id, assigned_to_name, status = 'Assigned'

// Get all Incident Analysis reports
getAllIncidentReports(filters?: { status?: string }): Promise<IncidentAnalysisRecord[]>

// Assign an incident to a safety officer
assignIncidentReport(reportId: number, safetyOfficerId: string, safetyOfficerName: string): Promise<{ success: boolean; message: string }>

// Get dropdown list of all safety officers (for the assign panel)
getSafetyOfficersList(): Promise<{ id: string; name: string }[]>
```

### `src/actions/safety-officer/ehs.ts`

```typescript
// Get only reports assigned to the current safety officer
getMyAssignedUaUcReports(): Promise<UaUcNearMissRecord[]>

// Close a UA/UC report
closeUaUcReport(reportId: number, closeData: {
  action_taken: string;
  action_by: string;
  action_date: string;
  investigation_notes?: string;
}): Promise<{ success: boolean; message: string }>
// → Sets status = 'Closed', fills action fields

// Get only incidents assigned to the current safety officer
getMyAssignedIncidents(): Promise<IncidentAnalysisRecord[]>

// Close an incident
closeIncidentReport(reportId: number, closeData: { ... }): Promise<{ success: boolean; message: string }>
```

---

## Sidebar Menus

### Manager Sidebar
```
Dashboard
EHS Reports
  ├── UA / UC / Near Miss
  └── Incident Analysis
```

### Safety Officer Sidebar
```
Dashboard
My Assignments
  ├── UA / UC / Near Miss
  └── Incident Analysis
```

### Admin Sidebar (addition)
```
Dashboard
Customers
Orders
Products
Warehouse
Complaints
Staff          ← NEW (manages Managers & Safety Officers)
EHS
Blogs
```

---

## UI Patterns to Follow

All new UI should mirror the existing patterns in the codebase:

| Pattern | Mirror From |
|---------|-------------|
| Sidebar layout | `AdminDashboardLayout.tsx` |
| Listing table | `/admin/contractors/page.tsx` section |
| Detail view | `/ehs/ua-uc-near-miss/[id]` section |
| Form with server action | `AddStaffSection` → mirror `AddWarehouseOperatorSection` |
| Status badges | Use existing badge patterns (Open = amber/red, Assigned = blue, Closed = green) |
| Toast notifications | `react-hot-toast` (already in project) |
| Form validation | `react-hook-form` + `zodResolver` |

---

## Implementation Order (Do NOT Skip Steps)

```
Phase 1 — Foundation (must be done first, everything depends on this)
  Step 1a  →  Migration: Add enum values + user_roles rows
  Step 1b  →  Migration: Add assigned_to fields + update status constraints
  Step 1c  →  Update supabase.ts types
  Step 1d  →  Update constants.ts USER_ROLES
  Step 1e  →  Update AppRoutes.ts
  Step 1f  →  Update middleware.ts

Phase 2 — Admin Creates Staff (needed before Manager/SO can log in)
  Step 2a  →  Server action: createStaffUser, getStaffList
  Step 2b  →  Zod schema: add-staff.ts
  Step 2c  →  Admin Staff listing page + section
  Step 2d  →  Admin Add Staff page + section
  Step 2e  →  Admin sidebar: add Staff menu item

Phase 3 — Manager Portal
  Step 3a  →  ManagerDashboardLayout.tsx
  Step 3b  →  /manager/layout.tsx
  Step 3c  →  Server actions: getAllUaUcReports, assignUaUcReport, getSafetyOfficersList
  Step 3d  →  Manager dashboard page + section (stats)
  Step 3e  →  Manager UA/UC/Near Miss listing page + section
  Step 3f  →  Manager UA/UC/Near Miss detail page + section (with assign panel)
  Step 3g  →  Server actions: getAllIncidentReports, assignIncidentReport
  Step 3h  →  Manager Incident Analysis listing page + section
  Step 3i  →  Manager Incident Analysis detail page + section (with assign panel)

Phase 4 — Safety Officer Portal
  Step 4a  →  SafetyOfficerDashboardLayout.tsx
  Step 4b  →  /safety-officer/layout.tsx
  Step 4c  →  Server actions: getMyAssignedUaUcReports, closeUaUcReport
  Step 4d  →  Safety Officer dashboard page + section
  Step 4e  →  Safety Officer UA/UC listing page + section
  Step 4f  →  Safety Officer UA/UC detail page + section (with close panel)
  Step 4g  →  Server actions: getMyAssignedIncidents, closeIncidentReport
  Step 4h  →  Safety Officer Incident Analysis listing page + section
  Step 4i  →  Safety Officer Incident Analysis detail page + section (with close panel)
```

---

## Dependencies / Pre-Conditions

| Dependency | Status | Notes |
|------------|--------|-------|
| UA/UC/Near Miss module (`ehs_ua_uc_near_miss` table) | In Progress | Must be completed first — Migration 2 (assignment fields) adds onto this table |
| Incident Analysis table (`ehs_incident_analysis`) | Done | Need to check existing schema before writing Migration 2 |
| `users` table structure | Done | Manager/Safety Officer profiles will be inserted here same as existing roles |
| Admin panel exists | Done | Only adding a new "Staff" menu item + pages |

---

## Out of Scope

- Manager or Safety Officer cannot self-register — only Admin creates their accounts
- No email notifications when a report is assigned (not in existing pattern)
- No chat or comments between Manager and Safety Officer
- No mobile app changes
- No analytics or charts beyond basic stats cards on dashboards
- Manager cannot edit report content — read-only access only
- Safety Officer cannot reassign to another Safety Officer — only Manager can assign
