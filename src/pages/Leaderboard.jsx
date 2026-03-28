import { useEffect, useState } from 'react'
import { Trophy, MapPin, TrendingUp } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'

const CATEGORY_CONFIG = {
  'Infrastructură': '#f97316',
  'Iluminat':       '#eab308',
  'Trafic':         '#ef4444',
  'Trotuare':       '#a855f7',
  'Parcuri':        '#22c55e',
  'Gunoi':          '#6b7280',
  'Animale':        '#3b82f6',
  'Alte pericole':  '#1f2937',
}

const MEDALS = ['🥇', '🥈', '🥉']

const rankStyle = (i) => {
  if (i === 0) return { badge: 'bg-yellow-400',                    card: 'bg-yellow-50 border border-yellow-200' }
  if (i === 1) return { badge: 'bg-gray-400',                      card: 'bg-gray-50 border border-gray-200'     }
  if (i === 2) return { badge: 'bg-orange-400',                    card: 'bg-orange-50 border border-orange-200' }
  return       { badge: 'bg-gray-200 !text-gray-600 text-gray-600', card: 'bg-white border border-gray-100'      }
}

export default function Leaderboard() {
  const { user } = useAuth()

  const [topUsers,     setTopUsers]     = useState([])
  const [topStreets,   setTopStreets]   = useState([])
  const [topCategories,setTopCategories]= useState([])
  const [globalStats,  setGlobalStats]  = useState({ total: 0, resolved: 0, inProgress: 0 })
  const [loading,      setLoading]      = useState(true)

  useEffect(() => {
    fetchAll()
  }, [])

  async function fetchAll() {
    setLoading(true)
    await Promise.all([fetchTopUsers(), fetchReportStats()])
    setLoading(false)
  }

  async function fetchTopUsers() {
    const { data } = await supabase
      .from('profiles')
      .select('id, full_name, username, avatar_url, points, reports_count, resolved_count')
      .order('points', { ascending: false })
      .limit(7)
    setTopUsers(data || [])
  }

  async function fetchReportStats() {
    const { data } = await supabase
      .from('reports')
      .select('status, category, address')

    if (!data) return

    // Global stats
    setGlobalStats({
      total:      data.length,
      resolved:   data.filter(r => r.status === 'rezolvat').length,
      inProgress: data.filter(r => r.status === 'in_lucru').length,
    })

    // Top streets
    const streetCounts = data.reduce((acc, r) => {
      const addr = r.address?.trim()
      if (addr) acc[addr] = (acc[addr] || 0) + 1
      return acc
    }, {})
    const sortedStreets = Object.entries(streetCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)
    setTopStreets(sortedStreets)

    // Top categories
    const catCounts = data.reduce((acc, r) => {
      if (r.category) acc[r.category] = (acc[r.category] || 0) + 1
      return acc
    }, {})
    const sortedCats = Object.entries(catCounts)
      .map(([name, count]) => ({ name, count, color: CATEGORY_CONFIG[name] || '#6b7280' }))
      .sort((a, b) => b.count - a.count)
    setTopCategories(sortedCats)
  }

  const maxStreetCount = topStreets[0]?.count   || 1
  const maxCatCount    = topCategories[0]?.count || 1

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 pb-24 md:pb-8">

      {/* ── Header ── */}
      <div className="flex items-center gap-4 mb-8">
        <div className="w-14 h-14 bg-yellow-100 rounded-2xl flex items-center justify-center text-2xl">
          🏆
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Clasamente și statistici</h1>
          <p className="text-gray-400 text-sm mt-0.5">Topul celor mai activi utilizatori și zone problematice</p>
        </div>
      </div>

      {/* ── Global stats ── */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { label: 'Total rapoarte', value: globalStats.total,      color: 'text-blue-600',   bg: 'bg-blue-50'   },
          { label: 'În lucru',       value: globalStats.inProgress,  color: 'text-orange-600', bg: 'bg-orange-50' },
          { label: 'Rezolvate',      value: globalStats.resolved,    color: 'text-green-600',  bg: 'bg-green-50'  },
        ].map(({ label, value, color, bg }) => (
          <div key={label} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-xs mb-1">{label}</p>
              <p className={`text-3xl font-bold ${color}`}>{value}</p>
            </div>
            <div className={`w-10 h-10 ${bg} rounded-xl`} />
          </div>
        ))}
      </div>

      {/* ── Top Users + Top Streets (Figma layout) ── */}
      <div className="grid lg:grid-cols-2 gap-6 mb-6">

        {/* Top Users */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center gap-2 mb-6">
            <span className="text-lg">🏅</span>
            <h2 className="font-bold text-gray-900 text-lg">Top utilizatori</h2>
          </div>

          {loading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-20 bg-gray-100 rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : topUsers.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <Trophy size={40} className="mx-auto mb-3 text-gray-200" />
              <p className="text-sm">Niciun utilizator încă</p>
            </div>
          ) : (
            <div className="space-y-3">
              {topUsers.map((u, i) => {
                const { badge, card } = rankStyle(i)
                const isMe = user?.id === u.id
                return (
                  <div key={u.id} className={`flex items-center gap-4 p-4 rounded-2xl ${card} ${isMe ? 'ring-2 ring-blue-400' : ''}`}>
                    {/* Medal */}
                    <div className={`w-11 h-11 rounded-full flex items-center justify-center font-bold text-base flex-shrink-0 text-white ${badge}`}>
                      {i < 3 ? MEDALS[i] : i + 1}
                    </div>
                    {/* Avatar */}
                    <div className="w-11 h-11 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 overflow-hidden">
                      {u.avatar_url
                        ? <img src={u.avatar_url} alt="" className="w-full h-full object-cover" />
                        : <span className="text-blue-600 font-bold text-base">
                            {(u.full_name || u.username || '?').charAt(0).toUpperCase()}
                          </span>
                      }
                    </div>
                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-gray-900 text-sm truncate">
                        {u.full_name || u.username || 'Utilizator'}
                        {isMe && <span className="ml-1 text-xs text-blue-500 font-normal">(tu)</span>}
                      </p>
                      <p className="text-gray-400 text-xs mt-0.5">
                        {u.reports_count || 0} raportări
                        <span className="mx-1.5">•</span>
                        {u.resolved_count || 0} rezolvate
                      </p>
                    </div>
                    {/* Points */}
                    <div className="text-right flex-shrink-0">
                      <p className="font-bold text-gray-900 text-xl">{(u.points || 0).toLocaleString('ro-RO')}</p>
                      <p className="text-gray-400 text-xs">puncte</p>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Top Streets */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center gap-2 mb-6">
            <MapPin size={20} className="text-red-500" />
            <h2 className="font-bold text-gray-900 text-lg">Cele mai problematice străzi</h2>
          </div>

          {loading ? (
            <div className="space-y-5">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-10 bg-gray-100 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : topStreets.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <MapPin size={40} className="mx-auto mb-3 text-gray-200" />
              <p className="text-sm">Nu sunt date suficiente încă</p>
            </div>
          ) : (
            <div className="space-y-5">
              {topStreets.map((street, i) => (
                <div key={street.name} className="flex items-start gap-3">
                  <span className="w-7 h-7 bg-red-50 text-red-500 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                    {i + 1}
                  </span>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-sm font-medium text-gray-900">{street.name}</span>
                      <span className="text-sm font-bold text-gray-800 ml-2">{street.count}</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2">
                      <div
                        className="bg-red-500 h-2 rounded-full transition-all"
                        style={{ width: `${(street.count / maxStreetCount) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Categories + How to win points ── */}
      <div className="grid lg:grid-cols-2 gap-6">

        {/* Categories */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center gap-2 mb-6">
            <TrendingUp size={18} className="text-blue-500" />
            <h2 className="font-bold text-gray-900 text-lg">Categorii raportate</h2>
          </div>

          {loading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-8 bg-gray-100 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : topCategories.length === 0 ? (
            <div className="text-center py-8 text-gray-400 text-sm">Nicio raportare încă</div>
          ) : (
            <div className="space-y-4">
              {topCategories.map(cat => (
                <div key={cat.name} className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: cat.color }} />
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-gray-900">{cat.name}</span>
                      <span className="text-sm font-bold text-gray-700">{cat.count}</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2">
                      <div
                        className="h-2 rounded-full transition-all"
                        style={{ width: `${(cat.count / maxCatCount) * 100}%`, backgroundColor: cat.color }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* How to earn points */}
        <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl p-6 text-white">
          <h3 className="font-bold text-lg mb-6">Cum câștigii puncte?</h3>
          <div className="space-y-3">
            {[
              { action: 'Trimiți un raport',         pts: '+10 pts' },
              { action: 'Raportul tău e verificat',  pts: '+15 pts' },
              { action: 'Raportul tău e rezolvat',   pts: '+50 pts' },
              { action: 'Primești un vot',            pts: '+5 pts'  },
            ].map(({ action, pts }) => (
              <div key={action} className="flex items-center justify-between bg-white/10 rounded-xl px-4 py-3">
                <span className="text-blue-100 text-sm">{action}</span>
                <span className="font-bold text-sm bg-white/20 px-3 py-1 rounded-lg">{pts}</span>
              </div>
            ))}
          </div>
          <p className="text-blue-200 text-xs mt-5 text-center">
            Punctele sunt acordate automat de sistem
          </p>
        </div>

      </div>
    </div>
  )
}