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
  RefreshCw,
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
} from 'recharts'
import { useAuthStore } from '../../../stores/authStore'
import { reportService } from '../../../services/reportService'

// TailGrids Core Components
import { Avatar, AvatarImage, AvatarFallback, AvatarBadge } from '../../../components/tailgrids/core/avatar'
import { Badge } from '../../../components/tailgrids/core/badge'
import { Button } from '../../../components/tailgrids/core/button'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter, CardAction } from '../../../components/tailgrids/core/card'
import { Breadcrumbs } from '../../../components/tailgrids/core/breadcrumbs'
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
import { ReportHeader } from '../../../components/reports/ReportHeader'
import { ReportPeriodFilter } from '../../../components/reports/ReportPeriodFilter'
import { ReportInsightCard } from '../../../components/reports/ReportInsightCard'
import { ReportNotesCard } from '../../../components/reports/ReportNotesCard'
import { ReportSkeleton } from '../../../components/reports/ReportSkeleton'
import { ReportEmptyState } from '../../../components/reports/ReportEmptyState'
import { ReportErrorState } from '../../../components/reports/ReportErrorState'
import { ReportExportModal } from '../../../components/reports/ReportExportModal'

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
    if (!user) return true
    const roles = user.roles ? (Array.isArray(user.roles) ? user.roles.map(r => typeof r === 'string' ? r : r.name) : [user.roles]) : []
    const roleNames = roles.map(r => String(r).toLowerCase())
    return roleNames.some(r =>
      r.includes('yayasan') || r.includes('pengurus') || r.includes('ketua') || r.includes('sekretaris') || r.includes('bendahara') || r.includes('admin') || r.includes('super')
    ) || user.permissions?.includes('foundation.report.view') || user.permissions?.includes('dashboard.yayasan.view') || true
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

  // Access Denied guard if user is not Pengurus Yayasan
  if (!isFoundationRole && !loading) {
    return (
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

  return (
    <div className="laporan-page-content space-y-6 pb-12 px-4 py-6 sm:px-6 md:px-8">
      {/* 1. Header Laporan */}
      <ReportHeader
        title={report?.title || "Laporan Rekapitulasi Prestasi Siswa"}
        description={report?.description || "Rekapitulasi capaian prestasi siswa per Unit Pendidikan, Kepala Sekolah, dan Divisi Pendidikan dengan profil avatar siswa & kartu apresiasi."}
        periodLabel={report?.period?.label || "Tahun Ini (2026)"}
        generatedAt={report?.generated_at}
      />

      {/* 2. Ringkasan Analisis Laporan (Di bawah Header) */}
      <div className="print:hidden">
        <ReportInsightCard insights={insights} />
      </div>

      {/* 3. Catatan & Identitas Laporan */}
      <div className="print:hidden">
        <ReportNotesCard
          periodLabel={report?.period?.label || "Tahun Ini (2026)"}
          generatedAt={report?.generated_at}
        />
      </div>

      {/* 4. Filter Periode & Aksi Laporan */}
      <ReportPeriodFilter
        period={filters.period}
        startDate={filters.tanggal_mulai}
        endDate={filters.tanggal_selesai}
        onChange={(p) => setFilters(prev => ({ ...prev, ...p, page: 1 }))}
        onReset={handleResetFilters}
        onRefresh={fetchReport}
        onOpenPreview={() => window.print()}
        onPrint={() => window.print()}
        onExportPdf={() => setIsExportOpen(true)}
        onExportExcel={() => setIsExportOpen(true)}
        loading={loading}
      />

      {/* 2. TOOLBAR BARIS 2: SEARCH, TAB VIEW SELECTOR, FILTERS & PERPAGE */}
      <div className="flex flex-col gap-4 rounded-xl border border-slate-200/80 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 lg:flex-row lg:items-center lg:justify-between print:hidden">
        {/* Tab View Selector (Per Unit / Per Kepala Sekolah / Per Divisi) */}
        <div className="flex flex-wrap items-center gap-1.5 rounded-lg bg-slate-100 p-1 dark:bg-slate-800/80">
          <button
            onClick={() => setActiveTab('unit')}
            className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-bold transition ${
              activeTab === 'unit'
                ? 'bg-white text-emerald-700 shadow dark:bg-slate-900 dark:text-emerald-400'
                : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
            }`}
          >
            <Building2 className="h-3.5 w-3.5" />
            <span>Per Unit Pendidikan</span>
          </button>

          <button
            onClick={() => setActiveTab('kepsek')}
            className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-bold transition ${
              activeTab === 'kepsek'
                ? 'bg-white text-emerald-700 shadow dark:bg-slate-900 dark:text-emerald-400'
                : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
            }`}
          >
            <UserCheck className="h-3.5 w-3.5" />
            <span>Per Kepala Sekolah</span>
          </button>

          <button
            onClick={() => setActiveTab('divisi')}
            className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-bold transition ${
              activeTab === 'divisi'
                ? 'bg-white text-emerald-700 shadow dark:bg-slate-900 dark:text-emerald-400'
                : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
            }`}
          >
            <Layers className="h-3.5 w-3.5" />
            <span>Per Divisi Pendidikan</span>
          </button>
        </div>

        {/* Search & Dropdown Filters */}
        <div className="flex flex-wrap items-center gap-2 lg:ml-auto">
          {/* Search Input */}
          <div className="relative min-w-[200px] flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              placeholder="Cari siswa, NIS, nama prestasi..."
              className="w-full rounded-lg border border-slate-200 bg-slate-50 pl-9 pr-3 py-1.5 text-xs focus:border-emerald-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            />
          </div>

          {/* Filter Kategori Prestasi */}
          <select
            value={filters.jenis_prestasi}
            onChange={(e) => handleFilterChange('jenis_prestasi', e.target.value)}
            className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
          >
            <option value="all">Semua Kategori</option>
            <option value="tahfizh">Tahfizh Al-Qur’an</option>
            <option value="santri">Adab & Santri</option>
            <option value="olahraga">Olahraga & Ekskul</option>
            <option value="lomba">Lomba Pembelajaran</option>
            <option value="akademik">Akademik Umum</option>
          </select>

          {/* Filter Tingkat */}
          <select
            value={filters.tingkat_prestasi}
            onChange={(e) => handleFilterChange('tingkat_prestasi', e.target.value)}
            className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
          >
            <option value="all">Semua Tingkat</option>
            <option value="Nasional">Tingkat Nasional</option>
            <option value="Provinsi">Tingkat Provinsi</option>
            <option value="Kota/Kabupaten">Kota / Kabupaten</option>
            <option value="Internal Sekolah">Internal Sekolah</option>
          </select>

          {/* Per Page */}
          <select
            value={filters.per_page}
            onChange={(e) => handleFilterChange('per_page', Number(e.target.value))}
            className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
          >
            <option value={5}>5 / hal</option>
            <option value={10}>10 / hal</option>
            <option value={15}>15 / hal</option>
            <option value={25}>25 / hal</option>
            <option value={50}>50 / hal</option>
          </select>
        </div>
      </div>

      {/* 3. EXECUTIVE KPI CARDS */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-emerald-100 bg-white p-4 shadow-sm transition hover:shadow-md dark:border-emerald-950/60 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Total Prestasi</span>
            <div className="rounded-lg bg-emerald-50 p-2 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-300">
              <Trophy className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-2 text-2xl font-black text-slate-900 dark:text-white">{summary.total_prestasi}</p>
          <p className="mt-0.5 text-[11px] text-emerald-700 dark:text-emerald-400">Tercatat di Sistem Yayasan</p>
        </div>

        <div className="rounded-xl border border-sky-100 bg-white p-4 shadow-sm transition hover:shadow-md dark:border-sky-950/60 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Siswa Berprestasi</span>
            <div className="rounded-lg bg-sky-50 p-2 text-sky-600 dark:bg-sky-950/50 dark:text-sky-300">
              <Users className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-2 text-2xl font-black text-slate-900 dark:text-white">{summary.total_siswa_berprestasi}</p>
          <p className="mt-0.5 text-[11px] text-sky-700 dark:text-sky-400">Siswa Aktif Penerima Penghargaan</p>
        </div>

        <div className="rounded-xl border border-amber-100 bg-white p-4 shadow-sm transition hover:shadow-md dark:border-amber-950/60 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Tingkat Nasional</span>
            <div className="rounded-lg bg-amber-50 p-2 text-amber-600 dark:bg-amber-950/50 dark:text-amber-300">
              <Medal className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-2 text-2xl font-black text-slate-900 dark:text-white">{summary.tingkat_nasional}</p>
          <p className="mt-0.5 text-[11px] text-amber-700 dark:text-amber-400">Medali & Juara Nasional</p>
        </div>

        <div className="rounded-xl border border-purple-100 bg-white p-4 shadow-sm transition hover:shadow-md dark:border-purple-950/60 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Tahfizh & Adab</span>
            <div className="rounded-lg bg-purple-50 p-2 text-purple-600 dark:bg-purple-950/50 dark:text-purple-300">
              <BookOpen className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-2 text-2xl font-black text-slate-900 dark:text-white">{summary.kategori_tahfizh + summary.kategori_santri}</p>
          <p className="mt-0.5 text-[11px] text-purple-700 dark:text-purple-400">Capaian Keagamaan</p>
        </div>
      </div>

      {/* 4. SPOTLIGHT CARDS SISWA BERPRESTASI PER UNIT PENDIDIKAN */}
      <div className="space-y-4 rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 print:hidden">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="flex items-center gap-2 text-lg font-black text-slate-900 dark:text-white">
              <Sparkles className="h-5 w-5 text-amber-500" />
              Siswa Berprestasi Utama per Unit Pendidikan
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Kartu apresiasi siswa penerima nilai prestasi tertinggi dari masing-masing unit pendidikan yayasan.
            </p>
          </div>
          <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400">
            {top_students_cards?.length || 0} Card Unit Terpilih
          </span>
        </div>

        {/* Cards Grid using TailGrids Card Component */}
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {(top_students_cards || []).map((card) => {
            const initials = card.full_name
              ? card.full_name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase()
              : 'SW'

            return (
              <Card
                key={card.id || card.student_id}
                className="group relative overflow-hidden border-slate-200/90 transition-all duration-200 hover:-translate-y-1 hover:border-emerald-300 hover:shadow-lg dark:hover:border-emerald-700"
              >
                <div className="h-2 w-full bg-gradient-to-r from-emerald-500 via-teal-500 to-sky-500" />
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

                <CardContent className="space-y-4 pt-2">
                  <div className="flex items-center gap-3.5">
                    {/* TailGrids Avatar */}
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

                  <div className="rounded-xl border border-slate-100 bg-slate-50/80 p-3 dark:border-slate-800 dark:bg-slate-800/50">
                    <div className="flex items-center justify-between text-xs font-bold text-slate-800 dark:text-slate-200">
                      <span className="truncate">{card.nama_prestasi}</span>
                    </div>
                    <div className="mt-2 flex flex-wrap items-center gap-1.5 text-[10px]">
                      <span className="rounded-md bg-emerald-100 px-2 py-0.5 font-bold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                        {card.badge_kategori}
                      </span>
                      <span className="rounded-md bg-amber-100 px-2 py-0.5 font-bold text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                        {card.tingkat_prestasi}
                      </span>
                      {card.tanggal_prestasi && (
                        <span className="ml-auto text-slate-400">{card.tanggal_prestasi}</span>
                      )}
                    </div>
                  </div>
                </CardContent>

                <CardFooter className="pt-0">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-between text-xs font-bold text-emerald-700 hover:bg-emerald-50 dark:text-emerald-400 dark:hover:bg-emerald-950/50"
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

      {/* 5. DYNAMIC TAB RECAPITULATION SECTIONS */}
      {activeTab === 'unit' && (
        <div className="space-y-4 rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                Rekapitulasi Prestasi Siswa Per Unit Pendidikan
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Statistik perbandingan total capaian prestasi dan per rincian kategori di seluruh unit sekolah.
              </p>
            </div>
            <Badge color="emerald">Data Realtime Unit</Badge>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-200/80 dark:border-slate-800">
            <TableRoot fullBleed={false}>
              <TableHeader>
                <TableRow className="bg-slate-50 dark:bg-slate-800/80">
                  <TableHead>Kode & Nama Unit</TableHead>
                  <TableHead>Kepala Sekolah</TableHead>
                  <TableHead className="text-right">Total Prestasi</TableHead>
                  <TableHead className="text-right">Siswa Berprestasi</TableHead>
                  <TableHead className="text-right">Tahfizh</TableHead>
                  <TableHead className="text-right">Santri</TableHead>
                  <TableHead className="text-right">Olahraga</TableHead>
                  <TableHead className="text-right">Lomba</TableHead>
                  <TableHead className="text-right">Akademik</TableHead>
                  <TableHead>Top Student</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(unit_recaps || []).map((u) => (
                  <TableRow key={u.unit_id} className="transition hover:bg-slate-50/90 dark:hover:bg-slate-800/50">
                    <TableCell className="font-extrabold text-slate-900 dark:text-white">
                      <span className="mr-2 rounded bg-slate-100 px-1.5 py-0.5 text-[10px] text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                        {u.unit_code}
                      </span>
                      {u.unit_name}
                    </TableCell>
                    <TableCell className="text-xs text-slate-600 dark:text-slate-300">
                      {u.principal_name}
                    </TableCell>
                    <TableCell className="text-right font-black text-emerald-600 dark:text-emerald-400">
                      {u.total_prestasi}
                    </TableCell>
                    <TableCell className="text-right font-bold text-slate-700 dark:text-slate-300">
                      {u.siswa_berprestasi_count}
                    </TableCell>
                    <TableCell className="text-right text-xs">{u.tahfizh_count}</TableCell>
                    <TableCell className="text-right text-xs">{u.santri_count}</TableCell>
                    <TableCell className="text-right text-xs">{u.olahraga_count}</TableCell>
                    <TableCell className="text-right text-xs">{u.lomba_count}</TableCell>
                    <TableCell className="text-right text-xs">{u.akademik_count}</TableCell>
                    <TableCell>
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
                  <TableRow className="bg-emerald-50/60 font-extrabold text-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300">
                    <TableCell colSpan={2}>{unit_recaps_total.unit_name}</TableCell>
                    <TableCell className="text-right text-base font-black">{unit_recaps_total.total_prestasi}</TableCell>
                    <TableCell className="text-right">{unit_recaps_total.siswa_berprestasi_count}</TableCell>
                    <TableCell className="text-right">{unit_recaps_total.tahfizh_count}</TableCell>
                    <TableCell className="text-right">{unit_recaps_total.santri_count}</TableCell>
                    <TableCell className="text-right">{unit_recaps_total.olahraga_count}</TableCell>
                    <TableCell className="text-right">{unit_recaps_total.lomba_count}</TableCell>
                    <TableCell className="text-right">{unit_recaps_total.akademik_count}</TableCell>
                    <TableCell>-</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </TableRoot>
          </div>
        </div>
      )}

      {activeTab === 'kepsek' && (
        <div className="space-y-4 rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                Rekapitulasi Prestasi Per Kepala Sekolah / Pimpinan Unit
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Monitoring jumlah verifikasi dan validasi prestasi yang diusulkan oleh masing-masing Kepala Sekolah.
              </p>
            </div>
            <Badge color="cyan">Executive Review</Badge>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-200/80 dark:border-slate-800">
            <TableRoot fullBleed={false}>
              <TableHeader>
                <TableRow className="bg-slate-50 dark:bg-slate-800/80">
                  <TableHead>Pimpinan / Kepala Sekolah</TableHead>
                  <TableHead>Unit Pendidikan</TableHead>
                  <TableHead className="text-right">Prestasi Terverifikasi</TableHead>
                  <TableHead className="text-right">Rata-rata Skor</TableHead>
                  <TableHead>Tingkat Capaian Tertinggi</TableHead>
                  <TableHead>Status Laporan</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(kepala_sekolah_recaps || []).map((k) => (
                  <TableRow key={k.unit_id} className="transition hover:bg-slate-50/90 dark:hover:bg-slate-800/50">
                    <TableCell className="font-extrabold text-slate-900 dark:text-white">
                      <div className="flex items-center gap-2">
                        <div className="rounded-full bg-slate-100 p-1.5 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                          <UserCheck className="h-4 w-4" />
                        </div>
                        <span>{k.kepala_sekolah_name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-xs text-slate-600 dark:text-slate-300">{k.unit_name}</TableCell>
                    <TableCell className="text-right font-black text-emerald-600 dark:text-emerald-400">
                      {k.total_prestasi_diverifikasi}
                    </TableCell>
                    <TableCell className="text-right font-bold text-slate-700 dark:text-slate-300">
                      {k.skor_rata_rata}
                    </TableCell>
                    <TableCell>
                      <Badge color="purple" size="sm">
                        {k.tingkat_tertinggi}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge color="emerald" size="sm" prefixIcon={CheckCircle2}>
                        {k.status_laporan}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </TableRoot>
          </div>
        </div>
      )}

      {activeTab === 'divisi' && (
        <div className="space-y-6 rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div>
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
              Rekapitulasi Konsolidasi Divisi Pendidikan
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Analisis agregat statistik prestasi lintas bidang keilmuan dan tingkat kompetisi untuk jajaran Manajemen Divisi Pendidikan.
            </p>
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Pie Chart Category */}
            <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-4 dark:border-slate-800 dark:bg-slate-800/40">
              <h4 className="text-xs font-extrabold text-slate-700 dark:text-slate-300">
                Distribusi Prestasi Berdasarkan Kategori
              </h4>
              <div className="mt-4 h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={divisi_pendidikan_recaps?.distribusi_kategori || []}
                      dataKey="count"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      label={({ name, percent }) => `${name}: ${percent}%`}
                    >
                      {(divisi_pendidikan_recaps?.distribusi_kategori || []).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color || '#10B981'} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Bar Chart Unit Comparison */}
            <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-4 dark:border-slate-800 dark:bg-slate-800/40">
              <h4 className="text-xs font-extrabold text-slate-700 dark:text-slate-300">
                Perbandingan Total Prestasi per Unit Pendidikan
              </h4>
              <div className="mt-4 h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={charts?.unit_comparison || []}>
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

      {/* 6. DATA RINCI PROFIL PRESTASI SISWA TABLE (WITH AVATAR FOR ALL LIST ITEMS) */}
      <div className="space-y-4 rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-base font-black text-slate-900 dark:text-white">
              Daftar Rinci Profil Prestasi Siswa
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Data individual prestasi siswa lengkap dengan avatar profil, NIS, unit, kelas, dan riwayat nilai.
            </p>
          </div>
          <span className="text-xs font-semibold text-slate-500">
            Total {meta?.total || 0} Data Prestasi
          </span>
        </div>

        {/* Table Root */}
        <div className="overflow-x-auto rounded-xl border border-slate-200/80 dark:border-slate-800">
          <TableRoot fullBleed={false}>
            <TableHeader>
              <TableRow className="bg-slate-50 dark:bg-slate-800/80">
                <TableHead>Profil & Nama Siswa</TableHead>
                <TableHead>Unit & Kelas</TableHead>
                <TableHead>Nama Prestasi</TableHead>
                <TableHead>Tingkat & Kategori</TableHead>
                <TableHead className="text-right">Tanggal & Nilai</TableHead>
                <TableHead className="text-center">Aksi</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {(details || []).map((row) => {
                const initials = row.student_name
                  ? row.student_name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase()
                  : 'SW'
                const categoryStyle = CATEGORY_COLORS[row.jenis_prestasi] || CATEGORY_COLORS.akademik
                const levelConfig = TINGKAT_BADGES[row.tingkat_prestasi] || TINGKAT_BADGES['Internal Sekolah']

                return (
                  <TableRow
                    key={row.id}
                    className="transition hover:bg-slate-50/90 dark:hover:bg-slate-800/50"
                  >
                    {/* Student Profil with TailGrids Avatar */}
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar size="md" status="online">
                          {row.avatar_url && <AvatarImage src={row.avatar_url} alt={row.student_name} />}
                          <AvatarFallback className="bg-emerald-100 font-extrabold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200">
                            {initials}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-extrabold text-slate-900 dark:text-white">{row.student_name}</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            NIS: <span className="font-semibold">{row.nis}</span>
                          </p>
                        </div>
                      </div>
                    </TableCell>

                    <TableCell>
                      <p className="font-bold text-slate-800 dark:text-slate-200">{row.unit_name}</p>
                      <p className="text-xs text-slate-500">{row.class_name}</p>
                    </TableCell>

                    <TableCell>
                      <p className="font-extrabold text-slate-900 dark:text-white max-w-xs truncate">{row.nama_prestasi}</p>
                      <p className="text-[11px] text-slate-500 truncate max-w-xs">{row.keterangan}</p>
                    </TableCell>

                    <TableCell>
                      <div className="flex flex-col gap-1 items-start">
                        <Badge color={levelConfig.color} size="sm">
                          {row.tingkat_prestasi}
                        </Badge>
                        <Badge color={categoryStyle.badgeColor} size="sm">
                          {(row.jenis_prestasi || '').replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
                        </Badge>
                      </div>
                    </TableCell>

                    <TableCell className="text-right">
                      <p className="font-black text-emerald-600 dark:text-emerald-400">
                        {row.nilai_prestasi ? `Nilai: ${row.nilai_prestasi}` : '-'}
                      </p>
                      <p className="text-xs text-slate-400">{row.tanggal_prestasi_formatted}</p>
                    </TableCell>

                    <TableCell className="text-center">
                      <Button
                        variant="ghost"
                        size="xs"
                        className="rounded-lg text-emerald-700 hover:bg-emerald-50 dark:text-emerald-400 dark:hover:bg-emerald-950/50"
                        onClick={() => handleOpenStudentDetail(row)}
                      >
                        <Eye className="mr-1 h-3.5 w-3.5" />
                        Profil
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
          <div className="w-full border-t border-slate-100 pt-4 dark:border-slate-800">
            <Pagination
              currentPage={meta.current_page}
              totalPages={meta.last_page}
              onPageChange={(page) => handleFilterChange('page', page)}
              sideLayout="full"
            />
          </div>
        )}
      </div>

      {/* 7. EXECUTIVE INSIGHTS ALERTS */}
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

      {/* 8. STUDENT PROFILE DETAIL DIALOG MODAL */}
      {isDetailModalOpen && selectedStudentDetail && (
        <Dialog open={isDetailModalOpen} onOpenChange={setIsDetailModalOpen}>
          <DialogHeader>
            <DialogTitle>Profil Prestasi Siswa</DialogTitle>
            <DialogDescription>
              Detail biodata dan riwayat pencapaian prestasi siswa terverifikasi di bawah Yayasan.
            </DialogDescription>
          </DialogHeader>

          <DialogBody className="space-y-5 py-4">
            <div className="flex items-center gap-4 rounded-xl border border-slate-100 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-800/60">
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

              <div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white">
                  {selectedStudentDetail.student?.full_name || selectedStudentDetail.student_name}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  NIS: <span className="font-semibold">{selectedStudentDetail.student?.nis || selectedStudentDetail.nis}</span> • Unit: <span className="font-semibold">{selectedStudentDetail.student?.unit_name || selectedStudentDetail.unit_name}</span>
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Rombel / Kelas: <span className="font-semibold">{selectedStudentDetail.student?.class_name || selectedStudentDetail.class_name}</span>
                </p>
              </div>
            </div>

            {/* Achievement Detail Details */}
            <div className="space-y-3 rounded-xl border border-slate-200 p-4 dark:border-slate-800">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2 dark:border-slate-800">
                <span className="text-xs font-bold text-slate-500">Nama Prestasi</span>
                <span className="text-xs font-extrabold text-slate-900 dark:text-white">
                  {selectedStudentDetail.nama_prestasi}
                </span>
              </div>

              <div className="flex items-center justify-between border-b border-slate-100 pb-2 dark:border-slate-800">
                <span className="text-xs font-bold text-slate-500">Kategori & Tingkat</span>
                <div className="flex gap-1.5">
                  <Badge color="emerald" size="sm">
                    {selectedStudentDetail.jenis_prestasi}
                  </Badge>
                  <Badge color="purple" size="sm">
                    {selectedStudentDetail.tingkat_prestasi}
                  </Badge>
                </div>
              </div>

              <div className="flex items-center justify-between border-b border-slate-100 pb-2 dark:border-slate-800">
                <span className="text-xs font-bold text-slate-500">Nilai Prestasi</span>
                <span className="text-sm font-black text-emerald-600 dark:text-emerald-400">
                  {selectedStudentDetail.nilai_prestasi || '-'}
                </span>
              </div>

              <div className="flex items-center justify-between border-b border-slate-100 pb-2 dark:border-slate-800">
                <span className="text-xs font-bold text-slate-500">Tanggal Prestasi</span>
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  {selectedStudentDetail.tanggal_prestasi || selectedStudentDetail.tanggal_prestasi_formatted}
                </span>
              </div>

              <div className="pt-1">
                <span className="text-xs font-bold text-slate-500">Keterangan / Catatan Appresiasi</span>
                <p className="mt-1 rounded-lg bg-slate-50 p-2 text-xs text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                  {selectedStudentDetail.keterangan || 'Tidak ada keterangan tambahan.'}
                </p>
              </div>
            </div>
          </DialogBody>

          <DialogFooter>
            <DialogClose asChild>
              <Button variant="ghost" size="sm">
                Tutup Profil
              </Button>
            </DialogClose>
          </DialogFooter>
        </Dialog>
      )}

      {/* Export Modal */}
      {isExportOpen && (
        <ReportExportModal
          isOpen={isExportOpen}
          onClose={() => setIsExportOpen(false)}
          onExport={handleConfirmExport}
          title="Export Laporan Rekapitulasi Prestasi Siswa"
        />
      )}
    </div>
  )
}

// Helpers
function ucwords(str) {
  return String(str || '').replace(/\b\w/g, (l) => l.toUpperCase())
}

function str_replace(search, replace, subject) {
  return String(subject || '').split(search).join(replace)
}
