import { useState, useMemo } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import Swal from 'sweetalert2'
import {
  CheckCircle2,
  ChevronDown,
  Download,
  FileSpreadsheet,
  FileText,
  GraduationCap,
  Plus,
  Printer,
  RefreshCcw,
  RotateCcw,
  School,
  Trash2,
  X,
  Layers,
  BarChart2,
  PieChart as PieIcon,
  Tag,
  Search,
  Eye,
} from 'lucide-react'
import { Download1, Upload1 } from '@tailgrids/icons'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { jenisUnitService } from '../services/jenisUnitService'
import { renderJenisUnitIcon } from '../components/jenis-unit/JenisUnitTable'
import JenisUnitFormModal from '../components/jenis-unit/JenisUnitFormModal'
import JenisUnitDetailModal from '../components/jenis-unit/JenisUnitDetailModal'
import JenisUnitImportModal from '../components/jenis-unit/JenisUnitImportModal'
import PageContainer from '../components/app/PageContainer'
import AppBreadcrumb from '../components/app/AppBreadcrumb'
import AppDataTable from '../components/app/AppDataTable'
import ActionDropdown from '../components/app/ActionDropdown'
import AppBadge from '../components/app/AppBadge'
import { MasterStatusBadge, PrintOptionModal } from '../components/master-data'
import { printCleanTable, downloadPdfTable } from '../utils/printHelper'
import { Button } from '@/components/tailgrids/core/button'
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '@/components/tailgrids/core/hover-card'

const JENJANG_LIST = ['PAUD', 'TK', 'SD', 'MI', 'SMP', 'MTs', 'SMA', 'MA', 'Pondok Pesantren', 'Mahad']

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.05,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 350, damping: 25 },
  },
}

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
  const [printOptionModalOpen, setPrintOptionModalOpen] = useState(false)
  const [activeKpiModal, setActiveKpiModal] = useState(null)
  const [kpiModalSearch, setKpiModalSearch] = useState('')
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

  // Dedicated query for KPI Cards drill-down modal to ensure full dataset
  const { data: allJenisUnitResponse = {} } = useQuery({
    queryKey: ['all-jenis-unit-for-kpi'],
    queryFn: () => jenisUnitService.getDaftar({ per_page: 100, dengan_sampah: 'true' }),
  })
  const allListData = allJenisUnitResponse?.data || listData

  const activeCount = stats.aktif ?? 0
  const inactiveCount = stats.tidak_aktif ?? 0
  const deletedCount = stats.terhapus ?? 0
  const totalCount = stats.total ?? listData.length ?? 0

  // ── KPI Modal Drill-down Data ──────────────────────────────────────────
  const filteredKpiItems = useMemo(() => {
    if (!activeKpiModal) return []
    let base = allListData.length ? allListData : listData
    if (activeKpiModal === 'aktif') {
      base = base.filter((u) => !u.is_deleted && !u.terhapus && !u.deleted_at && (u.status === 'Aktif' || u.status === true || u.is_active))
    } else if (activeKpiModal === 'pasif') {
      base = base.filter((u) => !u.is_deleted && !u.terhapus && !u.deleted_at && (u.status === 'Nonaktif' || u.status === 'Tidak Aktif' || u.status === false || !u.is_active))
    } else if (activeKpiModal === 'sampah') {
      base = base.filter((u) => Boolean(u.is_deleted) || Boolean(u.terhapus) || Boolean(u.deleted_at))
    }
    if (kpiModalSearch.trim()) {
      const q = kpiModalSearch.toLowerCase()
      base = base.filter(
        (u) =>
          (u.nama_jenis || u.nama || u.name || '').toLowerCase().includes(q) ||
          (u.kode_jenis || u.kode || u.code || '').toLowerCase().includes(q) ||
          (u.jenjang || '').toLowerCase().includes(q)
      )
    }
    return base
  }, [activeKpiModal, allListData, listData, kpiModalSearch])

  // ── Chart Data Calculations ────────────────────────────────────────────
  const jenjangChartData = useMemo(() => {
    const counts = {}
    JENJANG_LIST.forEach(j => { counts[j] = 0 })
    listData.forEach(item => {
      if (item.jenjang && counts[item.jenjang] !== undefined) {
        counts[item.jenjang] += 1
      }
    })
    return Object.keys(counts)
      .map(j => ({ name: j, jumlah: counts[j] }))
      .filter(d => d.jumlah > 0)
  }, [listData])

  const statusChartData = useMemo(() => {
    return [
      { name: 'Jenis Unit Aktif', value: activeCount, color: '#10B981' },
      { name: 'Tidak Aktif', value: inactiveCount, color: '#F59E0B' },
      { name: 'Terhapus / Arsip', value: deletedCount, color: '#F43F5E' },
    ].filter(d => d.value > 0)
  }, [activeCount, inactiveCount, deletedCount])

  // ── Print & Export Handlers (Official PROMPT Style) ───────────────────
  const handlePrintClean = () => {
    printCleanTable({
      title: 'REKAPITULASI MASTER JENIS UNIT PENDIDIKAN',
      subtitle: `Surau Yayasan Dar el-Iman · Total Terdaftar: ${totalCount} Jenis Unit`,
      headers: ['NO', 'KODE JENIS', 'NAMA JENIS UNIT', 'SINGKATAN', 'JENJANG', 'URUTAN', 'STATUS'],
      rows: listData.map((item, index) => [
        index + 1,
        item.kode_jenis || '-',
        item.nama_jenis || '-',
        item.singkatan || '-',
        item.jenjang || '-',
        item.urutan ?? '-',
        item.is_deleted ? 'Terhapus' : item.status ? 'Aktif' : 'Tidak Aktif',
      ]),
    })
  }

  const handleDownloadPdfTable = () => {
    downloadPdfTable({
      title: 'REKAPITULASI MASTER JENIS UNIT PENDIDIKAN',
      filename: `rekap-jenis-unit-${new Date().toISOString().slice(0, 10)}.pdf`,
      headers: ['NO', 'KODE JENIS', 'NAMA JENIS UNIT', 'SINGKATAN', 'JENJANG', 'URUTAN', 'STATUS'],
      rows: listData.map((item, index) => [
        index + 1,
        item.kode_jenis || '-',
        item.nama_jenis || '-',
        item.singkatan || '-',
        item.jenjang || '-',
        item.urutan ?? '-',
        item.is_deleted ? 'Terhapus' : item.status ? 'Aktif' : 'Tidak Aktif',
      ]),
    })
  }

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
                  className="w-full py-1.5 bg-[#0E5C44] text-white text-[10px] font-bold uppercase tracking-wider rounded-lg transition-colors hover:bg-[#1E8E5A] mt-2.5 cursor-pointer"
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
    <PageContainer maxW="7xl">
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="space-y-6 pb-12"
      >
        {/* Breadcrumb */}
        <motion.div variants={itemVariants}>
          <AppBreadcrumb items={[{ label: 'Master Data', href: '/dashboard' }, { label: 'Jenis Unit Pendidikan' }]} />
        </motion.div>

        {/* Tinted KPI Summary Cards */}
        <motion.div variants={itemVariants}>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Card 1: Total Jenis Unit */}
            <motion.article
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
              onClick={() => { setKpiModalSearch(''); setActiveKpiModal('total') }}
              role="button"
              tabIndex={0}
              className="group flex flex-col justify-between h-full p-4.5 rounded-[18px] border border-emerald-200/90 bg-emerald-50/80 hover:border-emerald-300 dark:border-emerald-800/80 dark:bg-emerald-950/30 shadow-xs hover:shadow-md transition-all duration-200 cursor-pointer"
            >
              <div className="flex items-center justify-between gap-2 mb-3">
                <div className="size-11 rounded-xl bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 flex items-center justify-center shrink-0">
                  <School className="size-6" />
                </div>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-emerald-100 text-emerald-800 dark:bg-emerald-900/80 dark:text-emerald-200">
                  {isLoading ? '...' : `${totalCount} Jenis`}
                </span>
              </div>
              <div>
                <span className="text-xs font-semibold text-slate-600 dark:text-slate-300 block mb-0.5">
                  Total Jenis Unit
                </span>
                <strong className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white block">
                  {isLoading ? '...' : Number(totalCount).toLocaleString('id-ID')}
                </strong>
              </div>
              <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 group-hover:text-emerald-700 dark:text-slate-400 dark:group-hover:text-emerald-400 transition-colors pt-3 mt-3 border-t border-emerald-200/60 dark:border-emerald-800/60">
                <span>Terdaftar di sistem</span>
                <span className="inline-flex items-center gap-0.5 text-emerald-700 dark:text-emerald-400 font-bold group-hover:translate-x-0.5 transition-transform">
                  Detail Modal &rarr;
                </span>
              </div>
            </motion.article>

            {/* Card 2: Jenis Unit Aktif */}
            <motion.article
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
              onClick={() => { setKpiModalSearch(''); setActiveKpiModal('aktif') }}
              role="button"
              tabIndex={0}
              className="group flex flex-col justify-between h-full p-4.5 rounded-[18px] border border-teal-200/90 bg-teal-50/80 hover:border-teal-300 dark:border-teal-800/80 dark:bg-teal-950/30 shadow-xs hover:shadow-md transition-all duration-200 cursor-pointer"
            >
              <div className="flex items-center justify-between gap-2 mb-3">
                <div className="size-11 rounded-xl bg-teal-100 dark:bg-teal-900/60 text-teal-700 dark:text-teal-300 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="size-6" />
                </div>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-teal-100 text-teal-800 dark:bg-teal-900/80 dark:text-teal-200">
                  {isLoading ? '...' : `${activeCount} Aktif`}
                </span>
              </div>
              <div>
                <span className="text-xs font-semibold text-slate-600 dark:text-slate-300 block mb-0.5">
                  Jenis Unit Aktif
                </span>
                <strong className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white block">
                  {isLoading ? '...' : Number(activeCount).toLocaleString('id-ID')}
                </strong>
              </div>
              <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 group-hover:text-teal-700 dark:text-slate-400 dark:group-hover:text-teal-400 transition-colors pt-3 mt-3 border-t border-teal-200/60 dark:border-teal-800/60">
                <span>Dapat digunakan</span>
                <span className="inline-flex items-center gap-0.5 text-teal-700 dark:text-teal-400 font-bold group-hover:translate-x-0.5 transition-transform">
                  Detail Modal &rarr;
                </span>
              </div>
            </motion.article>

            {/* Card 3: Tidak Aktif */}
            <motion.article
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
              onClick={() => { setKpiModalSearch(''); setActiveKpiModal('pasif') }}
              role="button"
              tabIndex={0}
              className="group flex flex-col justify-between h-full p-4.5 rounded-[18px] border border-amber-200/90 bg-amber-50/80 hover:border-amber-300 dark:border-amber-800/80 dark:bg-amber-950/30 shadow-xs hover:shadow-md transition-all duration-200 cursor-pointer"
            >
              <div className="flex items-center justify-between gap-2 mb-3">
                <div className="size-11 rounded-xl bg-amber-100 dark:bg-amber-900/60 text-amber-700 dark:text-amber-300 flex items-center justify-center shrink-0">
                  <RotateCcw className="size-6" />
                </div>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-amber-100 text-amber-800 dark:bg-amber-900/80 dark:text-amber-200">
                  {isLoading ? '...' : `${inactiveCount} Pasif`}
                </span>
              </div>
              <div>
                <span className="text-xs font-semibold text-slate-600 dark:text-slate-300 block mb-0.5">
                  Tidak Aktif
                </span>
                <strong className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white block">
                  {isLoading ? '...' : Number(inactiveCount).toLocaleString('id-ID')}
                </strong>
              </div>
              <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 group-hover:text-amber-700 dark:text-slate-400 dark:group-hover:text-amber-400 transition-colors pt-3 mt-3 border-t border-amber-200/60 dark:border-amber-800/60">
                <span>Dinonaktifkan</span>
                <span className="inline-flex items-center gap-0.5 text-amber-700 dark:text-amber-400 font-bold group-hover:translate-x-0.5 transition-transform">
                  Detail Modal &rarr;
                </span>
              </div>
            </motion.article>

            {/* Card 4: Data Terhapus */}
            <motion.article
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
              onClick={() => { setKpiModalSearch(''); setActiveKpiModal('sampah') }}
              role="button"
              tabIndex={0}
              className="group flex flex-col justify-between h-full p-4.5 rounded-[18px] border border-rose-200/90 bg-rose-50/80 hover:border-rose-300 dark:border-rose-800/80 dark:bg-rose-950/30 shadow-xs hover:shadow-md transition-all duration-200 cursor-pointer"
            >
              <div className="flex items-center justify-between gap-2 mb-3">
                <div className="size-11 rounded-xl bg-rose-100 dark:bg-rose-900/60 text-rose-700 dark:text-rose-300 flex items-center justify-center shrink-0">
                  <Trash2 className="size-6" />
                </div>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-rose-100 text-rose-800 dark:bg-rose-900/80 dark:text-rose-200">
                  {isLoading ? '...' : `${deletedCount} Arsip`}
                </span>
              </div>
              <div>
                <span className="text-xs font-semibold text-slate-600 dark:text-slate-300 block mb-0.5">
                  Data Terhapus
                </span>
                <strong className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white block">
                  {isLoading ? '...' : Number(deletedCount).toLocaleString('id-ID')}
                </strong>
              </div>
              <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 group-hover:text-rose-700 dark:text-slate-400 dark:group-hover:text-rose-400 transition-colors pt-3 mt-3 border-t border-rose-200/60 dark:border-rose-800/60">
                <span>Arsip sampah</span>
                <span className="inline-flex items-center gap-0.5 text-rose-700 dark:text-rose-400 font-bold group-hover:translate-x-0.5 transition-transform">
                  Detail Modal &rarr;
                </span>
              </div>
            </motion.article>
          </div>
        </motion.div>

        {/* Visual Analytics Charts Section */}
        <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-stretch">
          {/* Grafik 1: Distribusi Jenjang Pendidikan */}
          <article className="overflow-hidden rounded-[18px] border border-slate-200/80 bg-white p-5 sm:p-6 shadow-xs dark:border-slate-800 dark:bg-[#1B2433] flex flex-col justify-between h-full">
            <div>
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <BarChart2 className="size-5 text-emerald-600 dark:text-emerald-400" />
                  <div>
                    <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                      Distribusi Jenjang Pendidikan
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Jumlah jenis unit berdasarkan klasifikasi jenjang sekolah
                    </p>
                  </div>
                </div>
                <AppBadge variant="success" size="sm">
                  {jenjangChartData.length} Jenjang
                </AppBadge>
              </div>

              <div className="h-64 w-full pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={jenjangChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" opacity={0.6} />
                    <XAxis dataKey="name" tick={{ fontSize: 11, fontWeight: 700 }} stroke="#94A3B8" />
                    <YAxis tick={{ fontSize: 11, fontWeight: 700 }} stroke="#94A3B8" />
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload
                          return (
                            <div className="rounded-xl border border-slate-800 bg-slate-900/95 p-3 text-white shadow-xl backdrop-blur-sm">
                              <p className="text-xs font-bold text-emerald-400 mb-0.5">Jenjang: {data.name}</p>
                              <p className="text-xs font-extrabold">Jumlah Jenis Unit: {data.jumlah}</p>
                            </div>
                          )
                        }
                        return null
                      }}
                    />
                    <Bar dataKey="jumlah" name="Jumlah Jenis Unit" fill="#10B981" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px] font-semibold text-slate-500">
              <span>Klasifikasi resmi Yayasan</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-bold">Terstruktur</span>
            </div>
          </article>

          {/* Grafik 2: Komposisi Status Jenis Unit */}
          <article className="overflow-hidden rounded-[18px] border border-slate-200/80 bg-white p-5 sm:p-6 shadow-xs dark:border-slate-800 dark:bg-[#1B2433] flex flex-col justify-between h-full">
            <div>
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <PieIcon className="size-5 text-teal-600 dark:text-teal-400" />
                  <div>
                    <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                      Komposisi Status Jenis Unit
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Perbandingan status jenis unit aktif, pasif, dan arsip terhapus
                    </p>
                  </div>
                </div>
                <AppBadge variant="info" size="sm">
                  100% Data Synchronized
                </AppBadge>
              </div>

              <div className="h-64 w-full flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={statusChartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={85}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {statusChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload
                          return (
                            <div className="rounded-xl border border-slate-800 bg-slate-900/95 p-3 text-white shadow-xl backdrop-blur-sm">
                              <p className="text-xs font-bold text-teal-400 mb-0.5">{data.name}</p>
                              <p className="text-xs font-extrabold">Total: {data.value} item</p>
                            </div>
                          )
                        }
                        return null
                      }}
                    />
                    <Legend
                      formatter={(value, entry) => (
                        <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                          {entry.payload.name} ({entry.payload.value})
                        </span>
                      )}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px] font-semibold text-slate-500">
              <span>Status Operasional Unit</span>
              <span className="text-teal-600 dark:text-teal-400 font-bold">Terverifikasi</span>
            </div>
          </article>
        </motion.div>

        {/* AppDataTable with Actions Toolbar */}
        <motion.div variants={itemVariants}>
          <AppDataTable
            title="Daftar Jenis Unit Pendidikan"
            description="Kelola klasifikasi, jenjang, identitas visual, dan status jenis unit pendidikan Dar el-Iman."
            actions={
              <div className="flex flex-wrap items-center gap-2">
                {/* Tombol Cetak Laporan (Soft Pastel Purple Squircle) */}
                <div className="group relative inline-flex">
                  <button
                    type="button"
                    title="Cetak & Download Data Jenis Unit"
                    aria-label="Cetak & Download Data Jenis Unit"
                    className="flex size-10 items-center justify-center rounded-2xl bg-purple-100/90 text-purple-600 hover:bg-purple-200/90 dark:bg-purple-950/50 dark:text-purple-400 dark:hover:bg-purple-900/70 transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer"
                    onClick={() => setPrintOptionModalOpen(true)}
                  >
                    <Printer className="size-5" />
                  </button>
                  <div className="pointer-events-none absolute top-full left-1/2 mt-2 -translate-x-1/2 opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 transition-all duration-200 ease-out z-50 whitespace-nowrap rounded-lg bg-slate-900 px-2.5 py-1 text-[11px] font-bold text-white shadow-xl dark:bg-slate-100 dark:text-slate-900">
                    <div className="absolute bottom-full left-1/2 -mb-1 -translate-x-1/2 border-4 border-transparent border-b-slate-900 dark:border-b-slate-100" />
                    Cetak & Export
                  </div>
                </div>

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
            onRowClick={(row) => handleOpenDetail(row)}
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
        </motion.div>
      </motion.div>

      {/* Modals & Forms */}
      <JenisUnitFormModal isOpen={isFormModalOpen} onClose={() => { setIsFormModalOpen(false); setSelectedForEdit(null) }} onSubmit={handleFormSubmit} initialData={selectedForEdit} isSubmitting={simpanMutation.isPending || ubahMutation.isPending} />
      <JenisUnitDetailModal isOpen={isDetailModalOpen} onClose={() => setIsDetailModalOpen(false)} data={selectedForDetail} onEdit={() => { setIsDetailModalOpen(false); handleOpenFormEdit(selectedForDetail) }} />
      <JenisUnitImportModal isOpen={isImportModalOpen} onClose={() => { setIsImportModalOpen(false); setImportResult(null) }} onImport={(rows) => importMutation.mutate(rows)} isSubmitting={importMutation.isPending} result={importResult} />

      {/* Print Option Modal */}
      <PrintOptionModal
        isOpen={printOptionModalOpen}
        onClose={() => setPrintOptionModalOpen(false)}
        onPrint={handlePrintClean}
        onDownload={handleDownloadPdfTable}
        title="Master Jenis Unit Pendidikan"
      />

      {/* Export Selection Modal */}
      {showExportModal && (
        <div className="education-unit-popup fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm" role="dialog" aria-modal="true">
          <section className="w-full max-w-lg overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-700 dark:bg-[#1B2433]">
            <header className="flex items-center justify-between border-b border-slate-100 px-5 py-4 dark:border-slate-700"><div><h2 className="text-base font-bold text-slate-900 dark:text-white">Export Data Jenis Unit</h2><p className="text-[11px] text-slate-500">Pilih format data yang akan diunduh.</p></div><button type="button" onClick={() => setShowExportModal(false)}><X className="h-5 w-5" /></button></header>
            <div className="grid gap-3 p-5 sm:grid-cols-2">{[['xlsx', 'Excel-compatible CSV', FileSpreadsheet], ['csv', 'CSV (.csv)', FileText]].map(([value, label, Icon]) => <button key={value} type="button" onClick={() => setExportFormat(value)} className={`rounded-xl border p-4 text-left ${exportFormat === value ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950/30' : 'border-slate-200 dark:border-slate-700'}`}><span className="flex items-center gap-2 text-xs font-bold dark:text-white"><Icon className="h-4 w-4 text-emerald-700" />{label}</span><small className="mt-1 block text-[10px] text-slate-500">Data sesuai filter aktif</small></button>)}</div>
            <footer className="flex justify-end gap-2 border-t border-slate-100 px-5 py-3 dark:border-slate-700"><button type="button" onClick={() => setShowExportModal(false)} className="h-10 rounded-xl border border-slate-200 px-4 text-xs font-semibold dark:border-slate-700">Batal</button><button type="button" disabled={isExporting} onClick={handleProcessExport} className="inline-flex h-10 items-center gap-2 rounded-xl bg-emerald-800 px-4 text-xs font-semibold text-white disabled:opacity-50"><Download className="h-4 w-4" />{isExporting ? 'Menyiapkan...' : 'Export'}</button></footer>
          </section>
        </div>
      )}

      {/* Notifications Toast */}
      <section className="pointer-events-none fixed bottom-5 right-5 z-[70] grid w-[min(360px,calc(100vw-2rem))] gap-2" aria-live="polite">
        {notifications.map((notification) => (
          <article key={notification.id} className={`pointer-events-auto edu-toast flex items-start gap-3 rounded-xl border bg-white p-4 shadow-xl dark:bg-[#1B2433] ${notification.tone === 'danger' ? 'border-rose-200' : 'border-emerald-200'}`}>
            <span className={`flex h-9 w-9 items-center justify-center rounded-full ${notification.tone === 'danger' ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'}`}>{notification.tone === 'danger' ? <Trash2 className="h-4 w-4" /> : <CheckCircle2 className="h-5 w-5" />}</span>
            <div className="flex-1"><strong className="block text-xs font-bold text-slate-900 dark:text-white">{notification.title}</strong><p className="mt-1 text-[11px] text-slate-500">{notification.message}</p></div>
            <button type="button" onClick={() => setNotifications((current) => current.filter((item) => item.id !== notification.id))}><X className="h-4 w-4 text-slate-400" /></button>
          </article>
        ))}
      </section>

      {/* ══════════════════════════════════════════════════════════════════
          KPI CARDS DRILL-DOWN MODAL — Interactive Analytics Breakdown
      ══════════════════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {activeKpiModal && (
          <div
            role="dialog"
            tabIndex={-1}
            aria-modal="true"
            className="overlay modal fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs"
            onMouseDown={(e) => { if (e.target === e.currentTarget) setActiveKpiModal(null) }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 8 }}
              transition={{ type: 'spring', stiffness: 450, damping: 30 }}
              className="modal-dialog font-sans w-full max-w-4xl"
            >
              <div className="modal-content flex max-h-[calc(100dvh-2rem)] flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-2xl dark:border-slate-700 dark:bg-[#1B2433]">
                {/* Header */}
                <div className="modal-header flex items-center justify-between border-b border-slate-100 bg-white px-6 py-4 dark:border-slate-700 dark:bg-[#1B2433]">
                  <div className="flex items-center gap-3">
                    <div className="rounded-xl bg-[#0E5C44]/10 p-2.5 text-[#0E5C44] dark:bg-[#3FBF75]/20 dark:text-[#3FBF75]">
                      {activeKpiModal === 'total' && <School className="h-5 w-5" />}
                      {activeKpiModal === 'aktif' && <CheckCircle2 className="h-5 w-5" />}
                      {activeKpiModal === 'pasif' && <RotateCcw className="h-5 w-5" />}
                      {activeKpiModal === 'sampah' && <Trash2 className="h-5 w-5" />}
                    </div>
                    <div>
                      <h3 className="modal-title text-base font-extrabold text-slate-900 dark:text-white">
                        {activeKpiModal === 'total' && 'Analisis Total Jenis Unit Pendidikan'}
                        {activeKpiModal === 'aktif' && 'Rincian Jenis Unit Pendidikan Aktif'}
                        {activeKpiModal === 'pasif' && 'Rincian Jenis Unit Pendidikan Dinonaktifkan'}
                        {activeKpiModal === 'sampah' && 'Rincian Jenis Unit Pendidikan di Arsip Sampah'}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Menampilkan {filteredKpiItems.length} data jenis unit terfilter
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveKpiModal(null)}
                    aria-label="Tutup modal"
                    className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors cursor-pointer"
                  >
                    <X className="size-5" />
                  </button>
                </div>

                {/* Toolbar Filter inside Modal */}
                <div className="flex items-center gap-3 border-b border-slate-100 bg-slate-50/60 px-6 py-3 dark:border-slate-800 dark:bg-slate-900/40">
                  <div className="relative flex-1">
                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      value={kpiModalSearch}
                      onChange={(e) => setKpiModalSearch(e.target.value)}
                      placeholder="Cari kode, nama jenis unit, atau jenjang..."
                      className="h-9 w-full rounded-xl border border-slate-200 bg-white pl-9 pr-4 text-xs font-semibold text-slate-700 placeholder:text-slate-400 focus:border-[#0E5C44] focus:outline-none focus:ring-2 focus:ring-[#0E5C44]/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
                    />
                  </div>
                  <span className="inline-flex items-center rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                    {filteredKpiItems.length} Jenis Unit
                  </span>
                </div>

                {/* Body Table */}
                <div className="modal-body flex-1 overflow-y-auto p-6">
                  {filteredKpiItems.length === 0 ? (
                    <div className="py-12 text-center">
                      <p className="text-sm font-bold text-slate-500">Tidak ada data jenis unit yang cocok dengan kriteria ini.</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-slate-50 text-[11px] font-extrabold uppercase text-slate-600 dark:bg-slate-900 dark:text-slate-300">
                          <tr>
                            <th className="px-4 py-3">No</th>
                            <th className="px-4 py-3">Kode & Nama Jenis Unit</th>
                            <th className="px-4 py-3">Jenjang</th>
                            <th className="px-4 py-3 text-center">Urutan</th>
                            <th className="px-4 py-3 text-center">Status</th>
                            <th className="px-4 py-3 text-right">Aksi</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 font-medium text-slate-700 dark:divide-slate-800 dark:text-slate-300">
                          {filteredKpiItems.map((item, idx) => (
                            <tr key={item.id || item.uuid || idx} className="hover:bg-slate-50/80 dark:hover:bg-slate-900/50 transition-colors">
                              <td className="px-4 py-3 font-bold text-slate-400">{idx + 1}</td>
                              <td className="px-4 py-3">
                                <span className="block font-bold text-slate-900 dark:text-white">{item.nama_jenis || item.nama || item.name || '-'}</span>
                                <span className="text-[10px] text-emerald-700 dark:text-emerald-400">Kode: {item.kode_jenis || item.kode || item.code || '-'}</span>
                              </td>
                              <td className="px-4 py-3">
                                <span className="inline-flex rounded-md bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-800 border border-emerald-200 dark:bg-emerald-950 dark:border-emerald-800 dark:text-emerald-300">
                                  {item.jenjang || '-'}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-center font-bold">{item.urutan ?? '-'}</td>
                              <td className="px-4 py-3 text-center">
                                {item.is_deleted || item.terhapus || Boolean(item.deleted_at) ? (
                                  <span className="inline-flex items-center rounded-full bg-rose-100 px-2 py-0.5 text-[10px] font-bold text-rose-700">Terhapus</span>
                                ) : (
                                  <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold ${item.status === 'Aktif' || item.status === true || item.is_active ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                                    {item.status === 'Aktif' || item.status === true || item.is_active ? 'Aktif' : 'Tidak Aktif'}
                                  </span>
                                )}
                              </td>
                              <td className="px-4 py-3 text-right">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setActiveKpiModal(null)
                                    handleOpenDetail(item)
                                  }}
                                  className="inline-flex items-center gap-1 h-7 px-2.5 rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-700 font-bold hover:bg-emerald-100 transition-colors text-[11px] cursor-pointer"
                                >
                                  <Eye className="size-3.5" />
                                  <span>Rincian</span>
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                {/* Footer */}
                <div className="modal-footer flex items-center justify-between border-t border-slate-100 bg-slate-50/50 px-6 py-3 dark:border-slate-800 dark:bg-slate-900/50">
                  <span className="text-xs font-semibold text-slate-500">
                    Menampilkan total {filteredKpiItems.length} baris
                  </span>
                  <button
                    type="button"
                    onClick={() => setActiveKpiModal(null)}
                    className="h-8 px-4 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 cursor-pointer"
                  >
                    Tutup
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </PageContainer>
  )
}
