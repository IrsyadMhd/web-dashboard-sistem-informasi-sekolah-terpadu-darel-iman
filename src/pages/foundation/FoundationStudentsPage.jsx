import { useCallback, useEffect, useMemo, useState } from 'react'
import ActionDropdown from '../../components/app/ActionDropdown'
import { FileSpreadsheet, GraduationCap, RefreshCcw, ShieldAlert, UserCheck, UserRound, UsersRound } from 'lucide-react'
import api from '../../services/api'
import {
  MasterActionButton,
  MasterActionIconButton,
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
} from '../../components/master-data'
import { PersonIdentityCell } from '../../components/ui/PersonIdentityCell'
import KpiDetailDrawer from '../../components/KpiDetailDrawer'
import { FoundationExportModal } from '../../components/foundation/FoundationExportModal'

const GENDER_LABEL = {
  male: 'Laki-Laki',
  L: 'Laki-Laki',
  female: 'Perempuan',
  P: 'Perempuan',
}

export function FoundationStudentsPage() {
  const [students, setStudents] = useState([])
  const [units, setUnits] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [isFetching, setIsFetching] = useState(false)

  const [search, setSearch] = useState('')
  const [selectedUnit, setSelectedUnit] = useState('all')
  const [selectedGender, setSelectedGender] = useState('all')
  const [page, setPage] = useState(1)
  const perPage = 15

  const [selectedStudentId, setSelectedStudentId] = useState(null)
  const [showExport, setShowExport] = useState(false)

  const [academicYears, setAcademicYears] = useState([])
  const [selectedYear, setSelectedYear] = useState('all')

  useEffect(() => {
    api.get('/foundation/units')
      .then((res) => {
        const raw = res.data?.data || res.data || []
        setUnits(Array.isArray(raw) ? raw : [])
      })
      .catch(() => {})

    api.get('/master/tahun-ajaran')
      .then((res) => {
        const raw = res.data?.data || res.data || []
        setAcademicYears(Array.isArray(raw) ? raw : [])
      })
      .catch(() => {})
  }, [])

  const fetchStudents = useCallback(async (silent = false) => {
    if (!silent) setLoading(true)
    else setIsFetching(true)
    setError(false)
    try {
      const params = {
        search: search || undefined,
        unit_id: selectedUnit !== 'all' ? selectedUnit : undefined,
        academic_year_id: selectedYear !== 'all' ? selectedYear : undefined,
        gender: selectedGender !== 'all' ? selectedGender : undefined,
        per_page: 100,
      }
      const res = await api.get('/foundation/students', { params })
      const resData = res.data
      let list = []
      if (Array.isArray(resData)) {
        list = resData
      } else if (resData?.data) {
        list = Array.isArray(resData.data) ? resData.data : resData.data.data || []
      }
      setStudents(list)
    } catch (err) {
      console.error('Failed to fetch foundation students:', err)
      setError(true)
    } finally {
      setLoading(false)
      setIsFetching(false)
    }
  }, [search, selectedUnit, selectedYear, selectedGender])

  useEffect(() => {
    fetchStudents()
  }, [fetchStudents])

  const filteredStudents = useMemo(() => students.filter((st) => {
    const name = (st.full_name || st.nama || '').toString().toLowerCase()
    const nis = (st.nis || st.nisn || '').toString().toLowerCase()
    const unitName = (st.education_unit?.name || st.unit?.name || '').toString().toLowerCase()
    const gender = (st.gender || '').toString()

    const matchesSearch = name.includes(search.toLowerCase()) || nis.includes(search.toLowerCase())
    const matchesUnit = selectedUnit === 'all' || st.unit_id === selectedUnit || unitName.includes(selectedUnit.toLowerCase())
    const matchesGender =
      selectedGender === 'all' ||
      (selectedGender === 'L' && (gender === 'male' || gender === 'L')) ||
      (selectedGender === 'P' && (gender === 'female' || gender === 'P'))

    return matchesSearch && matchesUnit && matchesGender
  }), [students, search, selectedUnit, selectedGender])

  const totalItems = filteredStudents.length
  const lastPage = Math.max(1, Math.ceil(totalItems / perPage))
  const paginatedStudents = filteredStudents.slice((page - 1) * perPage, page * perPage)

  const totalStudents = students.length
  const maleCount = students.filter((s) => s.gender === 'male' || s.gender === 'L').length
  const femaleCount = students.filter((s) => s.gender === 'female' || s.gender === 'P').length
  const activeCount = students.filter((s) => s.is_active || s.status === 'aktif').length

  const handleRefresh = () => {
    setPage(1)
    fetchStudents(Boolean(students.length))
  }

  const exportRows = paginatedStudents.map((st, idx) => ({
    No: (page - 1) * perPage + idx + 1,
    'NIS / NISN': st.nis || st.nisn || '-',
    Nama: st.full_name || st.nama || '-',
    Gender: GENDER_LABEL[st.gender] || st.gender || '-',
    'Unit Pendidikan': st.education_unit?.name || st.unit?.name || '-',
    'Kelas / Rombel': st.kelas?.nama_kelas || st.school_class?.name || 'Belum Ada',
    Status: st.is_active || st.status === 'aktif' ? 'Aktif' : 'Nonaktif',
  }))

  return (
    <MasterDataPage hideBreadcrumb className="foundation-students-page">
      <MasterPageHeader
        title="Data Siswa Seluruh Unit"
        description="Pantau seluruh siswa aktif dari semua Unit Pendidikan dan Tahun Ajaran secara terintegrasi."
        tone="brand"
        icon={GraduationCap}
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
        <MasterStatCard icon={GraduationCap} label="Total Siswa" value={totalStudents} description="Terdata di sistem" variant="success" delay={40} />
        <MasterStatCard icon={UserRound} label="Laki-Laki" value={maleCount} description="Siswa laki-laki" variant="info" delay={80} />
        <MasterStatCard icon={UserCheck} label="Perempuan" value={femaleCount} description="Siswi perempuan" variant="warning" delay={120} />
        <MasterStatCard icon={UsersRound} label="Siswa Aktif" value={activeCount} description="Status aktif" variant="neutral" delay={160} />
      </MasterStatsGrid>

      <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-slate-200/80 bg-slate-50/70 p-1.5 dark:border-slate-800 dark:bg-slate-900/50">
        <a
          href="/dashboard/yayasan/siswa"
          className="flex items-center gap-2 rounded-xl bg-white px-3.5 py-2 text-xs font-bold text-emerald-800 shadow-sm dark:bg-slate-800 dark:text-emerald-300"
        >
          <GraduationCap className="h-4 w-4" />
          Siswa Aktif (Tahun Ajaran)
        </a>
        <a
          href="/dashboard/yayasan/siswa-baru"
          className="flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-600 transition hover:bg-white/80 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
        >
          <UserCheck className="h-4 w-4 text-emerald-600" />
          Siswa Masuk (Baru)
        </a>
        <a
          href="/dashboard/yayasan/mutasi-siswa"
          className="flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-600 transition hover:bg-white/80 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
        >
          <UserRound className="h-4 w-4 text-amber-600" />
          Siswa Keluar (Mutasi)
        </a>
        <a
          href="/dashboard/yayasan/kelulusan-alumni"
          className="flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-600 transition hover:bg-white/80 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
        >
          <UsersRound className="h-4 w-4 text-sky-600" />
          Kelulusan & Alumni
        </a>
      </div>

      <MasterFilterBar
        search={<MasterSearchInput placeholder="Cari NIS, NISN, atau nama siswa..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1) }} />}
        filters={
          <>
            <MasterFilterSelect value={selectedUnit} onChange={(e) => { setSelectedUnit(e.target.value); setPage(1) }} aria-label="Filter unit pendidikan">
              <option value="all">Semua Unit Pendidikan</option>
              {units.map((u) => <option key={u.id} value={u.id}>{u.name || u.code}</option>)}
            </MasterFilterSelect>
            <MasterFilterSelect value={selectedYear} onChange={(e) => { setSelectedYear(e.target.value); setPage(1) }} aria-label="Filter tahun ajaran">
              <option value="all">Semua Tahun Ajaran</option>
              {academicYears.map((ay) => <option key={ay.id} value={ay.id}>{ay.nama || ay.name}</option>)}
            </MasterFilterSelect>
            <MasterFilterSelect value={selectedGender} onChange={(e) => { setSelectedGender(e.target.value); setPage(1) }} aria-label="Filter gender">
              <option value="all">Semua Gender</option>
              <option value="L">Laki-Laki</option>
              <option value="P">Perempuan</option>
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
            <h2 className="text-base font-bold text-slate-900 dark:text-white">Daftar Siswa Aktif</h2>
            <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">Data siswa sesuai filter dan kewenangan pengguna.</p>
          </div>
          <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300">{totalItems} siswa</span>
        </div>
        <div className="overflow-x-auto">
          {error ? (
            <div className="p-5"><MasterErrorState title="Data siswa gagal dimuat" description="Periksa koneksi kemudian coba muat ulang." onRetry={handleRefresh} /></div>
          ) : (
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="border-b border-slate-200/80 bg-slate-50/80 text-[10px] font-black uppercase tracking-[0.12em] text-slate-500">
                <tr>
                  <th className="w-[5%] px-2 py-3 text-center">No</th>
                  <th className="w-[24%] px-3 py-3 font-bold">Nama Siswa</th>
                  <th className="hidden w-[10%] px-3 py-3 font-bold md:table-cell">NIS / NISN</th>
                  <th className="hidden w-[10%] px-3 py-3 font-bold md:table-cell">Gender</th>
                  <th className="hidden w-[20%] px-3 py-3 font-bold lg:table-cell">Unit Pendidikan</th>
                  <th className="hidden w-[14%] px-3 py-3 font-bold xl:table-cell">Kelas / Rombel</th>
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
                    <td colSpan={8} className="p-5"><MasterEmptyState title="Belum ada data siswa" description="Ubah filter pencarian untuk menampilkan peserta didik lain." /></td>
                  </tr>
                ) : (
                  paginatedStudents.map((st, idx) => {
                    const gender = GENDER_LABEL[st.gender] || st.gender || '-'
                    return (
                      <tr key={st.id || idx} className="transition-colors hover:bg-emerald-50/40">
                        <td className="px-2 py-3 text-center text-xs font-bold text-slate-400">{(page - 1) * perPage + idx + 1}</td>
                        <td className="px-3 py-3">
                          <PersonIdentityCell
                            src={st.photo}
                            name={st.full_name || st.nama}
                            subtitle={st.nis || st.nisn || '-'}
                          />
                        </td>
                        <td className="hidden px-3 py-3 md:table-cell">
                          <span className="font-mono text-xs font-bold text-slate-900 dark:text-white">{st.nis || st.nisn || '-'}</span>
                        </td>
                        <td className="hidden px-3 py-3 md:table-cell">
                          <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">{gender}</span>
                        </td>
                        <td className="hidden px-3 py-3 lg:table-cell">
                          <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">{st.education_unit?.name || st.unit?.name || '-'}</span>
                        </td>
                        <td className="hidden px-3 py-3 xl:table-cell">
                          <span className="text-xs text-slate-600 dark:text-slate-300">{st.kelas?.nama_kelas || st.school_class?.name || 'Belum Ada'}</span>
                        </td>
                        <td className="hidden px-2 py-3 text-center sm:table-cell">
                          <MasterStatusBadge active={st.is_active || st.status === 'aktif'} activeLabel="Aktif" inactiveLabel="Nonaktif" />
                        </td>
                        <td className="px-2 py-3 text-center">
                          <ActionDropdown onView={() => setSelectedStudentId(st.id)} />
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
          label="siswa"
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
        title="Data Siswa Seluruh Yayasan"
        rows={exportRows}
        filename="Data_Siswa_Yayasan"
      />
    </MasterDataPage>
  )
}
