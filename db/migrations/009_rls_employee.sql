-- 009_rls_employee.sql
-- RLS policies for the employee table.

ALTER TABLE public.employee ENABLE ROW LEVEL SECURITY;

-- 1. SELECT: USER sees ACTIVE only; ADMIN/SUPERADMIN see all
CREATE POLICY emp_select ON public.employee
  FOR SELECT TO authenticated
  USING (
    record_status = 'ACTIVE'
    OR EXISTS (
      SELECT 1 FROM public."user"
      WHERE id::uuid = auth.uid()
        AND user_type IN ('ADMIN', 'SUPERADMIN')
    )
  );

-- 2. INSERT: requires EMP_ADD = 1
CREATE POLICY emp_insert ON public.employee
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public."UserModule_Rights" umr
      JOIN public."user" u ON u.id::uuid = auth.uid()
      WHERE umr.user_id = u.id
        AND umr.rightcode = 'EMP_ADD'
        AND umr.right_value = 1
    )
  );

-- 3. UPDATE (edit fields): requires EMP_EDIT = 1
CREATE POLICY emp_update_edit ON public.employee
  FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public."UserModule_Rights" umr
      JOIN public."user" u ON u.id::uuid = auth.uid()
      WHERE umr.user_id = u.id
        AND umr.rightcode = 'EMP_EDIT'
        AND umr.right_value = 1
    )
  );

-- 4. UPDATE record_status to INACTIVE: requires EMP_DEL = 1
CREATE POLICY emp_update_deactivate ON public.employee
  FOR UPDATE TO authenticated
  USING (
    record_status = 'ACTIVE'
    AND EXISTS (
      SELECT 1 FROM public."UserModule_Rights" umr
      JOIN public."user" u ON u.id::uuid = auth.uid()
      WHERE umr.user_id = u.id
        AND umr.rightcode = 'EMP_DEL'
        AND umr.right_value = 1
    )
  );

-- 5. UPDATE record_status to ACTIVE (recover): ADMIN/SUPERADMIN only
CREATE POLICY emp_update_recover ON public.employee
  FOR UPDATE TO authenticated
  USING (
    record_status = 'INACTIVE'
    AND EXISTS (
      SELECT 1 FROM public."user"
      WHERE id::uuid = auth.uid()
        AND user_type IN ('ADMIN', 'SUPERADMIN')
    )
  );
