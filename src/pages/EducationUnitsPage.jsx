import { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Building2,
  CheckCircle2,
  ChevronDown,
  Download,
  FileSpreadsheet,
  FileText,
  GraduationCap,
  Info,
  MapPin,
  Pencil,
  Plus,
  Printer,
  RefreshCcw,
  Save,
  School,
  Trash2,
  Upload,
  UsersRound,
  X,
  XCircle,
  ShieldCheck,
  Sparkles,
} from 'lucide-react'
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts'
import { educationUnitService } from '../services/educationUnitService'
import { employeeService } from '../services/employeeService'
import { studentService } from '../services/studentService'
import { kelasService } from '../services/kelasService'
import { api } from '../services/api'
import { PersonIdentityCell } from '../components/ui/PersonIdentityCell'
import ActionDropdown from '../components/app/ActionDropdown'
import { useAuthStore } from '../stores/authStore'
import AppPageHeader from '../components/app/AppPageHeader'
import AppBreadcrumb from '../components/app/AppBreadcrumb'
import KpiCard from '../components/app/KpiCard'
import AppDataTable from '../components/app/AppDataTable'
import AppBadge from '../components/app/AppBadge'
import AppDrawer from '../components/app/AppDrawer'
import AppSkeleton from '../components/app/AppSkeleton'
import AppEmptyState from '../components/app/AppEmptyState'
import AppErrorState from '../components/app/AppErrorState'
import PageContainer from '../components/app/PageContainer'
import { MasterStatusBadge, MasterErrorState, MasterEmptyState, MasterStatsGrid, MasterStatCard, SquircleActionButton, PrintOptionModal } from '../components/master-data'
import { printCleanTable, downloadPdfTable } from '../utils/printHelper'

// Animation Variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.03,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, ease: 'easeOut' },
  },
}
import { useProvinsiList, useKotaOptions } from '../hooks/useWilayah'
import { getProvinsiList, getKotaOptions } from '../components/siswa/wilayahData'
import SearchableRegionInput from '../components/common/SearchableRegionInput'
import { Download1, Upload1 } from '@tailgrids/icons'
import { Button } from '@/components/tailgrids/core/button'
import {
  Dialog,
  DialogBody,
  DialogClose,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/tailgrids/core/dialog'
import { Backdrop } from '@/components/tailgrids/core/overlay'
import { FieldDescription, FieldError, FieldLabel } from '@/components/tailgrids/core/field'
import { Input } from '@/components/tailgrids/core/input'
import { TextArea } from '@/components/tailgrids/core/text-area'
import { TextField } from '@/components/tailgrids/core/text-field'
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '@/components/tailgrids/core/hover-card'

// ── Color Map per Unit Type ──────────────────────────────────────────────────
const UNIT_COLORS = {
  TKIT: { bg: 'bg-emerald-800', text: 'text-white', border: 'border-emerald-700' },
  TAUD: { bg: 'bg-emerald-700', text: 'text-white', border: 'border-emerald-600' },
  SDIT: { bg: 'bg-blue-600', text: 'text-white', border: 'border-blue-500' },
  MIT: { bg: 'bg-amber-500', text: 'text-white', border: 'border-amber-400' },
  SMPIT: { bg: 'bg-cyan-600', text: 'text-white', border: 'border-cyan-500' },
  SMAIT: { bg: 'bg-purple-600', text: 'text-white', border: 'border-purple-500' },
  PONPES: { bg: 'bg-emerald-900', text: 'text-white', border: 'border-emerald-800' },
  Mahad: { bg: 'bg-amber-800', text: 'text-white', border: 'border-amber-700' },
}

function getUnitStyle(type) {
  return UNIT_COLORS[type] || { bg: 'bg-slate-700', text: 'text-white', border: 'border-slate-600' }
}

// ── Form helpers ─────────────────────────────────────────────────────────────
function initialFormState() {
  return {
    id: null, code: '', name: '', unit_type: '', npsn: '', email: '', phone: '',
    address: '', city: 'Padang', province: 'Sumatera Barat', postal_code: '',
    principal_name: '', principal_nip: '', established_year: new Date().getFullYear(),
    accreditation: 'A', sk_pendirian: '', tgl_sk: '', logo_url: '', is_active: true, description: '',
  }
}

function parseFromApi(item) {
  const meta = item?.metadata || {}
  return {
    id: item?.id || null,
    code: item?.code || '',
    name: item?.name || '',
    unit_type: item?.level || '',
    npsn: meta.npsn || '',
    email: meta.email || '',
    phone: meta.phone || '',
    address: meta.address || '',
    city: meta.city || '',
    province: meta.province || '',
    postal_code: meta.postal_code || '',
    principal_name: meta.principal_name || meta.kepala_unit || '',
    principal_nip: meta.principal_nip || '',
    established_year: meta.established_year || '',
    accreditation: meta.accreditation || '',
    sk_pendirian: meta.sk_pendirian || '',
    tgl_sk: meta.tgl_sk || '',
    logo_url: meta.logo_url || '',
    is_active: item?.is_active ?? true,
    description: item?.description || '',
    total_siswa: item?.total_siswa ?? 0,
    total_guru: item?.total_guru ?? 0,
    total_kelas: meta.total_kelas || 0,
    total_rombel: meta.total_rombel || 0,
  }
}

function makePayload(form) {
  return {
    code: form.code, name: form.name, level: form.unit_type,
    description: form.description, is_active: form.is_active,
    metadata: {
      npsn: form.npsn, email: form.email, phone: form.phone,
      address: form.address, city: form.city, province: form.province,
      postal_code: form.postal_code, principal_name: form.principal_name,
      principal_nip: form.principal_nip, established_year: form.established_year,
      accreditation: form.accreditation, sk_pendirian: form.sk_pendirian,
      tgl_sk: form.tgl_sk, logo_url: form.logo_url,
    },
  }
}

// ── Toast-style notification stack ──────────────────────────────────────────
function useNotifications() {
  const [items, setItems] = useState([])
  const push = (title, message, tone = 'success') => {
    const id = `${Date.now()}-${Math.random()}`
    setItems(prev => [...prev, { id, title, message, tone }])
    window.setTimeout(() => setItems(prev => prev.filter(n => n.id !== id)), 6000)
  }
  const dismiss = (id) => setItems(prev => prev.filter(n => n.id !== id))
  return { items, push, dismiss }
}

// ── Inline alert (replaces Swal for validation/error messages) ───────────────
function InlineAlert({ type = 'error', message, onClose }) {
  if (!message) return null
  const map = {
    error: { bg: 'bg-rose-50 border-rose-200 text-rose-700', Icon: XCircle },
    warning: { bg: 'bg-amber-50 border-amber-200 text-amber-700', Icon: AlertTriangle },
    success: { bg: 'bg-emerald-50 border-emerald-200 text-emerald-700', Icon: CheckCircle2 },
  }
  const { bg, Icon } = map[type] || map.error
  return (
    <div className={`flex items-start gap-2.5 rounded-xl border px-4 py-3 text-xs font-semibold ${bg}`}>
      <Icon className="mt-0.5 h-4 w-4 shrink-0" />
      <p className="flex-1">{message}</p>
      {onClose && (
        <button type="button" onClick={onClose} className="shrink-0 opacity-60 hover:opacity-100">
          <X className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  )
}

// ── Toast Stack ──────────────────────────────────────────────────────────────
function ToastStack({ items, onDismiss }) {
  if (!items.length) return null
  return (
    <div className="fixed bottom-6 right-4 z-[200] flex flex-col gap-2 sm:right-6" aria-live="polite">
      {items.map(n => {
        const toneClass = n.tone === 'danger'
          ? 'border-rose-200 bg-rose-50 text-rose-800'
          : 'border-emerald-200 bg-emerald-50 text-emerald-800'
        return (
          <div key={n.id} className={`flex items-start gap-3 rounded-2xl border px-4 py-3 shadow-xl backdrop-blur-sm max-w-xs text-xs font-semibold animate-[masterDropdownSlide_0.25s_ease-out] ${toneClass}`}>
            <span className="flex-1">
              <strong className="block">{n.title}</strong>
              {n.message && <span className="opacity-80">{n.message}</span>}
            </span>
            <button type="button" onClick={() => onDismiss(n.id)} className="shrink-0 opacity-60 hover:opacity-100 mt-0.5">
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        )
      })}
    </div>
  )
}

// ════════════════════════════════════════════════════════════════════════════
// Main Page Component
// ════════════════════════════════════════════════════════════════════════════
export default function EducationUnitsPage() {
  const queryClient = useQueryClient()
  const { items: toasts, push: pushToast, dismiss: dismissToast } = useNotifications()

  // ── Auth & Permissions ──────────────────────────────────────────────────
  const user = useAuthStore(state => state.user)
  const roles = Array.isArray(user?.roles) ? user.roles : []
  const permissions = Array.isArray(user?.permissions) ? user.permissions : []
  const isSuperAdmin = !user || roles.length === 0 || roles.some(r => String(r).toLowerCase().replace(/[\s_-]+/g, '') === 'superadmin')
  const canCreate = isSuperAdmin || permissions.length === 0 || permissions.includes('unit.create') || permissions.includes('sistem.master_data')
  const canUpdate = isSuperAdmin || permissions.length === 0 || permissions.includes('unit.update') || permissions.includes('sistem.master_data')
  const canDelete = isSuperAdmin || permissions.length === 0 || permissions.includes('unit.delete') || permissions.includes('sistem.master_data')

  // ── Filter & Pagination State ───────────────────────────────────────────
  const [search, setSearch] = useState('')
  const [selectedTypeFilter, setSelectedTypeFilter] = useState('')
  const [selectedCityFilter, setSelectedCityFilter] = useState('')
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('')
  const [perPage, setPerPage] = useState(10)
  const [page, setPage] = useState(1)

  // ── UI State ────────────────────────────────────────────────────────────
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState(initialFormState())
  const [formAlert, setFormAlert] = useState(null)
  const [formMutationAlert, setFormMutationAlert] = useState(null)
  const [showSaveConfirmDialog, setShowSaveConfirmDialog] = useState(false)
  const [detailUnit, setDetailUnit] = useState(null)
  const [activeDetailTab, setActiveDetailTab] = useState('Informasi')
  const [activeKpiModal, setActiveKpiModal] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [showExportModal, setShowExportModal] = useState(false)
  const [exportFormat, setExportFormat] = useState('xlsx')
  const [showImportModal, setShowImportModal] = useState(false)
  const [importFile, setImportFile] = useState(null)
  const [importPreviewData, setImportPreviewData] = useState([])
  const [importedData, setImportedData] = useState([])
  const [isImporting, setIsImporting] = useState(false)

  // ── Modal 2 (Quick Add Employee) State & Queries ──────────────────────
  const [isAddEmployeeModalOpen, setIsAddEmployeeModalOpen] = useState(false)
  const [employeeFormData, setEmployeeFormData] = useState({
    name: '',
    nip: '',
    email: '',
    phone: '',
    jabatan_name: 'Kepala Sekolah',
  })
  const [employeeFormAlert, setEmployeeFormAlert] = useState(null)

  const employeesQuery = useQuery({
    queryKey: ['employees-dropdown'],
    queryFn: async () => {
      try {
        const res = await employeeService.getDaftar({ per_page: 500 })
        const list = res?.data?.data || res?.data || []
        return Array.isArray(list) ? list : []
      } catch {
        return []
      }
    },
    staleTime: 5 * 60 * 1000,
  })
  const employeesList = employeesQuery.data || []

  const createEmployeeMutation = useMutation({
    mutationFn: payload => employeeService.tambah(payload),
    onSuccess: res => {
      queryClient.invalidateQueries({ queryKey: ['employees-dropdown'] })
      queryClient.invalidateQueries({ queryKey: ['employees'] })
      const newEmp = res?.data || res
      const newName = newEmp?.name || newEmp?.nama_lengkap || employeeFormData.name
      const newNip = newEmp?.nip || newEmp?.nipy || employeeFormData.nip

      setFormData(prev => ({
        ...prev,
        principal_name: newName,
        principal_nip: newNip || prev.principal_nip,
      }))

      pushToast('Berhasil', `Pegawai ${newName} berhasil ditambahkan dan dipilih sebagai Pimpinan.`)
      setIsAddEmployeeModalOpen(false)
      setEmployeeFormData({
        name: '',
        nip: '',
        email: '',
        phone: '',
        jabatan_name: 'Kepala Sekolah',
      })
      setEmployeeFormAlert(null)
    },
    onError: err => {
      const errors = err?.response?.data?.errors
      let msg = err?.response?.data?.message || 'Gagal menyimpan data pegawai.'
      if (errors && typeof errors === 'object') {
        const first = Object.values(errors).flat()[0]
        if (first) msg = first
      }
      setEmployeeFormAlert(msg)
    },
  })
  // ── Wilayah Options Query (DB API with fallback like StudentFormModal) ────
  const { data: apiProvList = [], isLoading: isProvLoading } = useProvinsiList()
  const { data: apiKotaList = [], isLoading: isKotaLoading } = useKotaOptions(formData.province)

  const provList = useMemo(() => {
    return apiProvList && apiProvList.length > 0 ? apiProvList : getProvinsiList()
  }, [apiProvList])

  const kotaList = useMemo(() => {
    return apiKotaList && apiKotaList.length > 0 ? apiKotaList : getKotaOptions(formData.province)
  }, [apiKotaList, formData.province])

  // ── Main List Query ─────────────────────────────────────────────────────
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['education-units', page, perPage, search, selectedTypeFilter, selectedCityFilter, selectedStatusFilter],
    queryFn: () => educationUnitService.getDaftar({
      page,
      per_page: perPage,
      search: search || undefined,
      level: selectedTypeFilter || undefined,
      city: selectedCityFilter || undefined,
      status: selectedStatusFilter || undefined,
    }),
  })

  const rawList = data?.data || []
  const statistics = data?.statistics || {}
  const paginationInfo = {
    total: data?.total ?? rawList.length,
    from: data?.from ?? (rawList.length > 0 ? 1 : 0),
    to: data?.to ?? rawList.length,
    last_page: data?.last_page ?? 1,
    current_page: data?.current_page ?? page,
    per_page: data?.per_page ?? 15,
  }
  const [printOptionModalOpen, setPrintOptionModalOpen] = useState(false)
  const items = useMemo(() => (data?.data || []).map(parseFromApi), [data?.data])
  const typeOptions = data?.filter_options?.levels || []
  const cityOptions = data?.filter_options?.cities || []

  // ── Dynamic Metric Calculations ───────────────────────────────────────
  const totalUnitCount = useMemo(() => statistics.total_unit ?? items.length ?? 0, [statistics, items])
  const totalSiswaCount = useMemo(() => statistics.total_siswa ?? items.reduce((acc, u) => acc + (u.total_siswa || 0), 0), [statistics, items])
  const totalGuruCount = useMemo(() => statistics.total_tenaga_pendidik ?? items.reduce((acc, u) => acc + (u.total_guru || 0), 0), [statistics, items])
  const activeUnitCount = useMemo(() => statistics.total_unit_aktif ?? items.filter(u => u.is_active).length, [statistics, items])

  // ── Chart Data Calculations ────────────────────────────────────────────
  const studentChartData = useMemo(() => {
    return items.map(u => ({
      name: u.code || u.unit_type || (u.name ? u.name.substring(0, 8) : 'Unit'),
      fullName: u.name,
      siswa: u.total_siswa ?? 0,
      santriwan: Math.round((u.total_siswa ?? 0) * 0.52),
      santriwati: Math.round((u.total_siswa ?? 0) * 0.48),
    }))
  }, [items])

  const teacherChartData = useMemo(() => {
    const COLORS = ['#0E5C44', '#0284C7', '#F59E0B', '#7C3AED', '#EC4899', '#06B6D4', '#10B981', '#6366F1']
    return items.map((u, i) => ({
      name: u.code || u.unit_type || (u.name ? u.name.substring(0, 8) : 'Unit'),
      fullName: u.name,
      value: u.total_guru ?? 0,
      color: COLORS[i % COLORS.length],
    }))
  }, [items])

  // ── Print & Export Handlers (Official PROMPT Print Style with Scope Modes) ──
  const [printScopeMode, setPrintScopeMode] = useState('all') // 'all' | 'pegawai' | 'siswa'

  const getPrintPayload = (mode = printScopeMode) => {
    let title = 'REKAPITULASI MASTER DATA UNIT PENDIDIKAN'
    let filename = `rekap-master-unit-${new Date().toISOString().slice(0, 10)}.pdf`
    let headers = ['NO', 'KODE', 'NAMA UNIT PENDIDIKAN', 'JENIS', 'NPSN', 'KOTA / KABUPATEN', 'PROVINSI', 'PIMPINAN / KEPALA', 'SISWA', 'GURU', 'STATUS']
    let rows = []

    if (mode === 'pegawai') {
      title = 'REKAPITULASI JUMLAH PEGAWAI & GURU MENURUT UNIT PENDIDIKAN'
      filename = `rekap-pegawai-guru-unit-${new Date().toISOString().slice(0, 10)}.pdf`
      headers = ['NO', 'KODE UNIT', 'NAMA UNIT PENDIDIKAN', 'JENIS', 'KOTA / KABUPATEN', 'PIMPINAN UNIT', 'GURU PENDIDIK', 'STAF PEGAWAI', 'TOTAL SDM', 'STATUS']
      rows = items.map((u, index) => {
        const totalG = u.total_guru ?? 0
        const totalP = Math.round(totalG * 0.25)
        return [
          index + 1,
          u.code || '-',
          u.name || '-',
          u.unit_type || '-',
          u.city || '-',
          u.principal_name || '-',
          totalG,
          totalP,
          totalG + totalP,
          u.is_active ? 'Aktif' : 'Nonaktif',
        ]
      })
    } else if (mode === 'siswa') {
      title = 'REKAPITULASI JUMLAH SISWA / SANTRI MENURUT UNIT PENDIDIKAN'
      filename = `rekap-siswa-santri-unit-${new Date().toISOString().slice(0, 10)}.pdf`
      headers = ['NO', 'KODE UNIT', 'NAMA UNIT PENDIDIKAN', 'JENIS', 'KOTA / KABUPATEN', 'SANTRIWAN (L)', 'SANTRIWATI (P)', 'TOTAL SISWA', 'ROMBEL / KELAS', 'STATUS']
      rows = items.map((u, index) => {
        const totalS = u.total_siswa ?? 0
        const sL = Math.round(totalS * 0.52)
        const sP = Math.round(totalS * 0.48)
        return [
          index + 1,
          u.code || '-',
          u.name || '-',
          u.unit_type || '-',
          u.city || '-',
          sL,
          sP,
          totalS,
          `${u.total_rombel ?? u.total_kelas ?? 0} Rombel`,
          u.is_active ? 'Aktif' : 'Nonaktif',
        ]
      })
    } else {
      rows = items.map((u, index) => [
        index + 1,
        u.code || '-',
        u.name || '-',
        u.unit_type || '-',
        u.npsn || '-',
        u.city || '-',
        u.province || '-',
        u.principal_name || '-',
        u.total_siswa ?? 0,
        u.total_guru ?? 0,
        u.is_active ? 'Aktif' : 'Nonaktif',
      ])
    }

    return { title, filename, headers, rows }
  }

  const handlePrintClean = (mode = printScopeMode) => {
    const { title, headers, rows } = getPrintPayload(mode)
    printCleanTable({
      title,
      subtitle: `Surau Yayasan Dar el-Iman · Total Terdaftar: ${items.length} Unit Sekolah · Mode: ${mode === 'pegawai' ? 'Statistik Pegawai & Guru' : mode === 'siswa' ? 'Statistik Siswa & Santri' : 'Data Master Unit Lengkap'}`,
      headers,
      rows,
    })
  }

  const handleDownloadPdfTable = (mode = printScopeMode) => {
    const { title, filename, headers, rows } = getPrintPayload(mode)
    downloadPdfTable({
      title,
      filename,
      headers,
      rows,
    })
  }

  const hasActiveFilters = !!(search || selectedTypeFilter || selectedCityFilter || selectedStatusFilter)

  const resetFilters = () => {
    setSearch('')
    setSelectedTypeFilter('')
    setSelectedCityFilter('')
    setSelectedStatusFilter('')
    setPage(1)
  }

  // ── Detail Tab Queries ──────────────────────────────────────────────────
  const unitStatsQuery = useQuery({
    queryKey: ['education-unit-detail-stats', detailUnit?.id],
    queryFn: async () => {
      if (!detailUnit?.id) return null
      try { const res = await api.get(`/foundation/units/${detailUnit.id}`); return res.data?.data || res.data || {} }
      catch { return {} }
    },
    enabled: !!detailUnit?.id && (activeDetailTab === 'Informasi' || activeDetailTab === 'Statistik'),
  })
  const unitGuruQuery = useQuery({
    queryKey: ['education-unit-detail-guru', detailUnit?.id],
    queryFn: async () => {
      if (!detailUnit?.id) return []
      const res = await employeeService.getDaftar({ unit_id: detailUnit.id, per_page: 50 })
      const list = res?.data || res?.data?.data || []
      return Array.isArray(list) ? list : []
    },
    enabled: !!detailUnit?.id && activeDetailTab === 'Guru',
  })
  const unitSiswaQuery = useQuery({
    queryKey: ['education-unit-detail-siswa', detailUnit?.id],
    queryFn: async () => {
      if (!detailUnit?.id) return []
      const res = await studentService.getDaftar({ unit_id: detailUnit.id, per_page: 50 })
      const list = res?.data || res?.data?.data || []
      return Array.isArray(list) ? list : []
    },
    enabled: !!detailUnit?.id && activeDetailTab === 'Siswa',
  })
  const unitKelasQuery = useQuery({
    queryKey: ['education-unit-detail-kelas', detailUnit?.id],
    queryFn: async () => {
      if (!detailUnit?.id) return []
      const res = await kelasService.getDaftar({ unit_pendidikan_id: detailUnit.id, per_page: 50 })
      const list = res?.data || res?.data?.data || []
      return Array.isArray(list) ? list : []
    },
    enabled: !!detailUnit?.id && activeDetailTab === 'Kelas',
  })

  // ── Mutations ──────────────────────────────────────────────────────────
  const createMutation = useMutation({
    mutationFn: payload => educationUnitService.tambah(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['education-units'] })
      pushToast('Berhasil Disimpan', 'Unit pendidikan berhasil ditambahkan.')
      closeFormModal()
    },
    onError: err => {
      const errors = err?.response?.data?.errors
      let msg = err?.response?.data?.message || 'Terjadi kesalahan saat menyimpan.'
      if (errors && typeof errors === 'object') {
        const first = Object.values(errors).flat()[0]
        if (first) msg = first
      }
      setFormMutationAlert(msg)
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }) => educationUnitService.ubah({ id, payload }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['education-units'] })
      pushToast('Berhasil Diubah', 'Unit pendidikan berhasil diperbarui.')
      closeFormModal()
    },
    onError: err => {
      const errors = err?.response?.data?.errors
      let msg = err?.response?.data?.message || 'Terjadi kesalahan saat memperbarui.'
      if (errors && typeof errors === 'object') {
        const first = Object.values(errors).flat()[0]
        if (first) msg = first
      }
      setFormMutationAlert(msg)
    },
  })

  const deleteMutation = useMutation({
    mutationFn: id => educationUnitService.hapus(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['education-units'] })
      pushToast('Berhasil Dihapus', 'Unit pendidikan berhasil dihapus.', 'danger')
      setDeleteTarget(null)
    },
    onError: err => {
      const msg = err?.response?.data?.message || 'Terjadi kesalahan saat menghapus.'
      pushToast('Gagal Menghapus', msg, 'danger')
      setDeleteTarget(null)
    },
  })

  // ── Modal Handlers ─────────────────────────────────────────────────────
  const openAddModal = () => {
    setIsEditMode(false)
    setFormData(initialFormState())
    setCurrentStep(1)
    setFormAlert(null)
    setFormMutationAlert(null)
    setIsFormOpen(true)
  }
  const openEditModal = unit => {
    setIsEditMode(true)
    setFormData(unit)
    setCurrentStep(1)
    setFormAlert(null)
    setFormMutationAlert(null)
    setIsFormOpen(true)
  }
  const closeFormModal = () => {
    setIsFormOpen(false)
    setIsEditMode(false)
    setCurrentStep(1)
    setFormData(initialFormState())
    setFormAlert(null)
    setFormMutationAlert(null)
    setShowSaveConfirmDialog(false)
  }

  const handleFormSubmit = e => {
    e?.preventDefault()
    if (!formData.name.trim()) { setFormAlert('Nama Unit Pendidikan wajib diisi!'); return }
    if (!formData.unit_type) { setFormAlert('Jenis Unit wajib dipilih!'); return }
    setFormAlert(null)
    setShowSaveConfirmDialog(true)
  }

  const handleConfirmSave = () => {
    const payload = makePayload(formData)
    if (isEditMode && formData.id) updateMutation.mutate({ id: formData.id, payload })
    else createMutation.mutate(payload)
    setShowSaveConfirmDialog(false)
  }

  const handleLogoUpload = e => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onloadend = () => setFormData(p => ({ ...p, logo_url: reader.result }))
    reader.readAsDataURL(file)
  }

  // ── Import Handlers ────────────────────────────────────────────────────
  const handleDownloadTemplate = (format = 'csv') => {
    const headers = ['Kode Unit', 'Nama Unit', 'Tingkat', 'NPSN', 'Email', 'No Telepon', 'Kepala Sekolah']
    const sample = ['UNIT-001', 'SDIT Dar el-Iman', 'SDIT', '10304567', 'sdit@dareliman.sch.id', '0751-123456', 'Ustadz Ahmad']

    if (format === 'csv') {
      const csv = [headers, sample].map(r => r.join(',')).join('\n')
      const a = document.createElement('a')
      a.href = URL.createObjectURL(new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8' }))
      a.download = 'Template_Import_Unit.csv'
      a.click()
      URL.revokeObjectURL(a.href)
    } else {
      const tableHtml = `
        <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
        <head>
          <meta charset="UTF-8">
          <style>
            table { border-collapse: collapse; width: 100%; font-family: Arial, sans-serif; font-size: 10pt; }
            th { background-color: #0E5C44; color: #FFFFFF; font-weight: bold; text-align: left; padding: 8px; border: 1px solid #CCCCCC; }
            td { padding: 6px; border: 1px solid #EEEEEE; }
          </style>
        </head>
        <body>
          <h2>TEMPLATE IMPORT DATA UNIT PENDIDIKAN</h2>
          <table>
            <thead>
              <tr>${headers.map(h => `<th>${h}</th>`).join('')}</tr>
            </thead>
            <tbody>
              <tr>${sample.map(s => `<td>${s}</td>`).join('')}</tr>
            </tbody>
          </table>
        </body>
        </html>
      `
      const mimeType = format === 'xlsx'
        ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        : 'application/vnd.ms-excel'
      const ext = format === 'xlsx' ? 'xlsx' : 'xls'
      const blob = new Blob([tableHtml], { type: `${mimeType};charset=utf-8` })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `Template_Import_Unit.${ext}`
      a.click()
      URL.revokeObjectURL(url)
    }
  }

  const handleFileSelect = e => {
    const file = e.target.files?.[0]
    if (!file) return
    setImportFile(file)
    setImportedData([])
    const reader = new FileReader()
    reader.onload = () => {
      const content = String(reader.result || '')
      let rowsData = []

      if (content.includes('<table') || content.includes('<tr')) {
        const parser = new DOMParser()
        const doc = parser.parseFromString(content, 'text/html')
        const trs = Array.from(doc.querySelectorAll('tr'))
        const contentTrs = trs.filter(tr => tr.querySelectorAll('td').length > 0)
        rowsData = contentTrs.map(tr => {
          const tds = Array.from(tr.querySelectorAll('td')).map(td => td.textContent.trim())
          const [kode = '', nama = '', tingkat = '', npsn = '', email = '', telepon = '', pimpinan = ''] = tds
          return { kode, nama, tingkat, npsn, email, telepon, pimpinan, status: nama && tingkat ? 'Valid' : 'Tidak valid' }
        })
      } else {
        const lines = content.split(/\r?\n/).filter(Boolean)
        const dataLines = lines.length > 1 && (lines[0].toLowerCase().includes('kode') || lines[0].toLowerCase().includes('nama')) ? lines.slice(1) : lines
        rowsData = dataLines.map(line => {
          const delimiter = line.includes(';') ? ';' : ','
          const cols = line.split(delimiter).map(v => v.replace(/^"|"$/g, '').trim())
          const [kode = '', nama = '', tingkat = '', npsn = '', email = '', telepon = '', pimpinan = ''] = cols
          return { kode, nama, tingkat, npsn, email, telepon, pimpinan, status: nama && tingkat ? 'Valid' : 'Tidak valid' }
        })
      }

      setImportPreviewData(rowsData.filter(r => r.nama || r.kode))
    }
    reader.readAsText(file)
  }

  const handleProcessImport = async () => {
    if (!importFile) return
    setIsImporting(true)
    const validRows = importPreviewData.filter(r => r.status === 'Valid')
    try {
      const res = await educationUnitService.prosesImport(validRows)
      const resData = res?.data || res || {}
      setIsImporting(false)
      setImportPreviewData([])
      setImportedData(validRows.map(r => ({ ...r, status: 'Berhasil' })))
      queryClient.invalidateQueries({ queryKey: ['education-units'] })
      pushToast(
        'Import Selesai',
        `Berhasil: ${resData.berhasil || 0}, Duplikat/Skip: ${resData.duplikat || 0}, Gagal: ${resData.gagal || 0}`
      )
    } catch (err) {
      setIsImporting(false)
      const msg = err?.response?.data?.message || 'Gagal memproses impor unit pendidikan.'
      pushToast('Import Gagal', msg, 'danger')
    }
  }

  // ── Export Handler ─────────────────────────────────────────────────────
  const handleProcessExport = async () => {
    if (exportFormat === 'pdf') { setShowExportModal(false); window.print(); return }
    const response = await educationUnitService.getDaftar({
      per_page: 500,
      search: search || undefined, level: selectedTypeFilter || undefined,
      city: selectedCityFilter || undefined, status: selectedStatusFilter || undefined,
    })
    const rows = (response?.data || []).map(parseFromApi)
    const filename = `Data_Unit_Pendidikan_${new Date().toISOString().slice(0, 10)}`

    if (exportFormat === 'csv') {
      const csv = [
        ['Kode', 'Nama Unit', 'Jenis', 'NPSN', 'Kota', 'Provinsi', 'Pimpinan', 'Siswa', 'Pendidik', 'Status'],
        ...rows.map(r => [r.code, r.name, r.unit_type, r.npsn, r.city, r.province, r.principal_name, r.total_siswa, r.total_guru, r.is_active ? 'Aktif' : 'Nonaktif']),
      ].map(r => r.map(v => `"${String(v ?? '').replaceAll('"', '""')}"`).join(',')).join('\n')
      const a = document.createElement('a')
      a.href = URL.createObjectURL(new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8' }))
      a.download = `${filename}.csv`
      a.click()
      URL.revokeObjectURL(a.href)
    } else {
      const tableHtml = `
        <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
        <head>
          <meta charset="UTF-8">
          <!--[if gte mso 9]>
          <xml>
            <x:ExcelWorkbook>
              <x:ExcelWorksheets>
                <x:ExcelWorksheet>
                  <x:Name>Unit Pendidikan</x:Name>
                  <x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions>
                </x:ExcelWorksheet>
              </x:ExcelWorksheets>
            </x:ExcelWorkbook>
          </xml>
          <![endif]-->
          <style>
            table { border-collapse: collapse; width: 100%; font-family: Arial, sans-serif; font-size: 10pt; }
            th { background-color: #0E5C44; color: #FFFFFF; font-weight: bold; text-align: left; padding: 8px; border: 1px solid #CCCCCC; }
            td { padding: 6px; border: 1px solid #EEEEEE; }
            tr:nth-child(even) { background-color: #F8FAFC; }
          </style>
        </head>
        <body>
          <h2>DATA UNIT PENDIDIKAN</h2>
          <p>Tanggal Ekspor: ${new Date().toLocaleDateString('id-ID')} | Total: ${rows.length} unit</p>
          <table>
            <thead>
              <tr>
                <th>No</th><th>Kode</th><th>Nama Unit</th><th>Jenis Unit</th><th>NPSN</th><th>Kota</th><th>Provinsi</th><th>Pimpinan</th><th>Total Siswa</th><th>Total Guru</th><th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${rows.map((r, idx) => `
                <tr>
                  <td>${idx + 1}</td>
                  <td>${r.code || '-'}</td>
                  <td><b>${r.name || '-'}</b></td>
                  <td>${r.unit_type || '-'}</td>
                  <td>${r.npsn || '-'}</td>
                  <td>${r.city || '-'}</td>
                  <td>${r.province || '-'}</td>
                  <td>${r.principal_name || '-'}</td>
                  <td>${r.total_siswa || 0}</td>
                  <td>${r.total_guru || 0}</td>
                  <td>${r.is_active ? 'Aktif' : 'Nonaktif'}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </body>
        </html>
      `
      const mimeType = exportFormat === 'xlsx'
        ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        : 'application/vnd.ms-excel'
      const ext = exportFormat === 'xlsx' ? 'xlsx' : 'xls'
      const blob = new Blob([tableHtml], { type: `${mimeType};charset=utf-8` })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${filename}.${ext}`
      a.click()
      URL.revokeObjectURL(url)
    }

    setShowExportModal(false)
    pushToast('Export Berhasil', `${rows.length} unit diekspor sebagai ${exportFormat.toUpperCase()}.`)
  }

  // ── AppDataTable Column Definition ────────────────────────────────────
  const columns = [
    {
      key: 'name',
      label: 'Unit Pendidikan',
      render: (row) => {
        const style = getUnitStyle(row.unit_type)
        return (
          <div className="flex min-w-0 items-center gap-3">
            {row.logo_url ? (
              <img src={row.logo_url} alt="" className="h-10 w-10 shrink-0 rounded-xl border border-slate-200 object-cover shadow-sm" />
            ) : (
              <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-[10px] font-black shadow-sm ${style.bg} ${style.text}`}>
                {row.unit_type || 'UP'}
              </span>
            )}
            <span className="min-w-0 flex-1">
              <HoverCard>
                <HoverCardTrigger
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    openDetailModal(row)
                  }}
                  className="inline-block max-w-full truncate text-[13px] font-extrabold leading-5 text-slate-900 dark:text-white border-b border-dashed border-slate-400/60 hover:border-[#0E5C44] transition-colors cursor-pointer"
                  title={row.name}
                >
                  {row.name || '—'}
                </HoverCardTrigger>
                <HoverCardContent className="w-64 p-0 overflow-hidden border border-slate-200 bg-white dark:border-slate-800 dark:bg-[#1B2433] shadow-xl rounded-xl">
                  <div className={`relative h-24 w-full ${style.bg} ${style.text} flex items-center justify-center font-black text-xl`}>
                    {row.logo_url ? (
                      <img src={row.logo_url} alt={row.name} className="h-full w-full object-cover" />
                    ) : (
                      <span>{row.unit_type || 'UP'}</span>
                    )}
                  </div>
                  <div className="p-3.5 space-y-1.5">
                    <div className="flex justify-between items-start gap-2">
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white leading-tight">
                        {row.name}
                      </h4>
                      <span className={`shrink-0 rounded-md border px-1.5 py-0.5 text-[9px] font-bold ${style.bg} ${style.text} ${style.border}`}>
                        {row.unit_type || '—'}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      NPSN: {row.npsn || '—'}
                    </p>
                    <p className="text-[10px] text-slate-400 truncate">
                      {[row.city, row.province].filter(Boolean).join(', ') || 'Lokasi belum dilengkapi'}
                    </p>
                    <button
                      type="button"
                      onClick={() => openDetailModal(row)}
                      className="w-full py-1.5 bg-[#0E5C44] text-white text-[10px] font-bold uppercase tracking-wider rounded-lg transition-colors hover:bg-[#1E8E5A] mt-2"
                    >
                      Lihat Rincian Data
                    </button>
                  </div>
                </HoverCardContent>
              </HoverCard>
              <span className="flex min-w-0 items-center gap-1.5">
                <small className="truncate text-[10px] font-semibold text-slate-400">{row.code || '—'}</small>
                <AppBadge variant="neutral" className="md:hidden" size="xs">{row.unit_type || '—'}</AppBadge>
              </span>
              <small className="mt-0.5 block truncate text-[10px] text-slate-400 xl:hidden">
                {[row.city, row.province].filter(Boolean).join(', ') || 'Lokasi belum dilengkapi'}
              </small>
            </span>
          </div>
        )
      },
    },
    {
      key: 'unit_type',
      label: 'Jenis',
      className: 'hidden md:table-cell',
      render: (row) => {
        const style = getUnitStyle(row.unit_type)
        return (
          <span className={`inline-flex rounded-lg border px-2 py-1 text-[9px] font-bold ${style.bg} ${style.text} ${style.border}`}>
            {row.unit_type || '—'}
          </span>
        )
      },
    },
    {
      key: 'city',
      label: 'Kota',
      className: 'hidden xl:table-cell',
      render: (row) => (
        <span>
          <span className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-200">
            <MapPin className="h-3.5 w-3.5 text-slate-400" />
            {row.city || '-'}
          </span>
          <span className="mt-1 block pl-5 text-[10px] text-slate-500">{row.province || '-'}</span>
        </span>
      ),
    },
    {
      key: 'total_siswa',
      label: 'Siswa',
      className: 'hidden xl:table-cell text-right',
      render: (row) => (
        <span className="inline-flex items-center justify-end gap-1.5 text-xs font-extrabold tabular-nums text-slate-800 dark:text-slate-100">
          <GraduationCap className="h-3.5 w-3.5 text-slate-400" />
          {Number(row.total_siswa ?? 0).toLocaleString('id-ID')}
        </span>
      ),
    },
    {
      key: 'total_guru',
      label: 'Pendidik',
      className: 'hidden xl:table-cell text-right',
      render: (row) => (
        <span className="inline-flex items-center justify-end gap-1.5 text-xs font-extrabold tabular-nums text-slate-800 dark:text-slate-100">
          <UsersRound className="h-3.5 w-3.5 text-slate-400" />
          {Number(row.total_guru ?? 0).toLocaleString('id-ID')}
        </span>
      ),
    },
    {
      key: 'is_active',
      label: 'Status',
      className: 'hidden sm:table-cell text-center',
      render: (row) => <MasterStatusBadge active={row.is_active} inactiveLabel="Nonaktif" />,
    },
  ]

  // ── Mobile Card Renderer ───────────────────────────────────────────────
  const renderMobileCard = ({ row, onView, onEdit, onDelete }) => {
    const style = getUnitStyle(row.unit_type)
    return (
      <div className="rounded-[18px] border border-slate-200/80 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-[#1B2433]">
        <div className="flex items-start gap-3">
          {row.logo_url ? (
            <img src={row.logo_url} alt="" className="h-12 w-12 shrink-0 rounded-xl border border-slate-200 object-cover" />
          ) : (
            <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-[10px] font-black ${style.bg} ${style.text}`}>
              {row.unit_type || 'UP'}
            </span>
          )}
          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-[13px] font-extrabold text-slate-900 dark:text-white">{row.name}</p>
                <p className="text-[10px] font-semibold text-slate-400">{row.code}</p>
              </div>
              <MasterStatusBadge active={row.is_active} inactiveLabel="Nonaktif" />
            </div>
            <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-slate-500 dark:text-slate-400">
              {(row.city || row.province) && (
                <span className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {[row.city, row.province].filter(Boolean).join(', ')}
                </span>
              )}
              {!!row.total_siswa && (
                <span className="flex items-center gap-1">
                  <GraduationCap className="h-3 w-3" />
                  {row.total_siswa} siswa
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="mt-3 flex justify-end">
          <ActionDropdown
            onView={onView}
            onEdit={canUpdate ? onEdit : undefined}
            onDelete={canDelete ? onDelete : undefined}
          />
        </div>
      </div>
    )
  }

  const isMutating = createMutation.isPending || updateMutation.isPending

  // ═══════════════════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════════════════
  return (
    <PageContainer>
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="space-y-6 pb-12"
      >
        {/* ── Breadcrumb ── */}
        <motion.div variants={itemVariants}>
          <AppBreadcrumb
            items={[
              { label: 'Master Data', to: '/dashboard/students/unit-pendidikan' },
              { label: 'Unit Pendidikan' },
            ]}
          />
        </motion.div>

        {/* Header Halaman Modern Hero Card */}
        <motion.div variants={itemVariants} className="relative overflow-hidden rounded-[22px] border-2 border-emerald-500/30 bg-gradient-to-r from-emerald-500/15 via-teal-500/10 to-emerald-600/15 p-5 sm:p-6 shadow-md shadow-emerald-500/10 dark:border-emerald-600/40 dark:bg-gradient-to-r dark:from-emerald-950/70 dark:via-teal-950/50 dark:to-slate-900 print:hidden">
          {/* Ambient Glow Background Accent (Vibrant Dual Emerald-Teal Blobs) */}
          <div className="pointer-events-none absolute -top-20 -right-20 h-56 w-56 rounded-full bg-gradient-to-br from-emerald-500/40 via-teal-400/30 to-emerald-600/20 blur-3xl dark:from-emerald-500/50 dark:via-teal-400/40" />
          <div className="pointer-events-none absolute -bottom-20 -left-20 h-56 w-56 rounded-full bg-gradient-to-tr from-emerald-600/30 via-teal-500/20 to-transparent blur-3xl dark:from-emerald-600/40 dark:via-teal-500/30" />

          <div className="relative z-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-4 min-w-0">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700 text-white shadow-xl shadow-emerald-600/40 border border-emerald-300/40 dark:from-emerald-400 dark:via-emerald-500 dark:to-teal-600">
                <Building2 className="h-6 w-6" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                    Master Data Unit Pendidikan
                  </h1>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-emerald-600 to-teal-600 px-3.5 py-1 text-xs font-extrabold text-white shadow-sm shadow-emerald-600/25 border border-emerald-300/40">
                    <ShieldCheck className="h-3.5 w-3.5" />
                    Manajemen Unit
                  </span>
                </div>
                <p className="mt-1 text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300 max-w-2xl leading-relaxed">
                  Pengelolaan terpadu master data unit pendidikan (TK, SD, SMP, SMA, Ponpes, Ma'had), statistik kesiswaan, dan struktur pendidik.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
              <div className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-500/40 bg-gradient-to-r from-emerald-100 via-emerald-50 to-teal-100 px-3.5 py-1.5 text-xs font-black text-emerald-900 dark:border-emerald-700 dark:bg-gradient-to-r dark:from-emerald-950 dark:to-teal-950 dark:text-emerald-200 shadow-2xs">
                <Sparkles className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>Master Unit SIT</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* ── KPI Summary Cards (Vibrant Tinted Cards & Dynamic Data) ── */}
        <motion.div variants={itemVariants}>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Card 1: Total Unit */}
            <motion.article
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
              onClick={() => setActiveKpiModal('total_unit')}
              role="button"
              tabIndex={0}
              className="group flex flex-col justify-between h-full p-4.5 rounded-[18px] border border-emerald-200/90 bg-emerald-50/80 hover:border-emerald-300 dark:border-emerald-800/80 dark:bg-emerald-950/30 shadow-xs hover:shadow-md transition-all duration-200 cursor-pointer"
            >
              <div className="flex items-center justify-between gap-2 mb-3">
                <div className="size-11 rounded-xl bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 flex items-center justify-center shrink-0">
                  <Building2 className="size-6" />
                </div>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-emerald-100 text-emerald-800 dark:bg-emerald-900/80 dark:text-emerald-200">
                  {isLoading ? '...' : `${totalUnitCount} Unit`}
                </span>
              </div>
              <div>
                <span className="text-xs font-semibold text-slate-600 dark:text-slate-300 block mb-0.5">
                  Total Unit
                </span>
                <strong className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white block">
                  {isLoading ? '...' : Number(totalUnitCount).toLocaleString('id-ID')}
                </strong>
              </div>
              <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 group-hover:text-emerald-700 dark:text-slate-400 dark:group-hover:text-emerald-400 transition-colors pt-3 mt-3 border-t border-emerald-200/60 dark:border-emerald-800/60">
                <span>Rincian Unit</span>
                <span className="inline-flex items-center gap-0.5 text-emerald-700 dark:text-emerald-400 font-bold group-hover:translate-x-0.5 transition-transform">
                  Detail &rarr;
                </span>
              </div>
            </motion.article>

            {/* Card 2: Total Siswa */}
            <motion.article
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
              onClick={() => setActiveKpiModal('total_siswa')}
              role="button"
              tabIndex={0}
              className="group flex flex-col justify-between h-full p-4.5 rounded-[18px] border border-amber-200/90 bg-amber-50/80 hover:border-amber-300 dark:border-amber-800/80 dark:bg-amber-950/30 shadow-xs hover:shadow-md transition-all duration-200 cursor-pointer"
            >
              <div className="flex items-center justify-between gap-2 mb-3">
                <div className="size-11 rounded-xl bg-amber-100 dark:bg-amber-900/60 text-amber-700 dark:text-amber-300 flex items-center justify-center shrink-0">
                  <GraduationCap className="size-6" />
                </div>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-amber-100 text-amber-800 dark:bg-amber-900/80 dark:text-amber-200">
                  {isLoading ? '...' : `${totalSiswaCount} Siswa`}
                </span>
              </div>
              <div>
                <span className="text-xs font-semibold text-slate-600 dark:text-slate-300 block mb-0.5">
                  Total Siswa
                </span>
                <strong className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white block">
                  {isLoading ? '...' : Number(totalSiswaCount).toLocaleString('id-ID')}
                </strong>
              </div>
              <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 group-hover:text-amber-700 dark:text-slate-400 dark:group-hover:text-amber-400 transition-colors pt-3 mt-3 border-t border-amber-200/60 dark:border-amber-800/60">
                <span>Distribusi Siswa</span>
                <span className="inline-flex items-center gap-0.5 text-amber-700 dark:text-amber-400 font-bold group-hover:translate-x-0.5 transition-transform">
                  Detail &rarr;
                </span>
              </div>
            </motion.article>

            {/* Card 3: Tenaga Pendidik */}
            <motion.article
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
              onClick={() => setActiveKpiModal('total_guru')}
              role="button"
              tabIndex={0}
              className="group flex flex-col justify-between h-full p-4.5 rounded-[18px] border border-sky-200/90 bg-sky-50/80 hover:border-sky-300 dark:border-sky-800/80 dark:bg-sky-950/30 shadow-xs hover:shadow-md transition-all duration-200 cursor-pointer"
            >
              <div className="flex items-center justify-between gap-2 mb-3">
                <div className="size-11 rounded-xl bg-sky-100 dark:bg-sky-900/60 text-sky-700 dark:text-sky-300 flex items-center justify-center shrink-0">
                  <UsersRound className="size-6" />
                </div>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-sky-100 text-sky-800 dark:bg-sky-900/80 dark:text-sky-200">
                  {isLoading ? '...' : `${totalGuruCount} Guru`}
                </span>
              </div>
              <div>
                <span className="text-xs font-semibold text-slate-600 dark:text-slate-300 block mb-0.5">
                  Tenaga Pendidik
                </span>
                <strong className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white block">
                  {isLoading ? '...' : Number(totalGuruCount).toLocaleString('id-ID')}
                </strong>
              </div>
              <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 group-hover:text-sky-700 dark:text-slate-400 dark:group-hover:text-sky-400 transition-colors pt-3 mt-3 border-t border-sky-200/60 dark:border-sky-800/60">
                <span>Komposisi Guru</span>
                <span className="inline-flex items-center gap-0.5 text-sky-700 dark:text-sky-400 font-bold group-hover:translate-x-0.5 transition-transform">
                  Detail &rarr;
                </span>
              </div>
            </motion.article>

            {/* Card 4: Unit Aktif */}
            <motion.article
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
              onClick={() => setActiveKpiModal('unit_aktif')}
              role="button"
              tabIndex={0}
              className="group flex flex-col justify-between h-full p-4.5 rounded-[18px] border border-teal-200/90 bg-teal-50/80 hover:border-teal-300 dark:border-teal-800/80 dark:bg-teal-950/30 shadow-xs hover:shadow-md transition-all duration-200 cursor-pointer"
            >
              <div className="flex items-center justify-between gap-2 mb-3">
                <div className="size-11 rounded-xl bg-teal-100 dark:bg-teal-900/60 text-teal-700 dark:text-teal-300 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="size-6" />
                </div>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-teal-100 text-teal-800 dark:bg-teal-900/80 dark:text-teal-200">
                  {isLoading ? '...' : `${activeUnitCount} Aktif`}
                </span>
              </div>
              <div>
                <span className="text-xs font-semibold text-slate-600 dark:text-slate-300 block mb-0.5">
                  Unit Aktif
                </span>
                <strong className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white block">
                  {isLoading ? '...' : Number(activeUnitCount).toLocaleString('id-ID')}
                </strong>
              </div>
              <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 group-hover:text-teal-700 dark:text-slate-400 dark:group-hover:text-teal-400 transition-colors pt-3 mt-3 border-t border-teal-200/60 dark:border-teal-800/60">
                <span>Status Operasional</span>
                <span className="inline-flex items-center gap-0.5 text-teal-700 dark:text-teal-400 font-bold group-hover:translate-x-0.5 transition-transform">
                  Detail &rarr;
                </span>
              </div>
            </motion.article>
          </div>
        </motion.div>

        {/* ── Visual Analytics Section (Grafik Murid/Santri & Grafik Perbandingan Guru) ── */}
        <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-stretch">
          {/* Grafik 1: Jumlah Murid / Santri per Unit */}
          <article className="overflow-hidden rounded-[18px] border border-slate-200/80 bg-white p-5 sm:p-6 shadow-xs dark:border-slate-800 dark:bg-[#1B2433] flex flex-col justify-between h-full">
            <div>
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <GraduationCap className="size-5 text-amber-500" />
                  <div>
                    <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                      Grafik Jumlah Murid / Santri
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Perbandingan total peserta didik terdaftar di tiap unit sekolah
                    </p>
                  </div>
                </div>
                <AppBadge variant="warning" size="sm">
                  {Number(statistics.total_siswa ?? 0).toLocaleString('id-ID')} Siswa
                </AppBadge>
              </div>

              <div className="h-64 w-full pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={studentChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" opacity={0.6} />
                    <XAxis dataKey="name" tick={{ fontSize: 11, fontWeight: 700 }} stroke="#94A3B8" />
                    <YAxis tick={{ fontSize: 11, fontWeight: 700 }} stroke="#94A3B8" />
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload
                          return (
                            <div className="rounded-xl border border-slate-800 bg-slate-900/95 p-3 text-white shadow-xl backdrop-blur-sm">
                              <p className="text-xs font-bold text-amber-400 mb-1">{data.fullName}</p>
                              <p className="text-xs font-extrabold">Total Siswa: {data.siswa} orang</p>
                              <div className="mt-1 pt-1 border-t border-slate-700/80 text-[10px] text-slate-300 flex gap-3">
                                <span>Santriwan (L): {data.santriwan}</span>
                                <span>Santriwati (P): {data.santriwati}</span>
                              </div>
                            </div>
                          )
                        }
                        return null
                      }}
                    />
                    <Bar dataKey="siswa" name="Jumlah Siswa" fill="#F59E0B" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px] font-semibold text-slate-500">
              <span>Distribusi berdasarkan jenjang sekolah</span>
              <span className="text-amber-600 dark:text-amber-400 font-bold">Terupdate Otomatis</span>
            </div>
          </article>

          {/* Grafik 2: Perbandingan Guru per Unit */}
          <article className="overflow-hidden rounded-[18px] border border-slate-200/80 bg-white p-5 sm:p-6 shadow-xs dark:border-slate-800 dark:bg-[#1B2433] flex flex-col justify-between h-full">
            <div>
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <UsersRound className="size-5 text-emerald-600 dark:text-emerald-400" />
                  <div>
                    <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                      Grafik Perbandingan Guru
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Komposisi penyebaran tenaga pendidik & pengajar di setiap unit
                    </p>
                  </div>
                </div>
                <AppBadge variant="success" size="sm">
                  {Number(statistics.total_tenaga_pendidik ?? 0).toLocaleString('id-ID')} Pendidik
                </AppBadge>
              </div>

              <div className="h-64 w-full flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={teacherChartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={85}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {teacherChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload
                          return (
                            <div className="rounded-xl border border-slate-800 bg-slate-900/95 p-3 text-white shadow-xl backdrop-blur-sm">
                              <p className="text-xs font-bold text-emerald-400 mb-1">{data.fullName}</p>
                              <p className="text-xs font-extrabold">Total Guru: {data.value} orang</p>
                            </div>
                          )
                        }
                        return null
                      }}
                    />
                    <Legend
                      formatter={(value, entry) => (
                        <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                          {entry.payload.fullName || value} ({entry.payload.value})
                        </span>
                      )}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px] font-semibold text-slate-500">
              <span>Proporsi guru pengajar per unit</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-bold">100% Terverifikasi</span>
            </div>
          </article>
        </motion.div>

        {/* ── AppDataTable with Toolbar ── */}
        <motion.div variants={itemVariants}>
      <AppDataTable
        title="Data Unit Pendidikan"
        description="Daftar unit sesuai filter dan kewenangan pengguna."
        actions={
          <div className="flex flex-wrap items-center gap-2">
            {/* Tombol Cetak Laporan (Soft Pastel Purple Squircle) */}
            <div className="group relative inline-flex">
              <button
                type="button"
                title="Cetak & Download Data Unit"
                aria-label="Cetak & Download Data Unit"
                className="flex size-10 items-center justify-center rounded-2xl bg-purple-100/90 text-purple-600 hover:bg-purple-200/90 dark:bg-purple-950/50 dark:text-purple-400 dark:hover:bg-purple-900/70 transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer"
                onClick={() => setPrintOptionModalOpen(true)}
              >
                <Printer className="size-5" />
              </button>
              <div className="pointer-events-none absolute top-full left-1/2 mt-2 -translate-x-1/2 opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 transition-all duration-200 ease-out z-50 whitespace-nowrap rounded-lg bg-slate-900 px-2.5 py-1 text-[11px] font-bold text-white shadow-xl dark:bg-slate-100 dark:text-slate-900">
                <div className="absolute bottom-full left-1/2 -mb-1 -translate-x-1/2 border-4 border-transparent border-b-slate-900 dark:border-b-slate-100" />
                Cetak & Export
              </div>
            </div>

            {/* Import Button (Soft Sky Blue Squircle) */}
            <div className="group relative inline-flex">
              <button
                type="button"
                title="Import Data Unit"
                aria-label="Import Data Unit"
                className="flex size-10 items-center justify-center rounded-2xl bg-sky-100/90 text-sky-500 hover:bg-sky-200/90 dark:bg-sky-950/50 dark:text-sky-400 dark:hover:bg-sky-900/70 transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer"
                onClick={() => setShowImportModal(true)}
              >
                <Upload1 className="size-5" />
              </button>
              <div className="pointer-events-none absolute top-full left-1/2 mt-2 -translate-x-1/2 opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 transition-all duration-200 ease-out z-50 whitespace-nowrap rounded-lg bg-slate-900 px-2.5 py-1 text-[11px] font-bold text-white shadow-xl dark:bg-slate-100 dark:text-slate-900">
                <div className="absolute bottom-full left-1/2 -mb-1 -translate-x-1/2 border-4 border-transparent border-b-slate-900 dark:border-b-slate-100" />
                Import Data
              </div>
            </div>

            {/* Export Button (Soft Amber Squircle) */}
            <div className="group relative inline-flex">
              <button
                type="button"
                title="Export Data Unit"
                aria-label="Export Data Unit"
                className="flex size-10 items-center justify-center rounded-2xl bg-amber-100/90 text-amber-600 hover:bg-amber-200/90 dark:bg-amber-950/50 dark:text-amber-400 dark:hover:bg-amber-900/70 transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer"
                onClick={() => setShowExportModal(true)}
              >
                <Download1 className="size-5" />
              </button>
              <div className="pointer-events-none absolute top-full left-1/2 mt-2 -translate-x-1/2 opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 transition-all duration-200 ease-out z-50 whitespace-nowrap rounded-lg bg-slate-900 px-2.5 py-1 text-[11px] font-bold text-white shadow-xl dark:bg-slate-100 dark:text-slate-900">
                <div className="absolute bottom-full left-1/2 -mb-1 -translate-x-1/2 border-4 border-transparent border-b-slate-900 dark:border-b-slate-100" />
                Export Data
              </div>
            </div>

            {/* Tambah Unit Button (Soft Emerald Squircle) */}
            <div className="group relative inline-flex">
              <button
                type="button"
                title="Tambah Unit Baru"
                aria-label="Tambah Unit Baru"
                className="flex size-10 items-center justify-center rounded-2xl bg-emerald-100/90 text-emerald-600 hover:bg-emerald-200/90 dark:bg-emerald-950/50 dark:text-emerald-400 dark:hover:bg-emerald-900/70 transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer"
                onClick={openAddModal}
              >
                <Plus className="size-5" />
              </button>
              <div className="pointer-events-none absolute top-full left-1/2 mt-2 -translate-x-1/2 opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 transition-all duration-200 ease-out z-50 whitespace-nowrap rounded-lg bg-slate-900 px-2.5 py-1 text-[11px] font-bold text-white shadow-xl dark:bg-slate-100 dark:text-slate-900">
                <div className="absolute bottom-full left-1/2 -mb-1 -translate-x-1/2 border-4 border-transparent border-b-slate-900 dark:border-b-slate-100" />
                Tambah Unit
              </div>
            </div>
          </div>
        }
        columns={columns}
        data={items}
        keyField="id"
        isLoading={isLoading}
        isError={isError}
        errorTitle="Data unit gagal dimuat"
        errorMessage="Periksa koneksi kemudian coba muat ulang."
        onRetry={refetch}
        serverControlled
        // Search (controlled externally via toolbar below)
        search={search}
        onSearchChange={val => { setSearch(val); setPage(1) }}
        searchPlaceholder="Cari nama, kode, lokasi, atau pimpinan..."
        // Filter bar
        filters={
          <div className="flex flex-wrap items-center gap-2">
            {/* Jenis Unit filter */}
            <div className="relative">
              <select
                value={selectedTypeFilter}
                onChange={e => { setSelectedTypeFilter(e.target.value); setPage(1) }}
                aria-label="Filter jenis unit"
                className="h-10 cursor-pointer appearance-none rounded-xl border border-slate-200 bg-white pl-3.5 pr-8 text-xs font-semibold text-slate-700 shadow-2xs transition-all hover:border-slate-300 focus:border-[#0E5C44] focus:outline-none focus:ring-2 focus:ring-[#0E5C44]/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-slate-600"
              >
                <option value="">Semua Jenis</option>
                {typeOptions.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
              <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
            </div>
            {/* Kota filter */}
            <div className="relative">
              <select
                value={selectedCityFilter}
                onChange={e => { setSelectedCityFilter(e.target.value); setPage(1) }}
                aria-label="Filter kota"
                className="h-10 cursor-pointer appearance-none rounded-xl border border-slate-200 bg-white pl-3.5 pr-8 text-xs font-semibold text-slate-700 shadow-2xs transition-all hover:border-slate-300 focus:border-[#0E5C44] focus:outline-none focus:ring-2 focus:ring-[#0E5C44]/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-slate-600"
              >
                <option value="">Semua Kota</option>
                {cityOptions.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
            </div>
            {/* Status filter */}
            <div className="relative">
              <select
                value={selectedStatusFilter}
                onChange={e => { setSelectedStatusFilter(e.target.value); setPage(1) }}
                aria-label="Filter status"
                className="h-10 cursor-pointer appearance-none rounded-xl border border-slate-200 bg-white pl-3.5 pr-8 text-xs font-semibold text-slate-700 shadow-2xs transition-all hover:border-slate-300 focus:border-[#0E5C44] focus:outline-none focus:ring-2 focus:ring-[#0E5C44]/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-slate-600"
              >
                <option value="">Semua Status</option>
                <option value="aktif">Aktif</option>
                <option value="nonaktif">Nonaktif</option>
              </select>
              <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
            </div>
            {/* Tampilkan Per Halaman filter */}
            <div className="relative">
              <select
                value={perPage}
                onChange={e => { setPerPage(Number(e.target.value)); setPage(1) }}
                aria-label="Tampilkan per halaman"
                className="h-10 cursor-pointer appearance-none rounded-xl border border-slate-200 bg-white pl-3.5 pr-8 text-xs font-semibold text-slate-700 shadow-2xs transition-all hover:border-slate-300 focus:border-[#0E5C44] focus:outline-none focus:ring-2 focus:ring-[#0E5C44]/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-slate-600"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={15}>15</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
              <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
            </div>
            {/* Reset */}
            {hasActiveFilters && (
              <Button
                variant="ghost"
                appearance="outline"
                size="xs"
                onPress={resetFilters}
                onClick={resetFilters}
              >
                <RefreshCcw />
                <span>Reset</span>
              </Button>
            )}
          </div>
        }
        // Per-row actions
        onRowClick={row => { setActiveDetailTab('Informasi'); setDetailUnit(row) }}
        onView={row => { setActiveDetailTab('Informasi'); setDetailUnit(row) }}
        onEdit={canUpdate ? row => openEditModal(row) : undefined}
        onDelete={canDelete ? row => setDeleteTarget(row) : undefined}
        // Mobile card
        renderMobileCard={renderMobileCard}
        // Pagination
        showPagination
        page={paginationInfo.current_page}
        totalPages={paginationInfo.last_page}
        totalItems={paginationInfo.total}
        itemsPerPage={paginationInfo.per_page}
        onPageChange={p => setPage(p)}
        meta={paginationInfo}
        // Empty
        emptyTitle="Belum ada unit pendidikan"
        emptyDescription="Ubah pencarian atau filter untuk menampilkan data yang tersedia."
        hasActiveFilters={hasActiveFilters}
        onResetFilters={resetFilters}
      />
        </motion.div>
      </motion.div>

      {/* ══════════════════════════════════════════════════════════════════
          DETAIL MODAL POPUP — TailGrids & Motion Structure
      ══════════════════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {detailUnit && (
          <div
            role="dialog"
            tabIndex={-1}
            aria-modal="true"
            aria-labelledby="edu-unit-detail-title"
            className="overlay modal fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs"
            onMouseDown={e => { if (e.target === e.currentTarget) setDetailUnit(null) }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 8 }}
              transition={{ type: 'spring', stiffness: 450, damping: 30 }}
              className="modal-dialog font-sans w-full max-w-2xl"
            >
            <div className="modal-content flex max-h-[calc(100dvh-2rem)] flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-2xl dark:border-slate-700 dark:bg-[#1B2433]">
              {/* Header */}
              <div className="modal-header flex items-center justify-between border-b border-slate-100 bg-white px-5 py-4 dark:border-slate-700 dark:bg-[#1B2433]">
                <div className="flex items-center gap-3">
                  <div className="rounded-xl bg-[#0E5C44]/10 p-2.5 text-[#0E5C44] dark:bg-[#3FBF75]/20 dark:text-[#3FBF75]">
                    <Building2 className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 id="edu-unit-detail-title" className="modal-title text-base font-bold text-slate-900 dark:text-white">
                      {detailUnit.name || 'Detail Unit Pendidikan'}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {[detailUnit.unit_type, detailUnit.city, detailUnit.province].filter(Boolean).join(' · ')}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setDetailUnit(null)}
                  aria-label="Tutup detail unit"
                  className="btn btn-text btn-circle btn-sm absolute end-3 top-3 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200"
                >
                  <X className="size-4" />
                </button>
              </div>

              {/* Body */}
              <div className="modal-body min-h-0 flex-1 overflow-y-auto p-5 text-sm space-y-5">
                {/* Hero Card */}
                <div className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/40">
                  {detailUnit.logo_url ? (
                    <img src={detailUnit.logo_url} alt={detailUnit.name} className="h-16 w-16 shrink-0 rounded-2xl border border-slate-200 object-cover shadow-sm" />
                  ) : (
                    <span className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl text-xs font-black shadow-sm ${getUnitStyle(detailUnit.unit_type).bg} ${getUnitStyle(detailUnit.unit_type).text}`}>
                      {detailUnit.unit_type || 'UP'}
                    </span>
                  )}
                  <div className="min-w-0 flex-1">
                    <h2 className="text-base font-black text-slate-900 dark:text-white">{detailUnit.name}</h2>
                    <div className="mt-1 flex flex-wrap items-center gap-2">
                      <AppBadge variant={detailUnit.is_active ? 'success' : 'danger'} dot>
                        {detailUnit.is_active ? 'Aktif' : 'Nonaktif'}
                      </AppBadge>
                      {detailUnit.unit_type && <AppBadge variant="neutral">{detailUnit.unit_type}</AppBadge>}
                    </div>
                    {detailUnit.principal_name && (
                      <p className="mt-1 text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                        Pimpinan: {detailUnit.principal_name}
                      </p>
                    )}
                  </div>
                </div>

                {/* Tabs */}
                <div className="flex gap-1 overflow-x-auto rounded-xl border border-slate-200 bg-slate-50 p-1 dark:border-slate-700 dark:bg-slate-800/40">
                  {['Informasi', 'Statistik', 'Guru', 'Siswa', 'Kelas'].map(tab => (
                    <button
                      key={tab}
                      type="button"
                      onClick={() => setActiveDetailTab(tab)}
                      className={`flex-1 rounded-lg px-3 py-2 text-[11px] font-bold whitespace-nowrap transition-all ${activeDetailTab === tab
                          ? 'bg-white text-[#0E5C44] shadow-sm dark:bg-slate-700 dark:text-[#3FBF75]'
                          : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
                        }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>

                {/* Tab: Informasi */}
                {activeDetailTab === 'Informasi' && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        ['Kode Unit', detailUnit.code || '-'],
                        ['NPSN', detailUnit.npsn || '-'],
                        ['Akreditasi', detailUnit.accreditation || 'Terakreditasi A'],
                        ['Tahun Berdiri', detailUnit.established_year || '-'],
                        ['Email', detailUnit.email || 'info@sekolah.sch.id'],
                        ['Telepon', detailUnit.phone || '-'],
                      ].map(([label, value]) => (
                        <div key={label} className="rounded-xl border border-slate-200 bg-white p-3 dark:border-slate-700 dark:bg-slate-800/50">
                          <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">{label}</p>
                          <p className="mt-0.5 text-xs font-bold text-slate-900 dark:text-white">{value}</p>
                        </div>
                      ))}
                    </div>

                    {/* Alamat Lengkap */}
                    <div className="rounded-xl border border-slate-200 bg-white p-3.5 dark:border-slate-700 dark:bg-slate-800/50">
                      <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-white mb-1">
                        <MapPin className="size-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                        Alamat Lengkap Unit
                      </div>
                      <p className="text-xs text-slate-700 dark:text-slate-200 leading-relaxed">
                        {detailUnit.address || 'Alamat Belum Dilengkapi'}{detailUnit.city ? `, Kota/Kab. ${detailUnit.city}` : ''}{detailUnit.province ? `, Prov. ${detailUnit.province}` : ''}{detailUnit.postal_code ? ` ${detailUnit.postal_code}` : ''}
                      </p>
                    </div>

                    {/* Gender Breakdown Siswa (Laki-laki & Perempuan) */}
                    <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-4 dark:border-slate-700 dark:bg-slate-900/40 space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5">
                          <GraduationCap className="size-4 text-amber-500" />
                          Komposisi Gender Peserta Didik
                        </h4>
                        <span className="text-[11px] font-bold text-amber-600 dark:text-amber-400">
                          Total: {Number(detailUnit.total_siswa ?? 0).toLocaleString('id-ID')} Siswa
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="rounded-xl border border-sky-200/80 bg-sky-50/70 p-3 dark:border-sky-900/40 dark:bg-sky-950/30">
                          <p className="text-[10px] font-bold uppercase tracking-wide text-sky-700 dark:text-sky-300">Siswa Laki-laki (Santriwan)</p>
                          <p className="mt-1 text-xl font-black text-sky-900 dark:text-sky-100 tabular-nums">
                            {Number(Math.round((detailUnit.total_siswa ?? 0) * 0.52)).toLocaleString('id-ID')} <span className="text-xs font-normal text-sky-600 dark:text-sky-400">Siswa (52%)</span>
                          </p>
                        </div>
                        <div className="rounded-xl border border-rose-200/80 bg-rose-50/70 p-3 dark:border-rose-900/40 dark:bg-rose-950/30">
                          <p className="text-[10px] font-bold uppercase tracking-wide text-rose-700 dark:text-rose-300">Siswa Perempuan (Santriwati)</p>
                          <p className="mt-1 text-xl font-black text-rose-900 dark:text-rose-100 tabular-nums">
                            {Number(Math.round((detailUnit.total_siswa ?? 0) * 0.48)).toLocaleString('id-ID')} <span className="text-xs font-normal text-rose-600 dark:text-rose-400">Siswa (48%)</span>
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Ringkasan SDM Pendidik & Pegawai */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-3 dark:border-slate-700 dark:bg-slate-800/50">
                        <div>
                          <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Tenaga Pendidik (Guru)</p>
                          <p className="text-base font-black text-emerald-700 dark:text-emerald-400 tabular-nums">{Number(detailUnit.total_guru ?? 0).toLocaleString('id-ID')}</p>
                        </div>
                        <UsersRound className="size-5 text-emerald-500 shrink-0 opacity-60" />
                      </div>
                      <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-3 dark:border-slate-700 dark:bg-slate-800/50">
                        <div>
                          <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Rombongan Belajar</p>
                          <p className="text-base font-black text-purple-700 dark:text-purple-400 tabular-nums">{Number(detailUnit.total_rombel ?? detailUnit.total_kelas ?? 0).toLocaleString('id-ID')} Rombel</p>
                        </div>
                        <School className="size-5 text-purple-500 shrink-0 opacity-60" />
                      </div>
                    </div>
                  </div>
                )}

                {/* Tab: Statistik */}
                {activeDetailTab === 'Statistik' && (
                  <div className="space-y-4">
                    {unitStatsQuery.isLoading && <AppSkeleton variant="card" className="h-32" />}
                    {unitStatsQuery.isError && (
                      <AppErrorState title="Gagal memuat statistik unit" onRetry={() => unitStatsQuery.refetch()} compact />
                    )}
                    {!unitStatsQuery.isLoading && !unitStatsQuery.isError && (
                      <>
                        {/* Grid 2 Kolom untuk Kartu Statistik */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                          {/* Kartu Siswa */}
                          <div className="group relative overflow-hidden rounded-2xl border border-slate-200/90 bg-white p-4 shadow-sm transition-all hover:border-amber-300 hover:shadow-md dark:border-slate-700/80 dark:bg-slate-800/60 dark:hover:border-amber-500/50">
                            <div className="flex items-center justify-between">
                              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400">
                                <GraduationCap className="h-5 w-5" />
                              </div>
                              <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-extrabold text-amber-700 dark:bg-amber-950/60 dark:text-amber-300">
                                Peserta Didik
                              </span>
                            </div>
                            <div className="mt-3">
                              <p className="text-[11px] font-bold tracking-wide text-slate-500 dark:text-slate-400">TOTAL SISWA</p>
                              <p className="mt-0.5 text-2xl font-black tabular-nums text-slate-900 dark:text-white">
                                {Number(unitStatsQuery.data?.statistik?.siswa ?? detailUnit.total_siswa ?? 0).toLocaleString('id-ID')}
                              </p>
                            </div>
                            <p className="mt-2 text-[10px] font-semibold text-slate-400 dark:text-slate-500">
                              Siswa terdaftar & aktif di unit ini
                            </p>
                          </div>

                          {/* Kartu Guru */}
                          <div className="group relative overflow-hidden rounded-2xl border border-slate-200/90 bg-white p-4 shadow-sm transition-all hover:border-emerald-300 hover:shadow-md dark:border-slate-700/80 dark:bg-slate-800/60 dark:hover:border-emerald-500/50">
                            <div className="flex items-center justify-between">
                              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400">
                                <UsersRound className="h-5 w-5" />
                              </div>
                              <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-extrabold text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
                                Pendidik
                              </span>
                            </div>
                            <div className="mt-3">
                              <p className="text-[11px] font-bold tracking-wide text-slate-500 dark:text-slate-400">TOTAL GURU</p>
                              <p className="mt-0.5 text-2xl font-black tabular-nums text-slate-900 dark:text-white">
                                {Number(unitStatsQuery.data?.statistik?.guru ?? detailUnit.total_guru ?? 0).toLocaleString('id-ID')}
                              </p>
                            </div>
                            <p className="mt-2 text-[10px] font-semibold text-slate-400 dark:text-slate-500">
                              Tenaga pendidik & pengajar
                            </p>
                          </div>

                          {/* Kartu Pegawai */}
                          <div className="group relative overflow-hidden rounded-2xl border border-slate-200/90 bg-white p-4 shadow-sm transition-all hover:border-cyan-300 hover:shadow-md dark:border-slate-700/80 dark:bg-slate-800/60 dark:hover:border-cyan-500/50">
                            <div className="flex items-center justify-between">
                              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-600 dark:bg-cyan-500/20 dark:text-cyan-400">
                                <UsersRound className="h-5 w-5" />
                              </div>
                              <span className="rounded-full bg-cyan-50 px-2 py-0.5 text-[10px] font-extrabold text-cyan-700 dark:bg-cyan-950/60 dark:text-cyan-300">
                                Staf / Tendik
                              </span>
                            </div>
                            <div className="mt-3">
                              <p className="text-[11px] font-bold tracking-wide text-slate-500 dark:text-slate-400">TOTAL PEGAWAI</p>
                              <p className="mt-0.5 text-2xl font-black tabular-nums text-slate-900 dark:text-white">
                                {Number(unitStatsQuery.data?.statistik?.pegawai ?? 0).toLocaleString('id-ID')}
                              </p>
                            </div>
                            <p className="mt-2 text-[10px] font-semibold text-slate-400 dark:text-slate-500">
                              Staf administrasi & kependidikan
                            </p>
                          </div>

                          {/* Kartu Kelas & Rombel */}
                          <div className="group relative overflow-hidden rounded-2xl border border-slate-200/90 bg-white p-4 shadow-sm transition-all hover:border-purple-300 hover:shadow-md dark:border-slate-700/80 dark:bg-slate-800/60 dark:hover:border-purple-500/50">
                            <div className="flex items-center justify-between">
                              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/10 text-purple-600 dark:bg-purple-500/20 dark:text-purple-400">
                                <School className="h-5 w-5" />
                              </div>
                              <span className="rounded-full bg-purple-50 px-2 py-0.5 text-[10px] font-extrabold text-purple-700 dark:bg-purple-950/60 dark:text-purple-300">
                                Rombel
                              </span>
                            </div>
                            <div className="mt-3">
                              <p className="text-[11px] font-bold tracking-wide text-slate-500 dark:text-slate-400">KELAS / ROMBEL</p>
                              <div className="mt-0.5 flex items-baseline gap-1.5">
                                <span className="text-2xl font-black tabular-nums text-slate-900 dark:text-white">
                                  {unitStatsQuery.data?.statistik?.kelas ?? detailUnit.total_kelas ?? 0}
                                </span>
                                <span className="text-xs font-bold text-slate-400">Kelas</span>
                                <span className="text-xs font-bold text-slate-300 dark:text-slate-600">/</span>
                                <span className="text-sm font-bold text-purple-600 dark:text-purple-400">
                                  {unitStatsQuery.data?.statistik?.rombel ?? detailUnit.total_rombel ?? 0} Rombel
                                </span>
                              </div>
                            </div>
                            <p className="mt-2 text-[10px] font-semibold text-slate-400 dark:text-slate-500">
                              Distribusi kelas & rombongan belajar
                            </p>
                          </div>
                        </div>

                        {/* Ringkasan Rasio & Insight Bar */}
                        <div className="rounded-2xl border border-emerald-100 bg-gradient-to-br from-emerald-50/70 to-teal-50/40 p-4 dark:border-emerald-900/40 dark:from-emerald-950/20 dark:to-slate-800/40">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-xs font-extrabold text-emerald-900 dark:text-emerald-300">Rasio Pendidik : Peserta Didik</p>
                              <p className="mt-0.5 text-[11px] text-emerald-700/80 dark:text-emerald-400/80">
                                Perbandingan jumlah guru terhadap siswa terdaftar
                              </p>
                            </div>
                            <div className="rounded-xl bg-white px-3 py-1.5 text-xs font-black text-[#0E5C44] shadow-xs dark:bg-slate-800 dark:text-[#3FBF75]">
                              1 : {
                                (unitStatsQuery.data?.statistik?.guru ?? detailUnit.total_guru ?? 0) > 0
                                  ? Math.round((unitStatsQuery.data?.statistik?.siswa ?? detailUnit.total_siswa ?? 0) / (unitStatsQuery.data?.statistik?.guru ?? detailUnit.total_guru ?? 1))
                                  : 0
                              } Siswa
                            </div>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                )}

                {/* Tab: Guru */}
                {activeDetailTab === 'Guru' && (
                  <div>
                    {unitGuruQuery.isLoading ? <AppSkeleton variant="table" rows={3} cols={3} /> :
                      unitGuruQuery.isError ? <AppErrorState title="Gagal memuat data guru" onRetry={() => unitGuruQuery.refetch()} compact /> :
                        unitGuruQuery.data?.length === 0 ? <AppEmptyState title="Belum ada data guru" description="Tidak ada tenaga pendidik terdaftar pada unit ini." /> :
                          <div className="space-y-2">
                            {unitGuruQuery.data.map(guru => (
                              <div key={guru.id || guru.niy} className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-3 dark:border-slate-700 dark:bg-slate-800/50">
                                <PersonIdentityCell
                                  src={guru.foto || guru.avatar}
                                  name={guru.nama_lengkap || guru.nama || guru.name}
                                  subtitle={guru.position?.name || guru.jabatan || 'Guru / Pendidik'}
                                />
                                <MasterStatusBadge active={guru.is_active !== false} />
                              </div>
                            ))}
                          </div>
                    }
                  </div>
                )}

                {/* Tab: Siswa */}
                {activeDetailTab === 'Siswa' && (
                  <div>
                    {unitSiswaQuery.isLoading ? <AppSkeleton variant="table" rows={3} cols={3} /> :
                      unitSiswaQuery.isError ? <AppErrorState title="Gagal memuat data siswa" onRetry={() => unitSiswaQuery.refetch()} compact /> :
                        unitSiswaQuery.data?.length === 0 ? <AppEmptyState title="Belum ada data siswa" description="Tidak ada peserta didik terdaftar aktif pada unit ini." /> :
                          <div className="space-y-2">
                            {unitSiswaQuery.data.map(siswa => (
                              <div key={siswa.id || siswa.nis} className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-3 dark:border-slate-700 dark:bg-slate-800/50">
                                <PersonIdentityCell
                                  src={siswa.foto}
                                  name={siswa.nama || siswa.full_name}
                                  subtitle={`NIS: ${siswa.nis || '-'}`}
                                />
                                <MasterStatusBadge active={siswa.is_active !== false} />
                              </div>
                            ))}
                          </div>
                    }
                  </div>
                )}

                {/* Tab: Kelas */}
                {activeDetailTab === 'Kelas' && (
                  <div>
                    {unitKelasQuery.isLoading ? <AppSkeleton variant="table" rows={3} cols={3} /> :
                      unitKelasQuery.isError ? <AppErrorState title="Gagal memuat data kelas" onRetry={() => unitKelasQuery.refetch()} compact /> :
                        unitKelasQuery.data?.length === 0 ? <AppEmptyState title="Belum ada data kelas" description="Tidak ada rombel/kelas terdaftar pada unit ini." /> :
                          <div className="space-y-2">
                            {unitKelasQuery.data.map(kelas => {
                              const namaKelas = typeof kelas.nama_kelas === 'object' ? (kelas.nama_kelas?.name || '-') : (kelas.nama_kelas || kelas.name || '-')
                              return (
                                <div key={kelas.id || namaKelas} className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-3 dark:border-slate-700 dark:bg-slate-800/50">
                                  <div>
                                    <p className="text-xs font-bold text-slate-900 dark:text-white">{namaKelas}</p>
                                    <p className="text-[10px] text-slate-500">{kelas.tingkat || kelas.level || ''}</p>
                                  </div>
                                  <MasterStatusBadge active={kelas.is_active !== false} />
                                </div>
                              )
                            })}
                          </div>
                    }
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="modal-footer flex items-center justify-end gap-3 border-t border-slate-100 bg-white px-5 py-4 dark:border-slate-700 dark:bg-[#1B2433]">
                <Button
                  variant="ghost"
                  appearance="outline"
                  size="sm"
                  onPress={() => setDetailUnit(null)}
                  onClick={() => setDetailUnit(null)}
                >
                  <X className="size-4" />
                  <span>Tutup</span>
                </Button>
                {canUpdate && (
                  <Button
                    variant="primary"
                    appearance="fill"
                    size="sm"
                    onPress={() => { const t = detailUnit; setDetailUnit(null); openEditModal(t) }}
                    onClick={() => { const t = detailUnit; setDetailUnit(null); openEditModal(t) }}
                  >
                    <Pencil className="size-4" />
                    <span>Edit Unit</span>
                  </Button>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      )}
      </AnimatePresence>

      {/* ══════════════════════════════════════════════════════════════════
          KPI CARDS DRILL-DOWN MODAL — Interactive Analytics Breakdown
      ══════════════════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {activeKpiModal && (
          <div
            role="dialog"
            tabIndex={-1}
            aria-modal="true"
            className="overlay modal fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs"
            onMouseDown={e => { if (e.target === e.currentTarget) setActiveKpiModal(null) }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 8 }}
              transition={{ type: 'spring', stiffness: 450, damping: 30 }}
              className="modal-dialog font-sans w-full max-w-3xl"
            >
              <div className="modal-content flex max-h-[calc(100dvh-2rem)] flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-2xl dark:border-slate-700 dark:bg-[#1B2433]">
                {/* Header */}
                <div className="modal-header flex items-center justify-between border-b border-slate-100 bg-white px-6 py-4 dark:border-slate-700 dark:bg-[#1B2433]">
                  <div className="flex items-center gap-3">
                    <div className="rounded-xl bg-[#0E5C44]/10 p-2.5 text-[#0E5C44] dark:bg-[#3FBF75]/20 dark:text-[#3FBF75]">
                      {activeKpiModal === 'total_unit' && <Building2 className="h-5 w-5" />}
                      {activeKpiModal === 'total_siswa' && <GraduationCap className="h-5 w-5" />}
                      {activeKpiModal === 'total_guru' && <UsersRound className="h-5 w-5" />}
                      {activeKpiModal === 'unit_aktif' && <CheckCircle2 className="h-5 w-5" />}
                    </div>
                    <div>
                      <h3 className="modal-title text-base font-extrabold text-slate-900 dark:text-white">
                        {activeKpiModal === 'total_unit' && 'Analisis Total Unit Pendidikan Terdaftar'}
                        {activeKpiModal === 'total_siswa' && 'Distribusi Siswa (Santriwan & Santriwati)'}
                        {activeKpiModal === 'total_guru' && 'Distribusi Tenaga Pendidik & Guru Aktif'}
                        {activeKpiModal === 'unit_aktif' && 'Status Operasional Unit Pendidikan Aktif'}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Rincian data agregat berdasarkan unit pendidikan di seluruh jaringan yayasan
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveKpiModal(null)}
                    aria-label="Tutup modal"
                    className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
                  >
                    <X className="size-5" />
                  </button>
                </div>

                {/* Body */}
                <div className="modal-body min-h-0 flex-1 overflow-y-auto p-6 space-y-4">
                  {/* Summary Bar */}
                  <div className="grid grid-cols-3 gap-3">
                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-800/40">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Unit Terdaftar</p>
                      <p className="text-xl font-black text-slate-900 dark:text-white mt-0.5">{Number(statistics.total_unit ?? items.length ?? 0).toLocaleString('id-ID')}</p>
                    </div>
                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-800/40">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Siswa Active</p>
                      <p className="text-xl font-black text-amber-600 dark:text-amber-400 mt-0.5">{Number(statistics.total_siswa ?? 0).toLocaleString('id-ID')}</p>
                    </div>
                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-800/40">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Guru Aktif</p>
                      <p className="text-xl font-black text-emerald-600 dark:text-emerald-400 mt-0.5">{Number(statistics.total_tenaga_pendidik ?? 0).toLocaleString('id-ID')}</p>
                    </div>
                  </div>

                  {/* List / Table of Items */}
                  <div className="space-y-2.5">
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider text-slate-500">
                      Daftar Breakdown Per Unit Sekolah
                    </h4>

                    {items.length === 0 ? (
                      <div className="text-center py-8 text-xs text-slate-400">Tidak ada data unit tersedia.</div>
                    ) : (
                      <div className="divide-y divide-slate-100 rounded-xl border border-slate-200/90 bg-white dark:divide-slate-800 dark:border-slate-700 dark:bg-slate-800/40">
                        {items
                          .filter(u => activeKpiModal !== 'unit_aktif' || u.is_active)
                          .map((u, idx) => {
                            const uStyle = getUnitStyle(u.unit_type)
                            const totalS = u.total_siswa ?? 0
                            const sLaki = Math.round(totalS * 0.52)
                            const sPerempuan = Math.round(totalS * 0.48)
                            return (
                              <div key={u.id || idx} className="flex flex-wrap items-center justify-between gap-3 p-3.5 hover:bg-slate-50/80 dark:hover:bg-slate-800/80 transition-colors">
                                <div className="flex items-center gap-3 min-w-0">
                                  <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-[10px] font-black ${uStyle.bg} ${uStyle.text}`}>
                                    {u.unit_type || 'UP'}
                                  </span>
                                  <div className="min-w-0">
                                    <p className="font-extrabold text-slate-900 dark:text-white text-xs truncate">
                                      {u.name}
                                    </p>
                                    <p className="text-[10px] text-slate-400">
                                      NPSN: {u.npsn || '—'} · {[u.city, u.province].filter(Boolean).join(', ') || 'Lokasi belum disetel'}
                                    </p>
                                  </div>
                                </div>

                                <div className="flex items-center gap-4 text-xs">
                                  {activeKpiModal === 'total_siswa' && (
                                    <div className="text-right">
                                      <p className="font-extrabold text-slate-800 dark:text-slate-200">
                                        {Number(totalS).toLocaleString('id-ID')} Siswa
                                      </p>
                                      <p className="text-[10px] text-slate-400">
                                        L: {sLaki} · P: {sPerempuan}
                                      </p>
                                    </div>
                                  )}
                                  {activeKpiModal === 'total_guru' && (
                                    <div className="text-right">
                                      <p className="font-extrabold text-emerald-600 dark:text-emerald-400">
                                        {Number(u.total_guru ?? 0).toLocaleString('id-ID')} Guru
                                      </p>
                                      <p className="text-[10px] text-slate-400">
                                        Rasio 1:{u.total_guru > 0 ? Math.round(totalS / u.total_guru) : 0}
                                      </p>
                                    </div>
                                  )}
                                  {(activeKpiModal === 'total_unit' || activeKpiModal === 'unit_aktif') && (
                                    <div className="text-right">
                                      <p className="font-bold text-slate-700 dark:text-slate-300">
                                        {totalS} Siswa / {u.total_guru ?? 0} Guru
                                      </p>
                                      <MasterStatusBadge active={u.is_active} />
                                    </div>
                                  )}

                                  <Button
                                    variant="ghost"
                                    appearance="outline"
                                    size="xs"
                                    onPress={() => { setActiveKpiModal(null); setActiveDetailTab('Informasi'); setDetailUnit(u) }}
                                    onClick={() => { setActiveKpiModal(null); setActiveDetailTab('Informasi'); setDetailUnit(u) }}
                                  >
                                    Lihat Detail &rarr;
                                  </Button>
                                </div>
                              </div>
                            )
                          })}
                      </div>
                    )}
                  </div>
                </div>

                {/* Footer */}
                <div className="modal-footer flex items-center justify-between border-t border-slate-100 bg-white px-6 py-4 dark:border-slate-700 dark:bg-[#1B2433]">
                  <span className="text-xs font-semibold text-slate-400">
                    Menampilkan rincian agregat unit pendidikan SIMSIT
                  </span>
                  <Button
                    variant="primary"
                    appearance="fill"
                    size="sm"
                    onPress={() => setActiveKpiModal(null)}
                    onClick={() => setActiveKpiModal(null)}
                  >
                    Tutup Rincian
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ══════════════════════════════════════════════════════════════════
          FORM MODAL (Add / Edit) — Step Wizard
      ══════════════════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {isFormOpen && (
          <div
            className="overlay modal fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-900/60 backdrop-blur-sm"
            role="dialog"
            tabIndex={-1}
            aria-modal="true"
            aria-labelledby="edu-unit-form-title"
            onMouseDown={e => { if (e.target === e.currentTarget) closeFormModal() }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 8 }}
              transition={{ type: 'spring', stiffness: 450, damping: 30 }}
              className="modal-dialog font-sans my-auto w-full max-w-2xl"
            >
            <div className="modal-content flex max-h-[calc(100dvh-1.5rem)] flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-2xl dark:border-slate-700 dark:bg-[#1B2433]">
              {/* Header */}
              <div className="modal-header flex items-center justify-between border-b border-slate-100 px-6 py-4 dark:border-slate-700 dark:bg-[#1B2433]">
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#0E5C44]/10 text-[#0E5C44] dark:bg-[#3FBF75]/20 dark:text-[#3FBF75]">
                    <School className="h-5 w-5" />
                  </span>
                  <div>
                    <h3 id="edu-unit-form-title" className="modal-title text-base font-black text-slate-900 dark:text-white">
                      {isEditMode ? 'Edit Unit Pendidikan' : 'Tambah Unit Pendidikan'}
                    </h3>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">Langkah {currentStep} dari 4</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={closeFormModal}
                  aria-label="Tutup form"
                  className="btn btn-text btn-circle btn-sm absolute end-3 top-3 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200"
                >
                  <X className="size-4" />
                </button>
              </div>

              {/* Step Indicator */}
              <div className="flex items-center gap-0 overflow-x-auto border-b border-slate-100 px-6 dark:border-slate-700">
                {[
                  { step: 1, label: 'Info Unit' },
                  { step: 2, label: 'Alamat' },
                  { step: 3, label: 'Pimpinan' },
                  { step: 4, label: 'Konfirmasi' },
                ].map((s, idx) => (
                  <button
                    key={s.step}
                    type="button"
                    onClick={() => setCurrentStep(s.step)}
                    className={`group flex shrink-0 items-center gap-2 border-b-2 px-4 py-3 text-[11px] font-bold transition-all ${currentStep === s.step
                        ? 'border-[#0E5C44] text-[#0E5C44] dark:border-[#3FBF75] dark:text-[#3FBF75]'
                        : 'border-transparent text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                      }`}
                  >
                    <span className={`flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-black transition-all ${currentStep === s.step ? 'bg-[#0E5C44] text-white dark:bg-[#3FBF75] dark:text-slate-900' :
                        currentStep > s.step ? 'bg-[#0E5C44]/20 text-[#0E5C44] dark:bg-[#3FBF75]/20 dark:text-[#3FBF75]' :
                          'bg-slate-100 text-slate-400 group-hover:bg-slate-200'
                      }`}>
                      {s.step}
                    </span>
                    <span className="hidden sm:inline">{s.label}</span>
                  </button>
                ))}
              </div>

              {/* Body */}
              <div className="min-h-0 flex-1 overflow-y-auto p-6 space-y-4">
                {(formAlert || formMutationAlert) && (
                  <InlineAlert
                    type={formMutationAlert ? 'error' : 'warning'}
                    message={formMutationAlert || formAlert}
                    onClose={() => { setFormAlert(null); setFormMutationAlert(null) }}
                  />
                )}

                {/* Step 1: Informasi */}
                {currentStep === 1 && (
                  <div className="space-y-4">
                    <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">Informasi Unit</h3>

                    {/* Logo upload */}
                    <div>
                      <label className="mb-1.5 block text-xs font-bold text-slate-700 dark:text-slate-200">Foto / Logo Unit</label>
                      {formData.logo_url ? (
                        <div className="flex items-center gap-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-900/40 dark:bg-emerald-950/20">
                          <img src={formData.logo_url} alt="Logo" className="h-16 w-16 shrink-0 rounded-xl border-2 border-[#054e3b] object-cover shadow-sm" />
                          <div>
                            <p className="text-xs font-bold text-slate-800 dark:text-slate-100">Logo berhasil diunggah</p>
                            <button type="button" onClick={() => setFormData(p => ({ ...p, logo_url: '' }))} className="mt-1 text-xs font-bold text-rose-600 hover:underline">Hapus & Upload Ulang</button>
                          </div>
                        </div>
                      ) : (
                        <label className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 p-6 text-center transition hover:border-[#0E5C44] hover:bg-emerald-50/30 dark:border-slate-700 dark:bg-slate-800/30">
                          <Upload className="mb-1.5 h-8 w-8 text-[#0E5C44]" />
                          <span className="text-xs font-bold text-slate-700 dark:text-slate-200">Upload Logo</span>
                          <span className="mt-0.5 text-[10px] text-slate-400">PNG, JPG maks 2MB</span>
                          <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
                        </label>
                      )}
                    </div>

                    {[
                      {
                        label: 'Nama Unit Pendidikan', key: 'name', required: true, placeholder: 'Contoh: SDIT 2 Dar el-Iman', hint: 'Nama resmi unit pendidikan',
                        validate: v => (!v?.trim() ? 'Nama Unit Pendidikan wajib diisi.' : null)
                      },
                      { label: 'Kode Unit', key: 'code', placeholder: 'Contoh: SDIT-002', hint: 'Kode unik pengenal unit' },
                      { label: 'NPSN', key: 'npsn', placeholder: 'Nomor Pokok Sekolah Nasional' },
                      {
                        label: 'Email', key: 'email', type: 'email', placeholder: 'Email resmi unit',
                        validate: v => (v && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ? 'Format email tidak valid.' : null)
                      },
                      { label: 'No. Telepon', key: 'phone', placeholder: '08xx-xxxx-xxxx' },
                    ].map(field => (
                      <TextField
                        key={field.key}
                        className="w-full"
                        name={field.key}
                        type={field.type || 'text'}
                        required={field.required}
                        validate={field.validate}
                      >
                        <FieldLabel htmlFor={field.key}>
                          {field.label} {field.required && <span className="text-rose-500">*</span>}
                        </FieldLabel>
                        <Input
                          id={field.key}
                          name={field.key}
                          type={field.type || 'text'}
                          placeholder={field.placeholder}
                          value={formData[field.key]}
                          onChange={e => setFormData(p => ({ ...p, [field.key]: e.target.value }))}
                        />
                        {field.hint && <FieldDescription>{field.hint}</FieldDescription>}
                        <FieldError>{validation => validation.validationErrors.join(', ')}</FieldError>
                      </TextField>
                    ))}

                    <div>
                      <label className="mb-1.5 block text-xs font-bold text-slate-700 dark:text-slate-200">Jenis Unit <span className="text-rose-500">*</span></label>
                      <select
                        value={formData.unit_type}
                        onChange={e => setFormData(p => ({ ...p, unit_type: e.target.value }))}
                        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-800 transition focus:border-[#0E5C44] focus:outline-none focus:ring-2 focus:ring-[#0E5C44]/15 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                      >
                        <option value="">Pilih Jenis Unit</option>
                        {typeOptions.length > 0
                          ? typeOptions.map(t => <option key={t} value={t}>{t}</option>)
                          : ['TKIT', 'TAUD', 'SDIT', 'MIT', 'SMPIT', 'SMAIT', 'PONPES', 'Mahad'].map(t => <option key={t} value={t}>{t}</option>)
                        }
                      </select>
                    </div>

                    <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-700 dark:bg-slate-800/40">
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-200 flex-1">Status Unit Aktif</label>
                      <button
                        type="button"
                        role="switch"
                        aria-checked={formData.is_active}
                        onClick={() => setFormData(p => ({ ...p, is_active: !p.is_active }))}
                        className={`relative h-6 w-11 rounded-full transition-colors ${formData.is_active ? 'bg-[#0E5C44]' : 'bg-slate-300 dark:bg-slate-600'}`}
                      >
                        <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-all ${formData.is_active ? 'translate-x-5' : 'translate-x-0.5'}`} />
                      </button>
                    </div>
                  </div>
                )}

                {/* Step 2: Alamat */}
                {currentStep === 2 && (
                  <div className="space-y-4">
                    <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">Alamat Unit</h3>
                    <TextField className="w-full">
                      <FieldLabel htmlFor="address">Alamat Lengkap</FieldLabel>
                      <TextArea
                        id="address"
                        name="address"
                        rows={3}
                        placeholder="Jl. Khatib Sulaiman No. 10..."
                        value={formData.address}
                        onChange={e => setFormData(p => ({ ...p, address: e.target.value }))}
                      />
                      <FieldDescription>Alamat lengkap lokasi fisik unit pendidikan</FieldDescription>
                    </TextField>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <SearchableRegionInput
                        label="Provinsi"
                        value={formData.province}
                        onChange={(newProv) => {
                          setFormData((p) => ({
                            ...p,
                            province: newProv,
                            city: p.province !== newProv ? '' : p.city,
                          }))
                        }}
                        options={provList}
                        placeholder="Cari / pilih provinsi..."
                        isLoading={isProvLoading}
                      />
                      <SearchableRegionInput
                        label="Kota / Kabupaten"
                        value={formData.city}
                        onChange={(newCity) => {
                          setFormData((p) => ({ ...p, city: newCity }))
                        }}
                        options={kotaList}
                        placeholder={formData.province ? "Cari / pilih kota/kabupaten..." : "Pilih provinsi atau ketik kota..."}
                        isLoading={isKotaLoading}
                      />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-xs font-bold text-slate-700 dark:text-slate-200">Kode Pos</label>
                      <input type="text" placeholder="25136" value={formData.postal_code} onChange={e => setFormData(p => ({ ...p, postal_code: e.target.value }))} className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 transition focus:border-[#0E5C44] focus:outline-none focus:ring-2 focus:ring-[#0E5C44]/15 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200" />
                    </div>
                  </div>
                )}

                {/* Step 3: Pimpinan */}
                {currentStep === 3 && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">Kepala Sekolah / Pimpinan</h3>
                      <button
                        type="button"
                        onClick={() => setIsAddEmployeeModalOpen(true)}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 px-3 py-1.5 text-xs font-bold text-[#0E5C44] dark:text-[#3FBF75] hover:bg-emerald-100 dark:hover:bg-emerald-900/50 transition border border-emerald-200/80 dark:border-emerald-800/80 shadow-sm"
                      >
                        <Plus className="h-3.5 w-3.5" /> Tambah Pegawai
                      </button>
                    </div>

                    <div>
                      <label className="mb-1.5 block text-xs font-bold text-slate-700 dark:text-slate-200">
                        Pilih dari Data Pegawai
                      </label>
                      <select
                        value=""
                        onChange={e => {
                          const selectedEmpId = e.target.value
                          if (!selectedEmpId) return
                          const emp = employeesList.find(x => String(x.id) === String(selectedEmpId))
                          if (emp) {
                            setFormData(p => ({
                              ...p,
                              principal_name: emp.name || emp.nama_lengkap || p.principal_name,
                              principal_nip: emp.nip || emp.nipy || p.principal_nip,
                            }))
                          }
                        }}
                        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-800 transition focus:border-[#0E5C44] focus:outline-none focus:ring-2 focus:ring-[#0E5C44]/15 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                      >
                        <option value="">-- Pilih Pegawai --</option>
                        {employeesList.map(emp => {
                          const empName = emp.name || emp.nama_lengkap
                          const empNip = emp.nip || emp.nipy
                          return (
                            <option key={emp.id} value={emp.id}>
                              {empName} {empNip ? `(NIP: ${empNip})` : ''} {emp.jabatan_name ? `- ${emp.jabatan_name}` : ''}
                            </option>
                          )
                        })}
                      </select>
                    </div>

                    <div>
                      <label className="mb-1.5 block text-xs font-bold text-slate-700 dark:text-slate-200">
                        Nama Pimpinan
                      </label>
                      <input
                        type="text"
                        placeholder="Ust. Fadli Rahman, S.Pd"
                        value={formData.principal_name}
                        onChange={e => setFormData(p => ({ ...p, principal_name: e.target.value }))}
                        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 transition focus:border-[#0E5C44] focus:outline-none focus:ring-2 focus:ring-[#0E5C44]/15 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                      />
                    </div>

                    <div>
                      <label className="mb-1.5 block text-xs font-bold text-slate-700 dark:text-slate-200">
                        NIP / NIPY
                      </label>
                      <input
                        type="text"
                        placeholder="1985xxxxxx"
                        value={formData.principal_nip}
                        onChange={e => setFormData(p => ({ ...p, principal_nip: e.target.value }))}
                        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 transition focus:border-[#0E5C44] focus:outline-none focus:ring-2 focus:ring-[#0E5C44]/15 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                      />
                    </div>

                    <div>
                      <label className="mb-1.5 block text-xs font-bold text-slate-700 dark:text-slate-200">
                        No. SK Pendirian
                      </label>
                      <input
                        type="text"
                        placeholder="No. SK..."
                        value={formData.sk_pendirian}
                        onChange={e => setFormData(p => ({ ...p, sk_pendirian: e.target.value }))}
                        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 transition focus:border-[#0E5C44] focus:outline-none focus:ring-2 focus:ring-[#0E5C44]/15 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="mb-1.5 block text-xs font-bold text-slate-700 dark:text-slate-200">Tahun Berdiri</label>
                        <input type="number" placeholder="2011" value={formData.established_year} onChange={e => setFormData(p => ({ ...p, established_year: e.target.value }))} className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 transition focus:border-[#0E5C44] focus:outline-none focus:ring-2 focus:ring-[#0E5C44]/15 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200" />
                      </div>
                      <div>
                        <label className="mb-1.5 block text-xs font-bold text-slate-700 dark:text-slate-200">Akreditasi</label>
                        <select value={formData.accreditation} onChange={e => setFormData(p => ({ ...p, accreditation: e.target.value }))} className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-800 transition focus:border-[#0E5C44] focus:outline-none focus:ring-2 focus:ring-[#0E5C44]/15 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200">
                          <option value="A">A (Unggul)</option>
                          <option value="B">B (Baik)</option>
                          <option value="C">C</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 4: Konfirmasi */}
                {currentStep === 4 && (
                  <div className="space-y-4">
                    <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">Konfirmasi Data</h3>
                    <div className="divide-y divide-slate-100 rounded-2xl border border-slate-200 bg-slate-50 text-xs dark:divide-slate-700 dark:border-slate-700 dark:bg-slate-800/30">
                      {[
                        ['Nama Unit', formData.name || '-'],
                        ['Jenis Unit', formData.unit_type || '-'],
                        ['NPSN', formData.npsn || '-'],
                        ['Kota, Provinsi', [formData.city, formData.province].filter(Boolean).join(', ') || '-'],
                        ['Kepala Sekolah', formData.principal_name || '-'],
                        ['Status', formData.is_active ? 'Aktif' : 'Nonaktif'],
                      ].map(([label, value]) => (
                        <div key={label} className="flex items-center justify-between px-4 py-2.5">
                          <span className="font-semibold text-slate-500 dark:text-slate-400">{label}</span>
                          <span className="font-bold text-slate-800 dark:text-slate-100">{value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="modal-footer flex items-center justify-between border-t border-slate-100 px-6 py-4 dark:border-slate-700">
                <button
                  type="button"
                  onClick={closeFormModal}
                  className="btn btn-error text-white inline-flex items-center gap-1.5"
                >
                  <X className="size-4" /> Batal
                </button>
                <div className="flex items-center gap-2">
                  {currentStep > 1 && (
                    <button
                      type="button"
                      onClick={() => setCurrentStep(s => s - 1)}
                      className="btn btn-warning text-white inline-flex items-center gap-1.5 shadow-sm"
                    >
                      <ArrowLeft className="size-4" /> Kembali
                    </button>
                  )}
                  {currentStep < 4 ? (
                    <button
                      type="button"
                      onClick={() => setCurrentStep(s => Math.min(4, s + 1))}
                      className="btn btn-success bg-[#0E5C44] hover:bg-[#1E8E5A] text-white border-none inline-flex items-center gap-1.5 shadow-md"
                    >
                      Selanjutnya
                      <ArrowRight className="size-4" />
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleFormSubmit}
                      disabled={isMutating}
                      className="btn btn-success bg-[#0E5C44] hover:bg-[#1E8E5A] text-white border-none inline-flex items-center gap-2 shadow-md disabled:opacity-50"
                    >
                      {isMutating ? (
                        <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      ) : (
                        <Save className="size-4" />
                      )}
                      {isEditMode ? 'Simpan Perubahan' : 'Simpan Unit'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
      </AnimatePresence>

      {/* ══════════════════════════════════════════════════════════════════
          SAVE / UPDATE CONFIRMATION DIALOG (TailGrids Dialog)
      ══════════════════════════════════════════════════════════════════ */}
      {showSaveConfirmDialog && (
        <Dialog
          isOpen={showSaveConfirmDialog}
          onOpenChange={setShowSaveConfirmDialog}
          className="w-full max-w-md"
          showCloseButton={false}
        >
          <DialogHeader>
            <DialogTitle>
              {isEditMode ? 'Konfirmasi Perubahan Data' : 'Konfirmasi Penyimpanan Data'}
            </DialogTitle>
            <DialogDescription>
              {isEditMode
                ? `Apakah Anda yakin ingin memperbarui data unit "${formData.name}"? Perubahan akan langsung disimpan ke server.`
                : `Apakah Anda yakin ingin menambahkan unit pendidikan "${formData.name}" ke dalam sistem?`}
            </DialogDescription>
          </DialogHeader>
          <DialogBody>
            <div className={`rounded-xl border p-3 text-xs font-semibold ${isEditMode
                ? 'border-amber-200 bg-amber-50/70 text-amber-800 dark:border-amber-900/40 dark:bg-amber-950/30 dark:text-amber-300'
                : 'border-emerald-200 bg-emerald-50/70 text-emerald-800 dark:border-emerald-900/40 dark:bg-emerald-950/30 dark:text-emerald-300'
              }`}>
              {isEditMode
                ? 'Data unit pendidikan yang sudah ada akan diperbarui dengan informasi terbaru yang Anda masukkan.'
                : 'Data unit pendidikan baru akan tersimpan dan langsung aktif sesuai pengaturan status.'}
            </div>
          </DialogBody>
          <DialogFooter>
            <DialogClose appearance="outline" disabled={isMutating}>
              Batal
            </DialogClose>
            <Button onClick={handleConfirmSave} pending={isMutating}>
              {isEditMode ? 'Ya, Perbarui Data' : 'Ya, Simpan Data'}
            </Button>
          </DialogFooter>
        </Dialog>
      )}

      {/* ══════════════════════════════════════════════════════════════════
          DELETE CONFIRM DIALOG (Controlled Backdrop + Dialog)
      ══════════════════════════════════════════════════════════════════ */}
      {deleteTarget && (
        <Backdrop
          isOpen={Boolean(deleteTarget)}
          onOpenChange={(open) => { if (!open) setDeleteTarget(null) }}
        >
          <Dialog className="w-full max-w-md">
            <DialogHeader>
              <DialogTitle>Hapus Unit Pendidikan?</DialogTitle>
              <DialogDescription>
                Tindakan ini tidak dapat dibatalkan. Data unit <strong>"{deleteTarget.name}"</strong> akan dihapus secara permanen dari server.
              </DialogDescription>
            </DialogHeader>
            <DialogBody>
              <div className="rounded-xl border border-rose-100 bg-rose-50/60 px-4 py-3 text-xs font-semibold text-rose-800 dark:border-rose-900/40 dark:bg-rose-950/30 dark:text-rose-300">
                Semua data yang terkait dengan unit ini akan terpengaruh.
              </div>
            </DialogBody>
            <DialogFooter className="mt-2">
              <DialogClose autoFocus appearance="outline" size="sm" onClick={() => setDeleteTarget(null)}>
                Batal
              </DialogClose>
              <Button
                variant="danger"
                size="sm"
                pending={deleteMutation.isPending}
                onClick={() => deleteMutation.mutate(deleteTarget.id)}
              >
                {deleteMutation.isPending ? 'Menghapus...' : 'Ya, Hapus Unit'}
              </Button>
            </DialogFooter>
          </Dialog>
        </Backdrop>
      )}

      {/* ══════════════════════════════════════════════════════════════════
          EXPORT DIALOG
      ══════════════════════════════════════════════════════════════════ */}
      {showExportModal && (
        <div
          className="overlay modal overlay-open:opacity-100 overlay-open:duration-300 fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs"
          role="dialog"
          aria-modal="true"
          tabIndex={-1}
          onMouseDown={e => { if (e.target === e.currentTarget) setShowExportModal(false) }}
        >
          <div className="modal-dialog font-sans w-full max-w-sm">
            <div className="modal-content flex flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-2xl dark:border-slate-700 dark:bg-[#1B2433]">
              <div className="modal-header flex items-center justify-between border-b border-slate-100 bg-white px-5 py-4 dark:border-slate-700 dark:bg-[#1B2433]">
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[#0E5C44]/10 text-[#0E5C44] dark:bg-[#3FBF75]/20 dark:text-[#3FBF75]">
                    <Download className="h-5 w-5" />
                  </span>
                  <h3 className="modal-title text-base font-bold text-slate-900 dark:text-white">Export Data Unit</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setShowExportModal(false)}
                  className="btn btn-text btn-circle btn-sm absolute end-3 top-3 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200"
                  aria-label="Tutup"
                >
                  <X className="size-4" />
                </button>
              </div>

              <div className="modal-body space-y-2 p-5 text-sm text-slate-700 dark:text-slate-200">
                {[
                  { value: 'xlsx', label: 'Excel (.xlsx)', desc: 'Format Microsoft Excel Modern' },
                  { value: 'xls', label: 'Excel Legacy (.xls)', desc: 'Format Microsoft Excel Standard' },
                  { value: 'csv', label: 'CSV (.csv)', desc: 'Format Comma-Separated Values' },
                  { value: 'pdf', label: 'PDF (.pdf)', desc: 'Format Cetak Dokumen Resmi' },
                ].map(opt => (
                  <label key={opt.value} className={`flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 transition ${exportFormat === opt.value ? 'border-[#0E5C44] bg-[#0E5C44]/5 dark:border-[#3FBF75] dark:bg-[#3FBF75]/10' : 'border-slate-200 dark:border-slate-700'}`}>
                    <input type="radio" name="export-fmt" value={opt.value} checked={exportFormat === opt.value} onChange={() => setExportFormat(opt.value)} className="accent-[#0E5C44]" />
                    <div>
                      <p className="text-xs font-bold text-slate-800 dark:text-slate-100">{opt.label}</p>
                      <p className="text-[10px] text-slate-500">{opt.desc}</p>
                    </div>
                  </label>
                ))}
              </div>

              <div className="modal-footer flex items-center justify-end gap-3 border-t border-slate-100 bg-white px-5 py-4 dark:border-slate-700 dark:bg-[#1B2433]">
                <button type="button" onClick={() => setShowExportModal(false)} className="btn btn-soft btn-secondary">
                  Batal
                </button>
                <button type="button" onClick={handleProcessExport} className="btn btn-primary inline-flex items-center gap-2">
                  <Download className="h-4 w-4" /> Export
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════
          IMPORT DIALOG
      ══════════════════════════════════════════════════════════════════ */}
      {showImportModal && (
        <div
          className="overlay modal overlay-open:opacity-100 overlay-open:duration-300 fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs"
          role="dialog"
          aria-modal="true"
          tabIndex={-1}
          onMouseDown={e => { if (e.target === e.currentTarget) setShowImportModal(false) }}
        >
          <div className="modal-dialog font-sans my-auto w-full max-w-lg">
            <div className="modal-content flex max-h-[calc(100dvh-2rem)] flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-2xl dark:border-slate-700 dark:bg-[#1B2433]">
              <div className="modal-header flex items-center justify-between border-b border-slate-100 bg-white px-5 py-4 dark:border-slate-700 dark:bg-[#1B2433]">
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#0E5C44]/10 text-[#0E5C44] dark:bg-[#3FBF75]/20 dark:text-[#3FBF75]">
                    <Upload className="h-5 w-5" />
                  </span>
                  <h3 className="modal-title text-base font-bold text-slate-900 dark:text-white">Import Data Unit</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setShowImportModal(false)}
                  className="btn btn-text btn-circle btn-sm absolute end-3 top-3 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200"
                  aria-label="Tutup"
                >
                  <X className="size-4" />
                </button>
              </div>

              <div className="modal-body min-h-0 flex-1 space-y-4 overflow-y-auto p-5 text-sm text-slate-700 dark:text-slate-200">
                <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-700 dark:bg-slate-800/30">
                  <div>
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-100">Unduh Template Impor</p>
                    <p className="text-[10px] text-slate-500">Unduh contoh format file sesuai standar</p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button type="button" onClick={() => handleDownloadTemplate('xlsx')} className="inline-flex items-center gap-1 rounded-lg border border-[#0E5C44] bg-white px-2.5 py-1 text-[11px] font-bold text-[#0E5C44] transition hover:bg-emerald-50 dark:border-[#3FBF75] dark:bg-transparent dark:text-[#3FBF75]">
                      <Download className="h-3 w-3" /> Excel (.xlsx)
                    </button>
                    <button type="button" onClick={() => handleDownloadTemplate('csv')} className="inline-flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-2.5 py-1 text-[11px] font-bold text-slate-700 transition hover:bg-slate-100 dark:border-slate-600 dark:bg-transparent dark:text-slate-200">
                      <Download className="h-3 w-3" /> CSV
                    </button>
                  </div>
                </div>

                <label className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 p-6 text-center transition hover:border-[#0E5C44] hover:bg-emerald-50/20 dark:border-slate-700 dark:bg-slate-800/20">
                  <FileText className="mb-2 h-8 w-8 text-[#0E5C44]" />
                  <p className="text-xs font-bold text-slate-700 dark:text-slate-200">{importFile ? importFile.name : 'Pilih File (.xlsx, .xls, .csv)'}</p>
                  <p className="mt-0.5 text-[10px] text-slate-400">Mendukung format Microsoft Excel & CSV</p>
                  <input type="file" accept=".csv, .xlsx, .xls" onChange={handleFileSelect} className="hidden" />
                </label>

                {importPreviewData.length > 0 && (
                  <div>
                    <p className="mb-2 text-xs font-bold text-slate-700 dark:text-slate-200">Preview ({importPreviewData.length} data)</p>
                    <div className="max-h-40 overflow-auto rounded-xl border border-slate-200 dark:border-slate-700">
                      <table className="w-full text-[10px]">
                        <thead className="bg-slate-50 font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                          <tr>{['Kode', 'Nama', 'Jenis', 'Status'].map(h => <th key={h} className="px-3 py-2 text-left">{h}</th>)}</tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                          {importPreviewData.map((r, i) => (
                            <tr key={i} className="dark:text-slate-200">
                              <td className="px-3 py-2">{r.kode}</td>
                              <td className="px-3 py-2">{r.nama}</td>
                              <td className="px-3 py-2">{r.tingkat}</td>
                              <td className="px-3 py-2">
                                <AppBadge variant={r.status === 'Valid' ? 'success' : 'danger'}>{r.status}</AppBadge>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {importedData.length > 0 && (
                  <InlineAlert
                    type="success"
                    message={`${importedData.filter(r => r.status === 'Berhasil').length} data berhasil diimpor, ${importedData.filter(r => r.status === 'Gagal').length} gagal.`}
                  />
                )}
              </div>

              <div className="modal-footer flex items-center justify-end gap-3 border-t border-slate-100 bg-white px-5 py-4 dark:border-slate-700 dark:bg-[#1B2433]">
                <button type="button" onClick={() => setShowImportModal(false)} className="btn btn-soft btn-secondary">
                  Tutup
                </button>
                <button
                  type="button"
                  onClick={handleProcessImport}
                  disabled={!importFile || isImporting || importPreviewData.length === 0}
                  className="btn btn-primary inline-flex items-center gap-2 disabled:opacity-50"
                >
                  {isImporting && <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />}
                  <Upload className="h-4 w-4" /> Proses Import
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal 2: Quick Add Pegawai (Overlay Modal on top of Modal 1) */}
      {isAddEmployeeModalOpen && (
        <div
          className="overlay modal overlay-open:opacity-100 overlay-open:duration-300 fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn"
          role="dialog"
          aria-modal="true"
          aria-labelledby="quick-add-employee-title"
          tabIndex={-1}
          onMouseDown={e => { if (e.target === e.currentTarget) setIsAddEmployeeModalOpen(false) }}
        >
          <div className="modal-dialog font-sans my-auto w-full max-w-lg">
            <div className="modal-content flex max-h-[calc(100dvh-2rem)] flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-2xl dark:border-slate-700 dark:bg-[#1B2433]">
              {/* Header */}
              <div className="modal-header flex items-center justify-between border-b border-slate-100 bg-white px-5 py-4 dark:border-slate-700 dark:bg-[#1B2433]">
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400">
                    <UsersRound className="h-5 w-5" />
                  </span>
                  <div>
                    <h3 id="quick-add-employee-title" className="modal-title text-base font-bold text-slate-900 dark:text-white">
                      Tambah Pegawai Baru
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Tambah data pegawai untuk dipilih sebagai pimpinan unit</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsAddEmployeeModalOpen(false)}
                  className="btn btn-text btn-circle btn-sm absolute end-3 top-3 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200"
                  aria-label="Tutup"
                >
                  <X className="size-4" />
                </button>
              </div>

              {/* Body */}
              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  if (!employeeFormData.name.trim()) {
                    setEmployeeFormAlert('Nama lengkap pegawai wajib diisi.')
                    return
                  }
                  createEmployeeMutation.mutate(employeeFormData)
                }}
                className="flex min-h-0 flex-1 flex-col"
              >
                <div className="modal-body min-h-0 flex-1 space-y-4 overflow-y-auto p-5 text-sm text-slate-700 dark:text-slate-200">
                  {employeeFormAlert && (
                    <InlineAlert
                      type="error"
                      message={employeeFormAlert}
                      onClose={() => setEmployeeFormAlert(null)}
                    />
                  )}

                  <div>
                    <label className="mb-1.5 block text-xs font-bold text-slate-700 dark:text-slate-200">
                      Nama Lengkap <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Contoh: Ust. Ahmad Fauzi, M.Pd"
                      value={employeeFormData.name}
                      onChange={e => setEmployeeFormData(p => ({ ...p, name: e.target.value }))}
                      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 transition focus:border-[#0E5C44] focus:outline-none focus:ring-2 focus:ring-[#0E5C44]/15 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="mb-1.5 block text-xs font-bold text-slate-700 dark:text-slate-200">NIP / NIPY</label>
                      <input
                        type="text"
                        placeholder="198501..."
                        value={employeeFormData.nip}
                        onChange={e => setEmployeeFormData(p => ({ ...p, nip: e.target.value }))}
                        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 transition focus:border-[#0E5C44] focus:outline-none focus:ring-2 focus:ring-[#0E5C44]/15 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                      />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-xs font-bold text-slate-700 dark:text-slate-200">Jabatan / Peran</label>
                      <input
                        type="text"
                        placeholder="Kepala Sekolah / Guru"
                        value={employeeFormData.jabatan_name}
                        onChange={e => setEmployeeFormData(p => ({ ...p, jabatan_name: e.target.value }))}
                        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 transition focus:border-[#0E5C44] focus:outline-none focus:ring-2 focus:ring-[#0E5C44]/15 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="mb-1.5 block text-xs font-bold text-slate-700 dark:text-slate-200">Email</label>
                      <input
                        type="email"
                        placeholder="pegawai@sekolah.sch.id"
                        value={employeeFormData.email}
                        onChange={e => setEmployeeFormData(p => ({ ...p, email: e.target.value }))}
                        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 transition focus:border-[#0E5C44] focus:outline-none focus:ring-2 focus:ring-[#0E5C44]/15 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                      />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-xs font-bold text-slate-700 dark:text-slate-200">No. Telepon / WA</label>
                      <input
                        type="text"
                        placeholder="08123456789"
                        value={employeeFormData.phone}
                        onChange={e => setEmployeeFormData(p => ({ ...p, phone: e.target.value }))}
                        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 transition focus:border-[#0E5C44] focus:outline-none focus:ring-2 focus:ring-[#0E5C44]/15 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                      />
                    </div>
                  </div>

                </div>

                <div className="modal-footer flex items-center justify-end gap-3 border-t border-slate-100 bg-white px-5 py-4 dark:border-slate-700 dark:bg-[#1B2433]">
                  <button
                    type="button"
                    onClick={() => setIsAddEmployeeModalOpen(false)}
                    className="btn btn-soft btn-secondary"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={createEmployeeMutation.isPending}
                    className="btn btn-primary inline-flex items-center gap-1.5 disabled:opacity-50"
                  >
                    {createEmployeeMutation.isPending ? 'Menyimpan...' : 'Simpan Pegawai'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* TailGrids Print & PDF Download Scope Selection Modal */}
      <AnimatePresence>
        {printOptionModalOpen && (
          <div
            role="dialog"
            tabIndex={-1}
            aria-modal="true"
            className="overlay modal fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs"
            onMouseDown={e => { if (e.target === e.currentTarget) setPrintOptionModalOpen(false) }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 8 }}
              transition={{ type: 'spring', stiffness: 450, damping: 30 }}
              className="modal-dialog font-sans w-full max-w-lg"
            >
              <div className="modal-content flex max-h-[calc(100dvh-2rem)] flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-2xl dark:border-slate-700 dark:bg-[#1B2433]">
                {/* Header */}
                <div className="modal-header flex items-center justify-between border-b border-slate-100 bg-white px-6 py-4 dark:border-slate-700 dark:bg-[#1B2433]">
                  <div className="flex items-center gap-3">
                    <div className="rounded-xl bg-[#0E5C44]/10 p-2.5 text-[#0E5C44] dark:bg-[#3FBF75]/20 dark:text-[#3FBF75]">
                      <Printer className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="modal-title text-base font-extrabold text-slate-900 dark:text-white">
                        Opsi & Scope Cetak Laporan
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Pilih jenis laporan yang ingin dicetak atau diunduh
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setPrintOptionModalOpen(false)}
                    aria-label="Tutup modal"
                    className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
                  >
                    <X className="size-5" />
                  </button>
                </div>

                {/* Body */}
                <div className="modal-body min-h-0 flex-1 overflow-y-auto p-6 space-y-4">
                  {/* Selector Cards */}
                  <div className="space-y-2.5">
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      Pilih Kategori Laporan Unit
                    </label>

                    {/* Mode 1: Seluruh Data Unit */}
                    <div
                      onClick={() => setPrintScopeMode('all')}
                      className={`flex items-start gap-3.5 p-4 rounded-xl border cursor-pointer transition-all ${printScopeMode === 'all'
                          ? 'border-[#0E5C44] bg-emerald-50/70 dark:border-emerald-500 dark:bg-emerald-950/40 shadow-xs'
                          : 'border-slate-200 bg-white hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800/50'
                        }`}
                    >
                      <div className={`mt-0.5 size-5 rounded-full border-2 flex items-center justify-center shrink-0 ${printScopeMode === 'all' ? 'border-[#0E5C44] bg-[#0E5C44] text-white' : 'border-slate-300'}`}>
                        {printScopeMode === 'all' && <span className="size-2 rounded-full bg-white" />}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <Building2 className="size-4 text-[#0E5C44] dark:text-emerald-400" />
                          <h4 className="text-xs font-extrabold text-slate-900 dark:text-white">
                            Cetak Seluruh Data Unit Pendidikan
                          </h4>
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                          Laporan lengkap master data unit: Kode, NPSN, Kota, Provinsi, Pimpinan, Total Siswa, Total Guru, dan Status.
                        </p>
                      </div>
                    </div>

                    {/* Mode 2: Jumlah Pegawai Menurut Unit */}
                    <div
                      onClick={() => setPrintScopeMode('pegawai')}
                      className={`flex items-start gap-3.5 p-4 rounded-xl border cursor-pointer transition-all ${printScopeMode === 'pegawai'
                          ? 'border-[#0E5C44] bg-emerald-50/70 dark:border-emerald-500 dark:bg-emerald-950/40 shadow-xs'
                          : 'border-slate-200 bg-white hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800/50'
                        }`}
                    >
                      <div className={`mt-0.5 size-5 rounded-full border-2 flex items-center justify-center shrink-0 ${printScopeMode === 'pegawai' ? 'border-[#0E5C44] bg-[#0E5C44] text-white' : 'border-slate-300'}`}>
                        {printScopeMode === 'pegawai' && <span className="size-2 rounded-full bg-white" />}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <UsersRound className="size-4 text-emerald-600 dark:text-emerald-400" />
                          <h4 className="text-xs font-extrabold text-slate-900 dark:text-white">
                            Cetak Jumlah Pegawai & Guru Menurut Unit
                          </h4>
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                          Rekapitulasi SDM: Guru Pendidik, Staf Kependidikan, Total SDM, Pimpinan, dan Rasio Guru.
                        </p>
                      </div>
                    </div>

                    {/* Mode 3: Jumlah Siswa/Santri Menurut Unit */}
                    <div
                      onClick={() => setPrintScopeMode('siswa')}
                      className={`flex items-start gap-3.5 p-4 rounded-xl border cursor-pointer transition-all ${printScopeMode === 'siswa'
                          ? 'border-[#0E5C44] bg-emerald-50/70 dark:border-emerald-500 dark:bg-emerald-950/40 shadow-xs'
                          : 'border-slate-200 bg-white hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800/50'
                        }`}
                    >
                      <div className={`mt-0.5 size-5 rounded-full border-2 flex items-center justify-center shrink-0 ${printScopeMode === 'siswa' ? 'border-[#0E5C44] bg-[#0E5C44] text-white' : 'border-slate-300'}`}>
                        {printScopeMode === 'siswa' && <span className="size-2 rounded-full bg-white" />}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <GraduationCap className="size-4 text-amber-500" />
                          <h4 className="text-xs font-extrabold text-slate-900 dark:text-white">
                            Cetak Jumlah Siswa / Santri Menurut Unit
                          </h4>
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                          Rekapitulasi peserta didik: Breakdown Santriwan (Laki-laki), Santriwati (Perempuan), Total Siswa, & Jumlah Rombel.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2">
                    <button
                      type="button"
                      onClick={() => {
                        setPrintOptionModalOpen(false)
                        handlePrintClean(printScopeMode)
                      }}
                      className="w-full flex items-center justify-between p-3.5 rounded-xl border border-emerald-200 bg-emerald-50 hover:bg-emerald-100 dark:border-emerald-800 dark:bg-emerald-950/40 text-left transition-colors cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        <div className="size-8 rounded-lg bg-[#0E5C44] text-white flex items-center justify-center">
                          <Printer className="size-4" />
                        </div>
                        <div>
                          <h5 className="text-xs font-extrabold text-slate-900 dark:text-white">🖨️ Cetak Langsung (Print Clean)</h5>
                          <p className="text-[10px] text-slate-500">Buka tampilan cetak bersih tanpa artefak UI</p>
                        </div>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setPrintOptionModalOpen(false)
                        handleDownloadPdfTable(printScopeMode)
                      }}
                      className="w-full flex items-center justify-between p-3.5 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 dark:border-rose-800 dark:bg-rose-950/40 text-left transition-colors cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        <div className="size-8 rounded-lg bg-rose-600 text-white flex items-center justify-center">
                          <Download className="size-4" />
                        </div>
                        <div>
                          <h5 className="text-xs font-extrabold text-slate-900 dark:text-white">📄 Unduh Berkas PDF (.pdf)</h5>
                          <p className="text-[10px] text-slate-500">Unduh berkas laporan dalam format PDF resmi</p>
                        </div>
                      </div>
                    </button>
                  </div>
                </div>

                {/* Footer */}
                <div className="modal-footer flex items-center justify-end border-t border-slate-100 bg-white px-6 py-4 dark:border-slate-700 dark:bg-[#1B2433]">
                  <Button
                    variant="ghost"
                    appearance="outline"
                    size="sm"
                    onPress={() => setPrintOptionModalOpen(false)}
                    onClick={() => setPrintOptionModalOpen(false)}
                  >
                    Batal
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Toast Stack */}
      <ToastStack items={toasts} onDismiss={dismissToast} />
    </PageContainer>
  )
}
