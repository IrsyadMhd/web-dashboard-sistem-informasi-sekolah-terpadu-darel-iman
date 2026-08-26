import { useCallback, useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import {
  GraduationCap,
  Sparkles,
  Printer,
  RefreshCw,
  Search,
  BookOpen,
  CheckCircle2,
  AlertTriangle,
  FileSpreadsheet,
} from 'lucide-react'
import { Download1, Upload1 } from '@tailgrids/icons'

import { reportService } from '../services/reportService'
import PageContainer from '../components/app/PageContainer'
import AppBreadcrumb from '../components/app/AppBreadcrumb'
import {
  MasterStatsGrid,
  MasterStatCard,
  MasterEmptyState,
  MasterErrorState,
  PrintOptionModal,
  SquircleActionButton,
} from '../components/master-data'
import { printCleanTable, downloadPdfTable } from '../utils/printHelper'
import { exportCsv } from '../components/reports/ReportKit'

import { Button } from '@/components/tailgrids/core/button'
import { Input } from '@/components/tailgrids/core/input'
import { Pagination } from '@/components/tailgrids/core/pagination'
import {
  TableRoot,
  TableHeader,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
} from '@/components/tailgrids/core/table'

const columns = [
  { key: 'siswa', label: 'Nama Siswa', render: (row) => row.student?.full_name || row.student?.nama || '-', export: (row) => row.student?.full_name || row.student?.nama },
  { key: 'nis', label: 'NIS', render: (row) => row.student?.nis || '-', export: (row) => row.student?.nis },
  { key: 'mapel', label: 'Mata Pelajaran', render: (row) => row.subject?.name || '-', export: (row) => row.subject?.name },
  { key: 'assignment_score', label: 'Tugas' },
  { key: 'midterm_score', label: 'UTS' },
  { key: 'final_exam_score', label: 'UAS' },
  { key: 'final_score', label: 'Nilai Akhir' },
  { key: 'grade_letter', label: 'Predikat' },
  { key: 'is_passed', label: 'Ketuntasan', render: (row) => (row.is_passed ? 'Tuntas' : 'Belum Tuntas'), export: (row) => (row.is_passed ? 'Tuntas' : 'Belum Tuntas') },
]

export default function LaporanAkademikPage() {
  const [filters, setFilters] = useState({ kelas_id: '', semester_id: '' })
  const [search, setSearch] = useState('')
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const perPage = 10

  const load = useCallback(async () => {
    try {
      setLoading(true)
      setError('')
      const result = await reportService.grades(Object.fromEntries(Object.entries(filters).filter(([, value]) => value)))
      setRows(result.data || result || [])
    } catch (err) {
      setError(err?.response?.data?.message || 'Laporan akademik gagal dimuat.')
    } finally {
      setLoading(false)
    }
  }, [filters])

  useEffect(() => {
    load()
  }, [load])

  const filteredRows = useMemo(() => {
    if (!search.trim()) return rows
    const q = search.toLowerCase()
    return rows.filter((r) => {
      const name = (r.student?.full_name || r.student?.nama || '').toLowerCase()
      const nis = (r.student?.nis || '').toLowerCase()
      const mapel = (r.subject?.name || '').toLowerCase()
      return name.includes(q) || nis.includes(q) || mapel.includes(q)
    })
  }, [rows, search])

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / perPage))
  const paginatedRows = useMemo(() => {
    const start = (currentPage - 1) * perPage
    return filteredRows.slice(start, start + perPage)
  }, [filteredRows, currentPage, perPage])

  const stats = useMemo(() => {
    const values = rows.map((row) => Number(row.final_score || 0))
    const passed = rows.filter((row) => row.is_passed).length
    const avg = values.length ? (values.reduce((a, b) => a + b, 0) / values.length).toFixed(1) : 0
    return {
      total: rows.length,
      avg,
      passed,
      remedial: rows.length - passed,
    }
  }, [rows])

  const handlePrintClean = () => {
    setIsPrintModalOpen(false)
    printCleanTable({
      title: 'Laporan Rekap Akademik & Leger Nilai Siswa',
      subtitle: `Total Catatan Nilai: ${filteredRows.length} Data`,
      headers: ['#', 'Nama Siswa', 'NIS', 'Mata Pelajaran', 'Tugas', 'UTS', 'UAS', 'Nilai Akhir', 'Predikat', 'Status'],
      rows: filteredRows.map((r, i) => [
        i + 1,
        r.student?.full_name || r.student?.nama || '-',
        r.student?.nis || '-',
        r.subject?.name || '-',
        r.assignment_score || 0,
        r.midterm_score || 0,
        r.final_exam_score || 0,
        r.final_score || 0,
        r.grade_letter || '-',
        r.is_passed ? 'Tuntas' : 'Belum Tuntas',
      ]),
    })
  }

  const handleDownloadPdf = () => {
    setIsPrintModalOpen(false)
    downloadPdfTable({
      title: 'Laporan Rekap Akademik & Leger Nilai Siswa',
      subtitle: `Total Catatan Nilai: ${filteredRows.length} Data`,
      headers: ['#', 'Nama Siswa', 'NIS', 'Mata Pelajaran', 'Tugas', 'UTS', 'UAS', 'Nilai Akhir', 'Predikat', 'Status'],
      rows: filteredRows.map((r, i) => [
        i + 1,
        r.student?.full_name || r.student?.nama || '-',
        r.student?.nis || '-',
        r.subject?.name || '-',
        r.assignment_score || 0,
        r.midterm_score || 0,
        r.final_exam_score || 0,
        r.final_score || 0,
        r.grade_letter || '-',
        r.is_passed ? 'Tuntas' : 'Belum Tuntas',
      ]),
      filename: `Laporan_Akademik_${new Date().toISOString().slice(0, 10)}.pdf`,
    })
  }

  const handleImportData = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.csv, .xlsx, .xls'
    input.onchange = (e) => {
      const file = e.target.files?.[0]
      if (file) {
        alert(`Berkas "${file.name}" siap di-import ke leger nilai akademik!`)
      }
    }
    input.click()
  }

  return (
    <PageContainer className="space-y-6 pb-12">
      {/* Navigation Breadcrumb */}
      <AppBreadcrumb items={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Laporan Akademik & Nilai' }]} />

      {/* Print Option Modal */}
      <PrintOptionModal
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
        title="Laporan Akademik & Leger Nilai"
        onPrint={handlePrintClean}
        onDownloadPdf={handleDownloadPdf}
      />

      {/* MODERN HERO CARD HEADER */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
        <div className="relative overflow-hidden rounded-[22px] border-2 border-emerald-500/30 bg-gradient-to-r from-emerald-500/15 via-teal-500/10 to-emerald-600/15 p-5 sm:p-6 shadow-md shadow-emerald-500/10 dark:border-emerald-600/40 dark:bg-gradient-to-r dark:from-emerald-950/70 dark:via-teal-950/50 dark:to-slate-900">
          <div className="pointer-events-none absolute -top-12 -right-12 h-48 w-48 rounded-full bg-gradient-to-br from-emerald-500/30 via-teal-400/20 to-transparent blur-3xl" />
          <div className="pointer-events-none absolute -bottom-12 -left-12 h-48 w-48 rounded-full bg-gradient-to-tr from-teal-500/20 via-emerald-400/20 to-transparent blur-3xl" />

          <div className="relative z-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex size-12 sm:size-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700 text-white shadow-xl shadow-emerald-600/40 border border-emerald-300/40 dark:from-emerald-400 dark:via-emerald-500 dark:to-teal-600">
                <GraduationCap className="size-6 sm:size-7 text-white" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-emerald-600 to-teal-600 px-3.5 py-1 text-xs font-extrabold text-white shadow-md shadow-emerald-600/30">
                    <Sparkles className="size-3 text-amber-300 animate-pulse" />
                    Laporan Nilai Akademik
                  </span>
                  <span className="inline-flex items-center rounded-full bg-emerald-100 px-3 py-0.5 text-xs font-bold text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/60">
                    {stats.total} Record Nilai
                  </span>
                </div>
                <h1 className="mt-1.5 text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                  Laporan Rekap Akademik & Leger Nilai
                </h1>
                <p className="mt-0.5 text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-300 max-w-2xl">
                  Pusat analisis leger nilai siswa: nilai tugas, UTS, UAS, nilai akhir, predikat kelulusan, dan batas KKM ketuntasan.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 shrink-0 z-10">
              <Button
                type="button"
                variant="primary"
                appearance="fill"
                size="sm"
                onClick={load}
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

      {/* KPI Stats Grid */}
      <MasterStatsGrid columns={4}>
        <MasterStatCard
          icon={BookOpen}
          label="Total Catatan Nilai"
          value={stats.total}
          subtitle="Tercatat dalam sistem"
          variant="info"
          delay={0}
        />
        <MasterStatCard
          icon={Sparkles}
          label="Rata-rata Nilai"
          value={stats.avg}
          subtitle="Nilai akhir akumulatif"
          variant="warning"
          delay={50}
        />
        <MasterStatCard
          icon={CheckCircle2}
          label="Siswa Tuntas"
          value={stats.passed}
          subtitle="Mencapai KKM"
          variant="success"
          delay={100}
        />
        <MasterStatCard
          icon={AlertTriangle}
          label="Perlu Remedial"
          value={stats.remedial}
          subtitle="Belum mencapai KKM"
          variant="danger"
          delay={150}
        />
      </MasterStatsGrid>

      {/* TAILGRIDS EMERALD DATATABLE CONTAINER */}
      <div className="relative overflow-hidden rounded-[22px] border-2 border-emerald-500/25 bg-white shadow-md shadow-emerald-500/5 dark:border-emerald-600/35 dark:bg-[#1B2433]">
        {/* Toolbar Header Terstruktur 3-Baris */}
        <div className="p-4 sm:p-6 space-y-4 bg-gradient-to-r from-emerald-500/10 via-teal-500/5 to-transparent border-b border-emerald-500/20">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">Leger Nilai Siswa</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Daftar rincian leger nilai mata pelajaran, tugas, UTS, UAS, dan predikat akhir.
              </p>
            </div>

            <div className="flex items-center gap-2 flex-nowrap shrink-0 py-1">
              <SquircleActionButton
                variant="import"
                label="Import Data"
                onClick={handleImportData}
              />
              <SquircleActionButton
                variant="export"
                label="Export CSV"
                onClick={() => exportCsv('rekap-akademik.csv', columns, filteredRows)}
              />
              <SquircleActionButton
                variant="view"
                icon={Printer}
                label="Cetak Data"
                onClick={() => setIsPrintModalOpen(true)}
              />
            </div>
          </div>

          {/* Filter & Search Baris 2 */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
              <Input
                type="text"
                placeholder="Cari siswa, NIS, atau mapel..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value)
                  setCurrentPage(1)
                }}
                className="pl-9 h-9 text-xs"
              />
            </div>
            <div>
              <Input
                type="text"
                placeholder="Filter ID Kelas (Opsional)"
                value={filters.kelas_id}
                onChange={(e) => {
                  setFilters({ ...filters, kelas_id: e.target.value })
                  setCurrentPage(1)
                }}
                className="h-9 text-xs"
              />
            </div>
            <div>
              <Input
                type="text"
                placeholder="Filter ID Semester (Opsional)"
                value={filters.semester_id}
                onChange={(e) => {
                  setFilters({ ...filters, semester_id: e.target.value })
                  setCurrentPage(1)
                }}
                className="h-9 text-xs"
              />
            </div>
          </div>
        </div>

        {/* Content Table */}
        <div className="px-4 sm:px-6 md:px-8 overflow-x-auto">
          {loading ? (
            <div className="py-12">
              <MasterEmptyState loading message="Memuat leger nilai akademik..." />
            </div>
          ) : error ? (
            <div className="py-12">
              <MasterErrorState message={error} onRetry={load} />
            </div>
          ) : paginatedRows.length === 0 ? (
            <div className="py-12">
              <MasterEmptyState message="Tidak ada catatan nilai yang cocok dengan filter atau pencarian Anda." />
            </div>
          ) : (
            <TableRoot fullBleed={false}>
              <TableHeader className="bg-gradient-to-r from-emerald-100/90 via-teal-50/70 to-emerald-100/90 border-b-2 border-emerald-200/90 dark:from-emerald-950/90 dark:via-teal-950/70 dark:to-emerald-950/90">
                <TableRow>
                  <TableHead className="w-12 text-center">#</TableHead>
                  <TableHead>Nama Siswa</TableHead>
                  <TableHead className="text-center">NIS</TableHead>
                  <TableHead>Mata Pelajaran</TableHead>
                  <TableHead className="text-center">Tugas</TableHead>
                  <TableHead className="text-center">UTS</TableHead>
                  <TableHead className="text-center">UAS</TableHead>
                  <TableHead className="text-center">Nilai Akhir</TableHead>
                  <TableHead className="text-center">Predikat</TableHead>
                  <TableHead className="text-center">Ketuntasan</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedRows.map((r, i) => (
                  <TableRow key={r.id || i} className="hover:bg-emerald-50/40 dark:hover:bg-emerald-950/20">
                    <TableCell className="text-center text-xs font-semibold text-slate-500">
                      {(currentPage - 1) * perPage + i + 1}
                    </TableCell>
                    <TableCell className="font-bold text-slate-900 dark:text-white text-xs">
                      {r.student?.full_name || r.student?.nama || '-'}
                    </TableCell>
                    <TableCell className="text-center text-xs font-medium text-slate-600 dark:text-slate-300">
                      {r.student?.nis || '-'}
                    </TableCell>
                    <TableCell className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                      {r.subject?.name || '-'}
                    </TableCell>
                    <TableCell className="text-center text-xs">{r.assignment_score || 0}</TableCell>
                    <TableCell className="text-center text-xs">{r.midterm_score || 0}</TableCell>
                    <TableCell className="text-center text-xs">{r.final_exam_score || 0}</TableCell>
                    <TableCell className="text-center text-xs font-black text-slate-900 dark:text-white">
                      {r.final_score || 0}
                    </TableCell>
                    <TableCell className="text-center text-xs font-bold text-emerald-600">
                      {r.grade_letter || '-'}
                    </TableCell>
                    <TableCell className="text-center text-xs">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-extrabold ${r.is_passed ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'}`}>
                        {r.is_passed ? 'Tuntas' : 'Belum Tuntas'}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </TableRoot>
          )}
        </div>

        {/* Footer Pagination Baris 3 */}
        {filteredRows.length > 0 && (
          <div className="p-4 border-t border-emerald-500/15 bg-gradient-to-r from-emerald-50/50 via-teal-50/30 to-emerald-50/50 dark:from-emerald-950/30 dark:via-teal-950/20 dark:to-emerald-950/30">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              sideLayout="full"
            />
          </div>
        )}
      </div>
    </PageContainer>
  )
}
