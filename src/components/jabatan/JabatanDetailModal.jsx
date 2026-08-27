import React from 'react'
import { Briefcase, Pencil, Sparkles, Tag, UserPen, Users, X } from 'lucide-react'

export default function JabatanDetailModal({ isOpen, onClose, jabatan = null, onEdit }) {
  if (!isOpen || !jabatan) return null

  const badgeWarna = jabatan.warna || '#3B82F6'

  return (
    <div
      id="jabatan-detail-modal"
      className="overlay modal overlay-open:opacity-100 overlay-open:duration-300 fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/70 backdrop-blur-md animate-fadeIn"
      role="dialog"
      aria-modal="true"
      aria-labelledby="detail-jabatan-title"
      tabIndex={-1}
      onMouseDown={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="modal-dialog font-sans my-auto w-full max-w-2xl">
        <div className="modal-content flex max-h-[calc(100dvh-2.5rem)] flex-col overflow-hidden rounded-3xl border border-slate-200/90 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-950">
          {/* Top accent bar */}
          <div className="h-1.5 w-full bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-600 shrink-0" />

          {/* Header Bar */}
          <div className="modal-header flex items-center justify-between border-b border-slate-100 bg-white px-6 py-4.5 dark:border-slate-800 dark:bg-slate-950">
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-2xl flex items-center justify-center text-white shadow-md font-bold text-lg shrink-0"
                style={{ backgroundColor: badgeWarna }}
              >
                <Briefcase className="w-5 h-5" />
              </div>
              <div>
                <h3 id="detail-jabatan-title" className="modal-title flex items-center gap-2 text-sm sm:text-base font-black text-slate-900 dark:text-white">
                  <span>{jabatan.nama_jabatan || jabatan.name}</span>
                  <span className="text-xs font-mono px-2.5 py-0.5 rounded-lg bg-slate-100 text-slate-800 font-bold dark:bg-slate-800 dark:text-slate-200">
                    {jabatan.kode_jabatan || jabatan.code}
                  </span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Detail atribut master jabatan & riwayat audit trail.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200 transition-colors cursor-pointer"
              aria-label="Close"
            >
              <X className="size-4" strokeWidth={2.25} />
            </button>
          </div>

          {/* Content Body */}
          <div className="modal-body min-h-0 flex-1 space-y-4 overflow-y-auto p-6 text-xs text-slate-700 dark:text-slate-200">
            {/* Status Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50/60 p-4 rounded-2xl border border-slate-200/90 dark:bg-slate-900/40 dark:border-slate-800">
              <div>
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Status</span>
                <span className={`inline-block mt-1 px-3 py-0.5 rounded-full text-xs font-extrabold ${
                  jabatan.status === 'Aktif' || jabatan.is_active
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-200/80 dark:bg-emerald-950/80 dark:text-emerald-300 dark:border-emerald-800/60'
                    : 'bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                }`}>
                  {jabatan.status || (jabatan.is_active ? 'Aktif' : 'Nonaktif')}
                </span>
              </div>

              <div>
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Level Hirarki</span>
                <span className="text-xs font-extrabold text-slate-900 dark:text-white block mt-1">
                  Level {jabatan.level_jabatan}: {jabatan.level_label}
                </span>
              </div>

              <div>
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Bagan Struktur</span>
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 block mt-1">
                  {jabatan.tampil_struktur ? 'Ditampilkan' : 'Disembunyikan'}
                </span>
              </div>

              <div>
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Login Sistem</span>
                <span className={`text-xs font-extrabold block mt-1 ${
                  jabatan.boleh_login ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'
                }`}>
                  {jabatan.boleh_login ? 'Diizinkan Login' : 'Hanya Struktural'}
                </span>
              </div>
            </div>

            {/* Detailed Info Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5 text-[#0E5C44] dark:text-[#3FBF75]" />
                  <span>Atribut Jabatan</span>
                </h4>

                <div className="bg-white rounded-2xl p-4 border border-slate-200/90 space-y-2 text-xs dark:bg-slate-900/40 dark:border-slate-800">
                  <div className="flex justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                    <span className="text-slate-500 font-medium">Satuan Kerja:</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">{jabatan.satuan_kerja || '-'}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                    <span className="text-slate-500 font-medium">Cakupan Akses:</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">{jabatan.scope_akses_label || '-'}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                    <span className="text-slate-500 font-medium">Unit Sekolah:</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">
                      {jabatan.unit_sekolah ? `${jabatan.unit_sekolah.nama} (${jabatan.unit_sekolah.kode})` : 'Seluruh Unit / Yayasan'}
                    </span>
                  </div>
                  <div className="flex justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                    <span className="text-slate-500 font-medium">Atasan Langsung:</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">
                      {jabatan.atasan_pegawai?.nama_pegawai || (jabatan.atasan_langsung ? jabatan.atasan_langsung.nama_jabatan : 'Pimpinan Tertinggi')}
                    </span>
                  </div>
                  <div className="flex justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                    <span className="text-slate-500 font-medium">Role Sistem:</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">
                      {jabatan.role_sistem?.name || 'Default / Manual'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-medium">Urutan Tampilan:</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">
                      Ke-{jabatan.urutan ?? 0}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-[#0E5C44] dark:text-[#3FBF75]" />
                  <span>Statistik Pemakaian</span>
                </h4>

                <div className="bg-white rounded-2xl p-4 border border-slate-200/90 space-y-2 text-xs dark:bg-slate-900/40 dark:border-slate-800">
                  <div className="flex justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                    <span className="text-slate-500 font-medium">Total Pegawai Menjabat:</span>
                    <span className="font-extrabold text-[#0E5C44] dark:text-[#3FBF75]">
                      {jabatan.jumlah_pegawai ?? 0} Orang
                    </span>
                  </div>
                  <div className="flex justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                    <span className="text-slate-500 font-medium">Pilihan Ikon:</span>
                    <span className="font-bold font-mono text-slate-800 dark:text-slate-200">
                      {jabatan.ikon || 'UserCheck'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-medium">Kode Warna Hex:</span>
                    <span className="font-bold font-mono text-slate-800 dark:text-slate-200 flex items-center">
                      <span className="w-3 h-3 rounded-full mr-1.5 shadow-2xs" style={{ backgroundColor: badgeWarna }} />
                      {badgeWarna}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Deskripsi */}
            <div className="space-y-1.5">
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-500">
                Deskripsi & Job Description
              </h4>
              <div className="p-4 bg-slate-50/60 rounded-2xl border border-slate-200/90 text-xs text-slate-700 dark:bg-slate-900/40 dark:border-slate-800 dark:text-slate-300 leading-relaxed font-semibold">
                {jabatan.deskripsi || jabatan.description || 'Tidak ada deskripsi rinci yang dimasukkan.'}
              </div>
            </div>

            {/* Audit Trail Section */}
            <div className="border-t border-slate-100 dark:border-slate-800 pt-3 space-y-2">
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <UserPen className="w-3.5 h-3.5 text-[#0E5C44] dark:text-[#3FBF75]" />
                <span>Audit Trail (Riwayat Pembuatan)</span>
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-slate-50/60 p-4 rounded-2xl border border-slate-200/90 dark:bg-slate-900/40 dark:border-slate-800">
                <div>
                  <span className="text-slate-400 block text-[10px] font-bold uppercase tracking-wider">Dibuat Pada:</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    {jabatan.created_at ? new Date(jabatan.created_at).toLocaleString('id-ID') : '-'}
                  </span>
                  {jabatan.created_by?.name && (
                    <span className="block text-[11px] text-slate-500 font-semibold mt-0.5">Oleh: {jabatan.created_by.name}</span>
                  )}
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] font-bold uppercase tracking-wider">Terakhir Diperbarui:</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    {jabatan.updated_at ? new Date(jabatan.updated_at).toLocaleString('id-ID') : '-'}
                  </span>
                  {jabatan.updated_by?.name && (
                    <span className="block text-[11px] text-slate-500 font-semibold mt-0.5">Oleh: {jabatan.updated_by.name}</span>
                  )}
                </div>
              </div>
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
