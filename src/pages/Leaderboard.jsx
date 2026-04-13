import { useEffect, useState } from 'react'
import { Trophy, MapPin, TrendingUp, FileText, Wrench, CheckCircle2, Award, Users } from 'lucide-react'
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

export default function Leaderboard() {
  const { user } = useAuth()

  const [topUsers,      setTopUsers]      = useState([])
  const [topStreets,    setTopStreets]    = useState([])
  const [topCategories, setTopCategories] = useState([])
  const [globalStats,   setGlobalStats]   = useState({ total: 0, resolved: 0, inProgress: 0 })
  const [loading,       setLoading]       = useState(true)

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

    setGlobalStats({
      total:      data.length,
      resolved:   data.filter(r => r.status === 'rezolvat').length,
      inProgress: data.filter(r => r.status === 'in_lucru').length,
    })

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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors">
      <div className="max-w-6xl mx-auto px-4 py-8 pb-24 md:pb-8">

        {/* ── Header ── */}
        <div className="mb-8">
          <h1 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">Clasamente si statistici</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Topul celor mai activi utilizatori si zone problematice</p>
        </div>

        {/* ── Global stats ── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          {[
            { label: 'Total rapoarte', value: globalStats.total,      icon: FileText    },
            { label: 'In lucru',       value: globalStats.inProgress,  icon: Wrench      },
            { label: 'Rezolvate',      value: globalStats.resolved,    icon: CheckCircle2 },
          ].map(({ label, value, icon: Icon }) => (
            <div key={label} className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm border border-gray-200 dark:border-gray-700 flex items-center gap-3">
              <Icon size={20} className="text-gray-400 dark:text-gray-500 flex-shrink-0" />
              <div>
                <p className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
                <p className="text-gray-500 dark:text-gray-400 text-xs">{label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* ── Top Users + Top Streets ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">

          {/* Top Users */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm p-4 md:p-6">
            <div className="flex items-center gap-2 mb-6">
              <Users size={18} className="text-gray-400 dark:text-gray-500" />
              <h2 className="font-bold text-gray-900 dark:text-white text-base md:text-lg">Top utilizatori</h2>
            </div>

            {loading ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-20 bg-gray-100 dark:bg-gray-700 rounded-2xl animate-pulse" />
                ))}
              </div>
            ) : topUsers.length === 0 ? (
              <div className="text-center py-16 text-gray-400">
                <Trophy size={40} className="mx-auto mb-3 text-gray-200 dark:text-gray-600" />
                <p className="text-sm">Niciun utilizator inca</p>
              </div>
            ) : (
              <div className="space-y-3">
                {topUsers.map((u, i) => {
                  const isMe = user?.id === u.id
                  const isTop3 = i < 3
                  return (
                    <div key={u.id} className={`flex items-center gap-3 md:gap-4 p-3 md:p-4 rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 ${isMe ? 'ring-2 ring-primary-500' : ''}`}>
                      {/* Rank */}
                      <div className={`w-10 h-10 md:w-11 md:h-11 rounded-full flex items-center justify-center flex-shrink-0 ${isTop3 ? 'bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 font-bold text-sm' : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 font-medium text-sm'}`}>
                        {i + 1}
                      </div>
                      {/* Avatar */}
                      <div className="w-10 h-10 md:w-11 md:h-11 rounded-full bg-primary-50 dark:bg-primary-900/40 flex items-center justify-center flex-shrink-0 overflow-hidden">
                        {u.avatar_url
                          ? <img src={u.avatar_url} alt="" className="w-full h-full object-cover" />
                          : <span className="text-primary-600 dark:text-primary-400 font-bold text-sm md:text-base">
                              {(u.full_name || u.username || '?').charAt(0).toUpperCase()}
                            </span>
                        }
                      </div>
                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-gray-900 dark:text-white text-sm truncate">
                          {u.full_name || u.username || 'Utilizator'}
                          {isMe && <span className="ml-1 text-xs text-primary-500 font-normal">(tu)</span>}
                        </p>
                        <p className="text-gray-500 dark:text-gray-400 text-xs mt-0.5">
                          {u.reports_count || 0} raportari
                          <span className="mx-1.5">&#183;</span>
                          {u.resolved_count || 0} rezolvate
                        </p>
                      </div>
                      {/* Points */}
                      <div className="text-right flex-shrink-0">
                        <p className="font-bold text-gray-900 dark:text-white text-base md:text-xl">{(u.points || 0).toLocaleString('ro-RO')}</p>
                        <p className="text-gray-500 dark:text-gray-400 text-xs">puncte</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Top Streets */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm p-4 md:p-6">
            <div className="flex items-center gap-2 mb-6">
              <MapPin size={18} className="text-gray-400 dark:text-gray-500" />
              <h2 className="font-bold text-gray-900 dark:text-white text-base md:text-lg">Cele mai problematice strazi</h2>
            </div>

            {loading ? (
              <div className="space-y-5">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-10 bg-gray-100 dark:bg-gray-700 rounded-xl animate-pulse" />
                ))}
              </div>
            ) : topStreets.length === 0 ? (
              <div className="text-center py-16 text-gray-400">
                <MapPin size={40} className="mx-auto mb-3 text-gray-200 dark:text-gray-600" />
                <p className="text-sm">Nu sunt date suficiente inca</p>
              </div>
            ) : (
              <div className="space-y-5">
                {topStreets.map((street, i) => (
                  <div key={street.name} className="flex items-start gap-3">
                    <span className="w-7 h-7 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                      {i + 1}
                    </span>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-sm font-medium text-gray-900 dark:text-white">{street.name}</span>
                        <span className="text-sm font-bold text-gray-800 dark:text-gray-200 ml-2">{street.count}</span>
                      </div>
                      <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-2">
                        <div
                          className="bg-gray-900 dark:bg-gray-100 h-2 rounded-full transition-all"
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Categories */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm p-4 md:p-6">
            <div className="flex items-center gap-2 mb-6">
              <TrendingUp size={18} className="text-gray-400 dark:text-gray-500" />
              <h2 className="font-bold text-gray-900 dark:text-white text-base md:text-lg">Categorii raportate</h2>
            </div>

            {loading ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-8 bg-gray-100 dark:bg-gray-700 rounded-xl animate-pulse" />
                ))}
              </div>
            ) : topCategories.length === 0 ? (
              <div className="text-center py-8 text-gray-400 text-sm">Nicio raportare inca</div>
            ) : (
              <div className="space-y-4">
                {topCategories.map(cat => (
                  <div key={cat.name} className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: cat.color }} />
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-gray-900 dark:text-white">{cat.name}</span>
                        <span className="text-sm font-bold text-gray-700 dark:text-gray-300">{cat.count}</span>
                      </div>
                      <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-2">
                        <div
                          className="bg-gray-900 dark:bg-gray-100 h-2 rounded-full transition-all"
                          style={{ width: `${(cat.count / maxCatCount) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* How to earn points */}
          <div className="bg-gray-900 dark:bg-gray-800 rounded-2xl p-4 md:p-6 text-white">
            <div className="flex items-center gap-2 mb-6">
              <Award size={18} className="text-gray-400" />
              <h3 className="font-bold text-base md:text-lg">Cum castigi puncte?</h3>
            </div>
            <div className="space-y-3">
              {[
                { action: 'Trimiti un raport',         pts: '+10 pts' },
                { action: 'Raportul tau e verificat',  pts: '+15 pts' },
                { action: 'Raportul tau e rezolvat',   pts: '+50 pts' },
                { action: 'Primesti un vot',            pts: '+5 pts'  },
              ].map(({ action, pts }) => (
                <div key={action} className="flex items-center justify-between bg-white/10 rounded-xl px-4 py-3">
                  <span className="text-gray-300 text-sm">{action}</span>
                  <span className="font-bold text-sm bg-white/10 px-3 py-1 rounded-lg">{pts}</span>
                </div>
              ))}
            </div>
            <p className="text-gray-400 text-xs mt-5 text-center">
              Punctele sunt acordate automat de sistem
            </p>
          </div>

        </div>
      </div>
    </div>
  )
}
