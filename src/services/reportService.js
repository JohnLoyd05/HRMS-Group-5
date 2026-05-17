import { supabase } from '../lib/supabaseClient'

// Headcount per department — from headcount_by_dept view (M3 creates this)
export async function getHeadcountByDept() {
  const { data, error } = await supabase
    .from('headcount_by_dept')
    .select('deptcode, deptname, activeheadcount')
    .order('activeheadcount', { ascending: false })
  return { data, error }
}

// Min/Max/Avg salary per job — from salary_summary_by_job view (M3 creates this)
export async function getSalarySummaryByJob() {
  const { data, error } = await supabase
    .from('salary_summary_by_job')
    .select('jobcode, jobdesc, assignments, minsalary, maxsalary, avgsalary')
    .order('avgsalary', { ascending: false })
  return { data, error }
}

// Full job history for one employee
export async function getEmployeeFullHistory(empNo) {
  const { data, error } = await supabase
    .from('jobhistory')
    .select('empno, jobcode, effdate, salary, deptcode, record_status, stamp')
    .eq('empno', empNo)
    .order('effdate', { ascending: true })
  return { data, error }
}