-- RLS policies for user management table (Admin Module)
-- All users can read their own row; SUPERADMIN can read/update all rows

ALTER TABLE "user" ENABLE ROW LEVEL SECURITY;

-- Helper function: avoids recursive RLS by running as SECURITY DEFINER (bypasses RLS)
CREATE OR REPLACE FUNCTION public.is_superadmin()
RETURNS boolean LANGUAGE sql SECURITY DEFINER STABLE AS $$
  SELECT EXISTS (
    SELECT 1 FROM public."user"
    WHERE id = auth.uid()
      AND user_type = 'SUPERADMIN'
      AND record_status = 'ACTIVE'
  );
$$;

-- All authenticated users: read own row (required for login/auth flow)
CREATE POLICY "users_select_own"
  ON "user" FOR SELECT
  USING (id = auth.uid());

-- SUPERADMIN: read all rows (for Admin page user list)
CREATE POLICY "superadmin_select_users"
  ON "user" FOR SELECT
  USING (public.is_superadmin());

-- SUPERADMIN: update any row (for promote/demote/activate/deactivate)
CREATE POLICY "superadmin_update_users"
  ON "user" FOR UPDATE
  USING (public.is_superadmin());
