import React, { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  BookOpen,
  CheckCircle2,
  Trash2,
  RotateCcw,
  Eye,
  Upload,
  Download,
  FileSpreadsheet,
  FileText,
  Archive,
  Library,
  Save,
  Clock3,
  Target,
  ChartNoAxesColumn,
  Printer,
  Plus,
  X,
  XCircle,
  AlertTriangle,
  Info,
  Sparkles,
  ShieldCheck,
  Power,
  Palette,
  Layers,
  GraduationCap,
  Building,
  Hash,
  Loader2,
  Check,
  Tag,
} from 'lucide-react'
import { cn } from '../lib/utils'
import { useDebounce } from '../hooks/useDebounce'
import { subjectService } from '../services/subjectService'
import { masterKurikulumService } from '../services/masterKurikulumService'
import { educationUnitService } from '../services/educationUnitService'
import { getUnitJenjang } from './MasterCapaianPembelajaranPage'
import { ActionDropdown } from '../components/app'
import { Checkbox } from '@/components/tailgrids/core/checkbox'
import PageContainer from '../components/app/PageContainer'
import AppBreadcrumb from '../components/app/AppBreadcrumb'
import AppDataTable from '../components/app/AppDataTable'
import { useAuthStore } from '../stores/authStore'
import { isGlobalAccessManager } from '../auth/portalResolver'
import { printCleanTable, downloadPdfTable } from '../utils/printHelper'
import { downloadFileFromApi } from '../utils/exportUtils'
import {
  PrintOptionModal,
  MasterFilterSelect,
} from '../components/master-data'

const KELOMPOK_LIST = ['Kelompok A', 'Kelompok B', 'Kekhasan SIT', 'Muatan Lokal', "Al-Qur'an/Tahfizh"]
const KATEGORI_LIST = ['Wajib', 'Pilihan', 'Tahfizh/Diniyah', 'Ekstrakurikuler', 'Vokasi']

// ── 1. DEFINISI TONE WARNA KARTU KPI MODERN ──────────────────────────────────
const MODERN_CARD_TONES = {
  emerald: {
    card: 'border-emerald-300/70 bg-gradient-to-br from-emerald-50 via-teal-50/60 to-white hover:border-emerald-400 dark:border-emerald-700/50 dark:from-emerald-950/40 dark:via-teal-950/20 dark:to-slate-900',
    glow: 'bg-emerald-400/20 group-hover:bg-emerald-400/30',
    iconBox: 'bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-emerald-500/30',
    tag: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/60 dark:text-emerald-300',
    title: 'text-emerald-700 dark:text-emerald-400',
    val: 'text-emerald-700 dark:text-emerald-300',
    sub: 'text-emerald-600/80 dark:text-emerald-400/80',
    cta: 'text-emerald-600/60 dark:text-emerald-500/60',
  },
  teal: {
    card: 'border-teal-300/70 bg-gradient-to-br from-teal-50 via-emerald-50/60 to-white hover:border-teal-400 dark:border-teal-700/50 dark:from-teal-950/40 dark:via-emerald-950/20 dark:to-slate-900',
    glow: 'bg-teal-400/20 group-hover:bg-teal-400/30',
    iconBox: 'bg-gradient-to-br from-teal-500 to-emerald-600 text-white shadow-teal-500/30',
    tag: 'bg-teal-100 text-teal-700 dark:bg-teal-900/60 dark:text-teal-300',
    title: 'text-teal-700 dark:text-teal-400',
    val: 'text-teal-700 dark:text-teal-300',
    sub: 'text-teal-600/80 dark:text-teal-400/80',
    cta: 'text-teal-600/60 dark:text-teal-500/60',
  },
  amber: {
    card: 'border-amber-300/70 bg-gradient-to-br from-amber-50 via-orange-50/60 to-white hover:border-amber-400 dark:border-amber-700/50 dark:from-amber-950/40 dark:via-orange-950/20 dark:to-slate-900',
    glow: 'bg-amber-400/20 group-hover:bg-amber-400/30',
    iconBox: 'bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-amber-500/30',
    tag: 'bg-amber-100 text-amber-700 dark:bg-amber-900/60 dark:text-amber-300',
    title: 'text-amber-700 dark:text-amber-400',
    val: 'text-amber-700 dark:text-amber-300',
    sub: 'text-amber-600/80 dark:text-amber-400/80',
    cta: 'text-amber-600/60 dark:text-amber-500/60',
  },
}

function ModernKpiCard({
  icon: Icon,
  label,
  subtext,
  value,
  tag,
  tone = 'emerald',
  onClick,
}) {
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
        'group relative overflow-hidden rounded-[18px] border-2 p-5 shadow-xs transition-[border-color,box-shadow] duration-150 text-left',
        isClickable ? 'cursor-pointer hover:shadow-md' : 'cursor-default',
        t.card
      )}
    >
      {/* Ambient Glow */}
      <div
        className={cn(
          'pointer-events-none absolute -top-8 -right-8 h-28 w-28 rounded-full blur-2xl transition-all',
          t.glow
        )}
      />

      {/* Header dengan Icon Box & Tag */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2.5">
          <div
            className={cn(
              'flex h-9 w-9 items-center justify-center rounded-xl text-white shadow-sm',
              t.iconBox
            )}
          >
            <Icon className="h-4.5 w-4.5" />
          </div>
          <div>
            <p className={cn('text-[11px] font-bold uppercase tracking-wider', t.title)}>
              {label}
            </p>
          </div>
        </div>
        {tag && (
          <span className={cn('rounded-lg px-2 py-0.5 text-[10px] font-extrabold', t.tag)}>
            {tag}
          </span>
        )}
      </div>

      {/* Nilai Utama */}
      <p className={cn('text-4xl font-black tabular-nums', t.val)}>
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

// ── 2. TOAST NOTIFICATION STACK ──────────────────────────────────────────────
function ToastStack({ items = [], onDismiss }) {
  return (
    <div
      aria-live="polite"
      aria-atomic="true"
      className="fixed bottom-5 right-5 z-[9999] flex flex-col gap-2.5 max-w-sm w-full pointer-events-none"
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
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.9 }}
              transition={{ duration: 0.2 }}
              className={cn(
                'pointer-events-auto relative overflow-hidden rounded-2xl border p-4 shadow-xl backdrop-blur-md',
                isSuccess && 'border-emerald-200 bg-white/95 text-emerald-950 dark:border-emerald-800 dark:bg-[#182232]/95 dark:text-emerald-200',
                isDanger && 'border-rose-200 bg-white/95 text-rose-950 dark:border-rose-800 dark:bg-[#182232]/95 dark:text-rose-200',
                isWarning && 'border-amber-200 bg-white/95 text-amber-950 dark:border-amber-800 dark:bg-[#182232]/95 dark:text-amber-200',
                isInfo && 'border-sky-200 bg-white/95 text-sky-950 dark:border-sky-800 dark:bg-[#182232]/95 dark:text-sky-200'
              )}
            >
              {/* Top accent border */}
              <div
                className={cn(
                  'absolute top-0 left-0 right-0 h-1',
                  isSuccess && 'bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-600',
                  isDanger && 'bg-gradient-to-r from-rose-500 via-rose-600 to-red-700',
                  isWarning && 'bg-gradient-to-r from-amber-500 to-orange-600',
                  isInfo && 'bg-gradient-to-r from-sky-500 to-blue-600'
                )}
              />

              <div className="flex items-start gap-3">
                <div
                  className={cn(
                    'flex size-9 shrink-0 items-center justify-center rounded-xl text-white shadow-sm',
                    isSuccess && 'bg-gradient-to-br from-emerald-500 to-teal-600 shadow-emerald-500/25',
                    isDanger && 'bg-gradient-to-br from-rose-500 to-red-600 shadow-rose-500/25',
                    isWarning && 'bg-gradient-to-br from-amber-500 to-orange-600 shadow-amber-500/25',
                    isInfo && 'bg-gradient-to-br from-sky-500 to-blue-600 shadow-sky-500/25'
                  )}
                >
                  {isSuccess && <CheckCircle2 className="size-5" strokeWidth={2.3} />}
                  {isDanger && <XCircle className="size-5" strokeWidth={2.3} />}
                  {isWarning && <AlertTriangle className="size-5" strokeWidth={2.3} />}
                  {isInfo && <Info className="size-5" strokeWidth={2.3} />}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <h4 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white">
                      {n.title}
                    </h4>
                    <span
                      className={cn(
                        'inline-flex items-center rounded-full px-2 py-0.2 text-[10px] font-bold border',
                        isSuccess && 'bg-emerald-50 text-[#0E5C44] border-emerald-200/80 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800/80',
                        isDanger && 'bg-rose-50 text-rose-700 border-rose-200/80 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800/80',
                        isWarning && 'bg-amber-50 text-amber-800 border-amber-200/80 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800/80',
                        isInfo && 'bg-sky-50 text-sky-800 border-sky-200/80 dark:bg-sky-950/60 dark:text-sky-300 dark:border-sky-800/80'
                      )}
                    >
                      {isSuccess ? 'Sukses' : isDanger ? 'Gagal' : isWarning ? 'Perhatian' : 'Info'}
                    </span>
                  </div>
                  {n.message && (
                    <p className="mt-1 text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                      {n.message}
                    </p>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => onDismiss(n.id)}
                  className="shrink-0 rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200 transition-colors cursor-pointer"
                  aria-label="Tutup notifikasi"
                >
                  <X className="size-4" strokeWidth={2.2} />
                </button>
              </div>
            </motion.div>
          )
        })}
      </AnimatePresence>
    </div>
  )
}

// ── 3. KOMPONEN UTAMA HALAMAN MASTER MATA PELAJARAN ──────────────────────────
export default function MasterSubjectPage({
  embedded = false,
  hideBreadcrumb = false,
  hidePageHeader = false,
}) {
  const queryClient = useQueryClient()

  // Filter States with Debounce
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebounce(search, 350)
  const [selectedUnitFilter, setSelectedUnitFilter] = useState('')
  const [selectedKurikulumFilter, setSelectedKurikulumFilter] = useState('')
  const [selectedKelompokFilter, setSelectedKelompokFilter] = useState('')
  const [selectedKategoriFilter, setSelectedKategoriFilter] = useState('')
  const [selectedJenjangFilter, setSelectedJenjangFilter] = useState('')
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('')
  const [denganSampahFilter, setDenganSampahFilter] = useState('')
  const [page, setPage] = useState(1)
  const perPage = 15

  // Selection & Bulk States
  const [selectedIds, setSelectedIds] = useState([])

  // Modal States
  const [isFormModalOpen, setIsFormModalOpen] = useState(false)
  const [selectedForEdit, setSelectedForEdit] = useState(null)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
  const [selectedForDetail, setSelectedForDetail] = useState(null)
  const [isImportModalOpen, setIsImportModalOpen] = useState(false)
  const [isExportModalOpen, setIsExportModalOpen] = useState(false)
  const [exportFormat, setExportFormat] = useState('xlsx')
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [bulkDeleteConfirmOpen, setBulkDeleteConfirmOpen] = useState(false)
  const [importFile, setImportFile] = useState(null)
  const [notifications, setNotifications] = useState([])

  // Toast Helper
  const notify = (title, message = '', type = 'success') => {
    const id = Date.now() + Math.random().toString(36).slice(2, 6)
    setNotifications((prev) => [...prev.slice(-3), { id, title, message, type }])
    setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== id))
    }, 4000)
  }

  // Form State
  const [formData, setFormData] = useState({
    unit_pendidikan_id: '',
    kurikulum_id: '',
    kode_mapel: '',
    nama_mapel: '',
    nama_singkat: '',
    kelompok_mapel: 'Kelompok A',
    kategori: 'Wajib',
    jenjang: 'SD',
    tingkat_kelas: 'All',
    jam_pelajaran: 2,
    kkm: 75,
    bobot_pengetahuan: 40,
    bobot_keterampilan: 40,
    bobot_sikap: 20,
    warna: '#0E5C44',
    ikon: 'BookOpen',
    urutan_tampil: 1,
    status: true,
    deskripsi: '',
  })

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

  // Queries
  const { data: unitDropdown = [] } = useQuery({
    queryKey: ['education-units-dropdown-options'],
    queryFn: async () => {
      const res = await educationUnitService.getDaftar()
      return res.data || []
    },
  })

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
    const allUnits = unitDropdown || []
    if (canViewAllUnits) return allUnits

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
  }, [unitDropdown, canViewAllUnits, userUnitId, userUnitName])

  const effectiveUserUnitId = useMemo(() => {
    if (canViewAllUnits) return ''
    if (userUnitId) return String(userUnitId)
    if (availableUnitOptions.length > 0) return String(availableUnitOptions[0].id)
    return ''
  }, [canViewAllUnits, userUnitId, availableUnitOptions])

  useEffect(() => {
    if (!canViewAllUnits && effectiveUserUnitId && selectedUnitFilter !== effectiveUserUnitId) {
      setSelectedUnitFilter(effectiveUserUnitId)
    }
  }, [canViewAllUnits, effectiveUserUnitId, selectedUnitFilter])

  const { data: responseData = {}, isLoading, isError, refetch } = useQuery({
    queryKey: [
      'master-subjects-list',
      page,
      perPage,
      debouncedSearch,
      selectedUnitFilter,
      selectedKurikulumFilter,
      selectedKelompokFilter,
      selectedKategoriFilter,
      selectedJenjangFilter,
      selectedStatusFilter,
      denganSampahFilter,
      canViewAllUnits,
      effectiveUserUnitId,
    ],
    queryFn: () => {
      const targetUnitId = !canViewAllUnits ? (effectiveUserUnitId || selectedUnitFilter) : selectedUnitFilter
      return subjectService.getDaftar({
        page,
        per_page: perPage,
        search: debouncedSearch,
        unit_pendidikan_id: targetUnitId || undefined,
        kurikulum_id: selectedKurikulumFilter,
        kelompok_mapel: selectedKelompokFilter,
        kategori: selectedKategoriFilter,
        jenjang: selectedJenjangFilter,
        status: selectedStatusFilter,
        dengan_sampah: denganSampahFilter,
        order_by: 'created_at',
        order_dir: 'desc',
      })
    },
  })

  const { data: kurikulumDropdown = [] } = useQuery({
    queryKey: ['kurikulum-dropdown-options'],
    queryFn: async () => {
      const res = await masterKurikulumService.getDropdown()
      return Array.isArray(res) ? res : (res?.data || [])
    },
  })

  // Mutations with ToastStack Feedback (Zero SweetAlert2)
  const simpanMutation = useMutation({
    mutationFn: (payload) => {
      if (selectedForEdit) {
        return subjectService.ubah({ id: selectedForEdit.id, payload })
      }
      return subjectService.tambah(payload)
    },
    onSuccess: (res) => {
      notify('Berhasil Disimpan', res?.message || 'Data mata pelajaran berhasil disimpan.', 'success')
      setIsFormModalOpen(false)
      setSelectedForEdit(null)
      queryClient.invalidateQueries(['master-subjects-list'])
    },
    onError: (err) => {
      const msg = err.response?.data?.message || 'Gagal menyimpan data mata pelajaran.'
      notify('Gagal Menyimpan', msg, 'danger')
    },
  })

  const hapusMutation = useMutation({
    mutationFn: (id) => subjectService.hapus(id),
    onSuccess: (res) => {
      notify('Berhasil Dihapus', res?.message || 'Mata pelajaran berhasil dihapus.', 'success')
      setDeleteTarget(null)
      queryClient.invalidateQueries(['master-subjects-list'])
    },
    onError: (err) => {
      notify('Gagal Menghapus', err.response?.data?.message || 'Gagal menghapus mata pelajaran.', 'danger')
    },
  })

  const pulihkanMutation = useMutation({
    mutationFn: (id) => subjectService.pulihkan(id),
    onSuccess: (res) => {
      notify('Berhasil Dipulihkan', res?.message || 'Mata pelajaran berhasil dipulihkan.', 'success')
      queryClient.invalidateQueries(['master-subjects-list'])
    },
    onError: (err) => {
      notify('Gagal Memulihkan', err.response?.data?.message || 'Gagal memulihkan mata pelajaran.', 'danger')
    },
  })

  const bulkStatusMutation = useMutation({
    mutationFn: ({ ids, status }) => subjectService.bulkStatus(ids, status),
    onSuccess: (res) => {
      notify('Status Diperbarui', res?.message || 'Status berhasil diperbarui secara massal.', 'success')
      setSelectedIds([])
      queryClient.invalidateQueries(['master-subjects-list'])
    },
    onError: (err) => {
      notify('Gagal Memperbarui', err.response?.data?.message || 'Gagal memperbarui status massal.', 'danger')
    },
  })

  const bulkDeleteMutation = useMutation({
    mutationFn: (ids) => subjectService.bulkDelete(ids),
    onSuccess: (res) => {
      notify('Hapus Massal Berhasil', res?.message || 'Data terpilih berhasil dihapus.', 'success')
      setSelectedIds([])
      setBulkDeleteConfirmOpen(false)
      queryClient.invalidateQueries(['master-subjects-list'])
    },
    onError: (err) => {
      notify('Gagal Hapus Massal', err.response?.data?.message || 'Gagal menghapus data massal.', 'danger')
    },
  })

  const items = responseData.data || []
  const meta = responseData.meta || {}
  const stats = responseData.statistik || { total: 0, aktif: 0, tidak_aktif: 0, terhapus: 0 }
  const archiveCount = Number(stats.tidak_aktif || 0) + Number(stats.terhapus || 0)

  const resolveKurikulumForUnit = (unitId) => {
    if (!unitId) return kurikulumDropdown
    const currentUnit = (unitDropdown || []).find((u) => String(u.id) === String(unitId))
    const jenjang = getUnitJenjang(currentUnit)

    const direct = kurikulumDropdown.filter(
      (k) => String(k.unit_pendidikan_id) === String(unitId) || String(k.unit_id) === String(unitId)
    )
    const byJenjang = kurikulumDropdown.filter((k) => {
      if (!jenjang) return false
      const kJ = String(k.jenjang || '').toUpperCase()
      if (kJ === jenjang) return true
      if (jenjang === 'SMP' && (kJ.includes('SMP') || kJ.includes('PESANTREN'))) return true
      if (jenjang === 'SMA' && (kJ.includes('SMA') || kJ.includes('PESANTREN'))) return true
      const kText = `${k.nama_kurikulum || ''} ${k.kode_kurikulum || ''}`.toUpperCase()
      return kText.includes(jenjang)
    })
    const seen = new Set()
    const result = []
    ;[...direct, ...byJenjang].forEach((item) => {
      if (!seen.has(String(item.id))) {
        seen.add(String(item.id))
        result.push(item)
      }
    })
    return result.length > 0 ? result : kurikulumDropdown
  }

  const availableKurikulumForFilter = useMemo(() => {
    return resolveKurikulumForUnit(selectedUnitFilter)
  }, [selectedUnitFilter, kurikulumDropdown, unitDropdown])

  const availableKurikulumForForm = useMemo(() => {
    return resolveKurikulumForUnit(formData.unit_pendidikan_id)
  }, [formData.unit_pendidikan_id, kurikulumDropdown, unitDropdown])

  const resetFilters = () => {
    setSearch('')
    setSelectedUnitFilter(canViewAllUnits ? '' : effectiveUserUnitId)
    setSelectedKurikulumFilter('')
    setSelectedKelompokFilter('')
    setSelectedKategoriFilter('')
    setSelectedJenjangFilter('')
    setSelectedStatusFilter('')
    setDenganSampahFilter('')
    setPage(1)
  }

  // Multi select logic
  const isAllSelected = items.length > 0 && selectedIds.length === items.length
  const toggleSelectAll = () => {
    if (isAllSelected) {
      setSelectedIds([])
    } else {
      setSelectedIds(items.map((i) => i.id))
    }
  }

  const toggleSelectRow = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    )
  }

  const handleOpenFormTambah = () => {
    setSelectedForEdit(null)
    const defaultUnit = selectedUnitFilter || (availableUnitOptions[0]?.id || unitDropdown[0]?.id || '')
    const matchingKur = resolveKurikulumForUnit(defaultUnit)
    const defaultKur = selectedKurikulumFilter && matchingKur.some((k) => String(k.id) === String(selectedKurikulumFilter))
      ? selectedKurikulumFilter
      : (matchingKur[0]?.id || '')

    const currentUnit = (unitDropdown || []).find((u) => String(u.id) === String(defaultUnit))
    const defaultJenjang = getUnitJenjang(currentUnit) || 'SD'

    setFormData({
      unit_pendidikan_id: defaultUnit,
      kurikulum_id: defaultKur,
      kode_mapel: '',
      nama_mapel: '',
      nama_singkat: '',
      kelompok_mapel: 'Kelompok A',
      kategori: 'Wajib',
      jenjang: defaultJenjang,
      tingkat_kelas: 'All',
      jam_pelajaran: 2,
      kkm: 75,
      bobot_pengetahuan: 40,
      bobot_keterampilan: 40,
      bobot_sikap: 20,
      warna: '#0E5C44',
      ikon: 'BookOpen',
      urutan_tampil: (meta.total || items.length) + 1,
      status: true,
      deskripsi: '',
    })
    setIsFormModalOpen(true)
  }

  const handleOpenFormEdit = (row) => {
    setSelectedForEdit(row)
    setFormData({
      unit_pendidikan_id: row.unit_pendidikan_id || '',
      kurikulum_id: row.kurikulum_id || '',
      kode_mapel: row.kode_mapel || row.code || '',
      nama_mapel: row.nama_mapel || row.name || '',
      nama_singkat: row.nama_singkat || '',
      kelompok_mapel: row.kelompok_mapel || 'Kelompok A',
      kategori: row.kategori || 'Wajib',
      jenjang: row.jenjang || 'SD',
      tingkat_kelas: row.tingkat_kelas || 'All',
      jam_pelajaran: row.jam_pelajaran || 2,
      kkm: row.kkm || 75,
      bobot_pengetahuan: row.bobot_pengetahuan || 40,
      bobot_keterampilan: row.bobot_keterampilan || 40,
      bobot_sikap: row.bobot_sikap || 20,
      warna: row.warna || '#0E5C44',
      ikon: row.ikon || 'BookOpen',
      urutan_tampil: row.urutan_tampil || 1,
      status: row.status ?? true,
      deskripsi: row.deskripsi || row.description || '',
    })
    setIsFormModalOpen(true)
  }

  const handleOpenDetail = (row) => {
    setSelectedForDetail(row)
    setIsDetailModalOpen(true)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!formData.kode_mapel || !formData.nama_mapel) {
      notify('Peringatan', 'Kode dan Nama Mata Pelajaran wajib diisi.', 'warning')
      return
    }
    simpanMutation.mutate(formData)
  }

  // ── Harmonized Export Execution ───────────────────────────────────────────
  const handleProcessExport = async () => {
    setIsExportModalOpen(false)
    if (exportFormat === 'pdf') {
      const rowsToPrint = Array.isArray(items) ? items : []
      downloadPdfTable({
        title: 'Laporan Master Data Mata Pelajaran',
        subtitle: 'Daftar Mata Pelajaran Sekolah Islam Terpadu',
        headers: ['NO', 'KODE MAPEL', 'NAMA MATA PELAJARAN', 'NAMA SINGKAT', 'KELOMPOK', 'KATEGORI', 'JENJANG', 'STATUS'],
        rows: rowsToPrint.map((row, i) => [
          i + 1,
          row.kode_mapel || row.code || '-',
          row.nama_mapel || row.name || row.nama || '-',
          row.nama_singkat || row.short_name || '-',
          row.kelompok_mapel || row.kelompok || '-',
          row.kategori || row.category || '-',
          row.jenjang || row.unit_pendidikan?.name || '-',
          typeof row.status === 'string' ? row.status : row.status ? 'Aktif' : 'Nonaktif',
        ]),
        filename: `laporan_master_mata_pelajaran_${new Date().toISOString().slice(0, 10)}.pdf`,
      })
      notify('Export Berhasil', 'Dokumen PDF mata pelajaran siap diunduh.', 'success')
      return
    }

    notify('Menyiapkan Ekspor', `Sedang mengunduh berkas format .${exportFormat.toUpperCase()}...`, 'info')
    const result = await downloadFileFromApi(
      '/master/subjects/export/excel',
      {
        search: debouncedSearch,
        unit_pendidikan_id: selectedUnitFilter,
        kurikulum_id: selectedKurikulumFilter,
        kelompok_mapel: selectedKelompokFilter,
        kategori: selectedKategoriFilter,
        jenjang: selectedJenjangFilter,
        status: selectedStatusFilter,
      },
      exportFormat,
      'master_mata_pelajaran'
    )
    if (result?.success) {
      notify('Ekspor Berhasil', `Data mata pelajaran berhasil diekspor ke format .${exportFormat.toUpperCase()}.`, 'success')
    }
  }

  // ── Harmonized Import Execution ───────────────────────────────────────────
  const handleImportSubmit = async (e) => {
    e.preventDefault()
    if (!importFile) {
      notify('Peringatan', 'Pilih file Excel/CSV terlebih dahulu.', 'warning')
      return
    }
    const form = new FormData()
    form.append('file', importFile)

    try {
      notify('Memproses Impor', 'Sedang memproses berkas data mata pelajaran...', 'info')
      const res = await subjectService.importFile(form)
      notify('Impor Berhasil', res.message || 'Data berhasil diimpor.', 'success')
      setIsImportModalOpen(false)
      setImportFile(null)
      queryClient.invalidateQueries(['master-subjects-list'])
    } catch (err) {
      notify('Gagal Impor', err.response?.data?.message || 'Proses impor gagal.', 'danger')
    }
  }

  const handleDownloadTemplate = () => {
    const headers = ['kode_mapel', 'nama_mapel', 'nama_singkat', 'kelompok_mapel', 'kategori', 'jenjang', 'jam_pelajaran', 'kkm', 'bobot_pengetahuan', 'bobot_keterampilan', 'bobot_sikap']
    const sample = ['MP-SD-PAI', 'Pendidikan Agama Islam', 'PAI', 'Kelompok A', 'Wajib', 'SD', '2', '75', '40', '40', '20']
    const csvContent = [headers.join(','), sample.map((v) => `"${v}"`).join(',')].join('\n')
    const blob = new Blob([`\uFEFF${csvContent}`], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'Template_Import_Mata_Pelajaran.csv'
    a.click()
    URL.revokeObjectURL(url)
    notify('Template Diunduh', 'Format template CSV berhasil disimpan.', 'success')
  }

  // 4 Vivid Gradient Squircle Action Buttons (Identik Benchmark StudentsPage & EducationUnitsPage)
  const pageActions = (
    <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0 self-start sm:self-auto flex-wrap">
      {/* 1. Tombol Cetak Laporan (Vivid Indigo / Purple Squircle) */}
      <div className="group relative inline-flex">
        <button
          type="button"
          title="Cetak & Download Data Mata Pelajaran"
          aria-label="Cetak & Download Data Mata Pelajaran"
          className="flex size-10 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 via-indigo-600 to-violet-700 text-white border border-indigo-300/40 hover:scale-105 transition-all duration-200 active:scale-95 cursor-pointer shadow-sm shadow-indigo-500/20"
          onClick={() => setIsPrintModalOpen(true)}
        >
          <Printer className="size-5 text-white" strokeWidth={2.2} />
        </button>
        <div className="pointer-events-none absolute top-full left-1/2 mt-2 -translate-x-1/2 opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 transition-all duration-200 ease-out z-50 whitespace-nowrap rounded-lg bg-slate-900 px-2.5 py-1 text-[11px] font-bold text-white shadow-xl dark:bg-slate-100 dark:text-slate-900">
          <div className="absolute bottom-full left-1/2 -mb-1 -translate-x-1/2 border-4 border-transparent border-b-slate-900 dark:border-b-slate-100" />
          Cetak Data (Print)
        </div>
      </div>

      {/* 2. Import Button (Vivid Sky Blue Squircle) */}
      <div className="group relative inline-flex">
        <button
          type="button"
          title="Import Data Mata Pelajaran"
          aria-label="Import Data Mata Pelajaran"
          className="flex size-10 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-400 via-sky-500 to-blue-600 text-white border border-sky-300/40 hover:scale-105 transition-all duration-200 active:scale-95 cursor-pointer shadow-sm shadow-sky-500/20"
          onClick={() => setIsImportModalOpen(true)}
        >
          <Upload className="size-5 text-white" strokeWidth={2.2} />
        </button>
        <div className="pointer-events-none absolute top-full left-1/2 mt-2 -translate-x-1/2 opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 transition-all duration-200 ease-out z-50 whitespace-nowrap rounded-lg bg-slate-900 px-2.5 py-1 text-[11px] font-bold text-white shadow-xl dark:bg-slate-100 dark:text-slate-900">
          <div className="absolute bottom-full left-1/2 -mb-1 -translate-x-1/2 border-4 border-transparent border-b-slate-900 dark:border-b-slate-100" />
          Import Data
        </div>
      </div>

      {/* 3. Export / Download Button (Vivid Amber / Orange Squircle) */}
      <div className="group relative inline-flex">
        <button
          type="button"
          title="Export Data Mata Pelajaran"
          aria-label="Export Data Mata Pelajaran"
          className="flex size-10 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 via-amber-500 to-orange-600 text-white border border-amber-300/40 hover:scale-105 transition-all duration-200 active:scale-95 cursor-pointer shadow-sm shadow-amber-500/20"
          onClick={() => setIsExportModalOpen(true)}
        >
          <Download className="size-5 text-white" strokeWidth={2.2} />
        </button>
        <div className="pointer-events-none absolute top-full left-1/2 mt-2 -translate-x-1/2 opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 transition-all duration-200 ease-out z-50 whitespace-nowrap rounded-lg bg-slate-900 px-2.5 py-1 text-[11px] font-bold text-white shadow-xl dark:bg-slate-100 dark:text-slate-900">
          <div className="absolute bottom-full left-1/2 -mb-1 -translate-x-1/2 border-4 border-transparent border-b-slate-900 dark:border-b-slate-100" />
          Export Data
        </div>
      </div>

      {/* 4. Tambah Mata Pelajaran Button (Vivid Emerald / Teal Squircle) */}
      <div className="group relative inline-flex">
        <button
          type="button"
          title="Tambah Mata Pelajaran Baru"
          aria-label="Tambah Mata Pelajaran Baru"
          className="flex size-10 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700 text-white border border-emerald-300/40 hover:scale-105 transition-all duration-200 active:scale-95 cursor-pointer shadow-sm shadow-emerald-500/20"
          onClick={handleOpenFormTambah}
        >
          <Plus className="size-5 text-white" strokeWidth={2.5} />
        </button>
        <div className="pointer-events-none absolute top-full left-1/2 mt-2 -translate-x-1/2 opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 transition-all duration-200 ease-out z-50 whitespace-nowrap rounded-lg bg-slate-900 px-2.5 py-1 text-[11px] font-bold text-white shadow-xl dark:bg-slate-100 dark:text-slate-900">
          <div className="absolute bottom-full left-1/2 -mb-1 -translate-x-1/2 border-4 border-transparent border-b-slate-900 dark:border-b-slate-100" />
          Tambah Mapel
        </div>
      </div>
    </div>
  )

  const filtersAreActive = Boolean(
    search ||
      (canViewAllUnits && selectedUnitFilter) ||
      selectedKurikulumFilter ||
      selectedKelompokFilter ||
      selectedKategoriFilter ||
      selectedJenjangFilter ||
      selectedStatusFilter ||
      denganSampahFilter
  )

  return (
    <PageContainer maxW="7xl">
      {/* Toast Notification Stack */}
      <ToastStack
        items={notifications}
        onDismiss={(id) => setNotifications((prev) => prev.filter((n) => n.id !== id))}
      />

      {/* Print Option Modal */}
      <PrintOptionModal
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
        title="Mata Pelajaran"
        onPrint={() => {
          const rowsToPrint = Array.isArray(items) ? items : []
          printCleanTable({
            title: 'Laporan Master Data Mata Pelajaran',
            subtitle: 'Daftar Mata Pelajaran Sekolah Islam Terpadu',
            headers: ['NO', 'KODE MAPEL', 'NAMA MATA PELAJARAN', 'NAMA SINGKAT', 'KELOMPOK', 'KATEGORI', 'JENJANG', 'STATUS'],
            rows: rowsToPrint.map((row, i) => [
              i + 1,
              row.kode_mapel || row.code || '-',
              row.nama_mapel || row.name || row.nama || '-',
              row.nama_singkat || row.short_name || '-',
              row.kelompok_mapel || row.kelompok || '-',
              row.kategori || row.category || '-',
              row.jenjang || row.unit_pendidikan?.name || '-',
              typeof row.status === 'string' ? row.status : row.status ? 'Aktif' : 'Nonaktif',
            ]),
          })
        }}
        onDownload={handleProcessExport}
        onDownloadPdf={handleProcessExport}
      />

      {/* Breadcrumb Navigation */}
      {!(embedded || hideBreadcrumb) && (
        <div className="print:hidden mb-4">
          <AppBreadcrumb
            items={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Master Data' }, { label: 'Mata Pelajaran' }]}
          />
        </div>
      )}

      {/* ── MODERN VIVID HERO HEADER CARD ────────────────────────────────────── */}
      {!hidePageHeader && !embedded && (
        <div className="relative overflow-hidden rounded-[22px] border-2 border-emerald-500/30 bg-gradient-to-r from-emerald-500/15 via-teal-500/10 to-emerald-600/15 p-5 sm:p-6 shadow-md shadow-emerald-500/10 dark:border-emerald-600/40 dark:bg-gradient-to-r dark:from-emerald-950/70 dark:via-teal-950/50 dark:to-slate-900 mb-6 print:hidden">
          {/* Dual Multi-Tone Ambient Glow Blobs */}
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
                    Master Mata Pelajaran
                  </h1>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-emerald-600 to-teal-600 px-3.5 py-1 text-xs font-extrabold text-white shadow-sm shadow-emerald-600/25 border border-emerald-300/40">
                    <Sparkles className="h-3.5 w-3.5" />
                    Kurikulum & Akademik
                  </span>
                </div>
                <p className="mt-1 text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300 max-w-2xl leading-relaxed">
                  Kelola referensi mata pelajaran, alokasi jam pelajaran, KKM, dan bobot penilaian rapor untuk seluruh kurikulum sekolah.
                </p>
              </div>
            </div>

            {/* Right Action Badge / Tag */}
            <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
              <div className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-500/40 bg-gradient-to-r from-emerald-100 via-emerald-50 to-teal-100 px-3.5 py-1.5 text-xs font-black text-emerald-900 dark:border-emerald-700 dark:bg-gradient-to-r dark:from-emerald-950 dark:to-teal-950 dark:text-emerald-200 shadow-2xs">
                <Library className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>Kurikulum Terpadu</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── MODERN MULTI-TONE KPI CARDS ──────────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 mb-6">
        <ModernKpiCard
          icon={BookOpen}
          label="Total Mata Pelajaran"
          value={Number(stats.total || 0).toLocaleString('id-ID')}
          subtext="Terdaftar di seluruh kurikulum"
          tone="emerald"
        />
        <ModernKpiCard
          icon={CheckCircle2}
          label="Mata Pelajaran Aktif"
          value={Number(stats.aktif || 0).toLocaleString('id-ID')}
          subtext="Siap digunakan dalam pembelajaran"
          tag="Aktif"
          tone="teal"
        />
        <ModernKpiCard
          icon={Archive}
          label="Arsip / Nonaktif"
          value={Number(archiveCount || 0).toLocaleString('id-ID')}
          subtext="Nonaktif atau dalam arsip"
          tone="amber"
        />
      </div>

      {/* ── CANONICAL APPDATATABLE EMERALD OUTER CONTAINER ───────────────────── */}
      <AppDataTable
        title="Daftar Mata Pelajaran"
        icon={BookOpen}
        iconClassName="bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700 border border-emerald-300/40 shadow-emerald-600/30"
        description="Data mata pelajaran sesuai filter dan kewenangan pengguna."
        countLabel={`${Number(meta.total ?? stats.total ?? 0).toLocaleString('id-ID')} mapel`}
        actions={pageActions}
        search={search}
        onSearchChange={(value) => {
          setSearch(value)
          setPage(1)
        }}
        searchPlaceholder="Cari nama atau kode mata pelajaran..."
        filters={
          <>
            <MasterFilterSelect
              value={selectedUnitFilter}
              onChange={(event) => {
                const unitId = event.target.value
                const matchingKurikulum = resolveKurikulumForUnit(unitId)
                setSelectedUnitFilter(unitId)
                if (!matchingKurikulum.some((item) => String(item.id) === String(selectedKurikulumFilter))) setSelectedKurikulumFilter('')
                setPage(1)
              }}
              disabled={!canViewAllUnits && availableUnitOptions.length <= 1}
              aria-label="Filter unit pendidikan"
            >
              {canViewAllUnits && <option value="">Semua Unit</option>}
              {availableUnitOptions.map((unit) => (
                <option key={unit.id} value={unit.id}>{unit.name}</option>
              ))}
            </MasterFilterSelect>

            <MasterFilterSelect
              value={selectedKurikulumFilter}
              onChange={(event) => { setSelectedKurikulumFilter(event.target.value); setPage(1) }}
              aria-label="Filter kurikulum"
            >
              <option value="">Semua Kurikulum</option>
              {availableKurikulumForFilter.map((kurikulum) => (
                <option key={kurikulum.id} value={kurikulum.id}>{kurikulum.nama_kurikulum}</option>
              ))}
            </MasterFilterSelect>

            <MasterFilterSelect
              value={selectedKelompokFilter}
              onChange={(event) => { setSelectedKelompokFilter(event.target.value); setPage(1) }}
              aria-label="Filter kelompok mata pelajaran"
            >
              <option value="">Semua Kelompok</option>
              {KELOMPOK_LIST.map((kelompok) => (
                <option key={kelompok} value={kelompok}>{kelompok}</option>
              ))}
            </MasterFilterSelect>

            <MasterFilterSelect
              value={selectedKategoriFilter}
              onChange={(event) => { setSelectedKategoriFilter(event.target.value); setPage(1) }}
              aria-label="Filter kategori mata pelajaran"
            >
              <option value="">Semua Kategori</option>
              {KATEGORI_LIST.map((kategori) => (
                <option key={kategori} value={kategori}>{kategori}</option>
              ))}
            </MasterFilterSelect>

            <MasterFilterSelect
              value={selectedJenjangFilter}
              onChange={(event) => { setSelectedJenjangFilter(event.target.value); setPage(1) }}
              aria-label="Filter jenjang mata pelajaran"
            >
              <option value="">Semua Jenjang</option>
              {['PAUD', 'TK', 'SD', 'SMP', 'SMA', 'SMK'].map((jenjang) => (
                <option key={jenjang} value={jenjang}>{jenjang}</option>
              ))}
            </MasterFilterSelect>

            <MasterFilterSelect
              value={selectedStatusFilter}
              onChange={(event) => { setSelectedStatusFilter(event.target.value); setPage(1) }}
              aria-label="Filter status mata pelajaran"
            >
              <option value="">Semua Status</option>
              <option value="aktif">Aktif</option>
              <option value="tidak_aktif">Nonaktif</option>
            </MasterFilterSelect>

            <MasterFilterSelect
              value={denganSampahFilter}
              onChange={(event) => { setDenganSampahFilter(event.target.value); setPage(1) }}
              aria-label="Filter cakupan data"
            >
              <option value="">Data Aktif</option>
              <option value="1">Termasuk Arsip</option>
            </MasterFilterSelect>
          </>
        }
        onResetFilters={resetFilters}
        hasActiveFilters={filtersAreActive}
        isLoading={isLoading}
        isError={isError}
        errorTitle="Data mata pelajaran gagal dimuat"
        errorMessage="Periksa koneksi jaringan atau coba muat ulang data kembali."
        onRetry={refetch}
        isEmpty={!isLoading && !isError && items.length === 0}
        emptyTitle="Mata pelajaran tidak ditemukan"
        emptyDescription="Ubah kata kunci pencarian atau sesuaikan opsi filter aktif Anda."
        page={page}
        totalPages={meta.last_page ?? 1}
        totalItems={meta.total ?? stats.total ?? items.length}
        itemsPerPage={perPage}
        onPageChange={setPage}
        meta={meta}
        serverControlled
        renderTable={() => (
          <div className="overflow-x-auto">
            {/* Bulk Action Strip when checkboxes selected */}
            {selectedIds.length > 0 && (
              <div className="flex items-center justify-between gap-3 bg-emerald-50 px-5 py-3 border-b border-emerald-200 dark:bg-emerald-950/60 dark:border-emerald-800">
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center rounded-lg bg-emerald-700 text-white px-2.5 py-1 text-xs font-black">
                    {selectedIds.length} Dipilih
                  </span>
                  <span className="text-xs font-semibold text-emerald-900 dark:text-emerald-300">
                    Tindakan serentak untuk data mata pelajaran terpilih:
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => bulkStatusMutation.mutate({ ids: selectedIds, status: true })}
                    disabled={bulkStatusMutation.isPending}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-emerald-700 transition cursor-pointer shadow-xs"
                  >
                    <CheckCircle2 className="size-3.5" />
                    <span>Aktifkan</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => bulkStatusMutation.mutate({ ids: selectedIds, status: false })}
                    disabled={bulkStatusMutation.isPending}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-amber-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-amber-700 transition cursor-pointer shadow-xs"
                  >
                    <Archive className="size-3.5" />
                    <span>Nonaktifkan</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setBulkDeleteConfirmOpen(true)}
                    disabled={bulkDeleteMutation.isPending}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-rose-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-rose-700 transition cursor-pointer shadow-xs"
                  >
                    <Trash2 className="size-3.5" />
                    <span>Hapus Massal</span>
                  </button>
                </div>
              </div>
            )}

            <table className="w-full table-fixed text-left text-sm text-slate-600" aria-label="Daftar mata pelajaran">
              <thead className="border-b-2 border-emerald-200/90 bg-gradient-to-r from-emerald-100/90 via-teal-50/70 to-emerald-100/90 text-[10px] font-black uppercase tracking-[0.12em] text-emerald-950 dark:border-emerald-800/80 dark:from-emerald-950/90 dark:via-teal-950/70 dark:to-emerald-950/90 dark:text-emerald-200">
                <tr>
                  <th className="w-[5%] px-3 py-3.5 text-center">
                    <div className="flex justify-center">
                      <Checkbox
                        size="sm"
                        checked={isAllSelected}
                        onChange={toggleSelectAll}
                        aria-label={isAllSelected ? 'Batalkan pilih semua' : 'Pilih semua mata pelajaran'}
                      />
                    </div>
                  </th>
                  <th className="w-[28%] px-3 py-3.5 font-extrabold">Identitas Mapel</th>
                  <th className="hidden w-[20%] px-3 py-3.5 font-extrabold md:table-cell">Kurikulum & Unit</th>
                  <th className="hidden w-[16%] px-3 py-3.5 font-extrabold lg:table-cell">Klasifikasi</th>
                  <th className="hidden w-[14%] px-3 py-3.5 text-center font-extrabold xl:table-cell">Parameter</th>
                  <th className="hidden w-[9%] px-2 py-3.5 text-center font-extrabold sm:table-cell">Status</th>
                  <th className="w-[10%] px-2 py-3.5 text-center font-extrabold">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-emerald-100/80 font-medium text-slate-700 dark:divide-emerald-900/40 dark:text-slate-300">
                {items.map((row) => {
                  const isSelected = selectedIds.includes(row.id)
                  const subjectName = row.nama_mapel || row.name || 'Mata pelajaran'
                  const subjectColor = row.warna || '#0E5C44'

                  return (
                    <tr
                      key={row.id}
                      className={cn(
                        'transition-colors hover:bg-emerald-50/40 dark:hover:bg-emerald-950/20',
                        isSelected && 'bg-emerald-50/60 dark:bg-emerald-950/30'
                      )}
                    >
                      <td className="px-3 py-3.5 text-center">
                        <div className="flex justify-center">
                          <Checkbox
                            size="sm"
                            checked={isSelected}
                            onChange={() => toggleSelectRow(row.id)}
                            aria-label={`${isSelected ? 'Batalkan pilihan' : 'Pilih'} ${subjectName}`}
                          />
                        </div>
                      </td>
                      <td className="px-3 py-3.5">
                        <div className="flex min-w-0 items-center gap-3">
                          <span
                            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl shadow-xs border text-white font-bold"
                            style={{
                              backgroundColor: subjectColor,
                              borderColor: `${subjectColor}44`,
                            }}
                          >
                            <BookOpen className="h-5 w-5 text-white" />
                          </span>
                          <div className="min-w-0">
                            <p className="truncate text-xs font-black leading-snug text-slate-900 dark:text-white" title={subjectName}>
                              {subjectName}
                            </p>
                            <p className="truncate font-mono text-[10px] font-bold text-slate-400 mt-0.5">
                              {row.kode_mapel || row.code} {row.nama_singkat ? `(${row.nama_singkat})` : ''}
                            </p>
                            {/* Mobile Compact Metadata Row */}
                            <div className="md:hidden mt-1.5 flex flex-wrap items-center gap-1 pt-1 border-t border-emerald-100/80 dark:border-emerald-900/40">
                              <span className="inline-flex items-center rounded-md bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 text-[9px] font-bold text-slate-700 dark:text-slate-300">
                                {row.unit_pendidikan?.name || 'Unit'}
                              </span>
                              <span className="inline-flex items-center rounded-md bg-emerald-50 dark:bg-emerald-950/60 px-1.5 py-0.5 text-[9px] font-extrabold text-emerald-800 dark:text-emerald-300">
                                {row.kelompok_mapel || 'Kelompok A'}
                              </span>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="hidden px-3 py-3.5 md:table-cell">
                        <p className="truncate text-xs font-bold text-slate-800 dark:text-slate-100">
                          {row.kurikulum?.nama_kurikulum || 'Kurikulum Terpadu'}
                        </p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 flex items-center gap-1">
                          <Building className="size-3 text-slate-400 shrink-0" />
                          <span className="truncate">{row.unit_pendidikan?.name || 'Semua Unit'}</span>
                        </p>
                      </td>
                      <td className="hidden px-3 py-3.5 lg:table-cell">
                        <div className="space-y-1">
                          <span className="inline-block rounded-md bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-[10px] font-bold text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                            {row.kelompok_mapel || 'Kelompok A'}
                          </span>
                          <span className="block w-fit rounded-md bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 text-[10px] font-extrabold text-[#0E5C44] dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/80">
                            {row.kategori || 'Wajib'}
                          </span>
                        </div>
                      </td>
                      <td className="hidden px-3 py-3.5 text-center xl:table-cell">
                        <span className="inline-flex items-center gap-1 rounded-lg bg-emerald-100/90 dark:bg-emerald-950/80 border border-emerald-200/90 px-2 py-0.5 text-[10px] font-black text-emerald-900 dark:text-emerald-200">
                          <Clock3 className="size-3 text-emerald-700 dark:text-emerald-400" />
                          {row.jam_pelajaran || 2} JP · KKM {row.kkm || 75}
                        </span>
                        <p className="mt-1 text-[9px] font-semibold text-slate-400">
                          P:{row.bobot_pengetahuan || 40} / K:{row.bobot_keterampilan || 40} / S:{row.bobot_sikap || 20}
                        </p>
                      </td>
                      <td className="hidden px-2 py-3.5 text-center sm:table-cell">
                        <span
                          className={cn(
                            'inline-flex items-center justify-center gap-1.5 rounded-lg px-2.5 py-1 text-[11px] font-black border',
                            row.status
                              ? 'bg-emerald-50 text-[#0E5C44] border-emerald-200/80 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800/80'
                              : 'bg-rose-50 text-rose-700 border-rose-200/80 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800/80'
                          )}
                        >
                          <span className={cn('size-1.5 rounded-full shrink-0', row.status ? 'bg-emerald-500' : 'bg-rose-500')} />
                          <span>{row.status ? 'Aktif' : 'Nonaktif'}</span>
                        </span>
                      </td>
                      <td className="px-2 py-3.5 text-center">
                        <span className="inline-flex justify-center">
                          <ActionDropdown
                            onView={() => handleOpenDetail(row)}
                            onEdit={!row.is_deleted ? () => handleOpenFormEdit(row) : undefined}
                            extraItems={
                              row.is_deleted
                                ? [
                                    {
                                      label: 'Pulihkan Data',
                                      icon: <RotateCcw className="h-4 w-4 text-emerald-600" />,
                                      onClick: () => pulihkanMutation.mutate(row.id),
                                    },
                                  ]
                                : []
                            }
                            onDelete={!row.is_deleted ? () => setDeleteTarget(row) : undefined}
                          />
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      />

      {/* ── HARMONIZED FORM MODAL (TAMBAH / EDIT) ────────────────────────────── */}
      <AnimatePresence>
        {isFormModalOpen && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/70 backdrop-blur-md overflow-y-auto"
            role="dialog"
            aria-modal="true"
            aria-labelledby="subject-form-title"
            onMouseDown={(e) => {
              if (e.target === e.currentTarget && !simpanMutation.isPending) {
                setIsFormModalOpen(false)
              }
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 14 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ type: 'spring', stiffness: 400, damping: 28 }}
              className="w-full max-w-2xl font-sans my-auto"
            >
              <div className="flex max-h-[calc(100dvh-2rem)] flex-col overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-2xl shadow-emerald-950/20 dark:border-slate-800 dark:bg-[#182232] dark:shadow-black/60">
                {/* Top Accent Gradient Bar */}
                <div className="h-1.5 w-full bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-600 shrink-0" />

                {/* Header */}
                <div className="flex items-center justify-between border-b border-slate-100 bg-white px-6 py-4 dark:border-slate-800 dark:bg-slate-950 shrink-0">
                  <div className="flex items-center gap-3">
                    <div className="rounded-2xl bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700 text-white p-2.5 shadow-md shadow-emerald-500/30 border border-emerald-300/30 shrink-0">
                      <BookOpen className="size-5 text-white" strokeWidth={2.25} />
                    </div>
                    <div>
                      <h3 id="subject-form-title" className="text-sm sm:text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                        <span>{selectedForEdit ? 'Edit Mata Pelajaran' : 'Tambah Mata Pelajaran Baru'}</span>
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-[#0E5C44] border border-emerald-200/80 dark:bg-emerald-950/60 dark:text-emerald-400 dark:border-emerald-800/60">
                          <Sparkles className="size-3" />
                          {selectedForEdit ? 'Perbarui' : 'Data Baru'}
                        </span>
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        Lengkapi referensi kurikulum, klasifikasi, alokasi JP, dan parameter penilaian rapor.
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    disabled={simpanMutation.isPending}
                    onClick={() => setIsFormModalOpen(false)}
                    aria-label="Tutup formulir"
                    className="rounded-xl p-2 bg-gradient-to-br from-rose-500 via-rose-600 to-red-700 text-white border border-rose-300/40 hover:scale-105 transition-all duration-200 active:scale-95 cursor-pointer disabled:opacity-50"
                  >
                    <X className="size-4" strokeWidth={2.25} />
                  </button>
                </div>

                {/* Form Body */}
                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4 text-xs font-semibold text-slate-700 dark:text-slate-200">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Unit Pendidikan */}
                    <div>
                      <label className="mb-1.5 block text-xs font-bold text-slate-700 dark:text-slate-300">
                        Unit Pendidikan <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative">
                        <Building className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                        <select
                          value={formData.unit_pendidikan_id}
                          onChange={(e) => {
                            const newUnitId = e.target.value
                            const matchingKur = resolveKurikulumForUnit(newUnitId)
                            const currentUnit = (unitDropdown || []).find((u) => String(u.id) === String(newUnitId))
                            const jenjang = getUnitJenjang(currentUnit)
                            const isStillValid = matchingKur.some((k) => String(k.id) === String(formData.kurikulum_id))
                            setFormData({
                              ...formData,
                              unit_pendidikan_id: newUnitId,
                              kurikulum_id: isStillValid ? formData.kurikulum_id : (matchingKur[0]?.id || ''),
                              jenjang: jenjang || formData.jenjang,
                            })
                          }}
                          required
                          className="w-full rounded-xl border border-slate-200/90 bg-slate-50/50 pl-10 pr-4 py-2.5 text-xs font-semibold text-slate-800 focus:border-[#0E5C44] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#0E5C44]/12 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                        >
                          <option value="">Pilih Unit Pendidikan</option>
                          {unitDropdown.map((u) => (
                            <option key={u.id} value={u.id}>{u.name}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Kurikulum */}
                    <div>
                      <label className="mb-1.5 block text-xs font-bold text-slate-700 dark:text-slate-300">
                        Kurikulum <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative">
                        <Layers className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                        <select
                          value={formData.kurikulum_id}
                          onChange={(e) => setFormData({ ...formData, kurikulum_id: e.target.value })}
                          required
                          className="w-full rounded-xl border border-slate-200/90 bg-slate-50/50 pl-10 pr-4 py-2.5 text-xs font-semibold text-slate-800 focus:border-[#0E5C44] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#0E5C44]/12 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                        >
                          <option value="">Pilih Kurikulum</option>
                          {availableKurikulumForForm.map((k) => (
                            <option key={k.id} value={k.id}>
                              {k.nama_kurikulum} {k.jenjang ? `(${k.jenjang})` : ''}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Kode Mapel */}
                    <div>
                      <label className="mb-1.5 block text-xs font-bold text-slate-700 dark:text-slate-300">
                        Kode Mapel <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative">
                        <Hash className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                        <input
                          type="text"
                          value={formData.kode_mapel}
                          onChange={(e) => setFormData({ ...formData, kode_mapel: e.target.value })}
                          required
                          placeholder="Contoh: MP-SD-PAI"
                          className="w-full rounded-xl border border-slate-200/90 bg-slate-50/50 pl-10 pr-4 py-2.5 text-xs font-semibold text-slate-800 focus:border-[#0E5C44] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#0E5C44]/12 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                        />
                      </div>
                    </div>

                    {/* Nama Mapel */}
                    <div>
                      <label className="mb-1.5 block text-xs font-bold text-slate-700 dark:text-slate-300">
                        Nama Mapel <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative">
                        <BookOpen className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                        <input
                          type="text"
                          value={formData.nama_mapel}
                          onChange={(e) => setFormData({ ...formData, nama_mapel: e.target.value })}
                          required
                          placeholder="Contoh: Pendidikan Agama Islam"
                          className="w-full rounded-xl border border-slate-200/90 bg-slate-50/50 pl-10 pr-4 py-2.5 text-xs font-semibold text-slate-800 focus:border-[#0E5C44] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#0E5C44]/12 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                        />
                      </div>
                    </div>

                    {/* Nama Singkat */}
                    <div>
                      <label className="mb-1.5 block text-xs font-bold text-slate-700 dark:text-slate-300">
                        Nama Singkat / Singkatan
                      </label>
                      <div className="relative">
                        <Tag className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                        <input
                          type="text"
                          value={formData.nama_singkat}
                          onChange={(e) => setFormData({ ...formData, nama_singkat: e.target.value })}
                          placeholder="Contoh: PAI"
                          className="w-full rounded-xl border border-slate-200/90 bg-slate-50/50 pl-10 pr-4 py-2.5 text-xs font-semibold text-slate-800 focus:border-[#0E5C44] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#0E5C44]/12 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                        />
                      </div>
                    </div>

                    {/* Kelompok Mapel */}
                    <div>
                      <label className="mb-1.5 block text-xs font-bold text-slate-700 dark:text-slate-300">
                        Kelompok Mapel
                      </label>
                      <select
                        value={formData.kelompok_mapel}
                        onChange={(e) => setFormData({ ...formData, kelompok_mapel: e.target.value })}
                        className="w-full rounded-xl border border-slate-200/90 bg-slate-50/50 px-3.5 py-2.5 text-xs font-semibold text-slate-800 focus:border-[#0E5C44] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#0E5C44]/12 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                      >
                        {KELOMPOK_LIST.map((k) => (
                          <option key={k} value={k}>{k}</option>
                        ))}
                      </select>
                    </div>

                    {/* Kategori */}
                    <div>
                      <label className="mb-1.5 block text-xs font-bold text-slate-700 dark:text-slate-300">
                        Kategori
                      </label>
                      <select
                        value={formData.kategori}
                        onChange={(e) => setFormData({ ...formData, kategori: e.target.value })}
                        className="w-full rounded-xl border border-slate-200/90 bg-slate-50/50 px-3.5 py-2.5 text-xs font-semibold text-slate-800 focus:border-[#0E5C44] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#0E5C44]/12 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                      >
                        {KATEGORI_LIST.map((k) => (
                          <option key={k} value={k}>{k}</option>
                        ))}
                      </select>
                    </div>

                    {/* Jenjang */}
                    <div>
                      <label className="mb-1.5 block text-xs font-bold text-slate-700 dark:text-slate-300">
                        Jenjang
                      </label>
                      <div className="relative">
                        <GraduationCap className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                        <select
                          value={formData.jenjang}
                          onChange={(e) => setFormData({ ...formData, jenjang: e.target.value })}
                          className="w-full rounded-xl border border-slate-200/90 bg-slate-50/50 pl-10 pr-4 py-2.5 text-xs font-semibold text-slate-800 focus:border-[#0E5C44] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#0E5C44]/12 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                        >
                          {['PAUD', 'TK', 'SD', 'SMP', 'SMA', 'SMK'].map((j) => (
                            <option key={j} value={j}>{j}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Alokasi JP per Minggu */}
                    <div>
                      <label className="mb-1.5 block text-xs font-bold text-slate-700 dark:text-slate-300">
                        Alokasi JP per Minggu
                      </label>
                      <div className="relative">
                        <Clock3 className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                        <input
                          type="number"
                          min="1"
                          max="20"
                          value={formData.jam_pelajaran}
                          onChange={(e) => setFormData({ ...formData, jam_pelajaran: parseInt(e.target.value) || 0 })}
                          className="w-full rounded-xl border border-slate-200/90 bg-slate-50/50 pl-10 pr-4 py-2.5 text-xs font-semibold text-slate-800 focus:border-[#0E5C44] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#0E5C44]/12 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                        />
                      </div>
                    </div>

                    {/* KKM Minimum */}
                    <div>
                      <label className="mb-1.5 block text-xs font-bold text-slate-700 dark:text-slate-300">
                        KKM Minimum
                      </label>
                      <div className="relative">
                        <Target className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          max="100"
                          value={formData.kkm}
                          onChange={(e) => setFormData({ ...formData, kkm: parseFloat(e.target.value) || 0 })}
                          className="w-full rounded-xl border border-slate-200/90 bg-slate-50/50 pl-10 pr-4 py-2.5 text-xs font-semibold text-slate-800 focus:border-[#0E5C44] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#0E5C44]/12 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                        />
                      </div>
                    </div>

                    {/* Bobot Pengetahuan */}
                    <div>
                      <label className="mb-1.5 block text-xs font-bold text-slate-700 dark:text-slate-300">
                        Bobot Pengetahuan (%)
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={formData.bobot_pengetahuan}
                        onChange={(e) => setFormData({ ...formData, bobot_pengetahuan: parseInt(e.target.value) || 0 })}
                        className="w-full rounded-xl border border-slate-200/90 bg-slate-50/50 px-3.5 py-2.5 text-xs font-semibold text-slate-800 focus:border-[#0E5C44] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#0E5C44]/12 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                      />
                    </div>

                    {/* Bobot Keterampilan */}
                    <div>
                      <label className="mb-1.5 block text-xs font-bold text-slate-700 dark:text-slate-300">
                        Bobot Keterampilan (%)
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={formData.bobot_keterampilan}
                        onChange={(e) => setFormData({ ...formData, bobot_keterampilan: parseInt(e.target.value) || 0 })}
                        className="w-full rounded-xl border border-slate-200/90 bg-slate-50/50 px-3.5 py-2.5 text-xs font-semibold text-slate-800 focus:border-[#0E5C44] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#0E5C44]/12 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                      />
                    </div>

                    {/* Bobot Sikap */}
                    <div>
                      <label className="mb-1.5 block text-xs font-bold text-slate-700 dark:text-slate-300">
                        Bobot Sikap (%)
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={formData.bobot_sikap}
                        onChange={(e) => setFormData({ ...formData, bobot_sikap: parseInt(e.target.value) || 0 })}
                        className="w-full rounded-xl border border-slate-200/90 bg-slate-50/50 px-3.5 py-2.5 text-xs font-semibold text-slate-800 focus:border-[#0E5C44] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#0E5C44]/12 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                      />
                    </div>

                    {/* Warna Badge / Identitas */}
                    <div>
                      <label className="mb-1.5 block text-xs font-bold text-slate-700 dark:text-slate-300">
                        Warna Identitas Mapel
                      </label>
                      <div className="flex items-center gap-3">
                        <input
                          type="color"
                          value={formData.warna}
                          onChange={(e) => setFormData({ ...formData, warna: e.target.value })}
                          className="size-10 rounded-xl cursor-pointer border border-slate-200 dark:border-slate-700 p-0.5 bg-white"
                        />
                        <input
                          type="text"
                          value={formData.warna}
                          onChange={(e) => setFormData({ ...formData, warna: e.target.value })}
                          className="flex-1 rounded-xl border border-slate-200/90 bg-slate-50/50 px-3.5 py-2.5 text-xs font-mono font-bold text-slate-800 focus:border-[#0E5C44] focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                        />
                      </div>
                    </div>
                  </div>

                  {/* ── INTERACTIVE OPERATIONAL STATUS TOGGLE CARD ─────────────── */}
                  <div className="pt-2">
                    <label className="mb-1.5 block text-xs font-bold text-slate-700 dark:text-slate-300">
                      Status Keaktifan Mapel
                    </label>
                    <div
                      onClick={() => setFormData({ ...formData, status: !formData.status })}
                      className={cn(
                        'flex items-center justify-between p-4 rounded-2xl border-2 transition-all cursor-pointer select-none',
                        formData.status
                          ? 'border-emerald-500/40 bg-gradient-to-r from-emerald-50/90 via-teal-50/50 to-emerald-50/80 shadow-xs dark:border-emerald-700/60 dark:bg-gradient-to-r dark:from-emerald-950/60 dark:via-teal-950/40 dark:to-emerald-950/50'
                          : 'border-slate-200 bg-slate-50/80 dark:border-slate-800 dark:bg-slate-900/60'
                      )}
                    >
                      <div className="flex items-center gap-3.5">
                        <div
                          className={cn(
                            'flex size-11 shrink-0 items-center justify-center rounded-2xl text-white shadow-md transition-all',
                            formData.status
                              ? 'bg-gradient-to-br from-emerald-500 to-teal-600 shadow-emerald-500/30'
                              : 'bg-slate-400 dark:bg-slate-700 shadow-slate-400/20'
                          )}
                        >
                          {formData.status ? (
                            <ShieldCheck className="size-5.5" strokeWidth={2.3} />
                          ) : (
                            <Power className="size-5.5" strokeWidth={2.3} />
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-xs font-black text-slate-900 dark:text-white">
                              {formData.status ? 'Mata Pelajaran Aktif' : 'Mata Pelajaran Nonaktif'}
                            </h4>
                            <span
                              className={cn(
                                'inline-flex items-center gap-1 rounded-full px-2 py-0.2 text-[10px] font-bold border',
                                formData.status
                                  ? 'bg-emerald-100 text-emerald-800 border-emerald-300/60 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800'
                                  : 'bg-slate-200 text-slate-700 border-slate-300 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700'
                              )}
                            >
                              <Sparkles className="size-2.5" />
                              {formData.status ? 'Aktif' : 'Arsip'}
                            </span>
                          </div>
                          <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mt-0.5">
                            {formData.status
                              ? 'Mata pelajaran ini aktif digunakan dalam penyusunan jadwal, KBM, dan rapor.'
                              : 'Mata pelajaran tidak akan muncul pada pilihan jadwal baru dan nonaktif.'}
                          </p>
                        </div>
                      </div>

                      {/* Tactile Switch Button */}
                      <div
                        className={cn(
                          'relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out',
                          formData.status ? 'bg-gradient-to-r from-emerald-600 to-teal-600' : 'bg-slate-300 dark:bg-slate-700'
                        )}
                      >
                        <span
                          className={cn(
                            'pointer-events-none inline-block size-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out',
                            formData.status ? 'translate-x-5' : 'translate-x-0'
                          )}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Footer Aksi */}
                  <div className="flex items-center justify-between border-t border-slate-100 bg-white pt-4 dark:border-slate-800 dark:bg-slate-950">
                    <button
                      type="button"
                      disabled={simpanMutation.isPending}
                      onClick={() => setIsFormModalOpen(false)}
                      className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-br from-rose-500 via-rose-600 to-red-700 text-white px-4 py-2.5 text-xs font-extrabold border border-rose-300/40 transition-all duration-200 hover:scale-[1.03] active:scale-95 cursor-pointer disabled:opacity-50"
                    >
                      <div className="flex size-5 items-center justify-center rounded-lg bg-white/20 text-white">
                        <X className="size-3.5 text-white" strokeWidth={2.2} />
                      </div>
                      <span>Batal</span>
                    </button>
                    <button
                      type="submit"
                      disabled={simpanMutation.isPending}
                      className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700 text-white px-5 py-2.5 text-xs font-extrabold border border-emerald-300/40 hover:scale-[1.03] transition-all duration-200 active:scale-95 cursor-pointer disabled:opacity-50"
                    >
                      {simpanMutation.isPending ? (
                        <Loader2 className="size-4 animate-spin text-white" />
                      ) : (
                        <div className="flex size-5 items-center justify-center rounded-lg bg-white/20 text-white">
                          <Save className="size-3.5 text-white" strokeWidth={2.25} />
                        </div>
                      )}
                      <span>{simpanMutation.isPending ? 'Menyimpan...' : 'Simpan Data'}</span>
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── HARMONIZED DETAIL MODAL ──────────────────────────────────────────── */}
      <AnimatePresence>
        {isDetailModalOpen && selectedForDetail && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/70 backdrop-blur-md overflow-y-auto"
            role="dialog"
            aria-modal="true"
            aria-labelledby="subject-detail-title"
            onMouseDown={(e) => {
              if (e.target === e.currentTarget) setIsDetailModalOpen(false)
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 14 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ type: 'spring', stiffness: 400, damping: 28 }}
              className="w-full max-w-xl font-sans my-auto"
            >
              <div className="flex max-h-[calc(100dvh-2rem)] flex-col overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-2xl shadow-emerald-950/20 dark:border-slate-800 dark:bg-[#182232] dark:shadow-black/60">
                {/* Top Accent Gradient Bar */}
                <div className="h-1.5 w-full bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-600 shrink-0" />

                {/* Header */}
                <div className="flex items-center justify-between border-b border-slate-100 bg-white px-6 py-4.5 dark:border-slate-800 dark:bg-slate-950">
                  <div className="flex items-center gap-3">
                    <div
                      className="rounded-2xl p-2.5 shadow-md text-white shrink-0 border"
                      style={{
                        backgroundColor: selectedForDetail.warna || '#0E5C44',
                        borderColor: `${selectedForDetail.warna || '#0E5C44'}44`,
                      }}
                    >
                      <BookOpen className="size-5 text-white" strokeWidth={2.25} />
                    </div>
                    <div>
                      <h3 id="subject-detail-title" className="text-sm sm:text-base font-black text-slate-900 dark:text-white">
                        {selectedForDetail.nama_mapel || selectedForDetail.name}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-0.5">
                        {selectedForDetail.kode_mapel || selectedForDetail.code}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsDetailModalOpen(false)}
                    aria-label="Tutup detail"
                    className="rounded-xl p-2 bg-gradient-to-br from-rose-500 via-rose-600 to-red-700 text-white border border-rose-300/40 hover:scale-105 transition-all duration-200 active:scale-95 cursor-pointer"
                  >
                    <X className="size-4" strokeWidth={2.25} />
                  </button>
                </div>

                {/* Body */}
                <div className="p-6 space-y-3.5 text-xs">
                  {/* Identity Box */}
                  <div className="space-y-2 rounded-2xl border border-slate-200/80 bg-slate-50/70 p-4 dark:border-slate-800 dark:bg-slate-900/40">
                    <div className="flex items-center justify-between border-b border-slate-200/60 pb-2 dark:border-slate-800">
                      <span className="font-bold text-slate-500">Kode & Singkatan</span>
                      <span className="font-mono font-extrabold text-slate-800 dark:text-slate-100">
                        {selectedForDetail.kode_mapel || selectedForDetail.code} {selectedForDetail.nama_singkat ? `(${selectedForDetail.nama_singkat})` : ''}
                      </span>
                    </div>
                    <div className="flex items-center justify-between border-b border-slate-200/60 pb-2 dark:border-slate-800">
                      <span className="font-bold text-slate-500">Kurikulum</span>
                      <span className="font-bold text-emerald-800 dark:text-emerald-300">
                        {selectedForDetail.kurikulum?.nama_kurikulum || 'Kurikulum Terpadu'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between border-b border-slate-200/60 pb-2 dark:border-slate-800">
                      <span className="font-bold text-slate-500">Unit Pendidikan</span>
                      <span className="font-bold text-slate-800 dark:text-slate-100">
                        {selectedForDetail.unit_pendidikan?.name || 'Semua Unit'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-500">Klasifikasi</span>
                      <span className="font-bold text-slate-700 dark:text-slate-300">
                        {selectedForDetail.kelompok_mapel || 'Kelompok A'} · {selectedForDetail.kategori || 'Wajib'}
                      </span>
                    </div>
                  </div>

                  {/* JP & KKM Metrics */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex items-center gap-3 rounded-2xl border border-emerald-200/80 bg-emerald-50/70 p-3.5 dark:border-emerald-800 dark:bg-emerald-950/40">
                      <div className="flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-xs shrink-0">
                        <Clock3 className="size-5" />
                      </div>
                      <div>
                        <p className="text-[10px] font-black uppercase text-slate-500 dark:text-slate-400">Alokasi Waktu</p>
                        <p className="text-sm font-black text-emerald-900 dark:text-emerald-200">{selectedForDetail.jam_pelajaran || 2} JP / Minggu</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 rounded-2xl border border-teal-200/80 bg-teal-50/70 p-3.5 dark:border-teal-800 dark:bg-teal-950/40">
                      <div className="flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-teal-500 to-emerald-600 text-white shadow-xs shrink-0">
                        <Target className="size-5" />
                      </div>
                      <div>
                        <p className="text-[10px] font-black uppercase text-slate-500 dark:text-slate-400">KKM Minimum</p>
                        <p className="text-sm font-black text-teal-900 dark:text-teal-200">{selectedForDetail.kkm || 75}</p>
                      </div>
                    </div>
                  </div>

                  {/* Bobot Penilaian */}
                  <div className="rounded-2xl border border-slate-200/80 bg-slate-50/70 p-4 dark:border-slate-800 dark:bg-slate-900/40">
                    <p className="mb-2 flex items-center gap-2 text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      <ChartNoAxesColumn className="size-3.5 text-emerald-700 dark:text-emerald-400" />
                      Bobot Penilaian Rapor
                    </p>
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div className="p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700">
                        <span className="block text-[10px] text-slate-400 font-bold">Pengetahuan</span>
                        <strong className="text-xs font-black text-slate-800 dark:text-slate-100">{selectedForDetail.bobot_pengetahuan || 40}%</strong>
                      </div>
                      <div className="p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700">
                        <span className="block text-[10px] text-slate-400 font-bold">Keterampilan</span>
                        <strong className="text-xs font-black text-slate-800 dark:text-slate-100">{selectedForDetail.bobot_keterampilan || 40}%</strong>
                      </div>
                      <div className="p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700">
                        <span className="block text-[10px] text-slate-400 font-bold">Sikap</span>
                        <strong className="text-xs font-black text-slate-800 dark:text-slate-100">{selectedForDetail.bobot_sikap || 20}%</strong>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="flex justify-end border-t border-slate-100 bg-slate-50/50 px-6 py-4 dark:border-slate-800 dark:bg-slate-900/30">
                  <button
                    type="button"
                    onClick={() => setIsDetailModalOpen(false)}
                    className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs font-extrabold text-slate-700 hover:bg-slate-100 transition dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 cursor-pointer"
                  >
                    Tutup
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── HARMONIZED EXPORT MODAL ──────────────────────────────────────────── */}
      <AnimatePresence>
        {isExportModalOpen && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/70 backdrop-blur-md"
            role="dialog"
            aria-modal="true"
            aria-labelledby="subject-export-title"
            onMouseDown={(e) => {
              if (e.target === e.currentTarget) setIsExportModalOpen(false)
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 14 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ type: 'spring', stiffness: 400, damping: 28 }}
              className="w-full max-w-md font-sans my-auto"
            >
              <div className="flex max-h-[calc(100dvh-2rem)] flex-col overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-2xl shadow-emerald-950/20 dark:border-slate-800 dark:bg-[#182232] dark:shadow-black/60">
                {/* Top Accent Gradient Bar */}
                <div className="h-1.5 w-full bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-600 shrink-0" />

                {/* Header */}
                <div className="flex items-center justify-between border-b border-slate-100 bg-white px-6 py-4.5 dark:border-slate-800 dark:bg-slate-950">
                  <div className="flex items-center gap-3">
                    <div className="rounded-2xl bg-gradient-to-br from-amber-500 via-amber-600 to-orange-600 text-white p-2.5 shadow-md shadow-amber-500/30 border border-amber-300/30 shrink-0">
                      <Download className="size-5 text-white" strokeWidth={2.25} />
                    </div>
                    <div>
                      <h3 id="subject-export-title" className="text-sm sm:text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                        <span>Export Mata Pelajaran</span>
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-[#0E5C44] border border-emerald-200/80 dark:bg-emerald-950/60 dark:text-emerald-400 dark:border-emerald-800/60">
                          <Sparkles className="size-3" />
                          Unduh
                        </span>
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        Pilih format berkas untuk mengekspor data mata pelajaran
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsExportModalOpen(false)}
                    aria-label="Tutup modal export"
                    className="rounded-xl p-2 bg-gradient-to-br from-rose-500 via-rose-600 to-red-700 text-white border border-rose-300/40 hover:scale-105 transition-all duration-200 active:scale-95 cursor-pointer"
                  >
                    <X className="size-4" strokeWidth={2.25} />
                  </button>
                </div>

                {/* Body */}
                <div className="space-y-2.5 p-6 text-sm text-slate-700 dark:text-slate-200">
                  {[
                    { value: 'xlsx', label: 'Excel (.xlsx)', desc: 'Format Microsoft Excel Modern (Disarankan)' },
                    { value: 'xls', label: 'Excel Legacy (.xls)', desc: 'Format Microsoft Excel Standard 97-2003' },
                    { value: 'csv', label: 'CSV (.csv)', desc: 'Format Comma-Separated Values universal' },
                    { value: 'pdf', label: 'PDF (.pdf)', desc: 'Format Cetak Dokumen Resmi' },
                  ].map((opt) => (
                    <label
                      key={opt.value}
                      className={cn(
                        'flex cursor-pointer items-center gap-3 rounded-2xl border p-3.5 transition-all',
                        exportFormat === opt.value
                          ? 'border-emerald-500 bg-emerald-50/60 shadow-2xs dark:border-emerald-600 dark:bg-emerald-950/40'
                          : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/50 dark:border-slate-800 dark:hover:border-slate-700 dark:hover:bg-slate-800/40'
                      )}
                    >
                      <input
                        type="radio"
                        name="export-format-subject"
                        value={opt.value}
                        checked={exportFormat === opt.value}
                        onChange={() => setExportFormat(opt.value)}
                        className="accent-emerald-600 size-4"
                      />
                      <div>
                        <p className="text-xs font-bold text-slate-800 dark:text-slate-100">{opt.label}</p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">{opt.desc}</p>
                      </div>
                    </label>
                  ))}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50/50 px-6 py-4 dark:border-slate-800 dark:bg-slate-900/30">
                  <button
                    type="button"
                    onClick={() => setIsExportModalOpen(false)}
                    className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-br from-rose-500 via-rose-600 to-red-700 text-white px-4 py-2.5 text-xs font-extrabold border border-rose-300/40 transition-all duration-200 hover:scale-[1.03] active:scale-95 cursor-pointer"
                  >
                    <div className="flex size-5 items-center justify-center rounded-lg bg-white/20 text-white">
                      <X className="size-3.5 text-white" strokeWidth={2.2} />
                    </div>
                    <span>Batal</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleProcessExport}
                    className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-br from-amber-400 via-amber-500 to-orange-600 text-white px-5 py-2.5 text-xs font-extrabold border border-amber-300/40 hover:scale-[1.03] transition-all duration-200 active:scale-95 cursor-pointer"
                  >
                    <div className="flex size-5 items-center justify-center rounded-lg bg-white/20 text-white">
                      <Download className="size-3.5 text-white" strokeWidth={2.25} />
                    </div>
                    <span>Unduh Berkas</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── HARMONIZED IMPORT MODAL ──────────────────────────────────────────── */}
      <AnimatePresence>
        {isImportModalOpen && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/70 backdrop-blur-md"
            role="dialog"
            aria-modal="true"
            aria-labelledby="subject-import-title"
            onMouseDown={(e) => {
              if (e.target === e.currentTarget) setIsImportModalOpen(false)
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 14 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ type: 'spring', stiffness: 400, damping: 28 }}
              className="w-full max-w-md font-sans my-auto"
            >
              <div className="flex max-h-[calc(100dvh-2rem)] flex-col overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-2xl shadow-emerald-950/20 dark:border-slate-800 dark:bg-[#182232] dark:shadow-black/60">
                {/* Top Accent Gradient Bar */}
                <div className="h-1.5 w-full bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-600 shrink-0" />

                {/* Header */}
                <div className="flex items-center justify-between border-b border-slate-100 bg-white px-6 py-4.5 dark:border-slate-800 dark:bg-slate-950">
                  <div className="flex items-center gap-3">
                    <div className="rounded-2xl bg-gradient-to-br from-sky-400 via-sky-500 to-blue-600 text-white p-2.5 shadow-md shadow-sky-500/30 border border-sky-300/30 shrink-0">
                      <Upload className="size-5 text-white" strokeWidth={2.25} />
                    </div>
                    <div>
                      <h3 id="subject-import-title" className="text-sm sm:text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                        <span>Import Mata Pelajaran</span>
                        <span className="inline-flex items-center gap-1 rounded-full bg-sky-50 px-2 py-0.5 text-[10px] font-bold text-sky-800 border border-sky-200/80 dark:bg-sky-950/60 dark:text-sky-300">
                          <Sparkles className="size-3" />
                          Batch
                        </span>
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        Unggah file Excel atau CSV sesuai template standar
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsImportModalOpen(false)}
                    aria-label="Tutup modal import"
                    className="rounded-xl p-2 bg-gradient-to-br from-rose-500 via-rose-600 to-red-700 text-white border border-rose-300/40 hover:scale-105 transition-all duration-200 active:scale-95 cursor-pointer"
                  >
                    <X className="size-4" strokeWidth={2.25} />
                  </button>
                </div>

                {/* Form Body */}
                <form onSubmit={handleImportSubmit} className="p-6 space-y-4">
                  {/* Download Template Banner */}
                  <div className="flex items-center justify-between p-3.5 rounded-2xl bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-800">
                    <div className="flex items-center gap-2.5">
                      <FileSpreadsheet className="size-5 text-emerald-700 dark:text-emerald-400" />
                      <div>
                        <p className="text-xs font-bold text-emerald-900 dark:text-emerald-200">Unduh Format Template</p>
                        <p className="text-[10px] text-emerald-700/80 dark:text-emerald-400/80">Format CSV siap pakai dengan header lengkap</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleDownloadTemplate}
                      className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shadow-xs cursor-pointer"
                    >
                      Template
                    </button>
                  </div>

                  {/* Dropzone */}
                  <div className="rounded-2xl border-2 border-dashed border-emerald-300 bg-emerald-50/40 p-6 text-center dark:border-emerald-700 dark:bg-emerald-950/20">
                    <FileSpreadsheet className="mx-auto mb-2 size-10 text-emerald-600 dark:text-emerald-400" />
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-100">Pilih berkas Excel (.xlsx, .xls) atau CSV</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">Ukuran maksimal file 10 MB</p>
                    <input
                      type="file"
                      accept=".xlsx, .xls, .csv"
                      onChange={(e) => setImportFile(e.target.files[0] || null)}
                      className="mt-3 text-xs w-full text-slate-600 dark:text-slate-300 file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-emerald-600 file:text-white file:cursor-pointer"
                    />
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-between border-t border-slate-100 bg-white pt-4 dark:border-slate-800 dark:bg-slate-950">
                    <button
                      type="button"
                      onClick={() => setIsImportModalOpen(false)}
                      className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-br from-rose-500 via-rose-600 to-red-700 text-white px-4 py-2.5 text-xs font-extrabold border border-rose-300/40 transition-all duration-200 hover:scale-[1.03] active:scale-95 cursor-pointer"
                    >
                      <div className="flex size-5 items-center justify-center rounded-lg bg-white/20 text-white">
                        <X className="size-3.5 text-white" strokeWidth={2.2} />
                      </div>
                      <span>Batal</span>
                    </button>
                    <button
                      type="submit"
                      disabled={!importFile}
                      className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-br from-sky-400 via-sky-500 to-blue-600 text-white px-5 py-2.5 text-xs font-extrabold border border-sky-300/40 hover:scale-[1.03] transition-all duration-200 active:scale-95 cursor-pointer disabled:opacity-50"
                    >
                      <div className="flex size-5 items-center justify-center rounded-lg bg-white/20 text-white">
                        <Upload className="size-3.5 text-white" strokeWidth={2.25} />
                      </div>
                      <span>Upload & Impor</span>
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── HARMONIZED DELETE CONFIRMATION MODAL (z-[70]) ────────────────────── */}
      <AnimatePresence>
        {deleteTarget && (
          <div
            className="fixed inset-0 z-[70] flex items-center justify-center p-3 sm:p-5 bg-slate-950/70 backdrop-blur-md"
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-confirm-title"
            onMouseDown={(e) => {
              if (e.target === e.currentTarget && !hapusMutation.isPending) {
                setDeleteTarget(null)
              }
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 14 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ type: 'spring', stiffness: 400, damping: 28 }}
              className="w-full max-w-md font-sans my-auto"
            >
              <div className="flex flex-col overflow-hidden rounded-3xl border border-rose-200/80 bg-white shadow-2xl shadow-rose-950/20 dark:border-rose-900/60 dark:bg-[#182232] dark:shadow-black/60">
                {/* Top Accent Gradient Bar */}
                <div className="h-1.5 w-full bg-gradient-to-r from-rose-500 via-rose-600 to-red-700 shrink-0" />

                {/* Header */}
                <div className="flex items-center justify-between border-b border-slate-100 bg-white px-6 py-4.5 dark:border-slate-800 dark:bg-slate-950">
                  <div className="flex items-center gap-3">
                    <div className="rounded-2xl bg-gradient-to-br from-rose-500 to-red-700 text-white p-2.5 shadow-md shadow-rose-500/30 border border-rose-300/30 shrink-0">
                      <Trash2 className="size-5 text-white" strokeWidth={2.25} />
                    </div>
                    <div>
                      <h3 id="delete-confirm-title" className="text-sm sm:text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                        <span>Hapus Mata Pelajaran</span>
                        <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2 py-0.5 text-[10px] font-bold text-rose-700 border border-rose-200/80 dark:bg-rose-950/60 dark:text-rose-300">
                          Konfirmasi
                        </span>
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        Tindakan ini akan mengarsipkan data mata pelajaran
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    disabled={hapusMutation.isPending}
                    onClick={() => setDeleteTarget(null)}
                    aria-label="Batal hapus"
                    className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 transition"
                  >
                    <X className="size-4" strokeWidth={2.2} />
                  </button>
                </div>

                {/* Target Entity Summary Box */}
                <div className="p-6 space-y-3.5">
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200/80 dark:border-slate-800">
                    <span className="text-[10px] uppercase font-bold text-slate-400">Target Mata Pelajaran</span>
                    <h4 className="text-sm font-black text-slate-900 dark:text-white mt-0.5">
                      {deleteTarget.nama_mapel || deleteTarget.name}
                    </h4>
                    <p className="text-xs font-mono text-slate-500 mt-0.5">
                      Kode: {deleteTarget.kode_mapel || deleteTarget.code} · {deleteTarget.unit_pendidikan?.name || 'Unit'}
                    </p>
                  </div>

                  {/* Danger Notice Box */}
                  <div className="rounded-2xl border border-rose-200/80 bg-rose-50/70 p-3.5 text-xs font-semibold text-rose-900 dark:border-rose-900/50 dark:bg-rose-950/30 dark:text-rose-300 leading-relaxed flex items-start gap-2.5">
                    <div className="size-6 shrink-0 rounded-lg bg-rose-600 flex items-center justify-center text-white mt-0.5">
                      <AlertTriangle className="size-3.5" />
                    </div>
                    <p>
                      Apakah Anda yakin ingin menghapus mata pelajaran ini? Data yang terhapus dapat dipulihkan kembali dari filter arsip jika diperlukan.
                    </p>
                  </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between border-t border-slate-100 bg-white px-6 py-4 dark:border-slate-800 dark:bg-slate-950">
                  <button
                    type="button"
                    disabled={hapusMutation.isPending}
                    onClick={() => setDeleteTarget(null)}
                    className="inline-flex items-center gap-2 rounded-2xl border border-slate-300 bg-slate-100 px-4 py-2.5 text-xs font-extrabold text-slate-700 transition-all duration-200 hover:scale-[1.02] hover:bg-slate-200 active:scale-95 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 cursor-pointer disabled:opacity-50"
                  >
                    <X className="size-3.5" strokeWidth={2.2} />
                    <span>Batal</span>
                  </button>
                  <button
                    type="button"
                    disabled={hapusMutation.isPending}
                    onClick={() => hapusMutation.mutate(deleteTarget.id)}
                    className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-br from-rose-500 via-rose-600 to-red-700 px-5 py-2.5 text-xs font-black text-white shadow-md shadow-rose-500/30 transition-all duration-200 hover:scale-[1.02] active:scale-95 cursor-pointer disabled:opacity-50"
                  >
                    {hapusMutation.isPending ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      <Trash2 className="size-4" strokeWidth={2.2} />
                    )}
                    <span>{hapusMutation.isPending ? 'Menghapus...' : 'Ya, Hapus Data'}</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── HARMONIZED BULK DELETE CONFIRMATION MODAL (z-[70]) ──────────────── */}
      <AnimatePresence>
        {bulkDeleteConfirmOpen && (
          <div
            className="fixed inset-0 z-[70] flex items-center justify-center p-3 sm:p-5 bg-slate-950/70 backdrop-blur-md"
            role="dialog"
            aria-modal="true"
            aria-labelledby="bulk-delete-confirm-title"
            onMouseDown={(e) => {
              if (e.target === e.currentTarget && !bulkDeleteMutation.isPending) {
                setBulkDeleteConfirmOpen(false)
              }
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 14 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ type: 'spring', stiffness: 400, damping: 28 }}
              className="w-full max-w-md font-sans my-auto"
            >
              <div className="flex flex-col overflow-hidden rounded-3xl border border-rose-200/80 bg-white shadow-2xl shadow-rose-950/20 dark:border-rose-900/60 dark:bg-[#182232] dark:shadow-black/60">
                <div className="h-1.5 w-full bg-gradient-to-r from-rose-500 via-rose-600 to-red-700 shrink-0" />
                <div className="flex items-center justify-between border-b border-slate-100 bg-white px-6 py-4.5 dark:border-slate-800 dark:bg-slate-950">
                  <div className="flex items-center gap-3">
                    <div className="rounded-2xl bg-gradient-to-br from-rose-500 to-red-700 text-white p-2.5 shadow-md shadow-rose-500/30 border border-rose-300/30 shrink-0">
                      <Trash2 className="size-5 text-white" strokeWidth={2.25} />
                    </div>
                    <div>
                      <h3 id="bulk-delete-confirm-title" className="text-sm sm:text-base font-black text-slate-900 dark:text-white">
                        Hapus Massal Mata Pelajaran
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        Konfirmasi penghapusan beberapa data sekaligus
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    disabled={bulkDeleteMutation.isPending}
                    onClick={() => setBulkDeleteConfirmOpen(false)}
                    aria-label="Batal hapus"
                    className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 transition"
                  >
                    <X className="size-4" strokeWidth={2.2} />
                  </button>
                </div>
                <div className="p-6 space-y-3.5">
                  <div className="p-4 rounded-2xl bg-rose-50/60 dark:bg-rose-950/30 border border-rose-200/80 dark:border-rose-900/50">
                    <span className="text-[10px] uppercase font-bold text-rose-500">Jumlah Data Terpilih</span>
                    <h4 className="text-lg font-black text-rose-950 dark:text-rose-200 mt-0.5">
                      {selectedIds.length} Mata Pelajaran
                    </h4>
                    <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
                      Apakah Anda yakin ingin menghapus seluruh data mata pelajaran yang telah Anda centang?
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-between border-t border-slate-100 bg-white px-6 py-4 dark:border-slate-800 dark:bg-slate-950">
                  <button
                    type="button"
                    disabled={bulkDeleteMutation.isPending}
                    onClick={() => setBulkDeleteConfirmOpen(false)}
                    className="inline-flex items-center gap-2 rounded-2xl border border-slate-300 bg-slate-100 px-4 py-2.5 text-xs font-extrabold text-slate-700 transition-all duration-200 hover:scale-[1.02] hover:bg-slate-200 active:scale-95 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 cursor-pointer disabled:opacity-50"
                  >
                    <X className="size-3.5" strokeWidth={2.2} />
                    <span>Batal</span>
                  </button>
                  <button
                    type="button"
                    disabled={bulkDeleteMutation.isPending}
                    onClick={() => bulkDeleteMutation.mutate(selectedIds)}
                    className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-br from-rose-500 via-rose-600 to-red-700 px-5 py-2.5 text-xs font-black text-white shadow-md shadow-rose-500/30 transition-all duration-200 hover:scale-[1.02] active:scale-95 cursor-pointer disabled:opacity-50"
                  >
                    {bulkDeleteMutation.isPending ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      <Trash2 className="size-4" strokeWidth={2.2} />
                    )}
                    <span>{bulkDeleteMutation.isPending ? 'Menghapus...' : 'Ya, Hapus Semua'}</span>
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
