import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import Swal from 'sweetalert2'
import {
  CheckCircle2,
  ChevronDown,
  Download,
  FileSpreadsheet,
  FileText,
  GraduationCap,
  Plus,
  RefreshCcw,
  RotateCcw,
  School,
  Trash2,
  X,
} from 'lucide-react'
import { Download1, Upload1 } from '@tailgrids/icons'
import { jenisUnitService } from '../services/jenisUnitService'
import { renderJenisUnitIcon } from '../components/jenis-unit/JenisUnitTable'
import JenisUnitFormModal from '../components/jenis-unit/JenisUnitFormModal'
import JenisUnitDetailModal from '../components/jenis-unit/JenisUnitDetailModal'
import JenisUnitImportModal from '../components/jenis-unit/JenisUnitImportModal'
import PageContainer from '../components/app/PageContainer'
import AppBreadcrumb from '../components/app/AppBreadcrumb'
import AppDataTable from '../components/app/AppDataTable'
import ActionDropdown from '../components/app/ActionDropdown'
import { MasterStatusBadge, MasterStatCard, MasterStatsGrid } from '../components/master-data'
import { Button } from '@/components/tailgrids/core/button'
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '@/components/tailgrids/core/hover-card'

const JENJANG_LIST = ['PAUD', 'TK', 'SD', 'MI', 'SMP', 'MTs', 'SMA', 'MA', 'Pondok Pesantren', 'Mahad']

export default function MasterJenisUnitPendidikanPage() {
  const queryClient = useQueryClient()
  const [search, setSearch] = useState('')
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('')
  const [selectedJenjangFilter, setSelectedJenjangFilter] = useState('')
  const [denganSampahFilter, setDenganSampahFilter] = useState('')
  const [perPage, setPerPage] = useState(10)
  const [page, setPage] = useState(1)

  const [isFormModalOpen, setIsFormModalOpen] = useState(false)
  const [selectedForEdit, setSelectedForEdit] = useState(null)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
  const [selectedForDetail, setSelectedForDetail] = useState(null)
  const [isImportModalOpen, setIsImportModalOpen] = useState(false)
  const [importResult, setImportResult] = useState(null)
  const [showExportModal, setShowExportModal] = useState(false)
  const [exportFormat, setExportFormat] = useState('xlsx')
  const [isExporting, setIsExporting] = useState(false)
  const [notifications, setNotifications] = useState([])

  const pushNotification = (title, message, tone = 'success') => {
    const id = `${Date.now()}-${Math.random()}`
    setNotifications((current) => [...current, { id, title, message, tone }])
    window.setTimeout(() => {
      setNotifications((current) => current.filter((item) => item.id !== id))
    }, 6000)
  }

  const {
    data: responseData = {},
    isLoading,
    isFetching,
    isError,
    refetch,
  } = useQuery({
    queryKey: ['jenis-unit-list', page, perPage, search, selectedStatusFilter, selectedJenjangFilter, denganSampahFilter],
    queryFn: () => jenisUnitService.getDaftar({
      page,
      per_page: perPage,
      search,
      status: selectedStatusFilter,
      jenjang: selectedJenjangFilter,
      dengan_sampah: denganSampahFilter,
      order_by: 'urutan',
      order_dir: 'asc',
    }),
  })

  const listData = responseData?.data || []
  const meta = responseData?.meta || {}
  const stats = responseData?.statistik || {}

  const paginationInfo = {
    total: meta.total ?? listData.length,
    from: meta.from ?? (listData.length ? (page - 1) * perPage + 1 : 0),
    to: meta.to ?? ((page - 1) * perPage + listData.length),
    last_page: meta.last_page ?? 1,
    current_page: meta.current_page ?? page,
    per_page: meta.per_page ?? perPage,
  }

  const simpanMutation = useMutation({
    mutationFn: (payload) => jenisUnitService.tambah(payload),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['jenis-unit-list'] })
      setIsFormModalOpen(false)
      pushNotification('Berhasil Disimpan', res?.message || 'Jenis unit pendidikan berhasil ditambahkan.')
    },
    onError: (error) => Swal.fire('Gagal Menyimpan', error.response?.data?.message || 'Gagal menyimpan jenis unit pendidikan.', 'error'),
  })

  const ubahMutation = useMutation({
    mutationFn: ({ id, payload }) => jenisUnitService.ubah({ id, payload }),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['jenis-unit-list'] })
      setIsFormModalOpen(false)
      setSelectedForEdit(null)
      pushNotification('Berhasil Diubah', res?.message || 'Jenis unit pendidikan berhasil diperbarui.')
    },
    onError: (error) => Swal.fire('Gagal Memperbarui', error.response?.data?.message || 'Gagal memperbarui jenis unit pendidikan.', 'error'),
  })

  const hapusMutation = useMutation({
    mutationFn: (id) => jenisUnitService.hapus(id),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['jenis-unit-list'] })
      pushNotification('Berhasil Dihapus', res?.message || 'Jenis unit pendidikan berhasil dihapus.', 'danger')
    },
    onError: (error) => Swal.fire('Gagal Menghapus', error.response?.data?.message || 'Data yang sudah digunakan tidak dapat dihapus.', 'error'),
  })

  const pulihkanMutation = useMutation({
    mutationFn: (id) => jenisUnitService.pulihkan(id),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['jenis-unit-list'] })
      pushNotification('Berhasil Dipulihkan', res?.message || 'Jenis unit pendidikan berhasil dipulihkan.')
    },
    onError: (error) => Swal.fire('Gagal Memulihkan', error.response?.data?.message || 'Data gagal dipulihkan.', 'error'),
  })

  const importMutation = useMutation({
    mutationFn: (rows) => jenisUnitService.prosesImport(rows),
    onSuccess: (res, rows) => {
      queryClient.invalidateQueries({ queryKey: ['jenis-unit-list'] })
      const resultRows = res?.data?.rows || res?.data?.berhasil || rows
      setImportResult({
        rows: Array.isArray(resultRows) ? resultRows : rows,
        message: res?.message || 'Data jenis unit berhasil diimpor.',
      })
      pushNotification('Import Data Berhasil', `${Array.isArray(resultRows) ? resultRows.length : rows.length} data jenis unit berhasil diimpor.`)
    },
    onError: (error) => Swal.fire('Gagal Mengimpor', error.response?.data?.message || 'Gagal memproses impor data.', 'error'),
  })

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
      title: 'Hapus jenis unit?',
      text: `${item.nama_jenis} akan dihapus. Data yang sudah digunakan mungkin tidak dapat dihapus.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#e11d48',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Ya, Hapus',
      cancelButtonText: 'Batal',
    }).then((result) => {
      if (result.isConfirmed) hapusMutation.mutate(item.id || item.uuid)
    })
  }

  const handleFormSubmit = (payload) => {
    if (selectedForEdit) {
      ubahMutation.mutate({ id: selectedForEdit.id || selectedForEdit.uuid, payload })
    } else {
      simpanMutation.mutate(payload)
    }
  }

  const resetFilters = () => {
    setSearch('')
    setSelectedStatusFilter('')
    setSelectedJenjangFilter('')
    setDenganSampahFilter('')
    setPage(1)
  }

  const handleProcessExport = async () => {
    setIsExporting(true)
    try {
      const dataEkspor = await jenisUnitService.ekspor({
        search,
        status: selectedStatusFilter,
        jenjang: selectedJenjangFilter,
      })
      if (!dataEkspor?.length) {
        Swal.fire('Tidak Ada Data', 'Tidak ada data yang sesuai filter untuk diekspor.', 'info')
        return
      }

      const headers = ['NO', 'KODE JENIS', 'NAMA JENIS UNIT', 'SINGKATAN', 'JENJANG', 'WARNA BADGE', 'ICON', 'URUTAN', 'STATUS', 'KETERANGAN', 'TANGGAL DIBUAT']
      const csvRows = dataEkspor.map((row) => [
        row.no,
        row.kode_jenis,
        row.nama_jenis,
        row.singkatan,
        row.jenjang,
        row.warna_badge,
        row.icon,
        row.urutan,
        row.status,
        row.keterangan || '',
        row.created_at,
      ].map((value) => `"${String(value ?? '').replace(/"/g, '""')}"`).join(','))
      const blob = new Blob([[headers.join(','), ...csvRows].join('\n')], { type: 'text/csv;charset=utf-8;' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `export_jenis_unit_${new Date().toISOString().slice(0, 10)}.csv`
      link.click()
      URL.revokeObjectURL(url)
      setShowExportModal(false)
      pushNotification('Export Berhasil', `${dataEkspor.length} data berhasil disiapkan sebagai ${exportFormat === 'xlsx' ? 'CSV kompatibel Excel' : 'CSV'}.`)
    } catch {
      Swal.fire('Gagal Mengekspor', 'Data jenis unit gagal diunduh.', 'error')
    } finally {
      setIsExporting(false)
    }
  }

  const activeCount = stats.aktif ?? 0
  const inactiveCount = stats.tidak_aktif ?? 0
  const deletedCount = stats.terhapus ?? 0
  const totalCount = stats.total ?? 0
  const statsValue = (value) => (isError ? '—' : value)
  const tableIsLoading = isLoading || isFetching
  const filtersAreClear = !search && !selectedStatusFilter && !selectedJenjangFilter && !denganSampahFilter

  // Columns specification following TAILGRIDS_TABLE_COMPONENT benchmark
  const columns = [
    {
      key: 'nama_jenis',
      label: 'Identitas Jenis Unit',
      render: (row) => (
        <div className="flex min-w-0 items-center gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-emerald-100 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/50 dark:text-emerald-300 shadow-2xs">
            {renderJenisUnitIcon(row.icon, 'w-5 h-5')}
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
                title={row.nama_jenis}
              >
                {row.nama_jenis || '—'}
              </HoverCardTrigger>
              <HoverCardContent className="w-64 p-3.5 border border-slate-200 bg-white dark:border-slate-800 dark:bg-[#1B2433] shadow-xl rounded-xl">
                <div className="flex items-center gap-2.5 mb-2">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200">
                    {renderJenisUnitIcon(row.icon, 'w-4 h-4')}
                  </span>
                  <div className="min-w-0">
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">{row.nama_jenis}</h4>
                    <p className="text-[10px] text-slate-500">{row.kode_jenis} ({row.singkatan || '-'})</p>
                  </div>
                </div>
                <div className="space-y-1 text-[11px] text-slate-600 dark:text-slate-300">
                  <p><strong className="text-slate-400 font-normal">Jenjang:</strong> {row.jenjang || '-'}</p>
                  <p><strong className="text-slate-400 font-normal">Urutan Tampil:</strong> {row.urutan ?? '-'}</p>
                  <p className="truncate"><strong className="text-slate-400 font-normal">Keterangan:</strong> {row.keterangan || 'Tanpa keterangan'}</p>
                </div>
                <button
                  type="button"
                  onClick={() => handleOpenDetail(row)}
                  className="w-full py-1.5 bg-[#0E5C44] text-white text-[10px] font-bold uppercase tracking-wider rounded-lg transition-colors hover:bg-[#1E8E5A] mt-2.5"
                >
                  Lihat Rincian Data
                </button>
              </HoverCardContent>
            </HoverCard>
            <span className="flex min-w-0 items-center gap-1.5">
              <small className="truncate text-[10px] font-semibold text-emerald-800 dark:text-emerald-400">{row.kode_jenis} · {row.singkatan || '-'}</small>
            </span>
            <small className="mt-0.5 block truncate text-[10px] text-slate-400 md:hidden">
              {row.jenjang} · Urutan {row.urutan}
            </small>
          </span>
        </div>
      ),
    },
    {
      key: 'jenjang',
      label: 'Jenjang',
      className: 'hidden md:table-cell',
      render: (row) => (
        <span className="inline-flex rounded-lg border border-slate-200 bg-slate-100 px-2 py-1 text-[10px] font-extrabold text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200">
          {row.jenjang || '—'}
        </span>
      ),
    },
    {
      key: 'warna_badge',
      label: 'Visual',
      className: 'hidden xl:table-cell',
      render: (row) => {
        const badgeColor = row.warna_badge || '#10B981'
        return (
          <div className="flex items-center gap-2">
            <span className="inline-block h-4 w-4 shrink-0 rounded-full border border-slate-200 shadow-2xs" style={{ backgroundColor: badgeColor }} />
            <span className="font-mono text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400">{badgeColor}</span>
          </div>
        )
      },
    },
    {
      key: 'urutan',
      label: 'Urutan',
      className: 'hidden lg:table-cell text-center',
      render: (row) => (
        <span className="text-xs font-extrabold tabular-nums text-slate-700 dark:text-slate-200">
          {row.urutan ?? '—'}
        </span>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      className: 'hidden sm:table-cell text-center',
      render: (row) => row.is_deleted ? (
        <span className="inline-flex items-center rounded-full bg-rose-100 px-2 py-0.5 text-[10px] font-bold text-rose-700 dark:bg-rose-950/60 dark:text-rose-400">
          Terhapus
        </span>
      ) : (
        <MasterStatusBadge active={row.status} inactiveLabel="Tidak Aktif" />
      ),
    },
  ]

  // Extra actions per row (Restore button for deleted items)
  const extraActions = ({ row }) => {
    if (row.is_deleted) {
      return (
        <button
          type="button"
          title="Pulihkan Data"
          onClick={(e) => {
            e.stopPropagation()
            pulihkanMutation.mutate(row.id || row.uuid)
          }}
          className="flex h-7 w-7 items-center justify-center rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-300 transition-colors cursor-pointer"
        >
          <RotateCcw className="h-3.5 w-3.5" />
        </button>
      )
    }
    return null
  }

  // Mobile card view fallback
  const renderMobileCard = ({ row, onView, onEdit, onDelete }) => (
    <div className={`rounded-[18px] border bg-white p-4 shadow-2xs dark:bg-[#1B2433] ${row.is_deleted ? 'border-rose-200 dark:border-rose-900/50 bg-rose-50/20' : 'border-slate-200/80 dark:border-slate-700'}`}>
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-emerald-100 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/50 dark:text-emerald-300">
          {renderJenisUnitIcon(row.icon, 'w-5 h-5')}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-[13px] font-extrabold text-slate-900 dark:text-white">{row.nama_jenis}</p>
              <p className="text-[10px] font-semibold text-emerald-800 dark:text-emerald-400">{row.kode_jenis} · {row.singkatan || '-'}</p>
            </div>
            {row.is_deleted ? (
              <span className="inline-flex items-center rounded-full bg-rose-100 px-2 py-0.5 text-[10px] font-bold text-rose-700">Terhapus</span>
            ) : (
              <MasterStatusBadge active={row.status} inactiveLabel="Tidak Aktif" />
            )}
          </div>
          <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-slate-500 dark:text-slate-400">
            <span>Jenjang: {row.jenjang}</span>
            <span>Urutan: {row.urutan}</span>
          </div>
        </div>
      </div>
      <div className="mt-3 flex items-center justify-end gap-2 border-t border-slate-100 pt-2.5 dark:border-slate-800">
        {row.is_deleted && (
          <button
            type="button"
            onClick={() => pulihkanMutation.mutate(row.id || row.uuid)}
            className="flex items-center gap-1 text-xs font-bold text-emerald-600 hover:text-emerald-700"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Pulihkan</span>
          </button>
        )}
        <ActionDropdown
          onView={onView}
          onEdit={!row.is_deleted ? onEdit : undefined}
          onDelete={!row.is_deleted ? onDelete : undefined}
        />
      </div>
    </div>
  )

  return (
    <PageContainer maxW="7xl" className="space-y-6 pb-12">
      <AppBreadcrumb items={[{ label: 'Master Data', href: '/dashboard' }, { label: 'Jenis Unit Pendidikan' }]} />

      {/* KPI Stats Grid */}
      <MasterStatsGrid className="education-unit-kpis">
        <MasterStatCard icon={School} label="Total Jenis Unit" value={statsValue(totalCount)} description="Terdaftar di sistem" variant="success" delay={40} loading={isLoading} />
        <MasterStatCard icon={CheckCircle2} label="Jenis Aktif" value={statsValue(activeCount)} description="Dapat digunakan" variant="info" delay={80} loading={isLoading} />
        <MasterStatCard icon={RotateCcw} label="Tidak Aktif" value={statsValue(inactiveCount)} description="Dinonaktifkan" variant="warning" delay={120} loading={isLoading} />
        <MasterStatCard icon={Trash2} label="Data Terhapus" value={statsValue(deletedCount)} description="Tersimpan di arsip" variant="neutral" delay={160} loading={isLoading} />
      </MasterStatsGrid>

      {/* AppDataTable following TAILGRIDS_TABLE_COMPONENT Gold Standard */}
      <AppDataTable
        title="Daftar Jenis Unit Pendidikan"
        description="Kelola klasifikasi, jenjang, identitas visual, dan status jenis unit pendidikan Dar el-Iman."
        actions={
          <div className="flex flex-wrap items-center gap-2">
            {/* Import Button (Soft Sky Blue Squircle) */}
            <div className="group relative inline-flex">
              <button
                type="button"
                title="Import Data Jenis Unit"
                aria-label="Import Data Jenis Unit"
                className="flex size-10 items-center justify-center rounded-2xl bg-sky-100/90 text-sky-500 hover:bg-sky-200/90 dark:bg-sky-950/50 dark:text-sky-400 dark:hover:bg-sky-900/70 transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer"
                onClick={() => { setImportResult(null); setIsImportModalOpen(true) }}
              >
                <Upload1 className="size-5" />
              </button>
              <div className="pointer-events-none absolute top-full left-1/2 mt-2 -translate-x-1/2 opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 transition-all duration-200 ease-out z-50 whitespace-nowrap rounded-lg bg-slate-900 px-2.5 py-1 text-[11px] font-bold text-white shadow-xl dark:bg-slate-100 dark:text-slate-900">
                <div className="absolute bottom-full left-1/2 -mb-1 -translate-x-1/2 border-4 border-transparent border-b-slate-900 dark:border-b-slate-100" />
                Import Data
              </div>
            </div>

            {/* Export Button (Soft Amber Squircle) */}
            <div className="group relative inline-flex">
              <button
                type="button"
                title="Export Data Jenis Unit"
                aria-label="Export Data Jenis Unit"
                className="flex size-10 items-center justify-center rounded-2xl bg-amber-100/90 text-amber-600 hover:bg-amber-200/90 dark:bg-amber-950/50 dark:text-amber-400 dark:hover:bg-amber-900/70 transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer"
                onClick={() => setShowExportModal(true)}
              >
                <Download1 className="size-5" />
              </button>
              <div className="pointer-events-none absolute top-full left-1/2 mt-2 -translate-x-1/2 opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 transition-all duration-200 ease-out z-50 whitespace-nowrap rounded-lg bg-slate-900 px-2.5 py-1 text-[11px] font-bold text-white shadow-xl dark:bg-slate-100 dark:text-slate-900">
                <div className="absolute bottom-full left-1/2 -mb-1 -translate-x-1/2 border-4 border-transparent border-b-slate-900 dark:border-b-slate-100" />
                Export Data
              </div>
            </div>

            {/* Tambah Jenis Unit Button (Soft Emerald Squircle) */}
            <div className="group relative inline-flex">
              <button
                type="button"
                title="Tambah Jenis Unit Baru"
                aria-label="Tambah Jenis Unit Baru"
                className="flex size-10 items-center justify-center rounded-2xl bg-emerald-100/90 text-emerald-600 hover:bg-emerald-200/90 dark:bg-emerald-950/50 dark:text-emerald-400 dark:hover:bg-emerald-900/70 transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer"
                onClick={handleOpenFormTambah}
              >
                <Plus className="size-5" />
              </button>
              <div className="pointer-events-none absolute top-full left-1/2 mt-2 -translate-x-1/2 opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 transition-all duration-200 ease-out z-50 whitespace-nowrap rounded-lg bg-slate-900 px-2.5 py-1 text-[11px] font-bold text-white shadow-xl dark:bg-slate-100 dark:text-slate-900">
                <div className="absolute bottom-full left-1/2 -mb-1 -translate-x-1/2 border-4 border-transparent border-b-slate-900 dark:border-b-slate-100" />
                Tambah Jenis Unit
              </div>
            </div>
          </div>
        }
        columns={columns}
        data={listData}
        keyField="id"
        isLoading={tableIsLoading}
        isError={isError}
        errorTitle="Data jenis unit gagal dimuat"
        errorMessage="Periksa koneksi atau coba muat ulang data."
        onRetry={refetch}
        serverControlled
        search={search}
        onSearchChange={(val) => { setSearch(val); setPage(1) }}
        searchPlaceholder="Cari kode, nama jenis unit, atau singkatan..."
        filters={
          <div className="flex flex-wrap items-center gap-2">
            {/* Status filter */}
            <div className="relative">
              <select
                value={selectedStatusFilter}
                onChange={(e) => { setSelectedStatusFilter(e.target.value); setPage(1) }}
                aria-label="Filter status jenis unit"
                className="h-10 cursor-pointer appearance-none rounded-xl border border-slate-200 bg-white pl-3.5 pr-8 text-xs font-semibold text-slate-700 shadow-2xs transition-all hover:border-slate-300 focus:border-[#0E5C44] focus:outline-none focus:ring-2 focus:ring-[#0E5C44]/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-slate-600"
              >
                <option value="">Semua Status</option>
                <option value="true">Aktif</option>
                <option value="false">Tidak Aktif</option>
              </select>
              <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
            </div>

            {/* Jenjang filter */}
            <div className="relative">
              <select
                value={selectedJenjangFilter}
                onChange={(e) => { setSelectedJenjangFilter(e.target.value); setPage(1) }}
                aria-label="Filter jenjang pendidikan"
                className="h-10 cursor-pointer appearance-none rounded-xl border border-slate-200 bg-white pl-3.5 pr-8 text-xs font-semibold text-slate-700 shadow-2xs transition-all hover:border-slate-300 focus:border-[#0E5C44] focus:outline-none focus:ring-2 focus:ring-[#0E5C44]/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-slate-600"
              >
                <option value="">Semua Jenjang</option>
                {JENJANG_LIST.map((jenjang) => <option key={jenjang} value={jenjang}>{jenjang}</option>)}
              </select>
              <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
            </div>

            {/* Cakupan data filter */}
            <div className="relative">
              <select
                value={denganSampahFilter}
                onChange={(e) => { setDenganSampahFilter(e.target.value); setPage(1) }}
                aria-label="Filter cakupan data jenis unit"
                className="h-10 cursor-pointer appearance-none rounded-xl border border-slate-200 bg-white pl-3.5 pr-8 text-xs font-semibold text-slate-700 shadow-2xs transition-all hover:border-slate-300 focus:border-[#0E5C44] focus:outline-none focus:ring-2 focus:ring-[#0E5C44]/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-slate-600"
              >
                <option value="">Data Aktif</option>
                <option value="true">Termasuk Terhapus</option>
              </select>
              <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
            </div>

            {/* Per Page filter */}
            <div className="relative">
              <select
                value={perPage}
                onChange={(e) => { setPerPage(Number(e.target.value)); setPage(1) }}
                aria-label="Tampilkan per halaman"
                className="h-10 cursor-pointer appearance-none rounded-xl border border-slate-200 bg-white pl-3.5 pr-8 text-xs font-semibold text-slate-700 shadow-2xs transition-all hover:border-slate-300 focus:border-[#0E5C44] focus:outline-none focus:ring-2 focus:ring-[#0E5C44]/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-slate-600"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={15}>15</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
              <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
            </div>

            {/* Reset button */}
            {!filtersAreClear && (
              <Button
                variant="ghost"
                appearance="outline"
                size="xs"
                onClick={resetFilters}
              >
                <RefreshCcw />
                <span>Reset</span>
              </Button>
            )}
          </div>
        }
        onView={(row) => handleOpenDetail(row)}
        onEdit={(row) => !row.is_deleted ? handleOpenFormEdit(row) : undefined}
        onDelete={(row) => !row.is_deleted ? handleConfirmDelete(row) : undefined}
        extraActions={extraActions}
        renderMobileCard={renderMobileCard}
        showPagination
        page={paginationInfo.current_page}
        totalPages={paginationInfo.last_page}
        totalItems={paginationInfo.total}
        itemsPerPage={paginationInfo.per_page}
        onPageChange={(p) => setPage(p)}
        meta={paginationInfo}
        emptyTitle="Jenis unit tidak ditemukan"
        emptyDescription="Ubah pencarian atau filter, lalu coba kembali."
        hasActiveFilters={!filtersAreClear}
        onResetFilters={resetFilters}
      />

      <JenisUnitFormModal isOpen={isFormModalOpen} onClose={() => { setIsFormModalOpen(false); setSelectedForEdit(null) }} onSubmit={handleFormSubmit} initialData={selectedForEdit} isSubmitting={simpanMutation.isPending || ubahMutation.isPending} />
      <JenisUnitDetailModal isOpen={isDetailModalOpen} onClose={() => setIsDetailModalOpen(false)} data={selectedForDetail} onEdit={() => { setIsDetailModalOpen(false); handleOpenFormEdit(selectedForDetail) }} />
      <JenisUnitImportModal isOpen={isImportModalOpen} onClose={() => { setIsImportModalOpen(false); setImportResult(null) }} onImport={(rows) => importMutation.mutate(rows)} isSubmitting={importMutation.isPending} result={importResult} />

      {showExportModal && (
        <div className="education-unit-popup fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm" role="dialog" aria-modal="true">
          <section className="w-full max-w-lg overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-700 dark:bg-[#1B2433]">
            <header className="flex items-center justify-between border-b border-slate-100 px-5 py-4 dark:border-slate-700"><div><h2 className="text-base font-bold text-slate-900 dark:text-white">Export Data Jenis Unit</h2><p className="text-[11px] text-slate-500">Pilih format data yang akan diunduh.</p></div><button type="button" onClick={() => setShowExportModal(false)}><X className="h-5 w-5" /></button></header>
            <div className="grid gap-3 p-5 sm:grid-cols-2">{[['xlsx', 'Excel-compatible CSV', FileSpreadsheet], ['csv', 'CSV (.csv)', FileText]].map(([value, label, Icon]) => <button key={value} type="button" onClick={() => setExportFormat(value)} className={`rounded-xl border p-4 text-left ${exportFormat === value ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950/30' : 'border-slate-200 dark:border-slate-700'}`}><span className="flex items-center gap-2 text-xs font-bold dark:text-white"><Icon className="h-4 w-4 text-emerald-700" />{label}</span><small className="mt-1 block text-[10px] text-slate-500">Data sesuai filter aktif</small></button>)}</div>
            <footer className="flex justify-end gap-2 border-t border-slate-100 px-5 py-3 dark:border-slate-700"><button type="button" onClick={() => setShowExportModal(false)} className="h-10 rounded-xl border border-slate-200 px-4 text-xs font-semibold dark:border-slate-700">Batal</button><button type="button" disabled={isExporting} onClick={handleProcessExport} className="inline-flex h-10 items-center gap-2 rounded-xl bg-emerald-800 px-4 text-xs font-semibold text-white disabled:opacity-50"><Download className="h-4 w-4" />{isExporting ? 'Menyiapkan...' : 'Export'}</button></footer>
          </section>
        </div>
      )}

      <section className="pointer-events-none fixed bottom-5 right-5 z-[70] grid w-[min(360px,calc(100vw-2rem))] gap-2" aria-live="polite">
        {notifications.map((notification) => (
          <article key={notification.id} className={`pointer-events-auto edu-toast flex items-start gap-3 rounded-xl border bg-white p-4 shadow-xl dark:bg-[#1B2433] ${notification.tone === 'danger' ? 'border-rose-200' : 'border-emerald-200'}`}>
            <span className={`flex h-9 w-9 items-center justify-center rounded-full ${notification.tone === 'danger' ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'}`}>{notification.tone === 'danger' ? <Trash2 className="h-4 w-4" /> : <CheckCircle2 className="h-5 w-5" />}</span>
            <div className="flex-1"><strong className="block text-xs font-bold text-slate-900 dark:text-white">{notification.title}</strong><p className="mt-1 text-[11px] text-slate-500">{notification.message}</p></div>
            <button type="button" onClick={() => setNotifications((current) => current.filter((item) => item.id !== notification.id))}><X className="h-4 w-4 text-slate-400" /></button>
          </article>
        ))}
      </section>
    </PageContainer>
  )
}
