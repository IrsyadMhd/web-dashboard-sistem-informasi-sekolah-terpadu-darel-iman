import { useCallback, useEffect, useMemo, useState } from 'react'
import { Award, FileSpreadsheet, RefreshCcw, ShieldAlert, Sparkles, UserCheck, UserRound } from 'lucide-react'
import ActionDropdown from '../../components/app/ActionDropdown'
import api from '../../services/api'
import {
  MasterActionButton,
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
  const perPage = 15

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

  const totalItems = filteredList.length
  const lastPage = Math.max(1, Math.ceil(totalItems / perPage))
  const paginatedList = filteredList.slice((page - 1) * perPage, page * perPage)

  const totalData = alumniList.length
  const maleCount = alumniList.filter((a) => a.gender === 'male' || a.gender === 'L').length
  const femaleCount = alumniList.filter((a) => a.gender === 'female' || a.gender === 'P').length

  const graduationYear = (a) => {
    if (!a.tahun_masuk) return '-'
    const year = Number(a.tahun_masuk) + 3
    return Number.isNaN(year) ? '-' : year
  }

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
      <MasterPageHeader
        title="Kelulusan & Alumni"
        description="Pantau data kelulusan dan alumni dari seluruh Unit Pendidikan secara terstruktur."
        tone="brand"
        icon={Award}
        actions={(
          <>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-2 text-[10px] font-bold text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300">
              <ShieldAlert className="h-3 w-3" />
              Mode Monitoring • Akses Read-Only
            </span>
            <MasterActionButton variant="export" icon={FileSpreadsheet} onClick={() => setShowExport(true)}>
              Export Data
            </MasterActionButton>
          </>
        )}
      />

      <MasterStatsGrid>
        <MasterStatCard icon={Sparkles} label={activeTab === 'alumni' ? 'Total Alumni' : 'Total Kelulusan'} value={totalData} description={activeTab === 'alumni' ? 'Terdata di sistem' : 'Siswa berstatus tidak aktif'} variant="success" delay={40} />
        <MasterStatCard icon={Award} label="Lulusan Terbaru" value={alumniList.filter((a) => graduationYear(a) >= new Date().getFullYear() - 1).length} description="Tahun ajaran berjalan" variant="info" delay={80} />
        <MasterStatCard icon={UserRound} label="Laki-Laki" value={maleCount} description="Data laki-laki" variant="warning" delay={120} />
        <MasterStatCard icon={UserCheck} label="Perempuan" value={femaleCount} description="Data perempuan" variant="neutral" delay={160} />
      </MasterStatsGrid>

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
            <h2 className="text-base font-bold text-slate-900 dark:text-white">{activeTab === 'alumni' ? 'Daftar Alumni' : 'Daftar Kelulusan'}</h2>
            <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">Data sesuai filter dan kewenangan pengguna.</p>
          </div>
          <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300">{totalItems} {activeTab === 'alumni' ? 'alumni' : 'kelulusan'}</span>
        </div>
        <div className="overflow-x-auto">
          {error ? (
            <div className="p-5"><MasterErrorState title="Data alumni gagal dimuat" description="Periksa koneksi kemudian coba muat ulang." onRetry={handleRefresh} /></div>
          ) : (
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="border-b border-slate-200/80 bg-slate-50/80 text-[10px] font-black uppercase tracking-[0.12em] text-slate-500">
                <tr>
                  <th className="w-[5%] px-2 py-3 text-center">No</th>
                  <th className="w-[28%] px-3 py-3 font-bold">Nama</th>
                  <th className="hidden w-[20%] px-3 py-3 font-bold md:table-cell">Unit Asal</th>
                  <th className="hidden w-[13%] px-3 py-3 font-bold lg:table-cell">Tahun Lulus</th>
                  <th className="hidden w-[10%] px-3 py-3 font-bold xl:table-cell">Gender</th>
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
                ) : paginatedList.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-5"><MasterEmptyState title="Belum ada data alumni" description="Ubah filter pencarian untuk menampilkan data alumni lain." /></td>
                  </tr>
                ) : (
                  paginatedList.map((a, idx) => {
                    const gender = a.gender === 'male' || a.gender === 'L' ? 'Laki-Laki' : a.gender === 'female' || a.gender === 'P' ? 'Perempuan' : '-'
                    return (
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
                          <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">{a.education_unit?.name || a.unit?.name || '-'}</span>
                        </td>
                        <td className="hidden px-3 py-3 lg:table-cell">
                          <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">{graduationYear(a)}</span>
                        </td>
                        <td className="hidden px-3 py-3 xl:table-cell">
                          <span className="text-xs text-slate-600 dark:text-slate-300">{gender}</span>
                        </td>
                        <td className="hidden px-2 py-3 text-center sm:table-cell">
                          <MasterBadge variant={activeTab === 'alumni' ? 'info' : 'success'}>{activeTab === 'alumni' ? 'Alumni Lulus' : 'Lulus'}</MasterBadge>
                        </td>
                        <td className="px-2 py-3 text-center">
                          <div className="flex justify-center">
                            <ActionDropdown onView={() => setSelectedAlumniId(a.id)} />
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
          label="data"
        />
      )}

      <KpiDetailDrawer
        type="alumni"
        id={selectedAlumniId}
        isOpen={Boolean(selectedAlumniId)}
        onClose={() => setSelectedAlumniId(null)}
      />

      <FoundationExportModal
        isOpen={showExport}
        onClose={() => setShowExport(false)}
        title={activeTab === 'alumni' ? 'Data Alumni Yayasan' : 'Data Kelulusan Yayasan'}
        rows={exportRows}
        filename={activeTab === 'alumni' ? 'Alumni_Yayasan' : 'Kelulusan_Yayasan'}
      />
    </MasterDataPage>
  )
}
