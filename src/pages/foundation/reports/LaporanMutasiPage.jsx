import React, { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { ArrowRightLeft, ArrowDownLeft, ArrowUpRight, CheckCircle2, Clock, XCircle, Scale, ShieldCheck, Sparkles, TrendingDown, TrendingUp, UserMinus } from 'lucide-react'
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, Legend, PieChart, Pie, Cell, CartesianGrid } from 'recharts'
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

const ChartDarkTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="relative rounded-xl bg-slate-900 border border-slate-700/80 px-4 py-3 shadow-2xl text-white min-w-[150px]">
        <p className="text-xs font-bold text-slate-200 border-b border-slate-700/80 pb-1.5 mb-2">
          {payload[0]?.payload?.fullName || payload[0]?.payload?.name || label}
        </p>
        <div className="space-y-1.5 text-xs">
          {payload.map((entry, index) => (
            <div key={`tooltip-${index}`} className="flex items-center justify-between gap-4 font-semibold">
              <span className="flex items-center gap-2 text-slate-300">
                <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: entry.color || entry.stroke || entry.fill }} />
                {entry.name}:
              </span>
              <span className="font-extrabold text-white">{entry.value}</span>
            </div>
          ))}
        </div>
      </div>
    )
  }
  return null
}

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

export function LaporanMutasiPage() {
  const [filters, setFilters] = useState({ period: 'year', page: 1, per_page: 15, search: '' })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [reportData, setReportData] = useState(null)

  const [isPreviewOpen, setIsPreviewOpen] = useState(false)
  const [isExportOpen, setIsExportOpen] = useState(false)
  const [exportFormat, setExportFormat] = useState('pdf')
  const [detailModalData, setDetailModalData] = useState(null)

  const fetchReport = useCallback(async () => {
    setLoading(true)
    setError(false)
    try {
      const res = await reportService.getFoundationMutasiReport(filters)
      setReportData(res)
    } catch (err) {
      console.error('Failed to fetch Mutasi report', err)
      setError(true)
    } finally {
      setLoading(false)
    }
  }, [filters])

  useEffect(() => {
    fetchReport()
  }, [fetchReport])

  const handlePeriodChange = (periodObj) => {
    setFilters((prev) => ({ ...prev, ...periodObj, page: 1 }))
  }

  const handleResetFilter = () => {
    setFilters({ period: 'year', page: 1, per_page: 15, search: '' })
  }

  const handleViewDetail = async (row) => {
    try {
      const detail = await reportService.getFoundationMutasiDetail(row.id)
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
    const url = reportService.exportFoundationReport('mutasi', { ...filters, format, orientation })
    window.open(url, '_blank')
  }

  if (loading && !reportData) return <ReportSkeleton />
  if (error) return <ReportErrorState onRetry={fetchReport} />
  if (!reportData || !reportData.summary) return <ReportEmptyState onReset={handleResetFilter} />

  const { summary = {}, charts = {}, insights = {}, meta = null } = reportData
  const report = reportData.report || {
    title: 'Laporan Mutasi Siswa',
    description: 'Laporan perpindahan siswa masuk, keluar, berhenti, dan antarunit.',
    period: { label: 'Tahun Ajaran Ini' },
    generated_at: new Date().toISOString(),
  }

  const unit_recaps = Array.isArray(reportData.unit_recaps) ? reportData.unit_recaps : []
  const unit_recaps_total = reportData.unit_recaps_total || null
  const details = Array.isArray(reportData.items)
    ? reportData.items
    : (Array.isArray(reportData.details) ? reportData.details : [])

  const kpiItems = [
    { title: 'Total Permohonan Mutasi', value: summary.total_mutasi ?? summary.total ?? 0, unit: 'Mutasi', icon: ArrowRightLeft, iconBg: 'bg-emerald-50 text-[#0E5C44] dark:bg-emerald-950/40 dark:text-emerald-300' },
    { title: 'Pindah Masuk (Eksternal)', value: summary.pindah_masuk ?? summary.incoming ?? 0, unit: 'Siswa', icon: ArrowDownLeft, iconBg: 'bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-300' },
    { title: 'Pindah Keluar (Eksternal)', value: summary.pindah_keluar ?? summary.outgoing ?? 0, unit: 'Siswa', icon: ArrowUpRight, iconBg: 'bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-300' },
    { title: 'Berhenti', value: summary.berhenti ?? summary.stopped ?? 0, unit: 'Siswa', icon: UserMinus, iconBg: 'bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-300' },
    { title: 'Pindah Antarunit', value: summary.pindah_antarunit ?? summary.inter_unit ?? 0, unit: 'Antarunit', icon: Scale, iconBg: 'bg-sky-50 text-sky-600 dark:bg-sky-950/40 dark:text-sky-300' },
    { title: 'Selisih Masuk - Keluar', value: summary.selisih ?? 0, unit: (summary.selisih ?? 0) >= 0 ? 'Surplus' : 'Defisit', icon: (summary.selisih ?? 0) >= 0 ? TrendingUp : TrendingDown, iconBg: (summary.selisih ?? 0) >= 0 ? 'bg-teal-50 text-teal-600 dark:bg-teal-950/40 dark:text-teal-300' : 'bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-300' },
    { title: 'Mutasi Selesai', value: summary.mutasi_selesai ?? 0, unit: 'Selesai', icon: CheckCircle2, iconBg: 'bg-[#0E5C44]/10 text-[#0E5C44] dark:bg-emerald-950/40 dark:text-emerald-300' },
    { title: 'Dalam Proses / Diajukan', value: summary.mutasi_dalam_proses ?? summary.pending ?? 0, unit: 'Proses', icon: Clock, iconBg: 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-300' },
    { title: 'Mutasi Ditolak', value: summary.mutasi_ditolak ?? 0, unit: 'Ditolak', icon: XCircle, iconBg: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300' },
  ]

  const recapColumns = [
    { header: 'Unit Pendidikan', accessor: 'unit_name' },
    { header: 'Pindah Masuk', accessor: 'pindah_masuk', align: 'right' },
    { header: 'Pindah Keluar', accessor: 'pindah_keluar', align: 'right' },
    { header: 'Berhenti', accessor: 'berhenti', align: 'right' },
    { header: 'Antarunit Masuk', accessor: 'antarunit_masuk', align: 'right' },
    { header: 'Antarunit Keluar', accessor: 'antarunit_keluar', align: 'right' },
    { header: 'Dalam Proses', accessor: 'dalam_proses', align: 'right' },
    { header: 'Selesai', accessor: 'selesai', align: 'right' },
    { header: 'Selisih Net', accessor: 'selisih', align: 'right', format: (v) => <span className={v < 0 ? 'text-rose-600 font-bold' : 'text-emerald-700 font-bold'}>{v > 0 ? `+${v}` : v}</span> },
  ]

  const detailColumns = [
    { header: 'Nomor Mutasi & Siswa', accessor: 'nama' },
    { header: 'Unit Asal & Tujuan', accessor: 'unit' },
    { header: 'Status Mutasi', accessor: 'status' },
    { header: 'Tanggal Efektif', accessor: 'tanggal_efektif' },
  ]

  return (
    <motion.div initial="hidden" animate="visible" variants={containerVariants} className="laporan-page-content space-y-6 pb-12">
      {/* 🧭 App Breadcrumbs Navigation */}
      <motion.div variants={itemVariants} className="print:hidden">
        <AppBreadcrumb
          items={[
            { href: '/dashboard/yayasan', label: 'Yayasan' },
            { href: '/dashboard/yayasan/laporan', label: 'Laporan Eksekutif' },
            { label: 'Laporan Mutasi Siswa' },
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
              <ArrowRightLeft className="h-6 w-6" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                  {report.title}
                </h1>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-emerald-600 to-teal-600 px-3.5 py-1 text-xs font-extrabold text-white shadow-sm shadow-emerald-600/25 border border-emerald-300/40">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  Laporan Mutasi
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
              <span>{report.period?.label ?? 'Tahun Ajaran'}</span>
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
          periodLabel={report.period?.label ?? 'Tahun Ajaran'}
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
            <CardTitle className="text-sm font-bold text-slate-900 dark:text-white">Tren Pergerakan Mutasi Siswa per Bulan</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={charts.monthly_trend || []} margin={{ top: 10, right: 20, left: 0, bottom: 10 }}>
                  <defs>
                    <linearGradient id="mutasiMasukGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0E5C44" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#0E5C44" stopOpacity={0.02} />
                    </linearGradient>
                    <linearGradient id="mutasiKeluarGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#F43F5E" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#F43F5E" stopOpacity={0.02} />
                    </linearGradient>
                    <linearGradient id="mutasiBerhentiGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#F59E0B" stopOpacity={0.02} />
                    </linearGradient>
                    <linearGradient id="mutasiAntarunitGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0284C7" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#0284C7" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#CBD5E1" />
                  <XAxis dataKey="month" stroke="#64748B" fontSize={11} />
                  <YAxis stroke="#64748B" fontSize={11} />
                  <Tooltip content={<ChartDarkTooltip />} />
                  <Legend wrapperStyle={{ paddingTop: 10 }} />
                  <Area type="monotone" dataKey="masuk" name="Pindah Masuk" stroke="#0E5C44" strokeWidth={3} fillOpacity={1} fill="url(#mutasiMasukGrad)" dot={{ r: 4, fill: '#0E5C44', strokeWidth: 2, stroke: '#FFFFFF' }} activeDot={{ r: 7, strokeWidth: 2 }} />
                  <Area type="monotone" dataKey="keluar" name="Pindah Keluar" stroke="#F43F5E" strokeWidth={3} fillOpacity={1} fill="url(#mutasiKeluarGrad)" dot={{ r: 4, fill: '#F43F5E', strokeWidth: 2, stroke: '#FFFFFF' }} activeDot={{ r: 7, strokeWidth: 2 }} />
                  <Area type="monotone" dataKey="berhenti" name="Berhenti" stroke="#F59E0B" strokeWidth={3} fillOpacity={1} fill="url(#mutasiBerhentiGrad)" dot={{ r: 4, fill: '#F59E0B', strokeWidth: 2, stroke: '#FFFFFF' }} activeDot={{ r: 7, strokeWidth: 2 }} />
                  <Area type="monotone" dataKey="antarunit" name="Antarunit" stroke="#0284C7" strokeWidth={3} fillOpacity={1} fill="url(#mutasiAntarunitGrad)" dot={{ r: 4, fill: '#0284C7', strokeWidth: 2, stroke: '#FFFFFF' }} activeDot={{ r: 7, strokeWidth: 2 }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-slate-200/80 bg-white dark:border-slate-800 dark:bg-[#1B2433]">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold text-slate-900 dark:text-white">Status Proses Permohonan Mutasi</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={charts.status_proses || []} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                    {(charts.status_proses || []).map((_, index) => (
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

        <Card className="border border-slate-200/80 bg-white dark:border-slate-800 dark:bg-[#1B2433] md:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold text-slate-900 dark:text-white">Perbandingan Mutasi Masuk vs Keluar per Unit Pendidikan</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={charts.unit_comparison || []} margin={{ top: 10, right: 20, left: 0, bottom: 10 }}>
                  <defs>
                    <linearGradient id="unitMasukGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0E5C44" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#0E5C44" stopOpacity={0.02} />
                    </linearGradient>
                    <linearGradient id="unitKeluarGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#F43F5E" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#F43F5E" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#CBD5E1" />
                  <XAxis dataKey="name" stroke="#64748B" fontSize={11} />
                  <YAxis stroke="#64748B" fontSize={11} />
                  <Tooltip content={<ChartDarkTooltip />} />
                  <Legend wrapperStyle={{ paddingTop: 10 }} />
                  <Area type="monotone" dataKey="masuk" name="Pindah Masuk" stroke="#0E5C44" strokeWidth={3} fillOpacity={1} fill="url(#unitMasukGrad)" dot={{ r: 5, fill: '#0E5C44', strokeWidth: 2, stroke: '#FFFFFF' }} activeDot={{ r: 7, strokeWidth: 2 }} />
                  <Area type="monotone" dataKey="keluar" name="Pindah Keluar" stroke="#F43F5E" strokeWidth={3} fillOpacity={1} fill="url(#unitKeluarGrad)" dot={{ r: 5, fill: '#F43F5E', strokeWidth: 2, stroke: '#FFFFFF' }} activeDot={{ r: 7, strokeWidth: 2 }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* 7. Rekap Per Unit */}
      <motion.div variants={itemVariants}>
        <ReportRecapTable
          title="Rekapitulasi Mutasi Siswa per Unit Pendidikan"
          columns={recapColumns}
          data={unit_recaps}
          totalRow={unit_recaps_total}
        />
      </motion.div>

      {/* 8. Data Rinci */}
      <motion.div variants={itemVariants}>
        <ReportDetailTable
          title="Rincian Data Mutasi Siswa"
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
        title="Detail Permohonan & Riwayat Mutasi"
        data={detailModalData}
      />
    </motion.div>
  )
}
