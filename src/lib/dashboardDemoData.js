// Synthetic, plausible dataset for demoing the dashboard before enough
// real reports exist. Never touches Supabase — pure client-side generation.
// Seeded (not Math.random()) so numbers stay stable across refreshes during
// a live pitch instead of jumping around confusingly.

import { CATEGORIES, STATUSES } from './reportTaxonomy'

const SECTOR_CENTERS = {
  'Sector 1': { lat: 44.4550, lng: 26.0730 },
  'Sector 2': { lat: 44.4480, lng: 26.1330 },
  'Sector 3': { lat: 44.4270, lng: 26.1560 },
  'Sector 4': { lat: 44.3950, lng: 26.1220 },
  'Sector 5': { lat: 44.4050, lng: 26.0700 },
  'Sector 6': { lat: 44.4350, lng: 26.0350 },
}
const SECTOR_WEIGHTS = [0.22, 0.14, 0.20, 0.12, 0.18, 0.14] // Sector 3 & 1 skew higher — a deliberately uneven demo, not a real finding
const STATUS_WEIGHTS = { raportat: 0.18, in_verificare: 0.14, in_lucru: 0.2, rezolvat: 0.42, respins: 0.06 }

// mulberry32 — tiny seeded PRNG so the dataset is deterministic across renders
function mulberry32(seed) {
  return function () {
    seed |= 0; seed = (seed + 0x6D2B79F5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function weightedPick(rand, entries) {
  const r = rand()
  let acc = 0
  for (const [value, weight] of entries) {
    acc += weight
    if (r <= acc) return value
  }
  return entries[entries.length - 1][0]
}

export function generateDemoDataset({ months = 12, seed = 42, countPerMonth = 55 } = {}) {
  const rand = mulberry32(seed)
  const sectorEntries = Object.keys(SECTOR_CENTERS).map((s, i) => [s, SECTOR_WEIGHTS[i]])
  const categoryEntries = CATEGORIES.map(c => [c.id, 1 / CATEGORIES.length])
  const statusEntries = Object.entries(STATUS_WEIGHTS)

  const now = new Date()
  const reports = []
  let id = 1

  for (let m = months - 1; m >= 0; m--) {
    const monthDate = new Date(now.getFullYear(), now.getMonth() - m, 1)
    const daysInMonth = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0).getDate()
    // gentle upward trend toward present, plus a bit of noise
    const growth = 0.6 + 0.4 * ((months - m) / months)
    const count = Math.round(countPerMonth * growth * (0.85 + rand() * 0.3))

    for (let i = 0; i < count; i++) {
      const sector = weightedPick(rand, sectorEntries)
      const category = weightedPick(rand, categoryEntries)
      const status = weightedPick(rand, statusEntries)
      const center = SECTOR_CENTERS[sector]
      const day = 1 + Math.floor(rand() * daysInMonth)
      const created_at = new Date(monthDate.getFullYear(), monthDate.getMonth(), day, Math.floor(rand() * 24)).toISOString()

      reports.push({
        id: `demo-${id++}`,
        category,
        status,
        sector,
        latitude: center.lat + (rand() - 0.5) * 0.03,
        longitude: center.lng + (rand() - 0.5) * 0.04,
        created_at,
        _timeToRouteDays: status === 'raportat' ? null : Math.round((1 + rand() * 8) * 10) / 10,
        _demo: true,
      })
    }
  }

  return reports
}
