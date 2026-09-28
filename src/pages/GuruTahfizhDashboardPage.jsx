import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  BookOpen,
  Award,
  CheckCircle2,
  UserX,
  Plus,
  FileText,
  Layers,
  RefreshCw,
  Sparkles,
} from 'lucide-react'
import { motion } from 'framer-motion'
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
} from 'recharts'

import {
  AppPageHeader,
  AppBreadcrumb,
  AppFilterBar,
  KpiCard,
  AppDataTable,
  AppBadge,
  AppButton,
  SectionHeader,
  PageContainer,
} from '../components/app'

import ChartCard from '../components/dashboard/ChartCard'
import SkeletonDashboard from '../components/dashboard/SkeletonDashboard'
import ErrorState from '../components/dashboard/ErrorState'
import KpiQuickViewModal from '../components/KpiQuickViewModal'
import ModalErrorBoundary from '../components/common/ModalErrorBoundary'
import {
  MasterStatsGrid,
  MasterStatCard,
  MasterActionButton,
} from '../components/master-data'
import TahfizhSubNav from '../components/tahfizh/TahfizhSubNav'

import { managementDashboardService } from '../services/managementDashboardService'

const COLORS = ['#0E5C44', '#EF4444']

export default function GuruTahfizhDashboardPage() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [data, setData] = useState(null)
  const [activeModal, setActiveModal] = useState(null)

  const fetchDashboard = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await managementDashboardService.getGuruTahfizh()
      if (res && res.data) {
        setData(res.data)
      } else {
        setError('Format respon server tidak valid.')
      }
    } catch (err) {
      console.error('Failed to load Guru Tahfizh dashboard:', err)
      setError(err.response?.data?.message || 'Gagal memuat data dashboard Guru Tahfizh.')
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

  const setoranColumns = [
    {
      key: 'student',
      label: 'Siswa Binaan',
      render: (row) => (
        <span className="font-extrabold text-slate-900 dark:text-white text-xs">
          {row.student?.full_name || 'Siswa'}
        </span>
      ),
    },
    {
      key: 'surah',
      label: 'Surah & Ayat',
      render: (row) => (
        <span className="font-bold text-[#0E5C44] dark:text-[#3FBF75] text-xs">
          {row.hafalan_surah_name || 'Surah'} ({row.hafalan_ayah_start || 1}-{row.hafalan_ayah_end || 1})
        </span>
      ),
    },
    {
      key: 'baris',
      label: 'Baris',
      render: (row) => <span className="font-semibold text-slate-800 dark:text-slate-200 text-xs">{row.hafalan_baris || row.line_count || 0} Baris</span>,
    },
    {
      key: 'murajaah',
      label: 'Murajaah',
      render: (row) => <AppBadge variant="info">{row.murajaah_text || `${row.murajaah_lembar || 0} Lembar`}</AppBadge>,
    },
    {
      key: 'date',
      label: 'Tanggal',
      render: (row) => (
        <span className="text-xs text-slate-500 font-medium">
          {row.record_date || row.date || (row.created_at ? new Date(row.created_at).toLocaleDateString('id-ID') : '-')}
        </span>
      ),
    },
  ]

  return (
    <PageContainer maxW="7xl">
      <div className="space-y-6 pb-12">
      {/* Breadcrumb Navigation */}
      <div className="print:hidden">
        <AppBreadcrumb items={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Dashboard Guru Tahfizh' }]} />
      </div>

      {/* MODERN HERO CARD HEADER (§B / §7.7) */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="print:hidden">
        <div className="relative overflow-hidden rounded-[22px] border-2 border-emerald-500/30 bg-gradient-to-r from-emerald-500/15 via-teal-500/10 to-emerald-600/15 p-4 sm:p-6 shadow-md shadow-emerald-500/10 dark:border-emerald-600/40 dark:bg-gradient-to-r dark:from-emerald-950/70 dark:via-teal-950/50 dark:to-slate-900">
          <div className="pointer-events-none absolute -top-20 -right-20 h-56 w-56 rounded-full bg-gradient-to-br from-emerald-500/40 via-teal-400/30 to-emerald-600/20 blur-3xl dark:from-emerald-500/50 dark:via-teal-400/40" />
          <div className="pointer-events-none absolute -bottom-20 -left-20 h-56 w-56 rounded-full bg-gradient-to-tr from-emerald-600/30 via-teal-500/20 to-transparent blur-3xl dark:from-emerald-600/40 dark:via-teal-500/30" />

          <div className="relative z-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3.5 sm:gap-4 min-w-0">
              <div className="flex size-11 sm:size-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700 text-white shadow-xl shadow-emerald-600/40 border border-emerald-300/40 dark:from-emerald-400 dark:via-emerald-500 dark:to-teal-600">
                <BookOpen className="size-5 sm:size-7 text-white" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 sm:gap-2.5 flex-wrap">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-emerald-600 to-teal-600 px-3 py-0.5 sm:px-3.5 sm:py-1 text-[11px] sm:text-xs font-extrabold text-white shadow-md shadow-emerald-600/25 border border-emerald-300/40">
                    <Sparkles className="size-3 sm:size-3.5 text-amber-300 animate-pulse" />
                    Workspace Guru Tahfizh
                  </span>
                  <span className="inline-flex items-center rounded-full bg-emerald-100 px-3 py-0.5 text-xs font-bold text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/60">
                    {context.tahun_ajaran ? `TA ${context.tahun_ajaran.nama}` : 'Halaqah Tahfizh'}
                  </span>
                </div>
                <h1 className="mt-1.5 text-lg sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                  Dashboard Guru Tahfizh / Musyrif
                </h1>
                <p className="mt-0.5 sm:mt-1 text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-300 max-w-2xl leading-relaxed">
                  Monitor setoran hafalan Al-Qur'an, murajaah harian, dan capaian target santri/siswa binaan.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0 self-start sm:self-center">
              <MasterActionButton variant="primary" icon={Plus} onClick={() => navigate('/portal-guru/workspace?tab=tahfizh')}>
                <span>Input Setoran</span>
              </MasterActionButton>
              <button
                type="button"
                onClick={fetchDashboard}
                disabled={loading}
                className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-300 dark:border-emerald-700 bg-white/80 dark:bg-emerald-950/60 hover:bg-emerald-50 dark:hover:bg-emerald-900/60 px-3.5 py-2 text-xs font-bold text-emerald-800 dark:text-emerald-200 shadow-xs transition-colors cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
              >
                <RefreshCw className={`h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400 ${loading ? 'animate-spin' : ''}`} />
                <span>{loading ? 'Memuat...' : 'Segarkan Data'}</span>
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Tahfizh Sub-Navigation (5 tab modul, penuh untuk admin) */}
      <TahfizhSubNav />

      {/* Filter Bar */}
      <AppFilterBar label="Filter Halaqah & Setoran" onReset={fetchDashboard} />

      {/* Primary KPI Grid (Color-Tinted MasterStatCard) */}
      <section className="space-y-3">
        <SectionHeader title="Metrik Setoran & Capaian Hafalan" subtitle="Ringkasan santri binaan, setoran hari ini, dan progres murajaah" />
        <MasterStatsGrid cols={4}>
          <MasterStatCard
            label="Siswa Binaan"
            value={formatNumber(kpis.total_siswa_binaan?.total)}
            description="Total santri binaan halaqah"
            icon={BookOpen}
            variant="info"
            onClick={() => setActiveModal('total_siswa_binaan')}
          />
          <MasterStatCard
            label="Setoran Hari Ini"
            value={formatNumber(kpis.setoran_hari_ini?.total)}
            description="Total setoran tercatat"
            icon={CheckCircle2}
            variant="success"
          />
          <MasterStatCard
            label="Siswa Sudah Setor"
            value={formatNumber(kpis.siswa_sudah_setor?.total)}
            description="Santri yang telah menyetor"
            icon={Award}
            variant="purple"
          />
          <MasterStatCard
            label="Siswa Belum Setor"
            value={formatNumber(kpis.siswa_belum_setor?.total)}
            description="Perlu ditindaklanjuti"
            icon={UserX}
            variant="danger"
          />
        </MasterStatsGrid>
      </section>

      {/* Secondary Volume KPIs */}
      <section className="space-y-3">
        <MasterStatsGrid cols={2}>
          <MasterStatCard
            label="Total Baris Setoran Hafalan"
            value={formatNumber(kpis.total_setoran_baris?.total)}
            description="Total baris hafalan baru"
            icon={Layers}
            variant="success"
          />
          <MasterStatCard
            label="Total Murajaah (Lembar)"
            value={formatNumber(kpis.total_murajaah_lembar?.total)}
            description="Total lembar murajaah"
            icon={BookOpen}
            variant="warning"
          />
        </MasterStatsGrid>
      </section>

      {/* Quick Action Navigation (§K + MasterActionButton §H.6) */}
      <section className="relative overflow-hidden rounded-[22px] border-2 border-emerald-300 bg-white p-5 sm:p-6 shadow-md shadow-emerald-500/10 dark:border-emerald-700/80 dark:bg-[#1B2433]">
        <div className="pointer-events-none absolute -top-10 -right-10 h-32 w-32 rounded-full bg-emerald-400/10 blur-2xl dark:bg-emerald-400/15" />
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700 text-white shrink-0 shadow-sm border border-emerald-300/40">
              <FileText className="size-5" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-black text-slate-900 dark:text-white">Aksi Cepat Guru Tahfizh</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Pintas input setoran hafalan, monitoring target, dan rekap harian</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <MasterActionButton variant="primary" icon={Plus} onClick={() => navigate('/portal-guru/workspace?tab=tahfizh')}>
              <span>Input Setoran</span>
            </MasterActionButton>
            <MasterActionButton variant="secondary" icon={BookOpen} onClick={() => navigate('/portal-guru/workspace?tab=tahfizh')}>
              <span>Monitoring Target</span>
            </MasterActionButton>
            <MasterActionButton variant="secondary" icon={FileText} onClick={() => navigate('/portal-guru/workspace?tab=tahfizh')}>
              <span>Rekap Harian</span>
            </MasterActionButton>
          </div>
        </div>
      </section>

      {/* Setoran Status Pie Chart & Log Table */}
      <section className="space-y-3">
        <SectionHeader title="Status Setoran & Riwayat Hafalan" subtitle="Persentase kelengkapan setoran dan log hafalan siswa binaan" />
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          <ChartCard
            title="Status Setoran Hari Ini"
            subtitle="Perbandingan siswa sudah vs belum setor"
            className="lg:col-span-4"
            empty={!charts.setoran_summary || charts.setoran_summary.length === 0}
          >
            <div className="h-64 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={charts.setoran_summary || []}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="total"
                    nameKey="status"
                  >
                    {(charts.setoran_summary || []).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>

          <div className="lg:col-span-8">
            <AppDataTable
              title="Riwayat Setoran Terbaru"
              description="Catatan hafalan dan murajaah siswa binaan halaqah"
              data={tables.recent_logs || []}
              columns={setoranColumns}
              keyField="student"
              searchPlaceholder="Cari siswa atau surah..."
            />
          </div>
        </div>
      </section>

      {/* KPI Detail Modal */}
      <ModalErrorBoundary onClose={() => setActiveModal(null)}>
        <KpiQuickViewModal
          type={activeModal}
          isOpen={Boolean(activeModal)}
          onClose={() => setActiveModal(null)}
        />
      </ModalErrorBoundary>
    </div>
    </PageContainer>
  )
}
