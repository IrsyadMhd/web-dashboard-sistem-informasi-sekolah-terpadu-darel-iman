import { useCallback, useEffect, useMemo, useState } from 'react'
import { ArrowBothDirectionHorizontal2 } from '@tailgrids/icons'
import { Award, FileSpreadsheet, GraduationCap, RefreshCcw, ShieldAlert, Sparkles, UserCheck, UserMinus, UserRound, UsersRound } from 'lucide-react'
import ActionDropdown from '../../components/app/ActionDropdown'
import api from '../../services/api'
import {
  MasterBadge,
  MasterDataPage,
  MasterDataTable,
  MasterEmptyState,
  MasterErrorState,
  MasterFilterBar,
  MasterFilterSelect,
  MasterPagination,
  MasterSearchInput,
  MasterStatCard,
  MasterStatsGrid,
} from '../../components/master-data'
import { PersonIdentityCell } from '../../components/ui/PersonIdentityCell'
import KpiDetailDrawer from '../../components/KpiDetailDrawer'
import { FoundationExportModal } from '../../components/foundation/FoundationExportModal'

export function FoundationGraduationAlumniPage() {
  const [alumniList, setAlumniList] = useState([])
  const [units, setUnits] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [isFetching, setIsFetching] = useState(false)

  const [activeTab, setActiveTab] = useState('alumni') // 'alumni' | 'kelulusan'
  const [search, setSearch] = useState('')
  const [selectedUnit, setSelectedUnit] = useState('all')
  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useState(10)
  const [sortKey, setSortKey] = useState('nama')
  const [sortOrder, setSortOrder] = useState('asc')

  const [selectedAlumniId, setSelectedAlumniId] = useState(null)
  const [showExport, setShowExport] = useState(false)

  useEffect(() => {
    api.get('/foundation/units')
      .then((res) => {
        const raw = res.data?.data || res.data || []
        setUnits(Array.isArray(raw) ? raw : [])
      })
      .catch(() => {})
  }, [])

  const fetchAlumni = useCallback(async (silent = false) => {
    if (!silent) setLoading(true)
    else setIsFetching(true)
    setError(false)
    try {
      const endpoint = activeTab === 'alumni' ? '/foundation/alumni' : '/foundation/graduations'
      const params = {
        search: search || undefined,
        unit_id: selectedUnit !== 'all' ? selectedUnit : undefined,
        per_page: 100,
      }
      const res = await api.get(endpoint, { params })
      const resData = res.data
      let list = []
      if (Array.isArray(resData)) {
        list = resData
      } else if (resData?.data) {
        list = Array.isArray(resData.data) ? resData.data : resData.data.data || []
      }
      setAlumniList(list)
    } catch (err) {
      console.error('Failed to fetch foundation alumni:', err)
      setError(true)
    } finally {
      setLoading(false)
      setIsFetching(false)
    }
  }, [search, selectedUnit, activeTab])

  useEffect(() => {
    setPage(1)
    fetchAlumni()
  }, [fetchAlumni])

  const filteredList = useMemo(() => alumniList.filter((item) => {
    const name = (item.full_name || item.nama || '').toString().toLowerCase()
    const nis = (item.nis || item.nisn || '').toString().toLowerCase()
    const unitName = (item.education_unit?.name || item.unit?.name || '').toString().toLowerCase()

    const matchesSearch = name.includes(search.toLowerCase()) || nis.includes(search.toLowerCase())
    const matchesUnit = selectedUnit === 'all' || item.unit_id === selectedUnit || unitName.includes(selectedUnit.toLowerCase())

    return matchesSearch && matchesUnit
  }), [alumniList, search, selectedUnit])

  const graduationYear = (a) => {
    if (!a.tahun_masuk) return '-'
    const year = Number(a.tahun_masuk) + 3
    return Number.isNaN(year) ? '-' : year
  }

  const handleSort = (key) => {
    if (sortKey === key) {
      setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortKey(key)
      setSortOrder('asc')
    }
  }

  const sortedList = useMemo(() => {
    return [...filteredList].sort((a, b) => {
      let aVal = ''
      let bVal = ''
      if (sortKey === 'nama') {
        aVal = (a.full_name || a.nama || '').toString().toLowerCase()
        bVal = (b.full_name || b.nama || '').toString().toLowerCase()
      } else if (sortKey === 'nis') {
        aVal = (a.nis || a.nisn || '').toString().toLowerCase()
        bVal = (b.nis || b.nisn || '').toString().toLowerCase()
      } else if (sortKey === 'unit') {
        aVal = (a.education_unit?.name || a.unit?.name || '').toString().toLowerCase()
        bVal = (a.education_unit?.name || a.unit?.name || '').toString().toLowerCase()
      } else if (sortKey === 'lulus') {
        aVal = Number(graduationYear(a)) || 0
        bVal = Number(graduationYear(b)) || 0
      }

      if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1
      if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1
      return 0
    })
  }, [filteredList, sortKey, sortOrder])

  const totalItems = sortedList.length
  const lastPage = Math.max(1, Math.ceil(totalItems / perPage))
  const paginatedList = sortedList.slice((page - 1) * perPage, page * perPage)

  const totalData = alumniList.length
  const maleCount = alumniList.filter((a) => a.gender === 'male' || a.gender === 'L').length
  const femaleCount = alumniList.filter((a) => a.gender === 'female' || a.gender === 'P').length

  const handleRefresh = () => {
    setPage(1)
    fetchAlumni(Boolean(alumniList.length))
  }

  const exportRows = paginatedList.map((a, idx) => ({
    No: (page - 1) * perPage + idx + 1,
    'NIS / NISN': a.nis || a.nisn || '-',
    Nama: a.full_name || a.nama || '-',
    'Unit Asal': a.education_unit?.name || a.unit?.name || '-',
    'Tahun Lulus': graduationYear(a),
    Status: activeTab === 'alumni' ? 'Alumni Lulus' : 'Kelulusan',
  }))

  return (
    <MasterDataPage hideBreadcrumb className="foundation-graduation-page">
      {/* Stat Cards Ringkasan Alumni */}
      <MasterStatsGrid>
        <MasterStatCard icon={Sparkles} label={activeTab === 'alumni' ? 'Total Alumni' : 'Total Kelulusan'} value={totalData} description={activeTab === 'alumni' ? 'Terdata di sistem' : 'Siswa berstatus tidak aktif'} variant="success" delay={40} />
        <MasterStatCard icon={Award} label="Lulusan Terbaru" value={alumniList.filter((a) => graduationYear(a) >= new Date().getFullYear() - 1).length} description="Tahun ajaran berjalan" variant="info" delay={80} />
        <MasterStatCard icon={UserRound} label="Laki-Laki" value={maleCount} description="Data laki-laki" variant="warning" delay={120} />
        <MasterStatCard icon={UserCheck} label="Perempuan" value={femaleCount} description="Data perempuan" variant="success" delay={160} />
      </MasterStatsGrid>

      {/* Soft Pastel Squircle KPI & Quick Action Navigation Buttons */}
      <section className="mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* 1. Siswa Aktif (Tahun Ajaran) */}
          <a
            href="/dashboard/yayasan/siswa"
            className="group flex items-center justify-between gap-3 rounded-2xl border border-slate-200/80 bg-white p-3.5 shadow-xs transition-all duration-200 hover:scale-105 hover:shadow-md dark:border-slate-800 dark:bg-[#1B2433] text-left cursor-pointer"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[16px] border bg-emerald-50 text-emerald-600 border-emerald-200/60 transition-transform duration-200 group-hover:scale-110 dark:bg-emerald-950/60 dark:text-emerald-400 dark:border-emerald-800/60">
                <GraduationCap className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-extrabold text-slate-900 dark:text-white truncate group-hover:text-emerald-700 dark:group-hover:text-emerald-300">Siswa Aktif (Tahun Ajaran)</p>
                <p className="text-[10px] text-slate-400 font-medium truncate mt-0.5">Siswa Aktif Terdaftar</p>
              </div>
            </div>
            <span className="shrink-0 rounded-lg bg-emerald-100 px-2 py-1 text-[10px] font-extrabold text-emerald-700 dark:bg-emerald-900/60 dark:text-emerald-300">Aktif</span>
          </a>

          {/* 2. Siswa Masuk (Baru) */}
          <a
            href="/dashboard/yayasan/siswa-baru"
            className="group flex items-center justify-between gap-3 rounded-2xl border border-slate-200/80 bg-white p-3.5 shadow-xs transition-all duration-200 hover:scale-105 hover:shadow-md dark:border-slate-800 dark:bg-[#1B2433] text-left cursor-pointer"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[16px] border bg-sky-50 text-sky-600 border-sky-200/60 transition-transform duration-200 group-hover:scale-110 dark:bg-sky-950/60 dark:text-sky-400 dark:border-sky-800/60">
                <UserCheck className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-extrabold text-slate-900 dark:text-white truncate group-hover:text-sky-700 dark:group-hover:text-sky-300">Siswa Masuk (Baru)</p>
                <p className="text-[10px] text-slate-400 font-medium truncate mt-0.5">Pendaftaran Siswa Baru</p>
              </div>
            </div>
            <span className="shrink-0 rounded-lg bg-sky-100 px-2 py-1 text-[10px] font-extrabold text-sky-700 dark:bg-sky-900/60 dark:text-sky-300">Baru</span>
          </a>

          {/* 3. Siswa Keluar (Mutasi) */}
          <a
            href="/dashboard/yayasan/mutasi-siswa"
            className="group flex items-center justify-between gap-3 rounded-2xl border border-slate-200/80 bg-white p-3.5 shadow-xs transition-all duration-200 hover:scale-105 hover:shadow-md dark:border-slate-800 dark:bg-[#1B2433] text-left cursor-pointer"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[16px] border bg-amber-50 text-amber-600 border-amber-200/60 transition-transform duration-200 group-hover:scale-110 dark:bg-amber-950/60 dark:text-amber-400 dark:border-amber-800/60">
                <UserMinus className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-extrabold text-slate-900 dark:text-white truncate group-hover:text-amber-700 dark:group-hover:text-amber-300">Siswa Keluar (Mutasi)</p>
                <p className="text-[10px] text-slate-400 font-medium truncate mt-0.5">Riwayat Mutasi Siswa</p>
              </div>
            </div>
            <span className="shrink-0 rounded-lg bg-amber-100 px-2 py-1 text-[10px] font-extrabold text-amber-700 dark:bg-amber-900/60 dark:text-amber-300">Mutasi</span>
          </a>

          {/* 4. Kelulusan & Alumni */}
          <a
            href="/dashboard/yayasan/kelulusan-alumni"
            className="group flex items-center justify-between gap-3 rounded-2xl border border-purple-500/30 bg-purple-50/60 p-3.5 shadow-xs transition-all duration-200 hover:scale-105 hover:shadow-md dark:border-purple-800/60 dark:bg-purple-950/40 text-left cursor-pointer"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[16px] border bg-purple-100 text-purple-700 border-purple-200 transition-transform duration-200 group-hover:scale-110 dark:bg-purple-900/60 dark:text-purple-300 dark:border-purple-700">
                <Award className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-extrabold text-slate-900 dark:text-white truncate group-hover:text-purple-700 dark:group-hover:text-purple-300">Kelulusan & Alumni</p>
                <p className="text-[10px] text-slate-500 font-medium truncate mt-0.5">{totalData} Data Alumni</p>
              </div>
            </div>
            <span className="shrink-0 rounded-lg bg-purple-200/80 px-2 py-1 text-[10px] font-extrabold text-purple-800 dark:bg-purple-900 dark:text-purple-200">Alumni</span>
          </a>
        </div>
      </section>

      <MasterFilterBar
        search={<MasterSearchInput placeholder="Cari nama, NIS, atau angkatan..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1) }} />}
        filters={
          <>
            <MasterFilterSelect value={activeTab} onChange={(e) => { setActiveTab(e.target.value); setPage(1) }} aria-label="Tampilkan data">
              <option value="alumni">Data Alumni</option>
              <option value="kelulusan">Data Kelulusan</option>
            </MasterFilterSelect>
            <MasterFilterSelect value={selectedUnit} onChange={(e) => { setSelectedUnit(e.target.value); setPage(1) }} aria-label="Filter unit asal">
              <option value="all">Semua Unit Asal</option>
              {units.map((u) => <option key={u.id} value={u.id}>{u.name || u.code}</option>)}
            </MasterFilterSelect>
            <MasterFilterSelect
              value={perPage}
              onChange={(e) => { setPerPage(Number(e.target.value)); setPage(1) }}
              aria-label="Tampilkan per halaman"
            >
              <option value={5}>5 per Halaman</option>
              <option value={10}>10 per Halaman</option>
              <option value={15}>15 per Halaman</option>
              <option value={25}>25 per Halaman</option>
              <option value={50}>50 per Halaman</option>
              <option value={100}>100 per Halaman</option>
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
            <h2 className="text-base font-bold text-slate-900 dark:text-white">{activeTab === 'alumni' ? 'Daftar Alumni Lulus' : 'Daftar Siswa Lulus'}</h2>
            <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">Data lulusan & alumni sesuai filter dan kewenangan pengguna.</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300">{totalItems} {activeTab}</span>
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
            <div className="p-5"><MasterErrorState title="Data kelulusan gagal dimuat" description="Periksa koneksi kemudian coba muat ulang." onRetry={handleRefresh} /></div>
          ) : (
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="border-b border-slate-200/80 bg-slate-50/80 text-[10px] font-black uppercase tracking-[0.12em] text-slate-500">
                <tr>
                  <th className="w-[5%] px-2 py-3 text-center">No</th>
                  <th className="w-[28%] px-3 py-3 font-bold">
                    <button
                      type="button"
                      onClick={() => handleSort('nama')}
                      className="inline-flex items-center gap-1.5 transition-all duration-150 active:scale-95 cursor-pointer hover:text-slate-900 dark:hover:text-white"
                    >
                      <span>Nama Siswa</span>
                      <ArrowBothDirectionHorizontal2 className={`h-3 w-3 shrink-0 transition-transform duration-200 ${sortKey === 'nama' ? 'text-emerald-600 dark:text-emerald-400 rotate-180' : 'text-slate-400'}`} />
                    </button>
                  </th>
                  <th className="hidden w-[14%] px-3 py-3 font-bold md:table-cell">
                    <button
                      type="button"
                      onClick={() => handleSort('nis')}
                      className="inline-flex items-center gap-1.5 transition-all duration-150 active:scale-95 cursor-pointer hover:text-slate-900 dark:hover:text-white"
                    >
                      <span>NIS / NISN</span>
                      <ArrowBothDirectionHorizontal2 className={`h-3 w-3 shrink-0 transition-transform duration-200 ${sortKey === 'nis' ? 'text-emerald-600 dark:text-emerald-400 rotate-180' : 'text-slate-400'}`} />
                    </button>
                  </th>
                  <th className="hidden w-[22%] px-3 py-3 font-bold lg:table-cell">
                    <button
                      type="button"
                      onClick={() => handleSort('unit')}
                      className="inline-flex items-center gap-1.5 transition-all duration-150 active:scale-95 cursor-pointer hover:text-slate-900 dark:hover:text-white"
                    >
                      <span>Unit Asal</span>
                      <ArrowBothDirectionHorizontal2 className={`h-3 w-3 shrink-0 transition-transform duration-200 ${sortKey === 'unit' ? 'text-emerald-600 dark:text-emerald-400 rotate-180' : 'text-slate-400'}`} />
                    </button>
                  </th>
                  <th className="hidden w-[13%] px-3 py-3 font-bold xl:table-cell">
                    <button
                      type="button"
                      onClick={() => handleSort('lulus')}
                      className="inline-flex items-center gap-1.5 transition-all duration-150 active:scale-95 cursor-pointer hover:text-slate-900 dark:hover:text-white"
                    >
                      <span>Tahun Lulus</span>
                      <ArrowBothDirectionHorizontal2 className={`h-3 w-3 shrink-0 transition-transform duration-200 ${sortKey === 'lulus' ? 'text-emerald-600 dark:text-emerald-400 rotate-180' : 'text-slate-400'}`} />
                    </button>
                  </th>
                  <th className="hidden w-[11%] px-2 py-3 text-center font-bold sm:table-cell">Status</th>
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
                ) : paginatedList.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-5"><MasterEmptyState title="Belum ada data kelulusan / alumni" description="Ubah filter pencarian untuk menampilkan alumni atau lulusan lain." /></td>
                  </tr>
                ) : (
                  paginatedList.map((a, idx) => (
                    <tr key={a.id || idx} className="transition-colors hover:bg-emerald-50/40">
                      <td className="px-2 py-3 text-center text-xs font-bold text-slate-400">{(page - 1) * perPage + idx + 1}</td>
                      <td className="px-3 py-3">
                        <PersonIdentityCell
                          src={a.photo}
                          name={a.full_name || a.nama}
                          subtitle={`${a.nis || a.nisn || '-'}`}
                        />
                      </td>
                      <td className="hidden px-3 py-3 md:table-cell">
                        <span className="font-mono text-xs font-bold text-slate-900 dark:text-white">{a.nis || a.nisn || '-'}</span>
                      </td>
                      <td className="hidden px-3 py-3 lg:table-cell">
                        <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">{a.education_unit?.name || a.unit?.name || '-'}</span>
                      </td>
                      <td className="hidden px-3 py-3 xl:table-cell">
                        <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">{graduationYear(a)}</span>
                      </td>
                      <td className="hidden px-2 py-3 text-center sm:table-cell">
                        <MasterBadge variant={activeTab === 'alumni' ? 'success' : 'info'}>{activeTab === 'alumni' ? 'Alumni' : 'Kelulusan'}</MasterBadge>
                      </td>
                      <td className="px-2 py-3 text-center">
                        <ActionDropdown onView={() => setSelectedAlumniId(a.id)} />
                      </td>
                    </tr>
                  ))
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
          label={activeTab}
        />
      )}

      <KpiDetailDrawer
        type="siswa"
        id={selectedAlumniId}
        isOpen={Boolean(selectedAlumniId)}
        onClose={() => setSelectedAlumniId(null)}
      />

      <FoundationExportModal
        isOpen={showExport}
        onClose={() => setShowExport(false)}
        title="Data Alumni & Kelulusan Yayasan"
        rows={exportRows}
        filename="Alumni_Kelulusan_Yayasan"
      />
    </MasterDataPage>
  )
}
