import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from './AuthContext'

const UserRightsContext = createContext({})

export function UserRightsProvider({ children }) {
  const { currentUser } = useAuth()
  const [rights, setRights] = useState({})
  const [rightsLoading, setRightsLoading] = useState(true)

  useEffect(() => {
    if (!currentUser?.id) {
      setRights({})
      setRightsLoading(false)
      return
    }

    const loadRights = async () => {
      setRightsLoading(true)
      const { data, error } = await supabase
        .from('UserModule_Rights')
        .select('rightCode, right_value')
        .eq('user_id', currentUser.id)

      if (!error && data) {
        const map = {}
        data.forEach(({ rightCode, right_value }) => {
          map[rightCode] = right_value === 1
        })
        setRights(map)
      }
      setRightsLoading(false)
    }

    loadRights()
  }, [currentUser?.id])

  return (
    <UserRightsContext.Provider value={{ rights, rightsLoading }}>
      {children}
    </UserRightsContext.Provider>
  )
}

export const useRights = () => useContext(UserRightsContext)
