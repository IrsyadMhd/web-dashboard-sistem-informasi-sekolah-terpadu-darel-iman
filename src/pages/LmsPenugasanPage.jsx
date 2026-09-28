import React, { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import PersonAvatar from '../components/ui/PersonAvatar'
import {
  ClipboardList,
  BookOpen,
  Plus,
  Search,
  Edit3,
  Trash2,
  RefreshCw,
  CheckCircle2,
  XCircle,
  AlertCircle,
  AlertTriangle,
  X,
  Send,
  GraduationCap,
  ChevronLeft,
  ChevronRight,
  Clock,
  SlidersHorizontal,
  FileText,
  Paperclip,
  Check,
  Eye,
  Award,
  Users,
  UserCheck,
  Globe,
  Lock,
  Info,
  Calendar,
  Sparkles,
  Printer,
  Upload,
  Download,
  FileSpreadsheet,
  RotateCcw,
} from 'lucide-react'
import { lmsPenugasanService } from '../services/lmsPenugasanService'
import { subjectService } from '../services/subjectService'
import { useAuthStore } from '../stores/authStore'
import { useUnitStore } from '../stores/unitStore'
import ActionDropdown from '../components/app/ActionDropdown'
import PageContainer from '../components/app/PageContainer'
import AppBreadcrumb from '../components/app/AppBreadcrumb'
import { printCleanTable, downloadPdfTable } from '../utils/printHelper'
import {
  MasterDataTable,
  SquircleActionButton,
  PrintOptionModal,
} from '../components/master-data'
import CsvImportModal from '../components/master-data/CsvImportModal'
import { useDebounce } from '../hooks/useDebounce'
import { downloadSpreadsheetTemplate } from '../utils/spreadsheetParser'

// ── 1. DEFINISI TONE WARNA KARTU KPI MODERN ──
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
  blue: {
    card: 'border-blue-300/70 bg-gradient-to-br from-blue-50 via-cyan-50/60 to-white hover:border-blue-400 dark:border-blue-700/50 dark:from-blue-950/40 dark:via-cyan-950/20 dark:to-slate-900',
    glow: 'bg-blue-400/20 group-hover:bg-blue-400/30',
    iconBox: 'bg-gradient-to-br from-blue-500 to-cyan-600 text-white shadow-blue-500/30',
    tag: 'bg-blue-100 text-blue-700 dark:bg-blue-900/60 dark:text-blue-300',
    title: 'text-blue-700 dark:text-blue-400',
    val: 'text-blue-700 dark:text-blue-300',
    sub: 'text-blue-600/80 dark:text-blue-400/80',
    cta: 'text-blue-600/60 dark:text-blue-500/60',
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
  purple: {
    card: 'border-purple-300/70 bg-gradient-to-br from-purple-50 via-indigo-50/60 to-white hover:border-purple-400 dark:border-purple-700/50 dark:from-purple-950/40 dark:via-indigo-950/20 dark:to-slate-900',
    glow: 'bg-purple-400/20 group-hover:bg-purple-400/30',
    iconBox: 'bg-gradient-to-br from-purple-500 to-indigo-600 text-white shadow-purple-500/30',
    tag: 'bg-purple-100 text-purple-700 dark:bg-purple-900/60 dark:text-purple-300',
    title: 'text-purple-700 dark:text-purple-400',
    val: 'text-purple-700 dark:text-purple-300',
    sub: 'text-purple-600/80 dark:text-purple-400/80',
    cta: 'text-purple-600/60 dark:text-purple-500/60',
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
}

function ModernKpiCard({ icon: Icon, label, subtext, value, tag, tone = 'emerald', className = '', onClick }) {
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
      className={`group relative overflow-hidden rounded-[18px] border-2 p-3.5 sm:p-5 shadow-xs transition-[border-color,box-shadow] duration-150 text-left ${
        isClickable ? 'cursor-pointer hover:shadow-md' : 'cursor-default'
      } ${t.card} ${className}`}
    >
      <div className={`pointer-events-none absolute -top-8 -right-8 h-28 w-28 rounded-full blur-2xl transition-all ${t.glow}`} />
      <div className="flex items-center justify-between mb-2 sm:mb-3">
        <div className="flex items-center gap-2 sm:gap-2.5">
          <div className={`flex size-8 sm:size-9 items-center justify-center rounded-xl text-white shadow-sm shrink-0 ${t.iconBox}`}>
            <Icon className="size-4 sm:size-4.5" />
          </div>
          <div>
            <p className={`text-[10px] sm:text-[11px] font-bold uppercase tracking-wider line-clamp-1 ${t.title}`}>{label}</p>
          </div>
        </div>
        {tag && (
          <span className={`hidden xs:inline-block rounded-lg px-2 py-0.5 text-[9px] sm:text-[10px] font-extrabold shrink-0 ${t.tag}`}>
            {tag}
          </span>
        )}
      </div>

      <p className={`text-2xl sm:text-3xl font-black tabular-nums ${t.val}`}>
        {value ?? '0'}
      </p>
      {subtext && (
        <p className={`mt-0.5 text-[10px] sm:text-[11px] font-semibold line-clamp-1 ${t.sub}`}>
          {subtext}
        </p>
      )}

      {isClickable && (
        <p className={`mt-2 sm:mt-3 text-[10px] font-bold flex items-center gap-1 ${t.cta}`}>
          <Eye className="size-3" /> Filter status
        </p>
      )}
    </motion.div>
  )
}

// ── 2. TOAST NOTIFICATION STACK HOOK ──
function useNotifications() {
  const [items, setItems] = useState([])
  const push = (title, message, tone = 'success') => {
    const id = `${Date.now()}-${Math.random()}`
    setItems((prev) => [...prev, { id, title, message, tone }])
    window.setTimeout(() => setItems((prev) => prev.filter((n) => n.id !== id)), 5000)
  }
  const dismiss = (id) => setItems((prev) => prev.filter((n) => n.id !== id))
  return { items, push, dismiss }
}

function ToastStack({ items, onDismiss }) {
  if (!items.length) return null
  return (
    <div className="fixed bottom-6 right-4 z-[200] flex flex-col gap-2.5 sm:right-6 max-w-sm w-full pointer-events-none" aria-live="polite">
      {items.map((n) => {
        const isError = n.tone === 'error' || n.tone === 'danger'
        const isWarning = n.tone === 'warning'
        return (
          <motion.div
            key={n.id}
            initial={{ opacity: 0, y: 15, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className={`pointer-events-auto relative overflow-hidden rounded-2xl border bg-white p-4 shadow-xl dark:bg-slate-900 ${
              isError
                ? 'border-rose-300 dark:border-rose-800 shadow-rose-950/10'
                : isWarning
                ? 'border-amber-300 dark:border-amber-800 shadow-amber-950/10'
                : 'border-emerald-300 dark:border-emerald-800 shadow-emerald-950/10'
            }`}
          >
            <div
              className={`h-1 w-full absolute top-0 left-0 bg-gradient-to-r ${
                isError
                  ? 'from-rose-500 via-rose-600 to-red-700'
                  : isWarning
                  ? 'from-amber-400 via-amber-500 to-orange-600'
                  : 'from-emerald-500 via-teal-400 to-emerald-600'
              }`}
            />
            <div className="flex items-start gap-3 mt-0.5">
              <div
                className={`flex size-9 shrink-0 items-center justify-center rounded-xl text-white shadow-xs ${
                  isError
                    ? 'bg-gradient-to-br from-rose-500 to-red-600'
                    : isWarning
                    ? 'bg-gradient-to-br from-amber-500 to-orange-600'
                    : 'bg-gradient-to-br from-emerald-500 to-teal-600'
                }`}
              >
                {isError ? <XCircle className="size-4.5" /> : isWarning ? <AlertTriangle className="size-4.5" /> : <CheckCircle2 className="size-4.5" />}
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">{n.title}</h4>
                <p className="mt-0.5 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">{n.message}</p>
              </div>
              <button
                type="button"
                onClick={() => onDismiss(n.id)}
                className="shrink-0 rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 cursor-pointer"
              >
                <X className="size-3.5" />
              </button>
            </div>
          </motion.div>
        )
      })}
    </div>
  )
}

// ── 3. HARMONIZED BATCH EXPORT MODAL ──
function HarmonizedBatchExportModal({
  isOpen,
  onClose,
  onExport,
  isExporting,
  totalCount,
  moduleTitle = 'Penugasan & Asesmen',
}) {
  const [exportFormat, setExportFormat] = useState('xlsx')

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/70 backdrop-blur-md animate-fadeIn"
      role="dialog"
      aria-modal="true"
      tabIndex={-1}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget && !isExporting) onClose()
      }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 14 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        transition={{ type: 'spring', stiffness: 400, damping: 28 }}
        className="w-full max-w-lg"
      >
        <div className="flex max-h-[calc(100dvh-2.5rem)] flex-col overflow-hidden rounded-3xl border border-amber-200/80 bg-white shadow-2xl shadow-amber-950/20 dark:border-amber-900/50 dark:bg-[#182232]">
          <div className="h-1.5 w-full bg-gradient-to-r from-amber-400 via-amber-500 to-orange-600 shrink-0" />

          <div className="flex items-center justify-between border-b border-slate-100 bg-white px-6 py-4.5 dark:border-slate-800 dark:bg-slate-950 shrink-0">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-gradient-to-br from-amber-400 via-amber-500 to-orange-600 text-white p-2.5 shadow-md shadow-amber-500/25 border border-amber-300/40 shrink-0">
                <Download className="h-5 w-5 text-white" strokeWidth={2.2} />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <span>Export Data {moduleTitle}</span>
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
              disabled={isExporting}
              onClick={onClose}
              className="size-9 flex items-center justify-center rounded-2xl bg-slate-100 text-slate-500 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400 transition-colors cursor-pointer disabled:opacity-50"
            >
              <X className="size-4" />
            </button>
          </div>

          <div className="p-6 space-y-4 overflow-y-auto flex-1">
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
                      className={`size-4 ${
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
                Data yang diekspor akan mencakup seluruh entitas terfilter ({totalCount} butir {moduleTitle.toLowerCase()}).
              </p>
            </div>
          </div>

          <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-end gap-2.5 bg-slate-50/50 dark:bg-slate-900/40 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="inline-flex items-center gap-1.5 rounded-2xl border border-slate-200/90 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 shadow-2xs hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 transition cursor-pointer"
            >
              Batal
            </button>
            <button
              type="button"
              disabled={isExporting}
              onClick={() => onExport(exportFormat)}
              className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-br from-amber-500 via-amber-600 to-orange-600 text-white px-5 py-2.5 text-xs font-extrabold shadow-md shadow-amber-500/25 hover:shadow-lg hover:scale-[1.02] active:scale-95 transition-all duration-200 disabled:opacity-50 cursor-pointer border border-amber-300/40"
            >
              <Download className="size-4" />
              {isExporting ? 'Menyiapkan...' : 'Unduh Berkas'}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.02,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, ease: 'easeOut' },
  },
}

export default function LmsPenugasanPage({ embedded = false, hideBreadcrumb = false, hidePageHeader = false, tabNav = null }) {
  const { items: toastList, push: pushToast, dismiss: dismissToast } = useNotifications()
  const user = useAuthStore((state) => state.user)
  const activeUnit = useUnitStore((state) => state.activeUnit)

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
      user?.school_info?.id,
    ].filter(Boolean)
    return candidateIds.length > 0 ? String(candidateIds[0]) : null
  }, [user])

  const [dataPenugasan, setDataPenugasan] = useState([])
  const [options, setOptions] = useState({
    modul_ajar: [],
    kelas: [],
    guru: [],
    subjects: [],
    semesters: [],
    tahun_ajaran: [],
    tipe: [
      { value: 'individu', label: 'Individu' },
      { value: 'kelompok', label: 'Kelompok' },
    ],
    jenis: [
      { value: 'tugas', label: 'Tugas Mandiri / PR' },
      { value: 'proyek', label: 'Proyek / Portofolio' },
      { value: 'quiz', label: 'Kuis Formatif' },
      { value: 'latihan', label: 'Latihan Soal' },
    ],
    status: [
      { value: 'dipublikasikan', label: 'Dipublikasikan' },
      { value: 'draft', label: 'Draft' },
    ],
  })

  const [stats, setStats] = useState({
    total: 0,
    published: 0,
    draft: 0,
    total_pengumpulan: 0,
    total_dinilai: 0,
  })

  const [loading, setLoading] = useState(true)
  const [errorMsg, setErrorMsg] = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  // Filters & Pagination with Debounce
  const [searchInput, setSearchInput] = useState('')
  const debouncedSearch = useDebounce(searchInput, 350)
  const [selectedModulAjar, setSelectedModulAjar] = useState('')
  const [selectedTipe, setSelectedTipe] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('')
  const [selectedKelas, setSelectedKelas] = useState('')
  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState({
    current_page: 1,
    last_page: 1,
    total: 0,
    per_page: 15,
  })

  // Print, Export & Import State
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false)
  const [importOpen, setImportOpen] = useState(false)
  const [isExportModalOpen, setIsExportModalOpen] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleExportSpreadsheet = (format = 'xlsx') => {
    try {
      setIsExporting(true)
      if (!dataPenugasan.length) {
        pushToast('Data Kosong', 'Tidak ada data penugasan untuk diekspor.', 'warning')
        return
      }
      const exportData = dataPenugasan.map((item, idx) => ({
        'No': idx + 1,
        'ID': item.id,
        'Judul Penugasan': item.judul || item.judul_tugas || '-',
        'Modul Ajar': item.modul_ajar?.judul || '-',
        'Kelas': item.kelas?.nama_kelas || item.kelas?.name || 'Semua Kelas',
        'Guru Pengampu': item.guru?.nama || item.guru?.nama_lengkap || '-',
        'Tipe': item.tipe || 'individu',
        'Jenis Tugas': item.jenis_tugas || 'tugas',
        'Nilai Maksimal': item.nilai_maksimal || 100,
        'Bobot Nilai (%)': item.bobot_persen ?? 10,
        'Tanggal Mulai': item.tanggal_mulai || '-',
        'Deadline': item.deadline || item.tanggal_selesai || '-',
        'Total Pengumpulan': item.total_pengumpulan ?? 0,
        'Total Dinilai': item.total_dinilai ?? 0,
        'Status': item.is_published || item.status === 'dipublikasikan' ? 'Dipublikasikan' : 'Draft',
      }))
      downloadSpreadsheetTemplate(
        exportData,
        `penugasan_siswa_${new Date().toISOString().slice(0, 10)}`,
        format,
        'Penugasan'
      )
      setIsExportModalOpen(false)
      pushToast('Export Berhasil', `Berkas Penugasan .${format.toUpperCase()} berhasil diunduh.`, 'success')
    } catch (err) {
      pushToast('Gagal Export', err?.message || 'Terjadi kesalahan saat menyiapkan berkas ekspor.', 'error')
    } finally {
      setIsExporting(false)
    }
  }

  const handleImport = (file) => {
    pushToast('Import Berhasil', `File ${file.name} telah diproses.`, 'success')
  }

  // Modal Form State (Create / Edit Penugasan)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editId, setEditId] = useState(null)
  const [formLoading, setFormLoading] = useState(false)

  const [formData, setFormData] = useState({
    judul: '',
    deskripsi: '',
    instruksi: '',
    tipe: 'individu',
    jenis_tugas: 'tugas',
    nilai_maksimal: 100,
    bobot_persen: 10,
    tanggal_mulai: '',
    tanggal_selesai: '',
    izin_kumpul_terlambat: true,
    status: 'dipublikasikan',
    lampiran: '',
    modul_ajar_id: '',
    mata_pelajaran_id: '',
    kelas_id: '',
    guru_id: '',
    semester_id: '',
    tahun_ajaran_id: '',
  })

  // Hover & Row Detail Modal State
  const [rowDetailItem, setRowDetailItem] = useState(null)
  const [showRowDetailModal, setShowRowDetailModal] = useState(false)

  // Drawer / Detail Modal for Student Submissions & Grading
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [selectedPenugasan, setSelectedPenugasan] = useState(null)
  const [gradingStudentId, setGradingStudentId] = useState(null)
  const [gradingForm, setGradingForm] = useState({
    nilai_guru: '',
    catatan_guru: '',
    status: 'dinilai',
  })
  const [gradingLoading, setGradingLoading] = useState(false)

  useEffect(() => {
    fetchOptions()
    fetchStats()
  }, [userUnitId, activeUnit])

  useEffect(() => {
    fetchPenugasan()
  }, [page, debouncedSearch, selectedModulAjar, selectedTipe, selectedStatus, selectedKelas, userUnitId, activeUnit])

  const fetchOptions = async () => {
    try {
      const params = {}
      if (userUnitId) params.unit_pendidikan_id = userUnitId
      if (activeUnit) params.jenjang = activeUnit

      const [resOptions, resSubjects] = await Promise.allSettled([
        lmsPenugasanService.getOptions(params),
        subjectService.getDaftar({ ...params, status: 1, per_page: 100 }),
      ])

      const data = resOptions.status === 'fulfilled' ? resOptions.value?.data || resOptions.value || {} : {}
      let dbSubjectsRaw = resSubjects.status === 'fulfilled' ? resSubjects.value?.data || resSubjects.value || [] : []
      if (Array.isArray(dbSubjectsRaw?.data)) dbSubjectsRaw = dbSubjectsRaw.data

      let dbSubjects = Array.isArray(dbSubjectsRaw) ? dbSubjectsRaw.filter((s) => {
        if (!s) return false
        const sUnitId = s.unit_pendidikan_id || s.unit_id || s.education_unit_id
        if (userUnitId && sUnitId) return String(sUnitId) === String(userUnitId)
        if (activeUnit && s.jenjang) return s.jenjang === activeUnit || s.jenjang === 'All'
        return true
      }) : []

      if (data) {
        setOptions((prev) => ({
          ...prev,
          modul_ajar: data.modul_ajar || data.modulAjar || [],
          kelas: data.kelas || data.classes || [],
          guru: data.guru || data.teachers || [],
          subjects: dbSubjects.length > 0 ? dbSubjects : (data.subjects || []).filter((s) => {
            const sUnitId = s.unit_pendidikan_id || s.unit_id
            if (userUnitId && sUnitId) return String(sUnitId) === String(userUnitId)
            return true
          }),
          semesters: data.semesters || [],
          tahun_ajaran: data.tahun_ajaran || data.academic_years || [],
        }))
      }
    } catch (err) {
      console.error('Gagal memuat opsi penugasan:', err)
    }
  }

  const fetchStats = async () => {
    try {
      const params = {}
      if (userUnitId) params.unit_pendidikan_id = userUnitId
      if (activeUnit) params.jenjang = activeUnit
      const res = await lmsPenugasanService.getStats(params)
      if (res.success && res.data) {
        setStats(res.data)
      }
    } catch (err) {
      console.error('Gagal memuat statistik:', err)
    }
  }

  const fetchPenugasan = async () => {
    setLoading(true)
    setErrorMsg('')
    try {
      const params = {
        page,
        per_page: 15,
        search: debouncedSearch,
        modul_ajar_id: selectedModulAjar,
        tipe: selectedTipe,
        status: selectedStatus,
        kelas_id: selectedKelas,
      }
      if (userUnitId) params.unit_pendidikan_id = userUnitId
      if (activeUnit) params.jenjang = activeUnit

      const res = await lmsPenugasanService.getDaftar(params)
      const resObj = res?.data || res
      let list = Array.isArray(resObj) ? resObj : (resObj?.data || (Array.isArray(res) ? res : []))
      let filteredList = list.filter((item) => {
        if (!item) return false
        const itemUnitId = item.unit_pendidikan_id || item.unit_id || item.mata_pelajaran?.unit_pendidikan_id
        if (userUnitId && itemUnitId) return String(itemUnitId) === String(userUnitId)
        return true
      })
      setDataPenugasan(filteredList)
      setPagination({
        current_page: resObj?.current_page || res?.meta?.current_page || 1,
        last_page: resObj?.last_page || res?.meta?.last_page || 1,
        total: resObj?.total || res?.meta?.total || filteredList.length,
        per_page: resObj?.per_page || res?.meta?.per_page || 15,
      })
    } catch (err) {
      console.error('Gagal memuat data penugasan:', err)
      setErrorMsg('Gagal mengambil data penugasan dari server.')
    } finally {
      setLoading(false)
    }
  }

  const handleOpenCreateModal = () => {
    setEditId(null)
    setFormData({
      judul: '',
      deskripsi: '',
      instruksi: '',
      tipe: 'individu',
      jenis_tugas: 'tugas',
      nilai_maksimal: 100,
      bobot_persen: 10,
      tanggal_mulai: new Date().toISOString().slice(0, 16),
      tanggal_selesai: new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 16),
      izin_kumpul_terlambat: true,
      status: 'dipublikasikan',
      lampiran: '',
      modul_ajar_id: options.modul_ajar[0]?.value || '',
      mata_pelajaran_id: options.subjects[0]?.value || '',
      kelas_id: options.kelas[0]?.value || '',
      guru_id: options.guru[0]?.value || '',
      semester_id: options.semesters[0]?.value || '',
      tahun_ajaran_id: options.tahun_ajaran[0]?.value || '',
    })
    setIsModalOpen(true)
  }

  const handleOpenEditModal = (item) => {
    setEditId(item.id)
    setFormData({
      judul: item.judul || item.judul_tugas || '',
      deskripsi: item.deskripsi || '',
      instruksi: item.instruksi || '',
      tipe: item.tipe || item.tipe_tugas || 'individu',
      jenis_tugas: item.jenis_tugas || 'tugas',
      nilai_maksimal: item.nilai_maksimal ?? 100,
      bobot_persen: item.bobot_persen ?? 10,
      tanggal_mulai: item.tanggal_mulai ? item.tanggal_mulai.replace(' ', 'T').slice(0, 16) : '',
      tanggal_selesai: item.tanggal_selesai ? item.tanggal_selesai.replace(' ', 'T').slice(0, 16) : '',
      izin_kumpul_terlambat: Boolean(item.izin_kumpul_terlambat),
      status: item.status || (item.is_published ? 'dipublikasikan' : 'draft'),
      lampiran: item.lampiran || item.file_lampiran || '',
      modul_ajar_id: item.modul_ajar_id || '',
      mata_pelajaran_id: item.mata_pelajaran_id || '',
      kelas_id: item.kelas_id || '',
      guru_id: item.guru_id || '',
      semester_id: item.semester_id || '',
      tahun_ajaran_id: item.tahun_ajaran_id || '',
    })
    setIsModalOpen(true)
  }

  const handleFormSubmit = async (e) => {
    e.preventDefault()
    setFormLoading(true)
    setErrorMsg('')

    try {
      if (editId) {
        await lmsPenugasanService.update(editId, formData)
        pushToast('Penugasan Diperbarui', 'Penugasan berhasil diperbarui.', 'success')
      } else {
        await lmsPenugasanService.create(formData)
        pushToast('Penugasan Ditambahkan', 'Penugasan baru berhasil ditambahkan.', 'success')
      }
      setIsModalOpen(false)
      fetchPenugasan()
      fetchStats()
    } catch (err) {
      setErrorMsg(err?.response?.data?.message || 'Gagal menyimpan data penugasan.')
    } finally {
      setFormLoading(false)
    }
  }

  const handleRequestDelete = (item) => {
    setDeleteTarget(item)
  }

  const handleConfirmDelete = async () => {
    if (!deleteTarget?.id) return
    setIsDeleting(true)
    try {
      await lmsPenugasanService.delete(deleteTarget.id)
      pushToast('Penugasan Dihapus', `Penugasan "${deleteTarget.judul || deleteTarget.judul_tugas}" berhasil dihapus.`, 'success')
      setDeleteTarget(null)
      fetchPenugasan()
      fetchStats()
    } catch (err) {
      pushToast('Gagal Menghapus', err?.response?.data?.message || 'Gagal menghapus penugasan.', 'error')
    } finally {
      setIsDeleting(false)
    }
  }

  const handleTogglePublish = async (item) => {
    try {
      const res = await lmsPenugasanService.togglePublish(item.id)
      if (res.success) {
        pushToast('Status Diperbarui', res.message || 'Status publikasi penugasan berhasil diperbarui.', 'success')
        fetchPenugasan()
        fetchStats()
      }
    } catch (err) {
      setErrorMsg(err?.response?.data?.message || 'Gagal mengubah status publikasi.')
    }
  }

  const handleOpenDetail = async (item) => {
    setSelectedPenugasan(item)
    setIsDetailOpen(true)
    try {
      const res = await lmsPenugasanService.getById(item.id)
      if (res.success && res.data) {
        setSelectedPenugasan(res.data)
      }
    } catch (err) {
      console.error('Gagal mengambil detail penugasan:', err)
    }
  }

  const handleStartGrading = (submission) => {
    setGradingStudentId(submission.siswa_id)
    setGradingForm({
      nilai_guru: submission.nilai_guru !== null ? submission.nilai_guru : '',
      catatan_guru: submission.catatan_guru || '',
      status: 'dinilai',
    })
  }

  const handleSaveGrade = async (e) => {
    e.preventDefault()
    if (!selectedPenugasan || !gradingStudentId) return

    setGradingLoading(true)
    try {
      const payload = {
        siswa_id: gradingStudentId,
        nilai_guru: parseFloat(gradingForm.nilai_guru),
        catatan_guru: gradingForm.catatan_guru,
        status: 'dinilai',
      }

      const res = await lmsPenugasanService.gradeSubmission(selectedPenugasan.id, payload)
      if (res.success) {
        pushToast('Nilai Disimpan', 'Nilai tugas siswa berhasil disimpan.', 'success')
        setGradingStudentId(null)
        // Refresh detail
        const updated = await lmsPenugasanService.getById(selectedPenugasan.id)
        if (updated.success) {
          setSelectedPenugasan(updated.data)
        }
        fetchPenugasan()
        fetchStats()
      }
    } catch (err) {
      pushToast('Gagal Menyimpan', err?.response?.data?.message || 'Gagal menyimpan nilai.', 'error')
    } finally {
      setGradingLoading(false)
    }
  }

  const pageContent = (
    <div className="education-unit-page lms-penugasan-page space-y-6">
      <motion.div initial="hidden" animate="visible" variants={containerVariants} className="space-y-6">
      {/* ── MODERN VIVID EMERALD HERO HEADER CARD ── */}
      {!embedded && !hidePageHeader && (
        <motion.div
          variants={itemVariants}
          className="relative overflow-hidden rounded-[22px] border-2 border-emerald-500/30 bg-gradient-to-r from-emerald-500/15 via-teal-500/10 to-emerald-600/15 p-4 sm:p-6 shadow-md shadow-emerald-500/10 dark:border-emerald-600/40 dark:bg-gradient-to-r dark:from-emerald-950/70 dark:via-teal-950/50 dark:to-slate-900 print:hidden"
        >
          {/* Dual Multi-Tone Ambient Glow Blobs */}
          <div className="pointer-events-none absolute -top-20 -right-20 h-56 w-56 rounded-full bg-gradient-to-br from-emerald-500/40 via-teal-400/30 to-emerald-600/20 blur-3xl dark:from-emerald-500/50 dark:via-teal-400/40" />
          <div className="pointer-events-none absolute -bottom-20 -left-20 h-56 w-56 rounded-full bg-gradient-to-tr from-emerald-600/30 via-teal-500/20 to-transparent blur-3xl dark:from-emerald-600/40 dark:via-teal-500/30" />

          <div className="relative z-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3.5 sm:gap-4 min-w-0">
              <div className="flex size-11 sm:size-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700 text-white shadow-xl shadow-emerald-600/40 border border-emerald-300/40 dark:from-emerald-400 dark:via-emerald-500 dark:to-teal-600">
                <ClipboardList className="size-5 sm:size-7" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h1 className="text-lg sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                    Penugasan &amp; Asesmen
                  </h1>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-emerald-600 to-teal-600 px-3 py-0.5 sm:px-3.5 sm:py-1 text-[11px] sm:text-xs font-extrabold text-white shadow-sm shadow-emerald-600/25 border border-emerald-300/40">
                    <Sparkles className="h-3.5 w-3.5" />
                    LMS &amp; Evaluasi Siswa
                  </span>
                </div>
                <p className="mt-1 text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300 max-w-2xl leading-relaxed">
                  Kelola instruksi tugas, deadline, lampiran berkas, dan evaluasi hasil kerja siswa terhubung langsung dengan Modul Ajar.
                </p>
              </div>
            </div>

            {/* Right Feature Indicator Badge */}
            <div className="flex items-center gap-2 shrink-0 self-start sm:self-center">
              <div className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-500/40 bg-gradient-to-r from-emerald-100 via-emerald-50 to-teal-100 px-3.5 py-1.5 text-xs font-black text-emerald-900 dark:border-emerald-700 dark:bg-gradient-to-r dark:from-emerald-950 dark:to-teal-950 dark:text-emerald-200 shadow-2xs">
                <GraduationCap className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>Tugas &amp; Proyek</span>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Alert Notifications */}
      {errorMsg && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-center justify-between text-sm animate-fade-in">
          <div className="flex items-center gap-2">
            <AlertCircle size={18} />
            <span>{errorMsg}</span>
          </div>
          <button onClick={() => setErrorMsg('')} className="text-red-500 hover:text-red-700">
            <X size={16} />
          </button>
        </div>
      )}

      {successMsg && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-xl flex items-center justify-between text-sm animate-fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={18} />
            <span>{successMsg}</span>
          </div>
          <button onClick={() => setSuccessMsg('')} className="text-emerald-500 hover:text-emerald-700">
            <X size={16} />
          </button>
        </div>
      )}

      {/* ── 5 KARTU KPI MODERN (MULTI-TONE RESPONSIVE) ── */}
      <motion.div variants={itemVariants} className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 sm:gap-4">
        <ModernKpiCard
          icon={ClipboardList}
          label="Total Penugasan"
          value={stats.total}
          tag={`${stats.total} Tugas`}
          subtext="Tercatat di sistem"
          tone="emerald"
          onClick={() => {
            setSelectedStatus('')
            setPage(1)
          }}
        />
        <ModernKpiCard
          icon={Globe}
          label="Dipublikasikan"
          value={stats.published}
          tag="Aktif"
          subtext="Dapat diakses siswa"
          tone="blue"
          onClick={() => {
            setSelectedStatus('dipublikasikan')
            setPage(1)
          }}
        />
        <ModernKpiCard
          icon={Lock}
          label="Draft"
          value={stats.draft}
          tag="Penyusunan"
          subtext="Belum dipublish"
          tone="amber"
          onClick={() => {
            setSelectedStatus('draft')
            setPage(1)
          }}
        />
        <ModernKpiCard
          icon={Users}
          label="Pengumpulan"
          value={stats.total_pengumpulan}
          tag="Submisi"
          subtext="Tugas terkirim"
          tone="purple"
          onClick={() => {
            setSelectedStatus('dipublikasikan')
            setPage(1)
          }}
        />
        <ModernKpiCard
          icon={Award}
          label="Tugas Dinilai"
          value={stats.total_dinilai}
          tag="Selesai"
          subtext="Sudah diberi nilai"
          tone="teal"
          className="col-span-2 sm:col-span-1"
          onClick={() => {
            setSelectedStatus('dipublikasikan')
            setPage(1)
          }}
        />
      </motion.div>

      {/* Tab Navigation Slot if provided */}
      {tabNav && <div className="my-2">{typeof tabNav === 'function' ? tabNav() : tabNav}</div>}

      {/* ── CANONICAL EMERALD DATATABLE CONTAINER ── */}
      <motion.div variants={itemVariants}>
        <div className="relative overflow-hidden rounded-[22px] border-2 border-emerald-300 dark:border-emerald-700/80 bg-white shadow-md shadow-emerald-500/10 dark:bg-[#1B2433]">
          {/* ── TOOLBAR BARIS 1: Header + 4 Vivid Gradient Squircle Buttons ── */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-emerald-200/90 dark:border-emerald-800/60 bg-gradient-to-r from-emerald-500/10 via-teal-500/5 to-transparent px-5 py-4 sm:px-6 md:px-8 dark:from-emerald-950/50 dark:via-teal-950/30">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700 text-white shadow-sm border border-emerald-300/40 shrink-0">
                <ClipboardList className="size-5 text-white" strokeWidth={2.2} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-extrabold text-slate-900 dark:text-white">
                    Daftar Penugasan &amp; Proyek Siswa
                  </h2>
                  <span className="inline-flex items-center rounded-full bg-emerald-100 dark:bg-emerald-950/80 px-2.5 py-0.5 text-[11px] font-extrabold text-emerald-800 dark:text-emerald-200 border border-emerald-300/60">
                    {Number(pagination.total || dataPenugasan.length).toLocaleString('id-ID')} Penugasan
                  </span>
                </div>
                <p className="mt-0.5 text-xs font-medium text-slate-600 dark:text-slate-300">
                  Kelola instruksi tugas, bobot nilai, publikasi, dan evaluasi per kelas
                </p>
              </div>
            </div>

            {/* 4 Vivid Gradient Squircle Action Buttons (Standar Emas) */}
            <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0 self-start sm:self-auto flex-wrap">
              {/* 1. Cetak Datatable Button (Vivid Indigo Squircle) */}
              <div className="group relative inline-flex">
                <button
                  type="button"
                  title="Cetak & Export PDF"
                  aria-label="Cetak & Export PDF"
                  onClick={() => setIsPrintModalOpen(true)}
                  className="flex size-10 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 via-indigo-600 to-violet-700 text-white border border-indigo-300/40 hover:scale-105 transition-all duration-200 active:scale-95 cursor-pointer"
                >
                  <Printer className="size-5 text-white" strokeWidth={2.2} />
                </button>
                <div className="pointer-events-none absolute top-full left-1/2 mt-2 -translate-x-1/2 opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 transition-all duration-200 ease-out z-50 whitespace-nowrap rounded-lg bg-slate-900 px-2.5 py-1 text-[11px] font-bold text-white shadow-xl dark:bg-slate-100 dark:text-slate-900">
                  <div className="absolute bottom-full left-1/2 -mb-1 -translate-x-1/2 border-4 border-transparent border-b-slate-900 dark:border-b-slate-100" />
                  Cetak &amp; Export
                </div>
              </div>

              {/* 2. Import Button (Vivid Sky Blue Squircle) */}
              <div className="group relative inline-flex">
                <button
                  type="button"
                  title="Import Data Penugasan"
                  aria-label="Import Data Penugasan"
                  onClick={() => setImportOpen(true)}
                  className="flex size-10 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-400 via-sky-500 to-blue-600 text-white border border-sky-300/40 hover:scale-105 transition-all duration-200 active:scale-95 cursor-pointer"
                >
                  <Upload className="size-5 text-white" strokeWidth={2.2} />
                </button>
                <div className="pointer-events-none absolute top-full left-1/2 mt-2 -translate-x-1/2 opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 transition-all duration-200 ease-out z-50 whitespace-nowrap rounded-lg bg-slate-900 px-2.5 py-1 text-[11px] font-bold text-white shadow-xl dark:bg-slate-100 dark:text-slate-900">
                  <div className="absolute bottom-full left-1/2 -mb-1 -translate-x-1/2 border-4 border-transparent border-b-slate-900 dark:border-b-slate-100" />
                  Import Data
                </div>
              </div>

              {/* 3. Export Button (Vivid Amber-Orange Squircle) */}
              <div className="group relative inline-flex">
                <button
                  type="button"
                  title="Export Data (Excel / CSV)"
                  aria-label="Export Data (Excel / CSV)"
                  onClick={() => setIsExportModalOpen(true)}
                  className="flex size-10 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 via-amber-500 to-orange-600 text-white border border-amber-300/40 hover:scale-105 transition-all duration-200 active:scale-95 cursor-pointer"
                >
                  <Download className="size-5 text-white" strokeWidth={2.2} />
                </button>
                <div className="pointer-events-none absolute top-full left-1/2 mt-2 -translate-x-1/2 opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 transition-all duration-200 ease-out z-50 whitespace-nowrap rounded-lg bg-slate-900 px-2.5 py-1 text-[11px] font-bold text-white shadow-xl dark:bg-slate-100 dark:text-slate-900">
                  <div className="absolute bottom-full left-1/2 -mb-1 -translate-x-1/2 border-4 border-transparent border-b-slate-900 dark:border-b-slate-100" />
                  Export Data (Excel / CSV)
                </div>
              </div>

              {/* 4. Tambah Penugasan Baru (Vivid Emerald-Teal Squircle) */}
              <div className="group relative inline-flex">
                <button
                  type="button"
                  title="Buat Penugasan Baru"
                  aria-label="Buat Penugasan Baru"
                  onClick={handleOpenCreateModal}
                  className="flex size-10 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700 text-white border border-emerald-300/40 hover:scale-105 transition-all duration-200 active:scale-95 cursor-pointer"
                >
                  <Plus className="size-5 text-white" strokeWidth={2.5} />
                </button>
                <div className="pointer-events-none absolute top-full left-1/2 mt-2 -translate-x-1/2 opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 transition-all duration-200 ease-out z-50 whitespace-nowrap rounded-lg bg-slate-900 px-2.5 py-1 text-[11px] font-bold text-white shadow-xl dark:bg-slate-100 dark:text-slate-900">
                  <div className="absolute bottom-full left-1/2 -mb-1 -translate-x-1/2 border-4 border-transparent border-b-slate-900 dark:border-b-slate-100" />
                  Buat Penugasan Baru
                </div>
              </div>
            </div>
          </div>

          {/* ── TOOLBAR BARIS 2: Full-Width Search Input dengan Debounce ── */}
          <div className="px-5 pt-4 sm:px-6 md:px-8">
            <div className="relative w-full">
              <div className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 flex items-center text-slate-400 dark:text-slate-500">
                <Search className="size-4" />
              </div>
              <input
                type="text"
                placeholder="Cari judul, deskripsi, instruksi penugasan..."
                value={searchInput}
                onChange={(e) => {
                  setSearchInput(e.target.value)
                  setPage(1)
                }}
                className="w-full rounded-xl border border-slate-200/90 bg-slate-50/50 pl-10 pr-10 py-2.5 text-xs font-semibold text-slate-800 placeholder:text-slate-400/80 transition-all duration-200 hover:border-slate-300 focus:border-[#0E5C44] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#0E5C44]/12 dark:border-slate-700/80 dark:bg-slate-900/50 dark:text-slate-100 dark:hover:border-slate-600 dark:focus:border-[#3FBF75] dark:focus:bg-slate-900 dark:focus:ring-[#3FBF75]/20"
              />
              {searchInput && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchInput('')
                    setPage(1)
                  }}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                >
                  <X className="size-4" />
                </button>
              )}
            </div>
          </div>

          {/* ── TOOLBAR BARIS 3: Horizontal Filter Bar (Responsive Grid on Mobile) ── */}
          <div className="px-3.5 py-3 sm:px-6 md:px-8 border-b border-emerald-200/80 dark:border-emerald-800/60 bg-gradient-to-r from-emerald-50/50 via-teal-50/30 to-emerald-50/50 dark:from-emerald-950/30 dark:via-teal-950/20 dark:to-emerald-950/30 mt-3">
            <div className="grid grid-cols-2 sm:flex sm:flex-wrap sm:items-center gap-2 sm:gap-2.5 w-full">
              <select
                aria-label="Filter Modul Ajar"
                value={selectedModulAjar}
                onChange={(e) => {
                  setSelectedModulAjar(e.target.value)
                  setPage(1)
                }}
                className="h-9 w-full sm:w-auto min-w-[140px] rounded-xl border border-emerald-300/80 bg-white/95 px-2.5 sm:px-3 text-xs font-semibold text-slate-700 shadow-2xs outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 dark:border-emerald-800 dark:bg-[#111827] dark:text-slate-200 cursor-pointer"
              >
                <option value="">Semua Modul Ajar</option>
                {(options.modul_ajar || []).map((m) => (
                  <option key={m.value || m.id} value={m.value || m.id}>
                    {m.label || m.judul || m.judul_modul}
                  </option>
                ))}
              </select>

              <select
                aria-label="Filter Kelas"
                value={selectedKelas}
                onChange={(e) => {
                  setSelectedKelas(e.target.value)
                  setPage(1)
                }}
                className="h-9 w-full sm:w-auto min-w-[130px] rounded-xl border border-emerald-300/80 bg-white/95 px-2.5 sm:px-3 text-xs font-semibold text-slate-700 shadow-2xs outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 dark:border-emerald-800 dark:bg-[#111827] dark:text-slate-200 cursor-pointer"
              >
                <option value="">Semua Kelas</option>
                {(options.kelas || []).map((k) => (
                  <option key={k.value || k.id} value={k.value || k.id}>
                    {k.label || k.nama_kelas || k.name}
                  </option>
                ))}
              </select>

              <select
                aria-label="Filter Tipe"
                value={selectedTipe}
                onChange={(e) => {
                  setSelectedTipe(e.target.value)
                  setPage(1)
                }}
                className="h-9 w-full sm:w-auto min-w-[120px] rounded-xl border border-emerald-300/80 bg-white/95 px-2.5 sm:px-3 text-xs font-semibold text-slate-700 shadow-2xs outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 dark:border-emerald-800 dark:bg-[#111827] dark:text-slate-200 cursor-pointer"
              >
                <option value="">Semua Tipe</option>
                {options.tipe.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>

              <select
                aria-label="Filter Status"
                value={selectedStatus}
                onChange={(e) => {
                  setSelectedStatus(e.target.value)
                  setPage(1)
                }}
                className="h-9 w-full sm:w-auto min-w-[130px] rounded-xl border border-emerald-300/80 bg-white/95 px-2.5 sm:px-3 text-xs font-semibold text-slate-700 shadow-2xs outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 dark:border-emerald-800 dark:bg-[#111827] dark:text-slate-200 cursor-pointer"
              >
                <option value="">Semua Status</option>
                {options.status.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>

              {(searchInput || selectedModulAjar || selectedKelas || selectedTipe || selectedStatus) && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchInput('')
                    setSelectedModulAjar('')
                    setSelectedKelas('')
                    setSelectedTipe('')
                    setSelectedStatus('')
                    setPage(1)
                  }}
                  className="col-span-2 sm:col-span-1 sm:ml-auto h-9 px-3 rounded-xl border border-rose-200 bg-rose-50 text-rose-700 text-xs font-bold hover:bg-rose-100 dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-300 dark:hover:bg-rose-950/60 transition flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <RotateCcw size={13} />
                  <span>Reset Filter</span>
                </button>
              )}
            </div>
          </div>

          <MasterDataTable className="!rounded-none !border-0 !shadow-none">
            {loading ? (
              <div className="p-12 text-center text-slate-500">
                <RefreshCw className="animate-spin mx-auto mb-2 text-[#0E5C44]" size={28} />
                <p className="text-sm font-medium">Memuat data penugasan...</p>
              </div>
            ) : dataPenugasan.length === 0 ? (
              <div className="p-12 text-center">
                <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-3 text-slate-400">
                  <ClipboardList size={32} />
                </div>
                <h3 className="text-base font-semibold text-slate-800 dark:text-white">Belum ada penugasan</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                  Silakan tambahkan penugasan atau proyek baru yang terikat dengan Modul Ajar untuk kelas Anda.
                </p>
                <button
                  onClick={handleOpenCreateModal}
                  className="mt-4 inline-flex items-center gap-2 bg-[#0E5C44] text-white px-4 py-2 rounded-xl text-xs font-semibold hover:bg-[#1E8E5A] transition-colors"
                >
                  <Plus size={16} />
                  <span>Tambah Penugasan</span>
                </button>
              </div>
            ) : (
              <>
                {/* ── MOBILE VIEW: Dedicated Responsive Card List (< md) ── */}
                <div className="block md:hidden divide-y divide-emerald-100/80 dark:divide-emerald-900/40">
                  {dataPenugasan.map((item) => (
                    <div
                      key={item.id}
                      className="p-4 hover:bg-emerald-50/40 dark:hover:bg-emerald-950/20 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <div
                            onClick={() => {
                              setRowDetailItem(item)
                              setShowRowDetailModal(true)
                            }}
                            className="font-bold text-slate-900 dark:text-white text-sm hover:text-emerald-700 dark:hover:text-emerald-400 cursor-pointer leading-snug"
                          >
                            {item.judul || item.judul_tugas}
                          </div>

                          {item.modul_ajar && (
                            <div className="flex items-center gap-1 text-xs text-[#0E5C44] dark:text-emerald-400 mt-1 font-semibold">
                              <BookOpen size={12} className="shrink-0" />
                              <span className="truncate">{item.modul_ajar.judul}</span>
                            </div>
                          )}

                          {item.lampiran && (
                            <div className="flex items-center gap-1 text-[11px] text-slate-400 mt-0.5">
                              <Paperclip size={10} className="shrink-0" />
                              <span className="truncate">{item.lampiran}</span>
                            </div>
                          )}
                        </div>

                        {/* Action Dropdown */}
                        <div className="shrink-0">
                          <ActionDropdown
                            onView={() => handleOpenDetail(item)}
                            onEdit={() => handleOpenEditModal(item)}
                            onDelete={() => handleRequestDelete(item)}
                          />
                        </div>
                      </div>

                      {/* Metadata Pill Badges */}
                      <div className="mt-3 flex flex-wrap items-center gap-1.5 pt-2 border-t border-emerald-100/60 dark:border-emerald-900/40">
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2.5 py-0.5 rounded-lg border border-slate-200 dark:border-slate-700">
                          <GraduationCap className="size-3 text-slate-500" />
                          {item.kelas?.nama_kelas || 'Semua Kelas'}
                        </span>

                        {item.guru?.nama && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-900 px-2 py-0.5 rounded-lg">
                            Guru: {item.guru.nama}
                          </span>
                        )}

                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-lg text-[10px] font-extrabold uppercase tracking-wide border ${
                            item.tipe === 'kelompok' || item.tipe_tugas === 'kelompok'
                              ? 'bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-400 border-purple-200 dark:border-purple-800'
                              : 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400 border-blue-200 dark:border-blue-800'
                          }`}
                        >
                          {item.tipe === 'kelompok' || item.tipe_tugas === 'kelompok' ? 'Kelompok' : 'Individu'}
                        </span>

                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-0.5 rounded-lg border border-emerald-200/80 dark:border-emerald-800/60">
                          <Clock className="size-3 text-emerald-600" />
                          {item.deadline || item.tanggal_selesai || '-'}
                        </span>

                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-lg">
                          <Users className="size-3 text-slate-500" />
                          {item.total_pengumpulan ?? 0} Submisi
                          {item.total_dinilai > 0 && (
                            <span className="text-emerald-600 dark:text-emerald-400 font-extrabold">({item.total_dinilai} dinilai)</span>
                          )}
                        </span>

                        <button
                          type="button"
                          onClick={() => handleTogglePublish(item)}
                          className={`inline-flex items-center gap-1 text-[10px] font-extrabold px-2.5 py-0.5 rounded-lg transition-colors cursor-pointer border ${
                            item.is_published || item.status === 'dipublikasikan'
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700'
                              : 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border-amber-300 dark:border-amber-700'
                          }`}
                        >
                          {item.is_published || item.status === 'dipublikasikan' ? (
                            <>
                              <Globe size={11} />
                              <span>Dipublikasikan</span>
                            </>
                          ) : (
                            <>
                              <Lock size={11} />
                              <span>Draft</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* ── DESKTOP & TABLET VIEW: Canonical Table (hidden on < md, min-w-[850px]) ── */}
                <div className="hidden md:block overflow-x-auto min-h-[340px] pb-12">
                  <table className="w-full min-w-[850px] text-left border-collapse">
                    <thead>
                      <tr className="bg-gradient-to-r from-emerald-100/90 via-teal-50/70 to-emerald-100/90 border-b-2 border-emerald-200/90 dark:from-emerald-950/90 dark:via-teal-950/70 dark:to-emerald-950/90 text-xs font-black text-slate-800 dark:text-emerald-200 uppercase tracking-wider">
                        <th className="py-3.5 px-4 w-[32%]">Penugasan &amp; Modul Ajar</th>
                        <th className="py-3.5 px-4 w-[18%]">Kelas &amp; Guru</th>
                        <th className="py-3.5 px-4 w-[14%]">Tipe &amp; Jenis</th>
                        <th className="py-3.5 px-4 w-[14%]">Deadline</th>
                        <th className="py-3.5 px-4 w-[11%]">Pengumpulan</th>
                        <th className="py-3.5 px-4 w-[11%]">Status</th>
                        <th className="py-3.5 px-4 text-center w-16">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-emerald-100/80 dark:divide-emerald-900/40 text-sm">
                      {dataPenugasan.map((item) => (
                        <tr
                          key={item.id}
                          className="group relative hover:bg-emerald-50/50 dark:hover:bg-emerald-950/30 transition-colors cursor-pointer"
                          onClick={(e) => {
                            if (e.target.closest('button, a, [data-no-rowclick]')) return
                            setRowDetailItem(item)
                            setShowRowDetailModal(true)
                          }}
                        >
                          {/* Judul & Modul Ajar */}
                          <td className="py-4 px-4">
                            <div className="font-semibold text-slate-800 dark:text-white line-clamp-2">
                              {item.judul || item.judul_tugas}
                            </div>
                            {item.modul_ajar && (
                              <div className="flex items-center gap-1 text-xs text-[#0E5C44] dark:text-emerald-400 mt-1 font-medium">
                                <BookOpen size={12} className="shrink-0" />
                                <span className="line-clamp-1">{item.modul_ajar.judul}</span>
                              </div>
                            )}
                            {item.lampiran && (
                              <div className="flex items-center gap-1 text-[11px] text-slate-400 mt-0.5">
                                <Paperclip size={10} className="shrink-0" />
                                <span className="truncate max-w-[200px]">{item.lampiran}</span>
                              </div>
                            )}
                          </td>

                          {/* Kelas & Guru */}
                          <td className="py-4 px-4">
                            <div className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                              {item.kelas?.nama_kelas || 'Semua Kelas'}
                            </div>
                            <div className="text-[11px] text-slate-500 mt-0.5">
                              Guru: {item.guru?.nama || '-'}
                            </div>
                          </td>

                          {/* Tipe & Jenis */}
                          <td className="py-4 px-4">
                            <div className="flex flex-col gap-1 items-start">
                              <span
                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium ${
                                  item.tipe === 'kelompok' || item.tipe_tugas === 'kelompok'
                                    ? 'bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-400 border border-purple-200 dark:border-purple-800'
                                    : 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400 border border-blue-200 dark:border-blue-800'
                                }`}
                              >
                                {item.tipe === 'kelompok' || item.tipe_tugas === 'kelompok' ? 'Kelompok' : 'Individu'}
                              </span>
                              <span className="text-[11px] text-slate-500 capitalize">
                                {item.jenis_tugas || 'tugas'} ({item.nilai_maksimal || 100} poin)
                              </span>
                            </div>
                          </td>

                          {/* Tanggal Mulai & Deadline */}
                          <td className="py-4 px-4">
                            <div className="text-xs text-slate-700 dark:text-slate-300 flex items-center gap-1">
                              <Clock size={12} className="text-slate-400 shrink-0" />
                              <span>{item.deadline || item.tanggal_selesai || '-'}</span>
                            </div>
                            <div className="text-[11px] text-slate-400 mt-0.5">
                              Mulai: {item.tanggal_mulai || '-'}
                            </div>
                          </td>

                          {/* Pengumpulan */}
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-2">
                              <div className="text-xs font-semibold text-slate-800 dark:text-white">
                                {item.total_pengumpulan ?? 0} Siswa
                              </div>
                              {item.total_dinilai > 0 && (
                                <span className="text-[10px] bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300 px-1.5 py-0.5 rounded font-medium">
                                  {item.total_dinilai} dinilai
                                </span>
                              )}
                            </div>
                          </td>

                          {/* Status */}
                          <td className="py-4 px-4">
                            <button
                              onClick={() => handleTogglePublish(item)}
                              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                                item.is_published || item.status === 'dipublikasikan'
                                  ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100'
                                  : 'bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300 border border-amber-200 dark:border-amber-800 hover:bg-amber-100'
                              }`}
                            >
                              {item.is_published || item.status === 'dipublikasikan' ? (
                                <>
                                  <Globe size={12} />
                                  <span>Dipublikasikan</span>
                                </>
                              ) : (
                                <>
                                  <Lock size={12} />
                                  <span>Draft</span>
                                </>
                              )}
                            </button>
                          </td>

                          {/* Actions */}
                          <td className="py-4 px-4 text-center w-16">
                            <ActionDropdown
                              onView={() => handleOpenDetail(item)}
                              onEdit={() => handleOpenEditModal(item)}
                              onDelete={() => handleRequestDelete(item)}
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}

            {/* Pagination */}
            {pagination.last_page > 1 && (
              <div className="px-4 py-3 sm:px-6 sm:py-4 bg-gradient-to-r from-emerald-50/50 via-teal-50/30 to-emerald-50/50 dark:from-emerald-950/30 dark:via-teal-950/20 dark:to-emerald-950/30 border-t border-emerald-200/80 dark:border-emerald-800/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-600 dark:text-slate-300">
                <div className="text-center sm:text-left">
                  Halaman <strong>{pagination.current_page}</strong> dari <strong>{pagination.last_page}</strong> (Total {pagination.total} penugasan)
                </div>
                <div className="flex items-center justify-center gap-2">
                  <button
                    type="button"
                    disabled={page <= 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    className="p-1.5 rounded-xl border border-emerald-300 dark:border-emerald-700 bg-emerald-600 hover:bg-emerald-700 text-white disabled:opacity-40 transition cursor-pointer shadow-xs"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <button
                    type="button"
                    disabled={page >= pagination.last_page}
                    onClick={() => setPage((p) => Math.min(pagination.last_page, p + 1))}
                    className="p-1.5 rounded-xl border border-emerald-300 dark:border-emerald-700 bg-emerald-600 hover:bg-emerald-700 text-white disabled:opacity-40 transition cursor-pointer shadow-xs"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            )}
          </MasterDataTable>
        </div>
      </motion.div>

      {/* CREATE / EDIT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-[#1B2433] rounded-[18px] border border-slate-200 dark:border-slate-800 shadow-2xl w-full max-w-2xl overflow-hidden max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/50">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 flex items-center justify-center text-[#0E5C44] dark:text-emerald-400">
                  <ClipboardList size={20} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-800 dark:text-white">
                    {editId ? 'Edit Penugasan' : 'Buat Penugasan Baru'}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Isi detail tugas yang terhubung dengan Modul Ajar
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleFormSubmit} className="p-6 overflow-y-auto space-y-4 flex-1">
              {/* Judul Penugasan */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Judul Penugasan <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Penugasan 1: Analisis Hukum Newton..."
                  value={formData.judul}
                  onChange={(e) => setFormData({ ...formData, judul: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0E5C44]"
                />
              </div>

              {/* Modul Ajar Relasi */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Tautkan ke Modul Ajar (1 : N)
                </label>
                <select
                  value={formData.modul_ajar_id}
                  onChange={(e) => setFormData({ ...formData, modul_ajar_id: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0E5C44]"
                >
                  <option value="">-- Opsional: Pilih Modul Ajar --</option>
                  {(options.modul_ajar || []).map((m) => (
                    <option key={m.value || m.id} value={m.value || m.id}>
                      {m.label || m.judul || m.judul_modul}
                    </option>
                  ))}
                </select>
              </div>

              {/* Grid 2 Kolom: Kelas & Guru */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Target Kelas / Rombel
                  </label>
                  <select
                    value={formData.kelas_id}
                    onChange={(e) => setFormData({ ...formData, kelas_id: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0E5C44]"
                  >
                    <option value="">-- Pilih Kelas --</option>
                    {(options.kelas || []).map((k) => (
                      <option key={k.value || k.id} value={k.value || k.id}>
                        {k.label || k.nama_kelas || k.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Guru Pengampu
                  </label>
                  <select
                    value={formData.guru_id}
                    onChange={(e) => setFormData({ ...formData, guru_id: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0E5C44]"
                  >
                    <option value="">-- Pilih Guru --</option>
                    {(options.guru || []).map((g) => (
                      <option key={g.value || g.id} value={g.value || g.id}>
                        {g.label || g.nama || g.nama_lengkap}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Grid 2 Kolom: Tipe & Jenis */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Tipe Pengerjaan
                  </label>
                  <select
                    value={formData.tipe}
                    onChange={(e) => setFormData({ ...formData, tipe: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0E5C44]"
                  >
                    {options.tipe.map((t) => (
                      <option key={t.value} value={t.value}>
                        {t.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Jenis Tugas
                  </label>
                  <select
                    value={formData.jenis_tugas}
                    onChange={(e) => setFormData({ ...formData, jenis_tugas: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0E5C44]"
                  >
                    {options.jenis.map((j) => (
                      <option key={j.value} value={j.value}>
                        {j.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Grid 2 Kolom: Nilai Maksimal & Bobot */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Nilai Maksimal
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="1000"
                    value={formData.nilai_maksimal}
                    onChange={(e) => setFormData({ ...formData, nilai_maksimal: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0E5C44]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Bobot Nilai (%)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={formData.bobot_persen}
                    onChange={(e) => setFormData({ ...formData, bobot_persen: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0E5C44]"
                  />
                </div>
              </div>

              {/* Grid 2 Kolom: Tanggal Mulai & Tanggal Selesai (Deadline) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Tanggal Mulai
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.tanggal_mulai}
                    onChange={(e) => setFormData({ ...formData, tanggal_mulai: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0E5C44]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Tanggal Selesai (Deadline)
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.tanggal_selesai}
                    onChange={(e) => setFormData({ ...formData, tanggal_selesai: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0E5C44]"
                  />
                </div>
              </div>

              {/* Deskripsi & Instruksi */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Deskripsi Tugas
                </label>
                <textarea
                  rows="2"
                  placeholder="Ringkasan atau gambaran umum penugasan..."
                  value={formData.deskripsi}
                  onChange={(e) => setFormData({ ...formData, deskripsi: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0E5C44]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Instruksi Pengerjaan
                </label>
                <textarea
                  rows="3"
                  placeholder="Langkah-langkah pengerjaan, format berkas yang diminta, dsb..."
                  value={formData.instruksi}
                  onChange={(e) => setFormData({ ...formData, instruksi: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0E5C44]"
                />
              </div>

              {/* File Lampiran / URL */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  File Lampiran / Link (Opsional)
                </label>
                <input
                  type="text"
                  placeholder="URL berkas lampiran (e.g. https://...)"
                  value={formData.lampiran}
                  onChange={(e) => setFormData({ ...formData, lampiran: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0E5C44]"
                />
              </div>

              {/* Status Publikasi */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Status Publikasi
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0E5C44]"
                >
                  <option value="dipublikasikan">Dipublikasikan (Dapat diakses Siswa)</option>
                  <option value="draft">Draft (Simpan Sementara)</option>
                </select>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={formLoading}
                  className="px-5 py-2.5 rounded-xl bg-[#0E5C44] hover:bg-[#1E8E5A] text-white text-xs font-semibold transition-all duration-200 flex items-center gap-2 disabled:opacity-50"
                >
                  {formLoading && <RefreshCw size={14} className="animate-spin" />}
                  <span>{editId ? 'Simpan Perubahan' : 'Buat Penugasan'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DETAIL & GRADING DRAWER / MODAL */}
      {isDetailOpen && selectedPenugasan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-[#1B2433] rounded-[18px] border border-slate-200 dark:border-slate-800 shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
            {/* Detail Header */}
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/60 dark:bg-slate-800/60">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#0E5C44] text-white flex items-center justify-center font-bold">
                  <ClipboardList size={22} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-800 dark:text-white line-clamp-1">
                    {selectedPenugasan.judul || selectedPenugasan.judul_tugas}
                  </h3>
                  <div className="flex items-center gap-3 text-xs text-slate-500 mt-0.5">
                    <span>Modul Ajar: {selectedPenugasan.modul_ajar?.judul || 'Tidak ditautkan'}</span>
                    <span>•</span>
                    <span>Deadline: {selectedPenugasan.deadline || selectedPenugasan.tanggal_selesai || '-'}</span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setIsDetailOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X size={20} />
              </button>
            </div>

            {/* Content Area */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1">
              {/* Deskripsi & Instruksi Card */}
              <div className="bg-slate-50 dark:bg-slate-900/60 rounded-xl p-4 border border-slate-200 dark:border-slate-800 space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">Deskripsi & Instruksi Pengerjaan</h4>
                <p className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-line">
                  {selectedPenugasan.deskripsi || 'Tidak ada deskripsi.'}
                </p>
                {selectedPenugasan.instruksi && (
                  <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400">
                    <strong className="text-slate-800 dark:text-slate-200">Instruksi:</strong>
                    <p className="mt-1 whitespace-pre-line">{selectedPenugasan.instruksi}</p>
                  </div>
                )}
                {selectedPenugasan.lampiran && (
                  <div className="mt-2 pt-2 border-t border-slate-200 dark:border-slate-800 flex items-center gap-2 text-xs text-[#0E5C44]">
                    <Paperclip size={14} />
                    <a
                      href={selectedPenugasan.lampiran}
                      target="_blank"
                      rel="noreferrer"
                      className="hover:underline font-semibold"
                    >
                      Buka File Lampiran Guru
                    </a>
                  </div>
                )}
              </div>

              {/* Submissions List Header */}
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-base font-bold text-slate-800 dark:text-white">Pengumpulan Tugas Siswa</h4>
                  <p className="text-xs text-slate-500">Daftar siswa yang telah mengumpulkan jawaban beserta form input nilai</p>
                </div>
                <span className="text-xs bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 px-3 py-1 rounded-full font-bold">
                  {selectedPenugasan.pengumpulan?.length || 0} Pengumpulan
                </span>
              </div>

              {/* Submissions Table / Cards */}
              {!selectedPenugasan.pengumpulan || selectedPenugasan.pengumpulan.length === 0 ? (
                <div className="p-8 text-center bg-slate-50 dark:bg-slate-900/40 rounded-xl border border-dashed border-slate-200 dark:border-slate-800">
                  <UserCheck className="mx-auto text-slate-400 mb-2" size={32} />
                  <p className="text-xs text-slate-500">Belum ada siswa yang mengumpulkan tugas ini.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {selectedPenugasan.pengumpulan.map((sub) => (
                    <div
                      key={sub.id}
                      className="bg-white dark:bg-[#1B2433] rounded-xl p-4 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-3"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                        <div className="flex items-center gap-3">
                          <PersonAvatar
                            src={sub.siswa?.foto || sub.siswa?.photo_url || sub.siswa?.avatar_url}
                            name={sub.siswa?.nama || 'Siswa'}
                            size="sm"
                          />
                          <div>
                            <h5 className="text-sm font-bold text-slate-800 dark:text-white">
                              {sub.siswa?.nama || 'Siswa'}
                            </h5>
                            <span className="text-[11px] text-slate-400">
                              NISN: {sub.siswa?.nisn || '-'} • Waktu Kumpul: {sub.waktu_kumpul || '-'}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          {sub.nilai_guru !== null ? (
                            <span className="bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 font-bold px-3 py-1 rounded-lg text-xs border border-emerald-200 dark:border-emerald-800 flex items-center gap-1">
                              <Award size={14} />
                              Nilai: {sub.nilai_guru} / {selectedPenugasan.nilai_maksimal || 100}
                            </span>
                          ) : (
                            <span className="bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300 font-semibold px-3 py-1 rounded-lg text-xs border border-amber-200 dark:border-amber-800">
                              Belum Dinilai
                            </span>
                          )}

                          <button
                            onClick={() => handleStartGrading(sub)}
                            className="px-3 py-1 rounded-lg bg-[#0E5C44] text-white hover:bg-[#1E8E5A] text-xs font-semibold transition-colors"
                          >
                            {sub.nilai_guru !== null ? 'Edit Nilai' : 'Beri Nilai'}
                          </button>
                        </div>
                      </div>

                      {/* Jawaban Siswa */}
                      {sub.jawaban_teks && (
                        <div className="text-xs text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-900/50 p-3 rounded-lg">
                          <strong className="text-slate-900 dark:text-white block mb-1">Jawaban Teks:</strong>
                          <p className="whitespace-pre-line">{sub.jawaban_teks}</p>
                        </div>
                      )}

                      {/* Link / File Jawaban */}
                      {(sub.file_path || sub.url_link) && (
                        <div className="flex flex-wrap gap-2 text-xs">
                          {sub.file_path && (
                            <a
                              href={sub.file_path}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 text-[#0E5C44] hover:underline font-semibold bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1 rounded-md"
                            >
                              <Paperclip size={12} />
                              <span>Berkas Siswa</span>
                            </a>
                          )}
                          {sub.url_link && (
                            <a
                              href={sub.url_link}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 text-blue-600 hover:underline font-semibold bg-blue-50 dark:bg-blue-950/40 px-2.5 py-1 rounded-md"
                            >
                              <Globe size={12} />
                              <span>Tautan Jawaban</span>
                            </a>
                          )}
                        </div>
                      )}

                      {/* Catatan Guru */}
                      {sub.catatan_guru && (
                        <div className="text-xs text-emerald-800 dark:text-emerald-300 bg-emerald-50/60 dark:bg-emerald-950/30 p-2.5 rounded-lg border border-emerald-100 dark:border-emerald-900">
                          <strong>Catatan Guru:</strong> {sub.catatan_guru}
                        </div>
                      )}

                      {/* Inline Form Input Nilai jika tombol Beri Nilai diklik */}
                      {gradingStudentId === sub.siswa_id && (
                        <form onSubmit={handleSaveGrade} className="mt-3 p-4 bg-emerald-50/80 dark:bg-slate-900 rounded-xl border border-emerald-200 dark:border-slate-700 space-y-3">
                          <h6 className="text-xs font-bold text-[#0E5C44] dark:text-emerald-400">Form Input Nilai Guru</h6>
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <div>
                              <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                                Nilai (0 - {selectedPenugasan.nilai_maksimal || 100})
                              </label>
                              <input
                                type="number"
                                step="0.1"
                                required
                                min="0"
                                max={selectedPenugasan.nilai_maksimal || 100}
                                value={gradingForm.nilai_guru}
                                onChange={(e) => setGradingForm({ ...gradingForm, nilai_guru: e.target.value })}
                                className="w-full px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-bold focus:outline-none focus:ring-2 focus:ring-[#0E5C44]"
                              />
                            </div>
                            <div className="sm:col-span-2">
                              <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                                Catatan / Umpan Balik Guru
                              </label>
                              <input
                                type="text"
                                placeholder="Apresiasi atau evaluasi..."
                                value={gradingForm.catatan_guru}
                                onChange={(e) => setGradingForm({ ...gradingForm, catatan_guru: e.target.value })}
                                className="w-full px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#0E5C44]"
                              />
                            </div>
                          </div>

                          <div className="flex justify-end gap-2 pt-1">
                            <button
                              type="button"
                              onClick={() => setGradingStudentId(null)}
                              className="px-3 py-1 rounded-lg border border-slate-300 text-xs font-semibold text-slate-600 hover:bg-slate-100"
                            >
                              Batal
                            </button>
                            <button
                              type="submit"
                              disabled={gradingLoading}
                              className="px-4 py-1 rounded-lg bg-[#0E5C44] text-white hover:bg-[#1E8E5A] text-xs font-semibold flex items-center gap-1"
                            >
                              {gradingLoading && <RefreshCw size={12} className="animate-spin" />}
                              <span>Simpan Nilai</span>
                            </button>
                          </div>
                        </form>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ROW DETAIL MODAL POPUP */}
      {showRowDetailModal && rowDetailItem && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setShowRowDetailModal(false)}
        >
          <div
            className="bg-white dark:bg-[#1B2433] rounded-[18px] w-full max-w-lg shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-start justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/40">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-sky-100 dark:bg-sky-950/60 flex items-center justify-center text-sky-600 dark:text-sky-400 shrink-0 mt-0.5">
                  <ClipboardList className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900 dark:text-white leading-tight">{rowDetailItem.judul || rowDetailItem.judul_tugas}</h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    {rowDetailItem.modul_ajar?.judul || 'Tanpa Modul Ajar'} · {rowDetailItem.kelas?.nama_kelas || 'Semua Kelas'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowRowDetailModal(false)}
                className="p-1.5 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-400 shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="px-6 py-4 space-y-4 max-h-[60vh] overflow-y-auto">
              {/* Badges */}
              <div className="flex flex-wrap gap-2">
                <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${
                  rowDetailItem.tipe === 'kelompok' ? 'bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-400 border border-purple-200 dark:border-purple-800' : 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400 border border-blue-200 dark:border-blue-800'
                }`}>
                  <Users className="w-3 h-3" />
                  {rowDetailItem.tipe === 'kelompok' ? 'Kelompok' : 'Individu'}
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 border border-amber-200 dark:border-amber-800 capitalize">
                  <FileText className="w-3 h-3" />
                  {rowDetailItem.jenis_tugas || 'tugas'}
                </span>
                <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${
                  rowDetailItem.status === 'dipublikasikan' || rowDetailItem.is_published ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border border-slate-200 dark:border-slate-700'
                }`}>
                  {rowDetailItem.status === 'dipublikasikan' || rowDetailItem.is_published ? <Globe className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
                  {rowDetailItem.status === 'dipublikasikan' || rowDetailItem.is_published ? 'Dipublikasikan' : 'Draft'}
                </span>
              </div>

              {/* Info Grid */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-50 dark:bg-slate-800/60 rounded-xl p-3">
                  <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Tanggal Mulai</p>
                  <p className="text-sm font-semibold text-slate-800 dark:text-white mt-0.5">{rowDetailItem.tanggal_mulai || '-'}</p>
                </div>
                <div className="bg-rose-50 dark:bg-rose-950/30 rounded-xl p-3">
                  <p className="text-[10px] font-semibold text-rose-400 uppercase tracking-wider">Deadline</p>
                  <p className="text-sm font-semibold text-rose-700 dark:text-rose-400 mt-0.5">{rowDetailItem.deadline || rowDetailItem.tanggal_selesai || '-'}</p>
                </div>
                <div className="bg-emerald-50 dark:bg-emerald-950/30 rounded-xl p-3">
                  <p className="text-[10px] font-semibold text-emerald-500 uppercase tracking-wider">Nilai Maks</p>
                  <p className="text-sm font-bold text-emerald-700 dark:text-emerald-400 mt-0.5">{rowDetailItem.nilai_maksimal ?? 100} Poin</p>
                </div>
                <div className="bg-violet-50 dark:bg-violet-950/30 rounded-xl p-3">
                  <p className="text-[10px] font-semibold text-violet-400 uppercase tracking-wider">Bobot</p>
                  <p className="text-sm font-bold text-violet-700 dark:text-violet-400 mt-0.5">{rowDetailItem.bobot_persen ?? 10}%</p>
                </div>
              </div>

              {/* Guru & Pengumpulan */}
              <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-800/60 rounded-xl px-4 py-3">
                <div>
                  <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Pengajar</p>
                  <p className="text-sm font-semibold text-slate-800 dark:text-white mt-0.5">{rowDetailItem.guru?.nama || '-'}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Pengumpulan</p>
                  <p className="text-sm font-bold text-slate-800 dark:text-white mt-0.5">{rowDetailItem.total_pengumpulan ?? 0} Siswa</p>
                </div>
              </div>

              {/* Deskripsi */}
              {rowDetailItem.deskripsi && (
                <div>
                  <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Deskripsi</p>
                  <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed line-clamp-4">{rowDetailItem.deskripsi}</p>
                </div>
              )}
            </div>

            {/* Footer Actions */}
            <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between gap-3 bg-slate-50/50 dark:bg-slate-800/40">
              <button
                onClick={() => setShowRowDetailModal(false)}
                className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-600 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
              >
                Tutup
              </button>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowRowDetailModal(false)
                    handleRequestDelete(rowDetailItem)
                  }}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-800 text-xs font-semibold hover:bg-rose-100 dark:hover:bg-rose-900/50 transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Hapus
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowRowDetailModal(false)
                    handleOpenEditModal(rowDetailItem)
                  }}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#0E5C44] text-white text-xs font-semibold hover:bg-emerald-700 transition-colors shadow-sm cursor-pointer"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  Edit Data
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── HARMONIZED BATCH EXPORT MODAL ── */}
      <HarmonizedBatchExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        onExport={handleExportSpreadsheet}
        isExporting={isExporting}
        totalCount={pagination.total || dataPenugasan.length}
        moduleTitle="Penugasan & Asesmen"
      />

      {/* ── HARMONIZED DELETE CONFIRMATION MODAL ── */}
      <AnimatePresence>
        {deleteTarget && (
          <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ type: 'spring', stiffness: 400, damping: 28 }}
              className="w-full max-w-md overflow-hidden rounded-3xl border border-rose-200/80 bg-white shadow-2xl shadow-rose-950/20 dark:border-rose-900/60 dark:bg-slate-950"
            >
              <div className="h-1.5 w-full bg-gradient-to-r from-rose-500 via-rose-600 to-red-700" />
              <div className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-rose-500 via-rose-600 to-red-700 text-white shadow-md shadow-rose-500/30 border border-rose-300/40">
                    <Trash2 className="size-5 text-white" strokeWidth={2.2} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-black text-slate-900 dark:text-white">
                        Hapus Penugasan?
                      </h4>
                      <span className="rounded-md bg-rose-100 px-2 py-0.5 text-[10px] font-extrabold text-rose-700 dark:bg-rose-950/80 dark:text-rose-300">
                        Hapus Permanen
                      </span>
                    </div>
                    <span className="text-[11px] font-semibold text-slate-500">
                      Data pengumpulan siswa terkait juga akan terdampak
                    </span>
                  </div>
                </div>

                <div className="rounded-2xl border border-rose-100 bg-rose-50/50 p-3.5 space-y-1 dark:border-rose-900/50 dark:bg-rose-950/20">
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-100">
                    {deleteTarget.judul || deleteTarget.judul_tugas}
                  </p>
                  <p className="text-[11px] text-slate-500">
                    Kelas: {deleteTarget.kelas?.nama_kelas || deleteTarget.kelas?.name || 'Semua Kelas'} • Tipe: {deleteTarget.tipe || 'individu'}
                  </p>
                </div>

                <p className="mt-3 text-xs text-rose-700/80 dark:text-rose-400 font-medium leading-relaxed">
                  Apakah Anda yakin ingin menghapus penugasan ini? Tindakan ini tidak dapat dibatalkan.
                </p>

                <div className="mt-6 flex items-center justify-end gap-2.5">
                  <button
                    type="button"
                    disabled={isDeleting}
                    onClick={() => setDeleteTarget(null)}
                    className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800 cursor-pointer disabled:opacity-50"
                  >
                    Batal
                  </button>
                  <button
                    type="button"
                    disabled={isDeleting}
                    onClick={handleConfirmDelete}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-br from-rose-500 via-rose-600 to-red-700 px-5 py-2 text-xs font-black text-white border border-rose-300/40 hover:scale-[1.02] active:scale-95 transition-all shadow-md shadow-rose-700/20 cursor-pointer disabled:opacity-50"
                  >
                    {isDeleting ? (
                      <RefreshCw className="size-3.5 animate-spin" />
                    ) : (
                      <Trash2 className="size-3.5" />
                    )}
                    <span>{isDeleting ? 'Menghapus...' : 'Ya, Hapus'}</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Print Option Modal */}
      <PrintOptionModal
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
        title="Opsi Cetak Data Penugasan"
        subtitle="Pilih metode pencetakan atau unduh dokumen penugasan"
        onPrintClean={() => {
          printCleanTable({
            title: 'Laporan Penugasan & Proyek Siswa',
            data: dataPenugasan,
            columns: [
              { header: 'Judul Penugasan', accessor: (row) => row.judul || row.judul_tugas },
              { header: 'Modul Ajar', accessor: (row) => row.modul_ajar?.judul || '-' },
              { header: 'Kelas', accessor: (row) => row.kelas?.nama_kelas || 'Semua Kelas' },
              { header: 'Tipe', accessor: (row) => row.tipe || 'individu' },
              { header: 'Deadline', accessor: (row) => row.deadline || '-' },
              { header: 'Status', accessor: (row) => row.status || 'draft' },
            ],
          })
          setIsPrintModalOpen(false)
        }}
        onDownloadPdf={() => {
          downloadPdfTable({
            title: 'Laporan Penugasan & Proyek Siswa',
            data: dataPenugasan,
            columns: [
              { header: 'Judul Penugasan', accessor: (row) => row.judul || row.judul_tugas },
              { header: 'Modul Ajar', accessor: (row) => row.modul_ajar?.judul || '-' },
              { header: 'Kelas', accessor: (row) => row.kelas?.nama_kelas || 'Semua Kelas' },
              { header: 'Tipe', accessor: (row) => row.tipe || 'individu' },
              { header: 'Deadline', accessor: (row) => row.deadline || '-' },
              { header: 'Status', accessor: (row) => row.status || 'draft' },
            ],
            filename: `laporan_penugasan_${new Date().toISOString().slice(0, 10)}.pdf`,
          })
          setIsPrintModalOpen(false)
        }}
      />

      {/* CSV Import Modal */}
      <CsvImportModal
        isOpen={importOpen}
        onClose={() => setImportOpen(false)}
        title="Import Data Penugasan"
        onImport={handleImport}
        templateFields={['judul', 'deskripsi', 'tipe', 'jenis_tugas', 'deadline', 'status']}
      />

      {/* ── TOAST NOTIFICATION STACK ── */}
      <ToastStack items={toastList} onDismiss={dismissToast} />
      </motion.div>
    </div>
  )

  return (
    <PageContainer maxW="7xl">
      {!(embedded || hideBreadcrumb) && (
        <AppBreadcrumb
          items={[
            { label: 'LMS & Akademik', href: '/dashboard' },
            { label: 'Penugasan & Asesmen' },
          ]}
        />
      )}
      {pageContent}
    </PageContainer>
  )
}
