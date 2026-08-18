import React, { useState, useEffect } from 'react'
import { GraduationCap, Heart, BookOpen, Briefcase, Building, HelpCircle, PhoneCall, Trophy } from 'lucide-react'
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

export function LaporanAlumniPage() {
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

  const handleConfirmExport = ({ format, orientation }) => {
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
    { header: 'NIS / NISN', accessor: 'nis_nisn' },
    { header: 'Nama Alumni', accessor: 'nama' },
    { header: 'Unit Asal', accessor: 'unit_asal' },
    { header: 'Angkatan', accessor: 'angkatan' },
    { header: 'Tahun Lulus', accessor: 'tahun_lulus' },
    { header: 'Pendidikan / Pekerjaan', accessor: 'pendidikan_pekerjaan' },
    { header: 'Status', accessor: 'status' },
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
          <h3 className="font-bold text-slate-900 dark:text-white text-sm">Alumni per Unit Asal & Karir</h3>
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
        </div>

        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-[#1B2433] space-y-3">
          <h3 className="font-bold text-slate-900 dark:text-white text-sm">Status Pendidikan & Pekerjaan Alumni</h3>
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
        </div>
      </div>

      {/* 5. Rekap Per Unit */}
      <ReportRecapTable
        title="Rekapitulasi Alumni per Unit Asal Pendidikan"
        columns={recapColumns}
        data={unit_recaps}
        totalRow={unit_recaps_total}
      />

      {/* 5b. Rekap Per Angkatan */}
      {batch_recaps && batch_recaps.length > 0 && (
        <ReportRecapTable
          title="Rekapitulasi Alumni per Angkatan"
          columns={batchColumns}
          data={batch_recaps}
        />
      )}

      {/* 6. Data Rinci */}
      <ReportDetailTable
        title="Rincian Data Alumni"
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
        title="Detail Profile & Karir Alumni"
        data={detailModalData}
      />
    </div>
  )
}
