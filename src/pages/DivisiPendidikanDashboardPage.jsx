import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
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
  ShieldCheck,
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

const containerVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, staggerChildren: 0.08 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.25 } },
}

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
      <motion.div initial="hidden" animate="visible" variants={containerVariants} className="space-y-6 pb-12">
        {/* Breadcrumb Navigation */}
        <motion.div variants={itemVariants} className="print:hidden">
          <AppBreadcrumb items={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Divisi Pendidikan' }]} />
        </motion.div>

        {/* Header Halaman Modern Hero Card */}
        <motion.div variants={itemVariants} className="relative overflow-hidden rounded-[22px] border-2 border-emerald-500/30 bg-gradient-to-r from-emerald-500/15 via-teal-500/10 to-emerald-600/15 p-5 sm:p-6 shadow-md shadow-emerald-500/10 dark:border-emerald-600/40 dark:bg-gradient-to-r dark:from-emerald-950/70 dark:via-teal-950/50 dark:to-slate-900 print:hidden">
          {/* Ambient Glow Background Accent (Vibrant Dual Emerald-Teal Blobs) */}
          <div className="pointer-events-none absolute -top-20 -right-20 h-56 w-56 rounded-full bg-gradient-to-br from-emerald-500/40 via-teal-400/30 to-emerald-600/20 blur-3xl dark:from-emerald-500/50 dark:via-teal-400/40" />
          <div className="pointer-events-none absolute -bottom-20 -left-20 h-56 w-56 rounded-full bg-gradient-to-tr from-emerald-600/30 via-teal-500/20 to-transparent blur-3xl dark:from-emerald-600/40 dark:via-teal-500/30" />

          <div className="relative z-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-4 min-w-0">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700 text-white shadow-xl shadow-emerald-600/40 border border-emerald-300/40 dark:from-emerald-400 dark:via-emerald-500 dark:to-teal-600">
                <GraduationCap className="h-6 w-6" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                    Dashboard Divisi Pendidikan
                  </h1>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-emerald-600 to-teal-600 px-3.5 py-1 text-xs font-extrabold text-white shadow-sm shadow-emerald-600/25 border border-emerald-300/40">
                    <ShieldCheck className="h-3.5 w-3.5" />
                    Pengawasan Akademik SIT
                  </span>
                </div>
                <p className="mt-1 text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300 max-w-2xl leading-relaxed">
                  Pusat analisis kinerja kurikulum, pemantauan unit pendidikan, rasio SDM/Siswa, dan pengawasan pelaporan akademik terpadu.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
              <div className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-500/40 bg-gradient-to-r from-emerald-100 via-emerald-50 to-teal-100 px-3.5 py-1.5 text-xs font-black text-emerald-900 dark:border-emerald-700 dark:bg-gradient-to-r dark:from-emerald-950 dark:to-teal-950 dark:text-emerald-200 shadow-2xs">
                <Zap className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>Direktorat Pendidikan</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* KPI Cards Grid (Interactive Pop-up Modal on Click) */}
        <motion.section variants={itemVariants} className="space-y-3">
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
        </motion.section>

        {/* Akses Cepat Divisi Pendidikan */}
        <motion.section variants={itemVariants} className="rounded-[18px] border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-[#1B2433]">
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
              {/* Monitoring Kehadiran Siswa */}
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

              {/* Monitoring Non-Pesantren */}
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

              {/* Input Monitoring Divisi */}
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

              {/* Master Kurikulum */}
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

              {/* Verifikasi Prestasi */}
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

              {/* Laporan Lintas Unit */}
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

              {/* Laporan Akademik */}
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
        </motion.section>

        {/* Rekapitulasi Prestasi Siswa Lintas Unit */}
        <motion.div variants={itemVariants}>
          <StudentAchievementRecapSection
            achievements={tables.rekap_prestasi || []}
            title="Rekapitulasi Prestasi Siswa Lintas Unit"
            subtitle="Monitoring capaian Tahfizh Al-Qur’an, Santri Pesantren, Sepakbola/Olahraga, dan Lomba Pembelajaran seluruh unit dipantau"
            onRefresh={fetchDashboard}
          />
        </motion.div>

        {/* Chart Section */}
        <motion.section variants={itemVariants} className="space-y-3">
          <SectionHeader title="Rasio SDM & Kesiswaan (Perbandingan Gender)" subtitle="Analisis demografi jenis kelamin SDM/Pegawai dan Siswa lintas unit sekolah" />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Chart 1: Rasio SDM */}
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
        </motion.section>

        {/* KPI Detail Pop-up Modal */}
        <DivisiPendidikanKpiModal
          type={selectedKpiType}
          isOpen={isKpiModalOpen}
          onClose={() => setIsKpiModalOpen(false)}
        />
      </motion.div>
    </PageContainer>
  )
}
