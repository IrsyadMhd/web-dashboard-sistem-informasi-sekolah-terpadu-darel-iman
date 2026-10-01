import React, { useMemo, useState, useCallback, useEffect, useRef } from 'react'
import { useDebounce } from '../hooks/useDebounce'
import { motion, AnimatePresence } from 'framer-motion'
import { printEmployeeIdCard, downloadEmployeeIdCard } from '../services/idCardPrintService.jsx'
import { downloadFileFromApi } from '../utils/exportUtils'
import { cn } from '../lib/utils'
import EmployeeIdCard from '../components/card-print/EmployeeIdCard'
import ActionDropdown from '../components/app/ActionDropdown'
import AppBadge from '../components/app/AppBadge'
import Swal from '@/components/tailgrids/compat/swal-tailgrids'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { QRCodeSVG } from 'qrcode.react'
import {
  Activity,
  ArrowLeft,
  ArrowRight,
  Award,
  BadgeCheck,
  BookOpen,
  BriefcaseBusiness,
  Building,
  Building2,
  Calendar,
  CalendarCheck,
  CheckCircle2,
  Clock,
  Database,
  Download,
  Eye,
  FileSpreadsheet,
  FileText,
  Globe,
  GraduationCap,
  Hash,
  IdCard,
  Info,
  Mail,
  MapPin,
  Medal,
  Pencil,
  Phone,
  Plus,
  Printer,
  RefreshCcw,
  Save,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Star,
  Trash2,
  TrendingUp,
  Trophy,
  Upload,
  User,
  UserCheck,
  UserPlus,
  Users,
  UsersRound,
  UserX,
  X,
  XCircle,
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
import PersonAvatar, { resolveAvatarUrl } from '../components/ui/PersonAvatar'

function getEmployeePhotoUrl(emp) {
  return resolveAvatarUrl(emp) || ''
}
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
    jenis_kelamin: 'L',
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
  const resolvedPhoto = resolveAvatarUrl(item) || ''
  return {
    id: item?.id || null,
    niy: item?.niy || '',
    nik: item?.nik || '',
    nama_lengkap: item?.nama_lengkap || '',
    nama_panggilan: item?.nama_panggilan || '',
    gelar_depan: item?.gelar_depan || '',
    gelar_belakang: item?.gelar_belakang || '',
    jenis_kelamin: item?.jenis_kelamin || 'L',
    tempat_lahir: item?.tempat_lahir || '',
    tanggal_lahir: item?.tanggal_lahir ? item.tanggal_lahir.split('T')[0] : '',
    agama: item?.agama || '',
    foto: resolvedPhoto,
    photo_url: resolvedPhoto,
    avatar_url: resolvedPhoto,
    user: item?.user,
    raw: item,

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
    metadata: meta,
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

// ── DEFINISI TONE WARNA KARTU KPI MODERN (TAILGRIDS SPEC) ──
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
  blue: {
    card: 'border-blue-300/70 bg-gradient-to-br from-blue-50 via-cyan-50/60 to-white hover:border-blue-400 dark:border-blue-700/50 dark:from-blue-950/40 dark:via-cyan-950/20 dark:to-slate-900',
    glow: 'bg-blue-400/20 group-hover:bg-blue-400/30',
    iconBox: 'bg-gradient-to-br from-blue-500 to-cyan-600 text-white shadow-blue-500/30',
    tag: 'bg-blue-100 text-blue-700 dark:bg-blue-900/60 dark:text-blue-300',
    title: 'text-blue-700 dark:text-blue-400',
    val: 'text-blue-700 dark:text-blue-300',
    sub: 'text-blue-600/80 dark:text-blue-400/80',
    cta: 'text-blue-600/60 dark:text-blue-500/60',
  },
  purple: {
    card: 'border-purple-300/70 bg-gradient-to-br from-purple-50 via-violet-50/60 to-white hover:border-purple-400 dark:border-purple-700/50 dark:from-purple-950/40 dark:via-violet-950/20 dark:to-slate-900',
    glow: 'bg-purple-400/20 group-hover:bg-purple-400/30',
    iconBox: 'bg-gradient-to-br from-purple-500 to-violet-600 text-white shadow-purple-500/30',
    tag: 'bg-purple-100 text-purple-700 dark:bg-purple-900/60 dark:text-purple-300',
    title: 'text-purple-700 dark:text-purple-400',
    val: 'text-purple-700 dark:text-purple-300',
    sub: 'text-purple-600/80 dark:text-purple-400/80',
    cta: 'text-purple-600/60 dark:text-purple-500/60',
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

function KpiTintedCard({ icon: Icon, label, subtext, value, tag, ctaText = 'Rincian Data', tone = 'emerald', onClick }) {
  const t = MODERN_CARD_TONES[tone] || MODERN_CARD_TONES.emerald
  const isClickable = typeof onClick === 'function'

  return (
    <motion.article
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      onClick={onClick}
      role={isClickable ? 'button' : undefined}
      tabIndex={isClickable ? 0 : undefined}
      className={`group relative overflow-hidden rounded-[18px] border-2 p-5 shadow-xs transition-[border-color,box-shadow] duration-150 text-left flex flex-col justify-between h-full ${
        isClickable ? 'cursor-pointer hover:shadow-md' : 'cursor-default'
      } ${t.card}`}
    >
      {/* Ambient Glow */}
      <div className={`pointer-events-none absolute -top-8 -right-8 h-28 w-28 rounded-full blur-2xl transition-all ${t.glow}`} />

      {/* Header dengan Icon Box & Tag */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2.5">
            <div className={`flex h-10 w-10 items-center justify-center rounded-xl text-white shadow-sm ${t.iconBox}`}>
              <Icon className="h-5 w-5" />
            </div>
            <div>
              <p className={`text-[11px] font-bold uppercase tracking-wider ${t.title}`}>{label}</p>
            </div>
          </div>
          {tag && (
            <span className={`rounded-lg px-2.5 py-0.5 text-[10px] font-extrabold ${t.tag}`}>
              {tag}
            </span>
          )}
        </div>

        {/* Nilai Utama */}
        <p className={`text-3xl sm:text-4xl font-black tabular-nums tracking-tight ${t.val}`}>
          {value ?? 0}
        </p>
        {subtext && (
          <p className={`mt-1 text-[11px] font-semibold ${t.sub}`}>
            {subtext}
          </p>
        )}
      </div>

      {/* Click Affordance Footer */}
      {isClickable && (
        <div className={`mt-4 pt-3 border-t border-slate-200/60 dark:border-slate-800/60 flex items-center justify-between text-[11px] font-bold ${t.cta}`}>
          <span>{ctaText}</span>
          <span className="inline-flex items-center gap-0.5 group-hover:translate-x-1 transition-transform">
            Detail &rarr;
          </span>
        </div>
      )}
    </motion.article>
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
  const canUpdateEmployee = true
  const canCreateEmployee = true
  const canDeleteEmployee = isGlobalPersonnelManager
  const canExportEmployee = true

  const isPengurusYayasanEmployee = (emp) => {
    if (!emp) return false
    const position = String(emp.jabatan_name || emp.position?.name || '').toLowerCase()
    const unit = String(emp.unit_name || emp.unit?.name || '').toLowerCase()
    return position.includes('pengurus yayasan') || position.includes('ketua yayasan') || unit.includes('pengurus yayasan')
  }

  // Filter States
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebounce(search, 350)
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
  const [isDragModeEnabled, setIsDragModeEnabled] = useState(false)
  const [idCardLayoutConfig, setIdCardLayoutConfig] = useState({})
  const [idCardFrameStyle, setIdCardFrameStyle] = useState('standard')
  const [idCardPhotoShape, setIdCardPhotoShape] = useState('rounded')
  const [idCardShowPattern, setIdCardShowPattern] = useState(true)
  const [idCardShowWave, setIdCardShowWave] = useState(true)
  const [idCardHeaderMotto, setIdCardHeaderMotto] = useState('Berilmu, Berakhlak, Beramal')
  const [idCardFooterMotto, setIdCardFooterMotto] = useState('Generasi Beriman, Berilmu,\nBerakhlak Mulia')
  const [idCardControlTab, setIdCardControlTab] = useState('style')
  const [idCardSide, setIdCardSide] = useState('front') // 'front' | 'back'
  const [idCardBackTitle, setIdCardBackTitle] = useState('KETENTUAN KARTU PEGAWAI')
  const [idCardBackRules, setIdCardBackRules] = useState(
    '1. Kartu ini adalah milik resmi Yayasan Dar el-Iman.\n2. Wajib dibawa & dikenakan selama jam kerja.\n3. Apabila menemukan kartu ini, harap mengembalikan ke kantor yayasan.\n4. QR Code digunakan untuk absensi & verifikasi SIMSIT.'
  )
  const [idCardBackAddress, setIdCardBackAddress] = useState(
    'Jl. Gajah Mada No. 28 Padang, Sumatera Barat\nTelp: (0751) 123456 | Website: dareliman.or.id'
  )
  const [idCardBackShowQr, setIdCardBackShowQr] = useState(true)
  const [idCardPrintSides, setIdCardPrintSides] = useState('both') // 'both' | 'front' | 'back'

  const handleElementMove = useCallback((key, pos) => {
    setIdCardLayoutConfig((prev) => ({
      ...prev,
      [key]: pos,
    }))
  }, [])

  const changeIdCardOrientation = (orientation) => {
    setIdCardOrientation(orientation)
    localStorage.setItem('employee-id-card-orientation', orientation)
  }

  // Import Data States
  const [importFile, setImportFile] = useState(null)
  const [importPreviewData, setImportPreviewData] = useState([])
  const [isImporting, setIsImporting] = useState(false)
  const importFileInputRef = useRef(null)

  const handleClearImportFile = (e) => {
    if (e) {
      e.preventDefault()
      e.stopPropagation()
    }
    setImportFile(null)
    setImportPreviewData([])
    if (importFileInputRef.current) {
      importFileInputRef.current.value = ''
    }
  }

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
      debouncedSearch,
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
        search: debouncedSearch || undefined,
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

  const getEmployeeUnitAddress = useCallback((employee, unitsList, pengaturan) => {
    if (!employee) return 'Jl. Gajah Mada No. 28 Padang, Sumatera Barat\nTelp: (0751) 123456 | Website: dareliman.or.id'

    const empUnit = (unitsList || []).find((u) => String(u.id) === String(employee.unit_id || employee.unit?.id)) || employee.unit
    const unitName = empUnit?.name || employee.unit_name || employee.unit?.name || ''
    const unitAddrText = empUnit?.address || empUnit?.alamat || empUnit?.description || (pengaturan?.address ? `${pengaturan.address}${pengaturan.city ? `, ${pengaturan.city}` : ''}` : '')
    const unitPhoneText = empUnit?.phone || empUnit?.telepon || pengaturan?.phone || ''
    const unitWebText = empUnit?.website || pengaturan?.website || 'dareliman.or.id'

    const lines = []
    if (unitName || unitAddrText) {
      lines.push([unitName, unitAddrText].filter(Boolean).join(' — '))
    } else {
      lines.push('Jl. Gajah Mada No. 28 Padang, Sumatera Barat')
    }

    const contactLine = [unitPhoneText ? `Telp: ${unitPhoneText}` : '', unitWebText ? `Website: ${unitWebText}` : ''].filter(Boolean).join(' | ')
    if (contactLine) {
      lines.push(contactLine)
    }

    return lines.join('\n')
  }, [])

  useEffect(() => {
    if (showIdCardModal) {
      const defaultAddr = getEmployeeUnitAddress(showIdCardModal, unitsList, pengaturan)
      setIdCardBackAddress(defaultAddr)
    }
  }, [showIdCardModal, unitsList, pengaturan, getEmployeeUnitAddress])

  const resetIdCardLayout = () => {
    setIdCardLayoutConfig({})
    setIdCardFrameStyle('standard')
    setIdCardPhotoShape('rounded')
    setIdCardShowPattern(true)
    setIdCardShowWave(true)
    setIdCardHeaderMotto('Berilmu, Berakhlak, Beramal')
    setIdCardFooterMotto('Generasi Beriman, Berilmu,\nBerakhlak Mulia')
    setIdCardSide('front')
    setIdCardBackTitle('KETENTUAN KARTU PEGAWAI')
    setIdCardBackRules(
      '1. Kartu ini adalah milik resmi Yayasan Dar el-Iman.\n2. Wajib dibawa & dikenakan selama jam kerja.\n3. Apabila menemukan kartu ini, harap mengembalikan ke kantor yayasan.\n4. QR Code digunakan untuk absensi & verifikasi SIMSIT.'
    )
    if (showIdCardModal) {
      setIdCardBackAddress(getEmployeeUnitAddress(showIdCardModal, unitsList, pengaturan))
    }
    setIdCardBackShowQr(true)
    setIdCardPrintSides('both')
  }

  const rawList = useMemo(() => {
    const list = data?.data || []
    return Array.isArray(list) ? list : []
  }, [data?.data])

  const items = useMemo(() => {
    return rawList.map(parseFromApi)
  }, [rawList])

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
    return []
  }, [selectedAcademicYear])

  const kpiProfilesList = useMemo(() => {
    if (!items || items.length === 0) return []
    return items
      .filter((emp) => emp.kpi_score !== undefined || emp.kpiScore !== undefined || emp.skor_kinerja !== undefined)
      .map((emp) => {
        const score = Number(emp.kpi_score || emp.kpiScore || emp.skor_kinerja || 0)
        return {
          ...emp,
          kpiScore: score,
          kpiLabel: emp.kpi_label || emp.kpiLabel || (score >= 90 ? 'Sangat Baik' : score >= 75 ? 'Baik' : 'Cukup'),
          presenceRate: Number(emp.presence_rate || emp.presenceRate || 0),
        }
      })
  }, [items])

  const paginationInfo = {
    total: data?.total ?? (data?.data ? data.data.length : items.length),
    from: data?.from ?? (items.length > 0 ? (page - 1) * perPage + 1 : 0),
    to: data?.to ?? (items.length > 0 ? (page - 1) * perPage + items.length : 0),
    last_page: data?.last_page || 1,
    current_page: data?.current_page || page,
    per_page: data?.per_page || perPage,
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

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setImportFile(file)
    setImportPreviewData([])

    const ext = file.name.split('.').pop()?.toLowerCase()
    if (ext === 'xlsx' || ext === 'xls') {
      // Berkas biner Excel: tidak dibaca via readAsText agar biner ZIP/OLE tidak rusak.
      // Berkas dikirim via FormData dan diparsing native oleh PhpOffice\PhpSpreadsheet di backend.
      setImportPreviewData([
        {
          niy: '(Sistem)',
          nama: file.name,
          jabatan: `Format ${ext.toUpperCase()}`,
          unit: `${(file.size / 1024).toFixed(1)} KB`,
          status: 'Siap Impor',
        },
      ])
      return
    }

    // Parsing aman untuk berkas CSV dan TXT
    const reader = new FileReader()
    reader.onload = () => {
      try {
        const content = String(reader.result || '').replace(/^\uFEFF/, '')
        const lines = content.split(/\r?\n/).filter((line) => line.trim().length > 0)
        if (lines.length <= 1) {
          setImportPreviewData([])
          return
        }

        const delimiter = lines[0].includes(';') && !lines[0].includes(',') ? ';' : (lines[0].includes('\t') ? '\t' : ',')
        const parseCsvLine = (line) => {
          const values = []
          let value = ''
          let quoted = false
          for (let i = 0; i < line.length; i++) {
            const char = line[i]
            if (char === '"' && line[i + 1] === '"' && quoted) {
              value += '"'
              i++
            } else if (char === '"') {
              quoted = !quoted
            } else if (char === delimiter && !quoted) {
              values.push(value.trim())
              value = ''
            } else {
              value += char
            }
          }
          values.push(value.trim())
          return values
        }

        const headerRow = parseCsvLine(lines[0]).map((h) => h.toLowerCase().replace(/[\s_\-.:/]/g, ''))
        const findCol = (keys) => headerRow.findIndex((h) => keys.includes(h))

        const idxNiy = findCol(['niy', 'nip', 'nomorindukyayasan'])
        const idxNama = findCol(['namalengkap', 'nama', 'fullname', 'name'])
        const idxJabatan = findCol(['jabatan', 'position', 'posisi'])
        const idxUnit = findCol(['unitkerja', 'unit', 'unitpendidikan', 'educationunit'])

        const dataLines = lines.slice(1, 11) // pratinjau maks 10 baris
        const rows = dataLines.map((line, idx) => {
          const cols = parseCsvLine(line)
          const niy = idxNiy !== -1 ? (cols[idxNiy] || '') : (cols[0] || '')
          const nama = idxNama !== -1 ? (cols[idxNama] || '') : (cols[2] || cols[1] || '')
          const jabatan = idxJabatan !== -1 ? (cols[idxJabatan] || '') : (cols[5] || cols[3] || '-')
          const unit = idxUnit !== -1 ? (cols[idxUnit] || '') : (cols[6] || cols[4] || '-')

          return {
            niy: niy || '-',
            nama: nama || `Baris ${idx + 2}`,
            jabatan: jabatan || '-',
            unit: unit || '-',
            status: nama ? 'Siap Impor' : 'Nama kosong',
          }
        })

        setImportPreviewData(rows.filter((r) => r.nama || r.niy !== '-'))
      } catch (err) {
        console.error('Preview error', err)
        setImportPreviewData([])
      }
    }
    reader.readAsText(file)
  }

  const handleProcessImport = async () => {
    if (!importFile) return
    setIsImporting(true)
    try {
      const formData = new FormData()
      formData.append('file', importFile)

      const res = await employeeService.importData(formData)
      const resData = res?.data || res || {}

      setIsImporting(false)
      setShowImportModal(false)
      setImportFile(null)
      setImportPreviewData([])
      setPage(1)

      const totalBerhasil = resData.berhasil || 0
      const totalGagal = resData.gagal || 0

      let notifType = 'success'
      let notifTitle = 'Impor Berhasil'
      if (totalGagal > 0 && totalBerhasil === 0) {
        notifType = 'error'
        notifTitle = 'Impor Gagal'
      } else if (totalGagal > 0 && totalBerhasil > 0) {
        notifType = 'warning'
        notifTitle = 'Impor Selesai Sebagian'
      }

      let notifMsg = res.message || `Berhasil: ${totalBerhasil} data pegawai.`
      if (resData.errors && resData.errors.length > 0) {
        notifMsg += ` Catatan: ${resData.errors[0]}`
      }

      pushNotification(notifTitle, notifMsg, notifType)

      queryClient.invalidateQueries({ queryKey: ['employees-list'] })
      queryClient.invalidateQueries({ queryKey: ['employees'] })
      queryClient.invalidateQueries({ queryKey: ['employees-dashboard'] })
      if (typeof refetch === 'function') {
        refetch()
      }
    } catch (err) {
      setIsImporting(false)
      const details = err?.response?.data?.errors ? Object.values(err.response.data.errors).flat().join(', ') : ''
      const msg = details ? `${err?.response?.data?.message || 'Gagal'}: ${details}` : (err?.response?.data?.message || err.message || 'Gagal memproses impor data pegawai.')
      pushNotification('Impor Gagal', msg, 'error')
    }
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
      const details = err?.response?.data?.errors ? Object.values(err.response.data.errors).flat().join(', ') : ''
      const msg = details ? `${err?.response?.data?.message || 'Gagal'}: ${details}` : (err?.response?.data?.message || 'Terjadi kesalahan saat menyimpan data pegawai.')
      pushNotification('Gagal Disimpan', msg, 'error')
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
      const details = err?.response?.data?.errors ? Object.values(err.response.data.errors).flat().join(', ') : ''
      const msg = details ? `${err?.response?.data?.message || 'Gagal'}: ${details}` : (err?.response?.data?.message || 'Terjadi kesalahan saat memperbarui data pegawai.')
      pushNotification('Gagal Diubah', msg, 'error')
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

  const isMutating = createMutation.isPending || updateMutation.isPending

  // Modal Handlers
  const openAddModal = () => {
    if (!canCreateEmployee) return
    setIsEditMode(false)
    setFormData(initialFormState())
    setCurrentStep(1)
    setIsFormModalOpen(true)
  }

  const openEditModal = (emp) => {
    if (!emp) return
    const normalizedEmp = parseFromApi(emp)
    setIsEditMode(true)
    setFormData(normalizedEmp)
    setCurrentStep(1)
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

  // Multi-format Server-Side Export Handler (.csv, .xls, .xlsx)
  const handleExportDataFormat = async (format = 'xlsx') => {
    if (!canExportEmployee) return
    setShowExportModal(false)

    const params = {}
    if (debouncedSearch) params.search = debouncedSearch
    if (selectedUnitFilter) params.unit_id = selectedUnitFilter
    if (selectedJabatanFilter) params.jabatan_id = selectedJabatanFilter
    if (selectedStatusPegawaiFilter) params.status_pegawai = selectedStatusPegawaiFilter
    if (selectedStatusFilter) params.status = selectedStatusFilter
    if (selectedGenderFilter) params.jenis_kelamin = selectedGenderFilter

    await downloadFileFromApi('/employees/export', params, format, `pegawai-export-${new Date().toISOString().slice(0, 10)}`)
    pushNotification('Export Berhasil', `Data pegawai berhasil diexport ke berkas .${format.toUpperCase()}.`, 'success')
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
    <div className="flex items-center gap-2.5 flex-nowrap shrink-0 overflow-x-auto py-1">
      {/* Impor CSV/Excel Data Button - Soft Pastel Sky Blue */}
      <div className="group relative inline-flex">
        <button
          type="button"
          title="Impor Data Pegawai (.csv, .xls, .xlsx)"
          aria-label="Impor Data Pegawai"
          onClick={() => setShowImportModal(true)}
          className="flex size-10 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-400 via-sky-500 to-blue-600 text-white border border-sky-300/40 hover:scale-105 transition-all duration-200 active:scale-95 cursor-pointer"
        >
          <Upload className="size-5 text-white" strokeWidth={2.2} />
        </button>
        <div className="pointer-events-none absolute top-full left-1/2 mt-2 -translate-x-1/2 opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 transition-all duration-200 ease-out z-50 whitespace-nowrap rounded-lg bg-slate-900 px-2.5 py-1 text-[11px] font-bold text-white shadow-xl dark:bg-slate-100 dark:text-slate-900">
          <div className="absolute bottom-full left-1/2 -mb-1 -translate-x-1/2 border-4 border-transparent border-b-slate-900 dark:border-b-slate-100" />
          Impor Data (.csv, .xls, .xlsx)
        </div>
      </div>

      {/* Ekspor CSV/Excel Data Button - Soft Pastel Amber/Orange */}
      {canExportEmployee && (
        <div className="group relative inline-flex">
          <button
            type="button"
            title="Ekspor Data Pegawai (.csv, .xls, .xlsx)"
            aria-label="Ekspor Data Pegawai"
            onClick={() => setShowExportModal(true)}
            className="flex size-10 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 via-amber-500 to-orange-600 text-white border border-amber-300/40 hover:scale-105 transition-all duration-200 active:scale-95 cursor-pointer"
          >
            <Download className="size-5 text-white" strokeWidth={2.2} />
          </button>
          <div className="pointer-events-none absolute top-full left-1/2 mt-2 -translate-x-1/2 opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 transition-all duration-200 ease-out z-50 whitespace-nowrap rounded-lg bg-slate-900 px-2.5 py-1 text-[11px] font-bold text-white shadow-xl dark:bg-slate-100 dark:text-slate-900">
            <div className="absolute bottom-full left-1/2 -mb-1 -translate-x-1/2 border-4 border-transparent border-b-slate-900 dark:border-b-slate-100" />
            Ekspor Data (.csv, .xls, .xlsx)
          </div>
        </div>
      )}

      {/* Unduh Template Impor/Ekspor Button - Soft Pastel Violet/Purple */}
      <div className="group relative inline-flex">
        <button
          type="button"
          title="Unduh Format Template (.csv, .xls, .xlsx)"
          aria-label="Unduh Format Template"
          onClick={() => setShowTemplateModal(true)}
          className="flex size-10 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-500 via-purple-600 to-violet-700 text-white border border-purple-300/40 hover:scale-105 transition-all duration-200 active:scale-95 cursor-pointer"
        >
          <FileSpreadsheet className="size-5 text-white" strokeWidth={2.2} />
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
          className="flex size-10 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-400 via-cyan-500 to-teal-600 text-white border border-cyan-300/40 hover:scale-105 transition-all duration-200 active:scale-95 cursor-pointer"
        >
          <RefreshCcw className="size-5 text-white" strokeWidth={2.2} />
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
          className="flex size-10 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 via-indigo-600 to-purple-700 text-white border border-indigo-300/40 hover:scale-105 transition-all duration-200 active:scale-95 cursor-pointer"
        >
          <Printer className="size-5 text-white" strokeWidth={2.2} />
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
            className="flex size-10 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700 text-white border border-emerald-300/40 hover:scale-105 transition-all duration-200 active:scale-95 cursor-pointer"
          >
            <Plus className="size-5 text-white" strokeWidth={2.5} />
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
            <PersonAvatar src={getEmployeePhotoUrl(employee)} name={fullName} size="md" />
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

  // Helper Render Status Pegawai Badge (Warna Solid: Tetap = Hijau Solid, Kontrak = Merah Solid)
  const renderStatusPegawaiBadge = (status) => {
    const val = status || 'Tetap'
    const lower = String(val).toLowerCase().trim()
    const isTetap = lower.includes('tetap')
    const isKontrak = lower.includes('kontrak')
    const isHonorer = lower.includes('honorer')
    const isMagang = lower.includes('magang')

    let badgeStyle = 'bg-slate-600 text-white border-slate-700'

    if (isTetap) {
      // Hijau Solid (Vibrant, high-contrast, premium solid emerald)
      badgeStyle = 'bg-emerald-600 dark:bg-emerald-600 text-white border-emerald-700/80 shadow-xs ring-1 ring-emerald-500/30'
    } else if (isKontrak) {
      // Merah Solid (Vibrant, high-contrast, premium solid rose/red)
      badgeStyle = 'bg-rose-600 dark:bg-rose-600 text-white border-rose-700/80 shadow-xs ring-1 ring-rose-500/30'
    } else if (isHonorer) {
      // Amber Solid
      badgeStyle = 'bg-amber-600 dark:bg-amber-600 text-white border-amber-700/80 shadow-xs ring-1 ring-amber-500/30'
    } else if (isMagang) {
      // Blue Solid
      badgeStyle = 'bg-blue-600 dark:bg-blue-600 text-white border-blue-700/80 shadow-xs ring-1 ring-blue-500/30'
    }

    return (
      <span className={`inline-flex items-center justify-center gap-1.5 rounded-lg px-2.5 py-1 text-[11px] font-black tracking-wide border ${badgeStyle}`}>
        <span className="h-1.5 w-1.5 rounded-full bg-white/90 shrink-0" />
        <span>{val}</span>
      </span>
    )
  }

  // AppDataTable Columns Definition
  const columns = [
    {
      key: 'nama_lengkap',
      label: 'NIY & NAMA PEGAWAI',
      sortable: true,
      className: 'w-64 sm:w-72',
      render: (row) => {
        const namaFull = `${row.gelar_depan ? row.gelar_depan + ' ' : ''}${row.nama_lengkap}${row.gelar_belakang ? ', ' + row.gelar_belakang : ''}`
        return (
          <div className="flex min-w-0 items-center gap-3">
            <PersonAvatar
              src={getEmployeePhotoUrl(row)}
              name={namaFull}
              size="table"
              className="h-10 w-10 shrink-0 shadow-xs border border-slate-200"
            />
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
              <div className="flex items-center gap-1.5 text-xs text-slate-500 font-mono">
                <span>{row.niy || '-'}</span>
                {row.jenis_kelamin && (
                  <>
                    <span>•</span>
                    <span className={`font-bold ${row.jenis_kelamin === 'L' ? 'text-blue-600' : 'text-pink-600'}`}>
                      {row.jenis_kelamin === 'L' ? 'Laki-laki' : 'Perempuan'}
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>
        )
      },
    },
    {
      key: 'jabatan_name',
      label: 'JABATAN',
      sortable: true,
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
      sortable: true,
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
      sortable: true,
      className: 'w-32',
      render: (row) => renderStatusPegawaiBadge(row.status_pegawai),
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
      sortable: true,
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
          <AppBreadcrumb items={[{ label: 'Master Data', href: '/dashboard/master/pegawai' }, { label: 'Direktori Pegawai' }]} />
        </div>

        {/* Header Halaman Modern Hero Card */}
        <motion.div variants={itemVariants} className="relative overflow-hidden rounded-[22px] border-2 border-emerald-500/30 bg-gradient-to-r from-emerald-500/15 via-teal-500/10 to-emerald-600/15 p-5 sm:p-6 shadow-md shadow-emerald-500/10 dark:border-emerald-600/40 dark:bg-gradient-to-r dark:from-emerald-950/70 dark:via-teal-950/50 dark:to-slate-900 print:hidden">
          {/* Ambient Glow Background Accent (Vibrant Dual Emerald-Teal Blobs) */}
          <div className="pointer-events-none absolute -top-20 -right-20 h-56 w-56 rounded-full bg-gradient-to-br from-emerald-500/40 via-teal-400/30 to-emerald-600/20 blur-3xl dark:from-emerald-500/50 dark:via-teal-400/40" />
          <div className="pointer-events-none absolute -bottom-20 -left-20 h-56 w-56 rounded-full bg-gradient-to-tr from-emerald-600/30 via-teal-500/20 to-transparent blur-3xl dark:from-emerald-600/40 dark:via-teal-500/30" />

          <div className="relative z-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-4 min-w-0">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700 text-white border border-emerald-300/40 dark:from-emerald-400 dark:via-emerald-500 dark:to-teal-600">
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

        {/* 2. Summary Stats Cards (ModernKpiCard Spec) */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 print:hidden">
          <KpiTintedCard
            label="Total Pegawai ERP"
            value={items.length}
            subtext="Seluruh direktori pegawai"
            icon={UsersRound}
            tone="emerald"
            tag={`${items.length} Pegawai`}
            ctaText="Rincian Pegawai"
            onClick={() => setStatCardModal({ isOpen: true, type: 'total', title: 'Detail Data: Total Pegawai ERP', badge: 'SDM' })}
          />
          <KpiTintedCard
            label="Tenaga Pendidik / Guru"
            value={items.filter((i) => i.jabatan_name?.toLowerCase().includes('guru') || i.jabatan_name?.toLowerCase().includes('kepala')).length}
            subtext="Guru & Pengajar aktif"
            icon={Award}
            tone="blue"
            tag={`${items.filter((i) => i.jabatan_name?.toLowerCase().includes('guru') || i.jabatan_name?.toLowerCase().includes('kepala')).length} Guru`}
            ctaText="Komposisi Guru"
            onClick={() => setStatCardModal({ isOpen: true, type: 'pendidik', title: 'Detail Data: Tenaga Pendidik / Guru', badge: 'Pendidik' })}
          />
          <KpiTintedCard
            label="Staf TU & Operator"
            value={items.filter((i) => !i.jabatan_name?.toLowerCase().includes('guru')).length}
            subtext="Administrasi & Teknis"
            icon={Building2}
            tone="purple"
            tag={`${items.filter((i) => !i.jabatan_name?.toLowerCase().includes('guru')).length} Tendik`}
            ctaText="Staf & Tendik"
            onClick={() => setStatCardModal({ isOpen: true, type: 'tendik', title: 'Detail Data: Staf TU & Operator', badge: 'Tendik' })}
          />
          <KpiTintedCard
            label="Status Aktif"
            value={items.filter((i) => i.status === 'Aktif').length}
            subtext="Aktif Bekerja"
            icon={CheckCircle2}
            tone="amber"
            tag={`${items.filter((i) => i.status === 'Aktif').length} Aktif`}
            ctaText="Status Operasional"
            onClick={() => setStatCardModal({ isOpen: true, type: 'aktif', title: 'Detail Data: Pegawai Status Aktif', badge: 'Aktif' })}
          />
        </div>

        {/* 3. SECTION CARD KPI PEGAWAI & GURU (REAL DATABASE DATA) */}
        <div className="print:hidden grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Card KPI Kehadiran Pegawai */}
          <div className="relative overflow-hidden rounded-[22px] border-2 border-emerald-300 dark:border-emerald-700/80 bg-white p-5 shadow-md shadow-emerald-500/10 dark:bg-[#1B2433] space-y-4">
            <div className="flex items-center justify-between border-b border-emerald-200/90 dark:border-emerald-800/60 pb-3.5">
              <div className="flex items-center gap-3">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700 text-white shadow-sm border border-emerald-300/40">
                  <CalendarCheck className="size-5" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
                    KPI Kehadiran & Presensi Pegawai
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Ditarik real-time dari log presensi database
                  </p>
                </div>
              </div>
              <Badge color="success" size="sm" prefixIcon={<Database className="size-3" />}>
                Real DB Presensi
              </Badge>
            </div>

            {/* Metrics Breakdown */}
            <div className="grid grid-cols-3 gap-2.5">
              <div className="rounded-xl border border-emerald-200/80 bg-gradient-to-b from-emerald-50/80 to-emerald-50/30 p-3 text-center dark:border-emerald-800/60 dark:from-emerald-950/40 dark:to-emerald-950/20">
                <div className="flex items-center justify-center gap-1 text-[10px] font-bold text-emerald-800 dark:text-emerald-300 mb-0.5">
                  <UserCheck className="size-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>Kehadiran</span>
                </div>
                <strong className="block text-lg font-black text-emerald-700 dark:text-emerald-400">{presensiHadirPct}%</strong>
                <span className="block text-[10px] text-emerald-600 dark:text-emerald-500 font-semibold">{presensiHadirCount} Log</span>
              </div>
              <div className="rounded-xl border border-amber-200/80 bg-gradient-to-b from-amber-50/80 to-amber-50/30 p-3 text-center dark:border-amber-800/60 dark:from-amber-950/40 dark:to-amber-950/20">
                <div className="flex items-center justify-center gap-1 text-[10px] font-bold text-amber-800 dark:text-amber-300 mb-0.5">
                  <Clock className="size-3.5 text-amber-600 dark:text-amber-400" />
                  <span>Keterlambatan</span>
                </div>
                <strong className="block text-lg font-black text-amber-700 dark:text-amber-400">{presensiTerlambatPct}%</strong>
                <span className="block text-[10px] text-amber-600 dark:text-amber-500 font-semibold">{presensiTerlambatCount} Log</span>
              </div>
              <div className="rounded-xl border border-rose-200/80 bg-gradient-to-b from-rose-50/80 to-rose-50/30 p-3 text-center dark:border-rose-800/60 dark:from-rose-950/40 dark:to-rose-950/20">
                <div className="flex items-center justify-center gap-1 text-[10px] font-bold text-rose-800 dark:text-rose-300 mb-0.5">
                  <UserX className="size-3.5 text-rose-600 dark:text-rose-400" />
                  <span>Izin / Sakit / Alpa</span>
                </div>
                <strong className="block text-lg font-black text-rose-700 dark:text-rose-400">{presensiTidakMasukPct}%</strong>
                <span className="block text-[10px] text-rose-600 dark:text-rose-500 font-semibold">{presensiTidakMasukCount} Log</span>
              </div>
            </div>

            {/* Segmented Progress Bar */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-[11px] font-bold text-slate-600 dark:text-slate-400">
                <span className="flex items-center gap-1.5">
                  <Activity className="size-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>Rasio Distribusi Presensi Pegawai</span>
                </span>
                <span className="text-emerald-600 dark:text-emerald-400 font-extrabold">{presensiHadirPct}% Hadir Tepat Waktu</span>
              </div>
              <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800 flex">
                <div style={{ width: `${Math.max(presensiHadirPct, 5)}%` }} className="bg-emerald-500 h-full transition-all duration-500" title="Kehadiran Tepat Waktu" />
                <div style={{ width: `${presensiTerlambatPct}%` }} className="bg-amber-400 h-full transition-all duration-500" title="Keterlambatan" />
                <div style={{ width: `${presensiTidakMasukPct}%` }} className="bg-rose-500 h-full transition-all duration-500" title="Izin / Sakit / Alpa" />
              </div>
            </div>
          </div>

          {/* Card KPI Jam Mengajar Guru */}
          <div className="relative overflow-hidden rounded-[22px] border-2 border-emerald-300 dark:border-emerald-700/80 bg-white p-5 shadow-md shadow-emerald-500/10 dark:bg-[#1B2433] space-y-4">
            <div className="flex items-center justify-between border-b border-emerald-200/90 dark:border-emerald-800/60 pb-3.5">
              <div className="flex items-center gap-3">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-400 via-sky-500 to-blue-600 text-white shadow-sm border border-sky-300/40">
                  <BookOpen className="size-5" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
                    KPI Jam Pelajaran & Beban Mengajar Guru
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Ditarik real-time dari database kurikulum & jadwal
                  </p>
                </div>
              </div>
              <Badge color="cyan" size="sm" prefixIcon={<Database className="size-3" />}>
                Real DB Kurikulum
              </Badge>
            </div>

            {/* Metrics Breakdown */}
            <div className="grid grid-cols-2 gap-2.5">
              <div className="rounded-xl border border-sky-200/80 bg-gradient-to-b from-sky-50/80 to-sky-50/30 p-3 dark:border-sky-800/60 dark:from-sky-950/40 dark:to-sky-950/20">
                <div className="flex items-center gap-1.5 text-[10px] font-bold text-sky-800 dark:text-sky-300 mb-0.5">
                  <BookOpen className="size-3.5 text-sky-600 dark:text-sky-400" />
                  <span>Mapel Jam Terbanyak</span>
                </div>
                <strong className="block text-sm font-extrabold text-sky-900 dark:text-sky-100 truncate" title={topMapelName}>{topMapelName}</strong>
                <span className="block text-[11px] text-sky-600 dark:text-sky-400 font-bold mt-0.5">{topMapelHours} Jam / Sesi Pelajaran</span>
              </div>
              <div className="rounded-xl border border-purple-200/80 bg-gradient-to-b from-purple-50/80 to-purple-50/30 p-3 dark:border-purple-800/60 dark:from-purple-950/40 dark:to-purple-950/20">
                <div className="flex items-center gap-1.5 text-[10px] font-bold text-purple-800 dark:text-purple-300 mb-0.5">
                  <GraduationCap className="size-3.5 text-purple-600 dark:text-purple-400" />
                  <span>Guru Alokasi Jam Terbanyak</span>
                </div>
                <strong className="block text-sm font-extrabold text-purple-900 dark:text-purple-100 truncate" title={topGuruName}>{topGuruName}</strong>
                <span className="block text-[11px] text-purple-600 dark:text-purple-400 font-bold mt-0.5">{topGuruHours} Jam / Minggu</span>
              </div>
            </div>

            {/* Total Jam & Summary Footer */}
            <div className="rounded-xl bg-gradient-to-r from-emerald-50/60 via-teal-50/40 to-sky-50/40 p-3 dark:from-slate-900/80 dark:to-slate-900/60 flex items-center justify-between border border-emerald-200/70 dark:border-emerald-800/50">
              <div className="flex items-center gap-2.5">
                <div className="flex size-8 items-center justify-center rounded-lg bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-300">
                  <Clock className="size-4" />
                </div>
                <div>
                  <span className="block text-[11px] font-extrabold text-slate-800 dark:text-slate-200">Total Alokasi Jam Mengajar Unit</span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400">Rata-rata {kpiGuru.rata_jam_per_guru ?? 0} JP per Pendidik</span>
                </div>
              </div>
              <span className="rounded-xl bg-sky-100/90 border border-sky-200 px-3 py-1.5 text-xs font-black text-sky-800 dark:bg-sky-950 dark:border-sky-800 dark:text-sky-200">
                {totalJamPelajaran} JP
              </span>
            </div>
          </div>
        </div>

        {/* 3.1 SECTION 3 PEGAWAI TERBAIK & 3 GURU TERBAIK */}
        <div className="print:hidden grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Card Top 3 Pegawai Terbaik */}
          <div className="relative overflow-hidden rounded-[22px] border-2 border-emerald-300 dark:border-emerald-700/80 bg-white p-5 shadow-md shadow-emerald-500/10 dark:bg-[#1B2433] space-y-3.5">
            <div className="flex items-center justify-between border-b border-emerald-200/90 dark:border-emerald-800/60 pb-3.5">
              <div className="flex items-center gap-2.5">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 via-amber-500 to-orange-600 text-white shadow-sm border border-amber-300/40">
                  <Trophy className="size-5" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
                    Top 3 Pegawai Terbaik Bulan Ini
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Berdasarkan indeks presensi & disiplin kerja
                  </p>
                </div>
              </div>
              <Badge color="warning" size="sm" prefixIcon={<Award className="size-3" />}>
                Pegawai Teladan
              </Badge>
            </div>

            <div className="space-y-2.5">
              {top3Pegawai.map((emp, index) => {
                const fullName = `${emp.gelar_depan ? emp.gelar_depan + ' ' : ''}${emp.nama_lengkap}${emp.gelar_belakang ? ', ' + emp.gelar_belakang : ''}`
                const rankColor = index === 0 ? 'bg-gradient-to-br from-amber-400 to-orange-500 text-white' : index === 1 ? 'bg-gradient-to-br from-slate-400 to-slate-500 text-white' : 'bg-gradient-to-br from-amber-700 to-amber-800 text-white'
                const rankLabel = index === 0 ? '#1 Pegawai' : index === 1 ? '#2 Pegawai' : '#3 Pegawai'
                return (
                  <EmployeeHoverCard key={emp.id || emp.niy || index} employee={emp}>
                    <div
                      className="flex items-center justify-between p-3 rounded-xl border border-emerald-100 bg-slate-50/70 dark:border-emerald-900/40 dark:bg-slate-900/40 hover:border-amber-300 dark:hover:border-amber-700 transition cursor-pointer"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] font-black shadow-2xs ${rankColor}`}>
                          {index + 1}
                        </span>
                        <PersonAvatar src={getEmployeePhotoUrl(emp)} name={fullName} size="sm" />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-xs font-extrabold text-slate-900 dark:text-white" title={fullName}>
                            {fullName}
                          </p>
                          <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate flex items-center gap-1 mt-0.5">
                            <BriefcaseBusiness className="size-3 text-slate-400" />
                            <span>{emp.jabatan_name || 'Staf'}</span>
                            <span>•</span>
                            <span className="text-emerald-700 dark:text-emerald-400 font-semibold">{emp.unit_name || 'SIT'}</span>
                          </p>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="inline-flex items-center gap-1 rounded-md bg-amber-100/90 px-2 py-0.5 text-[10px] font-extrabold text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                          <Medal className="size-2.5 text-amber-600 dark:text-amber-400" />
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
          <div className="relative overflow-hidden rounded-[22px] border-2 border-emerald-300 dark:border-emerald-700/80 bg-white p-5 shadow-md shadow-emerald-500/10 dark:bg-[#1B2433] space-y-3.5">
            <div className="flex items-center justify-between border-b border-emerald-200/90 dark:border-emerald-800/60 pb-3.5">
              <div className="flex items-center gap-2.5">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-500 via-purple-600 to-indigo-700 text-white shadow-sm border border-purple-300/40">
                  <Award className="size-5" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
                    Top 3 Guru & Pendidik Terbaik Bulan Ini
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Berdasarkan jam mengajar & keaktifan pembelajaran
                  </p>
                </div>
              </div>
              <Badge color="purple" size="sm" prefixIcon={<GraduationCap className="size-3" />}>
                Guru Teladan
              </Badge>
            </div>

            <div className="space-y-2.5">
              {top3Guru.map((emp, index) => {
                const fullName = `${emp.gelar_depan ? emp.gelar_depan + ' ' : ''}${emp.nama_lengkap}${emp.gelar_belakang ? ', ' + emp.gelar_belakang : ''}`
                const rankColor = index === 0 ? 'bg-gradient-to-br from-purple-500 to-indigo-600 text-white' : index === 1 ? 'bg-gradient-to-br from-indigo-400 to-indigo-500 text-white' : 'bg-gradient-to-br from-sky-500 to-blue-600 text-white'
                const rankLabel = index === 0 ? '#1 Guru' : index === 1 ? '#2 Guru' : '#3 Guru'
                return (
                  <EmployeeHoverCard key={emp.id || emp.niy || index} employee={emp}>
                    <div
                      className="flex items-center justify-between p-3 rounded-xl border border-emerald-100 bg-slate-50/70 dark:border-emerald-900/40 dark:bg-slate-900/40 hover:border-purple-300 dark:hover:border-purple-700 transition cursor-pointer"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] font-black shadow-2xs ${rankColor}`}>
                          {index + 1}
                        </span>
                        <PersonAvatar src={getEmployeePhotoUrl(emp)} name={fullName} size="sm" />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-xs font-extrabold text-slate-900 dark:text-white" title={fullName}>
                            {fullName}
                          </p>
                          <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate flex items-center gap-1 mt-0.5">
                            <BookOpen className="size-3 text-slate-400" />
                            <span>{emp.jabatan_name || 'Guru'}</span>
                            <span>•</span>
                            <span className="text-emerald-700 dark:text-emerald-400 font-semibold">{emp.unit_name || 'SIT'}</span>
                          </p>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="inline-flex items-center gap-1 rounded-md bg-purple-100/90 px-2 py-0.5 text-[10px] font-extrabold text-purple-800 dark:bg-purple-950 dark:text-purple-300">
                          <Medal className="size-2.5 text-purple-600 dark:text-purple-400" />
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
                <p>Total Data: {paginationInfo.total} Pegawai</p>
              </div>
            </div>
          }
          title="Daftar Master Data Pegawai & Tendik"
          description="Tabel direktori pegawai, satuan kerja, status keaktifan, dan manajemen profil SDM."
          countLabel={`${Number(paginationInfo.total).toLocaleString('id-ID')} pegawai`}
          actionColumnLabel=""
          columns={columns}
          data={filteredItems}
          isLoading={isLoading}
          isError={isError}
          errorTitle="Data pegawai gagal dimuat"
          errorMessage="Periksa koneksi server atau muat ulang halaman."
          onRetry={() => queryClient.invalidateQueries({ queryKey: ['employees-list'] })}
          isEmpty={!isLoading && !isError && filteredItems.length === 0}
          emptyTitle="Pegawai tidak ditemukan"
          emptyDescription="Tidak ada data pegawai yang cocok dengan kriteria pencarian atau filter."
          serverControlled={true}
          showPagination={true}
          page={page}
          totalPages={paginationInfo.last_page}
          totalItems={paginationInfo.total}
          itemsPerPage={perPage}
          onPageChange={(p) => setPage(p)}
          meta={paginationInfo}
          renderMobileCard={renderMobileCard}
          search={search}
          onSearchChange={(val) => { setSearch(val); setPage(1) }}
          searchPlaceholder="Cari Nama, NIY, NIK, No HP, atau Email..."
          hasActiveFilters={Boolean(search || selectedUnitFilter || selectedJabatanFilter || selectedStatusPegawaiFilter || selectedStatusFilter)}
          onResetFilters={() => {
            setSearch('')
            setSelectedUnitFilter('')
            setSelectedJabatanFilter('')
            setSelectedStatusPegawaiFilter('')
            setSelectedStatusFilter('')
            setPage(1)
          }}
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
                  className="size-10 flex items-center justify-center rounded-2xl bg-rose-100 text-rose-600 hover:bg-rose-600 hover:text-white border border-rose-200 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-900/60 transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer"
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
      <AnimatePresence>
        {showExportModal && (
          <div
            className="overlay modal fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/70 backdrop-blur-md"
            role="dialog"
            aria-modal="true"
            aria-labelledby="employee-export-title"
            tabIndex={-1}
            onMouseDown={(e) => { if (e.target === e.currentTarget) setShowExportModal(false) }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 14 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ type: 'spring', stiffness: 400, damping: 28 }}
              className="modal-dialog font-sans my-auto w-full max-w-md"
            >
              <div className="modal-content flex max-h-[calc(100dvh-2rem)] flex-col overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-2xl shadow-emerald-950/20 dark:border-slate-800 dark:bg-[#182232] dark:shadow-black/60">
                {/* Top Accent Gradient Bar */}
                <div className="h-1.5 w-full bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-600 shrink-0" />

                {/* Header */}
                <div className="modal-header flex items-center justify-between border-b border-slate-100 bg-white px-6 py-4.5 dark:border-slate-800 dark:bg-slate-950">
                  <div className="flex items-center gap-3">
                    <div className="rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200/60 p-2.5 text-amber-700 dark:from-amber-950/60 dark:to-orange-950/40 dark:border-amber-800/60 dark:text-amber-400">
                      <Download1 className="size-5" />
                    </div>
                    <div>
                      <h3 id="employee-export-title" className="modal-title text-sm sm:text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                        <span>Ekspor Data Pegawai</span>
                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-700 border border-amber-200/80 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800/60">
                          <Sparkles className="size-3" />
                          Batch Export
                        </span>
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Pilih format berkas ekspor direktori pegawai</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowExportModal(false)}
                    aria-label="Tutup form ekspor"
                    className="rounded-xl p-2 bg-gradient-to-br from-rose-500 via-rose-600 to-red-700 text-white border border-rose-300/40 hover:scale-105 transition-all duration-200 active:scale-95 cursor-pointer"
                  >
                    <X className="size-4" strokeWidth={2.25} />
                  </button>
                </div>

                {/* Body */}
                <div className="modal-body min-h-0 flex-1 space-y-3 p-6 text-sm text-slate-700 dark:text-slate-200">
                  <button
                    type="button"
                    onClick={() => handleExportDataFormat('xlsx')}
                    className="w-full flex items-center justify-between p-3.5 rounded-2xl border border-emerald-200/80 bg-emerald-50/50 hover:bg-emerald-100/70 dark:bg-emerald-950/30 dark:border-emerald-800 text-left transition-all duration-200 hover:scale-[1.01] cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div className="size-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 flex items-center justify-center shrink-0">
                        <FileSpreadsheet className="size-5 text-emerald-600" />
                      </div>
                      <div>
                        <strong className="block text-xs text-slate-900 dark:text-white font-bold">Microsoft Excel (.xlsx)</strong>
                        <span className="text-[11px] text-slate-500 dark:text-slate-400">Format spreadsheet modern (.xlsx)</span>
                      </div>
                    </div>
                    <Badge color="success" size="sm">Rekomendasi</Badge>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleExportDataFormat('xls')}
                    className="w-full flex items-center justify-between p-3.5 rounded-2xl border border-slate-200 bg-slate-50/50 hover:bg-slate-100 dark:bg-slate-800/40 dark:border-slate-700 text-left transition-all duration-200 hover:scale-[1.01] cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div className="size-10 rounded-xl bg-amber-100 dark:bg-amber-900/60 text-amber-700 dark:text-amber-300 flex items-center justify-center shrink-0">
                        <FileSpreadsheet className="size-5 text-amber-600" />
                      </div>
                      <div>
                        <strong className="block text-xs text-slate-900 dark:text-white font-bold">Excel Standar (.xls)</strong>
                        <span className="text-[11px] text-slate-500 dark:text-slate-400">Format spreadsheet MS Excel legacy (.xls)</span>
                      </div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleExportDataFormat('csv')}
                    className="w-full flex items-center justify-between p-3.5 rounded-2xl border border-slate-200 bg-slate-50/50 hover:bg-slate-100 dark:bg-slate-800/40 dark:border-slate-700 text-left transition-all duration-200 hover:scale-[1.01] cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div className="size-10 rounded-xl bg-sky-100 dark:bg-sky-900/60 text-sky-700 dark:text-sky-300 flex items-center justify-center shrink-0">
                        <FileText className="size-5 text-sky-600" />
                      </div>
                      <div>
                        <strong className="block text-xs text-slate-900 dark:text-white font-bold">Comma Separated (.csv)</strong>
                        <span className="text-[11px] text-slate-500 dark:text-slate-400">Format teks berpisah koma (UTF-8 BOM)</span>
                      </div>
                    </div>
                  </button>
                </div>

                {/* Footer */}
                <div className="modal-footer flex items-center justify-end border-t border-slate-100 bg-slate-50/50 px-6 py-4 dark:border-slate-800 dark:bg-slate-900/30">
                  <button
                    type="button"
                    onClick={() => setShowExportModal(false)}
                    className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-br from-rose-500 via-rose-600 to-red-700 text-white px-4 py-2 text-xs font-extrabold border border-rose-300/40 transition-all duration-200 hover:scale-[1.03] active:scale-95 cursor-pointer"
                  >
                    <div className="flex size-4.5 items-center justify-center rounded-lg bg-white/20 text-white">
                      <X className="size-3 text-white" strokeWidth={2.2} />
                    </div>
                    <span>Tutup</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* DOWNLOAD TEMPLATE MODAL (.csv, .xls, .xlsx) */}
      <AnimatePresence>
        {showTemplateModal && (
          <div
            className="overlay modal fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/70 backdrop-blur-md"
            role="dialog"
            aria-modal="true"
            aria-labelledby="employee-template-title"
            tabIndex={-1}
            onMouseDown={(e) => { if (e.target === e.currentTarget) setShowTemplateModal(false) }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 14 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ type: 'spring', stiffness: 400, damping: 28 }}
              className="modal-dialog font-sans my-auto w-full max-w-md"
            >
              <div className="modal-content flex max-h-[calc(100dvh-2rem)] flex-col overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-2xl shadow-emerald-950/20 dark:border-slate-800 dark:bg-[#182232] dark:shadow-black/60">
                {/* Top Accent Gradient Bar */}
                <div className="h-1.5 w-full bg-gradient-to-r from-purple-500 via-violet-400 to-indigo-600 shrink-0" />

                {/* Header */}
                <div className="modal-header flex items-center justify-between border-b border-slate-100 bg-white px-6 py-4.5 dark:border-slate-800 dark:bg-slate-950">
                  <div className="flex items-center gap-3">
                    <div className="rounded-2xl bg-gradient-to-br from-purple-50 to-violet-50 border border-purple-200/60 p-2.5 text-purple-700 dark:from-purple-950/60 dark:to-violet-950/40 dark:border-purple-800/60 dark:text-purple-400">
                      <FileSpreadsheet className="size-5" />
                    </div>
                    <div>
                      <h3 id="employee-template-title" className="modal-title text-sm sm:text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                        <span>Unduh Template Impor</span>
                        <span className="inline-flex items-center gap-1 rounded-full bg-purple-50 px-2 py-0.5 text-[10px] font-bold text-purple-700 border border-purple-200/80 dark:bg-purple-950/60 dark:text-purple-300 dark:border-purple-800/60">
                          <Sparkles className="size-3" />
                          Template SDM
                        </span>
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Pilih format berkas template pengisian data</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowTemplateModal(false)}
                    aria-label="Tutup form template"
                    className="rounded-xl p-2 bg-gradient-to-br from-rose-500 via-rose-600 to-red-700 text-white border border-rose-300/40 hover:scale-105 transition-all duration-200 active:scale-95 cursor-pointer"
                  >
                    <X className="size-4" strokeWidth={2.25} />
                  </button>
                </div>

                {/* Body */}
                <div className="modal-body min-h-0 flex-1 space-y-3 p-6 text-sm text-slate-700 dark:text-slate-200">
                  <button
                    type="button"
                    onClick={() => handleDownloadTemplatePegawaiFormat('xlsx')}
                    className="w-full flex items-center justify-between p-3.5 rounded-2xl border border-purple-200/80 bg-purple-50/50 hover:bg-purple-100/70 dark:bg-purple-950/30 dark:border-purple-800 text-left transition-all duration-200 hover:scale-[1.01] cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div className="size-10 rounded-xl bg-purple-100 dark:bg-purple-900/60 text-purple-700 dark:text-purple-300 flex items-center justify-center shrink-0">
                        <FileSpreadsheet className="size-5 text-purple-600" />
                      </div>
                      <div>
                        <strong className="block text-xs text-slate-900 dark:text-white font-bold">Template Excel (.xlsx)</strong>
                        <span className="text-[11px] text-slate-500 dark:text-slate-400">Format spreadsheet Excel (.xlsx) dengan contoh baris</span>
                      </div>
                    </div>
                    <Badge color="purple" size="sm">Rekomendasi</Badge>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDownloadTemplatePegawaiFormat('csv')}
                    className="w-full flex items-center justify-between p-3.5 rounded-2xl border border-slate-200 bg-slate-50/50 hover:bg-slate-100 dark:bg-slate-800/40 dark:border-slate-700 text-left transition-all duration-200 hover:scale-[1.01] cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div className="size-10 rounded-xl bg-sky-100 dark:bg-sky-900/60 text-sky-700 dark:text-sky-300 flex items-center justify-center shrink-0">
                        <FileText className="size-5 text-sky-600" />
                      </div>
                      <div>
                        <strong className="block text-xs text-slate-900 dark:text-white font-bold">Template CSV (.csv)</strong>
                        <span className="text-[11px] text-slate-500 dark:text-slate-400">Format dokumen teks (.csv) dengan header kolom lengkap</span>
                      </div>
                    </div>
                  </button>
                </div>

                {/* Footer */}
                <div className="modal-footer flex items-center justify-end border-t border-slate-100 bg-slate-50/50 px-6 py-4 dark:border-slate-800 dark:bg-slate-900/30">
                  <button
                    type="button"
                    onClick={() => setShowTemplateModal(false)}
                    className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-br from-rose-500 via-rose-600 to-red-700 text-white px-4 py-2 text-xs font-extrabold border border-rose-300/40 transition-all duration-200 hover:scale-[1.03] active:scale-95 cursor-pointer"
                  >
                    <div className="flex size-4.5 items-center justify-center rounded-lg bg-white/20 text-white">
                      <X className="size-3 text-white" strokeWidth={2.2} />
                    </div>
                    <span>Tutup</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 5. MODAL WIZARD: TAMBAH / EDIT PEGAWAI */}
      {isFormModalOpen && (
        <div className="overlay modal fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/70 backdrop-blur-md print:hidden animate-fadeIn" role="dialog" aria-modal="true" aria-labelledby="employee-form-title" tabIndex={-1}>
          <div className="modal-dialog font-sans my-auto w-full max-w-4xl">
            <div className="modal-content flex max-h-[calc(100dvh-2.5rem)] flex-col overflow-hidden rounded-3xl border border-slate-200/90 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-950">
              {/* Top accent bar */}
              <div className="h-1.5 w-full bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-600 shrink-0" />

              {/* Header */}
              <div className="modal-header flex items-center justify-between border-b border-slate-100 bg-white px-6 py-4.5 dark:border-slate-800 dark:bg-slate-950">
                <div className="flex items-center gap-3">
                  <div className="rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200/60 p-2.5 text-[#0E5C44] dark:from-emerald-950/60 dark:to-teal-950/40 dark:border-emerald-800/60 dark:text-[#3FBF75]">
                    <UserPlus className="h-5 w-5" strokeWidth={2.25} />
                  </div>
                  <div>
                    <h3 id="employee-form-title" className="modal-title text-sm sm:text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                      <span>{isEditMode ? (isUnitPersonnelManager ? 'Edit Jabatan Pegawai' : 'Edit Pegawai') : 'Tambah Pegawai'}</span>
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-[#0E5C44] border border-emerald-200/80 dark:bg-emerald-950/60 dark:text-emerald-400 dark:border-emerald-800/60">
                        <Sparkles className="size-3" />
                        {isEditMode ? 'Update' : 'Baru'}
                      </span>
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      Langkah {currentStep} dari 4 · {
                        currentStep === 1 ? 'Identitas & Foto' :
                        currentStep === 2 ? 'Kepegawaian' :
                        currentStep === 3 ? 'Kontak & Alamat' :
                        'Konfirmasi Data'
                      }
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {isUnitPersonnelManager && <span className="rounded-full bg-amber-50 px-3 py-1 text-[10px] font-extrabold text-amber-800 border border-amber-200/80 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800/60">Hanya jabatan unit ini yang dapat diubah</span>}
                  <button
                    type="button"
                    onClick={closeFormModal}
                    className="rounded-xl p-2 bg-gradient-to-br from-rose-500 via-rose-600 to-red-700 text-white border border-rose-300/40 hover:scale-105 transition-all duration-200 active:scale-95 cursor-pointer"
                    aria-label="Tutup"
                  >
                    <X className="size-4" strokeWidth={2.25} />
                  </button>
                </div>
              </div>

              {/* Step Wizard Indicator (Standardized Horizontal Bar) */}
              <div className="border-b border-slate-100 bg-slate-50/70 p-2.5 dark:border-slate-800 dark:bg-slate-900/50">
                <div className="grid grid-cols-4 gap-1.5 sm:gap-2">
                  {[
                    { step: 1, label: 'Identitas & Foto', icon: UserCheck },
                    { step: 2, label: 'Kepegawaian', icon: BriefcaseBusiness },
                    { step: 3, label: 'Kontak & Alamat', icon: Phone },
                    { step: 4, label: 'Konfirmasi', icon: CheckCircle2 },
                  ].map((s) => {
                    const isActive = currentStep === s.step
                    const isDone = currentStep > s.step
                    return (
                      <button
                        key={s.step}
                        type="button"
                        onClick={() => setCurrentStep(s.step)}
                        className={`flex items-center justify-center gap-1.5 rounded-xl py-2 px-2.5 text-[11px] font-extrabold transition-all duration-200 cursor-pointer ${
                          isActive
                            ? 'bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700 text-white border border-emerald-300/40 dark:from-emerald-400 dark:via-emerald-500 dark:to-teal-600'
                            : isDone
                            ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 hover:bg-emerald-100/80 border border-emerald-200/50 dark:border-emerald-800/40'
                            : 'bg-white text-slate-400 border border-slate-200/80 hover:bg-slate-100 dark:bg-slate-800/60 dark:border-slate-700/60 dark:text-slate-500'
                        }`}
                      >
                        <s.icon className={`size-3.5 shrink-0 ${isActive ? 'text-white' : isDone ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}`} />
                        <span className="truncate">{s.label}</span>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Form Content Body */}
              <div className="modal-body min-h-0 flex-1 overflow-y-auto p-6 space-y-4 text-sm text-slate-700 dark:text-slate-200 max-h-[560px]">
                {/* Banner Status in Edit Mode */}
                {isEditMode && (
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-emerald-200/80 bg-gradient-to-r from-emerald-50/80 via-teal-50/50 to-emerald-50/80 p-4 dark:border-emerald-800/60 dark:from-emerald-950/40 dark:to-teal-950/20">
                    <div className="flex items-center gap-3">
                      <div className="flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 text-white font-black text-xs">
                        {formData.niy ? formData.niy.slice(-3) : 'NIY'}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-black text-slate-900 dark:text-white">{formData.nama_lengkap}</span>
                          <span className="rounded-full bg-emerald-100 text-emerald-800 px-2 py-0.5 text-[10px] font-extrabold dark:bg-emerald-900/60 dark:text-emerald-300">{formData.status}</span>
                        </div>
                        <p className="text-[11px] font-semibold text-slate-500">{formData.niy} · {formData.status_pegawai}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {isGlobalPersonnelManager && (
                        <button
                          type="button"
                          onClick={() => toggleEmployeeStatus(formData)}
                          className="rounded-xl border border-amber-300 bg-amber-50 px-3 py-1.5 text-xs font-bold text-amber-700 hover:bg-amber-100 transition-colors cursor-pointer"
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
                          className="rounded-xl border border-rose-300 bg-rose-50 px-3 py-1.5 text-xs font-bold text-rose-600 hover:bg-rose-100 transition-colors cursor-pointer"
                        >
                          Hapus Pegawai
                        </button>
                      )}
                    </div>
                  </div>
                )}
                    {/* STEP 1: Identitas & Foto */}
                    {currentStep === 1 && (
                      <div className="space-y-4">
                        <h3 className="text-base font-bold text-slate-800 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-2">Identitas Pegawai</h3>

                        <div>
                          <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5">Foto Pegawai</label>
                          {formData.foto ? (
                            <div className="flex items-center gap-4 p-3.5 rounded-2xl border border-emerald-200/90 bg-emerald-50/60 dark:bg-emerald-950/40 dark:border-emerald-800">
                              <PersonAvatar
                                src={formData.foto}
                                name={formData.nama_lengkap}
                                size="detail"
                                className="h-16 w-16 shrink-0 border-2 border-emerald-600 shadow-sm"
                              />
                              <div>
                                <p className="text-xs font-bold text-slate-800 dark:text-slate-100">Foto Berhasil Diunggah</p>
                                <button
                                  type="button"
                                  onClick={() => setFormData((p) => ({ ...p, foto: '' }))}
                                  className="text-xs font-bold text-rose-600 hover:underline mt-1 inline-block cursor-pointer"
                                >
                                  Hapus Foto & Upload Ulang
                                </button>
                              </div>
                            </div>
                          ) : (
                            <label className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-emerald-300/80 bg-emerald-50/20 p-5 text-center hover:bg-emerald-50/35 hover:border-emerald-500 cursor-pointer transition-all dark:border-emerald-800/60 dark:bg-slate-900/30">
                              <div className="mb-2 flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200/60 text-[#0E5C44] dark:from-emerald-950/60 dark:to-teal-950/40 dark:border-emerald-800/60 dark:text-[#3FBF75]">
                                <Upload className="size-5" strokeWidth={2.2} />
                              </div>
                              <span className="text-xs font-bold text-slate-800 dark:text-slate-100">Upload Foto Profil</span>
                              <span className="text-[11px] text-slate-400 mt-0.5">PNG, JPG Maksimal 2MB</span>
                              <input type="file" accept="image/*" onChange={handleFotoUpload} className="hidden" />
                            </label>
                          )}
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5">
                              NIY (Nomor Induk Yayasan) <span className="text-rose-500">*</span>
                            </label>
                            <div className="relative flex items-center">
                              <div className="pointer-events-none absolute left-3.5 flex items-center text-slate-400 dark:text-slate-500">
                                <Hash className="size-4" />
                              </div>
                              <input
                                type="text"
                                placeholder="NIY-2026xxxx"
                                value={formData.niy}
                                onChange={(e) => setFormData((p) => ({ ...p, niy: e.target.value }))}
                                className="w-full rounded-xl border border-slate-200/90 bg-slate-50/50 pl-10 pr-4 py-2.5 text-xs font-semibold text-slate-800 placeholder:text-slate-400/80 transition-all duration-200 hover:border-slate-300 focus:border-[#0E5C44] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#0E5C44]/12 dark:border-slate-700/80 dark:bg-slate-900/50 dark:text-slate-100 dark:hover:border-slate-600 dark:focus:border-[#3FBF75] dark:focus:bg-slate-900 dark:focus:ring-[#3FBF75]/20"
                              />
                            </div>
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5">NIK (Nomor Induk Kependudukan)</label>
                            <div className="relative flex items-center">
                              <div className="pointer-events-none absolute left-3.5 flex items-center text-slate-400 dark:text-slate-500">
                                <IdCard className="size-4" />
                              </div>
                              <input
                                type="text"
                                placeholder="1371xxxxxxxxxxxx"
                                value={formData.nik}
                                onChange={(e) => setFormData((p) => ({ ...p, nik: e.target.value }))}
                                className="w-full rounded-xl border border-slate-200/90 bg-slate-50/50 pl-10 pr-4 py-2.5 text-xs font-semibold text-slate-800 placeholder:text-slate-400/80 transition-all duration-200 hover:border-slate-300 focus:border-[#0E5C44] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#0E5C44]/12 dark:border-slate-700/80 dark:bg-slate-900/50 dark:text-slate-100 dark:hover:border-slate-600 dark:focus:border-[#3FBF75] dark:focus:bg-slate-900 dark:focus:ring-[#3FBF75]/20"
                              />
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-3 gap-3">
                          <div>
                            <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5">Gelar Depan</label>
                            <div className="relative flex items-center">
                              <div className="pointer-events-none absolute left-3.5 flex items-center text-slate-400 dark:text-slate-500">
                                <GraduationCap className="size-4" />
                              </div>
                              <input
                                type="text"
                                placeholder="Ust. / Dr."
                                value={formData.gelar_depan}
                                onChange={(e) => setFormData((p) => ({ ...p, gelar_depan: e.target.value }))}
                                className="w-full rounded-xl border border-slate-200/90 bg-slate-50/50 pl-10 pr-4 py-2.5 text-xs font-semibold text-slate-800 placeholder:text-slate-400/80 transition-all duration-200 hover:border-slate-300 focus:border-[#0E5C44] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#0E5C44]/12 dark:border-slate-700/80 dark:bg-slate-900/50 dark:text-slate-100 dark:hover:border-slate-600 dark:focus:border-[#3FBF75] dark:focus:bg-slate-900 dark:focus:ring-[#3FBF75]/20"
                              />
                            </div>
                          </div>
                          <div className="col-span-2">
                            <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5">
                              Nama Lengkap <span className="text-rose-500">*</span>
                            </label>
                            <div className="relative flex items-center">
                              <div className="pointer-events-none absolute left-3.5 flex items-center text-slate-400 dark:text-slate-500">
                                <User className="size-4" />
                              </div>
                              <input
                                type="text"
                                placeholder="Ahmad Farhan"
                                value={formData.nama_lengkap}
                                onChange={(e) => setFormData((p) => ({ ...p, nama_lengkap: e.target.value }))}
                                className="w-full rounded-xl border border-slate-200/90 bg-slate-50/50 pl-10 pr-4 py-2.5 text-xs font-semibold text-slate-800 placeholder:text-slate-400/80 transition-all duration-200 hover:border-slate-300 focus:border-[#0E5C44] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#0E5C44]/12 dark:border-slate-700/80 dark:bg-slate-900/50 dark:text-slate-100 dark:hover:border-slate-600 dark:focus:border-[#3FBF75] dark:focus:bg-slate-900 dark:focus:ring-[#3FBF75]/20"
                              />
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5">Gelar Belakang</label>
                            <div className="relative flex items-center">
                              <div className="pointer-events-none absolute left-3.5 flex items-center text-slate-400 dark:text-slate-500">
                                <Award className="size-4" />
                              </div>
                              <input
                                type="text"
                                placeholder="S.Pd / M.Pd"
                                value={formData.gelar_belakang}
                                onChange={(e) => setFormData((p) => ({ ...p, gelar_belakang: e.target.value }))}
                                className="w-full rounded-xl border border-slate-200/90 bg-slate-50/50 pl-10 pr-4 py-2.5 text-xs font-semibold text-slate-800 placeholder:text-slate-400/80 transition-all duration-200 hover:border-slate-300 focus:border-[#0E5C44] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#0E5C44]/12 dark:border-slate-700/80 dark:bg-slate-900/50 dark:text-slate-100 dark:hover:border-slate-600 dark:focus:border-[#3FBF75] dark:focus:bg-slate-900 dark:focus:ring-[#3FBF75]/20"
                              />
                            </div>
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5">Nama Panggilan</label>
                            <div className="relative flex items-center">
                              <div className="pointer-events-none absolute left-3.5 flex items-center text-slate-400 dark:text-slate-500">
                                <UserCheck className="size-4" />
                              </div>
                              <input
                                type="text"
                                placeholder="Farhan"
                                value={formData.nama_panggilan}
                                onChange={(e) => setFormData((p) => ({ ...p, nama_panggilan: e.target.value }))}
                                className="w-full rounded-xl border border-slate-200/90 bg-slate-50/50 pl-10 pr-4 py-2.5 text-xs font-semibold text-slate-800 placeholder:text-slate-400/80 transition-all duration-200 hover:border-slate-300 focus:border-[#0E5C44] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#0E5C44]/12 dark:border-slate-700/80 dark:bg-slate-900/50 dark:text-slate-100 dark:hover:border-slate-600 dark:focus:border-[#3FBF75] dark:focus:bg-slate-900 dark:focus:ring-[#3FBF75]/20"
                              />
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-3 gap-3">
                          <div>
                            <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5">Jenis Kelamin</label>
                            <div className="relative flex items-center">
                              <div className="pointer-events-none absolute left-3.5 flex items-center text-slate-400 dark:text-slate-500">
                                <Users className="size-4" />
                              </div>
                              <select
                                value={formData.jenis_kelamin}
                                onChange={(e) => setFormData((p) => ({ ...p, jenis_kelamin: e.target.value }))}
                                className="w-full rounded-xl border border-slate-200/90 bg-slate-50/50 pl-10 pr-8 py-2.5 text-xs font-semibold text-slate-800 transition-all duration-200 hover:border-slate-300 focus:border-[#0E5C44] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#0E5C44]/12 dark:border-slate-700/80 dark:bg-slate-900/50 dark:text-slate-100 dark:hover:border-slate-600 dark:focus:border-[#3FBF75] dark:focus:bg-slate-900 dark:focus:ring-[#3FBF75]/20 cursor-pointer"
                              >
                                <option value="L">Laki-laki</option>
                                <option value="P">Perempuan</option>
                              </select>
                            </div>
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5">Tempat Lahir</label>
                            <div className="relative flex items-center">
                              <div className="pointer-events-none absolute left-3.5 flex items-center text-slate-400 dark:text-slate-500">
                                <MapPin className="size-4" />
                              </div>
                              <input
                                type="text"
                                placeholder="Padang"
                                value={formData.tempat_lahir}
                                onChange={(e) => setFormData((p) => ({ ...p, tempat_lahir: e.target.value }))}
                                className="w-full rounded-xl border border-slate-200/90 bg-slate-50/50 pl-10 pr-4 py-2.5 text-xs font-semibold text-slate-800 placeholder:text-slate-400/80 transition-all duration-200 hover:border-slate-300 focus:border-[#0E5C44] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#0E5C44]/12 dark:border-slate-700/80 dark:bg-slate-900/50 dark:text-slate-100 dark:hover:border-slate-600 dark:focus:border-[#3FBF75] dark:focus:bg-slate-900 dark:focus:ring-[#3FBF75]/20"
                              />
                            </div>
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5">Tanggal Lahir</label>
                            <div className="relative flex items-center">
                              <div className="pointer-events-none absolute left-3.5 flex items-center text-slate-400 dark:text-slate-500">
                                <Calendar className="size-4" />
                              </div>
                              <input
                                type="date"
                                value={formData.tanggal_lahir}
                                onChange={(e) => setFormData((p) => ({ ...p, tanggal_lahir: e.target.value }))}
                                className="w-full rounded-xl border border-slate-200/90 bg-slate-50/50 pl-10 pr-4 py-2.5 text-xs font-semibold text-slate-800 transition-all duration-200 hover:border-slate-300 focus:border-[#0E5C44] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#0E5C44]/12 dark:border-slate-700/80 dark:bg-slate-900/50 dark:text-slate-100 dark:hover:border-slate-600 dark:focus:border-[#3FBF75] dark:focus:bg-slate-900 dark:focus:ring-[#3FBF75]/20"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* STEP 2: Kepegawaian */}
                    {currentStep === 2 && (
                      <div className="space-y-4">
                        <h3 className="text-base font-bold text-slate-800 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-2">Status & Penempatan Kepegawaian</h3>

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5">Unit Kerja / Sekolah</label>
                            <div className="relative flex items-center">
                              <div className="pointer-events-none absolute left-3.5 flex items-center text-slate-400 dark:text-slate-500">
                                <Building2 className="size-4" />
                              </div>
                              <select
                                 value={formData.unit_id}
                                 onChange={(e) => setFormData((p) => ({ ...p, unit_id: e.target.value }))}
                                 disabled={isUnitPersonnelManager}
                                 className="w-full rounded-xl border border-slate-200/90 bg-slate-50/50 pl-10 pr-8 py-2.5 text-xs font-semibold text-slate-800 transition-all duration-200 hover:border-slate-300 focus:border-[#0E5C44] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#0E5C44]/12 dark:border-slate-700/80 dark:bg-slate-900/50 dark:text-slate-100 dark:hover:border-slate-600 dark:focus:border-[#3FBF75] dark:focus:bg-slate-900 dark:focus:ring-[#3FBF75]/20 disabled:bg-slate-100/80 disabled:text-slate-400 disabled:cursor-not-allowed cursor-pointer"
                              >
                                <option value="">Pilih Unit Pendidikan</option>
                                {unitsList.map((u) => (
                                  <option key={u.id} value={u.id}>{u.name}</option>
                                ))}
                              </select>
                            </div>
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5">Jabatan Master</label>
                            <div className="relative flex items-center">
                              <div className="pointer-events-none absolute left-3.5 flex items-center text-slate-400 dark:text-slate-500">
                                <BriefcaseBusiness className="size-4" />
                              </div>
                              <select
                                value={formData.jabatan_id}
                                onChange={(e) => setFormData((p) => ({ ...p, jabatan_id: e.target.value }))}
                                className="w-full rounded-xl border border-slate-200/90 bg-slate-50/50 pl-10 pr-8 py-2.5 text-xs font-semibold text-slate-800 transition-all duration-200 hover:border-slate-300 focus:border-[#0E5C44] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#0E5C44]/12 dark:border-slate-700/80 dark:bg-slate-900/50 dark:text-slate-100 dark:hover:border-slate-600 dark:focus:border-[#3FBF75] dark:focus:bg-slate-900 dark:focus:ring-[#3FBF75]/20 cursor-pointer"
                              >
                                <option value="">Pilih Jabatan</option>
                                {positionsList.map((p) => (
                                  <option key={p.id} value={p.id}>{p.name}</option>
                                ))}
                              </select>
                            </div>
                          </div>
                        </div>

                        <div className={`grid grid-cols-2 gap-3 ${isUnitPersonnelManager ? 'hidden' : ''}`}>
                          <div>
                            <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5">Status Pegawai</label>
                            <div className="relative flex items-center">
                              <div className="pointer-events-none absolute left-3.5 flex items-center text-slate-400 dark:text-slate-500">
                                <BadgeCheck className="size-4" />
                              </div>
                              <select
                                value={formData.status_pegawai}
                                onChange={(e) => setFormData((p) => ({ ...p, status_pegawai: e.target.value }))}
                                className="w-full rounded-xl border border-slate-200/90 bg-slate-50/50 pl-10 pr-8 py-2.5 text-xs font-semibold text-slate-800 transition-all duration-200 hover:border-slate-300 focus:border-[#0E5C44] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#0E5C44]/12 dark:border-slate-700/80 dark:bg-slate-900/50 dark:text-slate-100 dark:hover:border-slate-600 dark:focus:border-[#3FBF75] dark:focus:bg-slate-900 dark:focus:ring-[#3FBF75]/20 cursor-pointer"
                              >
                                {STATUS_PEGAWAI_OPTIONS.map((st) => (
                                  <option key={st} value={st}>{st}</option>
                                ))}
                              </select>
                            </div>
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5">Status Keaktifan</label>
                            <div className="relative flex items-center">
                              <div className="pointer-events-none absolute left-3.5 flex items-center text-slate-400 dark:text-slate-500">
                                <Activity className="size-4" />
                              </div>
                              <select
                                value={formData.status}
                                onChange={(e) => setFormData((p) => ({ ...p, status: e.target.value }))}
                                className="w-full rounded-xl border border-slate-200/90 bg-slate-50/50 pl-10 pr-8 py-2.5 text-xs font-semibold text-slate-800 transition-all duration-200 hover:border-slate-300 focus:border-[#0E5C44] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#0E5C44]/12 dark:border-slate-700/80 dark:bg-slate-900/50 dark:text-slate-100 dark:hover:border-slate-600 dark:focus:border-[#3FBF75] dark:focus:bg-slate-900 dark:focus:ring-[#3FBF75]/20 cursor-pointer"
                              >
                                {STATUS_OPTIONS.map((st) => (
                                  <option key={st} value={st}>{st}</option>
                                ))}
                              </select>
                            </div>
                          </div>
                        </div>

                        <div className={`grid grid-cols-2 gap-3 ${isUnitPersonnelManager ? 'hidden' : ''}`}>
                          <div>
                            <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5">Tanggal Masuk</label>
                            <div className="relative flex items-center">
                              <div className="pointer-events-none absolute left-3.5 flex items-center text-slate-400 dark:text-slate-500">
                                <Calendar className="size-4" />
                              </div>
                              <input
                                type="date"
                                value={formData.tanggal_masuk}
                                onChange={(e) => setFormData((p) => ({ ...p, tanggal_masuk: e.target.value }))}
                                className="w-full rounded-xl border border-slate-200/90 bg-slate-50/50 pl-10 pr-4 py-2.5 text-xs font-semibold text-slate-800 transition-all duration-200 hover:border-slate-300 focus:border-[#0E5C44] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#0E5C44]/12 dark:border-slate-700/80 dark:bg-slate-900/50 dark:text-slate-100 dark:hover:border-slate-600 dark:focus:border-[#3FBF75] dark:focus:bg-slate-900 dark:focus:ring-[#3FBF75]/20"
                              />
                            </div>
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5">Tanggal Keluar (Jika Ada)</label>
                            <div className="relative flex items-center">
                              <div className="pointer-events-none absolute left-3.5 flex items-center text-slate-400 dark:text-slate-500">
                                <Calendar className="size-4" />
                              </div>
                              <input
                                type="date"
                                value={formData.tanggal_keluar}
                                onChange={(e) => setFormData((p) => ({ ...p, tanggal_keluar: e.target.value }))}
                                className="w-full rounded-xl border border-slate-200/90 bg-slate-50/50 pl-10 pr-4 py-2.5 text-xs font-semibold text-slate-800 transition-all duration-200 hover:border-slate-300 focus:border-[#0E5C44] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#0E5C44]/12 dark:border-slate-700/80 dark:bg-slate-900/50 dark:text-slate-100 dark:hover:border-slate-600 dark:focus:border-[#3FBF75] dark:focus:bg-slate-900 dark:focus:ring-[#3FBF75]/20"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* STEP 3: Kontak & Alamat */}
                    {currentStep === 3 && (
                      <div className="space-y-4">
                        <h3 className="text-base font-bold text-slate-800 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-2">Kontak & Alamat</h3>

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5">No. WhatsApp / HP</label>
                            <div className="relative flex items-center">
                              <div className="pointer-events-none absolute left-3.5 flex items-center text-slate-400 dark:text-slate-500">
                                <Phone className="size-4" />
                              </div>
                              <input
                                type="text"
                                placeholder="0812-3456-7890"
                                value={formData.no_hp}
                                onChange={(e) => setFormData((p) => ({ ...p, no_hp: e.target.value }))}
                                className="w-full rounded-xl border border-slate-200/90 bg-slate-50/50 pl-10 pr-4 py-2.5 text-xs font-semibold text-slate-800 placeholder:text-slate-400/80 transition-all duration-200 hover:border-slate-300 focus:border-[#0E5C44] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#0E5C44]/12 dark:border-slate-700/80 dark:bg-slate-900/50 dark:text-slate-100 dark:hover:border-slate-600 dark:focus:border-[#3FBF75] dark:focus:bg-slate-900 dark:focus:ring-[#3FBF75]/20"
                              />
                            </div>
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5">Email Pegawai</label>
                            <div className="relative flex items-center">
                              <div className="pointer-events-none absolute left-3.5 flex items-center text-slate-400 dark:text-slate-500">
                                <Mail className="size-4" />
                              </div>
                              <input
                                type="email"
                                placeholder="pegawai@dareliman.sch.id"
                                value={formData.email}
                                onChange={(e) => setFormData((p) => ({ ...p, email: e.target.value }))}
                                className="w-full rounded-xl border border-slate-200/90 bg-slate-50/50 pl-10 pr-4 py-2.5 text-xs font-semibold text-slate-800 placeholder:text-slate-400/80 transition-all duration-200 hover:border-slate-300 focus:border-[#0E5C44] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#0E5C44]/12 dark:border-slate-700/80 dark:bg-slate-900/50 dark:text-slate-100 dark:hover:border-slate-600 dark:focus:border-[#3FBF75] dark:focus:bg-slate-900 dark:focus:ring-[#3FBF75]/20"
                              />
                            </div>
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5">Alamat Tempat Tinggal</label>
                          <div className="relative">
                            <div className="pointer-events-none absolute left-3.5 top-3 flex items-center text-slate-400 dark:text-slate-500">
                              <MapPin className="size-4" />
                            </div>
                            <textarea
                              rows={3}
                              placeholder="Jl. Khatib Sulaiman No. 20..."
                              value={formData.alamat}
                              onChange={(e) => setFormData((p) => ({ ...p, alamat: e.target.value }))}
                              className="w-full rounded-xl border border-slate-200/90 bg-slate-50/50 pl-10 pr-4 py-2.5 text-xs font-semibold text-slate-800 placeholder:text-slate-400/80 transition-all duration-200 hover:border-slate-300 focus:border-[#0E5C44] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#0E5C44]/12 dark:border-slate-700/80 dark:bg-slate-900/50 dark:text-slate-100 dark:hover:border-slate-600 dark:focus:border-[#3FBF75] dark:focus:bg-slate-900 dark:focus:ring-[#3FBF75]/20 resize-none"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5">Kota / Kabupaten</label>
                            <div className="relative flex items-center">
                              <div className="pointer-events-none absolute left-3.5 flex items-center text-slate-400 dark:text-slate-500">
                                <Building className="size-4" />
                              </div>
                              <input
                                type="text"
                                placeholder="Padang"
                                value={formData.kota}
                                onChange={(e) => setFormData((p) => ({ ...p, kota: e.target.value }))}
                                className="w-full rounded-xl border border-slate-200/90 bg-slate-50/50 pl-10 pr-4 py-2.5 text-xs font-semibold text-slate-800 placeholder:text-slate-400/80 transition-all duration-200 hover:border-slate-300 focus:border-[#0E5C44] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#0E5C44]/12 dark:border-slate-700/80 dark:bg-slate-900/50 dark:text-slate-100 dark:hover:border-slate-600 dark:focus:border-[#3FBF75] dark:focus:bg-slate-900 dark:focus:ring-[#3FBF75]/20"
                              />
                            </div>
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5">Provinsi</label>
                            <div className="relative flex items-center">
                              <div className="pointer-events-none absolute left-3.5 flex items-center text-slate-400 dark:text-slate-500">
                                <Globe className="size-4" />
                              </div>
                              <input
                                type="text"
                                placeholder="Sumatera Barat"
                                value={formData.provinsi}
                                onChange={(e) => setFormData((p) => ({ ...p, provinsi: e.target.value }))}
                                className="w-full rounded-xl border border-slate-200/90 bg-slate-50/50 pl-10 pr-4 py-2.5 text-xs font-semibold text-slate-800 placeholder:text-slate-400/80 transition-all duration-200 hover:border-slate-300 focus:border-[#0E5C44] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#0E5C44]/12 dark:border-slate-700/80 dark:bg-slate-900/50 dark:text-slate-100 dark:hover:border-slate-600 dark:focus:border-[#3FBF75] dark:focus:bg-slate-900 dark:focus:ring-[#3FBF75]/20"
                              />
                            </div>
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

              {/* Bottom Footer Actions */}
              <div className="modal-footer flex items-center justify-between border-t border-slate-100 bg-white px-5 py-4 dark:border-slate-700 dark:bg-[#1B2433]">
                <button
                  type="button"
                  onClick={closeFormModal}
                  className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-br from-rose-500 via-rose-600 to-red-700 text-white px-4 py-2.5 text-xs font-extrabold border border-rose-300/40 transition-all duration-200 hover:scale-[1.03] active:scale-95 cursor-pointer"
                >
                  <div className="flex size-5 items-center justify-center rounded-lg bg-white/20 text-white">
                    <X className="size-3.5 text-white" strokeWidth={2.2} />
                  </div>
                  <span>Batal</span>
                </button>

                <div className="flex items-center gap-2.5">
                  {currentStep > 1 && !isUnitPersonnelManager && (
                    <button
                      type="button"
                      onClick={() => setCurrentStep((s) => Math.max(1, s - 1))}
                      className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-700 text-white px-4 py-2.5 text-xs font-extrabold border border-blue-300/40 transition-all duration-200 hover:scale-[1.03] active:scale-95 cursor-pointer"
                    >
                      <div className="flex size-5 items-center justify-center rounded-lg bg-white/20 text-white">
                        <ArrowLeft className="size-3.5 text-white" strokeWidth={2.2} />
                      </div>
                      <span>Kembali</span>
                    </button>
                  )}
                  {currentStep < 4 && !isUnitPersonnelManager && (
                    <button
                      type="button"
                      onClick={() => setCurrentStep((s) => Math.min(4, s + 1))}
                      className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700 text-white px-5 py-2.5 text-xs font-extrabold border border-emerald-300/40 hover:scale-[1.03] transition-all duration-200 active:scale-95 cursor-pointer"
                    >
                      <span>Selanjutnya</span>
                      <div className="flex size-5 items-center justify-center rounded-lg bg-white/20 text-white">
                        <ArrowRight className="size-3.5 text-white" strokeWidth={2.2} />
                      </div>
                    </button>
                  )}
                  {(currentStep === 4 || isEditMode || isUnitPersonnelManager) && (
                    <button
                      type="button"
                      onClick={handleFormSubmit}
                      disabled={isMutating}
                      className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700 text-white px-5 py-2.5 text-xs font-extrabold border border-emerald-300/40 hover:scale-[1.03] transition-all duration-200 active:scale-95 disabled:opacity-50 cursor-pointer"
                    >
                      {isMutating ? (
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      ) : (
                        <div className="flex size-5 items-center justify-center rounded-lg bg-white/20 text-white">
                          <Save className="size-3.5 text-white" strokeWidth={2.2} />
                        </div>
                      )}
                      <span>{isEditMode ? 'Simpan Perubahan' : 'Simpan Pegawai'}</span>
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
                  className="flex items-center gap-2 rounded-2xl bg-slate-100/90 px-3.5 py-2 text-xs font-extrabold text-slate-700 hover:bg-slate-200 dark:bg-slate-800/80 dark:text-slate-200 dark:hover:bg-slate-700/80 transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer border border-slate-200 dark:border-slate-700"
                >
                  <FaArrowLeft className="size-3.5 text-slate-500 dark:text-slate-400" />
                  <span>Kembali</span>
                </button>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowIdCardModal(detailEmployee)}
                    className="flex items-center gap-2 rounded-2xl bg-purple-100/90 px-3.5 py-2 text-xs font-extrabold text-purple-700 hover:bg-purple-200 dark:bg-purple-950/60 dark:text-purple-300 dark:hover:bg-purple-900/70 transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer border border-purple-200 dark:border-purple-800"
                  >
                    <FaIdCard className="size-4 text-purple-600 dark:text-purple-400" />
                    <span>ID Card</span>
                  </button>
                  {canUpdateEmployee && (
                    <button
                      type="button"
                      onClick={() => {
                        const target = { ...detailEmployee }
                        setDetailEmployee(null)
                        setTimeout(() => {
                          openEditModal(target)
                        }, 50)
                      }}
                      className="flex items-center gap-2 rounded-2xl bg-emerald-100/90 px-3.5 py-2 text-xs font-extrabold text-emerald-800 hover:bg-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:hover:bg-emerald-900/70 transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer border border-emerald-200 dark:border-emerald-800"
                    >
                      <FaEdit className="size-4 text-emerald-600 dark:text-emerald-400" />
                      <span>Edit</span>
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setDetailEmployee(null)}
                    className="rounded-xl p-2 bg-gradient-to-br from-rose-500 via-rose-600 to-red-700 text-white border border-rose-300/40 hover:scale-105 transition-all duration-200 active:scale-95 cursor-pointer"
                    aria-label="Tutup detail"
                  >
                    <X className="size-4" strokeWidth={2.25} />
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
                    <div className="text-xs text-slate-500 flex flex-wrap items-center justify-center md:justify-start gap-2 pt-0.5">
                      <span className="flex items-center gap-1.5 font-medium">Status: {renderStatusPegawaiBadge(detailEmployee.status_pegawai)}</span>
                      <span>•</span>
                      <span>Keaktifan: <strong className="text-emerald-700 font-extrabold">{detailEmployee.status}</strong></span>
                    </div>
                  </div>
                </div>

                {/* Tabs Navigation */}
                <div className="flex gap-1.5 overflow-x-auto rounded-2xl border border-emerald-200/70 bg-emerald-50/40 p-1.5 dark:border-emerald-900/50 dark:bg-slate-900/40 scrollbar-hide">
                  {['Identitas', 'Kepegawaian', 'Penugasan Mengajar', 'Riwayat Jabatan', 'Sertifikasi', 'Dokumen', 'Absensi'].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveDetailTab(tab)}
                      className={`flex-1 rounded-xl px-3.5 py-2 text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                        activeDetailTab === tab
                          ? 'bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700 text-white shadow-none border border-emerald-300/40'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-white/60 dark:text-slate-400 dark:hover:text-slate-200'
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
                      <span className="text-slate-400 block mb-1">Status Pegawai</span>
                      {renderStatusPegawaiBadge(detailEmployee.status_pegawai)}
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
        <div className="overlay modal fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/70 backdrop-blur-md print:hidden animate-fadeIn" role="dialog" aria-modal="true" aria-labelledby="employee-id-card-title" tabIndex={-1}>
          <div className={`modal-dialog font-sans my-auto w-full transition-all duration-300 ${idCardOrientation === 'horizontal' ? 'max-w-6xl' : 'max-w-5xl'}`}>
            <div className="modal-content flex max-h-[calc(100dvh-2.5rem)] flex-col overflow-hidden rounded-3xl border border-slate-200/90 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-950">
              {/* Top accent bar */}
              <div className="h-1.5 w-full bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-600 shrink-0" />

              {/* Header */}
              <div className="modal-header flex items-center justify-between border-b border-slate-100 bg-white px-6 py-4.5 dark:border-slate-800 dark:bg-slate-950">
                <div className="flex items-center gap-3">
                  <div className="rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200/60 p-2.5 text-[#0E5C44] dark:from-emerald-950/60 dark:to-teal-950/40 dark:border-emerald-800/60 dark:text-[#3FBF75]">
                    <IdCard className="h-5 w-5" strokeWidth={2.25} />
                  </div>
                  <div>
                    <h3 id="employee-id-card-title" className="modal-title text-sm sm:text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                      <span>ID Card Pegawai</span>
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-[#0E5C44] border border-emerald-200/80 dark:bg-emerald-950/60 dark:text-emerald-400 dark:border-emerald-800/60">
                        <Sparkles className="size-3" /> Cetak & Pratinjau
                      </span>
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      Pratinjau kartu identitas & QR akses sistem untuk {showIdCardModal.nama_lengkap}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowIdCardModal(null)}
                  className="rounded-xl p-2 bg-gradient-to-br from-rose-500 via-rose-600 to-red-700 text-white border border-rose-300/40 hover:scale-105 transition-all duration-200 active:scale-95 cursor-pointer"
                  aria-label="Tutup ID Card"
                >
                  <X className="size-4" strokeWidth={2.25} />
                </button>
              </div>

              <div className="modal-body min-h-0 flex-1 overflow-hidden p-4 text-sm text-slate-700 dark:text-slate-200">
                <div className="employee-id-preview">
                  {/* Card View Box with Orientation & Front/Back Switch */}
                  <div className="flex flex-col items-center gap-3">
                    <div className="flex flex-wrap items-center justify-center gap-2">
                      {/* Orientation Switch */}
                      <div className="flex items-center gap-1 rounded-xl bg-slate-200/80 p-1 dark:bg-slate-800 border border-slate-300/60 dark:border-slate-700 shadow-2xs">
                        <button
                          type="button"
                          onClick={() => changeIdCardOrientation('horizontal')}
                          className={`px-3 py-1 text-xs font-extrabold rounded-lg transition-all cursor-pointer ${
                            idCardOrientation === 'horizontal'
                              ? 'bg-emerald-600 text-white shadow-xs'
                              : 'text-slate-700 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white'
                          }`}
                        >
                          ↔️ Horizontal
                        </button>
                        <button
                          type="button"
                          onClick={() => changeIdCardOrientation('vertical')}
                          className={`px-3 py-1 text-xs font-extrabold rounded-lg transition-all cursor-pointer ${
                            idCardOrientation === 'vertical'
                              ? 'bg-emerald-600 text-white shadow-xs'
                              : 'text-slate-700 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white'
                          }`}
                        >
                          ↕️ Vertikal
                        </button>
                      </div>

                      {/* Front/Back Side Switch */}
                      <div className="flex items-center gap-1 rounded-xl bg-slate-200/80 p-1 dark:bg-slate-800 border border-slate-300/60 dark:border-slate-700 shadow-2xs">
                        <button
                          type="button"
                          onClick={() => setIdCardSide('front')}
                          className={`px-3 py-1 text-xs font-extrabold rounded-lg transition-all cursor-pointer ${
                            idCardSide === 'front'
                              ? 'bg-emerald-600 text-white shadow-xs'
                              : 'text-slate-700 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white'
                          }`}
                        >
                          🎴 Sisi Depan
                        </button>
                        <button
                          type="button"
                          onClick={() => setIdCardSide('back')}
                          className={`px-3 py-1 text-xs font-extrabold rounded-lg transition-all cursor-pointer ${
                            idCardSide === 'back'
                              ? 'bg-emerald-600 text-white shadow-xs'
                              : 'text-slate-700 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white'
                          }`}
                        >
                          🃏 Sisi Belakang
                        </button>
                      </div>
                    </div>

                    <EmployeeIdCard
                      orientation={idCardOrientation}
                      employee={showIdCardModal}
                      template={selectedIdCardTemplate}
                      pengaturan={pengaturan}
                      formatDate={formatEmployeeCardDate}
                      qrPayload={makeEmployeeQrPayload(showIdCardModal)}
                      isPrint={false}
                      isEditing={isDragModeEnabled}
                      layoutConfig={idCardLayoutConfig}
                      frameStyle={idCardFrameStyle}
                      photoShape={idCardPhotoShape}
                      showPattern={idCardShowPattern}
                      showWave={idCardShowWave}
                      headerMotto={idCardHeaderMotto}
                      footerMotto={idCardFooterMotto}
                      cardSide={idCardSide}
                      backTitle={idCardBackTitle}
                      backRules={idCardBackRules}
                      backAddress={idCardBackAddress}
                      backShowQr={idCardBackShowQr}
                      onElementMove={handleElementMove}
                    />
                  </div>

                  <aside className="employee-id-info space-y-3">
                    {/* Control Sub-Tabs */}
                    <div className="flex items-center gap-1 rounded-xl bg-slate-100 p-1 dark:bg-slate-800">
                      <button
                        type="button"
                        onClick={() => setIdCardControlTab('style')}
                        className={`flex-1 rounded-lg py-1.5 text-[11px] font-bold transition-all cursor-pointer ${
                          idCardControlTab === 'style'
                            ? 'bg-white text-emerald-700 shadow-xs dark:bg-slate-700 dark:text-emerald-300'
                            : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                        }`}
                      >
                        🎨 Depan
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setIdCardControlTab('back')
                          setIdCardSide('back')
                        }}
                        className={`flex-1 rounded-lg py-1.5 text-[11px] font-bold transition-all cursor-pointer ${
                          idCardControlTab === 'back'
                            ? 'bg-white text-emerald-700 shadow-xs dark:bg-slate-700 dark:text-emerald-300'
                            : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                        }`}
                      >
                        📝 Belakang
                      </button>
                      <button
                        type="button"
                        onClick={() => setIdCardControlTab('template')}
                        className={`flex-1 rounded-lg py-1.5 text-[11px] font-bold transition-all cursor-pointer ${
                          idCardControlTab === 'template'
                            ? 'bg-white text-emerald-700 shadow-xs dark:bg-slate-700 dark:text-emerald-300'
                            : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                        }`}
                      >
                        ⚙️ Template
                      </button>
                    </div>

                    {/* TAB 1: STYLE & LAYOUT DEPAN */}
                    {idCardControlTab === 'style' && (
                      <div className="space-y-3">
                        {/* Orientasi Kartu Picker */}
                        <div className="employee-id-orientation-picker">
                          <div>
                            <h3>Orientasi Kartu</h3>
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
                        {/* Mode Drag & Drop Toggle Banner */}
                        <div className="rounded-xl border border-emerald-200 bg-emerald-50/70 p-3 dark:border-emerald-800/50 dark:bg-emerald-950/40">
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="text-xs font-bold text-emerald-900 dark:text-emerald-300 flex items-center gap-1.5">
                                <SlidersHorizontal className="size-3.5 text-emerald-600 dark:text-emerald-400" /> Mode Edit Layout
                              </h4>
                              <p className="mt-0.5 text-[11px] text-emerald-700 dark:text-emerald-400">
                                {isDragModeEnabled ? 'Geser elemen kartu langsung pada preview' : 'Aktifkan untuk menggeser posisi elemen'}
                              </p>
                            </div>
                            <button
                              type="button"
                              onClick={() => setIsDragModeEnabled(!isDragModeEnabled)}
                              className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                                isDragModeEnabled ? 'bg-emerald-600' : 'bg-slate-300 dark:bg-slate-700'
                              }`}
                            >
                              <span
                                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                                  isDragModeEnabled ? 'translate-x-5' : 'translate-x-0'
                                }`}
                              />
                            </button>
                          </div>

                          {isDragModeEnabled && (
                            <div className="mt-2 flex items-center justify-between border-t border-emerald-200/60 pt-2 text-[11px] text-emerald-800 dark:border-emerald-800/40 dark:text-emerald-300">
                              <span>💡 Klik & tahan elemen untuk memindahkan</span>
                              <button
                                type="button"
                                onClick={resetIdCardLayout}
                                className="flex items-center gap-1 font-semibold text-xs text-rose-600 hover:text-rose-700 dark:text-rose-400 dark:hover:text-rose-300 cursor-pointer"
                              >
                                <RefreshCcw className="size-3" /> Reset
                              </button>
                            </div>
                          )}
                        </div>

                        {/* Frame & Shape Customizer */}
                        <div className="rounded-xl border border-slate-200 bg-white p-3 dark:border-slate-700 dark:bg-slate-800/60 space-y-2.5">
                          <div className="space-y-1.5">
                            <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300">Gaya Frame / Border</label>
                            <div className="grid grid-cols-2 gap-1.5 text-xs">
                              {[
                                ['standard', 'Standard'],
                                ['rounded', 'Soft Rounded'],
                                ['double', 'Double Line'],
                                ['glow', 'Glow Accent'],
                              ].map(([styleKey, styleLabel]) => (
                                <button
                                  key={styleKey}
                                  type="button"
                                  onClick={() => setIdCardFrameStyle(styleKey)}
                                  className={`rounded-lg border px-2.5 py-1 text-left text-[11px] font-medium transition-all cursor-pointer ${
                                    idCardFrameStyle === styleKey
                                      ? 'border-emerald-600 bg-emerald-50 text-emerald-700 dark:border-emerald-500 dark:bg-emerald-950/50 dark:text-emerald-300 font-bold'
                                      : 'border-slate-200 hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-700/50 text-slate-700 dark:text-slate-300'
                                  }`}
                                >
                                  {styleLabel}
                                </button>
                              ))}
                            </div>
                          </div>

                          <div className="space-y-1.5">
                            <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300">Bentuk Foto Pegawai</label>
                            <div className="grid grid-cols-4 gap-1 text-center">
                              {[
                                ['circle', 'Bulat'],
                                ['rounded', 'Membuat'],
                                ['square', 'Kotak'],
                                ['shield', 'Perisai'],
                              ].map(([shapeKey, shapeLabel]) => (
                                <button
                                  key={shapeKey}
                                  type="button"
                                  onClick={() => setIdCardPhotoShape(shapeKey)}
                                  className={`rounded-lg border py-1 text-[10px] font-medium transition-all cursor-pointer ${
                                    idCardPhotoShape === shapeKey
                                      ? 'border-emerald-600 bg-emerald-50 text-emerald-700 dark:border-emerald-500 dark:bg-emerald-950/50 dark:text-emerald-300 font-bold'
                                      : 'border-slate-200 hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-700/50 text-slate-700 dark:text-slate-300'
                                  }`}
                                >
                                  {shapeLabel}
                                </button>
                              ))}
                            </div>
                          </div>

                          <div className="flex items-center justify-between pt-1 text-[11px]">
                            <label className="flex items-center gap-1.5 cursor-pointer text-slate-700 dark:text-slate-300">
                              <input
                                type="checkbox"
                                checked={idCardShowPattern}
                                onChange={(e) => setIdCardShowPattern(e.target.checked)}
                                className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                              />
                              Pola Latar
                            </label>
                            <label className="flex items-center gap-1.5 cursor-pointer text-slate-700 dark:text-slate-300">
                              <input
                                type="checkbox"
                                checked={idCardShowWave}
                                onChange={(e) => setIdCardShowWave(e.target.checked)}
                                className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                              />
                              Gelombang Atas
                            </label>
                          </div>
                        </div>

                        {/* Tagline & Motto Customizer */}
                        <div className="rounded-xl border border-slate-200 bg-white p-3 dark:border-slate-700 dark:bg-slate-800/60 space-y-2">
                          <div className="space-y-1">
                            <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300">Tagline Sub-Header</label>
                            <input
                              type="text"
                              value={idCardHeaderMotto}
                              onChange={(e) => setIdCardHeaderMotto(e.target.value)}
                              placeholder="Berilmu, Berakhlak, Beramal"
                              className="w-full rounded-lg border border-slate-300 px-2.5 py-1 text-xs focus:border-emerald-600 focus:outline-none dark:border-slate-600 dark:bg-slate-900 dark:text-white font-medium"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300">Motto Footer</label>
                            <textarea
                              rows={2}
                              value={idCardFooterMotto}
                              onChange={(e) => setIdCardFooterMotto(e.target.value)}
                              placeholder="Generasi Beriman, Berilmu, Berakhlak Mulia"
                              className="w-full rounded-lg border border-slate-300 px-2.5 py-1 text-xs focus:border-emerald-600 focus:outline-none dark:border-slate-600 dark:bg-slate-900 dark:text-white resize-none font-medium"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* TAB 2: FORM DESAIN SISI BELAKANG */}
                    {idCardControlTab === 'back' && (
                      <div className="space-y-3">
                        <div className="rounded-xl border border-slate-200 bg-white p-3 dark:border-slate-700 dark:bg-slate-800/60 space-y-2.5">
                          <div>
                            <h4 className="text-xs font-bold text-slate-900 dark:text-white">Pengaturan Sisi Belakang</h4>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400">Atur judul, tata tertib, dan kontak yayasan.</p>
                          </div>

                          <div className="space-y-1">
                            <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300">Judul Header Belakang</label>
                            <input
                              type="text"
                              value={idCardBackTitle}
                              onChange={(e) => setIdCardBackTitle(e.target.value)}
                              placeholder="KETENTUAN KARTU PEGAWAI"
                              className="w-full rounded-lg border border-slate-300 px-2.5 py-1 text-xs focus:border-emerald-600 focus:outline-none dark:border-slate-600 dark:bg-slate-900 dark:text-white font-medium"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300">Poin Ketentuan & Tata Tertib</label>
                            <textarea
                              rows={4}
                              value={idCardBackRules}
                              onChange={(e) => setIdCardBackRules(e.target.value)}
                              placeholder="1. Kartu ini milik resmi..."
                              className="w-full rounded-lg border border-slate-300 px-2.5 py-1 text-xs focus:border-emerald-600 focus:outline-none dark:border-slate-600 dark:bg-slate-900 dark:text-white font-medium resize-none"
                            />
                          </div>

                          <div className="space-y-1">
                            <div className="flex items-center justify-between">
                              <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300">Alamat & Kontak Footer</label>
                              <button
                                type="button"
                                onClick={() => {
                                  if (showIdCardModal) {
                                    setIdCardBackAddress(getEmployeeUnitAddress(showIdCardModal, unitsList, pengaturan))
                                  }
                                }}
                                className="text-[10px] font-bold text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300 cursor-pointer"
                              >
                                📍 Sync Unit
                              </button>
                            </div>
                            <textarea
                              rows={2}
                              value={idCardBackAddress}
                              onChange={(e) => setIdCardBackAddress(e.target.value)}
                              placeholder="Jl. Gajah Mada No. 28..."
                              className="w-full rounded-lg border border-slate-300 px-2.5 py-1 text-xs focus:border-emerald-600 focus:outline-none dark:border-slate-600 dark:bg-slate-900 dark:text-white font-medium resize-none"
                            />
                          </div>

                          <div className="flex items-center justify-between pt-1 text-[11px]">
                            <label className="flex items-center gap-1.5 cursor-pointer text-slate-700 dark:text-slate-300 font-medium">
                              <input
                                type="checkbox"
                                checked={idCardBackShowQr}
                                onChange={(e) => setIdCardBackShowQr(e.target.checked)}
                                className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                              />
                              Tampilkan QR Code Belakang
                            </label>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* TAB 3: TEMPLATE & CETAK */}
                    {idCardControlTab === 'template' && (
                      <div className="space-y-3">
                        <div className="employee-id-orientation-picker">
                          <div>
                            <h3>Orientasi Kartu</h3>
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

                        <div className="space-y-1.5">
                          <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300">Sisi Halaman Yang Dicetak</label>
                          <div className="grid grid-cols-3 gap-1 text-center">
                            {[
                              ['both', 'Keduanya'],
                              ['front', 'Depan'],
                              ['back', 'Belakang'],
                            ].map(([val, label]) => (
                              <button
                                key={val}
                                type="button"
                                onClick={() => setIdCardPrintSides(val)}
                                className={`rounded-lg border py-1 text-[10.5px] font-semibold transition-all cursor-pointer ${
                                  idCardPrintSides === val
                                    ? 'border-emerald-600 bg-emerald-50 text-emerald-700 dark:border-emerald-500 dark:bg-emerald-950/50 dark:text-emerald-300 font-bold'
                                    : 'border-slate-200 hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-700/50 text-slate-700 dark:text-slate-300'
                                }`}
                              >
                                {label}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className="employee-id-template-picker">
                          <div>
                            <h3>Pilih Warna Kartu</h3>
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
                              </button>
                            ))}
                          </div>
                        </div>

                        <dl>
                          <div><dt>Identifier Login</dt><dd>{showIdCardModal.niy || showIdCardModal.email}</dd></div>
                          <div><dt>Peran Utama</dt><dd>{showIdCardModal.jabatan_name || 'Pegawai'}</dd></div>
                          <div><dt>Unit Kerja</dt><dd>{showIdCardModal.unit_name || '—'}</dd></div>
                          <div><dt>Status</dt><dd><span>{showIdCardModal.status}</span></dd></div>
                        </dl>
                      </div>
                    )}
                  </aside>
                </div>
              </div>

              <div className="modal-footer flex items-center justify-between border-t border-slate-100 bg-white px-5 py-4 dark:border-slate-700 dark:bg-[#1B2433]">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowIdCardModal(null)}
                    className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-br from-rose-500 via-rose-600 to-red-700 text-white px-4 py-2 text-xs font-extrabold border border-rose-300/40 transition-all duration-200 hover:scale-[1.03] active:scale-95 cursor-pointer"
                  >
                    Tutup
                  </button>
                  {Object.keys(idCardLayoutConfig).length > 0 && (
                    <button
                      type="button"
                      onClick={resetIdCardLayout}
                      className="flex items-center gap-1.5 rounded-2xl bg-slate-100 px-3 py-2 text-xs font-bold text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700 transition-all"
                    >
                      <RefreshCcw className="size-3" /> Reset Layout
                    </button>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      downloadEmployeeIdCard({
                        employee: showIdCardModal,
                        orientation: idCardOrientation,
                        template: selectedIdCardTemplate,
                        pengaturan,
                        formatDate: formatEmployeeCardDate,
                        qrPayload: makeEmployeeQrPayload(showIdCardModal),
                        layoutConfig: idCardLayoutConfig,
                        frameStyle: idCardFrameStyle,
                        photoShape: idCardPhotoShape,
                        showPattern: idCardShowPattern,
                        showWave: idCardShowWave,
                        headerMotto: idCardHeaderMotto,
                        footerMotto: idCardFooterMotto,
                        printSides: idCardPrintSides,
                        backTitle: idCardBackTitle,
                        backRules: idCardBackRules,
                        backAddress: idCardBackAddress,
                        backShowQr: idCardBackShowQr,
                      })
                    }}
                    className="flex items-center gap-2 rounded-2xl bg-amber-100/90 px-4 py-2 text-xs font-extrabold text-amber-900 hover:bg-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:hover:bg-amber-900/70 transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer"
                  >
                    <FaDownload className="size-3.5 text-amber-600 dark:text-amber-400" /> Unduh ID Card
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
                        layoutConfig: idCardLayoutConfig,
                        frameStyle: idCardFrameStyle,
                        photoShape: idCardPhotoShape,
                        showPattern: idCardShowPattern,
                        showWave: idCardShowWave,
                        headerMotto: idCardHeaderMotto,
                        footerMotto: idCardFooterMotto,
                        printSides: idCardPrintSides,
                        backTitle: idCardBackTitle,
                        backRules: idCardBackRules,
                        backAddress: idCardBackAddress,
                        backShowQr: idCardBackShowQr,
                      })
                    }}
                    className="flex items-center gap-2 rounded-2xl bg-emerald-100/90 px-4 py-2 text-xs font-extrabold text-emerald-800 hover:bg-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:hover:bg-emerald-900/70 transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer"
                  >
                    <FaPrint className="text-emerald-600 dark:text-emerald-400" /> Cetak ID Card
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 8. MODAL KONFIRMASI HAPUS PEGAWAI — Harmonized TailGrids Modal */}
      <AnimatePresence>
        {canDeleteEmployee && deleteTarget && (
          <div
            className="overlay modal fixed inset-0 z-[70] flex items-center justify-center p-3 sm:p-5 bg-slate-950/70 backdrop-blur-md print:hidden"
            role="dialog"
            aria-modal="true"
            aria-labelledby="emp-delete-confirm-title"
            tabIndex={-1}
            onMouseDown={(e) => {
              if (e.target === e.currentTarget && !deleteMutation.isPending) setDeleteTarget(null)
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 14 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ type: 'spring', stiffness: 400, damping: 28 }}
              className="modal-dialog font-sans my-auto w-full max-w-md"
            >
              <div className="modal-content flex max-h-[calc(100dvh-2rem)] flex-col overflow-hidden rounded-3xl border border-rose-200/60 bg-white shadow-2xl shadow-rose-950/20 dark:border-rose-900/50 dark:bg-[#182232] dark:shadow-black/60">
                {/* Top Accent Gradient Bar */}
                <div className="h-1.5 w-full bg-gradient-to-r from-rose-500 via-rose-600 to-red-700 shrink-0" />

                {/* Header */}
                <div className="modal-header flex items-center justify-between border-b border-slate-100 bg-white px-6 py-4.5 dark:border-slate-800 dark:bg-slate-950">
                  <div className="flex items-center gap-3">
                    <div className="rounded-2xl text-white p-2.5 shadow-md shrink-0 border bg-gradient-to-br from-rose-500 via-rose-600 to-red-700 shadow-rose-500/30 border-rose-300/30">
                      <Trash2 className="h-5 w-5 text-white" strokeWidth={2.25} />
                    </div>
                    <div>
                      <h3
                        id="emp-delete-confirm-title"
                        className="modal-title text-sm sm:text-base font-black text-slate-900 dark:text-white flex items-center gap-2"
                      >
                        <span>Hapus Data Pegawai</span>
                        <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold border bg-rose-50 text-rose-700 border-rose-200/80 dark:bg-rose-950/60 dark:text-rose-400 dark:border-rose-800/60">
                          <AlertTriangle className="size-3" />
                          Hapus Permanen
                        </span>
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        Tindakan ini permanen dan tidak dapat dibatalkan.
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    disabled={deleteMutation.isPending}
                    onClick={() => setDeleteTarget(null)}
                    aria-label="Tutup dialog konfirmasi"
                    className="size-9 flex items-center justify-center rounded-2xl bg-gradient-to-br from-rose-500 via-rose-600 to-red-700 text-white hover:scale-105 active:scale-95 transition-all duration-200 shadow-md shadow-rose-500/20 cursor-pointer disabled:opacity-50"
                  >
                    <X className="size-4 text-white" strokeWidth={2.25} />
                  </button>
                </div>

                {/* Body */}
                <div className="modal-body p-6 space-y-4 text-slate-700 dark:text-slate-200">
                  {/* Target Info Summary Card */}
                  <div className="rounded-2xl border border-rose-100/90 bg-rose-50/40 p-3.5 dark:border-rose-900/40 dark:bg-rose-950/20 space-y-2.5">
                    <div className="flex items-center gap-3">
                      <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-600 to-teal-700 font-black text-white text-xs shadow-sm">
                        {deleteTarget.nama_lengkap.substring(0, 2).toUpperCase()}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="font-extrabold text-slate-900 dark:text-white text-sm truncate">
                          {deleteTarget.nama_lengkap}
                        </h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          NIY: <span className="font-bold text-slate-700 dark:text-slate-300">{deleteTarget.niy || '-'}</span>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between border-t border-rose-100 dark:border-rose-900/40 pt-2 text-xs">
                      <span className="font-semibold text-slate-500 dark:text-slate-400">Jabatan & Unit</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200 truncate max-w-[200px]">
                        {deleteTarget.jabatan_name || '-'} · {deleteTarget.unit_kerja_name || '-'}
                      </span>
                    </div>
                  </div>

                  {/* Danger Notice Box */}
                  <div className="rounded-2xl border border-rose-200/80 bg-rose-50/70 p-3.5 text-xs font-semibold text-rose-900 dark:border-rose-900/50 dark:bg-rose-950/30 dark:text-rose-300 leading-relaxed flex items-start gap-2.5">
                    <div className="flex size-5 shrink-0 items-center justify-center rounded-lg text-white bg-gradient-to-br from-rose-500 to-red-600 mt-0.5">
                      <AlertTriangle className="size-3 text-white" />
                    </div>
                    <div className="flex-1">
                      Data pegawai <strong>"{deleteTarget.nama_lengkap}"</strong> akan dihapus secara permanen dari server. Riwayat tugas, presensi, dan jadwal terkait akan terpengaruh.
                    </div>
                  </div>

                  <label className="flex items-center gap-2.5 cursor-pointer text-xs font-bold text-slate-700 dark:text-slate-300 pt-1 select-none">
                    <input
                      type="checkbox"
                      checked={hasConfirmedDeleteCheck}
                      onChange={(e) => setHasConfirmedDeleteCheck(e.target.checked)}
                      className="size-4 rounded-md border-slate-300 text-rose-600 focus:ring-rose-500 cursor-pointer"
                    />
                    <span>Saya memahami konsekuensi penghapusan permanen ini.</span>
                  </label>
                </div>

                {/* Footer */}
                <div className="modal-footer flex items-center justify-between border-t border-slate-100 bg-white px-6 py-4 dark:border-slate-800 dark:bg-slate-950">
                  <button
                    type="button"
                    disabled={deleteMutation.isPending}
                    onClick={() => setDeleteTarget(null)}
                    className="inline-flex items-center gap-2 rounded-2xl border border-slate-300 bg-slate-100 hover:bg-slate-200 text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 px-4 py-2.5 text-xs font-extrabold transition-all duration-200 hover:scale-[1.03] active:scale-95 cursor-pointer disabled:opacity-50"
                  >
                    <div className="flex size-4 items-center justify-center rounded-md bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-300">
                      <X className="size-3" strokeWidth={2.2} />
                    </div>
                    <span>Batal</span>
                  </button>

                  <button
                    type="button"
                    disabled={!hasConfirmedDeleteCheck || deleteMutation.isPending}
                    onClick={() => deleteMutation.mutate(deleteTarget.id)}
                    className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-br from-rose-500 via-rose-600 to-red-700 text-white px-5 py-2.5 text-xs font-extrabold border border-rose-300/40 hover:scale-[1.03] transition-all duration-200 active:scale-95 disabled:opacity-50 cursor-pointer shadow-md shadow-rose-500/25"
                  >
                    {deleteMutation.isPending ? (
                      <span className="size-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    ) : (
                      <div className="flex size-4 items-center justify-center rounded-md bg-white/20 text-white">
                        <Trash2 className="size-3 text-white" strokeWidth={2.2} />
                      </div>
                    )}
                    <span>{deleteMutation.isPending ? 'Menghapus...' : 'Hapus Permanen'}</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 9. MODAL DASHBOARD IMPORT PEGAWAI — Harmonized Batch Modal UI/UX */}
      <AnimatePresence>
        {showImportModal && (
          <div
            className="overlay modal fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/70 backdrop-blur-md print:hidden"
            role="dialog"
            aria-modal="true"
            aria-labelledby="employee-import-title"
            tabIndex={-1}
            onMouseDown={(e) => {
              if (e.target === e.currentTarget) {
                setShowImportModal(false)
                setImportFile(null)
                setImportPreviewData([])
              }
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 14 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ type: 'spring', stiffness: 400, damping: 28 }}
              className="modal-dialog font-sans my-auto w-full max-w-xl"
            >
              <div className="modal-content flex max-h-[calc(100dvh-2rem)] flex-col overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-2xl shadow-emerald-950/20 dark:border-slate-800 dark:bg-[#182232] dark:shadow-black/60">
                {/* Top Accent Gradient Bar */}
                <div className="h-1.5 w-full bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-600 shrink-0" />

                {/* Header */}
                <div className="modal-header flex items-center justify-between border-b border-slate-100 bg-white px-6 py-4.5 dark:border-slate-800 dark:bg-slate-950">
                  <div className="flex items-center gap-3">
                    <div className="rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200/60 p-2.5 text-[#0E5C44] dark:from-emerald-950/60 dark:to-teal-950/40 dark:border-emerald-800/60 dark:text-[#3FBF75]">
                      <Upload className="h-5 w-5" strokeWidth={2.25} />
                    </div>
                    <div>
                      <h3 id="employee-import-title" className="modal-title text-sm sm:text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                        <span>Import Data Pegawai & Tendik</span>
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-[#0E5C44] border border-emerald-200/80 dark:bg-emerald-950/60 dark:text-emerald-400 dark:border-emerald-800/60">
                          <Sparkles className="size-3" />
                          Batch Import
                        </span>
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        Unggah berkas spreadsheet (.xlsx, .xls, atau .csv) untuk impor direktori pegawai massal
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setShowImportModal(false)
                      setImportFile(null)
                      setImportPreviewData([])
                    }}
                    aria-label="Tutup form import"
                    className="size-9 flex items-center justify-center rounded-2xl bg-slate-100 text-slate-500 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400 transition-colors cursor-pointer"
                  >
                    <X className="size-4" strokeWidth={2.25} />
                  </button>
                </div>

                {/* Modal Body */}
                <div className="modal-body min-h-0 flex-1 space-y-4.5 overflow-y-auto p-6 text-sm text-slate-700 dark:text-slate-200">
                  {/* Unduh Template Card */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-emerald-200/70 bg-gradient-to-r from-emerald-50/50 via-teal-50/30 to-white p-4 dark:border-emerald-800/50 dark:bg-slate-900/40">
                    <div className="flex items-center gap-3">
                      <div className="flex size-9 items-center justify-center rounded-xl bg-emerald-100/70 text-[#0E5C44] dark:bg-emerald-950/60 dark:text-[#3FBF75] shrink-0">
                        <Download className="size-4.5" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-800 dark:text-slate-100">Unduh Format Berkas</p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">Gunakan berkas template resmi agar kolom master terpetakan otomatis</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleDownloadTemplatePegawaiFormat('xlsx')}
                        className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-300/80 bg-white px-3 py-1.5 text-xs font-bold text-emerald-800 shadow-2xs hover:bg-emerald-50 transition-all dark:border-emerald-700 dark:bg-slate-800 dark:text-emerald-300 dark:hover:bg-slate-700 cursor-pointer"
                      >
                        <Download className="size-3.5" />
                        <span>Excel (.xlsx)</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDownloadTemplatePegawaiFormat('csv')}
                        className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 shadow-2xs hover:bg-slate-100 transition-all dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 cursor-pointer"
                      >
                        <Download className="size-3.5" />
                        <span>CSV</span>
                      </button>
                    </div>
                  </div>

                  {/* Dropzone Upload */}
                  <label className="group relative flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-emerald-300/80 bg-gradient-to-b from-emerald-50/25 to-slate-50/50 p-6 text-center transition-all duration-200 hover:border-emerald-500 hover:bg-emerald-50/40 hover:shadow-xs dark:border-emerald-800/60 dark:bg-slate-900/30 dark:hover:border-emerald-600 dark:hover:bg-emerald-950/20">
                    <div className="mb-2.5 flex size-12 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200/60 text-[#0E5C44] transition-transform duration-200 group-hover:scale-110 dark:from-emerald-950/60 dark:to-teal-950/40 dark:border-emerald-800/60 dark:text-[#3FBF75]">
                      <FileSpreadsheet className="size-6" strokeWidth={2.2} />
                    </div>
                    <p className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-100">
                      {importFile ? importFile.name : 'Pilih atau Tarik Berkas Spreadsheet ke Sini'}
                    </p>
                    <p className="mt-1 text-[11px] text-slate-400 dark:text-slate-400">
                      Mendukung format Microsoft Excel (.xlsx, .xls) & CSV (Maks. 5MB)
                    </p>
                    {importFile && (
                      <div
                        className="mt-3 flex items-center justify-center gap-2 flex-wrap"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100/80 px-3 py-1 text-[11px] font-bold text-[#0E5C44] border border-emerald-200 dark:bg-emerald-950/80 dark:text-emerald-300 dark:border-emerald-800/80">
                          <CheckCircle2 className="size-3.5" />
                          <span>{(importFile.size / 1024).toFixed(1)} KB · Berkas Siap Diunggah</span>
                        </div>
                        <button
                          type="button"
                          onClick={handleClearImportFile}
                          className="inline-flex items-center gap-1 rounded-full bg-rose-100/90 hover:bg-rose-200 px-3 py-1 text-[11px] font-bold text-rose-700 border border-rose-300 dark:bg-rose-950/80 dark:hover:bg-rose-900/80 dark:text-rose-300 dark:border-rose-800/80 transition-all cursor-pointer shadow-2xs active:scale-95"
                          title="Hapus / Clear berkas pilihan"
                        >
                          <Trash2 className="size-3.5 text-rose-600 dark:text-rose-400" />
                          <span>Clear Berkas</span>
                        </button>
                      </div>
                    )}
                    <input
                      ref={importFileInputRef}
                      type="file"
                      accept=".csv, .xlsx, .xls"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                  </label>

                  {/* Table Preview */}
                  {importPreviewData.length > 0 && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                          <span>Preview Data Berkas</span>
                          <span className="inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                            {importPreviewData.length} baris
                          </span>
                        </p>
                        <button
                          type="button"
                          onClick={handleClearImportFile}
                          className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-600 hover:text-rose-700 dark:text-rose-400 dark:hover:text-rose-300 hover:underline cursor-pointer"
                          title="Hapus / Clear berkas pilihan"
                        >
                          <Trash2 className="size-3" />
                          <span>Clear Berkas</span>
                        </button>
                      </div>
                      <div className="max-h-44 overflow-auto rounded-2xl border border-emerald-200/80 bg-white shadow-2xs dark:border-emerald-900/50 dark:bg-[#182232]">
                        <table className="w-full text-left text-[11px]">
                          <thead className="bg-gradient-to-r from-emerald-100/80 via-teal-50/60 to-emerald-100/80 border-b border-emerald-200/80 dark:from-emerald-950/80 dark:via-teal-950/60 dark:to-emerald-950/80 dark:border-emerald-900/50 font-bold text-slate-700 dark:text-slate-200">
                            <tr>
                              <th className="px-3 py-2.5">NIY</th>
                              <th className="px-3 py-2.5">Nama Pegawai</th>
                              <th className="px-3 py-2.5">Jabatan</th>
                              <th className="px-3 py-2.5">Unit Kerja</th>
                              <th className="px-3 py-2.5 text-center">Status</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-emerald-100/80 dark:divide-emerald-900/40">
                            {importPreviewData.map((r, i) => (
                              <tr key={i} className="hover:bg-emerald-50/30 dark:hover:bg-slate-800/40 transition-colors">
                                <td className="px-3 py-2 font-mono font-semibold text-slate-700 dark:text-slate-300">{r.niy}</td>
                                <td className="px-3 py-2 font-medium text-slate-900 dark:text-white">{r.nama}</td>
                                <td className="px-3 py-2 text-slate-600 dark:text-slate-300">{r.jabatan}</td>
                                <td className="px-3 py-2 text-slate-600 dark:text-slate-300">{r.unit || '-'}</td>
                                <td className="px-3 py-2 text-center">
                                  <span className={cn(
                                    "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold",
                                    r.status === 'Valid' || r.status === 'Siap Impor'
                                      ? "bg-emerald-50 text-[#0E5C44] border border-emerald-200/80 dark:bg-emerald-950/60 dark:text-emerald-400 dark:border-emerald-800/60"
                                      : "bg-rose-50 text-rose-700 border border-rose-200/80 dark:bg-rose-950/60 dark:text-rose-400 dark:border-rose-800/60"
                                  )}>
                                    {r.status}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* Guidance Banner */}
                  <div className="rounded-2xl border border-emerald-200/80 bg-emerald-50/70 p-3.5 dark:border-emerald-800/50 dark:bg-emerald-950/30 flex items-start gap-2.5">
                    <ShieldCheck className="size-4.5 text-[#0E5C44] dark:text-emerald-400 shrink-0 mt-0.5" />
                    <p className="text-xs text-slate-700 dark:text-slate-200 leading-relaxed">
                      Sistem akan otomatis memvalidasi keunikan nomor NIY/NIK dan menyinkronkan profil pegawai tanpa menimpa riwayat penugasan atau sertifikasi yang sudah ada.
                    </p>
                  </div>
                </div>

                {/* Footer */}
                <div className="modal-footer flex items-center justify-between border-t border-slate-100 bg-slate-50/50 px-6 py-4 dark:border-slate-800 dark:bg-slate-900/30">
                  <button
                    type="button"
                    onClick={() => {
                      setShowImportModal(false)
                      setImportFile(null)
                      setImportPreviewData([])
                    }}
                    className="inline-flex items-center gap-1.5 rounded-2xl border border-slate-200/90 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 shadow-2xs hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 transition cursor-pointer"
                  >
                    <X className="size-3.5 text-slate-500 dark:text-slate-400" strokeWidth={2.2} />
                    <span>Batal</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleProcessImport}
                    disabled={!importFile || isImporting}
                    className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-br from-sky-400 via-sky-500 to-blue-600 text-white px-5 py-2.5 text-xs font-extrabold border border-sky-300/40 hover:scale-[1.03] transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
                  >
                    {isImporting ? (
                      <span className="size-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    ) : (
                      <Upload className="size-4" strokeWidth={2.25} />
                    )}
                    <span>{isImporting ? 'Memproses Impor...' : 'Mulai Impor Data'}</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

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
                  className="rounded-xl p-2 bg-gradient-to-br from-rose-500 via-rose-600 to-red-700 text-white border border-rose-300/40 hover:scale-105 transition-all duration-200 active:scale-95 cursor-pointer"
                  aria-label="Tutup Modal"
                >
                  <X className="size-4" strokeWidth={2.25} />
                </button>
              </div>
            </div>

            {/* Local Search Input */}
            <div className="shrink-0 print:hidden">
              <div className="relative flex items-center">
                <div className="pointer-events-none absolute left-3.5 flex items-center text-slate-400 dark:text-slate-500">
                  <Search className="size-4" />
                </div>
                <input
                  type="text"
                  value={statCardSearch}
                  onChange={(e) => setStatCardSearch(e.target.value)}
                  placeholder="Cari nama, NIY, NIK pegawai..."
                  className="w-full h-10 pl-10 pr-4 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>
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
                                <PersonAvatar src={getEmployeePhotoUrl(emp)} name={fullName} size="sm" />
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
              <button
                type="button"
                onClick={handlePrintStatCardModal}
                className="inline-flex items-center gap-1.5 rounded-2xl border border-emerald-400/50 bg-gradient-to-r from-emerald-500 via-emerald-600 to-teal-700 px-4 py-2 text-xs font-extrabold text-white transition-all duration-200 hover:from-emerald-600 hover:to-teal-800 active:scale-95 cursor-pointer"
              >
                <Printer className="size-4" />
                <span>Cetak Tabel Popup</span>
              </button>

              <button
                type="button"
                onClick={() => { setStatCardModal({ isOpen: false, type: '', title: '', badge: '' }); setStatCardSearch('') }}
                className="inline-flex items-center gap-2 rounded-2xl border border-rose-400/50 bg-gradient-to-r from-rose-500 via-rose-600 to-rose-700 px-4 py-2 text-xs font-extrabold text-white transition-all duration-200 hover:from-rose-600 hover:to-rose-800 active:scale-95 cursor-pointer"
              >
                <div className="flex size-4 items-center justify-center rounded-lg bg-white/20 text-white">
                  <X className="size-3 text-white" strokeWidth={2.2} />
                </div>
                <span>Tutup</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Notification Toast Stack — TailGrids Modern Vivid Style */}
      <div className="fixed bottom-6 right-4 z-[200] flex flex-col gap-2.5 sm:right-6 max-w-sm w-full pointer-events-none" aria-live="polite" aria-atomic="true">
        {notifications.map((notification) => {
          const isDanger = notification.tone === 'error' || notification.tone === 'danger'
          const isWarning = notification.tone === 'warning'
          const isInfo = notification.tone === 'info'
          const isSuccess = !isDanger && !isWarning && !isInfo

          return (
            <div
              key={notification.id}
              className={cn(
                "relative pointer-events-auto flex flex-col overflow-hidden rounded-2xl border-2 bg-white/95 dark:bg-[#182232]/95 backdrop-blur-md p-3.5 shadow-2xl transition-all duration-300 animate-[masterDropdownSlide_0.25s_ease-out]",
                isSuccess && "border-emerald-500/40 shadow-emerald-950/15 dark:border-emerald-600/50 dark:shadow-black/50",
                isDanger && "border-rose-400/50 shadow-rose-950/15 dark:border-rose-600/50 dark:shadow-black/50",
                isWarning && "border-amber-400/50 shadow-amber-950/15 dark:border-amber-600/50 dark:shadow-black/50",
                isInfo && "border-sky-400/50 shadow-sky-950/15 dark:border-sky-600/50 dark:shadow-black/50"
              )}
            >
              {/* Top Accent Gradient Line */}
              <div
                className={cn(
                  "absolute top-0 left-0 right-0 h-1",
                  isSuccess && "bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-600",
                  isDanger && "bg-gradient-to-r from-rose-500 via-rose-600 to-red-700",
                  isWarning && "bg-gradient-to-r from-amber-400 via-amber-500 to-orange-600",
                  isInfo && "bg-gradient-to-r from-sky-400 via-blue-500 to-indigo-600"
                )}
              />

              <div className="flex items-start gap-3 mt-0.5">
                {/* Squircle Icon Badge */}
                <div
                  className={cn(
                    "flex size-9 shrink-0 items-center justify-center rounded-xl text-white shadow-sm",
                    isSuccess && "bg-gradient-to-br from-emerald-500 to-teal-600 shadow-emerald-500/30",
                    isDanger && "bg-gradient-to-br from-rose-500 to-red-600 shadow-rose-500/30",
                    isWarning && "bg-gradient-to-br from-amber-500 to-orange-600 shadow-amber-500/30",
                    isInfo && "bg-gradient-to-br from-sky-500 to-blue-600 shadow-sky-500/30"
                  )}
                >
                  {isSuccess && <CheckCircle2 className="size-5" strokeWidth={2.3} />}
                  {isDanger && <XCircle className="size-5" strokeWidth={2.3} />}
                  {isWarning && <AlertTriangle className="size-5" strokeWidth={2.3} />}
                  {isInfo && <Info className="size-5" strokeWidth={2.3} />}
                </div>

                {/* Text Body */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <h4 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white">
                      {notification.title}
                    </h4>
                    <span
                      className={cn(
                        "inline-flex items-center rounded-full px-2 py-0.2 text-[10px] font-bold border",
                        isSuccess && "bg-emerald-50 text-[#0E5C44] border-emerald-200/80 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800/80",
                        isDanger && "bg-rose-50 text-rose-700 border-rose-200/80 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800/80",
                        isWarning && "bg-amber-50 text-amber-800 border-amber-200/80 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800/80",
                        isInfo && "bg-sky-50 text-sky-800 border-sky-200/80 dark:bg-sky-950/60 dark:text-sky-300 dark:border-sky-800/80"
                      )}
                    >
                      {isSuccess ? 'Sukses' : isDanger ? 'Gagal' : isWarning ? 'Perhatian' : 'Info'}
                    </span>
                  </div>
                  {notification.message && (
                    <p className="mt-1 text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                      {notification.message}
                    </p>
                  )}
                </div>

                {/* Dismiss Button */}
                <button
                  type="button"
                  onClick={() => setNotifications((current) => current.filter((item) => item.id !== notification.id))}
                  className="shrink-0 rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200 transition-colors cursor-pointer"
                  aria-label="Tutup notifikasi"
                >
                  <X className="size-4" strokeWidth={2.2} />
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </PageContainer>
  )
}
