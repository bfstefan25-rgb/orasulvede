import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { MapPin, ThumbsUp, MessageCircle, Clock, Plus } from 'lucide-react'

const CATEGORIES = [
  { id: 'toate', label: 'Toate' },
  { id: 'Infrastructură', label: 'Infrastructură', color: 'bg-orange-100 text-orange-700' },
  { id: 'Iluminat',       label: 'Iluminat',       color: 'bg-yellow-100 text-yellow-700' },
  { id: 'Trafic',         label: 'Trafic',         color: 'bg-red-100 text-red-700' },
  { id: 'Trotuare',       label: 'Trotuare',       color: 'bg-purple-100 text-purple-700' },
  { id: 'Parcuri',        label: 'Parcuri',        color: 'bg-green-100 text-green-700' },
  { id: 'Gunoi',          label: 'Gunoi',          color: 'bg-gray-100 text-gray-700' },
  { id: 'Animale',        label: 'Animale',        color: 'bg-blue-100 text-blue-700' },
  { id: 'Alte pericole',  label: 'Alte pericole',  color: 'bg-red-100 text-red-700' },
]

const STATUS_COLORS = {
  raportat:      'bg-blue-100 text-blue-700',
  in_verificare: 'bg-yellow-100 text-yellow-700',
  in_lucru:      'bg-orange-100 text-orange-700',
  rezolvat:      'bg-green-100 text-green-700',
  respins:       'bg-red-100 text-red-700',
}

const STATUS_LABELS = {
  raportat:      'Raportat',
  in_verificare: 'În verificare',
  in_lucru:      'În lucru',
  rezolvat:      'Rezolvat',
  respins:       'Respins',
}

function timeAgo(date) {
  const days = Math.floor((Date.now() - new Date(date)) / 86400000)
  if (days === 0) return 'azi'
  if (days === 1) return 'ieri'
  return `${days} zile în urmă`
}

export default function Home() {
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeCategory, setActiveCategory] = useState('toate')
  const [activeTab, setActiveTab] = useState('recente')

  useEffect(() => {
    fetchReports()
  }, [])

  const fetchReports = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('reports')
      .select('*')
      .order('created_at', { ascending: false })
    if (!error) setReports(data || [])
    setLoading(false)
  }

  const filtered = reports.filter(r =>
    activeCategory === 'toate' || r.category === activeCategory
  )

  const sorted = [...filtered].sort((a, b) => {
    if (activeTab === 'populare') return (b.votes_count || 0) - (a.votes_count || 0)
    return new Date(b.created_at) - new Date(a.created_at)
  })

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 pb-24 md:pb-6">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { label: 'Total probleme', value: reports.length,                                     color: 'text-blue-600',   bg: 'bg-blue-50' },
          { label: 'În lucru',       value: reports.filter(r => r.status === 'in_lucru').length, color: 'text-orange-600', bg: 'bg-orange-50' },
          { label: 'Rezolvate',      value: reports.filter(r => r.status === 'rezolvat').length, color: 'text-green-600',  bg: 'bg-green-50' },
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

      {/* Feed header */}
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Feed probleme oraș</h1>
      <p className="text-gray-400 mb-6">Urmărește și votează problemele raportate în comunitatea ta.</p>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        {['recente', 'populare'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              activeTab === tab
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-600 border border-gray-200 hover:border-blue-300'
            }`}
          >
            {tab === 'recente' ? 'Recente' : 'Populare'}
          </button>
        ))}
      </div>

      {/* Category filter */}
      <div className="flex gap-2 flex-wrap mb-6">
        {CATEGORIES.map(cat => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all border ${
              activeCategory === cat.id
                ? 'bg-gray-900 text-white border-gray-900'
                : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Reports grid */}
      {loading ? (
        <div className="text-center py-20 text-gray-400">Se încarcă...</div>
      ) : sorted.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-gray-400 text-lg mb-2">Nicio problemă raportată încă</p>
          <Link to="/raporteaza" className="text-blue-600 font-medium hover:underline">
            Fii primul care raportează!
          </Link>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          {sorted.map(report => (
            <Link
              key={report.id}
              to={`/raport/${report.id}`}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow block"
            >
              {report.image_url && (
                <div className="relative">
                  <img
                    src={report.image_url}
                    alt={report.title}
                    className="w-full h-48 object-cover"
                  />
                  <span className={`absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-semibold ${STATUS_COLORS[report.status] || 'bg-gray-100 text-gray-700'}`}>
                    {STATUS_LABELS[report.status] || report.status}
                  </span>
                </div>
              )}
              <div className="p-4">
                {!report.image_url && (
                  <span className={`text-xs font-semibold px-2 py-1 rounded-full ${STATUS_COLORS[report.status] || 'bg-gray-100 text-gray-700'}`}>
                    {STATUS_LABELS[report.status] || report.status}
                  </span>
                )}
                <span className={`text-xs font-medium px-2 py-1 rounded-full ${CATEGORIES.find(c => c.id === report.category)?.color || 'bg-gray-100 text-gray-600'}`}>
                  {report.category}
                </span>
                <h3 className="font-bold text-gray-900 mt-2 mb-1">{report.title}</h3>
                {report.address && (
                  <div className="flex items-center gap-1 text-gray-400 text-sm mb-3">
                    <MapPin size={14} />
                    <span>{report.address}</span>
                  </div>
                )}
                <div className="flex items-center justify-between text-gray-400 text-sm">
                  <div className="flex items-center gap-1">
                    <Clock size={14} />
                    <span>{timeAgo(report.created_at)}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1">
                      <ThumbsUp size={14} />
                      <span>{report.votes_count || 0}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MessageCircle size={14} />
                      <span>{report.comments_count || 0}</span>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* FAB for mobile */}
      <Link
        to="/raporteaza"
        className="fixed bottom-20 right-6 md:hidden bg-blue-600 text-white w-14 h-14 rounded-full shadow-lg flex items-center justify-center hover:bg-blue-700 transition-colors z-40"
      >
        <Plus size={24} />
      </Link>
    </div>
  )
}