// Shared Bucharest-sector extraction from a Google Geocoder result's
// address_components. Used by both Report.jsx (new submissions) and the
// dashboard's sector-backfill action, so the parsing rule lives in one place.
//
// Google's Romanian-locale response often says "Sectorul 3" (definite
// article) rather than "Sector 3" — match either and normalize to "Sector N".

const SECTOR_WORD_RE = /sector/i
const DIGIT_RE = /([1-6])/

export function extractSector(addressComponents) {
  if (!addressComponents) return null

  const preferred = addressComponents.filter(c =>
    c.types?.includes('sublocality_level_1') || c.types?.includes('sublocality')
  )
  const pool = preferred.length ? preferred : addressComponents

  for (const c of pool) {
    const text = c.long_name || c.short_name || ''
    if (SECTOR_WORD_RE.test(text)) {
      const match = text.match(DIGIT_RE)
      if (match) return `Sector ${match[1]}`
    }
  }
  return null
}

export function geocodeSector(lat, lng) {
  return new Promise((resolve) => {
    if (!window.google?.maps) { resolve(null); return }
    const geocoder = new window.google.maps.Geocoder()
    geocoder.geocode({ location: { lat, lng }, language: 'ro' }, (results, status) => {
      if (status === 'OK' && results.length > 0) {
        resolve(extractSector(results[0].address_components))
      } else {
        resolve(null)
      }
    })
  })
}
