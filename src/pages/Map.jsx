import { useEffect, useRef, useState } from 'react'
import { Search } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { MarkerClusterer } from '@googlemaps/markerclusterer'
import { useSEO } from '../hooks/useSEO'

const CATEGORY_CONFIG = {
  'Infrastructură': { color: '#f97316' },
  'Iluminat':       { color: '#eab308' },
  'Trafic':         { color: '#ef4444' },
  'Canalizare':       { color: '#a855f7' },
  'Parcuri':        { color: '#22c55e' },
  'Gunoi':          { color: '#6b7280' },
  'Animale':        { color: '#3b82f6' },
  'Alte pericole':  { color: '#1f2937' },
}

const STATUS_CONFIG = {
  raportat:      { label: 'Raportat',      bg: '#dbeafe', color: '#1d4ed8' },
  in_verificare: { label: 'În verificare', bg: '#fef9c3', color: '#a16207' },
  in_lucru:      { label: 'În lucru',      bg: '#ffedd5', color: '#c2410c' },
  rezolvat:      { label: 'Rezolvat',      bg: '#dcfce7', color: '#15803d' },
  respins:       { label: 'Respins',       bg: '#fee2e2', color: '#b91c1c' },
}

function loadGoogleMaps(apiKey, callback) {
  if (window.google && window.google.maps) {
    callback()
    return
  }
  if (!window.__mapsCallbacks) window.__mapsCallbacks = []
  window.__mapsCallbacks.push(callback)
  if (window.__mapsLoading) return
  window.__mapsLoading = true
  const script = document.createElement('script')
  script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&callback=__mapsReady`
  script.async = true
  script.defer = true
  window.__mapsReady = () => {
    window.__mapsLoading = false
    ;(window.__mapsCallbacks || []).forEach(cb => cb())
    window.__mapsCallbacks = []
  }
  script.onerror = () => { window.__mapsLoading = false }
  document.head.appendChild(script)
}

export default function Map() {
  const mapRef = useRef(null)
  const mapInstance = useRef(null)
  const markersRef = useRef([])
  const clustererRef = useRef(null)
  const infoWindowRef = useRef(null)

  const [reports, setReports] = useState([])
  const [activeCategory, setActiveCategory] = useState('toate')
  const [search, setSearch] = useState('')
  const [mapReady, setMapReady] = useState(false)
  const [mapError, setMapError] = useState(false)
  const [loading, setLoading] = useState(true)
  const [showLegend, setShowLegend] = useState(true)
  useSEO({ title: 'Hartă', description: 'Vizualizează toate problemele raportate în orașul tău pe o hartă interactivă.' })

  // Fetch reports from Supabase
  useEffect(() => {
    async function fetchReports() {
      const { data, error } = await supabase
        .from('reports')
        .select('id, title, description, category, latitude, longitude, image_url, status, address')
        .not('latitude', 'is', null)
        .not('longitude', 'is', null)
      if (!error) setReports(data || [])
      setLoading(false)
    }
    fetchReports()
  }, [])

  // Load Google Maps once
  useEffect(() => {
    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY
    if (!apiKey || apiKey === 'your_google_maps_key_here') {
      setMapError(true)
      return
    }
    loadGoogleMaps(apiKey, () => {
      if (!mapRef.current) return
      mapInstance.current = new window.google.maps.Map(mapRef.current, {
        center: { lat: 44.4268, lng: 26.1025 },
        zoom: 13,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false,
        styles: [{ featureType: 'poi', elementType: 'labels', stylers: [{ visibility: 'off' }] }],
      })
      infoWindowRef.current = new window.google.maps.InfoWindow()
      setMapReady(true)
    })
  }, [])

  // Filtered reports
  const filtered = reports.filter(r => {
    const matchCat = activeCategory === 'toate' || r.category === activeCategory
    const matchSearch = !search ||
      r.title?.toLowerCase().includes(search.toLowerCase()) ||
      r.description?.toLowerCase().includes(search.toLowerCase())
    return matchCat && matchSearch
  })

  // Re-render markers on filter/data change
  useEffect(() => {
    if (!mapReady || !mapInstance.current) return

    clustererRef.current?.clearMarkers()
    markersRef.current.forEach(m => m.setMap(null))
    markersRef.current = []

    filtered.forEach(report => {
      const catConfig = CATEGORY_CONFIG[report.category] || { color: '#3b82f6' }
      const statusInfo = STATUS_CONFIG[report.status] || STATUS_CONFIG['raportat']

      const marker = new window.google.maps.Marker({
        position: { lat: report.latitude, lng: report.longitude },
        map: mapInstance.current,
        title: report.title,
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          scale: 11,
          fillColor: catConfig.color,
          fillOpacity: 1,
          strokeColor: '#ffffff',
          strokeWeight: 2.5,
        },
      })

      marker.addListener('click', () => {
        const imgHtml = report.image_url
          ? `<img src="${report.image_url}" style="width:100%;height:100px;object-fit:cover;border-radius:8px;margin-bottom:8px;" />`
          : ''
        const content = `
          <div style="padding:4px;max-width:220px;font-family:sans-serif;">
            ${imgHtml}
            <div style="font-weight:600;color:#111827;font-size:14px;margin-bottom:6px;">${report.title}</div>
            <div style="display:flex;gap:6px;align-items:center;flex-wrap:wrap;margin-bottom:8px;">
              <span style="background:${catConfig.color}22;color:${catConfig.color};padding:2px 8px;border-radius:99px;font-size:11px;font-weight:500;">${report.category}</span>
              <span style="background:${statusInfo.bg};color:${statusInfo.color};padding:2px 8px;border-radius:99px;font-size:11px;font-weight:500;">${statusInfo.label}</span>
            </div>
            <a href="/raport/${report.id}" style="display:block;text-align:center;background:#2563eb;color:white;padding:6px 12px;border-radius:8px;font-size:12px;font-weight:600;text-decoration:none;">
              Vezi detalii →
            </a>
          </div>`
        infoWindowRef.current.setContent(content)
        infoWindowRef.current.open(mapInstance.current, marker)
      })

      markersRef.current.push(marker)
    })

    clustererRef.current = new MarkerClusterer({
      map: mapInstance.current,
      markers: markersRef.current,
    })
  }, [mapReady, activeCategory, search, reports])

  // Category buttons with live counts
  const categoryCounts = reports.reduce((acc, r) => {
    acc[r.category] = (acc[r.category] || 0) + 1
    return acc
  }, {})

  const categoryButtons = [
    { id: 'toate', label: `Toate (${reports.length})` },
    ...Object.entries(CATEGORY_CONFIG).map(([name]) => ({
      id: name,
      label: categoryCounts[name] ? `${name} (${categoryCounts[name]})` : name,
    })),
  ]

  return (
    <div className="h-[calc(100vh-64px)] flex flex-col">
      {/* Search + filters */}
      <div className="bg-white px-4 py-3 shadow-sm z-10">
        <div className="max-w-6xl mx-auto">
          <div className="relative mb-3">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Caută probleme după titlu sau descriere..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-500"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {categoryButtons.map(cat => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all border ${
                  activeCategory === cat.id
                    ? 'bg-gray-900 text-white border-gray-900'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Map */}
      <div className="flex-1 relative">
        {mapError ? (
          <div className="w-full h-full flex items-center justify-center bg-gray-100">
            <div className="text-center p-8">
              <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">🗺️</span>
              </div>
              <h3 className="font-bold text-gray-900 mb-2">Harta nu este configurată</h3>
              <p className="text-gray-500 text-sm max-w-xs">
                Adaugă cheia Google Maps API în fișierul .env pentru a activa harta.
              </p>
            </div>
          </div>
        ) : (
          <div ref={mapRef} className="w-full h-full" />
        )}

        {/* Legend */}
        {!mapError && (
          <div className="absolute top-4 right-4 z-10">
            {showLegend ? (
              <div className="bg-white rounded-2xl shadow-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold text-gray-900 text-sm">Legendă</h4>
                  <button
                    onClick={() => setShowLegend(false)}
                    className="ml-3 text-gray-400 hover:text-gray-600 text-lg leading-none font-bold"
                    aria-label="Ascunde legenda"
                  >
                    ×
                  </button>
                </div>
                {Object.entries(CATEGORY_CONFIG).map(([name, cfg]) => (
                  <div key={name} className="flex items-center gap-2 mb-1.5">
                    <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: cfg.color }} />
                    <span className="text-xs text-gray-600">{name}</span>
                  </div>
                ))}
              </div>
            ) : (
              <button
                onClick={() => setShowLegend(true)}
                className="bg-white rounded-xl shadow-lg px-3 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Legendă
              </button>
            )}
          </div>
        )}

        {/* Loading spinner */}
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/60 z-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
          </div>
        )}

        {/* Empty state */}
        {mapReady && !loading && filtered.length === 0 && (
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-white rounded-2xl shadow-lg px-5 py-3 z-10 text-sm text-gray-500">
            Nicio problemă găsită pentru filtrele selectate.
          </div>
        )}
      </div>
    </div>
  )
}