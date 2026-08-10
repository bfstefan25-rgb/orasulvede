import { FileText, CalendarDays, CheckCircle2, Clock, Tag, MapPinned } from 'lucide-react'

function Kpi({ icon: Icon, label, value }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-4">
      <div className="w-8 h-8 bg-primary-50 dark:bg-blue-900/30 rounded-lg flex items-center justify-center mb-2">
        <Icon size={16} className="text-primary-600" />
      </div>
      <div className="text-xl font-black text-gray-900 dark:text-white leading-tight">{value}</div>
      <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{label}</div>
    </div>
  )
}

export default function KpiCards({ kpis }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
      <Kpi icon={FileText} label="Total sesizări" value={kpis.total} />
      <Kpi icon={CalendarDays} label="Luna aceasta" value={kpis.thisMonth} />
      <Kpi icon={CheckCircle2} label="Rată rezolvare" value={`${kpis.resolutionRate}%`} />
      <Kpi icon={Clock} label="Timp mediu până la alocare" value={kpis.avgTimeToRouteDays != null ? `${kpis.avgTimeToRouteDays} zile` : 'N/A'} />
      <Kpi icon={Tag} label="Categorie principală" value={kpis.topCategory || '—'} />
      <Kpi icon={MapPinned} label="Zonă critică" value={kpis.worstZone || '—'} />
    </div>
  )
}
