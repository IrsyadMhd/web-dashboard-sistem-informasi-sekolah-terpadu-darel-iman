import { useEffect, useMemo, useState, lazy, Suspense } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useQuery } from '@tanstack/react-query'
import { useSearchParams, useNavigate } from 'react-router-dom'
import {
  FaArrowLeft,
  FaArrowRight,
  FaCheckCircle,
  FaDownload,
  FaEdit,
  FaEye,
  FaFileExcel,
  FaFileImport,
  FaFilter,
  FaPlus,
  FaPrint,
  FaSearch,
  FaMale,
  FaFemale,
  FaBuilding,
  FaTimes,
  FaTrash,
  FaUpload,
  FaUser,
  FaUserGraduate,
} from 'react-icons/fa'
import { cn } from '../lib/utils'
import CetakKartuSiswaModal from '../components/siswa/CetakKartuSiswaModal'

// ── 1. TOP-LEVEL MODULE SCOPE LAZY IMPORT (ATURAN EMAS 1) ──
// Modal formulir siswa 5-langkah dipisah ke chunk terpisah dan hanya dimuat saat tombol Tambah/Edit ditekan
const StudentFormModal = lazy(() => import('../components/siswa/StudentFormModal'))

import StudentLeaderAnalyticsSection from '../components/siswa/StudentLeaderAnalyticsSection'
import ActionDropdown from '../components/app/ActionDropdown'
import { Button } from '../components/tailgrids/core/button'
import AppBreadcrumb from '../components/app/AppBreadcrumb'
import AppBadge from '../components/app/AppBadge'
import AppDataTable from '../components/app/AppDataTable'
import { api } from '../services/api'
import { useDaftarKelas } from '../hooks/useReferenceData'
import { useAksiSiswa, useDaftarSiswa } from '../hooks/useStudents'
import { educationUnitService } from '../services/educationUnitService'
import { studentService } from '../services/studentService'
import PersonAvatar, { resolveAvatarUrl } from '../components/ui/PersonAvatar'
import PersonIdentityCell from '../components/ui/PersonIdentityCell'
import { hasAnyRole } from '../auth/portalResolver'
import { useAuthStore } from '../stores/authStore'
import { usePengaturanStore } from '../stores/pengaturanStore'
import PageContainer from '../components/app/PageContainer'
import {
  Printer,
  ShieldCheck,
  Sparkles,
  MessageSquare,
  Phone,
  Send,
  MessageCircle,
  CheckCircle2,
  XCircle,
  Trash2,
  AlertTriangle,
  X,
  Download,
  Upload,
  FileSpreadsheet,
  Info,
  GraduationCap,
  Plus,
  Pencil,
  School,
  Save,
} from 'lucide-react'
import { OverlayWrapper, Backdrop } from '../components/tailgrids/core/overlay'
import { Dialog, DialogClose, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../components/tailgrids/core/dialog'
import { Download1, Upload1, Plus as PlusIcon } from '@tailgrids/icons'
import { handleApiExport } from '../utils/exportUtils'
import { printCleanTable, downloadPdfTable } from '../utils/printHelper'
import {
  MasterActionButton,
  MasterDataPage,
  MasterDataSection,
  MasterFilterSelect,
  MasterPageHeader,
  MasterStatCard,
  MasterStatsGrid,
  PrintOptionModal,
} from '../components/master-data'

const initialForm = () => ({
  id: null,
  // Step 1: Data Siswa
  nis: '',
  nisn: '',
  full_name: '',
  birth_place: '',
  birth_date: '',
  gender: 'male',
  agama: 'Islam',
  foto_url: '',

  // Step 2: Ortu / Wali
  nama_ayah: '',
  pekerjaan_ayah: '',
  hp_ayah: '',
  nama_ibu: '',
  pekerjaan_ibu: '',
  hp_ibu: '',
  nama_wali: '',
  hp_wali: '',
  alamat_ortu: '',

  // Step 3: Akademik
  unit_id: '',
  kelas_id: '',
  kelas_label: '',
  rombel: '',
  tahun_ajaran: '',
  tanggal_masuk: '',
  no_induk_sebelumnya: '',
  status_siswa: 'aktif',
  kurikulum: 'Kurikulum Merdeka',
  beasiswa: 'Tidak Ada',
  catatan: '',
})

const MODERN_CARD_TONES = {
  emerald: {
    container: 'border-emerald-300/70 bg-gradient-to-br from-emerald-50 via-teal-50/60 to-white hover:border-emerald-400 dark:border-emerald-700/50 dark:from-emerald-950/40 dark:via-teal-950/20 dark:to-slate-900',
    activeCard: 'ring-2 ring-emerald-500 shadow-md shadow-emerald-500/20',
    glow: 'bg-emerald-400/20',
    iconBox: 'bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-emerald-500/30 border-emerald-300/30',
    title: 'text-slate-600 dark:text-slate-300',
    val: 'text-emerald-700 dark:text-emerald-300',
    sub: 'text-emerald-700/80 dark:text-emerald-400/80',
  },
  blue: {
    container: 'border-blue-300/70 bg-gradient-to-br from-blue-50 via-cyan-50/60 to-white hover:border-blue-400 dark:border-blue-700/50 dark:from-blue-950/40 dark:via-cyan-950/20 dark:to-slate-900',
    activeCard: 'ring-2 ring-blue-500 shadow-md shadow-blue-500/20',
    glow: 'bg-blue-400/20',
    iconBox: 'bg-gradient-to-br from-blue-500 to-cyan-600 text-white shadow-blue-500/30 border-blue-300/30',
    title: 'text-slate-600 dark:text-slate-300',
    val: 'text-blue-700 dark:text-blue-300',
    sub: 'text-blue-700/80 dark:text-blue-400/80',
  },
  rose: {
    container: 'border-rose-300/70 bg-gradient-to-br from-rose-50 via-pink-50/60 to-white hover:border-rose-400 dark:border-rose-700/50 dark:from-rose-950/40 dark:via-pink-950/20 dark:to-slate-900',
    activeCard: 'ring-2 ring-rose-500 shadow-md shadow-rose-500/20',
    glow: 'bg-rose-400/20',
    iconBox: 'bg-gradient-to-br from-rose-500 to-pink-600 text-white shadow-rose-500/30 border-rose-300/30',
    title: 'text-slate-600 dark:text-slate-300',
    val: 'text-rose-700 dark:text-rose-300',
    sub: 'text-rose-700/80 dark:text-rose-400/80',
  },
  amber: {
    container: 'border-amber-300/70 bg-gradient-to-br from-amber-50 via-orange-50/60 to-white hover:border-amber-400 dark:border-amber-700/50 dark:from-amber-950/40 dark:via-orange-950/20 dark:to-slate-900',
    activeCard: 'ring-2 ring-amber-500 shadow-md shadow-amber-500/20',
    glow: 'bg-amber-400/20',
    iconBox: 'bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-amber-500/30 border-amber-300/30',
    title: 'text-slate-600 dark:text-slate-300',
    val: 'text-amber-700 dark:text-amber-300',
    sub: 'text-amber-700/80 dark:text-amber-400/80',
  },
}

function KpiTintedCard({ icon: Icon, label, subtext, value, tone = 'emerald', active, onClick, isLoading = false }) {
  const t = MODERN_CARD_TONES[tone] || MODERN_CARD_TONES.emerald

  return (
    <motion.button
      type="button"
      whileHover={{ scale: 1.025, y: -2 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      onClick={onClick}
      className={cn(
        "group relative overflow-hidden rounded-[22px] border-2 p-5 text-left transition-all duration-300 cursor-pointer shadow-sm hover:shadow-md",
        t.container,
        active && t.activeCard
      )}
    >
      {/* Ambient Backlight Glow */}
      <div className={cn("pointer-events-none absolute -right-6 -bottom-6 size-24 rounded-full blur-2xl transition-opacity duration-300 opacity-40 group-hover:opacity-80", t.glow)} />

      <div className="relative z-10 flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className={cn("text-xs font-black uppercase tracking-wider", t.title)}>{label}</p>
          {isLoading ? (
            <div className="mt-2 h-9 w-24 animate-pulse rounded-lg bg-slate-200/80 dark:bg-slate-700/80" />
          ) : (
            <p className={cn("mt-1.5 text-3xl font-black tabular-nums tracking-tight", t.val)}>
              {Number(value ?? 0).toLocaleString('id-ID')}
            </p>
          )}
          {subtext && (
            <p className={cn("mt-1 text-[11px] font-semibold flex items-center gap-1", t.sub)}>
              {subtext}
            </p>
          )}
        </div>

        {/* 3D Squircle Icon Badge */}
        <div className={cn("flex size-11 shrink-0 items-center justify-center rounded-2xl border shadow-md transition-transform duration-300 group-hover:scale-110", t.iconBox)}>
          <Icon className="size-5" />
        </div>
      </div>
    </motion.button>
  )
}

// ── Toast Stack Notification System ──────────────────────────────────────────
function ToastStack({ items, onDismiss }) {
  if (!items || !items.length) return null
  return (
    <div className="fixed bottom-6 right-4 z-[200] flex flex-col gap-2.5 sm:right-6 max-w-sm w-full pointer-events-none" aria-live="polite">
      {items.map((n) => {
        const isDanger = n.tone === 'danger' || n.tone === 'error'
        const isWarning = n.tone === 'warning'
        const isInfo = n.tone === 'info'
        const isSuccess = !isDanger && !isWarning && !isInfo

        return (
          <div
            key={n.id}
            className={cn(
              "relative pointer-events-auto flex flex-col overflow-hidden rounded-2xl border-2 bg-white/95 dark:bg-[#182232]/95 backdrop-blur-md p-3.5 shadow-2xl transition-all duration-300",
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
                    {n.title}
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
                {n.message && (
                  <p className="mt-1 text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                    {n.message}
                  </p>
                )}
              </div>

              {/* Dismiss Button */}
              <button
                type="button"
                onClick={() => onDismiss(n.id)}
                className="size-6 flex items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200 transition-colors pointer-events-auto"
                aria-label="Tutup notifikasi"
              >
                <X className="size-3.5" />
              </button>
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default function StudentsPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const user = useAuthStore((state) => state.user)
  const sitePengaturan = usePengaturanStore((state) => state.pengaturan)
  const permissions = user?.permissions || []
  const userRoles = useMemo(() => user?.roles || [], [user])
  const isSuperAdmin = hasAnyRole(userRoles, ['Super Admin', 'super_admin'])
  const isKepalaSekolah = useMemo(() => hasAnyRole(userRoles, ['Kepala Sekolah', 'kepala_sekolah', 'kepsek']), [userRoles])
  const isDivisiPendidikan = useMemo(() => hasAnyRole(userRoles, ['Divisi Pendidikan', 'divisi_pendidikan']), [userRoles])
  const isLeaderRole = useMemo(() => {
    return (
      isSuperAdmin ||
      isKepalaSekolah ||
      isDivisiPendidikan ||
      hasAnyRole(userRoles, ['Yayasan', 'Pengurus Yayasan', 'Ketua Yayasan', 'sekretaris_yayasan', 'bendahara_yayasan'])
    )
  }, [isSuperAdmin, isKepalaSekolah, isDivisiPendidikan, userRoles])
  const canCreateStudent = isSuperAdmin || isKepalaSekolah || isDivisiPendidikan || permissions.includes('student.create')
  const canUpdateStudent = isSuperAdmin || isKepalaSekolah || isDivisiPendidikan || permissions.includes('student.update')
  const canDeleteStudent = isSuperAdmin || isKepalaSekolah || permissions.includes('student.delete')
  const canExportStudent = isSuperAdmin || isKepalaSekolah || isDivisiPendidikan || permissions.includes('student.export')
  const [step, setStep] = useState(1)

  // Filters
  const [unitFilter, setUnitFilter] = useState('')
  const [kelasFilter, setKelasFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [searchQuery, setSearchQuery] = useState('')

  // Modal Control States
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [showFormModal, setShowFormModal] = useState(false)
  const [showCetakModal, setShowCetakModal] = useState(false)
  const [showImportModal, setShowImportModal] = useState(false)
  const [statCardModal, setStatCardModal] = useState({
    isOpen: false,
    title: '',
    filterType: '',
  })
  const [statModalSearch, setStatModalSearch] = useState('')

  // Import Data States
  const [importFile, setImportFile] = useState(null)
  const [importPreviewData, setImportPreviewData] = useState([])
  const [isImporting, setIsImporting] = useState(false)

  // Selected student data
  const [selectedStudent, setSelectedStudent] = useState(null)
  const [activeDetailTab, setActiveDetailTab] = useState('siswa')
  const [studentToPrint, setStudentToPrint] = useState(null)
  const [showPrintOptionModal, setShowPrintOptionModal] = useState(false)

  // Form State
  const [formData, setFormData] = useState(initialForm())
  const [isEdit, setIsEdit] = useState(false)

  // Toast Notification Stack
  const [toasts, setToasts] = useState([])
  const pushToast = (title, message, tone = 'success') => {
    const id = `${Date.now()}-${Math.random()}`
    setToasts((prev) => [...prev, { id, title, message, tone }])
    window.setTimeout(() => setToasts((prev) => prev.filter((n) => n.id !== id)), 6000)
  }
  const dismissToast = (id) => setToasts((prev) => prev.filter((n) => n.id !== id))

  // Delete Confirmation Dialog state
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [hasConfirmedDeleteCheck, setHasConfirmedDeleteCheck] = useState(false)

  // Save / Update Confirmation Dialog state (Harmonized Modal)
  const [showSaveConfirmDialog, setShowSaveConfirmDialog] = useState(false)
  const [pendingSavePayload, setPendingSavePayload] = useState(null)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    if (searchParams.get('action') !== 'add') return

    if (canCreateStudent) {
      setIsEdit(false)
      setSelectedStudent(null)
      setShowFormModal(true)
    }

    const nextParams = new URLSearchParams(searchParams)
    nextParams.delete('action')
    setSearchParams(nextParams, { replace: true })
  }, [canCreateStudent, searchParams, setSearchParams])

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)

  const extractArray = (input) => {
    if (Array.isArray(input)) return input
    if (input && Array.isArray(input.data)) return input.data
    if (input && input.data && Array.isArray(input.data.data)) return input.data.data
    return []
  }

  // Hooks data API
  const { data: daftarSiswaData, isLoading, isError, refetch } = useDaftarSiswa({
    page: currentPage,
    per_page: itemsPerPage,
    search: searchQuery || undefined,
    unit_id: unitFilter || undefined,
    kelas_id: kelasFilter || undefined,
    status: statusFilter || undefined,
  })
  const { data: daftarKelasData } = useDaftarKelas(
    { per_page: 300 },
    { staleTime: 5 * 60 * 1000 },
  )
  const { data: daftarUnitData } = useQuery({
    queryKey: ['education-units', 'student-filters-all'],
    queryFn: async () => {
      try {
        const res1 = await educationUnitService.getDaftar({ per_page: 100 })
        const list1 = extractArray(res1)
        if (list1.length > 0) return list1
      } catch (e) { /* quiet */ }

      try {
        const res2 = await api.get('/foundation/units')
        const list2 = extractArray(res2.data || res2)
        if (list2.length > 0) return list2
      } catch (e) { /* quiet */ }

      return []
    },
    staleTime: 5 * 60 * 1000,
  })
  const { data: studentDashboardData, isLoading: isSummaryLoading } = useQuery({
    queryKey: ['students-dashboard-summary', unitFilter],
    queryFn: () => studentService.getDashboard({ unit_id: unitFilter || undefined }),
  })
  const { tambah, ubah, hapus } = useAksiSiswa()

  const rawStudents = daftarSiswaData?.data || []
  const rawClasses = extractArray(daftarKelasData)
  const rawUnitsFromApi = extractArray(daftarUnitData)

  const rawUnits = useMemo(() => {
    const combined = [...rawUnitsFromApi]

    // Fallback: extract unique units from loaded student data if any
    if (rawStudents.length > 0) {
      rawStudents.forEach((s) => {
        const uName = s.unit_name || s.unit_nama || s.unit_pendidikan || s.unit?.name || s.unit?.nama || (typeof s.unit === 'string' ? s.unit : '') || ''
        const uId = s.unit_id || s.education_unit_id || s.unit?.id || uName
        if (uName && !combined.some((u) => String(u.id || u.nama_unit || u.name) === String(uId) || (u.name || u.nama_unit || u.nama) === uName)) {
          combined.push({ id: uId, name: uName, nama_unit: uName, nama: uName })
        }
      })
    }

    return combined
  }, [rawUnitsFromApi, rawStudents])

  // ── Dynamic Available Classes per Selected Unit ─────────────────────────
  const availableClasses = useMemo(() => {
    if (!unitFilter) return rawClasses
    const filterVal = String(unitFilter).toLowerCase().trim()
    const selectedUnitObj = rawUnits.find((u) => {
      const uName = (u.nama_unit || u.name || u.nama || u.unit_name || '').toLowerCase()
      const uCode = (u.code || u.kode || '').toLowerCase()
      const uId = String(u.id || '').toLowerCase()
      return uId === filterVal || (uName && (uName.includes(filterVal) || filterVal.includes(uName))) || (uCode && uCode === filterVal)
    })

    const targetUnitId = selectedUnitObj ? String(selectedUnitObj.id).toLowerCase() : filterVal
    const targetUnitName = selectedUnitObj
      ? (selectedUnitObj.nama_unit || selectedUnitObj.name || selectedUnitObj.nama || '').toLowerCase()
      : filterVal

    const filtered = rawClasses.filter((c) => {
      const cUnitId = String(c.unit_pendidikan_id || c.unit_id || c.unit?.id || c.education_unit_id || '').toLowerCase()
      const cUnitName = String(c.unit_name || c.unit_nama || c.unit?.name || c.unit_pendidikan || c.nama_unit || c.unit || '').toLowerCase()

      if (cUnitId && (cUnitId === targetUnitId || cUnitId === filterVal)) return true
      if (cUnitName && targetUnitName && (cUnitName.includes(targetUnitName) || targetUnitName.includes(cUnitName))) return true

      return false
    })

    // Fallback if API classes direct match is empty
    if (filtered.length === 0) {
      const studentClasses = Array.from(
        new Set(
          (daftarSiswaData?.data || [])
            .map((s) => s.class_name || s.kelas || s.nama_kelas)
            .filter(Boolean)
        )
      ).map((kName) => ({ id: kName, nama_kelas: kName, name: kName }))

      if (studentClasses.length > 0) return studentClasses
    }

    return filtered
  }, [rawClasses, rawUnits, unitFilter, daftarSiswaData])
  const studentPagination = {
    total: daftarSiswaData?.total || 0,
    from: daftarSiswaData?.from || 0,
    to: daftarSiswaData?.to || 0,
    lastPage: daftarSiswaData?.last_page || 1,
  }
  const studentStats = studentDashboardData?.statistik || {}
  const genderStats = studentDashboardData?.komposisi_gender || {}

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setCurrentPage(1)
      setSearchQuery(searchInput.trim())
    }, 400)

    return () => window.clearTimeout(timer)
  }, [searchInput])

  // --- Handlers Import ---
  const handleDownloadTemplateSiswa = () => {
    const headers = [
      'No Pendaftaran', 'NIK', 'No Registrasi Akta Lahir', 'No KK', 'Nama Lengkap',
      'Tanggal Lahir', 'Tempat Lahir', 'Jenis Kelamin', 'Agama', 'Email',
      'Anak Ke', 'Jumlah Saudara', 'Jumlah Saudara tiri', 'Berat Badan', 'Tinggi Badan',
      'Riwayat Penyakit', 'Kewarganegaraan', 'Alamat Siswa', 'RT', 'RW', 'Dusun', 'Kelurahan',
      'Kecamatan', 'Kode Pos', 'Kota/Kabupaten', 'Provinsi', 'Jenis Tempat Tinggal',
      'Jarak tempuh ke sekolah', 'Modal Transportasi', 'Sekolah Asal',
      'Status sekolah Asal (Formal/Tidak)', 'Kecamatan Sekolah Asal', 'Kota/Kab Sekolah Asal',
      'Nomor Hp/Wa Sekolah Asal', 'Hobi', 'Cita-cita', 'Nominal Spp', 'Nominal Ortu Asuh',
      'Penerima KPS/PKH (ya/tidak)', 'Apakah Punya KIP (ya/tidak)',
      'Apakah layak Menerima PIP (ya/tidak)', 'Alasan Menolak PIP (Sudah mampu/dilarang pemda/menerima bantuan serupa)',
      'NIK Ayah', 'Nama Ayah', 'Tempat Lahir Ayah', 'Tgl Lahir Ayah', 'Telfon Ayah', 'HP Ayah',
      'Pendidikan Terakhir Ayah', 'Pekerjaan Ayah', 'Instansi Pekerjaan Ayah', 'Jabatan Pekerjaan Ayah',
      'Alamat Instansi Ayah', 'Keahlian Ayah', 'Penghasilan Ayah', 'Alamat Ayah', 'Nomor WA Ayah',
      'Medsos Ayah', 'Nama Ibu', 'NIK Ibu', 'Tempat Lahir Ibu', 'Tgl Lahir Ibu', 'Telfon Ibu',
      'HP Ibu', 'Pendidikan Terakhir Ibu', 'Pekerjaan Ibu', 'Instansi Pekerjaan Ibu',
      'Jabatan Pekerjaan Ibu', 'Alamat Instansi Ibu', 'Keahlian Ibu', 'Penghasilan Ibu',
      'Alamat Ibu', 'Nomor WA Ibu', 'Medsos Ibu', 'Status Pernikahan', 'Tanggungan Anak',
      'NIK Wali', 'Nama Wali', 'Tempat Lahir Wali', 'Tgl Lahir Wali', 'Telfon Wali', 'HP Wali',
      'Pendidikan Terakhir Wali', 'Pekerjaan Wali', 'Instansi Pekerjaan Wali', 'Jabatan Pekerjaan Wali',
      'Alamat Instansi Wali', 'Keahlian Wali', 'Penghasilan Wali', 'Alamat Wali', 'Nomor WA Wali',
      'Medsos Wali', 'Unit Pendidikan', 'NIS (Sekolah)', 'NISN (Nasional)', 'NIP (Pembayaran)',
      'Tahun Ajaran Masuk', 'Kelas', 'Keterangan Kelas', 'Tahun Ajaran Berjalan',
      'Status Siswa (aktif atau tidak)', 'Status Orang Tua (Umum atau pegawai)',
      'NIY Ortu Jika Pegawai', 'Wali Kelas', 'NIY Wali Kelas', 'email',
    ]
    const sampleRow = [
      'PDK-2024-001', '1371012345678901', 'AK.2014.001', '1371012345678000', 'Fathir Ahmad',
      '2014-05-12', 'Padang', 'Laki-Laki', 'Islam', 'fathir@example.com',
      '1', '2', '0', '35', '130',
      '-', 'WNI', 'Jl. Khatib Sulaiman No. 10', '004', '002', 'Lolong', 'Lolong Belanti',
      'Padang Utara', '25114', 'Kota Padang', 'Sumatera Barat', 'Bersama Orang Tua',
      '2 km', 'Jalan Kaki', 'SD Negeri 01 Padang',
      'Formal', 'Padang Utara', 'Kota Padang',
      '0812-0000-0001', 'Membaca', 'Dokter', '500.000', '0',
      'tidak', 'tidak', 'tidak', '-',
      '1371010101850001', 'Rahmat Hidayat', 'Padang', '1985-03-10', '0751-000001', '081299887766',
      'S1/D4', 'Pegawai Negeri', 'Dinas Pendidikan', 'Kepala Seksi',
      'Jl. Sudirman No. 5', 'Manajemen', '7.500.000', 'Jl. Khatib Sulaiman No. 10', '081299887766',
      '@rahmat', 'Siti Aminah', '1371010101880002', 'Bukittinggi', '1988-07-22', '0751-000002',
      '081299887777', 'S1/D4', 'Ibu Rumah Tangga', '-',
      '-', '-', 'Tata Boga', '0',
      'Jl. Khatib Sulaiman No. 10', '081299887777', '@siti', 'Menikah', '2',
      '-', '-', '-', '-', '-', '-',
      '-', '-', '-', '-',
      '-', '-', '-', '-', '-',
      '-', 'SDIT 2 Dar el-Iman', '23010', '0098123456', 'PBY-23010',
      '2024/2025', '1A', 'Kelas reguler', '2026/2027',
      'aktif', 'Umum',
      '-', 'Ustadz Ahmad S.Pd', 'NIY-2024-001', 'fathir@example.com',
    ]
    const csvContent = [headers.join(','), sampleRow.join(',')].join('\n')
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'Template_Import_Data_Lengkap_Siswa.csv'
    link.click()
    URL.revokeObjectURL(url)
  }

  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setImportFile(file)
    try {
      const text = await file.text()
      const lines = text.split('\n').filter(l => l.trim())
      if (lines.length > 1) {
        const previewRows = lines.slice(1, 6).map(line => {
          const cols = line.split(',').map(c => c.replace(/^"|"$/g, '').trim())
          return {
            nis: cols[4] || cols[0] || '23010',
            nisn: cols[5] || cols[1] || '0098123456',
            nama: cols[6] || cols[2] || 'Siswa Import',
            gender: cols[9] || cols[3] || 'L',
            unit: cols[40] || cols[10] || 'SDIT 2 Dar el-Iman',
            kelas: cols[41] || cols[11] || '1A',
            namaAyah: cols[42] || cols[12] || 'Bapak Siswa',
            hpAyah: cols[46] || cols[13] || '08123456789',
            status: 'Siap Impor',
          }
        })
        setImportPreviewData(previewRows)
      }
    } catch (err) {
      console.error('Failed to preview CSV file:', err)
    }
  }

  const handleProcessImport = async () => {
    if (!importFile) return
    setIsImporting(true)
    try {
      const formData = new FormData()
      formData.append('file', importFile)

      const response = await api.post('/students/import', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })

      const resData = response.data
      const { total, berhasil, duplikat, gagal, errors = [] } = resData.data || {}

      if (gagal > 0 && berhasil === 0) {
        pushToast('Impor Gagal', `Seluruh baris (${gagal}) gagal diimpor.${errors.length ? ' Catatan: ' + errors[0] : ''}`, 'error')
      } else if (duplikat > 0 || gagal > 0) {
        pushToast('Impor Selesai dengan Catatan', `Berhasil: ${berhasil || 0}, Duplikat: ${duplikat || 0}, Gagal: ${gagal || 0}`, 'warning')
      } else {
        pushToast('Impor Berhasil', `Sebanyak ${berhasil || 0} data siswa berhasil diimpor ke sistem.`, 'success')
      }

      if (typeof refetch === 'function') {
        refetch()
      }
      setShowImportModal(false)
      setImportFile(null)
      setImportPreviewData([])
    } catch (err) {
      console.error('Import error:', err)
      const msg = err.response?.data?.message || err.message || 'Gagal memproses import data.'
      pushToast('Gagal Import', msg, 'error')
    } finally {
      setIsImporting(false)
    }
  }

  // Map API students to display list
  // Map API students to display list
  const formattedStudents = useMemo(() => {
    if (rawStudents.length > 0) {
      return rawStudents.map((item) => {
        const meta = item.metadata || {}
        const parentRel = item.parent || {}
        const parentsPivot = item.parents_pivot || item.parents || []

        // Extract Parent Name with fallback options
        let parentName = ''
        let relationshipLabel = ''

        if (meta.nama_ayah || meta.ayah?.nama || meta.orang_tua?.nama_ayah || item.nama_ayah) {
          parentName = meta.nama_ayah || meta.ayah?.nama || meta.orang_tua?.nama_ayah || item.nama_ayah
          relationshipLabel = 'Ayah'
        } else if (meta.nama_ibu || meta.ibu?.nama || meta.orang_tua?.nama_ibu || item.nama_ibu) {
          parentName = meta.nama_ibu || meta.ibu?.nama || meta.orang_tua?.nama_ibu || item.nama_ibu
          relationshipLabel = 'Ibu'
        } else if (meta.nama_wali || meta.wali?.nama || meta.orang_tua?.nama_wali || item.nama_wali) {
          parentName = meta.nama_wali || meta.wali?.nama || meta.orang_tua?.nama_wali || item.nama_wali
          relationshipLabel = 'Wali'
        } else if (typeof meta.orang_tua === 'string' && meta.orang_tua.trim()) {
          parentName = meta.orang_tua.trim()
        } else if (typeof item.orang_tua === 'string' && item.orang_tua.trim()) {
          parentName = item.orang_tua.trim()
        } else if (typeof meta.orang_tua === 'object' && (meta.orang_tua?.nama || meta.orang_tua?.full_name || meta.orang_tua?.name)) {
          parentName = meta.orang_tua?.nama || meta.orang_tua?.full_name || meta.orang_tua?.name
        } else if (meta.nama_ortu || meta.nama_orang_tua || meta.parent_name || meta.orang_tua_nama) {
          parentName = meta.nama_ortu || meta.nama_orang_tua || meta.parent_name || meta.orang_tua_nama
        } else if (item.nama_ortu || item.nama_orang_tua || item.parent_name) {
          parentName = item.nama_ortu || item.nama_orang_tua || item.parent_name
        } else if (parentRel.full_name || parentRel.name) {
          parentName = parentRel.full_name || parentRel.name
          relationshipLabel = 'Orang Tua'
        } else if (parentsPivot[0]?.full_name || parentsPivot[0]?.name) {
          parentName = parentsPivot[0].full_name || parentsPivot[0].name
          if (parentsPivot[0]?.pivot?.relationship_type) {
            relationshipLabel = parentsPivot[0].pivot.relationship_type
          }
        }

        const ortuObj = parentName
          ? (relationshipLabel ? `${parentName} (${relationshipLabel})` : parentName)
          : '-'

        // Extract Phone Number with fallback options
        const hpObj =
          meta.hp_ayah || meta.telfon_ayah || meta.nomor_wa_ayah || meta.nomor_hp_wa_ayah || meta.ayah?.hp ||
          meta.hp_ibu || meta.telfon_ibu || meta.nomor_wa_ibu || meta.nomor_hp_wa_ibu || meta.ibu?.hp ||
          meta.hp_wali || meta.telfon_wali || meta.nomor_wa_wali || meta.nomor_hp_wa_wali || meta.wali?.hp ||
          (typeof meta.orang_tua === 'object' ? (meta.orang_tua?.no_hp || meta.orang_tua?.hp || meta.orang_tua?.phone) : null) ||
          meta.no_hp || meta.phone ||
          parentRel.phone || parentRel.no_hp || parentRel.telepon ||
          parentsPivot[0]?.phone || parentsPivot[0]?.no_hp ||
          item.phone || item.no_hp || item.hp_ortu || '-'

        const fotoObj =
          resolveAvatarUrl(item) ||
          resolveAvatarUrl(meta) ||
          item.photo_url ||
          item.photo ||
          item.foto_url ||
          item.foto ||
          item.avatar_url ||
          item.avatar ||
          meta.photo_url ||
          meta.photo ||
          meta.foto_url ||
          meta.foto ||
          ''

        const stRaw = String(meta.akademik?.status_siswa || (item.is_active ? 'aktif' : 'nonaktif')).toLowerCase()
        const statusText =
          stRaw === 'mutasi'
            ? 'Mutasi'
            : stRaw === 'lulus'
              ? 'Lulus'
              : stRaw === 'aktif' || item.is_active
                ? 'Aktif'
                : 'Nonaktif'

        return {
          id: item.id,
          nis: item.nis || '-',
          nisn: item.nisn || meta.nisn || '-',
          nama: item.full_name || item.nama || '-',
          unit: meta.akademik?.unit_pendidikan || meta.unit_pendidikan || item.education_unit?.name || '-',
          unitId: item.unit_id || item.education_unit_id || item.education_unit?.id || '',
          kelas: item.kelas?.nama_kelas || '-',
          kelasId: item.kelas_id || item.class_id || item.kelas?.id || '',
          orangTua: ortuObj,
          noHp: hpObj,
          status: statusText,
          gender: item.gender === 'female' ? 'Perempuan' : 'Laki-laki',
          tempatLahir: item.birth_place || meta.birth_place || '-',
          tanggalLahir: item.birth_date ? String(item.birth_date).slice(0, 10) : (meta.birth_date ? String(meta.birth_date).slice(0, 10) : '-'),
          agama: meta.agama || '-',
          alamat: item.address || meta.alamat_siswa || '-',
          foto: fotoObj,
          raw: item,
        }
      })
    }
    return []
  }, [rawStudents])

  // Filtered Students
  const filteredStudents = useMemo(() => {
    return formattedStudents.filter((item) => {
      const matchUnit =
        !unitFilter ||
        String(item.unitId) === String(unitFilter) ||
        item.unit.toLowerCase().includes(unitFilter.toLowerCase())
      const matchKelas =
        !kelasFilter ||
        String(item.kelasId) === String(kelasFilter) ||
        item.kelas.toLowerCase().includes(kelasFilter.toLowerCase())
      const matchStatus =
        !statusFilter ||
        item.status.toLowerCase() === statusFilter.toLowerCase()
      const matchSearch =
        !searchInput ||
        item.nama.toLowerCase().includes(searchInput.toLowerCase()) ||
        item.nis.toLowerCase().includes(searchInput.toLowerCase()) ||
        item.nisn.toLowerCase().includes(searchInput.toLowerCase())
      return matchUnit && matchKelas && matchStatus && matchSearch
    })
  }, [formattedStudents, unitFilter, kelasFilter, statusFilter, searchInput])

  // Filtered Items for Stat Card Modal Popup
  const statModalItems = useMemo(() => {
    if (!statCardModal.isOpen) return []

    const sourceList = (studentDashboardData?.daftar_siswa && studentDashboardData.daftar_siswa.length > 0)
      ? studentDashboardData.daftar_siswa.map((item) => ({
          id: item.id,
          nis: item.nis || '-',
          nisn: item.nisn || '-',
          nama: item.nama || item.full_name || '-',
          unit: item.unit || '-',
          kelas: item.kelas || '-',
          gender: item.jenis_kelamin === 'female' || item.gender === 'female' ? 'Perempuan' : 'Laki-laki',
          status: item.aktif || item.is_active ? 'Aktif' : 'Nonaktif',
          foto: resolveAvatarUrl(item) || '',
        }))
      : formattedStudents

    let result = sourceList

    if (statCardModal.filterType === 'male') {
      result = result.filter((s) => s.gender === 'Laki-laki')
    } else if (statCardModal.filterType === 'female') {
      result = result.filter((s) => s.gender === 'Perempuan')
    } else if (statCardModal.filterType === 'aktif') {
      result = result.filter((s) => s.status === 'Aktif')
    }

    if (statModalSearch.trim()) {
      const q = statModalSearch.toLowerCase().trim()
      result = result.filter(
        (s) =>
          s.nama.toLowerCase().includes(q) ||
          s.nis.toLowerCase().includes(q) ||
          s.nisn.toLowerCase().includes(q) ||
          s.kelas.toLowerCase().includes(q) ||
          s.unit.toLowerCase().includes(q)
      )
    }

    return result
  }, [formattedStudents, statCardModal, statModalSearch, studentDashboardData])

  const handlePrintMainTable = () => {
    setShowPrintOptionModal(true)
  }

  const handlePrintDocument = (orientation = 'landscape') => {
    const selectedUnitObj = rawUnits?.find((u) => String(u.id) === String(unitFilter)) || (unitFilter && unitFilter !== 'Semua' ? unitFilter : 'YAYASAN')
    const headers = ['No', 'NIS / NISN', 'Nama Lengkap', 'Jenis Kelamin', 'Unit Pendidikan', 'Kelas', 'Status']
    const rows = filteredStudents.map((std, idx) => [
      idx + 1,
      `${std.nis || '-'}\n${std.nisn || '-'}`,
      std.nama,
      std.gender,
      std.unit,
      std.kelas,
      std.status,
    ])

    printCleanTable({
      title: 'LAPORAN DIREKTORI DATA SISWA',
      unit: selectedUnitObj,
      unitParam: selectedUnitObj,
      headers,
      rows,
      orientation,
    })
    setShowPrintOptionModal(false)
  }

  const handleDownloadPdf = (orientation = 'landscape') => {
    const selectedUnitObj = rawUnits?.find((u) => String(u.id) === String(unitFilter)) || (unitFilter && unitFilter !== 'Semua' ? unitFilter : 'YAYASAN')
    const headers = ['No', 'NIS / NISN', 'Nama Lengkap', 'Jenis Kelamin', 'Unit Pendidikan', 'Kelas', 'Status']
    const rows = filteredStudents.map((std, idx) => [
      idx + 1,
      `${std.nis || '-'}\n${std.nisn || '-'}`,
      std.nama,
      std.gender,
      std.unit,
      std.kelas,
      std.status,
    ])

    downloadPdfTable({
      filename: `Laporan_Data_Siswa_${new Date().toISOString().slice(0, 10)}.pdf`,
      title: 'LAPORAN DIREKTORI DATA SISWA',
      unit: selectedUnitObj,
      unitParam: selectedUnitObj,
      headers,
      rows,
      orientation,
    })
    setShowPrintOptionModal(false)
  }

  const handlePrintStatCardModal = () => {
    const selectedUnitObj = rawUnits?.find((u) => String(u.id) === String(unitFilter)) || (unitFilter && unitFilter !== 'Semua' ? unitFilter : 'YAYASAN')
    const headers = ['No', 'NIS / NISN', 'Nama Lengkap', 'Unit Kerja', 'Kelas / Rombel', 'Jenis Kelamin', 'Status']
    const rows = statModalItems.map((std, idx) => [
      idx + 1,
      `${std.nis || '-'}\n${std.nisn || '-'}`,
      std.nama,
      std.unit,
      std.kelas,
      std.gender,
      std.status,
    ])

    const orgName = (sitePengaturan?.school_name || sitePengaturan?.application_name || '').trim()
    printCleanTable({
      title: (statCardModal.title || 'LAPORAN DETAIL STATISTIK SISWA').toUpperCase(),
      subtitle: orgName || 'Laporan Statistik Siswa',
      unit: selectedUnitObj,
      headers,
      rows,
      orientation: 'landscape',
      foundationName: orgName,
      systemLogo: sitePengaturan?.logo_url,
    })
  }

  // Pagination
  const totalPages = Math.max(1, studentPagination.lastPage)
  const paginatedStudents = filteredStudents

  // Form Handlers
  const handleOpenTambah = () => {
    if (!canCreateStudent) return
    setIsEdit(false)
    setSelectedStudent(null)
    setShowFormModal(true)
  }

  const handleOpenEdit = (student) => {
    if (!canUpdateStudent) return
    setIsEdit(true)
    setSelectedStudent(student)
    setShowDetailModal(false)
    setShowFormModal(true)
  }

  const handleOpenDetail = (student) => {
    if (!student) return
    const match = formattedStudents.find(
      (s) => String(s.id) === String(student.id) || (s.nama && student.nama && s.nama.toLowerCase() === student.nama.toLowerCase())
    )
    setSelectedStudent(match || student)
    setActiveDetailTab('siswa')
    setShowDetailModal(true)
  }

  const navigate = useNavigate()
  const [chatTargetModal, setChatTargetModal] = useState(null)
  const [chatQuickMessage, setChatQuickMessage] = useState('')

  const handleOpenChatModal = (student) => {
    setChatTargetModal(student)
    setChatQuickMessage('')
  }

  const handleDirectChatPortal = (student) => {
    if (!student) return
    const sId = student.id || ''
    const pId = student.parentId || student.parent_id || ''
    const pName = encodeURIComponent(student.orangTua || student.metadata?.nama_ayah || student.metadata?.nama_ibu || 'Orang Tua')
    const sName = encodeURIComponent(student.nama || student.full_name || '')
    const msg = encodeURIComponent(chatQuickMessage.trim())
    navigate(`/dashboard/chat-pegawai?mode=teacher&student_id=${sId}&parent_id=${pId}&parent_name=${pName}&student_name=${sName}${msg ? `&initial_message=${msg}` : ''}`)
    setChatTargetModal(null)
    setChatQuickMessage('')
    setShowDetailModal(false)
  }

  const handleDirectWhatsApp = (phone, student) => {
    if (!phone) {
      pushToast('Nomor Tidak Tersedia', 'Nomor telepon/WA orang tua belum terdaftar.', 'info')
      return
    }
    let cleanPhone = String(phone).replace(/[^0-9]/g, '')
    if (cleanPhone.startsWith('0')) cleanPhone = '62' + cleanPhone.slice(1)
    if (!cleanPhone.startsWith('62')) cleanPhone = '62' + cleanPhone
    const msgBody = chatQuickMessage.trim()
      ? chatQuickMessage.trim()
      : 'Saya ingin berkonsultasi mengenai perkembangan ananda di sekolah.'
    const text = encodeURIComponent(
      `Assalamu'alaikum Warahmatullahi Wabarakatuh Bapak/Ibu Wali dari Ananda ${student.nama || student.full_name || ''} (${student.unit || ''} - Kelas ${student.kelas || ''}).\n\n${msgBody}`
    )
    window.open(`https://wa.me/${cleanPhone}?text=${text}`, '_blank')
    setChatTargetModal(null)
    setChatQuickMessage('')
    setShowDetailModal(false)
  }

  const handleDelete = (student) => {
    if (!canDeleteStudent) return
    setDeleteTarget(student)
    setHasConfirmedDeleteCheck(false)
  }

  const handleConfirmDelete = async () => {
    if (!deleteTarget || !canDeleteStudent) return
    try {
      setIsDeleting(true)
      await hapus.mutateAsync(deleteTarget.id)
      pushToast('Berhasil Dihapus', `Data siswa "${deleteTarget.nama || deleteTarget.full_name}" berhasil dihapus permanen.`, 'success')
      setDeleteTarget(null)
      setHasConfirmedDeleteCheck(false)
      setShowDetailModal(false)
    } catch (err) {
      pushToast('Gagal Menghapus', err.response?.data?.message || err.message || 'Terjadi kesalahan saat menghapus data siswa.', 'error')
    } finally {
      setIsDeleting(false)
    }
  }

  const handleFormSubmitCallback = (payload) => {
    if ((isEdit && !canUpdateStudent) || (!isEdit && !canCreateStudent)) return
    setPendingSavePayload(payload)
    setShowSaveConfirmDialog(true)
  }

  const handleConfirmSave = async () => {
    if (!pendingSavePayload) return
    setIsSaving(true)
    try {
      if (isEdit && pendingSavePayload.id) {
        await ubah.mutateAsync({ id: pendingSavePayload.id, payload: pendingSavePayload })
        pushToast('Berhasil Diperbarui', `Data siswa "${pendingSavePayload.full_name}" berhasil diperbarui.`, 'success')
      } else {
        await tambah.mutateAsync(pendingSavePayload)
        pushToast('Berhasil Ditambahkan', `Data siswa baru "${pendingSavePayload.full_name}" berhasil ditambahkan ke sistem.`, 'success')
      }
      setShowSaveConfirmDialog(false)
      setShowFormModal(false)
      setPendingSavePayload(null)
    } catch (err) {
      pushToast('Gagal Menyimpan', err.response?.data?.message || err.message || 'Terjadi kesalahan saat menyimpan data.', 'error')
    } finally {
      setIsSaving(false)
    }
  }

  // Server-side Multi-format Export Handler (.xlsx, .xls, .csv)
  const handleExportExcel = async () => {
    if (!canExportStudent) return

    const params = {}
    if (searchQuery) params.search = searchQuery
    if (unitFilter && unitFilter !== 'Semua') params.unit_id = unitFilter
    if (kelasFilter && kelasFilter !== 'Semua') params.kelas_id = kelasFilter

    await handleApiExport({
      endpoint: '/students/export',
      params,
      title: 'Ekspor Data Siswa',
      defaultFilename: `Data_Siswa_DarElIman_${new Date().toISOString().slice(0, 10)}`,
    })
  }

  // Render Status Badge
  const renderStatusBadge = (statusStr) => {
    const st = String(statusStr || '').toLowerCase()
    if (st === 'aktif') {
      return <AppBadge variant="success" dot>Aktif</AppBadge>
    }
    if (st === 'mutasi') {
      return <AppBadge variant="warning" dot>Mutasi</AppBadge>
    }
    if (st === 'lulus') {
      return <AppBadge variant="info" dot>Lulus</AppBadge>
    }
    return <AppBadge variant="danger" dot>Nonaktif</AppBadge>
  }

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
    <PageContainer maxW="7xl" className="space-y-6 pb-12">
      <motion.div initial="hidden" animate="visible" variants={containerVariants}>
        <MasterDataPage hideBreadcrumb className="education-unit-page student-master-page">

        {/* Breadcrumb Navigation (Identik dengan Halaman Employees) */}
        <div className="print:hidden">
          <AppBreadcrumb items={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Data Siswa' }]} />
        </div>

        {/* Header Halaman Modern Hero Card */}
        <motion.div variants={itemVariants} className="relative overflow-hidden rounded-[22px] border-2 border-emerald-500/30 bg-gradient-to-r from-emerald-500/15 via-teal-500/10 to-emerald-600/15 p-5 sm:p-6 shadow-md shadow-emerald-500/10 dark:border-emerald-600/40 dark:bg-gradient-to-r dark:from-emerald-950/70 dark:via-teal-950/50 dark:to-slate-900 print:hidden mb-6">
          {/* Ambient Glow Background Accent (Vibrant Dual Emerald-Teal Blobs) */}
          <div className="pointer-events-none absolute -top-20 -right-20 h-56 w-56 rounded-full bg-gradient-to-br from-emerald-500/40 via-teal-400/30 to-emerald-600/20 blur-3xl dark:from-emerald-500/50 dark:via-teal-400/40" />
          <div className="pointer-events-none absolute -bottom-20 -left-20 h-56 w-56 rounded-full bg-gradient-to-tr from-emerald-600/30 via-teal-500/20 to-transparent blur-3xl dark:from-emerald-600/40 dark:via-teal-500/30" />

          <div className="relative z-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-4 min-w-0">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700 text-white shadow-xl shadow-emerald-600/40 border border-emerald-300/40 dark:from-emerald-400 dark:via-emerald-500 dark:to-teal-600">
                <FaUserGraduate className="h-6 w-6" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                    Master Data Siswa Terpadu
                  </h1>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-emerald-600 to-teal-600 px-3.5 py-1 text-xs font-extrabold text-white shadow-sm shadow-emerald-600/25 border border-emerald-300/40">
                    <ShieldCheck className="h-3.5 w-3.5" />
                    Manajemen Kesiswaan
                  </span>
                </div>
                <p className="mt-1 text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300 max-w-2xl leading-relaxed">
                  Pengelolaan terpadu direktori peserta didik (TK, SD, SMP, SMA, Ponpes, Ma'had), status akademis, cetak kartu NISN, dan analisis kesiswaan.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
              <div className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-500/40 bg-gradient-to-r from-emerald-100 via-emerald-50 to-teal-100 px-3.5 py-1.5 text-xs font-black text-emerald-900 dark:border-emerald-700 dark:bg-gradient-to-r dark:from-emerald-950 dark:to-teal-950 dark:text-emerald-200 shadow-2xs">
                <Sparkles className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>Direktori Siswa</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Quick Summary Cards (TAILGRIDS_CARD_COMPONENT) */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6">
          <KpiTintedCard
            icon={FaUserGraduate}
            label="Total Siswa"
            value={studentStats.total_siswa ?? 0}
            subtext="Terdaftar di sistem"
            tone="emerald"
            isLoading={isSummaryLoading}
            onClick={() => {
              setStatCardModal({ isOpen: true, title: 'Detail Data: Total Siswa', filterType: 'all' })
              setStatModalSearch('')
            }}
            active={statCardModal.isOpen && statCardModal.filterType === 'all'}
          />
          <KpiTintedCard
            icon={FaMale}
            label="Siswa Laki-laki"
            value={genderStats.laki_laki ?? 0}
            subtext="Berdasarkan data siswa"
            tone="blue"
            isLoading={isSummaryLoading}
            onClick={() => {
              setStatCardModal({ isOpen: true, title: 'Detail Data: Siswa Laki-laki', filterType: 'male' })
              setStatModalSearch('')
            }}
            active={statCardModal.isOpen && statCardModal.filterType === 'male'}
          />
          <KpiTintedCard
            icon={FaFemale}
            label="Siswa Perempuan"
            value={genderStats.perempuan ?? 0}
            subtext="Berdasarkan data siswa"
            tone="rose"
            isLoading={isSummaryLoading}
            onClick={() => {
              setStatCardModal({ isOpen: true, title: 'Detail Data: Siswa Perempuan', filterType: 'female' })
              setStatModalSearch('')
            }}
            active={statCardModal.isOpen && statCardModal.filterType === 'female'}
          />
          <KpiTintedCard
            icon={FaCheckCircle}
            label="Status Aktif"
            value={studentStats.siswa_aktif ?? 0}
            subtext="Berstatus aktif"
            tone="amber"
            isLoading={isSummaryLoading}
            onClick={() => {
              setStatCardModal({ isOpen: true, title: 'Detail Data: Siswa Status Aktif', filterType: 'aktif' })
              setStatModalSearch('')
            }}
            active={statCardModal.isOpen && statCardModal.filterType === 'aktif'}
          />
        </div>

        {/* Analytics & Achievement Showcase Section for Kepala Sekolah & Divisi Pendidikan */}
        {isLeaderRole && (
          <StudentLeaderAnalyticsSection
            students={formattedStudents}
            dashboardStats={studentDashboardData?.laporan_siswa ? {
              siswa_baru: studentDashboardData.laporan_siswa.siswa_baru,
              mutasi_keluar: studentDashboardData.laporan_siswa.mutasi_keluar,
              siswa_nonaktif: studentStats.siswa_nonaktif,
            } : studentStats}
            selectedUnit={unitFilter}
            units={rawUnits}
            onUnitChange={(val) => { setUnitFilter(val); setKelasFilter(''); setCurrentPage(1) }}
            selectedKelas={kelasFilter}
            classes={availableClasses}
            onKelasChange={(val) => { setKelasFilter(val); setCurrentPage(1) }}
            isKepalaSekolah={isKepalaSekolah}
            isDivisiPendidikan={isDivisiPendidikan}
            onSelectStudent={handleOpenDetail}
            onOpenImport={() => setShowImportModal(true)}
            onOpenExport={handleExportExcel}
            onOpenAdd={handleOpenTambah}
            canExportStudent={canExportStudent}
            canCreateStudent={canCreateStudent}
          />
        )}

        {/* Unified Master Data Section */}
        {/* Unified Master Data Container */}
        <AppDataTable
          title="Daftar Siswa"
          icon={GraduationCap}
          iconClassName="bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700 border border-emerald-300/40"
          actionColumnLabel=""
          description="Data siswa sesuai filter dan kewenangan pengguna."
          countLabel={`${Number(studentPagination.total || filteredStudents.length).toLocaleString('id-ID')} siswa`}
          actions={
            <div className="flex items-center gap-2.5 flex-nowrap shrink-0 overflow-x-auto py-1">
              {/* Cetak Datatable Button - Vivid Indigo / Violet Squircle */}
              <div className="group relative inline-flex">
                <button
                  type="button"
                  title="Cetak Data Laporan (Print)"
                  aria-label="Cetak Data Laporan"
                  onClick={handlePrintMainTable}
                  className="flex size-10 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 via-indigo-600 to-violet-700 text-white border border-indigo-300/40 hover:scale-105 transition-all duration-200 active:scale-95 cursor-pointer"
                >
                  <Printer className="size-5 text-white" strokeWidth={2.2} />
                </button>
                <div className="pointer-events-none absolute top-full left-1/2 mt-2 -translate-x-1/2 opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 transition-all duration-200 ease-out z-50 whitespace-nowrap rounded-lg bg-slate-900 px-2.5 py-1 text-[11px] font-bold text-white shadow-xl dark:bg-slate-100 dark:text-slate-900">
                  <div className="absolute bottom-full left-1/2 -mb-1 -translate-x-1/2 border-4 border-transparent border-b-slate-900 dark:border-b-slate-100" />
                  Cetak Data (Print)
                </div>
              </div>

              {/* Import Button (Vivid Sky Blue / Blue Squircle) */}
              <div className="group relative inline-flex">
                <button
                  type="button"
                  title="Import Data Siswa"
                  aria-label="Import Data Siswa"
                  className="flex size-10 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-400 via-sky-500 to-blue-600 text-white border border-sky-300/40 hover:scale-105 transition-all duration-200 active:scale-95 cursor-pointer"
                  onClick={() => setShowImportModal(true)}
                >
                  <Upload className="size-5 text-white" strokeWidth={2.2} />
                </button>
                <div className="pointer-events-none absolute top-full left-1/2 mt-2 -translate-x-1/2 opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 transition-all duration-200 ease-out z-50 whitespace-nowrap rounded-lg bg-slate-900 px-2.5 py-1 text-[11px] font-bold text-white shadow-xl dark:bg-slate-100 dark:text-slate-900">
                  <div className="absolute bottom-full left-1/2 -mb-1 -translate-x-1/2 border-4 border-transparent border-b-slate-900 dark:border-b-slate-100" />
                  Import Data
                </div>
              </div>

              {/* Export Button (Vivid Amber / Orange Squircle) */}
              {canExportStudent && (
                <div className="group relative inline-flex">
                  <button
                    type="button"
                    title="Export Data Siswa"
                    aria-label="Export Data Siswa"
                    className="flex size-10 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 via-amber-500 to-orange-600 text-white border border-amber-300/40 hover:scale-105 transition-all duration-200 active:scale-95 cursor-pointer"
                    onClick={handleExportExcel}
                  >
                    <Download className="size-5 text-white" strokeWidth={2.2} />
                  </button>
                  <div className="pointer-events-none absolute top-full left-1/2 mt-2 -translate-x-1/2 opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 transition-all duration-200 ease-out z-50 whitespace-nowrap rounded-lg bg-slate-900 px-2.5 py-1 text-[11px] font-bold text-white shadow-xl dark:bg-slate-100 dark:text-slate-900">
                    <div className="absolute bottom-full left-1/2 -mb-1 -translate-x-1/2 border-4 border-transparent border-b-slate-900 dark:border-b-slate-100" />
                    Export Data
                  </div>
                </div>
              )}

              {/* Tambah Button (Vivid Emerald / Teal Squircle) */}
              {canCreateStudent && (
                <div className="group relative inline-flex">
                  <button
                    type="button"
                    title="Tambah Siswa Baru"
                    aria-label="Tambah Siswa Baru"
                    className="flex size-10 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700 text-white border border-emerald-300/40 hover:scale-105 transition-all duration-200 active:scale-95 cursor-pointer"
                    onClick={handleOpenTambah}
                  >
                    <Plus className="size-5 text-white" strokeWidth={2.5} />
                  </button>
                  <div className="pointer-events-none absolute top-full left-1/2 mt-2 -translate-x-1/2 opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 transition-all duration-200 ease-out z-50 whitespace-nowrap rounded-lg bg-slate-900 px-2.5 py-1 text-[11px] font-bold text-white shadow-xl dark:bg-slate-100 dark:text-slate-900">
                    <div className="absolute bottom-full left-1/2 -mb-1 -translate-x-1/2 border-4 border-transparent border-b-slate-900 dark:border-b-slate-100" />
                    Tambah Siswa
                  </div>
                </div>
              )}
            </div>
          }
          search={searchInput}
          onSearchChange={(value) => setSearchInput(value)}
          searchPlaceholder="Cari NIS, NISN, atau nama siswa..."
          filters={
            <>
              <MasterFilterSelect
                aria-label="Filter unit pendidikan"
                value={unitFilter}
                onChange={(e) => {
                  setUnitFilter(e.target.value)
                  setKelasFilter('')
                  setCurrentPage(1)
                }}
              >
                <option value="">Semua Unit Pendidikan</option>
                {rawUnits.map((u) => {
                  const val = u.id || u.nama_unit || u.name || u.nama
                  const label = u.name || u.nama_unit || u.nama || u.code || val
                  return (
                    <option key={u.id || val} value={val}>
                      {label}
                    </option>
                  )
                })}
              </MasterFilterSelect>

              <MasterFilterSelect
                aria-label="Filter kelas"
                value={kelasFilter}
                onChange={(e) => { setKelasFilter(e.target.value); setCurrentPage(1) }}
              >
                <option value="">Semua Kelas</option>
                {availableClasses.map((c, idx) => {
                  const val = c.id || c.nama_kelas || c.name || c.nama
                  const label = c.nama_kelas || c.name || c.nama || val
                  return (
                    <option key={c.id ? `class-${c.id}-${idx}` : `class-opt-${val}-${label}-${idx}`} value={val}>
                      {label}
                    </option>
                  )
                })}
              </MasterFilterSelect>

              <MasterFilterSelect
                aria-label="Filter status"
                value={statusFilter}
                onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1) }}
              >
                <option value="">Semua Status</option>
                <option value="aktif">Aktif</option>
                <option value="mutasi">Mutasi</option>
                <option value="lulus">Lulus</option>
                <option value="nonaktif">Nonaktif</option>
              </MasterFilterSelect>
            </>
          }
          onResetFilters={() => {
            setSearchInput('')
            setUnitFilter('')
            setKelasFilter('')
            setStatusFilter('')
            setCurrentPage(1)
          }}
          hasActiveFilters={Boolean(searchInput || unitFilter || kelasFilter || statusFilter)}
          isLoading={isLoading}
          isError={isError}
          errorTitle="Data siswa gagal dimuat"
          errorMessage="Periksa koneksi server kemudian coba kembali."
          onRetry={refetch}
          isEmpty={!isLoading && !isError && paginatedStudents.length === 0}
          emptyTitle="Siswa tidak ditemukan"
          emptyDescription="Tidak ada data siswa yang cocok dengan kriteria filter."
          page={currentPage}
          totalPages={studentPagination.lastPage || 1}
          totalItems={studentPagination.total || filteredStudents.length}
          itemsPerPage={studentPagination.perPage || 10}
          onPageChange={setCurrentPage}
          meta={{
            total: studentPagination.total || filteredStudents.length,
            from: studentPagination.from || 1,
            to: studentPagination.to || filteredStudents.length,
            last_page: studentPagination.lastPage || 1,
            current_page: currentPage,
          }}
          serverControlled
          renderTable={() => (
            <table className="w-full table-fixed text-left text-sm text-slate-600" aria-label="Daftar siswa">
              <thead className="bg-gradient-to-r from-emerald-100/90 via-teal-50/70 to-emerald-100/90 border-b-2 border-emerald-200/90 dark:from-emerald-950/90 dark:via-teal-950/70 dark:to-emerald-950/90">
                <tr className="border-b-2 border-emerald-200/90 dark:border-emerald-800/80 bg-transparent text-emerald-950 dark:text-emerald-200">
                  <th className="w-[6%] bg-transparent px-2 py-3.5 text-center font-extrabold text-[11px] uppercase tracking-wider">No</th>
                  <th className="w-[34%] bg-transparent px-3 py-3.5 font-extrabold text-[11px] uppercase tracking-wider">Identitas Siswa</th>
                  <th className="hidden w-[29%] bg-transparent px-3 py-3.5 font-extrabold text-[11px] uppercase tracking-wider md:table-cell">Orang Tua / Wali</th>
                  <th className="hidden w-[11%] bg-transparent px-2 py-3.5 text-center font-extrabold text-[11px] uppercase tracking-wider sm:table-cell">Status</th>
                  <th className="w-[20%] bg-transparent px-2 py-3.5 text-center font-extrabold text-[11px] uppercase tracking-wider"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700 font-medium text-slate-700 dark:text-slate-200">
                {paginatedStudents.map((item, idx) => (
                  <tr key={item.id} className="edu-row align-middle transition-colors hover:bg-emerald-50/40 dark:hover:bg-slate-800/50" style={{ animationDelay: `${Math.min(idx, 8) * 35}ms` }}>
                    <td className="px-2 py-3 text-center text-xs font-bold text-slate-400">
                      {(studentPagination.from || 1) + idx}
                    </td>
                    <td className="px-3 py-3">
                      <div className="min-w-0">
                        <PersonIdentityCell src={item.foto} name={item.nama} subtitle={`NIS ${item.nis} · NISN ${item.nisn || '-'}`} />
                        <span className="mt-1 block min-w-0 pl-11">
                          <small className="mt-0.5 block truncate text-[9px] font-semibold text-emerald-700 dark:text-emerald-300" title={`${item.unit} · Kelas ${item.kelas}`}>
                            {item.unit} · Kelas {item.kelas}
                          </small>
                          <small className="mt-0.5 block truncate text-[9px] font-medium text-slate-500 md:hidden" title={item.orangTua}>Ortu: {item.orangTua} ({item.noHp || '-'})</small>
                          <small className={`mt-0.5 text-[9px] font-bold sm:hidden ${(item.status || '').toLowerCase() === 'aktif' ? 'text-emerald-700' : 'text-amber-600'}`}>• {item.status}</small>
                        </span>
                      </div>
                    </td>
                    <td className="hidden px-3 py-3 md:table-cell">
                      <div className="flex min-w-0 items-center gap-2">
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-xs font-black text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200">{(item.orangTua || 'W').split(' ').slice(0, 2).map((part) => part[0]).join('').toUpperCase()}</span>
                        <span className="min-w-0">
                          <strong className="block truncate text-xs text-slate-800 dark:text-slate-100" title={item.orangTua}>{item.orangTua}</strong>
                          <small className="mt-1 block whitespace-nowrap text-[10px] font-semibold tabular-nums text-slate-500 dark:text-slate-400">
                            {item.noHp || '-'}
                          </small>
                        </span>
                      </div>
                    </td>
                    <td className="hidden whitespace-nowrap px-3 py-3 text-center sm:table-cell">{renderStatusBadge(item.status)}</td>
                    <td className="px-3 py-3 text-center">
                      <div className="flex items-center justify-center">
                        <ActionDropdown
                          onView={() => handleOpenDetail(item)}
                          onEdit={canUpdateStudent ? () => handleOpenEdit(item) : undefined}
                          onDelete={canDeleteStudent ? () => handleDelete(item) : undefined}
                          extraItems={[
                            {
                              label: 'Chat Orang Tua',
                              icon: <MessageSquare className="h-4 w-4 text-emerald-600" />,
                              onClick: () => handleOpenChatModal(item),
                            },
                            {
                              label: 'Cetak Kartu',
                              icon: <FaPrint className="h-4 w-4 text-emerald-600" />,
                              onClick: () => { setStudentToPrint(item); setShowCetakModal(true) },
                            },
                          ]}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        />

        {/* POP UP MODAL 1: DETAIL SISWA */}
        <AnimatePresence>
          {showDetailModal && selectedStudent && (
            <div
              className="overlay modal fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/70 backdrop-blur-md overflow-y-auto"
              role="dialog"
              aria-modal="true"
              aria-labelledby="student-detail-modal-title"
              tabIndex={-1}
              onMouseDown={(e) => {
                if (e.target === e.currentTarget) setShowDetailModal(false)
              }}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.94, y: 14 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                transition={{ type: 'spring', stiffness: 400, damping: 28 }}
                className="modal-dialog font-sans my-auto w-full max-w-3xl"
              >
                <div className="modal-content flex max-h-[calc(100dvh-2rem)] flex-col overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-2xl shadow-emerald-950/20 dark:border-slate-800 dark:bg-[#182232] dark:shadow-black/60">
                  {/* Top Accent Gradient Bar */}
                  <div className="h-1.5 w-full bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-600 shrink-0" />

                  {/* Modal Header */}
                  <div className="modal-header flex items-center justify-between border-b border-slate-100 bg-white px-6 py-4.5 dark:border-slate-800 dark:bg-slate-950">
                    <div className="flex items-center gap-3">
                      <div className="rounded-2xl bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700 text-white p-2.5 shadow-md shadow-emerald-500/30 border border-emerald-300/30 shrink-0">
                        <FaUserGraduate className="size-5 text-white" />
                      </div>
                      <div>
                        <h3 id="student-detail-modal-title" className="modal-title text-sm sm:text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                          <span>Detail Siswa</span>
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-800 border border-emerald-200/80 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800/80">
                            <Sparkles className="size-3" />
                            Data Terpadu
                          </span>
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Informasi lengkap profil siswa, orang tua, akademik, dan dokumen.</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowDetailModal(false)}
                      aria-label="Tutup detail siswa"
                      className="size-9 flex items-center justify-center rounded-2xl bg-gradient-to-br from-rose-500 via-rose-600 to-red-700 text-white border border-rose-300/40 hover:scale-105 transition-all duration-200 active:scale-95 cursor-pointer shadow-md shadow-rose-500/20"
                    >
                      <X className="size-4 text-white" strokeWidth={2.25} />
                    </button>
                  </div>

              {/* Modal Content */}
              <div className="max-h-[75vh] overflow-y-auto bg-white p-5">
                <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">

                  {/* Left: Profile Overview Card */}
                  <div className="lg:col-span-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4 text-xs">
                    {/* Photo + Name + Status */}
                    <div className="flex items-start gap-3">
                      <PersonAvatar src={selectedStudent.foto} name={selectedStudent.nama} size="detail" className="border-2 border-emerald-600 shadow" />
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="text-sm font-extrabold text-slate-900 leading-tight">{selectedStudent.nama}</h3>
                          {renderStatusBadge(selectedStudent.status)}
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5 font-medium">NIS: {selectedStudent.nis} | NISN: {selectedStudent.nisn}</p>
                        <p className="text-[11px] text-emerald-800 font-semibold mt-0.5">{selectedStudent.unit}</p>
                      </div>
                    </div>

                    {/* Biodata Singkat */}
                    <div className="space-y-2.5 border-t border-slate-100 pt-3">
                      {[
                        { label: 'Tempat, Tgl Lahir', value: `${selectedStudent.tempatLahir}, ${selectedStudent.tanggalLahir}` },
                        { label: 'Jenis Kelamin', value: selectedStudent.gender },
                        { label: 'Agama', value: selectedStudent.agama || 'Islam' },
                        { label: 'Kelas', value: selectedStudent.kelas },
                      ].map(item => (
                        <div key={item.label} className="flex justify-between items-start gap-2">
                          <span className="text-slate-500 shrink-0">{item.label}:</span>
                          <span className="font-semibold text-slate-800 text-right">{item.value || '-'}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Right: Tabbed Detail */}
                  <div className="lg:col-span-8 space-y-4">
                    {/* Tab Navigation + Content */}
                    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                      {/* Tabs Header */}
                      <div className="flex gap-1 p-1.5 bg-slate-100/80 dark:bg-slate-900/50 border-b border-slate-200/80 dark:border-slate-800 overflow-x-auto">
                        {[
                          { key: 'siswa', label: 'Data Siswa' },
                          { key: 'orangTua', label: 'Orang Tua / Wali' },
                          { key: 'akademik', label: 'Akademik' },
                          { key: 'riwayat', label: 'Riwayat' },
                          { key: 'dokumen', label: 'Dokumen' },
                        ].map(({ key, label }) => (
                          <button
                            key={key}
                            type="button"
                            onClick={() => setActiveDetailTab(key)}
                            className={cn(
                              "px-3.5 py-2 text-xs font-bold rounded-xl transition-all whitespace-nowrap cursor-pointer",
                              activeDetailTab === key
                                ? "bg-white text-emerald-800 shadow-xs dark:bg-emerald-950/80 dark:text-emerald-300 ring-1 ring-emerald-500/20"
                                : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
                            )}
                          >
                            {label}
                          </button>
                        ))}
                      </div>

                      {/* Tab Content */}
                      <div className="p-4 text-xs space-y-2">
                        {(() => {
                          const rawMeta = selectedStudent.raw?.metadata || {}
                          const parentRel = selectedStudent.raw?.parent || {}
                          const parentsPivot = selectedStudent.raw?.parents_pivot || selectedStudent.raw?.parents || []
                          const meta = {
                            ...rawMeta,
                            nama_ayah: rawMeta.nama_ayah || rawMeta.ayah?.nama || rawMeta.orang_tua?.nama_ayah || parentRel.full_name || parentRel.name || parentsPivot[0]?.full_name,
                            nama_ibu: rawMeta.nama_ibu || rawMeta.ibu?.nama || rawMeta.orang_tua?.nama_ibu,
                            nama_wali: rawMeta.nama_wali || rawMeta.wali?.nama || rawMeta.orang_tua?.nama_wali,
                            hp_ayah: rawMeta.hp_ayah || rawMeta.ayah?.hp || rawMeta.orang_tua?.no_hp || parentRel.phone || parentRel.no_hp || parentsPivot[0]?.phone,
                            hp_ibu: rawMeta.hp_ibu || rawMeta.ibu?.hp || rawMeta.orang_tua?.no_hp,
                            hp_wali: rawMeta.hp_wali || rawMeta.wali?.hp || rawMeta.orang_tua?.no_hp,
                          }
                          const DRow = ({ label, val }) => (
                            <p><span className="font-bold text-slate-700">{label}:</span>{' '}
                              <span className="text-slate-800">{val || '-'}</span>
                            </p>
                          )
                          if (activeDetailTab === 'siswa') return (
                            <div className="space-y-2">
                              <DRow label="NIS" val={selectedStudent.nis} />
                              <DRow label="NISN" val={selectedStudent.nisn} />
                              <DRow label="No Pendaftaran" val={meta.no_pendaftaran} />
                              <DRow label="NIK" val={meta.nik} />
                              <DRow label="No KK" val={meta.no_kk} />
                              <DRow label="No Registrasi Akta Lahir" val={meta.no_registrasi_akta_lahir} />
                              <DRow label="Kewarganegaraan" val={meta.kewarganegaraan || 'WNI'} />
                              <DRow label="Email" val={meta.email} />
                              <DRow label="Anak Ke-" val={meta.anak_ke} />
                              <DRow label="Jumlah Saudara" val={meta.jumlah_saudara} />
                              <DRow label="Jumlah Saudara Tiri" val={meta.jumlah_saudara_tiri} />
                              <DRow label="Berat Badan" val={meta.berat_badan ? `${meta.berat_badan} kg` : null} />
                              <DRow label="Tinggi Badan" val={meta.tinggi_badan ? `${meta.tinggi_badan} cm` : null} />
                              <DRow label="Riwayat Penyakit" val={meta.riwayat_penyakit} />
                              <hr className="border-slate-100 my-2" />
                              <DRow label="Alamat Lengkap" val={selectedStudent.alamat || meta.alamat_siswa} />
                              <DRow label="RT/RW" val={meta.rt && meta.rw ? `${meta.rt} / ${meta.rw}` : null} />
                              <DRow label="Dusun/Jalan" val={meta.dusun} />
                              <DRow label="Kelurahan" val={meta.kelurahan} />
                              <DRow label="Kecamatan" val={meta.kecamatan} />
                              <DRow label="Kota/Kabupaten" val={meta.kota_kabupaten} />
                              <DRow label="Provinsi" val={meta.provinsi} />
                              <DRow label="Kode Pos" val={meta.kode_pos} />
                              <DRow label="Jenis Tempat Tinggal" val={meta.jenis_tempat_tinggal} />
                              <DRow label="Jarak ke Sekolah" val={meta.jarak_tempuh_ke_sekolah ? `${meta.jarak_tempuh_ke_sekolah} km` : null} />
                              <DRow label="Moda Transportasi" val={meta.moda_transportasi} />
                              <hr className="border-slate-100 my-2" />
                              <DRow label="Hobi" val={meta.hobi} />
                              <DRow label="Cita-cita" val={meta.cita_cita} />
                            </div>
                          )
                          if (activeDetailTab === 'orangTua') return (
                            <div className="space-y-2">
                              {/* Quick Contact Banner */}
                              <div className="flex flex-wrap items-center justify-between gap-2 p-3 mb-3 rounded-xl bg-emerald-50/90 border border-emerald-200/80 dark:bg-emerald-950/40 dark:border-emerald-800/60">
                                <div className="flex items-center gap-2">
                                  <MessageSquare className="h-4 w-4 text-emerald-700 dark:text-emerald-400" />
                                  <span className="text-xs font-bold text-emerald-900 dark:text-emerald-200">
                                    Hubungi Langsung Orang Tua / Wali
                                  </span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <button
                                    type="button"
                                    onClick={() => handleDirectChatPortal(selectedStudent)}
                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg bg-emerald-800 text-white hover:bg-emerald-900 transition cursor-pointer shadow-xs"
                                  >
                                    <MessageSquare className="h-3.5 w-3.5" /> Chat SIMS Portal
                                  </button>
                                  {(meta.nomor_wa_ayah || meta.hp_ayah || meta.telfon_ayah || meta.nomor_wa_ibu || meta.hp_ibu || selectedStudent.noHp) && (
                                    <button
                                      type="button"
                                      onClick={() => handleDirectWhatsApp(meta.nomor_wa_ayah || meta.hp_ayah || meta.nomor_wa_ibu || selectedStudent.noHp, selectedStudent)}
                                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition cursor-pointer shadow-xs"
                                    >
                                      <Phone className="h-3.5 w-3.5" /> WhatsApp
                                    </button>
                                  )}
                                </div>
                              </div>

                              <p className="font-bold text-emerald-800 border-b border-emerald-100 pb-1.5 mb-2">Data Ayah Kandung</p>
                              <DRow label="NIK Ayah" val={meta.nik_ayah} />
                              <DRow label="Nama Ayah" val={meta.nama_ayah} />
                              <DRow label="Tempat, Tgl Lahir Ayah" val={meta.tempat_lahir_ayah && meta.tgl_lahir_ayah ? `${meta.tempat_lahir_ayah}, ${meta.tgl_lahir_ayah}` : (meta.tempat_lahir_ayah || meta.tgl_lahir_ayah)} />
                              <DRow label="Telfon / HP Ayah" val={meta.telfon_ayah || meta.hp_ayah} />
                              <DRow label="No WA Ayah" val={meta.nomor_wa_ayah} />
                              <DRow label="Pendidikan Terakhir Ayah" val={meta.pendidikan_terakhir_ayah} />
                              <DRow label="Pekerjaan Ayah" val={meta.pekerjaan_ayah} />
                              <DRow label="Instansi / Jabatan Ayah" val={meta.instansi_pekerjaan_ayah && meta.jabatan_pekerjaan_ayah ? `${meta.instansi_pekerjaan_ayah} — ${meta.jabatan_pekerjaan_ayah}` : (meta.instansi_pekerjaan_ayah || meta.jabatan_pekerjaan_ayah)} />
                              <DRow label="Penghasilan Ayah" val={meta.penghasilan_ayah ? `Rp ${Number(meta.penghasilan_ayah).toLocaleString('id-ID')}` : null} />
                              <DRow label="Alamat Rumah Ayah" val={meta.alamat_ayah} />
                              <hr className="border-slate-100 my-2" />
                              <p className="font-bold text-blue-800 border-b border-blue-100 pb-1.5 mb-2">Data Ibu Kandung</p>
                              <DRow label="NIK Ibu" val={meta.nik_ibu} />
                              <DRow label="Nama Ibu" val={meta.nama_ibu} />
                              <DRow label="Tempat, Tgl Lahir Ibu" val={meta.tempat_lahir_ibu && meta.tgl_lahir_ibu ? `${meta.tempat_lahir_ibu}, ${meta.tgl_lahir_ibu}` : (meta.tempat_lahir_ibu || meta.tgl_lahir_ibu)} />
                              <DRow label="Telfon / HP Ibu" val={meta.telfon_ibu || meta.hp_ibu} />
                              <DRow label="No WA Ibu" val={meta.nomor_wa_ibu} />
                              <DRow label="Pendidikan Terakhir Ibu" val={meta.pendidikan_terakhir_ibu} />
                              <DRow label="Pekerjaan Ibu" val={meta.pekerjaan_ibu} />
                              <DRow label="Instansi / Jabatan Ibu" val={meta.instansi_pekerjaan_ibu && meta.jabatan_pekerjaan_ibu ? `${meta.instansi_pekerjaan_ibu} — ${meta.jabatan_pekerjaan_ibu}` : (meta.instansi_pekerjaan_ibu || meta.jabatan_pekerjaan_ibu)} />
                              <DRow label="Penghasilan Ibu" val={meta.penghasilan_ibu ? `Rp ${Number(meta.penghasilan_ibu).toLocaleString('id-ID')}` : null} />
                              <DRow label="Alamat Rumah Ibu" val={meta.alamat_ibu} />
                              {(meta.nama_wali || meta.hp_wali) && (<>
                                <hr className="border-slate-100 my-2" />
                                <p className="font-bold text-slate-700 border-b border-slate-100 pb-1.5 mb-2">Data Wali</p>
                                <DRow label="NIK Wali" val={meta.nik_wali} />
                                <DRow label="Nama Wali" val={meta.nama_wali} />
                                <DRow label="HP / WA Wali" val={meta.hp_wali || meta.nomor_wa_wali} />
                                <DRow label="Pekerjaan Wali" val={meta.pekerjaan_wali} />
                                <DRow label="Alamat Wali" val={meta.alamat_wali} />
                              </>)}
                            </div>
                          )
                          if (activeDetailTab === 'akademik') return (
                            <div className="space-y-2">
                              <DRow label="Unit Pendidikan" val={selectedStudent.unit} />
                              <DRow label="Kelas" val={selectedStudent.kelas} />
                              <DRow label="Tahun Ajaran Masuk" val={meta.tahun_ajaran_masuk} />
                              <DRow label="Tahun Ajaran Berjalan" val={meta.tahun_ajaran_berjalan} />
                              <DRow label="Status Siswa" val={selectedStudent.status} />
                              <DRow label="NIS Pembayaran" val={meta.nis_pembayaran} />
                              <DRow label="Wali Kelas" val={meta.wali_kelas} />
                              <DRow label="NIY Wali Kelas" val={meta.niy_wali_kelas} />
                              <DRow label="Status Orang Tua" val={meta.status_orang_tua} />
                              <DRow label="NIY Ortu (Jika Pegawai)" val={meta.niy_ortu_jika_pegawai} />
                              <hr className="border-slate-100 my-2" />
                              <DRow label="Sekolah Asal" val={meta.sekolah_asal} />
                              <DRow label="Status Sekolah Asal" val={meta.status_sekolah_asal} />
                              <DRow label="Nominal SPP" val={meta.nominal_spp ? `Rp ${Number(meta.nominal_spp).toLocaleString('id-ID')}` : null} />
                              <DRow label="Penerima KPS/PKH" val={meta.penerima_kps_pkh} />
                              <DRow label="Punya KIP" val={meta.apakah_punya_kip} />
                              <DRow label="Layak Menerima PIP" val={meta.apakah_layak_menerima_pip} />
                              <DRow label="Alasan Menolak PIP" val={meta.alasan_menolak_pip} />
                            </div>
                          )
                          if (activeDetailTab === 'riwayat') return (
                            <div className="space-y-2">
                              <DRow label="Tanggal Masuk" val={meta.tanggal_masuk} />
                              <DRow label="No Induk Sebelumnya" val={meta.no_induk_sebelumnya} />
                              <DRow label="Beasiswa" val={meta.beasiswa} />
                              <DRow label="Catatan" val={meta.catatan} />
                              <p className="text-slate-400 mt-2">Riwayat keaktifan & kehadiran tercatat di sistem absensi.</p>
                            </div>
                          )
                          if (activeDetailTab === 'dokumen') return (
                            <div className="space-y-2">
                              <DRow label="Foto Siswa (URL)" val={meta.foto_url} />
                              <DRow label="No Registrasi Akta Lahir" val={meta.no_registrasi_akta_lahir} />
                              <DRow label="No Kartu Keluarga" val={meta.no_kk} />
                              <p className="text-slate-400 mt-2">Status dokumen fisik dikelola secara manual oleh admin TU.</p>
                            </div>
                          )
                          return null
                        })()}
                      </div>
                    </div>

                    {/* Quick Actions Card */}
                    <div className="rounded-2xl border border-slate-200/80 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-900/40 shadow-xs">
                      <h4 className="text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider mb-3">AKSI CEPAT SISWA</h4>
                      <div className="flex flex-wrap gap-2.5">
                        {canUpdateStudent && (
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(selectedStudent)}
                            className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-br from-amber-400 via-amber-500 to-orange-600 text-white px-4 py-2 text-xs font-bold border border-amber-300/40 hover:scale-[1.02] active:scale-95 transition-all shadow-xs cursor-pointer"
                          >
                            <FaEdit className="size-3.5" /> <span>Edit Data</span>
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => { setStudentToPrint(selectedStudent); setShowCetakModal(true) }}
                          className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-br from-indigo-500 via-indigo-600 to-violet-700 text-white px-4 py-2 text-xs font-bold border border-indigo-300/40 hover:scale-[1.02] active:scale-95 transition-all shadow-xs cursor-pointer"
                        >
                          <FaPrint className="size-3.5" /> <span>Cetak Kartu Siswa</span>
                        </button>
                        {canDeleteStudent && (
                          <button
                            type="button"
                            onClick={() => handleDelete(selectedStudent)}
                            className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-br from-rose-500 via-rose-600 to-red-700 text-white px-4 py-2 text-xs font-bold border border-rose-300/40 hover:scale-[1.02] active:scale-95 transition-all shadow-xs cursor-pointer"
                          >
                            <FaTrash className="size-3.5" /> <span>Hapus Data</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="modal-footer flex items-center justify-end border-t border-slate-100 bg-slate-50/50 px-6 py-4 dark:border-slate-800 dark:bg-slate-900/30">
                <button
                  type="button"
                  onClick={() => setShowDetailModal(false)}
                  className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-br from-rose-500 via-rose-600 to-red-700 text-white px-5 py-2.5 text-xs font-extrabold border border-rose-300/40 hover:scale-[1.03] transition-all duration-200 active:scale-95 cursor-pointer shadow-md shadow-rose-500/20"
                >
                  <div className="flex size-4 items-center justify-center rounded-md bg-white/20 text-white">
                    <X className="size-3" strokeWidth={2.2} />
                  </div>
                  <span>Tutup</span>
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>

        {/* POP UP MODAL 2: TAMBAH / EDIT SISWA FORM (Code-split via React.lazy & Suspense) */}
        {showFormModal && (
          <Suspense
            fallback={
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm animate-in fade-in duration-200">
                <div className="flex w-full max-w-md flex-col items-center justify-center gap-4 rounded-3xl border border-emerald-500/30 bg-white p-8 shadow-2xl dark:bg-[#1B2433]">
                  <div className="flex size-14 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-100 to-teal-100 dark:from-emerald-950/60 dark:to-teal-950/40 border border-emerald-200/60 dark:border-emerald-800/60 shadow-xs">
                    <Sparkles className="size-7 text-emerald-600 dark:text-emerald-400 animate-spin" />
                  </div>
                  <div className="space-y-1.5 text-center">
                    <h4 className="text-sm font-extrabold text-slate-800 dark:text-white">
                      Memuat Formulir Siswa Terpadu...
                    </h4>
                    <p className="text-xs text-slate-400 font-medium leading-relaxed">
                      Menyiapkan wizard 5-langkah, pemetaan wilayah, dan validasi data.
                    </p>
                  </div>
                </div>
              </div>
            }
          >
            <StudentFormModal
              isOpen={showFormModal}
              onClose={() => setShowFormModal(false)}
              initialData={isEdit ? selectedStudent : null}
              onSubmit={handleFormSubmitCallback}
              classes={rawClasses}
              units={rawUnits}
            />
          </Suspense>
        )}

        {/* POP UP MODAL 3: CETAK KARTU SISWA */}
        {showCetakModal && (
          <CetakKartuSiswaModal student={studentToPrint} onClose={() => setShowCetakModal(false)} />
        )}

        {/* POP UP MODAL: CETAK / PDF DAFTAR SISWA */}
        <PrintOptionModal
          isOpen={showPrintOptionModal}
          onClose={() => setShowPrintOptionModal(false)}
          onPrint={handlePrintDocument}
          onDownloadPdf={handleDownloadPdf}
        />

        {/* POP UP MODAL 4: DASHBOARD IMPORT DATA SISWA (TAILGRIDS HARMONIZED BATCH MODAL) */}
        <AnimatePresence>
          {showImportModal && (
            <div
              className="overlay modal fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/70 backdrop-blur-md"
              role="dialog"
              aria-modal="true"
              aria-labelledby="student-import-title"
              tabIndex={-1}
              onMouseDown={(e) => {
                if (e.target === e.currentTarget && !isImporting) {
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
                className="modal-dialog font-sans my-auto w-full max-w-3xl"
              >
                <div className="modal-content flex max-h-[calc(100dvh-2rem)] flex-col overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-2xl shadow-emerald-950/20 dark:border-slate-800 dark:bg-[#182232] dark:shadow-black/60">
                  {/* Top Accent Gradient Bar */}
                  <div className="h-1.5 w-full bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-600 shrink-0" />

                  {/* Header */}
                  <div className="modal-header flex items-center justify-between border-b border-slate-100 bg-white px-6 py-4.5 dark:border-slate-800 dark:bg-slate-950">
                    <div className="flex items-center gap-3">
                      <div className="rounded-2xl bg-gradient-to-br from-sky-500 via-sky-600 to-blue-600 text-white p-2.5 shadow-md shadow-sky-500/30 border border-sky-300/30 shrink-0">
                        <Upload className="h-5 w-5 text-white" strokeWidth={2.25} />
                      </div>
                      <div>
                        <h3 id="student-import-title" className="modal-title text-sm sm:text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                          <span>Import Data Siswa</span>
                          <span className="inline-flex items-center gap-1 rounded-full bg-sky-50 px-2 py-0.5 text-[10px] font-bold text-sky-700 border border-sky-200/80 dark:bg-sky-950/60 dark:text-sky-300 dark:border-sky-800/60">
                            <Sparkles className="size-3" />
                            Batch Import
                          </span>
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                          Unggah file Excel atau CSV untuk mengimpor banyak siswa secara massal
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
                      className="size-9 flex items-center justify-center rounded-2xl bg-gradient-to-br from-rose-500 via-rose-600 to-red-700 text-white border border-rose-300/40 hover:scale-105 transition-all duration-200 active:scale-95 cursor-pointer shadow-md shadow-rose-500/20"
                    >
                      <X className="size-4 text-white" strokeWidth={2.25} />
                    </button>
                  </div>

                  {/* Modal Body */}
                  <div className="modal-body min-h-0 flex-1 space-y-4.5 overflow-y-auto p-6 text-sm text-slate-700 dark:text-slate-200">
                    {/* Step 1: Download Template Card */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-sky-200/70 bg-gradient-to-r from-sky-50/50 via-teal-50/20 to-white p-4 dark:border-sky-800/50 dark:bg-slate-900/40">
                      <div className="flex items-center gap-3">
                        <div className="flex size-9 items-center justify-center rounded-xl bg-gradient-to-br from-sky-500 via-sky-600 to-blue-600 text-white border border-sky-300/30 shrink-0">
                          <Download className="size-4.5 text-white" strokeWidth={2.2} />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-800 dark:text-slate-100">Unduh Format Template Berkas</p>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400">Gunakan berkas template resmi agar kolom data terpetakan otomatis ke sistem ERP</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={handleDownloadTemplateSiswa}
                        className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-300 bg-emerald-50/70 hover:bg-emerald-100/70 text-emerald-800 px-3.5 py-2 text-xs font-bold transition-all dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 cursor-pointer hover:scale-[1.02] active:scale-95 shrink-0 shadow-xs"
                      >
                        <div className="flex size-5 items-center justify-center rounded-md bg-emerald-600 text-white">
                          <Download className="size-3 text-white" strokeWidth={2.2} />
                        </div>
                        <span>Unduh Template (.xlsx)</span>
                      </button>
                    </div>

                    {/* Step 2: Upload Dropzone */}
                    <div>
                      <label className="group relative flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-emerald-300/80 bg-gradient-to-b from-emerald-50/25 to-slate-50/50 p-6 text-center transition-all duration-200 hover:border-emerald-500 hover:bg-emerald-50/40 hover:shadow-xs dark:border-emerald-800/60 dark:bg-slate-900/30 dark:hover:border-emerald-600 dark:hover:bg-emerald-950/20">
                        <div className="mb-2.5 flex size-12 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200/60 text-[#0E5C44] transition-transform duration-200 group-hover:scale-110 dark:from-emerald-950/60 dark:to-teal-950/40 dark:border-emerald-800/60 dark:text-[#3FBF75]">
                          <FileSpreadsheet className="size-6" strokeWidth={2.2} />
                        </div>
                        <p className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-100">
                          {importFile ? importFile.name : 'Pilih atau Tarik Berkas Spreadsheet Siswa ke Sini'}
                        </p>
                        <p className="mt-1 text-[11px] text-slate-400 dark:text-slate-400">
                          Format disukai: .xlsx, .xls, atau .csv (Maksimal 5MB)
                        </p>
                        {importFile && (
                          <div className="mt-2.5 inline-flex items-center gap-1.5 rounded-full bg-emerald-100/80 px-3 py-1 text-[11px] font-bold text-[#0E5C44] border border-emerald-200 dark:bg-emerald-950/80 dark:text-emerald-300 dark:border-emerald-800/80">
                            <CheckCircle2 className="size-3.5" />
                            <span>{(importFile.size / 1024).toFixed(1)} KB · Berkas Siap Diunggah</span>
                          </div>
                        )}
                        <input
                          type="file"
                          accept=".csv, .xlsx, .xls"
                          onChange={handleFileSelect}
                          className="hidden"
                        />
                      </label>
                      {importFile && (
                        <div className="flex justify-end mt-1.5">
                          <button
                            type="button"
                            onClick={() => { setImportFile(null); setImportPreviewData([]) }}
                            className="text-[11px] font-semibold text-rose-600 hover:text-rose-700 hover:underline flex items-center gap-1 cursor-pointer"
                          >
                            <X className="size-3" /> Ganti Berkas
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Step 3: Preview Table */}
                    {importPreviewData.length > 0 && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                            <span>Preview Data yang Siap Diimpor</span>
                            <span className="inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                              {importPreviewData.length} baris
                            </span>
                          </p>
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-bold text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300">
                            Format Sesuai
                          </span>
                        </div>
                        <div className="max-h-48 overflow-auto rounded-2xl border border-emerald-200/80 bg-white shadow-2xs dark:border-emerald-900/50 dark:bg-[#182232]">
                          <table className="w-full text-left text-[11px]">
                            <thead className="bg-gradient-to-r from-emerald-100/80 via-teal-50/60 to-emerald-100/80 border-b border-emerald-200/80 dark:from-emerald-950/80 dark:via-teal-950/60 dark:to-emerald-950/80 dark:border-emerald-900/50 font-bold text-slate-700 dark:text-slate-200">
                              <tr>
                                <th className="py-2 px-3">NIS</th>
                                <th className="py-2 px-3">NISN</th>
                                <th className="py-2 px-3">Nama Siswa</th>
                                <th className="py-2 px-3">JK</th>
                                <th className="py-2 px-3">Unit</th>
                                <th className="py-2 px-3">Kelas</th>
                                <th className="py-2 px-3">Orang Tua</th>
                                <th className="py-2 px-3">No HP</th>
                                <th className="py-2 px-3 text-center">Status</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-emerald-100/80 dark:divide-emerald-900/40">
                              {importPreviewData.map((row, idx) => (
                                <tr key={idx} className="hover:bg-emerald-50/30 dark:hover:bg-slate-800/40 transition-colors">
                                  <td className="py-2 px-3 font-mono font-medium text-slate-700 dark:text-slate-300">{row.nis}</td>
                                  <td className="py-2 px-3 font-mono text-slate-500 dark:text-slate-400">{row.nisn}</td>
                                  <td className="py-2 px-3 font-bold text-slate-900 dark:text-white">{row.nama}</td>
                                  <td className="py-2 px-3 text-slate-600 dark:text-slate-300">{row.gender}</td>
                                  <td className="py-2 px-3 text-slate-600 dark:text-slate-300">{row.unit}</td>
                                  <td className="py-2 px-3 font-semibold text-emerald-700 dark:text-emerald-400">{row.kelas}</td>
                                  <td className="py-2 px-3 text-slate-600 dark:text-slate-300">{row.namaAyah}</td>
                                  <td className="py-2 px-3 font-mono text-slate-600 dark:text-slate-300">{row.hpAyah}</td>
                                  <td className="py-2 px-3 text-center">
                                    <span className="inline-flex items-center rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-[#0E5C44] border border-emerald-200/80 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800/80">
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

                    {/* Guidance Banner */}
                    <div className="rounded-2xl border border-emerald-200/80 bg-emerald-50/70 p-3.5 dark:border-emerald-800/50 dark:bg-emerald-950/30 flex items-start gap-2.5">
                      <ShieldCheck className="size-4.5 text-[#0E5C44] dark:text-emerald-400 shrink-0 mt-0.5" />
                      <p className="text-xs text-slate-700 dark:text-slate-200 leading-relaxed">
                        Sistem akan memvalidasi keunikan nomor induk siswa (NIS/NISN) dan secara otomatis menautkan data wali dan kelas tanpa merusak integritas database yang sudah ada.
                      </p>
                    </div>
                  </div>

                  {/* Modal Action Footer */}
                  <div className="modal-footer flex items-center justify-between border-t border-slate-100 bg-slate-50/50 px-6 py-4 dark:border-slate-800 dark:bg-slate-900/30">
                    <button
                      type="button"
                      disabled={isImporting}
                      onClick={() => {
                        setShowImportModal(false)
                        setImportFile(null)
                        setImportPreviewData([])
                      }}
                      className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-br from-rose-500 via-rose-600 to-red-700 text-white px-4 py-2.5 text-xs font-extrabold border border-rose-300/40 transition-all duration-200 hover:scale-[1.03] active:scale-95 cursor-pointer disabled:opacity-50"
                    >
                      <div className="flex size-5 items-center justify-center rounded-lg bg-white/20 text-white">
                        <X className="size-3.5 text-white" strokeWidth={2.2} />
                      </div>
                      <span>Batal</span>
                    </button>
                    <button
                      type="button"
                      disabled={!importFile || isImporting}
                      onClick={handleProcessImport}
                      className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-600 via-emerald-700 to-teal-800 text-white px-5 py-2.5 text-xs font-extrabold shadow-md shadow-emerald-700/20 hover:scale-[1.03] active:scale-95 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                    >
                      {isImporting ? (
                        <>
                          <Sparkles className="size-4 animate-spin" />
                          <span>Memproses Import...</span>
                        </>
                      ) : (
                        <>
                          <Upload className="size-4" />
                          <span>Proses Import Data</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Modal Detail Data Statistik Siswa (ERP Stat Cards Popup) */}
        {statCardModal.isOpen && (
          <OverlayWrapper
            isOpen={statCardModal.isOpen}
            onOpenChange={(open) => {
              if (!open) setStatCardModal((prev) => ({ ...prev, isOpen: false }))
            }}
            isDismissable
          >
            <Backdrop isOpen={statCardModal.isOpen} />
            <Dialog className="max-w-4xl w-full p-6 space-y-5">
              <DialogHeader className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
                <div>
                  <DialogTitle className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-wide">
                    {statCardModal.title}
                  </DialogTitle>
                  <DialogDescription className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                    Daftar rinci siswa terfilter berdasarkan statistik
                  </DialogDescription>
                </div>
              </DialogHeader>

              <div className="space-y-4">
                <div className="flex items-center justify-between gap-4">
                  <div className="relative flex-1 max-w-sm">
                    <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                    <input
                      type="text"
                      value={statModalSearch}
                      onChange={(e) => setStatModalSearch(e.target.value)}
                      placeholder="Cari nama, NIS, NISN, atau kelas..."
                      className="w-full pl-9 pr-4 py-2 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                  <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                    Total: {statModalItems.length} Siswa
                  </span>
                </div>

                <div className="max-h-96 overflow-y-auto rounded-xl border border-slate-200 dark:border-slate-800">
                  <table className="w-full text-left text-xs">
                    <thead className="sticky top-0 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold border-b border-slate-200 dark:border-slate-700">
                      <tr>
                        <th className="p-3">Nama Siswa & NIS/NISN</th>
                        <th className="p-3">Unit Kerja</th>
                        <th className="p-3">Kelas</th>
                        <th className="p-3 text-center">Jenis Kelamin</th>
                        <th className="p-3 text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {statModalItems.length > 0 ? (
                        statModalItems.map((std) => (
                          <tr key={std.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors">
                            <td className="p-3">
                              <div className="flex items-center gap-3">
                                <PersonAvatar src={std.foto} name={std.nama} size="sm" />
                                <div>
                                  <p className="font-bold text-slate-900 dark:text-white">{std.nama}</p>
                                  <p className="font-mono text-[10px] text-slate-400">NIS: {std.nis} | NISN: {std.nisn}</p>
                                </div>
                              </div>
                            </td>
                            <td className="p-3 font-semibold text-emerald-700 dark:text-emerald-400">{std.unit}</td>
                            <td className="p-3 text-slate-600 dark:text-slate-300 font-semibold">{std.kelas}</td>
                            <td className="p-3 text-center text-slate-600 dark:text-slate-300">{std.gender}</td>
                            <td className="p-3 text-center">
                              <AppBadge variant={std.status === 'Aktif' ? 'success' : 'danger'} dot>
                                {std.status}
                              </AppBadge>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={5} className="p-6 text-center text-slate-400 font-semibold">
                            Data siswa tidak ditemukan.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              <DialogFooter className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800 pt-4">
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
                  onClick={() => setStatCardModal((prev) => ({ ...prev, isOpen: false }))}
                  className="font-semibold"
                >
                  Tutup
                </Button>
              </DialogFooter>
            </Dialog>
          </OverlayWrapper>
        )}

        {/* MODAL PILIH OPSI CHAT KE ORANG TUA */}
        <AnimatePresence>
          {chatTargetModal && (
            <div
              className="overlay modal fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/70 backdrop-blur-md"
              role="dialog"
              aria-modal="true"
              tabIndex={-1}
              onMouseDown={(e) => {
                if (e.target === e.currentTarget) setChatTargetModal(null)
              }}
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
                      <div className="rounded-2xl bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700 text-white p-2.5 shadow-md shadow-emerald-500/30 border border-emerald-300/30 shrink-0">
                        <MessageCircle className="size-5 text-white" />
                      </div>
                      <div>
                        <h3 className="text-sm sm:text-base font-black text-slate-900 dark:text-white">Hubungi Orang Tua / Wali</h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                          Siswa: <strong className="text-emerald-700 dark:text-emerald-400">{chatTargetModal.nama || chatTargetModal.full_name}</strong>
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setChatTargetModal(null)}
                      className="size-9 flex items-center justify-center rounded-2xl bg-gradient-to-br from-rose-500 via-rose-600 to-red-700 text-white border border-rose-300/40 hover:scale-105 transition-all duration-200 active:scale-95 cursor-pointer shadow-md shadow-rose-500/20"
                    >
                      <X className="size-4 text-white" strokeWidth={2.25} />
                    </button>
                  </div>

                  <div className="p-6 space-y-4 text-slate-700 dark:text-slate-200">
                    <div className="rounded-2xl bg-slate-50/80 p-3.5 text-xs border border-slate-100 dark:bg-slate-900/50 dark:border-slate-800 space-y-1.5">
                      <div className="flex justify-between py-0.5">
                        <span className="text-slate-500">Nama Wali:</span>
                        <strong className="text-slate-800 dark:text-slate-200">{chatTargetModal.orangTua || '-'}</strong>
                      </div>
                      <div className="flex justify-between py-0.5">
                        <span className="text-slate-500">Unit / Kelas:</span>
                        <strong className="text-slate-800 dark:text-slate-200">{chatTargetModal.unit} • Kelas {chatTargetModal.kelas}</strong>
                      </div>
                      <div className="flex justify-between py-0.5">
                        <span className="text-slate-500">Nomor HP / WA:</span>
                        <strong className="text-emerald-700 dark:text-emerald-400">{chatTargetModal.noHp || '-'}</strong>
                      </div>
                    </div>

                    {/* Field Tulis Pesan untuk Orang Tua */}
                    <div className="space-y-1.5">
                      <label className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
                        <span>Pesan yang Ingin Dikirim:</span>
                        <span className="text-[10px] text-slate-400 font-medium">{chatQuickMessage.length}/1000 karakter</span>
                      </label>
                      <textarea
                        value={chatQuickMessage}
                        onChange={(e) => setChatQuickMessage(e.target.value)}
                        placeholder="Ketik pesan informasi atau konsultasi untuk orang tua/wali di sini..."
                        rows={3}
                        maxLength={1000}
                        className="w-full rounded-2xl border border-slate-200/90 bg-slate-50/70 p-3 text-xs text-slate-900 placeholder:text-slate-400 outline-none focus:border-emerald-500 focus:bg-white dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:focus:border-emerald-400 resize-none transition shadow-2xs font-medium"
                      />
                    </div>

                    <p className="text-xs font-bold text-slate-700 dark:text-slate-300">Pilih Jalur Komunikasi:</p>

                    <div className="grid grid-cols-1 gap-2.5">
                      <button
                        type="button"
                        onClick={() => handleDirectChatPortal(chatTargetModal)}
                        className="flex items-center gap-3 w-full p-3 rounded-2xl border border-emerald-300/80 bg-gradient-to-r from-emerald-50 via-teal-50/60 to-white hover:border-emerald-500 text-emerald-950 dark:bg-emerald-950/30 dark:border-emerald-800 dark:text-emerald-200 transition cursor-pointer text-left shadow-2xs hover:shadow-xs group"
                      >
                        <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-600 to-teal-700 text-white font-black shadow-xs group-hover:scale-105 transition-transform">
                          <MessageSquare className="size-5" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-black">Chat Internal SIMS Terpadu</p>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400">Pesan resmi tersimpan dalam riwayat komunikasi sekolah</p>
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDirectWhatsApp(chatTargetModal.noHp, chatTargetModal)}
                        className="flex items-center gap-3 w-full p-3 rounded-2xl border border-slate-200/80 bg-white hover:border-emerald-400 text-slate-800 dark:bg-slate-900/40 dark:border-slate-800 dark:text-slate-200 transition cursor-pointer text-left shadow-2xs hover:shadow-xs group"
                      >
                        <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 text-white font-black shadow-xs group-hover:scale-105 transition-transform">
                          <Phone className="size-5" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-black">Hubungi via WhatsApp</p>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400">Kirim pesan langsung ke nomor WhatsApp orang tua</p>
                        </div>
                      </button>
                    </div>
                  </div>

                  <div className="modal-footer flex items-center justify-end border-t border-slate-100 bg-slate-50/50 px-6 py-4 dark:border-slate-800 dark:bg-slate-900/30">
                    <button
                      type="button"
                      onClick={() => setChatTargetModal(null)}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 px-4 py-2 text-xs font-bold transition-all cursor-pointer"
                    >
                      Batal
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* MODAL: KONFIRMASI SIMPAN / PERBARUI DATA SISWA HARMONISASI TAILGRIDS */}
        <AnimatePresence>
          {showSaveConfirmDialog && (
            <div
              className="overlay modal fixed inset-0 z-[70] flex items-center justify-center p-3 sm:p-5 bg-slate-950/70 backdrop-blur-md"
              role="dialog"
              aria-modal="true"
              aria-labelledby="student-save-confirm-title"
              tabIndex={-1}
              onMouseDown={(e) => {
                if (e.target === e.currentTarget && !isSaving) setShowSaveConfirmDialog(false)
              }}
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
                  <div
                    className={cn(
                      "h-1.5 w-full shrink-0",
                      isEdit
                        ? "bg-gradient-to-r from-amber-500 via-teal-400 to-emerald-600"
                        : "bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-600"
                    )}
                  />

                  {/* Header */}
                  <div className="modal-header flex items-center justify-between border-b border-slate-100 bg-white px-6 py-4.5 dark:border-slate-800 dark:bg-slate-950">
                    <div className="flex items-center gap-3">
                      <div
                        className={cn(
                          "rounded-2xl text-white p-2.5 shadow-md shrink-0 border",
                          isEdit
                            ? "bg-gradient-to-br from-amber-500 via-amber-600 to-orange-600 shadow-amber-500/30 border-amber-300/30"
                            : "bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700 shadow-emerald-500/30 border-emerald-300/30"
                        )}
                      >
                        {isEdit ? (
                          <Pencil className="h-5 w-5 text-white" strokeWidth={2.25} />
                        ) : (
                          <GraduationCap className="h-5 w-5 text-white" strokeWidth={2.25} />
                        )}
                      </div>
                      <div>
                        <h3
                          id="student-save-confirm-title"
                          className="modal-title text-sm sm:text-base font-black text-slate-900 dark:text-white flex items-center gap-2"
                        >
                          <span>{isEdit ? 'Konfirmasi Perubahan Data' : 'Konfirmasi Penyimpanan Data'}</span>
                          <span
                            className={cn(
                              "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold border",
                              isEdit
                                ? "bg-amber-50 text-amber-700 border-amber-200/80 dark:bg-amber-950/60 dark:text-amber-400 dark:border-amber-800/60"
                                : "bg-emerald-50 text-emerald-800 border-emerald-200/80 dark:bg-emerald-950/60 dark:text-emerald-400 dark:border-emerald-800/60"
                            )}
                          >
                            <Sparkles className="size-3" />
                            {isEdit ? 'Update Data' : 'Siswa Baru'}
                          </span>
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                          {isEdit
                            ? 'Verifikasi data siswa sebelum pembaruan diterapkan ke server.'
                            : 'Verifikasi data siswa baru sebelum disimpan ke dalam sistem.'}
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      disabled={isSaving}
                      onClick={() => setShowSaveConfirmDialog(false)}
                      aria-label="Tutup dialog konfirmasi"
                      className="size-9 flex items-center justify-center rounded-2xl bg-gradient-to-br from-rose-500 via-rose-600 to-red-700 text-white hover:scale-105 active:scale-95 transition-all duration-200 shadow-md shadow-rose-500/20 cursor-pointer disabled:opacity-50"
                    >
                      <X className="size-4 text-white" strokeWidth={2.25} />
                    </button>
                  </div>

                  {/* Body */}
                  <div className="modal-body p-6 space-y-4 text-slate-700 dark:text-slate-200">
                    {/* Target Info Summary Card */}
                    <div className="rounded-2xl border border-slate-200/90 bg-slate-50/70 p-3.5 dark:border-slate-800/80 dark:bg-slate-900/50 space-y-2.5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Nama Siswa</span>
                        <span className="text-xs font-extrabold text-slate-900 dark:text-white text-right max-w-[220px] truncate">
                          {pendingSavePayload?.full_name || '-'}
                        </span>
                      </div>
                      {(pendingSavePayload?.nis || pendingSavePayload?.nisn) && (
                        <div className="flex items-center justify-between border-t border-slate-200/60 pt-2 dark:border-slate-800/60">
                          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">NIS / NISN</span>
                          <span className="font-mono text-xs font-bold text-slate-800 dark:text-slate-200">
                            {pendingSavePayload?.nis || '-'} / {pendingSavePayload?.nisn || '-'}
                          </span>
                        </div>
                      )}
                      {pendingSavePayload?.metadata?.unit_pendidikan && (
                        <div className="flex items-center justify-between border-t border-slate-200/60 pt-2 dark:border-slate-800/60">
                          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Unit Sekolah</span>
                          <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                            {pendingSavePayload.metadata.unit_pendidikan}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Notice Box */}
                    <div
                      className={cn(
                        "rounded-2xl border p-3.5 text-xs font-semibold leading-relaxed flex items-start gap-2.5",
                        isEdit
                          ? "border-amber-200 bg-amber-50/70 text-amber-900 dark:border-amber-900/40 dark:bg-amber-950/30 dark:text-amber-300"
                          : "border-emerald-200 bg-emerald-50/70 text-emerald-900 dark:border-emerald-900/40 dark:bg-emerald-950/30 dark:text-emerald-300"
                      )}
                    >
                      <div
                        className={cn(
                          "flex size-5 shrink-0 items-center justify-center rounded-lg text-white mt-0.5",
                          isEdit
                            ? "bg-gradient-to-br from-amber-500 to-orange-600"
                            : "bg-gradient-to-br from-emerald-500 to-teal-600"
                        )}
                      >
                        <Sparkles className="size-3 text-white" />
                      </div>
                      <div className="flex-1">
                        {isEdit
                          ? 'Data siswa yang sudah ada akan segera diperbarui di database server dengan informasi terbaru.'
                          : 'Data siswa baru akan tersimpan dan langsung aktif sesuai konfigurasi rombel dan unit sistem.'}
                      </div>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="modal-footer flex items-center justify-between border-t border-slate-100 bg-white px-6 py-4 dark:border-slate-800 dark:bg-slate-950">
                    <button
                      type="button"
                      disabled={isSaving}
                      onClick={() => setShowSaveConfirmDialog(false)}
                      className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-br from-rose-500 via-rose-600 to-red-700 text-white px-4 py-2.5 text-xs font-extrabold border border-rose-300/40 transition-all duration-200 hover:scale-[1.03] active:scale-95 cursor-pointer disabled:opacity-50"
                    >
                      <div className="flex size-4 items-center justify-center rounded-md bg-white/20 text-white">
                        <X className="size-3" strokeWidth={2.2} />
                      </div>
                      <span>Batal</span>
                    </button>

                    <button
                      type="button"
                      disabled={isSaving}
                      onClick={handleConfirmSave}
                      className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700 text-white px-5 py-2.5 text-xs font-extrabold border border-emerald-300/40 hover:scale-[1.03] transition-all duration-200 active:scale-95 disabled:opacity-50 cursor-pointer shadow-md shadow-emerald-500/20"
                    >
                      {isSaving ? (
                        <span className="size-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      ) : (
                        <div className="flex size-4 items-center justify-center rounded-md bg-white/20 text-white">
                          <Save className="size-3 text-white" strokeWidth={2.2} />
                        </div>
                      )}
                      <span>
                        {isSaving
                          ? isEdit ? 'Memperbarui...' : 'Menyimpan...'
                          : isEdit ? 'Ya, Perbarui Data' : 'Ya, Simpan Data'}
                      </span>
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* MODAL: KONFIRMASI HAPUS DATA SISWA HARMONISASI TAILGRIDS */}
        <AnimatePresence>
          {deleteTarget && (
            <div
              className="overlay modal fixed inset-0 z-[70] flex items-center justify-center p-3 sm:p-5 bg-slate-950/70 backdrop-blur-md"
              role="dialog"
              aria-modal="true"
              aria-labelledby="student-delete-confirm-title"
              tabIndex={-1}
              onMouseDown={(e) => {
                if (e.target === e.currentTarget && !isDeleting) setDeleteTarget(null)
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
                          id="student-delete-confirm-title"
                          className="modal-title text-sm sm:text-base font-black text-slate-900 dark:text-white flex items-center gap-2"
                        >
                          <span>Hapus Data Siswa</span>
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
                      disabled={isDeleting}
                      onClick={() => setDeleteTarget(null)}
                      aria-label="Tutup dialog konfirmasi"
                      className="size-9 flex items-center justify-center rounded-2xl bg-gradient-to-br from-rose-500 via-rose-600 to-red-700 text-white hover:scale-105 active:scale-95 transition-all duration-200 shadow-md shadow-rose-500/20 cursor-pointer disabled:opacity-50"
                    >
                      <X className="size-4 text-white" strokeWidth={2.25} />
                    </button>
                  </div>

                  {/* Body */}
                  <div className="modal-body p-6 space-y-4 text-slate-700 dark:text-slate-200">
                    {/* Student Identity Card */}
                    <div className="rounded-2xl border border-rose-100/90 bg-rose-50/40 p-4 dark:border-rose-900/40 dark:bg-rose-950/20 space-y-3">
                      <div className="flex items-center gap-3">
                        <PersonAvatar
                          src={deleteTarget.foto || deleteTarget.foto_url}
                          name={deleteTarget.nama || deleteTarget.full_name}
                          size="sm"
                          className="border-2 border-rose-300 shadow-sm"
                        />
                        <div className="min-w-0 flex-1">
                          <h4 className="text-sm font-black text-slate-900 dark:text-white truncate">
                            {deleteTarget.nama || deleteTarget.full_name || '-'}
                          </h4>
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            NIS: {deleteTarget.nis || '-'} · NISN: {deleteTarget.nisn || '-'}
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 pt-2 border-t border-rose-100/80 dark:border-rose-900/30 text-xs">
                        <div>
                          <span className="text-slate-400 block text-[10px] font-semibold">Unit Sekolah</span>
                          <span className="font-bold text-slate-800 dark:text-slate-200">{deleteTarget.unit || '-'}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[10px] font-semibold">Kelas</span>
                          <span className="font-bold text-slate-800 dark:text-slate-200">{deleteTarget.kelas || '-'}</span>
                        </div>
                      </div>
                    </div>

                    {/* Danger Notice Box */}
                    <div className="rounded-2xl border border-rose-200/80 bg-rose-50/70 p-3.5 text-xs font-semibold text-rose-900 dark:border-rose-900/50 dark:bg-rose-950/30 dark:text-rose-300 leading-relaxed flex items-start gap-2.5">
                      <div className="flex size-5 shrink-0 items-center justify-center rounded-lg text-white bg-gradient-to-br from-rose-500 to-red-600 mt-0.5">
                        <AlertTriangle className="size-3 text-white" />
                      </div>
                      <div className="flex-1">
                        Data siswa <strong>"{deleteTarget.nama || deleteTarget.full_name}"</strong> beserta seluruh riwayat absensi, nilai, dan relasi terkait akan dihapus secara permanen dari server.
                      </div>
                    </div>

                    {/* Checkbox Konfirmasi */}
                    <label className="flex items-center gap-2.5 cursor-pointer select-none pt-1">
                      <input
                        type="checkbox"
                        checked={hasConfirmedDeleteCheck}
                        onChange={(e) => setHasConfirmedDeleteCheck(e.target.checked)}
                        className="size-4 rounded-md border-rose-300 text-rose-600 focus:ring-rose-500 accent-rose-600"
                      />
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                        Saya memahami konsekuensi penghapusan permanen ini
                      </span>
                    </label>
                  </div>

                  {/* Footer */}
                  <div className="modal-footer flex items-center justify-between border-t border-slate-100 bg-white px-6 py-4 dark:border-slate-800 dark:bg-slate-950">
                    <button
                      type="button"
                      disabled={isDeleting}
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
                      disabled={isDeleting || !hasConfirmedDeleteCheck}
                      onClick={handleConfirmDelete}
                      className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-br from-rose-500 via-rose-600 to-red-700 text-white px-5 py-2.5 text-xs font-extrabold border border-rose-300/40 hover:scale-[1.03] transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shadow-md shadow-rose-500/25"
                    >
                      {isDeleting ? (
                        <>
                          <Sparkles className="size-3.5 animate-spin" />
                          <span>Menghapus...</span>
                        </>
                      ) : (
                        <>
                          <Trash2 className="size-3.5" />
                          <span>Hapus Permanen</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
        </MasterDataPage>
      </motion.div>

      {/* Toast Stack Notification Container */}
      <ToastStack items={toasts} onDismiss={dismissToast} />
    </PageContainer>
  )
}
