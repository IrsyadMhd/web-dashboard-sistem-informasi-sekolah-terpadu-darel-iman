import React, { useState, useEffect } from 'react'
import { Activity, AlertTriangle, RefreshCw, Sparkles, Users, UserRoundCheck, Clock3, UserX, Printer, ShieldCheck, Zap } from 'lucide-react'
import { motion } from 'framer-motion'
import { api } from '../services/api'
import { printCleanTable } from '../utils/printHelper'
import TeacherMonitoringPanel from '../components/attendance/TeacherMonitoringPanel'
import { useAuthStore } from '../stores/authStore'
import PageContainer from '../components/app/PageContainer'
import AppBreadcrumb from '../components/app/AppBreadcrumb'

import { Alert, AlertContent, AlertDescription, AlertIndicator, AlertTitle } from '@/components/tailgrids/core/alert'
import { Button } from '@/components/tailgrids/core/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/tailgrids/core/card'
import { Badge } from '@/components/tailgrids/core/badge'
import { SquircleActionButton } from '../components/master-data'

const cards = [
  { key: 'total_siswa', label: 'Total Siswa', icon: Users, tone: 'emerald', subtext: 'Siswa Terdaftar' },
  { key: 'total_guru', label: 'Total Guru', icon: UserRoundCheck, tone: 'blue', subtext: 'Tenaga Pendidik' },
  { key: 'kehadiran_hari_ini', label: 'Kehadiran Hari Ini', icon: Clock3, tone: 'emerald', subtext: 'Presensi Terverifikasi' },
  { key: 'statistik_ketidakhadiran', label: 'Tidak Hadir', icon: UserX, tone: 'rose', subtext: 'Izin / Sakit / Alpa' },
]

export default function MonitoringDashboardPage() {
  const [dashboard, setDashboard] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [teacherMonitoring, setTeacherMonitoring] = useState(null)
  const [teacherMonitoringError, setTeacherMonitoringError] = useState('')
  const [teacherMonitoringLoading, setTeacherMonitoringLoading] = useState(true)

  const todayStr = new Date().toISOString().split('T')[0]
  const [filters, setFilters] = useState({
    period: 'harian',
    date: todayStr,
    start_date: '',
    end_date: '',
    month: String(new Date().getMonth() + 1),
    year: String(new Date().getFullYear()),
    semester_id: '',
    academic_year_id: '',
    unit_id: '',
  })

  const user = useAuthStore((state) => state.user)
  const roles = Array.isArray(user?.roles)
    ? user.roles.map((r) => (typeof r === 'string' ? r : r?.name || ''))
    : []
  const permissions = Array.isArray(user?.permissions)
    ? user.permissions.map((p) => (typeof p === 'string' ? p : p?.name || ''))
    : []
  const isSuperAdmin = Boolean(user?.is_superadmin) || roles.some((r) => /super/i.test(r) || /admin/i.test(r))
  const hasMonitoringRole =
    isSuperAdmin ||
    roles.some((r) =>
      ['Kepala Sekolah', 'kepala_sekolah', 'Yayasan', 'Divisi Pendidikan', 'Admin', 'TU', 'Waka', 'Guru'].some((mr) =>
        r.toLowerCase().includes(mr.toLowerCase())
      )
    )

  const canLoadSummary = hasMonitoringRole || permissions.includes('dashboard.pemantauan.lihat') || true
  const canLoadTeacherMonitoring = hasMonitoringRole || permissions.includes('teacher_monitoring.view') || true

  const loadDashboard = async () => {
    setLoading(true)
    setError('')
    try {
      const response = await api.get('/dashboard-pemantauan/ringkasan')
      setDashboard(response.data?.data ?? null)
    } catch (requestError) {
      if (requestError.response?.status !== 403) {
        setError(requestError.response?.data?.message || 'Data dashboard tidak dapat dimuat.')
      }
    } finally {
      setLoading(false)
    }
  }

  const loadTeacherMonitoring = async (customFilters = filters) => {
    setTeacherMonitoringLoading(true)
    setTeacherMonitoringError('')
    try {
      const cleanedParams = {}
      Object.keys(customFilters).forEach((key) => {
        if (customFilters[key] !== '' && customFilters[key] !== null && customFilters[key] !== undefined) {
          cleanedParams[key] = customFilters[key]
        }
      })
      const response = await api.get('/teacher-monitoring', { params: cleanedParams })
      setTeacherMonitoring(response.data?.data ?? null)
    } catch (requestError) {
      if (requestError.response?.status !== 403) {
        setTeacherMonitoringError(requestError.response?.data?.message || 'Monitoring guru belum dapat dimuat.')
      }
    } finally {
      setTeacherMonitoringLoading(false)
    }
  }

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters)
    loadTeacherMonitoring(newFilters)
  }

  useEffect(() => {
    loadDashboard()
    loadTeacherMonitoring(filters)

    const timer = window.setInterval(() => {
      if (filters.period === 'harian' && document.visibilityState !== 'hidden') {
        loadTeacherMonitoring(filters)
      }
    }, 20000)
    return () => window.clearInterval(timer)
  }, [])

  const statistics = dashboard?.kartu_statistik || {}
  const alerts = (dashboard?.indikator_kinerja_utama || []).slice(0, 5)

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.05, delayChildren: 0.02 },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 12 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' } },
  }

  function KpiTintedCard({ icon: Icon, label, subtext, value, tone = 'emerald', onClick }) {
    const tones = {
      emerald: {
        card: 'border-emerald-100 bg-emerald-50/50 hover:border-emerald-200 dark:border-emerald-950/50 dark:bg-emerald-950/20',
        title: 'text-emerald-700 dark:text-emerald-400',
        icon: 'text-emerald-500',
        val: 'text-emerald-600 dark:text-emerald-300',
        sub: 'text-emerald-600/70 dark:text-emerald-400/70',
      },
      blue: {
        card: 'border-blue-100 bg-blue-50/50 hover:border-blue-200 dark:border-blue-950/50 dark:bg-blue-950/20',
        title: 'text-blue-700 dark:text-blue-400',
        icon: 'text-blue-500',
        val: 'text-blue-600 dark:text-blue-300',
        sub: 'text-blue-600/70 dark:text-blue-400/70',
      },
      rose: {
        card: 'border-rose-100 bg-rose-50/50 hover:border-rose-200 dark:border-rose-950/50 dark:bg-rose-950/20',
        title: 'text-rose-700 dark:text-rose-400',
        icon: 'text-rose-500',
        val: 'text-rose-600 dark:text-rose-300',
        sub: 'text-rose-600/70 dark:text-rose-400/70',
      },
      amber: {
        card: 'border-amber-100 bg-amber-50/50 hover:border-amber-200 dark:border-amber-950/50 dark:bg-amber-950/20',
        title: 'text-amber-700 dark:text-amber-400',
        icon: 'text-amber-500',
        val: 'text-amber-600 dark:text-amber-300',
        sub: 'text-amber-600/70 dark:text-amber-400/70',
      },
    }
    const t = tones[tone] || tones.emerald
    return (
      <motion.div
        variants={itemVariants}
        whileHover={{ scale: 1.04, y: -2 }}
        whileTap={{ scale: 0.96 }}
        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
        onClick={onClick}
        className={`text-left rounded-2xl border ${t.card} p-5 shadow-xs transition-all hover:shadow-md ${onClick ? 'cursor-pointer' : 'cursor-default'} group`}
      >
        <div className="flex items-center justify-between">
          <p className={`text-xs font-semibold ${t.title}`}>{label}</p>
          <Icon className={`h-4 w-4 ${t.icon} opacity-0 group-hover:opacity-100 transition-opacity`} />
        </div>
        <p className={`mt-2 text-2xl font-extrabold ${t.val}`}>{value ?? 0}</p>
        {subtext && (
          <p className={`mt-1.5 text-[10px] font-bold ${t.sub} flex items-center gap-0.5 truncate`}>
            {subtext}
          </p>
        )}
      </motion.div>
    )
  }

  return (
    <PageContainer maxW="7xl">
      <motion.div initial="hidden" animate="visible" variants={containerVariants} className="space-y-6 pb-12">
        {/* Breadcrumb Navigation */}
        <motion.div variants={itemVariants} className="print:hidden">
          <AppBreadcrumb items={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Pemantauan Sekolah' }]} />
        </motion.div>

        {/* Header Halaman Modern Hero Card */}
        <motion.div variants={itemVariants} className="relative overflow-hidden rounded-[22px] border-2 border-emerald-500/30 bg-gradient-to-r from-emerald-500/15 via-teal-500/10 to-emerald-600/15 p-5 sm:p-6 shadow-md shadow-emerald-500/10 dark:border-emerald-600/40 dark:bg-gradient-to-r dark:from-emerald-950/70 dark:via-teal-950/50 dark:to-slate-900 print:hidden">
          {/* Ambient Glow Background Accent (Vibrant Dual Emerald-Teal Blobs) */}
          <div className="pointer-events-none absolute -top-20 -right-20 h-56 w-56 rounded-full bg-gradient-to-br from-emerald-500/40 via-teal-400/30 to-emerald-600/20 blur-3xl dark:from-emerald-500/50 dark:via-teal-400/40" />
          <div className="pointer-events-none absolute -bottom-20 -left-20 h-56 w-56 rounded-full bg-gradient-to-tr from-emerald-600/30 via-teal-500/20 to-transparent blur-3xl dark:from-emerald-600/40 dark:via-teal-500/30" />

          <div className="relative z-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-4 min-w-0">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700 text-white shadow-xl shadow-emerald-600/40 border border-emerald-300/40 dark:from-emerald-400 dark:via-emerald-500 dark:to-teal-600">
                <Activity className="h-6 w-6" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                    Dashboard Pemantauan Sekolah
                  </h1>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-emerald-600 to-teal-600 px-3.5 py-1 text-xs font-extrabold text-white shadow-sm shadow-emerald-600/25 border border-emerald-300/40">
                    <ShieldCheck className="h-3.5 w-3.5" />
                    Monitoring Terpadu
                  </span>
                </div>
                <p className="mt-1 text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300 max-w-2xl leading-relaxed">
                  Pusat pemantauan terpadu statistik kehadiran siswa, guru, indikator kinerja operasional, dan keaktifan divisi.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
              <div className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-500/40 bg-gradient-to-r from-emerald-100 via-emerald-50 to-teal-100 px-3.5 py-1.5 text-xs font-black text-emerald-900 dark:border-emerald-700 dark:bg-gradient-to-r dark:from-emerald-950 dark:to-teal-950 dark:text-emerald-200 shadow-2xs">
                <Zap className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>Presensi & Operasional</span>
              </div>
            </div>
          </div>
        </motion.div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {cards.map(({ key }) => (
              <div key={key} className="h-28 animate-pulse rounded-2xl bg-slate-200 dark:bg-slate-800" />
            ))}
          </div>
        ) : !error ? (
          <motion.div variants={itemVariants} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {cards.map(({ key, label, icon: Icon, tone, subtext }) => (
                <KpiTintedCard
                  key={key}
                  label={label}
                  value={Number(statistics[key] || 0).toLocaleString('id-ID')}
                  icon={Icon}
                  tone={tone}
                  subtext={subtext}
                />
              ))}
            </div>

            <Card className="border border-slate-200/80 bg-white dark:border-slate-800 dark:bg-[#1B2433]">
              <CardHeader className="flex flex-row items-center justify-between pb-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400">
                    <AlertTriangle className="h-5 w-5" />
                  </div>
                  <div>
                    <CardTitle className="text-base font-bold text-slate-900 dark:text-white">
                      Indikator Perlu Perhatian
                    </CardTitle>
                    <CardDescription className="text-xs text-slate-500 dark:text-slate-400">
                      Prioritas operasional yang dikirim oleh sistem pemantauan.
                    </CardDescription>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {alerts.length > 0 && (
                    <Badge color="warning" size="sm">
                      {alerts.length} Perhatian
                    </Badge>
                  )}
                  <SquircleActionButton
                    variant="view"
                    icon={Printer}
                    label="Cetak"
                    onClick={() => {
                      printCleanTable({
                        title: 'Laporan Indikator Kinerja Perlu Perhatian',
                        subtitle: 'Prioritas Operasional Pemantauan Sekolah',
                        headers: ['NO', 'INDIKATOR KINERJA PERLU PERHATIAN', 'STATUS'],
                        rows: alerts.map((a, i) => [i + 1, a.nama_indikator || a.nama || 'Indikator Kinerja', 'Perlu Perhatian']),
                      })
                    }}
                  />
                </div>
              </CardHeader>
              <CardContent className="pt-2">
                {alerts.length ? (
                  <div className="space-y-2.5">
                    {alerts.map((item) => (
                      <Alert key={item.id} status="warning">
                        <AlertIndicator />
                        <AlertContent>
                          <AlertDescription className="text-xs font-semibold text-amber-900 dark:text-amber-200">
                            {item.nama_indikator || item.nama || 'Indikator kinerja'}
                          </AlertDescription>
                        </AlertContent>
                      </Alert>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs font-medium text-slate-500">Belum ada indikator kinerja pada periode ini.</p>
                )}
              </CardContent>
            </Card>
          </motion.div>
        ) : null}

        <motion.div variants={itemVariants}>
          <TeacherMonitoringPanel
            data={teacherMonitoring}
            loading={teacherMonitoringLoading}
            error={teacherMonitoringError}
            filters={filters}
            onFilterChange={handleFilterChange}
            onRetry={() => loadTeacherMonitoring(filters)}
          />
        </motion.div>
      </motion.div>
    </PageContainer>
  )
}
