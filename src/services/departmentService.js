import { supabase } from '../lib/supabaseClient';

function makeStamp(action, userId) {
  return `${action} by ${userId} at ${new Date().toISOString()}`;
}

export async function getDepts(userType) {
  let query = supabase
    .from('department')
    .select('deptcode, deptname, record_status, stamp')
    .order('deptcode');
  if (userType === 'USER') query = query.eq('record_status', 'ACTIVE');
  const { data, error } = await query;
  return { data, error };
}

export async function addDept(deptData, userId) {
  const stamp = makeStamp('CREATED', userId);
  const { data, error } = await supabase
    .from('department')
    .insert([{ ...deptData, record_status: 'ACTIVE', stamp }]);
  return { data, error };
}

export async function updateDept(deptCode, updates, userId) {
  const stamp = makeStamp('UPDATED', userId);
  const { data, error } = await supabase
    .from('department')
    .update({ ...updates, stamp })
    .eq('deptcode', deptCode);
  return { data, error };
}

export async function softDeleteDept(deptCode, userId) {
  const stamp = makeStamp('DEACTIVATED', userId);
  const { error } = await supabase
    .from('department')
    .update({ record_status: 'INACTIVE', stamp })
    .eq('deptcode', deptCode);
  return { error };
}

export async function recoverDept(deptCode, userId) {
  const stamp = makeStamp('REACTIVATED', userId);
  const { error } = await supabase
    .from('department')
    .update({ record_status: 'ACTIVE', stamp })
    .eq('deptcode', deptCode);
  return { error };
}
