# Branch Protection & Git Workflow

## Branch Structure

| Branch | Purpose |
|--------|---------|
| `main` | Production only. Never push directly. |
| `dev` | Stable working branch. All feature branches are created from here. |
| `feat/*` | New features |
| `fix/*` | Bug fixes |
| `db/*` | Database changes (schema, RLS, migrations, views, triggers) |
| `test/*` | Test files |
| `docs/*` | Documentation only |
| `chore/*` | Config, tooling, dependencies |

---

## Branch Protection Rules

### `main` branch
- ✅ No direct pushes allowed
- ✅ Requires pull request before merging
- ✅ Requires 1 member to approve before merging
- ✅ Only receives merges from `dev` via release PR at end of sprint

### `dev` branch
- ✅ No direct pushes allowed
- ✅ Requires pull request before merging
- ✅ Requires at least 1 member to approve before merging
- ✅ All feature branches are created from `dev`

---

## Git Flow

---

## PR Rules

- PRs must NEVER merge directly into `main`
- Flow: `feature branch → PR → dev → release PR → main`
- Every PR needs at least 1 reviewer before merging into `dev`
- The `dev → main` release PR needs 1 member to approve
- After a PR is merged, the feature branch must be deleted
- Draft or unmerged PRs do not count toward sprint PR minimums

---

## Branch Naming Convention

| Prefix | When to Use | Example |
|--------|-------------|---------|
| `feat/` | New feature | `feat/employee-soft-delete` |
| `fix/` | Bug fix | `fix/cascade-trigger-restore` |
| `db/` | Database change | `db/rls-employee-select` |
| `test/` | Test files | `test/rights-51-cases` |
| `docs/` | Documentation | `docs/user-manual-draft` |
| `refactor/` | Code cleanup | `refactor/employeeService` |
| `chore/` | Config, tooling | `chore/supabase-env-setup` |

---

## PR Checklist (also in pull_request_template.md)

- [ ] Branch created from `dev`, not from `main`
- [ ] Branch name follows naming convention
- [ ] PR title is imperative and specific
- [ ] All Vitest tests pass before requesting review
- [ ] No `console.log` statements in production code
- [ ] No `.env` files or secrets committed
- [ ] At least one team member has reviewed and approved
- [ ] Merge target is `dev` — never merge directly to `main`
- [ ] Feature branch deleted after merge

---

*Prepared by M1 – Project Lead*
*Hope, Inc. HR System – BSIT Capstone Project*
*New Era University – AY 2025–2026*