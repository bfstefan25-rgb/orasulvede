import { useEffect, useState, useMemo, useCallback } from 'react'
import { Sparkles, Download, Printer } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useSEO } from '../hooks/useSEO'
import { aggregateReports, filterReports } from '../lib/dashboardAggregate'
import { generateDemoDataset } from '../lib/dashboardDemoData'
import { toCSV, downloadCSV } from '../lib/csvExport'
import { statusLabel } from '../lib/reportTaxonomy'
import FilterBar from '../components/dashboard/FilterBar'
import DemoBanner from '../components/dashboard/DemoBanner'
import KpiCards from '../components/dashboard/KpiCards'
import CategoryChart from '../components/dashboard/CategoryChart'
import PrintCategorySummary from '../components/dashboard/PrintCategorySummary'
import TrendChart from '../components/dashboard/TrendChart'
import ZoneRanking from '../components/dashboard/ZoneRanking'
import HeatmapView from '../components/dashboard/HeatmapView'
import InvestmentPanel from '../components/dashboard/InvestmentPanel'
import SectorBackfillButton from '../components/dashboard/SectorBackfillButton'

const DEFAULT_FILTERS = { from: '', to: '', category: 'toate', sector: 'toate', status: 'toate' }

const CSV_COLUMNS = [
  { label: 'Titlu', value: r => r.title },
  { label: 'Categorie', value: r => r.category },
  { label: 'Status', value: r => statusLabel(r.status) },
  { label: 'Sector', value: r => r.sector || '' },
  { label: 'Adresă', value: r => r.address || '' },
  { label: 'Departament alocat', value: r => r.assigned_department || '' },
  { label: 'Responsabil', value: r => r.assigned_to || '' },
  { label: 'Data', value: r => new Date(r.created_at).toLocaleDateString('ro-RO') },
]

export default function Dashboard() {
  useSEO({ title: 'Dashboard instituțional', description: 'Analiză a sesizărilor cetățenilor pentru prioritizarea investițiilor.' })

  const [demoMode, setDemoMode] = useState(false)
  const [loading, setLoading] = useState(true)
  const [realReports, setRealReports] = useState([])
  const [filters, setFilters] = useState(DEFAULT_FILTERS)
  const [refreshTick, setRefreshTick] = useState(0)

  const fetchReal = useCallback(async () => {
    setLoading(true)
    const { data } = await supabase
      .from('reports')
      .select('id, title, category, status, sector, address, latitude, longitude, created_at, assigned_department, assigned_to')
    setRealReports(data || [])
    setLoading(false)
  }, [])

  useEffect(() => { fetchReal() }, [fetchReal, refreshTick])

  const demoReports = useMemo(() => generateDemoDataset(), [])
  const sourceReports = demoMode ? demoReports : realReports
  const filtered = useMemo(() => filterReports(sourceReports, filters), [sourceReports, filters])
  const aggregated = useMemo(() => aggregateReports(filtered), [filtered])

  const exportDisabled = demoMode || loading

  function exportCSV() {
    const csv = toCSV(aggregated.reports, CSV_COLUMNS)
    downloadCSV(`orasulvede-sesizari-${new Date().toISOString().slice(0, 10)}.csv`, csv)
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pb-24 md:pb-8 print:bg-white print:pb-0">
      <div className="max-w-6xl mx-auto px-4 py-6 space-y-4 print:space-y-3">

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-xl md:text-2xl font-black text-gray-900 dark:text-white">Dashboard instituțional</h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-0.5 print:hidden">Analiză sesizări pentru prioritizarea investițiilor</p>
          </div>
          <div className="flex items-center gap-2 print:hidden">
            <button
              onClick={exportCSV}
              disabled={exportDisabled}
              title={demoMode ? 'Dezactivat în modul demonstrativ' : ''}
              className="flex items-center gap-2 h-11 px-4 rounded-xl text-sm font-semibold border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 disabled:opacity-40 transition-colors"
            >
              <Download size={16} />
              Export CSV
            </button>
            <button
              onClick={() => window.print()}
              disabled={exportDisabled}
              title={demoMode ? 'Dezactivat în modul demonstrativ' : ''}
              className="flex items-center gap-2 h-11 px-4 rounded-xl text-sm font-semibold border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 disabled:opacity-40 transition-colors"
            >
              <Printer size={16} />
              Printează / PDF
            </button>
            <button
              onClick={() => setDemoMode(v => !v)}
              className={`flex items-center gap-2 h-11 px-4 rounded-xl text-sm font-semibold transition-colors ${
                demoMode ? 'bg-amber-500 text-white' : 'border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300'
              }`}
            >
              <Sparkles size={16} />
              Mod demonstrativ
            </button>
          </div>
        </div>

        {demoMode && <div className="print:hidden"><DemoBanner /></div>}

        <div className="print:hidden"><FilterBar filters={filters} onChange={setFilters} /></div>

        {!demoMode && (
          <div className="print:hidden"><SectorBackfillButton onDone={() => setRefreshTick(t => t + 1)} /></div>
        )}

        {loading && !demoMode ? (
          <div className="py-24 flex justify-center print:hidden">
            <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <>
            <KpiCards kpis={aggregated.kpis} />

            <div className="grid md:grid-cols-2 gap-4">
              <div className="print:hidden"><CategoryChart byCategory={aggregated.byCategory} /></div>
              <PrintCategorySummary byCategory={aggregated.byCategory} />
              <ZoneRanking bySector={aggregated.bySector} />
            </div>

            <div className="print:hidden"><TrendChart monthlyTrend={aggregated.monthlyTrend} /></div>

            <div className="print:hidden"><HeatmapView reports={aggregated.reports} /></div>

            <InvestmentPanel bySector={aggregated.bySector} byCategory={aggregated.byCategory} />
          </>
        )}

      </div>
    </div>
  )
}
