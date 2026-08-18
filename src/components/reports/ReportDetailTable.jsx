import React from 'react'
import { Eye, Search, ChevronLeft, ChevronRight } from 'lucide-react'

export function ReportDetailTable({
  title = 'Data Rinci Laporan',
  description = 'Daftar rincian data pembentuk angka laporan. Hanya aksi Lihat Detail yang tersedia.',
  columns = [],
  data = [],
  meta = null,
  search = '',
  onSearchChange,
  onPageChange,
  onViewDetail,
}) {
  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-[#1B2433] space-y-4">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h3 className="font-extrabold text-slate-900 dark:text-white text-base">{title}</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">{description}</p>
        </div>

        {onSearchChange && (
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Cari data..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 pl-9 pr-3 py-1.5 text-xs text-slate-700 outline-none focus:border-emerald-600 focus:bg-white dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
            />
          </div>
        )}
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
            <tr>
              {columns.map((col, idx) => (
                <th key={idx} className={`p-3 font-bold ${col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left'}`}>
                  {col.header}
                </th>
              ))}
              <th className="p-3 text-center font-bold">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white dark:divide-slate-800/60 dark:bg-[#111827]">
            {data.length === 0 ? (
              <tr>
                <td colSpan={columns.length + 1} className="p-6 text-center text-slate-500">
                  Tidak ada data rinci untuk ditampilkan.
                </td>
              </tr>
            ) : (
              data.map((row, rIdx) => (
                <tr key={rIdx} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition">
                  {columns.map((col, cIdx) => {
                    const rawVal = row[col.accessor]
                    const formatted = col.format ? col.format(rawVal, row) : rawVal

                    return (
                      <td key={cIdx} className={`p-3 text-slate-700 dark:text-slate-300 font-medium ${col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left'}`}>
                        {formatted ?? '-'}
                      </td>
                    )
                  })}
                  <td className="p-3 text-center">
                    <button
                      type="button"
                      onClick={() => onViewDetail && onViewDetail(row)}
                      className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-semibold text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-emerald-950/40 dark:hover:text-emerald-300 transition"
                    >
                      <Eye className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
                      <span>Lihat Detail</span>
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {meta && meta.last_page > 1 && (
        <div className="flex items-center justify-between pt-2 text-xs text-slate-500">
          <span>
            Menampilkan {((meta.current_page - 1) * meta.per_page) + 1} - {Math.min(meta.current_page * meta.per_page, meta.total)} dari {meta.total} data
          </span>

          <div className="flex items-center gap-1">
            <button
              type="button"
              disabled={meta.current_page <= 1}
              onClick={() => onPageChange && onPageChange(meta.current_page - 1)}
              className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1 text-xs font-semibold disabled:opacity-40"
            >
              <ChevronLeft className="h-3.5 w-3.5" /> Prev
            </button>
            <span className="px-2 font-bold text-slate-700 dark:text-slate-300">
              {meta.current_page} / {meta.last_page}
            </span>
            <button
              type="button"
              disabled={meta.current_page >= meta.last_page}
              onClick={() => onPageChange && onPageChange(meta.current_page + 1)}
              className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1 text-xs font-semibold disabled:opacity-40"
            >
              Next <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
