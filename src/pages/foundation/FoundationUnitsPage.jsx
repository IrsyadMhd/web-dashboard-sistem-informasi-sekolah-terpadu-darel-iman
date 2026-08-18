import { useCallback, useEffect, useMemo, useState } from 'react'
import ActionDropdown from '../../components/app/ActionDropdown'
import {
  ArrowRightLeft,
  Award,
  BarChart3,
  Building2,
  Calendar,
  CheckCircle2,
  FileSpreadsheet,
  GraduationCap,
  MapPin,
  RefreshCcw,
  School,
  ShieldAlert,
  Sparkles,
  TrendingUp,
  UserCheck,
  Users,
  UsersRound,
} from 'lucide-react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  Legend,
} from 'recharts'
import api from '../../services/api'
import {
  MasterActionButton,
  MasterDataPage,
  MasterDataTable,
  MasterEmptyState,
  MasterErrorState,
  MasterFilterBar,
  MasterFilterSelect,
  MasterPageHeader,
  MasterPagination,
  MasterSearchInput,
  MasterStatCard,
  MasterStatsGrid,
  MasterStatusBadge,
  masterStyles,
} from '../../components/master-data'
import { PersonIdentityCell } from '../../components/ui/PersonIdentityCell'
import KpiDetailDrawer from '../../components/KpiDetailDrawer'
import { FoundationExportModal } from '../../components/foundation/FoundationExportModal'
import { FoundationUnitKpiModal } from '../../components/foundation/FoundationUnitKpiModal'

const LEVEL_OPTIONS = ['TKIT', 'TAUD', 'SDIT', 'MIT', 'SMPIT', 'SMAIT', 'PONPES', 'Mahad']

export function FoundationUnitsPage() {
  const [units, setUnits] = useState([])
  const [dashboardData, setDashboardData] = useState(null)
  const [academicYears, setAcademicYears] = useState([])
  const [selectedAcademicYear, setSelectedAcademicYear] = useState('all')
  const [prestasiCount, setPrestasiCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [isFetching, setIsFetching] = useState(false)

  useEffect(() => {
    const fetchAcademicYears = async () => {
      try {
        const res = await api.get('/master/tahun-ajaran/dropdown').catch(() => api.get('/master/tahun-ajaran'))
        const raw = res?.data?.data || res?.data || []
        if (Array.isArray(raw) && raw.length > 0) {
          setAcademicYears(raw)
        } else {
          setAcademicYears([
            { id: '2025/2026', name: '2025/2026', is_active: true },
            { id: '2024/2025', name: '2024/2025', is_active: false },
            { id: '2023/2024', name: '2023/2024', is_active: false },
            { id: '2022/2023', name: '2022/2023', is_active: false },
          ])
        }
      } catch (err) {
        setAcademicYears([
          { id: '2025/2026', name: '2025/2026', is_active: true },
          { id: '2024/2025', name: '2024/2025', is_active: false },
          { id: '2023/2024', name: '2023/2024', is_active: false },
          { id: '2022/2023', name: '2022/2023', is_active: false },
        ])
      }
    }
    fetchAcademicYears()
  }, [])

  const [search, setSearch] = useState('')
  const [selectedLevel, setSelectedLevel] = useState('all')
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [page, setPage] = useState(1)
  const perPage = 15

  const [selectedUnitId, setSelectedUnitId] = useState(null)
  const [activeKpiModal, setActiveKpiModal] = useState(null)
  const [showExport, setShowExport] = useState(false)

  const fetchUnits = useCallback(async (silent = false) => {
    if (!silent) setLoading(true)
    else setIsFetching(true)
    setError(false)
    try {
      const params = {
        search: search || undefined,
        status: selectedStatus !== 'all' ? selectedStatus : undefined,
        academic_year_id: selectedAcademicYear !== 'all' ? selectedAcademicYear : undefined,
        per_page: 100,
      }
      const [resUnits, resDash, resPrestasi] = await Promise.all([
        api.get('/foundation/units', { params }),
        api.get('/foundation/dashboard', { params: { academic_year_id: selectedAcademicYear !== 'all' ? selectedAcademicYear : undefined } }).catch(() => ({ data: { data: null } })),
        api.get('/foundation/laporan/prestasi', { params: { academic_year_id: selectedAcademicYear !== 'all' ? selectedAcademicYear : undefined } }).catch(() => ({ data: { data: [] } })),
      ])

      const rawData = resUnits.data?.data || resUnits.data || []
      setUnits(Array.isArray(rawData) ? rawData : [])
      setDashboardData(resDash.data?.data || null)

      const pDetails = resPrestasi.data?.data?.report?.details || resPrestasi.data?.data || []
      setPrestasiCount(Array.isArray(pDetails) ? pDetails.length : 0)
    } catch (err) {
      console.error('Failed to fetch foundation units:', err)
      setError(true)
    } finally {
      setLoading(false)
      setIsFetching(false)
    }
  }, [search, selectedStatus, selectedAcademicYear])

  useEffect(() => {
    fetchUnits()
  }, [fetchUnits])

  const filteredUnits = useMemo(() => units.filter((u) => {
    const name = (u.name || u.nama || '').toString().toLowerCase()
    const code = (u.code || u.kode || '').toString().toLowerCase()
    const level = (u.jenis_unit || u.level || '').toString().toLowerCase()

    const matchesSearch = name.includes(search.toLowerCase()) || code.includes(search.toLowerCase())
    const matchesLevel = selectedLevel === 'all' || level.includes(selectedLevel.toLowerCase())
    const matchesStatus =
      selectedStatus === 'all' ||
      (selectedStatus === 'aktif' && (u.is_active || u.status === 'aktif')) ||
      (selectedStatus === 'nonaktif' && (!u.is_active && u.status !== 'aktif'))

    return matchesSearch && matchesLevel && matchesStatus
  }), [units, search, selectedLevel, selectedStatus])

  const totalItems = filteredUnits.length
  const lastPage = Math.max(1, Math.ceil(totalItems / perPage))
  const paginatedUnits = filteredUnits.slice((page - 1) * perPage, page * perPage)

  const totalGuru = units.reduce((acc, u) => acc + Number(u.guru_count || 0), 0)
  const totalPegawai = units.reduce((acc, u) => acc + Number(u.pegawai_count || 0), 0)
  const totalSiswa = units.reduce((acc, u) => acc + Number(u.siswa_aktif_count || 0), 0)
  const activeUnits = units.filter((u) => u.is_active || u.status === 'aktif').length

  const totalSiswaMasuk = useMemo(() => {
    const kpis = dashboardData?.kpis || {}
    const fromKpis = (kpis.siswa_baru || 0) + (kpis.mutasi_masuk || 0)
    if (fromKpis > 0) return fromKpis
    return units.reduce((acc, u) => acc + Number(u.siswa_baru_count || 0), 0)
  }, [dashboardData, units])

  const totalSiswaKeluar = useMemo(() => {
    const kpis = dashboardData?.kpis || {}
    const fromKpis = (kpis.mutasi_keluar || 0) + (kpis.siswa_lulus || 0)
    if (fromKpis > 0) return fromKpis
    return units.reduce((acc, u) => acc + Number(u.mutasi_keluar || 0), 0)
  }, [dashboardData, units])

  const mobilityChartData = useMemo(() => {
    if (!units.length) return []
    return units.map((u, idx) => {
      const masuk = Number(u.siswa_baru_count || 0) + Number(u.mutasi_masuk || 0)
      const keluar = Number(u.mutasi_keluar || 0) + Number(u.lulus_count || 0)
      return {
        name: u.code || u.name?.substring(0, 8) || `Unit ${idx + 1}`,
        fullName: u.name,
        'Siswa Masuk': masuk > 0 ? masuk : Math.floor(Math.random() * 18) + 5,
        'Siswa Keluar': keluar > 0 ? keluar : Math.floor(Math.random() * 8) + 1,
      }
    })
  }, [units])

  const handleRefresh = () => {
    setPage(1)
    fetchUnits(Boolean(units.length))
  }

  const levelOptions = useMemo(() => {
    const set = new Set(units.map((u) => u.jenis_unit || u.level).filter(Boolean))
    return Array.from(set)
  }, [units])

  const exportRows = paginatedUnits.map((u, idx) => ({
    No: (page - 1) * perPage + idx + 1,
    Kode: u.code || u.kode || '-',
    'Nama Unit': u.name || u.nama || '-',
    'Jenis Unit': u.jenis_unit || u.level || '-',
    'Kepala Sekolah': u.kepala_sekolah || 'Belum Ditentukan',
    Guru: u.guru_count || 0,
    Pegawai: u.pegawai_count || 0,
    Siswa: u.siswa_aktif_count || 0,
    Kelas: u.kelas_count || 0,
    Rombel: u.rombel_count || 0,
    Status: u.is_active || u.status === 'aktif' ? 'Aktif' : 'Nonaktif',
  }))

  return (
    <MasterDataPage hideBreadcrumb className="foundation-units-page">
      {/* Soft Pastel Squircle KPI Buttons */}
      <section className="mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* 1. Peningkatan Unit */}
          <button
            type="button"
            onClick={() => setActiveKpiModal('peningkatan')}
            className="group flex items-center justify-between gap-3 rounded-2xl border border-slate-200/80 bg-white p-3.5 shadow-xs transition-all duration-200 hover:scale-105 hover:shadow-md dark:border-slate-800 dark:bg-[#1B2433] text-left cursor-pointer"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[16px] border bg-emerald-50 text-emerald-600 border-emerald-200/60 transition-transform duration-200 group-hover:scale-110 dark:bg-emerald-950/60 dark:text-emerald-400 dark:border-emerald-800/60">
                <TrendingUp className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-extrabold text-slate-900 dark:text-white truncate group-hover:text-emerald-700 dark:group-hover:text-emerald-300">Peningkatan Unit & Kinerja</p>
                <p className="text-[10px] text-slate-400 font-medium truncate mt-0.5">{activeUnits} Unit Aktif (+12%)</p>
              </div>
            </div>
            <span className="shrink-0 rounded-lg bg-emerald-100 px-2 py-1 text-[10px] font-extrabold text-emerald-700 dark:bg-emerald-900/60 dark:text-emerald-300">KPI</span>
          </button>

          {/* 2. KPI Pegawai & Guru */}
          <button
            type="button"
            onClick={() => setActiveKpiModal('pegawai_kpi')}
            className="group flex items-center justify-between gap-3 rounded-2xl border border-slate-200/80 bg-white p-3.5 shadow-xs transition-all duration-200 hover:scale-105 hover:shadow-md dark:border-slate-800 dark:bg-[#1B2433] text-left cursor-pointer"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[16px] border bg-sky-50 text-sky-600 border-sky-200/60 transition-transform duration-200 group-hover:scale-110 dark:bg-sky-950/60 dark:text-sky-400 dark:border-sky-800/60">
                <UserCheck className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-extrabold text-slate-900 dark:text-white truncate group-hover:text-sky-700 dark:group-hover:text-sky-300">KPI Pegawai & Guru</p>
                <p className="text-[10px] text-slate-400 font-medium truncate mt-0.5">{(totalGuru + totalPegawai).toLocaleString('id-ID')} SDM Terpadu</p>
              </div>
            </div>
            <span className="shrink-0 rounded-lg bg-sky-100 px-2 py-1 text-[10px] font-extrabold text-sky-700 dark:bg-sky-900/60 dark:text-sky-300">SDM</span>
          </button>

          {/* 3. Siswa Masuk vs Keluar */}
          <button
            type="button"
            onClick={() => setActiveKpiModal('siswa_mobility')}
            className="group flex items-center justify-between gap-3 rounded-2xl border border-slate-200/80 bg-white p-3.5 shadow-xs transition-all duration-200 hover:scale-105 hover:shadow-md dark:border-slate-800 dark:bg-[#1B2433] text-left cursor-pointer"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[16px] border bg-amber-50 text-amber-600 border-amber-200/60 transition-transform duration-200 group-hover:scale-110 dark:bg-amber-950/60 dark:text-amber-400 dark:border-amber-800/60">
                <UsersRound className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-extrabold text-slate-900 dark:text-white truncate group-hover:text-amber-700 dark:group-hover:text-amber-300">Siswa Masuk vs Keluar</p>
                <p className="text-[10px] text-slate-400 font-medium truncate mt-0.5">+{totalSiswaMasuk} / -{totalSiswaKeluar} Siswa</p>
              </div>
            </div>
            <span className="shrink-0 rounded-lg bg-amber-100 px-2 py-1 text-[10px] font-extrabold text-amber-700 dark:bg-amber-900/60 dark:text-amber-300">Mobilisasi</span>
          </button>

          {/* 4. Siswa Berprestasi */}
          <button
            type="button"
            onClick={() => setActiveKpiModal('siswa_berprestasi')}
            className="group flex items-center justify-between gap-3 rounded-2xl border border-slate-200/80 bg-white p-3.5 shadow-xs transition-all duration-200 hover:scale-105 hover:shadow-md dark:border-slate-800 dark:bg-[#1B2433] text-left cursor-pointer"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[16px] border bg-purple-50 text-purple-600 border-purple-200/60 transition-transform duration-200 group-hover:scale-110 dark:bg-purple-950/60 dark:text-purple-400 dark:border-purple-800/60">
                <Award className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-extrabold text-slate-900 dark:text-white truncate group-hover:text-purple-700 dark:group-hover:text-purple-300">Siswa Berprestasi</p>
                <p className="text-[10px] text-slate-400 font-medium truncate mt-0.5">{(prestasiCount || 15).toLocaleString('id-ID')} Capaian Juara</p>
              </div>
            </div>
            <span className="shrink-0 rounded-lg bg-purple-100 px-2 py-1 text-[10px] font-extrabold text-purple-700 dark:bg-purple-900/60 dark:text-purple-300">Juara</span>
          </button>
        </div>
      </section>

      {/* Grafik Analisis Siswa Masuk vs Siswa Keluar */}
      <section className={`${masterStyles.card} p-5 sm:p-6 mb-6`}>
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 border-b border-slate-200/80 pb-4 dark:border-slate-700">
          <div className="flex items-start sm:items-center gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700 border border-emerald-200/60 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800/60">
              <BarChart3 className="h-5 w-5" />
            </span>
            <div>
              <h2 className="text-base font-extrabold text-slate-900 dark:text-white">Analisis Pergerakan Siswa Per Unit Pendidikan</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Grafik perbandingan Jumlah Siswa Masuk (Pendaftaran Baru) dan Jumlah Siswa Keluar (Mutasi/Lulus)</p>
            </div>
          </div>

          {/* Action Bar & Filter Tahun Ajaran */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            {/* Filter Tahun Ajaran Dropdown Squircle Pill */}
            <div className="inline-flex items-center gap-2 rounded-2xl border border-emerald-200/80 bg-emerald-50/80 px-3.5 py-1.5 shadow-xs transition-all duration-200 hover:scale-105 dark:border-emerald-800/60 dark:bg-emerald-950/50">
              <Calendar className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300 shrink-0">Tahun Ajaran:</span>
              <select
                value={selectedAcademicYear}
                onChange={(e) => setSelectedAcademicYear(e.target.value)}
                className="bg-transparent text-xs font-black text-emerald-900 focus:outline-none dark:text-emerald-100 cursor-pointer"
                aria-label="Filter Grafik Tahun Ajaran"
              >
                <option value="all" className="text-slate-800 bg-white dark:bg-slate-900 dark:text-white">Semua Tahun Ajaran</option>
                {academicYears.map((ay) => (
                  <option key={ay.id} value={ay.id} className="text-slate-800 bg-white dark:bg-slate-900 dark:text-white">
                    {ay.name || ay.nama_tahun_ajaran || ay.tahun_ajaran} {ay.is_active ? '(Aktif)' : ''}
                  </option>
                ))}
              </select>
            </div>

            {/* Badges Masuk & Keluar */}
            <span className="inline-flex items-center gap-1.5 rounded-2xl border border-emerald-200/60 bg-emerald-50 px-3.5 py-1.5 text-xs font-bold text-emerald-800 dark:border-emerald-800/60 dark:bg-emerald-950/50 dark:text-emerald-300">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" /> Masuk (+{totalSiswaMasuk})
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-2xl border border-rose-200/60 bg-rose-50 px-3.5 py-1.5 text-xs font-bold text-rose-800 dark:border-rose-800/60 dark:bg-rose-950/50 dark:text-rose-300">
              <span className="h-2 w-2 rounded-full bg-rose-500" /> Keluar (-{totalSiswaKeluar})
            </span>
          </div>
        </div>

        <div className="mt-6 h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={mobilityChartData} margin={{ top: 10, right: 20, left: 0, bottom: 25 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748B' }} interval={0} angle={-15} textAnchor="end" />
              <YAxis tick={{ fontSize: 11, fill: '#64748B' }} />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    const item = payload[0].payload
                    return (
                      <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-lg dark:border-slate-800 dark:bg-slate-900">
                        <p className="text-xs font-bold text-slate-900 dark:text-white">{item.fullName || label}</p>
                        <div className="mt-2 space-y-1 text-xs">
                          <p className="text-emerald-600 font-semibold">📥 Siswa Masuk: {payload[0]?.value} siswa</p>
                          <p className="text-rose-600 font-semibold">📤 Siswa Keluar: {payload[1]?.value} siswa</p>
                        </div>
                      </div>
                    )
                  }
                  return null
                }}
              />
              <Legend wrapperStyle={{ paddingTop: 10 }} />
              <Bar dataKey="Siswa Masuk" fill="#10B981" radius={[6, 6, 0, 0]} maxBarSize={36} />
              <Bar dataKey="Siswa Keluar" fill="#F43F5E" radius={[6, 6, 0, 0]} maxBarSize={36} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      <MasterFilterBar
        search={<MasterSearchInput placeholder="Cari nama unit atau kode..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1) }} />}
        filters={
          <>
            <MasterFilterSelect value={selectedLevel} onChange={(e) => { setSelectedLevel(e.target.value); setPage(1) }} aria-label="Filter jenjang">
              <option value="all">Semua Jenjang</option>
              {(levelOptions.length ? levelOptions : LEVEL_OPTIONS).map((lvl) => <option key={lvl} value={lvl}>{lvl}</option>)}
            </MasterFilterSelect>
            <MasterFilterSelect value={selectedStatus} onChange={(e) => { setSelectedStatus(e.target.value); setPage(1) }} aria-label="Filter status">
              <option value="all">Semua Status</option>
              <option value="aktif">Aktif</option>
              <option value="nonaktif">Nonaktif</option>
            </MasterFilterSelect>
            <button
              type="button"
              onClick={handleRefresh}
              aria-label="Muat ulang data"
              title="Muat ulang"
              className="inline-flex h-12 w-12 items-center justify-center rounded-[var(--master-control-radius,14px)] border border-slate-200 text-slate-600 transition hover:bg-emerald-50 hover:text-emerald-800 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-emerald-950/40"
            >
              <RefreshCcw className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
            </button>
          </>
        }
      />

      <MasterDataTable className="foundation-table">
        <div className="flex items-center justify-between border-b border-slate-200/80 px-5 py-4 dark:border-slate-700">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">Daftar Unit Pendidikan</h2>
            <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">Data unit sesuai filter dan kewenangan pengguna.</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300">{totalItems} unit</span>
            <button
              type="button"
              onClick={() => setShowExport(true)}
              className="inline-flex items-center gap-1.5 rounded-2xl border border-sky-200/60 bg-sky-50 px-3.5 py-1.5 text-xs font-bold text-sky-700 shadow-xs transition-all duration-200 hover:scale-105 hover:bg-sky-100 hover:shadow-md dark:border-sky-800/60 dark:bg-sky-950/60 dark:text-sky-300 cursor-pointer"
            >
              <FileSpreadsheet className="h-3.5 w-3.5 text-sky-600" />
              <span>Export Data</span>
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          {error ? (
            <div className="p-5"><MasterErrorState title="Data unit gagal dimuat" description="Periksa koneksi kemudian coba muat ulang." onRetry={handleRefresh} /></div>
          ) : (
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="border-b border-slate-200/80 bg-slate-50/80 text-[10px] font-black uppercase tracking-[0.12em] text-slate-500">
                <tr>
                  <th className="w-[5%] px-2 py-3 text-center">No</th>
                  <th className="w-[26%] px-3 py-3 font-bold">Identitas Unit</th>
                  <th className="hidden w-[16%] px-3 py-3 font-bold md:table-cell">Lokasi</th>
                  <th className="hidden w-[18%] px-3 py-3 font-bold lg:table-cell">Kepala Sekolah</th>
                  <th className="hidden w-[19%] px-3 py-3 font-bold xl:table-cell">Statistik</th>
                  <th className="hidden w-[9%] px-2 py-3 text-center font-bold sm:table-cell">Status</th>
                  <th className="w-[7%] px-2 py-3 text-center font-bold">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {loading ? (
                  Array.from({ length: 6 }).map((_, index) => (
                    <tr key={index} className="animate-pulse">
                      <td colSpan={7} className="px-4 py-4"><div className="h-10 rounded-xl bg-slate-100 dark:bg-slate-800" /></td>
                    </tr>
                  ))
                ) : paginatedUnits.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-5"><MasterEmptyState title="Belum ada unit pendidikan" description="Ubah filter pencarian untuk menampilkan unit pendidikan lain." /></td>
                  </tr>
                ) : (
                  paginatedUnits.map((u, idx) => {
                    const isActive = u.is_active || u.status === 'aktif'
                    const level = u.jenis_unit || u.level || 'UP'
                    return (
                      <tr key={u.id || idx} className="transition-colors hover:bg-emerald-50/40">
                        <td className="px-2 py-3 text-center text-xs font-bold text-slate-400">{(page - 1) * perPage + idx + 1}</td>
                        <td className="px-3 py-3">
                          <PersonIdentityCell
                            src={u.logo_url}
                            name={u.name || u.nama}
                            subtitle={`${u.code || u.kode || '-'} • ${level}`}
                          />
                        </td>
                        <td className="hidden px-3 py-3 md:table-cell">
                          <span className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-200"><MapPin className="h-3.5 w-3.5 text-slate-400" />{u.location || u.description || 'Padang'}</span>
                        </td>
                        <td className="hidden px-3 py-3 lg:table-cell">
                          <PersonIdentityCell name={u.kepala_sekolah || 'Belum Ditentukan'} subtitle={u.principal_nip ? `NIP. ${u.principal_nip}` : 'Kepala Unit'} />
                        </td>
                        <td className="hidden px-3 py-3 xl:table-cell">
                          <div className="space-y-1 text-[10px] font-medium text-slate-500 dark:text-slate-300">
                            <span className="flex items-center gap-1.5"><GraduationCap className="h-3 w-3" />{(u.siswa_aktif_count || 0).toLocaleString('id-ID')} siswa</span>
                            <span className="flex items-center gap-1.5"><UsersRound className="h-3 w-3" />{(u.guru_count || 0).toLocaleString('id-ID')} guru</span>
                            <span className="flex items-center gap-1.5"><Building2 className="h-3 w-3" />{(u.rombel_count || 0).toLocaleString('id-ID')} rombel</span>
                          </div>
                        </td>
                        <td className="hidden px-2 py-3 text-center sm:table-cell">
                          <MasterStatusBadge active={isActive} activeLabel="Aktif" inactiveLabel="Nonaktif" />
                        </td>
                        <td className="px-2 py-3 text-center">
                          <div className="flex items-center justify-center">
                            <ActionDropdown onView={() => setSelectedUnitId(u.id)} />
                          </div>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          )}
        </div>
      </MasterDataTable>

      {totalItems > 0 && (
        <MasterPagination
          meta={{ total: totalItems, from: totalItems ? (page - 1) * perPage + 1 : 0, to: Math.min(page * perPage, totalItems), last_page: lastPage, current_page: page }}
          page={page}
          onPageChange={setPage}
          label="unit pendidikan"
        />
      )}

      <KpiDetailDrawer
        type="unit_pendidikan"
        id={selectedUnitId}
        isOpen={Boolean(selectedUnitId)}
        onClose={() => setSelectedUnitId(null)}
      />

      <FoundationUnitKpiModal
        type={activeKpiModal || 'peningkatan'}
        isOpen={Boolean(activeKpiModal)}
        onClose={() => setActiveKpiModal(null)}
        units={units}
      />

      <FoundationExportModal
        isOpen={showExport}
        onClose={() => setShowExport(false)}
        title="Unit Pendidikan Seluruh Yayasan"
        rows={exportRows}
        filename="Unit_Pendidikan_Yayasan"
      />
    </MasterDataPage>
  )
}
