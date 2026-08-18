import React from 'react'
import { X, Printer, Download, ShieldCheck, Building2 } from 'lucide-react'

export function ReportPreviewModal({ isOpen, onClose, reportData, onPrint, onExportPdf }) {
  if (!isOpen || !reportData) return null

  const { report, summary, unit_recaps, details } = reportData
  const title = report?.title || 'Laporan Pengurus Yayasan'
  const periodLabel = report?.period?.label || 'Periode Aktif'
  const generatedAt = report?.generated_at ? new Date(report.generated_at).toLocaleString('id-ID') : new Date().toLocaleString('id-ID')

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm print:p-0">
      <div className="flex h-full max-h-[90vh] w-full max-w-4xl flex-col rounded-2xl bg-white shadow-2xl dark:bg-[#1B2433] print:max-h-full print:w-full print:rounded-none print:shadow-none">

        {/* Header toolbar */}
        <div className="flex items-center justify-between border-b border-slate-200 p-4 dark:border-slate-800 print:hidden">
          <div className="flex items-center gap-2 text-sm font-bold text-slate-800 dark:text-white">
            <ShieldCheck className="h-4 w-4 text-[#0E5C44]" />
            <span>Dokumen Preview Laporan</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onPrint}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 transition"
            >
              <Printer className="h-3.5 w-3.5" />
              <span>Cetak Document</span>
            </button>
            <button
              type="button"
              onClick={onExportPdf}
              className="inline-flex items-center gap-1.5 rounded-xl bg-[#0E5C44] px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-[#0B4936] transition"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Download PDF</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 transition"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Document Body */}
        <div className="flex-1 overflow-y-auto p-8 space-y-6 text-slate-800 dark:text-slate-100 font-sans">
          {/* Foundation Letterhead */}
          <div className="border-b-2 border-[#0E5C44] pb-4 text-center">
            <div className="inline-flex items-center gap-2 text-[#0E5C44] dark:text-emerald-400 font-black text-xl uppercase tracking-wide">
              <Building2 className="h-6 w-6" /> YAYASAN DAR EL-IMAN PADANG
            </div>
            <h2 className="mt-1 font-bold text-lg text-slate-900 dark:text-white uppercase">{title}</h2>
            <p className="text-xs text-slate-500">Periode: {periodLabel} • Dicetak: {generatedAt}</p>
          </div>

          {/* KPI Summary Grid */}
          {summary && (
            <div>
              <h4 className="font-bold text-xs uppercase text-[#0E5C44] dark:text-emerald-400 mb-2 border-l-2 border-[#0E5C44] pl-2">
                Ringkasan KPI Utama
              </h4>
              <div className="grid grid-cols-3 gap-3">
                {Object.entries(summary).map(([key, val], idx) => (
                  <div key={idx} className="rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-800">
                    <span className="text-[10px] font-semibold text-slate-400 uppercase block">{key.replace(/_/g, ' ')}</span>
                    <span className="text-sm font-black text-slate-800 dark:text-white">
                      {typeof val === 'number' ? val.toLocaleString('id-ID') : (val || '-')}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Unit Recap Table */}
          {unit_recaps && unit_recaps.length > 0 && (
            <div>
              <h4 className="font-bold text-xs uppercase text-[#0E5C44] dark:text-emerald-400 mb-2 border-l-2 border-[#0E5C44] pl-2">
                Rekapitulasi Per Unit Pendidikan
              </h4>
              <div className="overflow-x-auto rounded-lg border border-slate-200">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-[#0E5C44] text-white">
                    <tr>
                      {Object.keys(unit_recaps[0]).map((col, idx) => (
                        <th key={idx} className="p-2 border border-[#0E5C44] font-semibold">{col.replace(/_/g, ' ')}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {unit_recaps.map((row, rIdx) => (
                      <tr key={rIdx} className="border-b border-slate-200">
                        {Object.values(row).map((val, cIdx) => (
                          <td key={cIdx} className="p-2">{val}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Details Table Snippet */}
          {details && details.length > 0 && (
            <div>
              <h4 className="font-bold text-xs uppercase text-[#0E5C44] dark:text-emerald-400 mb-2 border-l-2 border-[#0E5C44] pl-2">
                Pratinjau Data Rinci
              </h4>
              <div className="overflow-x-auto rounded-lg border border-slate-200">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-slate-100 dark:bg-slate-800">
                    <tr>
                      {Object.keys(details[0]).filter(k => k !== 'id').map((col, idx) => (
                        <th key={idx} className="p-2 font-bold">{col.replace(/_/g, ' ')}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {details.slice(0, 10).map((row, rIdx) => (
                      <tr key={rIdx} className="border-b border-slate-200">
                        {Object.entries(row).filter(([k]) => k !== 'id').map(([, val], cIdx) => (
                          <td key={cIdx} className="p-2">{val}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Footer Notes */}
          <div className="border-t border-slate-200 pt-4 text-[10px] text-slate-400 flex justify-between">
            <span>Sistem Manajemen Sekolah Terpadu • Dokumentasi Pengurus Yayasan</span>
            <span>Halaman 1 / 1</span>
          </div>
        </div>

      </div>
    </div>
  )
}
