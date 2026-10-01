import { useState, useMemo } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import {
  AlertTriangle,
  BarChart2,
  Building2,
  Check,
  CheckCircle2,
  ChevronDown,
  Download,
  Eye,
  FileSpreadsheet,
  FileText,
  GraduationCap,
  Layers,
  Palette,
  Pencil,
  PieChart as PieIcon,
  Plus,
  Power,
  Printer,
  RefreshCcw,
  RotateCcw,
  Save,
  School,
  Search,
  ShieldCheck,
  Sparkles,
  Tag,
  Trash2,
  X,
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
import { downloadFileFromApi } from '../utils/exportUtils'
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
import { usePengaturanStore } from '../stores/pengaturanStore'
import { useDebounce } from '../hooks/useDebounce'
import { cn } from '../lib/utils'
import { Button } from '@/components/tailgrids/core/button'
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '@/components/tailgrids/core/hover-card'

const JENJANG_LIST = ['PAUD', 'TK', 'SD', 'MI', 'SMP', 'MTs', 'SMA', 'MA', 'Pondok Pesantren', 'Mahad']

// ── DEFINISI TONE WARNA KARTU KPI MODERN ──────────────────────────────────────
const MODERN_CARD_TONES = {
  emerald: {
    card: 'border-emerald-300/70 bg-gradient-to-br from-emerald-50 via-teal-50/60 to-white hover:border-emerald-400 dark:border-emerald-700/50 dark:from-emerald-950/40 dark:via-teal-950/20 dark:to-slate-900',
    glow: 'bg-emerald-400/20 group-hover:bg-emerald-400/30',
    iconBox: 'bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-emerald-500/30',
    tag: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/60 dark:text-emerald-300',
    title: 'text-emerald-700 dark:text-emerald-400',
    val: 'text-emerald-700 dark:text-emerald-300',
    sub: 'text-emerald-600/80 dark:text-emerald-400/80',
    cta: 'text-emerald-600/60 dark:text-emerald-500/60',
  },
  teal: {
    card: 'border-teal-300/70 bg-gradient-to-br from-teal-50 via-emerald-50/60 to-white hover:border-teal-400 dark:border-teal-700/50 dark:from-teal-950/40 dark:via-emerald-950/20 dark:to-slate-900',
    glow: 'bg-teal-400/20 group-hover:bg-teal-400/30',
    iconBox: 'bg-gradient-to-br from-teal-500 to-emerald-600 text-white shadow-teal-500/30',
    tag: 'bg-teal-100 text-teal-700 dark:bg-teal-900/60 dark:text-teal-300',
    title: 'text-teal-700 dark:text-teal-400',
    val: 'text-teal-700 dark:text-teal-300',
    sub: 'text-teal-600/80 dark:text-teal-400/80',
    cta: 'text-teal-600/60 dark:text-teal-500/60',
  },
  amber: {
    card: 'border-amber-300/70 bg-gradient-to-br from-amber-50 via-orange-50/60 to-white hover:border-amber-400 dark:border-amber-700/50 dark:from-amber-950/40 dark:via-orange-950/20 dark:to-slate-900',
    glow: 'bg-amber-400/20 group-hover:bg-amber-400/30',
    iconBox: 'bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-amber-500/30',
    tag: 'bg-amber-100 text-amber-700 dark:bg-amber-900/60 dark:text-amber-300',
    title: 'text-amber-700 dark:text-amber-400',
    val: 'text-amber-700 dark:text-amber-300',
    sub: 'text-amber-600/80 dark:text-amber-400/80',
    cta: 'text-amber-600/60 dark:text-amber-500/60',
  },
  rose: {
    card: 'border-rose-300/70 bg-gradient-to-br from-rose-50 via-orange-50/60 to-white hover:border-rose-400 dark:border-rose-700/50 dark:from-rose-950/40 dark:via-orange-950/20 dark:to-slate-900',
    glow: 'bg-rose-400/20 group-hover:bg-rose-400/30',
    iconBox: 'bg-gradient-to-br from-rose-500 to-red-600 text-white shadow-rose-500/30',
    tag: 'bg-rose-100 text-rose-700 dark:bg-rose-900/60 dark:text-rose-300',
    title: 'text-rose-700 dark:text-rose-400',
    val: 'text-rose-700 dark:text-rose-300',
    sub: 'text-rose-600/80 dark:text-rose-400/80',
    cta: 'text-rose-600/60 dark:text-rose-500/60',
  },
}

function ModernKpiCard({
  icon: Icon,
  label,
  subtext,
  value,
  tag,
  tone = 'emerald',
  onClick,
}) {
  const t = MODERN_CARD_TONES[tone] || MODERN_CARD_TONES.emerald
  const isClickable = typeof onClick === 'function'

  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      onClick={onClick}
      role={isClickable ? 'button' : undefined}
      tabIndex={isClickable ? 0 : undefined}
      className={cn(
        'group relative overflow-hidden rounded-[20px] border p-5 shadow-xs transition-all duration-200',
        t.card,
        isClickable && 'cursor-pointer hover:shadow-md'
      )}
    >
      <div
        className={cn(
          'pointer-events-none absolute -right-6 -top-6 h-28 w-28 rounded-full blur-2xl transition-all duration-300',
          t.glow
        )}
      />
      <div className="relative z-10 flex items-start justify-between gap-3 mb-3">
        <div
          className={cn(
            'flex size-11 items-center justify-center rounded-2xl shadow-md transition-transform duration-200 group-hover:scale-105',
            t.iconBox
          )}
        >
          <Icon className="size-5" strokeWidth={2.2} />
        </div>
        {tag && (
          <span
            className={cn(
              'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-extrabold tracking-wide uppercase',
              t.tag
            )}
          >
            <Sparkles className="size-2.5" />
            {tag}
          </span>
        )}
      </div>

      <div className="relative z-10">
        <span className={cn('text-xs font-bold uppercase tracking-wider block mb-0.5', t.title)}>
          {label}
        </span>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white tabular-nums">
            {value}
          </span>
        </div>
        {subtext && <p className={cn('text-[11px] font-medium mt-1 leading-snug', t.sub)}>{subtext}</p>}
      </div>

      {isClickable && (
        <div className="relative z-10 mt-3 pt-2.5 border-t border-slate-200/50 dark:border-slate-800/60 flex items-center justify-between text-[11px] font-bold">
          <span className="text-slate-500 dark:text-slate-400">Klik untuk rincian</span>
          <span className={cn('flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform', t.cta)}>
            Detail &rarr;
          </span>
        </div>
      )}
    </motion.div>
  )
}

// ── TOAST NOTIFICATION STACK ──────────────────────────────────────────────────
function ToastStack({ toasts, onDismiss }) {
  return (
    <aside
      aria-label="Notifikasi sistem"
      className="pointer-events-none fixed bottom-5 right-5 z-[80] flex flex-col gap-2 max-w-sm w-full px-4 sm:px-0"
    >
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 450, damping: 30 }}
            className={`pointer-events-auto flex items-start gap-3 rounded-2xl border p-4 shadow-xl backdrop-blur-md ${
              toast.type === 'error'
                ? 'border-rose-200 bg-white/95 text-rose-900 dark:border-rose-800/70 dark:bg-[#1C2637]/95 dark:text-rose-200'
                : 'border-emerald-200 bg-white/95 text-emerald-900 dark:border-emerald-800/70 dark:bg-[#1C2637]/95 dark:text-emerald-200'
            }`}
          >
            <div
              className={`flex size-8 shrink-0 items-center justify-center rounded-xl ${
                toast.type === 'error'
                  ? 'bg-rose-100 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400'
                  : 'bg-emerald-100 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400'
              }`}
            >
              {toast.type === 'error' ? (
                <AlertTriangle className="size-4" strokeWidth={2.2} />
              ) : (
                <CheckCircle2 className="size-4" strokeWidth={2.2} />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-slate-900 dark:text-white leading-tight">{toast.title}</p>
              {toast.message && (
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-snug">{toast.message}</p>
              )}
            </div>
            <button
              type="button"
              onClick={() => onDismiss(toast.id)}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5 transition-colors cursor-pointer"
            >
              <X className="size-4" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </aside>
  )
}

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
  const sitePengaturan = usePengaturanStore((state) => state.pengaturan)
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebounce(search, 350)
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('')
  const [selectedJenjangFilter, setSelectedJenjangFilter] = useState('')
  const [denganSampahFilter, setDenganSampahFilter] = useState('')
  const [perPage, setPerPage] = useState(10)
  const [page, setPage] = useState(1)

  // Modals & States
  const [isFormModalOpen, setIsFormModalOpen] = useState(false)
  const [selectedForEdit, setSelectedForEdit] = useState(null)
  const [pendingSavePayload, setPendingSavePayload] = useState(null)
  const [showSaveConfirmModal, setShowSaveConfirmModal] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null)

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

  // Toast Notifications
  const [toasts, setToasts] = useState([])
  const pushToast = (title, message = '', type = 'success') => {
    const id = `${Date.now()}-${Math.random()}`
    setToasts((prev) => [...prev, { id, title, message, type }])
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, 4500)
  }
  const dismissToast = (id) => setToasts((prev) => prev.filter((t) => t.id !== id))

  // Main Query
  const {
    data: responseData = {},
    isLoading,
    isFetching,
    isError,
    refetch,
  } = useQuery({
    queryKey: ['jenis-unit-list', page, perPage, debouncedSearch, selectedStatusFilter, selectedJenjangFilter, denganSampahFilter],
    queryFn: () =>
      jenisUnitService.getDaftar({
        page,
        per_page: perPage,
        search: debouncedSearch,
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
    JENJANG_LIST.forEach((j) => {
      counts[j] = 0
    })
    listData.forEach((item) => {
      if (item.jenjang && counts[item.jenjang] !== undefined) {
        counts[item.jenjang] += 1
      }
    })
    return Object.keys(counts)
      .map((j) => ({ name: j, jumlah: counts[j] }))
      .filter((d) => d.jumlah > 0)
  }, [listData])

  const statusChartData = useMemo(() => {
    return [
      { name: 'Jenis Unit Aktif', value: activeCount, color: '#10B981' },
      { name: 'Tidak Aktif', value: inactiveCount, color: '#F59E0B' },
      { name: 'Terhapus / Arsip', value: deletedCount, color: '#F43F5E' },
    ].filter((d) => d.value > 0)
  }, [activeCount, inactiveCount, deletedCount])

  // ── Print & Export Handlers ────────────────────────────────────────────
  const handlePrintClean = () => {
    const orgName = (sitePengaturan?.school_name || sitePengaturan?.application_name || '').trim()
    printCleanTable({
      title: 'REKAPITULASI MASTER JENIS UNIT PENDIDIKAN',
      subtitle: `${orgName ? orgName + ' · ' : ''}Total Terdaftar: ${totalCount} Jenis Unit`,
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
      foundationName: orgName,
      systemLogo: sitePengaturan?.logo_url,
    })
  }

  const handleDownloadPdfTable = () => {
    const orgName = (sitePengaturan?.school_name || sitePengaturan?.application_name || '').trim()
    downloadPdfTable({
      title: 'REKAPITULASI MASTER JENIS UNIT PENDIDIKAN',
      filename: `rekap-jenis-unit-${new Date().toISOString().slice(0, 10)}.pdf`,
      subtitle: `${orgName ? orgName + ' · ' : ''}Total Terdaftar: ${totalCount} Jenis Unit`,
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
      foundationName: orgName,
      systemLogo: sitePengaturan?.logo_url,
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

  // Mutations with zero SweetAlert2
  const simpanMutation = useMutation({
    mutationFn: (payload) => jenisUnitService.tambah(payload),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['jenis-unit-list'] })
      queryClient.invalidateQueries({ queryKey: ['all-jenis-unit-for-kpi'] })
      setIsFormModalOpen(false)
      setShowSaveConfirmModal(false)
      setPendingSavePayload(null)
      pushToast('Berhasil Disimpan', res?.message || 'Jenis unit pendidikan baru berhasil ditambahkan.', 'success')
    },
    onError: (error) => {
      setShowSaveConfirmModal(false)
      pushToast('Gagal Menyimpan', error.response?.data?.message || 'Gagal menyimpan jenis unit pendidikan.', 'error')
    },
  })

  const ubahMutation = useMutation({
    mutationFn: ({ id, payload }) => jenisUnitService.ubah({ id, payload }),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['jenis-unit-list'] })
      queryClient.invalidateQueries({ queryKey: ['all-jenis-unit-for-kpi'] })
      setIsFormModalOpen(false)
      setSelectedForEdit(null)
      setShowSaveConfirmModal(false)
      setPendingSavePayload(null)
      pushToast('Berhasil Diperbarui', res?.message || 'Perubahan jenis unit pendidikan berhasil disimpan.', 'success')
    },
    onError: (error) => {
      setShowSaveConfirmModal(false)
      pushToast('Gagal Memperbarui', error.response?.data?.message || 'Gagal memperbarui jenis unit pendidikan.', 'error')
    },
  })

  const hapusMutation = useMutation({
    mutationFn: (id) => jenisUnitService.hapus(id),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['jenis-unit-list'] })
      queryClient.invalidateQueries({ queryKey: ['all-jenis-unit-for-kpi'] })
      setDeleteTarget(null)
      pushToast('Berhasil Dihapus', res?.message || 'Jenis unit pendidikan berhasil dihapus.', 'success')
    },
    onError: (error) => {
      setDeleteTarget(null)
      pushToast('Gagal Menghapus', error.response?.data?.message || 'Data yang sudah digunakan tidak dapat dihapus.', 'error')
    },
  })

  const pulihkanMutation = useMutation({
    mutationFn: (id) => jenisUnitService.pulihkan(id),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['jenis-unit-list'] })
      queryClient.invalidateQueries({ queryKey: ['all-jenis-unit-for-kpi'] })
      pushToast('Berhasil Dipulihkan', res?.message || 'Jenis unit pendidikan berhasil dipulihkan.', 'success')
    },
    onError: (error) => {
      pushToast('Gagal Memulihkan', error.response?.data?.message || 'Data gagal dipulihkan.', 'error')
    },
  })

  const importMutation = useMutation({
    mutationFn: (rows) => jenisUnitService.prosesImport(rows),
    onSuccess: (res, rows) => {
      queryClient.invalidateQueries({ queryKey: ['jenis-unit-list'] })
      queryClient.invalidateQueries({ queryKey: ['all-jenis-unit-for-kpi'] })
      const resultRows = res?.data?.rows || res?.data?.berhasil || rows
      setImportResult({
        rows: Array.isArray(resultRows) ? resultRows : rows,
        message: res?.message || 'Data jenis unit berhasil diimpor.',
      })
      pushToast('Import Data Berhasil', `${Array.isArray(resultRows) ? resultRows.length : rows.length} data jenis unit berhasil diimpor.`, 'success')
    },
    onError: (error) => {
      pushToast('Gagal Mengimpor', error.response?.data?.message || 'Gagal memproses impor data.', 'error')
    },
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

  const handleFormSubmit = (payload) => {
    setPendingSavePayload(payload)
    setShowSaveConfirmModal(true)
  }

  const handleExecuteSave = () => {
    if (!pendingSavePayload) return
    if (selectedForEdit) {
      ubahMutation.mutate({
        id: selectedForEdit.id || selectedForEdit.uuid,
        payload: pendingSavePayload,
      })
    } else {
      simpanMutation.mutate(pendingSavePayload)
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
    setShowExportModal(false)
    try {
      await downloadFileFromApi(
        '/master/jenis-unit/export',
        {
          search: debouncedSearch,
          status: selectedStatusFilter,
          jenjang: selectedJenjangFilter,
        },
        exportFormat,
        'data_master_jenis_unit'
      )
      pushToast('Export Berhasil', 'Berkas data jenis unit sedang diunduh.', 'success')
    } catch {
      pushToast('Gagal Export', 'Terjadi kendala saat menyiapkan berkas ekspor.', 'error')
    } finally {
      setIsExporting(false)
    }
  }

  const tableIsLoading = isLoading || isFetching
  const filtersAreClear = !search && !selectedStatusFilter && !selectedJenjangFilter && !denganSampahFilter

  // Columns definition following TAILGRIDS_TABLE_COMPONENT standard
  const columns = [
    {
      key: 'nama_jenis',
      label: 'Identitas Jenis Unit',
      render: (row) => (
        <div className="flex min-w-0 items-center gap-3">
          <span
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-emerald-200/80 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300 shadow-xs"
            style={{ borderColor: row.warna_badge ? `${row.warna_badge}40` : undefined }}
          >
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
                className="inline-block max-w-full truncate text-[13px] font-black leading-5 text-slate-900 dark:text-white border-b border-dashed border-slate-400/60 hover:border-[#0E5C44] transition-colors cursor-pointer"
                title={row.nama_jenis}
              >
                {row.nama_jenis || '—'}
              </HoverCardTrigger>
              <HoverCardContent className="w-68 p-4 border border-emerald-200/80 bg-white dark:border-emerald-800/80 dark:bg-[#1B2433] shadow-xl rounded-2xl">
                <div className="flex items-center gap-2.5 mb-2.5">
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200">
                    {renderJenisUnitIcon(row.icon, 'w-5 h-5')}
                  </span>
                  <div className="min-w-0 flex-1">
                    <h4 className="text-xs font-black text-slate-900 dark:text-white truncate">{row.nama_jenis}</h4>
                    <p className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400">{row.kode_jenis} ({row.singkatan || '-'})</p>
                  </div>
                </div>
                <div className="space-y-1 text-[11px] text-slate-600 dark:text-slate-300">
                  <p><strong className="text-slate-400 font-semibold">Jenjang:</strong> {row.jenjang || '-'}</p>
                  <p><strong className="text-slate-400 font-semibold">Urutan Tampil:</strong> {row.urutan ?? '-'}</p>
                  <p className="truncate"><strong className="text-slate-400 font-semibold">Keterangan:</strong> {row.keterangan || 'Tanpa keterangan'}</p>
                </div>
                <button
                  type="button"
                  onClick={() => handleOpenDetail(row)}
                  className="w-full py-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-[10px] font-extrabold uppercase tracking-wider rounded-xl transition-all hover:brightness-105 mt-3 cursor-pointer shadow-xs"
                >
                  Lihat Rincian Data
                </button>
              </HoverCardContent>
            </HoverCard>
            <span className="flex min-w-0 items-center gap-1.5 mt-0.5">
              <small className="truncate text-[10px] font-bold text-emerald-700 dark:text-emerald-400">{row.kode_jenis} · {row.singkatan || '-'}</small>
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
        <span className="inline-flex rounded-xl border border-emerald-200/80 bg-emerald-50/60 px-2.5 py-1 text-[10px] font-black text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300">
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
            <span className="font-mono text-[10px] font-extrabold uppercase text-slate-500 dark:text-slate-400">{badgeColor}</span>
          </div>
        )
      },
    },
    {
      key: 'urutan',
      label: 'Urutan',
      className: 'hidden lg:table-cell text-center',
      render: (row) => (
        <span className="text-xs font-black tabular-nums text-slate-700 dark:text-slate-200">
          {row.urutan ?? '—'}
        </span>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      className: 'hidden sm:table-cell text-center',
      render: (row) =>
        row.is_deleted ? (
          <span className="inline-flex items-center rounded-full bg-rose-100 px-2.5 py-0.5 text-[10px] font-extrabold text-rose-700 dark:bg-rose-950/60 dark:text-rose-400 border border-rose-200">
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
          className="flex h-8 w-8 items-center justify-center rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-300 transition-colors cursor-pointer shadow-xs"
        >
          <RotateCcw className="h-4 w-4" />
        </button>
      )
    }
    return null
  }

  const renderMobileCard = ({ row, onView, onEdit, onDelete }) => (
    <div className={`rounded-2xl border bg-white p-4 shadow-xs dark:bg-[#1B2433] ${row.is_deleted ? 'border-rose-200 dark:border-rose-900/50 bg-rose-50/20' : 'border-emerald-200/80 dark:border-slate-800'}`}>
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-emerald-200/80 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/50 dark:text-emerald-300">
          {renderJenisUnitIcon(row.icon, 'w-5 h-5')}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-[13px] font-black text-slate-900 dark:text-white">{row.nama_jenis}</p>
              <p className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400">{row.kode_jenis} · {row.singkatan || '-'}</p>
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
            className="flex items-center gap-1 text-xs font-bold text-emerald-600 hover:text-emerald-700 cursor-pointer"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Pulihkan</span>
          </button>
        )}
        <ActionDropdown
          onView={onView}
          onEdit={!row.is_deleted ? onEdit : undefined}
          onDelete={!row.is_deleted ? () => setDeleteTarget(row) : undefined}
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

        {/* Header Halaman Modern Hero Card */}
        <motion.div variants={itemVariants} className="relative overflow-hidden rounded-[22px] border-2 border-emerald-500/30 bg-gradient-to-r from-emerald-500/15 via-teal-500/10 to-emerald-600/15 p-5 sm:p-6 shadow-md shadow-emerald-500/10 dark:border-emerald-600/40 dark:bg-gradient-to-r dark:from-emerald-950/70 dark:via-teal-950/50 dark:to-slate-900 print:hidden">
          {/* Ambient Glow Background Accent (Vibrant Dual Emerald-Teal Blobs) */}
          <div className="pointer-events-none absolute -top-20 -right-20 h-56 w-56 rounded-full bg-gradient-to-br from-emerald-500/40 via-teal-400/30 to-emerald-600/20 blur-3xl dark:from-emerald-500/50 dark:via-teal-400/40" />
          <div className="pointer-events-none absolute -bottom-20 -left-20 h-56 w-56 rounded-full bg-gradient-to-tr from-emerald-600/30 via-teal-500/20 to-transparent blur-3xl dark:from-emerald-600/40 dark:via-teal-500/30" />

          <div className="relative z-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-4 min-w-0">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700 text-white shadow-xl shadow-emerald-600/40 border border-emerald-300/40 dark:from-emerald-400 dark:via-emerald-500 dark:to-teal-600">
                <Layers className="h-6 w-6" strokeWidth={2.2} />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                    Master Jenis Unit Pendidikan
                  </h1>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-emerald-600 to-teal-600 px-3.5 py-1 text-xs font-extrabold text-white shadow-sm shadow-emerald-600/25 border border-emerald-300/40">
                    <ShieldCheck className="h-3.5 w-3.5" />
                    Master Data
                  </span>
                </div>
                <p className="mt-1 text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300 max-w-2xl leading-relaxed">
                  Pengelolaan klasifikasi jenis unit sekolah (TK, SD, SMP, SMA, Ponpes, Ma'had), jenjang pendidikan, urutan tampilan, dan preferensi visual secara terpadu.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
              <div className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-500/40 bg-gradient-to-r from-emerald-100 via-emerald-50 to-teal-100 px-3.5 py-1.5 text-xs font-black text-emerald-900 dark:border-emerald-700 dark:bg-gradient-to-r dark:from-emerald-950 dark:to-teal-950 dark:text-emerald-200 shadow-2xs">
                <Sparkles className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>Klasifikasi Unit</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Modern Multi-Tone KPI Summary Cards */}
        <motion.div variants={itemVariants}>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <ModernKpiCard
              icon={School}
              label="Total Jenis Unit"
              value={isLoading ? '...' : Number(totalCount).toLocaleString('id-ID')}
              tag={`${totalCount} Jenis`}
              subtext="Terdaftar di sistem"
              tone="emerald"
              onClick={() => {
                setKpiModalSearch('')
                setActiveKpiModal('total')
              }}
            />
            <ModernKpiCard
              icon={CheckCircle2}
              label="Jenis Unit Aktif"
              value={isLoading ? '...' : Number(activeCount).toLocaleString('id-ID')}
              tag={`${activeCount} Aktif`}
              subtext="Dapat digunakan di unit"
              tone="teal"
              onClick={() => {
                setKpiModalSearch('')
                setActiveKpiModal('aktif')
              }}
            />
            <ModernKpiCard
              icon={RotateCcw}
              label="Tidak Aktif"
              value={isLoading ? '...' : Number(inactiveCount).toLocaleString('id-ID')}
              tag={`${inactiveCount} Pasif`}
              subtext="Dinonaktifkan sementara"
              tone="amber"
              onClick={() => {
                setKpiModalSearch('')
                setActiveKpiModal('pasif')
              }}
            />
            <ModernKpiCard
              icon={Trash2}
              label="Data Terhapus"
              value={isLoading ? '...' : Number(deletedCount).toLocaleString('id-ID')}
              tag={`${deletedCount} Arsip`}
              subtext="Arsip di tempat sampah"
              tone="rose"
              onClick={() => {
                setKpiModalSearch('')
                setActiveKpiModal('sampah')
              }}
            />
          </div>
        </motion.div>

        {/* Visual Analytics Charts Section */}
        <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-stretch">
          {/* Grafik 1: Distribusi Jenjang Pendidikan */}
          <article className="overflow-hidden rounded-3xl border border-emerald-200/80 bg-white p-5 sm:p-6 shadow-xs dark:border-slate-800 dark:bg-[#1B2433] flex flex-col justify-between h-full">
            <div>
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-emerald-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <BarChart2 className="size-5 text-emerald-600 dark:text-emerald-400" />
                  <div>
                    <h3 className="text-base font-black text-slate-900 dark:text-white">
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
            <div className="pt-3 border-t border-emerald-100 dark:border-slate-800/80 flex items-center justify-between text-[11px] font-semibold text-slate-500">
              <span>Klasifikasi resmi Yayasan</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-bold">Terstruktur</span>
            </div>
          </article>

          {/* Grafik 2: Komposisi Status Jenis Unit */}
          <article className="overflow-hidden rounded-3xl border border-emerald-200/80 bg-white p-5 sm:p-6 shadow-xs dark:border-slate-800 dark:bg-[#1B2433] flex flex-col justify-between h-full">
            <div>
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-emerald-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <PieIcon className="size-5 text-teal-600 dark:text-teal-400" />
                  <div>
                    <h3 className="text-base font-black text-slate-900 dark:text-white">
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
            <div className="pt-3 border-t border-emerald-100 dark:border-slate-800/80 flex items-center justify-between text-[11px] font-semibold text-slate-500">
              <span>Status Operasional Unit</span>
              <span className="text-teal-600 dark:text-teal-400 font-bold">Terverifikasi</span>
            </div>
          </article>
        </motion.div>

        {/* Datatable Container */}
        <motion.div variants={itemVariants}>
          <div className="relative overflow-hidden rounded-[22px] border-2 border-emerald-300 dark:border-emerald-700/80 bg-white shadow-md shadow-emerald-500/10 dark:bg-[#1B2433]">
            <AppDataTable
              title="Daftar Jenis Unit Pendidikan"
              description="Kelola klasifikasi, jenjang, identitas visual, dan status jenis unit pendidikan."
              icon={Layers}
              iconClassName="bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700 border border-emerald-300/40 text-white"
              actions={
                <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0 self-start sm:self-auto flex-wrap">
                  {/* Cetak Laporan Button (Vivid Indigo Squircle) */}
                  <div className="group relative inline-flex">
                    <button
                      type="button"
                      title="Cetak & Download Data Jenis Unit"
                      aria-label="Cetak & Download Data Jenis Unit"
                      className="flex size-10 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 via-indigo-600 to-violet-700 text-white border border-indigo-300/40 hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer"
                      onClick={() => setPrintOptionModalOpen(true)}
                    >
                      <Printer className="size-5 text-white" strokeWidth={2.2} />
                    </button>
                    <div className="pointer-events-none absolute top-full left-1/2 mt-2 -translate-x-1/2 opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 transition-all duration-200 ease-out z-50 whitespace-nowrap rounded-xl bg-slate-900 px-2.5 py-1 text-[11px] font-bold text-white shadow-xl dark:bg-slate-100 dark:text-slate-900">
                      <div className="absolute bottom-full left-1/2 -mb-1 -translate-x-1/2 border-4 border-transparent border-b-slate-900 dark:border-b-slate-100" />
                      Cetak & Export
                    </div>
                  </div>

                  {/* Import Button (Vivid Sky Blue Squircle) */}
                  <div className="group relative inline-flex">
                    <button
                      type="button"
                      title="Import Data Jenis Unit"
                      aria-label="Import Data Jenis Unit"
                      className="flex size-10 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-400 via-sky-500 to-blue-600 text-white border border-sky-300/40 hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer"
                      onClick={() => {
                        setImportResult(null)
                        setIsImportModalOpen(true)
                      }}
                    >
                      <Upload1 className="size-5 text-white" strokeWidth={2.2} />
                    </button>
                    <div className="pointer-events-none absolute top-full left-1/2 mt-2 -translate-x-1/2 opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 transition-all duration-200 ease-out z-50 whitespace-nowrap rounded-xl bg-slate-900 px-2.5 py-1 text-[11px] font-bold text-white shadow-xl dark:bg-slate-100 dark:text-slate-900">
                      <div className="absolute bottom-full left-1/2 -mb-1 -translate-x-1/2 border-4 border-transparent border-b-slate-900 dark:border-b-slate-100" />
                      Import Data
                    </div>
                  </div>

                  {/* Export Button (Vivid Amber Squircle) */}
                  <div className="group relative inline-flex">
                    <button
                      type="button"
                      title="Export Data Jenis Unit"
                      aria-label="Export Data Jenis Unit"
                      className="flex size-10 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 via-amber-500 to-orange-600 text-white border border-amber-300/40 hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer"
                      onClick={() => setShowExportModal(true)}
                    >
                      <Download1 className="size-5 text-white" strokeWidth={2.2} />
                    </button>
                    <div className="pointer-events-none absolute top-full left-1/2 mt-2 -translate-x-1/2 opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 transition-all duration-200 ease-out z-50 whitespace-nowrap rounded-xl bg-slate-900 px-2.5 py-1 text-[11px] font-bold text-white shadow-xl dark:bg-slate-100 dark:text-slate-900">
                      <div className="absolute bottom-full left-1/2 -mb-1 -translate-x-1/2 border-4 border-transparent border-b-slate-900 dark:border-b-slate-100" />
                      Export Data
                    </div>
                  </div>

                  {/* Tambah Jenis Unit Button (Vivid Emerald Squircle) */}
                  <div className="group relative inline-flex">
                    <button
                      type="button"
                      title="Tambah Jenis Unit Baru"
                      aria-label="Tambah Jenis Unit Baru"
                      className="flex size-10 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700 text-white border border-emerald-300/40 hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer"
                      onClick={handleOpenFormTambah}
                    >
                      <Plus className="size-5 text-white" strokeWidth={2.5} />
                    </button>
                    <div className="pointer-events-none absolute top-full left-1/2 mt-2 -translate-x-1/2 opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 transition-all duration-200 ease-out z-50 whitespace-nowrap rounded-xl bg-slate-900 px-2.5 py-1 text-[11px] font-bold text-white shadow-xl dark:bg-slate-100 dark:text-slate-900">
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
              onSearchChange={(val) => {
                setSearch(val)
                setPage(1)
              }}
              searchPlaceholder="Cari kode, nama jenis unit, atau singkatan..."
              filters={
                <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-2 sm:gap-2.5 w-full">
                  {/* Status filter */}
                  <div className="relative w-full sm:w-auto">
                    <select
                      value={selectedStatusFilter}
                      onChange={(e) => {
                        setSelectedStatusFilter(e.target.value)
                        setPage(1)
                      }}
                      aria-label="Filter status jenis unit"
                      className="w-full sm:w-auto min-w-[140px] h-10 cursor-pointer appearance-none rounded-xl border border-slate-200 bg-white pl-3.5 pr-8 text-xs font-semibold text-slate-700 shadow-2xs transition-all hover:border-slate-300 focus:border-[#0E5C44] focus:outline-none focus:ring-2 focus:ring-[#0E5C44]/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-slate-600"
                    >
                      <option value="">Semua Status</option>
                      <option value="true">Aktif</option>
                      <option value="false">Tidak Aktif</option>
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                  </div>

                  {/* Jenjang filter */}
                  <div className="relative w-full sm:w-auto">
                    <select
                      value={selectedJenjangFilter}
                      onChange={(e) => {
                        setSelectedJenjangFilter(e.target.value)
                        setPage(1)
                      }}
                      aria-label="Filter jenjang pendidikan"
                      className="w-full sm:w-auto min-w-[140px] h-10 cursor-pointer appearance-none rounded-xl border border-slate-200 bg-white pl-3.5 pr-8 text-xs font-semibold text-slate-700 shadow-2xs transition-all hover:border-slate-300 focus:border-[#0E5C44] focus:outline-none focus:ring-2 focus:ring-[#0E5C44]/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-slate-600"
                    >
                      <option value="">Semua Jenjang</option>
                      {JENJANG_LIST.map((jenjang) => (
                        <option key={jenjang} value={jenjang}>
                          {jenjang}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                  </div>

                  {/* Cakupan data filter */}
                  <div className="relative w-full sm:w-auto">
                    <select
                      value={denganSampahFilter}
                      onChange={(e) => {
                        setDenganSampahFilter(e.target.value)
                        setPage(1)
                      }}
                      aria-label="Filter cakupan data jenis unit"
                      className="w-full sm:w-auto min-w-[140px] h-10 cursor-pointer appearance-none rounded-xl border border-slate-200 bg-white pl-3.5 pr-8 text-xs font-semibold text-slate-700 shadow-2xs transition-all hover:border-slate-300 focus:border-[#0E5C44] focus:outline-none focus:ring-2 focus:ring-[#0E5C44]/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-slate-600"
                    >
                      <option value="">Data Aktif</option>
                      <option value="true">Termasuk Terhapus</option>
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                  </div>

                  {/* Per Page filter */}
                  <div className="relative w-full sm:w-auto">
                    <select
                      value={perPage}
                      onChange={(e) => {
                        setPerPage(Number(e.target.value))
                        setPage(1)
                      }}
                      aria-label="Tampilkan per halaman"
                      className="w-full sm:w-auto min-w-[140px] h-10 cursor-pointer appearance-none rounded-xl border border-slate-200 bg-white pl-3.5 pr-8 text-xs font-semibold text-slate-700 shadow-2xs transition-all hover:border-slate-300 focus:border-[#0E5C44] focus:outline-none focus:ring-2 focus:ring-[#0E5C44]/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-slate-600"
                    >
                      <option value={5}>5 per hal</option>
                      <option value={10}>10 per hal</option>
                      <option value={15}>15 per hal</option>
                      <option value={25}>25 per hal</option>
                      <option value={50}>50 per hal</option>
                      <option value={100}>100 per hal</option>
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
                      className="w-full sm:w-auto sm:ml-auto justify-center h-10 px-3 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 border-rose-200 dark:border-rose-900/50 flex items-center gap-1.5 rounded-xl cursor-pointer"
                    >
                      <RefreshCcw className="size-3.5" />
                      <span>Reset</span>
                    </Button>
                  )}
                </div>
              }
              actionColumnLabel="AKSI"
              onRowClick={(row) => handleOpenDetail(row)}
              onView={(row) => handleOpenDetail(row)}
              onEdit={(row) => (!row.is_deleted ? handleOpenFormEdit(row) : undefined)}
              onDelete={(row) => (!row.is_deleted ? setDeleteTarget(row) : undefined)}
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
          </div>
        </motion.div>
      </motion.div>

      {/* Modals & Forms */}
      <JenisUnitFormModal
        isOpen={isFormModalOpen}
        onClose={() => {
          setIsFormModalOpen(false)
          setSelectedForEdit(null)
        }}
        onSubmit={handleFormSubmit}
        initialData={selectedForEdit}
        isSubmitting={simpanMutation.isPending || ubahMutation.isPending}
      />

      <JenisUnitDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        data={selectedForDetail}
        onEdit={() => {
          setIsDetailModalOpen(false)
          handleOpenFormEdit(selectedForDetail)
        }}
      />

      <JenisUnitImportModal
        isOpen={isImportModalOpen}
        onClose={() => {
          setIsImportModalOpen(false)
          setImportResult(null)
        }}
        onImport={(rows) => importMutation.mutate(rows)}
        isSubmitting={importMutation.isPending}
        result={importResult}
      />

      {/* Print Option Modal */}
      <PrintOptionModal
        isOpen={printOptionModalOpen}
        onClose={() => setPrintOptionModalOpen(false)}
        onPrint={handlePrintClean}
        onDownload={handleDownloadPdfTable}
        title="Master Jenis Unit Pendidikan"
      />

      {/* ══════════════════════════════════════════════════════════════════
          HARMONIZED BATCH EXPORT MODAL
      ══════════════════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {showExportModal && (
          <div
            className="overlay modal fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/70 backdrop-blur-md"
            role="dialog"
            aria-modal="true"
            tabIndex={-1}
            onMouseDown={(e) => {
              if (e.target === e.currentTarget && !isExporting) setShowExportModal(false)
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 14 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ type: 'spring', stiffness: 400, damping: 28 }}
              className="modal-dialog font-sans my-auto w-full max-w-lg"
            >
              <div className="modal-content flex max-h-[calc(100dvh-2.5rem)] flex-col overflow-hidden rounded-3xl border border-amber-200/80 bg-white shadow-2xl shadow-amber-950/20 dark:border-amber-900/50 dark:bg-[#182232]">
                <div className="h-1.5 w-full bg-gradient-to-r from-amber-400 via-amber-500 to-orange-600 shrink-0" />

                <div className="modal-header flex items-center justify-between border-b border-slate-100 bg-white px-6 py-4.5 dark:border-slate-800 dark:bg-slate-950">
                  <div className="flex items-center gap-3">
                    <div className="rounded-2xl bg-gradient-to-br from-amber-400 via-amber-500 to-orange-600 text-white p-2.5 shadow-md shadow-amber-500/25 border border-amber-300/40 shrink-0">
                      <Download className="h-5 w-5 text-white" strokeWidth={2.2} />
                    </div>
                    <div>
                      <h3 className="modal-title text-sm sm:text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                        Export Data Jenis Unit
                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-700 border border-amber-200/80 dark:bg-amber-950/60 dark:text-amber-400 dark:border-amber-800/60">
                          <Sparkles className="size-3" /> Unduh Data
                        </span>
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        Pilih format berkas untuk mengekspor data sesuai filter aktif.
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowExportModal(false)}
                    className="size-9 flex items-center justify-center rounded-2xl bg-slate-100 text-slate-500 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400 transition-colors cursor-pointer"
                  >
                    <X className="size-4" />
                  </button>
                </div>

                <div className="modal-body p-6 space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {[
                      ['xlsx', 'Excel (.xlsx)', FileSpreadsheet, 'Format spreadsheet modern Microsoft Excel.'],
                      ['xls', 'Excel (.xls)', FileSpreadsheet, 'Format kompatibilitas Excel 97-2003.'],
                      ['csv', 'CSV (.csv)', FileText, 'Format teks koma terpisah universal.'],
                    ].map(([value, label, Icon, desc]) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => setExportFormat(value)}
                        className={`rounded-2xl border p-4 text-left transition-all duration-200 cursor-pointer ${
                          exportFormat === value
                            ? 'border-emerald-500 bg-emerald-50/70 shadow-sm dark:border-emerald-700 dark:bg-emerald-950/40'
                            : 'border-slate-200 bg-white hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900/40'
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-1.5">
                          <Icon
                            className={`size-4.5 ${
                              exportFormat === value ? 'text-emerald-700 dark:text-emerald-400' : 'text-slate-400'
                            }`}
                          />
                          <span className="text-xs font-black text-slate-900 dark:text-white">{label}</span>
                        </div>
                        <p className="text-[10px] text-slate-500 leading-snug">{desc}</p>
                      </button>
                    ))}
                  </div>

                  <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200/80 dark:bg-amber-950/30 dark:border-amber-800/60 text-xs text-amber-900 dark:text-amber-300 leading-relaxed">
                    <p className="font-bold flex items-center gap-1.5 mb-0.5">
                      <Sparkles className="size-3.5 text-amber-600 dark:text-amber-400" />
                      Filter Ekspor Aktif
                    </p>
                    <p className="text-[11px] text-amber-800/90 dark:text-amber-300/80">
                      Data yang diekspor akan mencakup seluruh entitas terfilter ({totalCount} record jenis unit).
                    </p>
                  </div>
                </div>

                <div className="modal-footer px-6 py-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-end gap-2.5 bg-slate-50/50 dark:bg-slate-900/40">
                  <button
                    type="button"
                    onClick={() => setShowExportModal(false)}
                    className="inline-flex items-center gap-1.5 rounded-2xl border border-slate-200/90 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 shadow-2xs hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 transition cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="button"
                    disabled={isExporting}
                    onClick={handleProcessExport}
                    className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-br from-amber-500 via-amber-600 to-orange-600 text-white px-5 py-2.5 text-xs font-extrabold shadow-md shadow-amber-500/25 hover:shadow-lg hover:scale-[1.02] active:scale-95 transition-all duration-200 disabled:opacity-50 cursor-pointer border border-amber-300/40"
                  >
                    <Download className="size-4" />
                    {isExporting ? 'Menyiapkan...' : 'Unduh Berkas'}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ══════════════════════════════════════════════════════════════════
          HARMONIZED SAVE/UPDATE CONFIRMATION MODAL (z-[70])
      ══════════════════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {showSaveConfirmModal && pendingSavePayload && (
          <div
            className="overlay modal fixed inset-0 z-[70] flex items-center justify-center p-3 sm:p-5 bg-slate-950/70 backdrop-blur-md"
            role="dialog"
            aria-modal="true"
            tabIndex={-1}
            onMouseDown={(e) => {
              if (e.target === e.currentTarget && !simpanMutation.isPending && !ubahMutation.isPending) {
                setShowSaveConfirmModal(false)
              }
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 14 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ type: 'spring', stiffness: 400, damping: 28 }}
              className="modal-dialog font-sans my-auto w-full max-w-md"
            >
              <div className="modal-content flex max-h-[calc(100dvh-2rem)] flex-col overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-2xl shadow-emerald-950/20 dark:border-slate-800 dark:bg-[#182232]">
                <div
                  className={`h-1.5 w-full shrink-0 ${
                    selectedForEdit
                      ? 'bg-gradient-to-r from-amber-500 via-teal-400 to-emerald-600'
                      : 'bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-600'
                  }`}
                />

                <div className="modal-header flex items-center justify-between border-b border-slate-100 bg-white px-6 py-4.5 dark:border-slate-800 dark:bg-slate-950">
                  <div className="flex items-center gap-3">
                    <div
                      className={`rounded-2xl text-white p-2.5 shadow-md shrink-0 border ${
                        selectedForEdit
                          ? 'bg-gradient-to-br from-amber-500 via-amber-600 to-orange-600 shadow-amber-500/30 border-amber-300/30'
                          : 'bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700 shadow-emerald-500/30 border-emerald-300/30'
                      }`}
                    >
                      {selectedForEdit ? (
                        <Pencil className="h-5 w-5 text-white" strokeWidth={2.25} />
                      ) : (
                        <School className="h-5 w-5 text-white" strokeWidth={2.25} />
                      )}
                    </div>
                    <div>
                      <h3 className="modal-title text-sm sm:text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                        <span>{selectedForEdit ? 'Konfirmasi Perubahan Data' : 'Konfirmasi Penyimpanan Data'}</span>
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold border ${
                            selectedForEdit
                              ? 'bg-amber-50 text-amber-700 border-amber-200/80 dark:bg-amber-950/60 dark:text-amber-400 dark:border-amber-800/60'
                              : 'bg-emerald-50 text-emerald-800 border-emerald-200/80 dark:bg-emerald-950/60 dark:text-emerald-400 dark:border-emerald-800/60'
                          }`}
                        >
                          <Sparkles className="size-3" />
                          {selectedForEdit ? 'Update Data' : 'Jenis Unit Baru'}
                        </span>
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        {selectedForEdit
                          ? 'Pastikan rincian data sudah sesuai sebelum diperbarui di sistem.'
                          : 'Pastikan rincian data jenis unit baru sudah sesuai sebelum disimpan.'}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    disabled={simpanMutation.isPending || ubahMutation.isPending}
                    onClick={() => setShowSaveConfirmModal(false)}
                    className="size-9 flex items-center justify-center rounded-2xl bg-gradient-to-br from-rose-500 via-rose-600 to-red-700 text-white hover:scale-105 active:scale-95 transition-all duration-200 shadow-md shadow-rose-500/20 cursor-pointer disabled:opacity-50"
                  >
                    <X className="size-4 text-white" strokeWidth={2.25} />
                  </button>
                </div>

                <div className="modal-body p-6 space-y-4 text-slate-700 dark:text-slate-200">
                  {/* Summary Card */}
                  <div className="rounded-2xl border border-emerald-200/80 bg-emerald-50/50 p-4 dark:border-emerald-900/60 dark:bg-emerald-950/30">
                    <div className="flex items-center gap-3">
                      <div className="flex size-10 items-center justify-center rounded-xl bg-white dark:bg-slate-900 shadow-xs border border-emerald-200/60 dark:border-emerald-800/60 text-emerald-700 dark:text-emerald-400">
                        {renderJenisUnitIcon(pendingSavePayload.icon, 'size-5')}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-black text-slate-900 dark:text-white truncate">
                          {pendingSavePayload.nama_jenis}
                        </p>
                        <p className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400">
                          {pendingSavePayload.kode_jenis} · Jenjang {pendingSavePayload.jenjang}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Notice Box */}
                  <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-3.5 dark:border-slate-800 dark:bg-slate-900/40 text-xs text-slate-600 dark:text-slate-300">
                    <p className="font-bold flex items-center gap-1.5 mb-1 text-slate-800 dark:text-slate-200">
                      <Sparkles className="size-3.5 text-emerald-600" />
                      Status Operasional: {pendingSavePayload.status ? 'Aktif' : 'Nonaktif'}
                    </p>
                    <p className="text-[11px] text-slate-500 leading-snug">
                      Data jenis unit ini akan langsung disinkronkan ke master data yayasan.
                    </p>
                  </div>
                </div>

                <div className="modal-footer px-6 py-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-end gap-2.5 bg-slate-50/50 dark:bg-slate-900/40">
                  <button
                    type="button"
                    disabled={simpanMutation.isPending || ubahMutation.isPending}
                    onClick={() => setShowSaveConfirmModal(false)}
                    className="inline-flex items-center gap-1.5 rounded-2xl border border-slate-200/90 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 shadow-2xs hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 transition cursor-pointer disabled:opacity-50"
                  >
                    Batal
                  </button>
                  <button
                    type="button"
                    disabled={simpanMutation.isPending || ubahMutation.isPending}
                    onClick={handleExecuteSave}
                    className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700 text-white px-5 py-2.5 text-xs font-extrabold shadow-md shadow-emerald-500/25 hover:shadow-lg hover:scale-[1.02] active:scale-95 transition-all duration-200 disabled:opacity-50 cursor-pointer border border-emerald-300/40"
                  >
                    {simpanMutation.isPending || ubahMutation.isPending ? (
                      <span className="size-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    ) : (
                      <Save className="size-4" strokeWidth={2} />
                    )}
                    <span>
                      {simpanMutation.isPending || ubahMutation.isPending
                        ? 'Menyimpan...'
                        : selectedForEdit
                        ? 'Ya, Perbarui Data'
                        : 'Ya, Simpan Jenis Unit'}
                    </span>
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ══════════════════════════════════════════════════════════════════
          HARMONIZED DELETE CONFIRMATION DIALOG (z-[70])
      ══════════════════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {deleteTarget && (
          <div
            className="overlay modal fixed inset-0 z-[70] flex items-center justify-center p-3 sm:p-5 bg-slate-950/70 backdrop-blur-md"
            role="dialog"
            aria-modal="true"
            tabIndex={-1}
            onMouseDown={(e) => {
              if (e.target === e.currentTarget && !hapusMutation.isPending) setDeleteTarget(null)
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 14 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ type: 'spring', stiffness: 400, damping: 28 }}
              className="modal-dialog font-sans my-auto w-full max-w-md"
            >
              <div className="modal-content flex max-h-[calc(100dvh-2rem)] flex-col overflow-hidden rounded-3xl border border-rose-200/80 bg-white shadow-2xl shadow-rose-950/20 dark:border-rose-900/50 dark:bg-[#182232]">
                <div className="h-1.5 w-full bg-gradient-to-r from-rose-500 via-rose-600 to-red-700 shrink-0" />

                <div className="modal-header flex items-center justify-between border-b border-slate-100 bg-white px-6 py-4.5 dark:border-slate-800 dark:bg-slate-950">
                  <div className="flex items-center gap-3">
                    <div className="rounded-2xl bg-gradient-to-br from-rose-500 via-rose-600 to-red-700 text-white p-2.5 shadow-md shadow-rose-500/30 border border-rose-300/30 shrink-0">
                      <Trash2 className="h-5 w-5 text-white" strokeWidth={2.25} />
                    </div>
                    <div>
                      <h3 className="modal-title text-sm sm:text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                        <span>Hapus Jenis Unit</span>
                        <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold border bg-rose-50 text-rose-700 border-rose-200/80 dark:bg-rose-950/60 dark:text-rose-400 dark:border-rose-800/60">
                          <AlertTriangle className="size-3" />
                          Hapus Data
                        </span>
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        Konfirmasi penghapusan data jenis unit pendidikan.
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    disabled={hapusMutation.isPending}
                    onClick={() => setDeleteTarget(null)}
                    className="size-9 flex items-center justify-center rounded-2xl bg-slate-100 text-slate-500 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400 transition-colors cursor-pointer disabled:opacity-50"
                  >
                    <X className="size-4" strokeWidth={2.25} />
                  </button>
                </div>

                <div className="modal-body p-6 space-y-4 text-slate-700 dark:text-slate-200">
                  {/* Summary Card */}
                  <div className="rounded-2xl border border-rose-200/80 bg-rose-50/50 p-4 dark:border-rose-900/60 dark:bg-rose-950/30">
                    <p className="text-xs font-black text-rose-900 dark:text-rose-200">
                      {deleteTarget.nama_jenis}
                    </p>
                    <p className="text-[11px] font-bold text-rose-700 dark:text-rose-400 mt-0.5">
                      Kode: {deleteTarget.kode_jenis} · Jenjang: {deleteTarget.jenjang}
                    </p>
                  </div>

                  {/* Danger Callout */}
                  <div className="rounded-2xl border border-rose-200 bg-rose-50/80 p-3.5 text-xs text-rose-900 dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-200 leading-relaxed">
                    <p className="font-bold flex items-center gap-1.5 mb-1">
                      <AlertTriangle className="size-3.5 text-rose-600" />
                      Perhatian
                    </p>
                    <p className="text-[11px] text-rose-800 dark:text-rose-300">
                      Data jenis unit yang sedang digunakan oleh unit sekolah aktif tidak dapat dihapus permanen.
                    </p>
                  </div>
                </div>

                <div className="modal-footer px-6 py-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-end gap-2.5 bg-slate-50/50 dark:bg-slate-900/40">
                  <button
                    type="button"
                    disabled={hapusMutation.isPending}
                    onClick={() => setDeleteTarget(null)}
                    className="inline-flex items-center gap-1.5 rounded-2xl border border-slate-200/90 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 shadow-2xs hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 transition cursor-pointer disabled:opacity-50"
                  >
                    Batal
                  </button>
                  <button
                    type="button"
                    disabled={hapusMutation.isPending}
                    onClick={() => hapusMutation.mutate(deleteTarget.id || deleteTarget.uuid)}
                    className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-br from-rose-500 via-rose-600 to-red-700 text-white px-5 py-2.5 text-xs font-extrabold shadow-md shadow-rose-500/25 hover:shadow-lg hover:scale-[1.02] active:scale-95 transition-all duration-200 disabled:opacity-50 cursor-pointer border border-rose-300/40"
                  >
                    {hapusMutation.isPending ? (
                      <span className="size-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    ) : (
                      <Trash2 className="size-4" />
                    )}
                    <span>{hapusMutation.isPending ? 'Menghapus...' : 'Ya, Hapus Data'}</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ══════════════════════════════════════════════════════════════════
          KPI CARDS DRILL-DOWN MODAL
      ══════════════════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {activeKpiModal && (
          <div
            role="dialog"
            tabIndex={-1}
            aria-modal="true"
            className="overlay modal fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/70 backdrop-blur-md"
            onMouseDown={(e) => {
              if (e.target === e.currentTarget) setActiveKpiModal(null)
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 14 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ type: 'spring', stiffness: 400, damping: 28 }}
              className="modal-dialog font-sans w-full max-w-4xl"
            >
              <div className="modal-content flex max-h-[calc(100dvh-2.5rem)] flex-col overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-2xl dark:border-slate-800 dark:bg-[#1B2433]">
                <div className="h-1.5 w-full bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-600 shrink-0" />

                {/* Header */}
                <div className="modal-header flex items-center justify-between border-b border-slate-100 bg-white px-6 py-4.5 dark:border-slate-800 dark:bg-[#1B2433]">
                  <div className="flex items-center gap-3">
                    <div className="rounded-2xl bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700 text-white p-2.5 shadow-md shadow-emerald-500/25 border border-emerald-300/40 shrink-0">
                      {activeKpiModal === 'total' && <School className="h-5 w-5" />}
                      {activeKpiModal === 'aktif' && <CheckCircle2 className="h-5 w-5" />}
                      {activeKpiModal === 'pasif' && <RotateCcw className="h-5 w-5" />}
                      {activeKpiModal === 'sampah' && <Trash2 className="h-5 w-5" />}
                    </div>
                    <div>
                      <h3 className="modal-title text-base font-black text-slate-900 dark:text-white">
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
                    className="size-9 flex items-center justify-center rounded-2xl bg-slate-100 text-slate-500 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400 transition-colors cursor-pointer"
                  >
                    <X className="size-4" strokeWidth={2.2} />
                  </button>
                </div>

                {/* Toolbar Filter inside Modal */}
                <div className="flex items-center gap-3 border-b border-slate-100 bg-slate-50/60 px-6 py-3 dark:border-slate-800 dark:bg-slate-900/40">
                  <div className="relative flex-1">
                    <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      value={kpiModalSearch}
                      onChange={(e) => setKpiModalSearch(e.target.value)}
                      placeholder="Cari kode, nama jenis unit, atau jenjang..."
                      className="h-10 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 text-xs font-semibold text-slate-700 placeholder:text-slate-400 focus:border-[#0E5C44] focus:outline-none focus:ring-2 focus:ring-[#0E5C44]/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
                    />
                  </div>
                  <span className="inline-flex items-center rounded-full bg-emerald-100 px-3.5 py-1 text-xs font-black text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
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
                    <div className="overflow-x-auto rounded-2xl border border-emerald-200/80 dark:border-slate-800">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-gradient-to-r from-emerald-100/90 via-teal-50/70 to-emerald-100/90 text-[11px] font-black uppercase text-emerald-950 dark:from-emerald-950 dark:via-teal-950 dark:to-emerald-950 dark:text-emerald-200 border-b border-emerald-200 dark:border-emerald-900">
                          <tr>
                            <th className="px-4 py-3 text-center">No</th>
                            <th className="px-4 py-3">Kode & Nama Jenis Unit</th>
                            <th className="px-4 py-3">Jenjang</th>
                            <th className="px-4 py-3 text-center">Urutan</th>
                            <th className="px-4 py-3 text-center">Status</th>
                            <th className="px-4 py-3 text-right">Aksi</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-emerald-100/80 font-medium text-slate-700 dark:divide-slate-800 dark:text-slate-300">
                          {filteredKpiItems.map((item, idx) => (
                            <tr key={item.id || item.uuid || idx} className="hover:bg-emerald-50/40 dark:hover:bg-slate-900/50 transition-colors">
                              <td className="px-4 py-3 font-bold text-slate-400 text-center">{idx + 1}</td>
                              <td className="px-4 py-3">
                                <span className="block font-black text-slate-900 dark:text-white">{item.nama_jenis || item.nama || item.name || '-'}</span>
                                <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400">Kode: {item.kode_jenis || item.kode || item.code || '-'}</span>
                              </td>
                              <td className="px-4 py-3">
                                <span className="inline-flex rounded-lg bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-800 border border-emerald-200 dark:bg-emerald-950 dark:border-emerald-800 dark:text-emerald-300">
                                  {item.jenjang || '-'}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-center font-bold tabular-nums">{item.urutan ?? '-'}</td>
                              <td className="px-4 py-3 text-center">
                                {item.is_deleted || item.terhapus || Boolean(item.deleted_at) ? (
                                  <span className="inline-flex items-center rounded-full bg-rose-100 px-2.5 py-0.5 text-[10px] font-bold text-rose-700 border border-rose-200">Terhapus</span>
                                ) : (
                                  <span
                                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold border ${
                                      item.status === 'Aktif' || item.status === true || item.is_active
                                        ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                                        : 'bg-amber-100 text-amber-800 border-amber-200'
                                    }`}
                                  >
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
                                  className="inline-flex items-center gap-1.5 h-8 px-3 rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-700 font-extrabold hover:bg-emerald-100 transition-colors text-[11px] cursor-pointer shadow-2xs"
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
                <div className="modal-footer flex items-center justify-between border-t border-slate-100 bg-slate-50/50 px-6 py-4 dark:border-slate-800 dark:bg-slate-900/50">
                  <span className="text-xs font-bold text-slate-500">
                    Menampilkan total {filteredKpiItems.length} jenis unit
                  </span>
                  <button
                    type="button"
                    onClick={() => setActiveKpiModal(null)}
                    className="h-9 px-5 rounded-2xl border border-slate-200 bg-white text-xs font-bold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 transition-colors cursor-pointer shadow-2xs"
                  >
                    Tutup
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Toast Notification Stack */}
      <ToastStack toasts={toasts} onDismiss={dismissToast} />
    </PageContainer>
  )
}
