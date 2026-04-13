import { Link, useLocation } from 'react-router-dom'
import { Home, Map, Plus, Trophy, User } from 'lucide-react'

export default function Navbar() {
  const location = useLocation()

  const links = [
    { to: '/acasa', label: 'Acasă', icon: Home },
    { to: '/harta', label: 'Hartă', icon: Map },
    { to: '/raporteaza', label: 'Raportează', icon: Plus, special: true },
    { to: '/clasament', label: 'Clasament', icon: Trophy },
    { to: '/profil', label: 'Profil', icon: User },
  ]

  return (
    <nav className="bg-white dark:bg-gray-900 shadow-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link to="/acasa" className="flex items-center gap-5 h-full">
            <img
              src="/ovlogo.png"
              alt="OrasulVede logo"
              className="h-14 w-auto"
              style={{ mixBlendMode: 'multiply' }}
            />
            <span className="text-[10px] font-semibold tracking-widest text-gray-400 dark:text-gray-500 uppercase leading-tight whitespace-nowrap">
              VEZI. RAPORTEAZĂ. SCHIMBĂ
            </span>
          </Link>

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