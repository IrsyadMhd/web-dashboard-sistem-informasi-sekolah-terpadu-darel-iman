import { useState } from 'react'
import { Activity, BookOpen, Clock3, Eye, Radio, Users } from 'lucide-react'
import { AppBadge, AppButton, AppCard, AppDataTable, AppModal } from '../app'

const badgeVariant = (value) => {
  if (['online', 'hadir', 'active'].includes(value)) return 'success'
  if (['terlambat', 'ready'].includes(value)) return 'warning'
  if (['completed'].includes(value)) return 'info'
  return 'neutral'
}

const label = (value) => ({
  online: 'Online',
  offline: 'Offline',
  hadir: 'Hadir',
  terlambat: 'Terlambat',
  belum_presensi: 'Belum Presensi',
  ready: 'Siap Mengajar',
  active: 'Sedang Mengajar',
  completed: 'Selesai Mengajar',
}[value] || value || '-')

const formatDateTime = (value) => value
  ? new Date(value).toLocaleString('id-ID', { dateStyle: 'short', timeStyle: 'short' })
  : '-'

export default function TeacherMonitoringPanel({ data, loading, error, onRetry }) {
  const [selectedRow, setSelectedRow] = useState(null)
  const summary = data?.summary || {}
  const rows = data?.rows || []

  return (
    <AppCard
      icon={Radio}
      title="Monitoring Guru Mengajar"
      description={`Data real dari jadwal, teaching attendance, user presence, dan sesi. Server: ${formatDateTime(data?.server_time)}`}
      actions={<AppButton variant="ghost" size="sm" icon={Activity} onClick={onRetry} loading={loading} tooltip="Refresh monitoring" />}
      noPadding
    >
      {error ? (
        <div className="m-5 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm font-semibold text-rose-700 dark:border-rose-900/60 dark:bg-rose-950/30 dark:text-rose-300">{error}<div className="mt-3"><AppButton size="sm" onClick={onRetry}>Coba Lagi</AppButton></div></div>
      ) : (
        <div className="space-y-5 p-4 md:p-5">
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-6">
            {[
              ['scheduled_today', 'Guru Dijadwalkan', Users],
              ['checked_in', 'Sudah Presensi', Clock3],
              ['not_checked_in', 'Belum Presensi', Activity],
              ['late', 'Terlambat', Clock3],
              ['active', 'Sedang Mengajar', Radio],
              ['completed', 'Selesai Mengajar', BookOpen],
            ].map(([key, title, Icon]) => (
              <div key={key} className="rounded-2xl border border-slate-200/80 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-900/60"><Icon className="h-4 w-4 text-emerald-700 dark:text-emerald-300" /><strong className="mt-2 block text-xl text-slate-900 dark:text-white">{summary[key] ?? 0}</strong><span className="text-[11px] font-semibold text-slate-500">{title}</span></div>
            ))}
          </div>

          <AppDataTable
            title="Status jadwal guru hari ini"
            description={`Online threshold ${data?.presence_threshold_seconds || 90} detik; polling dilakukan oleh halaman monitoring.`}
            columns={[
              { key: 'teacher', label: 'Guru', render: (row) => <div className="flex items-center gap-2"><span className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 text-xs font-extrabold text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300">{(row.teacher?.name || '?').slice(0, 1).toUpperCase()}</span><span className="font-bold text-slate-800 dark:text-slate-100">{row.teacher?.name || '-'}</span></div> },
              { key: 'schedule', label: 'Jadwal', render: (row) => <div><p className="font-semibold">{row.schedule?.subject || '-'}</p><p className="text-[11px] text-slate-500">{row.schedule?.class || '-'} · {row.schedule?.time_start?.slice(0, 5)}–{row.schedule?.time_end?.slice(0, 5)}</p></div> },
              { key: 'online_status', label: 'Online', render: (row) => <AppBadge dot variant={badgeVariant(row.online_status)}>{label(row.online_status)}</AppBadge> },
              { key: 'attendance_status', label: 'Presensi', render: (row) => <AppBadge dot variant={badgeVariant(row.attendance_status)}>{label(row.attendance_status)}</AppBadge> },
              { key: 'teaching_status', label: 'Mengajar', render: (row) => <AppBadge dot variant={badgeVariant(row.teaching_status)}>{label(row.teaching_status)}</AppBadge> },
              { key: 'last_activity_at', label: 'Last Activity', hideOnMobile: true, render: (row) => <span className="text-xs font-semibold text-slate-500">{formatDateTime(row.last_activity_at)}</span> },
            ]}
            data={rows}
            searchableKeys={['teacher', 'online_status', 'attendance_status', 'teaching_status']}
            isLoading={loading}
            isError={false}
            onView={setSelectedRow}
            extraActions={() => <Eye className="h-4 w-4 text-slate-400" />}
            emptyTitle="Belum ada jadwal guru"
            emptyDescription="Tidak ada jadwal mengajar pada tanggal yang dipilih."
            density="compact"
          />
        </div>
      )}

      <AppModal isOpen={Boolean(selectedRow)} onClose={() => setSelectedRow(null)} title="Detail Status Guru" description="Read-only dari source aktivitas yang tersedia" icon={Eye}>
        {selectedRow && <div className="grid gap-3 text-sm sm:grid-cols-2">
          <div><span className="text-xs font-semibold text-slate-500">Guru</span><p className="font-bold">{selectedRow.teacher?.name || '-'}</p></div>
          <div><span className="text-xs font-semibold text-slate-500">Unit</span><p className="font-bold">{selectedRow.unit?.name || '-'}</p></div>
          <div><span className="text-xs font-semibold text-slate-500">Online</span><p><AppBadge dot variant={badgeVariant(selectedRow.online_status)}>{label(selectedRow.online_status)}</AppBadge></p></div>
          <div><span className="text-xs font-semibold text-slate-500">Last Seen</span><p className="font-bold">{formatDateTime(selectedRow.last_seen_at)}</p></div>
          <div><span className="text-xs font-semibold text-slate-500">Presensi Guru</span><p><AppBadge dot variant={badgeVariant(selectedRow.attendance_status)}>{label(selectedRow.attendance_status)}</AppBadge></p></div>
          <div><span className="text-xs font-semibold text-slate-500">Jam Presensi</span><p className="font-bold">{formatDateTime(selectedRow.attendance_at)}</p></div>
          <div><span className="text-xs font-semibold text-slate-500">Sesi Mengajar</span><p><AppBadge dot variant={badgeVariant(selectedRow.teaching_status)}>{label(selectedRow.teaching_status)}</AppBadge></p></div>
          <div><span className="text-xs font-semibold text-slate-500">Mulai / Selesai</span><p className="font-bold">{formatDateTime(selectedRow.session_started_at)} / {formatDateTime(selectedRow.session_completed_at)}</p></div>
          <div className="sm:col-span-2"><span className="text-xs font-semibold text-slate-500">Presensi Siswa</span><p className="font-bold">{selectedRow.student_attendance_status || 'Belum tersedia'}</p></div>
        </div>}
      </AppModal>
    </AppCard>
  )
}
