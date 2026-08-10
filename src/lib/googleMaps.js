// Shared Google Maps loader for the institutional dashboard, used only by
// HeatmapView.jsx. Kept separate from the hand-rolled loaders in Map.jsx and
// Report.jsx (different global bookkeeping names, not touching those files).
//
// Note: this used to also request the `visualization` library for
// google.maps.visualization.HeatmapLayer, but Google removed that API
// entirely as of Maps JavaScript API v3.65 (see canvasHeatmap.js for the
// hand-rolled replacement) — so this loader now just ensures core Maps
// is available, same as Map.jsx/Report.jsx's loaders.

const API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY

export function loadGoogleMaps(callback, onError) {
  if (window.google?.maps) {
    callback()
    return
  }

  if (!window.__ovMapsCallbacks) window.__ovMapsCallbacks = []
  window.__ovMapsCallbacks.push(callback)
  if (window.__ovMapsLoading) return
  window.__ovMapsLoading = true

  const script = document.createElement('script')
  script.src = `https://maps.googleapis.com/maps/api/js?key=${API_KEY}&callback=__ovMapsReady`
  script.async = true
  script.defer = true
  window.__ovMapsReady = () => {
    window.__ovMapsLoading = false
    ;(window.__ovMapsCallbacks || []).forEach(cb => cb())
    window.__ovMapsCallbacks = []
  }
  script.onerror = () => {
    window.__ovMapsLoading = false
    onError?.(new Error('Nu s-a putut încărca Google Maps.'))
  }
  document.head.appendChild(script)
}
