import { useMemo, useState } from 'react'
import { useSEO } from '../hooks/useSEO'
import { generateDemoDataset } from '../lib/dashboardDemoData'
import { aggregateReports, filterReports } from '../lib/dashboardAggregate'
import FilterBar from '../components/dashboard/FilterBar'
import DemoBanner from '../components/dashboard/DemoBanner'
import KpiCards from '../components/dashboard/KpiCards'
import CategoryChart from '../components/dashboard/CategoryChart'
import TrendChart from '../components/dashboard/TrendChart'
import ZoneRanking from '../components/dashboard/ZoneRanking'
import HeatmapView from '../components/dashboard/HeatmapView'
import InvestmentPanel from '../components/dashboard/InvestmentPanel'

const DEFAULT_FILTERS = { from: '', to: '', category: 'toate', sector: 'toate', status: 'toate' }

// Public, no-login preview of the institutional dashboard — always demo
// data, never touches Supabase. Meant to be a link a city-hall contact can
// reopen and forward after a pitch, without needing an institution_admin
// account.
export default function DashboardDemo() {
  useSEO({
    title: 'Dashboard instituțional — demo',
    description: 'Previzualizare a dashboard-ului instituțional OrasulVede, cu date demonstrative.',
  })

  const [filters, setFilters] = useState(DEFAULT_FILTERS)
  const demoReports = useMemo(() => generateDemoDataset(), [])
  const filtered = useMemo(() => filterReports(demoReports, filters), [demoReports, filters])
  const aggregated = useMemo(() => aggregateReports(filtered), [filtered])

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pb-24 md:pb-8">
      <div className="max-w-6xl mx-auto px-4 py-6 space-y-4">

        <div>
          <h1 className="text-xl md:text-2xl font-black text-gray-900 dark:text-white">Dashboard instituțional — previzualizare</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-0.5">Exemplu cu date demonstrative, pentru echipele din primărie</p>
        </div>

        <DemoBanner />

        <FilterBar filters={filters} onChange={setFilters} />

        <KpiCards kpis={aggregated.kpis} />

        <div className="grid md:grid-cols-2 gap-4">
          <CategoryChart byCategory={aggregated.byCategory} />
          <ZoneRanking bySector={aggregated.bySector} />
        </div>

        <TrendChart monthlyTrend={aggregated.monthlyTrend} />

        <HeatmapView reports={aggregated.reports} />

        <InvestmentPanel bySector={aggregated.bySector} byCategory={aggregated.byCategory} />

      </div>
    </div>
  )
}
