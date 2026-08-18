import React from 'react'
import { RefreshCw, Eye, Printer, FileText, FileSpreadsheet, Calendar, ShieldCheck } from 'lucide-react'

export function ReportHeader({
  title,
  description,
  periodLabel,
  generatedAt,
  onRefresh,
  onOpenPreview,
  onPrint,
  onExportPdf,
  onExportExcel,
  loading = false,
}) {
  const formattedDate = generatedAt ? new Date(generatedAt).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' }) + ' WIB' : 'Baru saja'

  return (
    <div className="flex flex-col justify-between gap-4 rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-[#1B2433] md:flex-row md:items-center">
      <div>
        <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-[#0E5C44] dark:bg-emerald-950/40 dark:text-emerald-300">
          <ShieldCheck className="h-3.5 w-3.5" />
          <span>Laporan Pengurus Yayasan • Read-Only</span>
        </div>
        <h1 className="mt-2 text-2xl font-black text-slate-900 dark:text-white">{title}</h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{description}</p>

        <div className="mt-3 flex flex-wrap items-center gap-3 text-[11px] text-slate-500 dark:text-slate-400">
          <span className="inline-flex items-center gap-1 font-semibold text-emerald-700 dark:text-emerald-400">
            <Calendar className="h-3.5 w-3.5" /> {periodLabel || 'Periode Aktif'}
          </span>
          <span>•</span>
          <span>Diperbarui: {formattedDate}</span>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 print:hidden">
        <button
          type="button"
          onClick={onRefresh}
          disabled={loading}
          className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 transition disabled:opacity-50"
          title="Refresh Data"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span className="hidden sm:inline">Refresh</span>
        </button>

        <button
          type="button"
          onClick={onOpenPreview}
          className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-100 px-3.5 py-2 text-xs font-semibold text-slate-800 hover:bg-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 transition"
        >
          <Eye className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
          <span>Preview</span>
        </button>

        <button
          type="button"
          onClick={onPrint}
          className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 transition"
        >
          <Printer className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Cetak</span>
        </button>

        <button
          type="button"
          onClick={onExportPdf}
          className="inline-flex items-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2 text-xs font-semibold text-rose-700 hover:bg-rose-100 dark:border-rose-900/50 dark:bg-rose-950/30 dark:text-rose-300 transition"
        >
          <FileText className="h-3.5 w-3.5 text-rose-600" />
          <span>PDF</span>
        </button>

        <button
          type="button"
          onClick={onExportExcel}
          className="inline-flex items-center gap-1.5 rounded-xl bg-[#0E5C44] px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-[#0B4936] transition"
        >
          <FileSpreadsheet className="h-3.5 w-3.5" />
          <span>Excel</span>
        </button>
      </div>
    </div>
  )
}
