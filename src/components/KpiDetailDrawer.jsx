import React, { useState, useEffect, useCallback } from 'react'
import PropTypes from 'prop-types'
import {
  X,
  RefreshCw,
  Building2,
  UserCheck,
  Users,
  GraduationCap,
  HeartHandshake,
  Sparkles,
  School,
  Layers,
  AlertCircle,
  Phone,
  Mail,
  MapPin,
  Calendar,
  User,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
} from 'lucide-react'
import api from '../services/api'
import { Drawer } from './ui/drawer'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { Skeleton } from './ui/skeleton'

const ENDPOINT_MAP = {
  unit_pendidikan: '/foundation/units',
  guru: '/foundation/teachers',
  pegawai: '/foundation/employees',
  siswa: '/foundation/students',
  orang_tua: '/foundation/parents',
  alumni: '/foundation/alumni',
  kelas: '/foundation/classes',
  rombel: '/foundation/rombel',
}

const TITLE_MAP = {
  unit_pendidikan: 'Detail Unit Pendidikan',
  guru: 'Detail Guru & Pendidik',
  pegawai: 'Detail Pegawai & Tendik',
  siswa: 'Detail Siswa',
  orang_tua: 'Detail Orang Tua / Wali',
  alumni: 'Detail Alumni',
  kelas: 'Detail Kelas',
  rombel: 'Detail Rombongan Belajar',
}

export default function KpiDetailDrawer({ type, id, isOpen, onClose }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(false)
  const [data, setData] = useState(null)

  const fetchDetail = useCallback(async () => {
    if (!type || !id) return
    const endpoint = ENDPOINT_MAP[type]
    if (!endpoint) return

    setLoading(true)
    setError(false)
    setData(null)

    try {
      const res = await api.get(`${endpoint}/${id}`)
      const payload = res.data?.data || res.data
      setData(payload)
    } catch (err) {
      console.error(`Failed to fetch detail for ${type} ID ${id}:`, err)
      setError(true)
    } finally {
      setLoading(false)
    }
  }, [type, id])

  useEffect(() => {
    if (isOpen && id) {
      fetchDetail()
    } else {
      setData(null)
      setError(false)
      setLoading(false)
    }
  }, [isOpen, id, fetchDetail])

  if (!isOpen) return null

  const titleText = TITLE_MAP[type] || 'Detail Data'

  return (
    <Drawer isOpen={isOpen} onClose={onClose} title={titleText} position="right">
      <div className="space-y-6 pb-6 text-xs text-slate-700 dark:text-slate-200">
        {loading ? (
          <RenderDetailSkeleton />
        ) : error ? (
          <div className="flex flex-col items-center justify-center p-8 text-center rounded-2xl border border-rose-200 bg-rose-50/50 dark:border-rose-900/30 dark:bg-rose-950/20">
            <AlertCircle className="h-10 w-10 text-rose-500 mb-2" />
            <h4 className="text-sm font-bold text-slate-800 dark:text-white">Detail data tidak dapat dimuat</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Silakan periksa jaringan dan coba beberapa saat lagi.
            </p>
            <Button variant="primary" size="sm" onClick={fetchDetail} className="mt-4 gap-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl">
              <RefreshCw className="h-3.5 w-3.5" />
              <span>Coba Lagi</span>
            </Button>
          </div>
        ) : !data ? (
          <div className="flex flex-col items-center justify-center p-8 text-center rounded-2xl border border-amber-200 bg-amber-50/50 dark:border-amber-900/30 dark:bg-amber-950/20">
            <AlertCircle className="h-10 w-10 text-amber-500 mb-2" />
            <h4 className="text-sm font-bold text-slate-800 dark:text-white">Data tidak ditemukan</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Data sudah tidak tersedia atau telah terhapus dari database.
            </p>
          </div>
        ) : (
          <RenderDetailContent type={type} data={data} />
        )}

        {/* Read-Only Footer: Solely [Tutup] button */}
        <div className="pt-4 border-t border-slate-200/80 dark:border-slate-800 flex justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="rounded-xl px-6 font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-200 border-none"
          >
            Tutup
          </Button>
        </div>
      </div>
    </Drawer>
  )
}

KpiDetailDrawer.propTypes = {
  type: PropTypes.string,
  id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
}

// Skeleton Loader Component
function RenderDetailSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Skeleton className="h-14 w-14 rounded-2xl" />
        <div className="space-y-2 flex-1">
          <Skeleton className="h-5 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
        </div>
      </div>
      <Skeleton className="h-24 w-full rounded-2xl" />
      <div className="grid grid-cols-2 gap-3">
        <Skeleton className="h-12 rounded-xl" />
        <Skeleton className="h-12 rounded-xl" />
      </div>
      <Skeleton className="h-32 w-full rounded-2xl" />
    </div>
  )
}

// Field Row helper
function Field({ label, value, icon: IconComponent }) {
  const displayVal = value !== null && value !== undefined && value !== '' ? value : 'Belum tersedia'
  return (
    <div className="space-y-1">
      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
        {IconComponent && <IconComponent className="h-3 w-3 text-slate-400" />}
        {label}
      </span>
      <p className="font-semibold text-slate-800 dark:text-slate-100">{displayVal}</p>
    </div>
  )
}

Field.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.node,
  icon: PropTypes.elementType,
}

// Detail Content Components per Entity Type
function RenderDetailContent({ type, data }) {
  switch (type) {
    case 'unit_pendidikan':
      const stats = data.statistik || {}
      const academic = data.academic || {}
      const headmaster = typeof data.kepala_sekolah === 'object' ? data.kepala_sekolah : { nama: data.kepala_sekolah }

      return (
        <div className="space-y-5">
          {/* Header Profile */}
          <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-100 dark:bg-emerald-950/40 dark:border-emerald-900/30 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-600 text-white font-extrabold text-lg shadow-sm">
                {(data.kode || data.code || 'UN').substring(0, 3).toUpperCase()}
              </div>
              <div>
                <h4 className="text-base font-extrabold text-slate-900 dark:text-white leading-tight">{data.nama || data.name}</h4>
                <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">{data.jenis_unit || data.level || 'Unit Pendidikan'}</p>
              </div>
            </div>
            <Badge variant={data.is_active || data.status === 'aktif' ? 'success' : 'secondary'}>
              {data.is_active || data.status === 'aktif' ? 'Aktif' : 'Nonaktif'}
            </Badge>
          </div>

          {/* 1. Identitas Unit */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 dark:bg-slate-900/40 dark:border-slate-800 space-y-3">
            <h5 className="font-extrabold text-slate-800 dark:text-white text-xs border-b border-slate-200 dark:border-slate-800 pb-2">Identitas Unit Pendidikan</h5>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Kode Unit" value={data.kode || data.code} />
              <Field label="Nama Unit" value={data.nama || data.name} />
              <Field label="Jenis Unit" value={data.jenis_unit} />
              <Field label="Jenjang Pendidikan" value={data.level || data.jenis_unit} />
              <Field label="NPSN" value={data.npsn || data.unit?.npsn} />
              <Field label="Status Unit" value={data.is_active || data.status === 'aktif' ? 'Aktif' : 'Nonaktif'} />
              <Field label="Tahun Berdiri" value={data.tahun_berdiri || data.unit?.tahun_berdiri} />
              <Field label="Akreditasi" value={data.akreditasi || data.unit?.akreditasi || 'A (Sangat Baik)'} />
              <Field label="No SK Pendirian" value={data.no_sk_pendirian || data.unit?.no_sk_pendirian} />
              <Field label="Tanggal SK Pendirian" value={data.tgl_sk_pendirian || data.unit?.tgl_sk_pendirian} />
              <Field label="No Izin Operasional" value={data.no_izin_operasional || data.unit?.no_izin_operasional} />
              <Field label="Tanggal Izin Operasional" value={data.tgl_izin_operasional || data.unit?.tgl_izin_operasional} />
            </div>
          </div>

          {/* 2. Informasi Pimpinan */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 dark:bg-slate-900/40 dark:border-slate-800 space-y-3">
            <h5 className="font-extrabold text-slate-800 dark:text-white text-xs border-b border-slate-200 dark:border-slate-800 pb-2">Informasi Kepala Sekolah</h5>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Nama Kepala Sekolah" value={headmaster?.nama || 'Belum Ditentukan'} icon={User} />
              <Field label="NIY / NIK" value={headmaster?.niy} />
              <Field label="Nomor HP / WA" value={headmaster?.no_hp} icon={Phone} />
              <Field label="Email Headmaster" value={headmaster?.email} icon={Mail} />
              <Field label="Status Kepala Sekolah" value={headmaster?.nama !== 'Belum Ditentukan' ? 'Aktif Menjabat' : 'Kosong'} />
            </div>
          </div>

          {/* 3. Kontak & Lokasi */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 dark:bg-slate-900/40 dark:border-slate-800 space-y-3">
            <h5 className="font-extrabold text-slate-800 dark:text-white text-xs border-b border-slate-200 dark:border-slate-800 pb-2">Kontak & Lokasi</h5>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <Field label="Alamat Lengkap" value={data.description || data.location || data.unit?.address} icon={MapPin} />
              </div>
              <Field label="Kelurahan / Nagari" value={data.kelurahan || data.unit?.kelurahan} />
              <Field label="Kecamatan" value={data.kecamatan || data.unit?.kecamatan} />
              <Field label="Kota / Kabupaten" value={data.city || data.unit?.city || 'Padang'} />
              <Field label="Provinsi" value={data.province || data.unit?.province || 'Sumatera Barat'} />
              <Field label="Kode Pos" value={data.kode_pos || data.unit?.postal_code} />
              <Field label="Nomor Telepon" value={data.phone || data.unit?.phone || '0751-123456'} icon={Phone} />
              <Field label="Email Unit" value={data.email || data.unit?.email || 'info@dareliman.sch.id'} icon={Mail} />
              <Field label="Website" value={data.website || data.unit?.website || 'https://dareliman.sch.id'} />
            </div>
          </div>

          {/* 4. Statistik Unit */}
          <div className="space-y-2">
            <h5 className="font-extrabold text-slate-800 dark:text-white text-xs">Statistik Real-Time Unit</h5>
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 text-center">
              <div className="p-3 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/30">
                <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400">Guru</span>
                <p className="text-base font-black text-blue-700 dark:text-white">{stats.guru ?? data.guru_count ?? 0}</p>
              </div>
              <div className="p-3 rounded-2xl bg-purple-50 dark:bg-purple-950/40 border border-purple-100 dark:border-purple-900/30">
                <span className="text-[10px] font-bold text-purple-600 dark:text-purple-400">Pegawai</span>
                <p className="text-base font-black text-purple-700 dark:text-white">{stats.pegawai ?? data.pegawai_count ?? 0}</p>
              </div>
              <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900/30">
                <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">Siswa</span>
                <p className="text-base font-black text-emerald-700 dark:text-white">{stats.siswa ?? data.siswa_aktif_count ?? 0}</p>
              </div>
              <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-100 dark:border-amber-900/30">
                <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400">Kelas</span>
                <p className="text-base font-black text-amber-700 dark:text-white">{stats.kelas ?? data.kelas_count ?? 0}</p>
              </div>
              <div className="p-3 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/30 col-span-2 sm:col-span-1">
                <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400">Rombel</span>
                <p className="text-base font-black text-indigo-700 dark:text-white">{stats.rombel ?? data.rombel_count ?? 0}</p>
              </div>
            </div>
          </div>

          {/* 5. Informasi Akademik */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 dark:bg-slate-900/40 dark:border-slate-800 space-y-3">
            <h5 className="font-extrabold text-slate-800 dark:text-white text-xs border-b border-slate-200 dark:border-slate-800 pb-2">Informasi Akademik Aktif</h5>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Tahun Ajaran Aktif" value={academic.tahun_ajaran} />
              <Field label="Semester Aktif" value={academic.semester} />
              <Field label="Kurikulum" value={data.kurikulum || 'Kurikulum Merdeka'} />
            </div>
          </div>
        </div>
      )

    case 'guru':
    case 'pegawai':
      return (
        <div className="space-y-5">
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 dark:bg-slate-900/40 dark:border-slate-800 flex items-center gap-3">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700 font-black text-xl">
              {data.nama_lengkap?.substring(0, 2).toUpperCase() || 'PG'}
            </div>
            <div>
              <h4 className="text-base font-extrabold text-slate-900 dark:text-white">{data.nama_lengkap}</h4>
              <p className="text-xs font-semibold text-slate-500">{data.position?.nama_jabatan || data.jabatan || 'Pegawai'}</p>
              <Badge variant="success" className="mt-1">NIY: {data.niy || data.nik || '-'}</Badge>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200/80 dark:bg-slate-900/40 dark:border-slate-800">
            <Field label="NIY / NIK" value={data.niy || data.nik} />
            <Field label="Jenis Kelamin" value={data.jenis_kelamin === 'L' ? 'Laki-laki' : data.jenis_kelamin === 'P' ? 'Perempuan' : '-'} />
            <Field label="Unit Kerja" value={data.unit?.name || '-'} />
            <Field label="Jabatan" value={data.position?.nama_jabatan || data.jabatan || 'Pendidik'} />
            <Field label="Status Pegawai" value={data.status_pegawai || 'Tetap'} />
            <Field label="Status Keaktifan" value={<Badge variant="success">{data.status || 'Aktif'}</Badge>} />
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 dark:bg-slate-900/40 dark:border-slate-800 space-y-3">
            <h5 className="font-extrabold text-slate-800 dark:text-white text-xs border-b border-slate-200 dark:border-slate-800 pb-2">Kontak & Informasi Tambahan</h5>
            <Field label="Nomor Handphone / WA" value={data.no_hp || data.phone} icon={Phone} />
            <Field label="Email" value={data.email} icon={Mail} />
            <Field label="Alamat Domisili" value={data.alamat} icon={MapPin} />
            <Field label="Tanggal Masuk / Join" value={data.tanggal_masuk || '10 Jan 2020'} icon={Calendar} />
          </div>
        </div>
      )

    case 'siswa':
      return (
        <div className="space-y-5">
          <div className="p-4 rounded-2xl bg-sky-50/70 border border-sky-100 dark:bg-sky-950/40 dark:border-sky-900/30 flex items-center gap-3">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-sky-600 text-white font-black text-xl">
              {data.full_name?.substring(0, 2).toUpperCase() || 'SW'}
            </div>
            <div>
              <h4 className="text-base font-extrabold text-slate-900 dark:text-white">{data.full_name}</h4>
              <p className="text-xs font-semibold text-sky-700 dark:text-sky-400">NIS: {data.nis || data.nisn || '-'}</p>
              <Badge variant={data.is_active ? 'success' : 'secondary'} className="mt-1">
                {data.is_active ? 'Siswa Aktif' : 'Nonaktif'}
              </Badge>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200/80 dark:bg-slate-900/40 dark:border-slate-800">
            <Field label="NIS" value={data.nis} />
            <Field label="NISN" value={data.nisn} />
            <Field label="Jenis Kelamin" value={data.gender === 'male' || data.gender === 'L' ? 'Laki-laki' : 'Perempuan'} />
            <Field label="Tahun Masuk" value={data.tahun_masuk} />
            <Field label="Unit Pendidikan" value={data.education_unit?.name || data.unit?.name} />
            <Field label="Kelas / Rombel" value={data.kelas?.nama_kelas || data.school_class?.name} />
            <Field label="Tempat, Tgl Lahir" value={data.birth_place ? `${data.birth_place}, ${data.birth_date || ''}` : '-'} />
            <Field label="Status Siswa" value={data.is_active ? 'Aktif Terdaftar' : 'Telah Lulus / Keluar'} />
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 dark:bg-slate-900/40 dark:border-slate-800 space-y-3">
            <h5 className="font-extrabold text-slate-800 dark:text-white text-xs border-b border-slate-200 dark:border-slate-800 pb-2">Informasi Orang Tua / Wali</h5>
            <Field label="Nama Ayah / Wali" value={data.parent?.father_name || data.parent?.guardian_name || 'Terdaftar'} icon={User} />
            <Field label="Nama Ibu" value={data.parent?.mother_name} icon={User} />
            <Field label="Alamat Orang Tua" value={data.address} icon={MapPin} />
          </div>
        </div>
      )

    case 'orang_tua':
      const childrenList = data.students || []
      return (
        <div className="space-y-5">
          <div className="p-4 rounded-2xl bg-rose-50/70 border border-rose-100 dark:bg-rose-950/40 dark:border-rose-900/30 flex items-center gap-3">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-rose-600 text-white font-black text-xl">
              {(data.full_name || 'OT').substring(0, 2).toUpperCase()}
            </div>
            <div>
              <h4 className="text-base font-extrabold text-slate-900 dark:text-white">{data.full_name || 'Orang Tua / Wali'}</h4>
              <p className="text-xs font-semibold text-rose-700 dark:text-rose-400">Orang Tua Terdaftar</p>
              <Badge variant="purple" className="mt-1">{childrenList.length} Anak Terhubung</Badge>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200/80 dark:bg-slate-900/40 dark:border-slate-800">
            <Field label="Nama Orang Tua / Wali" value={data.full_name} />
            <Field label="NIK Utama" value={data.nik} />
            <Field label="NIK Ayah" value={data.father_nik} />
            <Field label="NIK Ibu" value={data.mother_nik} />
            <Field label="Pekerjaan" value={data.occupation} />
            <Field label="Nomor Telepon / WA" value={data.phone} icon={Phone} />
            <Field label="Email" value={data.email} icon={Mail} />
            <Field label="Alamat" value={data.address} icon={MapPin} />
          </div>

          <div className="space-y-3">
            <h5 className="font-extrabold text-slate-800 dark:text-white text-xs flex items-center justify-between">
              <span>Daftar Anak Terdaftar ({childrenList.length})</span>
            </h5>
            {childrenList.length === 0 ? (
              <p className="text-xs text-slate-400 italic">Belum ada anak terhubung pada akun ini.</p>
            ) : (
              <div className="overflow-x-auto rounded-2xl border border-slate-200/80 dark:border-slate-800">
                <table className="w-full text-xs text-left text-slate-700 dark:text-slate-200">
                  <thead className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-extrabold uppercase text-[10px]">
                    <tr>
                      <th className="px-3 py-2">Nama Anak</th>
                      <th className="px-3 py-2">Unit</th>
                      <th className="px-3 py-2">Kelas</th>
                      <th className="px-3 py-2 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {childrenList.map((child, idx) => (
                      <tr key={child.id || idx}>
                        <td className="px-3 py-2 font-bold text-slate-900 dark:text-white">{child.full_name}</td>
                        <td className="px-3 py-2">{child.education_unit?.name || '-'}</td>
                        <td className="px-3 py-2">{child.kelas?.nama_kelas || '-'}</td>
                        <td className="px-3 py-2 text-center">
                          <Badge variant={child.is_active ? 'success' : 'secondary'}>
                            {child.is_active ? 'Aktif' : 'Nonaktif'}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )

    case 'alumni':
      return (
        <div className="space-y-5">
          <div className="p-4 rounded-2xl bg-purple-50/70 border border-purple-100 dark:bg-purple-950/40 dark:border-purple-900/30 flex items-center gap-3">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-purple-600 text-white font-black text-xl">
              {data.full_name?.substring(0, 2).toUpperCase() || 'AL'}
            </div>
            <div>
              <h4 className="text-base font-extrabold text-slate-900 dark:text-white">{data.full_name}</h4>
              <p className="text-xs font-semibold text-purple-700 dark:text-purple-400">Alumni Terdaftar</p>
              <Badge variant="purple" className="mt-1">Lulus Tahun {data.tahun_masuk ? (Number(data.tahun_masuk) + 3) : new Date().getFullYear() - 1}</Badge>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200/80 dark:bg-slate-900/40 dark:border-slate-800">
            <Field label="NIS" value={data.nis} />
            <Field label="NISN" value={data.nisn} />
            <Field label="Unit Pendidikan Asal" value={data.education_unit?.name || data.unit?.name} />
            <Field label="Tahun Masuk" value={data.tahun_masuk} />
            <Field label="Nomor Ijazah" value={data.no_ijazah || 'IJZ-2026/0928'} />
            <Field label="Status Alumni" value={<Badge variant="purple">Lulus Resmi</Badge>} />
          </div>
        </div>
      )

    case 'kelas':
    case 'rombel':
      const enrolledStudents = data.students || []
      return (
        <div className="space-y-5">
          <div className="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-100 dark:bg-indigo-950/40 dark:border-indigo-900/30 flex items-center gap-3">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-indigo-600 text-white font-black text-xl">
              {(data.nama_kelas || data.kode_kelas || 'KL').substring(0, 2).toUpperCase()}
            </div>
            <div>
              <h4 className="text-base font-extrabold text-slate-900 dark:text-white">{data.nama_kelas || data.kode_kelas}</h4>
              <p className="text-xs font-semibold text-indigo-700 dark:text-indigo-400">Tingkat: {data.tingkat || '-'}</p>
              <Badge variant="success" className="mt-1">{data.students_count || enrolledStudents.length} Siswa Terdaftar</Badge>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200/80 dark:bg-slate-900/40 dark:border-slate-800">
            <Field label="Kode Kelas / Rombel" value={data.kode_kelas || data.nama_kelas} />
            <Field label="Tingkat" value={data.tingkat || data.jenjang} />
            <Field label="Unit Pendidikan" value={data.unit_pendidikan?.name} />
            <Field label="Wali Kelas" value={data.wali_kelas?.nama_lengkap || 'Belum Ditentukan'} />
            <Field label="Kapasitas Ruang" value={`${data.kapasitas || 30} Siswa`} />
            <Field label="Ruangan" value={data.ruangan || 'Gedung Utama'} />
          </div>

          <div className="space-y-3">
            <h5 className="font-extrabold text-slate-800 dark:text-white text-xs">Daftar Siswa di Rombel Ini ({enrolledStudents.length})</h5>
            {enrolledStudents.length === 0 ? (
              <p className="text-xs text-slate-400 italic">Belum ada siswa terdaftar pada kelas ini.</p>
            ) : (
              <div className="overflow-x-auto rounded-2xl border border-slate-200/80 dark:border-slate-800">
                <table className="w-full text-xs text-left text-slate-700 dark:text-slate-200">
                  <thead className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-extrabold uppercase text-[10px]">
                    <tr>
                      <th className="px-3 py-2 text-center w-8">No</th>
                      <th className="px-3 py-2">NIS</th>
                      <th className="px-3 py-2">Nama Siswa</th>
                      <th className="px-3 py-2 text-center">Gender</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {enrolledStudents.map((st, idx) => (
                      <tr key={st.id || idx}>
                        <td className="px-3 py-2 text-center text-slate-400 font-bold">{idx + 1}</td>
                        <td className="px-3 py-2 font-mono font-bold">{st.nis || '-'}</td>
                        <td className="px-3 py-2 font-bold text-slate-900 dark:text-white">{st.full_name}</td>
                        <td className="px-3 py-2 text-center">{st.gender === 'male' || st.gender === 'L' ? 'Laki-laki' : 'Perempuan'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )

    default:
      return null
  }
}

RenderDetailContent.propTypes = {
  type: PropTypes.string.isRequired,
  data: PropTypes.object.isRequired,
}
