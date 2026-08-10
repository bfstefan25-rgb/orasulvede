// Turns a flat list of report-like objects ({category, status, sector,
// latitude, longitude, created_at}) into the shape every dashboard
// component consumes — used identically for real Supabase rows and for
// the synthetic demo dataset, so components never need to know the source.

import { CATEGORIES, SECTORS, UNKNOWN_SECTOR } from './reportTaxonomy'

const MONTH_LABELS = ['ian', 'feb', 'mar', 'apr', 'mai', 'iun', 'iul', 'aug', 'sep', 'oct', 'nov', 'dec']

function monthKey(date) {
  const d = new Date(date)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

function monthLabel(key) {
  const [y, m] = key.split('-').map(Number)
  return `${MONTH_LABELS[m - 1]} ${y}`
}

export function aggregateReports(reports) {
  const total = reports.length
  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const thisMonth = reports.filter(r => new Date(r.created_at) >= startOfMonth).length
  const resolved = reports.filter(r => r.status === 'rezolvat').length
  const resolutionRate = total ? Math.round((resolved / total) * 100) : 0

  const byCategoryMap = {}
  CATEGORIES.forEach(c => { byCategoryMap[c.id] = 0 })
  reports.forEach(r => { if (r.category in byCategoryMap) byCategoryMap[r.category]++ })
  const byCategory = CATEGORIES.map(c => ({ id: c.id, label: c.label, color: c.color, count: byCategoryMap[c.id] }))
  const topCategory = byCategory.reduce((a, b) => (b.count > (a?.count ?? -1) ? b : a), null)

  const bySectorMap = {}
  SECTORS.forEach(s => { bySectorMap[s] = 0 })
  bySectorMap[UNKNOWN_SECTOR] = 0
  reports.forEach(r => {
    const key = SECTORS.includes(r.sector) ? r.sector : UNKNOWN_SECTOR
    bySectorMap[key]++
  })
  const bySector = Object.entries(bySectorMap)
    .map(([sector, count]) => ({ sector, count }))
    .sort((a, b) => b.count - a.count)
  const worstZone = bySector.find(z => z.sector !== UNKNOWN_SECTOR && z.count > 0) || null

  const monthMap = {}
  reports.forEach(r => {
    const key = monthKey(r.created_at)
    if (!monthMap[key]) monthMap[key] = { month: key, label: monthLabel(key), total: 0, byCategory: {} }
    monthMap[key].total++
    monthMap[key].byCategory[r.category] = (monthMap[key].byCategory[r.category] || 0) + 1
  })
  const monthlyTrend = Object.values(monthMap).sort((a, b) => a.month.localeCompare(b.month))

  const timeToRouteValues = reports.map(r => r._timeToRouteDays).filter(v => typeof v === 'number')
  const avgTimeToRouteDays = timeToRouteValues.length
    ? Math.round((timeToRouteValues.reduce((a, b) => a + b, 0) / timeToRouteValues.length) * 10) / 10
    : null

  return {
    kpis: {
      total,
      thisMonth,
      resolutionRate,
      avgTimeToRouteDays,
      topCategory: topCategory?.count ? topCategory.label : null,
      worstZone: worstZone ? worstZone.sector : null,
    },
    byCategory,
    bySector,
    monthlyTrend,
    reports,
  }
}

export function filterReports(reports, { from, to, category, sector, status } = {}) {
  return reports.filter(r => {
    if (from && new Date(r.created_at) < new Date(from)) return false
    if (to && new Date(r.created_at) > new Date(to)) return false
    if (category && category !== 'toate' && r.category !== category) return false
    if (status && status !== 'toate' && r.status !== status) return false
    if (sector && sector !== 'toate') {
      const key = SECTORS.includes(r.sector) ? r.sector : UNKNOWN_SECTOR
      if (key !== sector) return false
    }
    return true
  })
}
