import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  BookOpen,
  Award,
  CheckCircle2,
  UserX,
  Plus,
  FileText,
  Eye,
  Layers,
  RefreshCw,
  Sparkles,
} from 'lucide-react'
import { motion } from 'framer-motion'
import { Button } from '@/components/tailgrids/core/button'
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
} from '../components/master-data'

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
      <AppBreadcrumb items={[{ label: 'Dashboard Guru Tahfizh' }]} />

      {/* MODERN HERO CARD HEADER (MATCHING PORTAL ORANG TUA / SISWA STYLE) */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
        <div className="relative overflow-hidden rounded-[22px] border-2 border-emerald-500/30 bg-gradient-to-r from-emerald-500/15 via-teal-500/10 to-emerald-600/15 p-5 sm:p-6 shadow-md shadow-emerald-500/10 dark:border-emerald-600/40 dark:bg-gradient-to-r dark:from-emerald-950/70 dark:via-teal-950/50 dark:to-slate-900">
          <div className="pointer-events-none absolute -top-12 -right-12 h-48 w-48 rounded-full bg-gradient-to-br from-emerald-500/30 via-teal-400/20 to-transparent blur-3xl" />
          <div className="pointer-events-none absolute -bottom-12 -left-12 h-48 w-48 rounded-full bg-gradient-to-tr from-teal-500/20 via-emerald-400/20 to-transparent blur-3xl" />

          <div className="relative z-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex size-12 sm:size-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700 text-white shadow-xl shadow-emerald-600/40 border border-emerald-300/40 dark:from-emerald-400 dark:via-emerald-500 dark:to-teal-600">
                <BookOpen className="size-6 sm:size-7 text-white" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-emerald-600 to-teal-600 px-3.5 py-1 text-xs font-extrabold text-white shadow-md shadow-emerald-600/30">
                    <Sparkles className="size-3 text-amber-300 animate-pulse" />
                    Workspace Guru Tahfizh
                  </span>
                  <span className="inline-flex items-center rounded-full bg-emerald-100 px-3 py-0.5 text-xs font-bold text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/60">
                    {context.tahun_ajaran ? `TA ${context.tahun_ajaran.nama}` : 'Halaqah Tahfizh'}
                  </span>
                </div>
                <h1 className="mt-1.5 text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                  Dashboard Guru Tahfizh / Musyrif
                </h1>
                <p className="mt-0.5 text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-300 max-w-2xl">
                  Monitor setoran hafalan Al-Qur'an, murajaah harian, dan capaian target santri/siswa binaan.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 shrink-0 z-10">
              <Button
                type="button"
                variant="primary"
                appearance="fill"
                size="sm"
                onClick={() => navigate('/portal-guru/workspace?tab=tahfizh')}
                prefixIcon={<Plus className="h-4 w-4" />}
                className="!bg-gradient-to-r !from-emerald-600 !to-teal-600 !text-white font-bold shadow-md shadow-emerald-600/25 cursor-pointer"
              >
                Input Setoran
              </Button>
              <Button
                type="button"
                variant="ghost"
                appearance="outline"
                size="sm"
                onClick={fetchDashboard}
                disabled={loading}
                prefixIcon={<RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />}
                className="font-bold cursor-pointer"
              >
                Segarkan Data
              </Button>
            </div>
          </div>
        </div>
      </motion.div>

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

      {/* Quick Action Navigation (TailGrids Button Styled) */}
      <section className="relative overflow-hidden rounded-[22px] border-2 border-emerald-500/25 bg-white p-5 shadow-md shadow-emerald-500/5 dark:border-emerald-600/35 dark:bg-[#1B2433]">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">Aksi Cepat Guru Tahfizh</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Pintas input setoran hafalan, monitoring target, dan rekap harian</p>
          </div>
          <div className="flex flex-wrap items-center gap-2.5">
            <Button
              type="button"
              variant="primary"
              appearance="fill"
              size="sm"
              prefixIcon={<Plus className="h-4 w-4" />}
              onClick={() => navigate('/portal-guru/workspace?tab=tahfizh')}
              className="!bg-gradient-to-r !from-emerald-600 !to-teal-600 !text-white font-bold shadow-md shadow-emerald-600/25 cursor-pointer"
            >
              Input Setoran
            </Button>
            <Button
              type="button"
              variant="ghost"
              appearance="outline"
              size="sm"
              prefixIcon={<BookOpen className="h-4 w-4 text-emerald-600" />}
              onClick={() => navigate('/portal-guru/workspace?tab=tahfizh')}
              className="font-bold cursor-pointer"
            >
              Monitoring Target
            </Button>
            <Button
              type="button"
              variant="ghost"
              appearance="outline"
              size="sm"
              prefixIcon={<FileText className="h-4 w-4 text-teal-600" />}
              onClick={() => navigate('/portal-guru/workspace?tab=tahfizh')}
              className="font-bold cursor-pointer"
            >
              Rekap Harian
            </Button>
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
