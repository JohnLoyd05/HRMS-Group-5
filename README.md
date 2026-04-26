# HRMS-Group-5000

## 🌿 Branching Strategy

Our team follows a strict 3-tier branching system. **Direct pushes to `main` and `dev` are blocked.**

* **`main` (Production Branch):** This is the final, stable version of the app. Code only reaches this branch at the end of a sprint via a Pull Request from `dev`.
* **`dev` (Development/Staging Branch):** This is our integration branch. All completed features are merged here first to ensure they work together properly. 
* **`feature/*` (Task Branches):** Whenever you start a new task, create a branch off of `dev`. 
  * Name it descriptively based on what you are doing: `feat/employee-ui`, `db/cascade-trigger`, `fix/login-bug`.
  * When your task is finished, open a Pull Request (PR) to merge it back into `dev`.
  * At least 1 team member must review and approve your PR before it can be merged.
