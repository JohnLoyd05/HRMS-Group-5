-- 010_rls_jobhistory_job_dept.sql
-- RLS policies for jobhistory, job, and department tables.

-- ============================================================
-- ENABLE RLS ON ALL 3 TABLES
-- ============================================================
ALTER TABLE public.jobhistory  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.department  ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- jobhistory
-- ============================================================

CREATE POLICY jh_select ON public.jobhistory
  FOR SELECT TO authenticated
  USING (
    record_status = 'ACTIVE'
    OR EXISTS (
      SELECT 1 FROM public."user"
      WHERE id::uuid = auth.uid()
        AND user_type IN ('ADMIN', 'SUPERADMIN')
    )
  );

CREATE POLICY jh_insert ON public.jobhistory
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public."UserModule_Rights" umr
      JOIN public."user" u ON u.id::uuid = auth.uid()
      WHERE umr.user_id = u.id
        AND umr.rightcode = 'JH_ADD'
        AND umr.right_value = 1
    )
  );

CREATE POLICY jh_update_edit ON public.jobhistory
  FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public."UserModule_Rights" umr
      JOIN public."user" u ON u.id::uuid = auth.uid()
      WHERE umr.user_id = u.id
        AND umr.rightcode = 'JH_EDIT'
        AND umr.right_value = 1
    )
  );

CREATE POLICY jh_update_deactivate ON public.jobhistory
  FOR UPDATE TO authenticated
  USING (
    record_status = 'ACTIVE'
    AND EXISTS (
      SELECT 1 FROM public."UserModule_Rights" umr
      JOIN public."user" u ON u.id::uuid = auth.uid()
      WHERE umr.user_id = u.id
        AND umr.rightcode = 'JH_DEL'
        AND umr.right_value = 1
    )
  );

CREATE POLICY jh_update_recover ON public.jobhistory
  FOR UPDATE TO authenticated
  USING (
    record_status = 'INACTIVE'
    AND EXISTS (
      SELECT 1 FROM public."user"
      WHERE id::uuid = auth.uid()
        AND user_type IN ('ADMIN', 'SUPERADMIN')
    )
  );

-- ============================================================
-- job
-- ============================================================

CREATE POLICY job_select ON public.job
  FOR SELECT TO authenticated
  USING (
    record_status = 'ACTIVE'
    OR EXISTS (
      SELECT 1 FROM public."user"
      WHERE id::uuid = auth.uid()
        AND user_type IN ('ADMIN', 'SUPERADMIN')
    )
  );

CREATE POLICY job_insert ON public.job
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public."UserModule_Rights" umr
      JOIN public."user" u ON u.id::uuid = auth.uid()
      WHERE umr.user_id = u.id
        AND umr.rightcode = 'JOB_ADD'
        AND umr.right_value = 1
    )
  );

CREATE POLICY job_update_edit ON public.job
  FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public."UserModule_Rights" umr
      JOIN public."user" u ON u.id::uuid = auth.uid()
      WHERE umr.user_id = u.id
        AND umr.rightcode = 'JOB_EDIT'
        AND umr.right_value = 1
    )
  );

CREATE POLICY job_update_deactivate ON public.job
  FOR UPDATE TO authenticated
  USING (
    record_status = 'ACTIVE'
    AND EXISTS (
      SELECT 1 FROM public."UserModule_Rights" umr
      JOIN public."user" u ON u.id::uuid = auth.uid()
      WHERE umr.user_id = u.id
        AND umr.rightcode = 'JOB_DEL'
        AND umr.right_value = 1
    )
  );

CREATE POLICY job_update_recover ON public.job
  FOR UPDATE TO authenticated
  USING (
    record_status = 'INACTIVE'
    AND EXISTS (
      SELECT 1 FROM public."user"
      WHERE id::uuid = auth.uid()
        AND user_type IN ('ADMIN', 'SUPERADMIN')
    )
  );

-- ============================================================
-- department
-- ============================================================

CREATE POLICY dept_select ON public.department
  FOR SELECT TO authenticated
  USING (
    record_status = 'ACTIVE'
    OR EXISTS (
      SELECT 1 FROM public."user"
      WHERE id::uuid = auth.uid()
        AND user_type IN ('ADMIN', 'SUPERADMIN')
    )
  );

CREATE POLICY dept_insert ON public.department
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public."UserModule_Rights" umr
      JOIN public."user" u ON u.id::uuid = auth.uid()
      WHERE umr.user_id = u.id
        AND umr.rightcode = 'DEPT_ADD'
        AND umr.right_value = 1
    )
  );

CREATE POLICY dept_update_edit ON public.department
  FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public."UserModule_Rights" umr
      JOIN public."user" u ON u.id::uuid = auth.uid()
      WHERE umr.user_id = u.id
        AND umr.rightcode = 'DEPT_EDIT'
        AND umr.right_value = 1
    )
  );

CREATE POLICY dept_update_deactivate ON public.department
  FOR UPDATE TO authenticated
  USING (
    record_status = 'ACTIVE'
    AND EXISTS (
      SELECT 1 FROM public."UserModule_Rights" umr
      JOIN public."user" u ON u.id::uuid = auth.uid()
      WHERE umr.user_id = u.id
        AND umr.rightcode = 'DEPT_DEL'
        AND umr.right_value = 1
    )
  );

CREATE POLICY dept_update_recover ON public.department
  FOR UPDATE TO authenticated
  USING (
    record_status = 'INACTIVE'
    AND EXISTS (
      SELECT 1 FROM public."user"
      WHERE id::uuid = auth.uid()
        AND user_type IN ('ADMIN', 'SUPERADMIN')
    )
  );
