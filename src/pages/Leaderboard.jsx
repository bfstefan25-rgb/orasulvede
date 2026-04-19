import { useEffect, useState } from 'react'
import { Trophy, MapPin, TrendingUp, FileText, Wrench, CheckCircle2, Award, Users, AlertTriangle } from 'lucide-react'
import { useSEO } from '../hooks/useSEO'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'

function PieChart({ data, loading }) {
  if (loading) {
    return <div className="h-64 bg-gray-100 dark:bg-gray-700 rounded-2xl animate-pulse" />
  }
  if (!data || data.length === 0) {
    return <div className="text-center py-8 text-gray-400 text-sm">Nicio raportare încă</div>
  }

  const total = data.reduce((s, d) => s + d.count, 0)
  const cx = 150, cy = 140, r = 88
  let startAngle = -Math.PI / 2

  const slices = data.map(d => {
    const angle = (d.count / total) * 2 * Math.PI
    const endAngle = startAngle + angle
    const midAngle = startAngle + angle / 2
    const x1 = cx + r * Math.cos(startAngle)
    const y1 = cy + r * Math.sin(startAngle)
    const x2 = cx + r * Math.cos(endAngle)
    const y2 = cy + r * Math.sin(endAngle)
    const largeArc = angle > Math.PI ? 1 : 0
    const path = `M ${cx} ${cy} L ${x1.toFixed(2)} ${y1.toFixed(2)} A ${r} ${r} 0 ${largeArc} 1 ${x2.toFixed(2)} ${y2.toFixed(2)} Z`
    const labelR = r + 24
    const lx = cx + labelR * Math.cos(midAngle)
    const ly = cy + labelR * Math.sin(midAngle)
    const slice = { ...d, path, lx, ly, midAngle }
    startAngle = endAngle
    return slice
  })

  return (
    <div>
      <svg viewBox="0 0 370 280" className="w-full">
        {slices.map(s => (
          <path key={s.name} d={s.path} fill={s.color} />
        ))}
        {slices.map(s => {
          if (s.count / total < 0.04) return null
          return (
            <text
              key={s.name}
              x={s.lx}
              y={s.ly}
              textAnchor={s.lx < 150 - 6 ? 'end' : s.lx > 150 + 6 ? 'start' : 'middle'}
              dominantBaseline="middle"
              fontSize="10"
              fill={s.color}
              fontWeight="600"
            >
              {s.name}
            </text>
          )
        })}
      </svg>
      <div className="grid grid-cols-2 gap-x-6 gap-y-2 mt-1">
        {data.map(cat => (
          <div key={cat.name} className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: cat.color }} />
            <span className="text-sm text-gray-700 dark:text-gray-300">
              {cat.name}: <span className="font-bold text-gray-900 dark:text-white">{cat.count}</span>
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

const CATEGORY_CONFIG = {
  'Infrastructură': '#f97316',
  'Iluminat':       '#eab308',
  'Trafic':         '#ef4444',
  'Canalizare':       '#a855f7',
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
  const [topIgnored,    setTopIgnored]    = useState([])
  const [globalStats,   setGlobalStats]   = useState({ total: 0, resolved: 0, inProgress: 0 })
  const [loading,       setLoading]       = useState(true)
  useSEO({ title: 'Clasament', description: 'Topul celor mai activi cetățeni și cele mai problematice zone din oraș.' })

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
      .select('status, category, address, title, created_at')

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

    const now = Date.now()
    const ignored = data
      .filter(r => !['rezolvat', 'respins'].includes(r.status))
      .map(r => ({ ...r, days: Math.floor((now - new Date(r.created_at)) / 86400000) }))
      .filter(r => r.days > 30)
      .sort((a, b) => b.days - a.days)
      .slice(0, 6)
    setTopIgnored(ignored)
  }

  const maxStreetCount = topStreets[0]?.count || 1

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors">
      <div className="max-w-6xl mx-auto px-4 py-8 pb-24 md:pb-8">

        {/* ── Header ── */}
        <div className="mb-8">
          <h1 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">Clasamente și statistici</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Topul celor mai activi utilizatori și zone problematice</p>
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
                <p className="text-sm">Niciun utilizator încă</p>
              </div>
            ) : (
              <div className="space-y-3">
                {topUsers.map((u, i) => {
                  const isMe = user?.id === u.id
                  const isTop3 = i < 3
                  return (
                    <div key={u.id} className={`flex items-center gap-3 md:gap-4 p-3 md:p-4 rounded-2xl border ${
                      i === 0 ? 'bg-amber-100 dark:bg-amber-900/30 border-amber-300 dark:border-amber-600' :
                      i === 1 ? 'bg-slate-200 dark:bg-slate-700/60 border-slate-300 dark:border-slate-500' :
                      i === 2 ? 'bg-orange-100 dark:bg-orange-900/30 border-orange-300 dark:border-orange-600' :
                      'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'
                    } ${isMe ? 'ring-2 ring-primary-500' : ''}`}>
                      {/* Rank */}
                      <div className={`w-6 flex-shrink-0 text-center font-bold text-sm ${
                        i === 0 ? 'text-amber-600 dark:text-amber-400' :
                        i === 1 ? 'text-slate-500 dark:text-slate-300' :
                        i === 2 ? 'text-orange-500 dark:text-orange-400' :
                        'text-gray-400 dark:text-gray-500'
                      }`}>
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
                          {u.reports_count || 0} raportări
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
              <h2 className="font-bold text-gray-900 dark:text-white text-base md:text-lg">Cele mai problematice străzi</h2>
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
                <p className="text-sm">Nu sunt date suficiente încă</p>
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

          {/* Categories pie chart */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm p-4 md:p-6">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp size={18} className="text-gray-400 dark:text-gray-500" />
              <h2 className="font-bold text-gray-900 dark:text-white text-base md:text-lg">Probleme pe categorii</h2>
            </div>
            <PieChart data={topCategories} loading={loading} />
          </div>

          {/* How to earn points */}
          <div className="bg-gray-900 dark:bg-gray-800 rounded-2xl p-4 md:p-6 text-white">
            <div className="flex items-center gap-2 mb-6">
              <Award size={18} className="text-gray-400" />
              <h3 className="font-bold text-base md:text-lg">Cum câștigi puncte?</h3>
            </div>
            <div className="space-y-3">
              {[
                { action: 'Trimiți un raport',         pts: '+10 pts' },
                { action: 'Raportul tău e verificat',  pts: '+15 pts' },
                { action: 'Raportul tău e rezolvat',   pts: '+50 pts' },
                { action: 'Primești un vot',            pts: '+5 pts'  },
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

        {/* ── Top ignored problems ── */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm p-4 md:p-6 mt-6">
          <div className="flex items-center gap-2 mb-5">
            <AlertTriangle size={18} className="text-orange-500" />
            <h2 className="font-bold text-gray-900 dark:text-white text-base md:text-lg">Top probleme ignorate</h2>
          </div>

          {loading ? (
            <div className="space-y-3">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-10 bg-gray-100 dark:bg-gray-700 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : topIgnored.length === 0 ? (
            <p className="text-center py-8 text-gray-400 text-sm">Nicio problemă ignorată</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-gray-400 dark:text-gray-500 text-xs uppercase tracking-wide">
                    <th className="text-left pb-3 font-medium">Problemă</th>
                    <th className="text-left pb-3 font-medium px-4">Locație</th>
                    <th className="text-right pb-3 font-medium">Vechime</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                  {topIgnored.map((r, i) => {
                    const badge =
                      r.days > 90 ? { label: '> 90 zile', bg: 'bg-red-100 dark:bg-red-900/30',    text: 'text-red-600 dark:text-red-400'    } :
                      r.days > 60 ? { label: '> 60 zile', bg: 'bg-orange-100 dark:bg-orange-900/30', text: 'text-orange-600 dark:text-orange-400' } :
                                    { label: '> 30 zile', bg: 'bg-yellow-100 dark:bg-yellow-900/30', text: 'text-yellow-700 dark:text-yellow-400' }
                    return (
                      <tr key={i}>
                        <td className="py-3 font-medium text-gray-900 dark:text-white pr-4">{r.title || '—'}</td>
                        <td className="py-3 text-gray-500 dark:text-gray-400 px-4">{r.address || '—'}</td>
                        <td className="py-3 text-right">
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${badge.bg} ${badge.text}`}>
                            <span>⏱</span>{badge.label}
                          </span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* ── Statistici generale ── */}
        <div className="bg-gray-900 dark:bg-gray-800 rounded-2xl p-5 md:p-6 mt-6">
          <p className="text-white font-bold text-base md:text-lg mb-4">Statistici generale</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Total probleme', value: globalStats.total },
              { label: 'Rezolvate',      value: globalStats.resolved },
              { label: 'În lucru',       value: globalStats.inProgress },
              { label: 'Rata rezolvare', value: globalStats.total > 0 ? `${Math.round((globalStats.resolved / globalStats.total) * 100)}%` : '0%' },
            ].map(({ label, value }) => (
              <div key={label}>
                <p className="text-gray-400 text-xs mb-1">{label}</p>
                <p className="text-white font-bold text-2xl md:text-3xl">{value}</p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}
