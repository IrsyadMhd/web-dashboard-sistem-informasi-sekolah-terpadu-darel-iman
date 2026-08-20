import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import Swal from 'sweetalert2'
import {
  Briefcase as FaBriefcase,
  CircleCheck as FaCheckCircle,
  Network as FaSitemap,
  LockOpen as FaLockOpen,
  Lock as FaLock,
  RotateCcw as FaRedo,
  ChevronDown,
  RefreshCcw,
} from 'lucide-react'
import { Download1, Upload1, Plus } from '@tailgrids/icons'
import { jabatanService } from '../services/jabatanService'
import JabatanFormModal from '../components/jabatan/JabatanFormModal'
import JabatanDetailModal from '../components/jabatan/JabatanDetailModal'
import JabatanImportModal from '../components/jabatan/JabatanImportModal'
import PageContainer from '../components/app/PageContainer'
import AppBreadcrumb from '../components/app/AppBreadcrumb'
import AppPageHeader from '../components/app/AppPageHeader'
import AppDataTable from '../components/app/AppDataTable'
import ActionDropdown from '../components/app/ActionDropdown'
import ConfirmDialog from '../components/app/ConfirmDialog'
import { MasterStatusBadge, MasterStatCard, MasterStatsGrid, MasterDeleteDialog } from '../components/master-data'
import { Button } from '@/components/tailgrids/core/button'
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '@/components/tailgrids/core/hover-card'
import { useAuthStore } from '../stores/authStore'
import { hasAnyRole, isGlobalAccessManager, isUnitAccessManager } from '../auth/portalResolver'

export default function MasterJabatanPage() {
  const queryClient = useQueryClient()
  const user = useAuthStore((state) => state.user)
  const roles = user?.roles || (user?.role ? [user.role] : [])
  const isKepalaSekolah = hasAnyRole(roles, ['Kepala Sekolah', 'kepala_sekolah', 'kepsek'])
  const canManageGlobalPositions = isGlobalAccessManager(roles)
  const canManageUnitPositions = isUnitAccessManager(roles)
  const canEditPosition = canManageGlobalPositions || canManageUnitPositions

  const isPengurusYayasanRow = (row) => {
    if (!row) return false
    if (Number(row.level_jabatan) === 1) return true
    if (row.satuan_kerja === 'Pengurus') return true
    const name = String(row.nama_jabatan || row.name || '').toLowerCase()
    if (name.includes('pengurus yayasan') || name.includes('yayasan')) return true
    const levelLabel = String(row.level_label || '').toLowerCase()
    if (levelLabel.includes('pengurus yayasan') || levelLabel.includes('yayasan')) return true
    return false
  }

  const isRowRestrictedForUser = (row) => {
    const isGlobalPosition = Number(row?.level_jabatan) <= 2
      || ['semua_unit', 'bidang_pendidikan'].includes(row?.scope_akses)
      || row?.satuan_kerja !== 'Unit Pendidikan'

    return !canManageGlobalPositions && (isPengurusYayasanRow(row) || !row?.unit_sekolah_id || isGlobalPosition)
  }

  // Filter & Pagination States
  const [search, setSearch] = useState('')
  const [selectedUnitFilter, setSelectedUnitFilter] = useState('')
  const [selectedSatuanKerjaFilter, setSelectedSatuanKerjaFilter] = useState('')
  const [selectedLevelFilter, setSelectedLevelFilter] = useState('')
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('')
  const [denganSampahFilter, setDenganSampahFilter] = useState('')
  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useState(10)

  // Modals States
  const [isFormModalOpen, setIsFormModalOpen] = useState(false)
  const [selectedJabatanForEdit, setSelectedJabatanForEdit] = useState(null)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
  const [selectedJabatanForDetail, setSelectedJabatanForDetail] = useState(null)
  const [isImportModalOpen, setIsImportModalOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [pendingSaveData, setPendingSaveData] = useState(null)
  const [showSaveConfirmModal, setShowSaveConfirmModal] = useState(false)

  // Query Options Dropdown
  const { data: options = {} } = useQuery({
    queryKey: ['jabatan-options'],
    queryFn: () => jabatanService.getOptions(),
  })

  // Query Daftar Jabatan
  const {
    data: jabatanData = {},
    isLoading,
    isFetching,
    isError,
    refetch,
  } = useQuery({
    queryKey: [
      'jabatan-list',
      page,
      perPage,
      search,
      selectedUnitFilter,
      selectedSatuanKerjaFilter,
      selectedLevelFilter,
      selectedStatusFilter,
      denganSampahFilter,
    ],
    queryFn: () =>
      jabatanService.getDaftar({
        page,
        per_page: perPage,
        search,
        unit_sekolah_id: selectedUnitFilter,
        satuan_kerja: selectedSatuanKerjaFilter,
        level_jabatan: selectedLevelFilter,
        status: selectedStatusFilter,
        dengan_sampah: denganSampahFilter,
        order_by: 'urutan',
        order_dir: 'asc',
      }),
  })

  const daftarJabatan = jabatanData?.data || []
  const meta = jabatanData?.meta || {}
  const statistik = jabatanData?.statistik || {}
  const statsValue = (value) => (isError ? '—' : value)
  const tableIsLoading = isLoading || isFetching
  const filtersAreClear =
    !search &&
    !selectedUnitFilter &&
    !selectedSatuanKerjaFilter &&
    !selectedLevelFilter &&
    !selectedStatusFilter &&
    !denganSampahFilter

  const paginationInfo = {
    total: meta.total ?? daftarJabatan.length,
    from: meta.from ?? (daftarJabatan.length ? (page - 1) * perPage + 1 : 0),
    to: meta.to ?? ((page - 1) * perPage + daftarJabatan.length),
    last_page: meta.last_page ?? 1,
    current_page: meta.current_page ?? page,
    per_page: meta.per_page ?? perPage,
  }

  // Mutations
  const simpanMutation = useMutation({
    mutationFn: (payload) => jabatanService.tambah(payload),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['jabatan-list'] })
      queryClient.invalidateQueries({ queryKey: ['jabatan-options'] })
      setIsFormModalOpen(false)
      Swal.fire({
        icon: 'success',
        title: 'Berhasil!',
        text: res?.message || 'Data jabatan baru berhasil ditambahkan.',
        timer: 2000,
        showConfirmButton: false,
      })
    },
    onError: (err) => {
      const msg = err.response?.data?.message || 'Gagal menyimpan data jabatan.'
      Swal.fire('Error', msg, 'error')
    },
  })

  const ubahMutation = useMutation({
    mutationFn: ({ id, payload }) => jabatanService.ubah({ id, payload }),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['jabatan-list'] })
      queryClient.invalidateQueries({ queryKey: ['jabatan-options'] })
      setIsFormModalOpen(false)
      setSelectedJabatanForEdit(null)
      Swal.fire({
        icon: 'success',
        title: 'Berhasil!',
        text: res?.message || 'Perubahan data jabatan berhasil disimpan.',
        timer: 2000,
        showConfirmButton: false,
      })
    },
    onError: (err) => {
      const msg = err.response?.data?.message || 'Gagal memperbarui data jabatan.'
      Swal.fire('Error', msg, 'error')
    },
  })

  const hapusMutation = useMutation({
    mutationFn: (id) => jabatanService.hapus(id),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['jabatan-list'] })
      Swal.fire('Terhapus!', res?.message || 'Data jabatan berhasil dihapus.', 'success')
    },
    onError: (err) => {
      Swal.fire('Gagal!', err.response?.data?.message || 'Terjadi kesalahan saat menghapus.', 'error')
    },
  })

  const pulihkanMutation = useMutation({
    mutationFn: (id) => jabatanService.pulihkan(id),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['jabatan-list'] })
      Swal.fire('Dipulihkan!', res?.message || 'Data jabatan berhasil dipulihkan.', 'success')
    },
    onError: (err) => {
      Swal.fire('Gagal!', err.response?.data?.message || 'Terjadi kesalahan saat memulihkan.', 'error')
    },
  })

  const importMutation = useMutation({
    mutationFn: (rows) => jabatanService.prosesImport(rows),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['jabatan-list'] })
      queryClient.invalidateQueries({ queryKey: ['jabatan-options'] })
      setIsImportModalOpen(false)
      Swal.fire({
        icon: 'success',
        title: 'Impor Selesai',
        text: res?.message || `Berhasil diimpor.`,
      })
    },
    onError: (err) => {
      Swal.fire('Gagal Impor!', err.response?.data?.message || 'Format data impor bermasalah.', 'error')
    },
  })

  // Handlers
  const handleOpenCreate = () => {
    if (!canManageGlobalPositions) return
    setSelectedJabatanForEdit(null)
    setIsFormModalOpen(true)
  }

  const handleOpenEdit = (item) => {
    if (!canEditPosition || isRowRestrictedForUser(item)) {
      Swal.fire({
        icon: 'warning',
        title: 'Akses Dibatasi',
        text: 'Role Kepala Sekolah tidak diizinkan untuk mengubah data jabatan Pengurus Yayasan.',
      })
      return
    }
    setSelectedJabatanForEdit(item)
    setIsFormModalOpen(true)
  }

  const handleOpenDetail = (item) => {
    setSelectedJabatanForDetail(item)
    setIsDetailModalOpen(true)
  }

  const handleDelete = (item) => {
    if (!canManageGlobalPositions || isRowRestrictedForUser(item)) {
      Swal.fire({
        icon: 'warning',
        title: 'Akses Dibatasi',
        text: 'Role Kepala Sekolah tidak diizinkan untuk menghapus data jabatan Pengurus Yayasan.',
      })
      return
    }
    setDeleteTarget(item)
  }

  const handleConfirmDelete = () => {
    if (deleteTarget) {
      hapusMutation.mutate(deleteTarget.id, {
        onSettled: () => setDeleteTarget(null),
      })
    }
  }

  const handleRestore = (item) => {
    if (!canEditPosition || isRowRestrictedForUser(item)) return
    Swal.fire({
      title: 'Pulihkan Data Jabatan?',
      html: `Apakah Anda yakin ingin memulihkan jabatan <strong>${item.nama_jabatan || item.name}</strong>?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#10b981',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Ya, Pulihkan',
      cancelButtonText: 'Batal',
    }).then((result) => {
      if (result.isConfirmed) {
        pulihkanMutation.mutate(item.id)
      }
    })
  }

  const handleFormSubmit = (data) => {
    setPendingSaveData(data)
    setShowSaveConfirmModal(true)
  }

  const handleConfirmSaveForm = () => {
    if (!pendingSaveData) return
    if (selectedJabatanForEdit) {
      ubahMutation.mutate({ id: selectedJabatanForEdit.id, payload: pendingSaveData })
    } else {
      simpanMutation.mutate(pendingSaveData)
    }
    setShowSaveConfirmModal(false)
  }

  const handleResetFilters = () => {
    setSearch('')
    setSelectedUnitFilter('')
    setSelectedSatuanKerjaFilter('')
    setSelectedLevelFilter('')
    setSelectedStatusFilter('')
    setDenganSampahFilter('')
    setPage(1)
  }

  // Export Excel CSV
  const handleExportExcel = async () => {
    try {
      const dataEkspor = await jabatanService.ekspor({
        search,
        unit_sekolah_id: selectedUnitFilter,
        satuan_kerja: selectedSatuanKerjaFilter,
        level_jabatan: selectedLevelFilter,
        status: selectedStatusFilter,
      })

      if (!dataEkspor || dataEkspor.length === 0) {
        Swal.fire('Info', 'Tidak ada data untuk diekspor.', 'info')
        return
      }

      const headers = [
        'Kode Jabatan',
        'Nama Jabatan',
        'Satuan Kerja',
        'Level',
        'Level Label',
        'Unit Sekolah',
        'Atasan Langsung',
        'Role Sistem',
        'Urutan',
        'Status',
        'Tampil Struktur',
        'Boleh Login',
        'Jumlah Pegawai',
        'Deskripsi',
      ]

      const csvRows = [
        headers.join(','),
        ...dataEkspor.map((row) =>
          [
            `"${row.kode_jabatan || ''}"`,
            `"${row.nama_jabatan || ''}"`,
            `"${row.satuan_kerja || ''}"`,
            row.level_jabatan || '',
            `"${row.level_label || ''}"`,
            `"${row.unit_sekolah || ''}"`,
            `"${row.atasan_langsung || ''}"`,
            `"${row.role_sistem || ''}"`,
            row.urutan || 0,
            `"${row.status || ''}"`,
            `"${row.tampil_struktur || ''}"`,
            `"${row.boleh_login || ''}"`,
            row.jumlah_pegawai || 0,
            `"${(row.deskripsi || '').replace(/"/g, '""')}"`,
          ].join(',')
        ),
      ]

      const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `Master_Jabatan_Sekolah_${new Date().toISOString().slice(0, 10)}.csv`
      document.body.appendChild(a)
      a.click()
      a.remove()
      URL.revokeObjectURL(url)

      Swal.fire({
        icon: 'success',
        title: 'Ekspor Berhasil',
        text: 'File CSV Master Jabatan berhasil diunduh.',
        timer: 2000,
        showConfirmButton: false,
      })
    } catch (err) {
      Swal.fire('Error', 'Gagal mengekspor data: ' + err.message, 'error')
    }
  }

  // Column Specification based on TAILGRIDS_TABLE_COMPONENT Gold Standard Benchmark
  const columns = [
    {
      key: 'nama_jabatan',
      label: 'Identitas Jabatan',
      render: (row) => {
        const isTrashed = row.terhapus
        return (
          <div className="flex min-w-0 items-center gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-emerald-100 bg-emerald-50 text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/50 dark:text-emerald-300 shadow-2xs">
              <FaSitemap className="h-5 w-5" />
            </span>
            <span className="min-w-0 flex-1">
              <HoverCard>
                <HoverCardTrigger
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    handleOpenDetail(row)
                  }}
                  className="inline-block max-w-full truncate text-[13px] font-extrabold leading-5 text-slate-900 dark:text-white border-b border-dashed border-slate-400/60 hover:border-[#0E5C44] transition-colors cursor-pointer"
                  title={row.nama_jabatan || row.name}
                >
                  {row.nama_jabatan || row.name}
                </HoverCardTrigger>
                <HoverCardContent className="w-64 p-3.5 border border-slate-200 bg-white dark:border-slate-800 dark:bg-[#1B2433] shadow-xl rounded-xl">
                  <div className="flex items-center gap-2.5 mb-2">
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200">
                      <FaSitemap className="h-4 w-4" />
                    </span>
                    <div className="min-w-0">
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">{row.nama_jabatan || row.name}</h4>
                      <p className="text-[10px] text-slate-500 font-mono">{row.kode_jabatan || row.code}</p>
                    </div>
                  </div>
                  <div className="space-y-1 text-[11px] text-slate-600 dark:text-slate-300">
                    <p><strong className="text-slate-400 font-normal">Level:</strong> Level {row.level_jabatan} ({row.level_label || '-'})</p>
                    <p><strong className="text-slate-400 font-normal">Satuan Kerja:</strong> {row.satuan_kerja || '-'}</p>
                    <p><strong className="text-slate-400 font-normal">Atasan:</strong> {row.atasan_langsung?.nama_jabatan || 'Pimpinan Tertinggi'}</p>
                    <p><strong className="text-slate-400 font-normal">Jumlah Pegawai:</strong> {row.jumlah_pegawai ?? 0} pegawai</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleOpenDetail(row)}
                    className="w-full py-1.5 bg-[#0E5C44] text-white text-[10px] font-bold uppercase tracking-wider rounded-lg transition-colors hover:bg-[#1E8E5A] mt-2.5 cursor-pointer"
                  >
                    Lihat Rincian Data
                  </button>
                </HoverCardContent>
              </HoverCard>
              <span className="flex min-w-0 items-center gap-1.5">
                <small className="truncate font-mono text-[10px] text-slate-400">{row.kode_jabatan || row.code}</small>
                {isTrashed && (
                  <span className="rounded bg-rose-100 px-1 py-0.2 text-[9px] font-bold text-rose-700">Terhapus</span>
                )}
                {isRowRestrictedForUser(row) && (
                  <span
                    className="rounded bg-amber-100/90 border border-amber-300/80 px-1.5 py-0.5 text-[9px] font-bold text-amber-800 dark:bg-amber-950/60 dark:border-amber-900 dark:text-amber-300"
                    title="Perubahan & Penghapusan dibatasi untuk role Kepala Sekolah"
                  >
                    Dibatasi (Yayasan)
                  </span>
                )}
              </span>
              <small className="mt-0.5 block truncate text-[10px] font-semibold text-emerald-700 dark:text-emerald-400">
                {row.jumlah_pegawai ?? 0} pegawai
              </small>
            </span>
          </div>
        )
      },
    },
    {
      key: 'level_jabatan',
      label: 'Unit & Level',
      className: 'hidden md:table-cell',
      render: (row) => (
        <div className="space-y-1">
          <span className="inline-block px-2.5 py-0.5 text-xs font-semibold rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
            Level {row.level_jabatan}: {row.level_label}
          </span>
          <p className="text-xs font-bold text-emerald-800 dark:text-emerald-400">{row.satuan_kerja || 'Belum ditentukan'}</p>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {row.unit_sekolah ? (
              <span className="font-medium text-slate-700 dark:text-slate-300">
                {row.unit_sekolah.nama} ({row.unit_sekolah.kode})
              </span>
            ) : (
              <span className="italic text-slate-400">{row.scope_akses_label || 'Cakupan belum ditentukan'}</span>
            )}
          </p>
        </div>
      ),
    },
    {
      key: 'atasan_langsung',
      label: 'Atasan Langsung',
      className: 'hidden lg:table-cell',
      render: (row) => row.atasan_langsung ? (
        <div className="font-medium text-slate-800 dark:text-slate-200 text-xs">
          {row.atasan_langsung.nama_jabatan}
          <span className="block text-[10px] text-slate-400 font-mono">
            ({row.atasan_langsung.kode_jabatan})
          </span>
        </div>
      ) : (
        <span className="text-slate-400 italic text-xs">Pimpinan Tertinggi</span>
      ),
    },
    {
      key: 'akses',
      label: 'Akses',
      className: 'hidden xl:table-cell text-center',
      render: (row) => (
        <div className="mx-auto flex max-w-28 flex-col items-stretch gap-1">
          {/* Tampil Struktur */}
          <span
            className={`inline-flex min-h-6 items-center gap-1.5 rounded-lg border px-2 text-[10px] font-semibold ${row.tampil_struktur
                ? 'border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
                : 'border-slate-200 bg-slate-100 text-slate-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400'
              }`}
            title="Visibilitas Bagan Struktur Organisasi"
          >
            <FaSitemap className="h-3 w-3 shrink-0" />
            <span className="truncate">{row.tampil_struktur ? 'Struktur' : 'Sembunyi'}</span>
          </span>

          {/* Boleh Login */}
          <span
            className={`inline-flex min-h-6 items-center gap-1.5 rounded-lg border px-2 text-[10px] font-semibold ${row.boleh_login
                ? 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300'
                : 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-900/30 dark:text-amber-300'
              }`}
            title="Hak Akses Login Akun Sistem"
          >
            {row.boleh_login ? <FaLockOpen className="h-3 w-3 shrink-0" /> : <FaLock className="h-3 w-3 shrink-0" />}
            <span className="truncate">{row.boleh_login ? 'Login' : 'Non-Login'}</span>
          </span>
        </div>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      className: 'hidden sm:table-cell text-center',
      render: (row) => row.terhapus ? (
        <span className="inline-flex items-center rounded-full bg-rose-100 px-2 py-0.5 text-[10px] font-bold text-rose-700 dark:bg-rose-950/60 dark:text-rose-400">
          Terhapus
        </span>
      ) : (
        <MasterStatusBadge active={row.status === 'Aktif' || row.is_active} inactiveLabel="Nonaktif" />
      ),
    },
  ]

  // Extra action for restoring soft deleted rows
  const extraActions = ({ row }) => {
    if (row.terhapus) {
      return (
        <button
          type="button"
          title="Pulihkan Data Jabatan"
          onClick={(e) => {
            e.stopPropagation()
            handleRestore(row)
          }}
          className="flex h-7 w-7 items-center justify-center rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-300 transition-colors cursor-pointer"
        >
          <FaRedo className="h-3.5 w-3.5" />
        </button>
      )
    }
    return null
  }

  // Mobile card view fallback
  const renderMobileCard = ({ row, onView, onEdit, onDelete }) => {
    const isRestricted = isRowRestrictedForUser(row)
    return (
      <div className={`rounded-[18px] border bg-white p-4 shadow-2xs dark:bg-[#1B2433] ${row.terhapus ? 'border-rose-200 dark:border-rose-900/50 bg-rose-50/20' : 'border-slate-200/80 dark:border-slate-700'}`}>
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-emerald-100 bg-emerald-50 text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/50 dark:text-emerald-300">
            <FaSitemap className="h-5 w-5" />
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-[13px] font-extrabold text-slate-900 dark:text-white">{row.nama_jabatan || row.name}</p>
                <p className="font-mono text-[10px] text-slate-400">{row.kode_jabatan || row.code}</p>
              </div>
              {row.terhapus ? (
                <span className="inline-flex items-center rounded-full bg-rose-100 px-2 py-0.5 text-[10px] font-bold text-rose-700">Terhapus</span>
              ) : isRestricted ? (
                <span className="inline-flex items-center rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-800 dark:bg-amber-950/60 dark:text-amber-300">Dibatasi</span>
              ) : (
                <MasterStatusBadge active={row.status === 'Aktif' || row.is_active} inactiveLabel="Nonaktif" />
              )}
            </div>
            <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-slate-500 dark:text-slate-400">
              <span>Level {row.level_jabatan}</span>
              <span>{row.satuan_kerja || 'Satuan Kerja -'}</span>
              <span className="font-bold text-emerald-700">{row.jumlah_pegawai ?? 0} pegawai</span>
            </div>
          </div>
        </div>
        <div className="mt-3 flex items-center justify-end gap-2 border-t border-slate-100 pt-2.5 dark:border-slate-800">
          {row.terhapus && (
            <button
              type="button"
              onClick={() => handleRestore(row)}
              className="flex items-center gap-1 text-xs font-bold text-emerald-600 hover:text-emerald-700 cursor-pointer"
            >
              <FaRedo className="h-3.5 w-3.5" />
              <span>Pulihkan</span>
            </button>
          )}
          <ActionDropdown
            onView={onView}
            onEdit={!row.terhapus && !isRestricted ? onEdit : undefined}
            onDelete={!row.terhapus && !isRestricted ? onDelete : undefined}
          />
        </div>
      </div>
    )
  }

  return (
    <PageContainer maxW="7xl" className="space-y-6 pb-12">
      {/* AppBreadcrumb */}
      <AppBreadcrumb items={[{ label: 'Master Data', to: '/dashboard/master-jabatan' }, { label: 'Master Jabatan' }]} />

      {/* KPI Stats Grid */}
      <MasterStatsGrid className="education-unit-kpis">
        <MasterStatCard icon={FaBriefcase} label="Total Jabatan" value={statsValue(statistik.total_jabatan ?? 0)} description="Terdaftar di sistem" variant="success" delay={40} loading={isLoading} />
        <MasterStatCard icon={FaCheckCircle} label="Jabatan Aktif" value={statsValue(statistik.aktif ?? 0)} description="Beroperasi saat ini" variant="info" delay={80} loading={isLoading} />
        <MasterStatCard icon={FaSitemap} label="Bagan Struktur" value={statsValue(statistik.tampil_struktur ?? 0)} description="Tampil di organisasi" variant="warning" delay={120} loading={isLoading} />
        <MasterStatCard icon={FaLockOpen} label="Akses Login" value={statsValue(statistik.boleh_login ?? 0)} description="Dapat memakai sistem" variant="neutral" delay={160} loading={isLoading} />
      </MasterStatsGrid>

      {/* AppDataTable following TAILGRIDS_TABLE_COMPONENT Gold Standard Benchmark */}
      <AppDataTable
        title="Data Jabatan"
        description="Daftar jabatan sesuai pencarian, cakupan unit, dan filter yang dipilih."
        actions={
          <div className="flex flex-wrap items-center gap-2">
            {/* Import Button (Soft Sky Blue Squircle) */}
            {canManageGlobalPositions && <div className="group relative inline-flex">
              <button
                type="button"
                title="Import Data Jabatan"
                aria-label="Import Data Jabatan"
                className="flex size-10 items-center justify-center rounded-2xl bg-sky-100/90 text-sky-500 hover:bg-sky-200/90 dark:bg-sky-950/50 dark:text-sky-400 dark:hover:bg-sky-900/70 transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer"
                onClick={() => setIsImportModalOpen(true)}
              >
                <Upload1 className="size-5" />
              </button>
              <div className="pointer-events-none absolute top-full left-1/2 mt-2 -translate-x-1/2 opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 transition-all duration-200 ease-out z-50 whitespace-nowrap rounded-lg bg-slate-900 px-2.5 py-1 text-[11px] font-bold text-white shadow-xl dark:bg-slate-100 dark:text-slate-900">
                <div className="absolute bottom-full left-1/2 -mb-1 -translate-x-1/2 border-4 border-transparent border-b-slate-900 dark:border-b-slate-100" />
                Import Data
              </div>
            </div>}

            {/* Export Button (Soft Amber Squircle) */}
            {canEditPosition && <div className="group relative inline-flex">
              <button
                type="button"
                title="Export Data Jabatan CSV"
                aria-label="Export Data Jabatan CSV"
                className="flex size-10 items-center justify-center rounded-2xl bg-amber-100/90 text-amber-600 hover:bg-amber-200/90 dark:bg-amber-950/50 dark:text-amber-400 dark:hover:bg-amber-900/70 transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer"
                onClick={handleExportExcel}
              >
                <Download1 className="size-5" />
              </button>
              <div className="pointer-events-none absolute top-full left-1/2 mt-2 -translate-x-1/2 opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 transition-all duration-200 ease-out z-50 whitespace-nowrap rounded-lg bg-slate-900 px-2.5 py-1 text-[11px] font-bold text-white shadow-xl dark:bg-slate-100 dark:text-slate-900">
                <div className="absolute bottom-full left-1/2 -mb-1 -translate-x-1/2 border-4 border-transparent border-b-slate-900 dark:border-b-slate-100" />
                Export CSV
              </div>
            </div>}

            {/* Tambah Jabatan Button (Soft Emerald Squircle) */}
            {canManageGlobalPositions && <div className="group relative inline-flex">
              <button
                type="button"
                title="Tambah Jabatan Baru"
                aria-label="Tambah Jabatan Baru"
                className="flex size-10 items-center justify-center rounded-2xl bg-emerald-100/90 text-emerald-600 hover:bg-emerald-200/90 dark:bg-emerald-950/50 dark:text-emerald-400 dark:hover:bg-emerald-900/70 transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer"
                onClick={handleOpenCreate}
              >
                <Plus className="size-5" />
              </button>
              <div className="pointer-events-none absolute top-full left-1/2 mt-2 -translate-x-1/2 opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 transition-all duration-200 ease-out z-50 whitespace-nowrap rounded-lg bg-slate-900 px-2.5 py-1 text-[11px] font-bold text-white shadow-xl dark:bg-slate-100 dark:text-slate-900">
                <div className="absolute bottom-full left-1/2 -mb-1 -translate-x-1/2 border-4 border-transparent border-b-slate-900 dark:border-b-slate-100" />
                Tambah Jabatan
              </div>
            </div>}
          </div>
        }
        columns={columns}
        data={daftarJabatan}
        keyField="id"
        isLoading={tableIsLoading}
        isError={isError}
        errorTitle="Data jabatan gagal dimuat"
        errorMessage="Periksa koneksi atau coba muat ulang data."
        onRetry={refetch}
        serverControlled
        search={search}
        onSearchChange={(val) => { setSearch(val); setPage(1) }}
        searchPlaceholder="Cari nama atau kode jabatan..."
        filters={
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5 min-w-0 flex-nowrap w-full">
            {/* Satuan Kerja filter */}
            <div className="relative shrink-0">
              <select
                value={selectedSatuanKerjaFilter}
                onChange={(e) => { setSelectedSatuanKerjaFilter(e.target.value); setPage(1) }}
                aria-label="Filter satuan kerja"
                className="h-9 cursor-pointer appearance-none rounded-xl border border-slate-200 bg-white pl-3 pr-8 text-xs font-semibold text-slate-700 shadow-2xs transition-all hover:border-slate-300 focus:border-[#0E5C44] focus:outline-none focus:ring-2 focus:ring-[#0E5C44]/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-slate-600"
              >
                <option value="">Semua Satuan Kerja</option>
                {(options.satuan_kerja || []).map((item) => {
                  const val = typeof item === 'object' ? (item.value ?? item.id ?? item.nama) : item
                  const lbl = typeof item === 'object' ? (item.label ?? item.nama ?? item.value) : item
                  return <option key={val} value={val}>{lbl}</option>
                })}
              </select>
              <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
            </div>

            {/* Level Jabatan filter */}
            <div className="relative shrink-0">
              <select
                value={selectedLevelFilter}
                onChange={(e) => { setSelectedLevelFilter(e.target.value); setPage(1) }}
                aria-label="Filter level jabatan"
                className="h-9 cursor-pointer appearance-none rounded-xl border border-slate-200 bg-white pl-3 pr-8 text-xs font-semibold text-slate-700 shadow-2xs transition-all hover:border-slate-300 focus:border-[#0E5C44] focus:outline-none focus:ring-2 focus:ring-[#0E5C44]/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-slate-600"
              >
                <option value="">Semua Level</option>
                {(options.level_jabatan || []).map((level) => {
                  const val = typeof level === 'object' ? (level.value ?? level.id ?? level.level) : level
                  const lbl = typeof level === 'object' ? (level.label ?? level.nama ?? `Level ${level}`) : `Level ${level}`
                  return <option key={val} value={val}>{lbl}</option>
                })}
              </select>
              <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
            </div>

            {/* Unit Sekolah filter */}
            <div className="relative shrink-0">
              <select
                value={selectedUnitFilter}
                onChange={(e) => { setSelectedUnitFilter(e.target.value); setPage(1) }}
                aria-label="Filter unit sekolah"
                className="h-9 cursor-pointer appearance-none rounded-xl border border-slate-200 bg-white pl-3 pr-8 text-xs font-semibold text-slate-700 shadow-2xs transition-all hover:border-slate-300 focus:border-[#0E5C44] focus:outline-none focus:ring-2 focus:ring-[#0E5C44]/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-slate-600"
              >
                <option value="">Semua Unit Sekolah</option>
                {(options.unit_sekolah || []).map((unit) => {
                  const val = typeof unit === 'object' ? (unit.id ?? unit.value) : unit
                  const lbl = typeof unit === 'object' ? (unit.nama ?? unit.name ?? unit.label) : unit
                  return <option key={val} value={val}>{lbl}</option>
                })}
              </select>
              <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
            </div>

            {/* Status filter */}
            <div className="relative shrink-0">
              <select
                value={selectedStatusFilter}
                onChange={(e) => { setSelectedStatusFilter(e.target.value); setPage(1) }}
                aria-label="Filter status jabatan"
                className="h-9 cursor-pointer appearance-none rounded-xl border border-slate-200 bg-white pl-3 pr-8 text-xs font-semibold text-slate-700 shadow-2xs transition-all hover:border-slate-300 focus:border-[#0E5C44] focus:outline-none focus:ring-2 focus:ring-[#0E5C44]/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-slate-600"
              >
                <option value="">Semua Status</option>
                <option value="Aktif">Aktif</option>
                <option value="Nonaktif">Nonaktif</option>
              </select>
              <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
            </div>

            {/* Cakupan Terhapus filter */}
            <div className="relative shrink-0">
              <select
                value={denganSampahFilter}
                onChange={(e) => { setDenganSampahFilter(e.target.value); setPage(1) }}
                aria-label="Filter data terhapus"
                className="h-9 cursor-pointer appearance-none rounded-xl border border-slate-200 bg-white pl-3 pr-8 text-xs font-semibold text-slate-700 shadow-2xs transition-all hover:border-slate-300 focus:border-[#0E5C44] focus:outline-none focus:ring-2 focus:ring-[#0E5C44]/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-slate-600"
              >
                <option value="">Data Aktif</option>
                <option value="ya">Termasuk Terhapus</option>
              </select>
              <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
            </div>

            {/* Per Page filter */}
            <div className="relative shrink-0">
              <select
                value={perPage}
                onChange={(e) => { setPerPage(Number(e.target.value)); setPage(1) }}
                aria-label="Tampilkan per halaman"
                className="h-9 cursor-pointer appearance-none rounded-xl border border-slate-200 bg-white pl-3 pr-7 text-xs font-semibold text-slate-700 shadow-2xs transition-all hover:border-slate-300 focus:border-[#0E5C44] focus:outline-none focus:ring-2 focus:ring-[#0E5C44]/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-slate-600"
              >
                <option value={5}>5 per halaman</option>
                <option value={10}>10 per halaman</option>
                <option value={15}>15 per halaman</option>
                <option value={25}>25 per halaman</option>
                <option value={50}>50 per halaman</option>
                <option value={100}>100 per halaman</option>
              </select>
              <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
            </div>

            {/* Reset button */}
            {!filtersAreClear && (
              <Button
                variant="ghost"
                appearance="outline"
                size="xs"
                onClick={handleResetFilters}
                className="h-9 shrink-0 px-2.5 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 border-rose-200 dark:border-rose-900/50"
              >
                <RefreshCcw className="size-3.5" />
                <span>Reset</span>
              </Button>
            )}
          </div>
        }
        onView={(row) => handleOpenDetail(row)}
        onEdit={(row) => canEditPosition && !row.terhapus && !isRowRestrictedForUser(row) ? handleOpenEdit(row) : undefined}
        onDelete={(row) => canManageGlobalPositions && !row.terhapus && !isRowRestrictedForUser(row) ? handleDelete(row) : undefined}
        extraActions={extraActions}
        renderMobileCard={renderMobileCard}
        showPagination
        page={paginationInfo.current_page}
        totalPages={paginationInfo.last_page}
        totalItems={paginationInfo.total}
        itemsPerPage={paginationInfo.per_page}
        onPageChange={(p) => setPage(p)}
        meta={paginationInfo}
        emptyTitle="Jabatan tidak ditemukan"
        emptyDescription="Coba sesuaikan kata kunci pencarian atau filter yang diterapkan."
        hasActiveFilters={!filtersAreClear}
        onResetFilters={handleResetFilters}
      />

      {/* Modals */}
      <JabatanFormModal
        isOpen={isFormModalOpen}
        onClose={() => {
          setIsFormModalOpen(false)
          setSelectedJabatanForEdit(null)
        }}
        onSubmit={handleFormSubmit}
        initialData={selectedJabatanForEdit}
        options={options}
        isSubmitting={simpanMutation.isPending || ubahMutation.isPending}
        isKepalaSekolah={isKepalaSekolah || canManageUnitPositions}
        isUnitScopedManager={canManageUnitPositions && !canManageGlobalPositions}
      />

      <JabatanDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false)
          setSelectedJabatanForDetail(null)
        }}
        jabatan={selectedJabatanForDetail}
      />

      <JabatanImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImport={(rows) => importMutation.mutate(rows)}
        isSubmitting={importMutation.isPending}
      />

      {/* Save / Edit Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showSaveConfirmModal}
        onClose={() => setShowSaveConfirmModal(false)}
        onConfirm={handleConfirmSaveForm}
        isLoading={simpanMutation.isPending || ubahMutation.isPending}
        action={selectedJabatanForEdit ? 'update' : 'create'}
        title={selectedJabatanForEdit ? 'Konfirmasi Ubah Jabatan' : 'Konfirmasi Simpan Jabatan'}
        message={selectedJabatanForEdit ? `Apakah Anda yakin ingin menyimpan perubahan data jabatan ${pendingSaveData?.name || pendingSaveData?.nama_jabatan}?` : `Apakah Anda yakin ingin menambahkan data jabatan baru ${pendingSaveData?.name || pendingSaveData?.nama_jabatan}?`}
      />

      {/* Delete Confirmation Dialog */}
      <MasterDeleteDialog
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
        isLoading={hapusMutation.isPending}
        title="Hapus Data Jabatan?"
        description={`Apakah Anda yakin ingin menghapus data jabatan ${deleteTarget?.nama_jabatan || deleteTarget?.name}? Data akan dipindahkan ke soft delete.`}
      />
    </PageContainer>
  )
}
