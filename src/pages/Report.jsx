import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { Upload, MapPin, CheckCircle, ArrowLeft, ArrowRight, Loader } from 'lucide-react'

const CATEGORIES = [
  { id: 'Infrastructură',  icon: '🔧', desc: 'Gropi, asfalt deteriorat, poduri' },
  { id: 'Iluminat',        icon: '💡', desc: 'Stâlpi defecți, becuri arse' },
  { id: 'Trafic',          icon: '🚗', desc: 'Semafoare, marcaje rutiere' },
  { id: 'Trotuare',        icon: '🚶', desc: 'Dale sparte, obstacole' },
  { id: 'Parcuri',         icon: '🌳', desc: 'Bănci, locuri de joacă' },
  { id: 'Gunoi',           icon: '🗑️', desc: 'Deșeuri, containere pline' },
  { id: 'Animale',         icon: '🐾', desc: 'Animale fără stăpân' },
  { id: 'Alte pericole',   icon: '⚠️', desc: 'Alte situații periculoase' },
]

const STEPS = ['Categorie', 'Locație', 'Detalii', 'Fotografii', 'Confirmare']

async function reverseGeocode(lat, lng, apiKey) {
  try {
    const res = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${apiKey}&language=ro`
    )
    const data = await res.json()
    if (data.status === 'OK' && data.results.length > 0) {
      // Prefer route (street) + street_number, fallback to formatted_address
      const result = data.results[0]
      const components = result.address_components
      const route        = components.find(c => c.types.includes('route'))?.long_name
      const streetNum    = components.find(c => c.types.includes('street_number'))?.long_name
      const locality     = components.find(c => c.types.includes('locality'))?.long_name
      if (route) {
        return streetNum ? `${route} ${streetNum}, ${locality || ''}`.trim().replace(/,$/, '')
                         : `${route}, ${locality || ''}`.trim().replace(/,$/, '')
      }
      return result.formatted_address
    }
  } catch (e) {
    console.error('Geocode error:', e)
  }
  return null
}

export default function Report() {
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [form, setForm] = useState({
    category: '',
    location: '',
    lat: null,
    lng: null,
    title: '',
    description: '',
    image: null,
    imagePreview: null,
  })
  const [loading, setLoading]         = useState(false)
  const [geocoding, setGeocoding]     = useState(false)
  const [success, setSuccess]         = useState(false)
  const [error, setError]             = useState('')

  const next = () => setStep(s => Math.min(s + 1, 5))
  const back = () => setStep(s => Math.max(s - 1, 1))

  const handleImage = (e) => {
    const file = e.target.files[0]
    if (!file) return
    setForm(f => ({ ...f, image: file, imagePreview: URL.createObjectURL(file) }))
  }

  const handleUseMyLocation = () => {
    if (!navigator.geolocation) return
    setGeocoding(true)
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords
        const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY
        const address = await reverseGeocode(latitude, longitude, apiKey)
        setForm(f => ({
          ...f,
          lat: latitude,
          lng: longitude,
          location: address || `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`,
        }))
        setGeocoding(false)
      },
      () => setGeocoding(false)
    )
  }

  const handleSubmit = async () => {
    setLoading(true)
    setError('')
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setError('Trebuie să fii autentificat pentru a raporta.')
        setLoading(false)
        return
      }

      let image_url = null
      if (form.image) {
        const sanitizedName = form.image.name.replace(/[^a-zA-Z0-9._-]/g, '_')
        const fileName = `${Date.now()}-${sanitizedName}`
        const { data, error: uploadError } = await supabase.storage
          .from('reports')
          .upload(fileName, form.image)
        if (uploadError) throw uploadError
        if (data) {
          const { data: urlData } = supabase.storage.from('reports').getPublicUrl(fileName)
          image_url = urlData.publicUrl
        }
      }

      const { error: insertError } = await supabase.from('reports').insert({
        title:       form.title,
        description: form.description,
        category:    form.category,
        address:     form.location,
        latitude:    form.lat  || 44.4268,
        longitude:   form.lng  || 26.1025,
        image_url,
        user_id:     user.id,
        status:      'raportat',
      })
      if (insertError) throw insertError
      setSuccess(true)
    } catch (err) {
      console.error(err)
      setError('A apărut o eroare. Încearcă din nou.')
    }
    setLoading(false)
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-10 max-w-md w-full text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle size={40} className="text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Raport trimis!</h2>
          <p className="text-gray-400 mb-8">Mulțumim pentru raportare. Problema a fost înregistrată și va fi analizată în curând.</p>
          <div className="flex gap-3">
            <button
              onClick={() => {
                setSuccess(false)
                setStep(1)
                setForm({ category: '', location: '', lat: null, lng: null, title: '', description: '', image: null, imagePreview: null })
              }}
              className="flex-1 border-2 border-gray-200 text-gray-700 rounded-xl py-3 font-medium hover:border-blue-300 transition-colors"
            >
              Raportează altceva
            </button>
            <button
              onClick={() => navigate('/acasa')}
              className="flex-1 bg-blue-600 text-white rounded-xl py-3 font-medium hover:bg-blue-700 transition-colors"
            >
              Acasă
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24 md:pb-6">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Raportează o problemă</h1>
        <p className="text-gray-400 mb-8">Ajută la îmbunătățirea orașului tău</p>

        {/* Progress */}
        <div className="flex items-center mb-10">
          {STEPS.map((label, i) => (
            <div key={label} className="flex items-center flex-1 last:flex-none">
              <div className="flex flex-col items-center">
                <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                  i + 1 < step  ? 'bg-green-500 text-white' :
                  i + 1 === step ? 'bg-blue-600 text-white' :
                                   'bg-gray-200 text-gray-400'
                }`}>
                  {i + 1 < step ? '✓' : i + 1}
                </div>
                <span className={`text-xs mt-1 hidden sm:block ${i + 1 === step ? 'text-blue-600 font-medium' : 'text-gray-400'}`}>
                  {label}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div className={`flex-1 h-1 mx-2 rounded ${i + 1 < step ? 'bg-green-500' : 'bg-gray-200'}`} />
              )}
            </div>
          ))}
        </div>

        {/* Step 1 — Category */}
        {step === 1 && (
          <div>
            <h2 className="text-lg font-bold text-gray-900 mb-6">Selectează categoria problemei</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {CATEGORIES.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setForm(f => ({ ...f, category: cat.id }))}
                  className={`p-4 rounded-2xl border-2 text-left transition-all hover:border-blue-400 ${
                    form.category === cat.id ? 'border-blue-600 bg-blue-50' : 'border-gray-200 bg-white'
                  }`}
                >
                  <div className="text-3xl mb-2">{cat.icon}</div>
                  <div className="font-semibold text-gray-900 text-sm">{cat.id}</div>
                  <div className="text-gray-400 text-xs mt-1">{cat.desc}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 2 — Location */}
        {step === 2 && (
          <div>
            <h2 className="text-lg font-bold text-gray-900 mb-6">Unde se află problema?</h2>
            <div className="bg-white rounded-2xl border-2 border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
                  <MapPin size={20} className="text-blue-600" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Adresa problemei</p>
                  <p className="text-gray-400 text-sm">Introdu adresa sau strada</p>
                </div>
              </div>
              <input
                type="text"
                placeholder="ex: Bulevardul Unirii 45, București"
                value={form.location}
                onChange={e => setForm(f => ({ ...f, location: e.target.value }))}
                className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:border-blue-500 transition-colors"
              />
              <button
                onClick={handleUseMyLocation}
                disabled={geocoding}
                className="mt-3 w-full flex items-center justify-center gap-2 border-2 border-blue-200 text-blue-600 rounded-xl py-3 font-medium hover:bg-blue-50 transition-colors disabled:opacity-60"
              >
                {geocoding ? (
                  <>
                    <Loader size={16} className="animate-spin" />
                    Se detectează adresa...
                  </>
                ) : (
                  <>
                    <MapPin size={16} />
                    Folosește locația mea actuală
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Step 3 — Details */}
        {step === 3 && (
          <div>
            <h2 className="text-lg font-bold text-gray-900 mb-6">Descrie problema</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Titlu scurt *</label>
                <input
                  type="text"
                  placeholder="ex: Groapă mare pe trotuar"
                  value={form.title}
                  onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                  className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Descriere detaliată *</label>
                <textarea
                  placeholder="Descrie problema în detaliu. Ce ai observat? De când există? Cât de periculoasă este?"
                  value={form.description}
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  rows={5}
                  className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:border-blue-500 transition-colors resize-none"
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 4 — Photo */}
        {step === 4 && (
          <div>
            <h2 className="text-lg font-bold text-gray-900 mb-6">Adaugă o fotografie</h2>
            <div
              onClick={() => document.getElementById('fileInput').click()}
              className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${
                form.imagePreview ? 'border-blue-400 bg-blue-50' : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50'
              }`}
            >
              {form.imagePreview ? (
                <img src={form.imagePreview} alt="Preview" className="w-full max-h-64 object-cover rounded-xl" />
              ) : (
                <>
                  <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Upload size={28} className="text-gray-400" />
                  </div>
                  <p className="font-semibold text-gray-700 mb-1">Apasă pentru a încărca o fotografie</p>
                  <p className="text-gray-400 text-sm">PNG, JPG până la 10MB</p>
                </>
              )}
            </div>
            <input id="fileInput" type="file" accept="image/*" onChange={handleImage} className="hidden" />
            <p className="text-gray-400 text-sm text-center mt-3">Fotografia este opțională dar ajută la rezolvarea mai rapidă</p>
          </div>
        )}

        {/* Step 5 — Confirm */}
        {step === 5 && (
          <div>
            <h2 className="text-lg font-bold text-gray-900 mb-6">Confirmă raportul</h2>
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3 mb-4">
                {error}
              </div>
            )}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
              {form.imagePreview && (
                <img src={form.imagePreview} alt="Preview" className="w-full h-48 object-cover rounded-xl" />
              )}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-400 mb-1">Categorie</p>
                  <p className="font-semibold text-gray-900">
                    {CATEGORIES.find(c => c.id === form.category)?.icon} {form.category}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-1">Locație</p>
                  <p className="font-semibold text-gray-900 text-sm">{form.location || 'Nespecificată'}</p>
                </div>
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-1">Titlu</p>
                <p className="font-semibold text-gray-900">{form.title}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-1">Descriere</p>
                <p className="text-gray-700 text-sm">{form.description}</p>
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="flex justify-between mt-8">
          {step > 1 ? (
            <button
              onClick={back}
              className="flex items-center gap-2 border-2 border-gray-200 text-gray-700 px-6 py-3 rounded-xl font-medium hover:border-blue-300 transition-colors"
            >
              <ArrowLeft size={16} />
              Înapoi
            </button>
          ) : <div />}

          {step < 5 ? (
            <button
              onClick={next}
              disabled={
                (step === 1 && !form.category) ||
                (step === 2 && !form.location) ||
                (step === 3 && (!form.title || !form.description))
              }
              className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-blue-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Continuă <ArrowRight size={16} />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="flex items-center gap-2 bg-blue-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {loading ? 'Se trimite...' : '✓ Trimite raportul'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}