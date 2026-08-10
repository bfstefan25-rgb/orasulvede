import { CATEGORIES, STATUSES, SECTORS, UNKNOWN_SECTOR } from '../../lib/reportTaxonomy'

const selectClass = 'h-11 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm px-3 focus:outline-none focus:border-primary-500'

export default function FilterBar({ filters, onChange }) {
  const set = (key) => (e) => onChange({ ...filters, [key]: e.target.value })

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-4 grid grid-cols-2 md:grid-cols-5 gap-3">
      <div className="col-span-1">
        <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">De la</label>
        <input type="date" value={filters.from} onChange={set('from')} className={selectClass + ' w-full'} />
      </div>
      <div className="col-span-1">
        <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">Până la</label>
        <input type="date" value={filters.to} onChange={set('to')} className={selectClass + ' w-full'} />
      </div>
      <div className="col-span-1">
        <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">Categorie</label>
        <select value={filters.category} onChange={set('category')} className={selectClass + ' w-full'}>
          <option value="toate">Toate</option>
          {CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
        </select>
      </div>
      <div className="col-span-1">
        <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">Sector</label>
        <select value={filters.sector} onChange={set('sector')} className={selectClass + ' w-full'}>
          <option value="toate">Toate</option>
          {SECTORS.map(s => <option key={s} value={s}>{s}</option>)}
          <option value={UNKNOWN_SECTOR}>{UNKNOWN_SECTOR}</option>
        </select>
      </div>
      <div className="col-span-2 md:col-span-1">
        <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">Status</label>
        <select value={filters.status} onChange={set('status')} className={selectClass + ' w-full'}>
          <option value="toate">Toate</option>
          {STATUSES.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
        </select>
      </div>
    </div>
  )
}
