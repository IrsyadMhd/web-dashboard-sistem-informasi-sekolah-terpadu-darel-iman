import React, { useState, useEffect, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import {
  BookOpen,
  Printer,
  CheckCircle2,
  XCircle,
  Tag,
  RotateCcw,
  AlertTriangle,
  Sparkles,
  ShieldCheck,
  Trash2,
  X,
  ChevronDown,
  RefreshCcw,
  Building2,
  Calendar,
  Download,
  FileSpreadsheet,
  FileText,
} from 'lucide-react'
import { api } from '../services/api'
import { masterKurikulumService } from '../services/masterKurikulumService'
import { tahunAjaranService } from '../services/tahunAjaranService'
import KurikulumTable from '../components/kurikulum/KurikulumTable'
import KurikulumFormModal from '../components/kurikulum/KurikulumFormModal'
import KurikulumDetailModal from '../components/kurikulum/KurikulumDetailModal'
import KurikulumImportModal from '../components/kurikulum/KurikulumImportModal'
import PageContainer from '../components/app/PageContainer'
import AppBreadcrumb from '../components/app/AppBreadcrumb'
import AppDataTable from '../components/app/AppDataTable'
import { Download1, Upload1, Plus as PlusIcon } from '@tailgrids/icons'
import { printCleanTable, downloadPdfTable } from '../utils/printHelper'
import { handleApiExport } from '../utils/exportUtils'
import { useAuthStore } from '../stores/authStore'
import { isGlobalAccessManager } from '../auth/portalResolver'
import { PrintOptionModal } from '../components/master-data'
import { useDebounce } from '../hooks/useDebounce'
import { cn } from '../lib/utils'

const JENIS_LIST = ['SIT', 'Merdeka', 'Nasional', 'Pesantren', 'Lokal', 'Lainnya']
const JENJANG_LIST = ['TK', 'PAUD', 'SD', 'MI', 'SMP', 'MTs', 'SMA', 'MA', 'Pesantren']

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.05 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 350, damping: 26 },
  },
}

const MODERN_CARD_TONES = {
  emerald: {
    card: 'border-emerald-200/80 bg-gradient-to-br from-white via-emerald-50/20 to-teal-50/20 dark:border-emerald-900/40 dark:bg-gradient-to-br dark:from-slate-900 dark:via-emerald-950/20 dark:to-slate-900',
    glow: 'bg-emerald-500/10 dark:bg-emerald-500/20',
    iconBox: 'bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700 text-white shadow-emerald-600/30 border border-emerald-300/40',
    tag: 'bg-emerald-100/90 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/60',
    title: 'text-emerald-950 dark:text-emerald-300',
    sub: 'text-emerald-800/80 dark:text-emerald-400',
    cta: 'text-emerald-700 dark:text-emerald-300',
  },
  teal: {
    card: 'border-teal-200/80 bg-gradient-to-br from-white via-teal-50/20 to-cyan-50/20 dark:border-teal-900/40 dark:bg-gradient-to-br dark:from-slate-900 dark:via-teal-950/20 dark:to-slate-900',
    glow: 'bg-teal-500/10 dark:bg-teal-500/20',
    iconBox: 'bg-gradient-to-br from-teal-500 via-teal-600 to-cyan-700 text-white shadow-teal-600/30 border border-teal-300/40',
    tag: 'bg-teal-100/90 text-teal-800 dark:bg-teal-950/60 dark:text-teal-300 border border-teal-200/60 dark:border-teal-800/60',
    title: 'text-teal-950 dark:text-teal-300',
    sub: 'text-teal-800/80 dark:text-teal-400',
    cta: 'text-teal-700 dark:text-teal-300',
  },
  amber: {
    card: 'border-amber-200/80 bg-gradient-to-br from-white via-amber-50/20 to-yellow-50/20 dark:border-amber-900/40 dark:bg-gradient-to-br dark:from-slate-900 dark:via-amber-950/20 dark:to-slate-900',
    glow: 'bg-amber-500/10 dark:bg-amber-500/20',
    iconBox: 'bg-gradient-to-br from-amber-500 via-amber-600 to-orange-700 text-white shadow-amber-600/30 border border-amber-300/40',
    tag: 'bg-amber-100/90 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200/60 dark:border-amber-800/60',
    title: 'text-amber-950 dark:text-amber-300',
    sub: 'text-amber-800/80 dark:text-amber-400',
    cta: 'text-amber-700 dark:text-amber-300',
  },
  indigo: {
    card: 'border-indigo-200/80 bg-gradient-to-br from-white via-indigo-50/20 to-violet-50/20 dark:border-indigo-900/40 dark:bg-gradient-to-br dark:from-slate-900 dark:via-indigo-950/20 dark:to-slate-900',
    glow: 'bg-indigo-500/10 dark:bg-indigo-500/20',
    iconBox: 'bg-gradient-to-br from-indigo-500 via-indigo-600 to-violet-700 text-white shadow-indigo-600/30 border border-indigo-300/40',
    tag: 'bg-indigo-100/90 text-indigo-800 dark:bg-indigo-950/60 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800/60',
    title: 'text-indigo-950 dark:text-indigo-300',
    sub: 'text-indigo-800/80 dark:text-indigo-400',
    cta: 'text-indigo-700 dark:text-indigo-300',
  },
}

function ModernKpiCard({ icon: Icon, label, subtext, value, tag, tone = 'emerald', onClick }) {
  const t = MODERN_CARD_TONES[tone] || MODERN_CARD_TONES.emerald
  const isClickable = typeof onClick === 'function'
  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      onClick={onClick}
      role={isClickable ? 'button' : undefined}
      tabIndex={isClickable ? 0 : undefined}
      className={cn(
        'group relative overflow-hidden rounded-[20px] border p-5 shadow-xs transition-all duration-200',
        t.card,
        isClickable && 'cursor-pointer hover:shadow-md'
      )}
    >
      <div className={cn('pointer-events-none absolute -right-6 -top-6 h-28 w-28 rounded-full blur-2xl transition-all duration-300', t.glow)} />
      <div className="relative z-10 flex items-start justify-between gap-3 mb-3">
        <div className={cn('flex size-11 items-center justify-center rounded-2xl shadow-md transition-transform duration-200 group-hover:scale-105', t.iconBox)}>
          <Icon className="size-5" strokeWidth={2.2} />
        </div>
        {tag && (
          <span className={cn('inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-extrabold tracking-wide uppercase', t.tag)}>
            <Sparkles className="size-2.5" />
            {tag}
          </span>
        )}
      </div>
      <div className="relative z-10">
        <span className={cn('text-xs font-bold uppercase tracking-wider block mb-0.5', t.title)}>{label}</span>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white tabular-nums">
            {value}
          </span>
        </div>
        {subtext && <p className={cn('text-[11px] font-medium mt-1 leading-snug', t.sub)}>{subtext}</p>}
      </div>
      {isClickable && (
        <div className="relative z-10 mt-3 pt-2.5 border-t border-slate-200/50 dark:border-slate-800/60 flex items-center justify-between text-[11px] font-bold">
          <span className="text-slate-500 dark:text-slate-400">Klik untuk filter</span>
          <span className={cn('flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform', t.cta)}>
            Rincian &rarr;
          </span>
        </div>
      )}
    </motion.div>
  )
}

function ToastStack({ toasts, onDismiss }) {
  return (
    <aside
      aria-label="Notifikasi sistem"
      className="pointer-events-none fixed bottom-5 right-5 z-[80] flex flex-col gap-2 max-w-sm w-full px-4 sm:px-0"
    >
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 450, damping: 30 }}
            className={`pointer-events-auto flex items-start gap-3 rounded-2xl border p-4 shadow-xl backdrop-blur-md ${
              toast.type === 'error'
                ? 'border-rose-200 bg-white/95 text-rose-900 dark:border-rose-800/70 dark:bg-[#1C2637]/95 dark:text-rose-200'
                : 'border-emerald-200 bg-white/95 text-emerald-900 dark:border-emerald-800/70 dark:bg-[#1C2637]/95 dark:text-emerald-200'
            }`}
          >
            <div
              className={`flex size-8 shrink-0 items-center justify-center rounded-xl ${
                toast.type === 'error'
                  ? 'bg-rose-100 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400'
                  : 'bg-emerald-100 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400'
              }`}
            >
              {toast.type === 'error' ? (
                <AlertTriangle className="size-4" strokeWidth={2.2} />
              ) : (
                <CheckCircle2 className="size-4" strokeWidth={2.2} />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-slate-900 dark:text-white leading-tight">{toast.title}</p>
              {toast.message && (
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-snug">{toast.message}</p>
              )}
            </div>
            <button
              type="button"
              onClick={() => onDismiss(toast.id)}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition"
              aria-label="Tutup notifikasi"
            >
              <X className="size-3.5" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </aside>
  )
}

function getJenjangFromUnit(unit) {
  if (!unit) return ''
  const str = `${unit.code || ''} ${unit.level || ''} ${unit.name || ''} ${unit.nama || ''} ${unit.tingkat || ''}`.toUpperCase()

  if (str.includes('TAUD') || str.includes('PAUD')) return 'PAUD'
  if (str.includes('TK')) return 'TK'
  if (str.includes('MIT') || str.includes(' MI ') || str.endsWith(' MI') || str.startsWith('MI ')) return 'MI'
  if (str.includes('SD')) return 'SD'
  if (str.includes('MTS')) return 'MTs'
  if (str.includes('SMP')) return 'SMP'
  if (str.includes('MA') && !str.includes('SMA') && !str.includes('MAHAD')) return 'MA'
  if (str.includes('SMA')) return 'SMA'
  if (str.includes('PESANTREN') || str.includes('PONPES') || str.includes('MAHAD')) return 'Pesantren'

  return ''
}

export default function MasterKurikulumPage({ embedded = false, hidePageHeader = false, hideBreadcrumb = false }) {
  const queryClient = useQueryClient()

  // User Auth & Role Scoping
  const user = useAuthStore((state) => state.user)
  const userRoles = useMemo(() => {
    if (!user) return []
    const rawRoles = user.roles || (user.role ? [user.role] : []) || user.role_names || []
    const list = Array.isArray(rawRoles) ? rawRoles : [rawRoles]
    return list.map((r) => (typeof r === 'string' ? r : r?.name || r?.role_name || r?.nama || ''))
  }, [user])

  const canViewAllUnits = useMemo(() => {
    if (!user || userRoles.length === 0) return false
    return isGlobalAccessManager(userRoles)
  }, [user, userRoles])

  const canDelete = useMemo(() => {
    if (!user) return false
    const perms = Array.isArray(user?.permissions) ? user.permissions : []
    return (
      isGlobalAccessManager(userRoles) ||
      perms.includes('academic.curriculum.delete') ||
      perms.includes('sistem.master_data')
    )
  }, [user, userRoles])

  // Fetch Education Units
  const { data: unitsData = [] } = useQuery({
    queryKey: ['education-units-list-kurikulum'],
    queryFn: async () => {
      const res = await api.get('/education-units')
      return res.data?.data || res.data || []
    },
    staleTime: 60000,
  })
  const educationUnits = Array.isArray(unitsData) ? unitsData : unitsData?.items || []

  const userUnitId = useMemo(() => {
    const candidateIds = [
      user?.unit_id,
      user?.unit_pendidikan_id,
      user?.education_unit_id,
      user?.unit?.id,
      user?.education_unit?.id,
      user?.unit_pendidikan?.id,
      user?.employee?.unit_id,
      user?.employee?.unit_pendidikan_id,
      user?.employee?.education_unit_id,
      user?.employee?.unit?.id,
      user?.employee?.education_unit?.id,
      user?.school_info?.id,
    ].filter(Boolean)

    return candidateIds.length > 0 ? String(candidateIds[0]) : null
  }, [user])

  const userUnitName = useMemo(() => {
    const candidateNames = [
      typeof user?.education_unit === 'string' ? user.education_unit : null,
      typeof user?.unit === 'string' ? user.unit : null,
      user?.unit_name,
      user?.education_unit_name,
      user?.unit_pendidikan_name,
      user?.unit?.name || user?.unit?.nama,
      user?.education_unit?.name || user?.education_unit?.nama,
      user?.employee?.unit?.name || user?.employee?.education_unit?.name,
      user?.school_info?.nama || user?.school_info?.name,
    ]
      .filter(Boolean)
      .map((s) => String(s).toLowerCase().trim())

    return candidateNames.length > 0 ? candidateNames[0] : ''
  }, [user])

  const availableUnitOptions = useMemo(() => {
    const allUnits = educationUnits || []
    if (canViewAllUnits) {
      return allUnits
    }

    if (userUnitId) {
      const filtered = allUnits.filter((u) => String(u.id) === String(userUnitId))
      if (filtered.length > 0) return filtered
    }

    if (userUnitName) {
      const matched = allUnits.filter((u) => {
        const uName = String(u.name || u.nama || '').toLowerCase().trim()
        const uCode = String(u.code || u.kode || '').toLowerCase().trim()
        return (
          uName === userUnitName ||
          uCode === userUnitName ||
          userUnitName.includes(uName) ||
          uName.includes(userUnitName)
        )
      })
      if (matched.length > 0) return matched
    }

    return allUnits.length > 0 ? [allUnits[0]] : []
  }, [educationUnits, canViewAllUnits, userUnitId, userUnitName])

  const effectiveUserUnitId = useMemo(() => {
    if (canViewAllUnits) return ''
    if (userUnitId) return String(userUnitId)
    if (availableUnitOptions.length > 0) return String(availableUnitOptions[0].id)
    return ''
  }, [canViewAllUnits, userUnitId, availableUnitOptions])

  // Filter & Pagination States
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebounce(search, 350)
  const [selectedUnitFilter, setSelectedUnitFilter] = useState('')
  const [selectedTahunFilter, setSelectedTahunFilter] = useState('')
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('')
  const [selectedJenisFilter, setSelectedJenisFilter] = useState('')
  const [selectedJenjangFilter, setSelectedJenjangFilter] = useState('')
  const [denganSampahFilter, setDenganSampahFilter] = useState('')
  const [page, setPage] = useState(1)
  const perPage = 15

  // Fetch Academic Years options from database
  const { data: tahunAjaranOptions = [] } = useQuery({
    queryKey: ['master-kurikulum-tahun-ajaran-options'],
    queryFn: () => tahunAjaranService.getDropdown(),
    staleTime: 5 * 60 * 1000,
  })

  // Toast Stack state
  const [toasts, setToasts] = useState([])
  const pushToast = (title, message, type = 'success') => {
    const id = Date.now() + Math.random()
    setToasts((prev) => [...prev, { id, title, message, type }])
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, 4500)
  }
  const dismissToast = (id) => setToasts((prev) => prev.filter((t) => t.id !== id))

  // Delete & Restore Confirmation state
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [restoreTarget, setRestoreTarget] = useState(null)

  const activeUnitObj = useMemo(() => {
    const targetId = selectedUnitFilter || effectiveUserUnitId
    if (!targetId) return null
    return (educationUnits || []).find((u) => String(u.id) === String(targetId)) || null
  }, [selectedUnitFilter, effectiveUserUnitId, educationUnits])

  const activeUnitJenjang = useMemo(() => {
    if (activeUnitObj) {
      const fromUnit = getJenjangFromUnit(activeUnitObj)
      if (fromUnit) return fromUnit
    }
    const candidateStr = [
      typeof user?.education_unit === 'string' ? user.education_unit : null,
      typeof user?.unit === 'string' ? user.unit : null,
      user?.unit_name,
      user?.education_unit_name,
      user?.unit_pendidikan_name,
      user?.unit?.name || user?.unit?.nama || user?.unit?.code,
      user?.education_unit?.name || user?.education_unit?.nama || user?.education_unit?.code,
      user?.employee?.unit?.name || user?.employee?.education_unit?.name,
      user?.school_info?.nama || user?.school_info?.name,
    ].filter(Boolean).join(' ')
    return getJenjangFromUnit({ name: candidateStr, code: candidateStr })
  }, [activeUnitObj, user])

  const availableJenjangOptions = useMemo(() => {
    // Jika filter Unit dipilih secara spesifik
    if (selectedUnitFilter) {
      const selectedUnit = availableUnitOptions.find((u) => String(u.id) === String(selectedUnitFilter))
      const jenjangFromSelected = selectedUnit ? getJenjangFromUnit(selectedUnit) : ''
      if (jenjangFromSelected) {
        const matched = JENJANG_LIST.filter((j) => j.toLowerCase() === jenjangFromSelected.toLowerCase())
        if (matched.length > 0) return matched
      }
    } else if (!canViewAllUnits && activeUnitJenjang) {
      const matched = JENJANG_LIST.filter((j) => j.toLowerCase() === activeUnitJenjang.toLowerCase())
      if (matched.length > 0) return matched
    }
    // Jika sedang memilih "Semua Unit" atau tidak terkunci, tampilkan seluruh jenjang yang valid
    return JENJANG_LIST
  }, [selectedUnitFilter, availableUnitOptions, canViewAllUnits, activeUnitJenjang])

  const availableJenisOptions = useMemo(() => {
    if (!selectedUnitFilter) return JENIS_LIST
    const selectedUnit = availableUnitOptions.find((u) => String(u.id) === String(selectedUnitFilter))
    if (!selectedUnit) return JENIS_LIST
    const str = `${selectedUnit.code || ''} ${selectedUnit.name || ''}`.toUpperCase()
    if (str.includes('PESANTREN') || str.includes('PONPES') || str.includes('MAHAD')) {
      return ['Pesantren', 'SIT', 'Merdeka', 'Nasional', 'Lokal', 'Lainnya']
    }
    return JENIS_LIST
  }, [selectedUnitFilter, availableUnitOptions])

  useEffect(() => {
    if (!canViewAllUnits && effectiveUserUnitId && selectedUnitFilter !== effectiveUserUnitId) {
      setSelectedUnitFilter(effectiveUserUnitId)
    }
  }, [canViewAllUnits, effectiveUserUnitId, selectedUnitFilter])

  // Modal States
  const [isFormModalOpen, setIsFormModalOpen] = useState(false)
  const [selectedForEdit, setSelectedForEdit] = useState(null)

  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
  const [selectedForDetail, setSelectedForDetail] = useState(null)

  const [isImportModalOpen, setIsImportModalOpen] = useState(false)
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false)
  const [showExportModal, setShowExportModal] = useState(false)
  const [exportFormat, setExportFormat] = useState('xlsx')
  const [isExporting, setIsExporting] = useState(false)

  // Query Data List
  const {
    data: responseData = {},
    isLoading,
    isFetching,
    isError,
    refetch,
  } = useQuery({
    queryKey: [
      'master-kurikulum-list',
      page,
      perPage,
      debouncedSearch,
      selectedUnitFilter,
      selectedTahunFilter,
      selectedStatusFilter,
      selectedJenisFilter,
      selectedJenjangFilter,
      denganSampahFilter,
      canViewAllUnits,
      effectiveUserUnitId,
    ],
    queryFn: () => {
      const targetUnitId = !canViewAllUnits ? (effectiveUserUnitId || selectedUnitFilter) : selectedUnitFilter
      const targetJenjang = selectedJenjangFilter || undefined

      return masterKurikulumService.getDaftar({
        page,
        per_page: perPage,
        search: debouncedSearch,
        unit_pendidikan_id: targetUnitId || undefined,
        tahun_ajaran_id: selectedTahunFilter || undefined,
        status: selectedStatusFilter,
        jenis_kurikulum: selectedJenisFilter,
        jenjang: targetJenjang || undefined,
        dengan_sampah: denganSampahFilter,
        order_by: 'created_at',
        order_dir: 'desc',
      })
    },
  })

  const listData = responseData?.data || []
  const meta = responseData?.meta || {}
  const stats = responseData?.statistik || {}
  const statsValue = (value) => (isError ? '—' : value)

  // Mutations with Zero-SweetAlert2 (ToastStack)
  const simpanMutation = useMutation({
    mutationFn: (payload) => masterKurikulumService.tambah(payload),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['master-kurikulum-list'] })
      queryClient.invalidateQueries({ queryKey: ['master-kurikulum-stats'] })
      setIsFormModalOpen(false)
      pushToast('Berhasil Ditambahkan', res?.message || 'Data master kurikulum baru berhasil disimpan.', 'success')
    },
    onError: (err) => {
      const msg = err.response?.data?.message || 'Gagal menyimpan data master kurikulum.'
      pushToast('Gagal Menyimpan', msg, 'error')
    },
  })

  const ubahMutation = useMutation({
    mutationFn: ({ id, payload }) => masterKurikulumService.ubah({ id, payload }),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['master-kurikulum-list'] })
      queryClient.invalidateQueries({ queryKey: ['master-kurikulum-stats'] })
      setIsFormModalOpen(false)
      setSelectedForEdit(null)
      pushToast('Berhasil Diperbarui', res?.message || 'Perubahan data master kurikulum berhasil disimpan.', 'success')
    },
    onError: (err) => {
      const msg = err.response?.data?.message || 'Gagal memperbarui data master kurikulum.'
      pushToast('Gagal Memperbarui', msg, 'error')
    },
  })

  const hapusMutation = useMutation({
    mutationFn: (id) => masterKurikulumService.hapus(id),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['master-kurikulum-list'] })
      queryClient.invalidateQueries({ queryKey: ['master-kurikulum-stats'] })
      setDeleteTarget(null)
      pushToast('Berhasil Dihapus', res?.message || 'Data kurikulum berhasil dipindahkan ke arsip sampah.', 'success')
    },
    onError: (err) => {
      const msg = err.response?.data?.message || 'Gagal menghapus data kurikulum.'
      pushToast('Gagal Menghapus', msg, 'error')
    },
  })

  const pulihkanMutation = useMutation({
    mutationFn: (id) => masterKurikulumService.pulihkan(id),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['master-kurikulum-list'] })
      queryClient.invalidateQueries({ queryKey: ['master-kurikulum-stats'] })
      setRestoreTarget(null)
      pushToast('Berhasil Dipulihkan', res?.message || 'Data kurikulum berhasil diaktifkan kembali.', 'success')
    },
    onError: (err) => {
      const msg = err.response?.data?.message || 'Gagal memulihkan data kurikulum.'
      pushToast('Gagal Memulihkan', msg, 'error')
    },
  })

  const importMutation = useMutation({
    mutationFn: (rows) => masterKurikulumService.prosesImport(rows),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['master-kurikulum-list'] })
      queryClient.invalidateQueries({ queryKey: ['master-kurikulum-stats'] })
      setIsImportModalOpen(false)
      pushToast('Impor Selesai', res?.message || 'Data kurikulum berhasil diimpor ke sistem.', 'success')
    },
    onError: (err) => {
      const msg = err.response?.data?.message || 'Gagal memproses impor data.'
      pushToast('Error Impor', msg, 'error')
    },
  })

  // Handlers
  const handleOpenFormTambah = () => {
    setSelectedForEdit(null)
    setIsFormModalOpen(true)
  }

  const handleOpenFormEdit = (item) => {
    setSelectedForEdit(item)
    setIsFormModalOpen(true)
  }

  const handleOpenDetail = (item) => {
    setSelectedForDetail(item)
    setIsDetailModalOpen(true)
  }

  const handleConfirmDelete = (item) => {
    setDeleteTarget(item)
  }

  const handleConfirmRestore = (item) => {
    setRestoreTarget(item)
  }

  const handleFormSubmit = (payload) => {
    if (selectedForEdit) {
      ubahMutation.mutate({ id: selectedForEdit.id, payload })
    } else {
      simpanMutation.mutate(payload)
    }
  }

  const handleResetFilters = () => {
    setSearch('')
    setSelectedUnitFilter(canViewAllUnits ? '' : effectiveUserUnitId)
    setSelectedTahunFilter('')
    setSelectedStatusFilter('')
    setSelectedJenisFilter('')
    setSelectedJenjangFilter('')
    setDenganSampahFilter('')
    setPage(1)
  }

  const handleProcessExport = async () => {
    try {
      setIsExporting(true)
      await handleApiExport({
        endpoint: '/master/kurikulum/export',
        params: {
          search: debouncedSearch,
          unit_pendidikan_id: selectedUnitFilter || (!canViewAllUnits ? effectiveUserUnitId : undefined),
          tahun_ajaran_id: selectedTahunFilter || undefined,
          status: selectedStatusFilter,
          jenis_kurikulum: selectedJenisFilter,
          jenjang: selectedJenjangFilter,
          format: exportFormat,
        },
        title: 'Ekspor Data Master Kurikulum',
        defaultFilename: `data_master_kurikulum_${exportFormat}`,
      })
      setShowExportModal(false)
      pushToast('Export Berhasil', `Data kurikulum berhasil diekspor (.${exportFormat}).`, 'success')
    } catch (err) {
      pushToast('Gagal Export', 'Terjadi kesalahan saat mengekspor data.', 'error')
    } finally {
      setIsExporting(false)
    }
  }

  const shouldHideBreadcrumb = embedded || hideBreadcrumb
  const shouldHideHeader = embedded || hidePageHeader

  const pageActions = (
    <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0 self-start sm:self-auto flex-wrap">
      {/* 1. Tombol Cetak & Export (Vivid Indigo Squircle + Floating Tooltip) */}
      <div className="group relative inline-flex">
        <button
          type="button"
          title="Cetak & Download Data Kurikulum"
          aria-label="Cetak & Download Data Kurikulum"
          onClick={() => setIsPrintModalOpen(true)}
          className="flex size-10 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 via-indigo-600 to-violet-700 text-white border border-indigo-300/40 hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer"
        >
          <Printer className="size-5 text-white" strokeWidth={2.2} />
        </button>
        <div className="pointer-events-none absolute top-full left-1/2 mt-2 -translate-x-1/2 opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 transition-all duration-200 ease-out z-50 whitespace-nowrap rounded-lg bg-slate-900 px-2.5 py-1 text-[11px] font-bold text-white shadow-xl dark:bg-slate-100 dark:text-slate-900">
          <div className="absolute bottom-full left-1/2 -mb-1 -translate-x-1/2 border-4 border-transparent border-b-slate-900 dark:border-b-slate-100" />
          Cetak & Export
        </div>
      </div>

      {/* 2. Import Button (Vivid Sky Blue Squircle + Floating Tooltip) */}
      <div className="group relative inline-flex">
        <button
          type="button"
          title="Import Data Kurikulum"
          aria-label="Import Data Kurikulum"
          className="flex size-10 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-400 via-sky-500 to-blue-600 text-white border border-sky-300/40 hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer"
          onClick={() => setIsImportModalOpen(true)}
        >
          <Upload1 className="size-5 text-white" strokeWidth={2.2} />
        </button>
        <div className="pointer-events-none absolute top-full left-1/2 mt-2 -translate-x-1/2 opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 transition-all duration-200 ease-out z-50 whitespace-nowrap rounded-lg bg-slate-900 px-2.5 py-1 text-[11px] font-bold text-white shadow-xl dark:bg-slate-100 dark:text-slate-900">
          <div className="absolute bottom-full left-1/2 -mb-1 -translate-x-1/2 border-4 border-transparent border-b-slate-900 dark:border-b-slate-100" />
          Import Data
        </div>
      </div>

      {/* 3. Export Button (Vivid Amber Squircle + Floating Tooltip) */}
      <div className="group relative inline-flex">
        <button
          type="button"
          title="Export Data Kurikulum"
          aria-label="Export Data Kurikulum"
          className="flex size-10 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 via-amber-500 to-orange-600 text-white border border-amber-300/40 hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer"
          onClick={() => setShowExportModal(true)}
        >
          <Download1 className="size-5 text-white" strokeWidth={2.2} />
        </button>
        <div className="pointer-events-none absolute top-full left-1/2 mt-2 -translate-x-1/2 opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 transition-all duration-200 ease-out z-50 whitespace-nowrap rounded-lg bg-slate-900 px-2.5 py-1 text-[11px] font-bold text-white shadow-xl dark:bg-slate-100 dark:text-slate-900">
          <div className="absolute bottom-full left-1/2 -mb-1 -translate-x-1/2 border-4 border-transparent border-b-slate-900 dark:border-b-slate-100" />
          Export Data
        </div>
      </div>

      {/* 4. Tambah Kurikulum Button (Vivid Emerald Squircle + Floating Tooltip) */}
      <div className="group relative inline-flex">
        <button
          type="button"
          title="Tambah Kurikulum Baru"
          aria-label="Tambah Kurikulum Baru"
          className="flex size-10 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700 text-white border border-emerald-300/40 hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer"
          onClick={handleOpenFormTambah}
        >
          <PlusIcon className="size-5 text-white" strokeWidth={2.5} />
        </button>
        <div className="pointer-events-none absolute top-full left-1/2 mt-2 -translate-x-1/2 opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 transition-all duration-200 ease-out z-50 whitespace-nowrap rounded-lg bg-slate-900 px-2.5 py-1 text-[11px] font-bold text-white shadow-xl dark:bg-slate-100 dark:text-slate-900">
          <div className="absolute bottom-full left-1/2 -mb-1 -translate-x-1/2 border-4 border-transparent border-b-slate-900 dark:border-b-slate-100" />
          Tambah Kurikulum
        </div>
      </div>
    </div>
  )

  const hasActiveFilters = Boolean(
    debouncedSearch ||
    (selectedUnitFilter && selectedUnitFilter !== (canViewAllUnits ? '' : effectiveUserUnitId)) ||
    selectedTahunFilter ||
    selectedJenisFilter ||
    selectedJenjangFilter ||
    selectedStatusFilter ||
    denganSampahFilter
  )

  return (
    <PageContainer maxW="7xl">
      {/* ── Print / PDF Report Modal ── */}
      <PrintOptionModal
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
        title="Kurikulum"
        onPrint={() => {
          printCleanTable({
            title: 'Laporan Master Data Kurikulum',
            subtitle: 'Daftar Kurikulum Pendidikan Sekolah Islam Terpadu',
            headers: ['NO', 'KODE', 'NAMA KURIKULUM', 'JENIS', 'JENJANG', 'UNIT PENDIDIKAN', 'TAHUN AJARAN', 'STATUS'],
            rows: listData.map((row, i) => [
              i + 1,
              row.kode_kurikulum || '-',
              row.nama_kurikulum || '-',
              row.jenis_kurikulum || '-',
              row.jenjang || '-',
              row.unit_pendidikan?.name || row.unit_pendidikan || '-',
              row.tahun_ajaran?.nama || row.tahun_ajaran || '-',
              row.status ? 'Aktif' : 'Nonaktif',
            ]),
          })
        }}
        onDownload={() => {
          downloadPdfTable({
            title: 'Laporan Master Data Kurikulum',
            subtitle: 'Daftar Kurikulum Pendidikan Sekolah Islam Terpadu',
            headers: ['NO', 'KODE', 'NAMA KURIKULUM', 'JENIS', 'JENJANG', 'UNIT PENDIDIKAN', 'TAHUN AJARAN', 'STATUS'],
            rows: listData.map((row, i) => [
              i + 1,
              row.kode_kurikulum || row.code || row.kode || '-',
              row.nama_kurikulum || row.name || row.nama || '-',
              row.jenis_kurikulum || row.jenis || '-',
              row.jenjang || '-',
              row.unit_pendidikan?.name || row.unit_pendidikan?.nama || row.unit_name || '-',
              row.tahun_ajaran?.nama || row.tahun_ajaran?.name || '-',
              row.status ? 'Aktif' : 'Nonaktif',
            ]),
            filename: 'laporan_master_kurikulum.pdf',
          })
        }}
      />

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-6"
      >
        {/* Breadcrumb */}
        {!shouldHideBreadcrumb && (
          <motion.div variants={itemVariants}>
            <AppBreadcrumb items={[{ label: 'Master Data', to: '/dashboard/master-kurikulum' }, { label: 'Data Kurikulum' }]} />
          </motion.div>
        )}

        {/* ── TailGrids Modern Hero Header Card ─────────────────────────── */}
        {!shouldHideHeader && (
          <motion.div
            variants={itemVariants}
            className="relative overflow-hidden rounded-[22px] border-2 border-emerald-500/30 bg-gradient-to-r from-emerald-500/15 via-teal-500/10 to-emerald-600/15 p-5 sm:p-6 shadow-md shadow-emerald-500/10 dark:border-emerald-600/40 dark:bg-gradient-to-r dark:from-emerald-950/70 dark:via-teal-950/50 dark:to-slate-900 print:hidden"
          >
            <div className="pointer-events-none absolute -top-20 -right-20 h-56 w-56 rounded-full bg-gradient-to-br from-emerald-500/40 via-teal-400/30 to-emerald-600/20 blur-3xl dark:from-emerald-500/50 dark:via-teal-400/40" />
            <div className="pointer-events-none absolute -bottom-20 -left-20 h-56 w-56 rounded-full bg-gradient-to-tr from-emerald-600/30 via-teal-500/20 to-transparent blur-3xl dark:from-emerald-600/40 dark:via-teal-500/30" />

            <div className="relative z-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-4 min-w-0">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700 text-white shadow-xl shadow-emerald-600/40 border border-emerald-300/40 dark:from-emerald-400 dark:via-emerald-500 dark:to-teal-600">
                  <BookOpen className="h-6 w-6" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                      Master Data Kurikulum SIT
                    </h1>
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-emerald-600 to-teal-600 px-3.5 py-1 text-xs font-extrabold text-white shadow-sm shadow-emerald-600/25 border border-emerald-300/40">
                      <ShieldCheck className="h-3.5 w-3.5" />
                      Manajemen Kurikulum
                    </span>
                  </div>
                  <p className="mt-1 text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300 max-w-2xl leading-relaxed">
                    Kelola seluruh kurikulum pendidikan, integrasi standar SIT & Nasional, serta pengaturan jenjang setiap unit pendidikan.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                <div className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-500/40 bg-gradient-to-r from-emerald-100 via-emerald-50 to-teal-100 px-3.5 py-1.5 text-xs font-black text-emerald-900 dark:border-emerald-700 dark:bg-gradient-to-r dark:from-emerald-950 dark:to-teal-950 dark:text-emerald-200 shadow-2xs">
                  <Sparkles className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>Kurikulum Terpadu</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* ── 4-Kartu Ringkasan KPI Multi-Tone ──────────────────────────── */}
        <motion.div variants={itemVariants}>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <ModernKpiCard
              icon={BookOpen}
              label="Total Kurikulum"
              value={isLoading ? '...' : Number(statsValue(stats.total ?? meta.total ?? listData.length)).toLocaleString('id-ID')}
              tag={`${stats.total ?? listData.length} Terdaftar`}
              subtext="Seluruh kurikulum SIT"
              tone="emerald"
            />
            <ModernKpiCard
              icon={CheckCircle2}
              label="Kurikulum Aktif"
              value={isLoading ? '...' : Number(statsValue(stats.aktif ?? 0)).toLocaleString('id-ID')}
              tag={`${stats.aktif ?? 0} Aktif`}
              subtext="Sedang diberlakukan"
              tone="teal"
            />
            <ModernKpiCard
              icon={XCircle}
              label="Nonaktif / Arsip"
              value={isLoading ? '...' : Number(statsValue(stats.tidak_aktif ?? 0)).toLocaleString('id-ID')}
              tag={`${stats.tidak_aktif ?? 0} Arsip`}
              subtext="Tidak aktif di unit"
              tone="amber"
            />
            <ModernKpiCard
              icon={Tag}
              label="Jenjang Pendidikan"
              value={isLoading ? '...' : `${availableJenjangOptions.length}`}
              tag={`${availableJenjangOptions.length} Jenjang`}
              subtext="Cakupan jenjang sekolah"
              tone="indigo"
            />
          </div>
        </motion.div>

        {/* ── AppDataTable Container Identik Benchmark StudentsPage ── */}
        <motion.div variants={itemVariants}>
          <AppDataTable
            title="Daftar Kurikulum"
            icon={BookOpen}
            iconClassName="bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700 border border-emerald-300/40 text-white shadow-emerald-600/30"
            actionColumnLabel=""
            description="Data kurikulum pendidikan sesuai filter dan kewenangan pengguna."
            countLabel={`${Number(meta.total ?? listData.length).toLocaleString('id-ID')} Kurikulum`}
            actions={pageActions}
            search={search}
            onSearchChange={(value) => {
              setSearch(value)
              setPage(1)
            }}
            filters={
              <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-2 sm:gap-2.5 w-full">
                {/* Filter Unit Pendidikan */}
                <div className="relative w-full sm:w-auto min-w-[140px]">
                  <select
                    aria-label="Filter unit pendidikan"
                    value={selectedUnitFilter}
                    onChange={(e) => {
                      setSelectedUnitFilter(e.target.value)
                      setPage(1)
                    }}
                    disabled={!canViewAllUnits && availableUnitOptions.length <= 1}
                    className="w-full h-9 cursor-pointer appearance-none rounded-xl border border-slate-200 bg-white pl-3 pr-8 text-xs font-semibold text-slate-700 shadow-2xs transition-all hover:border-slate-300 focus:border-[#0E5C44] focus:outline-none focus:ring-2 focus:ring-[#0E5C44]/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-slate-600 disabled:opacity-60"
                  >
                    {canViewAllUnits && <option value="">Semua Unit Pendidikan</option>}
                    {availableUnitOptions.map((unit) => (
                      <option key={unit.id} value={unit.id}>
                        {unit.name || unit.nama}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                </div>

                {/* Filter Tahun Ajaran */}
                <div className="relative w-full sm:w-auto min-w-[140px]">
                  <select
                    aria-label="Filter tahun ajaran"
                    value={selectedTahunFilter}
                    onChange={(e) => {
                      setSelectedTahunFilter(e.target.value)
                      setPage(1)
                    }}
                    className="w-full h-9 cursor-pointer appearance-none rounded-xl border border-slate-200 bg-white pl-3 pr-8 text-xs font-semibold text-slate-700 shadow-2xs transition-all hover:border-slate-300 focus:border-[#0E5C44] focus:outline-none focus:ring-2 focus:ring-[#0E5C44]/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-slate-600"
                  >
                    <option value="">Semua Tahun Ajaran</option>
                    {tahunAjaranOptions.map((tahun) => (
                      <option key={tahun.id} value={tahun.id}>
                        {tahun.name || tahun.nama} {tahun.is_active ? '(Aktif)' : ''}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                </div>

                {/* Filter Jenjang Kurikulum */}
                <div className="relative w-full sm:w-auto min-w-[140px]">
                  <select
                    aria-label="Filter jenjang kurikulum"
                    value={selectedJenjangFilter}
                    onChange={(e) => {
                      setSelectedJenjangFilter(e.target.value)
                      setPage(1)
                    }}
                    className="w-full h-9 cursor-pointer appearance-none rounded-xl border border-slate-200 bg-white pl-3 pr-8 text-xs font-semibold text-slate-700 shadow-2xs transition-all hover:border-slate-300 focus:border-[#0E5C44] focus:outline-none focus:ring-2 focus:ring-[#0E5C44]/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-slate-600"
                  >
                    <option value="">Semua Jenjang</option>
                    {availableJenjangOptions.map((j) => (
                      <option key={j} value={j}>{j}</option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                </div>

                {/* Filter Jenis Kurikulum */}
                <div className="relative w-full sm:w-auto min-w-[140px]">
                  <select
                    aria-label="Filter jenis kurikulum"
                    value={selectedJenisFilter}
                    onChange={(e) => {
                      setSelectedJenisFilter(e.target.value)
                      setPage(1)
                    }}
                    className="w-full h-9 cursor-pointer appearance-none rounded-xl border border-slate-200 bg-white pl-3 pr-8 text-xs font-semibold text-slate-700 shadow-2xs transition-all hover:border-slate-300 focus:border-[#0E5C44] focus:outline-none focus:ring-2 focus:ring-[#0E5C44]/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-slate-600"
                  >
                    <option value="">Semua Jenis</option>
                    {availableJenisOptions.map((j) => (
                      <option key={j} value={j}>{j}</option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                </div>

                {/* Filter Status */}
                <div className="relative w-full sm:w-auto min-w-[140px]">
                  <select
                    aria-label="Filter status kurikulum"
                    value={selectedStatusFilter}
                    onChange={(e) => {
                      setSelectedStatusFilter(e.target.value)
                      setPage(1)
                    }}
                    className="w-full h-9 cursor-pointer appearance-none rounded-xl border border-slate-200 bg-white pl-3 pr-8 text-xs font-semibold text-slate-700 shadow-2xs transition-all hover:border-slate-300 focus:border-[#0E5C44] focus:outline-none focus:ring-2 focus:ring-[#0E5C44]/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-slate-600"
                  >
                    <option value="">Semua Status</option>
                    <option value="aktif">Aktif</option>
                    <option value="tidak_aktif">Nonaktif</option>
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                </div>

                {/* Filter Data Terhapus */}
                <div className="relative w-full sm:w-auto min-w-[140px]">
                  <select
                    aria-label="Filter data terhapus"
                    value={denganSampahFilter}
                    onChange={(e) => {
                      setDenganSampahFilter(e.target.value)
                      setPage(1)
                    }}
                    className="w-full h-9 cursor-pointer appearance-none rounded-xl border border-slate-200 bg-white pl-3 pr-8 text-xs font-semibold text-slate-700 shadow-2xs transition-all hover:border-slate-300 focus:border-[#0E5C44] focus:outline-none focus:ring-2 focus:ring-[#0E5C44]/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-slate-600"
                  >
                    <option value="">Data Aktif</option>
                    <option value="true">Termasuk Terhapus</option>
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                </div>

                {/* Reset Filter Button */}
                {hasActiveFilters && (
                  <button
                    type="button"
                    onClick={handleResetFilters}
                    className="h-9 w-full sm:w-auto sm:ml-auto justify-center px-3 inline-flex items-center gap-1.5 text-xs font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl border border-rose-200 dark:border-rose-900/50 transition cursor-pointer"
                  >
                    <RefreshCcw className="size-3.5" />
                    <span>Reset</span>
                  </button>
                )}
              </div>
            }
            onResetFilters={handleResetFilters}
            hasActiveFilters={hasActiveFilters}
            isLoading={isLoading || isFetching}
            isError={isError}
            errorTitle="Data kurikulum gagal dimuat"
            errorMessage="Periksa koneksi server kemudian coba kembali."
            onRetry={refetch}
            isEmpty={!isLoading && !isFetching && !isError && listData.length === 0}
            emptyTitle="Kurikulum tidak ditemukan"
            emptyDescription="Tidak ada data kurikulum yang cocok dengan kriteria filter."
            page={page}
            totalPages={meta.last_page || 1}
            totalItems={meta.total || listData.length}
            itemsPerPage={perPage}
            onPageChange={setPage}
            meta={{
              total: meta.total ?? listData.length,
              from: meta.from ?? (listData.length ? (page - 1) * perPage + 1 : 0),
              to: meta.to ?? ((page - 1) * perPage + listData.length),
              last_page: meta.last_page ?? 1,
              current_page: meta.current_page ?? page,
              per_page: meta.per_page ?? perPage,
            }}
            serverControlled
            renderTable={() => (
              <KurikulumTable
                data={listData}
                page={page}
                perPage={perPage}
                onDetail={handleOpenDetail}
                onEdit={handleOpenFormEdit}
                onDelete={canDelete ? handleConfirmDelete : undefined}
                onRestore={canDelete ? handleConfirmRestore : undefined}
              />
            )}
          />
        </motion.div>
      </motion.div>

      {/* ── Form Modal Tambah / Edit ──────────────────────────────────── */}
      <KurikulumFormModal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        onSubmit={handleFormSubmit}
        initialData={selectedForEdit}
        isSubmitting={simpanMutation.isPending || ubahMutation.isPending}
        availableUnitOptions={availableUnitOptions}
        canViewAllUnits={canViewAllUnits}
      />

      {/* ── Detail Modal ──────────────────────────────────────────────── */}
      <KurikulumDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        data={selectedForDetail}
      />

      {/* ── Import Modal (Harmonized Batch Modal) ─────────────────────── */}
      <KurikulumImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImport={(rows) => importMutation.mutate(rows)}
        isSubmitting={importMutation.isPending}
      />

      {/* ══════════════════════════════════════════════════════════════════
          HARMONIZED DELETE CONFIRMATION MODAL (z-[70])
      ══════════════════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {deleteTarget && (
          <div
            className="overlay modal fixed inset-0 z-[70] flex items-center justify-center p-3 sm:p-5 bg-slate-950/70 backdrop-blur-md"
            role="dialog"
            aria-modal="true"
            tabIndex={-1}
            onMouseDown={(e) => {
              if (e.target === e.currentTarget && !hapusMutation.isPending) setDeleteTarget(null)
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 14 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ type: 'spring', stiffness: 400, damping: 28 }}
              className="modal-dialog font-sans my-auto w-full max-w-md"
            >
              <div className="modal-content flex max-h-[calc(100dvh-2rem)] flex-col overflow-hidden rounded-3xl border border-rose-200/80 bg-white shadow-2xl shadow-rose-950/20 dark:border-rose-900/50 dark:bg-[#182232]">
                <div className="h-1.5 w-full bg-gradient-to-r from-rose-500 via-rose-600 to-red-700 shrink-0" />

                <div className="modal-header flex items-center justify-between border-b border-slate-100 bg-white px-6 py-4.5 dark:border-slate-800 dark:bg-slate-950">
                  <div className="flex items-center gap-3">
                    <div className="rounded-2xl bg-gradient-to-br from-rose-500 via-rose-600 to-red-700 text-white p-2.5 shadow-md shadow-rose-500/30 border border-rose-300/30 shrink-0">
                      <Trash2 className="h-5 w-5 text-white" strokeWidth={2.25} />
                    </div>
                    <div>
                      <h3 className="modal-title text-sm sm:text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                        <span>Hapus Kurikulum</span>
                        <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold border bg-rose-50 text-rose-700 border-rose-200/80 dark:bg-rose-950/60 dark:text-rose-400 dark:border-rose-800/60">
                          <Trash2 className="size-3" />
                          Hapus Data
                        </span>
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        Konfirmasi pemindahan data kurikulum ke tempat sampah.
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    disabled={hapusMutation.isPending}
                    onClick={() => setDeleteTarget(null)}
                    className="size-9 flex items-center justify-center rounded-2xl bg-slate-100 text-slate-500 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400 transition-colors cursor-pointer disabled:opacity-50"
                  >
                    <X className="size-4" strokeWidth={2.25} />
                  </button>
                </div>

                <div className="modal-body p-6 space-y-4 text-slate-700 dark:text-slate-200">
                  {/* Summary Card */}
                  <div className="rounded-2xl border border-rose-200/80 bg-rose-50/50 p-4 dark:border-rose-900/60 dark:bg-rose-950/30">
                    <p className="text-xs font-black text-rose-900 dark:text-rose-200">
                      {deleteTarget.nama_kurikulum || deleteTarget.name}
                    </p>
                    <p className="text-[11px] font-bold text-rose-700 dark:text-rose-400 mt-0.5">
                      Kode: {deleteTarget.kode_kurikulum || '-'} · Jenjang: {deleteTarget.jenjang || '-'}
                    </p>
                  </div>

                  {/* Danger Callout */}
                  <div className="rounded-2xl border border-rose-200 bg-rose-50/80 p-3.5 text-xs text-rose-900 dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-200 leading-relaxed">
                    <p className="font-bold flex items-center gap-1.5 mb-1 text-rose-700 dark:text-rose-400">
                      <AlertTriangle className="size-3.5 text-rose-600" />
                      Peringatan Penghapusan
                    </p>
                    <p className="text-[11px] text-rose-800 dark:text-rose-300">
                      Kurikulum ini akan dipindahkan ke arsip sampah (Soft Delete) dan tidak dapat digunakan dalam penyusunan silabus baru sampai dipulihkan kembali.
                    </p>
                  </div>
                </div>

                <div className="modal-footer px-6 py-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-end gap-2.5 bg-slate-50/50 dark:bg-slate-900/40">
                  <button
                    type="button"
                    disabled={hapusMutation.isPending}
                    onClick={() => setDeleteTarget(null)}
                    className="inline-flex items-center gap-1.5 rounded-2xl border border-slate-200/90 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 shadow-2xs hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 transition cursor-pointer disabled:opacity-50"
                  >
                    Batal
                  </button>
                  <button
                    type="button"
                    disabled={hapusMutation.isPending}
                    onClick={() => hapusMutation.mutate(deleteTarget.id)}
                    className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-br from-rose-500 via-rose-600 to-red-700 text-white px-5 py-2.5 text-xs font-extrabold shadow-md shadow-rose-500/25 hover:shadow-lg hover:scale-[1.02] active:scale-95 transition-all duration-200 disabled:opacity-50 cursor-pointer border border-rose-300/40"
                  >
                    {hapusMutation.isPending ? (
                      <span className="size-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    ) : (
                      <Trash2 className="size-4" />
                    )}
                    <span>{hapusMutation.isPending ? 'Menghapus...' : 'Ya, Hapus Data'}</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ══════════════════════════════════════════════════════════════════
          HARMONIZED RESTORE CONFIRMATION MODAL (z-[70])
      ══════════════════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {restoreTarget && (
          <div
            className="overlay modal fixed inset-0 z-[70] flex items-center justify-center p-3 sm:p-5 bg-slate-950/70 backdrop-blur-md"
            role="dialog"
            aria-modal="true"
            tabIndex={-1}
            onMouseDown={(e) => {
              if (e.target === e.currentTarget && !pulihkanMutation.isPending) setRestoreTarget(null)
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 14 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ type: 'spring', stiffness: 400, damping: 28 }}
              className="modal-dialog font-sans my-auto w-full max-w-md"
            >
              <div className="modal-content flex max-h-[calc(100dvh-2rem)] flex-col overflow-hidden rounded-3xl border border-emerald-200/80 bg-white shadow-2xl shadow-emerald-950/20 dark:border-emerald-900/50 dark:bg-[#182232]">
                <div className="h-1.5 w-full bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-600 shrink-0" />

                <div className="modal-header flex items-center justify-between border-b border-slate-100 bg-white px-6 py-4.5 dark:border-slate-800 dark:bg-slate-950">
                  <div className="flex items-center gap-3">
                    <div className="rounded-2xl bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700 text-white p-2.5 shadow-md shadow-emerald-500/30 border border-emerald-300/30 shrink-0">
                      <RotateCcw className="h-5 w-5 text-white" strokeWidth={2.25} />
                    </div>
                    <div>
                      <h3 className="modal-title text-sm sm:text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                        <span>Pulihkan Kurikulum</span>
                        <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold border bg-emerald-50 text-emerald-700 border-emerald-200/80 dark:bg-emerald-950/60 dark:text-emerald-400 dark:border-emerald-800/60">
                          <RotateCcw className="size-3" />
                          Restore Data
                        </span>
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        Konfirmasi pemulihan kurikulum dari arsip sampah.
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    disabled={pulihkanMutation.isPending}
                    onClick={() => setRestoreTarget(null)}
                    className="size-9 flex items-center justify-center rounded-2xl bg-slate-100 text-slate-500 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400 transition-colors cursor-pointer disabled:opacity-50"
                  >
                    <X className="size-4" strokeWidth={2.25} />
                  </button>
                </div>

                <div className="modal-body p-6 space-y-4 text-slate-700 dark:text-slate-200">
                  {/* Summary Card */}
                  <div className="rounded-2xl border border-emerald-200/80 bg-emerald-50/50 p-4 dark:border-emerald-900/60 dark:bg-emerald-950/30">
                    <p className="text-xs font-black text-emerald-900 dark:text-emerald-200">
                      {restoreTarget.nama_kurikulum || restoreTarget.name}
                    </p>
                    <p className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400 mt-0.5">
                      Kode: {restoreTarget.kode_kurikulum || '-'} · Jenjang: {restoreTarget.jenjang || '-'}
                    </p>
                  </div>

                  {/* Notice Callout */}
                  <div className="rounded-2xl border border-emerald-200 bg-emerald-50/80 p-3.5 text-xs text-emerald-900 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-200 leading-relaxed">
                    <p className="font-bold flex items-center gap-1.5 mb-1">
                      <Sparkles className="size-3.5 text-emerald-600" />
                      Informasi Pemulihan
                    </p>
                    <p className="text-[11px] text-emerald-800 dark:text-emerald-300">
                      Kurikulum ini akan dipulihkan dari arsip sampah dan kembali aktif untuk digunakan oleh unit pendidikan terkait.
                    </p>
                  </div>
                </div>

                <div className="modal-footer px-6 py-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-end gap-2.5 bg-slate-50/50 dark:bg-slate-900/40">
                  <button
                    type="button"
                    disabled={pulihkanMutation.isPending}
                    onClick={() => setRestoreTarget(null)}
                    className="inline-flex items-center gap-1.5 rounded-2xl border border-slate-200/90 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 shadow-2xs hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 transition cursor-pointer disabled:opacity-50"
                  >
                    Batal
                  </button>
                  <button
                    type="button"
                    disabled={pulihkanMutation.isPending}
                    onClick={() => pulihkanMutation.mutate(restoreTarget.id)}
                    className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700 text-white px-5 py-2.5 text-xs font-extrabold shadow-md shadow-emerald-500/25 hover:shadow-lg hover:scale-[1.02] active:scale-95 transition-all duration-200 disabled:opacity-50 cursor-pointer border border-emerald-300/40"
                  >
                    {pulihkanMutation.isPending ? (
                      <span className="size-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    ) : (
                      <RotateCcw className="size-4" />
                    )}
                    <span>{pulihkanMutation.isPending ? 'Memulihkan...' : 'Ya, Pulihkan Data'}</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ══════════════════════════════════════════════════════════════════
          HARMONIZED BATCH EXPORT MODAL
      ══════════════════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {showExportModal && (
          <div
            className="overlay modal fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/70 backdrop-blur-md"
            role="dialog"
            aria-modal="true"
            tabIndex={-1}
            onMouseDown={(e) => {
              if (e.target === e.currentTarget && !isExporting) setShowExportModal(false)
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 14 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ type: 'spring', stiffness: 400, damping: 28 }}
              className="modal-dialog font-sans my-auto w-full max-w-lg"
            >
              <div className="modal-content flex max-h-[calc(100dvh-2.5rem)] flex-col overflow-hidden rounded-3xl border border-amber-200/80 bg-white shadow-2xl shadow-amber-950/20 dark:border-amber-900/50 dark:bg-[#182232]">
                <div className="h-1.5 w-full bg-gradient-to-r from-amber-400 via-amber-500 to-orange-600 shrink-0" />

                <div className="modal-header flex items-center justify-between border-b border-slate-100 bg-white px-6 py-4.5 dark:border-slate-800 dark:bg-slate-950">
                  <div className="flex items-center gap-3">
                    <div className="rounded-2xl bg-gradient-to-br from-amber-400 via-amber-500 to-orange-600 text-white p-2.5 shadow-md shadow-amber-500/25 border border-amber-300/40 shrink-0">
                      <Download className="h-5 w-5 text-white" strokeWidth={2.2} />
                    </div>
                    <div>
                      <h3 className="modal-title text-sm sm:text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                        <span>Export Data Kurikulum</span>
                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-700 border border-amber-200/80 dark:bg-amber-950/60 dark:text-amber-400 dark:border-amber-800/60">
                          <Sparkles className="size-3" /> Unduh Data
                        </span>
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        Pilih format berkas untuk mengekspor data sesuai filter aktif.
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    disabled={isExporting}
                    onClick={() => setShowExportModal(false)}
                    className="size-9 flex items-center justify-center rounded-2xl bg-slate-100 text-slate-500 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400 transition-colors cursor-pointer disabled:opacity-50"
                  >
                    <X className="size-4" />
                  </button>
                </div>

                <div className="modal-body p-6 space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {[
                      ['xlsx', 'Excel (.xlsx)', FileSpreadsheet, 'Format spreadsheet modern Microsoft Excel.'],
                      ['xls', 'Excel (.xls)', FileSpreadsheet, 'Format kompatibilitas Excel 97-2003.'],
                      ['csv', 'CSV (.csv)', FileText, 'Format teks koma terpisah universal.'],
                    ].map(([value, label, Icon, desc]) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => setExportFormat(value)}
                        className={`rounded-2xl border p-4 text-left transition-all duration-200 cursor-pointer ${
                          exportFormat === value
                            ? 'border-emerald-500 bg-emerald-50/70 shadow-sm dark:border-emerald-700 dark:bg-emerald-950/40'
                            : 'border-slate-200 bg-white hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900/40'
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-1.5">
                          <Icon
                            className={`size-4 ${
                              exportFormat === value ? 'text-emerald-700 dark:text-emerald-400' : 'text-slate-400'
                            }`}
                          />
                          <span className="text-xs font-black text-slate-900 dark:text-white">{label}</span>
                        </div>
                        <p className="text-[10px] text-slate-500 leading-snug">{desc}</p>
                      </button>
                    ))}
                  </div>

                  <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200/80 dark:bg-amber-950/30 dark:border-amber-800/60 text-xs text-amber-900 dark:text-amber-300 leading-relaxed">
                    <p className="font-bold flex items-center gap-1.5 mb-0.5">
                      <Sparkles className="size-3.5 text-amber-600 dark:text-amber-400" />
                      Filter Ekspor Aktif
                    </p>
                    <p className="text-[11px] text-amber-800/90 dark:text-amber-300/80">
                      Data yang diekspor akan mencakup seluruh entitas terfilter ({meta.total ?? listData.length} record kurikulum).
                    </p>
                  </div>
                </div>

                <div className="modal-footer px-6 py-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-end gap-2.5 bg-slate-50/50 dark:bg-slate-900/40">
                  <button
                    type="button"
                    disabled={isExporting}
                    onClick={() => setShowExportModal(false)}
                    className="inline-flex items-center gap-1.5 rounded-2xl border border-slate-200/90 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 shadow-2xs hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 transition cursor-pointer disabled:opacity-50"
                  >
                    Batal
                  </button>
                  <button
                    type="button"
                    disabled={isExporting}
                    onClick={handleProcessExport}
                    className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-br from-amber-500 via-amber-600 to-orange-600 text-white px-5 py-2.5 text-xs font-extrabold shadow-md shadow-amber-500/25 hover:shadow-lg hover:scale-[1.02] active:scale-95 transition-all duration-200 disabled:opacity-50 cursor-pointer border border-amber-300/40"
                  >
                    <Download className="size-4" />
                    {isExporting ? 'Menyiapkan...' : 'Unduh Berkas'}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── Toast Notifications Stack ── */}
      <ToastStack toasts={toasts} onDismiss={dismissToast} />
    </PageContainer>
  )
}
