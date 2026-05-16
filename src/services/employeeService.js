// src/services/employeeService.js

import { supabase } from '../lib/supabaseClient';

// Helper to build audit stamp string
function makeStamp(action, userId) {
  return `${action} by ${userId} at ${new Date().toISOString()}`;
}

// GET — USER sees ACTIVE only; ADMIN/SUPERADMIN see all
export async function getEmployees(userType) {
  let query = supabase
    .from('employee')
    .select('empno, lastname, firstname, gender, birthdate, hiredate, sepDate, record_status, stamp')
    .order('empno');
  if (userType === 'USER') query = query.eq('record_status', 'ACTIVE');
  const { data, error } = await query;
  return { data, error };
}

// ADD
export async function addEmployee(employeeData, userId) {
  const stamp = makeStamp('CREATED', userId);
  const { data, error } = await supabase
    .from('employee')
    .insert([{ ...employeeData, record_status: 'ACTIVE', stamp }]);
  return { data, error };
}

// EDIT
export async function updateEmployee(empno, updates, userId) {
  const stamp = makeStamp('UPDATED', userId);
  const { data, error } = await supabase
    .from('employee')
    .update({ ...updates, stamp })
    .eq('empno', empno);
  return { data, error };
}

// SOFT DELETE — cascade trigger on DB side handles jobHistory
export async function softDeleteEmployee(empno, userId) {
  const stamp = makeStamp('DEACTIVATED', userId);
  const { error } = await supabase
    .from('employee')
    .update({ record_status: 'INACTIVE', stamp })
    .eq('empno', empno);
  return { error };
}

// RECOVER — cascade trigger restores jobHistory too
export async function recoverEmployee(empno, userId) {
  const stamp = makeStamp('REACTIVATED', userId);
  const { error } = await supabase
    .from('employee')
    .update({ record_status: 'ACTIVE', stamp })
    .eq('empno', empno);
  return { error };
}