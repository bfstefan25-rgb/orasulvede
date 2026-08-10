import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useNavigate } from 'react-router-dom'
import ReportAdminCard from '../components/admin/ReportAdminCard'

const ADMIN_ID = '2f6ac2bd-23d3-4e70-b859-606b150d1bca'

const STATUS_FLOW = ['raportat', 'in_verificare', 'in_lucru', 'rezolvat']

export default function Admin() {
  const navigate = useNavigate()
  const [loading, setLoading]     = useState(true)
  const [allowed, setAllowed]     = useState(false)
  const [reports, setReports]     = useState([])
  const [filter,  setFilter]      = useState('all')
  const [updating, setUpdating]   = useState(null)
  const [stats, setStats]         = useState({})
  const [noteInputs, setNoteInputs]   = useState({})   // reportId -> draft text
  const [savingNote, setSavingNote]   = useState(null)  // reportId being saved
  const [savedNote, setSavedNote]     = useState(null)  // reportId just saved (flash)

  useEffect(() => { init() }, [])

  async function init() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user || user.id !== ADMIN_ID) {
      navigate('/acasa', { replace: true })
      return
    }
    setAllowed(true)
    await fetchReports()
    setLoading(false)
  }

  async function fetchReports() {
    const { data } = await supabase
      .from('reports')
      .select('id, title, category, status, created_at, address, user_id, description, admin_note, assigned_department, assigned_to')
      .order('created_at', { ascending: false })
    const list = data || []
    setReports(list)
    // Pre-fill note inputs with existing notes
    const inputs = {}
    list.forEach(r => { if (r.admin_note) inputs[r.id] = r.admin_note })
    setNoteInputs(prev => ({ ...inputs, ...prev }))
    const s = {}
    STATUS_FLOW.concat(['respins']).forEach(st => {
      s[st] = list.filter(r => r.status === st).length
    })
    s.total = list.length
    setStats(s)
  }

  async function updateStatus(reportId, newStatus) {
    setUpdating(reportId)
    await supabase.rpc('admin_update_report', { report_id: reportId, new_status: newStatus })
    await fetchReports()
    setUpdating(null)
  }

  async function saveNote(reportId) {
    setSavingNote(reportId)
    const note = (noteInputs[reportId] || '').trim()
    await supabase.rpc('admin_update_report', { report_id: reportId, new_status: (reports.find(r => r.id === reportId)?.status || 'raportat'), new_note: note || null })
    setReports(prev => prev.map(r => r.id === reportId ? { ...r, admin_note: note || null } : r))
    setSavingNote(null)
    setSavedNote(reportId)
    setTimeout(() => setSavedNote(n => n === reportId ? null : n), 2000)
  }

  function handleReportDeleted(reportId) {
    setReports(prev => {
      const next = prev.filter(r => r.id !== reportId)
      const s = {}
      STATUS_FLOW.concat(['respins']).forEach(st => {
        s[st] = next.filter(r => r.status === st).length
      })
      s.total = next.length
      setStats(s)
      return next
    })
  }

  const filtered = filter === 'all' ? reports : reports.filter(r => r.status === filter)

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!allowed) return null

  return (
    <div className="min-h-screen bg-gray-50 pb-8">
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
            { label: 'Total',        value: stats.total,         color: 'text-blue-600' },
            { label: 'Raportate',    value: stats.raportat,      color: 'text-blue-700' },
            { label: 'Verificare',   value: stats.in_verificare, color: 'text-yellow-700' },
            { label: 'În lucru',     value: stats.in_lucru,      color: 'text-orange-600' },
            { label: 'Rezolvate',    value: stats.rezolvat,      color: 'text-green-600' },
            { label: 'Respinse',     value: stats.respins,       color: 'text-red-600' },
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
            filtered.map((report, i) => (
              <ReportAdminCard
                key={report.id}
                report={report}
                isLast={i === filtered.length - 1}
                isUpdating={updating === report.id}
                onUpdateStatus={updateStatus}
                noteDraft={noteInputs[report.id] ?? (report.admin_note || '')}
                isSavingNote={savingNote === report.id}
                justSavedNote={savedNote === report.id}
                onNoteChange={(id, text) => setNoteInputs(prev => ({ ...prev, [id]: text }))}
                onSaveNote={saveNote}
                onDeleted={handleReportDeleted}
              />
            ))
          )}
        </div>
      </div>
    </div>
  )
}
