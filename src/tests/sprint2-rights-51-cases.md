# Sprint 2 — Rights Test Matrix
**M5 QA / Documentation | 3 User Types × 17 Rights = 51 Test Cases**

**Tester:** M5 (QA / Documentation Specialist)  
**Sprint:** Sprint 2 — Weeks 3–4  
**Date Executed:** 2026-05-17  
**Environment:** Local development (localhost:5173) connected to Supabase project  

---

## Test Accounts Used

| User Type | Email | record_status |
|---|---|---|
| SUPERADMIN | jcesperanza@neu.edu.ph | ACTIVE |
| ADMIN | admin-test@hope.com | ACTIVE |
| USER | user-test@hope.com | ACTIVE |

---

## How to Read This Matrix

- **Expected: YES** — the button/action should be visible and functional  
- **Expected: NO** — the button/action should be hidden or blocked  
- **PASS** — actual behavior matches expected  
- **FAIL** — actual behavior does NOT match expected  
- Each test was verified by logging in as that user type and checking the UI

---

## Rights Matrix — 51 Test Cases

### Module: Emp_Mod (Employee Module)

| # | Right Code | Description | User Type | Expected | Result | Notes |
|---|---|---|---|---|---|---|
| 1 | EMP_VIEW | View Employees page loads and shows employee table | SUPERADMIN | YES | PASS | |
| 2 | EMP_VIEW | View Employees page loads and shows employee table | ADMIN | YES | PASS | |
| 3 | EMP_VIEW | View Employees page loads and shows employee table | USER | YES | PASS | |
| 4 | EMP_ADD | "+ Add Employee" button visible | SUPERADMIN | YES | PASS | |
| 5 | EMP_ADD | "+ Add Employee" button visible | ADMIN | YES | PASS | |
| 6 | EMP_ADD | "+ Add Employee" button hidden | USER | NO | PASS | Button not rendered when EMP_ADD = 0 |
| 7 | EMP_EDIT | "Edit" button visible on active employee rows | SUPERADMIN | YES | PASS | |
| 8 | EMP_EDIT | "Edit" button visible on active employee rows | ADMIN | YES | PASS | |
| 9 | EMP_EDIT | "Edit" button hidden on all rows | USER | NO | PASS | Button not rendered when EMP_EDIT = 0 |
| 10 | EMP_DEL | "Deactivate" button visible on active employee rows | SUPERADMIN | YES | PASS | |
| 11 | EMP_DEL | "Deactivate" button hidden (ADMIN cannot soft-delete) | ADMIN | NO | PASS | DEL right = 0 for ADMIN by design |
| 12 | EMP_DEL | "Deactivate" button hidden | USER | NO | PASS | DEL right = 0 for USER |

### Module: JH_Mod (Job History Module)

| # | Right Code | Description | User Type | Expected | Result | Notes |
|---|---|---|---|---|---|---|
| 13 | JH_VIEW | Job History panel visible on Employee Detail page | SUPERADMIN | YES | PASS | |
| 14 | JH_VIEW | Job History panel visible on Employee Detail page | ADMIN | YES | PASS | |
| 15 | JH_VIEW | Job History panel visible on Employee Detail page | USER | YES | PASS | |
| 16 | JH_ADD | "Add Job History" form/button visible | SUPERADMIN | YES | PASS | |
| 17 | JH_ADD | "Add Job History" form/button visible | ADMIN | YES | PASS | |
| 18 | JH_ADD | "Add Job History" form/button hidden | USER | NO | PASS | JH_ADD = 0 for USER |
| 19 | JH_EDIT | "Edit" button on job history rows visible | SUPERADMIN | YES | PASS | |
| 20 | JH_EDIT | "Edit" button on job history rows visible | ADMIN | YES | PASS | |
| 21 | JH_EDIT | "Edit" button hidden on all job history rows | USER | NO | PASS | JH_EDIT = 0 for USER |
| 22 | JH_DEL | "Deactivate" button on job history rows visible | SUPERADMIN | YES | PASS | |
| 23 | JH_DEL | "Deactivate" button hidden (ADMIN cannot soft-delete) | ADMIN | NO | PASS | JH_DEL = 0 for ADMIN |
| 24 | JH_DEL | "Deactivate" button hidden | USER | NO | PASS | JH_DEL = 0 for USER |

### Module: Job_Mod (Job Module)

| # | Right Code | Description | User Type | Expected | Result | Notes |
|---|---|---|---|---|---|---|
| 25 | JOB_VIEW | Jobs page loads and shows job table | SUPERADMIN | YES | PASS | |
| 26 | JOB_VIEW | Jobs page loads and shows job table | ADMIN | YES | PASS | |
| 27 | JOB_VIEW | Jobs page loads and shows job table | USER | YES | PASS | |
| 28 | JOB_ADD | "+ Add Job" button visible | SUPERADMIN | YES | PASS | |
| 29 | JOB_ADD | "+ Add Job" button visible | ADMIN | YES | PASS | |
| 30 | JOB_ADD | "+ Add Job" button hidden | USER | NO | PASS | JOB_ADD = 0 for USER |
| 31 | JOB_EDIT | "Edit" button on job rows visible | SUPERADMIN | YES | PASS | |
| 32 | JOB_EDIT | "Edit" button on job rows visible | ADMIN | YES | PASS | |
| 33 | JOB_EDIT | "Edit" button hidden | USER | NO | PASS | JOB_EDIT = 0 for USER |
| 34 | JOB_DEL | "Deactivate" button visible on job rows | SUPERADMIN | YES | PASS | |
| 35 | JOB_DEL | "Deactivate" button hidden (ADMIN cannot soft-delete) | ADMIN | NO | PASS | JOB_DEL = 0 for ADMIN |
| 36 | JOB_DEL | "Deactivate" button hidden | USER | NO | PASS | JOB_DEL = 0 for USER |

### Module: Dept_Mod (Department Module)

| # | Right Code | Description | User Type | Expected | Result | Notes |
|---|---|---|---|---|---|---|
| 37 | DEPT_VIEW | Departments page loads and shows department table | SUPERADMIN | YES | PASS | |
| 38 | DEPT_VIEW | Departments page loads and shows department table | ADMIN | YES | PASS | |
| 39 | DEPT_VIEW | Departments page loads and shows department table | USER | YES | PASS | |
| 40 | DEPT_ADD | "+ Add Department" button visible | SUPERADMIN | YES | PASS | |
| 41 | DEPT_ADD | "+ Add Department" button visible | ADMIN | YES | PASS | |
| 42 | DEPT_ADD | "+ Add Department" button hidden | USER | NO | PASS | DEPT_ADD = 0 for USER |
| 43 | DEPT_EDIT | "Edit" button on department rows visible | SUPERADMIN | YES | PASS | |
| 44 | DEPT_EDIT | "Edit" button on department rows visible | ADMIN | YES | PASS | |
| 45 | DEPT_EDIT | "Edit" button hidden | USER | NO | PASS | DEPT_EDIT = 0 for USER |
| 46 | DEPT_DEL | "Deactivate" button visible on department rows | SUPERADMIN | YES | PASS | |
| 47 | DEPT_DEL | "Deactivate" button hidden (ADMIN cannot soft-delete) | ADMIN | NO | PASS | DEPT_DEL = 0 for ADMIN |
| 48 | DEPT_DEL | "Deactivate" button hidden | USER | NO | PASS | DEPT_DEL = 0 for USER |

### Module: Adm_Mod (Admin Module)

| # | Right Code | Description | User Type | Expected | Result | Notes |
|---|---|---|---|---|---|---|
| 49 | ADM_USER | "Admin" sidebar link visible, Admin page accessible | SUPERADMIN | YES | PASS | |
| 50 | ADM_USER | "Admin" sidebar link hidden, /admin route blocked | ADMIN | NO | PASS | ADM_USER = 0 for ADMIN |
| 51 | ADM_USER | "Admin" sidebar link hidden, /admin route blocked | USER | NO | PASS | ADM_USER = 0 for USER |

---

## Summary

| Result | Count |
|---|---|
| PASS | 51 |
| FAIL | 0 |
| Total | 51 |

**All 51 rights test cases PASS.**

---

## Additional Verifications

### Stamp Column Visibility
| User Type | Stamp Visible in Employee Table? | Expected | Result |
|---|---|---|---|
| SUPERADMIN | YES | YES | PASS |
| ADMIN | YES | YES | PASS |
| USER | NO (column not rendered) | NO | PASS |

### Deleted Items Sidebar Link Visibility
| User Type | "Deleted Items" Link Visible? | Expected | Result |
|---|---|---|---|
| SUPERADMIN | YES | YES | PASS |
| ADMIN | YES | YES | PASS |
| USER | NO (link hidden) | NO | PASS |

### /deleted-items Route Guard
| User Type | Can Access /deleted-items? | Expected | Result |
|---|---|---|---|
| SUPERADMIN | YES | YES | PASS |
| ADMIN | YES | YES | PASS |
| USER | NO (redirected) | NO | PASS |

---

## Hard Delete Audit

Searched entire codebase (`src/`) for any `.delete(` calls targeting HR tables.

**Command run:** `grep -r "\.delete(" src/`  
**Result:** Zero matches found.  
**Verdict:** PASS — no hard deletes exist in application code. All removals use `record_status = 'INACTIVE'` (soft delete).

---

*Tested by: M5 — QA / Documentation Specialist*  
*Sprint 2 Gate requirement: All 51 cases must PASS ✅*
