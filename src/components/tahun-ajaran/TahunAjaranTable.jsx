import { CalendarDays, RotateCcw, Star } from 'lucide-react'
import ActionDropdown from '../app/ActionDropdown'
import AppBadge from '../app/AppBadge'

export default function TahunAjaranTable({ data = [], page = 1, perPage = 15, onDetail, onEdit, onSetAktif, onDelete, onRestore }) {
  return (
    <table className="w-full min-w-155 table-fixed text-left text-xs text-slate-600 dark:text-slate-300" aria-label="Daftar tahun ajaran">
      <thead className="bg-[#F8FAFB] dark:bg-[#202B3A] border-b border-[#EDF0F4] dark:border-[#354153]">
        <tr>
          <th className="w-11 bg-[#F8FAFB] dark:bg-[#202B3A] px-3 py-3.5 text-center text-[#58677B] dark:text-[#DCE5F1] font-extrabold text-[11px] uppercase tracking-wider">No</th>
          <th className="bg-[#F8FAFB] dark:bg-[#202B3A] px-3 py-3.5 text-[#58677B] dark:text-[#DCE5F1] font-extrabold text-[11px] uppercase tracking-wider">Identitas Periode</th>
          <th className="hidden w-1/4 bg-[#F8FAFB] dark:bg-[#202B3A] px-3 py-3.5 text-[#58677B] dark:text-[#DCE5F1] font-extrabold text-[11px] uppercase tracking-wider md:table-cell">Rentang Tanggal</th>
          <th className="w-28 bg-[#F8FAFB] dark:bg-[#202B3A] px-3 py-3.5 text-center text-[#58677B] dark:text-[#DCE5F1] font-extrabold text-[11px] uppercase tracking-wider">Status</th>
          <th className="w-20 bg-[#F8FAFB] dark:bg-[#202B3A] px-3 py-3.5 text-center text-[#58677B] dark:text-[#DCE5F1] font-extrabold text-[11px] uppercase tracking-wider">Aksi</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
        {data.map((item, index) => {
          const deleted = Boolean(item.deleted_at)

          return (
            <tr key={item.id} className={`${deleted ? 'bg-rose-50/40 dark:bg-rose-950/10' : item.is_active ? 'bg-emerald-50/30 dark:bg-emerald-950/10' : ''} transition hover:bg-slate-50 dark:hover:bg-slate-800/50`}>
              <td className="px-3 py-3 text-center text-slate-400">{(page - 1) * perPage + index + 1}</td>
              <td className="px-3 py-3">
                <div className="flex min-w-0 items-center gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300"><CalendarDays className="h-5 w-5" /></span>
                  <span className="min-w-0">
                    <strong className="block truncate text-sm text-slate-900 dark:text-white">{item.name}</strong>
                    <small className="mt-0.5 block truncate text-[10px] text-slate-400 md:hidden">{item.start_date || '-'} – {item.end_date || '-'}</small>
                    <small className="mt-0.5 block truncate text-[10px] text-slate-400">{item.keterangan || item.metadata?.keterangan || 'Tanpa keterangan'}</small>
                  </span>
                </div>
              </td>
              <td className="hidden px-3 py-3 md:table-cell">
                <strong className="block text-xs text-slate-800 dark:text-slate-100">{item.start_date || '-'}</strong>
                <small className="text-[10px] text-slate-400">sampai {item.end_date || '-'}</small>
              </td>
              <td className="px-3 py-3 text-center">
                <AppBadge variant={deleted ? 'danger' : item.is_active ? 'success' : 'neutral'} dot>
                  {deleted ? 'Terhapus' : item.is_active ? 'Aktif' : 'Nonaktif'}
                </AppBadge>
              </td>
              <td className="px-3 py-3 text-center">
                <ActionDropdown
                  onView={!deleted ? () => onDetail?.(item) : undefined}
                  onEdit={!deleted ? () => onEdit?.(item) : undefined}
                  onDelete={!deleted ? () => onDelete?.(item) : undefined}
                  extraItems={deleted ? [{
                    label: 'Pulihkan',
                    icon: <RotateCcw className="h-4 w-4 text-emerald-600" />,
                    onClick: () => onRestore?.(item),
                  }] : (!item.is_active ? [{
                    label: 'Jadikan Aktif',
                    icon: <Star className="h-4 w-4 text-emerald-600" />,
                    onClick: () => onSetAktif?.(item),
                  }] : [])}
                />
              </td>
            </tr>
          )
        })}
      </tbody>
    </table>
  )
}
