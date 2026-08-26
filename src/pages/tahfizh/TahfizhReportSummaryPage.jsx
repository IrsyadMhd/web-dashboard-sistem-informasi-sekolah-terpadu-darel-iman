import React, { useEffect, useState, useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowUpDown,
  BookMarked,
  BookOpen,
  BookOpenCheck,
  Calendar,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock,
  Copy,
  Download,
  Eye,
  FileSpreadsheet,
  Filter,
  GraduationCap,
  Layers,
  MoreVertical,
  Plus,
  Printer,
  RefreshCw,
  RotateCcw,
  Search,
  ShieldCheck,
  Sparkles,
  UserCheck,
  Users,
  UserX,
  X,
  Zap,
} from 'lucide-react'
import { Download1, Upload1 } from '@tailgrids/icons'

import { useAuthStore } from '../../stores/authStore'
import { hasAnyRole } from '../../auth/portalResolver'
import api from '../../services/api'
import { reportService } from '../../services/reportService'

import PageContainer from '../../components/app/PageContainer'
import AppBreadcrumb from '../../components/app/AppBreadcrumb'
import AppBadge from '../../components/app/AppBadge'
import AppSkeleton from '../../components/app/AppSkeleton'
import AppEmptyState from '../../components/app/AppEmptyState'
import TahfizhSubNav from '../../components/tahfizh/TahfizhSubNav'
import {
  MasterDataPage,
  MasterPageHeader,
  MasterStatCard,
  MasterStatsGrid,
  MasterErrorState,
  PrintOptionModal,
  SquircleActionButton,
} from '../../components/master-data'
import { printCleanTable, downloadPdfTable } from '../../utils/printHelper'

import { Button } from '@/components/tailgrids/core/button'
import { Input } from '@/components/tailgrids/core/input'
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
import { Backdrop, OverlayWrapper } from '@/components/tailgrids/core/overlay'

const MODAL_PAGE_SIZE = 6
const today = () => new Date().toISOString().slice(0, 10)
const formatAngka = (value) => new Intl.NumberFormat('id-ID').format(Number(value || 0))

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.04,
    },
  },
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
    cardBg: 'bg-emerald-50/70 dark:bg-emerald-950/40 border-emerald-200/80 dark:border-emerald-900/50',
    iconBg: 'bg-emerald-100 dark:bg-emerald-900/80',
    iconColor: 'text-emerald-700 dark:text-emerald-300',
    badge: 'bg-emerald-200/80 text-emerald-800 dark:bg-emerald-900/90 dark:text-emerald-200',
    text: 'text-emerald-700 dark:text-emerald-400',
  },
  violet: {
    cardBg: 'bg-violet-50/70 dark:bg-violet-950/40 border-violet-200/80 dark:border-violet-900/50',
    iconBg: 'bg-violet-100 dark:bg-violet-900/80',
    iconColor: 'text-violet-700 dark:text-violet-300',
    badge: 'bg-violet-200/80 text-violet-800 dark:bg-violet-900/90 dark:text-violet-200',
    text: 'text-violet-700 dark:text-violet-400',
  },
  sky: {
    cardBg: 'bg-sky-50/70 dark:bg-sky-950/40 border-sky-200/80 dark:border-sky-900/50',
    iconBg: 'bg-sky-100 dark:bg-sky-900/80',
    iconColor: 'text-sky-700 dark:text-sky-300',
    badge: 'bg-sky-200/80 text-sky-800 dark:bg-sky-900/90 dark:text-sky-200',
    text: 'text-sky-700 dark:text-sky-400',
  },
  rose: {
    cardBg: 'bg-rose-50/70 dark:bg-rose-950/40 border-rose-200/80 dark:border-rose-900/50',
    iconBg: 'bg-rose-100 dark:bg-rose-900/80',
    iconColor: 'text-rose-700 dark:text-rose-300',
    badge: 'bg-rose-200/80 text-rose-800 dark:bg-rose-900/90 dark:text-rose-200',
    text: 'text-rose-700 dark:text-rose-400',
  },
  amber: {
    cardBg: 'bg-amber-50/70 dark:bg-amber-950/40 border-amber-200/80 dark:border-amber-900/50',
    iconBg: 'bg-amber-100 dark:bg-amber-900/80',
    iconColor: 'text-amber-700 dark:text-amber-300',
    badge: 'bg-amber-200/80 text-amber-800 dark:bg-amber-900/90 dark:text-amber-200',
    text: 'text-amber-700 dark:text-amber-400',
  },
}

export default function TahfizhReportSummaryPage() {
  const user = useAuthStore((state) => state.user)

  // Determine user roles
  const userRoles = useMemo(() => {
    if (!user) return []
    if (Array.isArray(user.roles)) return user.roles.map((r) => (typeof r === 'string' ? r : r?.name || ''))
    if (user.role) return [typeof user.role === 'string' ? user.role : user.role?.name || '']
    return []
  }, [user])

  const userRoleStr = String(user?.role?.name || user?.role || '').toLowerCase()
  const isTeacher = ['guru', 'guru_mapel', 'guru_tahfizh', 'wali_kelas', 'musyrif'].some((r) => userRoleStr.includes(r))

  const isFoundationOrAdmin = useMemo(() => {
    return hasAnyRole(userRoles, [
      'Pengurus Yayasan', 'Yayasan', 'Ketua Yayasan', 'sekretaris_yayasan', 'bendahara_yayasan', 'pengurus_yayasan',
      'Super Admin', 'SuperAdmin', 'super_admin',
      'Admin', 'admin', 'administrator'
    ])
  }, [userRoles])

  // Filter States
  const [periodType, setPeriodType] = useState('bulanan')
  const [selectedDate, setSelectedDate] = useState(today())
  const [startDate, setStartDate] = useState(new Date(Date.now() - 30 * 86400000).toISOString().split('T')[0])
  const [endDate, setEndDate] = useState(today())
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1)
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())

  const [units, setUnits] = useState([])
  const [classes, setClasses] = useState([])
  const [teacherClasses, setTeacherClasses] = useState([])
  const [selectedUnit, setSelectedUnit] = useState('')
  const [selectedClass, setSelectedClass] = useState('')

  const [typeFilter, setTypeFilter] = useState('semua')
  const [searchQuery, setSearchQuery] = useState('')
  const [perPage, setPerPage] = useState(15)
  const [currentPage, setCurrentPage] = useState(1)

  const [loading, setLoading] = useState(false)
  const [records, setRecords] = useState([])
  const [error, setError] = useState('')

  // Modals
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false)
  const [selectedRecordModal, setSelectedRecordModal] = useState(null)
  const [printTargetRecord, setPrintTargetRecord] = useState(null)

  // Card Modal State for Summary Cards click
  const [cardModal, setCardModal] = useState({
    isOpen: false,
    statusKey: 'semua',
    title: '',
    tone: 'emerald',
    searchQuery: '',
    page: 1,
  })

  // Normalize API data structure
  const normalizeTahfizhRecord = (item) => ({
    id: item.id || item.log_id || Math.random(),
    date: item.record_date || item.date || item.created_at?.slice(0, 10) || today(),
    student_id: item.student_id || item.student?.id,
    student_name: item.student_name || item.student?.nama_lengkap || item.student?.full_name || item.student?.name || 'Siswa',
    nis: item.nis || item.student?.nis || item.student?.nisn || '-',
    class_id: String(item.class_id || item.student?.class_id || item.kelas_id || item.student?.kelas_id || ''),
    class_name: item.class_name || item.student?.class?.name || item.student?.kelas?.nama_kelas || item.kelas_name || 'Rombel',
    unit_name: item.unit_name || item.education_unit_name || item.student?.education_unit?.name || item.student?.unit?.name || item.student?.kelas?.unit_pendidikan?.name || item.class_model?.unit_pendidikan?.name || 'SMA Terpadu SIMSIT',
    type: item.type || item.jenis_setoran || item.category || 'Ziyadah',
    juz: item.juz || item.metadata?.juz || item.hafalan_juz || 30,
    surah_number: item.surah_number || item.hafalan_surah_number || item.surah?.nomor || 1,
    surah_name: item.surah_name || item.hafalan_surah_name || item.surah?.nama_latin || item.surah?.name || 'Surah',
    ayah_start: item.ayah_start || item.hafalan_ayah_start || item.ayat_awal || 1,
    ayah_end: item.ayah_end || item.hafalan_ayah_end || item.ayat_akhir || 1,
    kelancaran: item.kelancaran || item.metadata?.kelancaran || 'Sangat Lancar',
    tajwid: item.tajwid || item.metadata?.tajwid || 'Baik',
    makhraj: item.makhraj || item.metadata?.makhraj || 'Baik',
    teacher_name: item.teacher_name || item.teacher?.user?.name || item.teacher?.nama || 'Pengajar',
  })

  // Fetch Master / Teacher Classes & Units
  useEffect(() => {
    const fetchMaster = async () => {
      try {
        if (isTeacher) {
          const classRes = await api.get('/teacher/classes').catch(() => ({ data: { data: [] } }))
          const tClasses = classRes?.data?.data || []
          setTeacherClasses(tClasses)
          if (tClasses.length > 0) {
            setSelectedClass(String(tClasses[0].id))
          }
        } else {
          const [unitRes, classRes] = await Promise.all([
            api.get('/education-units').catch(() => ({ data: { data: [] } })),
            api.get('/classes').catch(() => ({ data: { data: [] } })),
          ])
          setUnits(unitRes?.data?.data || [])
          setClasses(classRes?.data?.data || [])
        }
      } catch (err) {
        console.error('Error loading master data:', err)
      }
    }
    fetchMaster()
  }, [isTeacher])

  // Fetch Data Tahfizh Summary Records strictly from database
  const fetchTahfizhReport = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const activeClassId = isFoundationOrAdmin ? undefined : (selectedClass || (isTeacher ? teacherClasses[0]?.id : undefined))
      const params = {
        period_type: periodType,
        date: selectedDate,
        start_date: startDate,
        end_date: endDate,
        month: selectedMonth,
        year: selectedYear,
        unit_id: selectedUnit || undefined,
        class_id: activeClassId || undefined,
        type: typeFilter !== 'semua' ? typeFilter : undefined,
        search: searchQuery || undefined,
        per_page: 500,
      }

      let rawData = []
      if (isTeacher) {
        const resTeacher = await api.get('/teacher/tahfizh', { params }).catch(() => null)
        rawData = resTeacher?.data?.data || resTeacher?.data || []
      }

      if (!rawData || (Array.isArray(rawData) && rawData.length === 0)) {
        const resReport = await reportService?.tahfizhReport(params).catch(() => null)
        rawData = resReport?.data || resReport || []
      }

      const normalizedList = (Array.isArray(rawData) ? rawData : rawData.data || []).map(normalizeTahfizhRecord)
      setRecords(normalizedList)
    } catch (err) {
      console.error('Error fetching tahfizh report:', err)
      setError('Gagal memuat data rekapan tahfizh dari database.')
      setRecords([])
    } finally {
      setLoading(false)
    }
  }, [periodType, selectedDate, startDate, endDate, selectedMonth, selectedYear, selectedUnit, selectedClass, typeFilter, searchQuery, isTeacher, teacherClasses, isFoundationOrAdmin])

  useEffect(() => {
    fetchTahfizhReport()
  }, [fetchTahfizhReport])

  // Filtered & Paginated records with STRICT class scoping for Teacher
  const filteredRecords = useMemo(() => {
    return records.filter((rec) => {
      if (isTeacher) {
        const teacherClassIds = teacherClasses.map((c) => String(c.id))
        const teacherClassNames = teacherClasses.map((c) => String(c.name || c.nama_kelas || '').toLowerCase())

        if (teacherClassIds.length > 0) {
          const recordClassId = String(rec.class_id || '')
          const recordClassName = String(rec.class_name || '').toLowerCase()

          const matchId = recordClassId && teacherClassIds.includes(recordClassId)
          const matchName = recordClassName && teacherClassNames.some((n) => n && recordClassName.includes(n))

          if (selectedClass) {
            if (recordClassId && recordClassId !== String(selectedClass)) return false
          } else if (!matchId && !matchName) {
            return false
          }
        }
      }

      if (selectedUnit && rec.unit_name && !rec.unit_name.toLowerCase().includes(selectedUnit.toLowerCase())) {
        // filter unit if applicable
      }

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase()
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
  }, [records, searchQuery, typeFilter, isTeacher, teacherClasses, selectedClass, selectedUnit])

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

  const cards = useMemo(
    () => [
      {
        label: 'Setoran Ziyadah',
        statusKey: 'Ziyadah',
        value: metrics.ziyadahCount,
        icon: BookMarked,
        tone: 'emerald',
        description: 'Hafalan ayat baru',
        percent: (metrics.ziyadahCount / metrics.baseTotal) * 100,
      },
      {
        label: 'Setoran Murajaah',
        statusKey: 'Murajaah',
        value: metrics.murajaahCount,
        icon: BookOpen,
        tone: 'violet',
        description: 'Pengulangan hafalan',
        percent: (metrics.murajaahCount / metrics.baseTotal) * 100,
      },
      {
        label: 'Tasmi\' (Ujian Duduk)',
        statusKey: 'Tasmi',
        value: metrics.tasmiCount,
        icon: Sparkles,
        tone: 'sky',
        description: 'Ujian sekali duduk',
        percent: (metrics.tasmiCount / metrics.baseTotal) * 100,
      },
      {
        label: 'Ujian Capaian Juz',
        statusKey: 'Ujian',
        value: metrics.ujianCount,
        icon: GraduationCap,
        tone: 'rose',
        description: 'Kelulusan per Juz',
        percent: (metrics.ujianCount / metrics.baseTotal) * 100,
      },
    ],
    [metrics]
  )

  const resetFilters = () => {
    setPeriodType('bulanan')
    setSelectedDate(today())
    setStartDate(new Date(Date.now() - 30 * 86400000).toISOString().split('T')[0])
    setEndDate(today())
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

  // Export & Print Handlers
  const handleExportCSV = () => {
    const filename = `Rekapan_Tahfizh_${periodType}_${today()}.csv`
    const csvHeader = ['#', 'Tanggal', 'Nama Siswa', 'NIS', 'Unit / Rombel', 'Jenis Setoran', 'Juz', 'Surah', 'Ayat Awal', 'Ayat Akhir', 'Kelancaran', 'Tajwid', 'Pengajar']
    const csvRows = filteredRecords.map((r, i) => [
      i + 1,
      r.date,
      r.student_name,
      r.nis || '-',
      r.unit_name || r.class_name || '-',
      r.type,
      r.juz,
      r.surah_name,
      r.ayah_start,
      r.ayah_end,
      r.kelancaran || 'Sangat Lancar',
      r.tajwid || 'Baik',
      r.teacher_name || '-',
    ])

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

  const handleImportData = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.csv, .xlsx, .xls'
    input.onchange = (e) => {
      const file = e.target.files?.[0]
      if (file) {
        alert(`File "${file.name}" siap di-import ke sistem!`)
      }
    }
    input.click()
  }

  const handlePrintClean = () => {
    setIsPrintModalOpen(false)
    const listToPrint = printTargetRecord ? [printTargetRecord] : filteredRecords
    printCleanTable({
      title: 'Laporan Rekapan Setoran Tahfizh Al-Qur\'an',
      subtitle: `Periode: ${periodType.toUpperCase()} — Total Data: ${listToPrint.length} Rekaman`,
      headers: ['#', 'Tanggal', 'Siswa', 'NIS', 'Rombel/Unit', 'Jenis', 'Hafalan (Juz & Surah)', 'Kelancaran', 'Pengajar'],
      rows: listToPrint.map((r, i) => [
        i + 1,
        r.date,
        r.student_name,
        r.nis || '-',
        `${r.class_name || '-'} (${r.unit_name || '-'})`,
        r.type,
        `Juz ${r.juz} • ${r.surah_name} (${r.ayah_start}-${r.ayah_end})`,
        r.kelancaran || 'Sangat Lancar',
        r.teacher_name || '-',
      ]),
    })
  }

  const handleDownloadPDF = () => {
    setIsPrintModalOpen(false)
    const listToPrint = printTargetRecord ? [printTargetRecord] : filteredRecords
    downloadPdfTable({
      title: 'Laporan Rekapan Setoran Tahfizh Al-Qur\'an',
      subtitle: `Periode: ${periodType.toUpperCase()}`,
      headers: ['#', 'Tanggal', 'Siswa', 'NIS', 'Rombel/Unit', 'Jenis', 'Hafalan (Juz & Surah)', 'Kelancaran', 'Pengajar'],
      rows: listToPrint.map((r, i) => [
        i + 1,
        r.date,
        r.student_name,
        r.nis || '-',
        `${r.class_name || '-'} (${r.unit_name || '-'})`,
        r.type,
        `Juz ${r.juz} • ${r.surah_name} (${r.ayah_start}-${r.ayah_end})`,
        r.kelancaran || 'Sangat Lancar',
        r.teacher_name || '-',
      ]),
      filename: `Rekapan_Tahfizh_${today()}.pdf`,
    })
  }

  const activeTeacherClassName = useMemo(() => {
    if (!isTeacher || teacherClasses.length === 0) return ''
    const current = teacherClasses.find((c) => String(c.id) === String(selectedClass))
    return current ? current.name || current.nama_kelas : teacherClasses.map((c) => c.name || c.nama_kelas).join(', ')
  }, [isTeacher, teacherClasses, selectedClass])

  if (loading) {
    return (
      <PageContainer className="space-y-6 pb-12">
        <AppSkeleton rows={8} />
      </PageContainer>
    )
  }

  if (error) {
    return (
      <PageContainer className="space-y-6 pb-12">
        <MasterErrorState message={error} onRetry={fetchTahfizhReport} />
      </PageContainer>
    )
  }

  return (
    <MasterDataPage className="education-unit-page tahfizh-recap-page" hideBreadcrumb>
      {/* 🧭 SCOPE BADGE & BREADCRUMB HEADER */}
      <div className="mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <AppBreadcrumb
          items={[
            { label: 'Dashboard', href: '/dashboard' },
            { label: 'Tahfizh & Murajaah', href: '/dashboard/tahfizh' },
            { label: 'Laporan Rekapan Tahfizh' },
          ]}
        />

        {isFoundationOrAdmin ? (
          <div className="flex items-center gap-2 rounded-2xl border border-purple-200 bg-purple-50 px-3.5 py-1.5 text-xs font-bold text-purple-900 dark:border-purple-900/60 dark:bg-purple-950/40 dark:text-purple-300 self-start sm:self-auto">
            <Sparkles className="h-4 w-4 shrink-0 text-purple-600 dark:text-purple-400" />
            <span>Scope Yayasan & Admin: Konsolidasi Seluruh Unit</span>
          </div>
        ) : isTeacher ? (
          <div className="flex items-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 px-3.5 py-1.5 text-xs font-bold text-emerald-800 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-300 self-start sm:self-auto">
            <UserCheck className="h-4 w-4 shrink-0 text-emerald-600" />
            <span>Rombel {activeTeacherClassName || 'Anda'}</span>
          </div>
        ) : null}
      </div>

      {/* MODERN HERO CARD HEADER (MATCHING PORTAL ORANG TUA / SISWA STYLE) */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="mb-5">
        <div className="relative overflow-hidden rounded-[22px] border-2 border-emerald-500/30 bg-gradient-to-r from-emerald-500/15 via-teal-500/10 to-emerald-600/15 p-5 sm:p-6 shadow-md shadow-emerald-500/10 dark:border-emerald-600/40 dark:bg-gradient-to-r dark:from-emerald-950/70 dark:via-teal-950/50 dark:to-slate-900">
          <div className="pointer-events-none absolute -top-12 -right-12 h-48 w-48 rounded-full bg-gradient-to-br from-emerald-500/30 via-teal-400/20 to-transparent blur-3xl" />
          <div className="pointer-events-none absolute -bottom-12 -left-12 h-48 w-48 rounded-full bg-gradient-to-tr from-teal-500/20 via-emerald-400/20 to-transparent blur-3xl" />

          <div className="relative z-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex size-12 sm:size-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700 text-white shadow-xl shadow-emerald-600/40 border border-emerald-300/40 dark:from-emerald-400 dark:via-emerald-500 dark:to-teal-600">
                <BookOpenCheck className="size-6 sm:size-7 text-white" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-emerald-600 to-teal-600 px-3.5 py-1 text-xs font-extrabold text-white shadow-md shadow-emerald-600/30">
                    <Sparkles className="size-3 text-amber-300 animate-pulse" />
                    Laporan Rekapan Tahfizh
                  </span>
                  <span className="inline-flex items-center rounded-full bg-emerald-100 px-3 py-0.5 text-xs font-bold text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/60">
                    {metrics.totalCount} Total Log Setoran
                  </span>
                </div>
                <h1 className="mt-1.5 text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                  Laporan Rekapan Setoran Tahfizh Al-Qur'an
                </h1>
                <p className="mt-0.5 text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-300 max-w-2xl">
                  Pusat rekapitulasi capaian hafalan santri: Ziyadah, Murajaah, Tasmi' sekali duduk, dan Ujian kelulusan per Juz.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 shrink-0 z-10">
              <Button
                type="button"
                variant="primary"
                appearance="fill"
                size="sm"
                onClick={fetchTahfizhReport}
                disabled={loading}
                prefixIcon={<RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />}
                className="!bg-gradient-to-r !from-emerald-600 !to-teal-600 !text-white font-bold shadow-md shadow-emerald-600/25 cursor-pointer"
              >
                Segarkan Data
              </Button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* 🧭 CARD TAHFIZH SUB-NAV (Positioned directly above Data Rekapan Tahfizh Santri Card) */}
      <TahfizhSubNav />

      {/* 📊 TOP MASTER STATS GRID (4 KPI Cards matching Mutabaah) */}
      <MasterStatsGrid>
        <MasterStatCard
          icon={BookOpen}
          label="Total Setoran Tahfizh"
          value={metrics.totalCount}
          description="Sesuai data log rekapan"
          variant="info"
          delay={40}
        />
        <MasterStatCard
          icon={BookMarked}
          label="Setoran Ziyadah"
          value={metrics.ziyadahCount}
          description="Hafalan ayat baru"
          variant="success"
          delay={80}
        />
        <MasterStatCard
          icon={CheckCircle2}
          label="Setoran Murajaah"
          value={metrics.murajaahCount}
          description="Pengulangan hafalan"
          variant="success"
          delay={120}
        />
        <MasterStatCard
          icon={Sparkles}
          label="Tasmi' & Ujian Juz"
          value={metrics.tasmiCount + metrics.ujianCount}
          description="Evaluasi & kelulusan"
          variant="warning"
          delay={160}
        />
      </MasterStatsGrid>

      {/* 📊 SUMMARY STATUS CARDS (4 Equal Pastel Grid Cards matching Mutabaah) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 my-5">
        {cards.map(({ label, statusKey, value, icon: Icon, tone, description, percent }) => {
          const style = toneStyles[tone] || toneStyles.emerald
          return (
            <div
              key={label}
              onClick={() => openCardModal(statusKey, label, tone)}
              className={`rounded-2xl border p-4 shadow-2xs hover:shadow-md transition-all duration-200 cursor-pointer ${style.cardBg}`}
              title={`Klik untuk melihat rincian ${label}`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className={`text-xs font-bold uppercase tracking-wider ${style.text}`}>{label}</span>
                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${style.badge}`}>
                  {percent.toFixed(1)}%
                </span>
              </div>
              <p className={`text-2xl font-black mt-1 ${style.text}`}>
                {formatAngka(value)}
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">{description}</p>
            </div>
          )
        })}
      </div>

      {/* 🟢 MAIN TABLE & FILTER CARD (Data Rekapan Tahfizh Santri matching Mutabaah style) */}
      <section className="relative overflow-hidden rounded-[22px] border-2 border-emerald-500/25 bg-white p-5 shadow-md shadow-emerald-500/5 dark:border-emerald-600/35 dark:bg-[#1B2433]">
        {/* Header Baris 1: Title & Soft Pastel Squircle Action Buttons */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between bg-gradient-to-r from-emerald-500/10 via-teal-500/5 to-transparent border-b border-emerald-500/20 -mx-5 -mt-5 p-5 mb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Data Rekapan Tahfizh Santri
            </h3>
            <p className="text-xs text-slate-400">
              Daftar rekapitulasi setoran hafalan Ziyadah, Murajaah, Tasmi', dan Ujian Tahfizh per periode
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-nowrap shrink-0 overflow-visible py-1">
            {/* Button: Import Data (Upload1 - Sky Blue) */}
            <div className="group relative inline-flex">
              <button
                type="button"
                aria-label="Import Data"
                className="flex size-10 items-center justify-center rounded-2xl bg-sky-100/90 text-sky-700 hover:bg-sky-500 hover:text-white dark:bg-sky-950/60 dark:text-sky-300 dark:hover:bg-sky-500 dark:hover:text-white transition-colors duration-200 hover:shadow-md hover:shadow-sky-500/30 cursor-pointer shadow-2xs"
                onClick={handleImportData}
              >
                <Upload1 className="size-5 transition-colors" />
              </button>
              <div className="pointer-events-none absolute bottom-full left-1/2 mb-2 -translate-x-1/2 opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 transition-all duration-200 ease-out z-50 whitespace-nowrap rounded-lg bg-slate-900 px-2.5 py-1 text-[11px] font-bold text-white shadow-xl dark:bg-slate-100 dark:text-slate-900">
                <div className="absolute top-full left-1/2 -mt-1 -translate-x-1/2 border-4 border-transparent border-t-slate-900 dark:border-t-slate-100" />
                Import Data (Excel/CSV)
              </div>
            </div>

            {/* Button: Export Data (Download1 - Amber/Orange) */}
            <div className="group relative inline-flex">
              <button
                type="button"
                aria-label="Export Data CSV"
                className="flex size-10 items-center justify-center rounded-2xl bg-amber-100/90 text-amber-700 hover:bg-amber-500 hover:text-white dark:bg-amber-950/60 dark:text-amber-300 dark:hover:bg-amber-500 dark:hover:text-white transition-colors duration-200 hover:shadow-md hover:shadow-amber-500/30 cursor-pointer shadow-2xs"
                onClick={handleExportCSV}
              >
                <Download1 className="size-5 transition-colors" />
              </button>
              <div className="pointer-events-none absolute bottom-full left-1/2 mb-2 -translate-x-1/2 opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 transition-all duration-200 ease-out z-50 whitespace-nowrap rounded-lg bg-slate-900 px-2.5 py-1 text-[11px] font-bold text-white shadow-xl dark:bg-slate-100 dark:text-slate-900">
                <div className="absolute top-full left-1/2 -mt-1 -translate-x-1/2 border-4 border-transparent border-t-slate-900 dark:border-t-slate-100" />
                Export Data CSV
              </div>
            </div>

            {/* Button: Cetak Data (Printer - Indigo) */}
            <div className="group relative inline-flex">
              <button
                type="button"
                aria-label="Cetak Data"
                className="flex size-10 items-center justify-center rounded-2xl bg-indigo-100/90 text-indigo-700 hover:bg-indigo-600 hover:text-white dark:bg-indigo-950/60 dark:text-indigo-300 dark:hover:bg-indigo-600 dark:hover:text-white transition-colors duration-200 hover:shadow-md hover:shadow-indigo-600/30 cursor-pointer shadow-2xs"
                onClick={() => {
                  setPrintTargetRecord(null)
                  setIsPrintModalOpen(true)
                }}
              >
                <Printer className="size-5 transition-colors" />
              </button>
              <div className="pointer-events-none absolute bottom-full left-1/2 mb-2 -translate-x-1/2 opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 transition-all duration-200 ease-out z-50 whitespace-nowrap rounded-lg bg-slate-900 px-2.5 py-1 text-[11px] font-bold text-white shadow-xl dark:bg-slate-100 dark:text-slate-900">
                <div className="absolute top-full left-1/2 -mt-1 -translate-x-1/2 border-4 border-transparent border-t-slate-900 dark:border-t-slate-100" />
                Cetak Data
              </div>
            </div>

            {/* Button: Reset Filter (RotateCcw - Emerald) */}
            <div className="group relative inline-flex">
              <button
                type="button"
                aria-label="Reset Filter"
                className="flex size-10 items-center justify-center rounded-2xl bg-emerald-100/90 text-emerald-700 hover:bg-emerald-600 hover:text-white dark:bg-emerald-950/60 dark:text-emerald-300 dark:hover:bg-emerald-600 dark:hover:text-white transition-colors duration-200 hover:shadow-md hover:shadow-emerald-600/30 cursor-pointer shadow-2xs"
                onClick={resetFilters}
              >
                <RotateCcw className="size-5 transition-colors" />
              </button>
              <div className="pointer-events-none absolute bottom-full left-1/2 mb-2 -translate-x-1/2 opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 transition-all duration-200 ease-out z-50 whitespace-nowrap rounded-lg bg-slate-900 px-2.5 py-1 text-[11px] font-bold text-white shadow-xl dark:bg-slate-100 dark:text-slate-900">
                <div className="absolute top-full left-1/2 -mt-1 -translate-x-1/2 border-4 border-transparent border-t-slate-900 dark:border-t-slate-100" />
                Reset Filter
              </div>
            </div>
          </div>
        </div>

        {/* Filter Baris 2: Filter Data Tahfizh (Placed above datatable matching Mutabaah) */}
        <div className="py-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2 mb-3">
            <Filter className="h-4 w-4 text-[#0E5C44] dark:text-emerald-400" />
            <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">Filter Data Tahfizh</h4>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-8 items-end">
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Dari</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs font-semibold text-slate-800 focus:border-[#0E5C44] focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Sampai</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs font-semibold text-slate-800 focus:border-[#0E5C44] focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Unit</label>
              <select
                value={selectedUnit}
                onChange={(e) => {
                  setSelectedUnit(e.target.value)
                  setCurrentPage(1)
                }}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs font-semibold text-slate-800 focus:border-[#0E5C44] focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              >
                <option value="">Semua Unit</option>
                {units.map((unit) => (
                  <option key={unit.id} value={unit.name || unit.id}>{unit.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Rombel / Kelas</label>
              <select
                value={selectedClass}
                onChange={(e) => {
                  setSelectedClass(e.target.value)
                  setCurrentPage(1)
                }}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs font-semibold text-slate-800 focus:border-[#0E5C44] focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              >
                <option value="">Semua Rombel</option>
                {(isTeacher ? teacherClasses : classes).map((cls) => (
                  <option key={cls.id} value={cls.id}>{cls.name || cls.nama_kelas}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Jenis Setoran</label>
              <select
                value={typeFilter}
                onChange={(e) => {
                  setTypeFilter(e.target.value)
                  setCurrentPage(1)
                }}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs font-semibold text-slate-800 focus:border-[#0E5C44] focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              >
                <option value="semua">Semua Jenis</option>
                <option value="Ziyadah">Ziyadah</option>
                <option value="Murajaah">Murajaah</option>
                <option value="Tasmi">Tasmi'</option>
                <option value="Ujian">Ujian</option>
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Pencarian</label>
              <input
                type="text"
                placeholder="Cari santri/NIS/surah..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value)
                  setCurrentPage(1)
                }}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs font-semibold text-slate-800 focus:border-[#0E5C44] focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Tampilkan</label>
              <select
                value={perPage}
                onChange={(e) => {
                  setPerPage(Number(e.target.value))
                  setCurrentPage(1)
                }}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs font-semibold text-slate-800 focus:border-[#0E5C44] focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              >
                <option value={5}>5 per hal</option>
                <option value={10}>10 per hal</option>
                <option value={15}>15 per hal</option>
                <option value={25}>25 per hal</option>
                <option value={50}>50 per hal</option>
                <option value={100}>100 per hal</option>
              </select>
            </div>
            <div>
              <button
                type="button"
                onClick={resetFilters}
                className="w-full flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white p-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 cursor-pointer"
              >
                <RotateCcw className="h-3.5 w-3.5" /> Reset
              </button>
            </div>
          </div>
        </div>

        {/* Datatable Section matching Mutabaah styling */}
        <div className="overflow-x-auto mt-4">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/80 font-bold text-slate-500 uppercase tracking-wider dark:border-slate-800 dark:bg-slate-800/50 dark:text-slate-400">
                <th className="w-10 px-3 py-3 text-center">#</th>
                <th className="px-3 py-3 text-center">Tanggal</th>
                <th className="px-3 py-3">Santri</th>
                <th className="px-3 py-3">Kelas & Unit</th>
                <th className="px-3 py-3 text-center">Jenis Setoran</th>
                <th className="px-3 py-3">Capaian Hafalan</th>
                <th className="px-3 py-3 text-center">Kelancaran</th>
                <th className="px-3 py-3 text-center">Tajwid</th>
                <th className="px-3 py-3">Pengajar</th>
                <th className="px-3 py-3 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {paginatedRecords.length === 0 ? (
                <tr>
                  <td colSpan={10} className="px-4 py-12 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Users className="size-8 text-slate-300 dark:text-slate-600" />
                      <p className="text-xs font-semibold">Tidak ada data Rekapan Tahfizh yang ditemukan</p>
                      <p className="text-[11px] text-slate-400">Coba ubah filter atau kata kunci pencarian Anda</p>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedRecords.map((item, index) => {
                  const studentName = item.student_name || 'Siswa'
                  const studentNis = item.nis || '-'
                  const type = item.type || 'Ziyadah'
                  const badgeVariant =
                    type === 'Ziyadah' ? 'success' : type === 'Murajaah' ? 'info' : type === 'Tasmi' ? 'purple' : 'warning'

                  return (
                    <tr key={item.id || index} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/30 transition">
                      <td className="px-3 py-3 text-center font-bold text-slate-400 text-xs">
                        {(currentPage - 1) * perPage + index + 1}
                      </td>

                      <td className="px-3 py-3 text-center font-mono font-semibold text-slate-600 dark:text-slate-400 text-xs whitespace-nowrap">
                        {item.date}
                      </td>

                      {/* Cell Identitas Siswa dengan Circle Avatar & HoverCard */}
                      <td className="px-3 py-3">
                        <HoverCard>
                          <HoverCardTrigger
                            onClick={(e) => {
                              e.preventDefault()
                              setSelectedRecordModal(item)
                            }}
                            className="cursor-pointer inline-block"
                          >
                            <div className="flex items-center gap-2.5">
                              <span className="grid h-8 w-8 place-items-center rounded-full bg-emerald-100 text-[10px] font-black text-emerald-700 shrink-0">
                                {studentName.split(' ').map((part) => part[0]).slice(0, 2).join('')}
                              </span>
                              <div>
                                <p className="font-bold text-slate-900 dark:text-white hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
                                  {studentName}
                                </p>
                                <p className="text-[10px] text-slate-400 font-mono">NIS: {studentNis}</p>
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
                                onClick={() => setSelectedRecordModal(item)}
                                className="w-full py-2 bg-[#0E5C44] text-white text-[10px] font-bold uppercase tracking-wider rounded-xl transition-all hover:bg-[#1E8E5A] active:scale-98 shadow-xs cursor-pointer"
                              >
                                Lihat Detail Setoran
                              </button>
                            </div>
                          </HoverCardContent>
                        </HoverCard>
                      </td>

                      <td className="px-3 py-3">
                        <p className="font-semibold text-slate-800 dark:text-slate-200">{item.class_name}</p>
                        <p className="text-[10px] text-slate-400">{item.unit_name}</p>
                      </td>

                      <td className="px-3 py-3 text-center">
                        <AppBadge variant={badgeVariant}>
                          {type}
                        </AppBadge>
                      </td>

                      <td className="px-3 py-3">
                        <div>
                          <strong className="block text-slate-900 dark:text-white text-xs font-extrabold">
                            Juz {item.juz} • {item.surah_name}
                          </strong>
                          <span className="text-[11px] text-slate-500 font-medium font-mono">
                            Ayat {item.ayah_start} s/d {item.ayah_end}
                          </span>
                        </div>
                      </td>

                      <td className="px-3 py-3 text-center">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-lg text-[10px] font-bold ${
                            item.kelancaran === 'Sangat Lancar'
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                              : item.kelancaran === 'Lancar'
                              ? 'bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300'
                              : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                          }`}
                        >
                          {item.kelancaran || 'Sangat Lancar'}
                        </span>
                      </td>

                      <td className="px-3 py-3 text-center">
                        <span className="inline-block px-2.5 py-0.5 rounded-lg text-[10px] font-bold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                          {item.tajwid || 'Baik'}
                        </span>
                      </td>

                      <td className="px-3 py-3 font-semibold text-slate-700 dark:text-slate-300 text-xs">
                        {item.teacher_name || '-'}
                      </td>

                      <td className="px-3 py-3 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            title="Lihat Detail"
                            onClick={() => setSelectedRecordModal(item)}
                            className="rounded-lg border border-slate-200 bg-white p-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 cursor-pointer"
                          >
                            <Eye className="h-3.5 w-3.5" />
                          </button>
                          <button
                            title="Cetak Detail"
                            onClick={() => {
                              setPrintTargetRecord(item)
                              setIsPrintModalOpen(true)
                            }}
                            className="rounded-lg border border-indigo-200 bg-indigo-50 p-1.5 text-xs font-bold text-indigo-700 hover:bg-indigo-100 dark:border-indigo-900/50 dark:bg-indigo-950/40 dark:text-indigo-300 cursor-pointer"
                          >
                            <Printer className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer Pagination Controls matching Mutabaah */}
        <div className="w-full border-t border-slate-100 px-4 py-3.5 sm:px-6 md:px-8 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 mt-4">
          <div className="text-xs text-slate-500 font-medium">
            Menampilkan <span className="font-bold text-slate-700 dark:text-slate-200">{filteredRecords.length > 0 ? (currentPage - 1) * perPage + 1 : 0}</span> s.d. <span className="font-bold text-slate-700 dark:text-slate-200">{Math.min(currentPage * perPage, filteredRecords.length)}</span> dari <span className="font-bold text-slate-700 dark:text-slate-200">{filteredRecords.length}</span> santri
          </div>
          {totalPages > 1 && (
            <div className="w-full sm:w-auto">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={(p) => setCurrentPage(p)}
                sideLayout="full"
              />
            </div>
          )}
        </div>
      </section>

      {/* Summary Card Interactive Datatable Modal */}
      {cardModal.isOpen && (
        <Dialog
          isOpen={cardModal.isOpen}
          onOpenChange={(open) => !open && closeCardModal()}
          className="w-full max-w-4xl max-h-[90vh] flex flex-col p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl"
        >
          <DialogHeader className="flex flex-row items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
            <div>
              <div className="flex items-center gap-3">
                <DialogTitle className="text-xl font-bold text-slate-900 dark:text-slate-100">
                  {cardModal.title}
                </DialogTitle>
                <AppBadge variant={cardModal.tone === 'rose' ? 'danger' : cardModal.tone === 'amber' ? 'warning' : 'success'}>
                  {modalRows.length} Data Setoran
                </AppBadge>
              </div>
              <DialogDescription className="text-xs text-slate-500 mt-1">
                Daftar rincian log setoran tahfizh siswa dengan status {cardModal.title}
              </DialogDescription>
            </div>
          </DialogHeader>

          <DialogBody className="flex-1 overflow-y-auto py-4 space-y-4">
            {/* Modal Search Toolbar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl">
              <div className="relative w-full sm:w-80">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Cari nama siswa, NIS, atau surah..."
                  value={cardModal.searchQuery}
                  onChange={(e) => setCardModal((prev) => ({ ...prev, searchQuery: e.target.value, page: 1 }))}
                  className="w-full pl-9 pr-8 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500"
                />
                {cardModal.searchQuery && (
                  <button
                    type="button"
                    onClick={() => setCardModal((prev) => ({ ...prev, searchQuery: '', page: 1 }))}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Modal Datatable */}
            <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 font-semibold border-b border-slate-200 dark:border-slate-700">
                  <tr>
                    <th className="py-3 px-4">No</th>
                    <th className="py-3 px-4">Tanggal</th>
                    <th className="py-3 px-4">Siswa</th>
                    <th className="py-3 px-4">Jenis</th>
                    <th className="py-3 px-4">Hafalan</th>
                    <th className="py-3 px-4">Kelancaran</th>
                    <th className="py-3 px-4">Pengajar</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
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
                            Juz {row.juz} • {row.surah_name} ({row.ayah_start}-{row.ayah_end})
                          </td>
                          <td className="py-3 px-4 font-medium text-slate-600">
                            {row.kelancaran || 'Sangat Lancar'}
                          </td>
                          <td className="py-3 px-4 text-slate-500 font-medium">
                            {row.teacher_name || '-'}
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

          <DialogFooter className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-800">
            <span className="text-xs text-slate-500 font-medium">
              Menampilkan {modalRows.length ? (cardModal.page - 1) * MODAL_PAGE_SIZE + 1 : 0}–{Math.min(cardModal.page * MODAL_PAGE_SIZE, modalRows.length)} dari {modalRows.length} data
            </span>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 mr-4">
                <button
                  type="button"
                  disabled={cardModal.page === 1}
                  onClick={() => setCardModal((prev) => ({ ...prev, page: prev.page - 1 }))}
                  className="p-1 rounded border border-slate-200 dark:border-slate-700 disabled:opacity-40 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <span className="text-xs font-semibold px-2 text-slate-700 dark:text-slate-300">
                  {cardModal.page} / {modalTotalPages}
                </span>
                <button
                  type="button"
                  disabled={cardModal.page === modalTotalPages}
                  onClick={() => setCardModal((prev) => ({ ...prev, page: prev.page + 1 }))}
                  className="p-1 rounded border border-slate-200 dark:border-slate-700 disabled:opacity-40 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
              <Button variant="ghost" onClick={closeCardModal}>
                Tutup
              </Button>
            </div>
          </DialogFooter>
        </Dialog>
      )}

      {/* Modal Detail Rincian Setoran Tahfizh Siswa saat Klik Data */}
      <OverlayWrapper isOpen={!!selectedRecordModal} onOpenChange={() => setSelectedRecordModal(null)}>
        <Backdrop isOpen={!!selectedRecordModal} onOpenChange={() => setSelectedRecordModal(null)}>
          <Dialog
            isOpen={!!selectedRecordModal}
            onOpenChange={() => setSelectedRecordModal(null)}
            showCloseButton={true}
            className="w-full max-w-lg rounded-2xl p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4"
          >
            {selectedRecordModal && (
              <>
                <DialogHeader>
                  <DialogTitle className="text-lg font-bold text-[#0E5C44] dark:text-[#3FBF75] flex items-center gap-3">
                    <div className="size-10 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 text-[#0E5C44] dark:text-[#3FBF75] flex items-center justify-center font-extrabold text-sm shrink-0">
                      {(selectedRecordModal.student_name || 'S')[0]}
                    </div>
                    <div>
                      <h3 className="text-lg font-extrabold leading-tight text-slate-900 dark:text-white">
                        {selectedRecordModal.student_name}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 font-medium font-mono">
                        NIS: {selectedRecordModal.nis || '-'}
                      </p>
                    </div>
                  </DialogTitle>
                </DialogHeader>

                <DialogBody className="space-y-4 py-2">
                  <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl border border-slate-200/80 dark:border-slate-800">
                    <div>
                      <span className="text-slate-400 block text-[10px] font-semibold">Jenis Setoran</span>
                      <span className="font-bold text-emerald-700 dark:text-emerald-400">
                        {selectedRecordModal.type}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px] font-semibold">Tanggal Setoran</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200 font-mono">
                        {selectedRecordModal.date}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px] font-semibold">Evaluasi Kelancaran</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200">
                        {selectedRecordModal.kelancaran || 'Sangat Lancar'}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px] font-semibold">Evaluasi Tajwid</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200">
                        {selectedRecordModal.tajwid || 'Baik'}
                      </span>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/60 dark:border-emerald-800/60">
                    <span className="block text-[10px] font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">
                      Capaian Hafalan
                    </span>
                    <span className="text-lg font-black text-emerald-900 dark:text-emerald-200">
                      Juz {selectedRecordModal.juz} • {selectedRecordModal.surah_name} (Ayat {selectedRecordModal.ayah_start} s/d {selectedRecordModal.ayah_end})
                    </span>
                  </div>
                </DialogBody>

                <DialogFooter className="pt-2 flex justify-end gap-2">
                  <Button
                    variant="ghost"
                    appearance="outline"
                    size="sm"
                    onClick={() => setSelectedRecordModal(null)}
                  >
                    Tutup
                  </Button>
                  <Button
                    variant="primary"
                    appearance="fill"
                    size="sm"
                    onClick={() => {
                      setPrintTargetRecord(selectedRecordModal)
                      setSelectedRecordModal(null)
                      setIsPrintModalOpen(true)
                    }}
                  >
                    <Printer className="size-4 mr-1.5" /> Cetak Detail Setoran
                  </Button>
                </DialogFooter>
              </>
            )}
          </Dialog>
        </Backdrop>
      </OverlayWrapper>

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
    </MasterDataPage>
  )
}
