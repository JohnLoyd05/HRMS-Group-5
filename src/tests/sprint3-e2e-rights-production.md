# Sprint 3 — End-to-End Rights Regression (Production)
**M4 — Rights & Authentication Specialist**  
**Date:** 2026-05-17  
**Environment:** Production (Vercel) + Supabase

---

## Test Accounts

| User Type   | Email                        | record_status |
|-------------|------------------------------|---------------|
| SUPERADMIN  | jcesperanza@neu.edu.ph       | ACTIVE        |
| ADMIN       | admin-test@hope.com          | ACTIVE        |
| USER        | user-test@hope.com           | ACTIVE        |

---

## HR Module Button Gating (All 3 User Types)

| # | Module     | Action  | SUPERADMIN | ADMIN | USER   | Result |
|---|------------|---------|------------|-------|--------|--------|
| 1 | Employee   | Add     | Visible    | Visible | Hidden | PASS |
| 2 | Employee   | Edit    | Visible    | Visible | Hidden | PASS |
| 3 | Employee   | Delete  | Visible    | Hidden  | Hidden | PASS |
| 4 | Job History| Add     | Visible    | Visible | Hidden | PASS |
| 5 | Job History| Edit    | Visible    | Visible | Hidden | PASS |
| 6 | Job History| Delete  | Visible    | Hidden  | Hidden | PASS |
| 7 | Job        | Add     | Visible    | Visible | Hidden | PASS |
| 8 | Job        | Edit    | Visible    | Visible | Hidden | PASS |
| 9 | Job        | Delete  | Visible    | Hidden  | Hidden | PASS |
|10 | Department | Add     | Visible    | Visible | Hidden | PASS |
|11 | Department | Edit    | Visible    | Visible | Hidden | PASS |
|12 | Department | Delete  | Visible    | Hidden  | Hidden | PASS |

---

## Admin Sidebar Link Gating

| User Type  | Admin Link Visible? | Expected | Result |
|------------|---------------------|----------|--------|
| SUPERADMIN | YES                 | YES      | PASS   |
| ADMIN      | NO                  | NO       | PASS   |
| USER       | NO                  | NO       | PASS   |

---

## SUPERADMIN Row Protection (UserManagementPage)

| # | Test                                              | Result |
|---|---------------------------------------------------|--------|
| 1 | SUPERADMIN row shows "Protected" badge (UI)       | PASS   |
| 2 | Activate/Deactivate buttons disabled for SUPERADMIN | PASS |
| 3 | ADMIN direct Supabase call to modify SUPERADMIN blocked by RLS | PASS |

---

## Google OAuth in Production

| # | Test                                               | Result |
|---|----------------------------------------------------|--------|
| 1 | Sign in with Google redirects correctly            | PASS   |
| 2 | New Google account provisioned as USER / INACTIVE  | PASS   |
| 3 | After admin activation, 17 rights load correctly   | PASS   |

---

## Stamp Visibility (All 4 Tables)

| Table      | SUPERADMIN sees stamp | ADMIN sees stamp | USER sees stamp | Result |
|------------|-----------------------|------------------|-----------------|--------|
| Employee   | YES                   | YES              | NO              | PASS   |
| Job History| YES                   | YES              | NO              | PASS   |
| Jobs       | YES                   | YES              | NO              | PASS   |
| Departments| YES                   | YES              | NO              | PASS   |

---

*Tested by: M4 — Rights & Authentication Specialist*  
*Sprint 3 | Production environment | 2026-05-17*