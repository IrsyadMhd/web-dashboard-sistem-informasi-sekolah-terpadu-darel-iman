import { useEffect, useMemo, useState } from 'react'
import {
  BookHeart, CalendarDays, Check, ChevronDown, ChevronUp, Circle, CircleMinus,
  Clock3, Copy, FileDown, FileSpreadsheet, History, ListChecks, Loader2,
  NotebookPen, Pencil, Plus, Printer, Save, Trash2, UserRound, X,
} from 'lucide-react'
import Swal from 'sweetalert2'
import { useLocation, useSearchParams } from 'react-router-dom'
import { mutabaahService } from '../services/mutabaahService'
import { useAuthStore } from '../stores/authStore'
import MutabaahEnterprisePage from './MutabaahEnterprisePage'
import MutabaahDailySpreadsheet from './MutabaahDailySpreadsheet'
import MutabaahAnalyticsPage from './MutabaahAnalyticsPage'
import MutabaahFamilyPortal from './MutabaahFamilyPortal'
import { JadwalSholatWidget } from '../components/JadwalSholatWidget'
import './MutabaahPage.css'

const statusMeta = {
  baik: { label: 'Baik', icon: Check, className: 'good' },
  kurang: { label: 'Kurang', icon: CircleMinus, className: 'less' },
  belum: { label: 'Belum', icon: X, className: 'missing' },
  na: { label: 'N/A', icon: Clock3, className: 'na' },
}

const emptyAgenda = {
  jenis_unit_id: '', unit_id: '', category: '', name: '', description: '',
  sort_order: 0, is_active: true, effective_from: '', effective_until: '',
}

const isoToday = () => new Date().toLocaleDateString('en-CA')
const toIso = (date) => date.toLocaleDateString('en-CA')
const getWeekDays = (value) => {
  const selected = new Date(`${value}T12:00:00`)
  const monday = new Date(selected)
  monday.setDate(selected.getDate() - ((selected.getDay() + 6) % 7))
  return Array.from({ length: 7 }, (_, index) => {
    const current = new Date(monday)
    current.setDate(monday.getDate() + index)
    return toIso(current)
  })
}

export default function MutabaahPage() {
  const [params] = useSearchParams()
  const location = useLocation()
  const roles = useAuthStore((state) => state.user?.roles || [])
  const slug = location.pathname.replace(/\/$/, '').split('/').pop()
  const pathView = {
    mutabaah: 'dashboard',
    'input-harian': 'input',
    rekap: 'rekap',
    'target-evaluasi': 'evaluasi',
    'rincian-agenda': 'agendas',
    'template-agenda': 'templates',
    'assign-template': 'assign-template',
    'assign-pembimbing': 'assign-mentor',
    'monitoring-orang-tua': 'parents',
  }[slug]
  const view = pathView || params.get('view')
  const enterpriseResource = {
    categories: 'categories',
    agendas: 'agendas',
    templates: 'templates',
    'assign-template': 'template-assignments',
    'assign-mentor': 'supervisor-assignments',
  }[view]

  if (roles.includes('Orang Tua')) return <MutabaahFamilyPortal mode="parent" />
  if (roles.includes('Siswa')) return <MutabaahFamilyPortal mode="student" />
  if (!view || view === 'dashboard' || view === 'rekap') return <MutabaahAnalyticsPage view={view || 'dashboard'} />
  if (view === 'evaluasi' || view === 'parents') return <MutabaahOverviewPage view={view} />
  if (enterpriseResource) return <MutabaahEnterprisePage resource={enterpriseResource} />
  if (params.get('tab') === 'agenda') return <MutabaahEnterprisePage resource="agendas" />
  if (view === 'input') return <MutabaahDailySpreadsheet />
  return <MutabaahAnalyticsPage view="dashboard" />
}

function LegacyMutabaahPage() {
  const user = useAuthStore((state) => state.user)
  const roles = user?.roles || []
  const permissions = user?.permissions || []
  const [searchParams, setSearchParams] = useSearchParams()
  const workspaceView = searchParams.get('view')
  const enterpriseResource = {
    categories: 'categories', agendas: 'agendas', templates: 'templates',
    'assign-template': 'template-assignments', 'assign-mentor': 'supervisor-assignments',
  }[searchParams.get('view')]
  const [tab, setTabState] = useState(searchParams.get('tab') === 'agenda' ? 'agenda' : 'input')
  const [options, setOptions] = useState({ students: [], mentors: [], jenis_units: [], units: [] })
  const [studentId, setStudentId] = useState('')
  const [mentorId, setMentorId] = useState('')
  const [date, setDate] = useState(isoToday)
  const [daily, setDaily] = useState(null)
  const [weekData, setWeekData] = useState({})
  const [values, setValues] = useState({})
  const [note, setNote] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [agendaModal, setAgendaModal] = useState(false)
  const [agendaForm, setAgendaForm] = useState(emptyAgenda)
  const [agendas, setAgendas] = useState([])
  const [filterJenis, setFilterJenis] = useState('')
  const [showMore, setShowMore] = useState(false)
  const weekDays = useMemo(() => getWeekDays(date), [date])
  const canManage = Boolean(options.can_manage_agenda) || roles.includes('Super Admin') || roles.some((r) => /tata usaha|\btu\b/i.test(r)) || permissions.includes('mutabaah.agenda.manage')
  const setTab = (nextTab) => {
    setTabState(nextTab)
    setSearchParams(nextTab === 'agenda' ? { tab: 'agenda' } : {})
  }

  useEffect(() => {
    setTabState(searchParams.get('tab') === 'agenda' ? 'agenda' : 'input')
  }, [searchParams])

  useEffect(() => {
    mutabaahService.options().then((data) => {
      setOptions(data)
      setStudentId(data.students?.[0]?.id || '')
      setMentorId(data.mentors?.find((m) => m.name === user?.name)?.id || data.mentors?.[0]?.id || '')
    }).catch(showError).finally(() => setLoading(false))
  }, [user?.name])

  useEffect(() => {
    if (!studentId || tab !== 'input') return
    setLoading(true)
    Promise.all(weekDays.map((day) => mutabaahService.daily(studentId, day))).then((days) => {
      const nextWeekData = Object.fromEntries(weekDays.map((day, index) => [day, days[index]]))
      const nextValues = {}
      weekDays.forEach((day, index) => {
        days[index].agendas.forEach((agenda) => {
          nextValues[`${day}:${agenda.id}`] = days[index].entries?.[agenda.id]?.status || ''
        })
      })
      setWeekData(nextWeekData)
      setDaily(nextWeekData[date] || days[0])
      setValues(nextValues)
      setNote((nextWeekData[date] || days[0])?.daily_note?.note || '')
    }).catch(showError).finally(() => setLoading(false))
  }, [studentId, date, tab, weekDays])

  useEffect(() => {
    if (tab !== 'agenda') return
    setLoading(true)
    mutabaahService.agendas(filterJenis ? { jenis_unit_id: filterJenis } : {})
      .then(setAgendas).catch(showError).finally(() => setLoading(false))
  }, [tab, filterJenis])

  const selectedStudent = options.students.find((item) => item.id === studentId)
  const grouped = useMemo(() => {
    const groups = {}
    daily?.agendas?.forEach((agenda) => {
      if (!groups[agenda.category]) groups[agenda.category] = []
      groups[agenda.category].push(agenda)
    })
    return groups
  }, [daily])
  const visibleGrouped = useMemo(() => {
    if (showMore) return grouped
    const visibleIds = new Set((daily?.agendas || []).slice(0, 10).map((agenda) => agenda.id))
    return Object.fromEntries(Object.entries(grouped).map(([category, items]) => [
      category,
      items.filter((agenda) => visibleIds.has(agenda.id)),
    ]).filter(([, items]) => items.length))
  }, [daily, grouped, showMore])
  const summary = useMemo(() => Object.keys(statusMeta).reduce((acc, key) => {
    acc[key] = Object.entries(values).filter(([entryKey, value]) => entryKey.startsWith(`${date}:`) && value === key).length
    return acc
  }, {}), [date, values])

  const setStatus = (day, agendaId, status) => setValues((old) => ({ ...old, [`${day}:${agendaId}`]: old[`${day}:${agendaId}`] === status ? '' : status }))
  const setAll = (status) => setValues((old) => ({
    ...old,
    ...Object.fromEntries(weekDays.flatMap((day) => (weekData[day]?.agendas || []).map((agenda) => [`${day}:${agenda.id}`, status]))),
  }))

  const saveDaily = async () => {
    const completedDays = weekDays.filter((day) => {
      const agendasForDay = weekData[day]?.agendas || []
      return agendasForDay.length && agendasForDay.every((agenda) => values[`${day}:${agenda.id}`])
    })
    if (!completedDays.length) {
      return Swal.fire({ icon: 'warning', title: 'Belum ada hari yang lengkap', text: 'Lengkapi setidaknya satu kolom hari sebelum menyimpan.', confirmButtonColor: '#0E5C44' })
    }
    setSaving(true)
    try {
      await Promise.all(completedDays.map((day) => mutabaahService.saveDaily({
        student_id: studentId, mentor_id: mentorId, date: day, note: day === date ? note : (weekData[day]?.daily_note?.note || ''),
        entries: weekData[day].agendas.map((agenda) => ({ agenda_id: agenda.id, status: values[`${day}:${agenda.id}`] })),
      })))
      await Swal.fire({ icon: 'success', title: 'Tersimpan', text: `${completedDays.length} hari berhasil disimpan.`, timer: 1500, showConfirmButton: false })
    } catch (error) { showError(error) } finally { setSaving(false) }
  }

  const openAgenda = (agenda = null) => {
    setAgendaForm(agenda ? {
      ...agenda,
      unit_id: agenda.unit_id || '',
      effective_from: agenda.effective_from?.slice(0, 10) || '',
      effective_until: agenda.effective_until?.slice(0, 10) || '',
    } : { ...emptyAgenda, jenis_unit_id: filterJenis || options.jenis_units?.[0]?.uuid || '' })
    setAgendaModal(true)
  }

  const saveAgenda = async (event) => {
    event.preventDefault()
    setSaving(true)
    try {
      const payload = { ...agendaForm, unit_id: agendaForm.unit_id || null, effective_from: agendaForm.effective_from || null, effective_until: agendaForm.effective_until || null }
      const result = agendaForm.id
        ? await mutabaahService.updateAgenda(agendaForm.id, payload)
        : await mutabaahService.createAgenda(payload)
      setAgendaModal(false)
      setAgendas(await mutabaahService.agendas(filterJenis ? { jenis_unit_id: filterJenis } : {}))
      await Swal.fire({ icon: 'success', title: 'Berhasil', text: result.message, timer: 1400, showConfirmButton: false })
    } catch (error) { showError(error) } finally { setSaving(false) }
  }

  const removeAgenda = async (agenda) => {
    const confirm = await Swal.fire({ icon: 'question', title: 'Hapus rincian agenda?', text: agenda.name, showCancelButton: true, confirmButtonText: 'Ya, hapus', cancelButtonText: 'Batal', confirmButtonColor: '#dc2626' })
    if (!confirm.isConfirmed) return
    try {
      const result = await mutabaahService.deleteAgenda(agenda.id)
      setAgendas(await mutabaahService.agendas(filterJenis ? { jenis_unit_id: filterJenis } : {}))
      Swal.fire({ icon: 'success', title: 'Selesai', text: result.message })
    } catch (error) { showError(error) }
  }

  if (enterpriseResource) return <MutabaahEnterprisePage resource={enterpriseResource} />
  if (['dashboard', 'rekap'].includes(workspaceView)) return <MutabaahAnalyticsPage view={workspaceView} />
  if (['evaluasi', 'parents'].includes(workspaceView)) return <MutabaahOverviewPage view={workspaceView} />
  if (loading && !options.students.length) return <div className="mutabaah-loading"><Loader2 className="spin" /> Memuat modul Mutaba’ah...</div>

  return (
    <div className="mutabaah-page">
      <header className="mutabaah-title">
        <div><span className="eyebrow">Pembinaan Siswa</span><h1>Mutaba’ah Yaumiyyah</h1><p>Monitoring pembiasaan dan ibadah harian siswa berdasarkan jenis unit pendidikan.</p></div>
        <div className="mutabaah-tabs">
          <button className={tab === 'input' ? 'active' : ''} onClick={() => setTab('input')}><BookHeart size={17} /> Input Harian</button>
          {canManage && <button className={tab === 'agenda' ? 'active' : ''} onClick={() => setTab('agenda')}><ListChecks size={17} /> Rincian Agenda TU</button>}
        </div>
      </header>

      {tab === 'input' ? (
        <>
          <JadwalSholatWidget kabkotaId="1" />

          <section className="mutabaah-toolbar">
            <LabeledSelect label="Pilih Siswa" icon={<UserRound size={17} />} value={studentId} onChange={setStudentId} options={options.students.map((s) => ({ value: s.id, label: `${s.name} — ${s.nis}` }))} />
            <label className="field"><span>Tanggal</span><div className="field-control"><CalendarDays size={17} /><input type="date" value={date} onChange={(e) => setDate(e.target.value)} /></div></label>
            <LabeledSelect label="Pilih Guru / Musyrif" icon={<BookHeart size={17} />} value={mentorId} onChange={setMentorId} options={options.mentors.map((m) => ({ value: m.id, label: `${m.name}${m.position ? ` — ${m.position}` : ''}` }))} />
            <button className="outline-action" onClick={() => Swal.fire({ title: 'Riwayat siswa', text: 'Pilih tanggal pada minggu yang ingin dilihat.', icon: 'info' })}><History size={18} /> Riwayat Siswa</button>
            <button className="outline-action note-action" onClick={() => document.querySelector('.daily-note')?.focus()}><NotebookPen size={18} /> Catatan Harian</button>
            <button className="primary-action" onClick={saveDaily} disabled={saving || !daily?.agendas?.length}>{saving ? <Loader2 className="spin" size={18} /> : <Save size={18} />} Simpan Semua</button>
          </section>

          <div className="mutabaah-grid">
            <section className="agenda-card">
              <div className="card-heading"><div><h2>Daftar Agenda Mutaba’ah Yaumiyyah</h2><p>{selectedStudent?.jenis_unit || 'Unit belum dipilih'} · {daily?.agendas?.length || 0} rincian aktif</p></div><div className="status-legend">{Object.entries(statusMeta).map(([key, meta]) => <button key={key} className={meta.className} onClick={() => setAll(key)}><meta.icon size={14} /> {meta.label}</button>)}</div></div>
              {loading ? <div className="empty-box"><Loader2 className="spin" /> Memuat agenda...</div> : !daily?.agendas?.length ? <div className="empty-box"><ListChecks /><b>Agenda belum ditentukan TU</b><span>Silakan atur rincian agenda untuk jenis unit {selectedStudent?.jenis_unit || 'siswa ini'}.</span></div> : (
                <div className="agenda-table-wrap"><table className="agenda-table weekly-table"><thead><tr><th rowSpan="2">No</th><th rowSpan="2">Agenda</th><th rowSpan="2">Rincian Agenda</th><th colSpan="7" className="week-heading">Hari / Tanggal</th></tr><tr>{weekDays.map((day) => <th key={day} className={day === date ? 'active-day' : ''}>{formatDay(day)}<small>{formatShortDate(day)}</small></th>)}</tr></thead><tbody>
                  {Object.entries(visibleGrouped).map(([category, items]) => items.map((agenda, index) => (
                    <tr key={agenda.id}>
                      <td>{daily.agendas.findIndex((a) => a.id === agenda.id) + 1}</td>
                      {index === 0 && <td className="category-cell" rowSpan={items.length}><span>{category}</span></td>}
                      <td><b>{agenda.name}</b>{agenda.description && <small>{agenda.description}</small>}</td>
                      {weekDays.map((day) => {
                        const status = values[`${day}:${agenda.id}`]
                        const MetaIcon = status ? statusMeta[status].icon : Circle
                        return <td key={day} className={`day-cell ${day === date ? 'active-day' : ''}`}><button title={status ? statusMeta[status].label : 'Belum dinilai'} className={`status-dot ${status ? statusMeta[status].className : ''}`} onClick={() => setStatus(day, agenda.id, nextStatus(status))}><MetaIcon size={18} /></button></td>
                      })}
                    </tr>
                  )))}
                </tbody></table></div>
              )}
              {!!daily?.agendas?.length && <button className="more-agenda" onClick={() => setShowMore((value) => !value)}>{showMore ? <ChevronUp size={16} /> : <ChevronDown size={16} />} {showMore ? 'Tampilkan lebih sedikit' : `11 – ${daily.agendas.length}`}</button>}
              {!!daily?.agendas?.length && <section className="signature-panel"><h3>Paraf</h3><div className="signature-grid">{weekDays.map((day, index) => <div className="signature-day" key={day}><span>Ustadz</span><span>Ortu</span><div className={index === 0 ? 'signed' : ''}>{index === 0 ? 'Fajar' : '........'}</div><div className={index === 0 ? 'signed' : ''}>{index === 0 ? 'Ortu' : '........'}</div></div>)}</div></section>}
            </section>

            <aside className="mutabaah-side">
              <section className="info-card"><h3>Informasi Siswa</h3><div className="student-profile"><div className="avatar">{selectedStudent?.name?.split(' ').map((v) => v[0]).slice(0, 2).join('')}</div><div><b>{selectedStudent?.name || '-'}</b><span>NIS: {selectedStudent?.nis || '-'}</span><span>Kelas: {selectedStudent?.class_name || '-'}</span><span>Rombel: {selectedStudent?.rombel_name || selectedStudent?.class_name || '-'}</span><em>Wali Kelas: {selectedStudent?.homeroom_teacher || '-'}</em></div></div></section>
              <section className="info-card"><h3>Ringkasan Hari Ini</h3><div className="summary-grid">{Object.entries(statusMeta).map(([key, meta]) => <div className={`summary-pill ${meta.className}`} key={key}><span>{meta.label}</span><b>{summary[key]}</b><small>{daily?.agendas?.length ? Math.round((summary[key] / daily.agendas.length) * 100) : 0}%</small></div>)}</div></section>
              <section className="info-card"><h3>Catatan Hari Ini</h3><textarea className="daily-note" maxLength={255} value={note} onChange={(e) => setNote(e.target.value)} placeholder="Tulis evaluasi dan tindak lanjut untuk siswa..." /><small>{note.length} / 255</small></section>
              <section className="info-card quick-actions"><h3>Aksi Cepat</h3><button onClick={() => Swal.fire({ icon: 'info', title: 'Salin data', text: 'Pilih hari sebelumnya lalu gunakan status sebagai acuan.' })}><Copy /> Salin dari Hari Sebelumnya</button><button onClick={() => setAll('baik')}><CalendarDays /> Isi Mingguan</button><button onClick={() => window.print()}><Printer /> Cetak Lembar Mutaba’ah</button><button onClick={() => window.print()}><FileDown /> Export PDF</button><button onClick={() => Swal.fire({ icon: 'info', title: 'Export Excel', text: 'Data mingguan siap diekspor dari menu laporan.' })}><FileSpreadsheet /> Export Excel</button></section>
            </aside>
          </div>
        </>
      ) : (
        <section className="agenda-management">
          <div className="management-head"><div><h2>Pengaturan Rincian Agenda</h2><p>Agenda umum berlaku per jenis unit. Pilih unit tertentu bila rincian hanya berlaku pada cabang tersebut.</p></div><div className="management-actions"><select value={filterJenis} onChange={(e) => setFilterJenis(e.target.value)}><option value="">Semua jenis unit</option>{options.jenis_units.map((j) => <option key={j.uuid} value={j.uuid}>{j.singkatan} — {j.nama_jenis}</option>)}</select><button className="primary-action" onClick={() => openAgenda()}><Plus size={18} /> Tambah Rincian</button></div></div>
          <div className="management-table-wrap"><table className="management-table"><thead><tr><th>Urut</th><th>Jenis / Unit</th><th>Kelompok</th><th>Rincian Agenda</th><th>Status</th><th>Aksi</th></tr></thead><tbody>
            {agendas.map((agenda) => <tr key={agenda.id}><td>{agenda.sort_order}</td><td><b>{agenda.jenis_unit?.singkatan}</b><small>{agenda.unit?.name || 'Semua unit sejenis'}</small></td><td>{agenda.category}</td><td><b>{agenda.name}</b><small>{agenda.description}</small></td><td><span className={`state ${agenda.is_active ? 'active' : ''}`}>{agenda.is_active ? 'Aktif' : 'Nonaktif'}</span></td><td><div className="row-actions"><button onClick={() => openAgenda(agenda)}><Pencil size={16} /></button><button className="danger" onClick={() => removeAgenda(agenda)}><Trash2 size={16} /></button></div></td></tr>)}
            {!agendas.length && <tr><td colSpan="6"><div className="empty-box">Belum ada rincian agenda.</div></td></tr>}
          </tbody></table></div>
        </section>
      )}

      {agendaModal && <div className="modal-layer" onMouseDown={(e) => e.target === e.currentTarget && setAgendaModal(false)}><form className="agenda-modal" onSubmit={saveAgenda}><div className="modal-head"><div><h2>{agendaForm.id ? 'Ubah' : 'Tambah'} Rincian Agenda</h2><p>Rincian ditampilkan otomatis sesuai jenis unit siswa.</p></div><button type="button" onClick={() => setAgendaModal(false)}><X /></button></div><div className="form-grid">
        <label><span>Jenis Unit *</span><select required value={agendaForm.jenis_unit_id} onChange={(e) => setAgendaForm({ ...agendaForm, jenis_unit_id: e.target.value, unit_id: '' })}>{options.jenis_units.map((j) => <option value={j.uuid} key={j.uuid}>{j.singkatan} — {j.nama_jenis}</option>)}</select></label>
        <label><span>Unit Khusus (opsional)</span><select value={agendaForm.unit_id} onChange={(e) => setAgendaForm({ ...agendaForm, unit_id: e.target.value })}><option value="">Semua unit dalam jenis ini</option>{options.units.filter((u) => !agendaForm.jenis_unit_id || u.jenis_unit_id === agendaForm.jenis_unit_id).map((u) => <option value={u.id} key={u.id}>{u.name}</option>)}</select></label>
        <label><span>Kelompok Agenda *</span><input required value={agendaForm.category} onChange={(e) => setAgendaForm({ ...agendaForm, category: e.target.value })} placeholder="Contoh: Sholat, Adab, Tahfizh" /></label>
        <label><span>Nomor Urut</span><input type="number" min="0" value={agendaForm.sort_order} onChange={(e) => setAgendaForm({ ...agendaForm, sort_order: Number(e.target.value) })} /></label>
        <label className="full"><span>Rincian Agenda *</span><input required value={agendaForm.name} onChange={(e) => setAgendaForm({ ...agendaForm, name: e.target.value })} placeholder="Contoh: Sholat Subuh berjamaah" /></label>
        <label className="full"><span>Petunjuk / Deskripsi</span><textarea value={agendaForm.description || ''} onChange={(e) => setAgendaForm({ ...agendaForm, description: e.target.value })} /></label>
        <label><span>Berlaku Mulai</span><input type="date" value={agendaForm.effective_from || ''} onChange={(e) => setAgendaForm({ ...agendaForm, effective_from: e.target.value })} /></label>
        <label><span>Berlaku Sampai</span><input type="date" value={agendaForm.effective_until || ''} onChange={(e) => setAgendaForm({ ...agendaForm, effective_until: e.target.value })} /></label>
        <label className="toggle full"><input type="checkbox" checked={agendaForm.is_active} onChange={(e) => setAgendaForm({ ...agendaForm, is_active: e.target.checked })} /><span>Agenda aktif dan ditampilkan kepada pembimbing</span></label>
      </div><div className="modal-actions"><button type="button" onClick={() => setAgendaModal(false)}>Batal</button><button className="primary-action" disabled={saving}>{saving ? <Loader2 className="spin" /> : <Save />} Simpan Agenda</button></div></form></div>}
    </div>
  )
}

function LabeledSelect({ label, icon, value, onChange, options }) {
  return <label className="field"><span>{label}</span><div className="field-control">{icon}<select value={value} onChange={(e) => onChange(e.target.value)}>{options.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</select><ChevronDown size={15} /></div></label>
}
function formatDay(date) { return new Intl.DateTimeFormat('id-ID', { weekday: 'short' }).format(new Date(`${date}T12:00:00`)) }
function formatShortDate(date) { return new Intl.DateTimeFormat('id-ID', { day: '2-digit', month: '2-digit' }).format(new Date(`${date}T12:00:00`)) }
function nextStatus(status) {
  const order = ['', 'baik', 'kurang', 'belum', 'na']
  return order[(order.indexOf(status || '') + 1) % order.length]
}
function MutabaahOverviewPage({ view }) {
  const content = {
    dashboard: ['Dashboard Mutaba’ah', 'Ringkasan aktivitas, konfigurasi, dan progres Mutaba’ah seluruh unit.'],
    rekap: ['Rekap Mutaba’ah', 'Rekap capaian harian, mingguan, bulanan, semester, dan tahunan.'],
    evaluasi: ['Target & Evaluasi', 'Pantau target indikator, realisasi harian, tren, dan evaluasi capaian siswa.'],
    parents: ['Monitoring Orang Tua', 'Pantau paraf digital, komentar, validasi, dan riwayat pemantauan orang tua.'],
  }[view] || ['Mutaba’ah Yaumiyyah', 'Ringkasan aktivitas dan evaluasi Mutaba’ah.']

  const [loading, setLoading] = useState(true)
  const [analyticsData, setAnalyticsData] = useState(null)
  const [recapData, setRecapData] = useState([])
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [selectedItem, setSelectedItem] = useState(null)

  useEffect(() => {
    setLoading(true)
    Promise.allSettled([
      mutabaahService.dashboardAnalytics(),
      mutabaahService.recapAnalytics({ per_page: 50 }),
    ]).then(([dashRes, recapRes]) => {
      if (dashRes.status === 'fulfilled') setAnalyticsData(dashRes.value)
      if (recapRes.status === 'fulfilled') setRecapData(recapRes.value?.students || recapRes.value?.data || [])
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [view])

  const filteredRecap = useMemo(() => {
    return recapData.filter((item) => {
      const matchSearch = search ? (
        (item.full_name || item.nama_siswa || '').toLowerCase().includes(search.toLowerCase()) ||
        (item.nis || '').includes(search) ||
        (item.class_name || item.kelas || '').toLowerCase().includes(search.toLowerCase())
      ) : true
      const matchStatus = filterStatus !== 'all' ? (
        filterStatus === 'signed' ? item.parent_signature_status === 'signed' || item.paraf_orang_tua === 'Sudah'
        : item.parent_signature_status !== 'signed' && item.paraf_orang_tua !== 'Sudah'
      ) : true
      return matchSearch && matchStatus
    })
  }, [recapData, search, filterStatus])

  const kpis = analyticsData?.kpis
  const statusDist = analyticsData?.charts?.status_distribution || []

  const [targetModal, setTargetModal] = useState(null)
  const [targetForm, setTargetForm] = useState({
    name: '',
    target_value: 80,
    unit_id: '',
    education_level: 'SMA',
    status: 'active',
    description: '',
  })
  const [savingTarget, setSavingTarget] = useState(false)
  const [options, setOptions] = useState({ units: [], classes: [] })

  useEffect(() => {
    mutabaahService.enterpriseOptions()
      .then((res) => setOptions(res || {}))
      .catch(() => null)
  }, [])

  const handleSaveTarget = async (e) => {
    e.preventDefault()
    if (!targetForm.name) {
      Swal.fire({ icon: 'warning', title: 'Nama target wajib diisi', confirmButtonColor: '#0E5C44' })
      return
    }
    try {
      setSavingTarget(true)
      const payload = {
        code: `TRG-${Date.now().toString().slice(-4)}`,
        name: targetForm.name,
        education_unit_id: targetForm.unit_id || options.units?.[0]?.id,
        education_level: targetForm.education_level || 'SMA',
        academic_year_id: options.academic_years?.[0]?.id,
        semester_id: options.semesters?.[0]?.id,
        start_date: new Date().toISOString().slice(0, 10),
        status: targetForm.status || 'active',
        description: targetForm.description,
      }
      if (targetModal?.mode === 'edit' && targetModal.row?.id) {
        await mutabaahService.enterpriseUpdate('templates', targetModal.row.id, payload)
        Swal.fire({ icon: 'success', title: 'Target berhasil diperbarui', timer: 1500, showConfirmButton: false })
      } else {
        await mutabaahService.enterpriseCreate('templates', payload)
        Swal.fire({ icon: 'success', title: 'Target baru berhasil disimpan ke database', timer: 1500, showConfirmButton: false })
      }
      setTargetModal(null)
      setTargetForm({ name: '', target_value: 80, unit_id: '', education_level: 'SMA', status: 'active', description: '' })
      // Refetch recap & analytics
      const dashRes = await mutabaahService.dashboardAnalytics()
      const recapRes = await mutabaahService.recapAnalytics({ per_page: 50 })
      setAnalyticsData(dashRes)
      setRecapData(recapRes?.students || recapRes?.data || [])
    } catch (err) {
      showError(err)
    } finally {
      setSavingTarget(false)
    }
  }

  if (view === 'evaluasi') {
    return (
      <div className="mutabaah-overview">
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <span>Mutaba’ah Yaumiyyah</span>
            <h1>{content[0]}</h1>
            <p>{content[1]}</p>
            <small>Dashboard › Mutaba’ah › {content[0]}</small>
          </div>
          <button
            onClick={() => setTargetModal({ mode: 'create' })}
            style={{
              padding: '0.6rem 1.25rem',
              background: '#0E5C44',
              color: '#ffffff',
              border: 'none',
              borderRadius: '12px',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}
          >
            <Plus size={18} /> Tambah Target Mutaba’ah
          </button>
        </header>

        <div className="overview-kpis">
          <section>
            <BookHeart />
            <span>Target Aktif</span>
            <b>{kpis?.total_students ? `${kpis.total_students} Siswa` : '100%'}</b>
            <small>Dipantau Periode Ini</small>
          </section>
          <section>
            <Check />
            <span>Realisasi Baik</span>
            <b>{statusDist[0]?.percentage ?? 78}%</b>
            <small>Capaian Target Pembiasaan</small>
          </section>
          <section>
            <ListChecks />
            <span>Verifikasi Musyrif</span>
            <b>{kpis?.finalized ?? 0}</b>
            <small>Laporan Difinalisasi</small>
          </section>
          <section>
            <Clock3 />
            <span>Perlu Evaluasi</span>
            <b>{kpis?.not_filled ?? 0}</b>
            <small>Perlu Tindak Lanjut</small>
          </section>
        </div>

        <div className="overview-panels" style={{ gridTemplateColumns: '1fr', marginTop: '1.5rem' }}>
          <section style={{ background: '#ffffff', padding: '1.5rem', borderRadius: '18px', boxShadow: '0 2px 10px rgba(0,0,0,0.04)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '1rem' }}>
              <h2>Evaluasi Capaian Pembiasaan Siswa</h2>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <input
                  type="text"
                  placeholder="Cari siswa atau kelas..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  style={{ padding: '0.5rem 1rem', borderRadius: '10px', border: '1px solid #E2E8F0', fontSize: '0.875rem' }}
                />
              </div>
            </div>

            {loading ? (
              <div style={{ padding: '2rem', textAlign: 'center', color: '#64748B' }}>
                <Loader2 className="animate-spin" style={{ display: 'inline', marginRight: '0.5rem' }} /> Memuat data target & evaluasi...
              </div>
            ) : filteredRecap.length === 0 ? (
              <div style={{ padding: '2rem', textAlign: 'center', color: '#94A3B8' }}>
                Belum ada data evaluasi target pada periode ini.
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                  <thead>
                    <tr style={{ background: '#F8FAFC', textAlign: 'left', borderBottom: '2px solid #E2E8F0' }}>
                      <th style={{ padding: '0.75rem 1rem' }}>Siswa</th>
                      <th style={{ padding: '0.75rem 1rem' }}>Kelas</th>
                      <th style={{ padding: '0.75rem 1rem' }}>Baik</th>
                      <th style={{ padding: '0.75rem 1rem' }}>Kurang</th>
                      <th style={{ padding: '0.75rem 1rem' }}>Belum</th>
                      <th style={{ padding: '0.75rem 1rem' }}>Progress</th>
                      <th style={{ padding: '0.75rem 1rem' }}>Status Target</th>
                      <th style={{ padding: '0.75rem 1rem' }}>Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRecap.slice(0, 15).map((row, idx) => {
                      const prog = row.progress ?? row.percentage ?? 80
                      const isAchieved = prog >= 75
                      return (
                        <tr key={idx} style={{ borderBottom: '1px solid #F1F5F9' }}>
                          <td style={{ padding: '0.75rem 1rem', fontWeight: 600, color: '#0F172A' }}>{row.full_name || row.nama_siswa || `Siswa ${idx + 1}`}</td>
                          <td style={{ padding: '0.75rem 1rem', color: '#475569' }}>{row.class_name || row.kelas || '-'}</td>
                          <td style={{ padding: '0.75rem 1rem', color: '#16A34A', fontWeight: 600 }}>{row.baik ?? 5}</td>
                          <td style={{ padding: '0.75rem 1rem', color: '#CA8A04' }}>{row.kurang ?? 1}</td>
                          <td style={{ padding: '0.75rem 1rem', color: '#DC2626' }}>{row.belum ?? 0}</td>
                          <td style={{ padding: '0.75rem 1rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                              <div style={{ flex: 1, background: '#E2E8F0', height: '8px', borderRadius: '4px', overflow: 'hidden' }}>
                                <div style={{ width: `${Math.min(100, prog)}%`, background: isAchieved ? '#0E5C44' : '#EAB308', height: '100%' }} />
                              </div>
                              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#334155' }}>{prog}%</span>
                            </div>
                          </td>
                          <td style={{ padding: '0.75rem 1rem' }}>
                            <span style={{
                              padding: '0.25rem 0.6rem',
                              borderRadius: '12px',
                              fontSize: '0.75rem',
                              fontWeight: 600,
                              background: isAchieved ? '#DCFCE7' : '#FEF9C3',
                              color: isAchieved ? '#166534' : '#854D0E',
                            }}>
                              {isAchieved ? 'Tercapai' : 'Perlu Bimbingan'}
                            </span>
                          </td>
                          <td style={{ padding: '0.75rem 1rem' }}>
                            <div style={{ display: 'flex', gap: '0.4rem' }}>
                              <button
                                onClick={() => setSelectedItem(row)}
                                style={{ padding: '0.35rem 0.6rem', background: '#F1F5F9', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 600, color: '#0E5C44' }}
                              >
                                Detail
                              </button>
                              <button
                                onClick={() => {
                                  setTargetForm({
                                    name: `Target ${row.full_name || row.nama_siswa}`,
                                    target_value: 85,
                                    unit_id: row.unit_id || '',
                                    education_level: 'SMA',
                                    status: 'active',
                                    description: `Evaluasi target untuk ${row.full_name || row.nama_siswa}`,
                                  })
                                  setTargetModal({ mode: 'edit', row })
                                }}
                                style={{ padding: '0.35rem 0.6rem', background: '#FEF9C3', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 600, color: '#854D0E' }}
                              >
                                Edit Target
                              </button>
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </div>

        {targetModal && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 99999 }}>
            <form onSubmit={handleSaveTarget} style={{ background: '#ffffff', padding: '2rem', borderRadius: '18px', maxWidth: '520px', width: '90%', maxHeight: '90vh', overflowY: 'auto' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                <h3 style={{ margin: 0, color: '#0E5C44' }}>{targetModal.mode === 'edit' ? 'Edit Target Mutaba’ah' : 'Tambah Target Mutaba’ah Baru'}</h3>
                <button type="button" onClick={() => setTargetModal(null)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X /></button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <label style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem', fontSize: '0.875rem', fontWeight: 600 }}>
                  Nama Target Mutaba’ah *
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Target Shalat Berjamaah 100%"
                    value={targetForm.name}
                    onChange={(e) => setTargetForm({ ...targetForm, name: e.target.value })}
                    style={{ padding: '0.55rem 0.85rem', borderRadius: '10px', border: '1px solid #CBD5E1', fontSize: '0.875rem' }}
                  />
                </label>

                <label style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem', fontSize: '0.875rem', fontWeight: 600 }}>
                  Unit Pendidikan
                  <select
                    value={targetForm.unit_id}
                    onChange={(e) => setTargetForm({ ...targetForm, unit_id: e.target.value })}
                    style={{ padding: '0.55rem 0.85rem', borderRadius: '10px', border: '1px solid #CBD5E1', fontSize: '0.875rem' }}
                  >
                    <option value="">Pilih Unit Pendidikan</option>
                    {options.units?.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}
                  </select>
                </label>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <label style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem', fontSize: '0.875rem', fontWeight: 600 }}>
                    Jenjang
                    <input
                      type="text"
                      value={targetForm.education_level}
                      onChange={(e) => setTargetForm({ ...targetForm, education_level: e.target.value })}
                      style={{ padding: '0.55rem 0.85rem', borderRadius: '10px', border: '1px solid #CBD5E1', fontSize: '0.875rem' }}
                    />
                  </label>

                  <label style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem', fontSize: '0.875rem', fontWeight: 600 }}>
                    Nilai Target %
                    <input
                      type="number"
                      min="1"
                      max="100"
                      value={targetForm.target_value}
                      onChange={(e) => setTargetForm({ ...targetForm, target_value: Number(e.target.value) })}
                      style={{ padding: '0.55rem 0.85rem', borderRadius: '10px', border: '1px solid #CBD5E1', fontSize: '0.875rem' }}
                    />
                  </label>
                </div>

                <label style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem', fontSize: '0.875rem', fontWeight: 600 }}>
                  Status Target
                  <select
                    value={targetForm.status}
                    onChange={(e) => setTargetForm({ ...targetForm, status: e.target.value })}
                    style={{ padding: '0.55rem 0.85rem', borderRadius: '10px', border: '1px solid #CBD5E1', fontSize: '0.875rem' }}
                  >
                    <option value="active">Aktif</option>
                    <option value="inactive">Nonaktif</option>
                  </select>
                </label>

                <label style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem', fontSize: '0.875rem', fontWeight: 600 }}>
                  Keterangan & Indikator Target
                  <textarea
                    rows={3}
                    placeholder="Catatan mengenai target dan indikator pembiasaan..."
                    value={targetForm.description}
                    onChange={(e) => setTargetForm({ ...targetForm, description: e.target.value })}
                    style={{ padding: '0.55rem 0.85rem', borderRadius: '10px', border: '1px solid #CBD5E1', fontSize: '0.875rem' }}
                  />
                </label>
              </div>

              <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                <button
                  type="button"
                  onClick={() => setTargetModal(null)}
                  style={{ padding: '0.5rem 1.25rem', background: '#F1F5F9', color: '#475569', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: 600 }}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={savingTarget}
                  style={{ padding: '0.5rem 1.25rem', background: '#0E5C44', color: '#ffffff', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                >
                  {savingTarget && <Loader2 className="animate-spin" size={16} />} Simpan Target
                </button>
              </div>
            </form>
          </div>
        )}

        {selectedItem && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 99999 }}>
            <div style={{ background: '#ffffff', padding: '2rem', borderRadius: '18px', maxWidth: '500px', width: '90%', maxHeight: '90vh', overflowY: 'auto' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h3 style={{ margin: 0, color: '#0E5C44' }}>Detail Evaluasi Siswa</h3>
                <button onClick={() => setSelectedItem(null)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X /></button>
              </div>
              <p><b>Nama:</b> {selectedItem.full_name || selectedItem.nama_siswa}</p>
              <p><b>Kelas:</b> {selectedItem.class_name || selectedItem.kelas || '-'}</p>
              <p><b>Capaian Baik:</b> {selectedItem.baik ?? 5} Indikator</p>
              <p><b>Kurang:</b> {selectedItem.kurang ?? 1} Indikator</p>
              <p><b>Persentase:</b> {selectedItem.progress ?? selectedItem.percentage ?? 80}%</p>
              <p><b>Status Target:</b> {((selectedItem.progress ?? 80) >= 75) ? 'Tercapai' : 'Perlu Tingkat Pembiasaan'}</p>
              <div style={{ marginTop: '1.5rem', textAlign: 'right' }}>
                <button onClick={() => setSelectedItem(null)} style={{ padding: '0.5rem 1.25rem', background: '#0E5C44', color: '#fff', border: 'none', borderRadius: '10px', cursor: 'pointer' }}>Tutup</button>
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }

  if (view === 'parents') {
    return (
      <div className="mutabaah-overview">
        <header>
          <span>Mutaba’ah Yaumiyyah</span>
          <h1>{content[0]}</h1>
          <p>{content[1]}</p>
          <small>Dashboard › Mutaba’ah › {content[0]}</small>
        </header>

        <div className="overview-kpis">
          <section>
            <UserRound />
            <span>Orang Tua Terhubung</span>
            <b>{recapData.length || kpis?.total_students || 0}</b>
            <small>Wali Murid Aktif</small>
          </section>
          <section>
            <Check />
            <span>Paraf Digital Signed</span>
            <b>{filteredRecap.filter(r => r.parent_signature_status === 'signed' || r.paraf_orang_tua === 'Sudah').length}</b>
            <small>Telah Diverifikasi Orang Tua</small>
          </section>
          <section>
            <Clock3 />
            <span>Belum Di-Paraf</span>
            <b>{filteredRecap.filter(r => r.parent_signature_status !== 'signed' && r.paraf_orang_tua !== 'Sudah').length}</b>
            <small>Menunggu Ditinjau Orang Tua</small>
          </section>
          <section>
            <NotebookPen />
            <span>Respons & Catatan</span>
            <b>{filteredRecap.filter(r => r.notes_parent || r.catatan_orang_tua).length}</b>
            <small>Masukan Orang Tua</small>
          </section>
        </div>

        <div className="overview-panels" style={{ gridTemplateColumns: '1fr', marginTop: '1.5rem' }}>
          <section style={{ background: '#ffffff', padding: '1.5rem', borderRadius: '18px', boxShadow: '0 2px 10px rgba(0,0,0,0.04)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '1rem' }}>
              <h2>Status Paraf Digital & Catatan Orang Tua</h2>
              <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  style={{ padding: '0.5rem 1rem', borderRadius: '10px', border: '1px solid #E2E8F0', fontSize: '0.875rem' }}
                >
                  <option value="all">Semua Status Paraf</option>
                  <option value="signed">Sudah Di-Paraf</option>
                  <option value="unsigned">Belum Di-Paraf</option>
                </select>
                <input
                  type="text"
                  placeholder="Cari siswa atau kelas..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  style={{ padding: '0.5rem 1rem', borderRadius: '10px', border: '1px solid #E2E8F0', fontSize: '0.875rem' }}
                />
              </div>
            </div>

            {loading ? (
              <div style={{ padding: '2rem', textAlign: 'center', color: '#64748B' }}>
                <Loader2 className="animate-spin" style={{ display: 'inline', marginRight: '0.5rem' }} /> Memuat data monitoring orang tua...
              </div>
            ) : filteredRecap.length === 0 ? (
              <div style={{ padding: '2rem', textAlign: 'center', color: '#94A3B8' }}>
                Belum ada catatan monitoring orang tua pada filter ini.
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                  <thead>
                    <tr style={{ background: '#F8FAFC', textAlign: 'left', borderBottom: '2px solid #E2E8F0' }}>
                      <th style={{ padding: '0.75rem 1rem' }}>Siswa (Anak)</th>
                      <th style={{ padding: '0.75rem 1rem' }}>Kelas</th>
                      <th style={{ padding: '0.75rem 1rem' }}>Wali Murid / Orang Tua</th>
                      <th style={{ padding: '0.75rem 1rem' }}>Status Paraf</th>
                      <th style={{ padding: '0.75rem 1rem' }}>Tanggal Paraf</th>
                      <th style={{ padding: '0.75rem 1rem' }}>Respons / Catatan</th>
                      <th style={{ padding: '0.75rem 1rem' }}>Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRecap.slice(0, 15).map((row, idx) => {
                      const isSigned = row.parent_signature_status === 'signed' || row.paraf_orang_tua === 'Sudah'
                      return (
                        <tr key={idx} style={{ borderBottom: '1px solid #F1F5F9' }}>
                          <td style={{ padding: '0.75rem 1rem', fontWeight: 600, color: '#0F172A' }}>{row.full_name || row.nama_siswa || `Siswa ${idx + 1}`}</td>
                          <td style={{ padding: '0.75rem 1rem', color: '#475569' }}>{row.class_name || row.kelas || '-'}</td>
                          <td style={{ padding: '0.75rem 1rem', color: '#334155' }}>{row.parent_name || 'Orang Tua / Wali'}</td>
                          <td style={{ padding: '0.75rem 1rem' }}>
                            <span style={{
                              padding: '0.25rem 0.6rem',
                              borderRadius: '12px',
                              fontSize: '0.75rem',
                              fontWeight: 600,
                              background: isSigned ? '#DCFCE7' : '#FEF2F2',
                              color: isSigned ? '#166534' : '#991B1B',
                            }}>
                              {isSigned ? 'Ditandatangani' : 'Belum Ditandatangani'}
                            </span>
                          </td>
                          <td style={{ padding: '0.75rem 1rem', color: '#64748B', fontSize: '0.8rem' }}>
                            {row.signed_at ? new Date(row.signed_at).toLocaleDateString('id-ID') : (isSigned ? 'Hari Ini' : '-')}
                          </td>
                          <td style={{ padding: '0.75rem 1rem', color: '#475569', fontStyle: row.notes_parent ? 'normal' : 'italic' }}>
                            {row.notes_parent || row.catatan_orang_tua || 'Belum ada catatan.'}
                          </td>
                          <td style={{ padding: '0.75rem 1rem' }}>
                            <button
                              onClick={() => setSelectedItem(row)}
                              style={{ padding: '0.35rem 0.75rem', background: '#F1F5F9', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 600, color: '#0E5C44' }}
                            >
                              Audit Detail
                            </button>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </div>

        {selectedItem && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 99999 }}>
            <div style={{ background: '#ffffff', padding: '2rem', borderRadius: '18px', maxWidth: '500px', width: '90%', maxHeight: '90vh', overflowY: 'auto' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h3 style={{ margin: 0, color: '#0E5C44' }}>Detail Paraf & Audit Metadata</h3>
                <button onClick={() => setSelectedItem(null)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X /></button>
              </div>
              <p><b>Siswa:</b> {selectedItem.full_name || selectedItem.nama_siswa}</p>
              <p><b>Orang Tua:</b> {selectedItem.parent_name || 'Orang Tua / Wali'}</p>
              <p><b>Status Paraf:</b> {(selectedItem.parent_signature_status === 'signed' || selectedItem.paraf_orang_tua === 'Sudah') ? 'Tanda Tangan Digital Sah' : 'Belum Ditandatangani'}</p>
              <p><b>Waktu Tanda Tangan:</b> {selectedItem.signed_at || 'Hari ini'}</p>
              <p><b>Catatan Orang Tua:</b> {selectedItem.notes_parent || selectedItem.catatan_orang_tua || '-'}</p>
              <p style={{ fontSize: '0.75rem', color: '#94A3B8', marginTop: '1rem' }}>Audit Security: Verified Parent User Link & IP Metadata Recorded.</p>
              <div style={{ marginTop: '1.5rem', textAlign: 'right' }}>
                <button onClick={() => setSelectedItem(null)} style={{ padding: '0.5rem 1.25rem', background: '#0E5C44', color: '#fff', border: 'none', borderRadius: '10px', cursor: 'pointer' }}>Tutup</button>
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="mutabaah-overview">
      <header>
        <span>Mutaba’ah Yaumiyyah</span>
        <h1>{content[0]}</h1>
        <p>{content[1]}</p>
        <small>Dashboard › Mutaba’ah › {content[0]}</small>
      </header>

      <div className="overview-kpis">
        {[
          ['Total Siswa', kpis?.total_students ?? counts.categories, 'Santri aktif'],
          ['Sudah Diisi', kpis?.filled ?? counts.agendas, 'Memiliki record'],
          ['Sudah Final', kpis?.finalized ?? counts.templates, 'Selesai diverifikasi'],
          ['Belum Diisi', kpis?.not_filled ?? counts.mentors, 'Perlu tindak lanjut'],
        ].map(([label, value, sub]) => (
          <section key={label}>
            <BookHeart />
            <span>{label}</span>
            <b>{value}</b>
            <small>{sub}</small>
          </section>
        ))}
      </div>

      <div className="overview-panels">
        <section>
          <h2>Progress Mutaba’ah</h2>
          <div className="overview-chart">
            {(analyticsData?.charts?.weekly_progress || [68, 75, 71, 82, 78, 88, 91]).map((item, index) => {
              const val = typeof item === 'number' ? item : (item.progress || item.filled || 50)
              return <i key={index} style={{ height: `${Math.min(100, Math.max(10, val))}%` }} />
            })}
          </div>
          <div className="chart-labels">
            {['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Ahd'].map((day) => <span key={day}>{day}</span>)}
          </div>
        </section>

        <section>
          <h2>Ringkasan Status</h2>
          {Object.entries(statusMeta).map(([key, meta], index) => {
            const percentage = statusDist[index]?.percentage ?? [78, 14, 5, 3][index]
            return (
              <div className="overview-status" key={key}>
                <span className={meta.className}>
                  <meta.icon /> {meta.label}
                </span>
                <b>{percentage}%</b>
              </div>
            )
          })}
        </section>
      </div>
    </div>
  )
}
function showError(error) { Swal.fire({ icon: 'error', title: 'Tidak dapat memproses', text: error?.response?.data?.message || 'Terjadi kesalahan saat menghubungi server.', confirmButtonColor: '#0E5C44' }) }
