import React from 'react'
import { Sparkles, TrendingUp, Info } from 'lucide-react'

export function ReportInsightCard({ insights = {} }) {
  if (!insights || Object.keys(insights).length === 0) return null

  return (
    <div className="rounded-2xl border border-emerald-200/80 bg-emerald-50/60 p-5 dark:border-emerald-900/50 dark:bg-emerald-950/20 space-y-3">
      <div className="flex items-center gap-2 text-emerald-900 dark:text-emerald-300 font-bold text-sm">
        <Sparkles className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
        <span>Ringkasan Analisis & Indikator Laporan</span>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3">
        {Object.entries(insights).map(([key, val], idx) => (
          <div key={idx} className="rounded-xl bg-white p-3.5 shadow-sm border border-emerald-100 dark:border-slate-800 dark:bg-[#1B2433]">
            <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              {key.replace(/_/g, ' ')}
            </div>
            <div className="mt-1 text-xs font-bold text-slate-800 dark:text-white">
              {val}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
