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
  Eye,
  Target,
  Clock,
  Users,
  ChevronRight,
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
  AppBreadcrumb,
  AppDataTable,
  AppBadge,
  PageContainer,
} from '../components/app'

import ChartCard from '../components/dashboard/ChartCard'
import SkeletonDashboard from '../components/dashboard/SkeletonDashboard'
import ErrorState from '../components/dashboard/ErrorState'
import KpiQuickViewModal from '../components/KpiQuickViewModal'
import ModalErrorBoundary from '../components/common/ModalErrorBoundary'
import {
  SquircleActionButton,
} from '../components/master-data'
import TahfizhSubNav from '../components/tahfizh/TahfizhSubNav'
import SetoranStatusModal from '../components/tahfizh/SetoranStatusModal'

import { managementDashboardService } from '../services/managementDashboardService'

const COLORS = ['#0E5C44', '#EF4444']

// ── MODERN CARD TONES (TailGrids Emerald Multi-Tone System) ──
const MODERN_CARD_TONES = {
  emerald: {
    card: 'border-emerald-300/70 bg-gradient-to-br from-emerald-50 via-teal-50/60 to-white hover:border-emerald-400 dark:border-emerald-700/50 dark:from-emerald-950/40 dark:via-teal-950/20 dark:to-slate-900',
    glow: 'bg-emerald-400/20 group-hover:bg-emerald-400/30',
    iconBox: 'bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-sm shadow-emerald-500/30',
    tag: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/60 dark:text-emerald-300',
    title: 'text-emerald-700 dark:text-emerald-400',
    val: 'text-emerald-700 dark:text-emerald-300',
    sub: 'text-emerald-600/80 dark:text-emerald-400/80',
    cta: 'text-emerald-600/60 dark:text-emerald-500/60',
  },
  blue: {
    card: 'border-blue-300/70 bg-gradient-to-br from-blue-50 via-cyan-50/60 to-white hover:border-blue-400 dark:border-blue-700/50 dark:from-blue-950/40 dark:via-cyan-950/20 dark:to-slate-900',
    glow: 'bg-blue-400/20 group-hover:bg-blue-400/30',
    iconBox: 'bg-gradient-to-br from-blue-500 to-cyan-600 text-white shadow-sm shadow-blue-500/30',
    tag: 'bg-blue-100 text-blue-700 dark:bg-blue-900/60 dark:text-blue-300',
    title: 'text-blue-700 dark:text-blue-400',
    val: 'text-blue-700 dark:text-blue-300',
    sub: 'text-blue-600/80 dark:text-blue-400/80',
    cta: 'text-blue-600/60 dark:text-blue-500/60',
  },
  purple: {
    card: 'border-purple-300/70 bg-gradient-to-br from-purple-50 via-indigo-50/60 to-white hover:border-purple-400 dark:border-purple-700/50 dark:from-purple-950/40 dark:via-indigo-950/20 dark:to-slate-900',
    glow: 'bg-purple-400/20 group-hover:bg-purple-400/30',
    iconBox: 'bg-gradient-to-br from-purple-500 to-indigo-600 text-white shadow-sm shadow-purple-500/30',
    tag: 'bg-purple-100 text-purple-700 dark:bg-purple-900/60 dark:text-purple-300',
    title: 'text-purple-700 dark:text-purple-400',
    val: 'text-purple-700 dark:text-purple-300',
    sub: 'text-purple-600/80 dark:text-purple-400/80',
    cta: 'text-purple-600/60 dark:text-purple-500/60',
  },
  rose: {
    card: 'border-rose-300/70 bg-gradient-to-br from-rose-50 via-pink-50/60 to-white hover:border-rose-400 dark:border-rose-700/50 dark:from-rose-950/40 dark:via-pink-950/20 dark:to-slate-900',
    glow: 'bg-rose-400/20 group-hover:bg-rose-400/30',
    iconBox: 'bg-gradient-to-br from-rose-500 to-pink-600 text-white shadow-sm shadow-rose-500/30',
    tag: 'bg-rose-100 text-rose-700 dark:bg-rose-900/60 dark:text-rose-300',
    title: 'text-rose-700 dark:text-rose-400',
    val: 'text-rose-700 dark:text-rose-300',
    sub: 'text-rose-600/80 dark:text-rose-400/80',
    cta: 'text-rose-600/60 dark:text-rose-500/60',
  },
  amber: {
    card: 'border-amber-300/70 bg-gradient-to-br from-amber-50 via-orange-50/60 to-white hover:border-amber-400 dark:border-amber-700/50 dark:from-amber-950/40 dark:via-orange-950/20 dark:to-slate-900',
    glow: 'bg-amber-400/20 group-hover:bg-amber-400/30',
    iconBox: 'bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-sm shadow-amber-500/30',
    tag: 'bg-amber-100 text-amber-700 dark:bg-amber-900/60 dark:text-amber-300',
    title: 'text-amber-700 dark:text-amber-400',
    val: 'text-amber-700 dark:text-amber-300',
    sub: 'text-amber-600/80 dark:text-amber-400/80',
    cta: 'text-amber-600/60 dark:text-amber-500/60',
  },
}

function ModernKpiCard({ title, label, value, subtext, description, icon: Icon, tone = 'emerald', tag, onClick }) {
  const t = MODERN_CARD_TONES[tone] || MODERN_CARD_TONES.emerald
  const isClickable = typeof onClick === 'function'

  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      onClick={onClick}
      role={isClickable ? 'button' : undefined}
      tabIndex={isClickable ? 0 : undefined}
      className={`group relative overflow-hidden rounded-[18px] border-2 p-4 sm:p-5 shadow-xs transition-[border-color,box-shadow] duration-150 text-left ${
        isClickable ? 'cursor-pointer hover:shadow-md' : 'cursor-default'
      } ${t.card}`}
    >
      <div className={`pointer-events-none absolute -top-8 -right-8 h-28 w-28 rounded-full blur-2xl transition-all ${t.glow}`} />
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2.5">
          <div className={`flex h-9 w-9 items-center justify-center rounded-xl text-white shadow-sm ${t.iconBox}`}>
            <Icon className="h-4.5 w-4.5" />
          </div>
          <div>
            <p className={`text-xs font-bold ${t.title}`}>{label || title}</p>
          </div>
        </div>
        {tag && (
          <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-extrabold ${t.tag}`}>
            {tag}
          </span>
        )}
      </div>
      <p className={`text-2xl sm:text-3xl font-black tabular-nums tracking-tight ${t.val}`}>{value ?? 0}</p>
      {(subtext || description) && (
        <p className={`mt-1.5 text-xs font-semibold ${t.sub} truncate`}>
          {subtext || description}
        </p>
      )}
      {isClickable && (
        <p className={`mt-2.5 text-[10px] font-bold flex items-center gap-1 ${t.cta}`}>
          <Eye className="h-3 w-3" /> Klik untuk rincian
        </p>
      )}
    </motion.div>
  )
}

export default function GuruTahfizhDashboardPage() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [data, setData] = useState(null)
  const [activeModal, setActiveModal] = useState(null)
  const [setoranModalOpen, setSetoranModalOpen] = useState(false)
  const [setoranModalTab, setSetoranModalTab] = useState('sudah')

  const handleOpenSetoranModal = (tab = 'sudah') => {
    setSetoranModalTab(tab)
    setSetoranModalOpen(true)
  }

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

  const setoranDetails = charts?.setoran_details || {}
  const sudahList = setoranDetails?.sudah_setor || []
  const belumList = setoranDetails?.belum_setor || []
  const totalBinaan = setoranDetails?.total_binaan || kpis?.total_siswa_binaan?.total || (sudahList.length + belumList.length)
  const sudahCount = setoranDetails?.sudah_count ?? kpis?.siswa_sudah_setor?.total ?? sudahList.length
  const belumCount = setoranDetails?.belum_count ?? kpis?.siswa_belum_setor?.total ?? belumList.length
  const persentaseSelesai = setoranDetails?.persentase_selesai ?? (totalBinaan > 0 ? Math.round((sudahCount / totalBinaan) * 100) : 0)

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
        <div className="mb-4 print:hidden">
          <AppBreadcrumb items={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Dashboard Guru Tahfizh' }]} />
        </div>

        {/* MODERN HERO CARD HEADER (TailGrids Vivid Emerald Spec) */}
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
                    Monitor setoran hafalan Al-Qur'an, murajaah harian, dan capaian target santri/siswa binaan secara terpadu.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0 self-start sm:self-center">
                <SquircleActionButton
                  variant="primary"
                  icon={Plus}
                  label="Input Setoran"
                  onClick={() => navigate('/portal-guru/workspace?tab=tahfizh')}
                />
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

        {/* Tahfizh Sub-Navigation (5 tab modul terpadu) */}
        <TahfizhSubNav />

        {/* Primary KPI Grid (Modern Multi-Tone KPI Cards) */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm sm:text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                <Target className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                Metrik Setoran &amp; Capaian Hafalan
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Ringkasan santri binaan, setoran hari ini, dan progres murajaah</p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
            <ModernKpiCard
              label="Siswa Binaan"
              value={formatNumber(kpis.total_siswa_binaan?.total)}
              description="Total santri binaan halaqah"
              icon={BookOpen}
              tone="blue"
              tag="Halaqah"
              onClick={() => setActiveModal('total_siswa_binaan')}
            />
            <ModernKpiCard
              label="Setoran Hari Ini"
              value={formatNumber(kpis.setoran_hari_ini?.total)}
              description="Total setoran tercatat hari ini"
              icon={CheckCircle2}
              tone="emerald"
              tag="Tercatat"
            />
            <ModernKpiCard
              label="Siswa Sudah Setor"
              value={formatNumber(kpis.siswa_sudah_setor?.total)}
              description="Santri yang telah menyetor"
              icon={Award}
              tone="purple"
              tag="Tuntas"
            />
            <ModernKpiCard
              label="Siswa Belum Setor"
              value={formatNumber(kpis.siswa_belum_setor?.total)}
              description="Perlu ditindaklanjuti & dimotivasi"
              icon={UserX}
              tone="rose"
              tag="Follow Up"
            />
          </div>
        </section>

        {/* Secondary Volume KPIs */}
        <section className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">
            <ModernKpiCard
              label="Total Baris Setoran Hafalan"
              value={formatNumber(kpis.total_setoran_baris?.total)}
              description="Total baris hafalan baru tervalidasi"
              icon={Layers}
              tone="emerald"
              tag="Ziyadah"
            />
            <ModernKpiCard
              label="Total Murajaah (Lembar)"
              value={formatNumber(kpis.total_murajaah_lembar?.total)}
              description="Total lembar pengulangan hafalan mutqin"
              icon={BookOpen}
              tone="amber"
              tag="Murajaah"
            />
          </div>
        </section>

        {/* Quick Action Navigation (§K + Soft Squircle Action Buttons) */}
        <section className="relative overflow-hidden rounded-[22px] border-2 border-emerald-300/80 bg-gradient-to-r from-emerald-50/50 via-teal-50/30 to-emerald-50/50 p-5 sm:p-6 shadow-md shadow-emerald-500/10 dark:border-emerald-700/80 dark:bg-[#1B2433]">
          <div className="pointer-events-none absolute -top-10 -right-10 h-32 w-32 rounded-full bg-emerald-400/10 blur-2xl dark:bg-emerald-400/15" />
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex size-11 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700 text-white shrink-0 shadow-md shadow-emerald-600/30 border border-emerald-300/40">
                <FileText className="size-5.5 text-white" />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-black text-slate-900 dark:text-white">Aksi Cepat Guru Tahfizh</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Pintas input setoran hafalan, monitoring target, dan rekap harian</p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2 shrink-0">
              <SquircleActionButton
                variant="primary"
                icon={Plus}
                label="Input Setoran"
                onClick={() => navigate('/portal-guru/workspace?tab=tahfizh')}
              />
              <SquircleActionButton
                variant="view"
                icon={BookOpen}
                label="Monitoring Target"
                onClick={() => navigate('/portal-guru/workspace?tab=tahfizh')}
              />
              <SquircleActionButton
                variant="export"
                icon={FileText}
                label="Rekap Harian"
                onClick={() => navigate('/portal-guru/workspace?tab=tahfizh')}
              />
            </div>
          </div>
        </section>

        {/* Setoran Status Rich Card & Log Table */}
        <section className="space-y-3">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
            {/* RICH STATUS SETORAN HARI INI CARD */}
            <div className="lg:col-span-5 relative overflow-hidden rounded-[22px] border-2 border-emerald-300/80 bg-white p-5 sm:p-6 shadow-md shadow-emerald-500/10 dark:border-emerald-700/80 dark:bg-[#1B2433] flex flex-col justify-between">
              <div>
                {/* Header Card */}
                <div className="flex items-start justify-between gap-3 mb-3.5">
                  <div className="flex items-center gap-2.5">
                    <div className="flex size-9 sm:size-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-sm shadow-emerald-500/30">
                      <Clock className="size-4.5 sm:size-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-sm sm:text-base font-black text-slate-900 dark:text-white">
                        Status Setoran Hari Ini
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        Perbandingan santri sudah vs belum setor
                      </p>
                    </div>
                  </div>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-300/70 px-2.5 py-0.5 text-[11px] font-extrabold shrink-0">
                    <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    {persentaseSelesai}% Tuntas
                  </span>
                </div>

                {/* Progress Bar Capaian */}
                <div className="mb-3.5 p-3 rounded-2xl bg-gradient-to-r from-emerald-50/70 via-teal-50/40 to-emerald-50/70 dark:from-emerald-950/40 dark:via-teal-950/20 dark:to-[#151D2A] border border-emerald-200/80 dark:border-emerald-800/60">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    <span className="flex items-center gap-1.5 text-slate-800 dark:text-slate-200">
                      <Sparkles className="size-3 text-amber-500" />
                      Capaian Halaqah Hari Ini
                    </span>
                    <span className="text-emerald-700 dark:text-emerald-300 font-extrabold">
                      {sudahCount} / {totalBinaan} Santri ({persentaseSelesai}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-200/80 dark:bg-slate-800 rounded-full h-2.5 overflow-hidden p-0.5">
                    <div
                      className="bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-600 h-full rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(100, Math.max(0, persentaseSelesai))}%` }}
                    />
                  </div>
                </div>

                {/* Dual Interactive Status Tiles */}
                <div className="grid grid-cols-2 gap-2.5 mb-3.5">
                  <div
                    onClick={() => handleOpenSetoranModal('sudah')}
                    role="button"
                    tabIndex={0}
                    className="group relative overflow-hidden rounded-2xl border-2 border-emerald-300/80 bg-gradient-to-br from-emerald-50/80 via-teal-50/50 to-white dark:border-emerald-700/80 dark:bg-gradient-to-br dark:from-emerald-950/40 dark:via-teal-950/20 dark:to-[#151D2A] p-3 cursor-pointer hover:border-emerald-500 dark:hover:border-emerald-500 transition-all hover:shadow-sm"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="inline-flex size-6.5 items-center justify-center rounded-lg bg-emerald-600 text-white shadow-xs">
                        <CheckCircle2 className="size-3.5" />
                      </span>
                      <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 group-hover:underline flex items-center gap-0.5">
                        Rincian <ChevronRight className="size-3" />
                      </span>
                    </div>
                    <div className="text-xl sm:text-2xl font-black text-emerald-800 dark:text-emerald-200">
                      {sudahCount}
                    </div>
                    <div className="text-[11px] font-bold text-emerald-700/90 dark:text-emerald-400/90">
                      Santri Sudah Setor
                    </div>
                  </div>

                  <div
                    onClick={() => handleOpenSetoranModal('belum')}
                    role="button"
                    tabIndex={0}
                    className="group relative overflow-hidden rounded-2xl border-2 border-amber-300/80 bg-gradient-to-br from-amber-50/80 via-orange-50/50 to-white dark:border-amber-700/80 dark:bg-gradient-to-br dark:from-amber-950/40 dark:via-orange-950/20 dark:to-[#151D2A] p-3 cursor-pointer hover:border-amber-500 dark:hover:border-amber-500 transition-all hover:shadow-sm"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="inline-flex size-6.5 items-center justify-center rounded-lg bg-amber-600 text-white shadow-xs">
                        <UserX className="size-3.5" />
                      </span>
                      <span className="text-[10px] font-bold text-amber-700 dark:text-amber-400 group-hover:underline flex items-center gap-0.5">
                        Rincian <ChevronRight className="size-3" />
                      </span>
                    </div>
                    <div className="text-xl sm:text-2xl font-black text-amber-800 dark:text-amber-200">
                      {belumCount}
                    </div>
                    <div className="text-[11px] font-bold text-amber-700/90 dark:text-amber-400/90">
                      Santri Belum Setor
                    </div>
                  </div>
                </div>

                {/* Donut Chart Visual */}
                <div className="h-40 w-full my-1">
                  {(!charts.setoran_summary || charts.setoran_summary.length === 0 || totalBinaan === 0) ? (
                    <div className="h-full flex items-center justify-center text-xs text-slate-400">
                      Belum ada data setoran hari ini
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={charts.setoran_summary || []}
                          cx="50%"
                          cy="50%"
                          innerRadius={46}
                          outerRadius={68}
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
                  )}
                </div>

                {/* Mini Preview: Santri Baru Setor Hari Ini */}
                <div className="mt-3 pt-3 border-t border-emerald-100/90 dark:border-emerald-900/60">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                      <Sparkles className="size-3.5 text-amber-500" />
                      Santri Baru Setor Hari Ini
                    </span>
                    {sudahList.length > 0 && (
                      <button
                        type="button"
                        onClick={() => handleOpenSetoranModal('sudah')}
                        className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
                      >
                        Lihat Semua ({sudahCount}) →
                      </button>
                    )}
                  </div>

                  {sudahList.length === 0 ? (
                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/70 text-center">
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Belum ada santri menyetor hari ini.
                      </p>
                      <button
                        type="button"
                        onClick={() => navigate('/portal-guru/workspace?tab=tahfizh')}
                        className="mt-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline inline-flex items-center gap-1 cursor-pointer"
                      >
                        <Plus className="size-3" /> Input setoran pertama
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-1.5">
                      {sudahList.slice(0, 3).map((item, idx) => (
                        <div
                          key={item.id || idx}
                          onClick={() => handleOpenSetoranModal('sudah')}
                          className="flex items-center justify-between p-2 rounded-xl bg-emerald-50/50 hover:bg-emerald-100/60 dark:bg-emerald-950/30 dark:hover:bg-emerald-950/50 border border-emerald-200/70 dark:border-emerald-900/50 transition-colors cursor-pointer text-xs"
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="flex size-6.5 shrink-0 items-center justify-center rounded-lg bg-emerald-600 text-[10px] font-black text-white shadow-xs">
                              {item.student_name ? item.student_name[0] : 'S'}
                            </span>
                            <div className="min-w-0">
                              <p className="font-bold text-slate-900 dark:text-white truncate">
                                {item.student_name}
                              </p>
                              <p className="text-[11px] text-[#0E5C44] dark:text-[#3FBF75] font-semibold truncate">
                                {item.surah_name} ({item.ayah_start}-{item.ayah_end})
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-1.5 shrink-0">
                            {item.time && (
                              <span className="text-[10px] text-slate-400 font-medium">
                                {item.time} WIB
                              </span>
                            )}
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300">
                              {item.kelancaran || 'Lancar'}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Card Footer CTA Button */}
              <div className="mt-3.5 pt-3 border-t border-emerald-100/90 dark:border-emerald-900/60">
                <button
                  type="button"
                  onClick={() => handleOpenSetoranModal('sudah')}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 via-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white text-xs font-bold shadow-md shadow-emerald-700/20 transition-all cursor-pointer group"
                >
                  <Users className="size-4" />
                  <span>Lihat Rincian Santri ({sudahCount} Sudah • {belumCount} Belum)</span>
                  <ChevronRight className="size-4 group-hover:translate-x-0.5 transition-transform" />
                </button>
              </div>
            </div>

            {/* RIWAYAT SETORAN TERBARU DATATABLE */}
            <div className="lg:col-span-7 relative overflow-hidden rounded-[22px] border-2 border-emerald-300/80 bg-white shadow-md shadow-emerald-500/10 dark:border-emerald-700/80 dark:bg-[#1B2433]">
              <div className="p-4 sm:p-5 border-b border-emerald-100/90 dark:border-emerald-900/60 bg-gradient-to-r from-emerald-500/10 via-teal-500/5 to-transparent">
                <h3 className="text-sm sm:text-base font-black text-slate-900 dark:text-white">
                  Riwayat Setoran Terbaru
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Catatan hafalan dan murajaah siswa binaan halaqah
                </p>
              </div>
              <div className="p-4">
                <AppDataTable
                  title=""
                  description=""
                  data={tables.recent_logs || []}
                  columns={setoranColumns}
                  keyField="student"
                  searchPlaceholder="Cari siswa atau surah..."
                />
              </div>
            </div>
          </div>
        </section>

        {/* Dedicated Setoran Status Modal (Sudah vs Belum Setor) */}
        <SetoranStatusModal
          isOpen={setoranModalOpen}
          onClose={() => setSetoranModalOpen(false)}
          initialTab={setoranModalTab}
          details={setoranDetails}
          onInputSetoran={(studentId) => {
            navigate(studentId ? `/portal-guru/workspace?tab=tahfizh&student_id=${studentId}` : '/portal-guru/workspace?tab=tahfizh')
          }}
        />

        {/* Global KPI Detail Modal */}
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
