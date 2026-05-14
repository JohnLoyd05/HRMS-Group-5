import { createContext, useContext, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'

const AuthContext = createContext({})

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null)
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        const { data: userRow, error } = await supabase
          .from('user')
          .select('record_status, user_type, username')
          .eq('id', session.user.id)
          .single()

        if (error) {
          console.error('AuthContext getSession user query error:', error.message)
        }

        if (userRow?.record_status === 'ACTIVE') {
          setSession(session)
          setCurrentUser({ ...session.user, ...userRow })
        } else {
          await supabase.auth.signOut()
          navigate('/inactive')
        }
      }
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          const { data: userRow } = await supabase
            .from('user')
            .select('record_status, user_type, username')
            .eq('id', session.user.id)
            .single()

          if (userRow?.record_status === 'ACTIVE') {
            setSession(session)
            setCurrentUser({ ...session.user, ...userRow })
          } else {
            await supabase.auth.signOut()
            setCurrentUser(null)
            setSession(null)
            navigate('/inactive')
          }
        } else if (event === 'SIGNED_OUT') {
          setCurrentUser(null)
          setSession(null)
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [navigate])

  return (
    <AuthContext.Provider value={{ currentUser, session, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)