import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  ArrowUpDown,
  Calendar,
  CalendarDays,
  ChartPie as ChartPieIcon,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ClipboardCheck,
  Clock,
  Eye,
  Filter,
  Printer,
  RefreshCcw,
  Search,
  TrendingUp,
  User,
  UserCheck,
  Users,
  UserX,
  Sparkles,
  X,
} from 'lucide-react'
import { motion } from 'framer-motion'
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
import AppErrorState from '../components/app/AppErrorState'
import {
  SquircleActionButton,
  PrintOptionModal,
} from '../components/master-data'
import { Pagination } from '@/components/tailgrids/core/pagination'
import { TableBody, TableCell, TableHead, TableHeader, TableRoot, TableRow } from '@/components/tailgrids/core/table'
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/tailgrids/core/hover-card'
import { Dialog, DialogBody, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/tailgrids/core/dialog'
import { Backdrop, OverlayWrapper } from '@/components/tailgrids/core/overlay'
import { printCleanTable, downloadPdfTable } from '../utils/printHelper'

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

// ── MODERN CARD TONES (§C Tailgrids_Pengaturan_Halaman — baku global) ──
const toneStyles = {
  emerald: {
    card: 'border-emerald-300/70 bg-gradient-to-br from-emerald-50 via-teal-50/60 to-white hover:border-emerald-400 dark:border-emerald-700/50 dark:from-emerald-950/40 dark:via-teal-950/20 dark:to-slate-900',
    iconBg: 'bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-sm shadow-emerald-500/30',
    badge: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/60 dark:text-emerald-300',
    title: 'text-emerald-700 dark:text-emerald-400',
    val: 'text-emerald-700 dark:text-emerald-300',
    sub: 'text-emerald-600/80 dark:text-emerald-400/80',
    cta: 'text-emerald-600/60 dark:text-emerald-500/60',
    glow: 'bg-emerald-400/20 group-hover:bg-emerald-400/30',
  },
  violet: {
    card: 'border-purple-300/70 bg-gradient-to-br from-purple-50 via-indigo-50/60 to-white hover:border-purple-400 dark:border-purple-700/50 dark:from-purple-950/40 dark:via-indigo-950/20 dark:to-slate-900',
    iconBg: 'bg-gradient-to-br from-purple-500 to-indigo-600 text-white shadow-sm shadow-purple-500/30',
    badge: 'bg-purple-100 text-purple-700 dark:bg-purple-900/60 dark:text-purple-300',
    title: 'text-purple-700 dark:text-purple-400',
    val: 'text-purple-700 dark:text-purple-300',
    sub: 'text-purple-600/80 dark:text-purple-400/80',
    cta: 'text-purple-600/60 dark:text-purple-500/60',
    glow: 'bg-purple-400/20 group-hover:bg-purple-400/30',
  },
  sky: {
    card: 'border-blue-300/70 bg-gradient-to-br from-blue-50 via-cyan-50/60 to-white hover:border-blue-400 dark:border-blue-700/50 dark:from-blue-950/40 dark:via-cyan-950/20 dark:to-slate-900',
    iconBg: 'bg-gradient-to-br from-blue-500 to-cyan-600 text-white shadow-sm shadow-blue-500/30',
    badge: 'bg-blue-100 text-blue-700 dark:bg-blue-900/60 dark:text-blue-300',
    title: 'text-blue-700 dark:text-blue-400',
    val: 'text-blue-700 dark:text-blue-300',
    sub: 'text-blue-600/80 dark:text-blue-400/80',
    cta: 'text-blue-600/60 dark:text-blue-500/60',
    glow: 'bg-blue-400/20 group-hover:bg-blue-400/30',
  },
  amber: {
    card: 'border-amber-300/70 bg-gradient-to-br from-amber-50 via-orange-50/60 to-white hover:border-amber-400 dark:border-amber-700/50 dark:from-amber-950/40 dark:via-orange-950/20 dark:to-slate-900',
    iconBg: 'bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-sm shadow-amber-500/30',
    badge: 'bg-amber-100 text-amber-700 dark:bg-amber-900/60 dark:text-amber-300',
    title: 'text-amber-700 dark:text-amber-400',
    val: 'text-amber-700 dark:text-amber-300',
    sub: 'text-amber-600/80 dark:text-amber-400/80',
    cta: 'text-amber-600/60 dark:text-amber-500/60',
    glow: 'bg-amber-400/20 group-hover:bg-amber-400/30',
  },
  rose: {
    card: 'border-rose-300/70 bg-gradient-to-br from-rose-50 via-pink-50/60 to-white hover:border-rose-400 dark:border-rose-700/50 dark:from-rose-950/40 dark:via-pink-950/20 dark:to-slate-900',
    iconBg: 'bg-gradient-to-br from-rose-500 to-pink-600 text-white shadow-sm shadow-rose-500/30',
    badge: 'bg-rose-100 text-rose-700 dark:bg-rose-900/60 dark:text-rose-300',
    title: 'text-rose-700 dark:text-rose-400',
    val: 'text-rose-700 dark:text-rose-300',
    sub: 'text-rose-600/80 dark:text-rose-400/80',
    cta: 'text-rose-600/60 dark:text-rose-500/60',
    glow: 'bg-rose-400/20 group-hover:bg-rose-400/30',
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

  // Stagger Animasi Halaman (§R)
  const itemVariants = {
    hidden: { opacity: 0, y: 12 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' } },
  }

  return (
    <PageContainer className="space-y-6 pb-12">
      {/* Navigation Breadcrumb */}
      <motion.div variants={itemVariants} initial="hidden" animate="visible" className="mb-2 print:hidden">
        <AppBreadcrumb items={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Rekap Absensi Gerbang' }]} />
      </motion.div>

      {/* MODERN HERO CARD HEADER (§B / §7.7 Vivid Emerald Responsive Hero) */}
      <motion.div variants={itemVariants} initial="hidden" animate="visible">
        <div className="relative overflow-hidden rounded-[22px] border-2 border-emerald-500/30 bg-gradient-to-r from-emerald-500/15 via-teal-500/10 to-emerald-600/15 p-4 sm:p-6 shadow-md shadow-emerald-500/10 dark:border-emerald-600/40 dark:bg-gradient-to-r dark:from-emerald-950/70 dark:via-teal-950/50 dark:to-slate-900 print:hidden">
          <div className="pointer-events-none absolute -top-20 -right-20 h-56 w-56 rounded-full bg-gradient-to-br from-emerald-500/40 via-teal-400/30 to-emerald-600/20 blur-3xl dark:from-emerald-500/50 dark:via-teal-400/40" />
          <div className="pointer-events-none absolute -bottom-20 -left-20 h-56 w-56 rounded-full bg-gradient-to-tr from-emerald-600/30 via-teal-500/20 to-transparent blur-3xl dark:from-emerald-600/40 dark:via-teal-500/30" />

          <div className="relative z-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3.5 sm:gap-4 min-w-0">
              <div className="flex size-11 sm:size-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700 text-white shadow-xl shadow-emerald-600/40 border border-emerald-300/40 dark:from-emerald-400 dark:via-emerald-500 dark:to-teal-600">
                <Clock className="size-5 sm:size-7 text-white" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 sm:gap-2.5 flex-wrap">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-emerald-600 to-teal-600 px-3 py-0.5 sm:px-3.5 sm:py-1 text-[11px] sm:text-xs font-extrabold text-white shadow-md shadow-emerald-600/25 border border-emerald-300/40">
                    <Sparkles className="size-3 sm:size-3.5 text-amber-300 animate-pulse" />
                    Rekap Presensi Gerbang
                  </span>
                  <span className="inline-flex items-center rounded-full bg-emerald-100 px-3 py-0.5 text-xs font-bold text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/60">
                    RFID & Barcode Scan
                  </span>
                </div>
                <h1 className="mt-1.5 text-lg sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                  Rekapitulasi Absensi Gerbang Sekolah
                </h1>
                <p className="mt-0.5 sm:mt-1 text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-300 max-w-2xl leading-relaxed">
                  Pemantauan hasil scan kartu RFID, QR-code, dan barcode saat siswa masuk dan keluar melalui gerbang sekolah.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0 self-start sm:self-center">
              <button
                type="button"
                onClick={load}
                disabled={loading}
                className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-300 dark:border-emerald-700 bg-white/80 dark:bg-emerald-950/60 hover:bg-emerald-50 dark:hover:bg-emerald-900/60 px-3.5 py-2 text-xs font-bold text-emerald-800 dark:text-emerald-200 shadow-xs transition-colors cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
              >
                <RefreshCcw className={`h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400 ${loading ? 'animate-spin' : ''}`} />
                <span>{loading ? 'Memuat...' : 'Segarkan Data'}</span>
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Summary Cards Grid (§C ModernKpiCard + §7.3 grid adaptif) */}
      <motion.div variants={itemVariants} initial="hidden" animate="visible" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
        {cards.map(({ label, statusKey, value, icon: Icon, tone, percent }) => {
          const style = toneStyles[tone] || toneStyles.emerald
          return (
            <motion.article
              key={label}
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
              onClick={() => openCardModal(statusKey, label, tone)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), openCardModal(statusKey, label, tone))}
              className={`group relative overflow-hidden rounded-[18px] border-2 p-5 shadow-xs transition-[border-color,box-shadow] duration-150 text-left cursor-pointer hover:shadow-md ${style.card}`}
              title={`Klik untuk melihat detail data ${label}`}
            >
              {/* Ambient Glow */}
              <div className={`pointer-events-none absolute -top-8 -right-8 h-28 w-28 rounded-full blur-2xl transition-all ${style.glow}`} />

              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2.5">
                  <div className={`flex h-9 w-9 items-center justify-center rounded-xl text-white shadow-sm ${style.iconBg}`}>
                    <Icon className="h-4.5 w-4.5" />
                  </div>
                  <div>
                    <p className={`text-[11px] font-bold uppercase tracking-wider ${style.title}`}>{label}</p>
                  </div>
                </div>
                <span className={`rounded-lg px-2 py-0.5 text-[10px] font-extrabold ${style.badge}`}>
                  {percent.toFixed(1)}%
                </span>
              </div>
              <p className={`text-4xl font-black tabular-nums ${style.val}`}>
                {formatAngka(value)}
              </p>
              <p className={`mt-3 text-[10px] font-bold flex items-center gap-1 ${style.cta}`}>
                <Eye className="h-3 w-3" /> Klik untuk detail lengkap
              </p>
            </motion.article>
          )
        })}
      </motion.div>

      {/* 3-Column Equal Grid: Filter Laporan, Grafik Kehadiran, & Distribusi */}
      <motion.div variants={itemVariants} initial="hidden" animate="visible" className="grid grid-cols-1 md:grid-cols-3 gap-5 items-stretch">
        {/* Col 1: Filter Laporan */}
        <article className="relative overflow-hidden rounded-[22px] border-2 border-emerald-300 bg-white p-5 sm:p-6 shadow-md shadow-emerald-500/10 dark:border-emerald-700/80 dark:bg-[#1B2433] space-y-4 flex flex-col justify-between h-full">
          <div>
            <div className="flex items-center justify-between gap-2 mb-4 pb-3.5 border-b border-emerald-200/90 dark:border-emerald-800/60">
              <div className="flex items-center gap-3">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700 text-white shadow-sm border border-emerald-300/40">
                  <Filter className="size-5" />
                </div>
                <div>
                  <h2 className="text-sm sm:text-base font-black text-slate-900 dark:text-white">Filter Laporan Gerbang</h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Periode, status & pencarian siswa</p>
                </div>
              </div>
              <button
                type="button"
                onClick={resetFilters}
                className="inline-flex items-center gap-1.5 h-9 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all shrink-0 cursor-pointer"
              >
                <RefreshCcw className="h-3.5 w-3.5" />
                <span>Reset</span>
              </button>
            </div>

            <div className="space-y-4">
              {/* Fitur Filter Periode Waktu (Hari, Minggu, Bulan, Semester, Tahun) */}
              <div>
                <label htmlFor="gerbang-period" className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5">
                  Periode Waktu
                </label>
                <div className="relative flex items-center">
                  <div className="pointer-events-none absolute left-3.5 flex items-center text-slate-400 dark:text-slate-500">
                    <Calendar className="size-4" />
                  </div>
                  <select
                    id="gerbang-period"
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
                    className="w-full rounded-xl border border-slate-200/90 bg-slate-50/50 pl-10 pr-8 py-2.5 text-xs font-semibold text-slate-800 transition-all duration-200 hover:border-slate-300 focus:border-[#0E5C44] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#0E5C44]/12 dark:border-slate-700/80 dark:bg-slate-900/50 dark:text-slate-100 dark:hover:border-slate-600 dark:focus:border-[#3FBF75] dark:focus:bg-slate-900 dark:focus:ring-[#3FBF75]/20 cursor-pointer"
                  >
                    <option value="semua">Semua Periode Data</option>
                    <option value="hari">Hari Ini (Per Hari)</option>
                    <option value="minggu">7 Hari Terakhir (Per Minggu)</option>
                    <option value="bulan">Bulan Ini (Per Bulan)</option>
                    <option value="semester">6 Bulan Terakhir (Per Semester)</option>
                    <option value="tahun">Tahun Ini (Per Tahun)</option>
                    <option value="custom">Rentang Tanggal Kustom</option>
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-2.5 h-3.5 w-3.5 text-slate-400" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label htmlFor="gerbang-from" className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5">Tanggal Mulai</label>
                  <div className="relative flex items-center">
                    <div className="pointer-events-none absolute left-3.5 flex items-center text-slate-400 dark:text-slate-500">
                      <CalendarDays className="size-4" />
                    </div>
                    <input
                      id="gerbang-from"
                      type="date"
                      value={dateFrom}
                      onChange={(e) => {
                        setDateFrom(e.target.value)
                        setPeriod('custom')
                        setCurrentPage(1)
                      }}
                      className="w-full rounded-xl border border-slate-200/90 bg-slate-50/50 pl-10 pr-3 py-2.5 text-xs font-semibold text-slate-800 transition-all duration-200 hover:border-slate-300 focus:border-[#0E5C44] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#0E5C44]/12 dark:border-slate-700/80 dark:bg-slate-900/50 dark:text-slate-100 dark:hover:border-slate-600 dark:focus:border-[#3FBF75] dark:focus:bg-slate-900 dark:focus:ring-[#3FBF75]/20"
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="gerbang-to" className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5">Tanggal Selesai</label>
                  <div className="relative flex items-center">
                    <div className="pointer-events-none absolute left-3.5 flex items-center text-slate-400 dark:text-slate-500">
                      <CalendarDays className="size-4" />
                    </div>
                    <input
                      id="gerbang-to"
                      type="date"
                      value={dateTo}
                      onChange={(e) => {
                        setDateTo(e.target.value)
                        setPeriod('custom')
                        setCurrentPage(1)
                      }}
                      className="w-full rounded-xl border border-slate-200/90 bg-slate-50/50 pl-10 pr-3 py-2.5 text-xs font-semibold text-slate-800 transition-all duration-200 hover:border-slate-300 focus:border-[#0E5C44] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#0E5C44]/12 dark:border-slate-700/80 dark:bg-slate-900/50 dark:text-slate-100 dark:hover:border-slate-600 dark:focus:border-[#3FBF75] dark:focus:bg-slate-900 dark:focus:ring-[#3FBF75]/20"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label htmlFor="gerbang-status" className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5">
                  Status Presensi Gerbang
                </label>
                <div className="relative flex items-center">
                  <div className="pointer-events-none absolute left-3.5 flex items-center text-slate-400 dark:text-slate-500">
                    <ClipboardCheck className="size-4" />
                  </div>
                  <select
                    id="gerbang-status"
                    value={status}
                    onChange={(e) => {
                      setStatus(e.target.value)
                      setCurrentPage(1)
                    }}
                    className="w-full rounded-xl border border-slate-200/90 bg-slate-50/50 pl-10 pr-8 py-2.5 text-xs font-semibold text-slate-800 transition-all duration-200 hover:border-slate-300 focus:border-[#0E5C44] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#0E5C44]/12 dark:border-slate-700/80 dark:bg-slate-900/50 dark:text-slate-100 dark:hover:border-slate-600 dark:focus:border-[#3FBF75] dark:focus:bg-slate-900 dark:focus:ring-[#3FBF75]/20 cursor-pointer"
                  >
                    <option value="">Semua Status</option>
                    <option value="HADIR">Hadir / Tepat Waktu</option>
                    <option value="TERLAMBAT">Terlambat</option>
                    <option value="IZIN">Izin</option>
                    <option value="SAKIT">Sakit</option>
                    <option value="ALPHA">Alpha / Belum Scan</option>
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-2.5 h-3.5 w-3.5 text-slate-400" />
                </div>
              </div>

              <div>
                <label htmlFor="gerbang-search" className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5">
                  Pencarian Siswa
                </label>
                <div className="relative flex items-center">
                  <div className="pointer-events-none absolute left-3.5 flex items-center text-slate-400 dark:text-slate-500">
                    <Search className="size-4" />
                  </div>
                  <input
                    id="gerbang-search"
                    type="text"
                    placeholder="Nama, NIS, atau NISN..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full rounded-xl border border-slate-200/90 bg-slate-50/50 pl-10 pr-4 py-2.5 text-xs font-semibold text-slate-800 placeholder:text-slate-400/80 transition-all duration-200 hover:border-slate-300 focus:border-[#0E5C44] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#0E5C44]/12 dark:border-slate-700/80 dark:bg-slate-900/50 dark:text-slate-100 dark:hover:border-slate-600 dark:focus:border-[#3FBF75] dark:focus:bg-slate-900 dark:focus:ring-[#3FBF75]/20"
                  />
                </div>
              </div>
            </div>
          </div>
        </article>

        {/* Col 2: Grafik Trend Masuk Gerbang */}
        <article className="relative overflow-hidden rounded-[22px] border-2 border-emerald-300 bg-white p-5 sm:p-6 shadow-md shadow-emerald-500/10 dark:border-emerald-700/80 dark:bg-[#1B2433] flex flex-col justify-between h-full">
          <div>
            <div className="flex items-center justify-between mb-4 pb-3.5 border-b border-emerald-200/90 dark:border-emerald-800/60">
              <div className="flex items-center gap-3">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700 text-white shadow-sm border border-emerald-300/40">
                  <TrendingUp className="size-5" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-black text-slate-900 dark:text-white">Waktu Masuk Gerbang</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Tren ketepatan per jam</p>
                </div>
              </div>
              <AppBadge variant="success" size="sm">Jam Masuk</AppBadge>
            </div>
            <div className="h-64 w-full pt-2 text-slate-200 dark:text-slate-800">
              {loading ? (
                <AppSkeleton variant="card" className="h-full" />
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                    <defs>
                      <linearGradient id="hadirGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#12a968" stopOpacity={0.3} />
                        <stop offset="100%" stopColor="#12a968" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid stroke="currentColor" strokeDasharray="3 3" vertical={false} opacity={0.6} />
                    <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fill: 'currentColor', fontSize: 10 }} className="text-slate-400 dark:text-slate-500" />
                    <YAxis allowDecimals={false} tickLine={false} axisLine={false} tick={{ fill: 'currentColor', fontSize: 10 }} className="text-slate-400 dark:text-slate-500" />
                    <Tooltip
                      content={({ active, payload, label }) => {
                        if (!active || !payload?.length) return null
                        return (
                          <div className="rounded-xl border border-slate-800 bg-slate-900/95 p-3 text-white shadow-xl backdrop-blur-sm">
                            <p className="text-xs font-bold text-emerald-400 mb-1">Jam {label}</p>
                            {payload.map((p) => (
                              <p key={p.dataKey} className="text-xs font-extrabold">{p.name}: {p.value} siswa</p>
                            ))}
                          </div>
                        )
                      }}
                    />
                    <Area type="monotone" dataKey="tepat" name="Tepat Waktu" stroke={warnaStatus.hadir} fill="url(#hadirGradient)" strokeWidth={2} />
                    <Area type="monotone" dataKey="terlambat" name="Terlambat" stroke={warnaStatus.terlambat} fill="transparent" strokeWidth={1.5} />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
          <div className="pt-3 border-t border-emerald-200/80 dark:border-emerald-800/60 flex items-center justify-between text-[11px] font-semibold text-slate-500">
            <span>Distribusi ketepatan per jam masuk</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-bold">Terupdate Otomatis</span>
          </div>
        </article>

        {/* Col 3: Distribusi Status Gerbang */}
        <article className="relative overflow-hidden rounded-[22px] border-2 border-emerald-300 bg-white p-5 sm:p-6 shadow-md shadow-emerald-500/10 dark:border-emerald-700/80 dark:bg-[#1B2433] flex flex-col justify-between h-full">
          <div>
            <div className="flex items-center justify-between mb-4 pb-3.5 border-b border-emerald-200/90 dark:border-emerald-800/60">
              <div className="flex items-center gap-3">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-400 via-sky-500 to-blue-600 text-white shadow-sm border border-sky-300/40">
                  <ChartPieIcon className="size-5" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-black text-slate-900 dark:text-white">Distribusi Absensi Gerbang</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Proporsi status scan siswa</p>
                </div>
              </div>
              <AppBadge variant="success" size="sm">{formatAngka(metrics.baseTotal)} Total</AppBadge>
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
                <div key={item.name} className="flex items-center gap-1.5 p-1.5 rounded-lg border border-emerald-100 bg-slate-50/70 dark:border-emerald-900/40 dark:bg-slate-900/40">
                  <span className="size-2.5 rounded-full shrink-0" style={{ background: item.color }} />
                  <div className="flex items-center justify-between w-full min-w-0">
                    <span className="text-[11px] font-medium text-slate-600 dark:text-slate-400 truncate">{item.name}</span>
                    <span className="text-[11px] font-bold text-slate-900 dark:text-white ml-1 tabular-nums">{formatAngka(item.value)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          </div>
          <div className="pt-3 border-t border-emerald-200/80 dark:border-emerald-800/60 flex items-center justify-between text-[11px] font-semibold text-slate-500">
            <span>Proporsi status scan gerbang</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-bold">{formatAngka(metrics.totalScanned)} Sudah Scan</span>
          </div>
        </article>
      </motion.div>

      {/* Main Datatable Outer Container */}
      <motion.div variants={itemVariants} initial="hidden" animate="visible" className="relative overflow-hidden rounded-[22px] border-2 border-emerald-300 bg-white shadow-md shadow-emerald-500/10 dark:border-emerald-700/80 dark:bg-[#1B2433]">
        {/* Header Baris 1: Title & Action Buttons */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between px-4 py-3.5 sm:px-6 md:px-8 bg-gradient-to-r from-emerald-500/10 via-teal-500/5 to-transparent border-b border-emerald-200/90 dark:border-emerald-800/60">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700 text-white shrink-0 shadow-sm border border-emerald-300/40">
              <Users className="size-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-sm sm:text-base font-black text-slate-900 dark:text-white">Hasil Scan & Rekap Absensi Gerbang</h2>
                <span className="inline-flex items-center rounded-full bg-emerald-100 px-2.5 py-0.5 text-[11px] font-extrabold text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300">
                  {formatAngka(sortedRows.length)} Data
                </span>
              </div>
              <p className="text-xs font-medium text-slate-600 dark:text-slate-300 mt-0.5">
                Rekapan baca-saja dari seluruh hasil scan masuk dan pulang siswa berbasis RFID / QR / Barcode.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0 self-start sm:self-auto flex-wrap">
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
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between px-4 py-3 sm:px-6 md:px-8 border-b border-emerald-200/80 dark:border-emerald-800/60 bg-gradient-to-r from-emerald-50/50 via-teal-50/30 to-emerald-50/50 dark:from-emerald-950/20 dark:via-teal-950/10 dark:to-emerald-950/20">
          <div className="relative w-full sm:max-w-sm">
            <Search className="pointer-events-none absolute left-3.5 sm:left-4 top-1/2 -translate-y-1/2 size-4 text-emerald-600/70 dark:text-emerald-400" />
            <input
              type="text"
              placeholder="Cari nama siswa, NIS, NISN, atau kelas..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                setCurrentPage(1)
              }}
              className="h-10 sm:h-11 w-full rounded-2xl border border-emerald-200/90 bg-white pl-10 sm:pl-11 pr-10 text-xs font-semibold text-slate-800 outline-none transition-all placeholder:text-slate-400 focus:border-[#0E5C44] focus:ring-4 focus:ring-[#0E5C44]/12 dark:border-emerald-800/70 dark:bg-slate-900 dark:text-slate-100"
            />
            {search && (
              <button
                type="button"
                onClick={() => {
                  setSearch('')
                  setCurrentPage(1)
                }}
                aria-label="Bersihkan pencarian"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                <X className="size-3.5" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            <span className="text-xs font-medium text-slate-500">Per Halaman:</span>
            <div className="relative">
              <select
                value={perPage}
                onChange={(e) => {
                  setPerPage(Number(e.target.value))
                  setCurrentPage(1)
                }}
                aria-label="Baris per halaman"
                className="h-9 cursor-pointer appearance-none rounded-xl border border-emerald-200/80 bg-white pl-2.5 pr-8 text-xs font-bold text-slate-700 focus:border-[#0E5C44] focus:outline-none focus:ring-2 focus:ring-[#0E5C44]/20 dark:border-emerald-800/70 dark:bg-slate-900 dark:text-slate-200"
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
          {error && !loading && (
            <div className="py-4">
              <AppErrorState title="Rekap absensi gerbang gagal dimuat" description={error} onRetry={load} compact />
            </div>
          )}
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
              <TableHeader className="bg-gradient-to-r from-emerald-100/90 via-teal-50/70 to-emerald-100/90 border-b-2 border-emerald-200/90 dark:from-emerald-950/90 dark:via-teal-950/70 dark:to-emerald-950/90">
                <TableRow className="border-none">
                  <TableHead className="w-12 text-center font-black text-[11px] uppercase tracking-wider text-emerald-950 dark:text-emerald-200">#</TableHead>

                  <TableHead
                    className="cursor-pointer select-none hover:text-emerald-800 dark:hover:text-emerald-300 font-black text-[11px] uppercase tracking-wider text-emerald-950 dark:text-emerald-200 transition-colors"
                    onClick={() => handleSort('student')}
                  >
                    <div className="flex items-center gap-1.5">
                      <span>Siswa</span>
                      <ArrowUpDown className="size-3.5 text-emerald-700 dark:text-emerald-400" />
                    </div>
                  </TableHead>

                  <TableHead className="hidden lg:table-cell text-center font-black text-[11px] uppercase tracking-wider text-emerald-950 dark:text-emerald-200">NIS / NISN</TableHead>
                  <TableHead className="hidden lg:table-cell text-center font-black text-[11px] uppercase tracking-wider text-emerald-950 dark:text-emerald-200">Unit Pendidikan</TableHead>
                  <TableHead className="hidden sm:table-cell text-center font-black text-[11px] uppercase tracking-wider text-emerald-950 dark:text-emerald-200">Kelas</TableHead>
                  <TableHead className="text-center font-black text-[11px] uppercase tracking-wider text-emerald-950 dark:text-emerald-200">Jam Masuk</TableHead>
                  <TableHead className="hidden md:table-cell text-center font-black text-[11px] uppercase tracking-wider text-emerald-950 dark:text-emerald-200">Jam Pulang</TableHead>
                  <TableHead className="hidden lg:table-cell text-center font-black text-[11px] uppercase tracking-wider text-emerald-950 dark:text-emerald-200">Metode</TableHead>
                  <TableHead className="text-right font-black text-[11px] uppercase tracking-wider text-emerald-950 dark:text-emerald-200">Status</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody className="divide-y divide-emerald-100/80 dark:divide-emerald-900/40">
                {paginatedRows.map((row, index) => {
                  const studentName = row.student?.nama_lengkap || row.student?.full_name || 'Siswa'
                  const studentNis = row.student?.nis || row.student?.nisn || '-'
                  const unitName = row.education_unit?.name || '-'
                  const kelasName = row.school_class?.name || row.school_class?.nama_kelas || '-'
                  const st = String(row.status || '').toUpperCase()
                  const statusVariant = st === 'HADIR' || st === 'TEPAT_WAKTU' ? 'success' : st === 'TERLAMBAT' ? 'warning' : st === 'PULANG' ? 'info' : 'danger'

                  return (
                    <TableRow key={row.id || index} className="hover:bg-emerald-50/40 dark:hover:bg-emerald-950/20 transition-colors">
                      <TableCell className="text-center font-bold text-slate-400 text-xs tabular-nums">
                        {(currentPage - 1) * perPage + index + 1}
                      </TableCell>

                      {/* Cell Identitas Siswa dengan HoverCard */}
                      <TableCell className="align-top sm:align-middle">
                        <HoverCard>
                          <HoverCardTrigger
                            onClick={(e) => {
                              e.preventDefault()
                              setSelectedDetailStudent(row)
                            }}
                            className="font-extrabold text-slate-900 dark:text-white text-sm border-b border-dashed border-slate-400/60 hover:border-[#0E5C44] transition-colors cursor-pointer inline-block max-w-full truncate"
                            title={studentName}
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
                                className="inline-flex items-center justify-center gap-2 w-full py-2.5 px-5 bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700 text-white text-xs font-extrabold rounded-2xl border border-emerald-300/40 transition-all duration-200 hover:scale-[1.03] active:scale-95 cursor-pointer"
                              >
                                Lihat Rincian Data
                              </button>
                            </div>
                          </HoverCardContent>
                        </HoverCard>
                        {/* Mobile Compact Metadata Row (§7.5) */}
                        <div className="sm:hidden mt-2 flex flex-wrap items-center gap-1.5 pt-1.5 border-t border-emerald-100/80 dark:border-emerald-900/40">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300">
                            {kelasName}
                          </span>
                          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-medium bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 tabular-nums">
                            {row.check_in_time || '-'}
                          </span>
                          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-500/10 text-emerald-600">
                            {row.status || 'HADIR'}
                          </span>
                        </div>
                      </TableCell>

                      <TableCell className="hidden lg:table-cell text-center font-mono font-semibold text-slate-600 dark:text-slate-400 text-xs">
                        {studentNis}
                      </TableCell>

                      <TableCell className="hidden lg:table-cell text-center font-medium text-slate-700 dark:text-slate-300 text-xs">
                        {unitName}
                      </TableCell>

                      <TableCell className="hidden sm:table-cell text-center font-semibold text-slate-800 dark:text-slate-200 text-xs">
                        {kelasName}
                      </TableCell>

                      <TableCell className="text-center font-extrabold text-emerald-700 dark:text-emerald-400 tabular-nums text-xs">
                        {row.check_in_time || '-'}
                      </TableCell>

                      <TableCell className="hidden md:table-cell text-center font-extrabold text-sky-700 dark:text-sky-400 tabular-nums text-xs">
                        {row.check_out_time || '-'}
                      </TableCell>

                      <TableCell className="hidden lg:table-cell text-center text-xs font-semibold text-slate-500">
                        {row.attendance_method || 'RFID'}
                      </TableCell>

                      <TableCell className="text-right align-middle">
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

        {/* Footer Pagination Navigation (§7.6) */}
        <div className="border-t border-emerald-200/80 bg-gradient-to-r from-emerald-50/40 via-white to-emerald-50/40 p-3.5 sm:px-6 md:px-8 py-3 sm:py-3.5 dark:border-emerald-800/60 dark:from-emerald-950/20 dark:via-transparent dark:to-emerald-950/20 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 text-center sm:text-left">
            Menampilkan <span className="font-semibold text-slate-700 dark:text-slate-200">{sortedRows.length ? (currentPage - 1) * perPage + 1 : 0}</span> -{' '}
            <span className="font-semibold text-slate-700 dark:text-slate-200">{Math.min(currentPage * perPage, sortedRows.length)}</span> dari{' '}
            <span className="font-semibold text-slate-700 dark:text-slate-200">{formatAngka(sortedRows.length)}</span> data
          </div>
          <div className="flex items-center justify-center gap-2">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={(page) => setCurrentPage(page)}
              sideLayout="icon"
            />
          </div>
        </div>
      </motion.div>

      {/* Summary Card Interactive Datatable Modal */}
      {cardModal.isOpen && (
        <Backdrop isOpen={cardModal.isOpen} onOpenChange={closeCardModal} className="z-[70] bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-3 sm:p-5">
          <Dialog
            isOpen={cardModal.isOpen}
            onOpenChange={(open) => !open && closeCardModal()}
            showCloseButton={false}
            className="w-full max-w-3xl max-h-[90vh] flex flex-col rounded-3xl bg-white dark:bg-[#1B2433] border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden p-0"
          >
            <div className="h-1.5 bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-600 shrink-0" />
            <DialogHeader className="p-5 flex flex-row items-center justify-between border-b border-slate-200 dark:border-slate-800 shrink-0">
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700 text-white shadow-md shadow-emerald-500/20 border border-emerald-300/30 shrink-0">
                  <Sparkles className="size-5 text-white" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <DialogTitle className="text-sm sm:text-base font-black text-slate-900 dark:text-white">
                      {cardModal.title}
                    </DialogTitle>
                    <AppBadge variant={cardModal.tone === 'rose' ? 'danger' : cardModal.tone === 'amber' ? 'warning' : cardModal.tone === 'sky' || cardModal.tone === 'violet' ? 'info' : 'success'}>
                      {modalRows.length} Data Scan
                    </AppBadge>
                  </div>
                  <DialogDescription className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Daftar rincian log scan gerbang siswa dengan status {cardModal.title} pada periode {dateFrom || date} s/d {dateTo || date}
                  </DialogDescription>
                </div>
              </div>
              <button
                type="button"
                onClick={closeCardModal}
                aria-label="Tutup modal"
                className="size-9 flex items-center justify-center rounded-2xl bg-gradient-to-br from-rose-500 via-rose-600 to-red-700 text-white hover:scale-105 active:scale-95 transition-all duration-200 shadow-md shadow-rose-500/20 cursor-pointer shrink-0"
              >
                <X className="size-4 text-white" strokeWidth={2.25} />
              </button>
            </DialogHeader>

          <DialogBody className="flex-1 overflow-y-auto py-4 space-y-4">
            {/* Modal Search Toolbar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-gradient-to-r from-emerald-50/50 via-teal-50/30 to-emerald-50/50 dark:from-emerald-950/20 dark:via-teal-950/10 dark:to-emerald-950/20 border border-emerald-200/80 dark:border-emerald-800/60 p-3 rounded-2xl">
              <div className="relative w-full sm:w-80">
                <Search className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-emerald-600/70 dark:text-emerald-400" />
                <input
                  type="text"
                  placeholder="Cari nama siswa, NIS, atau kelas..."
                  value={cardModal.searchQuery}
                  onChange={(e) => setCardModal((prev) => ({ ...prev, searchQuery: e.target.value, page: 1 }))}
                  className="w-full rounded-2xl border border-emerald-200/90 bg-white pl-10 pr-8 py-2 text-xs font-semibold text-slate-800 outline-none transition-all placeholder:text-slate-400 focus:border-[#0E5C44] focus:ring-4 focus:ring-[#0E5C44]/12 dark:border-emerald-800/70 dark:bg-slate-900 dark:text-slate-100"
                />
                {cardModal.searchQuery && (
                  <button
                    type="button"
                    onClick={() => setCardModal((prev) => ({ ...prev, searchQuery: '', page: 1 }))}
                    aria-label="Bersihkan pencarian"
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Modal Datatable */}
            <div className="overflow-x-auto rounded-xl border border-emerald-200/80 dark:border-emerald-800/60">
              <table className="w-full text-left text-xs">
                <thead className="bg-gradient-to-r from-emerald-100/80 via-teal-50/60 to-emerald-100/80 border-b border-emerald-200/80 dark:from-emerald-950/80 dark:via-teal-950/60 dark:to-emerald-950/80 dark:border-emerald-900/50 text-emerald-800 dark:text-emerald-300 font-extrabold uppercase">
                  <tr>
                    <th className="py-2.5 px-4 text-[11px]">No</th>
                    <th className="py-2.5 px-4 text-[11px]">Siswa</th>
                    <th className="py-2.5 px-4 text-[11px]">NIS/NISN</th>
                    <th className="py-2.5 px-4 text-[11px]">Kelas</th>
                    <th className="py-2.5 px-4 text-[11px]">Jam Masuk</th>
                    <th className="py-2.5 px-4 text-[11px]">Jam Pulang</th>
                    <th className="py-2.5 px-4 text-[11px]">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-emerald-100/80 dark:divide-emerald-900/40">
                  {paginatedModalRows.length > 0 ? (
                    paginatedModalRows.map((row, idx) => {
                      const studentName = row.student?.nama_lengkap || row.student?.full_name || 'Siswa'
                      const studentNis = row.student?.nis || row.student?.nisn || '-'
                      const kelasName = row.school_class?.name || row.school_class?.nama_kelas || '-'
                      const st = String(row.status || '').toUpperCase()

                      return (
                        <tr key={row.id || idx} className="hover:bg-emerald-50/40 dark:hover:bg-emerald-950/20 transition-colors">
                          <td className="py-3 px-4 font-medium text-slate-500 tabular-nums">
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
                          <td className="py-3 px-4 text-emerald-700 dark:text-emerald-400 font-bold tabular-nums">
                            {row.check_in_time || '-'}
                          </td>
                          <td className="py-3 px-4 text-sky-700 dark:text-sky-400 font-bold tabular-nums">
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

          <DialogFooter className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
            <span className="text-xs text-slate-500 font-medium">
              Menampilkan {modalRows.length ? (cardModal.page - 1) * MODAL_PAGE_SIZE + 1 : 0}–{Math.min(cardModal.page * MODAL_PAGE_SIZE, modalRows.length)} dari {modalRows.length} data
            </span>
            <div className="flex items-center gap-2.5">
              <div className="flex items-center gap-1.5 mr-2">
                <button
                  type="button"
                  disabled={cardModal.page === 1}
                  onClick={() => setCardModal((prev) => ({ ...prev, page: prev.page - 1 }))}
                  aria-label="Halaman sebelumnya"
                  className="flex size-9 items-center justify-center rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-all duration-150 active:scale-95 disabled:bg-emerald-600/30 disabled:text-white/40 disabled:pointer-events-none dark:disabled:bg-emerald-950/40 dark:disabled:text-white/30 cursor-pointer"
                >
                  <ChevronLeft className="size-5 shrink-0" />
                </button>
                <span className="text-xs font-semibold px-2 text-slate-700 dark:text-slate-300 tabular-nums">
                  {cardModal.page} / {modalTotalPages}
                </span>
                <button
                  type="button"
                  disabled={cardModal.page === modalTotalPages}
                  onClick={() => setCardModal((prev) => ({ ...prev, page: prev.page + 1 }))}
                  aria-label="Halaman berikutnya"
                  className="flex size-9 items-center justify-center rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-all duration-150 active:scale-95 disabled:bg-emerald-600/30 disabled:text-white/40 disabled:pointer-events-none dark:disabled:bg-emerald-950/40 dark:disabled:text-white/30 cursor-pointer"
                >
                  <ChevronRight className="size-5 shrink-0" />
                </button>
              </div>
              <button
                type="button"
                onClick={closeCardModal}
                className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-br from-rose-500 via-rose-600 to-red-700 text-white px-4 py-2.5 text-xs font-extrabold border border-rose-300/40 transition-all duration-200 hover:scale-[1.03] active:scale-95 cursor-pointer"
              >
                <div className="flex size-5 items-center justify-center rounded-lg bg-white/20">
                  <X className="size-3.5 text-white" strokeWidth={2.2} />
                </div>
                <span>Tutup</span>
              </button>
            </div>
          </DialogFooter>
        </Dialog>
      </Backdrop>
      )}

      {/* Modal Detail Rincian Presensi Siswa saat Klik Data */}
      <OverlayWrapper isOpen={!!selectedDetailStudent} onOpenChange={() => setSelectedDetailStudent(null)}>
        <Backdrop isOpen={!!selectedDetailStudent} onOpenChange={() => setSelectedDetailStudent(null)} className="z-[70] bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-3 sm:p-5">
          <Dialog
            isOpen={!!selectedDetailStudent}
            onOpenChange={() => setSelectedDetailStudent(null)}
            showCloseButton={true}
            className="w-full max-w-lg rounded-3xl p-0 bg-white dark:bg-[#1B2433] border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden"
          >
            <div className="h-1.5 bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-600 shrink-0" />
            {selectedDetailStudent && (
              <div className="p-6 space-y-4">
                <DialogHeader className="p-0">
                  <DialogTitle className="flex items-center gap-3">
                    <div className="size-11 rounded-2xl bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700 text-white flex items-center justify-center font-extrabold text-sm shrink-0 shadow-md shadow-emerald-500/20 border border-emerald-300/30">
                      {(selectedDetailStudent.student?.nama_lengkap || selectedDetailStudent.student?.full_name || 'S')[0]}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-sm sm:text-base font-black leading-tight text-slate-900 dark:text-white truncate">
                          {selectedDetailStudent.student?.nama_lengkap || selectedDetailStudent.student?.full_name}
                        </h3>
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-800 border border-emerald-200/80 dark:bg-emerald-950/60 dark:text-emerald-400 dark:border-emerald-800/60">
                          <Sparkles className="size-3" />
                          Detail Presensi
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 font-medium font-mono mt-0.5">
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

                <DialogFooter className="pt-2 flex flex-wrap items-center justify-end gap-2.5">
                  <button
                    type="button"
                    onClick={() => setSelectedDetailStudent(null)}
                    className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-br from-rose-500 via-rose-600 to-red-700 text-white px-4 py-2.5 text-xs font-extrabold border border-rose-300/40 transition-all duration-200 hover:scale-[1.03] active:scale-95 cursor-pointer"
                  >
                    <div className="flex size-5 items-center justify-center rounded-lg bg-white/20 text-white">
                      <X className="size-3.5 text-white" strokeWidth={2.2} />
                    </div>
                    <span>Tutup</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedDetailStudent(null)
                      setIsPrintModalOpen(true)
                    }}
                    className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-br from-indigo-500 via-indigo-600 to-violet-700 text-white px-5 py-2.5 text-xs font-extrabold border border-indigo-300/40 transition-all duration-200 hover:scale-[1.03] active:scale-95 cursor-pointer"
                  >
                    <div className="flex size-5 items-center justify-center rounded-lg bg-white/20 text-white">
                      <Printer className="size-3.5 text-white" strokeWidth={2.2} />
                    </div>
                    <span>Cetak Data Gerbang</span>
                  </button>
                </DialogFooter>
              </div>
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
