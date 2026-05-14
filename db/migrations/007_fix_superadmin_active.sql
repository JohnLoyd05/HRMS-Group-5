-- 007_fix_superadmin_active.sql
-- The provision_new_user() trigger fires for every auth.users INSERT,
-- including the SUPERADMIN account, creating a USER/INACTIVE row.
-- This migration promotes that row to SUPERADMIN/ACTIVE and grants all rights.
-- Run this ONCE after the SUPERADMIN auth account (jcesperanza@neu.edu.ph) exists.

UPDATE "user"
SET
  user_type     = 'SUPERADMIN',
  record_status = 'ACTIVE',
  firstname     = 'Jeremias',
  lastname      = 'Esperanza',
  username      = 'jcesperanza',
  stamp         = 'SUPERADMIN-FIXED'
WHERE email = 'jcesperanza@neu.edu.ph';

UPDATE "UserModule_Rights"
SET right_value = 1
WHERE user_id = (SELECT id FROM "user" WHERE email = 'jcesperanza@neu.edu.ph');

UPDATE user_module
SET rights_value = 1
WHERE user_id = (SELECT id FROM "user" WHERE email = 'jcesperanza@neu.edu.ph');
