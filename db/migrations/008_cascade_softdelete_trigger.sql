-- 008_cascade_softdelete_trigger.sql
-- Cascade trigger: when employee is soft-deleted, all their jobHistory rows
-- are set to INACTIVE. When employee is recovered, their jobHistory rows
-- are restored to ACTIVE.

CREATE OR REPLACE FUNCTION public.cascade_employee_soft_delete()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.record_status = 'INACTIVE' AND OLD.record_status = 'ACTIVE' THEN
    UPDATE public."jobHistory"
    SET record_status = 'INACTIVE',
        stamp = 'CASCADE-DEL ' || NEW.empno || ' ' || NOW()::text
    WHERE "empNo" = NEW.empno;
  END IF;

  IF NEW.record_status = 'ACTIVE' AND OLD.record_status = 'INACTIVE' THEN
    UPDATE public."jobHistory"
    SET record_status = 'ACTIVE',
        stamp = 'CASCADE-RECOVER ' || NEW.empno || ' ' || NOW()::text
    WHERE "empNo" = NEW.empno;
  END IF;

  RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER on_employee_status_change
  AFTER UPDATE OF record_status ON public.employee
  FOR EACH ROW EXECUTE FUNCTION public.cascade_employee_soft_delete();
