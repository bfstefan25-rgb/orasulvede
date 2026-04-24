import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { Upload, MapPin, CheckCircle, ArrowLeft, ArrowRight, Loader } from 'lucide-react'

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

const STEPS = ['Categorie', 'Locație', 'Detalii', 'Fotografii', 'Confirmare']
const API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY

async function reverseGeocode(lat, lng) {
  return new Promise((resolve) => {
    if (!window.google) { resolve(null); return }
    const geocoder = new window.google.maps.Geocoder()
    geocoder.geocode({ location: { lat, lng }, language: 'ro' }, (results, status) => {
      if (status === 'OK' && results.length > 0) {
        const components = results[0].address_components
        const route     = components.find(c => c.types.includes('route'))?.long_name
        const streetNum = components.find(c => c.types.includes('street_number'))?.long_name
        const locality  = components.find(c => c.types.includes('locality'))?.long_name
        if (route) {
          const addr = streetNum ? route + " " + streetNum : route
          resolve(locality ? addr + ", " + locality : addr)
        } else {
          resolve(results[0].formatted_address)
        }
      } else {
        resolve(null)
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
  s.src = "https://maps.googleapis.com/maps/api/js?key=" + API_KEY + "&callback=__initMap"
  s.async = true
  document.head.appendChild(s)
}

function MapPicker({ lat, lng, onPick, flyTo }) {
  const mapRef        = useRef(null)
  const markerRef     = useRef(null)
  const mapInstanceRef= useRef(null)
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
        const addr = await reverseGeocode(dLat, dLng)
        setAddress(addr || (dLat.toFixed(4) + ", " + dLng.toFixed(4)))
        setGeocoding(false)
        onPick(dLat, dLng, addr || (dLat.toFixed(4) + ", " + dLng.toFixed(4)))
      })
    }
    if (pan) { map.panTo(pos); map.setZoom(16) }
    setGeocoding(true)
    const addr = await reverseGeocode(latVal, lngVal)
    const display = addr || (latVal.toFixed(4) + ", " + lngVal.toFixed(4))
    setAddress(display)
    setGeocoding(false)
    onPick(latVal, lngVal, display)
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
      <div className="relative w-full h-72 rounded-2xl overflow-hidden border-2 border-gray-200 dark:border-gray-600 mb-4">
        <div ref={mapRef} className="w-full h-full" />
        {!address && !geocoding && (
          <div className="absolute bottom-3 left-0 right-0 flex justify-center pointer-events-none">
            <div className="bg-white/90 dark:bg-gray-800/90 text-slate-600 dark:text-gray-300 text-xs px-3 py-1.5 rounded-full shadow">
              Apasă pe hartă pentru a marca locația
            </div>
          </div>
        )}
      </div>
      <div className="flex items-center gap-3 bg-white dark:bg-gray-800 border-2 border-gray-100 dark:border-gray-700 rounded-2xl px-4 py-3 min-h-[56px]">
        <div className="w-8 h-8 bg-blue-50 dark:bg-blue-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
          {geocoding
            ? <Loader size={16} className="text-blue-600 animate-spin" />
            : <MapPin size={16} className={address ? "text-blue-600" : "text-gray-300 dark:text-gray-600"} />
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
    category: '', location: '', lat: null, lng: null,
    title: '', description: '', image: null, imagePreview: null,
  })
  const [loading,    setLoading]    = useState(false)
  const [success,    setSuccess]    = useState(false)
  const [error,      setError]      = useState('')
  const [geoLoading, setGeoLoading] = useState(false)
  const [flyTo,      setFlyTo]      = useState(null)

  const next = () => setStep(s => Math.min(s + 1, 5))
  const back = () => setStep(s => Math.max(s - 1, 1))

  const handleImage = (e) => {
    const file = e.target.files[0]
    if (!file) return
    setForm(f => ({ ...f, image: file, imagePreview: URL.createObjectURL(file) }))
  }

  const handlePick = (lat, lng, address) => {
    setForm(f => ({ ...f, lat, lng, location: address }))
  }

  const handleUseMyLocation = () => {
    if (!navigator.geolocation) return
    setGeoLoading(true)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setFlyTo({ lat: pos.coords.latitude, lng: pos.coords.longitude })
        setGeoLoading(false)
      },
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
        const fileName = Date.now() + "-" + form.image.name.replace(/[^a-zA-Z0-9._-]/g, '_')
        const { data, error: uploadError } = await supabase.storage.from('reports').upload(fileName, form.image)
        if (uploadError) throw uploadError
        if (data) image_url = supabase.storage.from('reports').getPublicUrl(fileName).data.publicUrl
      }
      const { error: insertError } = await supabase.from('reports').insert({
        title: form.title, description: form.description, category: form.category,
        address: form.location, latitude: form.lat || 44.4268, longitude: form.lng || 26.1025,
        image_url, user_id: user.id, status: 'raportat',
      })
      if (insertError) throw insertError
      setSuccess(true)
    } catch (err) { console.error(err); setError('A apărut o eroare. Încearcă din nou.') }
    setLoading(false)
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center px-4">
        <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm w-full max-w-md p-8">
          {/* Icon */}
          <div className="w-14 h-14 bg-green-50 dark:bg-green-900/30 rounded-2xl flex items-center justify-center mb-6">
            <svg className="w-7 h-7 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Raport trimis cu succes</h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed mb-6">
            Raportul tău a fost înregistrat și va fi analizat de echipa responsabilă. Poți urmări statusul din pagina ta de profil.
          </p>

          {/* Progress steps */}
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
              onClick={() => { setSuccess(false); setStep(1); setForm({ category: '', location: '', lat: null, lng: null, title: '', description: '', image: null, imagePreview: null }) }}
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

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors pb-24 md:pb-6">
      <div className="max-w-2xl mx-auto px-4 py-8">

        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">Raportează o problemă</h1>
        <p className="text-gray-400 dark:text-gray-500 mb-8">Ajută la îmbunătățirea orașului tău</p>

        {/* ── Step indicator ── */}
        <div className="flex items-center mb-10">
          {STEPS.map((label, i) => (
            <div key={label} className="flex items-center flex-1 last:flex-none">
              <div className="flex flex-col items-center">
                <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                  i+1 < step  ? 'bg-green-500 text-white'
                  : i+1 === step ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500'
                }`}>{i+1 < step ? '✓' : i+1}</div>
                <span className={`text-xs mt-1 hidden sm:block ${i+1 === step ? 'text-blue-600 font-medium' : 'text-gray-400 dark:text-gray-500'}`}>{label}</span>
              </div>
              {i < STEPS.length - 1 && (
                <div className={`flex-1 h-1 mx-2 rounded ${i+1 < step ? 'bg-green-500' : 'bg-gray-200 dark:bg-gray-700'}`} />
              )}
            </div>
          ))}
        </div>

        {/* ── Step 1: Category ── */}
        {step === 1 && (
          <div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Selectează categoria problemei</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {CATEGORIES.map(cat => (
                <button key={cat.id} onClick={() => setForm(f => ({ ...f, category: cat.id }))}
                  className={`p-4 rounded-2xl border-2 text-left transition-all hover:border-blue-400 ${
                    form.category === cat.id
                      ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'
                  }`}>
                  <div className="text-3xl mb-2">{cat.icon}</div>
                  <div className="font-semibold text-gray-900 dark:text-white text-sm">{cat.id}</div>
                  <div className="text-gray-400 dark:text-gray-500 text-xs mt-1">{cat.desc}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── Step 2: Location ── */}
        {step === 2 && (
          <div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Unde se află problema?</h2>
            <p className="text-gray-400 dark:text-gray-500 text-sm mb-4">Apasă pe hartă sau trage pinul pentru a marca locația exactă.</p>
            <MapPicker lat={form.lat} lng={form.lng} onPick={handlePick} flyTo={flyTo} />
            <button onClick={handleUseMyLocation} disabled={geoLoading}
              className="mt-3 w-full flex items-center justify-center gap-2 border-2 border-blue-200 dark:border-blue-700 text-blue-600 dark:text-blue-400 rounded-xl py-3 font-medium hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors disabled:opacity-60">
              {geoLoading
                ? <><Loader size={16} className="animate-spin" /> Se detectează locația...</>
                : <><MapPin size={16} /> Folosește locația mea actuală</>}
            </button>
          </div>
        )}

        {/* ── Step 3: Details ── */}
        {step === 3 && (
          <div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Descrie problema</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Titlu scurt *</label>
                <input type="text" placeholder="ex: Groapă mare pe trotuar" value={form.title}
                  onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                  className="w-full border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-xl px-4 py-3 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Descriere detaliată *</label>
                <textarea placeholder="Descrie problema în detaliu..." value={form.description}
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  rows={5}
                  className="w-full border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-xl px-4 py-3 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors resize-none" />
              </div>
            </div>
          </div>
        )}

        {/* ── Step 4: Photo ── */}
        {step === 4 && (
          <div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Adaugă o fotografie</h2>
            <div onClick={() => document.getElementById('fileInput').click()}
              className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${
                form.imagePreview
                  ? 'border-blue-400 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-gray-300 dark:border-gray-600 hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/10'
              }`}>
              {form.imagePreview
                ? <img src={form.imagePreview} alt="Preview" className="w-full max-h-64 object-cover rounded-xl" />
                : <>
                    <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <Upload size={28} className="text-gray-400 dark:text-gray-500" />
                    </div>
                    <p className="font-semibold text-gray-700 dark:text-gray-300 mb-1">Apasă pentru a încărca o fotografie</p>
                    <p className="text-gray-400 dark:text-gray-500 text-sm">PNG, JPG până la 10MB</p>
                  </>}
            </div>
            <input id="fileInput" type="file" accept="image/*" onChange={handleImage} className="hidden" />
            <p className="text-gray-400 dark:text-gray-500 text-sm text-center mt-3">Fotografia este opțională dar ajută la rezolvarea mai rapidă</p>
          </div>
        )}

        {/* ── Step 5: Confirm ── */}
        {step === 5 && (
          <div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Confirmă raportul</h2>
            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 text-red-600 dark:text-red-400 text-sm rounded-xl px-4 py-3 mb-4">
                {error}
              </div>
            )}
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-6 space-y-4">
              {form.imagePreview && (
                <img src={form.imagePreview} alt="Preview" className="w-full h-48 object-cover rounded-xl" />
              )}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mb-1">Categorie</p>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {CATEGORIES.find(c => c.id === form.category)?.icon} {form.category}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mb-1">Locație</p>
                  <p className="font-semibold text-gray-900 dark:text-white text-sm">{form.location || 'Nespecificată'}</p>
                </div>
              </div>
              <div>
                <p className="text-xs text-gray-400 dark:text-gray-500 mb-1">Titlu</p>
                <p className="font-semibold text-gray-900 dark:text-white">{form.title}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 dark:text-gray-500 mb-1">Descriere</p>
                <p className="text-gray-700 dark:text-gray-300 text-sm">{form.description}</p>
              </div>
            </div>
          </div>
        )}

        {/* ── Navigation buttons ── */}
        <div className="flex justify-between mt-8">
          {step > 1
            ? <button onClick={back}
                className="flex items-center gap-2 border-2 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 px-6 py-3 rounded-xl font-medium hover:border-blue-300 dark:hover:border-blue-600 transition-colors">
                <ArrowLeft size={16} /> Înapoi
              </button>
            : <div />}
          {step < 5
            ? <button onClick={next}
                disabled={(step===1 && !form.category)||(step===2 && !form.location)||(step===3 && (!form.title||!form.description))}
                className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-blue-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
                Continuă <ArrowRight size={16} />
              </button>
            : <button onClick={handleSubmit} disabled={loading}
                className="flex items-center gap-2 bg-blue-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50">
                {loading ? 'Se trimite...' : '✓ Trimite raportul'}
              </button>}
        </div>

      </div>
    </div>
  )
}