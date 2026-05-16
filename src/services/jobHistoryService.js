import { supabase } from '../lib/supabaseClient';

function makeStamp(action, userId) {
  return `${action} by ${userId} at ${new Date().toISOString()}`;
}

// GET — USER sees ACTIVE rows only; ADMIN/SUPERADMIN see all
export async function getJobHistory(empNo, userType) {
  let query = supabase
    .from('jobHistory')
    .select('empNo, jobCode, effDate, salary, deptCode, record_status, stamp')
    .eq('empNo', empNo)
    .order('effDate', { ascending: false });
  if (userType === 'USER') query = query.eq('record_status', 'ACTIVE');
  const { data, error } = await query;
  return { data, error };
}

// ADD
export async function addJobHistory(rowData, userId) {
  const stamp = makeStamp('CREATED', userId);
  const { data, error } = await supabase
    .from('jobHistory')
    .insert([{ ...rowData, record_status: 'ACTIVE', stamp }]);
  return { data, error };
}

// EDIT — must use all 3 composite PK fields
export async function updateJobHistory(empNo, jobCode, effDate, updates, userId) {
  const stamp = makeStamp('UPDATED', userId);
  const { data, error } = await supabase
    .from('jobHistory')
    .update({ ...updates, stamp })
    .eq('empNo', empNo)
    .eq('jobCode', jobCode)
    .eq('effDate', effDate);
  return { data, error };
}

// SOFT DELETE
export async function softDeleteJobHistory(empNo, jobCode, effDate, userId) {
  const stamp = makeStamp('DEACTIVATED', userId);
  const { error } = await supabase
    .from('jobHistory')
    .update({ record_status: 'INACTIVE', stamp })
    .eq('empNo', empNo)
    .eq('jobCode', jobCode)
    .eq('effDate', effDate);
  return { error };
}

// RECOVER
export async function recoverJobHistory(empNo, jobCode, effDate, userId) {
  const stamp = makeStamp('REACTIVATED', userId);
  const { error } = await supabase
    .from('jobHistory')
    .update({ record_status: 'ACTIVE', stamp })
    .eq('empNo', empNo)
    .eq('jobCode', jobCode)
    .eq('effDate', effDate);
  return { error };
}