import React from 'react'
import { Printer, Download, ShieldCheck, Building2 } from 'lucide-react'
import { Dialog, DialogHeader, DialogTitle, DialogDescription, DialogBody, DialogClose } from '@/components/tailgrids/core/dialog'
import { Backdrop, OverlayWrapper } from '@/components/tailgrids/core/overlay'
import { Button } from '@/components/tailgrids/core/button'

export function ReportPreviewModal({ isOpen, onClose, reportData, onPrint, onExportPdf }) {
  if (!isOpen || !reportData) return null

  const { report, summary, unit_recaps, details } = reportData
  const title = report?.title || 'Laporan Pengurus Yayasan'
  const periodLabel = report?.period?.label || 'Periode Aktif'
  const generatedAt = report?.generated_at ? new Date(report.generated_at).toLocaleString('id-ID') : new Date().toLocaleString('id-ID')

  return (
    <OverlayWrapper isOpen={isOpen} onOpenChange={(open) => !open && onClose()}>
      <Backdrop className="print:hidden" isOpen={isOpen} onOpenChange={(open) => !open && onClose()} />
      <Dialog className="max-w-4xl max-h-[90vh] print:max-w-full print:max-h-none print:h-auto print:border-none print:shadow-none print:bg-white print:static print:p-0">
        <DialogHeader className="print:hidden">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 w-full pr-6">
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div>
                <DialogTitle>Dokumen Preview Laporan</DialogTitle>
                <DialogDescription>Pratinjau sebelum cetak atau ekspor PDF</DialogDescription>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={onPrint} prefixIcon={<Printer className="h-3.5 w-3.5" />}>
                Cetak
              </Button>
              <Button variant="success" appearance="fill" size="sm" onClick={onExportPdf} prefixIcon={<Download className="h-3.5 w-3.5" />}>
                Download PDF
              </Button>
            </div>
          </div>
          <DialogClose onClick={onClose} />
        </DialogHeader>

        <DialogBody className="space-y-6 py-4 overflow-y-auto max-h-[72vh] print:max-h-none print:overflow-visible print:p-0 print:text-slate-900 text-slate-800 dark:text-slate-100 font-sans">
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
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
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
        </DialogBody>
      </Dialog>
    </OverlayWrapper>
  )
}

