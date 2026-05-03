# HRMS-Group-5

## 🌿 Branching Strategy

Our team follows a strict 3-tier branching system. **Direct pushes to `main` and `dev` are blocked.**

* **`main` (Production Branch):** This is the final, stable version of the app. Code only reaches this branch at the end of a sprint via a Pull Request from `dev`.
* **`dev` (Development/Staging Branch):** This is our integration branch. All completed features are merged here first to ensure they work together properly. 
* **`feature/*` (Task Branches):** Whenever you start a new task, create a branch off of `dev`. 
  * Name it descriptively based on what you are doing: `feat/employee-ui`, `db/cascade-trigger`, `fix/login-bug`.
  * When your task is finished, open a Pull Request (PR) to merge it back into `dev`.
  * At least 1 team member must review and approve your PR before it can be merged.


# Hope, Inc. – Human Resource System

A web-based HR System built with React 18, Vite, Tailwind CSS, and Supabase.

---

## Tech Stack
- **Frontend:** React 18 + Vite
- **Styling:** Tailwind CSS
- **Backend/DB:** Supabase (PostgreSQL + Auth + RLS)
- **Routing:** React Router v6
- **Testing:** Vitest + React Testing Library

---

## Local Setup

1. Clone the repository
```bash
   git clone https://github.com/JohnLoyd05/HRMS-Group-5/edit/main/README.md
   cd C:\Users\A\Documents\Infoman2-Proj-HRMS
```

2. Install dependencies
```bash
   npm install
```

3. Set up environment variables — copy the example file and fill in your Supabase credentials
```bash
   cp .env.example .env
```
   Open `.env` and set:
   
4. Run the development server
```bash
   npm run dev
```

---

## Branching Strategy

| Branch | Purpose |
|--------|---------|
| `main` | Production only. Never push directly. Merged via release PR reviewed by at least 1 member. |
| `dev` | Stable working branch. All feature branches are created from here. |
| `feat/*` | New features |
| `fix/*` | Bug fixes |
| `db/*` | Database changes (schema, RLS, migrations, views, triggers) |
| `test/*` | Test files |
| `docs/*` | Documentation only |
| `chore/*` | Config, tooling, dependencies |

**Flow:** `feature branch → PR → dev → release PR (at least 1 approve) → main`

---

## Team

| Member | Role |
|--------|------|
| M1 | Project Lead / Full-Stack |
| M2 | Frontend Developer (UI/UX) |
| M3 | Backend / DB Engineer |
| M4 | Rights & Auth Specialist |
| M5 | QA / Documentation |
