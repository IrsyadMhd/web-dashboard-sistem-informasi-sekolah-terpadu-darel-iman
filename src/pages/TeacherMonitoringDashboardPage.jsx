import React, { useState, useEffect, useMemo } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import {
  Calendar,
  Users,
  BookOpen,
  FileCheck,
  CheckCircle2,
  Clock,
  AlertCircle,
  ArrowRight,
  TrendingUp,
  FileText,
  Award,
  CalendarDays,
  RefreshCw,
  Sparkles,
  ExternalLink,
  ChevronRight,
  GraduationCap,
  Layers,
  HeartHandshake,
  CheckCircle,
  Bell,
  MessageSquare,
  ShieldCheck,
  Building2,
  BookmarkCheck,
  Heart,
  Copy,
  Check,
} from 'lucide-react'
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
} from 'recharts'

import api from '../services/api'
import { equranService } from '../services/equranService'
import { useAuthStore } from '../stores/authStore'
import { usePengaturanStore } from '../stores/pengaturanStore'
import { resolveFoundationName } from '../utils/printHelper'

// TailGrids Core UI Components
import { Button } from '@/components/tailgrids/core/button'
import { Badge } from '@/components/tailgrids/core/badge'
import { Alert, AlertTitle, AlertDescription } from '@/components/tailgrids/core/alert'

// Doa & Dzikir Harian Standar Pendidik
const DEFAULT_TEACHER_DOAS = [
  {
    id: 'doa-belajar',
    nama: 'Doa Sebelum Belajar & Memohon Tambahan Ilmu',
    grup: 'Doa Pembelajaran',
    ar: 'رَبِّ زِدْنِي عِلْمًا وَارْزُقْنِي فَهْمًا',
    tr: "Rabbi zidnii 'ilman warzuqnii fahman",
    idn: 'Ya Rabb-ku, tambahkanlah kepadaku ilmu pengetahuan, dan berilah aku rezeki pemahaman yang baik.',
    tentang: 'Dibaca guru dan siswa sebelum memulai proses KBM agar ilmu yang diajarkan berkah dan mudah diserap.',
    tag: 'KBM Harian',
  },
  {
    id: 'sayyidul-istighfar',
    nama: 'Sayyidul Istighfar (Dzikir Pagi & Petang)',
    grup: 'Dzikir Pagi & Petang',
    ar: 'اللَّهُمَّ أَنْتَ رَبِّي لَا إِلَهَ إِلَّا أَنْتَ خَلَقْتَنِي وَأَنَا عَبْدُكَ وَأَنَا عَلَى عَهْدِكَ وَوَعْدِكَ مَا اسْتَطَعْتُ أَعُوذُ بِكَ مِنْ شَرِّ مَا صَنَعْتُ أَبُوءُ لَكَ بِنِعْمَتِكَ عَلَيَّ وَأَبُوءُ بِذَنْبِي فَاغْفِرْ لِي فَإِنَّهُ لَا يَغْفِرُ الذُّنُوبَ إِلَّا أَنْتَ',
    tr: "Allahumma anta rabbii laa ilaaha illaa anta khalaqtanii wa ana 'abduka wa ana 'alaa 'ahdika wa wa'dika mastatha'tu, a'uudzu bika min syarri maa shana'tu, abu'u laka bini'matika 'alayya wa abu'u bidzanbii faghfir lii fainnahu laa yaghfirudz-dzunuuba illaa anta.",
    idn: 'Ya Allah, Engkaulah Rabb-ku, tiada Tuhan yang berhak disembah selain Engkau. Engkaulah yang menciptakanku dan aku adalah hamba-Mu. Aku senantiasa setia pada perjanjian-Mu semampuku. Aku berlindung dari keburukan yang kuperbuat. Aku mengakui nikmat-Mu dan dosaku, maka ampunilah aku.',
    tentang: 'Penghulu istighfar harian pendidik. Barangsiapa membacanya di pagi hari lalu meninggal sebelum petang, ia termasuk ahli surga (HR. Bukhari).',
    tag: 'Dzikir Harian',
  },
  {
    id: 'doa-kafaratul-majelis',
    nama: 'Doa Penutup Majelis (Kafaratul Majelis)',
    grup: 'Doa Penutup',
    ar: 'سُبْحَانَكَ اللَّهُمَّ وَبِحَمْدِكَ، أَشْهَدُ أَنْ لاَ إِلَهَ إِلاَّ أَنْتَ، أَسْتَغْفِرُكَ وَأَتُوبُ إِلَيْكَ',
    tr: 'Subhaanakallaahumma wa bihamdika, asyhadu allaa ilaaha illaa anta, astaghfiruka wa atuubu ilaik.',
    idn: 'Maha Suci Engkau ya Allah, dan dengan memuji-Mu aku bersaksi bahwa tidak ada sesembahan yang berhak disembah selain Engkau, aku memohon ampunan kepada-Mu dan bertaubat kepada-Mu.',
    tentang: 'Dibaca setiap selesai sesi KBM di kelas atau rapat majelis guru untuk melebur dosa dan kelalaian selama sesi.',
    tag: 'Penutup KBM',
  },
]

export default function TeacherMonitoringDashboardPage() {
  const navigate = useNavigate()
  const user = useAuthStore((state) => state.user)
  const pengaturan = usePengaturanStore((state) => state.pengaturan)
  const foundationName = resolveFoundationName(pengaturan)
  
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState(null)
  const [dashboardData, setDashboardData] = useState(null)
  const [currentTime, setCurrentTime] = useState(new Date())

  // State Doa & Dzikir Harian Pendidik
  const [selectedDoaIdx, setSelectedDoaIdx] = useState(0)
  const [copiedDoa, setCopiedDoa] = useState(false)
  const [doaCollection, setDoaCollection] = useState(DEFAULT_TEACHER_DOAS)

  // Fetch Doa dinamis dari backend equranService
  useEffect(() => {
    let isMounted = true
    equranService.getDoas({ per_page: 8 })
      .then((res) => {
        if (!isMounted) return
        if (res?.data && Array.isArray(res.data) && res.data.length > 0) {
          const apiItems = res.data.slice(0, 4).map((item) => ({
            id: item.id,
            nama: item.nama,
            grup: item.grup || 'Doa Harian',
            ar: item.ar || '',
            tr: item.tr || '',
            idn: item.idn || '',
            tentang: item.tentang || '',
            tag: item.tag || 'Katalog Doa',
          }))
          setDoaCollection((prev) => {
            const names = new Set(prev.map((p) => p.nama))
            const filtered = apiItems.filter((p) => !names.has(p.nama))
            return [...prev, ...filtered]
          })
        }
      })
      .catch((err) => {
        console.warn('Menggunakan doa standar pendidik:', err)
      })
    return () => {
      isMounted = false
    }
  }, [])

  const handleCopyDoa = (text) => {
    if (!text) return
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(text)
      setCopiedDoa(true)
      setTimeout(() => setCopiedDoa(false), 2000)
    }
  }

  // Update clock every minute
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000)
    return () => clearInterval(timer)
  }, [])

  const fetchDashboardData = async (isManual = false) => {
    if (isManual) setRefreshing(true)
    else setLoading(true)
    setError(null)
    try {
      const res = await api.get('/teacher/dashboard')
      if (res.data?.success && res.data?.data) {
        setDashboardData(res.data.data)
      } else {
        setError('Gagal memuat data statistik dashboard guru.')
      }
    } catch (err) {
      console.error('Failed to fetch teacher dashboard data:', err)
      setError(err?.response?.data?.message || 'Terjadi kesalahan saat memuat data dashboard.')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const teacher = dashboardData?.teacher || {}
  const academicContext = dashboardData?.academic_context || {}
  const kpis = dashboardData?.kpi || {}
  const schedulesToday = dashboardData?.schedules_today || []
  const announcements = dashboardData?.announcements || []
  const teacherLogs = dashboardData?.teacher_attendance_logs || []

  // Check today's teacher check-in status from logs
  const todayLog = useMemo(() => {
    const todayStr = new Date().toISOString().split('T')[0]
    return teacherLogs.find((l) => l.date === todayStr) || null
  }, [teacherLogs])

  // Chart Data: Attendance Real distribution or empty state
  const attendanceChartData = useMemo(() => {
    if (dashboardData?.attendance_trend && Array.isArray(dashboardData.attendance_trend)) {
      return dashboardData.attendance_trend
    }
    if (dashboardData?.charts?.attendance_trend && Array.isArray(dashboardData.charts.attendance_trend)) {
      return dashboardData.charts.attendance_trend
    }
    if (Array.isArray(teacherLogs) && teacherLogs.length > 0) {
      const dayMap = {}
      teacherLogs.forEach((l) => {
        const d = l.day || l.hari || (l.date ? new Date(l.date).toLocaleDateString('id-ID', { weekday: 'long' }) : 'Hari Ini')
        if (!dayMap[d]) dayMap[d] = { name: d, hadir: 0, sakit: 0, izin: 0, alpa: 0 }
        const st = String(l.status || '').toLowerCase()
        if (st.includes('hadir')) dayMap[d].hadir++
        else if (st.includes('sakit')) dayMap[d].sakit++
        else if (st.includes('izin')) dayMap[d].izin++
        else if (st.includes('alpa') || st.includes('alpha')) dayMap[d].alpa++
        else dayMap[d].hadir++
      })
      return Object.values(dayMap)
    }
    return []
  }, [dashboardData, teacherLogs])

  // Chart Data: Assignment Status
  const assignmentStatusData = useMemo(() => {
    const pending = Number(kpis.pending_grading_count || 0)
    const graded = Number(kpis.graded_count || 0)
    if (pending === 0 && graded === 0) return []
    return [
      { name: 'Sudah Dinilai', value: graded, color: '#10B981' },
      { name: 'Perlu Dinilai', value: pending, color: '#F59E0B' },
    ]
  }, [kpis])

  const formattedDate = useMemo(() => {
    return currentTime.toLocaleDateString('id-ID', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
  }, [currentTime])

  const formattedTime = useMemo(() => {
    return currentTime.toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
    })
  }, [currentTime])

  if (loading && !dashboardData) {
    return (
      <div className="min-h-screen bg-slate-50/50 p-6 dark:bg-[#0f172a]/50">
        <div className="mx-auto max-w-7xl space-y-6 animate-pulse">
          <div className="h-44 rounded-3xl bg-slate-200 dark:bg-slate-800" />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-28 rounded-2xl bg-slate-200 dark:bg-slate-800" />
            ))}
          </div>
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="h-96 rounded-3xl bg-slate-200 dark:bg-slate-800 lg:col-span-2" />
            <div className="h-96 rounded-3xl bg-slate-200 dark:bg-slate-800" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50/60 pb-16 pt-3 dark:bg-[#0B1120] text-slate-800 dark:text-slate-100">
      <div className="mx-auto max-w-7xl space-y-6 px-4 sm:px-6 lg:px-8">
        
        {/* Breadcrumb & Navigation */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
            <Link to="/dashboard" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition">Beranda</Link>
            <span>/</span>
            <span className="text-emerald-700 dark:text-emerald-400 font-bold">Dashboard Monitoring Guru</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => fetchDashboardData(true)}
              disabled={refreshing}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 shadow-2xs hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 cursor-pointer transition"
            >
              <RefreshCw className={`h-3.5 w-3.5 text-emerald-600 ${refreshing ? 'animate-spin' : ''}`} />
              <span>{refreshing ? 'Memperbarui...' : 'Segarkan Data'}</span>
            </button>
            <Link
              to="/portal-guru/workspace"
              className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-3.5 py-1.5 text-xs font-bold text-white shadow-xs hover:from-emerald-700 hover:to-teal-700 transition cursor-pointer"
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>Masuk Workspace KBM</span>
            </Link>
          </div>
        </div>

        {error && (
          <Alert status="error" className="rounded-2xl border-rose-300 bg-rose-50 dark:border-rose-800 dark:bg-rose-950/40">
            <AlertCircle className="h-5 w-5 text-rose-600 dark:text-rose-400" />
            <div>
              <AlertTitle className="text-rose-800 dark:text-rose-200">Koneksi Terganggu</AlertTitle>
              <AlertDescription className="text-rose-700 dark:text-rose-300 text-xs mt-0.5">{error}</AlertDescription>
            </div>
          </Alert>
        )}

        {/* 1. TAILGRIDS HERO HEADER: DASHBOARD MONITORING GURU */}
        <div className="relative overflow-hidden rounded-[24px] border-2 border-emerald-500/30 bg-gradient-to-r from-emerald-500/15 via-teal-500/10 to-emerald-600/15 p-6 sm:p-8 shadow-md shadow-emerald-500/10 dark:border-emerald-600/40 dark:bg-gradient-to-r dark:from-emerald-950/70 dark:via-teal-950/50 dark:to-slate-900">
          {/* Multi-tone Ambient Glow */}
          <div className="pointer-events-none absolute -right-16 -top-16 h-72 w-72 rounded-full bg-gradient-to-br from-emerald-400/30 via-teal-300/20 to-transparent blur-3xl dark:from-emerald-600/20" />
          <div className="pointer-events-none absolute -bottom-16 left-1/3 h-64 w-64 rounded-full bg-gradient-to-tr from-teal-500/20 via-emerald-300/15 to-transparent blur-3xl" />

          <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-start gap-4">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700 text-white shadow-lg shadow-emerald-600/30">
                <GraduationCap className="h-8 w-8" />
              </div>
              <div className="space-y-1.5">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-emerald-600 to-teal-600 px-3 py-0.5 text-[11px] font-black uppercase tracking-wider text-white shadow-xs">
                    Dashboard Monitoring Pendidik
                  </span>
                  <span className="rounded-full bg-emerald-100/80 px-2.5 py-0.5 text-[11px] font-bold text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300">
                    Tahun Ajaran {academicContext.academic_year || '2026/2027'} ({academicContext.semester || 'Ganjil'})
                  </span>
                </div>
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                  Ahlan wa Sahlan, {teacher.name || user?.name || 'Ustadz / Ustadzah'}
                </h1>
                <p className="text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-300">
                  {teacher.education_unit || 'Unit Pendidikan Terpadu'} • NIP/NIY: <span className="font-mono font-semibold">{teacher.nip_niy || '-'}</span>
                </p>
              </div>
            </div>

            {/* Quick Status Pill */}
            <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-emerald-500/20 bg-white/70 p-3.5 backdrop-blur-md dark:border-emerald-500/30 dark:bg-slate-800/80 sm:gap-4">
              <div className="flex items-center gap-2.5">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
                  <Clock className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Waktu Sekolah</div>
                  <div className="text-xs font-black text-slate-800 dark:text-slate-100 font-mono">
                    {formattedDate} • {formattedTime} WIB
                  </div>
                </div>
              </div>

              <div className="h-8 w-px bg-slate-200 dark:bg-slate-700" />

              <div className="flex items-center gap-2.5">
                <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${todayLog ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300' : 'bg-amber-500/15 text-amber-700 dark:text-amber-300'}`}>
                  {todayLog ? <CheckCircle2 className="h-5 w-5" /> : <AlertCircle className="h-5 w-5" />}
                </div>
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Presensi Guru</div>
                  <div className="text-xs font-black text-slate-800 dark:text-slate-100">
                    {todayLog ? (todayLog.check_in ? `Hadir (${todayLog.check_in})` : 'Hadir') : 'Belum Check-In'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 2. 5 KARTU KPI STATISTIK RINGKAS */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {/* KPI 1: Jadwal Hari Ini */}
          <div className="relative overflow-hidden rounded-2xl border border-emerald-500/20 bg-white p-4.5 shadow-xs transition hover:shadow-md dark:border-emerald-900/40 dark:bg-slate-800/90">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Jadwal Mengajar</span>
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">
                <Calendar className="h-4.5 w-4.5" />
              </div>
            </div>
            <div className="mt-2.5 flex items-baseline gap-2">
              <span className="text-2xl font-black text-slate-900 dark:text-white">
                {kpis.schedules_today_count || schedulesToday.length || 0}
              </span>
              <span className="text-xs font-semibold text-slate-500">sesi hari ini</span>
            </div>
            <p className="mt-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-medium truncate">
              {kpis.total_classes || 0} Rombel Terbina
            </p>
          </div>

          {/* KPI 2: Siswa Bimbingan */}
          <div className="relative overflow-hidden rounded-2xl border border-teal-500/20 bg-white p-4.5 shadow-xs transition hover:shadow-md dark:border-teal-900/40 dark:bg-slate-800/90">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Siswa Diajar</span>
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-50 text-teal-600 dark:bg-teal-950/60 dark:text-teal-400">
                <Users className="h-4.5 w-4.5" />
              </div>
            </div>
            <div className="mt-2.5 flex items-baseline gap-2">
              <span className="text-2xl font-black text-slate-900 dark:text-white">
                {kpis.total_students || 30}
              </span>
              <span className="text-xs font-semibold text-slate-500">santri aktif</span>
            </div>
            <p className="mt-1 text-[11px] text-teal-600 dark:text-teal-400 font-medium truncate">
              Rata-rata 30 siswa/kelas
            </p>
          </div>

          {/* KPI 3: Tugas Perlu Dinilai */}
          <div className="relative overflow-hidden rounded-2xl border border-amber-500/20 bg-white p-4.5 shadow-xs transition hover:shadow-md dark:border-amber-900/40 dark:bg-slate-800/90">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Tugas Terkumpul</span>
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400">
                <FileCheck className="h-4.5 w-4.5" />
              </div>
            </div>
            <div className="mt-2.5 flex items-baseline gap-2">
              <span className="text-2xl font-black text-amber-600 dark:text-amber-400">
                {kpis.pending_grading_count || 0}
              </span>
              <span className="text-xs font-semibold text-slate-500">perlu koreksi</span>
            </div>
            <p className="mt-1 text-[11px] text-slate-500 font-medium truncate">
              LMS Pengumpulan Tugas
            </p>
          </div>

          {/* KPI 4: Setoran Tahfizh Hari Ini */}
          <div className="relative overflow-hidden rounded-2xl border border-indigo-500/20 bg-white p-4.5 shadow-xs transition hover:shadow-md dark:border-indigo-900/40 dark:bg-slate-800/90">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Setoran Tahfizh</span>
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400">
                <BookmarkCheck className="h-4.5 w-4.5" />
              </div>
            </div>
            <div className="mt-2.5 flex items-baseline gap-2">
              <span className="text-2xl font-black text-slate-900 dark:text-white">
                {kpis.tahfizh_today_count || 0}
              </span>
              <span className="text-xs font-semibold text-slate-500">santri setor</span>
            </div>
            <p className="mt-1 text-[11px] text-indigo-600 dark:text-indigo-400 font-medium truncate">
              Jurnal Tahfizh Harian
            </p>
          </div>

          {/* KPI 5: Mutaba'ah Perlu Verifikasi */}
          <div className="relative overflow-hidden rounded-2xl border border-rose-500/20 bg-white p-4.5 shadow-xs transition hover:shadow-md dark:border-rose-900/40 dark:bg-slate-800/90">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Mutaba'ah Santri</span>
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-50 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400">
                <HeartHandshake className="h-4.5 w-4.5" />
              </div>
            </div>
            <div className="mt-2.5 flex items-baseline gap-2">
              <span className="text-2xl font-black text-rose-600 dark:text-rose-400">
                {kpis.unverified_mutabaah_count || 0}
              </span>
              <span className="text-xs font-semibold text-slate-500">draft verifikasi</span>
            </div>
            <p className="mt-1 text-[11px] text-slate-500 font-medium truncate">
              Amalan Yaumiyyah Santri
            </p>
          </div>
        </div>

        {/* 3. AGENDA HARI INI & PINTASAN WORKSPACE (2 KOLOM GRID) */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          
          {/* Kolom Kiri (2 Kolom): Jadwal & Sesi Pelajaran Hari Ini */}
          <div className="lg:col-span-2 space-y-6">
            <div className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-800/90">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4 dark:border-slate-700/60">
                <div>
                  <h2 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                    <CalendarDays className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                    Jadwal Mengajar Hari Ini
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Daftar jam pelajaran yang ditugaskan kepada Anda pada hari {formattedDate.split(',')[0]}
                  </p>
                </div>
                <Link
                  to="/portal-guru/workspace?tab=jadwal"
                  className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 transition"
                >
                  Lihat Jadwal Lengkap <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>

              <div className="mt-4 space-y-3">
                {schedulesToday.length === 0 ? (
                  <div className="py-10 text-center">
                    <Calendar className="mx-auto h-10 w-10 text-slate-300 dark:text-slate-600" />
                    <p className="mt-2 text-xs font-bold text-slate-600 dark:text-slate-300">
                      Tidak Ada Jadwal Mengajar Hari Ini
                    </p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Anda dapat memeriksa jadwal pekanan atau mempersiapkan modul ajar di Workspace.
                    </p>
                  </div>
                ) : (
                  schedulesToday.map((sch, idx) => {
                    const subjectName = sch.subject?.name || sch.subject?.nama_mapel || 'Mata Pelajaran'
                    const className = sch.kelas?.name || sch.kelas?.nama_kelas || 'Rombel'
                    const timeRange = `${sch.time_start || '08:00'} - ${sch.time_end || '09:20'}`
                    
                    // Simple check if schedule is currently active
                    const [sh, sm] = (sch.time_start || '00:00').split(':').map(Number)
                    const [eh, em] = (sch.time_end || '00:00').split(':').map(Number)
                    const curMin = currentTime.getHours() * 60 + currentTime.getMinutes()
                    const isNow = curMin >= (sh * 60 + sm) && curMin <= (eh * 60 + em)
                    const isPassed = curMin > (eh * 60 + em)

                    return (
                      <div
                        key={sch.id || idx}
                        className={`group relative flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border p-4 transition ${
                          isNow
                            ? 'border-emerald-500/50 bg-gradient-to-r from-emerald-500/10 via-teal-500/5 to-transparent dark:border-emerald-500/60 dark:bg-emerald-950/30 shadow-xs'
                            : isPassed
                            ? 'border-slate-200/60 bg-slate-50/50 dark:border-slate-800 dark:bg-slate-900/40 opacity-75'
                            : 'border-slate-200 bg-white hover:border-emerald-300 dark:border-slate-700/80 dark:bg-slate-800/60'
                        }`}
                      >
                        <div className="flex items-start gap-3.5">
                          <div
                            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl font-bold text-xs ${
                              isNow
                                ? 'bg-emerald-600 text-white shadow-sm'
                                : isPassed
                                ? 'bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-300'
                                : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300'
                            }`}
                          >
                            #{idx + 1}
                          </div>
                          <div>
                            <div className="flex flex-wrap items-center gap-2">
                              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                                {subjectName}
                              </h3>
                              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-700 dark:bg-slate-700 dark:text-slate-200">
                                {className}
                              </span>
                              {isNow && (
                                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500 px-2 py-0.5 text-[10px] font-bold text-white animate-pulse">
                                  Sedang Berlangsung
                                </span>
                              )}
                            </div>
                            <div className="mt-1 flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 font-medium">
                              <span className="flex items-center gap-1 font-mono">
                                <Clock className="h-3.5 w-3.5 text-slate-400" /> {timeRange} WIB
                              </span>
                              <span>•</span>
                              <span>{sch.total_hours || 2} Jam Pelajaran</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            type="button"
                            onClick={() => navigate(`/portal-guru/workspace?tab=presensi&schedule_id=${sch.id}`)}
                            className={`inline-flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-bold transition cursor-pointer ${
                              isNow
                                ? 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm'
                                : 'border border-emerald-500/30 bg-white text-emerald-700 hover:bg-emerald-50 dark:border-slate-700 dark:bg-slate-800 dark:text-emerald-300'
                            }`}
                          >
                            <FileCheck className="h-3.5 w-3.5" />
                            <span>{isNow ? 'Input Presensi Sekarang' : 'Buka Presensi'}</span>
                          </button>
                        </div>
                      </div>
                    )
                  })
                )}
              </div>
            </div>

            {/* Kartu Doa & Dzikir Harian Pendidik (Yaumiyah) */}
            <div className="relative overflow-hidden rounded-3xl border border-emerald-500/30 bg-gradient-to-br from-emerald-500/10 via-teal-500/5 to-white p-5 shadow-xs dark:border-emerald-500/30 dark:bg-slate-800/95">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-emerald-500/20 pb-4 dark:border-emerald-500/20">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-sm shadow-emerald-500/30">
                    <Heart className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-base font-black text-slate-900 dark:text-white">
                        Doa & Dzikir Harian Pendidik
                      </h2>
                      <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-extrabold text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300">
                        Yaumiyah
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      Bimbingan doa berkah sebelum mengajar, dzikir pagi, dan penutup majelis ilmu
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Link
                    to="/dashboard/master-doa"
                    className="inline-flex items-center gap-1 rounded-xl border border-emerald-500/30 bg-white px-3 py-1.5 text-xs font-bold text-emerald-700 hover:bg-emerald-50 dark:border-slate-700 dark:bg-slate-800 dark:text-emerald-300 transition"
                  >
                    <BookOpen className="h-3.5 w-3.5" />
                    Katalog Doa
                  </Link>
                  <Link
                    to="/dashboard/master-quran-surah"
                    className="inline-flex items-center gap-1 rounded-xl bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-emerald-700 shadow-sm transition"
                  >
                    <Sparkles className="h-3.5 w-3.5" />
                    Al-Qur'an 30 Juz
                  </Link>
                </div>
              </div>

              {/* Tab Navigasi Pilihan Doa */}
              <div className="mt-4 flex flex-wrap gap-1.5 border-b border-slate-200/60 pb-3 dark:border-slate-700/60">
                {doaCollection.map((item, idx) => (
                  <button
                    key={item.id || idx}
                    type="button"
                    onClick={() => setSelectedDoaIdx(idx)}
                    className={`rounded-xl px-3 py-1.5 text-xs font-bold transition cursor-pointer ${
                      selectedDoaIdx === idx
                        ? 'bg-emerald-600 text-white shadow-sm'
                        : 'bg-white/80 text-slate-600 hover:bg-emerald-50 hover:text-emerald-800 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
                    }`}
                  >
                    {item.nama.split('(')[0].trim()}
                  </button>
                ))}
              </div>

              {/* Konten Doa Aktif */}
              {doaCollection[selectedDoaIdx] && (() => {
                const currentDoa = doaCollection[selectedDoaIdx]
                const fullShareText = `${currentDoa.nama}\n\n${currentDoa.ar}\n\nLatin:\n${currentDoa.tr}\n\nArtinya:\n"${currentDoa.idn}"\n\nFadhilah:\n${currentDoa.tentang}`
                return (
                  <div className="mt-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="rounded-lg bg-teal-100 px-2 py-0.5 text-[10px] font-bold text-teal-800 dark:bg-teal-950/70 dark:text-teal-300">
                        {currentDoa.grup || 'Doa Harian'}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleCopyDoa(fullShareText)}
                        className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-500 hover:text-emerald-600 dark:text-slate-400 dark:hover:text-emerald-400 transition cursor-pointer"
                        title="Salin Teks Doa"
                      >
                        {copiedDoa ? (
                          <>
                            <Check className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                            <span className="text-emerald-600 dark:text-emerald-400">Tersalin!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="h-3.5 w-3.5" />
                            <span>Salin Teks</span>
                          </>
                        )}
                      </button>
                    </div>

                    {/* Teks Arab */}
                    <div className="rounded-2xl border border-emerald-500/20 bg-emerald-50/40 p-4 dark:border-emerald-500/20 dark:bg-emerald-950/20">
                      <p className="text-right font-serif text-xl sm:text-2xl leading-loose font-normal text-slate-900 dark:text-white" dir="rtl">
                        {currentDoa.ar}
                      </p>
                    </div>

                    {/* Transliterasi & Terjemahan */}
                    <div className="space-y-1.5 rounded-2xl bg-white/70 p-3.5 border border-slate-200/60 dark:bg-slate-900/40 dark:border-slate-800">
                      <p className="text-xs italic text-emerald-800 dark:text-emerald-300 font-medium">
                        "{currentDoa.tr}"
                      </p>
                      <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                        <span className="font-bold">Artinya: </span>{currentDoa.idn}
                      </p>
                    </div>

                    {/* Fadhilah / Keutamaan Hadits */}
                    {currentDoa.tentang && (
                      <div className="flex items-start gap-2 rounded-xl bg-amber-50/80 p-2.5 text-[11px] text-amber-900 border border-amber-200/60 dark:bg-amber-950/30 dark:text-amber-200 dark:border-amber-900/40">
                        <Sparkles className="h-4 w-4 shrink-0 text-amber-600 mt-0.5" />
                        <div>
                          <span className="font-bold">Keutamaan & Riwayat: </span>
                          <span>{currentDoa.tentang}</span>
                        </div>
                      </div>
                    )}
                  </div>
                )
              })()}
            </div>

            {/* Grafik Analitik Kehadiran Siswa */}
            <div className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-800/90">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4 dark:border-slate-700/60">
                <div>
                  <h2 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                    Tren Kehadiran Siswa di Kelas Anda
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Monitoring persentase kehadiran siswa sepekan terakhir
                  </p>
                </div>
                <div className="flex items-center gap-3 text-xs font-semibold">
                  <span className="flex items-center gap-1 text-emerald-600"><span className="h-2.5 w-2.5 rounded-full bg-emerald-500" /> Hadir</span>
                  <span className="flex items-center gap-1 text-amber-500"><span className="h-2.5 w-2.5 rounded-full bg-amber-400" /> Sakit/Izin</span>
                  <span className="flex items-center gap-1 text-rose-500"><span className="h-2.5 w-2.5 rounded-full bg-rose-500" /> Alpa</span>
                </div>
              </div>

              <div className="mt-4 h-64 w-full flex items-center justify-center">
                {attendanceChartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={attendanceChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" opacity={0.6} />
                      <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: '#64748B' }} />
                      <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: '#64748B' }} domain={[0, 100]} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#1E293B',
                          borderRadius: '12px',
                          border: 'none',
                          color: '#FFF',
                          fontSize: '11px',
                        }}
                      />
                      <Bar dataKey="hadir" fill="#10B981" radius={[6, 6, 0, 0]} barSize={28} />
                      <Bar dataKey="sakit" fill="#F59E0B" radius={[6, 6, 0, 0]} barSize={28} />
                      <Bar dataKey="alpa" fill="#EF4444" radius={[6, 6, 0, 0]} barSize={28} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex flex-col items-center justify-center py-8 text-center text-xs text-slate-400">
                    <Calendar className="mb-2 h-8 w-8 text-slate-300 dark:text-slate-600" />
                    <p className="font-semibold text-slate-500 dark:text-slate-400">Belum ada rekaman presensi mengajar</p>
                    <p className="text-[11px] text-slate-400">Log kehadiran harian kelas akan ditampilkan di sini.</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Kolom Kanan (1 Kolom): Akses Cepat & Status LMS */}
          <div className="space-y-6">
            
            {/* Status Penugasan LMS */}
            <div className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-800/90">
              <h2 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                <FileCheck className="h-5 w-5 text-amber-500" />
                Status Koreksi Tugas
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Evaluasi tugas siswa yang perlu dinilai
              </p>

              <div className="mt-4 h-48 w-full flex items-center justify-center">
                {assignmentStatusData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={assignmentStatusData}
                        innerRadius={50}
                        outerRadius={75}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {assignmentStatusData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#1E293B',
                          borderRadius: '12px',
                          border: 'none',
                          color: '#FFF',
                          fontSize: '11px',
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex flex-col items-center justify-center py-6 text-center text-xs text-slate-400">
                    <CheckCircle2 className="mb-2 h-8 w-8 text-emerald-400/80" />
                    <p className="font-semibold text-slate-600 dark:text-slate-300">Semua tugas telah dinilai</p>
                    <p className="text-[11px] text-slate-400">Tidak ada antrean koreksi tugas saat ini.</p>
                  </div>
                )}
              </div>

              <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-700/60">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                    <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" /> Sudah Selesai Dinilai
                  </span>
                  <span className="font-mono font-bold text-slate-900 dark:text-white">{Number(kpis.graded_count || 0)} Tugas</span>
                </div>
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                    <span className="h-2.5 w-2.5 rounded-full bg-amber-500" /> Menunggu Pemeriksaan
                  </span>
                  <span className="font-mono font-bold text-amber-600 dark:text-amber-400">
                    {kpis.pending_grading_count || 0} Tugas
                  </span>
                </div>
              </div>

              <div className="mt-4">
                <button
                  type="button"
                  onClick={() => navigate('/portal-guru/workspace?tab=penilaian')}
                  className="w-full inline-flex items-center justify-center gap-1.5 rounded-xl bg-slate-900 py-2.5 text-xs font-bold text-white hover:bg-slate-800 dark:bg-emerald-600 dark:hover:bg-emerald-700 transition cursor-pointer"
                >
                  <FileText className="h-4 w-4" /> Buka Menu Penilaian
                </button>
              </div>
            </div>

            {/* Papan Pengumuman Sekolah */}
            <div className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-800/90">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-700/60">
                <h2 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <Bell className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                  Pengumuman Sekolah
                </h2>
              </div>

              <div className="mt-3 space-y-3">
                {announcements.length === 0 ? (
                  <p className="text-xs text-slate-400 py-4 text-center">Belum ada pengumuman terbaru.</p>
                ) : (
                  announcements.slice(0, 3).map((item, idx) => (
                    <div key={item.id || idx} className="rounded-2xl bg-slate-50/80 p-3 dark:bg-slate-900/50">
                      <div className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-700 dark:text-emerald-400">
                        <Building2 className="h-3 w-3" /> {item.target_unit || foundationName}
                      </div>
                      <h4 className="mt-1 text-xs font-bold text-slate-800 dark:text-slate-100 line-clamp-1">
                        {item.judul || 'Pengumuman Guru'}
                      </h4>
                      <p className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2">
                        {item.konten || item.isi || '-'}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Pintasan Aksi Cepat ke Modul Workspace & Ibadah */}
            <div className="rounded-3xl border border-slate-200/80 bg-gradient-to-br from-emerald-500/10 via-teal-500/5 to-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-800/90">
              <h3 className="text-xs font-black uppercase tracking-wider text-emerald-900 dark:text-emerald-300">
                Pintasan Belajar & Ibadah
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Akses cepat modul pengajaran & ibadah harian:
              </p>
              <div className="mt-3 grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => navigate('/portal-guru/workspace?tab=materi')}
                  className="rounded-xl border border-emerald-500/20 bg-white p-2.5 text-left text-xs font-bold text-slate-800 hover:border-emerald-500 hover:bg-emerald-50/50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 transition cursor-pointer"
                >
                  <BookOpen className="h-4 w-4 text-emerald-600 mb-1" />
                  <span>Modul Ajar</span>
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/portal-guru/workspace?tab=penugasan')}
                  className="rounded-xl border border-emerald-500/20 bg-white p-2.5 text-left text-xs font-bold text-slate-800 hover:border-emerald-500 hover:bg-emerald-50/50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 transition cursor-pointer"
                >
                  <FileText className="h-4 w-4 text-emerald-600 mb-1" />
                  <span>Buat Tugas</span>
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/portal-guru/workspace?tab=tahfizh')}
                  className="rounded-xl border border-emerald-500/20 bg-white p-2.5 text-left text-xs font-bold text-slate-800 hover:border-emerald-500 hover:bg-emerald-50/50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 transition cursor-pointer"
                >
                  <BookmarkCheck className="h-4 w-4 text-indigo-600 mb-1" />
                  <span>Jurnal Tahfizh</span>
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/portal-guru/workspace?tab=catatan')}
                  className="rounded-xl border border-emerald-500/20 bg-white p-2.5 text-left text-xs font-bold text-slate-800 hover:border-emerald-500 hover:bg-emerald-50/50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 transition cursor-pointer"
                >
                  <MessageSquare className="h-4 w-4 text-rose-600 mb-1" />
                  <span>Catat Siswa</span>
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/dashboard/master-quran-surah')}
                  className="col-span-2 rounded-xl border border-emerald-500/30 bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-emerald-500/5 p-2.5 text-left text-xs font-bold text-slate-800 hover:border-emerald-500 hover:bg-emerald-50/80 dark:border-emerald-700/60 dark:bg-slate-800 dark:text-slate-200 transition cursor-pointer flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <BookOpen className="h-4 w-4 text-emerald-600" />
                    <span>Al-Qur'an (114 Surah)</span>
                  </div>
                  <ChevronRight className="h-3.5 w-3.5 text-emerald-600" />
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/dashboard/master-doa')}
                  className="rounded-xl border border-slate-200 bg-white p-2.5 text-left text-xs font-bold text-slate-800 hover:border-emerald-500 hover:bg-emerald-50/50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 transition cursor-pointer"
                >
                  <Heart className="h-4 w-4 text-rose-500 mb-1" />
                  <span>Doa & Dzikir</span>
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/dashboard/master-jadwal-sholat')}
                  className="rounded-xl border border-slate-200 bg-white p-2.5 text-left text-xs font-bold text-slate-800 hover:border-emerald-500 hover:bg-emerald-50/50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 transition cursor-pointer"
                >
                  <Clock className="h-4 w-4 text-sky-600 mb-1" />
                  <span>Jadwal Sholat</span>
                </button>
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  )
}
