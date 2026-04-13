import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { Link, useNavigate } from 'react-router-dom'
import {
  MapPin, CheckCircle, Trophy, TrendingUp,
  LogOut, Clock, ChevronRight, User, Settings, X, Save, Trash2,
  Sun, Moon, Monitor, Award, Zap, Shield, Newspaper, Star, Crown,
  Eye, Compass, Target, Flag
} from 'lucide-react'
import { useSettings } from '../context/SettingsContext'

const STATUS_COLORS = {
  raportat:      'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  in_verificare: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  in_lucru:      'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
  rezolvat:      'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  respins:       'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
}
const STATUS_LABELS = {
  raportat: 'Raportat', in_verificare: 'In verificare',
  in_lucru: 'In lucru', rezolvat: 'Rezolvat', respins: 'Respins',
}

const LEVELS = [
  { level:1,  name:'Observator',        min:0,   icon: Eye       },
  { level:2,  name:'Cetatean Activ',    min:5,   icon: User      },
  { level:3,  name:'Voluntar Civic',    min:15,  icon: Target    },
  { level:4,  name:'Reporter Urban',    min:30,  icon: Newspaper },
  { level:5,  name:'Gardian Comunitar', min:50,  icon: Shield    },
  { level:6,  name:'Vocea Cartierului', min:75,  icon: Flag      },
  { level:7,  name:'Erou Local',        min:110, icon: Star      },
  { level:8,  name:'Campion Civic',     min:150, icon: Award     },
  { level:9,  name:'Ambasador Urban',   min:200, icon: Compass   },
  { level:10, name:'Legenda Orasului',  min:300, icon: Crown     },
]

function getLevel(rc) {
  let cur = LEVELS[0]
  for (const l of LEVELS) { if (rc >= l.min) cur = l }
  const next = LEVELS.find(l => l.level === cur.level + 1)
  const progress = next ? Math.round(((rc - cur.min) / (next.min - cur.min)) * 100) : 100
  return { ...cur, nextLevel: next, progress }
}

const BADGES_CONFIG = [
  { id:'first_report', icon: Trophy,   title:'Primul raport',        desc:'Ai trimis primul tau raport',          check:(s)=>s.reports_count>=1   },
  { id:'active',       icon: Zap,      title:'Contributor Activ',     desc:'Ai trimis peste 5 rapoarte',           check:(s)=>s.reports_count>=5   },
  { id:'hero',         icon: Star,     title:'Erou Local',            desc:'Ai rezolvat 3 probleme',               check:(s)=>s.resolved_count>=3  },
  { id:'explorer',     icon: Compass,  title:'Explorator Urban',      desc:'Ai trimis peste 10 rapoarte',          check:(s)=>s.reports_count>=10  },
  { id:'guardian',     icon: Shield,   title:'Gardianul Cartierului', desc:'Ai acumulat peste 100 de puncte',      check:(s)=>s.points>=100        },
  { id:'reporter',     icon: Newspaper,title:'Reporter Urban',        desc:'Ai ajuns la 30 de rapoarte',           check:(s)=>s.reports_count>=30  },
  { id:'champion',     icon: Award,    title:'Campion Civic',         desc:'Ai ajuns la 150 de rapoarte',          check:(s)=>s.reports_count>=150 },
  { id:'legend',       icon: Crown,    title:'Legenda Orasului',      desc:'Ai ajuns la 300 de rapoarte',          check:(s)=>s.reports_count>=300 },
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
      className={`relative inline-flex h-6 w-11 flex-shrink-0 items-center rounded-full transition-colors ${value ? 'bg-primary-600' : 'bg-gray-200 dark:bg-gray-600'}`}
    >
      <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${value ? 'translate-x-6' : 'translate-x-1'}`} />
    </button>
  )
}

function timeAgo(date) {
  const days = Math.floor((Date.now() - new Date(date)) / 86400000)
  if (days === 0) return 'azi'
  if (days === 1) return 'ieri'
  return `${days} zile in urma`
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
  // Apply dark mode using correct Romanian key names
  if (settings.tema === 'intunecat') {
    document.documentElement.classList.add('dark')
  } else {
    document.documentElement.classList.remove('dark')
  }
  document.documentElement.style.fontSize = settings.textMare ? '18px' : ''

  setSaving(true)
  const updates = { settings }
  if (settings.displayName) updates.full_name = settings.displayName
  await supabase.from('profiles').update(updates).eq('id', authUser.id)
  setSaveMsg('Salvat cu succes')
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
      <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  if (!authUser) return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center px-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-8 md:p-10 max-w-md w-full text-center">
        <div className="w-16 h-16 bg-primary-50 dark:bg-blue-900/40 rounded-full flex items-center justify-center mx-auto mb-6">
          <User size={32} className="text-primary-600" />
        </div>
        <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white mb-2">Contul tau</h2>
        <p className="text-gray-500 dark:text-gray-400 text-sm md:text-base mb-8">Autentifica-te pentru a-ti vedea profilul.</p>
        <div className="flex flex-col md:flex-row gap-3">
          <button onClick={() => navigate('/login')} className="w-full md:flex-1 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl h-12 font-medium hover:border-primary-300 transition-colors">Autentificare</button>
          <button onClick={() => navigate('/register')} className="w-full md:flex-1 bg-primary-600 text-white rounded-xl h-12 font-medium hover:bg-primary-700 transition-colors">Inregistrare</button>
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
  const LevelIcon    = levelInfo.icon

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors">
      <div className="max-w-4xl mx-auto px-4 py-6 pb-24 md:pb-6">

        {/* Settings drawer overlay */}
        {showSettings && (
          <div className="fixed inset-0 z-50 flex">
            <div className="flex-1 bg-black/40" onClick={() => setShowSettings(false)} />
            <div className="w-full max-w-md bg-white dark:bg-gray-900 h-full overflow-y-auto shadow-2xl flex flex-col">

              {/* Drawer header */}
              <div className="flex items-center justify-between p-4 md:p-6 border-b border-gray-200 dark:border-gray-700 sticky top-0 bg-white dark:bg-gray-900 z-10">
                <div className="flex items-center gap-2">
                  <Settings size={20} className="text-primary-600" />
                  <h2 className="font-bold text-gray-900 dark:text-white text-lg">Setari</h2>
                </div>
                <button onClick={() => setShowSettings(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center">
                  <X size={20} className="text-gray-500 dark:text-gray-400" />
                </button>
              </div>

              <div className="flex-1 p-4 md:p-6 space-y-8">

                {/* Profil */}
                <div>
                  <h3 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-4">Profil</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-1">Nume afisat</label>
                      <input
                        type="text"
                        value={settings.displayName || name}
                        onChange={e => setSettings(s => ({ ...s, displayName: e.target.value }))}
                        className="w-full border border-gray-200 dark:border-gray-600 dark:bg-gray-800 dark:text-white rounded-xl px-4 h-12 text-base focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors"
                        placeholder="Numele tau"
                      />
                    </div>
                  </div>
                </div>

                {/* Gamification */}
                <div>
                  <h3 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-4">Gamification</h3>
                  <div className="space-y-4">
                    {[
                      { key: 'arataNivel', label: 'Afiseaza nivelul pe profil public', desc: 'Ceilalti utilizatori iti pot vedea nivelul' },
                      { key: 'arataBadge', label: 'Afiseaza badge-urile pe profil public', desc: 'Badge-urile castigate sunt vizibile public' },
                      { key: 'notifDepasit', label: 'Notificare cand esti depasit in clasament', desc: 'Primesti o alerta cand cineva iti ia locul' },
                    ].map(({ key, label, desc }) => (
                      <div key={key} className="flex items-center justify-between gap-4">
                        <div className="flex-1">
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
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Tema aplicatiei</p>
                      <div className="flex gap-2">
                        {[
                          { val: 'luminos', label: 'Luminos', IconComp: Sun },
                          { val: 'intunecat', label: 'Intunecat', IconComp: Moon },
                          { val: 'sistem', label: 'Sistem', IconComp: Monitor },
                        ].map(({ val, label, IconComp }) => (
                          <button
                            key={val}
                            onClick={() => setSettings(s => ({ ...s, tema: val }))}
                            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-sm font-medium border transition-all min-h-[44px] ${
                              settings.tema === val
                                ? 'border-primary-500 bg-primary-50 dark:bg-blue-900/40 text-primary-700 dark:text-primary-400'
                                : 'border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-400 dark:bg-gray-800'
                            }`}
                          >
                            <IconComp size={16} />
                            {label}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Text mai mare</p>
                        <p className="text-xs text-gray-400 dark:text-gray-500">Mareste dimensiunea textului pentru accesibilitate</p>
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
                      { key: 'urmaresteCartier', label: 'Urmareste rapoartele din cartierul tau', desc: 'Vezi automat problemele din zona ta pe harta' },
                      { key: 'rezumatSaptamanal', label: 'Rezumat saptamanal pe email', desc: 'Primesti un email cu problemele din zona ta' },
                    ].map(({ key, label, desc }) => (
                      <div key={key} className="flex items-center justify-between gap-4">
                        <div className="flex-1">
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
                        className="w-full flex items-center gap-2 justify-center py-2.5 px-4 rounded-xl border border-red-200 dark:border-red-900 text-red-600 dark:text-red-400 text-sm font-medium hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors min-h-[44px]"
                      >
                        <Trash2 size={16} />
                        Sterge contul
                      </button>
                    ) : (
                      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4">
                        <p className="text-sm font-semibold text-red-700 dark:text-red-400 mb-1">Esti sigur?</p>
                        <p className="text-xs text-red-500 dark:text-red-400 mb-3">Aceasta actiune este ireversibila. Toate raportarile tale vor fi sterse.</p>
                        <div className="flex gap-2">
                          <button onClick={() => setShowDeleteConfirm(false)} className="flex-1 py-2 rounded-xl border border-gray-200 dark:border-gray-600 text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors min-h-[44px]">Anuleaza</button>
                          <button onClick={deleteAccount} className="flex-1 py-2 rounded-xl bg-red-600 text-white text-sm font-medium hover:bg-red-700 transition-colors min-h-[44px]">Sterge</button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Save button */}
              <div className="p-4 md:p-6 border-t border-gray-200 dark:border-gray-700 sticky bottom-0 bg-white dark:bg-gray-900">
                {saveMsg && <p className="text-green-600 text-sm text-center mb-3 font-medium">{saveMsg}</p>}
                <button
                  onClick={saveSettings}
                  disabled={saving}
                  className="w-full flex items-center justify-center gap-2 bg-primary-600 hover:bg-primary-700 text-white h-12 rounded-xl font-semibold transition-colors disabled:opacity-60"
                >
                  <Save size={18} />
                  {saving ? 'Se salveaza...' : 'Salveaza setarile'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Hero header */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-4 md:p-6 mb-4 md:mb-6">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
            {/* Avatar + Info */}
            <div className="flex flex-col items-center md:flex-row md:items-center gap-4">
              <div className="relative flex-shrink-0">
                <div className="w-20 h-20 rounded-full flex items-center justify-center overflow-hidden bg-primary-50 dark:bg-blue-900/40 border-2 border-primary-200 dark:border-primary-800">
                  {authUser.user_metadata?.avatar_url
                    ? <img src={authUser.user_metadata.avatar_url} alt="" className="w-full h-full object-cover" />
                    : <span className="text-2xl font-bold text-primary-600 dark:text-primary-400">{initials}</span>
                  }
                </div>
                <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2 border-white dark:border-gray-800 bg-primary-600 text-white">
                  {levelInfo.level}
                </div>
              </div>
              <div className="text-center md:text-left">
                <h1 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">{name}</h1>
                <p className="text-gray-500 dark:text-gray-400 text-sm">{authUser.email}</p>
                <div className="flex items-center justify-center md:justify-start gap-2 mt-1.5">
                  <LevelIcon size={16} className="text-primary-600 dark:text-primary-400" />
                  <span className="text-sm font-medium text-gray-900 dark:text-gray-100">Nivel {levelInfo.level} — {levelInfo.name}</span>
                </div>
                {levelInfo.nextLevel && (
                  <div className="flex items-center justify-center md:justify-start gap-2 mt-2">
                    <div className="w-32 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div className="h-full rounded-full bg-primary-600 transition-all" style={{ width: `${levelInfo.progress}%` }} />
                    </div>
                    <span className="text-gray-500 dark:text-gray-400 text-xs">{stats.reports_count}/{levelInfo.nextLevel.min}</span>
                  </div>
                )}
                {!levelInfo.nextLevel && (
                  <div className="flex items-center justify-center md:justify-start gap-1.5 mt-2">
                    <Crown size={14} className="text-primary-600 dark:text-primary-400" />
                    <span className="text-primary-600 dark:text-primary-400 text-xs font-medium">Nivel maxim atins</span>
                  </div>
                )}
              </div>
            </div>
            {/* Actions */}
            <div className="flex flex-col md:flex-row gap-2 md:flex-shrink-0">
              <button
                onClick={() => setShowSettings(true)}
                className="flex items-center justify-center gap-2 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 text-sm px-4 h-12 rounded-xl font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <Settings size={16} />
                Setari
              </button>
              <button
                onClick={handleLogout}
                className="flex items-center justify-center gap-2 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 text-sm px-4 h-12 rounded-xl font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <LogOut size={16} />
                Deconectare
              </button>
            </div>
          </div>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4 md:mb-6">
          {[
            { icon: MapPin,      label: 'Raportari', value: stats.reports_count                  },
            { icon: CheckCircle, label: 'Rezolvate',  value: stats.resolved_count                 },
            { icon: Trophy,      label: 'Puncte',     value: stats.points.toLocaleString('ro-RO') },
            { icon: TrendingUp,  label: 'Rank',       value: myRank ? `#${myRank}` : '--'         },
          ].map(({ icon: Icon, label, value }) => (
            <div key={label} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-4 text-center">
              <div className="w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-xl flex items-center justify-center mx-auto mb-2">
                <Icon size={20} className="text-gray-500 dark:text-gray-400" />
              </div>
              <p className="text-xl font-bold text-gray-900 dark:text-white">{value}</p>
              <p className="text-gray-500 dark:text-gray-400 text-xs mt-1">{label}</p>
            </div>
          ))}
        </div>

        {/* Level roadmap */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-4 md:p-6 mb-4 md:mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <TrendingUp size={18} className="text-gray-500 dark:text-gray-400" />
              <h2 className="font-bold text-gray-900 dark:text-white text-sm md:text-base">Drumul tau</h2>
            </div>
            <span className="text-xs text-gray-500 dark:text-gray-400">Nivel {levelInfo.level}/10</span>
          </div>

          {/* Progress bar overview */}
          <div className="mb-4">
            <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full bg-primary-600 transition-all"
                style={{ width: `${((levelInfo.level - 1 + levelInfo.progress / 100) / 10) * 100}%` }}
              />
            </div>
          </div>

          {/* Level list */}
          <div className="space-y-1.5">
            {LEVELS.map((l) => {
              const reached = stats.reports_count >= l.min
              const isCurrent = l.level === levelInfo.level
              const LIcon = l.icon
              return (
                <div
                  key={l.level}
                  className={`flex items-center gap-3 p-2.5 rounded-xl transition-colors ${
                    isCurrent
                      ? 'bg-primary-50 dark:bg-blue-900/30'
                      : ''
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                      isCurrent
                        ? 'bg-primary-600 text-white'
                        : reached
                          ? 'bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500'
                    }`}
                  >
                    <LIcon size={16} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium truncate ${
                      isCurrent
                        ? 'text-primary-700 dark:text-primary-400'
                        : reached
                          ? 'text-gray-900 dark:text-white'
                          : 'text-gray-400 dark:text-gray-500'
                    }`}>
                      {l.name}
                    </p>
                  </div>
                  <span className={`text-xs flex-shrink-0 ${
                    isCurrent
                      ? 'text-primary-600 dark:text-primary-400 font-semibold'
                      : reached
                        ? 'text-gray-500 dark:text-gray-400'
                        : 'text-gray-400 dark:text-gray-500'
                  }`}>
                    {l.min}+ raportari
                  </span>
                  {reached && (
                    <CheckCircle size={16} className={`flex-shrink-0 ${isCurrent ? 'text-primary-600 dark:text-primary-400' : 'text-gray-400 dark:text-gray-500'}`} />
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Badges */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-4 md:p-6 mb-4 md:mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Award size={18} className="text-gray-500 dark:text-gray-400" />
              <h2 className="font-bold text-gray-900 dark:text-white text-sm md:text-base">Badge-uri obtinute</h2>
            </div>
            <span className="text-xs text-gray-500 dark:text-gray-400">{earnedBadges.length}/{badges.length} obtinute</span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {badges.map(badge => {
              const BadgeIcon = badge.icon
              return (
                <div
                  key={badge.id}
                  className={`p-4 rounded-xl border transition-all ${
                    badge.earned
                      ? 'border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800'
                      : 'border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 opacity-40'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${
                    badge.earned
                      ? 'bg-primary-50 dark:bg-blue-900/30'
                      : 'bg-gray-100 dark:bg-gray-700'
                  }`}>
                    <BadgeIcon size={20} className={badge.earned ? 'text-primary-600 dark:text-primary-400' : 'text-gray-400 dark:text-gray-500'} />
                  </div>
                  <p className="font-semibold text-gray-900 dark:text-white text-sm">{badge.title}</p>
                  <p className="text-gray-500 dark:text-gray-400 text-xs mt-1">{badge.desc}</p>
                  {badge.earned && (
                    <div className="flex items-center gap-1 mt-2">
                      <CheckCircle size={12} className="text-primary-600 dark:text-primary-400" />
                      <span className="text-xs text-primary-600 dark:text-primary-400 font-medium">Obtinut</span>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* My Reports */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-4 md:p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <MapPin size={18} className="text-gray-500 dark:text-gray-400" />
              <h2 className="font-bold text-gray-900 dark:text-white text-sm md:text-base">Raportarile mele</h2>
            </div>
            <span className="text-gray-500 dark:text-gray-400 text-xs">{myReports.length} raportari</span>
          </div>
          {myReports.length === 0 ? (
            <div className="text-center py-10">
              <MapPin size={36} className="text-gray-300 dark:text-gray-600 mx-auto mb-3" />
              <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">Nu ai raportat nimic inca</p>
              <Link to="/raporteaza" className="inline-block bg-primary-600 text-white px-5 h-12 leading-[48px] rounded-xl text-sm font-medium hover:bg-primary-700 transition-colors">Raporteaza prima problema</Link>
            </div>
          ) : (
            <div className="space-y-2">
              {myReports.map(report => (
                <Link key={report.id} to={`/raport/${report.id}`} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-900 rounded-xl hover:bg-primary-50 dark:hover:bg-blue-900/20 transition-colors group">
                  <div className="w-12 h-12 rounded-xl overflow-hidden bg-gray-200 dark:bg-gray-700 flex-shrink-0 flex items-center justify-center">
                    {report.image_url
                      ? <img src={report.image_url} alt="" className="w-full h-full object-cover" />
                      : <MapPin size={20} className="text-gray-400 dark:text-gray-500" />
                    }
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 dark:text-white text-sm truncate">{report.title}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <Clock size={11} className="text-gray-400 flex-shrink-0" />
                      <span className="text-gray-500 dark:text-gray-400 text-xs">{timeAgo(report.created_at)}</span>
                      {report.address && <><span className="text-gray-300 dark:text-gray-600">-</span><span className="text-gray-500 dark:text-gray-400 text-xs truncate">{report.address}</span></>}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${STATUS_COLORS[report.status] || 'bg-gray-100 text-gray-600'}`}>{STATUS_LABELS[report.status] || report.status}</span>
                    <ChevronRight size={16} className="text-gray-300 dark:text-gray-600 group-hover:text-primary-500 transition-colors" />
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
