import React from 'react'
import { FileText, Calendar, UserCheck } from 'lucide-react'
import { Card } from '@/components/tailgrids/core/card'

export function ReportNotesCard({
  periodLabel = 'Periode Aktif',
  generatedAt,
  creator = 'Pengurus Yayasan',
  filtersSummary = 'Semua Unit Pendidikan',
}) {
  const formattedDate = generatedAt ? new Date(generatedAt).toLocaleString('id-ID', { dateStyle: 'long', timeStyle: 'short' }) + ' WIB' : 'Hari ini'

  return (
    <Card className="border border-slate-200/80 bg-white shadow-xs dark:border-slate-800 dark:bg-[#1B2433]">
      {/* Header */}
      <div className="flex items-center gap-2.5 border-b border-slate-100 px-5 py-4 dark:border-slate-800/80 sm:px-6">
        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
          <FileText className="h-4 w-4 text-[#0E5C44] dark:text-emerald-400" />
        </div>
        <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
          Catatan & Identitas Laporan
        </h3>
      </div>

      {/* Grid with 3 columns */}
      <div className="px-5 py-5 sm:px-6 sm:py-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 text-xs">
          <div className="flex items-start gap-3.5 rounded-2xl bg-slate-50/70 p-4 border border-slate-100 dark:border-slate-800 dark:bg-slate-900/50">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-white dark:bg-slate-800 shrink-0 mt-0.5 shadow-2xs">
              <Calendar className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div className="min-w-0 flex-1 space-y-1">
              <span className="font-extrabold text-slate-400 block text-[10px] uppercase tracking-wider">PERIODE & TANGGAL</span>
              <span className="font-semibold text-slate-700 dark:text-slate-200 leading-relaxed block">{periodLabel} ({formattedDate})</span>
            </div>
          </div>

          <div className="flex items-start gap-3.5 rounded-2xl bg-slate-50/70 p-4 border border-slate-100 dark:border-slate-800 dark:bg-slate-900/50">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-white dark:bg-slate-800 shrink-0 mt-0.5 shadow-2xs">
              <UserCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div className="min-w-0 flex-1 space-y-1">
              <span className="font-extrabold text-slate-400 block text-[10px] uppercase tracking-wider">PEMBUAT LAPORAN</span>
              <span className="font-semibold text-slate-700 dark:text-slate-200 leading-relaxed block">{creator}</span>
            </div>
          </div>

          <div className="flex items-start gap-3.5 rounded-2xl bg-slate-50/70 p-4 border border-slate-100 dark:border-slate-800 dark:bg-slate-900/50">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-white dark:bg-slate-800 shrink-0 mt-0.5 shadow-2xs">
              <FileText className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div className="min-w-0 flex-1 space-y-1">
              <span className="font-extrabold text-slate-400 block text-[10px] uppercase tracking-wider">FILTER AKTIF</span>
              <span className="font-semibold text-slate-700 dark:text-slate-200 leading-relaxed block">{filtersSummary}</span>
            </div>
          </div>
        </div>
      </div>
    </Card>
  )
}
