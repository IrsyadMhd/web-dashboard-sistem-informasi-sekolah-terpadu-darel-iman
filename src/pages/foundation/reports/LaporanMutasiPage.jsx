import React, { useState, useEffect, useCallback } from 'react'
import { ArrowRightLeft, ArrowDownLeft, ArrowUpRight, CheckCircle2, Clock, XCircle, Scale, TrendingDown, TrendingUp, UserMinus } from 'lucide-react'
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, PieChart, Pie, Cell, LineChart, Line } from 'recharts'
import { reportService } from '../../../services/reportService'
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
import { Breadcrumbs } from '@/components/tailgrids/core/breadcrumbs'

const COLORS = ['#0E5C44', '#1E8E5A', '#3FBF75', '#0284C7', '#6366F1', '#EC4899', '#F59E0B']

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
    <div className="laporan-page-content space-y-6 pb-12">
      {/* 🧭 TailGrids Breadcrumbs Navigation */}
      <div className="print:hidden">
        <Breadcrumbs
          dividerType="chevron"
          items={[
            { href: '/dashboard/yayasan', label: 'Yayasan' },
            { href: '/dashboard/yayasan/laporan', label: 'Laporan Eksekutif' },
            { label: 'Laporan Mutasi Siswa' },
          ]}
        />
      </div>

      {/* 1. Header Laporan */}
      <ReportHeader
        title={report.title}
        description={report.description}
        periodLabel={report.period?.label ?? 'Tahun Ajaran'}
        generatedAt={report.generated_at}
      />

      {/* 2. Ringkasan Analisis Laporan (Di bawah Header) */}
      <div className="print:hidden">
        <ReportInsightCard insights={insights} />
      </div>

      {/* 3. Catatan & Identitas Laporan */}
      <div className="print:hidden">
        <ReportNotesCard
          periodLabel={report.period?.label ?? 'Tahun Ajaran'}
          generatedAt={report.generated_at}
        />
      </div>

      {/* 4. Filter Periode & Aksi Laporan */}
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

      {/* 5. KPI Ringkasan */}
      <ReportKpiGrid items={kpiItems} />

      {/* 6. Visual Charts */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 print:hidden">
        <Card className="border border-slate-200/80 bg-white dark:border-slate-800 dark:bg-[#1B2433]">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold text-slate-900 dark:text-white">Tren Pergerakan Mutasi Siswa per Bulan</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={charts.monthly_trend || []}>
                  <XAxis dataKey="month" stroke="#888888" fontSize={11} />
                  <YAxis stroke="#888888" fontSize={11} />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="masuk" name="Pindah Masuk" stroke="#0E5C44" strokeWidth={2} />
                  <Line type="monotone" dataKey="keluar" name="Pindah Keluar" stroke="#F43F5E" strokeWidth={2} />
                  <Line type="monotone" dataKey="berhenti" name="Berhenti" stroke="#F59E0B" strokeWidth={2} />
                  <Line type="monotone" dataKey="antarunit" name="Antarunit" stroke="#0284C7" strokeWidth={2} />
                </LineChart>
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
                <BarChart data={charts.unit_comparison || []}>
                  <XAxis dataKey="name" stroke="#888888" fontSize={11} />
                  <YAxis stroke="#888888" fontSize={11} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="masuk" name="Pindah Masuk" fill="#0E5C44" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="keluar" name="Pindah Keluar" fill="#F43F5E" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 7. Rekap Per Unit */}
      <ReportRecapTable
        title="Rekapitulasi Mutasi Siswa per Unit Pendidikan"
        columns={recapColumns}
        data={unit_recaps}
        totalRow={unit_recaps_total}
      />

      {/* 8. Data Rinci */}
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
    </div>
  )
}
