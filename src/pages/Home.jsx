import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { ChevronUp, MessageSquare, MapPin, Clock, TrendingUp, FileText, Wrench, CheckCircle2, Plus, ArrowRight } from 'lucide-react'

const CATEGORIES = ['Toate', 'Infrastructură', 'Iluminat', 'Trafic', 'Trotuare', 'Parcuri', 'Gunoi', 'Animale', 'Alte pericole']

const STATUS_CONFIG = {
  raportat:      { label: 'Raportat',      bg: 'bg-primary-50 text-primary-600 dark:bg-primary-700/20 dark:text-primary-100' },
  in_verificare: { label: 'În verificare', bg: 'bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-200' },
  in_lucru:      { label: 'În lucru',      bg: 'bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-200' },
  rezolvat:      { label: 'Rezolvat',      bg: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-200' },
  respins:       { label: 'Respins',       bg: 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300' },
}

function timeAgo(dateStr) {
  const diff = Math.floor((Date.now() - new Date(dateStr)) / 1000)
  if (diff < 60)    return 'acum'
  if (diff < 3600)  return `${Math.floor(diff / 60)} min`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`
  const days = Math.floor(diff / 86400)
  return days === 1 ? 'ieri' : `${days}z`
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

  useEffect(() => {
    if (!user) return
    supabase
      .from('profiles')
      .select('full_name, points, level, reports_count, resolved_count')
      .eq('id', user.id)
      .single()
      .then(({ data }) => { if (data) setProfile(data) })
  }, [user])

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

  const firstName = profile?.full_name?.split(' ')[0] || user?.email?.split('@')[0] || 'Cetățean'

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pb-24">

      {/* Header */}
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-4 pt-6 pb-5 md:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white leading-tight">
                Salut, {firstName}
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                Ce se întâmplă în orașul tău
              </p>
            </div>
            {profile && (
              <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-800 rounded-xl px-3 py-2 flex-shrink-0">
                <div className="w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center text-white text-xs font-bold">
                  {profile.level ?? 1}
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white leading-none">{profile.points ?? 0}</p>
                  <p className="text-xs text-gray-400">puncte</p>
                </div>
              </div>
            )}
          </div>

          <button
            onClick={() => navigate('/raporteaza')}
            className="mt-4 w-full md:w-auto h-12 bg-primary-600 hover:bg-primary-700 text-white font-semibold px-6 rounded-xl transition-colors text-sm flex items-center justify-center md:justify-start gap-2"
          >
            <Plus size={18} strokeWidth={2.5} />
            Raportează o problemă
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="max-w-4xl mx-auto px-4 md:px-8 mt-5">
        <div className="grid grid-cols-4 gap-2 md:gap-3">
          {[
            { icon: FileText, label: 'Total',    value: stats.total },
            { icon: Wrench,   label: 'În lucru', value: stats.inLucru },
            { icon: CheckCircle2, label: 'Rezolvate', value: stats.rezolvate },
            { icon: Clock,    label: 'Azi',       value: stats.azi },
          ].map(s => (
            <div key={s.label} className="bg-white dark:bg-gray-800 rounded-xl p-3 md:p-4 border border-gray-200 dark:border-gray-700">
              <s.icon size={16} className="text-gray-400 dark:text-gray-500 mb-2" strokeWidth={1.8} />
              <p className="text-lg md:text-xl font-bold text-gray-900 dark:text-white leading-none">{s.value}</p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Trending */}
      {trending.length > 0 && (
        <div className="max-w-4xl mx-auto px-4 md:px-8 mt-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-1.5">
              <TrendingUp size={15} strokeWidth={2} />
              Trending
            </h2>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-1 -mx-4 px-4 md:mx-0 md:px-0">
            {trending.map(r => {
              const sc = STATUS_CONFIG[r.status] || STATUS_CONFIG.raportat
              return (
                <button
                  key={r.id}
                  onClick={() => navigate(`/raport/${r.id}`)}
                  className="flex-shrink-0 w-40 md:w-48 bg-white dark:bg-gray-800 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 text-left hover:border-gray-300 dark:hover:border-gray-600 transition-colors"
                >
                  {r.image_url ? (
                    <img src={r.image_url} alt="" className="w-full h-24 object-cover" />
                  ) : (
                    <div className="w-full h-24 bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                      <MapPin size={20} className="text-gray-300 dark:text-gray-500" />
                    </div>
                  )}
                  <div className="p-3">
                    <span className={`text-xs px-2 py-0.5 rounded-md font-medium ${sc.bg}`}>{sc.label}</span>
                    <p className="text-xs font-medium text-gray-800 dark:text-gray-100 mt-1.5 line-clamp-2 leading-snug">{r.title}</p>
                    <p className="text-xs text-gray-400 mt-1.5 flex items-center gap-1">
                      <ChevronUp size={12} /> {r.votes_count || 0}
                    </p>
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* Feed */}
      <div className="max-w-4xl mx-auto px-4 md:px-8 mt-6">
        {/* Tabs */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-gray-900 dark:text-white">Rapoarte</h2>
          <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-0.5">
            {['recente', 'populare'].map(t => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all capitalize ${
                  tab === t
                    ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                    : 'text-gray-500 dark:text-gray-400'
                }`}
              >
                {t === 'recente' ? 'Recente' : 'Populare'}
              </button>
            ))}
          </div>
        </div>

        {/* Category chips */}
        <div className="flex gap-2 overflow-x-auto pb-3 -mx-4 px-4 md:mx-0 md:px-0 mb-2">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`flex-shrink-0 px-3.5 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                activeCategory === cat
                  ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 border-gray-900 dark:border-white'
                  : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Report cards */}
        {loading ? (
          <div className="space-y-3">
            {[1,2,3].map(i => (
              <div key={i} className="bg-white dark:bg-gray-800 rounded-xl p-4 animate-pulse border border-gray-200 dark:border-gray-700">
                <div className="flex gap-3">
                  <div className="flex-1 space-y-2">
                    <div className="h-3 bg-gray-100 dark:bg-gray-700 rounded w-20" />
                    <div className="h-4 bg-gray-100 dark:bg-gray-700 rounded w-3/4" />
                    <div className="h-3 bg-gray-100 dark:bg-gray-700 rounded w-1/2" />
                  </div>
                  <div className="w-20 h-20 bg-gray-100 dark:bg-gray-700 rounded-lg flex-shrink-0" />
                </div>
              </div>
            ))}
          </div>
        ) : reports.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mx-auto mb-3">
              <FileText size={20} className="text-gray-400" />
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Nicio problemă raportată încă</p>
            <button
              onClick={() => navigate('/raporteaza')}
              className="mt-4 bg-primary-600 text-white h-10 px-5 rounded-xl text-sm font-medium hover:bg-primary-700 transition-colors inline-flex items-center gap-1.5"
            >
              Fii primul care raportează
              <ArrowRight size={14} />
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {reports.map(report => {
              const sc = STATUS_CONFIG[report.status] || STATUS_CONFIG.raportat
              const voted = !!userVotes[report.id]

              return (
                <div
                  key={report.id}
                  onClick={() => navigate(`/raport/${report.id}`)}
                  className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden cursor-pointer hover:border-gray-300 dark:hover:border-gray-600 transition-colors active:bg-gray-50 dark:active:bg-gray-750"
                >
                  <div className="flex gap-3 p-4">
                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className={`text-xs px-2 py-0.5 rounded-md font-medium ${sc.bg}`}>
                          {sc.label}
                        </span>
                        <span className="text-xs text-gray-400 dark:text-gray-500">
                          {report.category}
                        </span>
                      </div>

                      <h3 className="font-semibold text-gray-900 dark:text-white text-sm leading-snug line-clamp-2">
                        {report.title}
                      </h3>

                      {report.address && (
                        <p className="text-xs text-gray-400 dark:text-gray-500 flex items-center gap-1 truncate mt-1">
                          <MapPin size={11} strokeWidth={2} />
                          {report.address}
                        </p>
                      )}

                      <div className="flex items-center gap-3 mt-2.5">
                        <button
                          onClick={(e) => handleVote(e, report.id)}
                          className={`flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-lg transition-colors ${
                            voted
                              ? 'bg-primary-50 dark:bg-primary-700/20 text-primary-600 dark:text-primary-100'
                              : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
                          }`}
                        >
                          <ChevronUp size={13} strokeWidth={2.5} />
                          {report.votes_count || 0}
                        </button>

                        <span className="text-xs text-gray-400 dark:text-gray-500 flex items-center gap-1">
                          <MessageSquare size={12} strokeWidth={2} />
                          {report.comments_count || 0}
                        </span>

                        <span className="text-xs text-gray-400 dark:text-gray-500 ml-auto flex items-center gap-1">
                          <Clock size={11} strokeWidth={2} />
                          {timeAgo(report.created_at)}
                        </span>
                      </div>
                    </div>

                    {/* Thumbnail */}
                    {report.image_url && (
                      <div className="w-20 h-20 md:w-24 md:h-24 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100 dark:bg-gray-700">
                        <img
                          src={report.image_url}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
