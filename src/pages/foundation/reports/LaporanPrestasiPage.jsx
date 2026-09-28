import React, { useState, useEffect } from 'react'
import {
  Award,
  BookOpen,
  Building2,
  Calendar,
  CheckCircle2,
  ChevronDown,
  Download,
  Eye,
  FileSpreadsheet,
  Filter,
  GraduationCap,
  Layers,
  Medal,
  Printer,
  RefreshCw,
  RotateCcw,
  Search,
  ShieldCheck,
  Sparkles,
  Star,
  Trophy,
  UserCheck,
  Users,
} from 'lucide-react'
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  CartesianGrid,
} from 'recharts'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuthStore } from '../../../stores/authStore'
import { reportService } from '../../../services/reportService'

// TailGrids Core Components
import { Avatar, AvatarImage, AvatarFallback, AvatarBadge } from '../../../components/tailgrids/core/avatar'
import { Badge } from '../../../components/tailgrids/core/badge'
import { Button } from '../../../components/tailgrids/core/button'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../../../components/tailgrids/core/card'
import { Alert, AlertContent, AlertDescription, AlertIndicator, AlertTitle } from '../../../components/tailgrids/core/alert'
import {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogBody,
  DialogFooter,
  DialogClose,
} from '../../../components/tailgrids/core/dialog'
import { Pagination } from '../../../components/tailgrids/core/pagination'
import {
  TableRoot,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from '../../../components/tailgrids/core/table'
import PageContainer from '../../../components/app/PageContainer'
import AppBreadcrumb from '../../../components/app/AppBreadcrumb'
import {
  MasterStatsGrid,
  MasterStatCard,
  SquircleActionButton,
  PrintOptionModal,
} from '../../../components/master-data'
import { ReportSkeleton } from '../../../components/reports/ReportSkeleton'
import { ReportEmptyState } from '../../../components/reports/ReportEmptyState'
import { ReportErrorState } from '../../../components/reports/ReportErrorState'
import { ReportExportModal } from '../../../components/reports/ReportExportModal'
import { printCleanTable, downloadPdfTable } from '../../../utils/printHelper'

const CATEGORY_COLORS = {
  tahfizh: { bg: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800', badgeColor: 'emerald' },
  santri: { bg: 'bg-cyan-50 text-cyan-700 border-cyan-200 dark:bg-cyan-950/40 dark:text-cyan-300 dark:border-cyan-800', badgeColor: 'cyan' },
  olahraga: { bg: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800', badgeColor: 'warning' },
  lomba: { bg: 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-800', badgeColor: 'purple' },
  akademik: { bg: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800', badgeColor: 'pink' },
}

const TINGKAT_BADGES = {
  Nasional: { color: 'rose', label: 'Tingkat Nasional', icon: Trophy },
  Provinsi: { color: 'purple', label: 'Tingkat Provinsi', icon: Medal },
  'Kota/Kabupaten': { color: 'sky', label: 'Tingkat Kota/Kab', icon: Star },
  'Internal Sekolah': { color: 'gray', label: 'Internal Sekolah', icon: Award },
}

export function LaporanPrestasiPage() {
  const user = useAuthStore((state) => state.user)

  const isFoundationRole = React.useMemo(() => {
    if (!user) return false
    const roles = user.roles ? (Array.isArray(user.roles) ? user.roles.map(r => typeof r === 'string' ? r : r.name) : [user.roles]) : []
    const roleNames = roles.map(r => String(r).toLowerCase())
    return roleNames.some(r =>
      r.includes('yayasan') || r.includes('pengurus') || r.includes('ketua') || r.includes('sekretaris') || r.includes('bendahara') || r.includes('admin') || r.includes('super')
    ) || Boolean(user.permissions?.includes('foundation.report.view')) || Boolean(user.permissions?.includes('dashboard.yayasan.view'))
  }, [user])

  const [filters, setFilters] = useState({
    period: 'year',
    unit_id: 'all',
    jenis_prestasi: 'all',
    tingkat_prestasi: 'all',
    search: '',
    page: 1,
    per_page: 15,
  })

  const [activeTab, setActiveTab] = useState('unit') // 'unit' | 'kepsek' | 'divisi'
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [reportData, setReportData] = useState(null)

  // Modals state
  const [selectedStudentDetail, setSelectedStudentDetail] = useState(null)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
  const [isExportOpen, setIsExportOpen] = useState(false)
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false)

  const fetchReport = async () => {
    setLoading(true)
    setError(false)
    try {
      const res = await reportService.getFoundationPrestasiReport(filters)
      setReportData(res)
    } catch (err) {
      console.error('Failed to fetch Prestasi report', err)
      setError(true)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchReport()
  }, [filters])

  const handleFilterChange = (key, val) => {
    setFilters((prev) => ({ ...prev, [key]: val, page: 1 }))
  }

  const handleResetFilters = () => {
    setFilters({
      period: 'year',
      unit_id: 'all',
      jenis_prestasi: 'all',
      tingkat_prestasi: 'all',
      search: '',
      page: 1,
      per_page: 15,
    })
  }

  const handleOpenStudentDetail = async (studentItem) => {
    try {
      const detail = await reportService.getFoundationPrestasiDetail(studentItem.id)
      setSelectedStudentDetail(detail)
    } catch (e) {
      setSelectedStudentDetail(studentItem)
    }
    setIsDetailModalOpen(true)
  }

  const handleConfirmExport = ({ format, orientation }) => {
    const url = reportService.exportFoundationReport('prestasi', { ...filters, format, orientation })
    window.open(url, '_blank')
  }

  const handlePrintClean = () => {
    setIsPrintModalOpen(false)
    const headers = ['Siswa', 'NIS', 'Unit & Kelas', 'Nama Prestasi', 'Kategori', 'Tingkat', 'Tanggal', 'Nilai']
    const rows = (reportData?.details || []).map((d) => [
      d.student_name || '-',
      d.nis || '-',
      `${d.unit_code || ''} ${d.class_name || ''}`,
      d.nama_prestasi || '-',
      d.jenis_prestasi || '-',
      d.tingkat_prestasi || '-',
      d.tanggal_prestasi || '-',
      String(d.nilai_prestasi || 0),
    ])
    printCleanTable({
      title: 'Laporan Rekapitulasi Prestasi Siswa Yayasan',
      subtitle: `Periode: ${reportData?.report?.period?.label || 'Tahun Ini'} • Total: ${reportData?.meta?.total || rows.length} Prestasi`,
      headers,
      rows,
    })
  }

  const handleDownloadPdf = () => {
    setIsPrintModalOpen(false)
    const headers = ['Siswa', 'NIS', 'Unit & Kelas', 'Nama Prestasi', 'Kategori', 'Tingkat', 'Tanggal', 'Nilai']
    const rows = (reportData?.details || []).map((d) => [
      d.student_name || '-',
      d.nis || '-',
      `${d.unit_code || ''} ${d.class_name || ''}`,
      d.nama_prestasi || '-',
      d.jenis_prestasi || '-',
      d.tingkat_prestasi || '-',
      d.tanggal_prestasi || '-',
      String(d.nilai_prestasi || 0),
    ])
    downloadPdfTable({
      title: 'Laporan Rekapitulasi Prestasi Siswa Yayasan',
      subtitle: `Periode: ${reportData?.report?.period?.label || 'Tahun Ini'} • Total: ${reportData?.meta?.total || rows.length} Prestasi`,
      headers,
      rows,
    })
  }

  // Access Denied guard if user is not Pengurus Yayasan
  if (!isFoundationRole && !loading) {
    return (
      <PageContainer maxW="7xl" className="space-y-6 pb-12">
        <div className="mx-auto max-w-4xl px-4 py-16 text-center">
          <Alert status="error" className="shadow-lg">
            <AlertIndicator />
            <AlertContent>
              <AlertTitle>Akses Dibatasi Khusus Pengurus Yayasan</AlertTitle>
              <AlertDescription>
                Modul Laporan Rekapitulasi Prestasi Siswa per Unit Pendidikan, Kepala Sekolah, dan Divisi Pendidikan ini hanya dapat diakses oleh Pengurus Yayasan.
              </AlertDescription>
            </AlertContent>
          </Alert>
        </div>
      </PageContainer>
    )
  }

  if (loading && !reportData) return <ReportSkeleton />
  if (error) return <ReportErrorState onRetry={fetchReport} />
  if (!reportData || !reportData.summary) return <ReportEmptyState onReset={handleResetFilters} />

  const {
    summary,
    unit_recaps,
    unit_recaps_total,
    kepala_sekolah_recaps,
    divisi_pendidikan_recaps,
    top_students_cards,
    details,
    charts,
    insights,
    meta,
    report,
  } = reportData

  // Chart pie data
  const pieCategoryData = (divisi_pendidikan_recaps?.distribusi_kategori || []).length > 0
    ? divisi_pendidikan_recaps.distribusi_kategori
    : [
        { name: 'Tahfizh', count: summary.kategori_tahfizh || 0, color: '#10B981' },
        { name: 'Santri & Adab', count: summary.kategori_santri || 0, color: '#06B6D4' },
        { name: 'Akademik', count: summary.kategori_akademik || 0, color: '#EC4899' },
        { name: 'Lomba Belajar', count: summary.kategori_lomba || 0, color: '#8B5CF6' },
        { name: 'Olahraga & Seni', count: summary.kategori_olahraga || 0, color: '#F59E0B' },
      ]

  const unitComparisonData = charts?.unit_comparison || []

  return (
    <PageContainer maxW="7xl" className="space-y-6 pb-12">
      {/* 🧭 AppBreadcrumb Navigation */}
      <AppBreadcrumb
        className="print:hidden"
        items={[
          { href: '/dashboard/yayasan', label: 'Yayasan' },
          { href: '/dashboard/yayasan/laporan', label: 'Laporan Eksekutif' },
          { label: 'Laporan Rekapitulasi Prestasi Siswa' },
        ]}
      />

      {/* ── 1. MODERN VIVID EMERALD HERO HEADER CARD ── */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="relative overflow-hidden rounded-[22px] border-2 border-emerald-500/30 bg-gradient-to-r from-emerald-500/15 via-teal-500/10 to-emerald-600/15 p-5 sm:p-6 shadow-md shadow-emerald-500/10 dark:border-emerald-600/40 dark:bg-gradient-to-r dark:from-emerald-950/70 dark:via-teal-950/50 dark:to-slate-900 print:hidden"
      >
        {/* Dual Multi-Tone Ambient Glow Blobs */}
        <div className="pointer-events-none absolute -top-20 -right-20 h-56 w-56 rounded-full bg-gradient-to-br from-emerald-500/40 via-teal-400/30 to-emerald-600/20 blur-3xl dark:from-emerald-500/50 dark:via-teal-400/40" />
        <div className="pointer-events-none absolute -bottom-20 -left-20 h-56 w-56 rounded-full bg-gradient-to-tr from-emerald-600/30 via-teal-500/20 to-transparent blur-3xl dark:from-emerald-600/40 dark:via-teal-500/30" />

        <div className="relative z-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-4 min-w-0">
            <div className="flex size-12 sm:size-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700 text-white shadow-xl shadow-emerald-600/40 border border-emerald-300/40 dark:from-emerald-400 dark:via-emerald-500 dark:to-teal-600">
              <Trophy className="size-6 sm:size-7 text-white" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2.5 flex-wrap">
                <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-emerald-600 to-teal-600 px-3.5 py-1 text-xs font-extrabold text-white shadow-sm shadow-emerald-600/25 border border-emerald-300/40">
                  <Sparkles className="size-3 text-amber-300 animate-pulse" />
                  Laporan Prestasi Siswa Yayasan
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-0.5 text-xs font-extrabold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/60">
                  Periode: {report?.period?.label || 'Tahun Berjalan'}
                </span>
              </div>
              <h1 className="mt-1.5 text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                {report?.title || 'Laporan Rekapitulasi Prestasi Siswa'}
              </h1>
              <p className="mt-0.5 text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300 max-w-2xl leading-relaxed">
                {report?.description || 'Rekapitulasi capaian prestasi siswa per Unit Pendidikan, Kepala Sekolah, dan Divisi Pendidikan dengan profil avatar siswa & kartu apresiasi.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 self-start sm:self-center">
            <Button
              type="button"
              variant="primary"
              appearance="fill"
              size="sm"
              onClick={fetchReport}
              disabled={loading}
              prefixIcon={<RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />}
              className="!bg-gradient-to-r !from-emerald-600 !to-teal-600 !text-white font-bold shadow-md shadow-emerald-600/25 cursor-pointer"
            >
              Segarkan Data
            </Button>
          </div>
        </div>
      </motion.div>

      {/* ── 2. MASTER STATS GRID (5 KPI CARDS) ── */}
      <MasterStatsGrid>
        <MasterStatCard
          icon={Trophy}
          label="Total Prestasi"
          value={summary.total_prestasi}
          description="Tercatat di sistem yayasan"
          variant="success"
        />
        <MasterStatCard
          icon={Users}
          label="Siswa Berprestasi"
          value={summary.total_siswa_berprestasi}
          description="Penerima sertifikat/medali"
          variant="info"
        />
        <MasterStatCard
          icon={Medal}
          label="Tingkat Nasional"
          value={summary.tingkat_nasional}
          description="Kejuaraan tingkat nasional"
          variant="warning"
        />
        <MasterStatCard
          icon={Star}
          label="Tingkat Provinsi"
          value={summary.tingkat_provinsi || 0}
          description="Kejuaraan provinsi / daerah"
          variant="indigo"
        />
        <MasterStatCard
          icon={BookOpen}
          label="Tahfizh & Santri"
          value={summary.kategori_tahfizh + summary.kategori_santri}
          description="Hafalan Al-Qur'an & Adab"
          variant="purple"
        />
      </MasterStatsGrid>

      {/* ── 3. 3-COLUMN EQUAL GRID: FILTER + TREND CHART + DONUT CHART ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-stretch print:hidden">
        {/* Col 1: Kartu Filter Laporan + Reset */}
        <div className="relative overflow-hidden rounded-[22px] border-2 border-emerald-500/25 bg-white p-5 shadow-md shadow-emerald-500/5 dark:border-emerald-600/35 dark:bg-[#1B2433] flex flex-col justify-between">
          <div className="pointer-events-none absolute -top-10 -right-10 h-32 w-32 rounded-full bg-emerald-400/10 blur-2xl dark:bg-emerald-400/15" />
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4 border-b border-emerald-500/15 pb-3">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Filter className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                Filter Laporan Prestasi
              </h3>
              <span className="rounded-lg bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                Interaktif
              </span>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Periode Waktu
                </label>
                <select
                  value={filters.period}
                  onChange={(e) => handleFilterChange('period', e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2 text-xs font-semibold text-slate-800 focus:border-emerald-600 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                >
                  <option value="year">Tahun Ini (2026)</option>
                  <option value="month">Bulan Ini</option>
                  <option value="all">Semua Periode</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Kategori Prestasi
                </label>
                <select
                  value={filters.jenis_prestasi}
                  onChange={(e) => handleFilterChange('jenis_prestasi', e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2 text-xs font-semibold text-slate-800 focus:border-emerald-600 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                >
                  <option value="all">Semua Kategori</option>
                  <option value="tahfizh">Tahfizh Al-Qur’an</option>
                  <option value="santri">Adab & Karakter Santri</option>
                  <option value="olahraga">Olahraga & Ekskul</option>
                  <option value="lomba">Lomba Pembelajaran</option>
                  <option value="akademik">Akademik Umum</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Tingkat Prestasi
                </label>
                <select
                  value={filters.tingkat_prestasi}
                  onChange={(e) => handleFilterChange('tingkat_prestasi', e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2 text-xs font-semibold text-slate-800 focus:border-emerald-600 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                >
                  <option value="all">Semua Tingkat</option>
                  <option value="Nasional">Tingkat Nasional</option>
                  <option value="Provinsi">Tingkat Provinsi</option>
                  <option value="Kota/Kabupaten">Kota / Kabupaten</option>
                  <option value="Internal Sekolah">Internal Sekolah</option>
                </select>
              </div>
            </div>
          </div>

          <div className="relative z-10 mt-4 pt-3 border-t border-emerald-500/15">
            <button
              type="button"
              onClick={handleResetFilters}
              className="w-full flex items-center justify-center gap-1.5 rounded-xl border border-emerald-200 bg-emerald-50/50 p-2 text-xs font-bold text-emerald-800 hover:bg-emerald-100 dark:border-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300 cursor-pointer transition-colors"
            >
              <RotateCcw className="h-3.5 w-3.5" /> Reset Filter Laporan
            </button>
          </div>
        </div>

        {/* Col 2: Grafik Tren / Komparasi Prestasi per Unit (BarChart) */}
        <div className="relative overflow-hidden rounded-[22px] border-2 border-emerald-500/25 bg-white p-5 shadow-md shadow-emerald-500/5 dark:border-emerald-600/35 dark:bg-[#1B2433]">
          <div className="pointer-events-none absolute -top-10 -right-10 h-32 w-32 rounded-full bg-emerald-400/10 blur-2xl dark:bg-emerald-400/15" />
          <div className="relative z-10 h-full flex flex-col justify-between">
            <div className="flex items-center justify-between mb-3 border-b border-emerald-500/15 pb-2.5">
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">Perbandingan Prestasi per Unit</h4>
                <p className="text-[11px] text-slate-400">Total prestasi per satuan pendidikan</p>
              </div>
              <span className="rounded-lg bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                Unit Rekap
              </span>
            </div>
            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={unitComparisonData.length > 0 ? unitComparisonData : (unit_recaps || []).map(u => ({ unit_code: u.unit_code, total_prestasi: u.total_prestasi }))}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis dataKey="unit_code" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip formatter={(val) => [`${val} Prestasi`, 'Total']} />
                  <Bar dataKey="total_prestasi" fill="#0E5C44" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Col 3: Grafik Donut Komposisi Kategori Prestasi (PieChart) */}
        <div className="relative overflow-hidden rounded-[22px] border-2 border-emerald-500/25 bg-white p-5 shadow-md shadow-emerald-500/5 dark:border-emerald-600/35 dark:bg-[#1B2433]">
          <div className="pointer-events-none absolute -top-10 -right-10 h-32 w-32 rounded-full bg-emerald-400/10 blur-2xl dark:bg-emerald-400/15" />
          <div className="relative z-10 h-full flex flex-col justify-between">
            <div className="flex items-center justify-between mb-3 border-b border-emerald-500/15 pb-2.5">
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">Komposisi Bidang Prestasi</h4>
                <p className="text-[11px] text-slate-400">Persentase sebaran kategori</p>
              </div>
              <span className="rounded-lg bg-purple-50 px-2 py-0.5 text-[10px] font-bold text-purple-700 dark:bg-purple-950 dark:text-purple-300">
                Kategori
              </span>
            </div>
            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieCategoryData}
                    dataKey="count"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={75}
                    paddingAngle={3}
                  >
                    {pieCategoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color || ['#10B981', '#06B6D4', '#EC4899', '#8B5CF6', '#F59E0B'][index % 5]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(val, name) => [`${val} Prestasi`, name]} />
                  <Legend iconSize={8} wrapperStyle={{ fontSize: 10 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* ── 4. SPOTLIGHT CARDS SISWA BERPRESTASI UTAMA ── */}
      {top_students_cards && top_students_cards.length > 0 && (
        <div className="relative overflow-hidden rounded-[22px] border-2 border-emerald-500/25 bg-white p-5 sm:p-6 shadow-md shadow-emerald-500/5 dark:border-emerald-600/35 dark:bg-[#1B2433] print:hidden space-y-4">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between border-b border-emerald-500/15 pb-3">
            <div>
              <h3 className="flex items-center gap-2 text-base font-black text-slate-900 dark:text-white">
                <Sparkles className="h-5 w-5 text-amber-500 animate-pulse" />
                Siswa Berprestasi Utama per Unit Pendidikan
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Kartu apresiasi siswa penerima nilai prestasi tertinggi dari masing-masing unit pendidikan yayasan.
              </p>
            </div>
            <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400">
              {top_students_cards.length} Unit Terpilih
            </span>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {top_students_cards.map((card) => {
              const initials = card.full_name
                ? card.full_name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase()
                : 'SW'

              return (
                <Card
                  key={card.id || card.student_id}
                  className="group relative overflow-hidden border-2 border-emerald-100/90 dark:border-emerald-900/40 transition-all duration-200 hover:-translate-y-1 hover:border-emerald-400 hover:shadow-lg dark:hover:border-emerald-600 rounded-2xl"
                >
                  <div className="h-1.5 w-full bg-gradient-to-r from-emerald-500 via-teal-400 to-sky-500" />
                  <CardHeader className="flex flex-row items-start justify-between pb-2">
                    <div>
                      <Badge color="emerald" size="sm">
                        {card.unit_code || card.unit_name}
                      </Badge>
                      <p className="mt-1 text-[11px] font-semibold text-slate-400">{card.unit_name}</p>
                    </div>
                    <Badge color="cyan" size="sm" prefixIcon={Trophy}>
                      Nilai: {card.nilai_prestasi}
                    </Badge>
                  </CardHeader>

                  <CardContent className="space-y-3 pt-1">
                    <div className="flex items-center gap-3">
                      <Avatar size="lg" status="online">
                        {card.avatar_url && <AvatarImage src={card.avatar_url} alt={card.full_name} />}
                        <AvatarFallback className="bg-emerald-100 font-black text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200">
                          {initials}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <h4 className="truncate text-sm font-extrabold text-slate-900 group-hover:text-emerald-700 dark:text-white dark:group-hover:text-emerald-400">
                          {card.full_name}
                        </h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          NIS: <span className="font-semibold">{card.nis}</span> • {card.class_name}
                        </p>
                      </div>
                    </div>

                    <div className="rounded-xl border border-emerald-100 bg-emerald-50/40 p-2.5 dark:border-slate-800 dark:bg-slate-800/50">
                      <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                        {card.nama_prestasi}
                      </p>
                      <div className="mt-1.5 flex flex-wrap items-center gap-1.5 text-[10px]">
                        <span className="rounded-md bg-emerald-100 px-2 py-0.5 font-bold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                          {card.badge_kategori}
                        </span>
                        <span className="rounded-md bg-amber-100 px-2 py-0.5 font-bold text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                          {card.tingkat_prestasi}
                        </span>
                      </div>
                    </div>
                  </CardContent>

                  <CardFooter className="pt-0">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full justify-between text-xs font-bold text-emerald-700 hover:bg-emerald-50 dark:text-emerald-400 dark:hover:bg-emerald-950/50 cursor-pointer"
                      onClick={() => handleOpenStudentDetail(card)}
                    >
                      <span>Lihat Profil Prestasi</span>
                      <Eye className="h-3.5 w-3.5" />
                    </Button>
                  </CardFooter>
                </Card>
              )
            })}
          </div>
        </div>
      )}

      {/* ── 5. MASTER DATATABLE CONTAINER (EMERALD STANDAR BENCHMARK) ── */}
      <section className="relative overflow-hidden rounded-[22px] border-2 border-emerald-300 dark:border-emerald-700/80 bg-white shadow-md shadow-emerald-500/10 dark:bg-[#1B2433]">
        {/* Toolbar Header Baris 1: Tab Switcher & Squircle Action Buttons */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-emerald-200/90 bg-gradient-to-r from-emerald-500/10 via-teal-500/5 to-transparent p-5 dark:border-emerald-800/60">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <Award className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                Rekapitulasi & Daftar Rinci Prestasi Siswa
              </h3>
              <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-bold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                {meta?.total || (details || []).length} Data
              </span>
            </div>
            <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
              Pusat data individual prestasi, perbandingan unit, dan laporan kepala sekolah terverifikasi yayasan.
            </p>
          </div>

          {/* Action Buttons: Cetak PDF, Export Excel, Detail Print */}
          <div className="flex items-center gap-2 flex-nowrap shrink-0 overflow-visible py-1">
            <SquircleActionButton
              variant="view"
              icon={Printer}
              label="Cetak / Unduh PDF Laporan"
              onClick={() => setIsPrintModalOpen(true)}
            />
            <SquircleActionButton
              variant="export"
              label="Export Data Excel (.xlsx)"
              onClick={() => setIsExportOpen(true)}
            />
            <SquircleActionButton
              variant="primary"
              label="Segarkan Data"
              onClick={fetchReport}
            />
          </div>
        </div>

        {/* Toolbar Baris 2: Search Debounced + Tab Switcher */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 p-4 bg-gradient-to-r from-emerald-50/50 via-teal-50/30 to-emerald-50/50 border-b border-emerald-200/80 dark:border-emerald-800/60">
          {/* Tab View Selector (Per Unit / Per Kepala Sekolah / Per Divisi / Rinci Siswa) */}
          <div className="flex flex-wrap items-center gap-1.5 rounded-xl bg-white p-1 dark:bg-slate-900 border border-emerald-200/60 dark:border-slate-800 shadow-xs">
            <button
              type="button"
              onClick={() => setActiveTab('unit')}
              className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-extrabold transition-all cursor-pointer ${
                activeTab === 'unit'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white'
              }`}
            >
              <Building2 className="h-3.5 w-3.5" />
              <span>Per Unit Sekolah</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('kepsek')}
              className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-extrabold transition-all cursor-pointer ${
                activeTab === 'kepsek'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white'
              }`}
            >
              <UserCheck className="h-3.5 w-3.5" />
              <span>Per Kepala Sekolah</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('divisi')}
              className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-extrabold transition-all cursor-pointer ${
                activeTab === 'divisi'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white'
              }`}
            >
              <Layers className="h-3.5 w-3.5" />
              <span>Per Divisi Pendidikan</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('details')}
              className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-extrabold transition-all cursor-pointer ${
                activeTab === 'details'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white'
              }`}
            >
              <Users className="h-3.5 w-3.5" />
              <span>Rinci Semua Siswa</span>
            </button>
          </div>

          {/* Full-width Search Bar */}
          <div className="relative min-w-[240px] flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              placeholder="Cari siswa, NIS, nama prestasi..."
              className="w-full rounded-xl border border-emerald-200/80 bg-white pl-9 pr-3 py-1.5 text-xs font-medium focus:border-emerald-600 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            />
          </div>
        </div>

        {/* ── SUB-VIEW TAB 1: REKAPITULASI PER UNIT ── */}
        {activeTab === 'unit' && (
          <div className="overflow-x-auto">
            <TableRoot fullBleed={false}>
              <TableHeader className="bg-gradient-to-r from-emerald-100/90 via-teal-50/70 to-emerald-100/90 border-b-2 border-emerald-200/90 dark:from-emerald-950/90 dark:via-teal-950/70 dark:to-emerald-950/90 text-emerald-950 dark:text-emerald-200 text-[11px] font-extrabold uppercase tracking-wider">
                <TableRow>
                  <TableHead className="py-3 px-4">Kode & Nama Unit</TableHead>
                  <TableHead className="py-3 px-4">Kepala Sekolah</TableHead>
                  <TableHead className="py-3 px-4 text-right">Total Prestasi</TableHead>
                  <TableHead className="py-3 px-4 text-right">Siswa Berprestasi</TableHead>
                  <TableHead className="py-3 px-4 text-right">Tahfizh</TableHead>
                  <TableHead className="py-3 px-4 text-right">Santri</TableHead>
                  <TableHead className="py-3 px-4 text-right">Olahraga</TableHead>
                  <TableHead className="py-3 px-4 text-right">Lomba</TableHead>
                  <TableHead className="py-3 px-4 text-right">Akademik</TableHead>
                  <TableHead className="py-3 px-4">Top Student</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-emerald-100/80 dark:divide-emerald-900/40 text-xs">
                {(unit_recaps || []).map((u) => (
                  <TableRow key={u.unit_id} className="transition hover:bg-emerald-50/30 dark:hover:bg-slate-800/50">
                    <TableCell className="py-3 px-4 font-extrabold text-slate-900 dark:text-white">
                      <span className="mr-2 rounded bg-emerald-100 px-1.5 py-0.5 text-[10px] font-bold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                        {u.unit_code}
                      </span>
                      {u.unit_name}
                    </TableCell>
                    <TableCell className="py-3 px-4 text-xs text-slate-600 dark:text-slate-300">
                      {u.principal_name}
                    </TableCell>
                    <TableCell className="py-3 px-4 text-right font-black text-emerald-600 dark:text-emerald-400">
                      {u.total_prestasi}
                    </TableCell>
                    <TableCell className="py-3 px-4 text-right font-bold text-slate-700 dark:text-slate-300">
                      {u.siswa_berprestasi_count}
                    </TableCell>
                    <TableCell className="py-3 px-4 text-right text-xs">{u.tahfizh_count}</TableCell>
                    <TableCell className="py-3 px-4 text-right text-xs">{u.santri_count}</TableCell>
                    <TableCell className="py-3 px-4 text-right text-xs">{u.olahraga_count}</TableCell>
                    <TableCell className="py-3 px-4 text-right text-xs">{u.lomba_count}</TableCell>
                    <TableCell className="py-3 px-4 text-right text-xs">{u.akademik_count}</TableCell>
                    <TableCell className="py-3 px-4">
                      {u.top_student ? (
                        <div className="flex items-center gap-2">
                          <Avatar size="xs">
                            {u.top_student.avatar_url && <AvatarImage src={u.top_student.avatar_url} alt={u.top_student.full_name} />}
                            <AvatarFallback className="bg-emerald-100 text-[10px] text-emerald-800">
                              {u.top_student.full_name[0]}
                            </AvatarFallback>
                          </Avatar>
                          <span className="truncate text-xs font-bold text-slate-800 dark:text-slate-200">
                            {u.top_student.full_name}
                          </span>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400">-</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
                {unit_recaps_total && (
                  <TableRow className="bg-emerald-50/80 font-black text-emerald-950 dark:bg-emerald-950/60 dark:text-emerald-200 border-t-2 border-emerald-300">
                    <TableCell className="py-3 px-4" colSpan={2}>{unit_recaps_total.unit_name}</TableCell>
                    <TableCell className="py-3 px-4 text-right text-sm font-black text-emerald-700 dark:text-emerald-300">{unit_recaps_total.total_prestasi}</TableCell>
                    <TableCell className="py-3 px-4 text-right">{unit_recaps_total.siswa_berprestasi_count}</TableCell>
                    <TableCell className="py-3 px-4 text-right">{unit_recaps_total.tahfizh_count}</TableCell>
                    <TableCell className="py-3 px-4 text-right">{unit_recaps_total.santri_count}</TableCell>
                    <TableCell className="py-3 px-4 text-right">{unit_recaps_total.olahraga_count}</TableCell>
                    <TableCell className="py-3 px-4 text-right">{unit_recaps_total.lomba_count}</TableCell>
                    <TableCell className="py-3 px-4 text-right">{unit_recaps_total.akademik_count}</TableCell>
                    <TableCell className="py-3 px-4">-</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </TableRoot>
          </div>
        )}

        {/* ── SUB-VIEW TAB 2: REKAPITULASI PER KEPALA SEKOLAH ── */}
        {activeTab === 'kepsek' && (
          <div className="overflow-x-auto">
            <TableRoot fullBleed={false}>
              <TableHeader className="bg-gradient-to-r from-emerald-100/90 via-teal-50/70 to-emerald-100/90 border-b-2 border-emerald-200/90 dark:from-emerald-950/90 dark:via-teal-950/70 dark:to-emerald-950/90 text-emerald-950 dark:text-emerald-200 text-[11px] font-extrabold uppercase tracking-wider">
                <TableRow>
                  <TableHead className="py-3 px-4">Pimpinan / Kepala Sekolah</TableHead>
                  <TableHead className="py-3 px-4">Unit Pendidikan</TableHead>
                  <TableHead className="py-3 px-4 text-right">Prestasi Terverifikasi</TableHead>
                  <TableHead className="py-3 px-4 text-right">Rata-rata Skor</TableHead>
                  <TableHead className="py-3 px-4">Tingkat Capaian Tertinggi</TableHead>
                  <TableHead className="py-3 px-4">Status Laporan</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-emerald-100/80 dark:divide-emerald-900/40 text-xs">
                {(kepala_sekolah_recaps || []).map((k) => (
                  <TableRow key={k.unit_id} className="transition hover:bg-emerald-50/30 dark:hover:bg-slate-800/50">
                    <TableCell className="py-3 px-4 font-extrabold text-slate-900 dark:text-white">
                      <div className="flex items-center gap-2">
                        <div className="rounded-full bg-emerald-100 p-1.5 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                          <UserCheck className="h-4 w-4" />
                        </div>
                        <span>{k.kepala_sekolah_name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="py-3 px-4 text-xs text-slate-600 dark:text-slate-300">{k.unit_name}</TableCell>
                    <TableCell className="py-3 px-4 text-right font-black text-emerald-600 dark:text-emerald-400">
                      {k.total_prestasi_diverifikasi}
                    </TableCell>
                    <TableCell className="py-3 px-4 text-right font-bold text-slate-700 dark:text-slate-300">
                      {k.skor_rata_rata}
                    </TableCell>
                    <TableCell className="py-3 px-4">
                      <Badge color="purple" size="sm">
                        {k.tingkat_tertinggi}
                      </Badge>
                    </TableCell>
                    <TableCell className="py-3 px-4">
                      <Badge color="emerald" size="sm" prefixIcon={CheckCircle2}>
                        {k.status_laporan}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </TableRoot>
          </div>
        )}

        {/* ── SUB-VIEW TAB 3: KONSOLIDASI DIVISI PENDIDIKAN ── */}
        {activeTab === 'divisi' && (
          <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <div className="rounded-2xl border-2 border-emerald-100 bg-emerald-50/20 p-5 dark:border-slate-800 dark:bg-slate-800/40">
                <h4 className="text-xs font-extrabold text-slate-800 dark:text-slate-200 mb-3">
                  Distribusi Prestasi Berdasarkan Kategori
                </h4>
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieCategoryData}
                        dataKey="count"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      >
                        {pieCategoryData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color || '#10B981'} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="rounded-2xl border-2 border-emerald-100 bg-emerald-50/20 p-5 dark:border-slate-800 dark:bg-slate-800/40">
                <h4 className="text-xs font-extrabold text-slate-800 dark:text-slate-200 mb-3">
                  Perbandingan Total Prestasi per Unit Pendidikan
                </h4>
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={unitComparisonData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                      <XAxis dataKey="unit_code" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="total_prestasi" name="Total Prestasi" fill="#0E5C44" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="tahfizh" name="Tahfizh" fill="#10B981" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="akademik" name="Akademik" fill="#EC4899" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── SUB-VIEW TAB 4 / DEFAULT: DAFTAR RINCI SISWA ── */}
        {(activeTab === 'details' || activeTab === 'unit') && (
          <div className="border-t border-emerald-200/70 dark:border-emerald-800/60">
            <div className="p-4 bg-emerald-50/30 dark:bg-emerald-950/20 flex items-center justify-between">
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-emerald-900 dark:text-emerald-200">
                Daftar Rinci Profil Prestasi Siswa Terverifikasi
              </h4>
              <span className="text-[11px] font-bold text-slate-500">
                Halaman {meta?.current_page || 1} dari {meta?.last_page || 1}
              </span>
            </div>

            <div className="overflow-x-auto">
              <TableRoot fullBleed={false}>
                <TableHeader className="bg-gradient-to-r from-emerald-100/90 via-teal-50/70 to-emerald-100/90 border-b-2 border-emerald-200/90 dark:from-emerald-950/90 dark:via-teal-950/70 dark:to-emerald-950/90 text-emerald-950 dark:text-emerald-200 text-[11px] font-extrabold uppercase tracking-wider">
                  <TableRow>
                    <TableHead className="py-3 px-4">Profil & Nama Siswa</TableHead>
                    <TableHead className="py-3 px-4">Unit & Kelas</TableHead>
                    <TableHead className="py-3 px-4">Nama Prestasi</TableHead>
                    <TableHead className="py-3 px-4">Tingkat & Kategori</TableHead>
                    <TableHead className="py-3 px-4 text-right">Tanggal & Nilai</TableHead>
                    <TableHead className="py-3 px-4 text-center">Aksi</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody className="divide-y divide-emerald-100/80 dark:divide-emerald-900/40 text-xs">
                  {(details || []).map((row) => {
                    const initials = row.student_name
                      ? row.student_name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase()
                      : 'SW'
                    const categoryStyle = CATEGORY_COLORS[row.jenis_prestasi] || CATEGORY_COLORS.akademik
                    const levelConfig = TINGKAT_BADGES[row.tingkat_prestasi] || TINGKAT_BADGES['Internal Sekolah']

                    return (
                      <TableRow
                        key={row.id}
                        className="transition hover:bg-emerald-50/30 dark:hover:bg-slate-800/50"
                      >
                        {/* Student Profil with TailGrids Avatar */}
                        <TableCell className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <Avatar size="md" status="online">
                              {row.avatar_url && <AvatarImage src={row.avatar_url} alt={row.student_name} />}
                              <AvatarFallback className="bg-emerald-100 font-extrabold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200">
                                {initials}
                              </AvatarFallback>
                            </Avatar>
                            <div className="min-w-0">
                              <span className="block font-extrabold text-slate-900 dark:text-white">
                                {row.student_name}
                              </span>
                              <span className="block text-xs text-slate-500 font-mono">
                                NIS: {row.nis}
                              </span>
                            </div>
                          </div>
                        </TableCell>

                        <TableCell className="py-3 px-4">
                          <div>
                            <Badge color="emerald" size="sm">
                              {row.unit_code}
                            </Badge>
                            <span className="block mt-1 text-xs text-slate-500">
                              {row.class_name}
                            </span>
                          </div>
                        </TableCell>

                        <TableCell className="py-3 px-4">
                          <span className="font-bold text-slate-900 dark:text-white block">
                            {row.nama_prestasi}
                          </span>
                          <span className="text-xs text-slate-400">
                            {row.tahun_ajaran}
                          </span>
                        </TableCell>

                        <TableCell className="py-3 px-4">
                          <div className="flex flex-wrap items-center gap-1.5">
                            <Badge color={categoryStyle.badgeColor} size="sm">
                              {row.jenis_prestasi}
                            </Badge>
                            <Badge color={levelConfig.color} size="sm">
                              {row.tingkat_prestasi}
                            </Badge>
                          </div>
                        </TableCell>

                        <TableCell className="py-3 px-4 text-right">
                          <span className="block font-mono text-xs text-slate-500">
                            {row.tanggal_prestasi}
                          </span>
                          <span className="block font-extrabold text-sm text-emerald-600 dark:text-emerald-400">
                            Skor: {row.nilai_prestasi}
                          </span>
                        </TableCell>

                        <TableCell className="py-3 px-4 text-center">
                          <Button
                            size="xs"
                            variant="ghost"
                            onClick={() => handleOpenStudentDetail(row)}
                            className="rounded-xl font-bold hover:bg-emerald-50 text-emerald-700 dark:text-emerald-400 cursor-pointer"
                          >
                            <Eye className="size-3.5 mr-1" /> Detail
                          </Button>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </TableRoot>
            </div>

            {/* TailGrids Pagination */}
            {meta && meta.last_page > 1 && (
              <div className="w-full border-t border-emerald-200/80 p-4 dark:border-slate-800">
                <Pagination
                  currentPage={meta.current_page}
                  totalPages={meta.last_page}
                  onPageChange={(page) => handleFilterChange('page', page)}
                  sideLayout="full"
                />
              </div>
            )}
          </div>
        )}
      </section>

      {/* ── 6. EXECUTIVE INSIGHTS ALERTS ── */}
      <div className="space-y-3">
        {(insights || []).map((ins, idx) => (
          <Alert key={idx} status={ins.type === 'success' ? 'success' : ins.type === 'warning' ? 'warning' : 'info'}>
            <AlertIndicator />
            <AlertContent>
              <AlertTitle>{ins.title}</AlertTitle>
              <AlertDescription>{ins.description}</AlertDescription>
            </AlertContent>
          </Alert>
        ))}
      </div>

      {/* ── 7. STUDENT PROFILE DETAIL DIALOG MODAL ── */}
      {isDetailModalOpen && selectedStudentDetail && (
        <Dialog
          open={isDetailModalOpen}
          onOpenChange={setIsDetailModalOpen}
          modalClassName="z-[70] bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-3 sm:p-5"
          className="w-full max-w-lg p-0 rounded-3xl overflow-hidden bg-white dark:bg-[#1B2433] border-2 border-emerald-500/30 shadow-2xl"
        >
          <div className="h-1.5 bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-600 shrink-0" />
          <div className="p-6">
            <DialogHeader className="pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-md shadow-emerald-500/20">
                  <Trophy className="h-5 w-5" />
                </div>
                <div>
                  <DialogTitle className="text-base font-black text-slate-900 dark:text-white">
                    Profil Prestasi Siswa
                  </DialogTitle>
                  <DialogDescription className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Detail biodata dan riwayat pencapaian prestasi siswa terverifikasi di bawah Yayasan.
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>

            <DialogBody className="space-y-4 py-4 text-xs">
              <div className="flex items-center gap-4 rounded-xl border border-emerald-100 bg-emerald-50/40 p-4 dark:border-slate-800 dark:bg-slate-800/60">
                <Avatar size="xl" status="online">
                  {selectedStudentDetail.student?.avatar_url && (
                    <AvatarImage
                      src={selectedStudentDetail.student.avatar_url}
                      alt={selectedStudentDetail.student.full_name}
                    />
                  )}
                  <AvatarFallback className="bg-emerald-200 text-xl font-black text-emerald-900 dark:bg-emerald-950 dark:text-emerald-100">
                    {selectedStudentDetail.student?.full_name
                      ? selectedStudentDetail.student.full_name.slice(0, 2).toUpperCase()
                      : 'SW'}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <h4 className="text-sm font-black text-slate-900 dark:text-white">
                    {selectedStudentDetail.student?.full_name || selectedStudentDetail.student_name}
                  </h4>
                  <p className="font-mono text-xs text-slate-500 dark:text-slate-400">
                    NIS: {selectedStudentDetail.student?.nis || selectedStudentDetail.nis}
                  </p>
                  <p className="mt-0.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                    {selectedStudentDetail.unit_name} — {selectedStudentDetail.class_name}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="rounded-xl border border-slate-100 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-800/40">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Nama Prestasi</span>
                  <span className="mt-0.5 block font-extrabold text-slate-800 dark:text-slate-200">
                    {selectedStudentDetail.nama_prestasi}
                  </span>
                </div>
                <div className="rounded-xl border border-slate-100 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-800/40">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Tingkat Prestasi</span>
                  <span className="mt-0.5 block font-extrabold text-slate-800 dark:text-slate-200">
                    {selectedStudentDetail.tingkat_prestasi}
                  </span>
                </div>
                <div className="rounded-xl border border-slate-100 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-800/40">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Kategori / Bidang</span>
                  <span className="mt-0.5 block font-extrabold text-slate-800 dark:text-slate-200">
                    {selectedStudentDetail.jenis_prestasi}
                  </span>
                </div>
                <div className="rounded-xl border border-slate-100 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-800/40">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Tanggal Diperoleh</span>
                  <span className="mt-0.5 block font-mono font-bold text-slate-800 dark:text-slate-200">
                    {selectedStudentDetail.tanggal_prestasi || selectedStudentDetail.tanggal_prestasi_formatted || '-'}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between rounded-xl bg-emerald-50 p-3 dark:bg-emerald-950/40 border border-emerald-200/60 dark:border-emerald-800/60">
                <span className="text-xs font-extrabold text-emerald-900 dark:text-emerald-200">Total Nilai Poin Prestasi</span>
                <span className="text-lg font-black text-emerald-700 dark:text-emerald-300">
                  {selectedStudentDetail.nilai_prestasi || 0} Poin
                </span>
              </div>

              <div className="pt-1">
                <span className="text-xs font-bold text-slate-500">Keterangan / Catatan Apresiasi</span>
                <p className="mt-1 rounded-lg bg-slate-50 p-2 text-xs text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                  {selectedStudentDetail.keterangan || 'Tidak ada keterangan tambahan.'}
                </p>
              </div>
            </DialogBody>

            <DialogFooter className="pt-3 border-t border-slate-100 dark:border-slate-800">
              <DialogClose asChild>
                <Button variant="ghost" size="sm" className="rounded-xl font-bold cursor-pointer">
                  Tutup Profil
                </Button>
              </DialogClose>
            </DialogFooter>
          </div>
        </Dialog>
      )}

      {/* ── 8. PRINT & EXPORT MODALS ── */}
      <PrintOptionModal
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
        onPrint={handlePrintClean}
        onDownloadPdf={handleDownloadPdf}
        title="Cetak Laporan Rekapitulasi Prestasi Siswa"
      />

      {isExportOpen && (
        <ReportExportModal
          isOpen={isExportOpen}
          onClose={() => setIsExportOpen(false)}
          onExport={handleConfirmExport}
          title="Export Laporan Rekapitulasi Prestasi Siswa"
        />
      )}
    </PageContainer>
  )
}
