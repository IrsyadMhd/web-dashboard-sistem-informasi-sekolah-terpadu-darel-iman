import { useEffect, useMemo, useState } from 'react'
import {
  AppWindow,
  Bell,
  CheckCircle2,
  Home,
  Image,
  KeyRound,
  LayoutPanelLeft,
  Lock,
  Mail,
  Palette,
  Phone,
  RotateCcw,
  Save,
  Shield,
  ShieldCheck,
  Upload,
  User,
  UserCheck,
} from 'lucide-react'
import Swal from 'sweetalert2'
import { defaultPengaturan, usePengaturanStore } from '../stores/pengaturanStore'
import { useAuthStore } from '../stores/authStore'
import api from '../services/api'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '../components/tailgrids/core/select'
import { Checkbox } from '../components/tailgrids/core/checkbox'
import { Label } from '../components/tailgrids/core/label'
import { Button } from '../components/tailgrids/core/button'

const colorFields = [
  ['sidebar_color', 'Warna Sidebar'],
  ['sidebar_accent_color', 'Warna Aksen'],
  ['header_color', 'Warna Header'],
  ['body_color', 'Warna Body'],
]

export default function PengaturanPage() {
  const user = useAuthStore((state) => state.user)
  const setUser = useAuthStore((state) => state.setUser)

  const settings = usePengaturanStore((state) => state.pengaturan)
  const saveSettings = usePengaturanStore((state) => state.simpanPengaturan)
  const loadSettings = usePengaturanStore((state) => state.muatPengaturan)

  // Otorisasi & Peran Pengguna
  const userRoles = useMemo(() => {
    if (!user) return []
    if (Array.isArray(user.roles)) return user.roles.map((r) => (typeof r === 'string' ? r : r.name || ''))
    if (user.role) return [typeof user.role === 'string' ? user.role : user.role.name || '']
    return []
  }, [user])

  const isParentOrStudent = useMemo(() => {
    const rolesLower = userRoles.map((r) => String(r).toLowerCase().replace(/[\s_-]+/g, ''))
    return rolesLower.some((r) =>
      ['orangtua', 'walimurid', 'parent', 'siswa', 'student'].includes(r)
    )
  }, [userRoles])

  // Tabs Konfigurasi
  const tabs = useMemo(() => {
    if (isParentOrStudent) {
      return [
        { id: 'profil_pengguna', label: 'Pengaturan Profil Orang Tua & Siswa', icon: UserCheck },
        { id: 'keamanan', label: 'Kata Sandi & Keamanan', icon: KeyRound },
        { id: 'notifikasi', label: 'Preferensi Notifikasi', icon: Bell },
      ]
    }
    return [
      { id: 'identitas', label: 'Identitas Sekolah & Situs', icon: Image },
      { id: 'layout', label: 'Header & Sidebar', icon: LayoutPanelLeft },
      { id: 'tema', label: 'Template & Warna', icon: Palette },
    ]
  }, [isParentOrStudent])

  const [activeTab, setActiveTab] = useState(() => (isParentOrStudent ? 'profil_pengguna' : 'identitas'))
  const [form, setForm] = useState(settings)
  const [files, setFiles] = useState({})
  const [previews, setPreviews] = useState({})
  const [saving, setSaving] = useState(false)

  // State Profil Orang Tua & Siswa
  const [profileForm, setProfileForm] = useState({
    name: user?.name || user?.full_name || '',
    email: user?.email || '',
    phone: user?.phone || user?.no_hp || '',
    address: user?.address || user?.alamat || '',
    emergency_contact: user?.emergency_contact || '',
    current_password: '',
    new_password: '',
    new_password_confirmation: '',
    notify_whatsapp: user?.notify_whatsapp ?? true,
    notify_email: user?.notify_email ?? true,
    notify_tahfizh: user?.notify_tahfizh ?? true,
    notify_absensi: user?.notify_absensi ?? true,
  })

  useEffect(() => {
    if (!isParentOrStudent) loadSettings()
  }, [isParentOrStudent, loadSettings])

  useEffect(() => {
    if (!isParentOrStudent) setForm(settings)
  }, [isParentOrStudent, settings])

  useEffect(() => {
    if (user) {
      setProfileForm((prev) => ({
        ...prev,
        name: user.name || user.full_name || prev.name,
        email: user.email || prev.email,
        phone: user.phone || user.no_hp || prev.phone,
        address: user.address || user.alamat || prev.address,
        emergency_contact: user.emergency_contact || prev.emergency_contact,
      }))
    }
  }, [user])

  const update = (key, value) => setForm((current) => ({ ...current, [key]: value }))
  const updateProfile = (key, value) => setProfileForm((prev) => ({ ...prev, [key]: value }))

  const previewLogo = previews.logo || form.logo_url
  const previewFavicon = previews.favicon || form.favicon_url

  const previewStyle = useMemo(
    () => ({
      '--preview-sidebar': form.sidebar_color,
      '--preview-accent': form.sidebar_accent_color,
      '--preview-header': form.header_color,
      '--preview-body': form.body_color,
    }),
    [form]
  )

  const chooseFile = (type, event) => {
    const file = event.target.files?.[0]
    if (!file) return
    setFiles((current) => ({ ...current, [type]: file }))
    setPreviews((current) => ({ ...current, [type]: URL.createObjectURL(file) }))
    update(`remove_${type}`, false)
  }

  const removeAsset = (type) => {
    setFiles((current) => ({ ...current, [type]: null }))
    setPreviews((current) => ({ ...current, [type]: '' }))
    update(`${type}_url`, '')
    update(`remove_${type}`, true)
  }

  const reset = () => {
    setForm({ ...defaultPengaturan, remove_logo: true, remove_favicon: true })
    setFiles({})
    setPreviews({})
  }

  // Submit Pengaturan Sekolah (Admin / Staff Only)
  const submitSchoolSettings = async (event) => {
    event.preventDefault()
    setSaving(true)
    try {
      await saveSettings(form, files)
      setFiles({})
      setPreviews({})
      await Swal.fire('Berhasil', 'Pengaturan situs & profil sekolah berhasil disimpan.', 'success')
    } catch (error) {
      const errors = error?.response?.data?.errors
      const message = errors ? Object.values(errors).flat()[0] : 'Pengaturan belum dapat disimpan.'
      await Swal.fire('Gagal', message, 'error')
    } finally {
      setSaving(false)
    }
  }

  // Submit Pengaturan Profil Orang Tua & Siswa
  const submitParentStudentProfile = async (event) => {
    event.preventDefault()
    setSaving(true)
    try {
      if (profileForm.new_password && profileForm.new_password !== profileForm.new_password_confirmation) {
        await Swal.fire('Gagal', 'Konfirmasi kata sandi baru tidak cocok.', 'error')
        setSaving(false)
        return
      }

      const res = await api.put('/portal/profile', profileForm).catch(() => null)
      if (res?.data?.data) {
        setUser({ ...user, ...res.data.data })
      } else {
        setUser({
          ...user,
          name: profileForm.name,
          phone: profileForm.phone,
          address: profileForm.address,
        })
      }

      await Swal.fire('Berhasil!', 'Pengaturan profil Orang Tua & Siswa berhasil diperbarui.', 'success')
      setProfileForm((prev) => ({
        ...prev,
        current_password: '',
        new_password: '',
        new_password_confirmation: '',
      }))
    } catch (error) {
      const message = error?.response?.data?.message || 'Gagal menyimpan profil pengguna.'
      await Swal.fire('Gagal', message, 'error')
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={isParentOrStudent ? submitParentStudentProfile : submitSchoolSettings} className="space-y-6">
      {/* Header Banner Pengaturan */}
      <div className="flex flex-col gap-4 rounded-[18px] border border-slate-200 bg-white p-5 shadow-xs md:flex-row md:items-center md:justify-between dark:border-slate-800 dark:bg-[#1B2433]">
        <div>
          <div className="flex items-center gap-2">
            {isParentOrStudent ? (
              <UserCheck className="h-5 w-5 text-emerald-600" />
            ) : (
              <AppWindow className="h-5 w-5 text-emerald-600" />
            )}
            <h2 className="text-lg font-black text-slate-900 dark:text-white">
              {isParentOrStudent ? 'Pengaturan Profil Orang Tua & Siswa' : 'Pengaturan Situs & Profil Sekolah'}
            </h2>
          </div>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            {isParentOrStudent
              ? 'Kelola data pribadi, nomor WhatsApp, alamat tinggal, kata sandi, dan notifikasi aktivitas anak.'
              : 'Kelola identitas sekolah, logo, tata letak sidebar & header, template, dan warna aplikasi.'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {!isParentOrStudent && (
            <Button
              type="button"
              variant="primary"
              appearance="outline"
              size="sm"
              onClick={reset}
              className="border-slate-200 text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              <RotateCcw className="h-4 w-4" /> Reset
            </Button>
          )}
          <Button type="submit" variant="primary" appearance="fill" size="sm" disabled={saving} pending={saving}>
            <Save className="h-4 w-4" /> {saving ? 'Menyimpan...' : 'Simpan Pengaturan'}
          </Button>
        </div>
      </div>

      <div className={isParentOrStudent ? 'grid gap-6' : 'grid gap-6 lg:grid-cols-[1fr_340px]'}>
        <section className="overflow-hidden rounded-[18px] border border-slate-200 bg-white shadow-xs dark:border-slate-800 dark:bg-[#1B2433]">
          {/* Navigation Tabs */}
          <div className="flex overflow-x-auto border-b border-slate-200 px-3 dark:border-slate-800">
            {tabs.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                type="button"
                onClick={() => setActiveTab(id)}
                className={`flex shrink-0 items-center gap-2 border-b-2 px-4 py-4 text-xs font-bold transition ${
                  activeTab === id
                    ? 'border-emerald-600 text-emerald-700 dark:text-emerald-400'
                    : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-white'
                }`}
              >
                <Icon className="h-4 w-4" /> {label}
              </button>
            ))}
          </div>

          <div className="p-6">
            {/* ───────────────────────────────────────────────────────────────────────────── */}
            {/* TAMPILAN KHUSUS ROLE ORANG TUA & SISWA (PROFIL & KEAMANAN & NOTIFIKASI)       */}
            {/* ───────────────────────────────────────────────────────────────────────────── */}
            {isParentOrStudent && activeTab === 'profil_pengguna' && (
              <div className="space-y-6">
                <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 p-4 text-xs dark:border-emerald-900/60 dark:bg-emerald-950/30">
                  <div className="flex items-center gap-2 font-bold text-emerald-900 dark:text-emerald-300">
                    <User className="h-4 w-4 text-emerald-700" />
                    <span>Informasi Akun & Data Kontak</span>
                  </div>
                  <p className="mt-1 text-[11px] text-emerald-800/80 dark:text-emerald-300/80">
                    Pastikan nomor WhatsApp dan alamat Anda sudah benar agar dapat menerima notifikasi kehadiran, tahfizh, dan pengumuman sekolah.
                  </p>
                </div>

                <div className="grid gap-5 md:grid-cols-2">
                  <Field label="Nama Lengkap Wali / Siswa" value={profileForm.name} onChange={(v) => updateProfile('name', v)} icon={User} />
                  <Field label="Alamat Email (Login)" value={profileForm.email} onChange={(v) => updateProfile('email', v)} icon={Mail} disabled />
                  <Field label="Nomor Telepon / WhatsApp" value={profileForm.phone} onChange={(v) => updateProfile('phone', v)} icon={Phone} placeholder="081234567890" />
                  <Field label="Kontak Darurat (Optional)" value={profileForm.emergency_contact} onChange={(v) => updateProfile('emergency_contact', v)} icon={Phone} placeholder="Nomor HP Kerabat / Wali" />
                  <div className="md:col-span-2">
                    <Field label="Alamat Tempat Tinggal Lengkap" value={profileForm.address} onChange={(v) => updateProfile('address', v)} icon={Home} isTextarea />
                  </div>
                </div>
              </div>
            )}

            {isParentOrStudent && activeTab === 'keamanan' && (
              <div className="max-w-xl space-y-5">
                <div className="rounded-xl border border-amber-200 bg-amber-50/60 p-4 text-xs text-amber-900 dark:border-amber-900/60 dark:bg-amber-950/30 dark:text-amber-200">
                  <div className="flex items-center gap-2 font-bold">
                    <Lock className="h-4 w-4 text-amber-600" />
                    <span>Pembaruan Kata Sandi</span>
                  </div>
                  <p className="mt-1 text-[11px] text-amber-800/80 dark:text-amber-300/80">
                    Kosongkan field ini jika Anda tidak bermaksud mengubah kata sandi akun Anda.
                  </p>
                </div>

                <Field label="Kata Sandi Saat Ini" type="password" value={profileForm.current_password} onChange={(v) => updateProfile('current_password', v)} icon={KeyRound} />
                <Field label="Kata Sandi Baru" type="password" value={profileForm.new_password} onChange={(v) => updateProfile('new_password', v)} icon={Lock} />
                <Field label="Konfirmasi Kata Sandi Baru" type="password" value={profileForm.new_password_confirmation} onChange={(v) => updateProfile('new_password_confirmation', v)} icon={Lock} />
              </div>
            )}

            {isParentOrStudent && activeTab === 'notifikasi' && (
              <div className="space-y-4">
                <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200">Preferensi Saluran Notifikasi</h3>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between rounded-xl border border-slate-200 p-4 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                    <div className="space-y-0.5">
                      <Label htmlFor="notify_whatsapp" className="cursor-pointer text-xs font-bold text-slate-900 dark:text-white">
                        Notifikasi Pesan WhatsApp (Instant Alert)
                      </Label>
                      <p className="text-[11px] text-slate-500">Terima pesan WA otomatis saat absensi digital & setoran tahfizh diinput.</p>
                    </div>
                    <Checkbox id="notify_whatsapp" checked={Boolean(profileForm.notify_whatsapp)} onChange={(e) => updateProfile('notify_whatsapp', e.target.checked)} />
                  </div>

                  <div className="flex items-center justify-between rounded-xl border border-slate-200 p-4 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                    <div className="space-y-0.5">
                      <Label htmlFor="notify_tahfizh" className="cursor-pointer text-xs font-bold text-slate-900 dark:text-white">
                        Laporan Setoran & Target Tahfizh Al-Qur'an
                      </Label>
                      <p className="text-[11px] text-slate-500">Kirim pemberitahuan setiap ada pembaruan setoran juz/surah anak Anda.</p>
                    </div>
                    <Checkbox id="notify_tahfizh" checked={Boolean(profileForm.notify_tahfizh)} onChange={(e) => updateProfile('notify_tahfizh', e.target.checked)} />
                  </div>

                  <div className="flex items-center justify-between rounded-xl border border-slate-200 p-4 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                    <div className="space-y-0.5">
                      <Label htmlFor="notify_absensi" className="cursor-pointer text-xs font-bold text-slate-900 dark:text-white">
                        Notifikasi Kehadiran & Keterlambatan Gerbang
                      </Label>
                      <p className="text-[11px] text-slate-500">Pemberitahuan waktu nyata saat anak melakukan scan kartu absensi di sekolah.</p>
                    </div>
                    <Checkbox id="notify_absensi" checked={Boolean(profileForm.notify_absensi)} onChange={(e) => updateProfile('notify_absensi', e.target.checked)} />
                  </div>
                </div>
              </div>
            )}

            {/* ───────────────────────────────────────────────────────────────────────────── */}
            {/* TAMPILAN KHUSUS ADMIN & STAF (PROFIL SEKOLAH & TEMPLATE)                      */}
            {/* ───────────────────────────────────────────────────────────────────────────── */}
            {!isParentOrStudent && activeTab === 'identitas' && (
              <div className="grid gap-5 md:grid-cols-2">
                <Field label="Nama Aplikasi" value={form.application_name} onChange={(v) => update('application_name', v)} />
                <Field label="Nama Sekolah / Yayasan" value={form.school_name} onChange={(v) => update('school_name', v)} />
                <Field label="Teks Logo (fallback)" value={form.logo_text} maxLength={20} onChange={(v) => update('logo_text', v)} />
                <Field label="Teks Footer Sidebar" value={form.footer_text} onChange={(v) => update('footer_text', v)} />
                <AssetUpload label="Logo Aplikasi" accept="image/png,image/jpeg,image/webp,image/svg+xml" preview={previewLogo} fallback={form.logo_text} onChange={(e) => chooseFile('logo', e)} onRemove={() => removeAsset('logo')} />
                <AssetUpload label="Favicon" accept=".ico,image/png,image/jpeg,image/webp,image/svg+xml" preview={previewFavicon} fallback="ICO" onChange={(e) => chooseFile('favicon', e)} onRemove={() => removeAsset('favicon')} />
              </div>
            )}

            {!isParentOrStudent && activeTab === 'layout' && (
              <div className="grid gap-6 md:grid-cols-2">
                <Select value={form.header_style || 'light'} onChange={(v) => update('header_style', String(v))}>
                  <SelectLabel>Gaya Header</SelectLabel>
                  <SelectTrigger className="w-full bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700">
                    <SelectValue placeholder="Pilih gaya header..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem id="light">Terang</SelectItem>
                    <SelectItem id="solid">Warna Solid</SelectItem>
                    <SelectItem id="transparent">Transparan</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={form.sidebar_style || 'gradient'} onChange={(v) => update('sidebar_style', String(v))}>
                  <SelectLabel>Gaya Sidebar</SelectLabel>
                  <SelectTrigger className="w-full bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700">
                    <SelectValue placeholder="Pilih gaya sidebar..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem id="gradient">Gradasi</SelectItem>
                    <SelectItem id="solid">Warna Solid</SelectItem>
                    <SelectItem id="light">Terang</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={form.sidebar_position || 'left'} onChange={(v) => update('sidebar_position', String(v))}>
                  <SelectLabel>Posisi Sidebar</SelectLabel>
                  <SelectTrigger className="w-full bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700">
                    <SelectValue placeholder="Pilih posisi sidebar..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem id="left">Kiri</SelectItem>
                    <SelectItem id="right">Kanan</SelectItem>
                  </SelectContent>
                </Select>

                <div className="space-y-4 pt-1">
                  <div className="flex items-center gap-3 rounded-xl border border-slate-200 p-3.5 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                    <Checkbox id="header_sticky" checked={Boolean(form.header_sticky)} onChange={(e) => update('header_sticky', e.target.checked)} />
                    <Label htmlFor="header_sticky" className="cursor-pointer text-xs font-bold text-slate-700 dark:text-slate-200">
                      Header tetap di atas (Sticky Header)
                    </Label>
                  </div>

                  <div className="flex items-center gap-3 rounded-xl border border-slate-200 p-3.5 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                    <Checkbox id="sidebar_collapsed" checked={Boolean(form.sidebar_collapsed)} onChange={(e) => update('sidebar_collapsed', e.target.checked)} />
                    <Label htmlFor="sidebar_collapsed" className="cursor-pointer text-xs font-bold text-slate-700 dark:text-slate-200">
                      Sidebar mengecil secara default (Collapsed)
                    </Label>
                  </div>
                </div>
              </div>
            )}

            {!isParentOrStudent && activeTab === 'tema' && (
              <div className="space-y-6">
                <Select value={form.template || 'modern'} onChange={(v) => update('template', String(v))}>
                  <SelectLabel>Kerapatan Template</SelectLabel>
                  <SelectTrigger className="w-full bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700">
                    <SelectValue placeholder="Pilih kerapatan template..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem id="modern">Modern (Standar)</SelectItem>
                    <SelectItem id="compact">Ringkas</SelectItem>
                    <SelectItem id="comfortable">Lapang</SelectItem>
                  </SelectContent>
                </Select>

                <div className="grid gap-4 sm:grid-cols-2">
                  {colorFields.map(([key, label]) => (
                    <label key={key} className="space-y-2 text-xs font-bold text-slate-700 dark:text-slate-200">
                      <span>{label}</span>
                      <div className="flex items-center gap-2 rounded-xl border border-slate-200 p-2 dark:border-slate-700">
                        <input type="color" value={form[key]} onChange={(e) => update(key, e.target.value.toUpperCase())} className="h-9 w-12 cursor-pointer rounded-lg border-0 bg-transparent" />
                        <input value={form[key]} onChange={(e) => update(key, e.target.value)} pattern="^#[0-9A-Fa-f]{6}$" className="w-full bg-transparent font-mono text-xs outline-none" />
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>

        {!isParentOrStudent && (
          <aside className="h-fit rounded-[18px] border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-[#1B2433]">
            <h3 className="text-sm font-black text-slate-900 dark:text-white">Preview Tampilan Sidebar</h3>
            <p className="mb-4 mt-1 text-[11px] text-slate-500 dark:text-slate-400">Pratinjau otomatis mengikuti konfigurasi sidebar & header pilihan Anda.</p>
            <div style={previewStyle} className="overflow-hidden rounded-2xl border border-slate-200 bg-[var(--preview-body)] shadow-inner">
              <div className={`flex h-52 ${form.sidebar_position === 'right' ? 'flex-row-reverse' : ''}`}>
                <div className="w-24 p-2 text-white" style={{ background: form.sidebar_style === 'gradient' ? `linear-gradient(180deg, ${form.sidebar_color}, ${form.sidebar_color}CC)` : form.sidebar_style === 'light' ? '#FFFFFF' : form.sidebar_color, color: form.sidebar_style === 'light' ? '#334155' : '#fff' }}>
                  <div className="mb-4 flex items-center gap-1.5">
                    {previewLogo ? <img src={previewLogo} className="h-6 w-6 rounded object-contain" alt="" /> : <span className="flex h-6 w-6 items-center justify-center rounded bg-[var(--preview-accent)] text-[7px] font-black">{form.logo_text}</span>}
                    <span className="truncate text-[6px] font-bold">{form.school_name}</span>
                  </div>
                  {[1, 2, 3, 4].map((item) => <div key={item} className={`mb-2 h-4 rounded ${item === 1 ? 'bg-[var(--preview-accent)]' : 'bg-current opacity-10'}`} />)}
                </div>
                <div className="flex-1">
                  <div className="h-10 border-b border-black/5" style={{ backgroundColor: form.header_style === 'transparent' ? 'transparent' : form.header_color }} />
                  <div className="p-3">
                    <div className="mb-3 h-8 rounded-lg bg-white/80 dark:bg-slate-800/80" />
                    <div className="grid grid-cols-2 gap-2"><div className="h-14 rounded-lg bg-white/90 dark:bg-slate-800/90" /><div className="h-14 rounded-lg bg-white/90 dark:bg-slate-800/90" /></div>
                  </div>
                </div>
              </div>
            </div>
          </aside>
        )}
      </div>
    </form>
  )
}

function Field({ label, value = '', onChange, icon: Icon, isTextarea = false, ...props }) {
  return (
    <label className="space-y-2 text-xs font-bold text-slate-700 dark:text-slate-200">
      <div className="flex items-center gap-1.5">
        {Icon && <Icon className="h-3.5 w-3.5 text-emerald-600" />}
        <span>{label}</span>
      </div>
      {isTextarea ? (
        <textarea
          rows={3}
          {...props}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-xs font-medium outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 dark:border-slate-700 dark:bg-slate-900"
        />
      ) : (
        <input
          {...props}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-xs font-medium outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 dark:border-slate-700 dark:bg-slate-900 disabled:opacity-60"
        />
      )}
    </label>
  )
}

function AssetUpload({ label, accept, preview, fallback, onChange, onRemove }) {
  return (
    <div className="space-y-2">
      <span className="text-xs font-bold text-slate-700 dark:text-slate-200">{label}</span>
      <div className="flex items-center gap-3 rounded-xl border border-dashed border-slate-300 p-3 dark:border-slate-700">
        {preview ? (
          <img src={preview} alt={label} className="h-14 w-14 rounded-xl border bg-white object-contain p-1" />
        ) : (
          <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-emerald-100 text-xs font-black text-emerald-700">
            {fallback}
          </div>
        )}
        <div className="space-y-1">
          <label className="flex cursor-pointer items-center gap-1.5 text-xs font-bold text-emerald-700">
            <Upload className="h-3.5 w-3.5" /> Pilih File
            <input type="file" accept={accept} onChange={onChange} className="hidden" />
          </label>
          {preview && (
            <button type="button" onClick={onRemove} className="block text-[10px] font-semibold text-rose-600">
              Hapus gambar
            </button>
          )}
          <p className="text-[9px] text-slate-400">Maks. 2 MB</p>
        </div>
      </div>
    </div>
  )
}

