import { UNKNOWN_SECTOR } from '../../lib/reportTaxonomy'

export default function ZoneRanking({ bySector }) {
  const max = Math.max(1, ...bySector.map(z => z.count))

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-4 md:p-6">
      <h3 className="font-bold text-gray-900 dark:text-white text-sm mb-4">Clasament zone</h3>
      <div className="space-y-2.5">
        {bySector.map((z, i) => (
          <div key={z.sector} className="flex items-center gap-3">
            <span className={`text-xs font-bold w-5 shrink-0 ${i === 0 && z.sector !== UNKNOWN_SECTOR ? 'text-red-600' : 'text-gray-400'}`}>
              {i + 1}
            </span>
            <span className="text-sm text-gray-700 dark:text-gray-300 w-24 shrink-0 truncate">{z.sector}</span>
            <div className="flex-1 h-2.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full ${i === 0 && z.sector !== UNKNOWN_SECTOR ? 'bg-red-500' : 'bg-primary-500'}`}
                style={{ width: `${(z.count / max) * 100}%` }}
              />
            </div>
            <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 w-8 text-right shrink-0">{z.count}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
