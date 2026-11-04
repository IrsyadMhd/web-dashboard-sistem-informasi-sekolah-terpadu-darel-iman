import React, { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useQuery } from '@tanstack/react-query'
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
  Activity,
  UserPlus,
  Key,
  RefreshCw,
  Search,
  Filter,
  Eye,
  Calendar,
  AlertTriangle,
  Zap,
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
  AppBreadcrumb,
  AppBadge,
  AppButton,
  PageContainer,
  AppDataTable,
  HeroUiHeader,
} from '../components/app'
import { Button } from '../components/ui/button'
import { Modal } from '../components/ui/modal'
import {
  Alert,
  AlertContent,
  AlertDescription,
  AlertIndicator,
  AlertTitle,
} from '../components/ui/alert'
import { SquircleActionButton } from '../components/master-data'

import SkeletonDashboard from '../components/dashboard/SkeletonDashboard'
import ErrorState from '../components/dashboard/ErrorState'
import KpiQuickViewModal from '../components/KpiQuickViewModal'
import ModalErrorBoundary from '../components/common/ModalErrorBoundary'

import { useAuthStore } from '../stores/authStore'
import { getUserRoleLevel } from '../auth/portalResolver'
import { superAdminDashboardService } from '../services/superAdminDashboardService'

// ── 1. DEFINISI ANIMASI (MODULE LEVEL) ──
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.02,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3, ease: 'easeOut' },
  },
}

// ── 2. DEFINISI TONE WARNA KARTU KPI MODERN (SESUAI DOKUMEN PANDUAN) ──
const MODERN_CARD_TONES = {
  emerald: {
    card: 'border-emerald-300/70 bg-gradient-to-br from-emerald-50 via-teal-50/60 to-white hover:border-emerald-400 dark:border-emerald-700/50 dark:from-emerald-950/40 dark:via-teal-950/20 dark:to-slate-900',
    glow: 'bg-emerald-400/20 group-hover:bg-emerald-400/30',
    iconBox: 'bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-emerald-500/30',
    tag: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/60 dark:text-emerald-300',
    title: 'text-emerald-700 dark:text-emerald-400',
    val: 'text-emerald-700 dark:text-emerald-300',
    sub: 'text-emerald-600/80 dark:text-emerald-400/80',
    cta: 'text-emerald-600/60 dark:text-emerald-500/60',
  },
  blue: {
    card: 'border-blue-300/70 bg-gradient-to-br from-blue-50 via-cyan-50/60 to-white hover:border-blue-400 dark:border-blue-700/50 dark:from-blue-950/40 dark:via-cyan-950/20 dark:to-slate-900',
    glow: 'bg-blue-400/20 group-hover:bg-blue-400/30',
    iconBox: 'bg-gradient-to-br from-blue-500 to-cyan-600 text-white shadow-blue-500/30',
    tag: 'bg-blue-100 text-blue-700 dark:bg-blue-900/60 dark:text-blue-300',
    title: 'text-blue-700 dark:text-blue-400',
    val: 'text-blue-700 dark:text-blue-300',
    sub: 'text-blue-600/80 dark:text-blue-400/80',
    cta: 'text-blue-600/60 dark:text-blue-500/60',
  },
  sky: {
    card: 'border-sky-300/70 bg-gradient-to-br from-sky-50 via-cyan-50/60 to-white hover:border-sky-400 dark:border-sky-700/50 dark:from-sky-950/40 dark:via-cyan-950/20 dark:to-slate-900',
    glow: 'bg-sky-400/20 group-hover:bg-sky-400/30',
    iconBox: 'bg-gradient-to-br from-sky-500 to-blue-600 text-white shadow-sky-500/30',
    tag: 'bg-sky-100 text-sky-700 dark:bg-sky-900/60 dark:text-sky-300',
    title: 'text-sky-700 dark:text-sky-400',
    val: 'text-sky-700 dark:text-sky-300',
    sub: 'text-sky-600/80 dark:text-sky-400/80',
    cta: 'text-sky-600/60 dark:text-sky-500/60',
  },
  indigo: {
    card: 'border-indigo-300/70 bg-gradient-to-br from-indigo-50 via-sky-50/60 to-white hover:border-indigo-400 dark:border-indigo-700/50 dark:from-indigo-950/40 dark:via-sky-950/20 dark:to-slate-900',
    glow: 'bg-indigo-400/20 group-hover:bg-indigo-400/30',
    iconBox: 'bg-gradient-to-br from-indigo-500 to-sky-600 text-white shadow-indigo-500/30',
    tag: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/60 dark:text-indigo-300',
    title: 'text-indigo-700 dark:text-indigo-400',
    val: 'text-indigo-700 dark:text-indigo-300',
    sub: 'text-indigo-600/80 dark:text-indigo-400/80',
    cta: 'text-indigo-600/60 dark:text-indigo-500/60',
  },
  rose: {
    card: 'border-rose-300/70 bg-gradient-to-br from-rose-50 via-pink-50/60 to-white hover:border-rose-400 dark:border-rose-700/50 dark:from-rose-950/40 dark:via-pink-950/20 dark:to-slate-900',
    glow: 'bg-rose-400/20 group-hover:bg-rose-400/30',
    iconBox: 'bg-gradient-to-br from-rose-500 to-pink-600 text-white shadow-rose-500/30',
    tag: 'bg-rose-100 text-rose-700 dark:bg-rose-900/60 dark:text-rose-300',
    title: 'text-rose-700 dark:text-rose-400',
    val: 'text-rose-700 dark:text-rose-300',
    sub: 'text-rose-600/80 dark:text-rose-400/80',
    cta: 'text-rose-600/60 dark:text-rose-500/60',
  },
  amber: {
    card: 'border-amber-300/70 bg-gradient-to-br from-amber-50 via-orange-50/60 to-white hover:border-amber-400 dark:border-amber-700/50 dark:from-amber-950/40 dark:via-orange-950/20 dark:to-slate-900',
    glow: 'bg-amber-400/20 group-hover:bg-amber-400/30',
    iconBox: 'bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-amber-500/30',
    tag: 'bg-amber-100 text-amber-700 dark:bg-amber-900/60 dark:text-amber-300',
    title: 'text-amber-700 dark:text-amber-400',
    val: 'text-amber-700 dark:text-amber-300',
    sub: 'text-amber-600/80 dark:text-amber-400/80',
    cta: 'text-amber-600/60 dark:text-amber-500/60',
  },
  violet: {
    card: 'border-purple-300/70 bg-gradient-to-br from-purple-50 via-fuchsia-50/60 to-white hover:border-purple-400 dark:border-purple-700/50 dark:from-purple-950/40 dark:via-fuchsia-950/20 dark:to-slate-900',
    glow: 'bg-purple-400/20 group-hover:bg-purple-400/30',
    iconBox: 'bg-gradient-to-br from-purple-500 to-fuchsia-600 text-white shadow-purple-500/30',
    tag: 'bg-purple-100 text-purple-700 dark:bg-purple-900/60 dark:text-purple-300',
    title: 'text-purple-700 dark:text-purple-400',
    val: 'text-purple-700 dark:text-purple-300',
    sub: 'text-purple-600/80 dark:text-purple-400/80',
    cta: 'text-purple-600/60 dark:text-purple-500/60',
  },
}

const PIE_COLORS = ['#059669', '#3B82F6', '#6366F1', '#F59E0B', '#EC4899']

// ── 3. KOMPONEN KARTU KPI MODERN (STABIL DI LUAR RENDER) ──
function ModernKpiCard({ card, onClick }) {
  const tone = MODERN_CARD_TONES[card.tone] || MODERN_CARD_TONES.emerald
  const Icon = card.icon

  return (
    <motion.article
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      onClick={onClick}
      role="button"
      tabIndex={0}
      className={`group relative overflow-hidden rounded-[18px] border-2 p-3.5 sm:p-4 md:p-5 shadow-xs transition-[border-color,box-shadow] duration-150 cursor-pointer flex flex-col justify-between h-full ${tone.card}`}
    >
      {/* Ambient Glow */}
      <div className={`pointer-events-none absolute -top-8 -right-8 h-28 w-28 rounded-full blur-2xl transition-all ${tone.glow}`} />

      <div>
        <div className="flex items-center justify-between gap-1.5 mb-2.5 sm:mb-3">
          <div className={`flex size-9 sm:size-10 items-center justify-center rounded-xl shadow-md ${tone.iconBox}`}>
            <Icon className="size-4 sm:size-5" />
          </div>
          <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] sm:text-[11px] font-black ${tone.tag}`}>
            {card.badgeText}
          </span>
        </div>
        <span
          title={card.title}
          className={`text-[10px] sm:text-xs font-bold uppercase tracking-wider block mb-1 line-clamp-2 min-h-[2.4em] leading-snug ${tone.title}`}
        >
          {card.title}
        </span>
        <strong className={`text-xl sm:text-2xl md:text-3xl font-black tabular-nums tracking-tight block ${tone.val}`}>
          {card.formattedValue}
        </strong>
      </div>

      <div className="flex items-center justify-between text-[10px] sm:text-[11px] font-bold pt-2.5 sm:pt-3 mt-2.5 sm:mt-3 border-t border-slate-200/60 dark:border-slate-800/80">
        <span className={tone.sub}>{card.subtext || 'Lihat Rincian'}</span>
        <span className={`inline-flex items-center gap-0.5 font-extrabold group-hover:translate-x-0.5 transition-transform ${tone.cta}`}>
          Detail &rarr;
        </span>
      </div>
    </motion.article>
  )
}

export default function SuperAdminDashboardPage() {
  const navigate = useNavigate()
  const currentUser = useAuthStore((state) => state.user)

  // Filters connected directly to database
  const [selectedUnit, setSelectedUnit] = useState('semua')
  const [selectedStatus, setSelectedStatus] = useState('semua')
  const [periodOption, setPeriodOption] = useState('minggu')
  const [selectedAcademicYear, setSelectedAcademicYear] = useState('semua')
  const [selectedSemester, setSelectedSemester] = useState('semua')
  const [searchQuery, setSearchQuery] = useState('')
  const [page, setPage] = useState(1)
  const [activeModal, setActiveModal] = useState(null)
  const [selectedLoginAudit, setSelectedLoginAudit] = useState(null)
  const pageSize = 5

  // ── 4. TANSTACK REACT QUERY V5 FETCHING DENGAN CACHING CEPAT ──
  const {
    data,
    isLoading,
    isError,
    error: queryError,
    refetch,
  } = useQuery({
    queryKey: [
      'superadmin-dashboard-overview',
      selectedUnit,
      selectedStatus,
      periodOption,
      selectedAcademicYear,
      selectedSemester,
    ],
    queryFn: async () => {
      const params = {}
      if (selectedUnit && selectedUnit !== 'semua') params.unit_id = selectedUnit
      if (selectedStatus && selectedStatus !== 'semua') params.status = selectedStatus
      if (periodOption && periodOption !== 'semua') params.period = periodOption
      if (selectedAcademicYear && selectedAcademicYear !== 'semua') params.academic_year_id = selectedAcademicYear
      if (selectedSemester && selectedSemester !== 'semua') params.semester_id = selectedSemester

      const res = await superAdminDashboardService.getOverview(params)
      return res?.data || null
    },
    staleTime: 60000,
    placeholderData: (previousData) => previousData,
  })

  const resetFilter = () => {
    setSelectedUnit('semua')
    setSelectedStatus('semua')
    setPeriodOption('minggu')
    setSelectedAcademicYear('semua')
    setSelectedSemester('semua')
    setSearchQuery('')
    setPage(1)
  }

  const kpis = data?.kpis || {}
  const context = data?.context || {}
  const charts = data?.charts || {}
  const unitSummaries = data?.unit_summaries || []
  const recentLogins = data?.recent_logins || []

  const availableUnits = context?.available_units || unitSummaries || []
  const availableAcademicYears = context?.available_academic_years || []
  const availableSemesters = context?.available_semesters || []

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

  // Kolom Master Datatable Unit Pendidikan
  const unitTableColumns = useMemo(
    () => [
      {
        key: 'name',
        label: 'Nama Unit Pendidikan',
        sortable: true,
        className: 'w-[36%] min-w-[200px]',
        render: (row) => (
          <div className="flex items-center gap-3 max-w-sm">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200/60 text-emerald-800 font-black text-xs dark:from-emerald-950/60 dark:to-teal-950/40 dark:border-emerald-800/60 dark:text-emerald-300 shadow-xs">
              {(row.code || row.name || 'UN').substring(0, 3).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1 overflow-hidden">
              <p className="font-extrabold text-slate-900 dark:text-white truncate text-xs">
                {row.name}
              </p>
              <p className="text-[11px] text-slate-400 font-medium truncate">
                Kode: {row.code || 'UNIT'}
              </p>
            </div>
          </div>
        ),
      },
      {
        key: 'siswa_count',
        label: 'Siswa Aktif',
        sortable: true,
        className: 'w-[14%] whitespace-nowrap',
        render: (row) => (
          <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400">
            {formatAngka(row.siswa_count)} Siswa
          </span>
        ),
      },
      {
        key: 'guru_count',
        label: 'Guru Pendidik',
        sortable: true,
        className: 'w-[14%] whitespace-nowrap',
        render: (row) => (
          <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
            {formatAngka(row.guru_count)} Guru
          </span>
        ),
      },
      {
        key: 'pegawai_count',
        label: 'Pegawai & Tendik',
        sortable: true,
        className: 'w-[14%] whitespace-nowrap',
        render: (row) => (
          <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">
            {formatAngka(row.pegawai_count)} Pegawai
          </span>
        ),
      },
      {
        key: 'status',
        label: 'Status Operasional',
        sortable: true,
        className: 'w-[14%] whitespace-nowrap',
        render: (row) => (
          <AppBadge
            variant={row.status === 'Aktif' || row.status === 'aktif' ? 'success' : 'secondary'}
            dot
          >
            {row.status || 'Aktif'}
          </AppBadge>
        ),
      },
      {
        key: 'action',
        label: 'Aksi',
        align: 'right',
        className: 'w-[80px] text-right whitespace-nowrap',
        render: (row) => (
          <Button
            variant="ghost"
            size="xs"
            iconOnly
            title="Lihat Detail Unit"
            aria-label="Lihat Detail Unit"
            onClick={() => navigate('/dashboard/master/unit-pendidikan')}
            className="text-slate-400 hover:text-emerald-600 cursor-pointer"
          >
            <Eye className="size-4" />
          </Button>
        ),
      },
    ],
    [navigate]
  )

  // Pie chart data preparation - strictly database values (zero hardcodes)
  const staffPieData = useMemo(() => {
    const guruCount = kpis.total_teachers?.total ?? 0
    const totalEmployeeCount = kpis.total_employees?.total ?? 0
    const nonGuruTendik = Math.max(0, totalEmployeeCount - guruCount)

    if (guruCount === 0 && nonGuruTendik === 0) {
      return [
        { name: 'Guru Pendidik', value: 0 },
        { name: 'Pegawai & Tendik', value: 0 },
      ]
    }
    return [
      { name: 'Guru Pendidik', value: guruCount },
      { name: 'Pegawai & Tendik', value: nonGuruTendik },
    ]
  }, [kpis])

  // Welcome role display name
  const welcomeRoleName = useMemo(() => {
    return getUserRoleLevel(currentUser) === 1 ? 'Super Admin' : 'Admin Sistem'
  }, [currentUser])

  if (isLoading && !data) return <SkeletonDashboard />
  if (isError && !data) {
    return (
      <ErrorState
        message={queryError?.response?.data?.message || 'Gagal memuat data dashboard.'}
        onRetry={() => refetch()}
      />
    )
  }

  // ── 5. KARTU METRIK UTAMA (PRIMARY KPIS) ──
  const primaryCards = [
    {
      title: 'Total Unit Pendidikan',
      formattedValue: formatAngka(kpis.total_units?.total),
      icon: Building2,
      tone: 'emerald',
      modalKey: 'total_units',
      badgeText: 'Terdaftar',
      subtext: 'Unit Sekolah Terdata',
    },
    {
      title: 'Unit Sekolah Aktif',
      formattedValue: formatAngka(kpis.active_units?.total),
      icon: School,
      tone: 'sky',
      modalKey: 'active_units',
      badgeText: 'Aktif',
      subtext: 'Operasional Berjalan',
    },
    {
      title: 'Total Pegawai & Tendik',
      formattedValue: formatAngka(kpis.total_employees?.total),
      icon: UserCheck,
      tone: 'violet',
      modalKey: 'total_employees',
      badgeText: 'SDM Staf',
      subtext: 'Tenaga Kependidikan',
    },
    {
      title: 'Total Guru Pengajar',
      formattedValue: formatAngka(kpis.total_teachers?.total),
      icon: GraduationCap,
      tone: 'indigo',
      modalKey: 'total_teachers',
      badgeText: 'Pendidik',
      subtext: 'Guru Aktif Mengajar',
    },
    {
      title: 'Total Siswa Aktif',
      formattedValue: formatAngka(kpis.total_students?.total),
      icon: Users,
      tone: 'amber',
      modalKey: 'total_students',
      badgeText: 'Siswa',
      subtext: 'Peserta Didik Aktif',
    },
  ]

  // ── 6. KARTU METRIK SEKUNDER (SECONDARY KPIS) ──
  const secondaryCards = [
    {
      title: 'Total Orang Tua / Wali',
      formattedValue: formatAngka(kpis.total_parents?.total),
      icon: HeartHandshake,
      tone: 'rose',
      modalKey: 'total_parents',
      badgeText: 'Wali',
      subtext: 'Keluarga Siswa',
    },
    {
      title: 'Total Rombel / Kelas',
      formattedValue: formatAngka(kpis.total_rombel?.total || kpis.total_classes?.total),
      icon: Layers,
      tone: 'sky',
      modalKey: 'total_rombel',
      badgeText: 'Rombel',
      subtext: 'Rombongan Belajar',
    },
    {
      title: 'Pengguna Sistem Aktif',
      formattedValue: formatAngka(kpis.active_users?.total),
      icon: ShieldCheck,
      tone: 'emerald',
      modalKey: 'active_users',
      badgeText: 'User System',
      subtext: 'Akun Terverifikasi',
    },
    {
      title: 'Role Spatie Terdaftar',
      formattedValue: formatAngka(kpis.active_roles?.total),
      icon: Key,
      tone: 'indigo',
      modalKey: 'active_roles',
      badgeText: 'Spatie Roles',
      subtext: 'Peran Otoritas Hak Akses',
    },
    {
      title: 'User Tanpa Role',
      formattedValue: formatAngka(kpis.users_without_role?.total),
      icon: UserX,
      tone: 'rose',
      modalKey: 'users_without_role',
      badgeText: 'Perlu Action',
      subtext: 'Belum Ada Penugasan Peran',
    },
  ]

  return (
    <PageContainer maxW="7xl">
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="space-y-6 pb-12"
      >
        {/* 1. Breadcrumbs Navigation & Modern Vivid Hero Card Header */}
        <motion.div variants={itemVariants} className="space-y-4">
          <AppBreadcrumb items={[{ label: `Dashboard Utama ${welcomeRoleName}` }]} />

          {/* Header Halaman Modern Hero Card HeroUI */}
          <HeroUiHeader
            icon={ShieldCheck}
            title={`Dashboard Utama ${welcomeRoleName}`}
            tag={{ text: welcomeRoleName, icon: Sparkles }}
            description="Pusat kendali dan pemantauan terpadu seluruh unit pendidikan, aktivitas operasional, dan metrik sistem sekolah."
            actions={
              <AppButton
                variant="outline"
                size="sm"
                icon={RefreshCw}
                pending={isLoading}
                onClick={() => refetch()}
                className="w-full sm:w-auto text-xs font-bold text-emerald-800 dark:text-emerald-200 border-emerald-300 dark:border-emerald-700 hover:bg-emerald-100 dark:hover:bg-emerald-950/80 cursor-pointer shadow-2xs"
              >
                Segarkan Data
              </AppButton>
            }
          />
        </motion.div>

        {/* 2. Operational Alert Section (TailGrids Alert) */}
        <motion.div variants={itemVariants}>
          <Alert
            status={kpis.users_without_role?.total > 0 ? 'warning' : 'info'}
            className={
              kpis.users_without_role?.total > 0
                ? 'border-amber-300/80 bg-amber-50/70 dark:border-amber-700/50 dark:bg-amber-950/30'
                : 'border-emerald-300/80 bg-emerald-50/70 dark:border-emerald-700/50 dark:bg-emerald-950/30'
            }
          >
            <AlertIndicator />
            <AlertContent>
              <AlertTitle className="text-xs sm:text-sm font-black text-slate-900 dark:text-white">
                {kpis.users_without_role?.total > 0
                  ? 'Perhatian Administrasi Hak Akses Sistem'
                  : 'Integritas Operasional & Sistem Terverifikasi'}
              </AlertTitle>
              <AlertDescription className="text-xs text-slate-700 dark:text-slate-300">
                {kpis.users_without_role?.total > 0
                  ? `Terdapat ${kpis.users_without_role?.total} pengguna sistem yang belum memiliki penetapan peran (role). Klik kartu 'User Tanpa Role' untuk meninjau dan menetapkan hak akses.`
                  : `Seluruh ${formatAngka(kpis.total_units?.total)} unit sekolah dan ${formatAngka(kpis.total_employees?.total)} pegawai aktif terhubung dengan aman ke sistem manajemen terpadu.`}
              </AlertDescription>
            </AlertContent>
          </Alert>
        </motion.div>

        {/* 3. Primary KPI Summary Cards (5-Card Grid ModernKpiCard) */}
        <motion.div variants={itemVariants} className="space-y-2.5">
          <div className="flex flex-col xs:flex-row xs:items-center justify-between gap-1 sm:gap-2">
            <h2 className="text-xs sm:text-sm font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Zap className="size-4 text-emerald-600 dark:text-emerald-400" />
              Metrik Utama Sistem & Unit Sekolah
            </h2>
            <span className="text-[10px] sm:text-xs text-slate-400 font-bold">Updated Realtime</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
            {primaryCards.map((card) => (
              <ModernKpiCard
                key={card.title}
                card={card}
                onClick={() => setActiveModal(card.modalKey)}
              />
            ))}
          </div>
        </motion.div>

        {/* 4. Secondary KPI Grid (5-Card Grid ModernKpiCard) */}
        <motion.div variants={itemVariants} className="space-y-2.5">
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
            {secondaryCards.map((card) => (
              <ModernKpiCard
                key={card.title}
                card={card}
                onClick={() => setActiveModal(card.modalKey)}
              />
            ))}
          </div>
        </motion.div>

        {/* 5. Recent Logins Section (Audit User Login Terbaru) */}
        <motion.div variants={itemVariants}>
          <div className="relative overflow-hidden rounded-[22px] border-2 border-emerald-500/25 bg-white shadow-md shadow-emerald-500/5 dark:border-emerald-600/35 dark:bg-[#1B2433]">
            <div className="flex items-center justify-between border-b border-emerald-500/20 bg-gradient-to-r from-emerald-500/10 via-teal-500/5 to-transparent px-5 py-4 dark:border-emerald-800/40 dark:bg-gradient-to-r dark:from-emerald-950/50 dark:via-teal-950/30 dark:to-transparent">
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

            <div className="p-5 sm:p-6">
              {recentLogins.length === 0 ? (
                <div className="text-center py-6 text-slate-400 text-xs font-medium">
                  Belum ada data sesi login user terbaru.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3.5">
                  {recentLogins.slice(0, 8).map((userItem, idx) => (
                    <div
                      key={userItem.event_id || userItem.id ? `${userItem.event_id || userItem.id}-${idx}` : idx}
                      role="button"
                      tabIndex={0}
                      title={`Klik untuk melihat audit rincian sesi masuk ${userItem.name}`}
                      onClick={() => setSelectedLoginAudit(userItem)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault()
                          setSelectedLoginAudit(userItem)
                        }
                      }}
                      className="relative overflow-hidden flex items-center gap-3 p-3.5 rounded-2xl border border-emerald-500/20 dark:border-slate-800/80 bg-slate-50/70 dark:bg-slate-900/50 hover:bg-white dark:hover:bg-slate-800/80 hover:border-emerald-500/50 hover:shadow-md hover:shadow-emerald-500/10 transition-all duration-200 cursor-pointer group active:scale-[0.98]"
                    >
                      <div className="size-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 text-white flex items-center justify-center font-black text-xs shrink-0 shadow-sm group-hover:scale-105 transition-transform">
                        {(userItem.name || 'U').substring(0, 2).toUpperCase()}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-1">
                          <p className="font-extrabold text-slate-800 dark:text-slate-100 text-xs truncate group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                            {userItem.name}
                          </p>
                          <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 shrink-0">
                            {userItem.role || 'Pengguna'}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-400 truncate mt-0.5">
                          {userItem.email}
                        </p>
                        <div className="flex items-center justify-between mt-1.5 pt-1.5 border-t border-slate-200/60 dark:border-slate-800/60">
                          <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium truncate">
                            {userItem.created_at || 'Baru saja'}
                          </span>
                          <span className="text-[10px] font-extrabold text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform shrink-0 ml-1">
                            Audit &rarr;
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* 6. 3-Column Equal Grid Section (Filter + Bar Chart + Donut Chart) */}
        <motion.div variants={itemVariants}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-stretch">
            {/* Column 1: Panel Filter Laporan & System */}
            <article className="relative overflow-hidden rounded-[22px] border-2 border-emerald-500/25 bg-white shadow-md shadow-emerald-500/5 dark:border-emerald-600/35 dark:bg-[#1B2433] flex flex-col justify-between h-full">
              <div>
                <div className="flex items-center justify-between border-b border-emerald-500/20 bg-gradient-to-r from-emerald-500/10 via-teal-500/5 to-transparent px-5 py-4 dark:border-emerald-800/40">
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

                <div className="p-5 space-y-3">
                  {/* Dropdown Unit Pendidikan (Dari Database) */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Pilihan Unit Sekolah
                    </label>
                    <select
                      value={selectedUnit}
                      onChange={(e) => {
                        setSelectedUnit(e.target.value)
                        setPage(1)
                      }}
                      className="w-full h-9 px-3 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100 dark:focus:ring-emerald-900/30 transition"
                    >
                      <option value="semua">Semua Unit Pendidikan ({availableUnits.length} Unit)</option>
                      {availableUnits.map((unit) => (
                        <option key={unit.id} value={unit.id}>
                          {unit.name} ({unit.code})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Dropdown Tahun Ajaran (Dari Database) */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Tahun Ajaran
                    </label>
                    <select
                      value={selectedAcademicYear}
                      onChange={(e) => {
                        setSelectedAcademicYear(e.target.value)
                        setPage(1)
                      }}
                      className="w-full h-9 px-3 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100 dark:focus:ring-emerald-900/30 transition"
                    >
                      <option value="semua">Semua Tahun Ajaran</option>
                      {availableAcademicYears.map((year) => (
                        <option key={year.id} value={year.id}>
                          {year.name} {year.is_active ? '(Aktif)' : ''}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Dropdown Semester (Dari Database) */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Semester Akademik
                    </label>
                    <select
                      value={selectedSemester}
                      onChange={(e) => {
                        setSelectedSemester(e.target.value)
                        setPage(1)
                      }}
                      className="w-full h-9 px-3 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100 dark:focus:ring-emerald-900/30 transition"
                    >
                      <option value="semua">Semua Semester</option>
                      {availableSemesters.map((sem) => (
                        <option key={sem.id} value={sem.id}>
                          {sem.name} {sem.is_active ? '(Aktif)' : ''}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Dropdown Periode Waktu */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Periode Analisis Data
                    </label>
                    <select
                      value={periodOption}
                      onChange={(e) => {
                        setPeriodOption(e.target.value)
                        setPage(1)
                      }}
                      className="w-full h-9 px-3 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100 dark:focus:ring-emerald-900/30 transition"
                    >
                      <option value="hari">Hari Ini</option>
                      <option value="minggu">7 Hari Terakhir (Default)</option>
                      <option value="bulan">Bulan Ini</option>
                      <option value="semester">6 Bulan Terakhir</option>
                      <option value="tahun">Tahun Ini</option>
                    </select>
                  </div>

                  {/* Dropdown Status Unit */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Status Operasional Unit
                    </label>
                    <select
                      value={selectedStatus}
                      onChange={(e) => {
                        setSelectedStatus(e.target.value)
                        setPage(1)
                      }}
                      className="w-full h-9 px-3 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100 dark:focus:ring-emerald-900/30 transition"
                    >
                      <option value="semua">Semua Status Operasional</option>
                      <option value="aktif">Aktif Operasional</option>
                      <option value="nonaktif">Non-Aktif</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="p-5 pt-3 border-t border-slate-100 dark:border-slate-800/80">
                <p className="text-[11px] text-slate-400 font-medium leading-relaxed">
                  Gunakan filter di atas untuk mempersempit ringkasan statistik dan daftar unit sekolah terdaftar pada tabel.
                </p>
              </div>
            </article>

            {/* Column 2: Grafik Tren Utama Kesiswaan per Unit */}
            <article className="relative overflow-hidden rounded-[22px] border-2 border-emerald-500/25 bg-white shadow-md shadow-emerald-500/5 dark:border-emerald-600/35 dark:bg-[#1B2433] flex flex-col justify-between h-full">
              <div>
                <div className="flex items-center justify-between border-b border-emerald-500/20 bg-gradient-to-r from-emerald-500/10 via-teal-500/5 to-transparent px-5 py-4 dark:border-emerald-800/40">
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

                <div className="h-56 w-full p-4 pt-3">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={charts.student_distribution || []}>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                      <XAxis dataKey="name" stroke="#888888" fontSize={11} />
                      <YAxis stroke="#888888" fontSize={11} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#0F172A',
                          borderColor: '#334155',
                          borderRadius: '14px',
                          color: '#F8FAFC',
                          fontSize: '12px',
                        }}
                      />
                      <Bar dataKey="total" fill="#059669" radius={[6, 6, 0, 0]} name="Siswa Aktif" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="flex items-center justify-between p-5 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs font-bold text-slate-500">
                <span>Total Unit Terdaftar</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-extrabold">
                  {unitSummaries.length} Unit Sekolah
                </span>
              </div>
            </article>

            {/* Column 3: Grafik Donut Komposisi SDM & Pegawai */}
            <article className="relative overflow-hidden rounded-[22px] border-2 border-emerald-500/25 bg-white shadow-md shadow-emerald-500/5 dark:border-emerald-600/35 dark:bg-[#1B2433] flex flex-col justify-between h-full">
              <div>
                <div className="flex items-center justify-between border-b border-emerald-500/20 bg-gradient-to-r from-emerald-500/10 via-teal-500/5 to-transparent px-5 py-4 dark:border-emerald-800/40">
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

                <div className="h-56 w-full relative flex items-center justify-center p-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={staffPieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={48}
                        outerRadius={74}
                        paddingAngle={4}
                        dataKey="value"
                      >
                        {staffPieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#0F172A',
                          borderColor: '#334155',
                          borderRadius: '14px',
                          color: '#F8FAFC',
                          fontSize: '12px',
                        }}
                      />
                      <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '11px' }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="flex items-center justify-between p-5 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs font-bold text-slate-500">
                <span>Total SDM Terdaftar</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-extrabold">
                  {formatAngka(kpis.total_employees?.total)} Personel
                </span>
              </div>
            </article>
          </div>
        </motion.div>

        {/* 7. Quick Action Navigation Bar (Soft Squircle Action Buttons) */}
        <motion.div variants={itemVariants}>
          <section className="relative overflow-hidden rounded-[22px] border-2 border-emerald-500/25 bg-white shadow-md shadow-emerald-500/5 dark:border-emerald-600/35 dark:bg-[#1B2433] p-5">
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
                  variant="create"
                  icon={Building2}
                  label="Tambah Unit"
                  onClick={() => navigate('/dashboard/master/unit-pendidikan')}
                />
                <SquircleActionButton
                  variant="import"
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

        {/* 8. Master Datatable Menggunakan Komponen Standar Resmi AppDataTable */}
        <motion.div variants={itemVariants}>
          <AppDataTable
            title="Ringkasan Master Unit Pendidikan"
            description="Daftar unit sekolah Islam terpadu beserta status operasional dan statistik kesiswaan & pendidik."
            columns={unitTableColumns}
            data={filteredUnits}
            countLabel={`${filteredUnits.length} Unit`}
            searchableKeys={['name', 'code', 'status']}
            search={searchQuery}
            onSearchChange={setSearchQuery}
            searchPlaceholder="Cari nama unit pendidikan atau kode unit..."
            clientPagination={true}
            clientPageSize={pageSize}
            isLoading={isLoading}
            density="compact"
            actions={
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate('/dashboard/master/unit-pendidikan')}
                  className="rounded-xl border border-emerald-300 bg-emerald-50 text-xs font-bold text-emerald-800 shadow-2xs hover:bg-emerald-100 dark:border-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-300 cursor-pointer"
                >
                  Kelola Semua &rarr;
                </Button>
              </div>
            }
            filters={
              <div className="flex flex-wrap items-center gap-2.5">
                <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">Status Operasional:</span>
                <div className="flex items-center gap-1.5">
                  {[
                    { id: 'semua', label: 'Semua' },
                    { id: 'aktif', label: 'Aktif' },
                    { id: 'nonaktif', label: 'Non-Aktif' },
                  ].map((st) => (
                    <button
                      key={st.id}
                      type="button"
                      onClick={() => setSelectedStatus(st.id)}
                      className={`rounded-xl px-3 py-1 text-xs font-bold transition-all cursor-pointer ${
                        selectedStatus === st.id
                          ? 'bg-emerald-700 text-white shadow-xs'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
                      }`}
                    >
                      {st.label}
                    </button>
                  ))}
                </div>
              </div>
            }
            hasActiveFilters={selectedStatus !== 'semua' || selectedUnit !== 'semua' || Boolean(searchQuery)}
            onResetFilters={resetFilter}
            emptyTitle="Tidak ada data unit sekolah"
            emptyDescription="Tidak ada data unit sekolah yang sesuai dengan filter atau kata kunci pencarian."
          />
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

        {/* 10. Modal Audit Rincian Sesi Masuk User (HeroUI Modal) */}
        {selectedLoginAudit && (
          <Modal
            isOpen={Boolean(selectedLoginAudit)}
            onClose={() => setSelectedLoginAudit(null)}
            title="Audit Rincian Sesi Masuk Pengguna"
            description="Informasi autentikasi pengguna, hak akses, alamat IP, dan perangkat sesi aktif"
            maxWidth="max-w-xl"
            footer={
              <div className="flex items-center justify-between w-full">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedLoginAudit(null)}
                  className="rounded-xl font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Tutup
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => {
                    setSelectedLoginAudit(null)
                    navigate('/dashboard/master/hak-akses')
                  }}
                  className="rounded-xl font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
                >
                  Lihat Hak Akses &rarr;
                </Button>
              </div>
            }
          >
            <div className="space-y-4">
              {/* Header Profil User */}
              <div className="flex items-center gap-4 p-4 rounded-2xl bg-gradient-to-r from-emerald-50/80 via-teal-50/40 to-slate-50/80 dark:from-emerald-950/40 dark:via-teal-950/20 dark:to-slate-900/60 border border-emerald-500/20">
                <div className="size-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-700 text-white font-black text-lg flex items-center justify-center shadow-md shrink-0">
                  {(selectedLoginAudit.name || 'U').substring(0, 2).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="text-base font-extrabold text-slate-900 dark:text-white truncate">
                      {selectedLoginAudit.name}
                    </h4>
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700">
                      Akun Aktif
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium truncate mt-0.5">
                    {selectedLoginAudit.email}
                  </p>
                  <p className="text-[11px] text-slate-400 truncate mt-0.5">
                    No. Telepon: {selectedLoginAudit.phone || '-'}
                  </p>
                </div>
              </div>

              {/* Matrix Data Audit */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/50">
                  <span className="text-[11px] font-bold text-slate-400 block mb-1">Role Utama</span>
                  <span className="font-extrabold text-slate-800 dark:text-slate-200 text-sm">
                    {selectedLoginAudit.role || 'Pengguna'}
                  </span>
                </div>
                <div className="p-3 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/50">
                  <span className="text-[11px] font-bold text-slate-400 block mb-1">Unit Pendidikan</span>
                  <span className="font-extrabold text-slate-800 dark:text-slate-200 text-sm">
                    {selectedLoginAudit.unit_name || 'Semua Unit'}
                  </span>
                </div>
                <div className="p-3 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/50">
                  <span className="text-[11px] font-bold text-slate-400 block mb-1">Waktu Masuk Sesi</span>
                  <span className="font-extrabold text-emerald-600 dark:text-emerald-400 block">
                    {selectedLoginAudit.exact_time || selectedLoginAudit.created_at}
                  </span>
                  <span className="text-[10px] text-slate-400">({selectedLoginAudit.created_at})</span>
                </div>
                <div className="p-3 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/50">
                  <span className="text-[11px] font-bold text-slate-400 block mb-1">Alamat IP & Keamanan</span>
                  <code className="px-2 py-0.5 rounded-md font-mono bg-slate-100 dark:bg-slate-800 font-bold text-slate-800 dark:text-slate-200 text-xs">
                    {selectedLoginAudit.ip_address || '127.0.0.1'}
                  </code>
                </div>
                <div className="p-3 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/50">
                  <span className="text-[11px] font-bold text-slate-400 block mb-1">Portal / Saluran Masuk</span>
                  <span className="font-semibold text-slate-700 dark:text-slate-300 uppercase text-[11px]">
                    {selectedLoginAudit.portal_type || 'Unified Web Dashboard'}
                  </span>
                </div>
                <div className="p-3 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/50">
                  <span className="text-[11px] font-bold text-slate-400 block mb-1">Metode Autentikasi</span>
                  <span className="font-semibold text-slate-700 dark:text-slate-300 capitalize text-[11px]">
                    {selectedLoginAudit.login_method || 'Password'}
                  </span>
                </div>
              </div>

              {/* Seluruh Role Terdaftar */}
              {Array.isArray(selectedLoginAudit.roles) && selectedLoginAudit.roles.length > 0 && (
                <div className="p-3 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/30">
                  <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 block mb-1.5">
                    Seluruh Role Terdaftar ({selectedLoginAudit.roles.length}):
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedLoginAudit.roles.map((r) => (
                      <span
                        key={r}
                        className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 shadow-2xs"
                      >
                        {r}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* User Agent / Client Info */}
              <div className="p-3 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 text-[11px] text-slate-500 dark:text-slate-400 flex items-start gap-2">
                <span className="font-bold text-slate-700 dark:text-slate-300 shrink-0">User Agent:</span>
                <span className="font-mono text-[10px] break-all">
                  {selectedLoginAudit.user_agent || 'Mozilla/5.0 (Client Session)'}
                </span>
              </div>
            </div>
          </Modal>
        )}
      </motion.div>
    </PageContainer>
  )
}
