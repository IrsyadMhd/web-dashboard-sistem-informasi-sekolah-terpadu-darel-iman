import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  AlertTriangle,
  ArrowUpDown,
  Award,
  BookOpen,
  Calendar,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ClipboardCheck,
  Clock,
  Download,
  Eye,
  FileSpreadsheet,
  Filter,
  MoreVertical,
  Printer,
  RefreshCcw,
  Search,
  Stethoscope,
  TrendingUp,
  User,
  UserCheck,
  Users,
  UserX,
  X,
  CheckCircle2,
} from 'lucide-react'
import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { gateAttendanceService } from '../services/gateAttendanceService'
import PageContainer from '../components/app/PageContainer'
import AppBreadcrumb from '../components/app/AppBreadcrumb'
import AppBadge from '../components/app/AppBadge'
import AppSkeleton from '../components/app/AppSkeleton'
import AppEmptyState from '../components/app/AppEmptyState'
import {
  MasterStatsGrid,
  MasterStatCard,
  SquircleActionButton,
  PrintOptionModal,
} from '../components/master-data'
import { Input } from '@/components/tailgrids/core/input'
import { Button } from '@/components/tailgrids/core/button'
import { Pagination } from '@/components/tailgrids/core/pagination'
import { TableBody, TableCell, TableHead, TableHeader, TableRoot, TableRow } from '@/components/tailgrids/core/table'
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/tailgrids/core/hover-card'
import { Dialog, DialogBody, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/tailgrids/core/dialog'
import { Backdrop, OverlayWrapper } from '@/components/tailgrids/core/overlay'
import { printCleanTable, downloadPdfTable } from '../utils/printHelper'
import { cn } from '../lib/utils'

const MODAL_PAGE_SIZE = 6
const today = () => new Date().toISOString().slice(0, 10)
const formatAngka = (value) => new Intl.NumberFormat('id-ID').format(Number(value || 0))

const warnaStatus = {
  hadir: '#12a968',
  terlambat: '#8b5cf6',
  izin: '#3182f6',
  sakit: '#ff8a1f',
  alpa: '#ff4668',
  pulang: '#0284c7',
}

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
}

const getPeriodDateRange = (periodKey) => {
  const now = new Date()
  const iso = (d) => d.toISOString().slice(0, 10)
  const todayStr = iso(now)

  if (periodKey === 'hari') {
    return { from: todayStr, to: todayStr }
  }
  if (periodKey === 'minggu') {
    const past = new Date(now)
    past.setDate(now.getDate() - 6)
    return { from: iso(past), to: todayStr }
  }
  if (periodKey === 'bulan') {
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1)
    return { from: iso(firstDay), to: todayStr }
  }
  if (periodKey === 'semester') {
    const past = new Date(now.getFullYear(), now.getMonth() - 5, 1)
    return { from: iso(past), to: todayStr }
  }
  if (periodKey === 'tahun') {
    const firstDay = new Date(now.getFullYear(), 0, 1)
    return { from: iso(firstDay), to: todayStr }
  }
  return { from: '', to: '' }
}

export default function RekapAbsensiGerbangPage() {
  const [date, setDate] = useState(today())
  const [status, setStatus] = useState('')
  const [search, setSearch] = useState('')
  const [rows, setRows] = useState([])
  const [stats, setStats] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // State filter Periode Waktu (Hari, Minggu, Bulan, Semester, Tahun)
  const [period, setPeriod] = useState('hari')
  const [dateFrom, setDateFrom] = useState(today())
  const [dateTo, setDateTo] = useState(today())

  const [currentPage, setCurrentPage] = useState(1)
  const [perPage, setPerPage] = useState(10)
  const [sortField, setSortField] = useState('check_in_time')
  const [sortDirection, setSortDirection] = useState('asc')

  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false)
  const [selectedDetailStudent, setSelectedDetailStudent] = useState(null)

  // Card Modal State for Summary Cards click
  const [cardModal, setCardModal] = useState({
    isOpen: false,
    statusKey: 'semua',
    title: '',
    tone: 'emerald',
    searchQuery: '',
    page: 1,
  })

  // Load backend data from gateAttendanceService
  const load = useCallback(async () => {
    try {
      setLoading(true)
      setError('')
      const [logs, summary] = await Promise.all([
        gateAttendanceService.getLogs({ date: dateFrom || date, date_from: dateFrom, date_to: dateTo, status, search, per_page: 500 }),
        gateAttendanceService.getStats({ date: dateFrom || date }),
      ])
      const fetchedRows = logs.data?.data?.data || logs.data?.data || []
      setRows(Array.isArray(fetchedRows) ? fetchedRows : [])
      setStats(summary.data?.data || {})
    } catch (err) {
      setError(err.response?.data?.message || 'Rekap absensi gerbang gagal dimuat.')
      setRows([])
      setStats({})
    } finally {
      setLoading(false)
    }
  }, [date, dateFrom, dateTo, status, search])

  useEffect(() => {
    load()
  }, [load])

  // Time filtered rows based on dateFrom and dateTo
  const timeFilteredRows = useMemo(() => {
    let list = rows
    if (dateFrom) {
      list = list.filter((r) => !r.date && !r.tanggal && !r.created_at ? true : (r.date || r.tanggal || r.created_at?.slice(0, 10)) >= dateFrom)
    }
    if (dateTo) {
      list = list.filter((r) => !r.date && !r.tanggal && !r.created_at ? true : (r.date || r.tanggal || r.created_at?.slice(0, 10)) <= dateTo)
    }
    return list
  }, [rows, dateFrom, dateTo])

  // Summary Metrics Computation
  const metrics = useMemo(() => {
    const totalSiswa = stats.total_siswa || timeFilteredRows.length || 0
    const totalScanned = stats.total_scanned || timeFilteredRows.filter((r) => r.check_in_time || r.status).length
    const tepatWaktu = stats.tepat_waktu || timeFilteredRows.filter((r) => String(r.status || '').toUpperCase() === 'HADIR' || String(r.status || '').toUpperCase() === 'TEPAT_WAKTU').length
    const terlambat = stats.terlambat || timeFilteredRows.filter((r) => String(r.status || '').toUpperCase() === 'TERLAMBAT').length
    const izinSakit = (stats.izin || 0) + (stats.sakit || 0) || timeFilteredRows.filter((r) => ['IZIN', 'SAKIT'].includes(String(r.status || '').toUpperCase())).length
    const sudahPulang = stats.sudah_pulang || timeFilteredRows.filter((r) => r.check_out_time).length
    const alpa = stats.alpa || (totalSiswa > totalScanned ? totalSiswa - totalScanned : timeFilteredRows.filter((r) => String(r.status || '').toUpperCase() === 'ALPHA' || String(r.status || '').toUpperCase() === 'ALPA').length)
    const baseTotal = totalSiswa > 0 ? totalSiswa : Math.max(1, totalScanned)

    return { totalSiswa, totalScanned, tepatWaktu, terlambat, izinSakit, sudahPulang, alpa, baseTotal }
  }, [stats, timeFilteredRows])

  const cards = useMemo(
    () => [
      {
        label: 'Hadir / Tepat Waktu',
        statusKey: 'HADIR',
        value: metrics.tepatWaktu,
        icon: UserCheck,
        tone: 'emerald',
        percent: (metrics.tepatWaktu / metrics.baseTotal) * 100,
      },
      {
        label: 'Terlambat',
        statusKey: 'TERLAMBAT',
        value: metrics.terlambat,
        icon: Clock,
        tone: 'violet',
        percent: (metrics.terlambat / metrics.baseTotal) * 100,
      },
      {
        label: 'Izin / Sakit',
        statusKey: 'IZIN',
        value: metrics.izinSakit,
        icon: ClipboardCheck,
        tone: 'sky',
        percent: (metrics.izinSakit / metrics.baseTotal) * 100,
      },
      {
        label: 'Sudah Pulang',
        statusKey: 'PULANG',
        value: metrics.sudahPulang,
        icon: User,
        tone: 'amber',
        percent: (metrics.sudahPulang / metrics.baseTotal) * 100,
      },
      {
        label: 'Alpha / Belum Scan',
        statusKey: 'ALPHA',
        value: metrics.alpa,
        icon: UserX,
        tone: 'rose',
        percent: (metrics.alpa / metrics.baseTotal) * 100,
      },
    ],
    [metrics]
  )

  const distribution = useMemo(
    () => [
      { name: 'Hadir', value: metrics.tepatWaktu, color: warnaStatus.hadir },
      { name: 'Terlambat', value: metrics.terlambat, color: warnaStatus.terlambat },
      { name: 'Izin/Sakit', value: metrics.izinSakit, color: warnaStatus.izin },
      { name: 'Sudah Pulang', value: metrics.sudahPulang, color: warnaStatus.pulang },
      { name: 'Alpha/Belum', value: metrics.alpa, color: warnaStatus.alpa },
    ],
    [metrics]
  )

  const chartData = useMemo(() => {
    // Generate hourly breakdown from rows
    const hourMap = new Map()
    timeFilteredRows.forEach((r) => {
      const time = r.check_in_time || '07:00'
      const hourStr = time.slice(0, 2) + ':00'
      if (!hourMap.has(hourStr)) {
        hourMap.set(hourStr, { label: hourStr, tepat: 0, terlambat: 0 })
      }
      const item = hourMap.get(hourStr)
      const st = String(r.status || '').toUpperCase()
      if (st === 'TERLAMBAT') item.terlambat += 1
      else item.tepat += 1
    })

    return Array.from(hourMap.values()).sort((a, b) => a.label.localeCompare(b.label))
  }, [timeFilteredRows])

  // Filtered and sorted rows
  const filteredRows = useMemo(() => {
    return timeFilteredRows.filter((r) => {
      const q = search.toLowerCase().trim()
      const studentName = (r.student?.nama_lengkap || r.student?.full_name || '').toLowerCase()
      const nis = (r.student?.nis || r.student?.nisn || '').toLowerCase()
      const kelas = (r.school_class?.name || r.school_class?.nama_kelas || '').toLowerCase()
      const unit = (r.education_unit?.name || '').toLowerCase()

      const matchesSearch = !q || studentName.includes(q) || nis.includes(q) || kelas.includes(q) || unit.includes(q)
      const matchesStatus = !status || String(r.status || '').toUpperCase() === status.toUpperCase()

      return matchesSearch && matchesStatus
    })
  }, [timeFilteredRows, search, status])

  const sortedRows = useMemo(() => {
    return [...filteredRows].sort((a, b) => {
      let aVal = a[sortField] || ''
      let bVal = b[sortField] || ''

      if (sortField === 'student') {
        aVal = a.student?.nama_lengkap || a.student?.full_name || ''
        bVal = b.student?.nama_lengkap || b.student?.full_name || ''
      }

      if (typeof aVal === 'string') {
        aVal = aVal.toLowerCase()
        bVal = (bVal || '').toLowerCase()
      }

      if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1
      if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1
      return 0
    })
  }, [filteredRows, sortField, sortDirection])

  const totalPages = Math.ceil(sortedRows.length / perPage) || 1
  const paginatedRows = useMemo(() => {
    const start = (currentPage - 1) * perPage
    return sortedRows.slice(start, start + perPage)
  }, [sortedRows, currentPage, perPage])

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  const resetFilters = () => {
    setDate(today())
    setPeriod('hari')
    setDateFrom(today())
    setDateTo(today())
    setStatus('')
    setSearch('')
    setCurrentPage(1)
  }

  // Card Modal Handlers
  const openCardModal = (statusKey, label, tone) => {
    setCardModal({
      isOpen: true,
      statusKey,
      title: `Data Siswa Status ${label}`,
      tone,
      searchQuery: '',
      page: 1,
    })
  }

  const closeCardModal = () => {
    setCardModal((prev) => ({ ...prev, isOpen: false }))
  }

  const modalRows = useMemo(() => {
    if (!cardModal.isOpen) return []
    let list = timeFilteredRows
    if (cardModal.statusKey === 'PULANG') {
      list = list.filter((r) => r.check_out_time)
    } else if (cardModal.statusKey && cardModal.statusKey !== 'semua') {
      list = list.filter((r) => String(r.status || '').toUpperCase() === cardModal.statusKey.toUpperCase())
    }
    if (cardModal.searchQuery.trim()) {
      const q = cardModal.searchQuery.toLowerCase().trim()
      list = list.filter((r) => {
        const name = (r.student?.nama_lengkap || r.student?.full_name || '').toLowerCase()
        const nis = (r.student?.nis || r.student?.nisn || '').toLowerCase()
        const kelas = (r.school_class?.name || r.school_class?.nama_kelas || '').toLowerCase()
        return name.includes(q) || nis.includes(q) || kelas.includes(q)
      })
    }
    return list
  }, [timeFilteredRows, cardModal.isOpen, cardModal.statusKey, cardModal.searchQuery])

  const modalTotalPages = Math.max(1, Math.ceil(modalRows.length / MODAL_PAGE_SIZE))
  const paginatedModalRows = useMemo(() => {
    return modalRows.slice((cardModal.page - 1) * MODAL_PAGE_SIZE, cardModal.page * MODAL_PAGE_SIZE)
  }, [modalRows, cardModal.page])

  // Export Handlers
  const handleExportCSV = () => {
    const filename = `rekap-absensi-gerbang_${dateFrom || date}.csv`
    const csvHeader = ['#', 'Nama Siswa', 'NIS/NISN', 'Unit Pendidikan', 'Kelas', 'Jam Masuk', 'Jam Pulang', 'Metode', 'Status']
    const csvRows = sortedRows.map((r, i) => [
      i + 1,
      r.student?.nama_lengkap || r.student?.full_name || '-',
      r.student?.nis || r.student?.nisn || '-',
      r.education_unit?.name || '-',
      r.school_class?.name || r.school_class?.nama_kelas || '-',
      r.check_in_time || '-',
      r.check_out_time || '-',
      r.attendance_method || '-',
      r.status || '-',
    ])

    const csvContent = [csvHeader, ...csvRows]
      .map((row) => row.map((cell) => `"${String(cell ?? '').replaceAll('"', '""')}"`).join(','))
      .join('\n')

    const blob = new Blob([`\uFEFF${csvContent}`], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = filename
    link.click()
    URL.revokeObjectURL(link.href)
  }

  const handlePrintClean = () => {
    setIsPrintModalOpen(false)
    printCleanTable({
      title: 'Rekap Absensi Gerbang Siswa',
      subtitle: `Periode Tanggal: ${dateFrom || date} s/d ${dateTo || date} — Total Record: ${sortedRows.length} Data`,
      headers: ['#', 'Nama Siswa', 'NIS/NISN', 'Unit', 'Kelas', 'Jam Masuk', 'Jam Pulang', 'Metode', 'Status'],
      rows: sortedRows.map((r, i) => [
        i + 1,
        r.student?.nama_lengkap || r.student?.full_name || '-',
        r.student?.nis || r.student?.nisn || '-',
        r.education_unit?.name || '-',
        r.school_class?.name || r.school_class?.nama_kelas || '-',
        r.check_in_time || '-',
        r.check_out_time || '-',
        r.attendance_method || '-',
        r.status || '-',
      ]),
    })
  }

  const handleDownloadPDF = () => {
    setIsPrintModalOpen(false)
    downloadPdfTable({
      title: 'Rekap Absensi Gerbang Siswa',
      subtitle: `Periode Tanggal: ${dateFrom || date} s/d ${dateTo || date}`,
      headers: ['#', 'Nama Siswa', 'NIS/NISN', 'Unit', 'Kelas', 'Jam Masuk', 'Jam Pulang', 'Metode', 'Status'],
      rows: sortedRows.map((r, i) => [
        i + 1,
        r.student?.nama_lengkap || r.student?.full_name || '-',
        r.student?.nis || r.student?.nisn || '-',
        r.education_unit?.name || '-',
        r.school_class?.name || r.school_class?.nama_kelas || '-',
        r.check_in_time || '-',
        r.check_out_time || '-',
        r.attendance_method || '-',
        r.status || '-',
      ]),
      filename: `Rekap_Absensi_Gerbang_${dateFrom || date}.pdf`,
    })
  }

  return (
    <PageContainer className="space-y-6 pb-12">
      {/* Navigation Breadcrumb */}
      <div className="mb-2">
        <AppBreadcrumb items={[{ label: 'Absensi', href: '/absensi' }, { label: 'Rekap Absensi Gerbang' }]} />
      </div>

      {/* Summary Cards Grid (5 Equal & Colored Cards) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 md:gap-5">
        {cards.map(({ label, statusKey, value, icon: Icon, tone, percent }) => {
          const style = toneStyles[tone] || toneStyles.emerald
          return (
            <article
              key={label}
              onClick={() => openCardModal(statusKey, label, tone)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && openCardModal(statusKey, label, tone)}
              className={`group flex flex-col justify-between h-full p-4 rounded-[18px] border shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer ${style.cardBg}`}
              title={`Klik untuk melihat detail data ${label}`}
            >
              <div className="flex items-center justify-between gap-2 mb-3">
                <div className={`size-10 sm:size-11 rounded-xl flex items-center justify-center shrink-0 ${style.iconBg} ${style.iconColor}`}>
                  <Icon className="size-5 sm:size-6" />
                </div>
                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold ${style.badge}`}>
                  {percent.toFixed(1)}%
                </span>
              </div>
              <div>
                <span className="text-xs font-semibold text-slate-600 dark:text-slate-300 block mb-0.5">{label}</span>
                <strong className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white block">
                  {formatAngka(value)}
                </strong>
              </div>
              <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 group-hover:text-emerald-700 dark:text-slate-400 dark:hover:text-emerald-400 transition-colors pt-3 mt-3 border-t border-slate-200/60 dark:border-slate-800/80">
                <span>dari total data</span>
                <span className="inline-flex items-center gap-0.5 text-emerald-700 dark:text-emerald-400 font-bold group-hover:translate-x-0.5 transition-transform">
                  Detail &rarr;
                </span>
              </div>
            </article>
          )
        })}
      </div>

      {/* 3-Column Equal Grid: Filter Laporan, Grafik Kehadiran, & Distribusi */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-stretch">
        {/* Col 1: Filter Laporan */}
        <article className="overflow-hidden rounded-[18px] border border-slate-200/80 bg-white dark:bg-[#1B2433] p-5 sm:p-6 shadow-xs flex flex-col justify-between h-full">
          <div>
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100 dark:border-slate-800">
              <h2 className="text-base font-bold text-slate-900 dark:text-white">Filter Laporan Gerbang</h2>
              <button
                type="button"
                onClick={resetFilters}
                className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
              >
                Reset Filter
              </button>
            </div>

            <div className="space-y-3">
              {/* Fitur Filter Periode Waktu (Hari, Minggu, Bulan, Semester, Tahun) */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Periode Waktu
                </label>
                <select
                  value={period}
                  onChange={(e) => {
                    const nextPeriod = e.target.value
                    setPeriod(nextPeriod)
                    if (nextPeriod !== 'custom' && nextPeriod !== 'semua') {
                      const { from, to } = getPeriodDateRange(nextPeriod)
                      setDateFrom(from)
                      setDateTo(to)
                    } else if (nextPeriod === 'semua') {
                      setDateFrom('')
                      setDateTo('')
                    }
                    setCurrentPage(1)
                  }}
                  className="w-full h-9 px-3 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="semua">Semua Periode Data</option>
                  <option value="hari">Hari Ini (Per Hari)</option>
                  <option value="minggu">7 Hari Terakhir (Per Minggu)</option>
                  <option value="bulan">Bulan Ini (Per Bulan)</option>
                  <option value="semester">6 Bulan Terakhir (Per Semester)</option>
                  <option value="tahun">Tahun Ini (Per Tahun)</option>
                  <option value="custom">Rentang Tanggal Kustom</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-1">
                <div>
                  <label className="block text-[11px] font-medium text-slate-500 mb-0.5">Tanggal Mulai</label>
                  <input
                    type="date"
                    value={dateFrom}
                    onChange={(e) => {
                      setDateFrom(e.target.value)
                      setPeriod('custom')
                      setCurrentPage(1)
                    }}
                    className="w-full h-8 px-2 text-[11px] rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-slate-500 mb-0.5">Tanggal Selesai</label>
                  <input
                    type="date"
                    value={dateTo}
                    onChange={(e) => {
                      setDateTo(e.target.value)
                      setPeriod('custom')
                      setCurrentPage(1)
                    }}
                    className="w-full h-8 px-2 text-[11px] rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Status Presensi Gerbang
                </label>
                <select
                  value={status}
                  onChange={(e) => {
                    setStatus(e.target.value)
                    setCurrentPage(1)
                  }}
                  className="w-full h-9 px-3 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="">Semua Status</option>
                  <option value="HADIR">Hadir / Tepat Waktu</option>
                  <option value="TERLAMBAT">Terlambat</option>
                  <option value="IZIN">Izin</option>
                  <option value="SAKIT">Sakit</option>
                  <option value="ALPHA">Alpha / Belum Scan</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Pencarian Siswa
                </label>
                <input
                  type="text"
                  placeholder="Nama, NIS, atau NISN..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full h-9 px-3 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>
          </div>
        </article>

        {/* Col 2: Grafik Trend Masuk Gerbang */}
        <article className="overflow-hidden rounded-[18px] border border-slate-200/80 bg-white dark:bg-[#1B2433] p-5 sm:p-6 shadow-xs flex flex-col justify-between h-full">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100 dark:border-slate-800">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">Waktu Masuk Gerbang</h2>
            <span className="text-xs font-semibold text-slate-400">Jam Masuk</span>
          </div>
          <div className="h-64 w-full">
            {loading ? (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">Memuat grafik...</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <defs>
                    <linearGradient id="hadirGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#12a968" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="#12a968" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="#edf1f5" vertical={false} />
                  <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fill: '#718096', fontSize: 10 }} />
                  <YAxis allowDecimals={false} tickLine={false} axisLine={false} tick={{ fill: '#718096', fontSize: 10 }} />
                  <Tooltip />
                  <Area type="monotone" dataKey="tepat" name="Tepat Waktu" stroke={warnaStatus.hadir} fill="url(#hadirGradient)" strokeWidth={2} />
                  <Area type="monotone" dataKey="terlambat" name="Terlambat" stroke={warnaStatus.terlambat} fill="transparent" strokeWidth={1.5} />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </article>

        {/* Col 3: Distribusi Status Gerbang */}
        <article className="overflow-hidden rounded-[18px] border border-slate-200/80 bg-white dark:bg-[#1B2433] p-5 sm:p-6 shadow-xs flex flex-col justify-between h-full">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100 dark:border-slate-800">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">Distribusi Absensi Gerbang</h2>
            <span className="text-xs font-bold text-slate-500">{formatAngka(metrics.baseTotal)} Total</span>
          </div>
          <div className="flex flex-col items-center justify-center flex-1">
            <div className="relative w-40 h-40 mb-3">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={distribution} dataKey="value" innerRadius="62%" outerRadius="88%" paddingAngle={2}>
                    {distribution.map((item) => <Cell key={item.name} fill={item.color} />)}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <strong className="text-xl font-black text-slate-900 dark:text-white">{formatAngka(metrics.totalScanned)}</strong>
                <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Sudah Scan</span>
              </div>
            </div>

            <div className="w-full grid grid-cols-2 gap-2 text-xs">
              {distribution.map((item) => (
                <div key={item.name} className="flex items-center gap-1.5 p-1.5 rounded-lg bg-slate-50 dark:bg-slate-900/60">
                  <span className="size-2.5 rounded-full shrink-0" style={{ background: item.color }} />
                  <div className="flex items-center justify-between w-full min-w-0">
                    <span className="text-[11px] font-medium text-slate-600 dark:text-slate-400 truncate">{item.name}</span>
                    <span className="text-[11px] font-bold text-slate-900 dark:text-white ml-1">{formatAngka(item.value)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </article>
      </div>

      {/* Main Datatable Outer Container */}
      <div className="overflow-hidden rounded-[18px] border border-slate-200/80 bg-white shadow-xs dark:border-slate-800 dark:bg-[#1B2433]">
        {/* Header Baris 1: Title & Action Buttons */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 sm:p-6 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">Hasil Scan & Rekap Absensi Gerbang</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Rekapan baca-saja dari seluruh hasil scan masuk dan pulang siswa berbasis RFID / QR / Barcode.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-nowrap shrink-0">
            <SquircleActionButton
              variant="export"
              label="Export CSV"
              onClick={handleExportCSV}
            />
            <SquircleActionButton
              variant="view"
              icon={Printer}
              label="Cetak Data"
              onClick={() => setIsPrintModalOpen(true)}
            />
          </div>
        </div>

        {/* Toolbar Baris 2: Search Input & Per-Page Controls */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between p-4 bg-slate-50/60 dark:bg-slate-900/40 border-b border-slate-100 dark:border-slate-800">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
            <Input
              type="text"
              placeholder="Cari nama siswa, NIS, NISN, atau kelas..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                setCurrentPage(1)
              }}
              className="pl-9 text-xs font-medium"
            />
          </div>

          <div className="flex items-center gap-1.5 self-end sm:self-auto">
            <span className="text-xs font-medium text-slate-500">Per Halaman:</span>
            <div className="relative">
              <select
                value={perPage}
                onChange={(e) => {
                  setPerPage(Number(e.target.value))
                  setCurrentPage(1)
                }}
                className="h-9 cursor-pointer appearance-none rounded-xl border border-slate-200 bg-white pl-3 pr-8 text-xs font-semibold text-slate-800 shadow-2xs focus:border-[#0E5C44] focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={15}>15</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
              <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 size-3.5 -translate-y-1/2 text-slate-400" />
            </div>
          </div>
        </div>

        {/* Viewport Tabel dengan Horizontal Padding */}
        <div className="px-4 sm:px-6 md:px-8 overflow-x-auto">
          {loading ? (
            <div className="py-6">
              <AppSkeleton rows={6} />
            </div>
          ) : paginatedRows.length === 0 ? (
            <div className="py-8">
              <AppEmptyState
                title="Tidak ada data scan gerbang"
                description="Belum ada data scan absensi gerbang yang sesuai dengan kriteria pencarian dan filter pilihan Anda."
              />
            </div>
          ) : (
            <TableRoot fullBleed={false}>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12 text-center">#</TableHead>

                  <TableHead
                    className="cursor-pointer select-none hover:text-emerald-600 transition-colors"
                    onClick={() => handleSort('student')}
                  >
                    <div className="flex items-center gap-1.5">
                      <span>Siswa</span>
                      <ArrowUpDown className="size-3.5 text-slate-400" />
                    </div>
                  </TableHead>

                  <TableHead className="text-center">NIS / NISN</TableHead>
                  <TableHead className="text-center">Unit Pendidikan</TableHead>
                  <TableHead className="text-center">Kelas</TableHead>
                  <TableHead className="text-center">Jam Masuk</TableHead>
                  <TableHead className="text-center">Jam Pulang</TableHead>
                  <TableHead className="text-center">Metode</TableHead>
                  <TableHead className="text-right">Status</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {paginatedRows.map((row, index) => {
                  const studentName = row.student?.nama_lengkap || row.student?.full_name || 'Siswa'
                  const studentNis = row.student?.nis || row.student?.nisn || '-'
                  const unitName = row.education_unit?.name || '-'
                  const kelasName = row.school_class?.name || row.school_class?.nama_kelas || '-'
                  const st = String(row.status || '').toUpperCase()
                  const statusVariant = st === 'HADIR' || st === 'TEPAT_WAKTU' ? 'success' : st === 'TERLAMBAT' ? 'warning' : st === 'PULANG' ? 'info' : 'danger'

                  return (
                    <TableRow key={row.id || index} className="hover:bg-slate-50/90 dark:hover:bg-slate-800/50 transition-colors">
                      <TableCell className="text-center font-bold text-slate-400 text-xs">
                        {(currentPage - 1) * perPage + index + 1}
                      </TableCell>

                      {/* Cell Identitas Siswa dengan HoverCard */}
                      <TableCell>
                        <HoverCard>
                          <HoverCardTrigger
                            onClick={(e) => {
                              e.preventDefault()
                              setSelectedDetailStudent(row)
                            }}
                            className="font-extrabold text-slate-900 dark:text-white text-sm border-b border-dashed border-slate-400/60 hover:border-[#0E5C44] transition-colors cursor-pointer inline-block"
                          >
                            {studentName}
                          </HoverCardTrigger>

                          <HoverCardContent className="w-72 p-0 overflow-hidden border border-slate-200 bg-white dark:border-slate-800 dark:bg-[#1B2433] shadow-xl rounded-2xl z-50">
                            <div className="relative h-20 w-full bg-gradient-to-r from-emerald-800 to-teal-900 p-3.5 flex items-center justify-between text-white">
                              <div>
                                <span className="text-[9px] font-bold uppercase tracking-wider bg-white/20 px-2 py-0.5 rounded-full text-white">
                                  {kelasName}
                                </span>
                                <h4 className="text-sm font-extrabold mt-1 text-white truncate max-w-[170px]">
                                  {studentName}
                                </h4>
                              </div>
                              <div className="size-10 rounded-xl bg-white/10 backdrop-blur-xs flex items-center justify-center font-black text-xs text-white border border-white/20 shrink-0">
                                {st || 'SCAN'}
                              </div>
                            </div>

                            <div className="p-3.5 space-y-2.5">
                              <div className="grid grid-cols-2 gap-2 text-xs">
                                <div>
                                  <span className="text-slate-400 block text-[10px] font-semibold">NIS / NISN</span>
                                  <span className="font-bold text-slate-800 dark:text-slate-200 font-mono truncate block">{studentNis}</span>
                                </div>
                                <div>
                                  <span className="text-slate-400 block text-[10px] font-semibold">Unit Pendidikan</span>
                                  <span className="font-bold text-slate-800 dark:text-slate-200 truncate block">{unitName}</span>
                                </div>
                              </div>

                              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 dark:border-slate-800/80 text-center text-[11px]">
                                <div className="bg-emerald-50 dark:bg-emerald-950/40 p-2 rounded-lg border border-emerald-200/50">
                                  <span className="block text-[9px] font-bold text-emerald-600">Jam Masuk</span>
                                  <span className="font-extrabold text-emerald-800 dark:text-emerald-300">{row.check_in_time || '-'}</span>
                                </div>
                                <div className="bg-sky-50 dark:bg-sky-950/40 p-2 rounded-lg border border-sky-200/50">
                                  <span className="block text-[9px] font-bold text-sky-600">Jam Pulang</span>
                                  <span className="font-extrabold text-sky-800 dark:text-sky-300">{row.check_out_time || '-'}</span>
                                </div>
                              </div>

                              <button
                                type="button"
                                onClick={() => setSelectedDetailStudent(row)}
                                className="w-full py-2 bg-[#0E5C44] text-white text-[10px] font-bold uppercase tracking-wider rounded-xl transition-all hover:bg-[#1E8E5A] active:scale-98 shadow-xs cursor-pointer"
                              >
                                Lihat Detail Presensi Siswa
                              </button>
                            </div>
                          </HoverCardContent>
                        </HoverCard>
                      </TableCell>

                      <TableCell className="text-center font-mono font-semibold text-slate-600 dark:text-slate-400 text-xs">
                        {studentNis}
                      </TableCell>

                      <TableCell className="text-center font-medium text-slate-700 dark:text-slate-300">
                        {unitName}
                      </TableCell>

                      <TableCell className="text-center font-semibold text-slate-800 dark:text-slate-200">
                        {kelasName}
                      </TableCell>

                      <TableCell className="text-center font-extrabold text-emerald-700 dark:text-emerald-400">
                        {row.check_in_time || '-'}
                      </TableCell>

                      <TableCell className="text-center font-extrabold text-sky-700 dark:text-sky-400">
                        {row.check_out_time || '-'}
                      </TableCell>

                      <TableCell className="text-center text-xs font-semibold text-slate-500">
                        {row.attendance_method || 'RFID'}
                      </TableCell>

                      <TableCell className="text-right">
                        <AppBadge
                          variant={statusVariant}
                          className="hover:scale-105 transition-transform cursor-pointer"
                          onClick={() => setSelectedDetailStudent(row)}
                        >
                          {row.status || 'HADIR'}
                        </AppBadge>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </TableRoot>
          )}
        </div>

        {/* Footer Pagination Navigation */}
        <div className="w-full border-t border-slate-100 px-4 py-3.5 sm:px-6 md:px-8 dark:border-slate-800">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={(page) => setCurrentPage(page)}
            sideLayout="full"
          />
        </div>
      </div>

      {/* Summary Card Interactive Datatable Modal */}
      {cardModal.isOpen && (
        <Dialog
          isOpen={cardModal.isOpen}
          onOpenChange={(open) => !open && closeCardModal()}
          className="w-full max-w-4xl max-h-[90vh] flex flex-col p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl"
        >
          <DialogHeader className="flex flex-row items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
            <div>
              <div className="flex items-center gap-3">
                <DialogTitle className="text-xl font-bold text-slate-900 dark:text-slate-100">
                  {cardModal.title}
                </DialogTitle>
                <AppBadge variant={cardModal.tone === 'rose' ? 'danger' : cardModal.tone === 'amber' ? 'warning' : 'success'}>
                  {modalRows.length} Data Scan
                </AppBadge>
              </div>
              <DialogDescription className="text-xs text-slate-500 mt-1">
                Daftar rincian log scan gerbang siswa dengan status {cardModal.title} pada periode {dateFrom || date} s/d {dateTo || date}
              </DialogDescription>
            </div>
          </DialogHeader>

          <DialogBody className="flex-1 overflow-y-auto py-4 space-y-4">
            {/* Modal Search Toolbar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl">
              <div className="relative w-full sm:w-80">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Cari nama siswa, NIS, atau kelas..."
                  value={cardModal.searchQuery}
                  onChange={(e) => setCardModal((prev) => ({ ...prev, searchQuery: e.target.value, page: 1 }))}
                  className="w-full pl-9 pr-8 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500"
                />
                {cardModal.searchQuery && (
                  <button
                    type="button"
                    onClick={() => setCardModal((prev) => ({ ...prev, searchQuery: '', page: 1 }))}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Modal Datatable */}
            <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 font-semibold border-b border-slate-200 dark:border-slate-700">
                  <tr>
                    <th className="py-3 px-4">No</th>
                    <th className="py-3 px-4">Siswa</th>
                    <th className="py-3 px-4">NIS/NISN</th>
                    <th className="py-3 px-4">Kelas</th>
                    <th className="py-3 px-4">Jam Masuk</th>
                    <th className="py-3 px-4">Jam Pulang</th>
                    <th className="py-3 px-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {paginatedModalRows.length > 0 ? (
                    paginatedModalRows.map((row, idx) => {
                      const studentName = row.student?.nama_lengkap || row.student?.full_name || 'Siswa'
                      const studentNis = row.student?.nis || row.student?.nisn || '-'
                      const kelasName = row.school_class?.name || row.school_class?.nama_kelas || '-'
                      const st = String(row.status || '').toUpperCase()

                      return (
                        <tr key={row.id || idx} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                          <td className="py-3 px-4 font-medium text-slate-500">
                            {(cardModal.page - 1) * MODAL_PAGE_SIZE + idx + 1}
                          </td>
                          <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">
                            {studentName}
                          </td>
                          <td className="py-3 px-4 font-mono text-slate-600 dark:text-slate-400">
                            {studentNis}
                          </td>
                          <td className="py-3 px-4 font-medium text-slate-800 dark:text-slate-200">
                            {kelasName}
                          </td>
                          <td className="py-3 px-4 text-emerald-700 dark:text-emerald-400 font-bold">
                            {row.check_in_time || '-'}
                          </td>
                          <td className="py-3 px-4 text-sky-700 dark:text-sky-400 font-bold">
                            {row.check_out_time || '-'}
                          </td>
                          <td className="py-3 px-4">
                            <AppBadge variant={st === 'HADIR' ? 'success' : st === 'TERLAMBAT' ? 'warning' : 'danger'}>
                              {st || 'SCAN'}
                            </AppBadge>
                          </td>
                        </tr>
                      )
                    })
                  ) : (
                    <tr>
                      <td colSpan="7" className="py-8 text-center text-slate-400 font-medium">
                        {cardModal.searchQuery ? 'Tidak ada data presensi yang cocok dengan pencarian.' : 'Belum ada data pada kategori ini.'}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </DialogBody>

          <DialogFooter className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-800">
            <span className="text-xs text-slate-500 font-medium">
              Menampilkan {modalRows.length ? (cardModal.page - 1) * MODAL_PAGE_SIZE + 1 : 0}–{Math.min(cardModal.page * MODAL_PAGE_SIZE, modalRows.length)} dari {modalRows.length} data
            </span>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 mr-4">
                <button
                  type="button"
                  disabled={cardModal.page === 1}
                  onClick={() => setCardModal((prev) => ({ ...prev, page: prev.page - 1 }))}
                  className="p-1 rounded border border-slate-200 dark:border-slate-700 disabled:opacity-40 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <span className="text-xs font-semibold px-2 text-slate-700 dark:text-slate-300">
                  {cardModal.page} / {modalTotalPages}
                </span>
                <button
                  type="button"
                  disabled={cardModal.page === modalTotalPages}
                  onClick={() => setCardModal((prev) => ({ ...prev, page: prev.page + 1 }))}
                  className="p-1 rounded border border-slate-200 dark:border-slate-700 disabled:opacity-40 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
              <Button variant="ghost" onClick={closeCardModal}>
                Tutup
              </Button>
            </div>
          </DialogFooter>
        </Dialog>
      )}

      {/* Modal Detail Rincian Presensi Siswa saat Klik Data */}
      <OverlayWrapper isOpen={!!selectedDetailStudent} onOpenChange={() => setSelectedDetailStudent(null)}>
        <Backdrop isOpen={!!selectedDetailStudent} onOpenChange={() => setSelectedDetailStudent(null)}>
          <Dialog
            isOpen={!!selectedDetailStudent}
            onOpenChange={() => setSelectedDetailStudent(null)}
            showCloseButton={true}
            className="w-full max-w-lg rounded-2xl p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4"
          >
            {selectedDetailStudent && (
              <>
                <DialogHeader>
                  <DialogTitle className="text-lg font-bold text-[#0E5C44] dark:text-[#3FBF75] flex items-center gap-3">
                    <div className="size-10 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 text-[#0E5C44] dark:text-[#3FBF75] flex items-center justify-center font-extrabold text-sm shrink-0">
                      {(selectedDetailStudent.student?.nama_lengkap || selectedDetailStudent.student?.full_name || 'S')[0]}
                    </div>
                    <div>
                      <h3 className="text-lg font-extrabold leading-tight text-slate-900 dark:text-white">
                        {selectedDetailStudent.student?.nama_lengkap || selectedDetailStudent.student?.full_name}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 font-medium font-mono">
                        NIS: {selectedDetailStudent.student?.nis || selectedDetailStudent.student?.nisn || '-'}
                      </p>
                    </div>
                  </DialogTitle>
                </DialogHeader>

                <DialogBody className="space-y-4 py-2">
                  <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl border border-slate-200/80 dark:border-slate-800">
                    <div>
                      <span className="text-slate-400 block text-[10px] font-semibold">Unit Pendidikan</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200">
                        {selectedDetailStudent.education_unit?.name || '-'}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px] font-semibold">Kelas</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200">
                        {selectedDetailStudent.school_class?.name || selectedDetailStudent.school_class?.nama_kelas || '-'}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px] font-semibold">Metode Presensi</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200">
                        {selectedDetailStudent.attendance_method || 'RFID/Scan'}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px] font-semibold">Status Presensi</span>
                      <span className="font-bold text-emerald-600 dark:text-emerald-400">
                        {selectedDetailStudent.status || 'HADIR'}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/60 dark:border-emerald-800/60">
                      <span className="block text-[10px] font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">
                        Jam Scan Masuk
                      </span>
                      <span className="text-xl font-black text-emerald-900 dark:text-emerald-200">
                        {selectedDetailStudent.check_in_time || '-'}
                      </span>
                    </div>

                    <div className="p-3.5 rounded-xl bg-sky-50 dark:bg-sky-950/40 border border-sky-200/60 dark:border-sky-800/60">
                      <span className="block text-[10px] font-bold text-sky-700 dark:text-sky-400 uppercase tracking-wider">
                        Jam Scan Pulang
                      </span>
                      <span className="text-xl font-black text-sky-900 dark:text-sky-200">
                        {selectedDetailStudent.check_out_time || '-'}
                      </span>
                    </div>
                  </div>
                </DialogBody>

                <DialogFooter className="pt-2 flex justify-end gap-2">
                  <Button
                    variant="ghost"
                    appearance="outline"
                    size="sm"
                    onClick={() => setSelectedDetailStudent(null)}
                  >
                    Tutup
                  </Button>
                  <Button
                    variant="primary"
                    appearance="fill"
                    size="sm"
                    onClick={() => {
                      setSelectedDetailStudent(null)
                      setIsPrintModalOpen(true)
                    }}
                  >
                    <Printer className="size-4 mr-1.5" /> Cetak Data Gerbang
                  </Button>
                </DialogFooter>
              </>
            )}
          </Dialog>
        </Backdrop>
      </OverlayWrapper>

      {/* Modal Opsi Cetak & Unduh PDF */}
      <PrintOptionModal
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
        onPrint={handlePrintClean}
        onDownload={handleDownloadPDF}
        title="Rekap Absensi Gerbang"
      />
    </PageContainer>
  )
}
