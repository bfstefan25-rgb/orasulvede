import { useEffect, useState } from 'react'
import { useSEO } from '../hooks/useSEO'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import {
  ArrowLeft, MapPin, Clock, ThumbsUp, MessageCircle,
  User, Send, AlertCircle, Trash2, Pencil, Check, X, Share2
} from 'lucide-react'

const CATEGORY_COLORS = {
  'Infrastructură': 'bg-orange-100 text-orange-700',
  'Iluminat':       'bg-yellow-100 text-yellow-700',
  'Trafic':         'bg-red-100 text-red-700',
  'Canalizare':       'bg-purple-100 text-purple-700',
  'Parcuri':        'bg-green-100 text-green-700',
  'Gunoi':          'bg-gray-100 text-gray-700',
  'Animale':        'bg-blue-100 text-blue-700',
  'Alte pericole':  'bg-red-100 text-red-700',
}

const STATUS_CONFIG = {
  raportat:      { label: 'Raportat',      bg: 'bg-blue-100',   text: 'text-blue-700',   dot: 'bg-blue-500',   step: 1 },
  in_verificare: { label: 'În verificare', bg: 'bg-yellow-100', text: 'text-yellow-700', dot: 'bg-yellow-500', step: 2 },
  in_lucru:      { label: 'În lucru',      bg: 'bg-orange-100', text: 'text-orange-700', dot: 'bg-orange-500', step: 3 },
  rezolvat:      { label: 'Rezolvat',      bg: 'bg-green-100',  text: 'text-green-700',  dot: 'bg-green-500',  step: 4 },
  respins:       { label: 'Respins',       bg: 'bg-red-100',    text: 'text-red-700',    dot: 'bg-red-500',    step: 0 },
}

const STATUS_STEPS = ['raportat', 'in_verificare', 'in_lucru', 'rezolvat']

function timeAgo(date) {
  const diff = Date.now() - new Date(date)
  const mins = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)
  if (mins < 1) return 'acum'
  if (mins < 60) return `${mins} min`
  if (hours < 24) return `${hours}h`
  if (days === 1) return 'ieri'
  return `${days} zile în urmă`
}

export default function ReportDetail() {
  const { id } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()

  const [report, setReport] = useState(null)
  const [reporter, setReporter] = useState(null)
  const [comments, setComments] = useState([])
  const [hasVoted, setHasVoted] = useState(false)
  const [voteCount, setVoteCount] = useState(0)
  const [newComment, setNewComment] = useState('')
  const [submittingComment, setSubmittingComment] = useState(false)
  const [votingLoading, setVotingLoading] = useState(false)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [editing, setEditing] = useState(false)
  const [editTitle, setEditTitle] = useState('')
  const [editDesc, setEditDesc] = useState('')
  const [saving, setSaving] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [copied, setCopied] = useState(false)
  const [zoomOpen, setZoomOpen] = useState(false)

  useSEO({
    title: report?.title,
    description: report?.description ? report.description.slice(0, 150) : report ? `${report.category} — ${report.address || 'Orașul tău'}` : undefined,
    image: report?.image_url || undefined,
  })

  useEffect(() => { fetchAll() }, [id, user])

  async function fetchAll() {
    setLoading(true)

    const { data: rep, error } = await supabase
      .from('reports')
      .select('*')
      .eq('id', id)
      .single()

    if (error || !rep) {
      setNotFound(true)
      setLoading(false)
      return
    }
    setReport(rep)
    setVoteCount(rep.votes_count || 0)

    if (rep.user_id) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('username, full_name, avatar_url, points')
        .eq('id', rep.user_id)
        .single()
      setReporter(profile)
    }

    const { data: comms } = await supabase
      .from('comments')
      .select('id, content, created_at, user_id')
      .eq('report_id', id)
      .order('created_at', { ascending: true })
    setComments(comms || [])

    if (user) {
      const { data: vote } = await supabase
        .from('votes')
        .select('id')
        .eq('report_id', id)
        .eq('user_id', user.id)
        .single()
      setHasVoted(!!vote)
    }

    setLoading(false)
  }

  async function handleVote() {
    if (!user) { navigate('/login'); return }
    if (votingLoading) return
    setVotingLoading(true)

    if (hasVoted) {
      await supabase.from('votes').delete().eq('report_id', id).eq('user_id', user.id)
      setHasVoted(false)
      setVoteCount(v => Math.max(0, v - 1))
    } else {
      await supabase.from('votes').insert({ report_id: id, user_id: user.id })
      setHasVoted(true)
      setVoteCount(v => v + 1)
    }
    setVotingLoading(false)
  }

  async function handleComment(e) {
    e.preventDefault()
    if (!user) { navigate('/login'); return }
    if (!newComment.trim()) return
    setSubmittingComment(true)

    const { data, error } = await supabase
      .from('comments')
      .insert({ report_id: id, user_id: user.id, content: newComment.trim() })
      .select()
      .single()

    if (!error && data) {
      setComments(prev => [...prev, data])
      setNewComment('')
    }
    setSubmittingComment(false)
  }

  async function saveEdit() {
    if (!editTitle.trim()) return
    setSaving(true)
    const { error } = await supabase
      .from('reports')
      .update({ title: editTitle.trim(), description: editDesc.trim() })
      .eq('id', id)
    if (!error) {
      setReport(prev => ({ ...prev, title: editTitle.trim(), description: editDesc.trim() }))
      setEditing(false)
    }
    setSaving(false)
  }

  async function deleteReport() {
    setDeleting(true)
    await supabase.from('votes').delete().eq('report_id', id)
    await supabase.from('comments').delete().eq('report_id', id)
    await supabase.from('reports').delete().eq('id', id)
    navigate('/acasa')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
      </div>
    )
  }

  if (notFound) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col items-center justify-center px-4 text-center">
        <AlertCircle size={48} className="text-gray-300 dark:text-gray-600 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Raport negăsit</h2>
        <p className="text-gray-400 dark:text-gray-500 mb-6">Acest raport nu există sau a fost șters.</p>
        <Link to="/acasa" className="text-blue-600 font-medium hover:underline">← Înapoi la Acasă</Link>
      </div>
    )
  }


  const statusInfo = STATUS_CONFIG[report.status] || STATUS_CONFIG['raportat']
  const catColor = CATEGORY_COLORS[report.category] || 'bg-gray-100 text-gray-700'
  const currentStep = STATUS_STEPS.indexOf(report.status)

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors">
      <div className="max-w-2xl mx-auto px-4 py-6 pb-24">

        {/* Back button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-6 transition-colors"
        >
          <ArrowLeft size={18} />
          <span className="text-sm font-medium">Înapoi</span>
        </button>

        {/* Hero image */}
        {report.image_url && (
          <div
            className="rounded-2xl overflow-hidden mb-6 shadow-sm cursor-zoom-in"
            onClick={() => setZoomOpen(true)}
          >
            <img
              src={report.image_url}
              alt={report.title}
              className="w-full max-h-80 object-cover"
            />
          </div>
        )}

        {/* Image zoom lightbox */}
        {zoomOpen && report.image_url && (
          <div
            className="fixed inset-0 z-[9999] bg-black/90 flex items-center justify-center p-4"
            onClick={() => setZoomOpen(false)}
          >
            <button
              className="absolute top-4 right-4 text-white/80 hover:text-white bg-black/40 rounded-full p-2"
              onClick={() => setZoomOpen(false)}
            >
              <X size={24} />
            </button>
            <img
              src={report.image_url}
              alt={report.title}
              className="max-w-full max-h-full rounded-xl object-contain"
              onClick={e => e.stopPropagation()}
            />
          </div>
        )}

        {/* Title + badges */}
        <div className="mb-4">
          <div className="flex flex-wrap gap-2 mb-3">
            <span className={`text-xs font-semibold px-3 py-1 rounded-full ${catColor}`}>
              {report.category}
            </span>
            <span className={`text-xs font-semibold px-3 py-1 rounded-full ${statusInfo.bg} ${statusInfo.text}`}>
              {statusInfo.label}
            </span>
            {/* Owner actions */}
            {user?.id === report.user_id && !editing && (
              <div className="ml-auto flex items-center gap-2">
                <button
                  onClick={() => { setEditTitle(report.title); setEditDesc(report.description || ''); setEditing(true) }}
                  className="flex items-center gap-1.5 text-xs font-medium text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white px-3 py-1 rounded-full border border-gray-200 dark:border-gray-700 hover:border-gray-400 transition-colors"
                >
                  <Pencil size={12} /> Editează
                </button>
                <button
                  onClick={() => setDeleteConfirm(true)}
                  className="flex items-center gap-1.5 text-xs font-medium text-red-500 hover:text-red-700 px-3 py-1 rounded-full border border-red-200 hover:border-red-400 transition-colors"
                >
                  <Trash2 size={12} /> Șterge
                </button>
              </div>
            )}
          </div>

          {/* Delete confirmation */}
          {deleteConfirm && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 mb-4">
              <p className="text-sm font-semibold text-red-700 dark:text-red-400 mb-1">Ești sigur că vrei să ștergi acest raport?</p>
              <p className="text-xs text-red-500 dark:text-red-400 mb-3">Această acțiune este ireversibilă.</p>
              <div className="flex gap-2">
                <button onClick={() => setDeleteConfirm(false)} className="flex-1 py-2 rounded-xl border border-gray-200 dark:border-gray-600 text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">Anulează</button>
                <button onClick={deleteReport} disabled={deleting} className="flex-1 py-2 rounded-xl bg-red-600 text-white text-sm font-medium hover:bg-red-700 transition-colors disabled:opacity-60">
                  {deleting ? 'Se șterge...' : 'Șterge'}
                </button>
              </div>
            </div>
          )}

          {editing ? (
            <div className="space-y-3 mb-4">
              <input
                type="text"
                value={editTitle}
                onChange={e => setEditTitle(e.target.value)}
                className="w-full h-11 border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white rounded-xl px-4 text-base focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="Titlu"
              />
              <textarea
                value={editDesc}
                onChange={e => setEditDesc(e.target.value)}
                rows={3}
                className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                placeholder="Descriere"
              />
              <div className="flex gap-2">
                <button onClick={() => setEditing(false)} className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-600 text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-50 transition-colors">
                  <X size={14} /> Anulează
                </button>
                <button onClick={saveEdit} disabled={saving || !editTitle.trim()} className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary-600 text-white text-sm font-medium hover:bg-primary-700 transition-colors disabled:opacity-60">
                  <Check size={14} /> {saving ? 'Se salvează...' : 'Salvează'}
                </button>
              </div>
            </div>
          ) : (
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{report.title}</h1>
          )}

          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400 dark:text-gray-500">
            {report.address && (
              <span className="flex items-center gap-1">
                <MapPin size={14} />
                {report.address}
              </span>
            )}
            <span className="flex items-center gap-1">
              <Clock size={14} />
              {timeAgo(report.created_at)}
            </span>
          </div>
        </div>

        {/* Description */}
        {!editing && report.description && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-700 mb-4">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2 text-sm">Descriere</h3>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">{report.description}</p>
          </div>
        )}

        {/* Status timeline */}
        {report.status !== 'respins' && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-700 mb-4">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4 text-sm">Progres</h3>

            {/* Row 1 — circles + connector lines */}
            <div className="flex items-center mb-2">
              {STATUS_STEPS.map((step, i) => {
                const done = i <= currentStep
                const active = i === currentStep
                const cfg = STATUS_CONFIG[step]
                return (
                  <div key={step} className="flex items-center flex-1 last:flex-none">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 flex-shrink-0 transition-all ${
                      active ? `${cfg.dot} border-transparent text-white` :
                      done   ? 'bg-blue-600 border-blue-600 text-white' :
                               'bg-gray-100 dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-400'
                    }`}>
                      {done && !active ? '✓' : i + 1}
                    </div>
                    {i < STATUS_STEPS.length - 1 && (
                      <div className={`flex-1 h-0.5 mx-1 ${i < currentStep ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'}`} />
                    )}
                  </div>
                )
              })}
            </div>

            {/* Row 2 — labels, mirroring the same flex skeleton so each label sits under its circle */}
            <div className="flex">
              {STATUS_STEPS.map((step, i) => {
                const done = i <= currentStep
                const active = i === currentStep
                const cfg = STATUS_CONFIG[step]
                return (
                  <div key={step} className="flex items-start flex-1 last:flex-none">
                    <div className="relative w-8 flex-shrink-0">
                      <span className={`absolute left-1/2 -translate-x-1/2 whitespace-nowrap text-[10px] font-medium leading-tight ${
                        active ? 'text-gray-900 dark:text-white' : done ? 'text-blue-600' : 'text-gray-400 dark:text-gray-500'
                      }`}>
                        {cfg.label}
                      </span>
                    </div>
                    {i < STATUS_STEPS.length - 1 && <div className="flex-1 mx-1" />}
                  </div>
                )
              })}
            </div>

          </div>
        )}

        {/* Reporter info */}
        {reporter && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-gray-700 mb-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center overflow-hidden flex-shrink-0">
              {reporter.avatar_url
                ? <img src={reporter.avatar_url} alt="" className="w-full h-full object-cover" />
                : <User size={18} className="text-blue-600" />
              }
            </div>
            <div>
              <p className="text-xs text-gray-400 dark:text-gray-500">Raportat de</p>
              <p className="font-semibold text-gray-900 dark:text-white text-sm">
                {reporter.full_name || reporter.username || 'Anonim'}
              </p>
            </div>
            {reporter.points > 0 && (
              <span className="ml-auto text-xs bg-yellow-50 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 px-2 py-1 rounded-full font-medium">
                ⭐ {reporter.points} pts
              </span>
            )}
          </div>
        )}

        {/* Vote + Share row */}
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={handleVote}
            disabled={votingLoading}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all ${
              hasVoted
                ? 'bg-blue-600 text-white shadow-sm hover:bg-blue-700'
                : 'bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-blue-400'
            }`}
          >
            <ThumbsUp size={16} className={hasVoted ? 'fill-white' : ''} />
            <span>{voteCount} {voteCount === 1 ? 'vot' : 'voturi'}</span>
          </button>
          <span className="flex items-center gap-2 text-sm text-gray-400 dark:text-gray-500">
            <MessageCircle size={16} />
            {comments.length} {comments.length === 1 ? 'comentariu' : 'comentarii'}
          </span>
          <button
            onClick={() => {
              navigator.clipboard.writeText(window.location.href)
              setCopied(true)
              setTimeout(() => setCopied(false), 2000)
            }}
            className={`ml-auto flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium border transition-all ${
              copied
                ? 'bg-green-50 dark:bg-green-900/20 border-green-300 text-green-600 dark:text-green-400'
                : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:border-blue-400'
            }`}
          >
            {copied ? <Check size={15} /> : <Share2 size={15} />}
            {copied ? 'Copiat!' : 'Distribuie'}
          </button>
        </div>

        {/* Comments */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden mb-4">
          <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-700">
            <h3 className="font-semibold text-gray-900 dark:text-white">Comentarii</h3>
          </div>

          {comments.length === 0 ? (
            <div className="px-5 py-8 text-center text-gray-400 dark:text-gray-500 text-sm">
              Niciun comentariu încă. Fii primul!
            </div>
          ) : (
            <div className="divide-y divide-gray-50 dark:divide-gray-700">
              {comments.map(comment => (
                <div key={comment.id} className="px-5 py-4 flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center flex-shrink-0">
                    <User size={14} className="text-gray-400 dark:text-gray-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                        {comment.user_id === user?.id ? 'Tu' : 'Utilizator'}
                      </span>
                      <span className="text-xs text-gray-400 dark:text-gray-500">{timeAgo(comment.created_at)}</span>
                    </div>
                    <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{comment.content}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Add comment */}
          {user ? (
            <form onSubmit={handleComment} className="px-5 py-4 border-t border-gray-100 dark:border-gray-700 flex gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center flex-shrink-0">
                <User size={14} className="text-blue-600" />
              </div>
              <div className="flex-1 flex gap-2">
                <input
                  type="text"
                  value={newComment}
                  onChange={e => setNewComment(e.target.value)}
                  placeholder="Adaugă un comentariu..."
                  className="flex-1 text-sm border-2 border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 rounded-xl px-3 py-2 focus:outline-none focus:border-blue-500 transition-colors"
                />
                <button
                  type="submit"
                  disabled={submittingComment || !newComment.trim()}
                  className="bg-blue-600 text-white p-2 rounded-xl hover:bg-blue-700 disabled:opacity-40 transition-colors"
                >
                  <Send size={16} />
                </button>
              </div>
            </form>
          ) : (
            <div className="px-5 py-4 border-t border-gray-100 dark:border-gray-700 text-center">
              <Link to="/login" className="text-blue-600 text-sm font-medium hover:underline">
                Conectează-te pentru a comenta
              </Link>
            </div>
          )}
        </div>

        {/* Google Maps link */}
        {(report.latitude && report.longitude) && (
          <a
            href={`https://www.google.com/maps?q=${report.latitude},${report.longitude}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-sm text-blue-600 hover:underline"
          >
            <MapPin size={14} />
            Vezi pe Google Maps ({report.latitude.toFixed(4)}, {report.longitude.toFixed(4)})
          </a>
        )}

      </div>
    </div>
  )
}