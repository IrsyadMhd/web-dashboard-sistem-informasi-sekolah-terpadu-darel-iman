import React from 'react'
import {
  RotateCcw,
  Calendar,
  Building2,
  Tag,
} from 'lucide-react'
import ActionDropdown from '../app/ActionDropdown'
import AppBadge from '../app/AppBadge'

export default function KurikulumTable({
  data = [],
  page = 1,
  perPage = 15,
  onDetail,
  onEdit,
  onDelete,
  onRestore,
}) {
  const getJenisBadgeColor = (jenis) => {
    switch (jenis) {
      case 'SIT':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200'
      case 'Merdeka':
        return 'bg-blue-50 text-blue-700 border-blue-200'
      case 'Nasional':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200'
      case 'Pesantren':
        return 'bg-amber-50 text-amber-700 border-amber-200'
      case 'Lokal':
        return 'bg-purple-50 text-purple-700 border-purple-200'
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200'
    }
  }

  return (
    <table className="w-full min-w-245 text-left border-collapse" aria-label="Daftar kurikulum">
      <thead className="bg-gradient-to-r from-emerald-100/90 via-teal-50/70 to-emerald-100/90 border-b-2 border-emerald-200/90 dark:from-emerald-950/90 dark:via-teal-950/70 dark:to-emerald-950/90">
        <tr className="border-b-2 border-emerald-200/90 dark:border-emerald-800/80 bg-transparent text-emerald-950 dark:text-emerald-200">
          <th className="py-3.5 px-4 w-12 text-center font-extrabold text-[11px] uppercase tracking-wider bg-transparent">NO</th>
          <th className="py-3.5 px-4 w-16 text-center font-extrabold text-[11px] uppercase tracking-wider bg-transparent">JENJANG</th>
          <th className="py-3.5 px-4 font-extrabold text-[11px] uppercase tracking-wider bg-transparent">KODE & NAMA KURIKULUM</th>
          <th className="py-3.5 px-4 font-extrabold text-[11px] uppercase tracking-wider bg-transparent">JENIS & JENJANG</th>
          <th className="py-3.5 px-4 font-extrabold text-[11px] uppercase tracking-wider bg-transparent">UNIT & TAHUN AJARAN</th>
          <th className="py-3.5 px-4 text-center font-extrabold text-[11px] uppercase tracking-wider bg-transparent">STATUS</th>
          <th className="py-3.5 px-4 text-center w-24 font-extrabold text-[11px] uppercase tracking-wider bg-transparent">AKSI</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 text-xs font-medium">
            {data.map((item, idx) => {
              const rowNumber = (page - 1) * perPage + idx + 1
              const isTerhapus = !!item.deleted_at

              return (
                <tr
                  key={item.id}
                  className={`hover:bg-emerald-50/40 dark:hover:bg-slate-800/50 transition-colors ${
                    isTerhapus ? 'bg-rose-50/30 dark:bg-rose-950/20 opacity-75' : ''
                  }`}
                >
                  {/* No */}
                  <td className="py-3.5 px-4 text-center text-slate-500 dark:text-slate-400 font-bold">
                    {rowNumber}
                  </td>

                  {/* Jenjang Badge */}
                  <td className="py-3.5 px-4 text-center">
                    <div className="size-9 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-700 text-white font-black text-xs flex items-center justify-center shadow-sm mx-auto border border-emerald-500/30">
                      {(item.jenjang || 'SD').slice(0, 3)}
                    </div>
                  </td>

                  {/* Kode & Nama */}
                  <td className="py-3.5 px-4">
                    <div className="flex flex-col">
                      <span className="font-bold text-slate-900 dark:text-white text-sm leading-snug">
                        {item.nama_kurikulum}
                      </span>
                      <span className="font-mono text-xs font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
                        {item.kode_kurikulum}
                      </span>
                    </div>
                  </td>

                  {/* Jenis & Jenjang */}
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold border ${getJenisBadgeColor(
                          item.jenis_kurikulum
                        )}`}
                      >
                        <Tag className="w-3 h-3" />
                        {item.jenis_kurikulum}
                      </span>
                      <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 uppercase border border-slate-200 dark:border-slate-700">
                        {item.jenjang}
                      </span>
                    </div>
                  </td>

                  {/* Unit & Tahun Ajaran */}
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-1.5 font-bold text-slate-800 dark:text-slate-200">
                      <Building2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>{item.unit_pendidikan_nama || '-'}</span>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      <Calendar className="w-3 h-3 text-slate-400 shrink-0" />
                      <span>{item.tahun_ajaran_nama || '-'}</span>
                      {item.semester_nama && <span>• {item.semester_nama}</span>}
                    </div>
                  </td>

                  {/* Status */}
                  <td className="py-3.5 px-4 text-center">
                    <AppBadge variant={isTerhapus ? 'danger' : item.status ? 'success' : 'warning'} dot>
                      {isTerhapus ? 'Terhapus' : item.status ? 'Aktif' : 'Nonaktif'}
                    </AppBadge>
                  </td>

                  {/* Action Buttons */}
                  <td className="py-3.5 px-4 text-center">
                    <div className="inline-flex items-center justify-center">
                      <ActionDropdown
                        onView={onDetail ? () => onDetail(item) : undefined}
                        onEdit={!isTerhapus && onEdit ? () => onEdit(item) : undefined}
                        onDelete={!isTerhapus && onDelete ? () => onDelete(item) : undefined}
                        extraItems={isTerhapus && onRestore ? [{
                          label: 'Pulihkan',
                          icon: <RotateCcw className="h-4 w-4 text-emerald-600" />,
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
