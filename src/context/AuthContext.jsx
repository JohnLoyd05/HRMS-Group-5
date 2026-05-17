import { createContext, useContext, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'

const AuthContext = createContext({})

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null)
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()
  // Ref so the effect closure always calls the latest navigate without needing
  // navigate as a dependency (which would tear down the subscription on re-renders).
  const navigateRef = useRef(navigate)
  useEffect(() => { navigateRef.current = navigate }, [navigate])

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
          // Query failed — do not sign out, session still valid
        } else if (userRow?.record_status === 'ACTIVE') {
          setSession(session)
          setCurrentUser({ ...session.user, ...userRow })
        } else if (userRow?.record_status === 'INACTIVE') {
          await supabase.auth.signOut()
          navigateRef.current('/inactive')
        }
      }
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (
          (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'INITIAL_SESSION') &&
          session?.user
        ) {
          const { data: userRow, error } = await supabase
            .from('user')
            .select('record_status, user_type, username')
            .eq('id', session.user.id)
            .single()

          if (error) {
            // Query failed (network/RLS issue) — do not sign out, keep current state
            console.error('onAuthStateChange user query error:', error.message)
            return
          }

          if (userRow?.record_status === 'ACTIVE') {
            setSession(session)
            setCurrentUser({ ...session.user, ...userRow })
          } else if (userRow?.record_status === 'INACTIVE') {
            await supabase.auth.signOut()
            setCurrentUser(null)
            setSession(null)
            navigateRef.current('/inactive')
          }
        } else if (event === 'SIGNED_OUT') {
          setCurrentUser(null)
          setSession(null)
          navigateRef.current('/login')
        }
      }
    )

    return () => subscription.unsubscribe()
  }, []) // empty — runs once; navigate is accessed via ref

  return (
    <AuthContext.Provider value={{ currentUser, session, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)