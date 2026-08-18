import React from 'react'
import { FaTimes, FaStar } from 'react-icons/fa'

export default function TahunAjaranDetailModal({ isOpen, onClose, data }) {
  if (!isOpen || !data) return null

  return (
    <div
      id="tahun-ajaran-detail-modal"
      className="overlay modal overlay-open:opacity-100 overlay-open:duration-300 fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-labelledby="tahun-ajaran-detail-title"
      tabIndex={-1}
    >
      <div className="modal-dialog font-sans w-full max-w-lg">
        <div className="modal-content flex max-h-[calc(100dvh-2rem)] flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-2xl dark:border-slate-700 dark:bg-[#1B2433]">
          {/* Modal Header */}
          <div className="modal-header flex items-center justify-between border-b border-slate-100 bg-white px-5 py-4 dark:border-slate-700 dark:bg-[#1B2433]">
            <h3 id="tahun-ajaran-detail-title" className="modal-title text-base font-bold text-slate-900 dark:text-white">
              Detail Master Data Tahun Ajaran
            </h3>
            <button
              type="button"
              onClick={onClose}
              className="btn btn-text btn-circle btn-sm absolute end-3 top-3 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200"
              aria-label="Tutup detail tahun ajaran"
              data-overlay="#tahun-ajaran-detail-modal"
            >
              <FaTimes className="size-4" />
            </button>
          </div>

          {/* Modal Content Body */}
          <div className="modal-body min-h-0 flex-1 space-y-5 overflow-y-auto p-5 text-sm text-slate-700 dark:text-slate-200">
            <div className="p-5 rounded-2xl bg-[#f8fafc] border border-slate-200/90 dark:bg-slate-800/50 dark:border-slate-700 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                  Nama Tahun Ajaran
                </span>
                <h3 className="text-2xl font-black text-[#0f172a] dark:text-white mt-1">{data.name}</h3>
                {data.kode && (
                  <span className="text-xs font-mono font-bold text-slate-500 mt-0.5 block">
                    {data.kode}
                  </span>
                )}
              </div>
              <div>
                {data.is_active ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-extrabold bg-[#054e3b] text-white shadow-xs">
                    <FaStar className="w-3 h-3 text-amber-300" /> Aktif Utama
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300">
                    Tidak Aktif
                  </span>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-xl bg-white border border-slate-200/90 dark:bg-slate-800/40 dark:border-slate-700">
                <span className="font-bold text-slate-500 uppercase tracking-wider block mb-1">
                  Tanggal Mulai
                </span>
                <span className="font-extrabold text-slate-900 dark:text-white text-sm">{data.start_date || '-'}</span>
              </div>

              <div className="p-4 rounded-xl bg-white border border-slate-200/90 dark:bg-slate-800/40 dark:border-slate-700">
                <span className="font-bold text-slate-500 uppercase tracking-wider block mb-1">
                  Tanggal Selesai
                </span>
                <span className="font-extrabold text-slate-900 dark:text-white text-sm">{data.end_date || '-'}</span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-white border border-slate-200/90 dark:bg-slate-800/40 dark:border-slate-700 text-xs space-y-1">
              <span className="font-bold text-slate-500 uppercase tracking-wider block mb-1">
                Deskripsi / Keterangan
              </span>
              <p className="text-slate-700 dark:text-slate-300 font-medium leading-relaxed">
                {data.keterangan || data.metadata?.keterangan || 'Tidak ada catatan khusus.'}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 text-[11px] text-slate-400 pt-3 border-t border-slate-100 dark:border-slate-700">
              <div>
                <span className="block font-semibold">Dibuat Pada:</span>
                <span className="text-slate-600 dark:text-slate-300 font-medium">{data.created_at || '-'}</span>
              </div>
              <div>
                <span className="block font-semibold">Terakhir Diperbarui:</span>
                <span className="text-slate-600 dark:text-slate-300 font-medium">{data.updated_at || '-'}</span>
              </div>
            </div>
          </div>

          {/* Modal Bottom Action Footer */}
          <div className="modal-footer flex items-center justify-end gap-3 border-t border-slate-100 bg-white px-5 py-4 dark:border-slate-700 dark:bg-[#1B2433]">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-soft btn-secondary"
              data-overlay="#tahun-ajaran-detail-modal"
            >
              Tutup Detail
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
