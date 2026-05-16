import { supabase } from '../lib/supabaseClient';

function makeStamp(action, userId) {
  return `${action} by ${userId} at ${new Date().toISOString()}`;
}

// GET — USER sees ACTIVE only; ADMIN/SUPERADMIN see all
export async function getDepts(userType) {
  let query = supabase
    .from('department')
    .select('deptCode, deptName, record_status, stamp')
    .order('deptCode');
  if (userType === 'USER') query = query.eq('record_status', 'ACTIVE');
  const { data, error } = await query;
  return { data, error };
}

// ADD
export async function addDept(deptData, userId) {
  const stamp = makeStamp('CREATED', userId);
  const { data, error } = await supabase
    .from('department')
    .insert([{ ...deptData, record_status: 'ACTIVE', stamp }]);
  return { data, error };
}

// EDIT
export async function updateDept(deptCode, updates, userId) {
  const stamp = makeStamp('UPDATED', userId);
  const { data, error } = await supabase
    .from('department')
    .update({ ...updates, stamp })
    .eq('deptCode', deptCode);
  return { data, error };
}

// SOFT DELETE
export async function softDeleteDept(deptCode, userId) {
  const stamp = makeStamp('DEACTIVATED', userId);
  const { error } = await supabase
    .from('department')
    .update({ record_status: 'INACTIVE', stamp })
    .eq('deptCode', deptCode);
  return { error };
}

// RECOVER
export async function recoverDept(deptCode, userId) {
  const stamp = makeStamp('REACTIVATED', userId);
  const { error } = await supabase
    .from('department')
    .update({ record_status: 'ACTIVE', stamp })
    .eq('deptCode', deptCode);
  return { error };
}