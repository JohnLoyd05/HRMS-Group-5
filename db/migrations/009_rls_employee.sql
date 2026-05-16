-- 1. SELECT: USER sees ACTIVE only; ADMIN/SUPERADMIN see all
CREATE POLICY emp_select ON public.employee
  FOR SELECT TO authenticated
  USING (
    record_status = 'ACTIVE'
    OR EXISTS (
      SELECT 1 FROM public."user"
      WHERE "userId" = auth.uid()::text
        AND user_type IN ('ADMIN','SUPERADMIN')
    )
  );

-- 2. INSERT: requires EMP_ADD = 1
CREATE POLICY emp_insert ON public.employee
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public."UserModule_Rights" umr
      JOIN public."user" u ON u."userId" = auth.uid()::text
      WHERE umr."userId" = u."userId"
        AND umr.right_code = 'EMP_ADD'
        AND umr.right_value = 1
    )
  );

-- 3. UPDATE (edit fields): requires EMP_EDIT = 1
CREATE POLICY emp_update_edit ON public.employee
  FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public."UserModule_Rights" umr
      JOIN public."user" u ON u."userId" = auth.uid()::text
      WHERE umr."userId" = u."userId"
        AND umr.right_code = 'EMP_EDIT'
        AND umr.right_value = 1
    )
  );

-- 4. UPDATE record_status to INACTIVE: requires EMP_DEL = 1
-- 5. UPDATE record_status to ACTIVE (recover): requires ADMIN or SUPERADMIN
-- (These can be separate policies or handled via the EDIT policy + app-layer logic;
--  the guide shows these as part of the UPDATE policies)