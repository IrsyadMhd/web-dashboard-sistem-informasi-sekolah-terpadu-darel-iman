import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { GraduationCap, Heart, BookOpen, Briefcase, Building, HelpCircle, PhoneCall, ShieldCheck, Sparkles } from 'lucide-react'
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, PieChart, Pie, Cell } from 'recharts'
import { reportService } from '../../../services/reportService'
import AppBreadcrumb from '../../../components/app/AppBreadcrumb'
import { ReportHeader } from '../../../components/reports/ReportHeader'
import { ReportPeriodFilter } from '../../../components/reports/ReportPeriodFilter'
import { ReportKpiGrid } from '../../../components/reports/ReportKpiGrid'
import { ReportRecapTable } from '../../../components/reports/ReportRecapTable'
import { ReportDetailTable } from '../../../components/reports/ReportDetailTable'
import { ReportInsightCard } from '../../../components/reports/ReportInsightCard'
import { ReportNotesCard } from '../../../components/reports/ReportNotesCard'
import { ReportPreviewModal } from '../../../components/reports/ReportPreviewModal'
import { ReportExportModal } from '../../../components/reports/ReportExportModal'
import { ReadOnlyDetailModal } from '../../../components/reports/ReadOnlyDetailModal'
import { ReportSkeleton } from '../../../components/reports/ReportSkeleton'
import { ReportEmptyState } from '../../../components/reports/ReportEmptyState'
import { ReportErrorState } from '../../../components/reports/ReportErrorState'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/tailgrids/core/card'

const COLORS = ['#0E5C44', '#1E8E5A', '#3FBF75', '#0284C7', '#6366F1', '#EC4899', '#F59E0B']

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

export function LaporanAlumniPage() {
  const [filters, setFilters] = useState({ period: 'year', page: 1, per_page: 15, search: '' })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [reportData, setReportData] = useState(null)

  const [isPreviewOpen, setIsPreviewOpen] = useState(false)
  const [isExportOpen, setIsExportOpen] = useState(false)
  const [exportFormat, setExportFormat] = useState('pdf')
  const [detailModalData, setDetailModalData] = useState(null)

  const fetchReport = async () => {
    setLoading(true)
    setError(false)
    try {
      const res = await reportService.getFoundationAlumniReport(filters)
      setReportData(res)
    } catch (err) {
      console.error('Failed to fetch Alumni report', err)
      setError(true)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchReport()
  }, [filters])

  const handlePeriodChange = (periodObj) => {
    setFilters((prev) => ({ ...prev, ...periodObj, page: 1 }))
  }

  const handleResetFilter = () => {
    setFilters({ period: 'year', page: 1, per_page: 15, search: '' })
  }

  const handleViewDetail = async (row) => {
    try {
      const detail = await reportService.getFoundationAlumniDetail(row.id)
      setDetailModalData(detail)
    } catch (e) {
      setDetailModalData(row)
    }
  }

  const handleExportPdf = () => {
    setExportFormat('pdf')
    setIsExportOpen(true)
  }

  const handleExportExcel = () => {
    setExportFormat('excel')
    setIsExportOpen(true)
  }

  const handleConfirmExport = ({ format, orientation }) => {
    setIsExportOpen(false)
    const url = reportService.exportFoundationReport('alumni', { ...filters, format, orientation })
    window.open(url, '_blank')
  }

  if (loading && !reportData) return <ReportSkeleton />
  if (error) return <ReportErrorState onRetry={fetchReport} />
  if (!reportData || !reportData.summary) return <ReportEmptyState onReset={handleResetFilter} />

  const { summary, charts, unit_recaps, batch_recaps, unit_recaps_total, details, insights, meta, report } = reportData

  const kpiItems = [
    { title: 'Total Data Alumni', value: summary.total_alumni, unit: 'Alumni', icon: GraduationCap, iconBg: 'bg-emerald-50 text-[#0E5C44] dark:bg-emerald-950/40 dark:text-emerald-300' },
    { title: 'Melanjutkan Kuliah', value: summary.alumni_kuliah, unit: 'Mahasiswa', icon: BookOpen, iconBg: 'bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-300' },
    { title: 'Sudah Bekerja', value: summary.alumni_bekerja, unit: 'Pekerja', icon: Briefcase, iconBg: 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-300' },
    { title: 'Berwirausaha', value: summary.alumni_wirausaha, unit: 'Pengusaha', icon: Building, iconBg: 'bg-teal-50 text-teal-600 dark:bg-teal-950/40 dark:text-teal-300' },
    { title: 'Laki-Laki Alumni', value: summary.alumni_laki_laki, unit: 'Alumni', icon: Heart, iconBg: 'bg-sky-50 text-sky-600 dark:bg-sky-950/40 dark:text-sky-300' },
    { title: 'Perempuan Alumni', value: summary.alumni_perempuan, unit: 'Alumni', icon: Heart, iconBg: 'bg-pink-50 text-pink-600 dark:bg-pink-950/40 dark:text-pink-300' },
    { title: 'Belum Terdata', value: summary.alumni_belum_terdata, unit: 'Alumni', icon: HelpCircle, iconBg: 'bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-300' },
    { title: 'Dapat Dihubungi', value: summary.alumni_dapat_dihubungi, unit: 'Kontak', icon: PhoneCall, iconBg: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-300' },
  ]

  const recapColumns = [
    { header: 'Unit Asal', accessor: 'unit_name' },
    { header: 'Total Alumni', accessor: 'total_alumni', align: 'right' },
    { header: 'Kuliah / PT', accessor: 'melanjutkan_pendidikan', align: 'right' },
    { header: 'Bekerja', accessor: 'bekerja', align: 'right' },
    { header: 'Berwirausaha', accessor: 'berwirausaha', align: 'right' },
    { header: 'Belum Terdata', accessor: 'belum_terdata', align: 'right' },
  ]

  const batchColumns = [
    { header: 'Angkatan / Tahun Masuk', accessor: 'angkatan' },
    { header: 'Total Alumni', accessor: 'total_alumni', align: 'right' },
    { header: 'Kuliah', accessor: 'kuliah', align: 'right' },
    { header: 'Bekerja', accessor: 'bekerja', align: 'right' },
    { header: 'Berwirausaha', accessor: 'berwirausaha', align: 'right' },
    { header: 'Belum Terdata', accessor: 'belum_terdata', align: 'right' },
  ]

  const detailColumns = [
    { header: 'Alumni & NISN', accessor: 'nama' },
    { header: 'Unit Asal & Angkatan', accessor: 'unit' },
    { header: 'Status Karir', accessor: 'status' },
    { header: 'Tahun Lulus', accessor: 'tahun_lulus' },
  ]

  return (
    <motion.div initial="hidden" animate="visible" variants={containerVariants} className="laporan-page-content space-y-6 pb-12">
      {/* 🧭 App Breadcrumbs Navigation */}
      <motion.div variants={itemVariants} className="print:hidden">
        <AppBreadcrumb
          items={[
            { href: '/dashboard/yayasan', label: 'Yayasan' },
            { href: '/dashboard/yayasan/laporan', label: 'Laporan Eksekutif' },
            { label: 'Laporan Data Alumni' },
          ]}
        />
      </motion.div>

      {/* 1. Header Laporan Modern Hero Card */}
      <motion.div variants={itemVariants} className="relative overflow-hidden rounded-[22px] border-2 border-emerald-500/30 bg-gradient-to-r from-emerald-500/15 via-teal-500/10 to-emerald-600/15 p-5 sm:p-6 shadow-md shadow-emerald-500/10 dark:border-emerald-600/40 dark:bg-gradient-to-r dark:from-emerald-950/70 dark:via-teal-950/50 dark:to-slate-900 print:hidden">
        {/* Ambient Glow Background Accent */}
        <div className="pointer-events-none absolute -top-20 -right-20 h-56 w-56 rounded-full bg-gradient-to-br from-emerald-500/40 via-teal-400/30 to-emerald-600/20 blur-3xl dark:from-emerald-500/50 dark:via-teal-400/40" />
        <div className="pointer-events-none absolute -bottom-20 -left-20 h-56 w-56 rounded-full bg-gradient-to-tr from-emerald-600/30 via-teal-500/20 to-transparent blur-3xl dark:from-emerald-600/40 dark:via-teal-500/30" />

        <div className="relative z-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-4 min-w-0">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700 text-white shadow-xl shadow-emerald-600/40 border border-emerald-300/40 dark:from-emerald-400 dark:via-emerald-500 dark:to-teal-600">
              <GraduationCap className="h-6 w-6" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                  {report.title}
                </h1>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-emerald-600 to-teal-600 px-3.5 py-1 text-xs font-extrabold text-white shadow-sm shadow-emerald-600/25 border border-emerald-300/40">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  Tracer Study Alumni
                </span>
              </div>
              <p className="mt-1 text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300 max-w-2xl leading-relaxed">
                {report.description}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
            <div className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-500/40 bg-gradient-to-r from-emerald-100 via-emerald-50 to-teal-100 px-3.5 py-1.5 text-xs font-black text-emerald-900 dark:border-emerald-700 dark:bg-gradient-to-r dark:from-emerald-950 dark:to-teal-950 dark:text-emerald-200 shadow-2xs">
              <Sparkles className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>{report.period?.label ?? 'Semua Angkatan'}</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* 2. Ringkasan Analisis Laporan */}
      <motion.div variants={itemVariants} className="print:hidden">
        <ReportInsightCard insights={insights} />
      </motion.div>

      {/* 3. Catatan & Identitas Laporan */}
      <motion.div variants={itemVariants} className="print:hidden">
        <ReportNotesCard
          periodLabel={report.period?.label}
          generatedAt={report.generated_at}
        />
      </motion.div>

      {/* 4. Filter Periode & Aksi Laporan */}
      <motion.div variants={itemVariants}>
        <ReportPeriodFilter
          period={filters.period}
          startDate={filters.tanggal_mulai}
          endDate={filters.tanggal_selesai}
          onChange={handlePeriodChange}
          onReset={handleResetFilter}
          onRefresh={fetchReport}
          onOpenPreview={() => setIsPreviewOpen(true)}
          onPrint={() => window.print()}
          onExportPdf={handleExportPdf}
          onExportExcel={handleExportExcel}
          loading={loading}
        />
      </motion.div>

      {/* 5. KPI Ringkasan */}
      <motion.div variants={itemVariants}>
        <ReportKpiGrid items={kpiItems} />
      </motion.div>

      {/* 6. Visual Charts */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 gap-6 md:grid-cols-2 print:hidden">
        <Card className="border border-slate-200/80 bg-white dark:border-slate-800 dark:bg-[#1B2433]">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold text-slate-900 dark:text-white">Alumni per Unit Asal & Karir</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={charts.alumni_by_unit || []}>
                  <XAxis dataKey="name" stroke="#888888" fontSize={11} />
                  <YAxis stroke="#888888" fontSize={11} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="total" name="Total Alumni" fill="#0E5C44" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="kuliah" name="Melanjutkan Kuliah" fill="#0284C7" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-slate-200/80 bg-white dark:border-slate-800 dark:bg-[#1B2433]">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold text-slate-900 dark:text-white">Status Pendidikan & Pekerjaan Alumni</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={charts.status_lanjutan || []} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                    {(charts.status_lanjutan || []).map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* 7. Rekap Per Unit */}
      <motion.div variants={itemVariants}>
        <ReportRecapTable
          title="Rekapitulasi Alumni per Unit Asal Pendidikan"
          columns={recapColumns}
          data={unit_recaps}
          totalRow={unit_recaps_total}
        />
      </motion.div>

      {/* 7b. Rekap Per Angkatan */}
      {batch_recaps && batch_recaps.length > 0 && (
        <motion.div variants={itemVariants}>
          <ReportRecapTable
            title="Rekapitulasi Alumni per Angkatan"
            columns={batchColumns}
            data={batch_recaps}
          />
        </motion.div>
      )}

      {/* 8. Data Rinci */}
      <motion.div variants={itemVariants}>
        <ReportDetailTable
          title="Rincian Data Alumni"
          description="Daftar rincian data pembentuk angka laporan. Hanya aksi Lihat Detail yang tersedia."
          columns={detailColumns}
          data={details}
          meta={meta}
          search={filters.search}
          perPage={filters.per_page}
          onSearchChange={(val) => setFilters((prev) => ({ ...prev, search: val, page: 1 }))}
          onPerPageChange={(perPage) => setFilters((prev) => ({ ...prev, per_page: perPage, page: 1 }))}
          onPageChange={(page) => setFilters((prev) => ({ ...prev, page }))}
          onViewDetail={handleViewDetail}
          filters={filters}
          onFilterChange={(newFilters) => setFilters((prev) => ({ ...prev, ...newFilters, page: 1 }))}
        />
      </motion.div>

      {/* Modals */}
      <ReportPreviewModal
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        reportData={reportData}
        onPrint={() => window.print()}
        onExportPdf={() => setIsExportOpen(true)}
      />

      <ReportExportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        onConfirmExport={handleConfirmExport}
        defaultFormat={exportFormat}
      />

      <ReadOnlyDetailModal
        isOpen={!!detailModalData}
        onClose={() => setDetailModalData(null)}
        title="Detail Profile & Karir Alumni"
        data={detailModalData}
      />
    </motion.div>
  )
}
