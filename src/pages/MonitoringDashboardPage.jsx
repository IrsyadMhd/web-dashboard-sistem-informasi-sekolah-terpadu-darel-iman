import React, { useState, useEffect } from 'react'
import { Activity, AlertTriangle, RefreshCw, Sparkles, Users, UserRoundCheck, Clock3, UserX, Printer, ShieldCheck, Zap, Eye } from 'lucide-react'
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
  { key: 'total_siswa', label: 'Total Siswa', icon: Users, tone: 'emerald', tag: 'Siswa', subtext: 'Siswa Terdaftar' },
  { key: 'total_guru', label: 'Total Guru', icon: UserRoundCheck, tone: 'blue', tag: 'Pendidik', subtext: 'Tenaga Pendidik' },
  { key: 'kehadiran_hari_ini', label: 'Kehadiran Hari Ini', icon: Clock3, tone: 'indigo', tag: 'Presensi', subtext: 'Presensi Terverifikasi' },
  { key: 'statistik_ketidakhadiran', label: 'Tidak Hadir', icon: UserX, tone: 'rose', tag: 'Perhatian', subtext: 'Izin / Sakit / Alpa' },
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

  // ── SUB-KOMPONEN MODERN KPI CARDS (Spesifikasi Sesuai Dashboard Kepala Sekolah) ──
  const MODERN_CARD_TONES = {
    emerald: {
      card: 'border-emerald-300/70 bg-gradient-to-br from-emerald-50 via-teal-50/60 to-white hover:border-emerald-400 dark:border-emerald-700/50 dark:from-emerald-950/40 dark:via-teal-950/20 dark:to-slate-900',
      glow: 'bg-emerald-400/20 group-hover:bg-emerald-400/30',
      iconBox: 'bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-emerald-500/30',
      tag: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/60 dark:text-emerald-300',
      title: 'text-emerald-700 dark:text-emerald-400',
      val: 'text-emerald-700 dark:text-emerald-300',
      sub: 'text-emerald-600/80 dark:text-emerald-400/80',
      cta: 'text-emerald-600/60 dark:text-emerald-500/60',
    },
    blue: {
      card: 'border-blue-300/70 bg-gradient-to-br from-blue-50 via-cyan-50/60 to-white hover:border-blue-400 dark:border-blue-700/50 dark:from-blue-950/40 dark:via-cyan-950/20 dark:to-slate-900',
      glow: 'bg-blue-400/20 group-hover:bg-blue-400/30',
      iconBox: 'bg-gradient-to-br from-blue-500 to-cyan-600 text-white shadow-blue-500/30',
      tag: 'bg-blue-100 text-blue-700 dark:bg-blue-900/60 dark:text-blue-300',
      title: 'text-blue-700 dark:text-blue-400',
      val: 'text-blue-700 dark:text-blue-300',
      sub: 'text-blue-600/80 dark:text-blue-400/80',
      cta: 'text-blue-600/60 dark:text-blue-500/60',
    },
    amber: {
      card: 'border-amber-300/70 bg-gradient-to-br from-amber-50 via-orange-50/60 to-white hover:border-amber-400 dark:border-amber-700/50 dark:from-amber-950/40 dark:via-orange-950/20 dark:to-slate-900',
      glow: 'bg-amber-400/20 group-hover:bg-amber-400/30',
      iconBox: 'bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-amber-500/30',
      tag: 'bg-amber-100 text-amber-700 dark:bg-amber-900/60 dark:text-amber-300',
      title: 'text-amber-700 dark:text-amber-400',
      val: 'text-amber-700 dark:text-amber-300',
      sub: 'text-amber-600/80 dark:text-amber-400/80',
      cta: 'text-amber-600/60 dark:text-amber-500/60',
    },
    rose: {
      card: 'border-rose-300/70 bg-gradient-to-br from-rose-50 via-pink-50/60 to-white hover:border-rose-400 dark:border-rose-700/50 dark:from-rose-950/40 dark:via-pink-950/20 dark:to-slate-900',
      glow: 'bg-rose-400/20 group-hover:bg-rose-400/30',
      iconBox: 'bg-gradient-to-br from-rose-500 to-pink-600 text-white shadow-rose-500/30',
      tag: 'bg-rose-100 text-rose-700 dark:bg-rose-900/60 dark:text-rose-300',
      title: 'text-rose-700 dark:text-rose-400',
      val: 'text-rose-700 dark:text-rose-300',
      sub: 'text-rose-600/80 dark:text-rose-400/80',
      cta: 'text-rose-600/60 dark:text-rose-500/60',
    },
    indigo: {
      card: 'border-indigo-300/70 bg-gradient-to-br from-indigo-50 via-sky-50/60 to-white hover:border-indigo-400 dark:border-indigo-700/50 dark:from-indigo-950/40 dark:via-sky-950/20 dark:to-slate-900',
      glow: 'bg-indigo-400/20 group-hover:bg-indigo-400/30',
      iconBox: 'bg-gradient-to-br from-indigo-500 to-sky-600 text-white shadow-indigo-500/30',
      tag: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/60 dark:text-indigo-300',
      title: 'text-indigo-700 dark:text-indigo-400',
      val: 'text-indigo-700 dark:text-indigo-300',
      sub: 'text-indigo-600/80 dark:text-indigo-400/80',
      cta: 'text-indigo-600/60 dark:text-indigo-500/60',
    },
    purple: {
      card: 'border-purple-300/70 bg-gradient-to-br from-purple-50 via-indigo-50/60 to-white hover:border-purple-400 dark:border-purple-700/50 dark:from-purple-950/40 dark:via-indigo-950/20 dark:to-slate-900',
      glow: 'bg-purple-400/20 group-hover:bg-purple-400/30',
      iconBox: 'bg-gradient-to-br from-purple-500 to-indigo-600 text-white shadow-purple-500/30',
      tag: 'bg-purple-100 text-purple-700 dark:bg-purple-900/60 dark:text-purple-300',
      title: 'text-purple-700 dark:text-purple-400',
      val: 'text-purple-700 dark:text-purple-300',
      sub: 'text-purple-600/80 dark:text-purple-400/80',
      cta: 'text-purple-600/60 dark:text-purple-500/60',
    },
  }

  function ModernKpiCard({ icon: Icon, label, subtext, value, tag, tone = 'emerald', onClick }) {
    const t = MODERN_CARD_TONES[tone] || MODERN_CARD_TONES.emerald
    const isClickable = typeof onClick === 'function'

    return (
      <motion.div
        variants={itemVariants}
        whileHover={{ scale: 1.02, y: -2 }}
        whileTap={{ scale: 0.98 }}
        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
        onClick={onClick}
        role={isClickable ? 'button' : undefined}
        tabIndex={isClickable ? 0 : undefined}
        onKeyDown={isClickable ? (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick(); } } : undefined}
        className={`group relative overflow-hidden rounded-[18px] border-2 p-5 shadow-sm transition-all duration-200 text-left ${
          isClickable ? 'cursor-pointer hover:shadow-md' : 'cursor-default'
        } ${t.card}`}
      >
        {/* Ambient Glow */}
        <div className={`pointer-events-none absolute -top-8 -right-8 h-28 w-28 rounded-full blur-2xl transition-all ${t.glow}`} />

        {/* Header with Gradient Icon Box & Pill Tag */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2.5">
            <div className={`flex h-9 w-9 items-center justify-center rounded-xl text-white shadow-sm ${t.iconBox}`}>
              <Icon className="h-4.5 w-4.5" />
            </div>
            <div>
              <p className={`text-[11px] font-bold uppercase tracking-wider ${t.title}`}>{label}</p>
            </div>
          </div>
          {tag && (
            <span className={`rounded-lg px-2 py-0.5 text-[10px] font-extrabold ${t.tag}`}>
              {tag}
            </span>
          )}
        </div>

        {/* Metric Value */}
        <p className={`text-4xl font-black tabular-nums ${t.val}`}>
          {value ?? '0'}
        </p>
        {subtext && (
          <p className={`mt-0.5 text-[11px] font-semibold ${t.sub}`}>
            {subtext}
          </p>
        )}

        {/* Click Affordance Footer */}
        {isClickable && (
          <p className={`mt-3 text-[10px] font-bold flex items-center gap-1 ${t.cta}`}>
            <Eye className="h-3 w-3" /> Klik untuk detail lengkap
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
              {cards.map(({ key, label, icon: Icon, tone, tag, subtext }) => (
                <ModernKpiCard
                  key={key}
                  label={label}
                  value={Number(statistics[key] || 0).toLocaleString('id-ID')}
                  icon={Icon}
                  tone={tone}
                  tag={tag}
                  subtext={subtext}
                />
              ))}
            </div>

            {/* Indikator Perlu Perhatian Card Container */}
            <div className="relative overflow-hidden rounded-[22px] border-2 border-emerald-500/25 bg-white p-5 sm:p-6 shadow-md shadow-emerald-500/5 dark:border-emerald-600/35 dark:bg-[#1B2433]">
              <div className="pointer-events-none absolute -top-10 -right-10 h-32 w-32 rounded-full bg-emerald-400/10 blur-2xl dark:bg-emerald-400/15" />
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-emerald-500/15 dark:border-emerald-800/40">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-sm shadow-amber-500/30">
                    <AlertTriangle className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                      Indikator Perlu Perhatian
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      Prioritas operasional yang dikirim oleh sistem pemantauan.
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {alerts.length > 0 && (
                    <span className="rounded-lg px-2.5 py-1 text-[11px] font-extrabold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                      {alerts.length} Perhatian
                    </span>
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
              </div>
              <div className="pt-4">
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
              </div>
            </div>
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
