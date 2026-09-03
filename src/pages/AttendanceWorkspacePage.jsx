import { useEffect, useMemo, useState } from 'react'
import { AlertCircle, BookOpenCheck, Clock3, Eye, FilePlus2, HeartPulse, Lock, PlayCircle, Printer, Save, ShieldCheck, Sliders, Sparkles, Square, XCircle } from 'lucide-react'
import Swal from 'sweetalert2'
import { useParams, useSearchParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { TableRoot, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/components/tailgrids/core/table'
import { Badge } from '@/components/tailgrids/core/badge'
import { Button } from '@/components/tailgrids/core/button'
import { lmsPresensiService } from '../services/lmsPresensiService'
import { useAuthStore } from '../stores/authStore'
import { AttendanceCapturePanel, AttendanceMethodSelector } from '../components/attendance/AttendanceCapturePanels'
import { WorkflowStepBar } from '../components/common/WorkflowStepBar'
import { SquircleActionButton, PrintOptionModal } from '../components/master-data'
import { printCleanTable, downloadPdfTable } from '../utils/printHelper'
import AppBreadcrumb from '../components/app/AppBreadcrumb'

const today = new Date().toLocaleDateString('en-CA')
const unwrapPage = (response) => {
  const payload = response?.data?.data || response?.data || []
  return Array.isArray(payload) ? payload : (payload?.data || [])
}

// ── MODERN CARD TONES (Spesifikasi Sesuai Dashboard Kepala Sekolah) ──
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
      whileHover={{ scale: 1.03, y: -2 }}
      whileTap={{ scale: 0.97 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      onClick={onClick}
      className={`group relative overflow-hidden rounded-[18px] border-2 p-4 shadow-sm transition-all duration-200 text-left ${
        isClickable ? 'cursor-pointer hover:shadow-md' : 'cursor-default'
      } ${t.card}`}
    >
      {/* Ambient Glow */}
      <div className={`pointer-events-none absolute -top-6 -right-6 h-20 w-20 rounded-full blur-xl transition-all ${t.glow}`} />

      {/* Header with 3D Gradient Icon Box & Pill Tag */}
      <div className="flex items-center justify-between mb-2">
        <div className={`flex h-8.5 w-8.5 items-center justify-center rounded-xl text-white shadow-xs ${t.iconBox}`}>
          <Icon className="h-4 w-4" />
        </div>
        {tag && (
          <span className={`rounded-lg px-2 py-0.5 text-[9.5px] font-extrabold ${t.tag}`}>
            {tag}
          </span>
        )}
      </div>

      {/* Metric Label & Value */}
      <p className={`text-[10.5px] font-bold uppercase tracking-wider ${t.title}`}>{label}</p>
      <p className={`text-2xl sm:text-3xl font-black tabular-nums ${t.val}`}>{value ?? 0}</p>
      {subtext && (
        <p className={`mt-0.5 text-[10px] font-semibold truncate ${t.sub}`}>
          {subtext}
        </p>
      )}

      {/* Click Affordance Footer */}
      <p className={`mt-2 text-[9px] font-bold flex items-center gap-0.5 ${t.cta}`}>
        <Eye className="h-2.5 w-2.5" /> Detail aktivitas
      </p>
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
  const [captureBusy, setCaptureBusy] = useState(false)
  const [reviewMode, setReviewMode] = useState(false)
  const [method, setMethod] = useState('manual')
  const [substituteReason, setSubstituteReason] = useState('')
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false)
  const [printTeacherFilter, setPrintTeacherFilter] = useState('')

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
      Swal.fire({
        icon: 'warning',
        title: 'Roster Siswa Kosong',
        text: 'Pilih jadwal pelajaran yang memiliki daftar siswa terlebih dahulu.',
        confirmColor: '#0E5C44',
      })
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
      Swal.fire({
        icon: 'warning',
        title: 'Roster Siswa Kosong',
        text: 'Pilih jadwal pelajaran yang memiliki daftar siswa terlebih dahulu.',
        confirmColor: '#0E5C44',
      })
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
  }, [activeLogin, scheduleId, date, schedules, requestedSessionId])

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
      if (!silent) Swal.fire({
        icon: 'error',
        title: 'Absensi Terkunci!',
        text: step04Blocked ? 'Aktifkan sesi mengajar Step 04 terlebih dahulu.' : 'Presensi hanya dapat diisi saat jam pelajaran berlangsung.',
        confirmColor: '#0E5C44',
      })
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
      if (!silent) Swal.fire({ icon: 'success', title: finalize ? 'Presensi difinalisasi' : 'Draft tersimpan', confirmColor: '#0E5C44' })
      return saved
    } catch (error) {
      if (!silent) Swal.fire({ icon: 'error', title: 'Presensi belum tersimpan', text: error.response?.data?.message || 'Periksa kembali data presensi.', confirmColor: '#0E5C44' })
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
        Swal.fire({ icon: 'error', title: 'Sesi belum siap', text: 'Simpan roster siswa terlebih dahulu sebelum membuka capture QR.' })
        return
      }
      const response = await lmsPresensiService.startCaptureSession(draft.id)
      const nextSession = response?.data?.session || response?.data || null
      setSession(nextSession)
      Swal.fire({ icon: 'success', title: 'Capture dibuka', text: 'Sesi QR aktif. Setiap scan tetap divalidasi server.', timer: 1800, showConfirmButton: false })
    } catch (error) {
      Swal.fire({ icon: 'error', title: 'Capture belum dibuka', text: error.response?.data?.message || 'Sesi presensi tidak dapat dimulai.' })
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
      Swal.fire({ icon: 'success', title: 'Capture ditutup', text: 'Roster tetap dapat diperiksa dan difinalisasi.', timer: 1800, showConfirmButton: false })
    } catch (error) {
      Swal.fire({ icon: 'error', title: 'Capture belum ditutup', text: error.response?.data?.message || 'Sesi presensi tidak dapat ditutup.' })
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

  return (
    <div className="space-y-5">
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
          <Lock size={22} className="text-rose-600 shrink-0 animate-bounce" />
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

      <div className="relative overflow-hidden rounded-[22px] border-2 border-emerald-500/25 bg-white shadow-md shadow-emerald-500/5 p-6 md:grid-cols-3 dark:border-emerald-600/35 dark:bg-[#1B2433] grid gap-4">
        <div className="pointer-events-none absolute -top-10 -right-10 h-32 w-32 rounded-full bg-emerald-400/10 blur-2xl dark:bg-emerald-400/15" />
        <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Tanggal
          <input disabled={activeLogin} type="date" value={date} onChange={(event) => setDate(event.target.value)} className="mt-2 w-full rounded-2xl border border-slate-200/80 bg-slate-50/50 p-3 text-sm text-slate-900 outline-none focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 disabled:bg-slate-100 dark:border-slate-800 dark:bg-slate-900/60 dark:text-white dark:focus:bg-[#111827] dark:disabled:bg-slate-800/80" />
        </label>
        <label className="text-xs font-bold text-slate-700 md:col-span-2 dark:text-slate-300">Jadwal Pelajaran
          <select disabled={activeLogin} value={scheduleId} onChange={(event) => setScheduleId(event.target.value)} className="mt-2 w-full rounded-2xl border border-slate-200/80 bg-slate-50/50 p-3 text-sm text-slate-900 outline-none focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 disabled:bg-slate-100 dark:border-slate-800 dark:bg-slate-900/60 dark:text-white dark:focus:bg-[#111827] dark:disabled:bg-slate-800/80">
            <option value="">{schedules.length === 0 ? 'Belum ada jadwal pelajaran' : 'Pilih Jadwal Pelajaran'}</option>
            {schedules.map((item) => <option key={item.id} value={item.id}>{item.subject?.name || item.subject?.nama_mapel} · {item.kelas?.nama_kelas || item.kelas?.name} · {item.time_start?.slice(0, 5)}–{item.time_end?.slice(0, 5)}</option>)}
          </select>
        </label>
        {selected && <div className="md:col-span-3 flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-emerald-50/80 border border-emerald-200/70 p-4 text-sm text-emerald-900 dark:bg-emerald-950/30 dark:border-emerald-800/60 dark:text-emerald-200">
          <div className="min-w-0">
            <b>{selected.subject?.name || selected.subject?.nama_mapel}</b> · {selected.kelas?.nama_kelas || selected.kelas?.name} · {selected.employee?.nama_lengkap || selected.teacher?.name} · {selected.time_start?.slice(0, 5)}–{selected.time_end?.slice(0, 5)}
          </div>
          <div className="flex items-center gap-2">
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
          <label className="text-xs font-bold text-amber-700 md:col-span-3 dark:text-amber-300">
            Alasan mengambil presensi sebagai wali kelas/pengganti
            <textarea required value={substituteReason} onChange={(event) => setSubstituteReason(event.target.value)} className="mt-2 w-full rounded-2xl border border-amber-300 bg-amber-50/80 p-3 text-slate-900 outline-none focus:ring-2 focus:ring-amber-500/20 dark:bg-amber-950/20 dark:text-white" rows="2" placeholder="Contoh: Guru mata pelajaran berhalangan hadir." />
          </label>
        )}
        <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Pertemuan ke-
          <input disabled={isLockedForTeacher} type="number" min="1" value={meeting} onChange={(event) => setMeeting(event.target.value)} className="mt-2 w-full rounded-2xl border border-slate-200/80 bg-slate-50/50 p-3 text-slate-900 outline-none focus:border-emerald-500 focus:bg-white disabled:opacity-50 dark:border-slate-800 dark:bg-slate-900/60 dark:text-white" />
        </label>
        <label className="text-xs font-bold text-slate-700 md:col-span-2 dark:text-slate-300">Topik
          <input disabled={isLockedForTeacher} value={topic} onChange={(event) => setTopic(event.target.value)} className="mt-2 w-full rounded-2xl border border-slate-200/80 bg-slate-50/50 p-3 text-slate-900 outline-none focus:border-emerald-500 focus:bg-white disabled:opacity-50 dark:border-slate-800 dark:bg-slate-900/60 dark:text-white" placeholder="Topik pembelajaran" />
        </label>
        <label className="text-xs font-bold text-slate-700 md:col-span-3 dark:text-slate-300">Catatan
          <textarea disabled={isLockedForTeacher} value={notes} onChange={(event) => setNotes(event.target.value)} className="mt-2 w-full rounded-2xl border border-slate-200/80 bg-slate-50/50 p-3 text-slate-900 outline-none focus:border-emerald-500 focus:bg-white disabled:opacity-50 dark:border-slate-800 dark:bg-slate-900/60 dark:text-white" rows="2" />
        </label>
      </div>

      <section className="relative overflow-hidden rounded-[22px] border-2 border-emerald-500/25 bg-white p-5 sm:p-6 shadow-md shadow-emerald-500/5 dark:border-emerald-600/35 dark:bg-[#1B2433] space-y-5">
        <div className="pointer-events-none absolute -top-10 -right-10 h-32 w-32 rounded-full bg-emerald-400/10 blur-2xl dark:bg-emerald-400/15" />
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-2xl bg-emerald-100 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 shrink-0 shadow-2xs">
              <Sliders size={20} />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-slate-900 dark:text-white">Metode Presensi</h2>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-0.5">Semua metode masuk ke draft yang sama dan dapat diperiksa sebelum finalisasi.</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2.5">
            <span className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-extrabold shadow-2xs ${
              captureStarted
                ? 'bg-emerald-100/90 text-emerald-800 ring-1 ring-emerald-300 dark:bg-emerald-950/80 dark:text-emerald-300 dark:ring-emerald-800/60 animate-pulse'
                : session?.session_closed_at
                ? 'bg-rose-100/90 text-rose-800 ring-1 ring-rose-300 dark:bg-rose-950/80 dark:text-rose-300 dark:ring-rose-800/60'
                : 'bg-amber-100/90 text-amber-800 ring-1 ring-amber-300 dark:bg-amber-950/80 dark:text-amber-300 dark:ring-amber-800/60'
            }`}>
              <span className={`size-2 rounded-full ${
                captureStarted ? 'bg-emerald-600 dark:bg-emerald-400' : session?.session_closed_at ? 'bg-rose-600 dark:bg-rose-400' : 'bg-amber-600 dark:bg-amber-400'
              }`} />
              {captureStarted ? 'Capture aktif' : session?.session_closed_at ? 'Capture ditutup' : 'Capture belum dibuka'}
            </span>
            {!captureStarted && !sessionFinal && (
              <button
                type="button"
                onClick={startCapture}
                disabled={captureBusy || busy || isLockedForTeacher}
                className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-gradient-to-r from-[#0E5C44] to-emerald-700 hover:from-emerald-800 hover:to-emerald-800 px-4.5 py-2 text-xs font-extrabold text-white shadow-md shadow-emerald-900/20 hover:scale-105 active:scale-95 transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-40 cursor-pointer"
              >
                <PlayCircle size={17} className="shrink-0" /> {captureBusy ? 'Membuka...' : 'Mulai Capture'}
              </button>
            )}
            {captureStarted && (
              <button
                type="button"
                onClick={closeCapture}
                disabled={captureBusy}
                className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-slate-300 bg-white px-4.5 py-2 text-xs font-extrabold text-slate-700 hover:bg-slate-100 hover:text-slate-900 shadow-xs hover:scale-105 active:scale-95 transition-all duration-200 disabled:opacity-40 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 cursor-pointer"
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

      <div className="relative overflow-hidden rounded-[22px] border-2 border-emerald-500/25 bg-white shadow-md shadow-emerald-500/5 dark:border-emerald-600/35 dark:bg-[#1B2433]">
        <div className="pointer-events-none absolute -top-10 -right-10 h-32 w-32 rounded-full bg-emerald-400/10 blur-2xl dark:bg-emerald-400/15" />
        <div className="flex flex-wrap items-center justify-between gap-3 p-5 bg-gradient-to-r from-emerald-500/10 via-teal-500/5 to-transparent border-b border-emerald-500/20">
          <div><h2 className="font-extrabold text-slate-900 dark:text-white">Daftar Siswa</h2><p className="text-xs text-slate-500">{students.length} siswa aktif</p></div>
          <div className="flex flex-wrap items-center gap-2">
            <SquircleActionButton
              variant="view"
              icon={Printer}
              label="Cetak Daftar Siswa"
              onClick={() => setIsPrintModalOpen(true)}
              disabled={!students.length}
            />
            <Button type="button" variant="ghost" appearance="outline" disabled={isLockedForTeacher || reviewMode} onClick={markAllPresent} size="sm" className="border-emerald-600/30 text-emerald-700 hover:bg-emerald-50 dark:text-emerald-300 dark:hover:bg-emerald-950/40">
              Tandai Semua Hadir
            </Button>
            <Button type="button" variant="ghost" appearance="outline" size="sm" onClick={() => setReviewMode((current) => !current)} disabled={!students.length}>
              {reviewMode ? 'Kembali ke Checklist' : 'Tinjau Roster'}
            </Button>
          </div>
        </div>
        {rosterLoading && <div className="flex items-center gap-2 border-b border-slate-100 px-5 py-3.5 text-xs font-semibold text-slate-500 dark:border-slate-800"><Clock3 className="animate-spin" size={15} /> Memuat roster siswa dan draft terakhir...</div>}
        {rosterError && <div className="flex items-start gap-2 border-b border-rose-100 bg-rose-50 px-5 py-3.5 text-xs font-semibold text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/30 dark:text-rose-300"><XCircle size={16} className="mt-0.5 shrink-0" /> {rosterError}</div>}
        {reviewMode && <div className="grid gap-3 border-b border-amber-100 bg-amber-50/70 p-5 sm:grid-cols-3 dark:border-amber-900/50 dark:bg-amber-950/20">
          <div><p className="text-xs font-bold text-amber-800 dark:text-amber-300">Review sebelum finalisasi</p><p className="mt-1 text-xs text-amber-700 dark:text-amber-400">Periksa seluruh status roster. Rekomendasi izin/sakit tetap harus dikonfirmasi guru.</p></div>
          <div className="flex flex-wrap items-center gap-2 text-xs font-bold sm:col-span-2 sm:justify-end">
            <span className="rounded-full bg-emerald-100 px-3 py-1 text-emerald-800">Hadir {statusCounts.hadir || 0}</span>
            <span className="rounded-full bg-amber-100 px-3 py-1 text-amber-800">Terlambat {statusCounts.terlambat || 0}</span>
            <span className="rounded-full bg-blue-100 px-3 py-1 text-blue-800">Izin/Sakit {(statusCounts.izin || 0) + (statusCounts.sakit || 0)}</span>
            <span className="rounded-full bg-rose-100 px-3 py-1 text-rose-800">Alpha {statusCounts.alpa || 0}</span>
            <span className="rounded-full bg-slate-200 px-3 py-1 text-slate-700">Belum {unmarkedCount}</span>
          </div>
        </div>}
        <div className="overflow-x-auto">
          <TableRoot fullBleed={false}>
            <TableHeader>
              <TableRow className="bg-slate-50/80 dark:bg-slate-900/80">
                <TableHead className="py-3.5 pl-6 pr-4 font-bold text-slate-700 dark:text-slate-200">Siswa</TableHead>
                <TableHead className="py-3.5 px-4 font-bold text-slate-700 dark:text-slate-200">Status Kehadiran</TableHead>
                <TableHead className="py-3.5 px-4 font-bold text-slate-700 dark:text-slate-200">Jam Hadir</TableHead>
                <TableHead className="py-3.5 px-4 font-bold text-slate-700 dark:text-slate-200">Metode</TableHead>
                <TableHead className="py-3.5 px-4 font-bold text-slate-700 dark:text-slate-200">Catatan</TableHead>
                <TableHead className="py-3.5 pr-6 pl-4 font-bold text-slate-700 dark:text-slate-200">Verifikasi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {students.map((student) => (
                <TableRow key={student.id} className="transition-colors hover:bg-slate-50/90 dark:hover:bg-slate-800/60">
                  <TableCell className="py-3.5 pl-6 pr-4">
                    <b className="text-sm font-extrabold text-slate-900 dark:text-white">{student.full_name}</b>
                    <p className="text-xs font-medium text-slate-500">{student.nis || student.nisn}</p>
                    {student.recommended_status && (
                      <span className="mt-1 inline-block rounded-md bg-amber-100/90 px-2 py-0.5 text-[10px] font-extrabold text-amber-800 dark:bg-amber-950/80 dark:text-amber-300">
                        Rekomendasi: {student.recommended_status}
                      </span>
                    )}
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
                        className={`px-3 py-1.5 text-xs font-extrabold rounded-xl transition-all duration-200 cursor-pointer ${
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
                        className={`px-3 py-1.5 text-xs font-extrabold rounded-xl transition-all duration-200 cursor-pointer ${
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
                        className={`px-3 py-1.5 text-xs font-extrabold rounded-xl transition-all duration-200 cursor-pointer ${
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
                        className={`px-3 py-1.5 text-xs font-extrabold rounded-xl transition-all duration-200 cursor-pointer ${
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
                        className={`px-3 py-1.5 text-xs font-extrabold rounded-xl transition-all duration-200 cursor-pointer ${
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
                        className={`px-3 py-1.5 text-xs font-extrabold rounded-xl transition-all duration-200 cursor-pointer ${
                          student.status === 'dispensasi'
                            ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30 scale-105'
                            : 'bg-indigo-100/80 text-indigo-800 hover:bg-indigo-600 hover:text-white dark:bg-indigo-950/80 dark:text-indigo-300 dark:hover:bg-indigo-600 dark:hover:text-white'
                        }`}
                      >
                        Dispensasi
                      </button>
                    </div>
                  </TableCell>
                  <TableCell className="py-3.5 px-4">
                    <input
                      disabled={isLockedForTeacher || reviewMode}
                      type="time"
                      value={student.arrival_time}
                      onChange={(event) => updateStudent(student.id, { arrival_time: event.target.value })}
                      className="rounded-xl border border-slate-200/80 bg-slate-50/50 p-2 text-xs font-bold text-slate-900 outline-none focus:border-emerald-500 focus:bg-white disabled:opacity-40 dark:border-slate-800 dark:bg-slate-900/60 dark:text-white"
                    />
                  </TableCell>
                  <TableCell className="py-3.5 px-4">
                    <Badge color="emerald" size="sm">
                      {student.recorded_method || 'manual'}
                    </Badge>
                  </TableCell>
                  <TableCell className="py-3.5 px-4">
                    <input
                      disabled={isLockedForTeacher || reviewMode}
                      value={student.notes}
                      onChange={(event) => updateStudent(student.id, { notes: event.target.value })}
                      className="w-full rounded-xl border border-slate-200/80 bg-slate-50/50 p-2 text-xs text-slate-900 outline-none focus:border-emerald-500 focus:bg-white disabled:opacity-40 dark:border-slate-800 dark:bg-slate-900/60 dark:text-white"
                      placeholder="Catatan..."
                    />
                  </TableCell>
                  <TableCell className="py-3.5 pr-6 pl-4">
                    <Badge color={student.verification_status === 'verified' ? 'success' : 'gray'} size="sm">
                      {student.verification_status === 'verified' ? 'Terverifikasi' : 'Belum'}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </TableRoot>
        </div>
        {!students.length && <div className="p-12 text-center text-sm font-semibold text-slate-500">Pilih jadwal yang memiliki siswa aktif.</div>}
         <div className="sticky bottom-0 flex flex-wrap justify-end gap-3 border-t border-slate-200/80 bg-white/95 p-4 backdrop-blur dark:border-slate-800 dark:bg-[#1B2433]/95">
           <Button variant="ghost" appearance="outline" disabled={busy || !students.length || isLockedForTeacher} onClick={() => save(false)} size="md" className="border-emerald-600 text-emerald-700 hover:bg-emerald-50 dark:text-emerald-300 dark:hover:bg-emerald-950/40 font-extrabold">
             <Save size={17} className="mr-1.5" /> Simpan Draft
           </Button>
           <Button variant="primary" disabled={busy || !students.length || sessionFinal || isLockedForTeacher || unmarkedCount > 0} onClick={() => save(true)} size="md" className="bg-[#0E5C44] hover:bg-[#0b4835] text-white font-extrabold shadow-md">
             <ShieldCheck size={17} className="mr-1.5" /> Finalisasi
           </Button>
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
        ? (isHomeroomReviewer ? lmsPresensiService.getHomeroomPermissions({ status: 'submitted' }) : lmsPresensiService.getPermissions({ status: 'submitted' })).catch(() => null)
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
    <motion.div initial="hidden" animate="visible" variants={containerVariants} className="space-y-6">
      {/* BREADCRUMB NAV */}
      <AppBreadcrumb items={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Absensi Kelas & Mata Pelajaran' }]} />

      {/* MODERN HERO CARD HEADER (MATCHING PORTAL ORANG TUA / SISWA STYLE) */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
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
                    Presensi Jam Mengajar Active
                  </span>
                  <span className="inline-flex items-center rounded-full bg-emerald-100 px-3 py-0.5 text-xs font-bold text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/60">
                    Sistem Validasi Server
                  </span>
                </div>
                <h1 className="mt-1.5 text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                  Absensi Kelas & Mata Pelajaran
                </h1>
                <p className="mt-0.5 text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-300 max-w-2xl">
                  Pencatatan presensi siswa sesuai jadwal mata pelajaran aktif dengan pengawasan keamanan jam mengajar.
                </p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      <motion.div variants={itemVariants} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Metric icon={FilePlus2} label="Izin Membutuhkan Verifikasi" subtext="Pengajuan izin/sakit siswa" value={counts.permissions} tag="Verifikasi" tone="blue" />
        <Metric icon={AlertCircle} label="Pengajuan Koreksi" subtext="Permohonan koreksi presensi" value={counts.corrections} tag="Koreksi" tone="amber" />
        <Metric icon={HeartPulse} label="Tindak Lanjut Siswa" subtext="Catatan BK / Musyrif" value={counts.followUps} tag="Tindak Lanjut" tone="violet" />
        <Metric icon={BookOpenCheck} label="Status Jadwal Harian" subtext="Jadwal mengajar aktif" value="Aktif" tag="Sesi Aktif" tone="emerald" />
      </motion.div>

      <motion.div variants={itemVariants}>
        <TeacherWorkspace activeScheduleId={activeScheduleId} activeDate={activeDate} requestedSessionId={routeSessionId} />
      </motion.div>
    </motion.div>
  )
}
