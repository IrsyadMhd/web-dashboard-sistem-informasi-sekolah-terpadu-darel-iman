import { useEffect, useState } from 'react'
import { AlertTriangle, RefreshCw, Users, UserRoundCheck, Clock3, UserX, Printer } from 'lucide-react'
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
  const canLoadSummary = user?.permissions?.includes('dashboard.pemantauan.lihat')
  const canLoadTeacherMonitoring = user?.permissions?.includes('teacher_monitoring.view')

  const loadDashboard = async () => {
    setLoading(true)
    setError('')
    try {
      const response = await api.get('/dashboard-pemantauan/ringkasan')
      setDashboard(response.data?.data ?? null)
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Data dashboard tidak dapat dimuat.')
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
    if (canLoadSummary) loadDashboard()
    else setLoading(false)
    if (canLoadTeacherMonitoring) loadTeacherMonitoring(filters)
    else setTeacherMonitoringLoading(false)
    
    const timer = window.setInterval(() => {
      if (canLoadTeacherMonitoring && filters.period === 'harian' && document.visibilityState !== 'hidden') {
        loadTeacherMonitoring(filters)
      }
    }, 20000)
    return () => window.clearInterval(timer)
  }, [canLoadSummary, canLoadTeacherMonitoring])

  if (loading) {
    return (
      <PageContainer maxW="7xl">
        <div className="space-y-6 pb-12">
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {cards.map((card) => (
              <div key={card.key} className="h-28 animate-pulse rounded-2xl bg-slate-200 dark:bg-slate-800" />
            ))}
          </div>
          <div className="h-40 animate-pulse rounded-2xl bg-slate-200 dark:bg-slate-800" />
        </div>
      </PageContainer>
    )
  }

  if (error && !teacherMonitoring && !teacherMonitoringLoading) {
    return (
      <PageContainer maxW="7xl">
        <div className="py-6">
          <Alert status="error">
            <AlertIndicator />
            <AlertContent>
              <AlertTitle>Gagal Memuat Data Pemantauan</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
              <div className="mt-3">
                <Button size="sm" variant="danger" appearance="outline" onClick={loadDashboard}>
                  <RefreshCw className="mr-2 h-4 w-4" /> Coba Lagi
                </Button>
              </div>
            </AlertContent>
          </Alert>
        </div>
      </PageContainer>
    )
  }

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
        <motion.div variants={itemVariants}>
          <AppBreadcrumb items={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Pemantauan Sekolah' }]} />
          <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
                Dashboard Pemantauan Sekolah
              </h1>
              <p className="mt-1 text-sm font-medium text-slate-500 dark:text-slate-400">
                Pusat pemantauan terpadu statistik kehadiran siswa, guru, indikator kinerja operasional, dan keaktifan divisi.
              </p>
            </div>
          </div>
        </motion.div>

        {!error && (
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
        )}

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
