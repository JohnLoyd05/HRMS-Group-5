import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'

export default function InactivePage() {
  const navigate = useNavigate()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    navigate('/login')
  }

  return (
    <div style={{ maxWidth: 400, margin: '100px auto', padding: 24, textAlign: 'center' }}>
      <h1 style={{ color: 'red' }}>Account Inactive</h1>
      <p>Your account is inactive. Please contact your administrator to activate your account.</p>
      <button onClick={handleSignOut} style={{ padding: '10px 20px', marginTop: 16 }}>
        Back to Login
      </button>
    </div>
  )
}