import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import {
  Building2,
  ChevronDown,
  Download,
  Eye,
  FileSpreadsheet,
  FileText,
  Filter,
  GraduationCap,
  Printer,
  RefreshCw,
  Search,
  UserCheck,
  UserMinus,
  Users,
  UserX,
  X,
} from 'lucide-react'
import {
  ArrowBothDirectionHorizontal2,
  Download1,
  Upload1,
} from '@tailgrids/icons'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

import { exportCsv } from '../components/reports/ReportKit'
import { studentService } from '../services/studentService'
import PageContainer from '../components/app/PageContainer'
import AppBreadcrumb from '../components/app/AppBreadcrumb'
import { PersonIdentityCell } from '../components/ui/PersonIdentityCell'
import ActionDropdown from '../components/app/ActionDropdown'
import {
  MasterStatsGrid,
  MasterStatCard,
  MasterStatusBadge,
  MasterErrorState,
  MasterEmptyState,
  PrintOptionModal,
  MasterFilterSelect,
} from '../components/master-data'
import { printCleanTable, downloadPdfTable } from '../utils/printHelper'

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/tailgrids/core/card'
import { Button } from '@/components/tailgrids/core/button'
import { Badge } from '@/components/tailgrids/core/badge'
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

const angka = (nilai) => new Intl.NumberFormat('id-ID').format(Number(nilai || 0))
const warnaPie = ['#059669', '#2563eb', '#d97706', '#7c3aed', '#db2777', '#0891b2']

export default function LaporanSiswaPage() {
  const [memuat, setMemuat] = useState(true)
  const [gagal, setGagal] = useState('')
  const [dashboard, setDashboard] = useState(null)
  const [pencarian, setPencarian] = useState('')
  const [status, setStatus] = useState('semua')
  const [unit, setUnit] = useState('semua')
  const [kelas, setKelas] = useState('semua')
  const [halaman, setHalaman] = useState(1)
  const [perHalaman, setPerHalaman] = useState(10)
  const [sortKey, setSortKey] = useState('nama')
  const [sortOrder, setSortOrder] = useState('asc')
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false)

  const muatData = async () => {
    try {
      setMemuat(true)
      setGagal('')
      const res = await studentService.getDashboard()
      setDashboard(res)
    } catch (error) {
      setGagal(error?.response?.data?.message || 'Gagal memuat laporan data siswa.')
    } finally {
      setMemuat(false)
    }
  }

  useEffect(() => {
    muatData()
  }, [])

  const siswa = useMemo(() => dashboard?.daftar_siswa || [], [dashboard])
  const statistik = dashboard?.statistik || {}
  const laporan = dashboard?.laporan_siswa || {}
  const total = Number(statistik.total_siswa || 0)
  const aktif = Number(statistik.siswa_aktif ?? siswa.filter((item) => item.aktif).length)
  const nonaktif = Number(statistik.siswa_nonaktif ?? Math.max(total - aktif, 0))
  const alumni = Number(statistik.alumni || 0)
  const mutasi = Number(statistik.mutasi_keluar || 0)

  const daftarKelas = useMemo(
    () => [...new Set(siswa.map((item) => item.kelas).filter(Boolean))],
    [siswa]
  )
  const daftarUnit = useMemo(
    () => [...new Set(siswa.map((item) => item.unit).filter((item) => item && item !== '-'))],
    [siswa]
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
    const filtered = siswa.filter((item) => {
      const cocokCari = `${item.nis || ''} ${item.nama || ''} ${item.kelas || ''} ${item.unit || ''}`
        .toLowerCase()
        .includes(pencarian.toLowerCase())
      const cocokStatus = status === 'semua' || (status === 'aktif' ? item.aktif : !item.aktif)
      return (
        cocokCari &&
        cocokStatus &&
        (unit === 'semua' || item.unit === unit) &&
        (kelas === 'semua' || item.kelas === kelas)
      )
    })

    if (sortKey) {
      filtered.sort((a, b) => {
        let valA = a[sortKey] ?? ''
        let valB = b[sortKey] ?? ''
        if (typeof valA === 'string') valA = valA.toLowerCase()
        if (typeof valB === 'string') valB = valB.toLowerCase()
        if (valA < valB) return sortOrder === 'asc' ? -1 : 1
        if (valA > valB) return sortOrder === 'asc' ? 1 : -1
        return 0
      })
    }
    return filtered
  }, [siswa, pencarian, status, unit, kelas, sortKey, sortOrder])

  const totalHalaman = Math.max(Math.ceil(hasilFilter.length / perHalaman), 1)
  const baris = hasilFilter.slice((halaman - 1) * perHalaman, halaman * perHalaman)

  useEffect(() => {
    setHalaman(1)
  }, [pencarian, status, unit, kelas, perHalaman])

  const dataKelas = useMemo(
    () =>
      (dashboard?.kelas_rombel || [])
        .map((item) => ({
          nama: item.level || item.nama,
          jumlah: Number(item.jumlah_siswa || 0),
        }))
        .reduce((acc, item) => {
          const ada = acc.find((x) => x.nama === item.nama)
          if (ada) ada.jumlah += item.jumlah
          else acc.push(item)
          return acc
        }, []),
    [dashboard]
  )

  const dataUnit = useMemo(() => {
    const map = new Map()
    siswa.forEach((item) => {
      const nama = item.unit || item.kelas || 'Belum ditentukan'
      map.set(nama, (map.get(nama) || 0) + 1)
    })
    return [...map].map(([nama, jumlah]) => ({ nama, jumlah }))
  }, [siswa])

  const gender = dashboard?.komposisi_gender || {
    laki_laki: siswa.filter((item) => ['L', 'Laki-laki'].includes(item.jenis_kelamin)).length,
    perempuan: siswa.filter((item) => ['P', 'Perempuan'].includes(item.jenis_kelamin)).length,
  }
  const totalGender = Number(gender.laki_laki || 0) + Number(gender.perempuan || 0)
  const tren = laporan.grafik_tahunan || []

  const kolomCsv = [
    { key: 'nis', label: 'NIS' },
    { key: 'nama', label: 'Nama Siswa' },
    { key: 'unit', label: 'Unit Pendidikan' },
    { key: 'kelas', label: 'Kelas/Rombel' },
    { key: 'jenis_kelamin', label: 'Jenis Kelamin' },
    { key: 'aktif', label: 'Status', export: (row) => (row.aktif ? 'Aktif' : 'Nonaktif') },
  ]

  const handlePrintClean = () => {
    printCleanTable({
      title: 'Rekap Laporan Data Siswa Terpadu',
      subtitle: `Daftar siswa terfilter - Total: ${hasilFilter.length} Siswa`,
      headers: ['NO', 'NIS', 'NAMA SISWA', 'UNIT PENDIDIKAN', 'KELAS / ROMBEL', 'JK', 'STATUS'],
      rows: hasilFilter.map((item, index) => [
        index + 1,
        item.nis || '-',
        item.nama || '-',
        item.unit || '-',
        item.kelas || '-',
        item.jenis_kelamin || '-',
        item.aktif ? 'Aktif' : 'Non Aktif',
      ]),
    })
  }

  const handleDownloadPdf = () => {
    downloadPdfTable({
      title: 'Rekap Laporan Data Siswa Terpadu',
      filename: `rekap-laporan-siswa-${new Date().toISOString().slice(0, 10)}.pdf`,
      headers: ['NO', 'NIS', 'NAMA SISWA', 'UNIT PENDIDIKAN', 'KELAS / ROMBEL', 'JK', 'STATUS'],
      rows: hasilFilter.map((item, index) => [
        index + 1,
        item.nis || '-',
        item.nama || '-',
        item.unit || '-',
        item.kelas || '-',
        item.jenis_kelamin || '-',
        item.aktif ? 'Aktif' : 'Non Aktif',
      ]),
    })
  }

  const resetFilter = () => {
    setUnit('semua')
    setKelas('semua')
    setStatus('semua')
    setPencarian('')
    setSortKey('nama')
    setSortOrder('asc')
    setHalaman(1)
  }

  if (memuat) {
    return (
      <PageContainer maxW="7xl">
        <MasterEmptyState loading message="Memuat laporan data siswa..." />
      </PageContainer>
    )
  }

  if (gagal) {
    return (
      <PageContainer maxW="7xl">
        <MasterErrorState message={gagal} onRetry={muatData} />
      </PageContainer>
    )
  }

  return (
    <PageContainer className="space-y-6 pb-12">
      {/* ── Breadcrumb ── */}
      <AppBreadcrumb
        items={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Rekap Data' },
          { label: 'Siswa' },
        ]}
      />

      {/* ── Print Modal Integration ─────────────────────────────────────────── */}
      <PrintOptionModal
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
        title="Laporan Data Siswa"
        onPrint={handlePrintClean}
        onDownloadPdf={handleDownloadPdf}
      />

      {/* ── KPI Stat Cards Grid ─────────────────────────────────────────────── */}
      <MasterStatsGrid columns={5}>
        <MasterStatCard
          icon={Users}
          label="Total Siswa"
          value={angka(total)}
          subtitle="Total terdaftar"
          variant="success"
          delay={0}
        />
        <MasterStatCard
          icon={GraduationCap}
          label="Siswa Aktif"
          value={angka(aktif)}
          subtitle={`${total ? ((aktif / total) * 100).toFixed(1) : 0}% dari total`}
          variant="info"
          delay={50}
        />
        <MasterStatCard
          icon={UserCheck}
          label="Siswa Alumni"
          value={angka(alumni)}
          subtitle={`${total ? ((alumni / total) * 100).toFixed(1) : 0}% dari total`}
          variant="warning"
          delay={100}
        />
        <MasterStatCard
          icon={UserMinus}
          label="Mutasi Keluar"
          value={angka(mutasi)}
          subtitle={`${total ? ((mutasi / total) * 100).toFixed(1) : 0}% dari total`}
          variant="neutral"
          delay={150}
        />
        <MasterStatCard
          icon={UserX}
          label="Siswa Non-Aktif"
          value={angka(nonaktif)}
          subtitle={`${total ? ((nonaktif / total) * 100).toFixed(1) : 0}% dari total`}
          variant="danger"
          delay={200}
        />
      </MasterStatsGrid>

      {/* ── Analytics Section (Charts Cards) ───────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Card 1: Siswa per Unit Pendidikan */}
        <Card className="rounded-[18px] border border-slate-200/80 bg-white shadow-xs dark:border-slate-800 dark:bg-[#1B2433]">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold text-slate-800 dark:text-slate-100 flex items-center justify-between">
              <span>Siswa per Unit Pendidikan</span>
              <Badge color="emerald" size="sm">
                Distribution
              </Badge>
            </CardTitle>
            <CardDescription className="text-xs text-slate-500 dark:text-slate-400">
              Komposisi siswa berdasarkan unit sekolah Islam terpadu
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="relative w-full md:w-1/2 h-56 flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={dataUnit}
                      dataKey="jumlah"
                      nameKey="nama"
                      innerRadius="60%"
                      outerRadius="88%"
                      paddingAngle={2}
                    >
                      {dataUnit.map((_, i) => (
                        <Cell key={i} fill={warnaPie[i % warnaPie.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(v) => [angka(v), 'Jumlah Siswa']} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-xl font-extrabold text-slate-800 dark:text-slate-100">
                    {angka(total)}
                  </span>
                  <span className="text-[11px] text-slate-400 font-medium">Total Siswa</span>
                </div>
              </div>

              <div className="w-full md:w-1/2 space-y-2 max-h-56 overflow-y-auto pr-1">
                {dataUnit.map((item, i) => (
                  <div
                    key={item.nama}
                    className="flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-xs"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span
                        className="size-3 rounded-full shrink-0"
                        style={{ backgroundColor: warnaPie[i % warnaPie.length] }}
                      />
                      <span className="font-medium text-slate-700 dark:text-slate-300 truncate">
                        {item.nama}
                      </span>
                    </div>
                    <span className="font-bold text-slate-900 dark:text-slate-100 shrink-0 ml-2">
                      {angka(item.jumlah)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Card 2: Siswa per Jenjang */}
        <Card className="rounded-[18px] border border-slate-200/80 bg-white shadow-xs dark:border-slate-800 dark:bg-[#1B2433]">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold text-slate-800 dark:text-slate-100 flex items-center justify-between">
              <span>Siswa per Jenjang / Level</span>
              <Badge color="blue" size="sm">
                Level Breakdown
              </Badge>
            </CardTitle>
            <CardDescription className="text-xs text-slate-500 dark:text-slate-400">
              Jumlah siswa aktif terdistribusi pada setiap level kelas
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dataKelas} margin={{ top: 15, right: 10, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
                  <XAxis dataKey="nama" tick={{ fontSize: 11 }} stroke="#888888" />
                  <YAxis tick={{ fontSize: 11 }} stroke="#888888" />
                  <Tooltip formatter={(v) => [angka(v), 'Siswa']} />
                  <Bar dataKey="jumlah" fill="#059669" radius={[6, 6, 0, 0]} maxBarSize={44} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Row 2: 3 Analytics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 3: Siswa per Jenis Kelamin */}
        <Card className="rounded-[18px] border border-slate-200/80 bg-white shadow-xs dark:border-slate-800 dark:bg-[#1B2433]">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-slate-800 dark:text-slate-100">
              Siswa per Jenis Kelamin
            </CardTitle>
            <CardDescription className="text-xs text-slate-500">
              Rasio Laki-laki & Perempuan
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-2 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-sky-100 bg-sky-50/60 dark:border-sky-950 dark:bg-sky-950/20 p-3 text-center">
                <span className="text-xs text-sky-700 dark:text-sky-400 font-semibold block">
                  Laki-laki
                </span>
                <span className="text-xl font-extrabold text-sky-600 dark:text-sky-300 mt-1 block">
                  {angka(gender.laki_laki)}
                </span>
                <span className="text-[10px] text-sky-500 font-medium mt-0.5 block">
                  {totalGender ? Math.round((gender.laki_laki / totalGender) * 100) : 0}%
                </span>
              </div>
              <div className="rounded-xl border border-pink-100 bg-pink-50/60 dark:border-pink-950 dark:bg-pink-950/20 p-3 text-center">
                <span className="text-xs text-pink-700 dark:text-pink-400 font-semibold block">
                  Perempuan
                </span>
                <span className="text-xl font-extrabold text-pink-600 dark:text-pink-300 mt-1 block">
                  {angka(gender.perempuan)}
                </span>
                <span className="text-[10px] text-pink-500 font-medium mt-0.5 block">
                  {totalGender ? Math.round((gender.perempuan / totalGender) * 100) : 0}%
                </span>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="space-y-1">
              <div className="h-3 w-full rounded-full bg-pink-100 dark:bg-pink-950/50 overflow-hidden flex">
                <div
                  className="h-full bg-sky-500 transition-all duration-500"
                  style={{
                    width: `${totalGender ? (gender.laki_laki / totalGender) * 100 : 50}%`,
                  }}
                />
              </div>
              <div className="flex justify-between text-[10px] font-semibold text-slate-400">
                <span className="text-sky-600">L: {angka(gender.laki_laki)}</span>
                <span className="text-pink-600">P: {angka(gender.perempuan)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Card 4: Status Siswa */}
        <Card className="rounded-[18px] border border-slate-200/80 bg-white shadow-xs dark:border-slate-800 dark:bg-[#1B2433]">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-slate-800 dark:text-slate-100">
              Siswa per Status
            </CardTitle>
            <CardDescription className="text-xs text-slate-500">
              Aktif, Alumni, & Non-aktif
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="flex items-center gap-2 h-44">
              <div className="w-1/2 h-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={[
                        { nama: 'Aktif', jumlah: aktif },
                        { nama: 'Alumni', jumlah: alumni },
                        { nama: 'Non-aktif', jumlah: nonaktif },
                      ]}
                      dataKey="jumlah"
                      innerRadius="55%"
                      outerRadius="85%"
                    >
                      <Cell fill="#059669" />
                      <Cell fill="#d97706" />
                      <Cell fill="#94a3b8" />
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="w-1/2 space-y-2 text-xs">
                <div className="flex items-center justify-between p-2 rounded-lg bg-emerald-50/60 dark:bg-emerald-950/20 text-emerald-800 dark:text-emerald-300">
                  <span className="font-semibold">Aktif</span>
                  <span className="font-bold">{angka(aktif)}</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded-lg bg-amber-50/60 dark:bg-amber-950/20 text-amber-800 dark:text-amber-300">
                  <span className="font-semibold">Alumni</span>
                  <span className="font-bold">{angka(alumni)}</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                  <span className="font-semibold">Non-aktif</span>
                  <span className="font-bold">{angka(nonaktif)}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Card 5: Tren Jumlah Siswa */}
        <Card className="rounded-[18px] border border-slate-200/80 bg-white shadow-xs dark:border-slate-800 dark:bg-[#1B2433]">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-slate-800 dark:text-slate-100">
              Tren Jumlah Siswa
            </CardTitle>
            <CardDescription className="text-xs text-slate-500">
              Pertumbuhan tahunan
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="h-44 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={tren} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                  <XAxis dataKey="tahun" tick={{ fontSize: 10 }} stroke="#888888" />
                  <YAxis tick={{ fontSize: 10 }} stroke="#888888" />
                  <Tooltip formatter={(v) => [angka(v), 'Siswa']} />
                  <Line
                    name="Jumlah Siswa"
                    dataKey="jumlah"
                    stroke="#059669"
                    strokeWidth={2.5}
                    dot={{ r: 4, fill: '#059669' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── Main Master Datatable Card ─────────────────────────────────────── */}
      <div className="overflow-hidden rounded-[18px] border border-slate-200/80 bg-white shadow-xs dark:border-slate-800 dark:bg-[#1B2433]">
        {/* ── Toolbar Header Terstruktur 3-Baris ───────────────────────────── */}
        <div className="p-4 sm:p-6 space-y-4 border-b border-slate-100 dark:border-slate-800/80">
          {/* Baris 1: Title & Toolbar Squircle Action Buttons */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                Rincian Data Siswa
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Daftar rincian data siswa berdasarkan unit, kelas, status, dan pencarian.
              </p>
            </div>

            <div className="flex items-center gap-2.5 flex-nowrap shrink-0 py-1">
              {/* Export Button (Amber) */}
              <div className="group relative inline-flex">
                <button
                  type="button"
                  title="Export Excel"
                  aria-label="Export Excel"
                  className="flex size-10 items-center justify-center rounded-2xl bg-amber-100/90 text-amber-600 hover:bg-amber-500 hover:text-white dark:bg-amber-950/60 dark:text-amber-300 dark:hover:bg-amber-500 dark:hover:text-white transition-colors duration-200 hover:shadow-md hover:shadow-amber-500/30 cursor-pointer shadow-2xs"
                  onClick={() => exportCsv('rekap-siswa.csv', kolomCsv, hasilFilter)}
                >
                  <Download1 className="size-5 transition-colors" />
                </button>
                <div className="pointer-events-none absolute top-full left-1/2 mt-2 -translate-x-1/2 opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 transition-all duration-200 ease-out z-50 whitespace-nowrap rounded-lg bg-slate-900 px-2.5 py-1 text-[11px] font-bold text-white shadow-xl dark:bg-slate-100 dark:text-slate-900">
                  <div className="absolute bottom-full left-1/2 -mb-1 -translate-x-1/2 border-4 border-transparent border-b-slate-900 dark:border-b-slate-100" />
                  Export Excel (.csv)
                </div>
              </div>

              {/* Print / PDF Button (Indigo) */}
              <div className="group relative inline-flex">
                <button
                  type="button"
                  title="Cetak & Export PDF"
                  aria-label="Cetak & Export PDF"
                  className="flex size-10 items-center justify-center rounded-2xl bg-indigo-100/90 text-indigo-600 hover:bg-indigo-600 hover:text-white dark:bg-indigo-950/60 dark:text-indigo-300 dark:hover:bg-indigo-600 dark:hover:text-white transition-colors duration-200 hover:shadow-md hover:shadow-indigo-600/30 cursor-pointer shadow-2xs"
                  onClick={() => setIsPrintModalOpen(true)}
                >
                  <Printer className="size-5 transition-colors" />
                </button>
                <div className="pointer-events-none absolute top-full left-1/2 mt-2 -translate-x-1/2 opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 transition-all duration-200 ease-out z-50 whitespace-nowrap rounded-lg bg-slate-900 px-2.5 py-1 text-[11px] font-bold text-white shadow-xl dark:bg-slate-100 dark:text-slate-900">
                  <div className="absolute bottom-full left-1/2 -mb-1 -translate-x-1/2 border-4 border-transparent border-b-slate-900 dark:border-b-slate-100" />
                  Cetak / PDF
                </div>
              </div>
            </div>
          </div>

          {/* Baris 2: Input Pencarian Memanjang Full Width */}
          <div className="relative w-full">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              type="text"
              value={pencarian}
              onChange={(e) => setPencarian(e.target.value)}
              placeholder="Cari NIS, Nama Siswa, Kelas, atau Unit Pendidikan..."
              className="w-full pl-10 pr-9 h-10 text-xs rounded-xl bg-slate-50/70 dark:bg-slate-900/60"
            />
            {pencarian && (
              <button
                type="button"
                onClick={() => setPencarian('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* Baris 3: Filter Controls Flex Horizontal */}
          <div className="flex flex-wrap items-center gap-3 pt-1 text-xs">
            <span className="font-bold text-slate-600 dark:text-slate-300 flex items-center gap-1">
              <Filter className="h-3.5 w-3.5 text-emerald-600" />
              Filter:
            </span>

            {/* Filter Unit */}
            {dashboard?.akses?.semua_unit && (
              <div className="relative min-w-[160px]">
                <select
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  className="h-9 w-full cursor-pointer appearance-none rounded-xl border border-slate-200 bg-white pl-3 pr-8 text-xs font-semibold text-slate-700 shadow-2xs transition-all hover:border-slate-300 focus:border-emerald-600 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
                >
                  <option value="semua">Semua Unit</option>
                  {daftarUnit.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
              </div>
            )}

            {/* Filter Kelas */}
            <div className="relative min-w-[140px]">
              <select
                value={kelas}
                onChange={(e) => setKelas(e.target.value)}
                className="h-9 w-full cursor-pointer appearance-none rounded-xl border border-slate-200 bg-white pl-3 pr-8 text-xs font-semibold text-slate-700 shadow-2xs transition-all hover:border-slate-300 focus:border-emerald-600 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
              >
                <option value="semua">Semua Kelas</option>
                {daftarKelas.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
            </div>

            {/* Filter Status */}
            <div className="relative min-w-[130px]">
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="h-9 w-full cursor-pointer appearance-none rounded-xl border border-slate-200 bg-white pl-3 pr-8 text-xs font-semibold text-slate-700 shadow-2xs transition-all hover:border-slate-300 focus:border-emerald-600 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
              >
                <option value="semua">Semua Status</option>
                <option value="aktif">Aktif</option>
                <option value="nonaktif">Non-aktif</option>
              </select>
              <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
            </div>

            {/* Per Page Select */}
            <div className="relative">
              <select
                value={perHalaman}
                onChange={(e) => {
                  setPerHalaman(Number(e.target.value))
                  setHalaman(1)
                }}
                className="h-9 cursor-pointer appearance-none rounded-xl border border-slate-200 bg-white pl-3 pr-8 text-xs font-semibold text-slate-700 shadow-2xs transition-all hover:border-slate-300 focus:border-emerald-600 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
              >
                <option value={5}>5 per Hal</option>
                <option value={10}>10 per Hal</option>
                <option value={15}>15 per Hal</option>
                <option value={25}>25 per Hal</option>
                <option value={50}>50 per Hal</option>
                <option value={100}>100 per Hal</option>
              </select>
              <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
            </div>

            {/* Reset Filter Button */}
            {(unit !== 'semua' || kelas !== 'semua' || status !== 'semua' || pencarian !== '') && (
              <Button
                variant="ghost"
                size="xs"
                onClick={resetFilter}
                className="text-xs text-rose-600 hover:text-rose-700 dark:text-rose-400"
              >
                Reset Filter
              </Button>
            )}
          </div>
        </div>

        {/* ── Table Viewport Container ────────────────────────────────────── */}
        <div className="px-4 sm:px-6 md:px-8 overflow-x-auto">
          <TableRoot fullBleed={false}>
            <TableHeader>
              <TableRow className="border-b border-slate-200/80 bg-slate-50/70 dark:border-slate-800 dark:bg-slate-900/50">
                <TableHead className="w-12 text-center text-xs font-bold text-slate-600 dark:text-slate-300">
                  No
                </TableHead>
                <TableHead
                  className="cursor-pointer text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-emerald-600 transition-colors"
                  onClick={() => handleSort('nis')}
                >
                  <div className="flex items-center gap-1.5">
                    <span>NIS</span>
                    <ArrowBothDirectionHorizontal2
                      className={`h-3 w-3 transition-transform ${
                        sortKey === 'nis' ? 'text-emerald-600 rotate-180' : 'text-slate-400'
                      }`}
                    />
                  </div>
                </TableHead>
                <TableHead
                  className="cursor-pointer text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-emerald-600 transition-colors"
                  onClick={() => handleSort('nama')}
                >
                  <div className="flex items-center gap-1.5">
                    <span>Nama Siswa</span>
                    <ArrowBothDirectionHorizontal2
                      className={`h-3 w-3 transition-transform ${
                        sortKey === 'nama' ? 'text-emerald-600 rotate-180' : 'text-slate-400'
                      }`}
                    />
                  </div>
                </TableHead>
                <TableHead
                  className="cursor-pointer text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-emerald-600 transition-colors"
                  onClick={() => handleSort('unit')}
                >
                  <div className="flex items-center gap-1.5">
                    <span>Unit Pendidikan</span>
                    <ArrowBothDirectionHorizontal2
                      className={`h-3 w-3 transition-transform ${
                        sortKey === 'unit' ? 'text-emerald-600 rotate-180' : 'text-slate-400'
                      }`}
                    />
                  </div>
                </TableHead>
                <TableHead
                  className="cursor-pointer text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-emerald-600 transition-colors"
                  onClick={() => handleSort('kelas')}
                >
                  <div className="flex items-center gap-1.5">
                    <span>Kelas / Rombel</span>
                    <ArrowBothDirectionHorizontal2
                      className={`h-3 w-3 transition-transform ${
                        sortKey === 'kelas' ? 'text-emerald-600 rotate-180' : 'text-slate-400'
                      }`}
                    />
                  </div>
                </TableHead>
                <TableHead className="text-xs font-bold text-slate-600 dark:text-slate-300">
                  JK
                </TableHead>
                <TableHead
                  className="cursor-pointer text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-emerald-600 transition-colors"
                  onClick={() => handleSort('aktif')}
                >
                  <div className="flex items-center gap-1.5">
                    <span>Status</span>
                    <ArrowBothDirectionHorizontal2
                      className={`h-3 w-3 transition-transform ${
                        sortKey === 'aktif' ? 'text-emerald-600 rotate-180' : 'text-slate-400'
                      }`}
                    />
                  </div>
                </TableHead>
                <TableHead className="text-right text-xs font-bold text-slate-600 dark:text-slate-300">
                  Aksi
                </TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {baris.length ? (
                baris.map((item, index) => (
                  <TableRow
                    key={item.id || index}
                    className="border-b border-slate-100 dark:border-slate-800/60 transition-all duration-200 hover:bg-slate-50/90 dark:hover:bg-slate-800/50"
                  >
                    <TableCell className="text-center text-xs text-slate-500 font-medium">
                      {(halaman - 1) * perHalaman + index + 1}
                    </TableCell>
                    <TableCell className="text-xs font-mono font-medium text-slate-700 dark:text-slate-300">
                      {item.nis || '-'}
                    </TableCell>
                    <TableCell className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                      <HoverCard>
                        <HoverCardTrigger asChild>
                          <div className="cursor-pointer transition-colors hover:text-emerald-600">
                            <PersonIdentityCell
                              name={item.nama}
                              subtitle={`NIS: ${item.nis || '-'}`}
                              avatarUrl={item.foto_url}
                            />
                          </div>
                        </HoverCardTrigger>
                        <HoverCardContent className="w-72 p-4 border border-slate-200 bg-white dark:border-slate-800 dark:bg-[#1B2433] shadow-xl rounded-2xl space-y-3 z-50">
                          <div className="flex items-center gap-3">
                            <div className="size-10 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 font-bold flex items-center justify-center text-xs shrink-0 overflow-hidden">
                              {item.foto_url ? (
                                <img src={item.foto_url} alt={item.nama} className="h-full w-full object-cover" />
                              ) : (
                                (item.nama || 'S').slice(0, 2).toUpperCase()
                              )}
                            </div>
                            <div className="min-w-0 flex-1">
                              <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                                {item.nama}
                              </h4>
                              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                                NIS: {item.nis || '-'}
                              </p>
                            </div>
                            <MasterStatusBadge status={item.aktif ? 'aktif' : 'nonaktif'} />
                          </div>

                          <div className="grid grid-cols-2 gap-2 text-[11px] pt-2 border-t border-slate-100 dark:border-slate-800/80">
                            <div>
                              <span className="text-slate-400 block text-[10px]">Unit Pendidikan</span>
                              <span className="font-semibold text-slate-700 dark:text-slate-200">{item.unit || '-'}</span>
                            </div>
                            <div>
                              <span className="text-slate-400 block text-[10px]">Kelas / Rombel</span>
                              <span className="font-semibold text-slate-700 dark:text-slate-200">{item.kelas || '-'}</span>
                            </div>
                            <div>
                              <span className="text-slate-400 block text-[10px]">Jenis Kelamin</span>
                              <span className="font-semibold text-slate-700 dark:text-slate-200">{item.jenis_kelamin || '-'}</span>
                            </div>
                            <div>
                              <span className="text-slate-400 block text-[10px]">Status Siswa</span>
                              <span className="font-semibold text-emerald-600 dark:text-emerald-400">{item.aktif ? 'Aktif' : 'Non-aktif'}</span>
                            </div>
                          </div>
                        </HoverCardContent>
                      </HoverCard>
                    </TableCell>
                    <TableCell className="text-xs text-slate-600 dark:text-slate-300">
                      <span className="inline-flex items-center gap-1 font-medium">
                        <Building2 className="h-3.5 w-3.5 text-slate-400" />
                        {item.unit || '-'}
                      </span>
                    </TableCell>
                    <TableCell className="text-xs text-slate-600 dark:text-slate-300">
                      <Badge color="cyan" size="sm">
                        {item.kelas || '-'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs text-slate-600 dark:text-slate-300">
                      {item.jenis_kelamin || '-'}
                    </TableCell>
                    <TableCell className="text-xs">
                      <MasterStatusBadge status={item.aktif ? 'aktif' : 'nonaktif'} />
                    </TableCell>
                    <TableCell className="text-right">
                      <ActionDropdown
                        extraItems={[
                          {
                            label: 'Export Data',
                            icon: <FileSpreadsheet className="h-4 w-4 text-emerald-600" />,
                            onClick: () =>
                              exportCsv(
                                `siswa-${item.nis || item.id}.csv`,
                                kolomCsv,
                                [item]
                              ),
                          },
                          {
                            label: 'Cetak Siswa',
                            icon: <Printer className="h-4 w-4 text-slate-500" />,
                            onClick: () => setIsPrintModalOpen(true),
                          },
                        ]}
                      />
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={8} className="py-8 text-center">
                    <MasterEmptyState
                      message="Tidak ada data siswa yang sesuai dengan filter atau kata kunci pencarian."
                      actionText="Reset Filter"
                      onAction={resetFilter}
                    />
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </TableRoot>
        </div>

        {/* ── Table Footer / Pagination Navigation ─────────────────────────── */}
        <div className="w-full border-t border-slate-100 px-4 py-3.5 sm:px-6 md:px-8 dark:border-slate-800">
          <Pagination
            currentPage={halaman}
            totalPages={totalHalaman}
            sideLayout="full"
            onPageChange={setHalaman}
          />
        </div>
      </div>
    </PageContainer>
  )
}

