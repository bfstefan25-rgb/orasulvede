import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { Camera, MapPin, ArrowLeft, ArrowRight, Loader, X } from 'lucide-react'
import { extractSector } from '../lib/geocodeSector'

const CATEGORIES = [
  { id: 'Infrastructură',  icon: '🔧', desc: 'Gropi, asfalt deteriorat, poduri' },
  { id: 'Iluminat',        icon: '💡', desc: 'Stâlpi defecți, becuri arse' },
  { id: 'Trafic',          icon: '🚗', desc: 'Semafoare, marcaje rutiere' },
  { id: 'Canalizare',      icon: '💧', desc: 'Conducte, inundații, guri de canal' },
  { id: 'Parcuri',         icon: '🌳', desc: 'Bănci, locuri de joacă' },
  { id: 'Gunoi',           icon: '🗑️', desc: 'Deșeuri, containere pline' },
  { id: 'Animale',         icon: '🐾', desc: 'Animale fără stăpân' },
  { id: 'Alte pericole',   icon: '⚠️', desc: 'Alte situații periculoase' },
]

const STEPS = ['Fotografie', 'Detalii', 'Locație']
const API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY

async function reverseGeocode(lat, lng) {
  return new Promise((resolve) => {
    if (!window.google) { resolve({ address: null, sector: null }); return }
    const geocoder = new window.google.maps.Geocoder()
    geocoder.geocode({ location: { lat, lng }, language: 'ro' }, (results, status) => {
      if (status === 'OK' && results.length > 0) {
        const components = results[0].address_components
        const route     = components.find(c => c.types.includes('route'))?.long_name
        const streetNum = components.find(c => c.types.includes('street_number'))?.long_name
        const locality  = components.find(c => c.types.includes('locality'))?.long_name
        const sector    = extractSector(components)
        let address
        if (route) {
          const addr = streetNum ? route + ' ' + streetNum : route
          address = locality ? addr + ', ' + locality : addr
        } else {
          address = results[0].formatted_address
        }
        resolve({ address, sector })
      } else {
        resolve({ address: null, sector: null })
      }
    })
  })
}

function loadGoogleMaps(callback) {
  if (window.google && window.google.maps) { callback(); return }
  if (window.__mapsLoading) { window.addEventListener('maps-ready', callback, { once: true }); return }
  window.__mapsLoading = true
  window.__initMap = () => { window.__mapsReady = true; window.dispatchEvent(new Event('maps-ready')); callback() }
  const s = document.createElement('script')
  s.src = 'https://maps.googleapis.com/maps/api/js?key=' + API_KEY + '&callback=__initMap'
  s.async = true
  document.head.appendChild(s)
}

function MapPicker({ lat, lng, onPick, flyTo }) {
  const mapRef         = useRef(null)
  const markerRef      = useRef(null)
  const mapInstanceRef = useRef(null)
  const [address,   setAddress]   = useState('')
  const [geocoding, setGeocoding] = useState(false)

  const placeMarker = async (map, latVal, lngVal, pan) => {
    const pos = { lat: latVal, lng: lngVal }
    if (markerRef.current) {
      markerRef.current.setPosition(pos)
    } else {
      markerRef.current = new window.google.maps.Marker({
        position: pos, map, draggable: true,
        animation: window.google.maps.Animation.DROP,
      })
      markerRef.current.addListener('dragend', async (e) => {
        const dLat = e.latLng.lat()
        const dLng = e.latLng.lng()
        setGeocoding(true)
        const { address: addr, sector } = await reverseGeocode(dLat, dLng)
        const display = addr || (dLat.toFixed(4) + ', ' + dLng.toFixed(4))
        setAddress(display)
        setGeocoding(false)
        onPick(dLat, dLng, display, sector)
      })
    }
    if (pan) { map.panTo(pos); map.setZoom(16) }
    setGeocoding(true)
    const { address: addr, sector } = await reverseGeocode(latVal, lngVal)
    const display = addr || (latVal.toFixed(4) + ', ' + lngVal.toFixed(4))
    setAddress(display)
    setGeocoding(false)
    onPick(latVal, lngVal, display, sector)
  }

  useEffect(() => {
    loadGoogleMaps(() => {
      if (!mapRef.current || mapInstanceRef.current) return
      const center = (lat && lng) ? { lat, lng } : { lat: 44.4268, lng: 26.1025 }
      const map = new window.google.maps.Map(mapRef.current, {
        center, zoom: lat && lng ? 16 : 13,
        streetViewControl: false, mapTypeControl: false, fullscreenControl: false,
      })
      mapInstanceRef.current = map
      if (lat && lng) placeMarker(map, lat, lng, false)
      map.addListener('click', (e) => {
        placeMarker(map, e.latLng.lat(), e.latLng.lng(), false)
      })
    })
  }, [])

  useEffect(() => {
    if (!flyTo || !mapInstanceRef.current) return
    placeMarker(mapInstanceRef.current, flyTo.lat, flyTo.lng, true)
  }, [flyTo])

  return (
    <div>
      <div className="relative w-full h-64 rounded-2xl overflow-hidden border-2 border-gray-200 dark:border-gray-600 mb-3">
        <div ref={mapRef} className="w-full h-full" />
        {!address && !geocoding && (
          <div className="absolute bottom-3 left-0 right-0 flex justify-center pointer-events-none">
            <div className="bg-white/90 dark:bg-gray-800/90 text-slate-600 dark:text-gray-300 text-xs px-3 py-1.5 rounded-full shadow">
              Apasă pe hartă pentru a marca locația
            </div>
          </div>
        )}
      </div>
      <div className="flex items-center gap-3 bg-white dark:bg-gray-800 border-2 border-gray-100 dark:border-gray-700 rounded-2xl px-4 py-3 min-h-[52px]">
        <div className="w-8 h-8 bg-blue-50 dark:bg-blue-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
          {geocoding
            ? <Loader size={16} className="text-blue-600 animate-spin" />
            : <MapPin size={16} className={address ? 'text-blue-600' : 'text-gray-300 dark:text-gray-600'} />
          }
        </div>
        <span className={`text-sm ${address ? 'text-gray-900 dark:text-white font-medium' : 'text-gray-400 dark:text-gray-500'}`}>
          {geocoding ? 'Se detectează adresa...' : address || 'Nicio locație selectată'}
        </span>
      </div>
    </div>
  )
}

export default function Report() {
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [form, setForm] = useState({
    category: '', location: '', lat: null, lng: null, sector: null,
    title: '', description: '', image: null, imagePreview: null,
  })
  const [loading,    setLoading]    = useState(false)
  const [success,    setSuccess]    = useState(false)
  const [error,      setError]      = useState('')
  const [geoLoading, setGeoLoading] = useState(false)
  const [flyTo,      setFlyTo]      = useState(null)

  const next = () => setStep(s => Math.min(s + 1, 3))
  const back = () => setStep(s => Math.max(s - 1, 1))

  const handleImage = (e) => {
    const file = e.target.files[0]
    if (!file) return
    setForm(f => ({ ...f, image: file, imagePreview: URL.createObjectURL(file) }))
  }

  const removeImage = () => {
    setForm(f => ({ ...f, image: null, imagePreview: null }))
  }

  const handlePick = (lat, lng, address, sector) => {
    setForm(f => ({ ...f, lat, lng, location: address, sector }))
  }

  const handleUseMyLocation = () => {
    if (!navigator.geolocation) return
    setGeoLoading(true)
    navigator.geolocation.getCurrentPosition(
      (pos) => { setFlyTo({ lat: pos.coords.latitude, lng: pos.coords.longitude }); setGeoLoading(false) },
      () => setGeoLoading(false)
    )
  }

  const handleSubmit = async () => {
    setLoading(true); setError('')
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setError('Trebuie să fii autentificat.'); setLoading(false); return }
      let image_url = null
      if (form.image) {
        const fileName = Date.now() + '-' + form.image.name.replace(/[^a-zA-Z0-9._-]/g, '_')
        const { data, error: uploadError } = await supabase.storage.from('reports').upload(fileName, form.image)
        if (uploadError) throw uploadError
        if (data) image_url = supabase.storage.from('reports').getPublicUrl(fileName).data.publicUrl
      }
      const { error: insertError } = await supabase.from('reports').insert({
        title: form.title, description: form.description || null,
        category: form.category,
        address: form.location || null, sector: form.sector || null,
        latitude: form.lat || 44.4268, longitude: form.lng || 26.1025,
        image_url, user_id: user.id, status: 'raportat',
      })
      if (insertError) throw insertError
      setSuccess(true)
    } catch (err) {
      console.error(err); setError('A apărut o eroare. Încearcă din nou.')
    }
    setLoading(false)
  }

  // ── Success screen ──────────────────────────────────────────
  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center px-4">
        <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm w-full max-w-md p-8">
          <div className="w-14 h-14 bg-green-50 dark:bg-green-900/30 rounded-2xl flex items-center justify-center mb-6">
            <svg className="w-7 h-7 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Raport trimis cu succes</h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed mb-6">
            Raportul tău a fost înregistrat și va fi analizat de echipa responsabilă. Poți urmări statusul din pagina ta de profil.
          </p>
          <div className="space-y-3 mb-8">
            {[
              { label: 'Raport înregistrat', done: true },
              { label: 'În curs de verificare', done: false },
              { label: 'Transmis autorităților', done: false },
            ].map(({ label, done }) => (
              <div key={label} className="flex items-center gap-3">
                <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${done ? 'bg-green-500' : 'bg-gray-200 dark:bg-gray-700'}`}>
                  {done && (
                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                  )}
                </div>
                <span className={`text-sm ${done ? 'text-gray-900 dark:text-white font-medium' : 'text-gray-400 dark:text-gray-500'}`}>{label}</span>
              </div>
            ))}
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => { setSuccess(false); setStep(1); setForm({ category: '', location: '', lat: null, lng: null, sector: null, title: '', description: '', image: null, imagePreview: null }) }}
              className="flex-1 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-xl py-3 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              Raportează altceva
            </button>
            <button
              onClick={() => navigate('/acasa')}
              className="flex-1 bg-blue-600 text-white rounded-xl py-3 text-sm font-semibold hover:bg-blue-700 transition-colors"
            >
              Acasă
            </button>
          </div>
        </div>
      </div>
    )
  }

  const step2Valid = form.category && form.title.trim()

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors pb-24 md:pb-8">
      <div className="max-w-lg mx-auto px-4 py-6">

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => step > 1 ? back() : navigate(-1)}
            className="w-10 h-10 flex items-center justify-center rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-600 transition-colors flex-shrink-0"
          >
            <ArrowLeft size={18} />
          </button>
          <div className="flex-1">
            <h1 className="text-lg font-bold text-gray-900 dark:text-white leading-none">Raportează o problemă</h1>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">Pasul {step} din {STEPS.length} — {STEPS[step - 1]}</p>
          </div>
        </div>

        {/* Step indicator */}
        <div className="flex items-center gap-2 mb-8">
          {STEPS.map((label, i) => (
            <div key={label} className={`h-1.5 flex-1 rounded-full transition-all ${
              i + 1 <= step ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'
            }`} />
          ))}
        </div>

        {/* ── Step 1: Photo ── */}
        {step === 1 && (
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1">Adaugă o fotografie</h2>
            <p className="text-sm text-gray-400 dark:text-gray-500 mb-6">O imagine ajută la rezolvarea mai rapidă a problemei.</p>

            {form.imagePreview ? (
              <div className="relative rounded-2xl overflow-hidden mb-4">
                <img src={form.imagePreview} alt="Preview" className="w-full max-h-72 object-cover" />
                <button
                  onClick={removeImage}
                  className="absolute top-3 right-3 w-9 h-9 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center transition-colors"
                >
                  <X size={16} />
                </button>
                <div className="absolute bottom-3 left-3 bg-black/50 text-white text-xs px-3 py-1 rounded-full font-medium">
                  Fotografie adăugată
                </div>
              </div>
            ) : (
              <button
                onClick={() => document.getElementById('fileInput').click()}
                className="w-full border-2 border-dashed border-gray-300 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-500 bg-white dark:bg-gray-800 rounded-2xl p-10 flex flex-col items-center gap-3 transition-colors mb-4 group"
              >
                <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/30 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/50 rounded-2xl flex items-center justify-center transition-colors">
                  <Camera size={28} className="text-blue-500" />
                </div>
                <div className="text-center">
                  <p className="font-semibold text-gray-700 dark:text-gray-200">Fă sau alege o fotografie</p>
                  <p className="text-gray-400 dark:text-gray-500 text-sm mt-1">PNG, JPG până la 10MB</p>
                </div>
              </button>
            )}

            <input id="fileInput" type="file" accept="image/*" onChange={handleImage} className="hidden" />

            <div className="flex flex-col gap-3">
              {form.imagePreview ? (
                <button
                  onClick={() => document.getElementById('fileInput').click()}
                  className="w-full h-12 border-2 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 rounded-xl text-sm font-medium hover:border-gray-300 transition-colors"
                >
                  Schimbă fotografia
                </button>
              ) : null}
              <button
                onClick={next}
                className="w-full h-12 bg-blue-600 text-white rounded-xl font-semibold text-sm hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
              >
                {form.imagePreview ? 'Continuă' : 'Continuă fără fotografie'}
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* ── Step 2: Category + Details ── */}
        {step === 2 && (
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1">Despre ce este vorba?</h2>
            <p className="text-sm text-gray-400 dark:text-gray-500 mb-6">Selectează categoria și descrie problema pe scurt.</p>

            {/* Category grid */}
            <div className="grid grid-cols-2 gap-2.5 mb-6">
              {CATEGORIES.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setForm(f => ({ ...f, category: cat.id }))}
                  className={`p-3.5 rounded-2xl border-2 text-left transition-all ${
                    form.category === cat.id
                      ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-blue-300 dark:hover:border-blue-600'
                  }`}
                >
                  <div className="text-2xl mb-1.5">{cat.icon}</div>
                  <div className="font-semibold text-gray-900 dark:text-white text-sm leading-tight">{cat.id}</div>
                  <div className="text-gray-400 dark:text-gray-500 text-xs mt-0.5 leading-snug">{cat.desc}</div>
                </button>
              ))}
            </div>

            {/* Title */}
            <div className="mb-4">
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Titlu scurt <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="ex: Groapă mare pe trotuar"
                value={form.title}
                onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                className="w-full h-12 border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-xl px-4 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors text-base"
              />
            </div>

            {/* Description */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Descriere <span className="text-gray-400 font-normal">(opțional)</span>
              </label>
              <textarea
                placeholder="Orice detalii suplimentare care ar putea ajuta..."
                value={form.description}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                rows={3}
                className="w-full border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-xl px-4 py-3 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors resize-none text-sm"
              />
            </div>

            <button
              onClick={next}
              disabled={!step2Valid}
              className="w-full h-12 bg-blue-600 text-white rounded-xl font-semibold text-sm hover:bg-blue-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              Continuă <ArrowRight size={16} />
            </button>
          </div>
        )}

        {/* ── Step 3: Location + Submit ── */}
        {step === 3 && (
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1">Unde se află problema?</h2>
            <p className="text-sm text-gray-400 dark:text-gray-500 mb-4">Apasă pe hartă sau folosește locația ta.</p>

            <MapPicker lat={form.lat} lng={form.lng} onPick={handlePick} flyTo={flyTo} />

            <button
              onClick={handleUseMyLocation}
              disabled={geoLoading}
              className="mt-3 w-full h-12 flex items-center justify-center gap-2 border-2 border-blue-200 dark:border-blue-700 text-blue-600 dark:text-blue-400 rounded-xl text-sm font-medium hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors disabled:opacity-60"
            >
              {geoLoading
                ? <><Loader size={16} className="animate-spin" /> Se detectează...</>
                : <><MapPin size={16} /> Folosește locația mea actuală</>
              }
            </button>

            {error && (
              <div className="mt-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 text-red-600 dark:text-red-400 text-sm rounded-xl px-4 py-3">
                {error}
              </div>
            )}

            {/* Summary strip */}
            <div className="mt-5 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-4 flex items-center gap-3">
              {form.imagePreview
                ? <img src={form.imagePreview} alt="" className="w-14 h-14 rounded-xl object-cover flex-shrink-0" />
                : <div className="w-14 h-14 rounded-xl bg-gray-100 dark:bg-gray-700 flex items-center justify-center flex-shrink-0 text-2xl">
                    {CATEGORIES.find(c => c.id === form.category)?.icon}
                  </div>
              }
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900 dark:text-white text-sm truncate">{form.title}</p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{form.category}</p>
              </div>
            </div>

            <button
              onClick={handleSubmit}
              disabled={loading}
              className="mt-4 w-full h-12 bg-blue-600 text-white rounded-xl font-semibold text-sm hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading
                ? <><Loader size={16} className="animate-spin" /> Se trimite...</>
                : '✓ Trimite raportul'
              }
            </button>

            <p className="text-center text-xs text-gray-400 dark:text-gray-500 mt-3">
              Locația este opțională — raportul va fi trimis chiar și fără pin pe hartă.
            </p>
          </div>
        )}

      </div>
    </div>
  )
}
