# Sprint 2 Log — HRMS Group 5

**Sprint:** Sprint 2 — Weeks 3–4  
**Dates:** 2026-05-04 to 2026-05-17  
**Project:** HopeHRS — Human Resource Management System  
**Repository:** HRMS-Group-5

---

## Sprint Goal

Implement and verify role-based access control (rights matrix), soft-delete cascade triggers, recovery cascade, RLS enforcement at the database layer, stamp column visibility, and the Deleted Items management panel.

---

## Team Contributions

### M1 — Project Manager / Scrum Master

**Tasks Completed:**
- Facilitated Sprint 2 planning and daily standups
- Coordinated task assignments across M1–M5
- Reviewed and merged PRs from all team members into `dev`
- Ensured Sprint 2 gate checklist was tracked and completed before submission
- Updated project board and milestone tracker for Sprint 2

**Blockers:** None  
**Resolutions:** N/A

---

### M2 — Frontend Developer (UI/UX)

**Tasks Completed:**
- Designed and implemented `UserModule_Rights` table with 17 right codes per user
- Created Supabase RLS policies:
  - USER: `SELECT` policy filters `record_status = 'ACTIVE'` on all 4 HR tables
  - ADMIN / SUPERADMIN: `SELECT` policy returns all records (no filter)
- Implemented cascade trigger `on_employee_status_change`:
  - When employee `record_status` is set to `INACTIVE`, trigger sets all matching `jobHistory` rows to `INACTIVE`
  - When employee `record_status` is set to `ACTIVE`, trigger restores all matching `jobHistory` rows to `ACTIVE`
- Confirmed zero `DELETE FROM` statements in all SQL migration files — all removals use `UPDATE ... SET record_status = 'INACTIVE'`
- Verified RLS enforcement via direct Supabase API queries (Test Suite 3)

**Blockers:** Cascade trigger had to be tested for both directions (soft-delete and recovery) to confirm correct behavior  
**Resolutions:** Verified via Supabase Table Editor after each operation in Test Suite 1 and 2

---

### M3 — Backend / Database Engineer

**Tasks Completed:**
- Implemented `UserRightsContext.jsx`: loads all 17 rights for the logged-in user on login; exposes `useRights()` hook
- Gated all action buttons in `EmployeesPage.jsx`, `JobsPage.jsx`, `DepartmentsPage.jsx` by their corresponding right codes (e.g., `rights.EMP_ADD`, `rights.EMP_EDIT`, `rights.EMP_DEL`)
- Implemented `showStamp` flag in all 4 HR table pages:
  - `showStamp = userType === "ADMIN" || userType === "SUPERADMIN"`
  - Stamp column rendered only when `showStamp === true`
- Built `DeletedItemsPage.jsx` with 4 tabs (Employees, Job History, Jobs, Departments)
  - Each tab shows INACTIVE rows with a Recover button
- Applied route guard: `/deleted-items` redirects USER accounts; sidebar link hidden for USER
- Wired up `recoverEmployee()` / `recoverJob()` / `recoverDepartment()` calls from the Deleted Items panel

**Blockers:** Sidebar link visibility needed to be coordinated with M4's AppShell layout  
**Resolutions:** Shared `userType` prop through AppShell to conditionally render the sidebar link

---

### M4 — Rights & Authentication Specialist

**Tasks Completed:**
- Updated `AppShell.jsx` to hide "Deleted Items" sidebar link for USER accounts
- Styled `DeletedItemsPage.jsx` tabs and Recover button states ("Recovering…" spinner feedback)
- Reviewed and confirmed UI rendering of stamp column across all 4 table views in SUPERADMIN, ADMIN, and USER modes
- Assisted M3 with responsive layout adjustments for the job history panel in `EmployeeDetailPage`

**Blockers:** None  
**Resolutions:** N/A

---

### M5 — QA / Documentation Specialist

**Tasks Completed:**
- Authored and executed **51-case rights test matrix** (`src/tests/sprint2-rights-51-cases.md`):
  - 17 rights × 3 user types (SUPERADMIN, ADMIN, USER) = 51 cases
  - Additional: stamp visibility (3 cases), sidebar link gating (3 cases), route guard (3 cases), hard-delete audit
  - All 51 cases PASS
- Authored and executed **cascade, visibility, recovery, and audit tests** (`src/tests/sprint2-cascade-visibility.md`):
  - Test Suite 1 (4 sub-tests): Soft-delete cascade — emp 00001 INACTIVE → all jobHistory rows INACTIVE; USER blocked; ADMIN sees in Deleted Items
  - Test Suite 2 (2 sub-tests): Recovery cascade — emp 00001 ACTIVE restored → jobHistory restored; USER sees again
  - Test Suite 3 (2 sub-tests): RLS bypass test — USER direct API call blocked for all 4 tables
  - Test Suite 4 (12 cases): Stamp column × 4 tables × 3 user types — all PASS
  - Test Suite 5 (3 checks): Hard-delete audit — zero `.delete()` calls found in `src/`
  - Test Suite 6 (3 cases): Deleted Items panel access control
  - Total: 26 test cases, all PASS
- Fixed `npm test` failure: `vitest` was listed in `package.json` but not installed; ran `npm install` to resolve; confirmed 5/5 Sprint 1 tests still passing
- Authored this Sprint 2 log

**Blockers:** `vitest` was not installed — `npm test` threw `'vitest' is not recognized` on fresh clone  
**Resolutions:** Ran `npm install` from project root; all test dependencies restored; `npm test -- --run` confirms 5 tests passing

---

## Sprint 2 Gate Checklist

- [x] All 51 rights test cases PASS (see `src/tests/sprint2-rights-51-cases.md`)
- [x] Cascade soft-delete verified: employee soft-delete sets all jobHistory rows INACTIVE
- [x] Cascade recovery verified: employee recovery restores all jobHistory rows to ACTIVE
- [x] USER cannot see INACTIVE records — confirmed at both UI and RLS (API) level
- [x] Stamp column hidden from USER in all 4 HR table views
- [x] No DELETE SQL statement anywhere in application code (`grep -r "\.delete(" src/` → 0 matches)
- [x] Deleted Items panel accessible to ADMIN and SUPERADMIN only
- [x] Deleted Items sidebar link hidden for USER accounts

---

## Blockers Encountered This Sprint

| Member | Blocker | Resolution |
|---|---|---|
| M2 | Cascade trigger needed testing for both soft-delete and recovery directions | Verified via Supabase Table Editor after each operation |
| M3 | Sidebar link visibility required coordination with M4's AppShell | Passed `userType` prop through AppShell layout |
| M5 | `vitest` not installed on fresh clone — `npm test` failed | Ran `npm install` from project root |

---

## Next Sprint Goals (Sprint 3)

- Implement full CRUD forms for Employees, Jobs, and Departments (add/edit modals)
- Add form validation aligned with rights gating (only show Add/Edit/Delete UI to users with appropriate rights)
- Implement search and filter functionality on all 4 HR table pages
- Add pagination to table views
- Write Sprint 3 integration tests covering form submission, validation, and API calls
- Expand unit test coverage to include rights hook (`useRights`) and service layer functions

---

*Log authored by: M5 — QA / Documentation Specialist*  
*Sprint 2 dates: 2026-05-04 to 2026-05-17*
