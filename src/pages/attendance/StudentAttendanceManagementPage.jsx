import { useCallback, useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import {
  AlertCircle,
  AlertTriangle,
  ArrowRight,
  Award,
  BookOpen,
  Calendar,
  Clock,
  ExternalLink,
  FileCheck2,
  FileEdit,
  FileSpreadsheet,
  FileText,
  Filter,
  GraduationCap,
  HeartPulse,
  Info,
  Printer,
  RefreshCcw,
  Search,
  ShieldAlert,
  UserCheck,
  UserMinus,
  UserPlus,
  UserRound,
  Users,
  UsersRound,
} from 'lucide-react'
import Swal from 'sweetalert2'
import {
  ArrowBothDirectionHorizontal2,
  CheckCircle1,
  ChevronDown,
  Download1,
  InfoCircle,
  Plus,
  Upload1,
  Xmark2x,
} from '@tailgrids/icons'
import { lmsPresensiService } from '../../services/lmsPresensiService'
import { studentService } from '../../services/studentService'
import { subjectService } from '../../services/subjectService'
import { employeeService } from '../../services/employeeService'
import { kelasService } from '../../services/kelasService'
import AppBreadcrumb from '../../components/app/AppBreadcrumb'
import AppSkeleton from '../../components/app/AppSkeleton'
import AppEmptyState from '../../components/app/AppEmptyState'
import ActionDropdown from '../../components/app/ActionDropdown'
import { Button } from '@/components/tailgrids/core/button'
import { Input } from '@/components/tailgrids/core/input'
import { Badge } from '@/components/tailgrids/core/badge'
import { Pagination } from '@/components/tailgrids/core/pagination'
import { TableBody, TableCell, TableHead, TableHeader, TableRoot, TableRow } from '@/components/tailgrids/core/table'
import { Avatar, AvatarFallback } from '@/components/tailgrids/core/avatar'
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/tailgrids/core/card'
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

export default function StudentAttendanceManagementPage({ initialTab = 'rekap' }) {
  const [searchParams, setSearchParams] = useSearchParams()
  const activeTab = searchParams.get('tab') || initialTab

  const handleTabChange = (tabKey) => {
    setSearchParams({ tab: tabKey })
    if (tabKey === 'verifikasi') setPermStatusFilter('submitted')
    if (tabKey === 'koreksi') setCorrStatusFilter('submitted')
    if (tabKey === 'tindak-lanjut') setFollowUpStatusFilter('all')
  }

  // ── States ──────────────────────────────────────────────────────────────────
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [perPage, setPerPage] = useState(10)
  const [currentPage, setCurrentPage] = useState(1)

  // Data Collections from Real Database APIs
  const [recapData, setRecapData] = useState([])
  const [lessonSessions, setLessonSessions] = useState([])
  const [permissions, setPermissions] = useState([])
  const [corrections, setCorrections] = useState([])
  const [followUps, setFollowUps] = useState([])

  // Options loaded live from Database
  const [studentOptions, setStudentOptions] = useState([])
  const [subjectOptions, setSubjectOptions] = useState([])
  const [teacherOptions, setTeacherOptions] = useState([])
  const [classOptions, setClassOptions] = useState([])

  // Specific Filters
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7))
  const [selectedSubjectId, setSelectedSubjectId] = useState('')
  const [selectedTeacherId, setSelectedTeacherId] = useState('')
  const [selectedClassId, setSelectedClassId] = useState('')
  const [selectedSessionDate, setSelectedSessionDate] = useState('')
  const [permStatusFilter, setPermStatusFilter] = useState('submitted')
  const [corrStatusFilter, setCorrStatusFilter] = useState('submitted')
  const [followUpStatusFilter, setFollowUpStatusFilter] = useState('all')

  // Modals & Action States
  const [busy, setBusy] = useState(false)
  const [selectedItem, setSelectedItem] = useState(null)
  const [reviewAction, setReviewAction] = useState('approved')
  const [reviewNote, setReviewNote] = useState('')

  // Modals Open States
  const [permReviewModalOpen, setPermReviewModalOpen] = useState(false)
  const [corrReviewModalOpen, setCorrReviewModalOpen] = useState(false)
  const [followUpCreateModalOpen, setFollowUpCreateModalOpen] = useState(false)
  const [sessionDetailModalOpen, setSessionDetailModalOpen] = useState(false)

  // Form Data for FollowUp Create
  const [followUpForm, setFollowUpForm] = useState({
    student_id: '',
    action_type: 'panggilan_orang_tua',
    follow_up_date: new Date().toISOString().slice(0, 10),
    notes: '',
  })

  // ── Load Real Options from Database ──────────────────────────────────────────
  useEffect(() => {
    studentService.getDaftar({ per_page: 300 })
      .then((res) => {
        const list = res?.data?.data || res?.data || res || []
        if (Array.isArray(list)) setStudentOptions(list)
      })
      .catch(() => {})

    subjectService.getDaftar({ per_page: 300 })
      .then((res) => {
        const list = res?.data?.data || res?.data || res || []
        if (Array.isArray(list)) setSubjectOptions(list)
      })
      .catch(() => {})

    employeeService.getDaftar({ per_page: 300 })
      .then((res) => {
        const list = res?.data?.data || res?.data || res || []
        if (Array.isArray(list)) setTeacherOptions(list)
      })
      .catch(() => {})

    kelasService.getDaftar({ per_page: 300 })
      .then((res) => {
        const list = res?.data?.data || res?.data || res || []
        if (Array.isArray(list)) setClassOptions(list)
      })
      .catch(() => {})
  }, [])

  // ── Data Loaders per Tab (Database Driven) ──────────────────────────────────
  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const [recapRes, sessionRes, permRes, corrRes, followUpRes] = await Promise.allSettled([
        lmsPresensiService.getReport({ month: selectedMonth, per_page: 200 }),
        lmsPresensiService.getSessions({
          subject_id: selectedSubjectId || undefined,
          employee_id: selectedTeacherId || undefined,
          class_id: selectedClassId || undefined,
          date_from: selectedSessionDate || undefined,
          date_to: selectedSessionDate || undefined,
          per_page: 200,
        }),
        lmsPresensiService.getHomeroomPermissions({
          status: activeTab === 'verifikasi' && permStatusFilter !== 'all' ? permStatusFilter : undefined,
        }),
        lmsPresensiService.getCorrections({
          status: activeTab === 'koreksi' && corrStatusFilter !== 'all' ? corrStatusFilter : undefined,
        }),
        lmsPresensiService.getFollowUps({
          status: activeTab === 'tindak-lanjut' && followUpStatusFilter !== 'all' ? followUpStatusFilter : undefined,
        }),
      ])

      if (recapRes.status === 'fulfilled') {
        const raw = recapRes.value?.data?.data || recapRes.value?.data?.students || recapRes.value?.data || []
        setRecapData(Array.isArray(raw) ? raw : [])
      }
      if (sessionRes.status === 'fulfilled') {
        const payload = sessionRes.value?.data?.data || sessionRes.value?.data || sessionRes.value || []
        const sessionsList = Array.isArray(payload.data) ? payload.data : Array.isArray(payload) ? payload : []
        setLessonSessions(sessionsList)
      }
      if (permRes.status === 'fulfilled') {
        const raw = permRes.value?.data?.data || permRes.value?.data || []
        setPermissions(Array.isArray(raw) ? raw : [])
      }
      if (corrRes.status === 'fulfilled') {
        const raw = corrRes.value?.data?.data || corrRes.value?.data || []
        setCorrections(Array.isArray(raw) ? raw : [])
      }
      if (followUpRes.status === 'fulfilled') {
        const raw = followUpRes.value?.data?.data || followUpRes.value?.data || []
        setFollowUps(Array.isArray(raw) ? raw : [])
      }
    } catch (err) {
      console.error(`Failed to load authentic DB data:`, err)
    } finally {
      setLoading(false)
    }
  }, [activeTab, selectedMonth, selectedSubjectId, selectedTeacherId, selectedClassId, selectedSessionDate, permStatusFilter, corrStatusFilter, followUpStatusFilter])

  useEffect(() => {
    loadData()
  }, [loadData])

  useEffect(() => {
    setCurrentPage(1)
    setSearch('')
  }, [activeTab, permStatusFilter, corrStatusFilter, followUpStatusFilter, selectedMonth, selectedSubjectId, selectedTeacherId, selectedClassId, selectedSessionDate])

  // ── Metrics Calculation ──────────────────────────────────────────────────────
  const metrics = useMemo(() => {
    return {
      recapTotal: recapData.length,
      sessionTotal: lessonSessions.length,
      permPending: permissions.filter((p) => p.status === 'submitted' || p.status === 'reviewing' || p.status === 'pending').length,
      corrPending: corrections.filter((c) => c.status === 'submitted' || c.status === 'reviewing' || c.status === 'pending').length,
      followUpOpen: followUps.filter((f) => f.status === 'open' || f.status === 'in_progress' || f.status === 'submitted').length,
    }
  }, [recapData, lessonSessions, permissions, corrections, followUps])

  // ── Filtered & Paginated Lists ───────────────────────────────────────────────
  const filteredList = useMemo(() => {
    const term = search.toLowerCase()
    if (activeTab === 'rekap') {
      return recapData.filter((item) => {
        const name = (item.student_name || item.nama || item.name || '').toLowerCase()
        const nisn = (item.nisn || '').toLowerCase()
        return !term || name.includes(term) || nisn.includes(term)
      })
    }
    if (activeTab === 'sesi-pelajaran') {
      return lessonSessions.filter((item) => {
        const subjectName = (item.schedule?.subject?.name || item.subject_name || '').toLowerCase()
        const teacherName = (item.schedule?.employee?.nama_lengkap || item.teacher_name || '').toLowerCase()
        const className = (item.schedule?.kelas?.nama_kelas || item.class_name || '').toLowerCase()
        return !term || subjectName.includes(term) || teacherName.includes(term) || className.includes(term)
      })
    }
    if (activeTab === 'verifikasi') {
      return permissions.filter((item) => {
        const studentName = (item.student?.full_name || item.student_name || item.siswa_nama || '').toLowerCase()
        const type = (item.permission_type || item.jenis || '').toLowerCase()
        return !term || studentName.includes(term) || type.includes(term)
      })
    }
    if (activeTab === 'koreksi') {
      return corrections.filter((item) => {
        const studentName = (item.student?.full_name || item.student_name || item.siswa_nama || '').toLowerCase()
        const subject = (item.subject || item.nama_matpel || '').toLowerCase()
        return !term || studentName.includes(term) || subject.includes(term)
      })
    }
    if (activeTab === 'tindak-lanjut') {
      return followUps.filter((item) => {
        const studentName = (item.student?.full_name || item.student_name || item.siswa_nama || '').toLowerCase()
        const action = (item.action_taken || item.action_type || '').toLowerCase()
        return !term || studentName.includes(term) || action.includes(term)
      })
    }
    return []
  }, [activeTab, search, recapData, lessonSessions, permissions, corrections, followUps])

  const totalPages = Math.ceil(filteredList.length / perPage) || 1
  const paginatedList = useMemo(() => {
    const start = (currentPage - 1) * perPage
    return filteredList.slice(start, start + perPage)
  }, [filteredList, currentPage, perPage])

  // ── Actions & Modals ────────────────────────────────────────────────────────
  const handleOpenPermReview = (item, action) => {
    setSelectedItem(item)
    setReviewAction(action)
    setReviewNote('')
    setPermReviewModalOpen(true)
  }

  const handleConfirmPermReview = async () => {
    if (!selectedItem) return
    setBusy(true)
    try {
      await lmsPresensiService.reviewPermission(selectedItem.id, {
        status: reviewAction,
        review_note: reviewNote,
      })
      Swal.fire({
        icon: 'success',
        title: reviewAction === 'approved' ? 'Izin Disetujui' : 'Izin Ditolak',
        text: `Pengajuan izin siswa berhasil di-${reviewAction === 'approved' ? 'setujui' : 'tolak'}.`,
        timer: 2000,
        showConfirmButton: false,
      })
      setPermReviewModalOpen(false)
      loadData()
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Gagal memproses verifikasi',
        text: err.response?.data?.message || 'Terjadi kesalahan saat memproses izin.',
      })
    } finally {
      setBusy(false)
    }
  }

  const handleOpenCorrReview = (item, action) => {
    setSelectedItem(item)
    setReviewAction(action)
    setReviewNote('')
    setCorrReviewModalOpen(true)
  }

  const handleConfirmCorrReview = async () => {
    if (!selectedItem) return
    setBusy(true)
    try {
      await lmsPresensiService.reviewCorrection(selectedItem.id, {
        status: reviewAction,
        review_note: reviewNote,
      })
      Swal.fire({
        icon: 'success',
        title: reviewAction === 'approved' ? 'Koreksi Disetujui' : 'Koreksi Ditolak',
        text: `Pengajuan koreksi presensi berhasil di-${reviewAction === 'approved' ? 'setujui' : 'tolak'}.`,
        timer: 2000,
        showConfirmButton: false,
      })
      setCorrReviewModalOpen(false)
      loadData()
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Gagal memproses koreksi',
        text: err.response?.data?.message || 'Terjadi kesalahan saat memproses koreksi presensi.',
      })
    } finally {
      setBusy(false)
    }
  }

  const handleCreateFollowUp = async (e) => {
    e.preventDefault()
    setBusy(true)
    try {
      await lmsPresensiService.createFollowUp(followUpForm)
      Swal.fire({
        icon: 'success',
        title: 'Tindak Lanjut Berhasil Ditambahkan',
        text: 'Catatan penanganan siswa telah disimpan.',
        timer: 2000,
        showConfirmButton: false,
      })
      setFollowUpCreateModalOpen(false)
      setFollowUpForm({
        student_id: '',
        action_type: 'panggilan_orang_tua',
        follow_up_date: new Date().toISOString().slice(0, 10),
        notes: '',
      })
      loadData()
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Gagal menyimpan tindak lanjut',
        text: err.response?.data?.message || 'Terjadi kesalahan saat menambahkan catatan tindak lanjut.',
      })
    } finally {
      setBusy(false)
    }
  }

  const handleExport = () => {
    window.print()
  }

  // ── Render Badges (TailGrids Badge Prompt Rules) ───────────────────────────
  const getStatusBadge = (status) => {
    const s = (status || '').toLowerCase()
    if (s === 'approved' || s === 'completed' || s === 'verified' || s === 'final') {
      return <Badge color="success" size="sm" prefixIcon={<CheckCircle1 className="size-3.5" />}>{status}</Badge>
    }
    if (s === 'rejected' || s === 'closed' || s === 'cancelled') {
      return <Badge color="error" size="sm" prefixIcon={<Xmark2x className="size-3.5" />}>{status}</Badge>
    }
    if (s === 'in_progress' || s === 'reviewing' || s === 'draft') {
      return <Badge color="sky" size="sm" prefixIcon={<Clock size={12} />}>{status}</Badge>
    }
    return <Badge color="warning" size="sm" prefixIcon={<InfoCircle className="size-3.5" />}>{status || 'Submitted'}</Badge>
  }

  return (
    <div className="space-y-6">
      {/* Header & Breadcrumb */}
      <div>
        <AppBreadcrumb items={[{ label: 'Absensi', href: '/dashboard/absensi/rekap-kehadiran' }, { label: 'Manajemen Kehadiran Siswa' }]} />
        <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
              Pusat Kehadiran Siswa
            </h1>
            <p className="mt-1 text-sm font-medium text-slate-500 dark:text-slate-400">
              Monitoring terpadu rekapitulasi presensi, absensi per mata pelajaran & guru pengajar, verifikasi izin, dan tindak lanjut siswa.
            </p>
          </div>
        </div>
      </div>

      {/* TailGrids Card KPI Metric Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3.5 sm:gap-4">
        <Card
          onClick={() => handleTabChange('rekap')}
          className={`group relative cursor-pointer overflow-hidden rounded-2xl border p-4 transition-all duration-200 hover:-translate-y-1 hover:shadow-md min-w-0 ${
            activeTab === 'rekap'
              ? 'border-blue-500/80 bg-blue-50/40 ring-2 ring-blue-500/20 dark:border-blue-500 dark:bg-blue-950/30'
              : 'border-slate-200/80 bg-white hover:border-blue-300 dark:border-slate-800 dark:bg-[#1B2433]'
          }`}
        >
          <div className="flex items-center justify-between gap-2 min-w-0">
            <span className="truncate text-xs font-bold text-slate-700 dark:text-slate-200" title="Rekapitulasi Siswa">
              Rekapitulasi Siswa
            </span>
            <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-blue-100/90 text-blue-600 transition-transform duration-200 group-hover:scale-110 dark:bg-blue-950/60 dark:text-blue-400">
              <Users size={18} />
            </div>
          </div>
          <div className="mt-3 flex items-end justify-between gap-2 min-w-0">
            <span className="text-2xl font-black tracking-tight text-slate-900 dark:text-white leading-none">
              {metrics.recapTotal}
            </span>
            <Badge color="blue" size="sm" className="shrink-0 whitespace-nowrap text-[10px] px-2 py-0.5 font-medium">
              Periode Bulan
            </Badge>
          </div>
        </Card>

        <Card
          onClick={() => handleTabChange('sesi-pelajaran')}
          className={`group relative cursor-pointer overflow-hidden rounded-2xl border p-4 transition-all duration-200 hover:-translate-y-1 hover:shadow-md min-w-0 ${
            activeTab === 'sesi-pelajaran'
              ? 'border-emerald-500/80 bg-emerald-50/40 ring-2 ring-emerald-500/20 dark:border-emerald-500 dark:bg-emerald-950/30'
              : 'border-slate-200/80 bg-white hover:border-emerald-300 dark:border-slate-800 dark:bg-[#1B2433]'
          }`}
        >
          <div className="flex items-center justify-between gap-2 min-w-0">
            <span className="truncate text-xs font-bold text-slate-700 dark:text-slate-200" title="Sesi Pelajaran">
              Sesi Pelajaran
            </span>
            <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-emerald-100/90 text-emerald-600 transition-transform duration-200 group-hover:scale-110 dark:bg-emerald-950/60 dark:text-emerald-400">
              <BookOpen size={18} />
            </div>
          </div>
          <div className="mt-3 flex items-end justify-between gap-2 min-w-0">
            <span className="text-2xl font-black tracking-tight text-slate-900 dark:text-white leading-none">
              {metrics.sessionTotal}
            </span>
            <Badge color="success" size="sm" className="shrink-0 whitespace-nowrap text-[10px] px-2 py-0.5 font-medium">
              Matpel & Guru
            </Badge>
          </div>
        </Card>

        <Card
          onClick={() => handleTabChange('verifikasi')}
          className={`group relative cursor-pointer overflow-hidden rounded-2xl border p-4 transition-all duration-200 hover:-translate-y-1 hover:shadow-md min-w-0 ${
            activeTab === 'verifikasi'
              ? 'border-amber-500/80 bg-amber-50/40 ring-2 ring-amber-500/20 dark:border-amber-500 dark:bg-amber-950/30'
              : 'border-slate-200/80 bg-white hover:border-amber-300 dark:border-slate-800 dark:bg-[#1B2433]'
          }`}
        >
          <div className="flex items-center justify-between gap-2 min-w-0">
            <span className="truncate text-xs font-bold text-slate-700 dark:text-slate-200" title="Verifikasi Izin">
              Verifikasi Izin
            </span>
            <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-amber-100/90 text-amber-600 transition-transform duration-200 group-hover:scale-110 dark:bg-amber-950/60 dark:text-amber-400">
              <FileCheck2 size={18} />
            </div>
          </div>
          <div className="mt-3 flex items-end justify-between gap-2 min-w-0">
            <span className="text-2xl font-black tracking-tight text-slate-900 dark:text-white leading-none">
              {metrics.permPending}
            </span>
            <Badge color="warning" size="sm" className="shrink-0 whitespace-nowrap text-[10px] px-2 py-0.5 font-medium">
              Menunggu
            </Badge>
          </div>
        </Card>

        <Card
          onClick={() => handleTabChange('koreksi')}
          className={`group relative cursor-pointer overflow-hidden rounded-2xl border p-4 transition-all duration-200 hover:-translate-y-1 hover:shadow-md min-w-0 ${
            activeTab === 'koreksi'
              ? 'border-purple-500/80 bg-purple-50/40 ring-2 ring-purple-500/20 dark:border-purple-500 dark:bg-purple-950/30'
              : 'border-slate-200/80 bg-white hover:border-purple-300 dark:border-slate-800 dark:bg-[#1B2433]'
          }`}
        >
          <div className="flex items-center justify-between gap-2 min-w-0">
            <span className="truncate text-xs font-bold text-slate-700 dark:text-slate-200" title="Koreksi Presensi">
              Koreksi Presensi
            </span>
            <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-purple-100/90 text-purple-600 transition-transform duration-200 group-hover:scale-110 dark:bg-purple-950/60 dark:text-purple-400">
              <FileEdit size={18} />
            </div>
          </div>
          <div className="mt-3 flex items-end justify-between gap-2 min-w-0">
            <span className="text-2xl font-black tracking-tight text-slate-900 dark:text-white leading-none">
              {metrics.corrPending}
            </span>
            <Badge color="purple" size="sm" className="shrink-0 whitespace-nowrap text-[10px] px-2 py-0.5 font-medium">
              Pengajuan
            </Badge>
          </div>
        </Card>

        <Card
          onClick={() => handleTabChange('tindak-lanjut')}
          className={`group relative cursor-pointer overflow-hidden rounded-2xl border p-4 transition-all duration-200 hover:-translate-y-1 hover:shadow-md min-w-0 ${
            activeTab === 'tindak-lanjut'
              ? 'border-rose-500/80 bg-rose-50/40 ring-2 ring-rose-500/20 dark:border-rose-500 dark:bg-rose-950/30'
              : 'border-slate-200/80 bg-white hover:border-rose-300 dark:border-slate-800 dark:bg-[#1B2433]'
          }`}
        >
          <div className="flex items-center justify-between gap-2 min-w-0">
            <span className="truncate text-xs font-bold text-slate-700 dark:text-slate-200" title="Tindak Lanjut">
              Tindak Lanjut
            </span>
            <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-rose-100/90 text-rose-600 transition-transform duration-200 group-hover:scale-110 dark:bg-rose-950/60 dark:text-rose-400">
              <ShieldAlert size={18} />
            </div>
          </div>
          <div className="mt-3 flex items-end justify-between gap-2 min-w-0">
            <span className="text-2xl font-black tracking-tight text-slate-900 dark:text-white leading-none">
              {metrics.followUpOpen}
            </span>
            <Badge color="rose" size="sm" className="shrink-0 whitespace-nowrap text-[10px] px-2 py-0.5 font-medium">
              Penanganan
            </Badge>
          </div>
        </Card>
      </div>

      {/* Main Master Datatable Container Card (Gold Standard Architecture) */}
      <div className="overflow-hidden rounded-[18px] border border-slate-200/80 bg-white shadow-sm dark:border-slate-800 dark:bg-[#1B2433]">
        {/* Workspace Navigation Tabs */}
        <div className="border-b border-slate-200 px-4 pt-3 dark:border-slate-800 sm:px-6 md:px-8">
          <nav className="-mb-px flex space-x-6 overflow-x-auto scrollbar-none" aria-label="Tabs">
            <button
              onClick={() => handleTabChange('rekap')}
              className={`flex items-center gap-2 whitespace-nowrap border-b-2 py-3 text-xs font-bold transition-colors ${
                activeTab === 'rekap'
                  ? 'border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400'
                  : 'border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700 dark:text-slate-400'
              }`}
            >
              <Users size={16} /> Rekapitulasi Kehadiran
            </button>
            <button
              onClick={() => handleTabChange('sesi-pelajaran')}
              className={`flex items-center gap-2 whitespace-nowrap border-b-2 py-3 text-xs font-bold transition-colors ${
                activeTab === 'sesi-pelajaran'
                  ? 'border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400'
                  : 'border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700 dark:text-slate-400'
              }`}
            >
              <BookOpen size={16} /> Absensi Per Mata Pelajaran & Guru
            </button>
            <button
              onClick={() => handleTabChange('verifikasi')}
              className={`flex items-center gap-2 whitespace-nowrap border-b-2 py-3 text-xs font-bold transition-colors ${
                activeTab === 'verifikasi'
                  ? 'border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400'
                  : 'border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700 dark:text-slate-400'
              }`}
            >
              <FileCheck2 size={16} /> Verifikasi Izin / Sakit
            </button>
            <button
              onClick={() => handleTabChange('koreksi')}
              className={`flex items-center gap-2 whitespace-nowrap border-b-2 py-3 text-xs font-bold transition-colors ${
                activeTab === 'koreksi'
                  ? 'border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400'
                  : 'border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700 dark:text-slate-400'
              }`}
            >
              <FileEdit size={16} /> Koreksi Presensi
            </button>
            <button
              onClick={() => handleTabChange('tindak-lanjut')}
              className={`flex items-center gap-2 whitespace-nowrap border-b-2 py-3 text-xs font-bold transition-colors ${
                activeTab === 'tindak-lanjut'
                  ? 'border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400'
                  : 'border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700 dark:text-slate-400'
              }`}
            >
              <ShieldAlert size={16} /> Tindak Lanjut Siswa
            </button>
          </nav>
        </div>

        {/* Standard Toolbar Structure (2-Baris Gold Standard) */}
        <div className="space-y-3.5 p-4 sm:p-6 md:p-8 border-b border-slate-100 dark:border-slate-800">
          {/* Baris 1: Tab Title + Soft Pastel Squircle Action Buttons with Floating Tooltips */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              {activeTab === 'rekap' && <><Users size={18} className="text-blue-600" /> Matriks Rekapitulasi Presensi Siswa</>}
              {activeTab === 'sesi-pelajaran' && <><BookOpen size={18} className="text-emerald-600" /> Presensi Sesi Kelas Per Mata Pelajaran & Guru</>}
              {activeTab === 'verifikasi' && <><FileCheck2 size={18} className="text-amber-600" /> Daftar Pengajuan Izin & Sakit Siswa</>}
              {activeTab === 'koreksi' && <><FileEdit size={18} className="text-purple-600" /> Permohonan Koreksi Presensi Guru</>}
              {activeTab === 'tindak-lanjut' && <><ShieldAlert size={18} className="text-rose-600" /> Catatan Penanganan & Tindak Lanjut Siswa</>}
            </h2>

            <div className="flex flex-wrap items-center gap-2">
              {/* Refresh Button (Violet Squircle) with Floating Tooltip */}
              <div className="group relative inline-flex">
                <button
                  type="button"
                  title="Segarkan Data"
                  aria-label="Segarkan Data"
                  className="flex size-10 items-center justify-center rounded-2xl bg-violet-100/90 text-violet-600 hover:bg-violet-200/90 dark:bg-violet-950/50 dark:text-violet-400 dark:hover:bg-violet-900/70 transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer"
                  onClick={loadData}
                >
                  <RefreshCcw className={`size-5 ${loading ? 'animate-spin' : ''}`} />
                </button>
                <div className="pointer-events-none absolute top-full left-1/2 mt-2 -translate-x-1/2 opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 transition-all duration-200 ease-out z-50 whitespace-nowrap rounded-lg bg-slate-900 px-2.5 py-1 text-[11px] font-bold text-white shadow-xl dark:bg-slate-100 dark:text-slate-900">
                  <div className="absolute bottom-full left-1/2 -mb-1 -translate-x-1/2 border-4 border-transparent border-b-slate-900 dark:border-b-slate-100" />
                  Segarkan Data (Real DB)
                </div>
              </div>

              {/* Export Button (Amber Squircle) with Floating Tooltip */}
              <div className="group relative inline-flex">
                <button
                  type="button"
                  title="Export Data"
                  aria-label="Export Data"
                  className="flex size-10 items-center justify-center rounded-2xl bg-amber-100/90 text-amber-600 hover:bg-amber-200/90 dark:bg-amber-950/50 dark:text-amber-400 dark:hover:bg-amber-900/70 transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer"
                  onClick={handleExport}
                >
                  <Download1 className="size-5" />
                </button>
                <div className="pointer-events-none absolute top-full left-1/2 mt-2 -translate-x-1/2 opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 transition-all duration-200 ease-out z-50 whitespace-nowrap rounded-lg bg-slate-900 px-2.5 py-1 text-[11px] font-bold text-white shadow-xl dark:bg-slate-100 dark:text-slate-900">
                  <div className="absolute bottom-full left-1/2 -mb-1 -translate-x-1/2 border-4 border-transparent border-b-slate-900 dark:border-b-slate-100" />
                  Cetak / Export PDF & Excel
                </div>
              </div>

              {/* Action Plus Button (Emerald Squircle) with Floating Tooltip */}
              {activeTab === 'tindak-lanjut' && (
                <div className="group relative inline-flex">
                  <button
                    type="button"
                    title="Tambah Catatan"
                    aria-label="Tambah Catatan"
                    className="flex size-10 items-center justify-center rounded-2xl bg-emerald-100/90 text-emerald-600 hover:bg-emerald-200/90 dark:bg-emerald-950/50 dark:text-emerald-400 dark:hover:bg-emerald-900/70 transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer"
                    onClick={() => setFollowUpCreateModalOpen(true)}
                  >
                    <Plus className="size-5" />
                  </button>
                  <div className="pointer-events-none absolute top-full left-1/2 mt-2 -translate-x-1/2 opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 transition-all duration-200 ease-out z-50 whitespace-nowrap rounded-lg bg-slate-900 px-2.5 py-1 text-[11px] font-bold text-white shadow-xl dark:bg-slate-100 dark:text-slate-900">
                    <div className="absolute bottom-full left-1/2 -mb-1 -translate-x-1/2 border-4 border-transparent border-b-slate-900 dark:border-b-slate-100" />
                    Tambah Catatan Tindak Lanjut
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Baris 2: Search Input + Dynamic Dropdown Filters (Database Driven) + perPage Selector */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                type="text"
                placeholder={
                  activeTab === 'rekap'
                    ? 'Cari NISN atau nama siswa...'
                    : activeTab === 'sesi-pelajaran'
                    ? 'Cari mata pelajaran, guru, atau rombel...'
                    : activeTab === 'verifikasi'
                    ? 'Cari nama siswa atau jenis izin...'
                    : activeTab === 'koreksi'
                    ? 'Cari nama siswa atau matpel...'
                    : 'Cari nama siswa atau bentuk tindakan...'
                }
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value)
                  setCurrentPage(1)
                }}
                className="pl-9 text-xs"
              />
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {/* Filter Tab 1: Month */}
              {activeTab === 'rekap' && (
                <div className="flex items-center gap-2">
                  <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1">
                    <Calendar size={14} /> Periode:
                  </label>
                  <input
                    type="month"
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(e.target.value)}
                    className="rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-800 shadow-sm dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
                  />
                </div>
              )}

              {/* Filter Tab 2: Sesi Pelajaran (Mata Pelajaran, Guru, Rombel, Tanggal) */}
              {activeTab === 'sesi-pelajaran' && (
                <>
                  {/* Dropdown Mata Pelajaran dari Database */}
                  <select
                    value={selectedSubjectId}
                    onChange={(e) => setSelectedSubjectId(e.target.value)}
                    className="rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-800 shadow-sm dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 max-w-[180px] truncate"
                  >
                    <option value="">Semua Mata Pelajaran</option>
                    {subjectOptions.map((subj) => (
                      <option key={subj.id} value={subj.id}>
                        {subj.name || subj.nama_matpel || subj.code}
                      </option>
                    ))}
                  </select>

                  {/* Dropdown Guru Pengajar dari Database */}
                  <select
                    value={selectedTeacherId}
                    onChange={(e) => setSelectedTeacherId(e.target.value)}
                    className="rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-800 shadow-sm dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 max-w-[180px] truncate"
                  >
                    <option value="">Semua Guru Pengajar</option>
                    {teacherOptions.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.nama_lengkap || t.full_name || t.name} ({t.nip || 'NIP'})
                      </option>
                    ))}
                  </select>

                  {/* Dropdown Rombel / Kelas */}
                  <select
                    value={selectedClassId}
                    onChange={(e) => setSelectedClassId(e.target.value)}
                    className="rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-800 shadow-sm dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
                  >
                    <option value="">Semua Rombel</option>
                    {classOptions.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.nama_kelas || c.name}
                      </option>
                    ))}
                  </select>

                  {/* Date Filter */}
                  <input
                    type="date"
                    value={selectedSessionDate}
                    onChange={(e) => setSelectedSessionDate(e.target.value)}
                    className="rounded-xl border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-800 shadow-sm dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
                  />
                </>
              )}

              {/* Filter Tab 3: Status Izin */}
              {activeTab === 'verifikasi' && (
                <select
                  value={permStatusFilter}
                  onChange={(e) => setPermStatusFilter(e.target.value)}
                  className="rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-800 shadow-sm dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
                >
                  <option value="submitted">Menunggu Verifikasi</option>
                  <option value="approved">Disetujui (Approved)</option>
                  <option value="rejected">Ditolak (Rejected)</option>
                  <option value="all">Semua Status</option>
                </select>
              )}

              {/* Filter Tab 4: Status Koreksi */}
              {activeTab === 'koreksi' && (
                <select
                  value={corrStatusFilter}
                  onChange={(e) => setCorrStatusFilter(e.target.value)}
                  className="rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-800 shadow-sm dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
                >
                  <option value="submitted">Menunggu Persetujuan</option>
                  <option value="approved">Disetujui (Approved)</option>
                  <option value="rejected">Ditolak (Rejected)</option>
                  <option value="all">Semua Status</option>
                </select>
              )}

              {/* Filter Tab 5: Status Tindak Lanjut */}
              {activeTab === 'tindak-lanjut' && (
                <select
                  value={followUpStatusFilter}
                  onChange={(e) => setFollowUpStatusFilter(e.target.value)}
                  className="rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-800 shadow-sm dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
                >
                  <option value="all">Semua Status Penanganan</option>
                  <option value="open">Open (Baru)</option>
                  <option value="in_progress">In Progress (Diproses)</option>
                  <option value="completed">Completed (Selesai)</option>
                  <option value="closed">Closed (Ditutup)</option>
                </select>
              )}

              {/* perPage Selector */}
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-medium text-slate-500">Tampilkan:</span>
                <select
                  value={perPage}
                  onChange={(e) => {
                    setPerPage(Number(e.target.value))
                    setCurrentPage(1)
                  }}
                  className="rounded-xl border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-800 shadow-sm dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={15}>15</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Content Table Body (px-4 sm:px-6 md:px-8) */}
        {loading ? (
          <div className="p-8">
            <AppSkeleton rows={6} />
          </div>
        ) : paginatedList.length === 0 ? (
          <div className="p-12">
            <AppEmptyState
              title="Tidak Ada Data Presensi Siswa"
              description="Belum ada catatan presensi dari database yang sesuai dengan kriteria pencarian dan filter yang dipilih."
            />
          </div>
        ) : (
          <div className="overflow-x-auto px-4 sm:px-6 md:px-8 py-2">
            {/* Tab 1: Rekapitulasi Presensi */}
            {activeTab === 'rekap' && (
              <TableRoot fullBleed={false}>
                <TableHeader>
                  <TableRow className="bg-slate-50/70 dark:bg-slate-900/50">
                    <TableHead className="w-12 text-center">#</TableHead>
                    <TableHead>
                      <div className="flex items-center gap-1">Siswa <ArrowBothDirectionHorizontal2 className="size-3.5" /></div>
                    </TableHead>
                    <TableHead className="text-center">Hadir (H)</TableHead>
                    <TableHead className="text-center">Sakit (S)</TableHead>
                    <TableHead className="text-center">Izin (I)</TableHead>
                    <TableHead className="text-center">Alpa (A)</TableHead>
                    <TableHead className="text-center">Terlambat (T)</TableHead>
                    <TableHead className="text-center">Persentase Kehadiran</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedList.map((item, idx) => {
                    const rowNum = (currentPage - 1) * perPage + idx + 1
                    const hadir = item.hadir || item.present || 0
                    const sakit = item.sakit || item.sick || 0
                    const izin = item.izin || item.permission || 0
                    const alpa = item.alpa || item.absent || 0
                    const terlambat = item.terlambat || item.late || 0
                    const totalDays = hadir + sakit + izin + alpa + terlambat || 1
                    const percentage = Math.round(((hadir + terlambat) / totalDays) * 100)

                    return (
                      <TableRow key={item.student_id || item.id || idx} className="hover:scale-[1.001] transition-all hover:bg-slate-50/90 dark:hover:bg-slate-800/60">
                        <TableCell className="text-center font-medium text-slate-500">{rowNum}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar size="sm">
                              <AvatarFallback className="bg-blue-100 text-blue-700 font-bold dark:bg-blue-900 dark:text-blue-300">
                                {(item.student_name || item.nama || item.name || 'S')[0]}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-extrabold text-slate-900 dark:text-white">
                                {item.student_name || item.nama || item.name || 'Siswa'}
                              </div>
                              <div className="text-xs font-medium text-slate-500">
                                NISN: {item.nisn || '-'} | Kelas: {item.kelas || item.class_name || '-'}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-center font-bold text-emerald-600 dark:text-emerald-400">{hadir}</TableCell>
                        <TableCell className="text-center font-bold text-blue-600 dark:text-blue-400">{sakit}</TableCell>
                        <TableCell className="text-center font-bold text-amber-600 dark:text-amber-400">{izin}</TableCell>
                        <TableCell className="text-center font-bold text-rose-600 dark:text-rose-400">{alpa}</TableCell>
                        <TableCell className="text-center font-bold text-purple-600 dark:text-purple-400">{terlambat}</TableCell>
                        <TableCell className="text-center">
                          <div className="inline-flex items-center gap-2">
                            <div className="h-2 w-20 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                              <div
                                className={`h-full rounded-full ${
                                  percentage >= 90 ? 'bg-emerald-500' : percentage >= 75 ? 'bg-amber-500' : 'bg-rose-500'
                                }`}
                                style={{ width: `${Math.min(100, percentage)}%` }}
                              />
                            </div>
                            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{percentage}%</span>
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </TableRoot>
            )}

            {/* Tab 2: Sesi Pelajaran (Presensi Per Matpel & Guru) */}
            {activeTab === 'sesi-pelajaran' && (
              <TableRoot fullBleed={false}>
                <TableHeader>
                  <TableRow className="bg-slate-50/70 dark:bg-slate-900/50">
                    <TableHead className="w-12 text-center">#</TableHead>
                    <TableHead>Mata Pelajaran</TableHead>
                    <TableHead>Guru Pengajar</TableHead>
                    <TableHead>Rombel / Kelas</TableHead>
                    <TableHead className="text-center">Tanggal & Pertemuan</TableHead>
                    <TableHead className="text-center">Ringkasan Kehadiran</TableHead>
                    <TableHead className="text-center">Status Sesi</TableHead>
                    <TableHead className="text-right w-24">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedList.map((item, idx) => {
                    const rowNum = (currentPage - 1) * perPage + idx + 1
                    const subjectName = item.schedule?.subject?.name || item.subject_name || 'Mata Pelajaran'
                    const teacherName = item.schedule?.employee?.nama_lengkap || item.teacher_name || '-'
                    const className = item.schedule?.kelas?.nama_kelas || item.class_name || '-'
                    const attendances = item.attendances || []
                    const hadirCount = attendances.filter((a) => a.status === 'HADIR' || a.status_hadir === 'hadir').length
                    const totalCount = attendances.length || 0

                    return (
                      <TableRow key={item.id || idx} className="hover:scale-[1.001] transition-all hover:bg-slate-50/90 dark:hover:bg-slate-800/60">
                        <TableCell className="text-center font-medium text-slate-500">{rowNum}</TableCell>
                        <TableCell>
                          <div className="font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5">
                            <BookOpen size={14} className="text-emerald-600" /> {subjectName}
                          </div>
                          <div className="text-xs font-medium text-slate-500">
                            Kode: {item.schedule?.subject?.code || '-'}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="font-semibold text-slate-800 dark:text-slate-200">{teacherName}</div>
                          <div className="text-xs text-slate-500">NIP: {item.schedule?.employee?.nip || '-'}</div>
                        </TableCell>
                        <TableCell>
                          <Badge color="cyan" size="sm">{className}</Badge>
                        </TableCell>
                        <TableCell className="text-center text-xs font-semibold text-slate-700 dark:text-slate-300">
                          <div>{item.attendance_date || item.tanggal}</div>
                          <div className="text-[11px] text-slate-400">Pertemuan Ke-{item.meeting_number || item.pertemuan_ke || 1}</div>
                        </TableCell>
                        <TableCell className="text-center">
                          <span className="text-xs font-extrabold text-emerald-600 dark:text-emerald-400">
                            {hadirCount} / {totalCount} Siswa Hadir
                          </span>
                        </TableCell>
                        <TableCell className="text-center">
                          {getStatusBadge(item.status)}
                        </TableCell>
                        <TableCell className="text-right">
                          <ActionDropdown
                            actions={[
                              {
                                label: 'Lihat Detail Absen Sesi',
                                icon: BookOpen,
                                onClick: () => {
                                  setSelectedItem(item)
                                  setSessionDetailModalOpen(true)
                                },
                              },
                            ]}
                          />
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </TableRoot>
            )}

            {/* Tab 3: Verifikasi Izin / Sakit */}
            {activeTab === 'verifikasi' && (
              <TableRoot fullBleed={false}>
                <TableHeader>
                  <TableRow className="bg-slate-50/70 dark:bg-slate-900/50">
                    <TableHead className="w-12 text-center">#</TableHead>
                    <TableHead>Siswa & Kelas</TableHead>
                    <TableHead>Jenis Izin</TableHead>
                    <TableHead>Tanggal Mulai - Selesai</TableHead>
                    <TableHead>Alasan / Keterangan</TableHead>
                    <TableHead className="text-center">Status Verifikasi</TableHead>
                    <TableHead className="text-right w-24">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedList.map((item, idx) => {
                    const rowNum = (currentPage - 1) * perPage + idx + 1
                    const studentName = item.student?.full_name || item.student_name || item.siswa_nama || 'Siswa'
                    const className = item.student?.kelas?.nama_kelas || item.class_name || '-'

                    return (
                      <TableRow key={item.id || idx} className="hover:scale-[1.001] transition-all hover:bg-slate-50/90 dark:hover:bg-slate-800/60">
                        <TableCell className="text-center font-medium text-slate-500">{rowNum}</TableCell>
                        <TableCell>
                          <div className="font-extrabold text-slate-900 dark:text-white">{studentName}</div>
                          <div className="text-xs font-medium text-slate-500">Kelas: {className}</div>
                        </TableCell>
                        <TableCell>
                          <Badge color={item.permission_type === 'sakit' ? 'blue' : 'cyan'} size="sm">
                            {(item.permission_type || item.jenis || 'Izin').toUpperCase()}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                          {item.start_date || item.tanggal} s/d {item.end_date || item.tanggal}
                        </TableCell>
                        <TableCell className="max-w-xs truncate text-xs text-slate-600 dark:text-slate-400">
                          {item.reason || item.alasan || '-'}
                        </TableCell>
                        <TableCell className="text-center">
                          {getStatusBadge(item.status)}
                        </TableCell>
                        <TableCell className="text-right">
                          <ActionDropdown
                            actions={[
                              {
                                label: 'Setujui Izin',
                                icon: CheckCircle1,
                                onClick: () => handleOpenPermReview(item, 'approved'),
                              },
                              {
                                label: 'Tolak Izin',
                                icon: Xmark2x,
                                danger: true,
                                onClick: () => handleOpenPermReview(item, 'rejected'),
                              },
                            ]}
                          />
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </TableRoot>
            )}

            {/* Tab 4: Koreksi Presensi */}
            {activeTab === 'koreksi' && (
              <TableRoot fullBleed={false}>
                <TableHeader>
                  <TableRow className="bg-slate-50/70 dark:bg-slate-900/50">
                    <TableHead className="w-12 text-center">#</TableHead>
                    <TableHead>Siswa</TableHead>
                    <TableHead>Mata Pelajaran & Tanggal</TableHead>
                    <TableHead>Status Awal</TableHead>
                    <TableHead>Usulan Koreksi</TableHead>
                    <TableHead>Alasan Koreksi</TableHead>
                    <TableHead className="text-center">Status Koreksi</TableHead>
                    <TableHead className="text-right w-24">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedList.map((item, idx) => {
                    const rowNum = (currentPage - 1) * perPage + idx + 1
                    const studentName = item.student?.full_name || item.student_name || item.siswa_nama || 'Siswa'

                    return (
                      <TableRow key={item.id || idx} className="hover:scale-[1.001] transition-all hover:bg-slate-50/90 dark:hover:bg-slate-800/60">
                        <TableCell className="text-center font-medium text-slate-500">{rowNum}</TableCell>
                        <TableCell>
                          <div className="font-extrabold text-slate-900 dark:text-white">{studentName}</div>
                          <div className="text-xs font-medium text-slate-500">Guru: {item.requested_by_name || '-'}</div>
                        </TableCell>
                        <TableCell className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                          <div>{item.subject || item.nama_matpel || 'Pelajaran'}</div>
                          <div className="text-[11px] text-slate-400">{item.attendance_date || item.tanggal}</div>
                        </TableCell>
                        <TableCell>
                          <Badge color="gray" size="sm">{item.original_status || 'ALPHA'}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge color="success" size="sm">{item.requested_status || 'HADIR'}</Badge>
                        </TableCell>
                        <TableCell className="max-w-xs truncate text-xs text-slate-600 dark:text-slate-400">
                          {item.reason || item.alasan || '-'}
                        </TableCell>
                        <TableCell className="text-center">
                          {getStatusBadge(item.status)}
                        </TableCell>
                        <TableCell className="text-right">
                          <ActionDropdown
                            actions={[
                              {
                                label: 'Setujui Koreksi',
                                icon: CheckCircle1,
                                onClick: () => handleOpenCorrReview(item, 'approved'),
                              },
                              {
                                label: 'Tolak Koreksi',
                                icon: Xmark2x,
                                danger: true,
                                onClick: () => handleOpenCorrReview(item, 'rejected'),
                              },
                            ]}
                          />
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </TableRoot>
            )}

            {/* Tab 5: Tindak Lanjut Siswa */}
            {activeTab === 'tindak-lanjut' && (
              <TableRoot fullBleed={false}>
                <TableHeader>
                  <TableRow className="bg-slate-50/70 dark:bg-slate-900/50">
                    <TableHead className="w-12 text-center">#</TableHead>
                    <TableHead>Siswa & Rombel</TableHead>
                    <TableHead>Bentuk Tindak Lanjut</TableHead>
                    <TableHead>Tanggal Penanganan</TableHead>
                    <TableHead>Catatan / Rekomendasi</TableHead>
                    <TableHead className="text-center">Status Penanganan</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedList.map((item, idx) => {
                    const rowNum = (currentPage - 1) * perPage + idx + 1
                    const studentName = item.student?.full_name || item.student_name || item.siswa_nama || 'Siswa'
                    const className = item.student?.kelas?.nama_kelas || item.class_name || '-'

                    return (
                      <TableRow key={item.id || idx} className="hover:scale-[1.001] transition-all hover:bg-slate-50/90 dark:hover:bg-slate-800/60">
                        <TableCell className="text-center font-medium text-slate-500">{rowNum}</TableCell>
                        <TableCell>
                          <div className="font-extrabold text-slate-900 dark:text-white">{studentName}</div>
                          <div className="text-xs font-medium text-slate-500">Kelas: {className}</div>
                        </TableCell>
                        <TableCell>
                          <Badge color="purple" size="sm">
                            {(item.action_taken || item.action_type || 'Panggilan Ortu').replace(/_/g, ' ').toUpperCase()}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                          {item.follow_up_date || item.tanggal || '-'}
                        </TableCell>
                        <TableCell className="max-w-xs truncate text-xs text-slate-600 dark:text-slate-400">
                          {item.notes || item.catatan || '-'}
                        </TableCell>
                        <TableCell className="text-center">
                          {getStatusBadge(item.status)}
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </TableRoot>
            )}
          </div>
        )}

        {/* Footer Pagination */}
        <div className="w-full border-t border-slate-200 px-4 py-3.5 sm:px-6 md:px-8 dark:border-slate-800">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={(page) => setCurrentPage(page)}
            sideLayout="full"
            variant="default"
          />
        </div>
      </div>

      {/* ── TailGrids Dialog Modals ──────────────────────────────────────────── */}

      {/* Modal 1: Detail Sesi Absensi Pelajaran */}
      <Backdrop isOpen={sessionDetailModalOpen} onOpenChange={setSessionDetailModalOpen}>
        <Dialog className="max-w-xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <BookOpen className="text-emerald-600" size={18} /> Detail Presensi Sesi Pelajaran
            </DialogTitle>
            <DialogDescription>
              Mata Pelajaran: <strong>{selectedItem?.schedule?.subject?.name || selectedItem?.subject_name}</strong> | Guru: <strong>{selectedItem?.schedule?.employee?.nama_lengkap || selectedItem?.teacher_name}</strong>
            </DialogDescription>
          </DialogHeader>

          <DialogBody className="space-y-4">
            <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 p-3 rounded-xl dark:bg-slate-900/60">
              <div>
                <span className="text-slate-500 font-medium">Tanggal Sesi:</span>
                <div className="font-bold text-slate-800 dark:text-slate-200">{selectedItem?.attendance_date || selectedItem?.tanggal}</div>
              </div>
              <div>
                <span className="text-slate-500 font-medium">Rombel:</span>
                <div className="font-bold text-slate-800 dark:text-slate-200">{selectedItem?.schedule?.kelas?.nama_kelas || selectedItem?.class_name}</div>
              </div>
            </div>

            <div className="max-h-60 overflow-y-auto space-y-1.5 divide-y divide-slate-100 dark:divide-slate-800 pr-1">
              <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300">Daftar Kehadiran Siswa Sesi Ini:</h4>
              {(selectedItem?.attendances || []).map((att, i) => (
                <div key={att.id || i} className="flex items-center justify-between pt-2">
                  <div className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                    {att.siswa?.nama_lengkap || att.student_name || `Siswa #${i+1}`}
                  </div>
                  <Badge color={att.status === 'HADIR' || att.status_hadir === 'hadir' ? 'success' : 'warning'} size="sm">
                    {att.status || att.status_hadir || 'HADIR'}
                  </Badge>
                </div>
              ))}
            </div>
          </DialogBody>

          <DialogFooter>
            <DialogClose asChild>
              <Button variant="ghost" appearance="outline" size="sm">
                Tutup
              </Button>
            </DialogClose>
          </DialogFooter>
        </Dialog>
      </Backdrop>

      {/* Modal 2: Verifikasi Izin / Sakit */}
      <Backdrop isOpen={permReviewModalOpen} onOpenChange={setPermReviewModalOpen}>
        <Dialog className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {reviewAction === 'approved' ? 'Setujui Pengajuan Izin' : 'Tolak Pengajuan Izin'}
            </DialogTitle>
            <DialogDescription>
              Konfirmasi status pengajuan izin/sakit siswa <strong>{selectedItem?.student?.full_name || selectedItem?.student_name}</strong>.
            </DialogDescription>
          </DialogHeader>

          <DialogBody className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Catatan Verifikasi (Opsional)
              </label>
              <textarea
                rows={3}
                placeholder="Tuliskan alasan persetujuan atau penolakan..."
                value={reviewNote}
                onChange={(e) => setReviewNote(e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-white p-3 text-xs text-slate-900 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
              />
            </div>
          </DialogBody>

          <DialogFooter>
            <DialogClose asChild>
              <Button variant="ghost" appearance="outline" size="sm" disabled={busy}>
                Batal
              </Button>
            </DialogClose>
            <Button
              variant={reviewAction === 'approved' ? 'primary' : 'danger'}
              appearance="fill"
              size="sm"
              pending={busy}
              onClick={handleConfirmPermReview}
            >
              {reviewAction === 'approved' ? 'Setujui' : 'Tolak'}
            </Button>
          </DialogFooter>
        </Dialog>
      </Backdrop>

      {/* Modal 3: Koreksi Presensi */}
      <Backdrop isOpen={corrReviewModalOpen} onOpenChange={setCorrReviewModalOpen}>
        <Dialog className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {reviewAction === 'approved' ? 'Setujui Koreksi Presensi' : 'Tolak Koreksi Presensi'}
            </DialogTitle>
            <DialogDescription>
              Konfirmasi perubahan presensi siswa <strong>{selectedItem?.student?.full_name || selectedItem?.student_name}</strong>.
            </DialogDescription>
          </DialogHeader>

          <DialogBody className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Catatan Persetujuan / Penolakan
              </label>
              <textarea
                rows={3}
                placeholder="Tuliskan catatan verifikasi..."
                value={reviewNote}
                onChange={(e) => setReviewNote(e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-white p-3 text-xs text-slate-900 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
              />
            </div>
          </DialogBody>

          <DialogFooter>
            <DialogClose asChild>
              <Button variant="ghost" appearance="outline" size="sm" disabled={busy}>
                Batal
              </Button>
            </DialogClose>
            <Button
              variant={reviewAction === 'approved' ? 'primary' : 'danger'}
              appearance="fill"
              size="sm"
              pending={busy}
              onClick={handleConfirmCorrReview}
            >
              {reviewAction === 'approved' ? 'Setujui Koreksi' : 'Tolak Koreksi'}
            </Button>
          </DialogFooter>
        </Dialog>
      </Backdrop>

      {/* Modal 4: Tambah Catatan Tindak Lanjut Siswa */}
      <Backdrop isOpen={followUpCreateModalOpen} onOpenChange={setFollowUpCreateModalOpen}>
        <Dialog className="max-w-lg">
          <form onSubmit={handleCreateFollowUp}>
            <DialogHeader>
              <DialogTitle>Tambah Catatan Tindak Lanjut Siswa</DialogTitle>
              <DialogDescription>
                Buat tindakan penanganan (Panggilan Orang Tua, Konseling BK, atau Surat Peringatan) bagi siswa.
              </DialogDescription>
            </DialogHeader>

            <DialogBody className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Pilih Siswa <span className="text-rose-500">*</span>
                </label>
                <select
                  required
                  value={followUpForm.student_id}
                  onChange={(e) => setFollowUpForm({ ...followUpForm, student_id: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 bg-white p-2.5 text-xs text-slate-900 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                >
                  <option value="">-- Pilih Siswa --</option>
                  {studentOptions.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.nama_lengkap || s.full_name} ({s.nisn || s.nis || 'NISN'}) - {s.kelas?.nama_kelas || 'Rombel'}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Bentuk Tindakan / Penanganan <span className="text-rose-500">*</span>
                </label>
                <select
                  value={followUpForm.action_type}
                  onChange={(e) => setFollowUpForm({ ...followUpForm, action_type: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 bg-white p-2.5 text-xs text-slate-900 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                >
                  <option value="panggilan_orang_tua">Panggilan Orang Tua / Wali</option>
                  <option value="konseling_bk">Konseling Bimbingan Konseling (BK)</option>
                  <option value="surat_peringatan">Surat Peringatan (SP)</option>
                  <option value="home_visit">Kunjungan Rumah (Home Visit)</option>
                  <option value="pembinaan_khusus">Pembinaan Khusus Rombel</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Tanggal Pelaksanaan <span className="text-rose-500">*</span>
                </label>
                <input
                  type="date"
                  required
                  value={followUpForm.follow_up_date}
                  onChange={(e) => setFollowUpForm({ ...followUpForm, follow_up_date: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 bg-white p-2.5 text-xs text-slate-900 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Catatan & Rekomendasi Penanganan
                </label>
                <textarea
                  rows={3}
                  placeholder="Detail hasil penanganan atau kesepakatan dengan orang tua..."
                  value={followUpForm.notes}
                  onChange={(e) => setFollowUpForm({ ...followUpForm, notes: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 bg-white p-3 text-xs text-slate-900 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                />
              </div>
            </DialogBody>

            <DialogFooter>
              <DialogClose asChild>
                <Button variant="ghost" appearance="outline" size="sm" disabled={busy}>
                  Batal
                </Button>
              </DialogClose>
              <Button variant="primary" appearance="fill" size="sm" pending={busy} type="submit">
                Simpan Catatan
              </Button>
            </DialogFooter>
          </form>
        </Dialog>
      </Backdrop>
    </div>
  )
}
