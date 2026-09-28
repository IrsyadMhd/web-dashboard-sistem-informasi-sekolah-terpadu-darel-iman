import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Archive,
  CalendarDays,
  CheckCircle2,
  Calendar,
  FileSpreadsheet,
  FileText,
  Plus,
  Printer,
  Star,
  Upload,
  Download,
  X,
  ShieldCheck,
  Sparkles,
  AlertTriangle,
  RotateCcw,
  RefreshCcw,
  Pencil,
  Trash2,
  Loader2,
  XCircle,
  Info,
} from 'lucide-react'
import { cn } from '../lib/utils'
import { useDebounce } from '../hooks/useDebounce'
import { tahunAjaranService } from '../services/tahunAjaranService'
import TahunAjaranTable from '../components/tahun-ajaran/TahunAjaranTable'
import TahunAjaranFormModal from '../components/tahun-ajaran/TahunAjaranFormModal'
import TahunAjaranDetailModal from '../components/tahun-ajaran/TahunAjaranDetailModal'
import TahunAjaranImportModal from '../components/tahun-ajaran/TahunAjaranImportModal'
import PageContainer from '../components/app/PageContainer'
import AppBreadcrumb from '../components/app/AppBreadcrumb'
import AppDataTable from '../components/app/AppDataTable'
import { printCleanTable, downloadPdfTable } from '../utils/printHelper'
import { handleApiExport, downloadFileFromApi } from '../utils/exportUtils'
import {
  SquircleActionButton,
  PrintOptionModal,
  MasterFilterSelect,
} from '../components/master-data'

// ── 1. DEFINISI TONE WARNA KARTU KPI MODERN ──────────────────────────────────
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
}

function ModernKpiCard({ icon: Icon, label, subtext, value, tag, tone = 'emerald', onClick }) {
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
      className={`group relative overflow-hidden rounded-[18px] border-2 p-5 shadow-xs transition-[border-color,box-shadow] duration-150 text-left ${
        isClickable ? 'cursor-pointer hover:shadow-md' : 'cursor-default'
      } ${t.card}`}
    >
      {/* Ambient Glow */}
      <div className={`pointer-events-none absolute -top-8 -right-8 h-28 w-28 rounded-full blur-2xl transition-all ${t.glow}`} />

      {/* Header dengan Icon Box & Tag */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2.5">
          <div className={`flex h-9 w-9 items-center justify-center rounded-xl text-white shadow-sm ${t.iconBox}`}>
            <Icon className="size-4.5" />
          </div>
          <div>
            <p className={`text-[11px] font-bold uppercase tracking-wider ${t.title}`}>{label}</p>
          </div>
        </div>
        {tag && (
          <span className={`rounded-lg px-2 py-0.5 text-[10px] font-extrabold ${t.tag}`}>
            {tag}
          </span>
        )}
      </div>

      {/* Nilai Utama */}
      <p className={`text-4xl font-black tabular-nums ${t.val}`}>
        {value ?? '0'}
      </p>
      {subtext && (
        <p className={`mt-0.5 text-[11px] font-semibold ${t.sub}`}>
          {subtext}
        </p>
      )}
    </motion.div>
  )
}

// ── 2. SEMANTIC TOAST NOTIFICATION STACK (ZERO SWEETALERT2) ───────────────────
function ToastStack({ items, onDismiss }) {
  if (!items || items.length === 0) return null

  return (
    <div
      className="fixed bottom-5 right-5 z-[80] flex flex-col gap-2.5 pointer-events-none max-w-sm w-full"
      aria-live="polite"
    >
      <AnimatePresence>
        {items.map((n) => {
          const isSuccess = n.tone === 'success' || !n.tone
          const isDanger = n.tone === 'danger' || n.tone === 'error'
          const isWarning = n.tone === 'warning'
          const isInfo = n.tone === 'info'

          return (
            <motion.div
              key={n.id}
              initial={{ opacity: 0, y: 15, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.9 }}
              transition={{ duration: 0.2 }}
              className={cn(
                'pointer-events-auto relative overflow-hidden rounded-2xl border p-4 shadow-xl backdrop-blur-md',
                isSuccess && 'border-emerald-200 bg-white/95 text-emerald-950 dark:border-emerald-800 dark:bg-[#182232]/95 dark:text-emerald-200',
                isDanger && 'border-rose-200 bg-white/95 text-rose-950 dark:border-rose-800 dark:bg-[#182232]/95 dark:text-rose-200',
                isWarning && 'border-amber-200 bg-white/95 text-amber-950 dark:border-amber-800 dark:bg-[#182232]/95 dark:text-amber-200',
                isInfo && 'border-sky-200 bg-white/95 text-sky-950 dark:border-sky-800 dark:bg-[#182232]/95 dark:text-sky-200'
              )}
            >
              {/* Top accent border */}
              <div
                className={cn(
                  'absolute top-0 left-0 right-0 h-1',
                  isSuccess && 'bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-600',
                  isDanger && 'bg-gradient-to-r from-rose-500 via-rose-600 to-red-700',
                  isWarning && 'bg-gradient-to-r from-amber-500 to-orange-600',
                  isInfo && 'bg-gradient-to-r from-sky-500 to-blue-600'
                )}
              />

              <div className="flex items-start gap-3">
                <div
                  className={cn(
                    'flex size-9 shrink-0 items-center justify-center rounded-xl text-white shadow-sm',
                    isSuccess && 'bg-gradient-to-br from-emerald-500 to-teal-600 shadow-emerald-500/25',
                    isDanger && 'bg-gradient-to-br from-rose-500 to-red-600 shadow-rose-500/25',
                    isWarning && 'bg-gradient-to-br from-amber-500 to-orange-600 shadow-amber-500/25',
                    isInfo && 'bg-gradient-to-br from-sky-500 to-blue-600 shadow-sky-500/25'
                  )}
                >
                  {isSuccess && <CheckCircle2 className="size-5" strokeWidth={2.3} />}
                  {isDanger && <XCircle className="size-5" strokeWidth={2.3} />}
                  {isWarning && <AlertTriangle className="size-5" strokeWidth={2.3} />}
                  {isInfo && <Info className="size-5" strokeWidth={2.3} />}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <h4 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white">
                      {n.title}
                    </h4>
                    <span
                      className={cn(
                        'inline-flex items-center rounded-full px-2 py-0.2 text-[10px] font-bold border',
                        isSuccess && 'bg-emerald-50 text-[#0E5C44] border-emerald-200/80 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800/80',
                        isDanger && 'bg-rose-50 text-rose-700 border-rose-200/80 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800/80',
                        isWarning && 'bg-amber-50 text-amber-800 border-amber-200/80 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800/80',
                        isInfo && 'bg-sky-50 text-sky-800 border-sky-200/80 dark:bg-sky-950/60 dark:text-sky-300 dark:border-sky-800/80'
                      )}
                    >
                      {isSuccess ? 'Sukses' : isDanger ? 'Gagal' : isWarning ? 'Perhatian' : 'Info'}
                    </span>
                  </div>
                  {n.message && (
                    <p className="mt-1 text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                      {n.message}
                    </p>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => onDismiss(n.id)}
                  className="shrink-0 rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200 transition-colors cursor-pointer"
                  aria-label="Tutup notifikasi"
                >
                  <X className="size-4" strokeWidth={2.2} />
                </button>
              </div>
            </motion.div>
          )
        })}
      </AnimatePresence>
    </div>
  )
}

// ── 3. KOMPONEN UTAMA HALAMAN MASTER TAHUN AJARAN ─────────────────────────────
export default function MasterTahunAjaranPage({
  embedded = false,
  hidePageHeader = false,
  hideBreadcrumb = false,
}) {
  const queryClient = useQueryClient()
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebounce(search, 350)
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('')
  const [denganSampahFilter, setDenganSampahFilter] = useState('')
  const [page, setPage] = useState(1)

  // Modals & Active Entity States
  const [selectedForEdit, setSelectedForEdit] = useState(null)
  const [selectedForDetail, setSelectedForDetail] = useState(null)
  const [isFormModalOpen, setIsFormModalOpen] = useState(false)
  const [isImportModalOpen, setIsImportModalOpen] = useState(false)
  const [isExportModalOpen, setIsExportModalOpen] = useState(false)
  const [exportFormat, setExportFormat] = useState('xlsx')
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [pendingSavePayload, setPendingSavePayload] = useState(null)
  const [showSaveConfirmModal, setShowSaveConfirmModal] = useState(false)
  const [notifications, setNotifications] = useState([])
  const perPage = 15

  // Query Data
  const query = useQuery({
    queryKey: [
      'tahun-ajaran-list',
      page,
      perPage,
      debouncedSearch,
      selectedStatusFilter,
      denganSampahFilter,
    ],
    queryFn: () =>
      tahunAjaranService.getDaftar({
        page,
        per_page: perPage,
        search: debouncedSearch,
        status: selectedStatusFilter,
        dengan_sampah: denganSampahFilter,
        order_by: 'start_date',
        order_dir: 'desc',
      }),
  })

  const listData = Array.isArray(query.data) ? query.data : query.data?.data || []
  const meta = query.data?.meta || {}
  const stats = query.data?.statistik || {}

  const notify = (title, message, tone = 'success') => {
    const id = `${Date.now()}-${Math.random()}`
    setNotifications((items) => [...items, { id, title, message, tone }])
    window.setTimeout(() => setNotifications((items) => items.filter((item) => item.id !== id)), 5500)
  }

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['tahun-ajaran-list'] })
  const apiError = (err, fallback) =>
    notify('Terjadi Kesalahan', err?.response?.data?.message || fallback, 'danger')

  // Mutasi Data
  const simpanMutation = useMutation({
    mutationFn: tahunAjaranService.tambah,
    onSuccess: (res) => {
      invalidate()
      setIsFormModalOpen(false)
      setShowSaveConfirmModal(false)
      setPendingSavePayload(null)
      notify('Berhasil Disimpan', res?.message || 'Tahun ajaran baru berhasil ditambahkan.')
    },
    onError: (err) => apiError(err, 'Gagal menyimpan data tahun ajaran baru.'),
  })

  const ubahMutation = useMutation({
    mutationFn: tahunAjaranService.ubah,
    onSuccess: (res) => {
      invalidate()
      setIsFormModalOpen(false)
      setSelectedForEdit(null)
      setShowSaveConfirmModal(false)
      setPendingSavePayload(null)
      notify('Berhasil Diperbarui', res?.message || 'Perubahan tahun ajaran berhasil disimpan.')
    },
    onError: (err) => apiError(err, 'Gagal memperbarui data tahun ajaran.'),
  })

  const setAktifMutation = useMutation({
    mutationFn: tahunAjaranService.setAktif,
    onSuccess: (res) => {
      invalidate()
      notify('Periode Aktif Diperbarui', res?.message || 'Tahun ajaran berhasil dijadikan periode utama.')
    },
    onError: (err) => apiError(err, 'Gagal mengaktifkan tahun ajaran.'),
  })

  const hapusMutation = useMutation({
    mutationFn: tahunAjaranService.hapus,
    onSuccess: (res) => {
      invalidate()
      setDeleteTarget(null)
      notify('Berhasil Dihapus', res?.message || 'Tahun ajaran berhasil dihapus.', 'success')
    },
    onError: (err) => apiError(err, 'Gagal menghapus data tahun ajaran.'),
  })

  const pulihkanMutation = useMutation({
    mutationFn: tahunAjaranService.pulihkan,
    onSuccess: (res) => {
      invalidate()
      notify('Berhasil Dipulihkan', res?.message || 'Tahun ajaran berhasil dipulihkan dari arsip.')
    },
    onError: (err) => apiError(err, 'Gagal memulihkan data tahun ajaran.'),
  })

  const importMutation = useMutation({
    mutationFn: tahunAjaranService.prosesImport,
    onSuccess: (res, rows) => {
      invalidate()
      setIsImportModalOpen(false)
      notify('Impor Berhasil', res?.message || `${rows.length} baris tahun ajaran berhasil diimpor.`)
    },
    onError: (err) => apiError(err, 'Gagal memproses berkas impor data.'),
  })

  const activeCount = stats.aktif ?? 0
  const inactiveCount = stats.tidak_aktif ?? 0
  const total = stats.total ?? (meta.total ?? listData.length)
  const statsValue = (value) => (query.isError ? '—' : value)
  const tableIsLoading = query.isLoading || query.isFetching
  const filtersAreClear = !search && !selectedStatusFilter && !denganSampahFilter

  const openAdd = () => {
    setSelectedForEdit(null)
    setIsFormModalOpen(true)
  }

  const resetFilters = () => {
    setSearch('')
    setSelectedStatusFilter('')
    setDenganSampahFilter('')
    setPage(1)
  }

  const handleExportData = () => {
    setIsExportModalOpen(true)
  }

  const handleProcessExport = async () => {
    setIsExportModalOpen(false)
    if (exportFormat === 'pdf') {
      const headers = ['NO', 'TAHUN AJARAN', 'STATUS UTAMA', 'TANGGAL MULAI', 'TANGGAL SELESAI', 'KETERANGAN']
      const rows = listData.map((item, idx) => [
        idx + 1,
        item.nama || item.tahun || '-',
        item.is_active ? 'Aktif Utama' : 'Tidak Aktif',
        item.tanggal_mulai || '-',
        item.tanggal_selesai || '-',
        item.keterangan || '-',
      ])
      downloadPdfTable({
        title: 'Laporan Data Master Tahun Ajaran',
        filename: `laporan_tahun_ajaran_${new Date().toISOString().slice(0, 10)}.pdf`,
        headers,
        rows,
      })
      notify('Export Berhasil', 'Dokumen PDF tahun ajaran siap diunduh.', 'success')
      return
    }

    notify('Menyiapkan Ekspor', `Memproses berkas tahun ajaran format .${exportFormat.toUpperCase()}...`, 'info')
    const result = await downloadFileFromApi(
      '/master/tahun-ajaran/export',
      { search: debouncedSearch, status: selectedStatusFilter },
      exportFormat,
      'data_master_tahun_ajaran'
    )
    if (result?.success) {
      notify('Ekspor Berhasil', `Data tahun ajaran berhasil diexport ke format .${exportFormat.toUpperCase()}.`, 'success')
    }
  }

  // 4 Vivid Gradient Squircle Action Buttons (Identik Benchmark StudentsPage & EducationUnitsPage)
  const pageActions = (
    <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0 self-start sm:self-auto flex-wrap">
      {/* 1. Tombol Cetak Laporan (Vivid Indigo / Purple Squircle) */}
      <div className="group relative inline-flex">
        <button
          type="button"
          title="Cetak & Download Data Tahun Ajaran"
          aria-label="Cetak & Download Data Tahun Ajaran"
          className="flex size-10 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 via-indigo-600 to-violet-700 text-white border border-indigo-300/40 hover:scale-105 transition-all duration-200 active:scale-95 cursor-pointer shadow-sm shadow-indigo-500/20"
          onClick={() => setIsPrintModalOpen(true)}
        >
          <Printer className="size-5 text-white" strokeWidth={2.2} />
        </button>
        <div className="pointer-events-none absolute top-full left-1/2 mt-2 -translate-x-1/2 opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 transition-all duration-200 ease-out z-50 whitespace-nowrap rounded-lg bg-slate-900 px-2.5 py-1 text-[11px] font-bold text-white shadow-xl dark:bg-slate-100 dark:text-slate-900">
          <div className="absolute bottom-full left-1/2 -mb-1 -translate-x-1/2 border-4 border-transparent border-b-slate-900 dark:border-b-slate-100" />
          Cetak Data (Print)
        </div>
      </div>

      {/* 2. Import Button (Vivid Sky Blue Squircle) */}
      <div className="group relative inline-flex">
        <button
          type="button"
          title="Import Data Tahun Ajaran"
          aria-label="Import Data Tahun Ajaran"
          className="flex size-10 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-400 via-sky-500 to-blue-600 text-white border border-sky-300/40 hover:scale-105 transition-all duration-200 active:scale-95 cursor-pointer shadow-sm shadow-sky-500/20"
          onClick={() => setIsImportModalOpen(true)}
        >
          <Upload className="size-5 text-white" strokeWidth={2.2} />
        </button>
        <div className="pointer-events-none absolute top-full left-1/2 mt-2 -translate-x-1/2 opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 transition-all duration-200 ease-out z-50 whitespace-nowrap rounded-lg bg-slate-900 px-2.5 py-1 text-[11px] font-bold text-white shadow-xl dark:bg-slate-100 dark:text-slate-900">
          <div className="absolute bottom-full left-1/2 -mb-1 -translate-x-1/2 border-4 border-transparent border-b-slate-900 dark:border-b-slate-100" />
          Import Data
        </div>
      </div>

      {/* 3. Export / Download Button (Vivid Amber / Orange Squircle) */}
      <div className="group relative inline-flex">
        <button
          type="button"
          title="Export Data Tahun Ajaran"
          aria-label="Export Data Tahun Ajaran"
          className="flex size-10 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 via-amber-500 to-orange-600 text-white border border-amber-300/40 hover:scale-105 transition-all duration-200 active:scale-95 cursor-pointer shadow-sm shadow-amber-500/20"
          onClick={handleExportData}
        >
          <Download className="size-5 text-white" strokeWidth={2.2} />
        </button>
        <div className="pointer-events-none absolute top-full left-1/2 mt-2 -translate-x-1/2 opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 transition-all duration-200 ease-out z-50 whitespace-nowrap rounded-lg bg-slate-900 px-2.5 py-1 text-[11px] font-bold text-white shadow-xl dark:bg-slate-100 dark:text-slate-900">
          <div className="absolute bottom-full left-1/2 -mb-1 -translate-x-1/2 border-4 border-transparent border-b-slate-900 dark:border-b-slate-100" />
          Export Data
        </div>
      </div>

      {/* 4. Tambah Tahun Ajaran Button (Vivid Emerald / Teal Squircle) */}
      <div className="group relative inline-flex">
        <button
          type="button"
          title="Tambah Tahun Ajaran Baru"
          aria-label="Tambah Tahun Ajaran Baru"
          className="flex size-10 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700 text-white border border-emerald-300/40 hover:scale-105 transition-all duration-200 active:scale-95 cursor-pointer shadow-sm shadow-emerald-500/20"
          onClick={openAdd}
        >
          <Plus className="size-5 text-white" strokeWidth={2.5} />
        </button>
        <div className="pointer-events-none absolute top-full left-1/2 mt-2 -translate-x-1/2 opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 transition-all duration-200 ease-out z-50 whitespace-nowrap rounded-lg bg-slate-900 px-2.5 py-1 text-[11px] font-bold text-white shadow-xl dark:bg-slate-100 dark:text-slate-900">
          <div className="absolute bottom-full left-1/2 -mb-1 -translate-x-1/2 border-4 border-transparent border-b-slate-900 dark:border-b-slate-100" />
          Tambah Periode
        </div>
      </div>
    </div>
  )

  const shouldHideBreadcrumb = embedded || hideBreadcrumb
  const shouldHideHeader = embedded || hidePageHeader

  return (
    <PageContainer maxW="7xl">
      {/* Toast Notification Stack */}
      <ToastStack
        items={notifications}
        onDismiss={(id) => setNotifications((items) => items.filter((n) => n.id !== id))}
      />

      {/* Print & PDF Modal */}
      <PrintOptionModal
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
        title="Tahun Ajaran"
        onPrint={() => {
          const rowsToPrint = Array.isArray(listData) ? listData : []
          printCleanTable({
            title: 'Laporan Master Data Tahun Ajaran',
            subtitle: 'Daftar Tahun Ajaran Sekolah Islam Terpadu',
            headers: ['NO', 'NAMA TAHUN AJARAN', 'RENTANG TANGGAL', 'KETERANGAN', 'STATUS'],
            rows: rowsToPrint.map((row, i) => [
              i + 1,
              row.name || '-',
              `${row.start_date || '-'} s/d ${row.end_date || '-'}`,
              row.keterangan || row.metadata?.keterangan || '-',
              row.deleted_at ? 'Terhapus' : row.is_active ? 'Aktif Utama' : 'Nonaktif',
            ]),
          })
        }}
        onDownload={() => {
          const rowsToPrint = Array.isArray(listData) ? listData : []
          downloadPdfTable({
            title: 'Laporan Master Data Tahun Ajaran',
            subtitle: 'Daftar Tahun Ajaran Sekolah Islam Terpadu',
            headers: ['NO', 'NAMA TAHUN AJARAN', 'RENTANG TANGGAL', 'KETERANGAN', 'STATUS'],
            rows: rowsToPrint.map((row, i) => [
              i + 1,
              row.name || '-',
              `${row.start_date || '-'} s/d ${row.end_date || '-'}`,
              row.keterangan || row.metadata?.keterangan || '-',
              row.deleted_at ? 'Terhapus' : row.is_active ? 'Aktif Utama' : 'Nonaktif',
            ]),
            filename: 'laporan_master_tahun_ajaran.pdf',
          })
        }}
      />

      {/* Breadcrumb Navigation */}
      {!shouldHideBreadcrumb && (
        <AppBreadcrumb
          items={[
            { label: 'Master Data', href: '/dashboard' },
            { label: 'Tahun Ajaran' },
          ]}
        />
      )}

      {/* ── MODERN VIVID HERO HEADER CARD ────────────────────────────────────── */}
      {!shouldHideHeader && (
        <div className="relative overflow-hidden rounded-[22px] border-2 border-emerald-500/30 bg-gradient-to-r from-emerald-500/15 via-teal-500/10 to-emerald-600/15 p-5 sm:p-6 shadow-md shadow-emerald-500/10 dark:border-emerald-600/40 dark:bg-gradient-to-r dark:from-emerald-950/70 dark:via-teal-950/50 dark:to-slate-900 print:hidden mb-6">
          {/* Ambient Glow Background Accent (Vibrant Dual Emerald-Teal Blobs) */}
          <div className="pointer-events-none absolute -top-20 -right-20 h-56 w-56 rounded-full bg-gradient-to-br from-emerald-500/40 via-teal-400/30 to-emerald-600/20 blur-3xl dark:from-emerald-500/50 dark:via-teal-400/40" />
          <div className="pointer-events-none absolute -bottom-20 -left-20 h-56 w-56 rounded-full bg-gradient-to-tr from-emerald-600/30 via-teal-500/20 to-transparent blur-3xl dark:from-emerald-600/40 dark:via-teal-500/30" />

          <div className="relative z-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-4 min-w-0">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700 text-white shadow-xl shadow-emerald-600/40 border border-emerald-300/40 dark:from-emerald-400 dark:via-emerald-500 dark:to-teal-600">
                <CalendarDays className="h-6 w-6" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                    Master Tahun Ajaran
                  </h1>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-emerald-600 to-teal-600 px-3.5 py-1 text-xs font-extrabold text-white shadow-sm shadow-emerald-600/25 border border-emerald-300/40">
                    <ShieldCheck className="h-3.5 w-3.5" />
                    Periode Akademik
                  </span>
                </div>
                <p className="mt-1 text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300 max-w-2xl leading-relaxed">
                  Pengelolaan periode akademik, rentang tanggal kalender, penetapan tahun ajaran aktif utama, dan siklus pembelajaran seluruh unit sekolah.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
              <div className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-500/40 bg-gradient-to-r from-emerald-100 via-emerald-50 to-teal-100 px-3.5 py-1.5 text-xs font-black text-emerald-900 dark:border-emerald-700 dark:bg-gradient-to-r dark:from-emerald-950 dark:to-teal-950 dark:text-emerald-200 shadow-2xs">
                <Sparkles className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>Kalender Akademik</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── MODERN MULTI-TONE KPI CARDS ──────────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 mb-6">
        <ModernKpiCard
          icon={CalendarDays}
          label="Total Periode"
          value={statsValue(total)}
          subtext="Tersimpan di basis data"
          tone="emerald"
        />
        <ModernKpiCard
          icon={Star}
          label="Periode Aktif"
          value={statsValue(activeCount)}
          subtext="Ditandai sebagai periode utama"
          tag="Aktif"
          tone="teal"
        />
        <ModernKpiCard
          icon={Archive}
          label="Tidak Aktif / Arsip"
          value={statsValue(inactiveCount)}
          subtext="Periode lampau atau mendatang"
          tone="amber"
        />
      </div>

      {/* ── CANONICAL APPDATATABLE EMERALD OUTER CONTAINER ───────────────────── */}
      <AppDataTable
        title="Daftar Tahun Ajaran"
        icon={CalendarDays}
        iconClassName="bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700 border border-emerald-300/40 shadow-emerald-600/30"
        description="Pengaturan seluruh periode kalender akademik sekolah."
        countLabel={`${Number(meta.total ?? listData.length).toLocaleString('id-ID')} periode`}
        actions={pageActions}
        search={search}
        onSearchChange={(value) => {
          setSearch(value)
          setPage(1)
        }}
        searchPlaceholder="Cari nama tahun ajaran atau keterangan..."
        filters={
          <>
            <MasterFilterSelect
              aria-label="Filter status periode"
              value={selectedStatusFilter}
              onChange={(event) => {
                setSelectedStatusFilter(event.target.value)
                setPage(1)
              }}
            >
              <option value="">Semua Status</option>
              <option value="true">Aktif Utama</option>
              <option value="false">Tidak Aktif</option>
            </MasterFilterSelect>

            <MasterFilterSelect
              aria-label="Filter cakupan data tahun ajaran"
              value={denganSampahFilter}
              onChange={(event) => {
                setDenganSampahFilter(event.target.value)
                setPage(1)
              }}
            >
              <option value="">Data Aktif</option>
              <option value="true">Termasuk Terhapus</option>
            </MasterFilterSelect>
          </>
        }
        onResetFilters={resetFilters}
        hasActiveFilters={!filtersAreClear}
        isLoading={tableIsLoading}
        isError={query.isError}
        errorTitle="Data tahun ajaran gagal dimuat"
        errorMessage="Periksa koneksi jaringan atau coba muat ulang data kembali."
        onRetry={query.refetch}
        isEmpty={!tableIsLoading && !query.isError && listData.length === 0}
        emptyTitle="Tahun ajaran tidak ditemukan"
        emptyDescription="Ubah kata kunci pencarian atau sesuaikan opsi filter aktif Anda."
        page={page}
        totalPages={meta.last_page ?? 1}
        totalItems={meta.total ?? listData.length}
        itemsPerPage={perPage}
        onPageChange={setPage}
        meta={{
          total: meta.total ?? listData.length,
          from: meta.from ?? (listData.length ? (page - 1) * perPage + 1 : 0),
          to: meta.to ?? (page - 1) * perPage + listData.length,
          last_page: meta.last_page ?? 1,
          current_page: meta.current_page ?? page,
          per_page: meta.per_page ?? perPage,
        }}
        serverControlled
        renderTable={() => (
          <TahunAjaranTable
            data={listData}
            page={page}
            perPage={perPage}
            onDetail={setSelectedForDetail}
            onEdit={(item) => {
              setSelectedForEdit(item)
              setIsFormModalOpen(true)
            }}
            onSetAktif={(item) => setAktifMutation.mutate(item.id)}
            onDelete={setDeleteTarget}
            onRestore={(item) => pulihkanMutation.mutate(item.id)}
          />
        )}
      />

      {/* ── FORM MODAL TAMBAH / UBAH TAHUN AJARAN ───────────────────────────── */}
      <TahunAjaranFormModal
        isOpen={isFormModalOpen}
        onClose={() => {
          setIsFormModalOpen(false)
          setSelectedForEdit(null)
        }}
        onSubmit={(payload) => {
          setPendingSavePayload(payload)
          setShowSaveConfirmModal(true)
        }}
        initialData={selectedForEdit}
        isSubmitting={simpanMutation.isPending || ubahMutation.isPending}
      />

      {/* ── DETAIL MODAL ────────────────────────────────────────────────────── */}
      <TahunAjaranDetailModal
        isOpen={Boolean(selectedForDetail)}
        onClose={() => setSelectedForDetail(null)}
        data={selectedForDetail}
      />

      {/* ── IMPORT MODAL BATCH HARMONIZED ───────────────────────────────────── */}
      <TahunAjaranImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImport={(rows) => importMutation.mutate(rows)}
        isSubmitting={importMutation.isPending}
      />

      {/* ── HARMONIZED EXPORT MODAL (Identik EducationUnitsPage & MasterKelasPage) ── */}
      <AnimatePresence>
        {isExportModalOpen && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/70 backdrop-blur-md"
            role="dialog"
            aria-modal="true"
            aria-labelledby="tahun-ajaran-export-title"
            tabIndex={-1}
            onMouseDown={(e) => {
              if (e.target === e.currentTarget) setIsExportModalOpen(false)
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 14 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ type: 'spring', stiffness: 400, damping: 28 }}
              className="w-full max-w-md font-sans my-auto"
            >
              <div className="flex max-h-[calc(100dvh-2rem)] flex-col overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-2xl shadow-emerald-950/20 dark:border-slate-800 dark:bg-[#182232] dark:shadow-black/60">
                {/* Top Accent Gradient Bar */}
                <div className="h-1.5 w-full bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-600 shrink-0" />

                {/* Header */}
                <div className="flex items-center justify-between border-b border-slate-100 bg-white px-6 py-4.5 dark:border-slate-800 dark:bg-slate-950">
                  <div className="flex items-center gap-3">
                    <div className="rounded-2xl bg-gradient-to-br from-amber-500 via-amber-600 to-orange-600 text-white p-2.5 shadow-md shadow-amber-500/30 border border-amber-300/30 shrink-0">
                      <Download className="size-5 text-white" strokeWidth={2.25} />
                    </div>
                    <div>
                      <h3 id="tahun-ajaran-export-title" className="text-sm sm:text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                        <span>Export Tahun Ajaran</span>
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-[#0E5C44] border border-emerald-200/80 dark:bg-emerald-950/60 dark:text-emerald-400 dark:border-emerald-800/60">
                          <Sparkles className="size-3" />
                          Unduh
                        </span>
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        Pilih format berkas untuk mengekspor data kalender akademik
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsExportModalOpen(false)}
                    aria-label="Tutup modal export"
                    className="rounded-xl p-2 bg-gradient-to-br from-rose-500 via-rose-600 to-red-700 text-white border border-rose-300/40 hover:scale-105 transition-all duration-200 active:scale-95 cursor-pointer"
                  >
                    <X className="size-4" strokeWidth={2.25} />
                  </button>
                </div>

                {/* Body */}
                <div className="space-y-2.5 p-6 text-sm text-slate-700 dark:text-slate-200">
                  {[
                    { value: 'xlsx', label: 'Excel (.xlsx)', desc: 'Format Microsoft Excel Modern (Disarankan)' },
                    { value: 'xls', label: 'Excel Legacy (.xls)', desc: 'Format Microsoft Excel Standard 97-2003' },
                    { value: 'csv', label: 'CSV (.csv)', desc: 'Format Comma-Separated Values universal' },
                    { value: 'pdf', label: 'PDF (.pdf)', desc: 'Format Cetak Dokumen Resmi' },
                  ].map((opt) => (
                    <label
                      key={opt.value}
                      className={cn(
                        'flex cursor-pointer items-center gap-3 rounded-2xl border p-3.5 transition-all',
                        exportFormat === opt.value
                          ? 'border-emerald-500 bg-emerald-50/60 shadow-2xs dark:border-emerald-600 dark:bg-emerald-950/40'
                          : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/50 dark:border-slate-800 dark:hover:border-slate-700 dark:hover:bg-slate-800/40'
                      )}
                    >
                      <input
                        type="radio"
                        name="export-format-ta"
                        value={opt.value}
                        checked={exportFormat === opt.value}
                        onChange={() => setExportFormat(opt.value)}
                        className="accent-emerald-600 size-4"
                      />
                      <div>
                        <p className="text-xs font-bold text-slate-800 dark:text-slate-100">{opt.label}</p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">{opt.desc}</p>
                      </div>
                    </label>
                  ))}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50/50 px-6 py-4 dark:border-slate-800 dark:bg-slate-900/30">
                  <button
                    type="button"
                    onClick={() => setIsExportModalOpen(false)}
                    className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-br from-rose-500 via-rose-600 to-red-700 text-white px-4 py-2.5 text-xs font-extrabold border border-rose-300/40 transition-all duration-200 hover:scale-[1.03] active:scale-95 cursor-pointer"
                  >
                    <div className="flex size-5 items-center justify-center rounded-lg bg-white/20 text-white">
                      <X className="size-3.5 text-white" strokeWidth={2.2} />
                    </div>
                    <span>Batal</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleProcessExport}
                    className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-br from-amber-400 via-amber-500 to-orange-600 text-white px-5 py-2.5 text-xs font-extrabold border border-amber-300/40 hover:scale-[1.03] transition-all duration-200 active:scale-95 cursor-pointer"
                  >
                    <div className="flex size-5 items-center justify-center rounded-lg bg-white/20 text-white">
                      <Download className="size-3.5 text-white" strokeWidth={2.25} />
                    </div>
                    <span>Unduh Berkas</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── HARMONIZED SAVE / UPDATE CONFIRMATION MODAL (z-[70]) ────────────── */}
      <AnimatePresence>
        {showSaveConfirmModal && (
          <div
            className="fixed inset-0 z-[70] flex items-center justify-center p-3 sm:p-5 bg-slate-950/70 backdrop-blur-md overflow-y-auto"
            role="dialog"
            aria-modal="true"
            aria-labelledby="save-confirm-modal-title"
            onMouseDown={(e) => {
              if (
                e.target === e.currentTarget &&
                !simpanMutation.isPending &&
                !ubahMutation.isPending
              ) {
                setShowSaveConfirmModal(false)
              }
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 14 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ type: 'spring', stiffness: 400, damping: 28 }}
              className="my-auto w-full max-w-md font-sans"
            >
              <div className="flex max-h-[calc(100dvh-2.5rem)] flex-col overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-2xl shadow-emerald-950/20 dark:border-slate-800 dark:bg-[#182232] dark:shadow-black/60">
                {/* Top Accent Gradient Bar */}
                <div
                  className={cn(
                    'h-1.5 w-full shrink-0',
                    selectedForEdit
                      ? 'bg-gradient-to-r from-amber-500 via-teal-400 to-emerald-600'
                      : 'bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-600'
                  )}
                />

                {/* Header */}
                <div className="flex items-center justify-between border-b border-slate-100 bg-white px-6 py-4.5 dark:border-slate-800 dark:bg-slate-950 shrink-0">
                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        'rounded-2xl text-white p-2.5 shadow-md shrink-0 border',
                        selectedForEdit
                          ? 'bg-gradient-to-br from-amber-500 via-amber-600 to-orange-600 shadow-amber-500/30 border-amber-300/30'
                          : 'bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700 shadow-emerald-500/30 border-emerald-300/30'
                      )}
                    >
                      {selectedForEdit ? (
                        <Pencil className="size-5 text-white" strokeWidth={2.25} />
                      ) : (
                        <CalendarDays className="size-5 text-white" strokeWidth={2.25} />
                      )}
                    </div>
                    <div>
                      <h3
                        id="save-confirm-modal-title"
                        className="text-sm sm:text-base font-black text-slate-900 dark:text-white flex items-center gap-2"
                      >
                        <span>
                          {selectedForEdit
                            ? 'Konfirmasi Perubahan Data'
                            : 'Konfirmasi Simpan Tahun Ajaran'}
                        </span>
                        <span
                          className={cn(
                            'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold border',
                            selectedForEdit
                              ? 'bg-amber-50 text-amber-700 border-amber-200/80 dark:bg-amber-950/60 dark:text-amber-400 dark:border-amber-800/60'
                              : 'bg-emerald-50 text-emerald-800 border-emerald-200/80 dark:bg-emerald-950/60 dark:text-emerald-400 dark:border-emerald-800/60'
                          )}
                        >
                          <Sparkles className="size-3" />
                          {selectedForEdit ? 'Update Data' : 'Periode Baru'}
                        </span>
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        {selectedForEdit
                          ? 'Verifikasi data tahun ajaran sebelum perubahan disimpan ke sistem.'
                          : 'Verifikasi data tahun ajaran sebelum disimpan ke sistem.'}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    disabled={simpanMutation.isPending || ubahMutation.isPending}
                    onClick={() => setShowSaveConfirmModal(false)}
                    aria-label="Tutup dialog konfirmasi"
                    className="size-9 flex items-center justify-center rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-600 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-300 transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer disabled:opacity-50 shrink-0"
                  >
                    <X className="size-4" strokeWidth={2.25} />
                  </button>
                </div>

                {/* Body */}
                <div className="p-6 space-y-4 text-slate-700 dark:text-slate-200 text-xs">
                  {/* Target Info Summary Card */}
                  <div className="rounded-2xl border border-emerald-100/90 bg-emerald-50/40 p-4 dark:border-emerald-900/40 dark:bg-emerald-950/20 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-500 dark:text-slate-400">
                        Nama Periode
                      </span>
                      <span className="font-black text-slate-900 dark:text-white text-right">
                        {pendingSavePayload?.name || '—'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-500 dark:text-slate-400">
                        Rentang Kalender
                      </span>
                      <span className="font-bold text-slate-800 dark:text-slate-200 text-right tabular-nums">
                        {pendingSavePayload?.start_date || '—'} s/d {pendingSavePayload?.end_date || '—'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-500 dark:text-slate-400">
                        Status Keaktifan
                      </span>
                      <span className="font-bold text-slate-900 dark:text-white">
                        {pendingSavePayload?.is_active ? 'Aktif Utama' : 'Nonaktif'}
                      </span>
                    </div>
                  </div>

                  {/* Semantic Notice Callout Box */}
                  <div className="rounded-2xl border border-emerald-200/80 bg-emerald-50/70 p-3.5 text-xs font-semibold text-emerald-900 dark:border-emerald-900/50 dark:bg-emerald-950/30 dark:text-emerald-300 leading-relaxed flex items-start gap-2.5">
                    <div className="size-6 shrink-0 rounded-lg bg-emerald-600 flex items-center justify-center text-white mt-0.5">
                      <AlertTriangle className="size-3.5" />
                    </div>
                    <p>
                      Pastikan seluruh tanggal kalender akademik telah sesuai dengan SK penetapan tahun ajaran yayasan sebelum menyimpan.
                    </p>
                  </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between border-t border-slate-100 bg-white px-6 py-4 dark:border-slate-800 dark:bg-slate-950 shrink-0">
                  <button
                    type="button"
                    disabled={simpanMutation.isPending || ubahMutation.isPending}
                    onClick={() => setShowSaveConfirmModal(false)}
                    className="inline-flex items-center gap-2 rounded-2xl border border-rose-300 bg-rose-50 px-4 py-2.5 text-xs font-extrabold text-rose-700 transition-all duration-200 hover:scale-[1.02] hover:bg-rose-100 active:scale-95 dark:border-rose-800 dark:bg-rose-950/40 dark:text-rose-300 cursor-pointer disabled:opacity-50"
                  >
                    <X className="size-3.5" strokeWidth={2.2} />
                    <span>Batal</span>
                  </button>

                  <button
                    type="button"
                    disabled={simpanMutation.isPending || ubahMutation.isPending}
                    onClick={() => {
                      if (!pendingSavePayload) return
                      if (selectedForEdit) {
                        ubahMutation.mutate({
                          id: selectedForEdit.id,
                          payload: pendingSavePayload,
                        })
                      } else {
                        simpanMutation.mutate(pendingSavePayload)
                      }
                    }}
                    className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700 px-5 py-2.5 text-xs font-black text-white shadow-md shadow-emerald-600/30 transition-all duration-200 hover:scale-[1.02] active:scale-95 cursor-pointer disabled:opacity-50"
                  >
                    {simpanMutation.isPending || ubahMutation.isPending ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      <CheckCircle2 className="size-4" strokeWidth={2.2} />
                    )}
                    <span>
                      {simpanMutation.isPending || ubahMutation.isPending
                        ? 'Memproses...'
                        : 'Ya, Konfirmasi & Simpan'}
                    </span>
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── HARMONIZED DELETE CONFIRMATION MODAL (z-[70]) ───────────────────── */}
      <AnimatePresence>
        {deleteTarget && (
          <div
            className="fixed inset-0 z-[70] flex items-center justify-center p-3 sm:p-5 bg-slate-950/70 backdrop-blur-md overflow-y-auto"
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-tahun-ajaran-modal-title"
            onMouseDown={(e) => {
              if (e.target === e.currentTarget && !hapusMutation.isPending) {
                setDeleteTarget(null)
              }
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 14 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ type: 'spring', stiffness: 400, damping: 28 }}
              className="my-auto w-full max-w-md font-sans"
            >
              <div className="flex max-h-[calc(100dvh-2.5rem)] flex-col overflow-hidden rounded-3xl border border-rose-200/60 bg-white shadow-2xl shadow-rose-950/20 dark:border-rose-900/50 dark:bg-[#182232] dark:shadow-black/60">
                {/* Top Accent Gradient Bar Merah Rose */}
                <div className="h-1.5 w-full bg-gradient-to-r from-rose-500 via-rose-600 to-red-700 shrink-0" />

                {/* Header */}
                <div className="flex items-center justify-between border-b border-slate-100 bg-white px-6 py-4.5 dark:border-slate-800 dark:bg-slate-950 shrink-0">
                  <div className="flex items-center gap-3">
                    <div className="rounded-2xl text-white p-2.5 shadow-md shrink-0 border bg-gradient-to-br from-rose-500 via-rose-600 to-red-700 shadow-rose-500/30 border-rose-300/30">
                      <Trash2 className="size-5 text-white" strokeWidth={2.25} />
                    </div>
                    <div>
                      <h3
                        id="delete-tahun-ajaran-modal-title"
                        className="text-sm sm:text-base font-black text-slate-900 dark:text-white flex items-center gap-2"
                      >
                        <span>Hapus Tahun Ajaran</span>
                        <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold border bg-rose-50 text-rose-700 border-rose-200/80 dark:bg-rose-950/60 dark:text-rose-400 dark:border-rose-800/60">
                          <AlertTriangle className="size-3" />
                          Hapus Periode
                        </span>
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        Data akan dipindahkan ke arsip dan dapat dipulihkan kembali.
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    disabled={hapusMutation.isPending}
                    onClick={() => setDeleteTarget(null)}
                    aria-label="Tutup dialog hapus"
                    className="size-9 flex items-center justify-center rounded-2xl bg-gradient-to-br from-rose-500 via-rose-600 to-red-700 text-white hover:scale-105 active:scale-95 transition-all duration-200 shadow-md shadow-rose-500/20 cursor-pointer disabled:opacity-50 shrink-0"
                  >
                    <X className="size-4 text-white" strokeWidth={2.25} />
                  </button>
                </div>

                {/* Body */}
                <div className="p-6 space-y-4 text-slate-700 dark:text-slate-200 text-xs">
                  {/* Target Info Summary Card */}
                  <div className="rounded-2xl border border-rose-100/90 bg-rose-50/40 p-4 dark:border-rose-900/40 dark:bg-rose-950/20 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-500 dark:text-slate-400">
                        Nama Tahun Ajaran
                      </span>
                      <span className="font-black text-slate-900 dark:text-white text-right">
                        {deleteTarget?.name || '—'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-500 dark:text-slate-400">
                        Rentang Kalender
                      </span>
                      <span className="font-bold text-slate-800 dark:text-slate-200 text-right tabular-nums">
                        {deleteTarget?.start_date || '—'} s/d {deleteTarget?.end_date || '—'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-500 dark:text-slate-400">
                        Status Saat Ini
                      </span>
                      <span className="font-bold text-slate-900 dark:text-white">
                        {deleteTarget?.is_active ? 'Aktif Utama' : 'Nonaktif'}
                      </span>
                    </div>
                  </div>

                  {/* Danger Notice Box */}
                  <div className="rounded-2xl border border-rose-200/80 bg-rose-50/70 p-3.5 text-xs font-semibold text-rose-900 dark:border-rose-900/50 dark:bg-rose-950/30 dark:text-rose-300 leading-relaxed flex items-start gap-2.5">
                    <div className="size-6 shrink-0 rounded-lg bg-rose-600 flex items-center justify-center text-white mt-0.5">
                      <AlertTriangle className="size-3.5" />
                    </div>
                    <p>
                      Apakah Anda yakin ingin menghapus periode ini? Tindakan ini akan mengarsipkan data tahun ajaran dari daftar operasional aktif.
                    </p>
                  </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between border-t border-slate-100 bg-white px-6 py-4 dark:border-slate-800 dark:bg-slate-950 shrink-0">
                  <button
                    type="button"
                    disabled={hapusMutation.isPending}
                    onClick={() => setDeleteTarget(null)}
                    className="inline-flex items-center gap-2 rounded-2xl border border-slate-300 bg-slate-100 px-4 py-2.5 text-xs font-extrabold text-slate-700 transition-all duration-200 hover:scale-[1.02] hover:bg-slate-200 active:scale-95 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 cursor-pointer disabled:opacity-50"
                  >
                    <X className="size-3.5" strokeWidth={2.2} />
                    <span>Batal</span>
                  </button>

                  <button
                    type="button"
                    disabled={hapusMutation.isPending}
                    onClick={() => hapusMutation.mutate(deleteTarget.id)}
                    className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-br from-rose-500 via-rose-600 to-red-700 px-5 py-2.5 text-xs font-black text-white shadow-md shadow-rose-500/30 transition-all duration-200 hover:scale-[1.02] active:scale-95 cursor-pointer disabled:opacity-50"
                  >
                    {hapusMutation.isPending ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      <Trash2 className="size-4" strokeWidth={2.2} />
                    )}
                    <span>{hapusMutation.isPending ? 'Menghapus...' : 'Ya, Hapus Data'}</span>
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
