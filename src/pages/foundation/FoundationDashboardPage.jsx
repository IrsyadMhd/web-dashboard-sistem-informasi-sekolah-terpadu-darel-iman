import React, { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Building2,
  Users,
  UserCheck,
  GraduationCap,
  HeartHandshake,
  School,
  Layers,
  Award,
  CheckCircle2,
  Clock3,
  TrendingUp,
  FileSpreadsheet,
  Sparkles,
  ArrowUpRight,
  ShieldCheck,
  Calendar,
  Bell,
  Activity,
  RefreshCw,
  Eye,
  Filter,
  Network,
} from 'lucide-react'
import {
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts'

const PASTEL_PALETTES = [
  { bg: 'bg-sky-50 dark:bg-sky-950/60', text: 'text-sky-600 dark:text-sky-400', border: 'border-sky-200/60 dark:border-sky-800/60', badge: 'bg-sky-100 text-sky-700 dark:bg-sky-900/60 dark:text-sky-300' },
  { bg: 'bg-emerald-50 dark:bg-emerald-950/60', text: 'text-emerald-600 dark:text-emerald-400', border: 'border-emerald-200/60 dark:border-emerald-800/60', badge: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/60 dark:text-emerald-300' },
  { bg: 'bg-purple-50 dark:bg-purple-950/60', text: 'text-purple-600 dark:text-purple-400', border: 'border-purple-200/60 dark:border-purple-800/60', badge: 'bg-purple-100 text-purple-700 dark:bg-purple-900/60 dark:text-purple-300' },
  { bg: 'bg-amber-50 dark:bg-amber-950/60', text: 'text-amber-600 dark:text-amber-400', border: 'border-amber-200/60 dark:border-amber-800/60', badge: 'bg-amber-100 text-amber-700 dark:bg-amber-900/60 dark:text-amber-300' },
  { bg: 'bg-pink-50 dark:bg-pink-950/60', text: 'text-pink-600 dark:text-pink-400', border: 'border-pink-200/60 dark:border-pink-800/60', badge: 'bg-pink-100 text-pink-700 dark:bg-pink-900/60 dark:text-pink-300' },
  { bg: 'bg-rose-50 dark:bg-rose-950/60', text: 'text-rose-600 dark:text-rose-400', border: 'border-rose-200/60 dark:border-rose-800/60', badge: 'bg-rose-100 text-rose-700 dark:bg-rose-900/60 dark:text-rose-300' },
]

const CATEGORY_COLOR_MAP = {
  all: {
    active: 'bg-emerald-700 text-white shadow-xs dark:bg-emerald-500 dark:text-slate-950',
    inactive: 'bg-emerald-50/80 text-emerald-800 border border-emerald-200/80 hover:bg-emerald-100 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800/60',
    countActive: 'bg-white/25 text-white dark:bg-slate-950/30 dark:text-slate-950',
    countInactive: 'bg-emerald-100 text-emerald-900 dark:bg-emerald-900/80 dark:text-emerald-200'
  },
  TK: {
    active: 'bg-sky-600 text-white shadow-xs dark:bg-sky-400 dark:text-slate-950',
    inactive: 'bg-sky-50/80 text-sky-800 border border-sky-200/80 hover:bg-sky-100 dark:bg-sky-950/50 dark:text-sky-300 dark:border-sky-800/60',
    countActive: 'bg-white/25 text-white dark:bg-slate-950/30 dark:text-slate-950',
    countInactive: 'bg-sky-100 text-sky-900 dark:bg-sky-900/80 dark:text-sky-200'
  },
  SD: {
    active: 'bg-amber-600 text-white shadow-xs dark:bg-amber-400 dark:text-slate-950',
    inactive: 'bg-amber-50/80 text-amber-800 border border-amber-200/80 hover:bg-amber-100 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800/60',
    countActive: 'bg-white/25 text-white dark:bg-slate-950/30 dark:text-slate-950',
    countInactive: 'bg-amber-100 text-amber-900 dark:bg-amber-900/80 dark:text-amber-200'
  },
  SMP: {
    active: 'bg-purple-600 text-white shadow-xs dark:bg-purple-400 dark:text-slate-950',
    inactive: 'bg-purple-50/80 text-purple-800 border border-purple-200/80 hover:bg-purple-100 dark:bg-purple-950/50 dark:text-purple-300 dark:border-purple-800/60',
    countActive: 'bg-white/25 text-white dark:bg-slate-950/30 dark:text-slate-950',
    countInactive: 'bg-purple-100 text-purple-900 dark:bg-purple-900/80 dark:text-purple-200'
  },
  SMA: {
    active: 'bg-rose-600 text-white shadow-xs dark:bg-rose-400 dark:text-slate-950',
    inactive: 'bg-rose-50/80 text-rose-800 border border-rose-200/80 hover:bg-rose-100 dark:bg-rose-950/50 dark:text-rose-300 dark:border-rose-800/60',
    countActive: 'bg-white/25 text-white dark:bg-slate-950/30 dark:text-slate-950',
    countInactive: 'bg-rose-100 text-rose-900 dark:bg-rose-900/80 dark:text-rose-200'
  },
  PON: {
    active: 'bg-indigo-600 text-white shadow-xs dark:bg-indigo-400 dark:text-slate-950',
    inactive: 'bg-indigo-50/80 text-indigo-800 border border-indigo-200/80 hover:bg-indigo-100 dark:bg-indigo-950/50 dark:text-indigo-300 dark:border-indigo-800/60',
    countActive: 'bg-white/25 text-white dark:bg-slate-950/30 dark:text-slate-950',
    countInactive: 'bg-indigo-100 text-indigo-900 dark:bg-indigo-900/80 dark:text-indigo-200'
  },
  MAH: {
    active: 'bg-teal-600 text-white shadow-xs dark:bg-teal-400 dark:text-slate-950',
    inactive: 'bg-teal-50/80 text-teal-800 border border-teal-200/80 hover:bg-teal-100 dark:bg-teal-950/50 dark:text-teal-300 dark:border-teal-800/60',
    countActive: 'bg-white/25 text-white dark:bg-slate-950/30 dark:text-slate-950',
    countInactive: 'bg-teal-100 text-teal-900 dark:bg-teal-900/80 dark:text-teal-200'
  },
}
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '../../components/tailgrids/core/chart'
import { Button } from '../../components/tailgrids/core/button'

import {
  AppPageHeader,
  AppBreadcrumb,
  AppFilterBar,
  KpiCard,
  SummaryCard,
  AppBadge,
  AppButton,
  ActionDropdown,
  SectionHeader,
} from '../../components/app'

import ChartCard from '../../components/dashboard/ChartCard'
import SkeletonDashboard from '../../components/dashboard/SkeletonDashboard'
import ErrorState from '../../components/dashboard/ErrorState'
import KpiQuickViewModal from '../../components/KpiQuickViewModal'
import ModalErrorBoundary from '../../components/common/ModalErrorBoundary'
import KpiDetailDrawer from '../../components/KpiDetailDrawer'

import api from '../../services/api'
import { useAuthStore } from '../../stores/authStore'

export function FoundationDashboardPage() {
  const navigate = useNavigate()
  const user = useAuthStore((state) => state.user)
  const roles = useMemo(() => (Array.isArray(user?.roles) ? user.roles : []), [user?.roles])
  const isKepalaSekolah = useMemo(
    () =>
      roles.some(
        (role) =>
          ['Kepala Sekolah', 'kepala_sekolah', 'KepalaSekolah', 'kepsek'].includes(String(role).trim()) ||
          String(role).toLowerCase().replace(/[\s_-]+/g, '') === 'kepalasekolah' ||
          String(role).toLowerCase().replace(/[\s_-]+/g, '') === 'kepsek'
      ),
    [roles]
  )
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [data, setData] = useState(null)
  const [selectedUnitFilter, setSelectedUnitFilter] = useState('all')
  const [selectedPeriodFilter, setSelectedPeriodFilter] = useState('year')
  const [activeModal, setActiveModal] = useState(null)
  const [detailDrawer, setDetailDrawer] = useState({ isOpen: false, type: null, id: null })
  const [unitsList, setUnitsList] = useState([])
  const [cardUnitFilter, setCardUnitFilter] = useState('all')

  const fetchDashboard = async (unitId = selectedUnitFilter, period = selectedPeriodFilter) => {
    setLoading(true)
    setError(null)
    try {
      const res = await api.get('/foundation/dashboard', {
        params: { unit_id: unitId, period }
      })
      if (res.data && res.data.data) {
        setData(res.data.data)
      } else {
        setError('Format respon server tidak valid.')
      }
    } catch (err) {
      console.error('Failed to load foundation dashboard:', err)
      setError(err?.response?.data?.message || 'Gagal memuat data dashboard yayasan.')
    } finally {
      setLoading(false)
    }
  }

  const fetchUnits = async () => {
    try {
      const res = await api.get('/foundation/units')
      if (res.data && res.data.data) {
        setUnitsList(res.data.data)
      }
    } catch (err) {
      console.error('Failed to load units for filter:', err)
    }
  }

  useEffect(() => {
    fetchUnits()
    fetchDashboard('all', 'year')
  }, [])

  const handleUnitFilterChange = (unitId) => {
    setSelectedUnitFilter(unitId)
    fetchDashboard(unitId, selectedPeriodFilter)
  }

  const handleResetFilter = () => {
    setSelectedUnitFilter('all')
    setSelectedPeriodFilter('year')
    fetchDashboard('all', 'year')
  }

  const handleOpenUnitDetail = (unit) => {
    setDetailDrawer({
      isOpen: true,
      type: 'unit_pendidikan',
      id: unit.id,
    })
  }

  const kpis = data?.kpis || {}
  const charts = data?.charts || {}
  const unitSummaries = data?.unit_summaries || []
  const recentInformation = data?.recent_information || []
  const recentActivities = data?.recent_activities || []
  const monitoringAkademik = data?.monitoring_akademik || {}
  const monitoringIbadah = data?.monitoring_ibadah || {}
  const unitRankings = data?.unit_rankings || []
  const agendaYayasan = data?.agenda_yayasan || []
  const activeYear = data?.active_academic_year
  const activeSemester = data?.active_semester
  const prestasiDistribution = charts.prestasi_distribution || []
  const sdmDistribution = charts.sdm_distribution || []

  const getUnitCategoryKey = (row) => {
    const code = (row.code || '').toUpperCase()
    const name = (row.name || '').toUpperCase()
    const jenis = (row.jenis_unit || row.level || '').toUpperCase()

    if (
      code.includes('TK') ||
      code.includes('TAU') ||
      name.includes('TK') ||
      name.includes('TAUD') ||
      jenis.includes('KANAK') ||
      jenis.includes('USIA DINI')
    ) {
      return 'TK'
    }
    if (
      code.includes('SD') ||
      code.includes('MIT') ||
      name.includes('SD') ||
      name.includes('MIT') ||
      jenis.includes('DASAR') ||
      jenis.includes('IBTIDAIYAH')
    ) {
      return 'SD'
    }
    if (code.includes('SMP') || name.includes('SMP') || jenis.includes('PERTAMA')) {
      return 'SMP'
    }
    if (code.includes('SMA') || name.includes('SMA') || jenis.includes('ATAS')) {
      return 'SMA'
    }
    if (
      code.includes('PON') ||
      name.includes('PONPES') ||
      name.includes('PESANTREN') ||
      jenis.includes('PESANTREN')
    ) {
      return 'PON'
    }
    if (
      code.includes('MAH') ||
      name.includes('MAHAD') ||
      name.includes("MA'HAD") ||
      jenis.includes('MAHAD') ||
      jenis.includes("MA'HAD")
    ) {
      return 'MAH'
    }
    return code || 'OTHERS'
  }

  const getShortUnitBadgeLabel = (row) => {
    const val = (row?.jenis_unit || row?.level || '').trim()
    if (!val) return 'Unit'
    const upper = val.toUpperCase()
    if (upper.includes('KANAK') || upper.includes('TK')) return 'TKIT'
    if (upper.includes('USIA DINI') || upper.includes('TAUD')) return 'TAUD'
    if (upper.includes('DASAR') || upper.includes('SD')) return 'SDIT'
    if (upper.includes('IBTIDAIYAH') || upper.includes('MIT')) return 'MIT'
    if (upper.includes('PERTAMA') || upper.includes('SMP')) return 'SMPIT'
    if (upper.includes('ATAS') || upper.includes('SMA')) return 'SMAIT'
    if (upper.includes('PESANTREN') || upper.includes('PON')) return 'Ponpes'
    if (upper.includes('MAHAD') || upper.includes("MA'HAD") || upper.includes('MAH')) return "Ma'had"
    if (val.length > 12) return val.substring(0, 10) + '...'
    return val
  }

  const categoryCounts = useMemo(() => {
    const counts = {
      all: unitSummaries.length,
      TK: 0,
      SD: 0,
      SMP: 0,
      SMA: 0,
      PON: 0,
      MAH: 0,
    }
    unitSummaries.forEach((row) => {
      const key = getUnitCategoryKey(row)
      if (counts[key] !== undefined) {
        counts[key] += 1
      } else {
        counts[key] = (counts[key] || 0) + 1
      }
    })
    return counts
  }, [unitSummaries])

  const availableFilterCategories = useMemo(() => {
    const defaultCats = [
      { id: 'all', label: 'Semua Unit' },
      { id: 'TK', label: 'TK / PAUD' },
      { id: 'SD', label: 'SD / MI' },
      { id: 'SMP', label: 'SMP' },
      { id: 'SMA', label: 'SMA' },
      { id: 'PON', label: 'Pondok Pesantren' },
      { id: 'MAH', label: "Ma'had" },
    ]
    const extraKeys = Object.keys(categoryCounts).filter(
      (k) => !defaultCats.some((c) => c.id === k) && categoryCounts[k] > 0
    )
    extraKeys.forEach((k) => {
      defaultCats.push({ id: k, label: k })
    })
    return defaultCats
  }, [categoryCounts])

  const filteredUnitSummaries = useMemo(() => {
    if (cardUnitFilter === 'all') return unitSummaries
    return unitSummaries.filter((row) => {
      const catKey = getUnitCategoryKey(row)
      if (cardUnitFilter === catKey) return true
      const code = (row.code || '').toUpperCase()
      const jenis = (row.jenis_unit || row.level || '').toUpperCase()
      return code === cardUnitFilter.toUpperCase() || jenis === cardUnitFilter.toUpperCase()
    })
  }, [unitSummaries, cardUnitFilter])

  if (loading && !data) return <SkeletonDashboard />
  if (error && !data) return <ErrorState message={error} onRetry={() => fetchDashboard(selectedUnitFilter)} />

  const formatNumber = (num) => (num !== undefined && num !== null ? Number(num).toLocaleString('id-ID') : '0')

  const isFiltered = selectedUnitFilter !== 'all' || selectedPeriodFilter !== 'year'

  return (
    <div className="space-y-6 pb-12">
      {/* Breadcrumb Navigation */}
      <AppBreadcrumb items={[{ label: isKepalaSekolah ? 'Dashboard Kepala Sekolah' : 'Dashboard Pengurus Yayasan' }]} />

      {/* Informasi Resmi & Aktivitas Terbaru */}
      <section className="space-y-3">
        {/* <SectionHeader
          title="Informasi Resmi & Aktivitas Terbaru"
          subtitle="Pengumuman resmi yayasan dan log aktivitas sistem terkini"
        /> */}

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
          {/* Announcements Feed (Card 1 - Soft Blue Accent) */}
          <div className="rounded-[20px] border border-sky-200/80 bg-white p-5 shadow-sm space-y-4 lg:col-span-7 dark:border-sky-900/50 dark:bg-[#1B2433]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[14px] border border-sky-200/80 bg-sky-50 text-sky-600 dark:border-sky-800/60 dark:bg-sky-950/60 dark:text-sky-400">
                  <Bell className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">Pengumuman & Agenda Yayasan</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Informasi dan edaran resmi terbaru</p>
                </div>
              </div>
              <span className="inline-flex items-center gap-1 rounded-xl bg-sky-100/90 px-3 py-1 text-xs font-black text-sky-800 dark:bg-sky-900/70 dark:text-sky-300">
                {recentInformation.length} Informasi
              </span>
            </div>

            <div className="space-y-3">
              {recentInformation.map((info) => (
                <div
                  key={info.id}
                  className="group rounded-xl border border-sky-100 border-l-4 border-l-sky-500 bg-sky-50/40 p-3.5 transition-all duration-200 hover:border-sky-300 hover:bg-sky-50/80 dark:border-sky-900/40 dark:border-l-sky-400 dark:bg-sky-950/20 dark:hover:bg-sky-950/40 space-y-1.5"
                >
                  <div className="flex items-start justify-between gap-3">
                    <h4 className="text-xs font-extrabold text-slate-900 group-hover:text-sky-600 dark:text-white dark:group-hover:text-sky-400 transition line-clamp-1">
                      {info.judul}
                    </h4>
                    <span className="shrink-0 rounded-md bg-sky-100 px-2 py-0.5 text-[10px] font-extrabold text-sky-700 dark:bg-sky-900/80 dark:text-sky-300">
                      {info.tanggal}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed">{info.isi}</p>
                </div>
              ))}
              {!recentInformation.length && (
                <p className="py-8 text-center text-xs text-slate-400 italic">Belum ada pengumuman resmi terbaru.</p>
              )}
            </div>
          </div>

          {/* Activity Feed (Card 2 - Soft Emerald Green Accent) */}
          <div className="rounded-[20px] border border-emerald-200/80 bg-white p-5 shadow-sm space-y-4 lg:col-span-5 dark:border-emerald-900/50 dark:bg-[#1B2433]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[14px] border border-emerald-200/80 bg-emerald-50 text-emerald-600 dark:border-emerald-800/60 dark:bg-emerald-950/60 dark:text-emerald-400">
                  <Activity className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">Aktivitas Sistem Terbaru</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Log transaksi presensi dan aktivitas</p>
                </div>
              </div>
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500" />
              </span>
            </div>

            <div className="space-y-2.5">
              {recentActivities.map((act) => (
                <div
                  key={act.id}
                  className="group flex items-center justify-between gap-3 rounded-xl border border-emerald-100 border-l-4 border-l-emerald-500 bg-emerald-50/40 p-3 transition-all duration-200 hover:border-emerald-300 hover:bg-emerald-50/80 dark:border-emerald-900/40 dark:border-l-emerald-400 dark:bg-emerald-950/20 dark:hover:bg-emerald-950/40"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-extrabold text-slate-900 dark:text-white truncate group-hover:text-emerald-700 dark:group-hover:text-emerald-300 transition">
                      {act.title}
                    </p>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 truncate font-medium">
                      {act.subtitle}
                    </p>
                  </div>
                  <span className="shrink-0 rounded-lg bg-emerald-100 px-2.5 py-1 text-[10px] font-black text-emerald-800 dark:bg-emerald-900/90 dark:text-emerald-200">
                    {act.time}
                  </span>
                </div>
              ))}
              {!recentActivities.length && (
                <p className="py-8 text-center text-xs text-slate-400 italic">Belum ada aktivitas terbaru tercatat.</p>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Filter Global Unit & Periode & Akses Cepat Modul Eksekutif */}
      <section className="space-y-3">
        <AppFilterBar
          label="Filter Monitoring"
          activeCount={isFiltered ? (selectedUnitFilter !== 'all' ? 1 : 0) + (selectedPeriodFilter !== 'year' ? 1 : 0) : 0}
          onReset={handleResetFilter}
        >
          <div className="flex flex-1 flex-wrap items-center gap-3 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 shrink-0">Unit Pendidikan:</span>
              <select
                value={selectedUnitFilter}
                onChange={(e) => handleUnitFilterChange(e.target.value)}
                className="h-9.5 min-w-[200px] rounded-xl border border-slate-200/80 bg-white px-3 text-xs font-bold text-slate-700 outline-none transition focus:border-[#0E5C44] focus:ring-2 focus:ring-[#0E5C44]/20 dark:border-slate-800 dark:bg-[#111827] dark:text-slate-200 dark:focus:border-[#3FBF75]"
              >
                <option value="all">Semua Unit Pendidikan (15 Unit)</option>
                {unitsList.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name} ({u.code || u.jenis_unit || 'Unit'})
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 shrink-0">Periode:</span>
              <select
                value={selectedPeriodFilter}
                onChange={(e) => {
                  setSelectedPeriodFilter(e.target.value)
                  fetchDashboard(selectedUnitFilter, e.target.value)
                }}
                className="h-9.5 rounded-xl border border-slate-200/80 bg-white px-3 text-xs font-bold text-slate-700 outline-none transition focus:border-[#0E5C44] focus:ring-2 focus:ring-[#0E5C44]/20 dark:border-slate-800 dark:bg-[#111827] dark:text-slate-200 dark:focus:border-[#3FBF75]"
              >
                <option value="year">Tahun Berjalan</option>
                <option value="month">Bulan Ini</option>
                <option value="semester">Semester Ini</option>
              </select>
            </div>
          </div>
        </AppFilterBar>

        {/* Card Akses Cepat Modul Eksekutif (5 Buttons dengan Style Soft Pastel Squircle Unik) */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-4.5 shadow-sm dark:border-slate-800 dark:bg-[#1B2433]">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-[#0E5C44]/10 text-[#0E5C44] dark:bg-[#3FBF75]/20 dark:text-[#3FBF75]">
                  <Sparkles className="h-3.5 w-3.5" />
                </span>
                <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">Akses Cepat Modul Eksekutif</h3>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Navigasi langsung ke modul monitoring spesifik yayasan</p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
              {/* 1. Pegawai & Guru Seluruh Unit */}
              <button
                type="button"
                onClick={() => navigate('/dashboard/yayasan/pegawai-guru')}
                className="group flex items-center gap-3 rounded-2xl border border-slate-200/80 bg-white p-3 shadow-xs transition-all duration-200 hover:scale-105 hover:shadow-md dark:border-slate-800 dark:bg-[#1B2433] text-left"
              >
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[16px] border bg-emerald-50 text-emerald-600 border-emerald-200/60 transition-transform duration-200 group-hover:scale-110 dark:bg-emerald-950/60 dark:text-emerald-400 dark:border-emerald-800/60">
                  <UserCheck className="h-5 w-5" />
                </div>
                <div className="min-w-0 pr-1">
                  <p className="text-xs font-extrabold text-slate-900 dark:text-white truncate group-hover:text-emerald-700 dark:group-hover:text-emerald-300">Pegawai & Guru</p>
                  <p className="text-[10px] text-slate-400 font-medium truncate">SDM Seluruh Unit</p>
                </div>
              </button>

              {/* 2. Struktur Organisasi */}
              <button
                type="button"
                onClick={() => navigate('/dashboard/yayasan/struktur-organisasi')}
                className="group flex items-center gap-3 rounded-2xl border border-slate-200/80 bg-white p-3 shadow-xs transition-all duration-200 hover:scale-105 hover:shadow-md dark:border-slate-800 dark:bg-[#1B2433] text-left"
              >
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[16px] border bg-sky-50 text-sky-600 border-sky-200/60 transition-transform duration-200 group-hover:scale-110 dark:bg-sky-950/60 dark:text-sky-400 dark:border-sky-800/60">
                  <Network className="h-5 w-5" />
                </div>
                <div className="min-w-0 pr-1">
                  <p className="text-xs font-extrabold text-slate-900 dark:text-white truncate group-hover:text-sky-700 dark:group-hover:text-sky-300">Struktur Organisasi</p>
                  <p className="text-[10px] text-slate-400 font-medium truncate">Hirarki Per Unit</p>
                </div>
              </button>

              {/* 3. Data Siswa */}
              <button
                type="button"
                onClick={() => navigate('/dashboard/yayasan/siswa')}
                className="group flex items-center gap-3 rounded-2xl border border-slate-200/80 bg-white p-3 shadow-xs transition-all duration-200 hover:scale-105 hover:shadow-md dark:border-slate-800 dark:bg-[#1B2433] text-left"
              >
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[16px] border bg-purple-50 text-purple-600 border-purple-200/60 transition-transform duration-200 group-hover:scale-110 dark:bg-purple-950/60 dark:text-purple-400 dark:border-purple-800/60">
                  <Users className="h-5 w-5" />
                </div>
                <div className="min-w-0 pr-1">
                  <p className="text-xs font-extrabold text-slate-900 dark:text-white truncate group-hover:text-purple-700 dark:group-hover:text-purple-300">Data Siswa</p>
                  <p className="text-[10px] text-slate-400 font-medium truncate">Tahun Ajaran</p>
                </div>
              </button>

              {/* 4. Siswa Masuk & Keluar */}
              <button
                type="button"
                onClick={() => navigate('/dashboard/yayasan/siswa-baru')}
                className="group flex items-center gap-3 rounded-2xl border border-slate-200/80 bg-white p-3 shadow-xs transition-all duration-200 hover:scale-105 hover:shadow-md dark:border-slate-800 dark:bg-[#1B2433] text-left"
              >
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[16px] border bg-amber-50 text-amber-600 border-amber-200/60 transition-transform duration-200 group-hover:scale-110 dark:bg-amber-950/60 dark:text-amber-400 dark:border-amber-800/60">
                  <GraduationCap className="h-5 w-5" />
                </div>
                <div className="min-w-0 pr-1">
                  <p className="text-xs font-extrabold text-slate-900 dark:text-white truncate group-hover:text-amber-700 dark:group-hover:text-amber-300">Siswa Masuk/Keluar</p>
                  <p className="text-[10px] text-slate-400 font-medium truncate">Mobilisasi Siswa</p>
                </div>
              </button>

              {/* 5. Unit Pendidikan */}
              <button
                type="button"
                onClick={() => navigate('/dashboard/yayasan/unit-pendidikan')}
                className="group flex items-center gap-3 rounded-2xl border border-slate-200/80 bg-white p-3 shadow-xs transition-all duration-200 hover:scale-105 hover:shadow-md dark:border-slate-800 dark:bg-[#1B2433] text-left"
              >
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[16px] border bg-pink-50 text-pink-600 border-pink-200/60 transition-transform duration-200 group-hover:scale-110 dark:bg-pink-950/60 dark:text-pink-400 dark:border-pink-800/60">
                  <Building2 className="h-5 w-5" />
                </div>
                <div className="min-w-0 pr-1">
                  <p className="text-xs font-extrabold text-slate-900 dark:text-white truncate group-hover:text-pink-700 dark:group-hover:text-pink-300">Unit Pendidikan</p>
                  <p className="text-[10px] text-slate-400 font-medium truncate">Seluruh Unit</p>
                </div>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* KPI Cards Grid (Canonical KpiCard Session 3) */}
      <section className="space-y-3">
        <SectionHeader
          title="Kinerja Eksekutif Yayasan"
          subtitle="Ringkasan agregat real-time dari PostgreSQL seluruh unit pendidikan"
          badge="Monitoring Real-Time"
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiCard
            title="Total Unit Pendidikan"
            value={formatNumber(kpis.unit_pendidikan?.total ?? kpis.total_unit_aktif ?? unitsList.length)}
            trend={kpis.unit_pendidikan?.growth ?? kpis.growth_unit}
            trendType={(kpis.unit_pendidikan?.growth ?? 0) >= 0 ? 'up' : 'down'}
            trendText="unit baru bulan ini"
            icon={Building2}
            colorScheme="emerald"
            badge="15 Unit"
            badgeVariant="success"
            onClick={() => setActiveModal('total_unit')}
          />

          <KpiCard
            title="Guru & Pendidik"
            value={formatNumber(kpis.guru?.total ?? kpis.total_guru)}
            trend={kpis.guru?.growth ?? kpis.growth_guru}
            trendType={(kpis.guru?.growth ?? 0) >= 0 ? 'up' : 'down'}
            trendText="vs bulan lalu"
            icon={GraduationCap}
            colorScheme="blue"
            badge="SDM Guru"
            badgeVariant="info"
            onClick={() => setActiveModal('total_guru')}
          />

          <KpiCard
            title="Pegawai & Tendik"
            value={formatNumber(kpis.pegawai?.total ?? kpis.total_pegawai)}
            trend={kpis.pegawai?.growth ?? kpis.growth_pegawai}
            trendType={(kpis.pegawai?.growth ?? 0) >= 0 ? 'up' : 'down'}
            trendText="vs bulan lalu"
            icon={UserCheck}
            colorScheme="violet"
            badge="Tendik"
            badgeVariant="purple"
            onClick={() => setActiveModal('total_pegawai')}
          />

          <KpiCard
            title="Siswa Aktif"
            value={formatNumber(kpis.siswa?.total ?? kpis.total_siswa_aktif)}
            trend={kpis.siswa?.growth ?? kpis.growth_siswa}
            trendType={(kpis.siswa?.growth ?? 0) >= 0 ? 'up' : 'down'}
            trendText="siswa terdaftar"
            icon={Users}
            colorScheme="indigo"
            badge="Terdaftar"
            badgeVariant="success"
            onClick={() => setActiveModal('total_siswa')}
          />

          <KpiCard
            title="Orang Tua / Wali"
            value={formatNumber(kpis.orang_tua?.total ?? kpis.total_ortu)}
            trend={kpis.orang_tua?.growth ?? kpis.growth_ortu}
            trendType="up"
            trendText="akun wali murid"
            icon={HeartHandshake}
            colorScheme="rose"
            badge="Wali"
            badgeVariant="warning"
            onClick={() => setActiveModal('total_ortu')}
          />

          <KpiCard
            title="Total Alumni"
            value={formatNumber(kpis.alumni?.total ?? kpis.total_alumni)}
            trend={kpis.alumni?.growth ?? kpis.growth_alumni}
            trendType="up"
            trendText="alumni terdata"
            icon={Sparkles}
            colorScheme="amber"
            badge="Lulusan"
            badgeVariant="purple"
            onClick={() => setActiveModal('total_alumni')}
          />

          <KpiCard
            title="Total Kelas"
            value={formatNumber(kpis.kelas?.total ?? kpis.total_kelas)}
            trend={kpis.kelas?.growth ?? kpis.growth_kelas}
            trendType="neutral"
            trendText="ruang kelas"
            icon={School}
            colorScheme="blue"
            badge="Kelas"
            badgeVariant="info"
            onClick={() => setActiveModal('total_kelas')}
          />

          <KpiCard
            title="Total Rombel"
            value={formatNumber(kpis.rombel?.total ?? kpis.total_rombel)}
            trend={kpis.rombel?.growth ?? kpis.growth_rombel}
            trendType="up"
            trendText="rombongan belajar"
            icon={Layers}
            colorScheme="emerald"
            badge="Rombel"
            badgeVariant="success"
            onClick={() => setActiveModal('total_rombel')}
          />
        </div>
      </section>

      {/* Ringkasan Operasional & Monitoring Akademik */}
      <section className="space-y-3">
        <SectionHeader
          title="Monitoring Operasional & Akademik"
          subtitle="Kondisi presensi, input nilai, tahfizh, dan mutaba'ah ibadah harian"
        />

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7">
          <SummaryCard
            title="Kehadiran Guru"
            value={`${monitoringAkademik.kehadiran_guru ?? 100}%`}
            icon={UserCheck}
            colorScheme="emerald"
          />
          <SummaryCard
            title="Kehadiran Siswa"
            value={`${monitoringAkademik.kehadiran_siswa ?? 100}%`}
            icon={Users}
            colorScheme="blue"
          />
          <SummaryCard
            title="Input Nilai"
            value={`${monitoringAkademik.input_nilai ?? 100}%`}
            icon={CheckCircle2}
            colorScheme="violet"
          />
          <SummaryCard
            title="Input Tahfizh"
            value={`${monitoringAkademik.input_tahfiz ?? 100}%`}
            icon={Award}
            colorScheme="amber"
          />
          <SummaryCard
            title="Input Mutaba'ah"
            value={`${monitoringAkademik.input_mutabaah ?? 100}%`}
            icon={HeartHandshake}
            colorScheme="indigo"
          />
          <SummaryCard
            title="Terlambat Hari Ini"
            value={formatNumber(monitoringAkademik.terlambat_hari_ini)}
            icon={Clock3}
            colorScheme="amber"
          />
          <SummaryCard
            title="Tidak Hadir"
            value={formatNumber(monitoringAkademik.tidak_hadir_hari_ini)}
            icon={UserCheck}
            colorScheme="rose"
          />
        </div>

        {/* Demographic & Movement Breakdown */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          <SummaryCard
            title="Siswa Baru"
            value={formatNumber(kpis.siswa_baru)}
            description="Tahun ajaran berjalan"
            icon={TrendingUp}
            colorScheme="emerald"
          />
          <SummaryCard
            title="Mutasi Masuk"
            value={formatNumber(kpis.mutasi_masuk)}
            description="Siswa pindahan masuk"
            icon={TrendingUp}
            colorScheme="blue"
          />
          <SummaryCard
            title="Mutasi Keluar"
            value={formatNumber(kpis.mutasi_keluar)}
            description="Siswa pindahan keluar"
            icon={TrendingUp}
            colorScheme="amber"
          />
          <SummaryCard
            title="Siswa Lulus"
            value={formatNumber(kpis.siswa_lulus)}
            description="Telah menyelesaikan pendidikan"
            icon={GraduationCap}
            colorScheme="indigo"
          />
        </div>
      </section>

      {/* Visual Analytics & Charts */}
      <section className="space-y-3">
        <SectionHeader
          title="Analitik Capaian & Distribusi Lintas Unit"
          subtitle="Visualisasi grafik distribusi SDM, capaian prestasi, dan mutaba'ah ibadah"
        />

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
          {/* Chart 1: Distribusi SDM Guru & Tendik per Unit */}
          <ChartCard
            title="Distribusi SDM per Unit Pendidikan"
            subtitle="Perbandingan jumlah Guru vs Tendik di seluruh unit"
            className="lg:col-span-6"
            empty={!sdmDistribution || sdmDistribution.length === 0}
          >
            <div className="h-56 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={sdmDistribution} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                  <XAxis dataKey="code" fontSize={10} interval={0} angle={-30} textAnchor="end" />
                  <YAxis fontSize={10} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1E293B',
                      border: 'none',
                      borderRadius: '12px',
                      color: '#FFF',
                      fontSize: '12px',
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                  <Bar dataKey="guru" fill="#0E5C44" name="Guru" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="tendik" fill="#3FBF75" name="Tendik" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>

          {/* Chart 2: Monitoring Mutaba'ah Ibadah */}
          <div className="rounded-[18px] border border-slate-200/80 bg-white p-5 shadow-sm space-y-4 lg:col-span-3 dark:border-slate-800 dark:bg-[#1B2433]">
            <div>
              <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">Monitoring Ibadah Harian</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Tingkat kelengkapan mutaba'ah siswa</p>
            </div>

            <div className="space-y-3 pt-1">
              {[
                { label: 'Shalat Wajib & Sunnah', value: monitoringIbadah.shalat },
                { label: 'Tilawah Al-Qur\'an', value: monitoringIbadah.tilawah },
                { label: 'Muraja\'ah Hafalan', value: monitoringIbadah.murajaah },
                { label: 'Mutaba\'ah Terverifikasi', value: monitoringIbadah.mutabaah },
              ].map((item) => (
                <div key={item.label} className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="text-slate-700 dark:text-slate-300">{item.label}</span>
                    <span className="text-[#0E5C44] dark:text-[#3FBF75] font-black">{item.value ?? 0}%</span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-[#0E5C44] to-[#3FBF75] transition-all duration-300"
                      style={{ width: `${Math.min(100, Math.max(0, Number(item.value) || 0))}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Chart 3: Distribusi Prestasi Siswa */}
          <ChartCard
            title="Distribusi Prestasi Siswa"
            subtitle="Kategori capaian prestasi terdaftar"
            className="lg:col-span-3"
            empty={!prestasiDistribution.some((item) => Number(item.value) > 0)}
          >
            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={prestasiDistribution}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={45}
                    outerRadius={70}
                    paddingAngle={3}
                  >
                    {prestasiDistribution.map((entry, index) => (
                      <Cell
                        key={`${entry.name}-${index}`}
                        fill={entry.color || ['#0E5C44', '#3FBF75', '#F59E0B', '#8B5CF6', '#EF4444'][index % 5]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend iconSize={8} wrapperStyle={{ fontSize: '10px' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>
        </div>
      </section>

      {/* Cross-Unit Comparison & Performance Ranking */}
      <section className="space-y-3">
        <SectionHeader
          title="Perbandingan Kinerja Unit Pendidikan"
          subtitle="Daftar unit pendidikan beserta statistik jumlah siswa, guru, pegawai, dan rombel"
          actions={
            <AppButton
              variant="outline"
              size="sm"
              icon={Building2}
              onClick={() => navigate('/dashboard/yayasan/unit-pendidikan')}
            >
              Lihat Seluruh Unit
            </AppButton>
          }
        />

        {/* Filter Selection Bar for Card Unit Types */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-2xl border border-slate-200/80 bg-white p-3 shadow-xs dark:border-slate-800 dark:bg-[#1B2433]">
          {/* Category Filter Pills (Desktop & Tablet) */}
          <div className="flex flex-wrap items-center gap-1.5 min-w-0">
            <span className="text-xs font-bold text-slate-400 mr-1 hidden sm:inline-flex items-center gap-1">
              <Filter className="h-3.5 w-3.5 text-slate-400" />
              Jenis Unit:
            </span>
            {availableFilterCategories.map((cat) => {
              const count = categoryCounts[cat.id] || 0
              const isActive = cardUnitFilter === cat.id
              const catColors = CATEGORY_COLOR_MAP[cat.id] || CATEGORY_COLOR_MAP.all
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setCardUnitFilter(cat.id)}
                  className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition-all duration-200 ${isActive
                    ? `${catColors.active} scale-[1.03]`
                    : catColors.inactive
                    }`}
                >
                  <span>{cat.label}</span>
                  <span
                    className={`rounded-md px-1.5 py-0.5 text-[10px] font-extrabold ${isActive
                      ? catColors.countActive
                      : catColors.countInactive
                      }`}
                  >
                    {count}
                  </span>
                </button>
              )
            })}
          </div>

          {/* Select Dropdown (Mobile) & Counter */}
          <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
            <select
              value={cardUnitFilter}
              onChange={(e) => setCardUnitFilter(e.target.value)}
              className="h-8.5 rounded-xl border border-slate-200/80 bg-slate-50 px-2.5 text-xs font-bold text-slate-700 outline-none transition focus:border-[#0E5C44] dark:border-slate-800 dark:bg-[#111827] dark:text-slate-200 sm:hidden"
            >
              {availableFilterCategories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.label} ({categoryCounts[cat.id] || 0})
                </option>
              ))}
            </select>
            <span className="text-xs font-medium text-slate-400">
              Menampilkan <strong className="font-extrabold text-slate-700 dark:text-slate-200">{filteredUnitSummaries.length}</strong> dari {unitSummaries.length} unit
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {filteredUnitSummaries.map((row, idx) => {
            const palette = PASTEL_PALETTES[idx % PASTEL_PALETTES.length]
            const shortBadge = getShortUnitBadgeLabel(row)
            const fullBadge = row.jenis_unit || row.level || 'Unit'
            const avatarCode = (row.code || getUnitCategoryKey(row) || 'UN').substring(0, 4).toUpperCase()

            return (
              <button
                key={row.id}
                type="button"
                onClick={() => handleOpenUnitDetail(row)}
                className="group flex items-center justify-between gap-2.5 rounded-2xl border border-slate-200/80 bg-white p-3.5 shadow-xs transition-all duration-200 hover:scale-[1.02] hover:shadow-md dark:border-slate-800 dark:bg-[#1B2433] text-left"
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-[16px] border ${palette.bg} ${palette.text} ${palette.border} font-black text-xs transition-transform duration-200 group-hover:scale-110`}>
                    {avatarCode}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4
                      className="font-extrabold text-xs text-slate-900 dark:text-white truncate group-hover:text-emerald-700 dark:group-hover:text-emerald-300"
                      title={row.name}
                    >
                      {row.name}
                    </h4>
                    <p className="text-[10px] text-slate-400 font-medium truncate mt-0.5">
                      {row.siswa_aktif_count ?? row.siswa_count ?? 0} Siswa • {row.guru_count || 0} Guru
                    </p>
                  </div>
                </div>
                <span
                  className={`shrink-0 max-w-[95px] sm:max-w-[110px] truncate rounded-lg px-2 py-1 text-[10px] font-extrabold ${palette.badge}`}
                  title={fullBadge}
                >
                  {shortBadge}
                </span>
              </button>
            )
          })}
          {!filteredUnitSummaries.length && (
            <div className="col-span-full py-12 text-center rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/20">
              <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Tidak ada unit pendidikan pada jenis unit ini.</p>
              <button
                type="button"
                onClick={() => setCardUnitFilter('all')}
                className="mt-2 text-xs font-bold text-[#0E5C44] hover:underline dark:text-[#3FBF75]"
              >
                Tampilkan Semua Unit
              </button>
            </div>
          )}
        </div>
      </section>





      {/* Modal Quick View KPI (Data PostgreSQL Real) */}
      <ModalErrorBoundary onClose={() => setActiveModal(null)}>
        <KpiQuickViewModal
          type={activeModal}
          isOpen={Boolean(activeModal)}
          onClose={() => setActiveModal(null)}
        />
      </ModalErrorBoundary>

      {/* Canonical Detail Drawer Slide-over */}
      <KpiDetailDrawer
        type={detailDrawer.type}
        id={detailDrawer.id}
        isOpen={detailDrawer.isOpen}
        onClose={() => setDetailDrawer({ isOpen: false, type: null, id: null })}
      />
    </div>
  )
}

export default FoundationDashboardPage
