import { useEffect, useRef, useState } from 'react'
import { loadGoogleMaps } from '../../lib/googleMaps'
import { createCanvasHeatmapOverlay } from '../../lib/canvasHeatmap'

export default function HeatmapView({ reports }) {
  const mapRef = useRef(null)
  const mapInstanceRef = useRef(null)
  const overlayRef = useRef(null)
  const [ready, setReady] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    loadGoogleMaps(
      () => {
        if (!mapRef.current || mapInstanceRef.current) return
        try {
          mapInstanceRef.current = new window.google.maps.Map(mapRef.current, {
            center: { lat: 44.4268, lng: 26.1025 },
            zoom: 11,
            mapTypeControl: false,
            streetViewControl: false,
            fullscreenControl: false,
            styles: [{ featureType: 'poi', elementType: 'labels', stylers: [{ visibility: 'off' }] }],
          })
          const HeatmapOverlay = createCanvasHeatmapOverlay()
          overlayRef.current = new HeatmapOverlay()
          overlayRef.current.setMap(mapInstanceRef.current)
          setReady(true)
        } catch (err) {
          console.error('Heatmap init failed:', err)
          setError(`Harta nu a putut fi inițializată: ${err.message || err}`)
        }
      },
      (err) => {
        console.error('Google Maps load failed:', err)
        setError(`Harta nu a putut fi încărcată: ${err.message || err}`)
      }
    )
  }, [])

  useEffect(() => {
    if (!ready || !overlayRef.current) return
    try {
      const points = reports
        .map(r => ({ lat: Number(r.latitude), lng: Number(r.longitude) }))
        .filter(p => Number.isFinite(p.lat) && Number.isFinite(p.lng))
      overlayRef.current.setPoints(points)
    } catch (err) {
      console.error('Heatmap render failed:', err)
      setError(`Heatmap-ul nu a putut fi afișat: ${err.message || err}`)
    }
  }, [ready, reports])

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-4 md:p-6">
      <h3 className="font-bold text-gray-900 dark:text-white text-sm mb-4">Densitate sesizări</h3>
      {error ? (
        <div className="w-full h-72 md:h-96 rounded-xl bg-gray-50 dark:bg-gray-900 flex items-center justify-center text-sm text-gray-400 text-center px-6">
          {error}
        </div>
      ) : (
        <div ref={mapRef} className="w-full h-72 md:h-96 rounded-xl overflow-hidden" />
      )}
    </div>
  )
}
