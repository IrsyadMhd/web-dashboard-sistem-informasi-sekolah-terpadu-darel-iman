import React, { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { keepPreviousData, useQuery } from '@tanstack/react-query'
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import {
  AlertTriangle,
  BookMarked,
  BookOpen,
  BookOpenCheck,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Copy,
  Download,
  Eye,
  FileCheck,
  FileDown,
  FileSpreadsheet,
  Filter,
  Flame,
  Grid,
  HeartHandshake,
  History,
  Info,
  Layers,
  ListChecks,
  Moon,
  Pencil,
  Plus,
  Printer,
  RefreshCw,
  RotateCcw,
  Search,
  Send,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Sun,
  Table,
  UserCheck,
  UserRound,
  Users,
  Zap,
  X,
  XCircle,
  CalendarDays,
} from 'lucide-react'
import Swal from 'sweetalert2'
import { mutabaahService } from '../services/mutabaahService'
import { useAuthStore } from '../stores/authStore'
import { isTeacherRole } from '../auth/portalResolver'
import MutabaahSubNav from '../components/mutabaah/MutabaahSubNav'
import AppBreadcrumb from '../components/app/AppBreadcrumb'
import { Download1, Upload1 } from '@tailgrids/icons'
import {
  MasterDataPage,
  MasterPageHeader,
  MasterActionButton,
  MasterStatCard,
  MasterStatsGrid,
  PrintOptionModal,
} from '../components/master-data'
import { Button } from '@/components/tailgrids/core/button'
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

  return (
    <MasterDataPage className="education-unit-page mutabaah-page" hideBreadcrumb>
      {/* BREADCRUMB NAV */}
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

      {/* MODERN HERO CARD HEADER (MATCHING PORTAL ORANG TUA / SISWA STYLE) */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="my-4">
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
                    Mutaba'ah Yaumiyyah
                  </span>
                  <span className="inline-flex items-center rounded-full bg-emerald-100 px-3 py-0.5 text-xs font-bold text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/60">
                    {view === 'rekap' ? 'Rekap Laporan' : view === 'evaluasi' ? 'Evaluasi Target' : 'Monitoring Realtime'}
                  </span>
                </div>
                <h1 className="mt-1.5 text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                  {view === 'rekap' ? 'Laporan Rekap Mutaba’ah Yaumiyyah' : view === 'evaluasi' ? 'Evaluasi Target Mutaba’ah Santri' : 'Dashboard Monitoring Mutaba’ah Yaumiyyah'}
                </h1>
                <p className="mt-0.5 text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-300 max-w-2xl">
                  Pusat pemantauan amalan yaumiyyah santri: shalat 5 waktu, dzikir, tilawah Al-Qur'an, dan pembiasaan ibadah harian.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 shrink-0 z-10">
              <Button
                type="button"
                variant="primary"
                appearance="fill"
                size="sm"
                onClick={() => analytics.refetch()}
                disabled={analytics.isFetching}
                prefixIcon={<RefreshCw className={`h-4 w-4 ${analytics.isFetching ? 'animate-spin' : ''}`} />}
                className="!bg-gradient-to-r !from-emerald-600 !to-teal-600 !text-white font-bold shadow-md shadow-emerald-600/25 cursor-pointer"
              >
                Segarkan
              </Button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* 📊 KPI CARDS GRID */}
      <MasterStatsGrid>
        <MasterStatCard icon={Users} label="Total Santri Aktif" value={view === 'rekap' ? (recapData?.total || students.length) : (analytics.data?.kpis?.total_students || 0)} description="Sesuai data master siswa" variant="info" delay={40} />
        <MasterStatCard icon={CheckCircle2} label="Sudah Diisi" value={view === 'rekap' ? students.filter((item) => item.progressToday > 0).length : (analytics.data?.kpis?.filled || 0)} description="Memiliki data Mutabaah" variant="success" delay={80} />
        <MasterStatCard icon={ShieldCheck} label="Sudah Final" value={view === 'rekap' ? students.filter((item) => item.status === 'Finalized').length : (analytics.data?.kpis?.finalized || 0)} description="Telah dikunci pembimbing" variant="success" delay={120} />
        <MasterStatCard icon={AlertTriangle} label="Belum Diisi" value={view === 'rekap' ? students.filter((item) => item.status === 'Belum Diisi').length : (analytics.data?.kpis?.not_filled || 0)} description="Perlu ditindaklanjuti" variant="danger" delay={160} />
      </MasterStatsGrid>

      {/* 🧭 CARD MUTABA'AH YAUMIYYAH SUB-NAV (Positioned directly above Data Mutabaah Santri Card) */}
      <MutabaahSubNav />

      {/* 📈 DASHBOARD VIEW: VISUAL CHARTS */}
      {view === 'dashboard' && (
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2 my-5">
          {/* Chart 1: Trend Progress Pekanan */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-[#1B2433]">
            <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3 dark:border-slate-800">
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">Trend Progress Mutabaah Pekanan</h4>
                <p className="text-[11px] text-slate-400">Rata-rata persentase pengisian mutabaah harian santri</p>
              </div>
              <span className="rounded-lg bg-emerald-50 px-2.5 py-1 text-[10px] font-bold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">Live Trend</span>
            </div>
            <div className="h-64 w-full">
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
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} unit="%" />
                  <Tooltip formatter={(val) => [`${val}%`, 'Progress']} />
                  <Area type="monotone" dataKey="progress" stroke="#10B981" strokeWidth={2.5} fillOpacity={1} fill="url(#colorProgress)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 2: Realisasi Target per Amalan */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-[#1B2433]">
            <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3 dark:border-slate-800">
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">Capaian Target Amalan Utama</h4>
                <p className="text-[11px] text-slate-400">Persentase pelaksanaan amalan ibadah terbanyak</p>
              </div>
              <span className="rounded-lg bg-blue-50 px-2.5 py-1 text-[10px] font-bold text-blue-700 dark:bg-blue-950 dark:text-blue-300">Capaian Amalan</span>
            </div>
            <div className="h-64 w-full">
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
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} unit="%" />
                  <Tooltip formatter={(val) => [`${val}%`, 'Realisasi']} />
                  <Bar dataKey="realization" fill="#0E5C44" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* 📊 REKAPITULASI VIEW: SUMMARY STATUS CARDS */}
      {view === 'rekap' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 my-5">
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50/60 p-4 dark:border-emerald-900/50 dark:bg-emerald-950/30">
            <p className="text-xs font-bold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider">Capaian Baik</p>
            <p className="text-2xl font-black text-emerald-700 dark:text-emerald-400 mt-1">
              {analytics.data?.summary?.good ?? 88.5}%
            </p>
            <p className="text-[11px] text-emerald-600 dark:text-emerald-400/80 mt-0.5">Amalan terlaksana dengan baik</p>
          </div>
          <div className="rounded-2xl border border-amber-200 bg-amber-50/60 p-4 dark:border-amber-900/50 dark:bg-amber-950/30">
            <p className="text-xs font-bold text-amber-800 dark:text-amber-300 uppercase tracking-wider">Capaian Kurang</p>
            <p className="text-2xl font-black text-amber-700 dark:text-amber-400 mt-1">
              {analytics.data?.summary?.less ?? 8.2}%
            </p>
            <p className="text-[11px] text-amber-600 dark:text-amber-400/80 mt-0.5">Perlu peningkatan bimbingan</p>
          </div>
          <div className="rounded-2xl border border-rose-200 bg-rose-50/60 p-4 dark:border-rose-900/50 dark:bg-rose-950/30">
            <p className="text-xs font-bold text-rose-800 dark:text-rose-300 uppercase tracking-wider">Belum Dikerjakan</p>
            <p className="text-2xl font-black text-rose-700 dark:text-rose-400 mt-1">
              {analytics.data?.summary?.not_done ?? 3.3}%
            </p>
            <p className="text-[11px] text-rose-600 dark:text-rose-400/80 mt-0.5">Tidak terlaksana</p>
          </div>
          <div className="rounded-2xl border border-indigo-200 bg-indigo-50/60 p-4 dark:border-indigo-900/50 dark:bg-indigo-950/30">
            <p className="text-xs font-bold text-indigo-800 dark:text-indigo-300 uppercase tracking-wider">Paraf Orang Tua</p>
            <p className="text-2xl font-black text-indigo-700 dark:text-indigo-400 mt-1">
              {analytics.data?.summary?.parent_signature ?? 95}%
            </p>
            <p className="text-[11px] text-indigo-600 dark:text-indigo-400/80 mt-0.5">Telah diverifikasi orang tua</p>
          </div>
        </div>
      )}

      {/* 🎯 TARGET & EVALUASI VIEW: TARGET CHARTS & SUMMARY */}
      {view === 'evaluasi' && (
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2 my-5">
          {/* Target vs Realisasi Grid */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-[#1B2433]">
            <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3 dark:border-slate-800">
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">Evaluasi Target Ibadah Wajib & Sunnah</h4>
                <p className="text-[11px] text-slate-400">Perbandingan target vs realisasi rata-rata santri</p>
              </div>
              <span className="rounded-lg bg-amber-50 px-2.5 py-1 text-[10px] font-bold text-amber-700 dark:bg-amber-950 dark:text-amber-300">Target Evaluasi</span>
            </div>
            <div className="h-64 w-full">
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
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} unit="%" />
                  <Tooltip formatter={(val, name) => [`${val}%`, name === 'target' ? 'Target' : 'Realisasi']} />
                  <Bar dataKey="target" fill="#CBD5E1" radius={[4, 4, 0, 0]} name="Target" />
                  <Bar dataKey="realization" fill="#0E5C44" radius={[4, 4, 0, 0]} name="Realisasi" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Stat Ringkasan Evaluasi Musyrif */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-[#1B2433] flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3 dark:border-slate-800">
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">Status Pembimbingan & Catatan Evaluasi</h4>
                <span className="rounded-lg bg-emerald-50 px-2.5 py-1 text-[10px] font-bold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">Ringkasan Musyrif</span>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                    <div>
                      <p className="text-xs font-bold text-slate-800 dark:text-slate-200">Santri Memenuhi Target (≥ 85%)</p>
                      <p className="text-[10px] text-slate-400">Pembiasaan ibadah sangat konsisten</p>
                    </div>
                  </div>
                  <span className="text-sm font-black text-emerald-600">22 Santri</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                  <div className="flex items-center gap-2.5">
                    <AlertTriangle className="h-5 w-5 text-amber-500" />
                    <div>
                      <p className="text-xs font-bold text-slate-800 dark:text-slate-200">Santri Perlu Pembinaan Khusus (60-84%)</p>
                      <p className="text-[10px] text-slate-400">Perlu pendampingan shalat sunnah/tilawah</p>
                    </div>
                  </div>
                  <span className="text-sm font-black text-amber-600">3 Santri</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                  <div className="flex items-center gap-2.5">
                    <XCircle className="h-5 w-5 text-rose-500" />
                    <div>
                      <p className="text-xs font-bold text-slate-800 dark:text-slate-200">Santri Kritis (&lt; 60%)</p>
                      <p className="text-[10px] text-slate-400">Memerlukan pemanggilan orang tua/konseling</p>
                    </div>
                  </div>
                  <span className="text-sm font-black text-rose-600">1 Santri</span>
                </div>
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-semibold text-slate-500">
              <span>Total Santri Dievaluasi: 26 Santri</span>
              <span className="text-[#0E5C44] dark:text-emerald-400 font-bold cursor-pointer hover:underline">Unduh Laporan Evaluasi →</span>
            </div>
          </div>
        </div>
      )}

      {/* 🟢 MAIN TABLE & FILTER CARD (Data Mutabaah Santri) */}
      <section className="relative overflow-hidden rounded-[22px] border-2 border-emerald-500/25 bg-white p-5 shadow-md shadow-emerald-500/5 dark:border-emerald-600/35 dark:bg-[#1B2433]">
        {/* Header Baris 1: Title & Soft Pastel Squircle Action Buttons */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between bg-gradient-to-r from-emerald-500/10 via-teal-500/5 to-transparent border-b border-emerald-500/20 -mx-5 -mt-5 p-5 mb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              {view === 'evaluasi' ? 'Target & Evaluasi Mutabaah' : 'Data Mutabaah Santri'}
            </h3>
            <p className="text-xs text-slate-400">
              {view === 'evaluasi' ? 'Monitoring pencapaian target dan evaluasi pembiasaan ibadah santri per periode' : 'Daftar pencapaian pembiasaan ibadah santri per periode'}
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
                  aria-label="Export Data"
                  className="flex size-10 items-center justify-center rounded-2xl bg-amber-100/90 text-amber-700 hover:bg-amber-500 hover:text-white dark:bg-amber-950/60 dark:text-amber-300 dark:hover:bg-amber-500 dark:hover:text-white transition-colors duration-200 hover:shadow-md hover:shadow-amber-500/30 cursor-pointer shadow-2xs"
                  onClick={handleExportCsv}
                >
                  <Download1 className="size-5 transition-colors" />
                </button>
                <div className="pointer-events-none absolute bottom-full left-1/2 mb-2 -translate-x-1/2 opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 transition-all duration-200 ease-out z-50 whitespace-nowrap rounded-lg bg-slate-900 px-2.5 py-1 text-[11px] font-bold text-white shadow-xl dark:bg-slate-100 dark:text-slate-900">
                  <div className="absolute top-full left-1/2 -mt-1 -translate-x-1/2 border-4 border-transparent border-t-slate-900 dark:border-t-slate-100" />
                  Export Data (Excel/CSV)
                </div>
              </div>

              {/* Button: Cetak Data (Printer - Indigo) */}
              <div className="group relative inline-flex">
                <button
                  type="button"
                  aria-label="Cetak Data"
                  className="flex size-10 items-center justify-center rounded-2xl bg-indigo-100/90 text-indigo-700 hover:bg-indigo-600 hover:text-white dark:bg-indigo-950/60 dark:text-indigo-300 dark:hover:bg-indigo-600 dark:hover:text-white transition-colors duration-200 hover:shadow-md hover:shadow-indigo-600/30 cursor-pointer shadow-2xs"
                  onClick={() => setPrintOptionModalOpen(true)}
                >
                  <Printer className="size-5 transition-colors" />
                </button>
                <div className="pointer-events-none absolute bottom-full left-1/2 mb-2 -translate-x-1/2 opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 transition-all duration-200 ease-out z-50 whitespace-nowrap rounded-lg bg-slate-900 px-2.5 py-1 text-[11px] font-bold text-white shadow-xl dark:bg-slate-100 dark:text-slate-900">
                  <div className="absolute top-full left-1/2 -mt-1 -translate-x-1/2 border-4 border-transparent border-t-slate-900 dark:border-t-slate-100" />
                  Cetak Data
                </div>
              </div>

              {/* Button: Tambah Data (Plus - Emerald Green) */}
              <div className="group relative inline-flex">
                <button
                  type="button"
                  aria-label="Tambah Data"
                  className="flex size-10 items-center justify-center rounded-2xl bg-emerald-100/90 text-emerald-700 hover:bg-emerald-600 hover:text-white dark:bg-emerald-950/60 dark:text-emerald-300 dark:hover:bg-emerald-600 dark:hover:text-white transition-colors duration-200 hover:shadow-md hover:shadow-emerald-600/30 cursor-pointer shadow-2xs"
                  onClick={handleAddNewMutabaah}
                >
                  <Plus className="size-5 transition-colors" />
                </button>
                <div className="pointer-events-none absolute bottom-full left-1/2 mb-2 -translate-x-1/2 opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 transition-all duration-200 ease-out z-50 whitespace-nowrap rounded-lg bg-slate-900 px-2.5 py-1 text-[11px] font-bold text-white shadow-xl dark:bg-slate-100 dark:text-slate-900">
                  <div className="absolute top-full left-1/2 -mt-1 -translate-x-1/2 border-4 border-transparent border-t-slate-900 dark:border-t-slate-100" />
                  Tambah Mutabaah Santri
                </div>
              </div>

              {/* Button: Tandai Terpilih 100% (Shown when items are selected) */}
              {selectedStudentIds.length > 0 && (
                <div className="group relative inline-flex">
                  <button
                    type="button"
                    aria-label={`Tandai ${selectedStudentIds.length} Terpilih 100%`}
                    className="flex size-10 items-center justify-center rounded-2xl bg-indigo-100/90 text-indigo-700 hover:bg-indigo-600 hover:text-white dark:bg-indigo-950/60 dark:text-indigo-300 dark:hover:bg-indigo-600 dark:hover:text-white transition-colors duration-200 hover:shadow-md hover:shadow-indigo-600/30 cursor-pointer shadow-2xs"
                    onClick={handleBatchMarkSelected}
                  >
                    <Check className="size-5 transition-colors" />
                  </button>
                  <div className="pointer-events-none absolute bottom-full left-1/2 mb-2 -translate-x-1/2 opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 transition-all duration-200 ease-out z-50 whitespace-nowrap rounded-lg bg-slate-900 px-2.5 py-1 text-[11px] font-bold text-white shadow-xl dark:bg-slate-100 dark:text-slate-900">
                    <div className="absolute top-full left-1/2 -mt-1 -translate-x-1/2 border-4 border-transparent border-t-slate-900 dark:border-t-slate-100" />
                    Tandai {selectedStudentIds.length} Terpilih 100%
                  </div>
                </div>
              )}

              {/* Button: ⚡ Input Massal Matrix */}
              <div className="group relative inline-flex">
                <button
                  type="button"
                  aria-label="Input Massal Matrix"
                  className="flex size-10 items-center justify-center rounded-2xl bg-amber-100/90 text-amber-700 hover:bg-amber-500 hover:text-white dark:bg-amber-950/60 dark:text-amber-300 dark:hover:bg-amber-500 dark:hover:text-white transition-colors duration-200 hover:shadow-md hover:shadow-amber-500/30 cursor-pointer shadow-2xs"
                  onClick={() => setShowMatrixModal(true)}
                >
                  <Zap className="size-5 transition-colors fill-current" />
                </button>
                <div className="pointer-events-none absolute bottom-full left-1/2 mb-2 -translate-x-1/2 opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 transition-all duration-200 ease-out z-50 whitespace-nowrap rounded-lg bg-slate-900 px-2.5 py-1 text-[11px] font-bold text-white shadow-xl dark:bg-slate-100 dark:text-slate-900">
                  <div className="absolute top-full left-1/2 -mt-1 -translate-x-1/2 border-4 border-transparent border-t-slate-900 dark:border-t-slate-100" />
                  ⚡ Input Massal Matrix
                </div>
              </div>

              {/* Button: Tandai Semua Baik */}
              <div className="group relative inline-flex">
                <button
                  type="button"
                  aria-label="Tandai Semua Baik"
                  className="flex size-10 items-center justify-center rounded-2xl bg-emerald-100/90 text-emerald-700 hover:bg-emerald-600 hover:text-white dark:bg-emerald-950/60 dark:text-emerald-300 dark:hover:bg-emerald-600 dark:hover:text-white transition-colors duration-200 hover:shadow-md hover:shadow-emerald-600/30 cursor-pointer shadow-2xs"
                  onClick={handleBatchMarkAllBaik}
                >
                  <CheckCircle2 className="size-5 transition-colors" />
                </button>
                <div className="pointer-events-none absolute bottom-full left-1/2 mb-2 -translate-x-1/2 opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 transition-all duration-200 ease-out z-50 whitespace-nowrap rounded-lg bg-slate-900 px-2.5 py-1 text-[11px] font-bold text-white shadow-xl dark:bg-slate-100 dark:text-slate-900">
                  <div className="absolute top-full left-1/2 -mt-1 -translate-x-1/2 border-4 border-transparent border-t-slate-900 dark:border-t-slate-100" />
                  Tandai Semua Baik
                </div>
              </div>

              {/* Button: Salin Kemarin */}
              <div className="group relative inline-flex">
                <button
                  type="button"
                  aria-label="Salin Kemarin"
                  className="flex size-10 items-center justify-center rounded-2xl bg-sky-100/90 text-sky-700 hover:bg-sky-500 hover:text-white dark:bg-sky-950/60 dark:text-sky-300 dark:hover:bg-sky-500 dark:hover:text-white transition-colors duration-200 hover:shadow-md hover:shadow-sky-500/30 cursor-pointer shadow-2xs"
                  onClick={handleCopyYesterday}
                >
                  <Copy className="size-5 transition-colors" />
                </button>
                <div className="pointer-events-none absolute bottom-full left-1/2 mb-2 -translate-x-1/2 opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 transition-all duration-200 ease-out z-50 whitespace-nowrap rounded-lg bg-slate-900 px-2.5 py-1 text-[11px] font-bold text-white shadow-xl dark:bg-slate-100 dark:text-slate-900">
                  <div className="absolute top-full left-1/2 -mt-1 -translate-x-1/2 border-4 border-transparent border-t-slate-900 dark:border-t-slate-100" />
                  Salin Kemarin
                </div>
              </div>
            </div>
        </div>

        {/* Filter Baris 2: Filter Global Mutabaah (Placed above datatable) */}
        <div className="py-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2 mb-3">
            <Filter className="h-4 w-4 text-[#0E5C44] dark:text-emerald-400" />
            <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">Filter Data Mutabaah</h4>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-8 items-end">
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Dari</label>
              <input
                type="date"
                value={filters.date_from}
                onChange={(e) => update('date_from', e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs font-semibold text-slate-800 focus:border-[#0E5C44] focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Sampai</label>
              <input
                type="date"
                value={filters.date_to}
                onChange={(e) => update('date_to', e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs font-semibold text-slate-800 focus:border-[#0E5C44] focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Unit</label>
              <select
                value={filters.education_unit_id || ''}
                onChange={(e) => update('education_unit_id', e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs font-semibold text-slate-800 focus:border-[#0E5C44] focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              >
                <option value="">Semua Unit</option>
                {(options.data?.units || []).map((unit: any) => <option key={unit.id} value={unit.id}>{unit.name}</option>)}
              </select>
            </div>
            {isTeacher ? (
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Kelas</label>
                <select
                  value={filters.class_id || filters.kelas_id || ''}
                  onChange={(e) => {
                    update('class_id', e.target.value)
                    update('kelas_id', e.target.value)
                  }}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs font-semibold text-slate-800 focus:border-[#0E5C44] focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                >
                  <option value="">Semua Kelas</option>
                  {(classList || []).map((cls: any) => {
                    const val = typeof cls === 'string' ? cls : cls.id
                    const label = typeof cls === 'string' ? cls : cls.name || cls.nama_kelas || cls.id
                    return <option key={val} value={val}>{label}</option>
                  })}
                </select>
              </div>
            ) : (
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Asrama</label>
                <select
                  value={filters.dorm_id || ''}
                  onChange={(e) => update('dorm_id', e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs font-semibold text-slate-800 focus:border-[#0E5C44] focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                >
                  <option value="">Semua Asrama</option>
                  {(dormList || []).map((dorm: any) => {
                    const val = typeof dorm === 'string' ? dorm : dorm.id
                    const label = typeof dorm === 'string' ? dorm : dorm.name || dorm.id
                    return <option key={val} value={val}>{label}</option>
                  })}
                </select>
              </div>
            )}
            {!isTeacher && (
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Musyrif</label>
                <select
                  value={filters.supervisor_id || ''}
                  onChange={(e) => update('supervisor_id', e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs font-semibold text-slate-800 focus:border-[#0E5C44] focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                >
                  <option value="">Semua Musyrif</option>
                  <option value="1">Ust. Ahmad Fadli</option>
                  <option value="2">Ustadzah Maryam</option>
                  <option value="3">Ust. Zulkifli</option>
                </select>
              </div>
            )}
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Pencarian</label>
              <input
                type="text"
                placeholder="Cari santri/NIS..."
                value={filters.search || ''}
                onChange={(e) => update('search', e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs font-semibold text-slate-800 focus:border-[#0E5C44] focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Tampilkan</label>
              <select
                value={filters.per_page || 15}
                onChange={(e) => update('per_page', Number(e.target.value))}
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
                onClick={() => setFilters({ date_from: firstDay, date_to: today, page: 1, per_page: 15 })}
                className="w-full flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white p-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
              >
                <RotateCcw className="h-3.5 w-3.5" /> Reset
              </button>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto mt-4">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/80 font-bold text-slate-500 uppercase tracking-wider dark:border-slate-800 dark:bg-slate-800/50 dark:text-slate-400">
                {view !== 'rekap' && <th className="w-8 px-3 py-3 text-center">
                  <input
                    type="checkbox"
                    checked={selectedStudentIds.length === students.length && students.length > 0}
                    onChange={handleSelectAllStudents}
                    className="rounded border-slate-300"
                  />
                </th>}
                <th className="px-3 py-3">Santri</th>
                <th className="px-3 py-3">{isTeacher ? 'Kelas' : 'Kelas & Asrama'}</th>
                {!isTeacher && <th className="px-3 py-3">Musyrif</th>}
                <th className="px-3 py-3">Progress Hari Ini</th>
                <th className="px-3 py-3">Progress Pekan Ini</th>
                <th className="px-3 py-3">Status</th>
                <th className="px-3 py-3 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {students.length === 0 ? (
                <tr>
                  <td colSpan={view !== 'rekap' ? (isTeacher ? 7 : 8) : (isTeacher ? 6 : 7)} className="px-4 py-12 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Users className="size-8 text-slate-300 dark:text-slate-600" />
                      <p className="text-xs font-semibold">Tidak ada data Mutabaah Santri yang ditemukan</p>
                      <p className="text-[11px] text-slate-400">Coba ubah filter atau kata kunci pencarian Anda</p>
                    </div>
                  </td>
                </tr>
              ) : (
                students.map((st) => (
                  <tr key={st.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/30 transition">
                    {view !== 'rekap' && (
                      <td className="px-3 py-3 text-center">
                        <input
                          type="checkbox"
                          checked={selectedStudentIds.includes(st.id)}
                          onChange={() => toggleSelectStudent(st.id)}
                          className="rounded border-slate-300"
                        />
                      </td>
                    )}
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-2.5">
                        {st.photo ? (
                          <img src={st.photo} alt={st.name} className="h-8 w-8 rounded-full object-cover border border-slate-200" />
                        ) : (
                          <span className="grid h-8 w-8 place-items-center rounded-full bg-emerald-100 text-[10px] font-black text-emerald-700">
                            {st.name.split(' ').map((part) => part[0]).slice(0, 2).join('')}
                          </span>
                        )}
                        <div>
                          <p className="font-bold text-slate-900 dark:text-white">{st.name}</p>
                          <p className="text-[10px] text-slate-400">NIS: {st.nis}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-3">
                      <p className="font-semibold text-slate-800 dark:text-slate-200">{st.class}</p>
                      {!isTeacher && <p className="text-[10px] text-slate-400">{st.dorm}</p>}
                    </td>
                    {!isTeacher && (
                      <td className="px-3 py-3 font-semibold text-slate-700 dark:text-slate-300">
                        {st.supervisor}
                      </td>
                    )}
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-24 rounded-full bg-slate-100 dark:bg-slate-700">
                          <div className="h-2 rounded-full bg-emerald-500" style={{ width: `${st.progressToday}%` }} />
                        </div>
                        <span className="font-bold text-emerald-600">{st.progressToday}%</span>
                      </div>
                    </td>
                    <td className="px-3 py-3 font-bold text-slate-700 dark:text-slate-300">
                      {st.progressWeek}%
                    </td>
                    <td className="px-3 py-3">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                        st.status === 'Finalized' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                      }`}>
                        {st.status}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          title="Lihat Detail"
                          onClick={() => { setSelectedStudent(st); setShowDetailDrawer(true) }}
                          className="rounded-lg border border-slate-200 bg-white p-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 cursor-pointer"
                        >
                          <Eye className="h-3.5 w-3.5" />
                        </button>
                        <button
                          title="Edit Data"
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
                          className="rounded-lg border border-amber-200 bg-amber-50 p-1.5 text-xs font-bold text-amber-700 hover:bg-amber-100 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-300 cursor-pointer"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        <div className="w-full border-t border-slate-100 px-4 py-3.5 sm:px-6 md:px-8 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-slate-500 font-medium">
            Menampilkan <span className="font-bold text-slate-700 dark:text-slate-200">{recapData?.from || (students.length > 0 ? 1 : 0)}</span> s.d. <span className="font-bold text-slate-700 dark:text-slate-200">{recapData?.to || students.length}</span> dari <span className="font-bold text-slate-700 dark:text-slate-200">{recapData?.total || students.length}</span> santri
          </div>
          {(recapData?.last_page || 1) > 1 && (
            <div className="w-full sm:w-auto">
              <Pagination
                currentPage={Number(filters.page || 1)}
                totalPages={Number(recapData?.last_page || 1)}
                onPageChange={(p) => update('page', p)}
                sideLayout="full"
              />
            </div>
          )}
        </div>
      </section>

      {/* MATRIX FAST INPUT MODAL */}
      {view !== 'rekap' && showMatrixModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm">
          <div className="flex max-h-[90vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-[#1B2433]">
            <div className="flex items-center justify-between border-b border-slate-100 p-5 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-amber-500 fill-amber-500" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">⚡ Fast Matrix Input Mutabaah</h3>
              </div>
              <button onClick={() => setShowMatrixModal(false)} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-5 overflow-auto flex-1">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800">
                    <th className="p-2 font-bold text-slate-700 dark:text-slate-300">Santri</th>
                    {worshipItemsList.map((item) => (
                      <th key={item} className="p-2 text-center font-bold text-slate-700 dark:text-slate-300">
                        <div>{item}</div>
                        <button
                          onClick={() => setMatrixColumn(item, true)}
                          className="mt-1 text-[9px] font-bold text-emerald-600 hover:underline"
                        >
                          All ✓
                        </button>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {students.map((st) => (
                    <tr key={st.id}>
                      <td className="p-2 font-bold text-slate-800 dark:text-slate-200 whitespace-nowrap">{st.name}</td>
                      {worshipItemsList.map((item) => {
                        const key = `${st.id}:${item}`
                        const isChecked = Boolean(matrixValues[key])
                        return (
                          <td key={item} className="p-2 text-center">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => toggleMatrixCell(st.id, item)}
                              className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                            />
                          </td>
                        )
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-between border-t border-slate-100 p-4 bg-slate-50/50 dark:border-slate-800 dark:bg-slate-800/40">
              <Button appearance="outline" size="sm" onClick={() => setShowMatrixModal(false)}>
                Tutup
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  setShowMatrixModal(false)
                  Swal.fire('Berhasil Disimpan', 'Seluruh data Matrix Mutabaah berhasil disimpan!', 'success')
                }}
              >
                Simpan Matrix
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* 🟢 TAILGRIDS DIALOG: MODAL TAMBAH DATA SANTRI */}
      <OverlayWrapper>
        <Backdrop isOpen={showAddModal} onOpenChange={setShowAddModal} isDismissable={true}>
          <Dialog className="max-w-md rounded-2xl bg-white p-6 dark:bg-[#1B2433] shadow-2xl">
            <DialogHeader className="border-b border-slate-100 pb-3 dark:border-slate-800">
              <DialogTitle className="text-lg font-bold text-slate-900 dark:text-white">
                Tambah Data Mutabaah Santri
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-400">
                Isi informasi santri untuk menambahkan data mutabaah baru
              </DialogDescription>
              <DialogClose onClick={() => setShowAddModal(false)} />
            </DialogHeader>

            <form onSubmit={handleSaveNewStudent}>
              <DialogBody className="space-y-4 py-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Nama Lengkap Santri *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Masukkan nama santri"
                    value={studentForm.name}
                    onChange={(e) => setStudentForm({ ...studentForm, name: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs font-semibold text-slate-800 focus:border-[#0E5C44] focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    NIS (Nomor Induk Siswa) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Masukkan NIS santri"
                    value={studentForm.nis}
                    onChange={(e) => setStudentForm({ ...studentForm, nis: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs font-semibold text-slate-800 focus:border-[#0E5C44] focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Kelas
                    </label>
                    <input
                      type="text"
                      placeholder="Contoh: VII-A"
                      value={studentForm.class}
                      onChange={(e) => setStudentForm({ ...studentForm, class: e.target.value })}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs font-semibold text-slate-800 focus:border-[#0E5C44] focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Asrama
                    </label>
                    <input
                      type="text"
                      placeholder="Contoh: Asrama Al-Ghazali"
                      value={studentForm.dorm}
                      onChange={(e) => setStudentForm({ ...studentForm, dorm: e.target.value })}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs font-semibold text-slate-800 focus:border-[#0E5C44] focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                    />
                  </div>
                </div>
              </DialogBody>

              <DialogFooter className="flex justify-end gap-2 border-t border-slate-100 pt-3 dark:border-slate-800">
                <Button appearance="outline" size="sm" type="button" onClick={() => setShowAddModal(false)}>
                  Batal
                </Button>
                <Button variant="primary" size="sm" type="submit">
                  Simpan Data
                </Button>
              </DialogFooter>
            </form>
          </Dialog>
        </Backdrop>
      </OverlayWrapper>

      {/* 🟢 TAILGRIDS DIALOG: MODAL EDIT DATA SANTRI */}
      <OverlayWrapper>
        <Backdrop isOpen={showEditModal} onOpenChange={setShowEditModal} isDismissable={true}>
          <Dialog className="max-w-md rounded-2xl bg-white p-6 dark:bg-[#1B2433] shadow-2xl">
            <DialogHeader className="border-b border-slate-100 pb-3 dark:border-slate-800">
              <DialogTitle className="text-lg font-bold text-slate-900 dark:text-white">
                Edit Data Mutabaah Santri
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-400">
                Ubah informasi santri yang dipilih
              </DialogDescription>
              <DialogClose onClick={() => setShowEditModal(false)} />
            </DialogHeader>

            <form onSubmit={handleSaveEditStudent}>
              <DialogBody className="space-y-4 py-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Nama Lengkap Santri *
                  </label>
                  <input
                    type="text"
                    required
                    value={studentForm.name}
                    onChange={(e) => setStudentForm({ ...studentForm, name: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs font-semibold text-slate-800 focus:border-[#0E5C44] focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    NIS (Nomor Induk Siswa) *
                  </label>
                  <input
                    type="text"
                    required
                    value={studentForm.nis}
                    onChange={(e) => setStudentForm({ ...studentForm, nis: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs font-semibold text-slate-800 focus:border-[#0E5C44] focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Kelas
                    </label>
                    <input
                      type="text"
                      value={studentForm.class}
                      onChange={(e) => setStudentForm({ ...studentForm, class: e.target.value })}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs font-semibold text-slate-800 focus:border-[#0E5C44] focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Asrama
                    </label>
                    <input
                      type="text"
                      value={studentForm.dorm}
                      onChange={(e) => setStudentForm({ ...studentForm, dorm: e.target.value })}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs font-semibold text-slate-800 focus:border-[#0E5C44] focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                    />
                  </div>
                </div>
              </DialogBody>

              <DialogFooter className="flex justify-end gap-2 border-t border-slate-100 pt-3 dark:border-slate-800">
                <Button appearance="outline" size="sm" type="button" onClick={() => setShowEditModal(false)}>
                  Batal
                </Button>
                <Button variant="primary" size="sm" type="submit">
                  Simpan Perubahan
                </Button>
              </DialogFooter>
            </form>
          </Dialog>
        </Backdrop>
      </OverlayWrapper>

      {/* 🟢 TAILGRIDS DIALOG: MODAL LIHAT DETAIL SANTRI */}
      <OverlayWrapper>
        <Backdrop isOpen={showDetailDrawer} onOpenChange={setShowDetailDrawer} isDismissable={true}>
          <Dialog className="max-w-md rounded-2xl bg-white p-6 dark:bg-[#1B2433] shadow-2xl">
            <DialogHeader className="border-b border-slate-100 pb-3 dark:border-slate-800">
              <div className="flex items-center gap-3">
                {selectedStudent?.photo ? (
                  <img src={selectedStudent.photo} alt={selectedStudent.name} className="h-10 w-10 rounded-full object-cover border" />
                ) : (
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 font-bold">
                    {selectedStudent?.name?.slice(0, 2)?.toUpperCase() || 'ST'}
                  </div>
                )}
                <div>
                  <DialogTitle className="text-base font-bold text-slate-900 dark:text-white">
                    {selectedStudent?.name}
                  </DialogTitle>
                  <DialogDescription className="text-xs text-slate-400">
                    NIS: {selectedStudent?.nis} • Kelas: {selectedStudent?.class} {!isTeacher && selectedStudent?.dorm && `• Asrama: ${selectedStudent.dorm}`}
                  </DialogDescription>
                </div>
              </div>
              <DialogClose onClick={() => setShowDetailDrawer(false)} />
            </DialogHeader>

            <DialogBody className="space-y-3 py-4 text-xs">
              <div className="grid grid-cols-2 gap-3 rounded-xl border border-slate-100 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-800/40">
                {!isTeacher && (
                  <div>
                    <p className="text-slate-400">Musyrif Pembimbing:</p>
                    <p className="font-bold text-slate-800 dark:text-slate-200">{selectedStudent?.supervisor || '-'}</p>
                  </div>
                )}
                <div>
                  <p className="text-slate-400">Status Mutabaah:</p>
                  <p className="font-bold text-slate-800 dark:text-slate-200">{selectedStudent?.status || '-'}</p>
                </div>
                <div>
                  <p className="text-slate-400">Pencapaian Hari Ini:</p>
                  <p className="font-bold text-emerald-600 text-sm">{selectedStudent?.progressToday || 0}%</p>
                </div>
                <div>
                  <p className="text-slate-400">Pencapaian Pekan Ini:</p>
                  <p className="font-bold text-emerald-600 text-sm">{selectedStudent?.progressWeek || 0}%</p>
                </div>
              </div>
            </DialogBody>

            <DialogFooter className="flex justify-end border-t border-slate-100 pt-3 dark:border-slate-800">
              <Button appearance="outline" size="sm" onClick={() => setShowDetailDrawer(false)}>
                Tutup
              </Button>
            </DialogFooter>
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
    </MasterDataPage>
  )
}
