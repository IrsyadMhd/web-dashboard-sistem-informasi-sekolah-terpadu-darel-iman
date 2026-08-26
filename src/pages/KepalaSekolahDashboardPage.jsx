import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { kepalaSekolahDashboardService } from '../services/kepalaSekolahDashboardService'
import { educationUnitService } from '../services/educationUnitService'
import {
  Users,
  UserCheck,
  GraduationCap,
  School,
  Layers,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileText,
  BookOpen,
  Award,
  Plus,
  RefreshCw,
  Calendar,
  Sparkles,
  Building2,
  MapPin,
  Phone,
  Mail,
  Activity,
  Radio,
  Eye,
  Crown,
  ShieldCheck,
  Wallet,
} from 'lucide-react'
import {
  Avatar,
  AvatarImage,
  AvatarFallback,
  AvatarBadge,
  AvatarGroup,
} from '@/components/tailgrids/core/avatar'
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '@/components/tailgrids/core/hover-card'
import {
  OverlayWrapper,
  Backdrop,
} from '@/components/tailgrids/core/overlay'
import {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogBody,
  DialogFooter,
  DialogClose,
} from '@/components/tailgrids/core/dialog'
import { Button } from '@/components/tailgrids/core/button'
import { List } from '@/components/tailgrids/core/list'
import {
  ResponsiveContainer,
  LineChart,
  Line,
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
  SummaryCard,
  AppDataTable,
  AppBadge,
  AppButton,
  SectionHeader,
  PageContainer,
} from '../components/app'

import ChartCard from '../components/dashboard/ChartCard'
import SkeletonDashboard from '../components/dashboard/SkeletonDashboard'
import ErrorState from '../components/dashboard/ErrorState'
import StudentAchievementRecapSection from '../components/dashboard/StudentAchievementRecapSection'
import KpiQuickViewModal from '../components/KpiQuickViewModal'
import ModalErrorBoundary from '../components/common/ModalErrorBoundary'
import { motion } from 'framer-motion'

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

const DEFAULT_ONLINE_USERS = []
const DEFAULT_ONLINE_LOGS = []
const DEFAULT_STUDENT_ATTENDANCE = []
const DEFAULT_ATTENDANCE_TREND = []
const DEFAULT_ANNOUNCEMENTS = []

const DEFAULT_PENGURUS_YAYASAN = [
  {
    id: 'pengurus-1',
    jabatan: 'Ketua Yayasan',
    nama: 'Ust. Dr. Muhammad Elvi Syam, Lc., M.A.',
    nip: 'NIY-201101001',
    email: 'elvisyam@dareliman.sch.id',
    phone: '0811-6601-001',
    periode: '2021 - 2026',
    status: 'Aktif',
    gender: 'male',
    avatar_url: null,
    badge_variant: 'emerald',
    role_code: 'KETUA',
  },
  {
    id: 'pengurus-2',
    jabatan: 'Sekretaris Yayasan',
    nama: 'Ust. Abu Umar Indra, S.S.',
    nip: 'NIY-201101002',
    email: 'sekretaris@dareliman.sch.id',
    phone: '0812-6789-002',
    periode: '2021 - 2026',
    status: 'Aktif',
    gender: 'male',
    avatar_url: null,
    badge_variant: 'blue',
    role_code: 'SEKRETARIS',
  },
  {
    id: 'pengurus-3',
    jabatan: 'Bendahara Yayasan',
    nama: 'H. Faisal Ramli, S.E., Ak.',
    nip: 'NIY-201101003',
    email: 'bendahara@dareliman.sch.id',
    phone: '0813-7890-003',
    periode: '2021 - 2026',
    status: 'Aktif',
    gender: 'male',
    avatar_url: null,
    badge_variant: 'purple',
    role_code: 'BENDAHARA',
  },
]

const DEFAULT_FALLBACK_DATA = {
  kpis: {},
  context: {},
  school_info: {},
  online_users: [],
  online_logs: [],
  student_attendance: [],
  pengurus_yayasan: DEFAULT_PENGURUS_YAYASAN,
  charts: {
    attendance_trend: [],
  },
  tables: {
    announcements: [],
    rekap_prestasi: [],
  },
}

export default function KepalaSekolahDashboardPage() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [data, setData] = useState(null)
  const [selectedUnitId, setSelectedUnitId] = useState('')
  const [activeModal, setActiveModal] = useState(null)
  const [isAttendanceModalOpen, setIsAttendanceModalOpen] = useState(false)
  const [attendanceFilterUnit, setAttendanceFilterUnit] = useState('all')
  const [attendanceSearchTerm, setAttendanceSearchTerm] = useState('')

  const { data: daftarUnitData } = useQuery({
    queryKey: ['education-units-ks-filter'],
    queryFn: () => educationUnitService.getDaftar({ per_page: 200 }),
    staleTime: 5 * 60 * 1000,
  })

  const unitsList = Array.isArray(daftarUnitData?.data)
    ? daftarUnitData.data
    : Array.isArray(daftarUnitData)
      ? daftarUnitData
      : []

  const fetchDashboard = async (unitId) => {
    setLoading(true)
    setError(null)
    try {
      const params = {}
      const activeUnit = unitId !== undefined ? unitId : selectedUnitId
      if (activeUnit && activeUnit !== 'all') {
        params.unit_id = activeUnit
      }
      const res = await kepalaSekolahDashboardService.getOverview(params)
      const payload = res?.data || res
      if (payload) {
        setData(payload)
      } else {
        setData(DEFAULT_FALLBACK_DATA)
      }
    } catch (err) {
      console.warn('Failed to load Kepala Sekolah API, falling back to local dashboard data:', err)
      setData(DEFAULT_FALLBACK_DATA)
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

  const getStatVal = (val) => {
    if (val === undefined || val === null) return 0
    if (typeof val === 'object' && val !== null) {
      if (val.total !== undefined) return Number(val.total) || 0
      if (val.count !== undefined) return Number(val.count) || 0
    }
    return typeof val === 'number' ? val : Number(val) || 0
  }

  const formatNumber = (num) => getStatVal(num).toLocaleString('id-ID')

  const getInitials = (name) => {
    if (!name) return 'U'
    const parts = String(name).trim().split(' ')
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase()
    return String(name).slice(0, 2).toUpperCase()
  }

  const schoolInfo = {
    nama: data?.school_info?.nama || context.unit?.nama || 'SDIT 1 Dar el-Iman - 50 Kota',
    npsn: data?.school_info?.npsn || context.unit?.npsn || '10293847',
    kode: data?.school_info?.kode || context.unit?.code || context.unit?.kode || 'SDIT-01',
    akreditasi: data?.school_info?.akreditasi || context.unit?.akreditasi || 'A (Unggul)',
    alamat: data?.school_info?.alamat || context.unit?.alamat || 'Jl. Raya Lima Puluh Kota No. 12, Sumatera Barat',
    kepala_sekolah: data?.school_info?.kepala_sekolah || context.unit?.kepala_sekolah || 'Ust. Abdullah, S.Pd.I',
    kontak: data?.school_info?.kontak || context.unit?.kontak || '0752-123456',
    status: data?.school_info?.status || 'Aktif / Operasional',
    tahun_ajaran: context.tahun_ajaran?.nama || '2024/2025',
    semester: context.semester?.nama || 'Semester Ganjil',
  }

  const onlineUsers = data && Array.isArray(data.online_users) ? data.online_users : DEFAULT_ONLINE_USERS
  const onlineLogs = data && Array.isArray(data.online_logs) ? data.online_logs : DEFAULT_ONLINE_LOGS
  const studentAttendanceList = data && Array.isArray(data.student_attendance) ? data.student_attendance : DEFAULT_STUDENT_ATTENDANCE

  const rawPengurus = data?.pengurus_yayasan || data?.tables?.pengurus_yayasan
  const pengurusYayasanList = Array.isArray(rawPengurus) && rawPengurus.length > 0 ? rawPengurus : DEFAULT_PENGURUS_YAYASAN

  const rawTrend = charts?.attendance_trend || data?.attendance_trend
  const attendanceTrendChartData = Array.isArray(rawTrend) ? rawTrend : DEFAULT_ATTENDANCE_TREND

  const announcementRaw = tables?.announcements || data?.announcements || data?.recent_announcements
  const announcementList = Array.isArray(announcementRaw) ? announcementRaw : DEFAULT_ANNOUNCEMENTS


  return (
    <PageContainer maxW="7xl">
      <motion.div initial="hidden" animate="visible" variants={containerVariants} className="space-y-6 pb-12">
        {/* Breadcrumb Navigation */}
        <motion.div variants={itemVariants} className="print:hidden">
          <AppBreadcrumb items={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Dashboard Kepala Sekolah' }]} />
        </motion.div>

        {/* MODERN HERO CARD HEADER (MATCHING MONITORING & DIVISI PENDIDIKAN STYLE) */}
        <motion.div variants={itemVariants} className="relative overflow-hidden rounded-[22px] border-2 border-emerald-500/30 bg-gradient-to-r from-emerald-500/15 via-teal-500/10 to-emerald-600/15 p-5 sm:p-6 shadow-md shadow-emerald-500/10 dark:border-emerald-600/40 dark:bg-gradient-to-r dark:from-emerald-950/70 dark:via-teal-950/50 dark:to-slate-900 print:hidden">
          {/* Ambient Glow Background Accent (Vibrant Dual Emerald-Teal Blobs) */}
          <div className="pointer-events-none absolute -top-20 -right-20 h-56 w-56 rounded-full bg-gradient-to-br from-emerald-500/40 via-teal-400/30 to-emerald-600/20 blur-3xl dark:from-emerald-500/50 dark:via-teal-400/40" />
          <div className="pointer-events-none absolute -bottom-20 -left-20 h-56 w-56 rounded-full bg-gradient-to-tr from-emerald-600/30 via-teal-500/20 to-transparent blur-3xl dark:from-emerald-600/40 dark:via-teal-500/30" />

          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 pb-4 border-b border-emerald-500/20 dark:border-emerald-800/40">
            <div className="flex items-center gap-4 min-w-0">
              <div className="flex size-12 sm:size-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700 text-white shadow-xl shadow-emerald-600/40 border border-emerald-300/40 dark:from-emerald-400 dark:via-emerald-500 dark:to-teal-600">
                <Building2 className="size-6 sm:size-7 text-white" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-emerald-600 to-teal-600 px-3.5 py-1 text-xs font-extrabold text-white shadow-sm shadow-emerald-600/25 border border-emerald-300/40">
                    <ShieldCheck className="h-3.5 w-3.5" />
                    Dashboard Kepala Sekolah
                  </span>
                  <span className="inline-flex items-center rounded-full bg-emerald-100 px-3 py-0.5 text-xs font-extrabold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/60">
                    {schoolInfo.status}
                  </span>
                </div>
                <h1 className="mt-1.5 text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                  {schoolInfo.nama}
                </h1>
                <p className="mt-0.5 text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300">
                  NPSN: <span className="font-bold text-slate-900 dark:text-white">{schoolInfo.npsn}</span> • Kode Unit: <span className="font-bold text-slate-900 dark:text-white">{schoolInfo.kode}</span> • Akreditasi: <span className="font-bold text-slate-900 dark:text-white">{schoolInfo.akreditasi}</span>
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 shrink-0 z-10">
              <AppBadge variant="info" className="font-extrabold">TA {schoolInfo.tahun_ajaran}</AppBadge>
              <AppBadge variant="purple" className="font-extrabold">{schoolInfo.semester}</AppBadge>
              {unitsList.length > 0 && (
                <select
                  value={selectedUnitId || context.unit?.id || ''}
                  onChange={(e) => {
                    const val = e.target.value
                    setSelectedUnitId(val)
                    fetchDashboard(val)
                  }}
                  className="rounded-xl border border-emerald-500/30 bg-white/90 px-3.5 py-2 text-xs font-extrabold text-slate-800 shadow-sm focus:border-emerald-600 focus:outline-none dark:border-emerald-800 dark:bg-slate-900 dark:text-slate-100 cursor-pointer"
                >
                  <option value="">-- Pilih Unit Sekolah --</option>
                  {unitsList.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.code} - {u.name}
                    </option>
                  ))}
                </select>
              )}
            </div>
          </div>

          <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 text-xs text-slate-700 dark:text-slate-300">
            <div className="flex items-start gap-2.5 p-3 rounded-xl bg-white/60 dark:bg-slate-900/50 border border-emerald-500/20 dark:border-emerald-800/40">
              <MapPin className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400 mt-0.5" />
              <div>
                <span className="font-extrabold text-slate-900 dark:text-white block">Lokasi & Alamat Unit</span>
                <span className="text-slate-600 dark:text-slate-400 font-medium">{schoolInfo.alamat}</span>
              </div>
            </div>
            <div className="flex items-start gap-2.5 p-3 rounded-xl bg-white/60 dark:bg-slate-900/50 border border-emerald-500/20 dark:border-emerald-800/40">
              <UserCheck className="h-4 w-4 shrink-0 text-teal-600 dark:text-teal-400 mt-0.5" />
              <div>
                <span className="font-extrabold text-slate-900 dark:text-white block">Kepala Sekolah Unit</span>
                <span className="text-slate-600 dark:text-slate-400 font-medium">{schoolInfo.kepala_sekolah}</span>
              </div>
            </div>
            <div className="flex items-start gap-2.5 p-3 rounded-xl bg-white/60 dark:bg-slate-900/50 border border-emerald-500/20 dark:border-emerald-800/40">
              <Phone className="h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400 mt-0.5" />
              <div>
                <span className="font-extrabold text-slate-900 dark:text-white block">Kontak Resepsionis / Admin</span>
                <span className="text-slate-600 dark:text-slate-400 font-medium">{schoolInfo.kontak}</span>
              </div>
            </div>
          </div>
        </motion.div>

      {/* Profil Pengurus Yayasan (Ketua, Sekretaris, Bendahara) */}
      <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm space-y-4 dark:border-slate-800 dark:bg-[#1B2433]">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800/80">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400">
              <Crown className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                Profil Pengurus Yayasan
                <AppBadge variant="purple" size="xs">Yayasan Dar el-Iman</AppBadge>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Struktur pimpinan eksekutif yayasan: Ketua, Sekretaris, dan Bendahara
              </p>
            </div>
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 px-3 py-1 text-xs font-extrabold text-emerald-700 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/60 shrink-0">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
            Periode 2021 - 2026
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {pengurusYayasanList.map((officer) => {
            const photo = officer.avatar_url || officer.photo || officer.foto
            const name = officer.nama || officer.nama_lengkap || officer.name
            const jabatan = officer.jabatan || officer.title || 'Pengurus'
            const nip = officer.nip || officer.niy || '—'
            const email = officer.email || '—'
            const phone = officer.phone || officer.no_hp || '—'
            const status = officer.status || 'Aktif'
            const roleCode = officer.role_code || (jabatan.includes('Ketua') ? 'KETUA' : jabatan.includes('Sekretaris') ? 'SEKRETARIS' : 'BENDAHARA')

            const roleTheme = roleCode === 'KETUA'
              ? {
                  badgeVariant: 'success',
                  borderHover: 'hover:border-emerald-400 dark:hover:border-emerald-600',
                  bgIcon: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300',
                  ring: 'ring-emerald-500/30'
                }
              : roleCode === 'SEKRETARIS'
              ? {
                  badgeVariant: 'info',
                  borderHover: 'hover:border-sky-400 dark:hover:border-sky-600',
                  bgIcon: 'bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-300',
                  ring: 'ring-sky-500/30'
                }
              : {
                  badgeVariant: 'purple',
                  borderHover: 'hover:border-purple-400 dark:hover:border-purple-600',
                  bgIcon: 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300',
                  ring: 'ring-purple-500/30'
                }

            return (
              <HoverCard key={officer.id || jabatan}>
                <HoverCardTrigger asChild>
                  <div className={`group relative flex flex-col justify-between rounded-2xl border border-slate-200/80 bg-slate-50/50 p-4 transition-all duration-200 ${roleTheme.borderHover} hover:bg-white hover:shadow-md dark:border-slate-800 dark:bg-slate-900/40 dark:hover:bg-[#1B2433] cursor-pointer`}>
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="relative">
                          <Avatar size="xl" className={`ring-2 ${roleTheme.ring}`}>
                            {photo && <AvatarImage src={photo} alt={name} />}
                            <AvatarFallback className={`${roleTheme.bgIcon} font-black text-xs`}>
                              {getInitials(name)}
                            </AvatarFallback>
                            <AvatarBadge status="online" size="xl" ping={true} live={true} />
                          </Avatar>
                        </div>
                        <AppBadge variant={roleTheme.badgeVariant} size="sm">
                          {jabatan}
                        </AppBadge>
                      </div>

                      <div>
                        <h4 className="text-xs font-extrabold text-slate-900 dark:text-white leading-snug group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors">
                          {name}
                        </h4>
                        <p className="font-mono text-[10px] text-slate-400 font-semibold mt-0.5">
                          {nip}
                        </p>
                      </div>

                      <div className="space-y-1.5 pt-2 border-t border-slate-200/60 dark:border-slate-800 text-[11px] text-slate-600 dark:text-slate-300">
                        <div className="flex items-center gap-2">
                          <Mail className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                          <span className="truncate">{email}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Phone className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                          <span>{phone}</span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-3 flex items-center justify-between pt-2 border-t border-slate-200/60 dark:border-slate-800/80 text-[10px]">
                      <span className="font-bold text-slate-400">Status Jabatan</span>
                      <span className="inline-flex items-center gap-1 font-extrabold text-emerald-600 dark:text-emerald-400">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        {status}
                      </span>
                    </div>
                  </div>
                </HoverCardTrigger>

                {/* TailGrids HoverCard Content (Detail Preview Popover) */}
                <HoverCardContent
                  side="top"
                  align="center"
                  className="w-80 p-4 border border-slate-200/90 bg-white dark:border-slate-800 dark:bg-[#1B2433] rounded-2xl shadow-xl space-y-3 z-50"
                >
                  <div className="flex items-start gap-3">
                    <Avatar size="xxl" className={`ring-2 ${roleTheme.ring} shrink-0`}>
                      {photo && <AvatarImage src={photo} alt={name} />}
                      <AvatarFallback className={`${roleTheme.bgIcon} font-extrabold text-lg`}>
                        {getInitials(name)}
                      </AvatarFallback>
                      <AvatarBadge status="online" size="xxl" ping={true} live={true} />
                    </Avatar>

                    <div className="min-w-0 flex-1 space-y-1">
                      <div className="flex items-center justify-between gap-1">
                        <AppBadge variant={roleTheme.badgeVariant} dot>{jabatan}</AppBadge>
                        <span className="text-[10px] text-slate-400 font-bold">2021-2026</span>
                      </div>
                      <h4 className="text-xs font-extrabold text-slate-900 dark:text-white leading-snug">
                        {name}
                      </h4>
                      <p className="font-mono text-[10px] text-slate-400">{nip}</p>
                    </div>
                  </div>

                  <div className="rounded-xl border border-slate-100 bg-slate-50/80 p-2.5 dark:border-slate-800 dark:bg-slate-900/50 space-y-1.5 text-[11px]">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 font-bold">Lembaga:</span>
                      <span className="font-extrabold text-slate-800 dark:text-slate-200">Yayasan Dar el-Iman</span>
                    </div>
                    <div className="flex items-center justify-between pt-1 border-t border-slate-200/60 dark:border-slate-800">
                      <span className="text-slate-400 font-bold">Masa Khidmat:</span>
                      <span className="font-bold text-emerald-600 dark:text-emerald-400">Periode 2021 - 2026</span>
                    </div>
                  </div>

                  <div className="space-y-1 text-[11px] text-slate-500 dark:text-slate-400 pt-1">
                    <div className="flex items-center gap-2">
                      <Mail className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                      <span>{phone}</span>
                    </div>
                  </div>
                </HoverCardContent>
              </HoverCard>
            )
          })}
        </div>
      </section>

      {/* 2-Column Grid: Pegawai & Guru Online Real-Time + Log Keaktifan Feed */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Kolom 1: Pegawai & Guru Online Real-Time (dengan TailGrids Avatar & HoverCard) */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm space-y-4 dark:border-slate-800 dark:bg-[#1B2433]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">Pegawai & Guru Online Real-Time</h3>
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
            </div>
            <span className="rounded-xl bg-emerald-500/10 px-2.5 py-0.5 text-xs font-extrabold text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300">
              {onlineUsers.length} Online
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4 gap-3">
            {onlineUsers.map((user, idx) => {
              const photo = user.avatar_url || user.photo_url || user.foto || user.avatar
              const userName = user.nama || user.name || user.full_name || 'Pegawai'
              const userRole = user.role || user.jabatan || user.jabatan_name || 'Pegawai / Guru'
              const userNip = user.nip || user.niy || user.nik || '—'
              const userDept = user.dept || user.departemen || user.unit || '—'
              const userActivity = user.activity || user.aktivitas || user.title || 'Aktif di portal'
              const lastSeen = user.lastSeen || user.last_active || 'Aktif sekarang'
              const userEmail = user.email || '—'
              const userPhone = user.phone || user.no_hp || user.telepon || '—'

              return (
                <HoverCard key={user.id || idx}>
                  <HoverCardTrigger asChild>
                    <div className="group relative flex flex-col items-center text-center rounded-2xl border border-slate-200/80 bg-white p-3.5 shadow-xs transition-all duration-200 hover:border-emerald-400 hover:bg-emerald-50/30 hover:shadow-md dark:border-slate-800 dark:bg-[#1B2433] dark:hover:border-emerald-600 dark:hover:bg-emerald-950/20 cursor-pointer">
                      {/* TailGrids Avatar with Live Online Badge */}
                      <div className="relative mb-2">
                        <Avatar size="lg" className="ring-2 ring-emerald-500/30">
                          {photo && <AvatarImage src={photo} alt={userName} />}
                          <AvatarFallback className="bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 font-black text-xs">
                            {getInitials(userName)}
                          </AvatarFallback>
                          <AvatarBadge status="online" size="lg" ping={true} live={true} />
                        </Avatar>
                      </div>

                      <p className="text-[11px] font-extrabold text-slate-900 dark:text-white line-clamp-1 group-hover:text-emerald-700 dark:group-hover:text-emerald-400">
                        {userName}
                      </p>
                      <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
                        {userRole}
                      </p>
                      
                      <span className="mt-2 inline-flex items-center gap-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 text-[9px] font-extrabold text-emerald-700 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/60">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        Online
                      </span>
                    </div>
                  </HoverCardTrigger>

                  {/* TailGrids HoverCard Content (Profile Preview Popover) */}
                  <HoverCardContent
                    side="top"
                    align="center"
                    className="w-80 p-4 border border-slate-200/90 bg-white dark:border-slate-800 dark:bg-[#1B2433] rounded-2xl shadow-xl space-y-3 z-50"
                  >
                    <div className="flex items-start gap-3">
                      <Avatar size="xxl" className="ring-2 ring-emerald-500/40 shrink-0">
                        {photo && <AvatarImage src={photo} alt={userName} />}
                        <AvatarFallback className="bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 font-extrabold text-lg">
                          {getInitials(userName)}
                        </AvatarFallback>
                        <AvatarBadge status="online" size="xxl" ping={true} live={true} />
                      </Avatar>

                      <div className="min-w-0 flex-1 space-y-1">
                        <div className="flex items-center justify-between gap-1">
                          <AppBadge variant="success" dot>Online</AppBadge>
                          <span className="text-[10px] text-slate-400 font-bold">{lastSeen}</span>
                        </div>
                        <h4 className="text-xs font-extrabold text-slate-900 dark:text-white leading-snug">
                          {userName}
                        </h4>
                        <p className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400">
                          {userRole}
                        </p>
                        <p className="font-mono text-[10px] text-slate-400">{userNip}</p>
                      </div>
                    </div>

                    <div className="rounded-xl border border-slate-100 bg-slate-50/80 p-2.5 dark:border-slate-800 dark:bg-slate-900/50 space-y-1.5 text-[11px]">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400 font-bold">Departemen:</span>
                        <span className="font-extrabold text-slate-800 dark:text-slate-200">{userDept}</span>
                      </div>
                      <div className="flex items-start gap-1.5 pt-1 border-t border-slate-200/60 dark:border-slate-800">
                        <Activity className="h-3.5 w-3.5 shrink-0 text-emerald-600 mt-0.5" />
                        <span className="text-slate-600 dark:text-slate-300 font-medium line-clamp-2">
                          <strong className="text-slate-800 dark:text-white">Aktivitas Sesi:</strong> {userActivity}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-1 text-[11px] text-slate-500 dark:text-slate-400 pt-1">
                      <div className="flex items-center gap-2">
                        <Mail className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">{userEmail}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                        <span>{userPhone}</span>
                      </div>
                    </div>
                  </HoverCardContent>
                </HoverCard>
              )
            })}
          </div>
        </div>

        {/* Kolom 2: Log Keaktifan & Activity Feed Real-Time */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm space-y-4 dark:border-slate-800 dark:bg-[#1B2433]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400">
                <Radio className="h-4 w-4 animate-pulse" />
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
                  Log Keaktifan & Activity Feed Real-Time
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Log transaksi login, presensi, dan aktivitas sistem
                </p>
              </div>
            </div>
            <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500 animate-ping" />
          </div>

          <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1">
            {onlineLogs.map((log, idx) => (
              <div
                key={log.id || idx}
                className="flex items-start gap-3 rounded-xl border border-slate-100 bg-slate-50/60 p-3 transition-all hover:bg-slate-100/70 dark:border-slate-800 dark:bg-slate-900/40 dark:hover:bg-slate-900/70"
              >
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 text-xs font-bold mt-0.5">
                  {log.type === 'login' ? <UserCheck className="h-4 w-4" /> : <Activity className="h-4 w-4" />}
                </span>
                <div className="min-w-0 flex-1 space-y-0.5">
                  <div className="flex items-center justify-between gap-1">
                    <p className="text-xs font-extrabold text-slate-900 dark:text-white truncate">
                      {log.user || log.nama || log.username || 'Pengguna'}
                    </p>
                    <span className="shrink-0 text-[10px] font-bold text-slate-400">
                      {log.time || log.created_at || log.created_at_relative || 'Baru saja'}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    {log.role && <span className="font-bold text-emerald-700 dark:text-emerald-400 mr-1">[{log.role}]</span>}
                    {log.action || log.description || log.pesan || log.title}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>



      {/* Primary Unit KPIs */}
      <section className="space-y-3">
        <SectionHeader title="Metrik Utama Unit Sekolah" subtitle="Jumlah siswa, guru, pegawai, dan rombel aktif" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiCard
            title="Total Siswa Aktif"
            value={formatNumber(kpis.total_siswa?.total)}
            icon={Users}
            colorScheme="emerald"
            badge="Siswa Unit"
            badgeVariant="success"
            onClick={() => setActiveModal('total_siswa')}
          />
          <KpiCard
            title="Total Guru Pengajar"
            value={formatNumber(kpis.total_guru?.total)}
            icon={GraduationCap}
            colorScheme="blue"
            badge="Guru"
            badgeVariant="info"
            onClick={() => setActiveModal('total_guru')}
          />
          <KpiCard
            title="Total Pegawai & Staf"
            value={formatNumber(kpis.total_pegawai?.total)}
            icon={UserCheck}
            colorScheme="violet"
            badge="Tendik"
            badgeVariant="purple"
            onClick={() => setActiveModal('total_pegawai')}
          />
          <KpiCard
            title="Total Rombel / Kelas"
            value={formatNumber(kpis.total_rombel?.total || kpis.total_kelas?.total)}
            icon={Layers}
            colorScheme="indigo"
            badge="Rombel"
            badgeVariant="success"
            onClick={() => setActiveModal('total_kelas')}
          />
        </div>
      </section>

      {/* Daily Attendance & Tahfizh Metrics */}
      <section className="space-y-3">
        <SectionHeader title="Kondisi Presensi & Setoran Tahfizh Hari Ini" subtitle="Monitoring kehadiran harian dan setoran hafalan Al-Qur'an" />
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          <SummaryCard
            title="Hadir Hari Ini"
            value={formatNumber(kpis.siswa_hadir_hari_ini?.total)}
            icon={CheckCircle2}
            colorScheme="emerald"
          />
          <SummaryCard
            title="Terlambat"
            value={formatNumber(kpis.siswa_terlambat?.total)}
            icon={Clock}
            colorScheme="amber"
          />
          <SummaryCard
            title="Izin"
            value={formatNumber(kpis.siswa_izin?.total)}
            icon={FileText}
            colorScheme="blue"
          />
          <SummaryCard
            title="Sakit"
            value={formatNumber(kpis.siswa_sakit?.total)}
            icon={AlertCircle}
            colorScheme="rose"
          />
          <SummaryCard
            title="Setoran Tahfizh"
            value={formatNumber(kpis.setoran_tahfizh_hari_ini?.total)}
            description="Setoran hafalan hari ini"
            icon={BookOpen}
            colorScheme="indigo"
          />
        </div>
      </section>

      {/* Quick Action Navigation (Soft Pastel Squircle Buttons) */}
      <section className="rounded-2xl border border-slate-200/80 bg-white p-4.5 shadow-sm dark:border-slate-800 dark:bg-[#1B2433]">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-[#0E5C44]/10 text-[#0E5C44] dark:bg-[#3FBF75]/20 dark:text-[#3FBF75]">
                <Sparkles className="h-3.5 w-3.5" />
              </span>
              <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">Akses Cepat Kepala Sekolah</h3>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Navigasi langsung ke pemantauan presensi, tahfizh, dan kesiswaan</p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
            {/* 1. Monitoring Divisi - Sky Blue Theme */}
            <button
              type="button"
              onClick={() => navigate('/dashboard/monitoring-divisi')}
              className="group flex items-center gap-3 rounded-xl border border-slate-200/80 bg-slate-50/60 p-2.5 transition-all duration-200 hover:border-sky-300 hover:bg-sky-50/50 hover:shadow-sm dark:border-slate-800 dark:bg-slate-900/50 dark:hover:border-sky-700/60 dark:hover:bg-sky-950/30 text-left"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-sky-100/80 text-sky-600 border border-sky-200/60 transition-transform duration-200 group-hover:scale-110 dark:bg-sky-950/60 dark:text-sky-400 dark:border-sky-800/60">
                <FileText className="h-5 w-5" />
              </div>
              <div className="min-w-0 pr-1">
                <p className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate group-hover:text-sky-700 dark:group-hover:text-sky-300">Monitoring Divisi</p>
                <p className="text-[10px] text-slate-400 truncate">Divisi & Unit</p>
              </div>
            </button>

            {/* 2. Rekap Kehadiran - Emerald Green Theme */}
            <button
              type="button"
              onClick={() => navigate('/absensi/rekap-kehadiran')}
              className="group flex items-center gap-3 rounded-xl border border-slate-200/80 bg-slate-50/60 p-2.5 transition-all duration-200 hover:border-emerald-300 hover:bg-emerald-50/50 hover:shadow-sm dark:border-slate-800 dark:bg-slate-900/50 dark:hover:border-emerald-700/60 dark:hover:bg-emerald-950/30 text-left"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-100/80 text-emerald-600 border border-emerald-200/60 transition-transform duration-200 group-hover:scale-110 dark:bg-emerald-950/60 dark:text-emerald-400 dark:border-emerald-800/60">
                <CheckCircle2 className="h-5 w-5" />
              </div>
              <div className="min-w-0 pr-1">
                <p className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate group-hover:text-emerald-700 dark:group-hover:text-emerald-300">Rekap Kehadiran</p>
                <p className="text-[10px] text-slate-400 truncate">Presensi Guru & Siswa</p>
              </div>
            </button>

            {/* 3. Monitoring Tahfizh - Violet Theme */}
            <button
              type="button"
              onClick={() => navigate('/dashboard/monitoring-tahfizh-ibadah-non-pesantren')}
              className="group flex items-center gap-3 rounded-xl border border-slate-200/80 bg-slate-50/60 p-2.5 transition-all duration-200 hover:border-violet-300 hover:bg-violet-50/50 hover:shadow-sm dark:border-slate-800 dark:bg-slate-900/50 dark:hover:border-violet-700/60 dark:hover:bg-violet-950/30 text-left"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-100/80 text-violet-600 border border-violet-200/60 transition-transform duration-200 group-hover:scale-110 dark:bg-violet-950/60 dark:text-violet-400 dark:border-violet-800/60">
                <BookOpen className="h-5 w-5" />
              </div>
              <div className="min-w-0 pr-1">
                <p className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate group-hover:text-violet-700 dark:group-hover:text-violet-300">Tahfizh & Mutabaah Non-Pesantren</p>
                <p className="text-[10px] text-slate-400 truncate">Hafalan & Ibadah Harian</p>
              </div>
            </button>

            {/* 4. Verifikasi Prestasi - Amber Theme */}
            <button
              type="button"
              onClick={() => navigate('/dashboard/pemantauan')}
              className="group flex items-center gap-3 rounded-xl border border-slate-200/80 bg-slate-50/60 p-2.5 transition-all duration-200 hover:border-amber-300 hover:bg-amber-50/50 hover:shadow-sm dark:border-slate-800 dark:bg-slate-900/50 dark:hover:border-amber-700/60 dark:hover:bg-amber-950/30 text-left"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-100/80 text-amber-600 border border-amber-200/60 transition-transform duration-200 group-hover:scale-110 dark:bg-amber-950/60 dark:text-amber-400 dark:border-amber-800/60">
                <Award className="h-5 w-5" />
              </div>
              <div className="min-w-0 pr-1">
                <p className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate group-hover:text-amber-700 dark:group-hover:text-amber-300">Verifikasi Prestasi</p>
                <p className="text-[10px] text-slate-400 truncate">Capaian & Penghargaan</p>
              </div>
            </button>

            {/* 5. Segarkan Data - Cyan Theme */}
            <button
              type="button"
              onClick={fetchDashboard}
              className="group flex items-center gap-3 rounded-xl border border-slate-200/80 bg-slate-50/60 p-2.5 transition-all duration-200 hover:border-cyan-300 hover:bg-cyan-50/50 hover:shadow-sm dark:border-slate-800 dark:bg-slate-900/50 dark:hover:border-cyan-700/60 dark:hover:bg-cyan-950/30 text-left"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-cyan-100/80 text-cyan-600 border border-cyan-200/60 transition-transform duration-200 group-hover:scale-110 dark:bg-cyan-950/60 dark:text-cyan-400 dark:border-cyan-800/60">
                <RefreshCw className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
              </div>
              <div className="min-w-0 pr-1">
                <p className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate group-hover:text-cyan-700 dark:group-hover:text-cyan-300">Segarkan Data</p>
                <p className="text-[10px] text-slate-400 truncate">Update Real-Time</p>
              </div>
            </button>
          </div>
        </div>
      </section>

      {/* 2-Column Grid: Monitoring Kehadiran Siswa + Tren Kehadiran & Pengumuman Sekolah */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Kolom 1: Monitoring Kehadiran Siswa */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm space-y-4 dark:border-slate-800 dark:bg-[#1B2433]">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800/80">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">Monitoring Kehadiran Siswa</h3>
                <AppBadge variant="success" size="xs">Hari Ini</AppBadge>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Presensi harian kesiswaan unit {schoolInfo.nama}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsAttendanceModalOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 cursor-pointer"
            >
              <Eye className="h-3.5 w-3.5 text-emerald-600" />
              <span>Detail & Filter</span>
            </button>
          </div>

          {/* Metric Status Badges */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <AppBadge variant="success" dot>Hadir: {formatNumber(kpis.siswa_hadir_hari_ini?.total || 252)}</AppBadge>
            <AppBadge variant="warning" dot>Terlambat: {formatNumber(kpis.siswa_terlambat?.total || 4)}</AppBadge>
            <AppBadge variant="info" dot>Izin: {formatNumber(kpis.siswa_izin?.total || 3)}</AppBadge>
            <AppBadge variant="danger" dot>Sakit: {formatNumber(kpis.siswa_sakit?.total || 1)}</AppBadge>
          </div>

          {/* Student Attendance Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[420px] overflow-y-auto pr-1">
            {studentAttendanceList.map((student, idx) => {
              const photo = student.avatar_url || student.photo_url || student.foto || student.avatar
              const sName = student.nama || student.name || 'Siswa'
              const sNisn = student.nisn || student.nis || '—'
              const sUnit = student.unit_name || student.unit || schoolInfo.nama
              const sKelas = student.kelas || student.rombel || '—'
              const sStatus = student.status || 'Hadir'
              const sTime = student.waktu || student.jam_masuk || '07:15 WIB'
              const sWali = student.nama_ortu || student.wali || '—'
              const sPhone = student.no_hp_ortu || student.kontak_ortu || '—'
              const sKet = student.keterangan || 'Hadir Tepat Waktu'

              const badgeStatusMap = {
                Hadir: { status: 'online', variant: 'success', border: 'hover:border-emerald-400 dark:hover:border-emerald-600' },
                Terlambat: { status: 'busy', variant: 'warning', border: 'hover:border-amber-400 dark:hover:border-amber-600' },
                Izin: { status: 'busy', variant: 'info', border: 'hover:border-sky-400 dark:hover:border-sky-600' },
                Sakit: { status: 'offline', variant: 'danger', border: 'hover:border-rose-400 dark:hover:border-rose-600' },
              }
              const currentBadge = badgeStatusMap[sStatus] || badgeStatusMap.Hadir

              return (
                <HoverCard key={student.id || idx}>
                  <HoverCardTrigger asChild>
                    <div className={`group relative flex items-start gap-3 rounded-2xl border border-slate-200/80 bg-slate-50/50 p-3 transition-all duration-200 ${currentBadge.border} hover:bg-white hover:shadow-md dark:border-slate-800 dark:bg-slate-900/40 dark:hover:bg-[#1B2433] cursor-pointer`}>
                      <Avatar size="md" className="shrink-0 mt-0.5 ring-2 ring-slate-200/60 dark:ring-slate-700">
                        {photo && <AvatarImage src={photo} alt={sName} />}
                        <AvatarFallback className="bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-extrabold text-xs">
                          {getInitials(sName)}
                        </AvatarFallback>
                        <AvatarBadge status={currentBadge.status} size="md" ping={sStatus === 'Hadir'} live={true} />
                      </Avatar>

                      <div className="min-w-0 flex-1 space-y-0.5">
                        <div className="flex items-center justify-between gap-1">
                          <span className="text-[10px] font-bold text-slate-400 truncate">{sKelas}</span>
                          <AppBadge variant={currentBadge.variant} size="xs">{sStatus}</AppBadge>
                        </div>
                        <p className="text-xs font-extrabold text-slate-900 dark:text-white truncate group-hover:text-emerald-700 dark:group-hover:text-emerald-400">
                          {sName}
                        </p>
                        <p className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400">
                          Jam Presensi: {sTime}
                        </p>
                      </div>
                    </div>
                  </HoverCardTrigger>

                  <HoverCardContent
                    side="top"
                    align="center"
                    className="w-80 p-4 border border-slate-200/90 bg-white dark:border-slate-800 dark:bg-[#1B2433] rounded-2xl shadow-xl space-y-3 z-50"
                  >
                    <div className="flex items-start gap-3">
                      <Avatar size="xxl" className="ring-2 ring-emerald-500/40 shrink-0">
                        {photo && <AvatarImage src={photo} alt={sName} />}
                        <AvatarFallback className="bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 font-extrabold text-lg">
                          {getInitials(sName)}
                        </AvatarFallback>
                        <AvatarBadge status={currentBadge.status} size="xxl" ping={sStatus === 'Hadir'} live={true} />
                      </Avatar>

                      <div className="min-w-0 flex-1 space-y-1">
                        <div className="flex items-center justify-between gap-1">
                          <AppBadge variant={currentBadge.variant} dot>{sStatus}</AppBadge>
                          <span className="text-[10px] text-slate-400 font-bold">{sTime}</span>
                        </div>
                        <h4 className="text-xs font-extrabold text-slate-900 dark:text-white leading-snug">
                          {sName}
                        </h4>
                        <p className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400">
                          {sUnit}
                        </p>
                        <p className="font-mono text-[10px] text-slate-400">NISN. {sNisn} • Kelas {sKelas}</p>
                      </div>
                    </div>

                    <div className="rounded-xl border border-slate-100 bg-slate-50/80 p-2.5 dark:border-slate-800 dark:bg-slate-900/50 space-y-1.5 text-[11px]">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400 font-bold">Catatan Presensi:</span>
                        <span className="font-extrabold text-slate-800 dark:text-slate-200">{sKet}</span>
                      </div>
                      <div className="flex items-center justify-between pt-1 border-t border-slate-200/60 dark:border-slate-800">
                        <span className="text-slate-400 font-bold">Wali Murid:</span>
                        <span className="font-bold text-slate-700 dark:text-slate-300">{sWali}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400 font-bold">Kontak Wali:</span>
                        <span className="font-mono text-slate-600 dark:text-slate-400">{sPhone}</span>
                      </div>
                    </div>
                  </HoverCardContent>
                </HoverCard>
              )
            })}
          </div>
        </div>

        {/* Kolom 2: Tren Kehadiran Siswa 7 Hari Terakhir & Pengumuman Sekolah */}
        <div className="space-y-4">
          <ChartCard
            title="Tren Kehadiran Siswa 7 Hari Terakhir"
            subtitle="Visualisasi grafik tingkat kehadiran harian di unit"
            className="w-full"
            empty={false}
          >
            <div className="h-52 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={attendanceTrendChartData}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                  <XAxis dataKey="date" stroke="#888888" fontSize={11} />
                  <YAxis stroke="#888888" fontSize={11} />
                  <Tooltip />
                  <Line type="monotone" dataKey="hadir" stroke="#0E5C44" strokeWidth={2.5} name="Hadir" />
                  <Line type="monotone" dataKey="terlambat" stroke="#F59E0B" strokeWidth={2} name="Terlambat" />
                  <Line type="monotone" dataKey="alpha" stroke="#EF4444" strokeWidth={2} name="Alpha" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>

          {/* Card Pengumuman Sekolah Terbaru dengan TailGrids List */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm space-y-3 dark:border-slate-800 dark:bg-[#1B2433]">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400">
                  <FileText className="h-4 w-4" />
                </span>
                <div>
                  <h4 className="text-xs font-extrabold text-slate-900 dark:text-white">Pengumuman Sekolah Terbaru</h4>
                  <p className="text-[10px] text-slate-400">Edaran resmi unit sekolah</p>
                </div>
              </div>
              <span className="text-[10px] font-extrabold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 px-2 py-0.5 rounded-full border border-amber-200/60 dark:border-amber-800/60">
                {announcementList.length} Pengumuman
              </span>
            </div>

            <List direction="vertical" hideDividers={false} className="w-full max-w-full divide-y divide-slate-100 dark:divide-slate-800 border-none bg-transparent">
              {announcementList.map((ann, idx) => (
                <li key={ann.id || idx} className="py-2.5 px-1 hover:bg-slate-50/80 dark:hover:bg-slate-900/50 rounded-xl transition-all">
                  <div className="flex items-start justify-between gap-3 w-full">
                    <div className="flex items-start gap-2.5 min-w-0 flex-1">
                      <span className="mt-0.5 flex h-2 w-2 shrink-0 rounded-full bg-amber-500 animate-pulse" />
                      <div className="min-w-0 flex-1 space-y-1">
                        <p className="text-xs font-extrabold text-slate-900 dark:text-white leading-snug line-clamp-1">
                          {ann.judul}
                        </p>
                        <div className="flex items-center gap-2 text-[10px] text-slate-500 dark:text-slate-400">
                          <span className="font-semibold text-slate-400">Target:</span>
                          <AppBadge variant="info" size="xs">{ann.target || 'Semua Unit'}</AppBadge>
                        </div>
                      </div>
                    </div>

                    <span data-type="count" className="shrink-0 font-mono text-[10px] font-bold text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-lg">
                      {ann.created_at ? new Date(ann.created_at).toLocaleDateString('id-ID') : '8/8/2026'}
                    </span>
                  </div>
                </li>
              ))}
            </List>
          </div>
        </div>
      </section>

      {/* TailGrids Dialog Modal Pop Up untuk Monitoring Kehadiran Siswa */}
      <Dialog
        isOpen={isAttendanceModalOpen}
        onOpenChange={setIsAttendanceModalOpen}
        className="max-w-4xl w-full p-6 border border-slate-200/80 bg-white dark:border-slate-800 dark:bg-[#1B2433] rounded-2xl shadow-2xl"
      >
            <DialogHeader className="pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400">
                  <CheckCircle2 className="h-4.5 w-4.5" />
                </span>
                <div>
                  <DialogTitle className="text-base font-extrabold text-slate-900 dark:text-white">
                    Monitoring Kehadiran Siswa Lintas Unit Pendidikan
                  </DialogTitle>
                  <DialogDescription className="text-xs text-slate-500 dark:text-slate-400">
                    Rekapitulasi dan pencarian presensi harian kesiswaan Divisi Pendidikan
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>

            <DialogBody className="py-4 space-y-4">
              {/* Filter & Search Bar */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="relative flex-1 w-full">
                  <input
                    type="text"
                    value={attendanceSearchTerm}
                    onChange={(e) => setAttendanceSearchTerm(e.target.value)}
                    placeholder="Cari nama siswa, NISN, atau kelas..."
                    className="w-full h-9.5 rounded-xl border border-slate-200 bg-slate-50/50 pl-3 pr-8 text-xs font-bold text-slate-700 outline-none focus:border-emerald-500 focus:bg-white dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:focus:border-emerald-500"
                  />
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <span className="text-xs font-bold text-slate-400 shrink-0">Unit:</span>
                  <select
                    value={attendanceFilterUnit}
                    onChange={(e) => setAttendanceFilterUnit(e.target.value)}
                    className="h-9.5 rounded-xl border border-slate-200 bg-white px-3 text-xs font-bold text-slate-700 outline-none focus:border-emerald-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
                  >
                    <option value="all">Semua Unit Pendidikan</option>
                    <option value="SDIT 1">SDIT 1 Dar el-Iman</option>
                    <option value="SMPIT">SMPIT Dar el-Iman</option>
                    <option value="SMAIT">SMAIT Dar el-Iman</option>
                  </select>
                </div>
              </div>

              {/* Data Table Presensi Siswa */}
              <div className="overflow-x-auto rounded-2xl border-2 border-emerald-500/25 bg-white shadow-md shadow-emerald-500/5 dark:border-emerald-600/35 dark:bg-[#13221f]">
                <table className="w-full text-left text-xs">
                  <thead className="bg-gradient-to-r from-emerald-600 to-teal-600 font-extrabold text-white uppercase text-[10px] tracking-wider">
                    <tr>
                      <th className="px-4 py-3.5 text-center w-16 text-white font-extrabold">Avatar</th>
                      <th className="px-4 py-3.5 text-white font-extrabold">Siswa & NISN</th>
                      <th className="px-4 py-3.5 text-white font-extrabold">Unit Pendidikan</th>
                      <th className="px-4 py-3.5 text-white font-extrabold">Kelas / Rombel</th>
                      <th className="px-4 py-3.5 text-white font-extrabold">Waktu Presensi</th>
                      <th className="px-4 py-3.5 text-white font-extrabold">Status</th>
                      <th className="px-4 py-3.5 text-white font-extrabold">Keterangan</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {studentAttendanceList.length > 0 ? (
                      studentAttendanceList.map((st, i) => {
                        const photo = st.avatar_url || st.photo_url || st.foto || st.avatar
                        const sName = st.nama || st.name || 'Siswa'
                        const sNisn = st.nisn || st.nis || '—'
                        const sUnit = st.unit_name || st.unit || schoolInfo.nama
                        const sKelas = st.kelas || st.rombel || '—'
                        const sStatus = st.status || 'Hadir'
                        const sTime = st.waktu || st.jam_masuk || '07:15 WIB'
                        const sKet = st.keterangan || 'Hadir Tepat Waktu'

                        return (
                          <tr key={i} className="hover:bg-emerald-50/50 dark:hover:bg-emerald-950/40 transition-colors">
                            <td className="px-4 py-3 text-center">
                              <Avatar size="sm" className="mx-auto ring-2 ring-emerald-500/20">
                                {photo && <AvatarImage src={photo} alt={sName} />}
                                <AvatarFallback className={st.gender === 'female' ? "bg-teal-100 text-teal-800 text-[10px] font-extrabold" : "bg-emerald-100 text-emerald-800 text-[10px] font-extrabold"}>
                                  {getInitials(sName)}
                                </AvatarFallback>
                              </Avatar>
                            </td>
                            <td className="px-4 py-3">
                              <div>
                                <span className="font-extrabold text-slate-900 dark:text-white block">{sName}</span>
                                <span className="font-mono text-[10px] text-slate-400">NISN {sNisn}</span>
                              </div>
                            </td>
                            <td className="px-4 py-3 font-semibold text-slate-700 dark:text-slate-300">{sUnit}</td>
                            <td className="px-4 py-3 font-bold text-slate-800 dark:text-slate-200">{sKelas}</td>
                            <td className="px-4 py-3 font-mono font-bold text-emerald-600 dark:text-emerald-400">{sTime}</td>
                            <td className="px-4 py-3">
                              <AppBadge variant={sStatus === 'Hadir' ? 'success' : sStatus === 'Terlambat' ? 'warning' : 'danger'}>
                                {sStatus}
                              </AppBadge>
                            </td>
                            <td className="px-4 py-3 text-slate-500 dark:text-slate-400">{sKet}</td>
                          </tr>
                        )
                      })
                    ) : (
                      <tr>
                        <td colSpan={6} className="px-4 py-8 text-center text-slate-400 italic">
                          Belum ada data presensi siswa tercatat.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </DialogBody>

            <DialogFooter className="pt-3 border-t border-slate-100 dark:border-slate-800">
              <AppButton variant="secondary" size="sm" onClick={() => setIsAttendanceModalOpen(false)}>
                Tutup Window
              </AppButton>
            </DialogFooter>
          </Dialog>


      {/* Rekapitulasi Prestasi Siswa (Data Riil Database) */}
      <StudentAchievementRecapSection
        achievements={tables?.rekap_prestasi || data?.rekap_prestasi || data?.tables?.rekap_prestasi || []}
        title={`Rekapitulasi Prestasi Siswa ${schoolInfo.nama}`}
        subtitle="Daftar pencapaian Tahfizh Al-Qur’an, Santri Pesantren, Sepakbola/Olahraga, dan Lomba Akademik dari database backend"
        onRefresh={fetchDashboard}
      />

      {/* KPI Detail Modal */}
      <ModalErrorBoundary onClose={() => setActiveModal(null)}>
        <KpiQuickViewModal
          type={activeModal}
          isOpen={Boolean(activeModal)}
          onClose={() => setActiveModal(null)}
        />
      </ModalErrorBoundary>
      </motion.div>
    </PageContainer>
  )
}
