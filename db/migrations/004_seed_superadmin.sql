-- 004_seed_superadmin.sql
-- SUPERADMIN seed for jcesperanza@neu.edu.ph
-- NOTE: Run this AFTER the SUPERADMIN account has been created via Supabase Auth.
-- Replace <SUPERADMIN_UUID> with the actual UUID from auth.users.

-- Step 1: Insert user row (get UUID from Supabase Auth → Users dashboard)
INSERT INTO "user" (id, email, firstname, lastname, username, user_type, record_status, stamp)
VALUES (
  '08ad2138-bd7b-4e01-bf84-2ef27f774118',
  'jcesperanza@neu.edu.ph',
  'Jeremias',
  'Esperanza',
  'jcesperanza',
  'SUPERADMIN',
  'ACTIVE',
  'SEEDED'
);

-- Step 2: Seed all 5 module rows with rights_value = 1
INSERT INTO user_module (user_id, moduleCode, rights_value)
SELECT '08ad2138-bd7b-4e01-bf84-2ef27f774118', moduleCode, 1 FROM "Module";

-- Step 3: Seed all 17 rights with right_value = 1
INSERT INTO "UserModule_Rights" (user_id, rightCode, right_value)
SELECT '08ad2138-bd7b-4e01-bf84-2ef27f774118', rightCode, 1 FROM rights;