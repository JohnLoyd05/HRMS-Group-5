import { supabase } from '../lib/supabaseClient';

function makeStamp(action, userId) {
  return `${action} by ${userId} at ${new Date().toISOString()}`;
}

export async function getJobHistory(empNo, userType) {
  let query = supabase
    .from('jobhistory')
    .select('empno, jobcode, effdate, salary, deptcode, record_status, stamp')
    .eq('empno', empNo)
    .order('effdate', { ascending: false });
  if (userType === 'USER') query = query.eq('record_status', 'ACTIVE');
  const { data, error } = await query;
  return { data, error };
}

export async function addJobHistory(rowData, userId) {
  const stamp = makeStamp('CREATED', userId);
  const { data, error } = await supabase
    .from('jobhistory')
    .insert([{ ...rowData, record_status: 'ACTIVE', stamp }]);
  return { data, error };
}

export async function updateJobHistory(empNo, jobCode, effDate, updates, userId) {
  const stamp = makeStamp('UPDATED', userId);
  const { data, error } = await supabase
    .from('jobhistory')
    .update({ ...updates, stamp })
    .eq('empno', empNo)
    .eq('jobcode', jobCode)
    .eq('effdate', effDate);
  return { data, error };
}

export async function softDeleteJobHistory(empNo, jobCode, effDate, userId) {
  const stamp = makeStamp('DEACTIVATED', userId);
  const { error } = await supabase
    .from('jobhistory')
    .update({ record_status: 'INACTIVE', stamp })
    .eq('empno', empNo)
    .eq('jobcode', jobCode)
    .eq('effdate', effDate);
  return { error };
}

export async function recoverJobHistory(empNo, jobCode, effDate, userId) {
  const stamp = makeStamp('REACTIVATED', userId);
  const { error } = await supabase
    .from('jobhistory')
    .update({ record_status: 'ACTIVE', stamp })
    .eq('empno', empNo)
    .eq('jobcode', jobCode)
    .eq('effdate', effDate);
  return { error };
}
