import { useCallback, useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import {
  Building2,
  ChevronDown,
  Download,
  Eye,
  FileSpreadsheet,
  FileText,
  Filter,
  Printer,
  RefreshCw,
  Search,
  UserCheck,
  UserMinus,
  Users,
  UserX,
  X,
  Briefcase,
  GraduationCap,
  CheckCircle2,
  Sparkles,
} from 'lucide-react'
import {
  ArrowBothDirectionHorizontal2,
  Download1,
} from '@tailgrids/icons'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

import { exportCsv } from '../components/reports/ReportKit'
import { reportService } from '../services/reportService'
import PageContainer from '../components/app/PageContainer'
import AppBreadcrumb from '../components/app/AppBreadcrumb'
import { PersonIdentityCell } from '../components/ui/PersonIdentityCell'
import {
  MasterStatsGrid,
  MasterStatCard,
  MasterStatusBadge,
  MasterErrorState,
  MasterEmptyState,
  PrintOptionModal,
  SquircleActionButton,
} from '../components/master-data'
import { printCleanTable, downloadPdfTable } from '../utils/printHelper'

import { Button } from '@/components/tailgrids/core/button'
import {
  TableRoot,
  TableHeader,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
} from '@/components/tailgrids/core/table'
import { Pagination } from '@/components/tailgrids/core/pagination'
import { Input } from '@/components/tailgrids/core/input'
import {
  HoverCard,
  HoverCardTrigger,
  HoverCardContent,
} from '@/components/tailgrids/core/hover-card'
import {
  Dialog,
  DialogBody,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/tailgrids/core/dialog'
import { Backdrop } from '@/components/tailgrids/core/overlay'

const angka = (nilai) => new Intl.NumberFormat('id-ID').format(Number(nilai || 0))
const warnaPie = ['#059669', '#2563eb', '#d97706', '#7c3aed', '#db2777', '#0891b2']

export default function LaporanPegawaiPage() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [rows, setRows] = useState([])
  const [dashboard, setDashboard] = useState({})
  
  // Filters
  const [unit, setUnit] = useState('semua')
  const [jenisKelamin, setJenisKelamin] = useState('semua')
  const [status, setStatus] = useState('semua')
  const [jabatan, setJabatan] = useState('semua')
  const [period, setPeriod] = useState('semua')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')

  // Pagination & Sorting
  const [halaman, setHalaman] = useState(1)
  const [perHalaman, setPerHalaman] = useState(10)
  const [sortKey, setSortKey] = useState('full_name')
  const [sortOrder, setSortOrder] = useState('asc')

  // Modals
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false)
  const [selectedRowModal, setSelectedRowModal] = useState(null)
  const [printTargetRow, setPrintTargetRow] = useState(null)

  const getPeriodDateRange = (periodKey) => {
    const now = new Date()
    const iso = (d) => d.toISOString().slice(0, 10)
    const todayStr = iso(now)

    if (periodKey === 'hari') return { from: todayStr, to: todayStr }
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

  const loadData = useCallback(async () => {
    try {
      setLoading(true)
      setError('')
      const [list, stats] = await Promise.all([
        reportService.employees({ search }),
        reportService.employeeStats(),
      ])
      setRows(list.data || list || [])
      setDashboard(stats || {})
    } catch (err) {
      setError(err?.response?.data?.message || 'Laporan pegawai & guru gagal dimuat.')
    } finally {
      setLoading(false)
    }
  }, [search])

  useEffect(() => {
    loadData()
  }, [loadData])

  const daftarUnit = useMemo(
    () => [...new Set(rows.map((r) => r.education_unit?.name || r.unit?.name || r.unit).filter(Boolean))],
    [rows]
  )

  const daftarJabatan = useMemo(
    () => [...new Set(rows.map((r) => r.position?.name || r.jabatan?.name || r.jabatan).filter(Boolean))],
    [rows]
  )

  const handleSort = (key) => {
    if (sortKey === key) {
      setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortKey(key)
      setSortOrder('asc')
    }
  }

  const hasilFilter = useMemo(() => {
    const filtered = rows.filter((r) => {
      const nama = r.full_name || r.nama || ''
      const nip = r.nip || ''
      const unitName = r.education_unit?.name || r.unit?.name || r.unit || ''
      const jabatanName = r.position?.name || r.jabatan?.name || r.jabatan || ''
      const cocokCari = `${nama} ${nip} ${unitName} ${jabatanName}`
        .toLowerCase()
        .includes(search.toLowerCase())

      const jkVal = String(r.gender || r.jenis_kelamin || '').toUpperCase()
      const cocokJK =
        jenisKelamin === 'semua' ||
        (jenisKelamin === 'L' && (jkVal.startsWith('L') || jkVal.includes('LAKI'))) ||
        (jenisKelamin === 'P' && (jkVal.startsWith('P') || jkVal.includes('PEREMPUAN')))

      const statusRaw = String(r.status_pegawai || r.status || 'aktif').toLowerCase()
      const cocokStatus =
        status === 'semua' ||
        (status === 'aktif' && (statusRaw.includes('aktif') || statusRaw === 'active')) ||
        (status === 'nonaktif' && (statusRaw.includes('non') || statusRaw === 'inactive'))

      const cocokUnit = unit === 'semua' || unitName === unit
      const cocokJabatan = jabatan === 'semua' || jabatanName === jabatan

      const tglItem = r.created_at?.slice(0, 10) || r.tanggal_masuk || r.tgl_masuk
      let cocokPeriode = true
      if (dateFrom && tglItem) cocokPeriode = tglItem >= dateFrom
      if (dateTo && tglItem && cocokPeriode) cocokPeriode = tglItem <= dateTo

      return cocokCari && cocokJK && cocokStatus && cocokUnit && cocokJabatan && cocokPeriode
    })

    if (sortKey) {
      filtered.sort((a, b) => {
        let valA = a[sortKey] || a.full_name || a.nama || ''
        let valB = b[sortKey] || b.full_name || b.nama || ''
        if (typeof valA === 'string') valA = valA.toLowerCase()
        if (typeof valB === 'string') valB = valB.toLowerCase()
        if (valA < valB) return sortOrder === 'asc' ? -1 : 1
        if (valA > valB) return sortOrder === 'asc' ? 1 : -1
        return 0
      })
    }
    return filtered
  }, [rows, search, jenisKelamin, status, unit, jabatan, dateFrom, dateTo, sortKey, sortOrder])

  const totalHalaman = Math.max(Math.ceil(hasilFilter.length / perHalaman), 1)
  const baris = hasilFilter.slice((halaman - 1) * perHalaman, halaman * perHalaman)

  useEffect(() => {
    setHalaman(1)
  }, [search, status, unit, jenisKelamin, jabatan, period, dateFrom, dateTo, perHalaman])

  // KPIs
  const totalPegawai = Number(dashboard.total || dashboard.total_pegawai || rows.length)
  const pegawaiAktif = Number(dashboard.aktif || dashboard.pegawai_aktif || rows.filter((r) => ['aktif', 'ACTIVE'].includes(String(r.status_pegawai || r.status))).length)
  const guru = Number(dashboard.guru || dashboard.total_guru || rows.filter((r) => String(r.position?.name || r.jabatan).toLowerCase().includes('guru')).length)
  const tendik = Number(dashboard.tendik || dashboard.total_tendik || Math.max(totalPegawai - guru, 0))
  const nonaktif = Math.max(totalPegawai - pegawaiAktif, 0)

  // Chart Data
  const dataJabatanChart = useMemo(() => {
    const map = new Map()
    rows.forEach((r) => {
      const jName = r.position?.name || r.jabatan?.name || r.jabatan || 'Lainnya'
      map.set(jName, (map.get(jName) || 0) + 1)
    })
    return [...map].slice(0, 6).map(([nama, jumlah]) => ({ nama, jumlah }))
  }, [rows])

  const dataUnitChart = useMemo(() => {
    const map = new Map()
    rows.forEach((r) => {
      const uName = r.education_unit?.name || r.unit?.name || r.unit || 'Umum/Pusat'
      map.set(uName, (map.get(uName) || 0) + 1)
    })
    return [...map].map(([nama, jumlah]) => ({ nama, jumlah }))
  }, [rows])

  const resetFilter = () => {
    setUnit('semua')
    setJenisKelamin('semua')
    setStatus('semua')
    setJabatan('semua')
    setPeriod('semua')
    setDateFrom('')
    setDateTo('')
    setSearch('')
    setSortKey('full_name')
    setSortOrder('asc')
    setHalaman(1)
  }

  const kolomCsv = [
    { key: 'nip', label: 'NIP' },
    { key: 'full_name', label: 'Nama Pegawai', export: (r) => r.full_name || r.nama },
    { key: 'gender', label: 'Jenis Kelamin', export: (r) => r.gender || r.jenis_kelamin },
    { key: 'unit', label: 'Unit', export: (r) => r.education_unit?.name || r.unit?.name || r.unit },
    { key: 'position', label: 'Jabatan', export: (r) => r.position?.name || r.jabatan?.name || r.jabatan },
    { key: 'status', label: 'Status', export: (r) => r.status_pegawai || r.status },
  ]

  const handlePrintClean = () => {
    const listToPrint = printTargetRow ? [printTargetRow] : hasilFilter
    const title = printTargetRow ? `Laporan Pegawai: ${printTargetRow.full_name || printTargetRow.nama}` : 'Rekap Laporan Data Pegawai & Guru'
    const subtitle = `Total: ${listToPrint.length} Pegawai`

    printCleanTable({
      title,
      subtitle,
      headers: ['NO', 'NIP', 'NAMA PEGAWAI', 'UNIT', 'JABATAN', 'JK', 'STATUS'],
      rows: listToPrint.map((r, i) => [
        i + 1,
        r.nip || '-',
        r.full_name || r.nama || '-',
        r.education_unit?.name || r.unit?.name || r.unit || '-',
        r.position?.name || r.jabatan?.name || r.jabatan || '-',
        r.gender || r.jenis_kelamin || '-',
        r.status_pegawai || r.status || 'Aktif',
      ]),
    })
  }

  const handleDownloadPdf = () => {
    const listToPrint = printTargetRow ? [printTargetRow] : hasilFilter
    const title = printTargetRow ? `Laporan Pegawai: ${printTargetRow.full_name || printTargetRow.nama}` : 'Rekap Laporan Data Pegawai & Guru'
    const filename = `rekap-pegawai-${new Date().toISOString().slice(0, 10)}.pdf`

    downloadPdfTable({
      title,
      filename,
      headers: ['NO', 'NIP', 'NAMA PEGAWAI', 'UNIT', 'JABATAN', 'JK', 'STATUS'],
      rows: listToPrint.map((r, i) => [
        i + 1,
        r.nip || '-',
        r.full_name || r.nama || '-',
        r.education_unit?.name || r.unit?.name || r.unit || '-',
        r.position?.name || r.jabatan?.name || r.jabatan || '-',
        r.gender || r.jenis_kelamin || '-',
        r.status_pegawai || r.status || 'Aktif',
      ]),
    })
  }

  if (loading) {
    return (
      <PageContainer maxW="7xl">
        <MasterEmptyState loading message="Memuat laporan data pegawai & guru..." />
      </PageContainer>
    )
  }

  if (error) {
    return (
      <PageContainer maxW="7xl">
        <MasterErrorState message={error} onRetry={loadData} />
      </PageContainer>
    )
  }

  return (
    <PageContainer className="space-y-6 pb-12">
      {/* Breadcrumb */}
      <AppBreadcrumb
        items={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Rekap Data' },
          { label: 'Pegawai & Guru' },
        ]}
      />

      {/* MODERN HERO CARD HEADER */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
        <div className="relative overflow-hidden rounded-[22px] border-2 border-emerald-500/30 bg-gradient-to-r from-emerald-500/15 via-teal-500/10 to-emerald-600/15 p-5 sm:p-6 shadow-md shadow-emerald-500/10 dark:border-emerald-600/40 dark:bg-gradient-to-r dark:from-emerald-950/70 dark:via-teal-950/50 dark:to-slate-900">
          <div className="pointer-events-none absolute -top-12 -right-12 h-48 w-48 rounded-full bg-gradient-to-br from-emerald-500/30 via-teal-400/20 to-transparent blur-3xl" />
          <div className="pointer-events-none absolute -bottom-12 -left-12 h-48 w-48 rounded-full bg-gradient-to-tr from-teal-500/20 via-emerald-400/20 to-transparent blur-3xl" />

          <div className="relative z-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex size-12 sm:size-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700 text-white shadow-xl shadow-emerald-600/40 border border-emerald-300/40 dark:from-emerald-400 dark:via-emerald-500 dark:to-teal-600">
                <Briefcase className="size-6 sm:size-7 text-white" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-emerald-600 to-teal-600 px-3.5 py-1 text-xs font-extrabold text-white shadow-md shadow-emerald-600/30">
                    <Sparkles className="size-3 text-amber-300 animate-pulse" />
                    Laporan Kepegawaian & SDM
                  </span>
                  <span className="inline-flex items-center rounded-full bg-emerald-100 px-3 py-0.5 text-xs font-bold text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/60">
                    {angka(totalPegawai)} Total Pegawai & Guru
                  </span>
                </div>
                <h1 className="mt-1.5 text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                  Laporan Rekap Data Pegawai & Guru
                </h1>
                <p className="mt-0.5 text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-300 max-w-2xl">
                  Pusat rekapitulasi SDM terpadu: statistik status aktif/non-aktif, distribusi unit kerja, jenis kelamin, dan penugasan jabatan.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 shrink-0 z-10">
              <Button
                type="button"
                variant="primary"
                appearance="fill"
                size="sm"
                onClick={muatData}
                disabled={loading}
                prefixIcon={<RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />}
                className="!bg-gradient-to-r !from-emerald-600 !to-teal-600 !text-white font-bold shadow-md shadow-emerald-600/25 cursor-pointer"
              >
                Segarkan Data
              </Button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Print Modal */}
      <PrintOptionModal
        isOpen={isPrintModalOpen}
        onClose={() => { setIsPrintModalOpen(false); setPrintTargetRow(null); }}
        title={printTargetRow ? `Cetak Laporan: ${printTargetRow.full_name || printTargetRow.nama}` : 'Laporan Data Pegawai & Guru'}
        onPrint={handlePrintClean}
        onDownloadPdf={handleDownloadPdf}
      />

      {/* Detail Dialog Modal */}
      {selectedRowModal && (
        <Backdrop isOpen={Boolean(selectedRowModal)} onOpenChange={(open) => !open && setSelectedRowModal(null)}>
          <Dialog className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl dark:bg-[#1B2433]">
            <DialogHeader className="pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center justify-between">
                <DialogTitle className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Eye className="h-5 w-5 text-emerald-600" />
                  <span>Detail Data Pegawai</span>
                </DialogTitle>
                <MasterStatusBadge status={selectedRowModal.status_pegawai || selectedRowModal.status || 'aktif'} />
              </div>
              <DialogDescription className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Informasi profil lengkap dan penugasan kepegawaian.
              </DialogDescription>
            </DialogHeader>

            <DialogBody className="space-y-4 py-4 text-xs">
              <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                <div className="size-14 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 font-extrabold flex items-center justify-center text-sm shrink-0 overflow-hidden shadow-2xs">
                  {(selectedRowModal.full_name || selectedRowModal.nama || 'P').slice(0, 2).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
                    {selectedRowModal.full_name || selectedRowModal.nama}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-0.5">
                    NIP: {selectedRowModal.nip || '-'}
                  </p>
                  <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold mt-0.5">
                    {selectedRowModal.position?.name || selectedRowModal.jabatan || 'Pegawai'} — {selectedRowModal.education_unit?.name || selectedRowModal.unit || '-'}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3.5 p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900/40">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">NIP</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200 font-mono text-xs">{selectedRowModal.nip || '-'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">Nama Lengkap</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200 text-xs">{selectedRowModal.full_name || selectedRowModal.nama || '-'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">Unit Kerja</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200 text-xs">{selectedRowModal.education_unit?.name || selectedRowModal.unit || '-'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">Jabatan</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200 text-xs">{selectedRowModal.position?.name || selectedRowModal.jabatan || '-'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">Jenis Kelamin</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200 text-xs">{selectedRowModal.gender || selectedRowModal.jenis_kelamin || '-'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">Status Kepegawaian</span>
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400 text-xs">{selectedRowModal.status_pegawai || selectedRowModal.status || 'Aktif'}</span>
                </div>
              </div>
            </DialogBody>

            <DialogFooter className="flex items-center justify-between gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
              <Button size="sm" variant="ghost" className="bg-indigo-100/90 text-indigo-600 hover:bg-indigo-600 hover:text-white" onClick={() => { setPrintTargetRow(selectedRowModal); setIsPrintModalOpen(true); }}>
                <Printer className="h-4 w-4 mr-1.5" />
                Cetak Detail
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setSelectedRowModal(null)}>Tutup</Button>
            </DialogFooter>
          </Dialog>
        </Backdrop>
      )}

      {/* KPI Stats Grid */}
      <MasterStatsGrid columns={5}>
        <MasterStatCard icon={Users} label="Total Pegawai" value={angka(totalPegawai)} subtitle="Total SDM terdaftar" variant="success" delay={0} />
        <MasterStatCard icon={CheckCircle2} label="Pegawai Aktif" value={angka(pegawaiAktif)} subtitle={`${totalPegawai ? ((pegawaiAktif / totalPegawai) * 100).toFixed(1) : 0}% dari total`} variant="info" delay={50} />
        <MasterStatCard icon={GraduationCap} label="Guru Pendidik" value={angka(guru)} subtitle="Tenaga Pendidik" variant="warning" delay={100} />
        <MasterStatCard icon={Briefcase} label="Tenaga Kependidikan" value={angka(tendik)} subtitle="Tendik / Staf Support" variant="neutral" delay={150} />
        <MasterStatCard icon={UserX} label="Pegawai Non-Aktif" value={angka(nonaktif)} subtitle="Cuti / Resign" variant="danger" delay={200} />
      </MasterStatsGrid>

      {/* 3-Column Equal Grid (Style persis LaporanAbsensiPage) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-stretch">
        {/* Col 1: Panel Filter Laporan */}
        <article className="overflow-hidden rounded-[18px] border border-slate-200/80 bg-white dark:bg-[#1B2433] p-5 sm:p-6 shadow-xs flex flex-col justify-between h-full">
          <div>
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100 dark:border-slate-800">
              <h2 className="text-base font-bold text-slate-900 dark:text-white">Filter Laporan Pegawai</h2>
              <button type="button" onClick={resetFilter} className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer">
                Reset Filter
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Unit Kerja</label>
                <select
                  value={unit}
                  onChange={(e) => { setUnit(e.target.value); setHalaman(1); }}
                  className="w-full h-9 px-3 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="semua">Semua Unit Kerja</option>
                  {daftarUnit.map((u) => <option key={u} value={u}>{u}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Jabatan</label>
                <select
                  value={jabatan}
                  onChange={(e) => { setJabatan(e.target.value); setHalaman(1); }}
                  className="w-full h-9 px-3 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="semua">Semua Jabatan</option>
                  {daftarJabatan.map((j) => <option key={j} value={j}>{j}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Jenis Kelamin</label>
                <select
                  value={jenisKelamin}
                  onChange={(e) => { setJenisKelamin(e.target.value); setHalaman(1); }}
                  className="w-full h-9 px-3 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="semua">Semua Gender</option>
                  <option value="L">Laki-laki (L)</option>
                  <option value="P">Perempuan (P)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Status Kepegawaian</label>
                <select
                  value={status}
                  onChange={(e) => { setStatus(e.target.value); setHalaman(1); }}
                  className="w-full h-9 px-3 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="semua">Semua Status</option>
                  <option value="aktif">Aktif</option>
                  <option value="nonaktif">Non-aktif / Cuti</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Periode Tanggal</label>
                <select
                  value={period}
                  onChange={(e) => {
                    const nextP = e.target.value
                    setPeriod(nextP)
                    if (nextP !== 'custom' && nextP !== 'semua') {
                      const { from, to } = getPeriodDateRange(nextP)
                      setDateFrom(from)
                      setDateTo(to)
                    } else if (nextP === 'semua') {
                      setDateFrom('')
                      setDateTo('')
                    }
                    setHalaman(1)
                  }}
                  className="w-full h-9 px-3 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="semua">Semua Periode</option>
                  <option value="hari">Hari Ini</option>
                  <option value="minggu">7 Hari Terakhir</option>
                  <option value="bulan">Bulan Ini</option>
                  <option value="semester">6 Bulan Terakhir</option>
                  <option value="tahun">Tahun Ini</option>
                  <option value="custom">Rentang Kustom</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-1">
                <div>
                  <label className="block text-[11px] font-medium text-slate-500 mb-0.5">Tanggal Mulai</label>
                  <input
                    type="date"
                    value={dateFrom}
                    onChange={(e) => { setDateFrom(e.target.value); setPeriod('custom'); setHalaman(1); }}
                    className="w-full h-8 px-2 text-[11px] rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-slate-500 mb-0.5">Tanggal Selesai</label>
                  <input
                    type="date"
                    value={dateTo}
                    onChange={(e) => { setDateTo(e.target.value); setPeriod('custom'); setHalaman(1); }}
                    className="w-full h-8 px-2 text-[11px] rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200"
                  />
                </div>
              </div>
            </div>
          </div>
        </article>

        {/* Col 2: Grafik Distribusi Jabatan */}
        <article className="overflow-hidden rounded-[18px] border border-slate-200/80 bg-white dark:bg-[#1B2433] p-5 sm:p-6 shadow-xs flex flex-col justify-between h-full">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100 dark:border-slate-800">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">Jabatan SDM</h2>
            <span className="text-xs font-semibold text-slate-400">Position Breakdown</span>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dataJabatanChart} margin={{ top: 15, right: 10, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
                <XAxis dataKey="nama" tick={{ fontSize: 10 }} stroke="#888888" />
                <YAxis tick={{ fontSize: 10 }} stroke="#888888" />
                <Tooltip formatter={(v) => [angka(v), 'Pegawai']} />
                <Bar dataKey="jumlah" fill="#059669" radius={[6, 6, 0, 0]} maxBarSize={44} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </article>

        {/* Col 3: Grafik Distribusi Unit Kerja */}
        <article className="overflow-hidden rounded-[18px] border border-slate-200/80 bg-white dark:bg-[#1B2433] p-5 sm:p-6 shadow-xs flex flex-col justify-between h-full">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100 dark:border-slate-800">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">Distribusi Unit Kerja</h2>
            <span className="text-xs font-bold text-slate-500">{angka(totalPegawai)} Total</span>
          </div>
          <div className="flex flex-col items-center justify-center flex-1">
            <div className="relative w-40 h-40 mb-3">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={dataUnitChart} dataKey="jumlah" nameKey="nama" innerRadius="62%" outerRadius="88%" paddingAngle={2}>
                    {dataUnitChart.map((_, i) => <Cell key={i} fill={warnaPie[i % warnaPie.length]} />)}
                  </Pie>
                  <Tooltip formatter={(v) => [angka(v), 'Pegawai']} />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <strong className="text-xl font-black text-slate-900 dark:text-white">{angka(totalPegawai)}</strong>
                <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Total SDM</span>
              </div>
            </div>

            <div className="w-full grid grid-cols-2 gap-2 text-xs">
              {dataUnitChart.slice(0, 4).map((item, i) => (
                <div key={item.nama} className="flex items-center gap-1.5 p-1.5 rounded-lg bg-slate-50 dark:bg-slate-900/60">
                  <span className="size-2.5 rounded-full shrink-0" style={{ background: warnaPie[i % warnaPie.length] }} />
                  <div className="flex items-center justify-between w-full min-w-0">
                    <span className="text-[11px] font-medium text-slate-600 dark:text-slate-400 truncate">{item.nama}</span>
                    <span className="text-[11px] font-bold text-slate-900 dark:text-white ml-1">{angka(item.jumlah)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </article>
      </div>

      {/* Datatable Card */}
      <div className="relative overflow-hidden rounded-[22px] border-2 border-emerald-500/25 bg-white shadow-md shadow-emerald-500/5 dark:border-emerald-600/35 dark:bg-[#1B2433]">
        <div className="p-4 sm:p-6 space-y-4 bg-gradient-to-r from-emerald-500/10 via-teal-500/5 to-transparent border-b border-emerald-500/20">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">Daftar Pegawai & Guru</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Rincian data kepegawaian terdaftar beserta unit kerja dan jabatannya.
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0 py-1">
              <SquircleActionButton
                variant="import"
                label="Import Data"
                onClick={() => {
                  const input = document.createElement('input')
                  input.type = 'file'
                  input.accept = '.csv, .xlsx, .xls'
                  input.onchange = (e) => {
                    const file = e.target.files?.[0]
                    if (file) alert(`Berkas "${file.name}" siap di-import ke data kepegawaian!`)
                  }
                  input.click()
                }}
              />
              <SquircleActionButton variant="export" label="Export CSV" onClick={() => exportCsv('rekap-pegawai.csv', kolomCsv, hasilFilter)} />
              <SquircleActionButton variant="view" icon={Printer} label="Cetak Data" onClick={() => { setPrintTargetRow(null); setIsPrintModalOpen(true); }} />
            </div>
          </div>

          <div className="relative w-full">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari NIP, Nama Pegawai, Jabatan, atau Unit Kerja..."
              className="w-full pl-10 pr-9 h-10 text-xs rounded-xl bg-slate-50/70 dark:bg-slate-900/60"
            />
            {search && (
              <button type="button" onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-1 text-xs">
            <span className="text-slate-500 font-medium">Menampilkan <strong>{hasilFilter.length}</strong> pegawai terfilter</span>

            <div className="relative flex items-center gap-1.5">
              <span className="text-xs font-medium text-slate-500">Per Halaman:</span>
              <div className="relative">
                <select
                  value={perHalaman}
                  onChange={(e) => { setPerHalaman(Number(e.target.value)); setHalaman(1); }}
                  className="h-9 cursor-pointer appearance-none rounded-xl border border-slate-200 bg-white pl-3 pr-8 text-xs font-semibold text-slate-700 shadow-2xs dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={15}>15</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
                <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
              </div>
            </div>
          </div>
        </div>

        <div className="px-4 sm:px-6 md:px-8 overflow-x-auto">
          {hasilFilter.length === 0 ? (
            <div className="py-8">
              <MasterEmptyState message="Tidak ada data pegawai yang cocok dengan filter atau pencarian Anda." />
            </div>
          ) : (
            <TableRoot fullBleed={false}>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12 text-center">#</TableHead>
                  <TableHead className="cursor-pointer select-none" onClick={() => handleSort('full_name')}>
                    <div className="flex items-center gap-1.5">
                      <span>Nama Pegawai</span>
                      <ArrowBothDirectionHorizontal2 className="size-3.5 text-slate-400" />
                    </div>
                  </TableHead>
                  <TableHead className="text-center cursor-pointer select-none" onClick={() => handleSort('nip')}>
                    <div className="flex items-center justify-center gap-1.5">
                      <span>NIP</span>
                      <ArrowBothDirectionHorizontal2 className="size-3.5 text-slate-400" />
                    </div>
                  </TableHead>
                  <TableHead className="text-center">Unit Kerja</TableHead>
                  <TableHead className="text-center">Jabatan</TableHead>
                  <TableHead className="text-center">Gender</TableHead>
                  <TableHead className="text-right">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {baris.map((item, index) => {
                  const nameStr = item.full_name || item.nama || '-'
                  const nipStr = item.nip || '-'
                  const unitStr = item.education_unit?.name || item.unit?.name || item.unit || '-'
                  const jabatanStr = item.position?.name || item.jabatan?.name || item.jabatan || '-'

                  return (
                    <TableRow key={item.id || item.nip || index} className="hover:bg-slate-50/90 dark:hover:bg-slate-800/50 transition-colors">
                      <TableCell className="text-center font-bold text-slate-400 text-xs">
                        {(halaman - 1) * perHalaman + index + 1}
                      </TableCell>
                      <TableCell>
                        <HoverCard>
                          <HoverCardTrigger
                            onClick={(e) => { e.preventDefault(); setSelectedRowModal(item); }}
                            className="font-extrabold text-slate-900 dark:text-white text-sm border-b border-dashed border-slate-400/60 hover:border-[#0E5C44] transition-colors cursor-pointer inline-block"
                          >
                            <PersonIdentityCell name={nameStr} subtitle={nipStr !== '-' ? `NIP: ${nipStr}` : null} />
                          </HoverCardTrigger>
                          <HoverCardContent className="w-72 p-0 overflow-hidden border border-slate-200 bg-white dark:border-slate-800 dark:bg-[#1B2433] shadow-xl rounded-2xl z-50">
                            <div className="relative h-20 w-full bg-gradient-to-r from-emerald-800 to-teal-900 p-3.5 flex items-center justify-between text-white">
                              <div>
                                <span className="text-[9px] font-bold uppercase tracking-wider bg-white/20 px-2 py-0.5 rounded-full text-white">
                                  {jabatanStr}
                                </span>
                                <h4 className="text-sm font-extrabold mt-1 text-white truncate max-w-[170px]">
                                  {nameStr}
                                </h4>
                              </div>
                              <div className="size-10 rounded-full bg-white/10 backdrop-blur-xs flex items-center justify-center font-black text-xs text-white border border-white/20 shrink-0">
                                {nameStr.slice(0, 2).toUpperCase()}
                              </div>
                            </div>
                            <div className="p-3.5 space-y-2.5">
                              <div className="grid grid-cols-2 gap-2 text-xs">
                                <div>
                                  <span className="text-slate-400 block text-[10px] font-semibold">NIP</span>
                                  <span className="font-bold text-slate-800 dark:text-slate-200 font-mono truncate block">{nipStr}</span>
                                </div>
                                <div>
                                  <span className="text-slate-400 block text-[10px] font-semibold">Unit</span>
                                  <span className="font-bold text-slate-800 dark:text-slate-200 truncate block">{unitStr}</span>
                                </div>
                              </div>
                              <button
                                type="button"
                                onClick={() => setSelectedRowModal(item)}
                                className="w-full py-2 bg-[#0E5C44] text-white text-[10px] font-bold uppercase tracking-wider rounded-xl transition-all hover:bg-[#1E8E5A] active:scale-98 shadow-xs cursor-pointer"
                              >
                                Lihat Detail Profil Pegawai
                              </button>
                            </div>
                          </HoverCardContent>
                        </HoverCard>
                      </TableCell>
                      <TableCell className="text-center font-mono text-xs font-semibold text-slate-600 dark:text-slate-400">{nipStr}</TableCell>
                      <TableCell className="text-center font-medium text-slate-700 dark:text-slate-300">{unitStr}</TableCell>
                      <TableCell className="text-center font-semibold text-slate-800 dark:text-slate-200">{jabatanStr}</TableCell>
                      <TableCell className="text-center text-xs font-semibold text-slate-600 dark:text-slate-400">{item.gender || item.jenis_kelamin || '-'}</TableCell>
                      <TableCell className="text-right">
                        <MasterStatusBadge status={item.status_pegawai || item.status || 'aktif'} className="cursor-pointer" onClick={() => setSelectedRowModal(item)} />
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </TableRoot>
          )}
        </div>

        <div className="w-full border-t border-slate-100 px-4 py-3.5 sm:px-6 md:px-8 dark:border-slate-800">
          <Pagination currentPage={halaman} totalPages={totalHalaman} onPageChange={(page) => setHalaman(page)} sideLayout="full" />
        </div>
      </div>
    </PageContainer>
  )
}
