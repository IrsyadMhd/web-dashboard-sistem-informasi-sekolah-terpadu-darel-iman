import { useState } from 'react'
import { Activity, BookOpen, Clock3, Eye, Radio, Users, RefreshCw } from 'lucide-react'
import { AppDataTable } from '../app'
import { Card, CardHeader, CardTitle, CardDescription, CardAction, CardContent } from '@/components/tailgrids/core/card'
import { Badge } from '@/components/tailgrids/core/badge'
import { Button } from '@/components/tailgrids/core/button'
import { Alert, AlertIndicator, AlertContent, AlertTitle, AlertDescription } from '@/components/tailgrids/core/alert'
import { Dialog, DialogHeader, DialogTitle, DialogDescription, DialogBody, DialogFooter, DialogClose } from '@/components/tailgrids/core/dialog'
import { Backdrop, OverlayWrapper } from '@/components/tailgrids/core/overlay'
import { Avatar, AvatarFallback } from '@/components/tailgrids/core/avatar'

const getBadgeColor = (value) => {
  if (['online', 'hadir', 'active'].includes(value)) return 'success'
  if (['terlambat', 'ready'].includes(value)) return 'warning'
  if (['completed'].includes(value)) return 'cyan'
  if (['offline', 'belum_presensi'].includes(value)) return 'rose'
  return 'gray'
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
    <>
      <Card className="border border-slate-200/80 bg-white dark:border-slate-800 dark:bg-[#1B2433]">
        <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 p-5 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400">
              <Radio className="h-5 w-5 animate-pulse" />
            </div>
            <div>
              <CardTitle className="text-lg font-bold text-slate-900 dark:text-white">
                Monitoring Guru Mengajar
              </CardTitle>
              <CardDescription className="text-xs text-slate-500 dark:text-slate-400">
                Data real dari jadwal, teaching attendance, user presence, dan sesi. Server: {formatDateTime(data?.server_time)}
              </CardDescription>
            </div>
          </div>
          <CardAction className="relative top-0 right-0 sm:static">
            <Button
              variant="ghost"
              size="sm"
              onClick={onRetry}
              pending={loading}
              prefixIcon={<RefreshCw className="h-4 w-4" />}
            >
              Refresh Data
            </Button>
          </CardAction>
        </CardHeader>

        <CardContent className="p-4 md:p-6 space-y-6">
          {error ? (
            <Alert status="error">
              <AlertIndicator />
              <AlertContent>
                <AlertTitle>Gagal Memuat Monitoring Guru</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
                <div className="mt-3">
                  <Button size="sm" variant="danger" appearance="outline" onClick={onRetry} pending={loading}>
                    Coba Lagi
                  </Button>
                </div>
              </AlertContent>
            </Alert>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
                {[
                  ['scheduled_today', 'Guru Dijadwalkan', Users, 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 border-blue-100 dark:border-blue-900/40'],
                  ['checked_in', 'Sudah Presensi', Clock3, 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border-emerald-100 dark:border-emerald-900/40'],
                  ['not_checked_in', 'Belum Presensi', Activity, 'bg-slate-50 text-slate-700 dark:bg-slate-800/60 dark:text-slate-300 border-slate-200/80 dark:border-slate-800'],
                  ['late', 'Terlambat', Clock3, 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 border-rose-100 dark:border-rose-900/40'],
                  ['active', 'Sedang Mengajar', Radio, 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border-amber-100 dark:border-amber-900/40'],
                  ['completed', 'Selesai Mengajar', BookOpen, 'bg-cyan-50 text-cyan-700 dark:bg-cyan-950/40 dark:text-cyan-300 border-cyan-100 dark:border-cyan-900/40'],
                ].map(([key, title, Icon, styleClass]) => (
                  <div
                    key={key}
                    className={`flex flex-col justify-between rounded-2xl border p-3.5 transition-all hover:scale-[1.02] ${styleClass}`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold">{title}</span>
                      <Icon className="h-4 w-4 opacity-80" />
                    </div>
                    <strong className="mt-3 text-2xl font-black">{summary[key] ?? 0}</strong>
                  </div>
                ))}
              </div>

              <AppDataTable
                title="Status Jadwal Guru Hari Ini"
                description={`Threshold online ${data?.presence_threshold_seconds || 90} detik; polling otomatis setiap 20 detik.`}
                columns={[
                  {
                    key: 'teacher',
                    label: 'Guru',
                    render: (row) => (
                      <div className="flex items-center gap-3">
                        <Avatar size="sm">
                          <AvatarFallback className="bg-emerald-100 text-emerald-800 font-extrabold text-xs dark:bg-emerald-950 dark:text-emerald-300">
                            {(row.teacher?.name || '?').slice(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-bold text-slate-800 dark:text-slate-100">
                          {row.teacher?.name || '-'}
                        </span>
                      </div>
                    ),
                  },
                  {
                    key: 'schedule',
                    label: 'Jadwal',
                    render: (row) => (
                      <div>
                        <p className="font-semibold text-slate-800 dark:text-slate-200">{row.schedule?.subject || '-'}</p>
                        <p className="text-[11px] font-medium text-slate-500">
                          {row.schedule?.class || '-'} · {row.schedule?.time_start?.slice(0, 5)}–{row.schedule?.time_end?.slice(0, 5)}
                        </p>
                      </div>
                    ),
                  },
                  {
                    key: 'online_status',
                    label: 'Online',
                    render: (row) => (
                      <Badge color={getBadgeColor(row.online_status)} size="sm">
                        {label(row.online_status)}
                      </Badge>
                    ),
                  },
                  {
                    key: 'attendance_status',
                    label: 'Presensi',
                    render: (row) => (
                      <Badge color={getBadgeColor(row.attendance_status)} size="sm">
                        {label(row.attendance_status)}
                      </Badge>
                    ),
                  },
                  {
                    key: 'teaching_status',
                    label: 'Mengajar',
                    render: (row) => (
                      <Badge color={getBadgeColor(row.teaching_status)} size="sm">
                        {label(row.teaching_status)}
                      </Badge>
                    ),
                  },
                  {
                    key: 'last_activity_at',
                    label: 'Aktivitas Terakhir',
                    hideOnMobile: true,
                    render: (row) => (
                      <span className="text-xs font-semibold text-slate-500">
                        {formatDateTime(row.last_activity_at)}
                      </span>
                    ),
                  },
                ]}
                data={rows}
                searchableKeys={['teacher', 'online_status', 'attendance_status', 'teaching_status']}
                isLoading={loading}
                isError={false}
                onView={(row) => setSelectedRow(row)}
                extraActions={() => (
                  <Button variant="ghost" size="xs" iconOnly>
                    <Eye className="h-4 w-4 text-slate-500" />
                  </Button>
                )}
                emptyTitle="Belum ada jadwal guru"
                emptyDescription="Tidak ada jadwal mengajar pada tanggal yang dipilih."
                density="compact"
              />
            </>
          )}
        </CardContent>
      </Card>

      {selectedRow && (
        <OverlayWrapper isOpen={Boolean(selectedRow)} onOpenChange={(open) => !open && setSelectedRow(null)}>
          <Backdrop isOpen={Boolean(selectedRow)} onOpenChange={(open) => !open && setSelectedRow(null)} />
          <Dialog className="max-w-lg">
            <DialogHeader>
              <div className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400">
                  <Eye className="h-5 w-5" />
                </div>
                <div>
                  <DialogTitle>Detail Status Guru</DialogTitle>
                  <DialogDescription>
                    Informasi detail aktivitas mengajar dan kehadiran real-time.
                  </DialogDescription>
                </div>
              </div>
              <DialogClose onClick={() => setSelectedRow(null)} />
            </DialogHeader>

            <DialogBody className="space-y-4 py-4">
              <div className="grid gap-4 text-sm sm:grid-cols-2">
                <div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-900/50">
                  <span className="text-xs font-semibold text-slate-500">Nama Guru</span>
                  <p className="font-bold text-slate-900 dark:text-white mt-0.5">{selectedRow.teacher?.name || '-'}</p>
                </div>

                <div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-900/50">
                  <span className="text-xs font-semibold text-slate-500">Unit Pendidikan</span>
                  <p className="font-bold text-slate-900 dark:text-white mt-0.5">{selectedRow.unit?.name || '-'}</p>
                </div>

                <div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-900/50">
                  <span className="text-xs font-semibold text-slate-500">Status Online</span>
                  <div className="mt-1">
                    <Badge color={getBadgeColor(selectedRow.online_status)} size="sm">
                      {label(selectedRow.online_status)}
                    </Badge>
                  </div>
                </div>

                <div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-900/50">
                  <span className="text-xs font-semibold text-slate-500">Terakhir Dilihat</span>
                  <p className="font-bold text-slate-900 dark:text-white mt-0.5">{formatDateTime(selectedRow.last_seen_at)}</p>
                </div>

                <div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-900/50">
                  <span className="text-xs font-semibold text-slate-500">Presensi Guru</span>
                  <div className="mt-1">
                    <Badge color={getBadgeColor(selectedRow.attendance_status)} size="sm">
                      {label(selectedRow.attendance_status)}
                    </Badge>
                  </div>
                </div>

                <div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-900/50">
                  <span className="text-xs font-semibold text-slate-500">Waktu Presensi</span>
                  <p className="font-bold text-slate-900 dark:text-white mt-0.5">{formatDateTime(selectedRow.attendance_at)}</p>
                </div>

                <div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-900/50">
                  <span className="text-xs font-semibold text-slate-500">Sesi Mengajar</span>
                  <div className="mt-1">
                    <Badge color={getBadgeColor(selectedRow.teaching_status)} size="sm">
                      {label(selectedRow.teaching_status)}
                    </Badge>
                  </div>
                </div>

                <div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-900/50">
                  <span className="text-xs font-semibold text-slate-500">Mulai / Selesai Sesi</span>
                  <p className="font-bold text-slate-900 dark:text-white mt-0.5">
                    {formatDateTime(selectedRow.session_started_at)} / {formatDateTime(selectedRow.session_completed_at)}
                  </p>
                </div>

                <div className="sm:col-span-2 rounded-xl bg-slate-50 p-3 dark:bg-slate-900/50">
                  <span className="text-xs font-semibold text-slate-500">Presensi Siswa</span>
                  <p className="font-bold text-slate-900 dark:text-white mt-0.5">
                    {selectedRow.student_attendance_status || 'Belum tersedia'}
                  </p>
                </div>
              </div>
            </DialogBody>

            <DialogFooter>
              <Button variant="ghost" onClick={() => setSelectedRow(null)}>
                Tutup
              </Button>
            </DialogFooter>
          </Dialog>
        </OverlayWrapper>
      )}
    </>
  )
}
