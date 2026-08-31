import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  BadgeCheck,
  BarChart3,
  Calendar,
  Clock,
  Eye,
  FileSpreadsheet,
  LineChart as LineChartIcon,
  RefreshCcw,
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
import { ArrowBothDirectionHorizontal2 } from '@tailgrids/icons'
import AppBreadcrumb from '../../components/app/AppBreadcrumb'
import ActionDropdown from '../../components/app/ActionDropdown'
import { HoverCard, HoverCardContent, HoverCardTrigger } from '../../components/tailgrids/core/hover-card'
import { Avatar, AvatarFallback, AvatarImage } from '../../components/tailgrids/core/avatar'
import api from '../../services/api'
import {
  MasterActionButton,
  MasterActionIconButton,
  MasterBadge,
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

export function FoundationEmployeesPage() {
  const navigate = useNavigate()
  const [employees, setEmployees] = useState([])
  const [units, setUnits] = useState([])
  const [academicYears, setAcademicYears] = useState([])
  const [selectedAcademicYear, setSelectedAcademicYear] = useState('all')

  useEffect(() => {
    const fetchAcademicYears = async () => {
      try {
        const res = await api.get('/master/tahun-ajaran/dropdown').catch(() => api.get('/master/tahun-ajaran'))
        const raw = res?.data?.data || res?.data || []
        setAcademicYears(Array.isArray(raw) ? raw : [])
      } catch (err) {
        setAcademicYears([])
      }
    }
    fetchAcademicYears()
  }, [])
  const [dashboardData, setDashboardData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [isFetching, setIsFetching] = useState(false)

  const [jenis, setJenis] = useState('all') // 'all' | 'guru' | 'pegawai'
  const [search, setSearch] = useState('')
  const [selectedUnit, setSelectedUnit] = useState('all')
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useState(10)
  const [sortKey, setSortKey] = useState('nama')
  const [sortOrder, setSortOrder] = useState('asc')

  const [selectedEmployeeId, setSelectedEmployeeId] = useState(null)
  const [selectedDetailType, setSelectedDetailType] = useState('pegawai')
  const [activeKpiModal, setActiveKpiModal] = useState(null)
  const [showExport, setShowExport] = useState(false)

  useEffect(() => {
    api.get('/foundation/units')
      .then((res) => {
        const raw = res.data?.data || res.data || []
        setUnits(Array.isArray(raw) ? raw : [])
      })
      .catch(() => {})
  }, [])

  const fetchEmployees = useCallback(async (silent = false) => {
    if (!silent) setLoading(true)
    else setIsFetching(true)
    setError(false)
    try {
      const params = {
        search: search || undefined,
        unit_id: selectedUnit !== 'all' ? selectedUnit : undefined,
        status: selectedStatus !== 'all' ? selectedStatus : undefined,
        per_page: 100,
      }
      const [resEmp, resDash] = await Promise.all([
        api.get('/foundation/employees', { params }),
        api.get('/foundation/dashboard').catch(() => ({ data: { data: null } })),
      ])

      const resData = resEmp.data
      let list = []
      if (Array.isArray(resData)) {
        list = resData
      } else if (resData?.data) {
        list = Array.isArray(resData.data) ? resData.data : resData.data.data || []
      }
      setEmployees(list)
      setDashboardData(resDash.data?.data || null)
    } catch (err) {
      console.error('Failed to fetch foundation employees:', err)
      setError(true)
    } finally {
      setLoading(false)
      setIsFetching(false)
    }
  }, [search, selectedUnit, selectedStatus])

  useEffect(() => {
    fetchEmployees()
  }, [fetchEmployees])

  const isGuru = (emp) => {
    const j = (emp.position?.nama_jabatan || emp.jabatan || '').toLowerCase()
    return j.includes('guru') || j.includes('pendidik')
  }

  const isEmpActive = (emp) => {
    const statusStr = (emp?.status || '').toString().trim().toLowerCase()
    if (statusStr === 'aktif' || statusStr === 'active' || statusStr === '1' || emp?.status === true || emp?.is_active === true || emp?.is_active === 1 || emp?.is_active === '1') {
      return true
    }
    if (statusStr === 'nonaktif' || statusStr === 'tidak aktif' || statusStr === 'inactive' || statusStr === '0' || emp?.status === false || emp?.is_active === false || emp?.is_active === 0) {
      return false
    }
    return true
  }

  const getSolidStatusPegawaiBadge = (statusPegawai) => {
    const label = statusPegawai || 'Tetap'
    const val = label.toString().toLowerCase()
    let bgGradient = 'bg-gradient-to-r from-emerald-600 to-teal-600 shadow-emerald-600/20 border-emerald-300/40'
    if (val.includes('kontrak')) {
      bgGradient = 'bg-gradient-to-r from-amber-500 to-orange-600 shadow-amber-500/20 border-amber-300/40'
    } else if (val.includes('honorer') || val.includes('magang')) {
      bgGradient = 'bg-gradient-to-r from-sky-600 to-blue-600 shadow-sky-600/20 border-sky-300/40'
    } else if (!val.includes('tetap')) {
      bgGradient = 'bg-gradient-to-r from-slate-600 to-slate-700 shadow-slate-600/20 border-slate-400/40'
    }

    return (
      <span className={`inline-flex items-center justify-center rounded-full ${bgGradient} px-3 py-1 text-xs font-extrabold text-white shadow-sm border`}>
        {label}
      </span>
    )
  }

  const getSolidStatusBadge = (active) => {
    if (active) {
      return (
        <span className="inline-flex items-center justify-center gap-1.5 rounded-full bg-gradient-to-r from-emerald-600 to-teal-600 px-3 py-1 text-xs font-extrabold text-white shadow-sm shadow-emerald-600/25 border border-emerald-300/40">
          <span className="h-1.5 w-1.5 rounded-full bg-white shadow-xs" />
          Aktif
        </span>
      )
    }
    return (
      <span className="inline-flex items-center justify-center gap-1.5 rounded-full bg-gradient-to-r from-rose-600 to-pink-600 px-3 py-1 text-xs font-extrabold text-white shadow-sm shadow-rose-600/25 border border-rose-300/40">
        <span className="h-1.5 w-1.5 rounded-full bg-white/80 shadow-xs" />
        Nonaktif
      </span>
    )
  }

  const filteredEmployees = useMemo(() => employees.filter((emp) => {
    const name = (emp.nama_lengkap || emp.nama || '').toString().toLowerCase()
    const niy = (emp.niy || emp.nik || '').toString().toLowerCase()
    const unitName = (emp.unit?.name || emp.unit?.code || '').toString().toLowerCase()

    const matchesJenis = jenis === 'all' || (jenis === 'guru' ? isGuru(emp) : !isGuru(emp))
    const matchesSearch = name.includes(search.toLowerCase()) || niy.includes(search.toLowerCase())
    const matchesUnit = selectedUnit === 'all' || emp.unit_id === selectedUnit || unitName.includes(selectedUnit.toLowerCase())
    const matchesStatus = selectedStatus === 'all' || (selectedStatus === 'aktif' ? isEmpActive(emp) : !isEmpActive(emp))

    return matchesJenis && matchesSearch && matchesUnit && matchesStatus
  }), [employees, jenis, search, selectedUnit, selectedStatus])

  const handleSort = (key) => {
    if (sortKey === key) {
      setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortKey(key)
      setSortOrder('asc')
    }
  }

  const sortedEmployees = useMemo(() => {
    return [...filteredEmployees].sort((a, b) => {
      let aVal = ''
      let bVal = ''
      if (sortKey === 'nama') {
        aVal = (a.nama_lengkap || a.nama || '').toString().toLowerCase()
        bVal = (b.nama_lengkap || b.nama || '').toString().toLowerCase()
      } else if (sortKey === 'jenis') {
        aVal = isGuru(a) ? 'guru' : 'pegawai'
        bVal = isGuru(b) ? 'guru' : 'pegawai'
      } else if (sortKey === 'unit') {
        aVal = (a.unit?.name || a.unit?.code || '').toString().toLowerCase()
        bVal = (b.unit?.name || b.unit?.code || '').toString().toLowerCase()
      } else if (sortKey === 'jabatan') {
        aVal = (a.position?.nama_jabatan || a.jabatan || '').toString().toLowerCase()
        bVal = (b.position?.nama_jabatan || b.jabatan || '').toString().toLowerCase()
      } else if (sortKey === 'status_pegawai') {
        aVal = (a.status_pegawai || '').toString().toLowerCase()
        bVal = (b.status_pegawai || '').toString().toLowerCase()
      } else if (sortKey === 'status') {
        aVal = isEmpActive(a) ? 1 : 0
        bVal = isEmpActive(b) ? 1 : 0
      }

      if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1
      if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1
      return 0
    })
  }, [filteredEmployees, sortKey, sortOrder])

  const totalItems = sortedEmployees.length
  const lastPage = Math.max(1, Math.ceil(totalItems / perPage))
  const paginatedEmployees = sortedEmployees.slice((page - 1) * perPage, page * perPage)

  const totalGuru = employees.filter((e) => isGuru(e)).length
  const totalSDM = employees.length
  const totalTendik = Math.max(0, totalSDM - totalGuru)
  const guruTetap = employees.filter((e) => (e.status_pegawai || '').toLowerCase().includes('tetap')).length

  const sdmChartData = useMemo(() => {
    if (!units.length) return []
    return units.map((u) => {
      const unitEmps = employees.filter((e) => e.unit_id === u.id || (e.unit?.id && e.unit.id === u.id))
      const gCount = Number(u.guru_count || unitEmps.filter((e) => isGuru(e)).length)
      const pCount = Number(u.pegawai_count || Math.max(0, unitEmps.length - gCount))
      return {
        name: u.code || u.name?.substring(0, 8) || 'Unit',
        fullName: u.name,
        'Guru': gCount,
        'Tendik': pCount,
      }
    })
  }, [units, employees])

  const handleOpenDetail = (emp) => {
    setSelectedDetailType(isGuru(emp) ? 'guru' : 'pegawai')
    setSelectedEmployeeId(emp.id)
  }

  const handleRefresh = () => {
    setPage(1)
    fetchEmployees(Boolean(employees.length))
  }

  const exportRows = paginatedEmployees.map((emp, idx) => ({
    No: (page - 1) * perPage + idx + 1,
    'NIY / NIK': emp.niy || emp.nik || '-',
    Nama: emp.nama_lengkap || emp.nama || '-',
    Jenis: isGuru(emp) ? 'Guru' : 'Pegawai',
    'Unit Kerja': emp.unit?.name || emp.unit?.code || '-',
    Jabatan: emp.position?.nama_jabatan || emp.jabatan || 'Staf',
    'Status Pegawai': emp.status_pegawai || 'Tetap',
    Status: isEmpActive(emp) ? 'Aktif' : 'Nonaktif',
  }))

  return (
    <MasterDataPage hideBreadcrumb className="foundation-employees-page">
      <motion.div initial="hidden" animate="visible" variants={containerVariants} className="space-y-6 pb-12">
        {/* Breadcrumb Navigation */}
        <motion.div variants={itemVariants} className="print:hidden">
          <AppBreadcrumb items={[{ label: 'Yayasan', href: '/dashboard/yayasan' }, { label: 'Pegawai & Guru' }]} />
        </motion.div>

        {/* Header Halaman Modern Hero Card */}
        <motion.div variants={itemVariants} className="relative overflow-hidden rounded-[22px] border-2 border-emerald-500/30 bg-gradient-to-r from-emerald-500/15 via-teal-500/10 to-emerald-600/15 p-5 sm:p-6 shadow-md shadow-emerald-500/10 dark:border-emerald-600/40 dark:bg-gradient-to-r dark:from-emerald-950/70 dark:via-teal-950/50 dark:to-slate-900 print:hidden">
          {/* Ambient Glow Background Accent (Vibrant Dual Emerald-Teal Blobs) */}
          <div className="pointer-events-none absolute -top-20 -right-20 h-56 w-56 rounded-full bg-gradient-to-br from-emerald-500/40 via-teal-400/30 to-emerald-600/20 blur-3xl dark:from-emerald-500/50 dark:via-teal-400/40" />
          <div className="pointer-events-none absolute -bottom-20 -left-20 h-56 w-56 rounded-full bg-gradient-to-tr from-emerald-600/30 via-teal-500/20 to-transparent blur-3xl dark:from-emerald-600/40 dark:via-teal-500/30" />

          <div className="relative z-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-4 min-w-0">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700 text-white shadow-xl shadow-emerald-600/40 border border-emerald-300/40 dark:from-emerald-400 dark:via-emerald-500 dark:to-teal-600">
                <UserCheck className="h-6 w-6" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                    Pegawai & Guru Lintas Unit
                  </h1>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-emerald-600 to-teal-600 px-3.5 py-1 text-xs font-extrabold text-white shadow-sm shadow-emerald-600/25 border border-emerald-300/40">
                    <ShieldCheck className="h-3.5 w-3.5" />
                    SDM Yayasan
                  </span>
                </div>
                <p className="mt-1 text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300 max-w-2xl leading-relaxed">
                  Rekapitulasi dan pemantauan terpadu data pegawai, guru pendidik, dan tenaga kependidikan (Tendik) di seluruh unit sekolah yayasan.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
              <div className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-500/40 bg-gradient-to-r from-emerald-100 via-emerald-50 to-teal-100 px-3.5 py-1.5 text-xs font-black text-emerald-900 dark:border-emerald-700 dark:bg-gradient-to-r dark:from-emerald-950 dark:to-teal-950 dark:text-emerald-200 shadow-2xs">
                <Sparkles className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>SDM Realtime</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Soft Pastel Squircle KPI Buttons */}
        <motion.section variants={itemVariants} className="mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* 1. Total SDM */}
          <button
            type="button"
            onClick={() => setActiveKpiModal('pegawai_kpi')}
            className="group flex items-center justify-between gap-3 rounded-2xl border border-slate-200/80 bg-white p-3.5 shadow-xs transition-all duration-200 hover:scale-105 hover:shadow-md dark:border-slate-800 dark:bg-[#1B2433] text-left cursor-pointer"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[16px] border bg-emerald-50 text-emerald-600 border-emerald-200/60 transition-transform duration-200 group-hover:scale-110 dark:bg-emerald-950/60 dark:text-emerald-400 dark:border-emerald-800/60">
                <Users className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-extrabold text-slate-900 dark:text-white truncate group-hover:text-emerald-700 dark:group-hover:text-emerald-300">Total SDM Terpadu</p>
                <p className="text-[10px] text-slate-400 font-medium truncate mt-0.5">{totalSDM.toLocaleString('id-ID')} SDM Seluruh Unit</p>
              </div>
            </div>
            <span className="shrink-0 rounded-lg bg-emerald-100 px-2 py-1 text-[10px] font-extrabold text-emerald-700 dark:bg-emerald-900/60 dark:text-emerald-300">SDM</span>
          </button>

          {/* 2. Guru */}
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
                <p className="text-xs font-extrabold text-slate-900 dark:text-white truncate group-hover:text-sky-700 dark:group-hover:text-sky-300">Guru</p>
                <p className="text-[10px] text-slate-400 font-medium truncate mt-0.5">{totalGuru.toLocaleString('id-ID')} Guru Mengajar</p>
              </div>
            </div>
            <span className="shrink-0 rounded-lg bg-sky-100 px-2 py-1 text-[10px] font-extrabold text-sky-700 dark:bg-sky-900/60 dark:text-sky-300">Guru</span>
          </button>

          {/* 3. Tendik */}
          <button
            type="button"
            onClick={() => setActiveKpiModal('pegawai_kpi')}
            className="group flex items-center justify-between gap-3 rounded-2xl border border-slate-200/80 bg-white p-3.5 shadow-xs transition-all duration-200 hover:scale-105 hover:shadow-md dark:border-slate-800 dark:bg-[#1B2433] text-left cursor-pointer"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[16px] border bg-amber-50 text-amber-600 border-amber-200/60 transition-transform duration-200 group-hover:scale-110 dark:bg-amber-950/60 dark:text-amber-400 dark:border-amber-800/60">
                <UsersRound className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-extrabold text-slate-900 dark:text-white truncate group-hover:text-amber-700 dark:group-hover:text-amber-300">Tendik</p>
                <p className="text-[10px] text-slate-400 font-medium truncate mt-0.5">{totalTendik.toLocaleString('id-ID')} Staf Kependidikan</p>
              </div>
            </div>
            <span className="shrink-0 rounded-lg bg-amber-100 px-2 py-1 text-[10px] font-extrabold text-amber-700 dark:bg-amber-900/60 dark:text-amber-300">Tendik</span>
          </button>

          {/* 4. Guru & Pegawai Tetap */}
          <button
            type="button"
            onClick={() => setActiveKpiModal('pegawai_kpi')}
            className="group flex items-center justify-between gap-3 rounded-2xl border border-slate-200/80 bg-white p-3.5 shadow-xs transition-all duration-200 hover:scale-105 hover:shadow-md dark:border-slate-800 dark:bg-[#1B2433] text-left cursor-pointer"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[16px] border bg-purple-50 text-purple-600 border-purple-200/60 transition-transform duration-200 group-hover:scale-110 dark:bg-purple-950/60 dark:text-purple-400 dark:border-purple-800/60">
                <BadgeCheck className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-extrabold text-slate-900 dark:text-white truncate group-hover:text-purple-700 dark:group-hover:text-purple-300">Guru & Pegawai Tetap</p>
                <p className="text-[10px] text-slate-400 font-medium truncate mt-0.5">{guruTetap.toLocaleString('id-ID')} Status Tetap</p>
              </div>
            </div>
            <span className="shrink-0 rounded-lg bg-purple-100 px-2 py-1 text-[10px] font-extrabold text-purple-700 dark:bg-purple-900/60 dark:text-purple-300">Tetap</span>
          </button>
        </div>
      </motion.section>

      {/* Grafik Distribusi Guru vs Pegawai Per Unit */}
      <motion.section variants={itemVariants} className={`${masterStyles.card} p-5 sm:p-6 mb-6`}>
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 border-b border-slate-200/80 pb-4 dark:border-slate-700">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300">
              <LineChartIcon className="h-5 w-5" />
            </span>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">Analisis & Rekapitulasi KPI SDM Per Unit Pendidikan</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Grafik komparasi jumlah Guru vs Tendik pada tiap Unit Kerja</p>
            </div>
          </div>

          {/* Filter Tahun Ajaran & Status Badges */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Filter Tahun Ajaran Button Dropdown */}
            <div className="flex items-center gap-2 rounded-2xl border border-sky-200/80 bg-sky-50/70 px-3.5 py-1.5 shadow-xs transition-all duration-200 hover:scale-105 dark:border-sky-800/60 dark:bg-sky-950/40">
              <Calendar className="h-4 w-4 text-sky-600 dark:text-sky-400 shrink-0" />
              <span className="text-[11px] font-bold text-sky-800 dark:text-sky-300 shrink-0">Tahun Ajaran:</span>
              <select
                value={selectedAcademicYear}
                onChange={(e) => setSelectedAcademicYear(e.target.value)}
                className="bg-transparent text-xs font-extrabold text-sky-900 focus:outline-none dark:text-sky-100 cursor-pointer"
                aria-label="Filter Grafik SDM Tahun Ajaran"
              >
                <option value="all" className="text-slate-800 bg-white dark:bg-slate-900 dark:text-white">Semua Tahun Ajaran</option>
                {academicYears.map((ay) => (
                  <option key={ay.id} value={ay.id} className="text-slate-800 bg-white dark:bg-slate-900 dark:text-white">
                    {ay.name || ay.nama_tahun_ajaran || ay.tahun_ajaran} {ay.is_active ? '(Aktif)' : ''}
                  </option>
                ))}
              </select>
            </div>

            {/* Badges */}
            <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-800 dark:bg-blue-950/50 dark:text-blue-300">
              <span className="h-2 w-2 rounded-full bg-blue-600" /> Guru ({totalGuru})
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-amber-800 dark:bg-amber-950/50 dark:text-amber-300">
              <span className="h-2 w-2 rounded-full bg-amber-500" /> Tendik ({totalTendik})
            </span>
          </div>
        </div>

        <div className="mt-6 h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={sdmChartData} margin={{ top: 10, right: 20, left: 0, bottom: 25 }}>
              <defs>
                <linearGradient id="sdmGuruGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2563EB" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#2563EB" stopOpacity={0.02} />
                </linearGradient>
                <linearGradient id="sdmPegawaiGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#F59E0B" stopOpacity={0.02} />
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
              <Area type="monotone" dataKey="Guru" stroke="#2563EB" strokeWidth={3} fillOpacity={1} fill="url(#sdmGuruGrad)" dot={{ r: 5, fill: '#2563EB', strokeWidth: 2, stroke: '#FFFFFF' }} activeDot={{ r: 7, strokeWidth: 2 }} />
              <Area type="monotone" dataKey="Tendik" stroke="#F59E0B" strokeWidth={3} fillOpacity={1} fill="url(#sdmPegawaiGrad)" dot={{ r: 5, fill: '#F59E0B', strokeWidth: 2, stroke: '#FFFFFF' }} activeDot={{ r: 7, strokeWidth: 2 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </motion.section>

      <motion.div variants={itemVariants}>
        <MasterFilterBar
        search={<MasterSearchInput placeholder="Cari nama, NIY, NIK, atau jabatan..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1) }} />}
        filters={
          <>
            <MasterFilterSelect value={jenis} onChange={(e) => { setJenis(e.target.value); setPage(1) }} aria-label="Filter jenis SDM">
              <option value="all">Semua SDM</option>
              <option value="guru">Guru</option>
              <option value="pegawai">Tendik</option>
            </MasterFilterSelect>
            <MasterFilterSelect value={selectedUnit} onChange={(e) => { setSelectedUnit(e.target.value); setPage(1) }} aria-label="Filter unit kerja">
              <option value="all">Semua Unit</option>
              {units.map((u) => <option key={u.id} value={u.id}>{u.name || u.code}</option>)}
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
            <h2 className="text-base font-bold text-slate-900 dark:text-white">Daftar Pegawai & Guru</h2>
            <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">Data SDM sesuai filter dan kewenangan pengguna.</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300">{totalItems} SDM</span>
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
            <div className="p-5"><MasterErrorState title="Data SDM gagal dimuat" description="Periksa koneksi kemudian coba muat ulang." onRetry={handleRefresh} /></div>
          ) : (
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="border-b-2 border-emerald-200/90 bg-gradient-to-r from-emerald-100/90 via-teal-50/70 to-emerald-100/90 dark:from-emerald-950/90 dark:via-teal-950/70 dark:to-emerald-950/90 dark:border-emerald-800/80 text-[10px] font-black uppercase tracking-[0.12em] text-slate-800 dark:text-slate-100">
                <tr>
                  <th className="w-[5%] px-2 py-3 text-center">No</th>
                  <th className="w-[22%] px-3 py-3 font-bold">
                    <button
                      type="button"
                      onClick={() => handleSort('nama')}
                      className="inline-flex items-center gap-1.5 transition-all duration-150 active:scale-95 cursor-pointer hover:text-slate-900 dark:hover:text-white"
                    >
                      <span>Nama SDM</span>
                      <ArrowBothDirectionHorizontal2 className={`h-3 w-3 shrink-0 transition-transform duration-200 ${sortKey === 'nama' ? 'text-emerald-600 dark:text-emerald-400 rotate-180' : 'text-slate-400'}`} />
                    </button>
                  </th>
                  <th className="hidden w-[9%] px-3 py-3 font-bold md:table-cell">
                    <button
                      type="button"
                      onClick={() => handleSort('jenis')}
                      className="inline-flex items-center gap-1.5 transition-all duration-150 active:scale-95 cursor-pointer hover:text-slate-900 dark:hover:text-white"
                    >
                      <span>Jenis</span>
                      <ArrowBothDirectionHorizontal2 className={`h-3 w-3 shrink-0 transition-transform duration-200 ${sortKey === 'jenis' ? 'text-emerald-600 dark:text-emerald-400 rotate-180' : 'text-slate-400'}`} />
                    </button>
                  </th>
                  <th className="hidden w-[18%] px-3 py-3 font-bold lg:table-cell">
                    <button
                      type="button"
                      onClick={() => handleSort('unit')}
                      className="inline-flex items-center gap-1.5 transition-all duration-150 active:scale-95 cursor-pointer hover:text-slate-900 dark:hover:text-white"
                    >
                      <span>Unit Kerja</span>
                      <ArrowBothDirectionHorizontal2 className={`h-3 w-3 shrink-0 transition-transform duration-200 ${sortKey === 'unit' ? 'text-emerald-600 dark:text-emerald-400 rotate-180' : 'text-slate-400'}`} />
                    </button>
                  </th>
                  <th className="hidden w-[18%] px-3 py-3 font-bold xl:table-cell">
                    <button
                      type="button"
                      onClick={() => handleSort('jabatan')}
                      className="inline-flex items-center gap-1.5 transition-all duration-150 active:scale-95 cursor-pointer hover:text-slate-900 dark:hover:text-white"
                    >
                      <span>Jabatan</span>
                      <ArrowBothDirectionHorizontal2 className={`h-3 w-3 shrink-0 transition-transform duration-200 ${sortKey === 'jabatan' ? 'text-emerald-600 dark:text-emerald-400 rotate-180' : 'text-slate-400'}`} />
                    </button>
                  </th>
                  <th className="hidden w-[12%] px-3 py-3 font-bold lg:table-cell">
                    <button
                      type="button"
                      onClick={() => handleSort('status_pegawai')}
                      className="inline-flex items-center gap-1.5 transition-all duration-150 active:scale-95 cursor-pointer hover:text-slate-900 dark:hover:text-white"
                    >
                      <span>Status Pegawai</span>
                      <ArrowBothDirectionHorizontal2 className={`h-3 w-3 shrink-0 transition-transform duration-200 ${sortKey === 'status_pegawai' ? 'text-emerald-600 dark:text-emerald-400 rotate-180' : 'text-slate-400'}`} />
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
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {loading ? (
                  Array.from({ length: 6 }).map((_, index) => (
                    <tr key={index} className="animate-pulse">
                      <td colSpan={7} className="px-4 py-4"><div className="h-10 rounded-xl bg-slate-100 dark:bg-slate-800" /></td>
                    </tr>
                  ))
                ) : paginatedEmployees.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-5"><MasterEmptyState title="Belum ada data SDM" description="Ubah filter pencarian untuk menampilkan pegawai atau guru lain." /></td>
                  </tr>
                ) : (
                  paginatedEmployees.map((emp, idx) => {
                    const guru = isGuru(emp)
                    return (
                      <tr
                        key={emp.id || idx}
                        onClick={() => handleOpenDetail(emp)}
                        className="transition-colors hover:bg-emerald-50/60 dark:hover:bg-emerald-950/40 cursor-pointer group"
                      >
                        <td className="px-2 py-3 text-center text-xs font-bold text-slate-400">{(page - 1) * perPage + idx + 1}</td>
                        <td className="px-3 py-3" onClick={(e) => e.stopPropagation()}>
                          <HoverCard>
                            <HoverCardTrigger asChild>
                              <div
                                onClick={() => handleOpenDetail(emp)}
                                className="inline-block cursor-pointer transition-transform duration-150 active:scale-95"
                              >
                                <PersonIdentityCell
                                  src={emp.foto || emp.photo}
                                  name={emp.nama_lengkap || emp.nama}
                                  subtitle={`${emp.niy || emp.nik || 'NIY tidak tersedia'}`}
                                />
                              </div>
                            </HoverCardTrigger>
                            <HoverCardContent side="right" align="start" className="w-72 p-4 bg-white dark:bg-[#1B2433] border border-slate-200 dark:border-slate-800 shadow-2xl rounded-2xl z-50">
                              <div className="space-y-3">
                                <div className="flex items-center gap-3">
                                  <Avatar className="size-12 border-2 border-emerald-500 shadow-sm">
                                    <AvatarImage src={emp.foto || emp.photo} />
                                    <AvatarFallback className="bg-emerald-600 text-white font-black">
                                      {(emp.nama_lengkap || emp.nama || 'SDM').slice(0, 2).toUpperCase()}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div className="min-w-0 flex-1">
                                    <h4 className="font-extrabold text-sm text-slate-900 dark:text-white truncate">
                                      {emp.nama_lengkap || emp.nama}
                                    </h4>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                                      NIY/NIK: {emp.niy || emp.nik || '-'}
                                    </p>
                                  </div>
                                </div>

                                <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-slate-100 dark:border-slate-800">
                                  <div>
                                    <span className="text-[10px] text-slate-400 font-bold uppercase block">Jenis SDM</span>
                                    <span className="font-bold text-slate-700 dark:text-slate-200">{guru ? 'Guru' : 'Tendik'}</span>
                                  </div>
                                  <div>
                                    <span className="text-[10px] text-slate-400 font-bold uppercase block">Unit Kerja</span>
                                    <span className="font-bold text-slate-700 dark:text-slate-200 truncate block">{emp.unit?.name || emp.unit?.code || '-'}</span>
                                  </div>
                                </div>

                                <div className="grid grid-cols-2 gap-2 text-xs">
                                  <div>
                                    <span className="text-[10px] text-slate-400 font-bold uppercase block">Jabatan</span>
                                    <span className="font-bold text-slate-700 dark:text-slate-200 truncate block">{emp.position?.nama_jabatan || emp.jabatan || 'Staf'}</span>
                                  </div>
                                  <div>
                                    <span className="text-[10px] text-slate-400 font-bold uppercase block">Status Pegawai</span>
                                    <span className="font-bold text-slate-700 dark:text-slate-200">{emp.status_pegawai || 'Tetap'}</span>
                                  </div>
                                </div>

                                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                                  <span className="text-[11px] text-slate-400 font-medium">Status Keaktifan</span>
                                  {getSolidStatusBadge(isEmpActive(emp))}
                                </div>

                                <div className="pt-1.5 border-t border-slate-100/80 dark:border-slate-800/80 text-center">
                                  <span className="text-[10px] font-extrabold text-emerald-600 dark:text-emerald-400">💡 Klik baris data untuk detail lengkap</span>
                                </div>
                              </div>
                            </HoverCardContent>
                          </HoverCard>
                        </td>
                        <td className="hidden px-3 py-3 md:table-cell">
                          <MasterBadge variant={guru ? 'success' : 'info'}>{guru ? 'Guru' : 'Tendik'}</MasterBadge>
                        </td>
                        <td className="hidden px-3 py-3 lg:table-cell">
                          <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">{emp.unit?.name || emp.unit?.code || '-'}</span>
                        </td>
                        <td className="hidden px-3 py-3 xl:table-cell">
                          <span className="text-xs text-slate-600 dark:text-slate-300">{emp.position?.nama_jabatan || emp.jabatan || 'Staf'}</span>
                        </td>
                        <td className="hidden px-3 py-3 lg:table-cell">
                          {getSolidStatusPegawaiBadge(emp.status_pegawai)}
                        </td>
                        <td className="hidden px-2 py-3 text-center sm:table-cell">
                          {getSolidStatusBadge(isEmpActive(emp))}
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
          label="pegawai"
        />
      )}

      <KpiDetailDrawer
        type={selectedDetailType}
        id={selectedEmployeeId}
        isOpen={Boolean(selectedEmployeeId)}
        onClose={() => setSelectedEmployeeId(null)}
      />

      <FoundationUnitKpiModal
        type={activeKpiModal || 'pegawai_kpi'}
        isOpen={Boolean(activeKpiModal)}
        onClose={() => setActiveKpiModal(null)}
        units={units}
      />

      <FoundationExportModal
        isOpen={showExport}
        onClose={() => setShowExport(false)}
        title="Pegawai & Guru Seluruh Yayasan"
        rows={exportRows}
        filename="Pegawai_Guru_Yayasan"
      />
      </motion.div>
    </motion.div>
    </MasterDataPage>
  )
}
