import { useEffect, useState } from 'react'
import { AlertTriangle, RefreshCw, Users, UserRoundCheck, Clock3, UserX } from 'lucide-react'
import { api } from '../services/api'
import TeacherMonitoringPanel from '../components/attendance/TeacherMonitoringPanel'
import { useAuthStore } from '../stores/authStore'
import DashboardHeader from '../components/dashboard/DashboardHeader'
import KpiCardGrid from '../components/dashboard/KpiCardGrid'
import KpiCard from '../components/dashboard/KpiCard'
import { SectionCard } from '../components/app'
import PageContainer from '../components/app/PageContainer'
import AppBreadcrumb from '../components/app/AppBreadcrumb'

const cards = [
  { key: 'total_siswa', label: 'Total Siswa', icon: Users },
  { key: 'total_guru', label: 'Total Guru', icon: UserRoundCheck },
  { key: 'kehadiran_hari_ini', label: 'Kehadiran Hari Ini', icon: Clock3 },
  { key: 'statistik_ketidakhadiran', label: 'Tidak Hadir', icon: UserX },
]

export default function MonitoringDashboardPage() {
  const [dashboard, setDashboard] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [teacherMonitoring, setTeacherMonitoring] = useState(null)
  const [teacherMonitoringError, setTeacherMonitoringError] = useState('')
  const [teacherMonitoringLoading, setTeacherMonitoringLoading] = useState(true)
  const user = useAuthStore((state) => state.user)
  const canLoadSummary = user?.permissions?.includes('dashboard.pemantauan.lihat')
  const canLoadTeacherMonitoring = user?.permissions?.includes('teacher_monitoring.view')

  const loadDashboard = async () => {
    setLoading(true)
    setError('')
    try {
      const response = await api.get('/dashboard-pemantauan/ringkasan')
      setDashboard(response.data?.data ?? null)
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Data dashboard tidak dapat dimuat.')
    } finally {
      setLoading(false)
    }
  }

  const loadTeacherMonitoring = async () => {
    setTeacherMonitoringLoading(true)
    setTeacherMonitoringError('')
    try {
      const response = await api.get('/teacher-monitoring')
      setTeacherMonitoring(response.data?.data ?? null)
    } catch (requestError) {
      if (requestError.response?.status !== 403) {
        setTeacherMonitoringError(requestError.response?.data?.message || 'Monitoring guru belum dapat dimuat.')
      }
    } finally {
      setTeacherMonitoringLoading(false)
    }
  }

  useEffect(() => {
    if (canLoadSummary) loadDashboard()
    else setLoading(false)
    if (canLoadTeacherMonitoring) loadTeacherMonitoring()
    else setTeacherMonitoringLoading(false)
    const timer = window.setInterval(() => {
      if (canLoadTeacherMonitoring && document.visibilityState !== 'hidden') loadTeacherMonitoring()
    }, 20000)
    return () => window.clearInterval(timer)
  }, [canLoadSummary, canLoadTeacherMonitoring])

  if (loading) return <div className="space-y-6"><div className="h-36 animate-pulse rounded-[18px] bg-slate-200 dark:bg-slate-800" /><div className="grid grid-cols-2 gap-3 lg:grid-cols-4">{cards.map((card) => <div key={card.key} className="h-28 animate-pulse rounded-2xl bg-slate-200 dark:bg-slate-800" />)}</div></div>

  if (error && !teacherMonitoring && !teacherMonitoringLoading) {
    return <section className="m-6 rounded-2xl border border-rose-200 bg-rose-50 p-6 text-center dark:border-rose-900 dark:bg-rose-950/30"><AlertTriangle className="mx-auto h-6 w-6 text-rose-600" /><p className="mt-3 text-sm font-semibold text-rose-700 dark:text-rose-300">{error}</p><button type="button" onClick={loadDashboard} className="mt-4 inline-flex items-center gap-2 rounded-xl bg-[#0E5C44] px-4 py-2 text-sm font-semibold text-white"><RefreshCw className="h-4 w-4" />Coba Lagi</button></section>
  }

  const statistics = dashboard?.kartu_statistik || {}
  const alerts = (dashboard?.indikator_kinerja_utama || []).slice(0, 5)

  return (
    <PageContainer maxW="7xl">
      <AppBreadcrumb items={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Pemantauan Real-Time' }]} />
      <div className="space-y-6 pb-12">
      <DashboardHeader
        title="Ringkasan Operasional"
        subtitle="Pantau status kehadiran, indikator perhatian, dan aktivitas guru mengajar secara real time."
        roleName={user?.roles?.join(', ') || 'Administrator'}
      />

      {!error && (
        <>
          <KpiCardGrid cols={4}>
            {cards.map(({ key, label, icon: Icon }) => (
              <KpiCard key={key} title={label} value={Number(statistics[key] || 0).toLocaleString('id-ID')} icon={Icon} />
            ))}
          </KpiCardGrid>
          <SectionCard title="Indikator Perlu Perhatian" description="Prioritas operasional yang dikirim oleh sistem pemantauan." icon={AlertTriangle}>
            {alerts.length ? (
              <ul className="space-y-2">
                {alerts.map((item) => <li key={item.id} className="rounded-xl border border-amber-100 bg-amber-50/70 p-3 text-xs font-semibold text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/20 dark:text-amber-200">{item.nama_indikator || item.nama || 'Indikator kinerja'}</li>)}
              </ul>
            ) : <p className="text-xs text-slate-500">Belum ada indikator kinerja pada periode ini.</p>}
          </SectionCard>
        </>
      )}

      <TeacherMonitoringPanel data={teacherMonitoring} loading={teacherMonitoringLoading} error={teacherMonitoringError} onRetry={loadTeacherMonitoring} />
    </div>
    </PageContainer>
  )
}
