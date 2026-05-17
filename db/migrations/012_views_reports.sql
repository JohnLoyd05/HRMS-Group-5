-- 012_views_reports.sql
-- HR Report Views: headcount by department and salary summary by job
-- pr fix
CREATE OR REPLACE VIEW public.headcount_by_dept AS
SELECT
  d.deptcode,
  d.deptname,
  COUNT(DISTINCT jh.empno) AS activeheadcount
FROM public.department d
LEFT JOIN public.jobhistory jh
  ON jh.deptcode = d.deptcode
  AND jh.record_status = 'ACTIVE'
  AND jh.effdate = (
    SELECT MAX(jh2.effdate)
    FROM public.jobhistory jh2
    WHERE jh2.empno = jh.empno
      AND jh2.record_status = 'ACTIVE'
  )
WHERE d.record_status = 'ACTIVE'
GROUP BY d.deptcode, d.deptname
ORDER BY activeheadcount DESC;


CREATE OR REPLACE VIEW public.salary_summary_by_job AS
SELECT
  j.jobcode,
  j.jobdesc,
  COUNT(*) AS assignments,
  MIN(jh.salary) AS minsalary,
  MAX(jh.salary) AS maxsalary,
  ROUND(AVG(jh.salary), 2) AS avgsalary
FROM public.job j
JOIN public.jobhistory jh ON jh.jobcode = j.jobcode
WHERE jh.record_status = 'ACTIVE'
  AND j.record_status = 'ACTIVE'
GROUP BY j.jobcode, j.jobdesc
ORDER BY avgsalary DESC;