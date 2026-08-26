import React, { useState, useEffect } from 'react'
import { GraduationCap, Award, XCircle, Clock, Percent, Heart, Medal } from 'lucide-react'
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, PieChart, Pie, Cell } from 'recharts'
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

export function LaporanKelulusanPage() {
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
      const res = await reportService.getFoundationKelulusanReport(filters)
      setReportData(res)
    } catch (err) {
      console.error('Failed to fetch Kelulusan report', err)
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
      const detail = await reportService.getFoundationKelulusanDetail(row.id)
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
    const url = reportService.exportFoundationReport('kelulusan', { ...filters, format, orientation })
    window.open(url, '_blank')
  }

  if (loading && !reportData) return <ReportSkeleton />
  if (error) return <ReportErrorState onRetry={fetchReport} />
  if (!reportData || !reportData.summary) return <ReportEmptyState onReset={handleResetFilter} />

  const { summary, charts, unit_recaps, unit_recaps_total, details, insights, meta, report } = reportData

  const kpiItems = [
    { title: 'Total Peserta Kelulusan', value: summary.total_peserta, unit: 'Siswa', icon: GraduationCap, iconBg: 'bg-emerald-50 text-[#0E5C44] dark:bg-emerald-950/40 dark:text-emerald-300' },
    { title: 'Total Siswa Lulus', value: summary.total_lulus, unit: 'Siswa', icon: Award, iconBg: 'bg-[#0E5C44]/10 text-[#0E5C44] dark:bg-emerald-950/40 dark:text-emerald-300' },
    { title: 'Tingkat Kelulusan', value: `${summary.persentase_kelulusan}%`, unit: 'Pass Rate', icon: Percent, iconBg: 'bg-teal-50 text-teal-600 dark:bg-teal-950/40 dark:text-teal-300' },
    { title: 'Lulus Tepat Waktu', value: summary.lulus_tepat_waktu, unit: 'Siswa', icon: Medal, iconBg: 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-300' },
    { title: 'Laki-Laki Lulus', value: summary.laki_laki_lulus, unit: 'Siswa', icon: Heart, iconBg: 'bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-300' },
    { title: 'Perempuan Lulus', value: summary.perempuan_lulus, unit: 'Siswa', icon: Heart, iconBg: 'bg-pink-50 text-pink-600 dark:bg-pink-950/40 dark:text-pink-300' },
    { title: 'Tidak Lulus', value: summary.tidak_lulus, unit: 'Siswa', icon: XCircle, iconBg: 'bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-300' },
    { title: 'Belum Ditetapkan', value: summary.belum_ditetapkan, unit: 'Proses', icon: Clock, iconBg: 'bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-300' },
  ]

  const recapColumns = [
    { header: 'Unit Pendidikan', accessor: 'unit_name' },
    { header: 'Peserta', accessor: 'peserta', align: 'right' },
    { header: 'Total Lulus', accessor: 'lulus', align: 'right' },
    { header: 'Tidak Lulus', accessor: 'tidak_lulus', align: 'right' },
    { header: 'Belum Ditetapkan', accessor: 'belum_ditetapkan', align: 'right' },
    { header: 'Persentase Kelulusan', accessor: 'persentase_kelulusan', align: 'right', format: (v) => <span className="font-bold text-[#0E5C44] dark:text-emerald-400">{v}%</span> },
  ]

  const detailColumns = [
    { header: 'Siswa & NISN', accessor: 'nama' },
    { header: 'Unit & Kelas Akhir', accessor: 'unit' },
    { header: 'Status Kelulusan', accessor: 'status' },
    { header: 'Tanggal Penetapan', accessor: 'tanggal_kelulusan' },
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
            { label: 'Laporan Kelulusan Siswa' },
          ]}
        />
      </div>

      {/* 1. Header Laporan */}
      <ReportHeader
        title={report.title}
        description={report.description}
        periodLabel={report.period?.label}
        generatedAt={report.generated_at}
      />

      {/* 2. Ringkasan Analisis Laporan (Di bawah Header) */}
      <div className="print:hidden">
        <ReportInsightCard insights={insights} />
      </div>

      {/* 3. Catatan & Identitas Laporan */}
      <div className="print:hidden">
        <ReportNotesCard
          periodLabel={report.period?.label}
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
            <CardTitle className="text-sm font-bold text-slate-900 dark:text-white">Persentase Kelulusan per Unit Pendidikan</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={charts.pass_rate_by_unit || []}>
                  <XAxis dataKey="name" stroke="#888888" fontSize={11} />
                  <YAxis stroke="#888888" fontSize={11} domain={[0, 100]} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="persentase" name="Pass Rate (%)" fill="#0E5C44" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-slate-200/80 bg-white dark:border-slate-800 dark:bg-[#1B2433]">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold text-slate-900 dark:text-white">Komposisi Status Kelulusan</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={charts.status_kelulusan || []} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                    {(charts.status_kelulusan || []).map((_, index) => (
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
      </div>

      {/* 7. Rekap Per Unit */}
      <ReportRecapTable
        title="Rekapitulasi Hasil Kelulusan per Unit Pendidikan"
        columns={recapColumns}
        data={unit_recaps}
        totalRow={unit_recaps_total}
      />

      {/* 8. Data Rinci */}
      <ReportDetailTable
        title="Rincian Data Peserta Kelulusan"
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
        title="Detail Penetapan Kelulusan Siswa"
        data={detailModalData}
      />
    </div>
  )
}
