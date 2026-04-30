# Safezy — Implementation Plan

---

## Feature 1: Manager & Safety Officer — EHS Portal (DONE)

### Roles

| Role | Purpose |
|---|---|
| **Manager** | Views all EHS reports platform-wide. Assigns open reports to Safety Officers. |
| **Safety Officer** | Views reports assigned to them. Investigates. Closes reports. |

### Workflow
```
Contractor submits UA/UC/Near Miss or Incident → Status: Open
  ↓
Manager assigns to a Safety Officer → Status: Assigned
  ↓
Safety Officer investigates, fills details, closes → Status: Closed
```

### What Was Built

#### Phase 1 — Infrastructure
| File | Status |
|---|---|
| `migrations/20260322000001_Add_Manager_Safety_Officer_Roles.sql` | Done |
| `migrations/20260322000002_Add_Assignment_Fields.sql` | Done |
| `src/constants/constants.ts` — USER_ROLES | Done |
| `src/constants/AppRoutes.ts` — manager + SO routes | Done |
| `src/middleware.ts` — protected prefixes + role guards | Done |

#### Phase 2 — Admin Staff Management
| File | Status |
|---|---|
| `src/app/admin/staff/page.tsx` | Done |
| `src/app/admin/staff/add/page.tsx` | Done |
| `src/sections/admin/staff/StaffListingSection.tsx` | Done |
| `src/sections/admin/staff/AddStaffSection.tsx` | Done |
| `src/actions/admin/staff.ts` | Done |
| `src/layouts/AdminDashboardLayout.tsx` — Staff menu item | Done |

#### Phase 3 — Manager Portal
| File | Status |
|---|---|
| `src/layouts/ManagerDashboardLayout.tsx` | Done |
| `src/app/manager/layout.tsx` | Done |
| `src/app/manager/dashboard/page.tsx` | Done |
| `src/app/manager/ehs/ua-uc-near-miss/page.tsx` | Done |
| `src/app/manager/ehs/ua-uc-near-miss/[id]/page.tsx` | Done |
| `src/app/manager/ehs/incident-analysis/page.tsx` | Done |
| `src/app/manager/ehs/incident-analysis/[id]/page.tsx` | Done |
| `src/actions/manager/ehs.ts` | Done |
| `src/sections/manager/ehs/ManagerUaUcListingSection.tsx` | Done |
| `src/sections/manager/ehs/ManagerUaUcDetailSection.tsx` | Done |
| `src/sections/manager/ehs/ManagerIncidentListingSection.tsx` | Done |
| `src/sections/manager/ehs/ManagerIncidentDetailSection.tsx` | Done |

#### Phase 4 — Safety Officer Portal
| File | Status |
|---|---|
| `src/layouts/SafetyOfficerDashboardLayout.tsx` | Done |
| `src/app/safety-officer/layout.tsx` | Done |
| `src/app/safety-officer/dashboard/page.tsx` | Done |
| `src/app/safety-officer/ehs/ua-uc-near-miss/page.tsx` | Done |
| `src/app/safety-officer/ehs/ua-uc-near-miss/[id]/page.tsx` | Done |
| `src/app/safety-officer/ehs/incident-analysis/page.tsx` | Done |
| `src/app/safety-officer/ehs/incident-analysis/[id]/page.tsx` | Done |
| `src/actions/safety-officer/ehs.ts` | Done |

---

## Feature 2: Remarks Column in Excel Reports (DONE)

Added a "Remarks" column as the last column in all 4 Excel report downloads (UA, UC, NM, Incident Analysis).

### Logic

| Report Status | Remarks Value |
|---|---|
| Closed | Date when it was closed |
| Open / Assigned | Number of days since report date (e.g. "5 days") |

### Date Sources

| Report Type | Closed date | Open/Assigned reference date |
|---|---|---|
| UA / UC / NM | `action_date` field | `reported_at` |
| Incident Analysis | `updated_at` (last modified) | `date` (incident date) |

### Files Changed
| File | Change |
|---|---|
| `src/actions/manager/ehs.ts` | Added `updated_at` to `IncidentListItem` type + SELECT query |
| `src/sections/manager/ehs/ManagerUaUcListingSection.tsx` | Added Remarks column |
| `src/sections/manager/ehs/ManagerIncidentListingSection.tsx` | Added Remarks column |

---

## Feature 3: Manager & Safety Officer — Public Routes + Shopping Pages (DONE)

### What Changed

Both roles can now:
1. Access **all public routes** (products, cart, blog, EHS public pages, etc.)
2. Access their own **notifications**, **orders**, and **wishlist** pages

### Middleware Fix

Previously, manager and safety officer were redirected to their dashboard for ANY route outside their prefix — including public pages like `/products` or `/cart`.

**Fix:** Added `isProtectedRoute(pathname)` check so the redirect only fires when they try to access *another role's protected portal*, not public routes.

```
Before: manager blocked if not on /manager/*
After:  manager blocked if not on /manager/* AND route is protected
```

### New Pages Created

#### Manager
| Page | Path |
|---|---|
| Notifications | `/manager/notifications` |
| Orders | `/manager/orders` |
| Order Details | `/manager/orders/[id]` |
| Wishlist | `/manager/wishlist` |

#### Safety Officer
| Page | Path |
|---|---|
| Notifications | `/safety-officer/notifications` |
| Orders | `/safety-officer/orders` |
| Order Details | `/safety-officer/orders/[id]` |
| Wishlist | `/safety-officer/wishlist` |

### Sidebar Updates

Both `ManagerDashboardLayout` and `SafetyOfficerDashboardLayout` now include:
- **Notifications** (Bell icon)
- **Orders** (ShoppingBag icon)
- **Wishlist** (Heart icon)

### AppRoutes Added

```
MANAGER_NOTIFICATION, MANAGER_ORDER_LISTING, MANAGER_ORDER_DETAILS, MANAGER_WISHLIST
SAFETY_OFFICER_NOTIFICATION, SAFETY_OFFICER_ORDER_LISTING, SAFETY_OFFICER_ORDER_DETAILS, SAFETY_OFFICER_WISHLIST
```

### Files Changed
| File | Change |
|---|---|
| `src/middleware.ts` | Allow manager/SO on public routes |
| `src/constants/AppRoutes.ts` | 8 new route constants |
| `src/layouts/ManagerDashboardLayout.tsx` | 3 new sidebar items |
| `src/layouts/SafetyOfficerDashboardLayout.tsx` | 3 new sidebar items |
| `src/app/manager/notifications/page.tsx` | New |
| `src/app/manager/notifications/loading.tsx` | New |
| `src/app/manager/orders/page.tsx` | New |
| `src/app/manager/orders/[id]/page.tsx` | New |
| `src/app/manager/wishlist/page.tsx` | New |
| `src/app/safety-officer/notifications/page.tsx` | New |
| `src/app/safety-officer/notifications/loading.tsx` | New |
| `src/app/safety-officer/orders/page.tsx` | New |
| `src/app/safety-officer/orders/[id]/page.tsx` | New |
| `src/app/safety-officer/wishlist/page.tsx` | New |

---

## Feature 4: Admin Assigns PPE to Contractor (IN PROGRESS)

### Overview

Admin can assign PPE items (from the global product catalogue) to contractors with a specific quantity.
Contractors see their assigned PPE in a new "My Assigned PPE" sidebar page.
Contractor gets notified (inbox + push) when admin assigns PPE.

### Rules
- Admin assigns from the global `product` table (no stock deduction — catalogue only)
- Same PPE type can be assigned to multiple contractors simultaneously
- Admin can assign more PPE to a contractor who already has some (additive, not replacement)
- Admin can edit the quantity of any existing assignment
- Admin can revoke (soft-delete) any assignment
- Contractor can only VIEW assigned PPE — they cannot assign it to employees
- Notification is sent only to the specific contractor receiving the assignment

### Data Model

**New table:** `admin_ppe_assignments`

| Column | Type | Notes |
|---|---|---|
| `id` | UUID PK | auto |
| `contractor_id` | UUID → users(id) | recipient contractor |
| `product_id` | UUID → product(id) | assigned PPE item |
| `quantity` | INTEGER > 0 | how many units assigned |
| `assigned_by` | UUID → users(id) | admin who assigned |
| `is_deleted` | BOOLEAN | soft delete for revoke |
| `created_at` | TIMESTAMPTZ | |
| `updated_at` | TIMESTAMPTZ | |

**New notification type:** `ppe_assigned`

### Implementation Steps

#### Step 1 — Database Migration ✅
| File | Status |
|---|---|
| `migrations/20260430000001_Admin_PPE_Assignment.sql` | Done |

Creates `admin_ppe_assignments` table, indexes, RLS policy, and adds `ppe_assigned` enum value.

#### Step 2 — Routes & Constants ✅
| File | Change | Status |
|---|---|---|
| `src/constants/AppRoutes.ts` | Add `ADMIN_PPE_ASSIGNMENTS`, `CONTRACTOR_ASSIGNED_PPE` | Done |

#### Step 3 — Sidebar Navigation ✅
| File | Change | Status |
|---|---|---|
| `src/layouts/AdminDashboardLayout.tsx` | Add "PPE Assignments" item (id 10, HardHat icon) | Done |
| `src/layouts/ContractorDashboardLayout.tsx` | Add "My Assigned PPE" item (id 9, HardHat icon) | Done |

#### Step 4 — API Routes
| File | Method | Purpose | Status |
|---|---|---|---|
| `src/app/api/admin/ppe-assignments/route.ts` | GET | Fetch assignments for a contractor (`?contractor_id=`) | Done |
| `src/app/api/admin/ppe-assignments/route.ts` | POST | Assign new PPE to contractor + send notification | Done |
| `src/app/api/admin/ppe-assignments/[id]/route.ts` | PATCH | Update quantity of an assignment | Done |
| `src/app/api/admin/ppe-assignments/[id]/route.ts` | DELETE | Revoke (soft-delete) an assignment | Done |
| `src/app/api/admin/products-list/route.ts` | GET | Fetch all active products for modal dropdown | Done |
| `src/app/api/contractor/assigned-ppe/route.ts` | GET | Fetch all active PPE assigned to logged-in contractor | Done |

#### Step 5 — Admin UI
| File | Purpose | Status |
|---|---|---|
| `src/app/admin/ppe-assignments/page.tsx` | Page entry point | Done |
| `src/sections/admin/ppe-assignments/PpeAssignmentsSection.tsx` | Server component — fetches contractors | Done |
| `src/sections/admin/ppe-assignments/ppe-assignments-table/PpeAssignmentsTable.tsx` | Client table + modal state | Done |
| `src/sections/admin/ppe-assignments/ppe-assignments-table/PpeAssignmentsColumn.tsx` | Column defs with Assign PPE button | Done |
| `src/sections/admin/ppe-assignments/AssignPpeModal.tsx` | Dialog: assign new + manage existing assignments | Done |

#### Step 6 — Contractor UI
| File | Purpose | Status |
|---|---|---|
| `src/app/contractor/assigned-ppe/page.tsx` | Page entry point | Done |
| `src/sections/contractor/assigned-ppe/AssignedPpeSection.tsx` | Client component — fetches + displays assigned PPE | Done |

### UI Flows

#### Admin flow
```
Admin Dashboard → Sidebar: "PPE Assignments"
  → Table of all contractors (name, email, contact, assigned PPE count)
  → Click "Assign PPE" on any row
    → Modal opens:
        [Assign New PPE]
          - Search/filter PPE by name or category
          - Select PPE from filtered list
          - Enter quantity
          - Click "Assign" → POST API → notification sent to contractor
        [Currently Assigned PPE]
          - Table: PPE Name | Category | Qty | Date | Edit | Revoke
          - Edit → inline qty update → PATCH API
          - Revoke → confirm → DELETE API
```

#### Contractor flow
```
Contractor Dashboard → Sidebar: "My Assigned PPE"
  → Table: PPE Name | Category | Quantity | Date Assigned | Assigned By
  → Notification (inbox + push): "Admin has assigned X [PPE Name] to you"
```
