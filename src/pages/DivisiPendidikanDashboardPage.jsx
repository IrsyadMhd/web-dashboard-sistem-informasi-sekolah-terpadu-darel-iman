import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Building2,
  Users,
  GraduationCap,
  FileCheck,
  AlertCircle,
  Award,
  RefreshCw,
  FileSpreadsheet,
  BookOpen,
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
  AppBadge,
  AppButton,
  SectionHeader,
  PageContainer,
} from '../components/app'

import ChartCard from '../components/dashboard/ChartCard'
import SkeletonDashboard from '../components/dashboard/SkeletonDashboard'
import ErrorState from '../components/dashboard/ErrorState'
import StudentAchievementRecapSection from '../components/dashboard/StudentAchievementRecapSection'

import { managementDashboardService } from '../services/managementDashboardService'

export default function DivisiPendidikanDashboardPage() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [data, setData] = useState(null)

  const fetchDashboard = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await managementDashboardService.getDivisiPendidikan()
      if (res && res.data) {
        setData(res.data)
      } else {
        setError('Format respon server tidak valid.')
      }
    } catch (err) {
      console.error('Failed to load Divisi Pendidikan dashboard:', err)
      setError(err.response?.data?.message || 'Gagal memuat data dashboard Divisi Pendidikan.')
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

  return (
    <PageContainer maxW="7xl">
      <div className="space-y-6 pb-12">
      {/* Breadcrumb Navigation */}
      <AppBreadcrumb items={[{ label: 'Dashboard Divisi Pendidikan' }]} />

      {/* Header */}
      <AppPageHeader
        variant="brand"
        title="Dashboard Divisi Pendidikan"
        eyebrow="Academic Oversight & Quality Assurance"
        description="Monitoring dan evaluasi kinerja akademik, rasio SDM, pelaporan bulanan, serta capaian kurikulum lintas unit."
        welcomeName="Pengawas Pendidikan"
        chips={[
          context.tahun_ajaran ? `Tahun Ajaran ${context.tahun_ajaran.nama}` : 'TBA 2026/2027',
          context.semester ? `Semester ${context.semester.nama}` : 'Semester Ganjil',
          'Scope: Pengawasan Akademik',
        ]}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <AppButton variant="accent" size="sm" icon={FileSpreadsheet} onClick={() => navigate('/dashboard/laporan-akademik')}>
              Laporan Akademik
            </AppButton>
            <AppButton variant="outline" size="sm" icon={RefreshCw} onClick={fetchDashboard} className="border-white/30 text-white hover:bg-white/10">
              Segarkan Data
            </AppButton>
          </div>
        }
      />

      {/* Filter Bar */}
      <AppFilterBar label="Filter Pengawasan" onReset={fetchDashboard} />

      {/* KPI Cards Grid */}
      <section className="space-y-3">
        <SectionHeader title="Kinerja & Evaluasi Pelaporan Akademik" subtitle="Ringkasan pemantauan unit, kepegawaian, dan pelaporan bulanan" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <KpiCard
            title="Unit Dipantau"
            value={formatNumber(kpis.unit_monitored?.total)}
            icon={Building2}
            colorScheme="emerald"
            badge="15 Unit"
            badgeVariant="success"
          />
          <KpiCard
            title="Total Siswa Dipantau"
            value={formatNumber(kpis.total_siswa?.total)}
            icon={Users}
            colorScheme="blue"
            badge="Siswa"
            badgeVariant="info"
          />
          <KpiCard
            title="Total Guru Pengajar"
            value={formatNumber(kpis.total_guru?.total)}
            icon={GraduationCap}
            colorScheme="violet"
            badge="Guru"
            badgeVariant="purple"
          />
          <KpiCard
            title="Laporan Bulanan Masuk"
            value={formatNumber(kpis.laporan_bulanan_masuk?.total)}
            icon={FileCheck}
            colorScheme="emerald"
            badge="Lengkap"
            badgeVariant="success"
          />
          <KpiCard
            title="Laporan Belum Masuk"
            value={formatNumber(kpis.laporan_bulanan_belum?.total)}
            icon={AlertCircle}
            colorScheme="rose"
            badge="Pending"
            badgeVariant="danger"
          />
          <KpiCard
            title="Prestasi Siswa Terverifikasi"
            value={formatNumber(kpis.total_prestasi?.total)}
            icon={Award}
            colorScheme="amber"
            badge="Prestasi"
            badgeVariant="warning"
          />
        </div>
      </section>

      {/* Quick Actions */}
      <section className="rounded-[18px] border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-[#1B2433]">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">Akses Cepat Divisi Pendidikan</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Navigasi langsung ke modul kurikulum dan pengawasan akademik</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <AppButton variant="secondary" size="sm" icon={BookOpen} onClick={() => navigate('/dashboard/monitoring-tahfizh-ibadah-non-pesantren')}>
              Monitoring Non-Pesantren
            </AppButton>
            <AppButton variant="secondary" size="sm" icon={FileSpreadsheet} onClick={() => navigate('/dashboard/monitoring-divisi')}>
              Input Monitoring Divisi
            </AppButton>
            <AppButton variant="secondary" size="sm" icon={BookOpen} onClick={() => navigate('/dashboard/master/kurikulum')}>
              Master Kurikulum
            </AppButton>
            <AppButton variant="secondary" size="sm" icon={Award} onClick={() => navigate('/dashboard/laporan-siswa')}>
              Verifikasi Prestasi
            </AppButton>
            <AppButton variant="primary" size="sm" icon={FileSpreadsheet} onClick={() => navigate('/dashboard/laporan-akademik')}>
              Laporan Lintas Unit
            </AppButton>
          </div>
        </div>
      </section>

      {/* Chart Section */}
      <section className="space-y-3">
        <SectionHeader title="Rasio SDM & Perbandingan Kesiswaan" subtitle="Grafik perbandingan jumlah siswa dan pegawai antar unit sekolah" />
        <ChartCard
          title="Perbandingan Jumlah Siswa & Pegawai antar Unit"
          subtitle="Analisis ketersediaan SDM dan rasio kecukupan pengajar"
          empty={!charts.unit_comparison || charts.unit_comparison.length === 0}
        >
          <div className="h-72 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={charts.unit_comparison || []}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis dataKey="name" stroke="#888888" fontSize={11} />
                <YAxis stroke="#888888" fontSize={11} />
                <Tooltip />
                <Bar dataKey="siswa" fill="#0E5C44" name="Siswa" radius={[6, 6, 0, 0]} />
                <Bar dataKey="pegawai" fill="#3FBF75" name="Pegawai" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>
      </section>

      {/* Rekapitulasi Prestasi Siswa Lintas Unit (Data Riil Database) */}
      <StudentAchievementRecapSection
        achievements={tables.rekap_prestasi || []}
        title="Rekapitulasi Prestasi Siswa Lintas Unit"
        subtitle="Monitoring capaian Tahfizh Al-Qur’an, Santri Pesantren, Sepakbola/Olahraga, dan Lomba Pembelajaran seluruh unit dipantau"
        onRefresh={fetchDashboard}
      />
    </div>
    </PageContainer>
  )
}
