import { useState } from 'react'
import { RefreshCw } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { geocodeSector } from '../../lib/geocodeSector'

export default function SectorBackfillButton({ onDone }) {
  const [running, setRunning] = useState(false)
  const [progress, setProgress] = useState(null)
  const [result, setResult] = useState(null)

  async function run() {
    setRunning(true)
    setResult(null)
    const { data: missing, error: fetchError } = await supabase
      .from('reports')
      .select('id, latitude, longitude')
      .is('sector', null)
      .not('latitude', 'is', null)
      .not('longitude', 'is', null)

    if (fetchError) {
      setResult({ total: 0, updated: 0, error: fetchError.message })
      setRunning(false)
      return
    }

    const rows = missing || []
    let updated = 0
    let noSectorFound = 0
    let lastError = null
    for (let i = 0; i < rows.length; i++) {
      setProgress({ done: i, total: rows.length })
      const sector = await geocodeSector(rows[i].latitude, rows[i].longitude)
      if (!sector) { noSectorFound++; continue }
      const { error } = await supabase.rpc('admin_update_sector', { report_id: rows[i].id, new_sector: sector })
      if (!error) updated++
      else lastError = error.message
    }
    setProgress(null)
    setResult({ total: rows.length, updated, noSectorFound, error: lastError })
    setRunning(false)
    onDone?.()
  }

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center gap-3">
        <button
          onClick={run}
          disabled={running}
          className="flex items-center gap-2 h-11 px-4 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-sm font-semibold hover:border-primary-300 transition-colors disabled:opacity-50"
        >
          <RefreshCw size={16} className={running ? 'animate-spin' : ''} />
          {running
            ? progress ? `Se actualizează... (${progress.done}/${progress.total})` : 'Se pregătește...'
            : 'Actualizează sectoare lipsă'}
        </button>
        {result && !result.error && (
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {result.updated}/{result.total} actualizate
            {result.noSectorFound ? `, ${result.noSectorFound} fără sector detectat` : ''}
          </span>
        )}
      </div>
      {result?.error && (
        <span className="text-xs text-red-600">Eroare: {result.error}</span>
      )}
    </div>
  )
}
