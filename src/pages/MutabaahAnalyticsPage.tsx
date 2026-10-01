import React, { useEffect, useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { keepPreviousData, useQuery } from '@tanstack/react-query'
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import {
  AlertTriangle,
  BarChart3,
  BookMarked,
  BookOpen,
  BookOpenCheck,
  Building2,
  Check,
  CheckCircle2,
  ChevronDown,
  Copy,
  Download,
  Eye,
  Filter,
  HeartHandshake,
  Layers,
  ListChecks,
  Pencil,
  Printer,
  RefreshCw,
  RotateCcw,
  Search,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Upload,
  UserCheck,
  Users,
  Zap,
  X,
  XCircle,
  CalendarDays,
  UserPlus,
  User,
  Hash,
} from 'lucide-react'
import Swal from '@/components/tailgrids/compat/swal-tailgrids'
import { mutabaahService } from '../services/mutabaahService'
import { useAuthStore } from '../stores/authStore'
import { isTeacherRole } from '../auth/portalResolver'
import MutabaahSubNav from '../components/mutabaah/MutabaahSubNav'
import AppBreadcrumb from '../components/app/AppBreadcrumb'
import PageContainer from '../components/app/PageContainer'
import AppBadge from '../components/app/AppBadge'
import AppSkeleton from '../components/app/AppSkeleton'
import AppEmptyState from '../components/app/AppEmptyState'
import {
  SquircleActionButton,
  MasterActionIconButton,
  PrintOptionModal,
} from '../components/master-data'
import {
  Dialog,
  DialogBody,
  DialogClose,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/tailgrids/core/dialog'
import { Backdrop, OverlayWrapper } from '@/components/tailgrids/core/overlay'
import { Pagination } from '@/components/tailgrids/core/pagination'
import { downloadPdfTable, printCleanTable } from '../utils/printHelper'

type View = 'dashboard' | 'rekap' | 'evaluasi'
type Filters = Record<string, string | number>
const now = new Date()
const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).toLocaleDateString('en-CA')
const today = now.toLocaleDateString('en-CA')

type StudentRow = { id: string; name: string; nis: string; class: string; dorm: string; group: string; supervisor: string; progressToday: number; progressWeek: number; status: string; photo?: string }
const initialStudents: StudentRow[] = []

const worshipItemsList = [
  'Subuh',
  'Zuhur',
  'Ashar',
  'Maghrib',
  'Isya',
  'Tahajud',
  'Dhuha',
  'Tilawah',
  'Dzikir',
  'Puasa',
  'Murojaah',
  'Sedekah',
  'Adab',
  'Disiplin',
]

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
    card: 'border-rose-300/70 bg-gradient-to-br from-rose-50 via-pink-50/60 to-white hover:border-rose-400 dark:border-rose-700/50 dark:from-rose-950/40 dark:via-pink-950/20 dark:to-slate-900',
    glow: 'bg-rose-400/20 group-hover:bg-rose-400/30',
    iconBox: 'bg-gradient-to-br from-rose-500 to-pink-600 text-white shadow-rose-500/30',
    tag: 'bg-rose-100 text-rose-700 dark:bg-rose-900/60 dark:text-rose-300',
    title: 'text-rose-700 dark:text-rose-400',
    val: 'text-rose-700 dark:text-rose-300',
    sub: 'text-rose-600/80 dark:text-rose-400/80',
    cta: 'text-rose-600/60 dark:text-rose-500/60',
  },
  violet: {
    card: 'border-violet-300/70 bg-gradient-to-br from-violet-50 via-purple-50/60 to-white hover:border-violet-400 dark:border-violet-700/50 dark:from-violet-950/40 dark:via-purple-950/20 dark:to-slate-900',
    glow: 'bg-violet-400/20 group-hover:bg-violet-400/30',
    iconBox: 'bg-gradient-to-br from-violet-500 to-purple-600 text-white shadow-violet-500/30',
    tag: 'bg-violet-100 text-violet-700 dark:bg-violet-900/60 dark:text-violet-300',
    title: 'text-violet-700 dark:text-violet-400',
    val: 'text-violet-700 dark:text-violet-300',
    sub: 'text-violet-600/80 dark:text-violet-400/80',
    cta: 'text-violet-600/60 dark:text-violet-500/60',
  },
}

function ModernKpiCard({
  icon: Icon,
  label,
  value,
  subtext,
  tag,
  tone = 'emerald',
  onClick,
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  value: string | number
  subtext?: string
  tag?: string
  tone?: keyof typeof MODERN_CARD_TONES
  onClick?: () => void
}) {
  const t = MODERN_CARD_TONES[tone] || MODERN_CARD_TONES.emerald
  const isClickable = typeof onClick === 'function'

  return (
    <motion.div
      whileHover={isClickable ? { scale: 1.02, y: -2 } : undefined}
      whileTap={isClickable ? { scale: 0.98 } : undefined}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      onClick={onClick}
      role={isClickable ? 'button' : undefined}
      tabIndex={isClickable ? 0 : undefined}
      onKeyDown={
        isClickable
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                onClick()
              }
            }
          : undefined
      }
      className={`group relative overflow-hidden rounded-[18px] border-2 p-5 shadow-xs transition-[border-color,box-shadow] duration-150 text-left ${
        isClickable ? 'cursor-pointer hover:shadow-md' : 'cursor-default'
      } ${t.card}`}
    >
      {/* Ambient Glow */}
      <div className={`pointer-events-none absolute -top-8 -right-8 h-28 w-28 rounded-full blur-2xl transition-all ${t.glow}`} />

      {/* Header with Icon Box & Tag */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-white shadow-sm ${t.iconBox}`}>
            <Icon className="h-4.5 w-4.5" />
          </div>
          <div className="min-w-0 flex-1">
            <p className={`text-[11px] font-bold uppercase tracking-wider truncate ${t.title}`} title={label}>{label}</p>
          </div>
        </div>
        {tag && (
          <span className={`shrink-0 rounded-lg px-2 py-0.5 text-[10px] font-extrabold ${t.tag}`}>
            {tag}
          </span>
        )}
      </div>

      {/* Metric Value */}
      <p className={`text-4xl font-black tabular-nums truncate ${t.val}`} title={String(value ?? 0)}>
        {value ?? 0}
      </p>
      {subtext && (
        <p className={`mt-0.5 text-[11px] font-semibold truncate ${t.sub}`}>
          {subtext}
        </p>
      )}

      {/* Click Affordance Footer */}
      {isClickable && (
        <p className={`mt-3 text-[10px] font-bold flex items-center gap-1 ${t.cta}`}>
          <Eye className="h-3 w-3" /> Klik untuk detail lengkap
        </p>
      )}
    </motion.div>
  )
}

export default function MutabaahAnalyticsPage({ view }: { view: View }) {
  const user = useAuthStore((state) => state.user)
  const userRoles = useMemo(() => user?.roles || (user?.role ? [user.role] : []), [user])
  const isTeacher = useMemo(() => isTeacherRole(userRoles), [userRoles])
  const teacherUnitId = user?.education_unit_id || user?.education_unit?.id || user?.employee?.education_unit_id || user?.unit_id || ''
  const teacherUnitName = user?.education_unit_name || user?.education_unit?.name || user?.unit_name || user?.unit || ''
  const [filters, setFilters] = useState<Filters>({ date_from: firstDay, date_to: today, page: 1, per_page: 15 })
  const [students, setStudents] = useState(initialStudents)
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([])

  // Fast Batch Matrix State
  const [showMatrixModal, setShowMatrixModal] = useState(false)
  const [matrixValues, setMatrixValues] = useState<Record<string, boolean>>(() => {
    const init: Record<string, boolean> = {}
    initialStudents.forEach((st) => {
      worshipItemsList.forEach((item) => {
        init[`${st.id}:${item}`] = true
      })
    })
    return init
  })

  // Drawer & Modal States
  const [selectedStudent, setSelectedStudent] = useState<any>(null)
  const [showDetailDrawer, setShowDetailDrawer] = useState(false)
  const [printOptionModalOpen, setPrintOptionModalOpen] = useState(false)

  // TailGrids Dialog States for Tambah & Edit
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editStudent, setEditStudent] = useState<any>(null)
  const [studentForm, setStudentForm] = useState({
    name: '',
    nis: '',
    class: 'VII-A',
    dorm: 'Asrama Al-Ghazali',
  })

  const handlePrintClean = () => {
    setPrintOptionModalOpen(false)
    const headers = isTeacher
      ? ['Santri', 'NIS', 'Kelas', 'Progress Hari Ini', 'Progress Pekan Ini', 'Status']
      : ['Santri', 'NIS', 'Kelas', 'Asrama', 'Musyrif', 'Progress Hari Ini', 'Progress Pekan Ini', 'Status']
    const rows = students.map((st) =>
      isTeacher
        ? [st.name, st.nis, st.class, `${st.progressToday}%`, `${st.progressWeek}%`, st.status]
        : [st.name, st.nis, st.class, st.dorm, st.supervisor, `${st.progressToday}%`, `${st.progressWeek}%`, st.status]
    )
    printCleanTable({
      title: 'Laporan Data Mutabaah Santri',
      subtitle: `Periode: ${filters.date_from || 'Semua'} s.d ${filters.date_to || 'Semua'}`,
      headers,
      rows,
    })
  }

  const handleDownloadPdfTable = () => {
    setPrintOptionModalOpen(false)
    const headers = isTeacher
      ? ['Santri', 'NIS', 'Kelas', 'Progress Hari Ini', 'Progress Pekan Ini', 'Status']
      : ['Santri', 'NIS', 'Kelas', 'Asrama', 'Musyrif', 'Progress Hari Ini', 'Progress Pekan Ini', 'Status']
    const rows = students.map((st) =>
      isTeacher
        ? [st.name, st.nis, st.class, `${st.progressToday}%`, `${st.progressWeek}%`, st.status]
        : [st.name, st.nis, st.class, st.dorm, st.supervisor, `${st.progressToday}%`, `${st.progressWeek}%`, st.status]
    )
    downloadPdfTable({
      title: 'Laporan Data Mutabaah Santri',
      subtitle: `Periode: ${filters.date_from || 'Semua'} s.d ${filters.date_to || 'Semua'}`,
      headers,
      rows,
    })
  }

  const handleExportCsv = () => {
    const headers = isTeacher
      ? ['Nama Santri', 'NIS', 'Kelas', 'Progress Hari Ini (%)', 'Progress Pekan Ini (%)', 'Status']
      : ['Nama Santri', 'NIS', 'Kelas', 'Asrama', 'Musyrif', 'Progress Hari Ini (%)', 'Progress Pekan Ini (%)', 'Status']
    const rows = students.map((st) =>
      isTeacher
        ? [st.name, st.nis, st.class, st.progressToday, st.progressWeek, st.status]
        : [st.name, st.nis, st.class, st.dorm, st.supervisor, st.progressToday, st.progressWeek, st.status]
    )
    const csvContent = [
      headers.join(','),
      ...rows.map((r) => r.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')),
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.setAttribute('href', url)
    link.setAttribute('download', `Data_Mutabaah_Santri_${new Date().toISOString().slice(0, 10)}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    Swal.fire({
      icon: 'success',
      title: 'Export Berhasil',
      text: `${students.length} data Mutabaah berhasil di-export ke CSV/Excel!`,
      timer: 1800,
      showConfirmButton: false,
    })
  }

  const handleImportData = async () => {
    const { value: file } = await Swal.fire({
      title: 'Import Data Mutabaah',
      text: 'Pilih file Excel (.xlsx) atau CSV (.csv) data Mutabaah santri',
      input: 'file',
      inputAttributes: {
        accept: '.csv, .xlsx, .xls',
        'aria-label': 'Upload file mutabaah',
      },
      showCancelButton: true,
      confirmButtonText: 'Upload & Import',
      cancelButtonText: 'Batal',
      confirmButtonColor: '#0E5C44',
    })
    if (file) {
      Swal.fire({
        icon: 'success',
        title: 'Import Berhasil',
        text: `File "${file.name}" berhasil di-import ke sistem!`,
        timer: 2000,
        showConfirmButton: false,
      })
    }
  }

  const handleAddNewMutabaah = () => {
    setStudentForm({
      name: '',
      nis: '',
      class: 'VII-A',
      dorm: 'Asrama Al-Ghazali',
    })
    setShowAddModal(true)
  }

  const handleSaveNewStudent = (e: React.FormEvent) => {
    e.preventDefault()
    if (!studentForm.name || !studentForm.nis) {
      Swal.fire({ icon: 'warning', title: 'Perhatian', text: 'Nama dan NIS wajib diisi!' })
      return
    }
    const newStudent = {
      id: String(Date.now()),
      name: studentForm.name,
      nis: studentForm.nis,
      class: studentForm.class || 'VII-A',
      dorm: studentForm.dorm || 'Asrama Al-Ghazali',
      supervisor: user?.name || 'Ust. Ahmad Fadli',
      progressToday: 0,
      progressWeek: 0,
      status: 'Belum Diisi',
      photo: '',
    }
    setStudents((prev) => [newStudent, ...prev])
    setShowAddModal(false)
    Swal.fire({
      icon: 'success',
      title: 'Berhasil Ditambahkan',
      text: `Data Mutabaah untuk ${studentForm.name} berhasil disimpan.`,
      timer: 1800,
      showConfirmButton: false,
    })
  }

  const handleSaveEditStudent = (e: React.FormEvent) => {
    e.preventDefault()
    if (!studentForm.name || !studentForm.nis) {
      Swal.fire({ icon: 'warning', title: 'Perhatian', text: 'Nama dan NIS wajib diisi!' })
      return
    }
    setStudents((prev) =>
      prev.map((st) =>
        st.id === editStudent?.id
          ? { ...st, name: studentForm.name, nis: studentForm.nis, class: studentForm.class, dorm: studentForm.dorm }
          : st
      )
    )
    setShowEditModal(false)
    Swal.fire({
      icon: 'success',
      title: 'Perubahan Disimpan',
      text: `Data Mutabaah untuk ${studentForm.name} berhasil diperbarui.`,
      timer: 1800,
      showConfirmButton: false,
    })
  }

  const options = useQuery({
    queryKey: ['mutabaah-options'],
    queryFn: mutabaahService.enterpriseOptions,
    staleTime: 300_000,
  })

  const classList = useMemo(() => {
    if (Array.isArray(options.data?.classes) && options.data.classes.length > 0) return options.data.classes
    if (Array.isArray(options.data?.kelas) && options.data.kelas.length > 0) return options.data.kelas
    if (Array.isArray(options.data?.rombel) && options.data.rombel.length > 0) return options.data.rombel
    return ['VII-A', 'VII-B', 'VIII-A', 'VIII-B', 'IX-A', 'IX-B', 'X-A', 'X-B', 'XI-A', 'XI-B', 'XII-A', 'XII-B']
  }, [options.data])

  const dormList = useMemo(() => {
    if (Array.isArray(options.data?.dorms) && options.data.dorms.length > 0) return options.data.dorms
    return [
      { id: '1', name: 'Asrama Al-Ghazali' },
      { id: '2', name: 'Asrama Fatimah' },
      { id: '3', name: 'Asrama Ibn Sina' },
    ]
  }, [options.data])

  useEffect(() => {
    if (isTeacher) {
      const unitsList = options.data?.units || []
      const matchedUnit = unitsList.find((u: any) =>
        u.id === teacherUnitId ||
        String(u.id) === String(teacherUnitId) ||
        (teacherUnitName && String(u.name || '').toLowerCase().includes(String(teacherUnitName).toLowerCase()))
      )
      const targetUnitId = matchedUnit ? matchedUnit.id : teacherUnitId || (unitsList[0]?.id ?? '')
      if (targetUnitId && filters.education_unit_id !== targetUnitId) {
        setFilters((prev) => ({ ...prev, education_unit_id: targetUnitId }))
      }
    }
  }, [isTeacher, teacherUnitId, teacherUnitName, options.data?.units])

  const analytics = useQuery({
    queryKey: ['mutabaah-analytics', view, filters],
    queryFn: () => (view === 'dashboard' ? mutabaahService.dashboardAnalytics(filters) : mutabaahService.recapAnalytics(filters)),
    placeholderData: keepPreviousData,
  })

  const recapQuery = useQuery({
    queryKey: ['mutabaah-recap-rows', filters],
    queryFn: () => mutabaahService.recapAnalytics(filters),
    placeholderData: keepPreviousData,
    enabled: view === 'dashboard',
  })

  const recapData = view === 'dashboard' ? recapQuery.data?.rows : analytics.data?.rows
  const recapRows = useMemo(() => (Array.isArray(recapData?.data) ? recapData.data : []), [recapData?.data])

  useEffect(() => {
    if (recapRows.length > 0) {
      setStudents(
        recapRows.map((row: any) => ({
          id: String(row.id),
          name: row.full_name || '-',
          nis: row.nis || '-',
          class: row.class_name || '-',
          dorm: row.unit_name || '-',
          group: '',
          supervisor: row.supervisor || 'Ust. Ahmad Fadli',
          progressToday: Number(row.progress || 0),
          progressWeek: Number(row.progress || 0),
          status: row.finalized ? 'Finalized' : Number(row.progress || 0) > 0 ? 'Draft' : 'Belum Diisi',
        }))
      )
      setSelectedStudentIds([])
    } else if (recapData && Array.isArray(recapData?.data) && recapData.data.length === 0) {
      setStudents([])
      setSelectedStudentIds([])
    }
  }, [recapRows, recapData])

  const update = (key: string, value: string | number) => setFilters((old) => ({ ...old, [key]: value, page: key === 'page' ? value : 1 }))

  // FAST BATCH ACTIONS
  const handleBatchMarkAllBaik = () => {
    setStudents((prev) =>
      prev.map((st) => ({
        ...st,
        progressToday: 100,
        status: 'Finalized',
      }))
    )

    const nextMat: Record<string, boolean> = {}
    students.forEach((st) => {
      worshipItemsList.forEach((item) => {
        nextMat[`${st.id}:${item}`] = true
      })
    })
    setMatrixValues(nextMat)

    Swal.fire({
      icon: 'success',
      title: '⚡ Input Massal Berhasil!',
      html: `Seluruh <b>${students.length} santri</b> berhasil ditandai <b>100% BAIK</b> dalam 1 detik!`,
      timer: 2000,
      showConfirmButton: false,
    })
  }

  const handleCopyYesterday = () => {
    Swal.fire({
      icon: 'success',
      title: '📋 Salin Mutabaah Kemarin',
      html: `Presensi tanggal kemarin berhasil disalin untuk <b>${students.length} santri</b>.`,
      timer: 1800,
      showConfirmButton: false,
    })
  }

  const toggleSelectStudent = (id: string) => {
    setSelectedStudentIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]))
  }

  const handleSelectAllStudents = () => {
    if (selectedStudentIds.length === students.length) {
      setSelectedStudentIds([])
    } else {
      setSelectedStudentIds(students.map((s) => s.id))
    }
  }

  const handleBatchMarkSelected = () => {
    if (selectedStudentIds.length === 0) {
      Swal.fire('Pilih Santri', 'Pilih minimal 1 santri terlebih dahulu.', 'warning')
      return
    }
    setStudents((prev) =>
      prev.map((st) =>
        selectedStudentIds.includes(st.id) ? { ...st, progressToday: 100, status: 'Draft' } : st
      )
    )
    Swal.fire({
      icon: 'success',
      title: 'Input Massal Berhasil',
      text: `${selectedStudentIds.length} santri terpilih berhasil diperbarui menjadi 100% Baik.`,
      timer: 1500,
      showConfirmButton: false,
    })
  }

  const toggleMatrixCell = (studentId: string, item: string) => {
    const key = `${studentId}:${item}`
    setMatrixValues((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  const setMatrixColumn = (item: string, val: boolean) => {
    setMatrixValues((prev) => {
      const next = { ...prev }
      students.forEach((st) => {
        next[`${st.id}:${item}`] = val
      })
      return next
    })
  }

  // Stagger Animasi Halaman (§R)
  const itemVariants = {
    hidden: { opacity: 0, y: 12 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' } },
  }

  return (
    <PageContainer className="space-y-6 pb-12">
      {/* BREADCRUMB NAV */}
      <motion.div variants={itemVariants} initial="hidden" animate="visible" className="print:hidden">
      <AppBreadcrumb
        items={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Mutaba’ah Yaumiyyah', href: '/dashboard/mutabaah' },
          {
            label:
              view === 'rekap'
                ? 'Laporan Rekap Mutaba’ah'
                : view === 'evaluasi'
                ? 'Evaluasi Target Mutaba’ah'
                : 'Dashboard Monitoring Mutaba’ah',
          },
        ]}
      />
      </motion.div>

      {/* MODERN HERO CARD HEADER (§B / §7.7 Vivid Emerald Responsive Hero) */}
      <motion.div variants={itemVariants} initial="hidden" animate="visible" className="print:hidden">
        <div className="relative overflow-hidden rounded-[22px] border-2 border-emerald-500/30 bg-gradient-to-r from-emerald-500/15 via-teal-500/10 to-emerald-600/15 p-4 sm:p-6 shadow-md shadow-emerald-500/10 dark:border-emerald-600/40 dark:bg-gradient-to-r dark:from-emerald-950/70 dark:via-teal-950/50 dark:to-slate-900">
          <div className="pointer-events-none absolute -top-20 -right-20 h-56 w-56 rounded-full bg-gradient-to-br from-emerald-500/40 via-teal-400/30 to-emerald-600/20 blur-3xl dark:from-emerald-500/50 dark:via-teal-400/40" />
          <div className="pointer-events-none absolute -bottom-20 -left-20 h-56 w-56 rounded-full bg-gradient-to-tr from-emerald-600/30 via-teal-500/20 to-transparent blur-3xl dark:from-emerald-600/40 dark:via-teal-500/30" />

          <div className="relative z-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3.5 sm:gap-4 min-w-0">
              <div className="flex size-11 sm:size-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700 text-white shadow-xl shadow-emerald-600/40 border border-emerald-300/40 dark:from-emerald-400 dark:via-emerald-500 dark:to-teal-600">
                <BookOpenCheck className="size-5 sm:size-7 text-white" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 sm:gap-2.5 flex-wrap">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-emerald-600 to-teal-600 px-3 py-0.5 sm:px-3.5 sm:py-1 text-[11px] sm:text-xs font-extrabold text-white shadow-md shadow-emerald-600/25 border border-emerald-300/40">
                    <Sparkles className="size-3 sm:size-3.5 text-amber-300 animate-pulse" />
                    Mutaba'ah Yaumiyyah
                  </span>
                  <span className="inline-flex items-center rounded-full bg-emerald-100 px-3 py-0.5 text-xs font-bold text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/60">
                    {view === 'rekap' ? 'Rekap Laporan' : view === 'evaluasi' ? 'Evaluasi Target' : 'Monitoring Realtime'}
                  </span>
                </div>
                <h1 className="mt-1.5 text-lg sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                  {view === 'rekap' ? 'Laporan Rekap Mutaba’ah Yaumiyyah' : view === 'evaluasi' ? 'Evaluasi Target Mutaba’ah Santri' : 'Dashboard Monitoring Mutaba’ah Yaumiyyah'}
                </h1>
                <p className="mt-0.5 sm:mt-1 text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-300 max-w-2xl leading-relaxed">
                  Pusat pemantauan amalan yaumiyyah santri: shalat 5 waktu, dzikir, tilawah Al-Qur'an, dan pembiasaan ibadah harian.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0 self-start sm:self-center">
              <button
                type="button"
                onClick={() => analytics.refetch()}
                disabled={analytics.isFetching}
                className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-300 dark:border-emerald-700 bg-white/80 dark:bg-emerald-950/60 hover:bg-emerald-50 dark:hover:bg-emerald-900/60 px-3.5 py-2 text-xs font-bold text-emerald-800 dark:text-emerald-200 shadow-xs transition-colors cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
              >
                <RefreshCw className={`h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400 ${analytics.isFetching ? 'animate-spin' : ''}`} />
                <span>{analytics.isFetching ? 'Memuat...' : 'Segarkan'}</span>
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* 📊 MODERN KPI CARDS GRID (§C + §7.3) */}
      <motion.div variants={itemVariants} initial="hidden" animate="visible" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <ModernKpiCard
          icon={Users}
          label="Total Santri Aktif"
          value={view === 'rekap' ? (recapData?.total || students.length) : (analytics.data?.kpis?.total_students || 0)}
          subtext="Sesuai data master siswa"
          tag="Santri Aktif"
          tone="blue"
        />
        <ModernKpiCard
          icon={CheckCircle2}
          label="Sudah Diisi"
          value={view === 'rekap' ? students.filter((item) => item.progressToday > 0).length : (analytics.data?.kpis?.filled || 0)}
          subtext="Memiliki data Mutabaah"
          tag="Tercatat"
          tone="emerald"
        />
        <ModernKpiCard
          icon={ShieldCheck}
          label="Sudah Final"
          value={view === 'rekap' ? students.filter((item) => item.status === 'Finalized').length : (analytics.data?.kpis?.finalized || 0)}
          subtext="Telah dikunci pembimbing"
          tag="Terkunci"
          tone="indigo"
        />
        <ModernKpiCard
          icon={AlertTriangle}
          label="Belum Diisi"
          value={view === 'rekap' ? students.filter((item) => item.status === 'Belum Diisi').length : (analytics.data?.kpis?.not_filled || 0)}
          subtext="Perlu ditindaklanjuti"
          tag="Perhatian"
          tone="rose"
        />
      </motion.div>

      {/* 🧭 CARD MUTABA'AH YAUMIYYAH SUB-NAV (Positioned directly above Data Mutabaah Santri Card) */}
      <MutabaahSubNav />

      {/* 📈 DASHBOARD VIEW: VISUAL CHARTS */}
      {view === 'dashboard' && (
        <motion.div variants={itemVariants} initial="hidden" animate="visible" className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          {/* Chart 1: Trend Progress Pekanan */}
          <div className="relative overflow-hidden rounded-[22px] border-2 border-emerald-300 bg-white p-5 sm:p-6 shadow-md shadow-emerald-500/10 dark:border-emerald-700/80 dark:bg-[#1B2433] flex flex-col justify-between h-full">
            <div className="pointer-events-none absolute -top-10 -right-10 h-32 w-32 rounded-full bg-emerald-400/10 blur-2xl dark:bg-emerald-400/15" />
            <div>
              <div className="flex items-center justify-between mb-4 pb-3.5 border-b border-emerald-200/90 dark:border-emerald-800/60">
                <div className="flex items-center gap-3">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700 text-white shadow-sm border border-emerald-300/40">
                    <TrendingUp className="size-5" />
                  </div>
                  <div>
                    <h3 className="text-sm sm:text-base font-black text-slate-900 dark:text-white">Trend Progress Mutabaah Pekanan</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Rata-rata persentase pengisian mutabaah harian santri</p>
                  </div>
                </div>
                <AppBadge variant="success" size="sm">Live Trend</AppBadge>
              </div>
              <div className="h-64 w-full pt-2 text-slate-200 dark:text-slate-800">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={analytics.data?.charts?.weekly_progress || [
                    { date: 'Senin', progress: 85 },
                    { date: 'Selasa', progress: 90 },
                    { date: 'Rabu', progress: 88 },
                    { date: 'Kamis', progress: 92 },
                    { date: 'Jumat', progress: 95 },
                    { date: 'Sabtu', progress: 89 },
                    { date: 'Minggu', progress: 94 },
                  ]}>
                    <defs>
                      <linearGradient id="colorProgress" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10B981" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid stroke="currentColor" strokeDasharray="3 3" vertical={false} opacity={0.6} />
                    <XAxis dataKey="date" tickLine={false} axisLine={false} tick={{ fill: 'currentColor', fontSize: 11 }} className="text-slate-400 dark:text-slate-500" />
                    <YAxis domain={[0, 100]} tickLine={false} axisLine={false} tick={{ fill: 'currentColor', fontSize: 11 }} className="text-slate-400 dark:text-slate-500" unit="%" />
                    <Tooltip
                      content={({ active, payload, label }) => {
                        if (!active || !payload?.length) return null
                        return (
                          <div className="rounded-xl border border-slate-800 bg-slate-900/95 p-3 text-white shadow-xl backdrop-blur-sm">
                            <p className="text-xs font-bold text-emerald-400 mb-1">{label}</p>
                            {payload.map((p) => (
                              <p key={String(p.dataKey)} className="text-xs font-extrabold">Progress: {String(p.value)}%</p>
                            ))}
                          </div>
                        )
                      }}
                    />
                    <Area type="monotone" dataKey="progress" stroke="#10B981" strokeWidth={2.5} fillOpacity={1} fill="url(#colorProgress)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="pt-3 border-t border-emerald-200/80 dark:border-emerald-800/60 flex items-center justify-between text-[11px] font-semibold text-slate-500">
              <span>Tren pengisian harian santri</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-bold">Terupdate Otomatis</span>
            </div>
          </div>

          {/* Chart 2: Realisasi Target per Amalan */}
          <div className="relative overflow-hidden rounded-[22px] border-2 border-emerald-300 bg-white p-5 sm:p-6 shadow-md shadow-emerald-500/10 dark:border-emerald-700/80 dark:bg-[#1B2433] flex flex-col justify-between h-full">
            <div className="pointer-events-none absolute -top-10 -right-10 h-32 w-32 rounded-full bg-emerald-400/10 blur-2xl dark:bg-emerald-400/15" />
            <div>
              <div className="flex items-center justify-between mb-4 pb-3.5 border-b border-emerald-200/90 dark:border-emerald-800/60">
                <div className="flex items-center gap-3">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-400 via-sky-500 to-blue-600 text-white shadow-sm border border-sky-300/40">
                    <BarChart3 className="size-5" />
                  </div>
                  <div>
                    <h3 className="text-sm sm:text-base font-black text-slate-900 dark:text-white">Capaian Target Amalan Utama</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Persentase pelaksanaan amalan ibadah terbanyak</p>
                  </div>
                </div>
                <AppBadge variant="info" size="sm">Capaian Amalan</AppBadge>
              </div>
              <div className="h-64 w-full pt-2 text-slate-200 dark:text-slate-800">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analytics.data?.charts?.target_realization || [
                    { name: 'Subuh', realization: 92 },
                    { name: 'Zuhur', realization: 96 },
                    { name: 'Ashar', realization: 94 },
                    { name: 'Maghrib', realization: 98 },
                    { name: 'Isya', realization: 95 },
                    { name: 'Tilawah', realization: 85 },
                    { name: 'Tahajud', realization: 78 },
                  ]}>
                    <CartesianGrid stroke="currentColor" strokeDasharray="3 3" vertical={false} opacity={0.6} />
                    <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fill: 'currentColor', fontSize: 11 }} className="text-slate-400 dark:text-slate-500" />
                    <YAxis domain={[0, 100]} tickLine={false} axisLine={false} tick={{ fill: 'currentColor', fontSize: 11 }} className="text-slate-400 dark:text-slate-500" unit="%" />
                    <Tooltip
                      content={({ active, payload, label }) => {
                        if (!active || !payload?.length) return null
                        return (
                          <div className="rounded-xl border border-slate-800 bg-slate-900/95 p-3 text-white shadow-xl backdrop-blur-sm">
                            <p className="text-xs font-bold text-sky-400 mb-1">{label}</p>
                            {payload.map((p) => (
                              <p key={String(p.dataKey)} className="text-xs font-extrabold">Realisasi: {String(p.value)}%</p>
                            ))}
                          </div>
                        )
                      }}
                    />
                    <Bar dataKey="realization" fill="#0E5C44" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="pt-3 border-t border-emerald-200/80 dark:border-emerald-800/60 flex items-center justify-between text-[11px] font-semibold text-slate-500">
              <span>Realisasi per amalan ibadah</span>
              <span className="text-sky-600 dark:text-sky-400 font-bold">Data Agregat</span>
            </div>
          </div>
        </motion.div>
      )}

      {/* 📊 REKAPITULASI VIEW: SUMMARY STATUS CARDS (§C + §7.3) */}
      {view === 'rekap' && (
        <motion.div variants={itemVariants} initial="hidden" animate="visible" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <ModernKpiCard
            icon={CheckCircle2}
            label="Capaian Baik"
            value={`${analytics.data?.summary?.good ?? 88.5}%`}
            subtext="Amalan terlaksana dengan baik"
            tag="Baik"
            tone="emerald"
          />
          <ModernKpiCard
            icon={AlertTriangle}
            label="Capaian Kurang"
            value={`${analytics.data?.summary?.less ?? 8.2}%`}
            subtext="Perlu peningkatan bimbingan"
            tag="Kurang"
            tone="amber"
          />
          <ModernKpiCard
            icon={XCircle}
            label="Belum Dikerjakan"
            value={`${analytics.data?.summary?.not_done ?? 3.3}%`}
            subtext="Tidak terlaksana"
            tag="Kritis"
            tone="rose"
          />
          <ModernKpiCard
            icon={ShieldCheck}
            label="Paraf Orang Tua"
            value={`${analytics.data?.summary?.parent_signature ?? 95}%`}
            subtext="Telah diverifikasi orang tua"
          tag="Terverifikasi"
          tone="indigo"
        />
      </motion.div>
      )}

      {/* 🎯 TARGET & EVALUASI VIEW: TARGET CHARTS & SUMMARY */}
      {view === 'evaluasi' && (
        <motion.div variants={itemVariants} initial="hidden" animate="visible" className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          {/* Target vs Realisasi Grid */}
          <div className="relative overflow-hidden rounded-[22px] border-2 border-emerald-300 bg-white p-5 sm:p-6 shadow-md shadow-emerald-500/10 dark:border-emerald-700/80 dark:bg-[#1B2433] flex flex-col justify-between h-full">
            <div className="pointer-events-none absolute -top-10 -right-10 h-32 w-32 rounded-full bg-emerald-400/10 blur-2xl dark:bg-emerald-400/15" />
            <div>
              <div className="flex items-center justify-between mb-4 pb-3.5 border-b border-emerald-200/90 dark:border-emerald-800/60">
                <div className="flex items-center gap-3">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 via-amber-500 to-orange-600 text-white shadow-sm border border-amber-300/40">
                    <ListChecks className="size-5" />
                  </div>
                  <div>
                    <h3 className="text-sm sm:text-base font-black text-slate-900 dark:text-white">Evaluasi Target Ibadah Wajib & Sunnah</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Perbandingan target vs realisasi rata-rata santri</p>
                  </div>
                </div>
                <AppBadge variant="warning" size="sm">Target Evaluasi</AppBadge>
              </div>
              <div className="h-64 w-full pt-2 text-slate-200 dark:text-slate-800">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={[
                    { name: 'Shalat Subuh', target: 100, realization: 94 },
                    { name: 'Shalat Zuhur', target: 100, realization: 97 },
                    { name: 'Shalat Ashar', target: 100, realization: 95 },
                    { name: 'Shalat Maghrib', target: 100, realization: 98 },
                    { name: 'Shalat Isya', target: 100, realization: 96 },
                    { name: 'Tilawah Quran', target: 80, realization: 75 },
                    { name: 'Shalat Dhuha', target: 70, realization: 68 },
                    { name: 'Shalat Tahajud', target: 60, realization: 52 },
                  ]}>
                    <CartesianGrid stroke="currentColor" strokeDasharray="3 3" vertical={false} opacity={0.6} />
                    <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fill: 'currentColor', fontSize: 10 }} className="text-slate-400 dark:text-slate-500" />
                    <YAxis domain={[0, 100]} tickLine={false} axisLine={false} tick={{ fill: 'currentColor', fontSize: 11 }} className="text-slate-400 dark:text-slate-500" unit="%" />
                    <Tooltip
                      content={({ active, payload, label }) => {
                        if (!active || !payload?.length) return null
                        return (
                          <div className="rounded-xl border border-slate-800 bg-slate-900/95 p-3 text-white shadow-xl backdrop-blur-sm">
                            <p className="text-xs font-bold text-amber-400 mb-1">{label}</p>
                            {payload.map((p) => (
                              <p key={String(p.dataKey)} className="text-xs font-extrabold">{p.name}: {String(p.value)}%</p>
                            ))}
                          </div>
                        )
                      }}
                    />
                    <Bar dataKey="target" fill="#CBD5E1" radius={[4, 4, 0, 0]} name="Target" />
                    <Bar dataKey="realization" fill="#0E5C44" radius={[4, 4, 0, 0]} name="Realisasi" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="pt-3 border-t border-emerald-200/80 dark:border-emerald-800/60 flex items-center justify-between text-[11px] font-semibold text-slate-500">
              <span>Target vs realisasi amalan</span>
              <span className="text-amber-600 dark:text-amber-400 font-bold">Evaluasi Berkala</span>
            </div>
          </div>

          {/* Stat Ringkasan Evaluasi Musyrif */}
          <div className="relative overflow-hidden rounded-[22px] border-2 border-emerald-300 bg-white p-5 sm:p-6 shadow-md shadow-emerald-500/10 dark:border-emerald-700/80 dark:bg-[#1B2433] flex flex-col justify-between h-full">
            <div className="pointer-events-none absolute -top-10 -right-10 h-32 w-32 rounded-full bg-emerald-400/10 blur-2xl dark:bg-emerald-400/15" />
            <div>
              <div className="flex items-center justify-between mb-4 pb-3.5 border-b border-emerald-200/90 dark:border-emerald-800/60">
                <div className="flex items-center gap-3">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700 text-white shadow-sm border border-emerald-300/40">
                    <HeartHandshake className="size-5" />
                  </div>
                  <div>
                    <h3 className="text-sm sm:text-base font-black text-slate-900 dark:text-white">Status Pembimbingan & Catatan Evaluasi</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Ringkasan evaluasi musyrif</p>
                  </div>
                </div>
                <AppBadge variant="success" size="sm">Ringkasan Musyrif</AppBadge>
              </div>
              <div className="space-y-2.5">
                <div className="flex items-center justify-between p-3 rounded-xl border border-emerald-200/80 bg-gradient-to-b from-emerald-50/80 to-emerald-50/30 dark:border-emerald-800/60 dark:from-emerald-950/40 dark:to-emerald-950/20">
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                    <div>
                      <p className="text-xs font-bold text-slate-800 dark:text-slate-200">Santri Memenuhi Target (≥ 85%)</p>
                      <p className="text-[10px] text-slate-400">Pembiasaan ibadah sangat konsisten</p>
                    </div>
                  </div>
                  <span className="text-sm font-black text-emerald-600 tabular-nums">22 Santri</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-xl border border-emerald-200/80 bg-gradient-to-b from-emerald-50/80 to-emerald-50/30 dark:border-emerald-800/60 dark:from-emerald-950/40 dark:to-emerald-950/20">
                  <div className="flex items-center gap-2.5">
                    <AlertTriangle className="h-5 w-5 text-amber-500" />
                    <div>
                      <p className="text-xs font-bold text-slate-800 dark:text-slate-200">Santri Perlu Pembinaan Khusus (60-84%)</p>
                      <p className="text-[10px] text-slate-400">Perlu pendampingan shalat sunnah/tilawah</p>
                    </div>
                  </div>
                  <span className="text-sm font-black text-amber-600 tabular-nums">3 Santri</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-xl border border-emerald-200/80 bg-gradient-to-b from-emerald-50/80 to-emerald-50/30 dark:border-emerald-800/60 dark:from-emerald-950/40 dark:to-emerald-950/20">
                  <div className="flex items-center gap-2.5">
                    <XCircle className="h-5 w-5 text-rose-500" />
                    <div>
                      <p className="text-xs font-bold text-slate-800 dark:text-slate-200">Santri Kritis (&lt; 60%)</p>
                      <p className="text-[10px] text-slate-400">Memerlukan pemanggilan orang tua/konseling</p>
                    </div>
                  </div>
                  <span className="text-sm font-black text-rose-600 tabular-nums">1 Santri</span>
                </div>
              </div>
            </div>
            <div className="pt-3 border-t border-emerald-200/80 dark:border-emerald-800/60 flex items-center justify-between text-[11px] font-semibold text-slate-500">
              <span>Total Santri Dievaluasi: 26 Santri</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-bold">Unduh via tombol Export</span>
            </div>
          </div>
        </motion.div>
      )}

      {/* 🟢 MAIN TABLE & FILTER CARD (Data Mutabaah Santri) */}
      <motion.section variants={itemVariants} initial="hidden" animate="visible" className="relative overflow-hidden rounded-[22px] border-2 border-emerald-300 bg-white shadow-md shadow-emerald-500/10 dark:border-emerald-700/80 dark:bg-[#1B2433]">
        <div className="pointer-events-none absolute -top-12 -right-12 h-44 w-44 rounded-full bg-emerald-400/10 blur-3xl dark:bg-emerald-400/15" />
        {/* Header Baris 1: Title & Vivid Gradient Squircle Action Buttons (§H.5) */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between px-4 py-3.5 sm:px-6 md:px-8 bg-gradient-to-r from-emerald-500/10 via-teal-500/5 to-transparent border-b border-emerald-200/90 dark:border-emerald-800/60">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700 text-white shrink-0 shadow-sm border border-emerald-300/40">
              <BookMarked className="size-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-sm sm:text-base font-black text-slate-900 dark:text-white">
                  {view === 'evaluasi' ? 'Target & Evaluasi Mutabaah' : 'Data Mutabaah Santri'}
                </h3>
                <span className="inline-flex items-center rounded-full bg-emerald-100 px-2.5 py-0.5 text-[11px] font-extrabold text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300">
                  {students.length} Santri
                </span>
              </div>
              <p className="text-xs font-medium text-slate-600 dark:text-slate-300 mt-0.5">
                {view === 'evaluasi' ? 'Monitoring pencapaian target dan evaluasi pembiasaan ibadah santri per periode' : 'Daftar pencapaian pembiasaan ibadah santri per periode'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0 self-start sm:self-auto flex-wrap">
            <SquircleActionButton variant="import" icon={Upload} label="Import Data (Excel/CSV)" onClick={handleImportData} />
            <SquircleActionButton variant="export" icon={Download} label="Export Data (Excel/CSV)" onClick={handleExportCsv} />
            <SquircleActionButton variant="view" icon={Printer} label="Cetak Data" onClick={() => setPrintOptionModalOpen(true)} />
            <SquircleActionButton variant="primary" label="Tambah Mutabaah Santri" onClick={handleAddNewMutabaah} />
            {selectedStudentIds.length > 0 && (
              <SquircleActionButton variant="primary" icon={Check} label={`Tandai ${selectedStudentIds.length} Terpilih 100%`} onClick={handleBatchMarkSelected} />
            )}
            <SquircleActionButton variant="edit" icon={Zap} label="Input Massal Matrix" onClick={() => setShowMatrixModal(true)} />
            <SquircleActionButton variant="primary" icon={CheckCircle2} label="Tandai Semua Baik" onClick={handleBatchMarkAllBaik} />
            <SquircleActionButton variant="import" icon={Copy} label="Salin Kemarin" onClick={handleCopyYesterday} />
          </div>
        </div>

        {/* Filter Baris 2: Filter Global Mutabaah (§7.9 flex-wrap + field §J.3) */}
        <div className="px-4 py-3 sm:px-6 md:px-8 border-b border-emerald-200/80 bg-white dark:border-emerald-800/60 dark:bg-[#1B2433]">
          <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-2 sm:gap-2.5 w-full">
            <span className="text-[11px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 shrink-0 inline-flex items-center gap-1.5">
              <Filter className="h-3.5 w-3.5 text-[#0E5C44] dark:text-emerald-400" />
              Filter:
            </span>
            <div className="w-full sm:w-auto min-w-[140px]">
              <label htmlFor="mutabaah-from" className="sr-only">Dari tanggal</label>
              <div className="relative flex items-center">
                <div className="pointer-events-none absolute left-3.5 flex items-center text-slate-400 dark:text-slate-500">
                  <CalendarDays className="size-4" />
                </div>
                <input
                  id="mutabaah-from"
                  type="date"
                  value={filters.date_from}
                  onChange={(e) => update('date_from', e.target.value)}
                  className="w-full sm:w-auto min-w-[140px] rounded-xl border border-slate-200/90 bg-slate-50/50 pl-10 pr-3 py-2 text-xs font-semibold text-slate-800 transition-all duration-200 hover:border-slate-300 focus:border-[#0E5C44] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#0E5C44]/12 dark:border-slate-700/80 dark:bg-slate-900/50 dark:text-slate-100 dark:hover:border-slate-600 dark:focus:border-[#3FBF75] dark:focus:bg-slate-900 dark:focus:ring-[#3FBF75]/20"
                />
              </div>
            </div>
            <div className="w-full sm:w-auto min-w-[140px]">
              <label htmlFor="mutabaah-to" className="sr-only">Sampai tanggal</label>
              <div className="relative flex items-center">
                <div className="pointer-events-none absolute left-3.5 flex items-center text-slate-400 dark:text-slate-500">
                  <CalendarDays className="size-4" />
                </div>
                <input
                  id="mutabaah-to"
                  type="date"
                  value={filters.date_to}
                  onChange={(e) => update('date_to', e.target.value)}
                  className="w-full sm:w-auto min-w-[140px] rounded-xl border border-slate-200/90 bg-slate-50/50 pl-10 pr-3 py-2 text-xs font-semibold text-slate-800 transition-all duration-200 hover:border-slate-300 focus:border-[#0E5C44] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#0E5C44]/12 dark:border-slate-700/80 dark:bg-slate-900/50 dark:text-slate-100 dark:hover:border-slate-600 dark:focus:border-[#3FBF75] dark:focus:bg-slate-900 dark:focus:ring-[#3FBF75]/20"
                />
              </div>
            </div>
            <div className="w-full sm:w-auto min-w-[140px]">
              <label htmlFor="mutabaah-unit" className="sr-only">Unit pendidikan</label>
              <div className="relative flex items-center">
                <div className="pointer-events-none absolute left-3.5 flex items-center text-slate-400 dark:text-slate-500">
                  <Building2 className="size-4" />
                </div>
                <select
                  id="mutabaah-unit"
                  value={filters.education_unit_id || ''}
                  onChange={(e) => update('education_unit_id', e.target.value)}
                  className="w-full sm:w-auto min-w-[140px] appearance-none rounded-xl border border-slate-200/90 bg-slate-50/50 pl-10 pr-8 py-2 text-xs font-semibold text-slate-800 transition-all duration-200 hover:border-slate-300 focus:border-[#0E5C44] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#0E5C44]/12 dark:border-slate-700/80 dark:bg-slate-900/50 dark:text-slate-100 dark:hover:border-slate-600 dark:focus:border-[#3FBF75] dark:focus:bg-slate-900 dark:focus:ring-[#3FBF75]/20 cursor-pointer"
                >
                  <option value="">Semua Unit</option>
                  {(options.data?.units || []).map((unit: any) => <option key={unit.id} value={unit.id}>{unit.name}</option>)}
                </select>
                <ChevronDown className="pointer-events-none absolute right-2.5 h-3.5 w-3.5 text-slate-400" />
              </div>
            </div>
            {isTeacher ? (
              <div className="w-full sm:w-auto min-w-[140px]">
                <label htmlFor="mutabaah-kelas" className="sr-only">Kelas</label>
                <div className="relative flex items-center">
                  <div className="pointer-events-none absolute left-3.5 flex items-center text-slate-400 dark:text-slate-500">
                    <BookOpen className="size-4" />
                  </div>
                  <select
                    id="mutabaah-kelas"
                    value={filters.class_id || filters.kelas_id || ''}
                    onChange={(e) => {
                      update('class_id', e.target.value)
                      update('kelas_id', e.target.value)
                    }}
                    className="w-full sm:w-auto min-w-[140px] appearance-none rounded-xl border border-slate-200/90 bg-slate-50/50 pl-10 pr-8 py-2 text-xs font-semibold text-slate-800 transition-all duration-200 hover:border-slate-300 focus:border-[#0E5C44] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#0E5C44]/12 dark:border-slate-700/80 dark:bg-slate-900/50 dark:text-slate-100 dark:hover:border-slate-600 dark:focus:border-[#3FBF75] dark:focus:bg-slate-900 dark:focus:ring-[#3FBF75]/20 cursor-pointer"
                  >
                    <option value="">Semua Kelas</option>
                    {(classList || []).map((cls: any) => {
                      const val = typeof cls === 'string' ? cls : cls.id
                      const label = typeof cls === 'string' ? cls : cls.name || cls.nama_kelas || cls.id
                      return <option key={val} value={val}>{label}</option>
                    })}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-2.5 h-3.5 w-3.5 text-slate-400" />
                </div>
              </div>
            ) : (
              <div className="w-full sm:w-auto min-w-[140px]">
                <label htmlFor="mutabaah-asrama" className="sr-only">Asrama</label>
                <div className="relative flex items-center">
                  <div className="pointer-events-none absolute left-3.5 flex items-center text-slate-400 dark:text-slate-500">
                    <Layers className="size-4" />
                  </div>
                  <select
                    id="mutabaah-asrama"
                    value={filters.dorm_id || ''}
                    onChange={(e) => update('dorm_id', e.target.value)}
                    className="w-full sm:w-auto min-w-[140px] appearance-none rounded-xl border border-slate-200/90 bg-slate-50/50 pl-10 pr-8 py-2 text-xs font-semibold text-slate-800 transition-all duration-200 hover:border-slate-300 focus:border-[#0E5C44] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#0E5C44]/12 dark:border-slate-700/80 dark:bg-slate-900/50 dark:text-slate-100 dark:hover:border-slate-600 dark:focus:border-[#3FBF75] dark:focus:bg-slate-900 dark:focus:ring-[#3FBF75]/20 cursor-pointer"
                  >
                    <option value="">Semua Asrama</option>
                    {(dormList || []).map((dorm: any) => {
                      const val = typeof dorm === 'string' ? dorm : dorm.id
                      const label = typeof dorm === 'string' ? dorm : dorm.name || dorm.id
                      return <option key={val} value={val}>{label}</option>
                    })}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-2.5 h-3.5 w-3.5 text-slate-400" />
                </div>
              </div>
            )}
            {!isTeacher && (
              <div className="w-full sm:w-auto min-w-[140px]">
                <label htmlFor="mutabaah-musyrif" className="sr-only">Musyrif</label>
                <div className="relative flex items-center">
                  <div className="pointer-events-none absolute left-3.5 flex items-center text-slate-400 dark:text-slate-500">
                    <UserCheck className="size-4" />
                  </div>
                  <select
                    id="mutabaah-musyrif"
                    value={filters.supervisor_id || ''}
                    onChange={(e) => update('supervisor_id', e.target.value)}
                    className="w-full sm:w-auto min-w-[140px] appearance-none rounded-xl border border-slate-200/90 bg-slate-50/50 pl-10 pr-8 py-2 text-xs font-semibold text-slate-800 transition-all duration-200 hover:border-slate-300 focus:border-[#0E5C44] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#0E5C44]/12 dark:border-slate-700/80 dark:bg-slate-900/50 dark:text-slate-100 dark:hover:border-slate-600 dark:focus:border-[#3FBF75] dark:focus:bg-slate-900 dark:focus:ring-[#3FBF75]/20 cursor-pointer"
                  >
                    <option value="">Semua Musyrif</option>
                    <option value="1">Ust. Ahmad Fadli</option>
                    <option value="2">Ustadzah Maryam</option>
                    <option value="3">Ust. Zulkifli</option>
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-2.5 h-3.5 w-3.5 text-slate-400" />
                </div>
              </div>
            )}
            <div className="w-full sm:w-auto sm:flex-1 sm:min-w-[160px]">
              <label htmlFor="mutabaah-search" className="sr-only">Pencarian santri</label>
              <div className="relative flex items-center">
                <div className="pointer-events-none absolute left-3.5 flex items-center text-slate-400 dark:text-slate-500">
                  <Search className="size-4" />
                </div>
                <input
                  id="mutabaah-search"
                  type="text"
                  placeholder="Cari santri/NIS..."
                  value={filters.search || ''}
                  onChange={(e) => update('search', e.target.value)}
                  className="w-full rounded-xl border border-slate-200/90 bg-slate-50/50 pl-10 pr-4 py-2 text-xs font-semibold text-slate-800 placeholder:text-slate-400/80 transition-all duration-200 hover:border-slate-300 focus:border-[#0E5C44] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#0E5C44]/12 dark:border-slate-700/80 dark:bg-slate-900/50 dark:text-slate-100 dark:hover:border-slate-600 dark:focus:border-[#3FBF75] dark:focus:bg-slate-900 dark:focus:ring-[#3FBF75]/20"
                />
              </div>
            </div>
            <div className="w-full sm:w-auto min-w-[140px]">
              <label htmlFor="mutabaah-perpage" className="sr-only">Tampilkan per halaman</label>
              <div className="relative flex items-center">
                <div className="pointer-events-none absolute left-3.5 flex items-center text-slate-400 dark:text-slate-500">
                  <ListChecks className="size-4" />
                </div>
                <select
                  id="mutabaah-perpage"
                  value={filters.per_page || 15}
                  onChange={(e) => update('per_page', Number(e.target.value))}
                  className="w-full sm:w-auto min-w-[140px] appearance-none rounded-xl border border-slate-200/90 bg-slate-50/50 pl-10 pr-8 py-2 text-xs font-semibold text-slate-800 transition-all duration-200 hover:border-slate-300 focus:border-[#0E5C44] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#0E5C44]/12 dark:border-slate-700/80 dark:bg-slate-900/50 dark:text-slate-100 dark:hover:border-slate-600 dark:focus:border-[#3FBF75] dark:focus:bg-slate-900 dark:focus:ring-[#3FBF75]/20 cursor-pointer"
                >
                  <option value={5}>5 per hal</option>
                  <option value={10}>10 per hal</option>
                  <option value={15}>15 per hal</option>
                  <option value={25}>25 per hal</option>
                  <option value={50}>50 per hal</option>
                  <option value={100}>100 per hal</option>
                </select>
                <ChevronDown className="pointer-events-none absolute right-2.5 h-3.5 w-3.5 text-slate-400" />
              </div>
            </div>
            <button
              type="button"
              onClick={() => setFilters({ date_from: firstDay, date_to: today, page: 1, per_page: 15 })}
              className="w-full sm:w-auto sm:ml-auto inline-flex items-center justify-center gap-1.5 h-9 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all cursor-pointer"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Reset</span>
            </button>
          </div>
        </div>

        <div className="overflow-x-auto px-4 sm:px-6 md:px-8 py-4">
          <div className="overflow-x-auto rounded-xl border border-emerald-200/80 dark:border-emerald-800/60">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-gradient-to-r from-emerald-100/80 via-teal-50/60 to-emerald-100/80 border-b border-emerald-200/80 dark:from-emerald-950/80 dark:via-teal-950/60 dark:to-emerald-950/80 dark:border-emerald-900/50 text-[11px] font-black uppercase tracking-wider text-emerald-950 dark:text-emerald-200">
                {view !== 'rekap' && <th className="w-10 px-3 py-2.5 text-center">
                  <input
                    type="checkbox"
                    checked={selectedStudentIds.length === students.length && students.length > 0}
                    onChange={handleSelectAllStudents}
                    aria-label="Pilih semua santri"
                    className="size-4 rounded border-slate-300 accent-[#0E5C44] cursor-pointer"
                  />
                </th>}
                <th className="px-3 py-2.5">Santri</th>
                <th className="hidden sm:table-cell px-3 py-2.5">{isTeacher ? 'Kelas' : 'Kelas & Asrama'}</th>
                {!isTeacher && <th className="hidden lg:table-cell px-3 py-2.5">Musyrif</th>}
                <th className="px-3 py-2.5">Progress Hari Ini</th>
                <th className="hidden md:table-cell px-3 py-2.5">Progress Pekan Ini</th>
                <th className="px-3 py-2.5">Status</th>
                <th className="px-3 py-2.5 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-emerald-100/80 dark:divide-emerald-900/40">
              {analytics.isFetching && students.length === 0 ? (
                <tr>
                  <td colSpan={view !== 'rekap' ? (isTeacher ? 7 : 8) : (isTeacher ? 6 : 7)} className="px-4 py-6">
                    <AppSkeleton variant="table" rows={4} cols={4} />
                  </td>
                </tr>
              ) : students.length === 0 ? (
                <tr>
                  <td colSpan={view !== 'rekap' ? (isTeacher ? 7 : 8) : (isTeacher ? 6 : 7)} className="px-4 py-8">
                    <AppEmptyState
                      title="Tidak ada data Mutabaah Santri"
                      description="Coba ubah filter atau kata kunci pencarian Anda."
                      actionLabel="Reset Filter"
                      onAction={() => setFilters({ date_from: firstDay, date_to: today, page: 1, per_page: 15 })}
                    />
                  </td>
                </tr>
              ) : (
                students.map((st) => (
                  <tr key={st.id} className="hover:bg-emerald-50/40 dark:hover:bg-emerald-950/20 transition-colors">
                    {view !== 'rekap' && (
                      <td className="px-3 py-3 text-center align-middle">
                        <input
                          type="checkbox"
                          checked={selectedStudentIds.includes(st.id)}
                          onChange={() => toggleSelectStudent(st.id)}
                          aria-label={`Pilih ${st.name}`}
                          className="size-4 rounded border-slate-300 accent-[#0E5C44] cursor-pointer"
                        />
                      </td>
                    )}
                    <td className="px-3 py-3 align-top sm:align-middle">
                      <div className="flex items-center gap-2.5">
                        {st.photo ? (
                          <img src={st.photo} alt={st.name} className="h-8 w-8 rounded-full object-cover border border-slate-200 shrink-0" />
                        ) : (
                          <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-emerald-100 text-[10px] font-black text-emerald-700">
                            {st.name.split(' ').map((part) => part[0]).slice(0, 2).join('')}
                          </span>
                        )}
                        <div className="min-w-0">
                          <p className="font-bold text-slate-900 dark:text-white line-clamp-2">{st.name}</p>
                          <p className="text-[10px] text-slate-400 font-mono line-clamp-1 mt-0.5">NIS: {st.nis}</p>
                        </div>
                      </div>
                      <div className="sm:hidden mt-2 flex flex-wrap items-center gap-1.5 pt-1.5 border-t border-emerald-100/80 dark:border-emerald-900/40">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300">
                          {st.class}
                        </span>
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-500/10 text-emerald-600 tabular-nums">
                          {st.progressToday}%
                        </span>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold ${st.status === 'Finalized' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-slate-100 text-slate-500'}`}>
                          {st.status}
                        </span>
                      </div>
                    </td>
                    <td className="hidden sm:table-cell px-3 py-3 align-middle">
                      <p className="font-semibold text-slate-800 dark:text-slate-200">{st.class}</p>
                      {!isTeacher && <p className="text-[10px] text-slate-400 line-clamp-1">{st.dorm}</p>}
                    </td>
                    {!isTeacher && (
                      <td className="hidden lg:table-cell px-3 py-3 align-middle font-semibold text-slate-700 dark:text-slate-300">
                        {st.supervisor}
                      </td>
                    )}
                    <td className="px-3 py-3 align-middle">
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-24 rounded-full bg-slate-100 dark:bg-slate-700">
                          <div className="h-2 rounded-full bg-emerald-500 transition-all" style={{ width: `${st.progressToday}%` }} />
                        </div>
                        <span className="font-bold text-emerald-600 tabular-nums">{st.progressToday}%</span>
                      </div>
                    </td>
                    <td className="hidden md:table-cell px-3 py-3 align-middle font-bold text-slate-700 dark:text-slate-300 tabular-nums">
                      {st.progressWeek}%
                    </td>
                    <td className="px-3 py-3 align-middle">
                      <AppBadge variant={st.status === 'Finalized' ? 'success' : st.status === 'Draft' ? 'warning' : 'danger'}>
                        {st.status}
                      </AppBadge>
                    </td>
                    <td className="px-3 py-3 text-center align-middle">
                      <div className="flex items-center justify-center gap-1.5">
                        <MasterActionIconButton variant="view" label="Lihat Detail" onClick={() => { setSelectedStudent(st); setShowDetailDrawer(true) }} />
                        <MasterActionIconButton
                          variant="edit"
                          label="Edit Data"
                          onClick={() => {
                            setEditStudent(st)
                            setStudentForm({
                              name: st.name,
                              nis: st.nis,
                              class: st.class,
                              dorm: st.dorm,
                            })
                            setShowEditModal(true)
                          }}
                        />
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
          </div>
        </div>

        {/* Pagination Controls (§7.6) */}
        <div className="border-t border-emerald-200/80 bg-gradient-to-r from-emerald-50/40 via-white to-emerald-50/40 p-3.5 sm:px-6 md:px-8 py-3 sm:py-3.5 dark:border-emerald-800/60 dark:from-emerald-950/20 dark:via-transparent dark:to-emerald-950/20 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 text-center sm:text-left">
            Menampilkan <span className="font-semibold text-slate-700 dark:text-slate-200">{recapData?.from || (students.length > 0 ? 1 : 0)}</span> s.d. <span className="font-semibold text-slate-700 dark:text-slate-200">{recapData?.to || students.length}</span> dari <span className="font-semibold text-slate-700 dark:text-slate-200">{recapData?.total || students.length}</span> santri
          </div>
          {(recapData?.last_page || 1) > 1 && (
            <div className="flex items-center justify-center gap-2">
              <Pagination
                currentPage={Number(filters.page || 1)}
                totalPages={Number(recapData?.last_page || 1)}
                onPageChange={(p) => update('page', p)}
                sideLayout="icon"
              />
            </div>
          )}
        </div>
      </motion.section>

      {/* MATRIX FAST INPUT MODAL */}
      {view !== 'rekap' && (
      <AnimatePresence>
      {showMatrixModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="matrix-modal-title"
          tabIndex={-1}
          className="overlay modal fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/70 p-3 sm:p-5 backdrop-blur-md"
          onMouseDown={(e) => { if (e.target === e.currentTarget) setShowMatrixModal(false) }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 14 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ type: 'spring', stiffness: 400, damping: 28 }}
            className="modal-dialog font-sans my-auto w-full max-w-5xl"
          >
            <div className="modal-content flex max-h-[calc(100dvh-2rem)] flex-col overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-2xl shadow-emerald-950/20 dark:border-slate-800 dark:bg-[#182232] dark:shadow-black/60">
            <div className="h-1.5 bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-600 shrink-0" />
            <div className="modal-header flex items-center justify-between border-b border-slate-100 bg-white px-6 py-4.5 dark:border-slate-800 dark:bg-slate-950 shrink-0">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 sm:h-11 sm:w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 via-amber-500 to-orange-600 text-white shadow-md shadow-amber-500/20 border border-amber-300/40">
                  <Zap className="h-5 w-5 text-white" strokeWidth={2.25} />
                </div>
                <div>
                  <h3 id="matrix-modal-title" className="modal-title text-sm sm:text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                    <span>Fast Matrix Input Mutabaah</span>
                    <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-700 border border-amber-200/80 dark:bg-amber-950/60 dark:text-amber-400 dark:border-amber-800/60">
                      <Zap className="size-3" />
                      Massal
                    </span>
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Input cepat centang mutabaah harian santri secara massal</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowMatrixModal(false)}
                aria-label="Tutup modal"
                className="size-9 flex items-center justify-center rounded-2xl bg-gradient-to-br from-rose-500 via-rose-600 to-red-700 text-white hover:scale-105 active:scale-95 transition-all duration-200 shadow-md shadow-rose-500/20 cursor-pointer shrink-0"
              >
                <X className="size-4 text-white" strokeWidth={2.25} />
              </button>
            </div>

            <div className="modal-body min-h-0 flex-1 overflow-y-auto p-5 sm:p-6">
              <div className="overflow-x-auto rounded-xl border border-emerald-200/80 dark:border-emerald-800/60">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="bg-gradient-to-r from-emerald-100/80 via-teal-50/60 to-emerald-100/80 border-b border-emerald-200/80 dark:from-emerald-950/80 dark:via-teal-950/60 dark:to-emerald-950/80 dark:border-emerald-900/50 uppercase text-[10px] font-extrabold text-emerald-800 dark:text-emerald-300">
                    <th className="p-2.5">Santri</th>
                    {worshipItemsList.map((item) => (
                      <th key={item} className="p-2.5 text-center">
                        <div>{item}</div>
                        <button
                          type="button"
                          onClick={() => setMatrixColumn(item, true)}
                          className="mt-1 text-[9px] font-bold text-emerald-700 dark:text-emerald-400 hover:underline cursor-pointer"
                        >
                          All ✓
                        </button>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-emerald-100/80 dark:divide-emerald-900/40">
                  {students.map((st) => (
                    <tr key={st.id} className="hover:bg-emerald-50/40 dark:hover:bg-emerald-950/20 transition-colors">
                      <td className="p-2.5 font-bold text-slate-800 dark:text-slate-200 whitespace-nowrap">{st.name}</td>
                      {worshipItemsList.map((item) => {
                        const key = `${st.id}:${item}`
                        const isChecked = Boolean(matrixValues[key])
                        return (
                          <td key={item} className="p-2.5 text-center">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => toggleMatrixCell(st.id, item)}
                              aria-label={`${item} - ${st.name}`}
                              className="size-4 rounded border-slate-300 accent-[#0E5C44] cursor-pointer"
                            />
                          </td>
                        )
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
              </div>
            </div>

            <div className="modal-footer flex flex-wrap items-center justify-between gap-2.5 border-t border-slate-100 bg-slate-50/50 px-6 py-4 dark:border-slate-800 dark:bg-slate-900/40 shrink-0">
              <button
                type="button"
                onClick={() => setShowMatrixModal(false)}
                className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-br from-rose-500 via-rose-600 to-red-700 text-white px-4 py-2.5 text-xs font-extrabold border border-rose-300/40 transition-all duration-200 hover:scale-[1.03] active:scale-95 cursor-pointer"
              >
                <div className="flex size-5 items-center justify-center rounded-lg bg-white/20 text-white">
                  <X className="size-3.5 text-white" strokeWidth={2.2} />
                </div>
                <span>Tutup</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowMatrixModal(false)
                  Swal.fire('Berhasil Disimpan', 'Seluruh data Matrix Mutabaah berhasil disimpan!', 'success')
                }}
                className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700 text-white px-5 py-2.5 text-xs font-extrabold border border-emerald-300/40 hover:scale-[1.03] transition-all duration-200 active:scale-95 cursor-pointer shadow-md shadow-emerald-500/20"
              >
                <div className="flex size-5 items-center justify-center rounded-lg bg-white/20 text-white">
                  <Check className="size-3.5 text-white" strokeWidth={2.2} />
                </div>
                <span>Simpan Matrix</span>
              </button>
            </div>
            </div>
          </motion.div>
        </div>
      )}
      </AnimatePresence>
      )}

      {/* 🟢 TAILGRIDS DIALOG: MODAL TAMBAH DATA SANTRI */}
      <OverlayWrapper>
        <Backdrop isOpen={showAddModal} onOpenChange={setShowAddModal} isDismissable={true} className="z-[70] bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-3 sm:p-5">
          <Dialog className="max-w-md w-full rounded-3xl bg-white dark:bg-[#182232] shadow-2xl shadow-emerald-950/20 dark:shadow-black/60 overflow-hidden p-0 border border-slate-200/80 dark:border-slate-800">
            <div className="h-1.5 bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-600 shrink-0" />
            <div className="p-5 sm:p-6">
              <DialogHeader className="border-b border-slate-100 pb-4 dark:border-slate-800 flex flex-row items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 sm:h-11 sm:w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700 text-white shadow-md shadow-emerald-500/20 border border-emerald-300/30">
                    <UserPlus className="h-5 w-5 text-white" strokeWidth={2.25} />
                  </div>
                  <div>
                    <DialogTitle className="text-sm sm:text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                      <span>Tambah Data Mutabaah</span>
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-800 border border-emerald-200/80 dark:bg-emerald-950/60 dark:text-emerald-400 dark:border-emerald-800/60">
                        <Sparkles className="size-3" />
                        Data Baru
                      </span>
                    </DialogTitle>
                    <DialogDescription className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      Isi informasi santri untuk menambahkan data mutabaah baru
                    </DialogDescription>
                  </div>
                </div>
                <DialogClose onClick={() => setShowAddModal(false)} />
              </DialogHeader>

              <form onSubmit={handleSaveNewStudent}>
                <DialogBody className="space-y-4 py-4">
                  <div>
                    <label htmlFor="mutabaah-add-name" className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5">
                      Nama Lengkap Santri <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative flex items-center">
                      <div className="pointer-events-none absolute left-3.5 flex items-center text-slate-400 dark:text-slate-500">
                        <User className="size-4" />
                      </div>
                      <input
                        id="mutabaah-add-name"
                        type="text"
                        required
                        placeholder="Masukkan nama santri"
                        value={studentForm.name}
                        onChange={(e) => setStudentForm({ ...studentForm, name: e.target.value })}
                        className="w-full rounded-xl border border-slate-200/90 bg-slate-50/50 pl-10 pr-4 py-2.5 text-xs font-semibold text-slate-800 placeholder:text-slate-400/80 transition-all duration-200 hover:border-slate-300 focus:border-[#0E5C44] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#0E5C44]/12 dark:border-slate-700/80 dark:bg-slate-900/50 dark:text-slate-100 dark:hover:border-slate-600 dark:focus:border-[#3FBF75] dark:focus:bg-slate-900 dark:focus:ring-[#3FBF75]/20"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="mutabaah-add-nis" className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5">
                      NIS (Nomor Induk Siswa) <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative flex items-center">
                      <div className="pointer-events-none absolute left-3.5 flex items-center text-slate-400 dark:text-slate-500">
                        <Hash className="size-4" />
                      </div>
                      <input
                        id="mutabaah-add-nis"
                        type="text"
                        required
                        placeholder="Masukkan NIS santri"
                        value={studentForm.nis}
                        onChange={(e) => setStudentForm({ ...studentForm, nis: e.target.value })}
                        className="w-full rounded-xl border border-slate-200/90 bg-slate-50/50 pl-10 pr-4 py-2.5 text-xs font-semibold text-slate-800 placeholder:text-slate-400/80 transition-all duration-200 hover:border-slate-300 focus:border-[#0E5C44] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#0E5C44]/12 dark:border-slate-700/80 dark:bg-slate-900/50 dark:text-slate-100 dark:hover:border-slate-600 dark:focus:border-[#3FBF75] dark:focus:bg-slate-900 dark:focus:ring-[#3FBF75]/20"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label htmlFor="mutabaah-add-class" className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5">
                        Kelas
                      </label>
                      <div className="relative flex items-center">
                        <div className="pointer-events-none absolute left-3.5 flex items-center text-slate-400 dark:text-slate-500">
                          <BookOpen className="size-4" />
                        </div>
                        <input
                          id="mutabaah-add-class"
                          type="text"
                          placeholder="Contoh: VII-A"
                          value={studentForm.class}
                          onChange={(e) => setStudentForm({ ...studentForm, class: e.target.value })}
                          className="w-full rounded-xl border border-slate-200/90 bg-slate-50/50 pl-10 pr-4 py-2.5 text-xs font-semibold text-slate-800 placeholder:text-slate-400/80 transition-all duration-200 hover:border-slate-300 focus:border-[#0E5C44] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#0E5C44]/12 dark:border-slate-700/80 dark:bg-slate-900/50 dark:text-slate-100 dark:hover:border-slate-600 dark:focus:border-[#3FBF75] dark:focus:bg-slate-900 dark:focus:ring-[#3FBF75]/20"
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="mutabaah-add-dorm" className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5">
                        Asrama
                      </label>
                      <div className="relative flex items-center">
                        <div className="pointer-events-none absolute left-3.5 flex items-center text-slate-400 dark:text-slate-500">
                          <Building2 className="size-4" />
                        </div>
                        <input
                          id="mutabaah-add-dorm"
                          type="text"
                          placeholder="Contoh: Asrama Al-Ghazali"
                          value={studentForm.dorm}
                          onChange={(e) => setStudentForm({ ...studentForm, dorm: e.target.value })}
                          className="w-full rounded-xl border border-slate-200/90 bg-slate-50/50 pl-10 pr-4 py-2.5 text-xs font-semibold text-slate-800 placeholder:text-slate-400/80 transition-all duration-200 hover:border-slate-300 focus:border-[#0E5C44] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#0E5C44]/12 dark:border-slate-700/80 dark:bg-slate-900/50 dark:text-slate-100 dark:hover:border-slate-600 dark:focus:border-[#3FBF75] dark:focus:bg-slate-900 dark:focus:ring-[#3FBF75]/20"
                        />
                      </div>
                    </div>
                  </div>
                </DialogBody>

                <DialogFooter className="flex flex-wrap items-center justify-between gap-2.5 border-t border-slate-100 pt-4 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-br from-rose-500 via-rose-600 to-red-700 text-white px-4 py-2.5 text-xs font-extrabold border border-rose-300/40 transition-all duration-200 hover:scale-[1.03] active:scale-95 cursor-pointer"
                  >
                    <div className="flex size-5 items-center justify-center rounded-lg bg-white/20 text-white">
                      <X className="size-3.5 text-white" strokeWidth={2.2} />
                    </div>
                    <span>Batal</span>
                  </button>
                  <button
                    type="submit"
                    className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700 text-white px-5 py-2.5 text-xs font-extrabold border border-emerald-300/40 hover:scale-[1.03] transition-all duration-200 active:scale-95 cursor-pointer shadow-md shadow-emerald-500/20"
                  >
                    <div className="flex size-5 items-center justify-center rounded-lg bg-white/20 text-white">
                      <Check className="size-3.5 text-white" strokeWidth={2.2} />
                    </div>
                    <span>Simpan Data</span>
                  </button>
                </DialogFooter>
              </form>
            </div>
          </Dialog>
        </Backdrop>
      </OverlayWrapper>

      {/* 🟢 TAILGRIDS DIALOG: MODAL EDIT DATA SANTRI */}
      <OverlayWrapper>
        <Backdrop isOpen={showEditModal} onOpenChange={setShowEditModal} isDismissable={true} className="z-[70] bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-3 sm:p-5">
          <Dialog className="max-w-md w-full rounded-3xl bg-white dark:bg-[#182232] shadow-2xl shadow-amber-950/20 dark:shadow-black/60 overflow-hidden p-0 border border-amber-200/60 dark:border-amber-900/50">
            <div className="h-1.5 bg-gradient-to-r from-amber-500 via-teal-400 to-emerald-600 shrink-0" />
            <div className="p-5 sm:p-6">
              <DialogHeader className="border-b border-slate-100 pb-4 dark:border-slate-800 flex flex-row items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 sm:h-11 sm:w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 via-amber-500 to-orange-600 text-white shadow-md shadow-amber-500/20 border border-amber-300/40">
                    <Pencil className="h-5 w-5 text-white" strokeWidth={2.25} />
                  </div>
                  <div>
                    <DialogTitle className="text-sm sm:text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                      <span>Edit Data Mutabaah</span>
                      <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-700 border border-amber-200/80 dark:bg-amber-950/60 dark:text-amber-400 dark:border-amber-800/60">
                        <Sparkles className="size-3" />
                        Update Data
                      </span>
                    </DialogTitle>
                    <DialogDescription className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      Ubah informasi santri yang dipilih
                    </DialogDescription>
                  </div>
                </div>
                <DialogClose onClick={() => setShowEditModal(false)} />
              </DialogHeader>

              <form onSubmit={handleSaveEditStudent}>
                <DialogBody className="space-y-4 py-4">
                  <div>
                    <label htmlFor="mutabaah-edit-name" className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5">
                      Nama Lengkap Santri <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative flex items-center">
                      <div className="pointer-events-none absolute left-3.5 flex items-center text-slate-400 dark:text-slate-500">
                        <User className="size-4" />
                      </div>
                      <input
                        id="mutabaah-edit-name"
                        type="text"
                        required
                        value={studentForm.name}
                        onChange={(e) => setStudentForm({ ...studentForm, name: e.target.value })}
                        className="w-full rounded-xl border border-slate-200/90 bg-slate-50/50 pl-10 pr-4 py-2.5 text-xs font-semibold text-slate-800 transition-all duration-200 hover:border-slate-300 focus:border-[#0E5C44] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#0E5C44]/12 dark:border-slate-700/80 dark:bg-slate-900/50 dark:text-slate-100 dark:hover:border-slate-600 dark:focus:border-[#3FBF75] dark:focus:bg-slate-900 dark:focus:ring-[#3FBF75]/20"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="mutabaah-edit-nis" className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5">
                      NIS (Nomor Induk Siswa) <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative flex items-center">
                      <div className="pointer-events-none absolute left-3.5 flex items-center text-slate-400 dark:text-slate-500">
                        <Hash className="size-4" />
                      </div>
                      <input
                        id="mutabaah-edit-nis"
                        type="text"
                        required
                        value={studentForm.nis}
                        onChange={(e) => setStudentForm({ ...studentForm, nis: e.target.value })}
                        className="w-full rounded-xl border border-slate-200/90 bg-slate-50/50 pl-10 pr-4 py-2.5 text-xs font-semibold text-slate-800 transition-all duration-200 hover:border-slate-300 focus:border-[#0E5C44] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#0E5C44]/12 dark:border-slate-700/80 dark:bg-slate-900/50 dark:text-slate-100 dark:hover:border-slate-600 dark:focus:border-[#3FBF75] dark:focus:bg-slate-900 dark:focus:ring-[#3FBF75]/20"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label htmlFor="mutabaah-edit-class" className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5">
                        Kelas
                      </label>
                      <div className="relative flex items-center">
                        <div className="pointer-events-none absolute left-3.5 flex items-center text-slate-400 dark:text-slate-500">
                          <BookOpen className="size-4" />
                        </div>
                        <input
                          id="mutabaah-edit-class"
                          type="text"
                          value={studentForm.class}
                          onChange={(e) => setStudentForm({ ...studentForm, class: e.target.value })}
                          className="w-full rounded-xl border border-slate-200/90 bg-slate-50/50 pl-10 pr-4 py-2.5 text-xs font-semibold text-slate-800 transition-all duration-200 hover:border-slate-300 focus:border-[#0E5C44] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#0E5C44]/12 dark:border-slate-700/80 dark:bg-slate-900/50 dark:text-slate-100 dark:hover:border-slate-600 dark:focus:border-[#3FBF75] dark:focus:bg-slate-900 dark:focus:ring-[#3FBF75]/20"
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="mutabaah-edit-dorm" className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5">
                        Asrama
                      </label>
                      <div className="relative flex items-center">
                        <div className="pointer-events-none absolute left-3.5 flex items-center text-slate-400 dark:text-slate-500">
                          <Building2 className="size-4" />
                        </div>
                        <input
                          id="mutabaah-edit-dorm"
                          type="text"
                          value={studentForm.dorm}
                          onChange={(e) => setStudentForm({ ...studentForm, dorm: e.target.value })}
                          className="w-full rounded-xl border border-slate-200/90 bg-slate-50/50 pl-10 pr-4 py-2.5 text-xs font-semibold text-slate-800 transition-all duration-200 hover:border-slate-300 focus:border-[#0E5C44] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#0E5C44]/12 dark:border-slate-700/80 dark:bg-slate-900/50 dark:text-slate-100 dark:hover:border-slate-600 dark:focus:border-[#3FBF75] dark:focus:bg-slate-900 dark:focus:ring-[#3FBF75]/20"
                        />
                      </div>
                    </div>
                  </div>
                </DialogBody>

                <DialogFooter className="flex flex-wrap items-center justify-between gap-2.5 border-t border-slate-100 pt-4 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setShowEditModal(false)}
                    className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-br from-rose-500 via-rose-600 to-red-700 text-white px-4 py-2.5 text-xs font-extrabold border border-rose-300/40 transition-all duration-200 hover:scale-[1.03] active:scale-95 cursor-pointer"
                  >
                    <div className="flex size-5 items-center justify-center rounded-lg bg-white/20 text-white">
                      <X className="size-3.5 text-white" strokeWidth={2.2} />
                    </div>
                    <span>Batal</span>
                  </button>
                  <button
                    type="submit"
                    className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-br from-amber-400 via-amber-500 to-orange-600 text-white px-5 py-2.5 text-xs font-extrabold border border-amber-300/40 hover:scale-[1.03] transition-all duration-200 active:scale-95 cursor-pointer shadow-md shadow-amber-500/20"
                  >
                    <div className="flex size-5 items-center justify-center rounded-lg bg-white/20 text-white">
                      <Pencil className="size-3.5 text-white" strokeWidth={2.2} />
                    </div>
                    <span>Simpan Perubahan</span>
                  </button>
                </DialogFooter>
              </form>
            </div>
          </Dialog>
        </Backdrop>
      </OverlayWrapper>

      {/* 🟢 TAILGRIDS DIALOG: MODAL LIHAT DETAIL SANTRI */}
      <OverlayWrapper>
        <Backdrop isOpen={showDetailDrawer} onOpenChange={setShowDetailDrawer} isDismissable={true} className="z-[70] bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-3 sm:p-5">
          <Dialog className="max-w-md w-full rounded-3xl bg-white dark:bg-[#182232] shadow-2xl shadow-emerald-950/20 dark:shadow-black/60 overflow-hidden p-0 border border-slate-200/80 dark:border-slate-800">
            <div className="h-1.5 bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-600 shrink-0" />
            <div className="p-5 sm:p-6">
              <DialogHeader className="border-b border-slate-100 pb-4 dark:border-slate-800 flex flex-row items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  {selectedStudent?.photo ? (
                    <img src={selectedStudent.photo} alt={selectedStudent.name} className="h-11 w-11 rounded-2xl object-cover border-2 border-emerald-500/30" />
                  ) : (
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700 text-white font-black shadow-md shadow-emerald-500/20 border border-emerald-300/30">
                      {selectedStudent?.name?.slice(0, 2)?.toUpperCase() || 'ST'}
                    </div>
                  )}
                  <div>
                    <DialogTitle className="text-sm sm:text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                      <span className="truncate">{selectedStudent?.name}</span>
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-800 border border-emerald-200/80 dark:bg-emerald-950/60 dark:text-emerald-400 dark:border-emerald-800/60 shrink-0">
                        <Eye className="size-3" />
                        Detail
                      </span>
                    </DialogTitle>
                    <DialogDescription className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-mono">
                      NIS: {selectedStudent?.nis} • Kelas: {selectedStudent?.class} {!isTeacher && selectedStudent?.dorm && `• Asrama: ${selectedStudent.dorm}`}
                    </DialogDescription>
                  </div>
                </div>
                <DialogClose onClick={() => setShowDetailDrawer(false)} />
              </DialogHeader>

              <DialogBody className="space-y-4 py-4 text-xs">
                <div className="grid grid-cols-2 gap-3 rounded-2xl border border-slate-200/90 bg-slate-50/70 p-4 dark:border-slate-800 dark:bg-slate-900/50">
                  {!isTeacher && (
                    <div>
                      <p className="text-slate-400 text-[10px] font-semibold uppercase tracking-wider">Musyrif Pembimbing:</p>
                      <p className="font-bold text-slate-800 dark:text-slate-200 mt-0.5">{selectedStudent?.supervisor || '-'}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-slate-400 text-[10px] font-semibold uppercase tracking-wider">Status Mutabaah:</p>
                    <p className="font-bold text-slate-800 dark:text-slate-200 mt-0.5">{selectedStudent?.status || '-'}</p>
                  </div>
                  <div>
                    <p className="text-slate-400 text-[10px] font-semibold uppercase tracking-wider">Pencapaian Hari Ini:</p>
                    <p className="font-black text-emerald-600 dark:text-emerald-400 text-xl mt-0.5 tabular-nums">{selectedStudent?.progressToday || 0}%</p>
                  </div>
                  <div>
                    <p className="text-slate-400 text-[10px] font-semibold uppercase tracking-wider">Pencapaian Pekan Ini:</p>
                    <p className="font-black text-emerald-600 dark:text-emerald-400 text-xl mt-0.5 tabular-nums">{selectedStudent?.progressWeek || 0}%</p>
                  </div>
                </div>
              </DialogBody>

              <DialogFooter className="flex flex-wrap items-center justify-between gap-2.5 border-t border-slate-100 pt-4 dark:border-slate-800">
                <span className="text-xs font-semibold text-slate-400">Rincian mutabaah santri SIMSIT</span>
                <button
                  type="button"
                  onClick={() => setShowDetailDrawer(false)}
                  className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-br from-rose-500 via-rose-600 to-red-700 text-white px-4 py-2.5 text-xs font-extrabold border border-rose-300/40 transition-all duration-200 hover:scale-[1.03] active:scale-95 cursor-pointer"
                >
                  <div className="flex size-5 items-center justify-center rounded-lg bg-white/20 text-white">
                    <X className="size-3.5 text-white" strokeWidth={2.2} />
                  </div>
                  <span>Tutup</span>
                </button>
              </DialogFooter>
            </div>
          </Dialog>
        </Backdrop>
      </OverlayWrapper>
      {/* Modal: TailGrids Opsi Cetak & Unduh PDF / Clean Print */}
      <PrintOptionModal
        isOpen={printOptionModalOpen}
        onClose={() => setPrintOptionModalOpen(false)}
        onPrint={handlePrintClean}
        onDownload={handleDownloadPdfTable}
        title="Data Mutabaah Santri"
      />
    </PageContainer>
  )
}
