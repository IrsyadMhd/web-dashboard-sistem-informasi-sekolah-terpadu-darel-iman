import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { FileText, ShieldCheck, Users, AlertTriangle, Plus, RefreshCw } from 'lucide-react'

import {
  AppPageHeader,
  AppBreadcrumb,
  AppFilterBar,
  KpiCard,
  AppDataTable,
  AppBadge,
  AppButton,
  SectionHeader,
  PageContainer,
} from '../components/app'

import SkeletonDashboard from '../components/dashboard/SkeletonDashboard'
import ErrorState from '../components/dashboard/ErrorState'
import KpiQuickViewModal from '../components/KpiQuickViewModal'
import ModalErrorBoundary from '../components/common/ModalErrorBoundary'

import { managementDashboardService } from '../services/managementDashboardService'

export default function GuruBkDashboardPage() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [data, setData] = useState(null)
  const [activeModal, setActiveModal] = useState(null)

  const fetchDashboard = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await managementDashboardService.getGuruBk()
      if (res && res.data) {
        setData(res.data)
      } else {
        setError('Format respon server tidak valid.')
      }
    } catch (err) {
      console.error('Failed to load Guru BK dashboard:', err)
      setError(err.response?.data?.message || 'Gagal memuat data dashboard Guru BK.')
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
  const tables = data?.tables || {}

  const formatNumber = (num) => (num !== undefined && num !== null ? Number(num).toLocaleString('id-ID') : '0')

  const caseColumns = [
    {
      key: 'student',
      label: 'Nama Siswa',
      render: (row) => <span className="font-extrabold text-slate-900 dark:text-white text-xs">{row.student?.full_name || 'Siswa'}</span>,
    },
    {
      key: 'category',
      label: 'Kategori',
      render: (row) => <AppBadge variant="info">{row.category || 'Konseling'}</AppBadge>,
    },
    {
      key: 'title',
      label: 'Judul Catatan',
      render: (row) => <span className="font-bold text-slate-800 dark:text-slate-200 text-xs">{row.title || 'Catatan Pendampingan'}</span>,
    },
    {
      key: 'priority',
      label: 'Prioritas',
      render: (row) => (
        <AppBadge variant={row.priority === 'Tinggi' || row.priority === 'High' ? 'danger' : 'warning'} dot>
          {row.priority || 'Normal'}
        </AppBadge>
      ),
    },
    {
      key: 'date',
      label: 'Tanggal',
      render: (row) => <span className="text-xs text-slate-500 font-medium">{row.date || (row.created_at ? new Date(row.created_at).toLocaleDateString('id-ID') : '-')}</span>,
    },
  ]

  return (
    <PageContainer maxW="7xl">
      <div className="space-y-6 pb-12">
      {/* Breadcrumb Navigation */}
      <AppBreadcrumb items={[{ label: 'Dashboard Guru BK' }]} />

      {/* Header */}
      <AppPageHeader
        variant="brand"
        title="Dashboard Guru BK (Bimbingan Konseling)"
        eyebrow="Student Counseling & Confidential Guidance"
        description="Ruang pendampingan konseling dan penanganan catatan perilaku siswa yang terproteksi dan rahasia."
        welcomeName="Guru BK"
        chips={[
          context.tahun_ajaran ? `TA ${context.tahun_ajaran.nama}` : 'TBA 2026/2027',
          context.semester ? `Semester ${context.semester.nama}` : 'Semester Ganjil',
          'Scope: Konseling & Proteksi BK',
        ]}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <AppButton variant="accent" size="sm" icon={Plus} onClick={() => navigate('/dashboard/guru/student-notes')}>
              Catatan Baru
            </AppButton>
            <AppButton variant="outline" size="sm" icon={RefreshCw} onClick={fetchDashboard} className="border-white/30 text-white hover:bg-white/10">
              Segarkan Data
            </AppButton>
          </div>
        }
      />

      {/* Filter Bar */}
      <AppFilterBar label="Filter Kasus Konseling" onReset={fetchDashboard} />

      {/* Primary KPI Grid */}
      <section className="space-y-3">
        <SectionHeader title="Kondisi Kasus & Pendampingan Konseling" subtitle="Total catatan konseling, siswa didampingi, dan kasus butuh tindak lanjut" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiCard
            title="Total Catatan Konseling"
            value={formatNumber(kpis.total_konseling?.total)}
            icon={FileText}
            colorScheme="emerald"
            badge="Catatan BK"
            badgeVariant="success"
            onClick={() => setActiveModal('total_konseling')}
          />
          <KpiCard
            title="Siswa Dalam Pendampingan"
            value={formatNumber(kpis.siswa_dalam_pendampingan?.total)}
            icon={Users}
            colorScheme="blue"
            badge="Didampingi"
            badgeVariant="info"
          />
          <KpiCard
            title="Butuh Tindak Lanjut"
            value={formatNumber(kpis.kasus_menunggu_tindak_lanjut?.total)}
            icon={AlertTriangle}
            colorScheme="amber"
            badge="Pending"
            badgeVariant="warning"
          />
          <KpiCard
            title="Kasus Prioritas Tinggi"
            value={formatNumber(kpis.kasus_prioritas_tinggi?.total)}
            icon={AlertTriangle}
            colorScheme="rose"
            badge="Prioritas"
            badgeVariant="danger"
          />
        </div>
      </section>

      {/* Security Banner */}
      <section className="flex items-center gap-3 p-4 rounded-[18px] border border-emerald-200 bg-emerald-50/60 dark:border-emerald-900/50 dark:bg-emerald-950/30 text-emerald-900 dark:text-emerald-200">
        <ShieldCheck className="h-6 w-6 text-[#0E5C44] dark:text-[#3FBF75] shrink-0" />
        <div className="text-xs">
          <span className="font-bold block text-sm">Proteksi Kerahasiaan Data BK Terjamin</span>
          Catatan konseling dan pendampingan siswa hanya dapat diakses oleh konselor / guru BK yang berwenang.
        </div>
      </section>

      {/* Quick Action Navigation */}
      <section className="rounded-[18px] border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-[#1B2433]">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">Aksi Cepat Guru BK</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Pintas penambahan dan penelusuran catatan konseling siswa</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <AppButton variant="secondary" size="sm" icon={Plus} onClick={() => navigate('/dashboard/guru/student-notes')}>
              Tambah Catatan BK
            </AppButton>
            <AppButton variant="primary" size="sm" icon={FileText} onClick={() => navigate('/dashboard/guru/student-notes')}>
              Lihat Catatan Siswa
            </AppButton>
          </div>
        </div>
      </section>

      {/* Active Cases Table */}
      <section className="space-y-3">
        <AppDataTable
          title="Daftar Pendampingan / Catatan Konseling Terbaru"
          description="Informasi umum pendampingan siswa terdaftar"
          data={tables.cases || []}
          columns={caseColumns}
          keyField="student"
          searchPlaceholder="Cari siswa atau catatan konseling..."
        />
      </section>

      {/* KPI Detail Modal */}
      <ModalErrorBoundary onClose={() => setActiveModal(null)}>
        <KpiQuickViewModal
          type={activeModal}
          isOpen={Boolean(activeModal)}
          onClose={() => setActiveModal(null)}
        />
      </ModalErrorBoundary>
    </div>
    </PageContainer>
  )
}
