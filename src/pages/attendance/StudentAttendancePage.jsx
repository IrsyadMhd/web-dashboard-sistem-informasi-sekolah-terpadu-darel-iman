import { useEffect, useMemo, useState } from 'react'
import { CalendarCheck, CheckCircle2, Clock3, RefreshCw, TriangleAlert, XCircle } from 'lucide-react'
import { Link } from 'react-router-dom'
import { attendanceDashboardService } from '../../services/attendance/attendanceDashboardService'
import { MasterActionButton, MasterDataPage, MasterEmptyState, MasterErrorState, MasterPageHeader, MasterStatCard, MasterStatsGrid } from '../../components/master-data'

const today = new Date().toISOString().slice(0, 10)
const unwrap = (response) => response?.data?.data || response?.data || []
const date = (value) => value ? new Intl.DateTimeFormat('id-ID', { dateStyle: 'medium' }).format(new Date(value)) : '-'
const statusStyle = (value) => ({
  hadir: 'bg-emerald-100 text-emerald-700', terlambat: 'bg-amber-100 text-amber-700',
  izin: 'bg-blue-100 text-blue-700', sakit: 'bg-violet-100 text-violet-700', alpa: 'bg-rose-100 text-rose-700',
}[String(value).toLowerCase()] || 'bg-slate-100 text-slate-600')

export default function StudentAttendancePage() {
  const [records, setRecords] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const load = () => {
    setLoading(true); setError('')
    attendanceDashboardService.getStudentAttendance({ per_page: 100 })
      .then((response) => setRecords(unwrap(response)))
      .catch((err) => setError(err.response?.data?.message || 'Kehadiran hari ini belum dapat dimuat.'))
      .finally(() => setLoading(false))
  }
  useEffect(load, [])
  const todaysRecords = useMemo(() => records.filter((item) => String(item.tanggal || item.created_at || '').slice(0, 10) === today), [records])
  const summary = useMemo(() => ({
    hadir: todaysRecords.filter((item) => ['hadir', 'terlambat'].includes(String(item.status_hadir || item.status).toLowerCase())).length,
    terlambat: todaysRecords.filter((item) => String(item.status_hadir || item.status).toLowerCase() === 'terlambat').length,
    tidakHadir: todaysRecords.filter((item) => ['izin', 'sakit', 'alpa'].includes(String(item.status_hadir || item.status).toLowerCase())).length,
  }), [todaysRecords])

  return <MasterDataPage className="education-unit-page attendance-student-page" hideBreadcrumb>
    <MasterPageHeader title="Kehadiran Saya" description="Pantau status presensi mata pelajaran hari ini secara cepat dan transparan." tone="brand" icon={CalendarCheck} actions={<Link to="/absensi/riwayat-saya"><MasterActionButton className="education-unit-hero__action !h-11 !border-white !bg-white !text-emerald-800" icon={Clock3}>Lihat Riwayat</MasterActionButton></Link>} />
    <MasterStatsGrid className="education-unit-kpis lg:!grid-cols-3">
      <MasterStatCard icon={CheckCircle2} label="Hadir" value={summary.hadir} description="Mata pelajaran hari ini" variant="success" />
      <MasterStatCard icon={Clock3} label="Terlambat" value={summary.terlambat} description="Perlu perhatian" variant="warning" />
      <MasterStatCard icon={XCircle} label="Tidak Hadir" value={summary.tidakHadir} description="Izin, sakit, atau alpa" variant="danger" />
    </MasterStatsGrid>
    <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1fr)_280px]">
      <section className="overflow-hidden rounded-[var(--master-card-radius)] border border-slate-200/80 bg-white shadow-sm dark:border-slate-700 dark:bg-[#1B2433]">
        <div className="flex items-center justify-between border-b border-slate-200/80 px-5 py-4 dark:border-slate-700"><div><h2 className="text-base font-bold">Presensi Hari Ini</h2><p className="mt-0.5 text-xs text-slate-500">{date(today)} · berdasarkan finalisasi guru.</p></div><button type="button" onClick={load} aria-label="Muat ulang kehadiran" title="Muat ulang" className="grid h-10 w-10 place-items-center rounded-xl border border-slate-200 text-slate-500 transition hover:bg-emerald-50 hover:text-emerald-700 dark:border-slate-700"><RefreshCw className={`h-4 w-4 ${loading?'animate-spin':''}`}/></button></div>
        {error?<div className="p-5"><MasterErrorState description={error} onRetry={load}/></div>:loading?<div className="space-y-3 p-5">{[1,2,3].map(i=><div key={i} className="h-16 animate-pulse rounded-xl bg-slate-100 dark:bg-slate-800"/>)}</div>:todaysRecords.length?<div className="divide-y divide-slate-100 dark:divide-slate-800">{todaysRecords.map(item=><div key={item.id} className="flex items-center justify-between gap-4 p-5 transition hover:bg-emerald-50/40 dark:hover:bg-emerald-950/20"><div><b className="text-sm">{item.jadwal_pelajaran?.subject?.name || item.session?.subject?.name || 'Mata Pelajaran'}</b><p className="mt-1 text-xs text-slate-500">{item.arrival_time || item.jam_masuk || 'Waktu belum tercatat'} · {item.recorded_method || 'Presensi kelas'}</p></div><span className={`rounded-full px-3 py-1 text-xs font-bold capitalize ${statusStyle(item.status_hadir || item.status)}`}>{item.status_hadir || item.status || 'Belum diverifikasi'}</span></div>)}</div>:<div className="p-5"><MasterEmptyState title="Belum Ada Presensi Hari Ini" description="Presensi akan muncul setelah guru mencatat atau memfinalisasi kehadiran." /></div>}
      </section>
      <aside className="space-y-4"><section className="rounded-[18px] border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-[#1B2433]"><h2 className="text-sm font-bold">Ringkasan Hari Ini</h2><div className="mt-4 space-y-3">{[['Total sesi',todaysRecords.length],['Sudah hadir',summary.hadir],['Perlu perhatian',summary.terlambat+summary.tidakHadir]].map(([label,value])=><div key={label} className="flex items-center justify-between text-xs"><span className="text-slate-500">{label}</span><b>{value}</b></div>)}</div></section><div className="flex gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-xs text-amber-800 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-200"><TriangleAlert className="h-5 w-5 shrink-0"/><p>Status kosong bukan berarti alpa. Data muncul setelah diproses guru.</p></div></aside>
    </div>
  </MasterDataPage>
}
