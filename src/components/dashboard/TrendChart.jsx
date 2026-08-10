import { useState } from 'react'
import { AreaChart, Area, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { CATEGORIES } from '../../lib/reportTaxonomy'

export default function TrendChart({ monthlyTrend }) {
  const [byCategory, setByCategory] = useState(false)

  const data = monthlyTrend.map(m => ({
    label: m.label,
    total: m.total,
    ...Object.fromEntries(CATEGORIES.map(c => [c.id, m.byCategory[c.id] || 0])),
  }))

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-4 md:p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-gray-900 dark:text-white text-sm">Evoluție lunară</h3>
        <button
          onClick={() => setByCategory(v => !v)}
          className={`text-xs font-semibold px-3 py-1.5 rounded-full border transition-colors ${
            byCategory ? 'bg-primary-600 text-white border-primary-600' : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700'
          }`}
        >
          Pe categorii
        </button>
      </div>
      <ResponsiveContainer width="100%" height={280}>
        {byCategory ? (
          <AreaChart data={data} margin={{ left: -16 }}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-gray-100 dark:stroke-gray-700" />
            <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#9ca3af' }} />
            <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#9ca3af' }} />
            <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #e5e7eb', fontSize: 12 }} />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            {CATEGORIES.map(c => (
              <Area key={c.id} type="monotone" dataKey={c.id} name={c.label} stackId="1" stroke={c.color} fill={c.color} fillOpacity={0.7} />
            ))}
          </AreaChart>
        ) : (
          <LineChart data={data} margin={{ left: -16 }}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-gray-100 dark:stroke-gray-700" />
            <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#9ca3af' }} />
            <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#9ca3af' }} />
            <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #e5e7eb', fontSize: 12 }} formatter={(v) => [v, 'Sesizări']} />
            <Line type="monotone" dataKey="total" name="Total" stroke="#2563eb" strokeWidth={2.5} dot={{ r: 3 }} />
          </LineChart>
        )}
      </ResponsiveContainer>
    </div>
  )
}
