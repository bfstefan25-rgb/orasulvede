// Centralized category/status taxonomy for the institutional dashboard.
// Deliberately separate from the per-page copies in Home/Map/Admin/Profile/
// Leaderboard/ReportDetail/Landing — those are out of scope for this feature.

export const CATEGORIES = [
  { id: 'Infrastructură', label: 'Infrastructură', color: '#f97316' },
  { id: 'Iluminat', label: 'Iluminat', color: '#eab308' },
  { id: 'Trafic', label: 'Trafic', color: '#ef4444' },
  { id: 'Canalizare', label: 'Canalizare', color: '#a855f7' },
  { id: 'Parcuri', label: 'Parcuri', color: '#22c55e' },
  { id: 'Gunoi', label: 'Gunoi', color: '#6b7280' },
  { id: 'Animale', label: 'Animale', color: '#3b82f6' },
  { id: 'Alte pericole', label: 'Alte pericole', color: '#1f2937' },
]

export const STATUSES = [
  { id: 'raportat', label: 'Raportat', color: '#2563eb' },
  { id: 'in_verificare', label: 'În verificare', color: '#ca8a04' },
  { id: 'in_lucru', label: 'În lucru', color: '#ea580c' },
  { id: 'rezolvat', label: 'Rezolvat', color: '#16a34a' },
  { id: 'respins', label: 'Respins', color: '#dc2626' },
]

export const SECTORS = [
  'Sector 1', 'Sector 2', 'Sector 3', 'Sector 4', 'Sector 5', 'Sector 6',
]

export const UNKNOWN_SECTOR = 'Necunoscut'

export function categoryColor(id) {
  return CATEGORIES.find(c => c.id === id)?.color || '#6b7280'
}

export function statusColor(id) {
  return STATUSES.find(s => s.id === id)?.color || '#6b7280'
}

export function statusLabel(id) {
  return STATUSES.find(s => s.id === id)?.label || id
}

// Priority 2: routing/assignment taxonomy. No department list existed
// anywhere in the app or DB — this is a reasonable fixed starting set for
// a Bucharest-style municipality, editable later without a schema change
// since `assigned_department` is plain text, not an enum.
export const DEPARTMENTS = [
  'Direcția Drumuri și Poduri',
  'Direcția Iluminat Public',
  'Compania de Apă',
  'Direcția Spații Verzi',
  'Direcția Salubrizare',
  'Control Animale',
  'Poliția Locală',
  'Alt departament',
]

const CATEGORY_DEPARTMENT_SUGGESTION = {
  'Infrastructură': 'Direcția Drumuri și Poduri',
  'Iluminat': 'Direcția Iluminat Public',
  'Trafic': 'Poliția Locală',
  'Canalizare': 'Compania de Apă',
  'Parcuri': 'Direcția Spații Verzi',
  'Gunoi': 'Direcția Salubrizare',
  'Animale': 'Control Animale',
  'Alte pericole': 'Poliția Locală',
}

export function suggestDepartment(category) {
  return CATEGORY_DEPARTMENT_SUGGESTION[category] || 'Alt departament'
}

// Lightweight, no-dependency category hint from free text — not AI, just
// keyword matching, offered to the admin as a suggestion they can apply.
const CATEGORY_KEYWORDS = {
  'Infrastructură': ['groapă', 'gropi', 'asfalt', 'trotuar', 'drum', 'pavaj', 'bordur'],
  'Iluminat': ['bec', 'stâlp', 'iluminat', 'lumină', 'felinar'],
  'Trafic': ['semafor', 'parcare', 'trafic', 'mașin', 'marcaj', 'circulați'],
  'Canalizare': ['canal', 'inund', 'apă', 'conduct', 'scurgere'],
  'Parcuri': ['parc', 'bancă', 'joacă', 'copaci', 'iarbă', 'spațiu verde'],
  'Gunoi': ['gunoi', 'deșeu', 'container', 'mizerie', 'gunoaie'],
  'Animale': ['câine', 'câini', 'pisic', 'animal'],
}

export function suggestCategory(text) {
  if (!text) return null
  const lower = text.toLowerCase()
  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    if (keywords.some(k => lower.includes(k))) return category
  }
  return null
}
