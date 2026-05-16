-- 008b_verify_cascade_trigger.sql
-- Verification queries for the cascade soft-delete trigger.
-- Run these manually in Supabase SQL Editor to confirm the trigger works.

-- STEP 1: Check that the trigger exists
SELECT trigger_name, event_manipulation, action_timing
FROM information_schema.triggers
WHERE trigger_name = 'on_employee_status_change';
-- Expected: 1 row returned

-- STEP 2: Check that the function exists
SELECT routine_name
FROM information_schema.routines
WHERE routine_name = 'cascade_employee_soft_delete';
-- Expected: 1 row returned

-- STEP 3: Simulate soft-delete (use empno '00001')
-- Run this, then check jobhistory rows for empno '00001'
UPDATE public.employee
SET record_status = 'INACTIVE',
    stamp = 'TEST-DEACTIVATED by verify script'
WHERE empno = '00001';

-- Confirm cascade: all jobhistory rows for 00001 should now be INACTIVE
SELECT empno, jobcode, effdate, record_status
FROM public.jobhistory
WHERE empno = '00001';
-- Expected: ALL rows show record_status = 'INACTIVE'

-- STEP 4: Simulate recovery
UPDATE public.employee
SET record_status = 'ACTIVE',
    stamp = 'TEST-REACTIVATED by verify script'
WHERE empno = '00001';

-- Confirm cascade restore: all jobhistory rows for 00001 should be ACTIVE again
SELECT empno, jobcode, effdate, record_status
FROM public.jobhistory
WHERE empno = '00001';
-- Expected: ALL rows show record_status = 'ACTIVE'