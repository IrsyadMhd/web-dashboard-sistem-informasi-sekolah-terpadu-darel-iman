import React, { useState, useEffect } from 'react'
import {
  Building2,
  Users,
  GraduationCap,
  ArrowRightLeft,
  Award,
  School,
  Scale,
  TrendingUp,
  Sparkles,
  Printer,
  RefreshCw,
  RotateCcw,
  Filter,
  Layers,
  CheckCircle2,
} from 'lucide-react'
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  CartesianGrid,
} from 'recharts'
import { motion } from 'framer-motion'
import { reportService } from '../../../services/reportService'
import PageContainer from '../../../components/app/PageContainer'
import AppBreadcrumb from '../../../components/app/AppBreadcrumb'
import {
  MasterStatsGrid,
  MasterStatCard,
  SquircleActionButton,
  PrintOptionModal,
} from '../../../components/master-data'
import { Button } from '@/components/tailgrids/core/button'
import { Badge } from '@/components/tailgrids/core/badge'
import { Alert, AlertContent, AlertDescription, AlertIndicator, AlertTitle } from '@/components/tailgrids/core/alert'
import {
  TableRoot,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from '@/components/tailgrids/core/table'
import { ReportSkeleton } from '../../../components/reports/ReportSkeleton'
import { ReportEmptyState } from '../../../components/reports/ReportEmptyState'
import { ReportErrorState } from '../../../components/reports/ReportErrorState'
import { ReportExportModal } from '../../../components/reports/ReportExportModal'
import { printCleanTable, downloadPdfTable } from '../../../utils/printHelper'

export function LaporanLintasUnitPage() {
  const [filters, setFilters] = useState({ period: 'year' })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [reportData, setReportData] = useState(null)

  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false)
  const [isExportOpen, setIsExportOpen] = useState(false)
  const [exportFormat, setExportFormat] = useState('pdf')

  const fetchReport = async () => {
    setLoading(true)
    setError(false)
    try {
      const res = await reportService.getFoundationLintasUnitReport(filters)
      setReportData(res)
    } catch (err) {
      console.error('Failed to fetch Lintas Unit report', err)
      setError(true)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchReport()
  }, [filters])

  const handlePeriodChange = (val) => {
    setFilters((prev) => ({ ...prev, period: val }))
  }

  const handleResetFilter = () => {
    setFilters({ period: 'year' })
  }

  const handleConfirmExport = ({ format, orientation }) => {
    setIsExportOpen(false)
    const url = reportService.exportFoundationReport('lintas-unit', { ...filters, format, orientation })
    window.open(url, '_blank')
  }

  const handlePrintClean = () => {
    setIsPrintModalOpen(false)
    const headers = ['Unit Pendidikan', 'Guru', 'Pegawai', 'Siswa Aktif', 'Siswa Baru', 'Mutasi Masuk', 'Mutasi Keluar', 'Kelulusan', 'Alumni', 'Kelas', 'Rombel']
    const rows = (reportData?.main_comparison || []).map((r) => [
      r.unit_name || '-',
      String(r.guru ?? 0),
      String(r.pegawai ?? 0),
      String(r.siswa ?? 0),
      String(r.siswa_baru ?? 0),
      String(r.mutasi_masuk ?? 0),
      String(r.mutasi_keluar ?? 0),
      String(r.lulus ?? 0),
      String(r.alumni ?? 0),
      String(r.kelas ?? 0),
      String(r.rombel ?? 0),
    ])
    printCleanTable({
      title: 'Laporan Komparasi Eksekutif Lintas Unit Pendidikan',
      subtitle: `Periode: ${reportData?.report?.period?.label || 'Tahun Ini'} • Total Unit: ${reportData?.summary?.total_unit || rows.length}`,
      headers,
      rows,
    })
  }

  const handleDownloadPdf = () => {
    setIsPrintModalOpen(false)
    const headers = ['Unit Pendidikan', 'Guru', 'Pegawai', 'Siswa Aktif', 'Siswa Baru', 'Mutasi Masuk', 'Mutasi Keluar', 'Kelulusan', 'Alumni', 'Kelas', 'Rombel']
    const rows = (reportData?.main_comparison || []).map((r) => [
      r.unit_name || '-',
      String(r.guru ?? 0),
      String(r.pegawai ?? 0),
      String(r.siswa ?? 0),
      String(r.siswa_baru ?? 0),
      String(r.mutasi_masuk ?? 0),
      String(r.mutasi_keluar ?? 0),
      String(r.lulus ?? 0),
      String(r.alumni ?? 0),
      String(r.kelas ?? 0),
      String(r.rombel ?? 0),
    ])
    downloadPdfTable({
      title: 'Laporan Komparasi Eksekutif Lintas Unit Pendidikan',
      subtitle: `Periode: ${reportData?.report?.period?.label || 'Tahun Ini'} • Total Unit: ${reportData?.summary?.total_unit || rows.length}`,
      headers,
      rows,
    })
  }

  if (loading && !reportData) return <ReportSkeleton />
  if (error) return <ReportErrorState onRetry={fetchReport} />
  if (!reportData || !reportData.summary) return <ReportEmptyState onReset={handleResetFilter} />

  const { summary, charts, main_comparison, ratio_table, comparison_total, insights, report } = reportData

  return (
    <PageContainer maxW="7xl" className="space-y-6 pb-12">
      {/* 🧭 AppBreadcrumb Navigation */}
      <AppBreadcrumb
        className="print:hidden"
        items={[
          { href: '/dashboard/yayasan', label: 'Yayasan' },
          { href: '/dashboard/yayasan/laporan', label: 'Laporan Eksekutif' },
          { label: 'Laporan Lintas Unit (Eksekutif)' },
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
              <Building2 className="size-6 sm:size-7 text-white" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2.5 flex-wrap">
                <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-emerald-600 to-teal-600 px-3.5 py-1 text-xs font-extrabold text-white shadow-sm shadow-emerald-600/25 border border-emerald-300/40">
                  <Sparkles className="size-3 text-amber-300 animate-pulse" />
                  Laporan Eksekutif Multi-Unit
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-0.5 text-xs font-extrabold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/60">
                  Periode: {report?.period?.label || 'Tahun Ini'}
                </span>
              </div>
              <h1 className="mt-1.5 text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                {report?.title || 'Laporan Komparasi Lintas Unit Pendidikan'}
              </h1>
              <p className="mt-0.5 text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300 max-w-2xl leading-relaxed">
                {report?.description || 'Agregasi seluruh indikator operasional, perbandingan populasi siswa, rasio guru, dan efisiensi pembelajaran di seluruh unit sekolah.'}
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

      {/* ── 2. EXECUTIVE KPI GRID (MASTER STATS GRID) ── */}
      <MasterStatsGrid>
        <MasterStatCard
          icon={Building2}
          label="Total Unit Sekolah"
          value={summary.total_unit}
          description="Satuan pendidikan aktif"
          variant="success"
        />
        <MasterStatCard
          icon={Users}
          label="Total SDM Pegawai"
          value={summary.total_sdm}
          description="Guru & Tenaga Kependidikan"
          variant="info"
        />
        <MasterStatCard
          icon={GraduationCap}
          label="Total Siswa Aktif"
          value={summary.total_siswa}
          description="Peserta didik terdaftar"
          variant="indigo"
        />
        <MasterStatCard
          icon={ArrowRightLeft}
          label="Total Mutasi"
          value={summary.total_mutasi}
          description="Mutasi masuk & keluar"
          variant="warning"
        />
        <MasterStatCard
          icon={Award}
          label="Total Kelulusan"
          value={summary.total_kelulusan}
          description="Alumni & kelulusan unit"
          variant="purple"
        />
      </MasterStatsGrid>

      {/* ── 3. 3-COLUMN EQUAL GRID: FILTER + POPULASI BAR CHART + RADAR MULTIDIMENSI ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-stretch print:hidden">
        {/* Col 1: Kartu Filter Periode Laporan */}
        <div className="relative overflow-hidden rounded-[22px] border-2 border-emerald-500/25 bg-white p-5 shadow-md shadow-emerald-500/5 dark:border-emerald-600/35 dark:bg-[#1B2433] flex flex-col justify-between">
          <div className="pointer-events-none absolute -top-10 -right-10 h-32 w-32 rounded-full bg-emerald-400/10 blur-2xl dark:bg-emerald-400/15" />
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4 border-b border-emerald-500/15 pb-3">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Filter className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                Filter Komparasi Lintas Unit
              </h3>
              <span className="rounded-lg bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                Eksekutif
              </span>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Periode Analisis
                </label>
                <select
                  value={filters.period}
                  onChange={(e) => handlePeriodChange(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2 text-xs font-semibold text-slate-800 focus:border-emerald-600 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                >
                  <option value="year">Tahun Ajaran Penuh (2026/2027)</option>
                  <option value="semester">Semester Ini</option>
                  <option value="month">Bulan Ini</option>
                  <option value="all">Seluruh Riwayat Data</option>
                </select>
              </div>

              <div className="p-3 rounded-xl bg-emerald-50/50 border border-emerald-100 dark:bg-emerald-950/30 dark:border-emerald-900/40 text-xs text-slate-600 dark:text-slate-300 space-y-1.5">
                <div className="flex justify-between font-medium">
                  <span>Rata-rata Siswa / Guru:</span>
                  <b className="text-emerald-800 dark:text-emerald-200">1 : {summary.avg_siswa_per_guru}</b>
                </div>
                <div className="flex justify-between font-medium">
                  <span>Rata-rata Siswa / Rombel:</span>
                  <b className="text-emerald-800 dark:text-emerald-200">{summary.avg_siswa_per_rombel} Siswa</b>
                </div>
                <div className="flex justify-between font-medium">
                  <span>Unit Siswa Terbanyak:</span>
                  <b className="text-emerald-800 dark:text-emerald-200">{summary.unit_siswa_terbanyak}</b>
                </div>
              </div>
            </div>
          </div>

          <div className="relative z-10 mt-4 pt-3 border-t border-emerald-500/15">
            <button
              type="button"
              onClick={handleResetFilter}
              className="w-full flex items-center justify-center gap-1.5 rounded-xl border border-emerald-200 bg-emerald-50/50 p-2 text-xs font-bold text-emerald-800 hover:bg-emerald-100 dark:border-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300 cursor-pointer transition-colors"
            >
              <RotateCcw className="h-3.5 w-3.5" /> Reset Filter Periode
            </button>
          </div>
        </div>

        {/* Col 2: Perbandingan Populasi Siswa per Unit (BarChart) */}
        <div className="relative overflow-hidden rounded-[22px] border-2 border-emerald-500/25 bg-white p-5 shadow-md shadow-emerald-500/5 dark:border-emerald-600/35 dark:bg-[#1B2433]">
          <div className="pointer-events-none absolute -top-10 -right-10 h-32 w-32 rounded-full bg-emerald-400/10 blur-2xl dark:bg-emerald-400/15" />
          <div className="relative z-10 h-full flex flex-col justify-between">
            <div className="flex items-center justify-between mb-3 border-b border-emerald-500/15 pb-2.5">
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">Populasi Siswa per Unit</h4>
                <p className="text-[11px] text-slate-400">Siswa aktif & siswa baru terdaftar</p>
              </div>
              <span className="rounded-lg bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                Populasi
              </span>
            </div>
            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={charts.perbandingan_siswa || []}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip />
                  <Legend iconSize={8} wrapperStyle={{ fontSize: 10 }} />
                  <Bar dataKey="siswa" name="Siswa Aktif" fill="#0E5C44" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="siswa_baru" name="Siswa Baru" fill="#3FBF75" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Col 3: Radar Perbandingan Dinormalisasi (Skala 0-100) */}
        <div className="relative overflow-hidden rounded-[22px] border-2 border-emerald-500/25 bg-white p-5 shadow-md shadow-emerald-500/5 dark:border-emerald-600/35 dark:bg-[#1B2433]">
          <div className="pointer-events-none absolute -top-10 -right-10 h-32 w-32 rounded-full bg-emerald-400/10 blur-2xl dark:bg-emerald-400/15" />
          <div className="relative z-10 h-full flex flex-col justify-between">
            <div className="flex items-center justify-between mb-3 border-b border-emerald-500/15 pb-2.5">
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">Radar Kapasitas Unit</h4>
                <p className="text-[11px] text-slate-400">Normalisasi skor siswa vs SDM</p>
              </div>
              <span className="rounded-lg bg-sky-50 px-2 py-0.5 text-[10px] font-bold text-sky-700 dark:bg-sky-950 dark:text-sky-300">
                Radar
              </span>
            </div>
            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={charts.radar_normalized || []}>
                  <PolarGrid stroke="#E2E8F0" />
                  <PolarAngleAxis dataKey="unit" tick={{ fontSize: 9 }} />
                  <PolarRadiusAxis domain={[0, 100]} tick={{ fontSize: 8 }} />
                  <Radar name="Skor Populasi" dataKey="siswa_norm" stroke="#0E5C44" fill="#0E5C44" fillOpacity={0.35} />
                  <Radar name="Skor SDM" dataKey="sdm_norm" stroke="#0284C7" fill="#0284C7" fillOpacity={0.35} />
                  <Tooltip />
                  <Legend iconSize={8} wrapperStyle={{ fontSize: 10 }} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* ── 4. EMERALD DATATABLE CONTAINER 1: TABEL KOMPARASI UTAMA ── */}
      <section className="relative overflow-hidden rounded-[22px] border-2 border-emerald-300 dark:border-emerald-700/80 bg-white shadow-md shadow-emerald-500/10 dark:bg-[#1B2433]">
        {/* Toolbar Header */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-emerald-200/90 bg-gradient-to-r from-emerald-500/10 via-teal-500/5 to-transparent p-5 dark:border-emerald-800/60">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <Building2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                Tabel Perbandingan Utama Lintas Unit
              </h3>
              <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-bold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                {(main_comparison || []).length} Unit Pendidikan
              </span>
            </div>
            <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
              Agregasi seluruh indikator operasional utama per Unit Pendidikan di bawah naungan Yayasan.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-nowrap shrink-0 overflow-visible py-1">
            <SquircleActionButton
              variant="view"
              icon={Printer}
              label="Cetak / Unduh PDF Komparasi"
              onClick={() => setIsPrintModalOpen(true)}
            />
            <SquircleActionButton
              variant="export"
              label="Export Excel (.xlsx)"
              onClick={() => {
                setExportFormat('excel')
                setIsExportOpen(true)
              }}
            />
          </div>
        </div>

        {/* Datatable Body */}
        <div className="overflow-x-auto">
          <TableRoot fullBleed={false}>
            <TableHeader className="bg-gradient-to-r from-emerald-100/90 via-teal-50/70 to-emerald-100/90 border-b-2 border-emerald-200/90 dark:from-emerald-950/90 dark:via-teal-950/70 dark:to-emerald-950/90 text-emerald-950 dark:text-emerald-200 text-[11px] font-extrabold uppercase tracking-wider">
              <TableRow>
                <TableHead className="py-3.5 px-4">Unit Pendidikan</TableHead>
                <TableHead className="py-3.5 px-3 text-right">Guru</TableHead>
                <TableHead className="py-3.5 px-3 text-right">Pegawai</TableHead>
                <TableHead className="py-3.5 px-3 text-right font-black">Siswa Aktif</TableHead>
                <TableHead className="py-3.5 px-3 text-right">Siswa Baru</TableHead>
                <TableHead className="py-3.5 px-3 text-right">Mutasi Masuk</TableHead>
                <TableHead className="py-3.5 px-3 text-right">Mutasi Keluar</TableHead>
                <TableHead className="py-3.5 px-3 text-right">Kelulusan</TableHead>
                <TableHead className="py-3.5 px-3 text-right">Alumni</TableHead>
                <TableHead className="py-3.5 px-3 text-right">Kelas</TableHead>
                <TableHead className="py-3.5 px-4 text-right">Rombel</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-emerald-100/80 dark:divide-emerald-900/40 text-xs">
              {(main_comparison || []).map((row, idx) => (
                <TableRow key={idx} className="transition hover:bg-emerald-50/30 dark:hover:bg-slate-800/50">
                  <TableCell className="py-3 px-4 font-extrabold text-slate-900 dark:text-white">
                    {row.unit_name}
                  </TableCell>
                  <TableCell className="py-3 px-3 text-right">{row.guru}</TableCell>
                  <TableCell className="py-3 px-3 text-right">{row.pegawai}</TableCell>
                  <TableCell className="py-3 px-3 text-right font-black text-emerald-700 dark:text-emerald-300">{row.siswa}</TableCell>
                  <TableCell className="py-3 px-3 text-right">{row.siswa_baru}</TableCell>
                  <TableCell className="py-3 px-3 text-right text-emerald-600 font-bold">{row.mutasi_masuk}</TableCell>
                  <TableCell className="py-3 px-3 text-right text-rose-600 font-bold">{row.mutasi_keluar}</TableCell>
                  <TableCell className="py-3 px-3 text-right">{row.lulus}</TableCell>
                  <TableCell className="py-3 px-3 text-right">{row.alumni}</TableCell>
                  <TableCell className="py-3 px-3 text-right">{row.kelas}</TableCell>
                  <TableCell className="py-3 px-4 text-right">{row.rombel}</TableCell>
                </TableRow>
              ))}
              {comparison_total && (
                <TableRow className="bg-emerald-50/80 font-black text-emerald-950 dark:bg-emerald-950/60 dark:text-emerald-200 border-t-2 border-emerald-300">
                  <TableCell className="py-3.5 px-4 font-black">TOTAL KONSOLIDASI</TableCell>
                  <TableCell className="py-3.5 px-3 text-right font-bold">{comparison_total.guru}</TableCell>
                  <TableCell className="py-3.5 px-3 text-right font-bold">{comparison_total.pegawai}</TableCell>
                  <TableCell className="py-3.5 px-3 text-right font-black text-sm text-emerald-800 dark:text-emerald-200">{comparison_total.siswa}</TableCell>
                  <TableCell className="py-3.5 px-3 text-right font-bold">{comparison_total.siswa_baru}</TableCell>
                  <TableCell className="py-3.5 px-3 text-right font-bold">{comparison_total.mutasi_masuk}</TableCell>
                  <TableCell className="py-3.5 px-3 text-right font-bold">{comparison_total.mutasi_keluar}</TableCell>
                  <TableCell className="py-3.5 px-3 text-right font-bold">{comparison_total.lulus}</TableCell>
                  <TableCell className="py-3.5 px-3 text-right font-bold">{comparison_total.alumni}</TableCell>
                  <TableCell className="py-3.5 px-3 text-right font-bold">{comparison_total.kelas}</TableCell>
                  <TableCell className="py-3.5 px-4 text-right font-bold">{comparison_total.rombel}</TableCell>
                </TableRow>
              )}
            </TableBody>
          </TableRoot>
        </div>
      </section>

      {/* ── 5. EMERALD DATATABLE CONTAINER 2: TABEL RASIO & EFISIENSI ── */}
      <section className="relative overflow-hidden rounded-[22px] border-2 border-emerald-300 dark:border-emerald-700/80 bg-white shadow-md shadow-emerald-500/10 dark:bg-[#1B2433]">
        <div className="border-b border-emerald-200/90 bg-gradient-to-r from-emerald-500/10 via-teal-500/5 to-transparent p-5 dark:border-emerald-800/60">
          <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <Scale className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            Tabel Rasio & Efisiensi Operasional Unit
          </h3>
          <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
            Analisis rasio kecukupan guru, kepadatan rombel, dan persentase kelulusan tahunan.
          </p>
        </div>

        <div className="overflow-x-auto">
          <TableRoot fullBleed={false}>
            <TableHeader className="bg-gradient-to-r from-emerald-100/90 via-teal-50/70 to-emerald-100/90 border-b-2 border-emerald-200/90 dark:from-emerald-950/90 dark:via-teal-950/70 dark:to-emerald-950/90 text-emerald-950 dark:text-emerald-200 text-[11px] font-extrabold uppercase tracking-wider">
              <TableRow>
                <TableHead className="py-3.5 px-4">Unit Pendidikan</TableHead>
                <TableHead className="py-3.5 px-4 text-center">Rasio Siswa / Guru</TableHead>
                <TableHead className="py-3.5 px-4 text-center">Rasio Siswa / Rombel</TableHead>
                <TableHead className="py-3.5 px-4 text-center">Guru per Rombel</TableHead>
                <TableHead className="py-3.5 px-4 text-right">Pertumbuhan Siswa</TableHead>
                <TableHead className="py-3.5 px-4 text-right">Persentase Kelulusan</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-emerald-100/80 dark:divide-emerald-900/40 text-xs">
              {(ratio_table || []).map((row, idx) => (
                <TableRow key={idx} className="transition hover:bg-emerald-50/30 dark:hover:bg-slate-800/50">
                  <TableCell className="py-3 px-4 font-extrabold text-slate-900 dark:text-white">
                    {row.unit_name}
                  </TableCell>
                  <TableCell className="py-3 px-4 text-center font-bold text-slate-700 dark:text-slate-200">
                    {row.siswa_guru}
                  </TableCell>
                  <TableCell className="py-3 px-4 text-center font-bold text-slate-700 dark:text-slate-200">
                    {row.siswa_rombel}
                  </TableCell>
                  <TableCell className="py-3 px-4 text-center font-bold text-slate-700 dark:text-slate-200">
                    {row.guru_rombel}
                  </TableCell>
                  <TableCell className="py-3 px-4 text-right font-black text-emerald-700 dark:text-emerald-400">
                    {row.pertumbuhan_siswa}
                  </TableCell>
                  <TableCell className="py-3 px-4 text-right font-black text-blue-600 dark:text-blue-400">
                    {row.persentase_kelulusan}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </TableRoot>
        </div>
      </section>

      {/* ── 6. EXECUTIVE INSIGHTS ALERTS ── */}
      {insights && insights.length > 0 && (
        <div className="space-y-3">
          {insights.map((ins, idx) => (
            <Alert key={idx} status={ins.type === 'success' ? 'success' : ins.type === 'warning' ? 'warning' : 'info'}>
              <AlertIndicator />
              <AlertContent>
                <AlertTitle>{ins.title}</AlertTitle>
                <AlertDescription>{ins.description}</AlertDescription>
              </AlertContent>
            </Alert>
          ))}
        </div>
      )}

      {/* ── 7. PRINT & EXPORT MODALS ── */}
      <PrintOptionModal
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
        onPrint={handlePrintClean}
        onDownloadPdf={handleDownloadPdf}
        title="Cetak Laporan Komparasi Lintas Unit Pendidikan"
      />

      <ReportExportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        onConfirmExport={handleConfirmExport}
        defaultFormat={exportFormat}
        title="Export Laporan Komparasi Lintas Unit"
      />
    </PageContainer>
  )
}
