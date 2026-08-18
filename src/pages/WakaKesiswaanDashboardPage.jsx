import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Users, UserCheck, Clock, UserX, FileText, Award, RefreshCw } from 'lucide-react'

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

export default function WakaKesiswaanDashboardPage() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [data, setData] = useState(null)

  const fetchDashboard = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await managementDashboardService.getWakaKesiswaan()
      if (res && res.data) {
        setData(res.data)
      } else {
        setError('Format respon server tidak valid.')
      }
    } catch (err) {
      console.error('Failed to load Waka Kesiswaan dashboard:', err)
      setError(err.response?.data?.message || 'Gagal memuat data dashboard Waka Kesiswaan.')
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
      <AppBreadcrumb items={[{ label: 'Dashboard Waka Kesiswaan' }]} />

      {/* Header */}
      <AppPageHeader
        variant="brand"
        title="Dashboard Waka Kesiswaan"
        eyebrow="Student Affairs & Discipline Oversight"
        description="Pantau kedisiplinan, keterlambatan gerbang, permohonan izin, prestasi siswa, dan catatan perilaku kesiswaan."
        welcomeName="Wakil Kesiswaan"
        chips={[
          context.tahun_ajaran ? `TA ${context.tahun_ajaran.nama}` : 'TBA 2026/2027',
          context.semester ? `Semester ${context.semester.nama}` : 'Semester Ganjil',
          'Scope: Bidang Kesiswaan',
        ]}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <AppButton variant="accent" size="sm" icon={Award} onClick={() => navigate('/dashboard/laporan-siswa')}>
              Rekap Prestasi
            </AppButton>
            <AppButton variant="outline" size="sm" icon={RefreshCw} onClick={fetchDashboard} className="border-white/30 text-white hover:bg-white/10">
              Segarkan Data
            </AppButton>
          </div>
        }
      />

      {/* Filter Bar */}
      <AppFilterBar label="Filter Kesiswaan" onReset={fetchDashboard} />

      {/* Primary KPI Grid */}
      <section className="space-y-3">
        <SectionHeader title="Kondisi Kesiswaan & Prestasi" subtitle="Total populasi siswa aktif dan capaian prestasi terverifikasi" />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <KpiCard
            title="Total Siswa Terdaftar"
            value={formatNumber(kpis.total_siswa?.total)}
            icon={Users}
            colorScheme="emerald"
            badge="Siswa Total"
            badgeVariant="success"
          />
          <KpiCard
            title="Siswa Aktif"
            value={formatNumber(kpis.siswa_aktif?.total)}
            icon={UserCheck}
            colorScheme="blue"
            badge="Aktif Studi"
            badgeVariant="info"
          />
          <KpiCard
            title="Prestasi Siswa"
            value={formatNumber(kpis.prestasi_siswa?.total)}
            icon={Award}
            colorScheme="amber"
            badge="Prestasi"
            badgeVariant="warning"
          />
        </div>
      </section>

      {/* Secondary Discipline KPIs */}
      <section className="space-y-3">
        <SectionHeader title="Monitoring Kedisiplinan & Presensi Harian" subtitle="Tingkat keterlambatan, ketidakhadiran, dan catatan kesiswaan" />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <KpiCard
            title="Siswa Terlambat Hari Ini"
            value={formatNumber(kpis.siswa_terlambat?.total)}
            icon={Clock}
            colorScheme="amber"
            badge="Scan Gerbang"
            badgeVariant="warning"
          />
          <KpiCard
            title="Tidak Hadir Hari Ini"
            value={formatNumber(kpis.siswa_tidak_hadir?.total)}
            icon={UserX}
            colorScheme="rose"
            badge="Tanpa Keterangan"
            badgeVariant="danger"
          />
          <KpiCard
            title="Catatan Siswa / Perilaku"
            value={formatNumber(kpis.catatan_siswa?.total)}
            icon={FileText}
            colorScheme="indigo"
            badge="Catatan Kesiswaan"
          />
        </div>
      </section>
    </div>
    </PageContainer>
  )
}
