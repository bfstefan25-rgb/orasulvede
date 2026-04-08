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
    <div style={{ minHeight: '100vh', background: '#f8fafc', padding: '32px 24px' }}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>

      {/* Header */}
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32 }}>
          <div>
            <h1 style={{ fontSize: 28, fontWeight: 900, color: '#1a1a2e', margin: 0 }}>🛠️ Panou Admin</h1>
            <p style={{ color: '#6b7280', margin: '4px 0 0' }}>Gestionează raportările cetățenilor</p>
          </div>
          <button onClick={() => navigate('/acasa')} style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: '8px 20px', fontWeight: 600, color: '#374151', cursor: 'pointer' }}>
            ← Înapoi la aplicație
          </button>
        </div>

        {/* Stats cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 12, marginBottom: 32 }}>
          {[
            { label: 'Total', value: stats.total, bg: '#eff6ff', color: '#2563EB' },
            { label: 'Raportate', value: stats.raportat, bg: '#dbeafe', color: '#1d4ed8' },
            { label: 'În verificare', value: stats.in_verificare, bg: '#fef9c3', color: '#92400e' },
            { label: 'În lucru', value: stats.in_lucru, bg: '#ffedd5', color: '#c2410c' },
            { label: 'Rezolvate', value: stats.rezolvat, bg: '#dcfce7', color: '#15803d' },
            { label: 'Respinse', value: stats.respins, bg: '#fee2e2', color: '#b91c1c' },
          ].map(({ label, value, bg, color }) => (
            <div key={label} style={{ background: '#fff', borderRadius: 16, padding: '16px', border: '1px solid #e5e7eb', textAlign: 'center' }}>
              <div style={{ fontSize: 24, fontWeight: 900, color }}>{value ?? 0}</div>
              <div style={{ fontSize: 12, color: '#6b7280', marginTop: 4 }}>{label}</div>
            </div>
          ))}
        </div>

        {/* Filter tabs */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
          {[['all', 'Toate'], ['raportat', 'Raportate'], ['in_verificare', 'În verificare'], ['in_lucru', 'În lucru'], ['rezolvat', 'Rezolvate'], ['respins', 'Respinse']].map(([val, label]) => (
            <button
              key={val}
              onClick={() => setFilter(val)}
              style={{
                padding: '8px 16px', borderRadius: 100, border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: 13,
                background: filter === val ? '#2563EB' : '#fff',
                color: filter === val ? '#fff' : '#374151',
                border: filter === val ? 'none' : '1px solid #e5e7eb',
              }}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Reports table */}
        <div style={{ background: '#fff', borderRadius: 20, border: '1px solid #e5e7eb', overflow: 'hidden' }}>
          {filtered.length === 0 ? (
            <div style={{ padding: 48, textAlign: 'center', color: '#9ca3af' }}>Nicio raportare găsită</div>
          ) : (
            filtered.map((report, i) => {
              const sc = STATUS_COLORS[report.status] || STATUS_COLORS.raportat
              const currentIdx = STATUS_FLOW.indexOf(report.status)
              const nextStatus = currentIdx >= 0 && currentIdx < STATUS_FLOW.length - 1 ? STATUS_FLOW[currentIdx + 1] : null
              const isUpdating = updating === report.id
              return (
                <div
                  key={report.id}
                  style={{
                    padding: '20px 24px',
                    borderBottom: i < filtered.length - 1 ? '1px solid #f3f4f6' : 'none',
                    display: 'flex', alignItems: 'flex-start', gap: 16,
                    opacity: isUpdating ? 0.6 : 1,
                    transition: 'opacity 0.2s'
                  }}
                >
                  {/* Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6, flexWrap: 'wrap' }}>
                      <span style={{ fontWeight: 700, fontSize: 15, color: '#1a1a2e' }}>{report.title}</span>
                      <span style={{ background: sc.bg, color: sc.color, borderRadius: 100, padding: '2px 10px', fontSize: 12, fontWeight: 700 }}>
                        {STATUS_LABELS[report.status]}
                      </span>
                      <span style={{ background: '#f3f4f6', color: '#6b7280', borderRadius: 100, padding: '2px 10px', fontSize: 12 }}>
                        {report.category}
                      </span>
                    </div>
                    {report.description && (
                      <p style={{ color: '#6b7280', fontSize: 13, margin: '0 0 6px', lineHeight: 1.5 }}>
                        {report.description.substring(0, 120)}{report.description.length > 120 ? '...' : ''}
                      </p>
                    )}
                    <div style={{ display: 'flex', gap: 16, fontSize: 12, color: '#9ca3af' }}>
                      {report.address && <span>📍 {report.address}</span>}
                      <span>🕐 {timeAgo(report.created_at)}</span>
                      <span style={{ fontFamily: 'monospace', fontSize: 11 }}>ID: {report.id.substring(0, 8)}...</span>
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div style={{ display: 'flex', gap: 8, flexShrink: 0, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                    {nextStatus && (
                      <button
                        onClick={() => updateStatus(report.id, nextStatus)}
                        disabled={isUpdating}
                        style={{
                          background: '#2563EB', color: '#fff', border: 'none', borderRadius: 10,
                          padding: '8px 14px', fontSize: 13, fontWeight: 700, cursor: 'pointer',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        {isUpdating ? '...' : `→ ${STATUS_LABELS[nextStatus]}`}
                      </button>
                    )}
                    {report.status !== 'rezolvat' && report.status !== 'respins' && (
                      <button
                        onClick={() => updateStatus(report.id, 'respins')}
                        disabled={isUpdating}
                        style={{
                          background: '#fff', color: '#b91c1c', border: '1px solid #fca5a5', borderRadius: 10,
                          padding: '8px 14px', fontSize: 13, fontWeight: 700, cursor: 'pointer'
                        }}
                      >
                        ✕ Respinge
                      </button>
                    )}
                    {(report.status === 'rezolvat' || report.status === 'respins') && (
                      <button
                        onClick={() => updateStatus(report.id, 'raportat')}
                        disabled={isUpdating}
                        style={{
                          background: '#fff', color: '#6b7280', border: '1px solid #e5e7eb', borderRadius: 10,
                          padding: '8px 14px', fontSize: 13, fontWeight: 600, cursor: 'pointer'
                        }}
                      >
                        ↺ Resetează
                      </button>
                    )}
                    <a
                      href={`/raport/${report.id}`}
                      target="_blank"
                      rel="noreferrer"
                      style={{
                        background: '#f3f4f6', color: '#374151', border: 'none', borderRadius: 10,
                        padding: '8px 14px', fontSize: 13, fontWeight: 600, cursor: 'pointer',
                        textDecoration: 'none', display: 'inline-block'
                      }}
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