import React from 'react'
import { CalendarDays, Pencil, School, Sparkles, UserRound, X } from 'lucide-react'
import { renderJenisUnitIcon } from './JenisUnitTable'

export default function JenisUnitDetailModal({ isOpen, onClose, data, onEdit }) {
  if (!isOpen || !data) return null

  const badgeColor = data.warna_badge || '#10B981'

  return (
    <div
      id="jenis-unit-detail-modal"
      className="overlay modal overlay-open:opacity-100 overlay-open:duration-300 fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/70 backdrop-blur-md animate-fadeIn"
      role="dialog"
      aria-modal="true"
      aria-labelledby="jenis-unit-detail-title"
      tabIndex={-1}
      onMouseDown={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="modal-dialog font-sans my-auto w-full max-w-xl">
        <div className="modal-content flex max-h-[calc(100dvh-2.5rem)] flex-col overflow-hidden rounded-3xl border border-slate-200/90 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-950">
          {/* Top accent bar */}
          <div className="h-1.5 w-full bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-600 shrink-0" />

          {/* Header Modal */}
          <div className="modal-header flex items-center justify-between border-b border-slate-100 bg-white px-6 py-4.5 dark:border-slate-800 dark:bg-slate-950">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200/60 p-2.5 text-[#0E5C44] dark:from-emerald-950/60 dark:to-teal-950/40 dark:border-emerald-800/60 dark:text-[#3FBF75]">
                <School className="h-5 w-5" strokeWidth={2.25} />
              </div>
              <div>
                <h3 id="jenis-unit-detail-title" className="modal-title text-sm sm:text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                  Detail Jenis Unit Pendidikan
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-[#0E5C44] border border-emerald-200/80 dark:bg-emerald-950/60 dark:text-emerald-400 dark:border-emerald-800/60">
                    <Sparkles className="size-3" /> Read-Only
                  </span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Informasi lengkap jenis unit pendidikan terpadu.</p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Tutup detail jenis unit"
              className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200 transition-colors cursor-pointer"
            >
              <X className="size-4" strokeWidth={2.25} />
            </button>
          </div>

          {/* Content Body */}
          <div className="modal-body min-h-0 flex-1 space-y-4 overflow-y-auto p-6 text-xs text-slate-700 dark:text-slate-200">
            {/* Main Info Card */}
            <div className="p-4 bg-emerald-50/60 dark:bg-emerald-950/30 rounded-2xl border border-emerald-200/80 dark:border-emerald-900/40 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="p-3 bg-white dark:bg-slate-900 rounded-2xl shadow-2xs border border-emerald-200/60 dark:border-emerald-800/60 text-[#0E5C44] dark:text-[#3FBF75] shrink-0">
                  {renderJenisUnitIcon(data.icon, 'w-7 h-7')}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-lg bg-[#0E5C44] text-white uppercase tracking-wider">
                      {data.kode_jenis}
                    </span>
                    <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-lg bg-emerald-200 text-emerald-900 dark:bg-emerald-900/80 dark:text-emerald-200 uppercase tracking-wider">
                      {data.jenjang}
                    </span>
                  </div>
                  <h3 className="text-sm font-extrabold text-slate-900 dark:text-white mt-1.5">{data.nama_jenis}</h3>
                  <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-0.5">Singkatan: {data.singkatan || '-'}</p>
                </div>
              </div>

              <div className="text-right shrink-0">
                <span
                  className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-extrabold ${
                    data.status
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-200/80 dark:bg-emerald-950/80 dark:text-emerald-300 dark:border-emerald-800/60'
                      : 'bg-slate-100 text-slate-600 border border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700'
                  }`}
                >
                  {data.status ? '• Aktif' : '• Nonaktif'}
                </span>
              </div>
            </div>

            {/* Details Table Grid */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3.5 bg-slate-50/80 dark:bg-slate-900/40 rounded-2xl border border-slate-200/80 dark:border-slate-800">
                <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">Urutan Tampilan</p>
                <p className="text-sm font-extrabold text-slate-900 dark:text-white mt-1">{data.urutan}</p>
              </div>

              <div className="p-3.5 bg-slate-50/80 dark:bg-slate-900/40 rounded-2xl border border-slate-200/80 dark:border-slate-800">
                <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">Warna Badge</p>
                <div className="flex items-center gap-2 mt-1">
                  <span
                    className="w-4 h-4 rounded-full border border-slate-300 shadow-2xs"
                    style={{ backgroundColor: badgeColor }}
                  ></span>
                  <span className="text-xs font-mono font-bold text-slate-800 dark:text-slate-200 uppercase">
                    {badgeColor}
                  </span>
                </div>
              </div>
            </div>

            {/* Keterangan */}
            <div className="p-4 bg-slate-50/80 dark:bg-slate-900/40 rounded-2xl border border-slate-200/80 dark:border-slate-800">
              <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider mb-1">Keterangan / Deskripsi</p>
              <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 leading-relaxed">
                {data.keterangan || 'Tidak ada keterangan tambahan.'}
              </p>
            </div>

            {/* Audit Trail Info */}
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-500 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 font-medium text-slate-400">
                  <CalendarDays className="h-3.5 w-3.5 text-slate-400" />
                  Tanggal Dibuat:
                </span>
                <span className="font-bold text-slate-700 dark:text-slate-300">{data.created_at || '-'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 font-medium text-slate-400">
                  <UserRound className="h-3.5 w-3.5 text-slate-400" />
                  Dibuat Oleh:
                </span>
                <span className="font-bold text-slate-700 dark:text-slate-300">{data.created_by_name || 'Sistem'}</span>
              </div>
              {data.updated_at && (
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 font-medium text-slate-400">
                    <CalendarDays className="h-3.5 w-3.5 text-slate-400" />
                    Terakhir Diubah:
                  </span>
                  <span className="font-bold text-slate-700 dark:text-slate-300">{data.updated_at}</span>
                </div>
              )}
            </div>
          </div>

          {/* Modal Footer */}
          <div className="modal-footer flex items-center justify-end gap-3 border-t border-slate-100 bg-white px-6 py-4 dark:border-slate-800 dark:bg-slate-950">
            <button
              type="button"
              onClick={onClose}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200/90 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 shadow-2xs hover:bg-slate-100 hover:text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800 transition cursor-pointer"
            >
              <X className="size-4" />
              Tutup
            </button>
            {onEdit && (
              <button
                type="button"
                onClick={onEdit}
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#0E5C44] to-[#147B5B] hover:from-[#0B4A37] hover:to-[#0F6349] dark:from-[#147B5B] dark:to-[#1E8E5A] text-white px-5 py-2.5 text-xs font-extrabold shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer"
              >
                <Pencil className="size-4" />
                Edit Data
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
