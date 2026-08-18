import React from 'react'
import { FileX, RotateCcw } from 'lucide-react'

export function ReportEmptyState({ onReset }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center dark:border-slate-800 dark:bg-[#1B2433] space-y-4">
      <div className="rounded-full bg-slate-100 p-4 text-slate-400 dark:bg-slate-800">
        <FileX className="h-10 w-10" />
      </div>
      <div>
        <h3 className="font-extrabold text-slate-800 dark:text-white text-base">Belum Ada Data Laporan</h3>
        <p className="mt-1 text-xs text-slate-500 max-w-md">
          Belum ada data laporan pada periode dan filter yang dipilih. Silakan ubah filter atau tekan tombol reset.
        </p>
      </div>

      {onReset && (
        <button
          type="button"
          onClick={onReset}
          className="inline-flex items-center gap-2 rounded-xl bg-[#0E5C44] px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-[#0B4936] transition"
        >
          <RotateCcw className="h-4 w-4" />
          Reset Filter
        </button>
      )}
    </div>
  )
}
