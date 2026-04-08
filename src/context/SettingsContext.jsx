import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from './AuthContext'

const SettingsContext = createContext({})

const defaultSettings = {
  theme: 'light',
  largeText: false,
  showLevel: true,
  showBadges: true,
  notifyLeaderboard: true,
  followNeighborhood: false,
  weeklyEmail: false,
}

function applySettings(settings) {
  if (settings.theme === 'dark') {
    document.documentElement.classList.add('dark')
  } else {
    document.documentElement.classList.remove('dark')
  }
  document.documentElement.style.fontSize = settings.largeText ? '18px' : ''
}

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState(defaultSettings)
  const { user } = useAuth()

  useEffect(() => {
    if (!user) {
      setSettings(defaultSettings)
      applySettings(defaultSettings)
      return
    }
    // Fetch settings from DB when user is available
    supabase
      .from('profiles')
      .select('settings')
      .eq('id', user.id)
      .single()
      .then(({ data }) => {
        if (data?.settings) {
          const merged = { ...defaultSettings, ...data.settings }
          setSettings(merged)
          applySettings(merged)
        }
      })
  }, [user])

  return (
    <SettingsContext.Provider value={{ settings, setSettings: (fn) => {
      setSettings(prev => {
        const next = typeof fn === 'function' ? fn(prev) : fn
        applySettings(next)
        return next
      })
    }}}>
      {children}
    </SettingsContext.Provider>
  )
}

export const useSettings = () => useContext(SettingsContext)