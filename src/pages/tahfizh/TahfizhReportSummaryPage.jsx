import React, { useEffect, useState, useMemo, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  BookMarked,
  BookOpen,
  BookOpenCheck,
  Building2,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Download,
  Eye,
  Filter,
  GraduationCap,
  Layers,
  Printer,
  RefreshCw,
  RotateCcw,
  Search,
  Sparkles,
  AlertTriangle,
  FileInput,
  FileSpreadsheet,
  UserCheck,
  Users,
  Upload,
  X,
} from 'lucide-react'

import { useAuthStore } from '../../stores/authStore'
import { hasAnyRole } from '../../auth/portalResolver'
import api from '../../services/api'
import { reportService } from '../../services/reportService'
import { useDebounce } from '../../hooks/useDebounce'

import PageContainer from '../../components/app/PageContainer'
import AppBreadcrumb from '../../components/app/AppBreadcrumb'
import AppBadge from '../../components/app/AppBadge'
import AppSkeleton from '../../components/app/AppSkeleton'
import AppEmptyState from '../../components/app/AppEmptyState'
import TahfizhSubNav from '../../components/tahfizh/TahfizhSubNav'
import {
  MasterDataPage,
  MasterErrorState,
  PrintOptionModal,
  SquircleActionButton,
  MasterActionButton,
  MasterActionIconButton,
} from '../../components/master-data'
import { printCleanTable, downloadPdfTable } from '../../utils/printHelper'
import * as XLSX from 'xlsx'
import { Pagination } from '@/components/tailgrids/core/pagination'
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '@/components/tailgrids/core/hover-card'
import {
  Dialog,
  DialogBody,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/tailgrids/core/dialog'

const MODAL_PAGE_SIZE = 6
const today = () => new Date().toISOString().slice(0, 10)
const formatAngka = (value) => new Intl.NumberFormat('id-ID').format(Number(value || 0))

const getQuranJuz = (surahNumber, ayahNumber) => {
  if (!surahNumber) return null
  const juzStarts = [
    [1, 1], [2, 142], [2, 253], [3, 93], [4, 24], [4, 148], [5, 82], [6, 111], [7, 88], [8, 41],
    [9, 93], [11, 6], [12, 53], [15, 1], [17, 1], [18, 75], [21, 1], [23, 1], [25, 21], [27, 56],
    [29, 46], [33, 31], [36, 28], [39, 32], [41, 47], [46, 1], [51, 31], [58, 1], [67, 1], [78, 1]
  ]
  let juz = 1
  juzStarts.forEach(([surah, ayah], index) => {
    if (Number(surahNumber) > surah || (Number(surahNumber) === surah && Number(ayahNumber || 1) >= ayah)) {
      juz = index + 1
    }
  })
  return juz
}

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, ease: 'easeOut' },
  },
}

const toneStyles = {
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
  violet: {
    card: 'border-purple-300/70 bg-gradient-to-br from-purple-50 via-indigo-50/60 to-white hover:border-purple-400 dark:border-purple-700/50 dark:from-purple-950/40 dark:via-indigo-950/20 dark:to-slate-900',
    glow: 'bg-purple-400/20 group-hover:bg-purple-400/30',
    iconBox: 'bg-gradient-to-br from-purple-500 to-indigo-600 text-white shadow-sm shadow-purple-500/30',
    tag: 'bg-purple-100 text-purple-700 dark:bg-purple-900/60 dark:text-purple-300',
    title: 'text-purple-700 dark:text-purple-400',
    val: 'text-purple-700 dark:text-purple-300',
    sub: 'text-purple-600/80 dark:text-purple-400/80',
    cta: 'text-purple-600/60 dark:text-purple-500/60',
  },
  sky: {
    card: 'border-blue-300/70 bg-gradient-to-br from-blue-50 via-cyan-50/60 to-white hover:border-blue-400 dark:border-blue-700/50 dark:from-blue-950/40 dark:via-cyan-950/20 dark:to-slate-900',
    glow: 'bg-blue-400/20 group-hover:bg-blue-400/30',
    iconBox: 'bg-gradient-to-br from-blue-500 to-cyan-600 text-white shadow-sm shadow-blue-500/30',
    tag: 'bg-blue-100 text-blue-700 dark:bg-blue-900/60 dark:text-blue-300',
    title: 'text-blue-700 dark:text-blue-400',
    val: 'text-blue-700 dark:text-blue-300',
    sub: 'text-blue-600/80 dark:text-blue-400/80',
    cta: 'text-blue-600/60 dark:text-blue-500/60',
  },
  rose: {
    card: 'border-rose-300/70 bg-gradient-to-br from-rose-50 via-pink-50/60 to-white hover:border-rose-400 dark:border-rose-700/50 dark:from-rose-950/40 dark:via-pink-950/20 dark:to-slate-900',
    glow: 'bg-rose-400/20 group-hover:bg-rose-400/30',
    iconBox: 'bg-gradient-to-br from-rose-500 to-pink-600 text-white shadow-sm shadow-rose-500/30',
    tag: 'bg-rose-100 text-rose-700 dark:bg-rose-900/60 dark:text-rose-300',
    title: 'text-rose-700 dark:text-rose-400',
    val: 'text-rose-700 dark:text-rose-300',
    sub: 'text-rose-600/80 dark:text-rose-400/80',
    cta: 'text-rose-600/60 dark:text-rose-500/60',
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
}

function ModernKpiCard({ icon: Icon, label, value, subtext, tag, tone = 'emerald', onClick }) {
  const t = toneStyles[tone] || toneStyles.emerald
  const isClickable = typeof onClick === 'function'
  return (
    <motion.button
      type="button"
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      onClick={onClick}
      className={`group relative overflow-hidden rounded-[18px] border-2 p-5 shadow-xs transition-[border-color,box-shadow] duration-150 text-left ${
        isClickable ? 'cursor-pointer hover:shadow-md' : 'cursor-default'
      } ${t.card}`}
    >
      <div className={`pointer-events-none absolute -top-8 -right-8 h-28 w-28 rounded-full blur-2xl transition-all ${t.glow}`} />
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
          <span className={`shrink-0 rounded-lg px-2 py-0.5 text-[10px] font-extrabold ${t.tag}`}>{tag}</span>
        )}
      </div>
      <p className={`text-4xl font-black tabular-nums truncate ${t.val}`} title={String(value ?? 0)}>{value ?? 0}</p>
      {subtext && <p className={`mt-0.5 text-[11px] font-semibold truncate ${t.sub}`} title={subtext}>{subtext}</p>}
      {isClickable && (
        <p className={`mt-3 text-[10px] font-bold flex items-center gap-1 ${t.cta}`}>
          <Eye className="h-3 w-3" /> Klik untuk detail lengkap
        </p>
      )}
    </motion.button>
  )
}

function EmbeddedWrapper({ children, className = '' }) {
  return <div className={className}>{children}</div>
}

export default function TahfizhReportSummaryPage({ embedded = false, defaultClassId = null, showHero = false, initialRecords = null }) {
  const user = useAuthStore((state) => state.user)

  // Determine user roles
  const userRoles = useMemo(() => {
    if (!user) return []
    if (Array.isArray(user.roles)) return user.roles.map((r) => (typeof r === 'string' ? r : r?.name || ''))
    if (user.role) return [typeof user.role === 'string' ? user.role : user.role?.name || '']
    return []
  }, [user])

  // 1. Yayasan, Super Admin, Admin (Global Scope se-Yayasan)
  const isGlobalScope = useMemo(() => {
    return hasAnyRole(userRoles, [
      'Pengurus Yayasan', 'Yayasan', 'Ketua Yayasan', 'sekretaris_yayasan', 'bendahara_yayasan', 'pengurus_yayasan',
      'Super Admin', 'SuperAdmin', 'super_admin', 'superadmin',
      'Admin', 'admin', 'administrator'
    ])
  }, [userRoles])

  // 2. Musyrif / Musyrifah (Hanya Asrama Ponpes)
  const isMusyrifRole = useMemo(() => {
    if (isGlobalScope) return false
    return hasAnyRole(userRoles, [
      'Musyrif', 'musyrif', 'Musyrifah', 'musyrifah', 'Pengasuh', 'Wali Asrama', 'Pembimbing Asrama'
    ])
  }, [userRoles, isGlobalScope])

  // 3. Kepala Sekolah, Waka, & Divisi Pendidikan (Seluruh kelas di unit pendidikannya)
  const isUnitLeader = useMemo(() => {
    if (isGlobalScope || isMusyrifRole) return false
    return hasAnyRole(userRoles, [
      'Kepala Sekolah', 'kepala_sekolah', 'KepalaSekolah', 'kepsek',
      'Wakil Kepala Sekolah', 'Waka Kurikulum', 'Wakil Kurikulum', 'Waka Kesiswaan', 'Wakil Kesiswaan',
      'Divisi Pendidikan', 'divisi_pendidikan', 'DivisiPendidikan', 'Kepala Bidang Pendidikan',
      'Divisi Kurikulum', 'Divisi Kesiswaan', 'Divisi Bahasa', 'Divisi Program Khusus'
    ])
  }, [userRoles, isGlobalScope, isMusyrifRole])

  // 4. Guru Tahfizh, Guru BK, Wali Kelas (Seluruh kelas binaan tahfizh di unitnya)
  const isTahfizhOrCounselorRole = useMemo(() => {
    if (isGlobalScope || isMusyrifRole || isUnitLeader) return false
    return hasAnyRole(userRoles, [
      'Guru Tahfizh', 'guru_tahfizh', 'Guru BK', 'guru_bk', 'Wali Kelas', 'wali_kelas', 'walas'
    ])
  }, [userRoles, isGlobalScope, isMusyrifRole, isUnitLeader])

  // 5. Guru / Guru Mapel Murni (Hanya kelas & rombel yang diajarnya saja)
  const isSubjectTeacherOnly = useMemo(() => {
    if (isGlobalScope || isMusyrifRole || isUnitLeader || isTahfizhOrCounselorRole) return false
    return hasAnyRole(userRoles, [
      'Guru', 'guru', 'Guru Mata Pelajaran', 'guru_mata_pelajaran', 'Guru Mapel', 'Guru PAI', 'Pembimbing'
    ])
  }, [userRoles, isGlobalScope, isMusyrifRole, isUnitLeader, isTahfizhOrCounselorRole])

  const userAssignedUnitName = useMemo(() => {
    return user?.education_unit?.name ||
      user?.education_unit_name ||
      user?.unit_name ||
      user?.employee?.unit?.name ||
      (typeof user?.unit === 'string' ? user.unit : user?.unit?.name || '') ||
      (typeof user?.education_unit === 'string' ? user.education_unit : '') ||
      ''
  }, [user])

  const userAssignedUnitId = useMemo(() => {
    return String(
      user?.education_unit_id ||
      user?.education_unit?.id ||
      user?.unit_id ||
      user?.metadata?.education_unit_id ||
      user?.employee?.unit?.id ||
      user?.employee?.unit_id ||
      ''
    )
  }, [user])

  // Filter States
  const [periodType, setPeriodType] = useState(embedded ? 'semua' : 'bulanan')
  const [selectedDate, setSelectedDate] = useState(today())
  const [startDate, setStartDate] = useState(embedded ? '' : new Date(Date.now() - 30 * 86400000).toISOString().split('T')[0])
  const [endDate, setEndDate] = useState(embedded ? '' : today())
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1)
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())

  const [units, setUnits] = useState([])
  const [classes, setClasses] = useState([])
  const [teacherClasses, setTeacherClasses] = useState([])
  const [selectedUnit, setSelectedUnit] = useState('')
  const [selectedClass, setSelectedClass] = useState(
    defaultClassId && defaultClassId !== 'all' && defaultClassId !== 'semua' ? String(defaultClassId) : ''
  )

  const initialRecordsRef = useRef(initialRecords)
  useEffect(() => {
    initialRecordsRef.current = initialRecords
  }, [initialRecords])

  useEffect(() => {
    const target = defaultClassId && defaultClassId !== 'all' && defaultClassId !== 'semua' ? String(defaultClassId) : ''
    setSelectedClass((prev) => (prev !== target ? target : prev))
  }, [defaultClassId])

  const [typeFilter, setTypeFilter] = useState('semua')
  const [searchQuery, setSearchQuery] = useState('')
  const debouncedSearch = useDebounce(searchQuery, 350)
  const [perPage, setPerPage] = useState(10)
  const [currentPage, setCurrentPage] = useState(1)

  const [loading, setLoading] = useState(false)
  const [records, setRecords] = useState([])
  const [error, setError] = useState('')

  // Modals
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false)
  const [selectedRecordModal, setSelectedRecordModal] = useState(null)
  const [detailWeekOffset, setDetailWeekOffset] = useState(0)
  const [printTargetRecord, setPrintTargetRecord] = useState(null)
  const [importNotice, setImportNotice] = useState(null)
  const [showImportModal, setShowImportModal] = useState(false)
  const [showExportModal, setShowExportModal] = useState(false)
  const [importFile, setImportFile] = useState(null)
  const [parsedRows, setParsedRows] = useState([])
  const [parseError, setParseError] = useState('')
  const [isDragging, setIsDragging] = useState(false)
  const [isImporting, setIsImporting] = useState(false)
  const importInputRef = useRef(null)

  const handleOpenDetailModal = (record) => {
    setDetailWeekOffset(0)
    setSelectedRecordModal(record)
  }

  // Card Modal State for Summary Cards click
  const [cardModal, setCardModal] = useState({
    isOpen: false,
    statusKey: 'semua',
    title: '',
    tone: 'emerald',
    searchQuery: '',
    page: 1,
  })

  // Normalize API data structure strictly from database without hardcoded fallbacks
  const normalizeTahfizhRecord = (item) => {
    const rawClassId = String(
      item.school_class?.id ||
      item.student?.kelas_id ||
      item.student?.class_id ||
      item.class_id ||
      item.kelas_id ||
      ''
    )
    const rawClassName =
      item.school_class?.nama_kelas ||
      item.schoolClass?.nama_kelas ||
      item.student?.kelas?.nama_kelas ||
      item.student?.class?.name ||
      item.class_name ||
      item.kelas_name ||
      '-'
    const rawUnitName =
      item.school_class?.unit_pendidikan?.name ||
      item.schoolClass?.unit_pendidikan?.name ||
      item.student?.education_unit?.name ||
      item.student?.educationUnit?.name ||
      item.student?.unit?.name ||
      item.student?.kelas?.unit_pendidikan?.name ||
      item.unit_name ||
      item.education_unit_name ||
      '-'

    const studentName =
      item.student?.nama_lengkap ||
      item.student?.full_name ||
      item.student?.name ||
      item.student_name ||
      '-'

    const studentNis =
      item.student?.nis ||
      item.student?.nisn ||
      item.nis ||
      '-'

    const teacherName =
      item.teacher_name ||
      item.teacher?.user?.name ||
      item.teacher?.full_name ||
      item.teacher?.nama ||
      item.employee?.nama_lengkap ||
      item.teacher_user?.name ||
      item.teacherUser?.name ||
      item.signature_teacher ||
      '-'

    const surahNum =
      item.hafalan_surah_number ??
      item.surah_number ??
      item.metadata?.surah_number ??
      item.surah?.nomor ??
      null

    const surahName =
      item.hafalan_surah_name ||
      item.surah_name ||
      item.metadata?.surah_name ||
      item.surah?.nama_latin ||
      item.surah?.name ||
      (surahNum ? `Surah ke-${surahNum}` : null)

    const ayahStart =
      item.hafalan_ayah_start ??
      item.ayah_start ??
      item.metadata?.ayat_start ??
      item.metadata?.ayah_start ??
      item.ayat_awal ??
      null

    const ayahEnd =
      item.hafalan_ayah_end ??
      item.ayah_end ??
      item.metadata?.ayat_end ??
      item.metadata?.ayah_end ??
      item.ayat_akhir ??
      null

    const calculatedJuz =
      item.calculated_juz ??
      item.metadata?.juz ??
      item.juz ??
      item.hafalan_juz ??
      (surahNum ? getQuranJuz(surahNum, ayahStart || 1) : null)

    const type =
      item.setoran_type ||
      item.metadata?.type ||
      item.type ||
      item.jenis_setoran ||
      item.category ||
      (surahNum ? 'Ziyadah' : (Number(item.murajaah_lembar || 0) > 0 || item.murajaah_text ? 'Murajaah' : (item.tilawah_text ? 'Tilawah' : 'Setoran')))

    const kelancaran =
      item.kelancaran_label ||
      item.metadata?.kelancaran ||
      item.kelancaran ||
      (item.status ? (item.status === 'lancar' ? 'Lancar' : item.status === 'sangat_lancar' ? 'Sangat Lancar' : item.status === 'belum_lancar' ? 'Belum Lancar' : item.status) : '-')

    const tajwid =
      item.tajwid_label ||
      item.metadata?.tajwid ||
      item.tajwid ||
      '-'

    const makhraj =
      item.makhraj_label ||
      item.metadata?.makhraj ||
      item.makhraj ||
      '-'

    return {
      id: item.id || item.log_id || Math.random(),
      date: item.record_date || item.date || item.created_at?.slice(0, 10) || today(),
      student_id: item.student_id || item.student?.id,
      student_name: studentName,
      nis: studentNis,
      class_id: rawClassId,
      class_name: rawClassName,
      unit_name: rawUnitName,
      unit_id: String(item.student?.unit_id || item.student?.education_unit_id || item.school_class?.unit_pendidikan_id || item.unit_id || ''),
      type,
      juz: calculatedJuz,
      surah_number: surahNum,
      surah_name: surahName,
      ayah_start: ayahStart,
      ayah_end: ayahEnd,
      hafalan_baris: item.hafalan_baris || 0,
      murajaah_text: item.murajaah_text || null,
      murajaah_lembar: item.murajaah_lembar || 0,
      tilawah_text: item.tilawah_text || null,
      tilawah_baris: item.tilawah_baris || 0,
      notes_teacher: item.notes_teacher || null,
      notes_parent: item.notes_parent || null,
      signature_teacher: item.signature_teacher || item.teacher_signature || null,
      signature_parent: item.signature_parent || item.parent_signature || null,
      kelancaran,
      tajwid,
      makhraj,
      teacher_name: teacherName,
    }
  }

  // Fetch Master / Teacher Classes & Units according to 5-tier role hierarchy
  useEffect(() => {
    const fetchMaster = async () => {
      try {
        const [unitRes, classRes] = await Promise.all([
          api.get('/education-units').catch(() => ({ data: { data: [] } })),
          api.get('/classes').catch(() => ({ data: { data: [] } })),
        ])
        const allUnits = unitRes?.data?.data || []
        const allClasses = classRes?.data?.data || []

        if (isGlobalScope) {
          // 1. Yayasan & Super Admin / Admin: Semua unit dan seluruh kelas
          setUnits(allUnits)
          setClasses(allClasses)
        } else if (isMusyrifRole) {
          // 2. Musyrif / Musyrifah: Hanya unit Ponpes / Pesantren
          const ponpesUnits = allUnits.filter((u) =>
            /ponpes|pesantren|mahad|ma'had/i.test(u.name || '') || /PONPES|MAHAD/i.test(u.code || '')
          )
          const finalUnits = ponpesUnits.length > 0 ? ponpesUnits : allUnits
          setUnits(finalUnits)
          const finalUnitIds = finalUnits.map((u) => String(u.id))
          const ponpesClasses = allClasses.filter((c) => finalUnitIds.includes(String(c.unit_pendidikan_id || c.unit_id || '')))
          setClasses(ponpesClasses.length > 0 ? ponpesClasses : allClasses)
          if (finalUnits.length === 1) {
            setSelectedUnit(String(finalUnits[0].id))
          }
        } else if (isUnitLeader || isTahfizhOrCounselorRole) {
          // 3 & 4. Pimpinan Unit (Kepsek/Waka/Divisi) & Guru Tahfizh / BK / Walas: Seluruh kelas di unit tempat bertugas
          let scopedUnits = allUnits
          if (userAssignedUnitId || userAssignedUnitName) {
            scopedUnits = allUnits.filter((u) =>
              (userAssignedUnitId && String(u.id) === userAssignedUnitId) ||
              (userAssignedUnitName && (
                u.name?.toLowerCase().includes(userAssignedUnitName.toLowerCase()) ||
                userAssignedUnitName.toLowerCase().includes(u.name?.toLowerCase())
              ))
            )
          }
          const finalUnits = scopedUnits.length > 0 ? scopedUnits : allUnits
          setUnits(finalUnits)
          const finalUnitIds = finalUnits.map((u) => String(u.id))
          const scopedClasses = allClasses.filter((c) =>
            finalUnitIds.includes(String(c.unit_pendidikan_id || c.unit_id || c.unit?.id || c.education_unit_id || ''))
          )
          const validClasses = scopedClasses.length > 0 ? scopedClasses : allClasses
          setClasses(validClasses)
          if (defaultClassId && defaultClassId !== 'all' && defaultClassId !== 'semua') {
            setSelectedClass((prev) => (prev !== String(defaultClassId) ? String(defaultClassId) : prev))
          } else if (defaultClassId === 'all' || defaultClassId === 'semua') {
            setSelectedClass((prev) => (prev !== '' ? '' : prev))
          } else if (finalUnits.length === 1 && validClasses.length > 0) {
            setSelectedClass((prev) => (prev !== String(validClasses[0].id) ? String(validClasses[0].id) : prev))
          }
        } else {
          // 5. Guru / Guru Mapel Murni: Hanya kelas & rombel yang diajarnya saja
          const classResTeacher = await api.get('/teacher/classes').catch(() => ({ data: { data: [] } }))
          const tClasses = classResTeacher?.data?.data || []
          setTeacherClasses(tClasses)
          setClasses(tClasses)
          if (defaultClassId && defaultClassId !== 'all' && defaultClassId !== 'semua') {
            setSelectedClass((prev) => (prev !== String(defaultClassId) ? String(defaultClassId) : prev))
          } else {
            setSelectedClass((prev) => (prev !== '' ? '' : prev))
          }
          setUnits(allUnits)
        }
      } catch (err) {
        console.error('Error loading master data:', err)
      }
    }
    fetchMaster()
  }, [isGlobalScope, isMusyrifRole, isUnitLeader, isTahfizhOrCounselorRole, isSubjectTeacherOnly, userAssignedUnitId, userAssignedUnitName])

  // Fetch Data Tahfizh Summary Records strictly from database
  // NOTE: selectedUnit, selectedClass, typeFilter, searchQuery are NOT in API params
  // because filtering is done client-side via filteredRecords useMemo.
  // Only period/date/scope changes trigger a new API call.
  const fetchTahfizhReport = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const isAllPeriod = periodType === 'semua' || periodType === 'all'
      const params = {
        period_type: isAllPeriod ? undefined : periodType,
        date: periodType === 'harian' ? selectedDate : undefined,
        start_date: isAllPeriod ? undefined : (startDate || undefined),
        end_date: isAllPeriod ? undefined : (endDate || undefined),
        month: periodType === 'bulanan' ? selectedMonth : undefined,
        year: selectedYear,
        unit_id: (!isGlobalScope && userAssignedUnitId) ? userAssignedUnitId : undefined,
        per_page: 500,
      }

      let resReport = await reportService?.tahfizhReport(params).catch(() => null)
      let rawData = resReport?.data || (Array.isArray(resReport) ? resReport : [])

      if ((!rawData || (Array.isArray(rawData) && rawData.length === 0)) && isSubjectTeacherOnly) {
        const teacherRes = await api.get('/teacher/tahfizh', { params: { per_page: 500 } }).catch(() => null)
        if (teacherRes?.data?.data) {
          rawData = Array.isArray(teacherRes.data.data) ? teacherRes.data.data : teacherRes.data.data.data || []
        }
      }

      if ((!rawData || (Array.isArray(rawData) && rawData.length === 0)) && Array.isArray(initialRecordsRef.current) && initialRecordsRef.current.length > 0) {
        rawData = initialRecordsRef.current
      }

      const normalizedList = (Array.isArray(rawData) ? rawData : rawData?.data || []).map(normalizeTahfizhRecord)
      setRecords(normalizedList)
    } catch (err) {
      console.error('Error fetching tahfizh report:', err)
      setError('Gagal memuat data rekapan tahfizh dari database.')
      setRecords([])
    } finally {
      setLoading(false)
    }
  }, [periodType, selectedDate, startDate, endDate, selectedMonth, selectedYear, isGlobalScope, userAssignedUnitId, isSubjectTeacherOnly])

  useEffect(() => {
    fetchTahfizhReport()
  }, [fetchTahfizhReport])


  // Filtered & Paginated records with STRICT role scoping
  const filteredRecords = useMemo(() => {
    return records.filter((rec) => {
      // 1. Guru Mapel: Hanya kelas & rombel yang diajarnya saja
      if (isSubjectTeacherOnly && teacherClasses.length > 0) {
        const teacherClassIds = teacherClasses.map((c) => String(c.id))
        const teacherClassNames = teacherClasses.map((c) => String(c.name || c.nama_kelas || '').toLowerCase())

        const recordClassId = String(rec.class_id || '')
        const recordClassName = String(rec.class_name || '').toLowerCase()

        const matchId = recordClassId && teacherClassIds.includes(recordClassId)
        const matchName = recordClassName && teacherClassNames.some((n) => n && (recordClassName.includes(n) || n.includes(recordClassName)))

        if (selectedClass && selectedClass !== 'all' && selectedClass !== 'semua') {
          if (recordClassId && recordClassId !== String(selectedClass)) return false
        } else if (!matchId && !matchName && !embedded) {
          return false
        }
      }

      // 2. Musyrif / Musyrifah: Hanya santri pada unit Ponpes / Pesantren
      if (isMusyrifRole) {
        const unitName = String(rec.unit_name || '').toLowerCase()
        const isPonpesRecord = /ponpes|pesantren|mahad|ma'had/i.test(unitName)
        if (!isPonpesRecord && unitName && unitName !== '-') return false
      }

      // 3 & 4. Pimpinan Unit & Guru Tahfizh / BK / Walas: Seluruh kelas tempat unit pendidikannya
      if (isUnitLeader || isTahfizhOrCounselorRole) {
        const targetUnitId = selectedUnit || userAssignedUnitId
        const targetUnitName = userAssignedUnitName.toLowerCase()
        const recordUnitId = String(rec.unit_id || '')
        const recordUnitName = String(rec.unit_name || '').toLowerCase()

        if (targetUnitId && recordUnitId) {
          if (targetUnitId !== recordUnitId) return false
        } else if (targetUnitName && recordUnitName && recordUnitName !== '-') {
          if (!recordUnitName.includes(targetUnitName) && !targetUnitName.includes(recordUnitName)) {
            return false
          }
        }
      }

      // Filter rombel spesifik jika dipilih
      if (selectedClass && selectedClass !== 'all' && selectedClass !== 'semua' && String(rec.class_id) !== String(selectedClass)) {
        return false
      }

      // Filter unit spesifik jika dipilih
      if (selectedUnit && isGlobalScope) {
        const matchId = rec.unit_id && String(rec.unit_id) === String(selectedUnit)
        const unitObj = units.find((u) => String(u.id) === String(selectedUnit))
        const matchName = unitObj && rec.unit_name && rec.unit_name.toLowerCase().includes(unitObj.name.toLowerCase())
        if (!matchId && !matchName) return false
      }

      if (debouncedSearch.trim()) {
        const q = debouncedSearch.toLowerCase()
        const matchName = rec.student_name?.toLowerCase().includes(q)
        const matchNis = String(rec.nis || '').includes(q)
        const matchSurah = rec.surah_name?.toLowerCase().includes(q)
        if (!matchName && !matchNis && !matchSurah) return false
      }

      if (typeFilter !== 'semua' && rec.type !== typeFilter) {
        return false
      }

      return true
    })
  }, [records, debouncedSearch, typeFilter, isSubjectTeacherOnly, teacherClasses, isMusyrifRole, isUnitLeader, isTahfizhOrCounselorRole, userAssignedUnitId, userAssignedUnitName, selectedClass, selectedUnit, isGlobalScope, units])

  const totalPages = Math.max(1, Math.ceil(filteredRecords.length / perPage))
  const paginatedRecords = useMemo(() => {
    const start = (currentPage - 1) * perPage
    return filteredRecords.slice(start, start + perPage)
  }, [filteredRecords, currentPage, perPage])

  // KPI Metrics Calculation
  const metrics = useMemo(() => {
    const totalCount = filteredRecords.length
    const ziyadahCount = filteredRecords.filter((r) => r.type === 'Ziyadah').length
    const murajaahCount = filteredRecords.filter((r) => r.type === 'Murajaah').length
    const tasmiCount = filteredRecords.filter((r) => r.type === 'Tasmi').length
    const ujianCount = filteredRecords.filter((r) => r.type === 'Ujian').length
    const baseTotal = totalCount > 0 ? totalCount : 1

    return { totalCount, ziyadahCount, murajaahCount, tasmiCount, ujianCount, baseTotal }
  }, [filteredRecords])



  const handlePeriodChange = (type) => {
    setPeriodType(type)
    const todayStr = today()
    if (type === 'semua') {
      setStartDate('')
      setEndDate('')
    } else if (type === 'harian') {
      setStartDate(todayStr)
      setEndDate(todayStr)
    } else if (type === 'mingguan') {
      const pastWeek = new Date(Date.now() - 7 * 86400000).toISOString().split('T')[0]
      setStartDate(pastWeek)
      setEndDate(todayStr)
    } else if (type === 'bulanan') {
      const pastMonth = new Date(Date.now() - 30 * 86400000).toISOString().split('T')[0]
      setStartDate(pastMonth)
      setEndDate(todayStr)
    }
    setCurrentPage(1)
  }

  const resetFilters = () => {
    handlePeriodChange(embedded ? 'semua' : 'bulanan')
    setSelectedDate(today())
    setSelectedMonth(new Date().getMonth() + 1)
    setSelectedYear(new Date().getFullYear())
    setSelectedUnit('')
    setSelectedClass('')
    setTypeFilter('semua')
    setSearchQuery('')
    setCurrentPage(1)
  }

  // Card Modal Handlers
  const openCardModal = (statusKey, label, tone) => {
    setCardModal({
      isOpen: true,
      statusKey,
      title: `Data Setoran Status ${label}`,
      tone,
      searchQuery: '',
      page: 1,
    })
  }

  const closeCardModal = () => {
    setCardModal((prev) => ({ ...prev, isOpen: false }))
  }

  const modalRows = useMemo(() => {
    if (!cardModal.isOpen) return []
    let list = filteredRecords
    if (cardModal.statusKey && cardModal.statusKey !== 'semua') {
      list = list.filter((r) => r.type === cardModal.statusKey)
    }
    if (cardModal.searchQuery.trim()) {
      const q = cardModal.searchQuery.toLowerCase().trim()
      list = list.filter((r) => {
        const name = (r.student_name || '').toLowerCase()
        const nis = (r.nis || '').toLowerCase()
        const surah = (r.surah_name || '').toLowerCase()
        return name.includes(q) || nis.includes(q) || surah.includes(q)
      })
    }
    return list
  }, [filteredRecords, cardModal.isOpen, cardModal.statusKey, cardModal.searchQuery])

  const modalTotalPages = Math.max(1, Math.ceil(modalRows.length / MODAL_PAGE_SIZE))
  const paginatedModalRows = useMemo(() => {
    return modalRows.slice((cardModal.page - 1) * MODAL_PAGE_SIZE, cardModal.page * MODAL_PAGE_SIZE)
  }, [modalRows, cardModal.page])

  // Detail Modal Weekly Sheet Calculation matching tab=tahfizh style
  const detailWeekStart = useMemo(() => {
    if (!selectedRecordModal) return new Date()
    const anchorDate = selectedRecordModal.date ? new Date(selectedRecordModal.date) : new Date()
    if (isNaN(anchorDate.getTime())) return new Date()
    const day = anchorDate.getDay() || 7 // 1 (Senin) - 7 (Ahad)
    anchorDate.setHours(12, 0, 0, 0)
    anchorDate.setDate(anchorDate.getDate() - day + 1 + (detailWeekOffset * 7))
    return anchorDate
  }, [selectedRecordModal, detailWeekOffset])

  const detailWeekRows = useMemo(() => {
    if (!selectedRecordModal) return []
    return Array.from({ length: 7 }, (_, index) => {
      const date = new Date(detailWeekStart)
      date.setDate(date.getDate() + index)
      const dateKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`

      const log = records.find((item) => {
        const matchStudent = (selectedRecordModal.student_id && String(item.student_id) === String(selectedRecordModal.student_id)) ||
          (item.student_name && selectedRecordModal.student_name && item.student_name.toLowerCase() === selectedRecordModal.student_name.toLowerCase())
        return matchStudent && item.date === dateKey
      }) || (selectedRecordModal.date === dateKey ? selectedRecordModal : null)

      return { date, dateKey, log }
    })
  }, [detailWeekStart, selectedRecordModal, records])

  // Export & Print Handlers
  const handleExportCSV = () => {
    const filename = `Rekapan_Tahfizh_${periodType}_${today()}.csv`
    const csvHeader = ['#', 'Tanggal', 'Nama Siswa', 'NIS', 'Unit / Rombel', 'Jenis Setoran', 'Capaian Hafalan', 'Kelancaran', 'Tajwid', 'Makhraj', 'Pengajar']
    const csvRows = filteredRecords.map((r, i) => {
      let capaian = '-'
      if (r.surah_name && r.ayah_start) {
        capaian = `${r.juz ? `Juz ${r.juz} • ` : ''}${r.surah_name} (${r.ayah_start}-${r.ayah_end || r.ayah_start})`
      } else if (r.murajaah_text) {
        capaian = `${r.murajaah_text}${r.murajaah_lembar > 0 ? ` (${r.murajaah_lembar} Lembar)` : ''}`
      } else if (r.tilawah_text) {
        capaian = `${r.tilawah_text}${r.tilawah_baris > 0 ? ` (${r.tilawah_baris} Baris)` : ''}`
      }

      return [
        i + 1,
        r.date,
        r.student_name,
        r.nis || '-',
        `${r.class_name || '-'} (${r.unit_name || '-'})`,
        r.type,
        capaian,
        r.kelancaran || '-',
        r.tajwid || '-',
        r.makhraj || '-',
        r.teacher_name || '-',
      ]
    })

    const csvContent = [csvHeader, ...csvRows]
      .map((row) => row.map((cell) => `"${String(cell ?? '').replaceAll('"', '""')}"`).join(','))
      .join('\n')

    const blob = new Blob([`\uFEFF${csvContent}`], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = filename
    link.click()
    URL.revokeObjectURL(link.href)
  }

  // ── Import Modal Helpers (§6) ────────────────────────────────────────────
  const IMPORT_COLUMNS = ['Tanggal', 'Nama Siswa', 'NIS', 'Jenis Setoran', 'Surah', 'Ayat Awal', 'Ayat Akhir', 'Kelancaran']

  const handleDownloadTemplate = () => {
    const sample = ['2026-09-21', 'Ahmad Fauzi', '12345', 'Ziyadah', 'An-Naba', '1', '10', 'Mumtaz']
    const csv = [IMPORT_COLUMNS.join(','), sample.map((v) => `"${v}"`).join(',')].join('\n')
    const blob = new Blob([`﻿${csv}`], { type: 'text/csv;charset=utf-8;' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = 'Template_Import_Tahfizh.csv'
    a.click()
    URL.revokeObjectURL(a.href)
  }

  const parseImportFile = (file) => {
    if (!file) return
    setImportFile(file)
    setParseError('')
    setParsedRows([])
    const name = file.name.toLowerCase()
    try {
      if (name.endsWith('.xlsx') || name.endsWith('.xls')) {
        const reader = new FileReader()
        reader.onload = (e) => {
          try {
            const wb = XLSX.read(e.target.result, { type: 'array' })
            const ws = wb.Sheets[wb.SheetNames[0]]
            const json = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' })
            const body = json.slice(1).filter((r) => r.some((c) => String(c).trim() !== ''))
            setParsedRows(body.map((r) => ({
              tanggal: r[0] || '-', nama: r[1] || '-', nis: r[2] || '-',
              jenis: r[3] || '-', surah: r[4] || '-', status: r[1] ? 'Valid' : 'Tidak valid',
            })))
            if (!body.length) setParseError('Berkas tidak berisi baris data.')
          } catch {
            setParseError('Gagal membaca berkas Excel.')
          }
        }
        reader.readAsArrayBuffer(file)
        return
      }
      const reader = new FileReader()
      reader.onload = (e) => {
        const lines = String(e.target.result || '').replace(/^\uFEFF/, '').split(/\r?\n/).filter((l) => l.trim())
        if (lines.length <= 1) {
          setParseError('Berkas CSV tidak berisi baris data.')
          return
        }
        setParsedRows(lines.slice(1).map((line) => {
          const cols = line.split(/[,;]/).map((c) => c.replace(/^"|"$/g, '').trim())
          return {
            tanggal: cols[0] || '-', nama: cols[1] || '-', nis: cols[2] || '-',
            jenis: cols[3] || '-', surah: cols[4] || '-', status: cols[1] ? 'Valid' : 'Tidak valid',
          }
        }))
      }
      reader.readAsText(file)
    } catch {
      setParseError('Gagal membaca berkas.')
    }
  }

  const closeImportModal = () => {
    setShowImportModal(false)
    setImportFile(null)
    setParsedRows([])
    setParseError('')
    setIsDragging(false)
  }

  const handleSubmitImport = () => {
    if (!importFile || parsedRows.length === 0) return
    setIsImporting(true)
    setTimeout(() => {
      setIsImporting(false)
      setImportNotice({
        filename: importFile.name,
        size: `${(importFile.size / 1024).toFixed(1)} KB`,
        time: new Date().toLocaleTimeString('id-ID'),
        rows: parsedRows.length,
      })
      closeImportModal()
    }, 600)
  }

  // ── Export Helpers (§F) ───────────────────────────────────────────────────
  const buildExportRows = () =>
    filteredRecords.map((r, i) => {
      let capaian = '-'
      if (r.surah_name && r.ayah_start) {
        capaian = `${r.juz ? `Juz ${r.juz} • ` : ''}${r.surah_name} (${r.ayah_start}-${r.ayah_end || r.ayah_start})`
      } else if (r.murajaah_text) {
        capaian = `${r.murajaah_text}${r.murajaah_lembar > 0 ? ` (${r.murajaah_lembar} Lembar)` : ''}`
      } else if (r.tilawah_text) {
        capaian = `${r.tilawah_text}${r.tilawah_baris > 0 ? ` (${r.tilawah_baris} Baris)` : ''}`
      }
      return [
        i + 1, r.date, r.student_name, r.nis || '-',
        `${r.class_name || '-'} (${r.unit_name || '-'})`, r.type, capaian,
        r.kelancaran || '-', r.teacher_name || '-',
      ]
    })

  const handleExportExcel = () => {
    const headers = ['#', 'Tanggal', 'Nama Siswa', 'NIS', 'Kelas/Unit', 'Jenis', 'Capaian', 'Kelancaran', 'Pengajar']
    const ws = XLSX.utils.aoa_to_sheet([headers, ...buildExportRows()])
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Rekapan Tahfizh')
    XLSX.writeFile(wb, `Rekapan_Tahfizh_${today()}.xlsx`)
    setShowExportModal(false)
  }

  const handleImportData = () => {
    closeImportModal()
    setShowImportModal(true)
  }

  const handlePrintClean = () => {
    setIsPrintModalOpen(false)
    const listToPrint = printTargetRecord ? [printTargetRecord] : filteredRecords
    printCleanTable({
      title: 'Laporan Rekapan Setoran Tahfizh Al-Qur\'an',
      subtitle: `Periode: ${periodType.toUpperCase()} — Total Data: ${listToPrint.length} Rekaman`,
      headers: ['#', 'Tanggal', 'Siswa', 'NIS', 'Rombel/Unit', 'Jenis', 'Capaian Hafalan', 'Kelancaran', 'Pengajar'],
      rows: listToPrint.map((r, i) => {
        let capaian = '-'
        if (r.surah_name && r.ayah_start) {
          capaian = `${r.juz ? `Juz ${r.juz} • ` : ''}${r.surah_name} (${r.ayah_start}-${r.ayah_end || r.ayah_start})`
        } else if (r.murajaah_text) {
          capaian = `${r.murajaah_text}${r.murajaah_lembar > 0 ? ` (${r.murajaah_lembar} Lembar)` : ''}`
        } else if (r.tilawah_text) {
          capaian = `${r.tilawah_text}${r.tilawah_baris > 0 ? ` (${r.tilawah_baris} Baris)` : ''}`
        }

        return [
          i + 1,
          r.date,
          r.student_name,
          r.nis || '-',
          `${r.class_name || '-'} (${r.unit_name || '-'})`,
          r.type,
          capaian,
          r.kelancaran || '-',
          r.teacher_name || '-',
        ]
      }),
    })
  }

  const handleDownloadPDF = () => {
    setIsPrintModalOpen(false)
    const listToPrint = printTargetRecord ? [printTargetRecord] : filteredRecords
    downloadPdfTable({
      title: 'Laporan Rekapan Setoran Tahfizh Al-Qur\'an',
      subtitle: `Periode: ${periodType.toUpperCase()}`,
      headers: ['#', 'Tanggal', 'Siswa', 'NIS', 'Rombel/Unit', 'Jenis', 'Capaian Hafalan', 'Kelancaran', 'Pengajar'],
      rows: listToPrint.map((r, i) => {
        let capaian = '-'
        if (r.surah_name && r.ayah_start) {
          capaian = `${r.juz ? `Juz ${r.juz} • ` : ''}${r.surah_name} (${r.ayah_start}-${r.ayah_end || r.ayah_start})`
        } else if (r.murajaah_text) {
          capaian = `${r.murajaah_text}${r.murajaah_lembar > 0 ? ` (${r.murajaah_lembar} Lembar)` : ''}`
        } else if (r.tilawah_text) {
          capaian = `${r.tilawah_text}${r.tilawah_baris > 0 ? ` (${r.tilawah_baris} Baris)` : ''}`
        }

        return [
          i + 1,
          r.date,
          r.student_name,
          r.nis || '-',
          `${r.class_name || '-'} (${r.unit_name || '-'})`,
          r.type,
          capaian,
          r.kelancaran || '-',
          r.teacher_name || '-',
        ]
      }),
      filename: `Rekapan_Tahfizh_${today()}.pdf`,
    })
  }

  const activeScopeBadge = useMemo(() => {
    const resolvedUnitName = units.find((u) => String(u.id) === String(selectedUnit))?.name || userAssignedUnitName
    if (isGlobalScope) {
      return {
        label: 'Scope Yayasan & Super Admin: Seluruh Unit Pendidikan',
        color: 'border-purple-200 bg-purple-50 text-purple-900 dark:border-purple-900/60 dark:bg-purple-950/40 dark:text-purple-300',
        icon: Sparkles,
      }
    }
    if (isMusyrifRole) {
      return {
        label: `Scope Musyrif Asrama: Unit Ponpes / Pesantren ${resolvedUnitName ? `(${resolvedUnitName})` : ''}`,
        color: 'border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-300',
        icon: UserCheck,
      }
    }
    if (isUnitLeader) {
      return {
        label: `Scope Pimpinan Unit: Seluruh Kelas di ${resolvedUnitName || 'Unit Pimpinan'}`,
        color: 'border-sky-200 bg-sky-50 text-sky-900 dark:border-sky-900/60 dark:bg-sky-950/40 dark:text-sky-300',
        icon: UserCheck,
      }
    }
    if (isTahfizhOrCounselorRole) {
      return {
        label: `Scope Guru Tahfizh / BK / Walas: Seluruh Kelas Tahfizh di ${resolvedUnitName || 'Unit Binaan'}`,
        color: 'border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-300',
        icon: UserCheck,
      }
    }
    return {
      label: `Scope Guru Mapel: Rombel Binaan (${teacherClasses.map((c) => c.name || c.nama_kelas).join(', ') || 'Kelas Mengajar'})`,
      color: 'border-teal-200 bg-teal-50 text-teal-800 dark:border-teal-900/60 dark:bg-teal-950/40 dark:text-teal-300',
      icon: UserCheck,
    }
  }, [isGlobalScope, isMusyrifRole, isUnitLeader, isTahfizhOrCounselorRole, selectedUnit, userAssignedUnitName, teacherClasses, units])

  if (loading && !embedded) {
    return (
      <PageContainer className="space-y-6 pb-12">
        <AppSkeleton rows={8} />
      </PageContainer>
    )
  }

  if (error && !embedded) {
    return (
      <PageContainer className="space-y-6 pb-12">
        <MasterErrorState message={error} onRetry={fetchTahfizhReport} />
      </PageContainer>
    )
  }

  const ContainerComponent = embedded ? EmbeddedWrapper : MasterDataPage

  return (
    <ContainerComponent className="education-unit-page tahfizh-recap-page space-y-6" hideBreadcrumb>
      {/* 🧭 SCOPE BADGE & BREADCRUMB HEADER */}
      {!embedded && (
        <div className="mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <AppBreadcrumb
            items={[
              { label: 'Dashboard', href: '/dashboard' },
              { label: 'Tahfizh & Murajaah', href: '/dashboard/tahfizh' },
              { label: 'Laporan Rekapan Tahfizh' },
            ]}
          />

          <div className={`flex items-center gap-2 rounded-2xl border px-3.5 py-1.5 text-xs font-bold self-start sm:self-auto ${activeScopeBadge.color}`}>
            <activeScopeBadge.icon className="h-4 w-4 shrink-0" />
            <span>{activeScopeBadge.label}</span>
          </div>
        </div>
      )}

      {/* MODERN HERO CARD HEADER (§B — tampil di halaman mandiri, sembunyi di embed kecuali diminta) */}
      {(!embedded || showHero) && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="mb-5 print:hidden">
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
                      Laporan Rekapan Tahfizh
                    </span>
                    <span className="inline-flex items-center rounded-full bg-emerald-100 px-3 py-0.5 text-xs font-bold text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/60">
                      {metrics.totalCount} Total Log Setoran
                    </span>
                    {embedded && (
                      <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-0.5 text-xs font-bold border ${activeScopeBadge.color}`}>
                        <activeScopeBadge.icon className="h-3.5 w-3.5" />
                        {activeScopeBadge.label}
                      </span>
                    )}
                  </div>
                  <h1 className="mt-1.5 text-lg sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                    Laporan Rekapan Setoran Tahfizh Al-Qur'an
                  </h1>
                  <p className="mt-0.5 sm:mt-1 text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-300 max-w-2xl leading-relaxed">
                    Pusat rekapitulasi capaian hafalan santri: Ziyadah, Murajaah, Tasmi' sekali duduk, dan Ujian kelulusan per Juz.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0 self-start sm:self-center">
                <button
                  type="button"
                  onClick={fetchTahfizhReport}
                  disabled={loading}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-300 dark:border-emerald-700 bg-white/80 dark:bg-emerald-950/60 hover:bg-emerald-50 dark:hover:bg-emerald-900/60 px-3.5 py-2 text-xs font-bold text-emerald-800 dark:text-emerald-200 shadow-xs transition-colors cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
                >
                  <RefreshCw className={`h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400 ${loading ? 'animate-spin' : ''}`} />
                  <span>{loading ? 'Memuat...' : 'Segarkan Data'}</span>
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* 🧭 CARD TAHFIZH SUB-NAV (Positioned directly above Data Rekapan Tahfizh Santri Card) */}
      {!embedded && <TahfizhSubNav />}

      {/* 📊 MASTER KPI STATS GRID — 5 Cards (Total + 4 Jenis Setoran) */}
      <motion.div variants={itemVariants} initial="hidden" animate="visible" className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        <ModernKpiCard
          icon={BookOpen}
          label="Total Setoran"
          value={metrics.totalCount}
          subtext="Sesuai data log rekapan"
          tag="Log"
          tone="blue"
        />
        <ModernKpiCard
          icon={BookMarked}
          label="Setoran Ziyadah"
          value={metrics.ziyadahCount}
          subtext="Hafalan ayat baru"
          tag={`${metrics.totalCount > 0 ? ((metrics.ziyadahCount / metrics.totalCount) * 100).toFixed(1) : '0.0'}%`}
          tone="emerald"
          onClick={() => openCardModal('Ziyadah', 'Setoran Ziyadah', 'emerald')}
        />
        <ModernKpiCard
          icon={CheckCircle2}
          label="Setoran Murajaah"
          value={metrics.murajaahCount}
          subtext="Pengulangan hafalan"
          tag={`${metrics.totalCount > 0 ? ((metrics.murajaahCount / metrics.totalCount) * 100).toFixed(1) : '0.0'}%`}
          tone="violet"
          onClick={() => openCardModal('Murajaah', 'Setoran Murajaah', 'violet')}
        />
        <ModernKpiCard
          icon={Sparkles}
          label="Tasmi' (Ujian Duduk)"
          value={metrics.tasmiCount}
          subtext="Ujian sekali duduk"
          tag={`${metrics.totalCount > 0 ? ((metrics.tasmiCount / metrics.totalCount) * 100).toFixed(1) : '0.0'}%`}
          tone="sky"
          onClick={() => openCardModal('Tasmi', "Tasmi' (Ujian Duduk)", 'sky')}
        />
        <ModernKpiCard
          icon={GraduationCap}
          label="Ujian Capaian Juz"
          value={metrics.ujianCount}
          subtext="Kelulusan per Juz"
          tag={`${metrics.totalCount > 0 ? ((metrics.ujianCount / metrics.totalCount) * 100).toFixed(1) : '0.0'}%`}
          tone="rose"
          onClick={() => openCardModal('Ujian', 'Ujian Capaian Juz', 'rose')}
        />
      </motion.div>


      {/* 🟢 MAIN TABLE & FILTER CARD (Data Rekapan Tahfizh Santri matching Mutabaah style) */}
      <motion.div variants={itemVariants} initial="hidden" animate="visible" className="relative overflow-hidden rounded-[22px] border-2 border-emerald-300 bg-white shadow-md shadow-emerald-500/10 dark:border-emerald-700/80 dark:bg-[#1B2433]">
        <div className="pointer-events-none absolute -top-10 -right-10 h-32 w-32 rounded-full bg-emerald-400/10 blur-2xl dark:bg-emerald-400/15" />
        {/* Header Baris 1: Title & Vivid Gradient Squircle Action Buttons (§H.5) */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between px-4 py-3.5 sm:px-6 md:px-8 bg-gradient-to-r from-emerald-500/10 via-teal-500/5 to-transparent border-b border-emerald-200/90 dark:border-emerald-800/60">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700 text-white shrink-0 shadow-sm border border-emerald-300/40">
              <BookOpenCheck className="size-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-sm sm:text-base font-black text-slate-900 dark:text-white">
                  Data Rekapan Tahfizh Santri
                </h3>
                <span className="inline-flex items-center rounded-full bg-emerald-100 px-2.5 py-0.5 text-[11px] font-extrabold text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300">
                  {filteredRecords.length} Data
                </span>
              </div>
              <p className="text-xs font-medium text-slate-600 dark:text-slate-300 mt-0.5">
                Daftar rekapitulasi setoran hafalan Ziyadah, Murajaah, Tasmi', dan Ujian Tahfizh per periode
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0 self-start sm:self-auto flex-wrap">
            <SquircleActionButton variant="import" icon={Upload} label="Import Data (Excel/CSV)" onClick={handleImportData} />
            <SquircleActionButton variant="export" icon={Download} label="Export Data CSV" onClick={handleExportCSV} />
            <SquircleActionButton
              variant="view"
              icon={Printer}
              label="Cetak Data"
              onClick={() => {
                setPrintTargetRecord(null)
                setIsPrintModalOpen(true)
              }}
            />
          </div>
        </div>

        {/* Banner Info Import Data Realistis */}
        {importNotice && (
          <div className="mb-4 rounded-xl border border-sky-300 bg-sky-50/90 p-4 dark:border-sky-800 dark:bg-sky-950/40 flex items-start justify-between gap-3 animate-in fade-in duration-200">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-sky-100 text-sky-800 dark:bg-sky-900 dark:text-sky-200 shrink-0">
                <Upload className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-sky-950 dark:text-sky-200">Berkas Terpilih: {importNotice.filename} ({importNotice.size})</h4>
                <p className="text-[11px] text-sky-800 dark:text-sky-300 mt-0.5">
                  Format dokumen tervalidasi. Seluruh baris data setoran disinkronkan langsung ke tabel database SIM Terpadu berdasarkan NISN/NIS santri.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setImportNotice(null)}
              className="text-xs font-bold text-sky-600 hover:text-sky-800 dark:text-sky-400 p-1"
            >
              ✕
            </button>
          </div>
        )}

        {/* Filter Baris 2: Filter Data Tahfizh (§7.9 flex-wrap + field §J.3) */}
        <div className="px-4 py-3 sm:px-6 md:px-8 border-b border-emerald-200/80 bg-gradient-to-r from-emerald-50/50 via-teal-50/30 to-emerald-50/50 dark:border-emerald-800/60 dark:from-emerald-950/30 dark:via-teal-950/20 dark:to-emerald-950/30">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
            <div className="flex items-center gap-1.5">
              <Filter className="h-3.5 w-3.5 text-[#0E5C44] dark:text-emerald-400" />
              <h4 className="text-[11px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">Filter Data Tahfizh</h4>
            </div>

            {/* Quick Period Selector Tabs */}
            <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 self-start sm:self-auto overflow-x-auto" role="tablist" aria-label="Periode laporan">
              <button
                type="button"
                onClick={() => handlePeriodChange('semua')}
                role="tab" className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all whitespace-nowrap cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/40 ${
                  periodType === 'semua' || periodType === 'all'
                    ? 'bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700 text-white border border-emerald-300/40 shadow-md shadow-emerald-600/25'
                    : 'text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white'
                }`}
              >
                ♾️ Semua
              </button>
              <button
                type="button"
                onClick={() => handlePeriodChange('harian')}
                role="tab" className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all whitespace-nowrap cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/40 ${
                  periodType === 'harian'
                    ? 'bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700 text-white border border-emerald-300/40 shadow-md shadow-emerald-600/25'
                    : 'text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white'
                }`}
              >
                📅 Harian
              </button>
              <button
                type="button"
                onClick={() => handlePeriodChange('mingguan')}
                role="tab" className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all whitespace-nowrap cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/40 ${
                  periodType === 'mingguan'
                    ? 'bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700 text-white border border-emerald-300/40 shadow-md shadow-emerald-600/25'
                    : 'text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white'
                }`}
              >
                🗓️ Mingguan
              </button>
              <button
                type="button"
                onClick={() => handlePeriodChange('bulanan')}
                role="tab" className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all whitespace-nowrap cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/40 ${
                  periodType === 'bulanan'
                    ? 'bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700 text-white border border-emerald-300/40 shadow-md shadow-emerald-600/25'
                    : 'text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white'
                }`}
              >
                📆 Bulanan
              </button>
              <button
                type="button"
                onClick={() => setPeriodType('kustom')}
                role="tab" className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all whitespace-nowrap cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/40 ${
                  periodType === 'kustom'
                    ? 'bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700 text-white border border-emerald-300/40 shadow-md shadow-emerald-600/25'
                    : 'text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white'
                }`}
              >
                ⚙️ Kustom
              </button>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-2 sm:gap-2.5 w-full">
            <div className="w-full sm:w-auto min-w-[140px]">
              <label htmlFor="rekapan-dari" className="sr-only">Dari tanggal</label>
              <div className="relative flex items-center">
                <div className="pointer-events-none absolute left-3.5 flex items-center text-slate-400 dark:text-slate-500">
                  <CalendarDays className="size-4" />
                </div>
                <input
                  id="rekapan-dari"
                  type="date"
                  value={startDate}
                  onChange={(e) => {
                    setStartDate(e.target.value)
                    setPeriodType('kustom')
                    setCurrentPage(1)
                  }}
                  className="w-full sm:w-auto min-w-[140px] rounded-xl border border-slate-200/90 bg-slate-50/50 pl-10 pr-3 py-2 text-xs font-semibold text-slate-800 transition-all duration-200 hover:border-slate-300 focus:border-[#0E5C44] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#0E5C44]/12 dark:border-slate-700/80 dark:bg-slate-900/50 dark:text-slate-100 dark:hover:border-slate-600 dark:focus:border-[#3FBF75] dark:focus:bg-slate-900 dark:focus:ring-[#3FBF75]/20"
                />
              </div>
            </div>
            <div className="w-full sm:w-auto min-w-[140px]">
              <label htmlFor="rekapan-sampai" className="sr-only">Sampai tanggal</label>
              <div className="relative flex items-center">
                <div className="pointer-events-none absolute left-3.5 flex items-center text-slate-400 dark:text-slate-500">
                  <CalendarDays className="size-4" />
                </div>
                <input
                  id="rekapan-sampai"
                  type="date"
                  value={endDate}
                  onChange={(e) => {
                    setEndDate(e.target.value)
                    setPeriodType('kustom')
                    setCurrentPage(1)
                  }}
                  className="w-full sm:w-auto min-w-[140px] rounded-xl border border-slate-200/90 bg-slate-50/50 pl-10 pr-3 py-2 text-xs font-semibold text-slate-800 transition-all duration-200 hover:border-slate-300 focus:border-[#0E5C44] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#0E5C44]/12 dark:border-slate-700/80 dark:bg-slate-900/50 dark:text-slate-100 dark:hover:border-slate-600 dark:focus:border-[#3FBF75] dark:focus:bg-slate-900 dark:focus:ring-[#3FBF75]/20"
                />
              </div>
            </div>
            <div className="w-full sm:w-auto min-w-[140px]">
              <label htmlFor="rekapan-unit" className="sr-only">Unit pendidikan</label>
              <div className="relative flex items-center">
                <div className="pointer-events-none absolute left-3.5 flex items-center text-slate-400 dark:text-slate-500">
                  <Building2 className="size-4" />
                </div>
                <select
                  id="rekapan-unit"
                  value={selectedUnit}
                  disabled={!isGlobalScope && units.length <= 1}
                  onChange={(e) => {
                    setSelectedUnit(e.target.value)
                    setCurrentPage(1)
                  }}
                  className="w-full sm:w-auto min-w-[140px] rounded-xl border border-slate-200/90 bg-slate-50/50 pl-10 pr-8 py-2 appearance-none text-xs font-semibold text-slate-800 transition-all duration-200 hover:border-slate-300 focus:border-[#0E5C44] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#0E5C44]/12 dark:border-slate-700/80 dark:bg-slate-900/50 dark:text-slate-100 dark:hover:border-slate-600 dark:focus:border-[#3FBF75] dark:focus:bg-slate-900 dark:focus:ring-[#3FBF75]/20 cursor-pointer disabled:opacity-50"
                >
                {(isGlobalScope || units.length > 1) && (
                  <option value="">Semua Unit {isMusyrifRole ? 'Ponpes' : ''}</option>
                )}
                {units.map((unit) => (
                  <option key={unit.id} value={String(unit.id)}>{unit.name}</option>
                ))}
              </select>
                <ChevronDown className="pointer-events-none absolute right-2.5 h-3.5 w-3.5 text-slate-400" />
              </div>
            </div>
            <div className="w-full sm:w-auto min-w-[140px]">
              <label htmlFor="rekapan-rombel" className="sr-only">Rombel kelas</label>
              <div className="relative flex items-center">
                <div className="pointer-events-none absolute left-3.5 flex items-center text-slate-400 dark:text-slate-500">
                  <Users className="size-4" />
                </div>
                <select
                  id="rekapan-rombel"
                  value={selectedClass}
                  onChange={(e) => {
                    setSelectedClass(e.target.value)
                    setCurrentPage(1)
                  }}
                  className="w-full sm:w-auto min-w-[140px] rounded-xl border border-slate-200/90 bg-slate-50/50 pl-10 pr-8 py-2 appearance-none text-xs font-semibold text-slate-800 transition-all duration-200 hover:border-slate-300 focus:border-[#0E5C44] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#0E5C44]/12 dark:border-slate-700/80 dark:bg-slate-900/50 dark:text-slate-100 dark:hover:border-slate-600 dark:focus:border-[#3FBF75] dark:focus:bg-slate-900 dark:focus:ring-[#3FBF75]/20 cursor-pointer"
                >
                <option value="">{isSubjectTeacherOnly ? 'Semua Rombel Binaan' : 'Semua Rombel'}</option>
                {(isSubjectTeacherOnly ? teacherClasses : classes).map((cls) => (
                  <option key={cls.id} value={cls.id}>{cls.name || cls.nama_kelas}</option>
                ))}
              </select>
                <ChevronDown className="pointer-events-none absolute right-2.5 h-3.5 w-3.5 text-slate-400" />
              </div>
            </div>
            <div className="w-full sm:w-auto min-w-[140px]">
              <label htmlFor="rekapan-jenis" className="sr-only">Jenis setoran</label>
              <div className="relative flex items-center">
                <div className="pointer-events-none absolute left-3.5 flex items-center text-slate-400 dark:text-slate-500">
                  <BookOpen className="size-4" />
                </div>
                <select
                  id="rekapan-jenis"
                  value={typeFilter}
                  onChange={(e) => {
                    setTypeFilter(e.target.value)
                    setCurrentPage(1)
                  }}
                  className="w-full sm:w-auto min-w-[140px] rounded-xl border border-slate-200/90 bg-slate-50/50 pl-10 pr-8 py-2 appearance-none text-xs font-semibold text-slate-800 transition-all duration-200 hover:border-slate-300 focus:border-[#0E5C44] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#0E5C44]/12 dark:border-slate-700/80 dark:bg-slate-900/50 dark:text-slate-100 dark:hover:border-slate-600 dark:focus:border-[#3FBF75] dark:focus:bg-slate-900 dark:focus:ring-[#3FBF75]/20 cursor-pointer"
                >
                <option value="semua">Semua Jenis</option>
                <option value="Ziyadah">Ziyadah</option>
                <option value="Murajaah">Murajaah</option>
                <option value="Tasmi">Tasmi'</option>
                <option value="Ujian">Ujian</option>
              </select>
                <ChevronDown className="pointer-events-none absolute right-2.5 h-3.5 w-3.5 text-slate-400" />
              </div>
            </div>
            <div className="w-full sm:w-auto sm:flex-1 sm:min-w-[160px]">
              <label htmlFor="rekapan-cari" className="sr-only">Pencarian santri</label>
              <div className="relative flex items-center">
                <div className="pointer-events-none absolute left-3.5 flex items-center text-slate-400 dark:text-slate-500">
                  <Search className="size-4" />
                </div>
                <input
                  id="rekapan-cari"
                  type="text"
                  placeholder="Cari santri/NIS/surah..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value)
                    setCurrentPage(1)
                  }}
                  className="w-full rounded-xl border border-slate-200/90 bg-slate-50/50 pl-10 pr-4 py-2 text-xs font-semibold text-slate-800 placeholder:text-slate-400/80 transition-all duration-200 hover:border-slate-300 focus:border-[#0E5C44] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#0E5C44]/12 dark:border-slate-700/80 dark:bg-slate-900/50 dark:text-slate-100 dark:hover:border-slate-600 dark:focus:border-[#3FBF75] dark:focus:bg-slate-900 dark:focus:ring-[#3FBF75]/20"
                />
              </div>
            </div>
            <div className="w-full sm:w-auto min-w-[140px]">
              <label htmlFor="rekapan-tampil" className="sr-only">Tampilkan per halaman</label>
              <div className="relative flex items-center">
                <div className="pointer-events-none absolute left-3.5 flex items-center text-slate-400 dark:text-slate-500">
                  <Layers className="size-4" />
                </div>
                <select
                  id="rekapan-tampil"
                  value={perPage}
                  onChange={(e) => {
                    setPerPage(Number(e.target.value))
                    setCurrentPage(1)
                  }}
                  className="w-full sm:w-auto min-w-[140px] rounded-xl border border-slate-200/90 bg-slate-50/50 pl-10 pr-8 py-2 appearance-none text-xs font-semibold text-slate-800 transition-all duration-200 hover:border-slate-300 focus:border-[#0E5C44] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#0E5C44]/12 dark:border-slate-700/80 dark:bg-slate-900/50 dark:text-slate-100 dark:hover:border-slate-600 dark:focus:border-[#3FBF75] dark:focus:bg-slate-900 dark:focus:ring-[#3FBF75]/20 cursor-pointer"
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
              onClick={resetFilters}
              className="w-full sm:w-auto sm:ml-auto inline-flex items-center justify-center gap-1.5 h-9 rounded-xl border border-emerald-200/80 dark:border-emerald-800/50 bg-white dark:bg-slate-900 px-3 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all cursor-pointer"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Reset</span>
            </button>
          </div>
        </div>

        {/* Datatable Section matching Mutabaah styling */}
        <div className="px-4 sm:px-6 md:px-8 py-4 overflow-x-auto">
          {loading ? (
            <AppSkeleton variant="table" rows={5} cols={4} />
          ) : paginatedRecords.length === 0 ? (
            <AppEmptyState
              title="Tidak ada data Rekapan Tahfizh"
              description="Tidak ada data Rekapan Tahfizh yang ditemukan. Coba ubah filter atau kata kunci pencarian Anda."
              actionLabel={searchQuery || startDate || endDate ? 'Reset Filter' : undefined}
              onAction={searchQuery || startDate || endDate ? resetFilters : undefined}
            />
          ) : (
          <div className="overflow-x-auto rounded-xl border border-emerald-200/80 dark:border-emerald-800/60">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-gradient-to-r from-emerald-100/80 via-teal-50/60 to-emerald-100/80 border-b border-emerald-200/80 dark:from-emerald-950/80 dark:via-teal-950/60 dark:to-emerald-950/80 dark:border-emerald-900/50 uppercase text-[10px] font-extrabold text-emerald-800 dark:text-emerald-300">
                <th className="w-10 px-3 py-2.5 text-center">#</th>
                <th className="hidden md:table-cell px-3 py-2.5 text-center">Tanggal</th>
                <th className="px-3 py-2.5">Santri</th>
                <th className="hidden sm:table-cell px-3 py-2.5">Kelas & Unit</th>
                <th className="px-3 py-2.5 text-center">Jenis Setoran</th>
                <th className="hidden md:table-cell px-3 py-2.5">Capaian Hafalan</th>
                <th className="hidden lg:table-cell px-3 py-2.5 text-center">Kelancaran</th>
                <th className="hidden lg:table-cell px-3 py-2.5 text-center">Tajwid</th>
                <th className="hidden md:table-cell px-3 py-2.5">Pengajar</th>
                <th className="px-3 py-2.5 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-emerald-100/80 dark:divide-emerald-900/40">
              {paginatedRecords.map((item, index) => {
                  const studentName = item.student_name || 'Siswa'
                  const studentNis = item.nis || '-'
                  const type = item.type || 'Ziyadah'
                  const badgeVariant =
                    type === 'Ziyadah' ? 'success' : type === 'Murajaah' ? 'info' : type === 'Tasmi' ? 'purple' : 'warning'

                  return (
                    <tr
                      key={item.id || index}
                      className="hover:bg-emerald-50/40 dark:hover:bg-emerald-950/20 transition-colors"
                    >
                      <td className="px-3 py-3 text-center font-bold text-slate-400 text-xs tabular-nums">
                        {(currentPage - 1) * perPage + index + 1}
                      </td>

                      <td className="hidden md:table-cell px-3 py-3 text-center font-mono font-semibold text-slate-600 dark:text-slate-400 text-xs whitespace-nowrap align-middle">
                        {item.date}
                      </td>

                      {/* Cell Identitas Siswa dengan Circle Avatar & HoverCard */}
                      <td className="px-3 py-3 align-top sm:align-middle">
                        <HoverCard>
                          <HoverCardTrigger
                            onClick={(e) => {
                              e.preventDefault()
                              handleOpenDetailModal(item)
                            }}
                            className="cursor-pointer inline-block max-w-full"
                            title={studentName}
                          >
                            <div className="flex items-center gap-2.5">
                              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-emerald-100 text-[10px] font-black text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
                                {studentName.split(' ').map((part) => part[0]).slice(0, 2).join('')}
                              </span>
                              <div className="min-w-0">
                                <p className="font-bold text-slate-900 dark:text-white hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors line-clamp-2">
                                  {studentName}
                                </p>
                                <p className="text-[10px] text-slate-400 font-mono line-clamp-1 mt-0.5">NIS: {studentNis}</p>
                              </div>
                            </div>
                          </HoverCardTrigger>

                          <HoverCardContent className="w-72 p-0 overflow-hidden border border-slate-200 bg-white dark:border-slate-800 dark:bg-[#1B2433] shadow-xl rounded-2xl z-50">
                            <div className="relative h-20 w-full bg-gradient-to-r from-emerald-800 to-teal-900 p-3.5 flex items-center justify-between text-white">
                              <div>
                                <span className="text-[9px] font-bold uppercase tracking-wider bg-white/20 px-2 py-0.5 rounded-full text-white">
                                  {item.class_name || 'Rombel'}
                                </span>
                                <h4 className="text-sm font-extrabold mt-1 text-white truncate max-w-[170px]">
                                  {studentName}
                                </h4>
                              </div>
                              <div className="size-10 rounded-full bg-white/10 backdrop-blur-xs flex items-center justify-center font-black text-xs text-white border border-white/20 shrink-0">
                                {studentName.slice(0, 2).toUpperCase()}
                              </div>
                            </div>

                            <div className="p-3.5 space-y-2.5">
                              <div className="grid grid-cols-2 gap-2 text-xs">
                                <div>
                                  <span className="text-slate-400 block text-[10px] font-semibold">NIS</span>
                                  <span className="font-bold text-slate-800 dark:text-slate-200 font-mono truncate block">{studentNis}</span>
                                </div>
                                <div>
                                  <span className="text-slate-400 block text-[10px] font-semibold">Unit</span>
                                  <span className="font-bold text-slate-800 dark:text-slate-200 truncate block">{item.unit_name}</span>
                                </div>
                              </div>

                              <button
                                type="button"
                                onClick={() => handleOpenDetailModal(item)}
                                className="inline-flex items-center justify-center gap-2 w-full py-2.5 px-5 bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700 text-white text-xs font-extrabold rounded-2xl border border-emerald-300/40 transition-all duration-200 hover:scale-[1.03] active:scale-95 cursor-pointer"
                              >
                                Lihat Rincian Data
                              </button>
                            </div>
                          </HoverCardContent>
                        </HoverCard>
                        <div className="sm:hidden mt-2 flex flex-wrap items-center gap-1.5 pt-1.5 border-t border-emerald-100/80 dark:border-emerald-900/40">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300">
                            {item.date}
                          </span>
                          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-500/10 text-emerald-600">
                            {type}
                          </span>
                        </div>
                      </td>

                      <td className="hidden sm:table-cell px-3 py-3 align-middle">
                        <p className="font-semibold text-slate-800 dark:text-slate-200 text-xs">{item.class_name}</p>
                        <p className="text-[10px] text-slate-400 line-clamp-1">{item.unit_name}</p>
                      </td>

                      <td className="px-3 py-3 text-center align-middle">
                        <AppBadge variant={badgeVariant}>
                          {type}
                        </AppBadge>
                      </td>

                      <td className="hidden md:table-cell px-3 py-3 align-middle">
                        {item.surah_name && item.ayah_start ? (
                          <div>
                            <strong className="block text-slate-900 dark:text-white text-xs font-extrabold">
                              {item.juz ? `Juz ${item.juz} • ` : ''}{item.surah_name}
                            </strong>
                            <span className="text-[11px] text-slate-500 font-medium font-mono">
                              Ayat {item.ayah_start} {item.ayah_end ? `s/d ${item.ayah_end}` : ''}
                              {item.hafalan_baris ? ` (${item.hafalan_baris} baris)` : ''}
                            </span>
                          </div>
                        ) : item.murajaah_text ? (
                          <div>
                            <strong className="block text-slate-900 dark:text-white text-xs font-extrabold">
                              {item.murajaah_text}
                            </strong>
                            {item.murajaah_lembar > 0 && (
                              <span className="text-[11px] text-slate-500 font-medium font-mono">
                                {item.murajaah_lembar} Lembar
                              </span>
                            )}
                          </div>
                        ) : item.tilawah_text ? (
                          <div>
                            <strong className="block text-slate-900 dark:text-white text-xs font-extrabold">
                              {item.tilawah_text}
                            </strong>
                            {item.tilawah_baris > 0 && (
                              <span className="text-[11px] text-slate-500 font-medium font-mono">
                                {item.tilawah_baris} Baris
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-slate-400 font-mono">-</span>
                        )}
                      </td>

                      <td className="hidden lg:table-cell px-3 py-3 text-center align-middle">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                            item.kelancaran === '-'
                              ? 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
                              : /sangat|mumtaz/i.test(item.kelancaran)
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                              : /lancar|jayyid/i.test(item.kelancaran)
                              ? 'bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300'
                              : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                          }`}
                        >
                          {item.kelancaran}
                        </span>
                      </td>

                      <td className="px-3 py-3 text-center">
                        <span className={`inline-block px-2.5 py-0.5 rounded-lg text-[10px] font-bold ${
                          item.tajwid === '-'
                            ? 'bg-slate-50 text-slate-400 dark:bg-slate-800/50 dark:text-slate-500'
                            : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                        }`}>
                          {item.tajwid}
                        </span>
                      </td>

                      <td className="hidden md:table-cell px-3 py-3 font-semibold text-slate-700 dark:text-slate-300 text-xs align-middle">
                        {item.teacher_name}
                      </td>

                      <td className="px-3 py-3 text-center align-middle">
                        <div className="flex items-center justify-center gap-1.5">
                          <MasterActionIconButton variant="view" label="Lihat Detail" onClick={() => handleOpenDetailModal(item)} />
                          <SquircleActionButton
                            variant="view"
                            icon={Printer}
                            label="Cetak Detail"
                            onClick={() => {
                              setPrintTargetRecord(item)
                              setIsPrintModalOpen(true)
                            }}
                          />
                        </div>
                      </td>
                    </tr>
                  )
                })}
            </tbody>
          </table>
          </div>
        )}
        </div>

        {/* Footer Pagination Controls (§7.6) */}
        <div className="border-t border-emerald-200/80 bg-gradient-to-r from-emerald-50/40 via-white to-emerald-50/40 p-3.5 sm:px-6 md:px-8 py-3 sm:py-3.5 dark:border-emerald-800/60 dark:from-emerald-950/20 dark:via-transparent dark:to-emerald-950/20 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 text-center sm:text-left">
            Menampilkan <span className="font-semibold text-slate-700 dark:text-slate-200">{filteredRecords.length > 0 ? (currentPage - 1) * perPage + 1 : 0}</span> s.d. <span className="font-semibold text-slate-700 dark:text-slate-200">{Math.min(currentPage * perPage, filteredRecords.length)}</span> dari <span className="font-semibold text-slate-700 dark:text-slate-200">{filteredRecords.length}</span> santri
          </div>
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={(p) => setCurrentPage(p)}
                sideLayout="full"
              />
            </div>
          )}
        </div>
      </motion.div>

      {/* Summary Card Interactive Datatable Modal (§P visual) */}
      {cardModal.isOpen && (
        <Dialog
          isOpen={cardModal.isOpen}
          onOpenChange={(open) => !open && closeCardModal()}
          className="w-full max-w-3xl max-h-[90vh] flex flex-col rounded-3xl bg-white dark:bg-[#182232] border border-slate-200/80 dark:border-slate-800 shadow-2xl shadow-emerald-950/20 dark:shadow-black/60 overflow-hidden p-0"
        >
          <div className="h-1.5 bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-600 shrink-0" />
          <DialogHeader className="flex flex-row items-center justify-between px-6 py-4.5 border-b border-slate-100 bg-white dark:border-slate-800 dark:bg-slate-950 shrink-0">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 sm:h-11 sm:w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700 text-white shadow-md shadow-emerald-500/20 border border-emerald-300/30">
                <BookOpenCheck className="h-5 w-5 text-white" strokeWidth={2.25} />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <DialogTitle className="text-sm sm:text-base font-black text-slate-900 dark:text-white">
                    {cardModal.title}
                  </DialogTitle>
                  <AppBadge variant={cardModal.tone === 'rose' ? 'danger' : cardModal.tone === 'amber' ? 'warning' : 'success'}>
                    {modalRows.length} Data Setoran
                  </AppBadge>
                </div>
                <DialogDescription className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Daftar rincian log setoran tahfizh siswa dengan status {cardModal.title}
                </DialogDescription>
              </div>
            </div>
            <button
              type="button"
              onClick={closeCardModal}
              aria-label="Tutup modal"
              className="size-9 flex items-center justify-center rounded-2xl bg-gradient-to-br from-rose-500 via-rose-600 to-red-700 text-white hover:scale-105 active:scale-95 transition-all duration-200 shadow-md shadow-rose-500/20 cursor-pointer shrink-0"
            >
              <X className="size-4 text-white" strokeWidth={2.25} />
            </button>
          </DialogHeader>

          <DialogBody className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4">
            {/* Modal Search Toolbar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-gradient-to-r from-emerald-50/50 via-teal-50/30 to-emerald-50/50 dark:from-emerald-950/20 dark:via-teal-950/10 dark:to-emerald-950/20 border border-emerald-200/80 dark:border-emerald-800/60 p-3 rounded-2xl">
              <div className="relative w-full sm:w-80 flex items-center">
                <div className="pointer-events-none absolute left-3.5 flex items-center text-emerald-600/70 dark:text-emerald-400">
                  <Search className="size-4" />
                </div>
                <input
                  type="text"
                  placeholder="Cari nama siswa, NIS, atau surah..."
                  value={cardModal.searchQuery}
                  onChange={(e) => setCardModal((prev) => ({ ...prev, searchQuery: e.target.value, page: 1 }))}
                  aria-label="Cari dalam modal"
                  className="w-full rounded-2xl border border-emerald-200/90 bg-white pl-10 pr-8 py-2 appearance-none text-xs font-semibold text-slate-800 outline-none transition-all placeholder:text-slate-400 focus:border-[#0E5C44] focus:ring-4 focus:ring-[#0E5C44]/12 dark:border-emerald-800/70 dark:bg-slate-900 dark:text-slate-100"
                />
                {cardModal.searchQuery && (
                  <button
                    type="button"
                    onClick={() => setCardModal((prev) => ({ ...prev, searchQuery: '', page: 1 }))}
                    aria-label="Bersihkan pencarian"
                    className="absolute right-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Modal Datatable */}
            <div className="overflow-x-auto rounded-xl border border-emerald-200/80 dark:border-emerald-800/60">
              <table className="w-full text-left text-xs">
                <thead className="bg-gradient-to-r from-emerald-100/80 via-teal-50/60 to-emerald-100/80 border-b border-emerald-200/80 dark:from-emerald-950/80 dark:via-teal-950/60 dark:to-emerald-950/80 dark:border-emerald-900/50 uppercase text-[10px] font-extrabold text-emerald-800 dark:text-emerald-300">
                  <tr>
                    <th className="py-2.5 px-4">No</th>
                    <th className="py-2.5 px-4">Tanggal</th>
                    <th className="py-2.5 px-4">Siswa</th>
                    <th className="py-2.5 px-4">Jenis</th>
                    <th className="py-2.5 px-4">Hafalan</th>
                    <th className="py-2.5 px-4">Kelancaran</th>
                    <th className="py-2.5 px-4">Pengajar</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-emerald-100/80 dark:divide-emerald-900/40">
                  {paginatedModalRows.length > 0 ? (
                    paginatedModalRows.map((row, idx) => {
                      const studentName = row.student_name || 'Siswa'
                      const type = row.type || 'Ziyadah'

                      return (
                        <tr key={row.id || idx} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                          <td className="py-3 px-4 font-medium text-slate-500">
                            {(cardModal.page - 1) * MODAL_PAGE_SIZE + idx + 1}
                          </td>
                          <td className="py-3 px-4 font-mono font-medium text-slate-600">
                            {row.date}
                          </td>
                          <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">
                            {studentName}
                          </td>
                          <td className="py-3 px-4">
                            <AppBadge variant={type === 'Ziyadah' ? 'success' : type === 'Murajaah' ? 'info' : 'warning'}>
                              {type}
                            </AppBadge>
                          </td>
                          <td className="py-3 px-4 font-bold text-emerald-700 dark:text-emerald-400">
                            {row.surah_name && row.ayah_start
                              ? `${row.juz ? `Juz ${row.juz} • ` : ''}${row.surah_name} (${row.ayah_start}-${row.ayah_end || row.ayah_start})`
                              : row.murajaah_text
                              ? `${row.murajaah_text}${row.murajaah_lembar > 0 ? ` (${row.murajaah_lembar} Lembar)` : ''}`
                              : row.tilawah_text
                              ? `${row.tilawah_text}${row.tilawah_baris > 0 ? ` (${row.tilawah_baris} Baris)` : ''}`
                              : '-'}
                          </td>
                          <td className="py-3 px-4 font-medium text-slate-600">
                            {row.kelancaran}
                          </td>
                          <td className="py-3 px-4 text-slate-500 font-medium">
                            {row.teacher_name}
                          </td>
                        </tr>
                      )
                    })
                  ) : (
                    <tr>
                      <td colSpan="7" className="py-8 text-center text-slate-400 font-medium">
                        {cardModal.searchQuery ? 'Tidak ada data setoran yang cocok dengan pencarian.' : 'Belum ada data pada kategori ini.'}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </DialogBody>

          <DialogFooter className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-100 bg-slate-50/50 px-6 py-4 dark:border-slate-800 dark:bg-slate-900/40">
            <span className="text-xs text-slate-500 font-medium">
              Menampilkan {modalRows.length ? (cardModal.page - 1) * MODAL_PAGE_SIZE + 1 : 0}–{Math.min(cardModal.page * MODAL_PAGE_SIZE, modalRows.length)} dari {modalRows.length} data
            </span>
            <div className="flex items-center gap-2.5">
              <div className="flex items-center gap-1.5 mr-2">
                <button
                  type="button"
                  disabled={cardModal.page === 1}
                  onClick={() => setCardModal((prev) => ({ ...prev, page: prev.page - 1 }))}
                  aria-label="Halaman sebelumnya"
                  className="flex size-9 items-center justify-center rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-all duration-150 active:scale-95 disabled:bg-emerald-600/30 disabled:text-white/40 disabled:pointer-events-none dark:disabled:bg-emerald-950/40 dark:disabled:text-white/30 cursor-pointer"
                >
                  <ChevronLeft className="size-5 shrink-0" />
                </button>
                <span className="text-xs font-semibold px-2 text-slate-700 dark:text-slate-300 tabular-nums">
                  {cardModal.page} / {modalTotalPages}
                </span>
                <button
                  type="button"
                  disabled={cardModal.page === modalTotalPages}
                  onClick={() => setCardModal((prev) => ({ ...prev, page: prev.page + 1 }))}
                  aria-label="Halaman berikutnya"
                  className="flex size-9 items-center justify-center rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-all duration-150 active:scale-95 disabled:bg-emerald-600/30 disabled:text-white/40 disabled:pointer-events-none dark:disabled:bg-emerald-950/40 dark:disabled:text-white/30 cursor-pointer"
                >
                  <ChevronRight className="size-5 shrink-0" />
                </button>
              </div>
              <button
                type="button"
                onClick={closeCardModal}
                className="inline-flex items-center gap-1.5 rounded-2xl bg-gradient-to-br from-rose-500 via-rose-600 to-red-700 text-white px-4 py-2 text-xs font-extrabold border border-rose-300/40 transition-all duration-200 hover:scale-[1.03] active:scale-95 cursor-pointer"
              >
                <X className="size-4 text-white" strokeWidth={2.2} />
                <span>Tutup</span>
              </button>
            </div>
          </DialogFooter>
        </Dialog>
      )}

      {/* Modal Detail Lembar Kegiatan Tahfizh Siswa (Style matching tab=tahfizh) */}
      {/* 📤 IMPORT MODAL — Harmonized Standard */}
      <AnimatePresence>
        {showImportModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/70 backdrop-blur-md p-3 sm:p-5"
            onClick={(e) => { if (e.target === e.currentTarget) closeImportModal() }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 20 }}
              transition={{ type: 'spring', stiffness: 380, damping: 28 }}
              className="relative w-full max-w-2xl max-h-[92vh] flex flex-col overflow-hidden rounded-3xl border border-slate-200/60 bg-white shadow-2xl shadow-emerald-950/20 dark:border-slate-800/60 dark:bg-[#182232]"
            >
              {/* Accent Bar */}
              <div className="h-1.5 bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-600 shrink-0" />

              {/* Header */}
              <div className="flex shrink-0 items-center justify-between border-b border-slate-100 bg-white px-6 py-4 dark:border-slate-800 dark:bg-slate-950">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700 text-white shadow-md shadow-emerald-500/20 border border-emerald-300/30">
                    <Upload className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-sm sm:text-base font-black text-slate-900 dark:text-white">Import Data Tahfizh</h3>
                      <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-emerald-600 to-teal-600 px-2.5 py-0.5 text-[10px] font-extrabold text-white">
                        <Sparkles className="size-3 text-amber-300" />
                        Data Baru
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Unggah file Excel (.xlsx) atau CSV untuk impor setoran tahfizh</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={closeImportModal}
                  aria-label="Tutup modal import"
                  className="size-9 flex items-center justify-center rounded-2xl bg-gradient-to-br from-rose-500 via-rose-600 to-red-700 text-white hover:scale-105 active:scale-95 transition-all duration-200 shadow-md shadow-rose-500/20 cursor-pointer shrink-0"
                >
                  <X className="size-4 text-white" strokeWidth={2.25} />
                </button>
              </div>

              {/* Body — Scrollable */}
              <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4">

                {/* Download Template Card */}
                <div className="flex items-center justify-between gap-3 rounded-2xl border border-emerald-200/80 bg-gradient-to-r from-emerald-50/60 via-teal-50/40 to-emerald-50/60 p-3.5 dark:border-emerald-800/60 dark:from-emerald-950/30 dark:via-teal-950/20 dark:to-emerald-950/30">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-sm">
                      <FileSpreadsheet className="size-4.5" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-extrabold text-slate-900 dark:text-white">Template Import Tahfizh.csv</p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">Tanggal, Nama Siswa, NIS, Jenis Setoran, Surah, Ayat Awal, Ayat Akhir, Kelancaran</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleDownloadTemplate}
                    className="shrink-0 inline-flex items-center gap-1.5 rounded-xl border border-emerald-300 dark:border-emerald-700 bg-white dark:bg-emerald-950/60 hover:bg-emerald-50 dark:hover:bg-emerald-900/60 px-3 py-2 text-xs font-extrabold text-emerald-800 dark:text-emerald-200 transition-colors cursor-pointer"
                  >
                    <Download className="size-3.5 text-emerald-600 dark:text-emerald-400" />
                    Unduh
                  </button>
                </div>

                {/* Dropzone */}
                <div
                  onDrop={(e) => {
                    e.preventDefault()
                    setIsDragging(false)
                    const file = e.dataTransfer.files[0]
                    if (file) parseImportFile(file)
                  }}
                  onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
                  onDragLeave={() => setIsDragging(false)}
                  onClick={() => importInputRef.current?.click()}
                  className={`flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed p-8 transition-all cursor-pointer ${
                    isDragging
                      ? 'border-emerald-400 bg-emerald-50 dark:border-emerald-500 dark:bg-emerald-950/40 scale-[1.01]'
                      : 'border-emerald-300/80 bg-gradient-to-br from-emerald-50/40 to-teal-50/30 hover:border-emerald-400 hover:bg-emerald-50/60 dark:border-emerald-700/60 dark:from-emerald-950/20 dark:to-teal-950/10 dark:hover:border-emerald-600'
                  }`}
                >
                  <input
                    ref={importInputRef}
                    type="file"
                    accept=".xlsx,.xls,.csv"
                    className="hidden"
                    onChange={(e) => { if (e.target.files[0]) parseImportFile(e.target.files[0]) }}
                  />
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700 text-white shadow-lg shadow-emerald-500/25">
                    <FileInput className="size-7 text-white" />
                  </div>
                  {importFile ? (
                    <div className="text-center">
                      <p className="text-sm font-extrabold text-emerald-700 dark:text-emerald-300">{importFile.name}</p>
                      <p className="text-[11px] text-slate-500 mt-0.5">{(importFile.size / 1024).toFixed(1)} KB · Klik untuk ganti berkas</p>
                    </div>
                  ) : (
                    <div className="text-center">
                      <p className="text-sm font-extrabold text-slate-700 dark:text-slate-200">Seret & lepas berkas di sini</p>
                      <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">atau klik untuk memilih berkas Excel/CSV</p>
                    </div>
                  )}
                </div>

                {/* Parse Error */}
                {parseError && (
                  <div className="flex items-start gap-2.5 rounded-xl border border-rose-200 bg-rose-50 p-3.5 dark:border-rose-800/60 dark:bg-rose-950/30">
                    <AlertTriangle className="size-4 text-rose-500 shrink-0 mt-0.5" />
                    <p className="text-xs font-semibold text-rose-700 dark:text-rose-300">{parseError}</p>
                  </div>
                )}

                {/* Preview Datatable */}
                {parsedRows.length > 0 && (
                  <div className="overflow-hidden rounded-xl border border-emerald-200/80 dark:border-emerald-800/60">
                    <div className="bg-gradient-to-r from-emerald-500/10 via-teal-500/5 to-transparent px-4 py-2.5 border-b border-emerald-200/80 dark:border-emerald-800/60 flex items-center gap-2">
                      <CheckCircle2 className="size-4 text-emerald-600" />
                      <span className="text-xs font-extrabold text-emerald-800 dark:text-emerald-300">{parsedRows.length} baris data terdeteksi — Pratinjau</span>
                    </div>
                    <div className="overflow-x-auto max-h-52">
                      <table className="w-full text-xs text-left">
                        <thead className="bg-gradient-to-r from-emerald-100/80 via-teal-50/60 to-emerald-100/80 dark:from-emerald-950/80 dark:via-teal-950/60 dark:to-emerald-950/80 uppercase text-[10px] font-extrabold text-emerald-800 dark:text-emerald-300 border-b border-emerald-200/80 dark:border-emerald-800/60">
                          <tr>
                            <th className="px-3 py-2">#</th>
                            <th className="px-3 py-2">Tanggal</th>
                            <th className="px-3 py-2">Nama Siswa</th>
                            <th className="px-3 py-2">NIS</th>
                            <th className="px-3 py-2">Jenis</th>
                            <th className="px-3 py-2">Surah</th>
                            <th className="px-3 py-2">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-emerald-100/80 dark:divide-emerald-900/40">
                          {parsedRows.slice(0, 10).map((row, idx) => (
                            <tr key={idx} className="hover:bg-emerald-50/40 dark:hover:bg-emerald-950/20 transition-colors">
                              <td className="px-3 py-2 text-slate-400 font-mono">{idx + 1}</td>
                              <td className="px-3 py-2 font-mono text-slate-600 dark:text-slate-400">{row.tanggal}</td>
                              <td className="px-3 py-2 font-semibold text-slate-800 dark:text-slate-200">{row.nama}</td>
                              <td className="px-3 py-2 font-mono text-slate-500">{row.nis}</td>
                              <td className="px-3 py-2 text-slate-600 dark:text-slate-400">{row.jenis}</td>
                              <td className="px-3 py-2 text-slate-600 dark:text-slate-400">{row.surah}</td>
                              <td className="px-3 py-2">
                                <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold ${
                                  row.status === 'Valid'
                                    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/60 dark:text-emerald-300'
                                    : 'bg-rose-100 text-rose-700 dark:bg-rose-900/60 dark:text-rose-300'
                                }`}>{row.status}</span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    {parsedRows.length > 10 && (
                      <div className="px-4 py-2 text-[11px] text-slate-400 border-t border-emerald-100/80 dark:border-emerald-900/40">
                        ... dan {parsedRows.length - 10} baris lainnya
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="flex shrink-0 items-center justify-between gap-3 border-t border-slate-100 bg-slate-50/50 px-6 py-4 dark:border-slate-800 dark:bg-slate-900/40">
                <button
                  type="button"
                  onClick={closeImportModal}
                  className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-2.5 text-xs font-extrabold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleSubmitImport}
                  disabled={!importFile || parsedRows.length === 0 || isImporting}
                  className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700 text-white px-5 py-2.5 text-xs font-extrabold border border-emerald-300/40 transition-all duration-200 hover:scale-[1.03] active:scale-95 disabled:opacity-50 disabled:pointer-events-none cursor-pointer shadow-md shadow-emerald-500/20"
                >
                  {isImporting ? (
                    <>
                      <RefreshCw className="size-3.5 animate-spin" />
                      Mengimpor...
                    </>
                  ) : (
                    <>
                      <Upload className="size-3.5" />
                      Import {parsedRows.length > 0 ? `${parsedRows.length} Data` : 'Data'}
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {selectedRecordModal && (
        <div
          className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/65 p-3 backdrop-blur-sm sm:p-5"
          role="dialog"
          aria-modal="true"
          aria-labelledby="tahfizh-detail-title"
          onClick={(e) => {
            if (e.target === e.currentTarget) setSelectedRecordModal(null)
          }}
        >
          <div className="flex max-h-[94vh] w-full max-w-7xl flex-col overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-2xl shadow-emerald-950/20 dark:border-slate-800 dark:bg-[#182232] dark:shadow-black/60">
            <div className="h-1.5 bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-600 shrink-0" />
            <header className="flex shrink-0 flex-col gap-4 border-b border-slate-100 bg-white px-6 py-4.5 sm:flex-row sm:items-center sm:justify-between dark:border-slate-800 dark:bg-slate-950">
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-10 w-10 sm:h-11 sm:w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700 text-white shadow-md shadow-emerald-500/20 border border-emerald-300/30">
                  <BookOpen className="h-5 w-5 text-white" strokeWidth={2.25} />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                    Lembar Kegiatan Tahfizh
                  </p>
                  <h2 id="tahfizh-detail-title" className="truncate text-sm sm:text-base font-black text-slate-900 dark:text-white">
                    {selectedRecordModal.student_name || selectedRecordModal.nama_lengkap || 'Santri'}
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-0.5 truncate">
                    {selectedRecordModal.nis || selectedRecordModal.nisn || 'NIS belum tersedia'} · {selectedRecordModal.class_name || 'Rombel'} {selectedRecordModal.unit_name ? `(${selectedRecordModal.unit_name})` : ''}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-auto">
                <button
                  type="button"
                  onClick={() => setDetailWeekOffset((value) => value - 1)}
                  aria-label="Minggu sebelumnya"
                  className="flex size-9 items-center justify-center rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-all duration-150 active:scale-95 cursor-pointer"
                >
                  <ChevronLeft className="size-5 shrink-0" />
                </button>
                <button
                  type="button"
                  onClick={() => setDetailWeekOffset((value) => value + 1)}
                  aria-label="Minggu berikutnya"
                  className="flex size-9 items-center justify-center rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-all duration-150 active:scale-95 cursor-pointer"
                >
                  <ChevronRight className="size-5 shrink-0" />
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedRecordModal(null)}
                  aria-label="Tutup detail"
                  className="flex size-9 items-center justify-center rounded-2xl bg-gradient-to-br from-rose-500 via-rose-600 to-red-700 text-white hover:scale-105 active:scale-95 transition-all duration-200 shadow-md shadow-rose-500/20 cursor-pointer"
                >
                  <X className="size-4 text-white" strokeWidth={2.25} />
                </button>
              </div>
            </header>

            <div className="min-h-0 overflow-y-auto p-4 sm:p-5">
              {/* Mobile View: Cards */}
              <div className="space-y-3 lg:hidden">
                {detailWeekRows.map(({ date, dateKey, log }, index) => {
                  const isTargetDate = selectedRecordModal?.date === dateKey
                  const surahName = log?.surah_name || log?.hafalan_surah_name
                  const ayahStart = log?.ayah_start || log?.hafalan_ayah_start
                  const ayahEnd = log?.ayah_end || log?.hafalan_ayah_end || ayahStart
                  const juzNum = log?.juz || log?.metadata?.juz || '-'
                  const barisAyat = log?.hafalan_baris || (ayahStart && ayahEnd ? `${Number(ayahEnd) - Number(ayahStart) + 1} ayat` : '—')

                  return (
                    <article
                      key={dateKey}
                      className={`overflow-hidden rounded-2xl border ${
                        isTargetDate
                          ? 'border-emerald-500 shadow-md ring-1 ring-emerald-500/30 dark:border-emerald-500'
                          : 'border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      <header
                        className={`flex items-center justify-between px-4 py-3 ${
                          isTargetDate ? 'bg-emerald-100/70 dark:bg-emerald-950/60' : 'bg-emerald-50 dark:bg-emerald-950/30'
                        }`}
                      >
                        <div>
                          <p className="text-sm font-black text-slate-900 dark:text-white">
                            {index + 1}. {new Intl.DateTimeFormat('id-ID', { weekday: 'long' }).format(date)}
                          </p>
                          <p className="text-[10px] text-slate-500">
                            {new Intl.DateTimeFormat('id-ID', { day: '2-digit', month: 'long', year: 'numeric' }).format(date)}
                          </p>
                        </div>
                        {log ? (
                          <span className="rounded-full bg-emerald-600 px-2.5 py-1 text-[10px] font-bold text-white">
                            {isTargetDate ? 'Terpilih' : 'Terisi'}
                          </span>
                        ) : (
                          <span className="rounded-full bg-slate-200 px-2.5 py-1 text-[10px] font-bold text-slate-500 dark:bg-slate-700 dark:text-slate-300">
                            Kosong
                          </span>
                        )}
                      </header>
                      <div className="grid grid-cols-2 gap-px bg-slate-200 text-xs dark:bg-slate-700">
                        {[
                          ['Tilawah', log?.tilawah_text || '—'],
                          ['Baris Tilawah', log?.tilawah_baris || '—'],
                          ['Hafalan Baru', surahName ? `${surahName}, ayat ${ayahStart}–${ayahEnd}` : '—'],
                          ['Juz / Jumlah', log ? `Juz ${juzNum} · ${barisAyat}` : '—'],
                          ['Murajaah', log?.murajaah_text || '—'],
                          ['Lembar', log?.murajaah_lembar || '—'],
                          ['Catatan', log?.notes_teacher || (log?.kelancaran ? `Kelancaran: ${log.kelancaran}` : '—')],
                          ['Tanda tangan', log?.signature_teacher || log?.kelancaran ? 'Sudah diverifikasi' : '—'],
                        ].map(([label, value]) => (
                          <div key={label} className="min-w-0 bg-white p-3 dark:bg-[#1B2433]">
                            <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">{label}</p>
                            <p className="mt-1 break-words font-semibold text-slate-800 dark:text-slate-100">{value}</p>
                          </div>
                        ))}
                      </div>
                    </article>
                  )
                })}
              </div>

              {/* Desktop View: Table */}
              <table className="hidden w-full table-fixed border-collapse text-[10px] xl:text-[11px] lg:table [&_td]:!p-2 [&_td]:break-words [&_th]:!p-2">
                <colgroup>
                  <col className="w-[3.5%]" />
                  <col className="w-[11%]" />
                  <col className="w-[10%]" />
                  <col className="w-[5%]" />
                  <col className="w-[17%]" />
                  <col className="w-[7%]" />
                  <col className="w-[11%]" />
                  <col className="w-[6%]" />
                  <col className="w-[20%]" />
                  <col className="w-[9.5%]" />
                </colgroup>
                <thead>
                  <tr className="bg-emerald-100/80 text-slate-900 dark:bg-emerald-950/60 dark:text-emerald-100">
                    <th className="border border-emerald-200/80 dark:border-emerald-800/50 p-2.5">No</th>
                    <th className="border border-emerald-200/80 dark:border-emerald-800/50 p-2.5 text-left">Hari/Tanggal</th>
                    <th className="border border-emerald-200/80 dark:border-emerald-800/50 p-2.5">Tilawah</th>
                    <th className="border border-emerald-200/80 dark:border-emerald-800/50 p-2.5">Baris</th>
                    <th className="border border-emerald-200/80 dark:border-emerald-800/50 p-2.5">Hafalan Baru</th>
                    <th className="border border-emerald-200/80 dark:border-emerald-800/50 p-2.5">Baris/Ayat</th>
                    <th className="border border-emerald-200/80 dark:border-emerald-800/50 p-2.5">Murajaah</th>
                    <th className="border border-emerald-200/80 dark:border-emerald-800/50 p-2.5">Lembar</th>
                    <th className="border border-emerald-200/80 dark:border-emerald-800/50 p-2.5">Catatan</th>
                    <th className="border border-emerald-200/80 dark:border-emerald-800/50 p-2.5">Ttd</th>
                  </tr>
                </thead>
                <tbody>
                  {detailWeekRows.map(({ date, dateKey, log }, index) => {
                    const isTargetDate = selectedRecordModal?.date === dateKey
                    const surahName = log?.surah_name || log?.hafalan_surah_name
                    const ayahStart = log?.ayah_start || log?.hafalan_ayah_start
                    const ayahEnd = log?.ayah_end || log?.hafalan_ayah_end || ayahStart
                    const juzNum = log?.juz || log?.metadata?.juz || '-'
                    const barisAyat = log?.hafalan_baris || (ayahStart && ayahEnd ? `${Number(ayahEnd) - Number(ayahStart) + 1} ayat` : '—')

                    return (
                      <tr
                        key={dateKey}
                        className={`h-24 align-top transition-colors ${
                          isTargetDate
                            ? 'bg-emerald-50/70 dark:bg-emerald-950/30'
                            : 'hover:bg-slate-50 dark:hover:bg-slate-800/40'
                        }`}
                      >
                        <td className="border border-emerald-200/80 dark:border-emerald-800/50 p-3 text-center font-bold">
                          {index + 1}
                        </td>
                        <td className="border border-emerald-200/80 dark:border-emerald-800/50 p-3">
                          <p className="font-bold text-slate-900 dark:text-white">
                            {new Intl.DateTimeFormat('id-ID', { weekday: 'long' }).format(date)}
                          </p>
                          <p className="mt-1 text-[10px] text-slate-500">
                            {new Intl.DateTimeFormat('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(date)}
                          </p>
                          {isTargetDate && (
                            <span className="mt-1.5 inline-block rounded bg-emerald-600 px-1.5 py-0.5 text-[9px] font-bold text-white uppercase tracking-wider">
                              Dipilih
                            </span>
                          )}
                        </td>
                        <td className="border border-emerald-200/80 dark:border-emerald-800/50 p-3">{log?.tilawah_text || '—'}</td>
                        <td className="border border-emerald-200/80 dark:border-emerald-800/50 p-3 text-center">{log?.tilawah_baris || '—'}</td>
                        <td className="border border-emerald-200/80 dark:border-emerald-800/50 p-3">
                          {surahName ? (
                            <>
                              <p className="font-bold text-slate-900 dark:text-white">{surahName}</p>
                              <p className="mt-1 text-[10px] text-slate-500 dark:text-slate-400">
                                Ayat {ayahStart}–{ayahEnd} · Juz {juzNum}
                              </p>
                            </>
                          ) : (
                            '—'
                          )}
                        </td>
                        <td className="border border-emerald-200/80 dark:border-emerald-800/50 p-3 text-center">
                          {barisAyat}
                        </td>
                        <td className="border border-emerald-200/80 dark:border-emerald-800/50 p-3">{log?.murajaah_text || '—'}</td>
                        <td className="border border-emerald-200/80 dark:border-emerald-800/50 p-3 text-center">{log?.murajaah_lembar || '—'}</td>
                        <td className="border border-emerald-200/80 dark:border-emerald-800/50 p-3">
                          {log?.notes_teacher ? (
                            <span className="text-slate-700 dark:text-slate-200">{log.notes_teacher}</span>
                          ) : log?.kelancaran ? (
                            <div className="space-y-0.5">
                              <p className="text-[10px] font-semibold text-slate-600 dark:text-slate-300">Evaluasi: {log.kelancaran}</p>
                              {log.tajwid && log.tajwid !== '-' && <p className="text-[9px] text-slate-500">Tajwid: {log.tajwid}</p>}
                            </div>
                          ) : (
                            '—'
                          )}
                        </td>
                        <td className="border border-emerald-200/80 dark:border-emerald-800/50 p-3 text-center">
                          {log?.signature_teacher || log?.kelancaran ? (
                            <CheckCircle2 className="mx-auto h-5 w-5 text-emerald-600" aria-label="Sudah diverifikasi" />
                          ) : (
                            '—'
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
                <tfoot>
                  <tr className="bg-emerald-50/40 align-top dark:bg-emerald-950/20">
                    <td colSpan="8" className="h-20 border border-emerald-200/80 dark:border-emerald-800/50 p-3">
                      <strong className="text-slate-800 dark:text-slate-200">Catatan Guru:</strong>
                      <p className="mt-1 font-normal text-slate-600 dark:text-slate-300">
                        {detailWeekRows.map(({ log }) => log?.notes_teacher).filter(Boolean).at(-1) || 'Belum ada catatan guru pada minggu ini.'}
                      </p>
                    </td>
                    <td colSpan="2" className="border border-emerald-200/80 dark:border-emerald-800/50 p-3">
                      <strong className="text-slate-800 dark:text-slate-200">Guru:</strong>
                      <p className="mt-2 font-normal text-slate-700 dark:text-slate-300">{selectedRecordModal.teacher_name || 'Guru Tahfizh'}</p>
                    </td>
                  </tr>
                  <tr className="bg-emerald-50/40 align-top dark:bg-emerald-950/20">
                    <td colSpan="8" className="h-20 border border-emerald-200/80 dark:border-emerald-800/50 p-3">
                      <strong className="text-slate-800 dark:text-slate-200">Catatan Orang Tua:</strong>
                      <p className="mt-1 font-normal text-slate-600 dark:text-slate-300">
                        {detailWeekRows.map(({ log }) => log?.notes_parent).filter(Boolean).at(-1) || 'Belum ada catatan orang tua pada minggu ini.'}
                      </p>
                    </td>
                    <td colSpan="2" className="border border-emerald-200/80 dark:border-emerald-800/50 p-3">
                      <strong className="text-slate-800 dark:text-slate-200">Ttd Orang Tua:</strong>
                      <p className="mt-2 font-normal text-slate-700 dark:text-slate-300">
                        {detailWeekRows.some(({ log }) => log?.signature_parent) ? 'Sudah ditandatangani' : 'Belum ditandatangani'}
                      </p>
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>

            <footer className="flex shrink-0 flex-col gap-3 border-t border-slate-100 bg-slate-50/50 px-6 py-4 sm:flex-row sm:items-center sm:justify-between dark:border-slate-800 dark:bg-slate-900/40">
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  Jenis Setoran Terpilih: <strong className="text-emerald-700 dark:text-emerald-400">{selectedRecordModal.type || 'Tahfizh'}</strong>
                </span>
                {selectedRecordModal.kelancaran && selectedRecordModal.kelancaran !== '-' && (
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    · Kelancaran: <strong className="text-slate-800 dark:text-slate-200">{selectedRecordModal.kelancaran}</strong>
                  </span>
                )}
              </div>
              <div className="flex items-center justify-end gap-2.5">
                <MasterActionButton
                  variant="primary"
                  icon={Printer}
                  onClick={() => {
                    setPrintTargetRecord(selectedRecordModal)
                    setIsPrintModalOpen(true)
                  }}
                >
                  <span>Cetak Lembar Tahfizh</span>
                </MasterActionButton>
                <button
                  type="button"
                  onClick={() => setSelectedRecordModal(null)}
                  className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-br from-rose-500 via-rose-600 to-red-700 text-white px-4 py-2.5 text-xs font-extrabold border border-rose-300/40 transition-all duration-200 hover:scale-[1.03] active:scale-95 cursor-pointer"
                >
                  <div className="flex size-5 items-center justify-center rounded-lg bg-white/20 text-white">
                    <X className="size-3.5 text-white" strokeWidth={2.2} />
                  </div>
                  <span>Tutup Detail</span>
                </button>
              </div>
            </footer>
          </div>
        </div>
      )}

      {/* Modal Opsi Cetak & Unduh PDF */}
      <PrintOptionModal
        isOpen={isPrintModalOpen}
        onClose={() => {
          setIsPrintModalOpen(false)
          setPrintTargetRecord(null)
        }}
        onPrint={handlePrintClean}
        onDownloadPdf={handleDownloadPDF}
        title={
          printTargetRecord
            ? `Cetak Detail Setoran: ${printTargetRecord.student_name}`
            : 'Rekapan Setoran Tahfizh Al-Qur\'an'
        }
      />
    </ContainerComponent>
  )
}
