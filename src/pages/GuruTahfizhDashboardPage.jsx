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
} from 'lucide-react'
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

      {/* Header */}
      <AppPageHeader
        variant="brand"
        title="Dashboard Guru Tahfizh / Musyrif"
        eyebrow="Tahfizh Management & Al-Qur'an Monitoring"
        description="Monitor setoran hafalan Al-Qur'an, murajaah harian, dan capaian target santri/siswa binaan."
        welcomeName="Guru Tahfizh"
        chips={[
          context.tahun_ajaran ? `TA ${context.tahun_ajaran.nama}` : 'TBA 2026/2027',
          context.semester ? `Semester ${context.semester.nama}` : 'Semester Ganjil',
          'Scope: Halaqah Tahfizh',
        ]}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <AppButton variant="accent" size="sm" icon={Plus} onClick={() => navigate('/portal-guru/workspace?tab=tahfizh')}>
              Input Setoran
            </AppButton>
            <AppButton variant="outline" size="sm" icon={RefreshCw} onClick={fetchDashboard} className="border-white/30 text-white hover:bg-white/10">
              Segarkan Data
            </AppButton>
          </div>
        }
      />

      {/* Filter Bar */}
      <AppFilterBar label="Filter Halaqah & Setoran" onReset={fetchDashboard} />

      {/* Primary KPI Grid */}
      <section className="space-y-3">
        <SectionHeader title="Metrik Setoran & Capaian Hafalan" subtitle="Ringkasan santri binaan, setoran hari ini, dan progres murajaah" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiCard
            title="Siswa Binaan"
            value={formatNumber(kpis.total_siswa_binaan?.total)}
            icon={BookOpen}
            colorScheme="emerald"
            badge="Binaan"
            badgeVariant="success"
            onClick={() => setActiveModal('total_siswa_binaan')}
          />
          <KpiCard
            title="Setoran Hari Ini"
            value={formatNumber(kpis.setoran_hari_ini?.total)}
            icon={CheckCircle2}
            colorScheme="blue"
            badge="Tercatat"
            badgeVariant="info"
          />
          <KpiCard
            title="Siswa Sudah Setor"
            value={formatNumber(kpis.siswa_sudah_setor?.total)}
            icon={Award}
            colorScheme="violet"
            badge="Sudah Setor"
            badgeVariant="purple"
          />
          <KpiCard
            title="Siswa Belum Setor"
            value={formatNumber(kpis.siswa_belum_setor?.total)}
            icon={UserX}
            colorScheme="rose"
            badge="Belum Setor"
            badgeVariant="danger"
          />
        </div>
      </section>

      {/* Secondary Volume KPIs */}
      <section className="space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <KpiCard
            title="Total Baris Setoran Hafalan"
            value={formatNumber(kpis.total_setoran_baris?.total)}
            icon={Layers}
            colorScheme="emerald"
            badge="Baris Hafalan"
          />
          <KpiCard
            title="Total Murajaah (Lembar)"
            value={formatNumber(kpis.total_murajaah_lembar?.total)}
            icon={BookOpen}
            colorScheme="indigo"
            badge="Lembar Murajaah"
          />
        </div>
      </section>

      {/* Quick Action Navigation */}
      <section className="rounded-[18px] border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-[#1B2433]">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">Aksi Cepat Guru Tahfizh</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Pintas input setoran hafalan, monitoring target, dan rekap harian</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <AppButton variant="secondary" size="sm" icon={Plus} onClick={() => navigate('/portal-guru/workspace?tab=tahfizh')}>
              Input Setoran
            </AppButton>
            <AppButton variant="secondary" size="sm" icon={BookOpen} onClick={() => navigate('/portal-guru/workspace?tab=tahfizh')}>
              Monitoring Target
            </AppButton>
            <AppButton variant="primary" size="sm" icon={FileText} onClick={() => navigate('/portal-guru/workspace?tab=tahfizh')}>
              Rekap Harian
            </AppButton>
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
