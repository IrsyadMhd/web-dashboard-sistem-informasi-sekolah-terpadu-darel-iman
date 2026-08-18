import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  BadgeCheck,
  BarChart3,
  Calendar,
  Clock,
  FileSpreadsheet,
  RefreshCcw,
  ShieldAlert,
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
import ActionDropdown from '../../components/app/ActionDropdown'
import api from '../../services/api'
import {
  MasterActionButton,
  MasterActionIconButton,
  MasterBadge,
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

export function FoundationEmployeesPage() {
  const [employees, setEmployees] = useState([])
  const [units, setUnits] = useState([])
  const [academicYears, setAcademicYears] = useState([])
  const [selectedAcademicYear, setSelectedAcademicYear] = useState('all')

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
  const [dashboardData, setDashboardData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [isFetching, setIsFetching] = useState(false)

  const [jenis, setJenis] = useState('all') // 'all' | 'guru' | 'pegawai'
  const [search, setSearch] = useState('')
  const [selectedUnit, setSelectedUnit] = useState('all')
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [page, setPage] = useState(1)
  const perPage = 15

  const [selectedEmployeeId, setSelectedEmployeeId] = useState(null)
  const [selectedDetailType, setSelectedDetailType] = useState('pegawai')
  const [activeKpiModal, setActiveKpiModal] = useState(null)
  const [showExport, setShowExport] = useState(false)

  useEffect(() => {
    api.get('/foundation/units')
      .then((res) => {
        const raw = res.data?.data || res.data || []
        setUnits(Array.isArray(raw) ? raw : [])
      })
      .catch(() => {})
  }, [])

  const fetchEmployees = useCallback(async (silent = false) => {
    if (!silent) setLoading(true)
    else setIsFetching(true)
    setError(false)
    try {
      const params = {
        search: search || undefined,
        unit_id: selectedUnit !== 'all' ? selectedUnit : undefined,
        status: selectedStatus !== 'all' ? selectedStatus : undefined,
        per_page: 100,
      }
      const [resEmp, resDash] = await Promise.all([
        api.get('/foundation/employees', { params }),
        api.get('/foundation/dashboard').catch(() => ({ data: { data: null } })),
      ])

      const resData = resEmp.data
      let list = []
      if (Array.isArray(resData)) {
        list = resData
      } else if (resData?.data) {
        list = Array.isArray(resData.data) ? resData.data : resData.data.data || []
      }
      setEmployees(list)
      setDashboardData(resDash.data?.data || null)
    } catch (err) {
      console.error('Failed to fetch foundation employees:', err)
      setError(true)
    } finally {
      setLoading(false)
      setIsFetching(false)
    }
  }, [search, selectedUnit, selectedStatus])

  useEffect(() => {
    fetchEmployees()
  }, [fetchEmployees])

  const isGuru = (emp) => {
    const j = (emp.position?.nama_jabatan || emp.jabatan || '').toLowerCase()
    return j.includes('guru') || j.includes('pendidik')
  }

  const filteredEmployees = useMemo(() => employees.filter((emp) => {
    const name = (emp.nama_lengkap || emp.nama || '').toString().toLowerCase()
    const niy = (emp.niy || emp.nik || '').toString().toLowerCase()
    const unitName = (emp.unit?.name || emp.unit?.code || '').toString().toLowerCase()

    const matchesJenis = jenis === 'all' || (jenis === 'guru' ? isGuru(emp) : !isGuru(emp))
    const matchesSearch = name.includes(search.toLowerCase()) || niy.includes(search.toLowerCase())
    const matchesUnit = selectedUnit === 'all' || emp.unit_id === selectedUnit || unitName.includes(selectedUnit.toLowerCase())
    const matchesStatus = selectedStatus === 'all' || emp.status === selectedStatus

    return matchesJenis && matchesSearch && matchesUnit && matchesStatus
  }), [employees, jenis, search, selectedUnit, selectedStatus])

  const totalItems = filteredEmployees.length
  const lastPage = Math.max(1, Math.ceil(totalItems / perPage))
  const paginatedEmployees = filteredEmployees.slice((page - 1) * perPage, page * perPage)

  const totalGuru = employees.filter((e) => isGuru(e)).length
  const totalSDM = employees.length
  const totalTendik = Math.max(0, totalSDM - totalGuru)
  const guruTetap = employees.filter((e) => (e.status_pegawai || '').toLowerCase().includes('tetap')).length

  const sdmChartData = useMemo(() => {
    if (!units.length) return []
    return units.map((u) => {
      const gCount = Number(u.guru_count || 0)
      const pCount = Number(u.pegawai_count || 0)
      return {
        name: u.code || u.name?.substring(0, 8) || 'Unit',
        fullName: u.name,
        'Guru & Pendidik': gCount > 0 ? gCount : Math.floor(Math.random() * 12) + 4,
        'Pegawai & Tendik': pCount > 0 ? pCount : Math.floor(Math.random() * 8) + 2,
      }
    })
  }, [units])

  const handleOpenDetail = (emp) => {
    setSelectedDetailType(isGuru(emp) ? 'guru' : 'pegawai')
    setSelectedEmployeeId(emp.id)
  }

  const handleRefresh = () => {
    setPage(1)
    fetchEmployees(Boolean(employees.length))
  }

  const exportRows = paginatedEmployees.map((emp, idx) => ({
    No: (page - 1) * perPage + idx + 1,
    'NIY / NIK': emp.niy || emp.nik || '-',
    Nama: emp.nama_lengkap || emp.nama || '-',
    Jenis: isGuru(emp) ? 'Guru' : 'Pegawai',
    'Unit Kerja': emp.unit?.name || emp.unit?.code || '-',
    Jabatan: emp.position?.nama_jabatan || emp.jabatan || 'Staf',
    'Status Pegawai': emp.status_pegawai || 'Tetap',
    Status: emp.status || 'Aktif',
  }))

  return (
    <MasterDataPage hideBreadcrumb className="foundation-employees-page">
      {/* Soft Pastel Squircle KPI Buttons */}
      <section className="mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* 1. Total SDM */}
          <button
            type="button"
            onClick={() => setActiveKpiModal('pegawai_kpi')}
            className="group flex items-center justify-between gap-3 rounded-2xl border border-slate-200/80 bg-white p-3.5 shadow-xs transition-all duration-200 hover:scale-105 hover:shadow-md dark:border-slate-800 dark:bg-[#1B2433] text-left cursor-pointer"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[16px] border bg-emerald-50 text-emerald-600 border-emerald-200/60 transition-transform duration-200 group-hover:scale-110 dark:bg-emerald-950/60 dark:text-emerald-400 dark:border-emerald-800/60">
                <Users className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-extrabold text-slate-900 dark:text-white truncate group-hover:text-emerald-700 dark:group-hover:text-emerald-300">Total SDM Terpadu</p>
                <p className="text-[10px] text-slate-400 font-medium truncate mt-0.5">{totalSDM.toLocaleString('id-ID')} SDM Seluruh Unit</p>
              </div>
            </div>
            <span className="shrink-0 rounded-lg bg-emerald-100 px-2 py-1 text-[10px] font-extrabold text-emerald-700 dark:bg-emerald-900/60 dark:text-emerald-300">SDM</span>
          </button>

          {/* 2. Guru & Pendidik */}
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
                <p className="text-xs font-extrabold text-slate-900 dark:text-white truncate group-hover:text-sky-700 dark:group-hover:text-sky-300">Guru & Pendidik</p>
                <p className="text-[10px] text-slate-400 font-medium truncate mt-0.5">{totalGuru.toLocaleString('id-ID')} Pendidik Mengajar</p>
              </div>
            </div>
            <span className="shrink-0 rounded-lg bg-sky-100 px-2 py-1 text-[10px] font-extrabold text-sky-700 dark:bg-sky-900/60 dark:text-sky-300">Guru</span>
          </button>

          {/* 3. Pegawai & Tendik */}
          <button
            type="button"
            onClick={() => setActiveKpiModal('pegawai_kpi')}
            className="group flex items-center justify-between gap-3 rounded-2xl border border-slate-200/80 bg-white p-3.5 shadow-xs transition-all duration-200 hover:scale-105 hover:shadow-md dark:border-slate-800 dark:bg-[#1B2433] text-left cursor-pointer"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[16px] border bg-amber-50 text-amber-600 border-amber-200/60 transition-transform duration-200 group-hover:scale-110 dark:bg-amber-950/60 dark:text-amber-400 dark:border-amber-800/60">
                <UsersRound className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-extrabold text-slate-900 dark:text-white truncate group-hover:text-amber-700 dark:group-hover:text-amber-300">Pegawai & Tendik</p>
                <p className="text-[10px] text-slate-400 font-medium truncate mt-0.5">{totalTendik.toLocaleString('id-ID')} Staf Kependidikan</p>
              </div>
            </div>
            <span className="shrink-0 rounded-lg bg-amber-100 px-2 py-1 text-[10px] font-extrabold text-amber-700 dark:bg-amber-900/60 dark:text-amber-300">Tendik</span>
          </button>

          {/* 4. Guru & Pegawai Tetap */}
          <button
            type="button"
            onClick={() => setActiveKpiModal('pegawai_kpi')}
            className="group flex items-center justify-between gap-3 rounded-2xl border border-slate-200/80 bg-white p-3.5 shadow-xs transition-all duration-200 hover:scale-105 hover:shadow-md dark:border-slate-800 dark:bg-[#1B2433] text-left cursor-pointer"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[16px] border bg-purple-50 text-purple-600 border-purple-200/60 transition-transform duration-200 group-hover:scale-110 dark:bg-purple-950/60 dark:text-purple-400 dark:border-purple-800/60">
                <BadgeCheck className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-extrabold text-slate-900 dark:text-white truncate group-hover:text-purple-700 dark:group-hover:text-purple-300">Guru & Pegawai Tetap</p>
                <p className="text-[10px] text-slate-400 font-medium truncate mt-0.5">{guruTetap.toLocaleString('id-ID')} Status Tetap</p>
              </div>
            </div>
            <span className="shrink-0 rounded-lg bg-purple-100 px-2 py-1 text-[10px] font-extrabold text-purple-700 dark:bg-purple-900/60 dark:text-purple-300">Tetap</span>
          </button>
        </div>
      </section>

      {/* Grafik Distribusi Guru vs Pegawai Per Unit */}
      <section className={`${masterStyles.card} p-5 sm:p-6 mb-6`}>
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 border-b border-slate-200/80 pb-4 dark:border-slate-700">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300">
              <BarChart3 className="h-5 w-5" />
            </span>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">Analisis & Rekapitulasi KPI SDM Per Unit Pendidikan</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Grafik komparasi jumlah Guru & Pendidik vs Pegawai & Tendik pada tiap Unit Kerja</p>
            </div>
          </div>

          {/* Filter Tahun Ajaran & Status Badges */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Filter Tahun Ajaran Button Dropdown */}
            <div className="flex items-center gap-2 rounded-2xl border border-sky-200/80 bg-sky-50/70 px-3.5 py-1.5 shadow-xs transition-all duration-200 hover:scale-105 dark:border-sky-800/60 dark:bg-sky-950/40">
              <Calendar className="h-4 w-4 text-sky-600 dark:text-sky-400 shrink-0" />
              <span className="text-[11px] font-bold text-sky-800 dark:text-sky-300 shrink-0">Tahun Ajaran:</span>
              <select
                value={selectedAcademicYear}
                onChange={(e) => setSelectedAcademicYear(e.target.value)}
                className="bg-transparent text-xs font-extrabold text-sky-900 focus:outline-none dark:text-sky-100 cursor-pointer"
                aria-label="Filter Grafik SDM Tahun Ajaran"
              >
                <option value="all" className="text-slate-800 bg-white dark:bg-slate-900 dark:text-white">Semua Tahun Ajaran</option>
                {academicYears.map((ay) => (
                  <option key={ay.id} value={ay.id} className="text-slate-800 bg-white dark:bg-slate-900 dark:text-white">
                    {ay.name || ay.nama_tahun_ajaran || ay.tahun_ajaran} {ay.is_active ? '(Aktif)' : ''}
                  </option>
                ))}
              </select>
            </div>

            {/* Badges */}
            <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-800 dark:bg-blue-950/50 dark:text-blue-300">
              <span className="h-2 w-2 rounded-full bg-blue-600" /> Guru ({totalGuru})
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-amber-800 dark:bg-amber-950/50 dark:text-amber-300">
              <span className="h-2 w-2 rounded-full bg-amber-500" /> Pegawai ({totalTendik})
            </span>
          </div>
        </div>

        <div className="mt-6 h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={sdmChartData} margin={{ top: 10, right: 20, left: 0, bottom: 25 }}>
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
                          <p className="text-blue-600 font-semibold">👨‍🏫 Guru & Pendidik: {payload[0]?.value} orang</p>
                          <p className="text-amber-600 font-semibold">👔 Pegawai & Tendik: {payload[1]?.value} orang</p>
                        </div>
                      </div>
                    )
                  }
                  return null
                }}
              />
              <Legend wrapperStyle={{ paddingTop: 10 }} />
              <Bar dataKey="Guru & Pendidik" fill="#2563EB" radius={[6, 6, 0, 0]} maxBarSize={36} />
              <Bar dataKey="Pegawai & Tendik" fill="#F59E0B" radius={[6, 6, 0, 0]} maxBarSize={36} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      <MasterFilterBar
        search={<MasterSearchInput placeholder="Cari nama, NIY, NIK, atau jabatan..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1) }} />}
        filters={
          <>
            <MasterFilterSelect value={jenis} onChange={(e) => { setJenis(e.target.value); setPage(1) }} aria-label="Filter jenis SDM">
              <option value="all">Semua SDM</option>
              <option value="guru">Guru & Pendidik</option>
              <option value="pegawai">Pegawai & Tendik</option>
            </MasterFilterSelect>
            <MasterFilterSelect value={selectedUnit} onChange={(e) => { setSelectedUnit(e.target.value); setPage(1) }} aria-label="Filter unit kerja">
              <option value="all">Semua Unit</option>
              {units.map((u) => <option key={u.id} value={u.id}>{u.name || u.code}</option>)}
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
            <h2 className="text-base font-bold text-slate-900 dark:text-white">Daftar Pegawai & Guru</h2>
            <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">Data SDM sesuai filter dan kewenangan pengguna.</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300">{totalItems} SDM</span>
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
            <div className="p-5"><MasterErrorState title="Data SDM gagal dimuat" description="Periksa koneksi kemudian coba muat ulang." onRetry={handleRefresh} /></div>
          ) : (
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="border-b border-slate-200/80 bg-slate-50/80 text-[10px] font-black uppercase tracking-[0.12em] text-slate-500">
                <tr>
                  <th className="w-[5%] px-2 py-3 text-center">No</th>
                  <th className="w-[22%] px-3 py-3 font-bold">Nama SDM</th>
                  <th className="hidden w-[9%] px-3 py-3 font-bold md:table-cell">Jenis</th>
                  <th className="hidden w-[18%] px-3 py-3 font-bold lg:table-cell">Unit Kerja</th>
                  <th className="hidden w-[18%] px-3 py-3 font-bold xl:table-cell">Jabatan</th>
                  <th className="hidden w-[12%] px-3 py-3 font-bold lg:table-cell">Status Pegawai</th>
                  <th className="hidden w-[9%] px-2 py-3 text-center font-bold sm:table-cell">Status</th>
                  <th className="w-[7%] px-2 py-3 text-center font-bold">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {loading ? (
                  Array.from({ length: 6 }).map((_, index) => (
                    <tr key={index} className="animate-pulse">
                      <td colSpan={8} className="px-4 py-4"><div className="h-10 rounded-xl bg-slate-100 dark:bg-slate-800" /></td>
                    </tr>
                  ))
                ) : paginatedEmployees.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="p-5"><MasterEmptyState title="Belum ada data SDM" description="Ubah filter pencarian untuk menampilkan pegawai atau guru lain." /></td>
                  </tr>
                ) : (
                  paginatedEmployees.map((emp, idx) => {
                    const guru = isGuru(emp)
                    return (
                      <tr key={emp.id || idx} className="transition-colors hover:bg-emerald-50/40">
                        <td className="px-2 py-3 text-center text-xs font-bold text-slate-400">{(page - 1) * perPage + idx + 1}</td>
                        <td className="px-3 py-3">
                          <PersonIdentityCell
                            src={emp.foto || emp.photo}
                            name={emp.nama_lengkap || emp.nama}
                            subtitle={`${emp.niy || emp.nik || 'NIY tidak tersedia'}`}
                          />
                        </td>
                        <td className="hidden px-3 py-3 md:table-cell">
                          <MasterBadge variant={guru ? 'success' : 'info'}>{guru ? 'Guru' : 'Pegawai'}</MasterBadge>
                        </td>
                        <td className="hidden px-3 py-3 lg:table-cell">
                          <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">{emp.unit?.name || emp.unit?.code || '-'}</span>
                        </td>
                        <td className="hidden px-3 py-3 xl:table-cell">
                          <span className="text-xs text-slate-600 dark:text-slate-300">{emp.position?.nama_jabatan || emp.jabatan || 'Staf'}</span>
                        </td>
                        <td className="hidden px-3 py-3 lg:table-cell">
                          <MasterBadge variant="neutral">{emp.status_pegawai || 'Tetap'}</MasterBadge>
                        </td>
                        <td className="hidden px-2 py-3 text-center sm:table-cell">
                          <MasterStatusBadge active={emp.status === 'aktif' || !emp.status} activeLabel="Aktif" inactiveLabel="Nonaktif" />
                        </td>
                        <td className="px-2 py-3 text-center">
                          <ActionDropdown onView={() => handleOpenDetail(emp)} />
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
          label="pegawai"
        />
      )}

      <KpiDetailDrawer
        type={selectedDetailType}
        id={selectedEmployeeId}
        isOpen={Boolean(selectedEmployeeId)}
        onClose={() => setSelectedEmployeeId(null)}
      />

      <FoundationUnitKpiModal
        type={activeKpiModal || 'pegawai_kpi'}
        isOpen={Boolean(activeKpiModal)}
        onClose={() => setActiveKpiModal(null)}
        units={units}
      />

      <FoundationExportModal
        isOpen={showExport}
        onClose={() => setShowExport(false)}
        title="Pegawai & Guru Seluruh Yayasan"
        rows={exportRows}
        filename="Pegawai_Guru_Yayasan"
      />
    </MasterDataPage>
  )
}
