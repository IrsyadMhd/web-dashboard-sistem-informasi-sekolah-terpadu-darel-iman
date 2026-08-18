import React, { useState, useEffect } from 'react'
import { GraduationCap, Award, CheckCircle2, XCircle, Clock, Percent, Heart, Trophy, Medal } from 'lucide-react'
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

const COLORS = ['#0E5C44', '#1E8E5A', '#3FBF75', '#0284C7', '#6366F1', '#EC4899', '#F59E0B']

export function LaporanKelulusanPage() {
  const [filters, setFilters] = useState({ period: 'year', page: 1, per_page: 15, search: '' })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [reportData, setReportData] = useState(null)

  const [isPreviewOpen, setIsPreviewOpen] = useState(false)
  const [isExportOpen, setIsExportOpen] = useState(false)
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

  const handleConfirmExport = ({ format, orientation }) => {
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
    { header: 'NIS', accessor: 'nis' },
    { header: 'NISN', accessor: 'nisn' },
    { header: 'Nama Siswa', accessor: 'nama' },
    { header: 'Unit Pendidikan', accessor: 'unit' },
    { header: 'Kelas Akhir', accessor: 'kelas_akhir' },
    { header: 'Tahun Lulus', accessor: 'tahun_lulus' },
    { header: 'Status Kelulusan', accessor: 'status_kelulusan' },
    { header: 'Tanggal Penetapan', accessor: 'tanggal_kelulusan' },
  ]

  return (
    <div className="space-y-6 pb-12">
      {/* 1. Header */}
      <ReportHeader
        title={report.title}
        description={report.description}
        periodLabel={report.period.label}
        generatedAt={report.generated_at}
        onRefresh={fetchReport}
        onOpenPreview={() => setIsPreviewOpen(true)}
        onPrint={() => window.print()}
        onExportPdf={() => setIsExportOpen(true)}
        onExportExcel={() => setIsExportOpen(true)}
        loading={loading}
      />

      {/* 2. Filter Periode */}
      <ReportPeriodFilter
        period={filters.period}
        startDate={filters.tanggal_mulai}
        endDate={filters.tanggal_selesai}
        onChange={handlePeriodChange}
        onReset={handleResetFilter}
      />

      {/* 3. KPI Grid */}
      <ReportKpiGrid items={kpiItems} />

      {/* 4. Visual Charts */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-[#1B2433] space-y-3">
          <h3 className="font-bold text-slate-900 dark:text-white text-sm">Persentase Kelulusan per Unit Pendidikan</h3>
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
        </div>

        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-[#1B2433] space-y-3">
          <h3 className="font-bold text-slate-900 dark:text-white text-sm">Komposisi Status Kelulusan</h3>
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
        </div>
      </div>

      {/* 5. Rekap Per Unit */}
      <ReportRecapTable
        title="Rekapitulasi Hasil Kelulusan per Unit Pendidikan"
        columns={recapColumns}
        data={unit_recaps}
        totalRow={unit_recaps_total}
      />

      {/* 6. Data Rinci */}
      <ReportDetailTable
        title="Rincian Data Peserta Kelulusan"
        columns={detailColumns}
        data={details}
        meta={meta}
        search={filters.search}
        onSearchChange={(val) => setFilters((prev) => ({ ...prev, search: val, page: 1 }))}
        onPageChange={(page) => setFilters((prev) => ({ ...prev, page }))}
        onViewDetail={handleViewDetail}
      />

      {/* 7. Summary Insights */}
      <ReportInsightCard insights={insights} />

      {/* 8. Notes */}
      <ReportNotesCard
        periodLabel={report.period.label}
        generatedAt={report.generated_at}
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
