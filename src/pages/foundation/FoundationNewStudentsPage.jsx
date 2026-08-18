import { useCallback, useEffect, useMemo, useState } from 'react'
import { CalendarPlus, FileSpreadsheet, GraduationCap, RefreshCcw, ShieldAlert, UserCheck, UserRound } from 'lucide-react'
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
} from '../../components/master-data'
import { PersonIdentityCell } from '../../components/ui/PersonIdentityCell'
import KpiDetailDrawer from '../../components/KpiDetailDrawer'
import { FoundationExportModal } from '../../components/foundation/FoundationExportModal'

function formatDate(value) {
  if (!value) return '-'
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? '-' : date.toLocaleDateString('id-ID')
}

export function FoundationNewStudentsPage() {
  const [students, setStudents] = useState([])
  const [units, setUnits] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [isFetching, setIsFetching] = useState(false)

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

  const fetchNewStudents = useCallback(async (silent = false) => {
    if (!silent) setLoading(true)
    else setIsFetching(true)
    setError(false)
    try {
      const params = {
        search: search || undefined,
        unit_id: selectedUnit !== 'all' ? selectedUnit : undefined,
        per_page: 100,
      }
      const res = await api.get('/foundation/new-students', { params })
      const resData = res.data
      let list = []
      if (Array.isArray(resData)) {
        list = resData
      } else if (resData?.data) {
        list = Array.isArray(resData.data) ? resData.data : resData.data.data || []
      }
      setStudents(list)
    } catch (err) {
      console.error('Failed to fetch foundation new students:', err)
      setError(true)
    } finally {
      setLoading(false)
      setIsFetching(false)
    }
  }, [search, selectedUnit])

  useEffect(() => {
    fetchNewStudents()
  }, [fetchNewStudents])

  const filteredStudents = useMemo(() => students.filter((st) => {
    const name = (st.full_name || st.nama || '').toString().toLowerCase()
    const nis = (st.nis || st.nisn || '').toString().toLowerCase()
    const unitName = (st.education_unit?.name || st.unit?.name || '').toString().toLowerCase()

    const matchesSearch = name.includes(search.toLowerCase()) || nis.includes(search.toLowerCase())
    const matchesUnit = selectedUnit === 'all' || st.unit_id === selectedUnit || unitName.includes(selectedUnit.toLowerCase())

    return matchesSearch && matchesUnit
  }), [students, search, selectedUnit])

  const totalItems = filteredStudents.length
  const lastPage = Math.max(1, Math.ceil(totalItems / perPage))
  const paginatedStudents = filteredStudents.slice((page - 1) * perPage, page * perPage)

  const totalNew = students.length
  const maleCount = students.filter((s) => s.gender === 'male' || s.gender === 'L').length
  const femaleCount = students.filter((s) => s.gender === 'female' || s.gender === 'P').length
  const inRombelCount = students.filter((s) => s.kelas_id || s.school_class_id).length

  const handleRefresh = () => {
    setPage(1)
    fetchNewStudents(Boolean(students.length))
  }

  const exportRows = paginatedStudents.map((st, idx) => ({
    No: (page - 1) * perPage + idx + 1,
    'NIS / NISN': st.nis || st.nisn || '-',
    Nama: st.full_name || st.nama || '-',
    'Unit Pendidikan': st.education_unit?.name || st.unit?.name || '-',
    'Tahun Masuk': st.tahun_masuk || '-',
    'Tanggal Masuk': formatDate(st.created_at),
    'Kelas / Rombel': st.kelas?.nama_kelas || st.school_class?.name || 'Belum Ada',
  }))

  return (
    <MasterDataPage hideBreadcrumb className="foundation-new-students-page">
      <MasterPageHeader
        title="Penerimaan Siswa Baru"
        description="Pantau penerimaan dan jumlah siswa baru pada seluruh Unit Pendidikan Tahun Ajaran Aktif."
        tone="brand"
        icon={CalendarPlus}
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
        <MasterStatCard icon={GraduationCap} label="Total Siswa Baru" value={totalNew} description="Tahun ajaran aktif" variant="success" delay={40} />
        <MasterStatCard icon={UserRound} label="Laki-Laki" value={maleCount} description="Siswa baru laki-laki" variant="info" delay={80} />
        <MasterStatCard icon={UserCheck} label="Perempuan" value={femaleCount} description="Siswi baru perempuan" variant="warning" delay={120} />
        <MasterStatCard icon={GraduationCap} label="Masuk Rombel" value={inRombelCount} description={`${totalNew - inRombelCount} belum masuk rombel`} variant="neutral" delay={160} />
      </MasterStatsGrid>

      <MasterFilterBar
        search={<MasterSearchInput placeholder="Cari NIS, NISN, atau nama siswa baru..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1) }} />}
        filters={
          <>
            <MasterFilterSelect value={selectedUnit} onChange={(e) => { setSelectedUnit(e.target.value); setPage(1) }} aria-label="Filter unit pendidikan">
              <option value="all">Semua Unit Pendidikan</option>
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
            <h2 className="text-base font-bold text-slate-900 dark:text-white">Daftar Siswa Baru</h2>
            <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">Penerimaan siswa baru sesuai filter dan kewenangan pengguna.</p>
          </div>
          <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300">{totalItems} siswa baru</span>
        </div>
        <div className="overflow-x-auto">
          {error ? (
            <div className="p-5"><MasterErrorState title="Data siswa baru gagal dimuat" description="Periksa koneksi kemudian coba muat ulang." onRetry={handleRefresh} /></div>
          ) : (
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="border-b border-slate-200/80 bg-slate-50/80 text-[10px] font-black uppercase tracking-[0.12em] text-slate-500">
                <tr>
                  <th className="w-[5%] px-2 py-3 text-center">No</th>
                  <th className="w-[24%] px-3 py-3 font-bold">Nama Siswa</th>
                  <th className="hidden w-[16%] px-3 py-3 font-bold md:table-cell">Unit Pendidikan</th>
                  <th className="hidden w-[11%] px-3 py-3 font-bold lg:table-cell">Tahun Ajaran</th>
                  <th className="hidden w-[12%] px-3 py-3 font-bold xl:table-cell">Tanggal Masuk</th>
                  <th className="hidden w-[13%] px-3 py-3 font-bold xl:table-cell">Kelas / Rombel</th>
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
                ) : paginatedStudents.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="p-5"><MasterEmptyState title="Belum ada data siswa baru" description="Ubah filter pencarian untuk menampilkan penerimaan siswa baru lain." /></td>
                  </tr>
                ) : (
                  paginatedStudents.map((st, idx) => (
                    <tr key={st.id || idx} className="transition-colors hover:bg-emerald-50/40">
                      <td className="px-2 py-3 text-center text-xs font-bold text-slate-400">{(page - 1) * perPage + idx + 1}</td>
                      <td className="px-3 py-3">
                        <PersonIdentityCell
                          src={st.photo}
                          name={st.full_name || st.nama}
                          subtitle={`${st.nis || st.nisn || '-'}`}
                        />
                      </td>
                      <td className="hidden px-3 py-3 md:table-cell">
                        <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">{st.education_unit?.name || st.unit?.name || '-'}</span>
                      </td>
                      <td className="hidden px-3 py-3 lg:table-cell">
                        <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">{st.tahun_masuk ? `${st.tahun_masuk}/${Number(st.tahun_masuk) + 1}` : '-'}</span>
                      </td>
                      <td className="hidden px-3 py-3 xl:table-cell">
                        <span className="text-xs text-slate-600 dark:text-slate-300">{formatDate(st.created_at)}</span>
                      </td>
                      <td className="hidden px-3 py-3 xl:table-cell">
                        <span className="text-xs text-slate-600 dark:text-slate-300">{st.kelas?.nama_kelas || st.school_class?.name || 'Belum Ada'}</span>
                      </td>
                      <td className="hidden px-2 py-3 text-center sm:table-cell">
                        <MasterBadge variant="success">Siswa Baru</MasterBadge>
                      </td>
                      <td className="px-2 py-3 text-center">
                        <div className="flex justify-center">
                          <ActionDropdown onView={() => setSelectedStudentId(st.id)} />
                        </div>
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
          label="siswa baru"
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
        title="Penerimaan Siswa Baru Yayasan"
        rows={exportRows}
        filename="Siswa_Baru_Yayasan"
      />
    </MasterDataPage>
  )
}
