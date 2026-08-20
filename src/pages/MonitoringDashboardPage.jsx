import { useEffect, useState } from 'react'
import { AlertTriangle, RefreshCw, Users, UserRoundCheck, Clock3, UserX } from 'lucide-react'
import { api } from '../services/api'
import TeacherMonitoringPanel from '../components/attendance/TeacherMonitoringPanel'
import { useAuthStore } from '../stores/authStore'
import KpiCardGrid from '../components/dashboard/KpiCardGrid'
import KpiCard from '../components/dashboard/KpiCard'
import PageContainer from '../components/app/PageContainer'

import { Alert, AlertContent, AlertDescription, AlertIndicator, AlertTitle } from '@/components/tailgrids/core/alert'
import { Button } from '@/components/tailgrids/core/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/tailgrids/core/card'
import { Badge } from '@/components/tailgrids/core/badge'

const cards = [
  { key: 'total_siswa', label: 'Total Siswa', icon: Users, colorScheme: 'emerald' },
  { key: 'total_guru', label: 'Total Guru', icon: UserRoundCheck, colorScheme: 'blue' },
  { key: 'kehadiran_hari_ini', label: 'Kehadiran Hari Ini', icon: Clock3, colorScheme: 'emerald' },
  { key: 'statistik_ketidakhadiran', label: 'Tidak Hadir', icon: UserX, colorScheme: 'rose' },
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

  if (loading) {
    return (
      <PageContainer maxW="7xl">
        <div className="space-y-6 pb-12">
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {cards.map((card) => (
              <div key={card.key} className="h-28 animate-pulse rounded-2xl bg-slate-200 dark:bg-slate-800" />
            ))}
          </div>
          <div className="h-40 animate-pulse rounded-2xl bg-slate-200 dark:bg-slate-800" />
        </div>
      </PageContainer>
    )
  }

  if (error && !teacherMonitoring && !teacherMonitoringLoading) {
    return (
      <PageContainer maxW="7xl">
        <div className="py-6">
          <Alert status="error">
            <AlertIndicator />
            <AlertContent>
              <AlertTitle>Gagal Memuat Data Pemantauan</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
              <div className="mt-3">
                <Button size="sm" variant="danger" appearance="outline" onClick={loadDashboard}>
                  <RefreshCw className="mr-2 h-4 w-4" /> Coba Lagi
                </Button>
              </div>
            </AlertContent>
          </Alert>
        </div>
      </PageContainer>
    )
  }

  const statistics = dashboard?.kartu_statistik || {}
  const alerts = (dashboard?.indikator_kinerja_utama || []).slice(0, 5)

  return (
    <PageContainer maxW="7xl">
      <div className="space-y-6 pb-12">
        {!error && (
          <>
            <KpiCardGrid cols={4}>
              {cards.map(({ key, label, icon: Icon, colorScheme }) => (
                <KpiCard
                  key={key}
                  title={label}
                  value={Number(statistics[key] || 0).toLocaleString('id-ID')}
                  icon={Icon}
                  colorScheme={colorScheme}
                />
              ))}
            </KpiCardGrid>

            <Card className="border border-slate-200/80 bg-white dark:border-slate-800 dark:bg-[#1B2433]">
              <CardHeader className="flex flex-row items-center justify-between pb-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400">
                    <AlertTriangle className="h-5 w-5" />
                  </div>
                  <div>
                    <CardTitle className="text-base font-bold text-slate-900 dark:text-white">
                      Indikator Perlu Perhatian
                    </CardTitle>
                    <CardDescription className="text-xs text-slate-500 dark:text-slate-400">
                      Prioritas operasional yang dikirim oleh sistem pemantauan.
                    </CardDescription>
                  </div>
                </div>
                {alerts.length > 0 && (
                  <Badge color="warning" size="sm">
                    {alerts.length} Perhatian
                  </Badge>
                )}
              </CardHeader>
              <CardContent className="pt-2">
                {alerts.length ? (
                  <div className="space-y-2.5">
                    {alerts.map((item) => (
                      <Alert key={item.id} status="warning">
                        <AlertIndicator />
                        <AlertContent>
                          <AlertDescription className="text-xs font-semibold text-amber-900 dark:text-amber-200">
                            {item.nama_indikator || item.nama || 'Indikator kinerja'}
                          </AlertDescription>
                        </AlertContent>
                      </Alert>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs font-medium text-slate-500">Belum ada indikator kinerja pada periode ini.</p>
                )}
              </CardContent>
            </Card>
          </>
        )}

        <TeacherMonitoringPanel
          data={teacherMonitoring}
          loading={teacherMonitoringLoading}
          error={teacherMonitoringError}
          onRetry={loadTeacherMonitoring}
        />
      </div>
    </PageContainer>
  )
}

