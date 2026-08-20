import React, { useState, useEffect, useCallback } from 'react'
import {
  UserRound,
  Shield,
  KeyRound,
  Settings,
  Activity,
  Building2,
  Briefcase,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Camera,
  Edit3,
  CheckCircle2,
  Lock,
  Sun,
  Moon,
  LogOut,
  AlertCircle,
  RefreshCw,
  Award,
  Layers,
  Check,
  Eye,
  EyeOff,
} from 'lucide-react'
import { authService } from '../../services/authService'
import { useAuthStore } from '../../stores/authStore'
import { Button } from '../../components/ui/button'
import { Badge } from '../../components/ui/badge'
import { Skeleton } from '../../components/ui/skeleton'
import Swal from 'sweetalert2'

export function FoundationProfilePage() {
  const authUser = useAuthStore((state) => state.user)
  const setSession = useAuthStore((state) => state.setSession)
  const token = localStorage.getItem('school_erp_token')

  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [activeTab, setActiveTab] = useState('pribadi')

  // Edit Personal Information Form State
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [editForm, setEditForm] = useState({
    nama_panggilan: '',
    phone: '',
    email: '',
    alamat: '',
  })
  const [savingEdit, setSavingEdit] = useState(false)

  // Avatar Upload State
  const [avatarModalOpen, setAvatarModalOpen] = useState(false)
  const [selectedFile, setSelectedFile] = useState(null)
  const [previewUrl, setPreviewUrl] = useState(null)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)

  // Change Password Form State
  const [passwordForm, setPasswordForm] = useState({
    current_password: '',
    password: '',
    password_confirmation: '',
  })
  const [showCurrentPass, setShowCurrentPass] = useState(false)
  const [showNewPass, setShowNewPass] = useState(false)
  const [showConfirmPass, setShowConfirmPass] = useState(false)
  const [passwordError, setPasswordError] = useState('')
  const [changingPassword, setChangingPassword] = useState(false)

  // Preferences State
  const [preferences, setPreferences] = useState(() => {
    const saved = localStorage.getItem('user_preferences')
    return saved
      ? JSON.parse(saved)
      : {
          emailNotifications: true,
          appNotifications: true,
          language: 'id',
          dateFormat: 'DD/MM/YYYY',
        }
  })

  const fetchProfile = useCallback(async () => {
    setLoading(true)
    setError(false)
    try {
      const res = await authService.profile()
      const data = res?.data || res
      setProfile(data)
      if (data) {
        setEditForm({
          nama_panggilan: data.employee?.nama_panggilan || '',
          phone: data.phone || data.employee?.no_hp || '',
          email: data.email || '',
          alamat: data.employee?.alamat || '',
        })
      }
    } catch (err) {
      console.error('Gagal mengambil data profil:', err)
      setError(true)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchProfile()
  }, [fetchProfile])

  // Save Preferences
  const handlePreferenceChange = (key, value) => {
    const updated = { ...preferences, [key]: value }
    setPreferences(updated)
    localStorage.setItem('user_preferences', JSON.stringify(updated))
    Swal.fire({
      title: 'Tersimpan',
      text: 'Preferensi pengguna berhasil diperbarui.',
      icon: 'success',
      timer: 1500,
      showConfirmButton: false,
    })
  }

  // Handle Edit Submit
  const handleSaveProfile = async (e) => {
    e.preventDefault()
    setSavingEdit(true)
    try {
      const res = await authService.updateProfile(editForm)
      const updatedProfile = res?.data || res
      setProfile(updatedProfile)

      // Sync authStore user state
      if (authUser && token) {
        setSession({
          token,
          user: {
            ...authUser,
            name: updatedProfile.name,
            email: updatedProfile.email,
            phone: updatedProfile.phone,
          },
        })
      }

      setEditModalOpen(false)
      Swal.fire('Berhasil!', 'Profil berhasil diperbarui.', 'success')
    } catch (err) {
      console.error('Gagal update profil:', err)
      const message = err.response?.data?.message || 'Terjadi kesalahan saat menyimpan profil.'
      Swal.fire('Gagal Menyimpan', message, 'error')
    } finally {
      setSavingEdit(false)
    }
  }

  // Handle Avatar Selection
  const handleFileSelect = (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 2 * 1024 * 1024) {
      Swal.fire('Ukuran File Terlalu Besar', 'Maksimal ukuran foto adalah 2MB.', 'warning')
      return
    }

    setSelectedFile(file)
    setPreviewUrl(URL.createObjectURL(file))
  }

  // Handle Avatar Upload Submit
  const handleUploadAvatar = async () => {
    if (!selectedFile) return
    setUploadingAvatar(true)

    const formData = new FormData()
    formData.append('foto', selectedFile)

    try {
      const res = await authService.uploadAvatar(formData)
      const updatedProfile = res?.data || res
      setProfile(updatedProfile)

      // Sync authStore user state
      if (authUser && token) {
        setSession({
          token,
          user: {
            ...authUser,
            avatar: updatedProfile.foto,
          },
        })
      }

      setAvatarModalOpen(false)
      setSelectedFile(null)
      setPreviewUrl(null)
      Swal.fire('Berhasil!', 'Foto profil berhasil diperbarui.', 'success')
    } catch (err) {
      console.error('Gagal upload avatar:', err)
      const message = err.response?.data?.message || 'Gagal mengunggah foto profil.'
      Swal.fire('Gagal Upload', message, 'error')
    } finally {
      setUploadingAvatar(false)
    }
  }

  // Handle Password Change Submit
  const handleChangePassword = async (e) => {
    e.preventDefault()
    setPasswordError('')

    if (passwordForm.password !== passwordForm.password_confirmation) {
      setPasswordError('Konfirmasi password baru tidak cocok.')
      return
    }

    if (passwordForm.password.length < 8) {
      setPasswordError('Password baru minimal 8 karakter.')
      return
    }

    setChangingPassword(true)
    try {
      await authService.changePassword({
        current_password: passwordForm.current_password,
        password: passwordForm.password,
        password_confirmation: passwordForm.password_confirmation,
      })

      setPasswordForm({
        current_password: '',
        password: '',
        password_confirmation: '',
      })

      Swal.fire('Password Diubah!', 'Password Anda berhasil diperbarui. Gunakan password baru untuk login berikutnya.', 'success')
    } catch (err) {
      console.error('Gagal ganti password:', err)
      const msg = err.response?.data?.message || 'Gagal mengubah password. Pastikan password saat ini benar.'
      setPasswordError(msg)
    } finally {
      setChangingPassword(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6 p-6">
        <Skeleton className="h-48 w-full rounded-2xl" />
        <Skeleton className="h-12 w-full rounded-xl" />
        <Skeleton className="h-64 w-full rounded-2xl" />
      </div>
    )
  }

  if (error || !profile) {
    return (
      <div className="bg-white dark:bg-[#13221f] p-12 rounded-2xl border border-slate-200/80 dark:border-slate-800 text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-rose-500 mx-auto" />
        <h3 className="text-lg font-bold text-slate-800 dark:text-white">Profil Gagal Dimuat</h3>
        <p className="text-xs text-slate-500 max-w-md mx-auto">
          Data profil pengguna tidak dapat diambil dari server. Silakan pastikan koneksi internet Anda stabil.
        </p>
        <Button onClick={fetchProfile} className="bg-[#0E5C44] text-white">
          <RefreshCw className="w-4 h-4 mr-2" /> Coba Lagi
        </Button>
      </div>
    )
  }

  const employee = profile.employee
  const namaLengkap = employee?.nama_lengkap || profile.name || 'Pengurus Yayasan'
  const niyNip = employee?.niy || employee?.nik || 'YYS-001'
  const jabatanName = employee?.position?.name || 'Pengurus Yayasan'
  const unitName = employee?.unit?.name || 'Yayasan Dar el-Iman'
  const divisionName = employee?.division?.name || 'Sekretariat Yayasan'
  const userRoles = profile.roles || ['Pengurus Yayasan']

  return (
    <div className="space-y-6 animate-fade-in pb-16">
      {/* 1. Header Profil Banner */}
      <div className="relative rounded-2xl bg-white dark:bg-[#13221f] border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden">
        {/* Background Gradient Decorative Strip */}
        <div className="h-28 bg-gradient-to-r from-[#0E5C44] via-[#1E8E5A] to-[#3FBF75] relative">
          <div className="absolute inset-0 bg-black/10" />
          <div className="absolute right-6 top-4 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-white text-xs font-bold">
            <Award className="w-3.5 h-3.5 text-amber-300" />
            <span>Pengurus Yayasan</span>
          </div>
        </div>

        {/* Profile Identity Bar */}
        <div className="px-6 pb-6 pt-0 flex flex-col md:flex-row items-start md:items-end justify-between gap-4 -mt-12 relative z-10">
          <div className="flex flex-col sm:flex-row items-center sm:items-end gap-5 text-center sm:text-left">
            {/* Avatar Image with Edit Overlay */}
            <div className="relative group">
              <div className="w-24 h-24 rounded-2xl bg-white dark:bg-slate-800 p-1.5 shadow-xl border-2 border-white dark:border-slate-700">
                {profile.foto ? (
                  <img
                    src={profile.foto}
                    alt={namaLengkap}
                    className="w-full h-full object-cover rounded-xl"
                  />
                ) : (
                  <div className="w-full h-full rounded-xl bg-[#0E5C44] text-white font-black text-2xl flex items-center justify-center">
                    {namaLengkap.charAt(0)}
                  </div>
                )}
              </div>
              <button
                type="button"
                onClick={() => setAvatarModalOpen(true)}
                className="absolute bottom-1 right-1 p-2 rounded-xl bg-amber-400 text-slate-950 shadow-lg hover:bg-amber-300 transition"
                title="Ubah Foto Profil"
              >
                <Camera className="w-4 h-4" />
              </button>
            </div>

            {/* Name & Identity */}
            <div className="space-y-1">
              <div className="flex items-center justify-center sm:justify-start gap-2 flex-wrap">
                <h2 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                  {namaLengkap}
                </h2>
                <Badge variant="success" className="bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-extrabold text-[10px]">
                  Aktif
                </Badge>
              </div>

              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                NIY/NIP: <span className="text-slate-700 dark:text-slate-200 font-bold">{niyNip}</span> • {jabatanName}
              </p>

              <div className="flex items-center justify-center sm:justify-start gap-2 text-xs text-slate-600 dark:text-slate-300 pt-0.5">
                <Building2 className="w-3.5 h-3.5 text-[#0E5C44] dark:text-emerald-400 shrink-0" />
                <span>{unitName}</span>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-2 self-stretch sm:self-auto justify-end">
            <Button
              onClick={() => setEditModalOpen(true)}
              className="bg-[#0E5C44] text-white hover:bg-[#0A4331] font-bold text-xs"
            >
              <Edit3 className="w-3.5 h-3.5 mr-1.5" />
              Edit Profil
            </Button>
          </div>
        </div>
      </div>

      {/* 2. Tabs Bar */}
      <div className="bg-white dark:bg-[#13221f] p-2 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center gap-1.5 overflow-x-auto scrollbar-none">
        <button
          onClick={() => setActiveTab('pribadi')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === 'pribadi'
              ? 'bg-[#0E5C44] text-white shadow-md shadow-emerald-900/20'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <UserRound className="w-4 h-4" />
          <span>Informasi Pribadi</span>
        </button>

        <button
          onClick={() => setActiveTab('jabatan')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === 'jabatan'
              ? 'bg-[#0E5C44] text-white shadow-md shadow-emerald-900/20'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Briefcase className="w-4 h-4" />
          <span>Informasi Jabatan</span>
        </button>

        <button
          onClick={() => setActiveTab('keamanan')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === 'keamanan'
              ? 'bg-[#0E5C44] text-white shadow-md shadow-emerald-900/20'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Shield className="w-4 h-4" />
          <span>Keamanan Akun</span>
        </button>

        <button
          onClick={() => setActiveTab('preferensi')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === 'preferensi'
              ? 'bg-[#0E5C44] text-white shadow-md shadow-emerald-900/20'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Settings className="w-4 h-4" />
          <span>Preferensi</span>
        </button>

        <button
          onClick={() => setActiveTab('aktivitas')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === 'aktivitas'
              ? 'bg-[#0E5C44] text-white shadow-md shadow-emerald-900/20'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Activity className="w-4 h-4" />
          <span>Aktivitas Akun</span>
        </button>
      </div>

      {/* 3. Tab Content */}
      <div className="bg-white dark:bg-[#13221f] p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
        {/* Tab 1: Informasi Pribadi */}
        {activeTab === 'pribadi' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div>
                <h3 className="text-base font-black text-slate-800 dark:text-white">Data Diri & Kontak</h3>
                <p className="text-xs text-slate-500 mt-0.5">Informasi identitas pribadi akun Pengurus Yayasan Anda.</p>
              </div>
              <Button onClick={() => setEditModalOpen(true)} variant="outline" className="text-xs font-bold">
                <Edit3 className="w-3.5 h-3.5 mr-1.5" /> Ubah Data Kontak
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 space-y-1">
                <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Nama Resmi (Sesuai SK)</span>
                <p className="font-extrabold text-slate-900 dark:text-white text-sm">{namaLengkap}</p>
                <span className="text-[10px] text-amber-600 dark:text-amber-400 font-semibold block pt-1">
                  * Dikelola langsung oleh Admin Kepegawaian (Read-only)
                </span>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 space-y-1">
                <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Nama Panggilan</span>
                <p className="font-extrabold text-slate-900 dark:text-white text-sm">{employee?.nama_panggilan || '-'}</p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 space-y-1">
                <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">NIY / NIP</span>
                <p className="font-extrabold text-slate-900 dark:text-white text-sm">{employee?.niy || '-'}</p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 space-y-1">
                <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">NIK (No. KTP)</span>
                <p className="font-extrabold text-slate-900 dark:text-white text-sm">{employee?.nik || '-'}</p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 space-y-1">
                <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Jenis Kelamin</span>
                <p className="font-extrabold text-slate-900 dark:text-white text-sm">
                  {employee?.jenis_kelamin === 'L' ? 'Laki-laki' : employee?.jenis_kelamin === 'P' ? 'Perempuan' : '-'}
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 space-y-1">
                <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Tempat & Tanggal Lahir</span>
                <p className="font-extrabold text-slate-900 dark:text-white text-sm">
                  {employee?.tempat_lahir || '-'}, {employee?.tanggal_lahir || '-'}
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 space-y-1">
                <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Nomor HP / Whatsapp</span>
                <p className="font-extrabold text-slate-900 dark:text-white text-sm flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-emerald-600" />
                  {profile.phone || employee?.no_hp || '-'}
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 space-y-1">
                <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Alamat Email</span>
                <p className="font-extrabold text-slate-900 dark:text-white text-sm flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-blue-600" />
                  {profile.email}
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 space-y-1 md:col-span-2">
                <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Alamat Tempat Tinggal</span>
                <p className="font-extrabold text-slate-900 dark:text-white text-sm flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                  {employee?.alamat || 'Belum diisi'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Informasi Jabatan */}
        {activeTab === 'jabatan' && (
          <div className="space-y-6">
            <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
              <h3 className="text-base font-black text-slate-800 dark:text-white">Jabatan & Wewenang Sistem</h3>
              <p className="text-xs text-slate-500 mt-0.5">Struktur organisasi dan hak akses Pengurus Yayasan.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 space-y-1">
                <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Unit Kerja / Institusi</span>
                <p className="font-extrabold text-slate-900 dark:text-white text-sm">{unitName}</p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 space-y-1">
                <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Jabatan Organisasi</span>
                <p className="font-extrabold text-slate-900 dark:text-white text-sm">{jabatanName}</p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 space-y-1">
                <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Divisi / Departemen</span>
                <p className="font-extrabold text-slate-900 dark:text-white text-sm">{divisionName}</p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 space-y-1">
                <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Role Hak Akses Sistem</span>
                <div className="flex items-center gap-1.5 flex-wrap pt-1">
                  {userRoles.map((r) => (
                    <Badge key={r} variant="success" className="bg-[#0E5C44] text-white font-extrabold text-[10px]">
                      {r}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 space-y-1">
                <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Status Kepegawaian</span>
                <p className="font-extrabold text-slate-900 dark:text-white text-sm">{employee?.status_pegawai || 'Tetap'}</p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 space-y-1">
                <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Mulai Bertugas</span>
                <p className="font-extrabold text-slate-900 dark:text-white text-sm">{employee?.tanggal_masuk || '-'}</p>
              </div>
            </div>

            {/* Permission List Ringkas */}
            <div className="pt-4 space-y-3">
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-400">Ringkasan Izin Akses Yayasan</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                {[
                  'Monitoring Unit Pendidikan',
                  'Pemantauan SDM & Pegawai',
                  'Monitoring Data Siswa & Mutasi',
                  'Laporan Kelulusan & Alumni',
                  'Laporan Lintas Unit',
                  'Notifikasi & Komunikasi',
                ].map((perm) => (
                  <div key={perm} className="flex items-center gap-2 p-2.5 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900/50 text-emerald-900 dark:text-emerald-300 text-xs font-semibold">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{perm}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Keamanan Akun */}
        {activeTab === 'keamanan' && (
          <div className="space-y-6 max-w-2xl">
            <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
              <h3 className="text-base font-black text-slate-800 dark:text-white">Keamanan & Ubah Password</h3>
              <p className="text-xs text-slate-500 mt-0.5">Perbarui kata sandi secara berkala untuk perlindungan akun.</p>
            </div>

            {passwordError && (
              <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 text-rose-700 dark:text-rose-300 text-xs font-semibold flex items-center gap-3">
                <AlertCircle className="w-5 h-5 shrink-0" />
                <span>{passwordError}</span>
              </div>
            )}

            <form onSubmit={handleChangePassword} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 dark:text-slate-300">Password Saat Ini</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type={showCurrentPass ? 'text' : 'password'}
                    required
                    placeholder="Masukkan password saat ini"
                    value={passwordForm.current_password}
                    onChange={(e) => setPasswordForm({ ...passwordForm, current_password: e.target.value })}
                    className="w-full pl-10 pr-10 py-2.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-[#0E5C44]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPass(!showCurrentPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                    title={showCurrentPass ? 'Sembunyikan password' : 'Tampilkan password'}
                  >
                    {showCurrentPass ? <EyeOff className="w-4 h-4 text-emerald-600" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 dark:text-slate-300">Password Baru</label>
                <div className="relative">
                  <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type={showNewPass ? 'text' : 'password'}
                    required
                    minLength={8}
                    placeholder="Minimal 8 karakter"
                    value={passwordForm.password}
                    onChange={(e) => setPasswordForm({ ...passwordForm, password: e.target.value })}
                    className="w-full pl-10 pr-10 py-2.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-[#0E5C44]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPass(!showNewPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                    title={showNewPass ? 'Sembunyikan password' : 'Tampilkan password'}
                  >
                    {showNewPass ? <EyeOff className="w-4 h-4 text-emerald-600" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 dark:text-slate-300">Konfirmasi Password Baru</label>
                <div className="relative">
                  <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type={showConfirmPass ? 'text' : 'password'}
                    required
                    placeholder="Ulangi password baru"
                    value={passwordForm.password_confirmation}
                    onChange={(e) => setPasswordForm({ ...passwordForm, password_confirmation: e.target.value })}
                    className="w-full pl-10 pr-10 py-2.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-[#0E5C44]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPass(!showConfirmPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                    title={showConfirmPass ? 'Sembunyikan password' : 'Tampilkan password'}
                  >
                    {showConfirmPass ? <EyeOff className="w-4 h-4 text-emerald-600" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="pt-2">
                <Button
                  type="submit"
                  disabled={changingPassword}
                  className="bg-[#0E5C44] text-white hover:bg-[#0A4331] font-bold"
                >
                  {changingPassword ? 'Menyimpan...' : 'Perbarui Password'}
                </Button>
              </div>
            </form>
          </div>
        )}

        {/* Tab 4: Preferensi */}
        {activeTab === 'preferensi' && (
          <div className="space-y-6 max-w-2xl">
            <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
              <h3 className="text-base font-black text-slate-800 dark:text-white">Preferensi Pengguna</h3>
              <p className="text-xs text-slate-500 mt-0.5">Pengaturan pemberitahuan dan tampilan antarmuka.</p>
            </div>

            <div className="space-y-4 text-xs">
              <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                <div>
                  <h4 className="font-bold text-slate-800 dark:text-white">Notifikasi Email</h4>
                  <p className="text-[11px] text-slate-500">Terima rangkuman laporan bulanan melalui email.</p>
                </div>
                <input
                  type="checkbox"
                  checked={preferences.emailNotifications}
                  onChange={(e) => handlePreferenceChange('emailNotifications', e.target.checked)}
                  className="w-4 h-4 accent-[#0E5C44] rounded cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                <div>
                  <h4 className="font-bold text-slate-800 dark:text-white">Notifikasi Aplikasi</h4>
                  <p className="text-[11px] text-slate-500">Tampilkan notifikasi pop-up saat ada data mutasi/laporan baru.</p>
                </div>
                <input
                  type="checkbox"
                  checked={preferences.appNotifications}
                  onChange={(e) => handlePreferenceChange('appNotifications', e.target.checked)}
                  className="w-4 h-4 accent-[#0E5C44] rounded cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                <div>
                  <h4 className="font-bold text-slate-800 dark:text-white">Bahasa Antarmuka</h4>
                  <p className="text-[11px] text-slate-500">Pilihan bahasa tampilan SIMSIT.</p>
                </div>
                <select
                  value={preferences.language}
                  onChange={(e) => handlePreferenceChange('language', e.target.value)}
                  className="px-3 py-1.5 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-xs font-semibold"
                >
                  <option value="id">Bahasa Indonesia</option>
                  <option value="en">English</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Tab 5: Aktivitas Akun */}
        {activeTab === 'aktivitas' && (
          <div className="space-y-6">
            <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
              <h3 className="text-base font-black text-slate-800 dark:text-white">Log Aktivitas & Sesi Login</h3>
              <p className="text-xs text-slate-500 mt-0.5">Riwayat login akun Pengurus Yayasan.</p>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/50 dark:bg-emerald-950/30 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-900/60 text-[#0E5C44] dark:text-emerald-400 flex items-center justify-center font-bold">
                    <Activity className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white">Sesi Login Saat Ini (Aktif)</h4>
                    <p className="text-[11px] text-slate-500">Web Dashboard • Browser Chrome / Safari</p>
                  </div>
                </div>
                <Badge variant="success" className="bg-emerald-600 text-white font-bold text-[10px]">
                  Aktif Sekarang
                </Badge>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* MODAL EDIT PROFIL */}
      {editModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white dark:bg-[#13221f] w-full max-w-lg rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <h3 className="text-base font-black text-slate-900 dark:text-white">Edit Informasi Pribadi</h3>
              <button
                type="button"
                onClick={() => setEditModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="p-6 space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-300">Nama Panggilan</label>
                <input
                  type="text"
                  placeholder="Contoh: Pak H. Ahmad"
                  value={editForm.nama_panggilan}
                  onChange={(e) => setEditForm({ ...editForm, nama_panggilan: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-[#0E5C44]"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-300">Nomor HP / Whatsapp</label>
                <input
                  type="text"
                  required
                  placeholder="08xxxxxxxxxx"
                  value={editForm.phone}
                  onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-[#0E5C44]"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-300">Alamat Email</label>
                <input
                  type="email"
                  required
                  placeholder="email@domain.com"
                  value={editForm.email}
                  onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-[#0E5C44]"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-300">Alamat Lengkap</label>
                <textarea
                  rows={3}
                  placeholder="Alamat domisili..."
                  value={editForm.alamat}
                  onChange={(e) => setEditForm({ ...editForm, alamat: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-[#0E5C44]"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100 dark:border-slate-800">
                <Button type="button" variant="outline" onClick={() => setEditModalOpen(false)}>
                  Batal
                </Button>
                <Button type="submit" disabled={savingEdit} className="bg-[#0E5C44] text-white font-bold">
                  {savingEdit ? 'Menyimpan...' : 'Simpan Perubahan'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL UBAH FOTO PROFIL */}
      {avatarModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white dark:bg-[#13221f] w-full max-w-md rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <h3 className="text-base font-black text-slate-900 dark:text-white">Ubah Foto Profil</h3>
              <button
                type="button"
                onClick={() => {
                  setAvatarModalOpen(false)
                  setSelectedFile(null)
                  setPreviewUrl(null)
                }}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs text-center">
              <div className="w-32 h-32 mx-auto rounded-2xl bg-slate-100 dark:bg-slate-800 border-2 border-dashed border-slate-300 dark:border-slate-700 overflow-hidden flex items-center justify-center relative">
                {previewUrl ? (
                  <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                ) : profile.foto ? (
                  <img src={profile.foto} alt="Current" className="w-full h-full object-cover" />
                ) : (
                  <Camera className="w-8 h-8 text-slate-400" />
                )}
              </div>

              <input
                type="file"
                accept="image/jpeg,image/png,image/jpg,image/webp"
                onChange={handleFileSelect}
                className="hidden"
                id="avatar-input"
              />

              <label
                htmlFor="avatar-input"
                className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold rounded-xl cursor-pointer hover:bg-slate-200 transition"
              >
                <Camera className="w-4 h-4" />
                Pilih File Foto
              </label>
              <p className="text-[10px] text-slate-400">Format: JPG, JPEG, PNG, WebP. Ukuran maks 2MB.</p>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100 dark:border-slate-800">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setAvatarModalOpen(false)
                    setSelectedFile(null)
                    setPreviewUrl(null)
                  }}
                >
                  Batal
                </Button>
                <Button
                  type="button"
                  disabled={!selectedFile || uploadingAvatar}
                  onClick={handleUploadAvatar}
                  className="bg-[#0E5C44] text-white font-bold"
                >
                  {uploadingAvatar ? 'Mengunggah...' : 'Unggah & Simpan'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
