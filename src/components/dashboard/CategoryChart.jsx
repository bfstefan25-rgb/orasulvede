import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell, ResponsiveContainer } from 'recharts'

export default function CategoryChart({ byCategory }) {
  const data = [...byCategory].sort((a, b) => b.count - a.count)

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-4 md:p-6">
      <h3 className="font-bold text-gray-900 dark:text-white text-sm mb-4">Sesizări pe categorie</h3>
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={data} layout="vertical" margin={{ left: 8, right: 16 }}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-gray-100 dark:stroke-gray-700" horizontal={false} />
          <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11, fill: '#9ca3af' }} />
          <YAxis type="category" dataKey="label" width={110} tick={{ fontSize: 11, fill: '#6b7280' }} />
          <Tooltip
            contentStyle={{ borderRadius: 12, border: '1px solid #e5e7eb', fontSize: 12 }}
            formatter={(value) => [value, 'Sesizări']}
          />
          <Bar dataKey="count" radius={[0, 6, 6, 0]}>
            {data.map((entry) => <Cell key={entry.id} fill={entry.color} />)}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
