import { useMemo, useState } from 'react'
import { cn } from '../lib/utils'
import { useDebounce } from '../hooks/useDebounce'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import {
 AlertTriangle,
 ArrowLeft,
 ArrowRight,
 Award,
 Briefcase,
 Building2,
 Calendar,
 Check,
 CheckCircle2,
 ChevronDown,
 Compass,
 Download,
 Eye,
 FileCheck,
 FileSpreadsheet,
 FileText,
 GraduationCap,
 Hash,
 Info,
 Mail,
 MapPin,
 Pencil,
 Phone,
 Plus,
 Power,
 Printer,
 RefreshCcw,
 Save,
 School,
 ShieldCheck,
 Sparkles,
 Tag,
 Trash2,
 Upload,
 UserCheck,
 UserPlus,
 UsersRound,
 X,
 XCircle,
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
import { downloadFileFromApi } from '../utils/exportUtils'
import { PersonIdentityCell } from '../components/ui/PersonIdentityCell'
import ActionDropdown from '../components/app/ActionDropdown'
import { useAuthStore } from '../stores/authStore'
import { usePengaturanStore } from '../stores/pengaturanStore'
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
import { useProvinsiList, useKotaOptions, useKecamatanOptions, useKelurahanOptions } from '../hooks/useWilayah'
import { getProvinsiList, getKotaOptions, getKecamatanOptions, getKelurahanOptions } from '../components/siswa/wilayahData'
import SearchableRegionInput from '../components/common/SearchableRegionInput'
import { getPostalCode, enrichKelurahanWithPostal } from '../utils/postalCodeHelper'
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
 address: '', city: 'Padang', province: 'Sumatera Barat', district: '', subdistrict: '', postal_code: '',
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
 district: meta.district || meta.kecamatan || '',
 subdistrict: meta.subdistrict || meta.kelurahan || '',
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
 total_siswa_laki: item?.total_siswa_laki ?? 0,
 total_siswa_perempuan: item?.total_siswa_perempuan ?? 0,
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
 district: form.district, subdistrict: form.subdistrict,
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
  )
}

// ── DEFINISI TONE WARNA KARTU KPI MODERN (TAILGRIDS SPEC) ──
const MODERN_CARD_TONES = {
  emerald: {
    card: 'border-emerald-300/70 bg-gradient-to-br from-emerald-50 via-teal-50/60 to-white hover:border-emerald-400 dark:border-emerald-700/50 dark:from-emerald-950/40 dark:via-teal-950/20 dark:to-slate-900',
    glow: 'bg-emerald-400/20 group-hover:bg-emerald-400/30',
    iconBox: 'bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-sm shadow-emerald-500/30',
    tag: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300',
    title: 'text-emerald-700 dark:text-emerald-400',
    val: 'text-slate-900 dark:text-white',
    sub: 'text-slate-600 dark:text-slate-400',
    cta: 'text-emerald-700 dark:text-emerald-400',
  },
  amber: {
    card: 'border-amber-300/70 bg-gradient-to-br from-amber-50 via-orange-50/60 to-white hover:border-amber-400 dark:border-amber-700/50 dark:from-amber-950/40 dark:via-orange-950/20 dark:to-slate-900',
    glow: 'bg-amber-400/20 group-hover:bg-amber-400/30',
    iconBox: 'bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-sm shadow-amber-500/30',
    tag: 'bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-300',
    title: 'text-amber-700 dark:text-amber-400',
    val: 'text-slate-900 dark:text-white',
    sub: 'text-slate-600 dark:text-slate-400',
    cta: 'text-amber-700 dark:text-amber-400',
  },
  blue: {
    card: 'border-sky-300/70 bg-gradient-to-br from-sky-50 via-blue-50/60 to-white hover:border-sky-400 dark:border-sky-700/50 dark:from-sky-950/40 dark:via-blue-950/20 dark:to-slate-900',
    glow: 'bg-sky-400/20 group-hover:bg-sky-400/30',
    iconBox: 'bg-gradient-to-br from-sky-500 to-blue-600 text-white shadow-sm shadow-sky-500/30',
    tag: 'bg-sky-100 text-sky-800 dark:bg-sky-900/60 dark:text-sky-300',
    title: 'text-sky-700 dark:text-sky-400',
    val: 'text-slate-900 dark:text-white',
    sub: 'text-slate-600 dark:text-slate-400',
    cta: 'text-sky-700 dark:text-sky-400',
  },
  teal: {
    card: 'border-teal-300/70 bg-gradient-to-br from-teal-50 via-emerald-50/60 to-white hover:border-teal-400 dark:border-teal-700/50 dark:from-teal-950/40 dark:via-emerald-950/20 dark:to-slate-900',
    glow: 'bg-teal-400/20 group-hover:bg-teal-400/30',
    iconBox: 'bg-gradient-to-br from-teal-500 to-emerald-600 text-white shadow-sm shadow-teal-500/30',
    tag: 'bg-teal-100 text-teal-800 dark:bg-teal-900/60 dark:text-teal-300',
    title: 'text-teal-700 dark:text-teal-400',
    val: 'text-slate-900 dark:text-white',
    sub: 'text-slate-600 dark:text-slate-400',
    cta: 'text-teal-700 dark:text-teal-400',
  },
}

function ModernKpiCard({ icon: Icon, label, subtext, value, tag, ctaText = 'Rincian Unit', tone = 'emerald', onClick }) {
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
            <div className={`flex h-10 w-10 items-center justify-center rounded-xl text-white ${t.iconBox}`}>
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
          {value ?? '0'}
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

// ════════════════════════════════════════════════════════════════════════════
// Main Page Component
// ════════════════════════════════════════════════════════════════════════════
export default function EducationUnitsPage() {
 const queryClient = useQueryClient()
 const { items: toasts, push: pushToast, dismiss: dismissToast } = useNotifications()

 // ── Auth & Permissions ──────────────────────────────────────────────────
 const user = useAuthStore(state => state.user)
 const sitePengaturan = usePengaturanStore(state => state.pengaturan)
 const roles = Array.isArray(user?.roles) ? user.roles : []
 const permissions = Array.isArray(user?.permissions) ? user.permissions : []
 const isSuperAdmin = Boolean(user) && (Boolean(user?.is_superadmin) || roles.some(r => String(r).toLowerCase().replace(/[\s_-]+/g, '') === 'superadmin'))
 const canCreate = Boolean(user) && (isSuperAdmin || permissions.includes('unit.create') || permissions.includes('sistem.master_data'))
 const canUpdate = Boolean(user) && (isSuperAdmin || permissions.includes('unit.update') || permissions.includes('sistem.master_data'))
 const canDelete = Boolean(user) && (isSuperAdmin || permissions.includes('unit.delete') || permissions.includes('sistem.master_data'))

 // ── Filter & Pagination State ───────────────────────────────────────────
 const [search, setSearch] = useState('')
 const debouncedSearch = useDebounce(search, 350)
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
 const { data: apiKecList = [], isLoading: isKecLoading } = useKecamatanOptions(formData.city, formData.province)
 const { data: apiKelList = [], isLoading: isKelLoading } = useKelurahanOptions(formData.district, formData.city, formData.province)

 const provList = useMemo(() => {
 return apiProvList && apiProvList.length > 0 ? apiProvList : getProvinsiList()
 }, [apiProvList])

 const kotaList = useMemo(() => {
 return apiKotaList && apiKotaList.length > 0 ? apiKotaList : getKotaOptions(formData.province)
 }, [apiKotaList, formData.province])

 const kecList = useMemo(() => {
 return apiKecList && apiKecList.length > 0 ? apiKecList : getKecamatanOptions(formData.city)
 }, [apiKecList, formData.city])

 const kelList = useMemo(() => {
 return apiKelList && apiKelList.length > 0 ? apiKelList : getKelurahanOptions(formData.district)
 }, [apiKelList, formData.district])

 const kelListWithOptions = useMemo(() => {
 return enrichKelurahanWithPostal(kelList, formData.district, formData.city, formData.province)
 }, [kelList, formData.district, formData.city, formData.province])


 // ── Main List Query ─────────────────────────────────────────────────────
 const { data, isLoading, isError, refetch } = useQuery({
 queryKey: ['education-units', page, perPage, debouncedSearch, selectedTypeFilter, selectedCityFilter, selectedStatusFilter],
 queryFn: () => educationUnitService.getDaftar({
 page,
 per_page: perPage,
 search: debouncedSearch || undefined,
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
 per_page: data?.per_page ?? 10,
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
 santriwan: u.total_siswa_laki ?? 0,
 santriwati: u.total_siswa_perempuan ?? 0,
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
 const sL = u.total_siswa_laki ?? 0
 const sP = u.total_siswa_perempuan ?? 0
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
 const orgName = (sitePengaturan?.school_name || sitePengaturan?.application_name || '').trim()
 printCleanTable({
 title,
 subtitle: `${orgName ? orgName + ' · ' : ''}Total Terdaftar: ${items.length} Unit Sekolah · Mode: ${mode === 'pegawai' ? 'Statistik Pegawai & Guru' : mode === 'siswa' ? 'Statistik Siswa & Santri' : 'Data Master Unit Lengkap'}`,
 headers,
 rows,
 foundationName: orgName,
 systemLogo: sitePengaturan?.logo_url,
 })
 }

 const handleDownloadPdfTable = (mode = printScopeMode) => {
 const { title, filename, headers, rows } = getPrintPayload(mode)
 const orgName = (sitePengaturan?.school_name || sitePengaturan?.application_name || '').trim()
 downloadPdfTable({
 title,
 filename,
 subtitle: `${orgName ? orgName + ' · ' : ''}Total Terdaftar: ${items.length} Unit Sekolah · Mode: ${mode === 'pegawai' ? 'Statistik Pegawai & Guru' : mode === 'siswa' ? 'Statistik Siswa & Santri' : 'Data Master Unit Lengkap'}`,
 headers,
 rows,
 foundationName: orgName,
 systemLogo: sitePengaturan?.logo_url,
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
 try { const res = await api.get(`/education-units/${detailUnit.id}`); return res.data?.data || res.data || {} }
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
 pushToast('Berhasil Dihapus', 'Unit pendidikan berhasil dihapus dari sistem.', 'success')
 setDeleteTarget(null)
 },
 onError: err => {
 const msg = err?.response?.data?.message || 'Terjadi kesalahan saat menghapus.'
 pushToast('Gagal Menghapus', msg, 'error')
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
 const headers = ['Kode Unit', 'Nama Unit Pendidikan', 'Jenjang', 'NPSN', 'Alamat', 'Kota', 'Provinsi', 'Nama Pimpinan', 'Email', 'No Telepon']
 const sample = ['UNIT-001', 'SDIT Dar el-Iman 1', 'SDIT', '10304567', 'Jl. Gunung Juaro No. 1', 'Padang', 'Sumatera Barat', 'Ustadz Ahmad, S.Pd', 'sdit1@dareliman.sch.id', '0751-123456']

 const csvContent = [
 headers.join(','),
 sample.map(val => `"${val}"`).join(','),
 ].join('\n')

 const blob = new Blob([`\uFEFF${csvContent}`], { type: 'text/csv;charset=utf-8;' })
 const url = URL.createObjectURL(blob)
 const a = document.createElement('a')
 a.href = url
 a.download = format === 'xlsx' ? 'Template_Import_Unit.csv' : 'Template_Import_Unit.csv'
 a.click()
 URL.revokeObjectURL(url)
 }

 const handleFileSelect = e => {
 const file = e.target.files?.[0]
 if (!file) return
 setImportFile(file)
 setImportedData([])
 setImportPreviewData([])

 const ext = file.name.split('.').pop()?.toLowerCase()
 if (ext === 'xlsx' || ext === 'xls') {
 // Berkas biner Excel: JANGAN dibaca dengan FileReader.readAsText agar biner ZIP (PK!) tidak rusak.
 // Berkas akan dikirim via FormData dan diparsing native oleh PhpOffice\PhpSpreadsheet di backend.
 setImportPreviewData([
 {
 kode: '(Auto)',
 nama: file.name,
 tingkat: ext.toUpperCase(),
 status: 'Siap Impor',
 },
 ])
 return
 }

 // Parsing aman untuk berkas CSV
 const reader = new FileReader()
 reader.onload = () => {
 const content = String(reader.result || '').replace(/^\uFEFF/, '')
 const lines = content.split(/\r?\n/).filter(line => line.trim().length > 0)
 if (lines.length <= 1) return

 const delimiter = lines[0].includes(';') && !lines[0].includes(',') ? ';' : ','
 const parseCsvLine = line => {
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

 const headerRow = parseCsvLine(lines[0]).map(h => h.toLowerCase().replace(/[\s_\-.:/]/g, ''))
 const findCol = keys => headerRow.findIndex(h => keys.includes(h))

 const idxKode = findCol(['kode', 'kodeunit', 'code', 'unitcode'])
 const idxNama = findCol(['nama', 'namaunit', 'namaunitpendidikan', 'name', 'unitname'])
 const idxTingkat = findCol(['jenjang', 'tingkat', 'level', 'jenjangpendidikan'])
 const idxNpsn = findCol(['npsn'])

 const dataLines = lines.slice(1)
 const rowsData = dataLines.map(line => {
 const cols = parseCsvLine(line)
 const kode = idxKode !== -1 ? (cols[idxKode] || '') : (cols[1] || cols[0] || '')
 const nama = idxNama !== -1 ? (cols[idxNama] || '') : (cols[2] || cols[1] || '')
 const tingkat = idxTingkat !== -1 ? (cols[idxTingkat] || '') : (cols[3] || cols[2] || '')
 const npsn = idxNpsn !== -1 ? (cols[idxNpsn] || '') : (cols[4] || '')

 return {
 kode,
 nama,
 tingkat,
 npsn,
 status: nama ? 'Valid' : 'Tidak valid',
 }
 })

 setImportPreviewData(rowsData.filter(r => r.nama || r.kode))
 }
 reader.readAsText(file)
 }

 const handleProcessImport = async () => {
 if (!importFile) return
 setIsImporting(true)
 try {
 const formData = new FormData()
 formData.append('file', importFile)
 const res = await educationUnitService.prosesImport(formData)
 const resData = res?.data || res || {}
 setIsImporting(false)
 setImportPreviewData([])
 setImportFile(null)
 setShowImportModal(false)
 queryClient.invalidateQueries({ queryKey: ['education-units'] })
 pushToast(
 'Import Berhasil',
 `Data unit pendidikan berhasil diimpor. Berhasil: ${resData.berhasil || 0}, Duplikat/Skip: ${resData.duplikat || 0}, Gagal: ${resData.gagal || 0}`,
 resData.gagal > 0 && resData.berhasil === 0 ? 'error' : 'success'
 )
 } catch (err) {
 setIsImporting(false)
 const msg = err?.response?.data?.message || err.message || 'Gagal memproses impor unit pendidikan.'
 pushToast('Import Gagal', msg, 'error')
 }
 }

 // ── Export Handler ─────────────────────────────────────────────────────
 const handleProcessExport = async () => {
 if (exportFormat === 'pdf') {
 setShowExportModal(false)
 handleDownloadPdfTable(printScopeMode)
 pushToast('Export Berhasil', 'Dokumen PDF unit pendidikan siap dicetak atau diunduh.', 'success')
 return
 }
 setShowExportModal(false)

 await downloadFileFromApi(
 '/education-units/export',
 {
 search: search || undefined,
 level: selectedTypeFilter || undefined,
 city: selectedCityFilter || undefined,
 status: selectedStatusFilter || undefined,
 },
 exportFormat,
 'Data_Unit_Pendidikan'
 )
 pushToast('Export Berhasil', `Data unit pendidikan berhasil diexport ke format .${exportFormat.toUpperCase()}.`, 'success')
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
 className="w-full py-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all hover:from-emerald-700 hover:to-teal-700 mt-2 cursor-pointer"
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
 { label: 'Master Data', to: '/dashboard/master/unit-pendidikan' },
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
 <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700 text-white shadow-xl border border-emerald-300/40 dark:from-emerald-400 dark:via-emerald-500 dark:to-teal-600">
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

      {/* ── KPI Summary Cards (ModernKpiCard with MODERN_CARD_TONES) ── */}
      <motion.div variants={itemVariants}>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <ModernKpiCard
            icon={Building2}
            label="Total Unit"
            subtext="Rincian seluruh unit sekolah & ponpes"
            value={isLoading ? '...' : Number(totalUnitCount).toLocaleString('id-ID')}
            tag={isLoading ? '...' : `${totalUnitCount} Unit`}
            ctaText="Rincian Unit"
            tone="emerald"
            onClick={() => setActiveKpiModal('total_unit')}
          />
          <ModernKpiCard
            icon={GraduationCap}
            label="Total Siswa"
            subtext="Distribusi santri & murid aktif"
            value={isLoading ? '...' : Number(totalSiswaCount).toLocaleString('id-ID')}
            tag={isLoading ? '...' : `${totalSiswaCount} Siswa`}
            ctaText="Distribusi Siswa"
            tone="amber"
            onClick={() => setActiveKpiModal('total_siswa')}
          />
          <ModernKpiCard
            icon={UsersRound}
            label="Tenaga Pendidik"
            subtext="Komposisi dewan guru & asatidz"
            value={isLoading ? '...' : Number(totalGuruCount).toLocaleString('id-ID')}
            tag={isLoading ? '...' : `${totalGuruCount} Guru`}
            ctaText="Komposisi Guru"
            tone="blue"
            onClick={() => setActiveKpiModal('total_guru')}
          />
          <ModernKpiCard
            icon={CheckCircle2}
            label="Unit Aktif"
            subtext="Status operasional berjalan lancar"
            value={isLoading ? '...' : Number(activeUnitCount).toLocaleString('id-ID')}
            tag={isLoading ? '...' : `${activeUnitCount} Aktif`}
            ctaText="Status Operasional"
            tone="teal"
            onClick={() => setActiveKpiModal('unit_aktif')}
          />
        </div>
      </motion.div>

 {/* ── Visual Analytics Section (Grafik Murid/Santri & Grafik Perbandingan Guru) ── */}
 <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-stretch">
 {/* Grafik 1: Jumlah Murid / Santri per Unit */}
 <article className="relative overflow-hidden rounded-[22px] border-2 border-emerald-300 dark:border-emerald-700/80 bg-white p-5 sm:p-6 shadow-md shadow-emerald-500/10 dark:bg-[#1B2433] flex flex-col justify-between h-full">
 <div>
 <div className="flex items-center justify-between mb-4 pb-3.5 border-b border-emerald-200/90 dark:border-emerald-800/60">
 <div className="flex items-center gap-3">
 <div className="flex size-10 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500 via-amber-600 to-orange-700 text-white shadow-md shadow-amber-500/20 shrink-0">
 <GraduationCap className="size-5 text-white" />
 </div>
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
 <div className="pt-3 border-t border-emerald-200/80 dark:border-emerald-800/60 flex items-center justify-between text-[11px] font-semibold text-slate-500">
 <span>Distribusi berdasarkan jenjang sekolah</span>
 <span className="text-amber-600 dark:text-amber-400 font-bold">Terupdate Otomatis</span>
 </div>
 </article>

 {/* Grafik 2: Perbandingan Guru per Unit */}
 <article className="relative overflow-hidden rounded-[22px] border-2 border-emerald-300 dark:border-emerald-700/80 bg-white p-5 sm:p-6 shadow-md shadow-emerald-500/10 dark:bg-[#1B2433] flex flex-col justify-between h-full">
 <div>
 <div className="flex items-center justify-between mb-4 pb-3.5 border-b border-emerald-200/90 dark:border-emerald-800/60">
 <div className="flex items-center gap-3">
 <div className="flex size-10 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700 text-white shadow-md shadow-emerald-500/20 shrink-0">
 <UsersRound className="size-5 text-white" />
 </div>
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
 <div className="pt-3 border-t border-emerald-200/80 dark:border-emerald-800/60 flex items-center justify-between text-[11px] font-semibold text-slate-500">
 <span>Proporsi guru pengajar per unit</span>
 <span className="text-emerald-600 dark:text-emerald-400 font-bold">100% Terverifikasi</span>
 </div>
 </article>
 </motion.div>

 {/* ── AppDataTable with Toolbar ── */}
 <motion.div variants={itemVariants}>
 <AppDataTable
 title="Data Unit Pendidikan"
 icon={Building2}
 iconClassName="bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700 border border-emerald-300/40"
 description="Daftar unit sesuai filter dan kewenangan pengguna."
 actions={
 <div className="flex flex-wrap items-center gap-2">
 {/* Tombol Cetak Laporan (Vivid Indigo / Purple Squircle) */}
 <div className="group relative inline-flex">
 <button
 type="button"
 title="Cetak & Download Data Unit"
 aria-label="Cetak & Download Data Unit"
 className="flex size-10 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 via-indigo-600 to-violet-700 text-white border border-indigo-300/40 hover:scale-105 transition-all duration-200 active:scale-95 cursor-pointer"
 onClick={() => setPrintOptionModalOpen(true)}
 >
 <Printer className="size-5 text-white" strokeWidth={2.2} />
 </button>
 <div className="pointer-events-none absolute top-full left-1/2 mt-2 -translate-x-1/2 opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 transition-all duration-200 ease-out z-50 whitespace-nowrap rounded-lg bg-slate-900 px-2.5 py-1 text-[11px] font-bold text-white shadow-xl dark:bg-slate-100 dark:text-slate-900">
 <div className="absolute bottom-full left-1/2 -mb-1 -translate-x-1/2 border-4 border-transparent border-b-slate-900 dark:border-b-slate-100" />
 Cetak & Export
 </div>
 </div>

 {/* Import Button (Vivid Sky Blue Squircle) */}
 <div className="group relative inline-flex">
 <button
 type="button"
 title="Import Data Unit"
 aria-label="Import Data Unit"
 className="flex size-10 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-400 via-sky-500 to-blue-600 text-white border border-sky-300/40 hover:scale-105 transition-all duration-200 active:scale-95 cursor-pointer"
 onClick={() => setShowImportModal(true)}
 >
 <Upload1 className="size-5 text-white" strokeWidth={2.2} />
 </button>
 <div className="pointer-events-none absolute top-full left-1/2 mt-2 -translate-x-1/2 opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 transition-all duration-200 ease-out z-50 whitespace-nowrap rounded-lg bg-slate-900 px-2.5 py-1 text-[11px] font-bold text-white shadow-xl dark:bg-slate-100 dark:text-slate-900">
 <div className="absolute bottom-full left-1/2 -mb-1 -translate-x-1/2 border-4 border-transparent border-b-slate-900 dark:border-b-slate-100" />
 Import Data
 </div>
 </div>

 {/* Export / Download Button (Vivid Amber / Orange Squircle) */}
 <div className="group relative inline-flex">
 <button
 type="button"
 title="Export Data Unit"
 aria-label="Export Data Unit"
 className="flex size-10 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 via-amber-500 to-orange-600 text-white border border-amber-300/40 hover:scale-105 transition-all duration-200 active:scale-95 cursor-pointer"
 onClick={() => setShowExportModal(true)}
 >
 <Download1 className="size-5 text-white" strokeWidth={2.2} />
 </button>
 <div className="pointer-events-none absolute top-full left-1/2 mt-2 -translate-x-1/2 opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 transition-all duration-200 ease-out z-50 whitespace-nowrap rounded-lg bg-slate-900 px-2.5 py-1 text-[11px] font-bold text-white shadow-xl dark:bg-slate-100 dark:text-slate-900">
 <div className="absolute bottom-full left-1/2 -mb-1 -translate-x-1/2 border-4 border-transparent border-b-slate-900 dark:border-b-slate-100" />
 Export Data
 </div>
 </div>

 {/* Tambah Unit Button (Vivid Emerald / Teal Squircle) */}
 <div className="group relative inline-flex">
 <button
 type="button"
 title="Tambah Unit Baru"
 aria-label="Tambah Unit Baru"
 className="flex size-10 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700 text-white border border-emerald-300/40 hover:scale-105 transition-all duration-200 active:scale-95 cursor-pointer"
 onClick={openAddModal}
 >
 <Plus className="size-5 text-white" strokeWidth={2.5} />
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
 className="h-10 cursor-pointer appearance-none rounded-xl border border-slate-200 bg-white pl-3.5 pr-8 text-xs font-semibold text-slate-700 shadow-2xs transition-all hover:border-slate-300 focus:border-emerald-500 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-slate-600"
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
 className="h-10 cursor-pointer appearance-none rounded-xl border border-slate-200 bg-white pl-3.5 pr-8 text-xs font-semibold text-slate-700 shadow-2xs transition-all hover:border-slate-300 focus:border-emerald-500 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-slate-600"
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
 className="h-10 cursor-pointer appearance-none rounded-xl border border-slate-200 bg-white pl-3.5 pr-8 text-xs font-semibold text-slate-700 shadow-2xs transition-all hover:border-slate-300 focus:border-emerald-500 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-slate-600"
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
 className="h-10 cursor-pointer appearance-none rounded-xl border border-slate-200 bg-white pl-3.5 pr-8 text-xs font-semibold text-slate-700 shadow-2xs transition-all hover:border-slate-300 focus:border-emerald-500 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-slate-600"
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
 actionColumnLabel=""
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
 className="overlay modal fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/70 backdrop-blur-md"
 onMouseDown={e => { if (e.target === e.currentTarget) setDetailUnit(null) }}
 >
 <motion.div
 initial={{ opacity: 0, scale: 0.94, y: 14 }}
 animate={{ opacity: 1, scale: 1, y: 0 }}
 exit={{ opacity: 0, scale: 0.95, y: 10 }}
 transition={{ type: 'spring', stiffness: 400, damping: 28 }}
 className="modal-dialog font-sans my-auto w-full max-w-2xl"
 >
 <div className="modal-content flex max-h-[calc(100dvh-2rem)] flex-col overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-2xl shadow-emerald-950/20 dark:border-slate-800 dark:bg-[#182232] dark:shadow-black/60">
 {/* Top Accent Gradient Bar */}
 <div className="h-1.5 w-full bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-600 shrink-0" />

 {/* Header */}
 <div className="modal-header flex items-center justify-between border-b border-slate-100 bg-white px-6 py-4.5 dark:border-slate-800 dark:bg-slate-950">
 <div className="flex items-center gap-3">
 <div className="flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700 text-white shadow-md shadow-emerald-500/20 border border-emerald-300/30 shrink-0">
 <Building2 className="h-5 w-5 text-white" strokeWidth={2.25} />
 </div>
 <div>
 <h3 id="edu-unit-detail-title" className="modal-title text-sm sm:text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
 <span>{detailUnit.name || 'Detail Unit Pendidikan'}</span>
 <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-800 border border-emerald-200/80 dark:bg-emerald-950/60 dark:text-emerald-400 dark:border-emerald-800/60">
 <Sparkles className="size-3" />
 Detail Unit
 </span>
 </h3>
 <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
 {[detailUnit.unit_type, detailUnit.city, detailUnit.province].filter(Boolean).join(' · ')}
 </p>
 </div>
 </div>
 <button
 type="button"
 onClick={() => setDetailUnit(null)}
 aria-label="Tutup detail unit"
 className="size-9 flex items-center justify-center rounded-2xl bg-gradient-to-br from-rose-500 via-rose-600 to-red-700 text-white hover:scale-105 active:scale-95 transition-all duration-200 shadow-md shadow-rose-500/20 cursor-pointer"
 >
 <X className="size-4 text-white" strokeWidth={2.25} />
 </button>
 </div>

 {/* Body */}
 <div className="modal-body min-h-0 flex-1 overflow-y-auto p-5 text-sm space-y-5">
 {/* Hero Card */}
 <div className="flex items-center gap-4 rounded-2xl border-2 border-emerald-300/60 bg-gradient-to-r from-emerald-50/50 via-teal-50/30 to-emerald-50/50 p-4 dark:border-emerald-800/60 dark:bg-slate-800/40">
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
 <div className="flex gap-1.5 overflow-x-auto rounded-2xl border-2 border-emerald-200/70 bg-emerald-50/40 p-1.5 dark:border-emerald-900/50 dark:bg-slate-900/40">
 {['Informasi', 'Statistik', 'Guru', 'Siswa', 'Kelas'].map(tab => (
 <button
 key={tab}
 type="button"
 onClick={() => setActiveDetailTab(tab)}
 className={`flex-1 rounded-xl px-3.5 py-2 text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
 activeDetailTab === tab
 ? 'bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700 text-white shadow-md shadow-emerald-500/20'
 : 'text-slate-600 hover:text-slate-900 hover:bg-white/60 dark:text-slate-400 dark:hover:text-slate-200'
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
 {detailUnit.address || 'Alamat Belum Dilengkapi'}{detailUnit.subdistrict ? `, Kel. ${detailUnit.subdistrict}` : ''}{detailUnit.district ? `, Kec. ${detailUnit.district}` : ''}{detailUnit.city ? `, Kota/Kab. ${detailUnit.city}` : ''}{detailUnit.province ? `, Prov. ${detailUnit.province}` : ''}{detailUnit.postal_code ? ` ${detailUnit.postal_code}` : ''}
 </p>
 </div>

 {/* Gender Breakdown Siswa (Laki-laki & Perempuan) */}
 {(() => {
 const totalS = Number(unitStatsQuery.data?.total_siswa ?? detailUnit.total_siswa ?? 0)
 const sL = Number(unitStatsQuery.data?.total_siswa_laki ?? detailUnit.total_siswa_laki ?? 0)
 const sP = Number(unitStatsQuery.data?.total_siswa_perempuan ?? detailUnit.total_siswa_perempuan ?? 0)
 const pctL = totalS > 0 ? Math.round((sL / totalS) * 100) : 0
 const pctP = totalS > 0 ? Math.round((sP / totalS) * 100) : 0

 return (
 <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-4 dark:border-slate-700 dark:bg-slate-900/40 space-y-3">
 <div className="flex items-center justify-between">
 <h4 className="text-xs font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5">
 <GraduationCap className="size-4 text-amber-500" />
 Komposisi Gender Peserta Didik
 </h4>
 <span className="text-[11px] font-bold text-amber-600 dark:text-amber-400">
 Total: {totalS.toLocaleString('id-ID')} Siswa
 </span>
 </div>
 <div className="grid grid-cols-2 gap-3">
 <div className="rounded-xl border border-sky-200/80 bg-sky-50/70 p-3 dark:border-sky-900/40 dark:bg-sky-950/30">
 <p className="text-[10px] font-bold uppercase tracking-wide text-sky-700 dark:text-sky-300">Siswa Laki-laki (Santriwan)</p>
 <p className="mt-1 text-xl font-black text-sky-900 dark:text-sky-100 tabular-nums">
 {sL.toLocaleString('id-ID')}{' '}
 <span className="text-xs font-normal text-sky-600 dark:text-sky-400">
 Siswa ({pctL}%)
 </span>
 </p>
 </div>
 <div className="rounded-xl border border-rose-200/80 bg-rose-50/70 p-3 dark:border-rose-900/40 dark:bg-rose-950/30">
 <p className="text-[10px] font-bold uppercase tracking-wide text-rose-700 dark:text-rose-300">Siswa Perempuan (Santriwati)</p>
 <p className="mt-1 text-xl font-black text-rose-900 dark:text-rose-100 tabular-nums">
 {sP.toLocaleString('id-ID')}{' '}
 <span className="text-xs font-normal text-rose-600 dark:text-rose-400">
 Siswa ({pctP}%)
 </span>
 </p>
 </div>
 </div>
 </div>
 )
 })()}

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
 <div className="modal-footer flex items-center justify-between border-t border-slate-100 bg-slate-50/50 px-6 py-4 dark:border-slate-800 dark:bg-slate-900/30">
 <button
 type="button"
 onClick={() => setDetailUnit(null)}
 className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-br from-rose-500 via-rose-600 to-red-700 text-white px-4 py-2.5 text-xs font-extrabold border border-rose-300/40 transition-all duration-200 hover:scale-[1.03] active:scale-95 cursor-pointer"
 >
 <div className="flex size-5 items-center justify-center rounded-lg bg-white/20 text-white">
 <X className="size-3.5 text-white" strokeWidth={2.2} />
 </div>
 <span>Tutup</span>
 </button>
 {canUpdate && (
 <button
 type="button"
 onClick={() => { const t = detailUnit; setDetailUnit(null); openEditModal(t) }}
 className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-br from-amber-400 via-amber-500 to-orange-600 text-white px-5 py-2.5 text-xs font-extrabold border border-amber-300/40 hover:scale-[1.03] transition-all duration-200 active:scale-95 cursor-pointer"
 >
 <div className="flex size-5 items-center justify-center rounded-lg bg-white/20 text-white">
 <Pencil className="size-3.5 text-white" strokeWidth={2.25} />
 </div>
 <span>Ubah Data Unit</span>
 </button>
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
 className="overlay modal fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/70 backdrop-blur-md"
 onMouseDown={e => { if (e.target === e.currentTarget) setActiveKpiModal(null) }}
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
 <div className="flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700 text-white shadow-md shadow-emerald-500/20 border border-emerald-300/30 shrink-0">
 {activeKpiModal === 'total_unit' && <Building2 className="h-5 w-5 text-white" strokeWidth={2.25} />}
 {activeKpiModal === 'total_siswa' && <GraduationCap className="h-5 w-5 text-white" strokeWidth={2.25} />}
 {activeKpiModal === 'total_guru' && <UsersRound className="h-5 w-5 text-white" strokeWidth={2.25} />}
 {activeKpiModal === 'unit_aktif' && <CheckCircle2 className="h-5 w-5 text-white" strokeWidth={2.25} />}
 </div>
 <div>
 <h3 className="modal-title text-sm sm:text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
 <span>
 {activeKpiModal === 'total_unit' && 'Analisis Total Unit Pendidikan Terdaftar'}
 {activeKpiModal === 'total_siswa' && 'Distribusi Siswa (Santriwan & Santriwati)'}
 {activeKpiModal === 'total_guru' && 'Distribusi Tenaga Pendidik & Guru Aktif'}
 {activeKpiModal === 'unit_aktif' && 'Status Operasional Unit Pendidikan Aktif'}
 </span>
 <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-800 border border-emerald-200/80 dark:bg-emerald-950/60 dark:text-emerald-400 dark:border-emerald-800/60">
 <Sparkles className="size-3" />
 Metrik KPI
 </span>
 </h3>
 <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
 Rincian data agregat berdasarkan unit pendidikan di seluruh jaringan yayasan
 </p>
 </div>
 </div>
 <button
 type="button"
 onClick={() => setActiveKpiModal(null)}
 aria-label="Tutup modal"
 className="size-9 flex items-center justify-center rounded-2xl bg-gradient-to-br from-rose-500 via-rose-600 to-red-700 text-white hover:scale-105 active:scale-95 transition-all duration-200 shadow-md shadow-rose-500/20 cursor-pointer"
 >
 <X className="size-4 text-white" strokeWidth={2.25} />
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
 const sLaki = u.total_siswa_laki ?? 0
 const sPerempuan = u.total_siswa_perempuan ?? 0
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
 <div className="modal-footer flex items-center justify-between border-t border-slate-100 bg-slate-50/50 px-6 py-4 dark:border-slate-800 dark:bg-slate-900/30">
 <span className="text-xs font-semibold text-slate-400 dark:text-slate-500">
 Menampilkan rincian agregat unit pendidikan SIMSIT
 </span>
 <button
 type="button"
 onClick={() => setActiveKpiModal(null)}
 className="inline-flex items-center gap-1.5 rounded-2xl bg-gradient-to-br from-rose-500 via-rose-600 to-red-700 text-white px-4 py-2 text-xs font-extrabold border border-rose-300/40 transition-all duration-200 hover:scale-[1.03] active:scale-95 cursor-pointer"
 >
 <X className="size-4 text-white" />
 <span>Tutup Rincian</span>
 </button>
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
 className="overlay modal fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/70 backdrop-blur-md"
 role="dialog"
 tabIndex={-1}
 aria-modal="true"
 aria-labelledby="edu-unit-form-title"
 onMouseDown={e => { if (e.target === e.currentTarget) closeFormModal() }}
 >
 <motion.div
 initial={{ opacity: 0, scale: 0.94, y: 14 }}
 animate={{ opacity: 1, scale: 1, y: 0 }}
 exit={{ opacity: 0, scale: 0.95, y: 10 }}
 transition={{ type: 'spring', stiffness: 400, damping: 28 }}
 className="modal-dialog font-sans my-auto w-full max-w-2xl"
 >
 <div className="modal-content flex max-h-[calc(100dvh-2rem)] flex-col overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-2xl shadow-emerald-950/20 dark:border-slate-800 dark:bg-[#182232] dark:shadow-black/60">
 {/* Top Accent Gradient Bar */}
 <div className="h-1.5 w-full bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-600 shrink-0" />

 {/* Header */}
 <div className="modal-header flex items-center justify-between border-b border-slate-100 bg-white px-6 py-4.5 dark:border-slate-800 dark:bg-slate-950">
 <div className="flex items-center gap-3">
 <div className={cn(
 "flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-2xl text-white shadow-md shrink-0 border",
 isEditMode
 ? "bg-gradient-to-br from-amber-400 via-amber-500 to-orange-600 border-amber-300/40 shadow-amber-500/20"
 : "bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700 border-emerald-300/40 shadow-emerald-500/20"
 )}>
 {isEditMode ? (
 <Pencil className="h-5 w-5 text-white" strokeWidth={2.25} />
 ) : (
 <School className="h-5 w-5 text-white" strokeWidth={2.25} />
 )}
 </div>
 <div>
 <h3 id="edu-unit-form-title" className="modal-title text-sm sm:text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
 <span>{isEditMode ? 'Edit Unit Pendidikan' : 'Tambah Unit Pendidikan'}</span>
 <span className={cn(
 "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold border",
 isEditMode
 ? "bg-amber-50 text-amber-700 border-amber-200/80 dark:bg-amber-950/60 dark:text-amber-400 dark:border-amber-800/60"
 : "bg-emerald-50 text-emerald-800 border-emerald-200/80 dark:bg-emerald-950/60 dark:text-emerald-400 dark:border-emerald-800/60"
 )}>
 <Sparkles className="size-3" />
 {isEditMode ? 'Update Data' : 'Unit Baru'}
 </span>
 </h3>
 <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
 Langkah {currentStep} dari 4 · {
 currentStep === 1 ? 'Informasi Utama Unit' :
 currentStep === 2 ? 'Alamat & Lokasi Fisik' :
 currentStep === 3 ? 'Kepala Sekolah & SK' :
 'Ringkasan Data & Konfirmasi'
 }
 </p>
 </div>
 </div>
 <button
 type="button"
 onClick={closeFormModal}
 aria-label="Tutup form"
 className="size-9 flex items-center justify-center rounded-2xl bg-gradient-to-br from-rose-500 via-rose-600 to-red-700 text-white hover:scale-105 active:scale-95 transition-all duration-200 shadow-md shadow-rose-500/20 cursor-pointer"
 >
 <X className="size-4 text-white" strokeWidth={2.25} />
 </button>
 </div>

 {/* Step Wizard Indicator */}
 <div className="border-b border-slate-100 bg-slate-50/70 p-2.5 dark:border-slate-800 dark:bg-slate-900/50">
 <div className="grid grid-cols-4 gap-1.5 sm:gap-2">
 {[
 { step: 1, label: 'Info Unit', icon: Building2 },
 { step: 2, label: 'Alamat', icon: MapPin },
 { step: 3, label: 'Pimpinan', icon: UsersRound },
 { step: 4, label: 'Konfirmasi', icon: CheckCircle2 },
 ].map(s => {
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
 <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/60 pb-2">
 <h3 className="text-xs font-extrabold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
 <Building2 className="size-4 text-[#0E5C44] dark:text-[#3FBF75]" />
 Informasi Utama Unit Pendidikan
 </h3>
 <span className="text-[11px] font-semibold text-slate-400">* Wajib diisi</span>
 </div>

 {/* Logo upload */}
 <div className="space-y-1.5">
 <label className="block text-xs font-bold text-slate-700 dark:text-slate-200">Foto / Logo Unit</label>
 {formData.logo_url ? (
 <div className="flex items-center gap-4 rounded-2xl border border-emerald-200 bg-emerald-50/70 p-3.5 dark:border-emerald-900/40 dark:bg-emerald-950/30">
 <img src={formData.logo_url} alt="Logo" className="h-14 w-14 shrink-0 rounded-xl border-2 border-emerald-600 object-cover shadow-xs" />
 <div>
 <p className="text-xs font-extrabold text-slate-800 dark:text-slate-100">Logo unit terpasang</p>
 <button type="button" onClick={() => setFormData(p => ({ ...p, logo_url: '' }))} className="mt-1 text-xs font-bold text-rose-600 hover:underline cursor-pointer">Hapus & Upload Ulang</button>
 </div>
 </div>
 ) : (
 <label className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-emerald-300/80 bg-emerald-50/40 p-6 text-center transition-all hover:border-emerald-500 hover:bg-emerald-50/70 dark:border-emerald-800/60 dark:bg-emerald-950/20 dark:hover:border-emerald-600">
 <div className="mb-2 flex size-11 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700 dark:bg-emerald-900/60 dark:text-emerald-300 shadow-xs">
 <Upload className="size-5" />
 </div>
 <span className="text-xs font-bold text-slate-700 dark:text-slate-200">Klik untuk Unggah Logo Unit</span>
 <span className="mt-0.5 text-[10px] text-slate-400">Format PNG, JPG maks 2MB</span>
 <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
 </label>
 )}
 </div>

 {/* Nama Unit */}
 <div className="space-y-1.5">
 <label htmlFor="name" className="block text-xs font-bold text-slate-700 dark:text-slate-200">
 Nama Unit Pendidikan <span className="text-rose-500">*</span>
 </label>
 <div className="relative flex items-center">
 <div className="pointer-events-none absolute left-3.5 flex items-center text-slate-400 dark:text-slate-500">
 <Building2 className="size-4" />
 </div>
 <input
 id="name"
 name="name"
 type="text"
 placeholder="Contoh: SDIT 2 Dar el-Iman"
 value={formData.name}
 onChange={e => setFormData(p => ({ ...p, name: e.target.value }))}
 className="w-full rounded-2xl border border-slate-200 bg-white pl-10 pr-4 py-2.5 text-xs font-semibold text-slate-800 placeholder-slate-400 shadow-xs focus:border-emerald-500 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder-slate-500 transition-colors"
 />
 </div>
 <p className="text-[11px] font-medium text-slate-400">Nama resmi unit pendidikan yang terdaftar</p>
 </div>

 {/* Kode Unit & NPSN */}
 <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
 <div className="space-y-1.5">
 <label htmlFor="code" className="block text-xs font-bold text-slate-700 dark:text-slate-200">
 Kode Unit
 </label>
 <div className="relative flex items-center">
 <div className="pointer-events-none absolute left-3.5 flex items-center text-slate-400 dark:text-slate-500">
 <Tag className="size-4" />
 </div>
 <input
 id="code"
 name="code"
 type="text"
 placeholder="Contoh: SDIT-002"
 value={formData.code}
 onChange={e => setFormData(p => ({ ...p, code: e.target.value }))}
 className="w-full rounded-2xl border border-slate-200 bg-white pl-10 pr-4 py-2.5 text-xs font-semibold text-slate-800 placeholder-slate-400 shadow-xs focus:border-emerald-500 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder-slate-500 transition-colors"
 />
 </div>
 </div>

 <div className="space-y-1.5">
 <label htmlFor="npsn" className="block text-xs font-bold text-slate-700 dark:text-slate-200">
 NPSN
 </label>
 <div className="relative flex items-center">
 <div className="pointer-events-none absolute left-3.5 flex items-center text-slate-400 dark:text-slate-500">
 <Hash className="size-4" />
 </div>
 <input
 id="npsn"
 name="npsn"
 type="text"
 placeholder="Nomor Pokok Sekolah Nasional"
 value={formData.npsn}
 onChange={e => setFormData(p => ({ ...p, npsn: e.target.value }))}
 className="w-full rounded-2xl border border-slate-200 bg-white pl-10 pr-4 py-2.5 text-xs font-semibold text-slate-800 placeholder-slate-400 shadow-xs focus:border-emerald-500 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder-slate-500 transition-colors"
 />
 </div>
 </div>
 </div>

 {/* Email & Telepon */}
 <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
 <div className="space-y-1.5">
 <label htmlFor="email" className="block text-xs font-bold text-slate-700 dark:text-slate-200">
 Email Resmi
 </label>
 <div className="relative flex items-center">
 <div className="pointer-events-none absolute left-3.5 flex items-center text-slate-400 dark:text-slate-500">
 <Mail className="size-4" />
 </div>
 <input
 id="email"
 name="email"
 type="email"
 placeholder="info@sdit2.dareliman.sch.id"
 value={formData.email}
 onChange={e => setFormData(p => ({ ...p, email: e.target.value }))}
 className="w-full rounded-2xl border border-slate-200 bg-white pl-10 pr-4 py-2.5 text-xs font-semibold text-slate-800 placeholder-slate-400 shadow-xs focus:border-emerald-500 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder-slate-500 transition-colors"
 />
 </div>
 </div>

 <div className="space-y-1.5">
 <label htmlFor="phone" className="block text-xs font-bold text-slate-700 dark:text-slate-200">
 No. Telepon / Layanan
 </label>
 <div className="relative flex items-center">
 <div className="pointer-events-none absolute left-3.5 flex items-center text-slate-400 dark:text-slate-500">
 <Phone className="size-4" />
 </div>
 <input
 id="phone"
 name="phone"
 type="text"
 placeholder="0751-xxxxxx / 08xxxxxxxxxx"
 value={formData.phone}
 onChange={e => setFormData(p => ({ ...p, phone: e.target.value }))}
 className="w-full rounded-2xl border border-slate-200 bg-white pl-10 pr-4 py-2.5 text-xs font-semibold text-slate-800 placeholder-slate-400 shadow-xs focus:border-emerald-500 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder-slate-500 transition-colors"
 />
 </div>
 </div>
 </div>

 {/* Jenis Unit */}
 <div className="space-y-1.5">
 <label htmlFor="unit_type" className="block text-xs font-bold text-slate-700 dark:text-slate-200">
 Jenis Unit <span className="text-rose-500">*</span>
 </label>
 <div className="relative flex items-center">
 <div className="pointer-events-none absolute left-3.5 flex items-center text-slate-400 dark:text-slate-500">
 <School className="size-4" />
 </div>
 <select
 id="unit_type"
 value={formData.unit_type}
 onChange={e => setFormData(p => ({ ...p, unit_type: e.target.value }))}
 className="w-full appearance-none rounded-2xl border border-slate-200 bg-white pl-10 pr-10 py-2.5 text-xs font-semibold text-slate-800 shadow-xs focus:border-emerald-500 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 transition-colors cursor-pointer"
 >
 <option value="">-- Pilih Jenis Unit --</option>
 {typeOptions.length > 0
 ? typeOptions.map(t => <option key={t} value={t}>{t}</option>)
 : ['TKIT', 'TAUD', 'SDIT', 'MIT', 'SMPIT', 'SMAIT', 'PONPES', 'Mahad'].map(t => <option key={t} value={t}>{t}</option>)
 }
 </select>
 <ChevronDown className="pointer-events-none absolute right-3 size-4 text-slate-400" />
 </div>
 </div>

 {/* Status switch card */}
 <div
 onClick={() => setFormData(p => ({ ...p, is_active: !p.is_active }))}
 className={`group relative flex items-center justify-between gap-3.5 rounded-2xl border-2 p-3.5 sm:p-4 transition-all duration-200 cursor-pointer ${
 formData.is_active
 ? 'border-emerald-500/35 bg-gradient-to-r from-emerald-50/80 via-teal-50/40 to-emerald-50/60 shadow-xs shadow-emerald-500/10 dark:border-emerald-600/40 dark:bg-gradient-to-r dark:from-emerald-950/40 dark:via-teal-950/30 dark:to-slate-900/60'
 : 'border-slate-200/90 bg-slate-50/60 hover:bg-slate-100/60 dark:border-slate-800 dark:bg-slate-900/40 dark:hover:bg-slate-800/40'
 }`}
 >
 <div className="flex items-center gap-3.5 min-w-0">
 {/* Squircle Status Icon */}
 <div
 className={`flex size-11 shrink-0 items-center justify-center rounded-2xl border transition-all duration-200 ${
 formData.is_active
 ? 'border-emerald-300/80 bg-gradient-to-br from-emerald-500/15 via-teal-500/10 to-emerald-500/20 text-[#0E5C44] shadow-xs dark:border-emerald-700/60 dark:from-emerald-950/80 dark:to-teal-950/60 dark:text-[#3FBF75]'
 : 'border-slate-200 bg-white text-slate-400 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-500'
 }`}
 >
 {formData.is_active ? (
 <ShieldCheck className="size-5.5 transition-transform group-hover:scale-110" strokeWidth={2.25} />
 ) : (
 <Power className="size-5 transition-transform group-hover:scale-110 opacity-70" strokeWidth={2} />
 )}
 </div>

 {/* Text labels */}
 <div className="min-w-0">
 <div className="flex items-center gap-2">
 <p className="text-xs font-black text-slate-900 dark:text-white">
 Status Operasional Unit
 </p>
 {formData.is_active && (
 <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100/90 px-2 py-0.5 text-[10px] font-extrabold text-emerald-800 border border-emerald-300/70 dark:bg-emerald-950/70 dark:text-emerald-300 dark:border-emerald-700/60">
 <Sparkles className="size-2.5 text-emerald-600 dark:text-emerald-400" />
 Aktif
 </span>
 )}
 </div>
 <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mt-0.5 leading-snug">
 Aktifkan agar unit dapat dipilih pada transaksi & data siswa
 </p>
 </div>
 </div>

 {/* Switch Control & Status Text */}
 <div className="flex items-center gap-3 shrink-0" onClick={e => e.stopPropagation()}>
 <span
 className={`text-xs font-black transition-colors ${
 formData.is_active
 ? 'text-emerald-700 dark:text-emerald-400'
 : 'text-slate-400 dark:text-slate-500'
 }`}
 >
 {formData.is_active ? 'Aktif' : 'Nonaktif'}
 </span>

 <button
 type="button"
 role="switch"
 aria-checked={formData.is_active}
 aria-label="Toggle status operasional unit"
 onClick={() => setFormData(p => ({ ...p, is_active: !p.is_active }))}
 className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-4 focus:ring-emerald-500/20 ${
 formData.is_active
 ? 'bg-gradient-to-r from-emerald-600 to-teal-600 shadow-sm shadow-emerald-700/30'
 : 'bg-slate-300 dark:bg-slate-700'
 }`}
 >
 <span
 className={`pointer-events-none inline-flex size-5.5 items-center justify-center transform rounded-full bg-white shadow-md ring-0 transition-transform duration-200 ease-in-out ${
 formData.is_active ? 'translate-x-5' : 'translate-x-0.5'
 }`}
 >
 {formData.is_active ? (
 <Check className="size-3 text-emerald-700" strokeWidth={3} />
 ) : (
 <span className="size-1.5 rounded-full bg-slate-400" />
 )}
 </span>
 </button>
 </div>
 </div>
 </div>
 )}

 {/* Step 2: Alamat */}
 {currentStep === 2 && (
 <div className="space-y-4">
 <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/60 pb-2">
 <h3 className="text-xs font-extrabold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
 <MapPin className="size-4 text-[#0E5C44] dark:text-[#3FBF75]" />
 Alamat & Wilayah Operasional
 </h3>
 </div>

 {/* Alamat Lengkap */}
 <div className="space-y-1.5">
 <label htmlFor="address" className="block text-xs font-bold text-slate-700 dark:text-slate-200">
 Alamat Lengkap Unit
 </label>
 <div className="relative flex items-start">
 <div className="pointer-events-none absolute left-3.5 top-3 flex items-center text-slate-400 dark:text-slate-500">
 <MapPin className="size-4" />
 </div>
 <textarea
 id="address"
 name="address"
 rows={3}
 placeholder="Jl. Khatib Sulaiman No. 10..."
 value={formData.address}
 onChange={e => setFormData(p => ({ ...p, address: e.target.value }))}
 className="w-full rounded-2xl border border-slate-200 bg-white pl-10 pr-4 py-2.5 text-xs font-semibold text-slate-800 placeholder-slate-400 shadow-xs focus:border-emerald-500 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder-slate-500 transition-colors"
 />
 </div>
 <p className="text-[11px] font-medium text-slate-400">Alamat lengkap lokasi fisik unit pendidikan</p>
 </div>

 {/* Provinsi & Kota */}
 <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
 <SearchableRegionInput
 label="Provinsi"
 value={formData.province}
 onChange={(newProv) => {
 setFormData((p) => ({
 ...p,
 province: newProv,
 city: p.province !== newProv ? '' : p.city,
 district: p.province !== newProv ? '' : p.district,
 subdistrict: p.province !== newProv ? '' : p.subdistrict,
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
 const basePostal = getPostalCode('', '', newCity, formData.province)
 setFormData((p) => ({
 ...p,
 city: newCity,
 district: p.city !== newCity ? '' : p.district,
 subdistrict: p.city !== newCity ? '' : p.subdistrict,
 ...(basePostal && !p.postal_code ? { postal_code: basePostal } : {}),
 }))
 }}
 onSelectOption={(opt) => {
 const val = typeof opt === 'object' && opt !== null ? opt.value : opt
 const basePostal = getPostalCode('', '', val, formData.province)
 setFormData((p) => ({
 ...p,
 city: val,
 district: p.city !== val ? '' : p.district,
 subdistrict: p.city !== val ? '' : p.subdistrict,
 ...(basePostal && !p.postal_code ? { postal_code: basePostal } : {}),
 }))
 }}
 options={kotaList}
 placeholder={formData.province ? "Cari / pilih kota/kabupaten..." : "Pilih provinsi atau ketik kota..."}
 isLoading={isKotaLoading}
 />
 </div>

 {/* Kecamatan & Kelurahan / Desa */}
 <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
 <SearchableRegionInput
 label="Kecamatan"
 value={formData.district}
 onChange={(newKec) => {
 const kecPostal = getPostalCode('', newKec, formData.city, formData.province)
 setFormData((p) => ({
 ...p,
 district: newKec,
 subdistrict: p.district !== newKec ? '' : p.subdistrict,
 ...(kecPostal ? { postal_code: kecPostal } : {}),
 }))
 }}
 onSelectOption={(opt) => {
 const val = typeof opt === 'object' && opt !== null ? opt.value : opt
 const kecPostal = getPostalCode('', val, formData.city, formData.province)
 setFormData((p) => ({
 ...p,
 district: val,
 subdistrict: p.district !== val ? '' : p.subdistrict,
 ...(kecPostal ? { postal_code: kecPostal } : {}),
 }))
 }}
 options={kecList}
 placeholder={formData.city ? "Cari / pilih kecamatan..." : "Pilih kota/kabupaten dulu..."}
 isLoading={isKecLoading}
 />
 <SearchableRegionInput
 label="Kelurahan / Desa"
 value={formData.subdistrict}
 onChange={(newKel) => {
 const kelPostal = getPostalCode(newKel, formData.district, formData.city, formData.province)
 setFormData((p) => ({
 ...p,
 subdistrict: newKel,
 ...(kelPostal ? { postal_code: kelPostal } : {}),
 }))
 }}
 onSelectOption={(opt) => {
 const val = typeof opt === 'object' && opt !== null ? opt.value : opt
 const kelPostal = typeof opt === 'object' && opt !== null && opt.postalCode ? opt.postalCode : getPostalCode(val, formData.district, formData.city, formData.province)
 setFormData((p) => ({
 ...p,
 subdistrict: val,
 ...(kelPostal ? { postal_code: kelPostal } : {}),
 }))
 }}
 options={kelListWithOptions}
 placeholder={formData.district ? "Cari / pilih kelurahan/desa..." : "Pilih kecamatan dulu..."}
 isLoading={isKelLoading}
 />
 </div>

 {/* Kode Pos */}
 <div className="space-y-1.5">
 <div className="flex items-center justify-between">
 <label htmlFor="postal_code" className="block text-xs font-bold text-slate-700 dark:text-slate-200">
 Kode Pos
 </label>
 {formData.postal_code && (
 <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-200/80 dark:border-emerald-800/60">
 Terisi Otomatis
 </span>
 )}
 </div>
 <div className="relative flex items-center">
 <div className="pointer-events-none absolute left-3.5 flex items-center text-slate-400 dark:text-slate-500">
 <Compass className="size-4" />
 </div>
 <input
 id="postal_code"
 name="postal_code"
 type="text"
 placeholder="25136"
 value={formData.postal_code}
 onChange={e => setFormData(p => ({ ...p, postal_code: e.target.value }))}
 className="w-full rounded-2xl border border-slate-200 bg-white pl-10 pr-4 py-2.5 text-xs font-semibold text-slate-800 placeholder-slate-400 shadow-xs focus:border-emerald-500 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder-slate-500 transition-colors"
 />
 </div>
 <p className="text-[11px] font-medium text-slate-400">Kode pos terisi otomatis saat memilih kelurahan / kecamatan (dapat disunting manual)</p>
 </div>
 </div>
 )}

 {/* Step 3: Pimpinan */}
 {currentStep === 3 && (
 <div className="space-y-4">
 <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/60 pb-2">
 <h3 className="text-xs font-extrabold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
 <UsersRound className="size-4 text-[#0E5C44] dark:text-[#3FBF75]" />
 Kepala Sekolah & SK Pendirian
 </h3>
 <button
 type="button"
 onClick={() => setIsAddEmployeeModalOpen(true)}
 className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 px-3 py-1.5 text-xs font-bold text-[#0E5C44] dark:text-[#3FBF75] hover:bg-emerald-100 dark:hover:bg-emerald-900/60 transition border border-emerald-200/80 dark:border-emerald-800/60 cursor-pointer"
 >
 <Plus className="h-3.5 w-3.5" /> Tambah Pegawai Baru
 </button>
 </div>

 {/* Select Pegawai */}
 <div className="space-y-1.5">
 <label htmlFor="select_employee" className="block text-xs font-bold text-slate-700 dark:text-slate-200">
 Pilih dari Data Pegawai
 </label>
 <div className="relative flex items-center">
 <div className="pointer-events-none absolute left-3.5 flex items-center text-slate-400 dark:text-slate-500">
 <UsersRound className="size-4" />
 </div>
 <select
 id="select_employee"
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
 className="w-full appearance-none rounded-2xl border border-slate-200 bg-white pl-10 pr-10 py-2.5 text-xs font-semibold text-slate-800 shadow-xs focus:border-emerald-500 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 transition-colors cursor-pointer"
 >
 <option value="">-- Pilih Pegawai Terdaftar --</option>
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
 <ChevronDown className="pointer-events-none absolute right-3 size-4 text-slate-400" />
 </div>
 </div>

 {/* Nama Pimpinan */}
 <div className="space-y-1.5">
 <label htmlFor="principal_name" className="block text-xs font-bold text-slate-700 dark:text-slate-200">
 Nama Pimpinan / Kepala Sekolah
 </label>
 <div className="relative flex items-center">
 <div className="pointer-events-none absolute left-3.5 flex items-center text-slate-400 dark:text-slate-500">
 <UserCheck className="size-4" />
 </div>
 <input
 id="principal_name"
 name="principal_name"
 type="text"
 placeholder="Ust. Fadli Rahman, S.Pd"
 value={formData.principal_name}
 onChange={e => setFormData(p => ({ ...p, principal_name: e.target.value }))}
 className="w-full rounded-2xl border border-slate-200 bg-white pl-10 pr-4 py-2.5 text-xs font-semibold text-slate-800 placeholder-slate-400 shadow-xs focus:border-emerald-500 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder-slate-500 transition-colors"
 />
 </div>
 </div>

 {/* NIP / NIPY */}
 <div className="space-y-1.5">
 <label htmlFor="principal_nip" className="block text-xs font-bold text-slate-700 dark:text-slate-200">
 NIP / NIPY
 </label>
 <div className="relative flex items-center">
 <div className="pointer-events-none absolute left-3.5 flex items-center text-slate-400 dark:text-slate-500">
 <FileCheck className="size-4" />
 </div>
 <input
 id="principal_nip"
 name="principal_nip"
 type="text"
 placeholder="1985xxxxxx"
 value={formData.principal_nip}
 onChange={e => setFormData(p => ({ ...p, principal_nip: e.target.value }))}
 className="w-full rounded-2xl border border-slate-200 bg-white pl-10 pr-4 py-2.5 text-xs font-semibold text-slate-800 placeholder-slate-400 shadow-xs focus:border-emerald-500 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder-slate-500 transition-colors"
 />
 </div>
 </div>

 {/* No. SK Pendirian */}
 <div className="space-y-1.5">
 <label htmlFor="sk_pendirian" className="block text-xs font-bold text-slate-700 dark:text-slate-200">
 No. SK Pendirian Unit
 </label>
 <div className="relative flex items-center">
 <div className="pointer-events-none absolute left-3.5 flex items-center text-slate-400 dark:text-slate-500">
 <FileText className="size-4" />
 </div>
 <input
 id="sk_pendirian"
 name="sk_pendirian"
 type="text"
 placeholder="Contoh: SK-YDI/2021/005"
 value={formData.sk_pendirian}
 onChange={e => setFormData(p => ({ ...p, sk_pendirian: e.target.value }))}
 className="w-full rounded-2xl border border-slate-200 bg-white pl-10 pr-4 py-2.5 text-xs font-semibold text-slate-800 placeholder-slate-400 shadow-xs focus:border-emerald-500 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder-slate-500 transition-colors"
 />
 </div>
 </div>

 {/* Tahun Berdiri & Akreditasi */}
 <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
 <div className="space-y-1.5">
 <label htmlFor="established_year" className="block text-xs font-bold text-slate-700 dark:text-slate-200">
 Tahun Berdiri
 </label>
 <div className="relative flex items-center">
 <div className="pointer-events-none absolute left-3.5 flex items-center text-slate-400 dark:text-slate-500">
 <Calendar className="size-4" />
 </div>
 <input
 id="established_year"
 name="established_year"
 type="number"
 placeholder="2011"
 value={formData.established_year}
 onChange={e => setFormData(p => ({ ...p, established_year: e.target.value }))}
 className="w-full rounded-2xl border border-slate-200 bg-white pl-10 pr-4 py-2.5 text-xs font-semibold text-slate-800 placeholder-slate-400 shadow-xs focus:border-emerald-500 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder-slate-500 transition-colors"
 />
 </div>
 </div>

 <div className="space-y-1.5">
 <label htmlFor="accreditation" className="block text-xs font-bold text-slate-700 dark:text-slate-200">
 Akreditasi
 </label>
 <div className="relative flex items-center">
 <div className="pointer-events-none absolute left-3.5 flex items-center text-slate-400 dark:text-slate-500">
 <Award className="size-4" />
 </div>
 <select
 id="accreditation"
 name="accreditation"
 value={formData.accreditation}
 onChange={e => setFormData(p => ({ ...p, accreditation: e.target.value }))}
 className="w-full appearance-none rounded-2xl border border-slate-200 bg-white pl-10 pr-10 py-2.5 text-xs font-semibold text-slate-800 shadow-xs focus:border-emerald-500 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 transition-colors cursor-pointer"
 >
 <option value="A">A (Unggul)</option>
 <option value="B">B (Baik)</option>
 <option value="C">C</option>
 </select>
 <ChevronDown className="pointer-events-none absolute right-3 size-4 text-slate-400" />
 </div>
 </div>
 </div>
 </div>
 )}

 {/* Step 4: Konfirmasi */}
 {currentStep === 4 && (
 <div className="space-y-4">
 <div className="flex items-center justify-between">
 <h3 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
 <CheckCircle2 className="size-4 text-emerald-600 dark:text-emerald-400" />
 Ringkasan Data Unit
 </h3>
 <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">Siap Disimpan</span>
 </div>

 <div className="divide-y divide-slate-100 rounded-2xl border border-slate-200/80 bg-slate-50/80 text-xs dark:divide-slate-700/70 dark:border-slate-700/80 dark:bg-slate-800/30 overflow-hidden">
 {[
 ['Nama Unit', formData.name || '-'],
 ['Jenis Unit', formData.unit_type || '-'],
 ['Kode Unit', formData.code || '-'],
 ['NPSN', formData.npsn || '-'],
 ['Kecamatan / Kelurahan', [formData.district ? `Kec. ${formData.district}` : '', formData.subdistrict ? `Kel. ${formData.subdistrict}` : ''].filter(Boolean).join(', ') || '-'],
 ['Kota, Provinsi', [formData.city, formData.province].filter(Boolean).join(', ') || '-'],
 ['Kepala Sekolah', formData.principal_name || '-'],
 ['Akreditasi', formData.accreditation || 'A'],
 ['Status Operasional', formData.is_active ? 'Aktif' : 'Nonaktif'],
 ].map(([label, value]) => (
 <div key={label} className="flex items-center justify-between px-4 py-3">
 <span className="font-semibold text-slate-500 dark:text-slate-400">{label}</span>
 <span className="font-extrabold text-slate-900 dark:text-white">{value}</span>
 </div>
 ))}
 </div>

 <div className="rounded-2xl border border-emerald-200/80 bg-emerald-50/70 p-4 dark:border-emerald-800/50 dark:bg-emerald-950/30 flex items-start gap-3">
 <ShieldCheck className="size-5 text-[#0E5C44] dark:text-emerald-400 shrink-0 mt-0.5" />
 <p className="text-xs text-slate-700 dark:text-slate-200 leading-relaxed">
 Pastikan seluruh data unit yang dimasukkan telah sesuai dengan dokumen resmi yayasan sebelum menekan tombol simpan.
 </p>
 </div>
 </div>
 )}
 </div>

 {/* Footer */}
 <div className="modal-footer flex items-center justify-between border-t border-slate-100 bg-slate-50/50 px-6 py-4 dark:border-slate-800 dark:bg-slate-900/30">
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
 {currentStep > 1 && (
 <button
 type="button"
 onClick={() => setCurrentStep(s => s - 1)}
 className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-700 text-white px-4 py-2.5 text-xs font-extrabold border border-blue-300/40 transition-all duration-200 hover:scale-[1.03] active:scale-95 cursor-pointer"
 >
 <div className="flex size-5 items-center justify-center rounded-lg bg-white/20 text-white">
 <ArrowLeft className="size-3.5" strokeWidth={2.2} />
 </div>
 <span>Kembali</span>
 </button>
 )}
 {currentStep < 4 ? (
 <button
 type="button"
 onClick={() => setCurrentStep(s => Math.min(4, s + 1))}
 className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700 text-white px-5 py-2.5 text-xs font-extrabold border border-emerald-300/40 hover:scale-[1.03] transition-all duration-200 active:scale-95 cursor-pointer"
 >
 <span>Selanjutnya</span>
 <div className="flex size-5 items-center justify-center rounded-lg bg-white/20 text-white">
 <ArrowRight className="size-3.5 text-white" strokeWidth={2.2} />
 </div>
 </button>
 ) : (
 <button
 type="button"
 onClick={handleFormSubmit}
 disabled={isMutating}
 className={cn(
 "inline-flex items-center gap-2 rounded-2xl text-white px-5 py-2.5 text-xs font-extrabold transition-all duration-200 hover:scale-[1.03] active:scale-95 disabled:opacity-50 cursor-pointer",
 isEditMode
 ? "bg-gradient-to-br from-amber-400 via-amber-500 to-orange-600 border border-amber-300/40 "
 : "bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700 border border-emerald-300/40 "
 )}
 >
 {isMutating ? (
 <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
 ) : (
 <div className="flex size-5 items-center justify-center rounded-lg bg-white/20 text-white">
 <Save className="size-3.5 text-white" strokeWidth={2.2} />
 </div>
 )}
 <span>{isEditMode ? 'Simpan Perubahan' : 'Simpan Unit'}</span>
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
      SAVE / UPDATE CONFIRMATION DIALOG — Harmonized with Modal Tambah/Edit UI/UX
      ══════════════════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {showSaveConfirmDialog && (
          <div
            className="overlay modal fixed inset-0 z-[70] flex items-center justify-center p-3 sm:p-5 bg-slate-950/70 backdrop-blur-md"
            role="dialog"
            aria-modal="true"
            aria-labelledby="edu-unit-save-confirm-title"
            tabIndex={-1}
            onMouseDown={(e) => {
              if (e.target === e.currentTarget && !isMutating) setShowSaveConfirmDialog(false)
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
                    isEditMode
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
                        isEditMode
                          ? "bg-gradient-to-br from-amber-500 via-amber-600 to-orange-600 shadow-amber-500/30 border-amber-300/30"
                          : "bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700 shadow-emerald-500/30 border-emerald-300/30"
                      )}
                    >
                      {isEditMode ? (
                        <Pencil className="h-5 w-5 text-white" strokeWidth={2.25} />
                      ) : (
                        <School className="h-5 w-5 text-white" strokeWidth={2.25} />
                      )}
                    </div>
                    <div>
                      <h3
                        id="edu-unit-save-confirm-title"
                        className="modal-title text-sm sm:text-base font-black text-slate-900 dark:text-white flex items-center gap-2"
                      >
                        <span>{isEditMode ? 'Konfirmasi Perubahan Data' : 'Konfirmasi Penyimpanan Data'}</span>
                        <span
                          className={cn(
                            "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold border",
                            isEditMode
                              ? "bg-amber-50 text-amber-700 border-amber-200/80 dark:bg-amber-950/60 dark:text-amber-400 dark:border-amber-800/60"
                              : "bg-emerald-50 text-emerald-800 border-emerald-200/80 dark:bg-emerald-950/60 dark:text-emerald-400 dark:border-emerald-800/60"
                          )}
                        >
                          <Sparkles className="size-3" />
                          {isEditMode ? 'Update Data' : 'Unit Baru'}
                        </span>
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        {isEditMode
                          ? 'Verifikasi data unit sebelum pembaruan diterapkan ke sistem.'
                          : 'Verifikasi data unit baru sebelum disimpan ke sistem.'}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    disabled={isMutating}
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
                      <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Unit Pendidikan</span>
                      <span className="text-xs font-extrabold text-slate-900 dark:text-white text-right max-w-[220px] truncate">
                        {formData.name || '-'}
                      </span>
                    </div>
                    {formData.code && (
                      <div className="flex items-center justify-between border-t border-slate-200/60 pt-2 dark:border-slate-800/60">
                        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Kode Unit</span>
                        <span className="font-mono text-xs font-bold text-slate-800 dark:text-slate-200">
                          {formData.code}
                        </span>
                      </div>
                    )}
                    {formData.unit_type && (
                      <div className="flex items-center justify-between border-t border-slate-200/60 pt-2 dark:border-slate-800/60">
                        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Jenjang / Jenis</span>
                        <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                          {formData.unit_type}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Callout Notice Box */}
                  <div
                    className={cn(
                      "rounded-2xl border p-3.5 text-xs font-semibold leading-relaxed flex items-start gap-2.5",
                      isEditMode
                        ? "border-amber-200 bg-amber-50/70 text-amber-900 dark:border-amber-900/40 dark:bg-amber-950/30 dark:text-amber-300"
                        : "border-emerald-200 bg-emerald-50/70 text-emerald-900 dark:border-emerald-900/40 dark:bg-emerald-950/30 dark:text-emerald-300"
                    )}
                  >
                    <div
                      className={cn(
                        "flex size-5 shrink-0 items-center justify-center rounded-lg text-white mt-0.5",
                        isEditMode
                          ? "bg-gradient-to-br from-amber-500 to-orange-600"
                          : "bg-gradient-to-br from-emerald-500 to-teal-600"
                      )}
                    >
                      <Sparkles className="size-3 text-white" />
                    </div>
                    <div className="flex-1">
                      {isEditMode
                        ? 'Data unit pendidikan yang sudah ada akan segera diperbarui di database server dengan informasi terbaru yang Anda masukkan.'
                        : 'Data unit pendidikan baru akan tersimpan dan langsung aktif sesuai konfigurasi sistem.'}
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="modal-footer flex items-center justify-between border-t border-slate-100 bg-white px-6 py-4 dark:border-slate-800 dark:bg-slate-950">
                  <button
                    type="button"
                    disabled={isMutating}
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
                    disabled={isMutating}
                    onClick={handleConfirmSave}
                    className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700 text-white px-5 py-2.5 text-xs font-extrabold border border-emerald-300/40 hover:scale-[1.03] transition-all duration-200 active:scale-95 disabled:opacity-50 cursor-pointer shadow-md shadow-emerald-500/20"
                  >
                    {isMutating ? (
                      <span className="size-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    ) : (
                      <div className="flex size-4 items-center justify-center rounded-md bg-white/20 text-white">
                        <Save className="size-3 text-white" strokeWidth={2.2} />
                      </div>
                    )}
                    <span>
                      {isMutating
                        ? isEditMode ? 'Memperbarui...' : 'Menyimpan...'
                        : isEditMode ? 'Ya, Perbarui Data' : 'Ya, Simpan Unit'}
                    </span>
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ══════════════════════════════════════════════════════════════════
      DELETE CONFIRM DIALOG — Harmonized with Modal Tambah/Edit UI/UX
      ══════════════════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {deleteTarget && (
          <div
            className="overlay modal fixed inset-0 z-[70] flex items-center justify-center p-3 sm:p-5 bg-slate-950/70 backdrop-blur-md"
            role="dialog"
            aria-modal="true"
            aria-labelledby="edu-unit-delete-confirm-title"
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
                        id="edu-unit-delete-confirm-title"
                        className="modal-title text-sm sm:text-base font-black text-slate-900 dark:text-white flex items-center gap-2"
                      >
                        <span>Hapus Unit Pendidikan</span>
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
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Unit Pendidikan</span>
                      <span className="text-xs font-extrabold text-slate-900 dark:text-white text-right max-w-[220px] truncate">
                        {deleteTarget.name || '-'}
                      </span>
                    </div>
                    {deleteTarget.code && (
                      <div className="flex items-center justify-between border-t border-rose-100 dark:border-rose-900/40 pt-2">
                        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Kode Unit</span>
                        <span className="font-mono text-xs font-bold text-slate-800 dark:text-slate-200">
                          {deleteTarget.code}
                        </span>
                      </div>
                    )}
                    {deleteTarget.unit_type && (
                      <div className="flex items-center justify-between border-t border-rose-100 dark:border-rose-900/40 pt-2">
                        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Jenjang / Jenis</span>
                        <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                          {deleteTarget.unit_type}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Danger Notice Box */}
                  <div className="rounded-2xl border border-rose-200/80 bg-rose-50/70 p-3.5 text-xs font-semibold text-rose-900 dark:border-rose-900/50 dark:bg-rose-950/30 dark:text-rose-300 leading-relaxed flex items-start gap-2.5">
                    <div className="flex size-5 shrink-0 items-center justify-center rounded-lg text-white bg-gradient-to-br from-rose-500 to-red-600 mt-0.5">
                      <AlertTriangle className="size-3 text-white" />
                    </div>
                    <div className="flex-1">
                      Data unit <strong>"{deleteTarget.name}"</strong> akan dihapus secara permanen dari server. Semua data kelas, siswa, dan relasi terkait akan terpengaruh.
                    </div>
                  </div>
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
                    disabled={deleteMutation.isPending}
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
                    <span>{deleteMutation.isPending ? 'Menghapus...' : 'Ya, Hapus Unit'}</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

 {/* ══════════════════════════════════════════════════════════════════
 EXPORT DIALOG
 ══════════════════════════════════════════════════════════════════ */}
 {/* ══════════════════════════════════════════════════════════════════
 EXPORT DIALOG — Harmonized with Modal Tambah UI/UX
 ══════════════════════════════════════════════════════════════════ */}
 <AnimatePresence>
 {showExportModal && (
 <div
 className="overlay modal fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/70 backdrop-blur-md"
 role="dialog"
 aria-modal="true"
 aria-labelledby="edu-unit-export-title"
 tabIndex={-1}
 onMouseDown={e => { if (e.target === e.currentTarget) setShowExportModal(false) }}
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
 <div className="rounded-2xl bg-gradient-to-br from-amber-500 via-amber-600 to-orange-600 text-white p-2.5 shadow-md shadow-amber-500/30 border border-amber-300/30 shrink-0">
 <Download className="h-5 w-5 text-white" strokeWidth={2.25} />
 </div>
 <div>
 <h3 id="edu-unit-export-title" className="modal-title text-sm sm:text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
 <span>Export Data Unit</span>
 <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-[#0E5C44] border border-emerald-200/80 dark:bg-emerald-950/60 dark:text-emerald-400 dark:border-emerald-800/60">
 <Sparkles className="size-3" />
 Unduh
 </span>
 </h3>
 <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
 Pilih format berkas untuk mengekspor data master unit
 </p>
 </div>
 </div>
 <button
 type="button"
 onClick={() => setShowExportModal(false)}
 aria-label="Tutup modal export"
 className="rounded-xl p-2 bg-gradient-to-br from-rose-500 via-rose-600 to-red-700 text-white border border-rose-300/40 hover:scale-105 transition-all duration-200 active:scale-95 cursor-pointer"
 >
 <X className="size-4" strokeWidth={2.25} />
 </button>
 </div>

 {/* Body */}
 <div className="modal-body space-y-2.5 p-6 text-sm text-slate-700 dark:text-slate-200">
 {[
 { value: 'xlsx', label: 'Excel (.xlsx)', desc: 'Format Microsoft Excel Modern (Disarankan)' },
 { value: 'xls', label: 'Excel Legacy (.xls)', desc: 'Format Microsoft Excel Standard 97-2003' },
 { value: 'csv', label: 'CSV (.csv)', desc: 'Format Comma-Separated Values universal' },
 { value: 'pdf', label: 'PDF (.pdf)', desc: 'Format Cetak Dokumen Resmi' },
 ].map(opt => (
 <label
 key={opt.value}
 className={cn(
 "flex cursor-pointer items-center gap-3 rounded-2xl border p-3.5 transition-all",
 exportFormat === opt.value
 ? "border-emerald-500 bg-emerald-50/60 shadow-2xs dark:border-emerald-600 dark:bg-emerald-950/40"
 : "border-slate-200 hover:border-slate-300 hover:bg-slate-50/50 dark:border-slate-800 dark:hover:border-slate-700 dark:hover:bg-slate-800/40"
 )}
 >
 <input
 type="radio"
 name="export-fmt"
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
 <div className="modal-footer flex items-center justify-between border-t border-slate-100 bg-slate-50/50 px-6 py-4 dark:border-slate-800 dark:bg-slate-900/30">
 <button
 type="button"
 onClick={() => setShowExportModal(false)}
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

 {/* ══════════════════════════════════════════════════════════════════
 IMPORT DIALOG — Harmonized with Modal Tambah UI/UX
 ══════════════════════════════════════════════════════════════════ */}
 <AnimatePresence>
 {showImportModal && (
 <div
 className="overlay modal fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/70 backdrop-blur-md"
 role="dialog"
 aria-modal="true"
 aria-labelledby="edu-unit-import-title"
 tabIndex={-1}
 onMouseDown={e => { if (e.target === e.currentTarget) setShowImportModal(false) }}
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
 <div className="rounded-2xl bg-gradient-to-br from-sky-500 via-sky-600 to-blue-600 text-white p-2.5 shadow-md shadow-sky-500/30 border border-sky-300/30 shrink-0">
 <Upload className="h-5 w-5 text-white" strokeWidth={2.25} />
 </div>
 <div>
 <h3 id="edu-unit-import-title" className="modal-title text-sm sm:text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
 <span>Import Data Unit Pendidikan</span>
 <span className="inline-flex items-center gap-1 rounded-full bg-sky-50 px-2 py-0.5 text-[10px] font-bold text-sky-700 border border-sky-200/80 dark:bg-sky-950/60 dark:text-sky-300 dark:border-sky-800/60">
 <Sparkles className="size-3" />
 Batch Import
 </span>
 </h3>
 <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
 Unggah berkas spreadsheet (.xlsx, .xls, atau .csv) untuk impor data massal
 </p>
 </div>
 </div>
 <button
 type="button"
 onClick={() => setShowImportModal(false)}
 aria-label="Tutup form import"
 className="rounded-xl p-2 bg-gradient-to-br from-rose-500 via-rose-600 to-red-700 text-white border border-rose-300/40 hover:scale-105 transition-all duration-200 active:scale-95 cursor-pointer"
 >
 <X className="size-4" strokeWidth={2.25} />
 </button>
 </div>

 {/* Modal Body */}
 <div className="modal-body min-h-0 flex-1 space-y-4.5 overflow-y-auto p-6 text-sm text-slate-700 dark:text-slate-200">
 {/* Unduh Template Card */}
 <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-sky-200/70 bg-gradient-to-r from-sky-50/50 via-teal-50/20 to-white p-4 dark:border-sky-850/50 dark:bg-slate-900/40">
 <div className="flex items-center gap-3">
 <div className="flex size-9 items-center justify-center rounded-xl bg-gradient-to-br from-sky-500 via-sky-600 to-blue-600 text-white border border-sky-300/30 shrink-0">
 <Download className="size-4.5 text-white" strokeWidth={2.2} />
 </div>
 <div>
 <p className="text-xs font-bold text-slate-800 dark:text-slate-100">Unduh Format Berkas</p>
 <p className="text-[11px] text-slate-500 dark:text-slate-400">Gunakan berkas template resmi agar kolom terpetakan otomatis</p>
 </div>
 </div>
 <div className="flex items-center gap-2 shrink-0">
 <button
 type="button"
 onClick={() => handleDownloadTemplate('xlsx')}
 className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-200 bg-emerald-50/50 hover:bg-emerald-100/70 text-[#0E5C44] px-3 py-1.5 text-xs font-bold transition-all dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 cursor-pointer hover:scale-[1.02] active:scale-95"
 >
 <div className="flex size-5 items-center justify-center rounded-md bg-emerald-600 text-white">
 <Download className="size-3 text-white" strokeWidth={2.2} />
 </div>
 <span>Excel (.xlsx)</span>
 </button>
 <button
 type="button"
 onClick={() => handleDownloadTemplate('csv')}
 className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-100 transition-all dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 cursor-pointer hover:scale-[1.02] active:scale-95"
 >
 <div className="flex size-5 items-center justify-center rounded-md bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-200">
 <Download className="size-3" strokeWidth={2.2} />
 </div>
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
 Mendukung format Microsoft Excel (.xlsx, .xls) & CSV
 </p>
 {importFile && (
 <div className="mt-2.5 inline-flex items-center gap-1.5 rounded-full bg-emerald-100/80 px-3 py-1 text-[11px] font-bold text-[#0E5C44] border border-emerald-200 dark:bg-emerald-950/80 dark:text-emerald-300 dark:border-emerald-800/80">
 <CheckCircle2 className="size-3.5" />
 <span>{(importFile.size / 1024).toFixed(1)} KB · Berkas Siap Diunggah</span>
 </div>
 )}
 <input type="file" accept=".csv, .xlsx, .xls" onChange={handleFileSelect} className="hidden" />
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
 </div>
 <div className="max-h-44 overflow-auto rounded-2xl border border-emerald-200/80 bg-white shadow-2xs dark:border-emerald-900/50 dark:bg-[#182232]">
 <table className="w-full text-left text-[11px]">
 <thead className="bg-gradient-to-r from-emerald-100/80 via-teal-50/60 to-emerald-100/80 border-b border-emerald-200/80 dark:from-emerald-950/80 dark:via-teal-950/60 dark:to-emerald-950/80 dark:border-emerald-900/50 font-bold text-slate-700 dark:text-slate-200">
 <tr>
 {['Kode', 'Nama Unit', 'Jenis / Jenjang', 'Status'].map(h => (
 <th key={h} className="px-3 py-2.5">{h}</th>
 ))}
 </tr>
 </thead>
 <tbody className="divide-y divide-emerald-100/80 dark:divide-emerald-900/40">
 {importPreviewData.map((r, i) => (
 <tr key={i} className="hover:bg-emerald-50/30 dark:hover:bg-slate-800/40 transition-colors">
 <td className="px-3 py-2 font-mono font-semibold text-slate-700 dark:text-slate-300">{r.kode}</td>
 <td className="px-3 py-2 font-medium text-slate-900 dark:text-white">{r.nama}</td>
 <td className="px-3 py-2 text-slate-600 dark:text-slate-300">{r.tingkat}</td>
 <td className="px-3 py-2">
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

 {/* Imported Data Summary */}
 {importedData.length > 0 && (
 <InlineAlert
 type="success"
 message={`${importedData.filter(r => r.status === 'Berhasil').length} data berhasil diimpor, ${importedData.filter(r => r.status === 'Gagal').length} gagal.`}
 />
 )}

 {/* Guidance Banner */}
 <div className="rounded-2xl border border-emerald-200/80 bg-emerald-50/70 p-3.5 dark:border-emerald-800/50 dark:bg-emerald-950/30 flex items-start gap-2.5">
 <ShieldCheck className="size-4.5 text-[#0E5C44] dark:text-emerald-400 shrink-0 mt-0.5" />
 <p className="text-xs text-slate-700 dark:text-slate-200 leading-relaxed">
 Sistem akan otomatis memvalidasi keunikan kode unit dan menyinkronkan data master unit tanpa merusak integritas relasi yang sudah ada.
 </p>
 </div>
 </div>

 {/* Footer */}
 <div className="modal-footer flex items-center justify-between border-t border-slate-100 bg-slate-50/50 px-6 py-4 dark:border-slate-800 dark:bg-slate-900/30">
 <button
 type="button"
 onClick={() => setShowImportModal(false)}
 className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-br from-rose-500 via-rose-600 to-red-700 text-white px-4 py-2.5 text-xs font-extrabold border border-rose-300/40 transition-all duration-200 hover:scale-[1.03] active:scale-95 cursor-pointer"
 >
 <div className="flex size-5 items-center justify-center rounded-lg bg-white/20 text-white">
 <X className="size-3.5 text-white" strokeWidth={2.2} />
 </div>
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
 <div className="flex size-5 items-center justify-center rounded-lg bg-white/20 text-white">
 <Upload className="size-3.5 text-white" strokeWidth={2.25} />
 </div>
 )}
 <span>{isImporting ? 'Memproses Impor...' : 'Mulai Impor Data'}</span>
 </button>
 </div>
 </div>
 </motion.div>
 </div>
 )}
 </AnimatePresence>

 {/* Modal 2: Quick Add Pegawai (Overlay Modal on top of Modal 1) */}
 <AnimatePresence>
 {isAddEmployeeModalOpen && (
 <div
 role="dialog"
 tabIndex={-1}
 aria-modal="true"
 aria-labelledby="quick-add-emp-title"
 className="overlay modal fixed inset-0 z-[60] flex items-center justify-center p-3 sm:p-5 bg-slate-950/70 backdrop-blur-md"
 onMouseDown={e => {
 if (e.target === e.currentTarget) setIsAddEmployeeModalOpen(false)
 }}
 >
 <motion.div
 initial={{ opacity: 0, scale: 0.95, y: 16 }}
 animate={{ opacity: 1, scale: 1, y: 0 }}
 exit={{ opacity: 0, scale: 0.96, y: 12 }}
 transition={{ type: 'spring', stiffness: 400, damping: 30 }}
 className="modal-dialog font-sans w-full max-w-lg"
 >
 <div className="modal-content relative flex max-h-[calc(100dvh-2rem)] flex-col overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-2xl shadow-emerald-950/20 dark:border-slate-800 dark:bg-[#182232] dark:shadow-black/60">
 {/* Top Accent Gradient Bar */}
 <div className="h-1.5 w-full bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-600 shrink-0" />

 {/* Header */}
 <div className="modal-header flex items-center justify-between border-b border-slate-100 bg-white px-6 py-4.5 dark:border-slate-800 dark:bg-slate-950">
 <div className="flex items-center gap-3">
 <div className="flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700 text-white shadow-md shadow-emerald-500/20 border border-emerald-300/30 shrink-0">
 <UserPlus className="h-5 w-5 text-white" strokeWidth={2.25} />
 </div>
 <div>
 <h3 id="quick-add-emp-title" className="modal-title text-sm sm:text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
 <span>Tambah Pegawai Cepat</span>
 <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-800 border border-emerald-200/80 dark:bg-emerald-950/60 dark:text-emerald-400 dark:border-emerald-800/60">
 <Sparkles className="size-3" />
 Pimpinan Baru
 </span>
 </h3>
 <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
 Daftarkan calon kepala sekolah / pimpinan unit secara langsung
 </p>
 </div>
 </div>
 <button
 type="button"
 onClick={() => setIsAddEmployeeModalOpen(false)}
 aria-label="Tutup modal"
 className="size-9 flex items-center justify-center rounded-2xl bg-gradient-to-br from-rose-500 via-rose-600 to-red-700 text-white hover:scale-105 active:scale-95 transition-all duration-200 shadow-md shadow-rose-500/20 cursor-pointer"
 >
 <X className="size-4 text-white" strokeWidth={2.25} />
 </button>
 </div>

 {/* Form */}
 <form
 onSubmit={e => {
 e.preventDefault()
 if (!employeeFormData.name?.trim()) {
 setEmployeeFormAlert('Nama lengkap pegawai wajib diisi.')
 return
 }
 createEmployeeMutation.mutate({
 nama_lengkap: employeeFormData.name,
 name: employeeFormData.name,
 nip: employeeFormData.nip,
 nipy: employeeFormData.nip,
 jabatan: employeeFormData.jabatan_name || 'Kepala Sekolah',
 jabatan_name: employeeFormData.jabatan_name || 'Kepala Sekolah',
 email: employeeFormData.email,
 phone: employeeFormData.phone,
 no_telepon: employeeFormData.phone,
 is_active: 1,
 })
 }}
 className="flex flex-col min-h-0 flex-1"
 >
 <div className="modal-body min-h-0 flex-1 overflow-y-auto p-6 space-y-4">
 {employeeFormAlert && (
 <InlineAlert
 type="error"
 message={employeeFormAlert}
 onClose={() => setEmployeeFormAlert(null)}
 />
 )}

 {/* Nama Pegawai */}
 <div className="space-y-1.5">
 <label htmlFor="emp_name" className="block text-xs font-bold text-slate-700 dark:text-slate-200">
 Nama Lengkap Pegawai <span className="text-rose-500">*</span>
 </label>
 <div className="relative flex items-center">
 <div className="pointer-events-none absolute left-3.5 flex items-center text-slate-400 dark:text-slate-500">
 <UserCheck className="size-4" />
 </div>
 <input
 id="emp_name"
 type="text"
 required
 placeholder="Contoh: Dr. H. Ahmad Dahlan, M.Pd."
 value={employeeFormData.name}
 onChange={e => setEmployeeFormData(p => ({ ...p, name: e.target.value }))}
 className="w-full rounded-2xl border border-slate-200 bg-white pl-10 pr-4 py-2.5 text-xs font-semibold text-slate-800 placeholder-slate-400 shadow-xs focus:border-emerald-500 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder-slate-500 transition-colors"
 />
 </div>
 </div>

 {/* NIP / NIY */}
 <div className="space-y-1.5">
 <label htmlFor="emp_nip" className="block text-xs font-bold text-slate-700 dark:text-slate-200">
 NIP / NIY / NIPY
 </label>
 <div className="relative flex items-center">
 <div className="pointer-events-none absolute left-3.5 flex items-center text-slate-400 dark:text-slate-500">
 <Hash className="size-4" />
 </div>
 <input
 id="emp_nip"
 type="text"
 placeholder="Contoh: 198001012005011001 atau NIY-2024001"
 value={employeeFormData.nip}
 onChange={e => setEmployeeFormData(p => ({ ...p, nip: e.target.value }))}
 className="w-full rounded-2xl border border-slate-200 bg-white pl-10 pr-4 py-2.5 text-xs font-semibold text-slate-800 placeholder-slate-400 shadow-xs focus:border-emerald-500 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder-slate-500 transition-colors"
 />
 </div>
 </div>

 {/* Jabatan */}
 <div className="space-y-1.5">
 <label htmlFor="emp_jabatan" className="block text-xs font-bold text-slate-700 dark:text-slate-200">
 Jabatan Pegawai
 </label>
 <div className="relative flex items-center">
 <div className="pointer-events-none absolute left-3.5 flex items-center text-slate-400 dark:text-slate-500">
 <Briefcase className="size-4" />
 </div>
 <input
 id="emp_jabatan"
 type="text"
 placeholder="Contoh: Kepala Sekolah / Pimpinan Pondok"
 value={employeeFormData.jabatan_name}
 onChange={e => setEmployeeFormData(p => ({ ...p, jabatan_name: e.target.value }))}
 className="w-full rounded-2xl border border-slate-200 bg-white pl-10 pr-4 py-2.5 text-xs font-semibold text-slate-800 placeholder-slate-400 shadow-xs focus:border-emerald-500 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder-slate-500 transition-colors"
 />
 </div>
 </div>

 {/* Email & Phone */}
 <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
 <div className="space-y-1.5">
 <label htmlFor="emp_email" className="block text-xs font-bold text-slate-700 dark:text-slate-200">Email Pegawai</label>
 <div className="relative flex items-center">
 <div className="pointer-events-none absolute left-3.5 flex items-center text-slate-400 dark:text-slate-500">
 <Mail className="size-4" />
 </div>
 <input
 id="emp_email"
 type="email"
 placeholder="pegawai@sekolah.sch.id"
 value={employeeFormData.email}
 onChange={e => setEmployeeFormData(p => ({ ...p, email: e.target.value }))}
 className="w-full rounded-2xl border border-slate-200 bg-white pl-10 pr-4 py-2.5 text-xs font-semibold text-slate-800 placeholder-slate-400 shadow-xs focus:border-emerald-500 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder-slate-500 transition-colors"
 />
 </div>
 </div>
 <div className="space-y-1.5">
 <label htmlFor="emp_phone" className="block text-xs font-bold text-slate-700 dark:text-slate-200">No. Telepon / WA</label>
 <div className="relative flex items-center">
 <div className="pointer-events-none absolute left-3.5 flex items-center text-slate-400 dark:text-slate-500">
 <Phone className="size-4" />
 </div>
 <input
 id="emp_phone"
 type="text"
 placeholder="08123456789"
 value={employeeFormData.phone}
 onChange={e => setEmployeeFormData(p => ({ ...p, phone: e.target.value }))}
 className="w-full rounded-2xl border border-slate-200 bg-white pl-10 pr-4 py-2.5 text-xs font-semibold text-slate-800 placeholder-slate-400 shadow-xs focus:border-emerald-500 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder-slate-500 transition-colors"
 />
 </div>
 </div>
 </div>
 </div>

 {/* Footer */}
 <div className="modal-footer flex items-center justify-end gap-2.5 border-t border-slate-100 bg-slate-50/80 px-6 py-4 dark:border-slate-800 dark:bg-[#131B27]">
              <button
                type="button"
                onClick={() => setIsAddEmployeeModalOpen(false)}
                className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-br from-rose-500 via-rose-600 to-red-700 text-white px-4 py-2.5 text-xs font-extrabold border border-rose-300/40 transition-all duration-200 hover:scale-[1.03] active:scale-95 cursor-pointer"
              >
                <div className="flex size-5 items-center justify-center rounded-lg bg-white/20 text-white">
                  <X className="size-3.5 text-white" strokeWidth={2.2} />
                </div>
                <span>Batal</span>
              </button>
              <button
                type="submit"
                disabled={createEmployeeMutation.isPending}
                className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700 text-white px-5 py-2.5 text-xs font-extrabold border border-emerald-300/40 transition-all duration-200 hover:scale-[1.03] active:scale-95 disabled:opacity-50 cursor-pointer"
              >
                {createEmployeeMutation.isPending ? (
                  <span className="size-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                ) : (
                  <div className="flex size-5 items-center justify-center rounded-lg bg-white/20 text-white">
                    <Save className="size-3.5 text-white" strokeWidth={2.2} />
                  </div>
                )}
                <span>{createEmployeeMutation.isPending ? 'Menyimpan...' : 'Simpan Pegawai'}</span>
              </button>
 </div>
 </form>
 </div>
 </motion.div>
 </div>
 )}
 </AnimatePresence>

 {/* TailGrids Print & PDF Download Scope Selection Modal */}
 <AnimatePresence>
 {printOptionModalOpen && (
 <div
 role="dialog"
 tabIndex={-1}
 aria-modal="true"
 aria-labelledby="print-option-modal-title"
 className="overlay modal fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/70 backdrop-blur-md"
 onMouseDown={e => { if (e.target === e.currentTarget) setPrintOptionModalOpen(false) }}
 >
 <motion.div
 initial={{ opacity: 0, scale: 0.95, y: 16 }}
 animate={{ opacity: 1, scale: 1, y: 0 }}
 exit={{ opacity: 0, scale: 0.96, y: 12 }}
 transition={{ type: 'spring', stiffness: 400, damping: 30 }}
 className="modal-dialog font-sans w-full max-w-lg"
 >
 <div className="modal-content relative flex max-h-[calc(100dvh-2rem)] flex-col overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-2xl shadow-emerald-950/20 dark:border-slate-800 dark:bg-[#182232] dark:shadow-black/60">
 {/* Top Accent Gradient Bar */}
 <div className="h-1.5 w-full bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-600 shrink-0" />

 {/* Header */}
 <div className="modal-header flex items-center justify-between border-b border-slate-100 bg-white px-6 py-4.5 dark:border-slate-800 dark:bg-slate-950">
 <div className="flex items-center gap-3">
 <div className="rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200/60 p-2.5 text-[#0E5C44] shadow-xs dark:from-emerald-950/60 dark:to-teal-950/40 dark:border-emerald-800/60 dark:text-[#3FBF75]">
 <Printer className="h-5 w-5" strokeWidth={2.25} />
 </div>
 <div>
 <h3 id="print-option-modal-title" className="modal-title text-sm sm:text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
 <span>Opsi & Scope Cetak Laporan</span>
 <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-[#0E5C44] border border-emerald-200/80 dark:bg-emerald-950/60 dark:text-emerald-400 dark:border-emerald-800/60">
 <Sparkles className="size-3" />
 Cetak & PDF
 </span>
 </h3>
 <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
 Pilih jenis laporan yang ingin dicetak atau diunduh
 </p>
 </div>
 </div>
 <button
 type="button"
 onClick={() => setPrintOptionModalOpen(false)}
 aria-label="Tutup modal"
 className="rounded-xl p-2 bg-gradient-to-br from-rose-500 via-rose-600 to-red-700 text-white border border-rose-300/40 hover:scale-105 transition-all duration-200 active:scale-95 cursor-pointer"
 >
 <X className="size-4" strokeWidth={2.25} />
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
 className={`flex items-start gap-3.5 p-4 rounded-2xl border cursor-pointer transition-all duration-200 ${
 printScopeMode === 'all'
 ? 'border-[#0E5C44] bg-emerald-50/70 dark:border-emerald-500 dark:bg-emerald-950/40 shadow-xs ring-1 ring-[#0E5C44]'
 : 'border-slate-200/80 bg-white hover:bg-slate-50/80 dark:border-slate-800 dark:bg-slate-900/40'
 }`}
 >
 <div className={`mt-0.5 size-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
 printScopeMode === 'all' ? 'border-[#0E5C44] bg-[#0E5C44] text-white' : 'border-slate-300 dark:border-slate-600'
 }`}>
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
 className={`flex items-start gap-3.5 p-4 rounded-2xl border cursor-pointer transition-all duration-200 ${
 printScopeMode === 'pegawai'
 ? 'border-[#0E5C44] bg-emerald-50/70 dark:border-emerald-500 dark:bg-emerald-950/40 shadow-xs ring-1 ring-[#0E5C44]'
 : 'border-slate-200/80 bg-white hover:bg-slate-50/80 dark:border-slate-800 dark:bg-slate-900/40'
 }`}
 >
 <div className={`mt-0.5 size-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
 printScopeMode === 'pegawai' ? 'border-[#0E5C44] bg-[#0E5C44] text-white' : 'border-slate-300 dark:border-slate-600'
 }`}>
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
 className={`flex items-start gap-3.5 p-4 rounded-2xl border cursor-pointer transition-all duration-200 ${
 printScopeMode === 'siswa'
 ? 'border-[#0E5C44] bg-emerald-50/70 dark:border-emerald-500 dark:bg-emerald-950/40 shadow-xs ring-1 ring-[#0E5C44]'
 : 'border-slate-200/80 bg-white hover:bg-slate-50/80 dark:border-slate-800 dark:bg-slate-900/40'
 }`}
 >
 <div className={`mt-0.5 size-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
 printScopeMode === 'siswa' ? 'border-[#0E5C44] bg-[#0E5C44] text-white' : 'border-slate-300 dark:border-slate-600'
 }`}>
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
 <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2.5">
 <button
 type="button"
 onClick={() => {
 setPrintOptionModalOpen(false)
 handlePrintClean(printScopeMode)
 }}
 className="w-full flex items-center justify-between p-3.5 rounded-2xl border border-emerald-200/80 bg-emerald-50/70 hover:bg-emerald-100/70 dark:border-emerald-800/60 dark:bg-emerald-950/40 dark:hover:bg-emerald-900/50 text-left transition-all duration-200 cursor-pointer shadow-2xs hover:shadow-xs group"
 >
 <div className="flex items-center gap-3">
 <div className="size-9 rounded-xl bg-gradient-to-br from-[#0E5C44] to-[#147B5B] text-white flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
 <Printer className="size-4.5" strokeWidth={2.25} />
 </div>
 <div>
 <h5 className="text-xs font-black text-slate-900 dark:text-white">Cetak Langsung (Print Clean)</h5>
 <p className="text-[11px] text-slate-500 dark:text-slate-400">Buka tampilan cetak bersih tanpa artefak UI</p>
 </div>
 </div>
 </button>

 <button
 type="button"
 onClick={() => {
 setPrintOptionModalOpen(false)
 handleDownloadPdfTable(printScopeMode)
 }}
 className="w-full flex items-center justify-between p-3.5 rounded-2xl border border-rose-200/80 bg-rose-50/70 hover:bg-rose-100/70 dark:border-rose-900/40 dark:bg-rose-950/30 dark:hover:bg-rose-900/40 text-left transition-all duration-200 cursor-pointer shadow-2xs hover:shadow-xs group"
 >
 <div className="flex items-center gap-3">
 <div className="size-9 rounded-xl bg-gradient-to-br from-rose-600 to-rose-700 text-white flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
 <Download className="size-4.5" strokeWidth={2.25} />
 </div>
 <div>
 <h5 className="text-xs font-black text-slate-900 dark:text-white">Unduh Berkas PDF (.pdf)</h5>
 <p className="text-[11px] text-slate-500 dark:text-slate-400">Unduh berkas laporan dalam format PDF resmi</p>
 </div>
 </div>
 </button>
 </div>
 </div>

 {/* Footer */}
 <div className="modal-footer flex items-center justify-end border-t border-slate-100 bg-slate-50/80 px-6 py-4 dark:border-slate-800 dark:bg-[#131B27]">
 <button
 type="button"
 onClick={() => setPrintOptionModalOpen(false)}
 className="inline-flex items-center gap-1.5 rounded-2xl bg-gradient-to-br from-rose-500 via-rose-600 to-red-700 text-white px-4 py-2.5 text-xs font-extrabold border border-rose-300/40 transition-all duration-200 hover:scale-[1.03] active:scale-95 cursor-pointer"
 >
 Batal
 </button>
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
