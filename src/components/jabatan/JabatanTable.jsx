import React from 'react'
import {
  RotateCcw as FaRedo,
  Network as FaSitemap,
  LockOpen as FaLockOpen,
  Lock as FaLock,
} from 'lucide-react'
import ActionDropdown from '../app/ActionDropdown'
import AppBadge from '../app/AppBadge'

export default function JabatanTable({
  data = [],
  onDetail,
  onEdit,
  onDelete,
  onRestore,
}) {
  return (
    <table className="w-full min-w-190 table-fixed text-left text-sm text-slate-600" aria-label="Daftar jabatan">
        <thead>
          <tr className="border-b border-slate-200/80 bg-slate-50/80 text-[10px] font-black uppercase tracking-[0.12em] text-slate-500">
            <th className="w-[5%] px-2 py-3 text-center">No</th>
            <th className="w-[19%] px-3 py-3">Identitas Jabatan</th>
            <th className="hidden w-[15%] px-3 py-3 md:table-cell">Unit & Level</th>
            <th className="hidden w-[13%] px-3 py-3 lg:table-cell">Atasan Langsung</th>
            <th className="hidden w-[15%] px-3 py-3 text-center xl:table-cell">Akses</th>
            <th className="hidden w-[13%] px-3 py-3 text-center sm:table-cell">Status</th>
            <th className="w-[20%] px-2 py-3 text-center">Aksi</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 text-sm">
          {data.map((item, index) => {
            const isTrashed = item.terhapus
            return (
              <tr
                key={item.id}
                className={`ui-row transition-colors hover:bg-emerald-50/40 ${
                  isTrashed ? 'bg-rose-50/40 opacity-75' : ''
                }`}
                style={{ animationDelay: `${Math.min(index * 35, 280)}ms` }}
              >
                {/* No & Urutan */}
                <td className="px-2 py-3 text-center text-xs font-bold text-slate-400">
                  {item.urutan ?? index + 1}
                </td>

                {/* Kode & Nama Jabatan */}
                <td className="px-3 py-3">
                  <div className="flex min-w-0 items-center gap-2.5">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-emerald-100 bg-emerald-50 text-emerald-800">
                      <FaSitemap className="h-4 w-4" />
                    </span>
                    <div className="min-w-0">
                      <div className="flex min-w-0 items-center gap-2 font-bold text-slate-800">
                        <span className="truncate text-xs dark:text-white">{item.nama_jabatan || item.name}</span>
                        {isTrashed && <AppBadge variant="danger">Terhapus</AppBadge>}
                      </div>
                      <span className="block truncate font-mono text-[9px] text-slate-500">
                        {item.kode_jabatan || item.code}
                      </span>
                      <span className="mt-0.5 block truncate text-[9px] text-slate-400 md:hidden">Level {item.level_jabatan} · {item.satuan_kerja || 'Belum ditentukan'}</span>
                      <span className="mt-0.5 block text-[9px] font-bold text-emerald-700">{item.jumlah_pegawai ?? 0} pegawai</span>
                    </div>
                  </div>
                </td>

                {/* Level & Unit Sekolah */}
                <td className="hidden px-3 py-3 md:table-cell">
                  <div className="space-y-1">
	                    <span className="inline-block px-2.5 py-0.5 text-xs font-semibold rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
	                      Level {item.level_jabatan}: {item.level_label}
	                    </span>
	                    <p className="text-xs font-bold text-emerald-800">{item.satuan_kerja || 'Belum ditentukan'}</p>
	                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {item.unit_sekolah ? (
                        <span className="font-medium text-slate-700">
                          {item.unit_sekolah.nama} ({item.unit_sekolah.kode})
                        </span>
                      ) : (
	                        <span className="italic text-slate-400">{item.scope_akses_label || 'Cakupan belum ditentukan'}</span>
                      )}
                    </p>
                  </div>
                </td>

                {/* Atasan Langsung */}
                <td className="hidden px-3 py-3 text-xs lg:table-cell">
                  {item.atasan_langsung ? (
                    <div className="font-medium text-slate-800 dark:text-slate-200">
                      {item.atasan_langsung.nama_jabatan}
                      <span className="block text-[11px] text-slate-500 font-mono">
                        ({item.atasan_langsung.kode_jabatan})
                      </span>
                    </div>
                  ) : (
                    <span className="text-slate-400 italic">Pimpinan Tertinggi</span>
                  )}
                </td>

                {/* Struktur & Login */}
                <td className="hidden px-3 py-3 xl:table-cell">
                  <div className="mx-auto flex max-w-28 flex-col items-stretch gap-1.5">
                    {/* Tampil Struktur */}
                    <span
                      className={`inline-flex min-h-7 items-center gap-1.5 rounded-lg border px-2 text-[10px] font-semibold leading-none ${
                        item.tampil_struktur
                          ? 'border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
                          : 'border-slate-200 bg-slate-100 text-slate-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400'
                      }`}
                      title="Visibilitas Bagan Struktur Organisasi"
                    >
                      <FaSitemap className="h-3.5 w-3.5 shrink-0" />
                      <span className="truncate">{item.tampil_struktur ? 'Struktur' : 'Sembunyi'}</span>
                    </span>

                    {/* Boleh Login */}
                    <span
                      className={`inline-flex min-h-7 items-center gap-1.5 rounded-lg border px-2 text-[10px] font-semibold leading-none ${
                        item.boleh_login
                          ? 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300'
                          : 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-900/30 dark:text-amber-300'
                      }`}
                      title="Hak Akses Login Akun Sistem"
                    >
                      {item.boleh_login ? <FaLockOpen className="h-3.5 w-3.5 shrink-0" /> : <FaLock className="h-3.5 w-3.5 shrink-0" />}
                      <span className="truncate">{item.boleh_login ? 'Login' : 'Non-Login'}</span>
                    </span>
                  </div>
                </td>

                {/* Status */}
                <td className="hidden px-3 py-3 text-center sm:table-cell">
                  <AppBadge
                    variant={isTrashed ? 'danger' : item.status === 'Aktif' || item.is_active ? 'success' : 'neutral'}
                    dot
                  >
                    {isTrashed ? 'Terhapus' : item.status || (item.is_active ? 'Aktif' : 'Nonaktif')}
                  </AppBadge>
                </td>

                {/* Actions */}
                <td className="px-2 py-3 text-center">
                  <div className="flex items-center justify-center">
                    <ActionDropdown
                      onView={() => onDetail(item)}
                      onEdit={!isTrashed ? () => onEdit(item) : undefined}
                      onDelete={!isTrashed ? () => onDelete(item) : undefined}
                      extraItems={isTrashed ? [{
                        label: 'Pulihkan',
                        icon: <FaRedo className="h-4 w-4 text-emerald-600" />,
                        onClick: () => onRestore(item),
                      }] : []}
                    />
                  </div>
                </td>
              </tr>
            )
          })}
        </tbody>
    </table>
  )
}
