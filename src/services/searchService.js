import { supabase } from '../lib/supabaseClient';

export async function globalSearch(query, userType) {
  if (!query || query.trim().length < 1) return { results: [], error: null };

  const q = query.trim();
  const onlyActive = userType === 'USER';

  const [empRes, deptRes, jobRes] = await Promise.all([
    // Employees: search empno, firstname, lastname
    (() => {
      let qb = supabase
        .from('employee')
        .select('empno, firstname, lastname, record_status')
        .or(`empno.ilike.%${q}%,firstname.ilike.%${q}%,lastname.ilike.%${q}%`)
        .order('empno')
        .limit(8);
      if (onlyActive) qb = qb.eq('record_status', 'ACTIVE');
      return qb;
    })(),

    // Departments: search deptcode, deptname
    (() => {
      let qb = supabase
        .from('department')
        .select('deptcode, deptname, record_status')
        .or(`deptcode.ilike.%${q}%,deptname.ilike.%${q}%`)
        .order('deptcode')
        .limit(6);
      if (onlyActive) qb = qb.eq('record_status', 'ACTIVE');
      return qb;
    })(),

    // Jobs: search jobcode, jobdesc
    (() => {
      let qb = supabase
        .from('job')
        .select('jobcode, jobdesc, record_status')
        .or(`jobcode.ilike.%${q}%,jobdesc.ilike.%${q}%`)
        .order('jobcode')
        .limit(6);
      if (onlyActive) qb = qb.eq('record_status', 'ACTIVE');
      return qb;
    })(),
  ]);

  const error = empRes.error || deptRes.error || jobRes.error;
  if (error) return { results: [], error };

  const results = [
    ...(empRes.data ?? []).map(r => ({
      type: 'employee',
      label: `${r.firstname} ${r.lastname}`,
      sub: `Emp No. ${r.empno}`,
      status: r.record_status,
      href: `/employees/${r.empno}`,
    })),
    ...(deptRes.data ?? []).map(r => ({
      type: 'department',
      label: r.deptname,
      sub: `Code: ${r.deptcode}`,
      status: r.record_status,
      href: '/departments',
    })),
    ...(jobRes.data ?? []).map(r => ({
      type: 'job',
      label: r.jobdesc,
      sub: `Code: ${r.jobcode}`,
      status: r.record_status,
      href: '/jobs',
    })),
  ];

  return { results, error: null };
}
