import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Users,
  UserCheck,
  AlertTriangle,
  CheckCircle2,
  FileSpreadsheet,
  RefreshCw,
  Database,
  Building2,
} from 'lucide-react'

import {
  AppPageHeader,
  AppBreadcrumb,
  AppFilterBar,
  KpiCard,
  SummaryCard,
  AppBadge,
  AppButton,
  SectionHeader,
  PageContainer,
} from '../components/app'

import SkeletonDashboard from '../components/dashboard/SkeletonDashboard'
import ErrorState from '../components/dashboard/ErrorState'

import { managementDashboardService } from '../services/managementDashboardService'

export default function TataUsahaDashboardPage() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [data, setData] = useState(null)

  const fetchDashboard = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await managementDashboardService.getTataUsaha()
      if (res && res.data) {
        setData(res.data)
      } else {
        setError('Format respon server tidak valid.')
      }
    } catch (err) {
      console.error('Failed to load Tata Usaha dashboard:', err)
      setError(err.response?.data?.message || 'Gagal memuat data dashboard Tata Usaha.')
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

  const formatNumber = (num) => (num !== undefined && num !== null ? Number(num).toLocaleString('id-ID') : '0')

  return (
    <PageContainer maxW="7xl">
      <div className="space-y-6 pb-12">
      {/* Breadcrumb Navigation */}
      <AppBreadcrumb items={[{ label: 'Dashboard Tata Usaha' }]} />

      {/* Header */}
      <AppPageHeader
        variant="brand"
        title="Dashboard Tata Usaha (TU)"
        eyebrow="Operational Administration & Record Management"
        description="Kelola administrasi data kesiswaan, kepegawaian, verifikasi presensi gerbang, dan audit kelengkapan profil sekolah."
        welcomeName="Staf Tata Usaha"
        chips={[
          context.tahun_ajaran ? `Tahun Ajaran ${context.tahun_ajaran.nama}` : 'TBA 2026/2027',
          context.semester ? `Semester ${context.semester.nama}` : 'Semester Ganjil',
          'Scope: Administrasi Unit',
        ]}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <AppButton variant="accent" size="sm" icon={FileSpreadsheet} onClick={() => navigate('/dashboard/laporan-siswa')}>
              Cetak Laporan
            </AppButton>
            <AppButton variant="outline" size="sm" icon={RefreshCw} onClick={fetchDashboard} className="border-white/30 text-white hover:bg-white/10">
              Segarkan Data
            </AppButton>
          </div>
        }
      />

      {/* Filter Bar */}
      <AppFilterBar label="Filter Administrasi" onReset={fetchDashboard} />

      {/* KPI Cards Grid */}
      <section className="space-y-3">
        <SectionHeader title="Metrik Administrasi & Kelengkapan Data" subtitle="Total entitas kesiswaan, kepegawaian, dan verifikasi profil" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <KpiCard
            title="Total Siswa Aktif"
            value={formatNumber(kpis.total_siswa?.total)}
            icon={Users}
            colorScheme="emerald"
            badge="Siswa"
            badgeVariant="success"
          />
          <KpiCard
            title="Total Pegawai & Guru"
            value={formatNumber(kpis.total_pegawai?.total)}
            icon={UserCheck}
            colorScheme="blue"
            badge="SDM"
            badgeVariant="info"
          />
          <KpiCard
            title="Absensi Terverifikasi Hari Ini"
            value={formatNumber(kpis.absensi_hari_ini?.total)}
            icon={CheckCircle2}
            colorScheme="emerald"
            badge="Presensi Gerbang"
            badgeVariant="success"
          />
          <KpiCard
            title="Siswa Belum Lengkap"
            value={formatNumber(kpis.siswa_incomplete?.total)}
            subtitle="NISN, Tgl Lahir, Wali Murid"
            icon={AlertTriangle}
            colorScheme="amber"
            badge="Perlu Diisi"
            badgeVariant="warning"
          />
          <KpiCard
            title="Pegawai Belum Lengkap"
            value={formatNumber(kpis.pegawai_incomplete?.total)}
            subtitle="NIY atau NIK belum terisi"
            icon={AlertTriangle}
            colorScheme="rose"
            badge="Perlu Diisi"
            badgeVariant="danger"
          />
        </div>
      </section>

      {/* Quick Action Navigation */}
      <section className="rounded-[18px] border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-[#1B2433]">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">Aksi Cepat Tata Usaha</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Pintas administrasi data siswa, pegawai, dan pelaporan</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <AppButton variant="secondary" size="sm" icon={Users} onClick={() => navigate('/dashboard/students')}>
              Kelola Master Siswa
            </AppButton>
            <AppButton variant="secondary" size="sm" icon={UserCheck} onClick={() => navigate('/dashboard/employees')}>
              Kelola Master Pegawai
            </AppButton>
            <AppButton variant="secondary" size="sm" icon={CheckCircle2} onClick={() => navigate('/dashboard/rekap-absensi-gerbang')}>
              Rekap Absensi Gerbang
            </AppButton>
            <AppButton variant="primary" size="sm" icon={FileSpreadsheet} onClick={() => navigate('/dashboard/laporan-siswa')}>
              Cetak Laporan Siswa
            </AppButton>
          </div>
        </div>
      </section>
    </div>
    </PageContainer>
  )
}
