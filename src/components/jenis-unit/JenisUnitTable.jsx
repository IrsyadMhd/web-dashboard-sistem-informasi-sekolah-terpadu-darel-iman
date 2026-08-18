import React from 'react'
import {
  Baby,
  BookOpen,
  Building2,
  GraduationCap,
  House,
  Landmark,
  RotateCcw,
  School,
  University,
} from 'lucide-react'
import ActionDropdown from '../app/ActionDropdown'
import AppBadge from '../app/AppBadge'

const ICON_MAP = {
  Building: Building2,
  School,
  Book: BookOpen,
  Mosque: Landmark,
  Graduation: GraduationCap,
  University,
  Children: Baby,
  Home: House,
}

// eslint-disable-next-line react/only-export-components -- helper ikon dipakai bersama modal terkait.
export function renderJenisUnitIcon(iconName, className = 'w-4 h-4') {
  const IconComp = ICON_MAP[iconName] || School
  return <IconComp className={className} strokeWidth={2.25} />
}

export default function JenisUnitTable({
  data = [],
  page = 1,
  perPage = 15,
  onDetail,
  onEdit,
  onDelete,
  onRestore,
}) {
  return (
    <table className="w-full min-w-180 table-fixed border-collapse text-left text-xs text-slate-600 dark:text-slate-300" aria-label="Daftar jenis unit pendidikan">
      <thead className="border-b border-slate-200/80 bg-slate-50/90 text-[10px] font-black uppercase tracking-[0.12em] text-slate-500 dark:border-slate-700 dark:bg-slate-800/70 dark:text-slate-300">
        <tr>
          <th className="w-12 px-2 py-3 text-center">No</th>
          <th className="px-3 py-3">Identitas Jenis Unit</th>
          <th className="hidden w-32 px-3 py-3 md:table-cell">Jenjang</th>
          <th className="hidden w-32 px-3 py-3 xl:table-cell">Visual</th>
          <th className="hidden w-20 px-2 py-3 text-center lg:table-cell">Urutan</th>
          <th className="w-28 px-2 py-3 text-center">Status</th>
          <th className="w-20 px-2 py-3 text-center">Aksi</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
        {data.map((item, index) => {
          const rowNo = (page - 1) * perPage + index + 1
          const badgeColor = item.warna_badge || '#10B981'

          return (
            <tr
              key={item.id || item.uuid}
              className={`ui-row transition-colors hover:bg-emerald-50/40 dark:hover:bg-emerald-950/20 ${item.is_deleted ? 'bg-rose-50/40 dark:bg-rose-950/10' : ''}`}
              style={{ animationDelay: `${Math.min(index, 8) * 35}ms` }}
            >
              <td className="px-2 py-3 text-center font-medium text-slate-400">{rowNo}</td>
              <td className="px-3 py-3">
                <div className="flex min-w-0 items-center gap-2.5">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-emerald-100 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/50 dark:text-emerald-300">
                    {renderJenisUnitIcon(item.icon, 'w-4 h-4')}
                  </span>
                  <span className="min-w-0">
                    <strong className="block truncate text-xs font-bold text-slate-900 dark:text-white" title={item.nama_jenis}>{item.nama_jenis}</strong>
                    <span className="mt-0.5 block truncate text-[10px] font-semibold text-emerald-800 dark:text-emerald-300">{item.kode_jenis} · {item.singkatan || '-'}</span>
                    <small className="mt-0.5 block truncate text-[9px] text-slate-400 md:hidden">{item.jenjang} · Urutan {item.urutan}</small>
                    <small className="mt-0.5 hidden truncate text-[9px] text-slate-400 xl:block" title={item.keterangan}>{item.keterangan || 'Tanpa keterangan'}</small>
                  </span>
                </div>
              </td>
              <td className="hidden px-3 py-3 md:table-cell">
                <AppBadge variant="info" className="max-w-full truncate">{item.jenjang}</AppBadge>
              </td>
              <td className="hidden px-3 py-3 xl:table-cell">
                <div className="flex min-w-0 items-center gap-2">
                  <span className="inline-block h-4 w-4 shrink-0 rounded-full border border-slate-200 shadow-xs" style={{ backgroundColor: badgeColor }} />
                  <span className="truncate font-mono text-[9px] uppercase text-slate-500">{badgeColor}</span>
                </div>
              </td>
              <td className="hidden px-2 py-3 text-center text-xs font-bold text-slate-700 lg:table-cell dark:text-slate-200">{item.urutan}</td>
              <td className="px-2 py-3 text-center">
                {item.is_deleted ? (
                  <AppBadge variant="danger" dot>Terhapus</AppBadge>
                ) : (
                  <AppBadge variant={item.status ? 'success' : 'neutral'} dot>
                    {item.status ? 'Aktif' : 'Tidak Aktif'}
                  </AppBadge>
                )}
              </td>
              <td className="px-2 py-3 text-center">
                <ActionDropdown
                  onView={() => onDetail?.(item)}
                  onEdit={!item.is_deleted ? () => onEdit?.(item) : undefined}
                  onDelete={!item.is_deleted ? () => onDelete?.(item) : undefined}
                  extraItems={item.is_deleted ? [{
                    label: 'Pulihkan',
                    icon: <RotateCcw className="h-4 w-4 text-emerald-600" />,
                    onClick: () => onRestore?.(item),
                  }] : []}
                />
              </td>
            </tr>
          )
        })}
      </tbody>
    </table>
  )
}
