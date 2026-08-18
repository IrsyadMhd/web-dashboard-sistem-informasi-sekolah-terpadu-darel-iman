import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Users,
  CheckCircle2,
  Clock,
  FileText,
  AlertTriangle,
  FileCheck,
  Award,
  BookOpen,
  Send,
  Eye,
  PhoneCall,
  RefreshCw,
} from 'lucide-react'
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
} from 'recharts'

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

import ChartCard from '../components/dashboard/ChartCard'
import SkeletonDashboard from '../components/dashboard/SkeletonDashboard'
import ErrorState from '../components/dashboard/ErrorState'
import KpiQuickViewModal from '../components/KpiQuickViewModal'
import ModalErrorBoundary from '../components/common/ModalErrorBoundary'

import { waliKelasDashboardService } from '../services/waliKelasDashboardService'

const COLORS = ['#0E5C44', '#F59E0B', '#3B82F6', '#EC4899', '#EF4444']

export default function WaliKelasDashboardPage() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [data, setData] = useState(null)
  const [selectedClassId, setSelectedClassId] = useState('')
  const [activeModal, setActiveModal] = useState(null)

  const fetchDashboard = async (classId = selectedClassId) => {
    setLoading(true)
    setError(null)
    try {
      const res = await waliKelasDashboardService.getOverview({ class_id: classId })
      if (res && res.data) {
        setData(res.data)
      } else {
        setError('Format respon server tidak valid.')
      }
    } catch (err) {
      console.error('Failed to load Wali Kelas dashboard:', err)
      setError(err.response?.data?.message || 'Gagal memuat data dashboard Wali Kelas.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDashboard()
  }, [])

  const handleClassChange = (classId) => {
    setSelectedClassId(classId)
    fetchDashboard(classId)
  }

  if (loading && !data) return <SkeletonDashboard />
  if (error && !data) return <ErrorState message={error} onRetry={() => fetchDashboard(selectedClassId)} />

  const kpis = data?.kpis || {}
  const context = data?.context || {}
  const charts = data?.charts || {}
  const tables = data?.tables || {}
  const rombelOptions = context.rombel_options || []

  const formatNumber = (num) => (num !== undefined && num !== null ? Number(num).toLocaleString('id-ID') : '0')

  const studentColumns = [
    {
      key: 'full_name',
      label: 'Nama Siswa',
      sortable: true,
      render: (row) => (
        <span className="font-extrabold text-slate-900 dark:text-white text-xs">{row.full_name}</span>
      ),
    },
    {
      key: 'nisn',
      label: 'NISN',
      render: (row) => <span className="text-xs font-mono text-slate-600 dark:text-slate-300">{row.nisn || '-'}</span>,
    },
    {
      key: 'gender',
      label: 'Jenis Kelamin',
      render: (row) => (
        <span className="text-xs text-slate-600 dark:text-slate-400 font-medium">
          {row.gender === 'male' || row.gender === 'L' ? 'Laki-laki' : 'Perempuan'}
        </span>
      ),
    },
    {
      key: 'is_active',
      label: 'Status',
      render: (row) => (
        <AppBadge variant={row.is_active ? 'success' : 'secondary'} dot>
          {row.is_active ? 'Aktif' : 'Non-aktif'}
        </AppBadge>
      ),
    },
  ]

  return (
    <PageContainer maxW="7xl">
      <div className="space-y-6 pb-12">
      {/* Breadcrumb Navigation */}
      <AppBreadcrumb items={[{ label: 'Dashboard Wali Kelas' }]} />

      {/* Header */}
      <AppPageHeader
        variant="brand"
        title={`Dashboard Wali Kelas — ${context.rombel?.nama || 'Rombel Binaan'}`}
        eyebrow="Classroom Management & Homeroom Monitoring"
        description="Monitoring presensi, akademik, tahfizh, mutabaah, dan kelengkapan catatan siswa rombel binaan."
        welcomeName="Wali Kelas"
        chips={[
          context.rombel?.nama ? `Rombel: ${context.rombel.nama}` : 'Rombel Binaan',
          context.tahun_ajaran ? `TA ${context.tahun_ajaran.nama}` : 'TBA 2026/2027',
          context.semester ? `Semester ${context.semester.nama}` : 'Semester Ganjil',
        ]}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <AppButton variant="accent" size="sm" icon={CheckCircle2} onClick={() => navigate('/absensi/dashboard-wali-kelas')}>
              Presensi Rombel
            </AppButton>
            <AppButton variant="outline" size="sm" icon={RefreshCw} onClick={() => fetchDashboard(selectedClassId)} className="border-white/30 text-white hover:bg-white/10">
              Segarkan Data
            </AppButton>
          </div>
        }
      />

      {/* Filter Bar */}
      <AppFilterBar
        label="Filter Rombel Binaan"
        onReset={() => handleClassChange('')}
        extraFilters={
          rombelOptions.length > 1 && (
            <select
              value={selectedClassId || context.rombel?.id || ''}
              onChange={(e) => handleClassChange(e.target.value)}
              className="h-9 rounded-xl border border-slate-200 bg-slate-50/50 px-3 text-xs font-medium text-slate-700 outline-hidden focus:border-[#0E5C44] focus:ring-1 focus:ring-[#0E5C44] dark:border-slate-800 dark:bg-slate-800 dark:text-slate-200"
            >
              {rombelOptions.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.nama_kelas}
                </option>
              ))}
            </select>
          )
        }
      />

      {/* Primary KPI Grid */}
      <section className="space-y-3">
        <SectionHeader title="Kondisi Presensi & Izin Siswa Rombel" subtitle="Jumlah siswa, tingkat kehadiran hari ini, dan permohonan izin" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiCard
            title="Total Siswa Rombel"
            value={formatNumber(kpis.total_siswa_rombel?.total)}
            icon={Users}
            colorScheme="emerald"
            badge="Binaan"
            badgeVariant="success"
            onClick={() => setActiveModal('total_siswa_rombel')}
          />
          <KpiCard
            title="Hadir Hari Ini"
            value={formatNumber(kpis.siswa_hadir_hari_ini?.total)}
            icon={CheckCircle2}
            colorScheme="blue"
            badge="Presensi"
            badgeVariant="info"
          />
          <KpiCard
            title="Terlambat Hari Ini"
            value={formatNumber(kpis.siswa_terlambat?.total)}
            icon={Clock}
            colorScheme="amber"
            badge="Scan Gerbang"
            badgeVariant="warning"
          />
          <KpiCard
            title="Permohonan Izin / Sakit"
            value={formatNumber(kpis.pending_permissions?.total)}
            icon={FileText}
            colorScheme="rose"
            badge="Perlu Approval"
            badgeVariant="danger"
            onClick={() => setActiveModal('pending_permissions')}
          />
        </div>
      </section>

      {/* Secondary KPI Grid */}
      <section className="space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiCard
            title="Catatan Siswa Aktif"
            value={formatNumber(kpis.active_student_notes?.total)}
            icon={AlertTriangle}
            colorScheme="amber"
            badge="Catatan Wali"
            onClick={() => setActiveModal('active_student_notes')}
          />
          <KpiCard
            title="Tindak Lanjut Catatan"
            value={formatNumber(kpis.followup_notes?.total)}
            icon={FileCheck}
            colorScheme="emerald"
            badge="Ditindaklanjuti"
          />
          <KpiCard
            title="Mutabaah Belum TTD Ortu"
            value={formatNumber(kpis.unsigned_parent_notes?.total)}
            icon={Award}
            colorScheme="rose"
            badge="Pending Ortu"
          />
          <KpiCard
            title="Izin Perlu Verifikasi"
            value={formatNumber(kpis.pending_permissions?.total)}
            icon={CheckCircle2}
            colorScheme="indigo"
            badge="Verifikasi"
          />
        </div>
      </section>

      {/* Quick Action Navigation */}
      <section className="rounded-[18px] border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-[#1B2433]">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">Aksi Cepat Wali Kelas</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Pintas manajemen presensi rombel, catatan wali, dan rekap mutabaah</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <AppButton variant="secondary" size="sm" icon={CheckCircle2} onClick={() => navigate('/absensi/dashboard-wali-kelas')}>
              Presensi Rombel
            </AppButton>
            <AppButton variant="secondary" size="sm" icon={FileText} onClick={() => navigate('/absensi/dashboard-wali-kelas')}>
              Input Catatan Wali
            </AppButton>
            <AppButton variant="secondary" size="sm" icon={FileCheck} onClick={() => navigate('/absensi/rekap-kehadiran')}>
              Rekap Presensi
            </AppButton>
            <AppButton variant="primary" size="sm" icon={BookOpen} onClick={() => navigate('/portal-guru/workspace?tab=tahfizh')}>
              Rekap Tahfizh
            </AppButton>
          </div>
        </div>
      </section>

      {/* Attendance Chart & Students Table */}
      <section className="space-y-3">
        <SectionHeader title="Distribusi Presensi & Daftar Siswa Rombel" subtitle="Persentase kehadiran hari ini dan tabel siswa binaan" />
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          <ChartCard
            title="Distribusi Presensi Siswa Rombel Hari Ini"
            subtitle="Persentase kehadiran per kategori presensi"
            className="lg:col-span-4"
            empty={!charts.attendance_distribution || charts.attendance_distribution.length === 0}
          >
            <div className="h-64 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={charts.attendance_distribution || []}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="total"
                    nameKey="status"
                  >
                    {(charts.attendance_distribution || []).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>

          <div className="lg:col-span-8">
            <AppDataTable
              title="Daftar Siswa Rombel"
              description="Identitas dan status siswa binaan di rombel ini"
              data={tables.students || []}
              columns={studentColumns}
              keyField="full_name"
              searchPlaceholder="Cari nama atau NISN..."
            />
          </div>
        </div>
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
