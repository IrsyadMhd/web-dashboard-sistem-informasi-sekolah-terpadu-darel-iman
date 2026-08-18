import { useCallback, useEffect, useMemo, useState } from 'react'
import { ReportFilters, ReportHeader, ReportState, ReportStats, ReportTable, exportCsv } from '../components/reports/ReportKit'
import { reportService } from '../services/reportService'

const columns = [
  { key: 'nis', label: 'NIS', render: (row) => row.nis || '-' },
  { key: 'full_name', label: 'Nama Alumni', render: (row) => row.full_name || row.nama || '-', export: (row) => row.full_name || row.nama },
  { key: 'gender', label: 'JK', render: (row) => row.gender || row.jenis_kelamin || '-' },
  { key: 'unit', label: 'Unit Pendidikan', render: (row) => row.education_unit?.name || row.unit?.name || '-', export: (row) => row.education_unit?.name || row.unit?.name },
  { key: 'tahun_lulus', label: 'Tahun Lulus', render: (row) => row.metadata?.tahun_lulus || new Date(row.updated_at).getFullYear() },
  { key: 'status', label: 'Status Alumni', render: (row) => row.metadata?.status_alumni || 'Tamat / Alumni', export: (row) => row.metadata?.status_alumni || 'Tamat / Alumni' },
]

export default function LaporanAlumniPage() {
  const [search, setSearch] = useState('')
  const [rows, setRows] = useState([])
  const [dashboard, setDashboard] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = useCallback(async () => {
    try {
      setLoading(true)
      setError('')
      const [list, stats] = await Promise.all([
        reportService.alumni({ search }),
        reportService.alumniStats(),
      ])
      setRows(list.data || list || [])
      setDashboard(stats.data || stats || {})
    } catch (err) {
      setError(err?.response?.data?.message || 'Laporan alumni & prestasi gagal dimuat.')
    } finally {
      setLoading(false)
    }
  }, [search])

  useEffect(() => { load() }, [load])

  const stats = useMemo(() => [
    { label: 'Total Alumni', value: dashboard.total_alumni || rows.length, note: 'Siswa tamat/alumni' },
    { label: 'Total Prestasi', value: dashboard.total_prestasi || 0, note: 'Tercatat di sistem' },
    { label: 'Lulus Tahun Ini', value: dashboard.lulus_tahun_ini || 0, note: 'Tahun kelulusan berjalan' },
    { label: 'Persentase Kelulusan', value: `${dashboard.persentase_kelulusan || 100}%`, note: 'Kelulusan kumulatif' },
  ], [dashboard, rows])

  return (
    <section className="laporan-page">
      <article className="laporan-produksi">
        <ReportHeader
          eyebrow="Rekap Data"
          title="Rekap Prestasi & Alumni"
          description="Rekapitulasi kelulusan siswa, penelusuran tamatan alumni, dan rekap prestasi dari backend riil."
          onRefresh={load}
          onExport={() => exportCsv('rekap-alumni.csv', columns, rows)}
        />
        <ReportFilters>
          <label>
            Cari Alumni
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Nama, NIS, atau NISN" />
          </label>
        </ReportFilters>
        <ReportState loading={loading} error={error}>
          <ReportStats items={stats} />
          <ReportTable title="Daftar Data Alumni" columns={columns} rows={rows} />
        </ReportState>
      </article>
    </section>
  )
}
