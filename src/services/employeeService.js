import { supabase } from '../lib/supabaseClient';

function makeStamp(action, userId) {
  return `${action} by ${userId} at ${new Date().toISOString()}`;
}

export async function getEmployees(userType) {
  let query = supabase
    .from('employee')
    .select('empno, lastname, firstname, gender, birthdate, hiredate, sepdate, record_status, stamp')
    .order('empno');
  if (userType === 'USER') query = query.eq('record_status', 'ACTIVE');
  const { data, error } = await query;
  return { data, error };
}

export async function getNextEmpno() {
  const { data, error } = await supabase
    .from('employee')
    .select('empno')
    .order('empno', { ascending: false })
    .limit(1);
  if (error) return { empno: null, error };
  const max = data?.[0]?.empno ? parseInt(data[0].empno, 10) : 0;
  const next = String(max + 1).padStart(5, '0');
  return { empno: next, error: null };
}

export async function addEmployee(employeeData, userId) {
  const stamp = makeStamp('CREATED', userId);
  const { data, error } = await supabase
    .from('employee')
    .insert([{ ...employeeData, record_status: 'ACTIVE', stamp }]);
  return { data, error };
}

export async function updateEmployee(empno, updates, userId) {
  const stamp = makeStamp('UPDATED', userId);
  const { data, error } = await supabase
    .from('employee')
    .update({ ...updates, stamp })
    .eq('empno', empno);
  return { data, error };
}

export async function softDeleteEmployee(empno, userId) {
  const stamp = makeStamp('DEACTIVATED', userId);
  const { error } = await supabase
    .from('employee')
    .update({ record_status: 'INACTIVE', stamp })
    .eq('empno', empno);
  return { error };
}

export async function recoverEmployee(empno, userId) {
  const stamp = makeStamp('REACTIVATED', userId);
  const { error } = await supabase
    .from('employee')
    .update({ record_status: 'ACTIVE', stamp })
    .eq('empno', empno);
  return { error };
}
