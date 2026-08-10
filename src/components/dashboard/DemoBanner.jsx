import { Sparkles } from 'lucide-react'

export default function DemoBanner() {
  return (
    <div className="bg-amber-400 dark:bg-amber-500 text-amber-950 rounded-2xl px-4 py-3 flex items-center gap-2.5 font-semibold text-sm">
      <Sparkles size={18} className="shrink-0" />
      Date demonstrative — proiecție (nu reflectă date reale)
    </div>
  )
}
