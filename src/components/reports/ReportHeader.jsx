import React from 'react'
import { Calendar, ShieldCheck } from 'lucide-react'
import { Badge } from '@/components/tailgrids/core/badge'

export function ReportHeader({
  title,
  description,
  periodLabel,
  generatedAt,
}) {
  const formattedDate = generatedAt ? new Date(generatedAt).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' }) + ' WIB' : 'Baru saja'

  return (
    <div className="flex flex-col justify-between gap-4 rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-[#1B2433]">
      <div>
        <Badge color="success" size="sm" prefixIcon={<ShieldCheck className="h-3.5 w-3.5" />}>
          Laporan Pengurus Yayasan • Read-Only
        </Badge>
        <h1 className="mt-2.5 text-2xl font-black text-slate-900 dark:text-white">{title}</h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{description}</p>

        <div className="mt-3 flex flex-wrap items-center gap-3 text-[11px] text-slate-500 dark:text-slate-400">
          <span className="inline-flex items-center gap-1 font-semibold text-emerald-700 dark:text-emerald-400">
            <Calendar className="h-3.5 w-3.5" /> {periodLabel || 'Periode Aktif'}
          </span>
          <span>•</span>
          <span>Diperbarui: {formattedDate}</span>
        </div>
      </div>
    </div>
  )
}
