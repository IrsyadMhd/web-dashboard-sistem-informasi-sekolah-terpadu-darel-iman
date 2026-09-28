import { useEffect, useMemo, useState } from 'react'
import { AlertCircle, BookOpenCheck, CalendarDays, CheckCircle2, Eye, FilePlus2, Hash, HeartPulse, Lock, NotebookPen, PlayCircle, Printer, RotateCcw, Save, Search, ShieldCheck, Sliders, Sparkles, Square, Type, Users, X } from 'lucide-react'
import { useParams, useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { cn } from '../lib/utils'
import { TableRoot, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/components/tailgrids/core/table'
import { Badge } from '@/components/tailgrids/core/badge'
import { Pagination } from '@/components/tailgrids/core/pagination'
import { useDebounce } from '../hooks/useDebounce'
import { lmsPresensiService } from '../services/lmsPresensiService'
import { useAuthStore } from '../stores/authStore'
import { AttendanceCapturePanel, AttendanceMethodSelector } from '../components/attendance/AttendanceCapturePanels'
import { WorkflowStepBar } from '../components/common/WorkflowStepBar'
import { SquircleActionButton, PrintOptionModal } from '../components/master-data'
import { printCleanTable, downloadPdfTable } from '../utils/printHelper'
import AppBreadcrumb from '../components/app/AppBreadcrumb'
import PageContainer from '../components/app/PageContainer'
import AppSkeleton from '../components/app/AppSkeleton'
import AppEmptyState from '../components/app/AppEmptyState'
import AppErrorState from '../components/app/AppErrorState'

const today = new Date().toLocaleDateString('en-CA')
const unwrapPage = (response) => {
  const payload = response?.data?.data || response?.data || []
  return Array.isArray(payload) ? payload : (payload?.data || [])
}

// ── TOAST NOTIFICATION HELPER ──────────────────────────────────────────────
function useToast() {
  const [toasts, setToasts] = useState([])
  const add = (type, title, message) => {
    const id = Date.now() + Math.random()
    setToasts((p) => [...p, { id, type, title, message }])
    setTimeout(() => setToasts((p) => p.filter((t) => t.id !== id)), 5000)
  }
  const dismiss = (id) => setToasts((p) => p.filter((t) => t.id !== id))
  return { toasts, dismiss, success: (t, m) => add('success', t, m), error: (t, m) => add('error', t, m), warning: (t, m) => add('warning', t, m), info: (t, m) => add('info', t, m) }
}

// ── SEMANTIC TOAST STACK (§L Tailgrids_Pengaturan_Halaman) ───────────────────
const TOAST_TONE = { success: 'success', error: 'error', danger: 'error', warning: 'warning', info: 'info' }

function ToastStack({ items, onDismiss }) {
  if (!items?.length) return null
  return (
    <div className="fixed bottom-6 right-4 z-[200] flex flex-col gap-2.5 sm:right-6 max-w-sm w-full pointer-events-none" aria-live="polite" aria-atomic="true">
      {items.map((n) => {
        const tone = TOAST_TONE[n.type] || 'info'
        const isDanger = tone === 'error' || tone === 'danger'
        const isWarning = tone === 'warning'
        const isInfo = tone === 'info'
        const isSuccess = !isDanger && !isWarning && !isInfo
        return (
          <div
            key={n.id}
            className={cn(
              'relative pointer-events-auto flex flex-col overflow-hidden rounded-2xl border-2 bg-white/95 dark:bg-[#182232]/95 backdrop-blur-md p-3.5 shadow-2xl transition-all duration-300 animate-[masterDropdownSlide_0.25s_ease-out]',
              isSuccess && 'border-emerald-500/40 shadow-emerald-950/15 dark:border-emerald-600/50 dark:shadow-black/50',
              isDanger && 'border-rose-400/50 shadow-rose-950/15 dark:border-rose-600/50 dark:shadow-black/50',
              isWarning && 'border-amber-400/50 shadow-amber-950/15 dark:border-amber-600/50 dark:shadow-black/50',
              isInfo && 'border-sky-400/50 shadow-sky-950/15 dark:border-sky-600/50 dark:shadow-black/50'
            )}
          >
            <div className={cn(
              'absolute top-0 left-0 right-0 h-1',
              isSuccess && 'bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-600',
              isDanger && 'bg-gradient-to-r from-rose-500 via-rose-600 to-red-700',
              isWarning && 'bg-gradient-to-r from-amber-400 via-amber-500 to-orange-600',
              isInfo && 'bg-gradient-to-r from-sky-400 via-blue-500 to-indigo-600'
            )} />
            <div className="flex items-start gap-3 mt-0.5">
              <div className={cn(
                'flex size-9 shrink-0 items-center justify-center rounded-xl text-white shadow-sm',
                isSuccess && 'bg-gradient-to-br from-emerald-500 to-teal-600 shadow-emerald-500/30',
                isDanger && 'bg-gradient-to-br from-rose-500 to-red-600 shadow-rose-500/30',
                isWarning && 'bg-gradient-to-br from-amber-500 to-orange-600 shadow-amber-500/30',
                isInfo && 'bg-gradient-to-br from-sky-500 to-blue-600 shadow-sky-500/30'
              )}>
                {isSuccess && <CheckCircle2 className="size-5" strokeWidth={2.3} />}
                {isDanger && <X className="size-5" strokeWidth={2.3} />}
                {isWarning && <AlertCircle className="size-5" strokeWidth={2.3} />}
                {isInfo && <Eye className="size-5" strokeWidth={2.3} />}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <h4 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white">{n.title}</h4>
                  <span className={cn(
                    'inline-flex items-center rounded-full px-2 py-0.2 text-[10px] font-bold border',
                    isSuccess && 'bg-emerald-50 text-[#0E5C44] border-emerald-200/80 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800/80',
                    isDanger && 'bg-rose-50 text-rose-700 border-rose-200/80 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800/80',
                    isWarning && 'bg-amber-50 text-amber-800 border-amber-200/80 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800/80',
                    isInfo && 'bg-sky-50 text-sky-800 border-sky-200/80 dark:bg-sky-950/60 dark:text-sky-300 dark:border-sky-800/80'
                  )}>
                    {isSuccess ? 'Sukses' : isDanger ? 'Gagal' : isWarning ? 'Perhatian' : 'Info'}
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
    card: 'border-purple-300/70 bg-gradient-to-br from-purple-50 via-indigo-50/60 to-white hover:border-purple-400 dark:border-purple-700/50 dark:from-purple-950/40 dark:via-indigo-950/20 dark:to-slate-900',
    glow: 'bg-purple-400/20 group-hover:bg-purple-400/30',
    iconBox: 'bg-gradient-to-br from-purple-500 to-indigo-600 text-white shadow-purple-500/30',
    tag: 'bg-purple-100 text-purple-700 dark:bg-purple-900/60 dark:text-purple-300',
    title: 'text-purple-700 dark:text-purple-400',
    val: 'text-purple-700 dark:text-purple-300',
    sub: 'text-purple-600/80 dark:text-purple-400/80',
    cta: 'text-purple-600/60 dark:text-purple-500/60',
  },
}

function Metric({ icon: Icon, label, subtext, value, tag, tone = 'emerald', onClick }) {
  const t = MODERN_CARD_TONES[tone] || MODERN_CARD_TONES.emerald
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
      {/* Ambient Glow */}
      <div className={`pointer-events-none absolute -top-8 -right-8 h-28 w-28 rounded-full blur-2xl transition-all ${t.glow}`} />

      {/* Header with Icon Box & Tag */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2.5">
          <div className={`flex h-9 w-9 items-center justify-center rounded-xl text-white shadow-sm ${t.iconBox}`}>
            <Icon className="h-4.5 w-4.5" />
          </div>
          <div>
            <p className={`text-[11px] font-bold uppercase tracking-wider ${t.title}`}>{label}</p>
          </div>
        </div>
        {tag && (
          <span className={`rounded-lg px-2 py-0.5 text-[10px] font-extrabold ${t.tag}`}>
            {tag}
          </span>
        )}
      </div>

      {/* Metric Value */}
      <p className={`text-4xl font-black tabular-nums ${t.val}`}>
        {value ?? '0'}
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
    </motion.button>
  )
}

function TeacherWorkspace({ activeScheduleId = '', activeDate = '', requestedSessionId = '' }) {
  const storeUser = useAuthStore((state) => state.user)
  const currentUser = storeUser || (() => {
    try {
      return JSON.parse(localStorage.getItem('school_erp_user') || '{}')
    } catch {
      return {}
    }
  })()

  const roleNames = (Array.isArray(currentUser?.roles) ? currentUser.roles : [])
    .map((role) => typeof role === 'string' ? role : role?.name)
    .filter(Boolean)
  const userRole = String(currentUser?.role || currentUser?.user_type || roleNames[0] || '').toLowerCase()

  const isOverrideUser = [userRole, ...roleNames.map((role) => role.toLowerCase())].some((role) =>
    ['superadmin', 'admin', 'tata usaha', 'tu', 'yayasan', 'pimpinan', 'kepala'].some((name) => role.includes(name))
  )

  const activeLogin = Boolean(activeScheduleId)
  const [date, setDate] = useState(activeDate || today)
  const [schedules, setSchedules] = useState([])
  const [scheduleId, setScheduleId] = useState('')
  const [students, setStudents] = useState([])
  const [meeting, setMeeting] = useState(1)
  const [topic, setTopic] = useState('')
  const [notes, setNotes] = useState('')
  const [session, setSession] = useState(null)
  const [busy, setBusy] = useState(false)
  const [rosterLoading, setRosterLoading] = useState(false)
  const [rosterError, setRosterError] = useState('')
  const [reloadKey, setReloadKey] = useState(0)
  const [captureBusy, setCaptureBusy] = useState(false)
  const [reviewMode, setReviewMode] = useState(false)
  const [method, setMethod] = useState('manual')
  const [substituteReason, setSubstituteReason] = useState('')
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false)
  const [printTeacherFilter, setPrintTeacherFilter] = useState('')
  const { toasts, dismiss, success: toastSuccess, error: toastError, warning: toastWarning } = useToast()

  const teachersList = useMemo(() => {
    const map = new Map()
    schedules.forEach((item) => {
      const emp = item.employee || item.teacher
      if (emp && emp.id && !map.has(emp.id)) {
        map.set(emp.id, {
          id: emp.id,
          nama_lengkap: emp.nama_lengkap || emp.name || 'Guru',
          niy: emp.niy || emp.nip || '',
        })
      }
    })
    return Array.from(map.values())
  }, [schedules])

  const handleTeacherChange = (teacherId) => {
    setPrintTeacherFilter(teacherId)
    if (teacherId) {
      const matchingSchedule = schedules.find(
        (s) => (s.employee?.id || s.employee_id || s.teacher_id) === teacherId
      )
      if (matchingSchedule) {
        setScheduleId(matchingSchedule.id)
      }
    }
  }

  const formatStatusLabel = (status) => {
    switch (status) {
      case 'hadir':
        return 'Hadir'
      case 'terlambat':
        return 'Terlambat'
      case 'izin':
        return 'Izin'
      case 'sakit':
        return 'Sakit'
      case 'alpa':
        return 'Alpha'
      case 'dispensasi':
        return 'Dispensasi'
      case 'belum_diverifikasi':
      case 'belum_diisi':
      default:
        return 'Belum Diisi'
    }
  }

  const handlePrintClean = () => {
    if (!students.length) {
      toastWarning('Roster Siswa Kosong', 'Pilih jadwal pelajaran yang memiliki daftar siswa terlebih dahulu.')
      return
    }

    const teacherName = selected?.employee?.nama_lengkap || selected?.teacher?.name || currentUser?.nama_lengkap || currentUser?.name || '-'
    const teacherNiy = selected?.employee?.niy || selected?.employee?.nip || currentUser?.niy || '-'
    const subjectName = selected?.subject?.name || selected?.subject?.nama_mapel || '-'
    const className = selected?.kelas?.nama_kelas || selected?.kelas?.name || '-'
    const timeRange = selected?.time_start && selected?.time_end ? `${selected.time_start.slice(0, 5)} - ${selected.time_end.slice(0, 5)}` : '-'

    const headers = [
      'NO',
      'NIS / NISN',
      'NAMA SISWA',
      'KELAS',
      'MATA PELAJARAN',
      'GURU PENGAMPU',
      'STATUS PRESENSI',
      'JAM HADIR',
      'CATATAN',
    ]

    const rows = students.map((s, idx) => [
      idx + 1,
      s.nis || s.nisn || '-',
      s.full_name || s.name || s.nama || '-',
      className,
      subjectName,
      teacherName,
      formatStatusLabel(s.status),
      s.arrival_time || '-',
      s.notes || '-',
    ])

    const subtitleInfo = `Guru: ${teacherName}${teacherNiy !== '-' ? ` (NIY/NIP: ${teacherNiy})` : ''} | Mapel: ${subjectName} | Kelas: ${className} | Tanggal: ${date} (${timeRange}) | Pertemuan ke-${meeting}`

    printCleanTable({
      title: 'DAFTAR MURID & PRESENSI MATA PELAJARAN',
      subtitle: subtitleInfo,
      headers,
      rows,
    })
  }

  const handleDownloadPdf = () => {
    if (!students.length) {
      toastWarning('Roster Siswa Kosong', 'Pilih jadwal pelajaran yang memiliki daftar siswa terlebih dahulu.')
      return
    }

    const teacherName = selected?.employee?.nama_lengkap || selected?.teacher?.name || currentUser?.nama_lengkap || currentUser?.name || '-'
    const teacherNiy = selected?.employee?.niy || selected?.employee?.nip || currentUser?.niy || '-'
    const subjectName = selected?.subject?.name || selected?.subject?.nama_mapel || '-'
    const className = selected?.kelas?.nama_kelas || selected?.kelas?.name || '-'
    const timeRange = selected?.time_start && selected?.time_end ? `${selected.time_start.slice(0, 5)} - ${selected.time_end.slice(0, 5)}` : '-'

    const headers = [
      'NO',
      'NIS / NISN',
      'NAMA SISWA',
      'KELAS',
      'MATA PELAJARAN',
      'GURU PENGAMPU',
      'STATUS PRESENSI',
      'JAM HADIR',
      'CATATAN',
    ]

    const rows = students.map((s, idx) => [
      idx + 1,
      s.nis || s.nisn || '-',
      s.full_name || s.name || s.nama || '-',
      className,
      subjectName,
      teacherName,
      formatStatusLabel(s.status),
      s.arrival_time || '-',
      s.notes || '-',
    ])

    const subtitleInfo = `Guru: ${teacherName}${teacherNiy !== '-' ? ` (NIY/NIP: ${teacherNiy})` : ''} | Mapel: ${subjectName} | Kelas: ${className} | Tanggal: ${date} (${timeRange}) | Pertemuan ke-${meeting}`

    downloadPdfTable({
      title: 'DAFTAR MURID & PRESENSI MATA PELAJARAN',
      subtitle: subtitleInfo,
      headers,
      rows,
      filename: `Daftar_Murid_${subjectName.replace(/\s+/g, '_')}_${className.replace(/\s+/g, '_')}_${date}.pdf`,
    })
  }

  useEffect(() => {
    let cancelled = false
    const loadSchedules = async () => {
      try {
        const response = activeLogin
          ? await lmsPresensiService.getActiveSchedules()
          : await lmsPresensiService.getMySchedules(date)
        if (cancelled) return
        const list = activeLogin ? (response?.data?.schedules || []) : (response?.data || [])
        setSchedules(list)
        if (activeLogin && response?.data?.date) setDate(response.data.date)
        setScheduleId(activeLogin
          ? (list.some((item) => item.id === activeScheduleId) ? activeScheduleId : (list[0]?.id || ''))
          : ((current) => current && list.some((item) => item.id === current) ? current : (list[0]?.id || ''))
        )
      } catch (error) {
        if (!cancelled) {
          setSchedules([])
          setScheduleId('')
          setRosterError(error.response?.data?.message || 'Jadwal pelajaran belum dapat dimuat.')
        }
      }
    }
    loadSchedules()
    return () => { cancelled = true }
  }, [activeLogin, activeScheduleId, date])

  useEffect(() => {
    if (!scheduleId) {
      setStudents([])
      setSession(null)
      return undefined
    }

    let cancelled = false
    const loadRoster = async () => {
      setRosterLoading(true)
      setRosterError('')
      try {
        const rosterResponse = await lmsPresensiService.getScheduleStudents(scheduleId, date, activeLogin ? 'active_login' : null)
        let existingSession = rosterResponse?.session || null
        const activeSchedule = schedules.find((item) => item.id === scheduleId)
        const sessionId = requestedSessionId || activeSchedule?.attendance_session_id
        if (!existingSession && sessionId) {
          const existingResponse = await lmsPresensiService.getSession(sessionId)
          existingSession = existingResponse?.data || null
        }
        if (cancelled) return
        const attendanceByStudent = new Map(
          (existingSession?.attendances || []).map((item) => [item.siswa_id, item])
        )
        setSession(existingSession)
        setStudents((rosterResponse?.data || []).map((student) => {
          const recorded = attendanceByStudent.get(student.id)
          return {
            ...student,
            status: recorded?.status_hadir || 'belum_diverifikasi',
            recommended_status: student.recommended_status || null,
            arrival_time: recorded?.arrival_time?.slice(0, 5) || '',
            notes: recorded?.keterangan || '',
            verification_status: recorded?.verification_status || 'unverified',
            recorded_method: recorded?.recorded_method || null,
          }
        }))
      } catch (error) {
        if (!cancelled) {
          setStudents([])
          setSession(null)
          setRosterError(error.response?.data?.message || 'Roster siswa belum dapat dimuat.')
        }
      } finally {
        if (!cancelled) setRosterLoading(false)
      }
    }
    loadRoster()
    return () => { cancelled = true }
  }, [activeLogin, scheduleId, date, schedules, requestedSessionId, reloadKey])

  const selected = schedules.find((item) => item.id === scheduleId)
  const teachingSessionStatus = session?.teaching_session_status ?? selected?.teaching_session_status ?? null
  const hasStep04Context = activeLogin || teachingSessionStatus !== null
  const step04Blocked = hasStep04Context && teachingSessionStatus !== 'active'
  const captureStarted = Boolean(
    session?.session_started_at
      && !session?.session_closed_at
      && (!session?.session_expires_at || new Date(session.session_expires_at).getTime() > Date.now())
  )
  const sessionFinal = ['final', 'locked', 'cancelled'].includes(session?.status)

  // Strict Time Guard for Teacher Lesson Attendance
  const isScheduleTimeActive = useMemo(() => {
    if (!selected || !selected.time_start || !selected.time_end) return true
    const now = new Date()
    const currentDayIso = now.getDay() === 0 ? 7 : now.getDay()

    if (date !== today) return false
    if (selected.day_of_week && Number(selected.day_of_week) !== currentDayIso) return false

    const [sH, sM] = String(selected.time_start).split(':').map(Number)
    const [eH, eM] = String(selected.time_end).split(':').map(Number)
    const startMin = sH * 60 + sM - 15 // 15 mins buffer before class
    const endMin = eH * 60 + eM + 15 // 15 mins buffer after class
    const curMin = now.getHours() * 60 + now.getMinutes()

    return curMin >= startMin && curMin <= endMin
  }, [selected, date])

  const isLockedForTeacher = (!isScheduleTimeActive && !isOverrideUser) || step04Blocked || sessionFinal

  const updateStudent = (id, values) => setStudents((list) => list.map((student) => student.id === id ? { ...student, ...values } : student))
  const markAllPresent = () => setStudents((list) => list.map((student) => ({
    ...student,
    status: 'hadir',
    recorded_method: 'manual',
    verification_status: 'verified',
  })))
  const applyScan = (result) => updateStudent(result.student.id, {
    status: result.attendance_status || 'hadir',
    arrival_time: result.recorded_at ? new Date(result.recorded_at).toTimeString().slice(0, 5) : '',
    recorded_method: method === 'qr' ? 'qr_code' : method === 'face' ? 'face_recognition' : method,
    verification_status: method === 'face' ? 'pending' : 'verified',
  })

  const save = async (finalize = false, { silent = false } = {}) => {
    if (isLockedForTeacher) {
      if (!silent) toastError('Absensi Terkunci!', step04Blocked ? 'Aktifkan sesi mengajar Step 04 terlebih dahulu.' : 'Presensi hanya dapat diisi saat jam pelajaran berlangsung.')
      return null
    }
    if (!scheduleId || !students.length) return null

    setBusy(true)
    try {
      const result = await lmsPresensiService.saveDraft({
        schedule_id: scheduleId, attendance_date: date, meeting_number: Number(meeting),
        topic, meeting_notes: notes,
        attendance_context: activeLogin ? 'active_login' : undefined,
        substitute_reason: selected?.requires_substitute_reason ? substituteReason : undefined,
        items: students.map((student) => ({
          student_id: student.id, status: student.status,
          arrival_time: student.arrival_time || null, notes: student.notes || null,
          recorded_method: student.recorded_method || null,
        })),
      })
      const saved = result.data
      setSession(saved)
      if (finalize) {
        const finalized = await lmsPresensiService.finalize(saved.id)
        setSession(finalized?.data || { ...saved, status: 'final' })
      }
      if (!silent) toastSuccess(finalize ? 'Presensi Difinalisasi' : 'Draft Tersimpan', finalize ? 'Data presensi siswa berhasil diverifikasi dan difinalisasi.' : 'Data presensi berhasil disimpan sebagai draft.')
      return saved
    } catch (error) {
      if (!silent) toastError('Presensi Belum Tersimpan', error.response?.data?.message || 'Periksa kembali data presensi.')
      return null
    } finally {
      setBusy(false)
    }
  }

  const startCapture = async () => {
    if (captureBusy || sessionFinal || isLockedForTeacher) return
    setCaptureBusy(true)
    try {
      const draft = session?.id ? session : await save(false, { silent: true })
      if (!draft?.id) {
        toastError('Sesi Belum Siap', 'Simpan roster siswa terlebih dahulu sebelum membuka capture QR.')
        return
      }
      const response = await lmsPresensiService.startCaptureSession(draft.id)
      const nextSession = response?.data?.session || response?.data || null
      setSession(nextSession)
      toastSuccess('Capture Dibuka', 'Sesi QR aktif. Setiap scan tetap divalidasi server.')
    } catch (error) {
      toastError('Capture Belum Dibuka', error.response?.data?.message || 'Sesi presensi tidak dapat dimulai.')
    } finally {
      setCaptureBusy(false)
    }
  }

  const closeCapture = async () => {
    if (captureBusy || !session?.id || !captureStarted) return
    setCaptureBusy(true)
    try {
      const response = await lmsPresensiService.closeCaptureSession(session.id)
      setSession(response?.data || null)
      toastSuccess('Capture Ditutup', 'Roster tetap dapat diperiksa dan difinalisasi.')
    } catch (error) {
      toastError('Capture Belum Ditutup', error.response?.data?.message || 'Sesi presensi tidak dapat ditutup.')
    } finally {
      setCaptureBusy(false)
    }
  }

  const statusCounts = students.reduce((counts, student) => {
    const status = student.status || 'belum_diverifikasi'
    counts[status] = (counts[status] || 0) + 1
    return counts
  }, {})
  const unmarkedCount = (statusCounts.belum_diverifikasi || 0) + (statusCounts.belum_diisi || 0)

  // Search & Filtering for Roster
  const [studentSearch, setStudentSearch] = useState('')
  const [studentStatusFilter, setStudentStatusFilter] = useState('all')
  const [studentPage, setStudentPage] = useState(1)
  const studentPerPage = 10
  const debouncedStudentSearch = useDebounce(studentSearch, 350)

  const filteredStudents = useMemo(() => {
    let list = students
    if (studentStatusFilter !== 'all') {
      if (studentStatusFilter === 'izin_sakit') {
        list = list.filter((s) => ['izin', 'sakit'].includes(s.status))
      } else if (studentStatusFilter === 'belum') {
        list = list.filter((s) => ['belum_diverifikasi', 'belum_diisi', ''].includes(s.status) || !s.status)
      } else {
        list = list.filter((s) => s.status === studentStatusFilter)
      }
    }
    if (debouncedStudentSearch.trim()) {
      const q = debouncedStudentSearch.toLowerCase().trim()
      list = list.filter((s) =>
        (s.full_name || '').toLowerCase().includes(q) ||
        (s.nis || '').toLowerCase().includes(q) ||
        (s.nisn || '').toLowerCase().includes(q)
      )
    }
    return list
  }, [students, studentStatusFilter, debouncedStudentSearch])

  const totalStudentPages = Math.max(1, Math.ceil(filteredStudents.length / studentPerPage))
  const paginatedStudents = useMemo(() => {
    const start = (studentPage - 1) * studentPerPage
    return filteredStudents.slice(start, start + studentPerPage)
  }, [filteredStudents, studentPage, studentPerPage])

  return (
    <div className="space-y-5">
      {/* ── TOAST NOTIFICATIONS (§L Semantic Toast Stack) ─────────────────────── */}
      <ToastStack items={toasts} onDismiss={dismiss} />

      <WorkflowStepBar
        moduleName="Presensi Lesson Step 05"
        currentStepIndex={sessionFinal ? 3 : reviewMode ? 2 : students.length ? 1 : 0}
        steps={[
          { label: 'Pilih Jadwal' },
          { label: 'Checklist / QR' },
          { label: 'Review Roster', onClick: () => setReviewMode(true) },
          { label: 'Finalisasi' },
        ]}
      />
      {/* Time Lock Security Alert Banner */}
      {selected && isLockedForTeacher && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50/90 p-4 text-sm font-semibold text-rose-800 shadow-sm dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-300 flex items-center gap-3">
          <Lock size={22} className="text-rose-600 dark:text-rose-400 shrink-0" />
          <div>
            <b>{step04Blocked ? 'Absensi Terkunci: Sesi Mengajar Belum Aktif' : 'Absensi Terkunci: Hanya Dapat Diisi Saat Jam Pelajaran Berlangsung'}</b>
            <p className="text-xs font-normal mt-0.5 text-rose-700 dark:text-rose-400">
              {step04Blocked
                ? `Status sesi Step 04 saat ini ${teachingSessionStatus || 'belum tersedia'}. Mulai sesi mengajar terlebih dahulu; server tetap menjadi pengambil keputusan.`
                : <>Jadwal mata pelajaran <b>{selected.subject?.name}</b> ({selected.time_start?.slice(0, 5)}–{selected.time_end?.slice(0, 5)}) tidak sedang dalam jam mengajar aktif saat ini. Penginputan presensi di luar jam pelajaran dinonaktifkan untuk mencegah manipulasi data absensi.</>}
            </p>
          </div>
        </div>
      )}

      {selected && isOverrideUser && !isScheduleTimeActive && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-3 text-xs font-semibold text-amber-800 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-300 flex items-center gap-2">
          <ShieldCheck size={18} className="text-amber-600 shrink-0" />
          <span>Mode Override Admin/TU: Anda memiliki izin akses khusus untuk perbaikan data resmi di luar jam pelajaran.</span>
        </div>
      )}

      <div className="relative overflow-hidden rounded-[22px] border-2 border-emerald-300 bg-white p-5 sm:p-6 shadow-md shadow-emerald-500/10 dark:border-emerald-700/80 dark:bg-[#1B2433] grid gap-4 md:grid-cols-3">
        <div className="pointer-events-none absolute -top-10 -right-10 h-32 w-32 rounded-full bg-emerald-400/10 blur-2xl dark:bg-emerald-400/15" />
        <div>
          <label htmlFor="attendance-date" className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5">Tanggal</label>
          <div className="relative flex items-center">
            <div className="pointer-events-none absolute left-3.5 flex items-center text-slate-400 dark:text-slate-500">
              <CalendarDays className="size-4" />
            </div>
            <input id="attendance-date" disabled={activeLogin} type="date" value={date} onChange={(event) => setDate(event.target.value)} className="w-full rounded-xl border border-slate-200/90 bg-slate-50/50 pl-10 pr-4 py-2.5 text-xs font-semibold text-slate-800 transition-all duration-200 hover:border-slate-300 focus:border-[#0E5C44] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#0E5C44]/12 dark:border-slate-700/80 dark:bg-slate-900/50 dark:text-slate-100 dark:hover:border-slate-600 dark:focus:border-[#3FBF75] dark:focus:bg-slate-900 dark:focus:ring-[#3FBF75]/20 disabled:opacity-50" />
          </div>
        </div>
        <div className="md:col-span-2">
          <label htmlFor="attendance-schedule" className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5">Jadwal Pelajaran</label>
          <div className="relative flex items-center">
            <div className="pointer-events-none absolute left-3.5 flex items-center text-slate-400 dark:text-slate-500">
              <BookOpenCheck className="size-4" />
            </div>
            <select id="attendance-schedule" disabled={activeLogin} value={scheduleId} onChange={(event) => setScheduleId(event.target.value)} className="w-full rounded-xl border border-slate-200/90 bg-slate-50/50 pl-10 pr-8 py-2.5 text-xs font-semibold text-slate-800 transition-all duration-200 hover:border-slate-300 focus:border-[#0E5C44] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#0E5C44]/12 dark:border-slate-700/80 dark:bg-slate-900/50 dark:text-slate-100 dark:hover:border-slate-600 dark:focus:border-[#3FBF75] dark:focus:bg-slate-900 dark:focus:ring-[#3FBF75]/20 cursor-pointer disabled:opacity-50">
              <option value="">{schedules.length === 0 ? 'Belum ada jadwal pelajaran' : 'Pilih Jadwal Pelajaran'}</option>
              {schedules.map((item) => <option key={item.id} value={item.id}>{item.subject?.name || item.subject?.nama_mapel} · {item.kelas?.nama_kelas || item.kelas?.name} · {item.time_start?.slice(0, 5)}–{item.time_end?.slice(0, 5)}</option>)}
            </select>
          </div>
        </div>
        {selected && <div className="md:col-span-3 flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-emerald-50/80 border border-emerald-200/70 p-4 text-sm text-emerald-900 dark:bg-emerald-950/30 dark:border-emerald-800/60 dark:text-emerald-200">
          <div className="min-w-0">
            <b>{selected.subject?.name || selected.subject?.nama_mapel}</b> · {selected.kelas?.nama_kelas || selected.kelas?.name} · {selected.employee?.nama_lengkap || selected.teacher?.name} · {selected.time_start?.slice(0, 5)}–{selected.time_end?.slice(0, 5)}
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0 self-start sm:self-auto flex-wrap">
            {step04Blocked ? (
              <Badge color="warning" size="sm">
                Step 04: {teachingSessionStatus || 'Belum Aktif'}
              </Badge>
            ) : isScheduleTimeActive ? (
              <Badge color="success" size="sm">
                Jam Pelajaran Aktif
              </Badge>
            ) : (
              <Badge color="error" size="sm">
                Di Luar Jam Pelajaran
              </Badge>
            )}
            <SquircleActionButton
              variant="view"
              icon={Printer}
              label="Cetak Daftar Murid (Mapel & Kelas)"
              onClick={() => setIsPrintModalOpen(true)}
              disabled={!students.length}
            />
          </div>
        </div>}
        {selected?.requires_substitute_reason && (
          <div className="md:col-span-3">
            <label htmlFor="attendance-substitute" className="block text-xs font-bold text-amber-700 dark:text-amber-300 mb-1.5">Alasan mengambil presensi sebagai wali kelas/pengganti <span className="text-rose-500">*</span></label>
            <div className="relative">
              <div className="pointer-events-none absolute left-3.5 top-3 flex items-center text-amber-500 dark:text-amber-400">
                <AlertCircle className="size-4" />
              </div>
              <textarea id="attendance-substitute" required value={substituteReason} onChange={(event) => setSubstituteReason(event.target.value)} className="w-full rounded-xl border border-amber-300/90 bg-amber-50/60 pl-10 pr-4 py-2.5 text-xs font-semibold text-slate-800 placeholder:text-slate-400/80 transition-all duration-200 hover:border-amber-400 focus:border-amber-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-amber-500/15 dark:border-amber-800/60 dark:bg-amber-950/20 dark:text-slate-100 resize-none" rows="2" placeholder="Contoh: Guru mata pelajaran berhalangan hadir." />
            </div>
          </div>
        )}
        <div>
          <label htmlFor="attendance-meeting" className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5">Pertemuan ke-</label>
          <div className="relative flex items-center">
            <div className="pointer-events-none absolute left-3.5 flex items-center text-slate-400 dark:text-slate-500">
              <Hash className="size-4" />
            </div>
            <input id="attendance-meeting" disabled={isLockedForTeacher} type="number" min="1" value={meeting} onChange={(event) => setMeeting(event.target.value)} className="w-full rounded-xl border border-slate-200/90 bg-slate-50/50 pl-10 pr-4 py-2.5 text-xs font-semibold text-slate-800 transition-all duration-200 hover:border-slate-300 focus:border-[#0E5C44] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#0E5C44]/12 dark:border-slate-700/80 dark:bg-slate-900/50 dark:text-slate-100 dark:hover:border-slate-600 dark:focus:border-[#3FBF75] dark:focus:bg-slate-900 dark:focus:ring-[#3FBF75]/20 disabled:opacity-50" />
          </div>
        </div>
        <div className="md:col-span-2">
          <label htmlFor="attendance-topic" className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5">Topik</label>
          <div className="relative flex items-center">
            <div className="pointer-events-none absolute left-3.5 flex items-center text-slate-400 dark:text-slate-500">
              <Type className="size-4" />
            </div>
            <input id="attendance-topic" disabled={isLockedForTeacher} value={topic} onChange={(event) => setTopic(event.target.value)} className="w-full rounded-xl border border-slate-200/90 bg-slate-50/50 pl-10 pr-4 py-2.5 text-xs font-semibold text-slate-800 placeholder:text-slate-400/80 transition-all duration-200 hover:border-slate-300 focus:border-[#0E5C44] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#0E5C44]/12 dark:border-slate-700/80 dark:bg-slate-900/50 dark:text-slate-100 dark:hover:border-slate-600 dark:focus:border-[#3FBF75] dark:focus:bg-slate-900 dark:focus:ring-[#3FBF75]/20 disabled:opacity-50" placeholder="Topik pembelajaran" />
          </div>
        </div>
        <div className="md:col-span-3">
          <label htmlFor="attendance-notes" className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5">Catatan</label>
          <div className="relative">
            <div className="pointer-events-none absolute left-3.5 top-3 flex items-center text-slate-400 dark:text-slate-500">
              <NotebookPen className="size-4" />
            </div>
            <textarea id="attendance-notes" disabled={isLockedForTeacher} value={notes} onChange={(event) => setNotes(event.target.value)} className="w-full rounded-xl border border-slate-200/90 bg-slate-50/50 pl-10 pr-4 py-2.5 text-xs font-semibold text-slate-800 placeholder:text-slate-400/80 transition-all duration-200 hover:border-slate-300 focus:border-[#0E5C44] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#0E5C44]/12 dark:border-slate-700/80 dark:bg-slate-900/50 dark:text-slate-100 dark:hover:border-slate-600 dark:focus:border-[#3FBF75] dark:focus:bg-slate-900 dark:focus:ring-[#3FBF75]/20 disabled:opacity-50 resize-none" rows="2" />
          </div>
        </div>
      </div>

      <section className="relative overflow-hidden rounded-[22px] border-2 border-emerald-300 bg-white p-5 sm:p-6 shadow-md shadow-emerald-500/10 dark:border-emerald-700/80 dark:bg-[#1B2433] space-y-4">
        <div className="pointer-events-none absolute -top-10 -right-10 h-32 w-32 rounded-full bg-emerald-400/10 blur-2xl dark:bg-emerald-400/15" />
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-emerald-200/90 dark:border-emerald-800/60 pb-3.5">
          <div className="flex items-center gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700 text-white shadow-sm border border-emerald-300/40">
              <Sliders className="size-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-800 dark:text-white">Metode Presensi</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Semua metode masuk ke draft yang sama dan dapat diperiksa sebelum finalisasi.</p>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-2.5 shrink-0 self-start sm:self-auto flex-wrap">
            <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-extrabold border shadow-2xs ${
              captureStarted
                ? 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-700'
                : session?.session_closed_at
                ? 'bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-950 dark:text-rose-300 dark:border-rose-700'
                : 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-700'
            }`}>
              <span className={`h-2 w-2 rounded-full ${
                captureStarted ? 'bg-emerald-500 animate-pulse' : session?.session_closed_at ? 'bg-rose-500' : 'bg-amber-500'
              }`} />
              {captureStarted ? 'Capture aktif' : session?.session_closed_at ? 'Capture ditutup' : 'Capture belum dibuka'}
            </span>
            {!captureStarted && !sessionFinal && (
              <button
                type="button"
                onClick={startCapture}
                disabled={captureBusy || busy || isLockedForTeacher}
                className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700 text-white px-5 py-2.5 text-xs font-extrabold border border-emerald-300/40 hover:scale-[1.03] transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
              >
                {captureBusy ? (
                  <span className="size-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                ) : (
                  <div className="flex size-5 items-center justify-center rounded-lg bg-white/20 text-white">
                    <PlayCircle className="size-3.5 text-white" strokeWidth={2.2} />
                  </div>
                )}
                <span>{captureBusy ? 'Membuka...' : 'Mulai Capture'}</span>
              </button>
            )}
            {captureStarted && (
              <button
                type="button"
                onClick={closeCapture}
                disabled={captureBusy}
                className="inline-flex items-center gap-2 rounded-2xl border border-slate-200/90 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 shadow-2xs hover:bg-slate-100 hover:text-slate-900 transition-all dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
              >
                <Square size={16} className="shrink-0 text-slate-500" /> {captureBusy ? 'Menutup...' : 'Tutup Capture'}
              </button>
            )}
          </div>
        </div>
        <AttendanceMethodSelector value={method} onChange={setMethod} />
        <AttendanceCapturePanel
          method={method}
          session={session}
          captureActive={captureStarted}
          disabled={isLockedForTeacher || !captureStarted}
          onRecorded={applyScan}
          onScanMatch={(studentId, data) => updateStudent(studentId, data)}
        />
      </section>

      <div className="relative overflow-hidden rounded-[22px] border-2 border-emerald-300 bg-white shadow-md shadow-emerald-500/10 dark:border-emerald-700/80 dark:bg-[#1B2433]">
        <div className="pointer-events-none absolute -top-10 -right-10 h-32 w-32 rounded-full bg-emerald-400/10 blur-2xl dark:bg-emerald-400/15" />
        {/* Baris 1: Toolbar Header */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between px-4 py-3.5 sm:px-6 md:px-8 bg-gradient-to-r from-emerald-500/10 via-teal-500/5 to-transparent border-b border-emerald-200/90 dark:border-emerald-800/60">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700 text-white shrink-0 shadow-sm border border-emerald-300/40">
              <Users className="size-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="font-black text-sm sm:text-base text-slate-900 dark:text-white">Daftar Siswa</h2>
                <span className="inline-flex items-center rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-bold text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/60">
                  {students.length} Siswa
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Roster peserta didik pada jam mengajar aktif</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0 self-start sm:self-auto flex-wrap">
            <SquircleActionButton
              variant="view"
              icon={Printer}
              label="Cetak Daftar Siswa"
              onClick={() => setIsPrintModalOpen(true)}
              disabled={!students.length}
            />
            <button
              type="button"
              disabled={isLockedForTeacher || reviewMode || !students.length}
              onClick={markAllPresent}
              className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700 text-white px-4 py-2.5 text-xs font-extrabold border border-emerald-300/40 hover:scale-[1.03] transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
            >
              <div className="flex size-5 items-center justify-center rounded-lg bg-white/20 text-white">
                <CheckCircle2 className="size-3.5 text-white" strokeWidth={2.2} />
              </div>
              <span>Tandai Semua Hadir</span>
            </button>
            <button
              type="button"
              onClick={() => setReviewMode((current) => !current)}
              disabled={!students.length}
              className="inline-flex items-center gap-2 rounded-2xl border border-slate-200/90 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 shadow-2xs hover:bg-slate-100 hover:text-slate-900 transition-all dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
            >
              <Eye className="size-3.5 text-slate-500 dark:text-slate-400" />
              <span>{reviewMode ? 'Kembali ke Checklist' : 'Tinjau Roster'}</span>
            </button>
          </div>
        </div>

        {/* Baris 2: Search Input Full-Width */}
        <div className="p-4 bg-gradient-to-r from-emerald-50/50 via-teal-50/30 to-emerald-50/50 dark:from-emerald-950/30 dark:via-teal-950/20 dark:to-emerald-950/30 border-b border-emerald-200/80 dark:border-emerald-800/60">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-emerald-600 dark:text-emerald-400" />
            <input
              type="text"
              value={studentSearch}
              onChange={(e) => {
                setStudentSearch(e.target.value)
                setStudentPage(1)
              }}
              placeholder="Cari siswa berdasarkan nama atau NIS/NISN..."
              className="h-10 sm:h-11 w-full rounded-2xl border border-emerald-200/90 dark:border-emerald-800/60 bg-white dark:bg-[#151D2A] pl-10 pr-10 text-xs font-semibold text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-[#0E5C44]/12 focus:border-[#0E5C44] transition-all shadow-xs"
            />
            {studentSearch && (
              <button
                type="button"
                onClick={() => {
                  setStudentSearch('')
                  setStudentPage(1)
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="size-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Baris 3: Filter Horizontal Status */}
        <div className="px-4 py-3 flex flex-wrap items-center justify-between gap-2 bg-emerald-50/30 dark:bg-emerald-950/10 border-b border-emerald-200/80 dark:border-emerald-800/60">
          <div className="flex flex-wrap items-center gap-1.5">
            {[
              { id: 'all', label: `Semua (${students.length})` },
              { id: 'hadir', label: `Hadir (${statusCounts.hadir || 0})` },
              { id: 'terlambat', label: `Terlambat (${statusCounts.terlambat || 0})` },
              { id: 'izin_sakit', label: `Izin/Sakit (${(statusCounts.izin || 0) + (statusCounts.sakit || 0)})` },
              { id: 'alpa', label: `Alpha (${statusCounts.alpa || 0})` },
              { id: 'belum', label: `Belum Diisi (${unmarkedCount})` },
            ].map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => {
                  setStudentStatusFilter(f.id)
                  setStudentPage(1)
                }}
                className={`px-3 py-1.5 text-xs font-extrabold rounded-xl transition-all cursor-pointer ${
                  studentStatusFilter === f.id
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 border border-slate-200 dark:border-slate-700'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {(studentSearch || studentStatusFilter !== 'all') && (
            <button
              type="button"
              onClick={() => {
                setStudentSearch('')
                setStudentStatusFilter('all')
                setStudentPage(1)
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-rose-200 dark:border-rose-900/60 text-xs font-semibold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 dark:text-rose-400 transition-all cursor-pointer"
            >
              <RotateCcw className="size-3" /> Reset Filter
            </button>
          )}
        </div>

        {rosterLoading && <div className="border-b border-emerald-100/80 dark:border-emerald-900/40 px-5 py-4"><AppSkeleton variant="table" rows={3} cols={4} /></div>}
        {rosterError && <div className="border-b border-emerald-100/80 dark:border-emerald-900/40 px-5 py-4"><AppErrorState title="Roster siswa gagal dimuat" description={rosterError} onRetry={() => setReloadKey((k) => k + 1)} compact /></div>}
        {reviewMode && <div className="grid gap-3 border-b border-amber-100 bg-amber-50/70 p-5 sm:grid-cols-3 dark:border-amber-900/50 dark:bg-amber-950/20">
          <div><p className="text-xs font-bold text-amber-800 dark:text-amber-300">Review sebelum finalisasi</p><p className="mt-1 text-xs text-amber-700 dark:text-amber-400">Periksa seluruh status roster. Rekomendasi izin/sakit tetap harus dikonfirmasi guru.</p></div>
          <div className="flex flex-wrap items-center gap-2 text-xs font-bold sm:col-span-2 sm:justify-end">
            <span className="rounded-full border border-emerald-300/70 bg-emerald-100 px-3 py-1 text-[11px] font-extrabold text-emerald-800 dark:border-emerald-800/60 dark:bg-emerald-950/60 dark:text-emerald-300">Hadir {statusCounts.hadir || 0}</span>
            <span className="rounded-full border border-amber-300/70 bg-amber-100 px-3 py-1 text-[11px] font-extrabold text-amber-800 dark:border-amber-800/60 dark:bg-amber-950/60 dark:text-amber-300">Terlambat {statusCounts.terlambat || 0}</span>
            <span className="rounded-full border border-sky-300/70 bg-sky-100 px-3 py-1 text-[11px] font-extrabold text-sky-800 dark:border-sky-800/60 dark:bg-sky-950/60 dark:text-sky-300">Izin/Sakit {(statusCounts.izin || 0) + (statusCounts.sakit || 0)}</span>
            <span className="rounded-full border border-rose-300/70 bg-rose-100 px-3 py-1 text-[11px] font-extrabold text-rose-800 dark:border-rose-800/60 dark:bg-rose-950/60 dark:text-rose-300">Alpha {statusCounts.alpa || 0}</span>
            <span className="rounded-full border border-slate-300/70 bg-slate-200 px-3 py-1 text-[11px] font-extrabold text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">Belum {unmarkedCount}</span>
          </div>
        </div>}
        <div className="overflow-x-auto">
          <TableRoot fullBleed={false}>
            <TableHeader>
              <TableRow className="bg-gradient-to-r from-emerald-100/90 via-teal-50/70 to-emerald-100/90 border-b-2 border-emerald-200/90 dark:from-emerald-950/90 dark:via-teal-950/70 dark:to-emerald-950/90">
                <TableHead className="py-3.5 pl-6 pr-4 font-black text-[11px] uppercase tracking-wider text-emerald-950 dark:text-emerald-200">Siswa</TableHead>
                <TableHead className="py-3.5 px-4 font-black text-[11px] uppercase tracking-wider text-emerald-950 dark:text-emerald-200">Status Kehadiran</TableHead>
                <TableHead className="hidden md:table-cell py-3.5 px-4 font-black text-[11px] uppercase tracking-wider text-emerald-950 dark:text-emerald-200">Jam Hadir</TableHead>
                <TableHead className="hidden lg:table-cell py-3.5 px-4 font-black text-[11px] uppercase tracking-wider text-emerald-950 dark:text-emerald-200">Metode</TableHead>
                <TableHead className="hidden md:table-cell py-3.5 px-4 font-black text-[11px] uppercase tracking-wider text-emerald-950 dark:text-emerald-200">Catatan</TableHead>
                <TableHead className="hidden sm:table-cell py-3.5 pr-6 pl-4 font-black text-[11px] uppercase tracking-wider text-emerald-950 dark:text-emerald-200">Verifikasi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-emerald-100/80 dark:divide-emerald-900/40">
              {paginatedStudents.map((student) => (
                <TableRow key={student.id} className="transition-colors hover:bg-emerald-50/40 dark:hover:bg-emerald-950/20">
                  <TableCell className="py-3.5 pl-6 pr-4 align-top sm:align-middle">
                    <b className="text-sm font-extrabold text-slate-900 dark:text-white line-clamp-2">{student.full_name}</b>
                    <p className="text-xs font-medium text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">{student.nis || student.nisn}</p>
                    {student.recommended_status && (
                      <span className="mt-1 inline-block rounded-md bg-amber-100/90 px-2 py-0.5 text-[10px] font-extrabold text-amber-800 dark:bg-amber-950/80 dark:text-amber-300">
                        Rekomendasi: {student.recommended_status}
                      </span>
                    )}
                    {/* Mobile Compact Metadata Row (§7.5) */}
                    <div className="sm:hidden mt-2 flex flex-wrap items-center gap-1.5 pt-1.5 border-t border-emerald-100/80 dark:border-emerald-900/40">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300">
                        {formatStatusLabel(student.status)}
                      </span>
                      {student.arrival_time && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-medium bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                          {student.arrival_time}
                        </span>
                      )}
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold ${
                        student.verification_status === 'verified' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-slate-100 text-slate-500'
                      }`}>
                        {student.verification_status === 'verified' ? 'Terverifikasi' : 'Belum'}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="py-3.5 px-4">
                    <div className="flex flex-wrap gap-1.5 my-1">
                      {['belum_diverifikasi', 'belum_diisi'].includes(student.status) && (
                        <span className="rounded-xl bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                          Belum Diisi
                        </span>
                      )}
                      <button
                        type="button"
                        disabled={isLockedForTeacher || reviewMode}
                        onClick={() => updateStudent(student.id, { status: 'hadir', recorded_method: 'manual' })}
                        className={`px-3 py-1.5 text-xs font-extrabold rounded-xl transition-all duration-200 cursor-pointer disabled:opacity-40 disabled:pointer-events-none ${
                          student.status === 'hadir'
                            ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30 scale-105'
                            : 'bg-emerald-100/80 text-emerald-800 hover:bg-emerald-600 hover:text-white dark:bg-emerald-950/80 dark:text-emerald-300 dark:hover:bg-emerald-600 dark:hover:text-white'
                        }`}
                      >
                        Hadir
                      </button>
                      <button
                        type="button"
                        disabled={isLockedForTeacher || reviewMode}
                        onClick={() => updateStudent(student.id, { status: 'terlambat', recorded_method: 'manual' })}
                        className={`px-3 py-1.5 text-xs font-extrabold rounded-xl transition-all duration-200 cursor-pointer disabled:opacity-40 disabled:pointer-events-none ${
                          student.status === 'terlambat'
                            ? 'bg-amber-500 text-white shadow-md shadow-amber-500/30 scale-105'
                            : 'bg-amber-100/80 text-amber-800 hover:bg-amber-500 hover:text-white dark:bg-amber-950/80 dark:text-amber-300 dark:hover:bg-amber-500 dark:hover:text-white'
                        }`}
                      >
                        Terlambat
                      </button>
                      <button
                        type="button"
                        disabled={isLockedForTeacher || reviewMode}
                        onClick={() => updateStudent(student.id, { status: 'izin', recorded_method: 'manual' })}
                        className={`px-3 py-1.5 text-xs font-extrabold rounded-xl transition-all duration-200 cursor-pointer disabled:opacity-40 disabled:pointer-events-none ${
                          student.status === 'izin'
                            ? 'bg-sky-500 text-white shadow-md shadow-sky-500/30 scale-105'
                            : 'bg-sky-100/80 text-sky-800 hover:bg-sky-500 hover:text-white dark:bg-sky-950/80 dark:text-sky-300 dark:hover:bg-sky-500 dark:hover:text-white'
                        }`}
                      >
                        Izin
                      </button>
                      <button
                        type="button"
                        disabled={isLockedForTeacher || reviewMode}
                        onClick={() => updateStudent(student.id, { status: 'sakit', recorded_method: 'manual' })}
                        className={`px-3 py-1.5 text-xs font-extrabold rounded-xl transition-all duration-200 cursor-pointer disabled:opacity-40 disabled:pointer-events-none ${
                          student.status === 'sakit'
                            ? 'bg-violet-600 text-white shadow-md shadow-violet-600/30 scale-105'
                            : 'bg-violet-100/80 text-violet-800 hover:bg-violet-600 hover:text-white dark:bg-violet-950/80 dark:text-violet-300 dark:hover:bg-violet-600 dark:hover:text-white'
                        }`}
                      >
                        Sakit
                      </button>
                      <button
                        type="button"
                        disabled={isLockedForTeacher || reviewMode}
                        onClick={() => updateStudent(student.id, { status: 'alpa', recorded_method: 'manual' })}
                        className={`px-3 py-1.5 text-xs font-extrabold rounded-xl transition-all duration-200 cursor-pointer disabled:opacity-40 disabled:pointer-events-none ${
                          student.status === 'alpa'
                            ? 'bg-rose-600 text-white shadow-md shadow-rose-600/30 scale-105'
                            : 'bg-rose-100/80 text-rose-800 hover:bg-rose-600 hover:text-white dark:bg-rose-950/80 dark:text-rose-300 dark:hover:bg-rose-600 dark:hover:text-white'
                        }`}
                      >
                        Alpha
                      </button>
                      <button
                        type="button"
                        disabled={isLockedForTeacher || reviewMode}
                        onClick={() => updateStudent(student.id, { status: 'dispensasi', recorded_method: 'manual' })}
                        className={`px-3 py-1.5 text-xs font-extrabold rounded-xl transition-all duration-200 cursor-pointer disabled:opacity-40 disabled:pointer-events-none ${
                          student.status === 'dispensasi'
                            ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30 scale-105'
                            : 'bg-indigo-100/80 text-indigo-800 hover:bg-indigo-600 hover:text-white dark:bg-indigo-950/80 dark:text-indigo-300 dark:hover:bg-indigo-600 dark:hover:text-white'
                        }`}
                      >
                        Dispensasi
                      </button>
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell py-3.5 px-4 align-middle">
                    <input
                      disabled={isLockedForTeacher || reviewMode}
                      type="time"
                      value={student.arrival_time}
                      onChange={(event) => updateStudent(student.id, { arrival_time: event.target.value })}
                      aria-label={`Jam hadir ${student.full_name}`}
                      className="rounded-xl border border-slate-200/80 bg-slate-50/50 p-2 text-xs font-bold text-slate-900 outline-none focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 disabled:opacity-40 dark:border-slate-800 dark:bg-slate-900/60 dark:text-white"
                    />
                  </TableCell>
                  <TableCell className="hidden lg:table-cell py-3.5 px-4 align-middle">
                    <Badge color="emerald" size="sm">
                      {student.recorded_method || 'manual'}
                    </Badge>
                  </TableCell>
                  <TableCell className="hidden md:table-cell py-3.5 px-4 align-middle">
                    <input
                      disabled={isLockedForTeacher || reviewMode}
                      value={student.notes}
                      onChange={(event) => updateStudent(student.id, { notes: event.target.value })}
                      aria-label={`Catatan ${student.full_name}`}
                      className="w-full rounded-xl border border-slate-200/80 bg-slate-50/50 p-2 text-xs text-slate-900 outline-none focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 disabled:opacity-40 dark:border-slate-800 dark:bg-slate-900/60 dark:text-white"
                      placeholder="Catatan..."
                    />
                  </TableCell>
                  <TableCell className="hidden sm:table-cell py-3.5 pr-6 pl-4 align-middle">
                    <Badge color={student.verification_status === 'verified' ? 'success' : 'gray'} size="sm">
                      {student.verification_status === 'verified' ? 'Terverifikasi' : 'Belum'}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </TableRoot>
        </div>
        {!students.length ? (
          <div className="px-5 py-8"><AppEmptyState title="Belum ada roster siswa" description="Pilih jadwal pelajaran yang memiliki siswa aktif untuk mulai mengisi presensi." /></div>
        ) : filteredStudents.length === 0 ? (
          <div className="px-5 py-8"><AppEmptyState title="Data tidak ditemukan" description="Coba ubah kata kunci pencarian atau filter status yang digunakan." actionLabel="Reset Filter" onAction={() => { setStudentSearch(''); setStudentStatusFilter('all'); setStudentPage(1) }} /></div>
        ) : null}

        {/* PAGINATION FOOTER */}
        {filteredStudents.length > 0 && (
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between px-5 sm:px-6 py-4 border-t border-emerald-200/80 dark:border-emerald-800/60 bg-gradient-to-r from-emerald-50/40 via-white to-emerald-50/40 dark:from-emerald-950/20 dark:via-transparent dark:to-emerald-950/20">
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 text-center sm:text-left">
              Menampilkan <span className="font-semibold text-slate-700 dark:text-slate-200">{(studentPage - 1) * studentPerPage + 1}</span>–<span className="font-semibold text-slate-700 dark:text-slate-200">{Math.min(studentPage * studentPerPage, filteredStudents.length)}</span> dari <span className="font-semibold text-slate-700 dark:text-slate-200">{filteredStudents.length}</span> siswa
            </p>
            {totalStudentPages > 1 && (
              <div className="flex items-center justify-center gap-2">
                <Pagination
                  currentPage={studentPage}
                  totalPages={totalStudentPages}
                  onPageChange={(p) => setStudentPage(p)}
                  sideLayout="icon"
                />
              </div>
            )}
          </div>
        )}
          <div className="flex flex-wrap items-center justify-end gap-2.5 border-t border-slate-100 bg-slate-50/50 px-6 py-4 dark:border-slate-800 dark:bg-slate-900/40">
            <button
              type="button"
              disabled={busy || !students.length || isLockedForTeacher}
              onClick={() => save(false)}
              className="inline-flex items-center gap-2 rounded-2xl border border-slate-200/90 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 shadow-2xs hover:bg-slate-100 hover:text-slate-900 transition-all dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
            >
              {busy ? (
                <span className="size-3.5 animate-spin rounded-full border-2 border-slate-400 border-t-transparent" />
              ) : (
                <Save size={17} className="text-slate-500 dark:text-slate-400" />
              )}
              <span>Simpan Draft</span>
            </button>
            <button
              type="button"
              disabled={busy || !students.length || sessionFinal || isLockedForTeacher || unmarkedCount > 0}
              onClick={() => save(true)}
              title={unmarkedCount > 0 ? `Masih ada ${unmarkedCount} siswa belum diisi` : 'Finalisasi presensi'}
              className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700 text-white px-5 py-2.5 text-xs font-extrabold border border-emerald-300/40 hover:scale-[1.03] transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:pointer-events-none cursor-pointer shadow-md shadow-emerald-500/20"
            >
              {busy ? (
                <span className="size-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
              ) : (
                <div className="flex size-5 items-center justify-center rounded-lg bg-white/20 text-white">
                  <ShieldCheck size={17} className="text-white" strokeWidth={2.2} />
                </div>
              )}
              <span>Finalisasi</span>
            </button>
          </div>
        </div>

      {/* PRINT OPTION MODAL */}
      <PrintOptionModal
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
        title={`Daftar Murid (${selected?.subject?.name || selected?.subject?.nama_mapel || 'Mata Pelajaran'} - ${selected?.kelas?.nama_kelas || selected?.kelas?.name || 'Kelas'})`}
        teachersList={teachersList}
        selectedTeacherId={printTeacherFilter}
        onTeacherChange={handleTeacherChange}
        onPrint={() => {
          handlePrintClean()
          setIsPrintModalOpen(false)
        }}
        onDownload={() => {
          handleDownloadPdf()
          setIsPrintModalOpen(false)
        }}
      />
    </div>
  )
}

export default function AttendanceWorkspacePage() {
  const [params] = useSearchParams()
  const { id: routeSessionId = '' } = useParams()
  const authUser = useAuthStore((state) => state.user)
  const [counts, setCounts] = useState({ permissions: 0, corrections: 0, followUps: 0 })
  const activeScheduleId = params.get('schedule_id') || params.get('active_schedule') || ''
  const activeDate = params.get('date') || params.get('attendance_date') || ''

  useEffect(() => {
    const permissionNames = Array.isArray(authUser?.permissions) ? authUser.permissions : []
    const roles = (Array.isArray(authUser?.roles) ? authUser.roles : [])
      .map((role) => typeof role === 'string' ? role : role?.name)
    const isStudent = roles.some((role) => ['Siswa', 'siswa', 'student'].includes(role))
    const isHomeroomReviewer = permissionNames.includes('homeroom_attendance.verify_permission')
    const canReviewCorrections = permissionNames.includes('lesson_attendance.correct')
    const canReviewFollowUps = permissionNames.includes('homeroom_attendance.follow_up')

    Promise.all([
      isStudent || isHomeroomReviewer
        ? (isHomeroomReviewer ? lmsPresensiService.getHomeroomPermissions({ status: 'pending' }) : lmsPresensiService.getPermissions({ status: 'pending' })).catch(() => null)
        : Promise.resolve(null),
      canReviewCorrections ? lmsPresensiService.getCorrections({ status: 'submitted' }).catch(() => null) : Promise.resolve(null),
      canReviewFollowUps ? lmsPresensiService.getFollowUps({ status: 'new' }).catch(() => null) : Promise.resolve(null),
    ]).then(([permissions, corrections, followUps]) => {
      setCounts({
        permissions: unwrapPage(permissions).length,
        corrections: unwrapPage(corrections).length,
        followUps: unwrapPage(followUps).length,
      })
    })
  }, [authUser])

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.05, delayChildren: 0.02 },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 12 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' } },
  }

  return (
    <PageContainer>
    <motion.div initial="hidden" animate="visible" variants={containerVariants} className="space-y-6 pb-12">
      {/* BREADCRUMB NAV */}
      <motion.div variants={itemVariants} className="print:hidden">
        <AppBreadcrumb items={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Absensi Kelas & Mata Pelajaran' }]} />
      </motion.div>

      {/* MODERN HERO CARD HEADER (§B / §7.7 Vivid Emerald Responsive Hero) */}
      <motion.div variants={itemVariants}>
        <div className="relative overflow-hidden rounded-[22px] border-2 border-emerald-500/30 bg-gradient-to-r from-emerald-500/15 via-teal-500/10 to-emerald-600/15 p-4 sm:p-6 shadow-md shadow-emerald-500/10 dark:border-emerald-600/40 dark:bg-gradient-to-r dark:from-emerald-950/70 dark:via-teal-950/50 dark:to-slate-900 print:hidden">
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
                    Presensi Jam Mengajar Aktif
                  </span>
                  <span className="inline-flex items-center rounded-full bg-emerald-100 px-3 py-0.5 text-xs font-bold text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/60">
                    Sistem Validasi Server
                  </span>
                </div>
                <h1 className="mt-1.5 text-lg sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                  Absensi Kelas & Mata Pelajaran
                </h1>
                <p className="mt-0.5 sm:mt-1 text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-300 max-w-2xl leading-relaxed">
                  Pencatatan presensi siswa sesuai jadwal mata pelajaran aktif dengan pengawasan keamanan jam mengajar.
                </p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      <motion.div variants={itemVariants} className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Metric icon={FilePlus2} label="Izin Membutuhkan Verifikasi" subtext="Pengajuan izin/sakit siswa" value={counts.permissions} tag="Verifikasi" tone="blue" />
        <Metric icon={AlertCircle} label="Pengajuan Koreksi" subtext="Permohonan koreksi presensi" value={counts.corrections} tag="Koreksi" tone="amber" />
        <Metric icon={HeartPulse} label="Tindak Lanjut Siswa" subtext="Catatan BK / Musyrif" value={counts.followUps} tag="Tindak Lanjut" tone="violet" />
        <Metric icon={BookOpenCheck} label="Status Jadwal Harian" subtext="Jadwal mengajar aktif" value="Aktif" tag="Sesi Aktif" tone="emerald" />
      </motion.div>

      <motion.div variants={itemVariants}>
        <TeacherWorkspace activeScheduleId={activeScheduleId} activeDate={activeDate} requestedSessionId={routeSessionId} />
      </motion.div>
    </motion.div>
    </PageContainer>
  )
}
