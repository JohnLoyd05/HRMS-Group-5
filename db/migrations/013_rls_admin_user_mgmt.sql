-- RLS policies for user management table (Admin Module)
-- Only SUPERADMIN may read or modify user records

ALTER TABLE "user" ENABLE ROW LEVEL SECURITY;

-- SUPERADMIN: full access
CREATE POLICY "superadmin_select_users"
  ON "user" FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM "user" u
      WHERE u.user_id = auth.uid()
        AND u.user_type = 'SUPERADMIN'
        AND u.record_status = 'ACTIVE'
    )
  );

CREATE POLICY "superadmin_update_users"
  ON "user" FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM "user" u
      WHERE u.user_id = auth.uid()
        AND u.user_type = 'SUPERADMIN'
        AND u.record_status = 'ACTIVE'
    )
  );