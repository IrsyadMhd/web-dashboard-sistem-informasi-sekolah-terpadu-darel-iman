import { useEffect, useMemo, useState } from 'react'
import AppBreadcrumb from '../components/app/AppBreadcrumb'
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

  const isSuperAdminOrAdmin = useMemo(() => {
    const rolesLower = userRoles.map((r) => String(r).toLowerCase().replace(/[\s_-]+/g, ''))
    return rolesLower.some((r) => ['superadmin', 'admin'].includes(r))
  }, [userRoles])

  // Karena halaman Pengaturan khusus Super Admin & Admin, isParentOrStudent selalu false
  const isParentOrStudent = false

  // Tabs Konfigurasi (Pengaturan Sistem hanya untuk Superadmin & Admin)
  const tabs = useMemo(() => {
    return [
      { id: 'identitas', label: 'Identitas Sekolah & Situs', icon: Image },
      { id: 'layout', label: 'Header & Sidebar', icon: LayoutPanelLeft },
      { id: 'tema', label: 'Template & Warna', icon: Palette },
    ]
  }, [])

  const [activeTab, setActiveTab] = useState('identitas')
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

  if (!isSuperAdminOrAdmin) {
    return (
      <div className="p-6 max-w-3xl mx-auto space-y-4">
        <div className="p-6 bg-rose-50 border border-rose-200 rounded-2xl dark:bg-rose-950/40 dark:border-rose-900/60 text-rose-800 dark:text-rose-200 space-y-3">
          <div className="flex items-center gap-3">
            <Shield className="w-8 h-8 text-rose-600 dark:text-rose-400" />
            <div>
              <h2 className="text-lg font-bold">Akses Ditolak (403 Forbidden)</h2>
              <p className="text-sm text-rose-600 dark:text-rose-300">
                Fitur Pengaturan Sistem HANYA dapat diakses oleh pengguna dengan role <strong>Super Admin</strong> dan <strong>Admin</strong>.
              </p>
            </div>
          </div>
          <div className="pt-2">
            <Button variant="ghost" onClick={() => window.location.href = '/dashboard'}>
              Kembali ke Dashboard
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={submitSchoolSettings} className="space-y-6 pb-12">
      {/* 1. App Breadcrumb Navigation */}
      <AppBreadcrumb items={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Pengaturan Tampilan & Identitas' }]} />

      {/* 2. TailGrids Modern Hero Card Header (Vivid Emerald Gradient Standard) */}
      <div className="relative overflow-hidden rounded-[22px] border-2 border-emerald-500/30 bg-gradient-to-r from-emerald-500/15 via-teal-500/10 to-emerald-600/15 p-5 sm:p-6 shadow-md shadow-emerald-500/10 dark:border-emerald-600/40 dark:bg-gradient-to-r dark:from-emerald-950/70 dark:via-teal-950/50 dark:to-slate-900">
        {/* Ambient Glow Background Accent (Vibrant Dual Emerald-Teal Blobs) */}
        <div className="pointer-events-none absolute -top-20 -right-20 h-56 w-56 rounded-full bg-gradient-to-br from-emerald-500/40 via-teal-400/30 to-emerald-600/20 blur-3xl dark:from-emerald-500/50 dark:via-teal-400/40" />
        <div className="pointer-events-none absolute -bottom-20 -left-20 h-56 w-56 rounded-full bg-gradient-to-tr from-emerald-600/30 via-teal-500/20 to-transparent blur-3xl dark:from-emerald-600/40 dark:via-teal-500/30" />

        <div className="relative z-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          {/* Left Side: Icon Badge, Title, Role Tag & Description */}
          <div className="flex items-start gap-4 min-w-0">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700 text-white shadow-xl shadow-emerald-600/40 border border-emerald-300/40 dark:from-emerald-400 dark:via-emerald-500 dark:to-teal-600">
              <AppWindow className="h-6 w-6" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                  Pengaturan Tampilan & Identitas Sistem
                </h1>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-emerald-600 to-teal-600 px-3.5 py-1 text-xs font-extrabold text-white shadow-sm shadow-emerald-600/25 border border-emerald-300/40">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  Khusus Super Admin & Admin
                </span>
              </div>
              <p className="mt-1 text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300 max-w-2xl leading-relaxed">
                Kelola identitas sekolah, logo situs, tata letak header & sidebar, serta skema warna aplikasi secara terpusat.
              </p>
            </div>
          </div>

          {/* Right Side: Action Buttons */}
          <div className="flex items-center gap-2.5 shrink-0 self-end sm:self-center">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={reset}
              className="rounded-xl border border-slate-300/80 bg-white/80 px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 hover:text-slate-900 dark:border-slate-700 dark:bg-slate-800/80 dark:text-slate-200 dark:hover:bg-slate-700 shadow-2xs transition-all"
            >
              <RotateCcw className="h-4 w-4 text-slate-500 dark:text-slate-400" />
              <span>Reset</span>
            </Button>

            <Button
              type="submit"
              variant="primary"
              appearance="fill"
              size="sm"
              disabled={saving}
              pending={saving}
              className="rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-4 py-2 text-xs font-black text-white shadow-md shadow-emerald-600/30 hover:from-emerald-500 hover:to-teal-500 transition-all border border-emerald-400/40"
            >
              <Save className="h-4 w-4" />
              <span>{saving ? 'Menyimpan...' : 'Simpan Pengaturan'}</span>
            </Button>
          </div>
        </div>
      </div>

      {/* 3. TailGrids Modern Soft Pastel Squircle Tab Navigation & Content Container */}
      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        <section className="overflow-hidden rounded-[22px] border-2 border-emerald-500/25 bg-white shadow-md shadow-emerald-500/5 dark:border-emerald-600/35 dark:bg-[#1B2433]">
          {/* Navigation Tabs Bar */}
          <div className="border-b border-emerald-500/20 bg-gradient-to-r from-emerald-500/10 via-teal-500/5 to-transparent p-3 sm:p-4">
            <div className="flex items-center gap-2 overflow-x-auto rounded-2xl bg-slate-100/90 p-1.5 dark:bg-slate-900/70 border border-slate-200/80 dark:border-slate-800 backdrop-blur-xs">
              {tabs.map(({ id, label, icon: Icon }) => {
                const isActive = activeTab === id
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setActiveTab(id)}
                    className={`flex shrink-0 items-center gap-2.5 rounded-xl px-4 py-2.5 text-xs transition-all duration-200 ${
                      isActive
                        ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-black shadow-md shadow-emerald-600/25 scale-[1.01]'
                        : 'font-bold text-slate-600 hover:bg-white/80 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/80 dark:hover:text-white'
                    }`}
                  >
                    <div className={`flex h-6 w-6 items-center justify-center rounded-lg ${isActive ? 'bg-white/20 text-white' : 'bg-slate-200/70 text-slate-500 dark:bg-slate-800 dark:text-slate-400'}`}>
                      <Icon className="h-3.5 w-3.5" />
                    </div>
                    <span>{label}</span>
                  </button>
                )
              })}
            </div>
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
          <aside className="h-fit rounded-[22px] border-2 border-emerald-500/25 bg-white p-5 shadow-md shadow-emerald-500/5 dark:border-emerald-600/35 dark:bg-[#1B2433]">
            <h3 className="text-sm font-black text-slate-900 dark:text-white">Preview Tampilan Sidebar</h3>
            <p className="mb-4 mt-1 text-[11px] text-slate-500 dark:text-slate-400">Pratinjau otomatis mengikuti konfigurasi sidebar & header pilihan Anda.</p>
            <div style={previewStyle} className="overflow-hidden rounded-2xl border border-slate-200 bg-[var(--preview-body)] shadow-inner">
              <div className={`flex h-52 ${form.sidebar_position === 'right' ? 'flex-row-reverse' : ''}`}>
                <div className="w-24 p-2 text-slate-800 relative overflow-hidden border-r border-slate-200" style={{ background: form.sidebar_style === 'light' ? '#FFFFFF' : form.sidebar_style === 'gradient' ? `linear-gradient(180deg, #FFFFFF 0%, #F8FAFC 50%, #F1F5F9 100%)` : form.sidebar_color, color: '#334155' }}>
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

