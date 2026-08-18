import { useCallback, useEffect, useMemo, useState } from 'react'
import { ReportFilters, ReportHeader, ReportState, ReportStats, ReportTable, exportCsv } from '../components/reports/ReportKit'
import { worshipAttendanceService } from '../services/worshipAttendanceService'

const today = () => new Date().toISOString().slice(0, 10)
const columns = [
  { key: 'ibadah', label: 'Ibadah', render: (row) => row.template?.nama || '-', export: (row) => row.template?.nama },
  { key: 'siswa', label: 'Siswa', render: (row) => row.student?.nama_lengkap || row.student?.full_name || '-', export: (row) => row.student?.nama_lengkap || row.student?.full_name },
  { key: 'status', label: 'Status', render: (row) => row.attendance_status || row.status || '-' },
  { key: 'scan_time', label: 'Waktu Scan' }, { key: 'method', label: 'Metode' }, { key: 'notes', label: 'Catatan' },
]

export default function RekapAbsensiIbadahPage() {
  const [date, setDate] = useState(today())
  const [rows, setRows] = useState([])
  const [sessions, setSessions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const load = useCallback(async () => {
    try {
      setLoading(true); setError('')
      const response = await worshipAttendanceService.getSessions({ date })
      const list = response.data?.data || []
      setSessions(list)
      const details = await Promise.all(list.map((session) => worshipAttendanceService.getSessionDetail(session.id)))
      setRows(details.flatMap((item) => {
        const data = item.data?.data || {}
        return (data.details || []).map((detail) => ({ ...detail, template: data.template, session: data.session }))
      }))
    } catch (err) { setError(err.response?.data?.message || 'Rekap absensi ibadah gagal dimuat.') } finally { setLoading(false) }
  }, [date])
  useEffect(() => { load() }, [load])
  const stats = useMemo(() => {
    const present = rows.filter((row) => ['hadir_berjamaah', 'hadir_sendiri'].includes(row.attendance_status)).length
    const absent = rows.filter((row) => row.attendance_status === 'tidak_hadir').length
    return [{ label: 'Sesi Ibadah', value: sessions.length, note: 'Sesi pada tanggal terpilih' }, { label: 'Data Santri', value: rows.length, note: 'Hasil CRUD presensi' }, { label: 'Hadir', value: present, note: 'Berjamaah atau sendiri' }, { label: 'Tidak Hadir', value: absent, note: 'Perlu tindak lanjut' }]
  }, [rows, sessions])
  return <section className="laporan-page"><article className="laporan-produksi">
    <ReportHeader eyebrow="Rekap Data" title="Rekap Absensi Ibadah" description="Rekapan baca-saja dari hasil verifikasi setiap sesi ibadah santri." onRefresh={load} onExport={() => exportCsv('rekap-absensi-ibadah.csv', columns, rows)} />
    <ReportFilters><label>Tanggal<input type="date" value={date} onChange={(e) => setDate(e.target.value)} /></label></ReportFilters>
    <ReportState loading={loading} error={error}><ReportStats items={stats} /><ReportTable title="Hasil CRUD Absensi Ibadah" columns={columns} rows={rows} /></ReportState>
  </article></section>
}
