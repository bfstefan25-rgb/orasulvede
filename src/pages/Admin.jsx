import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useNavigate } from 'react-router-dom'

const ADMIN_ID = '2f6ac2bd-23d3-4e70-b859-606b150d1bca'

const STATUS_FLOW = ['raportat', 'in_verificare', 'in_lucru', 'rezolvat']

const STATUS_LABELS = {
  raportat:      'Raportat',
  in_verificare: 'În verificare',
  in_lucru:      'În lucru',
  rezolvat:      'Rezolvat',
  respins:       'Respins',
}

const STATUS_COLORS = {
  raportat:      { bg: '#dbeafe', color: '#1d4ed8' },
  in_verificare: { bg: '#fef9c3', color: '#92400e' },
  in_lucru:      { bg: '#ffedd5', color: '#c2410c' },
  rezolvat:      { bg: '#dcfce7', color: '#15803d' },
  respins:       { bg: '#fee2e2', color: '#b91c1c' },
}

function timeAgo(date) {
  const days = Math.floor((Date.now() - new Date(date)) / 86400000)
  if (days === 0) return 'azi'
  if (days === 1) return 'ieri'
  return `${days} zile în urmă`
}

export default function Admin() {
  const navigate = useNavigate()
  const [loading, setLoading]   = useState(true)
  const [allowed, setAllowed]   = useState(false)
  const [reports, setReports]   = useState([])
  const [filter,  setFilter]    = useState('all')
  const [updating, setUpdating] = useState(null)
  const [stats, setStats]       = useState({})

  useEffect(() => { init() }, [])

  async function init() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user || user.id !== ADMIN_ID) {
      setLoading(false)
      return
    }
    setAllowed(true)
    await fetchReports()
    setLoading(false)
  }

  async function fetchReports() {
    const { data } = await supabase
      .from('reports')
      .select('id, title, category, status, created_at, address, user_id, description')
      .order('created_at', { ascending: false })
    const list = data || []
    setReports(list)
    const s = {}
    STATUS_FLOW.concat(['respins']).forEach(st => {
      s[st] = list.filter(r => r.status === st).length
    })
    s.total = list.length
    setStats(s)
  }

  async function updateStatus(reportId, newStatus) {
    setUpdating(reportId)
    await supabase
      .from('reports')
      .update({ status: newStatus })
      .eq('id', reportId)
    await fetchReports()
    setUpdating(null)
  }

  const filtered = filter === 'all' ? reports : reports.filter(r => r.status === filter)

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: 32, height: 32, border: '4px solid #2563EB', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      </div>
    )
  }

  if (!allowed) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16 }}>
        <div style={{ fontSize: 64 }}>🚫</div>
        <h2 style={{ fontSize: 24, fontWeight: 800, color: '#1a1a2e' }}>Acces interzis</h2>
        <p style={{ color: '#6b7280' }}>Nu ai permisiuni de administrator.</p>
        <button onClick={() => navigate('/')} style={{ background: '#2563EB', color: '#fff', border: 'none', borderRadius: 12, padding: '10px 24px', fontWeight: 700, cursor: 'pointer' }}>
          Înapoi acasă
        </button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-8">
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>

      {/* Header */}
      <div className="max-w-5xl mx-auto px-4 pt-6">
        <div className="flex items-center justify-between gap-3 mb-6">
          <div>
            <h1 className="text-xl md:text-2xl font-black text-gray-900">🛠️ Panou Admin</h1>
            <p className="text-gray-500 text-sm mt-0.5">Gestionează raportările cetățenilor</p>
          </div>
          <button onClick={() => navigate('/acasa')} className="flex-shrink-0 bg-white border border-gray-200 rounded-xl px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors">
            ← Înapoi
          </button>
        </div>

        {/* Stats cards */}
        <div className="grid grid-cols-3 md:grid-cols-6 gap-2 mb-6">
          {[
            { label: 'Total',        value: stats.total,        color: 'text-blue-600' },
            { label: 'Raportate',    value: stats.raportat,     color: 'text-blue-700' },
            { label: 'Verificare',   value: stats.in_verificare,color: 'text-yellow-700' },
            { label: 'În lucru',     value: stats.in_lucru,     color: 'text-orange-600' },
            { label: 'Rezolvate',    value: stats.rezolvat,     color: 'text-green-600' },
            { label: 'Respinse',     value: stats.respins,      color: 'text-red-600' },
          ].map(({ label, value, color }) => (
            <div key={label} className="bg-white rounded-2xl p-3 border border-gray-200 text-center">
              <div className={`text-xl font-black ${color}`}>{value ?? 0}</div>
              <div className="text-xs text-gray-500 mt-1 leading-tight">{label}</div>
            </div>
          ))}
        </div>

        {/* Filter tabs */}
        <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
          {[['all', 'Toate'], ['raportat', 'Raportate'], ['in_verificare', 'Verificare'], ['in_lucru', 'În lucru'], ['rezolvat', 'Rezolvate'], ['respins', 'Respinse']].map(([val, label]) => (
            <button
              key={val}
              onClick={() => setFilter(val)}
              className={`flex-shrink-0 px-4 py-2 rounded-full text-xs font-semibold border transition-colors ${
                filter === val
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-gray-700 border-gray-200 hover:border-blue-300'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Reports list */}
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          {filtered.length === 0 ? (
            <div className="py-12 text-center text-gray-400 text-sm">Nicio raportare găsită</div>
          ) : (
            filtered.map((report, i) => {
              const sc = STATUS_COLORS[report.status] || STATUS_COLORS.raportat
              const currentIdx = STATUS_FLOW.indexOf(report.status)
              const nextStatus = currentIdx >= 0 && currentIdx < STATUS_FLOW.length - 1 ? STATUS_FLOW[currentIdx + 1] : null
              const isUpdating = updating === report.id
              return (
                <div
                  key={report.id}
                  className={`p-4 ${i < filtered.length - 1 ? 'border-b border-gray-100' : ''} ${isUpdating ? 'opacity-50' : ''} transition-opacity`}
                >
                  {/* Title + badges */}
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <span className="font-bold text-sm text-gray-900 mr-1">{report.title}</span>
                    <span style={{ background: sc.bg, color: sc.color }} className="rounded-full px-2.5 py-0.5 text-xs font-bold">
                      {STATUS_LABELS[report.status]}
                    </span>
                    <span className="bg-gray-100 text-gray-500 rounded-full px-2.5 py-0.5 text-xs">
                      {report.category}
                    </span>
                  </div>

                  {/* Description */}
                  {report.description && (
                    <p className="text-gray-500 text-xs mb-2 leading-relaxed">
                      {report.description.substring(0, 100)}{report.description.length > 100 ? '...' : ''}
                    </p>
                  )}

                  {/* Meta */}
                  <div className="flex flex-wrap gap-3 text-xs text-gray-400 mb-3">
                    {report.address && <span>📍 {report.address}</span>}
                    <span>🕐 {timeAgo(report.created_at)}</span>
                    <span className="font-mono text-[11px]">ID: {report.id.substring(0, 8)}...</span>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap gap-2">
                    {nextStatus && (
                      <button
                        onClick={() => updateStatus(report.id, nextStatus)}
                        disabled={isUpdating}
                        className="bg-blue-600 text-white rounded-xl px-3 py-2 text-xs font-bold hover:bg-blue-700 transition-colors disabled:opacity-50"
                      >
                        {isUpdating ? '...' : `→ ${STATUS_LABELS[nextStatus]}`}
                      </button>
                    )}
                    {report.status !== 'rezolvat' && report.status !== 'respins' && (
                      <button
                        onClick={() => updateStatus(report.id, 'respins')}
                        disabled={isUpdating}
                        className="bg-white text-red-600 border border-red-200 rounded-xl px-3 py-2 text-xs font-bold hover:bg-red-50 transition-colors"
                      >
                        ✕ Respinge
                      </button>
                    )}
                    {(report.status === 'rezolvat' || report.status === 'respins') && (
                      <button
                        onClick={() => updateStatus(report.id, 'raportat')}
                        disabled={isUpdating}
                        className="bg-white text-gray-600 border border-gray-200 rounded-xl px-3 py-2 text-xs font-semibold hover:bg-gray-50 transition-colors"
                      >
                        ↺ Resetează
                      </button>
                    )}
                    <a
                      href={`/raport/${report.id}`}
                      target="_blank"
                      rel="noreferrer"
                      className="bg-gray-100 text-gray-700 rounded-xl px-3 py-2 text-xs font-semibold hover:bg-gray-200 transition-colors no-underline"
                    >
                      👁️ Vezi
                    </a>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}