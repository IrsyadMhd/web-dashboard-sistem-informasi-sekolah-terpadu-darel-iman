import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Building2,
  Users,
  GraduationCap,
  FileCheck,
  AlertCircle,
  Award,
  FileSpreadsheet,
  BookOpen,
  Zap,
  LayoutGrid,
  CalendarCheck,
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
import DivisiPendidikanKpiModal from '../components/DivisiPendidikanKpiModal'

import { managementDashboardService } from '../services/managementDashboardService'

export default function DivisiPendidikanDashboardPage() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [data, setData] = useState(null)

  // State for KPI Pop-up Modal
  const [selectedKpiType, setSelectedKpiType] = useState(null)
  const [isKpiModalOpen, setIsKpiModalOpen] = useState(false)

  const handleKpiCardClick = (type) => {
    setSelectedKpiType(type)
    setIsKpiModalOpen(true)
  }

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

      {/* KPI Cards Grid (Interactive Pop-up Modal on Click) */}
      <section className="space-y-3">
        <SectionHeader title="Kinerja & Evaluasi Pelaporan Akademik" subtitle="Ringkasan pemantauan unit, kepegawaian, dan pelaporan bulanan (Klik kartu untuk melihat detail pop-up)" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <KpiCard
            title="Unit Dipantau"
            value={formatNumber(kpis.unit_monitored?.total)}
            icon={Building2}
            colorScheme="emerald"
            badge="15 Unit"
            badgeVariant="success"
            onClick={() => handleKpiCardClick('unit_monitored')}
            className="cursor-pointer transition-all duration-200 hover:shadow-md hover:scale-[1.01]"
          />
          <KpiCard
            title="Total Siswa Dipantau"
            value={formatNumber(kpis.total_siswa?.total)}
            icon={Users}
            colorScheme="blue"
            badge="Siswa"
            badgeVariant="info"
            onClick={() => handleKpiCardClick('total_siswa')}
            className="cursor-pointer transition-all duration-200 hover:shadow-md hover:scale-[1.01]"
          />
          <KpiCard
            title="Total Guru Pengajar"
            value={formatNumber(kpis.total_guru?.total)}
            icon={GraduationCap}
            colorScheme="violet"
            badge="Guru"
            badgeVariant="purple"
            onClick={() => handleKpiCardClick('total_guru')}
            className="cursor-pointer transition-all duration-200 hover:shadow-md hover:scale-[1.01]"
          />
          <KpiCard
            title="Laporan Bulanan Masuk"
            value={formatNumber(kpis.laporan_bulanan_masuk?.total)}
            icon={FileCheck}
            colorScheme="emerald"
            badge="Lengkap"
            badgeVariant="success"
            onClick={() => handleKpiCardClick('laporan_bulanan_masuk')}
            className="cursor-pointer transition-all duration-200 hover:shadow-md hover:scale-[1.01]"
          />
          <KpiCard
            title="Laporan Belum Masuk"
            value={formatNumber(kpis.laporan_bulanan_belum?.total)}
            icon={AlertCircle}
            colorScheme="rose"
            badge="Pending"
            badgeVariant="danger"
            onClick={() => handleKpiCardClick('laporan_bulanan_belum')}
            className="cursor-pointer transition-all duration-200 hover:shadow-md hover:scale-[1.01]"
          />
          <KpiCard
            title="Prestasi Siswa Terverifikasi"
            value={formatNumber(kpis.total_prestasi?.total)}
            icon={Award}
            colorScheme="amber"
            badge="Prestasi"
            badgeVariant="warning"
            onClick={() => handleKpiCardClick('total_prestasi')}
            className="cursor-pointer transition-all duration-200 hover:shadow-md hover:scale-[1.01]"
          />
        </div>
      </section>

      {/* Akses Cepat Divisi Pendidikan (With Detail Chips & Icon-Only Soft Pastel Squircles + Floating Hover Tooltips) */}
      <section className="rounded-[18px] border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-[#1B2433]">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-2">
            <div>
              <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">Akses Cepat Divisi Pendidikan</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Navigasi langsung ke modul kurikulum dan pengawasan akademik</p>
            </div>
            {/* Detail Chips (Tahun Ajaran, Semester, Scope) */}
            <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
              <AppBadge variant="success" size="sm">
                {context.tahun_ajaran ? `Tahun Ajaran ${context.tahun_ajaran.nama}` : 'Tahun Ajaran 2026/2027'}
              </AppBadge>
              <AppBadge variant="info" size="sm">
                {context.semester ? `Semester ${context.semester.nama}` : 'Semester Ganjil'}
              </AppBadge>
              <AppBadge variant="purple" size="sm">
                Scope: Pengawasan Akademik
              </AppBadge>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0 py-1">
            {/* Monitoring Kehadiran Siswa (Soft Cyan Squircle - Pure Icon Only with Floating Hover Tooltip) */}
            <div className="group relative inline-flex">
              <button
                type="button"
                title="Monitoring Kehadiran Siswa"
                aria-label="Monitoring Kehadiran Siswa"
                className="flex size-10 items-center justify-center rounded-2xl bg-cyan-100/90 text-cyan-600 hover:bg-cyan-600 hover:text-white dark:bg-cyan-950/60 dark:text-cyan-300 dark:hover:bg-cyan-600 dark:hover:text-white transition-colors duration-200 hover:shadow-md hover:shadow-cyan-600/30 cursor-pointer shadow-2xs"
                onClick={() => navigate('/dashboard/absensi-pembelajaran')}
              >
                <CalendarCheck className="size-5 transition-colors" />
              </button>
              <div className="pointer-events-none absolute top-full left-1/2 mt-2 -translate-x-1/2 opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 transition-all duration-200 ease-out z-50 whitespace-nowrap rounded-lg bg-slate-900 px-2.5 py-1 text-[11px] font-bold text-white shadow-xl dark:bg-slate-100 dark:text-slate-900">
                <div className="absolute bottom-full left-1/2 -mb-1 -translate-x-1/2 border-4 border-transparent border-b-slate-900 dark:border-b-slate-100" />
                Monitoring Kehadiran Siswa
              </div>
            </div>

            {/* Monitoring Non-Pesantren (Soft Sky Blue Squircle - Pure Icon Only with Floating Hover Tooltip & Popup Data Modal) */}
            <div className="group relative inline-flex">
              <button
                type="button"
                title="Monitoring Non-Pesantren"
                aria-label="Monitoring Non-Pesantren"
                className="flex size-10 items-center justify-center rounded-2xl bg-sky-100/90 text-sky-600 hover:bg-sky-500 hover:text-white dark:bg-sky-950/60 dark:text-sky-300 dark:hover:bg-sky-500 dark:hover:text-white transition-colors duration-200 hover:shadow-md hover:shadow-sky-500/30 cursor-pointer shadow-2xs"
                onClick={() => handleKpiCardClick('monitoring_non_pesantren')}
              >
                <BookOpen className="size-5 transition-colors" />
              </button>
              <div className="pointer-events-none absolute top-full left-1/2 mt-2 -translate-x-1/2 opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 transition-all duration-200 ease-out z-50 whitespace-nowrap rounded-lg bg-slate-900 px-2.5 py-1 text-[11px] font-bold text-white shadow-xl dark:bg-slate-100 dark:text-slate-900">
                <div className="absolute bottom-full left-1/2 -mb-1 -translate-x-1/2 border-4 border-transparent border-b-slate-900 dark:border-b-slate-100" />
                Monitoring Non-Pesantren
              </div>
            </div>

            {/* Input Monitoring Divisi (Soft Emerald Squircle - Pure Icon Only with Floating Hover Tooltip & Popup Data Modal) */}
            <div className="group relative inline-flex">
              <button
                type="button"
                title="Input Monitoring Divisi"
                aria-label="Input Monitoring Divisi"
                className="flex size-10 items-center justify-center rounded-2xl bg-emerald-100/90 text-emerald-600 hover:bg-emerald-600 hover:text-white dark:bg-emerald-950/60 dark:text-emerald-300 dark:hover:bg-emerald-600 dark:hover:text-white transition-colors duration-200 hover:shadow-md hover:shadow-emerald-600/30 cursor-pointer shadow-2xs"
                onClick={() => handleKpiCardClick('monitoring_divisi')}
              >
                <Zap className="size-5 transition-colors" />
              </button>
              <div className="pointer-events-none absolute top-full left-1/2 mt-2 -translate-x-1/2 opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 transition-all duration-200 ease-out z-50 whitespace-nowrap rounded-lg bg-slate-900 px-2.5 py-1 text-[11px] font-bold text-white shadow-xl dark:bg-slate-100 dark:text-slate-900">
                <div className="absolute bottom-full left-1/2 -mb-1 -translate-x-1/2 border-4 border-transparent border-b-slate-900 dark:border-b-slate-100" />
                Input Monitoring Divisi
              </div>
            </div>

            {/* Master Kurikulum (Soft Violet Squircle - Pure Icon Only with Floating Hover Tooltip & Popup Data Modal) */}
            <div className="group relative inline-flex">
              <button
                type="button"
                title="Master Kurikulum"
                aria-label="Master Kurikulum"
                className="flex size-10 items-center justify-center rounded-2xl bg-violet-100/90 text-violet-600 hover:bg-violet-600 hover:text-white dark:bg-violet-950/60 dark:text-violet-300 dark:hover:bg-violet-600 dark:hover:text-white transition-colors duration-200 hover:shadow-md hover:shadow-violet-600/30 cursor-pointer shadow-2xs"
                onClick={() => handleKpiCardClick('master_kurikulum')}
              >
                <LayoutGrid className="size-5 transition-colors" />
              </button>
              <div className="pointer-events-none absolute top-full left-1/2 mt-2 -translate-x-1/2 opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 transition-all duration-200 ease-out z-50 whitespace-nowrap rounded-lg bg-slate-900 px-2.5 py-1 text-[11px] font-bold text-white shadow-xl dark:bg-slate-100 dark:text-slate-900">
                <div className="absolute bottom-full left-1/2 -mb-1 -translate-x-1/2 border-4 border-transparent border-b-slate-900 dark:border-b-slate-100" />
                Master Kurikulum
              </div>
            </div>

            {/* Verifikasi Prestasi (Soft Amber Squircle - Pure Icon Only with Floating Hover Tooltip & Popup Data Modal) */}
            <div className="group relative inline-flex">
              <button
                type="button"
                title="Verifikasi Prestasi"
                aria-label="Verifikasi Prestasi"
                className="flex size-10 items-center justify-center rounded-2xl bg-amber-100/90 text-amber-600 hover:bg-amber-500 hover:text-white dark:bg-amber-950/60 dark:text-amber-300 dark:hover:bg-amber-500 dark:hover:text-white transition-colors duration-200 hover:shadow-md hover:shadow-amber-500/30 cursor-pointer shadow-2xs"
                onClick={() => handleKpiCardClick('verifikasi_prestasi')}
              >
                <Award className="size-5 transition-colors" />
              </button>
              <div className="pointer-events-none absolute top-full left-1/2 mt-2 -translate-x-1/2 opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 transition-all duration-200 ease-out z-50 whitespace-nowrap rounded-lg bg-slate-900 px-2.5 py-1 text-[11px] font-bold text-white shadow-xl dark:bg-slate-100 dark:text-slate-900">
                <div className="absolute bottom-full left-1/2 -mb-1 -translate-x-1/2 border-4 border-transparent border-b-slate-900 dark:border-b-slate-100" />
                Verifikasi Prestasi
              </div>
            </div>

            {/* Laporan Lintas Unit (Soft Pink Squircle - Pure Icon Only with Floating Hover Tooltip & Popup Data Modal) */}
            <div className="group relative inline-flex">
              <button
                type="button"
                title="Laporan Lintas Unit"
                aria-label="Laporan Lintas Unit"
                className="flex size-10 items-center justify-center rounded-2xl bg-pink-100/90 text-pink-600 hover:bg-pink-600 hover:text-white dark:bg-pink-950/60 dark:text-pink-300 dark:hover:bg-pink-600 dark:hover:text-white transition-colors duration-200 hover:shadow-md hover:shadow-pink-600/30 cursor-pointer shadow-2xs"
                onClick={() => handleKpiCardClick('laporan_lintas_unit')}
              >
                <FileSpreadsheet className="size-5 transition-colors" />
              </button>
              <div className="pointer-events-none absolute top-full left-1/2 mt-2 -translate-x-1/2 opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 transition-all duration-200 ease-out z-50 whitespace-nowrap rounded-lg bg-slate-900 px-2.5 py-1 text-[11px] font-bold text-white shadow-xl dark:bg-slate-100 dark:text-slate-900">
                <div className="absolute bottom-full left-1/2 -mb-1 -translate-x-1/2 border-4 border-transparent border-b-slate-900 dark:border-b-slate-100" />
                Laporan Lintas Unit
              </div>
            </div>

            {/* Laporan Akademik (Soft Rose Squircle - Pure Icon Only with Floating Hover Tooltip & Popup Data Modal) */}
            <div className="group relative inline-flex">
              <button
                type="button"
                title="Laporan Akademik"
                aria-label="Laporan Akademik"
                className="flex size-10 items-center justify-center rounded-2xl bg-rose-100/90 text-rose-600 hover:bg-rose-600 hover:text-white dark:bg-rose-950/60 dark:text-rose-300 dark:hover:bg-rose-600 dark:hover:text-white transition-colors duration-200 hover:shadow-md hover:shadow-rose-600/30 cursor-pointer shadow-2xs"
                onClick={() => handleKpiCardClick('laporan_akademik')}
              >
                <GraduationCap className="size-5 transition-colors" />
              </button>
              <div className="pointer-events-none absolute top-full left-1/2 mt-2 -translate-x-1/2 opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 transition-all duration-200 ease-out z-50 whitespace-nowrap rounded-lg bg-slate-900 px-2.5 py-1 text-[11px] font-bold text-white shadow-xl dark:bg-slate-100 dark:text-slate-900">
                <div className="absolute bottom-full left-1/2 -mb-1 -translate-x-1/2 border-4 border-transparent border-b-slate-900 dark:border-b-slate-100" />
                Laporan Akademik
              </div>
            </div>
          </div>
        </div>
      </section>


      {/* Rekapitulasi Prestasi Siswa Lintas Unit (Moved right below Akses Cepat) */}
      <StudentAchievementRecapSection
        achievements={tables.rekap_prestasi || []}
        title="Rekapitulasi Prestasi Siswa Lintas Unit"
        subtitle="Monitoring capaian Tahfizh Al-Qur’an, Santri Pesantren, Sepakbola/Olahraga, dan Lomba Pembelajaran seluruh unit dipantau"
        onRefresh={fetchDashboard}
      />

      {/* Chart Section: Terpisah Rasio SDM (Gender) & Rasio Siswa (Gender) */}
      <section className="space-y-3">
        <SectionHeader title="Rasio SDM & Kesiswaan (Perbandingan Gender)" subtitle="Analisis demografi jenis kelamin SDM/Pegawai dan Siswa lintas unit sekolah" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Chart 1: Rasio SDM (Pegawai & Guru) */}
          <ChartCard
            title="Rasio SDM (Pegawai & Guru) - Gender"
            subtitle="Perbandingan jumlah pegawai Laki-laki dan Perempuan per unit"
            empty={!charts.sdm_gender || charts.sdm_gender.length === 0}
          >
            <div className="h-72 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={charts.sdm_gender || []}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                  <XAxis dataKey="name" stroke="#888888" fontSize={11} />
                  <YAxis stroke="#888888" fontSize={11} />
                  <Tooltip />
                  <Bar dataKey="laki_laki" fill="#0E5C44" name="Laki-laki" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="perempuan" fill="#8B5CF6" name="Perempuan" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>

          {/* Chart 2: Rasio Siswa */}
          <ChartCard
            title="Rasio Kesiswaan (Siswa) - Gender"
            subtitle="Perbandingan jumlah siswa Laki-laki dan Perempuan per unit"
            empty={!charts.siswa_gender || charts.siswa_gender.length === 0}
          >
            <div className="h-72 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={charts.siswa_gender || []}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                  <XAxis dataKey="name" stroke="#888888" fontSize={11} />
                  <YAxis stroke="#888888" fontSize={11} />
                  <Tooltip />
                  <Bar dataKey="laki_laki" fill="#0EA5E9" name="Laki-laki" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="perempuan" fill="#F43F5E" name="Perempuan" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>
        </div>
      </section>

      {/* KPI Detail Pop-up Modal */}
      <DivisiPendidikanKpiModal
        type={selectedKpiType}
        isOpen={isKpiModalOpen}
        onClose={() => setIsKpiModalOpen(false)}
      />
    </div>
    </PageContainer>
  )
}

