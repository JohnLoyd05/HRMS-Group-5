import { supabase } from '../lib/supabaseClient'

function makeStamp(action, userId) {
  return `${action} by ${userId} at ${new Date().toISOString()}`
}

export async function getUsers() {
  const { data, error } = await supabase
    .from('user')
    .select('id, username, firstname, lastname, user_type, record_status, stamp')
    .order('user_type')
  return { data, error }
}

export async function activateUser(userId, currentUserId) {
  const { data: target } = await supabase
    .from('user')
    .select('user_type')
    .eq('id', userId)
    .single()

  if (target?.user_type === 'SUPERADMIN') {
    return { error: { message: 'Cannot modify a SUPERADMIN account.' } }
  }

  const stamp = makeStamp('ACTIVATED', currentUserId)
  const { error } = await supabase
    .from('user')
    .update({ record_status: 'ACTIVE', stamp })
    .eq('id', userId)
  return { error }
}

export async function deactivateUser(userId, currentUserId) {
  const { data: target } = await supabase
    .from('user')
    .select('user_type')
    .eq('id', userId)
    .single()

  if (target?.user_type === 'SUPERADMIN') {
    return { error: { message: 'Cannot modify a SUPERADMIN account.' } }
  }

  const stamp = makeStamp('DEACTIVATED', currentUserId)
  const { error } = await supabase
    .from('user')
    .update({ record_status: 'INACTIVE', stamp })
    .eq('id', userId)
  return { error }
}
