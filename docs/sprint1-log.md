# Sprint 1 Log — Hope, Inc. HR System

**Sprint Dates:** [Week 1 start date] – [Week 2 end date]  
**Sprint Goal:** Dev environment ready, Supabase fully initialized with all HR tables and seed data, email + Google OAuth registration working, login guard in place.

---

## Tasks Completed

| Member | Task | Branch | PR | Status |
|--------|------|--------|----|--------|
| M1 | Vite + React + Tailwind scaffold | feat/project-scaffold | #__ | ✅ Merged |
| M1 | Supabase JS client setup | feat/supabase-client | #__ | ✅ Merged |
| M1 | React Router v6 + ProtectedRoute | feat/routing-skeleton | #__ | ✅ Merged |
| M1 | Branch protection rules | chore/github-branch-protection | #__ | ✅ Merged |
| M2 | Login page UI | feat/ui-login-page | #17 | ✅ Merged |
| M2 | Register page UI | feat/ui-register-page | #18 | ✅ Merged |
| M2 | App shell (Navbar + Sidebar) | feat/ui-app-shell | #19 | ✅ Merged |
| M2 | /auth/callback loading page | feat/ui-auth-callback | #20 | ✅ Merged |
| M3 | HopeDB HR tables + record_status/stamp | db/initial-schema | #24 | ✅ Merged |
| M3 | Rights tables + 5 modules + 17 rights + SUPERADMIN seed | db/rights-seeds | #25 | ✅ Merged |
| M3 | ERD diagram | docs/db-erd | #28 | ✅ Merged |
| M3 | Seed verification queries | db/verify-seed | #30 | ✅ Merged |
| M4 | AuthContext + session listener | feat/auth-context | #10 | ✅ Merged |
| M4 | Email signUp/signIn wired | feat/auth-email-signup | #12 | ✅ Merged |
| M4 | Google OAuth + /auth/callback | feat/auth-google-oauth | #13 | ✅ Merged |
| M4 | provision_new_user() trigger | db/trigger-provision-user | #__ | ✅ Merged |
| M5 | Vitest setup + auth flow tests | test/sprint1-auth-flows | #__ | ✅ Merged |
| M5 | Sprint 1 log + README update | docs/sprint1-log-readme | #__ | ✅ Merged |

---

## Test Results (M5)

| Test Case | Expected Result | Actual Result | Status |
|-----------|-----------------|---------------|--------|
| Email registration — valid input | signUp called, no error returned | ✅ Passed | ✅ |
| Email registration — duplicate email | Error: "User already registered" | ✅ Passed | ✅ |
| Google OAuth — signInWithOAuth called with google + redirect URL | Correct provider + redirect | ✅ Passed | ✅ |
| Login guard — INACTIVE user | signOut() called, currentUser = null | ✅ Passed | ✅ |
| Login guard — ACTIVE user | currentUser set, signOut NOT called | ✅ Passed | ✅ |

---

## Blockers & Resolutions

| Blocker | Resolution |
|---------|------------|
| [Describe any blockers your team encountered] | [How it was resolved] |

---

## Sprint Gate Check

- [x] 31 employees seeded in Supabase
- [x] 8 departments seeded
- [x] 14 jobs seeded
- [x] 54 job history rows seeded
- [x] Login guard working for email auth
- [x] Login guard working for Google OAuth
- [x] INACTIVE user blocked from logging in

---

## Next Sprint Goals (Sprint 2)

- Full CRUD for all 4 HR modules (Employee, Job History, Job, Department)
- 17-right enforcement (gated Add/Edit/Delete buttons per user type)
- Soft-delete cascade (employee → job history)
- Deleted Items panel for ADMIN/SUPERADMIN
- M5: Execute 51-case rights test matrix