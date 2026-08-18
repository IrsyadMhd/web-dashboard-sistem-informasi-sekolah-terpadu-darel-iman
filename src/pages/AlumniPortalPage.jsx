import React, { useState, useEffect } from 'react'
import {
  GraduationCap,
  UserCheck,
  Building,
  Briefcase,
  Save,
  Megaphone,
  Calendar,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Mail,
  Phone,
  MapPin,
  School,
  FileBadge,
} from 'lucide-react'
import Swal from 'sweetalert2'

import {
  AppPageHeader,
  KpiCard,
  AppBadge,
  AppSkeleton,
  AppErrorState,
  PersonIdentityCell,
} from '../components/app'

import { alumniPortalService } from '../services/alumniPortalService'

export default function AlumniPortalPage() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [data, setData] = useState(null)
  const [saving, setSaving] = useState(false)

  const [formData, setFormData] = useState({
    address: '',
    phone: '',
    email: '',
    status_lanjutan: 'Kuliah',
    perguruan_tinggi: '',
    pekerjaan: '',
    instansi: '',
  })

  const fetchDashboard = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await alumniPortalService.getDashboard()
      if (res && res.data) {
        setData(res.data)
        const prof = res.data.profile || {}
        setFormData({
          address: prof.address || '',
          phone: prof.phone || '',
          email: prof.email || '',
          status_lanjutan: prof.status_lanjutan || 'Kuliah',
          perguruan_tinggi: prof.perguruan_tinggi || '',
          pekerjaan: prof.pekerjaan || '',
          instansi: prof.instansi || '',
        })
      } else {
        setError('Format respon server tidak valid.')
      }
    } catch (err) {
      console.error('Failed to load Alumni dashboard:', err)
      setError(err.response?.data?.message || 'Gagal memuat data portal Alumni.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDashboard()
  }, [])

  const handleSaveProfile = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      await alumniPortalService.updateProfile(formData)
      Swal.fire({
        icon: 'success',
        title: 'Berhasil',
        text: 'Data profil alumni berhasil diperbarui.',
        timer: 2000,
        showConfirmButton: false,
        customClass: {
          popup: 'rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-800 dark:bg-slate-900 dark:text-white',
        },
      })
      fetchDashboard()
    } catch (err) {
      console.error('Failed to update alumni profile:', err)
      Swal.fire({
        icon: 'error',
        title: 'Gagal',
        text: err.response?.data?.message || 'Gagal memperbarui profil alumni.',
        customClass: {
          popup: 'rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-800 dark:bg-slate-900 dark:text-white',
        },
      })
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <AppSkeleton count={4} />
  if (error) return <AppErrorState title="Gagal Memuat Portal Alumni" message={error} onRetry={fetchDashboard} />

  const profile = data?.profile || {}
  const kpis = data?.kpis || {}
  const announcements = data?.announcements || []

  return (
    <div className="space-y-6 pb-12">
      {/* Master Canonical Page Header */}
      <AppPageHeader
        variant="brand"
        icon={GraduationCap}
        eyebrow="Portal Alumni & Tracer Study"
        title={`Portal Alumni — ${profile.full_name || 'Alumni'}`}
        description={`Lulusan ${profile.education_unit || 'Sekolah'} — Tahun Lulus ${profile.tahun_lulus || '-'}`}
        chips={[
          `Status: ${profile.status_kelulusan || 'Lulus'}`,
          `Unit: ${profile.education_unit || 'Sekolah'}`,
        ]}
      />

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          title="Tahun Lulus"
          value={kpis.tahun_lulus || profile.tahun_lulus || '-'}
          icon={GraduationCap}
          tone="emerald"
          subtitle="Tahun kelulusan resmi"
        />
        <KpiCard
          title="Unit Asal Sekolah"
          value={kpis.unit_asal || profile.education_unit || '-'}
          icon={Building}
          tone="blue"
          subtitle="Unit pendidikan kelulusan"
        />
        <KpiCard
          title="Status Profil Kontak"
          value={kpis.status_profil || 'Terverifikasi'}
          icon={UserCheck}
          tone="green"
          subtitle="Status penelusuran alumni"
        />
        <KpiCard
          title="Aktivitas Saat Ini"
          value={kpis.status_lanjutan || profile.status_lanjutan || 'Kuliah'}
          icon={Briefcase}
          tone="violet"
          subtitle="Status studi / karir alumni"
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Left Column: Read-Only Academic Info + Editable Form */}
        <div className="space-y-6 lg:col-span-8">
          {/* Read-Only Official Academic Record */}
          <div className="rounded-[18px] border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-[#1B2433]">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#0E5C44] flex items-center justify-center dark:bg-emerald-950/60 dark:text-[#3FBF75]">
                <FileBadge className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Data Resmi Kelulusan (Read-Only)
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Identitas akademik resmi yang diterbitkan oleh sistem sekolah.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 dark:bg-slate-800/60 dark:border-slate-800">
                <span className="text-slate-400 dark:text-slate-500 block mb-1 font-medium">Nama Lengkap</span>
                <span className="font-bold text-slate-900 dark:text-white text-sm">{profile.full_name || '-'}</span>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 dark:bg-slate-800/60 dark:border-slate-800">
                <span className="text-slate-400 dark:text-slate-500 block mb-1 font-medium">NIS / NISN</span>
                <span className="font-bold text-slate-900 dark:text-white text-sm">{profile.nis || '-'} / {profile.nisn || '-'}</span>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 dark:bg-slate-800/60 dark:border-slate-800">
                <span className="text-slate-400 dark:text-slate-500 block mb-1 font-medium">Tahun Lulus</span>
                <span className="font-bold text-slate-900 dark:text-white text-sm">{profile.tahun_lulus || '-'}</span>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 dark:bg-slate-800/60 dark:border-slate-800">
                <span className="text-slate-400 dark:text-slate-500 block mb-1 font-medium">Status Kelulusan</span>
                <span className="inline-flex items-center gap-1 font-bold text-emerald-700 dark:text-[#3FBF75] text-sm">
                  <CheckCircle2 className="w-4 h-4" />
                  {profile.status_kelulusan || 'Lulus'}
                </span>
              </div>
            </div>
          </div>

          {/* Editable Form for Alumni Contact & Tracer Info */}
          <form onSubmit={handleSaveProfile} className="space-y-5 rounded-[18px] border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-[#1B2433]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center dark:bg-blue-950/60 dark:text-blue-400">
                <Briefcase className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Perbarui Informasi Kontak & Karir Alumni
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Perbarui domisili, kontak, perguruan tinggi, atau tempat kerja Anda untuk tracer alumni.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-slate-400" /> No. HP / WhatsApp
                </label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full h-10.5 rounded-xl border border-slate-200/80 px-3.5 bg-white text-slate-900 outline-none focus:border-[#0E5C44] focus:ring-2 focus:ring-[#0E5C44]/20 dark:border-slate-800 dark:bg-[#111827] dark:text-white dark:focus:border-[#3FBF75]"
                  placeholder="08xxxxxxxxxx"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-slate-400" /> Email Aktif
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full h-10.5 rounded-xl border border-slate-200/80 px-3.5 bg-white text-slate-900 outline-none focus:border-[#0E5C44] focus:ring-2 focus:ring-[#0E5C44]/20 dark:border-slate-800 dark:bg-[#111827] dark:text-white dark:focus:border-[#3FBF75]"
                  placeholder="email@domain.com"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" /> Alamat Domisili
                </label>
                <textarea
                  rows={2}
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full rounded-xl border border-slate-200/80 p-3 bg-white text-slate-900 outline-none focus:border-[#0E5C44] focus:ring-2 focus:ring-[#0E5C44]/20 dark:border-slate-800 dark:bg-[#111827] dark:text-white dark:focus:border-[#3FBF75]"
                  placeholder="Alamat domisili saat ini..."
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
                  <Briefcase className="w-3.5 h-3.5 text-slate-400" /> Aktivitas Lanjutan
                </label>
                <select
                  value={formData.status_lanjutan}
                  onChange={(e) => setFormData({ ...formData, status_lanjutan: e.target.value })}
                  className="w-full h-10.5 rounded-xl border border-slate-200/80 px-3.5 bg-white text-slate-900 outline-none focus:border-[#0E5C44] focus:ring-2 focus:ring-[#0E5C44]/20 dark:border-slate-800 dark:bg-[#111827] dark:text-white dark:focus:border-[#3FBF75]"
                >
                  <option value="Kuliah">Kuliah (Perguruan Tinggi)</option>
                  <option value="Bekerja">Bekerja</option>
                  <option value="Wirausaha">Wirausaha / Bisnis</option>
                  <option value="Lainnya">Lainnya</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
                  <School className="w-3.5 h-3.5 text-slate-400" /> Nama Perguruan Tinggi / Universitas
                </label>
                <input
                  type="text"
                  value={formData.perguruan_tinggi}
                  onChange={(e) => setFormData({ ...formData, perguruan_tinggi: e.target.value })}
                  className="w-full h-10.5 rounded-xl border border-slate-200/80 px-3.5 bg-white text-slate-900 outline-none focus:border-[#0E5C44] focus:ring-2 focus:ring-[#0E5C44]/20 dark:border-slate-800 dark:bg-[#111827] dark:text-white dark:focus:border-[#3FBF75]"
                  placeholder="Nama universitas / kampus..."
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
                  <Briefcase className="w-3.5 h-3.5 text-slate-400" /> Pekerjaan / Jabatan
                </label>
                <input
                  type="text"
                  value={formData.pekerjaan}
                  onChange={(e) => setFormData({ ...formData, pekerjaan: e.target.value })}
                  className="w-full h-10.5 rounded-xl border border-slate-200/80 px-3.5 bg-white text-slate-900 outline-none focus:border-[#0E5C44] focus:ring-2 focus:ring-[#0E5C44]/20 dark:border-slate-800 dark:bg-[#111827] dark:text-white dark:focus:border-[#3FBF75]"
                  placeholder="Pekerjaan / posisi saat ini..."
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
                  <Building className="w-3.5 h-3.5 text-slate-400" /> Instansi / Nama Perusahaan
                </label>
                <input
                  type="text"
                  value={formData.instansi}
                  onChange={(e) => setFormData({ ...formData, instansi: e.target.value })}
                  className="w-full h-10.5 rounded-xl border border-slate-200/80 px-3.5 bg-white text-slate-900 outline-none focus:border-[#0E5C44] focus:ring-2 focus:ring-[#0E5C44]/20 dark:border-slate-800 dark:bg-[#111827] dark:text-white dark:focus:border-[#3FBF75]"
                  placeholder="Nama tempat bekerja / wirausaha..."
                />
              </div>
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#0E5C44] text-white text-xs font-semibold shadow-md hover:bg-[#1E8E5A] transition-all disabled:opacity-50 dark:bg-[#3FBF75] dark:text-slate-900"
              >
                {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                <span>{saving ? 'Simpan...' : 'Simpan Perubahan Profil'}</span>
              </button>
            </div>
          </form>
        </div>

        {/* Right Column: Alumni Announcements Card */}
        <div className="lg:col-span-4">
          <div className="rounded-[18px] border border-slate-200/80 bg-white shadow-sm overflow-hidden dark:border-slate-800 dark:bg-[#1B2433]">
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center dark:bg-amber-950/60 dark:text-amber-400">
                <Megaphone className="w-4.5 h-4.5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Pengumuman Sekolah & Alumni
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Kabar alumni & informasi resmi sekolah
                </p>
              </div>
            </div>

            {announcements.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400 dark:text-slate-500">
                Belum ada pengumuman alumni saat ini.
              </div>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                {announcements.map((ann, idx) => (
                  <div key={ann.id || idx} className="p-4 hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors space-y-1.5">
                    <h4 className="font-semibold text-slate-800 dark:text-slate-200 line-clamp-2">
                      {ann.judul_pengumuman || ann.judul || 'Informasi Alumni'}
                    </h4>
                    {ann.isi && (
                      <p className="text-slate-500 dark:text-slate-400 line-clamp-2 text-[11px]">
                        {ann.isi}
                      </p>
                    )}
                    <div className="flex items-center gap-1 text-[10px] text-slate-400 dark:text-slate-500 font-medium pt-0.5">
                      <Calendar className="w-3 h-3" />
                      <span>{ann.created_at ? new Date(ann.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '-'}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
