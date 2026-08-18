import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { BookOpen, Calendar, Target, Award, FileSpreadsheet, CheckSquare, RefreshCw } from 'lucide-react'

import {
  AppPageHeader,
  AppBreadcrumb,
  AppFilterBar,
  KpiCard,
  AppBadge,
  AppButton,
  SectionHeader,
  PageContainer,
} from '../components/app'

import SkeletonDashboard from '../components/dashboard/SkeletonDashboard'
import ErrorState from '../components/dashboard/ErrorState'

import { managementDashboardService } from '../services/managementDashboardService'

export default function WakaKurikulumDashboardPage() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [data, setData] = useState(null)

  const fetchDashboard = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await managementDashboardService.getWakaKurikulum()
      if (res && res.data) {
        setData(res.data)
      } else {
        setError('Format respon server tidak valid.')
      }
    } catch (err) {
      console.error('Failed to load Waka Kurikulum dashboard:', err)
      setError(err.response?.data?.message || 'Gagal memuat data dashboard Waka Kurikulum.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDashboard()
  }, [])

  if (loading && !data) return <SkeletonDashboard />
  if (error && !data) return <ErrorState message={error} onRetry={fetchDashboard} />

  const kpis = data?.kpis || {}
  const context = data?.context || {}

  const formatNumber = (num) => (num !== undefined && num !== null ? Number(num).toLocaleString('id-ID') : '0')

  return (
    <PageContainer maxW="7xl">
      <div className="space-y-6 pb-12">
      {/* Breadcrumb Navigation */}
      <AppBreadcrumb items={[{ label: 'Dashboard Waka Kurikulum' }]} />

      {/* Header */}
      <AppPageHeader
        variant="brand"
        title="Dashboard Waka Kurikulum"
        eyebrow="Curriculum Management & Academic Planning"
        description="Kelola dan monitor kesiapan kurikulum, jadwal pelajaran, perangkat ajar CP/TP, kisi-kisi, dan evaluasi CBT."
        welcomeName="Wakil Kurikulum"
        chips={[
          context.tahun_ajaran ? `TA ${context.tahun_ajaran.nama}` : 'TBA 2026/2027',
          context.semester ? `Semester ${context.semester.nama}` : 'Semester Ganjil',
          'Scope: Bidang Kurikulum',
        ]}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <AppButton variant="accent" size="sm" icon={BookOpen} onClick={() => navigate('/dashboard/master/kurikulum')}>
              Master Kurikulum
            </AppButton>
            <AppButton variant="outline" size="sm" icon={RefreshCw} onClick={fetchDashboard} className="border-white/30 text-white hover:bg-white/10">
              Segarkan Data
            </AppButton>
          </div>
        }
      />

      {/* Filter Bar */}
      <AppFilterBar label="Filter Perencanaan Kurikulum" onReset={fetchDashboard} />

      {/* Primary KPI Grid */}
      <section className="space-y-3">
        <SectionHeader title="Metrik Mata Pelajaran & Perangkat Ajar" subtitle="Jumlah mata pelajaran, jadwal, CP, dan TP terdaftar" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiCard
            title="Mata Pelajaran Aktif"
            value={formatNumber(kpis.total_subjects?.total)}
            icon={BookOpen}
            colorScheme="emerald"
            badge="Mapel"
            badgeVariant="success"
          />
          <KpiCard
            title="Jadwal Pelajaran"
            value={formatNumber(kpis.total_schedules?.total)}
            icon={Calendar}
            colorScheme="blue"
            badge="Jadwal"
            badgeVariant="info"
          />
          <KpiCard
            title="Capaian Pembelajaran (CP)"
            value={formatNumber(kpis.total_cp?.total)}
            icon={Target}
            colorScheme="violet"
            badge="CP Kurikulum"
            badgeVariant="purple"
          />
          <KpiCard
            title="Tujuan Pembelajaran (TP)"
            value={formatNumber(kpis.total_tp?.total)}
            icon={Award}
            colorScheme="indigo"
            badge="TP Matrik"
            badgeVariant="success"
          />
        </div>
      </section>

      {/* Secondary Assessment KPIs */}
      <section className="space-y-3">
        <SectionHeader title="Kesiapan LMS & Evaluasi Pembelajaran" subtitle="Modul ajar, kisi-kisi, bank soal, dan ujian CBT" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiCard
            title="Modul Ajar"
            value={formatNumber(kpis.total_modul_ajar?.total)}
            icon={FileSpreadsheet}
            colorScheme="emerald"
            badge="Modul"
          />
          <KpiCard
            title="Kisi-kisi Ujian"
            value={formatNumber(kpis.total_kisi_kisi?.total)}
            icon={CheckSquare}
            colorScheme="amber"
            badge="Kisi-kisi"
          />
          <KpiCard
            title="Bank Soal Terdaftar"
            value={formatNumber(kpis.total_bank_soal?.total)}
            icon={BookOpen}
            colorScheme="blue"
            badge="Soal"
          />
          <KpiCard
            title="Ujian CBT Diselenggarakan"
            value={formatNumber(kpis.total_ujian_cbt?.total)}
            icon={Calendar}
            colorScheme="indigo"
            badge="Ujian CBT"
          />
        </div>
      </section>
    </div>
    </PageContainer>
  )
}
