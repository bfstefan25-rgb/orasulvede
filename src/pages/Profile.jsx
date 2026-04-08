import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { Link, useNavigate } from 'react-router-dom'
import {
  MapPin, CheckCircle, Trophy, TrendingUp,
  LogOut, Clock, ChevronRight, User, Settings, X, Save, Trash2
} from 'lucide-react'
import { useSettings } from '../context/SettingsContext'

const STATUS_COLORS = {
  raportat:      'bg-blue-100 text-blue-700',
  in_verificare: 'bg-yellow-100 text-yellow-700',
  in_lucru:      'bg-orange-100 text-orange-700',
  rezolvat:      'bg-green-100 text-green-700',
  respins:       'bg-red-100 text-red-700',
}
const STATUS_LABELS = {
  raportat: 'Raportat', in_verificare: 'În verificare',
  in_lucru: 'În lucru', rezolvat: 'Rezolvat', respins: 'Respins',
}

const LEVELS = [
  { level:1,  name:'Observator',        min:0,   color:'#9ca3af', badge:'👁️' },
  { level:2,  name:'Cetățean Activ',    min:5,   color:'#3b82f6', badge:'🙋' },
  { level:3,  name:'Voluntar Civic',    min:15,  color:'#10b981', badge:'🌱' },
  { level:4,  name:'Reporter Urban',    min:30,  color:'#f59e0b', badge:'📰' },
  { level:5,  name:'Gardian Comunitar', min:50,  color:'#f97316', badge:'🛡️' },
  { level:6,  name:'Vocea Cartierului', min:75,  color:'#ef4444', badge:'📢' },
  { level:7,  name:'Erou Local',        min:110, color:'#8b5cf6', badge:'🦸' },
  { level:8,  name:'Campion Civic',     min:150, color:'#ec4899', badge:'🏅' },
  { level:9,  name:'Ambasador Urban',   min:200, color:'#06b6d4', badge:'🌟' },
  { level:10, name:'Legenda Orașului',  min:300, color:'#f59e0b', badge:'👑' },
]

function getLevel(rc) {
  let cur = LEVELS[0]
  for (const l of LEVELS) { if (rc >= l.min) cur = l }
  const next = LEVELS.find(l => l.level === cur.level + 1)
  const progress = next ? Math.round(((rc - cur.min) / (next.min - cur.min)) * 100) : 100
  return { ...cur, nextLevel: next, progress }
}

const BADGES_CONFIG = [
  { id:'first_report', icon:'🏆', title:'Primul raport',        desc:'Ai trimis primul tău raport',          check:(s)=>s.reports_count>=1   },
  { id:'active',       icon:'⚡', title:'Contributor Activ',     desc:'Ai trimis peste 5 rapoarte',           check:(s)=>s.reports_count>=5   },
  { id:'hero',         icon:'🦸', title:'Erou Local',            desc:'Ai rezolvat 3 probleme',               check:(s)=>s.resolved_count>=3  },
  { id:'explorer',     icon:'🧭', title:'Explorator Urban',      desc:'Ai trimis peste 10 rapoarte',          check:(s)=>s.reports_count>=10  },
  { id:'guardian',     icon:'🛡️', title:'Gardianul Cartierului', desc:'Ai acumulat peste 100 de puncte',      check:(s)=>s.points>=100        },
  { id:'reporter',     icon:'📰', title:'Reporter Urban',        desc:'Ai ajuns la 30 de rapoarte',           check:(s)=>s.reports_count>=30  },
  { id:'champion',     icon:'🏅', title:'Campion Civic',         desc:'Ai ajuns la 150 de rapoarte',          check:(s)=>s.reports_count>=150 },
  { id:'legend',       icon:'👑', title:'Legenda Orașului',      desc:'Ai ajuns la 300 de rapoarte',          check:(s)=>s.reports_count>=300 },
]

const DEFAULT_SETTINGS = {
  displayName: '',
  profilPublic: true,
  arataNivel: true,
  arataBadge: true,
  notifDepasit: true,
  tema: 'luminos',
  textMare: false,
  urmaresteCartier: false,
  rezumatSaptamanal: false,
}

function Toggle({ value, onChange }) {
  return (
    <button
      onClick={() => onChange(!value)}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${value ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-600'}`}
    >
      <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${value ? 'translate-x-6' : 'translate-x-1'}`} />
    </button>
  )
}

function timeAgo(date) {
  const days = Math.floor((Date.now() - new Date(date)) / 86400000)
  if (days === 0) return 'azi'
  if (days === 1) return 'ieri'
  return `${days} zile în urmă`
}

export default function Profile() {
  const navigate = useNavigate()
  const { setSettings: applyToContext } = useSettings()
  const [authUser,  setAuthUser]  = useState(null)
  const [profile,   setProfile]   = useState(null)
  const [myReports, setMyReports] = useState([])
  const [myRank,    setMyRank]    = useState(null)
  const [loading,   setLoading]   = useState(true)
  const [showSettings, setShowSettings] = useState(false)
  const [settings, setSettings]   = useState(DEFAULT_SETTINGS)
  const [saving,   setSaving]     = useState(false)
  const [saveMsg,  setSaveMsg]    = useState('')
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  useEffect(() => { fetchAll() }, [])

  async function fetchAll() {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    setAuthUser(user)
    if (!user) { setLoading(false); return }
    const { data: prof } = await supabase.from('profiles').select('*').eq('id', user.id).single()
    setProfile(prof)
    if (prof?.settings) setSettings({ ...DEFAULT_SETTINGS, ...prof.settings })
    const { data: reports } = await supabase.from('reports').select('id,title,category,status,created_at,image_url,address').eq('user_id', user.id).order('created_at', { ascending: false })
    setMyReports(reports || [])
    if (prof?.points !== undefined) {
      const { count } = await supabase.from('profiles').select('id', { count: 'exact', head: true }).gt('points', prof.points)
      setMyRank((count || 0) + 1)
    }
    setLoading(false)
  }

  async function saveSettings() {
    async function saveSettings() {
  // Apply dark mode directly
  if (settings.theme === 'dark') {
    document.documentElement.classList.add('dark')
  } else {
    document.documentElement.classList.remove('dark')
  }
  document.documentElement.style.fontSize = settings.largeText ? '18px' : ''

  setSaving(true)
  setSettings(settings)
  const updates = { settings }
  if (settings.displayName) updates.full_name = settings.displayName
  await supabase.from('profiles').update(updates).eq('id', authUser.id)
  setSaveMsg('Salvat cu succes! ✓')
  setTimeout(() => setSaveMsg(''), 3000)
  setSaving(false)
  await fetchAll()
}
    setSaving(true)
    setSettings(settings)
    const updates = { settings }
    if (settings.displayName) updates.full_name = settings.displayName
    await supabase.from('profiles').update(updates).eq('id', authUser.id)
    setSaveMsg('Salvat cu succes! ✓')
    setTimeout(() => setSaveMsg(''), 3000)
    setSaving(false)
    await fetchAll()
  }

  async function deleteAccount() {
    await supabase.from('reports').delete().eq('user_id', authUser.id)
    await supabase.from('profiles').delete().eq('id', authUser.id)
    await supabase.auth.signOut()
    navigate('/')
  }

  const handleLogout = async () => { await supabase.auth.signOut(); navigate('/') }

  if (loading) return (
    <div className="min-h-screen dark:bg-gray-950 flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  if (!authUser) return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center px-4">
      <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 p-10 max-w-md w-full text-center">
        <div className="w-20 h-20 bg-blue-100 dark:bg-blue-900/40 rounded-full flex items-center justify-center mx-auto mb-6">
          <User size={36} className="text-blue-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Contul tău</h2>
        <p className="text-gray-400 dark:text-gray-500 mb-8">Autentifică-te pentru a-ți vedea profilul.</p>
        <div className="flex gap-3">
          <button onClick={() => navigate('/login')} className="flex-1 border-2 border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl py-3 font-medium hover:border-blue-300 transition-colors">Autentificare</button>
          <button onClick={() => navigate('/register')} className="flex-1 bg-blue-600 text-white rounded-xl py-3 font-medium hover:bg-blue-700 transition-colors">Înregistrare</button>
        </div>
      </div>
    </div>
  )

  const name     = profile?.full_name || authUser.user_metadata?.full_name || authUser.email?.split('@')[0] || 'Utilizator'
  const initials = name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  const joinYear = new Date(authUser.created_at).getFullYear()
  const stats    = {
    reports_count:  profile?.reports_count  || myReports.length,
    resolved_count: profile?.resolved_count || myReports.filter(r => r.status === 'rezolvat').length,
    points:         profile?.points         || 0,
  }
  const badges       = BADGES_CONFIG.map(b => ({ ...b, earned: b.check(stats) }))
  const earnedBadges = badges.filter(b => b.earned)
  const levelInfo    = getLevel(stats.reports_count)

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors">
      <div className="max-w-4xl mx-auto px-4 py-6 pb-24 md:pb-6">

        {/* Settings drawer overlay */}
        {showSettings && (
          <div className="fixed inset-0 z-50 flex">
            <div className="flex-1 bg-black/40" onClick={() => setShowSettings(false)} />
            <div className="w-full max-w-md bg-white dark:bg-gray-900 h-full overflow-y-auto shadow-2xl flex flex-col">

              {/* Drawer header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-700 sticky top-0 bg-white dark:bg-gray-900 z-10">
                <div className="flex items-center gap-2">
                  <Settings size={20} className="text-blue-600" />
                  <h2 className="font-bold text-gray-900 dark:text-white text-lg">Setări</h2>
                </div>
                <button onClick={() => setShowSettings(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors">
                  <X size={20} className="text-gray-500 dark:text-gray-400" />
                </button>
              </div>

              <div className="flex-1 p-6 space-y-8">

                {/* Profil */}
                <div>
                  <h3 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-4">Profil</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-1">Nume afișat</label>
                      <input
                        type="text"
                        value={settings.displayName || name}
                        onChange={e => setSettings(s => ({ ...s, displayName: e.target.value }))}
                        className="w-full border border-gray-200 dark:border-gray-600 dark:bg-gray-800 dark:text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-400 transition-colors"
                        placeholder="Numele tău"
                      />
                    </div>
                  </div>
                </div>

                {/* Gamification */}
                <div>
                  <h3 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-4">Gamification</h3>
                  <div className="space-y-4">
                    {[
                      { key: 'arataNivel', label: 'Afișează nivelul pe profil public', desc: 'Ceilalți utilizatori îți pot vedea nivelul' },
                      { key: 'arataBadge', label: 'Afișează badge-urile pe profil public', desc: 'Badge-urile câștigate sunt vizibile public' },
                      { key: 'notifDepasit', label: 'Notificare când ești depășit în clasament', desc: 'Primești o alertă când cineva îți ia locul' },
                    ].map(({ key, label, desc }) => (
                      <div key={key} className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</p>
                          <p className="text-xs text-gray-400 dark:text-gray-500">{desc}</p>
                        </div>
                        <Toggle value={settings[key]} onChange={v => setSettings(s => ({ ...s, [key]: v }))} />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Aspect */}
                <div>
                  <h3 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-4">Aspect</h3>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Tema aplicației</p>
                      <div className="flex gap-2">
                        {[['luminos','☀️ Luminos'],['intunecat','🌙 Întunecat'],['sistem','💻 Sistem']].map(([val, label]) => (
                          <button
                            key={val}
                            onClick={() => setSettings(s => ({ ...s, tema: val }))}
                            className={`flex-1 py-2 px-3 rounded-xl text-sm font-medium border-2 transition-all ${
                              settings.tema === val
                                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/40 text-blue-700 dark:text-blue-400'
                                : 'border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-400 dark:bg-gray-800'
                            }`}
                          >
                            {label}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Text mai mare</p>
                        <p className="text-xs text-gray-400 dark:text-gray-500">Mărește dimensiunea textului pentru accesibilitate</p>
                      </div>
                      <Toggle value={settings.textMare} onChange={v => setSettings(s => ({ ...s, textMare: v }))} />
                    </div>
                  </div>
                </div>

                {/* Comunitate */}
                <div>
                  <h3 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-4">Comunitate</h3>
                  <div className="space-y-4">
                    {[
                      { key: 'urmaresteCartier', label: 'Urmărește rapoartele din cartierul tău', desc: 'Vezi automat problemele din zona ta pe hartă' },
                      { key: 'rezumatSaptamanal', label: 'Rezumat săptămânal pe email', desc: 'Primești un email cu problemele din zona ta' },
                    ].map(({ key, label, desc }) => (
                      <div key={key} className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</p>
                          <p className="text-xs text-gray-400 dark:text-gray-500">{desc}</p>
                        </div>
                        <Toggle value={settings[key]} onChange={v => setSettings(s => ({ ...s, [key]: v }))} />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Cont */}
                <div>
                  <h3 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-4">Cont</h3>
                  <div className="space-y-3">
                    <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 text-sm text-gray-600 dark:text-gray-400">
                      <span className="font-medium">Email: </span>{authUser.email}
                    </div>
                    {!showDeleteConfirm ? (
                      <button
                        onClick={() => setShowDeleteConfirm(true)}
                        className="w-full flex items-center gap-2 justify-center py-2.5 px-4 rounded-xl border-2 border-red-200 dark:border-red-900 text-red-600 dark:text-red-400 text-sm font-medium hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                      >
                        <Trash2 size={16} />
                        Șterge contul
                      </button>
                    ) : (
                      <div className="bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 rounded-xl p-4">
                        <p className="text-sm font-semibold text-red-700 dark:text-red-400 mb-1">Ești sigur?</p>
                        <p className="text-xs text-red-500 dark:text-red-400 mb-3">Această acțiune este ireversibilă. Toate raportările tale vor fi șterse.</p>
                        <div className="flex gap-2">
                          <button onClick={() => setShowDeleteConfirm(false)} className="flex-1 py-2 rounded-lg border border-gray-200 dark:border-gray-600 text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">Anulează</button>
                          <button onClick={deleteAccount} className="flex-1 py-2 rounded-lg bg-red-600 text-white text-sm font-medium hover:bg-red-700 transition-colors">Șterge</button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Save button */}
              <div className="p-6 border-t border-gray-100 dark:border-gray-700 sticky bottom-0 bg-white dark:bg-gray-900">
                {saveMsg && <p className="text-green-600 text-sm text-center mb-3 font-medium">{saveMsg}</p>}
                <button
                  onClick={saveSettings}
                  disabled={saving}
                  className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-semibold transition-colors disabled:opacity-60"
                >
                  <Save size={18} />
                  {saving ? 'Se salvează...' : 'Salvează setările'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Hero header */}
        <div className="bg-blue-600 rounded-3xl p-6 mb-6 text-white">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-5">
              <div className="relative flex-shrink-0">
                <div className="w-20 h-20 rounded-full flex items-center justify-center overflow-hidden" style={{ border: `4px solid ${levelInfo.color}`, background: 'rgba(255,255,255,0.2)' }}>
                  {authUser.user_metadata?.avatar_url
                    ? <img src={authUser.user_metadata.avatar_url} alt="" className="w-full h-full object-cover" />
                    : <span className="text-3xl font-bold text-white">{initials}</span>
                  }
                </div>
                <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full flex items-center justify-center text-sm border-2 border-blue-600" style={{ background: levelInfo.color }}>
                  <span className="text-white text-xs font-bold">{levelInfo.level}</span>
                </div>
              </div>
              <div>
                <h1 className="text-2xl font-bold mb-0.5">{name}</h1>
                <p className="text-blue-200 text-sm mb-1">{authUser.email}</p>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-sm font-semibold text-white/90">{levelInfo.badge} Nivel {levelInfo.level} — {levelInfo.name}</span>
                </div>
                {levelInfo.nextLevel && (
                  <div className="flex items-center gap-2">
                    <div className="w-32 h-1.5 bg-white/20 rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all" style={{ width: `${levelInfo.progress}%`, background: levelInfo.color }} />
                    </div>
                    <span className="text-white/60 text-xs">{stats.reports_count}/{levelInfo.nextLevel.min} → {levelInfo.nextLevel.name}</span>
                  </div>
                )}
                {!levelInfo.nextLevel && <span className="text-yellow-300 text-xs font-semibold">👑 Nivel maxim atins!</span>}
              </div>
            </div>
            <div className="flex gap-2 flex-shrink-0">
              <button
                onClick={() => setShowSettings(true)}
                className="flex items-center gap-2 bg-white/20 hover:bg-white/30 text-white text-sm px-4 py-2 rounded-xl font-medium transition-colors"
              >
                <Settings size={16} />
                Setări
              </button>
              <button onClick={handleLogout} className="flex items-center gap-2 bg-white/20 hover:bg-white/30 text-white text-sm px-4 py-2 rounded-xl font-medium transition-colors">
                <LogOut size={16} />
                Deconectare
              </button>
            </div>
          </div>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-4 gap-3 mb-6">
          {[
            { icon: MapPin,      label: 'Raportări', value: stats.reports_count,                  color: 'text-blue-600',   bg: 'bg-blue-50   dark:bg-blue-900/30'   },
            { icon: CheckCircle, label: 'Rezolvate',  value: stats.resolved_count,                 color: 'text-green-600',  bg: 'bg-green-50  dark:bg-green-900/30'  },
            { icon: Trophy,      label: 'Puncte',     value: stats.points.toLocaleString('ro-RO'), color: 'text-yellow-600', bg: 'bg-yellow-50 dark:bg-yellow-900/30' },
            { icon: TrendingUp,  label: 'Rank',       value: myRank ? `#${myRank}` : '—',         color: 'text-purple-600', bg: 'bg-purple-50 dark:bg-purple-900/30' },
          ].map(({ icon: Icon, label, value, color, bg }) => (
            <div key={label} className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-4 text-center">
              <div className={`w-10 h-10 ${bg} rounded-xl flex items-center justify-center mx-auto mb-2`}>
                <Icon size={20} className={color} />
              </div>
              <p className={`text-xl font-bold ${color}`}>{value}</p>
              <p className="text-gray-400 dark:text-gray-500 text-xs mt-1">{label}</p>
            </div>
          ))}
        </div>

        {/* Level roadmap */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-6 mb-6">
          <div className="flex items-center gap-2 mb-5">
            <span className="text-lg">🗺️</span>
            <h2 className="font-bold text-gray-900 dark:text-white">Drumul tău</h2>
            <span className="ml-auto text-xs text-gray-400 dark:text-gray-500">Nivel {levelInfo.level}/10</span>
          </div>
          <div className="flex items-center gap-1 overflow-x-auto pb-2">
            {LEVELS.map((l, i) => {
              const reached = stats.reports_count >= l.min
              const isCurrent = l.level === levelInfo.level
              return (
                <div key={l.level} className="flex items-center gap-1 flex-shrink-0">
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-9 h-9 rounded-full flex items-center justify-center text-sm border-2 transition-all ${isCurrent ? 'scale-110' : ''}`}
                      style={{ background: reached ? l.color : '#f3f4f6', borderColor: reached ? l.color : '#e5e7eb', color: reached ? 'white' : '#9ca3af' }}
                      title={l.name}
                    >
                      {reached ? l.badge : l.level}
                    </div>
                    <span className="text-gray-400 mt-1 text-center" style={{ fontSize: '9px', maxWidth: '48px' }}>{l.min}+</span>
                  </div>
                  {i < LEVELS.length - 1 && (
                    <div className="h-0.5 w-4 rounded flex-shrink-0" style={{ background: stats.reports_count >= LEVELS[i+1].min ? l.color : '#e5e7eb' }} />
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Badges */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-6 mb-6">
          <div className="flex items-center gap-2 mb-5">
            <span className="text-lg">🏅</span>
            <h2 className="font-bold text-gray-900 dark:text-white">Badge-uri obținute</h2>
            <span className="ml-auto text-xs text-gray-400 dark:text-gray-500">{earnedBadges.length}/{badges.length} obținute</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {badges.map(badge => (
              <div key={badge.id} className={`p-4 rounded-2xl border-2 transition-all ${badge.earned ? 'border-yellow-200 bg-yellow-50 dark:bg-yellow-900/20 dark:border-yellow-800' : 'border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 opacity-40'}`}>
                <div className="text-3xl mb-2">{badge.icon}</div>
                <p className="font-semibold text-gray-900 dark:text-white text-sm">{badge.title}</p>
                <p className="text-gray-400 dark:text-gray-500 text-xs mt-1">{badge.desc}</p>
                {badge.earned && <span className="inline-block mt-2 text-xs text-yellow-700 dark:text-yellow-400 bg-yellow-100 dark:bg-yellow-900/40 px-2 py-0.5 rounded-full font-medium">✓ Obținut</span>}
              </div>
            ))}
          </div>
        </div>

        {/* My Reports */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-6">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <MapPin size={18} className="text-blue-500" />
              <h2 className="font-bold text-gray-900 dark:text-white">Raportările mele</h2>
            </div>
            <span className="text-gray-400 dark:text-gray-500 text-sm">{myReports.length} raportări</span>
          </div>
          {myReports.length === 0 ? (
            <div className="text-center py-10">
              <MapPin size={36} className="text-gray-200 dark:text-gray-600 mx-auto mb-3" />
              <p className="text-gray-400 dark:text-gray-500 text-sm mb-4">Nu ai raportat nimic încă</p>
              <Link to="/raporteaza" className="inline-block bg-blue-600 text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors">Raportează prima problemă</Link>
            </div>
          ) : (
            <div className="space-y-3">
              {myReports.map(report => (
                <Link key={report.id} to={`/raport/${report.id}`} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-900 rounded-xl hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors group">
                  <div className="w-12 h-12 rounded-xl overflow-hidden bg-gray-200 dark:bg-gray-700 flex-shrink-0">
                    {report.image_url
                      ? <img src={report.image_url} alt="" className="w-full h-full object-cover" />
                      : <div className="w-full h-full flex items-center justify-center text-gray-400 text-xl">📍</div>
                    }
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 dark:text-white text-sm truncate">{report.title}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <Clock size={11} className="text-gray-400 flex-shrink-0" />
                      <span className="text-gray-400 dark:text-gray-500 text-xs">{timeAgo(report.created_at)}</span>
                      {report.address && <><span className="text-gray-300 dark:text-gray-600">•</span><span className="text-gray-400 dark:text-gray-500 text-xs truncate">{report.address}</span></>}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${STATUS_COLORS[report.status] || 'bg-gray-100 text-gray-600'}`}>{STATUS_LABELS[report.status] || report.status}</span>
                    <ChevronRight size={16} className="text-gray-300 dark:text-gray-600 group-hover:text-blue-400 transition-colors" />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  )
}