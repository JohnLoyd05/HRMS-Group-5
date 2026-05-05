import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

const AuthContext = createContext({})

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null)
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setCurrentUser(session?.user ?? null)
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setSession(session)
        setCurrentUser(session?.user ?? null)

        if (_event === 'SIGNED_IN' && session?.user) {
          const { data, error } = await supabase
            .from('employees')
            .select('record_status')
            .eq('auth_id', session.user.id)
            .single()

          if (error || !data || data.record_status !== 'ACTIVE') {
            await supabase.auth.signOut()
            setCurrentUser(null)
            setSession(null)
            alert('Your account is inactive. Please contact your administrator.')
          }
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  return (
    <AuthContext.Provider value={{ currentUser, session, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)