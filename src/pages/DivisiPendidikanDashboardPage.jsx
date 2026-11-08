import React, { useState, useEffect, useMemo, useRef } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
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
  Languages,
  Sparkles,
  ChevronUp,
  X,
  ExternalLink,
  RefreshCcw,
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
import { SquircleActionButton } from '../components/master-data'
import { Button } from '../components/ui/button'
import HeroUiFilterSelect from '../components/ui/HeroUiFilterSelect'

import ChartCard from '../components/dashboard/ChartCard'
import SkeletonDashboard from '../components/dashboard/SkeletonDashboard'
import ErrorState from '../components/dashboard/ErrorState'
import StudentAchievementRecapSection from '../components/dashboard/StudentAchievementRecapSection'
import DivisiPendidikanKpiModal from '../components/DivisiPendidikanKpiModal'

import SupervisiKbmSection from '../components/divisi/SupervisiKbmSection'
import KurasiBankSoalSection from '../components/divisi/KurasiBankSoalSection'
import MunaqasyahTahfizhSection from '../components/divisi/MunaqasyahTahfizhSection'
import PembiasaanBahasaSection from '../components/divisi/PembiasaanBahasaSection'
import PelatihanGuruSection from '../components/divisi/PelatihanGuruSection'
import ReviewLaporanBulananSection from '../components/divisi/ReviewLaporanBulananSection'
import RadarAkreditasiSection from '../components/divisi/RadarAkreditasiSection'
import DisciplineSupervisionSection from '../components/divisi/DisciplineSupervisionSection'
import { Scale } from 'lucide-react'

import { managementDashboardService } from '../services/managementDashboardService'
import { educationUnitService } from '../services/educationUnitService'
import { useAuthStore } from '../stores/authStore'
import { hasAnyRole, getUserRoleLevel, ROLE_LEVELS, ROLES } from '../auth/portalResolver'

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

const WORKSPACE_MODULES = [
  {
    key: 'supervisi-kbm',
    label: 'Supervisi KBM',
    fullTitle: 'Supervisi Kelas & Pembelajaran (KBM)',
    tag: 'KBM',
    icon: GraduationCap,
    tone: 'emerald',
    subtext: 'Monitoring instrumen supervisi mengajar dan kinerja guru di kelas',
  },
  {
    key: 'kurasi-soal',
    label: 'Kurasi Soal',
    fullTitle: 'Kurasi Bank Soal & Kisi-Kisi Ujian',
    tag: 'UJIAN',
    icon: BookOpen,
    tone: 'purple',
    subtext: 'Validasi & penelaahan naskah soal ujian bersama antar unit',
  },
  {
    key: 'tahfizh-munaqasyah',
    label: 'Munaqasyah Tahfizh',
    fullTitle: 'Munaqasyah & Sertifikasi Tahfizh Santri',
    tag: 'TAHFIZH',
    icon: Award,
    tone: 'amber',
    subtext: 'Ujian kelayakan juz, tasmi akbar, dan penerbitan syahadah santri',
  },
  {
    key: 'bahasa-mufradat',
    label: 'Program Bahasa',
    fullTitle: 'Program Pembiasaan Bahasa (Arab & Inggris)',
    tag: 'BILINGUAL',
    icon: Languages,
    tone: 'sky',
    subtext: 'Distribusi mufradat mingguan dan pengawasan pembiasaan bilingual',
  },
  {
    key: 'pelatihan-guru',
    label: 'Pelatihan Guru',
    fullTitle: 'Pelatihan Guru & Upgrading SDM Pendidik',
    tag: 'UPGRADING',
    icon: Sparkles,
    tone: 'pink',
    subtext: 'Rekap jam pelatihan pendidik (JP) dan workshop kurikulum terpadu',
  },
  {
    key: 'revisi-laporan',
    label: 'Review Laporan',
    fullTitle: 'Review Laporan Bulanan Kepala Sekolah',
    tag: 'AUDIT',
    icon: FileCheck,
    tone: 'rose',
    subtext: 'Verifikasi, catatan perbaikan, dan persetujuan laporan bulanan kepsek',
  },
  {
    key: 'radar-akreditasi',
    label: 'Radar Akreditasi',
    fullTitle: 'Radar Akreditasi & 8 Standar Nasional',
    tag: 'STANDAR',
    icon: ShieldCheck,
    tone: 'cyan',
    subtext: 'Pemetaan kesiapan instrumen akreditasi 8 SNP di seluruh unit',
  },
  {
    key: 'supervisi-disiplin',
    label: 'Supervisi Disiplin',
    fullTitle: 'Supervisi Kepatuhan Tata Tertib & Benchmarking Lintas Unit',
    tag: 'DISIPLIN',
    icon: Scale,
    tone: 'emerald',
    subtext: 'Benchmarking rasio kepatuhan adab santri, audit penanganan SP, dan 4 kluster tata tertib TU',
  },
]

const MODULE_THEMES = {
  emerald: {
    inactive: 'bg-emerald-50/90 hover:bg-emerald-100/90 text-emerald-950 border-emerald-300/80 hover:border-emerald-400 dark:bg-emerald-950/40 dark:text-emerald-200 dark:border-emerald-700/60 dark:hover:bg-emerald-900/60 shadow-xs shadow-emerald-500/5',
    iconInactive: 'text-emerald-600 dark:text-emerald-400',
    iconBgInactive: 'bg-emerald-100/80 dark:bg-emerald-900/60',
    active: 'bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 text-white ring-2 ring-emerald-400 shadow-md shadow-emerald-600/35 scale-[1.02]',
    badgeInactive: 'bg-emerald-200/70 text-emerald-900 dark:bg-emerald-900/80 dark:text-emerald-200 border border-emerald-300/60 dark:border-emerald-700/60',
    badgeActive: 'bg-white/25 text-white border border-white/30',
    topStripe: 'from-emerald-500 via-teal-400 to-emerald-600',
    heroIcon: 'from-emerald-500 via-emerald-600 to-teal-700 shadow-emerald-600/30',
  },
  purple: {
    inactive: 'bg-purple-50/90 hover:bg-purple-100/90 text-purple-950 border-purple-300/80 hover:border-purple-400 dark:bg-purple-950/40 dark:text-purple-200 dark:border-purple-700/60 dark:hover:bg-purple-900/60 shadow-xs shadow-purple-500/5',
    iconInactive: 'text-purple-600 dark:text-purple-400',
    iconBgInactive: 'bg-purple-100/80 dark:bg-purple-900/60',
    active: 'bg-gradient-to-r from-purple-600 via-violet-600 to-indigo-700 text-white ring-2 ring-purple-400 shadow-md shadow-purple-600/35 scale-[1.02]',
    badgeInactive: 'bg-purple-200/70 text-purple-900 dark:bg-purple-900/80 dark:text-purple-200 border border-purple-300/60 dark:border-purple-700/60',
    badgeActive: 'bg-white/25 text-white border border-white/30',
    topStripe: 'from-purple-500 via-violet-400 to-indigo-600',
    heroIcon: 'from-purple-500 via-violet-600 to-indigo-700 shadow-purple-600/30',
  },
  amber: {
    inactive: 'bg-amber-50/90 hover:bg-amber-100/90 text-amber-950 border-amber-300/80 hover:border-amber-400 dark:bg-amber-950/40 dark:text-amber-200 dark:border-amber-700/60 dark:hover:bg-amber-900/60 shadow-xs shadow-amber-500/5',
    iconInactive: 'text-amber-600 dark:text-amber-400',
    iconBgInactive: 'bg-amber-100/80 dark:bg-amber-900/60',
    active: 'bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-white ring-2 ring-amber-400 shadow-md shadow-amber-500/35 scale-[1.02]',
    badgeInactive: 'bg-amber-200/70 text-amber-900 dark:bg-amber-900/80 dark:text-amber-200 border border-amber-300/60 dark:border-amber-700/60',
    badgeActive: 'bg-white/25 text-white border border-white/30',
    topStripe: 'from-amber-500 via-orange-400 to-amber-600',
    heroIcon: 'from-amber-500 via-orange-600 to-amber-700 shadow-amber-600/30',
  },
  sky: {
    inactive: 'bg-sky-50/90 hover:bg-sky-100/90 text-sky-950 border-sky-300/80 hover:border-sky-400 dark:bg-sky-950/40 dark:text-sky-200 dark:border-sky-700/60 dark:hover:bg-sky-900/60 shadow-xs shadow-sky-500/5',
    iconInactive: 'text-sky-600 dark:text-sky-400',
    iconBgInactive: 'bg-sky-100/80 dark:bg-sky-900/60',
    active: 'bg-gradient-to-r from-sky-500 via-blue-600 to-indigo-600 text-white ring-2 ring-sky-400 shadow-md shadow-sky-500/35 scale-[1.02]',
    badgeInactive: 'bg-sky-200/70 text-sky-900 dark:bg-sky-900/80 dark:text-sky-200 border border-sky-300/60 dark:border-sky-700/60',
    badgeActive: 'bg-white/25 text-white border border-white/30',
    topStripe: 'from-sky-500 via-blue-400 to-indigo-600',
    heroIcon: 'from-sky-500 via-blue-600 to-indigo-700 shadow-sky-600/30',
  },
  pink: {
    inactive: 'bg-pink-50/90 hover:bg-pink-100/90 text-pink-950 border-pink-300/80 hover:border-pink-400 dark:bg-pink-950/40 dark:text-pink-200 dark:border-pink-700/60 dark:hover:bg-pink-900/60 shadow-xs shadow-pink-500/5',
    iconInactive: 'text-pink-600 dark:text-pink-400',
    iconBgInactive: 'bg-pink-100/80 dark:bg-pink-900/60',
    active: 'bg-gradient-to-r from-pink-500 via-rose-500 to-red-500 text-white ring-2 ring-pink-400 shadow-md shadow-pink-500/35 scale-[1.02]',
    badgeInactive: 'bg-pink-200/70 text-pink-900 dark:bg-pink-900/80 dark:text-pink-200 border border-pink-300/60 dark:border-pink-700/60',
    badgeActive: 'bg-white/25 text-white border border-white/30',
    topStripe: 'from-pink-500 via-rose-400 to-red-500',
    heroIcon: 'from-pink-500 via-rose-600 to-red-600 shadow-pink-600/30',
  },
  rose: {
    inactive: 'bg-rose-50/90 hover:bg-rose-100/90 text-rose-950 border-rose-300/80 hover:border-rose-400 dark:bg-rose-950/40 dark:text-rose-200 dark:border-rose-700/60 dark:hover:bg-rose-900/60 shadow-xs shadow-rose-500/5',
    iconInactive: 'text-rose-600 dark:text-rose-400',
    iconBgInactive: 'bg-rose-100/80 dark:bg-rose-900/60',
    active: 'bg-gradient-to-r from-rose-600 via-red-600 to-rose-700 text-white ring-2 ring-rose-400 shadow-md shadow-rose-600/35 scale-[1.02]',
    badgeInactive: 'bg-rose-200/70 text-rose-900 dark:bg-rose-900/80 dark:text-rose-200 border border-rose-300/60 dark:border-rose-700/60',
    badgeActive: 'bg-white/25 text-white border border-white/30',
    topStripe: 'from-rose-500 via-red-400 to-rose-600',
    heroIcon: 'from-rose-500 via-rose-600 to-red-700 shadow-rose-600/30',
  },
  cyan: {
    inactive: 'bg-cyan-50/90 hover:bg-cyan-100/90 text-cyan-950 border-cyan-300/80 hover:border-cyan-400 dark:bg-cyan-950/40 dark:text-cyan-200 dark:border-cyan-700/60 dark:hover:bg-cyan-900/60 shadow-xs shadow-cyan-500/5',
    iconInactive: 'text-cyan-600 dark:text-cyan-400',
    iconBgInactive: 'bg-cyan-100/80 dark:bg-cyan-900/60',
    active: 'bg-gradient-to-r from-teal-500 via-cyan-600 to-blue-600 text-white ring-2 ring-cyan-400 shadow-md shadow-cyan-500/35 scale-[1.02]',
    badgeInactive: 'bg-cyan-200/70 text-cyan-900 dark:bg-cyan-900/80 dark:text-cyan-200 border border-cyan-300/60 dark:border-cyan-700/60',
    badgeActive: 'bg-white/25 text-white border border-white/30',
    topStripe: 'from-teal-500 via-cyan-400 to-blue-500',
    heroIcon: 'from-teal-500 via-cyan-600 to-blue-700 shadow-cyan-600/30',
  },
}

const MODERN_CARD_TONES = {
  emerald: {
    card: 'border-emerald-300/80 bg-gradient-to-br from-emerald-50/70 via-teal-50/40 to-white hover:border-emerald-400 hover:shadow-emerald-500/10 dark:border-emerald-700/60 dark:from-emerald-950/40 dark:via-teal-950/20 dark:to-[#1B2433]',
    badgeBg: 'bg-emerald-500/10 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300 border-emerald-500/30',
    iconGradient: 'from-emerald-500 via-emerald-600 to-teal-700 shadow-emerald-500/25',
    glow: 'bg-emerald-500/20 group-hover:bg-emerald-500/30',
    title: 'text-emerald-800 dark:text-emerald-300',
    value: 'text-emerald-950 dark:text-emerald-100',
    subtext: 'text-emerald-700/80 dark:text-emerald-400/80',
    cta: 'text-emerald-600 dark:text-emerald-400',
  },
  sky: {
    card: 'border-sky-300/80 bg-gradient-to-br from-sky-50/70 via-blue-50/40 to-white hover:border-sky-400 hover:shadow-sky-500/10 dark:border-sky-700/60 dark:from-sky-950/40 dark:via-blue-950/20 dark:to-[#1B2433]',
    badgeBg: 'bg-sky-500/10 text-sky-800 dark:bg-sky-500/20 dark:text-sky-300 border-sky-500/30',
    iconGradient: 'from-sky-500 via-blue-600 to-indigo-700 shadow-sky-500/25',
    glow: 'bg-sky-500/20 group-hover:bg-sky-500/30',
    title: 'text-sky-800 dark:text-sky-300',
    value: 'text-sky-950 dark:text-sky-100',
    subtext: 'text-sky-700/80 dark:text-sky-400/80',
    cta: 'text-sky-600 dark:text-sky-400',
  },
  purple: {
    card: 'border-purple-300/80 bg-gradient-to-br from-purple-50/70 via-violet-50/40 to-white hover:border-purple-400 hover:shadow-purple-500/10 dark:border-purple-700/60 dark:from-purple-950/40 dark:via-violet-950/20 dark:to-[#1B2433]',
    badgeBg: 'bg-purple-500/10 text-purple-800 dark:bg-purple-500/20 dark:text-purple-300 border-purple-500/30',
    iconGradient: 'from-purple-500 via-violet-600 to-indigo-700 shadow-purple-500/25',
    glow: 'bg-purple-500/20 group-hover:bg-purple-500/30',
    title: 'text-purple-800 dark:text-purple-300',
    value: 'text-purple-950 dark:text-purple-100',
    subtext: 'text-purple-700/80 dark:text-purple-400/80',
    cta: 'text-purple-600 dark:text-purple-400',
  },
  teal: {
    card: 'border-teal-300/80 bg-gradient-to-br from-teal-50/70 via-cyan-50/40 to-white hover:border-teal-400 hover:shadow-teal-500/10 dark:border-teal-700/60 dark:from-teal-950/40 dark:via-cyan-950/20 dark:to-[#1B2433]',
    badgeBg: 'bg-teal-500/10 text-teal-800 dark:bg-teal-500/20 dark:text-teal-300 border-teal-500/30',
    iconGradient: 'from-teal-500 via-teal-600 to-emerald-700 shadow-teal-500/25',
    glow: 'bg-teal-500/20 group-hover:bg-teal-500/30',
    title: 'text-teal-800 dark:text-teal-300',
    value: 'text-teal-950 dark:text-teal-100',
    subtext: 'text-teal-700/80 dark:text-teal-400/80',
    cta: 'text-teal-600 dark:text-teal-400',
  },
  rose: {
    card: 'border-rose-300/80 bg-gradient-to-br from-rose-50/70 via-pink-50/40 to-white hover:border-rose-400 hover:shadow-rose-500/10 dark:border-rose-700/60 dark:from-rose-950/40 dark:via-pink-950/20 dark:to-[#1B2433]',
    badgeBg: 'bg-rose-500/10 text-rose-800 dark:bg-rose-500/20 dark:text-rose-300 border-rose-500/30',
    iconGradient: 'from-rose-500 via-pink-600 to-red-700 shadow-rose-500/25',
    glow: 'bg-rose-500/20 group-hover:bg-rose-500/30',
    title: 'text-rose-800 dark:text-rose-300',
    value: 'text-rose-950 dark:text-rose-100',
    subtext: 'text-rose-700/80 dark:text-rose-400/80',
    cta: 'text-rose-600 dark:text-rose-400',
  },
  amber: {
    card: 'border-amber-300/80 bg-gradient-to-br from-amber-50/70 via-orange-50/40 to-white hover:border-amber-400 hover:shadow-amber-500/10 dark:border-amber-700/60 dark:from-amber-950/40 dark:via-orange-950/20 dark:to-[#1B2433]',
    badgeBg: 'bg-amber-500/10 text-amber-800 dark:bg-amber-500/20 dark:text-amber-300 border-amber-500/30',
    iconGradient: 'from-amber-500 via-orange-600 to-amber-700 shadow-amber-500/25',
    glow: 'bg-amber-500/20 group-hover:bg-amber-500/30',
    title: 'text-amber-800 dark:text-amber-300',
    value: 'text-amber-950 dark:text-amber-100',
    subtext: 'text-amber-700/80 dark:text-amber-400/80',
    cta: 'text-amber-600 dark:text-amber-400',
  },
}

function ModernKpiCard({ title, value, subtext, icon: Icon, tone = 'emerald', tag = 'METRIK', onClick }) {
  const t = MODERN_CARD_TONES[tone] || MODERN_CARD_TONES.emerald
  return (
    <motion.div
      whileHover={{ y: -3, transition: { duration: 0.2 } }}
      onClick={onClick}
      className={`group relative overflow-hidden rounded-[20px] border-2 p-4.5 sm:p-5 shadow-xs transition-all duration-300 hover:shadow-lg ${t.card} ${onClick ? 'cursor-pointer' : ''}`}
    >
      <div className={`pointer-events-none absolute -top-8 -right-8 h-28 w-28 rounded-full blur-2xl transition-all duration-500 ${t.glow}`} />
      <div className="relative z-10 flex items-start justify-between gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className={`inline-flex items-center rounded-md border px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider ${t.badgeBg}`}>
              {tag}
            </span>
          </div>
          <p className={`text-xs font-bold pt-0.5 ${t.title}`}>{title}</p>
        </div>
        <div className={`flex size-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br text-white shadow-md transition-transform duration-300 group-hover:scale-105 ${t.iconGradient}`}>
          {Icon && <Icon className="size-5 text-white" />}
        </div>
      </div>
      <div className="relative z-10 mt-3 flex items-baseline justify-between gap-2">
        <div>
          <p className={`text-2xl sm:text-3xl font-black tabular-nums tracking-tight ${t.value}`}>
            {value}
          </p>
          {subtext && (
            <p className={`mt-1 text-xs font-medium ${t.subtext}`}>{subtext}</p>
          )}
        </div>
      </div>
      {onClick && (
        <div className="relative z-10 mt-3.5 pt-2.5 border-t border-slate-200/50 dark:border-slate-800/60 flex items-center justify-between text-[11px] font-bold">
          <span className="text-slate-400 dark:text-slate-500 font-medium text-[10px]">Klik untuk detail</span>
          <span className={`inline-flex items-center gap-1 transition-transform group-hover:translate-x-0.5 ${t.cta}`}>
            Lihat Data &rarr;
          </span>
        </div>
      )}
    </motion.div>
  )
}

export default function DivisiPendidikanDashboardPage() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [data, setData] = useState(null)

  // Role Access & Multi-Unit Scope Handling
  const user = useAuthStore((state) => state.user)
  const userRoles = useMemo(() => {
    if (!user) return []
    if (Array.isArray(user.roles)) return user.roles.map((r) => (typeof r === 'string' ? r : r.name || ''))
    if (user.role) return [typeof user.role === 'string' ? user.role : user.role.name || '']
    return []
  }, [user])
  const userLevel = useMemo(() => getUserRoleLevel(user), [user])
  const isSuperAdminOrYayasan = userLevel <= ROLE_LEVELS.YAYASAN

  // Divisi Pendidikan can access and filter all units (or specific unit)
  const isDivisiPendidikan = useMemo(() => {
    if (isSuperAdminOrYayasan) return false
    return (
      userLevel === ROLE_LEVELS.DIVISI_PENDIDIKAN ||
      hasAnyRole(userRoles, ROLES.DIVISI) ||
      userRoles.some((r) => /divisi|bidang[\s_]*pendidikan|pengawasan[\s_]*akademik/i.test(r))
    )
  }, [userLevel, userRoles, isSuperAdminOrYayasan])

  // Can choose 'Semua Unit' and any education unit: Super Admin, Yayasan, Admin, and Divisi Pendidikan
  const canSelectUnit = isSuperAdminOrYayasan || isDivisiPendidikan
  const userUnitId = user?.unit_id || user?.education_unit_id || user?.employee?.unit_id || user?.metadata?.education_unit_id || user?.metadata?.unit_id || ''

  const [selectedUnitFilter, setSelectedUnitFilter] = useState(() => (!canSelectUnit && userUnitId ? String(userUnitId) : ''))

  useEffect(() => {
    if (!canSelectUnit && userUnitId && selectedUnitFilter !== String(userUnitId)) {
      setSelectedUnitFilter(String(userUnitId))
    }
  }, [canSelectUnit, userUnitId])

  // Units list pre-fetching with context fallback
  const [unitsList, setUnitsList] = useState([])

  useEffect(() => {
    educationUnitService.getDaftar({ per_page: 100 })
      .then((res) => {
        const items = res?.data || res || []
        if (Array.isArray(items)) setUnitsList(items)
      })
      .catch((e) => console.warn('Gagal memuat daftar unit pendidikan:', e))
  }, [])

  const allUnits = useMemo(() => {
    if (Array.isArray(data?.context?.units) && data.context.units.length > 0) {
      return data.context.units
    }
    return unitsList
  }, [data?.context?.units, unitsList])

  // In-Page Workspace State
  const tabParam = searchParams.get('tab') || ''
  const [activeWorkspaceTab, setActiveWorkspaceTab] = useState(tabParam)
  const workspaceRef = useRef(null)

  // Sync state if search param in URL changes
  useEffect(() => {
    if (tabParam !== activeWorkspaceTab) {
      setActiveWorkspaceTab(tabParam)
    }
  }, [tabParam])

  // State for KPI Pop-up Modal
  const [selectedKpiType, setSelectedKpiType] = useState(null)
  const [isKpiModalOpen, setIsKpiModalOpen] = useState(false)

  const handleKpiCardClick = (type) => {
    setSelectedKpiType(type)
    setIsKpiModalOpen(true)
  }

  const handleSelectTab = (key) => {
    setActiveWorkspaceTab(key)
    if (key) {
      setSearchParams({ tab: key }, { replace: true })
      setTimeout(() => {
        workspaceRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }, 100)
    } else {
      const nextParams = new URLSearchParams(searchParams)
      nextParams.delete('tab')
      setSearchParams(nextParams, { replace: true })
    }
  }

  const moduleOptions = useMemo(() => [
    {
      value: '',
      label: 'Ringkasan Dashboard Saja (Tutup Workspace)',
      subtext: 'Tutup panel in-page dan fokus pada metrik KPI utama',
    },
    ...WORKSPACE_MODULES.map((m) => ({
      value: m.key,
      label: m.fullTitle,
      subtext: m.subtext,
      badge: m.tag,
    })),
  ], [])

  const fetchDashboard = async (unitId = selectedUnitFilter) => {
    setLoading(true)
    setError(null)
    try {
      const params = {}
      if (unitId && unitId !== 'all') {
        params.unit_id = unitId
      }
      const res = await managementDashboardService.getDivisiPendidikan(params)
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
    fetchDashboard(selectedUnitFilter)
  }, [selectedUnitFilter])

  if (loading && !data) return <SkeletonDashboard />
  if (error && !data) return <ErrorState message={error} onRetry={fetchDashboard} />

  const kpis = data?.kpis || {}
  const context = data?.context || {}
  const charts = data?.charts || {}
  const tables = data?.tables || {}

  const formatNumber = (num) => (num !== undefined && num !== null ? Number(num).toLocaleString('id-ID') : '0')

  const activeModuleMeta = WORKSPACE_MODULES.find((m) => m.key === activeWorkspaceTab)

  return (
    <PageContainer maxW="7xl">
      <div className="mb-4 print:hidden">
        <AppBreadcrumb items={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Divisi Pendidikan' }]} />
      </div>

      <motion.div initial="hidden" animate="visible" variants={containerVariants} className="space-y-6 pb-12">
        {/* Header Halaman Modern Hero Card */}
        <motion.div variants={itemVariants} className="relative overflow-hidden rounded-[18px] sm:rounded-[22px] border-2 border-emerald-500/30 bg-gradient-to-r from-emerald-500/15 via-teal-500/10 to-emerald-600/15 p-3.5 sm:p-5 md:p-6 shadow-md shadow-emerald-500/10 dark:border-emerald-600/40 dark:bg-gradient-to-r dark:from-emerald-950/70 dark:via-teal-950/50 dark:to-slate-900">
          {/* Ambient Glow Background Accent (Vibrant Dual Emerald-Teal Blobs) */}
          <div className="pointer-events-none absolute -top-20 -right-20 h-56 w-56 rounded-full bg-gradient-to-br from-emerald-500/40 via-teal-400/30 to-emerald-600/20 blur-3xl dark:from-emerald-500/50 dark:via-teal-400/40" />
          <div className="pointer-events-none absolute -bottom-20 -left-20 h-56 w-56 rounded-full bg-gradient-to-tr from-emerald-600/30 via-teal-500/20 to-transparent blur-3xl dark:from-emerald-600/40 dark:via-teal-500/30" />

          <div className="relative z-10 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3 sm:gap-4 min-w-0">
              <div className="flex h-10 w-10 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-xl sm:rounded-2xl bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700 text-white shadow-xl shadow-emerald-600/40 border border-emerald-300/40 dark:from-emerald-400 dark:via-emerald-500 dark:to-teal-600 mt-0.5 sm:mt-0">
                <GraduationCap className="h-5 w-5 sm:h-6 sm:w-6" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-lg sm:text-xl md:text-2xl font-black tracking-tight text-slate-900 dark:text-white leading-tight">
                    Dashboard Divisi Pendidikan
                  </h1>
                  <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-emerald-600 to-teal-600 px-2.5 py-0.5 sm:px-3.5 sm:py-1 text-[10px] sm:text-xs font-extrabold text-white shadow-sm shadow-emerald-600/25 border border-emerald-300/40">
                    <ShieldCheck className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                    Pengawasan Akademik SIT
                  </span>
                </div>
                <p className="mt-1 text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300 max-w-2xl leading-relaxed">
                  Pusat analisis kinerja kurikulum, pemantauan unit pendidikan, rasio SDM/Siswa, dan pengawasan pelaporan akademik terpadu.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0 self-start sm:self-center">
              <div className="inline-flex items-center gap-1 rounded-xl border border-emerald-500/40 bg-gradient-to-r from-emerald-100 via-emerald-50 to-teal-100 px-2.5 py-1 text-[10px] sm:text-xs font-black text-emerald-900 dark:border-emerald-700 dark:bg-gradient-to-r dark:from-emerald-950 dark:to-teal-950 dark:text-emerald-200 shadow-2xs">
                <Zap className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>Direktorat Pendidikan</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Unit Scope Filter Bar with Hero UI Dropdown */}
        <motion.div
          variants={itemVariants}
          className="relative overflow-hidden rounded-[20px] border-2 border-emerald-300/80 bg-gradient-to-r from-emerald-50/70 via-teal-50/40 to-white p-4 shadow-sm dark:border-emerald-700/60 dark:from-emerald-950/40 dark:via-teal-950/20 dark:to-[#1B2433]"
        >
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-sm shadow-emerald-600/30">
                <Building2 className="h-4.5 w-4.5" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
                    Cakupan Analisis Unit Pendidikan
                  </h3>
                  <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-extrabold border ${
                    selectedUnitFilter
                      ? 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-700'
                      : 'bg-teal-100 text-teal-800 border-teal-300 dark:bg-teal-950 dark:text-teal-300 dark:border-teal-700'
                  }`}>
                    {selectedUnitFilter
                      ? (allUnits.find((u) => String(u.id) === String(selectedUnitFilter))?.name || 'Unit Terpilih')
                      : 'Semua Unit Pendidikan (Agregat Yayasan)'}
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {canSelectUnit
                    ? 'Pilih unit pendidikan spesifik atau tampilkan rekap agregat seluruh unit SIT.'
                    : 'Akses terbatas sesuai wewenang unit pendidikan Anda.'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap">
              <div className="w-full sm:w-72">
                <HeroUiFilterSelect
                  label=""
                  placeholder="Pilih Unit Pendidikan..."
                  value={selectedUnitFilter}
                  onChange={(val) => {
                    if (canSelectUnit) {
                      setSelectedUnitFilter(val)
                    }
                  }}
                  disabled={!canSelectUnit}
                  options={[
                    { value: '', label: 'Semua Unit Pendidikan', subtext: 'Agregat seluruh unit pendidikan SIT' },
                    ...allUnits.map((u) => ({
                      value: String(u.id),
                      label: u.name || u.nama,
                      subtext: u.code || u.level || 'Unit Pendidikan',
                    })),
                  ]}
                />
              </div>

              {canSelectUnit && selectedUnitFilter && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedUnitFilter('')}
                  className="h-10 shrink-0 gap-1.5 rounded-xl border-emerald-300 text-emerald-700 hover:bg-emerald-100/60 dark:border-emerald-700 dark:text-emerald-300 dark:hover:bg-emerald-900/40 text-xs font-bold cursor-pointer"
                >
                  <RefreshCcw className="h-3.5 w-3.5" />
                  Reset Filter
                </Button>
              )}
            </div>
          </div>
        </motion.div>

        {/* KPI Cards Grid (Interactive Pop-up Modal on Click) */}
        <motion.section variants={itemVariants} className="space-y-2.5">
          <SectionHeader title="Kinerja & Evaluasi Pelaporan Akademik" subtitle="Ringkasan pemantauan unit, kepegawaian, dan pelaporan bulanan (Klik kartu untuk melihat detail pop-up)" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4">
            <ModernKpiCard
              title="Unit Dipantau"
              value={formatNumber(kpis.unit_monitored?.total)}
              subtext={selectedUnitFilter ? (allUnits.find((u) => String(u.id) === String(selectedUnitFilter))?.name || '1 Unit Terpilih') : `${formatNumber(kpis.unit_monitored?.total)} Unit Pendidikan Aktif`}
              icon={Building2}
              tone="emerald"
              tag={selectedUnitFilter ? '1 UNIT' : `${kpis.unit_monitored?.total || 15} UNIT`}
              onClick={() => handleKpiCardClick('unit_monitored')}
            />
            <ModernKpiCard
              title="Total Siswa Dipantau"
              value={formatNumber(kpis.total_siswa?.total)}
              subtext="Total siswa terdaftar"
              icon={Users}
              tone="sky"
              tag="SISWA"
              onClick={() => handleKpiCardClick('total_siswa')}
            />
            <ModernKpiCard
              title="Total Guru Pengajar"
              value={formatNumber(kpis.total_guru?.total)}
              subtext="Tenaga pendidik SIT"
              icon={GraduationCap}
              tone="purple"
              tag="GURU"
              onClick={() => handleKpiCardClick('total_guru')}
            />
            <ModernKpiCard
              title="Laporan Bulanan Masuk"
              value={formatNumber(kpis.laporan_bulanan_masuk?.total)}
              subtext="Laporan terverifikasi lengkap"
              icon={FileCheck}
              tone="teal"
              tag="LENGKAP"
              onClick={() => handleKpiCardClick('laporan_bulanan_masuk')}
            />
            <ModernKpiCard
              title="Laporan Belum Masuk"
              value={formatNumber(kpis.laporan_bulanan_belum?.total)}
              subtext="Menunggu submission unit"
              icon={AlertCircle}
              tone="rose"
              tag="PENDING"
              onClick={() => handleKpiCardClick('laporan_bulanan_belum')}
            />
            <ModernKpiCard
              title="Prestasi Siswa Terverifikasi"
              value={formatNumber(kpis.total_prestasi?.total)}
              subtext="Capaian prestasi siswa"
              icon={Award}
              tone="amber"
              tag="PRESTASI"
              onClick={() => handleKpiCardClick('total_prestasi')}
            />
          </div>
        </motion.section>

        {/* Akses Cepat Divisi Pendidikan & Hero UI Dropdown Selector */}
        <motion.section variants={itemVariants} className="relative overflow-hidden rounded-[22px] border-2 border-emerald-300 dark:border-emerald-700/80 bg-white p-5 sm:p-6 shadow-md shadow-emerald-500/10 dark:bg-[#1B2433]">
          <div className="flex flex-col gap-4">
            {/* Baris Atas: Info Header, Badges & Hero UI Dropdown Selector */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 border-b border-emerald-500/15 pb-4">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-emerald-600/15 text-emerald-700 dark:bg-emerald-400/20 dark:text-emerald-300">
                    <LayoutGrid className="h-3.5 w-3.5" />
                  </span>
                  <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">Akses Cepat Divisi Pendidikan</h3>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Pilih modul langsung di bawah untuk membuka panel instrumen kerja di halaman yang sama
                </p>
                {/* Detail Chips (Tahun Ajaran, Semester, Scope, Unit) */}
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
                  <AppBadge variant={selectedUnitFilter ? 'emerald' : 'sky'} size="sm">
                    {selectedUnitFilter
                      ? `Unit: ${allUnits.find((u) => String(u.id) === String(selectedUnitFilter))?.name || 'Unit Terpilih'}`
                      : 'Semua Unit Pendidikan'}
                  </AppBadge>
                </div>
              </div>

              {/* Dropdown List dengan Style Hero UI */}
              <div className="w-full lg:w-96 shrink-0 space-y-1">
                <label className="block text-[11px] font-black uppercase tracking-wider text-slate-600 dark:text-slate-300">
                  Navigasi Modul (Hero UI Dropdown)
                </label>
                <HeroUiFilterSelect
                  value={activeWorkspaceTab || ''}
                  onChange={(val) => handleSelectTab(val)}
                  options={moduleOptions}
                  placeholder="Pilih Modul Workspace..."
                  icon={LayoutGrid}
                  searchable={true}
                  allowClear={true}
                  size="md"
                  className="w-full"
                />
              </div>
            </div>

            {/* Baris Bawah: Pintasan Tombol Cepat In-Page */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Pintasan Cepat Modul (In-Page Trigger):
                </span>
                {activeWorkspaceTab && (
                  <button
                    type="button"
                    onClick={() => handleSelectTab('')}
                    className="inline-flex items-center gap-1 text-[11px] font-extrabold text-rose-600 dark:text-rose-400 hover:underline cursor-pointer"
                  >
                    <X className="size-3" />
                    Tutup Panel Workspace
                  </button>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-2 py-1">
                {WORKSPACE_MODULES.map((tab) => {
                  const isActive = activeWorkspaceTab === tab.key
                  const Icon = tab.icon
                  const theme = MODULE_THEMES[tab.tone] || MODULE_THEMES.emerald
                  return (
                    <button
                      key={tab.key}
                      type="button"
                      onClick={() => handleSelectTab(isActive ? '' : tab.key)}
                      className={`group relative inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-black transition-all duration-200 cursor-pointer border ${
                        isActive
                          ? theme.active
                          : theme.inactive
                      }`}
                    >
                      <span className={`flex size-6 shrink-0 items-center justify-center rounded-lg transition-transform duration-200 group-hover:scale-110 ${
                        isActive ? 'bg-white/20 text-white' : theme.iconBgInactive
                      }`}>
                        <Icon className={`size-3.5 shrink-0 ${isActive ? 'text-white' : theme.iconInactive}`} />
                      </span>
                      <span className="tracking-tight">{tab.label}</span>
                      <span className={`text-[9.5px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-md transition-colors ${
                        isActive ? theme.badgeActive : theme.badgeInactive
                      }`}>
                        {tab.tag}
                      </span>
                      {isActive && (
                        <span className="size-1.5 rounded-full bg-white animate-pulse" />
                      )}
                    </button>
                  )
                })}
              </div>
            </div>
          </div>
        </motion.section>

        {/* IN-PAGE WORKSPACE PANEL (Dirender langsung di halaman yang sama) */}
        <div ref={workspaceRef} />
        <AnimatePresence mode="wait">
          {activeWorkspaceTab && (
            <motion.section
              key={activeWorkspaceTab}
              initial={{ opacity: 0, y: 16, scale: 0.99 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -16, scale: 0.99 }}
              transition={{ duration: 0.25 }}
              className="relative overflow-hidden rounded-[22px] border-2 border-emerald-500/35 bg-white p-5 sm:p-6 shadow-xl shadow-emerald-950/5 dark:border-emerald-600/40 dark:bg-[#1B2433]"
            >
              {/* Dynamic Top Gradient Stripe per Module */}
              <div className={`absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r ${(MODULE_THEMES[activeModuleMeta?.tone] || MODULE_THEMES.emerald).topStripe}`} />

              {/* Ambient Glow */}
              <div className="pointer-events-none absolute -top-20 -right-20 h-56 w-56 rounded-full bg-emerald-500/10 blur-3xl dark:bg-emerald-500/15" />

              {/* Header In-Page Workspace Panel */}
              <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 mb-5 border-b border-emerald-500/15">
                <div className="flex items-start gap-3">
                  <div className={`flex size-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br text-white shadow-md border border-white/20 ${(MODULE_THEMES[activeModuleMeta?.tone] || MODULE_THEMES.emerald).heroIcon}`}>
                    {activeModuleMeta?.icon && React.createElement(activeModuleMeta.icon, { className: 'size-5.5 text-white' })}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                        {activeModuleMeta?.fullTitle}
                      </h2>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${(MODULE_THEMES[activeModuleMeta?.tone] || MODULE_THEMES.emerald).badgeInactive}`}>
                        In-Page Workspace: {activeModuleMeta?.tag}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      {activeModuleMeta?.subtext}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleSelectTab('')}
                    className="text-xs font-bold rounded-xl border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 cursor-pointer"
                  >
                    <ChevronUp className="size-3.5 mr-1 text-slate-500" />
                    Tutup Panel
                  </Button>
                </div>
              </div>

              {/* Active Workspace Component */}
              <div className="relative z-10">
                {activeWorkspaceTab === 'supervisi-kbm' && <SupervisiKbmSection onDataMutate={fetchDashboard} />}
                {activeWorkspaceTab === 'kurasi-soal' && <KurasiBankSoalSection onDataMutate={fetchDashboard} />}
                {activeWorkspaceTab === 'tahfizh-munaqasyah' && <MunaqasyahTahfizhSection onDataMutate={fetchDashboard} />}
                {activeWorkspaceTab === 'bahasa-mufradat' && <PembiasaanBahasaSection onDataMutate={fetchDashboard} />}
                {activeWorkspaceTab === 'pelatihan-guru' && <PelatihanGuruSection onDataMutate={fetchDashboard} />}
                {activeWorkspaceTab === 'revisi-laporan' && <ReviewLaporanBulananSection onDataMutate={fetchDashboard} />}
                {activeWorkspaceTab === 'radar-akreditasi' && <RadarAkreditasiSection onDataMutate={fetchDashboard} />}
                {activeWorkspaceTab === 'supervisi-disiplin' && <DisciplineSupervisionSection />}
              </div>
            </motion.section>
          )}
        </AnimatePresence>

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
            <div className="relative overflow-hidden rounded-[22px] border-2 border-emerald-300 dark:border-emerald-700/80 bg-white p-5 shadow-md shadow-emerald-500/10 dark:bg-[#1B2433]">
              <div className="pointer-events-none absolute -top-10 -right-10 h-32 w-32 rounded-full bg-emerald-400/10 blur-2xl dark:bg-emerald-400/15" />
              <div className="relative z-10 flex flex-col justify-between h-full">
                <div className="flex items-center justify-between mb-3 border-b border-emerald-500/15 pb-2.5">
                  <div>
                    <h4 className="text-sm font-extrabold text-slate-900 dark:text-white">Rasio SDM (Pegawai & Guru) - Gender</h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">Perbandingan jumlah pegawai Laki-laki dan Perempuan per unit</p>
                  </div>
                  <span className="rounded-lg bg-emerald-50 px-2.5 py-0.5 text-[10px] font-extrabold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                    SDM
                  </span>
                </div>
                <div className="h-64 w-full pt-2">
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
              </div>
            </div>

            {/* Chart 2: Rasio Siswa */}
            <div className="relative overflow-hidden rounded-[22px] border-2 border-emerald-300 dark:border-emerald-700/80 bg-white p-5 shadow-md shadow-emerald-500/10 dark:bg-[#1B2433]">
              <div className="pointer-events-none absolute -top-10 -right-10 h-32 w-32 rounded-full bg-sky-400/10 blur-2xl dark:bg-sky-400/15" />
              <div className="relative z-10 flex flex-col justify-between h-full">
                <div className="flex items-center justify-between mb-3 border-b border-emerald-500/15 pb-2.5">
                  <div>
                    <h4 className="text-sm font-extrabold text-slate-900 dark:text-white">Rasio Kesiswaan (Siswa) - Gender</h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">Perbandingan jumlah siswa Laki-laki dan Perempuan per unit</p>
                  </div>
                  <span className="rounded-lg bg-sky-50 px-2.5 py-0.5 text-[10px] font-extrabold text-sky-700 dark:bg-sky-950 dark:text-sky-300">
                    Siswa
                  </span>
                </div>
                <div className="h-64 w-full pt-2">
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
              </div>
            </div>
          </div>
        </motion.section>

        {/* KPI Detail Pop-up Modal */}
        <DivisiPendidikanKpiModal
          type={selectedKpiType}
          isOpen={isKpiModalOpen}
          unitId={selectedUnitFilter}
          onClose={() => setIsKpiModalOpen(false)}
        />
      </motion.div>
    </PageContainer>
  )
}
