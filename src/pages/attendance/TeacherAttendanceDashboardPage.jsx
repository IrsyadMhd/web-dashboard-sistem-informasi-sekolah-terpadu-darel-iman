import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  BookOpen,
  Calendar,
  CalendarCheck,
  CheckCircle2,
  Clock,
  Clock3,
  FileCheck2,
  FileText,
  PlayCircle,
  ShieldCheck,
  UserCheck,
  Users,
} from 'lucide-react'
import { lmsPresensiService } from '../../services/lmsPresensiService'
import { useAuthStore } from '../../stores/authStore'
import ActiveScheduleNotice from '../../components/attendance/ActiveScheduleNotice'
import AppBreadcrumb from '../../components/app/AppBreadcrumb'
import AppBadge from '../../components/app/AppBadge'
import AppEmptyState from '../../components/app/AppEmptyState'
import AppSkeleton from '../../components/app/AppSkeleton'
import { Button } from '@/components/tailgrids/core/button'

const todayStr = new Date().toLocaleDateString('id-ID', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
  year: 'numeric',
})

export default function TeacherAttendanceDashboardPage() {
  const navigate = useNavigate()
  const user = useAuthStore((state) => state.user)
  const [loading, setLoading] = useState(true)
  const [schedules, setSchedules] = useState([])
  const [activeSchedules, setActiveSchedules] = useState([])
  const [recentSessions, setRecentSessions] = useState([])

  useEffect(() => {
    let active = true
    const fetchData = async () => {
      setLoading(true)
      try {
        const todayDate = new Date().toLocaleDateString('en-CA')
        const [mySchedRes, activeSchedRes, sessionsRes] = await Promise.all([
          lmsPresensiService.getMySchedules(todayDate).catch(() => ({ data: [] })),
          lmsPresensiService.getActiveSchedules().catch(() => ({ data: { schedules: [] } })),
          lmsPresensiService.getSessions({ per_page: 5 }).catch(() => ({ data: { data: [] } })),
        ])

        if (!active) return
        setSchedules(Array.isArray(mySchedRes.data) ? mySchedRes.data : [])
        setActiveSchedules(activeSchedRes.data?.schedules || [])
        const rawSessions = sessionsRes.data?.data || sessionsRes.data || []
        setRecentSessions(Array.isArray(rawSessions) ? rawSessions : [])
      } catch (err) {
        console.error('Failed to load teacher attendance dashboard:', err)
      } finally {
        if (active) setLoading(false)
      }
    }
    fetchData()
    return () => {
      active = false
    }
  }, [])

  const finalizedCount = recentSessions.filter((s) => s.status === 'finalized').length
  const draftCount = recentSessions.filter((s) => s.status === 'draft').length

  return (
    <div className="space-y-6">
      {/* Breadcrumb & Header */}
      <div>
        <AppBreadcrumb items={[{ label: 'Absensi', href: '/absensi' }, { label: 'Dashboard Guru' }]} />
        <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
              Dashboard Presensi Guru
            </h1>
            <p className="mt-1 text-sm font-medium text-slate-500 dark:text-slate-400">
              Selamat datang, <span className="font-semibold text-emerald-700 dark:text-emerald-400">{user?.name || 'Guru'}</span> — {todayStr}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="primary"
              appearance="fill"
              size="md"
              onClick={() => navigate('/absensi/presensi')}
            >
              <PlayCircle className="mr-2 h-4 w-4" /> Input Presensi Kelas
            </Button>
            <Button
              variant="ghost"
              appearance="outline"
              size="md"
              onClick={() => navigate('/absensi/jadwal-mengajar')}
            >
              <Calendar className="mr-2 h-4 w-4" /> Jadwal Saya
            </Button>
          </div>
        </div>
      </div>

      {/* Active Schedule Notification */}
      <ActiveScheduleNotice />

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md dark:border-slate-800 dark:bg-[#1B2433]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Jadwal Hari Ini
            </span>
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400">
              <BookOpen size={20} />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900 dark:text-white">{schedules.length}</span>
            <span className="text-xs font-medium text-slate-500">Jam Pelajaran</span>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md dark:border-slate-800 dark:bg-[#1B2433]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Sesi Berlangsung
            </span>
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400">
              <Clock size={20} />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900 dark:text-white">{activeSchedules.length}</span>
            <span className="text-xs font-medium text-slate-500">Aktif Saat Ini</span>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md dark:border-slate-800 dark:bg-[#1B2433]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Sesi Difinalisasi
            </span>
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-teal-50 text-teal-600 dark:bg-teal-950/50 dark:text-teal-400">
              <ShieldCheck size={20} />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900 dark:text-white">{finalizedCount}</span>
            <span className="text-xs font-medium text-slate-500">Tersimpan Permanen</span>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md dark:border-slate-800 dark:bg-[#1B2433]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Presensi Draft
            </span>
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400">
              <FileText size={20} />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900 dark:text-white">{draftCount}</span>
            <span className="text-xs font-medium text-slate-500">Perlu Finalisasi</span>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Today's Teaching Schedule List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-emerald-600" /> Jadwal Mengajar Hari Ini
            </h2>
            <Link to="/absensi/jadwal-mengajar" className="text-xs font-semibold text-emerald-600 hover:underline">
              Lihat Selengkapnya &rarr;
            </Link>
          </div>

          {loading ? (
            <AppSkeleton rows={4} />
          ) : schedules.length === 0 ? (
            <AppEmptyState title="Tidak ada jadwal mengajar hari ini" description="Anda tidak memiliki jam pelajaran mengajar pada hari ini." />
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {schedules.map((item) => (
                <div
                  key={item.id}
                  className="group relative flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-emerald-500 hover:shadow-md dark:border-slate-800 dark:bg-[#1B2433]"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="rounded-lg bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
                        {item.time || item.jam_ke || 'Jam Mengajar'}
                      </span>
                      <AppBadge variant={item.is_active ? 'success' : 'gray'}>
                        {item.is_active ? 'Sedang Berlangsung' : 'Jadwal Hari Ini'}
                      </AppBadge>
                    </div>
                    <h3 className="text-base font-bold text-slate-900 group-hover:text-emerald-600 dark:text-white">
                      {item.subject_name || item.nama_matpel || 'Mata Pelajaran'}
                    </h3>
                    <p className="mt-1 text-xs font-medium text-slate-500 dark:text-slate-400">
                      Rombel: <span className="font-semibold text-slate-700 dark:text-slate-200">{item.class_name || item.rombel_nama || '-'}</span>
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
                    <span className="text-xs text-slate-400">
                      {item.total_students ? `${item.total_students} Siswa` : 'Presensi Kelas'}
                    </span>
                    <Button
                      variant="primary"
                      appearance="fill"
                      size="xs"
                      onClick={() => navigate(`/absensi/presensi?schedule_id=${item.id}&date=${new Date().toLocaleDateString('en-CA')}`)}
                    >
                      <PlayCircle className="mr-1 h-3.5 w-3.5" /> Presensi
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Sessions Sidebar */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Clock3 className="h-5 w-5 text-emerald-600" /> Sesi Presensi Terbaru
            </h2>
            <Link to="/absensi/riwayat-guru" className="text-xs font-semibold text-emerald-600 hover:underline">
              Riwayat &rarr;
            </Link>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-[#1B2433]">
            {loading ? (
              <AppSkeleton rows={3} />
            ) : recentSessions.length === 0 ? (
              <p className="p-4 text-center text-xs text-slate-500">Belum ada sesi presensi tersimpan.</p>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {recentSessions.map((session) => (
                  <div key={session.id} className="py-3 first:pt-0 last:pb-0 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                        {session.schedule?.subject_name || session.subject || 'Mata Pelajaran'}
                      </p>
                      <p className="text-[11px] text-slate-500">
                        {session.attendance_date || session.tanggal} • Pertemuan #{session.meeting_number || 1}
                      </p>
                    </div>
                    <AppBadge variant={session.status === 'finalized' ? 'success' : 'warning'}>
                      {session.status === 'finalized' ? 'Final' : 'Draft'}
                    </AppBadge>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
