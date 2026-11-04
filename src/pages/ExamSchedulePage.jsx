import React, { useState, useEffect, useMemo } from 'react'
import { Navigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import {
  CalendarDays,
  Clock,
  BookOpen,
  GraduationCap,
  Users,
  Search,
  Filter,
  RefreshCw,
  Plus,
  Pencil,
  Trash2,
  Printer,
  Sparkles,
  Layers,
  Award,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  Building2,
  FileText,
  DoorOpen,
  Palette,
  Tag,
  UserCheck,
  MessageSquare,
  Phone,
  ExternalLink,
  ShieldAlert,
  CheckCircle,
  Info,
  X,
  Send,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react'
import { useAuthStore } from '../stores/authStore'
import { getUserRoleLevel, ROLE_LEVELS, ROLES, hasAnyRole } from '../auth/portalResolver'
import { useToast } from '../components/app/ToastProvider'
import useDebounce from '../hooks/useDebounce'
import { examScheduleService } from '../services/examScheduleService'
import PageContainer from '../components/app/PageContainer'
import AppBreadcrumb from '../components/app/AppBreadcrumb'
import {
  MasterDataTable,
  SquircleActionButton,
  MasterFormModal,
  MasterDeleteDialog,
} from '../components/master-data'
import HeroUiFilterSelect from '../components/ui/HeroUiFilterSelect'
import { printCleanTable, downloadPdfTable } from '../utils/printHelper'
import { DatePicker } from '@/components/ui/date-picker'
import { cn } from '../lib/utils'

// Palet warna KPI Cards Hero UI dengan Top Bar Gradient
const MODERN_CARD_TONES = {
  emerald: {
    card: 'border-emerald-300/70 bg-gradient-to-br from-emerald-50 via-teal-50/60 to-white hover:border-emerald-400 dark:border-emerald-700/50 dark:from-emerald-950/40 dark:via-teal-950/20 dark:to-slate-900',
    iconBox: 'bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-emerald-500/30',
    title: 'text-emerald-700 dark:text-emerald-400',
    val: 'text-emerald-700 dark:text-emerald-300',
    tag: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/60 dark:text-emerald-300',
    topBar: 'bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-600',
  },
  amber: {
    card: 'border-amber-300/70 bg-gradient-to-br from-amber-50 via-orange-50/60 to-white hover:border-amber-400 dark:border-amber-700/50 dark:from-amber-950/40 dark:via-orange-950/20 dark:to-slate-900',
    iconBox: 'bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-amber-500/30',
    title: 'text-amber-700 dark:text-amber-400',
    val: 'text-amber-700 dark:text-amber-300',
    tag: 'bg-amber-100 text-amber-700 dark:bg-amber-900/60 dark:text-amber-300',
    topBar: 'bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600',
  },
  blue: {
    card: 'border-blue-300/70 bg-gradient-to-br from-blue-50 via-cyan-50/60 to-white hover:border-blue-400 dark:border-blue-700/50 dark:from-blue-950/40 dark:via-cyan-950/20 dark:to-slate-900',
    iconBox: 'bg-gradient-to-br from-blue-500 to-cyan-600 text-white shadow-blue-500/30',
    title: 'text-blue-700 dark:text-blue-400',
    val: 'text-blue-700 dark:text-blue-300',
    tag: 'bg-blue-100 text-blue-700 dark:bg-blue-900/60 dark:text-blue-300',
    topBar: 'bg-gradient-to-r from-blue-500 via-cyan-400 to-blue-600',
  },
  purple: {
    card: 'border-purple-300/70 bg-gradient-to-br from-purple-50 via-violet-50/60 to-white hover:border-purple-400 dark:border-purple-700/50 dark:from-purple-950/40 dark:via-violet-950/20 dark:to-slate-900',
    iconBox: 'bg-gradient-to-br from-purple-500 to-violet-600 text-white shadow-purple-500/30',
    title: 'text-purple-700 dark:text-purple-400',
    val: 'text-purple-700 dark:text-purple-300',
    tag: 'bg-purple-100 text-purple-700 dark:bg-purple-900/60 dark:text-purple-300',
    topBar: 'bg-gradient-to-r from-purple-500 via-violet-400 to-purple-600',
  },
  rose: {
    card: 'border-rose-300/70 bg-gradient-to-br from-rose-50 via-pink-50/60 to-white hover:border-rose-400 dark:border-rose-700/50 dark:from-rose-950/40 dark:via-pink-950/20 dark:to-slate-900',
    iconBox: 'bg-gradient-to-br from-rose-500 to-pink-600 text-white shadow-rose-500/30',
    title: 'text-rose-700 dark:text-rose-400',
    val: 'text-rose-700 dark:text-rose-300',
    tag: 'bg-rose-100 text-rose-700 dark:bg-rose-900/60 dark:text-rose-300',
    topBar: 'bg-gradient-to-r from-rose-500 via-pink-400 to-rose-600',
  },
}

// Hero UI Modern KPI Card Component
function ModernKpiCard({
  tone = 'emerald',
  label,
  value,
  subtext,
  icon: Icon,
  active = false,
  onClick,
}) {
  const palette = MODERN_CARD_TONES[tone] || MODERN_CARD_TONES.emerald
  return (
    <div
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      className={cn(
        'group relative overflow-hidden rounded-2xl border p-4 shadow-sm transition-all duration-200',
        palette.card,
        active && 'ring-2 ring-emerald-500/80 border-emerald-500 shadow-md shadow-emerald-500/10 scale-[1.01]',
        onClick && 'cursor-pointer hover:shadow-md hover:scale-[1.01]'
      )}
    >
      {/* Top Gradient Bar */}
      <div className={cn('absolute top-0 left-0 right-0 h-1.5', palette.topBar)} />

      {/* Ambient Multi-tone Glow */}
      <div className="pointer-events-none absolute -right-6 -top-6 h-20 w-20 rounded-full bg-emerald-500/15 blur-2xl group-hover:bg-emerald-500/25 transition-all" />

      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0 flex-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block truncate">
            {label}
          </span>
          <h3 className={cn('text-2xl font-black mt-1 leading-tight', palette.val)}>
            {value}
          </h3>
          {subtext && (
            <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 mt-0.5 block truncate">
              {subtext}
            </span>
          )}
        </div>
        <div className={cn('flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl shadow-md transition-transform group-hover:scale-105', palette.iconBox)}>
          {Icon && <Icon className="h-6 w-6" />}
        </div>
      </div>
    </div>
  )
}

const CATEGORY_COLORS = {
  amber: 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800',
  blue: 'bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800',
  emerald: 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800',
  purple: 'bg-purple-100 text-purple-800 border-purple-300 dark:bg-purple-950/60 dark:text-purple-300 dark:border-purple-800',
  rose: 'bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800',
}

export default function ExamSchedulePage() {
  const { user } = useAuthStore()
  const { notify } = useToast()
  const queryClient = useQueryClient()

  const userRoles = useMemo(() => {
    if (!user) return []
    const raw = user.roles || (user.role ? [user.role] : []) || user.role_names || []
    const list = Array.isArray(raw) ? raw : [raw]
    return list.map((r) => (typeof r === 'string' ? r : r?.name || r?.role_name || r?.nama || ''))
  }, [user])

  const authLevel = useMemo(() => getUserRoleLevel(user), [user])
  const isSuperAdminOrYayasan = authLevel <= ROLE_LEVELS.YAYASAN // Level 1-2
  const isDivisiPendidikan = useMemo(() => {
    if (isSuperAdminOrYayasan) return false
    return (
      authLevel === ROLE_LEVELS.DIVISI_PENDIDIKAN ||
      hasAnyRole(userRoles, ROLES.DIVISI) ||
      userRoles.some((r) => /divisi|bidang[\s_]*pendidikan|pengawasan[\s_]*akademik/i.test(r))
    )
  }, [authLevel, userRoles, isSuperAdminOrYayasan])

  // Multi-unit supervision: Super Admin, Yayasan, and Divisi Pendidikan
  const canSelectUnit = isSuperAdminOrYayasan || isDivisiPendidikan
  const userUnitId = user?.unit_id || user?.education_unit_id || user?.employee?.unit_id || user?.metadata?.education_unit_id || user?.metadata?.unit_id || ''

  const isKepsek = useMemo(() => {
    if (canSelectUnit) return false
    return authLevel === ROLE_LEVELS.KEPALA_SEKOLAH || userRoles.some((r) => /kepala[\s_]*sekolah|kepsek/i.test(r))
  }, [authLevel, userRoles, canSelectUnit])

  const isGuru = useMemo(() => {
    if (authLevel === ROLE_LEVELS.GURU) return true
    const hasGuru = userRoles.some((r) => /guru|pendidik|pengajar|walas|wali[\s_]*kelas/i.test(r))
    const hasAdminOrKepsek = userRoles.some((r) => /admin|super|kepala[\s_]*sekolah|kepsek|waka|tata[\s_]*usaha|tu|operator|divisi|yayasan/i.test(r))
    return hasGuru && !hasAdminOrKepsek
  }, [authLevel, userRoles])
  const isTu = useMemo(() => authLevel === ROLE_LEVELS.OPERATOR || authLevel === ROLE_LEVELS.TATA_USAHA || userRoles.some(r => /tata[\s_]*usaha|tu|staf[\s_]*tu|admin[\s_]*tu/i.test(r)), [authLevel, userRoles])
  const canManage = useMemo(() => !isGuru && (authLevel <= ROLE_LEVELS.KEPALA_SEKOLAH || isTu), [isGuru, authLevel, isTu])

  // Guru dilarang mengakses halaman master jadwal ujian dan dialihkan ke Portal Guru
  if (isGuru) {
    return <Navigate to="/portal-guru/workspace?tab=jadwal" replace />
  }

  // Segmented Monitoring Pillar Switcher: 'schedules' | 'invigilators' | 'classes' | 'categories'
  const [activeTab, setActiveTab] = useState('schedules')

  // Filter States: Locked for Kepala Sekolah/TU, selectable for Divisi Pendidikan/Yayasan/Super Admin
  const [selectedUnit, setSelectedUnit] = useState(() => (!canSelectUnit && userUnitId ? String(userUnitId) : ''))

  useEffect(() => {
    if (!canSelectUnit && userUnitId && selectedUnit !== String(userUnitId)) {
      setSelectedUnit(String(userUnitId))
    }
  }, [canSelectUnit, userUnitId])
  const [selectedYear, setSelectedYear] = useState('')
  const [selectedSemester, setSelectedSemester] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [selectedInvigilator, setSelectedInvigilator] = useState('')
  const [selectedKelas, setSelectedKelas] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('all') // 'all' | 'ongoing' | 'upcoming' | 'finished' | 'unassigned'
  const [selectedDate, setSelectedDate] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const debouncedSearch = useDebounce(searchInput, 350)
  const [page, setPage] = useState(1)

  // Direct Chat Modal State
  const [activeChatUser, setActiveChatUser] = useState(null)
  const [chatMessage, setChatMessage] = useState('')

  // Form Modal States (Jadwal Ujian)
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false)
  const [editingSchedule, setEditingSchedule] = useState(null)
  const [scheduleForm, setScheduleForm] = useState({
    academic_year_id: '',
    semester_id: '',
    exam_category_id: '',
    kelas_id: '',
    subject_id: '',
    exam_date: '',
    time_start: '07:30',
    time_end: '09:00',
    duration_minutes: 90,
    room: '',
    invigilator_id: '',
    notes: '',
  })
  const [formErrors, setFormErrors] = useState({})

  // Form Modal States (Kategori Ujian)
  const [categoryModalOpen, setCategoryModalOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState(null)
  const [categoryForm, setCategoryForm] = useState({
    name: '',
    code: '',
    color: 'amber',
    description: '',
    is_active: true,
  })

  // Delete Dialog State
  const [deleteDialog, setDeleteDialog] = useState({
    isOpen: false,
    type: '', // 'schedule' | 'category'
    id: null,
    title: '',
  })

  // Hitung durasi otomatis dari time_start dan time_end
  useEffect(() => {
    if (scheduleForm.time_start && scheduleForm.time_end) {
      const [h1, m1] = scheduleForm.time_start.split(':').map(Number)
      const [h2, m2] = scheduleForm.time_end.split(':').map(Number)
      const diff = (h2 * 60 + m2) - (h1 * 60 + m1)
      if (diff > 0) {
        setScheduleForm((prev) => ({ ...prev, duration_minutes: diff }))
      }
    }
  }, [scheduleForm.time_start, scheduleForm.time_end])

  // Query Options
  const { data: optionsData } = useQuery({
    queryKey: ['exam-schedules-options', selectedUnit],
    queryFn: () => examScheduleService.getOptions({ unit_pendidikan_id: selectedUnit }),
  })

  // Set default tahun ajaran dan semester aktif saat optionsData dimuat
  useEffect(() => {
    if (optionsData?.academic_years && !selectedYear) {
      const activeYear = optionsData.academic_years.find((y) => y.is_active) || optionsData.academic_years[0]
      if (activeYear) setSelectedYear(activeYear.id)
    }
    if (optionsData?.semesters && !selectedSemester) {
      const activeSem = optionsData.semesters.find((s) => s.is_active) || optionsData.semesters[0]
      if (activeSem) setSelectedSemester(activeSem.id)
    }
  }, [optionsData, selectedYear, selectedSemester])

  // Query Jadwal Ujian (support invigilator_id dan kelas_id)
  const { data: schedulesData, isLoading: schedulesLoading, refetch: refetchSchedules } = useQuery({
    queryKey: [
      'exam-schedules',
      selectedUnit,
      selectedYear,
      selectedSemester,
      selectedCategory,
      selectedDate,
      selectedInvigilator,
      selectedKelas,
      debouncedSearch,
      page,
    ],
    queryFn: () =>
      examScheduleService.getSchedules({
        unit_pendidikan_id: selectedUnit,
        academic_year_id: selectedYear,
        semester_id: selectedSemester,
        exam_category_id: selectedCategory,
        exam_date: selectedDate,
        invigilator_id: selectedInvigilator === 'unassigned' ? '' : selectedInvigilator,
        kelas_id: selectedKelas,
        search: debouncedSearch,
        page,
        per_page: 50,
      }),
  })

  // Query Kategori Ujian
  const { data: categoriesData, isLoading: categoriesLoading, refetch: refetchCategories } = useQuery({
    queryKey: ['exam-categories'],
    queryFn: examScheduleService.getCategories,
  })

  // Memoized Filter Options for HeroUiFilterSelect
  const unitFilterOptions = useMemo(() => [
    { value: '', label: 'Semua Unit Sekolah' },
    ...(optionsData?.units || []).map((u) => ({ value: String(u.id), label: u.name || u.nama })),
  ], [optionsData?.units])

  const categoryFilterOptions = useMemo(() => [
    { value: '', label: 'Semua Kategori Ujian' },
    ...(categoriesData || []).map((c) => ({ value: String(c.id), label: `${c.name} (${c.code || 'UJIAN'})` })),
  ], [categoriesData])

  const invigilatorFilterOptions = useMemo(() => [
    { value: '', label: 'Semua Pengawas (Guru & Tendik)' },
    { value: 'unassigned', label: '⚠️ Belum Ada Pengawas (Unassigned)' },
    ...(optionsData?.invigilators || []).map((inv) => ({
      value: String(inv.id),
      label: `${inv.nama_lengkap} ${inv.niy ? `(NIY ${inv.niy})` : ''}`,
    })),
  ], [optionsData?.invigilators])

  const kelasFilterOptions = useMemo(() => [
    { value: '', label: 'Semua Rombel / Kelas' },
    ...(optionsData?.classes || []).map((k) => ({
      value: String(k.id),
      label: `${k.nama_kelas} ${k.unitPendidikan?.name ? `(${k.unitPendidikan.name})` : ''}`,
    })),
  ], [optionsData?.classes])

  const statusFilterOptions = [
    { value: 'all', label: 'Semua Status Pelaksanaan' },
    { value: 'ongoing', label: '🟢 Sedang Berlangsung' },
    { value: 'upcoming', label: '🔵 Akan Datang' },
    { value: 'finished', label: '⚪ Sudah Selesai' },
    { value: 'unassigned', label: '⚠️ Belum Ada Pengawas' },
  ]

  // Memoized Options for Form Modals
  const formCategoryOptions = useMemo(() => (categoriesData || []).map((c) => ({
    value: String(c.id),
    label: `${c.name} (${c.code || 'UJIAN'})`,
  })), [categoriesData])

  const formSubjectOptions = useMemo(() => (optionsData?.subjects || []).map((s) => ({
    value: String(s.id),
    label: `${s.name || s.nama_mapel} (${s.code || s.kode_mapel || '-'})`,
  })), [optionsData?.subjects])

  const formKelasOptions = useMemo(() => (optionsData?.classes || []).map((k) => ({
    value: String(k.id),
    label: `${k.nama_kelas} ${k.unitPendidikan?.name ? `(${k.unitPendidikan.name})` : ''}`,
  })), [optionsData?.classes])

  const formInvigilatorOptions = useMemo(() => [
    { value: '', label: '-- Belum Ditentukan (Tanpa Pengawas) --' },
    ...(optionsData?.invigilators || []).map((inv) => ({
      value: String(inv.id),
      label: `${inv.nama_lengkap} ${inv.niy ? `(NIY ${inv.niy})` : ''}`,
    })),
  ], [optionsData?.invigilators])

  const categoryColorOptions = [
    { value: 'emerald', label: 'Emerald (Hijau Zamrud)' },
    { value: 'amber', label: 'Amber (Oranye Keemasan)' },
    { value: 'blue', label: 'Blue (Biru Samudra)' },
    { value: 'purple', label: 'Purple (Ungu Mewah)' },
    { value: 'rose', label: 'Rose (Merah Muda Elegan)' },
  ]

  // Status Helper for Exam Schedule
  const getScheduleStatus = (schedule) => {
    if (!schedule?.exam_date) return { label: 'Terjadwal', color: 'blue' }
    try {
      const now = new Date()
      const todayStr = now.toISOString().split('T')[0]
      const examDateStr = schedule.exam_date.substring(0, 10)

      if (examDateStr < todayStr) {
        return { label: 'Selesai', color: 'slate', isFinished: true }
      }
      if (examDateStr > todayStr) {
        return { label: 'Akan Datang', color: 'blue', isUpcoming: true }
      }
      // Today: check hours
      const [startH, startM] = (schedule.time_start || '00:00').split(':').map(Number)
      const [endH, endM] = (schedule.time_end || '23:59').split(':').map(Number)
      const currentMinutes = now.getHours() * 60 + now.getMinutes()
      const startMinutes = startH * 60 + startM
      const endMinutes = endH * 60 + endM

      if (currentMinutes < startMinutes) {
        return { label: 'Hari Ini (Menunggu)', color: 'amber', isTodayUpcoming: true }
      } else if (currentMinutes >= startMinutes && currentMinutes <= endMinutes) {
        return { label: 'Sedang Berlangsung', color: 'emerald', isOngoing: true }
      } else {
        return { label: 'Selesai Hari Ini', color: 'slate', isFinished: true }
      }
    } catch (e) {
      return { label: 'Terjadwal', color: 'blue' }
    }
  }

  const allSchedules = schedulesData?.data || []

  // Filtered schedules berdasarkan selectedStatus
  const filteredSchedules = useMemo(() => {
    return allSchedules.filter((s) => {
      if (selectedInvigilator === 'unassigned' && s.invigilator_id) return false
      if (selectedStatus === 'unassigned') {
        return !s.invigilator_id && !s.invigilator?.nama_lengkap
      }
      const st = getScheduleStatus(s)
      if (selectedStatus === 'ongoing') return st.isOngoing
      if (selectedStatus === 'upcoming') return st.isUpcoming || st.isTodayUpcoming
      if (selectedStatus === 'finished') return st.isFinished
      return true
    })
  }, [allSchedules, selectedStatus, selectedInvigilator])

  // Unassigned schedules (tanpa pengawas)
  const unassignedSchedules = useMemo(() => {
    return allSchedules.filter((s) => !s.invigilator_id && !s.invigilator?.nama_lengkap)
  }, [allSchedules])

  // Processed Invigilator Groups (Guru & Tendik)
  const invigilatorGroups = useMemo(() => {
    const map = {}
    ;(optionsData?.invigilators || []).forEach((inv) => {
      map[inv.id] = {
        id: inv.id,
        nama_lengkap: inv.nama_lengkap,
        niy: inv.niy,
        unit_id: inv.unit_id,
        sessions: [],
      }
    })

    allSchedules.forEach((sch) => {
      const invId = sch.invigilator_id || sch.invigilator?.id
      if (invId) {
        if (!map[invId]) {
          map[invId] = {
            id: invId,
            nama_lengkap: sch.invigilator?.nama_lengkap || 'Pengawas',
            niy: sch.invigilator?.niy || '',
            sessions: [],
          }
        }
        map[invId].sessions.push(sch)
      }
    })

    return Object.values(map).sort((a, b) => b.sessions.length - a.sessions.length)
  }, [optionsData?.invigilators, allSchedules])

  // Processed Class Groups (Siswa / Rombel Peserta)
  const classGroups = useMemo(() => {
    const map = {}
    ;(optionsData?.classes || []).forEach((k) => {
      map[k.id] = {
        id: k.id,
        nama_kelas: k.nama_kelas,
        unit_name: k.unitPendidikan?.name || '',
        sessions: [],
      }
    })

    allSchedules.forEach((sch) => {
      const kId = sch.kelas_id || sch.kelas?.id
      if (kId) {
        if (!map[kId]) {
          map[kId] = {
            id: kId,
            nama_kelas: sch.kelas?.nama_kelas || 'Kelas',
            unit_name: sch.kelas?.unitPendidikan?.name || '',
            sessions: [],
          }
        }
        map[kId].sessions.push(sch)
      }
    })

    return Object.values(map).sort((a, b) => b.sessions.length - a.sessions.length)
  }, [optionsData?.classes, allSchedules])

  // Mutations
  const saveScheduleMutation = useMutation({
    mutationFn: (payload) =>
      editingSchedule
        ? examScheduleService.updateSchedule(editingSchedule.id, payload)
        : examScheduleService.createSchedule(payload),
    onSuccess: () => {
      notify('Berhasil', editingSchedule ? 'Jadwal ujian berhasil diperbarui.' : 'Jadwal ujian berhasil ditambahkan.', 'success')
      setScheduleModalOpen(false)
      setEditingSchedule(null)
      queryClient.invalidateQueries(['exam-schedules'])
    },
    onError: (err) => {
      const msg = err?.response?.data?.message || err?.message || 'Gagal menyimpan jadwal ujian.'
      notify('Terjadi Kesalahan', msg, 'error')
      if (err?.response?.data?.errors) {
        setFormErrors(err.response.data.errors)
      }
    },
  })

  const saveCategoryMutation = useMutation({
    mutationFn: (payload) =>
      editingCategory
        ? examScheduleService.updateCategory(editingCategory.id, payload)
        : examScheduleService.createCategory(payload),
    onSuccess: () => {
      notify('Berhasil', editingCategory ? 'Kategori ujian berhasil diperbarui.' : 'Kategori ujian berhasil ditambahkan.', 'success')
      setCategoryModalOpen(false)
      setEditingCategory(null)
      queryClient.invalidateQueries(['exam-categories'])
      queryClient.invalidateQueries(['exam-schedules-options'])
    },
    onError: (err) => {
      const msg = err?.response?.data?.message || err?.message || 'Gagal menyimpan kategori ujian.'
      notify('Terjadi Kesalahan', msg, 'error')
    },
  })

  const deleteMutation = useMutation({
    mutationFn: ({ type, id }) =>
      type === 'schedule'
        ? examScheduleService.deleteSchedule(id)
        : examScheduleService.deleteCategory(id),
    onSuccess: () => {
      notify('Dihapus', 'Data berhasil dihapus.', 'success')
      setDeleteDialog({ isOpen: false, type: '', id: null, title: '' })
      queryClient.invalidateQueries(['exam-schedules'])
      queryClient.invalidateQueries(['exam-categories'])
    },
    onError: (err) => {
      const msg = err?.response?.data?.message || err?.message || 'Gagal menghapus data.'
      notify('Gagal Hapus', msg, 'error')
    },
  })

  // Handlers
  const openAddScheduleModal = () => {
    setEditingSchedule(null)
    setScheduleForm({
      academic_year_id: selectedYear || optionsData?.academic_years?.[0]?.id || '',
      semester_id: selectedSemester || optionsData?.semesters?.[0]?.id || '',
      exam_category_id: selectedCategory || optionsData?.categories?.[0]?.id || '',
      kelas_id: optionsData?.classes?.[0]?.id || '',
      subject_id: optionsData?.subjects?.[0]?.id || '',
      exam_date: new Date().toISOString().split('T')[0],
      time_start: '07:30',
      time_end: '09:00',
      duration_minutes: 90,
      room: 'Ruang Kelas',
      invigilator_id: '',
      notes: '',
    })
    setFormErrors({})
    setScheduleModalOpen(true)
  }

  const openEditScheduleModal = (item) => {
    setEditingSchedule(item)
    setScheduleForm({
      academic_year_id: item.academic_year_id || '',
      semester_id: item.semester_id || '',
      exam_category_id: item.exam_category_id || '',
      kelas_id: item.kelas_id || '',
      subject_id: item.subject_id || '',
      exam_date: item.exam_date ? item.exam_date.substring(0, 10) : '',
      time_start: item.time_start ? item.time_start.substring(0, 5) : '07:30',
      time_end: item.time_end ? item.time_end.substring(0, 5) : '09:00',
      duration_minutes: item.duration_minutes || 90,
      room: item.room || '',
      invigilator_id: item.invigilator_id || '',
      notes: item.notes || '',
    })
    setFormErrors({})
    setScheduleModalOpen(true)
  }

  const handleSaveSchedule = (e) => {
    e.preventDefault()
    saveScheduleMutation.mutate(scheduleForm)
  }

  const openAddCategoryModal = () => {
    setEditingCategory(null)
    setCategoryForm({
      name: '',
      code: '',
      color: 'amber',
      description: '',
      is_active: true,
    })
    setCategoryModalOpen(true)
  }

  const openEditCategoryModal = (cat) => {
    setEditingCategory(cat)
    setCategoryForm({
      name: cat.name || '',
      code: cat.code || '',
      color: cat.color || 'amber',
      description: cat.description || '',
      is_active: cat.is_active ?? true,
    })
    setCategoryModalOpen(true)
  }

  const handleSaveCategory = (e) => {
    e.preventDefault()
    saveCategoryMutation.mutate(categoryForm)
  }

  const handlePrintSchedules = () => {
    const list = schedulesData?.data || []
    if (list.length === 0) {
      notify('Peringatan', 'Tidak ada data jadwal ujian untuk dicetak.', 'warning')
      return
    }

    const columns = [
      { header: 'No', accessor: (_, idx) => idx + 1 },
      { header: 'Tanggal', accessor: (row) => row.exam_date ? new Date(row.exam_date).toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' }) : '-' },
      { header: 'Waktu', accessor: (row) => `${row.time_start?.substring(0, 5)} - ${row.time_end?.substring(0, 5)} (${row.duration_minutes}m)` },
      { header: 'Kategori Ujian', accessor: (row) => row.exam_category?.name || '-' },
      { header: 'Kelas / Rombel', accessor: (row) => row.kelas?.nama_kelas || '-' },
      { header: 'Mata Pelajaran', accessor: (row) => row.subject?.name || row.subject?.nama_mapel || '-' },
      { header: 'Ruang', accessor: (row) => row.room || '-' },
      { header: 'Pengawas Ujian', accessor: (row) => row.invigilator?.nama_lengkap || '-' },
    ]

    printCleanTable({
      title: 'JADWAL PELAKSANAAN UJIAN PERIODIK',
      subtitle: `Tahun Ajaran: ${optionsData?.academic_years?.find((y) => y.id === selectedYear)?.name || 'Semua'} • Semester: ${optionsData?.semesters?.find((s) => s.id === selectedSemester)?.name || 'Semua'}`,
      data: list,
      columns,
    })
  }

  const stats = schedulesData?.statistik || {
    total_jadwal: 0,
    total_kelas: 0,
    total_pengawas: 0,
    total_mapel: 0,
  }

  return (
    <PageContainer>
      {/* ── BREADCRUMB ── */}
      <AppBreadcrumb
        items={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Akademik', href: '/dashboard/master/jadwal-pelajaran' },
          { label: 'Jadwal Ujian', href: '/dashboard/jadwal-ujian' },
        ]}
      />

      <div className="space-y-6">
        {/* ── MODERN HERO BANNER CARD ── */}
        <div className="relative overflow-hidden rounded-[22px] border-2 border-emerald-500/30 bg-gradient-to-r from-emerald-500/15 via-teal-500/10 to-emerald-600/15 p-4 sm:p-6 shadow-md shadow-emerald-500/10 dark:border-emerald-600/40 dark:bg-gradient-to-r dark:from-emerald-950/70 dark:via-teal-950/50 dark:to-slate-900">
          <div className="pointer-events-none absolute -top-20 -right-20 h-56 w-56 rounded-full bg-gradient-to-br from-emerald-500/40 via-teal-400/30 to-emerald-600/20 blur-3xl dark:from-emerald-500/50 dark:via-teal-400/40" />
          <div className="pointer-events-none absolute -bottom-20 -left-20 h-56 w-56 rounded-full bg-gradient-to-tr from-emerald-600/30 via-teal-500/20 to-transparent blur-3xl dark:from-emerald-600/40 dark:via-teal-500/30" />

          <div className="relative z-10 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-col sm:flex-row sm:items-start gap-3.5 sm:gap-4 min-w-0 flex-1">
              <div className="flex h-12 w-12 sm:h-14 sm:w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700 text-white shadow-xl shadow-emerald-600/30 border border-emerald-300/40 dark:from-emerald-400 dark:via-emerald-500 dark:to-teal-600">
                <CalendarDays className="h-6 w-6 sm:h-7 sm:w-7 text-white" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-emerald-600 to-teal-600 px-3 py-1 text-xs font-extrabold text-white shadow-sm shadow-emerald-600/25 border border-emerald-300/40 shrink-0">
                    <Sparkles className="h-3.5 w-3.5 text-amber-300" />
                    Pusat Kendali &amp; Supervisi Ujian
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full border border-emerald-300/60 bg-emerald-50/90 px-2.5 py-0.5 text-[11px] font-bold text-emerald-800 dark:border-emerald-700/60 dark:bg-emerald-950/70 dark:text-emerald-300">
                    PTS • PAS • PAT Kenaikan Kelas • Asesmen Terpadu
                  </span>
                </div>
                <h1 className="mt-2 text-lg sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white leading-tight">
                  Jadwal Ujian &amp; Monitoring Pengawas Terpadu
                </h1>
                <p className="mt-1 text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-300 leading-relaxed max-w-3xl">
                  Kelola matriks jadwal ujian periodik, monitoring alokasi pengawas (guru &amp; tendik), supervisi rombel peserta, serta cegah bentrok ruang secara realtime.
                </p>
              </div>
            </div>

            {/* 4-Pillar Segmented Switcher Buttons (Responsive Grid on Mobile -> Inline Flex on Desktop) */}
            <div className="w-full lg:w-auto grid grid-cols-2 sm:grid-cols-4 lg:flex lg:flex-wrap items-center gap-1.5 rounded-2xl border border-emerald-500/25 bg-white/85 p-1.5 shadow-sm dark:border-emerald-800/60 dark:bg-slate-900/85 shrink-0">
              <button
                type="button"
                onClick={() => setActiveTab('schedules')}
                className={cn(
                  'flex items-center justify-center gap-2 rounded-xl px-3 sm:px-3.5 py-2 text-xs font-black transition-all cursor-pointer text-center',
                  activeTab === 'schedules'
                    ? 'bg-gradient-to-r from-emerald-600 to-teal-700 text-white shadow-sm'
                    : 'text-slate-600 hover:text-emerald-700 hover:bg-emerald-50/60 dark:text-slate-300 dark:hover:bg-slate-800'
                )}
              >
                <Calendar className="h-4 w-4 shrink-0" />
                <span className="truncate">Matriks Jadwal</span>
                <span className={cn('px-1.5 py-0.2 rounded-full text-[10px] font-bold shrink-0', activeTab === 'schedules' ? 'bg-white/20 text-white' : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300')}>
                  {stats.total_jadwal}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('invigilators')}
                className={cn(
                  'flex items-center justify-center gap-2 rounded-xl px-3 sm:px-3.5 py-2 text-xs font-black transition-all cursor-pointer text-center',
                  activeTab === 'invigilators'
                    ? 'bg-gradient-to-r from-emerald-600 to-teal-700 text-white shadow-sm'
                    : 'text-slate-600 hover:text-emerald-700 hover:bg-emerald-50/60 dark:text-slate-300 dark:hover:bg-slate-800'
                )}
              >
                <UserCheck className="h-4 w-4 shrink-0" />
                <span className="truncate">Pengawas</span>
                {unassignedSchedules.length > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-rose-500 text-white animate-pulse shrink-0">
                    !
                  </span>
                )}
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('classes')}
                className={cn(
                  'flex items-center justify-center gap-2 rounded-xl px-3 sm:px-3.5 py-2 text-xs font-black transition-all cursor-pointer text-center',
                  activeTab === 'classes'
                    ? 'bg-gradient-to-r from-emerald-600 to-teal-700 text-white shadow-sm'
                    : 'text-slate-600 hover:text-emerald-700 hover:bg-emerald-50/60 dark:text-slate-300 dark:hover:bg-slate-800'
                )}
              >
                <GraduationCap className="h-4 w-4 shrink-0" />
                <span className="truncate">Rombel</span>
                <span className={cn('px-1.5 py-0.2 rounded-full text-[10px] font-bold shrink-0', activeTab === 'classes' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300')}>
                  {stats.total_kelas}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('categories')}
                className={cn(
                  'flex items-center justify-center gap-2 rounded-xl px-3 sm:px-3.5 py-2 text-xs font-black transition-all cursor-pointer text-center',
                  activeTab === 'categories'
                    ? 'bg-gradient-to-r from-emerald-600 to-teal-700 text-white shadow-sm'
                    : 'text-slate-600 hover:text-emerald-700 hover:bg-emerald-50/60 dark:text-slate-300 dark:hover:bg-slate-800'
                )}
              >
                <Tag className="h-4 w-4 shrink-0" />
                <span className="truncate">Kategori</span>
              </button>
            </div>
          </div>
        </div>

        {/* ── 4 MASTER KPI CARDS HERO UI (INTERAKTIF) ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <ModernKpiCard
            tone="emerald"
            label="Total Sesi Ujian"
            value={stats.total_jadwal}
            subtext={`${filteredSchedules.length} Sesi Terfilter`}
            icon={CalendarDays}
            active={activeTab === 'schedules' && selectedStatus === 'all'}
            onClick={() => {
              setActiveTab('schedules')
              setSelectedStatus('all')
            }}
          />

          <ModernKpiCard
            tone="purple"
            label="Pengawas Bertugas (Guru & Tendik)"
            value={stats.total_pengawas}
            subtext={
              unassignedSchedules.length > 0
                ? `⚠️ ${unassignedSchedules.length} Sesi Belum Ada Pengawas`
                : 'Semua Sesi Memiliki Pengawas'
            }
            icon={Users}
            active={activeTab === 'invigilators'}
            onClick={() => setActiveTab('invigilators')}
          />

          <ModernKpiCard
            tone="amber"
            label="Rombel & Santri Peserta"
            value={stats.total_kelas}
            subtext="Kelas / Rombel Terdaftar"
            icon={GraduationCap}
            active={activeTab === 'classes'}
            onClick={() => setActiveTab('classes')}
          />

          <ModernKpiCard
            tone="blue"
            label="Mata Pelajaran Diujikan"
            value={stats.total_mapel}
            subtext="Mata Pelajaran Terjadwal"
            icon={BookOpen}
            active={activeTab === 'schedules' && selectedStatus !== 'all'}
            onClick={() => {
              setActiveTab('schedules')
            }}
          />
        </div>

        {/* ── PILAR 1: MATRIKS JADWAL UJIAN ── */}
        {activeTab === 'schedules' && (
          <div className="relative overflow-hidden rounded-[22px] border-2 border-emerald-300 dark:border-emerald-700/80 bg-white shadow-md shadow-emerald-500/10 dark:bg-[#1B2433]">
            {/* Toolbar Baris 1: Header & Action Buttons */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 sm:p-5 bg-gradient-to-r from-emerald-500/10 via-teal-500/5 to-transparent border-b border-emerald-200/90 dark:border-emerald-800/60">
              <div>
                <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-emerald-600" />
                  <span>Matriks Pelaksanaan Jadwal Ujian</span>
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300">
                    {filteredSchedules.length} dari {stats.total_jadwal} Jadwal
                  </span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Daftar sesi ujian periodik dengan status pelaksanaan realtime, ruang, dan guru/tendik pengawas.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <SquircleActionButton
                  variant="print"
                  icon={Printer}
                  label="Cetak Jadwal Ujian"
                  onClick={handlePrintSchedules}
                />
                {canManage && (
                  <button
                    type="button"
                    onClick={openAddScheduleModal}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 px-4 py-2.5 text-xs font-black text-white shadow-md shadow-emerald-600/30 hover:from-emerald-700 hover:to-teal-800 cursor-pointer transition-all active:scale-95"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Tambah Jadwal Ujian</span>
                  </button>
                )}
              </div>
            </div>

            {/* Toolbar Baris 2: Filter Bar Modern dengan HeroUiFilterSelect */}
            <div className="p-4 bg-gradient-to-r from-emerald-50/50 via-teal-50/30 to-emerald-50/50 border-b border-emerald-200/80 dark:border-emerald-800/60 dark:bg-slate-900/60 flex flex-wrap items-center gap-3">
              {/* Unit Filter: Readonly badge untuk Kepala Sekolah/TU, HeroUiFilterSelect untuk Divisi Pendidikan/Yayasan/Admin */}
              <div className="min-w-[170px] flex-1 sm:flex-none">
                {!canSelectUnit ? (
                  <div className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-200/80 bg-emerald-50/60 px-3 py-2.5 text-xs font-bold text-emerald-800 dark:border-emerald-800/50 dark:bg-emerald-950/40 dark:text-emerald-300 shrink-0" title={isKepsek ? 'Unit Pendidikan Kepala Sekolah' : (isTu ? 'Unit Kerja Tata Usaha' : 'Unit Sekolah Anda')}>
                    <ShieldCheck className="size-3.5 text-emerald-600 dark:text-emerald-400" />
                    <span>
                      {optionsData?.units?.find((u) => String(u.id) === String(selectedUnit))?.name ||
                        (isKepsek ? 'Unit Sekolah Anda' : (isTu ? 'Unit Kerja TU' : 'Unit Terkunci'))}
                    </span>
                  </div>
                ) : (
                  <HeroUiFilterSelect
                    ariaLabel="Unit Sekolah"
                    value={selectedUnit}
                    onChange={(val) => {
                      setSelectedUnit(val)
                      setPage(1)
                    }}
                    options={unitFilterOptions}
                    placeholder="Semua Unit"
                    icon={Building2}
                    searchable
                    className="w-full"
                    size="md"
                  />
                )}
              </div>

              {/* Kategori Ujian Filter */}
              <div className="min-w-[180px] flex-1 sm:flex-none">
                <HeroUiFilterSelect
                  ariaLabel="Kategori Ujian"
                  value={selectedCategory}
                  onChange={(val) => {
                    setSelectedCategory(val)
                    setPage(1)
                  }}
                  options={categoryFilterOptions}
                  placeholder="Semua Kategori"
                  icon={Tag}
                  searchable
                  className="w-full"
                  size="md"
                />
              </div>

              {/* Pengawas (Guru & Tendik) Filter */}
              <div className="min-w-[210px] flex-1 sm:flex-none">
                <HeroUiFilterSelect
                  ariaLabel="Pengawas (Guru & Tendik)"
                  value={selectedInvigilator}
                  onChange={(val) => {
                    setSelectedInvigilator(val)
                    setPage(1)
                  }}
                  options={invigilatorFilterOptions}
                  placeholder="Semua Pengawas"
                  icon={UserCheck}
                  searchable
                  className="w-full"
                  size="md"
                />
              </div>

              {/* Kelas / Rombel Filter */}
              <div className="min-w-[170px] flex-1 sm:flex-none">
                <HeroUiFilterSelect
                  ariaLabel="Kelas / Rombel"
                  value={selectedKelas}
                  onChange={(val) => {
                    setSelectedKelas(val)
                    setPage(1)
                  }}
                  options={kelasFilterOptions}
                  placeholder="Semua Rombel"
                  icon={GraduationCap}
                  searchable
                  className="w-full"
                  size="md"
                />
              </div>

              {/* Status Pelaksanaan Filter */}
              <div className="min-w-[180px] flex-1 sm:flex-none">
                <HeroUiFilterSelect
                  ariaLabel="Status Pelaksanaan"
                  value={selectedStatus}
                  onChange={(val) => {
                    setSelectedStatus(val)
                    setPage(1)
                  }}
                  options={statusFilterOptions}
                  placeholder="Status Pelaksanaan"
                  icon={Clock}
                  className="w-full"
                  size="md"
                />
              </div>

              {/* Tanggal Filter */}
              <div className="w-auto">
                <DatePicker
                  value={selectedDate}
                  onChange={(e) => {
                    setSelectedDate(e.target.value)
                    setPage(1)
                  }}
                  className="w-40"
                  inputClassName="h-10 text-xs font-bold font-mono"
                  placeholder="Pilih Tanggal..."
                />
              </div>

              {/* Search Input */}
              <div className="relative min-w-[200px] flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  value={searchInput}
                  onChange={(e) => {
                    setSearchInput(e.target.value)
                    setPage(1)
                  }}
                  placeholder="Cari mapel, kelas, pengawas, ruang..."
                  className="h-10 w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 text-xs font-medium outline-none focus:border-emerald-700 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                />
              </div>

              {(selectedUnit || selectedCategory || selectedInvigilator || selectedKelas || selectedStatus !== 'all' || selectedDate || searchInput) && (
                <button
                  type="button"
                  onClick={() => {
                    setSelectedUnit(!canSelectUnit && userUnitId ? String(userUnitId) : '')
                    setSelectedCategory('')
                    setSelectedInvigilator('')
                    setSelectedKelas('')
                    setSelectedStatus('all')
                    setSelectedDate('')
                    setSearchInput('')
                    setPage(1)
                  }}
                  className="h-10 px-3 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800 transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                  <span>Reset Filter</span>
                </button>
              )}
            </div>

            {/* Datatable */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-gradient-to-r from-emerald-100/90 via-teal-50/70 to-emerald-100/90 border-b-2 border-emerald-200/90 dark:from-emerald-950/90 dark:via-teal-950/70 dark:to-emerald-950/90 text-slate-800 dark:text-slate-100">
                    <th className="py-3.5 px-4 font-black">No</th>
                    <th className="py-3.5 px-4 font-black">Tanggal &amp; Waktu</th>
                    <th className="py-3.5 px-4 font-black">Kategori Ujian</th>
                    <th className="py-3.5 px-4 font-black">Mata Pelajaran</th>
                    <th className="py-3.5 px-4 font-black">Kelas / Rombel</th>
                    <th className="py-3.5 px-4 font-black">Ruang &amp; Pengawas</th>
                    <th className="py-3.5 px-4 font-black text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-emerald-100/80 dark:divide-emerald-900/40 font-medium">
                  {schedulesLoading ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-slate-500">
                        <RefreshCw className="h-6 w-6 animate-spin mx-auto text-emerald-600 mb-2" />
                        <span>Memuat jadwal ujian...</span>
                      </td>
                    </tr>
                  ) : filteredSchedules.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-slate-500">
                        <CalendarDays className="h-10 w-10 text-slate-300 dark:text-slate-700 mx-auto mb-2" />
                        <span className="block font-bold text-slate-700 dark:text-slate-300">Belum Ada Jadwal Ujian Sesuai Filter</span>
                        <span className="text-xs text-slate-400">Silakan ubah filter atau tambahkan jadwal baru.</span>
                      </td>
                    </tr>
                  ) : (
                    filteredSchedules.map((row, idx) => {
                      const colorClass = CATEGORY_COLORS[row.exam_category?.color] || CATEGORY_COLORS.amber
                      const status = getScheduleStatus(row)
                      const hasInvigilator = Boolean(row.invigilator?.nama_lengkap || row.invigilator_id)

                      return (
                        <tr key={row.id} className="hover:bg-emerald-50/40 dark:hover:bg-slate-800/40 transition-colors">
                          <td className="py-3 px-4 font-bold text-slate-500">
                            {(page - 1) * 15 + idx + 1}
                          </td>
                          <td className="py-3 px-4">
                            <span className="font-bold text-slate-900 dark:text-white block">
                              {row.exam_date
                                ? new Date(row.exam_date).toLocaleDateString('id-ID', {
                                    weekday: 'long',
                                    day: 'numeric',
                                    month: 'short',
                                    year: 'numeric',
                                  })
                                : '-'}
                            </span>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <span className="inline-flex items-center gap-1 font-mono text-[11px] font-bold text-emerald-700 dark:text-emerald-400">
                                <Clock className="h-3 w-3" />
                                {row.time_start?.substring(0, 5)} - {row.time_end?.substring(0, 5)} ({row.duration_minutes}m)
                              </span>
                              {/* Status Badge */}
                              {status.isOngoing && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.2 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300">
                                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-600 animate-ping" />
                                  Berlangsung
                                </span>
                              )}
                              {status.isTodayUpcoming && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.2 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-300">
                                  Hari Ini
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <span className={cn('inline-block px-2.5 py-1 rounded-lg text-[10px] font-black border uppercase tracking-wider', colorClass)}>
                              {row.exam_category?.name || 'Ujian'}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <span className="font-extrabold text-slate-900 dark:text-white block text-sm">
                              {row.subject?.name || row.subject?.nama_mapel || '-'}
                            </span>
                            <span className="text-[11px] text-slate-500 font-mono">
                              Kode: {row.subject?.code || row.subject?.kode_mapel || '-'}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <span className="font-bold text-slate-800 dark:text-slate-100 block">
                              {row.kelas?.nama_kelas || '-'}
                            </span>
                            <span className="text-[10px] text-slate-500">
                              {row.kelas?.unitPendidikan?.name || ''}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <span className="font-bold text-slate-800 dark:text-slate-200 block flex items-center gap-1">
                              <DoorOpen className="h-3.5 w-3.5 text-emerald-600" />
                              {row.room || 'Ruang Standar'}
                            </span>
                            {hasInvigilator ? (
                              <div className="flex items-center gap-1.5 mt-0.5">
                                <span className="text-[11px] text-emerald-700 dark:text-emerald-400 font-bold flex items-center gap-1">
                                  <UserCheck className="h-3 w-3 text-emerald-600" />
                                  {row.invigilator?.nama_lengkap}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => setActiveChatUser(row.invigilator)}
                                  className="p-0.5 text-slate-400 hover:text-emerald-700 transition-colors cursor-pointer"
                                  title="Kirim pesan koordinasi"
                                >
                                  <MessageSquare className="h-3 w-3" />
                                </button>
                                <a
                                  href={`https://wa.me/?text=${encodeURIComponent(`Assalamu'alaikum, mengingatkan jadwal pengawasan ujian: ${row.subject?.name || ''} di ${row.room || ''} jam ${row.time_start?.substring(0, 5)}.`)}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="p-0.5 text-slate-400 hover:text-emerald-600 transition-colors"
                                  title="Chat WhatsApp"
                                >
                                  <Phone className="h-3 w-3" />
                                </a>
                              </div>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800 mt-0.5">
                                <AlertTriangle className="h-3 w-3" />
                                ⚠️ Belum Ada Pengawas
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-4 text-center">
                            {canManage ? (
                              <div className="flex items-center justify-center gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => openEditScheduleModal(row)}
                                  className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-300 dark:border-slate-700 dark:text-slate-300 transition-all cursor-pointer"
                                  title="Edit Jadwal"
                                >
                                  <Pencil className="h-3.5 w-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() =>
                                    setDeleteDialog({
                                      isOpen: true,
                                      type: 'schedule',
                                      id: row.id,
                                      title: `Hapus Jadwal Ujian ${row.subject?.name || ''} (${row.kelas?.nama_kelas || ''})?`,
                                    })
                                  }
                                  className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-rose-50 hover:text-rose-700 hover:border-rose-300 dark:border-slate-700 dark:text-slate-300 transition-all cursor-pointer"
                                  title="Hapus Jadwal"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            ) : (
                              <span className="text-[11px] text-slate-400 font-medium">Read Only</span>
                            )}
                          </td>
                        </tr>
                      )
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination & Count Footer */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-slate-50/70 border-t border-emerald-100 dark:bg-slate-900/60 dark:border-emerald-900/40 text-xs text-slate-500">
              <span>
                Menampilkan <strong>{filteredSchedules.length}</strong> dari total <strong>{stats.total_jadwal}</strong> jadwal ujian.
              </span>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-semibold text-slate-400">
                  Unit: {optionsData?.units?.find(u => String(u.id) === selectedUnit)?.name || 'Semua Unit'}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* ── PILAR 2: MONITORING PENGAWAS (GURU & TENDIK) ── */}
        {activeTab === 'invigilators' && (
          <div className="space-y-4">
            {/* Warning Alert Banner jika ada sesi tanpa pengawas */}
            {unassignedSchedules.length > 0 && (
              <div className="rounded-2xl border-2 border-rose-300 bg-rose-50/90 p-4 dark:border-rose-800 dark:bg-rose-950/40 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rose-600 text-white shadow-md shadow-rose-600/30">
                    <ShieldAlert className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-rose-900 dark:text-rose-200">
                      Perhatian: {unassignedSchedules.length} Sesi Ujian Belum Memiliki Pengawas!
                    </h4>
                    <p className="text-[11px] font-medium text-rose-700 dark:text-rose-300">
                      Segera alokasikan guru atau tendik piket sebagai pengawas ruang untuk kelancaran asesmen.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedStatus('unassigned')
                    setActiveTab('schedules')
                  }}
                  className="shrink-0 inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-black shadow-sm transition-all cursor-pointer"
                >
                  <span>Lihat Sesi Tanpa Pengawas</span>
                  <ChevronRight className="h-3.5 w-3.5" />
                </button>
              </div>
            )}

            {/* Grid Pengawas (Guru & Tendik) */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {invigilatorGroups.length === 0 ? (
                <div className="col-span-full py-12 text-center text-slate-500 bg-white rounded-2xl border border-slate-200 dark:bg-slate-900 dark:border-slate-800">
                  <Users className="h-10 w-10 text-slate-300 mx-auto mb-2" />
                  <span className="block font-bold">Tidak ada data pegawai / pengawas</span>
                </div>
              ) : (
                invigilatorGroups.map((inv) => {
                  const hasSessions = inv.sessions.length > 0
                  const isOngoingNow = inv.sessions.some(s => getScheduleStatus(s).isOngoing)

                  return (
                    <div
                      key={inv.id}
                      className={cn(
                        'rounded-2xl border p-4.5 bg-white dark:bg-slate-900 shadow-xs flex flex-col justify-between transition-all hover:shadow-md',
                        isOngoingNow
                          ? 'border-emerald-500/80 ring-2 ring-emerald-500/20'
                          : hasSessions
                          ? 'border-slate-200 dark:border-slate-800'
                          : 'border-slate-200/60 dark:border-slate-800/60 opacity-80'
                      )}
                    >
                      <div>
                        {/* Header Personel */}
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 via-teal-600 to-emerald-700 text-white font-black text-sm shadow-md shadow-emerald-600/30">
                              {inv.nama_lengkap.substring(0, 2).toUpperCase()}
                            </div>
                            <div className="min-w-0">
                              <h4 className="text-sm font-black text-slate-900 dark:text-white truncate">
                                {inv.nama_lengkap}
                              </h4>
                              <span className="text-[11px] font-mono font-medium text-slate-500 dark:text-slate-400 block truncate">
                                {inv.niy ? `NIY: ${inv.niy}` : 'Staf Pegawai'}
                              </span>
                            </div>
                          </div>

                          {/* Status Pill */}
                          {isOngoingNow ? (
                            <span className="shrink-0 inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300">
                              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping" />
                              Sedang Mengawas
                            </span>
                          ) : hasSessions ? (
                            <span className="shrink-0 inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 border border-purple-300">
                              {inv.sessions.length} Sesi
                            </span>
                          ) : (
                            <span className="shrink-0 inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                              Bebas Tugas
                            </span>
                          )}
                        </div>

                        {/* List Sesi Ujian Personel */}
                        <div className="mt-4 space-y-2">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                            Jadwal Pengawasan:
                          </span>
                          {inv.sessions.length === 0 ? (
                            <p className="text-xs text-slate-400 italic">
                              Belum memiliki penugasan jadwal pengawasan.
                            </p>
                          ) : (
                            inv.sessions.slice(0, 3).map((sess) => {
                              const st = getScheduleStatus(sess)
                              return (
                                <div
                                  key={sess.id}
                                  className="rounded-xl border border-slate-100 bg-slate-50/70 p-2.5 dark:border-slate-800 dark:bg-slate-800/50 text-[11px]"
                                >
                                  <div className="flex items-center justify-between font-bold text-slate-800 dark:text-slate-200">
                                    <span className="truncate">{sess.subject?.name || sess.subject?.nama_mapel}</span>
                                    <span className="font-mono text-emerald-700 dark:text-emerald-400 shrink-0">
                                      {sess.time_start?.substring(0, 5)} - {sess.time_end?.substring(0, 5)}
                                    </span>
                                  </div>
                                  <div className="flex items-center justify-between text-slate-500 mt-1">
                                    <span>{sess.kelas?.nama_kelas} • {sess.room || 'Ruang Standar'}</span>
                                    {st.isOngoing && (
                                      <span className="text-[9px] font-bold text-emerald-600 uppercase">Live</span>
                                    )}
                                  </div>
                                </div>
                              )
                            })
                          )}
                          {inv.sessions.length > 3 && (
                            <span className="text-[10px] font-semibold text-slate-400 block text-center">
                              +{inv.sessions.length - 3} sesi lainnya
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Footer Actions */}
                      <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                        <button
                          type="button"
                          onClick={() => setActiveChatUser(inv)}
                          className="flex-1 inline-flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-xl border border-emerald-200 bg-emerald-50/50 hover:bg-emerald-100 text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 text-xs font-bold transition-all cursor-pointer"
                        >
                          <MessageSquare className="h-3.5 w-3.5" />
                          <span>Direct Chat</span>
                        </button>
                        <a
                          href={`https://wa.me/?text=${encodeURIComponent(`Assalamu'alaikum ${inv.nama_lengkap}, koordinasi terkait pengawasan ujian periodik sekolah.`)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center justify-center p-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 transition-all"
                          title="WhatsApp"
                        >
                          <Phone className="h-3.5 w-3.5" />
                        </a>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </div>
        )}

        {/* ── PILAR 3: MONITORING ROMBEL PESERTA (SISWA) ── */}
        {activeTab === 'classes' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {classGroups.length === 0 ? (
                <div className="col-span-full py-12 text-center text-slate-500 bg-white rounded-2xl border border-slate-200 dark:bg-slate-900 dark:border-slate-800">
                  <GraduationCap className="h-10 w-10 text-slate-300 mx-auto mb-2" />
                  <span className="block font-bold">Tidak ada rombel kelas yang terdaftar</span>
                </div>
              ) : (
                classGroups.map((cls) => (
                  <div
                    key={cls.id}
                    className="rounded-2xl border border-slate-200 bg-white p-4.5 dark:border-slate-800 dark:bg-slate-900 shadow-xs flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2.5">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500 text-white shadow-md shadow-amber-500/30">
                            <GraduationCap className="h-5 w-5" />
                          </div>
                          <div>
                            <h4 className="text-sm font-black text-slate-900 dark:text-white">
                              {cls.nama_kelas}
                            </h4>
                            <span className="text-[10px] font-semibold text-slate-500">
                              {cls.unit_name || 'Unit Sekolah'}
                            </span>
                          </div>
                        </div>
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-300">
                          {cls.sessions.length} Mapel
                        </span>
                      </div>

                      {/* Timeline Sesi Rombel */}
                      <div className="mt-4 space-y-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                          Agenda Ujian Rombel:
                        </span>
                        {cls.sessions.length === 0 ? (
                          <p className="text-xs text-slate-400 italic">
                            Belum ada jadwal ujian untuk kelas ini.
                          </p>
                        ) : (
                          cls.sessions.slice(0, 4).map((sess) => (
                            <div
                              key={sess.id}
                              className="rounded-xl border border-slate-100 bg-slate-50/70 p-2.5 dark:border-slate-800 dark:bg-slate-800/50 text-[11px]"
                            >
                              <div className="flex items-center justify-between font-bold text-slate-800 dark:text-slate-200">
                                <span>{sess.subject?.name || sess.subject?.nama_mapel}</span>
                                <span className="font-mono text-emerald-700 dark:text-emerald-400">
                                  {sess.time_start?.substring(0, 5)} - {sess.time_end?.substring(0, 5)}
                                </span>
                              </div>
                              <div className="flex items-center justify-between text-slate-500 mt-1">
                                <span>Ruang: {sess.room || 'Kelas'}</span>
                                <span className="font-medium">
                                  {sess.invigilator?.nama_lengkap ? `Pengawas: ${sess.invigilator.nama_lengkap}` : '⚠️ Tanpa Pengawas'}
                                </span>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedKelas(String(cls.id))
                          setActiveTab('schedules')
                        }}
                        className="w-full py-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-300 text-slate-700 text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        <span>Lihat Semua Jadwal Kelas</span>
                        <ChevronRight className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* ── PILAR 4: PENGATURAN KATEGORI UJIAN (DINAMIS) ── */}
        {activeTab === 'categories' && (
          <div className="relative overflow-hidden rounded-[22px] border-2 border-emerald-300 dark:border-emerald-700/80 bg-white shadow-md shadow-emerald-500/10 dark:bg-[#1B2433]">
            {/* Header Kategori */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 sm:p-5 bg-gradient-to-r from-emerald-500/10 via-teal-500/5 to-transparent border-b border-emerald-200/90 dark:border-emerald-800/60">
              <div>
                <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <Tag className="h-5 w-5 text-emerald-600" />
                  <span>Kategori &amp; Jenis Evaluasi Ujian</span>
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300">
                    {categoriesData?.length || 0} Kategori
                  </span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Tambahkan dan kelola kategori ujian secara bebas (UTS, PAS, PAT Kenaikan Kelas, dsb).
                </p>
              </div>

              {canManage && (
                <button
                  type="button"
                  onClick={openAddCategoryModal}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 px-4 py-2.5 text-xs font-black text-white shadow-md shadow-emerald-600/30 hover:from-emerald-700 hover:to-teal-800 cursor-pointer transition-all active:scale-95"
                >
                  <Plus className="h-4 w-4" />
                  <span>Tambah Kategori Ujian</span>
                </button>
              )}
            </div>

            {/* Grid List Kategori */}
            <div className="p-4 sm:p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {categoriesLoading ? (
                <div className="col-span-full py-12 text-center text-slate-500">
                  <RefreshCw className="h-6 w-6 animate-spin mx-auto text-emerald-600 mb-2" />
                  <span>Memuat kategori ujian...</span>
                </div>
              ) : (categoriesData || []).map((cat) => {
                const colorClass = CATEGORY_COLORS[cat.color] || CATEGORY_COLORS.amber
                return (
                  <div
                    key={cat.id}
                    className="rounded-2xl border border-slate-200 bg-white p-4.5 dark:border-slate-800 dark:bg-slate-900 shadow-xs space-y-3 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2">
                        <span className={cn('px-2.5 py-1 rounded-lg text-[10px] font-black border uppercase tracking-wider', colorClass)}>
                          {cat.code || 'UJIAN'}
                        </span>
                        {canManage && (
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => openEditCategoryModal(cat)}
                              className="p-1 rounded-md text-slate-400 hover:text-emerald-700 hover:bg-emerald-50 transition-colors"
                            >
                              <Pencil className="h-3.5 w-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                setDeleteDialog({
                                  isOpen: true,
                                  type: 'category',
                                  id: cat.id,
                                  title: `Hapus Kategori ${cat.name}?`,
                                })
                              }
                              className="p-1 rounded-md text-slate-400 hover:text-rose-700 hover:bg-rose-50 transition-colors"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        )}
                      </div>

                      <h4 className="text-sm font-black text-slate-900 dark:text-white mt-2">
                        {cat.name}
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                        {cat.description || 'Tidak ada deskripsi tambahan.'}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500">
                      <span>Total Terjadwal:</span>
                      <strong className="text-emerald-700 dark:text-emerald-400 font-bold">
                        {cat.exam_schedules_count || 0} Sesi
                      </strong>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>

      {/* ── MODAL FORM JADWAL UJIAN ── */}
      <MasterFormModal
        isOpen={scheduleModalOpen}
        onClose={() => setScheduleModalOpen(false)}
        icon={CalendarDays}
        title={editingSchedule ? 'Edit Jadwal Ujian' : 'Tambah Jadwal Ujian Baru'}
        description="Tentukan tanggal, alokasi jam mandiri, mapel, rombel kelas, serta pengawas ujian."
        maxWidth="max-w-3xl"
        footer={
          <div className="flex items-center justify-end gap-2 w-full">
            <button
              type="button"
              onClick={() => setScheduleModalOpen(false)}
              className="h-11 rounded-xl border border-slate-200 bg-slate-100 px-4 text-xs font-bold text-slate-700 hover:bg-slate-200 transition-all cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              form="exam-schedule-form"
              disabled={saveScheduleMutation.isPending}
              className="h-11 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 px-5 text-xs font-bold text-white shadow-md shadow-emerald-600/30 hover:from-emerald-700 transition-all cursor-pointer disabled:opacity-50"
            >
              {saveScheduleMutation.isPending ? 'Menyimpan...' : 'Simpan Jadwal Ujian'}
            </button>
          </div>
        }
      >
        <form id="exam-schedule-form" onSubmit={handleSaveSchedule} className="space-y-4 text-xs font-semibold">
          {/* Baris 1: Kategori Ujian & Tanggal Ujian */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="mb-1.5 flex items-center gap-1.5 text-xs font-bold text-slate-800 dark:text-slate-100">
                <Tag className="h-3.5 w-3.5 text-emerald-600" />
                <span>Kategori Ujian *</span>
              </label>
              <HeroUiFilterSelect
                ariaLabel="Kategori Ujian"
                value={scheduleForm.exam_category_id}
                onChange={(val) => setScheduleForm({ ...scheduleForm, exam_category_id: val })}
                options={formCategoryOptions}
                placeholder="Pilih Kategori Ujian"
                icon={Tag}
                searchable
                className="w-full"
                size="md"
              />
            </div>

            <div>
              <label className="mb-1.5 flex items-center gap-1.5 text-xs font-bold text-slate-800 dark:text-slate-100">
                <Calendar className="h-3.5 w-3.5 text-emerald-600" />
                <span>Tanggal Pelaksanaan *</span>
              </label>
              <DatePicker
                required
                value={scheduleForm.exam_date}
                onChange={(e) => setScheduleForm({ ...scheduleForm, exam_date: e.target.value })}
                inputClassName="h-11 font-mono"
              />
            </div>
          </div>

          {/* Baris 2: Waktu Mulai, Selesai, & Durasi Menit */}
          <div className="rounded-2xl border border-emerald-500/20 bg-emerald-50/30 p-4 dark:border-emerald-800/40 dark:bg-emerald-950/20 space-y-3">
            <h4 className="text-xs font-black uppercase tracking-wider text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
              <Clock className="h-4 w-4 text-emerald-600" />
              <span>Pengaturan Waktu &amp; Jam Pelaksanaan Ujian</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="mb-1 block text-xs font-bold text-slate-700 dark:text-slate-200">
                  Jam Mulai (HH:mm) *
                </label>
                <input
                  required
                  type="time"
                  value={scheduleForm.time_start}
                  onChange={(e) => setScheduleForm({ ...scheduleForm, time_start: e.target.value })}
                  className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 font-mono outline-none focus:border-emerald-700 dark:border-slate-700 dark:bg-slate-900"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-bold text-slate-700 dark:text-slate-200">
                  Jam Selesai (HH:mm) *
                </label>
                <input
                  required
                  type="time"
                  value={scheduleForm.time_end}
                  onChange={(e) => setScheduleForm({ ...scheduleForm, time_end: e.target.value })}
                  className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 font-mono outline-none focus:border-emerald-700 dark:border-slate-700 dark:bg-slate-900"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-bold text-slate-700 dark:text-slate-200">
                  Durasi Ujian (Menit)
                </label>
                <div className="h-11 rounded-xl border border-emerald-300 bg-white px-3.5 flex items-center font-mono font-bold text-emerald-800 dark:border-emerald-800 dark:bg-slate-900 dark:text-emerald-300">
                  {scheduleForm.duration_minutes} Menit
                </div>
              </div>
            </div>
          </div>

          {/* Baris 3: Mata Pelajaran & Kelas / Rombel */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="mb-1.5 flex items-center gap-1.5 text-xs font-bold text-slate-800 dark:text-slate-100">
                <BookOpen className="h-3.5 w-3.5 text-emerald-600" />
                <span>Mata Pelajaran yang Diujikan *</span>
              </label>
              <HeroUiFilterSelect
                ariaLabel="Mata Pelajaran yang Diujikan"
                value={scheduleForm.subject_id}
                onChange={(val) => setScheduleForm({ ...scheduleForm, subject_id: val })}
                options={formSubjectOptions}
                placeholder="Pilih Mata Pelajaran"
                icon={BookOpen}
                searchable
                className="w-full"
                size="md"
              />
            </div>

            <div>
              <label className="mb-1.5 flex items-center gap-1.5 text-xs font-bold text-slate-800 dark:text-slate-100">
                <GraduationCap className="h-3.5 w-3.5 text-emerald-600" />
                <span>Kelas / Rombel Peserta *</span>
              </label>
              <HeroUiFilterSelect
                ariaLabel="Kelas / Rombel Peserta"
                value={scheduleForm.kelas_id}
                onChange={(val) => setScheduleForm({ ...scheduleForm, kelas_id: val })}
                options={formKelasOptions}
                placeholder="Pilih Kelas / Rombel"
                icon={GraduationCap}
                searchable
                className="w-full"
                size="md"
              />
            </div>
          </div>

          {/* Baris 4: Ruang Ujian & Guru/Tendik Pengawas */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="mb-1.5 flex items-center gap-1.5 text-xs font-bold text-slate-800 dark:text-slate-100">
                <DoorOpen className="h-3.5 w-3.5 text-emerald-600" />
                <span>Ruang Ujian</span>
              </label>
              <input
                type="text"
                value={scheduleForm.room}
                onChange={(e) => setScheduleForm({ ...scheduleForm, room: e.target.value })}
                placeholder="Contoh: Lab Komputer 1 / Ruang 10-A"
                className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 outline-none focus:border-emerald-700 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="mb-1.5 flex items-center gap-1.5 text-xs font-bold text-slate-800 dark:text-slate-100">
                <Users className="h-3.5 w-3.5 text-emerald-600" />
                <span>Guru / Tendik Pengawas Ujian</span>
              </label>
              <HeroUiFilterSelect
                ariaLabel="Pengawas Ujian"
                value={scheduleForm.invigilator_id}
                onChange={(val) => setScheduleForm({ ...scheduleForm, invigilator_id: val })}
                options={formInvigilatorOptions}
                placeholder="Pilih Guru/Tendik Pengawas"
                icon={UserCheck}
                searchable
                className="w-full"
                size="md"
              />
            </div>
          </div>

          {/* Catatan Tambahan */}
          <div>
            <label className="mb-1.5 block text-xs font-bold text-slate-800 dark:text-slate-100">
              Catatan Khusus (Petunjuk Peserta / Pengawas)
            </label>
            <input
              type="text"
              value={scheduleForm.notes}
              onChange={(e) => setScheduleForm({ ...scheduleForm, notes: e.target.value })}
              placeholder="Contoh: Membawa pensil 2B, kalkulator dilarang..."
              className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 outline-none focus:border-emerald-700 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
            />
          </div>
        </form>
      </MasterFormModal>

      {/* ── MODAL FORM KATEGORI UJIAN (DINAMIS) ── */}
      <MasterFormModal
        isOpen={categoryModalOpen}
        onClose={() => setCategoryModalOpen(false)}
        icon={Tag}
        title={editingCategory ? 'Edit Kategori Ujian' : 'Tambah Kategori Ujian Baru'}
        description="Kelola kategori evaluasi seperti PTS, PAS, PAT Kenaikan Kelas, dan Ujian Praktik."
        maxWidth="max-w-xl"
        footer={
          <div className="flex items-center justify-end gap-2 w-full">
            <button
              type="button"
              onClick={() => setCategoryModalOpen(false)}
              className="h-11 rounded-xl border border-slate-200 bg-slate-100 px-4 text-xs font-bold text-slate-700 hover:bg-slate-200 transition-all cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              form="exam-category-form"
              disabled={saveCategoryMutation.isPending}
              className="h-11 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 px-5 text-xs font-bold text-white shadow-md shadow-emerald-600/30 hover:from-emerald-700 transition-all cursor-pointer disabled:opacity-50"
            >
              {saveCategoryMutation.isPending ? 'Menyimpan...' : 'Simpan Kategori'}
            </button>
          </div>
        }
      >
        <form id="exam-category-form" onSubmit={handleSaveCategory} className="space-y-4 text-xs font-semibold">
          <div>
            <label className="mb-1.5 block text-xs font-bold text-slate-800 dark:text-slate-100">
              Nama Kategori Ujian *
            </label>
            <input
              required
              type="text"
              value={categoryForm.name}
              onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
              placeholder="Contoh: Penilaian Akhir Tahun (PAT Kenaikan Kelas)"
              className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 outline-none focus:border-emerald-700 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1.5 block text-xs font-bold text-slate-800 dark:text-slate-100">
                Kode Singkatan (Label)
              </label>
              <input
                type="text"
                value={categoryForm.code}
                onChange={(e) => setCategoryForm({ ...categoryForm, code: e.target.value })}
                placeholder="Contoh: PAT / PTS"
                className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 uppercase font-mono outline-none focus:border-emerald-700 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="mb-1.5 flex items-center gap-1.5 text-xs font-bold text-slate-800 dark:text-slate-100">
                <Palette className="h-3.5 w-3.5 text-emerald-600" />
                <span>Warna Lencana Badge</span>
              </label>
              <HeroUiFilterSelect
                ariaLabel="Warna Lencana Badge"
                value={categoryForm.color}
                onChange={(val) => setCategoryForm({ ...categoryForm, color: val })}
                options={categoryColorOptions}
                placeholder="Pilih Warna"
                icon={Palette}
                className="w-full"
                size="md"
              />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-bold text-slate-800 dark:text-slate-100">
              Keterangan / Deskripsi
            </label>
            <textarea
              rows={3}
              value={categoryForm.description}
              onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
              placeholder="Deskripsi tujuan atau ketentuan kategori ujian..."
              className="w-full rounded-xl border border-slate-200 bg-white p-3.5 outline-none focus:border-emerald-700 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
            />
          </div>
        </form>
      </MasterFormModal>

      {/* ── DIALOG KONFIRMASI HAPUS ── */}
      <MasterDeleteDialog
        isOpen={deleteDialog.isOpen}
        onClose={() => setDeleteDialog({ isOpen: false, type: '', id: null, title: '' })}
        onConfirm={() => deleteMutation.mutate({ type: deleteDialog.type, id: deleteDialog.id })}
        title={deleteDialog.title}
        description="Data yang dihapus akan dipindahkan ke tempat sampah dan tidak akan tampil di jadwal aktif."
        isLoading={deleteMutation.isPending}
      />

      {/* ── DIRECT CHAT / KOORDINASI PENGAWAS MODAL ── */}
      <AnimatePresence>
        {activeChatUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setActiveChatUser(null)}
              className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 10 }}
              className="relative w-full max-w-lg overflow-hidden rounded-3xl border-2 border-emerald-500/30 bg-white shadow-2xl dark:border-emerald-700/50 dark:bg-slate-900 z-10"
            >
              {/* Top Accent */}
              <div className="h-1.5 bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-600" />

              <div className="p-5 sm:p-6">
                <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 via-teal-600 to-emerald-700 text-white font-black text-sm shadow-md shadow-emerald-600/30">
                      {activeChatUser.nama_lengkap?.substring(0, 2).toUpperCase() || 'P'}
                    </div>
                    <div>
                      <h3 className="text-base font-black text-slate-900 dark:text-white">
                        {activeChatUser.nama_lengkap}
                      </h3>
                      <p className="text-xs text-slate-500 flex items-center gap-1.5">
                        <UserCheck className="h-3.5 w-3.5 text-emerald-600" />
                        <span>Pengawas Ujian • {activeChatUser.niy ? `NIY ${activeChatUser.niy}` : 'Personel Sekolah'}</span>
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveChatUser(null)}
                    className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                {/* Quick Templates */}
                <div className="mt-4">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                    Template Cepat Koordinasi:
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      "Mengingatkan jadwal pengawasan ujian hari ini.",
                      "Mohon hadir 15 menit sebelum ujian dimulai.",
                      "Harap laporkan absensi peserta ujian setelah selesai.",
                    ].map((tpl, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setChatMessage(tpl)}
                        className="text-[11px] font-semibold px-2.5 py-1 rounded-lg border border-slate-200 bg-slate-50 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-300 dark:border-slate-700 dark:bg-slate-800 transition-all text-left cursor-pointer"
                      >
                        {tpl}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Input Pesan */}
                <div className="mt-4">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-200 block mb-1.5">
                    Pesan Koordinasi:
                  </label>
                  <textarea
                    rows={3}
                    value={chatMessage}
                    onChange={(e) => setChatMessage(e.target.value)}
                    placeholder="Tulis pesan pengingat, instruksi khusus ruang ujian, dsb..."
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-3 text-xs font-medium outline-none focus:border-emerald-600 focus:bg-white dark:border-slate-700 dark:bg-slate-800/80 dark:text-white transition-all"
                  />
                </div>

                {/* Action Buttons */}
                <div className="mt-5 flex items-center justify-end gap-2">
                  <a
                    href={`https://wa.me/?text=${encodeURIComponent(`Assalamu'alaikum ${activeChatUser.nama_lengkap}, ${chatMessage || 'koordinasi terkait pengawasan ujian periodik.'}`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-emerald-300 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 text-xs font-bold transition-all"
                  >
                    <Phone className="h-4 w-4 text-emerald-600" />
                    <span>Kirim via WhatsApp</span>
                  </a>
                  <button
                    type="button"
                    onClick={() => {
                      if (!chatMessage.trim()) {
                        notify('Peringatan', 'Tulis pesan sebelum mengirim.', 'warning')
                        return
                      }
                      notify('Terkirim', `Pesan berhasil dikirimkan ke ${activeChatUser.nama_lengkap}.`, 'success')
                      setActiveChatUser(null)
                      setChatMessage('')
                    }}
                    className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 text-white text-xs font-black shadow-md shadow-emerald-600/30 hover:from-emerald-700 transition-all cursor-pointer"
                  >
                    <Send className="h-4 w-4" />
                    <span>Kirim Pesan Internal</span>
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
