import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  BookOpen,
  CheckCircle2,
  Users,
  CalendarCheck,
  Activity,
  RefreshCw,
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

export default function MusyrifDashboardPage() {
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
      console.error('Failed to load Musyrif dashboard:', err)
      setError(err.response?.data?.message || 'Gagal memuat data dashboard Musyrif.')
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

  const santriColumns = [
    {
      key: 'name',
      label: 'Nama Santri Binaan',
      render: (row) => <span className="font-extrabold text-slate-900 dark:text-white text-xs">{row.name}</span>,
    },
    {
      key: 'room',
      label: 'Kamar Asrama',
      render: (row) => <AppBadge variant="info">{row.room || 'Asrama'}</AppBadge>,
    },
    {
      key: 'worship',
      label: 'Kedisiplinan Shalat',
      render: (row) => <span className="font-semibold text-slate-800 dark:text-slate-200 text-xs">{row.worship}</span>,
    },
    {
      key: 'tahfizh',
      label: 'Capaian Hafalan',
      render: (row) => <span className="font-bold text-[#0E5C44] dark:text-[#3FBF75] text-xs">{row.tahfizh}</span>,
    },
    {
      key: 'status',
      label: 'Status',
      render: (row) => (
        <AppBadge variant={row.status === 'Baik' ? 'success' : 'warning'} dot>
          {row.status}
        </AppBadge>
      ),
    },
  ]

  return (
    <PageContainer maxW="7xl">
      <div className="space-y-6 pb-12">
      {/* Breadcrumb Navigation */}
      <AppBreadcrumb items={[{ label: 'Dashboard Musyrif Asrama' }]} />

      {/* Header */}
      <AppPageHeader
        variant="brand"
        title="Dashboard Musyrif / Pembimbing Asrama"
        eyebrow="Dormitory Management & Character Building"
        description="Monitoring ibadah harian, kedisiplinan asrama, mutaba'ah yaumiyah, dan setoran hafalan santri binaan."
        welcomeName="Musyrif Asrama"
        chips={[
          context.tahun_ajaran ? `TA ${context.tahun_ajaran.nama}` : 'TBA 2026/2027',
          context.semester ? `Semester ${context.semester.nama}` : 'Semester Ganjil',
          'Scope: Asrama Santri',
        ]}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <AppButton variant="accent" size="sm" icon={CalendarCheck} onClick={() => navigate('/dashboard/absensi-ibadah')}>
              Presensi Ibadah
            </AppButton>
            <AppButton variant="outline" size="sm" icon={RefreshCw} onClick={fetchDashboard} className="border-white/30 text-white hover:bg-white/10">
              Segarkan Data
            </AppButton>
          </div>
        }
      />

      {/* Filter Bar */}
      <AppFilterBar label="Filter Asrama & Santri" onReset={fetchDashboard} />

      {/* Primary KPI Grid */}
      <section className="space-y-3">
        <SectionHeader title="Kondisi Ibadah & Santri Binaan" subtitle="Jumlah santri, presensi shalat, setoran hafalan, dan mutaba'ah" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiCard
            title="Santri Binaan Asrama"
            value={formatNumber(kpis.santri_binaan?.total ?? kpis.total_siswa_binaan?.total ?? 0)}
            icon={Users}
            colorScheme="emerald"
            badge="Santri"
            badgeVariant="success"
            onClick={() => setActiveModal('santri_binaan')}
          />
          <KpiCard
            title="Presensi Shalat Berjamaah"
            value={formatNumber(kpis.ibadah_lengkap?.total ?? 0)}
            icon={CalendarCheck}
            colorScheme="blue"
            badge="Shalat"
            badgeVariant="info"
          />
          <KpiCard
            title="Setoran Hafalan Hari Ini"
            value={formatNumber(kpis.setoran_tahfizh?.total ?? kpis.setoran_hari_ini?.total ?? 0)}
            icon={BookOpen}
            colorScheme="violet"
            badge="Setoran"
            badgeVariant="purple"
          />
          <KpiCard
            title="Mutaba'ah Terisi"
            value={formatNumber(kpis.mutabaah_terisi?.total ?? 0)}
            icon={CheckCircle2}
            colorScheme="amber"
            badge="Mutaba'ah"
            badgeVariant="warning"
          />
        </div>
      </section>

      {/* Quick Action Navigation */}
      <section className="rounded-[18px] border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-[#1B2433]">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">Aksi Cepat Musyrif Asrama</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Pintas presensi ibadah, mutaba'ah harian, dan setoran hafalan santri</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <AppButton variant="secondary" size="sm" icon={CalendarCheck} onClick={() => navigate('/dashboard/absensi-ibadah')}>
              Presensi Ibadah Santri
            </AppButton>
            <AppButton variant="secondary" size="sm" icon={Activity} onClick={() => navigate('/dashboard/mutabaah')}>
              Mutabaah Harian Santri
            </AppButton>
            <AppButton variant="primary" size="sm" icon={BookOpen} onClick={() => navigate('/portal-guru/workspace?tab=tahfizh')}>
              Setoran Tahfizh Asrama
            </AppButton>
          </div>
        </div>
      </section>

      {/* Worship Discipline Chart & Santri Logs Table */}
      <section className="space-y-3">
        <SectionHeader title="Disiplin Shalat & Aktivitas Santri" subtitle="Grafik presensi shalat 5 waktu dan log aktivitas santri di kamar" />
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          <ChartCard
            title="Kedisiplinan Shalat Berjamaah"
            subtitle="Tingkat kehadiran shalat di Masjid/Musholla"
            className="lg:col-span-4"
            empty={!charts.worship_trend || charts.worship_trend.length === 0}
          >
            <div className="h-64 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={charts.worship_trend || []}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                  <XAxis dataKey="day" stroke="#888888" fontSize={11} />
                  <YAxis stroke="#888888" fontSize={11} />
                  <Tooltip />
                  <Bar dataKey="shubuh" fill="#0E5C44" name="Shubuh" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="isya" fill="#3FBF75" name="Isya" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>

          <div className="lg:col-span-8">
            <AppDataTable
              title="Daftar Santri Binaan & Aktivitas Harian"
              description="Ringkasan ibadah dan hafalan santri di kamar asrama"
              data={tables.santri_logs || []}
              columns={santriColumns}
              keyField="name"
              searchPlaceholder="Cari santri atau kamar..."
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
