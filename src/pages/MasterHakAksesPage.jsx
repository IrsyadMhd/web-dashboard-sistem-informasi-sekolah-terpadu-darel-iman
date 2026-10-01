import React, { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
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
  Printer,
  Download,
  Upload,
  RefreshCw,
  Eye,
  Check,
  RotateCcw,
  Loader2,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Info,
  Calendar,
  ChevronRight,
  ChevronDown,
} from 'lucide-react'
import { cn } from '../lib/utils'
import { useDebounce } from '../hooks/useDebounce'
import { hakAksesService } from '../services/hakAksesService'
import { educationUnitService } from '../services/educationUnitService'
import { getModulLabel, getPermissionLabel } from '../utils/permissionTranslations'
import UserAccountManagement from '../components/auth/UserAccountManagement'
import {
  ROLES,
  hasAnyRole,
  isGlobalAccessManager,
  isUnitAccessManager,
  getTierForRole,
  canEditRole,
  getEditableTiers,
} from '../auth/portalResolver'
import { useAuthStore } from '../stores/authStore'
import PageContainer from '../components/app/PageContainer'
import AppBreadcrumb from '../components/app/AppBreadcrumb'
import AppDataTable from '../components/app/AppDataTable'
import { ActionDropdown } from '../components/app'
import { printCleanTable, downloadPdfTable } from '../utils/printHelper'
import { handleApiExport, downloadFileFromApi } from '../utils/exportUtils'
import {
  SquircleActionButton,
  PrintOptionModal,
  MasterFilterSelect,
} from '../components/master-data'

// ─────────────────────────────────────────────────────────────────────────────
// KONSTANTA & METADATA PERAN & TIER
// ─────────────────────────────────────────────────────────────────────────────
const GLOBAL_ROLE_NAMES = [
  ...ROLES.SUPER_ADMIN,
  ...ROLES.ADMIN,
  ...ROLES.YAYASAN,
]

const GLOBAL_ACCESS_PERMISSIONS = [
  'sistem.hak_akses',
  'sistem.master_data',
  'sistem.pengaturan',
  'permission.manage',
  'role.manage',
  'employee.view_all',
  'employee.create',
  'employee.delete',
  'employee.import',
  'unit.view_all',
  'unit.create',
  'unit.update',
  'unit.delete',
  'master.create',
  'master.update',
  'master.delete',
]

const TIER_COLOR_MAP = {
  red:     { bg: 'bg-red-50 dark:bg-red-950/40', text: 'text-red-700 dark:text-red-300', border: 'border-red-200 dark:border-red-800/60' },
  purple:  { bg: 'bg-purple-50 dark:bg-purple-950/40', text: 'text-purple-700 dark:text-purple-300', border: 'border-purple-200 dark:border-purple-800/60' },
  blue:    { bg: 'bg-blue-50 dark:bg-blue-950/40', text: 'text-blue-700 dark:text-blue-300', border: 'border-blue-200 dark:border-blue-800/60' },
  emerald: { bg: 'bg-emerald-50 dark:bg-emerald-950/40', text: 'text-emerald-700 dark:text-emerald-300', border: 'border-emerald-200 dark:border-emerald-800/60' },
  sky:     { bg: 'bg-sky-50 dark:bg-sky-950/40', text: 'text-sky-700 dark:text-sky-300', border: 'border-sky-200 dark:border-sky-800/60' },
  amber:   { bg: 'bg-amber-50 dark:bg-amber-950/40', text: 'text-amber-700 dark:text-amber-300', border: 'border-amber-200 dark:border-amber-800/60' },
  teal:    { bg: 'bg-teal-50 dark:bg-teal-950/40', text: 'text-teal-700 dark:text-teal-300', border: 'border-teal-200 dark:border-teal-800/60' },
  gray:    { bg: 'bg-slate-100 dark:bg-slate-800', text: 'text-slate-600 dark:text-slate-300', border: 'border-slate-200 dark:border-slate-700' },
}

const SCOPE_LABEL = {
  global:   { text: 'Global', bg: 'bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-950/40 dark:text-violet-300 dark:border-violet-800/60' },
  unit:     { text: 'Per Unit', bg: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800/60' },
  external: { text: 'Eksternal', bg: 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700' },
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
    'Konselor / BK': ['dashboard', 'bk', 'konseling', 'siswa', 'laporan'],
    'Pustakawan': ['dashboard', 'perpustakaan', 'buku', 'peminjaman'],
  }

  const keywords = roleKeywordMap[targetRoleName] || [targetRoleName.toLowerCase().replace(/\s+/g, '_')]
  return availablePermList.filter((perm) =>
    keywords.some((kw) => perm.toLowerCase().includes(kw.toLowerCase()))
  )
}

const ROLE_GROUPS = {
  pimpinan: {
    label: 'Pimpinan & Yayasan',
    roles: ['Super Admin', 'Admin', 'Pengurus Yayasan'],
    badgeColor: 'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-950/60 dark:text-purple-300 dark:border-purple-800',
  },
  manajemen: {
    label: 'Manajemen Sekolah',
    roles: ['Kepala Sekolah', 'Divisi Pendidikan', 'Waka Kurikulum', 'Waka Kesiswaan', 'Waka Sarpras', 'Waka Humas', 'Waka Al-Quran'],
    badgeColor: 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800',
  },
  pendidik: {
    label: 'Tenaga Pendidik',
    roles: ['Guru', 'Wali Kelas', 'Guru Tahfizh', 'Guru Pendamping', 'Guru BK'],
    badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800',
  },
  kepengasuhan: {
    label: 'Kepengasuhan & Asrama',
    roles: ['Musyrif', 'Musyrif Asrama', 'Pembina Asrama', 'Koordinator Asrama'],
    badgeColor: 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800',
  },
  pendukung: {
    label: 'Staf Pendukung',
    roles: ['Tata Usaha', 'Konselor / BK', 'Pustakawan', 'Laboran', 'Bendahara Unit', 'Operator Sekolah'],
    badgeColor: 'bg-slate-100 text-slate-800 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700',
  },
  custom: {
    label: 'Kustom / Tambahan',
    roles: [],
    badgeColor: 'bg-teal-100 text-teal-800 border-teal-200 dark:bg-teal-950/60 dark:text-teal-300 dark:border-teal-800',
  },
}

const getRoleCategoryGroup = (roleName) => {
  for (const [key, group] of Object.entries(ROLE_GROUPS)) {
    if (group.roles.includes(roleName)) {
      return { id: key, ...group }
    }
  }
  return { id: 'custom', ...ROLE_GROUPS.custom }
}

const getSmartDefaultRole = (emp, roleList = []) => {
  if (emp?.primary_role && emp.primary_role !== 'Belum Ada Role') {
    return emp.primary_role
  }
  const pos = (emp?.position?.nama || '').toLowerCase()
  if (pos.includes('kepala sekolah') || pos.includes('kepsek')) return roleList.find((r) => r === 'Kepala Sekolah') || 'Kepala Sekolah'
  if (pos.includes('divisi')) return roleList.find((r) => r === 'Divisi Pendidikan') || 'Divisi Pendidikan'
  if (pos.includes('tahfizh')) return roleList.find((r) => r === 'Guru Tahfizh') || 'Guru Tahfizh'
  if (pos.includes('musyrif') || pos.includes('asrama')) return roleList.find((r) => r === 'Musyrif Asrama' || r === 'Musyrif') || 'Musyrif Asrama'
  if (pos.includes('wali kelas')) return roleList.find((r) => r === 'Wali Kelas') || 'Wali Kelas'
  if (pos.includes('bk') || pos.includes('konselor')) return roleList.find((r) => r === 'Konselor / BK') || 'Konselor / BK'
  if (pos.includes('pustakawan') || pos.includes('perpustakaan')) return roleList.find((r) => r === 'Pustakawan') || 'Pustakawan'
  if (pos.includes('tu') || pos.includes('tata usaha') || pos.includes('staf')) return roleList.find((r) => r === 'Tata Usaha') || 'Tata Usaha'
  return roleList.find((r) => r === 'Guru') || roleList[0] || 'Guru'
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
  'Waka Kurikulum',
  'Waka Kesiswaan',
  'Waka Sarpras',
  'Waka Humas',
  'Waka Al-Quran',
  'Pembina Asrama',
  'Koordinator Asrama',
  'Laboran',
  'Bendahara Unit',
  'Operator Sekolah',
]

// ─────────────────────────────────────────────────────────────────────────────
// KOMPONEN KPI METRIC CARD (TAILGRIDS GOLD STANDARD)
// ─────────────────────────────────────────────────────────────────────────────
const KPI_THEMES = {
  emerald: {
    border: 'border-emerald-500/25 dark:border-emerald-500/20',
    bg: 'bg-gradient-to-br from-emerald-500/10 via-teal-500/5 to-transparent dark:from-emerald-950/40 dark:via-teal-950/20 dark:to-transparent',
    glow: 'from-emerald-500/20 via-teal-400/15 to-transparent',
    iconBox: 'bg-gradient-to-br from-emerald-500 to-teal-700 shadow-emerald-500/20',
    tag: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/60',
    val: 'text-emerald-950 dark:text-emerald-100',
    sub: 'text-emerald-700/80 dark:text-emerald-400/80',
    title: 'text-emerald-800 dark:text-emerald-300',
  },
  teal: {
    border: 'border-teal-500/25 dark:border-teal-500/20',
    bg: 'bg-gradient-to-br from-teal-500/10 via-cyan-500/5 to-transparent dark:from-teal-950/40 dark:via-cyan-950/20 dark:to-transparent',
    glow: 'from-teal-500/20 via-cyan-400/15 to-transparent',
    iconBox: 'bg-gradient-to-br from-teal-500 to-cyan-700 shadow-teal-500/20',
    tag: 'bg-teal-100 text-teal-800 dark:bg-teal-900/60 dark:text-teal-300 border border-teal-200/80 dark:border-teal-800/60',
    val: 'text-teal-950 dark:text-teal-100',
    sub: 'text-teal-700/80 dark:text-teal-400/80',
    title: 'text-teal-800 dark:text-teal-300',
  },
  blue: {
    border: 'border-blue-500/25 dark:border-blue-500/20',
    bg: 'bg-gradient-to-br from-blue-500/10 via-indigo-500/5 to-transparent dark:from-blue-950/40 dark:via-indigo-950/20 dark:to-transparent',
    glow: 'from-blue-500/20 via-indigo-400/15 to-transparent',
    iconBox: 'bg-gradient-to-br from-blue-500 to-indigo-700 shadow-blue-500/20',
    tag: 'bg-blue-100 text-blue-800 dark:bg-blue-900/60 dark:text-blue-300 border border-blue-200/80 dark:border-blue-800/60',
    val: 'text-blue-950 dark:text-blue-100',
    sub: 'text-blue-700/80 dark:text-blue-400/80',
    title: 'text-blue-800 dark:text-blue-300',
  },
  amber: {
    border: 'border-amber-500/25 dark:border-amber-500/20',
    bg: 'bg-gradient-to-br from-amber-500/10 via-orange-500/5 to-transparent dark:from-amber-950/40 dark:via-orange-950/20 dark:to-transparent',
    glow: 'from-amber-500/20 via-orange-400/15 to-transparent',
    iconBox: 'bg-gradient-to-br from-amber-500 to-orange-600 shadow-amber-500/20',
    tag: 'bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-300 border border-amber-200/80 dark:border-amber-800/60',
    val: 'text-amber-950 dark:text-amber-100',
    sub: 'text-amber-700/80 dark:text-amber-400/80',
    title: 'text-amber-800 dark:text-amber-300',
  },
}

function ModernKpiCard({ label, value, subtext, tag, variant = 'emerald', icon: Icon }) {
  const t = KPI_THEMES[variant] || KPI_THEMES.emerald
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -3, transition: { duration: 0.18 } }}
      className={cn(
        'relative overflow-hidden rounded-[20px] border-2 p-5 shadow-xs transition-all',
        t.border,
        t.bg
      )}
    >
      <div className={cn('pointer-events-none absolute -top-8 -right-8 h-28 w-28 rounded-full blur-2xl transition-all', t.glow)} />
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2.5">
          <div className={cn('flex h-9 w-9 items-center justify-center rounded-xl text-white shadow-xs', t.iconBox)}>
            <Icon className="h-4.5 w-4.5" />
          </div>
          <p className={cn('text-[11px] font-bold uppercase tracking-wider', t.title)}>
            {label}
          </p>
        </div>
        {tag && (
          <span className={cn('rounded-lg px-2 py-0.5 text-[10px] font-extrabold', t.tag)}>
            {tag}
          </span>
        )}
      </div>
      <p className={cn('text-3xl sm:text-4xl font-black tabular-nums', t.val)}>
        {value ?? '0'}
      </p>
      {subtext && (
        <p className={cn('mt-0.5 text-[11px] font-semibold', t.sub)}>
          {subtext}
        </p>
      )}
    </motion.div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// TOAST NOTIFICATION STACK (ZERO SWEETALERT2)
// ─────────────────────────────────────────────────────────────────────────────
function ToastStack({ items, onDismiss }) {
  return (
    <div
      aria-live="polite"
      aria-atomic="true"
      className="fixed bottom-5 right-5 z-[9999] flex flex-col gap-2.5 pointer-events-none max-w-sm w-full"
    >
      <AnimatePresence>
        {items.map((n) => {
          const isSuccess = n.type === 'success'
          const isDanger = n.type === 'danger' || n.type === 'error'
          const isWarning = n.type === 'warning'
          const isInfo = n.type === 'info'

          return (
            <motion.div
              key={n.id}
              initial={{ opacity: 0, y: 16, scale: 0.94 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 12, scale: 0.94 }}
              transition={{ type: 'spring', stiffness: 420, damping: 28 }}
              className={cn(
                'pointer-events-auto flex items-start gap-3 rounded-2xl border p-4 shadow-xl backdrop-blur-md',
                isSuccess && 'border-emerald-300 bg-white/95 text-emerald-950 shadow-emerald-900/10 dark:border-emerald-800 dark:bg-slate-900/95 dark:text-emerald-100',
                isDanger && 'border-rose-300 bg-white/95 text-rose-950 shadow-rose-900/10 dark:border-rose-800 dark:bg-slate-900/95 dark:text-rose-100',
                isWarning && 'border-amber-300 bg-white/95 text-amber-950 shadow-amber-900/10 dark:border-amber-800 dark:bg-slate-900/95 dark:text-amber-100',
                isInfo && 'border-sky-300 bg-white/95 text-sky-950 shadow-sky-900/10 dark:border-sky-800 dark:bg-slate-900/95 dark:text-sky-100'
              )}
            >
              <div
                className={cn(
                  'flex size-8 shrink-0 items-center justify-center rounded-xl text-white shadow-xs',
                  isSuccess && 'bg-gradient-to-br from-emerald-500 to-teal-700',
                  isDanger && 'bg-gradient-to-br from-rose-500 to-red-700',
                  isWarning && 'bg-gradient-to-br from-amber-500 to-orange-600',
                  isInfo && 'bg-gradient-to-br from-sky-500 to-blue-700'
                )}
              >
                {isSuccess && <CheckCircle2 className="size-4.5" strokeWidth={2.3} />}
                {isDanger && <XCircle className="size-4.5" strokeWidth={2.3} />}
                {isWarning && <AlertTriangle className="size-4.5" strokeWidth={2.3} />}
                {isInfo && <Info className="size-4.5" strokeWidth={2.3} />}
              </div>

              <div className="flex-1 min-w-0 pt-0.5">
                <div className="flex items-center gap-1.5">
                  <p className="text-xs font-black leading-tight">{n.title}</p>
                  <span
                    className={cn(
                      'rounded-full px-1.5 py-0.2 text-[9px] font-black uppercase tracking-wider',
                      isSuccess && 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300',
                      isDanger && 'bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300',
                      isWarning && 'bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300',
                      isInfo && 'bg-sky-100 text-sky-800 dark:bg-sky-950/80 dark:text-sky-300'
                    )}
                  >
                    {isSuccess ? 'Sukses' : isDanger ? 'Gagal' : isWarning ? 'Peringatan' : 'Info'}
                  </span>
                </div>
                {n.message && (
                  <p className="mt-1 text-[11px] font-medium leading-normal text-slate-600 dark:text-slate-300">
                    {n.message}
                  </p>
                )}
              </div>

              <button
                type="button"
                onClick={() => onDismiss(n.id)}
                className="shrink-0 rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 transition-colors"
              >
                <X className="size-3.5" />
              </button>
            </motion.div>
          )
        })}
      </AnimatePresence>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// HALAMAN UTAMA MASTER HAK AKSES & ROLE
// ─────────────────────────────────────────────────────────────────────────────
export default function MasterHakAksesPage() {
  const queryClient = useQueryClient()
  const { user } = useAuthStore()
  const userRoles = useMemo(() => user?.roles || (user?.role ? [user.role] : []), [user])

  const isSuperAdmin = hasAnyRole(userRoles, ROLES.SUPER_ADMIN)
  const canManageGlobalAccess = isSuperAdmin || isGlobalAccessManager(userRoles)
  const canManageUnitAccess = isUnitAccessManager(userRoles)
  const canManageAccess = isSuperAdmin || canManageGlobalAccess || canManageUnitAccess

  const [activeTab, setActiveTab] = useState(canManageGlobalAccess ? 'roles' : 'pegawai')
  const [roleCategoryFilter, setRoleCategoryFilter] = useState('semua')
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebounce(search, 350)
  const [page, setPage] = useState(1)
  const [selectedUnitId, setSelectedUnitId] = useState('')
  const [statusFilter, setStatusFilter] = useState('')

  // Toast Notification Stack State
  const [notifications, setNotifications] = useState([])
  const notify = (title, message = '', type = 'success') => {
    const id = Date.now() + Math.random().toString(36).substring(2, 6)
    setNotifications((prev) => [...prev, { id, title, message, type }])
    setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== id))
    }, 4000)
  }

  // Modals state
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false)
  const [selectedRole, setSelectedRole] = useState(null)
  const [isPermModalOpen, setIsPermModalOpen] = useState(false)
  const [isPegawaiModalOpen, setIsPegawaiModalOpen] = useState(false)
  const [selectedEmployee, setSelectedEmployee] = useState(null)
  const [deleteTargetRole, setDeleteTargetRole] = useState(null)
  const [deleteTargetPerm, setDeleteTargetPerm] = useState(null)
  const [pendingRoleData, setPendingRoleData] = useState(null)
  const [showSaveRoleConfirmModal, setShowSaveRoleConfirmModal] = useState(false)
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false)

  // Query Units
  const { data: unitsData = {} } = useQuery({
    queryKey: ['education-units-filter'],
    queryFn: () => educationUnitService.getUnits({ per_page: 100 }),
    staleTime: 60000,
  })
  const educationUnits = unitsData?.data || []

  // Query Stats
  const { data: stats = {} } = useQuery({
    queryKey: ['hak-akses-stats'],
    queryFn: hakAksesService.getStats,
    staleTime: 30000,
  })

  // Query Roles
  const { data: rolesData = {}, isLoading: isLoadingRoles } = useQuery({
    queryKey: ['hak-akses-roles', debouncedSearch, roleCategoryFilter],
    queryFn: () => hakAksesService.getDaftarRole({ search: debouncedSearch }),
    enabled: activeTab === 'roles' && canManageGlobalAccess,
    staleTime: 30000,
  })

  // Query Permissions
  const { data: permData = {}, isLoading: isLoadingPerms } = useQuery({
    queryKey: ['hak-akses-permissions', debouncedSearch],
    queryFn: () => hakAksesService.getDaftarPermission({ search: debouncedSearch }),
    enabled: activeTab === 'permissions' && canManageGlobalAccess,
    staleTime: 60000,
  })

  const { data: allPermData = {} } = useQuery({
    queryKey: ['hak-akses-permissions-all'],
    queryFn: () => hakAksesService.getDaftarPermission({ per_page: 1000 }),
    staleTime: 60000,
  })

  const { data: allRolesData = {} } = useQuery({
    queryKey: ['hak-akses-roles-all'],
    queryFn: () => hakAksesService.getDaftarRole({ per_page: 100 }),
    staleTime: 60000,
  })

  // Query Pegawai
  const { data: pegawaiData = {}, isLoading: isLoadingPegawai, refetch: refetchPegawai } = useQuery({
    queryKey: ['hak-akses-pegawai', debouncedSearch, page, selectedUnitId, statusFilter],
    queryFn: () =>
      hakAksesService.getPegawaiHakAkses({
        search: debouncedSearch,
        page,
        unit_id: selectedUnitId || undefined,
        status: statusFilter || undefined,
      }),
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
    : allPermsForAssignment.filter((p) => !GLOBAL_ACCESS_PERMISSIONS.includes(p))

  // Construct complete roles list combining backend DB roles & default roles
  const dbRoleNamesSet = new Set(backendRoles.map((r) => r.name))
  const defaultSeededRoles = PROJECT_DEFAULT_ROLES.filter((name) => !dbRoleNamesSet.has(name)).map((name) => {
    const group = getRoleCategoryGroup(name)
    const tier = getTierForRole(name)
    return {
      id: `default-${name.toLowerCase().replace(/\s+/g, '-')}`,
      name,
      description: `Peran standar terintegrasi: ${group.label}`,
      permissions: applyRoleDefaultPermissions(name, allPermsForAssignment),
      jumlah_izin: applyRoleDefaultPermissions(name, allPermsForAssignment).length,
      jumlah_pengguna: 0,
      is_default_preset: true,
      tier,
    }
  })

  const mergedAllRoles = [...backendRoles, ...defaultSeededRoles]

  const filteredRoles = mergedAllRoles.filter((r) => {
    if (debouncedSearch && !r.name.toLowerCase().includes(debouncedSearch.toLowerCase())) return false
    if (roleCategoryFilter !== 'semua') {
      const cat = getRoleCategoryGroup(r.name)
      if (cat.id !== roleCategoryFilter) return false
    }
    return true
  })

  const listPegawai = pegawaiData?.data || []
  const metaPegawai = pegawaiData?.meta || {}

  // ─────────────────────────────────────────────────────────────────────────────
  // MUTATIONS DENGAN TOASTFEEDBACK (ZERO SWEETALERT2)
  // ─────────────────────────────────────────────────────────────────────────────
  const tambahRoleMutation = useMutation({
    mutationFn: (payload) => hakAksesService.tambahRole(payload),
    onSuccess: (res) => {
      queryClient.invalidateQueries(['hak-akses-roles'])
      queryClient.invalidateQueries(['hak-akses-roles-all'])
      queryClient.invalidateQueries(['hak-akses-stats'])
      setIsRoleModalOpen(false)
      notify('Berhasil!', res?.message || 'Role baru berhasil ditambahkan.', 'success')
    },
    onError: (err) => {
      notify('Gagal!', err.response?.data?.message || 'Gagal menyimpan role baru.', 'danger')
    },
  })

  const ubahRoleMutation = useMutation({
    mutationFn: ({ id, payload }) => hakAksesService.ubahRole({ id, payload }),
    onSuccess: (res) => {
      queryClient.invalidateQueries(['hak-akses-roles'])
      queryClient.invalidateQueries(['hak-akses-roles-all'])
      setIsRoleModalOpen(false)
      setSelectedRole(null)
      notify('Berhasil!', res?.message || 'Perubahan matriks role berhasil disimpan.', 'success')
    },
    onError: (err) => {
      notify('Gagal!', err.response?.data?.message || 'Gagal memperbarui role.', 'danger')
    },
  })

  const hapusRoleMutation = useMutation({
    mutationFn: (id) => hakAksesService.hapusRole(id),
    onSuccess: (res) => {
      queryClient.invalidateQueries(['hak-akses-roles'])
      queryClient.invalidateQueries(['hak-akses-roles-all'])
      queryClient.invalidateQueries(['hak-akses-stats'])
      setDeleteTargetRole(null)
      notify('Terhapus!', res?.message || 'Role berhasil dihapus.', 'success')
    },
    onError: (err) => {
      notify('Gagal!', err.response?.data?.message || 'Gagal menghapus role.', 'danger')
    },
  })

  const tambahPermMutation = useMutation({
    mutationFn: (payload) => hakAksesService.tambahPermission(payload),
    onSuccess: (res) => {
      queryClient.invalidateQueries(['hak-akses-permissions'])
      queryClient.invalidateQueries(['hak-akses-permissions-all'])
      queryClient.invalidateQueries(['hak-akses-stats'])
      setIsPermModalOpen(false)
      notify('Berhasil!', res?.message || 'Izin akses baru berhasil ditambahkan.', 'success')
    },
    onError: (err) => {
      notify('Gagal!', err.response?.data?.message || 'Gagal menyimpan izin akses.', 'danger')
    },
  })

  const hapusPermMutation = useMutation({
    mutationFn: (id) => hakAksesService.hapusPermission(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['hak-akses-permissions'])
      queryClient.invalidateQueries(['hak-akses-permissions-all'])
      queryClient.invalidateQueries(['hak-akses-stats'])
      setDeleteTargetPerm(null)
      notify('Terhapus!', 'Izin akses berhasil dihapus.', 'success')
    },
    onError: (err) => {
      notify('Gagal!', err.response?.data?.message || 'Gagal menghapus izin akses.', 'danger')
    },
  })

  const assignPegawaiRoleMutation = useMutation({
    mutationFn: ({ employeeId, payload }) => hakAksesService.assignPegawaiRole({ employeeId, payload }),
    onSuccess: (res) => {
      queryClient.invalidateQueries(['hak-akses-pegawai'])
      queryClient.invalidateQueries(['hak-akses-roles'])
      queryClient.invalidateQueries(['hak-akses-roles-all'])
      queryClient.invalidateQueries(['hak-akses-stats'])
      setIsPegawaiModalOpen(false)
      setSelectedEmployee(null)
      notify('Berhasil!', res?.message || 'Hak akses pegawai berhasil diperbarui.', 'success')
    },
    onError: (err) => {
      notify('Gagal!', err.response?.data?.message || 'Gagal memperbarui hak akses pegawai.', 'danger')
    },
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
      } catch {
        setSelectedRole(role)
      }
    } else {
      setSelectedRole(role)
    }
    setIsRoleModalOpen(true)
  }

  const handleDeleteRole = (role) => {
    const tier = getTierForRole(role.name)
    if (tier?.isProtected || role.is_default_preset) {
      notify('Role Dilindungi', 'Role bawaan sistem tidak dapat dihapus.', 'warning')
      return
    }
    setDeleteTargetRole(role)
  }

  const handleConfirmDeleteRole = () => {
    if (!deleteTargetRole) return
    hapusRoleMutation.mutate(deleteTargetRole.id)
  }

  const handleDeletePerm = (perm) => {
    setDeleteTargetPerm(perm)
  }

  const handleConfirmDeletePerm = () => {
    if (!deleteTargetPerm) return
    hapusPermMutation.mutate(deleteTargetPerm.id)
  }

  const handleOpenPegawaiModal = (emp) => {
    setSelectedEmployee(emp)
    setIsPegawaiModalOpen(true)
  }

  const resetFilters = () => {
    setSearch('')
    setSelectedUnitId('')
    setRoleCategoryFilter('semua')
    setStatusFilter('')
    setPage(1)
  }

  const hasActiveFilters = Boolean(search || selectedUnitId || (roleCategoryFilter !== 'semua') || statusFilter)

  // Tab definitions
  const tabs = [
    {
      key: 'pegawai',
      label: 'Akses Pegawai',
      count: stats.total_pegawai_unit || 300,
      icon: Users,
      description: 'Penugasan role dan otoritas akun staf yayasan',
    },
    {
      key: 'akun',
      label: 'Manajemen Akun',
      count: 'Akun Login',
      icon: UserCog,
      description: 'Pembuatan akun, aktivasi, dan reset password kredensial',
    },
    ...(canManageGlobalAccess
      ? [
          {
            key: 'roles',
            label: 'Matriks Peran & Role',
            count: `${stats.total_role || 0} Role`,
            icon: Shield,
            description: 'Struktur kelompok peran (RBAC) dan pemetaan izin sistem',
          },
          {
            key: 'permissions',
            label: 'Katalog Hak Akses',
            count: `${stats.total_permission || 0} Izin`,
            icon: Key,
            description: 'Katalog aksi dan modul yang terproteksi dalam sistem',
          },
        ]
      : []),
  ]

  // Print Data Builder
  const handlePrintClick = () => {
    setIsPrintModalOpen(true)
  }

  const handleDoPrint = (isPdf = false) => {
    const activeTabLabel = tabs.find((t) => t.key === activeTab)?.label || 'Hak Akses'
    const printTitle = `Laporan Hak Akses & Matriks Role - ${activeTabLabel}`

    let columns = []
    let rows = []

    if (activeTab === 'pegawai') {
      columns = ['No', 'Nama Pegawai', 'NIY', 'Email', 'Jabatan', 'Unit', 'Status Akun', 'Role Saat Ini']
      rows = listPegawai.map((emp, i) => [
        i + 1,
        emp.nama_lengkap,
        emp.niy || '-',
        emp.email || '-',
        emp.position?.nama || '-',
        emp.unit?.nama || '-',
        emp.has_user ? 'Terhubung' : 'Belum Punya Akun',
        emp.primary_role || 'Guru',
      ])
    } else if (activeTab === 'roles') {
      columns = ['No', 'Nama Role', 'Kelompok', 'Tier', 'Scope', 'Jumlah Izin', 'Pengguna']
      rows = filteredRoles.map((r, i) => {
        const cat = getRoleCategoryGroup(r.name)
        const tier = getTierForRole(r.name)
        return [
          i + 1,
          r.name,
          cat.label,
          tier?.label || '-',
          tier?.scope ? SCOPE_LABEL[tier.scope]?.text : 'Global',
          r.permissions?.length || r.jumlah_izin || 0,
          r.jumlah_pengguna || 0,
        ]
      })
    } else {
      columns = ['No', 'Modul', 'Nama Permission', 'Deskripsi']
      rows = allPerms.map((p, i) => [
        i + 1,
        p.split('.')[0] || 'Umum',
        p,
        getPermissionLabel(p),
      ])
    }

    if (isPdf) {
      downloadPdfTable({
        title: printTitle,
        subtitle: 'Sistem Manajemen Sekolah Terpadu - Yayasan Dar El-Iman Padang',
        columns,
        rows,
        filename: `rekap_hak_akses_${activeTab}.pdf`,
      })
    } else {
      printCleanTable({
        title: printTitle,
        subtitle: 'Sistem Manajemen Sekolah Terpadu - Yayasan Dar El-Iman Padang',
        columns,
        rows,
      })
    }
  }

  return (
    <PageContainer maxW="7xl">
      <ToastStack items={notifications} onDismiss={(id) => setNotifications((n) => n.filter((x) => x.id !== id))} />

      {/* Print Option Modal */}
      <PrintOptionModal
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
        title="Laporan Hak Akses & Matriks Role"
        onConfirmPrint={() => handleDoPrint(false)}
        onConfirmDownloadPdf={() => handleDoPrint(true)}
      />

      <div className="space-y-6">
        {/* Breadcrumb Kanonikal */}
        <AppBreadcrumb
          items={[
            { href: '/dashboard', label: 'Dashboard' },
            { href: '/dashboard/master-data', label: 'Master Data' },
            { label: 'Hak Akses & Role' },
          ]}
        />

        {/* ── HERO HEADER CARD (TAILGRIDS BENCHMARK STYLE) ── */}
        <div className="relative overflow-hidden rounded-[22px] border-2 border-emerald-500/30 bg-gradient-to-r from-emerald-500/15 via-teal-500/10 to-emerald-600/15 p-5 sm:p-6 shadow-md shadow-emerald-500/10 dark:border-emerald-600/40 dark:bg-gradient-to-r dark:from-emerald-950/70 dark:via-teal-950/50 dark:to-slate-900 print:hidden">
          {/* Dual Multi-Tone Ambient Glow Blobs */}
          <div className="pointer-events-none absolute -top-20 -right-20 h-56 w-56 rounded-full bg-gradient-to-br from-emerald-500/40 via-teal-400/30 to-emerald-600/20 blur-3xl dark:from-emerald-600/30 dark:via-teal-500/20" />
          <div className="pointer-events-none absolute -bottom-20 -left-20 h-56 w-56 rounded-full bg-gradient-to-tr from-teal-500/30 via-emerald-400/20 to-transparent blur-3xl dark:from-teal-700/25" />

          <div className="relative z-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex size-13 sm:size-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700 text-white shadow-lg shadow-emerald-600/30 border border-emerald-300/40">
                <ShieldCheck className="size-7 text-white" strokeWidth={2.2} />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                    Manajemen Hak Akses & Matriks Role
                  </h1>
                  <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-emerald-600 to-teal-600 px-3 py-0.5 text-xs font-extrabold text-white shadow-xs">
                    <Sparkles className="size-3 text-amber-300 animate-pulse" />
                    RBAC Keamanan
                  </span>
                </div>
                <p className="mt-1 text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-300 max-w-2xl">
                  Kelola penugasan peran (role), izin modul (permissions), matriks otoritas sistem, serta akun login civitas sekolah secara terpusat.
                </p>
              </div>
            </div>

            {/* Action Tag & Status */}
            <div className="flex items-center gap-2 shrink-0">
              <div className="flex items-center gap-2 rounded-xl bg-white/80 dark:bg-slate-800/80 border border-emerald-200/80 dark:border-emerald-800/60 px-3 py-1.5 shadow-2xs">
                <Shield className="size-4 text-emerald-700 dark:text-emerald-400" />
                <span className="text-xs font-bold text-slate-700 dark:text-slate-200">
                  {stats.total_role ?? 30} Role Terdaftar
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ── MASTER STATS KPI GRID (4 KARTU MODERN) ── */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 print:hidden">
          <ModernKpiCard
            label="Total Role Sistem"
            value={stats.total_role ?? 30}
            subtext="Kelompok peran terdaftar"
            tag="RBAC"
            variant="emerald"
            icon={Shield}
          />
          <ModernKpiCard
            label="Izin Akses (Permissions)"
            value={stats.total_permission ?? 381}
            subtext="Modul & aksi terproteksi"
            tag="Aksi"
            variant="teal"
            icon={Key}
          />
          <ModernKpiCard
            label="Pegawai Tercover"
            value={stats.total_pegawai_unit ?? 300}
            subtext="Civitas staf & guru yayasan"
            tag="Civitas"
            variant="blue"
            icon={Users}
          />
          <ModernKpiCard
            label="Role Belum Digunakan"
            value={stats.role_tanpa_user ?? 0}
            subtext="Peran tanpa penugasan aktif"
            tag="Arsip"
            variant="amber"
            icon={ShieldAlert}
          />
        </div>

        {/* ── CANONICAL SEGMENTED TAB BAR ── */}
        <div className="relative rounded-[22px] border-2 border-emerald-300/80 dark:border-emerald-700/80 bg-white/90 dark:bg-[#1B2433] p-2 shadow-sm backdrop-blur-md print:hidden">
          <div className="flex flex-wrap items-center gap-2">
            {tabs.map((tab) => {
              const Icon = tab.icon
              const isActive = activeTab === tab.key

              return (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => {
                    setActiveTab(tab.key)
                    setSearch('')
                    setPage(1)
                  }}
                  className={cn(
                    'group relative flex items-center gap-2.5 rounded-2xl px-4 py-2.5 text-xs font-black transition-all duration-200 cursor-pointer',
                    isActive
                      ? 'bg-gradient-to-r from-emerald-600 via-emerald-600 to-teal-700 text-white shadow-md shadow-emerald-700/25'
                      : 'bg-slate-50/80 text-slate-700 hover:bg-emerald-50/60 hover:text-emerald-900 dark:bg-slate-800/60 dark:text-slate-300 dark:hover:bg-slate-800'
                  )}
                >
                  <Icon
                    className={cn(
                      'size-4 transition-transform group-hover:scale-110',
                      isActive ? 'text-white' : 'text-slate-500 dark:text-slate-400'
                    )}
                    strokeWidth={2.2}
                  />
                  <span>{tab.label}</span>
                  <span
                    className={cn(
                      'rounded-full px-2 py-0.5 text-[10px] font-extrabold',
                      isActive
                        ? 'bg-white/20 text-white'
                        : 'bg-slate-200/80 text-slate-700 dark:bg-slate-700 dark:text-slate-300'
                    )}
                  >
                    {tab.count}
                  </span>
                </button>
              )
            })}
          </div>
        </div>

        {/* ── TAB 1: AKSES PEGAWAI ── */}
        {activeTab === 'pegawai' && (
          <AppDataTable
            title="Akses Pegawai"
            description="Penetapan peran, otoritas akun, dan hak akses staf civitas sekolah."
            badge={`${metaPegawai.total || listPegawai.length} pegawai`}
            icon={Users}
            actions={
              <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0 self-start sm:self-auto flex-wrap">
                <div className="group relative inline-flex">
                  <button
                    type="button"
                    title="Cetak Data Akses Pegawai"
                    aria-label="Cetak Data Akses Pegawai"
                    onClick={handlePrintClick}
                    className="flex size-10 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-800 text-white border border-indigo-300/40 hover:scale-105 transition-all duration-200 active:scale-95 cursor-pointer shadow-sm shadow-indigo-500/20"
                  >
                    <Printer className="size-5 text-white" strokeWidth={2.2} />
                  </button>
                  <div className="pointer-events-none absolute top-full left-1/2 mt-2 -translate-x-1/2 opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 transition-all duration-200 ease-out z-50 whitespace-nowrap rounded-lg bg-slate-900 px-2.5 py-1 text-[11px] font-bold text-white shadow-xl dark:bg-slate-100 dark:text-slate-900">
                    <div className="absolute bottom-full left-1/2 -mb-1 -translate-x-1/2 border-4 border-transparent border-b-slate-900 dark:border-b-slate-100" />
                    Cetak / Unduh PDF
                  </div>
                </div>

                <div className="group relative inline-flex">
                  <button
                    type="button"
                    title="Muat Ulang Data"
                    aria-label="Muat Ulang Data"
                    onClick={() => refetchPegawai()}
                    className="flex size-10 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-500 via-emerald-600 to-emerald-700 text-white border border-emerald-300/40 hover:scale-105 transition-all duration-200 active:scale-95 cursor-pointer shadow-sm shadow-emerald-500/20"
                  >
                    <RefreshCw className="size-5 text-white" strokeWidth={2.2} />
                  </button>
                  <div className="pointer-events-none absolute top-full left-1/2 mt-2 -translate-x-1/2 opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 transition-all duration-200 ease-out z-50 whitespace-nowrap rounded-lg bg-slate-900 px-2.5 py-1 text-[11px] font-bold text-white shadow-xl dark:bg-slate-100 dark:text-slate-900">
                    <div className="absolute bottom-full left-1/2 -mb-1 -translate-x-1/2 border-4 border-transparent border-b-slate-900 dark:border-b-slate-100" />
                    Segarkan Data
                  </div>
                </div>
              </div>
            }
            searchValue={search}
            onSearchChange={(v) => {
              setSearch(v)
              setPage(1)
            }}
            searchPlaceholder="Cari nama pegawai, NIY, atau email..."
            filterOptions={
              <>
                <MasterFilterSelect
                  aria-label="Filter Unit Pendidikan"
                  value={selectedUnitId}
                  onChange={(e) => {
                    setSelectedUnitId(e.target.value)
                    setPage(1)
                  }}
                >
                  <option value="">Semua Unit Pendidikan</option>
                  {educationUnits.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name || u.nama_unit || u.code}
                    </option>
                  ))}
                </MasterFilterSelect>

                <MasterFilterSelect
                  aria-label="Filter Status Akun"
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value)
                    setPage(1)
                  }}
                >
                  <option value="">Semua Status Akun</option>
                  <option value="has_user">Sudah Punya Akun (Terhubung)</option>
                  <option value="no_user">Belum Punya Akun</option>
                </MasterFilterSelect>
              </>
            }
            onResetFilters={resetFilters}
            hasActiveFilters={hasActiveFilters}
            isLoading={isLoadingPegawai}
            isEmpty={!isLoadingPegawai && listPegawai.length === 0}
            emptyTitle="Data Pegawai Tidak Ditemukan"
            emptyDescription="Coba sesuaikan kata kunci pencarian atau opsi filter aktif."
            page={page}
            totalPages={metaPegawai.last_page || 1}
            totalItems={metaPegawai.total || listPegawai.length}
            itemsPerPage={metaPegawai.per_page || 15}
            onPageChange={setPage}
            serverControlled
            renderTable={() => (
              <div className="w-full overflow-x-auto">
                <table className="w-full min-w-[950px] border-collapse text-left text-xs" aria-label="Tabel Akses Pegawai">
                  <thead className="bg-gradient-to-r from-emerald-100/90 via-teal-50/70 to-emerald-100/90 border-b-2 border-emerald-200/90 dark:from-emerald-950/90 dark:via-teal-950/70 dark:to-emerald-950/90 text-emerald-950 dark:text-emerald-200">
                    <tr>
                      <th className="w-12 px-3.5 py-3.5 text-center font-black text-[11px] uppercase tracking-wider">No</th>
                      <th className="px-4 py-3.5 font-black text-[11px] uppercase tracking-wider">Data Pegawai & Civitas</th>
                      <th className="px-4 py-3.5 font-black text-[11px] uppercase tracking-wider">Jabatan & Unit Sekolah</th>
                      <th className="w-40 px-4 py-3.5 text-center font-black text-[11px] uppercase tracking-wider">Status Akun Login</th>
                      <th className="px-4 py-3.5 font-black text-[11px] uppercase tracking-wider">Role & Otoritas Sistem</th>
                      <th className="w-36 px-4 py-3.5 text-center font-black text-[11px] uppercase tracking-wider">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-emerald-100/80 dark:divide-emerald-900/40 bg-white dark:bg-[#1B2433]">
                    {listPegawai.map((emp, idx) => {
                      const displayRole = getSmartDefaultRole(emp, availableRoleNames)
                      const isDefault = !emp.primary_role || emp.primary_role === 'Belum Ada Role'
                      const isProtected = displayRole === 'Super Admin' || displayRole === 'Admin'
                      const initials = (emp.nama_lengkap || 'P')
                        .split(' ')
                        .map((n) => n[0])
                        .slice(0, 2)
                        .join('')
                        .toUpperCase()

                      return (
                        <tr key={emp.id} className="hover:bg-emerald-50/35 dark:hover:bg-emerald-950/20 transition-colors">
                          <td className="px-3.5 py-3.5 text-center font-bold text-slate-400 dark:text-slate-500 tabular-nums">
                            {((metaPegawai.current_page || 1) - 1) * (metaPegawai.per_page || 15) + idx + 1}
                          </td>

                          {/* Data Pegawai */}
                          <td className="px-4 py-3.5">
                            <div className="flex items-center gap-3">
                              <div className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-700 text-white font-black text-xs shadow-xs">
                                {initials}
                              </div>
                              <div className="min-w-0">
                                <p className="font-black text-slate-900 dark:text-white text-sm truncate">
                                  {emp.nama_lengkap}
                                </p>
                                <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                                  NIY: <span className="font-bold text-slate-700 dark:text-slate-300">{emp.niy || '-'}</span> • {emp.email || '-'}
                                </p>
                              </div>
                            </div>
                          </td>

                          {/* Jabatan & Unit */}
                          <td className="px-4 py-3.5">
                            <div className="space-y-1">
                              <p className="text-xs font-extrabold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                                <Briefcase className="size-3.5 text-emerald-700 dark:text-emerald-400 shrink-0" />
                                <span>{emp.position?.nama || '-'}</span>
                              </p>
                              <p className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                                <Building className="size-3.5 text-slate-400 shrink-0" />
                                <span>{emp.unit?.nama || 'Seluruh Unit / Pusat'}</span>
                              </p>
                            </div>
                          </td>

                          {/* Status Akun */}
                          <td className="px-4 py-3.5 text-center">
                            {emp.has_user ? (
                              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-1 text-[11px] font-extrabold text-emerald-700 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/60 shadow-2xs">
                                <UserCheck className="size-3" />
                                Terhubung
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 dark:bg-amber-950/60 px-2.5 py-1 text-[11px] font-extrabold text-amber-800 dark:text-amber-300 border border-amber-200/80 dark:border-amber-800/60 shadow-2xs">
                                <UserX className="size-3" />
                                Belum Punya Akun
                              </span>
                            )}
                          </td>

                          {/* Role Otoritas */}
                          <td className="px-4 py-3.5">
                            <span
                              className={cn(
                                'inline-flex items-center gap-1.5 rounded-xl px-3 py-1 text-xs font-black border shadow-2xs',
                                isProtected
                                  ? 'bg-amber-50 border-amber-300 text-amber-900 dark:bg-amber-950/60 dark:text-amber-200 dark:border-amber-800'
                                  : isDefault
                                  ? 'bg-sky-50 border-sky-300 text-sky-900 dark:bg-sky-950/60 dark:text-sky-200 dark:border-sky-800'
                                  : 'bg-emerald-50 border-emerald-300 text-emerald-900 dark:bg-emerald-950/60 dark:text-emerald-200 dark:border-emerald-800'
                              )}
                            >
                              {isProtected ? (
                                <Lock className="size-3.5 text-amber-700 dark:text-amber-400" />
                              ) : (
                                <Shield className="size-3.5 text-emerald-700 dark:text-emerald-400" />
                              )}
                              <span>{displayRole}</span>
                              {isDefault && <span className="text-[10px] font-semibold text-sky-600 dark:text-sky-400">(Default)</span>}
                            </span>
                          </td>

                          {/* Aksi */}
                          <td className="px-4 py-3.5 text-center">
                            {canManageAccess && (
                              <button
                                type="button"
                                onClick={() => handleOpenPegawaiModal(emp)}
                                className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-300/80 bg-emerald-50 px-3 py-1.5 text-xs font-extrabold text-emerald-800 hover:bg-emerald-600 hover:text-white dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800 dark:hover:bg-emerald-600 dark:hover:text-white transition-all shadow-2xs cursor-pointer"
                              >
                                <UserCog className="size-3.5" />
                                <span>Atur Akses</span>
                              </button>
                            )}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          />
        )}

        {/* ── TAB 2: MATRIKS PERAN & ROLE ── */}
        {activeTab === 'roles' && canManageGlobalAccess && (
          <AppDataTable
            title="Matriks Peran & Role"
            description="Definisi kelompok peran (RBAC), tier otoritas, dan pemetaan izin akses sistem."
            badge={`${mergedAllRoles.length} role`}
            icon={Shield}
            actions={
              <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0 self-start sm:self-auto flex-wrap">
                <div className="group relative inline-flex">
                  <button
                    type="button"
                    title="Cetak Matriks Role"
                    aria-label="Cetak Matriks Role"
                    onClick={handlePrintClick}
                    className="flex size-10 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-800 text-white border border-indigo-300/40 hover:scale-105 transition-all duration-200 active:scale-95 cursor-pointer shadow-sm shadow-indigo-500/20"
                  >
                    <Printer className="size-5 text-white" strokeWidth={2.2} />
                  </button>
                  <div className="pointer-events-none absolute top-full left-1/2 mt-2 -translate-x-1/2 opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 transition-all duration-200 ease-out z-50 whitespace-nowrap rounded-lg bg-slate-900 px-2.5 py-1 text-[11px] font-bold text-white shadow-xl dark:bg-slate-100 dark:text-slate-900">
                    <div className="absolute bottom-full left-1/2 -mb-1 -translate-x-1/2 border-4 border-transparent border-b-slate-900 dark:border-b-slate-100" />
                    Cetak / Unduh PDF
                  </div>
                </div>

                <div className="group relative inline-flex">
                  <button
                    type="button"
                    title="Tambah Role Baru"
                    aria-label="Tambah Role Baru"
                    onClick={handleOpenCreateRole}
                    className="flex size-10 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700 text-white border border-emerald-300/40 hover:scale-105 transition-all duration-200 active:scale-95 cursor-pointer shadow-sm shadow-emerald-500/20"
                  >
                    <Plus className="size-5 text-white" strokeWidth={2.5} />
                  </button>
                  <div className="pointer-events-none absolute top-full left-1/2 mt-2 -translate-x-1/2 opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 transition-all duration-200 ease-out z-50 whitespace-nowrap rounded-lg bg-slate-900 px-2.5 py-1 text-[11px] font-bold text-white shadow-xl dark:bg-slate-100 dark:text-slate-900">
                    <div className="absolute bottom-full left-1/2 -mb-1 -translate-x-1/2 border-4 border-transparent border-b-slate-900 dark:border-b-slate-100" />
                    Tambah Role Baru
                  </div>
                </div>
              </div>
            }
            searchValue={search}
            onSearchChange={(v) => setSearch(v)}
            searchPlaceholder="Cari nama role sistem..."
            filterOptions={
              <MasterFilterSelect
                aria-label="Filter Kelompok Role"
                value={roleCategoryFilter}
                onChange={(e) => setRoleCategoryFilter(e.target.value)}
              >
                <option value="semua">Semua Kelompok Role</option>
                {Object.entries(ROLE_GROUPS).map(([key, g]) => (
                  <option key={key} value={key}>
                    {g.label}
                  </option>
                ))}
              </MasterFilterSelect>
            }
            onResetFilters={resetFilters}
            hasActiveFilters={hasActiveFilters}
            isLoading={isLoadingRoles}
            isEmpty={!isLoadingRoles && filteredRoles.length === 0}
            emptyTitle="Role Tidak Ditemukan"
            emptyDescription="Sesuaikan kata kunci pencarian atau kategori kelompok role."
            page={1}
            totalPages={1}
            totalItems={filteredRoles.length}
            itemsPerPage={filteredRoles.length || 1}
            renderTable={() => (
              <div className="w-full overflow-x-auto">
                <table className="w-full min-w-[950px] border-collapse text-left text-xs" aria-label="Tabel Matriks Role">
                  <thead className="bg-gradient-to-r from-emerald-100/90 via-teal-50/70 to-emerald-100/90 border-b-2 border-emerald-200/90 dark:from-emerald-950/90 dark:via-teal-950/70 dark:to-emerald-950/90 text-emerald-950 dark:text-emerald-200">
                    <tr>
                      <th className="w-12 px-3.5 py-3.5 text-center font-black text-[11px] uppercase tracking-wider">No</th>
                      <th className="px-4 py-3.5 font-black text-[11px] uppercase tracking-wider">Nama Role & Kelompok</th>
                      <th className="w-36 px-4 py-3.5 text-center font-black text-[11px] uppercase tracking-wider">Tier & Cakupan</th>
                      <th className="w-28 px-4 py-3.5 text-center font-black text-[11px] uppercase tracking-wider">Jumlah Izin</th>
                      <th className="w-28 px-4 py-3.5 text-center font-black text-[11px] uppercase tracking-wider">Pengguna</th>
                      <th className="px-4 py-3.5 font-black text-[11px] uppercase tracking-wider">Izin Akses Terdaftar</th>
                      <th className="w-24 px-4 py-3.5 text-center font-black text-[11px] uppercase tracking-wider">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-emerald-100/80 dark:divide-emerald-900/40 bg-white dark:bg-[#1B2433]">
                    {filteredRoles.map((role, idx) => {
                      const categoryGroup = getRoleCategoryGroup(role.name)
                      const tier = getTierForRole(role.name)
                      const colors = tier ? TIER_COLOR_MAP[tier.color] || TIER_COLOR_MAP.gray : TIER_COLOR_MAP.gray
                      const scopeInfo = tier ? SCOPE_LABEL[tier.scope] || SCOPE_LABEL.global : SCOPE_LABEL.global
                      const { allowed } = canEditRole(userRoles, role.name)
                      const isProtected = tier?.isProtected || false

                      return (
                        <tr key={role.id || role.name} className="hover:bg-emerald-50/35 dark:hover:bg-emerald-950/20 transition-colors">
                          <td className="px-3.5 py-3.5 text-center font-bold text-slate-400 dark:text-slate-500 tabular-nums">
                            {idx + 1}
                          </td>

                          {/* Nama Role & Kelompok */}
                          <td className="px-4 py-3.5">
                            <div className="flex items-center gap-3">
                              <div className={cn('flex size-10 shrink-0 items-center justify-center rounded-2xl border shadow-2xs', colors.bg, colors.border)}>
                                <Shield className={cn('size-5', colors.text)} />
                              </div>
                              <div className="min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <strong className="text-sm font-black text-slate-900 dark:text-white">
                                    {role.name}
                                  </strong>
                                  {role.is_default_preset && (
                                    <span className="rounded-md bg-teal-50 px-1.5 py-0.5 text-[9px] font-black text-teal-800 border border-teal-200 dark:bg-teal-950/60 dark:text-teal-300 dark:border-teal-800">
                                      Bawaan Sistem
                                    </span>
                                  )}
                                </div>
                                <div className="mt-1">
                                  <span className={cn('inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-extrabold border', categoryGroup.badgeColor)}>
                                    {categoryGroup.label}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* Tier & Cakupan */}
                          <td className="px-4 py-3.5 text-center">
                            <div className="flex flex-col items-center gap-1">
                              {tier ? (
                                <span className={cn('rounded-full px-2 py-0.5 text-[10px] font-black border', colors.bg, colors.text, colors.border)}>
                                  {tier.label}
                                </span>
                              ) : (
                                <span className="text-[10px] italic text-slate-400">-</span>
                              )}
                              <span className={cn('rounded-full px-2 py-0.5 text-[9px] font-bold border', scopeInfo.bg)}>
                                {scopeInfo.text}
                              </span>
                              {isProtected && (
                                <span className="inline-flex items-center gap-0.5 rounded-full bg-rose-50 border border-rose-200 px-1.5 py-0.2 text-[9px] font-black text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800">
                                  <Lock className="size-2.5" /> Terproteksi
                                </span>
                              )}
                            </div>
                          </td>

                          {/* Jumlah Izin */}
                          <td className="px-4 py-3.5 text-center">
                            <span className="inline-flex items-center gap-1 rounded-xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800/60 px-2.5 py-1 text-xs font-black text-blue-800 dark:text-blue-300 shadow-2xs">
                              <Key className="size-3" />
                              {role.permissions?.length ?? role.jumlah_izin ?? 0}
                            </span>
                          </td>

                          {/* Pengguna */}
                          <td className="px-4 py-3.5 text-center">
                            <span className="inline-flex items-center gap-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-2.5 py-1 text-xs font-extrabold text-slate-700 dark:text-slate-300 shadow-2xs">
                              <Users className="size-3 text-slate-400" />
                              {role.jumlah_pengguna ?? 0}
                            </span>
                          </td>

                          {/* Izin Akses Chips */}
                          <td className="px-4 py-3.5">
                            <div className="flex flex-wrap gap-1">
                              {(role.permissions || []).slice(0, 3).map((p) => (
                                <span
                                  key={p}
                                  className="rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200/80 dark:border-emerald-800/60 px-2 py-0.5 text-[10px] font-bold text-emerald-800 dark:text-emerald-300"
                                  title={p}
                                >
                                  {getPermissionLabel(p)}
                                </span>
                              ))}
                              {(role.permissions || []).length > 3 && (
                                <span className="rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-1.5 py-0.5 text-[10px] font-bold text-slate-600 dark:text-slate-400">
                                  +{(role.permissions || []).length - 3} lainnya
                                </span>
                              )}
                              {(role.permissions || []).length === 0 && (
                                <span className="text-[11px] italic text-slate-400">Belum ada izin</span>
                              )}
                            </div>
                          </td>

                          {/* Aksi */}
                          <td className="px-4 py-3.5 text-center">
                            {!allowed ? (
                              <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-slate-400">
                                <Lock className="size-3" /> Hanya Lihat
                              </span>
                            ) : (
                              <div className="flex items-center justify-center gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => handleOpenEditRole(role)}
                                  className="flex size-8 items-center justify-center rounded-xl border border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800 transition-colors cursor-pointer"
                                  title="Edit Matriks Izin Role"
                                >
                                  <Pencil className="size-3.5" />
                                </button>
                                {!isProtected && !role.is_default_preset && (
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteRole(role)}
                                    className="flex size-8 items-center justify-center rounded-xl border border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800 transition-colors cursor-pointer"
                                    title="Hapus Role"
                                  >
                                    <Trash2 className="size-3.5" />
                                  </button>
                                )}
                              </div>
                            )}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          />
        )}

        {/* ── TAB 3: KATALOG HAK AKSES (PERMISSIONS) ── */}
        {activeTab === 'permissions' && canManageGlobalAccess && (
          <AppDataTable
            title="Katalog Hak Akses (Permissions)"
            description="Katalog seluruh hak akses granular dan kontrol otoritas per modul pada aplikasi."
            badge={`${allPerms.length} izin`}
            icon={Key}
            actions={
              <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0 self-start sm:self-auto flex-wrap">
                <div className="group relative inline-flex">
                  <button
                    type="button"
                    title="Cetak Katalog Izin"
                    aria-label="Cetak Katalog Izin"
                    onClick={handlePrintClick}
                    className="flex size-10 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-800 text-white border border-indigo-300/40 hover:scale-105 transition-all duration-200 active:scale-95 cursor-pointer shadow-sm shadow-indigo-500/20"
                  >
                    <Printer className="size-5 text-white" strokeWidth={2.2} />
                  </button>
                  <div className="pointer-events-none absolute top-full left-1/2 mt-2 -translate-x-1/2 opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 transition-all duration-200 ease-out z-50 whitespace-nowrap rounded-lg bg-slate-900 px-2.5 py-1 text-[11px] font-bold text-white shadow-xl dark:bg-slate-100 dark:text-slate-900">
                    <div className="absolute bottom-full left-1/2 -mb-1 -translate-x-1/2 border-4 border-transparent border-b-slate-900 dark:border-b-slate-100" />
                    Cetak / Unduh PDF
                  </div>
                </div>

                <div className="group relative inline-flex">
                  <button
                    type="button"
                    title="Tambah Izin Baru"
                    aria-label="Tambah Izin Baru"
                    onClick={() => setIsPermModalOpen(true)}
                    className="flex size-10 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-500 via-sky-600 to-blue-700 text-white border border-sky-300/40 hover:scale-105 transition-all duration-200 active:scale-95 cursor-pointer shadow-sm shadow-sky-500/20"
                  >
                    <Plus className="size-5 text-white" strokeWidth={2.5} />
                  </button>
                  <div className="pointer-events-none absolute top-full left-1/2 mt-2 -translate-x-1/2 opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 transition-all duration-200 ease-out z-50 whitespace-nowrap rounded-lg bg-slate-900 px-2.5 py-1 text-[11px] font-bold text-white shadow-xl dark:bg-slate-100 dark:text-slate-900">
                    <div className="absolute bottom-full left-1/2 -mb-1 -translate-x-1/2 border-4 border-transparent border-b-slate-900 dark:border-b-slate-100" />
                    Tambah Izin Baru
                  </div>
                </div>
              </div>
            }
            searchValue={search}
            onSearchChange={(v) => setSearch(v)}
            searchPlaceholder="Cari nama izin akses (misal: siswa.view, rapor.cetak)..."
            onResetFilters={resetFilters}
            hasActiveFilters={Boolean(search)}
            isLoading={isLoadingPerms}
            isEmpty={!isLoadingPerms && permissionsGrouped.length === 0}
            emptyTitle="Izin Akses Tidak Ditemukan"
            emptyDescription="Sesuaikan kata kunci pencarian modul atau nama permission."
            page={1}
            totalPages={1}
            totalItems={allPerms.length}
            itemsPerPage={allPerms.length || 1}
            renderTable={() => (
              <div className="p-4 sm:p-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {permissionsGrouped.map((group) => {
                  const modulName = group.modul || 'Lainnya'
                  const perms = group.permissions || []

                  return (
                    <div
                      key={modulName}
                      className="flex flex-col overflow-hidden rounded-2xl border border-emerald-200/80 dark:border-emerald-800/60 bg-white dark:bg-[#1B2433] shadow-xs"
                    >
                      <div className="flex items-center justify-between border-b border-emerald-100 bg-gradient-to-r from-emerald-500/10 via-teal-500/5 to-transparent px-4 py-3 dark:border-emerald-900/40">
                        <div className="flex items-center gap-2">
                          <Key className="size-4 text-emerald-700 dark:text-emerald-400" />
                          <h2 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">
                            {getModulLabel(modulName)}
                          </h2>
                        </div>
                        <span className="rounded-full bg-emerald-100 dark:bg-emerald-950/80 px-2 py-0.5 text-[10px] font-black text-emerald-800 dark:text-emerald-300">
                          {perms.length}
                        </span>
                      </div>

                      <div className="flex-1 divide-y divide-slate-100 dark:divide-slate-800 p-3 space-y-1.5 overflow-y-auto max-h-72">
                        {perms.map((p) => {
                          const pName = typeof p === 'string' ? p : p.name
                          const pId = typeof p === 'object' ? p.id : p
                          return (
                            <div key={pName} className="flex items-center justify-between py-1.5 group">
                              <div className="min-w-0 pr-2">
                                <p className="font-extrabold text-slate-800 dark:text-slate-200 text-xs truncate">
                                  {getPermissionLabel(pName)}
                                </p>
                                <code className="text-[10px] text-slate-400 dark:text-slate-500 font-mono truncate block">
                                  {pName}
                                </code>
                              </div>
                              {typeof p === 'object' && pId && (
                                <button
                                  type="button"
                                  onClick={() => handleDeletePerm(p)}
                                  className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-rose-600 rounded transition-all"
                                  title="Hapus Izin"
                                >
                                  <Trash2 className="size-3.5" />
                                </button>
                              )}
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          />
        )}

        {/* ── TAB 4: MANAJEMEN AKUN LOGIN ── */}
        {activeTab === 'akun' && (
          <div className="space-y-4">
            {educationUnits.length > 0 && (
              <div className="flex flex-col gap-2 rounded-2xl border-2 border-emerald-300/80 dark:border-emerald-800/60 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between dark:bg-[#1B2433]">
                <div className="flex items-center gap-2">
                  <Building className="size-4 text-emerald-700 dark:text-emerald-400" />
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    Filter Unit Pendidikan Akun:
                  </span>
                </div>
                <select
                  value={selectedUnitId}
                  onChange={(e) => {
                    setSelectedUnitId(e.target.value)
                    setPage(1)
                  }}
                  className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 shadow-2xs outline-none focus:border-[#0E5C44] focus:ring-4 focus:ring-[#0E5C44]/12"
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
      </div>

      {/* ── MODAL: ROLE FORM MODAL (HARMONIZED) ── */}
      <RoleFormModal
        isOpen={isRoleModalOpen}
        onClose={() => {
          setIsRoleModalOpen(false)
          setSelectedRole(null)
        }}
        onSubmit={handleRoleSubmit}
        initialData={selectedRole}
        allPermissions={allPerms}
        isSubmitting={tambahRoleMutation.isPending || ubahRoleMutation.isPending}
      />

      {/* ── MODAL: PERMISSION FORM MODAL (HARMONIZED) ── */}
      <PermissionFormModal
        isOpen={isPermModalOpen}
        onClose={() => setIsPermModalOpen(false)}
        onSubmit={(payload) => tambahPermMutation.mutate(payload)}
        isSubmitting={tambahPermMutation.isPending}
      />

      {/* ── MODAL: PEGAWAI ROLE MODAL (HARMONIZED) ── */}
      <PegawaiRoleModal
        isOpen={isPegawaiModalOpen}
        onClose={() => {
          setIsPegawaiModalOpen(false)
          setSelectedEmployee(null)
        }}
        onSubmit={(data) => assignPegawaiRoleMutation.mutate(data)}
        employee={selectedEmployee}
        availableRoles={assignableRoleNames}
        allPermissions={assignablePerms}
        isSubmitting={assignPegawaiRoleMutation.isPending}
      />

      {/* ── MODAL: SAVE CONFIRMATION (z-[70]) ── */}
      <AnimatePresence>
        {showSaveRoleConfirmModal && (
          <div
            className="fixed inset-0 z-[70] flex items-center justify-center p-3 sm:p-5 bg-slate-950/70 backdrop-blur-md overflow-y-auto"
            role="dialog"
            aria-modal="true"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 14 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ type: 'spring', stiffness: 400, damping: 28 }}
              className="my-auto w-full max-w-md font-sans"
            >
              <div className="flex max-h-[calc(100dvh-2.5rem)] flex-col overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-2xl shadow-emerald-950/20 dark:border-slate-800 dark:bg-[#182232]">
                <div className="h-1.5 w-full bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-600 shrink-0" />
                <div className="flex items-center justify-between border-b border-slate-100 bg-white px-6 py-4.5 dark:border-slate-800 dark:bg-slate-950">
                  <div className="flex items-center gap-3">
                    <div className="rounded-2xl bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700 text-white p-2.5 shadow-md shadow-emerald-600/30 border border-emerald-300/40 shrink-0">
                      <ShieldCheck className="size-5" />
                    </div>
                    <div>
                      <h2 className="text-sm sm:text-base font-black text-slate-900 dark:text-white">
                        {selectedRole?.id ? 'Konfirmasi Perubahan Role' : 'Konfirmasi Simpan Role Baru'}
                      </h2>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        Verifikasi izin sebelum disimpan ke sistem
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowSaveRoleConfirmModal(false)}
                    className="rounded-xl p-2 bg-gradient-to-br from-rose-500 via-rose-600 to-red-700 text-white border border-rose-300/40 hover:scale-105 transition-all duration-200 cursor-pointer"
                  >
                    <X className="size-4" />
                  </button>
                </div>

                <div className="p-6 space-y-4">
                  <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-3.5 dark:border-slate-800 dark:bg-slate-900/40 text-xs">
                    <p className="text-slate-500 font-bold">Nama Role Target:</p>
                    <p className="text-sm font-black text-slate-900 dark:text-white mt-0.5">{pendingRoleData?.name}</p>
                    <p className="text-slate-500 font-bold mt-2">Jumlah Izin Terpilih:</p>
                    <p className="text-sm font-black text-emerald-700 dark:text-emerald-400 mt-0.5">
                      {pendingRoleData?.permissions?.length || 0} Izin Akses
                    </p>
                  </div>

                  <div className="rounded-2xl border border-emerald-200/80 bg-emerald-50/70 p-3.5 dark:border-emerald-800 dark:bg-emerald-950/40 flex items-start gap-2.5 text-xs text-emerald-900 dark:text-emerald-200">
                    <Info className="size-4 text-emerald-700 shrink-0 mt-0.5" />
                    <p className="leading-relaxed">
                      Perubahan izin pada role ini akan langsung berlaku pada seluruh akun pengguna yang memegang role tersebut saat sesi login berikutnya.
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 border-t border-slate-100 bg-slate-50/50 px-6 py-4 dark:border-slate-800 dark:bg-slate-900/30">
                  <button
                    type="button"
                    onClick={() => setShowSaveRoleConfirmModal(false)}
                    className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-2 text-xs font-black text-rose-700 hover:bg-rose-100 dark:border-rose-800 dark:bg-rose-950/50 dark:text-rose-300 transition-all cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="button"
                    disabled={tambahRoleMutation.isPending || ubahRoleMutation.isPending}
                    onClick={handleConfirmSaveRole}
                    className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700 px-5 py-2.5 text-xs font-black text-white shadow-md shadow-emerald-600/30 hover:scale-[1.02] active:scale-95 transition-all cursor-pointer disabled:opacity-50"
                  >
                    {tambahRoleMutation.isPending || ubahRoleMutation.isPending ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      <CheckCircle2 className="size-4" strokeWidth={2.2} />
                    )}
                    <span>Ya, Simpan Matriks Role</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── MODAL: DELETE CONFIRMATION ROLE (z-[70]) ── */}
      <AnimatePresence>
        {deleteTargetRole && (
          <div
            className="fixed inset-0 z-[70] flex items-center justify-center p-3 sm:p-5 bg-slate-950/70 backdrop-blur-md overflow-y-auto"
            role="dialog"
            aria-modal="true"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 14 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ type: 'spring', stiffness: 400, damping: 28 }}
              className="my-auto w-full max-w-md font-sans"
            >
              <div className="flex max-h-[calc(100dvh-2.5rem)] flex-col overflow-hidden rounded-3xl border border-rose-200/60 bg-white shadow-2xl shadow-rose-950/20 dark:border-rose-900/50 dark:bg-[#182232]">
                <div className="h-1.5 w-full bg-gradient-to-r from-rose-500 via-rose-600 to-red-700 shrink-0" />
                <div className="flex items-center justify-between border-b border-slate-100 bg-white px-6 py-4.5 dark:border-slate-800 dark:bg-slate-950">
                  <div className="flex items-center gap-3">
                    <div className="rounded-2xl bg-gradient-to-br from-rose-500 via-rose-600 to-red-700 text-white p-2.5 shadow-md shadow-rose-600/30 border border-rose-300/40 shrink-0">
                      <Trash2 className="size-5" />
                    </div>
                    <div>
                      <h2 className="text-sm sm:text-base font-black text-slate-900 dark:text-white">
                        Hapus Role Permanen
                      </h2>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        Tindakan ini tidak dapat dibatalkan
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setDeleteTargetRole(null)}
                    className="rounded-xl p-2 bg-gradient-to-br from-slate-500 to-slate-700 text-white hover:scale-105 transition-all cursor-pointer"
                  >
                    <X className="size-4" />
                  </button>
                </div>

                <div className="p-6 space-y-4">
                  <div className="rounded-2xl border border-rose-100 bg-rose-50/60 p-3.5 dark:border-rose-900/40 dark:bg-rose-950/30 text-xs">
                    <p className="text-rose-600 font-bold">Role yang Akan Dihapus:</p>
                    <p className="text-sm font-black text-rose-950 dark:text-rose-100 mt-0.5">{deleteTargetRole?.name}</p>
                    <p className="text-slate-500 mt-1">Peran kustom ini akan dihapus dari sistem dan dicabut dari seluruh penugasan.</p>
                  </div>
                  <div className="rounded-2xl border border-amber-200/80 bg-amber-50/70 p-3.5 dark:border-amber-800 dark:bg-amber-950/40 flex items-start gap-2.5 text-xs text-amber-900 dark:text-amber-200">
                    <AlertTriangle className="size-4 text-amber-700 shrink-0 mt-0.5" />
                    <p className="leading-relaxed">
                      Pastikan tidak ada pengguna aktif yang masih menggunakan role ini sebelum melakukan penghapusan.
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 border-t border-slate-100 bg-slate-50/50 px-6 py-4 dark:border-slate-800 dark:bg-slate-900/30">
                  <button
                    type="button"
                    onClick={() => setDeleteTargetRole(null)}
                    className="rounded-2xl border border-slate-200 bg-slate-100 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 transition-all cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="button"
                    disabled={hapusRoleMutation.isPending}
                    onClick={handleConfirmDeleteRole}
                    className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-br from-rose-500 via-rose-600 to-red-700 px-5 py-2.5 text-xs font-black text-white shadow-md shadow-rose-600/30 hover:scale-[1.02] active:scale-95 transition-all cursor-pointer disabled:opacity-50"
                  >
                    {hapusRoleMutation.isPending ? <Loader2 className="size-4 animate-spin" /> : <Trash2 className="size-4" />}
                    <span>Hapus Role Sekarang</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── MODAL: DELETE CONFIRMATION PERMISSION (z-[70]) ── */}
      <AnimatePresence>
        {deleteTargetPerm && (
          <div
            className="fixed inset-0 z-[70] flex items-center justify-center p-3 sm:p-5 bg-slate-950/70 backdrop-blur-md overflow-y-auto"
            role="dialog"
            aria-modal="true"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 14 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ type: 'spring', stiffness: 400, damping: 28 }}
              className="my-auto w-full max-w-md font-sans"
            >
              <div className="flex max-h-[calc(100dvh-2.5rem)] flex-col overflow-hidden rounded-3xl border border-rose-200/60 bg-white shadow-2xl shadow-rose-950/20 dark:border-rose-900/50 dark:bg-[#182232]">
                <div className="h-1.5 w-full bg-gradient-to-r from-rose-500 via-rose-600 to-red-700 shrink-0" />
                <div className="flex items-center justify-between border-b border-slate-100 bg-white px-6 py-4.5 dark:border-slate-800 dark:bg-slate-950">
                  <div className="flex items-center gap-3">
                    <div className="rounded-2xl bg-gradient-to-br from-rose-500 via-rose-600 to-red-700 text-white p-2.5 shadow-md shadow-rose-600/30 border border-rose-300/40 shrink-0">
                      <Trash2 className="size-5" />
                    </div>
                    <div>
                      <h2 className="text-sm sm:text-base font-black text-slate-900 dark:text-white">
                        Hapus Izin Akses
                      </h2>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        Tindakan ini permanen
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setDeleteTargetPerm(null)}
                    className="rounded-xl p-2 bg-gradient-to-br from-slate-500 to-slate-700 text-white hover:scale-105 transition-all cursor-pointer"
                  >
                    <X className="size-4" />
                  </button>
                </div>

                <div className="p-6 space-y-4">
                  <div className="rounded-2xl border border-rose-100 bg-rose-50/60 p-3.5 dark:border-rose-900/40 dark:bg-rose-950/30 text-xs">
                    <p className="text-rose-600 font-bold">Izin yang Akan Dihapus:</p>
                    <p className="text-sm font-black text-rose-950 dark:text-rose-100 mt-0.5">
                      {deleteTargetPerm?.name || deleteTargetPerm}
                    </p>
                    <p className="text-slate-500 mt-1">Izin akan dicabut dari seluruh role dan penugasan langsung.</p>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 border-t border-slate-100 bg-slate-50/50 px-6 py-4 dark:border-slate-800 dark:bg-slate-900/30">
                  <button
                    type="button"
                    onClick={() => setDeleteTargetPerm(null)}
                    className="rounded-2xl border border-slate-200 bg-slate-100 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 transition-all cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="button"
                    disabled={hapusPermMutation.isPending}
                    onClick={handleConfirmDeletePerm}
                    className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-br from-rose-500 via-rose-600 to-red-700 px-5 py-2.5 text-xs font-black text-white shadow-md shadow-rose-600/30 hover:scale-[1.02] active:scale-95 transition-all cursor-pointer disabled:opacity-50"
                  >
                    {hapusPermMutation.isPending ? <Loader2 className="size-4 animate-spin" /> : <Trash2 className="size-4" />}
                    <span>Hapus Izin</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </PageContainer>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// KOMPONEN MODAL FORM ROLE (HARMONIZED)
// ─────────────────────────────────────────────────────────────────────────────
function RoleFormModal({
  isOpen,
  onClose,
  onSubmit,
  initialData = null,
  allPermissions = [],
  isSubmitting = false,
}) {
  const isEdit = Boolean(initialData?.id && !String(initialData.id).startsWith('default-'))
  const [name, setName] = useState('')
  const [selectedPerms, setSelectedPerms] = useState([])
  const [searchPerm, setSearchPerm] = useState('')
  const [expandedModuls, setExpandedModuls] = useState({})

  React.useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setName(initialData.name || '')
        const currentPerms = (initialData.permissions || []).map((p) =>
          typeof p === 'string' ? p : p.name
        )
        setSelectedPerms(currentPerms)
      } else {
        setName('')
        setSelectedPerms([])
      }
      setSearchPerm('')
    }
  }, [isOpen, initialData])

  if (!isOpen) return null

  const grouped = allPermissions.reduce((acc, p) => {
    const pName = typeof p === 'string' ? p : p.name
    const modul = pName.split('.')[0] || 'umum'
    if (!acc[modul]) acc[modul] = []
    acc[modul].push(pName)
    return acc
  }, {})

  const togglePerm = (perm) => {
    setSelectedPerms((prev) =>
      prev.includes(perm) ? prev.filter((p) => p !== perm) : [...prev, perm]
    )
  }

  const toggleModulAll = (modulPerms, select) => {
    if (select) {
      setSelectedPerms((prev) => Array.from(new Set([...prev, ...modulPerms])))
    } else {
      setSelectedPerms((prev) => prev.filter((p) => !modulPerms.includes(p)))
    }
  }

  const toggleModulExpand = (modul) => {
    setExpandedModuls((prev) => ({ ...prev, [modul]: !prev[modul] }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!name.trim()) return
    onSubmit({
      name: name.trim(),
      permissions: selectedPerms,
    })
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/70 backdrop-blur-md overflow-y-auto"
      role="dialog"
      aria-modal="true"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget && !isSubmitting) onClose()
      }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 14 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        transition={{ type: 'spring', stiffness: 400, damping: 28 }}
        className="my-auto w-full max-w-2xl font-sans"
      >
        <div className="flex max-h-[calc(100dvh-2.5rem)] flex-col overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-2xl shadow-emerald-950/20 dark:border-slate-800 dark:bg-[#182232]">
          {/* Top Accent Gradient Bar */}
          <div
            className={cn(
              'h-1.5 w-full shrink-0',
              isEdit
                ? 'bg-gradient-to-r from-amber-500 via-teal-400 to-emerald-600'
                : 'bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-600'
            )}
          />

          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-100 bg-white px-6 py-4.5 dark:border-slate-800 dark:bg-slate-950 shrink-0">
            <div className="flex items-center gap-3.5">
              <div
                className={cn(
                  'rounded-2xl text-white p-3 shadow-md shrink-0 border',
                  isEdit
                    ? 'bg-gradient-to-br from-amber-500 via-amber-600 to-orange-600 shadow-amber-500/30 border-amber-300/30'
                    : 'bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700 shadow-emerald-500/30 border-emerald-300/30'
                )}
              >
                <Shield className="size-5" strokeWidth={2.25} />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-base sm:text-lg font-black tracking-tight text-slate-900 dark:text-white">
                    {isEdit ? 'Ubah Matriks Role' : 'Tambah Role Akses Baru'}
                  </h2>
                  <span
                    className={cn(
                      'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-black border',
                      isEdit
                        ? 'bg-amber-50 text-amber-800 border-amber-200/80 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800/60'
                        : 'bg-emerald-50 text-emerald-800 border-emerald-200/80 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800/60'
                    )}
                  >
                    <Sparkles className="size-3" />
                    {isEdit ? 'Edit Data' : 'Role Baru'}
                  </span>
                </div>
                <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                  Konfigurasikan nama peran dan centang izin hak akses modul yang diperbolehkan.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="rounded-xl p-2 bg-gradient-to-br from-rose-500 via-rose-600 to-red-700 text-white border border-rose-300/40 hover:scale-105 transition-all duration-200 cursor-pointer disabled:opacity-40"
            >
              <X className="size-4" strokeWidth={2.25} />
            </button>
          </div>

          {/* Form Content */}
          <form onSubmit={handleSubmit} className="flex flex-1 flex-col overflow-hidden">
            <div className="flex-1 space-y-4 overflow-y-auto p-6 text-slate-800 dark:text-slate-100">
              {/* Nama Role Input */}
              <div>
                <label className="mb-1.5 block text-xs font-bold text-slate-700 dark:text-slate-300">
                  Nama Role <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Shield className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-emerald-700 dark:text-emerald-400" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Contoh: Waka Kesiswaan, Operator CBT, Musyrif Asrama"
                    className="w-full rounded-xl border border-slate-200/90 bg-slate-50/50 pl-10 pr-4 py-2.5 text-xs font-semibold text-slate-800 focus:border-[#0E5C44] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#0E5C44]/12 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                  />
                </div>
              </div>

              {/* Header Pemilihan Permissions */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <Key className="size-3.5 text-emerald-700 dark:text-emerald-400" />
                    <span>Daftar Izin Modul Terpilih:</span>
                    <span className="rounded-full bg-emerald-100 text-emerald-900 dark:bg-emerald-950/80 dark:text-emerald-300 px-2 py-0.2 text-[10px] font-black">
                      {selectedPerms.length} dari {allPermissions.length}
                    </span>
                  </label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        setSelectedPerms(allPermissions.map((p) => (typeof p === 'string' ? p : p.name)))
                      }
                      className="text-[10px] font-bold text-emerald-700 hover:underline cursor-pointer"
                    >
                      Pilih Semua
                    </button>
                    <span className="text-slate-300">|</span>
                    <button
                      type="button"
                      onClick={() => setSelectedPerms([])}
                      className="text-[10px] font-bold text-rose-600 hover:underline cursor-pointer"
                    >
                      Batal Pilih
                    </button>
                  </div>
                </div>

                {/* Filter Cari Permission */}
                <div className="relative mb-3">
                  <Search className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 size-3.5 text-slate-400" />
                  <input
                    type="text"
                    value={searchPerm}
                    onChange={(e) => setSearchPerm(e.target.value)}
                    placeholder="Filter nama izin akses..."
                    className="w-full rounded-xl border border-slate-200/80 bg-white pl-9 pr-3 py-1.5 text-xs text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  />
                </div>

                {/* Accordion List Modul Permissions */}
                <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                  {Object.entries(grouped).map(([modul, perms]) => {
                    const filteredModulPerms = perms.filter(
                      (p) =>
                        !searchPerm ||
                        p.toLowerCase().includes(searchPerm.toLowerCase()) ||
                        getPermissionLabel(p).toLowerCase().includes(searchPerm.toLowerCase())
                    )

                    if (filteredModulPerms.length === 0) return null

                    const allSelectedInModul = filteredModulPerms.every((p) => selectedPerms.includes(p))
                    const selectedCountInModul = filteredModulPerms.filter((p) => selectedPerms.includes(p)).length
                    const isExpanded = expandedModuls[modul] ?? (searchPerm.length > 0 || selectedCountInModul > 0)

                    return (
                      <div
                        key={modul}
                        className="rounded-2xl border border-slate-200/80 bg-slate-50/50 dark:border-slate-800 dark:bg-slate-900/40 overflow-hidden"
                      >
                        <div className="flex items-center justify-between px-3.5 py-2.5 bg-slate-100/70 dark:bg-slate-800/70">
                          <button
                            type="button"
                            onClick={() => toggleModulExpand(modul)}
                            className="flex items-center gap-2 text-xs font-black text-slate-800 dark:text-slate-100 cursor-pointer"
                          >
                            {isExpanded ? <ChevronDown className="size-3.5 text-slate-500" /> : <ChevronRight className="size-3.5 text-slate-500" />}
                            <span>{getModulLabel(modul)}</span>
                            <span className="rounded-full bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-300 px-1.5 py-0.2 text-[10px] font-extrabold">
                              {selectedCountInModul} / {filteredModulPerms.length}
                            </span>
                          </button>

                          <button
                            type="button"
                            onClick={() => toggleModulAll(filteredModulPerms, !allSelectedInModul)}
                            className="text-[10px] font-bold text-emerald-700 hover:text-emerald-900 dark:text-emerald-400 cursor-pointer"
                          >
                            {allSelectedInModul ? 'Batal Semua' : 'Centang Semua'}
                          </button>
                        </div>

                        {isExpanded && (
                          <div className="p-3 grid grid-cols-1 gap-1.5 sm:grid-cols-2">
                            {filteredModulPerms.map((p) => {
                              const checked = selectedPerms.includes(p)
                              return (
                                <label
                                  key={p}
                                  className={cn(
                                    'flex items-start gap-2 rounded-xl p-2 border transition-all cursor-pointer text-xs',
                                    checked
                                      ? 'bg-emerald-50/70 border-emerald-300 text-emerald-950 dark:bg-emerald-950/40 dark:border-emerald-800 dark:text-emerald-100'
                                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300'
                                  )}
                                >
                                  <input
                                    type="checkbox"
                                    checked={checked}
                                    onChange={() => togglePerm(p)}
                                    className="mt-0.5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                                  />
                                  <div className="min-w-0 flex-1">
                                    <span className="font-bold block leading-tight truncate">
                                      {getPermissionLabel(p)}
                                    </span>
                                    <code className="text-[10px] text-slate-400 dark:text-slate-500 font-mono truncate block">
                                      {p}
                                    </code>
                                  </div>
                                </label>
                              )
                            })}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 border-t border-slate-100 bg-slate-50/50 px-6 py-4 dark:border-slate-800 dark:bg-slate-900/30 shrink-0">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-2.5 text-xs font-black text-rose-700 hover:bg-rose-100 dark:border-rose-800 dark:bg-rose-950/50 dark:text-rose-300 transition-all cursor-pointer"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !name.trim()}
                className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700 px-5 py-2.5 text-xs font-black text-white shadow-md shadow-emerald-600/30 hover:scale-[1.02] active:scale-95 transition-all cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Save className="size-4" strokeWidth={2.2} />
                )}
                <span>{isEdit ? 'Simpan Matriks Role' : 'Tambah Role Baru'}</span>
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// KOMPONEN MODAL PERMISSION (HARMONIZED)
// ─────────────────────────────────────────────────────────────────────────────
function PermissionFormModal({ isOpen, onClose, onSubmit, isSubmitting = false }) {
  const [name, setName] = useState('')
  const [error, setError] = useState('')

  React.useEffect(() => {
    if (isOpen) {
      setName('')
      setError('')
    }
  }, [isOpen])

  if (!isOpen) return null

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!name.trim()) {
      setError('Nama izin akses tidak boleh kosong.')
      return
    }
    if (!name.includes('.')) {
      setError('Format nama harus "modul.aksi", contoh: kehadiran.monitoring')
      return
    }
    onSubmit({ name: name.trim() })
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/70 backdrop-blur-md overflow-y-auto"
      role="dialog"
      aria-modal="true"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget && !isSubmitting) onClose()
      }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 14 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        transition={{ type: 'spring', stiffness: 400, damping: 28 }}
        className="my-auto w-full max-w-md font-sans"
      >
        <div className="flex max-h-[calc(100dvh-2.5rem)] flex-col overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-2xl shadow-emerald-950/20 dark:border-slate-800 dark:bg-[#182232]">
          <div className="h-1.5 w-full bg-gradient-to-r from-sky-500 via-teal-400 to-emerald-600 shrink-0" />
          <div className="flex items-center justify-between border-b border-slate-100 bg-white px-6 py-4.5 dark:border-slate-800 dark:bg-slate-950">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-gradient-to-br from-sky-500 via-sky-600 to-blue-700 text-white p-2.5 shadow-md shadow-sky-600/30 border border-sky-300/40 shrink-0">
                <Key className="size-5" />
              </div>
              <div>
                <h2 className="text-sm sm:text-base font-black text-slate-900 dark:text-white">
                  Tambah Izin Akses Granular
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Daftarkan permission baru ke sistem
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl p-2 bg-gradient-to-br from-rose-500 via-rose-600 to-red-700 text-white border border-rose-300/40 hover:scale-105 transition-all duration-200 cursor-pointer"
            >
              <X className="size-4" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-bold text-slate-700 dark:text-slate-300">
                Nama Izin Akses <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Key className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-sky-600" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value)
                    setError('')
                  }}
                  placeholder="Contoh: tahfizh.monitoring_target, kesiswaan.kelulusan"
                  className="w-full rounded-xl border border-slate-200/90 bg-slate-50/50 pl-10 pr-4 py-2.5 text-xs font-semibold text-slate-800 focus:border-[#0E5C44] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#0E5C44]/12 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                />
              </div>
              {error && <p className="mt-1.5 text-xs font-bold text-rose-500">{error}</p>}
              <p className="mt-1.5 text-[11px] text-slate-500 dark:text-slate-400">
                Format standar: <code className="bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded font-bold">modul.aksi</code>
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={onClose}
                className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-2 text-xs font-black text-rose-700 hover:bg-rose-100 dark:border-rose-800 dark:bg-rose-950/50 dark:text-rose-300 transition-all cursor-pointer"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !name.trim()}
                className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-br from-sky-500 via-sky-600 to-blue-700 px-5 py-2.5 text-xs font-black text-white shadow-md shadow-sky-600/30 hover:scale-[1.02] active:scale-95 transition-all cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
                <span>Simpan Izin Akses</span>
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// KOMPONEN MODAL PEGAWAI ROLE (HARMONIZED)
// ─────────────────────────────────────────────────────────────────────────────
function PegawaiRoleModal({
  isOpen,
  onClose,
  onSubmit,
  employee = null,
  availableRoles = [],
  allPermissions = [],
  isSubmitting = false,
}) {
  const [roleName, setRoleName] = useState('')
  const [selectedPerms, setSelectedPerms] = useState([])
  const [password, setPassword] = useState('')

  const isProtectedEmployee =
    employee?.primary_role === 'Super Admin' ||
    employee?.primary_role === 'Admin' ||
    employee?.is_super_admin

  React.useEffect(() => {
    if (isOpen && employee) {
      const initialRole = getSmartDefaultRole(employee, availableRoles)
      setRoleName(initialRole)
      setSelectedPerms(
        (employee.direct_permissions || []).filter((permission) => allPermissions.includes(permission))
      )
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

  const initials = (employee.nama_lengkap || 'P')
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/70 backdrop-blur-md overflow-y-auto"
      role="dialog"
      aria-modal="true"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget && !isSubmitting) onClose()
      }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 14 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        transition={{ type: 'spring', stiffness: 400, damping: 28 }}
        className="my-auto w-full max-w-xl font-sans"
      >
        <div className="flex max-h-[calc(100dvh-2.5rem)] flex-col overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-2xl shadow-emerald-950/20 dark:border-slate-800 dark:bg-[#182232]">
          <div className="h-1.5 w-full bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-600 shrink-0" />
          <div className="flex items-center justify-between border-b border-slate-100 bg-white px-6 py-4.5 dark:border-slate-800 dark:bg-slate-950">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700 text-white p-2.5 shadow-md shadow-emerald-600/30 border border-emerald-300/40 shrink-0">
                <UserCog className="size-5" />
              </div>
              <div>
                <h2 className="text-sm sm:text-base font-black text-slate-900 dark:text-white">
                  Penetapan Hak Akses Pegawai
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Atur peran dan akun login pengguna
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl p-2 bg-gradient-to-br from-rose-500 via-rose-600 to-red-700 text-white border border-rose-300/40 hover:scale-105 transition-all duration-200 cursor-pointer"
            >
              <X className="size-4" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-1 flex-col overflow-hidden">
            <div className="flex-1 space-y-4 overflow-y-auto p-6 text-slate-800 dark:text-slate-100">
              {/* Employee Summary Card */}
              <div className="flex items-center gap-3.5 rounded-2xl border border-emerald-200/80 bg-emerald-50/50 p-4 dark:border-emerald-800 dark:bg-emerald-950/30">
                <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-700 text-white font-black text-sm shadow-xs">
                  {initials}
                </div>
                <div className="min-w-0">
                  <h3 className="text-sm font-black text-slate-900 dark:text-white truncate">
                    {employee.nama_lengkap}
                  </h3>
                  <p className="text-xs font-semibold text-slate-600 dark:text-slate-300 mt-0.5">
                    NIY: <span className="font-bold">{employee.niy || '-'}</span> • {employee.position?.nama || 'Staf Yayasan'}
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    Unit: {employee.unit?.nama || 'Seluruh Unit / Pusat'}
                  </p>
                </div>
              </div>

              {/* Status Akun Callout */}
              <div
                className={cn(
                  'flex items-center gap-3 rounded-2xl border p-3.5',
                  employee.has_user
                    ? 'border-emerald-200 bg-emerald-50/70 text-emerald-950 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-200'
                    : 'border-amber-200 bg-amber-50/70 text-amber-950 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-200'
                )}
              >
                <div
                  className={cn(
                    'flex size-8 shrink-0 items-center justify-center rounded-xl text-white shadow-xs',
                    employee.has_user ? 'bg-emerald-600' : 'bg-amber-600'
                  )}
                >
                  {employee.has_user ? <UserCheck className="size-4" /> : <UserX className="size-4" />}
                </div>
                <div className="min-w-0 text-xs">
                  <p className="font-bold">
                    {employee.has_user
                      ? `Akun Login Terhubung: ${employee.user_email || employee.email || 'Aktif'}`
                      : 'Belum Memiliki Akun Login'}
                  </p>
                  <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-0.5">
                    {employee.has_user
                      ? 'Role dan otoritas akan otomatis sinkron saat pegawai login ke portal.'
                      : 'Sistem akan otomatis membuat akun pengguna baru untuk pegawai ini.'}
                  </p>
                </div>
              </div>

              {!employee.has_user && (
                <div>
                  <label className="mb-1.5 block text-xs font-bold text-slate-700 dark:text-slate-300">
                    Password Awal Akun <span className="text-slate-400 font-normal">(Opsional, default: 12345678)</span>
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Masukkan password awal atau biarkan kosong untuk default..."
                    className="w-full rounded-xl border border-slate-200/90 bg-slate-50/50 px-3.5 py-2.5 text-xs font-semibold text-slate-800 focus:border-[#0E5C44] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#0E5C44]/12 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                  />
                </div>
              )}

              {/* Pilihan Role Utama */}
              <div>
                <label className="mb-1.5 block text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                  <span>
                    Pilih Role Utama Pegawai <span className="text-rose-500">*</span>
                  </span>
                  {isProtectedEmployee && (
                    <span className="inline-flex items-center gap-1 rounded-md bg-amber-100 px-2 py-0.5 text-[10px] font-black text-amber-800">
                      <Lock className="size-3" /> Terkunci (Role Sistem)
                    </span>
                  )}
                </label>
                <select
                  disabled={isProtectedEmployee}
                  value={roleName}
                  onChange={(e) => setRoleName(e.target.value)}
                  className="w-full rounded-xl border border-slate-200/90 bg-slate-50/50 px-3.5 py-2.5 text-xs font-semibold text-slate-800 focus:border-[#0E5C44] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#0E5C44]/12 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 disabled:opacity-60"
                >
                  {availableRoles.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 border-t border-slate-100 bg-slate-50/50 px-6 py-4 dark:border-slate-800 dark:bg-slate-900/30 shrink-0">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-2.5 text-xs font-black text-rose-700 hover:bg-rose-100 dark:border-rose-800 dark:bg-rose-950/50 dark:text-rose-300 transition-all cursor-pointer"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700 px-5 py-2.5 text-xs font-black text-white shadow-md shadow-emerald-600/30 hover:scale-[1.02] active:scale-95 transition-all cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
                <span>Simpan Akses Pegawai</span>
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  )
}
