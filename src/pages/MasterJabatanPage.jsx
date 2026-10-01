import React, { useState, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Briefcase as FaBriefcase,
  CircleCheck as FaCheckCircle,
  Network as FaSitemap,
  LockOpen as FaLockOpen,
  Lock as FaLock,
  RotateCcw as FaRedo,
  ChevronDown,
  RefreshCcw,
  Printer,
  BarChart2,
  PieChart as PieIcon,
  X,
  Search,
  Eye,
  ShieldCheck,
  Sparkles,
  Pencil,
  Trash2,
  Save,
  AlertTriangle,
  CheckCircle2,
  Download,
  FileSpreadsheet,
  FileText,
} from 'lucide-react'
import { Download1, Upload1, Plus } from '@tailgrids/icons'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { jabatanService } from '../services/jabatanService'
import JabatanFormModal from '../components/jabatan/JabatanFormModal'
import JabatanDetailModal from '../components/jabatan/JabatanDetailModal'
import JabatanImportModal from '../components/jabatan/JabatanImportModal'
import PageContainer from '../components/app/PageContainer'
import AppBreadcrumb from '../components/app/AppBreadcrumb'
import AppDataTable from '../components/app/AppDataTable'
import ActionDropdown from '../components/app/ActionDropdown'
import AppBadge from '../components/app/AppBadge'
import { MasterStatusBadge, PrintOptionModal } from '../components/master-data'
import { printCleanTable, downloadPdfTable } from '../utils/printHelper'
import { downloadFileFromApi } from '../utils/exportUtils'
import { Button } from '@/components/tailgrids/core/button'
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '@/components/tailgrids/core/hover-card'
import { useAuthStore } from '../stores/authStore'
import { usePengaturanStore } from '../stores/pengaturanStore'
import { hasAnyRole, isGlobalAccessManager, isUnitAccessManager } from '../auth/portalResolver'
import { useDebounce } from '../hooks/useDebounce'
import { cn } from '../lib/utils'

// ── MODERN KPI CARD TONE DEFINITIONS ──────────────────────────────────────────
const MODERN_CARD_TONES = {
  emerald: {
    card: 'border-emerald-300/70 bg-gradient-to-br from-emerald-50 via-teal-50/60 to-white hover:border-emerald-400 dark:border-emerald-700/50 dark:from-emerald-950/40 dark:via-teal-950/20 dark:to-slate-900',
    glow: 'bg-emerald-400/20 group-hover:bg-emerald-400/30',
    iconBox: 'bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-emerald-500/30',
    tag: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/60 dark:text-emerald-300',
    title: 'text-emerald-700 dark:text-emerald-400',
    sub: 'text-emerald-600/80 dark:text-emerald-400/80',
    cta: 'text-emerald-600/60 dark:text-emerald-500/60',
  },
  teal: {
    card: 'border-teal-300/70 bg-gradient-to-br from-teal-50 via-emerald-50/60 to-white hover:border-teal-400 dark:border-teal-700/50 dark:from-teal-950/40 dark:via-emerald-950/20 dark:to-slate-900',
    glow: 'bg-teal-400/20 group-hover:bg-teal-400/30',
    iconBox: 'bg-gradient-to-br from-teal-500 to-emerald-600 text-white shadow-teal-500/30',
    tag: 'bg-teal-100 text-teal-700 dark:bg-teal-900/60 dark:text-teal-300',
    title: 'text-teal-700 dark:text-teal-400',
    sub: 'text-teal-600/80 dark:text-teal-400/80',
    cta: 'text-teal-600/60 dark:text-teal-500/60',
  },
  amber: {
    card: 'border-amber-300/70 bg-gradient-to-br from-amber-50 via-orange-50/60 to-white hover:border-amber-400 dark:border-amber-700/50 dark:from-amber-950/40 dark:via-orange-950/20 dark:to-slate-900',
    glow: 'bg-amber-400/20 group-hover:bg-amber-400/30',
    iconBox: 'bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-amber-500/30',
    tag: 'bg-amber-100 text-amber-700 dark:bg-amber-900/60 dark:text-amber-300',
    title: 'text-amber-700 dark:text-amber-400',
    sub: 'text-amber-600/80 dark:text-amber-400/80',
    cta: 'text-amber-600/60 dark:text-amber-500/60',
  },
  sky: {
    card: 'border-sky-300/70 bg-gradient-to-br from-sky-50 via-blue-50/60 to-white hover:border-sky-400 dark:border-sky-700/50 dark:from-sky-950/40 dark:via-blue-950/20 dark:to-slate-900',
    glow: 'bg-sky-400/20 group-hover:bg-sky-400/30',
    iconBox: 'bg-gradient-to-br from-sky-500 to-blue-600 text-white shadow-sky-500/30',
    tag: 'bg-sky-100 text-sky-700 dark:bg-sky-900/60 dark:text-sky-300',
    title: 'text-sky-700 dark:text-sky-400',
    sub: 'text-sky-600/80 dark:text-sky-400/80',
    cta: 'text-sky-600/60 dark:text-sky-500/60',
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
          <span className="text-slate-500 dark:text-slate-400">Klik untuk rincian</span>
          <span className={cn('flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform', t.cta)}>
            Detail &rarr;
          </span>
        </div>
      )}
    </motion.div>
  )
}

// ── TOAST NOTIFICATION STACK ──────────────────────────────────────────────────
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
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5 transition-colors cursor-pointer"
            >
              <X className="size-4" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </aside>
  )
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.05 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 350, damping: 25 },
  },
}

export default function MasterJabatanPage() {
  const queryClient = useQueryClient()
  const user = useAuthStore((state) => state.user)
  const sitePengaturan = usePengaturanStore((state) => state.pengaturan)
  const roles = user?.roles || (user?.role ? [user.role] : [])
  const isKepalaSekolah = hasAnyRole(roles, ['Kepala Sekolah', 'kepala_sekolah', 'kepsek'])
  const canManageGlobalPositions = isGlobalAccessManager(roles)
  const canManageUnitPositions = isUnitAccessManager(roles)
  const canEditPosition = canManageGlobalPositions || canManageUnitPositions

  const isPengurusYayasanRow = (row) => {
    if (!row) return false
    if (Number(row.level_jabatan) === 1) return true
    if (row.satuan_kerja === 'Pengurus') return true
    const name = String(row.nama_jabatan || row.name || '').toLowerCase()
    if (name.includes('pengurus yayasan') || name.includes('yayasan')) return true
    const levelLabel = String(row.level_label || '').toLowerCase()
    if (levelLabel.includes('pengurus yayasan') || levelLabel.includes('yayasan')) return true
    return false
  }

  const isRowRestrictedForUser = (row) => {
    const isGlobalPosition =
      Number(row?.level_jabatan) <= 2 ||
      ['semua_unit', 'bidang_pendidikan'].includes(row?.scope_akses) ||
      row?.satuan_kerja !== 'Unit Pendidikan'
    return !canManageGlobalPositions && (isPengurusYayasanRow(row) || !row?.unit_sekolah_id || isGlobalPosition)
  }

  // Filter & Pagination States
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebounce(search, 350)
  const [selectedUnitFilter, setSelectedUnitFilter] = useState('')
  const [selectedSatuanKerjaFilter, setSelectedSatuanKerjaFilter] = useState('')
  const [selectedLevelFilter, setSelectedLevelFilter] = useState('')
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('')
  const [denganSampahFilter, setDenganSampahFilter] = useState('')
  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useState(10)

  // Modals States
  const [isFormModalOpen, setIsFormModalOpen] = useState(false)
  const [selectedJabatanForEdit, setSelectedJabatanForEdit] = useState(null)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
  const [selectedJabatanForDetail, setSelectedJabatanForDetail] = useState(null)
  const [isImportModalOpen, setIsImportModalOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [restoreTarget, setRestoreTarget] = useState(null)
  const [pendingSaveData, setPendingSaveData] = useState(null)
  const [showSaveConfirmModal, setShowSaveConfirmModal] = useState(false)
  const [printOptionModalOpen, setPrintOptionModalOpen] = useState(false)
  const [activeKpiModal, setActiveKpiModal] = useState(null)
  const [kpiModalSearch, setKpiModalSearch] = useState('')
  const [showExportModal, setShowExportModal] = useState(false)
  const [exportFormat, setExportFormat] = useState('xlsx')
  const [isExporting, setIsExporting] = useState(false)

  // Toast Notifications (Zero SweetAlert2)
  const [toasts, setToasts] = useState([])
  const pushToast = (title, message = '', type = 'success') => {
    const id = `${Date.now()}-${Math.random()}`
    setToasts((prev) => [...prev, { id, title, message, type }])
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, 4500)
  }
  const dismissToast = (id) => setToasts((prev) => prev.filter((t) => t.id !== id))

  // Query Options Dropdown
  const { data: options = {} } = useQuery({
    queryKey: ['jabatan-options'],
    queryFn: () => jabatanService.getOptions(),
  })

  // Query Daftar Jabatan
  const {
    data: jabatanData = {},
    isLoading,
    isFetching,
    isError,
    refetch,
  } = useQuery({
    queryKey: [
      'jabatan-list',
      page,
      perPage,
      debouncedSearch,
      selectedUnitFilter,
      selectedSatuanKerjaFilter,
      selectedLevelFilter,
      selectedStatusFilter,
      denganSampahFilter,
    ],
    queryFn: () =>
      jabatanService.getDaftar({
        page,
        per_page: perPage,
        search: debouncedSearch,
        unit_sekolah_id: selectedUnitFilter,
        satuan_kerja: selectedSatuanKerjaFilter,
        level_jabatan: selectedLevelFilter,
        status: selectedStatusFilter,
        dengan_sampah: denganSampahFilter,
        order_by: 'urutan',
        order_dir: 'asc',
      }),
  })

  const daftarJabatan = jabatanData?.data || []
  const meta = jabatanData?.meta || {}
  const statistik = jabatanData?.statistik || {}

  // Dedicated query for KPI Cards drill-down modal to ensure full dataset
  const { data: allJabatanResponse = {} } = useQuery({
    queryKey: ['all-jabatan-for-kpi'],
    queryFn: () => jabatanService.getDaftar({ per_page: 200, dengan_sampah: 'ya' }),
  })
  const allJabatanData = allJabatanResponse?.data || daftarJabatan

  const totalCount = statistik.total_jabatan ?? daftarJabatan.length ?? 0
  const activeCount = statistik.aktif ?? 0
  const sitemapCount = statistik.tampil_struktur ?? 0
  const loginCount = statistik.boleh_login ?? 0

  // ── KPI Modal Drill-down Data ──────────────────────────────────────────
  const filteredKpiItems = useMemo(() => {
    if (!activeKpiModal) return []
    let base = allJabatanData.length ? allJabatanData : daftarJabatan
    if (activeKpiModal === 'aktif') {
      base = base.filter((j) => (j.status === 'Aktif' || j.status === true || j.is_active) && !j.terhapus)
    } else if (activeKpiModal === 'struktur') {
      base = base.filter((j) => j.tampil_struktur && !j.terhapus)
    } else if (activeKpiModal === 'login') {
      base = base.filter((j) => j.boleh_login && !j.terhapus)
    }
    if (kpiModalSearch.trim()) {
      const q = kpiModalSearch.toLowerCase()
      base = base.filter(
        (j) =>
          (j.nama_jabatan || j.name || '').toLowerCase().includes(q) ||
          (j.kode_jabatan || '').toLowerCase().includes(q) ||
          (j.satuan_kerja || '').toLowerCase().includes(q)
      )
    }
    return base
  }, [activeKpiModal, allJabatanData, daftarJabatan, kpiModalSearch])

  // ── Chart Data Calculations ────────────────────────────────────────────
  const levelChartData = useMemo(() => {
    const counts = { 'L1 (Pengurus)': 0, 'L2 (Direksi)': 0, 'L3 (Manager)': 0, 'L4 (Kepsek/Kasi)': 0, 'L5 (Staf/Guru)': 0 }
    daftarJabatan.forEach((item) => {
      const lvl = Number(item.level_jabatan)
      if (lvl === 1) counts['L1 (Pengurus)'] += 1
      else if (lvl === 2) counts['L2 (Direksi)'] += 1
      else if (lvl === 3) counts['L3 (Manager)'] += 1
      else if (lvl === 4) counts['L4 (Kepsek/Kasi)'] += 1
      else counts['L5 (Staf/Guru)'] += 1
    })
    return Object.keys(counts).map((k) => ({ name: k, jumlah: counts[k] })).filter((d) => d.jumlah > 0)
  }, [daftarJabatan])

  const satuanKerjaChartData = useMemo(() => {
    const counts = {}
    daftarJabatan.forEach((item) => {
      const sk = item.satuan_kerja || 'Unit Pendidikan'
      counts[sk] = (counts[sk] || 0) + 1
    })
    const COLORS = ['#0E5C44', '#0284C7', '#F59E0B', '#7C3AED', '#EC4899', '#06B6D4', '#10B981']
    return Object.keys(counts).map((k, i) => ({
      name: k,
      value: counts[k],
      color: COLORS[i % COLORS.length],
    }))
  }, [daftarJabatan])

  // ── Print & Export Handlers ────────────────────────────────────────────
  const handlePrintClean = () => {
    const orgName = (sitePengaturan?.school_name || sitePengaturan?.application_name || '').trim()
    printCleanTable({
      title: 'REKAPITULASI MASTER DATA JABATAN & POSISI PEGAWAI',
      subtitle: `${orgName ? orgName + ' · ' : ''}Total Terdaftar: ${totalCount} Jabatan`,
      headers: ['NO', 'KODE JABATAN', 'NAMA JABATAN', 'SATUAN KERJA', 'LEVEL', 'STRUKTUR', 'LOGIN', 'STATUS'],
      rows: daftarJabatan.map((item, index) => [
        index + 1,
        item.kode_jabatan || '-',
        item.nama_jabatan || item.name || '-',
        item.satuan_kerja || '-',
        `Level ${item.level_jabatan || '-'}`,
        item.tampil_struktur ? 'Ya' : 'Tidak',
        item.boleh_login ? 'Ya' : 'Tidak',
        item.terhapus ? 'Terhapus' : item.status === 'Aktif' || item.status === true ? 'Aktif' : 'Nonaktif',
      ]),
      foundationName: orgName,
      systemLogo: sitePengaturan?.logo_url,
    })
  }

  const handleDownloadPdfTable = () => {
    const orgName = (sitePengaturan?.school_name || sitePengaturan?.application_name || '').trim()
    downloadPdfTable({
      title: 'REKAPITULASI MASTER DATA JABATAN & POSISI PEGAWAI',
      filename: `rekap-master-jabatan-${new Date().toISOString().slice(0, 10)}.pdf`,
      subtitle: `${orgName ? orgName + ' · ' : ''}Total Terdaftar: ${totalCount} Jabatan`,
      headers: ['NO', 'KODE JABATAN', 'NAMA JABATAN', 'SATUAN KERJA', 'LEVEL', 'STRUKTUR', 'LOGIN', 'STATUS'],
      rows: daftarJabatan.map((item, index) => [
        index + 1,
        item.kode_jabatan || '-',
        item.nama_jabatan || item.name || '-',
        item.satuan_kerja || '-',
        `Level ${item.level_jabatan || '-'}`,
        item.tampil_struktur ? 'Ya' : 'Tidak',
        item.boleh_login ? 'Ya' : 'Tidak',
        item.terhapus ? 'Terhapus' : item.status === 'Aktif' || item.status === true ? 'Aktif' : 'Nonaktif',
      ]),
      foundationName: orgName,
      systemLogo: sitePengaturan?.logo_url,
    })
  }

  const handleProcessExport = async () => {
    setIsExporting(true)
    setShowExportModal(false)
    try {
      await downloadFileFromApi(
        '/jabatan/export',
        {
          search: debouncedSearch,
          unit_sekolah_id: selectedUnitFilter,
          satuan_kerja: selectedSatuanKerjaFilter,
          level_jabatan: selectedLevelFilter,
          status: selectedStatusFilter,
        },
        exportFormat,
        'data_master_jabatan'
      )
      pushToast('Export Berhasil', 'Berkas data jabatan sedang diunduh.', 'success')
    } catch {
      pushToast('Gagal Export', 'Terjadi kendala saat menyiapkan berkas ekspor.', 'error')
    } finally {
      setIsExporting(false)
    }
  }

  const tableIsLoading = isLoading || isFetching
  const filtersAreClear =
    !search &&
    !selectedUnitFilter &&
    !selectedSatuanKerjaFilter &&
    !selectedLevelFilter &&
    !selectedStatusFilter &&
    !denganSampahFilter

  const paginationInfo = {
    total: meta.total ?? daftarJabatan.length,
    from: meta.from ?? (daftarJabatan.length ? (page - 1) * perPage + 1 : 0),
    to: meta.to ?? ((page - 1) * perPage + daftarJabatan.length),
    last_page: meta.last_page ?? 1,
    current_page: meta.current_page ?? page,
    per_page: meta.per_page ?? perPage,
  }

  // ── Mutations (Zero SweetAlert2) ─────────────────────────────────────────
  const simpanMutation = useMutation({
    mutationFn: (payload) => jabatanService.tambah(payload),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['jabatan-list'] })
      queryClient.invalidateQueries({ queryKey: ['jabatan-options'] })
      queryClient.invalidateQueries({ queryKey: ['all-jabatan-for-kpi'] })
      setIsFormModalOpen(false)
      setShowSaveConfirmModal(false)
      setPendingSaveData(null)
      pushToast('Berhasil Disimpan', res?.message || 'Data jabatan baru berhasil ditambahkan.', 'success')
    },
    onError: (err) => {
      setShowSaveConfirmModal(false)
      pushToast('Gagal Menyimpan', err.response?.data?.message || 'Gagal menyimpan data jabatan.', 'error')
    },
  })

  const ubahMutation = useMutation({
    mutationFn: ({ id, payload }) => jabatanService.ubah({ id, payload }),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['jabatan-list'] })
      queryClient.invalidateQueries({ queryKey: ['jabatan-options'] })
      queryClient.invalidateQueries({ queryKey: ['all-jabatan-for-kpi'] })
      setIsFormModalOpen(false)
      setSelectedJabatanForEdit(null)
      setShowSaveConfirmModal(false)
      setPendingSaveData(null)
      pushToast('Berhasil Diperbarui', res?.message || 'Perubahan data jabatan berhasil disimpan.', 'success')
    },
    onError: (err) => {
      setShowSaveConfirmModal(false)
      pushToast('Gagal Memperbarui', err.response?.data?.message || 'Gagal memperbarui data jabatan.', 'error')
    },
  })

  const hapusMutation = useMutation({
    mutationFn: (id) => jabatanService.hapus(id),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['jabatan-list'] })
      queryClient.invalidateQueries({ queryKey: ['all-jabatan-for-kpi'] })
      setDeleteTarget(null)
      pushToast('Berhasil Dihapus', res?.message || 'Data jabatan berhasil dihapus.', 'success')
    },
    onError: (err) => {
      setDeleteTarget(null)
      pushToast('Gagal Menghapus', err.response?.data?.message || 'Terjadi kesalahan saat menghapus.', 'error')
    },
  })

  const pulihkanMutation = useMutation({
    mutationFn: (id) => jabatanService.pulihkan(id),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['jabatan-list'] })
      queryClient.invalidateQueries({ queryKey: ['all-jabatan-for-kpi'] })
      setRestoreTarget(null)
      pushToast('Berhasil Dipulihkan', res?.message || 'Data jabatan berhasil dipulihkan.', 'success')
    },
    onError: (err) => {
      setRestoreTarget(null)
      pushToast('Gagal Memulihkan', err.response?.data?.message || 'Terjadi kesalahan saat memulihkan.', 'error')
    },
  })

  const importMutation = useMutation({
    mutationFn: (rows) => jabatanService.prosesImport(rows),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['jabatan-list'] })
      queryClient.invalidateQueries({ queryKey: ['jabatan-options'] })
      queryClient.invalidateQueries({ queryKey: ['all-jabatan-for-kpi'] })
      setIsImportModalOpen(false)
      pushToast('Import Data Berhasil', res?.message || 'Data jabatan berhasil diimpor.', 'success')
    },
    onError: (err) => {
      pushToast('Gagal Mengimpor', err.response?.data?.message || 'Format data impor bermasalah.', 'error')
    },
  })

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleOpenCreate = () => {
    if (!canManageGlobalPositions) return
    setSelectedJabatanForEdit(null)
    setIsFormModalOpen(true)
  }

  const handleOpenEdit = (item) => {
    if (!canEditPosition || isRowRestrictedForUser(item)) {
      pushToast('Akses Dibatasi', 'Role Kepala Sekolah tidak diizinkan untuk mengubah data jabatan Pengurus Yayasan.', 'error')
      return
    }
    setSelectedJabatanForEdit(item)
    setIsFormModalOpen(true)
  }

  const handleOpenDetail = (item) => {
    setSelectedJabatanForDetail(item)
    setIsDetailModalOpen(true)
  }

  const handleDelete = (item) => {
    if (!canManageGlobalPositions || isRowRestrictedForUser(item)) {
      pushToast('Akses Dibatasi', 'Role Kepala Sekolah tidak diizinkan untuk menghapus data jabatan Pengurus Yayasan.', 'error')
      return
    }
    setDeleteTarget(item)
  }

  const handleRestore = (item) => {
    if (!canEditPosition || isRowRestrictedForUser(item)) return
    setRestoreTarget(item)
  }

  const handleFormSubmit = (data) => {
    setPendingSaveData(data)
    setShowSaveConfirmModal(true)
  }

  const handleConfirmSaveForm = () => {
    if (!pendingSaveData) return
    if (selectedJabatanForEdit) {
      ubahMutation.mutate({ id: selectedJabatanForEdit.id, payload: pendingSaveData })
    } else {
      simpanMutation.mutate(pendingSaveData)
    }
  }

  const handleResetFilters = () => {
    setSearch('')
    setSelectedUnitFilter('')
    setSelectedSatuanKerjaFilter('')
    setSelectedLevelFilter('')
    setSelectedStatusFilter('')
    setDenganSampahFilter('')
    setPage(1)
  }

  // Column Specification following TAILGRIDS_TABLE_COMPONENT Gold Standard Benchmark
  const columns = [
    {
      key: 'nama_jabatan',
      label: 'Identitas Jabatan',
      render: (row) => {
        const isTrashed = row.terhapus
        return (
          <div className="flex min-w-0 items-center gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-emerald-100 bg-emerald-50 text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/50 dark:text-emerald-300 shadow-2xs">
              <FaSitemap className="h-5 w-5" />
            </span>
            <span className="min-w-0 flex-1">
              <HoverCard>
                <HoverCardTrigger
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    handleOpenDetail(row)
                  }}
                  className="inline-block max-w-full truncate text-[13px] font-extrabold leading-5 text-slate-900 dark:text-white border-b border-dashed border-slate-400/60 hover:border-[#0E5C44] transition-colors cursor-pointer"
                  title={row.nama_jabatan || row.name}
                >
                  {row.nama_jabatan || row.name}
                </HoverCardTrigger>
                <HoverCardContent className="w-64 p-3.5 border border-slate-200 bg-white dark:border-slate-800 dark:bg-[#1B2433] shadow-xl rounded-xl">
                  <div className="flex items-center gap-2.5 mb-2">
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200">
                      <FaSitemap className="h-4 w-4" />
                    </span>
                    <div className="min-w-0">
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">{row.nama_jabatan || row.name}</h4>
                      <p className="text-[10px] text-slate-500 font-mono">{row.kode_jabatan || row.code}</p>
                    </div>
                  </div>
                  <div className="space-y-1 text-[11px] text-slate-600 dark:text-slate-300">
                    <p><strong className="text-slate-400 font-normal">Level:</strong> Level {row.level_jabatan} ({row.level_label || '-'})</p>
                    <p><strong className="text-slate-400 font-normal">Satuan Kerja:</strong> {row.satuan_kerja || '-'}</p>
                    <p><strong className="text-slate-400 font-normal">Atasan:</strong> {row.atasan_langsung?.nama_jabatan || 'Pimpinan Tertinggi'}</p>
                    <p><strong className="text-slate-400 font-normal">Jumlah Pegawai:</strong> {row.jumlah_pegawai ?? 0} pegawai</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleOpenDetail(row)}
                    className="w-full py-1.5 bg-[#0E5C44] text-white text-[10px] font-bold uppercase tracking-wider rounded-lg transition-colors hover:bg-[#1E8E5A] mt-2.5 cursor-pointer"
                  >
                    Lihat Rincian Data
                  </button>
                </HoverCardContent>
              </HoverCard>
              <span className="flex min-w-0 items-center gap-1.5">
                <small className="truncate font-mono text-[10px] text-slate-400">{row.kode_jabatan || row.code}</small>
                {isTrashed && (
                  <span className="rounded bg-rose-100 px-1 py-0.2 text-[9px] font-bold text-rose-700">Terhapus</span>
                )}
                {isRowRestrictedForUser(row) && (
                  <span
                    className="rounded bg-amber-100/90 border border-amber-300/80 px-1.5 py-0.5 text-[9px] font-bold text-amber-800 dark:bg-amber-950/60 dark:border-amber-900 dark:text-amber-300"
                    title="Perubahan & Penghapusan dibatasi untuk role Kepala Sekolah"
                  >
                    Dibatasi (Yayasan)
                  </span>
                )}
              </span>
              <small className="mt-0.5 block truncate text-[10px] font-semibold text-emerald-700 dark:text-emerald-400">
                {row.jumlah_pegawai ?? 0} pegawai
              </small>
            </span>
          </div>
        )
      },
    },
    {
      key: 'level_jabatan',
      label: 'Unit & Level',
      className: 'hidden md:table-cell',
      render: (row) => (
        <div className="space-y-1">
          <span className="inline-block px-2.5 py-0.5 text-xs font-semibold rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
            Level {row.level_jabatan}: {row.level_label}
          </span>
          <p className="text-xs font-bold text-emerald-800 dark:text-emerald-400">{row.satuan_kerja || 'Belum ditentukan'}</p>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {row.unit_sekolah ? (
              <span className="font-medium text-slate-700 dark:text-slate-300">
                {row.unit_sekolah.nama} ({row.unit_sekolah.kode})
              </span>
            ) : (
              <span className="italic text-slate-400">{row.scope_akses_label || 'Cakupan belum ditentukan'}</span>
            )}
          </p>
        </div>
      ),
    },
    {
      key: 'atasan_langsung',
      label: 'Atasan Langsung',
      className: 'hidden lg:table-cell',
      render: (row) =>
        row.atasan_langsung ? (
          <div className="font-medium text-slate-800 dark:text-slate-200 text-xs">
            {row.atasan_langsung.nama_jabatan}
            <span className="block text-[10px] text-slate-400 font-mono">({row.atasan_langsung.kode_jabatan})</span>
          </div>
        ) : (
          <span className="text-slate-400 italic text-xs">Pimpinan Tertinggi</span>
        ),
    },
    {
      key: 'akses',
      label: 'Akses',
      className: 'hidden xl:table-cell text-center',
      render: (row) => (
        <div className="mx-auto flex max-w-28 flex-col items-stretch gap-1">
          <span
            className={`inline-flex min-h-6 items-center gap-1.5 rounded-lg border px-2 text-[10px] font-semibold ${
              row.tampil_struktur
                ? 'border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
                : 'border-slate-200 bg-slate-100 text-slate-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400'
            }`}
            title="Visibilitas Bagan Struktur Organisasi"
          >
            <FaSitemap className="h-3 w-3 shrink-0" />
            <span className="truncate">{row.tampil_struktur ? 'Struktur' : 'Sembunyi'}</span>
          </span>
          <span
            className={`inline-flex min-h-6 items-center gap-1.5 rounded-lg border px-2 text-[10px] font-semibold ${
              row.boleh_login
                ? 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300'
                : 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-900/30 dark:text-amber-300'
            }`}
            title="Hak Akses Login Akun Sistem"
          >
            {row.boleh_login ? <FaLockOpen className="h-3 w-3 shrink-0" /> : <FaLock className="h-3 w-3 shrink-0" />}
            <span className="truncate">{row.boleh_login ? 'Login' : 'Non-Login'}</span>
          </span>
        </div>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      className: 'hidden sm:table-cell text-center',
      render: (row) =>
        row.terhapus ? (
          <span className="inline-flex items-center rounded-full bg-rose-100 px-2 py-0.5 text-[10px] font-bold text-rose-700 dark:bg-rose-950/60 dark:text-rose-400">
            Terhapus
          </span>
        ) : (
          <MasterStatusBadge active={row.status === 'Aktif' || row.is_active} inactiveLabel="Nonaktif" />
        ),
    },
  ]

  // Extra action for restoring soft deleted rows
  const extraActions = ({ row }) => {
    if (row.terhapus) {
      return (
        <button
          type="button"
          title="Pulihkan Data Jabatan"
          onClick={(e) => {
            e.stopPropagation()
            handleRestore(row)
          }}
          className="flex h-7 w-7 items-center justify-center rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-300 transition-colors cursor-pointer"
        >
          <FaRedo className="h-3.5 w-3.5" />
        </button>
      )
    }
    return null
  }

  // Mobile card view fallback
  const renderMobileCard = ({ row, onView, onEdit, onDelete }) => {
    const isRestricted = isRowRestrictedForUser(row)
    return (
      <div className={`rounded-[18px] border bg-white p-4 shadow-2xs dark:bg-[#1B2433] ${row.terhapus ? 'border-rose-200 dark:border-rose-900/50 bg-rose-50/20' : 'border-slate-200/80 dark:border-slate-700'}`}>
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-emerald-100 bg-emerald-50 text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/50 dark:text-emerald-300">
            <FaSitemap className="h-5 w-5" />
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-[13px] font-extrabold text-slate-900 dark:text-white">{row.nama_jabatan || row.name}</p>
                <p className="font-mono text-[10px] text-slate-400">{row.kode_jabatan || row.code}</p>
              </div>
              {row.terhapus ? (
                <span className="inline-flex items-center rounded-full bg-rose-100 px-2 py-0.5 text-[10px] font-bold text-rose-700">Terhapus</span>
              ) : isRestricted ? (
                <span className="inline-flex items-center rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-800 dark:bg-amber-950/60 dark:text-amber-300">Dibatasi</span>
              ) : (
                <MasterStatusBadge active={row.status === 'Aktif' || row.is_active} inactiveLabel="Nonaktif" />
              )}
            </div>
            <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-slate-500 dark:text-slate-400">
              <span>Level {row.level_jabatan}</span>
              <span>{row.satuan_kerja || 'Satuan Kerja -'}</span>
              <span className="font-bold text-emerald-700">{row.jumlah_pegawai ?? 0} pegawai</span>
            </div>
          </div>
        </div>
        <div className="mt-3 flex items-center justify-end gap-2 border-t border-slate-100 pt-2.5 dark:border-slate-800">
          {row.terhapus && (
            <button
              type="button"
              onClick={() => handleRestore(row)}
              className="flex items-center gap-1 text-xs font-bold text-emerald-600 hover:text-emerald-700 cursor-pointer"
            >
              <FaRedo className="h-3.5 w-3.5" />
              <span>Pulihkan</span>
            </button>
          )}
          <ActionDropdown
            onView={onView}
            onEdit={canEditPosition && !row.terhapus && !isRestricted ? onEdit : undefined}
            onDelete={canManageGlobalPositions && !row.terhapus && !isRestricted ? onDelete : undefined}
          />
        </div>
      </div>
    )
  }

  return (
    <PageContainer maxW="7xl">
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="space-y-6 pb-12"
      >
        {/* AppBreadcrumb */}
        <motion.div variants={itemVariants}>
          <AppBreadcrumb items={[{ label: 'Master Data', to: '/dashboard/master-jabatan' }, { label: 'Master Jabatan' }]} />
        </motion.div>

        {/* Header Halaman Modern Hero Card */}
        <motion.div variants={itemVariants} className="relative overflow-hidden rounded-[22px] border-2 border-emerald-500/30 bg-gradient-to-r from-emerald-500/15 via-teal-500/10 to-emerald-600/15 p-5 sm:p-6 shadow-md shadow-emerald-500/10 dark:border-emerald-600/40 dark:bg-gradient-to-r dark:from-emerald-950/70 dark:via-teal-950/50 dark:to-slate-900 print:hidden">
          <div className="pointer-events-none absolute -top-20 -right-20 h-56 w-56 rounded-full bg-gradient-to-br from-emerald-500/40 via-teal-400/30 to-emerald-600/20 blur-3xl dark:from-emerald-500/50 dark:via-teal-400/40" />
          <div className="pointer-events-none absolute -bottom-20 -left-20 h-56 w-56 rounded-full bg-gradient-to-tr from-emerald-600/30 via-teal-500/20 to-transparent blur-3xl dark:from-emerald-600/40 dark:via-teal-500/30" />

          <div className="relative z-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-4 min-w-0">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700 text-white shadow-xl shadow-emerald-600/40 border border-emerald-300/40 dark:from-emerald-400 dark:via-emerald-500 dark:to-teal-600">
                <FaBriefcase className="h-6 w-6" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                    Master Posisi & Jabatan SDM
                  </h1>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-emerald-600 to-teal-600 px-3.5 py-1 text-xs font-extrabold text-white shadow-sm shadow-emerald-600/25 border border-emerald-300/40">
                    <ShieldCheck className="h-3.5 w-3.5" />
                    Manajemen Jabatan
                  </span>
                </div>
                <p className="mt-1 text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300 max-w-2xl leading-relaxed">
                  Struktur jabatan struktural & fungsional pegawai, hierarki kedudukan, hak akses sistem, dan distribusi SDM di seluruh unit.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
              <div className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-500/40 bg-gradient-to-r from-emerald-100 via-emerald-50 to-teal-100 px-3.5 py-1.5 text-xs font-black text-emerald-900 dark:border-emerald-700 dark:bg-gradient-to-r dark:from-emerald-950 dark:to-teal-950 dark:text-emerald-200 shadow-2xs">
                <Sparkles className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>Struktur Jabatan</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Modern KPI Summary Cards */}
        <motion.div variants={itemVariants}>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <ModernKpiCard
              icon={FaBriefcase}
              label="Total Jabatan"
              value={isLoading ? '...' : Number(totalCount).toLocaleString('id-ID')}
              tag={`${totalCount} Posisi`}
              subtext="Terdaftar di sistem"
              tone="emerald"
              onClick={() => { setKpiModalSearch(''); setActiveKpiModal('total') }}
            />
            <ModernKpiCard
              icon={FaCheckCircle}
              label="Jabatan Aktif"
              value={isLoading ? '...' : Number(activeCount).toLocaleString('id-ID')}
              tag={`${activeCount} Aktif`}
              subtext="Beroperasi saat ini"
              tone="teal"
              onClick={() => { setKpiModalSearch(''); setActiveKpiModal('aktif') }}
            />
            <ModernKpiCard
              icon={FaSitemap}
              label="Bagan Struktur"
              value={isLoading ? '...' : Number(sitemapCount).toLocaleString('id-ID')}
              tag={`${sitemapCount} Tampil`}
              subtext="Tampil di organisasi"
              tone="amber"
              onClick={() => { setKpiModalSearch(''); setActiveKpiModal('struktur') }}
            />
            <ModernKpiCard
              icon={FaLockOpen}
              label="Akses Login"
              value={isLoading ? '...' : Number(loginCount).toLocaleString('id-ID')}
              tag={`${loginCount} Login`}
              subtext="Dapat memakai sistem"
              tone="sky"
              onClick={() => { setKpiModalSearch(''); setActiveKpiModal('login') }}
            />
          </div>
        </motion.div>

        {/* Visual Analytics Charts Section */}
        <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-stretch">
          {/* Grafik 1: Distribusi Level Jabatan */}
          <article className="overflow-hidden rounded-[18px] border border-slate-200/80 bg-white p-5 sm:p-6 shadow-xs dark:border-slate-800 dark:bg-[#1B2433] flex flex-col justify-between h-full">
            <div>
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <BarChart2 className="size-5 text-emerald-600 dark:text-emerald-400" />
                  <div>
                    <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                      Distribusi Level Jabatan
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Hirarki dan tingkatan posisi dalam struktur organisasi
                    </p>
                  </div>
                </div>
                <AppBadge variant="success" size="sm">
                  {levelChartData.length} Level
                </AppBadge>
              </div>
              <div className="h-64 w-full pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={levelChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" opacity={0.6} />
                    <XAxis dataKey="name" tick={{ fontSize: 10, fontWeight: 700 }} stroke="#94A3B8" />
                    <YAxis tick={{ fontSize: 11, fontWeight: 700 }} stroke="#94A3B8" />
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload
                          return (
                            <div className="rounded-xl border border-slate-800 bg-slate-900/95 p-3 text-white shadow-xl backdrop-blur-sm">
                              <p className="text-xs font-bold text-emerald-400 mb-0.5">{data.name}</p>
                              <p className="text-xs font-extrabold">Total Jabatan: {data.jumlah}</p>
                            </div>
                          )
                        }
                        return null
                      }}
                    />
                    <Bar dataKey="jumlah" name="Jumlah Jabatan" fill="#10B981" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px] font-semibold text-slate-500">
              <span>Struktur Organisasi Terpadu</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-bold">Resmi</span>
            </div>
          </article>

          {/* Grafik 2: Komposisi Satuan Kerja */}
          <article className="overflow-hidden rounded-[18px] border border-slate-200/80 bg-white p-5 sm:p-6 shadow-xs dark:border-slate-800 dark:bg-[#1B2433] flex flex-col justify-between h-full">
            <div>
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <PieIcon className="size-5 text-[#0284C7] dark:text-sky-400" />
                  <div>
                    <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                      Komposisi Satuan Kerja
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Penyebaran posisi jabatan per divisi/satuan kerja
                    </p>
                  </div>
                </div>
                <AppBadge variant="info" size="sm">
                  100% Terstruktur
                </AppBadge>
              </div>
              <div className="h-64 w-full flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={satuanKerjaChartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={85}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {satuanKerjaChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload
                          return (
                            <div className="rounded-xl border border-slate-800 bg-slate-900/95 p-3 text-white shadow-xl backdrop-blur-sm">
                              <p className="text-xs font-bold text-sky-400 mb-0.5">{data.name}</p>
                              <p className="text-xs font-extrabold">Total Jabatan: {data.value}</p>
                            </div>
                          )
                        }
                        return null
                      }}
                    />
                    <Legend
                      formatter={(value, entry) => (
                        <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                          {entry.payload.name} ({entry.payload.value})
                        </span>
                      )}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px] font-semibold text-slate-500">
              <span>Alokasi Satuan Kerja</span>
              <span className="text-[#0284C7] dark:text-sky-400 font-bold">Terdaftar</span>
            </div>
          </article>
        </motion.div>

        {/* ── Canonical Emerald Datatable Container ─────────────────────────── */}
        <motion.div variants={itemVariants}>
          <AppDataTable
            title="Data Jabatan"
            description="Daftar jabatan sesuai pencarian, cakupan unit, dan filter yang dipilih."
            icon={FaSitemap}
            iconClassName="bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700 border border-emerald-300/40 text-white shadow-emerald-600/30"
            countLabel={`${Number(paginationInfo?.total || daftarJabatan.length).toLocaleString('id-ID')} Jabatan`}
            actions={
              <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0 self-start sm:self-auto flex-wrap">
                {/* Tombol Cetak (Vivid Indigo Squircle + Floating Tooltip) */}
                <div className="group relative inline-flex">
                  <button
                    type="button"
                    title="Cetak & Download Data Jabatan"
                    aria-label="Cetak & Download Data Jabatan"
                    className="flex size-10 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 via-indigo-600 to-violet-700 text-white border border-indigo-300/40 hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer"
                    onClick={() => setPrintOptionModalOpen(true)}
                  >
                    <Printer className="size-5 text-white" strokeWidth={2.2} />
                  </button>
                  <div className="pointer-events-none absolute top-full left-1/2 mt-2 -translate-x-1/2 opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 transition-all duration-200 ease-out z-50 whitespace-nowrap rounded-lg bg-slate-900 px-2.5 py-1 text-[11px] font-bold text-white shadow-xl dark:bg-slate-100 dark:text-slate-900">
                    <div className="absolute bottom-full left-1/2 -mb-1 -translate-x-1/2 border-4 border-transparent border-b-slate-900 dark:border-b-slate-100" />
                    Cetak & Export
                  </div>
                </div>

                {/* Import Button (Vivid Sky Blue Squircle + Floating Tooltip) */}
                {canEditPosition && (
                  <div className="group relative inline-flex">
                    <button
                      type="button"
                      title="Import Data Jabatan"
                      aria-label="Import Data Jabatan"
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
                )}

                {/* Export Button (Vivid Amber Squircle + Floating Tooltip) */}
                {canEditPosition && (
                  <div className="group relative inline-flex">
                    <button
                      type="button"
                      title="Export Data Jabatan"
                      aria-label="Export Data Jabatan"
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
                )}

                {/* Tambah Jabatan Button (Vivid Emerald Squircle + Floating Tooltip) */}
                {canEditPosition && (
                  <div className="group relative inline-flex">
                    <button
                      type="button"
                      title="Tambah Jabatan Baru"
                      aria-label="Tambah Jabatan Baru"
                      className="flex size-10 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700 text-white border border-emerald-300/40 hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer"
                      onClick={handleOpenCreate}
                    >
                      <Plus className="size-5 text-white" strokeWidth={2.5} />
                    </button>
                    <div className="pointer-events-none absolute top-full left-1/2 mt-2 -translate-x-1/2 opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 transition-all duration-200 ease-out z-50 whitespace-nowrap rounded-lg bg-slate-900 px-2.5 py-1 text-[11px] font-bold text-white shadow-xl dark:bg-slate-100 dark:text-slate-900">
                      <div className="absolute bottom-full left-1/2 -mb-1 -translate-x-1/2 border-4 border-transparent border-b-slate-900 dark:border-b-slate-100" />
                      Tambah Jabatan
                    </div>
                  </div>
                )}
              </div>
            }
            columns={columns}
              data={daftarJabatan}
              keyField="id"
              isLoading={tableIsLoading}
              isError={isError}
              errorTitle="Data jabatan gagal dimuat"
              errorMessage="Periksa koneksi atau coba muat ulang data."
              onRetry={refetch}
              serverControlled
              search={search}
              onSearchChange={(val) => { setSearch(val); setPage(1) }}
              searchPlaceholder="Cari nama atau kode jabatan..."
              filters={
                <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-2 sm:gap-2.5 w-full">
                  {/* Satuan Kerja filter */}
                  <div className="relative w-full sm:w-auto">
                    <select
                      value={selectedSatuanKerjaFilter}
                      onChange={(e) => { setSelectedSatuanKerjaFilter(e.target.value); setPage(1) }}
                      aria-label="Filter satuan kerja"
                      className="w-full sm:w-auto min-w-[140px] h-9 cursor-pointer appearance-none rounded-xl border border-slate-200 bg-white pl-3 pr-8 text-xs font-semibold text-slate-700 shadow-2xs transition-all hover:border-slate-300 focus:border-[#0E5C44] focus:outline-none focus:ring-2 focus:ring-[#0E5C44]/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-slate-600"
                    >
                      <option value="">Semua Satuan Kerja</option>
                      {(options.satuan_kerja || []).map((item) => {
                        const val = typeof item === 'object' ? (item.value ?? item.id ?? item.nama) : item
                        const lbl = typeof item === 'object' ? (item.label ?? item.nama ?? item.value) : item
                        return <option key={val} value={val}>{lbl}</option>
                      })}
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                  </div>

                  {/* Level Jabatan filter */}
                  <div className="relative w-full sm:w-auto">
                    <select
                      value={selectedLevelFilter}
                      onChange={(e) => { setSelectedLevelFilter(e.target.value); setPage(1) }}
                      aria-label="Filter level jabatan"
                      className="w-full sm:w-auto min-w-[140px] h-9 cursor-pointer appearance-none rounded-xl border border-slate-200 bg-white pl-3 pr-8 text-xs font-semibold text-slate-700 shadow-2xs transition-all hover:border-slate-300 focus:border-[#0E5C44] focus:outline-none focus:ring-2 focus:ring-[#0E5C44]/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-slate-600"
                    >
                      <option value="">Semua Level</option>
                      {(options.level_jabatan || []).map((level) => {
                        const val = typeof level === 'object' ? (level.value ?? level.id ?? level.level) : level
                        const lbl = typeof level === 'object' ? (level.label ?? level.nama ?? `Level ${level}`) : `Level ${level}`
                        return <option key={val} value={val}>{lbl}</option>
                      })}
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                  </div>

                  {/* Unit Sekolah filter */}
                  <div className="relative w-full sm:w-auto">
                    <select
                      value={selectedUnitFilter}
                      onChange={(e) => { setSelectedUnitFilter(e.target.value); setPage(1) }}
                      aria-label="Filter unit sekolah"
                      className="w-full sm:w-auto min-w-[140px] h-9 cursor-pointer appearance-none rounded-xl border border-slate-200 bg-white pl-3 pr-8 text-xs font-semibold text-slate-700 shadow-2xs transition-all hover:border-slate-300 focus:border-[#0E5C44] focus:outline-none focus:ring-2 focus:ring-[#0E5C44]/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-slate-600"
                    >
                      <option value="">Semua Unit Sekolah</option>
                      {(options.unit_sekolah || []).map((unit) => {
                        const val = typeof unit === 'object' ? (unit.id ?? unit.value) : unit
                        const lbl = typeof unit === 'object' ? (unit.nama ?? unit.name ?? unit.label) : unit
                        return <option key={val} value={val}>{lbl}</option>
                      })}
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                  </div>

                  {/* Status filter */}
                  <div className="relative w-full sm:w-auto">
                    <select
                      value={selectedStatusFilter}
                      onChange={(e) => { setSelectedStatusFilter(e.target.value); setPage(1) }}
                      aria-label="Filter status jabatan"
                      className="w-full sm:w-auto min-w-[140px] h-9 cursor-pointer appearance-none rounded-xl border border-slate-200 bg-white pl-3 pr-8 text-xs font-semibold text-slate-700 shadow-2xs transition-all hover:border-slate-300 focus:border-[#0E5C44] focus:outline-none focus:ring-2 focus:ring-[#0E5C44]/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-slate-600"
                    >
                      <option value="">Semua Status</option>
                      <option value="Aktif">Aktif</option>
                      <option value="Nonaktif">Nonaktif</option>
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                  </div>

                  {/* Cakupan Terhapus filter */}
                  <div className="relative w-full sm:w-auto">
                    <select
                      value={denganSampahFilter}
                      onChange={(e) => { setDenganSampahFilter(e.target.value); setPage(1) }}
                      aria-label="Filter data terhapus"
                      className="w-full sm:w-auto min-w-[140px] h-9 cursor-pointer appearance-none rounded-xl border border-slate-200 bg-white pl-3 pr-8 text-xs font-semibold text-slate-700 shadow-2xs transition-all hover:border-slate-300 focus:border-[#0E5C44] focus:outline-none focus:ring-2 focus:ring-[#0E5C44]/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-slate-600"
                    >
                      <option value="">Data Aktif</option>
                      <option value="ya">Termasuk Terhapus</option>
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                  </div>

                  {/* Per Page filter */}
                  <div className="relative w-full sm:w-auto">
                    <select
                      value={perPage}
                      onChange={(e) => { setPerPage(Number(e.target.value)); setPage(1) }}
                      aria-label="Tampilkan per halaman"
                      className="w-full sm:w-auto min-w-[140px] h-9 cursor-pointer appearance-none rounded-xl border border-slate-200 bg-white pl-3 pr-7 text-xs font-semibold text-slate-700 shadow-2xs transition-all hover:border-slate-300 focus:border-[#0E5C44] focus:outline-none focus:ring-2 focus:ring-[#0E5C44]/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-slate-600"
                    >
                      <option value={5}>5 per halaman</option>
                      <option value={10}>10 per halaman</option>
                      <option value={15}>15 per halaman</option>
                      <option value={25}>25 per halaman</option>
                      <option value={50}>50 per halaman</option>
                      <option value={100}>100 per halaman</option>
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                  </div>

                  {/* Reset button */}
                  {!filtersAreClear && (
                    <Button
                      variant="ghost"
                      appearance="outline"
                      size="xs"
                      onClick={handleResetFilters}
                      className="w-full sm:w-auto sm:ml-auto justify-center h-9 px-3 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 border-rose-200 dark:border-rose-900/50 flex items-center gap-1.5 cursor-pointer"
                    >
                      <RefreshCcw className="size-3.5" />
                      <span>Reset</span>
                    </Button>
                  )}
                </div>
              }
              actionColumnLabel=""
              onView={(row) => handleOpenDetail(row)}
              canEdit={(row) => canEditPosition && !row.terhapus && !isRowRestrictedForUser(row)}
              canDelete={(row) => canManageGlobalPositions && !row.terhapus && !isRowRestrictedForUser(row)}
              onEdit={canEditPosition ? (row) => handleOpenEdit(row) : undefined}
              onDelete={canManageGlobalPositions ? (row) => handleDelete(row) : undefined}
              extraActions={extraActions}
              renderMobileCard={renderMobileCard}
              showPagination
              page={paginationInfo.current_page}
              totalPages={paginationInfo.last_page}
              totalItems={paginationInfo.total}
              itemsPerPage={paginationInfo.per_page}
              onPageChange={(p) => setPage(p)}
              meta={paginationInfo}
              emptyTitle="Jabatan tidak ditemukan"
              emptyDescription="Coba sesuaikan kata kunci pencarian atau filter yang diterapkan."
              hasActiveFilters={!filtersAreClear}
              onResetFilters={handleResetFilters}
            />
        </motion.div>
      </motion.div>

      {/* ── Modals ─────────────────────────────────────────────────────────── */}
      <JabatanFormModal
        isOpen={isFormModalOpen}
        onClose={() => {
          setIsFormModalOpen(false)
          setSelectedJabatanForEdit(null)
        }}
        onSubmit={handleFormSubmit}
        initialData={selectedJabatanForEdit}
        options={options}
        isSubmitting={simpanMutation.isPending || ubahMutation.isPending}
        isKepalaSekolah={isKepalaSekolah || canManageUnitPositions}
        isUnitScopedManager={canManageUnitPositions && !canManageGlobalPositions}
      />

      <JabatanDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false)
          setSelectedJabatanForDetail(null)
        }}
        jabatan={selectedJabatanForDetail}
        onEdit={() => {
          setIsDetailModalOpen(false)
          if (selectedJabatanForDetail) handleOpenEdit(selectedJabatanForDetail)
        }}
      />

      <JabatanImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImport={(rows) => importMutation.mutate(rows)}
        isSubmitting={importMutation.isPending}
      />

      {/* Print Option Modal */}
      <PrintOptionModal
        isOpen={printOptionModalOpen}
        onClose={() => setPrintOptionModalOpen(false)}
        onPrint={handlePrintClean}
        onDownload={handleDownloadPdfTable}
        title="Master Data Jabatan & Posisi Pegawai"
      />

      {/* ══════════════════════════════════════════════════════════════════
          KPI CARDS DRILL-DOWN MODAL — Interactive Analytics Breakdown
      ══════════════════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {activeKpiModal && (
          <div
            role="dialog"
            tabIndex={-1}
            aria-modal="true"
            className="overlay modal fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/70 backdrop-blur-md"
            onMouseDown={(e) => { if (e.target === e.currentTarget) setActiveKpiModal(null) }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 14 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ type: 'spring', stiffness: 400, damping: 28 }}
              className="modal-dialog font-sans my-auto w-full max-w-4xl"
            >
              <div className="modal-content flex max-h-[calc(100dvh-2.5rem)] flex-col overflow-hidden rounded-3xl border border-slate-200/90 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-950">
                <div className="h-1.5 w-full bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-600 shrink-0" />
                <div className="modal-header flex items-center justify-between border-b border-slate-100 bg-white px-6 py-4.5 dark:border-slate-800 dark:bg-slate-950">
                  <div className="flex items-center gap-3">
                    <div className="rounded-2xl bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700 text-white p-2.5 shadow-md shadow-emerald-500/25 border border-emerald-300/40 shrink-0">
                      {activeKpiModal === 'total' && <FaBriefcase className="h-5 w-5" />}
                      {activeKpiModal === 'aktif' && <FaCheckCircle className="h-5 w-5" />}
                      {activeKpiModal === 'struktur' && <FaSitemap className="h-5 w-5" />}
                      {activeKpiModal === 'login' && <FaLockOpen className="h-5 w-5" />}
                    </div>
                    <div>
                      <h3 className="modal-title text-sm sm:text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                        <span>
                          {activeKpiModal === 'total' && 'Analisis Total Jabatan Terdaftar'}
                          {activeKpiModal === 'aktif' && 'Rincian Jabatan Berstatus Aktif'}
                          {activeKpiModal === 'struktur' && 'Rincian Jabatan Tampil di Bagan Struktur Organisasi'}
                          {activeKpiModal === 'login' && 'Rincian Jabatan Berhak Akses Login Sistem'}
                        </span>
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-[#0E5C44] border border-emerald-200/80 dark:bg-emerald-950/60 dark:text-emerald-400 dark:border-emerald-800/60">
                          <Sparkles className="size-3" /> Drill-down
                        </span>
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        Menampilkan {filteredKpiItems.length} data posisi jabatan terfilter
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveKpiModal(null)}
                    aria-label="Tutup modal"
                    className="size-9 flex items-center justify-center rounded-2xl bg-slate-100 text-slate-500 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400 transition-colors cursor-pointer"
                  >
                    <X className="size-4" strokeWidth={2.25} />
                  </button>
                </div>

                <div className="flex items-center gap-3 border-b border-slate-100 bg-slate-50/60 px-6 py-3 dark:border-slate-800 dark:bg-slate-900/40">
                  <div className="relative flex-1">
                    <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      value={kpiModalSearch}
                      onChange={(e) => setKpiModalSearch(e.target.value)}
                      placeholder="Cari kode, nama jabatan, atau satuan kerja..."
                      className="h-9 w-full rounded-xl border border-slate-200/90 bg-white pl-10 pr-4 text-xs font-semibold text-slate-800 placeholder:text-slate-400/80 transition-all duration-200 hover:border-slate-300 focus:border-[#0E5C44] focus:outline-none focus:ring-4 focus:ring-[#0E5C44]/12 dark:border-slate-700/80 dark:bg-slate-900 dark:text-slate-100"
                    />
                  </div>
                  <span className="inline-flex items-center rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-[#0E5C44] border border-emerald-200/80 dark:bg-emerald-950/60 dark:text-emerald-400 dark:border-emerald-800/60">
                    {filteredKpiItems.length} Jabatan
                  </span>
                </div>

                <div className="modal-body flex-1 overflow-y-auto p-6">
                  {filteredKpiItems.length === 0 ? (
                    <div className="py-12 text-center">
                      <p className="text-sm font-bold text-slate-500">Tidak ada data jabatan yang cocok dengan kriteria ini.</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto rounded-2xl border border-slate-200/80 dark:border-slate-800">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-gradient-to-r from-emerald-100/90 via-teal-50/70 to-emerald-100/90 border-b-2 border-emerald-200/90 dark:from-emerald-950/90 dark:via-teal-950/70 dark:to-emerald-950/90 text-[11px] font-extrabold uppercase text-slate-600 dark:text-slate-300">
                          <tr>
                            <th className="px-4 py-3">No</th>
                            <th className="px-4 py-3">Identitas Jabatan</th>
                            <th className="px-4 py-3">Satuan Kerja</th>
                            <th className="px-4 py-3">Unit Sekolah</th>
                            <th className="px-4 py-3 text-center">Struktur</th>
                            <th className="px-4 py-3 text-center">Login</th>
                            <th className="px-4 py-3 text-center">Status</th>
                            <th className="px-4 py-3 text-right">Aksi</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-emerald-100/80 dark:divide-emerald-900/40 font-medium text-slate-700 dark:text-slate-300">
                          {filteredKpiItems.map((item, idx) => (
                            <tr key={item.id || item.uuid || idx} className="hover:bg-emerald-50/40 dark:hover:bg-emerald-950/20 transition-colors">
                              <td className="px-4 py-3 font-bold text-slate-400">{idx + 1}</td>
                              <td className="px-4 py-3">
                                <span className="block font-bold text-slate-900 dark:text-white">{item.nama_jabatan || item.name}</span>
                                <span className="text-[10px] font-semibold text-emerald-700 dark:text-emerald-400">{item.kode_jabatan || '-'} · Level {item.level_jabatan}</span>
                              </td>
                              <td className="px-4 py-3">
                                <span className="inline-flex rounded-lg bg-slate-100 px-2.5 py-0.5 text-[10px] font-bold dark:bg-slate-800">
                                  {item.satuan_kerja || '-'}
                                </span>
                              </td>
                              <td className="px-4 py-3">{item.unit_sekolah?.nama || item.unit_sekolah?.name || 'Semua Unit'}</td>
                              <td className="px-4 py-3 text-center">
                                {item.tampil_struktur ? (
                                  <span className="inline-flex items-center gap-1 text-emerald-600 font-bold text-[10px]"><FaSitemap className="size-3" /> Ya</span>
                                ) : (
                                  <span className="text-slate-400 text-[10px]">Tidak</span>
                                )}
                              </td>
                              <td className="px-4 py-3 text-center">
                                {item.boleh_login ? (
                                  <span className="inline-flex items-center gap-1 text-emerald-600 font-bold text-[10px]"><FaLockOpen className="size-3" /> Ya</span>
                                ) : (
                                  <span className="text-slate-400 text-[10px]">Tidak</span>
                                )}
                              </td>
                              <td className="px-4 py-3 text-center">
                                <MasterStatusBadge active={item.status === 'Aktif' || item.status === true} inactiveLabel="Nonaktif" />
                              </td>
                              <td className="px-4 py-3 text-right">
                                <Button
                                  variant="ghost"
                                  appearance="outline"
                                  size="xs"
                                  onClick={() => {
                                    setActiveKpiModal(null)
                                    handleOpenDetail(item)
                                  }}
                                  className="h-7 px-2.5 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 rounded-lg font-bold cursor-pointer"
                                >
                                  <Eye className="size-3.5" />
                                  <span>Rincian</span>
                                </Button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                <div className="modal-footer flex items-center justify-between border-t border-slate-100 bg-white px-6 py-4 dark:border-slate-800 dark:bg-slate-950">
                  <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                    Menampilkan total {filteredKpiItems.length} baris
                  </span>
                  <button
                    type="button"
                    onClick={() => setActiveKpiModal(null)}
                    className="inline-flex items-center gap-1.5 rounded-2xl border border-slate-200/90 bg-white px-4 py-2 text-xs font-bold text-slate-700 shadow-2xs hover:bg-slate-100 hover:text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800 transition cursor-pointer"
                  >
                    Tutup
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
                        Export Data Jabatan
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
                    onClick={() => setShowExportModal(false)}
                    className="size-9 flex items-center justify-center rounded-2xl bg-slate-100 text-slate-500 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400 transition-colors cursor-pointer"
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
                      Data yang diekspor akan mencakup seluruh entitas terfilter ({totalCount} record jabatan).
                    </p>
                  </div>
                </div>

                <div className="modal-footer px-6 py-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-end gap-2.5 bg-slate-50/50 dark:bg-slate-900/40">
                  <button
                    type="button"
                    onClick={() => setShowExportModal(false)}
                    className="inline-flex items-center gap-1.5 rounded-2xl border border-slate-200/90 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 shadow-2xs hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 transition cursor-pointer"
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

      {/* ══════════════════════════════════════════════════════════════════
          HARMONIZED SAVE/UPDATE CONFIRMATION MODAL (z-[70])
      ══════════════════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {showSaveConfirmModal && pendingSaveData && (
          <div
            className="overlay modal fixed inset-0 z-[70] flex items-center justify-center p-3 sm:p-5 bg-slate-950/70 backdrop-blur-md"
            role="dialog"
            aria-modal="true"
            tabIndex={-1}
            onMouseDown={(e) => {
              if (e.target === e.currentTarget && !simpanMutation.isPending && !ubahMutation.isPending) {
                setShowSaveConfirmModal(false)
              }
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 14 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ type: 'spring', stiffness: 400, damping: 28 }}
              className="modal-dialog font-sans my-auto w-full max-w-md"
            >
              <div className="modal-content flex max-h-[calc(100dvh-2rem)] flex-col overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-2xl shadow-emerald-950/20 dark:border-slate-800 dark:bg-[#182232]">
                <div
                  className={`h-1.5 w-full shrink-0 ${
                    selectedJabatanForEdit
                      ? 'bg-gradient-to-r from-amber-500 via-teal-400 to-emerald-600'
                      : 'bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-600'
                  }`}
                />
                <div className="modal-header flex items-center justify-between border-b border-slate-100 bg-white px-6 py-4.5 dark:border-slate-800 dark:bg-slate-950">
                  <div className="flex items-center gap-3">
                    <div
                      className={`rounded-2xl text-white p-2.5 shadow-md shrink-0 border ${
                        selectedJabatanForEdit
                          ? 'bg-gradient-to-br from-amber-500 via-amber-600 to-orange-600 shadow-amber-500/30 border-amber-300/30'
                          : 'bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700 shadow-emerald-500/30 border-emerald-300/30'
                      }`}
                    >
                      {selectedJabatanForEdit ? (
                        <Pencil className="h-5 w-5 text-white" strokeWidth={2.25} />
                      ) : (
                        <FaBriefcase className="h-5 w-5 text-white" strokeWidth={2.25} />
                      )}
                    </div>
                    <div>
                      <h3 className="modal-title text-sm sm:text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                        <span>{selectedJabatanForEdit ? 'Konfirmasi Perubahan Data' : 'Konfirmasi Penyimpanan Data'}</span>
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold border ${
                            selectedJabatanForEdit
                              ? 'bg-amber-50 text-amber-700 border-amber-200/80 dark:bg-amber-950/60 dark:text-amber-400 dark:border-amber-800/60'
                              : 'bg-emerald-50 text-emerald-800 border-emerald-200/80 dark:bg-emerald-950/60 dark:text-emerald-400 dark:border-emerald-800/60'
                          }`}
                        >
                          <Sparkles className="size-3" />
                          {selectedJabatanForEdit ? 'Update Data' : 'Jabatan Baru'}
                        </span>
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        {selectedJabatanForEdit
                          ? 'Pastikan rincian data sudah sesuai sebelum diperbarui di sistem.'
                          : 'Pastikan rincian data jabatan baru sudah sesuai sebelum disimpan.'}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    disabled={simpanMutation.isPending || ubahMutation.isPending}
                    onClick={() => setShowSaveConfirmModal(false)}
                    className="size-9 flex items-center justify-center rounded-2xl bg-slate-100 text-slate-500 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400 transition-colors cursor-pointer disabled:opacity-50"
                  >
                    <X className="size-4" strokeWidth={2.25} />
                  </button>
                </div>

                <div className="modal-body p-6 space-y-4 text-slate-700 dark:text-slate-200">
                  {/* Summary Card */}
                  <div className="rounded-2xl border border-emerald-200/80 bg-emerald-50/50 p-4 dark:border-emerald-900/60 dark:bg-emerald-950/30">
                    <div className="flex items-center gap-3">
                      <div className="flex size-10 items-center justify-center rounded-xl bg-white dark:bg-slate-900 shadow-xs border border-emerald-200/60 dark:border-emerald-800/60 text-emerald-700 dark:text-emerald-400">
                        <FaBriefcase className="size-5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-black text-slate-900 dark:text-white truncate">
                          {pendingSaveData.nama_jabatan || pendingSaveData.name || '—'}
                        </p>
                        <p className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400">
                          {pendingSaveData.kode_jabatan || pendingSaveData.kode || '—'} · Level {pendingSaveData.level_jabatan || '—'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Notice Box */}
                  <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-3.5 dark:border-slate-800 dark:bg-slate-900/40 text-xs text-slate-600 dark:text-slate-300">
                    <p className="font-bold flex items-center gap-1.5 mb-1 text-slate-800 dark:text-slate-200">
                      <Sparkles className="size-3.5 text-emerald-600" />
                      Satuan Kerja: {pendingSaveData.satuan_kerja || '—'}
                    </p>
                    <p className="text-[11px] text-slate-500 leading-snug">
                      Data jabatan ini akan langsung disinkronkan ke master data jabatan yayasan.
                    </p>
                  </div>
                </div>

                <div className="modal-footer px-6 py-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-end gap-2.5 bg-slate-50/50 dark:bg-slate-900/40">
                  <button
                    type="button"
                    disabled={simpanMutation.isPending || ubahMutation.isPending}
                    onClick={() => setShowSaveConfirmModal(false)}
                    className="inline-flex items-center gap-1.5 rounded-2xl border border-slate-200/90 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 shadow-2xs hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 transition cursor-pointer disabled:opacity-50"
                  >
                    Batal
                  </button>
                  <button
                    type="button"
                    disabled={simpanMutation.isPending || ubahMutation.isPending}
                    onClick={handleConfirmSaveForm}
                    className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700 text-white px-5 py-2.5 text-xs font-extrabold shadow-md shadow-emerald-500/25 hover:shadow-lg hover:scale-[1.02] active:scale-95 transition-all duration-200 disabled:opacity-50 cursor-pointer border border-emerald-300/40"
                  >
                    {simpanMutation.isPending || ubahMutation.isPending ? (
                      <span className="size-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    ) : (
                      <Save className="size-4" strokeWidth={2} />
                    )}
                    <span>
                      {simpanMutation.isPending || ubahMutation.isPending
                        ? 'Menyimpan...'
                        : selectedJabatanForEdit
                        ? 'Ya, Perbarui Data'
                        : 'Ya, Simpan Jabatan'}
                    </span>
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

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
                        <span>Hapus Data Jabatan</span>
                        <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold border bg-rose-50 text-rose-700 border-rose-200/80 dark:bg-rose-950/60 dark:text-rose-400 dark:border-rose-800/60">
                          <AlertTriangle className="size-3" />
                          Hapus Permanen
                        </span>
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        Konfirmasi penghapusan data posisi jabatan ini.
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
                      {deleteTarget.nama_jabatan || deleteTarget.name}
                    </p>
                    <p className="text-[11px] font-bold text-rose-700 dark:text-rose-400 mt-0.5">
                      Kode: {deleteTarget.kode_jabatan || '-'} · Level {deleteTarget.level_jabatan || '-'}
                    </p>
                    {deleteTarget.jumlah_pegawai > 0 && (
                      <p className="text-[11px] font-semibold text-rose-600 mt-1">
                        ⚠ Jabatan ini masih memiliki {deleteTarget.jumlah_pegawai} pegawai aktif.
                      </p>
                    )}
                  </div>

                  {/* Danger Callout */}
                  <div className="rounded-2xl border border-rose-200 bg-rose-50/80 p-3.5 text-xs text-rose-900 dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-200 leading-relaxed">
                    <p className="font-bold flex items-center gap-1.5 mb-1">
                      <AlertTriangle className="size-3.5 text-rose-600" />
                      Perhatian
                    </p>
                    <p className="text-[11px] text-rose-800 dark:text-rose-300">
                      Data jabatan yang sedang digunakan oleh pegawai aktif tidak dapat dihapus permanen. Data akan dipindahkan ke arsip (soft delete).
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
                      <FaRedo className="h-5 w-5 text-white" strokeWidth={2.25} />
                    </div>
                    <div>
                      <h3 className="modal-title text-sm sm:text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                        <span>Pulihkan Data Jabatan</span>
                        <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold border bg-emerald-50 text-emerald-700 border-emerald-200/80 dark:bg-emerald-950/60 dark:text-emerald-400 dark:border-emerald-800/60">
                          <FaRedo className="size-3" />
                          Restore Data
                        </span>
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        Konfirmasi pemulihan data posisi jabatan dari arsip.
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
                      {restoreTarget.nama_jabatan || restoreTarget.name}
                    </p>
                    <p className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400 mt-0.5">
                      Kode: {restoreTarget.kode_jabatan || '-'} · Level {restoreTarget.level_jabatan || '-'}
                    </p>
                  </div>

                  {/* Notice Callout */}
                  <div className="rounded-2xl border border-emerald-200 bg-emerald-50/80 p-3.5 text-xs text-emerald-900 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-200 leading-relaxed">
                    <p className="font-bold flex items-center gap-1.5 mb-1">
                      <Sparkles className="size-3.5 text-emerald-600" />
                      Informasi Pemulihan
                    </p>
                    <p className="text-[11px] text-emerald-800 dark:text-emerald-300">
                      Jabatan ini akan dipulihkan dari arsip dan kembali tersedia di sistem manajemen pegawai.
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
                      <FaRedo className="size-4" />
                    )}
                    <span>{pulihkanMutation.isPending ? 'Memulihkan...' : 'Ya, Pulihkan Data'}</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Toast Notification Stack */}
      <ToastStack toasts={toasts} onDismiss={dismissToast} />
    </PageContainer>
  )
}
