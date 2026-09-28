import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  BookOpen,
  Calendar,
  CalendarCheck,
  CheckCircle2,
  Clock,
  Clock3,
  FileText,
  PlayCircle,
  ShieldCheck,
  GraduationCap,
  Sparkles,
  RefreshCw,
  Users,
  Layers,
  ArrowRight,
} from 'lucide-react'

import { lmsPresensiService } from '../../services/lmsPresensiService'
import { useAuthStore } from '../../stores/authStore'
import ActiveScheduleNotice from '../../components/attendance/ActiveScheduleNotice'
import PageContainer from '../../components/app/PageContainer'
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

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.05 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 350, damping: 26 },
  },
}

const MODERN_CARD_TONES = {
  emerald: {
    card: 'border-emerald-300/70 bg-gradient-to-br from-emerald-50 via-teal-50/60 to-white hover:border-emerald-400 dark:border-emerald-700/50 dark:from-emerald-950/40 dark:via-teal-950/20 dark:to-slate-900',
    glow: 'bg-emerald-400/20 group-hover:bg-emerald-400/30',
    iconBox: 'bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-sm shadow-emerald-500/30',
    tag: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300',
    title: 'text-emerald-700 dark:text-emerald-400',
    val: 'text-slate-900 dark:text-white',
    sub: 'text-slate-600 dark:text-slate-400',
  },
  blue: {
    card: 'border-sky-300/70 bg-gradient-to-br from-sky-50 via-blue-50/60 to-white hover:border-sky-400 dark:border-sky-700/50 dark:from-sky-950/40 dark:via-blue-950/20 dark:to-slate-900',
    glow: 'bg-sky-400/20 group-hover:bg-sky-400/30',
    iconBox: 'bg-gradient-to-br from-sky-500 to-blue-600 text-white shadow-sm shadow-sky-500/30',
    tag: 'bg-sky-100 text-sky-800 dark:bg-sky-900/60 dark:text-sky-300',
    title: 'text-sky-700 dark:text-sky-400',
    val: 'text-slate-900 dark:text-white',
    sub: 'text-slate-600 dark:text-slate-400',
  },
  teal: {
    card: 'border-teal-300/70 bg-gradient-to-br from-teal-50 via-emerald-50/60 to-white hover:border-teal-400 dark:border-teal-700/50 dark:from-teal-950/40 dark:via-emerald-950/20 dark:to-slate-900',
    glow: 'bg-teal-400/20 group-hover:bg-teal-400/30',
    iconBox: 'bg-gradient-to-br from-teal-500 to-emerald-600 text-white shadow-sm shadow-teal-500/30',
    tag: 'bg-teal-100 text-teal-800 dark:bg-teal-900/60 dark:text-teal-300',
    title: 'text-teal-700 dark:text-teal-400',
    val: 'text-slate-900 dark:text-white',
    sub: 'text-slate-600 dark:text-slate-400',
  },
  amber: {
    card: 'border-amber-300/70 bg-gradient-to-br from-amber-50 via-orange-50/60 to-white hover:border-amber-400 dark:border-amber-700/50 dark:from-amber-950/40 dark:via-orange-950/20 dark:to-slate-900',
    glow: 'bg-amber-400/20 group-hover:bg-amber-400/30',
    iconBox: 'bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-sm shadow-amber-500/30',
    tag: 'bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-300',
    title: 'text-amber-700 dark:text-amber-400',
    val: 'text-slate-900 dark:text-white',
    sub: 'text-slate-600 dark:text-slate-400',
  },
}

function ModernKpiCard({ icon: Icon, label, subtext, value, tag, tone = 'emerald' }) {
  const t = MODERN_CARD_TONES[tone] || MODERN_CARD_TONES.emerald

  return (
    <article
      className={`group relative overflow-hidden rounded-[18px] border-2 p-5 shadow-xs transition-[border-color,box-shadow] duration-150 text-left flex flex-col justify-between h-full cursor-default ${t.card}`}
    >
      <div className={`pointer-events-none absolute -top-8 -right-8 h-28 w-28 rounded-full blur-2xl transition-all ${t.glow}`} />

      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2.5">
            <div className={`flex h-10 w-10 items-center justify-center rounded-xl text-white ${t.iconBox}`}>
              <Icon className="h-5 w-5" />
            </div>
            <div>
              <p className={`text-[11px] font-bold uppercase tracking-wider ${t.title}`}>{label}</p>
            </div>
          </div>
          {tag && (
            <span className={`rounded-lg px-2.5 py-0.5 text-[10px] font-extrabold ${t.tag}`}>
              {tag}
            </span>
          )}
        </div>

        <p className={`text-3xl sm:text-4xl font-black tabular-nums tracking-tight ${t.val}`}>
          {value ?? '0'}
        </p>
        {subtext && (
          <p className={`mt-1 text-[11px] font-semibold ${t.sub}`}>
            {subtext}
          </p>
        )}
      </div>
    </article>
  )
}

export default function TeacherAttendanceDashboardPage() {
  const navigate = useNavigate()
  const user = useAuthStore((state) => state.user)
  const [loading, setLoading] = useState(true)
  const [schedules, setSchedules] = useState([])
  const [activeSchedules, setActiveSchedules] = useState([])
  const [recentSessions, setRecentSessions] = useState([])

  const fetchData = async () => {
    setLoading(true)
    try {
      const todayDate = new Date().toLocaleDateString('en-CA')
      const [mySchedRes, activeSchedRes, sessionsRes] = await Promise.all([
        lmsPresensiService.getMySchedules(todayDate).catch(() => ({ data: [] })),
        lmsPresensiService.getActiveSchedules().catch(() => ({ data: { schedules: [] } })),
        lmsPresensiService.getSessions({ per_page: 5 }).catch(() => ({ data: { data: [] } })),
      ])

      setSchedules(Array.isArray(mySchedRes.data) ? mySchedRes.data : [])
      setActiveSchedules(activeSchedRes.data?.schedules || [])
      const rawSessions = sessionsRes.data?.data || sessionsRes.data || []
      setRecentSessions(Array.isArray(rawSessions) ? rawSessions : [])
    } catch (err) {
      console.error('Failed to load teacher attendance dashboard:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const finalizedCount = recentSessions.filter((s) => s.status === 'finalized').length
  const draftCount = recentSessions.filter((s) => s.status === 'draft').length

  return (
    <PageContainer maxW="7xl">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-6 pb-12"
      >
        {/* ── Breadcrumb ── */}
        <motion.div variants={itemVariants}>
          <AppBreadcrumb
            items={[
              { label: 'Presensi KBM', href: '/absensi' },
              { label: 'Dashboard Presensi Guru' },
            ]}
          />
        </motion.div>

        {/* ── Modern Hero Card ── */}
        <motion.div
          variants={itemVariants}
          className="relative overflow-hidden rounded-[22px] border-2 border-emerald-500/30 bg-gradient-to-r from-emerald-500/15 via-teal-500/10 to-emerald-600/15 p-5 sm:p-6 shadow-md shadow-emerald-500/10 dark:border-emerald-600/40 dark:bg-gradient-to-r dark:from-emerald-950/70 dark:via-teal-950/50 dark:to-slate-900"
        >
          {/* Ambient Glow Blobs */}
          <div className="pointer-events-none absolute -top-20 -right-20 h-56 w-56 rounded-full bg-gradient-to-br from-emerald-500/40 via-teal-400/30 to-emerald-600/20 blur-3xl dark:from-emerald-500/50 dark:via-teal-400/40" />
          <div className="pointer-events-none absolute -bottom-20 -left-20 h-56 w-56 rounded-full bg-gradient-to-tr from-emerald-600/30 via-teal-500/20 to-transparent blur-3xl dark:from-emerald-600/40 dark:via-teal-500/30" />

          <div className="relative z-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-4 min-w-0">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700 text-white shadow-xl border border-emerald-300/40 dark:from-emerald-400 dark:via-emerald-500 dark:to-teal-600">
                <CalendarCheck className="h-6 w-6" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                    Dashboard Presensi Guru (KBM)
                  </h1>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-emerald-600 to-teal-600 px-3.5 py-1 text-xs font-extrabold text-white shadow-sm shadow-emerald-600/25 border border-emerald-300/40">
                    <GraduationCap className="h-3.5 w-3.5" />
                    Pendidik Aktif
                  </span>
                </div>
                <p className="mt-1 text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300 max-w-2xl leading-relaxed">
                  Selamat datang, <strong className="text-emerald-700 dark:text-emerald-400 font-bold">{user?.name || 'Guru'}</strong> — {todayStr}. Pantau jadwal mengajar aktif hari ini, input kehadiran siswa di kelas, dan finalisasi berkas presensi KBM.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 shrink-0 flex-wrap self-end sm:self-center">
              <Button
                variant="primary"
                appearance="fill"
                size="sm"
                onClick={() => navigate('/absensi/presensi')}
                className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-md shadow-emerald-600/30"
              >
                <PlayCircle className="mr-1.5 h-4 w-4" /> Input Presensi Kelas
              </Button>
              <Button
                variant="ghost"
                appearance="outline"
                size="sm"
                onClick={() => navigate('/absensi/jadwal-mengajar')}
                className="border-emerald-300 dark:border-emerald-700/60 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-50/50 dark:hover:bg-emerald-950/40"
              >
                <Calendar className="mr-1.5 h-4 w-4" /> Jadwal Saya
              </Button>
            </div>
          </div>
        </motion.div>

        {/* ── Active Schedule Notification ── */}
        <motion.div variants={itemVariants}>
          <ActiveScheduleNotice />
        </motion.div>

        {/* ── KPI Summary Cards ── */}
        <motion.div variants={itemVariants}>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <ModernKpiCard
              icon={BookOpen}
              label="Jadwal Hari Ini"
              subtext="Jam pelajaran terdaftar"
              value={schedules.length}
              tag={`${schedules.length} Jam`}
              tone="emerald"
            />
            <ModernKpiCard
              icon={Clock}
              label="Sesi Berlangsung"
              subtext="KBM sedang aktif berjalan"
              value={activeSchedules.length}
              tag={`${activeSchedules.length} Aktif`}
              tone="blue"
            />
            <ModernKpiCard
              icon={ShieldCheck}
              label="Sesi Difinalisasi"
              subtext="Presensi tersimpan permanen"
              value={finalizedCount}
              tag={`${finalizedCount} Selesai`}
              tone="teal"
            />
            <ModernKpiCard
              icon={FileText}
              label="Presensi Draft"
              subtext="Perlu verifikasi guru"
              value={draftCount}
              tag={`${draftCount} Draft`}
              tone="amber"
            />
          </div>
        </motion.div>

        {/* ── Main Content Grid ── */}
        <motion.div variants={itemVariants} className="grid gap-6 lg:grid-cols-3">
          {/* Today's Teaching Schedule List (Col 1 & 2) */}
          <div className="lg:col-span-2 space-y-4">
            <div className="relative overflow-hidden rounded-[22px] border-2 border-emerald-300 dark:border-emerald-700/80 bg-white shadow-md shadow-emerald-500/10 dark:bg-[#1B2433]">
              <div className="p-4 sm:p-5 bg-gradient-to-r from-emerald-500/10 via-teal-500/5 to-transparent border-b border-emerald-200/90 dark:border-emerald-800/60 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="flex size-9 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-sm shadow-emerald-500/30">
                    <BookOpen className="size-4 text-white" />
                  </div>
                  <div>
                    <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                      Jadwal Mengajar Hari Ini
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                      Rombel dan jam pelajaran yang terjadwal
                    </p>
                  </div>
                </div>

                <Link
                  to="/absensi/jadwal-mengajar"
                  className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 hover:text-emerald-800 dark:text-emerald-400 dark:hover:text-emerald-300"
                >
                  Lihat Selengkapnya <ArrowRight className="size-3.5" />
                </Link>
              </div>

              <div className="p-4 sm:p-5">
                {loading ? (
                  <AppSkeleton rows={4} />
                ) : schedules.length === 0 ? (
                  <AppEmptyState
                    title="Tidak ada jadwal mengajar hari ini"
                    description="Anda tidak memiliki jam pelajaran mengajar pada hari ini."
                  />
                ) : (
                  <div className="grid gap-3.5 sm:grid-cols-2">
                    {schedules.map((item) => (
                      <div
                        key={item.id}
                        className="group relative flex flex-col justify-between rounded-2xl border-2 border-slate-200/80 bg-slate-50/50 p-4 sm:p-5 transition hover:border-emerald-400 hover:bg-white hover:shadow-md dark:border-slate-800 dark:bg-slate-900/40 dark:hover:border-emerald-700 dark:hover:bg-[#1B2433]"
                      >
                        <div>
                          <div className="flex items-center justify-between mb-2.5">
                            <span className="rounded-lg bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300 px-2.5 py-1 text-xs font-bold font-mono">
                              {item.time || item.jam_ke || 'Jam Mengajar'}
                            </span>
                            <AppBadge variant={item.is_active ? 'success' : 'gray'}>
                              {item.is_active ? 'Sedang Berlangsung' : 'Jadwal Hari Ini'}
                            </AppBadge>
                          </div>
                          <h4 className="text-base font-black text-slate-900 group-hover:text-emerald-600 dark:text-white transition-colors">
                            {item.subject_name || item.nama_matpel || 'Mata Pelajaran'}
                          </h4>
                          <p className="mt-1 text-xs font-medium text-slate-600 dark:text-slate-400">
                            Kelas: <span className="font-bold text-slate-800 dark:text-slate-200">{item.class_name || item.rombel_nama || '-'}</span>
                          </p>
                        </div>

                        <div className="mt-4 pt-3 border-t border-slate-200/80 dark:border-slate-800 flex items-center justify-between">
                          <span className="text-xs text-slate-500 font-medium">
                            {item.total_students ? `${item.total_students} Siswa` : 'Presensi Kelas'}
                          </span>
                          <Button
                            variant="primary"
                            appearance="fill"
                            size="xs"
                            onClick={() => navigate(`/absensi/presensi?schedule_id=${item.id}&date=${new Date().toLocaleDateString('en-CA')}`)}
                            className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-xs cursor-pointer"
                          >
                            <PlayCircle className="mr-1 h-3.5 w-3.5" /> Presensi
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Recent Sessions Sidebar (Col 3) */}
          <div className="space-y-4">
            <div className="relative overflow-hidden rounded-[22px] border-2 border-emerald-300 dark:border-emerald-700/80 bg-white shadow-md shadow-emerald-500/10 dark:bg-[#1B2433]">
              <div className="p-4 sm:p-5 bg-gradient-to-r from-emerald-500/10 via-teal-500/5 to-transparent border-b border-emerald-200/90 dark:border-emerald-800/60 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="flex size-9 items-center justify-center rounded-xl bg-gradient-to-br from-teal-500 to-emerald-600 text-white shadow-sm shadow-teal-500/30">
                    <Clock3 className="size-4 text-white" />
                  </div>
                  <div>
                    <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                      Sesi Presensi Terbaru
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                      Riwayat rekaman KBM
                    </p>
                  </div>
                </div>

                <Link
                  to="/absensi/riwayat-guru"
                  className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 hover:text-emerald-800 dark:text-emerald-400 dark:hover:text-emerald-300"
                >
                  Riwayat &rarr;
                </Link>
              </div>

              <div className="p-4 sm:p-5">
                {loading ? (
                  <AppSkeleton rows={3} />
                ) : recentSessions.length === 0 ? (
                  <p className="py-8 text-center text-xs text-slate-400 font-medium">
                    Belum ada sesi presensi tersimpan.
                  </p>
                ) : (
                  <div className="divide-y divide-emerald-100/80 dark:divide-emerald-900/40">
                    {recentSessions.map((session) => (
                      <div key={session.id} className="py-3 first:pt-0 last:pb-0 flex items-center justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                            {session.schedule?.subject_name || session.subject || 'Mata Pelajaran'}
                          </p>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium mt-0.5">
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
        </motion.div>
      </motion.div>
    </PageContainer>
  )
}
