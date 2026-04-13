import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import { useAuth } from '../context/AuthContext'

const CATEGORIES = ['Toate', 'Infrastructură', 'Iluminat', 'Trafic', 'Trotuare', 'Parcuri', 'Gunoi', 'Animale', 'Alte pericole']

const STATUS_CONFIG = {
  raportat:      { label: 'Raportat',      bg: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300' },
  in_verificare: { label: 'În verificare', bg: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300' },
  in_lucru:      { label: 'În lucru',      bg: 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300' },
  rezolvat:      { label: 'Rezolvat',      bg: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300' },
  respins:       { label: 'Respins',       bg: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300' },
}

const CATEGORY_COLORS = {
  'Infrastructură': 'border-orange-400',
  'Iluminat':       'border-yellow-400',
  'Trafic':         'border-red-400',
  'Trotuare':       'border-purple-400',
  'Parcuri':        'border-green-400',
  'Gunoi':          'border-gray-400',
  'Animale':        'border-pink-400',
  'Alte pericole':  'border-rose-400',
}

function timeAgo(dateStr) {
  const diff = Math.floor((Date.now() - new Date(dateStr)) / 1000)
  if (diff < 60)    return 'acum câteva secunde'
  if (diff < 3600)  return `acum ${Math.floor(diff / 60)} min`
  if (diff < 86400) return `acum ${Math.floor(diff / 3600)}h`
  const days = Math.floor(diff / 86400)
  return days === 1 ? 'ieri' : `acum ${days} zile`
}

export default function Home() {
  const { user } = useAuth()
  const navigate = useNavigate()

  const [reports, setReports]         = useState([])
  const [loading, setLoading]         = useState(true)
  const [tab, setTab]                 = useState('recente')
  const [activeCategory, setCategory] = useState('Toate')
  const [stats, setStats]             = useState({ total: 0, inLucru: 0, rezolvate: 0, azi: 0 })
  const [profile, setProfile]         = useState(null)
  const [userVotes, setUserVotes]     = useState({})
  const [trending, setTrending]       = useState([])

  // ── fetch profile ────────────────────────────────────────────────
  useEffect(() => {
    if (!user) return
    supabase
      .from('profiles')
      .select('full_name, points, level, reports_count, resolved_count')
      .eq('id', user.id)
      .single()
      .then(({ data }) => { if (data) setProfile(data) })
  }, [user])

  // ── fetch stats ──────────────────────────────────────────────────
  useEffect(() => {
    async function fetchStats() {
      const today = new Date(); today.setHours(0,0,0,0)
      const [total, inLucru, rezolvate, azi] = await Promise.all([
        supabase.from('reports').select('id', { count: 'exact', head: true }),
        supabase.from('reports').select('id', { count: 'exact', head: true }).eq('status', 'in_lucru'),
        supabase.from('reports').select('id', { count: 'exact', head: true }).eq('status', 'rezolvat'),
        supabase.from('reports').select('id', { count: 'exact', head: true }).gte('created_at', today.toISOString()),
      ])
      setStats({
        total:    total.count    ?? 0,
        inLucru:  inLucru.count  ?? 0,
        rezolvate:rezolvate.count?? 0,
        azi:      azi.count      ?? 0,
      })
    }
    fetchStats()
  }, [])

  // ── fetch reports ────────────────────────────────────────────────
  const fetchReports = useCallback(async () => {
    setLoading(true)
    let query = supabase
      .from('reports')
      .select('id, title, description, category, status, address, latitude, longitude, created_at, votes_count, comments_count, image_url, user_id')

    if (activeCategory !== 'Toate') query = query.eq('category', activeCategory)
    if (tab === 'recente')   query = query.order('created_at', { ascending: false })
    if (tab === 'populare')  query = query.order('votes_count', { ascending: false })

    query = query.limit(20)
    const { data, error } = await query
    if (!error && data) setReports(data)
    setLoading(false)
  }, [tab, activeCategory])

  useEffect(() => { fetchReports() }, [fetchReports])

  // ── fetch trending (top voted last 7 days) ───────────────────────
  useEffect(() => {
    const week = new Date(Date.now() - 7 * 86400 * 1000).toISOString()
    supabase
      .from('reports')
      .select('id, title, category, votes_count, image_url, status')
      .gte('created_at', week)
      .order('votes_count', { ascending: false })
      .limit(5)
      .then(({ data }) => { if (data) setTrending(data) })
  }, [])

  // ── fetch user votes ─────────────────────────────────────────────
  useEffect(() => {
    if (!user) return
    supabase
      .from('votes')
      .select('report_id')
      .eq('user_id', user.id)
      .then(({ data }) => {
        if (data) {
          const map = {}
          data.forEach(v => { map[v.report_id] = true })
          setUserVotes(map)
        }
      })
  }, [user])

  // ── vote handler ─────────────────────────────────────────────────
  async function handleVote(e, reportId) {
    e.stopPropagation()
    if (!user) { navigate('/login'); return }
    const voted = userVotes[reportId]
    if (voted) {
      await supabase.from('votes').delete().eq('report_id', reportId).eq('user_id', user.id)
      setUserVotes(prev => { const n = {...prev}; delete n[reportId]; return n })
      setReports(prev => prev.map(r => r.id === reportId ? { ...r, votes_count: Math.max(0, (r.votes_count||0) - 1) } : r))
    } else {
      await supabase.from('votes').insert({ report_id: reportId, user_id: user.id })
      setUserVotes(prev => ({ ...prev, [reportId]: true }))
      setReports(prev => prev.map(r => r.id === reportId ? { ...r, votes_count: (r.votes_count||0) + 1 } : r))
    }
  }

  // ── helpers ──────────────────────────────────────────────────────
  const firstName = profile?.full_name?.split(' ')[0] || user?.email?.split('@')[0] || 'Cetățean'
  const levelColors = ['bg-gray-400','bg-green-500','bg-blue-500','bg-purple-500','bg-yellow-500','bg-red-500']
  const lvl = Math.min((profile?.level ?? 1) - 1, levelColors.length - 1)

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pb-24">

      {/* ── HERO BANNER ─────────────────────────────────────────── */}
      <div className="bg-gradient-to-br from-blue-600 via-blue-500 to-indigo-600 dark:from-blue-800 dark:via-blue-700 dark:to-indigo-800 px-4 pt-8 pb-12">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <p className="text-blue-100 text-sm font-medium uppercase tracking-widest mb-1">Bun venit înapoi</p>
              <h1 className="text-white text-3xl font-extrabold leading-tight">
                Salut, {firstName}! 👋
              </h1>
              <p className="text-blue-100 mt-1 text-sm">
                Ajută-ți orașul — raportează o problemă acum
              </p>
            </div>

            {/* Level badge */}
            {profile && (
              <div className="bg-white/20 backdrop-blur rounded-2xl px-5 py-3 text-white text-center min-w-[120px]">
                <div className={`w-8 h-8 rounded-full ${levelColors[lvl]} mx-auto mb-1 flex items-center justify-center font-bold text-sm`}>
                  {profile.level ?? 1}
                </div>
                <p className="font-bold text-lg leading-none">{profile.points ?? 0}</p>
                <p className="text-xs text-blue-100">puncte</p>
              </div>
            )}
          </div>

          {/* CTA button */}
          <button
            onClick={() => navigate('/raporteaza')}
            className="mt-6 bg-white text-blue-600 font-bold px-6 py-3 rounded-full shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all text-sm flex items-center gap-2"
          >
            <span className="text-lg">📍</span> Raportează o problemă
          </button>
        </div>
      </div>

      {/* ── STATS CARDS ─────────────────────────────────────────── */}
      <div className="max-w-4xl mx-auto px-4 -mt-6">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { icon: '📋', label: 'Total rapoarte', value: stats.total,    color: 'text-blue-600  dark:text-blue-400'  },
            { icon: '🔧', label: 'În lucru',       value: stats.inLucru,  color: 'text-orange-500 dark:text-orange-400' },
            { icon: '✅', label: 'Rezolvate',      value: stats.rezolvate,color: 'text-green-600 dark:text-green-400'  },
            { icon: '🆕', label: 'Azi',            value: stats.azi,      color: 'text-purple-600 dark:text-purple-400' },
          ].map(s => (
            <div key={s.label} className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-4 flex flex-col items-start gap-1 border border-gray-100 dark:border-gray-700">
              <span className="text-2xl">{s.icon}</span>
              <span className={`text-2xl font-extrabold ${s.color}`}>{s.value}</span>
              <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">{s.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── TRENDING ────────────────────────────────────────────── */}
      {trending.length > 0 && (
        <div className="max-w-4xl mx-auto px-4 mt-8">
          <h2 className="text-base font-bold text-gray-800 dark:text-gray-100 mb-3 flex items-center gap-2">
            🔥 <span>Trending săptămâna aceasta</span>
          </h2>
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
            {trending.map(r => {
              const sc = STATUS_CONFIG[r.status] || STATUS_CONFIG.raportat
              return (
                <button
                  key={r.id}
                  onClick={() => navigate(`/raport/${r.id}`)}
                  className="flex-shrink-0 w-44 bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-sm border border-gray-100 dark:border-gray-700 text-left hover:shadow-md transition-shadow"
                >
                  {r.image_url ? (
                    <img src={r.image_url} alt={r.title} className="w-full h-24 object-cover" />
                  ) : (
                    <div className="w-full h-24 bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/40 dark:to-indigo-900/40 flex items-center justify-center text-3xl">
                      🏙️
                    </div>
                  )}
                  <div className="p-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${sc.bg}`}>{sc.label}</span>
                    <p className="text-xs font-semibold text-gray-800 dark:text-gray-100 mt-1 line-clamp-2 leading-tight">{r.title}</p>
                    <p className="text-xs text-gray-400 mt-1">👍 {r.votes_count || 0} voturi</p>
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* ── FEED SECTION ────────────────────────────────────────── */}
      <div className="max-w-4xl mx-auto px-4 mt-8">
        {/* Tabs */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-extrabold text-gray-900 dark:text-white">Feed probleme oraș</h2>
          <div className="flex bg-gray-100 dark:bg-gray-800 rounded-full p-1 gap-1">
            {['recente', 'populare'].map(t => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-all capitalize ${
                  tab === t
                    ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                }`}
              >
                {t === 'recente' ? '🕒 Recente' : '🔝 Populare'}
              </button>
            ))}
          </div>
        </div>

        {/* Category chips */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide mb-5">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-semibold border transition-all ${
                activeCategory === cat
                  ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 border-gray-900 dark:border-white'
                  : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:border-gray-400'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Report cards */}
        {loading ? (
          <div className="space-y-4">
            {[1,2,3].map(i => (
              <div key={i} className="bg-white dark:bg-gray-800 rounded-2xl p-4 animate-pulse h-32 border border-gray-100 dark:border-gray-700" />
            ))}
          </div>
        ) : reports.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-5xl mb-3">🏙️</div>
            <p className="text-gray-500 dark:text-gray-400 font-medium">Nicio problemă raportată încă.</p>
            <button
              onClick={() => navigate('/raporteaza')}
              className="mt-4 bg-blue-600 text-white px-6 py-2.5 rounded-full text-sm font-semibold hover:bg-blue-700 transition-colors"
            >
              Fii primul care raportează
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {reports.map(report => {
              const sc = STATUS_CONFIG[report.status] || STATUS_CONFIG.raportat
              const borderColor = CATEGORY_COLORS[report.category] || 'border-blue-400'
              const voted = !!userVotes[report.id]

              return (
                <div
                  key={report.id}
                  onClick={() => navigate(`/raport/${report.id}`)}
                  className={`bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 border-l-4 ${borderColor} flex gap-0 overflow-hidden cursor-pointer hover:shadow-md transition-shadow active:scale-[0.99]`}
                >
                  {/* Text side */}
                  <div className="flex-1 p-4 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-2">
                      <span className={`text-xs px-2.5 py-0.5 rounded-full font-semibold ${sc.bg}`}>
                        {sc.label}
                      </span>
                      <span className="text-xs px-2.5 py-0.5 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 font-medium">
                        {report.category}
                      </span>
                    </div>

                    <h3 className="font-bold text-gray-900 dark:text-white text-sm leading-snug line-clamp-2 mb-1">
                      {report.title}
                    </h3>

                    {report.address && (
                      <p className="text-xs text-gray-400 dark:text-gray-500 flex items-center gap-1 truncate mb-2">
                        <span>📍</span> {report.address}
                      </p>
                    )}

                    <div className="flex items-center gap-3 mt-auto">
                      <button
                        onClick={(e) => handleVote(e, report.id)}
                        className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full transition-all ${
                          voted
                            ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 hover:text-blue-600'
                        }`}
                      >
                        <span>{voted ? '👍' : '👍'}</span>
                        {report.votes_count || 0}
                      </button>

                      <span className="text-xs text-gray-400 dark:text-gray-500 flex items-center gap-1">
                        💬 {report.comments_count || 0}
                      </span>

                      <span className="text-xs text-gray-400 dark:text-gray-500 ml-auto">
                        {timeAgo(report.created_at)}
                      </span>
                    </div>
                  </div>

                  {/* Image side */}
                  {report.image_url && (
                    <div className="w-28 flex-shrink-0">
                      <img
                        src={report.image_url}
                        alt={report.title}
                        className="w-full h-full object-cover"
                        style={{ minHeight: '120px' }}
                      />
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}