import { useState, useEffect, useRef } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Home, Map, Plus, Trophy, User, Bell } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'

export default function Navbar() {
  const location = useLocation()
  const { user } = useAuth()
  const [notifications, setNotifications] = useState([])
  const [showDropdown, setShowDropdown] = useState(false)
  const dropdownRef = useRef(null)

  const unreadCount = notifications.filter(n => !n.read).length

  useEffect(() => {
    if (!user) return
    fetchNotifications()
    const channel = supabase
      .channel('user-notifications')
      .on('postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'notifications', filter: `user_id=eq.${user.id}` },
        (payload) => setNotifications(prev => [payload.new, ...prev].slice(0, 20))
      )
      .subscribe()
    return () => supabase.removeChannel(channel)
  }, [user])

  async function fetchNotifications() {
    const { data } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(20)
    if (data) setNotifications(data)
  }

  async function markAllRead() {
    const unread = notifications.filter(n => !n.read).map(n => n.id)
    if (!unread.length) return
    await supabase.from('notifications').update({ read: true }).in('id', unread)
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
  }

  useEffect(() => {
    function handler(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  function toggleDropdown() {
    setShowDropdown(v => {
      if (!v) markAllRead()
      return !v
    })
  }

  const links = [
    { to: '/acasa', label: 'Acasă', icon: Home },
    { to: '/harta', label: 'Hartă', icon: Map },
    { to: '/raporteaza', label: 'Raportează', icon: Plus, special: true },
    { to: '/clasament', label: 'Clasament', icon: Trophy },
    { to: '/profil', label: 'Profil', icon: User },
  ]

  const NotificationDropdown = ({ className }) => (
    <div className={`absolute right-0 w-80 bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 z-50 overflow-hidden ${className}`}>
      <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
        <h3 className="font-semibold text-gray-900 dark:text-white text-sm">Notificări</h3>
        {notifications.some(n => !n.read) && (
          <button onClick={markAllRead} className="text-xs text-primary-600 hover:underline">Marchează citite</button>
        )}
      </div>
      <div className="max-h-72 overflow-y-auto divide-y divide-gray-50 dark:divide-gray-700">
        {notifications.length === 0 ? (
          <p className="text-center text-gray-400 dark:text-gray-500 text-sm py-8">Nicio notificare</p>
        ) : (
          notifications.map(n => (
            <div key={n.id} className={`px-4 py-3 ${!n.read ? 'bg-primary-50 dark:bg-blue-900/20' : ''}`}>
              <p className="text-sm text-gray-800 dark:text-gray-200 leading-snug">{n.message}</p>
              <p className="text-xs text-gray-400 mt-1">
                {new Date(n.created_at).toLocaleDateString('ro-RO', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  )

  return (
    <nav className="bg-white dark:bg-gray-900 shadow-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center h-16">

          {/* Logo */}
          <Link to="/acasa" className="flex items-center h-full shrink-0">
            <img
              src="/ovlogo.png"
              alt="OrasulVede logo"
              className="h-14 w-auto"
              style={{ mixBlendMode: 'multiply' }}
            />
          </Link>

          {/* Motto — centered in the gap between logo and nav */}
          <span className="hidden md:block flex-1 text-center text-[10px] font-semibold tracking-widest text-gray-400 dark:text-gray-500 uppercase leading-tight whitespace-nowrap px-4">
            VEZI. RAPORTEAZĂ. SCHIMBĂ
          </span>

          {/* Right side */}
          <div className="flex items-center gap-1 shrink-0">
            {/* Bell — visible on both mobile and desktop */}
            {user && (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={toggleDropdown}
                  className="relative flex items-center justify-center w-9 h-9 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  <Bell size={20} />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center leading-none">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </button>
                {showDropdown && <NotificationDropdown className="top-12" />}
              </div>
            )}

            {/* Desktop nav links */}
            <div className="hidden md:flex items-center gap-1">
              {links.map(({ to, label, icon: Icon, special }) => (
                <Link
                  key={to}
                  to={to}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all
                    ${special
                      ? 'bg-blue-600 text-white hover:bg-blue-700 px-5'
                      : location.pathname === to
                        ? 'bg-blue-50 dark:bg-blue-900/40 text-blue-600'
                        : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                    }`}
                >
                  <Icon size={16} />
                  {label}
                </Link>
              ))}
            </div>
          </div>

        </div>
      </div>

      {/* Mobile bottom nav */}
      <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 flex md:hidden z-50">
        {links.map(({ to, label, icon: Icon, special }) => (
          <Link
            key={to}
            to={to}
            className={`flex-1 flex flex-col items-center justify-center py-2 text-xs
              ${special ? 'text-white' : location.pathname === to ? 'text-blue-600' : 'text-gray-500 dark:text-gray-400'}`}
          >
            <div className={special ? 'bg-blue-600 rounded-full p-3 -mt-5 shadow-lg' : ''}>
              <Icon size={special ? 22 : 20} color={special ? 'white' : undefined} />
            </div>
            {!special && <span className="mt-1">{label}</span>}
          </Link>
        ))}
      </div>
    </nav>
  )
}
