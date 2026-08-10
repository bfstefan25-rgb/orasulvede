import { useState } from 'react'
import { supabase } from '../../lib/supabase'
import { CATEGORIES, DEPARTMENTS, suggestDepartment, suggestCategory } from '../../lib/reportTaxonomy'

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

function formatDateTime(date) {
  return new Date(date).toLocaleString('ro-RO', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
}

export default function ReportAdminCard({
  report, isLast, isUpdating, onUpdateStatus,
  noteDraft, isSavingNote, justSavedNote, onNoteChange, onSaveNote,
  onDeleted,
}) {
  const sc = STATUS_COLORS[report.status] || STATUS_COLORS.raportat
  const currentIdx = STATUS_FLOW.indexOf(report.status)
  const nextStatus = currentIdx >= 0 && currentIdx < STATUS_FLOW.length - 1 ? STATUS_FLOW[currentIdx + 1] : null

  const [categoryDraft, setCategoryDraft] = useState(report.category)
  const [savingCategory, setSavingCategory] = useState(false)
  const [savedCategory, setSavedCategory] = useState(false)
  const suggestion = suggestCategory(`${report.title} ${report.description || ''}`)

  const [departmentDraft, setDepartmentDraft] = useState(report.assigned_department || suggestDepartment(report.category))
  const [assigneeDraft, setAssigneeDraft] = useState(report.assigned_to || '')
  const [savingRouting, setSavingRouting] = useState(false)
  const [savedRouting, setSavedRouting] = useState(false)

  const [historyOpen, setHistoryOpen] = useState(false)
  const [historyLoading, setHistoryLoading] = useState(false)
  const [history, setHistory] = useState(null)
  const [historyError, setHistoryError] = useState(null)

  const [deleteConfirm, setDeleteConfirm] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState(null)

  async function saveCategory() {
    setSavingCategory(true)
    const { error } = await supabase.rpc('admin_update_category', { report_id: report.id, new_category: categoryDraft })
    setSavingCategory(false)
    if (!error) {
      setSavedCategory(true)
      setTimeout(() => setSavedCategory(false), 2000)
    }
  }

  async function saveRouting() {
    setSavingRouting(true)
    const { error } = await supabase.rpc('admin_update_routing', {
      report_id: report.id, department: departmentDraft, assignee: assigneeDraft.trim() || null,
    })
    setSavingRouting(false)
    if (!error) {
      setSavedRouting(true)
      setTimeout(() => setSavedRouting(false), 2000)
    }
  }

  async function handleDelete() {
    if (!deleteConfirm) { setDeleteConfirm(true); return }
    setDeleting(true)
    setDeleteError(null)
    const { error } = await supabase.rpc('admin_delete_report', { p_report_id: report.id })
    if (error) {
      setDeleteError(error.message)
      setDeleting(false)
      setDeleteConfirm(false)
      return
    }
    onDeleted(report.id)
  }

  async function toggleHistory() {
    if (historyOpen) { setHistoryOpen(false); return }
    setHistoryOpen(true)
    if (history !== null || historyLoading) return
    setHistoryLoading(true)
    setHistoryError(null)
    const { data, error } = await supabase.rpc('get_status_history', { p_report_id: report.id })
    setHistoryLoading(false)
    if (error) setHistoryError(error.message)
    else setHistory(data || [])
  }

  return (
    <div className={`p-4 ${!isLast ? 'border-b border-gray-100' : ''} ${isUpdating ? 'opacity-50' : ''} transition-opacity`}>
      {/* Title + badges */}
      <div className="flex flex-wrap items-center gap-2 mb-2">
        <span className="font-bold text-sm text-gray-900 mr-1">{report.title}</span>
        <span style={{ background: sc.bg, color: sc.color }} className="rounded-full px-2.5 py-0.5 text-xs font-bold">
          {STATUS_LABELS[report.status]}
        </span>
        <span className="bg-gray-100 text-gray-500 rounded-full px-2.5 py-0.5 text-xs">
          {report.category}
        </span>
        {report.assigned_department && (
          <span className="bg-purple-50 text-purple-600 rounded-full px-2.5 py-0.5 text-xs font-semibold">
            🏢 {report.assigned_department}
          </span>
        )}
        {report.admin_note && (
          <span className="bg-blue-50 text-blue-600 rounded-full px-2.5 py-0.5 text-xs font-semibold">
            📣 Notă oficială
          </span>
        )}
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

      {/* Status actions */}
      <div className="flex flex-wrap gap-2 mb-4">
        {nextStatus && (
          <button
            onClick={() => onUpdateStatus(report.id, nextStatus)}
            disabled={isUpdating}
            className="bg-blue-600 text-white rounded-xl px-3 py-2 text-xs font-bold hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {isUpdating ? '...' : `→ ${STATUS_LABELS[nextStatus]}`}
          </button>
        )}
        {report.status !== 'rezolvat' && report.status !== 'respins' && (
          <button
            onClick={() => onUpdateStatus(report.id, 'respins')}
            disabled={isUpdating}
            className="bg-white text-red-600 border border-red-200 rounded-xl px-3 py-2 text-xs font-bold hover:bg-red-50 transition-colors"
          >
            ✕ Respinge
          </button>
        )}
        {(report.status === 'rezolvat' || report.status === 'respins') && (
          <button
            onClick={() => onUpdateStatus(report.id, 'raportat')}
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
        <button
          onClick={toggleHistory}
          className="bg-gray-100 text-gray-700 rounded-xl px-3 py-2 text-xs font-semibold hover:bg-gray-200 transition-colors"
        >
          {historyOpen ? '▲' : '▼'} Istoric status
        </button>
        <button
          onClick={handleDelete}
          onBlur={() => setDeleteConfirm(false)}
          disabled={deleting}
          className={`rounded-xl px-3 py-2 text-xs font-bold transition-colors ml-auto ${
            deleteConfirm
              ? 'bg-red-600 text-white hover:bg-red-700'
              : 'bg-white text-red-600 border border-red-200 hover:bg-red-50'
          } disabled:opacity-50`}
        >
          {deleting ? 'Se șterge...' : deleteConfirm ? 'Confirmă ștergerea' : '🗑️ Șterge'}
        </button>
      </div>

      {deleteError && (
        <p className="text-xs text-red-600 mb-3">Eroare la ștergere: {deleteError}</p>
      )}

      {historyOpen && (
        <div className="mb-4 bg-gray-50 border border-gray-200 rounded-xl p-3 text-xs">
          {historyLoading && <p className="text-gray-400">Se încarcă...</p>}
          {historyError && <p className="text-red-600">Eroare: {historyError}</p>}
          {history && history.length === 0 && <p className="text-gray-400">Niciun istoric înregistrat.</p>}
          {history && history.length > 0 && (
            <ul className="space-y-1">
              {history.map((h, i) => (
                <li key={i} className="flex justify-between gap-3 text-gray-600">
                  <span>
                    {h.old_status ? `${STATUS_LABELS[h.old_status] || h.old_status} → ` : 'Creat: '}
                    <strong>{STATUS_LABELS[h.new_status] || h.new_status}</strong>
                  </span>
                  <span className="text-gray-400 shrink-0">{formatDateTime(h.changed_at)}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* Category correction */}
      <div className="border border-gray-200 bg-gray-50 rounded-xl p-3 mb-3">
        <p className="text-xs font-semibold text-gray-600 mb-2">Categorie</p>
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={categoryDraft}
            onChange={e => setCategoryDraft(e.target.value)}
            className="text-xs border border-gray-200 bg-white rounded-lg px-2 py-1.5 text-gray-800"
          >
            {CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
          </select>
          {suggestion && suggestion !== categoryDraft && (
            <button
              onClick={() => setCategoryDraft(suggestion)}
              className="text-xs text-primary-600 hover:underline"
            >
              Sugestie: {suggestion}
            </button>
          )}
          <button
            onClick={saveCategory}
            disabled={savingCategory || categoryDraft === report.category}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
              savedCategory ? 'bg-green-500 text-white' : 'bg-gray-700 text-white hover:bg-gray-800 disabled:opacity-40'
            }`}
          >
            {savingCategory ? '...' : savedCategory ? '✓ Salvat' : 'Salvează'}
          </button>
        </div>
      </div>

      {/* Routing / assignment */}
      <div className="border border-gray-200 bg-gray-50 rounded-xl p-3 mb-3">
        <p className="text-xs font-semibold text-gray-600 mb-2">Alocare</p>
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={departmentDraft}
            onChange={e => setDepartmentDraft(e.target.value)}
            className="text-xs border border-gray-200 bg-white rounded-lg px-2 py-1.5 text-gray-800"
          >
            {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
          <input
            type="text"
            placeholder="Persoană responsabilă (opțional)"
            value={assigneeDraft}
            onChange={e => setAssigneeDraft(e.target.value)}
            className="text-xs border border-gray-200 bg-white rounded-lg px-2 py-1.5 text-gray-800 flex-1 min-w-[160px]"
          />
          <button
            onClick={saveRouting}
            disabled={savingRouting}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
              savedRouting ? 'bg-green-500 text-white' : 'bg-gray-700 text-white hover:bg-gray-800 disabled:opacity-40'
            }`}
          >
            {savingRouting ? '...' : savedRouting ? '✓ Salvat' : 'Salvează'}
          </button>
        </div>
      </div>

      {/* Admin note */}
      <div className="border border-blue-100 bg-blue-50 rounded-xl p-3">
        <p className="text-xs font-semibold text-blue-700 mb-2">📣 Notă oficială publică</p>
        <textarea
          rows={2}
          placeholder="Ex: Echipa de intervenție a fost programată pentru 28 aprilie..."
          value={noteDraft}
          onChange={e => onNoteChange(report.id, e.target.value)}
          className="w-full text-xs border border-blue-200 bg-white rounded-lg px-3 py-2 text-gray-800 placeholder-gray-400 focus:outline-none focus:border-blue-400 resize-none"
        />
        <div className="flex items-center justify-between mt-2">
          <span className="text-[11px] text-blue-400">Vizibilă public pe pagina raportului</span>
          <button
            onClick={() => onSaveNote(report.id)}
            disabled={isSavingNote}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
              justSavedNote
                ? 'bg-green-500 text-white'
                : 'bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50'
            }`}
          >
            {isSavingNote ? '...' : justSavedNote ? '✓ Salvat' : 'Salvează'}
          </button>
        </div>
      </div>
    </div>
  )
}
