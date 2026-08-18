import { useCallback, useEffect, useMemo, useState } from 'react'
import { ReportFilters, ReportHeader, ReportState, ReportStats, ReportTable, exportCsv } from '../components/reports/ReportKit'
import { gateAttendanceService } from '../services/gateAttendanceService'

const today = () => new Date().toISOString().slice(0, 10)
const columns = [
  { key: 'student', label: 'Siswa', render: (row) => row.student?.nama_lengkap || row.student?.full_name || '-', export: (row) => row.student?.nama_lengkap || row.student?.full_name },
  { key: 'nis', label: 'NIS/NISN', render: (row) => row.student?.nis || row.student?.nisn || '-', export: (row) => row.student?.nis || row.student?.nisn },
  { key: 'unit', label: 'Unit', render: (row) => row.education_unit?.name || '-', export: (row) => row.education_unit?.name },
  { key: 'kelas', label: 'Kelas', render: (row) => row.school_class?.name || row.school_class?.nama_kelas || '-', export: (row) => row.school_class?.name || row.school_class?.nama_kelas },
  { key: 'check_in_time', label: 'Jam Masuk' }, { key: 'check_out_time', label: 'Jam Pulang' },
  { key: 'status', label: 'Status' }, { key: 'attendance_method', label: 'Metode' },
]

export default function RekapAbsensiGerbangPage() {
  const [date, setDate] = useState(today())
  const [status, setStatus] = useState('')
  const [search, setSearch] = useState('')
  const [rows, setRows] = useState([])
  const [stats, setStats] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const load = useCallback(async () => {
    try {
      setLoading(true); setError('')
      const [logs, summary] = await Promise.all([
        gateAttendanceService.getLogs({ date, status, search, per_page: 500 }),
        gateAttendanceService.getStats({ date }),
      ])
      setRows(logs.data?.data?.data || logs.data?.data || [])
      setStats(summary.data?.data || {})
    } catch (err) { setError(err.response?.data?.message || 'Rekap absensi gerbang gagal dimuat.') } finally { setLoading(false) }
  }, [date, status, search])
  useEffect(() => { load() }, [load])
  const cards = useMemo(() => [
    { label: 'Total Siswa', value: stats.total_siswa, note: 'Siswa aktif' }, { label: 'Sudah Scan', value: stats.total_scanned, note: 'Data masuk gerbang' },
    { label: 'Terlambat', value: stats.terlambat, note: 'Perlu tindak lanjut' }, { label: 'Sudah Pulang', value: stats.sudah_pulang, note: 'Memiliki jam keluar' },
  ], [stats])
  return <section className="laporan-page"><article className="laporan-produksi">
    <ReportHeader eyebrow="Rekap Data" title="Rekap Absensi Gerbang" description="Rekapan baca-saja dari seluruh hasil scan masuk dan pulang siswa." onRefresh={load} onExport={() => exportCsv('rekap-absensi-gerbang.csv', columns, rows)} />
    <ReportFilters><label>Tanggal<input type="date" value={date} onChange={(e) => setDate(e.target.value)} /></label><label>Status<select value={status} onChange={(e) => setStatus(e.target.value)}><option value="">Semua Status</option><option value="HADIR">Hadir</option><option value="TERLAMBAT">Terlambat</option><option value="IZIN">Izin</option><option value="SAKIT">Sakit</option><option value="ALPHA">Alpha</option></select></label><label>Cari Siswa<input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Nama, NIS, atau NISN" /></label></ReportFilters>
    <ReportState loading={loading} error={error}><ReportStats items={cards} /><ReportTable title="Hasil CRUD Absensi Gerbang" columns={columns} rows={rows} /></ReportState>
  </article></section>
}
