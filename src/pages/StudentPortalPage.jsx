import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  AlertCircle, Award, BookOpen, BookOpenCheck, CalendarCheck, CalendarDays, CheckCircle2, ChevronLeft, ChevronRight,
  CircleHelp, ClipboardList, Clock3, FileCheck2, GraduationCap, HeartHandshake, LayoutDashboard, Loader2, LockKeyhole,
  Megaphone, MessageCircle, Play, RefreshCw, Save, Send, ShieldCheck, TimerReset, UserRound, X,
} from 'lucide-react'
import api from '../services/api'
import { studentLmsService } from '../services/studentLmsService'
import StudentProfileWorkspace from '../components/portal/StudentProfileWorkspace'
import SchoolInformationWorkspace from '../components/portal/SchoolInformationWorkspace'
import ClassScheduleWorkspace from '../components/portal/ClassScheduleWorkspace'
import MaterialsWorkspace from '../components/portal/MaterialsWorkspace'
import AssignmentsWorkspace from '../components/portal/AssignmentsWorkspace'
import TahfizhWorkspace from '../components/portal/TahfizhWorkspace'
import GradesWorkspace from '../components/portal/GradesWorkspace'
import TeacherCommentsWorkspace from '../components/portal/TeacherCommentsWorkspace'
import MutabaahWorkspace from '../components/portal/MutabaahWorkspace'
import AttendanceWorkspace from '../components/portal/AttendanceWorkspace'
import ExamGridsWorkspace from '../components/portal/ExamGridsWorkspace'
import CbtExamsWorkspace from '../components/portal/CbtExamsWorkspace'
import ExamResultsWorkspace from '../components/portal/ExamResultsWorkspace'
import DashboardHeader from '../components/dashboard/DashboardHeader'
import { useAuthStore } from '../stores/authStore'
import { isParentRole } from '../auth/portalResolver'

const tabs = [
  { id: 'ringkasan', label: 'Ringkasan', icon: LayoutDashboard },
  { id: 'profile', label: 'Profil & Biodata', icon: UserRound },
  { id: 'announcements', label: 'Informasi Sekolah', icon: Megaphone },
  { id: 'schedules', label: 'Jadwal', icon: CalendarDays },
  { id: 'materials', label: 'Materi', icon: BookOpen },
  { id: 'assignments', label: 'Tugas', icon: ClipboardList },
  { id: 'tahfizh', label: 'Tahfizh', icon: BookOpenCheck },
  { id: 'grades', label: 'Nilai', icon: Award },
  { id: 'student-notes', label: 'Komentar Guru', icon: MessageCircle },
  { id: 'mutabaah', label: 'Mutabaah', icon: HeartHandshake },
  { id: 'attendance', label: 'Absensi', icon: CalendarCheck },
  { id: 'kisi', label: 'Kisi-kisi', icon: BookOpenCheck },
  { id: 'ujian', label: 'Ujian CBT', icon: FileCheck2 },
  { id: 'hasil', label: 'Hasil', icon: Award },
]

const studentPortalPaths = {
  ringkasan: '/portal-siswa', profile: '/portal-siswa/profil', announcements: '/portal-siswa/informasi-sekolah',
  schedules: '/portal-siswa/jadwal', materials: '/portal-siswa/materi', assignments: '/portal-siswa/tugas',
  tahfizh: '/portal-siswa/tahfizh', grades: '/portal-siswa/nilai', 'student-notes': '/portal-siswa/komentar-guru',
  mutabaah: '/portal-siswa/mutabaah', attendance: '/portal-siswa/absensi', kisi: '/portal-siswa/kisi-kisi',
  ujian: '/portal-siswa/ujian-cbt', hasil: '/portal-siswa/hasil',
}

const formatDate = (value) => value
  ? new Intl.DateTimeFormat('id-ID', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value))
  : 'Tanpa batas waktu'

const formatTimer = (seconds) => {
  const safe = Math.max(0, seconds || 0)
  return `${String(Math.floor(safe / 3600)).padStart(2, '0')}:${String(Math.floor((safe % 3600) / 60)).padStart(2, '0')}:${String(safe % 60).padStart(2, '0')}`
}

const answerPayload = (answers) => Object.entries(answers).map(([soalId, answer]) => ({
  soal_id: soalId,
  jawaban_dipilih: answer.type === 'pg' || answer.type === 'benar_salah' ? answer.value : null,
  jawaban_esai: ['esai', 'isian', 'menjodohkan'].includes(answer.type) ? answer.value : null,
}))

const MOCK_EXAM_SESSIONS = {
  '00000000-0000-0000-0000-000000000001': {
    sesi_id: 'mock-session-pai-1',
    ujian: {
      id: '00000000-0000-0000-0000-000000000001',
      judul_ujian: 'Ujian Harian CBT — Pendidikan Agama Islam (PAI)',
      sisa_waktu_detik: 2700,
      durasi_menit: 45,
    },
    soal: [
      {
        id: 'q-pai-1',
        tipe_soal: 'pg',
        pertanyaan: 'Siapakah nabi pertama yang diutus Allah SWT ke muka bumi?',
        poin: 25,
        opsi: [
          { key: 'A', text: 'Nabi Adam AS' },
          { key: 'B', text: 'Nabi Nuh AS' },
          { key: 'C', text: 'Nabi Ibrahim AS' },
          { key: 'D', text: 'Nabi Muhammad SAW' },
        ],
      },
      {
        id: 'q-pai-2',
        tipe_soal: 'benar_salah',
        pertanyaan: 'Rukun Islam yang ketiga adalah menunaikan ibadah puasa di bulan Ramadhan.',
        poin: 25,
      },
      {
        id: 'q-pai-3',
        tipe_soal: 'isian',
        pertanyaan: 'Sebutkan nama kitab suci yang diturunkan kepada Nabi Isa AS!',
        poin: 25,
      },
      {
        id: 'q-pai-4',
        tipe_soal: 'esai',
        pertanyaan: 'Jelaskan perbedaan antara Rukun Iman dan Rukun Islam secara singkat dan jelas!',
        poin: 25,
      },
    ],
    jawaban_tersimpan: [],
  },
  '00000000-0000-0000-0000-000000000002': {
    sesi_id: 'mock-session-pancasila-1',
    ujian: {
      id: '00000000-0000-0000-0000-000000000002',
      judul_ujian: 'Ujian Harian CBT — Pendidikan Pancasila Kelas X',
      sisa_waktu_detik: 2700,
      durasi_menit: 45,
    },
    soal: [
      {
        id: 'q-pan-1',
        tipe_soal: 'pg',
        pertanyaan: 'Sila pertama dalam Pancasila melambangkan nilai keagamaan dan toleransi umat beragama. Apakah lambang dari Sila Pertama?',
        poin: 25,
        opsi: [
          { key: 'A', text: 'Bintang Emas' },
          { key: 'B', text: 'Rantai Emas' },
          { key: 'C', text: 'Pohon Beringin' },
          { key: 'D', text: 'Kepala Banteng' },
        ],
      },
      {
        id: 'q-pan-2',
        tipe_soal: 'benar_salah',
        pertanyaan: 'Bhinneka Tunggal Ika memiliki arti "Berbeda-beda tetapi tetap satu jua".',
        poin: 25,
      },
      {
        id: 'q-pan-3',
        tipe_soal: 'isian',
        pertanyaan: 'Tuliskan nama rumusan dasar negara yang disampaikan oleh Ir. Soekarno pada tanggal 1 Juni 1945!',
        poin: 25,
      },
      {
        id: 'q-pan-4',
        tipe_soal: 'esai',
        pertanyaan: 'Berikan 3 contoh penerapan nilai-nilai Sila Kemanusiaan yang Adil dan Beradab di lingkungan sekolah!',
        poin: 25,
      },
    ],
    jawaban_tersimpan: [],
  },
}

function Notice({ type = 'error', children, action }) {
  const Icon = type === 'success' ? CheckCircle2 : AlertCircle
  return (
    <div className={`flex items-start gap-3 rounded-2xl border p-4 text-sm ${type === 'success' ? 'border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-200' : 'border-rose-200 bg-rose-50 text-rose-800 dark:border-rose-900 dark:bg-rose-950/30 dark:text-rose-200'}`}>
      <Icon className="mt-0.5 h-5 w-5 shrink-0" />
      <div className="flex-1">{children}</div>{action}
    </div>
  )
}

function MatchingAnswer({ items, value, onChange }) {
  const leftItems = items?.kiri || []
  const rightItems = items?.kanan || []
  let selected = []
  try { selected = JSON.parse(value || '[]') } catch { selected = [] }
  const update = (left, right) => {
    const next = leftItems.map((item) => ({
      kiri: item,
      kanan: item === left ? right : (selected.find((pair) => pair.kiri === item)?.kanan || ''),
    }))
    onChange(JSON.stringify(next))
  }
  return <div className="mt-6 space-y-3">{leftItems.map((left, itemIndex) => {
    const current = selected.find((pair) => pair.kiri === left)?.kanan || ''
    const usedByOthers = selected.filter((pair) => pair.kiri !== left).map((pair) => pair.kanan)
    return <div key={left} className="grid items-center gap-3 rounded-2xl border border-slate-200 p-4 dark:border-slate-700 sm:grid-cols-[1fr_auto_1fr]">
      <span className="text-sm font-semibold">{itemIndex + 1}. {left}</span><ChevronRight className="hidden h-4 w-4 text-slate-400 sm:block" />
      <select value={current} onChange={(event) => update(left, event.target.value)} className="h-11 rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm outline-none focus:border-emerald-500 dark:border-slate-700 dark:bg-slate-800">
        <option value="">-- Pilih pasangan --</option>{rightItems.map((right) => <option key={right} value={right} disabled={usedByOthers.includes(right)}>{right}</option>)}
      </select>
    </div>
  })}</div>
}

function ExamWorkspace({ session, onClose, onFinished }) {
  const [index, setIndex] = useState(0)
  const [answers, setAnswers] = useState(() => Object.fromEntries((session.jawaban_tersimpan || []).map((item) => [item.soal_id, {
    type: session.soal.find((question) => question.id === item.soal_id)?.tipe_soal || (item.jawaban_esai != null ? 'esai' : 'pg'), value: item.jawaban_esai ?? item.jawaban_dipilih ?? '',
  }])))
  const [remaining, setRemaining] = useState(session.ujian.sisa_waktu_detik)
  const [saving, setSaving] = useState(false)
  const [savedAt, setSavedAt] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const finishLock = useRef(false)
  const answersRef = useRef(answers)
  answersRef.current = answers

  const save = useCallback(async (silent = false) => {
    if (!silent) setSaving(true)
    if (String(session.sesi_id).startsWith('mock-session-')) {
      setSavedAt(new Date().toISOString())
      if (!silent) setSaving(false)
      return
    }
    try {
      const response = await studentLmsService.saveAnswers(session.sesi_id, answerPayload(answersRef.current))
      setSavedAt(response.data?.saved_at || new Date().toISOString())
      setError('')
    } catch (err) {
      setError(err.response?.data?.message || 'Jawaban belum berhasil disimpan. Periksa koneksi Anda.')
    } finally {
      if (!silent) setSaving(false)
    }
  }, [session.sesi_id])

  const finish = useCallback(async (automatic = false) => {
    if (finishLock.current) return
    if (!automatic && !window.confirm('Yakin ingin mengumpulkan ujian? Jawaban tidak dapat diubah setelah dikumpulkan.')) return
    finishLock.current = true
    setSubmitting(true)
    if (String(session.sesi_id).startsWith('mock-session-')) {
      onFinished({
        sesi_id: session.sesi_id,
        nilai_final: 85,
        status: 'selesai',
        message: 'Ujian simulasi berhasil dikumpulkan.',
      })
      return
    }
    try {
      const response = await studentLmsService.finishExam(session.sesi_id, answerPayload(answersRef.current))
      onFinished(response.data)
    } catch (err) {
      finishLock.current = false
      setError(err.response?.data?.message || 'Ujian belum berhasil dikumpulkan.')
      setSubmitting(false)
    }
  }, [onFinished, session.sesi_id])

  useEffect(() => {
    const timer = window.setInterval(() => setRemaining((value) => {
      if (value <= 1) {
        window.clearInterval(timer)
        finish(true)
        return 0
      }
      return value - 1
    }), 1000)
    return () => window.clearInterval(timer)
  }, [finish])

  useEffect(() => {
    const timer = window.setTimeout(() => save(true), 900)
    return () => window.clearTimeout(timer)
  }, [answers, save])

  useEffect(() => {
    const guard = (event) => { event.preventDefault(); event.returnValue = '' }
    window.addEventListener('beforeunload', guard)
    return () => window.removeEventListener('beforeunload', guard)
  }, [])

  const question = session.soal[index]
  const answered = Object.values(answers).filter((answer) => {
    if (answer.type !== 'menjodohkan') return String(answer.value || '').trim()
    try { return JSON.parse(answer.value || '[]').some((pair) => pair.kanan) } catch { return false }
  }).length
  const selectAnswer = (value) => setAnswers((current) => ({ ...current, [question.id]: { type: question.tipe_soal, value } }))

  return (
    <div className="fixed inset-0 z-[100] flex flex-col bg-slate-100 text-slate-900 dark:bg-slate-950 dark:text-white">
      <header className="flex min-h-16 items-center justify-between gap-3 bg-[#0E5C44] px-4 py-3 text-white shadow-lg sm:px-6">
        <div className="min-w-0"><p className="text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-200">Ruang Ujian CBT</p><h1 className="truncate text-sm font-bold sm:text-base">{session.ujian.judul_ujian}</h1></div>
        <div className={`flex shrink-0 items-center gap-2 rounded-xl px-3 py-2 font-mono text-sm font-black ${remaining < 300 ? 'bg-rose-500' : 'bg-white/15'}`}><Clock3 className="h-4 w-4" />{formatTimer(remaining)}</div>
      </header>
      {error && <div className="px-4 pt-3 sm:px-6"><Notice>{error}</Notice></div>}
      <main className="grid min-h-0 flex-1 gap-4 overflow-hidden p-4 lg:grid-cols-[250px_1fr] lg:p-6">
        <aside className="hidden overflow-y-auto rounded-[18px] border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900 lg:block">
          <div className="mb-3 flex items-center justify-between text-xs"><b>Navigasi soal</b><span>{answered}/{session.soal.length}</span></div>
          <div className="grid grid-cols-5 gap-2">{session.soal.map((item, itemIndex) => <button key={item.id} onClick={() => setIndex(itemIndex)} className={`aspect-square rounded-lg text-xs font-bold ${itemIndex === index ? 'bg-[#0E5C44] text-white ring-2 ring-emerald-200' : answers[item.id]?.value ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300' : 'bg-slate-100 text-slate-500 dark:bg-slate-800'}`}>{itemIndex + 1}</button>)}</div>
          <div className="mt-5 border-t border-slate-100 pt-4 text-[11px] text-slate-500 dark:border-slate-800"><ShieldCheck className="mb-2 h-5 w-5 text-emerald-600" />Jawaban disimpan otomatis setiap kali berubah.</div>
        </aside>
        <section className="min-h-0 overflow-y-auto rounded-[18px] border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-7">
          <div className="flex items-center justify-between gap-3 border-b border-slate-100 pb-4 dark:border-slate-800"><span className="text-xs font-bold uppercase tracking-wider text-emerald-600">Soal {index + 1} dari {session.soal.length}</span><span className="rounded-lg bg-slate-100 px-2 py-1 text-[11px] font-bold dark:bg-slate-800">{question?.poin} poin</span></div>
          {question ? <div className="mx-auto max-w-3xl py-6">
            <p className="whitespace-pre-wrap text-sm font-semibold leading-7 sm:text-base">{question.pertanyaan}</p>
            {question.tipe_soal === 'pg' && <div className="mt-6 space-y-3">{question.opsi.filter((option) => option.text).map((option) => <button key={option.key} onClick={() => selectAnswer(option.key)} className={`flex w-full items-start gap-3 rounded-2xl border p-4 text-left text-sm transition ${answers[question.id]?.value === option.key ? 'border-emerald-500 bg-emerald-50 ring-2 ring-emerald-100 dark:bg-emerald-950/40' : 'border-slate-200 hover:border-emerald-300 dark:border-slate-700'}`}><span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-slate-100 font-bold dark:bg-slate-800">{option.key}</span><span className="pt-1">{option.text}</span></button>)}</div>}
            {question.tipe_soal === 'benar_salah' && <div className="mt-6 grid gap-3 sm:grid-cols-2">{['Benar', 'Salah'].map((value) => <button key={value} onClick={() => selectAnswer(value.toLowerCase())} className={`h-14 rounded-2xl border font-bold ${answers[question.id]?.value === value.toLowerCase() ? 'border-emerald-500 bg-emerald-50 text-emerald-700 dark:bg-emerald-950' : 'border-slate-200 dark:border-slate-700'}`}>{value}</button>)}</div>}
            {question.tipe_soal === 'esai' && <textarea rows={8} value={answers[question.id]?.value || ''} onChange={(event) => selectAnswer(event.target.value)} placeholder="Tuliskan jawaban Anda dengan jelas..." className="mt-6 w-full rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 dark:border-slate-700 dark:bg-slate-800" />}
            {question.tipe_soal === 'isian' && <input value={answers[question.id]?.value || ''} onChange={(event) => selectAnswer(event.target.value)} placeholder="Tuliskan jawaban singkat..." className="mt-6 h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 dark:border-slate-700 dark:bg-slate-800" />}
            {question.tipe_soal === 'menjodohkan' && <MatchingAnswer items={question.pasangan_menjodohkan} value={answers[question.id]?.value || ''} onChange={selectAnswer} />}
          </div> : <Notice>Soal tidak tersedia. Hubungi pengawas ujian.</Notice>}
        </section>
      </main>
      <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 bg-white px-4 py-3 dark:border-slate-800 dark:bg-slate-900 sm:px-6">
        <div className="flex items-center gap-2 text-[11px] text-slate-500">{saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4 text-emerald-600" />}{saving ? 'Menyimpan...' : savedAt ? `Tersimpan ${new Date(savedAt).toLocaleTimeString('id-ID')}` : 'Penyimpanan otomatis aktif'}</div>
        <div className="flex gap-2">
          <button onClick={() => setIndex((value) => Math.max(0, value - 1))} disabled={index === 0} className="flex h-10 items-center gap-1 rounded-xl border border-slate-200 px-3 text-xs font-bold disabled:opacity-40 dark:border-slate-700"><ChevronLeft className="h-4 w-4" />Sebelumnya</button>
          {index < session.soal.length - 1 ? <button onClick={() => setIndex((value) => value + 1)} className="flex h-10 items-center gap-1 rounded-xl bg-slate-900 px-4 text-xs font-bold text-white dark:bg-white dark:text-slate-900">Berikutnya<ChevronRight className="h-4 w-4" /></button> : <button onClick={() => finish(false)} disabled={submitting} className="flex h-10 items-center gap-2 rounded-xl bg-[#0E5C44] px-4 text-xs font-bold text-white disabled:opacity-60">{submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}Kumpulkan</button>}
        </div>
      </footer>
      <button onClick={() => { if (window.confirm('Keluar dari tampilan ujian? Sesi dan waktu tetap berjalan.')) onClose() }} className="absolute right-2 top-[70px] rounded-full bg-white p-2 text-slate-500 shadow lg:right-5" title="Tutup ruang ujian"><X className="h-4 w-4" /></button>
    </div>
  )
}

export default function StudentPortalPage({ section = 'ringkasan' }) {
  const navigate = useNavigate()
  const user = useAuthStore((state) => state.user)
  const roles = Array.isArray(user?.roles) ? user.roles : []
  const isParent = isParentRole(roles)
  const activeTab = tabs.some(({ id }) => id === section) ? section : 'ringkasan'
  const [dashboard, setDashboard] = useState(null)
  const [lms, setLms] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [startingId, setStartingId] = useState(null)
  const [session, setSession] = useState(null)
  const [result, setResult] = useState(null)
  const [portalRecords, setPortalRecords] = useState([])
  const [permissionsRecords, setPermissionsRecords] = useState([])
  const [examGridsRecords, setExamGridsRecords] = useState([])
  const [resultsData, setResultsData] = useState(null)
  const [reportsRecords, setReportsRecords] = useState([])
  const [panelLoading, setPanelLoading] = useState(false)
  const [dashboardModules, setDashboardModules] = useState({})

  const load = useCallback(async () => {
    setLoading(true); setError('')
    try {
      const [dashboardResponse, lmsResponse] = await Promise.all([api.get('/portal/dashboard'), studentLmsService.overview()])
      setDashboard(dashboardResponse.data.data); setLms(lmsResponse.data)
    } catch (err) {
      setError(err.response?.data?.message || 'Portal LMS belum berhasil dimuat.')
    } finally { setLoading(false) }
  }, [])

  useEffect(() => { load() }, [load])

  const selectTab = (id) => navigate(studentPortalPaths[id])

  useEffect(() => {
    const resources = ['profile', 'announcements', 'schedules', 'materials', 'assignments', 'student-notes', 'tahfizh', 'grades', 'mutabaah', 'attendance']
    if (activeTab === 'attendance') {
      setPanelLoading(true)
      Promise.all([api.get('/portal/attendance'), api.get('/portal/permissions')])
        .then(([attRes, permRes]) => {
          setPortalRecords(attRes.data?.data?.data ?? attRes.data?.data ?? [])
          setPermissionsRecords(permRes.data?.data?.data ?? permRes.data?.data ?? [])
        })
        .catch((err) => setError(err.response?.data?.message || 'Data belum berhasil dimuat.'))
        .finally(() => setPanelLoading(false))
      return
    }

    if (activeTab === 'kisi') {
      setPanelLoading(true)
      api.get('/portal/exam-grids')
        .then((res) => setExamGridsRecords(res.data?.data?.data ?? res.data?.data ?? []))
        .catch(() => setExamGridsRecords([]))
        .finally(() => setPanelLoading(false))
      return
    }

    if (activeTab === 'hasil') {
      setPanelLoading(true)
      Promise.all([api.get('/portal/results'), api.get('/portal/reports')])
        .then(([resRes, repRes]) => {
          setResultsData(resRes.data?.data ?? null)
          setReportsRecords(repRes.data?.data ?? [])
        })
        .catch(() => setResultsData(null))
        .finally(() => setPanelLoading(false))
      return
    }

    if (!resources.includes(activeTab)) return

    const unwrapList = (res) => {
      if (Array.isArray(res?.data?.data?.data)) return res.data.data.data
      if (Array.isArray(res?.data?.data)) return res.data.data
      if (Array.isArray(res?.data)) return res.data
      if (Array.isArray(res)) return res
      return []
    }

    setPanelLoading(true)
    setPortalRecords([])
    api.get(`/portal/${activeTab}`).then((response) => {
      setPortalRecords(unwrapList(response))
    }).catch((err) => setError(err.response?.data?.message || 'Data belum berhasil dimuat.')).finally(() => setPanelLoading(false))
  }, [activeTab])

  useEffect(() => {
    if (activeTab !== 'ringkasan') return
    let cancelled = false
    const resources = ['materials', 'student-notes', 'tahfizh', 'grades', 'attendance']
    const unwrapList = (res) => {
      if (Array.isArray(res?.data?.data?.data)) return res.data.data.data
      if (Array.isArray(res?.data?.data)) return res.data.data
      if (Array.isArray(res?.data)) return res.data
      if (Array.isArray(res)) return res
      return []
    }
    Promise.all(resources.map((resource) => api.get(`/portal/${resource}`)))
      .then((responses) => {
        if (cancelled) return
        setDashboardModules(Object.fromEntries(resources.map((resource, index) => [
          resource,
          unwrapList(responses[index]),
        ])))
      })
      .catch(() => { if (!cancelled) setDashboardModules({}) })
    return () => { cancelled = true }
  }, [activeTab])

  const handleAssignmentSubmit = async (assignmentId, payload) => {
    const formData = new FormData()
    if (payload.jawaban_teks) formData.append('jawaban_teks', payload.jawaban_teks)
    if (payload.file_lampiran) formData.append('file_lampiran', payload.file_lampiran)

    await api.post(`/portal/assignments/${assignmentId}/submit`, formData)
    const response = await api.get('/portal/assignments')
    const unwrapList = (res) => {
      if (Array.isArray(res?.data?.data?.data)) return res.data.data.data
      if (Array.isArray(res?.data?.data)) return res.data.data
      if (Array.isArray(res?.data)) return res.data
      if (Array.isArray(res)) return res
      return []
    }
    setPortalRecords(unwrapList(response))
  }

  const handleSaveMutabaah = async (activityIds) => {
    await api.post('/portal/mutabaah', { activity_ids: activityIds })
    const response = await api.get('/portal/mutabaah')
    setPortalRecords(response.data?.data ?? null)
  }

  const handleSubmitPermission = async (payload) => {
    const formData = new FormData()
    formData.append('type', payload.type)
    formData.append('start_date', payload.start_date)
    formData.append('end_date', payload.end_date)
    formData.append('reason', payload.reason)
    if (payload.attachment) formData.append('attachment', payload.attachment)

    await api.post('/portal/permissions', formData)
    const [attRes, permRes] = await Promise.all([api.get('/portal/attendance'), api.get('/portal/permissions')])
    setPortalRecords(attRes.data?.data?.data ?? attRes.data?.data ?? [])
    setPermissionsRecords(permRes.data?.data?.data ?? permRes.data?.data ?? [])
  }

  const exams = useMemo(() => lms?.exams || [], [lms?.exams])
  const blueprints = useMemo(() => exams.filter((exam) => exam.kisi_kisi), [exams])

  const start = async (exam) => {
    setStartingId(exam.id); setError('')
    if (MOCK_EXAM_SESSIONS[exam.id]) {
      setSession(MOCK_EXAM_SESSIONS[exam.id])
      setStartingId(null)
      return
    }
    try { const response = await studentLmsService.startExam(exam.id); setSession(response.data) }
    catch (err) { setError(err.response?.data?.message || 'Ujian tidak dapat dimulai.') }
    finally { setStartingId(null) }
  }

  const finish = async (examResult) => { setSession(null); setResult(examResult); navigate(studentPortalPaths.hasil); await load() }

  if (loading) return <div className="portal-page animate-pulse space-y-5"><div className="h-36 rounded-[18px] bg-slate-200 dark:bg-slate-800" /><div className="h-12 rounded-2xl bg-slate-200 dark:bg-slate-800" /></div>

  const student = lms?.student || dashboard?.student
  const dashboardCards = [
    ['profile', 'Profil & Biodata', student?.full_name || 'Profil siswa', 'Data identitas dan kelas aktif', UserRound],
    ['announcements', 'Informasi Sekolah', dashboard?.announcements?.length || 0, 'informasi terbaru', Megaphone],
    ['schedules', 'Jadwal', dashboard?.schedules_today?.length || 0, 'pelajaran hari ini', CalendarDays],
    ['materials', 'Materi', dashboardModules.materials?.length || 0, 'materi dipublikasikan', BookOpen],
    ['assignments', 'Tugas', dashboard?.active_assignments?.length || 0, 'tugas aktif', ClipboardList],
    ['tahfizh', 'Tahfizh', dashboard?.kpi?.total_tahfizh_ayat || 0, 'total ayat tercatat', BookOpenCheck],
    ['grades', 'Nilai', dashboard?.latest_grades?.length || dashboardModules.grades?.length || 0, 'nilai terbaru', Award],
    ['student-notes', 'Komentar Guru', dashboardModules['student-notes']?.length || 0, 'komentar tersedia', MessageCircle],
    ['mutabaah', 'Mutabaah', dashboard?.kpi?.mutabaah_status || 'Belum diisi', 'status hari ini', HeartHandshake],
    ['attendance', 'Absensi', dashboard?.attendance_today || 'Belum diinput', 'kehadiran hari ini', CalendarCheck],
    ['kisi', 'Kisi-kisi', blueprints.length, 'kisi-kisi tersedia', BookOpenCheck],
    ['ujian', 'Ujian CBT', lms?.summary?.available || 0, 'siap dikerjakan', FileCheck2],
    ['hasil', 'Hasil', exams.filter((exam) => exam.latest_result).length, 'hasil ujian tersedia', Award],
  ]

  return (
    <div className="portal-page min-w-0 space-y-5 pb-12 text-slate-800 dark:text-slate-100">
      {session && <ExamWorkspace session={session} onClose={() => setSession(null)} onFinished={finish} />}
      <DashboardHeader
        title={`Selamat datang, ${student?.full_name || 'Siswa'}`}
        subtitle="Akses jadwal, tugas, materi, CBT, nilai, Tahfizh, dan Mutaba'ah dalam satu ruang belajar."
        roleName="Siswa"
        unitName={student?.unit?.name || student?.education_unit?.name}
      />
        {error && (
          <div className="flex items-center gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-xs font-bold text-rose-700 dark:border-rose-900 dark:bg-rose-950/30">
            <AlertCircle className="h-5 w-5" />
            <span className="flex-1">{error}</span>
            <button onClick={load}><RefreshCw className="h-4 w-4" /></button>
          </div>
        )}

        {panelLoading && activeTab === 'profile' && (
          <div className="animate-pulse space-y-5">
            <div className="h-56 rounded-[18px] bg-slate-200 dark:bg-slate-800" />
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
              {[1,2,3,4].map((item) => <div key={item} className="h-32 rounded-[18px] bg-slate-200 dark:bg-slate-800" />)}
            </div>
            <div className="h-96 rounded-[18px] bg-slate-200 dark:bg-slate-800" />
          </div>
        )}

        {activeTab === 'ringkasan' && (
          <section className="space-y-5">
            <div className="rounded-[18px] border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div className="flex flex-wrap items-end justify-between gap-3">
                <div>
                  <h2 className="text-base font-bold">Dashboard Siswa</h2>
                  <p className="mt-1 text-xs text-slate-500">Ringkasan baca-saja dari seluruh layanan portal. Pengelolaan data dilakukan oleh modul utama.</p>
                </div>
                <span className="rounded-full bg-emerald-50 px-3 py-1.5 text-[11px] font-bold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                  PORTAL SISWA AKTIF
                </span>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {dashboardCards.map(([id, label, value, description, Icon]) => (
                <article key={id} className="flex min-h-40 flex-col rounded-[18px] border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                      <Icon className="h-5 w-5" />
                    </div>
                    <span className="rounded-full bg-slate-100 px-2 py-1 text-[9px] font-black uppercase tracking-wider text-slate-500 dark:bg-slate-800">Buka</span>
                  </div>
                  <p className="mt-4 text-xs font-bold text-slate-500">{label}</p>
                  <p className="mt-1 line-clamp-1 text-xl font-black text-slate-900 dark:text-white">{value}</p>
                  <p className="mt-1 text-[11px] text-slate-400">{description}</p>
                  <button type="button" onClick={() => selectTab(id)} className="mt-auto pt-4 text-left text-xs font-bold text-emerald-700 hover:text-emerald-600 dark:text-emerald-400">
                    Buka halaman →
                  </button>
                </article>
              ))}
            </div>

            <div className="grid gap-4 lg:grid-cols-3">
              <div className="rounded-[18px] border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 lg:col-span-2">
                <h3 className="text-sm font-bold">Tugas terdekat</h3>
                <div className="mt-3 divide-y divide-slate-100 dark:divide-slate-800">
                  {(dashboard?.active_assignments || []).slice(0, 4).map((item) => (
                    <div key={item.id} className="flex items-center justify-between gap-3 py-3">
                      <div>
                        <p className="text-xs font-bold">{item.judul}</p>
                        <p className="mt-1 text-[11px] text-slate-500">{item.subject?.name || 'Mata pelajaran'}</p>
                      </div>
                      <span className="text-[10px] font-semibold text-amber-600">{formatDate(item.deadline)}</span>
                    </div>
                  ))}
                  {!dashboard?.active_assignments?.length && <p className="py-8 text-center text-xs text-slate-400">Tidak ada tugas aktif.</p>}
                </div>
              </div>

              <aside className="rounded-[18px] bg-slate-900 p-5 text-white dark:bg-emerald-950">
                <p className="text-xs text-slate-300">Kelas aktif</p>
                <p className="mt-1 text-lg font-bold">{student?.kelas?.nama_kelas || student?.kelas?.name || 'Belum ditentukan'}</p>
                <p className="mt-3 text-xs text-slate-400">NIS: {student?.nis || '-'}</p>
                <p className="mt-5 text-xs text-slate-300">Portal Siswa memantau progres akademik, ibadah, tugas, dan ujian CBT secara terpadu.</p>
              </aside>
            </div>
          </section>
        )}

        {!panelLoading && activeTab === 'profile' && (
          <StudentProfileWorkspace student={portalRecords} dashboard={dashboard || {}} onNavigate={selectTab} readOnly />
        )}

        {activeTab === 'announcements' && (
          <SchoolInformationWorkspace student={student} embedded />
        )}

        {panelLoading && ['schedules','materials','assignments','tahfizh','grades','mutabaah','attendance','kisi','ujian','hasil'].includes(activeTab) && (
          <div className="flex min-h-64 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
          </div>
        )}

        {!panelLoading && activeTab === 'schedules' && (
          <ClassScheduleWorkspace schedules={portalRecords} loading={panelLoading} />
        )}

        {!panelLoading && activeTab === 'materials' && (
          <MaterialsWorkspace materials={portalRecords} loading={panelLoading} />
        )}

        {!panelLoading && activeTab === 'assignments' && (
          <AssignmentsWorkspace
            assignments={portalRecords}
            onSubmitAssignment={handleAssignmentSubmit}
            isParent={isParent}
            loading={panelLoading}
          />
        )}

        {!panelLoading && activeTab === 'tahfizh' && (
          <TahfizhWorkspace logs={portalRecords} target={dashboard?.tahfizh_target} loading={panelLoading} />
        )}

        {!panelLoading && activeTab === 'grades' && (
          <GradesWorkspace grades={portalRecords} loading={panelLoading} />
        )}

        {!panelLoading && activeTab === 'student-notes' && (
          <TeacherCommentsWorkspace comments={portalRecords} loading={panelLoading} />
        )}

        {!panelLoading && activeTab === 'mutabaah' && (
          <MutabaahWorkspace
            mutabaah={portalRecords}
            onSaveMutabaah={handleSaveMutabaah}
            isParent={isParent}
            readOnly
            loading={panelLoading}
          />
        )}

        {!panelLoading && activeTab === 'attendance' && (
          <AttendanceWorkspace
            attendanceLogs={portalRecords}
            permissionsHistory={permissionsRecords}
            onSubmitPermission={handleSubmitPermission}
            isParent={isParent}
            loading={panelLoading}
          />
        )}

        {!panelLoading && activeTab === 'kisi' && (
          <ExamGridsWorkspace grids={examGridsRecords.length ? examGridsRecords : blueprints} loading={panelLoading} />
        )}

        {!panelLoading && activeTab === 'ujian' && (
          <CbtExamsWorkspace
            lmsData={lms}
            onStartExam={start}
            isParent={isParent}
            startingId={startingId}
            loading={panelLoading}
          />
        )}

        {!panelLoading && activeTab === 'hasil' && (
          <ExamResultsWorkspace resultsData={resultsData} reports={reportsRecords} loading={panelLoading} />
        )}
    </div>
  )
}
