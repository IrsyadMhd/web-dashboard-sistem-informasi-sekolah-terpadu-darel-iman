import React, { useMemo, useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Users,
  UserCheck,
  Phone,
  GraduationCap,
  Briefcase,
  HeartHandshake,
  FileSpreadsheet,
  Plus,
  Upload,
  UserPlus,
} from 'lucide-react'
import Swal from '@/components/tailgrids/compat/swal-tailgrids'
import { parentService } from '../services/parentService'
import { handleApiExport } from '../utils/exportUtils'
import PersonAvatar from '../components/ui/PersonAvatar'
import PersonIdentityCell from '../components/ui/PersonIdentityCell'
import ActionDropdown from '../components/app/ActionDropdown'
import PageContainer from '../components/app/PageContainer'
import AppBreadcrumb from '../components/app/AppBreadcrumb'
import CsvImportModal from '../components/master-data/CsvImportModal'
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
  MasterFormModal,
  MasterDeleteDialog,
} from '../components/master-data'

const initialParentForm = {
  id: null,
  nama: '',
  hubungan: 'Ayah',
  nik: '',
  phone: '',
  email: '',
  pekerjaan: '',
  alamat: '',
}

export default function ParentsPage() {
  const queryClient = useQueryClient()

  // State Filters & Pagination
  const [search, setSearch] = useState('')
  const [hubunganFilter, setHubunganFilter] = useState('Semua')
  const [page, setPage] = useState(1)

  // Modals state
  const [selectedParent, setSelectedParent] = useState(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [isImportOpen, setIsImportOpen] = useState(false)
  const [formData, setFormData] = useState(initialParentForm)

  // Query Real Data from Parent API
  const { data: parentResponse, isLoading, isError, refetch } = useQuery({
    queryKey: ['parents-list', page, search, hubunganFilter],
    queryFn: () =>
      parentService.getParents({
        page,
        per_page: 20,
        search: search || undefined,
        hubungan: hubunganFilter !== 'Semua' ? hubunganFilter : undefined,
      }),
  })

  const parentList = parentResponse?.data || []
  const meta = parentResponse?.meta || {}
  const summary = parentResponse?.summary || {}

  // Mutations
  const saveMutation = useMutation({
    mutationFn: (payload) => {
      if (payload.id) {
        return parentService.updateParent(payload.id, payload)
      }
      return parentService.createParent(payload)
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['parents-list'])
      setIsFormOpen(false)
      Swal.fire({
        icon: 'success',
        title: 'Berhasil',
        text: 'Data orang tua / wali berhasil disimpan.',
        timer: 1800,
        showConfirmButton: false,
      })
    },
    onError: (err) => {
      Swal.fire({
        icon: 'error',
        title: 'Gagal Menyimpan',
        text: err.response?.data?.message || 'Terjadi kesalahan saat menyimpan data.',
      })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id) => parentService.deleteParent(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['parents-list'])
      setIsDeleteOpen(false)
      setSelectedParent(null)
      Swal.fire({
        icon: 'success',
        title: 'Berhasil Dihapus',
        text: 'Data orang tua / wali berhasil dihapus.',
        timer: 1800,
        showConfirmButton: false,
      })
    },
    onError: (err) => {
      Swal.fire({
        icon: 'error',
        title: 'Gagal Menghapus',
        text: err.response?.data?.message || 'Terjadi kesalahan saat menghapus data.',
      })
    },
  })

  const handleOpenCreate = () => {
    setFormData(initialParentForm)
    setIsFormOpen(true)
  }

  const handleOpenEdit = (item) => {
    setFormData({
      id: item.id,
      nama: item.nama || '',
      hubungan: item.hubungan || 'Ayah',
      nik: item.nik && item.nik !== '-' ? item.nik : '',
      phone: item.noHp && item.noHp !== '-' ? item.noHp : '',
      email: item.email && item.email !== '-' ? item.email : '',
      pekerjaan: item.pekerjaan && item.pekerjaan !== '-' ? item.pekerjaan : '',
      alamat: item.alamat && item.alamat !== '-' ? item.alamat : '',
    })
    setIsFormOpen(true)
  }

  const handleOpenDelete = (item) => {
    setSelectedParent(item)
    setIsDeleteOpen(true)
  }

  const handleExport = async () => {
    const params = {}
    if (search) params.search = search
    if (hubunganFilter && hubunganFilter !== 'Semua') params.hubungan = hubunganFilter

    await handleApiExport({
      endpoint: '/parents/export',
      params,
      title: 'Ekspor Data Orang Tua / Wali',
      defaultFilename: `Data_Orang_Tua_Wali_${new Date().toISOString().slice(0, 10)}`,
    })
  }

  const handleImportRows = async (rows) => {
    try {
      const res = await parentService.importParents(rows)
      queryClient.invalidateQueries(['parents-list'])
      Swal.fire('Berhasil', res?.message || `${rows.length} data orang tua berhasil diimpor.`, 'success')
      setIsImportOpen(false)
    } catch (err) {
      Swal.fire('Gagal Import', err.response?.data?.message || 'Terjadi kesalahan saat mengimpor data.', 'error')
    }
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
            <div className="flex items-center gap-2 flex-wrap">
              <MasterActionButton variant="primary" icon={Plus} onClick={handleOpenCreate}>
                Tambah Data
              </MasterActionButton>
              <MasterActionButton variant="import" icon={Upload} onClick={() => setIsImportOpen(true)}>
                Import Data
              </MasterActionButton>
              <MasterActionButton variant="export" icon={FileSpreadsheet} onClick={handleExport}>
                Export Data
              </MasterActionButton>
            </div>
          }
        />

        {/* Ringkasan Statistik */}
        <MasterStatsGrid className="education-unit-kpis">
          <MasterStatCard
            icon={Users}
            label="TOTAL ORANG TUA / WALI"
            value={summary.total ?? parentList.length}
            description="Tercatat dalam pangkalan data"
            variant="success"
          />
          <MasterStatCard
            icon={UserCheck}
            label="RELASI AYAH KANDUNG"
            value={summary.ayah ?? 0}
            description="Tercatat dalam pangkalan data"
            variant="info"
          />
          <MasterStatCard
            icon={HeartHandshake}
            label="RELASI IBU KANDUNG"
            value={summary.ibu ?? 0}
            description="Tercatat dalam pangkalan data"
            variant="warning"
          />
          <MasterStatCard
            icon={GraduationCap}
            label="RELASI WALI SISWA"
            value={summary.wali ?? 0}
            description="Tercatat dalam pangkalan data"
            variant="neutral"
          />
        </MasterStatsGrid>

        {/* Unified Master Data Section */}
        <MasterDataSection
          title="Daftar Orang Tua / Wali Siswa"
          description="Direktori data orang tua/wali siswa terdaftar."
          countLabel={`${Number(meta.total || parentList.length).toLocaleString('id-ID')} orang`}
          search={{
            value: search,
            onValueChange: (value) => {
              setSearch(value)
              setPage(1)
            },
            placeholder: 'Cari nama orang tua, nama siswa, NIK, atau nomor HP...',
            'aria-label': 'Cari orang tua atau wali',
          }}
          filters={
            <MasterFilterSelect
              aria-label="Filter hubungan keluarga"
              value={hubunganFilter}
              onChange={(e) => {
                setHubunganFilter(e.target.value)
                setPage(1)
              }}
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
          isEmpty={!isLoading && !isError && parentList.length === 0}
          emptyTitle="Data Orang Tua Tidak Ditemukan"
          emptyDescription="Belum ada data orang tua/wali yang sesuai dengan kriteria pencarian Anda."
          pagination={{
            meta: {
              total: meta.total || parentList.length,
              from: meta.from || 1,
              to: meta.to || parentList.length,
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
              {parentList.map((parent) => (
                <tr key={parent.id} className="transition hover:bg-slate-50/80 dark:hover:bg-slate-800/50">
                  <td className="p-4 font-bold text-slate-900 dark:text-white">
                    <PersonIdentityCell
                      src={parent.photo_url || parent.avatar_url || parent.foto}
                      name={parent.nama}
                      subtitle={parent.email !== '-' ? parent.email : (parent.nik !== '-' ? `NIK: ${parent.nik}` : '')}
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
                      <ActionDropdown
                        onView={() => {
                          setSelectedParent(parent)
                          setIsDetailOpen(true)
                        }}
                        onEdit={() => handleOpenEdit(parent)}
                        onDelete={() => handleOpenDelete(parent)}
                      />
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
                      {selectedParent.email !== '-' && (
                        <span className="text-xs text-slate-500">{selectedParent.email}</span>
                      )}
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

        {/* Create / Edit Form Modal */}
        <MasterFormModal
          isOpen={isFormOpen}
          onClose={() => setIsFormOpen(false)}
          onSubmit={(e) => {
            e.preventDefault()
            saveMutation.mutate(formData)
          }}
          isSubmitting={saveMutation.isPending}
          icon={formData.id ? Users : UserPlus}
          title={formData.id ? 'Ubah Data Orang Tua / Wali' : 'Tambah Orang Tua / Wali'}
          description="Lengkapi formulir informasi orang tua atau wali murid di bawah ini."
        >
          <div className="space-y-4 p-6 text-sm">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-xs font-bold text-slate-700">Nama Lengkap *</label>
                <input
                  type="text"
                  required
                  value={formData.nama}
                  onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                  placeholder="Nama lengkap orang tua / wali"
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Hubungan Keluarga *</label>
                <select
                  value={formData.hubungan}
                  onChange={(e) => setFormData({ ...formData, hubungan: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm focus:border-emerald-500 focus:outline-none"
                >
                  <option value="Ayah">Ayah</option>
                  <option value="Ibu">Ibu</option>
                  <option value="Wali">Wali</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">NIK</label>
                <input
                  type="text"
                  value={formData.nik}
                  onChange={(e) => setFormData({ ...formData, nik: e.target.value })}
                  placeholder="Nomor Induk Kependudukan"
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm focus:border-emerald-500 focus:outline-none font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">No. Handphone / WhatsApp</label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="0812xxxxxxx"
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm focus:border-emerald-500 focus:outline-none font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="email@example.com"
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-xs font-bold text-slate-700">Pekerjaan</label>
                <input
                  type="text"
                  value={formData.pekerjaan}
                  onChange={(e) => setFormData({ ...formData, pekerjaan: e.target.value })}
                  placeholder="Profesi atau instansi bekerja"
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-xs font-bold text-slate-700">Alamat Tempat Tinggal</label>
                <textarea
                  rows={3}
                  value={formData.alamat}
                  onChange={(e) => setFormData({ ...formData, alamat: e.target.value })}
                  placeholder="Alamat lengkap domisili"
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm focus:border-emerald-500 focus:outline-none"
                />
              </div>
            </div>
          </div>
        </MasterFormModal>

        {/* Delete Confirmation Dialog */}
        <MasterDeleteDialog
          isOpen={isDeleteOpen}
          onClose={() => setIsDeleteOpen(false)}
          onConfirm={() => selectedParent && deleteMutation.mutate(selectedParent.id)}
          isDeleting={deleteMutation.isPending}
          title="Hapus Data Orang Tua / Wali"
          description={`Apakah Anda yakin ingin menghapus data "${selectedParent?.nama}"? Tindakan ini tidak dapat dibatalkan.`}
        />

        {/* Bulk Import Modal */}
        <CsvImportModal
          isOpen={isImportOpen}
          onClose={() => setIsImportOpen(false)}
          onImport={handleImportRows}
          title="Import Data Orang Tua / Wali"
          templateColumns={['nama', 'hubungan', 'nik', 'phone', 'email', 'pekerjaan', 'alamat']}
          sampleData={[
            {
              nama: 'Ahmad Dahlan',
              hubungan: 'Ayah',
              nik: '1371012345670001',
              phone: '081267891234',
              email: 'ahmad.dahlan@example.com',
              pekerjaan: 'Wiraswasta',
              alamat: 'Jl. Khatib Sulaiman No. 10, Padang',
            },
            {
              nama: 'Siti Aminah',
              hubungan: 'Ibu',
              nik: '1371012345670002',
              phone: '081267891235',
              email: 'siti.aminah@example.com',
              pekerjaan: 'Guru',
              alamat: 'Jl. Khatib Sulaiman No. 10, Padang',
            },
          ]}
        />
      </MasterDataPage>
    </PageContainer>
  )
}
