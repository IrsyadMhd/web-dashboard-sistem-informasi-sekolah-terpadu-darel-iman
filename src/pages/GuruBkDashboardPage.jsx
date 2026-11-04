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

      {/* Modern Vivid Emerald Hero Header */}
      <div className="relative overflow-hidden rounded-[22px] border-2 border-emerald-500/30 bg-gradient-to-r from-emerald-500/15 via-teal-500/10 to-emerald-600/15 p-5 sm:p-6 shadow-md shadow-emerald-500/10 dark:border-emerald-600/40 dark:bg-gradient-to-r dark:from-emerald-950/70 dark:via-teal-950/50 dark:to-slate-900">
        <div className="pointer-events-none absolute -top-12 -right-12 h-48 w-48 rounded-full bg-gradient-to-br from-emerald-500/30 via-teal-400/20 to-transparent blur-3xl" />
        <div className="pointer-events-none absolute -bottom-12 -left-12 h-48 w-48 rounded-full bg-gradient-to-tr from-teal-500/20 via-emerald-400/20 to-transparent blur-3xl" />

        <div className="relative z-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex size-12 sm:size-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700 text-white shadow-xl shadow-emerald-600/40 border border-emerald-300/40 dark:from-emerald-400 dark:via-emerald-500 dark:to-teal-600">
              <ShieldCheck className="size-6 sm:size-7 text-white" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2.5 flex-wrap">
                <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-emerald-600 to-teal-600 px-3.5 py-1 text-xs font-extrabold text-white shadow-md shadow-emerald-600/30">
                  <ShieldCheck className="size-3 text-emerald-200" />
                  Konseling &amp; Proteksi BK
                </span>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100/80 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                  {context.tahun_ajaran ? `TA ${context.tahun_ajaran.nama}` : 'TA 2026/2027'} • {context.semester ? `Semester ${context.semester.nama}` : 'Semester Ganjil'}
                </span>
              </div>
              <h1 className="mt-1.5 text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                Dashboard Guru BK (Bimbingan Konseling)
              </h1>
              <p className="mt-0.5 text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-300 max-w-2xl">
                Ruang pendampingan konseling dan penanganan catatan perilaku santri yang terproteksi dan rahasia.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={() => navigate('/portal-guru/workspace')}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold shadow-md shadow-emerald-600/25 transition cursor-pointer"
            >
              <Plus className="size-4" />
              <span>Catatan Baru</span>
            </button>
            <button
              type="button"
              onClick={fetchDashboard}
              disabled={loading}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-emerald-200/80 bg-white/80 dark:border-emerald-800/80 dark:bg-slate-900/80 text-emerald-800 dark:text-emerald-300 text-xs font-bold hover:bg-emerald-50 dark:hover:bg-slate-800 transition shadow-sm cursor-pointer"
            >
              <RefreshCw className={`size-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Segarkan</span>
            </button>
          </div>
        </div>
      </div>

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
            <AppButton variant="secondary" size="sm" icon={Plus} onClick={() => navigate('/portal-guru/workspace')}>
              Tambah Catatan BK
            </AppButton>
            <AppButton variant="primary" size="sm" icon={FileText} onClick={() => navigate('/portal-guru/workspace')}>
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
