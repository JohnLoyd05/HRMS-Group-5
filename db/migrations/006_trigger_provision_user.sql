-- 006_trigger_provision_user.sql
-- provision_new_user() trigger: fires on auth.users INSERT
-- Creates USER/INACTIVE row, 5 user_module rows, 17 UserModule_Rights rows (VIEW=1, all others=0)

CREATE OR REPLACE FUNCTION public.provision_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO public."user" (id, email, firstname, lastname, username, user_type, record_status, stamp)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'first_name',
    NEW.raw_user_meta_data->>'last_name',
    NEW.raw_user_meta_data->>'username',
    'USER',
    'INACTIVE',
    'PROVISIONED ' || NOW()::text
  );

  INSERT INTO public.user_module (user_id, moduleCode, rights_value) VALUES
    (NEW.id, 'Emp_Mod',  1),
    (NEW.id, 'JH_Mod',   1),
    (NEW.id, 'Job_Mod',  1),
    (NEW.id, 'Dept_Mod', 1),
    (NEW.id, 'Adm_Mod',  0);

  INSERT INTO public."UserModule_Rights" (user_id, rightCode, right_value) VALUES
    (NEW.id, 'EMP_VIEW',  1),
    (NEW.id, 'EMP_ADD',   0),
    (NEW.id, 'EMP_EDIT',  0),
    (NEW.id, 'EMP_DEL',   0),
    (NEW.id, 'JH_VIEW',   1),
    (NEW.id, 'JH_ADD',    0),
    (NEW.id, 'JH_EDIT',   0),
    (NEW.id, 'JH_DEL',    0),
    (NEW.id, 'JOB_VIEW',  1),
    (NEW.id, 'JOB_ADD',   0),
    (NEW.id, 'JOB_EDIT',  0),
    (NEW.id, 'JOB_DEL',   0),
    (NEW.id, 'DEPT_VIEW', 1),
    (NEW.id, 'DEPT_ADD',  0),
    (NEW.id, 'DEPT_EDIT', 0),
    (NEW.id, 'DEPT_DEL',  0),
    (NEW.id, 'ADM_USER',  0);

  RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.provision_new_user();
