# Final RLS Audit — HopeHRS HRMS
**Sprint 3 | M3 — Database / Backend**  
**Date:** 2026-05-17  
**Environment:** Supabase project (production + local dev)

---

## Scope

Audit all Row Level Security (RLS) policies applied to HR tables across Sprints 2–3.  
Confirms that every table has RLS enabled and that each user type sees only what they are permitted to see.

---

## Tables Audited

| Table | RLS Enabled | Migration File |
|---|---|---|
| employee | YES | 009_rls_employee.sql |
| jobHistory | YES | 010_rls_jobhistory_job_dept.sql |
| job | YES | 010_rls_jobhistory_job_dept.sql |
| department | YES | 010_rls_jobhistory_job_dept.sql |
| user | YES | 013_rls_admin_user_mgmt.sql |

---

## Policy Summary

### employee, jobHistory, job, department

| Policy | User Type | Effect |
|---|---|---|
| SELECT (ACTIVE only) | USER | Returns only rows where record_status = 'ACTIVE' |
| SELECT (all records) | ADMIN | Returns all rows including INACTIVE |
| SELECT (all records) | SUPERADMIN | Returns all rows including INACTIVE |
| INSERT / UPDATE / DELETE | ADMIN / SUPERADMIN | Permitted per rights matrix |
| INSERT / UPDATE / DELETE | USER | Blocked — rights matrix enforces at UI level; RLS blocks at DB level |

### user (Admin Module)

| Policy | User Type | Effect |
|---|---|---|
| SELECT | SUPERADMIN | Returns all user rows |
| UPDATE | SUPERADMIN | Permitted (activate / deactivate users) |
| SELECT / UPDATE | ADMIN | Blocked by RLS |
| SELECT / UPDATE | USER | Blocked by RLS |

---

## Verification Tests

| # | Test | Method | Result |
|---|---|---|---|
| 1 | USER cannot see INACTIVE employee rows via direct API | DevTools console query without ACTIVE filter | PASS |
| 2 | USER cannot see INACTIVE jobHistory rows via direct API | DevTools console query | PASS |
| 3 | USER cannot see INACTIVE job rows via direct API | DevTools console query | PASS |
| 4 | USER cannot see INACTIVE department rows via direct API | DevTools console query | PASS |
| 5 | ADMIN sees all records including INACTIVE via direct API | DevTools console query | PASS |
| 6 | ADMIN cannot read user table via direct API | DevTools console query | PASS |
| 7 | USER cannot read user table via direct API | DevTools console query | PASS |
| 8 | SUPERADMIN can read all user rows | DevTools console query | PASS |

---

## Hard Delete Confirmation

Searched entire codebase for `.delete(` calls targeting any HR table.

**Command:** `grep -r "\.delete(" src/`  
**Result:** 0 matches  
**Verdict:** PASS — no hard deletes exist. All removals use `record_status = 'INACTIVE'`.

---

## Conclusion

All 5 tables have RLS enabled. USER accounts are blocked from INACTIVE records and the user management table at the database level — not just the UI. No hard deletes exist anywhere in application code.

**RLS audit: PASS ✅**

---

*Authored by: M3 — Database / Backend*  
*Sprint 3 | 2026-05-17*