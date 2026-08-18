import React, { useState, useEffect, useCallback } from 'react'
import PropTypes from 'prop-types'
import { useNavigate } from 'react-router-dom'
import {
  Search,
  RefreshCw,
  Building2,
  UserCheck,
  Users,
  GraduationCap,
  HeartHandshake,
  Sparkles,
  School,
  Layers,
  ArrowRight,
  AlertCircle,
  TrendingUp,
  Eye,
  Key,
  ShieldCheck,
  UserX,
  FileSpreadsheet,
} from 'lucide-react'
import api from '../services/api'
import { useAuthStore } from '../stores/authStore'
import { Modal } from './ui/modal'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { Skeleton } from './ui/skeleton'
import { EmptyState } from './ui/empty-state'
import KpiDetailDrawer from './KpiDetailDrawer'

const MODAL_CONFIGS = {
  unit_pendidikan: {
    title: 'Data Unit Pendidikan',
    subtitle: 'Ringkasan Seluruh Unit Pendidikan Aktif Yayasan',
    icon: Building2,
    endpoint: '/foundation/units',
    linkTo: '/dashboard/master/unit-pendidikan',
  },
  guru: {
    title: 'Data Guru & Tenaga Pendidik',
    subtitle: 'Daftar Tenaga Pendidik Aktif di Seluruh Unit',
    icon: UserCheck,
    endpoint: '/foundation/teachers',
    linkTo: '/dashboard/master/guru',
  },
  pegawai: {
    title: 'Data Pegawai & Tendik',
    subtitle: 'Daftar Seluruh Pegawai dan Staf Kependidikan',
    icon: Users,
    endpoint: '/foundation/employees',
    linkTo: '/dashboard/master/pegawai',
  },
  siswa: {
    title: 'Data Siswa Aktif',
    subtitle: 'Daftar Seluruh Peserta Didik Aktif Yayasan',
    icon: GraduationCap,
    endpoint: '/foundation/students',
    linkTo: '/dashboard/master/siswa',
  },
  orang_tua: {
    title: 'Data Orang Tua / Wali',
    subtitle: 'Daftar Orang Tua dan Wali Murid Terdaftar',
    icon: HeartHandshake,
    endpoint: '/foundation/parents',
    linkTo: '/dashboard/master/orang-tua',
  },
  alumni: {
    title: 'Data Alumni',
    subtitle: 'Daftar Peserta Didik yang Telah Lulus',
    icon: Sparkles,
    endpoint: '/foundation/alumni',
    linkTo: '/dashboard/master/alumni',
  },
  kelas: {
    title: 'Data Kelas',
    subtitle: 'Daftar Ruang Kelas pada Tahun Ajaran Aktif',
    icon: School,
    endpoint: '/foundation/classes',
    linkTo: '/dashboard/akademik/kelas',
  },
  rombel: {
    title: 'Data Rombongan Belajar (Rombel)',
    subtitle: 'Daftar Rombel & Kapasitas Peserta Didik',
    icon: Layers,
    endpoint: '/foundation/rombel',
    linkTo: '/dashboard/akademik/rombel',
  },
  pengguna: {
    title: 'Data Pengguna Sistem Aktif',
    subtitle: 'Daftar Akun Aktif yang Dapat Mengakses Sistem',
    icon: ShieldCheck,
    endpoint: '/hak-akses/users',
    defaultParams: { status: 'aktif' },
    linkTo: '/dashboard/hak-akses',
  },
  role: {
    title: 'Data Role Terdaftar',
    subtitle: 'Daftar Role dan Cakupan Hak Akses Sistem',
    icon: Key,
    endpoint: '/hak-akses/roles',
    linkTo: '/dashboard/hak-akses',
  },
  pengguna_tanpa_role: {
    title: 'Data User Tanpa Role',
    subtitle: 'Daftar Akun yang Belum Memiliki Role Sistem',
    icon: UserX,
    endpoint: '/hak-akses/users',
    defaultParams: { role_status: 'without_role' },
    linkTo: '/dashboard/hak-akses',
  },
  laporan_lintas_unit: {
    title: 'Laporan Lintas Unit Pendidikan',
    subtitle: 'Rekapitulasi Data & Ekspor Laporan Lintas Unit',
    icon: FileSpreadsheet,
    endpoint: '/foundation/units',
    linkTo: '/dashboard/yayasan/laporan',
  },
}

const KEY_ALIASES = {
  total_units: 'unit_pendidikan',
  total_unit: 'unit_pendidikan',
  unit: 'unit_pendidikan',
  units: 'unit_pendidikan',
  active_units: 'unit_pendidikan',
  unit_pendidikan: 'unit_pendidikan',

  total_teachers: 'guru',
  total_guru: 'guru',
  teachers: 'guru',
  pegawai_guru: 'pegawai',

  total_employees: 'pegawai',
  total_pegawai: 'pegawai',
  employees: 'pegawai',
  total_users: 'pengguna',
  active_users: 'pengguna',
  users: 'pengguna',

  total_students: 'siswa',
  total_siswa: 'siswa',
  total_siswa_aktif: 'siswa',
  students: 'siswa',
  santri_binaan: 'siswa',
  total_siswa_binaan: 'siswa',

  total_parents: 'orang_tua',
  total_ortu: 'orang_tua',
  parents: 'orang_tua',

  total_alumni: 'alumni',

  total_classes: 'kelas',
  total_kelas: 'kelas',
  classes: 'kelas',

  total_rombel: 'rombel',
  rombel: 'rombel',

  active_roles: 'role',
  roles: 'role',

  users_without_role: 'pengguna_tanpa_role',
  laporan: 'laporan_lintas_unit',
  laporan_lintas_unit: 'laporan_lintas_unit',
}

export default function KpiQuickViewModal({ type, isOpen, onClose }) {
  const navigate = useNavigate()
  const user = useAuthStore((state) => state.user)
  const resolvedType = KEY_ALIASES[type] || type
  const config = MODAL_CONFIGS[resolvedType]

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(false)
  const [items, setItems] = useState([])
  const [stats, setStats] = useState(null)
  const [units, setUnits] = useState([])

  // Filters
  const [search, setSearch] = useState('')
  const [selectedUnit, setSelectedUnit] = useState('all')
  const [selectedStatus, setSelectedStatus] = useState('all')

  // Row Detail Drawer State
  const [selectedDetailId, setSelectedDetailId] = useState(null)
  const [selectedDetailType, setSelectedDetailType] = useState(null)

  // Role & Permission check for "Lihat Detail" button
  const userRoles = user?.roles || []
  const userPermissions = user?.permissions || []
  const canAccessDetail =
    userRoles.some((r) =>
      ['Super Admin', 'Ketua Yayasan', 'Kepala Sekolah', 'Administrator', 'Admin', 'Operator', 'Staf', 'Guru'].includes(r)
    ) || userPermissions.length > 0

  // Fetch Units for Filter Dropdown
  useEffect(() => {
    if (isOpen) {
      api.get('/foundation/units')
        .then((res) => {
          const raw = res.data?.data || []
          setUnits(Array.isArray(raw) ? raw : raw.data || [])
        })
        .catch(() => {})
    }
  }, [isOpen])

  // Fetch Main Table & Stats Data
  const fetchData = useCallback(async () => {
    if (!config) return
    setLoading(true)
    setError(false)

    try {
      const defaultParams = {
        ...(config.defaultParams || {}),
        ...(type === 'active_units' ? { status: 'aktif' } : {}),
      }
      const params = {
        ...defaultParams,
        search: search || undefined,
        unit_id: selectedUnit !== 'all' ? selectedUnit : undefined,
        ...(selectedStatus !== 'all' ? { status: selectedStatus } : {}),
        per_page: 100,
      }

      const res = await api.get(config.endpoint, { params })
      const resData = res.data

      let dataList = []
      let summaryData = null

      if (Array.isArray(resData)) {
        dataList = resData
      } else if (resData?.data) {
        if (Array.isArray(resData.data)) {
          dataList = resData.data
        } else if (resData.data.data && Array.isArray(resData.data.data)) {
          dataList = resData.data.data
        } else if (typeof resData.data === 'object') {
          dataList = resData.data.data || resData.data.items || []
        }
      }

      summaryData = resData?.summary || resData?.data?.summary || resData?.meta || null

      setItems(dataList)
      setStats(summaryData)
    } catch (err) {
      console.error(`Failed to fetch ${type} data for modal:`, err)
      setError(true)
    } finally {
      setLoading(false)
    }
  }, [config, type, search, selectedUnit, selectedStatus])

  useEffect(() => {
    if (isOpen && type) {
      fetchData()
    } else {
      setItems([])
      setStats(null)
      setSearch('')
      setSelectedUnit('all')
      setSelectedStatus('all')
      setError(false)
      setSelectedDetailId(null)
    }
  }, [isOpen, type, fetchData])

  // Escape key handler
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        if (selectedDetailId) {
          setSelectedDetailId(null)
        } else {
          onClose()
        }
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, selectedDetailId, onClose])

  if (!isOpen || !config) return null

  const IconComponent = config.icon || Building2
  const filteredItems = (Array.isArray(items) ? items : []).filter((row) => {
    if (!search) return true
    const q = search.toLowerCase()
    const nameStr = String(row.name || row.nama || row.full_name || row.judul || '').toLowerCase()
    const codeStr = String(row.code || row.kode || row.niy || row.nisn || '').toLowerCase()
    const jenisStr = String(row.jenis_unit || row.level || row.location || row.kepala_sekolah || '').toLowerCase()
    return nameStr.includes(q) || codeStr.includes(q) || jenisStr.includes(q)
  })
  const previewItems = filteredItems.slice(0, 100)

  const handleOpenRowDetail = (rowId) => {
    setSelectedDetailType(resolvedType)
    setSelectedDetailId(rowId)
  }

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        maxWidth="max-w-6xl"
        title={
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
              <IconComponent className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white leading-tight">
                {config.title}
              </h3>
              <p className="text-xs text-slate-500 font-medium dark:text-slate-400">
                {config.subtitle}
              </p>
            </div>
          </div>
        }
        footer={
          <div className="flex w-full flex-col sm:flex-row items-center justify-between gap-3">
            <div className="text-xs text-slate-500 font-medium">
              Menampilkan <span className="font-bold text-slate-800 dark:text-white">{previewItems.length}</span> dari <span className="font-bold text-slate-800 dark:text-white">{items.length}</span> data.
            </div>
            <div className="flex items-center gap-2.5">
              {/* Tutup -> Secondary / Abu-abu */}
              <Button
                variant="secondary"
                size="sm"
                onClick={onClose}
                className="rounded-xl font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 px-4"
              >
                Tutup
              </Button>

              {/* Refresh -> Outline Hijau */}
              <Button
                variant="outline"
                size="sm"
                onClick={fetchData}
                disabled={loading}
                className="gap-1.5 rounded-xl border-emerald-600 text-emerald-700 hover:bg-emerald-50 dark:border-emerald-500 dark:text-emerald-400 font-bold px-4"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </Button>

              {/* Lihat Detail -> Primary Hijau (Filtered by Role & Permission) */}
              {canAccessDetail && (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => {
                    onClose()
                    navigate(config.linkTo)
                  }}
                  className="gap-2 rounded-xl bg-[#0E5C44] hover:bg-[#083A2A] text-white font-bold shadow-md px-4"
                >
                  <span>Lihat Detail</span>
                  <ArrowRight className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        }
      >
        <div className="space-y-5">
          {/* 1. TOP SUMMARY CARDS & SPARKLINE OVERVIEW */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <RenderStatsOverview type={type} items={items} stats={stats} loading={loading} />
          </div>

          {/* 2. SEARCH & FILTER BAR */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-200/80 dark:bg-[#13221f]/50 dark:border-slate-800">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={`Cari data ${config.title.toLowerCase()}...`}
                className="w-full pl-10 pr-4 py-2 text-xs font-medium bg-white dark:bg-[#1B2433] border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-800 dark:text-slate-100"
              />
            </div>

            <div className="flex items-center gap-2">
              {!['unit_pendidikan', 'role', 'pengguna', 'pengguna_tanpa_role'].includes(resolvedType) && units.length > 0 && (
                <select
                  value={selectedUnit}
                  onChange={(e) => setSelectedUnit(e.target.value)}
                  className="px-3 py-2 text-xs font-medium bg-white dark:bg-[#1B2433] border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-800 dark:text-slate-100"
                >
                  <option value="all">Semua Unit</option>
                  {units.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name || u.code}
                    </option>
                  ))}
                </select>
              )}

              {resolvedType !== 'role' && resolvedType !== 'pengguna_tanpa_role' && (
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="px-3 py-2 text-xs font-medium bg-white dark:bg-[#1B2433] border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-800 dark:text-slate-100"
                >
                  <option value="all">Semua Status</option>
                  <option value="aktif">Aktif</option>
                  <option value="nonaktif">Nonaktif</option>
                </select>
              )}
            </div>
          </div>

          {/* 3. CONTENT TABLE PREVIEW (MAX 10 ITEMS) / SKELETON / ERROR / EMPTY STATE */}
          {loading ? (
            <RenderTableSkeleton />
          ) : error ? (
            <div className="flex flex-col items-center justify-center p-8 text-center rounded-2xl border border-rose-200 bg-rose-50/50 dark:border-rose-900/30 dark:bg-rose-950/20">
              <AlertCircle className="h-10 w-10 text-rose-500 mb-2" />
              <h4 className="text-sm font-bold text-slate-800 dark:text-white">Data tidak dapat dimuat</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm">
                Terjadi kesalahan saat mengunduh data dari server. Silakan coba beberapa saat lagi.
              </p>
              <Button variant="primary" size="sm" onClick={fetchData} className="mt-4 gap-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl">
                <RefreshCw className="h-3.5 w-3.5" />
                <span>Coba Lagi</span>
              </Button>
            </div>
          ) : items.length === 0 ? (
            <EmptyState
              title="Belum Ada Data"
              description={`Tidak ada record data ${config.title.toLowerCase()} yang sesuai dengan filter pencarian.`}
            />
          ) : (
            <div className="overflow-x-auto rounded-2xl border border-slate-200/80 dark:border-slate-800">
              <RenderKpiTable type={resolvedType} items={previewItems} onViewDetail={handleOpenRowDetail} />
            </div>
          )}
        </div>
      </Modal>

      {/* ITEM DETAIL DRAWER (PANEL SAMPING KANAN) */}
      <KpiDetailDrawer
        type={selectedDetailType}
        id={selectedDetailId}
        isOpen={Boolean(selectedDetailId)}
        onClose={() => setSelectedDetailId(null)}
      />
    </>
  )
}

KpiQuickViewModal.propTypes = {
  type: PropTypes.string,
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
}

// Sub-component: Statistics Summary Cards + Sparkline Badges
function RenderStatsOverview({ type, items, stats, loading }) {
  if (loading) {
    return [1, 2, 3, 4].map((i) => (
      <div key={i} className="p-3 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700 space-y-2">
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-6 w-12" />
      </div>
    ))
  }

  const statCardsMap = {
    unit_pendidikan: [
      { label: 'Total Unit', val: items.length, trend: 'Aktif', color: 'text-emerald-600' },
      { label: 'Unit Aktif', val: items.filter((u) => u.is_active).length, trend: '100%', color: 'text-blue-600' },
      { label: 'Total Guru', val: items.reduce((acc, u) => acc + Number(u.guru_count || 0), 0), trend: 'SDM', color: 'text-purple-600' },
      { label: 'Total Siswa', val: items.reduce((acc, u) => acc + Number(u.siswa_aktif_count || 0), 0), trend: 'Siswa', color: 'text-amber-600' },
    ],
    guru: [
      { label: 'Total Guru', val: stats?.total || items.length, trend: 'Pendidik', color: 'text-emerald-600' },
      { label: 'Guru Aktif', val: items.filter((g) => g.status === 'aktif' || g.status === 'Active' || !g.status).length, trend: 'Aktif', color: 'text-blue-600' },
      { label: 'Guru Tetap', val: items.filter((g) => (g.status_pegawai || '').toLowerCase().includes('tetap')).length || items.length, trend: 'Tetap', color: 'text-indigo-600' },
      { label: 'Guru Honorer', val: items.filter((g) => (g.status_pegawai || '').toLowerCase().includes('honorer')).length, trend: 'Honorer', color: 'text-amber-600' },
    ],
    pegawai: [
      { label: 'Total Pegawai', val: stats?.total || items.length, trend: 'SDM', color: 'text-emerald-600' },
      { label: 'Pegawai Aktif', val: items.filter((p) => p.status === 'aktif' || p.status === 'Active' || !p.status).length, trend: 'Aktif', color: 'text-blue-600' },
      { label: 'Pegawai Cuti', val: items.filter((p) => (p.status || '').toLowerCase().includes('cuti')).length, trend: 'Cuti', color: 'text-amber-600' },
      { label: 'Pegawai Nonaktif', val: items.filter((p) => (p.status || '').toLowerCase().includes('nonaktif')).length, trend: 'Nonaktif', color: 'text-rose-600' },
    ],
    siswa: [
      { label: 'Total Siswa', val: stats?.total || items.length, trend: 'Peserta Didik', color: 'text-emerald-600' },
      { label: 'Laki-laki', val: items.filter((s) => s.gender === 'male' || s.gender === 'L').length, trend: 'Siswa L', color: 'text-blue-600' },
      { label: 'Perempuan', val: items.filter((s) => s.gender === 'female' || s.gender === 'P').length, trend: 'Siswi P', color: 'text-rose-600' },
      { label: 'Siswa Aktif', val: items.filter((s) => s.is_active).length, trend: 'Aktif', color: 'text-indigo-600' },
    ],
    orang_tua: [
      { label: 'Total Orang Tua', val: stats?.total || items.length, trend: 'Wali Murid', color: 'text-emerald-600' },
      { label: 'NIK Ayah Terisi', val: stats?.father ?? items.filter((p) => p.father_nik).length, trend: 'Ayah', color: 'text-blue-600' },
      { label: 'NIK Ibu Terisi', val: stats?.mother ?? items.filter((p) => p.mother_nik).length, trend: 'Ibu', color: 'text-rose-600' },
      { label: 'Wali Lainnya', val: stats?.guardian ?? items.filter((p) => !p.father_nik && !p.mother_nik).length, trend: 'Wali', color: 'text-amber-600' },
    ],
    alumni: [
      { label: 'Total Alumni', val: items.length, trend: 'Lulusan', color: 'text-emerald-600' },
      { label: 'Tahun Terakhir', val: new Date().getFullYear() - 1, trend: 'Terbaru', color: 'text-blue-600' },
      { label: 'Unit Terdaftar', val: new Set(items.map((i) => i.unit_id)).size || 1, trend: 'Unit', color: 'text-purple-600' },
      { label: 'Status Lulus', val: items.length, trend: 'Lulus', color: 'text-indigo-600' },
    ],
    kelas: [
      { label: 'Total Kelas', val: stats?.total || items.length, trend: 'Ruang', color: 'text-emerald-600' },
      { label: 'Kelas Aktif', val: stats?.aktif || items.length, trend: 'Aktif', color: 'text-blue-600' },
      { label: 'Kelas Nonaktif', val: stats?.nonaktif || 0, trend: 'Nonaktif', color: 'text-rose-600' },
      { label: 'Total Siswa', val: items.reduce((acc, k) => acc + Number(k.students_count || 0), 0), trend: 'Terisi', color: 'text-indigo-600' },
    ],
    rombel: [
      { label: 'Total Rombel', val: stats?.total || items.length, trend: 'Rombel', color: 'text-emerald-600' },
      { label: 'Rombel Aktif', val: stats?.aktif || items.length, trend: 'Aktif', color: 'text-blue-600' },
      { label: 'Kapasitas', val: stats?.kapasitas || (items.length * 30), trend: 'Siswa', color: 'text-amber-600' },
      { label: 'Terisi', val: stats?.terisi || items.reduce((acc, r) => acc + Number(r.students_count || 0), 0), trend: 'Terdaftar', color: 'text-indigo-600' },
    ],
    pengguna: [
      { label: 'Pengguna Aktif', val: stats?.total ?? items.length, trend: 'Akun', color: 'text-emerald-600' },
      { label: 'Sudah Memiliki Role', val: items.filter((u) => (u.roles || []).length > 0).length, trend: 'Role', color: 'text-blue-600' },
      { label: 'Wajib Ganti Password', val: items.filter((u) => u.must_change_password).length, trend: 'Keamanan', color: 'text-amber-600' },
      { label: 'Data Ditampilkan', val: items.length, trend: 'Baris', color: 'text-indigo-600' },
    ],
    role: [
      { label: 'Total Role', val: stats?.total ?? items.length, trend: 'Role', color: 'text-emerald-600' },
      { label: 'Total Izin', val: items.reduce((acc, role) => acc + Number(role.jumlah_izin || 0), 0), trend: 'Permission', color: 'text-blue-600' },
      { label: 'Total Pengguna', val: items.reduce((acc, role) => acc + Number(role.jumlah_pengguna || 0), 0), trend: 'User', color: 'text-indigo-600' },
      { label: 'Role Belum Dipakai', val: items.filter((role) => Number(role.jumlah_pengguna || 0) === 0).length, trend: 'Kosong', color: 'text-amber-600' },
    ],
    pengguna_tanpa_role: [
      { label: 'Tanpa Role', val: stats?.total ?? items.length, trend: 'Perlu Ditinjau', color: 'text-rose-600' },
      { label: 'Akun Aktif', val: items.filter((u) => u.is_active).length, trend: 'Aktif', color: 'text-emerald-600' },
      { label: 'Akun Nonaktif', val: items.filter((u) => !u.is_active).length, trend: 'Nonaktif', color: 'text-slate-600' },
      { label: 'Data Ditampilkan', val: items.length, trend: 'Baris', color: 'text-indigo-600' },
    ],
  }

  const normalizedType = KEY_ALIASES[type] || type
  const list = statCardsMap[normalizedType] || statCardsMap.unit_pendidikan

  return list.map((card, idx) => (
    <div key={idx} className="p-3 rounded-2xl bg-white dark:bg-[#13221f] border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-1">
      <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 dark:text-slate-400">
        <span>{card.label}</span>
        {card.trend && (
          <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5">
            <TrendingUp className="h-3 w-3" />
            {card.trend}
          </span>
        )}
      </div>
      <div className={`text-lg sm:text-xl font-black ${card.color} dark:text-white`}>
        {Number(card.val || 0).toLocaleString('id-ID')}
      </div>
    </div>
  ))
}

// Sub-component: Skeleton Table
function RenderTableSkeleton() {
  return (
    <div className="space-y-2 p-2">
      <Skeleton className="h-10 w-full rounded-xl" />
      {[1, 2, 3, 4, 5].map((i) => (
        <Skeleton key={i} className="h-12 w-full rounded-xl" />
      ))}
    </div>
  )
}

// Action Button Helper Component for Table Rows
function ActionButton({ rowId, onViewDetail }) {
  return (
    <Button
      size="sm"
      variant="outline"
      onClick={() => onViewDetail(rowId)}
      className="gap-1.5 rounded-xl border-emerald-600/60 text-emerald-700 hover:bg-emerald-50 dark:border-emerald-500 dark:text-emerald-400 font-bold px-2.5 py-1 text-xs"
    >
      <Eye className="h-3.5 w-3.5" />
      <span className="hidden sm:inline">Lihat Detail</span>
    </Button>
  )
}

ActionButton.propTypes = {
  rowId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  onViewDetail: PropTypes.func.isRequired,
}

// Sub-component: Render specific table headers and rows according to requested KPI type with AKSI column
function RenderKpiTable({ type, items, onViewDetail }) {
  switch (type) {
    case 'unit_pendidikan':
      return (
        <table className="w-full text-xs text-left text-slate-700 dark:text-slate-200">
          <thead className="bg-slate-100/80 dark:bg-[#1b302c] text-slate-600 dark:text-slate-300 font-extrabold uppercase text-[10px] tracking-wider">
            <tr>
              <th className="px-3.5 py-3 text-center w-12">No</th>
              <th className="px-4 py-3">Kode</th>
              <th className="px-4 py-3">Nama Unit</th>
              <th className="px-4 py-3">Jenjang</th>
              <th className="px-4 py-3">Kepala Sekolah</th>
              <th className="px-4 py-3 text-center">Guru</th>
              <th className="px-4 py-3 text-center">Pegawai</th>
              <th className="px-4 py-3 text-center">Siswa</th>
              <th className="px-4 py-3 text-center">Status</th>
              <th className="px-4 py-3 text-center">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {items.map((row, i) => (
              <tr key={row.id || i} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40">
                <td className="px-3.5 py-3 text-center font-bold text-slate-400">{i + 1}</td>
                <td className="px-4 py-3 font-mono font-bold text-slate-900 dark:text-white">{row.code || row.kode || '-'}</td>
                <td className="px-4 py-3 font-bold text-slate-900 dark:text-white">{row.name}</td>
                <td className="px-4 py-3 font-medium">{row.jenis_unit || row.level || '-'}</td>
                <td className="px-4 py-3 font-medium">{row.kepala_sekolah || 'Belum Ditentukan'}</td>
                <td className="px-4 py-3 text-center font-bold">{row.guru_count || 0}</td>
                <td className="px-4 py-3 text-center font-bold">{row.pegawai_count || 0}</td>
                <td className="px-4 py-3 text-center font-bold">{row.siswa_aktif_count || 0}</td>
                <td className="px-4 py-3 text-center">
                  <Badge variant={row.is_active ? 'success' : 'secondary'}>
                    {row.is_active ? 'Aktif' : 'Nonaktif'}
                  </Badge>
                </td>
                <td className="px-4 py-3 text-center">
                  <ActionButton rowId={row.id || row.uuid} onViewDetail={onViewDetail} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )

    case 'guru':
      return (
        <table className="w-full text-xs text-left text-slate-700 dark:text-slate-200">
          <thead className="bg-slate-100/80 dark:bg-[#1b302c] text-slate-600 dark:text-slate-300 font-extrabold uppercase text-[10px] tracking-wider">
            <tr>
              <th className="px-3.5 py-3 text-center w-12">No</th>
              <th className="px-4 py-3">NIY</th>
              <th className="px-4 py-3">Nama Guru</th>
              <th className="px-4 py-3">Unit</th>
              <th className="px-4 py-3">Jabatan</th>
              <th className="px-4 py-3">Status Pegawai</th>
              <th className="px-4 py-3 text-center">Status</th>
              <th className="px-4 py-3 text-center">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {items.map((row, i) => (
              <tr key={row.id || i} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40">
                <td className="px-3.5 py-3 text-center font-bold text-slate-400">{i + 1}</td>
                <td className="px-4 py-3 font-mono font-bold">{row.niy || row.nik || '-'}</td>
                <td className="px-4 py-3 font-bold text-slate-900 dark:text-white">{row.nama_lengkap}</td>
                <td className="px-4 py-3">{row.unit?.name || row.unit?.code || '-'}</td>
                <td className="px-4 py-3 font-medium">{row.position?.nama_jabatan || row.jabatan || 'Guru'}</td>
                <td className="px-4 py-3 font-medium">{row.status_pegawai || 'Tetap'}</td>
                <td className="px-4 py-3 text-center">
                  <Badge variant="success">Aktif</Badge>
                </td>
                <td className="px-4 py-3 text-center">
                  <ActionButton rowId={row.id || row.uuid} onViewDetail={onViewDetail} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )

    case 'pegawai':
      return (
        <table className="w-full text-xs text-left text-slate-700 dark:text-slate-200">
          <thead className="bg-slate-100/80 dark:bg-[#1b302c] text-slate-600 dark:text-slate-300 font-extrabold uppercase text-[10px] tracking-wider">
            <tr>
              <th className="px-3.5 py-3 text-center w-12">No</th>
              <th className="px-4 py-3">NIY</th>
              <th className="px-4 py-3">Nama Pegawai</th>
              <th className="px-4 py-3">Jabatan</th>
              <th className="px-4 py-3">Unit</th>
              <th className="px-4 py-3 text-center">Status</th>
              <th className="px-4 py-3 text-center">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {items.map((row, i) => (
              <tr key={row.id || i} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40">
                <td className="px-3.5 py-3 text-center font-bold text-slate-400">{i + 1}</td>
                <td className="px-4 py-3 font-mono font-bold">{row.niy || row.nik || '-'}</td>
                <td className="px-4 py-3 font-bold text-slate-900 dark:text-white">{row.nama_lengkap}</td>
                <td className="px-4 py-3 font-medium">{row.position?.nama_jabatan || row.jabatan || 'Staf'}</td>
                <td className="px-4 py-3">{row.unit?.name || row.unit?.code || '-'}</td>
                <td className="px-4 py-3 text-center">
                  <Badge variant="success">{row.status || 'Aktif'}</Badge>
                </td>
                <td className="px-4 py-3 text-center">
                  <ActionButton rowId={row.id || row.uuid} onViewDetail={onViewDetail} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )

    case 'siswa':
      return (
        <table className="w-full text-xs text-left text-slate-700 dark:text-slate-200">
          <thead className="bg-slate-100/80 dark:bg-[#1b302c] text-slate-600 dark:text-slate-300 font-extrabold uppercase text-[10px] tracking-wider">
            <tr>
              <th className="px-3.5 py-3 text-center w-12">No</th>
              <th className="px-4 py-3">NIS</th>
              <th className="px-4 py-3">Nama Siswa</th>
              <th className="px-4 py-3">Gender</th>
              <th className="px-4 py-3">Unit</th>
              <th className="px-4 py-3">Kelas</th>
              <th className="px-4 py-3 text-center">Status</th>
              <th className="px-4 py-3 text-center">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {items.map((row, i) => (
              <tr key={row.id || i} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40">
                <td className="px-3.5 py-3 text-center font-bold text-slate-400">{i + 1}</td>
                <td className="px-4 py-3 font-mono font-bold">{row.nis || row.nisn || '-'}</td>
                <td className="px-4 py-3 font-bold text-slate-900 dark:text-white">{row.full_name}</td>
                <td className="px-4 py-3 font-medium">{row.gender === 'male' || row.gender === 'L' ? 'Laki-laki' : 'Perempuan'}</td>
                <td className="px-4 py-3">{row.education_unit?.name || row.unit?.name || '-'}</td>
                <td className="px-4 py-3 font-medium">{row.kelas?.nama_kelas || row.school_class?.name || '-'}</td>
                <td className="px-4 py-3 text-center">
                  <Badge variant={row.is_active ? 'success' : 'secondary'}>
                    {row.is_active ? 'Aktif' : 'Nonaktif'}
                  </Badge>
                </td>
                <td className="px-4 py-3 text-center">
                  <ActionButton rowId={row.id || row.uuid} onViewDetail={onViewDetail} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )

    case 'orang_tua':
      return (
        <table className="w-full text-xs text-left text-slate-700 dark:text-slate-200">
          <thead className="bg-slate-100/80 dark:bg-[#1b302c] text-slate-600 dark:text-slate-300 font-extrabold uppercase text-[10px] tracking-wider">
            <tr>
              <th className="px-3.5 py-3 text-center w-12">No</th>
              <th className="px-4 py-3">Nama Orang Tua / Wali</th>
              <th className="px-4 py-3">NIK</th>
              <th className="px-4 py-3">Kontak</th>
              <th className="px-4 py-3">Anak Terdaftar</th>
              <th className="px-4 py-3">Unit Sekolah</th>
              <th className="px-4 py-3 text-center">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {items.map((row, i) => {
              const children = row.students || []
              const firstChild = children[0]
              return (
                <tr key={row.id || i} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40">
                  <td className="px-3.5 py-3 text-center font-bold text-slate-400">{i + 1}</td>
                  <td className="px-4 py-3 font-bold text-slate-900 dark:text-white">
                    {row.full_name || 'Orang Tua / Wali'}
                  </td>
                  <td className="px-4 py-3 font-mono font-medium">{row.nik || '-'}</td>
                  <td className="px-4 py-3 font-medium">{row.phone || row.email || '-'}</td>
                  <td className="px-4 py-3 font-medium">
                    {children.length > 0
                      ? children.map((c) => c.full_name).join(', ')
                      : 'Belum terhubung'}
                  </td>
                  <td className="px-4 py-3 font-medium">
                    {firstChild?.education_unit?.name || '-'}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <ActionButton rowId={row.id || row.uuid} onViewDetail={onViewDetail} />
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      )

    case 'alumni':
      return (
        <table className="w-full text-xs text-left text-slate-700 dark:text-slate-200">
          <thead className="bg-slate-100/80 dark:bg-[#1b302c] text-slate-600 dark:text-slate-300 font-extrabold uppercase text-[10px] tracking-wider">
            <tr>
              <th className="px-3.5 py-3 text-center w-12">No</th>
              <th className="px-4 py-3">NIS</th>
              <th className="px-4 py-3">Nama Alumni</th>
              <th className="px-4 py-3">Unit Terakhir</th>
              <th className="px-4 py-3">Tahun Lulus</th>
              <th className="px-4 py-3 text-center">Status</th>
              <th className="px-4 py-3 text-center">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {items.map((row, i) => (
              <tr key={row.id || i} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40">
                <td className="px-3.5 py-3 text-center font-bold text-slate-400">{i + 1}</td>
                <td className="px-4 py-3 font-mono font-bold">{row.nis || '-'}</td>
                <td className="px-4 py-3 font-bold text-slate-900 dark:text-white">{row.full_name}</td>
                <td className="px-4 py-3">{row.education_unit?.name || row.unit?.name || '-'}</td>
                <td className="px-4 py-3 font-medium">{row.tahun_masuk ? (Number(row.tahun_masuk) + 3) : new Date().getFullYear() - 1}</td>
                <td className="px-4 py-3 text-center">
                  <Badge variant="purple">Alumni</Badge>
                </td>
                <td className="px-4 py-3 text-center">
                  <ActionButton rowId={row.id || row.uuid} onViewDetail={onViewDetail} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )

    case 'kelas':
    case 'rombel':
      return (
        <table className="w-full text-xs text-left text-slate-700 dark:text-slate-200">
          <thead className="bg-slate-100/80 dark:bg-[#1b302c] text-slate-600 dark:text-slate-300 font-extrabold uppercase text-[10px] tracking-wider">
            <tr>
              <th className="px-3.5 py-3 text-center w-12">No</th>
              <th className="px-4 py-3">Kode / Nama Kelas</th>
              <th className="px-4 py-3">Tingkat</th>
              <th className="px-4 py-3">Unit Pendidikan</th>
              <th className="px-4 py-3">Wali Kelas</th>
              <th className="px-4 py-3 text-center">Jumlah Siswa</th>
              <th className="px-4 py-3 text-center">Kapasitas</th>
              <th className="px-4 py-3 text-center">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {items.map((row, i) => (
              <tr key={row.id || i} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40">
                <td className="px-3.5 py-3 text-center font-bold text-slate-400">{i + 1}</td>
                <td className="px-4 py-3 font-mono font-bold text-slate-900 dark:text-white">
                  {row.nama_kelas || row.kode_kelas || '-'}
                </td>
                <td className="px-4 py-3 font-medium">{row.tingkat || row.jenjang || '-'}</td>
                <td className="px-4 py-3 font-medium">{row.unit_pendidikan?.name || '-'}</td>
                <td className="px-4 py-3 font-medium">{row.wali_kelas?.nama_lengkap || 'Belum Ditentukan'}</td>
                <td className="px-4 py-3 text-center font-bold">{row.students_count || 0}</td>
                <td className="px-4 py-3 text-center font-medium">{row.kapasitas || 30}</td>
                <td className="px-4 py-3 text-center">
                  <ActionButton rowId={row.id || row.uuid} onViewDetail={onViewDetail} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )

    case 'pengguna':
    case 'pengguna_tanpa_role':
      return (
        <table className="w-full text-xs text-left text-slate-700 dark:text-slate-200">
          <thead className="bg-slate-100/80 dark:bg-[#1b302c] text-slate-600 dark:text-slate-300 font-extrabold uppercase text-[10px] tracking-wider">
            <tr>
              <th className="px-3.5 py-3 text-center w-12">No</th>
              <th className="px-4 py-3">Nama Pengguna</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Role</th>
              <th className="px-4 py-3 text-center">Status</th>
              <th className="px-4 py-3">Dibuat</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {items.map((row, i) => (
              <tr key={row.id || i} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40">
                <td className="px-3.5 py-3 text-center font-bold text-slate-400">{i + 1}</td>
                <td className="px-4 py-3 font-bold text-slate-900 dark:text-white">{row.name || '-'}</td>
                <td className="px-4 py-3">{row.email || '-'}</td>
                <td className="px-4 py-3">{(row.roles || []).join(', ') || 'Belum Ada Role'}</td>
                <td className="px-4 py-3 text-center">
                  <Badge variant={row.is_active ? 'success' : 'secondary'}>{row.is_active ? 'Aktif' : 'Nonaktif'}</Badge>
                </td>
                <td className="px-4 py-3">{row.created_at ? new Date(row.created_at).toLocaleDateString('id-ID') : '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )

    case 'role':
      return (
        <table className="w-full text-xs text-left text-slate-700 dark:text-slate-200">
          <thead className="bg-slate-100/80 dark:bg-[#1b302c] text-slate-600 dark:text-slate-300 font-extrabold uppercase text-[10px] tracking-wider">
            <tr>
              <th className="px-3.5 py-3 text-center w-12">No</th>
              <th className="px-4 py-3">Nama Role</th>
              <th className="px-4 py-3">Guard</th>
              <th className="px-4 py-3 text-center">Jumlah Izin</th>
              <th className="px-4 py-3 text-center">Jumlah Pengguna</th>
              <th className="px-4 py-3">Diperbarui</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {items.map((row, i) => (
              <tr key={row.id || i} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40">
                <td className="px-3.5 py-3 text-center font-bold text-slate-400">{i + 1}</td>
                <td className="px-4 py-3 font-bold text-slate-900 dark:text-white">{row.name || '-'}</td>
                <td className="px-4 py-3 font-mono">{row.guard_name || 'web'}</td>
                <td className="px-4 py-3 text-center font-bold">{row.jumlah_izin || 0}</td>
                <td className="px-4 py-3 text-center font-bold">{row.jumlah_pengguna || 0}</td>
                <td className="px-4 py-3">{row.updated_at ? new Date(row.updated_at).toLocaleDateString('id-ID') : '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )

    default:
      return null
  }
}

RenderKpiTable.propTypes = {
  type: PropTypes.string.isRequired,
  items: PropTypes.array.isRequired,
  onViewDetail: PropTypes.func.isRequired,
}
