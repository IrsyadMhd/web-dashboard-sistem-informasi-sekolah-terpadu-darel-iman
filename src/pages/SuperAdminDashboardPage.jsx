import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Building2,
  Users,
  UserCheck,
  GraduationCap,
  HeartHandshake,
  School,
  Layers,
  ShieldCheck,
  UserX,
  Plus,
  Activity,
  UserPlus,
  Key,
  FileText,
  RefreshCw,
  Search,
} from 'lucide-react'
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
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
  ActionDropdown,
  PageContainer,
} from '../components/app'
import { Button } from '../components/tailgrids/core/button'
import Progress from '../components/tailgrids/core/progress'

import ChartCard from '../components/dashboard/ChartCard'
import SkeletonDashboard from '../components/dashboard/SkeletonDashboard'
import ErrorState from '../components/dashboard/ErrorState'
import KpiQuickViewModal from '../components/KpiQuickViewModal'
import ModalErrorBoundary from '../components/common/ModalErrorBoundary'

import { superAdminDashboardService } from '../services/superAdminDashboardService'

export default function SuperAdminDashboardPage() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [data, setData] = useState(null)
  const [activeModal, setActiveModal] = useState(null)

  const fetchDashboard = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await superAdminDashboardService.getOverview()
      if (res && res.data) {
        setData(res.data)
      } else {
        setError('Format respon server tidak valid.')
      }
    } catch (err) {
      console.error('Failed to load super admin dashboard:', err)
      setError(err.response?.data?.message || 'Gagal memuat data dashboard Super Admin.')
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
  const charts = data?.charts || {}
  const unitSummaries = data?.unit_summaries || []
  const recentLogins = data?.recent_logins || []

  const formatNumber = (num) => (num !== undefined && num !== null ? Number(num).toLocaleString('id-ID') : '0')

  const unitColumns = [
    {
      key: 'name',
      label: 'Nama Unit Pendidikan',
      sortable: true,
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#0E5C44]/10 text-[#0E5C44] font-black text-xs dark:bg-[#3FBF75]/20 dark:text-[#3FBF75]">
            {(row.code || row.name || 'UN').substring(0, 3).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="font-extrabold text-slate-900 dark:text-white truncate">{row.name}</p>
            <p className="text-[11px] text-slate-400 font-medium">{row.code || 'Unit Sekolah'}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'siswa_count',
      label: 'Siswa Aktif',
      sortable: true,
      render: (row) => (
        <span className="font-extrabold text-[#0E5C44] dark:text-[#3FBF75]">
          {formatNumber(row.siswa_count)} Siswa
        </span>
      ),
    },
    {
      key: 'guru_count',
      label: 'Guru',
      sortable: true,
      render: (row) => <span className="font-bold text-slate-800 dark:text-slate-200">{formatNumber(row.guru_count)}</span>,
    },
    {
      key: 'pegawai_count',
      label: 'Pegawai',
      sortable: true,
      hideOnMobile: true,
      render: (row) => <span className="font-semibold text-slate-600 dark:text-slate-400">{formatNumber(row.pegawai_count)}</span>,
    },
    {
      key: 'status',
      label: 'Status',
      render: (row) => (
        <AppBadge variant={row.status === 'Aktif' || row.status === 'aktif' ? 'success' : 'secondary'} dot>
          {row.status || 'Aktif'}
        </AppBadge>
      ),
    },
  ]

  const loginColumns = [
    {
      key: 'name',
      label: 'Nama / Email',
      render: (row) => (
        <div className="min-w-0">
          <p className="font-bold text-slate-900 dark:text-white truncate text-xs">{row.name}</p>
          <p className="text-[10px] text-slate-400 truncate">{row.email}</p>
        </div>
      ),
    },
    {
      key: 'created_at',
      label: 'Waktu Login',
      render: (row) => <span className="text-xs text-slate-500 font-medium">{row.created_at || 'Baru saja'}</span>,
    },
  ]

  return (
    <PageContainer maxW="7xl">
      <div className="space-y-6 pb-12">
        {/* Breadcrumb Navigation */}
        <AppBreadcrumb items={[{ label: 'Dashboard Super Admin' }]} />

        {/* Header */}
        <AppPageHeader
          variant="brand"
          title="Dashboard Utama Super Admin"
          eyebrow="System Management & Administration"
          description="Pantau dan kelola seluruh unit pendidikan, data master, hak akses pengguna, serta performa sistem terpadu."
          welcomeName="Super Admin"
          chips={[
            context.tahun_ajaran ? `Tahun Ajaran ${context.tahun_ajaran.nama}` : 'TBA 2026/2027',
            context.semester ? `Semester ${context.semester.nama}` : 'Semester Ganjil',
            'Sistem Manajemen Terpadu',
          ]}
          actions={
            <div className="flex flex-wrap items-center gap-2">
              <AppButton variant="accent" size="sm" icon={Plus} onClick={() => navigate('/dashboard/master/unit-pendidikan')}>
                Tambah Unit
              </AppButton>
              <AppButton variant="outline" size="sm" icon={RefreshCw} onClick={fetchDashboard} className="border-white/30 text-white hover:bg-white/10">
                Segarkan Data
              </AppButton>
            </div>
          }
        />

        {/* Filter Bar */}
        <AppFilterBar label="Filter Sistem" onReset={fetchDashboard} />

        {/* Primary KPI Grid */}
        <section className="space-y-3">
          <SectionHeader title="Metrik Utama Sistem & Unit" subtitle="Ringkasan agregat dari seluruh modul dan unit pendidikan" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <KpiCard
              title="Total Unit Pendidikan"
              value={formatNumber(kpis.total_units?.total)}
              icon={Building2}
              colorScheme="emerald"
              progress={Math.min(100, (kpis.total_units?.total || 0) * 6.67)}
              progressColorScheme="emerald"
              badge="Terdaftar"
              badgeVariant="success"
              onClick={() => setActiveModal('total_units')}
            />
            <KpiCard
              title="Unit Sekolah Aktif"
              value={formatNumber(kpis.active_units?.total)}
              icon={School}
              colorScheme="blue"
              progress={kpis.total_units?.total ? Math.min(100, ((kpis.active_units?.total || 0) / (kpis.total_units?.total || 1)) * 100) : 100}
              progressColorScheme="blue"
              badge="Aktif"
              badgeVariant="info"
              onClick={() => setActiveModal('active_units')}
            />
            <KpiCard
              title="Total Pegawai & Tendik"
              value={formatNumber(kpis.total_employees?.total)}
              icon={UserCheck}
              colorScheme="violet"
              progress={Math.min(100, (kpis.total_employees?.total || 0) * 2.7)}
              progressColorScheme="violet"
              badge="SDM Staf"
              badgeVariant="purple"
              onClick={() => setActiveModal('total_employees')}
            />
            <KpiCard
              title="Total Guru Pengajar"
              value={formatNumber(kpis.total_teachers?.total)}
              icon={GraduationCap}
              colorScheme="indigo"
              progress={kpis.total_employees?.total ? Math.min(100, ((kpis.total_teachers?.total || 0) / (kpis.total_employees?.total || 1)) * 100) : 100}
              progressColorScheme="indigo"
              badge="Pendidik"
              badgeVariant="success"
              onClick={() => setActiveModal('total_teachers')}
            />
          </div>
        </section>

        {/* Secondary KPI Grid */}
        <section className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <KpiCard
              title="Total Siswa Aktif"
              value={formatNumber(kpis.total_students?.total)}
              icon={Users}
              colorScheme="emerald"
              progress={Math.min(100, (kpis.total_students?.total || 0) * 3)}
              progressColorScheme="emerald"
              badge="Siswa"
              badgeVariant="success"
              onClick={() => setActiveModal('total_students')}
            />
            <KpiCard
              title="Total Orang Tua"
              value={formatNumber(kpis.total_parents?.total)}
              icon={HeartHandshake}
              colorScheme="rose"
              progress={kpis.total_students?.total ? Math.min(100, ((kpis.total_parents?.total || 0) / (kpis.total_students?.total || 1)) * 100) : 100}
              progressColorScheme="rose"
              badge="Wali"
              badgeVariant="warning"
              onClick={() => setActiveModal('total_parents')}
            />
            <KpiCard
              title="Total Rombel / Kelas"
              value={formatNumber(kpis.total_rombel?.total || kpis.total_classes?.total)}
              icon={Layers}
              colorScheme="blue"
              progress={Math.min(100, ((kpis.total_rombel?.total || kpis.total_classes?.total || 0) * 1.4))}
              progressColorScheme="blue"
              badge="Rombel"
              badgeVariant="info"
              onClick={() => setActiveModal('total_rombel')}
            />
            <KpiCard
              title="Total Alumni"
              value={formatNumber(kpis.total_alumni?.total)}
              icon={GraduationCap}
              colorScheme="amber"
              progress={Math.min(100, (kpis.total_alumni?.total || 0) * 33)}
              progressColorScheme="amber"
              badge="Lulusan"
              badgeVariant="purple"
              onClick={() => setActiveModal('total_alumni')}
            />
          </div>
        </section>

        {/* System Security & User Health KPIs */}
        <section className="space-y-3">
          <SectionHeader title="Keamanan & Pengguna Sistem" subtitle="Status akun terdaftar, hak akses, dan kesehatan otentikasi" />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <KpiCard
              title="Pengguna Sistem Aktif"
              value={formatNumber(kpis.active_users?.total)}
              icon={ShieldCheck}
              colorScheme="emerald"
              progress={kpis.total_users?.total ? Math.min(100, ((kpis.active_users?.total || 0) / (kpis.total_users?.total || 1)) * 100) : 100}
              progressColorScheme="emerald"
              badge="User"
              onClick={() => setActiveModal('active_users')}
            />
            <KpiCard
              title="Role Terdaftar"
              value={formatNumber(kpis.active_roles?.total)}
              icon={Key}
              colorScheme="indigo"
              progress={Math.min(100, (kpis.active_roles?.total || 0) * 10)}
              progressColorScheme="indigo"
              badge="Spatie Roles"
              onClick={() => setActiveModal('active_roles')}
            />
            <KpiCard
              title="User Tanpa Role"
              value={formatNumber(kpis.users_without_role?.total)}
              icon={UserX}
              colorScheme="rose"
              progress={kpis.total_users?.total ? Math.min(100, ((kpis.users_without_role?.total || 0) / (kpis.total_users?.total || 1)) * 100) : 0}
              progressColorScheme="rose"
              badge="Perlu Action"
              badgeVariant="danger"
              onClick={() => setActiveModal('users_without_role')}
            />
          </div>
        </section>

        {/* Quick Action Navigation */}
        <section className="rounded-[18px] border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-[#1B2433]">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">Aksi Cepat Super Admin</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Pintas manajemen data master dan konfigurasi sistem</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Button variant="primary" appearance="outline" size="sm" icon={<Plus className="h-3.5 w-3.5" />} onClick={() => navigate('/dashboard/master/unit-pendidikan')}>
                Tambah Unit
              </Button>
              <Button variant="primary" appearance="outline" size="sm" icon={<UserPlus className="h-3.5 w-3.5" />} onClick={() => navigate('/dashboard/employees')}>
                Tambah Pegawai
              </Button>
              <Button variant="primary" appearance="outline" size="sm" icon={<Users className="h-3.5 w-3.5" />} onClick={() => navigate('/dashboard/students')}>
                Tambah Siswa
              </Button>
              <Button variant="primary" appearance="fill" size="sm" icon={<Key className="h-3.5 w-3.5" />} onClick={() => navigate('/dashboard/hak-akses')}>
                Kelola Role & Permissions
              </Button>
            </div>
          </div>
        </section>

        {/* Charts Section */}
        <section className="space-y-3">
          <SectionHeader title="Visualisasi Distribusi SDM & Siswa" subtitle="Grafik perbandingan kesiswaan dan kepegawaian antar unit" />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <ChartCard
              title="Distribusi Siswa per Unit Pendidikan"
              subtitle="Jumlah siswa aktif terdaftar di masing-masing unit"
              empty={!charts.student_distribution || charts.student_distribution.length === 0}
            >
              <div className="h-64 w-full pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={charts.student_distribution || []}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                    <XAxis dataKey="name" stroke="#888888" fontSize={11} />
                    <YAxis stroke="#888888" fontSize={11} />
                    <Tooltip />
                    <Bar dataKey="total" fill="#0E5C44" radius={[6, 6, 0, 0]} name="Siswa" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </ChartCard>

            <ChartCard
              title="Distribusi Guru & Pegawai per Unit"
              subtitle="Perbandingan jumlah guru dan tenaga kependidikan"
              empty={!charts.staff_distribution || charts.staff_distribution.length === 0}
            >
              <div className="h-64 w-full pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={charts.staff_distribution || []}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                    <XAxis dataKey="name" stroke="#888888" fontSize={11} />
                    <YAxis stroke="#888888" fontSize={11} />
                    <Tooltip />
                    <Bar dataKey="guru" fill="#1E8E5A" radius={[6, 6, 0, 0]} name="Guru" />
                    <Bar dataKey="pegawai" fill="#3FBF75" radius={[6, 6, 0, 0]} name="Pegawai" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </ChartCard>
          </div>
        </section>

        {/* Data Tables Section */}
        <section className="space-y-3">
          <SectionHeader title="Ringkasan Master Unit & Log Sesi User" subtitle="Daftar unit sekolah dan audit sesi login pengguna terbaru" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2">
              <AppDataTable
                title="Ringkasan Master Unit Pendidikan"
                description="Data statistik unit terdaftar dalam sistem"
                data={unitSummaries}
                columns={unitColumns}
                keyField="id"
                searchPlaceholder="Cari unit..."
                onView={(row) => navigate(`/dashboard/master/unit-pendidikan`)}
              />
            </div>

            <div className="lg:col-span-1">
              <AppDataTable
                title="User Login Terbaru"
                description="Daftar sesi masuk pengguna terkini"
                data={recentLogins}
                columns={loginColumns}
                keyField="id"
                showToolbar={false}
                showPagination={false}
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
