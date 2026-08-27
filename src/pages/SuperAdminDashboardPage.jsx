import React, { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Building2,
  Users,
  UserCheck,
  GraduationCap,
  HeartHandshake,
  School,
  Layers,
  ShieldCheck,
  Sparkles,
  UserX,
  Plus,
  Activity,
  UserPlus,
  Key,
  FileText,
  RefreshCw,
  Search,
  ChevronRight,
  Filter,
  Eye,
  MoreVertical,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  User,
} from 'lucide-react'
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts'

import {
  AppPageHeader,
  AppBreadcrumb,
  AppBadge,
  AppButton,
  PageContainer,
} from '../components/app'
import { Input } from '../components/tailgrids/core/input'
import { Button } from '../components/tailgrids/core/button'
import { Pagination } from '../components/tailgrids/core/pagination'
import {
  TableRoot,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from '../components/tailgrids/core/table'
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '../components/tailgrids/core/hover-card'
import { SquircleActionButton } from '../components/master-data'

import SkeletonDashboard from '../components/dashboard/SkeletonDashboard'
import ErrorState from '../components/dashboard/ErrorState'
import KpiQuickViewModal from '../components/KpiQuickViewModal'
import ModalErrorBoundary from '../components/common/ModalErrorBoundary'

import { useAuthStore } from '../stores/authStore'
import { superAdminDashboardService } from '../services/superAdminDashboardService'

// Animation Variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.03,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, ease: 'easeOut' },
  },
}

// Tone Styles for KPI Cards
const toneStyles = {
  emerald: {
    cardBg: 'bg-emerald-50/70 dark:bg-emerald-950/40 border-emerald-200/80 dark:border-emerald-900/50',
    iconBg: 'bg-emerald-100 dark:bg-emerald-900/80',
    iconColor: 'text-emerald-700 dark:text-emerald-300',
    badge: 'bg-emerald-200/80 text-emerald-800 dark:bg-emerald-900/90 dark:text-emerald-200',
  },
  violet: {
    cardBg: 'bg-violet-50/70 dark:bg-violet-950/40 border-violet-200/80 dark:border-violet-900/50',
    iconBg: 'bg-violet-100 dark:bg-violet-900/80',
    iconColor: 'text-violet-700 dark:text-violet-300',
    badge: 'bg-violet-200/80 text-violet-800 dark:bg-violet-900/90 dark:text-violet-200',
  },
  sky: {
    cardBg: 'bg-sky-50/70 dark:bg-sky-950/40 border-sky-200/80 dark:border-sky-900/50',
    iconBg: 'bg-sky-100 dark:bg-sky-900/80',
    iconColor: 'text-sky-700 dark:text-sky-300',
    badge: 'bg-sky-200/80 text-sky-800 dark:bg-sky-900/90 dark:text-sky-200',
  },
  amber: {
    cardBg: 'bg-amber-50/70 dark:bg-amber-950/40 border-amber-200/80 dark:border-amber-900/50',
    iconBg: 'bg-amber-100 dark:bg-amber-900/80',
    iconColor: 'text-amber-700 dark:text-amber-300',
    badge: 'bg-amber-200/80 text-amber-800 dark:bg-amber-900/90 dark:text-amber-200',
  },
  rose: {
    cardBg: 'bg-rose-50/70 dark:bg-rose-950/40 border-rose-200/80 dark:border-rose-900/50',
    iconBg: 'bg-rose-100 dark:bg-rose-900/80',
    iconColor: 'text-rose-700 dark:text-rose-300',
    badge: 'bg-rose-200/80 text-rose-800 dark:bg-rose-900/90 dark:text-rose-200',
  },
  indigo: {
    cardBg: 'bg-indigo-50/70 dark:bg-indigo-950/40 border-indigo-200/80 dark:border-indigo-900/50',
    iconBg: 'bg-indigo-100 dark:bg-indigo-900/80',
    iconColor: 'text-indigo-700 dark:text-indigo-300',
    badge: 'bg-indigo-200/80 text-indigo-800 dark:bg-indigo-900/90 dark:text-indigo-200',
  },
}

const PIE_COLORS = ['#0E5C44', '#3FBF75', '#3182F6', '#8B5CF6', '#FF8A1F']

export default function SuperAdminDashboardPage() {
  const navigate = useNavigate()
  const currentUser = useAuthStore((state) => state.user)

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [data, setData] = useState(null)
  const [activeModal, setActiveModal] = useState(null)

  // Filters
  const [selectedUnit, setSelectedUnit] = useState('semua')
  const [selectedStatus, setSelectedStatus] = useState('semua')
  const [periodOption, setPeriodOption] = useState('semua')
  const [searchQuery, setSearchQuery] = useState('')
  const [page, setPage] = useState(1)
  const pageSize = 5

  const fetchDashboard = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await superAdminDashboardService.getOverview()
      if (res && res.data) {
        setData(res.data)
      } else {
        setError('Format respon server tidak valid.')
      }
    } catch (err) {
      console.error('Failed to load dashboard:', err)
      setError(err.response?.data?.message || 'Gagal memuat data dashboard.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDashboard()
  }, [])

  const resetFilter = () => {
    setSelectedUnit('semua')
    setSelectedStatus('semua')
    setPeriodOption('semua')
    setSearchQuery('')
    setPage(1)
  }

  const kpis = data?.kpis || {}
  const context = data?.context || {}
  const charts = data?.charts || {}
  const unitSummaries = data?.unit_summaries || []
  const recentLogins = data?.recent_logins || []

  const formatAngka = (num) =>
    num !== undefined && num !== null ? Number(num).toLocaleString('id-ID') : '0'

  // Filtered unit summaries for Datatable
  const filteredUnits = useMemo(() => {
    return unitSummaries.filter((unit) => {
      const matchSearch =
        !searchQuery ||
        unit.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        unit.code?.toLowerCase().includes(searchQuery.toLowerCase())
      const matchUnit = selectedUnit === 'semua' || String(unit.id) === String(selectedUnit)
      const matchStatus =
        selectedStatus === 'semua' ||
        String(unit.status).toLowerCase() === selectedStatus.toLowerCase()

      return matchSearch && matchUnit && matchStatus
    })
  }, [unitSummaries, searchQuery, selectedUnit, selectedStatus])

  const totalPages = Math.max(1, Math.ceil(filteredUnits.length / pageSize))
  const paginatedUnits = useMemo(() => {
    const start = (page - 1) * pageSize
    return filteredUnits.slice(start, start + pageSize)
  }, [filteredUnits, page, pageSize])

  // Pie chart data preparation
  const staffPieData = useMemo(() => {
    const totalGuru = Object.values(unitSummaries).reduce((acc, u) => acc + (u.guru_count || 0), 0)
    const totalPegawai = Object.values(unitSummaries).reduce((acc, u) => acc + (u.pegawai_count || 0), 0)
    if (totalGuru === 0 && totalPegawai === 0) {
      return [
        { name: 'Guru Pendidik', value: kpis.total_teachers?.total || 45 },
        { name: 'Pegawai & Tendik', value: (kpis.total_employees?.total || 60) - (kpis.total_teachers?.total || 45) },
      ]
    }
    return [
      { name: 'Guru Pendidik', value: totalGuru },
      { name: 'Pegawai & Tendik', value: totalPegawai },
    ]
  }, [unitSummaries, kpis])

  if (loading && !data) return <SkeletonDashboard />
  if (error && !data) return <ErrorState message={error} onRetry={fetchDashboard} />

  const primaryCards = [
    {
      title: 'Total Unit Pendidikan',
      value: kpis.total_units?.total,
      icon: Building2,
      tone: 'emerald',
      percent: Math.min(100, (kpis.total_units?.total || 0) * 10),
      modalKey: 'total_units',
      badgeText: 'Terdaftar',
    },
    {
      title: 'Unit Sekolah Aktif',
      value: kpis.active_units?.total,
      icon: School,
      tone: 'sky',
      percent: kpis.total_units?.total
        ? Math.round(((kpis.active_units?.total || 0) / (kpis.total_units?.total || 1)) * 100)
        : 100,
      modalKey: 'active_units',
      badgeText: 'Aktif',
    },
    {
      title: 'Total Pegawai & Tendik',
      value: kpis.total_employees?.total,
      icon: UserCheck,
      tone: 'violet',
      percent: Math.min(100, (kpis.total_employees?.total || 0) * 2),
      modalKey: 'total_employees',
      badgeText: 'SDM Staf',
    },
    {
      title: 'Total Guru Pengajar',
      value: kpis.total_teachers?.total,
      icon: GraduationCap,
      tone: 'indigo',
      percent: kpis.total_employees?.total
        ? Math.round(((kpis.total_teachers?.total || 0) / (kpis.total_employees?.total || 1)) * 100)
        : 100,
      modalKey: 'total_teachers',
      badgeText: 'Pendidik',
    },
    {
      title: 'Total Siswa Aktif',
      value: kpis.total_students?.total,
      icon: Users,
      tone: 'amber',
      percent: Math.min(100, (kpis.total_students?.total || 0) * 0.1),
      modalKey: 'total_students',
      badgeText: 'Siswa',
    },
  ]

  const secondaryCards = [
    {
      title: 'Total Orang Tua / Wali',
      value: kpis.total_parents?.total,
      icon: HeartHandshake,
      tone: 'rose',
      percent: kpis.total_students?.total
        ? Math.round(((kpis.total_parents?.total || 0) / (kpis.total_students?.total || 1)) * 100)
        : 100,
      modalKey: 'total_parents',
      badgeText: 'Wali',
    },
    {
      title: 'Total Rombel / Kelas',
      value: kpis.total_rombel?.total || kpis.total_classes?.total,
      icon: Layers,
      tone: 'sky',
      percent: Math.min(100, ((kpis.total_rombel?.total || 0) * 2)),
      modalKey: 'total_rombel',
      badgeText: 'Rombel',
    },
    {
      title: 'Pengguna Sistem Aktif',
      value: kpis.active_users?.total,
      icon: ShieldCheck,
      tone: 'emerald',
      percent: kpis.total_users?.total
        ? Math.round(((kpis.active_users?.total || 0) / (kpis.total_users?.total || 1)) * 100)
        : 100,
      modalKey: 'active_users',
      badgeText: 'User System',
    },
    {
      title: 'Role Spatie Terdaftar',
      value: kpis.active_roles?.total,
      icon: Key,
      tone: 'indigo',
      percent: Math.min(100, (kpis.active_roles?.total || 0) * 5),
      modalKey: 'active_roles',
      badgeText: 'Spatie Roles',
    },
    {
      title: 'User Tanpa Role',
      value: kpis.users_without_role?.total,
      icon: UserX,
      tone: 'rose',
      percent: kpis.total_users?.total
        ? Math.round(((kpis.users_without_role?.total || 0) / (kpis.total_users?.total || 1)) * 100)
        : 0,
      modalKey: 'users_without_role',
      badgeText: 'Perlu Action',
    },
  ]

  const welcomeRoleName = currentUser?.roles?.includes('Super Admin') || currentUser?.roles?.includes('super_admin')
    ? 'Super Admin'
    : 'Admin Sistem'

  return (
    <PageContainer>
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="space-y-6 pb-12"
      >
        {/* 1. Breadcrumbs Navigation & Modern Hero Card Header */}
        <motion.div variants={itemVariants} className="space-y-4">
          <AppBreadcrumb items={[{ label: `Dashboard Utama ${welcomeRoleName}` }]} />

          {/* Header Halaman Modern Hero Card */}
          <div className="relative overflow-hidden rounded-[18px] sm:rounded-[22px] border-2 border-emerald-500/30 bg-gradient-to-r from-emerald-500/15 via-teal-500/10 to-emerald-600/15 p-3.5 sm:p-5 md:p-6 shadow-md shadow-emerald-500/10 dark:border-emerald-600/40 dark:bg-gradient-to-r dark:from-emerald-950/70 dark:via-teal-950/50 dark:to-slate-900">
            {/* Ambient Glow Background Accent (Vibrant Dual Emerald-Teal Blobs) */}
            <div className="pointer-events-none absolute -top-20 -right-20 h-56 w-56 rounded-full bg-gradient-to-br from-emerald-500/40 via-teal-400/30 to-emerald-600/20 blur-3xl dark:from-emerald-500/50 dark:via-teal-400/40" />
            <div className="pointer-events-none absolute -bottom-20 -left-20 h-56 w-56 rounded-full bg-gradient-to-tr from-emerald-600/30 via-teal-500/20 to-transparent blur-3xl dark:from-emerald-600/40 dark:via-teal-500/30" />

            <div className="relative z-10 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-3 sm:gap-4 min-w-0">
                <div className="flex h-10 w-10 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-xl sm:rounded-2xl bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700 text-white shadow-xl shadow-emerald-600/40 border border-emerald-300/40 dark:from-emerald-400 dark:via-emerald-500 dark:to-teal-600 mt-0.5 sm:mt-0">
                  <ShieldCheck className="h-5 w-5 sm:h-6 sm:w-6" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h1 className="text-lg sm:text-xl md:text-2xl font-black tracking-tight text-slate-900 dark:text-white leading-tight">
                      Dashboard Utama {welcomeRoleName}
                    </h1>
                    <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-emerald-600 to-teal-600 px-2.5 py-0.5 sm:px-3.5 sm:py-1 text-[10px] sm:text-xs font-extrabold text-white shadow-sm shadow-emerald-600/25 border border-emerald-300/40">
                      <ShieldCheck className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                      {welcomeRoleName}
                    </span>
                  </div>
                  <p className="mt-1 text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300 max-w-2xl leading-relaxed">
                    Pusat kendali dan pemantauan terpadu seluruh unit pendidikan, aktivitas operasional, dan metrik sistem sekolah.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0 self-start sm:self-center w-full sm:w-auto">
                <AppButton
                  variant="outline"
                  size="sm"
                  icon={RefreshCw}
                  pending={loading}
                  onClick={fetchDashboard}
                  className="w-full sm:w-auto text-xs font-bold text-emerald-800 dark:text-emerald-200 border-emerald-300 dark:border-emerald-700 hover:bg-emerald-100 dark:hover:bg-emerald-950/80"
                >
                  Segarkan Data
                </AppButton>
              </div>
            </div>
          </div>
        </motion.div>

        {/* 3. Primary KPI Summary Cards (5-Card Grid) */}
        <motion.div variants={itemVariants} className="space-y-2">
          <div className="flex flex-col xs:flex-row xs:items-center justify-between gap-0.5 sm:gap-2">
            <h2 className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200">
              Metrik Utama Sistem & Unit Sekolah
            </h2>
            <span className="text-[10px] sm:text-xs text-slate-400 font-medium">Updated Realtime</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-5 gap-2.5 sm:gap-4">
            {primaryCards.map((card) => {
              const style = toneStyles[card.tone] || toneStyles.emerald
              const Icon = card.icon
              return (
                <motion.article
                  key={card.title}
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                  onClick={() => setActiveModal(card.modalKey)}
                  role="button"
                  tabIndex={0}
                  className={`group flex flex-col justify-between h-full p-3 sm:p-4 rounded-[16px] sm:rounded-[18px] border shadow-xs hover:shadow-md transition-all duration-200 cursor-pointer ${style.cardBg}`}
                >
                  <div className="flex items-center justify-between gap-1.5 mb-2 sm:mb-3">
                    <div
                      className={`size-8 sm:size-10 rounded-lg sm:rounded-xl flex items-center justify-center shrink-0 ${style.iconBg} ${style.iconColor}`}
                    >
                      <Icon className="size-4 sm:size-5" />
                    </div>
                    <span
                      className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] sm:text-[11px] font-bold ${style.badge}`}
                    >
                      {card.badgeText}
                    </span>
                  </div>
                  <div>
                    <span className="text-[11px] sm:text-xs font-semibold text-slate-600 dark:text-slate-300 block mb-0.5 truncate">
                      {card.title}
                    </span>
                    <strong className="text-xl sm:text-2xl lg:text-3xl font-black tracking-tight text-slate-900 dark:text-white block">
                      {formatAngka(card.value)}
                    </strong>
                  </div>
                  <div className="flex items-center justify-between text-[10px] sm:text-[11px] font-bold text-slate-500 group-hover:text-emerald-700 dark:text-slate-400 dark:hover:text-emerald-400 transition-colors pt-2 mt-2 sm:pt-3 sm:mt-3 border-t border-slate-200/60 dark:border-slate-800/80">
                    <span>Lihat Rincian</span>
                    <span className="inline-flex items-center gap-0.5 text-emerald-700 dark:text-emerald-400 font-bold group-hover:translate-x-0.5 transition-transform">
                      Detail &rarr;
                    </span>
                  </div>
                </motion.article>
              )
            })}
          </div>
        </motion.div>

        {/* 4. Secondary KPI Grid */}
        <motion.div variants={itemVariants} className="space-y-2">
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-5 gap-2.5 sm:gap-4">
            {secondaryCards.map((card) => {
              const style = toneStyles[card.tone] || toneStyles.violet
              const Icon = card.icon
              return (
                <motion.article
                  key={card.title}
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                  onClick={() => setActiveModal(card.modalKey)}
                  role="button"
                  tabIndex={0}
                  className={`group flex flex-col justify-between h-full p-3 sm:p-4 rounded-[16px] sm:rounded-[18px] border shadow-xs hover:shadow-md transition-all duration-200 cursor-pointer ${style.cardBg}`}
                >
                  <div className="flex items-center justify-between gap-1.5 mb-2 sm:mb-3">
                    <div
                      className={`size-8 sm:size-10 rounded-lg sm:rounded-xl flex items-center justify-center shrink-0 ${style.iconBg} ${style.iconColor}`}
                    >
                      <Icon className="size-4 sm:size-5" />
                    </div>
                    <span
                      className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] sm:text-[11px] font-bold ${style.badge}`}
                    >
                      {card.badgeText}
                    </span>
                  </div>
                  <div>
                    <span className="text-[11px] sm:text-xs font-semibold text-slate-600 dark:text-slate-300 block mb-0.5 truncate">
                      {card.title}
                    </span>
                    <strong className="text-xl sm:text-2xl lg:text-3xl font-black tracking-tight text-slate-900 dark:text-white block">
                      {formatAngka(card.value)}
                    </strong>
                  </div>
                  <div className="flex items-center justify-between text-[10px] sm:text-[11px] font-bold text-slate-500 group-hover:text-emerald-700 dark:text-slate-400 dark:hover:text-emerald-400 transition-colors pt-2 mt-2 sm:pt-3 sm:mt-3 border-t border-slate-200/60 dark:border-slate-800/80">
                    <span>Analisis Modul</span>
                    <span className="inline-flex items-center gap-0.5 text-emerald-700 dark:text-emerald-400 font-bold group-hover:translate-x-0.5 transition-transform">
                      Detail &rarr;
                    </span>
                  </div>
                </motion.article>
              )
            })}
          </div>
        </motion.div>

        {/* 5. Recent Logins Section (Directly Above Filter System & Unit 3-Column Grid) */}
        <motion.div variants={itemVariants}>
          <div className="overflow-hidden rounded-[18px] border border-slate-200/80 bg-white p-5 sm:p-6 shadow-xs dark:border-slate-800 dark:bg-[#1B2433]">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                  <UserCheck className="size-5 text-emerald-600 dark:text-emerald-400" />
                  Audit User Login Terbaru
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Daftar pengguna dengan riwayat aktivitas sesi masuk terkini dalam sistem terpadu
                </p>
              </div>
              <AppBadge variant="info" size="sm">
                {recentLogins.length} Sesi Masuk
              </AppBadge>
            </div>

            {recentLogins.length === 0 ? (
              <div className="text-center py-6 text-slate-400 text-xs font-medium">
                Belum ada data sesi login user terbaru.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3.5">
                {recentLogins.slice(0, 8).map((userItem, idx) => (
                  <HoverCard key={userItem.id || idx}>
                    <HoverCardTrigger asChild>
                      <div className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 dark:border-slate-800/80 bg-slate-50/60 dark:bg-slate-900/40 hover:bg-emerald-50/60 dark:hover:bg-emerald-950/30 transition-colors cursor-pointer group">
                        <div className="size-9 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-900/80 dark:text-emerald-200 flex items-center justify-center font-black text-xs shrink-0 group-hover:scale-105 transition-transform">
                          {(userItem.name || 'U').substring(0, 2).toUpperCase()}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-bold text-slate-800 dark:text-slate-200 text-xs truncate group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                            {userItem.name}
                          </p>
                          <p className="text-[10px] text-slate-400 truncate">
                            {userItem.email}
                          </p>
                          <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold mt-0.5">
                            {userItem.created_at || 'Baru saja'}
                          </p>
                        </div>
                      </div>
                    </HoverCardTrigger>
                    <HoverCardContent className="w-72 p-4 bg-white dark:bg-[#1B2433] border border-slate-200 dark:border-slate-800 shadow-xl rounded-2xl">
                      <div className="space-y-2.5">
                        <div className="flex items-center gap-3">
                          <div className="size-10 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-xs shadow-inner">
                            {(userItem.name || 'U').substring(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <h4 className="font-bold text-slate-900 dark:text-white text-xs">
                              {userItem.name}
                            </h4>
                            <p className="text-[10px] text-slate-400 font-medium">
                              {userItem.email}
                            </p>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-[11px] pt-2 border-t border-slate-100 dark:border-slate-800">
                          <div>
                            <span className="text-slate-400 block text-[10px]">Role Hak Akses:</span>
                            <strong className="text-slate-800 dark:text-slate-200">{userItem.role || 'Pengguna'}</strong>
                          </div>
                          <div>
                            <span className="text-slate-400 block text-[10px]">Sesi Masuk:</span>
                            <strong className="text-emerald-600 dark:text-emerald-400">{userItem.created_at || 'Terbaru'}</strong>
                          </div>
                        </div>
                      </div>
                    </HoverCardContent>
                  </HoverCard>
                ))}
              </div>
            )}
          </div>
        </motion.div>

        {/* 5. 3-Column Equal Grid Section */}
        <motion.div variants={itemVariants}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-stretch">
            {/* Column 1: Panel Filter Laporan & System */}
            <article className="overflow-hidden rounded-[18px] border border-slate-200/80 bg-white dark:bg-[#1B2433] p-5 sm:p-6 shadow-xs flex flex-col justify-between h-full">
              <div>
                <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <Filter className="size-4 text-emerald-600 dark:text-emerald-400" />
                    <h2 className="text-base font-bold text-slate-900 dark:text-white">
                      Filter System & Unit
                    </h2>
                  </div>
                  <button
                    type="button"
                    onClick={resetFilter}
                    className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
                  >
                    Reset Filter
                  </button>
                </div>

                <div className="space-y-3">
                  {/* Dropdown Unit Pendidikan */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                      Pilihan Unit Sekolah
                    </label>
                    <select
                      value={selectedUnit}
                      onChange={(e) => {
                        setSelectedUnit(e.target.value)
                        setPage(1)
                      }}
                      className="w-full h-9 px-3 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                      <option value="semua">Semua Unit Pendidikan</option>
                      {unitSummaries.map((unit) => (
                        <option key={unit.id} value={unit.id}>
                          {unit.name} ({unit.code})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Dropdown Status Unit */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                      Status Operasional Unit
                    </label>
                    <select
                      value={selectedStatus}
                      onChange={(e) => {
                        setSelectedStatus(e.target.value)
                        setPage(1)
                      }}
                      className="w-full h-9 px-3 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                      <option value="semua">Semua Status Unit</option>
                      <option value="aktif">Aktif Operasional</option>
                      <option value="nonaktif">Non-Aktif</option>
                    </select>
                  </div>

                  {/* Dropdown Periode Waktu */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                      Periode Analisis Data
                    </label>
                    <select
                      value={periodOption}
                      onChange={(e) => {
                        setPeriodOption(e.target.value)
                        setPage(1)
                      }}
                      className="w-full h-9 px-3 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                      <option value="semua">Semua Periode Data</option>
                      <option value="hari">Hari Ini (Per Hari)</option>
                      <option value="minggu">7 Hari Terakhir (Per Minggu)</option>
                      <option value="bulan">Bulan Ini (Per Bulan)</option>
                      <option value="semester">6 Bulan Terakhir (Per Semester)</option>
                      <option value="tahun">Tahun Ini (Per Tahun)</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800/80">
                <p className="text-[11px] text-slate-400 font-medium leading-relaxed">
                  Gunakan filter di atas untuk mempersempit ringkasan statistik dan daftar unit sekolah terdaftar pada tabel.
                </p>
              </div>
            </article>

            {/* Column 2: Grafik Tren Utama Kesiswaan per Unit */}
            <article className="overflow-hidden rounded-[18px] border border-slate-200/80 bg-white dark:bg-[#1B2433] p-5 sm:p-6 shadow-xs flex flex-col justify-between h-full">
              <div>
                <div className="flex items-center justify-between mb-3 pb-3 border-b border-slate-100 dark:border-slate-800">
                  <div>
                    <h2 className="text-base font-bold text-slate-900 dark:text-white">
                      Distribusi Siswa per Unit
                    </h2>
                    <p className="text-[11px] text-slate-400 font-medium">
                      Jumlah siswa aktif terdaftar di masing-masing unit
                    </p>
                  </div>
                  <AppBadge variant="success" size="sm">
                    Kesiswaan
                  </AppBadge>
                </div>

                <div className="h-56 w-full pt-1">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={charts.student_distribution || []}>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                      <XAxis dataKey="name" stroke="#888888" fontSize={11} />
                      <YAxis stroke="#888888" fontSize={11} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#1E293B',
                          borderColor: '#334155',
                          borderRadius: '12px',
                          color: '#F8FAFC',
                          fontSize: '12px',
                        }}
                      />
                      <Bar dataKey="total" fill="#0E5C44" radius={[6, 6, 0, 0]} name="Siswa Aktif" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 mt-2 border-t border-slate-100 dark:border-slate-800 text-xs font-bold text-slate-500">
                <span>Total Unit Terdaftar</span>
                <span className="text-emerald-600 dark:text-emerald-400">
                  {unitSummaries.length} Unit Sekolah
                </span>
              </div>
            </article>

            {/* Column 3: Grafik Donut Komposisi SDM & Pegawai */}
            <article className="overflow-hidden rounded-[18px] border border-slate-200/80 bg-white dark:bg-[#1B2433] p-5 sm:p-6 shadow-xs flex flex-col justify-between h-full">
              <div>
                <div className="flex items-center justify-between mb-3 pb-3 border-b border-slate-100 dark:border-slate-800">
                  <div>
                    <h2 className="text-base font-bold text-slate-900 dark:text-white">
                      Komposisi SDM & Pendidik
                    </h2>
                    <p className="text-[11px] text-slate-400 font-medium">
                      Perbandingan Guru Pendidik dan Tenaga Kependidikan
                    </p>
                  </div>
                  <AppBadge variant="info" size="sm">
                    SDM Staf
                  </AppBadge>
                </div>

                <div className="h-56 w-full relative flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={staffPieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={75}
                        paddingAngle={4}
                        dataKey="value"
                      >
                        {staffPieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#1E293B',
                          borderColor: '#334155',
                          borderRadius: '12px',
                          color: '#F8FAFC',
                          fontSize: '12px',
                        }}
                      />
                      <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '11px' }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 mt-2 border-t border-slate-100 dark:border-slate-800 text-xs font-bold text-slate-500">
                <span>Total SDM Terdaftar</span>
                <span className="text-emerald-600 dark:text-emerald-400">
                  {formatAngka(kpis.total_employees?.total)} Personel
                </span>
              </div>
            </article>
          </div>
        </motion.div>

        {/* 6. Quick Action Navigation Bar */}
        <motion.div variants={itemVariants}>
          <section className="rounded-[18px] border border-slate-200/80 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-[#1B2433]">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
                  Aksi Cepat Navigation
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Pintas cepat ke pengelolaan data master, akun pengguna, dan konfigurasi hak akses
                </p>
              </div>
              <div className="flex items-center gap-2.5 flex-nowrap shrink-0 overflow-x-auto py-1">
                <SquircleActionButton
                  variant="import"
                  icon={Building2}
                  label="Tambah Unit"
                  onClick={() => navigate('/dashboard/master/unit-pendidikan')}
                />
                <SquircleActionButton
                  variant="primary"
                  icon={UserPlus}
                  label="Tambah Pegawai"
                  onClick={() => navigate('/dashboard/employees')}
                />
                <SquircleActionButton
                  variant="view"
                  icon={Users}
                  label="Tambah Siswa"
                  onClick={() => navigate('/dashboard/students')}
                />
                <SquircleActionButton
                  variant="export"
                  icon={Key}
                  label="Kelola Hak Akses"
                  onClick={() => navigate('/dashboard/hak-akses')}
                />
                <SquircleActionButton
                  variant="view"
                  icon={Activity}
                  label="Log Sistem"
                  onClick={() => navigate('/dashboard/pengaturan')}
                />
              </div>
            </div>
          </section>
        </motion.div>

        {/* 7. Outer Datatable Container dengan Gradasi Zamrud */}
        <motion.div variants={itemVariants}>
          <div className="relative overflow-hidden rounded-[22px] border-2 border-emerald-500/25 bg-white shadow-md shadow-emerald-500/5 dark:border-emerald-600/35 dark:bg-[#1B2433]">
            {/* Toolbar Header 3-Baris Terstruktur dengan Gradasi Zamrud */}
            <div className="p-4 sm:p-6 space-y-4 border-b border-emerald-500/20 bg-gradient-to-r from-emerald-500/10 via-teal-500/5 to-transparent dark:border-emerald-800/40 dark:bg-gradient-to-r dark:from-emerald-950/50 dark:via-teal-950/30 dark:to-transparent">
              {/* Baris 1: Title & Actions */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                    <Building2 className="size-5 text-emerald-600 dark:text-emerald-400" />
                    Ringkasan Master Unit Pendidikan
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-300 font-medium mt-0.5">
                    Daftar unit sekolah Islam terpadu beserta status dan statistik kesiswaan & pendidik
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <AppBadge variant="success">
                    {filteredUnits.length} Unit Ditemukan
                  </AppBadge>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate('/dashboard/master/unit-pendidikan')}
                    className="rounded-xl border border-emerald-300 bg-emerald-50 text-xs font-bold text-emerald-800 shadow-2xs hover:bg-emerald-100 dark:border-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-300"
                  >
                    Kelola Semua &rarr;
                  </Button>
                </div>
              </div>

              {/* Baris 2: Search Bar Full Width */}
              <div className="relative w-full">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                <Input
                  type="text"
                  placeholder="Cari nama unit pendidikan atau kode unit..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value)
                    setPage(1)
                  }}
                  className="pl-10 h-10 w-full rounded-xl text-xs bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* Baris 3: Status Quick Filters */}
              <div className="flex items-center justify-between text-xs font-semibold text-slate-600 dark:text-slate-400 pt-1">
                <span>Menampilkan {paginatedUnits.length} dari {filteredUnits.length} data</span>
                <div className="flex items-center gap-2">
                  <span className="text-slate-400 font-normal">Status:</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">{selectedStatus === 'semua' ? 'Semua Status' : selectedStatus}</span>
                </div>
              </div>
            </div>

            {/* Viewport Tabel dengan Horizontal Padding */}
            <div className="px-4 sm:px-6 md:px-8 overflow-x-auto">
              <TableRoot fullBleed={false}>
                <TableHeader className="bg-[#F8FAFB] dark:bg-[#202B3A]">
                  <TableRow className="bg-[#F8FAFB] dark:bg-[#202B3A] border-b border-[#EDF0F4] dark:border-[#354153]">
                    <TableHead className="bg-[#F8FAFB] dark:bg-[#202B3A] py-3.5 px-4 font-extrabold text-[11px] uppercase tracking-wider text-[#58677B] dark:text-[#DCE5F1]">
                      Nama Unit Pendidikan
                    </TableHead>
                    <TableHead className="bg-[#F8FAFB] dark:bg-[#202B3A] py-3.5 px-4 font-extrabold text-[11px] uppercase tracking-wider text-[#58677B] dark:text-[#DCE5F1]">
                      Siswa Aktif
                    </TableHead>
                    <TableHead className="bg-[#F8FAFB] dark:bg-[#202B3A] py-3.5 px-4 font-extrabold text-[11px] uppercase tracking-wider text-[#58677B] dark:text-[#DCE5F1]">
                      Guru Pendidik
                    </TableHead>
                    <TableHead className="bg-[#F8FAFB] dark:bg-[#202B3A] py-3.5 px-4 font-extrabold text-[11px] uppercase tracking-wider text-[#58677B] dark:text-[#DCE5F1]">
                      Pegawai & Tendik
                    </TableHead>
                    <TableHead className="bg-[#F8FAFB] dark:bg-[#202B3A] py-3.5 px-4 font-extrabold text-[11px] uppercase tracking-wider text-[#58677B] dark:text-[#DCE5F1]">
                      Status Operasional
                    </TableHead>
                    <TableHead className="bg-[#F8FAFB] dark:bg-[#202B3A] py-3.5 px-4 text-right font-extrabold text-[11px] uppercase tracking-wider text-[#58677B] dark:text-[#DCE5F1]">
                      Aksi
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedUnits.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-slate-400 text-xs font-medium">
                        Tidak ada data unit sekolah yang sesuai dengan pencarian.
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedUnits.map((row) => (
                      <TableRow key={row.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-900/50 transition-colors">
                        <TableCell className="py-3.5">
                          <HoverCard>
                            <HoverCardTrigger asChild>
                              <div className="flex items-center gap-3 cursor-pointer group">
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-800 font-black text-xs dark:bg-emerald-950 dark:text-emerald-300 group-hover:scale-105 transition-transform">
                                  {(row.code || row.name || 'UN').substring(0, 3).toUpperCase()}
                                </div>
                                <div className="min-w-0">
                                  <p className="font-extrabold text-slate-900 dark:text-white truncate text-xs group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                                    {row.name}
                                  </p>
                                  <p className="text-[11px] text-slate-400 font-medium">
                                    Kode: {row.code || 'UNIT'}
                                  </p>
                                </div>
                              </div>
                            </HoverCardTrigger>
                            <HoverCardContent className="w-72 p-4 bg-white dark:bg-[#1B2433] border border-slate-200 dark:border-slate-800 shadow-xl rounded-2xl">
                              <div className="space-y-2.5">
                                <div className="flex items-center gap-3">
                                  <div className="flex size-9 rounded-xl bg-emerald-600 text-white font-bold items-center justify-center text-xs">
                                    {(row.code || 'UN').substring(0, 3).toUpperCase()}
                                  </div>
                                  <div>
                                    <h4 className="font-bold text-slate-900 dark:text-white text-xs">
                                      {row.name}
                                    </h4>
                                    <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">
                                      Unit Sekolah Terdaftar
                                    </p>
                                  </div>
                                </div>
                                <div className="grid grid-cols-2 gap-2 text-[11px] pt-2 border-t border-slate-100 dark:border-slate-800">
                                  <div>
                                    <span className="text-slate-400 block text-[10px]">Siswa:</span>
                                    <strong className="text-slate-800 dark:text-slate-200">{formatAngka(row.siswa_count)} Siswa</strong>
                                  </div>
                                  <div>
                                    <span className="text-slate-400 block text-[10px]">Guru:</span>
                                    <strong className="text-slate-800 dark:text-slate-200">{formatAngka(row.guru_count)} Guru</strong>
                                  </div>
                                </div>
                              </div>
                            </HoverCardContent>
                          </HoverCard>
                        </TableCell>
                        <TableCell className="py-3.5 text-xs font-bold text-emerald-700 dark:text-emerald-400">
                          {formatAngka(row.siswa_count)} Siswa
                        </TableCell>
                        <TableCell className="py-3.5 text-xs font-bold text-slate-800 dark:text-slate-200">
                          {formatAngka(row.guru_count)} Guru
                        </TableCell>
                        <TableCell className="py-3.5 text-xs font-semibold text-slate-600 dark:text-slate-400">
                          {formatAngka(row.pegawai_count)} Pegawai
                        </TableCell>
                        <TableCell className="py-3.5">
                          <AppBadge
                            variant={row.status === 'Aktif' || row.status === 'aktif' ? 'success' : 'secondary'}
                            dot
                          >
                            {row.status || 'Aktif'}
                          </AppBadge>
                        </TableCell>
                        <TableCell className="py-3.5 text-right">
                          <Button
                            variant="ghost"
                            size="xs"
                            iconOnly
                            onClick={() => navigate('/dashboard/master/unit-pendidikan')}
                            className="text-slate-400 hover:text-emerald-600"
                          >
                            <Eye className="size-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </TableRoot>
            </div>

            {/* Footer Pagination Navigation */}
            <div className="w-full border-t border-slate-100 px-4 py-3.5 sm:px-6 md:px-8 dark:border-slate-800">
              <Pagination
                currentPage={page}
                totalPages={totalPages}
                sideLayout="full"
                onPageChange={(p) => setPage(p)}
              />
            </div>
          </div>
        </motion.div>

        {/* 9. Drill-down KPI Quick View Modal */}
        <ModalErrorBoundary onClose={() => setActiveModal(null)}>
          <AnimatePresence>
            {Boolean(activeModal) && (
              <KpiQuickViewModal
                type={activeModal}
                isOpen={Boolean(activeModal)}
                onClose={() => setActiveModal(null)}
              />
            )}
          </AnimatePresence>
        </ModalErrorBoundary>
      </motion.div>
    </PageContainer>
  )
}
