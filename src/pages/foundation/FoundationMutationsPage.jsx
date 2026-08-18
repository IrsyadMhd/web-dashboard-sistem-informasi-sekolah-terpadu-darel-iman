import { useCallback, useEffect, useMemo, useState } from 'react'
import { ArrowRightLeft, FileSpreadsheet, RefreshCcw, ShieldAlert, UserMinus, UserPlus, UsersRound } from 'lucide-react'
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

const MUTATION_VARIANTS = {
  masuk: { label: 'Pindah Masuk', variant: 'success' },
  antar: { label: 'Pindah Antarunit', variant: 'info' },
  keluar: { label: 'Pindah Keluar', variant: 'danger' },
}

function mutationInfo(m) {
  const raw = (m.metadata?.mutasi_type || m.mutasi_type || '').toString().toLowerCase()
  if (raw.includes('antar')) return MUTATION_VARIANTS.antar
  if (raw.includes('keluar')) return MUTATION_VARIANTS.keluar
  if (raw.includes('masuk')) return MUTATION_VARIANTS.masuk
  return { label: raw ? raw.toUpperCase() : 'Mutasi', variant: 'neutral' }
}

export function FoundationMutationsPage() {
  const [mutations, setMutations] = useState([])
  const [units, setUnits] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [isFetching, setIsFetching] = useState(false)

  const [jenis, setJenis] = useState('all') // 'all' | 'masuk' | 'antarunit' | 'keluar'
  const [search, setSearch] = useState('')
  const [selectedUnit, setSelectedUnit] = useState('all')
  const [page, setPage] = useState(1)
  const perPage = 15

  const [selectedStudentId, setSelectedStudentId] = useState(null)
  const [showExport, setShowExport] = useState(false)

  useEffect(() => {
    api.get('/foundation/units')
      .then((res) => {
        const raw = res.data?.data || res.data || []
        setUnits(Array.isArray(raw) ? raw : [])
      })
      .catch(() => {})
  }, [])

  const fetchMutations = useCallback(async (silent = false) => {
    if (!silent) setLoading(true)
    else setIsFetching(true)
    setError(false)
    try {
      const params = {
        search: search || undefined,
        unit_id: selectedUnit !== 'all' ? selectedUnit : undefined,
        type: jenis !== 'all' ? jenis : undefined,
        per_page: 100,
      }
      const res = await api.get('/foundation/student-mutations', { params })
      const resData = res.data
      let list = []
      if (Array.isArray(resData)) {
        list = resData
      } else if (resData?.data) {
        list = Array.isArray(resData.data) ? resData.data : resData.data.data || []
      }
      setMutations(list)
    } catch (err) {
      console.error('Failed to fetch foundation mutations:', err)
      setError(true)
    } finally {
      setLoading(false)
      setIsFetching(false)
    }
  }, [search, selectedUnit, jenis])

  useEffect(() => {
    fetchMutations()
  }, [fetchMutations])

  const filteredMutations = useMemo(() => mutations.filter((m) => {
    const name = (m.full_name || m.nama || '').toString().toLowerCase()
    const nis = (m.nis || m.nisn || '').toString().toLowerCase()
    const unitName = (m.education_unit?.name || m.unit?.name || '').toString().toLowerCase()
    const raw = (m.metadata?.mutasi_type || m.mutasi_type || '').toString().toLowerCase()

    const matchesJenis =
      jenis === 'all' ||
      (jenis === 'masuk' && raw.includes('masuk')) ||
      (jenis === 'antarunit' && raw.includes('antar')) ||
      (jenis === 'keluar' && raw.includes('keluar'))

    const matchesSearch = name.includes(search.toLowerCase()) || nis.includes(search.toLowerCase())
    const matchesUnit = selectedUnit === 'all' || m.unit_id === selectedUnit || unitName.includes(selectedUnit.toLowerCase())

    return matchesJenis && matchesSearch && matchesUnit
  }), [mutations, jenis, search, selectedUnit])

  const totalItems = filteredMutations.length
  const lastPage = Math.max(1, Math.ceil(totalItems / perPage))
  const paginatedMutations = filteredMutations.slice((page - 1) * perPage, page * perPage)

  const totalMutasi = mutations.length
  const pindahMasuk = mutations.filter((m) => (m.metadata?.mutasi_type || '').includes('masuk')).length
  const pindahAntarunit = mutations.filter((m) => (m.metadata?.mutasi_type || '').includes('antar')).length
  const pindahKeluar = mutations.filter((m) => (m.metadata?.mutasi_type || '').includes('keluar')).length

  const handleRefresh = () => {
    setPage(1)
    fetchMutations(Boolean(mutations.length))
  }

  const exportRows = paginatedMutations.map((m, idx) => ({
    No: (page - 1) * perPage + idx + 1,
    'NIS / NISN': m.nis || m.nisn || '-',
    Nama: m.full_name || m.nama || '-',
    'Jenis Mutasi': mutationInfo(m).label,
    'Unit Sekolah': m.education_unit?.name || m.unit?.name || '-',
    'Tanggal Pengajuan': m.updated_at ? new Date(m.updated_at).toLocaleDateString('id-ID') : '-',
    Status: 'Selesai',
  }))

  return (
    <MasterDataPage hideBreadcrumb className="foundation-mutations-page">
      <MasterPageHeader
        title="Mutasi Siswa"
        description="Pantau siswa pindah masuk, pindah antarunit, dan pindah keluar dari seluruh Unit Pendidikan."
        tone="brand"
        icon={ArrowRightLeft}
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
        <MasterStatCard icon={ArrowRightLeft} label="Total Mutasi" value={totalMutasi} description="Seluruh jenis mutasi" variant="success" delay={40} />
        <MasterStatCard icon={UserPlus} label="Pindah Masuk" value={pindahMasuk} description="Siswa pindahan masuk" variant="info" delay={80} />
        <MasterStatCard icon={UsersRound} label="Pindah Antarunit" value={pindahAntarunit} description="Antar unit yayasan" variant="warning" delay={120} />
        <MasterStatCard icon={UserMinus} label="Pindah Keluar" value={pindahKeluar} description="Siswa pindah keluar" variant="danger" delay={160} />
      </MasterStatsGrid>

      <MasterFilterBar
        search={<MasterSearchInput placeholder="Cari nama siswa atau NIS..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1) }} />}
        filters={
          <>
            <MasterFilterSelect value={jenis} onChange={(e) => { setJenis(e.target.value); setPage(1) }} aria-label="Filter jenis mutasi">
              <option value="all">Semua Mutasi</option>
              <option value="masuk">Pindah Masuk</option>
              <option value="antarunit">Pindah Antarunit</option>
              <option value="keluar">Pindah Keluar</option>
            </MasterFilterSelect>
            <MasterFilterSelect value={selectedUnit} onChange={(e) => { setSelectedUnit(e.target.value); setPage(1) }} aria-label="Filter unit pendidikan">
              <option value="all">Semua Unit</option>
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
            <h2 className="text-base font-bold text-slate-900 dark:text-white">Daftar Mutasi Siswa</h2>
            <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">Data mutasi sesuai filter dan kewenangan pengguna.</p>
          </div>
          <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300">{totalItems} mutasi</span>
        </div>
        <div className="overflow-x-auto">
          {error ? (
            <div className="p-5"><MasterErrorState title="Data mutasi gagal dimuat" description="Periksa koneksi kemudian coba muat ulang." onRetry={handleRefresh} /></div>
          ) : (
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="border-b border-slate-200/80 bg-slate-50/80 text-[10px] font-black uppercase tracking-[0.12em] text-slate-500">
                <tr>
                  <th className="w-[5%] px-2 py-3 text-center">No</th>
                  <th className="w-[24%] px-3 py-3 font-bold">Nama Siswa</th>
                  <th className="hidden w-[14%] px-3 py-3 font-bold md:table-cell">Jenis Mutasi</th>
                  <th className="hidden w-[20%] px-3 py-3 font-bold lg:table-cell">Unit Sekolah</th>
                  <th className="hidden w-[13%] px-3 py-3 font-bold xl:table-cell">Tanggal Pengajuan</th>
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
                ) : paginatedMutations.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-5"><MasterEmptyState title="Belum ada data mutasi" description="Ubah filter pencarian untuk menampilkan data mutasi lain." /></td>
                  </tr>
                ) : (
                  paginatedMutations.map((m, idx) => {
                    const type = mutationInfo(m)
                    return (
                      <tr key={m.id || idx} className="transition-colors hover:bg-emerald-50/40">
                        <td className="px-2 py-3 text-center text-xs font-bold text-slate-400">{(page - 1) * perPage + idx + 1}</td>
                        <td className="px-3 py-3">
                          <PersonIdentityCell
                            src={m.photo}
                            name={m.full_name || m.nama}
                            subtitle={`${m.nis || m.nisn || '-'}`}
                          />
                        </td>
                        <td className="hidden px-3 py-3 md:table-cell">
                          <MasterBadge variant={type.variant}>{type.label}</MasterBadge>
                        </td>
                        <td className="hidden px-3 py-3 lg:table-cell">
                          <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">{m.education_unit?.name || m.unit?.name || '-'}</span>
                        </td>
                        <td className="hidden px-3 py-3 xl:table-cell">
                          <span className="text-xs text-slate-600 dark:text-slate-300">{m.updated_at ? new Date(m.updated_at).toLocaleDateString('id-ID') : '-'}</span>
                        </td>
                        <td className="hidden px-2 py-3 text-center sm:table-cell">
                          <MasterBadge variant="success">Selesai</MasterBadge>
                        </td>
                        <td className="px-2 py-3 text-center">
                          <div className="flex justify-center">
                            <ActionDropdown onView={() => setSelectedStudentId(m.id)} />
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
          label="data mutasi"
        />
      )}

      <KpiDetailDrawer
        type="siswa"
        id={selectedStudentId}
        isOpen={Boolean(selectedStudentId)}
        onClose={() => setSelectedStudentId(null)}
      />

      <FoundationExportModal
        isOpen={showExport}
        onClose={() => setShowExport(false)}
        title="Mutasi Siswa Seluruh Yayasan"
        rows={exportRows}
        filename="Mutasi_Siswa_Yayasan"
      />
    </MasterDataPage>
  )
}
