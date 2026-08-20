import { useRef, useState, useEffect } from 'react'
import { FiCamera, FiCheck } from 'react-icons/fi'
import Swal from 'sweetalert2'
import PersonAvatar from '../ui/PersonAvatar'
import { useAuthStore } from '../../stores/authStore'
import { authService } from '../../services/authService'
import { educationUnitService } from '../../services/educationUnitService'

export default function UserProfileCard() {
  const { user, setSession, token, loginTime } = useAuthStore()
  const fileInputRef = useRef(null)
  const [unitOptions, setUnitOptions] = useState([])
  const [saving, setSaving] = useState(false)
  const userRoles = Array.isArray(user?.roles) ? user.roles : [user?.role || user?.roles].filter(Boolean)
  const ALLOWED_ADMIN_ROLES = [
    'super admin', 'superadmin', 'super_admin',
    'admin',
    'pengurus yayasan', 'yayasan', 'ketua yayasan', 'ketua_yayasan', 'sekretaris_yayasan', 'bendahara_yayasan', 'pengurus_yayasan',
    'kepala sekolah', 'kepala_sekolah', 'kepsek',
    'divisi pendidikan', 'divisi_pendidikan'
  ]
  const canEditUnitAndRole = userRoles.some((r) => ALLOWED_ADMIN_ROLES.includes(String(r).toLowerCase()))

  const formattedLoginTime = loginTime
    ? new Date(loginTime).toLocaleString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }) + ' WIB'
    : 'Sesi Aktif'

  const [profile, setProfile] = useState({
    fullName: user?.name || user?.fullName || '',
    nip: user?.nip || user?.employee?.niy || user?.employee?.nik || '',
    email: user?.email || '',
    phone: user?.phone || user?.employee?.no_hp || '',
    role: user?.role || user?.roles?.[0] || '',
    unit: user?.unit || user?.employee?.unit?.name || '',
    avatar: user?.avatar || user?.foto || user?.employee?.foto || null,
  })
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    educationUnitService.getDaftar().then((res) => {
      const data = res?.data?.data || res?.data || []
      if (Array.isArray(data)) setUnitOptions(data)
    }).catch(() => {})

    authService.profile().then((res) => {
      const data = res?.data || res
      if (data) {
        setProfile({
          fullName: data.fullName || data.name || data.employee?.nama_lengkap || '',
          nip: data.employee?.niy || data.employee?.nik || data.nip || '',
          email: data.email || '',
          phone: data.phone || data.employee?.no_hp || '',
          role: Array.isArray(data.roles) && data.roles.length > 0 ? data.roles[0] : (data.role || data.employee?.position?.name || ''),
          unit: data.unit || data.employee?.unit?.name || '',
          avatar: data.foto || data.avatar || data.employee?.foto || null,
        })
        if (token) {
          setSession({
            token,
            user: {
              ...user,
              name: data.fullName || data.name || data.employee?.nama_lengkap,
              fullName: data.fullName || data.name || data.employee?.nama_lengkap,
              email: data.email,
              phone: data.phone || data.employee?.no_hp,
              avatar: data.foto || data.avatar || data.employee?.foto,
              unit: data.unit || data.employee?.unit?.name,
            },
          })
        }
      }
    }).catch((err) => {
      console.warn('Gagal memuat profil backend:', err)
    })
  }, [])

  const handlePhotoClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 2 * 1024 * 1024) {
      Swal.fire('Ukuran File Terlalu Besar', 'Ukuran foto maksimal adalah 2MB.', 'warning')
      e.target.value = ''
      return
    }

    const formData = new FormData()
    formData.append('foto', file)
    formData.append('avatar', file)

    try {
      const response = await authService.uploadAvatar(formData)
      const avatarUrl = response?.data?.foto || response?.data?.avatar || response?.foto || response?.avatar
      setProfile((prev) => ({ ...prev, avatar: avatarUrl }))

      if (token) {
        setSession({
          token,
          user: {
            ...user,
            avatar: avatarUrl,
            foto: avatarUrl,
          },
        })
      }
      Swal.fire({
        icon: 'success',
        title: 'Foto Profil Diperbarui',
        text: 'Foto profil Anda telah disimpan ke server database.',
        timer: 1500,
        showConfirmButton: false,
      })
    } catch (error) {
      console.error('Gagal upload avatar:', error)
      const msg = error?.response?.data?.message || 'Gagal mengunggah foto profil ke server.'
      Swal.fire('Gagal Upload', msg, 'error')
    } finally {
      if (e.target) e.target.value = ''
    }
  }

  const handleReset = () => {
    setProfile({
      fullName: user?.name || user?.fullName || '',
      nip: user?.nip || user?.employee?.niy || user?.employee?.nik || '',
      email: user?.email || '',
      phone: user?.phone || user?.employee?.no_hp || '',
      role: user?.role || user?.roles?.[0] || '',
      unit: user?.unit || user?.employee?.unit?.name || '',
      avatar: user?.avatar || user?.foto || user?.employee?.foto || null,
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)

    try {
      let uploadedAvatar = profile.avatar
      if (profile.avatar && typeof profile.avatar === 'string' && profile.avatar.startsWith('data:')) {
        const avatarBase64 = profile.avatar.split(',')[1]
        const blob = await fetch(`data:image/png;base64,${avatarBase64}`).then(res => res.blob())
        const formData = new FormData()
        formData.append('foto', blob, 'avatar.jpg')

        const avatarRes = await authService.uploadAvatar(formData)
        uploadedAvatar = avatarRes?.data?.foto || avatarRes?.data?.avatar || avatarRes?.foto || uploadedAvatar
        setProfile((prev) => ({ ...prev, avatar: uploadedAvatar }))
      }

      const updatePayload = {
        name: profile.fullName,
        fullName: profile.fullName,
        email: profile.email,
        phone: profile.phone,
        unit: profile.unit,
      }

      const response = await authService.updateProfile(updatePayload)
      const updatedData = response?.data || response

      const updatedUser = {
        ...user,
        name: updatedData?.name || profile.fullName,
        fullName: updatedData?.fullName || updatedData?.name || profile.fullName,
        email: updatedData?.email || profile.email,
        phone: updatedData?.phone || profile.phone,
        role: profile.role || user?.role,
        unit: updatedData?.unit || profile.unit,
        avatar: updatedData?.foto || updatedData?.avatar || uploadedAvatar || profile.avatar,
      }

      setSession({ token, user: updatedUser })

      setSaved(true)
      Swal.fire({
        icon: 'success',
        title: 'Profil Berhasil Diperbarui',
        text: 'Data profil dan informasi akun Anda telah disimpan permanen di database.',
        timer: 2000,
        showConfirmButton: false,
      })
      setTimeout(() => setSaved(false), 2500)
    } catch (error) {
      console.error('Update profile error:', error)
      const msg = error.response?.data?.message || 'Gagal menyimpan perubahan profil ke server.'
      Swal.fire('Gagal Menyimpan', msg, 'error')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="w-full bg-white rounded-2xl shadow-sm border border-slate-200/80 p-6 lg:p-8">
      {/* Hidden File Input for Avatar Upload */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/png, image/jpeg, image/jpg"
        className="hidden"
      />

      {/* Breadcrumb */}
      <div className="flex items-center text-xs text-slate-400 mb-6 gap-2 border-b border-slate-100 pb-3">
        <span>Dashboard</span>
        <span>/</span>
        <span className="text-emerald-700 font-semibold">Profil</span>
      </div>

      {saved && (
        <div className="mb-6 bg-emerald-50 border border-emerald-200 rounded-xl p-3.5 text-emerald-800 text-xs font-semibold flex items-center gap-2">
          <FiCheck className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Perubahan profil berhasil disimpan!</span>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Avatar Card */}
          <div className="lg:col-span-4 bg-slate-50/70 p-6 rounded-2xl border border-slate-200/80 flex flex-col items-center text-center">
            <div className="relative mb-4">
              <PersonAvatar src={profile.avatar} name={profile.fullName} size="profile" className="ring-4 ring-emerald-600/20" />
              <button
                type="button"
                onClick={handlePhotoClick}
                className="absolute bottom-0 right-0 p-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-full shadow-md border-2 border-white transition-colors"
                title="Ganti Foto Profil"
              >
                <FiCamera className="w-3.5 h-3.5" />
              </button>
            </div>

            <h3 className="text-base font-bold text-slate-800">{profile.fullName}</h3>
            <span className="inline-block px-3 py-1 bg-emerald-100 text-emerald-800 text-xs font-semibold rounded-full mt-1">
              {profile.role}
            </span>

            {/* Session Info Badge */}
            <div className="mt-3 w-full bg-white p-2.5 rounded-xl border border-emerald-100 shadow-xs text-[11px] text-slate-600 text-left space-y-1 font-mono">
              <div className="flex items-center justify-between text-emerald-900 font-semibold border-b border-slate-100 pb-1">
                <span>Waktu Login:</span>
                <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded font-sans">Browser Sesi</span>
              </div>
              <p className="text-slate-800 font-medium">{formattedLoginTime}</p>
              <p className="text-[10px] text-slate-400 font-sans mt-0.5">Batas inaktivitas: 15 menit</p>
            </div>

            <div className="mt-4 w-full pt-4 border-t border-slate-200/60 space-y-2">
              <button
                type="button"
                onClick={handlePhotoClick}
                className="w-full py-2 px-3 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 font-semibold text-xs rounded-xl transition-all shadow-sm flex items-center justify-center gap-2"
              >
                <FiCamera className="w-3.5 h-3.5 text-slate-500" />
                <span>Ubah Foto</span>
              </button>
              <p className="text-[10px] text-slate-400">Maks. 2MB (JPG, PNG)</p>
            </div>
          </div>

          {/* Right Form Fields */}
          <div className="lg:col-span-8 space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Nama Lengkap */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Nama Lengkap
                </label>
                <input
                  type="text"
                  value={profile.fullName}
                  onChange={(e) => setProfile({ ...profile, fullName: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-white text-slate-800 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent transition-all shadow-sm"
                  required
                />
              </div>

              {/* NIP / ID User */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  NIP / ID User
                </label>
                <input
                  type="text"
                  value={profile.nip}
                  onChange={(e) => setProfile({ ...profile, nip: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-100 text-slate-600 text-sm rounded-xl border border-slate-200 cursor-not-allowed"
                  disabled
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Email
                </label>
                <input
                  type="email"
                  value={profile.email}
                  onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-white text-slate-800 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent transition-all shadow-sm"
                  required
                />
              </div>

              {/* No Handphone */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  No. Handphone
                </label>
                <input
                  type="text"
                  value={profile.phone}
                  onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-white text-slate-800 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent transition-all shadow-sm"
                  required
                />
              </div>

              {/* Role / Jabatan */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center justify-between">
                  <span>Role / Jabatan</span>
                  {!canEditUnitAndRole && (
                    <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                      Terkunci
                    </span>
                  )}
                </label>
                <select
                  value={profile.role}
                  onChange={(e) => setProfile({ ...profile, role: e.target.value })}
                  disabled={!canEditUnitAndRole}
                  className={`w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent transition-all shadow-sm ${
                    !canEditUnitAndRole ? 'bg-slate-100 text-slate-500 cursor-not-allowed border-slate-200/80' : 'bg-white text-slate-800'
                  }`}
                >
                  <option value={profile.role}>{profile.role || 'Pilih Role'}</option>
                  <option value="Super Admin">Super Admin</option>
                  <option value="Admin">Admin</option>
                  <option value="Pengurus Yayasan">Pengurus Yayasan</option>
                  <option value="Kepala Sekolah">Kepala Sekolah</option>
                  <option value="Divisi Pendidikan">Divisi Pendidikan</option>
                  <option value="Guru">Guru</option>
                  <option value="Tata Usaha">Tata Usaha</option>
                  <option value="Operator">Operator</option>
                  <option value="Musyrif">Musyrif</option>
                  <option value="Siswa">Siswa</option>
                  <option value="Orang Tua">Orang Tua</option>
                </select>
                {!canEditUnitAndRole && (
                  <p className="text-[11px] text-slate-400 mt-1 font-medium flex items-center gap-1">
                    <span>🔒</span>
                    <span>Hanya dapat diubah oleh Administrator / Kepala Sekolah.</span>
                  </p>
                )}
              </div>

              {/* Unit Pendidikan */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center justify-between">
                  <span>Unit Pendidikan</span>
                  {!canEditUnitAndRole && (
                    <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                      Terkunci
                    </span>
                  )}
                </label>
                <select
                  value={profile.unit}
                  onChange={(e) => setProfile({ ...profile, unit: e.target.value })}
                  disabled={!canEditUnitAndRole}
                  className={`w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent transition-all shadow-sm ${
                    !canEditUnitAndRole ? 'bg-slate-100 text-slate-500 cursor-not-allowed border-slate-200/80' : 'bg-white text-slate-800'
                  }`}
                >
                  <option value={profile.unit}>{profile.unit || 'Pilih Unit'}</option>
                  {unitOptions.map((u) => (
                    <option key={u.id || u.nama_unit} value={u.nama_unit || u.name}>
                      {u.nama_unit || u.name}
                    </option>
                  ))}
                </select>
                {!canEditUnitAndRole && (
                  <p className="text-[11px] text-slate-400 mt-1 font-medium flex items-center gap-1">
                    <span>🔒</span>
                    <span>Unit Pendidikan terikat pada penugasan akun Anda.</span>
                  </p>
                )}
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={handleReset}
                className="py-2.5 px-5 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 font-semibold text-xs rounded-xl transition-all"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={saving}
                className="py-2.5 px-6 bg-emerald-800 hover:bg-emerald-900 text-white font-semibold text-xs rounded-xl shadow-md shadow-emerald-800/20 hover:shadow-lg transition-all disabled:opacity-50"
              >
                {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}

