import React, { useState, useEffect, useMemo, useRef } from 'react'
import { Navigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  BookOpen,
  Calendar,
  User,
  CheckCircle2,
  Clock,
  Mic,
  MicOff,
  Play,
  Pause,
  Save,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Sparkles,
  Award,
  FileText,
  Search,
  X,
  Loader2,
  UserCheck,
  Heart,
  RefreshCcw,
  Users,
  Eye,
  BookOpenCheck,
  Target,
  ArrowRight,
  GraduationCap,
  ListFilter,
  Check,
  Crown,
  TrendingUp,
  Printer,
  Upload,
  Download,
  ArrowUpDown,
  Plus,
} from 'lucide-react'
import { Pagination } from '../components/tailgrids/core/pagination'
import { printCleanTable, downloadPdfTable } from '../utils/printHelper'
import PrintOptionModal from '../components/master-data/PrintOptionModal'
import { SquircleActionButton, MasterActionButton, MasterActionIconButton } from '../components/master-data'
import { tahfizhService } from '../services/tahfizhService'
import { equranService } from '../services/equranService'
import { kelasService } from '../services/kelasService'
import { useUnitStore } from '../stores/unitStore'
import { useAuthStore } from '../stores/authStore'
import { cn } from '../lib/utils'
import PageContainer from '../components/app/PageContainer'
import AppBreadcrumb from '../components/app/AppBreadcrumb'
import AppBadge from '../components/app/AppBadge'
import AppSkeleton from '../components/app/AppSkeleton'
import AppEmptyState from '../components/app/AppEmptyState'
import AppErrorState from '../components/app/AppErrorState'
import TahfizhSubNav from '../components/tahfizh/TahfizhSubNav'

// TailGrids Core Components
import { Button } from '@/components/tailgrids/core/button'
import { Badge } from '@/components/tailgrids/core/badge'
import { Avatar, AvatarFallback } from '@/components/tailgrids/core/avatar'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  CardAction,
} from '@/components/tailgrids/core/card'
import {
  TableRoot,
  TableHeader,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
} from '@/components/tailgrids/core/table'
import {
  Dialog,
  DialogBody,
  DialogClose,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/tailgrids/core/dialog'
import { Backdrop } from '@/components/tailgrids/core/overlay'

// ── MODERN CARD TONES (§C Tailgrids_Pengaturan_Halaman) ──
const MODERN_CARD_TONES = {
  emerald: {
    card: 'border-emerald-300/70 bg-gradient-to-br from-emerald-50 via-teal-50/60 to-white hover:border-emerald-400 dark:border-emerald-700/50 dark:from-emerald-950/40 dark:via-teal-950/20 dark:to-slate-900',
    glow: 'bg-emerald-400/20 group-hover:bg-emerald-400/30',
    iconBox: 'bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-sm shadow-emerald-500/30',
    tag: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/60 dark:text-emerald-300',
    title: 'text-emerald-700 dark:text-emerald-400',
    val: 'text-emerald-700 dark:text-emerald-300',
    sub: 'text-emerald-600/80 dark:text-emerald-400/80',
    cta: 'text-emerald-600/60 dark:text-emerald-500/60',
  },
  amber: {
    card: 'border-amber-300/70 bg-gradient-to-br from-amber-50 via-orange-50/60 to-white hover:border-amber-400 dark:border-amber-700/50 dark:from-amber-950/40 dark:via-orange-950/20 dark:to-slate-900',
    glow: 'bg-amber-400/20 group-hover:bg-amber-400/30',
    iconBox: 'bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-sm shadow-amber-500/30',
    tag: 'bg-amber-100 text-amber-700 dark:bg-amber-900/60 dark:text-amber-300',
    title: 'text-amber-700 dark:text-amber-400',
    val: 'text-amber-700 dark:text-amber-300',
    sub: 'text-amber-600/80 dark:text-amber-400/80',
    cta: 'text-amber-600/60 dark:text-amber-500/60',
  },
  blue: {
    card: 'border-blue-300/70 bg-gradient-to-br from-blue-50 via-cyan-50/60 to-white hover:border-blue-400 dark:border-blue-700/50 dark:from-blue-950/40 dark:via-cyan-950/20 dark:to-slate-900',
    glow: 'bg-blue-400/20 group-hover:bg-blue-400/30',
    iconBox: 'bg-gradient-to-br from-blue-500 to-cyan-600 text-white shadow-sm shadow-blue-500/30',
    tag: 'bg-blue-100 text-blue-700 dark:bg-blue-900/60 dark:text-blue-300',
    title: 'text-blue-700 dark:text-blue-400',
    val: 'text-blue-700 dark:text-blue-300',
    sub: 'text-blue-600/80 dark:text-blue-400/80',
    cta: 'text-blue-600/60 dark:text-blue-500/60',
  },
  purple: {
    card: 'border-purple-300/70 bg-gradient-to-br from-purple-50 via-indigo-50/60 to-white hover:border-purple-400 dark:border-purple-700/50 dark:from-purple-950/40 dark:via-indigo-950/20 dark:to-slate-900',
    glow: 'bg-purple-400/20 group-hover:bg-purple-400/30',
    iconBox: 'bg-gradient-to-br from-purple-500 to-indigo-600 text-white shadow-sm shadow-purple-500/30',
    tag: 'bg-purple-100 text-purple-700 dark:bg-purple-900/60 dark:text-purple-300',
    title: 'text-purple-700 dark:text-purple-400',
    val: 'text-purple-700 dark:text-purple-300',
    sub: 'text-purple-600/80 dark:text-purple-400/80',
    cta: 'text-purple-600/60 dark:text-purple-500/60',
  },
}

function ModernKpiCard({ title, value, subtext, icon: Icon, tone = 'emerald', tag = 'METRIK', onClick, children }) {
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
      <div className={`pointer-events-none absolute -top-8 -right-8 h-28 w-28 rounded-full blur-2xl transition-all ${t.glow}`} />
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-white shadow-sm ${t.iconBox}`}>
            {Icon && <Icon className="h-4.5 w-4.5" />}
          </div>
          <div className="min-w-0 flex-1">
            <p className={`text-[11px] font-bold uppercase tracking-wider truncate ${t.title}`} title={title}>{title}</p>
          </div>
        </div>
        {tag && (
          <span className={`shrink-0 rounded-lg px-2 py-0.5 text-[10px] font-extrabold ${t.tag}`}>
            {tag}
          </span>
        )}
      </div>
      <div className="mt-0.5">
        {children || (
          <>
            <p className={`text-4xl font-black tabular-nums truncate ${t.val}`} title={String(value ?? '')}>
              {value}
            </p>
            {subtext && (
              <p className={`mt-0.5 text-[11px] font-semibold truncate ${t.sub}`} title={subtext}>{subtext}</p>
            )}
          </>
        )}
      </div>
      {isClickable && (
        <p className={`mt-3 text-[10px] font-bold flex items-center gap-1 ${t.cta}`}>
          <Eye className="h-3 w-3" /> Klik untuk detail lengkap
        </p>
      )}
    </motion.div>
  )
}

// ── SEMANTIC TOAST STACK (§L Tailgrids_Pengaturan_Halaman) ───────────────────
const TOAST_TONE_LABEL = { success: 'Berhasil', warning: 'Perhatian', error: 'Gagal' }

function ToastStack({ items, onDismiss }) {
  if (!items?.length) return null
  return (
    <div className="fixed bottom-6 right-4 z-[200] flex flex-col gap-2.5 sm:right-6 max-w-sm w-full pointer-events-none print:hidden" aria-live="polite" aria-atomic="true">
      {items.map((n) => {
        const isDanger = n.type === 'error'
        const isWarning = n.type === 'warning'
        const isSuccess = !isDanger && !isWarning
        return (
          <div
            key={n.id}
            className={cn(
              'relative pointer-events-auto flex flex-col overflow-hidden rounded-2xl border-2 bg-white/95 dark:bg-[#182232]/95 backdrop-blur-md p-3.5 shadow-2xl transition-all duration-300 animate-[masterDropdownSlide_0.25s_ease-out]',
              isSuccess && 'border-emerald-500/40 shadow-emerald-950/15 dark:border-emerald-600/50 dark:shadow-black/50',
              isDanger && 'border-rose-400/50 shadow-rose-950/15 dark:border-rose-600/50 dark:shadow-black/50',
              isWarning && 'border-amber-400/50 shadow-amber-950/15 dark:border-amber-600/50 dark:shadow-black/50'
            )}
          >
            <div className={cn(
              'absolute top-0 left-0 right-0 h-1',
              isSuccess && 'bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-600',
              isDanger && 'bg-gradient-to-r from-rose-500 via-rose-600 to-red-700',
              isWarning && 'bg-gradient-to-r from-amber-400 via-amber-500 to-orange-600'
            )} />
            <div className="flex items-start gap-3 mt-0.5">
              <div className={cn(
                'flex size-9 shrink-0 items-center justify-center rounded-xl text-white shadow-sm',
                isSuccess && 'bg-gradient-to-br from-emerald-500 to-teal-600 shadow-emerald-500/30',
                isDanger && 'bg-gradient-to-br from-rose-500 to-red-600 shadow-rose-500/30',
                isWarning && 'bg-gradient-to-br from-amber-500 to-orange-600 shadow-amber-500/30'
              )}>
                {isSuccess && <CheckCircle2 className="size-5" strokeWidth={2.3} />}
                {isDanger && <X className="size-5" strokeWidth={2.3} />}
                {isWarning && <Clock className="size-5" strokeWidth={2.3} />}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <h4 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white">{TOAST_TONE_LABEL[n.type] || 'Info'}</h4>
                  <span className={cn(
                    'inline-flex items-center rounded-full px-2 py-0.2 text-[10px] font-bold border',
                    isSuccess && 'bg-emerald-50 text-[#0E5C44] border-emerald-200/80 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800/80',
                    isDanger && 'bg-rose-50 text-rose-700 border-rose-200/80 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800/80',
                    isWarning && 'bg-amber-50 text-amber-800 border-amber-200/80 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800/80'
                  )}>
                    {TOAST_TONE_LABEL[n.type] || 'Info'}
                  </span>
                </div>
                {n.message && (
                  <p className="mt-1 text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-medium">{n.message}</p>
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
          </div>
        )
      })}
    </div>
  )
}

export default function TahfizhPage() {
  const breadcrumbItems = [
    { href: '/dashboard', label: 'Dashboard' },
    { href: '/dashboard/tahfizh', label: 'Setoran Tahfizh & Murajaah' },
  ]
  // State Filter & Context
  const activeUnit = useUnitStore((state) => state.activeUnit)
  const user = useAuthStore((state) => state.user)
  const activeUnitName = String(activeUnit || user?.education_unit || user?.unit_name || user?.unit || '').toLowerCase()
  const isPesantrenUnit = Boolean(
    user?.is_pesantren ||
    activeUnitName.includes('pesantren') ||
    activeUnitName.includes('ponpes') ||
    activeUnitName.includes('mahad') ||
    activeUnitName.includes('asrama')
  )

  // Roles checking
  const userRoles = useMemo(() => {
    const rList = user?.roles || []
    return rList.map((r) => (typeof r === 'string' ? r : r.name || ''))
  }, [user])

  const isKepalaSekolah = useMemo(() => {
    return userRoles.some((r) => ['Kepala Sekolah', 'KepalaSekolah', 'kepala_sekolah', 'kepsek'].includes(r))
  }, [userRoles])

  const isSuperAdminOrAdmin = useMemo(() => {
    return userRoles.some((r) => ['Super Admin', 'SuperAdmin', 'Admin', 'admin', 'superadmin', 'Kepala Sekolah', 'KepalaSekolah', 'kepala_sekolah', 'kepsek'].includes(r))
  }, [userRoles])

  const isParent = useMemo(() => {
    return userRoles.some((r) => ['Orang Tua', 'orang_tua', 'ortu', 'parent', 'Parent'].includes(r))
  }, [userRoles])

  const isMusyrif = useMemo(() => {
    return userRoles.some((r) => ['Musyrif', 'Musyrifah', 'musyrif', 'musyrifah'].includes(r))
  }, [userRoles])

  const isGuru = useMemo(() => {
    return (
      userRoles.some((r) => ['Guru', 'Guru Tahfizh', 'Wali Kelas', 'guru', 'guru_tahfizh', 'wali_kelas'].includes(r)) ||
      (!isMusyrif && !isParent)
    )
  }, [userRoles, isMusyrif, isParent])

  const [kelases, setKelases] = useState([])
  const [selectedClassId, setSelectedClassId] = useState('')
  const [students, setStudents] = useState([])
  const [selectedStudentId, setSelectedStudentId] = useState('')

  // State View Mode ('guru' | 'musyrif' | 'ortu')
  const [viewMode, setViewMode] = useState(() => {
    if (isParent && !isSuperAdminOrAdmin) return 'ortu'
    if (isMusyrif && !isGuru) return 'musyrif'
    return 'guru'
  })

  // State Date (Start of week - Monday)
  const [currentMonday, setCurrentMonday] = useState(() => {
    const d = new Date()
    const day = d.getDay()
    const diff = d.getDate() - day + (day === 0 ? -6 : 1)
    const monday = new Date(d.setDate(diff))
    return monday.toISOString().split('T')[0]
  })

  // Framer Motion Animation Variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.06,
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

  // Student Display Helper (Safeguards all possible name property variations)
  const getStudentName = (s) => {
    if (!s) return 'Siswa'
    return (
      s.nama_lengkap ||
      s.nama ||
      s.full_name ||
      s.name ||
      s.student_name ||
      s.user?.name ||
      s.siswa?.nama_lengkap ||
      s.siswa?.nama ||
      'Siswa'
    )
  }

  const getStudentNis = (s) => {
    if (!s) return '-'
    return s.nis || s.nisn || s.siswa?.nis || s.siswa?.nisn || '-'
  }

  // Selected Day State for Day Selector Bar
  const [selectedDayDate, setSelectedDayDate] = useState('')

  // Today Date Helper
  const todayDateStr = useMemo(() => {
    const d = new Date()
    const year = d.getFullYear()
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }, [])

  const todayFormatted = useMemo(() => {
    const dayNamesIndo = ['Ahad', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu']
    const d = new Date()
    return `${dayNamesIndo[d.getDay()]}, ${todayDateStr}`
  }, [todayDateStr])

  // State Penilaian Hafalan Per Ayat pada Modal Master Qur'an
  const [showAyahPenilaianField, setShowAyahPenilaianField] = useState(false)
  const [activeAyahPenilaianMap, setActiveAyahPenilaianMap] = useState({})

  // Data Loading & Sheet State
  const [loadingSheet, setLoadingSheet] = useState(false)
  const [loadingStudents, setLoadingStudents] = useState(false)
  const [savingAll, setSavingAll] = useState(false)
  const [weeklySheet, setWeeklySheet] = useState([])
  const [summaryTeacherNotes, setSummaryTeacherNotes] = useState('')
  const [summaryParentNotes, setSummaryParentNotes] = useState('')
  const [studentProgress, setStudentProgress] = useState(null)

  // Toast Notification State
  const [notification, setNotification] = useState(null)

  // Confirmation Save Dialog State
  const [showSaveConfirm, setShowSaveConfirm] = useState(false)
  const [singleSaveIndex, setSingleSaveIndex] = useState(null)

  // Modal Pilih Siswa State
  const [showStudentModal, setShowStudentModal] = useState(false)
  const [studentModalSearch, setStudentModalSearch] = useState('')

  // Modal Detail Kelanjutan Tahfizh State
  const [showStudentDetailModal, setShowStudentDetailModal] = useState(false)
  const [detailStudentObj, setDetailStudentObj] = useState(null)
  const [detailStudentProgress, setDetailStudentProgress] = useState(null)
  const [loadingDetailProgress, setLoadingDetailProgress] = useState(false)

  // Rombel Student Datatable Search, Sort & Pagination State
  const [studentTableSearch, setStudentTableSearch] = useState('')
  const [studentSortOrder, setStudentSortOrder] = useState('hafalan_desc')
  const [studentPerPage, setStudentPerPage] = useState(5)
  const [studentCurrentPage, setStudentCurrentPage] = useState(1)

  // Print Option Modal State
  const [showPrintModal, setShowPrintModal] = useState(false)

  // Helper function to calculate Juz number from Surah Number
  const getJuzFromSurah = (surahNum) => {
    const s = Number(surahNum)
    if (s >= 78) return 30
    if (s >= 67) return 29
    if (s >= 58) return 28
    if (s >= 51) return 27
    if (s >= 46) return 26
    if (s >= 41) return 25
    if (s >= 39) return 24
    if (s >= 36) return 23
    if (s >= 33) return 22
    if (s >= 29) return 21
    if (s >= 27) return 20
    if (s >= 25) return 19
    if (s >= 23) return 18
    if (s >= 21) return 17
    if (s >= 18) return 16
    if (s >= 17) return 15
    if (s >= 15) return 14
    if (s >= 12) return 13
    if (s >= 11) return 12
    if (s >= 9) return 11
    if (s >= 8) return 10
    if (s >= 7) return 9
    if (s >= 6) return 8
    if (s >= 5) return 7
    if (s >= 4) return 6
    if (s >= 3) return 4
    if (s >= 2) return 2
    return 1
  }

  // Master Qur'an Data & Modal State
  const [quranSurahs, setQuranSurahs] = useState([])
  const [showQuranModal, setShowQuranModal] = useState(false)
  const [selectedRowIndex, setSelectedRowIndex] = useState(null)
  const [quranSearch, setQuranSearch] = useState('')
  const [quranInputMode, setQuranInputMode] = useState('interactive') // 'interactive' | 'manual'
  const [selectedJuzFilter, setSelectedJuzFilter] = useState('all') // 'all' or 1..30

  // Modal Quran State Form
  const [modalSurah, setModalSurah] = useState(null)
  const [modalAyahStart, setModalAyahStart] = useState(1)
  const [modalAyahEnd, setModalAyahEnd] = useState(10)
  const [modalBarisCount, setModalBarisCount] = useState(5)
  const [isAyahStartLocked, setIsAyahStartLocked] = useState(false)
  const [modalMurajaahRequired, setModalMurajaahRequired] = useState(false)
  const [studentPendingMurajaah, setStudentPendingMurajaah] = useState(null)
  const [modalAyatsList, setModalAyatsList] = useState([])
  const [loadingModalAyats, setLoadingModalAyats] = useState(false)

  // Modal Formulir Tahfizh & Murajaah Harian State
  const [showSheetModal, setShowSheetModal] = useState(false)

  // Audio Player State
  const [playingAudioUrl, setPlayingAudioUrl] = useState(null)
  const audioRef = useRef(null)
  const tableRef = useRef(null)

  const handleSelectStudentAndOpenModal = (sId) => {
    setSelectedStudentId(sId)
    setShowSheetModal(true)
  }

  const handleSelectStudentAndScroll = (sId) => {
    setSelectedStudentId(sId)
    setShowSheetModal(true)
    setTimeout(() => {
      if (tableRef.current) {
        tableRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
    }, 120)
  }

  // Live Audio Recording State (MediaRecorder)
  const [isRecording, setIsRecording] = useState(false)
  const [recordingRowIndex, setRecordingRowIndex] = useState(null)
  const [recordingSeconds, setRecordingSeconds] = useState(0)
  const [uploadingAudioRow, setUploadingAudioRow] = useState(null)
  const mediaRecorderRef = useRef(null)
  const audioChunksRef = useRef([])
  const timerIntervalRef = useRef(null)

  // Clear notification timer
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 4500)
      return () => clearTimeout(timer)
    }
  }, [notification])

  // Fetch Master Data Kelas & Qur'an pada mount (Scoped to teacher/musyrif assigned classes if restricted)
  useEffect(() => {
    const initMaster = async () => {
      try {
        const [kelasRes, surahRes] = await Promise.all([
          kelasService.getDaftar({ per_page: 100 }),
          equranService.getSurahs(),
        ])
        let kList = kelasRes?.data || []

        // If teacher / musyrif role is assigned specific classes in user object, scope classes
        if (!isSuperAdminOrAdmin && (user?.kelas_id || user?.assigned_classes || user?.teacher_classes)) {
          const assignedIds = Array.isArray(user?.assigned_classes)
            ? user.assigned_classes.map(String)
            : [String(user?.kelas_id || user?.teacher_classes || '')].filter(Boolean)

          if (assignedIds.length > 0) {
            const filteredK = kList.filter((k) => assignedIds.includes(String(k.id)))
            if (filteredK.length > 0) {
              kList = filteredK
            }
          }
        }

        setKelases(kList)
        if (kList.length > 0) {
          setSelectedClassId(kList[0].id)
        }
        setQuranSurahs(surahRes || [])
      } catch (e) {
        console.error('Error init master Tahfizh:', e)
      }
    }
    initMaster()
  }, [user, isSuperAdminOrAdmin])

  // Fetch Siswa saat Kelas berubah (Scoped to current selected Class / Rombel)
  useEffect(() => {
    if (!selectedClassId) return
    const fetchSiswa = async () => {
      setLoadingStudents(true)
      try {
        const res = await kelasService.getSiswaRombel(selectedClassId)
        const sList = res?.siswa || res?.data?.siswa || res?.data || (Array.isArray(res) ? res : [])
        setStudents(sList)
        if (sList.length > 0) {
          setSelectedStudentId(sList[0].id || sList[0].student_id)
        } else {
          setSelectedStudentId('')
          setWeeklySheet([])
          setStudentProgress(null)
        }
      } catch (e) {
        console.error('Error fetch siswa:', e)
        setStudents([])
        setSelectedStudentId('')
      } finally {
        setLoadingStudents(false)
      }
    }
    fetchSiswa()
  }, [selectedClassId])

  // Filtered Students list based on search inside Student Selection Modal
  const filteredStudentsInModal = useMemo(() => {
    if (!studentModalSearch.trim()) return students
    const q = studentModalSearch.toLowerCase()
    return students.filter((s) => {
      const name = (s.nama_lengkap || s.nama || s.full_name || s.name || '').toLowerCase()
      const nis = (s.nis || s.nisn || '').toLowerCase()
      return name.includes(q) || nis.includes(q)
    })
  }, [students, studentModalSearch])

  // Selected student object (Safeguard string ID conversion & fallback)
  const currentStudentObj = useMemo(() => {
    if (!students || students.length === 0) return null
    const found = students.find((s) => String(s.id || s.student_id) === String(selectedStudentId))
    return found || students[0] || null
  }, [students, selectedStudentId])

  // Selected class object
  const currentClassObj = useMemo(() => {
    return kelases.find((k) => String(k.id) === String(selectedClassId))
  }, [kelases, selectedClassId])

  // Helper default 7 hari pekanan (Senin s/d Ahad)
  const buildDefaultWeeklyDays = (mondayDateStr) => {
    const dayNames = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Ahad']
    const baseDate = mondayDateStr ? new Date(mondayDateStr) : new Date()
    return dayNames.map((dName, idx) => {
      const d = new Date(baseDate)
      d.setDate(baseDate.getDate() + idx)
      const dateStr = d.toISOString().split('T')[0]
      return {
        record_date: dateStr,
        day_name: dName,
        day_index: idx,
        tilawah_text: '',
        tilawah_baris: 0,
        hafalan_surah_number: null,
        hafalan_surah_name: '',
        hafalan_ayah_start: '',
        hafalan_ayah_end: '',
        hafalan_baris: 0,
        murajaah_text: '',
        murajaah_lembar: 0,
        audio_url: '',
        notes_teacher: '',
        notes_parent: '',
        signature_teacher: '',
        signature_parent: '',
        isSaved: false,
      }
    })
  }

  // Fetch Weekly Sheet & Progress saat Siswa atau Tanggal Minggu berubah
  const loadSheetAndProgress = async () => {
    if (!selectedStudentId) return
    setLoadingSheet(true)
    try {
      const [sheetData, progressData] = await Promise.all([
        tahfizhService.getWeeklySheet(selectedStudentId, currentMonday),
        tahfizhService.getStudentProgress(selectedStudentId),
      ])

      if (sheetData && sheetData.days && Array.isArray(sheetData.days) && sheetData.days.length > 0) {
        const mappedDays = sheetData.days.map((dayItem) => {
          const log = dayItem.log || {}
          return {
            record_date: dayItem.record_date,
            day_name: dayItem.day_name,
            day_index: dayItem.day_index,
            tilawah_text: log.tilawah_text || '',
            tilawah_baris: log.tilawah_baris || 0,
            hafalan_surah_number: log.hafalan_surah_number || null,
            hafalan_surah_name: log.hafalan_surah_name || '',
            hafalan_ayah_start: log.hafalan_ayah_start || '',
            hafalan_ayah_end: log.hafalan_ayah_end || '',
            hafalan_baris: log.hafalan_baris || 0,
            murajaah_text: log.murajaah_text || '',
            murajaah_lembar: log.murajaah_lembar || 0,
            audio_url: log.audio_url || '',
            notes_teacher: log.notes_teacher || '',
            notes_parent: log.notes_parent || '',
            signature_teacher: log.signature_teacher || '',
            signature_parent: log.signature_parent || '',
            isSaved: !!log.id,
          }
        })
        setWeeklySheet(mappedDays)
        setSummaryTeacherNotes(sheetData.notes_teacher_summary || '')
        setSummaryParentNotes(sheetData.notes_parent_summary || '')
      } else {
        setWeeklySheet(buildDefaultWeeklyDays(currentMonday))
      }

      setStudentProgress(progressData || null)
    } catch (e) {
      console.error('Error load weekly sheet:', e)
      setWeeklySheet(buildDefaultWeeklyDays(currentMonday))
      setNotification({ type: 'error', message: 'Gagal memuat data lembar mingguan tahfizh.' })
    } finally {
      setLoadingSheet(false)
    }
  }

  useEffect(() => {
    loadSheetAndProgress()
  }, [selectedStudentId, currentMonday])

  // Navigasi Minggu (Prev / Next)
  const handlePrevWeek = () => {
    const curr = new Date(currentMonday)
    curr.setDate(curr.getDate() - 7)
    setCurrentMonday(curr.toISOString().split('T')[0])
  }

  const handleNextWeek = () => {
    const curr = new Date(currentMonday)
    curr.setDate(curr.getDate() + 7)
    setCurrentMonday(curr.toISOString().split('T')[0])
  }

  // Handle Cell Change in Table
  const handleCellChange = (index, field, value) => {
    if (index === null || index === undefined || index < 0) return
    const updated = weeklySheet && weeklySheet.length > 0 ? [...weeklySheet] : buildDefaultWeeklyDays(currentMonday)
    if (!updated[index]) {
      const defaultDays = buildDefaultWeeklyDays(currentMonday)
      updated[index] = defaultDays[index] || {
        record_date: new Date().toISOString().split('T')[0],
        day_name: 'Senin',
        day_index: 0,
        tilawah_text: '',
        tilawah_baris: 0,
        hafalan_surah_number: null,
        hafalan_surah_name: '',
        hafalan_ayah_start: '',
        hafalan_ayah_end: '',
        hafalan_baris: 0,
        murajaah_text: '',
        murajaah_lembar: 0,
        audio_url: '',
        isSaved: false,
      }
    }
    updated[index][field] = value
    updated[index].isModified = true
    setWeeklySheet(updated)
  }

  // Open Qur'an Master Modal for Hafalan Baru selection
  const handleOpenQuranModal = (rowIndex) => {
    const idx = (rowIndex !== null && rowIndex !== undefined && rowIndex >= 0) ? rowIndex : 0
    setSelectedRowIndex(idx)
    const currentRow = weeklySheet && weeklySheet[idx] ? weeklySheet[idx] : null
    if (currentRow && currentRow.hafalan_surah_number) {
      const foundSurah = quranSurahs.find((s) => Number(s.nomor) === Number(currentRow.hafalan_surah_number))
      setModalSurah(foundSurah || quranSurahs[0] || null)
      setModalAyahStart(currentRow.hafalan_ayah_start || 1)
      setModalAyahEnd(currentRow.hafalan_ayah_end || (foundSurah ? foundSurah.jumlah_ayat : 7))
      setModalBarisCount(currentRow.hafalan_baris || 5)
    } else {
      setModalSurah(quranSurahs[0] || null)
      setModalAyahStart(1)
      setModalAyahEnd(7)
      setModalBarisCount(5)
    }
    setIsAyahStartLocked(false)
    setModalMurajaahRequired(false)
    setShowQuranModal(true)
  }

  // Apply Qur'an Selection & Assessment to Row
  const handleApplyQuranSelection = () => {
    if (selectedRowIndex === null || !modalSurah) return
    const updated = [...weeklySheet]
    updated[selectedRowIndex].hafalan_surah_number = modalSurah.nomor
    updated[selectedRowIndex].hafalan_surah_name = modalSurah.nama_latin || modalSurah.nama
    updated[selectedRowIndex].hafalan_ayah_start = Number(modalAyahStart)
    updated[selectedRowIndex].hafalan_ayah_end = Number(modalAyahEnd)
    updated[selectedRowIndex].hafalan_baris = Number(modalBarisCount)

    // Compile Penilaian Ayat Per Verses into row summary & notes
    const entries = Object.entries(activeAyahPenilaianMap)
    if (entries.length > 0) {
      let notesList = []
      let countMumtaz = 0
      let countJayyid = 0
      let countRasib = 0

      entries.forEach(([aNum, item]) => {
        if (item.predikat === 'mumtaz') countMumtaz++
        else if (item.predikat === 'jayyid') countJayyid++
        else if (item.predikat === 'rasib') countRasib++

        if (item.notes && item.notes.trim() !== '') {
          notesList.push(`Ayat ${aNum}: ${item.notes.trim()}`)
        }
      })

      let computedPredikat = 'Mumtaz'
      if (countRasib > 0) computedPredikat = 'Perlu Murajaah'
      else if (countJayyid > 0) computedPredikat = 'Jayyid'

      updated[selectedRowIndex].hafalan_predikat = computedPredikat
      updated[selectedRowIndex].hafalan_notes = notesList.join('; ')
    }

    updated[selectedRowIndex].murajaah_required = modalMurajaahRequired
    if (modalMurajaahRequired) {
      updated[selectedRowIndex].murajaah_required_surah_number = modalSurah.nomor
      updated[selectedRowIndex].murajaah_required_surah_name = modalSurah.nama_latin || modalSurah.nama
      updated[selectedRowIndex].murajaah_required_ayah_start = Number(modalAyahStart)
      updated[selectedRowIndex].murajaah_required_ayah_end = Number(modalAyahEnd)
      updated[selectedRowIndex].hafalan_predikat = 'Perlu Murajaah'
    }

    updated[selectedRowIndex].isModified = true
    setWeeklySheet(updated)
    setShowQuranModal(false)
  }

  // Handle Open Add Setoran Modal (Aktifkan pemilihan Juz, Surah, Ayat & Baris)
  const handleOpenAddSetoranModal = () => {
    if (!selectedStudentId) {
      setNotification({ type: 'warning', message: 'Silakan pilih siswa terlebih dahulu.' })
      return
    }
    const todayStr = new Date().toISOString().split('T')[0]
    let targetIndex = weeklySheet.findIndex((r) => r.record_date === todayStr)
    if (targetIndex === -1) {
      targetIndex = weeklySheet.findIndex((r) => !r.hafalan_surah_number)
    }
    if (targetIndex === -1) targetIndex = 0

    // Set default surah (Surah 78 An-Naba atau surah pertama) jika belum terisi
    const defaultSurah = quranSurahs.find((s) => Number(s.nomor) === 78) || quranSurahs[0]
    if (defaultSurah && !modalSurah) {
      setModalSurah(defaultSurah)
      setModalAyahStart(1)
      setModalAyahEnd(Math.min(10, defaultSurah.jumlah_ayat))
      setModalBarisCount(5)
    }

    handleOpenQuranModal(targetIndex)
  }

  // Handle Mengulangi Hafalan (Murajaah / Repeat Ziyadah Terakhir)
  const handleRepeatHafalan = () => {
    if (!selectedStudentId) {
      setNotification({ type: 'warning', message: 'Silakan pilih siswa terlebih dahulu.' })
      return
    }

    let lastFilledRow = null
    for (let i = weeklySheet.length - 1; i >= 0; i--) {
      if (weeklySheet[i].hafalan_surah_number) {
        lastFilledRow = weeklySheet[i]
        break
      }
    }

    if (!lastFilledRow) {
      setNotification({ type: 'warning', message: 'Belum ada data hafalan sebelumnya untuk diulangi.' })
      return
    }

    let targetRowIndex = weeklySheet.findIndex((r) => !r.hafalan_surah_number)
    if (targetRowIndex === -1) targetRowIndex = 0

    handleCellChange(targetRowIndex, 'hafalan_surah_number', lastFilledRow.hafalan_surah_number)
    handleCellChange(targetRowIndex, 'hafalan_surah_name', lastFilledRow.hafalan_surah_name)
    handleCellChange(targetRowIndex, 'hafalan_ayah_start', lastFilledRow.hafalan_ayah_start)
    handleCellChange(targetRowIndex, 'hafalan_ayah_end', lastFilledRow.hafalan_ayah_end)
    handleCellChange(targetRowIndex, 'hafalan_baris', lastFilledRow.hafalan_baris || 5)
    handleCellChange(targetRowIndex, 'murajaah_text', `Murajaah Mengulang: ${lastFilledRow.hafalan_surah_name} (Ayat ${lastFilledRow.hafalan_ayah_start}-${lastFilledRow.hafalan_ayah_end})`)

    handleOpenQuranModal(targetRowIndex)
    setNotification({
      type: 'success',
      message: `Mengulangi Hafalan (Murajaah): Memuat ${lastFilledRow.hafalan_surah_name} (Ayat ${lastFilledRow.hafalan_ayah_start} s/d ${lastFilledRow.hafalan_ayah_end})!`,
    })
  }

  // Handle Lanjutkan Hafalan Automatically (Authoritative from API & Auto-Lock Ayat Awal)
  const handleContinueHafalan = async () => {
    if (!selectedStudentId) {
      setNotification({ type: 'warning', message: 'Silakan pilih siswa terlebih dahulu.' })
      return
    }

    try {
      const data = await tahfizhService.getLastHafalan(selectedStudentId)
      if (!data) {
        setNotification({ type: 'error', message: 'Data kelanjutan hafalan tidak ditemukan.' })
        return
      }

      // Cek apakah ada tugas wajib Murajaah di Rumah yang belum selesai diverifikasi
      if (data.has_pending_murajaah && data.pending_murajaah_info) {
        const info = data.pending_murajaah_info
        setStudentPendingMurajaah(info)
        setNotification({
          type: 'warning',
          message: `Perhatian: Santri memiliki tugas Murajaah di Rumah yang belum diverifikasi: Surah ${info.surah_name} (Ayat ${info.ayah_start} - ${info.ayah_end}). Harap verifikasi setoran terlebih dahulu sebelum melanjutkan hafalan baru!`,
        })
        return
      }

      let targetRowIndex = weeklySheet.findIndex((r) => !r.hafalan_surah_number)
      if (targetRowIndex === -1) targetRowIndex = 0

      const targetSurah = quranSurahs.find((s) => Number(s.nomor) === Number(data.next_surah_number)) || quranSurahs[0]
      const nextAyahStart = Number(data.next_ayah_start || 1)
      const nextAyahEnd = Math.min(nextAyahStart + 9, targetSurah ? targetSurah.jumlah_ayat : 7)

      setModalSurah(targetSurah)
      setModalAyahStart(nextAyahStart)
      setModalAyahEnd(nextAyahEnd)
      setModalBarisCount(Math.max(1, Math.ceil((nextAyahEnd - nextAyahStart + 1) * 0.75)))
      setIsAyahStartLocked(true)
      setModalMurajaahRequired(false)

      setSelectedRowIndex(targetRowIndex)
      setShowQuranModal(true)

      setNotification({
        type: 'success',
        message: `Lanjutkan Hafalan: Surah ${targetSurah?.nama_latin || targetSurah?.nama} (Mulai Ayat ${nextAyahStart} s/d ${nextAyahEnd}) [Ayat Awal Terkunci Otomatis]`,
      })
    } catch (err) {
      console.error('Error fetching last hafalan:', err)
      setNotification({ type: 'error', message: 'Gagal memuat kelanjutan hafalan santri.' })
    }
  }

  // Open Modal Detail Kelanjutan Tahfizh Siswa
  const handleOpenDetailProgressModal = async (student) => {
    const sId = student.id || student.student_id
    setDetailStudentObj(student)
    setShowStudentDetailModal(true)
    setLoadingDetailProgress(true)
    try {
      const pData = await tahfizhService.getStudentProgress(sId)
      setDetailStudentProgress(pData)
    } catch (e) {
      console.error('Error get detail progress:', e)
    } finally {
      setLoadingDetailProgress(false)
    }
  }

  // Live Audio Recording logic via Browser MediaRecorder (Hanya untuk Orang Tua / Super Admin)
  const startRecording = async (rowIndex) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder
      audioChunksRef.current = []

      mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          audioChunksRef.current.push(event.data)
        }
      }

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' })
        const audioFile = new File([audioBlob], `murajaah_${Date.now()}.webm`, { type: 'audio/webm' })

        setUploadingAudioRow(rowIndex)
        try {
          const res = await tahfizhService.uploadAudio(audioFile)
          if (res && res.audio_url) {
            handleCellChange(rowIndex, 'audio_url', res.audio_url)
            setNotification({ type: 'success', message: 'Rekaman suara murajaah berhasil diunggah!' })
          }
        } catch (e) {
          console.error(e)
          setNotification({ type: 'error', message: 'Gagal mengunggah rekaman suara murajaah.' })
        } finally {
          setUploadingAudioRow(null)
        }

        stream.getTracks().forEach((track) => track.stop())
      }

      mediaRecorder.start()
      setIsRecording(true)
      setRecordingRowIndex(rowIndex)
      setRecordingSeconds(0)

      timerIntervalRef.current = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1)
      }, 1000)
    } catch (err) {
      console.error('Mic access error:', err)
      setNotification({ type: 'error', message: 'Akses mikrofon ditolak atau tidak didukung oleh perangkat ini.' })
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
      setRecordingRowIndex(null)
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current)
      }
    }
  }

  // Handle File Upload Audio Murajaah (Manual)
  const handleAudioUpload = async (index, file) => {
    if (!file) return
    setUploadingAudioRow(index)
    try {
      const res = await tahfizhService.uploadAudio(file)
      if (res && res.audio_url) {
        handleCellChange(index, 'audio_url', res.audio_url)
        setNotification({ type: 'success', message: 'File rekaman suara murajaah terunggah!' })
      }
    } catch (e) {
      console.error(e)
      setNotification({ type: 'error', message: 'Gagal mengunggah file rekaman suara.' })
    } finally {
      setUploadingAudioRow(null)
    }
  }

  // Play / Pause Audio Recording
  const handlePlayAudio = (url) => {
    if (!url) return
    if (playingAudioUrl === url && audioRef.current) {
      audioRef.current.pause()
      setPlayingAudioUrl(null)
      return
    }

    if (audioRef.current) {
      audioRef.current.pause()
    }

    const apiBase = import.meta.env.VITE_API_BASE_URL || ''
    const backendOrigin = apiBase ? apiBase.replace(/\/api\/?$/, '') : ''
    const fullUrl = typeof url === 'string' && url.startsWith('http')
      ? url
      : `${backendOrigin}${url && !url.startsWith('/') ? '/' : ''}${url || ''}`
    const newAudio = new Audio(fullUrl)
    newAudio.play()
    audioRef.current = newAudio
    setPlayingAudioUrl(url)

    newAudio.onended = () => {
      setPlayingAudioUrl(null)
    }
  }

  // Confirm Save Single Day or All Weekly
  const promptSaveConfirmation = (index = null) => {
    if (!selectedStudentId) {
      setNotification({ type: 'warning', message: 'Silakan pilih siswa terlebih dahulu.' })
      return
    }
    setSingleSaveIndex(index)
    setShowSaveConfirm(true)
  }

  // Execute Save Action
  const handleConfirmSave = async () => {
    setShowSaveConfirm(false)
    if (singleSaveIndex !== null) {
      const index = singleSaveIndex
      const row = weeklySheet[index]
      try {
        const payload = {
          student_id: selectedStudentId,
          class_id: selectedClassId,
          record_date: row.record_date,
          day_name: row.day_name,
          tilawah_text: row.tilawah_text,
          tilawah_baris: Number(row.tilawah_baris) || 0,
          hafalan_surah_number: row.hafalan_surah_number ? Number(row.hafalan_surah_number) : null,
          hafalan_surah_name: row.hafalan_surah_name,
          hafalan_ayah_start: row.hafalan_ayah_start ? Number(row.hafalan_ayah_start) : null,
          hafalan_ayah_end: row.hafalan_ayah_end ? Number(row.hafalan_ayah_end) : null,
          hafalan_baris: Number(row.hafalan_baris) || 0,
          murajaah_required: !!row.murajaah_required,
          murajaah_required_surah_number: row.murajaah_required_surah_number ? Number(row.murajaah_required_surah_number) : null,
          murajaah_required_surah_name: row.murajaah_required_surah_name || null,
          murajaah_required_ayah_start: row.murajaah_required_ayah_start ? Number(row.murajaah_required_ayah_start) : null,
          murajaah_required_ayah_end: row.murajaah_required_ayah_end ? Number(row.murajaah_required_ayah_end) : null,
          murajaah_required: !!row.murajaah_required,
          murajaah_required_surah_number: row.murajaah_required_surah_number ? Number(row.murajaah_required_surah_number) : null,
          murajaah_required_surah_name: row.murajaah_required_surah_name || null,
          murajaah_required_ayah_start: row.murajaah_required_ayah_start ? Number(row.murajaah_required_ayah_start) : null,
          murajaah_required_ayah_end: row.murajaah_required_ayah_end ? Number(row.murajaah_required_ayah_end) : null,
          murajaah_text: row.murajaah_text,
          murajaah_lembar: Number(row.murajaah_lembar) || 0,
          audio_url: row.audio_url,
          notes_teacher: summaryTeacherNotes,
          notes_parent: summaryParentNotes,
          signature_teacher: row.signature_teacher || 'Guru Verified',
          signature_parent: row.signature_parent || 'Ortu Verified',
        }

        await tahfizhService.saveDailyLog(payload)
        const updated = [...weeklySheet]
        updated[index].isSaved = true
        updated[index].isModified = false
        setWeeklySheet(updated)

        const pData = await tahfizhService.getStudentProgress(selectedStudentId)
        setStudentProgress(pData)

        setNotification({
          type: 'success',
          message: `Data Tahfizh hari ${row.day_name} (${row.record_date}) berhasil disimpan!`,
        })
      } catch (e) {
        console.error(e)
        setNotification({ type: 'error', message: e.response?.data?.message || 'Gagal menyimpan data log harian.' })
      }
    } else {
      setSavingAll(true)
      try {
        const savePromises = weeklySheet.map((row) => {
          const payload = {
            student_id: selectedStudentId,
            class_id: selectedClassId,
            record_date: row.record_date,
            day_name: row.day_name,
            tilawah_text: row.tilawah_text,
            tilawah_baris: Number(row.tilawah_baris) || 0,
            hafalan_surah_number: row.hafalan_surah_number ? Number(row.hafalan_surah_number) : null,
            hafalan_surah_name: row.hafalan_surah_name,
            hafalan_ayah_start: row.hafalan_ayah_start ? Number(row.hafalan_ayah_start) : null,
            hafalan_ayah_end: row.hafalan_ayah_end ? Number(row.hafalan_ayah_end) : null,
            hafalan_baris: Number(row.hafalan_baris) || 0,
            murajaah_text: row.murajaah_text,
            murajaah_lembar: Number(row.murajaah_lembar) || 0,
            audio_url: row.audio_url,
            notes_teacher: summaryTeacherNotes,
            notes_parent: summaryParentNotes,
            signature_teacher: 'Guru Verified',
            signature_parent: 'Ortu Verified',
          }
          return tahfizhService.saveDailyLog(payload)
        })

        await Promise.all(savePromises)
        await loadSheetAndProgress()

        setNotification({
          type: 'success',
          message: 'Seluruh lembar data Tahfizh pekan ini berhasil disimpan!',
        })
      } catch (e) {
        console.error(e)
        setNotification({ type: 'error', message: 'Gagal menyimpan seluruh lembar mingguan.' })
      } finally {
        setSavingAll(false)
      }
    }
  }

  // Filtered Quran list for modal (Search + Juz Filter)
  const filteredQuranSurahs = useMemo(() => {
    let list = quranSurahs

    if (selectedJuzFilter !== 'all') {
      const juzNum = Number(selectedJuzFilter)
      list = list.filter((s) => getJuzFromSurah(s.nomor) === juzNum)
    }

    if (quranSearch) {
      const q = quranSearch.toLowerCase()
      list = list.filter(
        (s) =>
          s.nama_latin?.toLowerCase().includes(q) ||
          s.arti?.toLowerCase().includes(q) ||
          String(s.nomor).includes(q)
      )
    }
    return list
  }, [quranSurahs, quranSearch, selectedJuzFilter])

  // Fetch detail ayat Al-Qur'an untuk pratinjau teks Arab & Latin saat surah terpilih
  useEffect(() => {
    if (!modalSurah) {
      setModalAyatsList([])
      return
    }
    let isMounted = true
    const fetchAyats = async () => {
      setLoadingModalAyats(true)
      try {
        const res = await equranService.getSurahDetail(modalSurah.nomor || modalSurah.id)
        if (isMounted && res && res.ayat) {
          setModalAyatsList(res.ayat)
        }
      } catch (e) {
        console.error('Error fetch ayats for preview:', e)
      } finally {
        if (isMounted) setLoadingModalAyats(false)
      }
    }
    fetchAyats()
    return () => {
      isMounted = false
    }
  }, [modalSurah])

  // Filtered Ayats for selected range (Ayat Awal s/d Ayat Akhir)
  const filteredSelectedAyats = useMemo(() => {
    if (!modalAyatsList || modalAyatsList.length === 0) return []
    const start = Number(modalAyahStart || 1)
    const end = Number(modalAyahEnd || modalAyatsList.length)
    return modalAyatsList.filter((a) => {
      const no = Number(a.nomor_ayat || a.nomorAyat || a.ayat)
      return no >= start && no <= end
    })
  }, [modalAyatsList, modalAyahStart, modalAyahEnd])

  // Filtered & Sorted Rombel Students for datatable
  const filteredStudents = useMemo(() => {
    let result = [...students]

    if (studentTableSearch) {
      const q = studentTableSearch.toLowerCase()
      result = result.filter(
        (st) =>
          (st.nama_lengkap || st.nama || st.full_name || st.name || '').toLowerCase().includes(q) ||
          String(st.nis || st.nisn || '').includes(q)
      )
    }

    result.sort((a, b) => {
      const aAyat = Number(a.total_ayats_memorized || a.total_ayat || 0)
      const bAyat = Number(b.total_ayats_memorized || b.total_ayat || 0)
      const aName = (a.nama_lengkap || a.nama || a.full_name || a.name || '').toLowerCase()
      const bName = (b.nama_lengkap || b.nama || b.full_name || b.name || '').toLowerCase()

      if (studentSortOrder === 'hafalan_desc') {
        return bAyat - aAyat
      } else if (studentSortOrder === 'hafalan_asc') {
        return aAyat - bAyat
      } else if (studentSortOrder === 'name_asc') {
        return aName.localeCompare(bName)
      } else if (studentSortOrder === 'name_desc') {
        return bName.localeCompare(aName)
      }
      return 0
    })

    return result
  }, [students, studentTableSearch, studentSortOrder])

  // Paginated Rombel Students for Datatable
  const totalStudentPages = useMemo(() => {
    if (studentPerPage === 'all' || !studentPerPage) return 1
    return Math.ceil(filteredStudents.length / studentPerPage) || 1
  }, [filteredStudents, studentPerPage])

  const paginatedStudents = useMemo(() => {
    if (studentPerPage === 'all' || !studentPerPage) return filteredStudents
    const start = (studentCurrentPage - 1) * Number(studentPerPage)
    return filteredStudents.slice(start, start + Number(studentPerPage))
  }, [filteredStudents, studentCurrentPage, studentPerPage])

  // Sort students by total ayats memorized for Leaderboard & Best Student Card
  const topStudentsRanked = useMemo(() => {
    if (!students || students.length === 0) return []
    return [...students].sort((a, b) => {
      const aAyat = Number(a.total_ayats_memorized || a.total_ayat || 0)
      const bAyat = Number(b.total_ayats_memorized || b.total_ayat || 0)
      return bAyat - aAyat
    })
  }, [students])

  const bestStudent = useMemo(() => {
    return topStudentsRanked.length > 0 ? topStudentsRanked[0] : null
  }, [topStudentsRanked])

  // Export CSV Data Rekap Tahfizh
  const handleExportCsv = () => {
    const headers = [
      'No',
      'Nama Siswa',
      'NIS',
      'Total Ayat Dihafal',
      'Total Surah Dihafal',
      'Surah Terakhir',
      'Ayat Terakhir',
      'Progres 30 Juz (%)',
      'Predikat Nilai',
    ]

    const csvRows = [
      headers.join(','),
      ...filteredStudents.map((st, idx) => {
        const totalAyat = Number(st.total_ayats_memorized || st.total_ayat || 0)
        const totalSurah = Number(st.total_surahs_memorized || st.total_surah || 0)
        const lastSurah = st.hafalan_surah_terakhir || st.last_surah_name || st.last_surah || '-'
        const lastAyah = st.hafalan_ayat_terakhir || st.last_ayah || '-'
        const progressPct = Number(st.progress_percentage || (totalAyat > 0 ? Math.min(100, Math.round((totalAyat / 6236) * 100 * 10) / 10) : 0))
        const predikatLabel = progressPct >= 80 ? 'Mumtaz (A)' : progressPct >= 50 ? 'Jayyid Jiddan (B)' : progressPct > 0 ? 'Jayyid (C)' : 'Belum Ada'

        return [
          idx + 1,
          `"${(st.nama_lengkap || st.nama || st.full_name || st.name || 'Siswa').replace(/"/g, '""')}"`,
          `"${st.nis || st.nisn || '-'}"`,
          totalAyat,
          totalSurah,
          `"${lastSurah.replace(/"/g, '""')}"`,
          `"${lastAyah.replace(/"/g, '""')}"`,
          progressPct,
          `"${predikatLabel.replace(/"/g, '""')}"`,
        ].join(',')
      }),
    ]

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + csvRows.join('\n')
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', `Export_Tahfizh_${(currentClassObj?.nama_kelas || 'Rombel').replace(/\s+/g, '_')}_${currentMonday}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    setNotification({ type: 'success', message: 'Data rekap Tahfizh berhasil diexport ke berkas CSV!' })
  }

  // Print Table In-Place Clean (hidden iframe)
  const handlePrintTable = () => {
    const headers = [
      'No',
      'Nama Siswa / Santri',
      'NIS',
      'Total Ayat',
      'Total Surah',
      'Surah Terakhir',
      'Ayat Terakhir',
      'Progres 30 Juz',
      'Predikat',
    ]

    const rows = filteredStudents.map((st, idx) => {
      const totalAyat = Number(st.total_ayats_memorized || st.total_ayat || 0)
      const totalSurah = Number(st.total_surahs_memorized || st.total_surah || 0)
      const lastSurah = st.hafalan_surah_terakhir || st.last_surah_name || st.last_surah || (totalAyat > 0 ? 'Surah Terdaftar' : 'Belum Ada Setoran')
      const lastAyah = st.hafalan_ayat_terakhir || st.last_ayah || (totalAyat > 0 ? 'Ayat Aktif' : '-')
      const progressPct = Number(st.progress_percentage || (totalAyat > 0 ? Math.min(100, Math.round((totalAyat / 6236) * 100 * 10) / 10) : 0))
      const predikatLabel = progressPct >= 80 ? 'Mumtaz (A)' : progressPct >= 50 ? 'Jayyid Jiddan (B)' : progressPct > 0 ? 'Jayyid (C)' : 'Belum Ada'

      return [
        idx + 1,
        st.nama_lengkap || st.nama || st.full_name || st.name || 'Siswa',
        st.nis || st.nisn || '-',
        `${totalAyat.toLocaleString('id-ID')} Ayat`,
        `${totalSurah} Surah`,
        lastSurah,
        lastAyah,
        `${progressPct}%`,
        predikatLabel,
      ]
    })

    printCleanTable({
      title: `Pencapaian & Rekap Tahfizh Siswa (${currentClassObj?.nama_kelas || 'Rombel'})`,
      subtitle: `Unit Pendidikan Sekolah Terpadu - Periode Pekan Senin, ${currentMonday}`,
      headers,
      rows,
    })
    setShowPrintModal(false)
  }

  // Download PDF Table
  const handleDownloadPdfTable = () => {
    const headers = [
      'No',
      'Nama Siswa / Santri',
      'NIS',
      'Total Ayat',
      'Total Surah',
      'Surah Terakhir',
      'Ayat Terakhir',
      'Progres 30 Juz',
      'Predikat',
    ]

    const rows = filteredStudents.map((st, idx) => {
      const totalAyat = Number(st.total_ayats_memorized || st.total_ayat || 0)
      const totalSurah = Number(st.total_surahs_memorized || st.total_surah || 0)
      const lastSurah = st.hafalan_surah_terakhir || st.last_surah_name || st.last_surah || (totalAyat > 0 ? 'Surah Terdaftar' : 'Belum Ada Setoran')
      const lastAyah = st.hafalan_ayat_terakhir || st.last_ayah || (totalAyat > 0 ? 'Ayat Aktif' : '-')
      const progressPct = Number(st.progress_percentage || (totalAyat > 0 ? Math.min(100, Math.round((totalAyat / 6236) * 100 * 10) / 10) : 0))
      const predikatLabel = progressPct >= 80 ? 'Mumtaz (A)' : progressPct >= 50 ? 'Jayyid Jiddan (B)' : progressPct > 0 ? 'Jayyid (C)' : 'Belum Ada'

      return [
        idx + 1,
        st.nama_lengkap || st.nama || st.full_name || st.name || 'Siswa',
        st.nis || st.nisn || '-',
        `${totalAyat.toLocaleString('id-ID')} Ayat`,
        `${totalSurah} Surah`,
        lastSurah,
        lastAyah,
        `${progressPct}%`,
        predikatLabel,
      ]
    })

    downloadPdfTable({
      title: `Pencapaian & Rekap Tahfizh Siswa (${currentClassObj?.nama_kelas || 'Rombel'})`,
      subtitle: `Unit Pendidikan Sekolah Terpadu - Periode Pekan Senin, ${currentMonday}`,
      headers,
      rows,
      filename: `Rekap_Tahfizh_${(currentClassObj?.nama_kelas || 'Rombel').replace(/\s+/g, '_')}_${currentMonday}.pdf`,
    })
    setShowPrintModal(false)
  }

  if (isParent && !isSuperAdminOrAdmin) {
    return <Navigate to="/portal-orangtua" replace />
  }

  return (
    <PageContainer maxW="7xl" className="space-y-6 pb-12">
      <motion.div initial="hidden" animate="visible" variants={containerVariants} className="space-y-6">
        {/* 🧭 APP BREADCRUMB (§W) */}
        <motion.div variants={itemVariants} className="print:hidden">
          <AppBreadcrumb items={breadcrumbItems} />
        </motion.div>

        {/* MODERN HERO CARD HEADER (§B / §7.7) */}
        <motion.div variants={itemVariants} className="print:hidden">
          <div className="relative overflow-hidden rounded-[22px] border-2 border-emerald-500/30 bg-gradient-to-r from-emerald-500/15 via-teal-500/10 to-emerald-600/15 p-4 sm:p-6 shadow-md shadow-emerald-500/10 dark:border-emerald-600/40 dark:bg-gradient-to-r dark:from-emerald-950/70 dark:via-teal-950/50 dark:to-slate-900">
            <div className="pointer-events-none absolute -top-20 -right-20 h-56 w-56 rounded-full bg-gradient-to-br from-emerald-500/40 via-teal-400/30 to-emerald-600/20 blur-3xl dark:from-emerald-500/50 dark:via-teal-400/40" />
            <div className="pointer-events-none absolute -bottom-20 -left-20 h-56 w-56 rounded-full bg-gradient-to-tr from-emerald-600/30 via-teal-500/20 to-transparent blur-3xl dark:from-emerald-600/40 dark:via-teal-500/30" />

            <div className="relative z-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-3.5 sm:gap-4 min-w-0">
                <div className="flex size-11 sm:size-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700 text-white shadow-xl shadow-emerald-600/40 border border-emerald-300/40 dark:from-emerald-400 dark:via-emerald-500 dark:to-teal-600">
                  <BookOpen className="size-5 sm:size-7 text-white" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 sm:gap-2.5 flex-wrap">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-emerald-600 to-teal-600 px-3 py-0.5 sm:px-3.5 sm:py-1 text-[11px] sm:text-xs font-extrabold text-white shadow-md shadow-emerald-600/25 border border-emerald-300/40">
                      <Sparkles className="size-3 sm:size-3.5 text-amber-300 animate-pulse" />
                      Manajemen Tahfizh & Murajaah
                    </span>
                    <span className="inline-flex items-center rounded-full bg-emerald-100 px-3 py-0.5 text-xs font-bold text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/60">
                      30 Juz Al-Qur'an
                    </span>
                  </div>
                  <h1 className="mt-1.5 text-lg sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                    Setoran Tahfizh & Murajaah Santri
                  </h1>
                  <p className="mt-0.5 sm:mt-1 text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-300 max-w-2xl leading-relaxed">
                    Pencatatan ziyadah hafalan baru, murajaah pekanan, target 30 juz Al-Qur'an, dan rekapitulasi nilai santri per rombel.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0 self-start sm:self-center">
                <button
                  type="button"
                  onClick={() => window.location.reload()}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-300 dark:border-emerald-700 bg-white/80 dark:bg-emerald-950/60 hover:bg-emerald-50 dark:hover:bg-emerald-900/60 px-3.5 py-2 text-xs font-bold text-emerald-800 dark:text-emerald-200 shadow-xs transition-colors cursor-pointer"
                >
                  <RefreshCcw className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>Segarkan</span>
                </button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* 🧭 SUB NAVIGATION TABS */}
        <motion.div variants={itemVariants} className="print:hidden">
          <TahfizhSubNav />
        </motion.div>

        {/* Progress KPI Cards Siswa / Rombel (Di bawah Breadcrumbs) */}
        <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <ModernKpiCard
            title="Total Dihafal"
            tag="HAFALAN TERCAPAI"
            tone="emerald"
            icon={BookOpen}
            value={`${(studentProgress?.total_ayats_memorized || 0).toLocaleString('id-ID')} Ayat`}
            subtext={`${studentProgress?.total_surahs_memorized || 0} Surah Dihafal`}
          />

          <ModernKpiCard
            title="Sisa Belum Dihafal"
            tag="TARGET SISA"
            tone="amber"
            icon={Clock}
            value={`${(studentProgress?.remaining_ayats || 6236).toLocaleString('id-ID')} Ayat`}
            subtext={`Sisa ${studentProgress?.remaining_surahs || 114} Surah Lagi`}
          />

          <ModernKpiCard
            title="Persentase Target"
            tag="TARGET 30 JUZ"
            tone="blue"
            icon={Award}
            value={`${studentProgress?.progress_percentage || 0}%`}
            subtext="Dari Total 6.236 Ayat Al-Qur'an"
          />

          <ModernKpiCard
            title="Progres 30 Juz"
            tag="STATUS TARGET"
            tone="purple"
            icon={Sparkles}
          >
            <div className="space-y-2 mt-0.5">
              <div className="flex justify-between items-center text-xs font-bold text-slate-700 dark:text-slate-200">
                <span>Progres Keseluruhan</span>
                <span className="text-purple-600 dark:text-purple-400 font-extrabold">{studentProgress?.progress_percentage || 0}%</span>
              </div>
              <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden p-0.5 border border-slate-200 dark:bg-slate-800 dark:border-slate-700">
                <div
                  className="bg-gradient-to-r from-emerald-500 via-teal-500 to-purple-600 h-full rounded-full transition-all duration-500"
                  style={{ width: `${studentProgress?.progress_percentage || 0}%` }}
                />
              </div>
              <p className="text-[11px] text-slate-400 font-medium">Target Lengkap 114 Surah</p>
            </div>
          </ModernKpiCard>
        </motion.div>

      {/* Toast Notification Stack (§L) */}
      {notification && (
        <ToastStack
          items={[{ id: 'tahfizh-toast', type: notification.type, message: notification.message }]}
          onDismiss={() => setNotification(null)}
        />
      )}

      {/* 🏆 CARD KELOMPOK: PERINGKAT HAFALAN TERBANYAK & SISWA TERBAIK PEKAN INI */}
      {(isGuru || isMusyrif || isSuperAdminOrAdmin) && students.length > 0 && (
        <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Card 1: ⭐ Siswa Terbaik / Hafiz Teladan Pekan Ini */}
          <Card className="relative overflow-hidden rounded-[22px] border-2 border-emerald-300 bg-white p-5 sm:p-6 shadow-md shadow-emerald-500/10 dark:border-emerald-700/80 dark:bg-[#1B2433] flex flex-col justify-between gap-4">
            <div className="pointer-events-none absolute -top-10 -right-10 h-32 w-32 rounded-full bg-amber-400/10 blur-2xl dark:bg-amber-400/15" />
            <div className="flex items-center justify-between gap-3 border-b border-emerald-200/90 pb-3.5 dark:border-emerald-800/60">
              <div className="flex items-center gap-3">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 via-amber-500 to-orange-600 text-white shadow-sm border border-amber-300/40">
                  <Crown className="size-5" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-black text-slate-900 dark:text-white">Siswa Terbaik / Hafiz Teladan Pekan Ini</h3>
                  <p className="text-[11px] text-slate-500 font-medium dark:text-slate-400">
                    Siswa dengan capaian hafalan Al-Qur'an tertinggi di rombel ini.
                  </p>
                </div>
              </div>
              <AppBadge variant="warning" size="sm">Top #1 Rombel</AppBadge>
            </div>

            {bestStudent ? (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white/90 p-4 rounded-2xl border border-amber-200/60 shadow-sm dark:bg-slate-900/80 dark:border-amber-900/40">
                <div className="flex items-center gap-3.5">
                  <div className="relative">
                    <Avatar size="xl" status="online">
                      <AvatarFallback className="bg-amber-100 text-amber-900 font-black text-lg dark:bg-amber-950 dark:text-amber-200">
                        {getStudentName(bestStudent).charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="absolute -top-2 -right-1 p-1 bg-amber-500 text-white rounded-full shadow-md">
                      <Award className="w-3.5 h-3.5" />
                    </div>
                  </div>

                  <div>
                    <div className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                      <span>{getStudentName(bestStudent)}</span>
                    </div>
                    <div className="text-xs text-slate-500 font-medium mt-0.5">
                      NIS: {getStudentNis(bestStudent)} · Rombel: {currentClassObj?.nama_kelas || 'Kelas'}
                    </div>
                    <div className="mt-1.5 flex items-center gap-2">
                      <Badge color="success" size="sm">
                        Predikat: Mumtaz (A)
                      </Badge>
                      <Badge color="cyan" size="sm">
                        Progres: {bestStudent.progress_percentage || 0}%
                      </Badge>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-2 text-right shrink-0">
                  <div className="text-xs text-slate-500 font-semibold">Total Capaian:</div>
                  <div className="text-lg font-black text-emerald-900 dark:text-emerald-300">
                    {Number(bestStudent.total_ayats_memorized || bestStudent.total_ayat || 0).toLocaleString('id-ID')}{' '}
                    <span className="text-xs font-bold text-emerald-600">Ayat</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MasterActionButton variant="view" icon={Eye} onClick={() => handleOpenDetailProgressModal(bestStudent)}>
                      <span>Pencapaian & Progres</span>
                      <ArrowRight className="size-3.5" />
                    </MasterActionButton>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-6 text-center text-slate-400 text-xs font-medium">Belum ada siswa terdaftar di rombel ini.</div>
            )}
          </Card>

          {/* Card 2: 🏆 Urutan Siswa Hafalan Terbanyak (Top Leaderboard) */}
          <Card className="relative overflow-hidden rounded-[22px] border-2 border-emerald-300 bg-white p-5 sm:p-6 shadow-md shadow-emerald-500/10 dark:border-emerald-700/80 dark:bg-[#1B2433] flex flex-col justify-between gap-4">
            <div className="pointer-events-none absolute -top-10 -right-10 h-32 w-32 rounded-full bg-emerald-400/10 blur-2xl dark:bg-emerald-400/15" />
            <div className="flex items-center justify-between gap-3 border-b border-emerald-200/90 pb-3.5 dark:border-emerald-800/60">
              <div className="flex items-center gap-3">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700 text-white shadow-sm border border-emerald-300/40">
                  <TrendingUp className="size-5" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-black text-slate-900 dark:text-white">Urutan Siswa Hafalan Terbanyak</h3>
                  <p className="text-[11px] text-slate-500 font-medium dark:text-slate-400">
                    Peringkat 5 siswa dengan hafalan terbanyak di {currentClassObj?.nama_kelas || 'Rombel'}.
                  </p>
                </div>
              </div>

              <AppBadge variant="success" size="sm">
                Leaderboard Rombel
              </AppBadge>
            </div>

            <div className="space-y-2.5">
              {topStudentsRanked.slice(0, 5).map((st, rIdx) => {
                const sId = st.id || st.student_id
                const ayatCount = Number(st.total_ayats_memorized || st.total_ayat || 0)
                const surahCount = Number(st.total_surahs_memorized || st.total_surah || 0)
                const isSelected = sId === selectedStudentId

                const rankBg =
                  rIdx === 0
                    ? 'bg-amber-100 text-amber-900 border-amber-300 dark:bg-amber-950 dark:text-amber-200'
                    : rIdx === 1
                    ? 'bg-slate-200 text-slate-800 border-slate-300 dark:bg-slate-800 dark:text-slate-200'
                    : rIdx === 2
                    ? 'bg-orange-100 text-orange-900 border-orange-300 dark:bg-orange-950 dark:text-orange-200'
                    : 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800/60 dark:text-slate-400'

                return (
                  <div
                    key={sId}
                    onClick={() => handleOpenDetailProgressModal(st)}
                    className={`p-2.5 rounded-xl border transition-all flex items-center justify-between gap-3 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 ${
                      isSelected ? 'bg-sky-50/80 border-sky-300 dark:bg-sky-950/40' : 'bg-slate-50/50 border-slate-200/60 dark:bg-slate-900/40 dark:border-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className={`w-7 h-7 rounded-xl font-black text-xs flex items-center justify-center border shrink-0 ${rankBg}`}>
                        #{rIdx + 1}
                      </span>

                      <Avatar size="xs" status={isSelected ? 'online' : 'offline'}>
                        <AvatarFallback className="bg-emerald-100 text-emerald-900 font-extrabold text-[10px] dark:bg-emerald-950 dark:text-emerald-200">
                          {getStudentName(st).charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>

                      <div className="min-w-0">
                        <div className="text-xs font-extrabold text-slate-900 dark:text-white truncate">
                          {getStudentName(st)}
                        </div>
                        <div className="text-[11px] text-slate-500">
                          NIS: {getStudentNis(st)}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <div className="text-right">
                        <div className="text-xs font-black text-emerald-900 dark:text-emerald-400">
                          {ayatCount.toLocaleString('id-ID')} <span className="text-[10px] text-emerald-600 font-bold">Ayat</span>
                        </div>
                        <div className="text-[10px] text-slate-400 font-medium">
                          {surahCount} Surah
                        </div>
                      </div>

                      <MasterActionIconButton
                        variant="view"
                        label="Lihat Detail Pencapaian & Progres"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleOpenDetailProgressModal(st)
                        }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </Card>
        </motion.div>
      )}

      {/* 📊 MASTER DATA TABLE: PENCAAPAIAN & REKAP SISWA ROMBEL GURU / MUSYRIF / KEPSEK */}
      {(isGuru || isMusyrif || isSuperAdminOrAdmin) && (
        <motion.div variants={itemVariants}>
          <Card className="relative overflow-hidden rounded-[22px] border-2 border-emerald-300 bg-white shadow-md shadow-emerald-500/10 dark:border-emerald-700/80 dark:bg-[#1B2433]">
          <div className="pointer-events-none absolute -top-10 -right-10 h-32 w-32 rounded-full bg-emerald-400/10 blur-2xl dark:bg-emerald-400/15" />
          {/* Header Baris 1: Title & Mode Switcher */}
          <CardHeader className="bg-gradient-to-r from-emerald-500/10 via-teal-500/5 to-transparent border-b border-emerald-200/90 dark:border-emerald-800/60 px-4 py-3.5 sm:px-6 md:px-8 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700 text-white shrink-0 shadow-sm border border-emerald-300/40">
                <GraduationCap className="size-5" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <CardTitle className="text-sm sm:text-base font-black text-slate-900 dark:text-white">
                    <span>Pencapaian & Rekap Siswa Rombel ({currentClassObj?.nama_kelas || 'Rombel Saya'})</span>
                  </CardTitle>
                  <AppBadge variant="success" size="sm">
                    Total {students.length} Siswa
                  </AppBadge>
                </div>
                <CardDescription className="text-xs font-medium text-slate-600 dark:text-slate-300 mt-0.5">
                  Daftar rincian hafalan, jumlah ayat, surah terakhir, progres 30 juz, dan predikat nilai seluruh siswa di rombel ini.
                </CardDescription>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2.5 shrink-0 self-start lg:self-auto">
              {/* Mode Switcher */}
              <div className="bg-slate-100/90 p-1.5 rounded-2xl border border-slate-200/90 flex items-center gap-1.5 dark:bg-slate-900 dark:border-slate-800 shadow-inner" role="tablist" aria-label="Mode tampilan">
                {(isGuru || isSuperAdminOrAdmin) && (
                  <button
                    type="button"
                    role="tab"
                    aria-selected={viewMode === 'guru'}
                    onClick={() => setViewMode('guru')}
                    className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all duration-200 flex items-center gap-1.5 hover:scale-105 active:scale-95 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/40 ${
                      viewMode === 'guru' ? 'bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700 text-white border border-emerald-300/40 shadow-md shadow-emerald-600/25' : 'text-slate-700 hover:bg-slate-200 dark:text-slate-300'
                    }`}
                  >
                    <UserCheck className="w-3.5 h-3.5" />
                    <span>Mode Guru</span>
                  </button>
                )}
                {(isMusyrif || isSuperAdminOrAdmin) && (
                  <button
                    type="button"
                    role="tab"
                    aria-selected={viewMode === 'musyrif'}
                    onClick={() => setViewMode('musyrif')}
                    className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all duration-200 flex items-center gap-1.5 hover:scale-105 active:scale-95 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500/40 ${
                      viewMode === 'musyrif' ? 'bg-gradient-to-br from-teal-500 via-teal-600 to-emerald-700 text-white border border-teal-300/40 shadow-md shadow-teal-600/25' : 'text-slate-700 hover:bg-slate-200 dark:text-slate-300'
                    }`}
                  >
                    <UserCheck className="w-3.5 h-3.5" />
                    <span>Mode Musyrif</span>
                  </button>
                )}
                {(isParent || isSuperAdminOrAdmin) && (
                  <button
                    type="button"
                    role="tab"
                    aria-selected={viewMode === 'ortu'}
                    onClick={() => setViewMode('ortu')}
                    className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all duration-200 flex items-center gap-1.5 hover:scale-105 active:scale-95 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/40 ${
                      viewMode === 'ortu' ? 'bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700 text-white border border-emerald-300/40 shadow-md shadow-emerald-600/25' : 'text-slate-700 hover:bg-slate-200 dark:text-slate-300'
                    }`}
                  >
                    <Heart className="w-3.5 h-3.5" />
                    <span>Mode Ortu</span>
                  </button>
                )}
              </div>
            </div>
          </CardHeader>

          {/* Header Baris 2: Integrated Context Controls (1. Pilih Rombel, 2. Pilih Siswa, 3. Periode Pekan) */}
          <div className="px-4 py-3 sm:px-6 md:px-8 bg-gradient-to-r from-emerald-50/50 via-teal-50/30 to-emerald-50/50 border-b border-emerald-200/80 dark:from-emerald-950/20 dark:via-teal-950/10 dark:to-emerald-950/20 dark:border-emerald-800/60">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
              {/* 1. Pilih Kelas / Rombel */}
              <div className="space-y-1.5">
                <label className="block text-[11px] font-extrabold text-slate-700 uppercase tracking-wider dark:text-slate-300">
                  1. Pilih Kelas / Rombel:
                </label>
                <div className="relative">
                  <select
                    value={selectedClassId}
                    onChange={(e) => setSelectedClassId(e.target.value)}
                    className="w-full h-10 appearance-none px-3.5 pr-9 bg-white border border-emerald-200 rounded-xl text-xs font-bold text-slate-800 focus:ring-2 focus:ring-emerald-500 transition-all cursor-pointer dark:bg-slate-900 dark:text-slate-200 dark:border-slate-700"
                  >
                    {kelases.map((k) => (
                      <option key={k.id} value={k.id}>
                        {k.nama_kelas || k.nama || `Kelas ${k.id}`}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                </div>
              </div>

              {/* 2. Pilih Siswa / Santri */}
              <div className="space-y-1.5">
                <label className="block text-[11px] font-extrabold text-slate-700 uppercase tracking-wider dark:text-slate-300">
                  2. Pilih Siswa / Santri:
                </label>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-10 px-3 bg-white border border-emerald-200 rounded-xl text-xs font-bold text-slate-800 flex items-center gap-2 truncate dark:bg-slate-900 dark:border-slate-700 dark:text-slate-200">
                    <Avatar size="xs" status={currentStudentObj ? 'online' : 'offline'}>
                      <AvatarFallback className="bg-emerald-100 text-emerald-800 font-extrabold text-[10px] dark:bg-emerald-950 dark:text-emerald-300">
                        {getStudentName(currentStudentObj).charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span className="truncate">
                      {currentStudentObj
                        ? `${getStudentName(currentStudentObj)} (NIS: ${getStudentNis(currentStudentObj)})`
                        : 'Belum Memilih Siswa'}
                    </span>
                  </div>

                  <MasterActionButton variant="primary" icon={Users} onClick={() => setShowStudentModal(true)}>
                    <span>Pilih Siswa</span>
                  </MasterActionButton>
                </div>
              </div>

              {/* 3. Periode Pekan (Senin - Ahad) */}
              <div className="space-y-1.5">
                <label className="block text-[11px] font-extrabold text-slate-700 uppercase tracking-wider dark:text-slate-300">
                  3. Periode Pekan (Senin - Ahad):
                </label>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={handlePrevWeek}
                    aria-label="Pekan sebelumnya"
                    className="flex size-9 items-center justify-center rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-all duration-150 active:scale-95 cursor-pointer"
                  >
                    <ChevronLeft className="size-5 shrink-0" />
                  </button>
                  <div className="flex-1 h-10 text-center bg-white border border-emerald-200 px-3 rounded-xl text-xs font-extrabold text-emerald-900 flex items-center justify-center gap-2 dark:bg-slate-900 dark:text-emerald-300 dark:border-slate-700">
                    <Calendar className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Senin, {currentMonday}</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleNextWeek}
                    aria-label="Pekan selanjutnya"
                    className="flex size-9 items-center justify-center rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-all duration-150 active:scale-95 cursor-pointer"
                  >
                    <ChevronRight className="size-5 shrink-0" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Header Baris 3: Vivid Gradient Squircle Action Buttons (§H.5) */}
          <div className="px-4 py-3 sm:px-6 md:px-8 bg-white border-b border-emerald-200/80 dark:bg-[#1B2433] dark:border-emerald-800/60 flex flex-wrap items-center justify-between gap-3">
            <div className="text-xs font-extrabold text-slate-700 dark:text-slate-300 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              <span>Aksi Datatable & Setoran Pekanan:</span>
            </div>

            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2.5 shrink-0">
              <SquircleActionButton variant="import" icon={Upload} label="Import Data Tahfizh" onClick={() => setNotification({ type: 'warning', message: 'Fitur Import Log Tahfizh dapat diakses via menu Import Master Data.' })} />
              <SquircleActionButton variant="export" icon={Download} label="Export Data (CSV)" onClick={handleExportCsv} />
              <SquircleActionButton variant="view" icon={Printer} label="Cetak Data / PDF" onClick={() => setShowPrintModal(true)} />
              <SquircleActionButton variant="primary" label="Tambah Setoran Tahfizh" onClick={handleOpenAddSetoranModal} />
              <SquircleActionButton variant="violet" icon={Sparkles} label="Lanjutkan Hafalan Otomatis" onClick={handleContinueHafalan} />
              <SquircleActionButton variant="edit" icon={RefreshCcw} label="Mengulangi Tahfizh (Murajaah)" onClick={handleRepeatHafalan} />
            </div>
          </div>

          {/* Header Baris 4: Search Bar, Sort Order & Limit Dropdown Filters */}
          <div className="px-4 py-3 sm:px-6 md:px-8 bg-gradient-to-r from-emerald-50/50 via-teal-50/30 to-emerald-50/50 border-b border-emerald-200/80 dark:from-emerald-950/20 dark:via-teal-950/10 dark:to-emerald-950/20 dark:border-emerald-800/60 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
            {/* Input Search */}
            <div className="relative flex-1 max-w-md flex items-center">
              <div className="pointer-events-none absolute left-3.5 sm:left-4 flex items-center text-emerald-600/70 dark:text-emerald-400">
                <Search className="size-4" />
              </div>
              <input
                type="text"
                value={studentTableSearch}
                aria-label="Cari siswa berdasarkan nama atau NIS"
                onChange={(e) => {
                  setStudentTableSearch(e.target.value)
                  setStudentCurrentPage(1)
                }}
                placeholder="Cari siswa berdasarkan nama atau NIS..."
                className="h-10 sm:h-11 w-full rounded-2xl border border-emerald-200/90 bg-white pl-10 sm:pl-11 pr-4 text-xs font-semibold text-slate-800 outline-none transition-all placeholder:text-slate-400 focus:border-[#0E5C44] focus:ring-4 focus:ring-[#0E5C44]/12 dark:border-emerald-800/70 dark:bg-slate-900 dark:text-slate-100"
              />
            </div>

            {/* Filter Dropdowns (Sortir & PerPage) */}
            <div className="flex flex-wrap items-center gap-3">
              {/* Dropdown Sortir Hafalan */}
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 whitespace-nowrap">Urutkan:</span>
                <div className="relative">
                  <select
                    value={studentSortOrder}
                    onChange={(e) => {
                      setStudentSortOrder(e.target.value)
                      setStudentCurrentPage(1)
                    }}
                    className="h-9 px-3 pr-8 appearance-none bg-white border border-emerald-200/80 rounded-xl text-xs font-bold text-slate-800 focus:border-[#0E5C44] focus:outline-none focus:ring-2 focus:ring-[#0E5C44]/20 cursor-pointer dark:bg-slate-900 dark:text-slate-200 dark:border-emerald-800/70"
                  >
                    <option value="hafalan_desc">🏆 Hafalan Terbanyak → Terendah</option>
                    <option value="hafalan_asc">📉 Hafalan Terendah → Terbanyak</option>
                    <option value="name_asc">🔤 Nama Siswa (A - Z)</option>
                    <option value="name_desc">🔤 Nama Siswa (Z - A)</option>
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                </div>
              </div>

              {/* Dropdown PerPage Limit (5, 10, 15, 25, 50, 100, All) */}
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 whitespace-nowrap">Tampilkan:</span>
                <div className="relative">
                  <select
                    value={studentPerPage}
                    onChange={(e) => {
                      const val = e.target.value === 'all' ? 'all' : Number(e.target.value)
                      setStudentPerPage(val)
                      setStudentCurrentPage(1)
                    }}
                    className="h-9 px-3 pr-8 appearance-none bg-white border border-emerald-200/80 rounded-xl text-xs font-bold text-slate-800 focus:border-[#0E5C44] focus:outline-none focus:ring-2 focus:ring-[#0E5C44]/20 cursor-pointer dark:bg-slate-900 dark:text-slate-200 dark:border-emerald-800/70"
                  >
                    <option value={5}>5 Data</option>
                    <option value={10}>10 Data</option>
                    <option value={15}>15 Data</option>
                    <option value={25}>25 Data</option>
                    <option value={50}>50 Data</option>
                    <option value={100}>100 Data</option>
                    <option value="all">Semua Data</option>
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                </div>
              </div>
            </div>
          </div>

          <CardContent className="p-0">
            {loadingStudents ? (
              <div className="p-6">
                <AppSkeleton variant="table" rows={5} cols={4} />
              </div>
            ) : filteredStudents.length === 0 ? (
              <div className="p-6">
                <AppEmptyState
                  title="Belum ada siswa terdaftar"
                  description={studentTableSearch ? 'Tidak ada siswa yang sesuai dengan kata kunci pencarian.' : 'Belum ada siswa terdaftar di rombel ini.'}
                  actionLabel={studentTableSearch ? 'Reset Pencarian' : undefined}
                  onAction={studentTableSearch ? () => { setStudentTableSearch(''); setStudentCurrentPage(1) } : undefined}
                />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <TableRoot fullBleed={false}>
                  <TableHeader className="bg-gradient-to-r from-emerald-100/80 via-teal-50/60 to-emerald-100/80 border-b border-emerald-200/80 dark:from-emerald-950/80 dark:via-teal-950/60 dark:to-emerald-950/80 dark:border-emerald-900/50">
                    <TableRow>
                      <TableHead className="px-4 py-2.5 text-center font-black text-[11px] uppercase tracking-wider text-emerald-950 dark:text-emerald-200 w-12">No</TableHead>
                      <TableHead className="px-4 py-2.5 font-black text-[11px] uppercase tracking-wider text-emerald-950 dark:text-emerald-200">
                        <div className="flex items-center gap-1.5">
                          <span>Siswa / Santri</span>
                          <ArrowUpDown className="h-3 w-3 shrink-0" />
                        </div>
                      </TableHead>
                      <TableHead className="hidden lg:table-cell px-4 py-2.5 font-black text-[11px] uppercase tracking-wider text-emerald-950 dark:text-emerald-200">
                        <div className="flex items-center gap-1.5">
                          <span>Jumlah Hafalan</span>
                          <ArrowUpDown className="h-3 w-3 shrink-0" />
                        </div>
                      </TableHead>
                      <TableHead className="hidden md:table-cell px-4 py-2.5 font-black text-[11px] uppercase tracking-wider text-emerald-950 dark:text-emerald-200">Hafalan Terakhir (Ziyadah)</TableHead>
                      <TableHead className="px-4 py-2.5 font-black text-[11px] uppercase tracking-wider text-emerald-950 dark:text-emerald-200 text-center">Progres 30 Juz</TableHead>
                      <TableHead className="hidden lg:table-cell px-4 py-2.5 font-black text-[11px] uppercase tracking-wider text-emerald-950 dark:text-emerald-200 text-center">Predikat / Nilai</TableHead>
                      <TableHead className="px-4 py-2.5 font-black text-[11px] uppercase tracking-wider text-emerald-950 dark:text-emerald-200 text-center">Status</TableHead>
                    </TableRow>
                  </TableHeader>

                  <TableBody className="divide-y divide-emerald-100/80 dark:divide-emerald-900/40">
                    {paginatedStudents.map((st, sIdx) => {
                      const sId = st.id || st.student_id
                      const isSelected = sId === selectedStudentId
                      const realIndex = studentPerPage === 'all'
                        ? sIdx + 1
                        : (studentCurrentPage - 1) * Number(studentPerPage) + sIdx + 1

                      const totalAyat = Number(st.total_ayats_memorized || st.total_ayat || 0)
                      const totalSurah = Number(st.total_surahs_memorized || st.total_surah || 0)
                      const lastSurah = st.hafalan_surah_terakhir || st.last_surah_name || st.last_surah || (totalAyat > 0 ? 'Surah Terdaftar' : 'Belum Ada Setoran')
                      const lastAyah = st.hafalan_ayat_terakhir || st.last_ayah || (totalAyat > 0 ? 'Ayat Aktif' : '-')
                      const progressPct = Number(st.progress_percentage || (totalAyat > 0 ? Math.min(100, Math.round((totalAyat / 6236) * 100 * 10) / 10) : 0))
                      const predikatLabel = progressPct >= 80 ? 'Mumtaz (A)' : progressPct >= 50 ? 'Jayyid Jiddan (B)' : progressPct > 0 ? 'Jayyid (C)' : 'Belum Ada'
                      const predikatColor = progressPct >= 80 ? 'success' : progressPct >= 50 ? 'cyan' : progressPct > 0 ? 'warning' : 'gray'

                      return (
                        <TableRow
                          key={sId}
                          onClick={() => handleSelectStudentAndScroll(sId)}
                          className={`transition-colors hover:bg-emerald-50/40 cursor-pointer dark:hover:bg-emerald-950/20 ${
                            isSelected ? 'bg-emerald-50/80 dark:bg-emerald-950/40 font-semibold' : ''
                          }`}
                        >
                          {/* No */}
                          <TableCell className="px-4 py-3.5 text-center font-extrabold text-slate-700 tabular-nums dark:text-slate-300">
                            {realIndex}
                          </TableCell>

                          {/* Siswa / Santri dengan Floating Hover Card */}
                          <TableCell className="px-4 py-3.5 align-top sm:align-middle">
                            <div className="flex items-center gap-3">
                              <Avatar size="sm" status={isSelected ? 'online' : 'offline'}>
                                <AvatarFallback className="bg-emerald-100 text-emerald-900 font-extrabold text-xs dark:bg-emerald-950 dark:text-emerald-200">
                                  {(st.nama_lengkap || st.nama || st.full_name || st.name || 'S').charAt(0).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <div className="min-w-0">
                                <div className="text-xs font-extrabold text-slate-900 dark:text-white flex items-center gap-2 line-clamp-2">
                                  <span className="hover:text-emerald-600 hover:underline transition-colors truncate">{st.nama_lengkap || st.nama || st.full_name || st.name || 'Siswa'}</span>
                                  {isSelected && <Badge color="success" size="sm">Aktif</Badge>}
                                </div>
                                <div className="text-[11px] text-slate-500 font-mono line-clamp-1 mt-0.5">
                                  NIS: {st.nis || st.nisn || '-'}
                                </div>
                              </div>
                            </div>
                            {/* Mobile Compact Metadata Row (§7.5) */}
                            <div className="sm:hidden mt-2 flex flex-wrap items-center gap-1.5 pt-1.5 border-t border-emerald-100/80 dark:border-emerald-900/40">
                              <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300 tabular-nums">
                                {totalAyat.toLocaleString('id-ID')} Ayat
                              </span>
                              <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-500/10 text-emerald-600">
                                {progressPct}%
                              </span>
                            </div>

                            {/* 🌟 FLOATING HOVER CARD PREVIEW DATA SISWA & AVATAR */}
                            <div className="pointer-events-none absolute left-12 top-full mt-1 z-50 w-72 opacity-0 scale-95 transition-all duration-200 ease-out group-hover/student:opacity-100 group-hover/student:scale-100 group-hover/student:pointer-events-auto">
                              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-2xl dark:border-slate-800 dark:bg-slate-900 space-y-3 ring-1 ring-slate-900/5">
                                <div className="flex items-center gap-3 border-b border-slate-100 pb-3 dark:border-slate-800">
                                  <Avatar size="md" status={isSelected ? 'online' : 'offline'}>
                                    <AvatarFallback className="bg-emerald-600 text-white font-extrabold text-sm">
                                      {(st.nama_lengkap || st.nama || 'S').charAt(0).toUpperCase()}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div className="min-w-0 flex-1">
                                    <div className="text-xs font-black text-slate-900 dark:text-white truncate">
                                      {st.nama_lengkap || st.nama || st.full_name || st.name}
                                    </div>
                                    <div className="text-[11px] text-emerald-600 font-bold dark:text-emerald-400">
                                      NIS: {st.nis || st.nisn || '-'}
                                    </div>
                                    <div className="text-[10px] text-slate-400 font-medium">
                                      Rombel: {currentClassObj?.nama_kelas || 'Kelas Rombel'}
                                    </div>
                                  </div>
                                </div>

                                {/* Rincian Hafalan Preview */}
                                <div className="grid grid-cols-2 gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-100 text-[11px] dark:bg-slate-800/60 dark:border-slate-800">
                                  <div>
                                    <span className="text-slate-400 block text-[10px]">Total Hafalan:</span>
                                    <span className="font-extrabold text-emerald-700 dark:text-emerald-400">{totalAyat.toLocaleString('id-ID')} Ayat</span>
                                  </div>
                                  <div>
                                    <span className="text-slate-400 block text-[10px]">Total Surah:</span>
                                    <span className="font-extrabold text-indigo-700 dark:text-indigo-400">{totalSurah} Surah</span>
                                  </div>
                                </div>

                                <div className="space-y-1">
                                  <div className="flex items-center justify-between text-[11px] font-bold">
                                    <span className="text-slate-500">Progres 30 Juz:</span>
                                    <span className="text-indigo-600 dark:text-indigo-400">{progressPct}%</span>
                                  </div>
                                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden p-0.5 border border-slate-200 dark:bg-slate-800">
                                    <div
                                      className="bg-gradient-to-r from-emerald-500 to-indigo-600 h-full rounded-full"
                                      style={{ width: `${Math.max(4, progressPct)}%` }}
                                    />
                                  </div>
                                </div>

                                <div className="flex items-center justify-between text-[11px] pt-1 border-t border-slate-100 dark:border-slate-800">
                                  <span className="text-slate-400 font-medium">Surah Terakhir:</span>
                                  <span className="font-extrabold text-slate-800 dark:text-slate-200 truncate max-w-[120px]">{lastSurah} ({lastAyah})</span>
                                </div>
                              </div>
                            </div>
                          </TableCell>

                          {/* Jumlah Hafalan */}
                          <TableCell className="hidden lg:table-cell px-4 py-3.5 align-middle">
                            <div className="text-xs font-extrabold text-emerald-900 dark:text-emerald-400 tabular-nums">
                              {totalAyat.toLocaleString('id-ID')} <span className="text-[11px] font-bold text-emerald-700">Ayat</span>
                            </div>
                            <div className="text-[11px] text-slate-500 font-medium">
                              {totalSurah} Surah Dihafal
                            </div>
                          </TableCell>

                          {/* Hafalan Terakhir */}
                          <TableCell className="hidden md:table-cell px-4 py-3.5 align-middle">
                            <div className="text-xs font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5">
                              <BookOpen className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                              <span className="truncate">{lastSurah}</span>
                            </div>
                            <div className="text-[11px] text-slate-500 font-medium">
                              Ayat {lastAyah}
                            </div>
                          </TableCell>

                          {/* Progres 30 Juz */}
                          <TableCell className="px-4 py-3.5 text-center align-middle">
                            <div className="flex flex-col gap-1 items-center">
                              <span className="text-xs font-black text-indigo-700 dark:text-indigo-400 tabular-nums">{progressPct}%</span>
                              <div className="w-24 bg-slate-100 h-2 rounded-full overflow-hidden p-0.5 border border-slate-200 dark:bg-slate-800 dark:border-slate-700">
                                <div
                                  className="bg-gradient-to-r from-emerald-500 to-indigo-600 h-full rounded-full transition-all duration-500"
                                  style={{ width: `${Math.max(4, progressPct)}%` }}
                                />
                              </div>
                            </div>
                          </TableCell>

                          {/* Predikat / Nilai */}
                          <TableCell className="hidden lg:table-cell px-4 py-3.5 text-center align-middle">
                            <Badge color={predikatColor} size="sm" className="font-extrabold">
                              {predikatLabel}
                            </Badge>
                          </TableCell>

                          {/* Status */}
                          <TableCell className="px-4 py-3.5 text-center align-middle">
                            {isSelected ? (
                              <Badge color="success" size="sm">Sedang Input</Badge>
                            ) : (
                              <Badge color="gray" size="sm">Tersimpan</Badge>
                            )}
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </TableRoot>
              </div>
            )}
          </CardContent>

          {/* Footer Pagination (§7.6) */}
          {filteredStudents.length > 0 && studentPerPage !== 'all' && (
            <div className="border-t border-emerald-200/80 bg-gradient-to-r from-emerald-50/40 via-white to-emerald-50/40 p-3.5 sm:px-6 md:px-8 py-3 sm:py-3.5 dark:border-emerald-800/60 dark:from-emerald-950/20 dark:via-transparent dark:to-emerald-950/20 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 text-center sm:text-left">
                Menampilkan <span className="font-semibold text-slate-700 dark:text-slate-200">{filteredStudents.length}</span> dari <span className="font-semibold text-slate-700 dark:text-slate-200">{students.length}</span> santri
              </div>
              <div className="flex items-center justify-center gap-2">
                <Pagination
                  currentPage={studentCurrentPage}
                  totalPages={totalStudentPages}
                  onPageChange={setStudentCurrentPage}
                  sideLayout="icon"
                  variant="default"
                />
              </div>
            </div>
          )}
        </Card>
        </motion.div>
      )}
      </motion.div>





      {/* MODAL POPUP SELECTION SISWA */}
      {showStudentModal && (
        <Backdrop isOpen={showStudentModal} onOpenChange={setShowStudentModal} className="z-[70] bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-3 sm:p-5">
          <Dialog showCloseButton={false} className="max-w-2xl w-full h-[80vh] max-h-[80vh] flex flex-col rounded-3xl border border-slate-200/80 bg-white p-0 shadow-2xl shadow-emerald-950/20 overflow-hidden dark:border-slate-800 dark:bg-[#182232] dark:shadow-black/60">
            <div className="h-1.5 bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-600 shrink-0" />
            <DialogHeader className="flex items-center justify-between border-b border-slate-100 bg-white px-6 py-4.5 dark:border-slate-800 dark:bg-slate-950 shrink-0">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 sm:h-11 sm:w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700 text-white shadow-md shadow-emerald-500/20 border border-emerald-300/30">
                  <Users className="h-5 w-5 text-white" strokeWidth={2.25} />
                </div>
                <div>
                  <DialogTitle className="text-sm sm:text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                    <span>Pilih Siswa / Santri - {currentClassObj?.nama_kelas || 'Kelas Rombel'}</span>
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-800 border border-emerald-200/80 dark:bg-emerald-950/60 dark:text-emerald-400 dark:border-emerald-800/60">
                      <Sparkles className="size-3" />
                      {filteredStudentsInModal.length} Siswa
                    </span>
                  </DialogTitle>
                  <DialogDescription className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Pilih siswa untuk mengelola log setoran hafalan & murajaah harian atau lihat kelanjutan tahfizh.
                  </DialogDescription>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowStudentModal(false)}
                aria-label="Tutup modal"
                className="size-9 flex items-center justify-center rounded-2xl bg-gradient-to-br from-rose-500 via-rose-600 to-red-700 text-white hover:scale-105 active:scale-95 transition-all duration-200 shadow-md shadow-rose-500/20 cursor-pointer shrink-0"
              >
                <X className="size-4 text-white" strokeWidth={2.25} />
              </button>
            </DialogHeader>

            <DialogBody className="p-5 sm:p-6 space-y-4 flex-1 overflow-y-auto min-h-0">
              <div className="relative flex items-center">
                <div className="pointer-events-none absolute left-3.5 flex items-center text-emerald-600/70 dark:text-emerald-400">
                  <Search className="size-4" />
                </div>
                <input
                  type="text"
                  value={studentModalSearch}
                  onChange={(e) => setStudentModalSearch(e.target.value)}
                  placeholder="Cari nama siswa atau NIS..."
                  aria-label="Cari siswa dalam modal"
                  className="w-full rounded-2xl border border-emerald-200/90 bg-white pl-10 pr-4 py-2 text-xs font-semibold text-slate-800 outline-none transition-all placeholder:text-slate-400 focus:border-[#0E5C44] focus:ring-4 focus:ring-[#0E5C44]/12 dark:border-emerald-800/70 dark:bg-slate-900 dark:text-slate-100"
                />
              </div>

              <div className="max-h-80 overflow-y-auto space-y-2.5 pr-1">
                {loadingStudents ? (
                  <AppSkeleton variant="list" rows={4} />
                ) : filteredStudentsInModal.length === 0 ? (
                  <AppEmptyState
                    title="Tidak ada siswa ditemukan"
                    description="Tidak ada siswa ditemukan pada rombel ini."
                  />
                ) : (
                  filteredStudentsInModal.map((s) => {
                    const sId = s.id || s.student_id
                    const isSelected = sId === selectedStudentId
                    const sName = getStudentName(s)
                    const sNis = getStudentNis(s)
                    return (
                      <div
                        key={sId}
                        className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                          isSelected
                            ? 'bg-emerald-50 border-emerald-300 ring-2 ring-emerald-500/20 dark:bg-emerald-950/40 dark:border-emerald-800'
                            : 'bg-white hover:bg-slate-50 border-slate-200/80 dark:bg-slate-900 dark:border-slate-800 dark:hover:bg-slate-800/60'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          <Avatar size="md" status={isSelected ? 'online' : 'offline'}>
                            <AvatarFallback className="bg-emerald-600 text-white font-extrabold shadow-sm">
                              {sName.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>

                          <div className="min-w-0 flex-1">
                            <div className="text-xs font-extrabold text-slate-900 dark:text-white truncate">
                              {sName}
                            </div>
                            <div className="text-[11px] text-slate-500 flex items-center gap-2 mt-0.5">
                              <span>NIS: {sNis}</span>
                              <span>•</span>
                              <span>{s.nama_kelas || currentClassObj?.nama_kelas || 'Kelas'}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <Button
                            type="button"
                            variant="ghost"
                            appearance="outline"
                            size="xs"
                            onClick={() => handleOpenDetailProgressModal(s)}
                            className="font-extrabold text-sky-700 border-sky-300 bg-sky-50 hover:bg-sky-100 dark:bg-sky-950 dark:text-sky-300 dark:border-sky-800"
                            title="Lihat Kelanjutan Tahfizh Siswa Ini"
                          >
                            <Eye className="w-3.5 h-3.5 mr-1" />
                            <span>Kelanjutan Tahfizh</span>
                          </Button>

                          <Button
                            type="button"
                            variant={isSelected ? 'success' : 'primary'}
                            appearance="fill"
                            size="xs"
                            onClick={() => {
                              setSelectedStudentId(sId)
                              setShowStudentModal(false)
                              setShowSheetModal(true)
                            }}
                            className="font-extrabold"
                          >
                            {isSelected ? 'Terpilih' : 'Pilih Siswa'}
                          </Button>
                        </div>
                      </div>
                    )
                  })
                )}
              </div>
            </DialogBody>

            <DialogFooter className="flex flex-wrap items-center justify-between gap-2.5 border-t border-slate-100 bg-slate-50/50 px-6 py-4 dark:border-slate-800 dark:bg-slate-900/40">
              <span className="text-xs font-semibold text-slate-400 dark:text-slate-500">
                Total {filteredStudentsInModal.length} Siswa Terdaftar
              </span>
              <button
                type="button"
                onClick={() => setShowStudentModal(false)}
                className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-br from-rose-500 via-rose-600 to-red-700 text-white px-4 py-2.5 text-xs font-extrabold border border-rose-300/40 transition-all duration-200 hover:scale-[1.03] active:scale-95 cursor-pointer"
              >
                <div className="flex size-5 items-center justify-center rounded-lg bg-white/20 text-white">
                  <X className="size-3.5 text-white" strokeWidth={2.2} />
                </div>
                <span>Tutup Modal</span>
              </button>
            </DialogFooter>
          </Dialog>
        </Backdrop>
      )}

      {/* MODAL POPUP DETAIL KELANJUTAN TAHFIZH SISWA */}
      {showStudentDetailModal && detailStudentObj && (
        <Backdrop isOpen={showStudentDetailModal} onOpenChange={setShowStudentDetailModal} className="z-[70] bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-3 sm:p-5">
          <Dialog className="max-w-xl w-full rounded-3xl overflow-hidden shadow-2xl shadow-emerald-950/20 dark:shadow-black/60 border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-[#182232]">
            <div className="h-1.5 bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-600 shrink-0" />
            <DialogHeader className="flex items-center justify-between border-b border-slate-100 bg-white px-6 py-4.5 dark:border-slate-800 dark:bg-slate-950">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 sm:h-11 sm:w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700 text-white shadow-md shadow-emerald-500/20 border border-emerald-300/30">
                  <BookOpenCheck className="h-5 w-5 text-white" strokeWidth={2.25} />
                </div>
                <div>
                  <DialogTitle className="text-sm sm:text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                    <span className="truncate">Detail Pencapaian: {getStudentName(detailStudentObj)}</span>
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-800 border border-emerald-200/80 dark:bg-emerald-950/60 dark:text-emerald-400 dark:border-emerald-800/60 shrink-0">
                      <Sparkles className="size-3" />
                      Progres
                    </span>
                  </DialogTitle>
                  <DialogDescription className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Siswa: <strong className="font-bold">{getStudentName(detailStudentObj)}</strong> · NIS: {getStudentNis(detailStudentObj)} · Rombel: {currentClassObj?.nama_kelas || 'Kelas'}
                  </DialogDescription>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowStudentDetailModal(false)}
                aria-label="Tutup modal"
                className="size-9 flex items-center justify-center rounded-2xl bg-gradient-to-br from-rose-500 via-rose-600 to-red-700 text-white hover:scale-105 active:scale-95 transition-all duration-200 shadow-md shadow-rose-500/20 cursor-pointer shrink-0"
              >
                <X className="size-4 text-white" strokeWidth={2.25} />
              </button>
            </DialogHeader>

            <DialogBody className="p-6 space-y-4">
              <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-200 flex items-center gap-3.5 dark:bg-emerald-950/40 dark:border-emerald-900">
                <Avatar size="lg" status="online">
                  <AvatarFallback className="bg-emerald-700 text-white font-black text-lg">
                    {getStudentName(detailStudentObj).charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h4 className="text-sm font-extrabold text-slate-900 dark:text-white">
                    {getStudentName(detailStudentObj)}
                  </h4>
                  <div className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                    NIS: {getStudentNis(detailStudentObj)} • Rombel: {currentClassObj?.nama_kelas || 'Kelas'}
                  </div>
                </div>
              </div>

              {loadingDetailProgress ? (
                <AppSkeleton variant="card" className="h-32" />
              ) : detailStudentProgress ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-3">
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-center dark:bg-slate-900 dark:border-slate-800">
                      <div className="text-[10px] text-slate-400 font-bold uppercase">Total Dihafal</div>
                      <div className="text-base font-extrabold text-emerald-700 dark:text-emerald-400 mt-1">
                        {detailStudentProgress.total_ayats_memorized || 0} <span className="text-[10px]">Ayat</span>
                      </div>
                      <div className="text-[10px] text-slate-500">{detailStudentProgress.total_surahs_memorized || 0} Surah</div>
                    </div>

                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-center dark:bg-slate-900 dark:border-slate-800">
                      <div className="text-[10px] text-slate-400 font-bold uppercase">Sisa Target</div>
                      <div className="text-base font-extrabold text-amber-700 dark:text-amber-400 mt-1">
                        {detailStudentProgress.remaining_ayats || 0} <span className="text-[10px]">Ayat</span>
                      </div>
                      <div className="text-[10px] text-slate-500">{detailStudentProgress.remaining_surahs || 0} Surah Sisa</div>
                    </div>

                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-center dark:bg-slate-900 dark:border-slate-800">
                      <div className="text-[10px] text-slate-400 font-bold uppercase">Progres Target</div>
                      <div className="text-base font-extrabold text-cyan-700 dark:text-cyan-400 mt-1">
                        {detailStudentProgress.progress_percentage || 0}%
                      </div>
                      <div className="text-[10px] text-slate-500">Dari 30 Juz</div>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-xs font-extrabold text-slate-700 dark:text-slate-200">
                      <span>Kelanjutan Hafalan 30 Juz</span>
                      <span className="text-emerald-600 dark:text-emerald-400">{detailStudentProgress.progress_percentage}%</span>
                    </div>
                    <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden p-0.5 border border-slate-200 dark:bg-slate-800 dark:border-slate-700">
                      <div
                        className="bg-gradient-to-r from-emerald-500 to-teal-600 h-full rounded-full transition-all duration-500"
                        style={{ width: `${detailStudentProgress.progress_percentage}%` }}
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-6 text-center text-slate-400 text-xs">
                  Belum ada catatan kelanjutan tahfizh untuk siswa ini.
                </div>
              )}
            </DialogBody>

            <DialogFooter className="flex flex-wrap items-center justify-between gap-2.5 border-t border-slate-100 bg-slate-50/50 px-6 py-4 dark:border-slate-800 dark:bg-slate-900/40">
              <MasterActionButton
                variant="primary"
                icon={BookOpen}
                onClick={() => {
                  const sId = detailStudentObj.id || detailStudentObj.student_id
                  setSelectedStudentId(sId)
                  setShowStudentDetailModal(false)
                  setShowStudentModal(false)
                  setShowSheetModal(true)
                }}
              >
                <span>Kelola Setoran Siswa Ini</span>
                <ArrowRight className="size-3.5" />
              </MasterActionButton>

              <button
                type="button"
                onClick={() => setShowStudentDetailModal(false)}
                className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-br from-rose-500 via-rose-600 to-red-700 text-white px-4 py-2.5 text-xs font-extrabold border border-rose-300/40 transition-all duration-200 hover:scale-[1.03] active:scale-95 cursor-pointer"
              >
                <div className="flex size-5 items-center justify-center rounded-lg bg-white/20 text-white">
                  <X className="size-3.5 text-white" strokeWidth={2.2} />
                </div>
                <span>Tutup</span>
              </button>
            </DialogFooter>
          </Dialog>
        </Backdrop>
      )}

      {/* DIALOG KONFIRMASI SIMPAN DATA */}
      {showSaveConfirm && (
        <Backdrop isOpen={showSaveConfirm} onOpenChange={setShowSaveConfirm} className="z-[70] bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-3 sm:p-5">
          <Dialog showCloseButton={false} className="max-w-md w-full rounded-3xl overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#1B2433]">
            <div className="h-1.5 bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-600 shrink-0" />
            <DialogHeader className="px-6 py-4.5 border-b border-slate-100 bg-white flex items-center justify-between dark:bg-slate-950 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 sm:h-11 sm:w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700 text-white shadow-md shadow-emerald-500/20 border border-emerald-300/30">
                  <Sparkles className="size-5 text-white" strokeWidth={2.25} />
                </div>
                <div>
                  <DialogTitle className="font-black text-sm sm:text-base text-slate-900 dark:text-white flex items-center gap-2">
                    <span>Konfirmasi Penyimpanan Log Tahfizh</span>
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-800 border border-emerald-200/80 dark:bg-emerald-950/60 dark:text-emerald-400 dark:border-emerald-800/60">
                      <Sparkles className="size-3" />
                      Simpan Data
                    </span>
                  </DialogTitle>
                  <DialogDescription className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    {singleSaveIndex !== null
                      ? `Simpan log Tahfizh hari ${weeklySheet[singleSaveIndex]?.day_name} (${weeklySheet[singleSaveIndex]?.record_date})`
                      : 'Simpan seluruh log Tahfizh pekan ini ke server'}
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>

            <DialogBody className="p-5">
              <div className="rounded-xl border border-emerald-100 bg-emerald-50/60 p-3.5 text-xs font-semibold text-emerald-800 dark:border-emerald-900/40 dark:bg-emerald-950/30 dark:text-emerald-300">
                Data setoran hafalan dan murajaah yang disimpan akan langsung diperbarui di database sistem.
              </div>
            </DialogBody>

            <DialogFooter className="px-6 py-4 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between gap-2.5 dark:bg-slate-900/40 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setShowSaveConfirm(false)}
                className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-br from-rose-500 via-rose-600 to-red-700 text-white px-4 py-2.5 text-xs font-extrabold border border-rose-300/40 transition-all duration-200 hover:scale-[1.03] active:scale-95 cursor-pointer"
              >
                <div className="flex size-5 items-center justify-center rounded-lg bg-white/20 text-white">
                  <X className="size-3.5 text-white" strokeWidth={2.2} />
                </div>
                <span>Batal</span>
              </button>

              <MasterActionButton variant="primary" icon={Save} onClick={handleConfirmSave}>
                <span>Ya, Simpan Log</span>
              </MasterActionButton>
            </DialogFooter>
          </Dialog>
        </Backdrop>
      )}

      {/* MODAL TARIK MASTER AL-QUR'AN & SELEKSI JUZ / SURAH / AYAT (STATIC 2-COLUMN LAYOUT WITH SCROLLING BODIES) */}
      {showQuranModal && (
        <Backdrop isOpen={showQuranModal} onOpenChange={setShowQuranModal} className="z-[70] bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-3 sm:p-5">
          <Dialog showCloseButton={false} className="max-w-5xl w-full h-[88vh] max-h-[88vh] flex flex-col rounded-3xl border border-slate-200 bg-white p-0 shadow-2xl overflow-hidden dark:border-slate-800 dark:bg-[#1B2433]">
            <div className="h-1.5 bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-600 shrink-0" />
            <DialogHeader className="flex items-center justify-between border-b border-slate-100 bg-white px-6 py-4.5 dark:border-slate-800 dark:bg-slate-950 shrink-0">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 sm:h-11 sm:w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700 text-white shadow-md shadow-emerald-500/20 border border-emerald-300/30">
                  <BookOpen className="h-5 w-5 text-white" strokeWidth={2.25} />
                </div>
                <div>
                  <DialogTitle className="text-sm sm:text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                    <span>Pilih Hafalan Al-Qur'an (Juz, Surah, Ayat, Baris)</span>
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-800 border border-emerald-200/80 dark:bg-emerald-950/60 dark:text-emerald-400 dark:border-emerald-800/60">
                      <BookOpen className="size-3" />
                      Mushaf
                    </span>
                  </DialogTitle>
                  <DialogDescription className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    {currentStudentObj ? (
                      <span>Siswa Terpilih: <strong>{getStudentName(currentStudentObj)}</strong> (NIS: {getStudentNis(currentStudentObj)}) · {currentClassObj?.nama_kelas || 'Rombel'}</span>
                    ) : (
                      'Pilih Juz, Surah, rentang Ayat, dan jumlah baris halaman Al-Qur\'an secara interaktif atau manual.'
                    )}
                  </DialogDescription>
                </div>
              </div>

              <div className="flex items-center gap-2.5 shrink-0">
                {/* Switcher Mode Interactive vs Manual */}
                <div className="bg-slate-100 p-1 rounded-2xl border border-slate-200/80 flex items-center gap-1 dark:bg-slate-900 dark:border-slate-800" role="tablist" aria-label="Mode input mushaf">
                  <button
                    type="button"
                    role="tab"
                    aria-selected={quranInputMode === 'interactive'}
                    onClick={() => setQuranInputMode('interactive')}
                    className={`px-3 py-1.5 rounded-xl text-[11px] font-extrabold transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/40 ${
                      quranInputMode === 'interactive' ? 'bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700 text-white border border-emerald-300/40 shadow-md shadow-emerald-600/25' : 'text-slate-600 hover:text-slate-900 dark:text-slate-400'
                    }`}
                  >
                    Interaktif
                  </button>
                  <button
                    type="button"
                    role="tab"
                    aria-selected={quranInputMode === 'manual'}
                    onClick={() => setQuranInputMode('manual')}
                    className={`px-3 py-1.5 rounded-xl text-[11px] font-extrabold transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/40 ${
                      quranInputMode === 'manual' ? 'bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700 text-white border border-emerald-300/40 shadow-md shadow-emerald-600/25' : 'text-slate-600 hover:text-slate-900 dark:text-slate-400'
                    }`}
                  >
                    Manual
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => setShowQuranModal(false)}
                  aria-label="Tutup modal"
                  className="size-9 flex items-center justify-center rounded-2xl bg-gradient-to-br from-rose-500 via-rose-600 to-red-700 text-white hover:scale-105 active:scale-95 transition-all duration-200 shadow-md shadow-rose-500/20 cursor-pointer shrink-0"
                >
                  <X className="size-4 text-white" strokeWidth={2.25} />
                </button>
              </div>
            </DialogHeader>

            <DialogBody className="p-5 flex-1 overflow-hidden min-h-0">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 h-full">
                {/* KOLOM KIRI (LEFT COLUMN - SELECTION & INPUT CONTROLS) */}
                <div className="lg:col-span-6 flex flex-col h-full space-y-4 overflow-y-auto pr-1">
                  {/* Filter Controls (Filter Juz & Input Search Surah) */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* 1. Filter Pilih Juz */}
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1 dark:text-slate-300">
                        Filter Pilih Juz Al-Qur'an:
                      </label>
                      <div className="relative">
                        <select
                          value={selectedJuzFilter}
                          onChange={(e) => setSelectedJuzFilter(e.target.value)}
                          className="w-full h-9 px-3 pr-8 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:ring-2 focus:ring-emerald-500 cursor-pointer dark:bg-slate-900 dark:text-slate-200 dark:border-slate-700"
                        >
                          <option value="all">Semua Juz (Juz 1 s/d 30)</option>
                          {Array.from({ length: 30 }, (_, i) => i + 1).map((j) => (
                            <option key={j} value={j}>
                              Juz {j} {j === 30 ? '(Amma)' : j === 29 ? '(Tabarak)' : ''}
                            </option>
                          ))}
                        </select>
                        <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                      </div>
                    </div>

                    {/* 2. Cari Surah */}
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1 dark:text-slate-300">
                        Cari Nama / Nomor Surah:
                      </label>
                      <div className="relative">
                        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          value={quranSearch}
                          onChange={(e) => setQuranSearch(e.target.value)}
                          placeholder="Misal: An-Naba, Yasin, 78..."
                          className="w-full pl-9 pr-4 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-emerald-500 dark:bg-slate-900 dark:text-slate-200 dark:border-slate-700"
                        />
                      </div>
                    </div>
                  </div>

                  {quranInputMode === 'interactive' ? (
                    /* Mode Interaktif (List Surah Al-Qur'an dengan Teks Arab & Latin) */
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5 dark:text-slate-300">
                        Pilih Surah ({filteredQuranSurahs.length} Surah Ditemukan):
                      </label>
                      <div className="max-h-44 overflow-y-auto border rounded-xl divide-y divide-slate-100 bg-slate-50/50 dark:divide-slate-800 dark:bg-slate-900/50 dark:border-slate-700">
                        {filteredQuranSurahs.map((s) => (
                          <button
                            key={s.nomor}
                            type="button"
                            onClick={() => {
                              setModalSurah(s)
                              setModalAyahStart(1)
                              setModalAyahEnd(Math.min(10, s.jumlah_ayat || 7))
                              setModalBarisCount(5)
                            }}
                            className={`w-full px-3.5 py-2.5 text-left text-xs flex items-center justify-between transition-colors ${
                              modalSurah?.nomor === s.nomor
                                ? 'bg-emerald-100 font-extrabold text-emerald-950 border-l-4 border-emerald-600 dark:bg-emerald-950 dark:text-emerald-200'
                                : 'hover:bg-emerald-50 text-slate-800 dark:text-slate-200 dark:hover:bg-slate-800'
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <span className="w-6 h-6 rounded-md bg-emerald-200/60 text-emerald-900 font-bold text-[11px] flex items-center justify-center dark:bg-emerald-900 dark:text-emerald-200">
                                {s.nomor}
                              </span>
                              <span className="font-extrabold">{s.nama_latin}</span>
                              <span className="text-[10px] text-slate-400">(Juz {getJuzFromSurah(s.nomor)})</span>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className="text-[11px] text-slate-500 font-medium">({s.jumlah_ayat} Ayat)</span>
                              <span className="font-serif text-base font-extrabold text-emerald-800 dark:text-emerald-400 dir-rtl">{s.nama}</span>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : (
                    /* Mode Input Manual (Dropdown Surah Manual dengan Nama Arab) */
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5 dark:text-slate-300">
                        Pilih Surah (Manual Dropdown):
                      </label>
                      <div className="relative">
                        <select
                          value={modalSurah?.nomor || ''}
                          onChange={(e) => {
                            const surahObj = quranSurahs.find((s) => Number(s.nomor) === Number(e.target.value))
                            if (surahObj) {
                              setModalSurah(surahObj)
                              setModalAyahStart(1)
                              setModalAyahEnd(Math.min(10, surahObj.jumlah_ayat))
                              setModalBarisCount(5)
                            }
                          }}
                          className="w-full h-10 px-3.5 pr-9 bg-white border border-emerald-300 rounded-xl text-xs font-bold text-slate-800 focus:ring-2 focus:ring-emerald-500 dark:bg-slate-900 dark:border-slate-700 dark:text-slate-200"
                        >
                          <option value="">-- Pilih Surah Al-Qur'an --</option>
                          {filteredQuranSurahs.map((s) => (
                            <option key={s.nomor} value={s.nomor}>
                              Surah {s.nomor}. {s.nama_latin} ({s.nama}) — {s.jumlah_ayat} Ayat (Juz {getJuzFromSurah(s.nomor)})
                            </option>
                          ))}
                        </select>
                        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      </div>
                    </div>
                  )}

                  {/* Setting Detail Hafalan Terpilih (Juz, Surah, Dropdown Ayat Awal, Dropdown Ayat Akhir, Baris, Tombol Tambah Ayat Cepat) */}
                  {modalSurah ? (
                    <div className="bg-emerald-50/90 p-4 rounded-2xl border border-emerald-200 space-y-4 dark:bg-emerald-950/40 dark:border-emerald-900">
                      <div className="text-xs font-bold text-emerald-900 flex items-center justify-between gap-2 dark:text-emerald-300">
                        <div className="flex items-center gap-2">
                          <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
                          <span>Detail Surah: Surah {modalSurah.nomor}. {modalSurah.nama_latin} ({modalSurah.jumlah_ayat} Ayat)</span>
                        </div>
                        <Badge color="emerald" size="sm">
                          Juz {getJuzFromSurah(modalSurah.nomor)}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        {/* Dropdown Ayat Awal */}
                        <div>
                          <label className="block text-[11px] font-extrabold text-slate-700 mb-1 dark:text-slate-300">
                            Pilih Ayat Awal:
                          </label>
                          <div className="relative">
                            <select
                              value={modalAyahStart}
                              disabled={isAyahStartLocked}
                              onChange={(e) => {
                                const start = Number(e.target.value)
                                setModalAyahStart(start)
                                if (Number(modalAyahEnd) < start) {
                                  const end = Math.min(start + 9, modalSurah.jumlah_ayat)
                                  setModalAyahEnd(end)
                                  setModalBarisCount(Math.max(1, Math.ceil((end - start + 1) * 0.75)))
                                } else {
                                  setModalBarisCount(Math.max(1, Math.ceil((Number(modalAyahEnd) - start + 1) * 0.75)))
                                }
                              }}
                              className={`w-full h-10 px-3 pr-8 rounded-xl text-xs font-bold ${
                                isAyahStartLocked
                                  ? 'bg-slate-100 border border-slate-300 text-slate-500 cursor-not-allowed dark:bg-slate-800 dark:border-slate-700 dark:text-slate-400'
                                  : 'bg-white border border-emerald-300 text-slate-800 focus:ring-2 focus:ring-emerald-500 cursor-pointer dark:bg-slate-900 dark:border-slate-700 dark:text-slate-200'
                              }`}
                            >
                              {Array.from({ length: modalSurah.jumlah_ayat }, (_, i) => i + 1).map((a) => (
                                <option key={a} value={a}>
                                  Ayat {a}
                                </option>
                              ))}
                            </select>
                            <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                          </div>
                        </div>

                        {/* Dropdown Ayat Akhir */}
                        <div>
                          <label className="block text-[11px] font-extrabold text-slate-700 mb-1 dark:text-slate-300">
                            Pilih Ayat Akhir:
                          </label>
                          <div className="relative">
                            <select
                              value={modalAyahEnd}
                              onChange={(e) => {
                                const end = Number(e.target.value)
                                setModalAyahEnd(end)
                                setModalBarisCount(Math.max(1, Math.ceil((end - Number(modalAyahStart) + 1) * 0.75)))
                              }}
                              className="w-full h-10 px-3 pr-8 bg-white border border-emerald-300 rounded-xl text-xs font-bold text-slate-800 focus:ring-2 focus:ring-emerald-500 cursor-pointer dark:bg-slate-900 dark:border-slate-700 dark:text-slate-200"
                            >
                              {Array.from({ length: modalSurah.jumlah_ayat - Number(modalAyahStart) + 1 }, (_, i) => Number(modalAyahStart) + i).map((a) => (
                                <option key={a} value={a}>
                                  Ayat {a}
                                </option>
                              ))}
                            </select>
                            <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                          </div>
                        </div>

                        {/* Jumlah Baris */}
                        <div>
                          <label className="block text-[11px] font-extrabold text-slate-700 mb-1 dark:text-slate-300">
                            Jumlah Baris:
                          </label>
                          <input
                            type="number"
                            min="1"
                            value={modalBarisCount}
                            onChange={(e) => setModalBarisCount(e.target.value)}
                            className="w-full h-10 px-3 bg-white border border-emerald-300 rounded-xl text-xs font-extrabold text-center focus:ring-2 focus:ring-emerald-500 dark:bg-slate-900 dark:border-slate-700 dark:text-slate-200"
                          />
                        </div>
                      </div>

                      {/* Tombol Shortcut Penambahan Ayat Cepat */}
                      <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-emerald-200/80 dark:border-emerald-900">
                        <span className="text-[11px] font-extrabold text-emerald-900 dark:text-emerald-300">
                          Penambahan Ayat Cepat:
                        </span>
                        <div className="flex flex-wrap items-center gap-1.5">
                          <Button
                            type="button"
                            variant="ghost"
                            appearance="outline"
                            size="xs"
                            onClick={() => {
                              const newEnd = Math.min(Number(modalAyahEnd) + 5, modalSurah.jumlah_ayat)
                              setModalAyahEnd(newEnd)
                              setModalBarisCount(Math.max(1, Math.ceil((newEnd - Number(modalAyahStart) + 1) * 0.75)))
                            }}
                            className="h-8 px-3 text-[11px] font-black rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-300 hover:bg-emerald-600 hover:text-white transition-all duration-200 hover:scale-105 active:scale-95 shadow-xs dark:bg-slate-900 dark:text-emerald-300 dark:border-emerald-800"
                          >
                            +5 Ayat
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            appearance="outline"
                            size="xs"
                            onClick={() => {
                              const newEnd = Math.min(Number(modalAyahEnd) + 10, modalSurah.jumlah_ayat)
                              setModalAyahEnd(newEnd)
                              setModalBarisCount(Math.max(1, Math.ceil((newEnd - Number(modalAyahStart) + 1) * 0.75)))
                            }}
                            className="h-8 px-3 text-[11px] font-black rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-300 hover:bg-emerald-600 hover:text-white transition-all duration-200 hover:scale-105 active:scale-95 shadow-xs dark:bg-slate-900 dark:text-emerald-300 dark:border-emerald-800"
                          >
                            +10 Ayat
                          </Button>
                          <Button
                            type="button"
                            variant="success"
                            appearance="fill"
                            size="xs"
                            onClick={() => {
                              setModalAyahStart(1)
                              setModalAyahEnd(modalSurah.jumlah_ayat)
                              setModalBarisCount(Math.max(1, Math.ceil(modalSurah.jumlah_ayat * 0.75)))
                            }}
                            className="h-8 px-3 text-[11px] font-black rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition-all duration-200 hover:scale-105 active:scale-95"
                          >
                            Semua ({modalSurah.jumlah_ayat} Ayat)
                          </Button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 text-amber-900 text-xs font-semibold text-center dark:bg-amber-950/30 dark:border-amber-900 dark:text-amber-300">
                      Silakan pilih Surah di atas terlebih dahulu untuk mengaktifkan pilihan Ayat Awal & Ayat Akhir.
                    </div>
                  )}
                </div>

                {/* KOLOM KANAN (RIGHT COLUMN - LIVE MUSHAF ARABIC & LATIN TEXT READER WITH AYAH ASSESSMENT) */}
                <div className="lg:col-span-6 flex flex-col h-full bg-amber-50/50 p-4 rounded-2xl border border-emerald-200/80 shadow-inner dark:bg-slate-900/80 dark:border-emerald-900 overflow-hidden">
                  <div className="flex flex-wrap items-center justify-between pb-3 border-b border-emerald-200/80 dark:border-slate-800 shrink-0 gap-2">
                    <div className="flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-emerald-700 shrink-0 dark:text-emerald-400" />
                      <span className="text-xs font-extrabold text-emerald-950 dark:text-emerald-200">
                        Pratinjau Mushaf Al-Qur'an (Ayat {modalAyahStart} s/d {modalAyahEnd})
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {/* Tombol Tampilkan / Sembunyikan Field Penilaian */}
                      <Button
                        type="button"
                        onClick={() => setShowAyahPenilaianField((prev) => !prev)}
                        variant={showAyahPenilaianField ? 'success' : 'ghost'}
                        appearance={showAyahPenilaianField ? 'fill' : 'outline'}
                        size="xs"
                        className="font-extrabold text-[11px] h-7"
                      >
                        <Award className="w-3.5 h-3.5 mr-1" />
                        <span>{showAyahPenilaianField ? 'Tutup Field Penilaian' : 'Field Penilaian Hafalan'}</span>
                      </Button>

                      {modalSurah && (
                        <Badge color="emerald" size="sm" className="font-extrabold">
                          {modalSurah.nama_latin} ({modalSurah.nama})
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div className="flex-1 overflow-y-auto pt-3 pr-1 space-y-3">
                    {!modalSurah ? (
                      <div className="p-12 text-center text-slate-400 text-xs font-semibold flex flex-col items-center justify-center gap-2 h-full">
                        <BookOpen className="w-8 h-8 text-emerald-600/40" />
                        <span>Pilih Surah di kolom sebelah kiri untuk menampilkan bacaan teks Arab Al-Qur'an.</span>
                      </div>
                    ) : loadingModalAyats ? (
                      <div className="p-12 text-center text-slate-400 text-xs font-semibold flex flex-col items-center justify-center gap-2 h-full">
                        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
                        <span>Sedang mengambil teks Mushaf Al-Qur'an dari EQuran...</span>
                      </div>
                    ) : filteredSelectedAyats.length === 0 ? (
                      <div className="p-8 text-center text-slate-500 text-xs font-medium italic">
                        Teks Arab untuk Surah {modalSurah.nama_latin} ({modalSurah.nama}) Ayat {modalAyahStart} s/d {modalAyahEnd}.
                      </div>
                    ) : (
                      filteredSelectedAyats.map((a) => {
                        const aNum = a.nomor_ayat || a.nomorAyat
                        const isPenilaianOpen = showAyahPenilaianField || activeAyahPenilaianMap[aNum]?.isOpen
                        const currentPredikat = activeAyahPenilaianMap[aNum]?.predikat || 'mumtaz'
                        const currentNotes = activeAyahPenilaianMap[aNum]?.notes || ''

                        return (
                          <div
                            key={aNum}
                            onClick={() => {
                              setActiveAyahPenilaianMap((prev) => ({
                                ...prev,
                                [aNum]: {
                                  ...prev[aNum],
                                  isOpen: !prev[aNum]?.isOpen,
                                },
                              }))
                            }}
                            className={`p-3.5 rounded-2xl border transition-all cursor-pointer space-y-2.5 shadow-sm ${
                              isPenilaianOpen
                                ? 'bg-emerald-50/70 border-emerald-400 ring-2 ring-emerald-500/20 dark:bg-slate-900 dark:border-emerald-800'
                                : 'bg-white border-slate-200/80 hover:border-emerald-400 dark:bg-slate-900 dark:border-slate-800'
                            }`}
                          >
                            <div className="flex items-center justify-between border-b border-slate-100 pb-1.5 dark:border-slate-800">
                              <div className="flex items-center gap-2">
                                <span className="w-6 h-6 rounded-md bg-emerald-100 text-emerald-900 font-extrabold text-[10px] flex items-center justify-center dark:bg-emerald-950 dark:text-emerald-200">
                                  {aNum}
                                </span>
                                <span className="text-[11px] font-bold text-slate-600 dark:text-slate-300">
                                  Ayat {aNum}
                                </span>
                              </div>

                              <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                                <Badge
                                  color={currentPredikat === 'mumtaz' ? 'success' : currentPredikat === 'jayyid' ? 'warning' : 'error'}
                                  size="sm"
                                  className="font-extrabold text-[10px]"
                                >
                                  {currentPredikat === 'mumtaz' ? 'Mumtaz (Lancar)' : currentPredikat === 'jayyid' ? 'Jayyid (Cukup)' : 'Perlu Murajaah'}
                                </Badge>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setActiveAyahPenilaianMap((prev) => ({
                                      ...prev,
                                      [aNum]: {
                                        ...prev[aNum],
                                        isOpen: !prev[aNum]?.isOpen,
                                      },
                                    }))
                                  }}
                                  className="text-[10px] font-extrabold text-emerald-700 hover:text-emerald-900 underline dark:text-emerald-400"
                                >
                                  {isPenilaianOpen ? 'Tutup Penilaian' : '+ Penilaian Ayat'}
                                </button>
                              </div>
                            </div>

                            {/* Teks Arab Harakat */}
                            <div className="text-right text-xl sm:text-2xl font-serif leading-loose text-emerald-950 dark:text-emerald-200 font-bold dir-rtl">
                              {a.teks_arab || a.teksArab}
                            </div>

                            {/* Transliterasi Latin */}
                            {(a.teks_latin || a.teksLatin) && (
                              <div className="text-[11px] text-emerald-900 italic bg-emerald-50/70 p-2.5 rounded-lg font-medium dark:bg-emerald-950/40 dark:text-emerald-300">
                                "{a.teks_latin || a.teksLatin}"
                              </div>
                            )}

                            {/* 📝 FIELD PENILAIAN HAFALAN PER AYAT */}
                            {isPenilaianOpen && (
                              <div
                                onClick={(e) => e.stopPropagation()}
                                className="mt-3 pt-3 border-t border-emerald-200/80 dark:border-slate-800 space-y-2.5 bg-white p-3 rounded-xl border border-emerald-300/80 shadow-inner dark:bg-slate-950"
                              >
                                <div className="flex items-center justify-between">
                                  <span className="text-[11px] font-extrabold text-emerald-900 dark:text-emerald-300 flex items-center gap-1.5">
                                    <Award className="w-3.5 h-3.5 text-emerald-600" />
                                    <span>Field Penilaian Ayat {aNum}:</span>
                                  </span>
                                </div>

                                {/* Opsi Kualitas Bacaan */}
                                <div className="flex flex-wrap items-center gap-1.5">
                                  <button
                                    type="button"
                                    onClick={() =>
                                      setActiveAyahPenilaianMap((prev) => ({
                                        ...prev,
                                        [aNum]: { ...prev[aNum], predikat: 'mumtaz' },
                                      }))
                                    }
                                    className={`px-2.5 py-1 rounded-lg text-[10px] font-black transition-all ${
                                      currentPredikat === 'mumtaz'
                                        ? 'bg-emerald-600 text-white shadow-sm'
                                        : 'bg-slate-100 text-slate-700 hover:bg-emerald-100 dark:bg-slate-800 dark:text-slate-300'
                                    }`}
                                  >
                                    🟢 Mumtaz (Lancar)
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() =>
                                      setActiveAyahPenilaianMap((prev) => ({
                                        ...prev,
                                        [aNum]: { ...prev[aNum], predikat: 'jayyid' },
                                      }))
                                    }
                                    className={`px-2.5 py-1 rounded-lg text-[10px] font-black transition-all ${
                                      currentPredikat === 'jayyid'
                                        ? 'bg-amber-500 text-white shadow-sm'
                                        : 'bg-slate-100 text-slate-700 hover:bg-amber-100 dark:bg-slate-800 dark:text-slate-300'
                                    }`}
                                  >
                                    🟡 Jayyid (Terbata)
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() =>
                                      setActiveAyahPenilaianMap((prev) => ({
                                        ...prev,
                                        [aNum]: { ...prev[aNum], predikat: 'rasib' },
                                      }))
                                    }
                                    className={`px-2.5 py-1 rounded-lg text-[10px] font-black transition-all ${
                                      currentPredikat === 'rasib'
                                        ? 'bg-rose-600 text-white shadow-sm'
                                        : 'bg-slate-100 text-slate-700 hover:bg-rose-100 dark:bg-slate-800 dark:text-slate-300'
                                    }`}
                                  >
                                    🔴 Perlu Murajaah
                                  </button>
                                </div>

                                {/* Input Catatan Evaluasi Ayat */}
                                <div>
                                  <input
                                    type="text"
                                    value={currentNotes}
                                    onChange={(e) => {
                                      const val = e.target.value
                                      setActiveAyahPenilaianMap((prev) => ({
                                        ...prev,
                                        [aNum]: { ...prev[aNum], notes: val },
                                      }))
                                    }}
                                    placeholder="Catatan kesalahan ayat (makhraj, mad, tajwid)..."
                                    className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-[11px] font-medium focus:ring-2 focus:ring-emerald-500 dark:bg-slate-900 dark:border-slate-700 dark:text-slate-200"
                                  />
                                </div>
                              </div>
                            )}
                          </div>
                        )
                      })
                    )}
                  </div>
                </div>
              </div>
            </DialogBody>

            <DialogFooter className="flex flex-wrap items-center justify-between gap-2.5 border-t border-slate-100 bg-slate-50/50 px-6 py-4 dark:border-slate-800 dark:bg-slate-900/40 shrink-0">
              <span className="text-xs font-semibold text-slate-400 dark:text-slate-500">Pratinjau mushaf & pilihan surah</span>
              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowQuranModal(false)}
                  className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-br from-rose-500 via-rose-600 to-red-700 text-white px-4 py-2.5 text-xs font-extrabold border border-rose-300/40 transition-all duration-200 hover:scale-[1.03] active:scale-95 cursor-pointer"
                >
                  <div className="flex size-5 items-center justify-center rounded-lg bg-white/20 text-white">
                    <X className="size-3.5 text-white" strokeWidth={2.2} />
                  </div>
                  <span>Batal</span>
                </button>

                <MasterActionButton
                  variant="primary"
                  icon={BookOpen}
                  onClick={handleApplyQuranSelection}
                  disabled={!modalSurah}
                >
                  <span>Terapkan ke Form Tahfizh</span>
                </MasterActionButton>
              </div>
            </DialogFooter>
          </Dialog>
        </Backdrop>
      )}

      {/* 🟢 MODAL POP-UP DIALOG: FORMULIR TAHFIZH & MURAJAAH HARIAN SISWA (STATIC HEIGHT WITH SCROLLING BODY) */}
      {showSheetModal && currentStudentObj && (() => {
        const studentName = currentStudentObj.nama_lengkap || currentStudentObj.nama || currentStudentObj.full_name || currentStudentObj.name || currentStudentObj.user?.name || currentStudentObj.siswa?.nama_lengkap || currentStudentObj.siswa?.nama || 'Siswa'
        const studentNis = currentStudentObj.nis || currentStudentObj.nisn || '-'

        return (
          <Backdrop isOpen={showSheetModal} onOpenChange={setShowSheetModal} className="z-[70] bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-3 sm:p-5">
            <Dialog showCloseButton={false} className="w-full max-w-5xl h-[90vh] max-h-[90vh] flex flex-col rounded-3xl border border-slate-200 bg-white p-0 shadow-2xl overflow-hidden dark:border-slate-800 dark:bg-[#1B2433]">
              <div className="h-1.5 bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-600 shrink-0" />
              {/* HEADER MODAL */}
              <DialogHeader className="flex items-center justify-between border-b border-slate-100 bg-white px-6 py-4.5 dark:border-slate-800 dark:bg-slate-950 shrink-0">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 sm:h-11 sm:w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700 text-white shadow-md shadow-emerald-500/20 border border-emerald-300/30">
                    <BookOpen className="h-5 w-5 text-white" strokeWidth={2.25} />
                  </div>
                  <div>
                    <DialogTitle className="text-sm sm:text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                      <span className="truncate">Formulir Tahfizh & Murajaah Harian ({getStudentName(currentStudentObj)})</span>
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-800 border border-emerald-200/80 dark:bg-emerald-950/60 dark:text-emerald-400 dark:border-emerald-800/60 shrink-0">
                        <Sparkles className="size-3" />
                        Setoran
                      </span>
                    </DialogTitle>
                    <DialogDescription className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      Siswa: {getStudentName(currentStudentObj)} · NIS: {getStudentNis(currentStudentObj)} · Periode Pekan: Senin, {currentMonday} · Rombel: {currentClassObj?.nama_kelas || 'Kelas Aktif'}
                    </DialogDescription>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setShowSheetModal(false)}
                  aria-label="Tutup modal"
                  className="size-9 flex items-center justify-center rounded-2xl bg-gradient-to-br from-rose-500 via-rose-600 to-red-700 text-white hover:scale-105 active:scale-95 transition-all duration-200 shadow-md shadow-rose-500/20 cursor-pointer shrink-0"
                >
                  <X className="size-4 text-white" strokeWidth={2.25} />
                </button>
              </DialogHeader>

            <DialogBody className="p-4 sm:p-6 flex-1 overflow-y-auto min-h-0 space-y-4">
              {/* 1. Detail Hafalan Status Siswa (Juz, Surah, Ayat, Baris) */}
              <div className="bg-emerald-50/90 border border-emerald-200 rounded-2xl p-3.5 flex flex-wrap items-center justify-between gap-3 text-xs font-semibold text-emerald-950 dark:bg-emerald-950/40 dark:border-emerald-900 dark:text-emerald-200">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white font-extrabold flex items-center justify-center text-sm shadow-sm shrink-0">
                    📖
                  </div>
                  <div>
                    <div className="font-extrabold text-sm text-emerald-900 dark:text-white flex items-center gap-2">
                      <span>Detail Hafalan Aktif: {currentStudentObj.last_surah_memorized || 'Surah Al-Qur\'an'}</span>
                      <Badge color="emerald" size="sm">
                        Juz {getJuzFromSurah(currentStudentObj.last_surah_number || 78)}
                      </Badge>
                    </div>
                    <div className="text-[11px] text-emerald-700 dark:text-emerald-300 mt-0.5">
                      Rentang Ayat: {currentStudentObj.last_ayah_range || 'Ayat 1 - 10'} · Total Baris: {currentStudentObj.total_baris || 15} Baris · Total Ayat: {currentStudentObj.total_ayats_memorized || 0} Ayat
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Badge color="indigo" size="md">
                    {currentStudentObj.total_surah_memorized || 0} Surah Dihafal
                  </Badge>
                </div>
              </div>

              {/* 👤 2. CARD BARU: DATA SISWA TERPILIH (DIBAWAH DETAIL HAFALAN AKTIF) */}
              <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-sm dark:bg-slate-900 dark:border-slate-800 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <Avatar size="md" status="online">
                      <AvatarFallback className="bg-emerald-600 text-white font-black text-sm shadow-sm">
                        {getStudentName(currentStudentObj).charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-black text-slate-900 dark:text-white">{getStudentName(currentStudentObj)}</span>
                        <Badge color="success" size="sm" className="font-extrabold">Siswa Aktif</Badge>
                      </div>
                      <div className="text-xs text-slate-500 font-semibold mt-0.5 flex items-center gap-2">
                        <span>NIS: <strong className="text-slate-700 dark:text-slate-300">{getStudentNis(currentStudentObj)}</strong></span>
                        <span>•</span>
                        <span>Rombel: <strong className="text-slate-700 dark:text-slate-300">{currentClassObj?.nama_kelas || 'Kelas Aktif'}</strong></span>
                      </div>
                    </div>
                  </div>

                  {/* Ringkasan Statistik Hafalan Siswa */}
                  <div className="flex items-center gap-3 bg-slate-50 p-2.5 rounded-xl border border-slate-100 dark:bg-slate-800/60 dark:border-slate-800 text-xs">
                    <div>
                      <span className="text-[10px] text-slate-400 block font-medium">Total Hafalan:</span>
                      <span className="font-extrabold text-emerald-700 dark:text-emerald-400">
                        {Number(currentStudentObj.total_ayats_memorized || currentStudentObj.total_ayat || 0).toLocaleString('id-ID')} Ayat
                      </span>
                    </div>
                    <div className="h-6 w-px bg-slate-200 dark:bg-slate-700" />
                    <div>
                      <span className="text-[10px] text-slate-400 block font-medium">Total Surah:</span>
                      <span className="font-extrabold text-indigo-700 dark:text-indigo-400">
                        {Number(currentStudentObj.total_surah_memorized || currentStudentObj.total_surah || 0)} Surah
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* 📅 INTERACTIVE DAY SELECTOR BAR (SENIN - AHAD) & HIGHLIGHT HARI INI */}
              <div className="bg-gradient-to-r from-emerald-900/90 to-teal-900/90 p-4 rounded-2xl border border-emerald-700/80 text-white shadow-lg space-y-2.5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-emerald-300 shrink-0" />
                    <span className="text-xs font-black uppercase tracking-wider text-emerald-100">
                      Pilih Hari Setoran Pekan Ini ({currentMonday} s/d {weeklySheet[6]?.record_date || '-'}):
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 bg-emerald-950/80 px-2.5 py-1 rounded-xl border border-emerald-600/60 text-[11px] font-bold">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                    <span className="text-emerald-200">Hari Ini: <strong className="text-white font-extrabold">{todayFormatted}</strong></span>
                  </div>
                </div>

                {/* Day Pills (7 Days Monday-Sunday) */}
                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2">
                  {weeklySheet.map((row) => {
                    const isToday = row.record_date === todayDateStr
                    const isActiveDay = selectedDayDate ? row.record_date === selectedDayDate : isToday
                    const dayDateShort = row.record_date ? row.record_date.slice(5) : ''

                    return (
                      <button
                        key={row.record_date}
                        type="button"
                        onClick={() => setSelectedDayDate(row.record_date)}
                        className={`px-3 py-2 rounded-xl text-xs font-extrabold transition-all duration-200 flex flex-col items-center justify-center gap-1 border relative ${
                          isActiveDay
                            ? 'bg-emerald-500 text-white border-emerald-300 shadow-md shadow-emerald-900/40 scale-105 ring-2 ring-white/40'
                            : isToday
                            ? 'bg-emerald-800/90 text-emerald-100 border-amber-400/90 hover:bg-emerald-700'
                            : 'bg-emerald-950/60 text-emerald-200/80 border-emerald-700/50 hover:bg-emerald-800/60 hover:text-white'
                        }`}
                      >
                        {isToday && (
                          <span className="absolute -top-2 right-1 px-1.5 py-0.2 bg-amber-400 text-emerald-950 font-black text-[9px] rounded-full shadow-sm">
                            Hari Ini
                          </span>
                        )}

                        <div className="flex items-center gap-1">
                          <span>{row.day_name}</span>
                          {row.isSaved && <CheckCircle2 className="w-3 h-3 text-emerald-300" />}
                        </div>
                        <span className="text-[10px] opacity-80">{dayDateShort}</span>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Quick Controls inside Modal */}
              <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-50 dark:bg-slate-900/50 p-3 rounded-2xl border border-slate-200/80 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <Button onClick={handlePrevWeek} variant="ghost" appearance="outline" size="xs" iconOnly title="Pekan Sebelumnya">
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <div className="px-3 py-1.5 bg-white dark:bg-slate-800 border border-emerald-300 dark:border-emerald-800 rounded-xl text-xs font-extrabold text-emerald-900 dark:text-emerald-300 flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Pekan: {currentMonday}</span>
                  </div>
                  <Button onClick={handleNextWeek} variant="ghost" appearance="outline" size="xs" iconOnly title="Pekan Selanjutnya">
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>

                <div className="flex items-center gap-2">
                  <Button variant="primary" appearance="fill" size="xs" onClick={handleOpenAddSetoranModal} className="font-extrabold">
                    <Plus className="w-3.5 h-3.5 mr-1" />
                    <span>Tambah Setoran</span>
                  </Button>
                  <Button variant="ghost" appearance="outline" size="xs" onClick={handleContinueHafalan} className="font-extrabold text-violet-700 border-violet-300 bg-violet-50 hover:bg-violet-100 dark:bg-violet-950 dark:text-violet-300">
                    <Sparkles className="w-3.5 h-3.5 mr-1 text-violet-600" />
                    <span>Lanjutkan Hafalan</span>
                  </Button>
                  <Button variant="ghost" appearance="outline" size="xs" onClick={handleRepeatHafalan} className="font-extrabold text-orange-700 border-orange-300 bg-orange-50 hover:bg-orange-100 dark:bg-orange-950 dark:text-orange-300">
                    <RefreshCcw className="w-3.5 h-3.5 mr-1 text-orange-600" />
                    <span>Mengulangi Tahfizh</span>
                  </Button>
                </div>
              </div>

              {/* Table Data Pekanan */}
              {loadingSheet ? (
                <div className="p-12 text-center text-slate-400 flex flex-col items-center gap-3">
                  <Loader2 className="w-9 h-9 animate-spin text-emerald-600" />
                  <span className="text-sm font-semibold text-slate-600">Memuat lembar data Tahfizh pekan ini...</span>
                </div>
              ) : (
                <div className="overflow-x-auto rounded-2xl border border-slate-200/80 dark:border-slate-800">
                  <TableRoot fullBleed={false}>
                    <TableHeader className="bg-emerald-100/70 border-b border-emerald-200 text-emerald-950 font-extrabold uppercase text-[11px] tracking-wider dark:bg-emerald-950/60 dark:text-emerald-200">
                      <TableRow>
                        <TableHead className="px-3 py-3 text-center border-r border-emerald-200/60 w-12">No</TableHead>
                        <TableHead className="px-3 py-3 border-r border-emerald-200/60 w-36">Hari / Tanggal</TableHead>
                        <TableHead className="px-3 py-3 border-r border-emerald-200/60 w-44">Tilawah</TableHead>
                        <TableHead className="px-2 py-3 border-r border-emerald-200/60 text-center w-16">Baris</TableHead>
                        <TableHead className="px-3 py-3 border-r border-emerald-200/60">Hafalan Baru</TableHead>
                        <TableHead className="px-2 py-3 border-r border-emerald-200/60 text-center w-16">Baris</TableHead>
                        <TableHead className="px-3 py-3 border-r border-emerald-200/60">Murajaah & Audio Sound</TableHead>
                        <TableHead className="px-2 py-3 border-r border-emerald-200/60 text-center w-16">Lembar</TableHead>
                        <TableHead className="px-3 py-3 border-r border-emerald-200/60 text-center w-28">Status</TableHead>
                        <TableHead className="px-3 py-3 text-center w-20">Aksi</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody className="divide-y divide-slate-200 font-medium dark:divide-slate-800">
                      {weeklySheet.map((row, idx) => {
                        const isToday = row.record_date === todayDateStr
                        const isActiveDay = selectedDayDate ? row.record_date === selectedDayDate : isToday

                        return (
                          <TableRow
                            key={row.record_date}
                            className={`transition-all duration-200 ${
                              isActiveDay
                                ? 'bg-emerald-100/90 font-extrabold dark:bg-emerald-950/70 border-l-4 border-l-emerald-600'
                                : row.isSaved
                                ? 'bg-emerald-50/20 dark:bg-emerald-950/20'
                                : ''
                            }`}
                          >
                            <TableCell className="px-3 py-3 text-center font-extrabold text-slate-700 border-r">{idx + 1}</TableCell>
                            <TableCell className="px-3 py-3 border-r font-bold">
                              <div className="flex items-center gap-1.5">
                                <span className="text-sm font-extrabold text-emerald-900 dark:text-emerald-400">{row.day_name}</span>
                                {isToday && (
                                  <Badge color="warning" size="sm" className="text-[9px] px-1.5 py-0 font-black">
                                    Hari Ini
                                  </Badge>
                                )}
                              </div>
                              <div className="text-[11px] text-slate-500">{row.record_date}</div>
                            </TableCell>
                            <TableCell className="px-2 py-2 border-r">
                            <input
                              type="text"
                              value={row.tilawah_text}
                              onChange={(e) => handleCellChange(idx, 'tilawah_text', e.target.value)}
                              placeholder="Contoh: Surah 2 (Ayat 1-10)"
                              readOnly={viewMode === 'ortu'}
                              className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold focus:ring-2 focus:ring-emerald-500 dark:bg-slate-900 dark:border-slate-700 dark:text-slate-200"
                            />
                          </TableCell>
                          <TableCell className="px-1.5 py-2 border-r text-center">
                            <input
                              type="number"
                              min="0"
                              value={row.tilawah_baris}
                              onChange={(e) => handleCellChange(idx, 'tilawah_baris', e.target.value)}
                              readOnly={viewMode === 'ortu'}
                              className="w-full px-1 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-center focus:ring-2 focus:ring-emerald-500 dark:bg-slate-900 dark:border-slate-700 dark:text-slate-200"
                            />
                          </TableCell>
                          <TableCell className="px-2 py-2 border-r">
                            <div className="flex flex-col gap-1.5">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <div className="group relative inline-flex">
                                  <button
                                    type="button"
                                    onClick={() => handleOpenQuranModal(idx)}
                                    disabled={viewMode === 'ortu'}
                                    title="Pilih Surah & Ayat Al-Qur'an"
                                    className="flex h-8 px-3 items-center justify-center gap-1.5 rounded-xl bg-emerald-100/90 text-emerald-900 font-black text-[11px] hover:bg-emerald-600 hover:text-white transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer shadow-xs disabled:opacity-50 dark:bg-emerald-950/80 dark:text-emerald-200"
                                  >
                                    <BookOpen className="size-3.5" />
                                    <span>{row.hafalan_surah_name ? row.hafalan_surah_name : 'Pilih Surah'}</span>
                                  </button>
                                  <div className="pointer-events-none absolute top-full left-1/2 mt-2 -translate-x-1/2 opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 transition-all duration-200 ease-out z-50 whitespace-nowrap rounded-lg bg-slate-900 px-2.5 py-1 text-[11px] font-bold text-white shadow-xl">
                                    <div className="absolute bottom-full left-1/2 -mb-1 -translate-x-1/2 border-4 border-transparent border-b-slate-900" />
                                    Pilih Surah & Ayat Al-Qur'an
                                  </div>
                                </div>
                                {row.hafalan_surah_number && (
                                  <Badge color="gray" size="sm" className="font-bold">
                                    Ayat {row.hafalan_ayah_start}-{row.hafalan_ayah_end}
                                  </Badge>
                                )}
                                {row.hafalan_predikat && (
                                  <Badge
                                    color={row.hafalan_predikat === 'Mumtaz' ? 'success' : row.hafalan_predikat === 'Jayyid' ? 'warning' : 'error'}
                                    size="sm"
                                    className="font-black text-[9px]"
                                  >
                                    {row.hafalan_predikat}
                                  </Badge>
                                )}
                              </div>
                              {row.hafalan_notes && (
                                <div className="text-[10px] text-emerald-900 font-semibold bg-emerald-50/90 p-1.5 rounded-md border border-emerald-200/80 dark:bg-slate-900 dark:text-emerald-300 dark:border-slate-800">
                                  📝 {row.hafalan_notes}
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="px-1.5 py-2 border-r text-center">
                            <input
                              type="number"
                              min="0"
                              value={row.hafalan_baris}
                              onChange={(e) => handleCellChange(idx, 'hafalan_baris', e.target.value)}
                              readOnly={viewMode === 'ortu'}
                              className="w-full px-1 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-center focus:ring-2 focus:ring-emerald-500 dark:bg-slate-900 dark:border-slate-700 dark:text-slate-200"
                            />
                          </TableCell>
                          <TableCell className="px-2 py-2 border-r">
                            <div className="flex items-center gap-2">
                              <input
                                type="text"
                                value={row.murajaah_text}
                                onChange={(e) => handleCellChange(idx, 'murajaah_text', e.target.value)}
                                placeholder="Juz / Surah Murajaah..."
                                readOnly={viewMode === 'ortu'}
                                className="flex-1 px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold focus:ring-2 focus:ring-emerald-500 dark:bg-slate-900 dark:border-slate-700 dark:text-slate-200"
                              />
                              {row.audio_url && (
                                <Button
                                  type="button"
                                  onClick={() => handlePlayAudio(row.audio_url)}
                                  variant="primary"
                                  appearance="fill"
                                  size="xs"
                                  iconOnly
                                  title="Putar Audio Murajaah"
                                >
                                  {playingAudioUrl === row.audio_url ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                                </Button>
                              )}
                              {(viewMode === 'ortu' || isSuperAdminOrAdmin) && (
                                <>
                                  {isRecording && recordingRowIndex === idx ? (
                                    <Button type="button" onClick={stopRecording} variant="danger" size="xs" className="font-extrabold animate-pulse">
                                      <MicOff className="w-3.5 h-3.5 mr-1" />
                                      <span>{recordingSeconds}s Stop</span>
                                    </Button>
                                  ) : (
                                    <Button type="button" onClick={() => startRecording(idx)} variant="ghost" appearance="outline" size="xs" iconOnly title="Rekam Suara Live">
                                      <Mic className="w-3.5 h-3.5 text-rose-600" />
                                    </Button>
                                  )}
                                </>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="px-1.5 py-2 border-r text-center">
                            <input
                              type="number"
                              min="0"
                              value={row.murajaah_lembar}
                              onChange={(e) => handleCellChange(idx, 'murajaah_lembar', e.target.value)}
                              readOnly={viewMode === 'ortu'}
                              className="w-full px-1 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-center focus:ring-2 focus:ring-emerald-500 dark:bg-slate-900 dark:border-slate-700 dark:text-slate-200"
                            />
                          </TableCell>
                          <TableCell className="px-3 py-3 border-r text-center">
                            {row.isSaved ? (
                              <Badge color="success" size="sm">Tersimpan</Badge>
                            ) : (
                              <Badge color="gray" size="sm">Draft</Badge>
                            )}
                          </TableCell>
                          <TableCell className="px-2 py-2 text-center">
                            <Button
                              type="button"
                              onClick={() => promptSaveConfirmation(idx)}
                              variant={row.isSaved ? 'ghost' : 'success'}
                              appearance="fill"
                              size="xs"
                              iconOnly
                              title="Simpan Hari Ini"
                            >
                              <Save className="w-3.5 h-3.5" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                    </TableBody>
                  </TableRoot>
                </div>
              )}

              {/* Catatan Evaluasi Guru & Ortu */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5">
                    Catatan Evaluasi Guru / Musyrif:
                  </label>
                  <textarea
                    rows={2}
                    value={summaryTeacherNotes}
                    onChange={(e) => setSummaryTeacherNotes(e.target.value)}
                    placeholder="Tuliskan catatan tajwid/kelancaran siswa pekan ini..."
                    readOnly={viewMode === 'ortu'}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200/90 rounded-xl text-xs font-semibold focus:border-[#0E5C44] focus:outline-none focus:ring-4 focus:ring-[#0E5C44]/12 dark:bg-slate-900 dark:border-slate-700 dark:text-slate-200"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5">
                    Catatan Evaluasi Orang Tua:
                  </label>
                  <textarea
                    rows={2}
                    value={summaryParentNotes}
                    onChange={(e) => setSummaryParentNotes(e.target.value)}
                    placeholder="Tuliskan catatan pendampingan dari rumah..."
                    readOnly={viewMode === 'guru' || viewMode === 'musyrif'}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200/90 rounded-xl text-xs font-semibold focus:border-[#0E5C44] focus:outline-none focus:ring-4 focus:ring-[#0E5C44]/12 dark:bg-slate-900 dark:border-slate-700 dark:text-slate-200"
                  />
                </div>
              </div>
            </DialogBody>

            <DialogFooter className="flex flex-wrap items-center justify-between gap-2.5 border-t border-slate-100 bg-slate-50/50 px-6 py-4 shrink-0 dark:bg-slate-900/40 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setShowSheetModal(false)}
                className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-br from-rose-500 via-rose-600 to-red-700 text-white px-4 py-2.5 text-xs font-extrabold border border-rose-300/40 transition-all duration-200 hover:scale-[1.03] active:scale-95 cursor-pointer"
              >
                <div className="flex size-5 items-center justify-center rounded-lg bg-white/20 text-white">
                  <X className="size-3.5 text-white" strokeWidth={2.2} />
                </div>
                <span>Tutup Modal</span>
              </button>

              <MasterActionButton
                variant="primary"
                icon={Save}
                onClick={() => promptSaveConfirmation(null)}
                disabled={savingAll || !selectedStudentId}
                loading={savingAll}
              >
                <span>Simpan Seluruh Pekan Ini</span>
              </MasterActionButton>
            </DialogFooter>
          </Dialog>
        </Backdrop>
        )
      })()}
      {/* Print Option Modal (TailGrids Standard) */}
      <PrintOptionModal
        isOpen={showPrintModal}
        onClose={() => setShowPrintModal(false)}
        onPrint={handlePrintTable}
        onDownload={handleDownloadPdfTable}
        title={`Pencapaian Tahfizh ${currentClassObj?.nama_kelas || 'Rombel'}`}
      />
    </PageContainer>
  )
}
