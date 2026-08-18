import React from 'react'
import { AlertTriangle, RefreshCw } from 'lucide-react'

export function ReportErrorState({ onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-rose-200 bg-rose-50/50 p-12 text-center dark:border-rose-900/50 dark:bg-rose-950/20 space-y-4">
      <div className="rounded-full bg-rose-100 p-4 text-rose-600 dark:bg-rose-900/40">
        <AlertTriangle className="h-10 w-10" />
      </div>
      <div>
        <h3 className="font-extrabold text-rose-900 dark:text-rose-300 text-base">Laporan Tidak Dapat Dimuat</h3>
        <p className="mt-1 text-xs text-rose-700 dark:text-rose-400 max-w-md">
          Terjadi kesalahan koneksi atau pengolahan data pada server. Silakan coba kembali beberapa saat lagi.
        </p>
      </div>

      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="inline-flex items-center gap-2 rounded-xl bg-rose-700 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-rose-800 transition"
        >
          <RefreshCw className="h-4 w-4" />
          Coba Lagi
        </button>
      )}
    </div>
  )
}
