import React from 'react'
import { Printer, Download, Users } from 'lucide-react'
import {
  Dialog,
  DialogBody,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '../tailgrids/core/dialog'
import { Backdrop, OverlayWrapper } from '../tailgrids/core/overlay'
import { Button } from '../tailgrids/core/button'

export function PrintOptionModal({
  isOpen,
  onClose,
  onPrint,
  onDownload,
  title = 'Laporan',
  teachersList = [],
  selectedTeacherId = '',
  onTeacherChange,
}) {
  if (!isOpen) return null

  return (
    <OverlayWrapper isOpen={isOpen} onOpenChange={onClose}>
      <Backdrop isOpen={isOpen} onOpenChange={onClose}>
        <Dialog isOpen={isOpen} onOpenChange={onClose} showCloseButton={true} className="w-full max-w-md rounded-2xl p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2.5">
              <div className="size-9 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 flex items-center justify-center shrink-0">
                <Printer className="size-5" />
              </div>
              <span>Opsi Cetak & Unduh {title}</span>
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Silakan pilih format tindakan cetak dokumen murni atau unduh berkas data laporan.
            </DialogDescription>
          </DialogHeader>

          <DialogBody className="py-4 space-y-3">
            {/* Filter Cetak Berdasarkan Guru (Jika Tersedia) */}
            {Array.isArray(teachersList) && teachersList.length > 0 && (
              <div className="p-3.5 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-800/60 space-y-1.5">
                <label className="flex items-center gap-1.5 text-xs font-bold text-emerald-900 dark:text-emerald-300">
                  <Users className="size-4 text-emerald-700 dark:text-emerald-400" />
                  <span>Filter Cetak Berdasarkan Guru Pengampu</span>
                </label>
                <select
                  value={selectedTeacherId}
                  onChange={(e) => onTeacherChange && onTeacherChange(e.target.value)}
                  className="w-full h-10 px-3 text-xs font-semibold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-emerald-600 dark:text-white shadow-xs"
                >
                  <option value="">-- Semua Guru (Cetak Seluruh Jadwal) --</option>
                  {teachersList.map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.nama_lengkap} {g.niy ? `(NIY ${g.niy})` : ''}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Opsi 1: Cetak Langsung */}
            <button
              type="button"
              onClick={() => {
                onClose()
                onPrint()
              }}
              className="w-full flex items-center justify-between p-4 rounded-xl border border-emerald-200/90 bg-emerald-50/50 hover:bg-emerald-100/80 dark:border-emerald-800/60 dark:bg-emerald-950/40 dark:hover:bg-emerald-900/50 transition-all text-left group cursor-pointer"
            >
              <div className="flex items-center gap-3.5">
                <div className="size-10 rounded-xl bg-[#0E5C44] text-white flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
                  <Printer className="size-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100">🖨️ Cetak Langsung (Print)</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Cetak tampilan data murni via printer atau driver PDF</p>
                </div>
              </div>
            </button>

            {/* Opsi 2: Unduh Berkas PDF */}
            <button
              type="button"
              onClick={() => {
                onClose()
                onDownload()
              }}
              className="w-full flex items-center justify-between p-4 rounded-xl border border-rose-200/90 bg-rose-50/50 hover:bg-rose-100/80 dark:border-rose-800/60 dark:bg-rose-950/40 dark:hover:bg-rose-900/50 transition-all text-left group cursor-pointer"
            >
              <div className="flex items-center gap-3.5">
                <div className="size-10 rounded-xl bg-rose-600 text-white flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
                  <Download className="size-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100">📄 Unduh Berkas PDF (.pdf)</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Simpan dokumen laporan resmi dalam format PDF ke perangkat</p>
                </div>
              </div>
            </button>
          </DialogBody>

          <DialogFooter className="pt-2 flex justify-end">
            <Button variant="primary" appearance="outline" size="sm" onClick={onClose} className="rounded-xl px-4 py-2 text-xs font-semibold">
              Batal
            </Button>
          </DialogFooter>
        </Dialog>
      </Backdrop>
    </OverlayWrapper>
  )
}

export default PrintOptionModal
