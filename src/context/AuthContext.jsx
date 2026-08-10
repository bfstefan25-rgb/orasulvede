import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

const AuthContext = createContext({})

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [role, setRole] = useState(null)
  const [roleLoading, setRoleLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession()
      .then(({ data: { session } }) => {
        setUser(session?.user ?? null)
        setLoading(false)
      })
      .catch((err) => {
        console.error('Failed to get auth session:', err)
        setLoading(false)
      })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => {
    if (!user) {
      setRole(null)
      setRoleLoading(false)
      return
    }
    setRoleLoading(true)
    supabase.from('profiles').select('role').eq('id', user.id).single()
      .then(({ data, error }) => {
        setRole(error ? null : (data?.role ?? null))
        setRoleLoading(false)
      })
  }, [user])

  return (
    <AuthContext.Provider value={{ user, loading, role, roleLoading }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)