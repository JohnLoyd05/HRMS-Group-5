import { supabase } from '../lib/supabaseClient'

export async function getHeadcountByDept() {
  const { data, error } = await supabase
    .from('headcount_by_dept')
    .select('deptcode, deptname, activeheadcount')
    .order('activeheadcount', { ascending: false })
  return { data, error }
}

export async function getSalarySummaryByJob() {
  const { data, error } = await supabase
    .from('salary_summary_by_job')
    .select('jobcode, jobdesc, assignments, minsalary, maxsalary, avgsalary')
    .order('avgsalary', { ascending: false })
  return { data, error }
}

export async function getEmployeeFullHistory(empNo) {
  const { data, error } = await supabase
    .from('jobhistory')
    .select('empno, jobcode, effdate, salary, deptcode, record_status, stamp')
    .eq('empno', empNo)
    .order('effdate', { ascending: true })
  return { data, error }
}
