import React, { useState, useMemo } from 'react'
import {
  Layers,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Clock,
  RefreshCcw,
  FileSpreadsheet,
  TrendingUp,
  Award,
  Building2,
  Trash2,
  ChevronDown,
  Calendar,
  FileText,
  X,
} from 'lucide-react'
import { Download1, Upload1 } from '@tailgrids/icons'

import PageContainer from '../components/app/PageContainer'
import AppBreadcrumb from '../components/app/AppBreadcrumb'
import AppPageHeader from '../components/app/AppPageHeader'
import AppDataTable from '../components/app/AppDataTable'
import ActionDropdown from '../components/app/ActionDropdown'
import { MasterStatCard, MasterStatsGrid } from '../components/master-data'

import { useDaftarPemantauanDivisi, useAksiPemantauanDivisi } from '../hooks/useDashboardPemantauan'
import PemantauanDivisiFormModal from '../components/pemantauan/PemantauanDivisiFormModal'

import { AlertDialog } from '@/components/tailgrids/core/alert-dialog'
import { DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/tailgrids/core/dialog'
import { Backdrop, OverlayWrapper } from '@/components/tailgrids/core/overlay'
import { Button } from '@/components/tailgrids/core/button'
import { Badge } from '@/components/tailgrids/core/badge'
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '@/components/tailgrids/core/hover-card'

const STATUS_MAP = {
  proses: { label: 'Dalam Proses', color: 'sky' },
  tercapai: { label: 'Tercapai', color: 'success' },
  terlambat: { label: 'Terlambat', color: 'warning' },
  belum_tercapai: { label: 'Belum Tercapai', color: 'error' },
}

export default function MonitoringDivisiPage() {
  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useState(15)
  const [search, setSearch] = useState('')
  const [filterDivisi, setFilterDivisi] = useState('')
  const [filterStatus, setFilterStatus] = useState('')

  // Form Modal State
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [selectedRecord, setSelectedRecord] = useState(null)

  // Delete Modal State
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [deleteTargetId, setDeleteTargetId] = useState(null)

  // React Query Hooks
  const { data, isLoading, isError, refetch } = useDaftarPemantauanDivisi({
    page,
    per_page: perPage,
    search: search || undefined,
  })

  const { tambah, ubah, hapus } = useAksiPemantauanDivisi()

  const rawItems = data?.data || []
  const pagination = {
    currentPage: data?.current_page || page,
    totalPages: data?.last_page || 1,
    totalRecords: data?.total || rawItems.length,
    from: data?.from || 1,
    to: data?.to || rawItems.length,
  }

  // Filter client side additional if needed
  const filteredItems = useMemo(() => {
    return rawItems.filter((item) => {
      if (filterDivisi && item.nama_divisi !== filterDivisi) return false
      if (filterStatus && item.status_pemantauan !== filterStatus) return false
      return true
    })
  }, [rawItems, filterDivisi, filterStatus])

  const hasActiveFilters = Boolean(search || filterDivisi || filterStatus)

  const resetFilters = () => {
    setSearch('')
    setFilterDivisi('')
    setFilterStatus('')
    setPage(1)
  }

  // Export CSV Handler
  const handleExportCsv = () => {
    if (filteredItems.length === 0) return
    const headers = ['ID', 'Nama Divisi', 'Aspek Pemantauan', 'Capaian (%)', 'Status Pemantauan', 'Tanggal', 'Catatan']
    const rows = filteredItems.map((item) => [
      item.id || '',
      `"${(item.nama_divisi || '').replace(/"/g, '""')}"`,
      `"${(item.aspek_pemantauan || '').replace(/"/g, '""')}"`,
      item.persentase_capaian || 0,
      item.status_pemantauan || '',
      item.tanggal_pemantauan || '',
      `"${(item.catatan || '').replace(/"/g, '""')}"`,
    ])

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n')
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', `monitoring_divisi_${new Date().toISOString().split('T')[0]}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // KPI Statistics Calculation
  const totalCount = pagination.totalRecords
  const tercapaiCount = rawItems.filter((i) => i.status_pemantauan === 'tercapai').length
  const prosesCount = rawItems.filter((i) => i.status_pemantauan === 'proses').length
  const perluPerhatianCount = rawItems.filter((i) => ['terlambat', 'belum_tercapai'].includes(i.status_pemantauan)).length
  const avgCapaian = rawItems.length > 0
    ? Math.round(rawItems.reduce((acc, curr) => acc + (Number(curr.persentase_capaian) || 0), 0) / rawItems.length)
    : 0

  // Modal Action Handlers
  const handleOpenCreate = () => {
    setSelectedRecord(null)
    setIsFormOpen(true)
  }

  const handleOpenEdit = (record) => {
    setSelectedRecord(record)
    setIsFormOpen(true)
  }

  const handleOpenDelete = (id) => {
    setDeleteTargetId(id)
    setIsDeleteOpen(true)
  }

  const handleFormSubmit = async (formData) => {
    if (selectedRecord?.id) {
      await ubah.mutateAsync(
        { id: selectedRecord.id, payload: formData },
        {
          onSuccess: () => {
            setIsFormOpen(false)
            refetch()
          },
        }
      )
    } else {
      await tambah.mutateAsync(formData, {
        onSuccess: () => {
          setIsFormOpen(false)
          refetch()
        },
      })
    }
  }

  const handleConfirmDelete = async () => {
    if (!deleteTargetId) return
    await hapus.mutateAsync(deleteTargetId, {
      onSuccess: () => {
        setIsDeleteOpen(false)
        setDeleteTargetId(null)
        refetch()
      },
    })
  }

  // AppDataTable Columns Definition with HoverCard
  const columns = [
    {
      key: 'nama_divisi',
      label: 'NAMA DIVISI',
      render: (row) => (
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-100/80 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400 font-black">
            <Building2 className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <HoverCard>
              <HoverCardTrigger
                onClick={(e) => {
                  e.preventDefault()
                  handleOpenEdit(row)
                }}
                className="inline-block max-w-full truncate text-[13px] font-extrabold text-slate-900 dark:text-white border-b border-dashed border-slate-400/60 hover:border-emerald-600 transition-colors cursor-pointer"
              >
                {row.nama_divisi || '-'}
              </HoverCardTrigger>
              <HoverCardContent className="w-80 p-4 bg-white dark:bg-[#1B2433] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl space-y-2 z-50">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-xs font-bold text-slate-800 dark:text-white flex items-center gap-1.5">
                    <Building2 className="h-3.5 w-3.5 text-emerald-600" />
                    {row.nama_divisi}
                  </span>
                  <Badge color={STATUS_MAP[row.status_pemantauan]?.color || 'gray'} size="sm">
                    {STATUS_MAP[row.status_pemantauan]?.label || row.status_pemantauan}
                  </Badge>
                </div>
                <div className="space-y-1.5 text-[11px] text-slate-600 dark:text-slate-300">
                  <p><strong className="text-slate-900 dark:text-white">Aspek Pemantauan:</strong> {row.aspek_pemantauan || '-'}</p>
                  <p><strong className="text-slate-900 dark:text-white">Capaian:</strong> {row.persentase_capaian || 0}%</p>
                  {row.tanggal_pemantauan && (
                    <p><strong className="text-slate-900 dark:text-white">Tanggal Supervisi:</strong> {new Date(row.tanggal_pemantauan).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                  )}
                  {row.catatan && (
                    <div className="mt-1 pt-1.5 border-t border-slate-100 dark:border-slate-800 text-slate-500 italic">
                      "{row.catatan}"
                    </div>
                  )}
                </div>
              </HoverCardContent>
            </HoverCard>
            <p className="text-[11px] text-slate-400">Unit Operasional</p>
          </div>
        </div>
      ),
    },
    {
      key: 'aspek_pemantauan',
      label: 'ASPEK PEMANTAUAN',
      render: (row) => (
        <div>
          <p className="font-bold text-slate-800 dark:text-slate-200 text-xs">{row.aspek_pemantauan || '-'}</p>
          {row.catatan && (
            <p className="text-[11px] text-slate-400 line-clamp-1 italic max-w-xs">{row.catatan}</p>
          )}
        </div>
      ),
    },
    {
      key: 'persentase_capaian',
      label: 'CAPAIAN (%)',
      render: (row) => {
        const val = Number(row.persentase_capaian) || 0
        const barColor = val >= 80 ? 'bg-emerald-500' : val >= 50 ? 'bg-amber-500' : 'bg-rose-500'
        return (
          <div className="w-36 space-y-1">
            <div className="flex justify-between text-xs font-bold text-slate-700 dark:text-slate-200">
              <span>{val}%</span>
              <span className="text-[10px] text-slate-400">{val >= 100 ? 'Selesai' : 'Target'}</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
              <div className={`h-full rounded-full transition-all duration-300 ${barColor}`} style={{ width: `${Math.min(val, 100)}%` }} />
            </div>
          </div>
        )
      },
    },
    {
      key: 'status_pemantauan',
      label: 'STATUS',
      render: (row) => {
        const conf = STATUS_MAP[row.status_pemantauan] || { label: row.status_pemantauan || 'proses', color: 'gray' }
        return (
          <Badge color={conf.color} size="sm">
            {conf.label}
          </Badge>
        )
      },
    },
    {
      key: 'tanggal_pemantauan',
      label: 'TANGGAL',
      render: (row) => (
        <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300 font-semibold">
          <Calendar className="h-3.5 w-3.5 text-slate-400" />
          <span>
            {row.tanggal_pemantauan
              ? new Date(row.tanggal_pemantauan).toLocaleDateString('id-ID', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                })
              : '-'}
          </span>
        </div>
      ),
    },
    {
      key: 'aksi',
      label: 'AKSI',
      headerProps: { className: 'text-right' },
      cellProps: { className: 'text-right' },
      render: (row) => (
        <ActionDropdown
          onEdit={() => handleOpenEdit(row)}
          onDelete={() => handleOpenDelete(row.id)}
        />
      ),
    },
  ]

  // Filter Bar Controls for AppDataTable (Row 3 Toolbar)
  const renderFilterControls = (
    <>
      {/* Filter Divisi */}
      <div className="relative">
        <select
          value={filterDivisi}
          onChange={(e) => setFilterDivisi(e.target.value)}
          className="h-10 cursor-pointer appearance-none rounded-xl border border-slate-200 bg-white pl-3.5 pr-8 text-xs font-semibold text-slate-700 shadow-2xs transition-all hover:border-slate-300 focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-600/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-slate-600"
        >
          <option value="">Semua Divisi</option>
          <option value="Divisi Pendidikan">Divisi Pendidikan</option>
          <option value="Divisi Kurikulum">Divisi Kurikulum</option>
          <option value="Divisi Kesiswaan">Divisi Kesiswaan</option>
          <option value="Divisi Tahfizh">Divisi Tahfizh</option>
          <option value="Divisi Bahasa">Divisi Bahasa</option>
          <option value="Tata Usaha">Tata Usaha</option>
          <option value="HRD & Kepegawaian">HRD & Kepegawaian</option>
          <option value="Keuangan">Keuangan</option>
          <option value="Sarana & Prasarana">Sarana & Prasarana</option>
        </select>
        <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
      </div>

      {/* Filter Status */}
      <div className="relative">
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="h-10 cursor-pointer appearance-none rounded-xl border border-slate-200 bg-white pl-3.5 pr-8 text-xs font-semibold text-slate-700 shadow-2xs transition-all hover:border-slate-300 focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-600/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-slate-600"
        >
          <option value="">Semua Status</option>
          <option value="proses">Dalam Proses</option>
          <option value="tercapai">Tercapai</option>
          <option value="terlambat">Terlambat</option>
          <option value="belum_tercapai">Belum Tercapai</option>
        </select>
        <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
      </div>

      {/* Select Per Halaman */}
      <div className="relative">
        <select
          value={perPage}
          onChange={(e) => {
            setPerPage(Number(e.target.value))
            setPage(1)
          }}
          className="h-10 cursor-pointer appearance-none rounded-xl border border-slate-200 bg-white pl-3.5 pr-8 text-xs font-semibold text-slate-700 shadow-2xs transition-all hover:border-slate-300 focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-600/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-slate-600"
        >
          <option value={5}>5 Per Halaman</option>
          <option value={10}>10 Per Halaman</option>
          <option value={15}>15 Per Halaman</option>
          <option value={25}>25 Per Halaman</option>
          <option value={50}>50 Per Halaman</option>
          <option value={100}>100 Per Halaman</option>
        </select>
        <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
      </div>

      {/* Reset Filter Button */}
      {hasActiveFilters && (
        <button
          type="button"
          onClick={resetFilters}
          className="inline-flex h-10 items-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50/80 px-3 text-xs font-bold text-rose-600 hover:bg-rose-100 transition-colors dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-400 cursor-pointer"
        >
          <X className="h-3.5 w-3.5" />
          Reset Filter
        </button>
      )}
    </>
  )

  // Soft Pastel Action Buttons for AppDataTable (Row 1 Header)
  const renderActionButtons = (
    <div className="flex items-center gap-2">
      {/* Export CSV / Excel Button */}
      <div className="group relative inline-flex">
        <button
          type="button"
          title="Export CSV/Excel"
          aria-label="Export CSV/Excel"
          onClick={handleExportCsv}
          className="flex size-10 items-center justify-center rounded-2xl bg-amber-100/90 text-amber-600 hover:bg-amber-200/90 dark:bg-amber-950/50 dark:text-amber-400 dark:hover:bg-amber-900/70 transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer"
        >
          <Download1 className="size-5" />
        </button>
        <div className="pointer-events-none absolute top-full left-1/2 mt-2 -translate-x-1/2 opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 transition-all duration-200 ease-out z-50 whitespace-nowrap rounded-lg bg-slate-900 px-2.5 py-1 text-[11px] font-bold text-white shadow-xl dark:bg-slate-100 dark:text-slate-900">
          <div className="absolute bottom-full left-1/2 -mb-1 -translate-x-1/2 border-4 border-transparent border-b-slate-900 dark:border-b-slate-100" />
          Export CSV/Excel
        </div>
      </div>

      {/* Segarkan Data Button */}
      <div className="group relative inline-flex">
        <button
          type="button"
          title="Segarkan Data"
          aria-label="Segarkan Data"
          onClick={() => refetch()}
          className="flex size-10 items-center justify-center rounded-2xl bg-sky-100/90 text-sky-500 hover:bg-sky-200/90 dark:bg-sky-950/50 dark:text-sky-400 dark:hover:bg-sky-900/70 transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer"
        >
          <RefreshCcw className="size-5" />
        </button>
        <div className="pointer-events-none absolute top-full left-1/2 mt-2 -translate-x-1/2 opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 transition-all duration-200 ease-out z-50 whitespace-nowrap rounded-lg bg-slate-900 px-2.5 py-1 text-[11px] font-bold text-white shadow-xl dark:bg-slate-100 dark:text-slate-900">
          <div className="absolute bottom-full left-1/2 -mb-1 -translate-x-1/2 border-4 border-transparent border-b-slate-900 dark:border-b-slate-100" />
          Segarkan Data
        </div>
      </div>

      {/* Tambah Pemantauan Button */}
      <div className="group relative inline-flex">
        <button
          type="button"
          title="Tambah Pemantauan Divisi"
          aria-label="Tambah Pemantauan Divisi"
          onClick={handleOpenCreate}
          className="flex size-10 items-center justify-center rounded-2xl bg-emerald-100/90 text-emerald-600 hover:bg-emerald-200/90 dark:bg-emerald-950/50 dark:text-emerald-400 dark:hover:bg-emerald-900/70 transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer"
        >
          <Plus className="size-5" />
        </button>
        <div className="pointer-events-none absolute top-full left-1/2 mt-2 -translate-x-1/2 opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 transition-all duration-200 ease-out z-50 whitespace-nowrap rounded-lg bg-slate-900 px-2.5 py-1 text-[11px] font-bold text-white shadow-xl dark:bg-slate-100 dark:text-slate-900">
          <div className="absolute bottom-full left-1/2 -mb-1 -translate-x-1/2 border-4 border-transparent border-b-slate-900 dark:border-b-slate-100" />
          Tambah Pemantauan Divisi
        </div>
      </div>
    </div>
  )

  // Mobile Data Card Fallback Renderer
  const renderMobileCard = ({ row }) => (
    <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900 space-y-3">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400 font-bold">
            <Building2 className="h-4 w-4" />
          </div>
          <div>
            <h4 className="font-extrabold text-slate-900 dark:text-white text-sm">{row.nama_divisi || '-'}</h4>
            <p className="text-[11px] text-slate-400">{row.aspek_pemantauan || '-'}</p>
          </div>
        </div>
        <Badge color={STATUS_MAP[row.status_pemantauan]?.color || 'gray'} size="sm">
          {STATUS_MAP[row.status_pemantauan]?.label || row.status_pemantauan}
        </Badge>
      </div>

      <div className="space-y-1">
        <div className="flex justify-between text-xs font-bold text-slate-700 dark:text-slate-200">
          <span>Capaian Kinerja</span>
          <span>{row.persentase_capaian || 0}%</span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
          <div
            className={`h-full rounded-full transition-all duration-300 ${
              Number(row.persentase_capaian) >= 80
                ? 'bg-emerald-500'
                : Number(row.persentase_capaian) >= 50
                ? 'bg-amber-500'
                : 'bg-rose-500'
            }`}
            style={{ width: `${Math.min(Number(row.persentase_capaian) || 0, 100)}%` }}
          />
        </div>
      </div>

      {row.catatan && (
        <p className="text-xs text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-xl italic">
          "{row.catatan}"
        </p>
      )}

      <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
        <span className="text-[11px] text-slate-400 font-medium">
          {row.tanggal_pemantauan
            ? new Date(row.tanggal_pemantauan).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
            : '-'}
        </span>
        <div className="flex items-center gap-1">
          <Button
            type="button"
            variant="ghost"
            size="xs"
            onClick={() => handleOpenEdit(row)}
            className="text-xs font-bold text-slate-600 hover:text-emerald-600"
          >
            Ubah
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="xs"
            onClick={() => handleOpenDelete(row.id)}
            className="text-xs font-bold text-rose-600 hover:bg-rose-50"
          >
            Hapus
          </Button>
        </div>
      </div>
    </div>
  )

  return (
    <PageContainer maxW="7xl">
      <div className="space-y-6 pb-12 ui-enter">
        {/* Breadcrumb Navigation */}
        <AppBreadcrumb items={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Monitoring Divisi' }]} />



        {/* KPI Stats Grid with Yayasan Menu animation cards & Status Labels */}
        <MasterStatsGrid cols={4}>
          <MasterStatCard
            label="Total Pemantauan"
            value={totalCount}
            description="Catatan supervisi aktif"
            badge="Supervisi"
            badgeVariant="emerald"
            icon={Layers}
            variant="emerald"
            className="ui-card transition-all duration-300 hover:scale-[1.02]"
          />
          <MasterStatCard
            label="Capaian Rata-Rata"
            value={`${avgCapaian}%`}
            description="Persentase ketercapaian"
            badge="Akumulasi"
            badgeVariant="info"
            icon={TrendingUp}
            variant="blue"
            className="ui-card transition-all duration-300 hover:scale-[1.02]"
          />
          <MasterStatCard
            label="Target Tercapai"
            value={tercapaiCount}
            description="Indikator sesuai target"
            badge="Sesuai SOP"
            badgeVariant="success"
            icon={CheckCircle2}
            variant="green"
            className="ui-card transition-all duration-300 hover:scale-[1.02]"
          />
          <MasterStatCard
            label="Perlu Perhatian"
            value={perluPerhatianCount}
            description="Terlambat / belum tercapai"
            badge="Tindak Lanjut"
            badgeVariant="danger"
            icon={AlertTriangle}
            variant="rose"
            className="ui-card transition-all duration-300 hover:scale-[1.02]"
          />
        </MasterStatsGrid>

        {/* AppDataTable strictly complying with TailGrids Gold Standard Benchmark */}
        <AppDataTable
          title="Daftar Pemantauan Divisi"
          description="Tabel hasil supervisi dan evaluasi indikator kerja antar divisi pendidikan serta unit operasional."
          columns={columns}
          data={filteredItems}
          isLoading={isLoading}
          isError={isError}
          search={search}
          onSearchChange={setSearch}
          searchPlaceholder="Cari nama divisi, aspek pemantauan, atau catatan..."
          actions={renderActionButtons}
          filters={renderFilterControls}
          hasActiveFilters={hasActiveFilters}
          onResetFilters={resetFilters}
          page={page}
          totalPages={pagination.totalPages}
          totalItems={pagination.totalRecords}
          itemsPerPage={perPage}
          onPageChange={setPage}
          renderMobileCard={renderMobileCard}
        />

        {/* Form Modal Add / Edit */}
        <PemantauanDivisiFormModal
          isOpen={isFormOpen}
          onClose={() => setIsFormOpen(false)}
          onSubmit={handleFormSubmit}
          initialData={selectedRecord}
          isSubmitting={tambah.isPending || ubah.isPending}
        />

        {/* TailGrids Delete Confirmation Alert Dialog */}
        <OverlayWrapper isOpen={isDeleteOpen}>
          <Backdrop onDismiss={() => setIsDeleteOpen(false)}>
            <AlertDialog isOpen={isDeleteOpen} onOpenChange={(open) => !open && setIsDeleteOpen(false)}>
              <DialogHeader>
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-rose-100 text-rose-600 dark:bg-rose-950/40">
                  <Trash2 className="h-5 w-5" />
                </div>
                <DialogTitle>Hapus Data Pemantauan Divisi?</DialogTitle>
                <DialogDescription>
                  Tindakan ini tidak dapat dibatalkan. Catatan hasil supervisi divisi ini akan terhapus dari sistem.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter className="flex items-center justify-end gap-2 pt-3">
                <Button
                  type="button"
                  variant="ghost"
                  appearance="outline"
                  size="sm"
                  onClick={() => setIsDeleteOpen(false)}
                  className="cursor-pointer font-bold"
                >
                  Batal
                </Button>
                <Button
                  type="button"
                  variant="danger"
                  appearance="fill"
                  size="sm"
                  onClick={handleConfirmDelete}
                  pending={hapus.isPending}
                  className="cursor-pointer font-bold"
                >
                  Hapus Data
                </Button>
              </DialogFooter>
            </AlertDialog>
          </Backdrop>
        </OverlayWrapper>
      </div>
    </PageContainer>
  )
}
