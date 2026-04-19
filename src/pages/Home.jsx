import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { ChevronUp, MessageSquare, MapPin, Clock, TrendingUp, FileText, Wrench, CheckCircle2, Plus, ArrowRight, Search, X, Navigation } from 'lucide-react'
import { useSEO } from '../hooks/useSEO'
import Onboarding from '../components/Onboarding'

const PAGE_SIZE = 10

const CATEGORIES = ['Toate', 'Infrastructură', 'Iluminat', 'Trafic', 'Canalizare', 'Parcuri', 'Gunoi', 'Animale', 'Alte pericole']

const CATEGORY_BORDER = {
  'Infrastructură': 'border-l-orange-400',
  'Iluminat':       'border-l-yellow-400',
  'Trafic':         'border-l-red-400',
  'Canalizare':       'border-l-purple-400',
  'Parcuri':        'border-l-green-400',
  'Gunoi':          'border-l-gray-400',
  'Animale':        'border-l-blue-400',
  'Alte pericole':  'border-l-rose-400',
}

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
  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch]           = useState('')
  const [page, setPage]               = useState(0)
  const [hasMore, setHasMore]         = useState(false)
  const [loadingMore, setLoadingMore] = useState(false)
  const [nearMe, setNearMe]           = useState(false)
  const [userLocation, setUserLocation] = useState(null)
  const [locating, setLocating]       = useState(false)
  const [showOnboarding, setShowOnboarding] = useState(false)

  useSEO({ title: 'Acasă', description: 'Vezi și raportează problemele din orașul tău. Urmărește progresul și contribuie la o comunitate mai bună.' })

  // Show onboarding for first-time logged-in users (keyed by user ID)
  useEffect(() => {
    if (user && !localStorage.getItem(`onboarding_done_${user.id}`)) {
      setShowOnboarding(true)
    }
  }, [user])

  // Debounce search input
  useEffect(() => {
    const t = setTimeout(() => setSearch(searchInput), 400)
    return () => clearTimeout(t)
  }, [searchInput])

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
    setPage(0)
    let query = supabase
      .from('reports')
      .select('id, title, description, category, status, address, latitude, longitude, created_at, votes_count, comments_count, image_url, user_id')

    if (activeCategory !== 'Toate') query = query.eq('category', activeCategory)
    if (search.trim()) query = query.ilike('title', `%${search.trim()}%`)
    if (tab === 'recente')   query = query.order('created_at', { ascending: false })
    if (tab === 'populare')  query = query.order('votes_count', { ascending: false })

    query = query.range(0, PAGE_SIZE - 1)
    const { data, error } = await query
    if (!error && data) {
      setReports(data)
      setHasMore(data.length === PAGE_SIZE)
    }
    setLoading(false)
  }, [tab, activeCategory, search])

  useEffect(() => { fetchReports() }, [fetchReports])

  async function loadMore() {
    setLoadingMore(true)
    const nextPage = page + 1
    let query = supabase
      .from('reports')
      .select('id, title, description, category, status, address, latitude, longitude, created_at, votes_count, comments_count, image_url, user_id')
    if (activeCategory !== 'Toate') query = query.eq('category', activeCategory)
    if (search.trim()) query = query.ilike('title', `%${search.trim()}%`)
    if (tab === 'recente')   query = query.order('created_at', { ascending: false })
    if (tab === 'populare')  query = query.order('votes_count', { ascending: false })
    query = query.range(nextPage * PAGE_SIZE, (nextPage + 1) * PAGE_SIZE - 1)
    const { data, error } = await query
    if (!error && data) {
      setReports(prev => [...prev, ...data])
      setHasMore(data.length === PAGE_SIZE)
      setPage(nextPage)
    }
    setLoadingMore(false)
  }

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

  function haversine(lat1, lng1, lat2, lng2) {
    const R = 6371
    const dLat = (lat2 - lat1) * Math.PI / 180
    const dLng = (lng2 - lng1) * Math.PI / 180
    const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng / 2) ** 2
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  }

  function toggleNearMe() {
    if (nearMe) { setNearMe(false); return }
    setLocating(true)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude })
        setNearMe(true)
        setLocating(false)
      },
      () => { alert('Nu am putut accesa locația ta.'); setLocating(false) }
    )
  }

  const displayedReports = nearMe && userLocation
    ? reports
        .filter(r => r.latitude && r.longitude && haversine(userLocation.lat, userLocation.lng, r.latitude, r.longitude) <= 5)
        .sort((a, b) => haversine(userLocation.lat, userLocation.lng, a.latitude, a.longitude) - haversine(userLocation.lat, userLocation.lng, b.latitude, b.longitude))
    : reports

  const firstName = profile?.full_name?.split(' ')[0] || user?.user_metadata?.full_name?.split(' ')[0] || user?.user_metadata?.name?.split(' ')[0] || 'Cetățean'

  const LEVELS = [
    { level:1, name:'Observator', min:0 }, { level:2, name:'Cetățean Activ', min:5 },
    { level:3, name:'Voluntar Civic', min:15 }, { level:4, name:'Reporter Urban', min:30 },
    { level:5, name:'Gardian Comunitar', min:50 }, { level:6, name:'Vocea Cartierului', min:75 },
    { level:7, name:'Erou Local', min:110 }, { level:8, name:'Campion Civic', min:150 },
    { level:9, name:'Ambasador Urban', min:200 }, { level:10, name:'Legenda Orașului', min:300 },
  ]
  const rc = profile?.reports_count || 0
  let curLevel = LEVELS[0]
  for (const l of LEVELS) { if (rc >= l.min) curLevel = l }
  const nextLevel = LEVELS.find(l => l.level === curLevel.level + 1)
  const levelProgress = nextLevel ? Math.round(((rc - curLevel.min) / (nextLevel.min - curLevel.min)) * 100) : 100

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pb-24">

      {showOnboarding && <Onboarding onDone={() => setShowOnboarding(false)} userId={user?.id} />}

      {/* Hero header */}
      <div className="relative overflow-hidden" style={{ background: 'linear-gradient(160deg, #1e3a5f 0%, #1d4ed8 55%, #60a5fa 100%)' }}>
        <svg viewBox="0 0 800 80" preserveAspectRatio="xMidYMax meet" className="absolute bottom-0 left-0 w-full pointer-events-none" xmlns="http://www.w3.org/2000/svg">
          <g fill="rgba(255,255,255,0.06)">
            <rect x="0" y="40" width="50" height="40"/><rect x="8" y="25" width="18" height="15"/>
            <rect x="60" y="30" width="45" height="50"/><rect x="72" y="18" width="12" height="12"/>
            <rect x="115" y="38" width="38" height="42"/><rect x="163" y="22" width="50" height="58"/>
            <rect x="172" y="10" width="10" height="12"/><rect x="223" y="42" width="32" height="38"/>
            <rect x="265" y="28" width="55" height="52"/><rect x="330" y="35" width="42" height="45"/>
            <rect x="382" y="25" width="50" height="55"/><rect x="392" y="12" width="11" height="13"/>
            <rect x="442" y="40" width="36" height="40"/><rect x="488" y="22" width="55" height="58"/>
            <rect x="498" y="10" width="10" height="12"/><rect x="553" y="33" width="44" height="47"/>
            <rect x="607" y="38" width="36" height="42"/><rect x="653" y="20" width="50" height="60"/>
            <rect x="663" y="8" width="11" height="12"/><rect x="713" y="42" width="42" height="38"/>
            <rect x="765" y="35" width="35" height="45"/>
          </g>
          <g fill="rgba(255,255,255,0.12)">
            <rect x="0" y="50" width="40" height="30"/><rect x="45" y="42" width="30" height="38"/>
            <rect x="50" y="30" width="9" height="12"/><rect x="85" y="48" width="45" height="32"/>
            <rect x="98" y="35" width="10" height="13"/><rect x="140" y="40" width="36" height="40"/>
            <rect x="186" y="32" width="50" height="48"/><rect x="196" y="20" width="9" height="12"/>
            <rect x="246" y="46" width="28" height="34"/><rect x="284" y="36" width="46" height="44"/>
            <rect x="340" y="42" width="36" height="38"/><rect x="386" y="34" width="46" height="46"/>
            <rect x="396" y="22" width="10" height="12"/><rect x="442" y="48" width="32" height="32"/>
            <rect x="484" y="30" width="50" height="50"/><rect x="494" y="18" width="10" height="12"/>
            <rect x="544" y="40" width="42" height="40"/><rect x="596" y="44" width="34" height="36"/>
            <rect x="640" y="32" width="46" height="48"/><rect x="650" y="20" width="10" height="12"/>
            <rect x="696" y="48" width="44" height="32"/><rect x="750" y="42" width="50" height="38"/>
          </g>
        </svg>

        <div className="relative max-w-4xl mx-auto px-4 md:px-8 pt-6 pb-8">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-blue-200 text-xs font-medium uppercase tracking-wider mb-1">Bun venit înapoi</p>
              <h1 className="text-2xl md:text-3xl font-bold text-white leading-tight">
                Salut, {firstName} 👋
              </h1>
              <p className="text-blue-200 text-sm mt-1">Ce se întâmplă în orașul tău</p>
            </div>
            {profile && (
              <div className="flex-shrink-0 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl px-4 py-3 text-right">
                <p className="text-white font-bold text-lg leading-none">{profile.points ?? 0}</p>
                <p className="text-blue-200 text-xs mt-0.5">puncte</p>
                <p className="text-blue-100 text-xs font-medium mt-1">Niv. {curLevel.level} · {curLevel.name}</p>
              </div>
            )}
          </div>

          {/* Level progress bar */}
          {profile && nextLevel && (
            <div className="mt-4 mb-1">
              <div className="flex justify-between text-xs text-blue-200 mb-1">
                <span>{rc} raportări</span>
                <span>{nextLevel.min} pentru {nextLevel.name}</span>
              </div>
              <div className="h-1.5 bg-white/20 rounded-full overflow-hidden">
                <div className="h-full bg-white rounded-full transition-all" style={{ width: `${levelProgress}%` }} />
              </div>
            </div>
          )}

          <button
            onClick={() => navigate('/raporteaza')}
            className="mt-5 h-12 bg-white text-primary-700 font-bold px-6 rounded-xl text-sm flex items-center gap-2 hover:bg-blue-50 transition-colors shadow-lg w-full md:w-auto justify-center md:justify-start"
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
            { icon: FileText,    label: 'Total',     value: stats.total,     iconBg: 'bg-blue-50 dark:bg-blue-900/30',   iconColor: 'text-blue-500' },
            { icon: Wrench,      label: 'În lucru',  value: stats.inLucru,   iconBg: 'bg-orange-50 dark:bg-orange-900/30', iconColor: 'text-orange-500' },
            { icon: CheckCircle2,label: 'Rezolvate', value: stats.rezolvate, iconBg: 'bg-green-50 dark:bg-green-900/30',  iconColor: 'text-green-500' },
            { icon: Clock,       label: 'Azi',       value: stats.azi,       iconBg: 'bg-purple-50 dark:bg-purple-900/30', iconColor: 'text-purple-500' },
          ].map(s => (
            <div key={s.label} className="bg-white dark:bg-gray-800 rounded-xl p-3 md:p-4 border border-gray-200 dark:border-gray-700">
              <div className={`w-8 h-8 ${s.iconBg} rounded-lg flex items-center justify-center mb-2`}>
                <s.icon size={15} className={s.iconColor} strokeWidth={2} />
              </div>
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
        <div className="flex items-center justify-between mb-4 gap-2">
          <h2 className="text-sm font-semibold text-gray-900 dark:text-white">Rapoarte</h2>
          <div className="flex items-center gap-2">
            <button
              onClick={toggleNearMe}
              disabled={locating}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                nearMe
                  ? 'bg-primary-600 text-white border-primary-600'
                  : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:border-primary-400'
              }`}
            >
              <Navigation size={12} className={locating ? 'animate-spin' : ''} />
              {locating ? 'Se localizează...' : 'Lângă mine'}
            </button>
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
        </div>

        {/* Search bar */}
        <div className="relative mb-3">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          <input
            type="text"
            value={searchInput}
            onChange={e => setSearchInput(e.target.value)}
            placeholder="Caută după titlu..."
            className="w-full h-11 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl pl-9 pr-9 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-900 dark:text-white placeholder:text-gray-400"
          />
          {searchInput && (
            <button onClick={() => setSearchInput('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
              <X size={15} />
            </button>
          )}
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
        ) : displayedReports.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mx-auto mb-3">
              <FileText size={20} className="text-gray-400" />
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
              {nearMe ? 'Nicio problemă raportată în raza de 5 km' : 'Nicio problemă raportată încă'}
            </p>
            <button
              onClick={() => navigate('/raporteaza')}
              className="mt-4 bg-primary-600 text-white h-10 px-5 rounded-xl text-sm font-medium hover:bg-primary-700 transition-colors inline-flex items-center gap-1.5"
            >
              Fii primul care raportează
              <ArrowRight size={14} />
            </button>
          </div>
        ) : (
          <>
          <div className="space-y-3">
            {displayedReports.map(report => {
              const sc = STATUS_CONFIG[report.status] || STATUS_CONFIG.raportat
              const voted = !!userVotes[report.id]
              const dist = nearMe && userLocation && report.latitude && report.longitude
                ? haversine(userLocation.lat, userLocation.lng, report.latitude, report.longitude)
                : null

              return (
                <div
                  key={report.id}
                  onClick={() => navigate(`/raport/${report.id}`)}
                  className={`bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 border-l-4 ${CATEGORY_BORDER[report.category] || 'border-l-gray-300'} overflow-hidden cursor-pointer hover:shadow-md transition-all active:bg-gray-50 dark:active:bg-gray-750`}
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
                        {dist !== null && (
                          <span className="text-xs text-primary-600 dark:text-primary-400 flex items-center gap-1 font-medium">
                            <Navigation size={11} />
                            {dist < 1 ? `${Math.round(dist * 1000)}m` : `${dist.toFixed(1)}km`}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Thumbnail */}
                    <div className="w-20 h-20 md:w-24 md:h-24 rounded-xl overflow-hidden flex-shrink-0 bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                      {report.image_url
                        ? <img src={report.image_url} alt="" className="w-full h-full object-cover" />
                        : <MapPin size={22} className="text-gray-300 dark:text-gray-500" />
                      }
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
          {hasMore && (
            <button
              onClick={loadMore}
              disabled={loadingMore}
              className="w-full mt-4 h-11 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-800 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {loadingMore
                ? <><div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" /> Se încarcă...</>
                : 'Încarcă mai multe'
              }
            </button>
          )}
          </>
        )}
      </div>
    </div>
  )
}
