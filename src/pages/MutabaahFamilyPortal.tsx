import { useEffect, useState } from 'react'
import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  BookHeart, CalendarDays, CheckCircle2, ChevronLeft, ChevronRight, Clock3,
  History, MessageSquareText, ShieldCheck, Signature, UserRound, X, XCircle,
} from 'lucide-react'
import Swal from 'sweetalert2'
import { mutabaahService } from '../services/mutabaahService'
import './MutabaahFamilyPortal.css'

type Mode = 'parent' | 'student'
const today = () => new Date().toLocaleDateString('en-CA')
const statusMeta: Record<string, { label: string; className: string }> = {
  good: { label: 'Baik', className: 'good' }, less: { label: 'Kurang', className: 'less' },
  not_done: { label: 'Belum', className: 'missing' }, na: { label: 'N/A', className: 'na' },
}

export default function MutabaahFamilyPortal({ mode }: { mode: Mode }) {
  const queryClient = useQueryClient()
  const [date, setDate] = useState(today)
  const [studentId, setStudentId] = useState('')
  const [signatureOpen, setSignatureOpen] = useState(false)
  const children = useQuery({ queryKey: ['parent-mutabaah-children'], queryFn: mutabaahService.parentChildren, enabled: mode === 'parent' })
  useEffect(() => { if (!studentId && children.data?.[0]?.id) setStudentId(children.data[0].id) }, [children.data, studentId])
  const enabled = mode === 'student' || Boolean(studentId)
  const overview = useQuery({ queryKey: ['family-mutabaah', mode, studentId, date], queryFn: () => mode === 'parent' ? mutabaahService.parentMutabaah(studentId, { date }) : mutabaahService.studentMutabaah({ date }), enabled, placeholderData: keepPreviousData })
  const history = useQuery({ queryKey: ['family-mutabaah-history', mode, studentId], queryFn: () => mode === 'parent' ? mutabaahService.parentHistory(studentId) : mutabaahService.studentMutabaahHistory(), enabled })
  const data = overview.data
  const changeDay = (offset: number) => { const current = new Date(`${date}T12:00:00`); current.setDate(current.getDate() + offset); setDate(current.toLocaleDateString('en-CA')) }
  const sign = useMutation({ mutationFn: ({ id, payload }: any) => mutabaahService.parentSignature(id, payload), onSuccess: (result) => { setSignatureOpen(false); queryClient.invalidateQueries({ queryKey: ['family-mutabaah'] }); Swal.fire({ icon: 'success', title: 'Paraf tersimpan', text: result.message, timer: 1500, showConfirmButton: false }) }, onError: showError })

  return <div className="fp-page">
    <header className="fp-hero"><div><span>{mode === 'parent' ? 'Portal Orang Tua' : 'Portal Siswa'}</span><h1>Mutaba’ah Yaumiyyah</h1><p>{mode === 'parent' ? 'Pantau ibadah, pembiasaan, catatan, dan perkembangan anak.' : 'Lihat hasil, catatan pembimbing, dan perkembangan Mutaba’ah.'}</p></div><BookHeart /></header>
    <section className="fp-controls">{mode === 'parent' && <label><span>Pilih Anak</span><select value={studentId} onChange={(e) => setStudentId(e.target.value)}>{children.data?.map((child: any) => <option key={child.id} value={child.id}>{child.name} · {child.class_name || '-'}</option>)}</select></label>}<label><span>Tanggal</span><div><button onClick={() => changeDay(-1)}><ChevronLeft /></button><CalendarDays /><input type="date" value={date} onChange={(e) => setDate(e.target.value)} /><button onClick={() => changeDay(1)}><ChevronRight /></button></div></label></section>
    {(overview.isLoading || children.isLoading) && <PortalSkeleton />}
    {overview.isError && <ErrorState retry={() => overview.refetch()} />}
    {!overview.isLoading && data && <><StudentSummary data={data} /><div className="fp-summary-grid"><ProgressCard title="Rekap Mingguan" data={data.weekly} /><ProgressCard title="Rekap Bulanan" data={data.monthly} /></div>
      {data.today ? <><section className="fp-section"><header><div><h2>Agenda Hari Ini</h2><p>{new Date(`${data.date}T12:00:00`).toLocaleDateString('id-ID', { dateStyle: 'full' })}</p></div><ProgressRing value={Number(data.today.score || 0)} /></header><div className="fp-agendas">{data.today.details.map((item: any) => <article key={item.id}><i className={statusMeta[item.status_value]?.className || 'na'}>{item.status_value === 'good' ? <CheckCircle2 /> : item.status_value === 'not_done' ? <XCircle /> : <Clock3 />}</i><div><span>{item.category}</span><b>{item.name}</b>{item.notes && <small>{item.notes}</small>}</div><em className={statusMeta[item.status_value]?.className}>{statusMeta[item.status_value]?.label || 'Belum'}</em></article>)}</div></section>
        <section className="fp-note"><MessageSquareText /><div><h3>Catatan Pembimbing/Musyrif</h3><p>{data.today.notes || 'Belum ada catatan pembimbing untuk hari ini.'}</p></div></section>
        {mode === 'parent' && <section className="fp-signature"><div><Signature /><span><b>Paraf Orang Tua</b><small>{data.today.signature ? `Diparaf ${new Date(data.today.signature.signed_at).toLocaleString('id-ID')}` : 'Menunggu konfirmasi Anda'}</small></span></div><button onClick={() => setSignatureOpen(true)}>{data.today.signature ? 'Perbarui Paraf' : 'Beri Paraf'}</button></section>}
      </> : <EmptyState />}
      <HistoryTimeline rows={history.data?.rows?.data || []} />
    </>}
    {signatureOpen && data?.today && <SignatureSheet close={() => setSignatureOpen(false)} submit={(payload: any) => sign.mutate({ id: data.today.id, payload })} saving={sign.isPending} pinEnabled={false} />}
  </div>
}

function StudentSummary({ data }: any) { return <section className="fp-student"><div className="fp-avatar">{data.student.photo ? <img src={data.student.photo} alt="" /> : <UserRound />}</div><div><span>Ringkasan Mutaba’ah Anak</span><h2>{data.student.name}</h2><p>{data.student.nis} · {data.student.class_name || '-'} · {data.student.unit || '-'}</p></div><ProgressRing value={Number(data.today?.score || 0)} /></section> }
function ProgressCard({ title, data }: any) { return <article className="fp-progress-card"><div><span>{title}</span><b>{data.score}%</b><small>{data.days} hari tercatat</small></div><div className="fp-mini-stats"><i className="good">Baik {data.good}</i><i className="less">Kurang {data.less}</i><i className="missing">Belum {data.not_done}</i><i className="na">N/A {data.na}</i></div></article> }
function ProgressRing({ value }: { value: number }) { return <div className="fp-ring" style={{ '--progress': Math.min(100, Math.max(0, value)) } as any}><div><b>{Math.round(value)}</b><small>%</small></div></div> }
function HistoryTimeline({ rows }: any) { return <section className="fp-history"><h2><History /> Riwayat Harian</h2>{rows.map((row: any) => <article key={row.id}><i className={row.parent_signed ? 'signed' : ''} /><div><b>{new Date(row.activity_date).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'short' })}</b><span>Baik {row.good_count} · Kurang {row.less_count} · Belum {row.not_done_count} · N/A {row.na_count}</span>{row.supervisor_notes && <small>{row.supervisor_notes}</small>}</div><strong>{row.score || 0}%</strong></article>)}{!rows.length && <p className="fp-muted">Belum ada riwayat final.</p>}</section> }
function SignatureSheet({ close, submit, saving, pinEnabled }: any) {
  const [status, setStatus] = useState('approved'); const [comment, setComment] = useState(''); const [pin, setPin] = useState('')
  return <div className="fp-sheet-layer" onMouseDown={(e) => e.target === e.currentTarget && close()}><form className="fp-sheet" onSubmit={(e) => { e.preventDefault(); submit({ signature_status: status, comment: comment || null, pin: pin || undefined, device_info: { platform: navigator.platform, app: 'SIMSIT Web' } }) }}><header><div><span>Konfirmasi Orang Tua</span><h2>Paraf Mutaba’ah</h2></div><button type="button" onClick={close}><X /></button></header><main><label className={status === 'approved' ? 'active' : ''}><input type="radio" value="approved" checked={status === 'approved'} onChange={(e) => setStatus(e.target.value)} /><CheckCircle2 /><span><b>Setujui</b><small>Saya telah melihat hasil Mutaba’ah.</small></span></label><label className={status === 'clarification_requested' ? 'active' : ''}><input type="radio" value="clarification_requested" checked={status === 'clarification_requested'} onChange={(e) => setStatus(e.target.value)} /><MessageSquareText /><span><b>Minta Klarifikasi</b><small>Memerlukan penjelasan pembimbing.</small></span></label><label className={status === 'unable_to_verify' ? 'active' : ''}><input type="radio" value="unable_to_verify" checked={status === 'unable_to_verify'} onChange={(e) => setStatus(e.target.value)} /><ShieldCheck /><span><b>Tidak Dapat Memverifikasi</b><small>Data belum dapat saya pastikan.</small></span></label><textarea value={comment} onChange={(e) => setComment(e.target.value)} maxLength={1000} placeholder="Tambahkan komentar (opsional)..." />{pinEnabled && <input type="password" inputMode="numeric" value={pin} onChange={(e) => setPin(e.target.value)} placeholder="PIN akun" />}</main><footer><button type="button" onClick={close}>Batal</button><button className="primary" disabled={saving}>{saving ? 'Menyimpan...' : 'Konfirmasi Paraf'}</button></footer></form></div>
}
function PortalSkeleton() { return <div className="fp-skeleton">{Array.from({ length: 6 }).map((_, i) => <i key={i} />)}</div> }
function EmptyState() { return <section className="fp-empty"><BookHeart /><h3>Belum ada hasil hari ini</h3><p>Hasil akan tampil setelah pembimbing melakukan finalisasi.</p></section> }
function ErrorState({ retry }: any) { return <section className="fp-empty error"><XCircle /><h3>Data gagal dimuat</h3><p>Silakan periksa koneksi dan coba kembali.</p><button onClick={retry}>Coba Lagi</button></section> }
function showError(error: any) { Swal.fire({ icon: 'error', title: 'Tidak dapat menyimpan', text: error?.response?.data?.message || 'Terjadi kesalahan.', confirmButtonColor: '#0E5C44' }) }
