import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Database,
  Users,
  Settings,
  ShieldCheck,
  Building2,
  BookOpen,
  CheckCircle2,
  Activity,
  RefreshCw,
  SlidersHorizontal,
  BarChart3,
  FileText,
  Sparkles,
  ArrowRight,
} from 'lucide-react'
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts'

import {
  AppBreadcrumb,
  AppDataTable,
  AppBadge,
  PageContainer,
} from '../components/app'

import SkeletonDashboard from '../components/dashboard/SkeletonDashboard'
import ErrorState from '../components/dashboard/ErrorState'
import KpiQuickViewModal from '../components/KpiQuickViewModal'
import ModalErrorBoundary from '../components/common/ModalErrorBoundary'
import { Button } from '@/components/tailgrids/core/button'
import { managementDashboardService } from '../services/managementDashboardService'

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
    cta: 'text-emerald-700 dark:text-emerald-400',
  },
  blue: {
    card: 'border-sky-300/70 bg-gradient-to-br from-sky-50 via-blue-50/60 to-white hover:border-sky-400 dark:border-sky-700/50 dark:from-sky-950/40 dark:via-blue-950/20 dark:to-slate-900',
    glow: 'bg-sky-400/20 group-hover:bg-sky-400/30',
    iconBox: 'bg-gradient-to-br from-sky-500 to-blue-600 text-white shadow-sm shadow-sky-500/30',
    tag: 'bg-sky-100 text-sky-800 dark:bg-sky-900/60 dark:text-sky-300',
    title: 'text-sky-700 dark:text-sky-400',
    val: 'text-slate-900 dark:text-white',
    sub: 'text-slate-600 dark:text-slate-400',
    cta: 'text-sky-700 dark:text-sky-400',
  },
  teal: {
    card: 'border-teal-300/70 bg-gradient-to-br from-teal-50 via-emerald-50/60 to-white hover:border-teal-400 dark:border-teal-700/50 dark:from-teal-950/40 dark:via-emerald-950/20 dark:to-slate-900',
    glow: 'bg-teal-400/20 group-hover:bg-teal-400/30',
    iconBox: 'bg-gradient-to-br from-teal-500 to-emerald-600 text-white shadow-sm shadow-teal-500/30',
    tag: 'bg-teal-100 text-teal-800 dark:bg-teal-900/60 dark:text-teal-300',
    title: 'text-teal-700 dark:text-teal-400',
    val: 'text-slate-900 dark:text-white',
    sub: 'text-slate-600 dark:text-slate-400',
    cta: 'text-teal-700 dark:text-teal-400',
  },
  amber: {
    card: 'border-amber-300/70 bg-gradient-to-br from-amber-50 via-orange-50/60 to-white hover:border-amber-400 dark:border-amber-700/50 dark:from-amber-950/40 dark:via-orange-950/20 dark:to-slate-900',
    glow: 'bg-amber-400/20 group-hover:bg-amber-400/30',
    iconBox: 'bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-sm shadow-amber-500/30',
    tag: 'bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-300',
    title: 'text-amber-700 dark:text-amber-400',
    val: 'text-slate-900 dark:text-white',
    sub: 'text-slate-600 dark:text-slate-400',
    cta: 'text-amber-700 dark:text-amber-400',
  },
}

function ModernKpiCard({ icon: Icon, label, subtext, value, tag, ctaText = 'Rincian Data', tone = 'emerald', onClick }) {
  const t = MODERN_CARD_TONES[tone] || MODERN_CARD_TONES.emerald
  const isClickable = typeof onClick === 'function'

  return (
    <motion.article
      whileHover={isClickable ? { scale: 1.02, y: -2 } : undefined}
      whileTap={isClickable ? { scale: 0.98 } : undefined}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      onClick={onClick}
      role={isClickable ? 'button' : undefined}
      tabIndex={isClickable ? 0 : undefined}
      className={`group relative overflow-hidden rounded-[18px] border-2 p-5 shadow-xs transition-[border-color,box-shadow] duration-150 text-left flex flex-col justify-between h-full ${
        isClickable ? 'cursor-pointer hover:shadow-md' : 'cursor-default'
      } ${t.card}`}
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

      {isClickable && (
        <div className={`mt-4 pt-3 border-t border-slate-200/60 dark:border-slate-800/60 flex items-center justify-between text-[11px] font-bold ${t.cta}`}>
          <span>{ctaText}</span>
          <span className="inline-flex items-center gap-0.5 group-hover:translate-x-1 transition-transform">
            Detail &rarr;
          </span>
        </div>
      )}
    </motion.article>
  )
}

export default function OperatorDashboardPage() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [data, setData] = useState(null)
  const [activeModal, setActiveModal] = useState(null)

  const fetchDashboard = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await managementDashboardService.getOperator()
      if (res && res.data) {
        setData(res.data)
      } else {
        setError('Format respon server tidak valid.')
      }
    } catch (err) {
      console.error('Failed to load Operator dashboard:', err)
      setError(err.response?.data?.message || 'Gagal memuat data dashboard Operator.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDashboard()
  }, [])

  if (loading && !data) return <SkeletonDashboard />
  if (error && !data) return <ErrorState message={error} onRetry={fetchDashboard} />

  const kpis = data?.kpis || {}
  const context = data?.context || {}
  const charts = data?.charts || {}
  const tables = data?.tables || {}

  const formatNumber = (num) => (num !== undefined && num !== null ? Number(num).toLocaleString('id-ID') : '0')

  const auditColumns = [
    {
      key: 'action',
      label: 'Aktivitas System Audit',
      render: (row) => <span className="font-extrabold text-slate-900 dark:text-white text-xs">{row.action}</span>,
    },
    {
      key: 'module',
      label: 'Modul',
      render: (row) => <AppBadge variant="info">{row.module || 'System'}</AppBadge>,
    },
    {
      key: 'user',
      label: 'Pengguna',
      render: (row) => <span className="font-semibold text-slate-700 dark:text-slate-300 text-xs">{row.user || 'Admin'}</span>,
    },
    {
      key: 'timestamp',
      label: 'Waktu',
      render: (row) => <span className="text-xs text-slate-500 font-medium font-mono">{row.timestamp}</span>,
    },
  ]

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
          <AppBreadcrumb items={[{ label: 'Dashboard Admin Operations' }]} />
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
                <SlidersHorizontal className="h-6 w-6" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                    Dashboard Admin / Operator Sistem
                  </h1>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-emerald-600 to-teal-600 px-3.5 py-1 text-xs font-extrabold text-white shadow-sm shadow-emerald-600/25 border border-emerald-300/40">
                    <ShieldCheck className="h-3.5 w-3.5" />
                    Administrator Platform
                  </span>
                </div>
                <p className="mt-1 text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300 max-w-2xl leading-relaxed">
                  Manajemen data terpadu, pemeliharaan master data sekolah, audit log aktivitas operator, dan monitoring operasional harian.
                </p>
                <div className="mt-2.5 flex flex-wrap items-center gap-2">
                  <span className="rounded-md bg-emerald-100/80 px-2 py-0.5 text-[11px] font-bold text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300 font-mono">
                    {context.tahun_ajaran ? `TA ${context.tahun_ajaran.nama}` : 'TA 2026/2027'}
                  </span>
                  <span className="rounded-md bg-teal-100/80 px-2 py-0.5 text-[11px] font-bold text-teal-800 dark:bg-teal-900/60 dark:text-teal-300 font-mono">
                    {context.semester ? `Semester ${context.semester.nama}` : 'Semester Ganjil'}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2.5 shrink-0 flex-wrap self-end sm:self-center">
              <Button
                variant="primary"
                appearance="fill"
                size="sm"
                onClick={() => navigate('/dashboard/master/siswa')}
                className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-md shadow-emerald-600/30 cursor-pointer"
              >
                <Database className="mr-1.5 h-4 w-4" /> Kelola Siswa
              </Button>
              <Button
                variant="ghost"
                appearance="outline"
                size="sm"
                onClick={fetchDashboard}
                className="border-emerald-300 dark:border-emerald-700/60 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-50/50 dark:hover:bg-emerald-950/40 cursor-pointer"
              >
                <RefreshCw className="mr-1.5 h-4 w-4" /> Segarkan Data
              </Button>
            </div>
          </div>
        </motion.div>

        {/* ── Section 1: KPI Summary Cards ── */}
        <motion.div variants={itemVariants}>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <ModernKpiCard
              icon={Users}
              label="Total Pengguna Terdaftar"
              subtext="Akun pengguna dalam sistem"
              value={formatNumber(kpis.total_users?.total)}
              tag="Akun Sistem"
              tone="emerald"
              onClick={() => setActiveModal('total_users')}
            />
            <ModernKpiCard
              icon={BookOpen}
              label="Data Siswa Aktif"
              subtext="Santri & murid terdaftar"
              value={formatNumber(kpis.total_students?.total)}
              tag="Siswa"
              tone="blue"
              onClick={() => setActiveModal('total_students')}
            />
            <ModernKpiCard
              icon={Building2}
              label="Data Pegawai & Guru"
              subtext="Pendidik & staf kependidikan"
              value={formatNumber(kpis.total_employees?.total)}
              tag="SDM"
              tone="teal"
              onClick={() => setActiveModal('total_employees')}
            />
            <ModernKpiCard
              icon={CheckCircle2}
              label="Kelas Aktif Terkelola"
              subtext="Rombel aktif beroperasi"
              value={formatNumber(kpis.active_classes?.total)}
              tag="Kelas"
              tone="amber"
            />
          </div>
        </motion.div>

        {/* ── Section 2: Quick Action Bar ── */}
        <motion.div
          variants={itemVariants}
          className="relative overflow-hidden rounded-[22px] border-2 border-emerald-300 dark:border-emerald-700/80 bg-white p-5 sm:p-6 shadow-md shadow-emerald-500/10 dark:bg-[#1B2433]"
        >
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-sm shadow-emerald-500/30">
                <Sparkles className="size-5 text-white" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                  Aksi Pintas Admin Operations
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                  Akses cepat pemeliharaan master data dan otorisasi aplikasi
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => navigate('/dashboard/master/siswa')}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 transition cursor-pointer border border-slate-200 dark:border-slate-700"
              >
                <Database className="size-3.5 text-emerald-600" />
                <span>Master Siswa</span>
              </button>
              <button
                type="button"
                onClick={() => navigate('/dashboard/pengaturan')}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 transition cursor-pointer border border-slate-200 dark:border-slate-700"
              >
                <Settings className="size-3.5 text-emerald-600" />
                <span>Pengaturan Sistem</span>
              </button>
              <button
                type="button"
                onClick={() => navigate('/dashboard/master/hak-akses')}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 transition cursor-pointer border border-slate-200 dark:border-slate-700"
              >
                <ShieldCheck className="size-3.5 text-emerald-600" />
                <span>Hak Akses & Role</span>
              </button>
              <button
                type="button"
                onClick={() => navigate('/dashboard/notifications')}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 shadow-sm shadow-emerald-600/25 transition cursor-pointer"
              >
                <Activity className="size-3.5" />
                <span>Audit Notifikasi</span>
              </button>
            </div>
          </div>
        </motion.div>

        {/* ── Section 3: Data Density Chart & Audit Log Table ── */}
        <motion.div variants={itemVariants} className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-stretch">
            {/* Visual Analytics Chart */}
            <div className="relative overflow-hidden rounded-[22px] border-2 border-emerald-300 dark:border-emerald-700/80 bg-white p-5 sm:p-6 shadow-md shadow-emerald-500/10 dark:bg-[#1B2433] flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4 pb-3 border-b border-emerald-200/90 dark:border-emerald-800/60">
                  <div className="flex items-center gap-2.5">
                    <div className="flex size-9 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-sm shadow-emerald-500/30">
                      <BarChart3 className="size-4 text-white" />
                    </div>
                    <div>
                      <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                        Volume Master Data
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                        Kepadatan record dalam database
                      </p>
                    </div>
                  </div>
                </div>

                <div className="h-64 w-full pt-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={charts.data_density || []}>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                      <XAxis dataKey="name" stroke="#888888" fontSize={11} />
                      <YAxis stroke="#888888" fontSize={11} />
                      <Tooltip />
                      <Bar dataKey="total" fill="#10B981" radius={[6, 6, 0, 0]} name="Jumlah Record" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Audit Log Table Container */}
            <div className="lg:col-span-2 relative overflow-hidden rounded-[22px] border-2 border-emerald-300 dark:border-emerald-700/80 bg-white shadow-md shadow-emerald-500/10 dark:bg-[#1B2433]">
              <div className="p-4 sm:p-5 bg-gradient-to-r from-emerald-500/10 via-teal-500/5 to-transparent border-b border-emerald-200/90 dark:border-emerald-800/60 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="flex size-9 items-center justify-center rounded-xl bg-gradient-to-br from-teal-500 to-emerald-600 text-white shadow-sm shadow-teal-500/30">
                    <FileText className="size-4 text-white" />
                  </div>
                  <div>
                    <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                      Log Aktivitas & Audit Operator
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                      Catatan riwayat pengubahan data dan otorisasi sistem
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-4 sm:p-5">
                <AppDataTable
                  data={tables.recent_activities || []}
                  columns={auditColumns}
                  keyField="timestamp"
                  searchPlaceholder="Cari riwayat aktivitas operator..."
                />
              </div>
            </div>
          </div>
        </motion.div>

        {/* ── KPI Detail Modal ── */}
        <ModalErrorBoundary onClose={() => setActiveModal(null)}>
          <KpiQuickViewModal
            type={activeModal}
            isOpen={Boolean(activeModal)}
            onClose={() => setActiveModal(null)}
          />
        </ModalErrorBoundary>
      </motion.div>
    </PageContainer>
  )
}
