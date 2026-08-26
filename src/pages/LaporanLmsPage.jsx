import { useCallback, useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import {
  BookOpen,
  Sparkles,
  Printer,
  RefreshCw,
  Search,
  FileText,
  CheckCircle2,
  Clock,
  Award,
} from 'lucide-react'

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
  { key: 'siswa', label: 'Siswa', render: (row) => row.siswa?.full_name || row.student?.full_name || '-', export: (row) => row.siswa?.full_name || row.student?.full_name },
  { key: 'tugas', label: 'Tugas', render: (row) => row.penugasan?.judul || row.assignment?.title || '-', export: (row) => row.penugasan?.judul || row.assignment?.title },
  { key: 'submitted_at', label: 'Dikumpulkan', render: (row) => row.dikumpulkan_pada || row.submitted_at || '-' },
  { key: 'status', label: 'Status' },
  { key: 'nilai', label: 'Nilai', render: (row) => row.nilai ?? row.score ?? '-' },
]

const firstNumber = (object, keys) => {
  for (const key of keys) if (object?.[key] !== undefined) return object[key]
  return 0
}

export default function LaporanLmsPage() {
  const [data, setData] = useState({ material: {}, assignment: {}, submission: {}, reportCard: {}, rows: [] })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const perPage = 10

  const load = useCallback(async () => {
    try {
      setLoading(true)
      setError('')
      const [material, assignment, submission, reportCard, list] = await Promise.all([
        reportService.materialStats(),
        reportService.assignmentStats(),
        reportService.submissionStats(),
        reportService.reportCardStats(),
        reportService.submissions(),
      ])
      setData({ material, assignment, submission, reportCard, rows: list.data || list || [] })
    } catch (err) {
      setError(err?.response?.data?.message || 'Laporan aktivitas LMS gagal dimuat.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const filteredRows = useMemo(() => {
    if (!search.trim()) return data.rows
    const q = search.toLowerCase()
    return data.rows.filter((r) => {
      const siswaName = (r.siswa?.full_name || r.student?.full_name || '').toLowerCase()
      const tugasTitle = (r.penugasan?.judul || r.assignment?.title || '').toLowerCase()
      const statusStr = (r.status || '').toLowerCase()
      return siswaName.includes(q) || tugasTitle.includes(q) || statusStr.includes(q)
    })
  }, [data.rows, search])

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / perPage))
  const paginatedRows = useMemo(() => {
    const start = (currentPage - 1) * perPage
    return filteredRows.slice(start, start + perPage)
  }, [filteredRows, currentPage, perPage])

  const stats = useMemo(() => {
    return {
      material: firstNumber(data.material, ['total', 'total_materi']),
      assignment: firstNumber(data.assignment, ['total', 'total_penugasan', 'total_tugas']),
      submission: firstNumber(data.submission, ['total', 'total_pengumpulan']),
      pending: firstNumber(data.submission, ['belum_dinilai', 'pending', 'total_belum_dinilai']),
      reportCard: firstNumber(data.reportCard, ['total', 'total_rapor']),
    }
  }, [data])

  const handlePrintClean = () => {
    setIsPrintModalOpen(false)
    printCleanTable({
      title: 'Laporan Rekap Aktivitas LMS & Pengumpulan Tugas',
      subtitle: `Total Data Pengumpulan: ${filteredRows.length} Rekaman`,
      headers: ['#', 'Nama Siswa', 'Judul Tugas / Penugasan', 'Waktu Dikumpulkan', 'Status', 'Nilai'],
      rows: filteredRows.map((r, i) => [
        i + 1,
        r.siswa?.full_name || r.student?.full_name || '-',
        r.penugasan?.judul || r.assignment?.title || '-',
        r.dikumpulkan_pada || r.submitted_at || '-',
        r.status || '-',
        r.nilai ?? r.score ?? '-',
      ]),
    })
  }

  const handleDownloadPdf = () => {
    setIsPrintModalOpen(false)
    downloadPdfTable({
      title: 'Laporan Rekap Aktivitas LMS & Pengumpulan Tugas',
      subtitle: `Total Data Pengumpulan: ${filteredRows.length} Rekaman`,
      headers: ['#', 'Nama Siswa', 'Judul Tugas / Penugasan', 'Waktu Dikumpulkan', 'Status', 'Nilai'],
      rows: filteredRows.map((r, i) => [
        i + 1,
        r.siswa?.full_name || r.student?.full_name || '-',
        r.penugasan?.judul || r.assignment?.title || '-',
        r.dikumpulkan_pada || r.submitted_at || '-',
        r.status || '-',
        r.nilai ?? r.score ?? '-',
      ]),
      filename: `Laporan_LMS_${new Date().toISOString().slice(0, 10)}.pdf`,
    })
  }

  const handleImportData = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.csv, .xlsx, .xls'
    input.onchange = (e) => {
      const file = e.target.files?.[0]
      if (file) {
        alert(`Berkas "${file.name}" siap di-import ke log aktivitas LMS!`)
      }
    }
    input.click()
  }

  return (
    <PageContainer className="space-y-6 pb-12">
      {/* Navigation Breadcrumb */}
      <AppBreadcrumb items={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Laporan Aktivitas LMS' }]} />

      {/* Print Option Modal */}
      <PrintOptionModal
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
        title="Laporan Aktivitas LMS & Pengumpulan Tugas"
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
                <BookOpen className="size-6 sm:size-7 text-white" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-emerald-600 to-teal-600 px-3.5 py-1 text-xs font-extrabold text-white shadow-md shadow-emerald-600/30">
                    <Sparkles className="size-3 text-amber-300 animate-pulse" />
                    Laporan E-Learning LMS
                  </span>
                  <span className="inline-flex items-center rounded-full bg-emerald-100 px-3 py-0.5 text-xs font-bold text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/60">
                    {stats.submission} Tugas Dikumpulkan
                  </span>
                </div>
                <h1 className="mt-1.5 text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                  Laporan Rekap Aktivitas LMS & E-Learning
                </h1>
                <p className="mt-0.5 text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-300 max-w-2xl">
                  Monitoring materi modul digital, penugasan guru, log pengumpulan tugas siswa, status verifikasi penilaian, dan penerbitan rapor.
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
      <MasterStatsGrid columns={5}>
        <MasterStatCard
          icon={BookOpen}
          label="Materi Pembelajaran"
          value={stats.material}
          subtitle="Modul & bahan ajar"
          variant="info"
          delay={0}
        />
        <MasterStatCard
          icon={FileText}
          label="Total Penugasan"
          value={stats.assignment}
          subtitle="Tugas dari guru"
          variant="warning"
          delay={50}
        />
        <MasterStatCard
          icon={CheckCircle2}
          label="Tugas Dikumpulkan"
          value={stats.submission}
          subtitle="Tugas terkirim siswa"
          variant="success"
          delay={100}
        />
        <MasterStatCard
          icon={Clock}
          label="Belum Dinilai"
          value={stats.pending}
          subtitle="Perlu penilaan guru"
          variant="danger"
          delay={150}
        />
        <MasterStatCard
          icon={Award}
          label="Rapor Digital"
          value={stats.reportCard}
          subtitle="Capaian semester"
          variant="neutral"
          delay={200}
        />
      </MasterStatsGrid>

      {/* TAILGRIDS EMERALD DATATABLE CONTAINER */}
      <div className="relative overflow-hidden rounded-[22px] border-2 border-emerald-500/25 bg-white shadow-md shadow-emerald-500/5 dark:border-emerald-600/35 dark:bg-[#1B2433]">
        {/* Toolbar Header Terstruktur 3-Baris */}
        <div className="p-4 sm:p-6 space-y-4 bg-gradient-to-r from-emerald-500/10 via-teal-500/5 to-transparent border-b border-emerald-500/20">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">Status Pengumpulan Tugas LMS</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Daftar log pengumpulan tugas siswa beserta waktu pengiriman, status koreksi, dan perolehan nilai.
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
                onClick={() => exportCsv('rekap-lms.csv', columns, filteredRows)}
              />
              <SquircleActionButton
                variant="view"
                icon={Printer}
                label="Cetak Data"
                onClick={() => setIsPrintModalOpen(true)}
              />
            </div>
          </div>

          {/* Search Baris 2 */}
          <div className="relative w-full max-w-md pt-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
            <Input
              type="text"
              placeholder="Cari nama siswa, judul tugas, atau status..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                setCurrentPage(1)
              }}
              className="pl-9 h-9 text-xs"
            />
          </div>
        </div>

        {/* Content Table */}
        <div className="px-4 sm:px-6 md:px-8 overflow-x-auto">
          {loading ? (
            <div className="py-12">
              <MasterEmptyState loading message="Memuat aktivitas LMS..." />
            </div>
          ) : error ? (
            <div className="py-12">
              <MasterErrorState message={error} onRetry={load} />
            </div>
          ) : paginatedRows.length === 0 ? (
            <div className="py-12">
              <MasterEmptyState message="Tidak ada pengumpulan tugas yang cocok dengan pencarian Anda." />
            </div>
          ) : (
            <TableRoot fullBleed={false}>
              <TableHeader className="bg-gradient-to-r from-emerald-100/90 via-teal-50/70 to-emerald-100/90 border-b-2 border-emerald-200/90 dark:from-emerald-950/90 dark:via-teal-950/70 dark:to-emerald-950/90">
                <TableRow>
                  <TableHead className="w-12 text-center">#</TableHead>
                  <TableHead>Nama Siswa</TableHead>
                  <TableHead>Judul Tugas / Penugasan</TableHead>
                  <TableHead className="text-center">Waktu Dikumpulkan</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                  <TableHead className="text-center">Nilai</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedRows.map((r, i) => (
                  <TableRow key={r.id || i} className="hover:bg-emerald-50/40 dark:hover:bg-emerald-950/20">
                    <TableCell className="text-center text-xs font-semibold text-slate-500">
                      {(currentPage - 1) * perPage + i + 1}
                    </TableCell>
                    <TableCell className="font-bold text-slate-900 dark:text-white text-xs">
                      {r.siswa?.full_name || r.student?.full_name || '-'}
                    </TableCell>
                    <TableCell className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                      {r.penugasan?.judul || r.assignment?.title || '-'}
                    </TableCell>
                    <TableCell className="text-center text-xs text-slate-600 dark:text-slate-300">
                      {r.dikumpulkan_pada || r.submitted_at || '-'}
                    </TableCell>
                    <TableCell className="text-center text-xs">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200">
                        {r.status || 'Terkirim'}
                      </span>
                    </TableCell>
                    <TableCell className="text-center text-xs font-black text-slate-900 dark:text-white">
                      {r.nilai ?? r.score ?? '-'}
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
