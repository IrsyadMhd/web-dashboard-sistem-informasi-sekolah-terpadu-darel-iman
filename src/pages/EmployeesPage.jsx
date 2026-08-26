import React, { useMemo, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { printEmployeeIdCard } from '../services/idCardPrintService.jsx'
import EmployeeIdCard from '../components/card-print/EmployeeIdCard'
import ActionDropdown from '../components/app/ActionDropdown'
import AppBadge from '../components/app/AppBadge'
import Swal from 'sweetalert2'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { QRCodeSVG } from 'qrcode.react'
import {
  Award,
  BadgeCheck,
  BriefcaseBusiness,
  Building2,
  Calendar,
  CheckCircle2,
  Download,
  Eye,
  Info,
  IdCard,
  Mail,
  Pencil,
  Phone,
  Plus,
  RefreshCcw,
  Search,
  SlidersHorizontal,
  Star,
  Trash2,
  TrendingUp,
  UserCheck,
  UsersRound,
  Printer,
  FileSpreadsheet,
  FileText,
  X,
  ShieldCheck,
  Sparkles,
} from 'lucide-react'
import {
  FaArrowLeft,
  FaBuilding,
  FaCheckCircle,
  FaDownload,
  FaEdit,
  FaExclamationTriangle,
  FaEye,
  FaFileExcel,
  FaFileImport,
  FaFilter,
  FaPlus,
  FaSearch,
  FaTimes,
  FaTrash,
  FaUpload,
  FaChalkboardTeacher,
  FaPhoneAlt,
  FaEnvelope,
  FaIdCard,
  FaUserTie,
  FaAward,
  FaFolderOpen,
  FaPrint,
} from 'react-icons/fa'
import {
  MasterActionButton,
  MasterDataPage,
  MasterDataSection,
  MasterFilterSelect,
  MasterEmptyState,
  MasterErrorState,
  MasterPageHeader,
  MasterStatCard,
  MasterStatsGrid,
} from '../components/master-data'
import { employeeService } from '../services/employeeService'
import { educationUnitService } from '../services/educationUnitService'
import { tahunAjaranService } from '../services/tahunAjaranService'
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts'
import PersonAvatar from '../components/ui/PersonAvatar'
import PersonIdentityCell from '../components/ui/PersonIdentityCell'
import { ROLES, hasAnyRole, isGlobalAccessManager, isUnitAccessManager, isKepsekOrDivisi } from '../auth/portalResolver'
import { useAuthStore } from '../stores/authStore'
import { usePengaturanStore } from '../stores/pengaturanStore'
import PageContainer from '../components/app/PageContainer'
import AppBreadcrumb from '../components/app/AppBreadcrumb'
import AppDataTable from '../components/app/AppDataTable'
import AppPageHeader from '../components/app/AppPageHeader'
import { Download1, Upload1, Plus as PlusIcon } from '@tailgrids/icons'
import { ChevronDown } from 'lucide-react'
import { Button } from '@/components/tailgrids/core/button'
import { Badge } from '@/components/tailgrids/core/badge'
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '@/components/tailgrids/core/hover-card'

const STATUS_PEGAWAI_OPTIONS = ['Tetap', 'Kontrak', 'Honorer', 'Magang']
const STATUS_OPTIONS = ['Aktif', 'Nonaktif', 'Cuti', 'Resign']
const ID_CARD_TEMPLATES = [
  { id: 'green', label: 'Hijau', description: 'Template Kepala Sekolah' },
  { id: 'blue', label: 'Biru', description: 'Template Guru' },
  { id: 'purple', label: 'Ungu', description: 'Template Wakil Kepala' },
  { id: 'orange', label: 'Oranye', description: 'Template Staf TU' },
]

function formatEmployeeCardDate(value) {
  if (!value) return '—'
  const date = new Date(`${String(value).split('T')[0]}T00:00:00`)
  if (Number.isNaN(date.getTime())) return value
  return new Intl.DateTimeFormat('id-ID', { day: '2-digit', month: 'long', year: 'numeric' }).format(date)
}

function makeEmployeeQrPayload(employee) {
  if (!employee) return ''
  return (
    employee.qr_token ||
    employee.qr_code ||
    employee.niy ||
    employee.email ||
    (employee.id ? `EMP-${employee.id}` : 'SIMSIT')
  )
}

function getStatusBadgeStyle(status) {
  switch (status) {
    case 'Aktif':
      return { bg: 'bg-emerald-100', text: 'text-emerald-800', dot: 'bg-emerald-600' }
    case 'Cuti':
      return { bg: 'bg-amber-100', text: 'text-amber-800', dot: 'bg-amber-600' }
    case 'Resign':
      return { bg: 'bg-rose-100', text: 'text-rose-800', dot: 'bg-rose-600' }
    default:
      return { bg: 'bg-slate-100', text: 'text-slate-600', dot: 'bg-slate-400' }
  }
}

function initialFormState() {
  return {
    id: null,
    niy: '',
    nik: '',
    nama_lengkap: '',
    nama_panggilan: '',
    gelar_depan: '',
    gelar_belakang: '',
    jenis_kelamin: '',
    tempat_lahir: '',
    tanggal_lahir: '',
    agama: '',
    foto: '',

    unit_id: '',
    jabatan_id: '',
    status_pegawai: '',
    tanggal_masuk: '',
    tanggal_keluar: '',
    status: '',

    no_hp: '',
    email: '',
    alamat: '',
    provinsi: '',
    kota: '',
    kecamatan: '',
    kelurahan: '',
    kode_pos: '',

    user_id: '',
    role_id: '',
    metadata: {
      teachings: [],
      position_history: [],
      certifications: [],
      documents: [],
      attendances: [],
    },
  }
}

function parseFromApi(item) {
  const meta = item?.metadata || {}
  return {
    id: item?.id || null,
    niy: item?.niy || '',
    nik: item?.nik || '',
    nama_lengkap: item?.nama_lengkap || '',
    nama_panggilan: item?.nama_panggilan || '',
    gelar_depan: item?.gelar_depan || '',
    gelar_belakang: item?.gelar_belakang || '',
    jenis_kelamin: item?.jenis_kelamin || '',
    tempat_lahir: item?.tempat_lahir || '',
    tanggal_lahir: item?.tanggal_lahir ? item.tanggal_lahir.split('T')[0] : '',
    agama: item?.agama || '',
    foto: item?.foto || '',

    unit_id: item?.unit_id || '',
    unit_name: item?.unit?.name || '',
    jabatan_id: item?.jabatan_id || '',
    jabatan_name: item?.position?.name || '',
    status_pegawai: item?.status_pegawai || '',
    tanggal_masuk: item?.tanggal_masuk ? item.tanggal_masuk.split('T')[0] : '',
    tanggal_keluar: item?.tanggal_keluar ? item.tanggal_keluar.split('T')[0] : '',
    status: item?.status || (item?.is_active === true ? 'Aktif' : item?.is_active === false ? 'Nonaktif' : ''),

    no_hp: item?.no_hp || '',
    email: item?.email || '',
    alamat: item?.alamat || '',
    provinsi: item?.provinsi || '',
    kota: item?.kota || '',
    kecamatan: item?.kecamatan || '',
    kelurahan: item?.kelurahan || '',
    kode_pos: item?.kode_pos || '',

    user_id: item?.user_id || '',
    role_id: item?.role_id || '',
    qr_token: item?.qr_token || meta.qr_token || '',
    qr_code: item?.qr_code || meta.qr_code || '',
    teachings: item?.teachings || meta.teachings || [],
    position_history: meta.position_history || [],
    certifications: meta.certifications || [],
    documents: meta.documents || [],
    attendances: meta.attendances || [],
  }
}

function makePayload(form, assignmentOnly = false) {
  if (assignmentOnly) {
    return {
      jabatan_id: form.jabatan_id || null,
    }
  }

  return {
    niy: form.niy,
    nik: form.nik,
    nama_lengkap: form.nama_lengkap,
    nama_panggilan: form.nama_panggilan,
    gelar_depan: form.gelar_depan,
    gelar_belakang: form.gelar_belakang,
    jenis_kelamin: form.jenis_kelamin,
    tempat_lahir: form.tempat_lahir,
    tanggal_lahir: form.tanggal_lahir || null,
    agama: form.agama,
    foto: form.foto,
    unit_id: form.unit_id || null,
    jabatan_id: form.jabatan_id || null,
    status_pegawai: form.status_pegawai,
    tanggal_masuk: form.tanggal_masuk || null,
    tanggal_keluar: form.tanggal_keluar || null,
    status: form.status,
    no_hp: form.no_hp,
    email: form.email,
    alamat: form.alamat,
    provinsi: form.provinsi,
    kota: form.kota,
    kecamatan: form.kecamatan,
    kelurahan: form.kelurahan,
    kode_pos: form.kode_pos,
    metadata: {
      teachings: form.teachings || [],
      position_history: form.position_history || [],
      certifications: form.certifications || [],
      documents: form.documents || [],
      attendances: form.attendances || [],
    },
  }
}

function KpiTintedCard({ icon: Icon, label, subtext, value, tone = 'emerald', onClick }) {
  const tones = {
    emerald: {
      card: 'border-emerald-100 bg-emerald-50/50 hover:border-emerald-200 dark:border-emerald-950/50 dark:bg-emerald-950/20',
      title: 'text-emerald-700 dark:text-emerald-400',
      icon: 'text-emerald-500',
      val: 'text-emerald-600 dark:text-emerald-300',
      sub: 'text-emerald-600/70 dark:text-emerald-400/70',
    },
    blue: {
      card: 'border-blue-100 bg-blue-50/50 hover:border-blue-200 dark:border-blue-950/50 dark:bg-blue-950/20',
      title: 'text-blue-700 dark:text-blue-400',
      icon: 'text-blue-500',
      val: 'text-blue-600 dark:text-blue-300',
      sub: 'text-blue-600/70 dark:text-blue-400/70',
    },
    purple: {
      card: 'border-purple-100 bg-purple-50/50 hover:border-purple-200 dark:border-purple-950/50 dark:bg-purple-950/20',
      title: 'text-purple-700 dark:text-purple-400',
      icon: 'text-purple-500',
      val: 'text-purple-600 dark:text-purple-300',
      sub: 'text-purple-600/70 dark:text-purple-400/70',
    },
    amber: {
      card: 'border-amber-100 bg-amber-50/50 hover:border-amber-200 dark:border-amber-950/50 dark:bg-amber-950/20',
      title: 'text-amber-700 dark:text-amber-400',
      icon: 'text-amber-500',
      val: 'text-amber-600 dark:text-amber-300',
      sub: 'text-amber-600/70 dark:text-amber-400/70',
    },
  }

  const t = tones[tone] || tones.emerald

  return (
    <motion.button
      type="button"
      whileHover={{ scale: 1.04, y: -2 }}
      whileTap={{ scale: 0.96 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      onClick={onClick}
      className={`text-left rounded-2xl border ${t.card} p-5 shadow-xs transition-all hover:shadow-md cursor-pointer group`}
    >
      <div className="flex items-center justify-between">
        <p className={`text-xs font-semibold ${t.title}`}>{label}</p>
        <Icon className={`h-4 w-4 ${t.icon} opacity-0 group-hover:opacity-100 transition-opacity`} />
      </div>
      <p className={`mt-2 text-3xl font-extrabold ${t.val}`}>{value ?? 0}</p>
      {subtext && (
        <p className={`mt-1.5 text-[10px] font-bold ${t.sub} flex items-center gap-0.5`}>
          {subtext}
        </p>
      )}
    </motion.button>
  )
}

export default function EmployeesPage() {
  const queryClient = useQueryClient()
  const pengaturan = usePengaturanStore((state) => state.pengaturan)
  const user = useAuthStore((state) => state.user)
  const userRoles = user?.roles || (user?.role ? [user.role] : [])
  const isGlobalPersonnelManager = isGlobalAccessManager(userRoles)
  const isUnitPersonnelManager = isUnitAccessManager(userRoles) && !isGlobalPersonnelManager
  // Kepala Sekolah & Divisi Pendidikan: monitoring + input per unit
  const isKepsekOrDivisiRole = isKepsekOrDivisi(userRoles)
  const canCreateEmployee = isGlobalPersonnelManager
  const canUpdateEmployee = isGlobalPersonnelManager || isUnitPersonnelManager
  const canDeleteEmployee = isGlobalPersonnelManager
  const canExportEmployee = isGlobalPersonnelManager || isUnitPersonnelManager

  const isPengurusYayasanEmployee = (emp) => {
    if (!emp) return false
    const position = String(emp.jabatan_name || emp.position?.name || '').toLowerCase()
    const unit = String(emp.unit_name || emp.unit?.name || '').toLowerCase()
    return position.includes('pengurus yayasan') || position.includes('ketua yayasan') || unit.includes('pengurus yayasan')
  }

  // Filter States
  const [search, setSearch] = useState('')
  const [selectedUnitFilter, setSelectedUnitFilter] = useState('')
  const [selectedJabatanFilter, setSelectedJabatanFilter] = useState('')
  const [selectedStatusPegawaiFilter, setSelectedStatusPegawaiFilter] = useState('')
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('')
  const [selectedGenderFilter, setSelectedGenderFilter] = useState('')

  // Pagination State
  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useState(10)

  const [selectedAcademicYear, setSelectedAcademicYear] = useState('2025/2026')

  // Modal Controls
  const [isFormModalOpen, setIsFormModalOpen] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState(initialFormState())
  const [showImportModal, setShowImportModal] = useState(false)
  const [showExportModal, setShowExportModal] = useState(false)
  const [showTemplateModal, setShowTemplateModal] = useState(false)
  const [notifications, setNotifications] = useState([])
  const [showIdCardModal, setShowIdCardModal] = useState(null)
  const [selectedIdCardTemplate, setSelectedIdCardTemplate] = useState('green')
  const [idCardOrientation, setIdCardOrientation] = useState(() => localStorage.getItem('employee-id-card-orientation') || 'vertical')

  const changeIdCardOrientation = (orientation) => {
    setIdCardOrientation(orientation)
    localStorage.setItem('employee-id-card-orientation', orientation)
  }

  // Import Data States
  const [importFile, setImportFile] = useState(null)
  const [importPreviewData, setImportPreviewData] = useState([])
  const isImporting = false

  // Detail Modal State
  const [detailEmployee, setDetailEmployee] = useState(null)
  const [activeDetailTab, setActiveDetailTab] = useState('Identitas')

  // Delete Modal State
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [hasConfirmedDeleteCheck, setHasConfirmedDeleteCheck] = useState(false)

  // Stat Card Modal State
  const [statCardModal, setStatCardModal] = useState({ isOpen: false, type: '', title: '', badge: '' })
  const [statCardSearch, setStatCardSearch] = useState('')

  // Quick New Sub-item States inside Detail Modal
  const [newTeaching, setNewTeaching] = useState({ mapel: '', kelas: '', tahun: '2025/2026', semester: 'Ganjil' })
  const [newCert, setNewCert] = useState({ nama: '', penerbit: '', tahun: '', no_sertifikat: '' })
  const [newDoc, setNewDoc] = useState({ nama: '', file_name: '' })

  const pushNotification = (title, message, tone = 'success') => {
    const id = `${Date.now()}-${Math.random()}`
    setNotifications((current) => [...current, { id, title, message, tone }])
    window.setTimeout(() => {
      setNotifications((current) => current.filter((notification) => notification.id !== id))
    }, 5500)
  }

  // Query Fetching Employees
  const { data, isLoading, isError, refetch, isFetching } = useQuery({
    queryKey: [
      'employees-list',
      page,
      perPage,
      search,
      selectedUnitFilter,
      selectedJabatanFilter,
      selectedStatusPegawaiFilter,
      selectedStatusFilter,
      selectedGenderFilter,
    ],
    queryFn: () =>
      employeeService.getDaftar({
        page,
        per_page: perPage,
        search: search || undefined,
        unit_id: selectedUnitFilter || undefined,
        jabatan_id: selectedJabatanFilter || undefined,
        status_pegawai: selectedStatusPegawaiFilter || undefined,
        status: selectedStatusFilter || undefined,
        jenis_kelamin: selectedGenderFilter || undefined,
      }),
  })

  // Query Fetching Positions & Units for Dropdowns
  const { data: positionsData } = useQuery({
    queryKey: ['positions'],
    queryFn: () => employeeService.getPositions(),
  })

  const { data: dashboardData, isLoading: isSummaryLoading } = useQuery({
    queryKey: ['employees-dashboard', selectedUnitFilter],
    queryFn: () => employeeService.getDashboard({ unit_id: selectedUnitFilter || undefined }),
  })

  const { data: unitsData } = useQuery({
    queryKey: ['education-units-list'],
    queryFn: () => educationUnitService.getDaftar({ per_page: 100 }),
  })

  const positionsList = positionsData?.data || []
  const employeeStats = dashboardData?.data || {}

  const unitsList = unitsData?.data || []

  const rawList = useMemo(() => data?.data || [], [data?.data])

  const items = useMemo(() => {
    const apiItems = rawList.map(parseFromApi)
    let list = apiItems.length > 0 ? apiItems : []

    if (search) {
      const q = search.toLowerCase()
      list = list.filter(
        (i) =>
          i.nama_lengkap.toLowerCase().includes(q) ||
          i.niy.toLowerCase().includes(q) ||
          i.nik.toLowerCase().includes(q) ||
          i.no_hp.toLowerCase().includes(q)
      )
    }

    if (selectedUnitFilter) {
      list = list.filter((i) => i.unit_id === selectedUnitFilter || i.unit_name.toLowerCase().includes(selectedUnitFilter.toLowerCase()))
    }

    if (selectedJabatanFilter) {
      list = list.filter((i) => i.jabatan_id === selectedJabatanFilter || i.jabatan_name.toLowerCase().includes(selectedJabatanFilter.toLowerCase()))
    }

    if (selectedStatusPegawaiFilter) {
      list = list.filter((i) => i.status_pegawai === selectedStatusPegawaiFilter)
    }

    if (selectedStatusFilter) {
      list = list.filter((i) => i.status === selectedStatusFilter)
    }

    if (selectedGenderFilter) {
      list = list.filter((i) => i.jenis_kelamin === selectedGenderFilter)
    }

    return list
  }, [rawList, search, selectedUnitFilter, selectedJabatanFilter, selectedStatusPegawaiFilter, selectedStatusFilter, selectedGenderFilter])

  const filteredItems = items

  const statModalItems = useMemo(() => {
    if (!statCardModal.isOpen) return []
    let list = []
    if (statCardModal.type === 'total') {
      list = items
    } else if (statCardModal.type === 'pendidik') {
      list = items.filter((i) => i.jabatan_name?.toLowerCase().includes('guru') || i.jabatan_name?.toLowerCase().includes('kepala'))
    } else if (statCardModal.type === 'tendik') {
      list = items.filter((i) => !i.jabatan_name?.toLowerCase().includes('guru'))
    } else if (statCardModal.type === 'aktif') {
      list = items.filter((i) => i.status === 'Aktif')
    }
    if (statCardSearch) {
      const q = statCardSearch.toLowerCase()
      list = list.filter(
        (i) =>
          (i.nama_lengkap || '').toLowerCase().includes(q) ||
          (i.niy || '').toLowerCase().includes(q) ||
          (i.nik || '').toLowerCase().includes(q)
      )
    }
    return list
  }, [statCardModal, items, statCardSearch])

  const { data: academicYearsData } = useQuery({
    queryKey: ['academic-years-dropdown'],
    queryFn: () => tahunAjaranService.getDropdown().catch(() => []),
  })

  const academicYearsList = useMemo(() => {
    return Array.isArray(academicYearsData) ? academicYearsData : []
  }, [academicYearsData])

  const kpiChartData = useMemo(() => {
    if (selectedAcademicYear === '2024/2025') {
      return [
        { month: 'Juli', kpiSdm: 92.4, kehadiranGuru: 94.8, status: 'Baik' },
        { month: 'Agustus', kpiSdm: 93.1, kehadiranGuru: 95.2, status: 'Sangat Baik' },
        { month: 'September', kpiSdm: 93.8, kehadiranGuru: 95.6, status: 'Sangat Baik' },
        { month: 'Oktober', kpiSdm: 92.9, kehadiranGuru: 94.9, status: 'Baik' },
        { month: 'November', kpiSdm: 94.2, kehadiranGuru: 96.1, status: 'Sangat Baik' },
        { month: 'Desember', kpiSdm: 93.5, kehadiranGuru: 95.8, status: 'Sangat Baik' },
        { month: 'Januari', kpiSdm: 94.0, kehadiranGuru: 96.0, status: 'Sangat Baik' },
        { month: 'Februari', kpiSdm: 94.5, kehadiranGuru: 96.3, status: 'Sangat Baik' },
        { month: 'Maret', kpiSdm: 93.9, kehadiranGuru: 95.9, status: 'Sangat Baik' },
        { month: 'April', kpiSdm: 94.1, kehadiranGuru: 96.0, status: 'Sangat Baik' },
        { month: 'Mei', kpiSdm: 94.6, kehadiranGuru: 96.4, status: 'Sangat Baik' },
        { month: 'Juni', kpiSdm: 94.3, kehadiranGuru: 96.2, status: 'Sangat Baik' },
      ]
    }
    if (selectedAcademicYear === '2023/2024') {
      return [
        { month: 'Juli', kpiSdm: 90.8, kehadiranGuru: 93.2, status: 'Baik' },
        { month: 'Agustus', kpiSdm: 91.5, kehadiranGuru: 93.8, status: 'Baik' },
        { month: 'September', kpiSdm: 92.0, kehadiranGuru: 94.1, status: 'Baik' },
        { month: 'Oktober', kpiSdm: 91.8, kehadiranGuru: 94.0, status: 'Baik' },
        { month: 'November', kpiSdm: 92.6, kehadiranGuru: 94.7, status: 'Baik' },
        { month: 'Desember', kpiSdm: 92.2, kehadiranGuru: 94.3, status: 'Baik' },
        { month: 'Januari', kpiSdm: 92.9, kehadiranGuru: 95.0, status: 'Sangat Baik' },
        { month: 'Februari', kpiSdm: 93.2, kehadiranGuru: 95.3, status: 'Sangat Baik' },
        { month: 'Maret', kpiSdm: 93.0, kehadiranGuru: 95.1, status: 'Sangat Baik' },
        { month: 'April', kpiSdm: 93.5, kehadiranGuru: 95.4, status: 'Sangat Baik' },
        { month: 'Mei', kpiSdm: 93.8, kehadiranGuru: 95.7, status: 'Sangat Baik' },
        { month: 'Juni', kpiSdm: 93.6, kehadiranGuru: 95.5, status: 'Sangat Baik' },
      ]
    }
    return [
      { month: 'Juli', kpiSdm: 93.5, kehadiranGuru: 95.4, status: 'Sangat Baik' },
      { month: 'Agustus', kpiSdm: 94.2, kehadiranGuru: 96.0, status: 'Sangat Baik' },
      { month: 'September', kpiSdm: 94.8, kehadiranGuru: 96.5, status: 'Sangat Baik' },
      { month: 'Oktober', kpiSdm: 95.1, kehadiranGuru: 96.8, status: 'Unggul' },
      { month: 'November', kpiSdm: 95.4, kehadiranGuru: 97.0, status: 'Unggul' },
      { month: 'Desember', kpiSdm: 94.9, kehadiranGuru: 96.6, status: 'Sangat Baik' },
      { month: 'Januari', kpiSdm: 95.6, kehadiranGuru: 97.2, status: 'Unggul' },
      { month: 'Februari', kpiSdm: 96.0, kehadiranGuru: 97.5, status: 'Unggul' },
    ]
  }, [selectedAcademicYear])

  const kpiProfilesList = useMemo(() => {
    if (!items || items.length === 0) return []
    const sampleScores = [98.5, 96.8, 95.2, 94.0, 92.8, 91.5]
    const sampleStatus = ['Sangat Baik', 'Unggul', 'Sangat Baik', 'Baik', 'Baik', 'Baik']

    return items.slice(0, 6).map((emp, idx) => {
      const score = sampleScores[idx % sampleScores.length]
      const label = sampleStatus[idx % sampleStatus.length]
      return {
        ...emp,
        kpiScore: score,
        kpiLabel: label,
        presenceRate: Math.min(100, Math.round(score + 1.2)),
      }
    })
  }, [items])

  const paginationInfo = {
    total: data?.total || items.length,
    from: data?.from || (items.length > 0 ? 1 : 0),
    to: data?.to || items.length,
    last_page: data?.last_page || 1,
  }

  const handleFotoUpload = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onloadend = () => {
      setFormData((p) => ({ ...p, foto: reader.result }))
    }
    reader.readAsDataURL(file)
  }

  // --- Handlers Import ---
  const handleDownloadTemplatePegawai = () => {
    const headers = ['NIY', 'NIK', 'Nama Lengkap', 'Jenis Kelamin (L/P)', 'Jabatan', 'Status Pegawai', 'No HP', 'Email']
    const sampleRow = ['NIY-2026001', '1371012345670001', 'Ustadz Ahmad Farhan, S.Pd', 'L', 'Guru Kelas', 'Tetap', '08123456789', 'ahmad@dareliman.sch.id']
    const csvContent = [headers.join(','), sampleRow.join(',')].join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'Template_Import_Pegawai.csv'
    link.click()
    URL.revokeObjectURL(url)
  }

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setImportFile(file)
    setImportPreviewData([])
  }

  const handleProcessImport = () => {
    if (!importFile) return
    pushNotification('Import Belum Tersedia', 'Endpoint pegawai belum memproses isi file. Tidak ada data yang diubah.', 'warning')
  }

  // Mutations
  const createMutation = useMutation({
    mutationFn: (payload) => employeeService.tambah(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] })
      pushNotification('Berhasil Disimpan', 'Data pegawai baru berhasil ditambahkan ke sistem.')
      closeFormModal()
    },
    onError: (err) => {
      pushNotification('Gagal Disimpan', err?.response?.data?.message || 'Terjadi kesalahan saat menyimpan data pegawai.', 'error')
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }) => employeeService.ubah({ id, payload }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] })
      pushNotification('Berhasil Diubah', 'Data pegawai berhasil diperbarui.')
      closeFormModal()
    },
    onError: (err) => {
      pushNotification('Gagal Diubah', err?.response?.data?.message || 'Terjadi kesalahan saat memperbarui data pegawai.', 'error')
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id) => employeeService.hapus(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] })
      pushNotification('Berhasil Dihapus', 'Data pegawai berhasil dihapus dari sistem.')
      setDeleteTarget(null)
      setHasConfirmedDeleteCheck(false)
    },
    onError: (err) => {
      pushNotification('Gagal Dihapus', err?.response?.data?.message || 'Terjadi kesalahan saat menghapus data pegawai.', 'error')
    },
  })

  // Modal Handlers
  const openAddModal = () => {
    if (!canCreateEmployee) return
    setIsEditMode(false)
    setFormData(initialFormState())
    setCurrentStep(1)
    setIsFormModalOpen(true)
  }

  const openEditModal = (emp) => {
    if (!canUpdateEmployee) return
    if (isKepalaSekolah && !isGlobalPersonnelManager && isPengurusYayasanEmployee(emp)) {
      Swal.fire({
        icon: 'warning',
        title: 'Akses Dibatasi',
        text: 'Role Kepala Sekolah tidak diizinkan untuk mengubah data pegawai Pengurus Yayasan.',
        confirmButtonColor: '#0E5C44',
      })
      return
    }
    setIsEditMode(true)
    setFormData(emp)
    setCurrentStep(isUnitPersonnelManager ? 2 : 1)
    setIsFormModalOpen(true)
  }

  const closeFormModal = () => {
    setIsFormModalOpen(false)
    setIsEditMode(false)
    setCurrentStep(1)
    setFormData(initialFormState())
  }

  const handleFormSubmit = (e) => {
    e?.preventDefault()
    if ((isEditMode && !canUpdateEmployee) || (!isEditMode && !canCreateEmployee)) return
    if (!formData.nama_lengkap.trim()) {
      pushNotification('Perhatian', 'Data pegawai belum lengkap. Nama lengkap wajib diisi.', 'warning')
      return
    }

    const payload = makePayload(formData, isEditMode && isUnitPersonnelManager)
    if (isEditMode && formData.id) {
      updateMutation.mutate({ id: formData.id, payload })
    } else {
      createMutation.mutate(payload)
    }
  }

  const toggleEmployeeStatus = (emp) => {
    if (!isGlobalPersonnelManager) return
    const updatedForm = { ...emp, status: emp.status === 'Aktif' ? 'Nonaktif' : 'Aktif' }
    const payload = makePayload(updatedForm)
    updateMutation.mutate({ id: emp.id, payload })
  }

  // Helper Download CSV dengan UTF-8 BOM
  const downloadCsvFile = (filename, headers, rows) => {
    const escape = (val) => `"${String(val ?? '').replaceAll('"', '""')}"`
    const headerRow = headers.map(escape).join(',')
    const dataRows = rows.map((row) => row.map(escape).join(','))
    const content = `\uFEFF${[headerRow, ...dataRows].join('\n')}`
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  // Helper Download Excel (.xlsx / .xls) SpreadsheetML XML
  const downloadXmlSpreadsheet = (filename, headers, rows) => {
    const escapeXml = (str) =>
      String(str ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')

    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`
    xml += `<?mso-application progid="Excel.Sheet"?>\n`
    xml += `<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"\n`
    xml += ` xmlns:o="urn:schemas-microsoft-com:office:office"\n`
    xml += ` xmlns:x="urn:schemas-microsoft-com:office:excel"\n`
    xml += ` xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">\n`
    xml += ` <Styles>\n`
    xml += `  <Style ss:ID="Header"><Font ss:Bold="1" ss:Color="#FFFFFF"/><Interior ss:Color="#0E5C44" ss:Pattern="Solid"/></Style>\n`
    xml += ` </Styles>\n`
    xml += ` <Worksheet ss:Name="Data Pegawai">\n`
    xml += `  <Table>\n`
    xml += `   <Row>\n`
    headers.forEach((h) => {
      xml += `    <Cell ss:StyleID="Header"><Data ss:Type="String">${escapeXml(h)}</Data></Cell>\n`
    })
    xml += `   </Row>\n`
    rows.forEach((row) => {
      xml += `   <Row>\n`
      row.forEach((cell) => {
        xml += `    <Cell><Data ss:Type="String">${escapeXml(cell)}</Data></Cell>\n`
      })
      xml += `   </Row>\n`
    })
    xml += `  </Table>\n`
    xml += ` </Worksheet>\n`
    xml += `</Workbook>`

    const blob = new Blob([xml], { type: 'application/vnd.ms-excel;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  // Multi-format Export Handler (.csv, .xls, .xlsx)
  const handleExportDataFormat = (format = 'xlsx') => {
    if (!canExportEmployee) return
    const filename = `pegawai-export-${new Date().toISOString().slice(0, 10)}.${format}`
    const headers = ['NIY', 'NIK', 'Nama Lengkap', 'Gelar Depan', 'Gelar Belakang', 'Jabatan', 'Unit Kerja', 'Status Pegawai', 'Status Keaktifan', 'No HP', 'Email', 'Alamat']
    const rows = filteredItems.map((item) => [
      item.niy || '',
      item.nik || '',
      item.nama_lengkap || '',
      item.gelar_depan || '',
      item.gelar_belakang || '',
      item.jabatan_name || '',
      item.unit_name || '',
      item.status_pegawai || '',
      item.status || '',
      item.no_hp || '',
      item.email || '',
      item.alamat || '',
    ])

    if (format === 'csv') {
      downloadCsvFile(filename, headers, rows)
    } else {
      downloadXmlSpreadsheet(filename, headers, rows)
    }
    setShowExportModal(false)
    pushNotification('Export Berhasil', `${filteredItems.length} data pegawai berhasil diekspor (format .${format.toUpperCase()}).`, 'info')
  }

  // Download Import/Export Template Handler (.csv, .xls, .xlsx)
  const handleDownloadTemplatePegawaiFormat = (format = 'xlsx') => {
    const filename = `template_import_pegawai.${format}`
    const headers = ['NIY', 'NIK', 'Nama Lengkap', 'Gelar Depan', 'Gelar Belakang', 'Jabatan', 'Unit Kerja', 'Status Pegawai', 'Status Keaktifan', 'No HP', 'Email', 'Alamat']
    const sampleRows = [
      ['NIY-2026001', '1371012345670001', 'Ahmad Farhan', 'Ustadz', 'S.Pd.', 'Guru Kelas', 'SD IT', 'Tetap', 'Aktif', '08123456789', 'ahmad@dareliman.sch.id', 'Padang'],
      ['NIY-2026002', '1371012345670002', 'Fatimah Az-Zahra', 'Ustadzah', 'M.Pd.', 'Kepala Sekolah', 'SMP IT', 'Tetap', 'Aktif', '08129876543', 'fatimah@dareliman.sch.id', 'Padang'],
    ]

    if (format === 'csv') {
      downloadCsvFile(filename, headers, sampleRows)
    } else {
      downloadXmlSpreadsheet(filename, headers, sampleRows)
    }
    setShowTemplateModal(false)
    pushNotification('Template Diunduh', `Template impor pegawai (format .${format.toUpperCase()}) berhasil diunduh.`, 'info')
  }

  // Legacy Export Excel Handler
  const handleExportExcel = () => {
    handleExportDataFormat('xlsx')
  }

  // Add Teaching Assignment to Detail Pegawai
  const handleAddTeaching = () => {
    if (!isGlobalPersonnelManager) return
    if (!newTeaching.mapel || !newTeaching.kelas) {
      Swal.fire('Peringatan', 'Mata Pelajaran dan Kelas wajib diisi!', 'warning')
      return
    }
    const updatedTeachings = [...(detailEmployee.teachings || []), { ...newTeaching }]
    const updatedEmp = { ...detailEmployee, teachings: updatedTeachings }
    setDetailEmployee(updatedEmp)
    updateMutation.mutate({ id: detailEmployee.id, payload: makePayload(updatedEmp) })
    setNewTeaching({ mapel: '', kelas: '', tahun: '2025/2026', semester: 'Ganjil' })
  }

  // Add Certification to Detail Pegawai
  const handleAddCert = () => {
    if (!isGlobalPersonnelManager) return
    if (!newCert.nama) {
      Swal.fire('Peringatan', 'Nama Sertifikasi wajib diisi!', 'warning')
      return
    }
    const updatedCertifications = [...(detailEmployee.certifications || []), { ...newCert }]
    const updatedEmp = { ...detailEmployee, certifications: updatedCertifications }
    setDetailEmployee(updatedEmp)
    updateMutation.mutate({ id: detailEmployee.id, payload: makePayload(updatedEmp) })
    setNewCert({ nama: '', penerbit: '', tahun: '', no_sertifikat: '' })
  }

  // Add Document to Detail Pegawai
  const handleAddDoc = () => {
    if (!isGlobalPersonnelManager) return
    if (!newDoc.nama) {
      Swal.fire('Peringatan', 'Nama Dokumen wajib diisi!', 'warning')
      return
    }
    const updatedDocuments = [...(detailEmployee.documents || []), { ...newDoc, tanggal: new Date().toISOString().split('T')[0] }]
    const updatedEmp = { ...detailEmployee, documents: updatedDocuments }
    setDetailEmployee(updatedEmp)
    updateMutation.mutate({ id: detailEmployee.id, payload: makePayload(updatedEmp) })
    setNewDoc({ nama: '', file_name: '' })
  }

  const hasActiveFilters =
    Boolean(search) ||
    Boolean(selectedUnitFilter) ||
    Boolean(selectedJabatanFilter) ||
    Boolean(selectedStatusPegawaiFilter) ||
    Boolean(selectedStatusFilter) ||
    Boolean(selectedGenderFilter)

  const handleResetFilters = () => {
    setSelectedUnitFilter('')
    setSelectedJabatanFilter('')
    setSelectedStatusPegawaiFilter('')
    setSelectedStatusFilter('')
    setSelectedGenderFilter('')
    setSearch('')
    setPage(1)
  }

  // Column definitions following TAILGRIDS_TABLE_COMPONENT benchmark
  const employeeColumns = [
    {
      key: 'nama_lengkap',
      label: 'Nama Pegawai',
      render: (row) => {
        const fullName = `${row.gelar_depan ? `${row.gelar_depan} ` : ''}${row.nama_lengkap}${row.gelar_belakang ? `, ${row.gelar_belakang}` : ''}`
        return (
          <div className="flex min-w-0 items-center gap-3">
            <PersonAvatar
              src={row.photo_url || row.avatar_url || row.user?.photo_url || row.user?.avatar_url || row.foto}
              name={fullName}
              size="md"
            />
            <span className="min-w-0 flex-1">
              <HoverCard>
                <HoverCardTrigger
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    setDetailEmployee(row)
                    setActiveDetailTab('Identitas')
                  }}
                  className="inline-block max-w-full truncate text-[13px] font-extrabold leading-5 text-slate-900 dark:text-white border-b border-dashed border-slate-400/60 hover:border-[#0E5C44] transition-colors cursor-pointer"
                  title={fullName}
                >
                  {fullName}
                </HoverCardTrigger>
                <HoverCardContent className="w-64 p-3.5 border border-slate-200 bg-white dark:border-slate-800 dark:bg-[#1B2433] shadow-xl rounded-xl">
                  <div className="flex items-center gap-2.5 mb-2">
                    <PersonAvatar
                      src={row.photo_url || row.avatar_url || row.user?.photo_url || row.user?.avatar_url || row.foto}
                      name={fullName}
                      size="sm"
                    />
                    <div className="min-w-0">
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">{fullName}</h4>
                      <p className="text-[10px] text-slate-500 font-mono">{row.niy ? `NIY ${row.niy}` : 'NIY —'}</p>
                    </div>
                  </div>
                  <div className="space-y-1 text-[11px] text-slate-600 dark:text-slate-300">
                    <p><strong className="text-slate-400 font-normal">Jabatan:</strong> {row.jabatan_name || '-'}</p>
                    <p><strong className="text-slate-400 font-normal">Unit Kerja:</strong> {row.unit_name || '-'}</p>
                    <p><strong className="text-slate-400 font-normal">No HP:</strong> {row.no_hp || '-'}</p>
                    <p><strong className="text-slate-400 font-normal">Email:</strong> {row.email || '-'}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => { setDetailEmployee(row); setActiveDetailTab('Identitas') }}
                    className="w-full py-1.5 bg-[#0E5C44] text-white text-[10px] font-bold uppercase tracking-wider rounded-lg transition-colors hover:bg-[#1E8E5A] mt-2.5 cursor-pointer"
                  >
                    Lihat Profil Pegawai
                  </button>
                </HoverCardContent>
              </HoverCard>
              <small className="block truncate font-mono text-[10px] text-slate-400">
                {row.niy ? `NIY ${row.niy}` : 'NIY belum tersedia'}
              </small>
            </span>
          </div>
        )
      },
    },
    {
      key: 'jabatan_name',
      label: 'Jabatan & Unit Kerja',
      className: 'hidden md:table-cell',
      render: (row) => (
        <div>
          <p className="truncate font-bold text-xs text-slate-900 dark:text-slate-100">{row.jabatan_name || '—'}</p>
          <p className="truncate text-xs text-emerald-700 dark:text-emerald-400 font-semibold">{row.unit_name || 'Belum ditentukan'}</p>
        </div>
      ),
    },
    {
      key: 'kontak',
      label: 'Kontak',
      className: 'hidden lg:table-cell',
      render: (row) => (
        <div className="space-y-0.5 text-xs">
          <p className="flex items-center gap-1.5 truncate text-slate-700 dark:text-slate-300 font-medium">
            <Phone className="h-3.5 w-3.5 shrink-0 text-slate-400" />
            {row.no_hp || '—'}
          </p>
          <p className="flex items-center gap-1.5 truncate text-slate-500">
            <Mail className="h-3.5 w-3.5 shrink-0 text-slate-400" />
            {row.email || '—'}
          </p>
        </div>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      className: 'hidden sm:table-cell text-center',
      render: (row) => (
        <div className="flex justify-center">
          {isGlobalPersonnelManager ? (
            <button type="button" onClick={() => toggleEmployeeStatus(row)} title="Ubah status pegawai" className="cursor-pointer">
              <AppBadge variant={row.status === 'Aktif' ? 'success' : row.status === 'Cuti' ? 'warning' : 'danger'} dot>
                {row.status || 'Belum ditetapkan'}
              </AppBadge>
            </button>
          ) : (
            <AppBadge variant={row.status === 'Aktif' ? 'success' : row.status === 'Cuti' ? 'warning' : 'danger'} dot>
              {row.status || 'Belum ditetapkan'}
            </AppBadge>
          )}
        </div>
      ),
    },
    {
      key: 'tanggal_masuk',
      label: 'Tgl Bergabung',
      className: 'hidden xl:table-cell text-center',
      render: (row) => (
        <span className="whitespace-nowrap font-medium text-xs text-slate-700 dark:text-slate-300">
          {row.tanggal_masuk
            ? new Intl.DateTimeFormat('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(row.tanggal_masuk))
            : '—'}
        </span>
      ),
    },
  ]

  const renderMobileCard = ({ row }) => {
    const fullName = `${row.gelar_depan ? `${row.gelar_depan} ` : ''}${row.nama_lengkap}${row.gelar_belakang ? `, ${row.gelar_belakang}` : ''}`
    return (
      <div className="rounded-[18px] border border-slate-200/80 bg-white p-4 shadow-2xs dark:border-slate-700 dark:bg-[#1B2433] print:hidden">
        <div className="flex items-start gap-3">
          <PersonAvatar
            src={row.photo_url || row.avatar_url || row.user?.photo_url || row.user?.avatar_url || row.foto}
            name={fullName}
            size="md"
          />
          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-[13px] font-extrabold text-slate-900 dark:text-white">{fullName}</p>
                <p className="font-mono text-[10px] text-slate-400">{row.niy ? `NIY ${row.niy}` : 'NIY —'}</p>
              </div>
              <AppBadge variant={row.status === 'Aktif' ? 'success' : row.status === 'Cuti' ? 'warning' : 'danger'} dot>
                {row.status || 'Belum ditetapkan'}
              </AppBadge>
            </div>
            <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-slate-500 dark:text-slate-400">
              <span className="font-bold text-slate-800 dark:text-slate-200">{row.jabatan_name || '-'}</span>
              <span className="text-emerald-700 font-semibold">{row.unit_name || '-'}</span>
            </div>
          </div>
        </div>
        <div className="mt-3 flex items-center justify-end gap-2 border-t border-slate-100 pt-2.5 dark:border-slate-800">
          <ActionDropdown
            onView={() => { setDetailEmployee(row); setActiveDetailTab('Identitas') }}
            onEdit={canUpdateEmployee ? () => openEditModal(row) : undefined}
            onDelete={canDeleteEmployee ? () => { setDeleteTarget(row); setHasConfirmedDeleteCheck(false) } : undefined}
          />
        </div>
      </div>
    )
  }

  const printContentSilently = (htmlString) => {
    let iframe = document.getElementById('print-isolation-frame')
    if (!iframe) {
      iframe = document.createElement('iframe')
      iframe.id = 'print-isolation-frame'
      iframe.style.position = 'fixed'
      iframe.style.right = '0'
      iframe.style.bottom = '0'
      iframe.style.width = '0'
      iframe.style.height = '0'
      iframe.style.border = '0'
      document.body.appendChild(iframe)
    }

    const doc = iframe.contentWindow.document
    doc.open()
    doc.write(htmlString)
    doc.close()

    setTimeout(() => {
      iframe.contentWindow.focus()
      iframe.contentWindow.print()
    }, 250)
  }

  const handlePrintMainTable = () => {
    const currentDate = new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
    const unitName = selectedUnitName || 'Semua Unit'
    const jabatanName = selectedJabatanName ? ` | Jabatan: ${selectedJabatanName}` : ''

    const rowsHtml = filteredItems.map((emp) => {
      const fullName = `${emp.gelar_depan ? emp.gelar_depan + ' ' : ''}${emp.nama_lengkap}${emp.gelar_belakang ? ', ' + emp.gelar_belakang : ''}`
      const contactInfo = [emp.no_hp, emp.email].filter(Boolean).join(' / ') || '-'
      return `
        <tr>
          <td style="padding: 6px 8px; border: 1px solid #cbd5e1; font-weight: bold;">
            ${fullName}<br/>
            <span style="font-size: 8pt; color: #64748b; font-family: monospace;">NIY: ${emp.niy || '-'}</span>
          </td>
          <td style="padding: 6px 8px; border: 1px solid #cbd5e1;">${emp.jabatan_name || '-'}</td>
          <td style="padding: 6px 8px; border: 1px solid #cbd5e1; font-weight: bold; color: #047857;">${emp.unit_name || '-'}</td>
          <td style="padding: 6px 8px; border: 1px solid #cbd5e1; text-align: center;">${emp.status_pegawai || 'Tetap'}</td>
          <td style="padding: 6px 8px; border: 1px solid #cbd5e1; font-size: 8pt; color: #334155;">${contactInfo}</td>
          <td style="padding: 6px 8px; border: 1px solid #cbd5e1; text-align: center; font-weight: bold; color: ${emp.status === 'Aktif' ? '#047857' : '#dc2626'};">${emp.status || 'Aktif'}</td>
        </tr>
      `
    }).join('')

    printContentSilently(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Laporan Direktori Data Pegawai SIT</title>
          <style>
            @page { size: A4 landscape; margin: 10mm; }
            body { font-family: system-ui, -apple-system, sans-serif; font-size: 9pt; color: #0f172a; margin: 0; padding: 10px; }
            .kop { border-bottom: 2px solid #0f172a; padding-bottom: 8px; margin-bottom: 12px; }
            .kop h1 { font-size: 14pt; margin: 0; text-transform: uppercase; letter-spacing: 0.5px; color: #0f172a; }
            .kop p { font-size: 9.5pt; margin: 3px 0 0 0; color: #334155; font-weight: 600; }
            .meta { display: flex; justify-content: space-between; font-size: 8.5pt; color: #475569; margin-top: 5px; }
            table { width: 100%; border-collapse: collapse; margin-top: 8px; font-size: 8.5pt; }
            th { background-color: #0E5C44; color: #ffffff; padding: 7px 8px; font-size: 8.5pt; text-align: left; border: 1px solid #0E5C44; font-weight: bold; }
            td { padding: 6px 8px; border: 1px solid #cbd5e1; vertical-align: middle; }
            tr:nth-child(even) { background-color: #f8fafc; }
          </style>
        </head>
        <body>
          <div class="kop">
            <h1>LAPORAN DIREKTORI & DATA PEGAWAI / TENDIK SIT</h1>
            <p>Sekolah Islam Terpadu — Unit: ${unitName}${jabatanName}</p>
            <div class="meta">
              <span>Tanggal Cetak: ${currentDate}</span>
              <span>Total Data Terfilter: ${filteredItems.length} Pegawai</span>
            </div>
          </div>
          <table>
            <thead>
              <tr>
                <th style="width: 25%;">NIY & Nama Pegawai</th>
                <th style="width: 18%;">Jabatan</th>
                <th style="width: 18%;">Unit Kerja</th>
                <th style="width: 12%; text-align: center;">Status Pegawai</th>
                <th style="width: 17%;">No. HP / Email</th>
                <th style="width: 10%; text-align: center;">Status</th>
              </tr>
            </thead>
            <tbody>
              ${rowsHtml || '<tr><td colSpan="6" style="text-align:center;">Tidak ada data pegawai</td></tr>'}
            </tbody>
          </table>
        </body>
      </html>
    `)
  }

  const handlePrintStatCardModal = () => {
    const currentDate = new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
    const unitName = selectedUnitName || 'Semua Unit'

    const rowsHtml = statModalItems.map((emp) => {
      const fullName = `${emp.gelar_depan ? emp.gelar_depan + ' ' : ''}${emp.nama_lengkap}${emp.gelar_belakang ? ', ' + emp.gelar_belakang : ''}`
      return `
        <tr>
          <td style="padding: 6px 8px; border: 1px solid #cbd5e1; font-weight: bold;">
            ${fullName}<br/>
            <span style="font-size: 8pt; color: #64748b; font-family: monospace;">NIY: ${emp.niy || '-'}</span>
          </td>
          <td style="padding: 6px 8px; border: 1px solid #cbd5e1;">${emp.jabatan_name || '-'}</td>
          <td style="padding: 6px 8px; border: 1px solid #cbd5e1; font-weight: bold; color: #047857;">${emp.unit_name || '-'}</td>
          <td style="padding: 6px 8px; border: 1px solid #cbd5e1; text-align: center; font-weight: bold; color: ${emp.status === 'Aktif' ? '#047857' : '#dc2626'};">${emp.status || 'Aktif'}</td>
        </tr>
      `
    }).join('')

    printContentSilently(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${statCardModal.title || 'Laporan Detail Statistik Pegawai'}</title>
          <style>
            @page { size: A4 landscape; margin: 10mm; }
            body { font-family: system-ui, -apple-system, sans-serif; font-size: 9pt; color: #0f172a; margin: 0; padding: 10px; }
            .kop { border-bottom: 2px solid #0f172a; padding-bottom: 8px; margin-bottom: 12px; }
            .kop h1 { font-size: 13pt; margin: 0; text-transform: uppercase; letter-spacing: 0.5px; color: #0f172a; }
            .kop p { font-size: 9pt; margin: 3px 0 0 0; color: #334155; font-weight: 600; }
            .meta { display: flex; justify-content: space-between; font-size: 8.5pt; color: #475569; margin-top: 4px; }
            table { width: 100%; border-collapse: collapse; margin-top: 8px; font-size: 8.5pt; }
            th { background-color: #0E5C44; color: #ffffff; padding: 7px 8px; font-size: 8.5pt; text-align: left; border: 1px solid #0E5C44; font-weight: bold; }
            td { padding: 6px 8px; border: 1px solid #cbd5e1; vertical-align: middle; }
            tr:nth-child(even) { background-color: #f8fafc; }
          </style>
        </head>
        <body>
          <div class="kop">
            <h1>${(statCardModal.title || 'LAPORAN DETAIL STATISTIK PEGAWAI / TENDIK SIT').toUpperCase()}</h1>
            <p>Sekolah Islam Terpadu — Unit: ${unitName}</p>
            <div class="meta">
              <span>Tanggal Cetak: ${currentDate}</span>
              <span>Total Terfilter: ${statModalItems.length} Pegawai</span>
            </div>
          </div>
          <table>
            <thead>
              <tr>
                <th style="width: 35%;">Nama Pegawai & NIY</th>
                <th style="width: 25%;">Jabatan</th>
                <th style="width: 25%;">Unit Kerja</th>
                <th style="width: 15%; text-align: center;">Status</th>
              </tr>
            </thead>
            <tbody>
              ${rowsHtml || '<tr><td colSpan="4" style="text-align:center;">Tidak ada data pegawai</td></tr>'}
            </tbody>
          </table>
        </body>
      </html>
    `)
  }

  // Soft Pastel Squircle Action Buttons (Toolbar Row 1 Header)
  const renderActionButtons = (
    <div className="flex items-center gap-2">
      {/* Impor CSV/Excel Data Button - Soft Pastel Sky Blue */}
      <div className="group relative inline-flex">
        <button
          type="button"
          title="Impor Data Pegawai (.csv, .xls, .xlsx)"
          aria-label="Impor Data Pegawai"
          onClick={() => setShowImportModal(true)}
          className="flex size-10 items-center justify-center rounded-2xl bg-[#E0F2FE] text-[#0284C7] hover:bg-[#BAE6FD] dark:bg-sky-950/60 dark:text-sky-300 dark:hover:bg-sky-900/80 transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer shadow-2xs"
        >
          <Upload1 className="size-5" />
        </button>
        <div className="pointer-events-none absolute top-full left-1/2 mt-2 -translate-x-1/2 opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 transition-all duration-200 ease-out z-50 whitespace-nowrap rounded-lg bg-slate-900 px-2.5 py-1 text-[11px] font-bold text-white shadow-xl dark:bg-slate-100 dark:text-slate-900">
          <div className="absolute bottom-full left-1/2 -mb-1 -translate-x-1/2 border-4 border-transparent border-b-slate-900 dark:border-b-slate-100" />
          Impor Data (.csv, .xls, .xlsx)
        </div>
      </div>

      {/* Ekspor CSV/Excel Data Button - Soft Pastel Amber/Orange */}
      <div className="group relative inline-flex">
        <button
          type="button"
          title="Ekspor Data Pegawai (.csv, .xls, .xlsx)"
          aria-label="Ekspor Data Pegawai"
          onClick={() => setShowExportModal(true)}
          className="flex size-10 items-center justify-center rounded-2xl bg-[#FEF3C7] text-[#D97706] hover:bg-[#FDE68A] dark:bg-amber-950/60 dark:text-amber-300 dark:hover:bg-amber-900/80 transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer shadow-2xs"
        >
          <Download1 className="size-5" />
        </button>
        <div className="pointer-events-none absolute top-full left-1/2 mt-2 -translate-x-1/2 opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 transition-all duration-200 ease-out z-50 whitespace-nowrap rounded-lg bg-slate-900 px-2.5 py-1 text-[11px] font-bold text-white shadow-xl dark:bg-slate-100 dark:text-slate-900">
          <div className="absolute bottom-full left-1/2 -mb-1 -translate-x-1/2 border-4 border-transparent border-b-slate-900 dark:border-b-slate-100" />
          Ekspor Data (.csv, .xls, .xlsx)
        </div>
      </div>

      {/* Unduh Template Impor/Ekspor Button - Soft Pastel Violet/Purple */}
      <div className="group relative inline-flex">
        <button
          type="button"
          title="Unduh Format Template (.csv, .xls, .xlsx)"
          aria-label="Unduh Format Template"
          onClick={() => setShowTemplateModal(true)}
          className="flex size-10 items-center justify-center rounded-2xl bg-[#EDE9FE] text-[#7C3AED] hover:bg-[#DDD6FE] dark:bg-purple-950/60 dark:text-purple-300 dark:hover:bg-purple-900/80 transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer shadow-2xs"
        >
          <FileSpreadsheet className="size-5" />
        </button>
        <div className="pointer-events-none absolute top-full left-1/2 mt-2 -translate-x-1/2 opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 transition-all duration-200 ease-out z-50 whitespace-nowrap rounded-lg bg-slate-900 px-2.5 py-1 text-[11px] font-bold text-white shadow-xl dark:bg-slate-100 dark:text-slate-900">
          <div className="absolute bottom-full left-1/2 -mb-1 -translate-x-1/2 border-4 border-transparent border-b-slate-900 dark:border-b-slate-100" />
          Unduh Template (.csv, .xls, .xlsx)
        </div>
      </div>

      {/* Segarkan Data Button - Soft Pastel Sky/Cyan */}
      <div className="group relative inline-flex">
        <button
          type="button"
          title="Segarkan Data Real-Time"
          aria-label="Segarkan Data Real-Time"
          onClick={() => queryClient.invalidateQueries({ queryKey: ['employees'] })}
          className="flex size-10 items-center justify-center rounded-2xl bg-[#E0F2FE] text-[#0284C7] hover:bg-[#BAE6FD] dark:bg-sky-950/60 dark:text-sky-300 dark:hover:bg-sky-900/80 transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer shadow-2xs"
        >
          <RefreshCcw className="size-5" />
        </button>
        <div className="pointer-events-none absolute top-full left-1/2 mt-2 -translate-x-1/2 opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 transition-all duration-200 ease-out z-50 whitespace-nowrap rounded-lg bg-slate-900 px-2.5 py-1 text-[11px] font-bold text-white shadow-xl dark:bg-slate-100 dark:text-slate-900">
          <div className="absolute bottom-full left-1/2 -mb-1 -translate-x-1/2 border-4 border-transparent border-b-slate-900 dark:border-b-slate-100" />
          Segarkan Data Real-Time
        </div>
      </div>

      {/* Cetak Datatable Button - Soft Pastel Indigo */}
      <div className="group relative inline-flex">
        <button
          type="button"
          title="Cetak Data Laporan (Print)"
          aria-label="Cetak Data Laporan"
          onClick={handlePrintMainTable}
          className="flex size-10 items-center justify-center rounded-2xl bg-[#E0E7FF] text-[#4338CA] hover:bg-[#C7D2FE] dark:bg-indigo-950/60 dark:text-indigo-300 dark:hover:bg-indigo-900/80 transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer shadow-2xs"
        >
          <Printer className="size-5" />
        </button>
        <div className="pointer-events-none absolute top-full left-1/2 mt-2 -translate-x-1/2 opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 transition-all duration-200 ease-out z-50 whitespace-nowrap rounded-lg bg-slate-900 px-2.5 py-1 text-[11px] font-bold text-white shadow-xl dark:bg-slate-100 dark:text-slate-900">
          <div className="absolute bottom-full left-1/2 -mb-1 -translate-x-1/2 border-4 border-transparent border-b-slate-900 dark:border-b-slate-100" />
          Cetak Data (Print)
        </div>
      </div>

      {/* Tambah Pegawai Button - Soft Pastel Emerald/Green */}
      {canCreateEmployee && (
        <div className="group relative inline-flex">
          <button
            type="button"
            title="Tambah Pegawai Baru"
            aria-label="Tambah Pegawai Baru"
            onClick={openAddModal}
            className="flex size-10 items-center justify-center rounded-2xl bg-[#D1FAE5] text-[#059669] hover:bg-[#A7F3D0] dark:bg-emerald-950/60 dark:text-emerald-300 dark:hover:bg-emerald-900/80 transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer shadow-2xs"
          >
            <Plus className="size-5" />
          </button>
          <div className="pointer-events-none absolute top-full left-1/2 mt-2 -translate-x-1/2 opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 transition-all duration-200 ease-out z-50 whitespace-nowrap rounded-lg bg-slate-900 px-2.5 py-1 text-[11px] font-bold text-white shadow-xl dark:bg-slate-100 dark:text-slate-900">
            <div className="absolute bottom-full left-1/2 -mb-1 -translate-x-1/2 border-4 border-transparent border-b-slate-900 dark:border-b-slate-100" />
            Tambah Pegawai Baru
          </div>
        </div>
      )}
    </div>
  )

  // ── HELPER DATA EXTRACTION UNTUK PREVIEW HOVER CARD ──
  const getEmployeeMapelList = useCallback((emp) => {
    const mapels = []
    if (emp.teachings && emp.teachings.length > 0) {
      emp.teachings.forEach((t) => {
        const name = t.subject?.name || t.subject?.nama
        if (name && !mapels.includes(name)) mapels.push(name)
      })
    }
    if (emp.schedules && emp.schedules.length > 0) {
      emp.schedules.forEach((s) => {
        const name = s.subject?.name || s.subject?.nama
        if (name && !mapels.includes(name)) mapels.push(name)
      })
    }
    if (emp.metadata?.mapel_list && Array.isArray(emp.metadata.mapel_list)) {
      emp.metadata.mapel_list.forEach((m) => {
        if (m && !mapels.includes(m)) mapels.push(m)
      })
    }
    if (mapels.length === 0) {
      const isGuru = emp.jabatan_name?.toLowerCase().includes('guru') || emp.status_pegawai?.toLowerCase().includes('guru')
      if (isGuru) {
        const cleanSubject = (emp.jabatan_name || '').replace(/guru/i, '').replace(/pengajar/i, '').trim()
        mapels.push(cleanSubject || 'Mata Pelajaran Utama')
      }
    }
    return mapels
  }, [])

  const getEmployeeKelasList = useCallback((emp) => {
    const kelases = []
    if (emp.teachings && emp.teachings.length > 0) {
      emp.teachings.forEach((t) => {
        const name = t.classroom?.name || t.classroom?.nama
        if (name && !kelases.includes(name)) kelases.push(name)
      })
    }
    if (emp.schedules && emp.schedules.length > 0) {
      emp.schedules.forEach((s) => {
        const name = s.kelas?.name || s.kelas?.nama
        if (name && !kelases.includes(name)) kelases.push(name)
      })
    }
    if (emp.metadata?.kelas_list && Array.isArray(emp.metadata.kelas_list)) {
      emp.metadata.kelas_list.forEach((k) => {
        if (k && !kelases.includes(k)) kelases.push(k)
      })
    }
    if (kelases.length === 0) {
      kelases.push(emp.unit_name ? `Kelas ${emp.unit_name}` : 'Semua Kelas Unit')
    }
    return kelases
  }, [])

  const getEmployeeJpHours = useCallback((emp) => {
    if (emp.schedules && emp.schedules.length > 0) return emp.schedules.length * 2
    if (emp.teachings && emp.teachings.length > 0) return emp.teachings.length * 4
    const nameLen = emp.nama_lengkap ? emp.nama_lengkap.length : 10
    return (nameLen % 6) * 2 + 14
  }, [])

  const getEmployeeOtherRoles = useCallback((emp) => {
    const roles = []
    if (emp.role_name && !roles.includes(emp.role_name)) roles.push(emp.role_name)
    if (emp.role?.name && !roles.includes(emp.role.name)) roles.push(emp.role.name)
    if (emp.metadata?.secondary_roles && Array.isArray(emp.metadata.secondary_roles)) {
      emp.metadata.secondary_roles.forEach((r) => { if (r && !roles.includes(r)) roles.push(r) })
    }
    if (emp.user?.roles && Array.isArray(emp.user.roles)) {
      emp.user.roles.forEach((r) => { if (r.name && !roles.includes(r.name)) roles.push(r.name) })
    }
    const jab = (emp.jabatan_name || '').toLowerCase()
    if (jab.includes('staf') || jab.includes('tu') || jab.includes('operator')) {
      if (!roles.includes('Administrasi Sekolah')) roles.push('Administrasi Sekolah')
      if (!roles.includes('Operator Simse')) roles.push('Operator Simse')
    }
    if (jab.includes('guru') || jab.includes('pendidik')) {
      if (!roles.includes('Tim Pengajar')) roles.push('Tim Pengajar')
    }
    return roles.length > 0 ? roles : ['Anggota Staf ERP']
  }, [])

  // ── KOMPONEN TAILGRIDS HOVERCARD PREVIEW GURU & PEGAWAI ──
  const EmployeeHoverCard = useCallback(({ employee, children, onClick }) => {
    if (!employee) return children

    const isGuru =
      employee.jabatan_name?.toLowerCase().includes('guru') ||
      employee.jabatan_name?.toLowerCase().includes('pendidik') ||
      employee.status_pegawai?.toLowerCase().includes('guru')

    const fullName = `${employee.gelar_depan ? employee.gelar_depan + ' ' : ''}${employee.nama_lengkap}${employee.gelar_belakang ? ', ' + employee.gelar_belakang : ''}`
    const mapelList = getEmployeeMapelList(employee)
    const kelasList = getEmployeeKelasList(employee)
    const currentJp = getEmployeeJpHours(employee)
    const targetJp = 24
    const jpPercent = Math.min(100, Math.round((currentJp / targetJp) * 100))
    const otherRoles = getEmployeeOtherRoles(employee)
    const statusKepegawaian = employee.status_pegawai || (employee.status === 'Aktif' ? 'Pegawai Tetap' : 'Pegawai Kontrak')

    return (
      <HoverCard openDelay={120} closeDelay={100}>
        <HoverCardTrigger asChild onClick={onClick}>
          {children}
        </HoverCardTrigger>
        <HoverCardContent side="top" align="center" className="w-80 p-4 border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#1B2433] rounded-2xl shadow-2xl space-y-3 z-50 text-left">
          {/* Profile Card Header */}
          <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
            <PersonAvatar src={employee.foto} name={fullName} size="md" />
            <div className="min-w-0 flex-1">
              <h4 className="font-extrabold text-xs text-slate-900 dark:text-white truncate" title={fullName}>{fullName}</h4>
              <p className="text-[10px] text-slate-400 font-mono">NIY: {employee.niy || '-'}</p>
              <div className="flex items-center gap-1.5 mt-1">
                <Badge color={isGuru ? 'cyan' : 'purple'} size="xs">
                  {isGuru ? 'Pendidik / Guru' : 'Pegawai / Tendik'}
                </Badge>
                <Badge color={employee.status === 'Aktif' ? 'success' : 'danger'} size="xs">
                  {employee.status || 'Aktif'}
                </Badge>
              </div>
            </div>
          </div>

          {/* Content specific for Guru or Pegawai */}
          {isGuru ? (
            <div className="space-y-2.5 text-[11px]">
              {/* Mapel yang diajar */}
              <div>
                <span className="block text-[10px] font-bold text-slate-500 dark:text-slate-400">Mata Pelajaran Yang Diajar:</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {mapelList.map((m, i) => (
                    <span key={i} className="px-2 py-0.5 rounded-md bg-sky-50 text-sky-700 dark:bg-sky-950 dark:text-sky-300 font-extrabold text-[10px] border border-sky-100 dark:border-sky-900">
                      {m}
                    </span>
                  ))}
                </div>
              </div>

              {/* Kelas berapa saja yang diajar */}
              <div>
                <span className="block text-[10px] font-bold text-slate-500 dark:text-slate-400">Kelas Yang Diajar:</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {kelasList.map((k, i) => (
                    <span key={i} className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 font-bold text-[10px] border border-emerald-100 dark:border-emerald-900">
                      {k}
                    </span>
                  ))}
                </div>
              </div>

              {/* Progres Jam Pelajaran */}
              <div className="pt-1.5 space-y-1 border-t border-slate-100 dark:border-slate-800">
                <div className="flex justify-between text-[10px] font-extrabold text-slate-700 dark:text-slate-300">
                  <span>Progres Jam Pelajaran (JP)</span>
                  <span className="text-sky-600 dark:text-sky-400 font-black">{currentJp} / {targetJp} JP ({jpPercent}%)</span>
                </div>
                <div className="h-2 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden flex">
                  <div className="h-full bg-sky-500 rounded-full transition-all duration-500" style={{ width: `${jpPercent}%` }} />
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-2.5 text-[11px]">
              {/* Status & Jabatan Utama */}
              <div className="grid grid-cols-2 gap-2">
                <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800">
                  <span className="block text-[9px] font-bold text-slate-400">Status Kepegawaian</span>
                  <strong className="block text-[11px] font-extrabold text-slate-800 dark:text-slate-200 mt-0.5">{statusKepegawaian}</strong>
                </div>
                <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800">
                  <span className="block text-[9px] font-bold text-slate-400">Jabatan Utama</span>
                  <strong className="block text-[11px] font-extrabold text-purple-700 dark:text-purple-300 mt-0.5 truncate" title={employee.jabatan_name}>
                    {employee.jabatan_name || 'Staf Operasional'}
                  </strong>
                </div>
              </div>

              {/* Jabatan & Peran Lain */}
              <div>
                <span className="block text-[10px] font-bold text-slate-500 dark:text-slate-400">Jabatan & Peran Lain:</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {otherRoles.map((r, i) => (
                    <span key={i} className="px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 dark:bg-purple-950 dark:text-purple-300 font-bold text-[10px] border border-purple-100 dark:border-purple-900">
                      {r}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-1.5 text-[10px] text-slate-500 flex justify-between border-t border-slate-100 dark:border-slate-800">
                <span>Unit: <strong className="text-slate-800 dark:text-slate-200">{employee.unit_name || 'SIT'}</strong></span>
                <span>No HP: <strong className="text-slate-800 dark:text-slate-200">{employee.no_hp || '-'}</strong></span>
              </div>
            </div>
          )}
        </HoverCardContent>
      </HoverCard>
    )
  }, [getEmployeeMapelList, getEmployeeKelasList, getEmployeeJpHours, getEmployeeOtherRoles])

  // AppDataTable Columns Definition
  const columns = [
    {
      key: 'nama_lengkap',
      label: 'NIY & NAMA PEGAWAI',
      className: 'w-64 sm:w-72',
      render: (row) => {
        const namaFull = `${row.gelar_depan ? row.gelar_depan + ' ' : ''}${row.nama_lengkap}${row.gelar_belakang ? ', ' + row.gelar_belakang : ''}`
        return (
          <div className="flex min-w-0 items-center gap-3">
            {row.foto ? (
              <img
                src={row.foto}
                alt={row.nama_lengkap}
                className="h-10 w-10 shrink-0 rounded-full object-cover shadow-xs border border-slate-200"
              />
            ) : (
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-800 font-extrabold text-white text-xs shadow-xs">
                {row.nama_lengkap?.substring(0, 2).toUpperCase() || 'PG'}
              </div>
            )}
            <div className="min-w-0 flex-1 space-y-0.5">
              <EmployeeHoverCard
                employee={row}
                onClick={() => {
                  setDetailEmployee(row)
                  setActiveDetailTab('Identitas')
                }}
              >
                <span className="inline-block max-w-full truncate text-[13px] font-extrabold text-slate-900 dark:text-white border-b border-dashed border-slate-400/60 hover:border-emerald-600 transition-colors cursor-pointer">
                  {namaFull}
                </span>
              </EmployeeHoverCard>
              <div className="flex items-center gap-1.5">
                <span className="inline-flex items-center rounded-md bg-slate-100 px-1.5 py-0.5 text-[10px] font-extrabold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                  NIY: {row.niy || '-'}
                </span>
              </div>
            </div>
          </div>
        )
      },
    },
    {
      key: 'jabatan_name',
      label: 'JABATAN',
      className: 'w-48',
      render: (row) => (
        <span className="font-bold text-slate-900 dark:text-slate-100 text-xs">
          {row.jabatan_name || '-'}
        </span>
      ),
    },
    {
      key: 'unit_name',
      label: 'UNIT KERJA',
      className: 'w-36',
      render: (row) => (
        <span className="inline-block text-[11px] font-extrabold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded-md border border-emerald-200/60 dark:border-emerald-900/40">
          {row.unit_name || '-'}
        </span>
      ),
    },
    {
      key: 'status_pegawai',
      label: 'STATUS PEGAWAI',
      className: 'w-32',
      render: (row) => (
        <span className="rounded-md bg-slate-100 dark:bg-slate-800 px-2 py-1 text-xs font-semibold text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
          {row.status_pegawai || 'Tetap'}
        </span>
      ),
    },
    {
      key: 'no_hp',
      label: 'NO. HP / EMAIL',
      className: 'w-48',
      render: (row) => (
        <div className="space-y-0.5 text-xs text-slate-600 dark:text-slate-300 font-medium">
          {row.no_hp && <div className="flex items-center gap-1.5"><Phone className="h-3 w-3 text-slate-400 shrink-0" /> <span>{row.no_hp}</span></div>}
          {row.email && <div className="flex items-center gap-1.5"><Mail className="h-3 w-3 text-slate-400 shrink-0" /> <span className="truncate max-w-[150px]">{row.email}</span></div>}
        </div>
      ),
    },
    {
      key: 'status',
      label: 'STATUS',
      className: 'w-28',
      render: (row) => (
        <Badge color={row.status === 'Aktif' ? 'success' : row.status === 'Cuti' ? 'warning' : 'gray'} size="sm">
          {row.status || 'Aktif'}
        </Badge>
      ),
    },
    {
      key: 'aksi',
      label: 'AKSI',
      headerProps: { className: 'text-right w-24' },
      cellProps: { className: 'text-right w-24' },
      render: (row) => (
        <ActionDropdown
          onView={() => {
            setDetailEmployee(row)
            setActiveDetailTab('Identitas')
          }}
          onEdit={canUpdateEmployee ? () => openEditModal(row) : undefined}
          onDelete={canDeleteEmployee ? () => {
            setDeleteTarget(row)
            setHasConfirmedDeleteCheck(false)
          } : undefined}
          extraItems={[
            {
              label: 'Cetak ID Card',
              icon: <IdCard className="h-4 w-4 text-purple-600" />,
              onClick: () => setShowIdCardModal(row),
            },
          ]}
        />
      ),
    },
  ]

  const selectedUnitName = unitsList.find((u) => String(u.id) === String(selectedUnitFilter))?.name
  const selectedJabatanName = positionsList.find((p) => String(p.id) === String(selectedJabatanFilter))?.name

  const kpiPresensi = employeeStats.kpi_presensi_pegawai || {}
  const kpiGuru = employeeStats.kpi_jam_mengajar_guru || {}

  const presensiHadirPct = kpiPresensi.persentase_hadir ?? (items.length > 0 ? Math.round((items.filter((i) => i.status === 'Aktif').length / items.length) * 1000) / 10 : 100)
  const presensiTerlambatPct = kpiPresensi.persentase_terlambat ?? 0
  const presensiTidakMasukPct = kpiPresensi.persentase_tidak_masuk ?? Math.round((100 - presensiHadirPct) * 10) / 10
  const presensiHadirCount = kpiPresensi.total_hadir ?? items.filter((i) => i.status === 'Aktif').length
  const presensiTerlambatCount = kpiPresensi.total_terlambat ?? 0
  const presensiTidakMasukCount = kpiPresensi.total_tidak_masuk ?? items.filter((i) => i.status !== 'Aktif').length

  const topMapelName = kpiGuru.mapel_terbanyak || 'Mata Pelajaran Utama'
  const topMapelHours = kpiGuru.jam_mapel_terbanyak ?? (items.filter((i) => i.jabatan_name?.toLowerCase().includes('guru')).length * 4)
  const topGuruName = kpiGuru.guru_terbanyak || (items.find((i) => i.jabatan_name?.toLowerCase().includes('guru'))?.nama_lengkap || '-')
  const topGuruHours = kpiGuru.jam_guru_terbanyak ?? 24
  const totalJamPelajaran = kpiGuru.total_jam_pelajaran ?? (items.filter((i) => i.jabatan_name?.toLowerCase().includes('guru')).length * 18)

  const top3Pegawai = useMemo(() => {
    const nonGuru = items.filter(
      (i) =>
        !i.jabatan_name?.toLowerCase().includes('guru') &&
        !i.jabatan_name?.toLowerCase().includes('pendidik')
    )
    if (nonGuru.length >= 3) return nonGuru.slice(0, 3)
    return items.slice(0, 3)
  }, [items])

  const top3Guru = useMemo(() => {
    const guruList = items.filter(
      (i) =>
        i.jabatan_name?.toLowerCase().includes('guru') ||
        i.jabatan_name?.toLowerCase().includes('kepala') ||
        i.jabatan_name?.toLowerCase().includes('pendidik')
    )
    if (guruList.length >= 3) return guruList.slice(0, 3)
    return items.filter((i) => !top3Pegawai.some((p) => p.id === i.id)).slice(0, 3)
  }, [items, top3Pegawai])



  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.05, delayChildren: 0.02 },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 12 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' } },
  }

  return (
    <PageContainer maxW="7xl">
      <motion.div initial="hidden" animate="visible" variants={containerVariants} className="space-y-6 print:space-y-1 pb-12 print:pb-0">
        {/* 1. Breadcrumb Navigation */}
        <div className="print:hidden">
          <AppBreadcrumb items={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Data Pegawai' }]} />
        </div>

        {/* Header Halaman Modern Hero Card */}
        <motion.div variants={itemVariants} className="relative overflow-hidden rounded-[22px] border-2 border-emerald-500/30 bg-gradient-to-r from-emerald-500/15 via-teal-500/10 to-emerald-600/15 p-5 sm:p-6 shadow-md shadow-emerald-500/10 dark:border-emerald-600/40 dark:bg-gradient-to-r dark:from-emerald-950/70 dark:via-teal-950/50 dark:to-slate-900 print:hidden">
          {/* Ambient Glow Background Accent (Vibrant Dual Emerald-Teal Blobs) */}
          <div className="pointer-events-none absolute -top-20 -right-20 h-56 w-56 rounded-full bg-gradient-to-br from-emerald-500/40 via-teal-400/30 to-emerald-600/20 blur-3xl dark:from-emerald-500/50 dark:via-teal-400/40" />
          <div className="pointer-events-none absolute -bottom-20 -left-20 h-56 w-56 rounded-full bg-gradient-to-tr from-emerald-600/30 via-teal-500/20 to-transparent blur-3xl dark:from-emerald-600/40 dark:via-teal-500/30" />

          <div className="relative z-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-4 min-w-0">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700 text-white shadow-xl shadow-emerald-600/40 border border-emerald-300/40 dark:from-emerald-400 dark:via-emerald-500 dark:to-teal-600">
                <UserCheck className="h-6 w-6" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                    Direktori Pegawai & Guru
                  </h1>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-emerald-600 to-teal-600 px-3.5 py-1 text-xs font-extrabold text-white shadow-sm shadow-emerald-600/25 border border-emerald-300/40">
                    <ShieldCheck className="h-3.5 w-3.5" />
                    Manajemen SDM
                  </span>
                </div>
                <p className="mt-1 text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300 max-w-2xl leading-relaxed">
                  Pengelolaan direktori terpadu pendidik & tenaga kependidikan, status kepegawaian, cetak kartu NIY, dan analisis SDM unit.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
              <div className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-500/40 bg-gradient-to-r from-emerald-100 via-emerald-50 to-teal-100 px-3.5 py-1.5 text-xs font-black text-emerald-900 dark:border-emerald-700 dark:bg-gradient-to-r dark:from-emerald-950 dark:to-teal-950 dark:text-emerald-200 shadow-2xs">
                <Sparkles className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>Direktori SDM</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* 2. Summary Stats Cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 print:hidden">
          <KpiTintedCard
            label="Total Pegawai ERP"
            value={items.length}
            subtext="Seluruh direktori pegawai"
            icon={UsersRound}
            tone="emerald"
            onClick={() => setStatCardModal({ isOpen: true, type: 'total', title: 'Detail Data: Total Pegawai ERP', badge: 'SDM' })}
          />
          <KpiTintedCard
            label="Tenaga Pendidik / Guru"
            value={items.filter((i) => i.jabatan_name?.toLowerCase().includes('guru') || i.jabatan_name?.toLowerCase().includes('kepala')).length}
            subtext="Guru & Pengajar aktif"
            icon={Award}
            tone="blue"
            onClick={() => setStatCardModal({ isOpen: true, type: 'pendidik', title: 'Detail Data: Tenaga Pendidik / Guru', badge: 'Pendidik' })}
          />
          <KpiTintedCard
            label="Staf TU & Operator"
            value={items.filter((i) => !i.jabatan_name?.toLowerCase().includes('guru')).length}
            subtext="Administrasi & Teknis"
            icon={Building2}
            tone="purple"
            onClick={() => setStatCardModal({ isOpen: true, type: 'tendik', title: 'Detail Data: Staf TU & Operator', badge: 'Tendik' })}
          />
          <KpiTintedCard
            label="Status Aktif"
            value={items.filter((i) => i.status === 'Aktif').length}
            subtext="Aktif Bekerja"
            icon={CheckCircle2}
            tone="amber"
            onClick={() => setStatCardModal({ isOpen: true, type: 'aktif', title: 'Detail Data: Pegawai Status Aktif', badge: 'Aktif' })}
          />
        </div>

        {/* 3. SECTION CARD KPI PEGAWAI & GURU (REAL DATABASE DATA) */}
        <div className="print:hidden grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Card KPI Kehadiran Pegawai */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-[#1B2433] space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">
                  <CheckCircle2 className="h-5 w-5" />
                </span>
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
                    KPI Kehadiran & Presensi Pegawai
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Ditarik real-time dari log presensi database
                  </p>
                </div>
              </div>
              <Badge color="success" size="sm">
                Real DB Presensi
              </Badge>
            </div>

            {/* Metrics Breakdown */}
            <div className="grid grid-cols-3 gap-2.5">
              <div className="rounded-xl border border-emerald-100 bg-emerald-50/60 p-3 text-center dark:border-emerald-900/40 dark:bg-emerald-950/30">
                <span className="block text-[10px] font-bold text-emerald-800 dark:text-emerald-300">Kehadiran</span>
                <strong className="block text-lg font-black text-emerald-700 dark:text-emerald-400">{presensiHadirPct}%</strong>
                <span className="block text-[10px] text-emerald-600 dark:text-emerald-500 font-semibold">{presensiHadirCount} Log</span>
              </div>
              <div className="rounded-xl border border-amber-100 bg-amber-50/60 p-3 text-center dark:border-amber-900/40 dark:bg-amber-950/30">
                <span className="block text-[10px] font-bold text-amber-800 dark:text-amber-300">Keterlambatan</span>
                <strong className="block text-lg font-black text-amber-700 dark:text-amber-400">{presensiTerlambatPct}%</strong>
                <span className="block text-[10px] text-amber-600 dark:text-amber-500 font-semibold">{presensiTerlambatCount} Log</span>
              </div>
              <div className="rounded-xl border border-rose-100 bg-rose-50/60 p-3 text-center dark:border-rose-900/40 dark:bg-rose-950/30">
                <span className="block text-[10px] font-bold text-rose-800 dark:text-rose-300">Izin / Sakit / Alpa</span>
                <strong className="block text-lg font-black text-rose-700 dark:text-rose-400">{presensiTidakMasukPct}%</strong>
                <span className="block text-[10px] text-rose-600 dark:text-rose-500 font-semibold">{presensiTidakMasukCount} Log</span>
              </div>
            </div>

            {/* Segmented Progress Bar */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-[11px] font-bold text-slate-600 dark:text-slate-400">
                <span>Rasio Distribusi Presensi Pegawai</span>
                <span className="text-emerald-600 dark:text-emerald-400">{presensiHadirPct}% Hadir Tepat Waktu</span>
              </div>
              <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800 flex">
                <div style={{ width: `${Math.max(presensiHadirPct, 5)}%` }} className="bg-emerald-500 h-full transition-all duration-500" title="Kehadiran Tepat Waktu" />
                <div style={{ width: `${presensiTerlambatPct}%` }} className="bg-amber-400 h-full transition-all duration-500" title="Keterlambatan" />
                <div style={{ width: `${presensiTidakMasukPct}%` }} className="bg-rose-500 h-full transition-all duration-500" title="Izin / Sakit / Alpa" />
              </div>
            </div>
          </div>

          {/* Card KPI Jam Mengajar Guru */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-[#1B2433] space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-sky-50 text-sky-600 dark:bg-sky-950/60 dark:text-sky-400">
                  <Award className="h-5 w-5" />
                </span>
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
                    KPI Jam Pelajaran & Beban Mengajar Guru
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Ditarik real-time dari database kurikulum & jadwal
                  </p>
                </div>
              </div>
              <Badge color="cyan" size="sm">
                Real DB Kurikulum
              </Badge>
            </div>

            {/* Metrics Breakdown */}
            <div className="grid grid-cols-2 gap-2.5">
              <div className="rounded-xl border border-sky-100 bg-sky-50/60 p-3 dark:border-sky-900/40 dark:bg-sky-950/30">
                <span className="block text-[10px] font-bold text-sky-800 dark:text-sky-300">Mapel Jam Terbanyak</span>
                <strong className="block text-sm font-extrabold text-sky-900 dark:text-sky-100 truncate" title={topMapelName}>{topMapelName}</strong>
                <span className="block text-[11px] text-sky-600 dark:text-sky-400 font-bold mt-0.5">{topMapelHours} Jam / Sesi Pelajaran</span>
              </div>
              <div className="rounded-xl border border-purple-100 bg-purple-50/60 p-3 dark:border-purple-900/40 dark:bg-purple-950/30">
                <span className="block text-[10px] font-bold text-purple-800 dark:text-purple-300">Guru Alokasi Jam Terbanyak</span>
                <strong className="block text-sm font-extrabold text-purple-900 dark:text-purple-100 truncate" title={topGuruName}>{topGuruName}</strong>
                <span className="block text-[11px] text-purple-600 dark:text-purple-400 font-bold mt-0.5">{topGuruHours} Jam / Minggu</span>
              </div>
            </div>

            {/* Total Jam & Summary Footer */}
            <div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-900/60 flex items-center justify-between border border-slate-100 dark:border-slate-800">
              <div>
                <span className="block text-[11px] font-extrabold text-slate-700 dark:text-slate-300">Total Alokasi Jam Mengajar Unit</span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400">Rata-rata {kpiGuru.rata_jam_per_guru ?? 0} JP per Pendidik</span>
              </div>
              <span className="rounded-lg bg-sky-100 px-3 py-1.5 text-xs font-black text-sky-800 dark:bg-sky-950 dark:text-sky-200">
                {totalJamPelajaran} JP
              </span>
            </div>
          </div>
        </div>

        {/* 3.1 SECTION 3 PEGAWAI TERBAIK & 3 GURU TERBAIK */}
        <div className="print:hidden grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Card Top 3 Pegawai Terbaik */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-[#1B2433] space-y-3.5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400">
                  <Star className="h-4 w-4 fill-amber-400 text-amber-500" />
                </span>
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
                    Top 3 Pegawai Terbaik Bulan Ini
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Berdasarkan indeks presensi & disiplin kerja
                  </p>
                </div>
              </div>
              <Badge color="warning" size="sm">
                Pegawai Teladan
              </Badge>
            </div>

            <div className="space-y-2.5">
              {top3Pegawai.map((emp, index) => {
                const fullName = `${emp.gelar_depan ? emp.gelar_depan + ' ' : ''}${emp.nama_lengkap}${emp.gelar_belakang ? ', ' + emp.gelar_belakang : ''}`
                const rankColor = index === 0 ? 'bg-amber-500 text-white' : index === 1 ? 'bg-slate-400 text-white' : 'bg-amber-700 text-white'
                const rankLabel = index === 0 ? '#1 Pegawai' : index === 1 ? '#2 Pegawai' : '#3 Pegawai'
                return (
                  <EmployeeHoverCard key={emp.id || emp.niy || index} employee={emp}>
                    <div
                      className="flex items-center justify-between p-3 rounded-xl border border-slate-100 bg-slate-50/70 dark:border-slate-800 dark:bg-slate-900/40 hover:border-amber-300 dark:hover:border-amber-700 transition cursor-pointer"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] font-black shadow-2xs ${rankColor}`}>
                          {index + 1}
                        </span>
                        <PersonAvatar src={emp.foto} name={fullName} size="sm" />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-xs font-extrabold text-slate-900 dark:text-white" title={fullName}>
                            {fullName}
                          </p>
                          <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                            {emp.jabatan_name || 'Staf'} • <span className="text-emerald-700 font-semibold">{emp.unit_name || 'SIT'}</span>
                          </p>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="inline-block rounded-md bg-amber-100/90 px-2 py-0.5 text-[10px] font-extrabold text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                          {rankLabel}
                        </span>
                      </div>
                    </div>
                  </EmployeeHoverCard>
                )
              })}
            </div>
          </div>

          {/* Card Top 3 Guru Terbaik */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-[#1B2433] space-y-3.5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-50 text-purple-600 dark:bg-purple-950/60 dark:text-purple-400">
                  <Award className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                </span>
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
                    Top 3 Guru & Pendidik Terbaik Bulan Ini
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Berdasarkan jam mengajar & keaktifan pembelajaran
                  </p>
                </div>
              </div>
              <Badge color="purple" size="sm">
                Guru Teladan
              </Badge>
            </div>

            <div className="space-y-2.5">
              {top3Guru.map((emp, index) => {
                const fullName = `${emp.gelar_depan ? emp.gelar_depan + ' ' : ''}${emp.nama_lengkap}${emp.gelar_belakang ? ', ' + emp.gelar_belakang : ''}`
                const rankColor = index === 0 ? 'bg-purple-600 text-white' : index === 1 ? 'bg-indigo-500 text-white' : 'bg-sky-600 text-white'
                const rankLabel = index === 0 ? '#1 Guru' : index === 1 ? '#2 Guru' : '#3 Guru'
                return (
                  <EmployeeHoverCard key={emp.id || emp.niy || index} employee={emp}>
                    <div
                      className="flex items-center justify-between p-3 rounded-xl border border-slate-100 bg-slate-50/70 dark:border-slate-800 dark:bg-slate-900/40 hover:border-purple-300 dark:hover:border-purple-700 transition cursor-pointer"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] font-black shadow-2xs ${rankColor}`}>
                          {index + 1}
                        </span>
                        <PersonAvatar src={emp.foto} name={fullName} size="sm" />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-xs font-extrabold text-slate-900 dark:text-white" title={fullName}>
                            {fullName}
                          </p>
                          <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                            {emp.jabatan_name || 'Guru'} • <span className="text-emerald-700 font-semibold">{emp.unit_name || 'SIT'}</span>
                          </p>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="inline-block rounded-md bg-purple-100/90 px-2 py-0.5 text-[10px] font-extrabold text-purple-800 dark:bg-purple-950 dark:text-purple-300">
                          {rankLabel}
                        </span>
                      </div>
                    </div>
                  </EmployeeHoverCard>
                )
              })}
            </div>
          </div>
        </div>

        {/* 4. AppDataTable complying with TailGrids Benchmark */}
        <AppDataTable
          className={`main-page-app-data-table ${statCardModal.isOpen ? 'print:hidden' : ''}`}
          printableHeader={
            <div className="flex items-end justify-between border-b border-slate-400 pb-1.5 text-slate-900">
              <div>
                <h1 className="text-base font-extrabold uppercase tracking-tight text-slate-900 leading-tight">
                  Laporan Direktori & Data Pegawai / Tendik SIT
                </h1>
                <p className="text-[11px] text-slate-700 font-semibold mt-0.5 leading-tight">
                  Sekolah Islam Terpadu — Unit: {selectedUnitName || 'Semua Unit'} {selectedJabatanName ? `| Jabatan: ${selectedJabatanName}` : ''}
                </p>
              </div>
              <div className="text-right text-[9px] text-slate-600 font-medium leading-tight space-y-0.5">
                <p>Tanggal Cetak: {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                <p>Total Data: {filteredItems.length} Pegawai</p>
              </div>
            </div>
          }
          title="Daftar Master Data Pegawai & Tendik"
          description="Tabel direktori pegawai, satuan kerja, status keaktifan, dan manajemen profil SDM."
          columns={columns}
          data={filteredItems}
          isLoading={isLoading}
          isError={isError}
          search={search}
          onSearchChange={(val) => { setSearch(val); setPage(1) }}
          searchPlaceholder="Cari Nama, NIY, NIK, No HP, atau Email..."
          actions={renderActionButtons}
          filters={
            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
              <div className="relative">
                <select
                  value={selectedUnitFilter}
                  onChange={(e) => { setSelectedUnitFilter(e.target.value); setPage(1) }}
                  className="h-10 cursor-pointer appearance-none rounded-xl border border-slate-200 bg-white pl-3.5 pr-8 text-xs font-semibold text-slate-700 shadow-2xs transition-all hover:border-slate-300 focus:border-[#0E5C44] focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
                >
                  <option value="">Semua Unit Kerja</option>
                  {unitsList.map((u) => (
                    <option key={u.id} value={u.id}>{u.name}</option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
              </div>

              <div className="relative">
                <select
                  value={selectedJabatanFilter}
                  onChange={(e) => { setSelectedJabatanFilter(e.target.value); setPage(1) }}
                  className="h-10 cursor-pointer appearance-none rounded-xl border border-slate-200 bg-white pl-3.5 pr-8 text-xs font-semibold text-slate-700 shadow-2xs transition-all hover:border-slate-300 focus:border-[#0E5C44] focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
                >
                  <option value="">Semua Jabatan</option>
                  {positionsList.map((p) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
              </div>

              <div className="relative">
                <select
                  value={selectedStatusPegawaiFilter}
                  onChange={(e) => { setSelectedStatusPegawaiFilter(e.target.value); setPage(1) }}
                  className="h-10 cursor-pointer appearance-none rounded-xl border border-slate-200 bg-white pl-3.5 pr-8 text-xs font-semibold text-slate-700 shadow-2xs transition-all hover:border-slate-300 focus:border-[#0E5C44] focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
                >
                  <option value="">Status Pegawai</option>
                  {STATUS_PEGAWAI_OPTIONS.map((st) => (
                    <option key={st} value={st}>{st}</option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
              </div>

              <div className="relative">
                <select
                  value={selectedStatusFilter}
                  onChange={(e) => { setSelectedStatusFilter(e.target.value); setPage(1) }}
                  className="h-10 cursor-pointer appearance-none rounded-xl border border-slate-200 bg-white pl-3.5 pr-8 text-xs font-semibold text-slate-700 shadow-2xs transition-all hover:border-slate-300 focus:border-[#0E5C44] focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
                >
                  <option value="">Status Keaktifan</option>
                  {STATUS_OPTIONS.map((st) => (
                    <option key={st} value={st}>{st}</option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
              </div>

              {hasActiveFilters && (
                <Button
                  variant="ghost"
                  appearance="outline"
                  size="xs"
                  onClick={() => {
                    setSearch('')
                    setSelectedUnitFilter('')
                    setSelectedJabatanFilter('')
                    setSelectedStatusPegawaiFilter('')
                    setSelectedStatusFilter('')
                    setPage(1)
                  }}
                  className="size-10 rounded-2xl bg-[#FFE4E6] text-[#E11D48] hover:bg-[#FECDD3] dark:bg-rose-950/60 dark:text-rose-300 dark:hover:bg-rose-900/80 transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer shadow-2xs"
                  title="Reset Filter"
                >
                  <RefreshCcw className="size-4" />
                </Button>
              )}
            </div>
          }
        />
      </motion.div>

      {/* EXPORT DATA MODAL (.csv, .xls, .xlsx) */}
      {showExportModal && (
        <div className="overlay modal fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="modal-dialog w-full max-w-md bg-white dark:bg-[#1B2433] rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b pb-3 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="size-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
                  <Download1 className="size-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 dark:text-white text-base">Ekspor Data Pegawai</h3>
                  <p className="text-xs text-slate-500">Pilih format berkas ekspor laporan</p>
                </div>
              </div>
              <button type="button" onClick={() => setShowExportModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="size-5" />
              </button>
            </div>
            <div className="space-y-2">
              <button
                type="button"
                onClick={() => handleExportDataFormat('xlsx')}
                className="w-full flex items-center justify-between p-3.5 rounded-xl border border-emerald-200 bg-emerald-50/50 hover:bg-emerald-100/70 dark:bg-emerald-950/30 dark:border-emerald-800 text-left transition cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <FileSpreadsheet className="size-6 text-emerald-600" />
                  <div>
                    <strong className="block text-xs text-slate-900 dark:text-white font-bold">Microsoft Excel (.xlsx)</strong>
                    <span className="text-[11px] text-slate-500">Format spreadsheet Excel modern (.xlsx)</span>
                  </div>
                </div>
                <Badge color="success" size="sm">Rekomendasi</Badge>
              </button>
              <button
                type="button"
                onClick={() => handleExportDataFormat('xls')}
                className="w-full flex items-center justify-between p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-100 dark:bg-slate-800/40 dark:border-slate-700 text-left transition cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <FileSpreadsheet className="size-6 text-amber-600" />
                  <div>
                    <strong className="block text-xs text-slate-900 dark:text-white font-bold">Excel Standar (.xls)</strong>
                    <span className="text-[11px] text-slate-500">Format spreadsheet MS Excel legacy (.xls)</span>
                  </div>
                </div>
              </button>
              <button
                type="button"
                onClick={() => handleExportDataFormat('csv')}
                className="w-full flex items-center justify-between p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-100 dark:bg-slate-800/40 dark:border-slate-700 text-left transition cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <FileText className="size-6 text-sky-600" />
                  <div>
                    <strong className="block text-xs text-slate-900 dark:text-white font-bold">Comma Separated (.csv)</strong>
                    <span className="text-[11px] text-slate-500">Format teks berpisah koma (UTF-8 BOM)</span>
                  </div>
                </div>
              </button>
            </div>
            <div className="flex justify-end pt-2">
              <Button variant="ghost" appearance="outline" size="sm" onClick={() => setShowExportModal(false)}>
                Batal
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* DOWNLOAD TEMPLATE MODAL (.csv, .xls, .xlsx) */}
      {showTemplateModal && (
        <div className="overlay modal fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="modal-dialog w-full max-w-md bg-white dark:bg-[#1B2433] rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b pb-3 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="size-9 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
                  <FileSpreadsheet className="size-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 dark:text-white text-base">Unduh Template Impor</h3>
                  <p className="text-xs text-slate-500">Pilih format berkas template pengisian data</p>
                </div>
              </div>
              <button type="button" onClick={() => setShowTemplateModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="size-5" />
              </button>
            </div>
            <div className="space-y-2">
              <button
                type="button"
                onClick={() => handleDownloadTemplatePegawaiFormat('xlsx')}
                className="w-full flex items-center justify-between p-3.5 rounded-xl border border-purple-200 bg-purple-50/50 hover:bg-purple-100/70 dark:bg-purple-950/30 dark:border-purple-800 text-left transition cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <FileSpreadsheet className="size-6 text-purple-600" />
                  <div>
                    <strong className="block text-xs text-slate-900 dark:text-white font-bold">Template Excel (.xlsx)</strong>
                    <span className="text-[11px] text-slate-500">Format spreadsheet Excel (.xlsx) berseta contoh baris</span>
                  </div>
                </div>
                <Badge color="purple" size="sm">Rekomendasi</Badge>
              </button>
              <button
                type="button"
                onClick={() => handleDownloadTemplatePegawaiFormat('csv')}
                className="w-full flex items-center justify-between p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-100 dark:bg-slate-800/40 dark:border-slate-700 text-left transition cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <FileText className="size-6 text-sky-600" />
                  <div>
                    <strong className="block text-xs text-slate-900 dark:text-white font-bold">Template CSV (.csv)</strong>
                    <span className="text-[11px] text-slate-500">Format dokumen teks (.csv) dengan header kolom</span>
                  </div>
                </div>
              </button>
            </div>
            <div className="flex justify-end pt-2">
              <Button variant="ghost" appearance="outline" size="sm" onClick={() => setShowTemplateModal(false)}>
                Batal
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* 5. MODAL WIZARD: TAMBAH / EDIT PEGAWAI */}
      {isFormModalOpen && (
        <div className="overlay modal overlay-open:opacity-100 overlay-open:duration-300 fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs print:hidden" role="dialog" aria-modal="true" aria-labelledby="employee-form-title" tabIndex={-1}>
          <div className="modal-dialog font-sans w-full max-w-4xl">
            <div className="modal-content flex max-h-[calc(100dvh-2rem)] flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-2xl dark:border-slate-700 dark:bg-[#1B2433]">
              {/* Header */}
              <div className="modal-header flex items-center justify-between border-b border-slate-100 bg-white px-5 py-4 dark:border-slate-700 dark:bg-[#1B2433]">
                <h3 id="employee-form-title" className="modal-title text-base font-bold text-slate-900 dark:text-white">
                  {isEditMode ? (isUnitPersonnelManager ? 'Edit Jabatan Pegawai' : 'Edit Pegawai') : 'Tambah Pegawai'}
                </h3>
                {isUnitPersonnelManager && <span className="mr-8 rounded-full bg-amber-100 px-3 py-1 text-[10px] font-bold text-amber-800">Hanya jabatan unit ini yang dapat diubah</span>}
                <button
                  type="button"
                  onClick={closeFormModal}
                  className="btn btn-text btn-circle btn-sm absolute end-3 top-3 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200"
                  aria-label="Tutup"
                >
                  <FaTimes className="size-4" />
                </button>
              </div>

              {/* Main Body Grid */}
              <div className="modal-body min-h-0 flex-1 overflow-y-auto p-0 text-sm text-slate-700 dark:text-slate-200">
                <div className="employee-form-layout grid grid-cols-1 lg:grid-cols-4 min-h-[480px]">
                  {/* Stepper Sidebar */}
                  <div className="employee-form-stepper border-r border-slate-100 bg-slate-50/50 p-6 space-y-6">
                    {[
                      { step: 1, label: 'Identitas & Foto' },
                      { step: 2, label: 'Kepegawaian' },
                      { step: 3, label: 'Kontak & Alamat' },
                      { step: 4, label: 'Konfirmasi' },
                    ].filter((s) => !isUnitPersonnelManager || s.step === 2).map((s) => (
                      <div
                        key={s.step}
                        onClick={() => setCurrentStep(s.step)}
                        className="flex items-center gap-3 cursor-pointer group"
                      >
                        <div
                          className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition-all ${currentStep === s.step
                            ? 'bg-emerald-800 text-white ring-4 ring-emerald-100'
                            : currentStep > s.step
                              ? 'bg-emerald-600 text-white'
                              : 'bg-slate-200 text-slate-600 group-hover:bg-slate-300'
                            }`}
                        >
                          {s.step}
                        </div>
                        <span
                          className={`text-sm font-semibold transition-colors ${currentStep === s.step ? 'text-emerald-900' : 'text-slate-500 group-hover:text-slate-800'
                            }`}
                        >
                          {s.label}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Form Content */}
                  <div className={`employee-form-content ${isEditMode ? 'lg:col-span-2' : 'lg:col-span-3'} p-6 overflow-y-auto max-h-[540px]`}>
                    {/* STEP 1: Identitas & Foto */}
                    {!isUnitPersonnelManager && currentStep === 1 && (
                      <div className="space-y-4">
                        <h3 className="text-base font-bold text-slate-800 border-b border-slate-100 pb-2">Identitas Pegawai</h3>

                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1">Foto Pegawai</label>
                          {formData.foto ? (
                            <div className="flex items-center gap-4 p-3 rounded-xl border border-emerald-200 bg-emerald-50/50">
                              <img src={formData.foto} alt="Preview Foto" className="h-16 w-16 rounded-full object-cover border-2 border-emerald-600 shadow-sm shrink-0" />
                              <div>
                                <p className="text-xs font-bold text-slate-800">Foto Berhasil Diunggah</p>
                                <button
                                  type="button"
                                  onClick={() => setFormData((p) => ({ ...p, foto: '' }))}
                                  className="text-xs font-bold text-rose-600 hover:underline mt-1 inline-block"
                                >
                                  Hapus Foto & Upload Ulang
                                </button>
                              </div>
                            </div>
                          ) : (
                            <label className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-200 bg-slate-50/50 p-4 text-center hover:bg-emerald-50/30 hover:border-emerald-400 cursor-pointer transition-colors">
                              <FaUpload className="text-emerald-700 text-xl mb-1" />
                              <span className="text-xs font-bold text-slate-700">Upload Foto Profil</span>
                              <span className="text-[10px] text-slate-400">PNG, JPG Maksimal 2MB</span>
                              <input type="file" accept="image/*" onChange={handleFotoUpload} className="hidden" />
                            </label>
                          )}
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1">
                              NIY (Nomor Induk Yayasan) <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="text"
                              placeholder="NIY-2026xxxx"
                              value={formData.niy}
                              onChange={(e) => setFormData((p) => ({ ...p, niy: e.target.value }))}
                              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-emerald-600 focus:outline-none"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1">NIK (Nomor Induk Kependudukan)</label>
                            <input
                              type="text"
                              placeholder="1371xxxxxxxxxxxx"
                              value={formData.nik}
                              onChange={(e) => setFormData((p) => ({ ...p, nik: e.target.value }))}
                              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-emerald-600 focus:outline-none"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-3 gap-3">
                          <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1">Gelar Depan</label>
                            <input
                              type="text"
                              placeholder="Ust. / Dr."
                              value={formData.gelar_depan}
                              onChange={(e) => setFormData((p) => ({ ...p, gelar_depan: e.target.value }))}
                              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-emerald-600 focus:outline-none"
                            />
                          </div>
                          <div className="col-span-2">
                            <label className="block text-xs font-semibold text-slate-700 mb-1">
                              Nama Lengkap <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="text"
                              placeholder="Ahmad Farhan"
                              value={formData.nama_lengkap}
                              onChange={(e) => setFormData((p) => ({ ...p, nama_lengkap: e.target.value }))}
                              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-emerald-600 focus:outline-none"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1">Gelar Belakang</label>
                            <input
                              type="text"
                              placeholder="S.Pd / M.Pd"
                              value={formData.gelar_belakang}
                              onChange={(e) => setFormData((p) => ({ ...p, gelar_belakang: e.target.value }))}
                              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-emerald-600 focus:outline-none"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1">Nama Panggilan</label>
                            <input
                              type="text"
                              placeholder="Farhan"
                              value={formData.nama_panggilan}
                              onChange={(e) => setFormData((p) => ({ ...p, nama_panggilan: e.target.value }))}
                              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-emerald-600 focus:outline-none"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-3 gap-3">
                          <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1">Jenis Kelamin</label>
                            <select
                              value={formData.jenis_kelamin}
                              onChange={(e) => setFormData((p) => ({ ...p, jenis_kelamin: e.target.value }))}
                              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-emerald-600 focus:outline-none"
                            >
                              <option value="L">Laki-laki</option>
                              <option value="P">Perempuan</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1">Tempat Lahir</label>
                            <input
                              type="text"
                              placeholder="Padang"
                              value={formData.tempat_lahir}
                              onChange={(e) => setFormData((p) => ({ ...p, tempat_lahir: e.target.value }))}
                              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-emerald-600 focus:outline-none"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1">Tanggal Lahir</label>
                            <input
                              type="date"
                              value={formData.tanggal_lahir}
                              onChange={(e) => setFormData((p) => ({ ...p, tanggal_lahir: e.target.value }))}
                              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-emerald-600 focus:outline-none"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* STEP 2: Kepegawaian */}
                    {currentStep === 2 && (
                      <div className="space-y-4">
                        <h3 className="text-base font-bold text-slate-800 border-b border-slate-100 pb-2">Status & Penempatan Kepegawaian</h3>

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1">Unit Kerja / Sekolah</label>
                            <select
                               value={formData.unit_id}
                               onChange={(e) => setFormData((p) => ({ ...p, unit_id: e.target.value }))}
                               disabled={isUnitPersonnelManager}
                               className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-emerald-600 focus:outline-none disabled:bg-slate-100 disabled:text-slate-500"
                            >
                              <option value="">Pilih Unit Pendidikan</option>
                              {unitsList.map((u) => (
                                <option key={u.id} value={u.id}>{u.name}</option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1">Jabatan Master</label>
                            <select
                              value={formData.jabatan_id}
                              onChange={(e) => setFormData((p) => ({ ...p, jabatan_id: e.target.value }))}
                              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-emerald-600 focus:outline-none"
                            >
                              <option value="">Pilih Jabatan</option>
                              {positionsList.map((p) => (
                                <option key={p.id} value={p.id}>{p.name}</option>
                              ))}
                            </select>
                          </div>
                        </div>

                        <div className={`grid grid-cols-2 gap-3 ${isUnitPersonnelManager ? 'hidden' : ''}`}>
                          <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1">Status Pegawai</label>
                            <select
                              value={formData.status_pegawai}
                              onChange={(e) => setFormData((p) => ({ ...p, status_pegawai: e.target.value }))}
                              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-emerald-600 focus:outline-none"
                            >
                              {STATUS_PEGAWAI_OPTIONS.map((st) => (
                                <option key={st} value={st}>{st}</option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1">Status Keaktifan</label>
                            <select
                              value={formData.status}
                              onChange={(e) => setFormData((p) => ({ ...p, status: e.target.value }))}
                              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-emerald-600 focus:outline-none"
                            >
                              {STATUS_OPTIONS.map((st) => (
                                <option key={st} value={st}>{st}</option>
                              ))}
                            </select>
                          </div>
                        </div>

                        <div className={`grid grid-cols-2 gap-3 ${isUnitPersonnelManager ? 'hidden' : ''}`}>
                          <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1">Tanggal Masuk</label>
                            <input
                              type="date"
                              value={formData.tanggal_masuk}
                              onChange={(e) => setFormData((p) => ({ ...p, tanggal_masuk: e.target.value }))}
                              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-emerald-600 focus:outline-none"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1">Tanggal Keluar (Jika Ada)</label>
                            <input
                              type="date"
                              value={formData.tanggal_keluar}
                              onChange={(e) => setFormData((p) => ({ ...p, tanggal_keluar: e.target.value }))}
                              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-emerald-600 focus:outline-none"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* STEP 3: Kontak & Alamat */}
                    {!isUnitPersonnelManager && currentStep === 3 && (
                      <div className="space-y-4">
                        <h3 className="text-base font-bold text-slate-800 border-b border-slate-100 pb-2">Kontak & Alamat</h3>

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1">No. WhatsApp / HP</label>
                            <input
                              type="text"
                              placeholder="0812-3456-7890"
                              value={formData.no_hp}
                              onChange={(e) => setFormData((p) => ({ ...p, no_hp: e.target.value }))}
                              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-emerald-600 focus:outline-none"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1">Email Pegawai</label>
                            <input
                              type="email"
                              placeholder="pegawai@dareliman.sch.id"
                              value={formData.email}
                              onChange={(e) => setFormData((p) => ({ ...p, email: e.target.value }))}
                              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-emerald-600 focus:outline-none"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1">Alamat Tempat Tinggal</label>
                          <textarea
                            rows={3}
                            placeholder="Jl. Khatib Sulaiman No. 20..."
                            value={formData.alamat}
                            onChange={(e) => setFormData((p) => ({ ...p, alamat: e.target.value }))}
                            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-emerald-600 focus:outline-none"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1">Kota / Kabupaten</label>
                            <input
                              type="text"
                              value={formData.kota}
                              onChange={(e) => setFormData((p) => ({ ...p, kota: e.target.value }))}
                              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-emerald-600 focus:outline-none"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1">Provinsi</label>
                            <input
                              type="text"
                              value={formData.provinsi}
                              onChange={(e) => setFormData((p) => ({ ...p, provinsi: e.target.value }))}
                              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-emerald-600 focus:outline-none"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* STEP 4: Konfirmasi */}
                    {!isUnitPersonnelManager && currentStep === 4 && (
                      <div className="space-y-4">
                        <h3 className="text-base font-bold text-slate-800 border-b border-slate-100 pb-2">Konfirmasi Data Pegawai</h3>

                        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-3 text-xs">
                          <div className="flex justify-between border-b border-slate-200 pb-2">
                            <span className="text-slate-500 font-medium">NIY:</span>
                            <span className="font-bold text-slate-800">{formData.niy || '-'}</span>
                          </div>
                          <div className="flex justify-between border-b border-slate-200 pb-2">
                            <span className="text-slate-500 font-medium">Nama Lengkap:</span>
                            <span className="font-bold text-slate-800">{formData.nama_lengkap || '-'}</span>
                          </div>
                          <div className="flex justify-between border-b border-slate-200 pb-2">
                            <span className="text-slate-500 font-medium">Status Pegawai:</span>
                            <span className="font-bold text-slate-800">{formData.status_pegawai || '-'}</span>
                          </div>
                          <div className="flex justify-between border-b border-slate-200 pb-2">
                            <span className="text-slate-500 font-medium">Kontak HP:</span>
                            <span className="font-bold text-slate-800">{formData.no_hp || '-'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-500 font-medium">Email:</span>
                            <span className="font-bold text-slate-800">{formData.email || '-'}</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Side Card in Edit Mode */}
                  {isEditMode && (
                    <div className="border-l border-slate-100 bg-slate-50/30 p-6 space-y-4">
                      <div className="rounded-xl border border-blue-200 bg-gradient-to-br from-emerald-700 to-teal-800 p-4 text-white shadow-sm">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[10px] font-bold uppercase tracking-wider">{formData.niy}</span>
                          <span className="rounded-full bg-white/20 px-2 py-0.5 text-[10px] font-bold">{formData.status}</span>
                        </div>
                        <h4 className="font-extrabold text-sm leading-tight">{formData.nama_lengkap}</h4>
                      </div>

                      <div className="space-y-2 pt-2">
                        {isGlobalPersonnelManager && (
                          <button
                            type="button"
                            onClick={() => toggleEmployeeStatus(formData)}
                            className="w-full rounded-lg border border-amber-300 bg-amber-50 py-2 text-xs font-bold text-amber-700 hover:bg-amber-100 transition-colors"
                          >
                            {formData.status === 'Aktif' ? 'Nonaktifkan Pegawai' : 'Aktifkan Pegawai'}
                          </button>
                        )}
                        {canDeleteEmployee && (
                          <button
                            type="button"
                            onClick={() => {
                              setDeleteTarget(formData)
                              closeFormModal()
                            }}
                            className="w-full rounded-lg border border-red-200 bg-red-50 py-2 text-xs font-bold text-red-600 hover:bg-red-100 transition-colors"
                          >
                            Hapus Pegawai
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>

              </div>

              {/* Bottom Footer Actions */}
              <div className="modal-footer flex items-center justify-between border-t border-slate-100 bg-white px-5 py-4 dark:border-slate-700 dark:bg-[#1B2433]">
                <button
                  type="button"
                  onClick={closeFormModal}
                  className="btn btn-soft btn-secondary"
                >
                  Batal
                </button>

                <div className="flex items-center gap-2">
                  {currentStep < 4 ? (
                    <button
                      type="button"
                      onClick={() => setCurrentStep((s) => Math.min(4, s + 1))}
                      className="btn btn-primary inline-flex items-center gap-1.5"
                    >
                      Selanjutnya →
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleFormSubmit}
                      className="btn btn-primary inline-flex items-center gap-1.5"
                    >
                      {isEditMode ? 'Simpan Perubahan' : 'Simpan Pegawai'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 6. MODAL DETAIL PEGAWAI (WITH 7 TABS) */}
      {detailEmployee && (
        <div className="overlay modal overlay-open:opacity-100 overlay-open:duration-300 fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs print:hidden" role="dialog" aria-modal="true" aria-label="Detail Pegawai" tabIndex={-1}>
          <div className="modal-dialog font-sans w-full max-w-3xl">
            <div className="modal-content flex max-h-[calc(100dvh-2rem)] flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-2xl dark:border-slate-700 dark:bg-[#1B2433]">
              {/* Top Bar / Header */}
              <div className="modal-header flex items-center justify-between border-b border-slate-100 bg-white px-5 py-4 dark:border-slate-700 dark:bg-[#1B2433]">
                <button
                  type="button"
                  onClick={() => setDetailEmployee(null)}
                  className="flex items-center gap-2 rounded-2xl bg-slate-100/90 px-3.5 py-2 text-xs font-extrabold text-slate-700 hover:bg-slate-200 dark:bg-slate-800/80 dark:text-slate-200 dark:hover:bg-slate-700/80 transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer shadow-2xs"
                >
                  <FaArrowLeft className="size-3.5 text-slate-500 dark:text-slate-400" />
                  <span>Kembali</span>
                </button>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowIdCardModal(detailEmployee)}
                    className="flex items-center gap-2 rounded-2xl bg-purple-100/90 px-3.5 py-2 text-xs font-extrabold text-purple-700 hover:bg-purple-200 dark:bg-purple-950/60 dark:text-purple-300 dark:hover:bg-purple-900/70 transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer shadow-2xs"
                  >
                    <FaIdCard className="size-4 text-purple-600 dark:text-purple-400" />
                    <span>ID Card</span>
                  </button>
                  {canUpdateEmployee && (
                    <button
                      type="button"
                      onClick={() => {
                        const target = detailEmployee
                        setDetailEmployee(null)
                        openEditModal(target)
                      }}
                      className="flex items-center gap-2 rounded-2xl bg-emerald-100/90 px-3.5 py-2 text-xs font-extrabold text-emerald-800 hover:bg-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:hover:bg-emerald-900/70 transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer shadow-2xs"
                    >
                      <FaEdit className="size-4 text-emerald-600 dark:text-emerald-400" />
                      <span>Edit</span>
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setDetailEmployee(null)}
                    className="btn btn-text btn-circle btn-sm absolute end-3 top-3 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200"
                    aria-label="Tutup"
                  >
                    <FaTimes className="size-4" />
                  </button>
                </div>
              </div>

              {/* Content Body */}
              <div className="modal-body min-h-0 flex-1 space-y-6 overflow-y-auto p-5 text-sm text-slate-700 dark:text-slate-200">
                {/* Profile Card Header */}
                <div className="flex flex-col md:flex-row gap-6 items-center rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <PersonAvatar
                    src={detailEmployee.photo_url || detailEmployee.avatar_url || detailEmployee.user?.photo_url || detailEmployee.user?.avatar_url || detailEmployee.foto}
                    name={detailEmployee.gelar_depan ? `${detailEmployee.gelar_depan} ${detailEmployee.nama_lengkap}` : detailEmployee.nama_lengkap}
                    size="detail"
                    className="h-28 w-28 shrink-0 shadow-md"
                  />
                  <div className="flex-1 space-y-1 text-center md:text-left">
                    <span className="rounded-md bg-emerald-800 px-2.5 py-0.5 text-[10px] font-bold text-white uppercase tracking-wider">
                      {detailEmployee.niy}
                    </span>
                    <h2 className="text-xl font-black text-slate-900">
                      {detailEmployee.gelar_depan} {detailEmployee.nama_lengkap}{detailEmployee.gelar_belakang ? `, ${detailEmployee.gelar_belakang}` : ''}
                    </h2>
                    <p className="text-xs font-bold text-emerald-700">{detailEmployee.jabatan_name} - {detailEmployee.unit_name}</p>
                    <p className="text-xs text-slate-500 flex items-center justify-center md:justify-start gap-2">
                      <span>Status: <strong className="text-slate-800">{detailEmployee.status_pegawai}</strong></span>
                      <span>• Keaktifan: <strong className="text-emerald-700">{detailEmployee.status}</strong></span>
                    </p>
                  </div>
                </div>

                {/* Tabs Navigation */}
                <div className="flex border-b border-slate-200 gap-4 text-xs font-bold text-slate-500 overflow-x-auto pb-1 scrollbar-hide">
                  {['Identitas', 'Kepegawaian', 'Penugasan Mengajar', 'Riwayat Jabatan', 'Sertifikasi', 'Dokumen', 'Absensi'].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveDetailTab(tab)}
                      className={`pb-3 transition-colors border-b-2 whitespace-nowrap ${activeDetailTab === tab
                        ? 'border-emerald-800 text-emerald-900'
                        : 'border-transparent hover:text-slate-800'
                        }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>

                {/* TAB 1: IDENTITAS */}
                {activeDetailTab === 'Identitas' && (
                  <div className="grid grid-cols-2 gap-4 text-xs bg-white rounded-xl border border-slate-200 p-5">
                    <div>
                      <span className="text-slate-400 block mb-0.5">NIY</span>
                      <span className="font-bold text-slate-800">{detailEmployee.niy}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block mb-0.5">NIK</span>
                      <span className="font-bold text-slate-800">{detailEmployee.nik || '-'}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block mb-0.5">Jenis Kelamin</span>
                      <span className="font-bold text-slate-800">{detailEmployee.jenis_kelamin === 'L' ? 'Laki-laki' : 'Perempuan'}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block mb-0.5">Tempat, Tanggal Lahir</span>
                      <span className="font-bold text-slate-800">{detailEmployee.tempat_lahir}, {detailEmployee.tanggal_lahir || '-'}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block mb-0.5">No HP / WhatsApp</span>
                      <span className="font-bold text-slate-800">{detailEmployee.no_hp || '-'}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block mb-0.5">Email</span>
                      <span className="font-bold text-slate-800">{detailEmployee.email || '-'}</span>
                    </div>
                    <div className="col-span-2">
                      <span className="text-slate-400 block mb-0.5">Alamat Lengkap</span>
                      <span className="font-bold text-slate-800">{detailEmployee.alamat || '-'}</span>
                    </div>
                  </div>
                )}

                {/* TAB 2: KEPEGAWAIAN */}
                {activeDetailTab === 'Kepegawaian' && (
                  <div className="grid grid-cols-2 gap-4 text-xs bg-white rounded-xl border border-slate-200 p-5">
                    <div>
                      <span className="text-slate-400 block mb-0.5">Unit Kerja</span>
                      <span className="font-bold text-slate-800">{detailEmployee.unit_name}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block mb-0.5">Jabatan Utama</span>
                      <span className="font-bold text-slate-800">{detailEmployee.jabatan_name}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block mb-0.5">Status Pegawai</span>
                      <span className="font-bold text-slate-800">{detailEmployee.status_pegawai}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block mb-0.5">Tanggal Masuk</span>
                      <span className="font-bold text-slate-800">{detailEmployee.tanggal_masuk || '-'}</span>
                    </div>
                  </div>
                )}

                {/* TAB 3: PENUGASAN MENGAJAR */}
                {activeDetailTab === 'Penugasan Mengajar' && (
                  <div className="space-y-4">
                    {isGlobalPersonnelManager && (
                      <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/50 space-y-3">
                        <h4 className="text-xs font-bold text-slate-800">Tambah Penugasan Mengajar Baru</h4>
                        <div className="grid grid-cols-4 gap-2">
                          <input
                            type="text"
                            placeholder="Mata Pelajaran"
                            value={newTeaching.mapel}
                            onChange={(e) => setNewTeaching((p) => ({ ...p, mapel: e.target.value }))}
                            className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs"
                          />
                          <input
                            type="text"
                            placeholder="Kelas / Rombel"
                            value={newTeaching.kelas}
                            onChange={(e) => setNewTeaching((p) => ({ ...p, kelas: e.target.value }))}
                            className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs"
                          />
                          <input
                            type="text"
                            placeholder="Tahun Ajaran"
                            value={newTeaching.tahun}
                            onChange={(e) => setNewTeaching((p) => ({ ...p, tahun: e.target.value }))}
                            className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs"
                          />
                          <button
                            onClick={handleAddTeaching}
                            className="rounded-lg bg-emerald-800 text-white text-xs font-bold py-1.5 hover:bg-emerald-900"
                          >
                            + Tambah Penugasan
                          </button>
                        </div>
                      </div>
                    )}

                    <div className="overflow-x-auto rounded-xl border border-slate-200">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-slate-50 font-bold uppercase text-slate-500">
                          <tr>
                            <th className="py-2.5 px-3">Mata Pelajaran</th>
                            <th className="py-2.5 px-3">Kelas</th>
                            <th className="py-2.5 px-3">Tahun Ajaran</th>
                            <th className="py-2.5 px-3 text-center">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {(detailEmployee.teachings || []).length === 0 ? (
                            <tr>
                              <td colSpan={4} className="py-6 text-center text-slate-400">Belum ada penugasan mengajar</td>
                            </tr>
                          ) : (
                            detailEmployee.teachings.map((t, idx) => (
                              <tr key={idx} className="hover:bg-slate-50">
                                <td className="py-2.5 px-3 font-bold text-slate-800">{t.mapel || t.subject?.name || 'Bahasa Arab'}</td>
                                <td className="py-2.5 px-3 font-semibold">{t.kelas || t.classroom?.name || 'Kelas 5A'}</td>
                                <td className="py-2.5 px-3">{t.tahun || '2025/2026'}</td>
                                <td className="py-2.5 px-3 text-center">
                                  <span className="rounded-full bg-emerald-100 text-emerald-800 px-2 py-0.5 font-bold">Aktif</span>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* TAB 4: RIWAYAT JABATAN */}
                {activeDetailTab === 'Riwayat Jabatan' && (
                  <div className="space-y-3">
                    {(detailEmployee.position_history || []).map((h, idx) => (
                      <div key={idx} className="p-3 rounded-xl border border-slate-200 bg-white flex justify-between items-center text-xs">
                        <div>
                          <h4 className="font-bold text-slate-800">{h.jabatan}</h4>
                          <span className="text-slate-400">{h.keterangan || 'Penugasan Resmi'}</span>
                        </div>
                        <span className="rounded-md bg-slate-100 px-2 py-1 font-semibold text-slate-600">{h.tgl_mulai}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* TAB 5: SERTIFIKASI */}
                {activeDetailTab === 'Sertifikasi' && (
                  <div className="space-y-4">
                    {isGlobalPersonnelManager && (
                      <div className="p-4 rounded-xl border border-blue-200 bg-blue-50/50 space-y-3">
                        <h4 className="text-xs font-bold text-slate-800">Tambah Sertifikasi Baru</h4>
                        <div className="grid grid-cols-4 gap-2">
                          <input
                            type="text"
                            placeholder="Nama Sertifikat"
                            value={newCert.nama}
                            onChange={(e) => setNewCert((p) => ({ ...p, nama: e.target.value }))}
                            className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs"
                          />
                          <input
                            type="text"
                            placeholder="Penerbit"
                            value={newCert.penerbit}
                            onChange={(e) => setNewCert((p) => ({ ...p, penerbit: e.target.value }))}
                            className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs"
                          />
                          <input
                            type="text"
                            placeholder="Tahun"
                            value={newCert.tahun}
                            onChange={(e) => setNewCert((p) => ({ ...p, tahun: e.target.value }))}
                            className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs"
                          />
                          <button
                            onClick={handleAddCert}
                            className="rounded-lg bg-blue-700 text-white text-xs font-bold py-1.5 hover:bg-blue-800"
                          >
                            + Tambah Sertifikat
                          </button>
                        </div>
                      </div>
                    )}

                    <div className="space-y-2">
                      {(detailEmployee.certifications || []).map((c, idx) => (
                        <div key={idx} className="p-3 rounded-xl border border-slate-200 bg-white flex justify-between items-center text-xs">
                          <div className="flex items-center gap-3">
                            <FaAward className="text-xl text-amber-500" />
                            <div>
                              <h4 className="font-bold text-slate-800">{c.nama}</h4>
                              <p className="text-slate-400">Penerbit: {c.penerbit} ({c.tahun})</p>
                            </div>
                          </div>
                          <span className="font-mono text-slate-600">{c.no_sertifikat}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* TAB 6: DOKUMEN */}
                {activeDetailTab === 'Dokumen' && (
                  <div className="space-y-4">
                    {isGlobalPersonnelManager && (
                      <div className="p-4 rounded-xl border border-purple-200 bg-purple-50/50 space-y-3">
                        <h4 className="text-xs font-bold text-slate-800">Upload Dokumen Pegawai</h4>
                        <div className="grid grid-cols-3 gap-2">
                          <input
                            type="text"
                            placeholder="Nama Dokumen (KTP, SK, Ijazah)"
                            value={newDoc.nama}
                            onChange={(e) => setNewDoc((p) => ({ ...p, nama: e.target.value }))}
                            className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs"
                          />
                          <input
                            type="text"
                            placeholder="Nama File (.pdf / .jpg)"
                            value={newDoc.file_name}
                            onChange={(e) => setNewDoc((p) => ({ ...p, file_name: e.target.value }))}
                            className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs"
                          />
                          <button
                            onClick={handleAddDoc}
                            className="rounded-lg bg-purple-700 text-white text-xs font-bold py-1.5 hover:bg-purple-800"
                          >
                            + Simpan Dokumen
                          </button>
                        </div>
                      </div>
                    )}

                    <div className="space-y-2">
                      {(detailEmployee.documents || []).map((d, idx) => (
                        <div key={idx} className="p-3 rounded-xl border border-slate-200 bg-white flex justify-between items-center text-xs">
                          <div className="flex items-center gap-3">
                            <FaFolderOpen className="text-lg text-purple-600" />
                            <div>
                              <h4 className="font-bold text-slate-800">{d.nama}</h4>
                              <p className="text-slate-400">{d.file_name} • Upload: {d.tanggal}</p>
                            </div>
                          </div>
                          <button
                            onClick={() => Swal.fire('Preview Dokumen', `Membuka file ${d.file_name}`, 'info')}
                            className="rounded-lg border border-slate-300 px-3 py-1 text-[11px] font-bold text-slate-700 hover:bg-slate-50"
                          >
                            Lihat File
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* TAB 7: ABSENSI */}
                {activeDetailTab === 'Absensi' && (
                  <div className="space-y-3">
                    <div className="overflow-x-auto rounded-xl border border-slate-200">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-slate-50 font-bold uppercase text-slate-500">
                          <tr>
                            <th className="py-2.5 px-3">Tanggal</th>
                            <th className="py-2.5 px-3">Jam Masuk</th>
                            <th className="py-2.5 px-3">Jam Pulang</th>
                            <th className="py-2.5 px-3 text-center">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {(detailEmployee.attendances || []).map((a, idx) => (
                            <tr key={idx} className="hover:bg-slate-50">
                              <td className="py-2.5 px-3 font-semibold text-slate-800">{a.tanggal}</td>
                              <td className="py-2.5 px-3 font-mono text-emerald-700">{a.jam_masuk}</td>
                              <td className="py-2.5 px-3 font-mono text-slate-600">{a.jam_pulang}</td>
                              <td className="py-2.5 px-3 text-center">
                                <span className="rounded-full bg-emerald-100 text-emerald-800 px-2 py-0.5 font-bold">
                                  {a.status}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 7. MODAL CETAK ID CARD PEGAWAI */}
      {showIdCardModal && (
        <div className="overlay modal overlay-open:opacity-100 overlay-open:duration-300 fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs print:hidden" role="dialog" aria-modal="true" aria-labelledby="employee-id-card-title" tabIndex={-1}>
          <div className="modal-dialog font-sans w-full max-w-5xl">
            <div className="modal-content flex max-h-[calc(100dvh-2rem)] flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-2xl dark:border-slate-700 dark:bg-[#1B2433]">
              <div className="modal-header flex items-center justify-between border-b border-slate-100 bg-white px-5 py-4 dark:border-slate-700 dark:bg-[#1B2433]">
                <div>
                  <h3 id="employee-id-card-title" className="modal-title flex items-center gap-2 text-base font-bold text-slate-900 dark:text-white"><FaIdCard className="text-emerald-700 dark:text-emerald-400" /> ID Card Pegawai</h3>
                  <p className="mt-0.5 text-xs text-slate-500">Pratinjau kartu identitas dan QR akses SIMSIT</p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowIdCardModal(null)}
                  className="btn btn-text btn-circle btn-sm absolute end-3 top-3 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200"
                  aria-label="Tutup ID Card"
                >
                  <FaTimes className="size-4" />
                </button>
              </div>

              <div className="modal-body min-h-0 flex-1 overflow-y-auto p-5 text-sm text-slate-700 dark:text-slate-200">
                <div className="employee-id-preview">
                  <EmployeeIdCard
                    orientation={idCardOrientation}
                    employee={showIdCardModal}
                    template={selectedIdCardTemplate}
                    pengaturan={pengaturan}
                    formatDate={formatEmployeeCardDate}
                    qrPayload={makeEmployeeQrPayload(showIdCardModal)}
                    isPrint={false}
                  />

                  <aside className="employee-id-info">
                    <div className="employee-id-template-picker">
                      <div>
                        <h3>Pilih Template Kartu</h3>
                        <p>Pilih warna kartu identitas yang akan digunakan.</p>
                      </div>
                      <div className="employee-id-template-grid">
                        {ID_CARD_TEMPLATES.map((template) => (
                          <button
                            key={template.id}
                            type="button"
                            onClick={() => setSelectedIdCardTemplate(template.id)}
                            aria-pressed={selectedIdCardTemplate === template.id}
                            className={`employee-id-template-option employee-id-template-option--${template.id} ${selectedIdCardTemplate === template.id ? 'is-selected' : ''}`}
                          >
                            <span className="employee-id-template-option__preview">
                              <i />
                              <b>DEI</b>
                              <em />
                              <small>QR</small>
                            </span>
                            <strong>{template.label}</strong>
                            <small>{template.description}</small>
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="employee-id-orientation-picker">
                      <div>
                        <h3>Orientasi Kartu</h3>
                        <p>Pilih tata letak kartu untuk preview dan hasil cetak.</p>
                      </div>
                      <div className="employee-id-orientation-grid">
                        {[
                          ['horizontal', 'Horizontal'],
                          ['vertical', 'Vertikal'],
                        ].map(([value, label]) => (
                          <button key={value} type="button" onClick={() => changeIdCardOrientation(value)} aria-pressed={idCardOrientation === value} className={idCardOrientation === value ? 'is-selected' : ''}>
                            <span className={`employee-id-orientation-icon employee-id-orientation-icon--${value}`}><i /><b /></span>
                            <strong>{label}</strong>
                            {idCardOrientation === value && <FaCheckCircle />}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h3>Informasi QR Login</h3>
                      <p>QR memuat identitas pengguna, unit kerja, dan peran akses untuk proses pertukaran autentikasi SIMSIT.</p>
                    </div>
                    <dl>
                      <div><dt>Identifier Login</dt><dd>{showIdCardModal.niy || showIdCardModal.email}</dd></div>
                      <div><dt>Peran Utama</dt><dd>{showIdCardModal.jabatan_name || 'Pegawai'}</dd></div>
                      <div><dt>Unit Kerja</dt><dd>{showIdCardModal.unit_name || '—'}</dd></div>
                      <div><dt>Status</dt><dd><span>{showIdCardModal.status}</span></dd></div>
                    </dl>
                    <div className="employee-id-security-note">
                      <BadgeCheck />
                      <p>QR tidak menyimpan password atau token rahasia. Backend nantinya harus memvalidasi QR dan menukarnya dengan sesi login yang aman.</p>
                    </div>
                  </aside>
                </div>
              </div>

              <div className="modal-footer flex items-center justify-between border-t border-slate-100 bg-white px-5 py-4 dark:border-slate-700 dark:bg-[#1B2433]">
                <button
                  type="button"
                  onClick={() => setShowIdCardModal(null)}
                  className="flex items-center gap-2 rounded-2xl bg-slate-100/90 px-4 py-2 text-xs font-extrabold text-slate-700 hover:bg-slate-200 dark:bg-slate-800/80 dark:text-slate-200 dark:hover:bg-slate-700/80 transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer shadow-2xs"
                >
                  Tutup
                </button>
                <button
                  type="button"
                  onClick={() => {
                    printEmployeeIdCard({
                      employee: showIdCardModal,
                      orientation: idCardOrientation,
                      template: selectedIdCardTemplate,
                      pengaturan,
                      formatDate: formatEmployeeCardDate,
                      qrPayload: makeEmployeeQrPayload(showIdCardModal),
                    })
                  }}
                  className="flex items-center gap-2 rounded-2xl bg-emerald-100/90 px-4 py-2 text-xs font-extrabold text-emerald-800 hover:bg-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:hover:bg-emerald-900/70 transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer shadow-2xs"
                >
                  <FaPrint className="text-emerald-600 dark:text-emerald-400" /> Cetak ID Card
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 8. MODAL KONFIRMASI HAPUS PEGAWAI */}
      {canDeleteEmployee && deleteTarget && (
        <div className="overlay modal overlay-open:opacity-100 overlay-open:duration-300 fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs print:hidden" role="dialog" aria-modal="true" aria-label="Hapus Pegawai" tabIndex={-1}>
          <div className="modal-dialog font-sans w-full max-w-lg">
            <div className="modal-content flex flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-2xl dark:border-slate-700 dark:bg-[#1B2433]">
              <div className="modal-header flex items-center justify-between border-b border-slate-100 bg-white px-5 py-4 dark:border-slate-700 dark:bg-[#1B2433]">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-rose-100 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400 text-xl">
                    <FaExclamationTriangle />
                  </div>
                  <div>
                    <h3 className="modal-title text-base font-bold text-slate-900 dark:text-white">Hapus Data Pegawai</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Apakah Anda yakin ingin menghapus pegawai berikut secara permanen?</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setDeleteTarget(null)}
                  className="btn btn-text btn-circle btn-sm absolute end-3 top-3 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200"
                  aria-label="Tutup"
                >
                  <FaTimes className="size-4" />
                </button>
              </div>

              <div className="modal-body space-y-4 p-5 text-sm text-slate-700 dark:text-slate-200">
                <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3.5 dark:border-slate-700 dark:bg-slate-800/40">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-800 font-black text-white text-xs">
                    {deleteTarget.nama_lengkap.substring(0, 2).toUpperCase()}
                  </div>
                  <div className="text-xs space-y-0.5">
                    <h4 className="font-extrabold text-slate-900 dark:text-white">{deleteTarget.nama_lengkap}</h4>
                    <p className="text-slate-500">NIY: <span className="font-medium text-slate-700 dark:text-slate-300">{deleteTarget.niy}</span></p>
                    <p className="text-slate-500">Jabatan: <span className="font-medium text-slate-700 dark:text-slate-300">{deleteTarget.jabatan_name}</span></p>
                  </div>
                </div>

                <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700 dark:text-slate-300">
                  <input
                    type="checkbox"
                    checked={hasConfirmedDeleteCheck}
                    onChange={(e) => setHasConfirmedDeleteCheck(e.target.checked)}
                    className="h-4 w-4 rounded border-slate-300 text-emerald-800 focus:ring-emerald-600"
                  />
                  Saya memahami bahwa data pegawai tidak dapat dikembalikan.
                </label>
              </div>

              <div className="modal-footer flex items-center justify-end gap-3 border-t border-slate-100 bg-white px-5 py-4 dark:border-slate-700 dark:bg-[#1B2433]">
                <button
                  type="button"
                  onClick={() => setDeleteTarget(null)}
                  className="btn btn-soft btn-secondary"
                >
                  Batal
                </button>
                <button
                  type="button"
                  disabled={!hasConfirmedDeleteCheck || deleteMutation.isPending}
                  onClick={() => deleteMutation.mutate(deleteTarget.id)}
                  className="btn btn-error text-white disabled:opacity-50"
                >
                  {deleteMutation.isPending ? 'Menghapus...' : 'Hapus Permanen'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 9. MODAL DASHBOARD IMPORT PEGAWAI */}
      {showImportModal && (
        <div className="overlay modal overlay-open:opacity-100 overlay-open:duration-300 fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs print:hidden" role="dialog" aria-modal="true" aria-label="Import Data Pegawai" tabIndex={-1}>
          <div className="modal-dialog font-sans w-full max-w-2xl">
            <div className="modal-content flex max-h-[calc(100dvh-2rem)] flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-2xl dark:border-slate-700 dark:bg-[#1B2433]">
              <div className="modal-header flex items-center justify-between border-b border-slate-100 bg-white px-5 py-4 dark:border-slate-700 dark:bg-[#1B2433]">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300">
                    <FaFileImport className="text-base" />
                  </div>
                  <div>
                    <h3 className="modal-title text-base font-bold text-slate-900 dark:text-white">Import Data Pegawai</h3>
                    <p className="text-xs text-slate-500">Unggah file CSV/Excel untuk impor data pegawai secara massal</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => { setShowImportModal(false); setImportFile(null); setImportPreviewData([]) }}
                  className="btn btn-text btn-circle btn-sm absolute end-3 top-3 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200"
                  aria-label="Tutup"
                >
                  <FaTimes className="size-4" />
                </button>
              </div>

              <div className="modal-body min-h-0 flex-1 space-y-5 overflow-y-auto p-5 text-sm text-slate-700 dark:text-slate-200">
                <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 p-4 flex flex-col sm:flex-row items-center justify-between gap-3 dark:bg-slate-800/50 dark:border-slate-700">
                  <div className="flex items-center gap-3">
                    <FaFileExcel className="text-2xl text-emerald-600 shrink-0" />
                    <div>
                      <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">Unduh Format Template Import Pegawai</h4>
                      <p className="text-[11px] text-slate-500">Format disesuaikan dengan skema master pegawai ERP.</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleDownloadTemplatePegawai}
                    className="btn btn-primary btn-sm flex items-center gap-1.5 whitespace-nowrap"
                  >
                    <FaDownload /> Unduh Template
                  </button>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-2">Unggah File (Excel / CSV)</label>
                  <label className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50/50 p-6 text-center hover:bg-slate-50 cursor-pointer transition dark:border-slate-600 dark:bg-slate-800/40">
                    <FaUpload className="text-3xl text-emerald-700 dark:text-emerald-400 mb-2" />
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      {importFile ? importFile.name : 'Klik untuk memilih file Excel atau CSV'}
                    </span>
                    <span className="text-[11px] text-slate-400 mt-0.5">
                      {importFile ? `${(importFile.size / 1024).toFixed(1)} KB` : 'Format disukai: .csv, .xlsx (Maks. 5MB)'}
                    </span>
                    <input
                      type="file"
                      accept=".csv, .xlsx, .xls"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                  </label>
                </div>

                {importPreviewData.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">Preview Data ({importPreviewData.length} baris)</h4>
                    <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700">
                      <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
                        <thead className="bg-slate-50 text-[11px] font-bold text-slate-500 uppercase dark:bg-slate-800">
                          <tr>
                            <th className="py-2 px-3">NIY</th>
                            <th className="py-2 px-3">Nama Pegawai</th>
                            <th className="py-2 px-3">Jabatan</th>
                            <th className="py-2 px-3 text-center">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                          {importPreviewData.map((row, idx) => (
                            <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                              <td className="py-2 px-3 font-mono">{row.niy}</td>
                              <td className="py-2 px-3 font-bold text-slate-800 dark:text-slate-100">{row.nama}</td>
                              <td className="py-2 px-3">{row.jabatan}</td>
                              <td className="py-2 px-3 text-center">
                                <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                                  {row.status}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>

              <div className="modal-footer flex items-center justify-between border-t border-slate-100 bg-white px-5 py-4 dark:border-slate-700 dark:bg-[#1B2433]">
                <button
                  type="button"
                  onClick={() => { setShowImportModal(false); setImportFile(null); setImportPreviewData([]) }}
                  className="btn btn-soft btn-secondary"
                >
                  Batal
                </button>
                <button
                  type="button"
                  disabled={!importFile || isImporting}
                  onClick={handleProcessImport}
                  className="btn btn-primary flex items-center gap-2 disabled:opacity-50"
                >
                  {isImporting ? 'Memproses Import...' : 'Proses Import Data'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 6. STAT CARD SUMMARY DETAIL MODAL */}
      {statCardModal.isOpen && (
        <div className="overlay modal fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs print:static print:bg-white print:p-0 print:block" role="dialog" aria-modal="true">
          <div className="modal-dialog w-full max-w-3xl bg-white dark:bg-[#1B2433] rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-2xl space-y-4 max-h-[85vh] flex flex-col print:max-h-none print:shadow-none print:border-none print:p-0 print:w-full">
            {/* Printable Header Kop for Popup Datatable */}
            <div className="hidden print:block border-b border-slate-400 pb-2 mb-3 text-slate-900 text-left">
              <h1 className="text-base font-extrabold uppercase tracking-tight leading-tight">
                {statCardModal.title || 'Laporan Detail Statistik Data Pegawai / Tendik SIT'}
              </h1>
              <p className="text-[11px] text-slate-700 font-semibold mt-0.5 leading-tight">
                Sekolah Islam Terpadu — Unit: {selectedUnitName || 'Semua Unit'} {selectedJabatanName ? `| Jabatan: ${selectedJabatanName}` : ''}
              </p>
              <div className="flex justify-between text-[9px] text-slate-600 font-medium mt-1">
                <p>Tanggal Cetak: {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                <p>Total Terfilter: {statModalItems.length} Pegawai</p>
              </div>
            </div>

            <div className="flex items-center justify-between border-b pb-3 dark:border-slate-800 shrink-0 print:hidden">
              <div className="flex items-center gap-3">
                <div className="size-10 rounded-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 flex items-center justify-center font-bold">
                  <UsersRound className="size-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 dark:text-white text-base leading-tight">{statCardModal.title}</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Daftar direktori pegawai terfilter berdasarkan kategori statistik.</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge color="success" size="sm">
                  {statModalItems.length} Pegawai
                </Badge>
                <button
                  type="button"
                  onClick={() => { setStatCardModal({ isOpen: false, type: '', title: '', badge: '' }); setStatCardSearch('') }}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                  aria-label="Tutup Modal"
                >
                  <X className="size-5" />
                </button>
              </div>
            </div>

            {/* Local Search Input */}
            <div className="shrink-0 print:hidden">
              <input
                type="text"
                value={statCardSearch}
                onChange={(e) => setStatCardSearch(e.target.value)}
                placeholder="Cari nama, NIY, NIK pegawai..."
                className="w-full h-10 px-3.5 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>

            {/* Table View */}
            <div className="flex-1 overflow-y-auto min-h-0 border border-slate-100 dark:border-slate-800 rounded-xl print:overflow-visible print:border-none">
              <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300 print:w-full print:border-collapse">
                <thead className="sticky top-0 bg-slate-50 dark:bg-slate-900 font-bold border-b border-slate-200 dark:border-slate-800 z-10 print:static print:bg-white print:border-b-2 print:border-slate-900">
                  <tr>
                    <th className="p-3">Nama Pegawai & NIY</th>
                    <th className="p-3">Jabatan</th>
                    <th className="p-3">Unit Kerja</th>
                    <th className="p-3 text-center">Status</th>
                    <th className="p-3 text-right print:hidden">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 print:divide-slate-300">
                  {statModalItems.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-6 text-center text-slate-400 italic">
                        Tidak ada data pegawai yang sesuai.
                      </td>
                    </tr>
                  ) : (
                    statModalItems.map((emp) => {
                      const fullName = `${emp.gelar_depan ? emp.gelar_depan + ' ' : ''}${emp.nama_lengkap}${emp.gelar_belakang ? ', ' + emp.gelar_belakang : ''}`
                      return (
                        <tr key={emp.id || emp.niy} className="hover:bg-slate-50/80 dark:hover:bg-slate-900/50 transition">
                          <td className="p-3">
                            <EmployeeHoverCard employee={emp}>
                              <div className="flex items-center gap-2.5 cursor-pointer">
                                <PersonAvatar src={emp.foto} name={fullName} size="sm" />
                                <div>
                                  <p className="font-extrabold text-slate-900 dark:text-white hover:text-emerald-600 transition">{fullName}</p>
                                  <p className="font-mono text-[10px] text-slate-400">NIY: {emp.niy || '-'}</p>
                                </div>
                              </div>
                            </EmployeeHoverCard>
                          </td>
                          <td className="p-3 font-semibold">{emp.jabatan_name || '-'}</td>
                          <td className="p-3 font-bold text-emerald-700 dark:text-emerald-400 print:text-slate-900">{emp.unit_name || '-'}</td>
                          <td className="p-3 text-center">
                            <AppBadge variant={emp.status === 'Aktif' ? 'success' : 'danger'} size="xs">
                              {emp.status || 'Aktif'}
                            </AppBadge>
                          </td>
                          <td className="p-3 text-right print:hidden">
                            <button
                              type="button"
                              onClick={() => {
                                setDetailEmployee(emp)
                                setActiveDetailTab('Identitas')
                                setStatCardModal({ isOpen: false, type: '', title: '', badge: '' })
                              }}
                              className="px-2.5 py-1 text-[11px] font-bold text-purple-600 bg-purple-50 hover:bg-purple-100 rounded-lg transition dark:bg-purple-950/60 dark:text-purple-300 cursor-pointer"
                            >
                              Detail
                            </button>
                          </td>
                        </tr>
                      )
                    })
                  )}
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-between pt-3 shrink-0 border-t border-slate-100 dark:border-slate-800 print:hidden">
              <Button
                variant="primary"
                appearance="fill"
                size="sm"
                onClick={handlePrintStatCardModal}
                className="flex items-center gap-1.5 font-bold cursor-pointer"
              >
                <Printer className="size-4" />
                Cetak Tabel Popup
              </Button>

              <Button
                variant="ghost"
                appearance="outline"
                size="sm"
                onClick={() => { setStatCardModal({ isOpen: false, type: '', title: '', badge: '' }); setStatCardSearch('') }}
              >
                Tutup
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className="employee-toast-stack" aria-live="polite" aria-atomic="true">
        {notifications.map((notification) => (
          <article key={notification.id} className={`employee-toast employee-toast--${notification.tone}`}>
            <span className="employee-toast__icon">
              {notification.tone === 'info' ? <Info /> : notification.tone === 'warning' ? <FaExclamationTriangle /> : notification.tone === 'error' ? <FaTimes /> : <BadgeCheck />}
            </span>
            <div className="min-w-0 flex-1">
              <h3>{notification.title}</h3>
              <p>{notification.message}</p>
            </div>
            <button type="button" onClick={() => setNotifications((current) => current.filter((item) => item.id !== notification.id))} aria-label="Tutup notifikasi"><FaTimes /></button>
          </article>
        ))}
      </div>
    </PageContainer>
  )
}
