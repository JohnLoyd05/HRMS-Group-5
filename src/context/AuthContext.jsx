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
  // Tracks when WE sign out an inactive user so SIGNED_OUT doesn't redirect to /login
  const inactiveSignOutRef = useRef(false)

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
        } else if (userRow?.record_status === 'ACTIVE') {
          setSession(session)
          setCurrentUser({ ...session.user, ...userRow })
          // Restore to current page on refresh — only redirect to /employees if on /login
          if (window.location.pathname === '/login' || window.location.pathname === '/') {
            navigateRef.current('/employees')
          }
        } else if (userRow?.record_status === 'INACTIVE') {
          inactiveSignOutRef.current = true
          await supabase.auth.signOut()
          navigateRef.current('/inactive')
        }
      }
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if ((event === 'SIGNED_IN' || event === 'INITIAL_SESSION') && session?.user) {
          // Skip if we already have this user loaded (e.g. token refresh re-fires INITIAL_SESSION)
          if (event === 'INITIAL_SESSION' && currentUser?.id === session.user.id) return

          const { data: userRow, error } = await supabase
            .from('user')
            .select('record_status, user_type, username')
            .eq('id', session.user.id)
            .single()

          if (error || !userRow) {
            // No user row found — trigger didn't fire or user not provisioned yet
            console.error('onAuthStateChange: no user row found', error?.message)
            inactiveSignOutRef.current = true
            await supabase.auth.signOut()
            setCurrentUser(null)
            setSession(null)
            navigateRef.current('/inactive')
            return
          }

          if (userRow?.record_status === 'ACTIVE') {
            setSession(session)
            setCurrentUser({ ...session.user, ...userRow })
            navigateRef.current('/employees')
          } else if (userRow?.record_status === 'INACTIVE') {
            inactiveSignOutRef.current = true
            await supabase.auth.signOut()
            setCurrentUser(null)
            setSession(null)
            navigateRef.current('/inactive')
          }
        } else if (event === 'TOKEN_REFRESHED' && session?.user) {
          setSession(session)
        } else if (event === 'SIGNED_OUT') {
          setCurrentUser(null)
          setSession(null)
          if (inactiveSignOutRef.current) {
            // We triggered this sign-out for an inactive user — stay on /inactive
            inactiveSignOutRef.current = false
          } else {
            navigateRef.current('/login')
          }
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