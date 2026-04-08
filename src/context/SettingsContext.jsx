import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

const SettingsContext = createContext({})

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState({
    tema: 'luminos',
    textMare: false,
  })

  useEffect(() => {
    // Load settings when user logs in/out
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        const { data } = await supabase
          .from('profiles')
          .select('settings')
          .eq('id', session.user.id)
          .single()
        if (data?.settings) setSettings(prev => ({ ...prev, ...data.settings }))
      } else {
        setSettings({ tema: 'luminos', textMare: false })
      }
    })
    return () => subscription.unsubscribe()
  }, [])

  // Apply settings to DOM whenever they change
  useEffect(() => {
    const root = document.documentElement

    // Dark mode
    if (settings.tema === 'intunecat') {
      root.classList.add('dark')
    } else if (settings.tema === 'sistem') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      root.classList.toggle('dark', prefersDark)
    } else {
      root.classList.remove('dark')
    }

    // Text size
    if (settings.textMare) {
      root.style.fontSize = '18px'
    } else {
      root.style.fontSize = ''
    }
  }, [settings.tema, settings.textMare])

  return (
    <SettingsContext.Provider value={{ settings, setSettings }}>
      {children}
    </SettingsContext.Provider>
  )
}

export const useSettings = () => useContext(SettingsContext)