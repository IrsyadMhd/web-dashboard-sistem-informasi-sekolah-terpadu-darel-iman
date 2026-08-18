import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { BookOpenCheck, Eye, EyeOff, GraduationCap, HeartHandshake, Loader2, LockKeyhole, ShieldCheck, UserRound } from 'lucide-react'
import { authService } from '../services/authService'
import { useAuthStore } from '../stores/authStore'
import { usePengaturanStore } from '../stores/pengaturanStore'

export default function FamilyPortalLoginPage() {
  const navigate = useNavigate()
  const setSession = useAuthStore((state) => state.setSession)
  const settings = usePengaturanStore((state) => state.pengaturan)
  const loadSettings = usePengaturanStore((state) => state.muatPengaturan)
  const [portalType, setPortalType] = useState('parent')
  const [form, setForm] = useState({ identifier: '', password: '', remember: true })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  useEffect(() => { loadSettings() }, [loadSettings])

  const submit = async (event) => {
    event.preventDefault(); setLoading(true); setError('')
    try {
      const result = await authService.loginParentStudent({ portal_type: portalType, identifier: form.identifier, password: form.password })
      setSession({ token: result.token, user: result.user })
      navigate(portalType === 'parent' ? '/portal-orangtua' : '/portal-siswa', { replace: true })
    } catch (err) {
      setError(err.response?.data?.message || 'NIS/NIK/nomor HP atau password/PIN tidak valid.')
    } finally { setLoading(false) }
  }

  const schoolName = settings?.school_name || 'YAYASAN DAR EL - IMAN'
  return <main className="relative min-h-screen overflow-hidden bg-[#F5F8F6] px-4 py-8 dark:bg-slate-950 sm:py-12">
    <div className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-emerald-200/40 blur-3xl dark:bg-emerald-900/20" /><div className="absolute -bottom-40 -right-28 h-96 w-96 rounded-full bg-amber-200/30 blur-3xl dark:bg-amber-900/10" />
    <div className="relative mx-auto grid min-h-[calc(100vh-6rem)] max-w-5xl overflow-hidden rounded-[24px] border border-white bg-white shadow-2xl shadow-emerald-950/10 dark:border-slate-800 dark:bg-slate-900 lg:grid-cols-[1.05fr_.95fr]">
      <section className="relative hidden overflow-hidden bg-gradient-to-br from-[#0E5C44] via-[#176E52] to-[#3FBF75] p-10 text-white lg:flex lg:flex-col lg:justify-between">
        <div><p className="text-xs font-black uppercase tracking-[.22em] text-emerald-100">Portal Keluarga SIMSIT</p><h1 className="mt-5 text-4xl font-black leading-tight">Sekolah dan keluarga, tumbuh bersama.</h1><p className="mt-4 max-w-md text-sm leading-6 text-emerald-50">Pantau perkembangan akademik, ibadah, tugas, kehadiran, dan komunikasi sekolah dalam satu portal aman.</p></div>
        <div className="grid grid-cols-2 gap-3">{[[ShieldCheck,'Akses aman'],[HeartHandshake,'Terhubung guru'],[BookOpenCheck,'Progres belajar'],[GraduationCap,'Rapor digital']].map(([Icon,label]) => <div key={label} className="rounded-2xl border border-white/20 bg-white/10 p-4 backdrop-blur"><Icon className="h-5 w-5" /><p className="mt-2 text-xs font-bold">{label}</p></div>)}</div>
      </section>
      <section className="flex items-center p-6 sm:p-10">
        <div className="mx-auto w-full max-w-sm">
          <div className="mb-7 flex items-center gap-3"><div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-700 text-white"><GraduationCap className="h-7 w-7" /></div><div><p className="text-[10px] font-bold uppercase tracking-wider text-emerald-600">{schoolName}</p><h2 className="text-xl font-black text-slate-900 dark:text-white">Masuk Portal Keluarga</h2></div></div>
          <div className="mb-6 grid grid-cols-2 rounded-2xl bg-slate-100 p-1.5 dark:bg-slate-800">{[['parent','Orang Tua',HeartHandshake],['student','Siswa',GraduationCap]].map(([value,label,Icon]) => <button type="button" key={value} onClick={() => { setPortalType(value); setError('') }} className={`flex h-11 items-center justify-center gap-2 rounded-xl text-xs font-bold transition ${portalType === value ? 'bg-white text-emerald-700 shadow dark:bg-slate-700 dark:text-emerald-300' : 'text-slate-500'}`}><Icon className="h-4 w-4" />{label}</button>)}</div>
          {error && <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs font-semibold text-rose-700 dark:border-rose-900 dark:bg-rose-950/30 dark:text-rose-300">{error}</div>}
          <form onSubmit={submit} className="space-y-4">
            <div><label className="mb-1.5 block text-xs font-bold text-slate-600 dark:text-slate-300">{portalType === 'parent' ? 'NIK, nomor HP, atau email' : 'NIS, NISN, atau email'}</label><div className="relative"><UserRound className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" /><input value={form.identifier} onChange={(e) => setForm({...form,identifier:e.target.value})} required autoComplete="username" className="h-12 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 text-sm outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100 dark:border-slate-700 dark:bg-slate-800" placeholder={portalType === 'parent' ? 'Masukkan identitas orang tua' : 'Masukkan identitas siswa'} /></div></div>
            <div><label className="mb-1.5 block text-xs font-bold text-slate-600 dark:text-slate-300">Password / PIN</label><div className="relative"><LockKeyhole className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" /><input type={showPassword?'text':'password'} value={form.password} onChange={(e) => setForm({...form,password:e.target.value})} required autoComplete="current-password" className="h-12 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-11 text-sm outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100 dark:border-slate-700 dark:bg-slate-800" placeholder="Masukkan password atau PIN" /><button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-3 rounded-lg p-1 text-slate-400" aria-label="Tampilkan password">{showPassword?<EyeOff className="h-4 w-4"/>:<Eye className="h-4 w-4"/>}</button></div></div>
            <label className="flex items-center gap-2 text-xs text-slate-500"><input type="checkbox" checked={form.remember} onChange={(e)=>setForm({...form,remember:e.target.checked})} className="accent-emerald-700" />Ingat saya di perangkat ini</label>
            <button disabled={loading} className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#0E5C44] text-sm font-black text-white shadow-lg shadow-emerald-900/20 transition hover:bg-[#176E52] disabled:opacity-60">{loading?<Loader2 className="h-4 w-4 animate-spin"/>:<ShieldCheck className="h-4 w-4"/>}Masuk sebagai {portalType === 'parent' ? 'Orang Tua' : 'Siswa'}</button>
          </form>
          <button onClick={() => navigate('/masuk')} className="mt-5 w-full text-center text-xs font-bold text-slate-500 hover:text-emerald-700">Masuk sebagai Admin/Guru/Pegawai</button>
        </div>
      </section>
    </div>
  </main>
}
