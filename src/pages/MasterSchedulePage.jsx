import { useMemo, useState, useEffect } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  CalendarDays,
  CheckCircle2,
  Clock,
  Clock3,
  Users,
  Upload,
  BookOpen,
  Building2,
  AlertTriangle,
  AlertCircle,
  Search,
  Filter,
  RefreshCcw,
  LayoutGrid,
  Table as TableIcon,
  Eye,
  Pencil,
  Trash2,
  Sparkles,
  Calendar,
  Printer,
  Download,
  Plus,
  X,
  FileSpreadsheet,
  ShieldCheck,
  Layers,
} from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'
import { cn } from '../lib/utils'
import { useAuthStore } from '../stores/authStore'
import { isTeacherRole, isGlobalAccessManager, hasAnyRole, ROLES } from '../auth/portalResolver'
import { scheduleService } from '../services/scheduleService'
import { educationUnitService } from '../services/educationUnitService'
import { tahunAjaranService } from '../services/tahunAjaranService'
import { printCleanTable, downloadPdfTable } from '../utils/printHelper'
import { parseSpreadsheetFile, downloadSpreadsheetTemplate } from '../utils/spreadsheetParser'
import {
  ActionDropdown,
  AppBadge,
  AppButton,
  AppDrawer,
  AppEmptyState,
  AppErrorState,
  AppSearch,
  AppSkeleton,
  MobileDataCard,
  PersonIdentityCell,
} from '../components/app'
import { Pagination } from '../components/tailgrids/core/pagination'
import {
  MasterDataPage,
  MasterActionButton,
  MasterFilterSelect,
  MasterFormModal,
  SquircleActionButton,
} from '../components/master-data'

// ── 1. DEFINISI TONE WARNA KARTU KPI MODERN (TAILGRIDS GOLD STANDARD) ──
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
  indigo: {
    card: 'border-indigo-300/70 bg-gradient-to-br from-indigo-50 via-sky-50/60 to-white hover:border-indigo-400 dark:border-indigo-700/50 dark:from-indigo-950/40 dark:via-sky-950/20 dark:to-slate-900',
    glow: 'bg-indigo-400/20 group-hover:bg-indigo-400/30',
    iconBox: 'bg-gradient-to-br from-indigo-500 to-sky-600 text-white shadow-indigo-500/30',
    tag: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/60 dark:text-indigo-300',
    title: 'text-indigo-700 dark:text-indigo-400',
    val: 'text-indigo-700 dark:text-indigo-300',
    sub: 'text-indigo-600/80 dark:text-indigo-400/80',
    cta: 'text-indigo-600/60 dark:text-indigo-500/60',
  },
  rose: {
    card: 'border-rose-300/70 bg-gradient-to-br from-rose-50 via-pink-50/60 to-white hover:border-rose-400 dark:border-rose-700/50 dark:from-rose-950/40 dark:via-pink-950/20 dark:to-slate-900',
    glow: 'bg-rose-400/20 group-hover:bg-rose-400/30',
    iconBox: 'bg-gradient-to-br from-rose-500 to-pink-600 text-white shadow-rose-500/30',
    tag: 'bg-rose-100 text-rose-700 dark:bg-rose-900/60 dark:text-rose-300',
    title: 'text-rose-700 dark:text-rose-400',
    val: 'text-rose-700 dark:text-rose-300',
    sub: 'text-rose-600/80 dark:text-rose-400/80',
    cta: 'text-rose-600/60 dark:text-rose-500/60',
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

// ── 2. SUB-KOMPONEN KARTU KPI MODERN ──
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
      className={cn(
        'group relative overflow-hidden rounded-[18px] border-2 p-5 shadow-xs transition-[border-color,box-shadow] duration-150 text-left',
        isClickable ? 'cursor-pointer hover:shadow-md' : 'cursor-default',
        t.card
      )}
    >
      {/* Ambient Glow */}
      <div className={cn('pointer-events-none absolute -top-8 -right-8 h-28 w-28 rounded-full blur-2xl transition-all', t.glow)} />

      {/* Header dengan Icon Box & Tag */}
      <div className="relative z-10 flex items-center justify-between mb-3">
        <div className="flex items-center gap-2.5">
          <div className={cn('flex h-9 w-9 items-center justify-center rounded-xl text-white shadow-sm', t.iconBox)}>
            <Icon className="h-4.5 w-4.5" />
          </div>
          <div>
            <p className={cn('text-[11px] font-bold uppercase tracking-wider', t.title)}>{label}</p>
          </div>
        </div>
        {tag && (
          <span className={cn('rounded-lg px-2 py-0.5 text-[10px] font-extrabold', t.tag)}>
            {tag}
          </span>
        )}
      </div>

      {/* Nilai Utama */}
      <p className={cn('relative z-10 text-4xl font-black tabular-nums', t.val)}>
        {value ?? '0'}
      </p>
      {subtext && (
        <p className={cn('relative z-10 mt-0.5 text-[11px] font-semibold', t.sub)}>
          {subtext}
        </p>
      )}
    </motion.div>
  )
}

// ── HARMONIZED DELETE MODAL ──
function HarmonizedDeleteModal({ isOpen, onClose, onConfirm, item, isSubmitting }) {
  if (!isOpen || !item) return null

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-fadeIn">
      <motion.div
        initial={{ opacity: 0, scale: 0.94 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.94 }}
        className="relative w-full max-w-md overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl shadow-rose-950/20 dark:border-slate-800 dark:bg-[#1B2433]"
      >
        <div className="h-1.5 w-full bg-gradient-to-r from-rose-500 via-rose-600 to-red-700" />
        <div className="p-6">
          <div className="flex items-center gap-3.5 mb-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-rose-500 via-rose-600 to-red-700 text-white shadow-md shadow-rose-500/30">
              <Trash2 className="h-6 w-6" />
            </div>
            <div>
              <span className="inline-block rounded-md bg-rose-100 px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-rose-800 dark:bg-rose-950/60 dark:text-rose-300">
                Hapus Permanen
              </span>
              <h3 className="text-base font-black text-slate-900 dark:text-white mt-0.5">
                Hapus Jadwal Pelajaran?
              </h3>
            </div>
          </div>

          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
            Apakah Anda yakin ingin menghapus jadwal mengajar ini? Tindakan ini akan menghapus alokasi jadwal pelajaran dari sistem.
          </p>

          <div className="rounded-xl border border-rose-200/80 bg-rose-50/50 p-3.5 dark:border-rose-800/60 dark:bg-rose-950/20 mb-5">
            <p className="text-xs font-black text-rose-950 dark:text-rose-100">
              {item?.subject?.nama_mapel || item?.subject?.name || 'Mata Pelajaran'}
            </p>
            <p className="text-[11px] text-rose-800/80 dark:text-rose-300/80 mt-0.5">
              Kelas: {item?.kelas?.nama_kelas || item?.school_class?.name || '-'} • Guru: {item?.employee?.nama_lengkap || item?.teacher?.name || '-'}
            </p>
          </div>

          <div className="flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800 transition-all cursor-pointer"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={onConfirm}
              disabled={isSubmitting}
              className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-rose-500 via-rose-600 to-red-700 px-5 py-2 text-xs font-bold text-white shadow-md shadow-rose-600/30 hover:brightness-105 disabled:opacity-50 transition-all cursor-pointer"
            >
              {isSubmitting && <RefreshCcw className="h-4 w-4 animate-spin" />}
              Hapus Jadwal
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

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
                : toast.type === 'warning'
                ? 'border-amber-200 bg-white/95 text-amber-900 dark:border-amber-800/70 dark:bg-[#1C2637]/95 dark:text-amber-200'
                : 'border-emerald-200 bg-white/95 text-emerald-900 dark:border-emerald-800/70 dark:bg-[#1C2637]/95 dark:text-emerald-200'
            }`}
          >
            <div
              className={`flex size-8 shrink-0 items-center justify-center rounded-xl ${
                toast.type === 'error'
                  ? 'bg-rose-100 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400'
                  : toast.type === 'warning'
                  ? 'bg-amber-100 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400'
                  : 'bg-emerald-100 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400'
              }`}
            >
              {toast.type === 'error' ? (
                <AlertTriangle className="size-4" strokeWidth={2.2} />
              ) : toast.type === 'warning' ? (
                <AlertCircle className="size-4" strokeWidth={2.2} />
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
              onClick={() => onDismiss?.(toast.id)}
              className="size-5 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer"
            >
              <X className="size-3.5" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </aside>
  )
}

const DAYS_MAP = [
  { id: 1, name: 'Senin' },
  { id: 2, name: 'Selasa' },
  { id: 3, name: 'Rabu' },
  { id: 4, name: 'Kamis' },
  { id: 5, name: 'Jumat' },
  { id: 6, name: 'Sabtu' },
  { id: 7, name: 'Minggu' },
]

const emptyForm = {
  unit_pendidikan_id: '',
  kelas_id: '',
  employee_id: '',
  subject_id: '',
  academic_year_id: '',
  semester_id: '',
  day_of_week: 1,
  time_start: '07:30',
  time_end: '09:00',
  week_type: 'all',
  is_active: true,
  notes: '',
}

const pickError = (error, fallback) => {
  const errors = error.response?.data?.errors
  if (errors) {
    const firstKey = Object.keys(errors)[0]
    return Array.isArray(errors[firstKey]) ? errors[firstKey][0] : errors[firstKey]
  }
  return error.response?.data?.message || fallback
}

const formatTime = (value) => value?.slice(0, 5) || '--:--'
const subjectName = (item) => item?.nama_mapel || item?.name || 'Mata Pelajaran'

export default function MasterSchedulePage({ embedded = false, hideBreadcrumb = false, hidePageHeader = false }) {
  const queryClient = useQueryClient()
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  
  // ── AUTH & ROLE SCOPING ──
  const authUser = useAuthStore((state) => state.user)
  const userRoles = useMemo(() => {
    if (!authUser) return []
    const raw = authUser.roles || (authUser.role ? [authUser.role] : []) || authUser.role_names || []
    const list = Array.isArray(raw) ? raw : [raw]
    return list.map((r) => (typeof r === 'string' ? r : r?.name || r?.role_name || r?.nama || ''))
  }, [authUser])

  const isGuru = useMemo(() => isTeacherRole(userRoles), [userRoles])
  const canManage = useMemo(() =>
    !isGuru && (
      isGlobalAccessManager(userRoles) ||
      hasAnyRole(userRoles, [...ROLES.KEPALA_SEKOLAH, ...ROLES.DIVISI, ...ROLES.WAKA, ...ROLES.TATA_USAHA])
    ), [isGuru, userRoles])

  // Resolusi unit_id guru dari profil user
  const guruUnitId = useMemo(() => {
    if (!authUser) return null
    const candidates = [
      authUser?.unit_id,
      authUser?.unit_pendidikan_id,
      authUser?.education_unit_id,
      authUser?.unit?.id,
      authUser?.education_unit?.id,
      authUser?.employee?.unit_id,
      authUser?.employee?.unit_pendidikan_id,
      authUser?.employee?.education_unit_id,
      authUser?.school_info?.id,
    ].filter(Boolean)
    return candidates.length > 0 ? String(candidates[0]) : null
  }, [authUser])

  // Resolusi employee_id guru dari profil user
  const guruEmployeeId = useMemo(() => {
    if (!authUser) return null
    const candidates = [
      authUser?.employee_id,
      authUser?.employee?.id,
    ].filter(Boolean)
    return candidates.length > 0 ? String(candidates[0]) : null
  }, [authUser])

  // Filters
  const [unitFilter, setUnitFilter] = useState('')
  const [yearFilter, setYearFilter] = useState('')
  const [semesterFilter, setSemesterFilter] = useState('')
  const [subjectFilter, setSubjectFilter] = useState('')
  const [classFilter, setClassFilter] = useState('')
  const [dayFilter, setDayFilter] = useState('')
  const [teacherFilter, setTeacherFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')

  // View state
  const [viewMode, setViewMode] = useState('table') // 'table' | 'weekly'
  const [selectedWeeklyDay, setSelectedWeeklyDay] = useState(new Date().getDay() || 1)

  // Modals & Drawers
  const [modal, setModal] = useState(false)
  const [showImportModal, setShowImportModal] = useState(false)
  const [importFile, setImportFile] = useState(null)
  const [importPreviewData, setImportPreviewData] = useState([])
  const [isImporting, setIsImporting] = useState(false)
  const [showExportModal, setShowExportModal] = useState(false)
  const [exportFormat, setExportFormat] = useState('xlsx')
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false)
  const [printTeacherFilter, setPrintTeacherFilter] = useState('')
  const [detailDrawerItem, setDetailDrawerItem] = useState(null)
  const [editing, setEditing] = useState(null)
  const [deleteItem, setDeleteItem] = useState(null)
  const [toasts, setToasts] = useState([])

  const pushToast = (title, message, type = 'success') => {
    const id = Date.now() + Math.random()
    setToasts((prev) => [...prev, { id, title, message, type }])
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, 4500)
  }

  // Form State & Validation
  const [form, setForm] = useState(emptyForm)
  const [formErrors, setFormErrors] = useState({})
  const [conflictWarning, setConflictWarning] = useState('')
  const [isDirty, setIsDirty] = useState(false)

  // Fetch Options
  const { data: options = {}, isLoading: optionsLoading } = useQuery({
    queryKey: ['schedule-options'],
    queryFn: scheduleService.getOptions,
  })

  // Inisialisasi filter scope guru saat role sudah diketahui
  useEffect(() => {
    if (!isGuru) return
    if (guruUnitId) setUnitFilter(guruUnitId)
    if (guruEmployeeId) setTeacherFilter(guruEmployeeId)
  }, [isGuru, guruUnitId, guruEmployeeId])


  // Fetch Units for dropdown filter & dependent form
  const { data: unitsResponse = {} } = useQuery({
    queryKey: ['education-units-all'],
    queryFn: () => educationUnitService.getAll(),
  })
  const unitsList = unitsResponse.data || []

  // Fetch Fallback Academic Years if needed
  const { data: tahunAjaranFallback = [] } = useQuery({
    queryKey: ['academic-years-dropdown-fallback'],
    queryFn: tahunAjaranService.getDropdown,
  })

  // Derived Tahun Ajaran Options
  const tahunAjaranList = useMemo(() => {
    const fromOpts =
      options.tahun_ajaran ||
      options.tahunAjaran ||
      options.academic_years ||
      options.academic_year
    if (Array.isArray(fromOpts) && fromOpts.length > 0) return fromOpts
    if (Array.isArray(tahunAjaranFallback) && tahunAjaranFallback.length > 0) return tahunAjaranFallback
    return []
  }, [options, tahunAjaranFallback])

  // Derived unit options combining options.kelas, options.guru & unitsList
  const unitOptions = useMemo(() => {
    if (unitsList.length > 0) return unitsList
    const map = new Map()
    ;(options.kelas || []).forEach((k) => {
      if (k.unitPendidikan || k.unit_pendidikan) {
        const u = k.unitPendidikan || k.unit_pendidikan
        map.set(u.id, u)
      }
    })
    return Array.from(map.values())
  }, [unitsList, options.kelas])

  // Effective Day filter: in weekly view mode, use selectedWeeklyDay; in table view mode, use dayFilter
  const effectiveDayFilter = viewMode === 'weekly' ? selectedWeeklyDay : dayFilter

  // Query Schedule List
  const { data: response = {}, isLoading, isError, refetch } = useQuery({
    queryKey: [
      'schedules',
      page,
      search,
      unitFilter,
      yearFilter,
      semesterFilter,
      subjectFilter,
      classFilter,
      effectiveDayFilter,
      teacherFilter,
      statusFilter,
      viewMode,
    ],
    queryFn: () =>
      scheduleService.getDaftar({
        page,
        per_page: viewMode === 'weekly' ? 24 : 10,
        search,
        unit_pendidikan_id: unitFilter || undefined,
        academic_year_id: yearFilter || undefined,
        semester_id: semesterFilter || undefined,
        subject_id: subjectFilter || undefined,
        kelas_id: classFilter || undefined,
        day_of_week: effectiveDayFilter || undefined,
        employee_id: teacherFilter || undefined,
        is_active: statusFilter || undefined,
      }),
  })

  const items = response.data || []
  const meta = response.meta || {}
  const stats = response.statistik || {}

  // Guru Picker Modal State
  const [guruPickerOpen, setGuruPickerOpen] = useState(false)
  const [guruSearchText, setGuruSearchText] = useState('')

  // Filtered Dependent Options for Form
  const filteredSemesters = useMemo(() => {
    const list = options.semester || []
    if (!form.academic_year_id) return list
    const filtered = list.filter(
      (s) => s.academic_year_id === form.academic_year_id
    )
    return filtered.length > 0 ? filtered : list
  }, [options.semester, form.academic_year_id])

  const filteredKelas = useMemo(() => {
    const list = options.kelas || []
    if (list.length === 0) return []
    const filtered = list.filter((k) => {
      const matchUnit = !form.unit_pendidikan_id || k.unit_pendidikan_id === form.unit_pendidikan_id
      const matchYear = !form.academic_year_id || k.tahun_ajaran_id === form.academic_year_id
      const matchSemester = !form.semester_id || k.semester_id === form.semester_id
      return matchUnit && matchYear && matchSemester
    })
    if (filtered.length > 0) return filtered

    // Fallback: match unit & year if semester is empty
    const matchUnitYear = list.filter((k) => {
      const matchUnit = !form.unit_pendidikan_id || k.unit_pendidikan_id === form.unit_pendidikan_id
      const matchYear = !form.academic_year_id || k.tahun_ajaran_id === form.academic_year_id
      return matchUnit && matchYear
    })
    if (matchUnitYear.length > 0) return matchUnitYear

    // Fallback: match unit only
    const matchUnitOnly = list.filter((k) => !form.unit_pendidikan_id || k.unit_pendidikan_id === form.unit_pendidikan_id)
    if (matchUnitOnly.length > 0) return matchUnitOnly

    return list
  }, [options.kelas, form.unit_pendidikan_id, form.academic_year_id, form.semester_id])

  const filteredGuru = useMemo(() => {
    const list = options.guru || []
    if (!form.unit_pendidikan_id) return list
    const filtered = list.filter((g) => g.unit_id === form.unit_pendidikan_id)
    return filtered.length > 0 ? filtered : list
  }, [options.guru, form.unit_pendidikan_id])

  const filteredGuruInPicker = useMemo(() => {
    const list = filteredGuru
    if (!guruSearchText.trim()) return list
    const q = guruSearchText.toLowerCase()
    return list.filter(
      (g) =>
        g.nama_lengkap?.toLowerCase().includes(q) ||
        g.niy?.toLowerCase().includes(q) ||
        g.nik?.toLowerCase().includes(q)
    )
  }, [filteredGuru, guruSearchText])

  const filteredSubjects = useMemo(() => {
    const list = options.mata_pelajaran || []
    if (!form.unit_pendidikan_id) return list
    const filtered = list.filter((m) => !m.unit_pendidikan_id || m.unit_pendidikan_id === form.unit_pendidikan_id)
    return filtered.length > 0 ? filtered : list
  }, [options.mata_pelajaran, form.unit_pendidikan_id])

  // Save Mutation
  const saveMutation = useMutation({
    mutationFn: (payload) =>
      editing ? scheduleService.ubah({ id: editing.id, payload }) : scheduleService.tambah(payload),
    onSuccess: (result) => {
      pushToast('Berhasil Disimpan', result.message || 'Jadwal pelajaran berhasil diperbarui.', 'success')
      setModal(false)
      setIsDirty(false)
      queryClient.invalidateQueries({ queryKey: ['schedules'] })
    },
    onError: (error) => {
      const errMsg = pickError(error, 'Periksa kembali kelengkapan data dan potensi bentrok jadwal.')
      setConflictWarning(errMsg)
      if (error.response?.data?.errors) {
        setFormErrors(error.response.data.errors)
      }
    },
  })

  // Delete Mutation
  const deleteMutation = useMutation({
    mutationFn: scheduleService.hapus,
    onSuccess: (result) => {
      pushToast('Jadwal Terhapus', result.message || 'Jadwal pelajaran telah dihapus.', 'success')
      if (detailDrawerItem) setDetailDrawerItem(null)
      setDeleteItem(null)
      queryClient.invalidateQueries({ queryKey: ['schedules'] })
    },
    onError: (error) => {
      pushToast('Gagal', pickError(error, 'Jadwal gagal dihapus.'), 'error')
      setDeleteItem(null)
    },
  })

  // Open Form Handlers
  const openAdd = () => {
    const activeYear = (tahunAjaranList || []).find((item) => item.is_active)
    const yearId = activeYear?.id || tahunAjaranList?.[0]?.id || ''
    const activeSemester = (options.semester || []).find(
      (item) => item.is_active && item.academic_year_id === yearId
    )
    setEditing(null)
    setFormErrors({})
    setConflictWarning('')
    setIsDirty(false)
    setForm({
      ...emptyForm,
      academic_year_id: yearId,
      semester_id:
        activeSemester?.id ||
        options.semester?.find((item) => item.academic_year_id === yearId)?.id ||
        '',
    })
    setModal(true)
  }

  const openEdit = (item) => {
    setEditing(item)
    setFormErrors({})
    setConflictWarning('')
    setIsDirty(false)
    
    // Detect unit_pendidikan_id from item's class or subject or employee
    const detectedUnitId =
      item.kelas?.unit_pendidikan_id ||
      item.subject?.unit_pendidikan_id ||
      item.employee?.unit_id ||
      ''

    setForm({
      unit_pendidikan_id: detectedUnitId,
      kelas_id: item.kelas_id || item.school_class_id || '',
      employee_id: item.employee_id || item.teacher_id || '',
      subject_id: item.subject_id || '',
      academic_year_id: item.academic_year_id || '',
      semester_id: item.semester_id || '',
      day_of_week: item.day_of_week || 1,
      time_start: item.time_start?.slice(0, 5) || '07:30',
      time_end: item.time_end?.slice(0, 5) || '09:00',
      week_type: item.week_type || 'all',
      is_active: item.is_active ?? true,
      notes: item.metadata?.notes || '',
    })
    setModal(true)
  }

  // Handle Form Input Change with Dependent Dropdown Logic
  const handleFormChange = (field, value) => {
    setIsDirty(true)
    setFormErrors((prev) => ({ ...prev, [field]: null }))
    setConflictWarning('')

    setForm((prev) => {
      const updated = { ...prev, [field]: value }

      // If Unit changes: reset dependent fields if invalid for new unit
      if (field === 'unit_pendidikan_id') {
        if (value) {
          const validClass = (options.kelas || []).find(
            (k) => k.id === prev.kelas_id && k.unit_pendidikan_id === value
          )
          if (!validClass) updated.kelas_id = ''

          const validGuru = (options.guru || []).find(
            (g) => g.id === prev.employee_id && g.unit_id === value
          )
          if (!validGuru) updated.employee_id = ''

          const validSubject = (options.mata_pelajaran || []).find(
            (m) =>
              m.id === prev.subject_id &&
              (!m.unit_pendidikan_id || m.unit_pendidikan_id === value)
          )
          if (!validSubject) updated.subject_id = ''
        }
      }

      // If Tahun Ajaran changes: reset semester & kelas
      if (field === 'academic_year_id') {
        const validSemester = (options.semester || []).find(
          (s) => s.id === prev.semester_id && s.academic_year_id === value
        )
        if (!validSemester) {
          const firstSemester = (options.semester || []).find(
            (s) => s.academic_year_id === value
          )
          updated.semester_id = firstSemester?.id || ''
        }
        updated.kelas_id = ''
      }

      // If Kelas is selected directly: auto-populate unit, year, semester if empty
      if (field === 'kelas_id' && value) {
        const selectedKelas = (options.kelas || []).find((k) => k.id === value)
        if (selectedKelas) {
          if (selectedKelas.unit_pendidikan_id) {
            updated.unit_pendidikan_id = selectedKelas.unit_pendidikan_id
          }
          if (selectedKelas.tahun_ajaran_id) {
            updated.academic_year_id = selectedKelas.tahun_ajaran_id
          }
          if (selectedKelas.semester_id) {
            updated.semester_id = selectedKelas.semester_id
          }
        }
      }

      return updated
    })
  }

  // Validate form client-side
  const validateClient = () => {
    const errors = {}
    if (!form.academic_year_id) errors.academic_year_id = 'Tahun Ajaran wajib dipilih.'
    if (!form.semester_id) errors.semester_id = 'Semester wajib dipilih.'
    if (!form.kelas_id) errors.kelas_id = 'Kelas / Rombel wajib dipilih.'
    if (!form.employee_id) errors.employee_id = 'Guru Pengampu wajib dipilih.'
    if (!form.subject_id) errors.subject_id = 'Mata Pelajaran wajib dipilih.'
    if (!form.day_of_week) errors.day_of_week = 'Hari Mengajar wajib dipilih.'
    if (!form.time_start) errors.time_start = 'Jam mulai wajib diisi.'
    if (!form.time_end) errors.time_end = 'Jam selesai wajib diisi.'

    if (form.time_start && form.time_end && form.time_end <= form.time_start) {
      errors.time_end = 'Jam selesai harus lebih akhir dari jam mulai.'
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const submit = (event) => {
    event.preventDefault()
    if (!validateClient()) {
      return
    }

    const payload = {
      kelas_id: form.kelas_id,
      employee_id: form.employee_id,
      subject_id: form.subject_id,
      academic_year_id: form.academic_year_id,
      semester_id: form.semester_id,
      day_of_week: Number(form.day_of_week),
      time_start: form.time_start,
      time_end: form.time_end,
      week_type: form.week_type,
      is_active: form.is_active,
    }

    saveMutation.mutate(payload)
  }

  const remove = (item) => {
    setDeleteItem(item)
  }

  const resetFilters = () => {
    setSearch('')
    // Untuk role guru: kembalikan ke scope unit & teacher-nya sendiri
    setUnitFilter(isGuru && guruUnitId ? guruUnitId : '')
    setYearFilter('')
    setSemesterFilter('')
    setSubjectFilter('')
    setClassFilter('')
    setDayFilter('')
    setTeacherFilter(isGuru && guruEmployeeId ? guruEmployeeId : '')
    setStatusFilter('')
    setPage(1)
  }

  const activeFilterCount = [
    // Untuk Guru: unitFilter & teacherFilter adalah scope wajib, bukan filter aktif yang bisa direset
    !isGuru ? unitFilter : null,
    yearFilter,
    semesterFilter,
    subjectFilter,
    classFilter,
    dayFilter,
    !isGuru ? teacherFilter : null,
    statusFilter,
  ].filter(Boolean).length


  // File Select for Harmonized Import Modal
  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setImportFile(file)

    try {
      const rows = await parseSpreadsheetFile(file)
      setImportPreviewData(rows.slice(0, 10))
    } catch (err) {
      console.error('Failed to parse file preview', err)
      pushToast('Peringatan Format', err.message || 'Gagal membaca berkas spreadsheet.', 'error')
      setImportPreviewData([])
    }
  }

  // Process Import for Harmonized Import Modal
  const handleProcessImport = async () => {
    if (!importFile) return
    setIsImporting(true)
    try {
      const allRows = await parseSpreadsheetFile(importFile)
      if (allRows.length === 0) {
        pushToast('Peringatan', 'Berkas spreadsheet tidak memiliki baris data.', 'error')
        setIsImporting(false)
        return
      }

      let success = 0
      const failures = []
      for (let index = 0; index < allRows.length; index += 1) {
        const row = allRows[index]
        try {
          await scheduleService.tambah({
            ...row,
            day_of_week: Number(row.day_of_week),
            is_active: !['0', 'false', 'nonaktif'].includes(String(row.is_active).toLowerCase()),
          })
          success += 1
        } catch (error) {
          failures.push(`baris ${index + 2}: ${error.response?.data?.message || 'gagal'}`)
        }
      }
      queryClient.invalidateQueries({ queryKey: ['schedules'] })
      setShowImportModal(false)
      setImportFile(null)
      setImportPreviewData([])
      setIsImporting(false)
      if (failures.length === 0) {
        pushToast('Import Berhasil', `${success} jadwal pelajaran berhasil diimport.`, 'success')
      } else {
        pushToast(
          'Import Sebagian Berhasil',
          `${success} berhasil, ${failures.length} gagal (${failures.slice(0, 2).join(', ')}...).`,
          'warning'
        )
      }
    } catch (err) {
      setIsImporting(false)
      pushToast('Gagal Impor', err.message || 'Gagal membaca berkas spreadsheet.', 'error')
    }
  }

  // Template Download for Harmonized Import Modal
  const handleDownloadTemplate = (type = 'xlsx') => {
    const sampleData = [
      {
        kelas_id: 'uuid-kelas',
        employee_id: 'uuid-guru',
        subject_id: 'uuid-mapel',
        academic_year_id: 'uuid-tahun-ajaran',
        semester_id: 'uuid-semester',
        day_of_week: '1',
        time_start: '07:30',
        time_end: '09:00',
        week_type: 'all',
        is_active: '1',
      },
    ]
    downloadSpreadsheetTemplate(sampleData, 'template_import_jadwal', type)
  }

  // Harmonized Batch Export Handler
  const handleProcessExport = async () => {
    setShowExportModal(false)
    if (!items || items.length === 0) {
      pushToast('Peringatan', 'Tidak ada data jadwal untuk diekspor.', 'warning')
      return
    }

    if (exportFormat === 'pdf') {
      const allRows = Array.isArray(items) ? items : []
      downloadPdfTable({
        title: 'Laporan Data Jadwal Pelajaran',
        subtitle: 'Daftar Sesi Pelajaran & Jam Mengajar Sekolah Islam Terpadu',
        headers: ['NO', 'HARI & JAM', 'MATA PELAJARAN', 'KELAS & UNIT', 'GURU PENGAMPUL', 'PERIODE AKADEMIK', 'STATUS'],
        rows: allRows.map((row, i) => [
          i + 1,
          `${row.nama_hari || DAYS_MAP.find((d) => d.id === row.day_of_week)?.name || 'Senin'} (${formatTime(row.time_start)} - ${formatTime(row.time_end)})`,
          `${subjectName(row.subject) || row.subject_name || '-'}${row.subject?.kode_mapel || row.subject?.code ? ` [${row.subject.kode_mapel || row.subject.code}]` : ''}`,
          `${row.kelas?.nama_kelas || row.school_class?.name || row.kelas_name || '-'}${row.kelas?.unit_pendidikan?.name || row.unit_name ? ` (${row.kelas?.unit_pendidikan?.name || row.unit_name})` : ''}`,
          `${row.employee?.nama_lengkap || row.teacher?.name || row.guru_name || '-'}${row.employee?.niy ? ` (NIY ${row.employee.niy})` : ''}`,
          `${row.academic_year?.name || row.tahun_ajaran_name || '-'}${row.semester?.name ? ` - ${row.semester.name}` : ''}`,
          row.is_active ? 'Aktif' : 'Nonaktif',
        ]),
        filename: `laporan_jadwal_${new Date().toISOString().slice(0, 10)}.pdf`,
      })
      pushToast('Export Berhasil', 'Dokumen PDF jadwal pelajaran berhasil diunduh.', 'success')
      return
    }

    // CSV / Excel (.xlsx, .xls)
    try {
      const headers = ['NO', 'GURU', 'MATA PELAJARAN', 'KELAS', 'HARI', 'JAM MULAI', 'JAM SELESAI', 'STATUS']
      let csvStr = headers.join(',') + '\n'
      items.forEach((row, i) => {
        const line = [
          i + 1,
          `"${row.employee?.nama_lengkap || row.guru_name || ''}"`,
          `"${row.subject?.nama_mapel || row.mapel_name || ''}"`,
          `"${row.kelas?.nama_kelas || row.kelas_name || ''}"`,
          `"${row.nama_hari || DAYS_MAP.find((d) => d.id === row.day_of_week)?.name || ''}"`,
          `"${row.time_start || ''}"`,
          `"${row.time_end || ''}"`,
          `"${row.is_active ? 'Aktif' : 'Nonaktif'}"`,
        ].join(',')
        csvStr += line + '\n'
      })
      const ext = exportFormat === 'xlsx' ? 'xlsx' : exportFormat === 'xls' ? 'xls' : 'csv'
      const mime = exportFormat === 'csv' ? 'text/csv;charset=utf-8;' : 'application/vnd.ms-excel;charset=utf-8;'
      const blob = new Blob([csvStr], { type: mime })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `export_jadwal_${new Date().toISOString().slice(0, 10)}.${ext}`)
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      pushToast('Export Berhasil', `Data jadwal berhasil diekspor ke format .${ext.toUpperCase()}.`, 'success')
    } catch {
      pushToast('Error', 'Gagal mengunduh berkas ekspor.', 'error')
    }
  }

  // Print Execution Handler
  const handleExecutePrint = (mode = 'clean') => {
    setIsPrintModalOpen(false)
    const allRows = Array.isArray(items) ? items : []
    const printTeacher = (options.guru || []).find((g) => g.id === printTeacherFilter)
    const rowsToPrint = printTeacherFilter
      ? allRows.filter(
          (r) =>
            r.employee_id === printTeacherFilter ||
            r.employee?.id === printTeacherFilter ||
            r.teacher_id === printTeacherFilter
        )
      : allRows

    const printConfig = {
      title: printTeacher
        ? `Laporan Jadwal Pelajaran - ${printTeacher.nama_lengkap}`
        : 'Laporan Data Jadwal Pelajaran',
      subtitle: printTeacher
        ? `Jadwal Mengajar Guru: ${printTeacher.nama_lengkap}${printTeacher.niy ? ` (NIY ${printTeacher.niy})` : ''}`
        : 'Daftar Sesi Pelajaran & Jam Mengajar Sekolah Islam Terpadu',
      headers: ['NO', 'HARI & JAM', 'MATA PELAJARAN', 'KELAS & UNIT', 'GURU PENGAMPUL', 'PERIODE AKADEMIK', 'STATUS'],
      rows: rowsToPrint.map((row, i) => [
        i + 1,
        `${row.nama_hari || DAYS_MAP.find((d) => d.id === row.day_of_week)?.name || 'Senin'} (${formatTime(row.time_start)} - ${formatTime(row.time_end)})`,
        `${subjectName(row.subject) || row.subject_name || '-'}${row.subject?.kode_mapel || row.subject?.code ? ` [${row.subject.kode_mapel || row.subject.code}]` : ''}`,
        `${row.kelas?.nama_kelas || row.school_class?.name || row.kelas_name || '-'}${row.kelas?.unit_pendidikan?.name || row.unit_name ? ` (${row.kelas?.unit_pendidikan?.name || row.unit_name})` : ''}`,
        `${row.employee?.nama_lengkap || row.teacher?.name || row.guru_name || '-'}${row.employee?.niy ? ` (NIY ${row.employee.niy})` : ''}`,
        `${row.academic_year?.name || row.tahun_ajaran_name || '-'}${row.semester?.name ? ` - ${row.semester.name}` : ''}`,
        row.is_active ? 'Aktif' : 'Nonaktif',
      ]),
    }

    if (mode === 'pdf') {
      downloadPdfTable({
        ...printConfig,
        filename: printTeacher
          ? `jadwal_mengajar_${printTeacher.nama_lengkap.toLowerCase().replace(/[^a-z0-9]/g, '_')}.pdf`
          : 'laporan_jadwal_pelajaran.pdf',
      })
      pushToast('Dokumen PDF Siap', 'Berkas PDF jadwal pelajaran telah diunduh.', 'success')
    } else {
      printCleanTable(printConfig)
    }
  }

  // Weekly Grid Schedule Data Grouping
  const weeklyGridData = useMemo(() => {
    return items.filter((item) => (item.day_of_week ?? 1) === Number(selectedWeeklyDay))
  }, [items, selectedWeeklyDay])

  const pageActions = (
    <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0 self-start sm:self-auto flex-wrap">
      {/* 1. Cetak / Print (Vivid Indigo Squircle + Floating Tooltip) — tersedia untuk semua role */}
      <div className="group relative inline-flex">
        <button
          type="button"
          title="Cetak & Download Data Jadwal"
          aria-label="Cetak & Download Data Jadwal"
          onClick={() => setIsPrintModalOpen(true)}
          className="flex size-10 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 via-indigo-600 to-violet-700 text-white border border-indigo-300/40 hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer"
        >
          <Printer className="size-5 text-white" strokeWidth={2.2} />
        </button>
        <div className="pointer-events-none absolute top-full left-1/2 mt-2 -translate-x-1/2 opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 transition-all duration-200 ease-out z-50 whitespace-nowrap rounded-lg bg-slate-900 px-2.5 py-1 text-[11px] font-bold text-white shadow-xl dark:bg-slate-100 dark:text-slate-900">
          <div className="absolute bottom-full left-1/2 -mb-1 -translate-x-1/2 border-4 border-transparent border-b-slate-900 dark:border-b-slate-100" />
          Cetak Data
        </div>
      </div>

      {/* 2–4. Import / Export / Tambah — HANYA untuk role manajemen (bukan Guru) */}
      {canManage && (
        <>
          {/* 2. Import Button (Vivid Sky Blue Squircle + Floating Tooltip) */}
          <div className="group relative inline-flex">
            <button
              type="button"
              title="Import Data Jadwal"
              aria-label="Import Data Jadwal"
              className="flex size-10 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-400 via-sky-500 to-blue-600 text-white border border-sky-300/40 hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer"
              onClick={() => setShowImportModal(true)}
            >
              <Upload className="size-5 text-white" strokeWidth={2.2} />
            </button>
            <div className="pointer-events-none absolute top-full left-1/2 mt-2 -translate-x-1/2 opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 transition-all duration-200 ease-out z-50 whitespace-nowrap rounded-lg bg-slate-900 px-2.5 py-1 text-[11px] font-bold text-white shadow-xl dark:bg-slate-100 dark:text-slate-900">
              <div className="absolute bottom-full left-1/2 -mb-1 -translate-x-1/2 border-4 border-transparent border-b-slate-900 dark:border-b-slate-100" />
              Import Data
            </div>
          </div>

          {/* 3. Export Button (Vivid Amber Squircle + Floating Tooltip) */}
          <div className="group relative inline-flex">
            <button
              type="button"
              title="Export Data Jadwal"
              aria-label="Export Data Jadwal"
              className="flex size-10 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 via-amber-500 to-orange-600 text-white border border-amber-300/40 hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer"
              onClick={() => setShowExportModal(true)}
            >
              <Download className="size-5 text-white" strokeWidth={2.2} />
            </button>
            <div className="pointer-events-none absolute top-full left-1/2 mt-2 -translate-x-1/2 opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 transition-all duration-200 ease-out z-50 whitespace-nowrap rounded-lg bg-slate-900 px-2.5 py-1 text-[11px] font-bold text-white shadow-xl dark:bg-slate-100 dark:text-slate-900">
              <div className="absolute bottom-full left-1/2 -mb-1 -translate-x-1/2 border-4 border-transparent border-b-slate-900 dark:border-b-slate-100" />
              Export Data
            </div>
          </div>

          {/* 4. Tambah Button (Vivid Emerald Squircle + Floating Tooltip) */}
          <div className="group relative inline-flex">
            <button
              type="button"
              title="Tambah Jadwal Baru"
              aria-label="Tambah Jadwal Baru"
              className="flex size-10 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700 text-white border border-emerald-300/40 hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer"
              onClick={openAdd}
            >
              <Plus className="size-5 text-white" strokeWidth={2.5} />
            </button>
            <div className="pointer-events-none absolute top-full left-1/2 mt-2 -translate-x-1/2 opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 transition-all duration-200 ease-out z-50 whitespace-nowrap rounded-lg bg-slate-900 px-2.5 py-1 text-[11px] font-bold text-white shadow-xl dark:bg-slate-100 dark:text-slate-900">
              <div className="absolute bottom-full left-1/2 -mb-1 -translate-x-1/2 border-4 border-transparent border-b-slate-900 dark:border-b-slate-100" />
              Tambah Jadwal
            </div>
          </div>
        </>
      )}
    </div>
  )

  const shouldHideHeader = embedded || hidePageHeader

  return (
    <MasterDataPage
      className="schedule-master-page space-y-6"
      hideBreadcrumb={embedded || hideBreadcrumb}
    >
      {/* ══════════════════════════════════════════════════════════════════
          1. HARMONIZED PRINT OPTION MODAL (CETAK & PDF)
      ══════════════════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {isPrintModalOpen && (
          <div
            role="dialog"
            tabIndex={-1}
            aria-modal="true"
            aria-labelledby="schedule-print-title"
            className="overlay modal fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/70 backdrop-blur-md"
            onMouseDown={(e) => {
              if (e.target === e.currentTarget) setIsPrintModalOpen(false)
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 12 }}
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              className="modal-dialog font-sans w-full max-w-lg"
            >
              <div className="modal-content relative flex max-h-[calc(100dvh-2rem)] flex-col overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-2xl shadow-emerald-950/20 dark:border-slate-800 dark:bg-[#182232] dark:shadow-black/60">
                {/* Top Accent Gradient Bar */}
                <div className="h-1.5 w-full bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-600 shrink-0" />

                {/* Header */}
                <div className="modal-header flex items-center justify-between border-b border-slate-100 bg-white px-6 py-4.5 dark:border-slate-800 dark:bg-slate-950">
                  <div className="flex items-center gap-3">
                    <div className="rounded-2xl bg-gradient-to-br from-indigo-500 via-indigo-600 to-violet-700 p-2.5 text-white shadow-xs border border-indigo-300/30">
                      <Printer className="size-5 text-white" strokeWidth={2.25} />
                    </div>
                    <div>
                      <h3
                        id="schedule-print-title"
                        className="modal-title text-sm sm:text-base font-black text-slate-900 dark:text-white flex items-center gap-2"
                      >
                        <span>Opsi Cetak & Unduh Jadwal</span>
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-[#0E5C44] border border-emerald-200/80 dark:bg-emerald-950/60 dark:text-emerald-400 dark:border-emerald-800/60">
                          <Sparkles className="size-3" />
                          Cetak & PDF
                        </span>
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        Pilih cakupan pengajar dan format cetak resmi jadwal pelajaran
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsPrintModalOpen(false)}
                    aria-label="Tutup modal cetak"
                    className="rounded-xl p-2 bg-gradient-to-br from-rose-500 via-rose-600 to-red-700 text-white border border-rose-300/40 hover:scale-105 transition-all duration-200 active:scale-95 cursor-pointer"
                  >
                    <X className="size-4" strokeWidth={2.25} />
                  </button>
                </div>

                {/* Body */}
                <div className="modal-body min-h-0 flex-1 overflow-y-auto p-6 space-y-4">
                  {/* Teacher Scope Filter */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      Filter Guru Pengampu (Opsional)
                    </label>
                    <select
                      value={printTeacherFilter}
                      onChange={(e) => setPrintTeacherFilter(e.target.value)}
                      className="w-full rounded-xl border border-slate-200/90 bg-white px-3.5 py-2.5 text-xs font-semibold text-slate-800 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 focus:border-[#0E5C44] focus:ring-2 focus:ring-[#0E5C44]/20"
                    >
                      <option value="">Semua Guru (Seluruh Jadwal Terfilter)</option>
                      {(options.guru || []).map((g) => (
                        <option key={g.id} value={g.id}>
                          {g.nama_lengkap || g.nama} {g.niy ? `(NIY ${g.niy})` : ''}
                        </option>
                      ))}
                    </select>
                    <p className="text-[11px] text-slate-400">
                      {printTeacherFilter
                        ? 'Mencetak jadwal khusus untuk guru terpilih.'
                        : 'Mencetak seluruh baris jadwal yang aktif pada filter saat ini.'}
                    </p>
                  </div>

                  {/* Action Cards */}
                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-2.5">
                    <button
                      type="button"
                      onClick={() => handleExecutePrint('clean')}
                      className="w-full flex items-center justify-between p-3.5 rounded-2xl border border-emerald-200/80 bg-emerald-50/70 hover:bg-emerald-100/70 dark:border-emerald-800/60 dark:bg-emerald-950/40 dark:hover:bg-emerald-900/50 text-left transition-all duration-200 cursor-pointer shadow-2xs hover:shadow-xs group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="size-9 rounded-xl bg-gradient-to-br from-[#0E5C44] to-[#147B5B] text-white flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
                          <Printer className="size-4.5" strokeWidth={2.25} />
                        </div>
                        <div>
                          <h5 className="text-xs font-black text-slate-900 dark:text-white">Cetak Langsung (Print Clean)</h5>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400">Tampilan cetak browser resmi tanpa artefak sidebar/navigasi</p>
                        </div>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleExecutePrint('pdf')}
                      className="w-full flex items-center justify-between p-3.5 rounded-2xl border border-rose-200/80 bg-rose-50/70 hover:bg-rose-100/70 dark:border-rose-900/40 dark:bg-rose-950/30 dark:hover:bg-rose-900/40 text-left transition-all duration-200 cursor-pointer shadow-2xs hover:shadow-xs group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="size-9 rounded-xl bg-gradient-to-br from-rose-600 to-rose-700 text-white flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
                          <Download className="size-4.5" strokeWidth={2.25} />
                        </div>
                        <div>
                          <h5 className="text-xs font-black text-slate-900 dark:text-white">Unduh Berkas PDF (.pdf)</h5>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400">Unduh dokumen jadwal pelajaran siap arsip dalam format PDF</p>
                        </div>
                      </div>
                    </button>
                  </div>
                </div>

                {/* Footer */}
                <div className="modal-footer flex items-center justify-end border-t border-slate-100 bg-slate-50/80 px-6 py-4 dark:border-slate-800 dark:bg-[#131B27]">
                  <button
                    type="button"
                    onClick={() => setIsPrintModalOpen(false)}
                    className="inline-flex items-center gap-1.5 rounded-2xl bg-gradient-to-br from-rose-500 via-rose-600 to-red-700 text-white px-4 py-2.5 text-xs font-extrabold border border-rose-300/40 transition-all duration-200 hover:scale-[1.03] active:scale-95 cursor-pointer"
                  >
                    Batal
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ══════════════════════════════════════════════════════════════════
          2. HARMONIZED BATCH EXPORT MODAL
      ══════════════════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {showExportModal && (
          <div
            className="overlay modal fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/70 backdrop-blur-md"
            role="dialog"
            aria-modal="true"
            aria-labelledby="schedule-export-title"
            tabIndex={-1}
            onMouseDown={(e) => {
              if (e.target === e.currentTarget) setShowExportModal(false)
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 14 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ type: 'spring', stiffness: 400, damping: 28 }}
              className="modal-dialog font-sans my-auto w-full max-w-md"
            >
              <div className="modal-content flex max-h-[calc(100dvh-2rem)] flex-col overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-2xl shadow-emerald-950/20 dark:border-slate-800 dark:bg-[#182232] dark:shadow-black/60">
                {/* Top Accent Gradient Bar */}
                <div className="h-1.5 w-full bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-600 shrink-0" />

                {/* Header */}
                <div className="modal-header flex items-center justify-between border-b border-slate-100 bg-white px-6 py-4.5 dark:border-slate-800 dark:bg-slate-950">
                  <div className="flex items-center gap-3">
                    <div className="rounded-2xl bg-gradient-to-br from-amber-500 via-amber-600 to-orange-600 text-white p-2.5 shadow-md shadow-amber-500/30 border border-amber-300/30 shrink-0">
                      <Download className="h-5 w-5 text-white" strokeWidth={2.25} />
                    </div>
                    <div>
                      <h3
                        id="schedule-export-title"
                        className="modal-title text-sm sm:text-base font-black text-slate-900 dark:text-white flex items-center gap-2"
                      >
                        <span>Export Data Jadwal</span>
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-[#0E5C44] border border-emerald-200/80 dark:bg-emerald-950/60 dark:text-emerald-400 dark:border-emerald-800/60">
                          <Sparkles className="size-3" />
                          Unduh
                        </span>
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        Pilih format berkas untuk mengekspor data jadwal pelajaran
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowExportModal(false)}
                    aria-label="Tutup modal export"
                    className="rounded-xl p-2 bg-gradient-to-br from-rose-500 via-rose-600 to-red-700 text-white border border-rose-300/40 hover:scale-105 transition-all duration-200 active:scale-95 cursor-pointer"
                  >
                    <X className="size-4" strokeWidth={2.25} />
                  </button>
                </div>

                {/* Body */}
                <div className="modal-body space-y-2.5 p-6 text-sm text-slate-700 dark:text-slate-200">
                  {[
                    { value: 'xlsx', label: 'Excel (.xlsx)', desc: 'Format Microsoft Excel Modern (Disarankan)' },
                    { value: 'xls', label: 'Excel Legacy (.xls)', desc: 'Format Microsoft Excel Standard 97-2003' },
                    { value: 'csv', label: 'CSV (.csv)', desc: 'Format Comma-Separated Values universal' },
                    { value: 'pdf', label: 'PDF (.pdf)', desc: 'Format Dokumen Cetak Resmi' },
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
                        name="export-fmt-schedule"
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

                  {/* Active Scope Summary */}
                  <div className="mt-3 rounded-xl border border-emerald-100 bg-emerald-50/40 p-3 dark:border-emerald-900/40 dark:bg-emerald-950/20 text-xs">
                    <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
                      <span>Total Data Terpilih:</span>
                      <span className="font-extrabold text-[#0E5C44] dark:text-emerald-400">
                        {Number(items?.length || 0).toLocaleString('id-ID')} Baris Jadwal
                      </span>
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="modal-footer flex items-center justify-between border-t border-slate-100 bg-slate-50/50 px-6 py-4 dark:border-slate-800 dark:bg-slate-900/30">
                  <button
                    type="button"
                    onClick={() => setShowExportModal(false)}
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

      {/* ══════════════════════════════════════════════════════════════════
          3. HARMONIZED BATCH IMPORT MODAL
      ══════════════════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {showImportModal && (
          <div
            className="overlay modal fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/70 backdrop-blur-md"
            role="dialog"
            aria-modal="true"
            aria-labelledby="schedule-import-title"
            tabIndex={-1}
            onMouseDown={(e) => {
              if (e.target === e.currentTarget && !isImporting) setShowImportModal(false)
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 14 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ type: 'spring', stiffness: 400, damping: 28 }}
              className="modal-dialog font-sans my-auto w-full max-w-xl"
            >
              <div className="modal-content flex max-h-[calc(100dvh-2rem)] flex-col overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-2xl shadow-emerald-950/20 dark:border-slate-800 dark:bg-[#182232] dark:shadow-black/60">
                {/* Top Accent Gradient Bar */}
                <div className="h-1.5 w-full bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-600 shrink-0" />

                {/* Header */}
                <div className="modal-header flex items-center justify-between border-b border-slate-100 bg-white px-6 py-4.5 dark:border-slate-800 dark:bg-slate-950">
                  <div className="flex items-center gap-3">
                    <div className="rounded-2xl bg-gradient-to-br from-sky-500 via-sky-600 to-blue-600 text-white p-2.5 shadow-md shadow-sky-500/30 border border-sky-300/30 shrink-0">
                      <Upload className="h-5 w-5 text-white" strokeWidth={2.25} />
                    </div>
                    <div>
                      <h3
                        id="schedule-import-title"
                        className="modal-title text-sm sm:text-base font-black text-slate-900 dark:text-white flex items-center gap-2"
                      >
                        <span>Import Jadwal Pelajaran</span>
                        <span className="inline-flex items-center gap-1 rounded-full bg-sky-50 px-2 py-0.5 text-[10px] font-bold text-sky-700 border border-sky-200/80 dark:bg-sky-950/60 dark:text-sky-300 dark:border-sky-800/60">
                          <Sparkles className="size-3" />
                          Batch Import
                        </span>
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        Unggah berkas spreadsheet (.csv) untuk impor jadwal pelajaran massal
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    disabled={isImporting}
                    onClick={() => setShowImportModal(false)}
                    aria-label="Tutup form import"
                    className="rounded-xl p-2 bg-gradient-to-br from-rose-500 via-rose-600 to-red-700 text-white border border-rose-300/40 hover:scale-105 transition-all duration-200 active:scale-95 cursor-pointer disabled:opacity-50"
                  >
                    <X className="size-4" strokeWidth={2.25} />
                  </button>
                </div>

                {/* Modal Body */}
                <div className="modal-body min-h-0 flex-1 space-y-4.5 overflow-y-auto p-6 text-sm text-slate-700 dark:text-slate-200">
                  {/* Unduh Template Card */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-sky-200/70 bg-gradient-to-r from-sky-50/50 via-teal-50/20 to-white p-4 dark:border-sky-850/50 dark:bg-slate-900/40">
                    <div className="flex items-center gap-3">
                      <div className="flex size-9 items-center justify-center rounded-xl bg-gradient-to-br from-sky-500 via-sky-600 to-blue-600 text-white border border-sky-300/30 shrink-0">
                        <Download className="size-4.5 text-white" strokeWidth={2.2} />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-800 dark:text-slate-100">Unduh Format Berkas</p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">Gunakan template resmi agar kolom jadwal terpetakan otomatis</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleDownloadTemplate('xlsx')}
                        className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-200 bg-emerald-50/50 hover:bg-emerald-100/70 text-[#0E5C44] px-3 py-1.5 text-xs font-bold transition-all dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 cursor-pointer hover:scale-[1.02] active:scale-95"
                      >
                        <div className="flex size-5 items-center justify-center rounded-md bg-emerald-600 text-white">
                          <Download className="size-3 text-white" strokeWidth={2.2} />
                        </div>
                        <span>Excel (.xlsx)</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDownloadTemplate('csv')}
                        className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 px-3 py-1.5 text-xs font-bold transition-all dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-300 cursor-pointer hover:scale-[1.02] active:scale-95"
                      >
                        <div className="flex size-5 items-center justify-center rounded-md bg-slate-600 text-white">
                          <Download className="size-3 text-white" strokeWidth={2.2} />
                        </div>
                        <span>CSV</span>
                      </button>
                    </div>
                  </div>

                  {/* Dropzone Upload */}
                  <label className="group relative flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-emerald-300/80 bg-gradient-to-b from-emerald-50/25 to-slate-50/50 p-6 text-center transition-all duration-200 hover:border-emerald-500 hover:bg-emerald-50/40 hover:shadow-xs dark:border-emerald-800/60 dark:bg-slate-900/30 dark:hover:border-emerald-600 dark:hover:bg-emerald-950/20">
                    <div className="mb-2.5 flex size-12 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200/60 text-[#0E5C44] transition-transform duration-200 group-hover:scale-110 dark:from-emerald-950/60 dark:to-teal-950/40 dark:border-emerald-800/60 dark:text-[#3FBF75]">
                      <FileSpreadsheet className="size-6" strokeWidth={2.2} />
                    </div>
                    <p className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-100">
                      {importFile ? importFile.name : 'Pilih atau Tarik Berkas Jadwal (.xlsx, .xls, .csv) ke Sini'}
                    </p>
                    <p className="mt-1 text-[11px] text-slate-400 dark:text-slate-400">
                      Mendukung format Excel Spreadsheet (.xlsx, .xls) dan CSV (.csv)
                    </p>
                    {importFile && (
                      <div className="mt-2.5 inline-flex items-center gap-1.5 rounded-full bg-emerald-100/80 px-3 py-1 text-[11px] font-bold text-[#0E5C44] border border-emerald-200 dark:bg-emerald-950/80 dark:text-emerald-300 dark:border-emerald-800/80">
                        <CheckCircle2 className="size-3.5" />
                        <span>{(importFile.size / 1024).toFixed(1)} KB · Berkas Siap Diunggah</span>
                      </div>
                    )}
                    <input type="file" accept=".xlsx,.xls,.csv" onChange={handleFileSelect} className="hidden" />
                  </label>

                  {/* Table Preview */}
                  {importPreviewData.length > 0 && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                          <span>Preview Data Berkas</span>
                          <span className="inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                            {importPreviewData.length} baris pertama
                          </span>
                        </p>
                      </div>
                      <div className="max-h-44 overflow-auto rounded-2xl border border-emerald-200/80 bg-white shadow-2xs dark:border-emerald-900/50 dark:bg-[#182232]">
                        <table className="w-full text-left text-[11px]">
                          <thead className="bg-gradient-to-r from-emerald-100/80 via-teal-50/60 to-emerald-100/80 border-b border-emerald-200/80 dark:from-emerald-950/80 dark:via-teal-950/60 dark:to-emerald-950/80 dark:border-emerald-900/50 font-bold text-slate-700 dark:text-slate-200">
                            <tr>
                              {['Kelas ID', 'Guru ID', 'Mapel ID', 'Hari', 'Mulai', 'Selesai'].map((h) => (
                                <th key={h} className="px-3 py-2.5">{h}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-emerald-100/80 dark:divide-emerald-900/40">
                            {importPreviewData.map((r, i) => (
                              <tr key={i} className="hover:bg-emerald-50/30 dark:hover:bg-slate-800/40 transition-colors">
                                <td className="px-3 py-2 font-mono text-slate-700 dark:text-slate-300 truncate max-w-[100px]">{r.kelas_id || '-'}</td>
                                <td className="px-3 py-2 font-mono text-slate-700 dark:text-slate-300 truncate max-w-[100px]">{r.employee_id || '-'}</td>
                                <td className="px-3 py-2 font-mono text-slate-700 dark:text-slate-300 truncate max-w-[100px]">{r.subject_id || '-'}</td>
                                <td className="px-3 py-2 font-medium text-slate-900 dark:text-white">{r.day_of_week || '-'}</td>
                                <td className="px-3 py-2 font-medium text-slate-900 dark:text-white">{r.time_start || '-'}</td>
                                <td className="px-3 py-2 font-medium text-slate-900 dark:text-white">{r.time_end || '-'}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>

                {/* Footer */}
                <div className="modal-footer flex items-center justify-between border-t border-slate-100 bg-slate-50/50 px-6 py-4 dark:border-slate-800 dark:bg-slate-900/30">
                  <button
                    type="button"
                    disabled={isImporting}
                    onClick={() => setShowImportModal(false)}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200/90 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 shadow-2xs hover:bg-slate-100 hover:text-slate-900 transition-all dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 cursor-pointer disabled:opacity-50"
                  >
                    <X className="size-4 text-slate-400" />
                    <span>Batal</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleProcessImport}
                    disabled={!importFile || isImporting}
                    className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#0E5C44] to-[#147B5B] hover:from-[#0B4A37] hover:to-[#0F6349] dark:from-[#147B5B] dark:to-[#1E8E5A] text-white px-5 py-2.5 text-xs font-extrabold shadow-md shadow-[#0E5C44]/25 hover:shadow-lg hover:shadow-[#0E5C44]/35 transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
                  >
                    {isImporting ? (
                      <span className="size-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    ) : (
                      <Upload className="size-4" strokeWidth={2.25} />
                    )}
                    <span>{isImporting ? 'Memproses Impor...' : 'Mulai Impor Data'}</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      {/* ── Modern Hero Header (TailGrids Standard) ── */}
      {!shouldHideHeader && (
        <div className="relative overflow-hidden rounded-[22px] border-2 border-emerald-500/30 bg-gradient-to-r from-emerald-500/15 via-teal-500/10 to-emerald-600/15 p-5 sm:p-6 shadow-md shadow-emerald-500/10 dark:border-emerald-600/40 dark:bg-gradient-to-r dark:from-emerald-950/70 dark:via-teal-950/50 dark:to-slate-900">
          <div className="pointer-events-none absolute -left-12 -top-12 h-44 w-44 rounded-full bg-gradient-to-br from-emerald-500/40 via-teal-400/30 to-transparent blur-3xl" />
          <div className="pointer-events-none absolute -right-12 -bottom-12 h-44 w-44 rounded-full bg-gradient-to-br from-teal-400/30 via-emerald-500/20 to-transparent blur-3xl" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-start sm:items-center gap-4">
              <div className="flex size-12 sm:size-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700 text-white shadow-lg shadow-emerald-600/30 ring-4 ring-emerald-500/20">
                <CalendarDays className="size-6 sm:size-7" />
              </div>
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1 rounded-md bg-gradient-to-r from-emerald-600 to-teal-600 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-white shadow-xs">
                    Plot Akademik
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-md bg-emerald-500/15 px-2 py-0.5 text-[11px] font-bold text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300">
                    <Sparkles className="size-3 text-emerald-600 dark:text-emerald-400" />
                    Jadwal Terpadu
                  </span>
                </div>
                <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                  Jadwal Pelajaran & Plot Mengajar
                </h1>
                <p className="text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-300 max-w-2xl leading-relaxed">
                  Kelola alokasi jam mengajar guru, rombongan belajar, dan mata pelajaran terintegrasi akademik sekolah.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
              <div className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-500/40 bg-gradient-to-r from-emerald-100 via-emerald-50 to-teal-100 px-3.5 py-1.5 text-xs font-black text-emerald-900 dark:border-emerald-700 dark:bg-gradient-to-r dark:from-emerald-950 dark:to-teal-950 dark:text-emerald-200 shadow-2xs">
                <Sparkles className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>Jadwal & Plot Mengajar</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Stats Summary Cards (Modern 4-Card Grid - TailGrids Gold Standard) ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <ModernKpiCard
          icon={CalendarDays}
          label="TOTAL JADWAL"
          value={isLoading ? '—' : Number(stats.total ?? meta.total ?? 0).toLocaleString('id-ID')}
          subtext="Sesi mengajar terdaftar"
          tag="Terdaftar"
          tone="emerald"
        />
        <ModernKpiCard
          icon={CheckCircle2}
          label="JADWAL AKTIF"
          value={isLoading ? '—' : Number(stats.aktif ?? (stats.total !== undefined ? stats.total - (stats.tidak_aktif ?? 0) : meta.total ?? 0)).toLocaleString('id-ID')}
          subtext="Siap digunakan presensi"
          tag="Aktif"
          tone="blue"
        />
        <ModernKpiCard
          icon={Clock3}
          label="NONAKTIF / ARSIP"
          value={isLoading ? '—' : Number(stats.tidak_aktif ?? 0).toLocaleString('id-ID')}
          subtext="Jadwal diarsipkan"
          tag="Arsip"
          tone="amber"
        />
        <ModernKpiCard
          icon={Users}
          label="GURU TERJADWAL"
          value={isLoading ? '—' : Number(stats.guru_terjadwal ?? 0).toLocaleString('id-ID')}
          subtext="Guru mengajar aktif"
          tag="Pengajar"
          tone="indigo"
        />
      </div>

      {/* ── UNIFIED MASTER DATA CONTAINER (EMERALD DATATABLE CONTAINER) ── */}
      <div className="relative overflow-hidden rounded-[22px] border-2 border-emerald-300 bg-white shadow-md shadow-emerald-500/10 dark:border-emerald-700/80 dark:bg-[#1B2433]">
        {/* ── TOOLBAR 3-BARIS TERPADU (TailGrids Benchmark Standard) ── */}
        <div className="border-b border-emerald-200/90 bg-gradient-to-r from-emerald-500/10 via-teal-500/5 to-transparent px-4 py-4 sm:px-6 md:px-8 dark:border-emerald-800/60 dark:bg-gradient-to-r dark:from-emerald-950/50 dark:via-teal-950/30 dark:to-transparent print:hidden">
          {/* Baris 1: Header Action Row */}
          <div className="flex flex-col gap-3.5 xl:flex-row xl:items-center xl:justify-between border-b border-emerald-100 dark:border-emerald-900/50 pb-3.5">
            {/* Kiri: Icon Badge + Title + Count + Segmented Tab Bar */}
            <div className="flex flex-wrap items-center gap-3.5 min-w-0">
              <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-600 via-teal-600 to-emerald-700 text-white shadow-md shadow-emerald-600/30 border border-emerald-300/30">
                <CalendarDays className="size-5.5 text-white" strokeWidth={2.2} />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                    {viewMode === 'table' ? 'Daftar Jadwal & Plot Mengajar' : 'Matriks Mingguan Jadwal Pelajaran'}
                  </h3>
                  <span className="inline-flex items-center rounded-full bg-emerald-100/90 px-2.5 py-0.5 text-xs font-extrabold text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/60">
                    {Number(meta.total ?? 0).toLocaleString('id-ID')} jadwal
                  </span>
                </div>
                <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                  Filter jadwal pelajaran berdasarkan unit, periode akademik, guru, atau rombel.
                </p>
              </div>

              {/* ── TAB DAFTAR TABEL & MATRIKS MINGGUAN (POSISI DI CONTAINER DATATABLE) ── */}
              <div className="inline-flex items-center rounded-xl bg-slate-100/90 p-1 dark:bg-slate-800/80 border border-emerald-200/60 dark:border-emerald-800/50">
                <button
                  type="button"
                  onClick={() => setViewMode('table')}
                  className={cn(
                    'flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-black transition-all duration-200 cursor-pointer',
                    viewMode === 'table'
                      ? 'bg-gradient-to-r from-emerald-600 via-emerald-600 to-teal-700 text-white shadow-sm shadow-emerald-700/25'
                      : 'text-slate-600 hover:text-emerald-800 dark:text-slate-300 dark:hover:text-emerald-300'
                  )}
                >
                  <TableIcon className="size-3.5" />
                  <span>Daftar Tabel</span>
                  <span
                    className={cn(
                      'rounded-full px-1.5 py-0.2 text-[10px] font-black',
                      viewMode === 'table'
                        ? 'bg-white/20 text-white'
                        : 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300'
                    )}
                  >
                    {Number(meta.total ?? 0).toLocaleString('id-ID')}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('weekly')}
                  className={cn(
                    'flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-black transition-all duration-200 cursor-pointer',
                    viewMode === 'weekly'
                      ? 'bg-gradient-to-r from-emerald-600 via-emerald-600 to-teal-700 text-white shadow-sm shadow-emerald-700/25'
                      : 'text-slate-600 hover:text-emerald-800 dark:text-slate-300 dark:hover:text-emerald-300'
                  )}
                >
                  <LayoutGrid className="size-3.5" />
                  <span>Matriks Mingguan</span>
                  <span
                    className={cn(
                      'rounded-full px-1.5 py-0.2 text-[10px] font-black',
                      viewMode === 'weekly'
                        ? 'bg-white/20 text-white'
                        : 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300'
                    )}
                  >
                    7 Hari
                  </span>
                </button>
              </div>
            </div>

            {/* Kanan: 4 Vivid Gradient Squircle Action Buttons */}
            <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0 self-start sm:self-auto flex-wrap">
              {pageActions}
            </div>
          </div>

          {/* Baris 2: Full-width Search Input */}
          <div className="w-full min-w-0 pt-3">
            <AppSearch
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                setPage(1)
              }}
              placeholder="Cari guru, mata pelajaran, atau nama kelas..."
              size="sm"
            />
          </div>

          {/* Baris 3: Filter Controls Horizontal */}
          <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-2 sm:gap-2.5 w-full pt-3">
            {/* Filter Unit: Terkunci untuk Guru, dropdown untuk manajemen */}
            {isGuru ? (
              /* Badge unit terkunci (read-only) untuk role Guru */
              <div className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-200/80 bg-emerald-50/60 px-3 py-2 text-xs font-bold text-emerald-800 dark:border-emerald-800/50 dark:bg-emerald-950/40 dark:text-emerald-300 shrink-0">
                <ShieldCheck className="size-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>
                  {unitOptions.find((u) => String(u.id) === String(unitFilter))?.name ||
                    unitOptions.find((u) => String(u.id) === String(unitFilter))?.nama ||
                    'Unit Anda'}
                </span>
              </div>
            ) : (
              <MasterFilterSelect
                aria-label="Filter Unit Pendidikan"
                value={unitFilter}
                onChange={(e) => {
                  setUnitFilter(e.target.value)
                  setClassFilter('')
                  setTeacherFilter('')
                  setSubjectFilter('')
                  setPage(1)
                }}
                className="w-full sm:w-auto min-w-[140px]"
              >
                <option value="">Semua Unit</option>
                {unitOptions.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name || u.nama}
                  </option>
                ))}
              </MasterFilterSelect>
            )}

            <MasterFilterSelect
              aria-label="Filter Hari Mengajar"
              value={dayFilter}
              onChange={(e) => {
                setDayFilter(e.target.value)
                setPage(1)
              }}
              className="w-full sm:w-auto min-w-[140px]"
            >
              <option value="">Semua Hari</option>
              {DAYS_MAP.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </MasterFilterSelect>

            {/* Filter Guru: DISEMBUNYIKAN untuk role Guru (mereka hanya bisa lihat jadwal mereka sendiri) */}
            {!isGuru && (
              <MasterFilterSelect
                aria-label="Filter Guru"
                value={teacherFilter}
                onChange={(e) => {
                  setTeacherFilter(e.target.value)
                  setPage(1)
                }}
                className="w-full sm:w-auto min-w-[140px]"
              >
                <option value="">Semua Guru</option>
                {(options.guru || [])
                  .filter((g) => !unitFilter || g.unit_id === unitFilter)
                  .map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.nama_lengkap}
                    </option>
                  ))}
              </MasterFilterSelect>
            )}

            <MasterFilterSelect
              aria-label="Filter Status"
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value)
                setPage(1)
              }}
              className="w-full sm:w-auto min-w-[140px]"
            >
              <option value="">Semua Status</option>
              <option value="1">Aktif</option>
              <option value="0">Nonaktif</option>
            </MasterFilterSelect>

            {(Boolean(search) || activeFilterCount > 0) && (
              <button
                type="button"
                onClick={resetFilters}
                className="w-full sm:w-auto sm:ml-auto justify-center inline-flex items-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50/80 px-3 py-2 text-xs font-bold text-rose-700 hover:bg-rose-100 dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-300 dark:hover:bg-rose-950/60 transition-colors shrink-0 cursor-pointer"
              >
                <RefreshCcw className="size-3.5" />
                <span>Reset Filter</span>
              </button>
            )}
          </div>
        </div>

        {/* ── BODY CONTENT ── */}
        {isLoading ? (
          <div className="p-8 print:hidden">
            <AppSkeleton variant="table" rows={6} cols={7} />
          </div>
        ) : isError ? (
          <div className="p-8 print:hidden">
            <AppErrorState
              title="Gagal Memuat Jadwal"
              description="Terjadi kesalahan saat memuat data jadwal pelajaran. Silakan coba lagi."
              onRetry={refetch}
              compact
            />
          </div>
        ) : items.length === 0 ? (
          <div className="p-8 print:hidden">
            <AppEmptyState
              title="Belum Ada Jadwal Pelajaran"
              description="Tidak ada jadwal yang sesuai dengan filter. Tambahkan jadwal baru atau sesuaikan kata kunci pencarian."
              actionLabel={activeFilterCount > 0 || search ? 'Reset Filter' : 'Tambah Jadwal'}
              onAction={activeFilterCount > 0 || search ? resetFilters : openAdd}
            />
          </div>
        ) : viewMode === 'weekly' ? (
          /* WEEKLY MATRIX GRID VIEW */
          <div className="p-5 space-y-5">
            {/* Canonical Days Tab Strip */}
            <div className="relative rounded-2xl border-2 border-emerald-200/80 dark:border-emerald-800/60 bg-emerald-50/30 dark:bg-slate-900/60 p-1.5 shadow-2xs">
              <div className="flex gap-2 overflow-x-auto no-scrollbar">
                {DAYS_MAP.map((day) => {
                  const dayCount =
                    stats?.per_hari?.[day.id] ??
                    stats?.per_hari?.[String(day.id)] ??
                    items.filter((item) => (item.day_of_week ?? 1) === day.id).length
                  const isDayActive = selectedWeeklyDay === day.id

                  return (
                    <button
                      key={day.id}
                      type="button"
                      onClick={() => {
                        setSelectedWeeklyDay(day.id)
                        setDayFilter(String(day.id))
                        setPage(1)
                      }}
                      className={cn(
                        'flex h-10 shrink-0 items-center gap-2 rounded-xl px-4 text-xs font-black transition-all duration-200 cursor-pointer',
                        isDayActive
                          ? 'bg-gradient-to-r from-emerald-600 via-emerald-600 to-teal-700 text-white shadow-md shadow-emerald-700/25'
                          : 'bg-white text-slate-700 hover:bg-emerald-50/60 hover:text-emerald-900 dark:bg-slate-800/80 dark:text-slate-300 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-700/70'
                      )}
                    >
                      <Calendar className="size-3.5" />
                      <span>{day.name}</span>
                      <span
                        className={cn(
                          'rounded-full px-2 py-0.5 text-[10px] font-black',
                          isDayActive
                            ? 'bg-white/20 text-white'
                            : 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300'
                        )}
                      >
                        {dayCount}
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Grid of Schedules for Selected Day */}
            {weeklyGridData.length > 0 ? (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {weeklyGridData.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => setDetailDrawerItem(item)}
                    className="group relative cursor-pointer rounded-[20px] border border-emerald-200/70 bg-white p-4 shadow-xs transition-all duration-200 hover:border-emerald-400 hover:shadow-md hover:-translate-y-0.5 dark:border-emerald-900/50 dark:bg-[#1B2433]"
                  >
                    <div className="flex items-center justify-between text-xs text-emerald-700 font-bold dark:text-emerald-400">
                      <span className="flex items-center gap-1 font-mono">
                        <Clock className="h-3.5 w-3.5" />
                        {formatTime(item.time_start)} – {formatTime(item.time_end)}
                      </span>
                      <AppBadge variant={item.is_active ? 'success' : 'neutral'} dot>
                        {item.is_active ? 'Aktif' : 'Nonaktif'}
                      </AppBadge>
                    </div>

                    <h4 className="mt-2 text-sm font-extrabold text-slate-900 group-hover:text-emerald-700 dark:text-white dark:group-hover:text-emerald-400">
                      {subjectName(item.subject)}
                    </h4>

                    <div className="mt-2 space-y-1 text-xs text-slate-600 dark:text-slate-300">
                      <p className="flex items-center gap-1.5 font-medium">
                        <Building2 className="h-3.5 w-3.5 shrink-0 text-emerald-600/70 dark:text-emerald-400/70" />
                        <span>
                          {item.kelas?.nama_kelas || item.school_class?.name || 'Kelas'}
                          {item.kelas?.unit_pendidikan?.name && (
                            <span className="text-slate-400">
                              {' '}
                              · {item.kelas.unit_pendidikan.name}
                            </span>
                          )}
                        </span>
                      </p>
                      <p className="flex items-center gap-1.5 font-medium">
                        <Users className="h-3.5 w-3.5 shrink-0 text-emerald-600/70 dark:text-emerald-400/70" />
                        <span>{item.employee?.nama_lengkap || item.teacher?.name || 'Guru'}</span>
                      </p>
                    </div>

                    <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-2.5 dark:border-slate-800">
                      <span className="text-[11px] font-semibold text-slate-400">
                        {item.academic_year?.name || item.tahun_ajaran_name || '-'}
                      </span>
                      <span className="text-[11px] font-bold text-emerald-700 group-hover:underline dark:text-emerald-400">
                        Detail →
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-16 text-center text-xs text-slate-400">
                Tidak ada jadwal pelajaran pada hari {DAYS_MAP.find((d) => d.id === selectedWeeklyDay)?.name}.
              </div>
            )}
          </div>
        ) : (
          /* TABLE & MOBILE DATA CARDS VIEW */
          <>
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full table-fixed text-left text-sm">
                <thead className="border-b-2 border-emerald-200/90 bg-gradient-to-r from-emerald-100/90 via-teal-50/70 to-emerald-100/90 text-[10px] font-black uppercase tracking-[0.12em] text-emerald-950 dark:border-emerald-800/60 dark:from-emerald-950/90 dark:via-teal-950/70 dark:to-emerald-950/90 dark:text-emerald-200">
                  <tr>
                    <th className="w-[14%] p-4">Hari & Jam</th>
                    <th className="w-[22%] p-4">Mata Pelajaran</th>
                    <th className="w-[18%] p-4">Kelas & Unit</th>
                    <th className="w-[20%] p-4">Guru Pengampu</th>
                    <th className="hidden w-[14%] p-4 lg:table-cell">Periode Akademik</th>
                    <th className="w-[10%] p-4 sm:table-cell">Status</th>
                    <th className="w-[12%] p-4 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-emerald-100/80 font-medium text-slate-700 dark:divide-emerald-900/40 dark:text-slate-200">
                  {items.map((item) => (
                    <tr
                      key={item.id}
                      className="group border-b border-emerald-50 dark:border-emerald-950/30 hover:bg-emerald-50/40 dark:hover:bg-emerald-950/20 transition-all duration-200 cursor-pointer"
                    >
                      <td className="p-4 font-bold text-slate-900 dark:text-white">
                        <div>{item.nama_hari || DAYS_MAP.find((d) => d.id === item.day_of_week)?.name}</div>
                        <div className="font-mono text-xs font-semibold text-emerald-800 dark:text-emerald-400">
                          {formatTime(item.time_start)} – {formatTime(item.time_end)}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="truncate font-bold text-slate-900 dark:text-white">
                          {subjectName(item.subject)}
                        </div>
                        <div className="font-mono text-xs text-slate-400">
                          {item.subject?.kode_mapel || item.subject?.code || '-'}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="truncate font-semibold text-slate-800 dark:text-slate-100">
                          {item.kelas?.nama_kelas || item.school_class?.name || '-'}
                        </div>
                        <div className="text-xs text-slate-500 truncate">
                          {item.kelas?.unit_pendidikan?.name || '-'}
                        </div>
                      </td>
                      <td className="p-4">
                        <PersonIdentityCell
                          src={
                            item.employee?.photo_url ||
                            item.employee?.avatar_url ||
                            item.employee?.foto
                          }
                          name={item.employee?.nama_lengkap || item.teacher?.name || '-'}
                          subtitle={
                            item.employee?.niy ? `NIY ${item.employee.niy}` : 'Guru pengampu'
                          }
                        />
                      </td>
                      <td className="hidden p-4 text-xs lg:table-cell">
                        <div className="font-bold text-slate-800 dark:text-slate-100">
                          {item.academic_year?.name || '-'}
                        </div>
                        <div className="text-slate-500">{item.semester?.name || '-'}</div>
                      </td>
                      <td className="p-4">
                        <AppBadge variant={item.is_active ? 'success' : 'neutral'} dot>
                          {item.is_active ? 'Aktif' : 'Nonaktif'}
                        </AppBadge>
                      </td>
                      <td className="p-4 text-center">
                        <span className="inline-flex justify-center">
                          <ActionDropdown
                            onView={() => setDetailDrawerItem(item)}
                            onEdit={canManage ? () => openEdit(item) : undefined}
                            onDelete={canManage ? () => remove(item) : undefined}
                          />
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Data Cards View */}
            <div className="grid gap-3 p-4 md:hidden">
              {items.map((item) => (
                <MobileDataCard
                  key={item.id}
                  title={subjectName(item.subject)}
                  subtitle={`${item.nama_hari || DAYS_MAP.find((d) => d.id === item.day_of_week)?.name} (${formatTime(item.time_start)}–${formatTime(item.time_end)})`}
                  avatarSrc={
                    item.employee?.photo_url ||
                    item.employee?.avatar_url ||
                    item.employee?.foto
                  }
                  badge={item.is_active ? 'Aktif' : 'Nonaktif'}
                  badgeVariant={item.is_active ? 'success' : 'neutral'}
                  fields={[
                    {
                      label: 'Kelas & Unit',
                      value: `${item.kelas?.nama_kelas || 'Kelas'} · ${item.kelas?.unit_pendidikan?.name || 'Unit'}`,
                      icon: Building2,
                    },
                    {
                      label: 'Guru Pengampu',
                      value: item.employee?.nama_lengkap || item.teacher?.name || 'Guru',
                      icon: Users,
                    },
                  ]}
                  onView={() => setDetailDrawerItem(item)}
                  onEdit={canManage ? () => openEdit(item) : undefined}
                  onDelete={canManage ? () => remove(item) : undefined}
                />
              ))}
            </div>
          </>
        )}

        {/* ── PAGINATION BAR (Default 10 Data per Halaman) ── */}
        <div className="border-t border-emerald-200/90 bg-slate-50/60 px-4 py-3 sm:px-6 md:px-8 dark:border-emerald-800/70 dark:bg-slate-900/40 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            Menampilkan baris ke <span className="font-bold text-emerald-800 dark:text-emerald-300">{items.length > 0 ? (page - 1) * 10 + 1 : 0}</span> sampai{' '}
            <span className="font-bold text-emerald-800 dark:text-emerald-300">{Math.min(page * 10, meta.total ?? 0)}</span> dari{' '}
            <span className="font-bold text-emerald-800 dark:text-emerald-300">{Number(meta.total ?? 0).toLocaleString('id-ID')}</span> jadwal
          </p>
          <Pagination
            currentPage={page}
            totalPages={Math.max(1, meta.last_page || Math.ceil((meta.total ?? 0) / 10))}
            onPageChange={setPage}
            sideLayout="icon"
            variant="default"
          />
        </div>
      </div>

      {/* DETAIL DRAWER */}
      <AppDrawer
        isOpen={Boolean(detailDrawerItem)}
        onClose={() => setDetailDrawerItem(null)}
        icon={CalendarDays}
        title="Detail Jadwal Pelajaran"
        description="Informasi lengkap alokasi waktu dan penugasan guru."
        footer={
          <div className="flex items-center justify-end gap-2">
            <AppButton
              variant="secondary"
              size="sm"
              onClick={() => setDetailDrawerItem(null)}
            >
              Tutup
            </AppButton>
            {detailDrawerItem && (
              <>
                <AppButton
                  variant="primary"
                  size="sm"
                  icon={Pencil}
                  onClick={() => {
                    const item = detailDrawerItem
                    setDetailDrawerItem(null)
                    openEdit(item)
                  }}
                >
                  Edit Jadwal
                </AppButton>
                <AppButton
                  variant="destructive"
                  size="sm"
                  icon={Trash2}
                  onClick={() => remove(detailDrawerItem)}
                >
                  Hapus
                </AppButton>
              </>
            )}
          </div>
        }
      >
        {detailDrawerItem && (
          <div className="space-y-5 p-1">
            {/* Header Highlight Card */}
            <div className="rounded-2xl border border-emerald-100 bg-emerald-50/50 p-4 dark:border-emerald-900/40 dark:bg-emerald-950/20">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-400">
                  {detailDrawerItem.nama_hari ||
                    DAYS_MAP.find((d) => d.id === detailDrawerItem.day_of_week)?.name}
                </span>
                <AppBadge variant={detailDrawerItem.is_active ? 'success' : 'neutral'} dot>
                  {detailDrawerItem.is_active ? 'Aktif' : 'Nonaktif'}
                </AppBadge>
              </div>
              <div className="mt-2 text-xl font-extrabold text-slate-900 dark:text-white">
                {formatTime(detailDrawerItem.time_start)} – {formatTime(detailDrawerItem.time_end)} WIB
              </div>
              <p className="mt-1 text-sm font-semibold text-slate-700 dark:text-slate-200">
                {subjectName(detailDrawerItem.subject)}
              </p>
            </div>

            {/* Information Grid */}
            <div className="space-y-4 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-[#1B2433]">
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
                Informasi Penugasan
              </h4>

              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-slate-400">Kelas / Rombel</span>
                  <div className="mt-0.5 font-bold text-slate-800 dark:text-white">
                    {detailDrawerItem.kelas?.nama_kelas || detailDrawerItem.school_class?.name || '-'}
                  </div>
                </div>

                <div>
                  <span className="text-slate-400">Unit Pendidikan</span>
                  <div className="mt-0.5 font-bold text-slate-800 dark:text-white">
                    {detailDrawerItem.kelas?.unit_pendidikan?.name || '-'}
                  </div>
                </div>

                <div className="col-span-2 border-t border-slate-100 pt-3 dark:border-slate-800">
                  <span className="text-slate-400">Guru Pengampu</span>
                  <div className="mt-1">
                    <PersonIdentityCell
                      src={
                        detailDrawerItem.employee?.photo_url ||
                        detailDrawerItem.employee?.avatar_url
                      }
                      name={
                        detailDrawerItem.employee?.nama_lengkap ||
                        detailDrawerItem.teacher?.name ||
                        '-'
                      }
                      subtitle={
                        detailDrawerItem.employee?.niy
                          ? `NIY ${detailDrawerItem.employee.niy}`
                          : 'Guru Pengampu'
                      }
                    />
                  </div>
                </div>

                <div className="border-t border-slate-100 pt-3 dark:border-slate-800">
                  <span className="text-slate-400">Tahun Ajaran</span>
                  <div className="mt-0.5 font-bold text-slate-800 dark:text-white">
                    {detailDrawerItem.academic_year?.name || '-'}
                  </div>
                </div>

                <div className="border-t border-slate-100 pt-3 dark:border-slate-800">
                  <span className="text-slate-400">Semester</span>
                  <div className="mt-0.5 font-bold text-slate-800 dark:text-white">
                    {detailDrawerItem.semester?.name || '-'}
                  </div>
                </div>

                <div className="col-span-2 border-t border-slate-100 pt-3 dark:border-slate-800">
                  <span className="text-slate-400">Pola Minggu</span>
                  <div className="mt-0.5 font-semibold text-slate-800 dark:text-white">
                    {detailDrawerItem.week_type === 'odd'
                      ? 'Minggu Ganjil'
                      : detailDrawerItem.week_type === 'even'
                      ? 'Minggu Genap'
                      : 'Setiap Minggu'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </AppDrawer>

      {/* FORM MODAL (TAMBAH / EDIT) */}
      <MasterFormModal
        isOpen={modal}
        onClose={() => setModal(false)}
        icon={CalendarDays}
        title={editing ? 'Edit Jadwal Pelajaran' : 'Tambah Jadwal Pelajaran'}
        description="Lengkapi informasi akademik, penugasan guru, dan alokasi waktu mengajar."
        maxWidth="max-w-2xl"
        footer={
          <div className="flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setModal(false)}
              className="h-11 rounded-xl border border-slate-200 bg-slate-100 px-4 text-xs font-bold text-slate-700 hover:bg-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 transition-all cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              form="schedule-form"
              disabled={saveMutation.isPending}
              className="h-11 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-5 text-xs font-bold text-white hover:from-emerald-700 hover:to-teal-700 active:scale-95 disabled:opacity-50 transition-all cursor-pointer"
            >
              {saveMutation.isPending ? 'Menyimpan...' : 'Simpan Jadwal'}
            </button>
          </div>
        }
      >
        <form
          id="schedule-form"
          onSubmit={submit}
          className="space-y-6 p-6 text-xs font-semibold text-slate-700 dark:text-slate-200"
        >
          {/* Conflict Warning Banner */}
          {conflictWarning && (
            <div className="flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-rose-800 dark:border-rose-900/50 dark:bg-rose-950/30 dark:text-rose-300">
              <AlertTriangle className="h-5 w-5 shrink-0 text-rose-600 dark:text-rose-400" />
              <div className="text-xs">
                <strong className="block font-bold">Peringatan Bentrok / Validasi:</strong>
                <span>{conflictWarning}</span>
              </div>
            </div>
          )}

          {/* GRUP 1: INFORMASI AKADEMIK */}
          <div className="space-y-4 rounded-2xl border border-slate-100 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-800/40">
            <h4 className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-[#0E5C44] dark:text-[#3FBF75]">
              <Building2 className="h-4 w-4" />
              <span>1. Informasi & Periode Akademik</span>
            </h4>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              {/* Unit Pendidikan */}
              <div>
                <label className="mb-1 block text-xs font-bold text-slate-800 dark:text-slate-100">
                  Unit Pendidikan
                </label>
                <select
                  value={form.unit_pendidikan_id}
                  onChange={(e) => handleFormChange('unit_pendidikan_id', e.target.value)}
                  className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 outline-none focus:border-emerald-700 dark:border-slate-700 dark:bg-[#111827]"
                >
                  <option value="">Semua Unit (Lintas Unit)</option>
                  {unitOptions.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name || item.nama}
                    </option>
                  ))}
                </select>
              </div>

              {/* Tahun Ajaran */}
              <div>
                <label className="mb-1 block text-xs font-bold text-slate-800 dark:text-slate-100">
                  Tahun Ajaran *
                </label>
                <select
                  required
                  value={form.academic_year_id}
                  onChange={(e) => handleFormChange('academic_year_id', e.target.value)}
                  className={`h-11 w-full rounded-xl border bg-white px-3.5 outline-none focus:border-emerald-700 dark:border-slate-700 dark:bg-[#111827] ${
                    formErrors.academic_year_id ? 'border-rose-500' : 'border-slate-200'
                  }`}
                >
                  <option value="">Pilih Tahun Ajaran</option>
                  {(tahunAjaranList || []).map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name || item.tahun_ajaran || item.nama} {item.is_active ? '(Aktif)' : ''}
                    </option>
                  ))}
                </select>
                {formErrors.academic_year_id && (
                  <p className="mt-1 text-[11px] font-medium text-rose-500">
                    {formErrors.academic_year_id}
                  </p>
                )}
              </div>

              {/* Semester */}
              <div>
                <label className="mb-1 block text-xs font-bold text-slate-800 dark:text-slate-100">
                  Semester *
                </label>
                <select
                  required
                  value={form.semester_id}
                  onChange={(e) => handleFormChange('semester_id', e.target.value)}
                  disabled={!form.academic_year_id}
                  className={`h-11 w-full rounded-xl border bg-white px-3.5 outline-none focus:border-emerald-700 disabled:opacity-50 dark:border-slate-700 dark:bg-[#111827] ${
                    formErrors.semester_id ? 'border-rose-500' : 'border-slate-200'
                  }`}
                >
                  <option value="">
                    {!form.academic_year_id ? 'Pilih Thn Ajaran Dulu' : 'Pilih Semester'}
                  </option>
                  {filteredSemesters.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name} {item.is_active ? '(Aktif)' : ''}
                    </option>
                  ))}
                </select>
                {formErrors.semester_id && (
                  <p className="mt-1 text-[11px] font-medium text-rose-500">
                    {formErrors.semester_id}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* GRUP 2: PENUGASAN PEMBELAJARAN */}
          <div className="space-y-4 rounded-2xl border border-slate-100 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-800/40">
            <h4 className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-[#0E5C44] dark:text-[#3FBF75]">
              <BookOpen className="h-4 w-4" />
              <span>2. Penugasan Pembelajaran</span>
            </h4>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {/* Kelas / Rombel */}
              <div>
                <label className="mb-1 block text-xs font-bold text-slate-800 dark:text-slate-100">
                  Kelas / Rombel *
                </label>
                <select
                  required
                  value={form.kelas_id}
                  onChange={(e) => handleFormChange('kelas_id', e.target.value)}
                  className={`h-11 w-full rounded-xl border bg-white px-3.5 outline-none focus:border-emerald-700 dark:border-slate-700 dark:bg-[#111827] ${
                    formErrors.kelas_id ? 'border-rose-500' : 'border-slate-200'
                  }`}
                >
                  <option value="">
                    {filteredKelas.length === 0
                      ? 'Tidak ada kelas sesuai filter'
                      : 'Pilih Kelas / Rombel'}
                  </option>
                  {filteredKelas.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.nama_kelas}
                      {item.unitPendidikan?.name || item.unit_pendidikan?.name
                        ? ` · ${item.unitPendidikan?.name || item.unit_pendidikan?.name}`
                        : ''}
                    </option>
                  ))}
                </select>
                {formErrors.kelas_id && (
                  <p className="mt-1 text-[11px] font-medium text-rose-500">
                    {formErrors.kelas_id}
                  </p>
                )}
              </div>

              {/* Guru Pengampu */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-slate-800 dark:text-slate-100">
                    Guru Pengampu *
                  </label>
                  <button
                    type="button"
                    onClick={() => setGuruPickerOpen(true)}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0E5C44] hover:text-emerald-700 dark:text-[#3FBF75] hover:underline"
                  >
                    <Users className="h-3.5 w-3.5" />
                    Cari & Pilih Guru
                  </button>
                </div>
                <select
                  required
                  value={form.employee_id}
                  onChange={(e) => handleFormChange('employee_id', e.target.value)}
                  className={`h-11 w-full rounded-xl border bg-white px-3.5 outline-none focus:border-emerald-700 dark:border-slate-700 dark:bg-[#111827] ${
                    formErrors.employee_id ? 'border-rose-500' : 'border-slate-200'
                  }`}
                >
                  <option value="">
                    {filteredGuru.length === 0
                      ? 'Tidak ada guru sesuai unit'
                      : 'Pilih Guru Pengampu'}
                  </option>
                  {filteredGuru.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.nama_lengkap} {item.niy ? `(NIY ${item.niy})` : ''}
                    </option>
                  ))}
                </select>
                {formErrors.employee_id && (
                  <p className="mt-1 text-[11px] font-medium text-rose-500">
                    {formErrors.employee_id}
                  </p>
                )}
              </div>

              {/* Mata Pelajaran */}
              <div className="sm:col-span-2">
                <label className="mb-1 block text-xs font-bold text-slate-800 dark:text-slate-100">
                  Mata Pelajaran *
                </label>
                <select
                  required
                  value={form.subject_id}
                  onChange={(e) => handleFormChange('subject_id', e.target.value)}
                  className={`h-11 w-full rounded-xl border bg-white px-3.5 outline-none focus:border-emerald-700 dark:border-slate-700 dark:bg-[#111827] ${
                    formErrors.subject_id ? 'border-rose-500' : 'border-slate-200'
                  }`}
                >
                  <option value="">
                    {filteredSubjects.length === 0
                      ? 'Tidak ada mapel sesuai unit'
                      : 'Pilih Mata Pelajaran'}
                  </option>
                  {filteredSubjects.map((item) => (
                    <option key={item.id} value={item.id}>
                      {subjectName(item)} {item.kode_mapel || item.code ? `(${item.kode_mapel || item.code})` : ''}
                    </option>
                  ))}
                </select>
                {formErrors.subject_id && (
                  <p className="mt-1 text-[11px] font-medium text-rose-500">
                    {formErrors.subject_id}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* GRUP 3: WAKTU DAN TEMPAT */}
          <div className="space-y-4 rounded-2xl border border-slate-100 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-800/40">
            <h4 className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-[#0E5C44] dark:text-[#3FBF75]">
              <Clock className="h-4 w-4" />
              <span>3. Waktu & Jadwal Mengajar</span>
            </h4>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {/* Hari Mengajar */}
              <div>
                <label className="mb-1 block text-xs font-bold text-slate-800 dark:text-slate-100">
                  Hari Mengajar *
                </label>
                <select
                  required
                  value={form.day_of_week}
                  onChange={(e) => handleFormChange('day_of_week', e.target.value)}
                  className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 outline-none focus:border-emerald-700 dark:border-slate-700 dark:bg-[#111827]"
                >
                  {DAYS_MAP.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Pola Minggu */}
              <div>
                <label className="mb-1 block text-xs font-bold text-slate-800 dark:text-slate-100">
                  Pola Minggu
                </label>
                <select
                  value={form.week_type}
                  onChange={(e) => handleFormChange('week_type', e.target.value)}
                  className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 outline-none focus:border-emerald-700 dark:border-slate-700 dark:bg-[#111827]"
                >
                  <option value="all">Setiap Minggu</option>
                  <option value="odd">Minggu Ganjil</option>
                  <option value="even">Minggu Genap</option>
                </select>
              </div>

              {/* Jam Mulai */}
              <div>
                <label className="mb-1 block text-xs font-bold text-slate-800 dark:text-slate-100">
                  Jam Mulai *
                </label>
                <input
                  required
                  type="time"
                  value={form.time_start}
                  onChange={(e) => handleFormChange('time_start', e.target.value)}
                  className={`h-11 w-full rounded-xl border bg-white px-3.5 font-mono outline-none focus:border-emerald-700 dark:border-slate-700 dark:bg-[#111827] ${
                    formErrors.time_start ? 'border-rose-500' : 'border-slate-200'
                  }`}
                />
                {formErrors.time_start && (
                  <p className="mt-1 text-[11px] font-medium text-rose-500">
                    {formErrors.time_start}
                  </p>
                )}
              </div>

              {/* Jam Selesai */}
              <div>
                <label className="mb-1 block text-xs font-bold text-slate-800 dark:text-slate-100">
                  Jam Selesai *
                </label>
                <input
                  required
                  type="time"
                  value={form.time_end}
                  onChange={(e) => handleFormChange('time_end', e.target.value)}
                  className={`h-11 w-full rounded-xl border bg-white px-3.5 font-mono outline-none focus:border-emerald-700 dark:border-slate-700 dark:bg-[#111827] ${
                    formErrors.time_end ? 'border-rose-500' : 'border-slate-200'
                  }`}
                />
                {formErrors.time_end && (
                  <p className="mt-1 text-[11px] font-medium text-rose-500">
                    {formErrors.time_end}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* GRUP 4: STATUS & OPTIONAL */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-[#1B2433]">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={form.is_active}
                onChange={(e) => handleFormChange('is_active', e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 accent-[#0E5C44] focus:ring-[#0E5C44]"
              />
              <div>
                <span className="block text-xs font-bold text-slate-900 dark:text-white">
                  Jadwal Aktif untuk Presensi
                </span>
                <span className="block text-[11px] font-medium text-slate-400">
                  Jadwal aktif dapat langsung dipilih oleh guru saat penginputan absensi kelas.
                </span>
              </div>
            </label>
          </div>
        </form>
      </MasterFormModal>

      {/* Modal Interactive Picker Guru Pengampu */}
      {guruPickerOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-lg overflow-hidden rounded-3xl bg-white shadow-2xl dark:border dark:border-slate-800 dark:bg-[#111827]">
            {/* Header Modal */}
            <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/80 px-6 py-4 dark:border-slate-800 dark:bg-slate-900/50">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400">
                  <Users className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">Pilih Guru Pengampu</h3>
                  <p className="text-xs text-slate-500">Cari & pilih guru pengajar jadwal ini</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setGuruPickerOpen(false)}
                className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Body Search */}
            <div className="p-6 space-y-4">
              <div className="relative">
                <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  value={guruSearchText}
                  onChange={(e) => setGuruSearchText(e.target.value)}
                  placeholder="Cari nama guru atau NIY..."
                  className="h-11 w-full rounded-xl border border-slate-200 pl-10 pr-4 text-xs font-medium outline-none focus:border-emerald-700 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                />
              </div>

              {/* Guru List Scroll */}
              <div className="max-h-72 overflow-y-auto space-y-2 pr-1">
                {filteredGuruInPicker.length === 0 ? (
                  <div className="py-8 text-center text-xs text-slate-500">
                    Tidak ada data guru ditemukan untuk kata kunci "{guruSearchText}"
                  </div>
                ) : (
                  filteredGuruInPicker.map((guru) => {
                    const isSelected = form.employee_id === guru.id
                    return (
                      <div
                        key={guru.id}
                        onClick={() => {
                          handleFormChange('employee_id', guru.id)
                          setGuruPickerOpen(false)
                        }}
                        className={`flex items-center justify-between p-3.5 rounded-2xl border cursor-pointer transition-all ${
                          isSelected
                            ? 'border-emerald-500 bg-emerald-50/60 dark:bg-emerald-950/30'
                            : 'border-slate-100 hover:border-emerald-200 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800/40'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-2xl bg-emerald-100 font-bold text-emerald-800 flex items-center justify-center text-sm shadow-sm">
                            {guru.nama_lengkap?.charAt(0) || 'G'}
                          </div>
                          <div>
                            <p className="text-xs font-bold text-slate-900 dark:text-white">{guru.nama_lengkap}</p>
                            <p className="text-[11px] text-slate-500">
                              {guru.niy ? `NIY: ${guru.niy}` : 'Guru Active'}
                            </p>
                          </div>
                        </div>
                        <button
                          type="button"
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                            isSelected
                              ? 'bg-[#0E5C44] text-white'
                              : 'bg-slate-100 text-slate-700 hover:bg-[#0E5C44] hover:text-white dark:bg-slate-800 dark:text-slate-200'
                          }`}
                        >
                          {isSelected ? 'Terpilih' : 'Pilih Guru'}
                        </button>
                      </div>
                    )
                  })
                )}
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Toast Notification Stack */}
      <HarmonizedDeleteModal
        isOpen={Boolean(deleteItem)}
        onClose={() => setDeleteItem(null)}
        onConfirm={() => deleteMutation.mutate(deleteItem?.id)}
        item={deleteItem}
        isSubmitting={deleteMutation.isPending}
      />
      <ToastStack toasts={toasts} onDismiss={(id) => setToasts((prev) => prev.filter((t) => t.id !== id))} />
    </MasterDataPage>
  )
}
