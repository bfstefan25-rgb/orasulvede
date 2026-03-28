import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { Link, useNavigate } from 'react-router-dom'
import {
  MapPin, CheckCircle, Trophy, TrendingUp,
  LogOut, Clock, ChevronRight, User
} from 'lucide-react'

const STATUS_COLORS = {
  raportat:      'bg-blue-100 text-blue-700',
  in_verificare: 'bg-yellow-100 text-yellow-700',
  in_lucru:      'bg-orange-100 text-orange-700',
  rezolvat:      'bg-green-100 text-green-700',
  respins:       'bg-red-100 text-red-700',
}

const STATUS_LABELS = {
  raportat:      'Raportat',
  in_verificare: 'În verificare',
  in_lucru:      'În lucru',
  rezolvat:      'Rezolvat',
  respins:       'Respins',
}

const BADGES_CONFIG = [
  {
    id: 'first_report',
    icon: '🏆',
    title: 'Primul raport',
    desc: 'Ai trimis primul tău raport',
    check: (stats) => stats.reports_count >= 1,
  },
  {
    id: 'active',
    icon: '⭐',
    title: 'Contributor Activ',
    desc: 'Ai trimis peste 5 rapoarte',
    check: (stats) => stats.reports_count >= 5,
  },
  {
    id: 'hero',
    icon: '🦸',
    title: 'Erou Local',
    desc: 'Ai ajutat la rezolvarea a 3 probleme',
    check: (stats) => stats.resolved_count >= 3,
  },
  {
    id: 'explorer',
    icon: '🧭',
    title: 'Explorator Urban',
    desc: 'Ai trimis peste 10 rapoarte',
    check: (stats) => stats.reports_count >= 10,
  },
  {
    id: 'guardian',
    icon: '🛡️',
    title: 'Gardianul Cartierului',
    desc: 'Ai acumulat peste 100 de puncte',
    check: (stats) => stats.points >= 100,
  },
]

function timeAgo(date) {
  const days = Math.floor((Date.now() - new Date(date)) / 86400000)
  if (days === 0) return 'azi'
  if (days === 1) return 'ieri'
  return `${days} zile în urmă`
}

export default function Profile() {
  const navigate = useNavigate()

  const [authUser,  setAuthUser]  = useState(null)
  const [profile,   setProfile]   = useState(null)
  const [myReports, setMyReports] = useState([])
  const [myRank,    setMyRank]    = useState(null)
  const [loading,   setLoading]   = useState(true)

  useEffect(() => {
    fetchAll()
  }, [])

  async function fetchAll() {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    setAuthUser(user)
    if (!user) { setLoading(false); return }

    // Profile
    const { data: prof } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()
    setProfile(prof)

    // My reports
    const { data: reports } = await supabase
      .from('reports')
      .select('id, title, category, status, created_at, image_url, address')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
    setMyReports(reports || [])

    // My rank
    if (prof?.points !== undefined) {
      const { count } = await supabase
        .from('profiles')
        .select('id', { count: 'exact', head: true })
        .gt('points', prof.points)
      setMyRank((count || 0) + 1)
    }

    setLoading(false)
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    navigate('/')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!authUser) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-10 max-w-md w-full text-center">
          <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <User size={36} className="text-blue-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Contul tău</h2>
          <p className="text-gray-400 mb-8">Autentifică-te pentru a-ți vedea profilul și raportările tale.</p>
          <div className="flex gap-3">
            <button onClick={() => navigate('/login')}
              className="flex-1 border-2 border-gray-200 text-gray-700 rounded-xl py-3 font-medium hover:border-blue-300 transition-colors">
              Autentificare
            </button>
            <button onClick={() => navigate('/register')}
              className="flex-1 bg-blue-600 text-white rounded-xl py-3 font-medium hover:bg-blue-700 transition-colors">
              Înregistrare
            </button>
          </div>
        </div>
      </div>
    )
  }

  const name     = profile?.full_name || authUser.user_metadata?.full_name || authUser.email?.split('@')[0] || 'Utilizator'
  const initials = name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  const joinYear = new Date(authUser.created_at).getFullYear()
  const stats    = {
    reports_count:  profile?.reports_count  || myReports.length,
    resolved_count: profile?.resolved_count || myReports.filter(r => r.status === 'rezolvat').length,
    points:         profile?.points         || 0,
  }
  const badges = BADGES_CONFIG.map(b => ({ ...b, earned: b.check(stats) }))
  const earnedBadges = badges.filter(b => b.earned)

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 pb-24 md:pb-6">

      {/* ── Hero header ── */}
      <div className="bg-blue-600 rounded-3xl p-6 mb-6 text-white">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-5">
            {/* Avatar */}
            <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center overflow-hidden flex-shrink-0 border-4 border-white/30">
              {authUser.user_metadata?.avatar_url
                ? <img src={authUser.user_metadata.avatar_url} alt="" className="w-full h-full object-cover" />
                : <span className="text-3xl font-bold text-white">{initials}</span>
              }
            </div>
            {/* Info */}
            <div>
              <h1 className="text-2xl font-bold mb-0.5">{name}</h1>
              <p className="text-blue-200 text-sm mb-3">{authUser.email}</p>
              <div className="flex flex-wrap items-center gap-2">
                <span className="bg-white/20 text-white text-xs px-3 py-1 rounded-full font-medium">
                  Membru activ
                </span>
                <span className="bg-white/20 text-white text-xs px-3 py-1 rounded-full font-medium">
                  📅 Membru din {joinYear}
                </span>
                {/* Earned badge icons */}
                {earnedBadges.slice(0, 5).map(b => (
                  <span key={b.id} title={b.title} className="text-lg">{b.icon}</span>
                ))}
              </div>
            </div>
          </div>
          {/* Actions */}
          <div className="flex gap-2 flex-shrink-0">
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 bg-white/20 hover:bg-white/30 text-white text-sm px-4 py-2 rounded-xl font-medium transition-colors"
            >
              <LogOut size={16} />
              Deconectare
            </button>
          </div>
        </div>
      </div>

      {/* ── Stats grid ── */}
      <div className="grid grid-cols-4 gap-3 mb-6">
        {[
          { icon: MapPin,       label: 'Raportări', value: stats.reports_count,                    color: 'text-blue-600',   bg: 'bg-blue-50'   },
          { icon: CheckCircle,  label: 'Rezolvate',  value: stats.resolved_count,                   color: 'text-green-600',  bg: 'bg-green-50'  },
          { icon: Trophy,       label: 'Puncte',     value: stats.points.toLocaleString('ro-RO'),   color: 'text-yellow-600', bg: 'bg-yellow-50' },
          { icon: TrendingUp,   label: 'Rank',       value: myRank ? `#${myRank}` : '—',            color: 'text-purple-600', bg: 'bg-purple-50' },
        ].map(({ icon: Icon, label, value, color, bg }) => (
          <div key={label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 text-center">
            <div className={`w-10 h-10 ${bg} rounded-xl flex items-center justify-center mx-auto mb-2`}>
              <Icon size={20} className={color} />
            </div>
            <p className={`text-xl font-bold ${color}`}>{value}</p>
            <p className="text-gray-400 text-xs mt-1">{label}</p>
          </div>
        ))}
      </div>

      {/* ── Badges ── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6">
        <div className="flex items-center gap-2 mb-5">
          <span className="text-lg">🏅</span>
          <h2 className="font-bold text-gray-900">Badge-uri obținute</h2>
          <span className="ml-auto text-xs text-gray-400">{earnedBadges.length}/{badges.length} obținute</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {badges.map(badge => (
            <div
              key={badge.id}
              className={`p-4 rounded-2xl border-2 transition-all ${
                badge.earned
                  ? 'border-yellow-200 bg-yellow-50'
                  : 'border-gray-100 bg-gray-50 opacity-40'
              }`}
            >
              <div className="text-3xl mb-2">{badge.icon}</div>
              <p className="font-semibold text-gray-900 text-sm">{badge.title}</p>
              <p className="text-gray-400 text-xs mt-1">{badge.desc}</p>
              {badge.earned && (
                <span className="inline-block mt-2 text-xs text-yellow-700 bg-yellow-100 px-2 py-0.5 rounded-full font-medium">
                  ✓ Obținut
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* ── My Reports ── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <MapPin size={18} className="text-blue-500" />
            <h2 className="font-bold text-gray-900">Raportările mele</h2>
          </div>
          <span className="text-gray-400 text-sm">{myReports.length} raportări</span>
        </div>

        {myReports.length === 0 ? (
          <div className="text-center py-10">
            <MapPin size={36} className="text-gray-200 mx-auto mb-3" />
            <p className="text-gray-400 text-sm mb-4">Nu ai raportat nimic încă</p>
            <Link to="/raporteaza"
              className="inline-block bg-blue-600 text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors">
              Raportează prima problemă
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {myReports.map(report => (
              <Link
                key={report.id}
                to={`/raport/${report.id}`}
                className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl hover:bg-blue-50 transition-colors group"
              >
                {/* Thumbnail */}
                <div className="w-12 h-12 rounded-xl overflow-hidden bg-gray-200 flex-shrink-0">
                  {report.image_url
                    ? <img src={report.image_url} alt="" className="w-full h-full object-cover" />
                    : <div className="w-full h-full flex items-center justify-center text-gray-400 text-xl">
                        📍
                      </div>
                  }
                </div>
                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 text-sm truncate">{report.title}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <Clock size={11} className="text-gray-400 flex-shrink-0" />
                    <span className="text-gray-400 text-xs">{timeAgo(report.created_at)}</span>
                    {report.address && (
                      <>
                        <span className="text-gray-300">•</span>
                        <span className="text-gray-400 text-xs truncate">{report.address}</span>
                      </>
                    )}
                  </div>
                </div>
                {/* Status + arrow */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${STATUS_COLORS[report.status] || 'bg-gray-100 text-gray-600'}`}>
                    {STATUS_LABELS[report.status] || report.status}
                  </span>
                  <ChevronRight size={16} className="text-gray-300 group-hover:text-blue-400 transition-colors" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}