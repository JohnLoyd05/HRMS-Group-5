import { createContext, useContext, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'

const AuthContext = createContext({})

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null)
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()
  const navigateRef = useRef(navigate)
  useEffect(() => { navigateRef.current = navigate }, [navigate])
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
          if (event === 'INITIAL_SESSION' && currentUser?.id === session.user.id) return

          const { data: userRow, error } = await supabase
            .from('user')
            .select('record_status, user_type, username')
            .eq('id', session.user.id)
            .single()

          if (error || !userRow) {
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
            inactiveSignOutRef.current = false
          } else {
            navigateRef.current('/login')
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
