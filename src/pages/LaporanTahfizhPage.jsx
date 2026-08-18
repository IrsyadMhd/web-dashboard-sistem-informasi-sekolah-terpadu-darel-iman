import { useCallback, useEffect, useMemo, useState } from 'react'
import { ReportFilters, ReportHeader, ReportState, ReportStats, ReportTable, exportCsv } from '../components/reports/ReportKit'
import { reportService } from '../services/reportService'

const columns = [
  { key: 'record_date', label: 'Tanggal' },
  { key: 'siswa', label: 'Siswa / Santri', render: (row) => row.student?.full_name || row.student?.nama || '-', export: (row) => row.student?.full_name || row.student?.nama },
  { key: 'nis', label: 'NIS', render: (row) => row.student?.nis || '-', export: (row) => row.student?.nis },
  { key: 'surah', label: 'Surah / Hafalan Baru', render: (row) => row.hafalan_surah_name ? `${row.hafalan_surah_name} (Ayat ${row.hafalan_ayah_start || 1}-${row.hafalan_ayah_end || '-'})` : '-', export: (row) => row.hafalan_surah_name ? `${row.hafalan_surah_name} (${row.hafalan_ayah_start}-${row.hafalan_ayah_end})` : '-' },
  { key: 'hafalan_baris', label: 'Baris Hafalan', render: (row) => row.hafalan_baris || 0 },
  { key: 'tilawah_baris', label: 'Baris Tilawah', render: (row) => row.tilawah_baris || 0 },
  { key: 'murajaah_lembar', label: 'Murajaah (Lembar)', render: (row) => row.murajaah_lembar || 0 },
  { key: 'notes_teacher', label: 'Catatan Ustadz', render: (row) => row.notes_teacher || '-' },
]

export default function LaporanTahfizhPage() {
  const [search, setSearch] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [reportData, setReportData] = useState({ summary: {}, data: [] })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = useCallback(async () => {
    try {
      setLoading(true)
      setError('')
      const result = await reportService.tahfizhReport({
        search,
        start_date: startDate,
        end_date: endDate,
      })
      setReportData({
        summary: result.summary || {},
        data: result.data || result || [],
      })
    } catch (err) {
      setError(err?.response?.data?.message || 'Laporan tahfizh & mutabaah gagal dimuat.')
    } finally {
      setLoading(false)
    }
  }, [search, startDate, endDate])

  useEffect(() => { load() }, [load])

  const stats = useMemo(() => {
    const sum = reportData.summary || {}
    const totalLogs = sum.total_logs ?? reportData.data.length
    const totalBaris = sum.total_hafalan_baris ?? reportData.data.reduce((a, b) => a + Number(b.hafalan_baris || 0), 0)
    const target = sum.target_tahunan || 50000
    const persen = sum.persentase ?? (totalBaris > 0 ? ((totalBaris / target) * 100).toFixed(1) : 0)

    return [
      { label: 'Total Setoran', value: totalLogs, note: 'Catatan log harian' },
      { label: 'Total Hafalan', value: `${totalBaris.toLocaleString('id-ID')} baris`, note: 'Capaian baris hafalan' },
      { label: 'Target Tahunan', value: `${target.toLocaleString('id-ID')} baris`, note: 'Target unit sekolah' },
      { label: 'Tercapai', value: `${persen}%`, note: 'Pencapaian target' },
    ]
  }, [reportData])

  return (
    <section className="content-grid">
      <article className="panel wide laporan-produksi">
        <ReportHeader
          eyebrow="Rekap Data"
          title="Rekap Tahfizh & Mutabaah"
          description="Rekapitulasi setoran hafalan Al-Qur’an harian, tilawah, murajaah, dan capaian santri dari backend riil."
          onRefresh={load}
          onExport={() => exportCsv('rekap-tahfizh.csv', columns, reportData.data)}
        />
        <ReportFilters>
          <label>
            Cari Santri / NIS
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Nama atau NIS" />
          </label>
          <label>
            Mulai Tanggal
            <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
          </label>
          <label>
            Sampai Tanggal
            <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
          </label>
        </ReportFilters>
        <ReportState loading={loading} error={error}>
          <ReportStats items={stats} />
          <h4>Log Setoran Hafalan & Murajaah Harian</h4>
          <ReportTable columns={columns} rows={reportData.data} />
        </ReportState>
      </article>
    </section>
  )
}
