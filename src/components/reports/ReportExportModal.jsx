import React, { useState } from 'react'
import { X, FileSpreadsheet, FileText, Download } from 'lucide-react'

export function ReportExportModal({ isOpen, onClose, onConfirmExport }) {
  const [includeSummary, setIncludeSummary] = useState(true)
  const [includeCharts, setIncludeCharts] = useState(true)
  const [includeRecap, setIncludeRecap] = useState(true)
  const [includeDetails, setIncludeDetails] = useState(true)

  const [format, setFormat] = useState('excel')
  const [orientation, setOrientation] = useState('landscape')

  if (!isOpen) return null

  const handleDownload = () => {
    if (onConfirmExport) {
      onConfirmExport({
        format,
        orientation,
        options: {
          summary: includeSummary,
          charts: includeCharts,
          recap: includeRecap,
          details: includeDetails,
        },
      })
    }
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl dark:bg-[#1B2433] space-y-5">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
          <div className="flex items-center gap-2 text-base font-extrabold text-slate-900 dark:text-white">
            <Download className="h-5 w-5 text-[#0E5C44] dark:text-emerald-400" />
            <span>Opsi Export Laporan</span>
          </div>
          <button onClick={onClose} className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content options */}
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Isi Laporan Ditampilkan</label>
          <div className="space-y-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={includeSummary} onChange={(e) => setIncludeSummary(e.target.checked)} className="rounded text-[#0E5C44] focus:ring-0" />
              <span>Ringkasan KPI</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={includeCharts} onChange={(e) => setIncludeCharts(e.target.checked)} className="rounded text-[#0E5C44] focus:ring-0" />
              <span>Grafik Visualisasi</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={includeRecap} onChange={(e) => setIncludeRecap(e.target.checked)} className="rounded text-[#0E5C44] focus:ring-0" />
              <span>Rekap Per Unit Pendidikan</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={includeDetails} onChange={(e) => setIncludeDetails(e.target.checked)} className="rounded text-[#0E5C44] focus:ring-0" />
              <span>Tabel Data Rinci</span>
            </label>
          </div>
        </div>

        {/* Format Selection */}
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Format File</label>
          <div className="grid grid-cols-2 gap-3 text-xs font-semibold">
            <button
              type="button"
              onClick={() => setFormat('excel')}
              className={`flex items-center justify-center gap-2 rounded-xl p-3 border transition ${format === 'excel' ? 'border-[#0E5C44] bg-emerald-50 text-[#0E5C44] dark:bg-emerald-950/40 dark:text-emerald-300' : 'border-slate-200 dark:border-slate-800'}`}
            >
              <FileSpreadsheet className="h-4 w-4 text-emerald-600" />
              Excel (.xlsx)
            </button>
            <button
              type="button"
              onClick={() => setFormat('pdf')}
              className={`flex items-center justify-center gap-2 rounded-xl p-3 border transition ${format === 'pdf' ? 'border-rose-600 bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300' : 'border-slate-200 dark:border-slate-800'}`}
            >
              <FileText className="h-4 w-4 text-rose-600" />
              PDF (.pdf)
            </button>
          </div>
        </div>

        {/* Orientation for PDF */}
        {format === 'pdf' && (
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Orientasi Halaman PDF</label>
            <div className="grid grid-cols-2 gap-3 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setOrientation('portrait')}
                className={`rounded-xl p-2.5 border text-center transition ${orientation === 'portrait' ? 'border-emerald-600 bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300' : 'border-slate-200 dark:border-slate-800'}`}
              >
                Portrait (Tegak)
              </button>
              <button
                type="button"
                onClick={() => setOrientation('landscape')}
                className={`rounded-xl p-2.5 border text-center transition ${orientation === 'landscape' ? 'border-emerald-600 bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300' : 'border-slate-200 dark:border-slate-800'}`}
              >
                Landscape (Mendatar)
              </button>
            </div>
          </div>
        )}

        <div className="flex gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-xl border border-slate-200 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={handleDownload}
            className="flex-1 rounded-xl bg-[#0E5C44] py-2.5 text-xs font-semibold text-white hover:bg-[#0B4936] transition shadow-sm"
          >
            Unduh Sekarang
          </button>
        </div>
      </div>
    </div>
  )
}
