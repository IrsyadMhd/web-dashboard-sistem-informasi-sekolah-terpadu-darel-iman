import { useEffect, useMemo, useState } from 'react'
import { AlertCircle, BookOpenCheck, Clock3, FilePlus2, HeartPulse, Lock, PlayCircle, Save, ShieldCheck, Square, XCircle } from 'lucide-react'
import Swal from 'sweetalert2'
import { useParams, useSearchParams } from 'react-router-dom'
import { lmsPresensiService } from '../services/lmsPresensiService'
import { useAuthStore } from '../stores/authStore'
import { AttendanceCapturePanel, AttendanceMethodSelector } from '../components/attendance/AttendanceCapturePanels'
import { WorkflowStepBar } from '../components/common/WorkflowStepBar'

const today = new Date().toLocaleDateString('en-CA')
const unwrapPage = (response) => {
  const payload = response?.data?.data || response?.data || []
  return Array.isArray(payload) ? payload : (payload?.data || [])
}

function Metric({ icon: Icon, label, value, tone = 'emerald' }) {
  const tones = {
    emerald: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300',
    amber: 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300',
    blue: 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300',
    violet: 'bg-violet-50 text-violet-700 dark:bg-violet-950/40 dark:text-violet-300',
    rose: 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300',
  }
  return (
    <article className="rounded-[18px] border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg dark:border-slate-700 dark:bg-[#1B2433]">
      <div className={`mb-3 grid h-10 w-10 place-items-center rounded-xl ${tones[tone] || tones.emerald}`}>
        <Icon size={20} />
      </div>
      <p className="text-2xl font-extrabold text-slate-900 dark:text-white">{value ?? 0}</p>
      <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">{label}</p>
    </article>
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

      <div className="grid gap-4 rounded-[18px] border border-slate-200 bg-white p-5 md:grid-cols-3 dark:border-slate-700 dark:bg-[#1B2433]">
        <label className="text-xs font-bold text-slate-600 dark:text-slate-300">Tanggal
          <input disabled={activeLogin} type="date" value={date} onChange={(event) => setDate(event.target.value)} className="mt-2 w-full rounded-xl border border-slate-200 bg-transparent p-3 outline-none focus:ring-2 focus:ring-[#3FBF75] disabled:bg-slate-100 dark:disabled:bg-slate-800" />
        </label>
        <label className="text-xs font-bold text-slate-600 md:col-span-2 dark:text-slate-300">Jadwal Pelajaran
          <select disabled={activeLogin} value={scheduleId} onChange={(event) => setScheduleId(event.target.value)} className="mt-2 w-full rounded-xl border border-slate-200 bg-transparent p-3 outline-none focus:ring-2 focus:ring-[#3FBF75] disabled:bg-slate-100 dark:disabled:bg-slate-800">
            <option value="">{schedules.length === 0 ? 'Belum ada jadwal pelajaran' : 'Pilih Jadwal Pelajaran'}</option>
            {schedules.map((item) => <option key={item.id} value={item.id}>{item.subject?.name || item.subject?.nama_mapel} · {item.kelas?.nama_kelas || item.kelas?.name} · {item.time_start?.slice(0, 5)}–{item.time_end?.slice(0, 5)}</option>)}
          </select>
        </label>
        {selected && <div className="md:col-span-3 flex flex-wrap items-start justify-between gap-3 rounded-xl bg-emerald-50 p-4 text-sm text-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-200">
          <div className="min-w-0">
            <b>{selected.subject?.name}</b> · {selected.kelas?.nama_kelas} · {selected.employee?.nama_lengkap} · {selected.time_start?.slice(0, 5)}–{selected.time_end?.slice(0, 5)}
          </div>
          {step04Blocked ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-800 dark:bg-amber-900 dark:text-amber-200">
              Step 04: {teachingSessionStatus || 'Belum Aktif'}
            </span>
          ) : isScheduleTimeActive ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200">
              Jam Pelajaran Aktif
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 rounded-full bg-rose-100 px-3 py-1 text-xs font-bold text-rose-800 dark:bg-rose-950 dark:text-rose-300">
              Di Luar Jam Pelajaran
            </span>
          )}
        </div>}
        {selected?.requires_substitute_reason && (
          <label className="text-xs font-bold text-amber-700 md:col-span-3 dark:text-amber-300">
            Alasan mengambil presensi sebagai wali kelas/pengganti
            <textarea required value={substituteReason} onChange={(event) => setSubstituteReason(event.target.value)} className="mt-2 w-full rounded-xl border border-amber-300 bg-amber-50 p-3 text-slate-900 dark:bg-amber-950/20 dark:text-white" rows="2" placeholder="Contoh: Guru mata pelajaran berhalangan hadir." />
          </label>
        )}
        <label className="text-xs font-bold text-slate-600 dark:text-slate-300">Pertemuan ke-
          <input disabled={isLockedForTeacher} type="number" min="1" value={meeting} onChange={(event) => setMeeting(event.target.value)} className="mt-2 w-full rounded-xl border border-slate-200 bg-transparent p-3 disabled:opacity-50" />
        </label>
        <label className="text-xs font-bold text-slate-600 md:col-span-2 dark:text-slate-300">Topik
          <input disabled={isLockedForTeacher} value={topic} onChange={(event) => setTopic(event.target.value)} className="mt-2 w-full rounded-xl border border-slate-200 bg-transparent p-3 disabled:opacity-50" placeholder="Topik pembelajaran" />
        </label>
        <label className="text-xs font-bold text-slate-600 md:col-span-3 dark:text-slate-300">Catatan
          <textarea disabled={isLockedForTeacher} value={notes} onChange={(event) => setNotes(event.target.value)} className="mt-2 w-full rounded-xl border border-slate-200 bg-transparent p-3 disabled:opacity-50" rows="2" />
        </label>
      </div>

      <section className="space-y-4 rounded-[18px] border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-[#1B2433]">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div><h2 className="font-extrabold text-slate-900 dark:text-white">Metode Presensi</h2><p className="text-xs text-slate-500">Semua metode masuk ke draft yang sama dan dapat diperiksa sebelum finalisasi.</p></div>
          <div className="flex flex-wrap items-center gap-2">
            <span className={`rounded-full px-3 py-1 text-xs font-bold ${captureStarted ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'}`}>
              {captureStarted ? 'Capture aktif' : session?.session_closed_at ? 'Capture ditutup' : 'Capture belum dibuka'}
            </span>
            {!captureStarted && !sessionFinal && (
              <button type="button" onClick={startCapture} disabled={captureBusy || busy || isLockedForTeacher} className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-[#0E5C44] px-4 py-2 text-xs font-bold text-white shadow-sm disabled:cursor-not-allowed disabled:opacity-40">
                <PlayCircle size={16} /> {captureBusy ? 'Membuka...' : 'Mulai Capture'}
              </button>
            )}
            {captureStarted && (
              <button type="button" onClick={closeCapture} disabled={captureBusy} className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-slate-300 px-4 py-2 text-xs font-bold text-slate-700 disabled:opacity-40 dark:border-slate-600 dark:text-slate-200">
                <Square size={15} /> {captureBusy ? 'Menutup...' : 'Tutup Capture'}
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

      <div className="overflow-hidden rounded-[18px] border border-slate-200 bg-white dark:border-slate-700 dark:bg-[#1B2433]">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 p-4 dark:border-slate-700">
          <div><h2 className="font-extrabold text-slate-900 dark:text-white">Daftar Siswa</h2><p className="text-xs text-slate-500">{students.length} siswa aktif</p></div>
          <div className="flex flex-wrap gap-2">
            <button type="button" disabled={isLockedForTeacher || reviewMode} onClick={markAllPresent} className="min-h-11 rounded-xl bg-emerald-50 px-4 py-2 text-sm font-bold text-[#0E5C44] hover:-translate-y-0.5 disabled:opacity-40">Tandai Semua Hadir</button>
            <button type="button" onClick={() => setReviewMode((current) => !current)} disabled={!students.length} className="min-h-11 rounded-xl border border-slate-200 px-4 py-2 text-sm font-bold text-slate-700 disabled:opacity-40 dark:border-slate-700 dark:text-slate-200">
              {reviewMode ? 'Kembali ke Checklist' : 'Tinjau Roster'}
            </button>
          </div>
        </div>
        {rosterLoading && <div className="flex items-center gap-2 border-b border-slate-100 px-4 py-3 text-xs font-semibold text-slate-500 dark:border-slate-800"><Clock3 className="animate-spin" size={15} /> Memuat roster siswa dan draft terakhir...</div>}
        {rosterError && <div className="flex items-start gap-2 border-b border-rose-100 bg-rose-50 px-4 py-3 text-xs font-semibold text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/30 dark:text-rose-300"><XCircle size={16} className="mt-0.5 shrink-0" /> {rosterError}</div>}
        {reviewMode && <div className="grid gap-3 border-b border-amber-100 bg-amber-50/70 p-4 sm:grid-cols-3 dark:border-amber-900/50 dark:bg-amber-950/20">
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
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="sticky top-0 bg-slate-50 text-xs uppercase text-slate-500 dark:bg-slate-900"><tr><th className="p-4">Siswa</th><th>Status</th><th>Jam Hadir</th><th>Metode</th><th>Catatan</th><th>Verifikasi</th></tr></thead>
             <tbody>{students.map((student) => <tr key={student.id} className="border-t border-slate-100 hover:bg-emerald-50/40 dark:border-slate-800 dark:hover:bg-emerald-950/20">
               <td className="p-4"><b className="text-slate-900 dark:text-white">{student.full_name}</b><p className="text-xs text-slate-500">{student.nis || student.nisn}</p>{student.recommended_status && <p className="mt-1 text-[10px] font-bold text-amber-700 dark:text-amber-300">Rekomendasi: {student.recommended_status}</p>}</td>
               <td>
                 <div className="flex flex-wrap gap-1 my-1">
                   {['belum_diverifikasi', 'belum_diisi'].includes(student.status) && <span className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-300">Belum Diisi</span>}
                  <button
                    type="button"
                     disabled={isLockedForTeacher || reviewMode}
                    onClick={() => updateStudent(student.id, { status: 'hadir', recorded_method: 'manual' })}
                    className={`px-2.5 py-1 text-xs font-bold rounded-lg transition ${
                      student.status === 'hadir'
                        ? 'bg-emerald-600 text-white shadow-sm ring-2 ring-emerald-600'
                        : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-300'
                    }`}
                  >
                    Hadir
                  </button>
                  <button
                    type="button"
                     disabled={isLockedForTeacher || reviewMode}
                    onClick={() => updateStudent(student.id, { status: 'terlambat', recorded_method: 'manual' })}
                    className={`px-2.5 py-1 text-xs font-bold rounded-lg transition ${
                      student.status === 'terlambat'
                        ? 'bg-amber-600 text-white shadow-sm ring-2 ring-amber-600'
                        : 'bg-amber-50 text-amber-700 hover:bg-amber-100 dark:bg-amber-950/40 dark:text-amber-300'
                    }`}
                  >
                    Terlambat
                  </button>
                  <button
                    type="button"
                     disabled={isLockedForTeacher || reviewMode}
                    onClick={() => updateStudent(student.id, { status: 'izin', recorded_method: 'manual' })}
                    className={`px-2.5 py-1 text-xs font-bold rounded-lg transition ${
                      student.status === 'izin'
                        ? 'bg-blue-600 text-white shadow-sm ring-2 ring-blue-600'
                        : 'bg-blue-50 text-blue-700 hover:bg-blue-100 dark:bg-blue-950/40 dark:text-blue-300'
                    }`}
                  >
                    Izin
                  </button>
                  <button
                    type="button"
                     disabled={isLockedForTeacher || reviewMode}
                    onClick={() => updateStudent(student.id, { status: 'sakit', recorded_method: 'manual' })}
                    className={`px-2.5 py-1 text-xs font-bold rounded-lg transition ${
                      student.status === 'sakit'
                        ? 'bg-violet-600 text-white shadow-sm ring-2 ring-violet-600'
                        : 'bg-violet-50 text-violet-700 hover:bg-violet-100 dark:bg-violet-950/40 dark:text-violet-300'
                    }`}
                  >
                    Sakit
                  </button>
                  <button
                    type="button"
                     disabled={isLockedForTeacher || reviewMode}
                    onClick={() => updateStudent(student.id, { status: 'alpa', recorded_method: 'manual' })}
                    className={`px-2.5 py-1 text-xs font-bold rounded-lg transition ${
                      student.status === 'alpa'
                        ? 'bg-rose-600 text-white shadow-sm ring-2 ring-rose-600'
                        : 'bg-rose-50 text-rose-700 hover:bg-rose-100 dark:bg-rose-950/40 dark:text-rose-300'
                    }`}
                  >
                   Alpha
                  </button>
                  <button
                    type="button"
                    disabled={isLockedForTeacher || reviewMode}
                    onClick={() => updateStudent(student.id, { status: 'dispensasi', recorded_method: 'manual' })}
                    className={`px-2.5 py-1 text-xs font-bold rounded-lg transition ${student.status === 'dispensasi' ? 'bg-sky-600 text-white shadow-sm ring-2 ring-sky-600' : 'bg-sky-50 text-sky-700 hover:bg-sky-100 dark:bg-sky-950/40 dark:text-sky-300'}`}
                  >
                    Dispensasi
                  </button>
                </div>
              </td>
              <td><input disabled={isLockedForTeacher || reviewMode} type="time" value={student.arrival_time} onChange={(event) => updateStudent(student.id, { arrival_time: event.target.value })} className="rounded-lg border border-slate-200 bg-transparent p-2 disabled:opacity-40" /></td>
              <td><span className="rounded-full bg-emerald-50 px-2 py-1 text-xs font-bold text-[#0E5C44]">{student.recorded_method || 'belum'}</span></td>
              <td><input disabled={isLockedForTeacher || reviewMode} value={student.notes} onChange={(event) => updateStudent(student.id, { notes: event.target.value })} className="rounded-lg border border-slate-200 bg-transparent p-2 disabled:opacity-40" /></td>
              <td><span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-bold text-slate-600">{student.verification_status === 'verified' ? 'Terverifikasi' : 'Belum'}</span></td>
            </tr>)}</tbody>
          </table>
        </div>
        {!students.length && <div className="p-12 text-center text-sm text-slate-500">Pilih jadwal yang memiliki siswa aktif.</div>}
         <div className="sticky bottom-0 flex flex-wrap justify-end gap-3 border-t border-slate-200 bg-white/95 p-4 backdrop-blur dark:border-slate-700 dark:bg-[#1B2433]/95">
           <button disabled={busy || !students.length || isLockedForTeacher} onClick={() => save(false)} className="flex items-center gap-2 rounded-xl border border-[#0E5C44] px-5 py-3 font-bold text-[#0E5C44] disabled:opacity-40"><Save size={17} /> Simpan Draft</button>
           <button disabled={busy || !students.length || sessionFinal || isLockedForTeacher || unmarkedCount > 0} onClick={() => save(true)} className="flex items-center gap-2 rounded-xl bg-[#0E5C44] px-5 py-3 font-bold text-white shadow-lg transition hover:scale-[1.03] disabled:opacity-40"><ShieldCheck size={17} /> Finalisasi</button>
         </div>
      </div>
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

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">Absensi Kelas & Mata Pelajaran</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">Pencatatan presensi siswa sesuai jadwal mata pelajaran aktif dengan pengawasan keamanan jam mengajar.</p>
        </div>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Metric icon={FilePlus2} label="Izin Membutuhkan Verifikasi" value={counts.permissions} tone="blue" />
        <Metric icon={AlertCircle} label="Pengajuan Koreksi" value={counts.corrections} tone="amber" />
        <Metric icon={HeartPulse} label="Tindak Lanjut Siswa" value={counts.followUps} tone="violet" />
        <Metric icon={BookOpenCheck} label="Status Jadwal Harian" value="Aktif" tone="emerald" />
      </div>

      <TeacherWorkspace activeScheduleId={activeScheduleId} activeDate={activeDate} requestedSessionId={routeSessionId} />
    </div>
  )
}
