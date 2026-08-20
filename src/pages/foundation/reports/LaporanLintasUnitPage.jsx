import React, { useState, useEffect } from 'react'
import { Building2, Users, GraduationCap, ArrowRightLeft, Award, School, Scale, TrendingUp } from 'lucide-react'
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts'
import { reportService } from '../../../services/reportService'
import { ReportHeader } from '../../../components/reports/ReportHeader'
import { ReportPeriodFilter } from '../../../components/reports/ReportPeriodFilter'
import { ReportKpiGrid } from '../../../components/reports/ReportKpiGrid'
import { ReportRecapTable } from '../../../components/reports/ReportRecapTable'
import { ReportInsightCard } from '../../../components/reports/ReportInsightCard'
import { ReportNotesCard } from '../../../components/reports/ReportNotesCard'
import { ReportPreviewModal } from '../../../components/reports/ReportPreviewModal'
import { ReportExportModal } from '../../../components/reports/ReportExportModal'
import { ReportSkeleton } from '../../../components/reports/ReportSkeleton'
import { ReportEmptyState } from '../../../components/reports/ReportEmptyState'
import { ReportErrorState } from '../../../components/reports/ReportErrorState'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/tailgrids/core/card'

export function LaporanLintasUnitPage() {
  const [filters, setFilters] = useState({ period: 'year' })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [reportData, setReportData] = useState(null)

  const [isPreviewOpen, setIsPreviewOpen] = useState(false)
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

  const handlePeriodChange = (periodObj) => {
    setFilters((prev) => ({ ...prev, ...periodObj }))
  }

  const handleResetFilter = () => {
    setFilters({ period: 'year' })
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
    const url = reportService.exportFoundationReport('lintas-unit', { ...filters, format, orientation })
    window.open(url, '_blank')
  }

  if (loading && !reportData) return <ReportSkeleton />
  if (error) return <ReportErrorState onRetry={fetchReport} />
  if (!reportData || !reportData.summary) return <ReportEmptyState onReset={handleResetFilter} />

  const { summary, charts, main_comparison, ratio_table, comparison_total, insights, report } = reportData

  const kpiItems = [
    { title: 'Total Unit Pendidikan', value: summary.total_unit, unit: 'Unit', icon: Building2, iconBg: 'bg-emerald-50 text-[#0E5C44] dark:bg-emerald-950/40 dark:text-emerald-300' },
    { title: 'Total SDM Pegawai', value: summary.total_sdm, unit: 'SDM', icon: Users, iconBg: 'bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-300' },
    { title: 'Total Siswa Aktif', value: summary.total_siswa, unit: 'Siswa', icon: GraduationCap, iconBg: 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-300' },
    { title: 'Total Mutasi (In/Out)', value: summary.total_mutasi, unit: 'Mutasi', icon: ArrowRightLeft, iconBg: 'bg-teal-50 text-teal-600 dark:bg-teal-950/40 dark:text-teal-300' },
    { title: 'Total Kelulusan', value: summary.total_kelulusan, unit: 'Lulus', icon: Award, iconBg: 'bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-300' },
    { title: 'Rata-rata Siswa / Guru', value: `1 : ${summary.avg_siswa_per_guru}`, unit: 'Rasio', icon: Scale, iconBg: 'bg-sky-50 text-sky-600 dark:bg-sky-950/40 dark:text-sky-300' },
    { title: 'Rata-rata Siswa / Rombel', value: summary.avg_siswa_per_rombel, unit: 'Siswa', icon: School, iconBg: 'bg-pink-50 text-pink-600 dark:bg-pink-950/40 dark:text-pink-300' },
    { title: 'Unit Siswa Terbanyak', value: summary.unit_siswa_terbanyak, unit: 'Top', icon: TrendingUp, iconBg: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-300' },
  ]

  const mainColumns = [
    { header: 'Unit Pendidikan', accessor: 'unit_name' },
    { header: 'Guru', accessor: 'guru', align: 'right' },
    { header: 'Pegawai', accessor: 'pegawai', align: 'right' },
    { header: 'Siswa Aktif', accessor: 'siswa', align: 'right' },
    { header: 'Siswa Baru', accessor: 'siswa_baru', align: 'right' },
    { header: 'Mutasi Masuk', accessor: 'mutasi_masuk', align: 'right' },
    { header: 'Mutasi Keluar', accessor: 'mutasi_keluar', align: 'right' },
    { header: 'Kelulusan', accessor: 'lulus', align: 'right' },
    { header: 'Alumni', accessor: 'alumni', align: 'right' },
    { header: 'Kelas', accessor: 'kelas', align: 'right' },
    { header: 'Rombel', accessor: 'rombel', align: 'right' },
  ]

  const ratioColumns = [
    { header: 'Unit Pendidikan', accessor: 'unit_name' },
    { header: 'Rasio Siswa/Guru', accessor: 'siswa_guru', align: 'center' },
    { header: 'Rasio Siswa/Rombel', accessor: 'siswa_rombel', align: 'center' },
    { header: 'Guru per Rombel', accessor: 'guru_rombel', align: 'center' },
    { header: 'Pertumbuhan Siswa', accessor: 'pertumbuhan_siswa', align: 'right', format: (v) => <span className="font-bold text-[#0E5C44] dark:text-emerald-400">{v}</span> },
    { header: 'Persentase Kelulusan', accessor: 'persentase_kelulusan', align: 'right', format: (v) => <span className="font-bold text-blue-600 dark:text-blue-400">{v}</span> },
  ]

  return (
    <div className="laporan-page-content space-y-6 pb-12">
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

      {/* 5. Executive KPI Grid */}
      <ReportKpiGrid items={kpiItems} />

      {/* 6. Visual Charts */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 print:hidden">
        <Card className="border border-slate-200/80 bg-white dark:border-slate-800 dark:bg-[#1B2433]">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold text-slate-900 dark:text-white">Perbandingan Populasi Siswa per Unit</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={charts.perbandingan_siswa || []}>
                  <XAxis dataKey="name" stroke="#888888" fontSize={11} />
                  <YAxis stroke="#888888" fontSize={11} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="siswa" name="Siswa Aktif" fill="#0E5C44" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="siswa_baru" name="Siswa Baru" fill="#3FBF75" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-slate-200/80 bg-white dark:border-slate-800 dark:bg-[#1B2433]">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold text-slate-900 dark:text-white">Radar Perbandingan Dinormalisasi (Skala 0 - 100)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={charts.radar_normalized || []}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="unit" stroke="#888888" fontSize={10} />
                  <PolarRadiusAxis domain={[0, 100]} />
                  <Radar name="Skor Populasi Siswa" dataKey="siswa_norm" stroke="#0E5C44" fill="#0E5C44" fillOpacity={0.4} />
                  <Radar name="Skor SDM" dataKey="sdm_norm" stroke="#0284C7" fill="#0284C7" fillOpacity={0.4} />
                  <Tooltip />
                  <Legend />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 7. Tabel Perbandingan Utama */}
      <ReportRecapTable
        title="Tabel Perbandingan Utama Lintas Unit"
        description="Agregasi seluruh indikator operasional utama per Unit Pendidikan."
        columns={mainColumns}
        data={main_comparison}
        totalRow={comparison_total}
      />

      {/* 8. Tabel Rasio & Efisiensi */}
      <ReportRecapTable
        title="Tabel Rasio & Efisiensi Operasional Unit"
        description="Analisis rasio kecukupan guru, kepadatan rombel, dan efisiensi akademis."
        columns={ratioColumns}
        data={ratio_table}
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
    </div>
  )
}
