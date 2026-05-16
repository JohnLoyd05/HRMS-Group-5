-- 011_view_employee_current_job.sql
-- View: latest active job history row per active employee,
-- joined with job description and department name.

CREATE OR REPLACE VIEW public.employee_current_job AS
SELECT
  e.empno,
  e.lastname,
  e.firstname,
  e.gender,
  e.hiredate,
  jh.jobcode,
  j.jobdesc,
  jh.salary,
  jh.deptcode,
  d.deptname,
  jh.effdate AS current_effdate
FROM public.employee e
JOIN public.jobhistory jh ON jh.empno = e.empno
JOIN public.job j         ON j.jobcode = jh.jobcode
JOIN public.department d  ON d.deptcode = jh.deptcode
WHERE jh.effdate = (
  SELECT MAX(jh2.effdate)
  FROM public.jobhistory jh2
  WHERE jh2.empno = e.empno
    AND jh2.record_status = 'ACTIVE'
)
AND e.record_status = 'ACTIVE'
AND jh.record_status = 'ACTIVE';