import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import {
  ArrowLeft, MapPin, Clock, ThumbsUp, MessageCircle,
  User, Send, AlertCircle
} from 'lucide-react'

const CATEGORY_COLORS = {
  'Infrastructură': 'bg-orange-100 text-orange-700',
  'Iluminat':       'bg-yellow-100 text-yellow-700',
  'Trafic':         'bg-red-100 text-red-700',
  'Trotuare':       'bg-purple-100 text-purple-700',
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

  useEffect(() => {
    fetchAll()
  }, [id, user])

  async function fetchAll() {
    setLoading(true)

    // Fetch report
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

    // Fetch reporter profile
    if (rep.user_id) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('username, full_name, avatar_url, points')
        .eq('id', rep.user_id)
        .single()
      setReporter(profile)
    }

    // Fetch comments with profile info
    const { data: comms } = await supabase
      .from('comments')
      .select('id, content, created_at, user_id')
      .eq('report_id', id)
      .order('created_at', { ascending: true })
    setComments(comms || [])

    // Check if current user has voted
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

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto" />
      </div>
    )
  }

  if (notFound) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <AlertCircle size={48} className="text-gray-300 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-gray-900 mb-2">Raport negăsit</h2>
        <p className="text-gray-400 mb-6">Acest raport nu există sau a fost șters.</p>
        <Link to="/acasa" className="text-blue-600 font-medium hover:underline">← Înapoi la Acasă</Link>
      </div>
    )
  }

  const statusInfo = STATUS_CONFIG[report.status] || STATUS_CONFIG['raportat']
  const catColor = CATEGORY_COLORS[report.category] || 'bg-gray-100 text-gray-700'
  const currentStep = STATUS_STEPS.indexOf(report.status)

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 pb-24">
      {/* Back button */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-gray-500 hover:text-gray-900 mb-6 transition-colors"
      >
        <ArrowLeft size={18} />
        <span className="text-sm font-medium">Înapoi</span>
      </button>

      {/* Hero image */}
      {report.image_url && (
        <div className="rounded-2xl overflow-hidden mb-6 shadow-sm">
          <img
            src={report.image_url}
            alt={report.title}
            className="w-full max-h-80 object-cover"
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
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">{report.title}</h1>
        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400">
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
      {report.description && (
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 mb-4">
          <h3 className="font-semibold text-gray-900 mb-2 text-sm">Descriere</h3>
          <p className="text-gray-600 leading-relaxed">{report.description}</p>
        </div>
      )}

      {/* Status timeline */}
      {report.status !== 'respins' && (
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 mb-4">
          <h3 className="font-semibold text-gray-900 mb-4 text-sm">Progres</h3>
          <div className="flex items-center gap-0">
            {STATUS_STEPS.map((step, i) => {
              const done = i <= currentStep
              const active = i === currentStep
              const cfg = STATUS_CONFIG[step]
              return (
                <div key={step} className="flex items-center flex-1 last:flex-none">
                  <div className="flex flex-col items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all ${
                      active ? `${cfg.dot} border-transparent text-white scale-110` :
                      done   ? 'bg-blue-600 border-blue-600 text-white' :
                               'bg-gray-100 border-gray-200 text-gray-400'
                    }`}>
                      {done && !active ? '✓' : i + 1}
                    </div>
                    <span className={`text-xs mt-1.5 font-medium text-center leading-tight ${
                      active ? 'text-gray-900' : done ? 'text-blue-600' : 'text-gray-400'
                    }`} style={{ maxWidth: 60 }}>
                      {cfg.label}
                    </span>
                  </div>
                  {i < STATUS_STEPS.length - 1 && (
                    <div className={`flex-1 h-0.5 mb-5 mx-1 ${i < currentStep ? 'bg-blue-600' : 'bg-gray-200'}`} />
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Reporter info */}
      {reporter && (
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 mb-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center overflow-hidden flex-shrink-0">
            {reporter.avatar_url
              ? <img src={reporter.avatar_url} alt="" className="w-full h-full object-cover" />
              : <User size={18} className="text-blue-600" />
            }
          </div>
          <div>
            <p className="text-xs text-gray-400">Raportat de</p>
            <p className="font-semibold text-gray-900 text-sm">
              {reporter.full_name || reporter.username || 'Anonim'}
            </p>
          </div>
          {reporter.points > 0 && (
            <span className="ml-auto text-xs bg-yellow-50 text-yellow-700 px-2 py-1 rounded-full font-medium">
              ⭐ {reporter.points} pts
            </span>
          )}
        </div>
      )}

      {/* Vote + share row */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={handleVote}
          disabled={votingLoading}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all ${
            hasVoted
              ? 'bg-blue-600 text-white shadow-sm hover:bg-blue-700'
              : 'bg-white border-2 border-gray-200 text-gray-700 hover:border-blue-400'
          }`}
        >
          <ThumbsUp size={16} className={hasVoted ? 'fill-white' : ''} />
          <span>{voteCount} {voteCount === 1 ? 'vot' : 'voturi'}</span>
        </button>
        <span className="flex items-center gap-2 text-sm text-gray-400">
          <MessageCircle size={16} />
          {comments.length} {comments.length === 1 ? 'comentariu' : 'comentarii'}
        </span>
      </div>

      {/* Comments */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-4">
        <div className="px-5 py-4 border-b border-gray-100">
          <h3 className="font-semibold text-gray-900">Comentarii</h3>
        </div>

        {comments.length === 0 ? (
          <div className="px-5 py-8 text-center text-gray-400 text-sm">
            Niciun comentariu încă. Fii primul!
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {comments.map(comment => (
              <div key={comment.id} className="px-5 py-4 flex gap-3">
                <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                  <User size={14} className="text-gray-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-semibold text-gray-700">
                      {comment.user_id === user?.id ? 'Tu' : 'Utilizator'}
                    </span>
                    <span className="text-xs text-gray-400">{timeAgo(comment.created_at)}</span>
                  </div>
                  <p className="text-sm text-gray-700 leading-relaxed">{comment.content}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Add comment */}
        {user ? (
          <form onSubmit={handleComment} className="px-5 py-4 border-t border-gray-100 flex gap-3">
            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
              <User size={14} className="text-blue-600" />
            </div>
            <div className="flex-1 flex gap-2">
              <input
                type="text"
                value={newComment}
                onChange={e => setNewComment(e.target.value)}
                placeholder="Adaugă un comentariu..."
                className="flex-1 text-sm border-2 border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:border-blue-500"
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
          <div className="px-5 py-4 border-t border-gray-100 text-center">
            <Link to="/login" className="text-blue-600 text-sm font-medium hover:underline">
              Conectează-te pentru a comenta
            </Link>
          </div>
        )}
      </div>

      {/* Location coords */}
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
  )
}