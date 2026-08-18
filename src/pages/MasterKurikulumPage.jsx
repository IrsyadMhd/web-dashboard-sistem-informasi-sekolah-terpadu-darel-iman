import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import Swal from 'sweetalert2'
import {
  BookOpen,
  Plus,
  FileSpreadsheet,
  Upload,
  CheckCircle,
  XCircle,
} from 'lucide-react'
import { masterKurikulumService } from '../services/masterKurikulumService'
import KurikulumTable from '../components/kurikulum/KurikulumTable'
import KurikulumFormModal from '../components/kurikulum/KurikulumFormModal'
import KurikulumDetailModal from '../components/kurikulum/KurikulumDetailModal'
import KurikulumImportModal from '../components/kurikulum/KurikulumImportModal'
import PageContainer from '../components/app/PageContainer'
import AppBreadcrumb from '../components/app/AppBreadcrumb'
import {
  MasterActionButton,
  MasterDataSection,
  MasterDataPage,
  MasterPageHeader,
  MasterStatsGrid,
  MasterStatCard,
  MasterFilterSelect,
} from '../components/master-data'

const JENIS_LIST = ['SIT', 'Merdeka', 'Nasional', 'Pesantren', 'Lokal', 'Lainnya']
const JENJANG_LIST = ['TK', 'PAUD', 'SD', 'MI', 'SMP', 'MTs', 'SMA', 'MA', 'Pesantren']

export default function MasterKurikulumPage({ embedded = false, hidePageHeader = false, hideBreadcrumb = false }) {
  const queryClient = useQueryClient()

  // Filter & Pagination States
  const [search, setSearch] = useState('')
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('')
  const [selectedJenisFilter, setSelectedJenisFilter] = useState('')
  const [selectedJenjangFilter, setSelectedJenjangFilter] = useState('')
  const [denganSampahFilter, setDenganSampahFilter] = useState('')
  const [page, setPage] = useState(1)
  const perPage = 15

  // Modal States
  const [isFormModalOpen, setIsFormModalOpen] = useState(false)
  const [selectedForEdit, setSelectedForEdit] = useState(null)

  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
  const [selectedForDetail, setSelectedForDetail] = useState(null)

  const [isImportModalOpen, setIsImportModalOpen] = useState(false)

  // Query Data List
  const {
    data: responseData = {},
    isLoading,
    isFetching,
    isError,
    refetch,
  } = useQuery({
    queryKey: [
      'master-kurikulum-list',
      page,
      perPage,
      search,
      selectedStatusFilter,
      selectedJenisFilter,
      selectedJenjangFilter,
      denganSampahFilter,
    ],
    queryFn: () =>
      masterKurikulumService.getDaftar({
        page,
        per_page: perPage,
        search,
        status: selectedStatusFilter,
        jenis_kurikulum: selectedJenisFilter,
        jenjang: selectedJenjangFilter,
        dengan_sampah: denganSampahFilter,
        order_by: 'created_at',
        order_dir: 'desc',
      }),
  })

  const listData = responseData?.data || []
  const meta = responseData?.meta || {}
  const stats = responseData?.statistik || {}
  const statsValue = (value) => (isError ? '—' : value)

  // Mutations
  const simpanMutation = useMutation({
    mutationFn: (payload) => masterKurikulumService.tambah(payload),
    onSuccess: (res) => {
      queryClient.invalidateQueries(['master-kurikulum-list'])
      setIsFormModalOpen(false)
      Swal.fire({
        icon: 'success',
        title: 'Berhasil!',
        text: res?.message || 'Data master kurikulum baru berhasil ditambahkan.',
        timer: 2000,
        showConfirmButton: false,
      })
    },
    onError: (err) => {
      const msg = err.response?.data?.message || 'Gagal menyimpan data master kurikulum.'
      Swal.fire('Error', msg, 'error')
    },
  })

  const ubahMutation = useMutation({
    mutationFn: ({ id, payload }) => masterKurikulumService.ubah({ id, payload }),
    onSuccess: (res) => {
      queryClient.invalidateQueries(['master-kurikulum-list'])
      setIsFormModalOpen(false)
      setSelectedForEdit(null)
      Swal.fire({
        icon: 'success',
        title: 'Berhasil!',
        text: res?.message || 'Perubahan data master kurikulum berhasil disimpan.',
        timer: 2000,
        showConfirmButton: false,
      })
    },
    onError: (err) => {
      const msg = err.response?.data?.message || 'Gagal memperbarui data master kurikulum.'
      Swal.fire('Error', msg, 'error')
    },
  })

  const hapusMutation = useMutation({
    mutationFn: (id) => masterKurikulumService.hapus(id),
    onSuccess: (res) => {
      queryClient.invalidateQueries(['master-kurikulum-list'])
      Swal.fire({
        icon: 'success',
        title: 'Berhasil!',
        text: res?.message || 'Data kurikulum berhasil dihapus.',
        timer: 2000,
        showConfirmButton: false,
      })
    },
    onError: (err) => {
      const msg = err.response?.data?.message || 'Gagal menghapus data kurikulum.'
      Swal.fire('Gagal Menghapus', msg, 'error')
    },
  })

  const pulihkanMutation = useMutation({
    mutationFn: (id) => masterKurikulumService.pulihkan(id),
    onSuccess: (res) => {
      queryClient.invalidateQueries(['master-kurikulum-list'])
      Swal.fire({
        icon: 'success',
        title: 'Berhasil!',
        text: res?.message || 'Data kurikulum berhasil dipulihkan.',
        timer: 2000,
        showConfirmButton: false,
      })
    },
    onError: (err) => {
      const msg = err.response?.data?.message || 'Gagal memulihkan data.'
      Swal.fire('Error', msg, 'error')
    },
  })

  const importMutation = useMutation({
    mutationFn: (rows) => masterKurikulumService.prosesImport(rows),
    onSuccess: (res) => {
      queryClient.invalidateQueries(['master-kurikulum-list'])
      setIsImportModalOpen(false)
      Swal.fire({
        icon: 'success',
        title: 'Impor Selesai!',
        text: res?.message || 'Data kurikulum berhasil diimpor.',
      })
    },
    onError: (err) => {
      const msg = err.response?.data?.message || 'Gagal memproses impor data.'
      Swal.fire('Error Impor', msg, 'error')
    },
  })

  // Handlers
  const handleOpenFormTambah = () => {
    setSelectedForEdit(null)
    setIsFormModalOpen(true)
  }

  const handleOpenFormEdit = (item) => {
    setSelectedForEdit(item)
    setIsFormModalOpen(true)
  }

  const handleOpenDetail = (item) => {
    setSelectedForDetail(item)
    setIsDetailModalOpen(true)
  }

  const handleConfirmDelete = (item) => {
    Swal.fire({
      title: 'Apakah Anda yakin ingin menghapus data kurikulum ini?',
      text: `Kurikulum "${item.nama_kurikulum}" akan dipindahkan ke tempat sampah (Soft Delete).`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#e11d48',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Ya, Hapus Data',
      cancelButtonText: 'Batal',
    }).then((result) => {
      if (result.isConfirmed) {
        hapusMutation.mutate(item.id)
      }
    })
  }

  const handleConfirmRestore = (item) => {
    pulihkanMutation.mutate(item.id)
  }

  const handleFormSubmit = (payload) => {
    if (selectedForEdit) {
      ubahMutation.mutate({ id: selectedForEdit.id, payload })
    } else {
      simpanMutation.mutate(payload)
    }
  }

  const handleResetFilters = () => {
    setSearch('')
    setSelectedStatusFilter('')
    setSelectedJenisFilter('')
    setSelectedJenjangFilter('')
    setDenganSampahFilter('')
    setPage(1)
  }

  const handleExportExcel = async () => {
    try {
      Swal.fire({
        title: 'Mempersiapkan Ekspor...',
        text: 'Mohon tunggu sebentar',
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading()
        },
      })

      const dataEkspor = await masterKurikulumService.ekspor({
        search,
        status: selectedStatusFilter,
        jenis_kurikulum: selectedJenisFilter,
        jenjang: selectedJenjangFilter,
      })

      if (!dataEkspor || dataEkspor.length === 0) {
        Swal.fire('Info', 'Tidak ada data untuk diekspor.', 'info')
        return
      }

      const headers = [
        'NO',
        'KODE KURIKULUM',
        'NAMA KURIKULUM',
        'JENIS KURIKULUM',
        'JENJANG',
        'UNIT PENDIDIKAN',
        'TAHUN AJARAN',
        'SEMESTER',
        'TANGGAL MULAI',
        'TANGGAL SELESAI',
        'STATUS',
        'DESKRIPSI',
        'TANGGAL DIBUAT',
      ]
      let csvStr = headers.join(',') + '\n'

      dataEkspor.forEach((row) => {
        const line = [
          row.no,
          `"${row.kode_kurikulum}"`,
          `"${row.nama_kurikulum}"`,
          `"${row.jenis_kurikulum}"`,
          `"${row.jenjang}"`,
          `"${row.unit_pendidikan}"`,
          `"${row.tahun_ajaran}"`,
          `"${row.semester}"`,
          `"${row.tanggal_mulai}"`,
          `"${row.tanggal_selesai}"`,
          `"${row.status}"`,
          `"${row.deskripsi ? row.deskripsi.replace(/"/g, '""') : ''}"`,
          `"${row.created_at}"`,
        ].join(',')
        csvStr += line + '\n'
      })

      const blob = new Blob([csvStr], { type: 'text/csv;charset=utf-8;' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.setAttribute('href', url)
      link.setAttribute(
        'download',
        `export_master_kurikulum_${new Date().toISOString().slice(0, 10)}.csv`
      )
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      Swal.fire({
        icon: 'success',
        title: 'Berhasil Ekspor!',
        text: `${dataEkspor.length} data kurikulum berhasil diunduh.`,
        timer: 2000,
        showConfirmButton: false,
      })
    } catch {
      Swal.fire('Error', 'Gagal mengunduh data ekspor.', 'error')
    }
  }

  const shouldHideBreadcrumb = embedded || hideBreadcrumb
  const shouldHideHeader = embedded || hidePageHeader

  const pageActions = (
    <>
      <MasterActionButton variant="import" icon={Upload} onClick={() => setIsImportModalOpen(true)}>Import Data</MasterActionButton>
      <MasterActionButton variant="export" icon={FileSpreadsheet} onClick={handleExportExcel}>Export CSV</MasterActionButton>
      <MasterActionButton icon={Plus} onClick={handleOpenFormTambah}>Tambah Kurikulum</MasterActionButton>
    </>
  )

  return (
    <PageContainer maxW="7xl">
      {!shouldHideBreadcrumb && <AppBreadcrumb items={[{ label: 'Master Data', href: '/dashboard' }, { label: 'Data Kurikulum' }]} />}
      <MasterDataPage className="education-unit-page" hideBreadcrumb={shouldHideBreadcrumb}>
      {!shouldHideHeader && (
        <MasterPageHeader
          tone="brand"
          icon={BookOpen}
          title="Master Data Kurikulum"
          description="Kelola seluruh kurikulum pendidikan yang digunakan oleh setiap Unit Pendidikan Sekolah Islam Terpadu."
          actions={pageActions}
        />
      )}

      <MasterStatsGrid className="education-unit-kpis">
        <MasterStatCard
          icon={BookOpen}
          label="TOTAL KURIKULUM"
          value={statsValue(stats.total ?? 0)}
          description="Terdaftar di sistem"
          variant="success"
          loading={isLoading}
        />
        <MasterStatCard
          icon={CheckCircle}
          label="KURIKULUM AKTIF"
          value={statsValue(stats.aktif ?? 0)}
          description="Sedang diberlakukan"
          variant="info"
          loading={isLoading}
        />
        <MasterStatCard
          icon={XCircle}
          label="KURIKULUM NONAKTIF"
          value={statsValue(stats.tidak_aktif ?? 0)}
          description="Arsip / Tidak aktif"
          variant="warning"
          loading={isLoading}
        />
      </MasterStatsGrid>

      <MasterDataSection
        title="Data Kurikulum"
        description="Daftar kurikulum sesuai pencarian dan filter yang dipilih."
        countLabel={`${Number(meta.total ?? listData.length).toLocaleString('id-ID')} kurikulum`}
        search={{
          value: search,
          onChange: (event) => {
            setSearch(event.target.value)
            setPage(1)
          },
          placeholder: 'Cari kode, nama, atau deskripsi kurikulum...',
          'aria-label': 'Cari kurikulum',
        }}
        filters={
          <>
            <MasterFilterSelect
              aria-label="Filter jenis kurikulum"
              value={selectedJenisFilter}
              onChange={(e) => {
                setSelectedJenisFilter(e.target.value)
                setPage(1)
              }}
            >
              <option value="">Semua Jenis</option>
              {JENIS_LIST.map((j) => (
                <option key={j} value={j}>{j}</option>
              ))}
            </MasterFilterSelect>

            <MasterFilterSelect
              aria-label="Filter jenjang kurikulum"
              value={selectedJenjangFilter}
              onChange={(e) => {
                setSelectedJenjangFilter(e.target.value)
                setPage(1)
              }}
            >
              <option value="">Semua Jenjang</option>
              {JENJANG_LIST.map((j) => (
                <option key={j} value={j}>{j}</option>
              ))}
            </MasterFilterSelect>

            <MasterFilterSelect
              aria-label="Filter status kurikulum"
              value={selectedStatusFilter}
              onChange={(e) => {
                setSelectedStatusFilter(e.target.value)
                setPage(1)
              }}
            >
              <option value="">Semua Status</option>
              <option value="aktif">Aktif</option>
              <option value="tidak_aktif">Nonaktif</option>
            </MasterFilterSelect>

            <MasterFilterSelect
              aria-label="Filter data terhapus"
              value={denganSampahFilter}
              onChange={(e) => {
                setDenganSampahFilter(e.target.value)
                setPage(1)
              }}
            >
              <option value="">Data Aktif</option>
              <option value="true">Termasuk Terhapus</option>
            </MasterFilterSelect>
          </>
        }
        onReset={handleResetFilters}
        resetDisabled={
          !search &&
          !selectedStatusFilter &&
          !selectedJenisFilter &&
          !selectedJenjangFilter &&
          !denganSampahFilter
        }
        isLoading={isLoading || isFetching}
        isError={isError}
        errorTitle="Data kurikulum gagal dimuat"
        onRetry={refetch}
        isEmpty={!isLoading && !isFetching && !isError && listData.length === 0}
        emptyTitle="Kurikulum tidak ditemukan"
        emptyDescription="Coba sesuaikan kata kunci pencarian atau filter yang diterapkan."
        pagination={{
          meta: {
            total: meta.total ?? listData.length,
            from: meta.from ?? (listData.length ? (page - 1) * perPage + 1 : 0),
            to: meta.to ?? ((page - 1) * perPage + listData.length),
            last_page: meta.last_page ?? 1,
            current_page: meta.current_page ?? page,
            per_page: meta.per_page ?? perPage,
          },
          page,
          onPageChange: setPage,
        }}
      >
        <KurikulumTable
          data={listData}
          page={page}
          perPage={perPage}
          onDetail={handleOpenDetail}
          onEdit={handleOpenFormEdit}
          onDelete={handleConfirmDelete}
          onRestore={handleConfirmRestore}
        />
      </MasterDataSection>

      <KurikulumFormModal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        onSubmit={handleFormSubmit}
        initialData={selectedForEdit}
        isSubmitting={simpanMutation.isPending || ubahMutation.isPending}
      />

      <KurikulumDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        data={selectedForDetail}
      />

      <KurikulumImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImport={(rows) => importMutation.mutate(rows)}
        isSubmitting={importMutation.isPending}
      />
    </MasterDataPage>
    </PageContainer>
  )
}
