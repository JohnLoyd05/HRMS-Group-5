import { supabase } from '../lib/supabaseClient';

function makeStamp(action, userId) {
  return `${action} by ${userId} at ${new Date().toISOString()}`;
}

export async function getJobs(userType) {
  let query = supabase
    .from('job')
    .select('jobcode, jobdesc, record_status, stamp')
    .order('jobcode');
  if (userType === 'USER') query = query.eq('record_status', 'ACTIVE');
  const { data, error } = await query;
  return { data, error };
}

export async function addJob(jobData, userId) {
  const stamp = makeStamp('CREATED', userId);
  const { data, error } = await supabase
    .from('job')
    .insert([{ ...jobData, record_status: 'ACTIVE', stamp }]);
  return { data, error };
}

export async function updateJob(jobCode, updates, userId) {
  const stamp = makeStamp('UPDATED', userId);
  const { data, error } = await supabase
    .from('job')
    .update({ ...updates, stamp })
    .eq('jobcode', jobCode);
  return { data, error };
}

export async function softDeleteJob(jobCode, userId) {
  const stamp = makeStamp('DEACTIVATED', userId);
  const { error } = await supabase
    .from('job')
    .update({ record_status: 'INACTIVE', stamp })
    .eq('jobcode', jobCode);
  return { error };
}

export async function recoverJob(jobCode, userId) {
  const stamp = makeStamp('REACTIVATED', userId);
  const { error } = await supabase
    .from('job')
    .update({ record_status: 'ACTIVE', stamp })
    .eq('jobcode', jobCode);
  return { error };
}
