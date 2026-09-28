import React, { useState, useEffect, useRef, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  QrCode,
  Radio,
  UserCheck,
  UserX,
  Clock,
  AlertTriangle,
  LogOut,
  LogIn,
  Search,
  RefreshCw,
  CheckCircle2,
  XCircle,
  ShieldCheck,
  Building2,
  Users,
  Camera,
  CameraOff,
  X,
  Wifi,
  ChevronDown,
  Settings,
  Sparkles,
  Lock,
  Layers,
  Eye,
  Hash,
} from 'lucide-react'
import { gateAttendanceService } from '../services/gateAttendanceService'
import { educationUnitService } from '../services/educationUnitService'
import { studentService } from '../services/studentService'
import { useAuthStore } from '../stores/authStore'
import { cn } from '../lib/utils'
import AppBreadcrumb from '../components/app/AppBreadcrumb'
import PageContainer from '../components/app/PageContainer'
import AppBadge from '../components/app/AppBadge'
import AppSkeleton from '../components/app/AppSkeleton'
import AppEmptyState from '../components/app/AppEmptyState'
import { SquircleActionButton, MasterActionButton, MasterActionIconButton } from '../components/master-data'

// ── SEMANTIC TOAST STACK (§L Tailgrids_Pengaturan_Halaman) ───────────────────
const TOAST_TONE = { success: 'success', error: 'error', danger: 'error', warning: 'warning', info: 'info' }

function ToastStack({ items, onDismiss }) {
  if (!items?.length) return null
  return (
    <div className="fixed bottom-6 right-4 z-[200] flex flex-col gap-2.5 sm:right-6 max-w-sm w-full pointer-events-none print:hidden" aria-live="polite" aria-atomic="true">
      {items.map((n) => {
        const tone = TOAST_TONE[n.type] || 'info'
        const isDanger = tone === 'error' || tone === 'danger'
        const isWarning = tone === 'warning'
        const isInfo = tone === 'info'
        const isSuccess = !isDanger && !isWarning && !isInfo
        return (
          <div
            key={n.id}
            className={cn(
              'relative pointer-events-auto flex flex-col overflow-hidden rounded-2xl border-2 bg-white/95 dark:bg-[#182232]/95 backdrop-blur-md p-3.5 shadow-2xl transition-all duration-300 animate-[masterDropdownSlide_0.25s_ease-out]',
              isSuccess && 'border-emerald-500/40 shadow-emerald-950/15 dark:border-emerald-600/50 dark:shadow-black/50',
              isDanger && 'border-rose-400/50 shadow-rose-950/15 dark:border-rose-600/50 dark:shadow-black/50',
              isWarning && 'border-amber-400/50 shadow-amber-950/15 dark:border-amber-600/50 dark:shadow-black/50',
              isInfo && 'border-sky-400/50 shadow-sky-950/15 dark:border-sky-600/50 dark:shadow-black/50'
            )}
          >
            <div className={cn(
              'absolute top-0 left-0 right-0 h-1',
              isSuccess && 'bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-600',
              isDanger && 'bg-gradient-to-r from-rose-500 via-rose-600 to-red-700',
              isWarning && 'bg-gradient-to-r from-amber-400 via-amber-500 to-orange-600',
              isInfo && 'bg-gradient-to-r from-sky-400 via-blue-500 to-indigo-600'
            )} />
            <div className="flex items-start gap-3 mt-0.5">
              <div className={cn(
                'flex size-9 shrink-0 items-center justify-center rounded-xl text-white shadow-sm',
                isSuccess && 'bg-gradient-to-br from-emerald-500 to-teal-600 shadow-emerald-500/30',
                isDanger && 'bg-gradient-to-br from-rose-500 to-red-600 shadow-rose-500/30',
                isWarning && 'bg-gradient-to-br from-amber-500 to-orange-600 shadow-amber-500/30',
                isInfo && 'bg-gradient-to-br from-sky-500 to-blue-600 shadow-sky-500/30'
              )}>
                {isSuccess && <CheckCircle2 className="size-5" strokeWidth={2.3} />}
                {isDanger && <XCircle className="size-5" strokeWidth={2.3} />}
                {isWarning && <AlertTriangle className="size-5" strokeWidth={2.3} />}
                {isInfo && <Eye className="size-5" strokeWidth={2.3} />}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <h4 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white">{n.title}</h4>
                  <span className={cn(
                    'inline-flex items-center rounded-full px-2 py-0.2 text-[10px] font-bold border',
                    isSuccess && 'bg-emerald-50 text-[#0E5C44] border-emerald-200/80 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800/80',
                    isDanger && 'bg-rose-50 text-rose-700 border-rose-200/80 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800/80',
                    isWarning && 'bg-amber-50 text-amber-800 border-amber-200/80 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800/80',
                    isInfo && 'bg-sky-50 text-sky-800 border-sky-200/80 dark:bg-sky-950/60 dark:text-sky-300 dark:border-sky-800/80'
                  )}>
                    {isSuccess ? 'Sukses' : isDanger ? 'Gagal' : isWarning ? 'Perhatian' : 'Info'}
                  </span>
                </div>
                {n.message && (
                  <p className="mt-1 text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-medium">{n.message}</p>
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
          </div>
        )
      })}
    </div>
  )
}

// ── SUB-KOMPONEN MODERN KPI CARDS (§C Tailgrids_Pengaturan_Halaman) ──
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
  rose: {
    card: 'border-rose-300/70 bg-gradient-to-br from-rose-50 via-pink-50/60 to-white hover:border-rose-400 dark:border-rose-700/50 dark:from-rose-950/40 dark:via-pink-950/20 dark:to-slate-900',
    glow: 'bg-rose-400/20 group-hover:bg-rose-400/30',
    iconBox: 'bg-gradient-to-br from-rose-500 to-pink-600 text-white shadow-rose-500/30',
    tag: 'bg-rose-100 text-rose-700 dark:bg-rose-900/60 dark:text-rose-300',
    title: 'text-rose-700 dark:text-rose-400',
    val: 'text-rose-700 dark:text-rose-300',
    sub: 'text-rose-600/80 dark:text-rose-400/80',
    cta: 'text-rose-600/60 dark:text-rose-500/60',
  },
  indigo: {
    card: 'border-indigo-300/70 bg-gradient-to-br from-indigo-50 via-sky-50/60 to-white hover:border-indigo-400 dark:border-indigo-700/50 dark:from-indigo-950/40 dark:via-sky-950/20 dark:to-slate-900',
    glow: 'bg-indigo-400/20 group-hover:bg-indigo-400/30',
    iconBox: 'bg-gradient-to-br from-indigo-500 to-sky-600 text-white shadow-indigo-500/30',
    tag: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/60 dark:text-indigo-300',
    title: 'text-indigo-700 dark:text-indigo-400',
    val: 'text-indigo-700 dark:text-indigo-300',
    sub: 'text-indigo-600/80 dark:text-indigo-400/80',
    cta: 'text-indigo-600/60 dark:text-indigo-500/60',
  },
  purple: {
    card: 'border-purple-300/70 bg-gradient-to-br from-purple-50 via-indigo-50/60 to-white hover:border-purple-400 dark:border-purple-700/50 dark:from-purple-950/40 dark:via-indigo-950/20 dark:to-slate-900',
    glow: 'bg-purple-400/20 group-hover:bg-purple-400/30',
    iconBox: 'bg-gradient-to-br from-purple-500 to-indigo-600 text-white shadow-purple-500/30',
    tag: 'bg-purple-100 text-purple-700 dark:bg-purple-900/60 dark:text-purple-300',
    title: 'text-purple-700 dark:text-purple-400',
    val: 'text-purple-700 dark:text-purple-300',
    sub: 'text-purple-600/80 dark:text-purple-400/80',
    cta: 'text-purple-600/60 dark:text-purple-500/60',
  },
}

function GateKpiCard({ icon: Icon, title, value, subtext, tag, tone = 'emerald', onClick }) {
  const t = MODERN_CARD_TONES[tone] || MODERN_CARD_TONES.emerald
  const isClickable = typeof onClick === 'function'

  return (
    <motion.button
      type="button"
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      onClick={onClick}
      className={`group relative min-w-0 w-full sm:basis-[calc(50%_-_7px)] lg:basis-[calc(25%_-_10.5px)] grow overflow-hidden rounded-[18px] border-2 p-5 shadow-xs transition-[border-color,box-shadow] duration-150 text-left ${
        isClickable ? 'cursor-pointer hover:shadow-md' : 'cursor-default'
      } ${t.card}`}
    >
      {/* Ambient Glow */}
      <div className={`pointer-events-none absolute -top-8 -right-8 h-28 w-28 rounded-full blur-2xl transition-all ${t.glow}`} />

      {/* Header with Icon Box & Tag */}
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-white shadow-sm ${t.iconBox}`}>
            <Icon className="h-4.5 w-4.5" />
          </div>
          <div className="min-w-0 flex-1">
            <p className={`text-[11px] font-bold uppercase tracking-wider truncate ${t.title}`} title={title}>{title}</p>
          </div>
        </div>
        {tag && (
          <span className={`shrink-0 rounded-lg px-2 py-0.5 text-[10px] font-extrabold ${t.tag}`}>
            {tag}
          </span>
        )}
      </div>

      {/* Metric Value */}
      <p className={`text-3xl xl:text-4xl font-black tabular-nums truncate ${t.val}`} title={String(value ?? '0')}>
        {value ?? '0'}
      </p>
      {subtext && (
        <p className={`mt-0.5 text-[11px] font-semibold truncate ${t.sub}`}>
          {subtext}
        </p>
      )}

      {/* Click Affordance Footer */}
      {isClickable && (
        <p className={`mt-3 text-[10px] font-bold flex items-center gap-1 ${t.cta}`}>
          <Eye className="h-3 w-3" /> Klik untuk detail lengkap
        </p>
      )}
    </motion.button>
  )
}

export default function GateAttendancePage() {
  const storeUser = useAuthStore((state) => state.user)
  const localUser = (() => {
    try {
      return JSON.parse(localStorage.getItem('school_erp_user') || '{}')
    } catch {
      return {}
    }
  })()
  const currentUser = storeUser || localUser

  const userRole = String(
    currentUser?.role || currentUser?.user_type || currentUser?.roles?.[0]?.name || ''
  ).toLowerCase()

  const userUnitId =
    currentUser?.education_unit_id ||
    currentUser?.unit_id ||
    currentUser?.employee?.unit_id ||
    currentUser?.unit_pendidikan_id ||
    ''

  const isMultiUnitUser =
    !userRole ||
    [
      'superadmin',
      'admin',
      'yayasan',
      'pengurus_yayasan',
      'divisi_pendidikan',
      'direktur_pendidikan',
      'kabid_pendidikan',
      'pimpinan',
      'kepala_pendidikan',
    ].some((r) => userRole.includes(r))

  const [activeTab, setActiveTab] = useState('scan') // 'scan' | 'logs'
  const [scanMode, setScanMode] = useState('checkin') // 'checkin' | 'checkout'
  const [method, setMethod] = useState('QRCODE') // 'QRCODE' | 'RFID' | 'MANUAL'

  const [cardInput, setCardInput] = useState('')
  const [modalCardInput, setModalCardInput] = useState('')
  const [selectedUnit, setSelectedUnit] = useState(isMultiUnitUser ? '' : userUnitId)
  const [units, setUnits] = useState([])

  // Student search list for Manual TU Input mode
  const [studentSearch, setStudentSearch] = useState('')
  const [studentsList, setStudentsList] = useState([])
  const [loadingStudents, setLoadingStudents] = useState(false)

  // Toast notifications state
  const [toasts, setToasts] = useState([])
  const pushToast = (type, title, message = '') => {
    const id = Date.now() + Math.random()
    setToasts((prev) => [...prev, { id, type, title, message }])
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, 4000)
  }
  const dismissToast = (id) => setToasts((prev) => prev.filter((t) => t.id !== id))

  // Schedule Config State
  const [targetUnitForConfig, setTargetUnitForConfig] = useState('')
  const [scheduleConfig, setScheduleConfig] = useState({
    jam_masuk: '07:15',
    toleransi_menit: 10,
    jam_pulang: '14:15',
    jam_cutoff_alpha: '12:00',
  })
  const [allUnitsSchedules, setAllUnitsSchedules] = useState([])
  const [showScheduleModal, setShowScheduleModal] = useState(false)
  const [savingSchedule, setSavingSchedule] = useState(false)

  const [stats, setStats] = useState({
    total_siswa: 0,
    total_scanned: 0,
    hadir: 0,
    terlambat: 0,
    izin: 0,
    sakit: 0,
    belum_hadir: 0,
    alpha: 0,
    sudah_pulang: 0,
  })

  const [logs, setLogs] = useState([])
  const [loadingLogs, setLoadingLogs] = useState(false)
  const [processingScan, setProcessingScan] = useState(false)
  const [lastScanResult, setLastScanResult] = useState(null)

  // Camera Pop-up Modal State
  const [showCameraModal, setShowCameraModal] = useState(false)
  const [cameraActive, setCameraActive] = useState(false)
  const [cameraLoading, setCameraLoading] = useState(false)
  const [cameraError, setCameraError] = useState('')
  const videoRef = useRef(null)
  const streamRef = useRef(null)
  const scanTimerRef = useRef(null)
  const isScanningBusyRef = useRef(false)
  const lastScannedCodeRef = useRef('')

  // Synthetic beep sound via Web Audio API
  const playBeep = () => {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext
      if (!AudioCtx) return
      const ctx = new AudioCtx()
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'sine'
      osc.frequency.setValueAtTime(880, ctx.currentTime)
      gain.gain.setValueAtTime(0.18, ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15)
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.start()
      osc.stop(ctx.currentTime + 0.15)
    } catch {
      // Audio context restricted until user gesture, safely ignore
    }
  }

  // KPI Detail Modal State
  const [kpiModal, setKpiModal] = useState({
    isOpen: false,
    type: '',
    title: '',
    data: [],
    loading: false,
    search: '',
  })

  const openKpiModal = async (type) => {
    const titleMap = {
      total_siswa: 'Detail Data Total Siswa Terdaftar',
      hadir: 'Detail Data Siswa Hadir Tepat Waktu',
      terlambat: 'Detail Data Siswa Terlambat',
      izin_sakit: 'Detail Data Siswa Izin / Sakit',
      belum_hadir: 'Detail Data Siswa Belum Hadir',
      alpha: 'Detail Data Siswa Alpha / Tanpa Keterangan',
      sudah_pulang: 'Detail Data Siswa Sudah Pulang',
    }

    setKpiModal({
      isOpen: true,
      type,
      title: titleMap[type] || 'Detail Data Siswa',
      data: [],
      loading: true,
      search: '',
    })

    try {
      const [logsRes, studentsRes] = await Promise.all([
        gateAttendanceService.getLogs({ unit_id: selectedUnit, per_page: 500 }),
        studentService.getDaftar({ unit_id: selectedUnit, per_page: 500 }),
      ])

      const rawLogs = logsRes?.data?.data?.data || logsRes?.data?.data || []
      const rawStudents = studentsRes?.data?.data?.data || studentsRes?.data?.data || studentsRes?.data || []

      const logsByStudentId = {}
      if (Array.isArray(rawLogs)) {
        rawLogs.forEach((log) => {
          const sId = log.student_id || log.student?.id
          if (sId) {
            logsByStudentId[sId] = log
          }
        })
      }

      const combinedList = Array.isArray(rawStudents) && rawStudents.length > 0
        ? rawStudents.map((st) => {
            const log = logsByStudentId[st.id] || {}
            return {
              student_id: st.id,
              nama_lengkap: st.nama_lengkap || st.full_name || st.name || 'Siswa',
              nis: st.nis || st.nisn || '-',
              nisn: st.nisn || '-',
              kelas_name: st.kelas?.nama_kelas || st.kelas?.name || st.school_class?.name || '-',
              unit_name: st.education_unit?.name || st.unit_name || '-',
              check_in_time: log.check_in_time || null,
              check_out_time: log.check_out_time || null,
              status: log.status || 'BELUM_HADIR',
            }
          })
        : rawLogs.map((log) => ({
            student_id: log.student_id || log.student?.id,
            nama_lengkap: log.student?.nama_lengkap || log.student?.full_name || 'Siswa',
            nis: log.student?.nis || log.student?.nisn || '-',
            nisn: log.student?.nisn || '-',
            kelas_name: log.school_class?.name || log.school_class?.nama_kelas || '-',
            unit_name: log.education_unit?.name || '-',
            check_in_time: log.check_in_time || null,
            check_out_time: log.check_out_time || null,
            status: log.status || 'BELUM_HADIR',
          }))

      let filtered = combinedList
      if (type === 'hadir') {
        filtered = combinedList.filter((item) => item.status === 'HADIR' || item.status === 'HADIR_DALAM_TOLERANSI')
      } else if (type === 'terlambat') {
        filtered = combinedList.filter((item) => item.status === 'TERLAMBAT')
      } else if (type === 'izin_sakit') {
        filtered = combinedList.filter((item) => item.status === 'IZIN' || item.status === 'SAKIT')
      } else if (type === 'alpha') {
        filtered = combinedList.filter((item) => item.status === 'ALPHA')
      } else if (type === 'belum_hadir') {
        filtered = combinedList.filter((item) => item.status === 'BELUM_HADIR' || !item.check_in_time)
      } else if (type === 'sudah_pulang') {
        filtered = combinedList.filter((item) => Boolean(item.check_out_time))
      }

      setKpiModal((prev) => ({
        ...prev,
        data: filtered,
        loading: false,
      }))
    } catch (err) {
      console.error('Failed fetching KPI detail data:', err)
      setKpiModal((prev) => ({ ...prev, loading: false }))
    }
  }

  const closeKpiModal = () => {
    setKpiModal({
      isOpen: false,
      type: '',
      title: '',
      data: [],
      loading: false,
      search: '',
    })
  }

  const filteredKpiData = useMemo(() => {
    if (!kpiModal.search.trim()) return kpiModal.data
    const s = kpiModal.search.toLowerCase()
    return kpiModal.data.filter((item) =>
      String(item.nama_lengkap || '').toLowerCase().includes(s) ||
      String(item.nis || '').toLowerCase().includes(s) ||
      String(item.nisn || '').toLowerCase().includes(s) ||
      String(item.kelas_name || '').toLowerCase().includes(s)
    )
  }, [kpiModal.data, kpiModal.search])

  // Status Badge (§T.2 — AppBadge semantik)
  const renderStatusBadge = (status, checkOutTime) => {
    const st = String(status || '').toUpperCase()
    if (st === 'HADIR' || st === 'HADIR_DALAM_TOLERANSI') {
      return <AppBadge variant="success" dot><span className="inline-flex items-center gap-1"><CheckCircle2 className="h-3 w-3" /> Hadir</span></AppBadge>
    }
    if (st === 'TERLAMBAT') {
      return <AppBadge variant="warning" dot><span className="inline-flex items-center gap-1"><Clock className="h-3 w-3" /> Terlambat</span></AppBadge>
    }
    if (st === 'IZIN' || st === 'SAKIT') {
      return <AppBadge variant="info" dot><span className="inline-flex items-center gap-1"><ShieldCheck className="h-3 w-3" /> {st === 'IZIN' ? 'Izin' : 'Sakit'}</span></AppBadge>
    }
    if (st === 'ALPHA') {
      return <AppBadge variant="danger" dot><span className="inline-flex items-center gap-1"><XCircle className="h-3 w-3" /> Alpha</span></AppBadge>
    }
    if (checkOutTime) {
      return <AppBadge variant="purple" dot><span className="inline-flex items-center gap-1"><LogOut className="h-3 w-3" /> Sudah Pulang</span></AppBadge>
    }
    return <AppBadge variant="warning" dot><span className="inline-flex items-center gap-1"><AlertTriangle className="h-3 w-3" /> Belum Hadir</span></AppBadge>
  }

  useEffect(() => {
    fetchUnits()
    fetchStats()
    fetchLogs()
    fetchScheduleConfig()

    return () => {
      stopCamera()
    }
  }, [selectedUnit])

  useEffect(() => {
    if (!isMultiUnitUser && userUnitId && selectedUnit !== userUnitId) {
      setSelectedUnit(userUnitId)
    }
  }, [userUnitId, isMultiUnitUser])

  useEffect(() => {
    if (method === 'MANUAL') {
      fetchStudents()
    }
  }, [method, studentSearch, selectedUnit])

  useEffect(() => {
    if (showScheduleModal) {
      fetchAllUnitsSchedules()
    }
  }, [showScheduleModal, targetUnitForConfig])

  const fetchScheduleConfig = async () => {
    try {
      const res = await gateAttendanceService.getScheduleConfig({ unit_id: selectedUnit })
      if (res?.data?.data) {
        setScheduleConfig(res.data.data)
      }
    } catch (e) {
      console.error('Failed fetching schedule config:', e)
    }
  }

  const fetchAllUnitsSchedules = async () => {
    try {
      const res = await gateAttendanceService.getAllScheduleConfigs()
      if (res?.data?.data) {
        setAllUnitsSchedules(res.data.data.units || [])
        // Load target config
        const targetId = targetUnitForConfig || selectedUnit
        if (targetId) {
          const found = res.data.data.units?.find((u) => u.unit_id === targetId)
          if (found) {
            setScheduleConfig(found.schedule)
          }
        } else if (res.data.data.global) {
          setScheduleConfig(res.data.data.global)
        }
      }
    } catch (e) {
      console.error('Failed fetching all schedule configs:', e)
    }
  }

  const handleSaveScheduleConfig = async (e) => {
    e?.preventDefault()
    setSavingSchedule(true)
    const unitToSave = targetUnitForConfig || selectedUnit || null
    try {
      const res = await gateAttendanceService.saveScheduleConfig({
        unit_id: unitToSave,
        ...scheduleConfig,
      })
      pushToast('success', 'Pengaturan Disimpan!', res.data?.message || 'Pengaturan jam masuk dan jam pulang berhasil diperbarui.')
      setShowScheduleModal(false)
      fetchScheduleConfig()
    } catch (err) {
      pushToast('error', 'Gagal Menyimpan', err?.response?.data?.message || 'Gagal menyimpan pengaturan jadwal jam masuk/pulang.')
    } finally {
      setSavingSchedule(false)
    }
  }

  const fetchStudents = async () => {
    setLoadingStudents(true)
    try {
      const res = await studentService.getDaftar({
        search: studentSearch,
        unit_id: selectedUnit,
        per_page: 15,
      })
      const list = res?.data?.data || res?.data || []
      setStudentsList(list)
    } catch (e) {
      console.error('Failed fetching students:', e)
    } finally {
      setLoadingStudents(false)
    }
  }

  // Start webcam with fallback for laptop / mobile front/back camera
  const startCamera = async () => {
    setCameraLoading(true)
    setCameraError('')
    stopCamera()

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setCameraError('Browser Anda tidak mendukung WebRTC Camera atau context tidak aman. Pastikan menggunakan http://localhost atau HTTPS.')
      setCameraLoading(false)
      setCameraActive(false)
      return
    }

    try {
      let mediaStream = null

      // Strategy 1: Default laptop user-facing camera (Mac FaceTime HD Camera)
      try {
        mediaStream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } },
        })
      } catch (err1) {
        // Strategy 2: Environment camera (Back camera for phone/tablet)
        try {
          mediaStream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: { ideal: 'environment' } },
          })
        } catch (err2) {
          // Strategy 3: Standard unconstrained video
          mediaStream = await navigator.mediaDevices.getUserMedia({ video: true })
        }
      }

      streamRef.current = mediaStream

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream
        videoRef.current.setAttribute('playsinline', 'true')
        videoRef.current.muted = true
        try {
          await videoRef.current.play()
        } catch (playErr) {
          console.warn('Initial play error, attaching onloadedmetadata:', playErr)
          videoRef.current.onloadedmetadata = () => {
            videoRef.current?.play().catch(() => {})
          }
        }
      }
      setCameraActive(true)

      // Start automatic QR Code scanning loop using native BarcodeDetector if available
      if ('BarcodeDetector' in window) {
        try {
          const detector = new window.BarcodeDetector({ formats: ['qr_code'] })
          scanTimerRef.current = window.setInterval(async () => {
            if (!videoRef.current || videoRef.current.readyState < 2 || isScanningBusyRef.current) return
            try {
              const barcodes = await detector.detect(videoRef.current)
              if (barcodes && barcodes.length > 0) {
                const rawValue = barcodes[0].rawValue?.trim()
                if (rawValue && rawValue !== lastScannedCodeRef.current) {
                  isScanningBusyRef.current = true
                  lastScannedCodeRef.current = rawValue
                  playBeep()
                  setModalCardInput(rawValue)
                  await executeScan(rawValue)
                  setTimeout(() => {
                    isScanningBusyRef.current = false
                    lastScannedCodeRef.current = ''
                  }, 2500)
                }
              }
            } catch {
              // Frame without barcode, safely ignore
            }
          }, 250)
        } catch (detectorErr) {
          console.warn('BarcodeDetector error:', detectorErr)
        }
      }
    } catch (err) {
      console.error('Camera Access Error:', err)
      let msg = 'Kamera tidak dapat diakses.'
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        msg = 'Izin kamera diblokir oleh browser atau sistem operasi macOS. Silakan klik ikon gembok / slider di samping URL (localhost:5173), ubah "Camera" menjadi "Allow/Izinkan", dan pastikan izin kamera di macOS System Settings > Privacy & Security > Camera aktif untuk Google Chrome.'
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        msg = 'Perangkat webcam tidak terdeteksi pada laptop/komputer ini. Pastikan kamera terpasang dengan baik atau gunakan scanner kartu manual/barcode reader USB.'
      } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
        msg = 'Kamera sedang digunakan oleh aplikasi lain (seperti Zoom, FaceTime, atau tab lain). Tutup aplikasi tersebut lalu klik Coba Hubungkan Lagi.'
      } else if (err.name === 'OverconstrainedError') {
        msg = 'Pengaturan resolusi kamera tidak didukung oleh perangkat ini.'
      } else {
        msg = `Kamera tidak dapat diakses: ${err.message || err.name || 'Periksa izin browser Anda'}`
      }
      setCameraError(msg)
      setCameraActive(false)
    } finally {
      setCameraLoading(false)
    }
  }

  const stopCamera = () => {
    if (scanTimerRef.current) {
      clearInterval(scanTimerRef.current)
      scanTimerRef.current = null
    }
    isScanningBusyRef.current = false
    lastScannedCodeRef.current = ''
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop())
      streamRef.current = null
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null
    }
    setCameraActive(false)
  }

  const openCameraModal = () => {
    setShowCameraModal(true)
    setTimeout(() => {
      startCamera()
    }, 200)
  }

  const closeCameraModal = () => {
    stopCamera()
    setShowCameraModal(false)
  }

  const fetchUnits = async () => {
    try {
      const res = await educationUnitService.getDaftar({ per_page: 100 })
      const data = res?.data?.data?.data || res?.data?.data || res?.data || []
      setUnits(Array.isArray(data) ? data : [])
    } catch (e) {
      console.error('Failed fetching units:', e)
    }
  }

  const fetchStats = async () => {
    try {
      const res = await gateAttendanceService.getStats({ unit_id: selectedUnit })
      if (res?.data?.data) {
        setStats(res.data.data)
      }
    } catch (e) {
      console.error('Failed fetching stats:', e)
    }
  }

  const fetchLogs = async () => {
    setLoadingLogs(true)
    try {
      const res = await gateAttendanceService.getLogs({ unit_id: selectedUnit, per_page: 25 })
      const list = res?.data?.data?.data || res?.data?.data || []
      setLogs(list)
    } catch (e) {
      console.error('Failed fetching logs:', e)
    } finally {
      setLoadingLogs(false)
    }
  }

  const executeScan = async (codeToScan, studentId = null) => {
    setProcessingScan(true)
    try {
      const payload = {
        ...(studentId
          ? { student_id: studentId }
          : method === 'QRCODE'
            ? { qr_token: codeToScan.trim() }
            : { card_number: codeToScan.trim() }),
        unit_id: selectedUnit || undefined,
        attendance_method: method,
      }

      if (scanMode === 'checkin') {
        const res = await gateAttendanceService.scanCheckIn(payload)
        const studentName = res?.data?.data?.student?.nama_lengkap || res?.data?.data?.student?.full_name || 'Siswa'
        setLastScanResult({
          success: true,
          message: res.data.message,
          data: res.data.data,
        })
        pushToast('success', 'Presensi Masuk Berhasil!', `${studentName} telah tercatat melakukan absensi masuk gerbang.`)
      } else {
        const res = await gateAttendanceService.scanCheckOut(payload)
        const studentName = res?.data?.data?.student?.nama_lengkap || res?.data?.data?.student?.full_name || 'Siswa'
        setLastScanResult({
          success: true,
          message: res.data.message,
          data: res.data.data,
        })
        pushToast('success', 'Presensi Pulang Berhasil!', `${studentName} telah tercatat keluar dari sekolah.`)
      }

      setCardInput('')
      setModalCardInput('')
      fetchStats()
      fetchLogs()
      if (method === 'MANUAL') fetchStudents()
    } catch (err) {
      const msg = err?.response?.data?.message || 'Gagal memproses absensi.'
      setLastScanResult({
        success: false,
        message: msg,
      })
      pushToast('error', 'Absensi Gagal', msg)
    } finally {
      setProcessingScan(false)
    }
  }

  const handleScanSubmit = (e) => {
    e?.preventDefault()
    if (!cardInput.trim()) return
    executeScan(cardInput)
  }

  const handleModalScanSubmit = (e) => {
    e?.preventDefault()
    if (!modalCardInput.trim()) return
    executeScan(modalCardInput)
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
        delayChildren: 0.02,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 12 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' } },
  }

  return (
    <PageContainer>
    <motion.div initial="hidden" animate="visible" variants={containerVariants} className="space-y-6 pb-12">
      {/* Navigation Breadcrumb */}
      <motion.div variants={itemVariants} className="print:hidden">
        <AppBreadcrumb
          items={[
            { label: 'Dashboard', href: '/dashboard' },
            { label: 'Presensi & Kehadiran' },
            { label: 'Absensi Digital Gerbang' },
          ]}
        />
      </motion.div>

      {/* MODERN HERO CARD HEADER (MATCHING MONITORING & YAYASAN DASHBOARD STYLE) */}
      <motion.div variants={itemVariants} className="relative rounded-[22px] border-2 border-emerald-500/30 bg-gradient-to-r from-emerald-500/15 via-teal-500/10 to-emerald-600/15 p-5 sm:p-6 shadow-md shadow-emerald-500/10 dark:border-emerald-600/40 dark:bg-gradient-to-r dark:from-emerald-950/70 dark:via-teal-950/50 dark:to-slate-900 print:hidden">
        {/* Ambient Glow Background Accent (lapisan dalam agar tooltip squircle tidak terpenggal) */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-[22px]" aria-hidden="true">
          <div className="absolute -top-20 -right-20 h-56 w-56 rounded-full bg-gradient-to-br from-emerald-500/40 via-teal-400/30 to-emerald-600/20 blur-3xl dark:from-emerald-500/50 dark:via-teal-400/40" />
          <div className="absolute -bottom-20 -left-20 h-56 w-56 rounded-full bg-gradient-to-tr from-emerald-600/30 via-teal-500/20 to-transparent blur-3xl dark:from-emerald-600/40 dark:via-teal-500/30" />
        </div>

          <div className="relative z-10 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-start gap-3.5 sm:gap-4 min-w-0">
              <div className="flex size-11 sm:size-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700 text-white shadow-xl shadow-emerald-600/40 border border-emerald-300/40 dark:from-emerald-400 dark:via-emerald-500 dark:to-teal-600">
                <QrCode className="size-5 sm:size-7 text-white" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 sm:gap-2.5 flex-wrap">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-emerald-600 to-teal-600 px-3 py-0.5 sm:px-3.5 sm:py-1 text-[11px] sm:text-xs font-extrabold text-white shadow-md shadow-emerald-600/25 border border-emerald-300/40">
                    <ShieldCheck className="h-3.5 w-3.5" />
                    Terminal Absensi Gerbang
                  </span>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-0.5 text-xs font-extrabold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/60">
                    <Clock className="h-3.5 w-3.5 text-emerald-600" /> Jam Masuk: {scheduleConfig.jam_masuk} (Tol: {scheduleConfig.toleransi_menit}m) | Pulang: {scheduleConfig.jam_pulang}
                  </span>
                </div>
                <h1 className="mt-1.5 text-lg sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                  Absensi Gerbang Kedatangan &amp; Pulang Sekolah
                </h1>
              <p className="mt-0.5 text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300 max-w-2xl leading-relaxed">
                Terminal pemindaian real-time kartu siswa, QR Code, RFID, dan verifikasi kepulangan siswa terpadu.
              </p>
            </div>
          </div>

          {/* Action Controls: Unit Filter & Schedule Config Button */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0 self-start sm:self-auto flex-wrap z-10">
            {/* Unit Filter Field */}
            <div className="relative inline-flex items-center">
              <div className="pointer-events-none absolute left-3 flex items-center text-slate-400 dark:text-slate-500">
                {isMultiUnitUser ? (
                  <Building2 className="h-4 w-4 text-slate-400" />
                ) : (
                  <Lock className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                )}
              </div>
              <select
                disabled={!isMultiUnitUser}
                aria-label="Filter unit pendidikan"
                className={`h-10 appearance-none rounded-xl border pl-9 pr-8 text-xs font-semibold shadow-xs transition-all focus:outline-none ${
                  isMultiUnitUser
                    ? 'border-emerald-500/30 bg-white/90 text-slate-800 hover:border-emerald-500 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 dark:border-emerald-800 dark:bg-slate-900 dark:text-slate-100 cursor-pointer'
                    : 'border-emerald-200/80 bg-emerald-50/70 text-emerald-900 font-bold dark:border-emerald-900 dark:bg-emerald-950/60 dark:text-emerald-300 cursor-not-allowed'
                }`}
                value={selectedUnit}
                onChange={(e) => setSelectedUnit(e.target.value)}
              >
                {isMultiUnitUser && <option value="">Semua Unit Pendidikan</option>}
                {units.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.nama || u.name}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute right-2.5 flex items-center text-slate-400 dark:text-slate-500">
                <ChevronDown className="h-3.5 w-3.5" />
              </div>
            </div>

            {/* Schedule Config Button (§H.5 squircle) */}
            <SquircleActionButton
              variant="primary"
              icon={Settings}
              label="Pengaturan Jam per Unit"
              onClick={() => setShowScheduleModal(true)}
            />
          </div>
        </div>
      </motion.div>

      {/* Modern KPI Cards Grid (§C + §7.3 flex-wrap isi-penuh: 4 sebaris, sisa melebar) */}
      <motion.div variants={containerVariants} className="flex flex-wrap gap-3.5">
        <GateKpiCard
          icon={Users}
          title="Total Siswa"
          value={stats.total_siswa}
          subtext="Terdaftar Aktif"
          tag="Siswa"
          tone="emerald"
          onClick={() => openKpiModal('total_siswa')}
        />
        <GateKpiCard
          icon={UserCheck}
          title="Hadir Tepat Waktu"
          value={stats.hadir}
          subtext="Tepat Waktu"
          tag="Hadir"
          tone="emerald"
          onClick={() => openKpiModal('hadir')}
        />
        <GateKpiCard
          icon={Clock}
          title="Terlambat"
          value={stats.terlambat}
          subtext="Scan Gerbang"
          tag="Terlambat"
          tone="amber"
          onClick={() => openKpiModal('terlambat')}
        />
        <GateKpiCard
          icon={ShieldCheck}
          title="Izin / Sakit"
          value={stats.izin + stats.sakit}
          subtext="Disetujui TU"
          tag="Izin/Sakit"
          tone="blue"
          onClick={() => openKpiModal('izin_sakit')}
        />
        <GateKpiCard
          icon={AlertTriangle}
          title="Belum Hadir"
          value={stats.belum_hadir}
          subtext="Menunggu Scan"
          tag="Belum"
          tone="indigo"
          onClick={() => openKpiModal('belum_hadir')}
        />
        <GateKpiCard
          icon={UserX}
          title="Alpha"
          value={stats.alpha}
          subtext="Tanpa Berita"
          tag="Alpha"
          tone="rose"
          onClick={() => openKpiModal('alpha')}
        />
        <GateKpiCard
          icon={LogOut}
          title="Sudah Pulang"
          value={stats.sudah_pulang}
          subtext="Check-out Gate"
          tag="Pulang"
          tone="purple"
          onClick={() => openKpiModal('sudah_pulang')}
        />
      </motion.div>

      {/* Tabs */}
      <motion.div variants={itemVariants} className="flex border-b border-slate-200 dark:border-slate-800 relative" role="tablist" aria-label="Mode terminal absensi">
        <button
          role="tab"
          aria-selected={activeTab === 'scan'}
          onClick={() => setActiveTab('scan')}
          className={`relative flex items-center gap-2 px-4 py-3 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/40 rounded-t-lg ${
            activeTab === 'scan'
              ? 'text-emerald-600 dark:text-emerald-400 font-bold'
              : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'
          }`}
        >
          <QrCode className="h-4 w-4" /> Terminal Pemindaian
          {activeTab === 'scan' && (
            <motion.div
              layoutId="activeTabUnderline"
              className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-600 dark:bg-emerald-400"
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            />
          )}
        </button>
        <button
          role="tab"
          aria-selected={activeTab === 'logs'}
          onClick={() => setActiveTab('logs')}
          className={`relative flex items-center gap-2 px-4 py-3 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/40 rounded-t-lg ${
            activeTab === 'logs'
              ? 'text-emerald-600 dark:text-emerald-400 font-bold'
              : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'
          }`}
        >
          <Clock className="h-4 w-4" /> Log Real-Time Kedatangan & Pulang
          {activeTab === 'logs' && (
            <motion.div
              layoutId="activeTabUnderline"
              className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-600 dark:bg-emerald-400"
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            />
          )}
        </button>
      </motion.div>

      <AnimatePresence mode="wait">
        {activeTab === 'scan' && (
          <motion.div
            key="scan-tab"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="grid grid-cols-1 gap-6 lg:grid-cols-12"
          >
            {/* Main Terminal Panel */}
            <div className="space-y-6 lg:col-span-7">
              <div className="relative overflow-hidden rounded-[22px] border-2 border-emerald-300 bg-white p-5 sm:p-6 shadow-md shadow-emerald-500/10 dark:border-emerald-700/80 dark:bg-[#1B2433]">
                <div className="pointer-events-none absolute -top-10 -right-10 h-32 w-32 rounded-full bg-emerald-400/10 blur-2xl dark:bg-emerald-400/15" />
                {/* Scan Mode Switcher */}
                <div className="mb-6 grid grid-cols-2 gap-2 rounded-2xl bg-slate-100 p-1.5 dark:bg-slate-800" role="tablist" aria-label="Mode presensi">
                  <button
                    type="button"
                    role="tab"
                    aria-selected={scanMode === 'checkin'}
                    onClick={() => setScanMode('checkin')}
                    className={`relative flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/40 z-10 cursor-pointer ${
                      scanMode === 'checkin'
                        ? 'text-white'
                        : 'text-slate-600 hover:text-slate-900 dark:text-slate-300'
                    }`}
                  >
                    {scanMode === 'checkin' && (
                      <motion.div
                        layoutId="activeScanModeBg"
                        className="absolute inset-0 rounded-xl bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700 shadow-md shadow-emerald-600/30 -z-10"
                        transition={{ type: 'spring', stiffness: 400, damping: 28 }}
                      />
                    )}
                    <LogIn className="h-4 w-4" /> PRESENSI KEDATANGAN
                  </button>
                  <button
                    type="button"
                    role="tab"
                    aria-selected={scanMode === 'checkout'}
                    onClick={() => setScanMode('checkout')}
                    className={`relative flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/40 z-10 cursor-pointer ${
                      scanMode === 'checkout'
                        ? 'text-white'
                        : 'text-slate-600 hover:text-slate-900 dark:text-slate-300'
                    }`}
                  >
                    {scanMode === 'checkout' && (
                      <motion.div
                        layoutId="activeScanModeBg"
                        className="absolute inset-0 rounded-xl bg-gradient-to-br from-indigo-500 via-indigo-600 to-violet-700 shadow-md shadow-indigo-600/30 -z-10"
                        transition={{ type: 'spring', stiffness: 400, damping: 28 }}
                      />
                    )}
                    <LogOut className="h-4 w-4" /> PRESENSI PULANG
                  </button>
                </div>

                {/* Method Selector */}
                <div className="mb-6">
                  <label className="mb-1.5 block text-xs font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider">
                    Metode Scan
                  </label>
                  <div className="grid grid-cols-3 gap-2" role="tablist" aria-label="Metode pemindaian">
                    <button
                      type="button"
                      role="tab"
                      aria-selected={method === 'QRCODE'}
                      onClick={() => setMethod('QRCODE')}
                      className={`flex items-center justify-center gap-2 rounded-xl border p-3 text-xs font-bold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/40 cursor-pointer ${
                        method === 'QRCODE'
                          ? 'border-emerald-500 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300'
                          : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300'
                      }`}
                    >
                      <QrCode className="h-4 w-4" /> QR Code Kartu
                    </button>
                    <button
                      type="button"
                      role="tab"
                      aria-selected={method === 'RFID'}
                      onClick={() => setMethod('RFID')}
                      className={`flex items-center justify-center gap-2 rounded-xl border p-3 text-xs font-bold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/40 cursor-pointer ${
                        method === 'RFID'
                          ? 'border-emerald-500 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300'
                          : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300'
                      }`}
                    >
                      <Radio className="h-4 w-4" /> RFID Tap
                    </button>
                    <button
                      type="button"
                      role="tab"
                      aria-selected={method === 'MANUAL'}
                      onClick={() => setMethod('MANUAL')}
                      className={`flex items-center justify-center gap-2 rounded-xl border p-3 text-xs font-bold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/40 cursor-pointer ${
                        method === 'MANUAL'
                          ? 'border-emerald-500 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300'
                          : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300'
                      }`}
                    >
                      <UserCheck className="h-4 w-4" /> Input TU
                    </button>
                  </div>
                </div>

                {/* DYNAMIC ACTION VIEW 1: QR CODE METHOD */}
                {method === 'QRCODE' && (
                  <div className="space-y-4">
                    <div className="relative overflow-hidden rounded-2xl border border-emerald-100 bg-emerald-50/50 p-4 dark:border-emerald-950/50 dark:bg-emerald-950/20 flex items-center justify-between">
                      {/* Animated Laser Line */}
                      <motion.div
                        className="absolute left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-emerald-500 to-transparent shadow-[0_0_8px_rgba(16,185,129,0.8)] pointer-events-none"
                        animate={{ top: ['0%', '100%', '0%'] }}
                        transition={{ repeat: Infinity, duration: 2.5, ease: 'easeInOut' }}
                      />
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700 text-white shadow-sm border border-emerald-300/40 shrink-0">
                          <QrCode className="h-5 w-5" />
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-emerald-900 dark:text-emerald-200">Mode Pemindai QR Code Kartu</h4>
                          <p className="text-xs text-slate-600 dark:text-slate-400">Gunakan scanner USB atau buka kamera live browser.</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={openCameraModal}
                        className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700 text-white px-4 py-2.5 text-xs font-extrabold border border-emerald-300/40 hover:scale-[1.03] transition-all duration-200 active:scale-95 cursor-pointer whitespace-nowrap"
                      >
                        <div className="flex size-5 items-center justify-center rounded-lg bg-white/20 text-white">
                          <Camera className="size-3.5 text-white" strokeWidth={2.2} />
                        </div>
                        <span>Buka Kamera Pemindai</span>
                      </button>
                    </div>

                    <form onSubmit={handleScanSubmit} className="space-y-2">
                      <label htmlFor="gate-qr-input" className="block text-xs font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider">Input Hardware Scanner USB</label>
                      <div className="relative flex items-center">
                        <div className="pointer-events-none absolute left-3.5 flex items-center text-slate-400 dark:text-slate-500">
                          <QrCode className="size-4" />
                        </div>
                        <input
                          id="gate-qr-input"
                          type="text"
                          autoFocus
                          value={cardInput}
                          onChange={(e) => setCardInput(e.target.value)}
                          placeholder="Scan QR Code via scanner USB..."
                          className="w-full rounded-xl border border-slate-200/90 bg-slate-50/50 pl-10 pr-28 py-2.5 text-xs font-semibold text-slate-800 placeholder:text-slate-400/80 transition-all duration-200 hover:border-slate-300 focus:border-[#0E5C44] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#0E5C44]/12 dark:border-slate-700/80 dark:bg-slate-900/50 dark:text-slate-100 dark:hover:border-slate-600 dark:focus:border-[#3FBF75] dark:focus:bg-slate-900 dark:focus:ring-[#3FBF75]/20"
                        />
                        <button
                          type="submit"
                          disabled={processingScan}
                          className="absolute right-1.5 inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700 px-4 py-2 text-xs font-extrabold text-white border border-emerald-300/40 hover:scale-[1.03] transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
                        >
                          {processingScan ? (
                            <span className="size-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                          ) : null}
                          <span>{processingScan ? 'Proses...' : 'Proses'}</span>
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                {/* DYNAMIC ACTION VIEW 2: RFID TAP METHOD */}
                {method === 'RFID' && (
                  <div className="space-y-4">
                    <div className="relative overflow-hidden rounded-2xl border border-blue-100 bg-blue-50/60 p-4 dark:border-blue-950/50 dark:bg-blue-950/30 flex items-center justify-between">
                      {/* Animated Pulse Beam */}
                      <motion.div
                        className="absolute left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-blue-500 to-transparent shadow-[0_0_8px_rgba(59,130,246,0.8)] pointer-events-none"
                        animate={{ top: ['0%', '100%', '0%'] }}
                        transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
                      />
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-400 via-sky-500 to-blue-600 text-white shadow-sm border border-sky-300/40 shrink-0">
                          <Wifi className="h-5 w-5 animate-pulse" />
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-blue-900 dark:text-blue-200">Perangkat RFID Reader Terhubung</h4>
                          <p className="text-xs text-slate-600 dark:text-slate-400">Silakan tap kartu RFID siswa pada alat pembaca.</p>
                        </div>
                      </div>
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-extrabold text-emerald-800 border border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-700 shadow-2xs">
                        <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                        Standby RFID
                      </span>
                    </div>

                    <form onSubmit={handleScanSubmit} className="space-y-2">
                      <label htmlFor="gate-rfid-input" className="block text-xs font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider">Input RFID Card Tap Code</label>
                      <div className="relative flex items-center">
                        <div className="pointer-events-none absolute left-3.5 flex items-center text-slate-400 dark:text-slate-500">
                          <Wifi className="size-4" />
                        </div>
                        <input
                          id="gate-rfid-input"
                          type="text"
                          autoFocus
                          value={cardInput}
                          onChange={(e) => setCardInput(e.target.value)}
                          placeholder="Tap kartu RFID pada alat pembaca..."
                          className="w-full rounded-xl border border-slate-200/90 bg-slate-50/50 pl-10 pr-32 py-2.5 text-xs font-semibold text-slate-800 placeholder:text-slate-400/80 transition-all duration-200 hover:border-slate-300 focus:border-[#0E5C44] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#0E5C44]/12 dark:border-slate-700/80 dark:bg-slate-900/50 dark:text-slate-100 dark:hover:border-slate-600 dark:focus:border-[#3FBF75] dark:focus:bg-slate-900 dark:focus:ring-[#3FBF75]/20"
                        />
                        <button
                          type="submit"
                          disabled={processingScan}
                          className="absolute right-1.5 inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-br from-sky-400 via-sky-500 to-blue-600 px-4 py-2 text-xs font-extrabold text-white border border-sky-300/40 hover:scale-[1.03] transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
                        >
                          {processingScan ? (
                            <span className="size-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                          ) : null}
                          <span>{processingScan ? 'Proses...' : 'Proses RFID'}</span>
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                {/* DYNAMIC ACTION VIEW 3: MANUAL INPUT TU METHOD (LIST + SEARCH SISWA) */}
                {method === 'MANUAL' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">Pencarian & Absensi Manual Siswa/Santri</h4>
                      <span className="text-xs text-slate-500 font-medium">Petugas TU</span>
                    </div>

                    {/* Search Input */}
                    <div className="relative flex items-center">
                      <div className="pointer-events-none absolute left-3.5 flex items-center text-slate-400 dark:text-slate-500">
                        <Search className="size-4" />
                      </div>
                      <input
                        type="text"
                        value={studentSearch}
                        onChange={(e) => setStudentSearch(e.target.value)}
                        placeholder="Cari berdasarkan nama siswa, NIS, atau NISN..."
                        aria-label="Cari siswa untuk absensi manual"
                        className="w-full rounded-xl border border-slate-200/90 bg-slate-50/50 pl-10 pr-4 py-2.5 text-xs font-semibold text-slate-800 placeholder:text-slate-400/80 transition-all duration-200 hover:border-slate-300 focus:border-[#0E5C44] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#0E5C44]/12 dark:border-slate-700/80 dark:bg-slate-900/50 dark:text-slate-100 dark:hover:border-slate-600 dark:focus:border-[#3FBF75] dark:focus:bg-slate-900 dark:focus:ring-[#3FBF75]/20"
                      />
                    </div>

                    {/* Student List View */}
                    <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                      {loadingStudents ? (
                        <AppSkeleton variant="list" rows={3} />
                      ) : studentsList.length === 0 ? (
                        <AppEmptyState title="Siswa tidak ditemukan" description="Coba ubah kata kunci pencarian nama, NIS, atau NISN." />
                      ) : (
                        studentsList.map((st) => (
                          <div
                            key={st.id}
                            className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200/90 bg-slate-50/60 p-3 transition hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900/40"
                          >
                            <div className="min-w-0">
                              <p className="text-sm font-bold text-slate-900 dark:text-white truncate">
                                {st.nama_lengkap || st.full_name || 'Siswa'}
                              </p>
                              <p className="text-xs text-slate-500 dark:text-slate-400">
                                NISN: <span className="font-semibold font-mono text-slate-700 dark:text-slate-300">{st.nisn || '-'}</span> | Kelas: {st.kelas?.nama || '-'}
                              </p>
                            </div>
                            <button
                              type="button"
                              disabled={processingScan}
                              onClick={() => executeScan('', st.id)}
                              className={`inline-flex shrink-0 items-center gap-2 rounded-2xl px-4 py-2.5 text-xs font-extrabold text-white border transition-all duration-200 hover:scale-[1.03] active:scale-95 disabled:opacity-50 disabled:pointer-events-none cursor-pointer ${
                                scanMode === 'checkin'
                                  ? 'bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700 border-emerald-300/40'
                                  : 'bg-gradient-to-br from-indigo-500 via-indigo-600 to-violet-700 border-indigo-300/40'
                              }`}
                            >
                              <div className="flex size-5 items-center justify-center rounded-lg bg-white/20 text-white">
                                {scanMode === 'checkin' ? (
                                  <LogIn className="size-3.5 text-white" strokeWidth={2.2} />
                                ) : (
                                  <LogOut className="size-3.5 text-white" strokeWidth={2.2} />
                                )}
                              </div>
                              <span>{scanMode === 'checkin' ? 'Absen Masuk' : 'Absen Pulang'}</span>
                            </button>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Last Scan Result Feedback Card */}
            <div className="space-y-6 lg:col-span-5">
              <div className="relative overflow-hidden rounded-[22px] border-2 border-emerald-300 bg-white p-5 sm:p-6 shadow-md shadow-emerald-500/10 dark:border-emerald-700/80 dark:bg-[#1B2433]">
                <div className="pointer-events-none absolute -top-10 -right-10 h-32 w-32 rounded-full bg-emerald-400/10 blur-2xl dark:bg-emerald-400/15" />
                <div className="mb-4 pb-3.5 border-b border-emerald-200/90 dark:border-emerald-800/60">
                  <h3 className="text-sm sm:text-base font-black text-slate-900 dark:text-white">Status Pemindaian Terakhir</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Umpan balik hasil scan sesi ini</p>
                </div>
                {lastScanResult ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.94, y: 14 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 28 }}
                    className={`rounded-2xl border p-4 ${
                      lastScanResult.success
                        ? 'border-emerald-200 bg-emerald-50/50 dark:border-emerald-900/50 dark:bg-emerald-950/30'
                        : 'border-rose-200 bg-rose-50/50 dark:border-rose-900/50 dark:bg-rose-950/30'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {lastScanResult.success ? (
                        <CheckCircle2 className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
                      ) : (
                        <XCircle className="h-8 w-8 text-rose-600 dark:text-rose-400" />
                      )}
                      <div>
                        <p
                          className={`text-base font-extrabold ${
                            lastScanResult.success
                              ? 'text-emerald-900 dark:text-emerald-200'
                              : 'text-rose-900 dark:text-rose-200'
                          }`}
                        >
                          {lastScanResult.message}
                        </p>
                        {lastScanResult.data?.student && (
                          <p className="text-sm font-medium text-slate-600 dark:text-slate-300 mt-1">
                            Nama: <span className="font-bold">{lastScanResult.data.student.nama_lengkap}</span> (
                            {lastScanResult.data.student.nisn || 'NISN'})
                          </p>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ) : (
                  <div className="rounded-2xl border border-dashed border-slate-200 p-8 text-center dark:border-slate-700">
                    <QrCode className="mx-auto h-8 w-8 text-slate-300 dark:text-slate-600" />
                    <p className="mt-2 text-xs font-semibold text-slate-400">Belum ada pemindaian yang dilakukan pada sesi ini.</p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'logs' && (
          <motion.div
            key="logs-tab"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="relative overflow-hidden rounded-[22px] border-2 border-emerald-300 bg-white shadow-md shadow-emerald-500/10 dark:border-emerald-700/80 dark:bg-[#1B2433]"
          >
            <div className="pointer-events-none absolute -top-10 -right-10 h-32 w-32 rounded-full bg-emerald-400/10 blur-2xl dark:bg-emerald-400/15" />
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between px-4 py-3.5 sm:px-6 md:px-8 bg-gradient-to-r from-emerald-500/10 via-teal-500/5 to-transparent border-b border-emerald-200/90 dark:border-emerald-800/60">
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700 text-white shrink-0 shadow-sm border border-emerald-300/40">
                  <Clock className="size-5" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-black text-slate-900 dark:text-white">
                    Daftar Kehadiran Kedatangan & Pulang Hari Ini
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Log aktivitas pemindaian presensi siswa di gerbang secara langsung.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0 self-start sm:self-auto flex-wrap">
                <MasterActionButton variant="secondary" icon={RefreshCw} onClick={fetchLogs} disabled={loadingLogs}>
                  Refresh Log
                </MasterActionButton>
              </div>
            </div>

            <div className="px-4 sm:px-6 md:px-8 py-4 overflow-x-auto">
              {loadingLogs ? (
                <AppSkeleton variant="table" rows={5} cols={4} />
              ) : logs.length === 0 ? (
                <AppEmptyState title="Belum ada data presensi gerbang" description="Log pemindaian akan tampil di sini setelah ada aktivitas scan masuk atau pulang." />
              ) : (
              <div className="overflow-x-auto rounded-xl border border-emerald-200/80 dark:border-emerald-800/60">
              <table className="w-full text-left text-sm text-slate-600 dark:text-slate-300">
                <thead className="bg-gradient-to-r from-emerald-100/80 via-teal-50/60 to-emerald-100/80 border-b border-emerald-200/80 dark:from-emerald-950/80 dark:via-teal-950/60 dark:to-emerald-950/80 dark:border-emerald-900/50 text-xs uppercase font-black text-emerald-950 dark:text-emerald-200">
                  <tr>
                    <th className="px-4 py-2.5 text-[11px]">Siswa</th>
                    <th className="hidden sm:table-cell px-4 py-2.5 text-[11px]">Unit / Kelas</th>
                    <th className="px-4 py-2.5 text-[11px]">Jam Masuk</th>
                    <th className="hidden md:table-cell px-4 py-2.5 text-[11px]">Status Masuk</th>
                    <th className="hidden md:table-cell px-4 py-2.5 text-[11px]">Jam Pulang</th>
                    <th className="hidden lg:table-cell px-4 py-2.5 text-[11px]">Status Pulang</th>
                    <th className="hidden lg:table-cell px-4 py-2.5 text-[11px]">Metode</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-emerald-100/80 dark:divide-emerald-900/40">
                  {logs.map((log) => (
                      <tr key={log.id} className="hover:bg-emerald-50/40 dark:hover:bg-emerald-950/20 transition-colors">
                        <td className="px-4 py-3.5 align-top sm:align-middle">
                          <p className="font-bold text-sm text-slate-900 dark:text-white line-clamp-2">{log.student?.nama_lengkap || 'Siswa'}</p>
                          <p className="text-[11px] text-slate-400 font-mono line-clamp-1 mt-0.5">{log.student?.nisn || '-'}</p>
                          <div className="sm:hidden mt-2 flex flex-wrap items-center gap-1.5 pt-1.5 border-t border-emerald-100/80 dark:border-emerald-900/40">
                            <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300">
                              {log.education_unit?.nama || '-'}
                            </span>
                            <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-500/10 text-emerald-600">
                              {log.status || '-'}
                            </span>
                          </div>
                        </td>
                        <td className="hidden sm:table-cell px-4 py-3.5 align-middle text-xs font-medium text-slate-700 dark:text-slate-300">{log.education_unit?.nama || '-'}</td>
                        <td className="px-4 py-3.5 align-middle text-xs font-bold text-slate-800 dark:text-slate-200 tabular-nums">
                          {log.check_in_time ? new Date(log.check_in_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-'}
                        </td>
                        <td className="hidden md:table-cell px-4 py-3.5 align-middle">
                          <AppBadge variant={log.status === 'HADIR' ? 'success' : log.status === 'TERLAMBAT' ? 'warning' : 'danger'}>
                            {log.status || '-'}
                          </AppBadge>
                        </td>
                        <td className="hidden md:table-cell px-4 py-3.5 align-middle text-xs font-bold text-slate-800 dark:text-slate-200 tabular-nums">
                          {log.check_out_time
                            ? new Date(log.check_out_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                            : '-'}
                        </td>
                        <td className="hidden lg:table-cell px-4 py-3.5 align-middle text-xs font-semibold text-slate-500">{log.check_out_status || '-'}</td>
                        <td className="hidden lg:table-cell px-4 py-3.5 align-middle text-xs font-semibold text-slate-500">{log.attendance_method || '-'}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
              </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Per-Unit Schedule Config Modal */}
      <AnimatePresence>
        {showScheduleModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/70 p-3 sm:p-5 backdrop-blur-md"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 14 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ type: 'spring', stiffness: 400, damping: 28 }}
              className="modal-dialog font-sans my-auto w-full max-w-2xl"
            >
              <div className="modal-content flex max-h-[calc(100dvh-2rem)] flex-col overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-2xl shadow-emerald-950/20 dark:border-slate-800 dark:bg-[#182232] dark:shadow-black/60">
              <div className="h-1.5 bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-600 shrink-0" />
              {/* Modal Header */}
              <div className="modal-header flex items-center justify-between border-b border-slate-100 bg-white px-6 py-4.5 dark:border-slate-800 dark:bg-slate-950 shrink-0">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 sm:h-11 sm:w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700 text-white shadow-md shadow-emerald-500/20 border border-emerald-300/30">
                    <Settings className="h-5 w-5 text-white" strokeWidth={2.25} />
                  </div>
                  <div>
                    <h3 className="modal-title text-sm sm:text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                      <span>Pengaturan Jam Masuk & Pulang Per Unit</span>
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-800 border border-emerald-200/80 dark:bg-emerald-950/60 dark:text-emerald-400 dark:border-emerald-800/60">
                        <Clock className="size-3" />
                        Jadwal Unit
                      </span>
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Konfigurasi jadwal jam absensi spesifik masing-masing unit pendidikan.</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowScheduleModal(false)}
                  aria-label="Tutup modal"
                  className="size-9 flex items-center justify-center rounded-2xl bg-gradient-to-br from-rose-500 via-rose-600 to-red-700 text-white hover:scale-105 active:scale-95 transition-all duration-200 shadow-md shadow-rose-500/20 cursor-pointer shrink-0"
                >
                  <X className="size-4 text-white" strokeWidth={2.25} />
                </button>
              </div>

              {/* Modal Content */}
              <div className="modal-body min-h-0 flex-1 overflow-y-auto p-6 space-y-6">
                {/* Unit Target Selector */}
                <div>
                  <label htmlFor="gate-config-unit" className="mb-1.5 block text-xs font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider">
                    Pilih Unit Pendidikan Target
                  </label>
                  <div className="relative flex items-center">
                    <div className="pointer-events-none absolute left-3.5 flex items-center text-slate-400 dark:text-slate-500">
                      <Building2 className="size-4" />
                    </div>
                    <select
                      id="gate-config-unit"
                      disabled={!isMultiUnitUser}
                      className="w-full rounded-xl border border-slate-200/90 bg-slate-50/50 pl-10 pr-8 py-2.5 text-xs font-semibold text-slate-800 transition-all duration-200 hover:border-slate-300 focus:border-[#0E5C44] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#0E5C44]/12 dark:border-slate-700/80 dark:bg-slate-900/50 dark:text-slate-100 dark:hover:border-slate-600 dark:focus:border-[#3FBF75] dark:focus:bg-slate-900 dark:focus:ring-[#3FBF75]/20 cursor-pointer disabled:opacity-50"
                      value={targetUnitForConfig}
                      onChange={(e) => setTargetUnitForConfig(e.target.value)}
                    >
                      <option value="">-- Default Global (Seluruh Unit) --</option>
                      {units.map((u) => (
                        <option key={u.id} value={u.id}>
                          {u.nama || u.name}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-2.5 h-3.5 w-3.5 text-slate-400" />
                  </div>
                </div>

                {/* Form Input for Selected Unit */}
                <form onSubmit={handleSaveScheduleConfig} className="space-y-4 rounded-2xl border border-emerald-100 bg-emerald-50/40 p-4 dark:border-emerald-950/40 dark:bg-emerald-950/20">
                  <div className="flex items-center justify-between border-b border-emerald-100/60 pb-2 dark:border-emerald-900/40">
                    <h4 className="text-xs font-bold text-emerald-900 dark:text-emerald-200 uppercase tracking-wider flex items-center gap-1.5">
                      <Clock className="h-4 w-4 text-emerald-600" /> Jam Absensi: {targetUnitForConfig ? units.find((u) => u.id === targetUnitForConfig)?.nama || 'Unit Tertentu' : 'Default Global'}
                    </h4>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="gate-jam-masuk" className="mb-1.5 block text-xs font-bold text-slate-700 dark:text-slate-200">
                        Jam Masuk Sekolah <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative flex items-center">
                        <div className="pointer-events-none absolute left-3.5 flex items-center text-slate-400 dark:text-slate-500">
                          <Clock className="size-4" />
                        </div>
                        <input
                          id="gate-jam-masuk"
                          type="time"
                          required
                          value={scheduleConfig.jam_masuk}
                          onChange={(e) => setScheduleConfig({ ...scheduleConfig, jam_masuk: e.target.value })}
                          className="w-full rounded-xl border border-slate-200/90 bg-white pl-10 pr-4 py-2.5 text-xs font-semibold text-slate-800 transition-all duration-200 hover:border-slate-300 focus:border-[#0E5C44] focus:outline-none focus:ring-4 focus:ring-[#0E5C44]/12 dark:border-slate-700/80 dark:bg-slate-900/50 dark:text-slate-100 dark:hover:border-slate-600 dark:focus:border-[#3FBF75] dark:focus:ring-[#3FBF75]/20"
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="gate-toleransi" className="mb-1.5 block text-xs font-bold text-slate-700 dark:text-slate-200">
                        Toleransi Terlambat (Menit) <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative flex items-center">
                        <div className="pointer-events-none absolute left-3.5 flex items-center text-slate-400 dark:text-slate-500">
                          <Hash className="size-4" />
                        </div>
                        <input
                          id="gate-toleransi"
                          type="number"
                          required
                          min="0"
                          max="120"
                          value={scheduleConfig.toleransi_menit}
                          onChange={(e) => setScheduleConfig({ ...scheduleConfig, toleransi_menit: e.target.value })}
                          className="w-full rounded-xl border border-slate-200/90 bg-white pl-10 pr-4 py-2.5 text-xs font-semibold text-slate-800 transition-all duration-200 hover:border-slate-300 focus:border-[#0E5C44] focus:outline-none focus:ring-4 focus:ring-[#0E5C44]/12 dark:border-slate-700/80 dark:bg-slate-900/50 dark:text-slate-100 dark:hover:border-slate-600 dark:focus:border-[#3FBF75] dark:focus:ring-[#3FBF75]/20"
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="gate-jam-pulang" className="mb-1.5 block text-xs font-bold text-slate-700 dark:text-slate-200">
                        Jam Pulang Sekolah <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative flex items-center">
                        <div className="pointer-events-none absolute left-3.5 flex items-center text-slate-400 dark:text-slate-500">
                          <Clock className="size-4" />
                        </div>
                        <input
                          id="gate-jam-pulang"
                          type="time"
                          required
                          value={scheduleConfig.jam_pulang}
                          onChange={(e) => setScheduleConfig({ ...scheduleConfig, jam_pulang: e.target.value })}
                          className="w-full rounded-xl border border-slate-200/90 bg-white pl-10 pr-4 py-2.5 text-xs font-semibold text-slate-800 transition-all duration-200 hover:border-slate-300 focus:border-[#0E5C44] focus:outline-none focus:ring-4 focus:ring-[#0E5C44]/12 dark:border-slate-700/80 dark:bg-slate-900/50 dark:text-slate-100 dark:hover:border-slate-600 dark:focus:border-[#3FBF75] dark:focus:ring-[#3FBF75]/20"
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="gate-cutoff" className="mb-1.5 block text-xs font-bold text-slate-700 dark:text-slate-200">
                        Batas Jam Cutoff Alpha <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative flex items-center">
                        <div className="pointer-events-none absolute left-3.5 flex items-center text-slate-400 dark:text-slate-500">
                          <Clock className="size-4" />
                        </div>
                        <input
                          id="gate-cutoff"
                          type="time"
                          required
                          value={scheduleConfig.jam_cutoff_alpha}
                          onChange={(e) => setScheduleConfig({ ...scheduleConfig, jam_cutoff_alpha: e.target.value })}
                          className="w-full rounded-xl border border-slate-200/90 bg-white pl-10 pr-4 py-2.5 text-xs font-semibold text-slate-800 transition-all duration-200 hover:border-slate-300 focus:border-[#0E5C44] focus:outline-none focus:ring-4 focus:ring-[#0E5C44]/12 dark:border-slate-700/80 dark:bg-slate-900/50 dark:text-slate-100 dark:hover:border-slate-600 dark:focus:border-[#3FBF75] dark:focus:ring-[#3FBF75]/20"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end pt-2">
                    <button
                      type="submit"
                      disabled={savingSchedule}
                      className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700 text-white px-5 py-2.5 text-xs font-extrabold border border-emerald-300/40 hover:scale-[1.03] transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:pointer-events-none cursor-pointer shadow-md shadow-emerald-500/20"
                    >
                      {savingSchedule ? (
                        <span className="size-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      ) : (
                        <div className="flex size-5 items-center justify-center rounded-lg bg-white/20 text-white">
                          <CheckCircle2 className="size-3.5 text-white" strokeWidth={2.2} />
                        </div>
                      )}
                      <span>{savingSchedule ? 'Menyimpan...' : 'Simpan Pengaturan Unit Ini'}</span>
                    </button>
                  </div>
                </form>

                {/* Matriks Ringkasan Jam Seluruh Unit */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Layers className="h-4 w-4 text-emerald-600" /> Ringkasan Jam Absensi Seluruh Unit
                  </h4>
                  <div className="overflow-x-auto rounded-xl border border-emerald-200/80 dark:border-emerald-800/60">
                    <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
                      <thead className="bg-gradient-to-r from-emerald-100/80 via-teal-50/60 to-emerald-100/80 border-b border-emerald-200/80 dark:from-emerald-950/80 dark:via-teal-950/60 dark:to-emerald-950/80 dark:border-emerald-900/50 uppercase text-[10px] font-extrabold text-emerald-800 dark:text-emerald-300">
                        <tr>
                          <th className="px-4 py-2.5">Unit Pendidikan</th>
                          <th className="px-4 py-2.5">Jam Masuk</th>
                          <th className="px-4 py-2.5">Toleransi</th>
                          <th className="px-4 py-2.5">Jam Pulang</th>
                          <th className="px-4 py-2.5">Cutoff Alpha</th>
                          <th className="px-4 py-2.5 text-right">Aksi</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-emerald-100/80 dark:divide-emerald-900/40">
                        {allUnitsSchedules.length === 0 ? (
                          <tr>
                            <td colSpan="6" className="px-4 py-8 text-center">
                              <AppEmptyState title="Belum ada data unit" description="Konfigurasi jadwal per unit akan tampil di sini." />
                            </td>
                          </tr>
                        ) : (
                          allUnitsSchedules.map((u) => (
                            <tr key={u.unit_id} className="hover:bg-emerald-50/40 dark:hover:bg-emerald-950/20 transition-colors">
                              <td className="px-4 py-3 font-bold text-slate-900 dark:text-white">
                                {u.unit_name}
                                {u.has_custom_schedule && (
                                  <span className="ml-2 inline-flex items-center rounded-full bg-emerald-100 px-2 py-0.5 text-[9px] font-bold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/60">
                                    Kustom
                                  </span>
                                )}
                              </td>
                              <td className="px-4 py-3 font-bold text-emerald-700 dark:text-emerald-400 tabular-nums">{u.schedule.jam_masuk}</td>
                              <td className="px-4 py-3 tabular-nums">{u.schedule.toleransi_menit} Menit</td>
                              <td className="px-4 py-3 font-bold text-indigo-700 dark:text-indigo-400 tabular-nums">{u.schedule.jam_pulang}</td>
                              <td className="px-4 py-3 tabular-nums">{u.schedule.jam_cutoff_alpha}</td>
                              <td className="px-4 py-3 text-right">
                                <MasterActionIconButton
                                  variant="edit"
                                  label="Edit Unit Ini"
                                  onClick={() => {
                                    setTargetUnitForConfig(u.unit_id)
                                    setScheduleConfig(u.schedule)
                                  }}
                                />
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="modal-footer flex items-center justify-end border-t border-slate-100 bg-slate-50/50 px-6 py-4 dark:border-slate-800 dark:bg-slate-900/40 shrink-0">
                <button
                  type="button"
                  onClick={() => setShowScheduleModal(false)}
                  className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-br from-rose-500 via-rose-600 to-red-700 text-white px-4 py-2.5 text-xs font-extrabold border border-rose-300/40 transition-all duration-200 hover:scale-[1.03] active:scale-95 cursor-pointer"
                >
                  <div className="flex size-5 items-center justify-center rounded-lg bg-white/20 text-white">
                    <X className="size-3.5 text-white" strokeWidth={2.2} />
                  </div>
                  <span>Tutup Form</span>
                </button>
              </div>
            </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Pop-Up Camera Scanner Modal with TailGrids Prompt Style & Framer Motion Scan Animation */}
      <AnimatePresence>
        {showCameraModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/70 p-3 sm:p-5 backdrop-blur-md"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 14 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ type: 'spring', stiffness: 400, damping: 28 }}
              className="modal-dialog font-sans my-auto relative w-full max-w-xl"
            >
            <div className="modal-content flex max-h-[calc(100dvh-2rem)] flex-col overflow-hidden rounded-3xl border-2 border-emerald-500/30 bg-white shadow-2xl shadow-emerald-950/20 dark:border-emerald-600/40 dark:bg-[#182232] dark:shadow-black/60">
              <div className="h-1.5 bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-600 shrink-0" />
              {/* Ambient Glow Background Accent */}
              <div className="pointer-events-none absolute -top-20 -right-20 h-52 w-52 rounded-full bg-gradient-to-br from-emerald-500/30 via-teal-400/20 to-transparent blur-3xl dark:from-emerald-500/40 dark:via-teal-400/30" />
              <div className="pointer-events-none absolute -bottom-20 -left-20 h-52 w-52 rounded-full bg-gradient-to-tr from-emerald-600/20 via-teal-500/15 to-transparent blur-3xl dark:from-emerald-600/30 dark:via-teal-500/20" />

              {/* Modal Header */}
              <div className="modal-header relative z-10 flex items-center justify-between border-b border-slate-100 bg-white px-6 py-4.5 dark:border-slate-800 dark:bg-slate-950">
                <div className="flex items-center gap-3">
                  <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700 text-white shadow-md shadow-emerald-500/20 border border-emerald-300/30">
                    <Camera className="h-5 w-5 text-white" strokeWidth={2.25} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="modal-title text-sm sm:text-base font-black tracking-tight text-slate-900 dark:text-white">
                        Pemindai QR Code Live
                      </h3>
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-emerald-600 to-teal-600 px-3 py-0.5 text-[11px] font-extrabold text-white shadow-sm shadow-emerald-600/25 border border-emerald-300/40">
                        <span className="h-2 w-2 rounded-full bg-white animate-pulse" />
                        {scanMode === 'checkin' ? 'KEDATANGAN' : 'PULANG'}
                      </span>
                    </div>
                    <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-0.5">
                      Arahkan QR Code kartu siswa ke dalam kotak pemindai
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={closeCameraModal}
                  aria-label="Tutup pemindai"
                  className="size-9 flex items-center justify-center rounded-2xl bg-gradient-to-br from-rose-500 via-rose-600 to-red-700 text-white hover:scale-105 active:scale-95 transition-all duration-200 shadow-md shadow-rose-500/20 cursor-pointer shrink-0"
                >
                  <X className="size-4 text-white" strokeWidth={2.25} />
                </button>
              </div>

              {/* Modal Body */}
              <div className="relative z-10 p-6 space-y-4">
                {/* Dedicated Square QR Code Scanner Viewfinder */}
                <div className="relative mx-auto aspect-square w-full max-w-[320px] sm:max-w-[340px] overflow-hidden rounded-[24px] border-2 border-emerald-500/40 bg-slate-950 shadow-2xl shadow-emerald-500/10 dark:border-emerald-600/50">
                  <video
                    ref={(el) => {
                      videoRef.current = el
                      if (el && streamRef.current && el.srcObject !== streamRef.current) {
                        el.srcObject = streamRef.current
                        el.muted = true
                        el.play().catch((err) => console.warn('Callback play error:', err))
                      }
                    }}
                    autoPlay
                    playsInline
                    muted
                    className="h-full w-full object-cover"
                  />

                  {/* Darkened Vignette Mask with Center Square QR Target Cutout */}
                  <div className="absolute inset-0 pointer-events-none flex items-center justify-center">

                    {/* Dedicated Square QR Reticle (220x220px mobile, 250x250px desktop) */}
                    <div className="relative z-10 h-56 w-56 sm:h-64 sm:w-64 rounded-2xl border-2 border-emerald-400/90 bg-transparent shadow-[0_0_0_9999px_rgba(0,0,0,0.52)] overflow-hidden">
                      {/* 4 Precision L-Shaped Corner Target Markers */}
                      <span className="absolute top-0 left-0 h-6 w-6 border-t-[3.5px] border-l-[3.5px] border-emerald-400 rounded-tl-xl shadow-[0_0_8px_#10b981]" />
                      <span className="absolute top-0 right-0 h-6 w-6 border-t-[3.5px] border-r-[3.5px] border-emerald-400 rounded-tr-xl shadow-[0_0_8px_#10b981]" />
                      <span className="absolute bottom-0 left-0 h-6 w-6 border-b-[3.5px] border-l-[3.5px] border-emerald-400 rounded-bl-xl shadow-[0_0_8px_#10b981]" />
                      <span className="absolute bottom-0 right-0 h-6 w-6 border-b-[3.5px] border-r-[3.5px] border-emerald-400 rounded-br-xl shadow-[0_0_8px_#10b981]" />

                      {/* Animated Laser Scanning Beam (from FRAMER_MOTION_ANIMATIONS.md Section 4) */}
                      {cameraActive && (
                        <>
                          {/* Sweeping Soft Glow Beam */}
                          <motion.div
                            animate={{ top: ['-20%', '85%', '-20%'] }}
                            transition={{ repeat: Infinity, duration: 2.2, ease: 'easeInOut' }}
                            className="absolute inset-x-0 h-16 bg-gradient-to-b from-emerald-500/20 via-teal-400/10 to-transparent pointer-events-none z-10"
                          />

                          {/* Sharp Laser Line Beam */}
                          <motion.div
                            animate={{ top: ['4%', '94%', '4%'] }}
                            transition={{ repeat: Infinity, duration: 2.2, ease: 'easeInOut' }}
                            className="absolute inset-x-1 h-1 bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_16px_#10b981,0_0_24px_#34d399] z-20 pointer-events-none"
                          />
                        </>
                      )}

                      {/* Helper Badge inside viewfinder */}
                      <div className="absolute -bottom-9 inset-x-0 flex justify-center pointer-events-none">
                        <span className="bg-slate-950/90 backdrop-blur-md px-3.5 py-1 text-[10px] font-black text-emerald-300 rounded-full border border-emerald-500/40 whitespace-nowrap shadow-xl flex items-center gap-1.5">
                          <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                          Posisikan QR Code di Dalam Kotak
                        </span>
                      </div>
                    </div>
                  </div>

                  {cameraLoading && (
                    <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-slate-900/85 text-white gap-2.5">
                      <RefreshCw className="h-8 w-8 animate-spin text-emerald-400" />
                      <p className="text-xs font-bold text-slate-200">Menghubungkan ke kamera...</p>
                    </div>
                  )}
                </div>

                {cameraError && (
                  <div className="rounded-2xl border border-rose-200 bg-rose-50/90 p-4 text-xs dark:border-rose-900/50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-200 space-y-2.5">
                    <div className="flex items-start gap-2.5">
                      <AlertTriangle className="h-4 w-4 shrink-0 text-rose-600 mt-0.5" />
                      <div className="space-y-1">
                        <p className="font-extrabold text-[13px] text-rose-900 dark:text-rose-100">Kamera Tidak Dapat Diakses</p>
                        <p className="leading-relaxed">{cameraError}</p>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-rose-200/60 dark:border-rose-900/60 flex flex-wrap items-center justify-between gap-2">
                      <div className="text-[11px] text-rose-700 dark:text-rose-300">
                        <span className="font-bold">Panduan Mac/Chrome:</span> Klik ikon 🔒 / <span className="font-mono bg-rose-100 dark:bg-rose-900/50 px-1 py-0.5 rounded">tune</span> di address bar &gt; set Camera ke <span className="font-bold">Allow</span> &gt; Refresh.
                      </div>
                      <button
                        type="button"
                        onClick={startCamera}
                        className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-br from-rose-500 via-rose-600 to-red-700 px-4 py-2.5 text-xs font-extrabold text-white border border-rose-300/40 hover:scale-[1.03] transition-all duration-200 active:scale-95 cursor-pointer shrink-0"
                      >
                        <div className="flex size-5 items-center justify-center rounded-lg bg-white/20 text-white">
                          <RefreshCw className="size-3.5 text-white" strokeWidth={2.2} />
                        </div>
                        <span>Coba Hubungkan Lagi</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* Quick Code Entry in Modal */}
                <form onSubmit={handleModalScanSubmit} className="space-y-2 pt-1">
                  <label htmlFor="gate-modal-scan" className="block text-xs font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider">
                    Hasil Pindai QR / Input Manual Kartu
                  </label>
                  <div className="flex gap-2">
                    <div className="relative flex flex-1 items-center">
                      <div className="pointer-events-none absolute left-3.5 flex items-center text-slate-400 dark:text-slate-500">
                        <QrCode className="size-4" />
                      </div>
                      <input
                        id="gate-modal-scan"
                        type="text"
                        autoFocus
                        value={modalCardInput}
                        onChange={(e) => setModalCardInput(e.target.value)}
                        placeholder="Hasil deteksi QR otomatis / Ketik NISN..."
                        className="w-full rounded-xl border border-slate-200/90 bg-slate-50/50 pl-10 pr-4 py-2.5 text-xs sm:text-sm font-bold text-slate-900 placeholder:text-slate-400/80 transition-all duration-200 hover:border-slate-300 focus:border-[#0E5C44] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#0E5C44]/12 dark:border-slate-700/80 dark:bg-slate-900/50 dark:text-slate-100 dark:hover:border-slate-600 dark:focus:border-[#3FBF75] dark:focus:bg-slate-900 dark:focus:ring-[#3FBF75]/20"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={processingScan}
                      className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700 px-5 py-2.5 text-xs sm:text-sm font-extrabold text-white border border-emerald-300/40 hover:scale-[1.03] transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:pointer-events-none cursor-pointer whitespace-nowrap shadow-md shadow-emerald-500/20"
                    >
                      {processingScan ? (
                        <span className="size-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      ) : (
                        <div className="flex size-5 items-center justify-center rounded-lg bg-white/20 text-white">
                          <QrCode className="size-3.5 text-white" strokeWidth={2.2} />
                        </div>
                      )}
                      <span>{processingScan ? 'Proses...' : 'Proses Scan'}</span>
                    </button>
                  </div>
                </form>
              </div>

              {/* Modal Footer */}
              <div className="modal-footer relative z-10 flex flex-wrap items-center justify-between gap-2.5 border-t border-slate-100 bg-slate-50/50 px-6 py-4 dark:border-slate-800 dark:bg-slate-900/40">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={cameraActive ? stopCamera : startCamera}
                    className="inline-flex items-center gap-2 rounded-2xl border border-emerald-300/80 bg-white px-4 py-2.5 text-xs font-bold text-emerald-800 shadow-2xs hover:bg-emerald-50 transition-all dark:border-emerald-700 dark:bg-slate-800 dark:text-emerald-300 dark:hover:bg-slate-700 active:scale-95 cursor-pointer"
                  >
                    {cameraActive ? (
                      <CameraOff className="h-3.5 w-3.5 text-rose-500" />
                    ) : (
                      <Camera className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                    )}
                    <span>{cameraActive ? 'Matikan Kamera' : 'Nyalakan Ulang Kamera'}</span>
                  </button>
                </div>
                <button
                  type="button"
                  onClick={closeCameraModal}
                  className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-br from-rose-500 via-rose-600 to-red-700 text-white px-4 py-2.5 text-xs font-extrabold border border-rose-300/40 transition-all duration-200 hover:scale-[1.03] active:scale-95 cursor-pointer"
                >
                  <div className="flex size-5 items-center justify-center rounded-lg bg-white/20 text-white">
                    <X className="size-3.5 text-white" strokeWidth={2.2} />
                  </div>
                  <span>Tutup Window</span>
                </button>
              </div>
            </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal Detail Data KPI Siswa */}
      <AnimatePresence>
        {kpiModal.isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/70 p-3 sm:p-5 backdrop-blur-md"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 14 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ type: 'spring', stiffness: 400, damping: 28 }}
              className="modal-dialog font-sans my-auto w-full max-w-3xl"
            >
            <div className="modal-content flex max-h-[calc(100dvh-2rem)] flex-col overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-2xl shadow-emerald-950/20 dark:border-slate-800 dark:bg-[#182232] dark:shadow-black/60">
              <div className="h-1.5 bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-600 shrink-0" />
              {/* Header Modal */}
              <div className="modal-header flex items-center justify-between border-b border-slate-100 bg-white px-6 py-4.5 dark:border-slate-800 dark:bg-slate-950 shrink-0">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 sm:h-11 sm:w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700 text-white shadow-md shadow-emerald-500/20 border border-emerald-300/30 font-bold">
                    <Users className="h-5 w-5 text-white" strokeWidth={2.25} />
                  </div>
                  <div>
                    <h3 className="modal-title text-sm sm:text-base font-black text-slate-900 dark:text-white flex items-center gap-2 flex-wrap">
                      <span>{kpiModal.title}</span>
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-800 border border-emerald-200/80 dark:bg-emerald-950/60 dark:text-emerald-400 dark:border-emerald-800/60">
                        <Sparkles className="size-3" />
                        {filteredKpiData.length} Siswa
                      </span>
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      Daftar detail siswa berdasarkan status presensi gerbang hari ini.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={closeKpiModal}
                  aria-label="Tutup modal"
                  className="size-9 flex items-center justify-center rounded-2xl bg-gradient-to-br from-rose-500 via-rose-600 to-red-700 text-white hover:scale-105 active:scale-95 transition-all duration-200 shadow-md shadow-rose-500/20 cursor-pointer shrink-0"
                >
                  <X className="size-4 text-white" strokeWidth={2.25} />
                </button>
              </div>

              {/* Toolbar Filter / Search dalam Modal */}
              <div className="border-b border-emerald-200/80 bg-gradient-to-r from-emerald-50/50 via-teal-50/30 to-emerald-50/50 p-4 dark:border-emerald-800/60 dark:from-emerald-950/20 dark:via-teal-950/10 dark:to-emerald-950/20 shrink-0 flex items-center justify-between gap-3">
                <div className="relative flex-1 max-w-sm flex items-center">
                  <div className="pointer-events-none absolute left-3.5 flex items-center text-emerald-600/70 dark:text-emerald-400">
                    <Search className="size-4" />
                  </div>
                  <input
                    type="text"
                    value={kpiModal.search}
                    onChange={(e) => setKpiModal((prev) => ({ ...prev, search: e.target.value }))}
                    placeholder="Cari nama siswa, NIS, atau NISN..."
                    aria-label="Cari siswa dalam modal"
                    className="w-full rounded-2xl border border-emerald-200/90 bg-white pl-10 pr-4 py-2 text-xs font-semibold text-slate-800 outline-none transition-all placeholder:text-slate-400 focus:border-[#0E5C44] focus:ring-4 focus:ring-[#0E5C44]/12 dark:border-emerald-800/70 dark:bg-slate-900 dark:text-slate-100"
                  />
                </div>
                {kpiModal.search && (
                  <button
                    type="button"
                    onClick={() => setKpiModal((prev) => ({ ...prev, search: '' }))}
                    className="text-xs font-semibold text-slate-500 hover:text-slate-700 dark:text-slate-400 shrink-0 cursor-pointer"
                  >
                    Reset Cari
                  </button>
                )}
              </div>

              {/* Content Table Body */}
              <div className="modal-body min-h-0 flex-1 overflow-y-auto p-5 sm:p-6 space-y-4">
                {kpiModal.loading ? (
                  <AppSkeleton variant="table" rows={4} cols={4} />
                ) : filteredKpiData.length === 0 ? (
                  <AppEmptyState
                    title="Tidak ada data siswa"
                    description={kpiModal.search ? 'Tidak ditemukan siswa dengan kriteria pencarian ini.' : 'Tidak ditemukan siswa dengan kriteria filter ini.'}
                    actionLabel={kpiModal.search ? 'Reset Cari' : undefined}
                    onAction={kpiModal.search ? () => setKpiModal((prev) => ({ ...prev, search: '' })) : undefined}
                  />
                ) : (
                  <div className="overflow-x-auto rounded-xl border border-emerald-200/80 dark:border-emerald-800/60">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-gradient-to-r from-emerald-100/80 via-teal-50/60 to-emerald-100/80 border-b border-emerald-200/80 dark:from-emerald-950/80 dark:via-teal-950/60 dark:to-emerald-950/80 dark:border-emerald-900/50 uppercase text-[10px] font-extrabold text-emerald-800 dark:text-emerald-300">
                        <tr>
                          <th className="px-4 py-2.5">NO</th>
                          <th className="px-4 py-2.5">SISWA</th>
                          <th className="px-4 py-2.5">KELAS / UNIT</th>
                          <th className="px-4 py-2.5">JAM MASUK</th>
                          <th className="px-4 py-2.5">JAM PULANG</th>
                          <th className="px-4 py-2.5 text-center">STATUS PRESENSI</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-emerald-100/80 font-medium text-slate-700 dark:divide-emerald-900/40 dark:text-slate-300">
                        {filteredKpiData.map((item, idx) => (
                          <tr key={item.student_id || item.id || idx} className="hover:bg-emerald-50/40 dark:hover:bg-emerald-950/20 transition-colors">
                            <td className="px-4 py-3 font-bold text-slate-400 tabular-nums">{idx + 1}</td>
                            <td className="px-4 py-3">
                              <p className="font-bold text-slate-900 dark:text-white line-clamp-2">{item.nama_lengkap || item.full_name || item.student?.nama_lengkap || 'Siswa'}</p>
                              <p className="text-[11px] text-slate-400 font-mono line-clamp-1 mt-0.5">NIS: {item.nis || item.nisn || item.student?.nis || '-'}</p>
                            </td>
                            <td className="px-4 py-3">
                              <p className="font-semibold text-slate-800 dark:text-slate-200">{item.kelas_name || item.school_class?.name || item.school_class?.nama_kelas || '-'}</p>
                              <p className="text-[10px] text-slate-400 line-clamp-1">{item.unit_name || item.education_unit?.name || '-'}</p>
                            </td>
                            <td className="px-4 py-3 font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
                              {item.check_in_time ? item.check_in_time.slice(0, 5) : '-'}
                            </td>
                            <td className="px-4 py-3 font-bold text-indigo-600 dark:text-indigo-400 tabular-nums">
                              {item.check_out_time ? item.check_out_time.slice(0, 5) : '-'}
                            </td>
                            <td className="px-4 py-3 text-center">
                              {renderStatusBadge(item.status, item.check_out_time)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Footer Modal */}
              <div className="modal-footer flex items-center justify-between border-t border-slate-100 bg-slate-50/50 px-6 py-4 dark:border-slate-800 dark:bg-slate-900/40 shrink-0">
                <span className="text-xs font-semibold text-slate-400 dark:text-slate-500">
                  Menampilkan {filteredKpiData.length} data siswa SIMSIT
                </span>
                <button
                  type="button"
                  onClick={closeKpiModal}
                  className="inline-flex items-center gap-1.5 rounded-2xl bg-gradient-to-br from-rose-500 via-rose-600 to-red-700 text-white px-4 py-2 text-xs font-extrabold border border-rose-300/40 transition-all duration-200 hover:scale-[1.03] active:scale-95 cursor-pointer"
                >
                  <X className="size-4 text-white" strokeWidth={2.2} />
                  <span>Tutup Rincian</span>
                </button>
              </div>
            </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toast Notification Stack (§L) */}
      <ToastStack items={toasts} onDismiss={dismissToast} />
    </motion.div>
    </PageContainer>
  )
}
