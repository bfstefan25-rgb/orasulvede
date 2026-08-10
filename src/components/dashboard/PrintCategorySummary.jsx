// Print-only, plain-text stand-in for CategoryChart — SVG charts (Recharts'
// ResponsiveContainer) don't reliably re-render across the @media print
// layout pass, so the printed page gets a safe text list instead.
export default function PrintCategorySummary({ byCategory }) {
  const data = [...byCategory].filter(c => c.count > 0).sort((a, b) => b.count - a.count)

  return (
    <div className="hidden print:block bg-white rounded-2xl border border-gray-200 p-4">
      <h3 className="font-bold text-gray-900 text-sm mb-3">Sesizări pe categorie</h3>
      <ul className="text-sm space-y-1">
        {data.map(c => (
          <li key={c.id} className="flex justify-between">
            <span>{c.label}</span>
            <span className="font-semibold">{c.count}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
