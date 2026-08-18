import React, { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  Users,
  UserCheck,
  Phone,
  GraduationCap,
  Briefcase,
  HeartHandshake,
  FileSpreadsheet,
} from 'lucide-react'
import { studentService } from '../services/studentService'
import PersonAvatar from '../components/ui/PersonAvatar'
import PersonIdentityCell from '../components/ui/PersonIdentityCell'
import ActionDropdown from '../components/app/ActionDropdown'
import PageContainer from '../components/app/PageContainer'
import AppBreadcrumb from '../components/app/AppBreadcrumb'
import {
  MasterActionButton,
  MasterDataPage,
  MasterPageHeader,
  MasterStatsGrid,
  MasterStatCard,
  MasterDataSection,
  MasterFilterSelect,
  MasterBadge,
  MasterDetailModal,
} from '../components/master-data'

export default function ParentsPage() {
  // State Filters & Pagination
  const [search, setSearch] = useState('')
  const [hubunganFilter, setHubunganFilter] = useState('Semua')
  const [page, setPage] = useState(1)

  // Modals state
  const [selectedParent, setSelectedParent] = useState(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)

  // Query Real Data from Student API (containing parent details)
  const { data: studentResponse, isLoading, isError, refetch } = useQuery({
    queryKey: ['parents-list', page, search],
    queryFn: () => studentService.getDaftar({ page, per_page: 20, search: search || undefined }),
  })

  const rawStudents = studentResponse?.data || []
  const meta = studentResponse?.meta || {}

  // Transform student records into parent items
  const parentList = useMemo(() => {
    const items = []
    rawStudents.forEach((st) => {
      const meta = st.metadata || {}
      const father = st.father_name || meta.nama_ayah
      const mother = st.mother_name || meta.nama_ibu
      const guardian = st.guardian_name || meta.nama_wali

      if (father) {
        items.push({
          id: `${st.id}-father`,
          student_id: st.id,
          nama: father,
          hubungan: 'Ayah',
          namaSiswa: st.name || st.nama,
          kelasSiswa: st.kelas?.nama_kelas || st.kelas_nama || '—',
          unitPendidikan: st.unit_pendidikan?.name || st.unit_nama || '—',
          pekerjaan: st.father_job || meta.pekerjaan_ayah || '—',
          noHp: st.father_phone || meta.no_hp_ayah || '—',
          email: meta.email_ayah || '—',
          alamat: meta.alamat_ayah || st.address || meta.alamat || '—',
        })
      }

      if (mother) {
        items.push({
          id: `${st.id}-mother`,
          student_id: st.id,
          nama: mother,
          hubungan: 'Ibu',
          namaSiswa: st.name || st.nama,
          kelasSiswa: st.kelas?.nama_kelas || st.kelas_nama || '—',
          unitPendidikan: st.unit_pendidikan?.name || st.unit_nama || '—',
          pekerjaan: st.mother_job || meta.pekerjaan_ibu || '—',
          noHp: st.mother_phone || meta.no_hp_ibu || '—',
          email: meta.email_ibu || '—',
          alamat: meta.alamat_ibu || st.address || meta.alamat || '—',
        })
      }

      if (guardian) {
        items.push({
          id: `${st.id}-guardian`,
          student_id: st.id,
          nama: guardian,
          hubungan: 'Wali',
          namaSiswa: st.name || st.nama,
          kelasSiswa: st.kelas?.nama_kelas || st.kelas_nama || '—',
          unitPendidikan: st.unit_pendidikan?.name || st.unit_nama || '—',
          pekerjaan: st.guardian_job || meta.pekerjaan_wali || '—',
          noHp: st.guardian_phone || meta.no_hp_wali || '—',
          email: meta.email_wali || '—',
          alamat: meta.alamat_wali || st.address || meta.alamat || '—',
        })
      }
    })
    return items
  }, [rawStudents])

  // Filtered by Hubungan
  const filteredParents = useMemo(() => {
    if (hubunganFilter === 'Semua') return parentList
    return parentList.filter((p) => p.hubungan === hubunganFilter)
  }, [parentList, hubunganFilter])

  // Statistics
  const stats = useMemo(() => {
    const total = parentList.length
    const ayah = parentList.filter((p) => p.hubungan === 'Ayah').length
    const ibu = parentList.filter((p) => p.hubungan === 'Ibu').length
    const wali = parentList.filter((p) => p.hubungan === 'Wali').length
    return { total, ayah, ibu, wali }
  }, [parentList])

  const handleExport = () => {
    const rows = [
      ['Nama', 'Hubungan', 'Siswa', 'Kelas', 'Unit Pendidikan', 'Pekerjaan', 'No. Handphone', 'Email', 'Alamat'],
      ...filteredParents.map((parent) => [parent.nama, parent.hubungan, parent.namaSiswa, parent.kelasSiswa, parent.unitPendidikan, parent.pekerjaan, parent.noHp, parent.email, parent.alamat]),
    ]
    const csv = rows.map((row) => row.map((value) => `"${String(value ?? '').replaceAll('"', '""')}"`).join(',')).join('\n')
    const url = URL.createObjectURL(new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8' }))
    const link = document.createElement('a')
    link.href = url
    link.download = `orang-tua-wali-${new Date().toISOString().slice(0, 10)}.csv`
    link.click()
    URL.revokeObjectURL(url)
  }

  return (
    <PageContainer maxW="7xl">
      <AppBreadcrumb items={[{ label: 'Master Data', href: '/dashboard' }, { label: 'Orang Tua / Wali' }]} />
      <MasterDataPage className="education-unit-page parent-master-page">
      {/* Header Banner */}
      <MasterPageHeader
        tone="brand"
        icon={Users}
        title="Data Orang Tua / Wali Siswa"
        description="Kelola direktori kontak, data pekerjaan, dan relasi orang tua/wali siswa terintegrasi secara komprehensif."
        actions={
          <MasterActionButton variant="export" icon={FileSpreadsheet} onClick={handleExport}>
            Export Data
          </MasterActionButton>
        }
      />

      {/* Ringkasan Statistik */}
      <MasterStatsGrid className="education-unit-kpis">
        <MasterStatCard
          icon={Users}
          label="TOTAL ORANG TUA / WALI"
          value={stats.total}
          description="Pada halaman data saat ini"
          variant="success"
        />
        <MasterStatCard
          icon={UserCheck}
          label="RELASI AYAH KANDUNG"
          value={stats.ayah}
          description="Pada halaman data saat ini"
          variant="info"
        />
        <MasterStatCard
          icon={HeartHandshake}
          label="RELASI IBU KANDUNG"
          value={stats.ibu}
          description="Pada halaman data saat ini"
          variant="warning"
        />
        <MasterStatCard
          icon={GraduationCap}
          label="RELASI WALI SISWA"
          value={stats.wali}
          description="Pada halaman data saat ini"
          variant="neutral"
        />
      </MasterStatsGrid>

      {/* Unified Master Data Section */}
      <MasterDataSection
        title="Daftar Orang Tua / Wali Siswa"
        description="Direktori data orang tua/wali siswa terdaftar."
        countLabel={`${Number(meta.total || filteredParents.length).toLocaleString('id-ID')} orang`}
        search={{
          value: search,
          onValueChange: (value) => {
            setSearch(value)
            setPage(1)
          },
          placeholder: 'Cari nama orang tua, nama siswa, atau nomor HP...',
          'aria-label': 'Cari orang tua atau wali',
        }}
        filters={
          <MasterFilterSelect
            aria-label="Filter hubungan keluarga"
            value={hubunganFilter}
            onChange={(e) => setHubunganFilter(e.target.value)}
          >
            <option value="Semua">Semua Hubungan</option>
            <option value="Ayah">Ayah</option>
            <option value="Ibu">Ibu</option>
            <option value="Wali">Wali</option>
          </MasterFilterSelect>
        }
        onReset={() => {
          setSearch('')
          setHubunganFilter('Semua')
          setPage(1)
        }}
        resetDisabled={!search && hubunganFilter === 'Semua'}
        isLoading={isLoading}
        isError={isError}
        onRetry={refetch}
        isEmpty={!isLoading && !isError && filteredParents.length === 0}
        emptyTitle="Data Orang Tua Tidak Ditemukan"
        emptyDescription="Belum ada data orang tua/wali yang sesuai dengan kriteria pencarian Anda."
        pagination={{
          meta: {
            total: meta.total || filteredParents.length,
            from: meta.from || 1,
            to: meta.to || filteredParents.length,
            last_page: meta.last_page || 1,
            current_page: meta.current_page || page,
          },
          page,
          onPageChange: setPage,
        }}
      >
        <table className="w-full text-left text-sm">
          <thead className="border-b border-slate-100 bg-slate-50/50 text-xs font-bold uppercase tracking-wider text-slate-500 dark:border-slate-700 dark:bg-slate-800/70 dark:text-slate-300">
            <tr>
              <th className="p-4">NAMA ORANG TUA / WALI</th>
              <th className="p-4">HUBUNGAN</th>
              <th className="p-4">NAMA SISWA & KELAS</th>
              <th className="p-4">PEKERJAAN</th>
              <th className="p-4">NO. HANDPHONE</th>
              <th className="p-4 text-center">AKSI</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-medium text-slate-700 dark:divide-slate-700 dark:text-slate-200">
            {filteredParents.map((parent) => (
              <tr key={parent.id} className="transition hover:bg-slate-50/80 dark:hover:bg-slate-800/50">
                <td className="p-4 font-bold text-slate-900 dark:text-white">
                  <PersonIdentityCell
                    src={parent.photo_url || parent.avatar_url || parent.foto}
                    name={parent.nama}
                    subtitle={parent.email}
                  />
                </td>
                <td className="p-4">
                  <MasterBadge
                    variant={
                      parent.hubungan === 'Ayah'
                        ? 'info'
                        : parent.hubungan === 'Ibu'
                        ? 'warning'
                        : 'neutral'
                    }
                  >
                    {parent.hubungan}
                  </MasterBadge>
                </td>
                <td className="p-4">
                  <div className="font-semibold text-slate-800 dark:text-slate-100">{parent.namaSiswa}</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">
                    {parent.kelasSiswa} • {parent.unitPendidikan}
                  </div>
                </td>
                <td className="p-4">
                  <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                    <Briefcase className="h-3.5 w-3.5 text-slate-400" />
                    <span>{parent.pekerjaan}</span>
                  </div>
                </td>
                <td className="p-4 font-mono text-xs">
                  <div className="flex items-center gap-1.5 text-emerald-800 dark:text-emerald-300 font-semibold">
                    <Phone className="h-3.5 w-3.5" />
                    <span>{parent.noHp}</span>
                  </div>
                </td>
                <td className="p-4 text-center">
                  <span className="inline-flex justify-center">
                    <ActionDropdown onView={() => { setSelectedParent(parent); setIsDetailOpen(true) }} />
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </MasterDataSection>

      {/* Detail Modal */}
      <MasterDetailModal
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        icon={Users}
        title="Detail Orang Tua / Wali"
        description="Informasi lengkap mengenai kontak dan data relasi orang tua siswa"
      >
        {selectedParent && (
          <div className="space-y-4 p-6 text-sm">
            <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-4 space-y-3">
              <div className="flex items-center gap-3">
                <PersonAvatar
                  src={selectedParent.photo_url || selectedParent.avatar_url || selectedParent.foto}
                  name={selectedParent.nama}
                  size="card"
                />
                <div>
                  <h3 className="text-base font-bold text-slate-900">{selectedParent.nama}</h3>
                  <div className="flex items-center gap-2 mt-0.5">
                    <MasterBadge variant="info">{selectedParent.hubungan}</MasterBadge>
                    <span className="text-xs text-slate-500">{selectedParent.email}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="rounded-xl border border-slate-200 p-4">
                <p className="text-xs font-bold text-slate-400 uppercase">Siswa Terkait</p>
                <p className="mt-1 font-bold text-slate-800">{selectedParent.namaSiswa}</p>
                <p className="text-xs text-slate-500">{selectedParent.kelasSiswa} • {selectedParent.unitPendidikan}</p>
              </div>
              <div className="rounded-xl border border-slate-200 p-4">
                <p className="text-xs font-bold text-slate-400 uppercase">No. Handphone / WA</p>
                <p className="mt-1 font-bold text-emerald-800 font-mono">{selectedParent.noHp}</p>
              </div>
              <div className="rounded-xl border border-slate-200 p-4 sm:col-span-2">
                <p className="text-xs font-bold text-slate-400 uppercase">Pekerjaan</p>
                <p className="mt-1 font-semibold text-slate-800">{selectedParent.pekerjaan}</p>
              </div>
              <div className="rounded-xl border border-slate-200 p-4 sm:col-span-2">
                <p className="text-xs font-bold text-slate-400 uppercase">Alamat Tempat Tinggal</p>
                <p className="mt-1 font-medium text-slate-700">{selectedParent.alamat}</p>
              </div>
            </div>
          </div>
        )}
      </MasterDetailModal>
    </MasterDataPage>
    </PageContainer>
  )
}
