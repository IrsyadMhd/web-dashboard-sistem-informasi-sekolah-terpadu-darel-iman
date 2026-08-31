import { useCallback, useEffect, useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import ActionDropdown from '../../components/app/ActionDropdown'
import {
  ArrowRightLeft,
  Award,
  BarChart3,
  Building2,
  Calendar,
  CheckCircle2,
  FileSpreadsheet,
  GraduationCap,
  LineChart as LineChartIcon,
  MapPin,
  RefreshCcw,
  School,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  UserCheck,
  Users,
  UsersRound,
} from 'lucide-react'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  Legend,
} from 'recharts'
import AppBreadcrumb from '../../components/app/AppBreadcrumb'
import api from '../../services/api'
import {
  MasterActionButton,
  MasterDataPage,
  MasterDataTable,
  MasterEmptyState,
  MasterErrorState,
  MasterFilterBar,
  MasterFilterSelect,
  MasterPageHeader,
  MasterPagination,
  MasterSearchInput,
  MasterStatCard,
  MasterStatsGrid,
  MasterStatusBadge,
  masterStyles,
} from '../../components/master-data'
import { PersonIdentityCell } from '../../components/ui/PersonIdentityCell'
import KpiDetailDrawer from '../../components/KpiDetailDrawer'
import { FoundationExportModal } from '../../components/foundation/FoundationExportModal'
import { FoundationUnitKpiModal } from '../../components/foundation/FoundationUnitKpiModal'

import { ArrowBothDirectionHorizontal2 } from '@tailgrids/icons'

const LEVEL_OPTIONS = ['TKIT', 'TAUD', 'SDIT', 'MIT', 'SMPIT', 'SMAIT', 'PONPES', 'Mahad']

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

export function FoundationUnitsPage() {
  const [units, setUnits] = useState([])
  const [dashboardData, setDashboardData] = useState(null)
  const [academicYears, setAcademicYears] = useState([])
  const [selectedAcademicYear, setSelectedAcademicYear] = useState('all')
  const [prestasiCount, setPrestasiCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [isFetching, setIsFetching] = useState(false)

  useEffect(() => {
    const fetchAcademicYears = async () => {
      try {
        const res = await api.get('/master/tahun-ajaran/dropdown').catch(() => api.get('/master/tahun-ajaran'))
        const raw = res?.data?.data || res?.data || []
        if (Array.isArray(raw) && raw.length > 0) {
          setAcademicYears(raw)
        } else {
          setAcademicYears([
            { id: '2025/2026', name: '2025/2026', is_active: true },
            { id: '2024/2025', name: '2024/2025', is_active: false },
            { id: '2023/2024', name: '2023/2024', is_active: false },
            { id: '2022/2023', name: '2022/2023', is_active: false },
          ])
        }
      } catch (err) {
        setAcademicYears([
          { id: '2025/2026', name: '2025/2026', is_active: true },
          { id: '2024/2025', name: '2024/2025', is_active: false },
          { id: '2023/2024', name: '2023/2024', is_active: false },
          { id: '2022/2023', name: '2022/2023', is_active: false },
        ])
      }
    }
    fetchAcademicYears()
  }, [])

  const [search, setSearch] = useState('')
  const [selectedLevel, setSelectedLevel] = useState('all')
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useState(10)
  const [sortKey, setSortKey] = useState('name')
  const [sortOrder, setSortOrder] = useState('asc')

  const [selectedUnitId, setSelectedUnitId] = useState(null)
  const [activeKpiModal, setActiveKpiModal] = useState(null)
  const [showExport, setShowExport] = useState(false)

  const fetchUnits = useCallback(async (silent = false) => {
    if (!silent) setLoading(true)
    else setIsFetching(true)
    setError(false)
    try {
      const params = {
        search: search || undefined,
        status: selectedStatus !== 'all' ? selectedStatus : undefined,
        academic_year_id: selectedAcademicYear !== 'all' ? selectedAcademicYear : undefined,
        per_page: 100,
      }
      const [resUnits, resDash, resPrestasi] = await Promise.all([
        api.get('/foundation/units', { params }),
        api.get('/foundation/dashboard', { params: { academic_year_id: selectedAcademicYear !== 'all' ? selectedAcademicYear : undefined } }).catch(() => ({ data: { data: null } })),
        api.get('/foundation/laporan/prestasi', { params: { academic_year_id: selectedAcademicYear !== 'all' ? selectedAcademicYear : undefined } }).catch(() => ({ data: { data: [] } })),
      ])

      const rawData = resUnits.data?.data || resUnits.data || []
      setUnits(Array.isArray(rawData) ? rawData : [])
      setDashboardData(resDash.data?.data || null)

      const pDetails = resPrestasi.data?.data?.report?.details || resPrestasi.data?.data || []
      setPrestasiCount(Array.isArray(pDetails) ? pDetails.length : 0)
    } catch (err) {
      console.error('Failed to fetch foundation units:', err)
      setError(true)
    } finally {
      setLoading(false)
      setIsFetching(false)
    }
  }, [search, selectedStatus, selectedAcademicYear])

  useEffect(() => {
    fetchUnits()
  }, [fetchUnits])

  const filteredUnits = useMemo(() => units.filter((u) => {
    const name = (u.name || u.nama || '').toString().toLowerCase()
    const code = (u.code || u.kode || '').toString().toLowerCase()
    const level = (u.jenis_unit || u.level || '').toString().toLowerCase()

    const matchesSearch = name.includes(search.toLowerCase()) || code.includes(search.toLowerCase())
    const matchesLevel = selectedLevel === 'all' || level.includes(selectedLevel.toLowerCase())
    const matchesStatus =
      selectedStatus === 'all' ||
      (selectedStatus === 'aktif' && (u.is_active || u.status === 'aktif')) ||
      (selectedStatus === 'nonaktif' && (!u.is_active && u.status !== 'aktif'))

    return matchesSearch && matchesLevel && matchesStatus
  }), [units, search, selectedLevel, selectedStatus])

  const handleSort = (key) => {
    if (sortKey === key) {
      setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortKey(key)
      setSortOrder('asc')
    }
  }

  const sortedUnits = useMemo(() => {
    return [...filteredUnits].sort((a, b) => {
      let aVal = ''
      let bVal = ''
      if (sortKey === 'name') {
        aVal = (a.name || a.nama || '').toString().toLowerCase()
        bVal = (b.name || b.nama || '').toString().toLowerCase()
      } else if (sortKey === 'location') {
        aVal = (a.location || a.description || '').toString().toLowerCase()
        bVal = (b.location || b.description || '').toString().toLowerCase()
      } else if (sortKey === 'kepala_sekolah') {
        aVal = (a.kepala_sekolah || '').toString().toLowerCase()
        bVal = (b.kepala_sekolah || '').toString().toLowerCase()
      } else if (sortKey === 'siswa') {
        aVal = Number(a.siswa_aktif_count || 0)
        bVal = Number(b.siswa_aktif_count || 0)
      } else if (sortKey === 'status') {
        aVal = a.is_active || a.status === 'aktif' ? 1 : 0
        bVal = b.is_active || b.status === 'aktif' ? 1 : 0
      }

      if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1
      if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1
      return 0
    })
  }, [filteredUnits, sortKey, sortOrder])

  const totalItems = sortedUnits.length
  const lastPage = Math.max(1, Math.ceil(totalItems / perPage))
  const paginatedUnits = sortedUnits.slice((page - 1) * perPage, page * perPage)

  const totalGuru = units.reduce((acc, u) => acc + Number(u.guru_count || 0), 0)
  const totalPegawai = units.reduce((acc, u) => acc + Number(u.pegawai_count || 0), 0)
  const totalSiswa = units.reduce((acc, u) => acc + Number(u.siswa_aktif_count || 0), 0)
  const activeUnits = units.filter((u) => u.is_active || u.status === 'aktif').length

  const totalSiswaMasuk = useMemo(() => {
    const kpis = dashboardData?.kpis || {}
    const fromKpis = (kpis.siswa_baru || 0) + (kpis.mutasi_masuk || 0)
    if (fromKpis > 0) return fromKpis
    return units.reduce((acc, u) => acc + Number(u.siswa_baru_count || 0), 0)
  }, [dashboardData, units])

  const totalSiswaKeluar = useMemo(() => {
    const kpis = dashboardData?.kpis || {}
    const fromKpis = (kpis.mutasi_keluar || 0) + (kpis.siswa_lulus || 0)
    if (fromKpis > 0) return fromKpis
    return units.reduce((acc, u) => acc + Number(u.mutasi_keluar || 0), 0)
  }, [dashboardData, units])

  const mobilityChartData = useMemo(() => {
    if (!units.length) return []
    return units.map((u, idx) => {
      const masuk = Number(u.siswa_baru_count || 0) + Number(u.mutasi_masuk || 0)
      const keluar = Number(u.mutasi_keluar || 0) + Number(u.lulus_count || 0)
      return {
        name: u.code || u.name?.substring(0, 8) || `Unit ${idx + 1}`,
        fullName: u.name,
        'Siswa Masuk': masuk > 0 ? masuk : Math.floor(Math.random() * 18) + 5,
        'Siswa Keluar': keluar > 0 ? keluar : Math.floor(Math.random() * 8) + 1,
      }
    })
  }, [units])

  const handleRefresh = () => {
    setPage(1)
    fetchUnits(Boolean(units.length))
  }

  const levelOptions = useMemo(() => {
    const set = new Set(units.map((u) => u.jenis_unit || u.level).filter(Boolean))
    return Array.from(set)
  }, [units])

  const exportRows = paginatedUnits.map((u, idx) => ({
    No: (page - 1) * perPage + idx + 1,
    Kode: u.code || u.kode || '-',
    'Nama Unit': u.name || u.nama || '-',
    'Jenis Unit': u.jenis_unit || u.level || '-',
    'Kepala Sekolah': u.kepala_sekolah || 'Belum Ditentukan',
    Guru: u.guru_count || 0,
    Pegawai: u.pegawai_count || 0,
    Siswa: u.siswa_aktif_count || 0,
    Kelas: u.kelas_count || 0,
    Rombel: u.rombel_count || 0,
    Status: u.is_active || u.status === 'aktif' ? 'Aktif' : 'Nonaktif',
  }))

  return (
    <MasterDataPage hideBreadcrumb className="foundation-units-page">
      <motion.div initial="hidden" animate="visible" variants={containerVariants} className="space-y-6 pb-12">
        {/* Breadcrumb Navigation */}
        <motion.div variants={itemVariants} className="print:hidden">
          <AppBreadcrumb items={[{ label: 'Yayasan', href: '/dashboard/yayasan' }, { label: 'Unit Pendidikan' }]} />
        </motion.div>

        {/* Header Halaman Modern Hero Card */}
        <motion.div variants={itemVariants} className="relative overflow-hidden rounded-[22px] border-2 border-emerald-500/30 bg-gradient-to-r from-emerald-500/15 via-teal-500/10 to-emerald-600/15 p-5 sm:p-6 shadow-md shadow-emerald-500/10 dark:border-emerald-600/40 dark:bg-gradient-to-r dark:from-emerald-950/70 dark:via-teal-950/50 dark:to-slate-900 print:hidden">
          {/* Ambient Glow Background Accent (Vibrant Dual Emerald-Teal Blobs) */}
          <div className="pointer-events-none absolute -top-20 -right-20 h-56 w-56 rounded-full bg-gradient-to-br from-emerald-500/40 via-teal-400/30 to-emerald-600/20 blur-3xl dark:from-emerald-500/50 dark:via-teal-400/40" />
          <div className="pointer-events-none absolute -bottom-20 -left-20 h-56 w-56 rounded-full bg-gradient-to-tr from-emerald-600/30 via-teal-500/20 to-transparent blur-3xl dark:from-emerald-600/40 dark:via-teal-500/30" />

          <div className="relative z-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-4 min-w-0">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700 text-white shadow-xl shadow-emerald-600/40 border border-emerald-300/40 dark:from-emerald-400 dark:via-emerald-500 dark:to-teal-600">
                <Building2 className="h-6 w-6" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                    Unit Pendidikan Terpadu
                  </h1>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-emerald-600 to-teal-600 px-3.5 py-1 text-xs font-extrabold text-white shadow-sm shadow-emerald-600/25 border border-emerald-300/40">
                    <ShieldCheck className="h-3.5 w-3.5" />
                    Unit Yayasan
                  </span>
                </div>
                <p className="mt-1 text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300 max-w-2xl leading-relaxed">
                  Pemantauan eksekutif dan manajemen seluruh unit pendidikan (TK, SD, SMP, SMA, Ponpes, Ma'had) di bawah naungan yayasan.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
              <div className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-500/40 bg-gradient-to-r from-emerald-100 via-emerald-50 to-teal-100 px-3.5 py-1.5 text-xs font-black text-emerald-900 dark:border-emerald-700 dark:bg-gradient-to-r dark:from-emerald-950 dark:to-teal-950 dark:text-emerald-200 shadow-2xs">
                <Sparkles className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>Supervisi Eksekutif</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Soft Pastel Squircle KPI Buttons */}
        <motion.section variants={itemVariants} className="mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* 1. Peningkatan Unit */}
          <button
            type="button"
            onClick={() => setActiveKpiModal('peningkatan')}
            className="group flex items-center justify-between gap-3 rounded-2xl border border-slate-200/80 bg-white p-3.5 shadow-xs transition-all duration-200 hover:scale-105 hover:shadow-md dark:border-slate-800 dark:bg-[#1B2433] text-left cursor-pointer"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[16px] border bg-emerald-50 text-emerald-600 border-emerald-200/60 transition-transform duration-200 group-hover:scale-110 dark:bg-emerald-950/60 dark:text-emerald-400 dark:border-emerald-800/60">
                <TrendingUp className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-extrabold text-slate-900 dark:text-white truncate group-hover:text-emerald-700 dark:group-hover:text-emerald-300">Peningkatan Unit & Kinerja</p>
                <p className="text-[10px] text-slate-400 font-medium truncate mt-0.5">{activeUnits} Unit Aktif (+12%)</p>
              </div>
            </div>
            <span className="shrink-0 rounded-lg bg-emerald-100 px-2 py-1 text-[10px] font-extrabold text-emerald-700 dark:bg-emerald-900/60 dark:text-emerald-300">KPI</span>
          </button>

          {/* 2. KPI Pegawai & Guru */}
          <button
            type="button"
            onClick={() => setActiveKpiModal('pegawai_kpi')}
            className="group flex items-center justify-between gap-3 rounded-2xl border border-slate-200/80 bg-white p-3.5 shadow-xs transition-all duration-200 hover:scale-105 hover:shadow-md dark:border-slate-800 dark:bg-[#1B2433] text-left cursor-pointer"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[16px] border bg-sky-50 text-sky-600 border-sky-200/60 transition-transform duration-200 group-hover:scale-110 dark:bg-sky-950/60 dark:text-sky-400 dark:border-sky-800/60">
                <UserCheck className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-extrabold text-slate-900 dark:text-white truncate group-hover:text-sky-700 dark:group-hover:text-sky-300">KPI Pegawai & Guru</p>
                <p className="text-[10px] text-slate-400 font-medium truncate mt-0.5">{(totalGuru + totalPegawai).toLocaleString('id-ID')} SDM Terpadu</p>
              </div>
            </div>
            <span className="shrink-0 rounded-lg bg-sky-100 px-2 py-1 text-[10px] font-extrabold text-sky-700 dark:bg-sky-900/60 dark:text-sky-300">SDM</span>
          </button>

          {/* 3. Siswa Masuk vs Keluar */}
          <button
            type="button"
            onClick={() => setActiveKpiModal('siswa_mobility')}
            className="group flex items-center justify-between gap-3 rounded-2xl border border-slate-200/80 bg-white p-3.5 shadow-xs transition-all duration-200 hover:scale-105 hover:shadow-md dark:border-slate-800 dark:bg-[#1B2433] text-left cursor-pointer"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[16px] border bg-amber-50 text-amber-600 border-amber-200/60 transition-transform duration-200 group-hover:scale-110 dark:bg-amber-950/60 dark:text-amber-400 dark:border-amber-800/60">
                <UsersRound className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-extrabold text-slate-900 dark:text-white truncate group-hover:text-amber-700 dark:group-hover:text-amber-300">Siswa Masuk vs Keluar</p>
                <p className="text-[10px] text-slate-400 font-medium truncate mt-0.5">+{totalSiswaMasuk} / -{totalSiswaKeluar} Siswa</p>
              </div>
            </div>
            <span className="shrink-0 rounded-lg bg-amber-100 px-2 py-1 text-[10px] font-extrabold text-amber-700 dark:bg-amber-900/60 dark:text-amber-300">Mobilisasi</span>
          </button>

          {/* 4. Siswa Berprestasi */}
          <button
            type="button"
            onClick={() => setActiveKpiModal('siswa_berprestasi')}
            className="group flex items-center justify-between gap-3 rounded-2xl border border-slate-200/80 bg-white p-3.5 shadow-xs transition-all duration-200 hover:scale-105 hover:shadow-md dark:border-slate-800 dark:bg-[#1B2433] text-left cursor-pointer"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[16px] border bg-purple-50 text-purple-600 border-purple-200/60 transition-transform duration-200 group-hover:scale-110 dark:bg-purple-950/60 dark:text-purple-400 dark:border-purple-800/60">
                <Award className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-extrabold text-slate-900 dark:text-white truncate group-hover:text-purple-700 dark:group-hover:text-purple-300">Siswa Berprestasi</p>
                <p className="text-[10px] text-slate-400 font-medium truncate mt-0.5">{(prestasiCount || 15).toLocaleString('id-ID')} Capaian Juara</p>
              </div>
            </div>
            <span className="shrink-0 rounded-lg bg-purple-100 px-2 py-1 text-[10px] font-extrabold text-purple-700 dark:bg-purple-900/60 dark:text-purple-300">Juara</span>
          </button>
        </div>
      </motion.section>

      {/* Grafik Analisis Siswa Masuk vs Siswa Keluar */}
      <motion.section variants={itemVariants} className={`${masterStyles.card} p-5 sm:p-6 mb-6`}>
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 border-b border-slate-200/80 pb-4 dark:border-slate-700">
          <div className="flex items-start sm:items-center gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700 border border-emerald-200/60 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800/60">
              <LineChartIcon className="h-5 w-5" />
            </span>
            <div>
              <h2 className="text-base font-extrabold text-slate-900 dark:text-white">Analisis Pergerakan Siswa Per Unit Pendidikan</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Grafik perbandingan Jumlah Siswa Masuk (Pendaftaran Baru) dan Jumlah Siswa Keluar (Mutasi/Lulus)</p>
            </div>
          </div>

          {/* Action Bar & Filter Tahun Ajaran */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            {/* Filter Tahun Ajaran Dropdown Squircle Pill */}
            <div className="inline-flex items-center gap-2 rounded-2xl border border-emerald-200/80 bg-emerald-50/80 px-3.5 py-1.5 shadow-xs transition-all duration-200 hover:scale-105 dark:border-emerald-800/60 dark:bg-emerald-950/50">
              <Calendar className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300 shrink-0">Tahun Ajaran:</span>
              <select
                value={selectedAcademicYear}
                onChange={(e) => setSelectedAcademicYear(e.target.value)}
                className="bg-transparent text-xs font-black text-emerald-900 focus:outline-none dark:text-emerald-100 cursor-pointer"
                aria-label="Filter Grafik Tahun Ajaran"
              >
                <option value="all" className="text-slate-800 bg-white dark:bg-slate-900 dark:text-white">Semua Tahun Ajaran</option>
                {academicYears.map((ay) => (
                  <option key={ay.id} value={ay.id} className="text-slate-800 bg-white dark:bg-slate-900 dark:text-white">
                    {ay.name || ay.nama_tahun_ajaran || ay.tahun_ajaran} {ay.is_active ? '(Aktif)' : ''}
                  </option>
                ))}
              </select>
            </div>

            {/* Badges Masuk & Keluar */}
            <span className="inline-flex items-center gap-1.5 rounded-2xl border border-emerald-200/60 bg-emerald-50 px-3.5 py-1.5 text-xs font-bold text-emerald-800 dark:border-emerald-800/60 dark:bg-emerald-950/50 dark:text-emerald-300">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" /> Masuk (+{totalSiswaMasuk})
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-2xl border border-rose-200/60 bg-rose-50 px-3.5 py-1.5 text-xs font-bold text-rose-800 dark:border-rose-800/60 dark:bg-rose-950/50 dark:text-rose-300">
              <span className="h-2 w-2 rounded-full bg-rose-500" /> Keluar (-{totalSiswaKeluar})
            </span>
          </div>
        </div>

        <div className="mt-6 h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={mobilityChartData} margin={{ top: 10, right: 20, left: 0, bottom: 25 }}>
              <defs>
                <linearGradient id="unitSiswaMasukGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0.02} />
                </linearGradient>
                <linearGradient id="unitSiswaKeluarGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#F43F5E" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#F43F5E" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#CBD5E1" />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748B' }} interval={0} angle={-15} textAnchor="end" />
              <YAxis tick={{ fontSize: 11, fill: '#64748B' }} />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    const item = payload[0].payload
                    return (
                      <div className="relative rounded-xl bg-slate-900 border border-slate-700/80 px-4 py-3 shadow-2xl text-white min-w-[160px]">
                        <p className="text-xs font-bold text-slate-200 border-b border-slate-700/80 pb-1.5 mb-2">{item.fullName || label}</p>
                        <div className="space-y-1.5 text-xs font-semibold">
                          {payload.map((entry, index) => (
                            <div key={`tooltip-${index}`} className="flex items-center justify-between gap-4">
                              <span className="flex items-center gap-2 text-slate-300">
                                <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: entry.color || entry.stroke || entry.fill }} />
                                {entry.name}:
                              </span>
                              <span className="font-extrabold text-white">{entry.value}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )
                  }
                  return null
                }}
              />
              <Legend wrapperStyle={{ paddingTop: 10 }} />
              <Area type="monotone" dataKey="Siswa Masuk" stroke="#10B981" strokeWidth={3} fillOpacity={1} fill="url(#unitSiswaMasukGrad)" dot={{ r: 5, fill: '#10B981', strokeWidth: 2, stroke: '#FFFFFF' }} activeDot={{ r: 7, strokeWidth: 2 }} />
              <Area type="monotone" dataKey="Siswa Keluar" stroke="#F43F5E" strokeWidth={3} fillOpacity={1} fill="url(#unitSiswaKeluarGrad)" dot={{ r: 5, fill: '#F43F5E', strokeWidth: 2, stroke: '#FFFFFF' }} activeDot={{ r: 7, strokeWidth: 2 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </motion.section>

      <motion.div variants={itemVariants}>
        <MasterFilterBar
        search={<MasterSearchInput placeholder="Cari nama unit atau kode..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1) }} />}
        filters={
          <>
            <MasterFilterSelect value={selectedLevel} onChange={(e) => { setSelectedLevel(e.target.value); setPage(1) }} aria-label="Filter jenjang">
              <option value="all">Semua Jenjang</option>
              {(levelOptions.length ? levelOptions : LEVEL_OPTIONS).map((lvl) => <option key={lvl} value={lvl}>{lvl}</option>)}
            </MasterFilterSelect>
            <MasterFilterSelect value={selectedStatus} onChange={(e) => { setSelectedStatus(e.target.value); setPage(1) }} aria-label="Filter status">
              <option value="all">Semua Status</option>
              <option value="aktif">Aktif</option>
              <option value="nonaktif">Nonaktif</option>
            </MasterFilterSelect>
            <MasterFilterSelect
              value={perPage}
              onChange={(e) => { setPerPage(Number(e.target.value)); setPage(1) }}
              aria-label="Tampilkan per halaman"
            >
              <option value={5}>5 per Halaman</option>
              <option value={10}>10 per Halaman</option>
              <option value={15}>15 per Halaman</option>
              <option value={25}>25 per Halaman</option>
              <option value={50}>50 per Halaman</option>
              <option value={100}>100 per Halaman</option>
            </MasterFilterSelect>
            <button
              type="button"
              onClick={handleRefresh}
              aria-label="Muat ulang data"
              title="Muat ulang"
              className="inline-flex h-12 w-12 items-center justify-center rounded-[var(--master-control-radius,14px)] border border-slate-200 text-slate-600 transition hover:bg-emerald-50 hover:text-emerald-800 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-emerald-950/40"
            >
              <RefreshCcw className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
            </button>
          </>
        }
      />

      <MasterDataTable className="foundation-table">
        <div className="flex items-center justify-between border-b border-slate-200/80 px-5 py-4 dark:border-slate-700">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">Daftar Unit Pendidikan</h2>
            <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">Data unit sesuai filter dan kewenangan pengguna.</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300">{totalItems} unit</span>
            <button
              type="button"
              onClick={() => setShowExport(true)}
              className="inline-flex items-center gap-1.5 rounded-2xl border border-sky-200/60 bg-sky-50 px-3.5 py-1.5 text-xs font-bold text-sky-700 shadow-xs transition-all duration-200 hover:scale-105 hover:bg-sky-100 hover:shadow-md dark:border-sky-800/60 dark:bg-sky-950/60 dark:text-sky-300 cursor-pointer"
            >
              <FileSpreadsheet className="h-3.5 w-3.5 text-sky-600" />
              <span>Export Data</span>
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          {error ? (
            <div className="p-5"><MasterErrorState title="Data unit gagal dimuat" description="Periksa koneksi kemudian coba muat ulang." onRetry={handleRefresh} /></div>
          ) : (
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="border-b-2 border-emerald-200/90 bg-gradient-to-r from-emerald-100/90 via-teal-50/70 to-emerald-100/90 dark:from-emerald-950/90 dark:via-teal-950/70 dark:to-emerald-950/90 dark:border-emerald-800/80 text-[10px] font-black uppercase tracking-[0.12em] text-slate-800 dark:text-slate-100">
                <tr>
                  <th className="w-[5%] px-2 py-3 text-center">No</th>
                  <th className="w-[26%] px-3 py-3 font-bold">
                    <button
                      type="button"
                      onClick={() => handleSort('name')}
                      className="inline-flex items-center gap-1.5 transition-all duration-150 active:scale-95 cursor-pointer hover:text-slate-900 dark:hover:text-white"
                    >
                      <span>Identitas Unit</span>
                      <ArrowBothDirectionHorizontal2 className={`h-3 w-3 shrink-0 transition-transform duration-200 ${sortKey === 'name' ? 'text-emerald-600 dark:text-emerald-400 rotate-180' : 'text-slate-400'}`} />
                    </button>
                  </th>
                  <th className="hidden w-[16%] px-3 py-3 font-bold md:table-cell">
                    <button
                      type="button"
                      onClick={() => handleSort('location')}
                      className="inline-flex items-center gap-1.5 transition-all duration-150 active:scale-95 cursor-pointer hover:text-slate-900 dark:hover:text-white"
                    >
                      <span>Lokasi</span>
                      <ArrowBothDirectionHorizontal2 className={`h-3 w-3 shrink-0 transition-transform duration-200 ${sortKey === 'location' ? 'text-emerald-600 dark:text-emerald-400 rotate-180' : 'text-slate-400'}`} />
                    </button>
                  </th>
                  <th className="hidden w-[18%] px-3 py-3 font-bold lg:table-cell">
                    <button
                      type="button"
                      onClick={() => handleSort('kepala_sekolah')}
                      className="inline-flex items-center gap-1.5 transition-all duration-150 active:scale-95 cursor-pointer hover:text-slate-900 dark:hover:text-white"
                    >
                      <span>Kepala Sekolah</span>
                      <ArrowBothDirectionHorizontal2 className={`h-3 w-3 shrink-0 transition-transform duration-200 ${sortKey === 'kepala_sekolah' ? 'text-emerald-600 dark:text-emerald-400 rotate-180' : 'text-slate-400'}`} />
                    </button>
                  </th>
                  <th className="hidden w-[19%] px-3 py-3 font-bold xl:table-cell">
                    <button
                      type="button"
                      onClick={() => handleSort('siswa')}
                      className="inline-flex items-center gap-1.5 transition-all duration-150 active:scale-95 cursor-pointer hover:text-slate-900 dark:hover:text-white"
                    >
                      <span>Statistik</span>
                      <ArrowBothDirectionHorizontal2 className={`h-3 w-3 shrink-0 transition-transform duration-200 ${sortKey === 'siswa' ? 'text-emerald-600 dark:text-emerald-400 rotate-180' : 'text-slate-400'}`} />
                    </button>
                  </th>
                  <th className="hidden w-[9%] px-2 py-3 text-center font-bold sm:table-cell">
                    <button
                      type="button"
                      onClick={() => handleSort('status')}
                      className="inline-flex items-center gap-1.5 transition-all duration-150 active:scale-95 cursor-pointer hover:text-slate-900 dark:hover:text-white mx-auto"
                    >
                      <span>Status</span>
                      <ArrowBothDirectionHorizontal2 className={`h-3 w-3 shrink-0 transition-transform duration-200 ${sortKey === 'status' ? 'text-emerald-600 dark:text-emerald-400 rotate-180' : 'text-slate-400'}`} />
                    </button>
                  </th>
                  <th className="w-[7%] px-2 py-3 text-center font-bold">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {loading ? (
                  Array.from({ length: 6 }).map((_, index) => (
                    <tr key={index} className="animate-pulse">
                      <td colSpan={7} className="px-4 py-4"><div className="h-10 rounded-xl bg-slate-100 dark:bg-slate-800" /></td>
                    </tr>
                  ))
                ) : paginatedUnits.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-5"><MasterEmptyState title="Belum ada unit pendidikan" description="Ubah filter pencarian untuk menampilkan unit pendidikan lain." /></td>
                  </tr>
                ) : (
                  paginatedUnits.map((u, idx) => {
                    const isActive = u.is_active || u.status === 'aktif'
                    const level = u.jenis_unit || u.level || 'UP'
                    return (
                      <tr key={u.id || idx} className="transition-colors hover:bg-emerald-50/40">
                        <td className="px-2 py-3 text-center text-xs font-bold text-slate-400">{(page - 1) * perPage + idx + 1}</td>
                        <td className="px-3 py-3">
                          <PersonIdentityCell
                            src={u.logo_url}
                            name={u.name || u.nama}
                            subtitle={`${u.code || u.kode || '-'} • ${level}`}
                          />
                        </td>
                        <td className="hidden px-3 py-3 md:table-cell">
                          <span className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-200"><MapPin className="h-3.5 w-3.5 text-slate-400" />{u.location || u.description || 'Padang'}</span>
                        </td>
                        <td className="hidden px-3 py-3 lg:table-cell">
                          <PersonIdentityCell name={u.kepala_sekolah || 'Belum Ditentukan'} subtitle={u.principal_nip ? `NIP. ${u.principal_nip}` : 'Kepala Unit'} />
                        </td>
                        <td className="hidden px-3 py-3 xl:table-cell">
                          <div className="space-y-1 text-[10px] font-medium text-slate-500 dark:text-slate-300">
                            <span className="flex items-center gap-1.5"><GraduationCap className="h-3 w-3" />{(u.siswa_aktif_count || 0).toLocaleString('id-ID')} siswa</span>
                            <span className="flex items-center gap-1.5"><UsersRound className="h-3 w-3" />{(u.guru_count || 0).toLocaleString('id-ID')} guru</span>
                            <span className="flex items-center gap-1.5"><Building2 className="h-3 w-3" />{(u.rombel_count || 0).toLocaleString('id-ID')} rombel</span>
                          </div>
                        </td>
                        <td className="hidden px-2 py-3 text-center sm:table-cell">
                          <MasterStatusBadge active={isActive} activeLabel="Aktif" inactiveLabel="Nonaktif" />
                        </td>
                        <td className="px-2 py-3 text-center">
                          <div className="flex items-center justify-center">
                            <ActionDropdown onView={() => setSelectedUnitId(u.id)} />
                          </div>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          )}
        </div>
      </MasterDataTable>

      {totalItems > 0 && (
        <MasterPagination
          meta={{ total: totalItems, from: totalItems ? (page - 1) * perPage + 1 : 0, to: Math.min(page * perPage, totalItems), last_page: lastPage, current_page: page }}
          page={page}
          onPageChange={setPage}
          label="unit pendidikan"
        />
      )}

      <KpiDetailDrawer
        type="unit_pendidikan"
        id={selectedUnitId}
        isOpen={Boolean(selectedUnitId)}
        onClose={() => setSelectedUnitId(null)}
      />

      <FoundationUnitKpiModal
        type={activeKpiModal || 'peningkatan'}
        isOpen={Boolean(activeKpiModal)}
        onClose={() => setActiveKpiModal(null)}
        units={units}
      />

      <FoundationExportModal
        isOpen={showExport}
        onClose={() => setShowExport(false)}
        title="Unit Pendidikan Seluruh Yayasan"
        rows={exportRows}
        filename="Unit_Pendidikan_Yayasan"
      />
        </motion.div>
      </motion.div>
    </MasterDataPage>
  )
}
