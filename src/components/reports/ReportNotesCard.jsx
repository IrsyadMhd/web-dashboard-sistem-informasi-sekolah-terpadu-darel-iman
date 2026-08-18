import React from 'react'
import { FileText, Database, Calendar, UserCheck } from 'lucide-react'

export function ReportNotesCard({
  source = 'Database Utama Sistem Manajemen Sekolah Terpadu (PostgreSQL 17)',
  periodLabel = 'Periode Aktif',
  generatedAt,
  creator = 'Pengurus Yayasan',
  filtersSummary = 'Semua Unit Pendidikan',
}) {
  const formattedDate = generatedAt ? new Date(generatedAt).toLocaleString('id-ID', { dateStyle: 'long', timeStyle: 'short' }) + ' WIB' : 'Hari ini'

  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-[#1B2433] space-y-3">
      <div className="flex items-center gap-2 text-slate-800 dark:text-white font-bold text-sm">
        <FileText className="h-4 w-4 text-[#0E5C44] dark:text-emerald-400" />
        <span>Catatan & Identitas Laporan</span>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4 text-xs">
        <div className="flex items-start gap-2 text-slate-600 dark:text-slate-300">
          <Database className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold text-slate-400 block text-[10px]">SUMBER DATA</span>
            <span>{source}</span>
          </div>
        </div>

        <div className="flex items-start gap-2 text-slate-600 dark:text-slate-300">
          <Calendar className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold text-slate-400 block text-[10px]">PERIODE & TANGGAL</span>
            <span>{periodLabel} ({formattedDate})</span>
          </div>
        </div>

        <div className="flex items-start gap-2 text-slate-600 dark:text-slate-300">
          <UserCheck className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold text-slate-400 block text-[10px]">PEMBUAT LAPORAN</span>
            <span>{creator}</span>
          </div>
        </div>

        <div className="flex items-start gap-2 text-slate-600 dark:text-slate-300">
          <FileText className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold text-slate-400 block text-[10px]">FILTER AKTIF</span>
            <span>{filtersSummary}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
