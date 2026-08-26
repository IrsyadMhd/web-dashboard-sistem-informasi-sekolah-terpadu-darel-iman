import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import Swal from 'sweetalert2'
import ConfirmDialog from '../components/app/ConfirmDialog'
import { MasterDeleteDialog } from '../components/master-data'
import {
  Shield,
  Plus,
  Search,
  Pencil,
  Trash2,
  X,
  Lock,
  Key,
  Users,
  CheckCircle,
  Save,
  UserCheck,
  UserX,
  UserCog,
  Building,
  Briefcase,
  ArrowRight,
  Layers,
  ShieldCheck,
  Sparkles,
  ShieldAlert,
} from 'lucide-react'
import { motion } from 'framer-motion'
import { hakAksesService } from '../services/hakAksesService'
import { educationUnitService } from '../services/educationUnitService'
import { getModulLabel, getPermissionLabel } from '../utils/permissionTranslations'
import UserAccountManagement from '../components/auth/UserAccountManagement'
import { ROLES, hasAnyRole, isGlobalAccessManager, isUnitAccessManager, getTierForRole, canEditRole, getEditableTiers } from '../auth/portalResolver'
import { useAuthStore } from '../stores/authStore'
import PageContainer from '../components/app/PageContainer'
import AppBreadcrumb from '../components/app/AppBreadcrumb'
import {
  MasterDataPage,
  MasterPageHeader,
  MasterStatsGrid,
  MasterStatCard,
  MasterFilterBar,
  MasterSearchInput,
  MasterFilterSelect,
  MasterDataTable,
  MasterBadge,
  MasterStatusBadge,
  MasterActionGroup,
  MasterActionIconButton,
  MasterPagination,
} from '../components/master-data'

// GLOBAL_ROLE_NAMES: nama role yang tidak bisa diubah oleh Unit Manager
// Dibangun dari ROLES constants agar sinkron dengan portalResolver
const GLOBAL_ROLE_NAMES = [
  ...ROLES.SUPER_ADMIN, ...ROLES.ADMIN, ...ROLES.YAYASAN,
]

const GLOBAL_ACCESS_PERMISSIONS = [
  'sistem.hak_akses', 'sistem.master_data', 'sistem.pengaturan',
  'permission.manage', 'role.manage', 'employee.view_all', 'employee.create', 'employee.delete', 'employee.import',
  'unit.view_all', 'unit.create', 'unit.update', 'unit.delete',
  'master.create', 'master.update', 'master.delete',
]

// Warna badge tier
const TIER_COLOR_MAP = {
  red:     { bg: 'bg-red-50',    text: 'text-red-700',    border: 'border-red-200'    },
  purple:  { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' },
  blue:    { bg: 'bg-blue-50',   text: 'text-blue-700',   border: 'border-blue-200'   },
  emerald: { bg: 'bg-emerald-50',text: 'text-emerald-700',border: 'border-emerald-200'},
  sky:     { bg: 'bg-sky-50',    text: 'text-sky-700',    border: 'border-sky-200'    },
  amber:   { bg: 'bg-amber-50',  text: 'text-amber-700',  border: 'border-amber-200'  },
  teal:    { bg: 'bg-teal-50',   text: 'text-teal-700',   border: 'border-teal-200'   },
  gray:    { bg: 'bg-slate-100', text: 'text-slate-600',  border: 'border-slate-200'  },
}

// Label scope
const SCOPE_LABEL = {
  global:   { text: 'Global',   bg: 'bg-violet-50',  textCls: 'text-violet-700', border: 'border-violet-200' },
  unit:     { text: 'Per Unit', bg: 'bg-amber-50',   textCls: 'text-amber-700',  border: 'border-amber-200'  },
  external: { text: 'Eksternal',bg: 'bg-slate-100',  textCls: 'text-slate-600',  border: 'border-slate-200'  },
}

const applyRoleDefaultPermissions = (targetRoleName, availablePermList = []) => {
  if (!targetRoleName) return []
  if (targetRoleName === 'Super Admin') return availablePermList

  const roleKeywordMap = {
    'Admin': ['hak_akses', 'master', 'pegawai', 'siswa', 'unit', 'laporan', 'user', 'role'],
    'Pengurus Yayasan': ['yayasan', 'divisi', 'laporan', 'berita', 'pegawai', 'siswa', 'unit', 'rekap'],
    'Kepala Sekolah': ['dashboard', 'laporan', 'absensi', 'akademik', 'tahfizh', 'mutabaah', 'pegawai', 'siswa', 'rapor'],
    'Divisi Pendidikan': ['dashboard', 'laporan', 'kurikulum', 'lms', 'akademik', 'siswa', 'pegawai', 'capaian'],
    'Guru': ['dashboard', 'absensi', 'akademik', 'lms', 'tahfizh', 'mutabaah', 'siswa'],
    'Musyrif': ['dashboard', 'absensi', 'asrama', 'mutabaah', 'pelanggaran', 'kedisiplinan'],
    'Musyrif Asrama': ['dashboard', 'absensi', 'asrama', 'mutabaah', 'pelanggaran', 'kedisiplinan'],
    'Wali Kelas': ['dashboard', 'absensi', 'akademik', 'rapor', 'siswa', 'laporan'],
    'Tata Usaha': ['dashboard', 'siswa', 'pegawai', 'surat', 'laporan', 'administrasi'],
    'Guru Tahfizh': ['dashboard', 'tahfizh', 'hafalan', 'setoran', 'mutabaah', 'laporan'],
    'Konselor / BK': ['dashboard', 'konseling', 'pelanggaran', 'bk', 'siswa'],
    'Pustakawan': ['dashboard', 'perpustakaan', 'buku', 'pinjam', 'katalog'],
    'Operator LMS': ['dashboard', 'lms', 'materi', 'tugas', 'ujian', 'soal'],
    'Kasir / Keuangan': ['dashboard', 'keuangan', 'spp', 'bayar', 'transaksi', 'laporan'],
    'Siswa': ['portal', 'siswa', 'absensi', 'akademik', 'lms', 'mutabaah'],
    'Orang Tua': ['portal', 'ortu', 'absensi', 'akademik', 'keuangan', 'tahfizh'],
  }

  const keywords = roleKeywordMap[targetRoleName] || [targetRoleName.toLowerCase()]
  const matched = availablePermList.filter((p) => {
    const pLower = p.toLowerCase()
    return keywords.some((kw) => pLower.includes(kw.toLowerCase()))
  })

  if (matched.length === 0) {
    return availablePermList.slice(0, 5)
  }
  return matched
}

// ─────────────────────────────────────────────────────────────────
// MODAL ROLE FORM (CREATE & EDIT ROLE AKSES)
// ─────────────────────────────────────────────────────────────────
function RoleFormModal({ isOpen, onClose, onSubmit, initialData = null, allPermissions = [], isSubmitting = false }) {
  const isEdit = Boolean(initialData?.id)
  const [name, setName] = useState(initialData?.name || '')
  const [selectedPerms, setSelectedPerms] = useState(initialData?.permissions || [])
  const [error, setError] = useState('')

  React.useEffect(() => {
    if (isOpen) {
      const initialRoleName = initialData?.name || ''
      setName(initialRoleName)
      setError('')
      if (isEdit && Array.isArray(initialData?.permissions) && initialData.permissions.length > 0) {
        setSelectedPerms(initialData.permissions)
      } else if (initialRoleName) {
        setSelectedPerms(applyRoleDefaultPermissions(initialRoleName, allPermissions))
      } else {
        setSelectedPerms([])
      }
    }
  }, [isOpen, initialData, isEdit, allPermissions])

  if (!isOpen) return null

  const handleApplyDefaultPreset = () => {
    if (!name.trim()) {
      setError('Masukkan atau pilih nama role terlebih dahulu.')
      return
    }
    const preset = applyRoleDefaultPermissions(name.trim(), allPermissions)
    setSelectedPerms(preset)
  }

  const handleSelectAll = () => setSelectedPerms([...allPermissions])
  const handleClearAll = () => setSelectedPerms([])

  const togglePerm = (perm) => {
    setSelectedPerms((prev) =>
      prev.includes(perm) ? prev.filter((p) => p !== perm) : [...prev, perm]
    )
  }

  const toggleAll = (modulsPerms) => {
    const allSelected = modulsPerms.every((p) => selectedPerms.includes(p))
    if (allSelected) {
      setSelectedPerms((prev) => prev.filter((p) => !modulsPerms.includes(p)))
    } else {
      setSelectedPerms((prev) => [...new Set([...prev, ...modulsPerms])])
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!name.trim()) { setError('Nama role tidak boleh kosong.'); return }
    onSubmit({ name: name.trim(), permissions: selectedPerms })
  }

  // Kelompokkan permissions berdasarkan modul (prefix sebelum titik)
  const grouped = allPermissions.reduce((acc, p) => {
    const modul = p.split('.')[0] || 'lainnya'
    if (!acc[modul]) acc[modul] = []
    acc[modul].push(p)
    return acc
  }, {})

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
      <div className="my-6 w-full max-w-3xl overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-7 py-5 border-b border-slate-100 bg-gradient-to-r from-emerald-500/10 via-teal-500/5 to-transparent">
          <div>
            <h2 className="text-xl font-black text-[#0f172a] flex items-center gap-2">
              <Shield className="text-emerald-700 w-5 h-5" />
              <span>{isEdit ? 'Edit Matriks Role Akses' : 'Tambah Role Akses Baru'}</span>
            </h2>
            <p className="text-xs font-medium text-slate-500 mt-0.5">
              Atur hak akses default untuk role ini. Anda dapat mengetikkan nama role atau memilih preset bawaan.
            </p>
          </div>
          <button type="button" onClick={onClose} className="rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-7 space-y-5 max-h-[80vh] overflow-y-auto">
          {/* Nama Role */}
          <div>
            <label className="block text-xs font-bold text-[#0f172a] mb-1.5">
              Nama Role Akses <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => {
                const newName = e.target.value
                setName(newName)
                setError('')
              }}
              placeholder="Contoh: Kepala Sekolah, Divisi Pendidikan, Tata Usaha, Guru"
              className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-800 shadow-sm transition-all placeholder:text-slate-400 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-emerald-600"
            />
            {error && <p className="mt-1 text-xs text-rose-500">{error}</p>}
          </div>

          {/* Permission Checklist dikelompokkan per modul */}
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
              <label className="block text-xs font-bold text-[#0f172a]">
                Matriks Izin Akses Role <span className="text-emerald-700 font-extrabold">({selectedPerms.length} dari {allPermissions.length} dipilih)</span>
              </label>
              
              {/* Quick Actions Preset */}
              <div className="flex items-center gap-1.5 flex-wrap">
                <button
                  type="button"
                  onClick={handleApplyDefaultPreset}
                  className="px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-800 hover:bg-emerald-600 hover:text-white text-[11px] font-extrabold transition-all cursor-pointer"
                  title="Terapkan preset izin default untuk role ini"
                >
                  ⚡ Preset Default Role
                </button>
                <button
                  type="button"
                  onClick={handleSelectAll}
                  className="px-2 py-1 rounded-lg bg-sky-100 text-sky-800 hover:bg-sky-600 hover:text-white text-[11px] font-bold transition-all cursor-pointer"
                >
                  ✓ Pilih Semua
                </button>
                <button
                  type="button"
                  onClick={handleClearAll}
                  className="px-2 py-1 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-300 text-[11px] font-bold transition-all cursor-pointer"
                >
                  ✕ Hapus Semua
                </button>
              </div>
            </div>

            <div className="space-y-3 max-h-72 overflow-y-auto rounded-2xl border border-slate-200/90 p-4 bg-[#f8fafc]">
              {Object.entries(grouped).map(([modul, perms]) => {
                const allModulSelected = perms.every((p) => selectedPerms.includes(p))
                const someSelected = perms.some((p) => selectedPerms.includes(p))
                return (
                  <div key={modul} className="rounded-xl border border-slate-200 bg-white overflow-hidden">
                    {/* Header Modul */}
                    <div
                      className="flex items-center justify-between px-4 py-2.5 bg-slate-50 cursor-pointer hover:bg-slate-100 transition-colors"
                      onClick={() => toggleAll(perms)}
                    >
                      <div className="flex items-center gap-2.5">
                        <div className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-all ${
                          allModulSelected ? 'bg-[#054e3b] border-[#054e3b]' : someSelected ? 'bg-[#054e3b]/30 border-[#054e3b]' : 'border-slate-300'
                        }`}>
                          {allModulSelected && <CheckCircle className="w-2.5 h-2.5 text-white" />}
                        </div>
                        <span className="text-xs font-extrabold text-slate-800 tracking-wider">
                          {getModulLabel(modul)} <span className="text-[10px] text-slate-400 font-normal">({modul})</span>
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-500 font-medium">{perms.filter(p => selectedPerms.includes(p)).length}/{perms.length} dipilih</span>
                    </div>
                    {/* Daftar Permission */}
                    <div className="px-4 py-2 flex flex-wrap gap-1.5">
                      {perms.map((perm) => (
                        <label key={perm} className="flex items-center gap-1.5 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={selectedPerms.includes(perm)}
                            onChange={() => togglePerm(perm)}
                            className="w-3.5 h-3.5 rounded text-[#054e3b] focus:ring-[#054e3b] border-slate-300"
                          />
                          <span
                            className={`text-xs px-2 py-0.5 rounded-full font-medium border ${
                              selectedPerms.includes(perm)
                                ? 'bg-[#dcfce7] text-[#15803d] border-emerald-200'
                                : 'bg-slate-100 text-slate-600 border-slate-200'
                            }`}
                            title={perm}
                          >
                            {getPermissionLabel(perm)}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between border-t border-slate-100 pt-4">
            <button type="button" onClick={onClose} className="rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors">
              Batal
            </button>
            <button type="submit" disabled={isSubmitting} className="flex items-center gap-1.5 rounded-xl bg-emerald-800 px-6 py-2.5 text-xs font-semibold text-white shadow-md shadow-emerald-800/20 transition-all hover:bg-emerald-900 disabled:opacity-50">
              <Save className="w-3.5 h-3.5" />
              <span>{isSubmitting ? 'Menyimpan...' : isEdit ? 'Simpan Perubahan Role' : 'Tambah Role Akses'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────
// MODAL PERMISSION FORM
// ─────────────────────────────────────────────────────────────────
function PermissionFormModal({ isOpen, onClose, onSubmit, isSubmitting = false }) {
  const [name, setName] = useState('')
  const [error, setError] = useState('')

  React.useEffect(() => {
    if (isOpen) { setName(''); setError('') }
  }, [isOpen])

  if (!isOpen) return null

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!name.trim()) { setError('Nama izin akses tidak boleh kosong.'); return }
    if (!name.includes('.')) { setError('Nama harus dalam format "modul.aksi", contoh: kehadiran.siswa.monitoring'); return }
    onSubmit({ name: name.trim() })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
      <div className="my-6 w-full max-w-md overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-2xl">
        <div className="flex items-center justify-between px-7 py-5 border-b border-slate-100">
          <h2 className="text-xl font-black text-[#0f172a]">Tambah Izin Akses Baru</h2>
          <button type="button" onClick={onClose} className="rounded-full p-2 text-slate-400 hover:bg-slate-100 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-7 space-y-5">
          <div>
            <label className="block text-xs font-bold text-[#0f172a] mb-1.5">
              Nama Izin Akses <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => { setName(e.target.value); setError('') }}
              placeholder="Contoh: tahfizh.monitoring_target, kesiswaan.kelulusan"
              className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-800 shadow-sm transition-all placeholder:text-slate-400 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-emerald-600"
            />
            {error && <p className="mt-1 text-xs text-rose-500">{error}</p>}
            <p className="mt-1.5 text-[11px] text-slate-500">Format: <code className="bg-slate-100 px-1 rounded">modul.aksi</code> — misalnya: <code className="bg-slate-100 px-1 rounded">tahfizh.monitoring_target</code></p>
          </div>

          <div className="flex items-center justify-between border-t border-slate-100 pt-4">
            <button type="button" onClick={onClose} className="rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors">
              Batal
            </button>
            <button type="submit" disabled={isSubmitting} className="flex items-center gap-1.5 rounded-xl bg-emerald-800 px-6 py-2.5 text-xs font-semibold text-white shadow-md shadow-emerald-800/20 transition-all hover:bg-emerald-900 disabled:opacity-50">
              <Key className="w-3.5 h-3.5" />
              <span>{isSubmitting ? 'Menyimpan...' : 'Tambah Izin Akses'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

const PROJECT_DEFAULT_ROLES = [
  'Super Admin',
  'Admin',
  'Pengurus Yayasan',
  'Kepala Sekolah',
  'Divisi Pendidikan',
  'Guru',
  'Musyrif',
  'Wali Kelas',
  'Tata Usaha',
  'Guru Tahfizh',
  'Musyrif Asrama',
  'Konselor / BK',
  'Pustakawan',
  'Operator LMS',
  'Kasir / Keuangan',
  'Siswa',
  'Orang Tua',
]

const getSmartDefaultRole = (emp, roleList = PROJECT_DEFAULT_ROLES) => {
  if (emp?.primary_role && emp.primary_role !== 'Belum Ada Role' && roleList.includes(emp.primary_role)) {
    return emp.primary_role
  }
  const pos = (emp?.position?.nama || emp?.jabatan || emp?.nama_lengkap || '').toLowerCase()
  if (pos.includes('super admin') || pos.includes('superadmin')) return 'Super Admin'
  if (pos.includes('admin')) return 'Admin'
  if (pos.includes('kepala sekolah') || pos.includes('kepsek')) return roleList.find((r) => r === 'Kepala Sekolah') || 'Kepala Sekolah'
  if (pos.includes('tahfizh')) return roleList.find((r) => r === 'Guru Tahfizh') || 'Guru Tahfizh'
  if (pos.includes('musyrif') || pos.includes('asrama')) return roleList.find((r) => r === 'Musyrif') || 'Musyrif'
  if (pos.includes('guru') || pos.includes('pendidik') || pos.includes('pengajar')) return roleList.find((r) => r === 'Guru') || 'Guru'
  if (pos.includes('keuangan') || pos.includes('bendahara') || pos.includes('kasir')) return roleList.find((r) => r === 'Kasir / Keuangan') || 'Kasir / Keuangan'
  if (pos.includes('bk') || pos.includes('konselor')) return roleList.find((r) => r === 'Konselor / BK') || 'Konselor / BK'
  if (pos.includes('pustakawan') || pos.includes('perpustakaan')) return roleList.find((r) => r === 'Pustakawan') || 'Pustakawan'
  if (pos.includes('tu') || pos.includes('tata usaha') || pos.includes('staf')) return roleList.find((r) => r === 'Tata Usaha') || 'Tata Usaha'
  return roleList.find((r) => r === 'Guru') || roleList[0] || 'Guru'
}

// ─────────────────────────────────────────────────────────────────
// MODAL PEGAWAI ROLE & HAK AKSES FORM
// ─────────────────────────────────────────────────────────────────
function PegawaiRoleModal({
  isOpen,
  onClose,
  onSubmit,
  employee = null,
  availableRoles = [],
  allPermissions = [],
  isSubmitting = false,
  userIsSuperAdmin = false,
}) {
  const [roleName, setRoleName] = useState('')
  const [selectedPerms, setSelectedPerms] = useState([])
  const [password, setPassword] = useState('')

  // Check if current employee holds protected system roles
  const isProtectedEmployee =
    employee?.primary_role === 'Super Admin' ||
    employee?.primary_role === 'Admin' ||
    employee?.is_super_admin

  React.useEffect(() => {
    if (isOpen && employee) {
      const initialRole = getSmartDefaultRole(employee, availableRoles)
      setRoleName(initialRole)
      setSelectedPerms((employee.direct_permissions || []).filter((permission) => allPermissions.includes(permission)))
      setPassword('')
    }
  }, [isOpen, employee, availableRoles, allPermissions])

  if (!isOpen || !employee) return null

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit({
      employeeId: employee.id,
      payload: {
        role_name: roleName,
        permissions: selectedPerms,
        ...(password.trim() ? { password: password.trim() } : {}),
      },
    })
  }

  const togglePerm = (perm) => {
    setSelectedPerms((prev) =>
      prev.includes(perm) ? prev.filter((p) => p !== perm) : [...prev, perm]
    )
  }

  // Kelompokkan permissions berdasarkan modul
  const grouped = allPermissions.reduce((acc, p) => {
    const modul = p.split('.')[0] || 'lainnya'
    if (!acc[modul]) acc[modul] = []
    acc[modul].push(p)
    return acc
  }, {})

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
      <div className="my-6 w-full max-w-2xl overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-100 bg-white px-7 py-5">
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full">
              PENETAPAN HAK AKSES PEGAWAI
            </span>
            <h2 className="text-xl font-black text-[#0f172a] mt-1">{employee.nama_lengkap}</h2>
            <p className="text-xs text-slate-600 font-medium mt-0.5">
              NIY/NIP: {employee.niy || '-'} | Jabatan: {employee.position?.nama || '-'} | Unit: {employee.unit?.nama || '-'}
            </p>
          </div>
          <button type="button" onClick={onClose} className="rounded-full p-2 text-slate-400 hover:bg-slate-200 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-7 space-y-5 max-h-[75vh] overflow-y-auto">
          {/* Protected System Role Warning */}
          {isProtectedEmployee && (
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-300 text-amber-900 flex items-center gap-3 text-xs font-extrabold shadow-xs">
              <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0" />
              <div>
                <p className="font-black text-amber-950">Role Proteksi Sistem ({employee.primary_role})</p>
                <p className="text-[11px] font-medium text-amber-800 mt-0.5">
                  Hak akses role Super Admin &amp; Admin dilindungi secara ketat oleh sistem dan tidak dapat diubah dari menu penetapan pegawai.
                </p>
              </div>
            </div>
          )}

          {/* Status Akun */}
          <div className={`p-4 rounded-2xl border flex items-center justify-between ${employee.has_user ? 'bg-emerald-50/80 border-emerald-200' : 'bg-amber-50/80 border-amber-200'}`}>
            <div className="flex items-center gap-3">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${employee.has_user ? 'bg-emerald-600 text-white' : 'bg-amber-500 text-white'}`}>
                {employee.has_user ? <UserCheck className="w-4 h-4" /> : <UserX className="w-4 h-4" />}
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900">
                  {employee.has_user ? `Akun Terhubung (${employee.user_email || 'Aktif'})` : 'Belum Memiliki Akun User'}
                </p>
                <p className="text-[11px] text-slate-500">
                  {employee.has_user ? 'Role dan permission akan disinkronkan langsung ke akun pengguna ini.' : 'Sistem akan otomatis membuat akun login untuk pegawai ini.'}
                </p>
              </div>
            </div>
          </div>

          {!employee.has_user && (
            <div>
              <label className="block text-xs font-bold text-[#0f172a] mb-1">
                Password Awal Akun <span className="text-slate-400 font-normal">(Opsional, default: 12345678)</span>
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Masukkan password awal untuk login..."
                className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-800 shadow-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-emerald-600"
              />
            </div>
          )}

          {/* Pilihan Role Utama */}
          <div>
            <label className="block text-xs font-bold text-[#0f172a] mb-1.5 flex items-center justify-between">
              <span>Pilih Role Utama Pegawai <span className="text-rose-500">*</span></span>
              {isProtectedEmployee && (
                <span className="inline-flex items-center gap-1 text-[10px] font-black text-amber-700 bg-amber-100 px-2 py-0.5 rounded-md">
                  <Lock className="w-3 h-3" /> Terkunci (Tidak Bisa Diubah)
                </span>
              )}
            </label>
            <select
              value={roleName}
              onChange={(e) => setRoleName(e.target.value)}
              required
              disabled={isProtectedEmployee || availableRoles.length === 0}
              className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-semibold text-slate-800 shadow-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-emerald-600 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500 cursor-pointer"
            >
              <option value="">
                {availableRoles.length === 0 ? 'Tidak ada role yang dapat ditetapkan' : 'Pilih role utama pegawai'}
              </option>
              {availableRoles.map((r) => {
                const isProtectedRole = r === 'Super Admin' || r === 'Admin'
                return (
                  <option
                    key={r}
                    value={r}
                    disabled={isProtectedRole && !userIsSuperAdmin}
                  >
                    {r} {isProtectedRole ? '🔒 (Proteksi Admin System)' : ''}
                  </option>
                )
              })}
            </select>
            {availableRoles.length === 0 && (
              <p className="mt-1.5 text-[11px] text-amber-600 font-medium">
                Daftar role belum tersedia. Pastikan role sudah dibuat di tab Role atau hubungi administrator sistem.
              </p>
            )}
          </div>

          {/* Direct Custom Permissions */}
          <div>
            <label className="block text-xs font-bold text-[#0f172a] mb-2">
              Izin Akses Tambahan Khusus (Direct Permissions) <span className="text-slate-400 font-normal">({selectedPerms.length} dipilih)</span>
            </label>
            <div className="space-y-3 max-h-56 overflow-y-auto rounded-2xl border border-slate-200/90 p-4 bg-[#f8fafc]">
              {Object.entries(grouped).map(([modul, perms]) => (
                <div key={modul} className="rounded-xl border border-slate-200 bg-white p-3">
                  <span className="text-[11px] font-extrabold text-slate-700 tracking-wider block mb-2">
                    {getModulLabel(modul)} <span className="text-[10px] text-slate-400 font-normal">({modul})</span>
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {perms.map((perm) => (
                      <label key={perm} className="flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedPerms.includes(perm)}
                          onChange={() => togglePerm(perm)}
                          disabled={isProtectedEmployee}
                          className="w-3.5 h-3.5 rounded text-[#054e3b] focus:ring-[#054e3b] border-slate-300 disabled:opacity-40"
                        />
                        <span
                          className={`text-[11px] px-2 py-0.5 rounded-full font-medium border ${
                            selectedPerms.includes(perm)
                              ? 'bg-[#dcfce7] text-[#15803d] border-emerald-200'
                              : 'bg-slate-100 text-slate-600 border-slate-200'
                          }`}
                          title={perm}
                        >
                          {getPermissionLabel(perm)}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between border-t border-slate-100 pt-4">
            <button type="button" onClick={onClose} className="rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors">
              Batal
            </button>
            <button type="submit" disabled={isSubmitting || isProtectedEmployee} className="flex items-center gap-1.5 rounded-xl bg-emerald-800 px-6 py-2.5 text-xs font-semibold text-white shadow-md shadow-emerald-800/20 transition-all hover:bg-emerald-900 disabled:opacity-50">
              <Save className="w-3.5 h-3.5" />
              <span>{isSubmitting ? 'Menyimpan...' : 'Simpan Hak Akses Pegawai'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

const ROLE_GROUPS = {
  executive: {
    id: 'executive',
    label: 'Manajemen & Eksekutif',
    description: 'Akses tingkat pengambil keputusan & administrator',
    badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    roles: ['Super Admin', 'Admin', 'Pengurus Yayasan', 'Kepala Sekolah', 'Divisi Pendidikan'],
  },
  pendidik: {
    id: 'pendidik',
    label: 'Tenaga Pendidik & Pengajar',
    description: 'Guru, wali kelas, guru tahfizh, dan pembina asrama',
    badgeColor: 'bg-teal-100 text-teal-800 border-teal-300',
    roles: ['Guru', 'Wali Kelas', 'Guru Tahfizh', 'Musyrif', 'Musyrif Asrama'],
  },
  kependidikan: {
    id: 'kependidikan',
    label: 'Staf & Tenaga Kependidikan',
    description: 'Staf administrasi TU, keuangan, perpustakaan, BK, dan LMS',
    badgeColor: 'bg-sky-100 text-sky-800 border-sky-300',
    roles: ['Tata Usaha', 'Konselor / BK', 'Pustakawan', 'Operator LMS', 'Kasir / Keuangan'],
  },
  portal: {
    id: 'portal',
    label: 'Portal Pengguna (Siswa & Ortu)',
    description: 'Akses portal mandiri untuk siswa dan orang tua murid',
    badgeColor: 'bg-violet-100 text-violet-800 border-violet-300',
    roles: ['Siswa', 'Orang Tua'],
  },
  custom: {
    id: 'custom',
    label: 'Role Custom / Tambahan',
    description: 'Role kustom yang ditambahkan secara khusus oleh administrator',
    badgeColor: 'bg-amber-100 text-amber-800 border-amber-300',
    roles: [],
  },
}

const getRoleCategoryGroup = (roleName) => {
  if (!roleName) return ROLE_GROUPS.custom
  for (const groupObj of Object.values(ROLE_GROUPS)) {
    if (groupObj.roles.includes(roleName)) {
      return groupObj
    }
  }
  return ROLE_GROUPS.custom
}

// ─────────────────────────────────────────────────────────────────
// HALAMAN UTAMA
// ─────────────────────────────────────────────────────────────────
export default function MasterHakAksesPage() {
  const queryClient = useQueryClient()
  const user = useAuthStore((state) => state.user)
  const userRoles = user?.roles || (user?.role ? [user.role] : [])
  const canManageGlobalAccess = isGlobalAccessManager(userRoles)
  const canManageUnitAccess = isUnitAccessManager(userRoles)
  const canManageAccess = canManageGlobalAccess || canManageUnitAccess

  // Kepala Sekolah & Divisi Pendidikan: hanya bisa kelola unit sendiri
  const isUnitScopeOnly = canManageUnitAccess && !canManageGlobalAccess

  // Daftar tier yang bisa diedit oleh pengguna yang sedang login
  const editableTierIds = new Set(
    getEditableTiers(userRoles).map(({ tier }) => tier.id)
  )

  const [activeTab, setActiveTab] = useState('roles')
  const [roleCategoryFilter, setRoleCategoryFilter] = useState('semua')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [selectedUnitId, setSelectedUnitId] = useState('')

  // Role modal
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false)
  const [selectedRole, setSelectedRole] = useState(null)

  // Permission modal
  const [isPermModalOpen, setIsPermModalOpen] = useState(false)

  // Pegawai Hak Akses modal
  const [isPegawaiModalOpen, setIsPegawaiModalOpen] = useState(false)
  const [selectedEmployee, setSelectedEmployee] = useState(null)

  // Dialog Konfirmasi CRUD
  const [deleteTargetRole, setDeleteTargetRole] = useState(null)
  const [deleteTargetPerm, setDeleteTargetPerm] = useState(null)
  const [pendingRoleData, setPendingRoleData] = useState(null)
  const [showSaveRoleConfirmModal, setShowSaveRoleConfirmModal] = useState(false)

  // Query Units
  const { data: unitsData = {} } = useQuery({
    queryKey: ['education-units-filter'],
    queryFn: () => educationUnitService.getUnits({ per_page: 100 }),
    staleTime: 60000,
  })
  const educationUnits = unitsData?.data || unitsData?.items || (Array.isArray(unitsData) ? unitsData : [])

  React.useEffect(() => {
    if (isUnitScopeOnly && !selectedUnitId) {
      if (user?.unit_id) {
        setSelectedUnitId(String(user.unit_id))
      } else if (educationUnits.length > 0) {
        setSelectedUnitId(String(educationUnits[0].id))
      }
    }
  }, [isUnitScopeOnly, user?.unit_id, educationUnits, selectedUnitId])

  // Query Stats
  const { data: stats = {} } = useQuery({
    queryKey: ['hak-akses-stats'],
    queryFn: () => hakAksesService.getStats(),
    staleTime: 30000,
  })

  // Query Roles (tab Role — terfilter pencarian)
  const { data: rolesData = {}, isLoading: isLoadingRoles } = useQuery({
    queryKey: ['hak-akses-roles', search],
    queryFn: () => hakAksesService.getDaftarRole({ search }),
    enabled: activeTab === 'roles',
    staleTime: 15000,
  })

  // Query Roles lengkap untuk modal penetapan akses (tanpa filter pencarian tab)
  const { data: allRolesData = {} } = useQuery({
    queryKey: ['hak-akses-roles-all'],
    queryFn: () => hakAksesService.getDaftarRole({}),
    enabled: canManageAccess,
    staleTime: 60000,
  })

  // Query Permissions (tab Izin — terfilter pencarian)
  const { data: permData = {}, isLoading: isLoadingPerms } = useQuery({
    queryKey: ['hak-akses-permissions', search],
    queryFn: () => hakAksesService.getDaftarPermission({ search }),
    enabled: activeTab === 'permissions',
    staleTime: 15000,
  })

  // Query Permissions lengkap untuk modal penetapan akses
  const { data: allPermData = {} } = useQuery({
    queryKey: ['hak-akses-permissions-all'],
    queryFn: () => hakAksesService.getDaftarPermission({}),
    enabled: canManageAccess,
    staleTime: 60000,
  })

  // Query Pegawai (Menarik Data Pegawai Berdasarkan Unit)
  const { data: pegawaiData = {}, isLoading: isLoadingPegawai } = useQuery({
    queryKey: ['hak-akses-pegawai', search, page, selectedUnitId],
    queryFn: () => hakAksesService.getPegawaiHakAkses({ search, page, unit_id: selectedUnitId }),
    enabled: activeTab === 'pegawai',
    staleTime: 15000,
  })


  const backendRoles = rolesData?.data || []
  const allRoleRecords = allRolesData?.data || backendRoles
  const backendRoleNames = allRoleRecords.map((r) => (typeof r === 'string' ? r : r?.name || '')).filter(Boolean)
  const availableRoleNames = Array.from(new Set([...PROJECT_DEFAULT_ROLES, ...backendRoleNames]))
  const assignableRoleNames = canManageGlobalAccess
    ? availableRoleNames
    : availableRoleNames.filter((name) => !hasAnyRole([name], GLOBAL_ROLE_NAMES))

  const permissionsGrouped = permData?.data || []
  const allPerms = permData?.flat_list || allPermData?.flat_list || []
  const allPermsForAssignment = allPermData?.flat_list || allPerms
  const assignablePerms = canManageGlobalAccess
    ? allPermsForAssignment
    : allPermsForAssignment.filter((permission) => !GLOBAL_ACCESS_PERMISSIONS.includes(permission))

  // Construct complete roles list combining backend DB roles & pre-seeded default project roles
  const dbRoleNamesSet = new Set(backendRoles.map((r) => r.name))
  const defaultSeededRoles = PROJECT_DEFAULT_ROLES.filter(
    (name) => !dbRoleNamesSet.has(name)
  ).map((name) => {
    const defaultPerms = applyRoleDefaultPermissions(name, allPerms)
    return {
      id: `default-${name}`,
      name,
      guard_name: 'web',
      permissions: defaultPerms,
      jumlah_izin: defaultPerms.length,
      jumlah_pengguna: 0,
      is_default_preset: true,
    }
  })

  const mergedAllRoles = [...backendRoles, ...defaultSeededRoles]

  const filteredRoles = mergedAllRoles.filter((r) => {
    if (search && !r.name.toLowerCase().includes(search.toLowerCase())) return false
    if (roleCategoryFilter !== 'semua') {
      const cat = getRoleCategoryGroup(r.name)
      if (cat.id !== roleCategoryFilter) return false
    }
    return true
  })

  const listPegawai = pegawaiData?.data || []
  const metaPegawai = pegawaiData?.meta || {}

  // Mutations Role
  const tambahRoleMutation = useMutation({
    mutationFn: (payload) => hakAksesService.tambahRole(payload),
    onSuccess: (res) => {
      queryClient.invalidateQueries(['hak-akses-roles'])
      queryClient.invalidateQueries(['hak-akses-roles-all'])
      queryClient.invalidateQueries(['hak-akses-stats'])
      setIsRoleModalOpen(false)
      Swal.fire({ icon: 'success', title: 'Berhasil!', text: res?.message, timer: 2000, showConfirmButton: false })
    },
    onError: (err) => Swal.fire('Error', err.response?.data?.message || 'Gagal menyimpan role.', 'error'),
  })

  const ubahRoleMutation = useMutation({
    mutationFn: ({ id, payload }) => hakAksesService.ubahRole({ id, payload }),
    onSuccess: (res) => {
      queryClient.invalidateQueries(['hak-akses-roles'])
      queryClient.invalidateQueries(['hak-akses-roles-all'])
      setIsRoleModalOpen(false)
      setSelectedRole(null)
      Swal.fire({ icon: 'success', title: 'Berhasil!', text: res?.message, timer: 2000, showConfirmButton: false })
    },
    onError: (err) => Swal.fire('Error', err.response?.data?.message || 'Gagal memperbarui role.', 'error'),
  })

  const hapusRoleMutation = useMutation({
    mutationFn: (id) => hakAksesService.hapusRole(id),
    onSuccess: (res) => {
      queryClient.invalidateQueries(['hak-akses-roles'])
      queryClient.invalidateQueries(['hak-akses-roles-all'])
      queryClient.invalidateQueries(['hak-akses-stats'])
      Swal.fire({ icon: 'success', title: 'Terhapus!', text: res?.message, timer: 2000, showConfirmButton: false })
    },
    onError: (err) => Swal.fire('Gagal!', err.response?.data?.message || 'Gagal menghapus role.', 'error'),
  })

  // Mutations Permission
  const tambahPermMutation = useMutation({
    mutationFn: (payload) => hakAksesService.tambahPermission(payload),
    onSuccess: (res) => {
      queryClient.invalidateQueries(['hak-akses-permissions'])
      queryClient.invalidateQueries(['hak-akses-permissions-all'])
      queryClient.invalidateQueries(['hak-akses-stats'])
      setIsPermModalOpen(false)
      Swal.fire({ icon: 'success', title: 'Berhasil!', text: res?.message, timer: 2000, showConfirmButton: false })
    },
    onError: (err) => Swal.fire('Error', err.response?.data?.message || 'Gagal menyimpan izin akses.', 'error'),
  })

  const hapusPermMutation = useMutation({
    mutationFn: (id) => hakAksesService.hapusPermission(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['hak-akses-permissions'])
      queryClient.invalidateQueries(['hak-akses-permissions-all'])
      queryClient.invalidateQueries(['hak-akses-stats'])
      Swal.fire({ icon: 'success', title: 'Terhapus!', timer: 1500, showConfirmButton: false })
    },
    onError: (err) => Swal.fire('Gagal!', err.response?.data?.message || 'Gagal menghapus izin.', 'error'),
  })

  // Mutation Pegawai Hak Akses
  const assignPegawaiRoleMutation = useMutation({
    mutationFn: ({ employeeId, payload }) => hakAksesService.assignPegawaiRole({ employeeId, payload }),
    onSuccess: (res) => {
      queryClient.invalidateQueries(['hak-akses-pegawai'])
      queryClient.invalidateQueries(['hak-akses-roles'])
      queryClient.invalidateQueries(['hak-akses-roles-all'])
      queryClient.invalidateQueries(['hak-akses-stats'])
      setIsPegawaiModalOpen(false)
      setSelectedEmployee(null)
      Swal.fire({ icon: 'success', title: 'Berhasil!', text: res?.message, timer: 2000, showConfirmButton: false })
    },
    onError: (err) => Swal.fire('Error', err.response?.data?.message || 'Gagal memperbarui hak akses pegawai.', 'error'),
  })

  // Handlers
  const handleOpenCreateRole = () => {
    if (!canManageGlobalAccess) return
    setSelectedRole(null)
    setIsRoleModalOpen(true)
  }

  const handleRoleSubmit = (formData) => {
    if (!canManageGlobalAccess) return
    setPendingRoleData(formData)
    setShowSaveRoleConfirmModal(true)
  }

  const handleConfirmSaveRole = () => {
    if (!pendingRoleData) return
    if (selectedRole?.id && !String(selectedRole.id).startsWith('default-')) {
      ubahRoleMutation.mutate({ id: selectedRole.id, payload: pendingRoleData })
    } else {
      tambahRoleMutation.mutate(pendingRoleData)
    }
    setShowSaveRoleConfirmModal(false)
  }

  const handleOpenEditRole = async (role) => {
    const { allowed } = canEditRole(userRoles, role.name)
    if (!allowed) return
    if (role?.id && !String(role.id).startsWith('default-')) {
      try {
        const detail = await hakAksesService.getDetailRole(role.id)
        setSelectedRole(detail)
        setIsRoleModalOpen(true)
      } catch {
        setSelectedRole(role)
        setIsRoleModalOpen(true)
      }
    } else {
      setSelectedRole(role)
      setIsRoleModalOpen(true)
    }
  }

  const handleDeleteRole = (role) => {
    const { allowed } = canEditRole(userRoles, role.name)
    const tier = getTierForRole(role.name)
    if (!allowed || tier?.isProtected) return
    setDeleteTargetRole(role)
  }

  const handleConfirmDeleteRole = () => {
    if (deleteTargetRole) {
      hapusRoleMutation.mutate(deleteTargetRole.id, {
        onSettled: () => setDeleteTargetRole(null),
      })
    }
  }

  const handleDeletePerm = (perm) => {
    if (!canManageGlobalAccess) return
    setDeleteTargetPerm(perm)
  }

  const handleConfirmDeletePerm = () => {
    if (deleteTargetPerm) {
      hapusPermMutation.mutate(deleteTargetPerm.id, {
        onSettled: () => setDeleteTargetPerm(null),
      })
    }
  }

  const handleOpenPegawaiModal = (employee) => {
    setSelectedEmployee(employee)
    setIsPegawaiModalOpen(true)
  }

  const isRoleSubmitting = tambahRoleMutation.isPending || ubahRoleMutation.isPending
  const isPermSubmitting = tambahPermMutation.isPending
  const isPegawaiSubmitting = assignPegawaiRoleMutation.isPending

  const tabConfig = {
    roles: {
      label: 'Role Access',
      description: 'Kelompok akses pengguna',
      icon: Shield,
      count: stats.total_role ?? 0,
      search: 'Cari nama role...',
      activeColor: 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30',
      inactiveColor: 'bg-emerald-100/90 text-emerald-700 hover:bg-emerald-600 hover:text-white dark:bg-emerald-950/60 dark:text-emerald-300 dark:hover:bg-emerald-600 dark:hover:text-white hover:shadow-md hover:shadow-emerald-600/30',
    },
    permissions: {
      label: 'Izin Akses',
      description: 'Aksi yang dapat dilakukan',
      icon: Key,
      count: stats.total_permission ?? 0,
      search: 'Cari modul atau izin akses...',
      activeColor: 'bg-sky-600 text-white shadow-md shadow-sky-600/30',
      inactiveColor: 'bg-sky-100/90 text-sky-700 hover:bg-sky-600 hover:text-white dark:bg-sky-950/60 dark:text-sky-300 dark:hover:bg-sky-600 dark:hover:text-white hover:shadow-md hover:shadow-sky-600/30',
    },
    pegawai: {
      label: 'Akses Pegawai',
      description: 'Role setiap anggota tim',
      icon: UserCheck,
      count: metaPegawai.total ?? '—',
      search: 'Cari nama, NIY, atau email pegawai...',
      activeColor: 'bg-violet-600 text-white shadow-md shadow-violet-600/30',
      inactiveColor: 'bg-violet-100/90 text-violet-700 hover:bg-violet-600 hover:text-white dark:bg-violet-950/60 dark:text-violet-300 dark:hover:bg-violet-600 dark:hover:text-white hover:shadow-md hover:shadow-violet-600/30',
    },
    akun: {
      label: 'Akun Login',
      description: 'CRUD akun, role, status, dan password',
      icon: UserCog,
      count: '—',
      search: 'Pencarian tersedia pada tabel akun...',
      activeColor: 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30',
      inactiveColor: 'bg-indigo-100/90 text-indigo-700 hover:bg-indigo-600 hover:text-white dark:bg-indigo-950/60 dark:text-indigo-300 dark:hover:bg-indigo-600 dark:hover:text-white hover:shadow-md hover:shadow-indigo-600/30',
    },
  }

  const activeTabConfig = tabConfig[activeTab] || tabConfig.roles
  const ActiveTabIcon = activeTabConfig.icon

  return (
    <PageContainer maxW="7xl">
      <AppBreadcrumb items={[{ label: 'Master Data', href: '/dashboard' }, { label: 'Hak Akses & Role' }]} className="mb-4" />
      <MasterDataPage hideBreadcrumb>
      {/* MODERN HERO CARD HEADER (MATCHING PORTAL STYLE) */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="mb-6">
        <div className="relative overflow-hidden rounded-[22px] border-2 border-emerald-500/30 bg-gradient-to-r from-emerald-500/15 via-teal-500/10 to-emerald-600/15 p-5 sm:p-6 shadow-md shadow-emerald-500/10 dark:border-emerald-600/40 dark:bg-gradient-to-r dark:from-emerald-950/70 dark:via-teal-950/50 dark:to-slate-900">
          <div className="pointer-events-none absolute -top-12 -right-12 h-48 w-48 rounded-full bg-gradient-to-br from-emerald-500/30 via-teal-400/20 to-transparent blur-3xl" />
          <div className="pointer-events-none absolute -bottom-12 -left-12 h-48 w-48 rounded-full bg-gradient-to-tr from-teal-500/20 via-emerald-400/20 to-transparent blur-3xl" />

          <div className="relative z-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex size-12 sm:size-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700 text-white shadow-xl shadow-emerald-600/40 border border-emerald-300/40 dark:from-emerald-400 dark:via-emerald-500 dark:to-teal-600">
                <ShieldCheck className="size-6 sm:size-7 text-white" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-emerald-600 to-teal-600 px-3.5 py-1 text-xs font-extrabold text-white shadow-md shadow-emerald-600/30">
                    <Sparkles className="size-3 text-amber-300 animate-pulse" />
                    Manajemen Hak Akses & Matriks Role
                  </span>
                  <span className="inline-flex items-center rounded-full bg-emerald-100 px-3 py-0.5 text-xs font-bold text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/60">
                    {stats.total_role ?? 0} Role / {stats.total_permission ?? 0} Izin
                  </span>
                </div>
                <h1 className="mt-1.5 text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                  Manajemen Hak Akses & Matriks Role
                </h1>
                <p className="mt-0.5 text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-300 max-w-2xl">
                  Atur hak akses pengguna, role penugasan pegawai, serta kontrol permission sistem secara terpusat.
                </p>
              </div>
            </div>

            {canManageGlobalAccess && (
              <div className="flex items-center gap-2.5 shrink-0 z-10">
                <button
                  type="button"
                  onClick={() => { setActiveTab('permissions'); setIsPermModalOpen(true) }}
                  className="flex items-center gap-2 rounded-2xl bg-sky-100/90 text-sky-700 hover:bg-sky-600 hover:text-white dark:bg-sky-950/60 dark:text-sky-300 dark:hover:bg-sky-600 dark:hover:text-white px-4 py-2.5 text-xs font-extrabold transition-all duration-200 hover:shadow-md hover:shadow-sky-600/30 cursor-pointer"
                >
                  <Key className="size-4" />
                  <span>Tambah Izin</span>
                </button>
                <button
                  type="button"
                  onClick={() => { setActiveTab('roles'); handleOpenCreateRole() }}
                  className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white hover:from-emerald-700 hover:to-teal-700 px-4 py-2.5 text-xs font-extrabold transition-all duration-200 shadow-md shadow-emerald-600/30 cursor-pointer"
                >
                  <Plus className="size-4" />
                  <span>Tambah Role</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <MasterStatsGrid>
        <MasterStatCard icon={Shield} label="ROLE AKTIF" value={stats.total_role ?? 0} description="Kelompok akses" variant="success" />
        <MasterStatCard icon={Key} label="IZIN TERSEDIA" value={stats.total_permission ?? 0} description="Aksi terdaftar" variant="info" />
        <MasterStatCard icon={Layers} label="MODUL TERLINDUNGI" value={stats.total_modul ?? 0} description="Area sistem" variant="warning" />
        <MasterStatCard icon={Users} label="BELUM DIGUNAKAN" value={stats.role_tanpa_user ?? 0} description="Role tanpa pengguna" variant="neutral" />
      </MasterStatsGrid>

      {/* ───── Soft Pastel Tab Bar ───── */}
      <nav className="rounded-[18px] border border-slate-200/80 bg-white p-3.5 shadow-xs dark:border-slate-800 dark:bg-[#1B2433] mb-6">
        <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
          {Object.entries(tabConfig).map(([key, tab]) => {
            const TabIcon = tab.icon
            const isActive = activeTab === key
            return (
              <motion.button
                key={key}
                type="button"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => { setActiveTab(key); setSearch(''); setPage(1) }}
                className={`flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-extrabold transition-all duration-200 cursor-pointer ${
                  isActive ? tab.activeColor : tab.inactiveColor
                }`}
              >
                <TabIcon className="size-4 shrink-0" />
                <span>{tab.label}</span>
                <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${isActive ? 'bg-white/20 text-white' : 'bg-slate-200/80 text-slate-700 dark:bg-slate-800 dark:text-slate-300'}`}>
                  {tab.count}
                </span>
              </motion.button>
            )
          })}
        </div>
      </nav>

      {/* ───── Content toolbar ───── */}
      {activeTab !== 'akun' && (
        <section className="relative overflow-hidden rounded-[22px] border-2 border-emerald-500/25 bg-white p-5 shadow-md shadow-emerald-500/5 dark:border-emerald-600/35 dark:bg-[#1B2433]">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <ActiveTabIcon className="h-4 w-4 text-emerald-700" />
            <div>
              <h2 className="text-sm font-bold text-slate-800">{activeTabConfig.label}</h2>
              <p className="text-[11px] text-slate-400">{activeTabConfig.description}</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
            {activeTab === 'pegawai' && educationUnits.length > 0 && (
              <div className="relative min-w-[200px]">
                {isUnitScopeOnly ? (
                  // Kepala Sekolah / Divisi: unit dikunci ke unit sendiri
                  <div className="flex items-center gap-2 min-h-10 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-700">
                    <Lock className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">
                      {educationUnits.find((u) => String(u.id) === String(selectedUnitId))?.name
                        || educationUnits.find((u) => String(u.id) === String(user?.unit_id))?.name
                        || 'Unit Anda'}
                    </span>
                    <span className="text-[10px] text-amber-500 ml-auto shrink-0">Terkunci</span>
                  </div>
                ) : (
                  <select
                    value={selectedUnitId}
                    onChange={(e) => { setSelectedUnitId(e.target.value); setPage(1) }}
                    className="min-h-10 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-sm outline-none transition-all focus:border-transparent focus:ring-2 focus:ring-emerald-600"
                  >
                    <option value="">Semua Unit Pendidikan</option>
                    {educationUnits.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.name || u.nama_unit || u.code}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            )}
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs w-4 h-4" />
              <input
                type="text"
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1) }}
                placeholder={activeTabConfig.search}
                aria-label={activeTabConfig.search}
                className="min-h-10 w-full rounded-xl border border-slate-200 bg-white pl-9 pr-9 text-xs font-semibold text-slate-700 shadow-sm outline-none transition-all placeholder:text-slate-400 focus:border-transparent focus:ring-2 focus:ring-emerald-600"
              />
              {search && (
                <button type="button" onClick={() => setSearch('')} aria-label="Hapus pencarian" className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700">
                  <X className="h-3 w-3" />
                </button>
              )}
            </div>
          </div>
        </div>
      </section>
      )}

      {/* ───── TAB: ROLES ───── */}
      {activeTab === 'roles' && (
        <div className="space-y-4">
          {/* Sub-Nav Filter Kelompok Role */}
          <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-slate-200/80 bg-white p-3.5 shadow-xs dark:border-slate-800 dark:bg-[#1B2433]">
            <span className="text-xs font-black text-slate-800 dark:text-slate-200 mr-1 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-emerald-600" />
              Kelompok Role:
            </span>
            <button
              type="button"
              onClick={() => setRoleCategoryFilter('semua')}
              className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                roleCategoryFilter === 'semua'
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-600/30'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
              }`}
            >
              Semua Role ({mergedAllRoles.length})
            </button>
            {Object.entries(ROLE_GROUPS).map(([key, group]) => {
              const count = mergedAllRoles.filter((r) => getRoleCategoryGroup(r.name).id === key).length
              if (count === 0 && key === 'custom') return null
              const isSelected = roleCategoryFilter === key
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => setRoleCategoryFilter(key)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-600/30'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
                  }`}
                >
                  {group.label} ({count})
                </button>
              )
            })}
          </div>

          {/* Table Container */}
          <div className="w-full overflow-x-auto rounded-2xl border border-slate-200/80 bg-white shadow-sm">
            <table className="w-full min-w-[780px] border-collapse text-left text-slate-800">
              <thead>
                <tr className="border-b border-slate-200/80 bg-slate-50/80 text-[10px] font-black uppercase tracking-[0.12em] text-slate-500">
                  <th className="py-3.5 px-4 w-10 text-center">NO</th>
                  <th className="py-3.5 px-4">NAMA ROLE &amp; KELOMPOK</th>
                  <th className="py-3.5 px-4 text-center">TIER &amp; SCOPE</th>
                  <th className="py-3.5 px-4 text-center">JUMLAH IZIN</th>
                  <th className="py-3.5 px-4 text-center">PENGGUNA</th>
                  <th className="py-3.5 px-4">IZIN AKSES (PREVIEW)</th>
                  <th className="py-3.5 px-4 text-center w-28">AKSI</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {isLoadingRoles ? (
                  <tr><td colSpan={7} className="py-16 text-center text-slate-400 text-xs font-medium">Memuat daftar role...</td></tr>
                ) : filteredRoles.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-16 text-center">
                      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700"><Shield className="h-5 w-5" /></div>
                      <p className="mt-3 text-sm font-extrabold text-slate-800">{search || roleCategoryFilter !== 'semua' ? 'Role tidak ditemukan' : 'Belum ada role'}</p>
                      <p className="mt-1 text-xs text-slate-400">Coba atur filter pencarian atau kelompok role yang berbeda.</p>
                    </td>
                  </tr>
                ) : filteredRoles.map((role, idx) => {
                  const categoryGroup = getRoleCategoryGroup(role.name)
                  return (
                    <tr key={role.id || role.name} className="group hover:bg-emerald-50/30 transition-colors">
                      <td className="py-3.5 px-4 text-center text-xs font-bold text-slate-500">{idx + 1}</td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2.5">
                          {(() => {
                            const tier = getTierForRole(role.name)
                            const colors = tier ? (TIER_COLOR_MAP[tier.color] || TIER_COLOR_MAP.gray) : TIER_COLOR_MAP.gray
                            return (
                              <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${colors.bg}`}>
                                <Shield className={`w-3.5 h-3.5 ${colors.text}`} />
                              </div>
                            )
                          })()}
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-extrabold text-slate-900 text-sm">{role.name}</p>
                              {role.is_default_preset && (
                                <span className="inline-flex items-center text-[9px] font-extrabold text-teal-800 bg-teal-50 border border-teal-200 px-1.5 py-0.5 rounded-md">
                                  Default Project
                                </span>
                              )}
                            </div>
                            <div className="mt-0.5">
                              <span className={`inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded-full border ${categoryGroup.badgeColor}`}>
                                {categoryGroup.label}
                              </span>
                            </div>
                          </div>
                        </div>
                      </td>
                      {/* KOLOM TIER & SCOPE */}
                      <td className="py-3.5 px-4 text-center">
                        {(() => {
                          const tier = getTierForRole(role.name)
                          if (!tier) return <span className="text-[10px] italic text-slate-400">–</span>
                          const colors = TIER_COLOR_MAP[tier.color] || TIER_COLOR_MAP.gray
                          const scopeInfo = SCOPE_LABEL[tier.scope] || SCOPE_LABEL.global
                          return (
                            <div className="flex flex-col items-center gap-1">
                              <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border ${colors.bg} ${colors.text} ${colors.border}`}>
                                {tier.label}
                              </span>
                              <span className={`inline-flex items-center gap-1 text-[9px] font-semibold px-1.5 py-0.5 rounded-full border ${scopeInfo.bg} ${scopeInfo.textCls} ${scopeInfo.border}`}>
                                {scopeInfo.text}
                              </span>
                              {tier.isProtected && (
                                <span className="inline-flex items-center gap-0.5 text-[9px] font-bold text-red-600 bg-red-50 border border-red-200 px-1.5 py-0.5 rounded-full">
                                  <Lock className="w-2.5 h-2.5" /> Dilindungi
                                </span>
                              )}
                            </div>
                          )
                        })()}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span className="inline-flex items-center gap-1 font-extrabold text-xs text-[#1d4ed8] bg-[#dbeafe] border border-blue-200 px-2.5 py-1 rounded-lg">
                          <Key className="w-3 h-3" />
                          {role.permissions?.length ?? role.jumlah_izin ?? 0}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span className="inline-flex items-center gap-1 font-extrabold text-xs text-slate-700 bg-slate-100 px-2.5 py-1 rounded-lg">
                          <Users className="w-3 h-3 text-slate-400" />
                          {role.jumlah_pengguna ?? 0}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex flex-wrap gap-1">
                          {(role.permissions || []).slice(0, 4).map((p) => (
                            <span key={p} className="text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full" title={p}>
                              {getPermissionLabel(p)}
                            </span>
                          ))}
                          {(role.permissions || []).length > 4 && (
                            <span className="text-[10px] font-bold bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded-full">
                              +{role.permissions.length - 4} lainnya
                            </span>
                          )}
                          {(role.permissions || []).length === 0 && <span className="text-[11px] italic text-slate-400">Belum ada izin</span>}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        {(() => {
                          const { allowed } = canEditRole(userRoles, role.name)
                          const tier = getTierForRole(role.name)
                          const isProtected = tier?.isProtected || false
                          if (!allowed) {
                            return (
                              <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-slate-400">
                                <Lock className="w-3 h-3" /> Hanya lihat
                              </span>
                            )
                          }
                          return (
                            <div className="flex items-center justify-center gap-1.5">
                              <button
                                onClick={() => handleOpenEditRole(role)}
                                className="flex h-8 w-8 items-center justify-center rounded-lg border border-amber-200 bg-[#fffbe6] text-[#d97706] hover:bg-amber-100 transition-colors"
                                title="Edit Permission Matriks Role ini"
                              >
                                <Pencil className="w-3.5 h-3.5" />
                              </button>
                              {!isProtected && !role.is_default_preset && (
                                <button
                                  onClick={() => handleDeleteRole(role)}
                                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-red-200 bg-[#fef2f2] text-[#dc2626] hover:bg-red-100 transition-colors"
                                  title="Hapus Role"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          )
                        })()}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ───── TAB: PERMISSIONS ───── */}
      {activeTab === 'permissions' && (
        <div className="grid gap-4 lg:grid-cols-2">
          {isLoadingPerms ? (
            <div className="col-span-full rounded-[22px] border border-slate-200/80 bg-white p-16 text-center text-xs font-medium text-slate-400">Memuat izin akses...</div>
          ) : permissionsGrouped.length === 0 ? (
            <div className="col-span-full rounded-[22px] border border-slate-200/80 bg-white p-16 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-700"><Key className="h-5 w-5" /></div>
              <p className="mt-3 text-sm font-extrabold text-slate-800">{search ? 'Izin tidak ditemukan' : 'Belum ada izin akses'}</p>
              <p className="mt-1 text-xs text-slate-400">{search ? 'Periksa kembali kata kunci pencarian.' : 'Tambahkan izin untuk mendefinisikan aksi di setiap modul.'}</p>
            </div>
          ) : permissionsGrouped.map((group) => (
            <div key={group.modul} className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
              {/* Header Modul */}
              <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/70 px-5 py-4">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
                    <Lock className="w-3 h-3" />
                  </div>
                  <div>
                    <span className="text-xs font-black tracking-wider text-slate-800 block">{getModulLabel(group.modul)}</span>
                    <span className="text-[10px] font-mono text-slate-400 font-normal">({group.modul})</span>
                  </div>
                </div>
                <span className="text-[11px] font-bold text-slate-500 bg-white border border-slate-200 px-2.5 py-0.5 rounded-full">
                  {group.total} izin
                </span>
              </div>
              {/* Permission List */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 p-5">
                {(group.izin || []).map((perm) => (
                  <div key={perm.id} className="group flex items-start justify-between gap-2 rounded-xl border border-slate-200/90 bg-slate-50/50 p-3 transition-all hover:border-emerald-300 hover:bg-emerald-50/40 hover:shadow-xs">
                    <div className="flex items-start gap-2 min-w-0">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-600 mt-1.5 shrink-0" />
                      <div className="min-w-0">
                        <span className="text-xs font-extrabold text-slate-800 leading-snug block truncate" title={getPermissionLabel(perm.name)}>
                          {getPermissionLabel(perm.name)}
                        </span>
                        <span className="text-[10px] font-mono text-slate-400 font-medium block truncate" title={perm.name}>
                          {perm.name}
                        </span>
                      </div>
                    </div>
                    {canManageGlobalAccess && (
                      <button
                        onClick={() => handleDeletePerm(perm)}
                        className="text-slate-300 hover:text-rose-600 transition-colors opacity-0 group-hover:opacity-100 shrink-0 p-1 rounded-md hover:bg-rose-50"
                        title="Hapus izin"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ───── TAB: HAK AKSES PEGAWAI (MENARIK DATA PEGAWAI) ───── */}
      {activeTab === 'pegawai' && (
        <div className="space-y-4">
          <div className="w-full overflow-x-auto rounded-2xl border border-slate-200/80 bg-white shadow-sm">
            <table className="w-full min-w-[900px] border-collapse text-left text-slate-800">
              <thead>
                <tr className="border-b border-slate-200/80 bg-slate-50/80 text-[10px] font-black uppercase tracking-[0.12em] text-slate-500">
                  <th className="py-3.5 px-4 w-10 text-center">NO</th>
                  <th className="py-3.5 px-4">DATA PEGAWAI</th>
                  <th className="py-3.5 px-4">JABATAN & UNIT</th>
                  <th className="py-3.5 px-4 text-center">STATUS AKUN</th>
                  <th className="py-3.5 px-4">ROLE SAAT INI</th>
                  <th className="py-3.5 px-4 text-center w-36">AKSI</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {isLoadingPegawai ? (
                  <tr><td colSpan={6} className="py-12 text-center text-slate-400 text-xs font-medium">Memuat data pegawai...</td></tr>
                ) : listPegawai.length === 0 ? (
                  <tr><td colSpan={6} className="px-4 py-16 text-center"><Users className="mx-auto h-6 w-6 text-slate-300" /><p className="mt-3 text-sm font-extrabold text-slate-800">Pegawai tidak ditemukan</p><p className="mt-1 text-xs text-slate-400">Coba gunakan nama, NIY, atau email yang berbeda.</p></td></tr>
                ) : listPegawai.map((emp, idx) => (
                  <tr key={emp.id} className="hover:bg-emerald-50/30 transition-colors">
                    <td className="py-3.5 px-4 text-center text-xs font-bold text-slate-500">
                      {((metaPegawai.current_page || 1) - 1) * (metaPegawai.per_page || 15) + idx + 1}
                    </td>
                    <td className="py-3.5 px-4">
                      <div>
                        <p className="font-extrabold text-slate-900 text-sm">{emp.nama_lengkap}</p>
                        <p className="text-[11px] text-slate-500 font-medium">NIY: {emp.niy || '-'} | Email: {emp.email || '-'}</p>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="space-y-0.5">
                        <p className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                          <Briefcase className="w-3 h-3 text-slate-400" />
                          {emp.position?.nama || '-'}
                        </p>
                        <p className="text-[11px] text-slate-500 flex items-center gap-1.5">
                          <Building className="w-3 h-3 text-slate-400" />
                          {emp.unit?.nama || '-'}
                        </p>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      {emp.has_user ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full">
                          <UserCheck className="w-3 h-3" />
                          Terhubung
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-full">
                          <UserX className="w-3 h-3" />
                          Belum Punya Akun
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      {(() => {
                        const displayRole = getSmartDefaultRole(emp, availableRoleNames)
                        const isDefault = !emp.primary_role || emp.primary_role === 'Belum Ada Role'
                        const isProtected = displayRole === 'Super Admin' || displayRole === 'Admin'
                        return (
                          <span
                            className={`inline-flex items-center gap-1 font-extrabold text-xs px-3 py-1 rounded-xl border ${
                              isProtected
                                ? 'bg-amber-100 border-amber-300 text-amber-900'
                                : isDefault
                                ? 'bg-sky-50 border-sky-200 text-sky-800'
                                : 'bg-emerald-100 border-emerald-300 text-[#054e3b]'
                            }`}
                          >
                            {isProtected ? <Lock className="w-3 h-3 text-amber-700" /> : <Shield className="w-3 h-3" />}
                            {displayRole} {isDefault ? '(Default)' : ''}
                          </span>
                        )
                      })()}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      {canManageAccess && (
                        <button
                          onClick={() => handleOpenPegawaiModal(emp)}
                          className="inline-flex min-h-9 items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3 text-xs font-bold text-emerald-800 transition-all hover:border-emerald-700 hover:bg-emerald-700 hover:text-white"
                        >
                          <UserCog className="w-3.5 h-3.5" />
                          <span>Kelola akses</span>
                          <ArrowRight className="h-2.5 w-2.5" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          {metaPegawai.last_page > 1 && (
            <div className="flex items-center justify-between bg-white rounded-2xl border border-slate-200/90 p-4 shadow-sm">
              <p className="text-xs text-slate-500 font-medium">
                Menampilkan <span className="font-bold text-slate-800">{listPegawai.length}</span> dari <span className="font-bold text-slate-800">{metaPegawai.total}</span> data pegawai
              </p>
              <div className="flex gap-2">
                <button
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(p - 1, 1))}
                  className="px-3.5 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 disabled:opacity-40 hover:bg-slate-50 transition-colors"
                >
                  Sebelumnya
                </button>
                <span className="px-3.5 py-1.5 rounded-xl bg-slate-100 text-xs font-extrabold text-slate-800">
                  {page} / {metaPegawai.last_page}
                </span>
                <button
                  disabled={page >= metaPegawai.last_page}
                  onClick={() => setPage((p) => Math.min(p + 1, metaPegawai.last_page))}
                  className="px-3.5 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 disabled:opacity-40 hover:bg-slate-50 transition-colors"
                >
                  Selanjutnya
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'akun' && (
        <div className="space-y-4">
          {educationUnits.length > 0 && (
            <div className="flex flex-col gap-2 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-2">
                <Building className="h-4 w-4 text-emerald-700" />
                <span className="text-xs font-bold text-slate-800">Filter Unit Pendidikan Akun:</span>
              </div>
              <select
                value={selectedUnitId}
                onChange={(e) => { setSelectedUnitId(e.target.value); setPage(1) }}
                className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-sm outline-none focus:ring-2 focus:ring-emerald-600"
              >
                <option value="">Semua Unit Akses Anda</option>
                {educationUnits.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name || u.nama_unit || u.code}
                  </option>
                ))}
              </select>
            </div>
          )}
          <UserAccountManagement
            roles={assignableRoleNames}
            unitId={selectedUnitId}
            canManageGlobalAccess={canManageGlobalAccess}
            canManageUnitAccess={canManageUnitAccess}
          />
        </div>
      )}

      {/* ───── Modals ───── */}
      <RoleFormModal
        isOpen={isRoleModalOpen}
        onClose={() => { setIsRoleModalOpen(false); setSelectedRole(null) }}
        onSubmit={handleRoleSubmit}
        initialData={selectedRole}
        allPermissions={allPerms}
        isSubmitting={isRoleSubmitting}
      />

      <PermissionFormModal
        isOpen={isPermModalOpen}
        onClose={() => setIsPermModalOpen(false)}
        onSubmit={(payload) => tambahPermMutation.mutate(payload)}
        isSubmitting={isPermSubmitting}
      />

      <PegawaiRoleModal
        isOpen={isPegawaiModalOpen}
        onClose={() => { setIsPegawaiModalOpen(false); setSelectedEmployee(null) }}
        onSubmit={(data) => assignPegawaiRoleMutation.mutate(data)}
        employee={selectedEmployee}
        availableRoles={assignableRoleNames}
        allPermissions={assignablePerms}
        isSubmitting={isPegawaiSubmitting}
        userIsSuperAdmin={canManageGlobalAccess}
      />

      {/* Role Save Confirmation */}
      <ConfirmDialog
        isOpen={showSaveRoleConfirmModal}
        onClose={() => setShowSaveRoleConfirmModal(false)}
        onConfirm={handleConfirmSaveRole}
        isLoading={isRoleSubmitting}
        action={selectedRole?.id ? 'update' : 'create'}
        title={selectedRole?.id ? 'Konfirmasi Ubah Role' : 'Konfirmasi Simpan Role'}
        message={selectedRole?.id ? `Apakah Anda yakin ingin menyimpan perubahan pada role "${pendingRoleData?.name}"?` : `Apakah Anda yakin ingin menambahkan role baru "${pendingRoleData?.name}"?`}
      />

      {/* Role Delete Confirmation */}
      <MasterDeleteDialog
        isOpen={Boolean(deleteTargetRole)}
        onClose={() => setDeleteTargetRole(null)}
        onConfirm={handleConfirmDeleteRole}
        isLoading={hapusRoleMutation.isPending}
        title={`Hapus Role "${deleteTargetRole?.name}"?`}
        description="Role yang memiliki pengguna aktif tidak dapat dihapus."
      />

      {/* Permission Delete Confirmation */}
      <MasterDeleteDialog
        isOpen={Boolean(deleteTargetPerm)}
        onClose={() => setDeleteTargetPerm(null)}
        onConfirm={handleConfirmDeletePerm}
        isLoading={hapusPermMutation.isPending}
        title={`Hapus Izin "${deleteTargetPerm?.name}"?`}
        description="Izin yang dihapus akan dicabut secara permanen dari seluruh role."
      />
    </MasterDataPage>
    </PageContainer>
  )
}
