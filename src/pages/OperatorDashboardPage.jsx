import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
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
      render: (row) => <span className="text-xs text-slate-500 font-medium">{row.timestamp}</span>,
    },
  ]

  return (
    <PageContainer maxW="7xl">
      <div className="space-y-6 pb-12">
      {/* Breadcrumb Navigation */}
      <AppBreadcrumb items={[{ label: 'Dashboard Admin Operations' }]} />

      {/* Header */}
      <AppPageHeader
        variant="brand"
        title="Dashboard Admin / Operator Sistem"
        eyebrow="Platform Operations & Data Administration"
        description="Manajemen data terpadu, pemeliharaan master data sekolah, audit log, dan monitoring operasional harian."
        welcomeName="Admin Operations"
        chips={[
          context.tahun_ajaran ? `Tahun Ajaran ${context.tahun_ajaran.nama}` : 'TBA 2026/2027',
          context.semester ? `Semester ${context.semester.nama}` : 'Semester Ganjil',
          'Scope: Administrator Platform',
        ]}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <AppButton variant="accent" size="sm" icon={Database} onClick={() => navigate('/dashboard/students')}>
              Master Data
            </AppButton>
            <AppButton variant="outline" size="sm" icon={RefreshCw} onClick={fetchDashboard} className="border-white/30 text-white hover:bg-white/10">
              Segarkan Data
            </AppButton>
          </div>
        }
      />

      {/* Filter Bar */}
      <AppFilterBar label="Filter Operasional" onReset={fetchDashboard} />

      {/* KPI Cards Grid */}
      <section className="space-y-3">
        <SectionHeader title="Metrik Pengelolaan Data Master" subtitle="Kerapatan record master data dan status operasional sistem" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiCard
            title="Total Pengguna Terdaftar"
            value={formatNumber(kpis.total_users?.total)}
            icon={Users}
            colorScheme="emerald"
            badge="Akun Sistem"
            badgeVariant="success"
            onClick={() => setActiveModal('total_users')}
          />
          <KpiCard
            title="Data Siswa Aktif"
            value={formatNumber(kpis.total_students?.total)}
            icon={BookOpen}
            colorScheme="blue"
            badge="Siswa"
            badgeVariant="info"
            onClick={() => setActiveModal('total_students')}
          />
          <KpiCard
            title="Data Pegawai & Guru"
            value={formatNumber(kpis.total_employees?.total)}
            icon={Building2}
            colorScheme="violet"
            badge="SDM"
            badgeVariant="purple"
            onClick={() => setActiveModal('total_employees')}
          />
          <KpiCard
            title="Kelas Aktif Terkelola"
            value={formatNumber(kpis.active_classes?.total)}
            icon={CheckCircle2}
            colorScheme="indigo"
            badge="Kelas"
            badgeVariant="success"
          />
        </div>
      </section>

      {/* Quick Action Bar */}
      <section className="rounded-[18px] border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-[#1B2433]">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">Aksi Cepat Admin Operations</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Pintas pemeliharaan master data dan konfigurasi aplikasi</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <AppButton variant="secondary" size="sm" icon={Database} onClick={() => navigate('/dashboard/students')}>
              Kelola Master Data
            </AppButton>
            <AppButton variant="secondary" size="sm" icon={Settings} onClick={() => navigate('/dashboard/pengaturan')}>
              Pengaturan Sistem
            </AppButton>
            <AppButton variant="secondary" size="sm" icon={ShieldCheck} onClick={() => navigate('/dashboard/hak-akses')}>
              Hak Akses & Role
            </AppButton>
            <AppButton variant="primary" size="sm" icon={Activity} onClick={() => navigate('/dashboard/notifications')}>
              Audit Notifikasi
            </AppButton>
          </div>
        </div>
      </section>

      {/* Data Density Chart & Audit Log Table */}
      <section className="space-y-3">
        <SectionHeader title="Volume Data & Log Audit Operator" subtitle="Visualisasi kepadatan record dan riwayat aktivitas pengubahan master data" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <ChartCard
            title="Volume Master Data Terdaftar"
            subtitle="Rincian entitas terkelola dalam database"
            empty={!charts.data_density || charts.data_density.length === 0}
          >
            <div className="h-64 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={charts.data_density || []}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                  <XAxis dataKey="name" stroke="#888888" fontSize={11} />
                  <YAxis stroke="#888888" fontSize={11} />
                  <Tooltip />
                  <Bar dataKey="total" fill="#0E5C44" radius={[6, 6, 0, 0]} name="Jumlah Record" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>

          <div className="lg:col-span-2">
            <AppDataTable
              title="Log Aktivitas & Audit Operator"
              description="Catatan riwayat pengubahan master data dan otorisasi sistem"
              data={tables.recent_activities || []}
              columns={auditColumns}
              keyField="timestamp"
              searchPlaceholder="Cari riwayat aktivitas..."
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
