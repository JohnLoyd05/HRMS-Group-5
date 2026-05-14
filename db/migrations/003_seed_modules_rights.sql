-- 003_seed_modules_rights.sql
-- Seed 5 modules and 17 rights

INSERT INTO "Module" VALUES ('Emp_Mod',  'Employee Module',    'ACTIVE', 'SEEDED');
INSERT INTO "Module" VALUES ('JH_Mod',   'Job History Module', 'ACTIVE', 'SEEDED');
INSERT INTO "Module" VALUES ('Job_Mod',  'Job Module',         'ACTIVE', 'SEEDED');
INSERT INTO "Module" VALUES ('Dept_Mod', 'Department Module',  'ACTIVE', 'SEEDED');
INSERT INTO "Module" VALUES ('Adm_Mod',  'Admin Module',       'ACTIVE', 'SEEDED');

INSERT INTO rights VALUES ('EMP_VIEW',  'View Employees',          1, 'Emp_Mod',  'ACTIVE', 'SEEDED');
INSERT INTO rights VALUES ('EMP_ADD',   'Add Employee',            1, 'Emp_Mod',  'ACTIVE', 'SEEDED');
INSERT INTO rights VALUES ('EMP_EDIT',  'Edit Employee',           1, 'Emp_Mod',  'ACTIVE', 'SEEDED');
INSERT INTO rights VALUES ('EMP_DEL',   'Soft Delete Employee',    1, 'Emp_Mod',  'ACTIVE', 'SEEDED');
INSERT INTO rights VALUES ('JH_VIEW',   'View Job History',        1, 'JH_Mod',   'ACTIVE', 'SEEDED');
INSERT INTO rights VALUES ('JH_ADD',    'Add Job History',         1, 'JH_Mod',   'ACTIVE', 'SEEDED');
INSERT INTO rights VALUES ('JH_EDIT',   'Edit Job History',        1, 'JH_Mod',   'ACTIVE', 'SEEDED');
INSERT INTO rights VALUES ('JH_DEL',    'Soft Delete Job History', 1, 'JH_Mod',   'ACTIVE', 'SEEDED');
INSERT INTO rights VALUES ('JOB_VIEW',  'View Jobs',               1, 'Job_Mod',  'ACTIVE', 'SEEDED');
INSERT INTO rights VALUES ('JOB_ADD',   'Add Job',                 1, 'Job_Mod',  'ACTIVE', 'SEEDED');
INSERT INTO rights VALUES ('JOB_EDIT',  'Edit Job',                1, 'Job_Mod',  'ACTIVE', 'SEEDED');
INSERT INTO rights VALUES ('JOB_DEL',   'Soft Delete Job',         1, 'Job_Mod',  'ACTIVE', 'SEEDED');
INSERT INTO rights VALUES ('DEPT_VIEW', 'View Departments',        1, 'Dept_Mod', 'ACTIVE', 'SEEDED');
INSERT INTO rights VALUES ('DEPT_ADD',  'Add Department',          1, 'Dept_Mod', 'ACTIVE', 'SEEDED');
INSERT INTO rights VALUES ('DEPT_EDIT', 'Edit Department',         1, 'Dept_Mod', 'ACTIVE', 'SEEDED');
INSERT INTO rights VALUES ('DEPT_DEL',  'Soft Delete Department',  1, 'Dept_Mod', 'ACTIVE', 'SEEDED');
INSERT INTO rights VALUES ('ADM_USER',  'Admin Activate User',     1, 'Adm_Mod',  'ACTIVE', 'SEEDED');