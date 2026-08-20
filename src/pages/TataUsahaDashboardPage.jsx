import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Users,
  UserCheck,
  AlertTriangle,
  CheckCircle2,
  CalendarCheck,
  FileSpreadsheet,
  RefreshCw,
  CalendarDays,
  BookOpen,
  Building2,
} from 'lucide-react'
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts'

import {
  AppBreadcrumb,
  AppFilterBar,
  KpiCard,
  SectionHeader,
  PageContainer,
} from '../components/app'

import { SquircleActionButton } from '../components/master-data'
import ChartCard from '../components/dashboard/ChartCard'
import SkeletonDashboard from '../components/dashboard/SkeletonDashboard'
import ErrorState from '../components/dashboard/ErrorState'
import TataUsahaKpiModal from '../components/TataUsahaKpiModal'
import ModalErrorBoundary from '../components/common/ModalErrorBoundary'

import { managementDashboardService } from '../services/managementDashboardService'

const tooltipStyle = {
  backgroundColor: '#1E293B',
  border: 'none',
  borderRadius: '12px',
  color: '#FFF',
  fontSize: '12px',
}

function GenderPieChart({ data }) {
  const hasData = data.some((item) => Number(item.value) > 0)
  if (!hasData) return null

  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={data}
          dataKey="value"
          nameKey="name"
          cx="50%"
          cy="50%"
          innerRadius={52}
          outerRadius={78}
          paddingAngle={3}
        >
          {data.map((entry) => (
            <Cell key={entry.name} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip contentStyle={tooltipStyle} />
        <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
      </PieChart>
    </ResponsiveContainer>
  )
}

function ComparisonBarChart({ data }) {
  const hasData = data.some((item) => Number(item.value) > 0)
  if (!hasData) return null

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
        <XAxis dataKey="name" fontSize={10} interval={0} />
        <YAxis fontSize={10} allowDecimals={false} />
        <Tooltip contentStyle={tooltipStyle} />
        <Bar dataKey="value" radius={[6, 6, 0, 0]}>
          {data.map((entry) => (
            <Cell key={entry.name} fill={entry.color} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}

function KelengkapanPieChart({ data }) {
  const hasData = data.some((item) => Number(item.value) > 0)
  if (!hasData) return null

  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={data}
          dataKey="value"
          nameKey="name"
          cx="50%"
          cy="50%"
          outerRadius={78}
          paddingAngle={2}
        >
          {data.map((entry) => (
            <Cell key={entry.name} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip contentStyle={tooltipStyle} />
        <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
      </PieChart>
    </ResponsiveContainer>
  )
}

export default function TataUsahaDashboardPage() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [data, setData] = useState(null)
  const [activeModal, setActiveModal] = useState(null)

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
  const charts = data?.charts || {}
  const context = data?.context || {}

  const formatNumber = (num) => (num !== undefined && num !== null ? Number(num).toLocaleString('id-ID') : '0')

  const tahunAjaranLabel = context.tahun_ajaran
    ? `Tahun Ajaran ${context.tahun_ajaran.nama}`
    : 'Tahun Ajaran 2026/2027'
  const semesterLabel = context.semester
    ? `Semester ${context.semester.nama}`
    : 'Semester Ganjil'

  const chartHasData = (items = []) => items.some((item) => Number(item.value) > 0)

  return (
    <PageContainer maxW="7xl">
      <div className="space-y-6 pb-12">
        <AppBreadcrumb items={[{ label: 'Dashboard Tata Usaha' }]} />

        <AppFilterBar label="Filter Administrasi" onReset={fetchDashboard}>
          <span className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-bold text-slate-700 dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-200">
            <CalendarDays className="h-3.5 w-3.5 text-emerald-700 dark:text-emerald-400" />
            {tahunAjaranLabel}
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-bold text-slate-700 dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-200">
            <BookOpen className="h-3.5 w-3.5 text-emerald-700 dark:text-emerald-400" />
            {semesterLabel}
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-800 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-300">
            <Building2 className="h-3.5 w-3.5" />
            Scope: Administrasi Unit
          </span>
        </AppFilterBar>

        <section className="rounded-[18px] border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-[#1B2433]">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">Aksi Cepat Tata Usaha</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Pintas administrasi data siswa, pegawai, dan pelaporan
              </p>
            </div>

            <div className="flex items-center gap-2.5 flex-nowrap shrink-0 overflow-x-auto py-1">
              <SquircleActionButton
                variant="view"
                icon={Users}
                label="Kelola Master Siswa"
                onClick={() => navigate('/dashboard/students')}
              />
              <SquircleActionButton
                variant="import"
                icon={UserCheck}
                label="Kelola Master Pegawai"
                onClick={() => navigate('/dashboard/employees')}
              />
              <SquircleActionButton
                variant="primary"
                icon={CalendarCheck}
                label="Absensi Siswa"
                onClick={() => navigate('/dashboard/absensi-pembelajaran')}
              />
              <SquircleActionButton
                variant="primary"
                icon={CheckCircle2}
                label="Rekap Absensi Gerbang"
                onClick={() => navigate('/dashboard/rekap-absensi-gerbang')}
              />
              <SquircleActionButton
                variant="export"
                icon={FileSpreadsheet}
                label="Cetak Laporan Siswa"
                onClick={() => navigate('/dashboard/laporan-siswa')}
              />
              <SquircleActionButton
                variant="restore"
                icon={RefreshCw}
                label="Segarkan Data"
                onClick={fetchDashboard}
              />
            </div>
          </div>
        </section>

        <section className="space-y-3">
          <SectionHeader
            title="Metrik Administrasi & Kelengkapan Data"
            subtitle="Klik kartu untuk melihat rincian data dan perbandingan"
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <KpiCard
              title="Total Siswa Aktif"
              value={formatNumber(kpis.total_siswa?.total)}
              subtitle={`♂ ${formatNumber(kpis.total_siswa?.laki_laki)} · ♀ ${formatNumber(kpis.total_siswa?.perempuan)}`}
              icon={Users}
              colorScheme="emerald"
              badge="Siswa"
              badgeVariant="success"
              onClick={() => setActiveModal('total_siswa')}
            />
            <KpiCard
              title="Total Pegawai & Guru"
              value={formatNumber(kpis.total_pegawai?.total)}
              subtitle={`♂ ${formatNumber(kpis.total_pegawai?.laki_laki)} · ♀ ${formatNumber(kpis.total_pegawai?.perempuan)}`}
              icon={UserCheck}
              colorScheme="blue"
              badge="SDM"
              badgeVariant="info"
              onClick={() => setActiveModal('total_pegawai')}
            />
            <KpiCard
              title="Absensi Terverifikasi Hari Ini"
              value={formatNumber(kpis.absensi_hari_ini?.total)}
              subtitle={`Hadir ${formatNumber(kpis.absensi_hari_ini?.siswa_hadir)} · Belum ${formatNumber(kpis.absensi_hari_ini?.siswa_belum_absen)} · Pegawai ${formatNumber(kpis.absensi_hari_ini?.pegawai_hadir)}`}
              icon={CheckCircle2}
              colorScheme="emerald"
              badge="Presensi Gerbang"
              badgeVariant="success"
              onClick={() => setActiveModal('absensi_hari_ini')}
            />
            <KpiCard
              title="Siswa Belum Lengkap"
              value={formatNumber(kpis.siswa_incomplete?.total)}
              subtitle="NISN, Tgl Lahir, Wali Murid"
              icon={AlertTriangle}
              colorScheme="amber"
              badge="Perlu Diisi"
              badgeVariant="warning"
              onClick={() => setActiveModal('siswa_incomplete')}
            />
            <KpiCard
              title="Pegawai Belum Lengkap"
              value={formatNumber(kpis.pegawai_incomplete?.total)}
              subtitle="NIY atau NIK belum terisi"
              icon={AlertTriangle}
              colorScheme="rose"
              badge="Perlu Diisi"
              badgeVariant="danger"
              onClick={() => setActiveModal('pegawai_incomplete')}
            />
          </div>
        </section>

        {/* Grafik per metrik */}
        <section className="space-y-3">
          <SectionHeader
            title="Visualisasi Data Administrasi"
            subtitle="Grafik perbandingan jenis kelamin, absensi, dan kelengkapan profil"
          />
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            <ChartCard
              title="Distribusi Siswa Aktif"
              subtitle="Perbandingan jenis kelamin siswa"
              empty={!chartHasData(charts.siswa_gender)}
              action={
                <SquircleActionButton
                  variant="view"
                  icon={Users}
                  label="Lihat Detail Siswa"
                  onClick={() => setActiveModal('total_siswa')}
                />
              }
            >
              <div className="h-56 w-full pt-1">
                <GenderPieChart data={charts.siswa_gender || []} />
              </div>
            </ChartCard>

            <ChartCard
              title="Distribusi Pegawai & Guru"
              subtitle="Perbandingan jenis kelamin SDM"
              empty={!chartHasData(charts.pegawai_gender)}
              action={
                <SquircleActionButton
                  variant="import"
                  icon={UserCheck}
                  label="Lihat Detail Pegawai"
                  onClick={() => setActiveModal('total_pegawai')}
                />
              }
            >
              <div className="h-56 w-full pt-1">
                <GenderPieChart data={charts.pegawai_gender || []} />
              </div>
            </ChartCard>

            <ChartCard
              title="Absensi Gerbang Hari Ini"
              subtitle="Siswa hadir, belum absen, dan pegawai"
              empty={!chartHasData(charts.absensi_hari_ini)}
              action={
                <SquircleActionButton
                  variant="primary"
                  icon={CheckCircle2}
                  label="Lihat Detail Absensi"
                  onClick={() => setActiveModal('absensi_hari_ini')}
                />
              }
            >
              <div className="h-56 w-full pt-1">
                <ComparisonBarChart data={charts.absensi_hari_ini || []} />
              </div>
            </ChartCard>

            <ChartCard
              title="Kelengkapan Data Siswa"
              subtitle="Profil lengkap vs belum lengkap"
              empty={!chartHasData(charts.siswa_kelengkapan)}
              action={
                <SquircleActionButton
                  variant="edit"
                  icon={AlertTriangle}
                  label="Lihat Siswa Belum Lengkap"
                  onClick={() => setActiveModal('siswa_incomplete')}
                />
              }
            >
              <div className="h-56 w-full pt-1">
                <KelengkapanPieChart data={charts.siswa_kelengkapan || []} />
              </div>
            </ChartCard>

            <ChartCard
              title="Kelengkapan Data Pegawai"
              subtitle="NIY/NIK lengkap vs belum lengkap"
              empty={!chartHasData(charts.pegawai_kelengkapan)}
              action={
                <SquircleActionButton
                  variant="delete"
                  icon={AlertTriangle}
                  label="Lihat Pegawai Belum Lengkap"
                  onClick={() => setActiveModal('pegawai_incomplete')}
                />
              }
            >
              <div className="h-56 w-full pt-1">
                <KelengkapanPieChart data={charts.pegawai_kelengkapan || []} />
              </div>
            </ChartCard>
          </div>
        </section>

        <ModalErrorBoundary onClose={() => setActiveModal(null)}>
          <TataUsahaKpiModal
            type={activeModal}
            isOpen={Boolean(activeModal)}
            onClose={() => setActiveModal(null)}
          />
        </ModalErrorBoundary>
      </div>
    </PageContainer>
  )
}
