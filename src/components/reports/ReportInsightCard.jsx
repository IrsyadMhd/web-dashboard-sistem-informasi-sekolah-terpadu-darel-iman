import React from 'react'
import { Sparkles, Building2, GraduationCap, Scale } from 'lucide-react'
import { Card } from '@/components/tailgrids/core/card'

export function ReportInsightCard({ insights }) {
  if (!insights) return null

  // Normalize insights into an array of items with title & description
  let insightItems = []

  if (Array.isArray(insights)) {
    insightItems = insights.map((item, idx) => {
      if (typeof item === 'object' && item !== null) {
        return {
          id: idx,
          key: item.title || item.type || `insight_${idx}`,
          title: item.title || item.type || 'Indikator Analisis',
          description: item.description || item.val || '',
          type: item.type || 'info',
        }
      }
      return {
        id: idx,
        key: `insight_${idx}`,
        title: 'Indikator Analisis',
        description: String(item),
        type: 'info',
      }
    })
  } else if (typeof insights === 'object') {
    insightItems = Object.entries(insights).map(([key, val], idx) => {
      let desc = ''
      let title = key.replace(/_/g, ' ')

      if (typeof val === 'object' && val !== null) {
        title = val.title || val.type || title
        desc = val.description || val.val || JSON.stringify(val)
      } else {
        desc = String(val)
      }

      return {
        id: idx,
        key,
        title,
        description: desc,
        type: 'info',
      }
    })
  }

  if (insightItems.length === 0) return null

  const getIcon = (item) => {
    const k = (item.key + ' ' + item.title).toLowerCase()
    if (k.includes('unit') || k.includes('sekolah')) return <Building2 className="h-4.5 w-4.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
    if (k.includes('guru') || k.includes('sdm')) return <GraduationCap className="h-4.5 w-4.5 text-blue-600 dark:text-blue-400 shrink-0" />
    return <Scale className="h-4.5 w-4.5 text-purple-600 dark:text-purple-400 shrink-0" />
  }

  return (
    <Card className="border border-emerald-200/80 bg-gradient-to-r from-emerald-50/50 via-teal-50/30 to-emerald-50/50 dark:border-emerald-900/40 dark:bg-emerald-950/20 shadow-xs">
      {/* Header */}
      <div className="flex items-center gap-2.5 border-b border-emerald-100/80 px-5 py-4 dark:border-emerald-900/40 sm:px-6">
        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400">
          <Sparkles className="h-4 w-4" />
        </div>
        <h3 className="text-sm font-extrabold text-emerald-950 dark:text-emerald-300">
          Ringkasan Analisis & Indikator Laporan
        </h3>
      </div>

      {/* Content Grid with Generous Padding */}
      <div className="px-5 py-5 sm:px-6 sm:py-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {insightItems.map((item) => (
            <div
              key={item.id}
              className="flex items-start gap-3.5 rounded-2xl bg-white p-4.5 shadow-xs border border-emerald-100/90 dark:border-slate-800 dark:bg-[#1B2433] transition-all hover:border-emerald-300 dark:hover:border-slate-700"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-50 dark:bg-slate-800/90 shrink-0 mt-0.5 shadow-2xs">
                {getIcon(item)}
              </div>
              <div className="min-w-0 flex-1 space-y-1">
                <div className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                  {item.title}
                </div>
                <div className="text-xs font-bold text-slate-800 dark:text-white leading-relaxed break-words">
                  {item.description}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  )
}
