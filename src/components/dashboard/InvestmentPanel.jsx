import { TrendingUp } from 'lucide-react'
import { UNKNOWN_SECTOR } from '../../lib/reportTaxonomy'

export default function InvestmentPanel({ bySector, byCategory }) {
  const topZones = bySector.filter(z => z.sector !== UNKNOWN_SECTOR && z.count > 0).slice(0, 3)
  const topCategories = [...byCategory].sort((a, b) => b.count - a.count).filter(c => c.count > 0).slice(0, 3)

  const takeaway = topZones.length && topCategories.length
    ? `${topZones.map(z => z.sector).join(', ')} concentrează cel mai mare volum de sesizări, în special din categoria „${topCategories[0].label}”.`
    : 'Nu există suficiente date pentru o recomandare.'

  return (
    <div className="bg-primary-600 rounded-2xl p-4 md:p-6 text-white">
      <div className="flex items-center gap-2 mb-3">
        <TrendingUp size={18} />
        <h3 className="font-bold text-sm">Prioritizare investiții</h3>
      </div>
      <p className="text-sm text-blue-50 leading-relaxed mb-4">{takeaway}</p>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-xs text-blue-100 uppercase tracking-wide font-semibold mb-2">Top zone</p>
          <ol className="space-y-1 text-sm">
            {topZones.map((z, i) => (
              <li key={z.sector} className="flex justify-between">
                <span>{i + 1}. {z.sector}</span>
                <span className="font-bold">{z.count}</span>
              </li>
            ))}
          </ol>
        </div>
        <div>
          <p className="text-xs text-blue-100 uppercase tracking-wide font-semibold mb-2">Top categorii</p>
          <ol className="space-y-1 text-sm">
            {topCategories.map((c, i) => (
              <li key={c.id} className="flex justify-between">
                <span>{i + 1}. {c.label}</span>
                <span className="font-bold">{c.count}</span>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </div>
  )
}
