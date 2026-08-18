import { useCallback, useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import {
  AlertCircle, Award, BookOpen, BookOpenCheck, CalendarCheck, CalendarDays, CheckCircle2, ChevronDown, ClipboardList, Download, FileCheck2, FileText, HeartHandshake, Loader2, Megaphone, MessageCircle, RefreshCw, Send, Sparkles, UserCheck, UserRound, WalletCards, X
} from 'lucide-react'
import { familyPortalService } from '../services/familyPortalService'
import api from '../services/api'
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
import ChatGuruWorkspace from '../components/portal/ChatGuruWorkspace'
import { useAuthStore } from '../stores/authStore'

const menu = [
  ['ringkasan', 'Dashboard', Sparkles],
  ['profile', 'Profil & Biodata', UserRound],
  ['announcements', 'Informasi Sekolah', Megaphone],
  ['schedules', 'Jadwal', CalendarDays],
  ['materials', 'Materi', BookOpen],
  ['assignments', 'Tugas', ClipboardList],
  ['tahfizh', 'Tahfizh', BookOpenCheck],
  ['grades', 'Nilai', Award],
  ['student-notes', 'Komentar Guru', MessageCircle],
  ['mutabaah', 'Mutabaah', HeartHandshake],
  ['attendance', 'Absensi', CalendarCheck],
  ['kisi', 'Kisi-kisi', BookOpenCheck],
  ['ujian', 'Ujian CBT', FileCheck2],
  ['hasil', 'Hasil & Rapor', Award],
  ['chat', 'Chat Guru', MessageCircle],
  ['bills', 'Tagihan', WalletCards],
]

const rupiah = (value) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(Number(value || 0))
const date = (value) => value ? new Intl.DateTimeFormat('id-ID', { dateStyle: 'medium' }).format(new Date(value)) : '-'
const unwrap = (response) => {
  if (Array.isArray(response?.data?.data?.data)) return response.data.data.data
  if (Array.isArray(response?.data?.data)) return response.data.data
  if (Array.isArray(response?.data)) return response.data
  if (Array.isArray(response)) return response
  return []
}

function Empty({ text }) { return <div className="py-16 text-center text-xs text-slate-400"><FileText className="mx-auto mb-3 h-10 w-10 text-slate-300" />{text}</div> }
function Status({ value }) { const good = ['PAID', 'Hadir', 'hadir', 'verified', 'published', 'dikumpulkan'].includes(value); return <span className={`rounded-full px-2.5 py-1 text-[10px] font-black uppercase ${good ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300' : 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'}`}>{value || 'Aktif'}</span> }

export default function ParentPortalPage() {
  const user = useAuthStore((state) => state.user)
  const [searchParams, setSearchParams] = useSearchParams()
  const requestedTab = searchParams.get('tab')
  const requestedChild = searchParams.get('child') || ''
  const [children, setChildren] = useState([])
  const [childId, setChildId] = useState('')
  const [dashboard, setDashboard] = useState(null)
  const [active, setActive] = useState(() => menu.some(([id]) => id === requestedTab) ? requestedTab : 'ringkasan')
  const [records, setRecords] = useState([])
  const [permissionsRecords, setPermissionsRecords] = useState([])
  const [examGridsRecords, setExamGridsRecords] = useState([])
  const [resultsData, setResultsData] = useState(null)
  const [cbtOverview, setCbtOverview] = useState(null)
  const [reportsRecords, setReportsRecords] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [permissionOpen, setPermissionOpen] = useState(false)
  const [permission, setPermission] = useState({ type: 'Sakit', start_date: new Date().toISOString().slice(0, 10), end_date: new Date().toISOString().slice(0, 10), reason: '' })
  const [contacts, setContacts] = useState([])
  const [teacherId, setTeacherId] = useState('')
  const [messages, setMessages] = useState([])
  const [message, setMessage] = useState('')

  useEffect(() => {
    familyPortalService.children().then((r) => {
      const list = r.data || []
      setChildren(list)
      if (list.length > 0) {
        // Pulihkan anak aktif dari URL bila masih terhubung (aman: backend
        // selalu memvalidasi ownership), fallback ke anak pertama.
        const persisted = list.find((c) => c.id === requestedChild)
        setChildId(persisted?.id || list[0]?.id || '')
      } else {
        setLoading(false)
      }
    }).catch(() => {
      setError('Data anak belum dapat dimuat.')
      setLoading(false)
    })
  }, [requestedChild])

  const selectChild = (id) => {
    // Bersihkan data anak sebelumnya agar tidak sempat tampil (anti flash / anti leak).
    setChildId(id)
    setRecords([])
    setDashboard(null)
    setResultsData(null)
    setCbtOverview(null)
    setExamGridsRecords([])
    setReportsRecords([])
    setPermissionsRecords([])
    setContacts([])
    setMessages([])
    setSearchParams((params) => {
      const next = new URLSearchParams(params)
      next.set('child', id)
      return next
    }, { replace: true })
  }

  const load = useCallback(async () => {
    if (!childId) {
      setLoading(false)
      return
    }
    setLoading(true)
    setError('')
    try {
      if (active === 'ringkasan') {
        const res = await familyPortalService.dashboard(childId)
        setDashboard(res.data || res)
        setRecords([])
      } else if (active === 'profile') {
        const [profileResponse, dashboardResponse] = await Promise.all([
          familyPortalService.list('profile', childId),
          familyPortalService.dashboard(childId),
        ])
        setRecords(profileResponse.data || {})
        setDashboard(dashboardResponse.data || dashboardResponse)
      } else if (active === 'chat') {
        setRecords([])
        const r = await familyPortalService.chatContacts(childId)
        setContacts(r.data || [])
        setTeacherId((id) => id || (r.data?.[0]?.user_id || ''))
      } else if (active === 'attendance') {
        setRecords([])
        const [attRes, permRes] = await Promise.all([
          familyPortalService.list('attendance', childId),
          api.get('/portal/permissions', { headers: { 'X-Child-Id': childId } }),
        ])
        setRecords(unwrap(attRes))
        setPermissionsRecords(permRes.data?.data?.data ?? permRes.data?.data ?? [])
      } else if (active === 'kisi') {
        setRecords([])
        const r = await api.get('/portal/exam-grids', { headers: { 'X-Child-Id': childId } })
        setExamGridsRecords(r.data?.data?.data ?? r.data?.data ?? [])
      } else if (active === 'ujian') {
        setRecords([])
        const r = await api.get('/portal/lms/exams', { headers: { 'X-Child-Id': childId } })
        setCbtOverview(r.data?.data ?? null)
      } else if (active === 'hasil') {
        setRecords([])
        const [resRes, repRes] = await Promise.all([
          api.get('/portal/results', { headers: { 'X-Child-Id': childId } }),
          api.get('/portal/reports', { headers: { 'X-Child-Id': childId } }),
        ])
        setResultsData(resRes.data?.data ?? null)
        setReportsRecords(repRes.data?.data ?? [])
      } else {
        setRecords([])
        setRecords(unwrap(await familyPortalService.list(active, childId)))
      }
    } catch (e) {
      setError(e.response?.data?.message || 'Data portal belum berhasil dimuat.')
    } finally {
      setLoading(false)
    }
  }, [active, childId])

  useEffect(() => { load() }, [load])
  useEffect(() => { if (requestedTab && menu.some(([id]) => id === requestedTab)) setActive(requestedTab) }, [requestedTab])

  const selectTab = (id) => {
    setActive(id)
    setSearchParams((params) => {
      const next = new URLSearchParams(params)
      next.set('tab', id)
      if (childId) next.set('child', childId)
      return next
    }, { replace: true })
  }

  useEffect(() => {
    if (active === 'chat' && teacherId) {
      familyPortalService.chatMessages(teacherId, childId).then(r => setMessages(r.data || [])).catch(() => setError('Percakapan belum dapat dimuat.'))
    }
  }, [active, teacherId, childId])

  const child = useMemo(() => children.find(c => c.id === childId), [children, childId])

  const submitPermission = async (e) => {
    e.preventDefault()
    await familyPortalService.submitPermission({ ...permission, child_id: childId })
    setPermissionOpen(false)
    setPermission({ ...permission, reason: '' })
    setError('')
    load()
  }

  const handleSubmitPermissionFromWorkspace = async (payload) => {
    await familyPortalService.submitPermission({ ...payload, child_id: childId })
    load()
  }

  const send = async (e) => {
    e.preventDefault()
    if (!message.trim()) return
    await familyPortalService.sendMessage(teacherId, childId, message.trim())
    setMessage('')
    const r = await familyPortalService.chatMessages(teacherId, childId)
    setMessages(r.data || [])
  }

  const download = async (report) => {
    const blob = await familyPortalService.downloadReport(report.id, childId)
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `rapor-${child?.full_name || 'siswa'}.pdf`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="portal-page min-w-0 space-y-5 pb-12 text-slate-800 dark:text-slate-100">
        {/* Banner Portal Orang Tua & Child Switcher */}
        <section className="relative overflow-hidden rounded-[18px] bg-gradient-to-r from-[#0E5C44] via-[#187154] to-[#3FBF75] p-5 text-white shadow-lg md:p-6">
          <HeartHandshake className="absolute -bottom-5 right-8 h-32 w-32 text-white/10" />
          <div className="relative flex flex-wrap items-end justify-between gap-5">
            <div>
              <p className="text-[11px] font-black uppercase tracking-[.2em] text-emerald-100">Portal Orang Tua</p>
               <h1 className="mt-2 text-2xl font-black sm:text-3xl">Selamat datang, {user?.name || 'Orang Tua'}</h1>
              <p className="mt-2 max-w-xl text-xs leading-5 text-emerald-50">Informasi akademik, ibadah, kehadiran, keuangan, dan komunikasi sekolah dalam satu ruang.</p>
            </div>
            <div className="relative">
              <label className="block text-[10px] font-bold uppercase tracking-wider text-emerald-200 mb-1">Pilih Anak Aktif</label>
              <select
                value={childId}
                onChange={(e) => selectChild(e.target.value)}
                className="h-11 appearance-none rounded-xl border border-white/30 bg-white/15 pl-4 pr-10 text-xs font-bold text-white outline-none backdrop-blur [&>option]:text-slate-900"
              >
                {children.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.full_name} · {c.kelas?.nama_kelas || 'Kelas'}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-8 h-4 w-4 text-white" />
            </div>
          </div>
        </section>

        {error && (
          <div className="flex items-center gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-xs font-bold text-rose-700 dark:border-rose-900 dark:bg-rose-950/30">
            <AlertCircle className="h-5 w-5" />
            <span className="flex-1">{error}</span>
            <button onClick={load}><RefreshCw className="h-4 w-4" /></button>
          </div>
        )}

        {/* Tab Navigasi */}
        <nav className="flex gap-1 overflow-x-auto rounded-2xl border border-slate-200 bg-white p-1.5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          {menu.map(([id, label, Icon]) => (
            <button
              key={id}
              onClick={() => selectTab(id)}
              className={`flex h-10 shrink-0 items-center gap-2 rounded-xl px-3 text-xs font-bold transition ${active === id ? 'bg-[#0E5C44] text-white shadow' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
            >
              <Icon className="h-4 w-4" />
              {label}
            </button>
          ))}
        </nav>

        {/* Main Content Render */}
        {loading ? (
          <div className="flex min-h-64 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
          </div>
        ) : (
          <section className="space-y-5">
            {active === 'ringkasan' && (
              <div className="rounded-[18px] border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-5">
                <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                  {[
                    ['Kehadiran Hari Ini', dashboard?.attendance_today || 'Belum diinput', UserCheck],
                    ['Jadwal Hari Ini', dashboard?.kpi?.schedules_today_count || 0, CalendarCheck],
                    ['Tugas Aktif', dashboard?.kpi?.active_assignments_count || 0, ClipboardList],
                    ['Hafalan', `${dashboard?.kpi?.total_tahfizh_ayat || 0} ayat`, BookOpenCheck],
                  ].map(([label, value, Icon]) => (
                    <div key={label} className="rounded-2xl border border-slate-100 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-800/50">
                      <Icon className="h-5 w-5 text-emerald-600" />
                      <p className="mt-3 text-[10px] font-bold uppercase text-slate-400">{label}</p>
                      <p className="mt-1 text-lg font-black">{value}</p>
                    </div>
                  ))}
                </div>

                <div className="grid gap-4 lg:grid-cols-2">
                  <div className="rounded-2xl border border-slate-100 p-4 dark:border-slate-800">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">Nilai Terbaru</h3>
                    {(dashboard?.latest_grades || []).map((g) => (
                      <div key={g.id} className="mt-3 flex justify-between text-xs">
                        <span>{g.subject?.name || 'Mata Pelajaran'}</span>
                        <b className="text-emerald-600">{g.nilai_akhir || g.nilai_tugas || '-'}</b>
                      </div>
                    ))}
                    {!dashboard?.latest_grades?.length && <Empty text="Belum ada nilai terbaru." />}
                  </div>

                  <div className="rounded-2xl border border-slate-100 p-4 dark:border-slate-800">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">Pengumuman Terbaru</h3>
                    {(dashboard?.announcements || []).slice(0, 4).map((a) => (
                      <div key={a.id} className="mt-3 text-xs">
                        <b>{a.title || a.judul_pengumuman}</b>
                        <p className="mt-1 line-clamp-2 text-slate-500">{a.content || a.isi_pengumuman}</p>
                      </div>
                    ))}
                    {!dashboard?.announcements?.length && <Empty text="Belum ada pengumuman." />}
                  </div>
                </div>
              </div>
            )}

            {active === 'profile' && (
              <StudentProfileWorkspace student={records} dashboard={dashboard || {}} onNavigate={selectTab} readOnly={false} />
            )}

            {active === 'announcements' && (
              <SchoolInformationWorkspace studentId={childId} student={child} embedded />
            )}

            {active === 'schedules' && (
              <ClassScheduleWorkspace schedules={records} loading={loading} />
            )}

            {active === 'materials' && (
              <MaterialsWorkspace materials={records} loading={loading} />
            )}

            {active === 'assignments' && (
              <AssignmentsWorkspace assignments={records} isParent={true} loading={loading} />
            )}

            {active === 'tahfizh' && (
              <TahfizhWorkspace logs={records} target={dashboard?.tahfizh_target} loading={loading} />
            )}

            {active === 'grades' && (
              <GradesWorkspace grades={records} loading={loading} />
            )}

            {active === 'student-notes' && (
              <TeacherCommentsWorkspace comments={records} loading={loading} />
            )}

            {active === 'mutabaah' && (
              <MutabaahWorkspace mutabaah={records} isParent={true} loading={loading} />
            )}

            {active === 'attendance' && (
              <AttendanceWorkspace
                attendanceLogs={records}
                permissionsHistory={permissionsRecords}
                onSubmitPermission={handleSubmitPermissionFromWorkspace}
                canSubmitPermission={true}
                isParent={true}
                loading={loading}
              />
            )}

            {active === 'kisi' && (
              <ExamGridsWorkspace grids={examGridsRecords} loading={loading} />
            )}

            {active === 'ujian' && (
              <CbtExamsWorkspace lmsData={cbtOverview} isParent={true} loading={loading} />
            )}

            {active === 'hasil' && (
              <ExamResultsWorkspace resultsData={resultsData} reports={reportsRecords} loading={loading} />
            )}

            {active === 'bills' && (
              <div className="rounded-[18px] border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 divide-y divide-slate-100 dark:divide-slate-800">
                {records.map((r) => (
                  <div key={r.id} className="flex flex-wrap items-center justify-between gap-3 p-5">
                    <div>
                      <b className="text-sm font-bold">{r.title}</b>
                      <p className="mt-1 text-xs text-slate-500">Jatuh tempo {date(r.due_date)}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-black text-slate-900 dark:text-white">{rupiah(r.amount)}</p>
                      <Status value={r.status} />
                    </div>
                  </div>
                ))}
                {!records.length && <Empty text="Belum ada data tagihan." />}
              </div>
            )}

            {active === 'chat' && (
              <ChatGuruWorkspace
                mode="parent"
                childId={childId}
                childrenList={children}
                onSelectChild={setChildId}
              />
            )}
          </section>
        )}
    </div>
  )
}
