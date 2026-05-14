-- 005_verify_seed.sql
-- Verification queries — run after all migrations to confirm correct setup

-- 1. Row count checks
SELECT 'employee'   AS table_name, COUNT(*) AS row_count FROM employee         -- expect 31
UNION ALL
SELECT 'department',               COUNT(*)              FROM department        -- expect 8
UNION ALL
SELECT 'job',                      COUNT(*)              FROM job               -- expect 14
UNION ALL
SELECT 'jobHistory',               COUNT(*)              FROM jobHistory        -- expect 54
UNION ALL
SELECT 'Module',                   COUNT(*)              FROM "Module"          -- expect 5
UNION ALL
SELECT 'rights',                   COUNT(*)              FROM rights;           -- expect 17

-- 2. Confirm record_status defaults to ACTIVE
SELECT COUNT(*) AS active_employees FROM employee   WHERE record_status = 'ACTIVE';  -- expect 31
SELECT COUNT(*) AS active_jobs      FROM job        WHERE record_status = 'ACTIVE';  -- expect 14
SELECT COUNT(*) AS active_depts     FROM department WHERE record_status = 'ACTIVE';  -- expect 8
SELECT COUNT(*) AS active_jh        FROM jobHistory WHERE record_status = 'ACTIVE';  -- expect 54

-- 3. Confirm stamp and record_status columns exist
SELECT column_name FROM information_schema.columns
WHERE table_name IN ('employee','department','job','jobhistory')
  AND column_name IN ('record_status','stamp')
ORDER BY table_name, column_name;  -- expect 8 rows (2 per table)

-- 4. FK integrity check — no orphaned jobHistory rows
SELECT COUNT(*) AS orphaned_emp FROM jobHistory jh
LEFT JOIN employee e ON jh.empNo = e.empno WHERE e.empno IS NULL;  -- expect 0

SELECT COUNT(*) AS orphaned_job FROM jobHistory jh
LEFT JOIN job j ON jh.jobCode = j.jobCode WHERE j.jobCode IS NULL; -- expect 0

SELECT COUNT(*) AS orphaned_dept FROM jobHistory jh
LEFT JOIN department d ON jh.deptCode = d.deptCode WHERE d.deptCode IS NULL; -- expect 0

-- 5. SUPERADMIN rights check
SELECT u.email, COUNT(umr.rightCode) AS total_rights
FROM "user" u
JOIN "UserModule_Rights" umr ON u.id = umr.user_id
WHERE u.user_type = 'SUPERADMIN' AND umr.right_value = 1
GROUP BY u.email;  -- expect jcesperanza@neu.edu.ph with 17 rights