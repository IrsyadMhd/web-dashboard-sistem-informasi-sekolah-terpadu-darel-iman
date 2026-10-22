import React, { useState, useEffect, useMemo } from 'react'
import { Navigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
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
} from 'lucide-react'
import { useAuthStore } from '../stores/authStore'
import { getUserRoleLevel, ROLE_LEVELS } from '../auth/portalResolver'
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
import { printCleanTable, downloadPdfTable } from '../utils/printHelper'
import { cn } from '../lib/utils'

// Palet warna KPI Cards
const MODERN_CARD_TONES = {
  emerald: {
    card: 'border-emerald-300/70 bg-gradient-to-br from-emerald-50 via-teal-50/60 to-white hover:border-emerald-400 dark:border-emerald-700/50 dark:from-emerald-950/40 dark:via-teal-950/20 dark:to-slate-900',
    iconBox: 'bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-emerald-500/30',
    title: 'text-emerald-700 dark:text-emerald-400',
    val: 'text-emerald-700 dark:text-emerald-300',
    tag: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/60 dark:text-emerald-300',
  },
  amber: {
    card: 'border-amber-300/70 bg-gradient-to-br from-amber-50 via-orange-50/60 to-white hover:border-amber-400 dark:border-amber-700/50 dark:from-amber-950/40 dark:via-orange-950/20 dark:to-slate-900',
    iconBox: 'bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-amber-500/30',
    title: 'text-amber-700 dark:text-amber-400',
    val: 'text-amber-700 dark:text-amber-300',
    tag: 'bg-amber-100 text-amber-700 dark:bg-amber-900/60 dark:text-amber-300',
  },
  blue: {
    card: 'border-blue-300/70 bg-gradient-to-br from-blue-50 via-cyan-50/60 to-white hover:border-blue-400 dark:border-blue-700/50 dark:from-blue-950/40 dark:via-cyan-950/20 dark:to-slate-900',
    iconBox: 'bg-gradient-to-br from-blue-500 to-cyan-600 text-white shadow-blue-500/30',
    title: 'text-blue-700 dark:text-blue-400',
    val: 'text-blue-700 dark:text-blue-300',
    tag: 'bg-blue-100 text-blue-700 dark:bg-blue-900/60 dark:text-blue-300',
  },
  purple: {
    card: 'border-purple-300/70 bg-gradient-to-br from-purple-50 via-violet-50/60 to-white hover:border-purple-400 dark:border-purple-700/50 dark:from-purple-950/40 dark:via-violet-950/20 dark:to-slate-900',
    iconBox: 'bg-gradient-to-br from-purple-500 to-violet-600 text-white shadow-purple-500/30',
    title: 'text-purple-700 dark:text-purple-400',
    val: 'text-purple-700 dark:text-purple-300',
    tag: 'bg-purple-100 text-purple-700 dark:bg-purple-900/60 dark:text-purple-300',
  },
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

  const [activeTab, setActiveTab] = useState('schedules') // 'schedules' | 'categories'

  // Filter States
  const [selectedUnit, setSelectedUnit] = useState('')
  const [selectedYear, setSelectedYear] = useState('')
  const [selectedSemester, setSelectedSemester] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [selectedDate, setSelectedDate] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const debouncedSearch = useDebounce(searchInput, 350)
  const [page, setPage] = useState(1)

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

  // Query Jadwal Ujian
  const { data: schedulesData, isLoading: schedulesLoading, refetch: refetchSchedules } = useQuery({
    queryKey: [
      'exam-schedules',
      selectedUnit,
      selectedYear,
      selectedSemester,
      selectedCategory,
      selectedDate,
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
        search: debouncedSearch,
        page,
        per_page: 15,
      }),
  })

  // Query Kategori Ujian
  const { data: categoriesData, isLoading: categoriesLoading, refetch: refetchCategories } = useQuery({
    queryKey: ['exam-categories'],
    queryFn: examScheduleService.getCategories,
  })

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
          { label: 'Jadwal & Kategori Ujian', href: '/dashboard/jadwal-ujian' },
        ]}
      />

      <div className="space-y-6">
        {/* ── MODERN HERO BANNER CARD ── */}
        <div className="relative overflow-hidden rounded-[22px] border-2 border-emerald-500/30 bg-gradient-to-r from-emerald-500/15 via-teal-500/10 to-emerald-600/15 p-5 sm:p-6 shadow-md shadow-emerald-500/10 dark:border-emerald-600/40 dark:bg-gradient-to-r dark:from-emerald-950/70 dark:via-teal-950/50 dark:to-slate-900">
          <div className="pointer-events-none absolute -top-20 -right-20 h-56 w-56 rounded-full bg-gradient-to-br from-emerald-500/40 via-teal-400/30 to-transparent blur-3xl" />
          <div className="pointer-events-none absolute -bottom-20 -left-20 h-56 w-56 rounded-full bg-gradient-to-tr from-teal-500/30 via-emerald-400/20 to-transparent blur-3xl" />

          <div className="relative z-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 sm:h-14 sm:w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700 text-white shadow-xl shadow-emerald-600/40 border border-emerald-300/40">
                <CalendarDays className="h-6 w-6 sm:h-7 sm:w-7 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-emerald-600 to-teal-600 px-3 py-0.5 text-[11px] font-extrabold text-white shadow-md shadow-emerald-600/30">
                    <Sparkles className="h-3 w-3 text-amber-300" />
                    Manajemen Evaluasi Periodik
                  </span>
                  <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                    PTS • PAS • PAT Kenaikan Kelas
                  </span>
                </div>
                <h1 className="mt-1 text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                  Jadwal Ujian &amp; Pengaturan Kategori Ujian
                </h1>
                <p className="mt-0.5 text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-300 max-w-2xl">
                  Kelola jadwal pelaksanaan ujian per tanggal, mata pelajaran, ruang, alokasi jam mandiri, serta guru pengawas bebas bentrok.
                </p>
              </div>
            </div>

            {/* Tab Switcher Buttons */}
            <div className="flex items-center gap-1.5 rounded-2xl border border-emerald-500/25 bg-white/80 p-1.5 shadow-sm dark:border-emerald-800/60 dark:bg-slate-900/80 shrink-0">
              <button
                type="button"
                onClick={() => setActiveTab('schedules')}
                className={cn(
                  'flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-black transition-all cursor-pointer',
                  activeTab === 'schedules'
                    ? 'bg-gradient-to-r from-emerald-600 to-teal-700 text-white shadow-sm'
                    : 'text-slate-600 hover:text-emerald-700 hover:bg-emerald-50/60 dark:text-slate-300 dark:hover:bg-slate-800'
                )}
              >
                <Calendar className="h-4 w-4" />
                <span>Matriks Jadwal Ujian</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('categories')}
                className={cn(
                  'flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-black transition-all cursor-pointer',
                  activeTab === 'categories'
                    ? 'bg-gradient-to-r from-emerald-600 to-teal-700 text-white shadow-sm'
                    : 'text-slate-600 hover:text-emerald-700 hover:bg-emerald-50/60 dark:text-slate-300 dark:hover:bg-slate-800'
                )}
              >
                <Tag className="h-4 w-4" />
                <span>Pengaturan Kategori Ujian</span>
              </button>
            </div>
          </div>
        </div>

        {/* ── 4 MODERN KPI CARDS (HANYA DITAMPILKAN DI TAB SCHEDULES) ── */}
        {activeTab === 'schedules' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className={cn('relative overflow-hidden rounded-2xl border p-4 shadow-sm transition-all', MODERN_CARD_TONES.emerald.card)}>
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Total Sesi Ujian</span>
                  <h3 className={cn('text-2xl font-black mt-1', MODERN_CARD_TONES.emerald.val)}>{stats.total_jadwal}</h3>
                  <span className="text-[10px] font-semibold text-slate-500">Terdaftar di Periode Aktif</span>
                </div>
                <div className={cn('flex h-12 w-12 items-center justify-center rounded-2xl', MODERN_CARD_TONES.emerald.iconBox)}>
                  <CalendarDays className="h-6 w-6" />
                </div>
              </div>
            </div>

            <div className={cn('relative overflow-hidden rounded-2xl border p-4 shadow-sm transition-all', MODERN_CARD_TONES.amber.card)}>
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Rombel Terjadwal</span>
                  <h3 className={cn('text-2xl font-black mt-1', MODERN_CARD_TONES.amber.val)}>{stats.total_kelas}</h3>
                  <span className="text-[10px] font-semibold text-slate-500">Kelas / Rombel Peserta</span>
                </div>
                <div className={cn('flex h-12 w-12 items-center justify-center rounded-2xl', MODERN_CARD_TONES.amber.iconBox)}>
                  <GraduationCap className="h-6 w-6" />
                </div>
              </div>
            </div>

            <div className={cn('relative overflow-hidden rounded-2xl border p-4 shadow-sm transition-all', MODERN_CARD_TONES.blue.card)}>
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Mapel Diujikan</span>
                  <h3 className={cn('text-2xl font-black mt-1', MODERN_CARD_TONES.blue.val)}>{stats.total_mapel}</h3>
                  <span className="text-[10px] font-semibold text-slate-500">Mata Pelajaran Aktif</span>
                </div>
                <div className={cn('flex h-12 w-12 items-center justify-center rounded-2xl', MODERN_CARD_TONES.blue.iconBox)}>
                  <BookOpen className="h-6 w-6" />
                </div>
              </div>
            </div>

            <div className={cn('relative overflow-hidden rounded-2xl border p-4 shadow-sm transition-all', MODERN_CARD_TONES.purple.card)}>
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Guru Pengawas</span>
                  <h3 className={cn('text-2xl font-black mt-1', MODERN_CARD_TONES.purple.val)}>{stats.total_pengawas}</h3>
                  <span className="text-[10px] font-semibold text-slate-500">Pengawas Ruang Ujian</span>
                </div>
                <div className={cn('flex h-12 w-12 items-center justify-center rounded-2xl', MODERN_CARD_TONES.purple.iconBox)}>
                  <Users className="h-6 w-6" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── KONTEN TAB 1: MATRIKS JADWAL UJIAN ── */}
        {activeTab === 'schedules' && (
          <div className="relative overflow-hidden rounded-[22px] border-2 border-emerald-300 dark:border-emerald-700/80 bg-white shadow-md shadow-emerald-500/10 dark:bg-[#1B2433]">
            {/* Toolbar Baris 1: Header & Action Buttons */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 sm:p-5 bg-gradient-to-r from-emerald-500/10 via-teal-500/5 to-transparent border-b border-emerald-200/90 dark:border-emerald-800/60">
              <div>
                <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-emerald-600" />
                  <span>Daftar Pelaksanaan Jadwal Ujian</span>
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300">
                    {stats.total_jadwal} Jadwal
                  </span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Jadwal ujian periodik berdasarkan kategori, tanggal, dan alokasi sesi.
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

            {/* Toolbar Baris 2: Filter Bar */}
            <div className="p-4 bg-gradient-to-r from-emerald-50/50 via-teal-50/30 to-emerald-50/50 border-b border-emerald-200/80 dark:border-emerald-800/60 dark:bg-slate-900/60 flex flex-wrap items-center gap-3">
              {/* Unit Filter */}
              <div className="min-w-[160px] flex-1 sm:flex-none">
                <select
                  value={selectedUnit}
                  onChange={(e) => {
                    setSelectedUnit(e.target.value)
                    setPage(1)
                  }}
                  className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs font-bold outline-none focus:border-emerald-700 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                >
                  <option value="">Semua Unit Sekolah</option>
                  {optionsData?.units?.map((u) => (
                    <option key={u.id} value={u.id}>{u.name}</option>
                  ))}
                </select>
              </div>

              {/* Kategori Ujian Filter */}
              <div className="min-w-[180px] flex-1 sm:flex-none">
                <select
                  value={selectedCategory}
                  onChange={(e) => {
                    setSelectedCategory(e.target.value)
                    setPage(1)
                  }}
                  className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs font-bold outline-none focus:border-emerald-700 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                >
                  <option value="">Semua Kategori Ujian</option>
                  {categoriesData?.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              {/* Tanggal Filter */}
              <div className="w-auto">
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => {
                    setSelectedDate(e.target.value)
                    setPage(1)
                  }}
                  className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-xs font-bold outline-none focus:border-emerald-700 dark:border-slate-700 dark:bg-slate-900 dark:text-white font-mono"
                  placeholder="Pilih Tanggal"
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

              {(selectedUnit || selectedCategory || selectedDate || searchInput) && (
                <button
                  type="button"
                  onClick={() => {
                    setSelectedUnit('')
                    setSelectedCategory('')
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
                  ) : (schedulesData?.data || []).length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-slate-500">
                        <CalendarDays className="h-10 w-10 text-slate-300 dark:text-slate-700 mx-auto mb-2" />
                        <span className="block font-bold text-slate-700 dark:text-slate-300">Belum Ada Jadwal Ujian</span>
                        <span className="text-xs text-slate-400">Silakan tambahkan jadwal ujian baru melalui tombol di atas.</span>
                      </td>
                    </tr>
                  ) : (
                    (schedulesData?.data || []).map((row, idx) => {
                      const colorClass = CATEGORY_COLORS[row.exam_category?.color] || CATEGORY_COLORS.amber
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
                            <span className="inline-flex items-center gap-1 font-mono text-[11px] font-bold text-emerald-700 dark:text-emerald-400 mt-0.5">
                              <Clock className="h-3 w-3" />
                              {row.time_start?.substring(0, 5)} - {row.time_end?.substring(0, 5)} ({row.duration_minutes}m)
                            </span>
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
                            <span className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-0.5">
                              <Users className="h-3 w-3 text-slate-400" />
                              {row.invigilator?.nama_lengkap ? `Pengawas: ${row.invigilator.nama_lengkap}` : 'Tanpa Pengawas'}
                            </span>
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
          </div>
        )}

        {/* ── KONTEN TAB 2: PENGATURAN KATEGORI UJIAN (DINAMIS) ── */}
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
              <select
                required
                value={scheduleForm.exam_category_id}
                onChange={(e) => setScheduleForm({ ...scheduleForm, exam_category_id: e.target.value })}
                className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 outline-none focus:border-emerald-700 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
              >
                <option value="">Pilih Kategori Ujian</option>
                {categoriesData?.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.name} ({cat.code})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1.5 flex items-center gap-1.5 text-xs font-bold text-slate-800 dark:text-slate-100">
                <Calendar className="h-3.5 w-3.5 text-emerald-600" />
                <span>Tanggal Pelaksanaan *</span>
              </label>
              <input
                required
                type="date"
                value={scheduleForm.exam_date}
                onChange={(e) => setScheduleForm({ ...scheduleForm, exam_date: e.target.value })}
                className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 outline-none focus:border-emerald-700 dark:border-slate-700 dark:bg-slate-900 dark:text-white font-mono"
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
              <select
                required
                value={scheduleForm.subject_id}
                onChange={(e) => setScheduleForm({ ...scheduleForm, subject_id: e.target.value })}
                className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 outline-none focus:border-emerald-700 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
              >
                <option value="">Pilih Mata Pelajaran</option>
                {optionsData?.subjects?.map((s) => (
                  <option key={s.id} value={s.id}>{s.name || s.nama_mapel} ({s.code || s.kode_mapel || '-'})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1.5 flex items-center gap-1.5 text-xs font-bold text-slate-800 dark:text-slate-100">
                <GraduationCap className="h-3.5 w-3.5 text-emerald-600" />
                <span>Kelas / Rombel Peserta *</span>
              </label>
              <select
                required
                value={scheduleForm.kelas_id}
                onChange={(e) => setScheduleForm({ ...scheduleForm, kelas_id: e.target.value })}
                className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 outline-none focus:border-emerald-700 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
              >
                <option value="">Pilih Kelas / Rombel</option>
                {optionsData?.classes?.map((k) => (
                  <option key={k.id} value={k.id}>{k.nama_kelas} ({k.unitPendidikan?.name || ''})</option>
                ))}
              </select>
            </div>
          </div>

          {/* Baris 4: Ruang Ujian & Guru Pengawas */}
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
                <span>Guru Pengawas Ujian</span>
              </label>
              <select
                value={scheduleForm.invigilator_id}
                onChange={(e) => setScheduleForm({ ...scheduleForm, invigilator_id: e.target.value })}
                className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 outline-none focus:border-emerald-700 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
              >
                <option value="">Pilih Guru Pengawas (Opsional)</option>
                {optionsData?.invigilators?.map((inv) => (
                  <option key={inv.id} value={inv.id}>{inv.nama_lengkap} {inv.niy ? `(NIY ${inv.niy})` : ''}</option>
                ))}
              </select>
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
              <select
                value={categoryForm.color}
                onChange={(e) => setCategoryForm({ ...categoryForm, color: e.target.value })}
                className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 outline-none focus:border-emerald-700 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
              >
                <option value="emerald">Emerald (Hijau Zamrud)</option>
                <option value="amber">Amber (Oranye Keemasan)</option>
                <option value="blue">Blue (Biru Samudra)</option>
                <option value="purple">Purple (Ungu Mewah)</option>
                <option value="rose">Rose (Merah Muda Elegan)</option>
              </select>
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
    </PageContainer>
  )
}
