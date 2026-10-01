import React from 'react'
import { CalendarDays, Calendar, RotateCcw, Star, CheckCircle2, ShieldCheck } from 'lucide-react'
import ActionDropdown from '../app/ActionDropdown'

export default function TahunAjaranTable({
  data = [],
  page = 1,
  perPage = 15,
  onDetail,
  onEdit,
  onSetAktif,
  onDelete,
  onRestore,
}) {
  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full min-w-[700px] table-fixed text-left text-xs" aria-label="Daftar tahun ajaran">
        <thead className="bg-gradient-to-r from-emerald-100/90 via-teal-50/70 to-emerald-100/90 border-b-2 border-emerald-200/90 dark:from-emerald-950/90 dark:via-teal-950/70 dark:to-emerald-950/90 text-emerald-950 dark:text-emerald-200">
          <tr>
            <th className="w-12 px-3.5 py-3.5 text-center font-black text-[11px] uppercase tracking-wider">
              No
            </th>
            <th className="w-[40%] px-4 py-3.5 font-black text-[11px] uppercase tracking-wider">
              Identitas Periode Akademik
            </th>
            <th className="hidden px-4 py-3.5 font-black text-[11px] uppercase tracking-wider md:table-cell">
              Rentang Kalender
            </th>
            <th className="w-32 px-4 py-3.5 text-center font-black text-[11px] uppercase tracking-wider">
              Status Periode
            </th>
            <th className="w-20 px-3.5 py-3.5 text-center font-black text-[11px] uppercase tracking-wider">
              Aksi
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-emerald-100/80 dark:divide-emerald-900/40 bg-white dark:bg-[#1B2433]">
          {data.map((item, index) => {
            const deleted = Boolean(item.deleted_at)
            const isActive = Boolean(item.is_active)

            return (
              <tr
                key={item.id}
                className={`transition-colors duration-150 ${
                  deleted
                    ? 'bg-rose-50/40 hover:bg-rose-50/60 dark:bg-rose-950/15 dark:hover:bg-rose-950/25'
                    : isActive
                    ? 'bg-emerald-50/35 hover:bg-emerald-50/60 dark:bg-emerald-950/20 dark:hover:bg-emerald-950/30'
                    : 'hover:bg-emerald-50/30 dark:hover:bg-emerald-950/10'
                }`}
              >
                {/* Kolom Nomor */}
                <td className="px-3.5 py-3.5 text-center font-bold text-slate-400 dark:text-slate-500 tabular-nums">
                  {(page - 1) * perPage + index + 1}
                </td>

                {/* Kolom Identitas Periode */}
                <td className="px-4 py-3.5">
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div
                      className={`h-11 w-11 shrink-0 rounded-2xl flex items-center justify-center shadow-md border transition-transform group-hover:scale-105 ${
                        deleted
                          ? 'bg-gradient-to-br from-rose-500 to-red-600 text-white shadow-rose-500/20 border-rose-300/40'
                          : isActive
                          ? 'bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700 text-white shadow-emerald-600/30 border-emerald-300/40'
                          : 'bg-gradient-to-br from-slate-500 to-slate-600 text-white shadow-slate-500/20 border-slate-300/30'
                      }`}
                    >
                      <CalendarDays className="size-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <strong className="truncate text-sm font-black text-slate-900 dark:text-white">
                          {item.name}
                        </strong>
                        {isActive && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 dark:bg-emerald-900/60 px-2 py-0.5 text-[10px] font-extrabold text-emerald-800 dark:text-emerald-300 border border-emerald-300/60 dark:border-emerald-700/60">
                            <Star className="size-2.5 text-amber-500 fill-amber-400" />
                            Aktif
                          </span>
                        )}
                        {deleted && (
                          <span className="inline-flex items-center rounded-full bg-rose-100 dark:bg-rose-900/60 px-2 py-0.5 text-[10px] font-extrabold text-rose-700 dark:text-rose-300 border border-rose-200">
                            Terhapus
                          </span>
                        )}
                      </div>
                      <p className="mt-0.5 truncate text-[11px] font-medium text-slate-500 dark:text-slate-400">
                        {item.keterangan || item.metadata?.keterangan || 'Periode kalender akademik terpadu'}
                      </p>
                      {/* Mobile range fallback */}
                      <div className="mt-1 flex items-center gap-1 text-[10px] font-semibold text-slate-500 dark:text-slate-400 md:hidden">
                        <Calendar className="size-3 text-emerald-600 dark:text-emerald-400" />
                        <span>{item.start_date || '-'} s/d {item.end_date || '-'}</span>
                      </div>
                    </div>
                  </div>
                </td>

                {/* Kolom Rentang Tanggal (Desktop) */}
                <td className="hidden px-4 py-3.5 md:table-cell">
                  <div className="inline-flex items-center gap-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 px-3 py-1.5 shadow-2xs">
                    <Calendar className="size-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <div className="text-xs">
                      <span className="font-extrabold text-slate-900 dark:text-slate-100 tabular-nums">
                        {item.start_date || '-'}
                      </span>
                      <span className="mx-1.5 text-slate-400 font-bold">s/d</span>
                      <span className="font-extrabold text-slate-900 dark:text-slate-100 tabular-nums">
                        {item.end_date || '-'}
                      </span>
                    </div>
                  </div>
                </td>

                {/* Kolom Status Periode */}
                <td className="px-4 py-3.5 text-center">
                  {deleted ? (
                    <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-black bg-rose-50 text-rose-700 border border-rose-200/80 dark:bg-rose-950/60 dark:text-rose-400 dark:border-rose-800/60 shadow-2xs">
                      <span className="size-1.5 rounded-full bg-rose-500 animate-pulse" />
                      Terhapus
                    </span>
                  ) : isActive ? (
                    <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-black bg-emerald-50 text-emerald-800 border border-emerald-300/80 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-700/80 shadow-2xs">
                      <Star className="size-3 text-amber-500 fill-amber-400 shrink-0" />
                      Aktif Utama
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold bg-slate-100 text-slate-600 border border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700">
                      <span className="size-1.5 rounded-full bg-slate-400" />
                      Nonaktif
                    </span>
                  )}
                </td>

                {/* Kolom Aksi */}
                <td className="px-3.5 py-3.5 text-center">
                  <ActionDropdown
                    onView={!deleted ? () => onDetail?.(item) : undefined}
                    onEdit={!deleted ? () => onEdit?.(item) : undefined}
                    onDelete={!deleted ? () => onDelete?.(item) : undefined}
                    extraItems={
                      deleted
                        ? [
                            {
                              label: 'Pulihkan Data',
                              icon: <RotateCcw className="size-4 text-emerald-600" />,
                              onClick: () => onRestore?.(item),
                            },
                          ]
                        : !isActive
                        ? [
                            {
                              label: 'Jadikan Aktif Utama',
                              icon: <CheckCircle2 className="size-4 text-emerald-600" />,
                              onClick: () => onSetAktif?.(item),
                            },
                          ]
                        : []
                    }
                  />
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
