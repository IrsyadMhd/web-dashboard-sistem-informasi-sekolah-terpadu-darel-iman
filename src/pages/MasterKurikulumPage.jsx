import React, { useState, useEffect, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import Swal from 'sweetalert2'
import {
  BookOpen,
  Plus,
  FileSpreadsheet,
  Upload,
  CheckCircle,
  XCircle,
  Printer,
} from 'lucide-react'
import { api } from '../services/api'
import { masterKurikulumService } from '../services/masterKurikulumService'
import KurikulumTable from '../components/kurikulum/KurikulumTable'
import KurikulumFormModal from '../components/kurikulum/KurikulumFormModal'
import KurikulumDetailModal from '../components/kurikulum/KurikulumDetailModal'
import KurikulumImportModal from '../components/kurikulum/KurikulumImportModal'
import PageContainer from '../components/app/PageContainer'
import AppBreadcrumb from '../components/app/AppBreadcrumb'
import { printCleanTable, downloadPdfTable } from '../utils/printHelper'
import { useAuthStore } from '../stores/authStore'
import { isGlobalAccessManager } from '../auth/portalResolver'
import {
  MasterActionButton,
  MasterDataSection,
  MasterDataPage,
  MasterPageHeader,
  MasterStatsGrid,
  MasterStatCard,
  MasterFilterSelect,
  SquircleActionButton,
  PrintOptionModal,
} from '../components/master-data'

const JENIS_LIST = ['SIT', 'Merdeka', 'Nasional', 'Pesantren', 'Lokal', 'Lainnya']
const JENJANG_LIST = ['TK', 'PAUD', 'SD', 'MI', 'SMP', 'MTs', 'SMA', 'MA', 'Pesantren']

function getJenjangFromUnit(unit) {
  if (!unit) return ''
  const str = `${unit.code || ''} ${unit.level || ''} ${unit.name || ''} ${unit.nama || ''} ${unit.tingkat || ''}`.toUpperCase()

  if (str.includes('TAUD') || str.includes('PAUD')) return 'PAUD'
  if (str.includes('TK')) return 'TK'
  if (str.includes('MIT') || str.includes(' MI ') || str.endsWith(' MI') || str.startsWith('MI ')) return 'MI'
  if (str.includes('SD')) return 'SD'
  if (str.includes('MTS')) return 'MTs'
  if (str.includes('SMP')) return 'SMP'
  if (str.includes('MA') && !str.includes('SMA') && !str.includes('MAHAD')) return 'MA'
  if (str.includes('SMA')) return 'SMA'
  if (str.includes('PESANTREN') || str.includes('PONPES') || str.includes('MAHAD')) return 'Pesantren'

  return ''
}

export default function MasterKurikulumPage({ embedded = false, hidePageHeader = false, hideBreadcrumb = false }) {
  const queryClient = useQueryClient()

  // User Auth & Role Scoping
  const user = useAuthStore((state) => state.user)
  const userRoles = useMemo(() => {
    if (!user) return []
    const rawRoles = user.roles || (user.role ? [user.role] : []) || user.role_names || []
    const list = Array.isArray(rawRoles) ? rawRoles : [rawRoles]
    return list.map((r) => (typeof r === 'string' ? r : r?.name || r?.role_name || r?.nama || ''))
  }, [user])

  const canViewAllUnits = useMemo(() => {
    if (!user || userRoles.length === 0) return false
    return isGlobalAccessManager(userRoles)
  }, [user, userRoles])

  // Fetch Education Units
  const { data: unitsData = [] } = useQuery({
    queryKey: ['education-units-list-kurikulum'],
    queryFn: async () => {
      const res = await api.get('/education-units')
      return res.data?.data || res.data || []
    },
    staleTime: 60000,
  })
  const educationUnits = Array.isArray(unitsData) ? unitsData : unitsData?.items || []

  const userUnitId = useMemo(() => {
    const candidateIds = [
      user?.unit_id,
      user?.unit_pendidikan_id,
      user?.education_unit_id,
      user?.unit?.id,
      user?.education_unit?.id,
      user?.unit_pendidikan?.id,
      user?.employee?.unit_id,
      user?.employee?.unit_pendidikan_id,
      user?.employee?.education_unit_id,
      user?.employee?.unit?.id,
      user?.employee?.education_unit?.id,
      user?.school_info?.id,
    ].filter(Boolean)

    return candidateIds.length > 0 ? String(candidateIds[0]) : null
  }, [user])

  const userUnitName = useMemo(() => {
    const candidateNames = [
      typeof user?.education_unit === 'string' ? user.education_unit : null,
      typeof user?.unit === 'string' ? user.unit : null,
      user?.unit_name,
      user?.education_unit_name,
      user?.unit_pendidikan_name,
      user?.unit?.name || user?.unit?.nama,
      user?.education_unit?.name || user?.education_unit?.nama,
      user?.employee?.unit?.name || user?.employee?.education_unit?.name,
      user?.school_info?.nama || user?.school_info?.name,
    ]
      .filter(Boolean)
      .map((s) => String(s).toLowerCase().trim())

    return candidateNames.length > 0 ? candidateNames[0] : ''
  }, [user])

  const availableUnitOptions = useMemo(() => {
    const allUnits = educationUnits || []
    if (canViewAllUnits) {
      return allUnits
    }

    if (userUnitId) {
      const filtered = allUnits.filter((u) => String(u.id) === String(userUnitId))
      if (filtered.length > 0) return filtered
    }

    if (userUnitName) {
      const matched = allUnits.filter((u) => {
        const uName = String(u.name || u.nama || '').toLowerCase().trim()
        const uCode = String(u.code || u.kode || '').toLowerCase().trim()
        return (
          uName === userUnitName ||
          uCode === userUnitName ||
          userUnitName.includes(uName) ||
          uName.includes(userUnitName)
        )
      })
      if (matched.length > 0) return matched
    }

    return allUnits.length > 0 ? [allUnits[0]] : []
  }, [educationUnits, canViewAllUnits, userUnitId, userUnitName])

  const effectiveUserUnitId = useMemo(() => {
    if (canViewAllUnits) return ''
    if (userUnitId) return String(userUnitId)
    if (availableUnitOptions.length > 0) return String(availableUnitOptions[0].id)
    return ''
  }, [canViewAllUnits, userUnitId, availableUnitOptions])

  // Filter & Pagination States
  const [search, setSearch] = useState('')
  const [selectedUnitFilter, setSelectedUnitFilter] = useState('')
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('')
  const [selectedJenisFilter, setSelectedJenisFilter] = useState('')
  const [selectedJenjangFilter, setSelectedJenjangFilter] = useState('')
  const [denganSampahFilter, setDenganSampahFilter] = useState('')
  const [page, setPage] = useState(1)
  const perPage = 15

  const activeUnitObj = useMemo(() => {
    const targetId = selectedUnitFilter || effectiveUserUnitId
    if (!targetId) return null
    return (educationUnits || []).find((u) => String(u.id) === String(targetId)) || null
  }, [selectedUnitFilter, effectiveUserUnitId, educationUnits])

  const activeUnitJenjang = useMemo(() => {
    if (activeUnitObj) {
      const fromUnit = getJenjangFromUnit(activeUnitObj)
      if (fromUnit) return fromUnit
    }
    const candidateStr = [
      typeof user?.education_unit === 'string' ? user.education_unit : null,
      typeof user?.unit === 'string' ? user.unit : null,
      user?.unit_name,
      user?.education_unit_name,
      user?.unit_pendidikan_name,
      user?.unit?.name || user?.unit?.nama || user?.unit?.code,
      user?.education_unit?.name || user?.education_unit?.nama || user?.education_unit?.code,
      user?.employee?.unit?.name || user?.employee?.education_unit?.name,
      user?.school_info?.nama || user?.school_info?.name,
    ].filter(Boolean).join(' ')
    return getJenjangFromUnit({ name: candidateStr, code: candidateStr })
  }, [activeUnitObj, user])

  const availableJenjangOptions = useMemo(() => {
    if (!canViewAllUnits && activeUnitJenjang) {
      const matched = JENJANG_LIST.filter((j) => j.toLowerCase() === activeUnitJenjang.toLowerCase())
      return matched.length > 0 ? matched : [activeUnitJenjang]
    }
    if (activeUnitJenjang) {
      const matched = JENJANG_LIST.filter((j) => j.toLowerCase() === activeUnitJenjang.toLowerCase())
      return matched.length > 0 ? matched : JENJANG_LIST
    }
    return JENJANG_LIST
  }, [activeUnitJenjang, canViewAllUnits])

  const availableJenisOptions = useMemo(() => {
    if (!activeUnitObj) return JENIS_LIST
    const str = `${activeUnitObj.code || ''} ${activeUnitObj.name || ''}`.toUpperCase()
    if (str.includes('PESANTREN') || str.includes('PONPES') || str.includes('MAHAD')) {
      return ['Pesantren', 'SIT', 'Merdeka', 'Nasional', 'Lokal', 'Lainnya']
    }
    return JENIS_LIST
  }, [activeUnitObj])

  useEffect(() => {
    if (!canViewAllUnits && effectiveUserUnitId && selectedUnitFilter !== effectiveUserUnitId) {
      setSelectedUnitFilter(effectiveUserUnitId)
    }
  }, [canViewAllUnits, effectiveUserUnitId, selectedUnitFilter])

  useEffect(() => {
    if (activeUnitJenjang && !canViewAllUnits) {
      if (!selectedJenjangFilter || !availableJenjangOptions.includes(selectedJenjangFilter)) {
        setSelectedJenjangFilter(activeUnitJenjang)
      }
    }
  }, [activeUnitJenjang, canViewAllUnits, availableJenjangOptions, selectedJenjangFilter])

  // Modal States
  const [isFormModalOpen, setIsFormModalOpen] = useState(false)
  const [selectedForEdit, setSelectedForEdit] = useState(null)

  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
  const [selectedForDetail, setSelectedForDetail] = useState(null)

  const [isImportModalOpen, setIsImportModalOpen] = useState(false)
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false)

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
      selectedUnitFilter,
      selectedStatusFilter,
      selectedJenisFilter,
      selectedJenjangFilter,
      denganSampahFilter,
      canViewAllUnits,
      effectiveUserUnitId,
      activeUnitJenjang,
    ],
    queryFn: () => {
      const targetUnitId = !canViewAllUnits ? (effectiveUserUnitId || selectedUnitFilter) : selectedUnitFilter
      const targetJenjang = selectedJenjangFilter || (!canViewAllUnits ? activeUnitJenjang : undefined)
      return masterKurikulumService.getDaftar({
        page,
        per_page: perPage,
        search,
        unit_pendidikan_id: targetUnitId || undefined,
        status: selectedStatusFilter,
        jenis_kurikulum: selectedJenisFilter,
        jenjang: targetJenjang || undefined,
        dengan_sampah: denganSampahFilter,
        order_by: 'created_at',
        order_dir: 'desc',
      })
    },
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
    setSelectedUnitFilter(canViewAllUnits ? '' : effectiveUserUnitId)
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
        unit_pendidikan_id: selectedUnitFilter || (!canViewAllUnits ? effectiveUserUnitId : undefined),
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
    <div className="flex items-center gap-2.5 flex-nowrap shrink-0 overflow-x-auto py-1">
      <SquircleActionButton variant="import" label="Import Data" onClick={() => setIsImportModalOpen(true)} />
      <SquircleActionButton variant="export" label="Export CSV" onClick={handleExportExcel} />
      <SquircleActionButton variant="view" icon={Printer} label="Cetak Data" onClick={() => setIsPrintModalOpen(true)} />
      <SquircleActionButton variant="primary" label="Tambah Kurikulum" onClick={handleOpenFormTambah} />
    </div>
  )

  return (
    <PageContainer maxW="7xl">
      <PrintOptionModal
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
        title="Kurikulum"
        onPrint={() => {
          printCleanTable({
            title: 'Laporan Master Data Kurikulum',
            subtitle: 'Daftar Kurikulum Pendidikan Sekolah Islam Terpadu',
            headers: ['NO', 'KODE', 'NAMA KURIKULUM', 'JENIS', 'JENJANG', 'UNIT PENDIDIKAN', 'TAHUN AJARAN', 'STATUS'],
            rows: listData.map((row, i) => [
              i + 1,
              row.kode_kurikulum || '-',
              row.nama_kurikulum || '-',
              row.jenis_kurikulum || '-',
              row.jenjang || '-',
              row.unit_pendidikan?.name || row.unit_pendidikan || '-',
              row.tahun_ajaran?.nama || row.tahun_ajaran || '-',
              row.status ? 'Aktif' : 'Nonaktif',
            ]),
          })
        }}
        onDownload={() => {
          downloadPdfTable({
            title: 'Laporan Master Data Kurikulum',
            subtitle: 'Daftar Kurikulum Pendidikan Sekolah Islam Terpadu',
            headers: ['NO', 'KODE', 'NAMA KURIKULUM', 'JENIS', 'JENJANG', 'UNIT PENDIDIKAN', 'TAHUN AJARAN', 'STATUS'],
            rows: listData.map((row, i) => [
              i + 1,
              row.kode_kurikulum || row.code || row.kode || '-',
              row.nama_kurikulum || row.name || row.nama || '-',
              row.jenis_kurikulum || row.jenis || '-',
              row.jenjang || '-',
              row.unit_pendidikan?.name || row.unit_pendidikan?.nama || row.unit_name || '-',
              row.tahun_ajaran?.nama || row.tahun_ajaran?.name || '-',
              row.status ? 'Aktif' : 'Nonaktif',
            ]),
            filename: 'laporan_master_kurikulum.pdf',
          })
        }}
      />
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
        actions={pageActions}
        stackedFilters={true}
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
              aria-label="Filter unit pendidikan"
              value={selectedUnitFilter}
              onChange={(e) => {
                setSelectedUnitFilter(e.target.value)
                setPage(1)
              }}
              disabled={!canViewAllUnits && availableUnitOptions.length <= 1}
            >
              {canViewAllUnits && <option value="">Semua Unit</option>}
              {availableUnitOptions.map((unit) => (
                <option key={unit.id} value={unit.id}>
                  {unit.name || unit.nama}
                </option>
              ))}
            </MasterFilterSelect>

            <MasterFilterSelect
              aria-label="Filter jenis kurikulum"
              value={selectedJenisFilter}
              onChange={(e) => {
                setSelectedJenisFilter(e.target.value)
                setPage(1)
              }}
            >
              <option value="">Semua Jenis</option>
              {availableJenisOptions.map((j) => (
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
              <option value="">
                {canViewAllUnits
                  ? 'Semua Jenjang'
                  : activeUnitJenjang
                  ? `Semua Jenjang (${activeUnitJenjang})`
                  : 'Semua Jenjang'}
              </option>
              {availableJenjangOptions.map((j) => (
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
          selectedUnitFilter === (canViewAllUnits ? '' : effectiveUserUnitId) &&
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
        availableUnitOptions={availableUnitOptions}
        canViewAllUnits={canViewAllUnits}
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
