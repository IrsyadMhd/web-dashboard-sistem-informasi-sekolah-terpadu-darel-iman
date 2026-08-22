import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/tailgrids/core/card'
import { Dialog, DialogHeader, DialogTitle, DialogDescription, DialogBody, DialogFooter, DialogClose } from '@/components/tailgrids/core/dialog'
import { Backdrop } from '@/components/tailgrids/core/overlay'
import { Badge } from '@/components/tailgrids/core/badge'
import { Avatar, AvatarFallback } from '@/components/tailgrids/core/avatar'
import { Button } from '@/components/tailgrids/core/button'
import { printCleanTable, downloadPdfTable } from '@/utils/printHelper'
import {
  Moon,
  Sun,
  Clock,
  CheckCircle2,
  AlertCircle,
  Plus,
  Filter,
  Users,
  ShieldCheck,
  ShieldAlert,
  Calendar,
  Sparkles,
  Lock,
  Eye,
  QrCode,
  Radio,
  UserCheck,
  Camera,
  CameraOff,
  X,
  RefreshCw,
  Wifi,
  XCircle,
  Heart,
  BookOpen,
  MapPin,
  ChevronRight,
  ChevronDown,
  CheckCircle,
  Download,
  Printer,
  Upload,
  FileSpreadsheet,
  FileText,
  Search,
  Activity,
  TrendingUp,
  Star,
  Bell,
  Layers,
  ChevronLeft,
  Info,
  MoreVertical,
  Edit,
  Trash2,
  ArrowRight,
  PlayCircle,
  StopCircle,
  User,
  SlidersHorizontal,
  RotateCcw,
  Check,
  CalendarDays,
  GraduationCap,
  Building2,
  School,
  Volume2,
} from 'lucide-react'
import { useAuthStore } from '../stores/authStore'
import { SquircleActionButton, PrintOptionModal } from '@/components/master-data'

// Helper Toast Notifications
function useToast() {
  const [toasts, setToasts] = useState([])
  const add = (type, title, message) => {
    const id = Date.now()
    setToasts((p) => [...p, { id, type, title, message }])
    setTimeout(() => setToasts((p) => p.filter((t) => t.id !== id)), 5000)
  }
  const dismiss = (id) => setToasts((p) => p.filter((t) => t.id !== id))
  return { toasts, dismiss, success: (t, m) => add('success', t, m), error: (t, m) => add('error', t, m), warning: (t, m) => add('warning', t, m), info: (t, m) => add('info', t, m) }
}

// ─── DYNAMIC UNIT SCOPED DATA GENERATOR ─────────────────────────────────────
function getScopedClassesForUnit(unitName) {
  const nameLower = (unitName || '').toLowerCase()
  if (nameLower.includes('sd') || nameLower.includes('sdit') || nameLower.includes('dasar')) {
    return ['Kelas 1A', 'Kelas 1B', 'Kelas 2A', 'Kelas 3A', 'Kelas 4A', 'Kelas 5A', 'Kelas 6A']
  }
  if (nameLower.includes('smp') || nameLower.includes('smpit') || nameLower.includes('menengah pertama')) {
    return ['Kelas VII A', 'Kelas VII B', 'Kelas VIII A', 'Kelas VIII B', 'Kelas IX A']
  }
  return ['X MIPA 1', 'X MIPA 2', 'XI IPS 1', 'XI IPS 2', 'XI MIPA 3', 'XII MIPA 1']
}

function getScopedStudentsForUnit(unitName) {
  const classes = getScopedClassesForUnit(unitName)
  const targetUnit = unitName || 'SDIT 1 Dar el-Iman - 50 Kota'

  return [
    { id: 'S001', nisn: '0054321001', name: 'Ahmad Fadhil', gender: 'L', class_name: classes[0] || 'Kelas 1A', unit_name: targetUnit, status: 'hadir_berjamaah', time: '12:05:12', method: 'RFID Tap', verified_by: `Wali Kelas ${classes[0] || '1A'}`, selected: false },
    { id: 'S002', nisn: '0054321002', name: 'Aisyah Putri', gender: 'P', class_name: classes[0] || 'Kelas 1A', unit_name: targetUnit, status: 'hadir_berjamaah', time: '12:06:40', method: 'QR Code', verified_by: 'Guru Pendamping', selected: false },
    { id: 'S003', nisn: '0054321003', name: 'Bilal Ar-Rasyid', gender: 'L', class_name: classes[1] || 'Kelas 1B', unit_name: targetUnit, status: 'masbuk', time: '12:22:15', method: 'Manual', notes: 'Masbuk 1 Rakaat', selected: false },
    { id: 'S004', nisn: '0054321004', name: 'Fatimah Azzahra', gender: 'P', class_name: classes[2] || 'Kelas 2A', unit_name: targetUnit, status: 'uzur_sakit', time: '-', method: '-', notes: 'Halangan / Uzur Syar\'i', selected: false },
    { id: 'S005', nisn: '0054321005', name: 'Muhammad Rayhan', gender: 'L', class_name: classes[3] || 'Kelas 3A', unit_name: targetUnit, status: 'izin', time: '-', method: '-', notes: 'Izin UKS Sakit Kepala', selected: false },
    { id: 'S006', nisn: '0054321006', name: 'Zahra Nabila', gender: 'P', class_name: classes[4] || 'Kelas 4A', unit_name: targetUnit, status: 'hadir_berjamaah', time: '12:08:02', method: 'RFID Tap', verified_by: 'Guru BK', selected: false },
    { id: 'S007', nisn: '0054321007', name: 'Umar Al-Faruq', gender: 'L', class_name: classes[5] || 'Kelas 5A', unit_name: targetUnit, status: 'alpa', time: '-', method: '-', notes: 'Tanpa Keterangan', selected: false },
    { id: 'S008', nisn: '0054321008', name: 'Khadijah Nurul', gender: 'P', class_name: classes[6] || 'Kelas 6A', unit_name: targetUnit, status: 'belum_verifikasi', time: '-', method: '-', selected: false },
  ]
}

const INITIAL_SCHOOL_SESSIONS = [
  {
    id: 'school-session-4',
    scheduled_start_at: '07:00',
    scheduled_end_at: '07:15',
    status: 'opened',
    location_name: 'Kelas / Rombel Masing-Masing',
    template: {
      id: 'tmpl-doa-pagi',
      nama: 'Dzikir Pagi & Doa Sebelum Belajar',
      code: 'DOA_PAGI_SEKOLAH',
      category: 'ibadah_lain',
      obligation_type: 'pembiasaan',
      gender_scope: 'all',
    },
  },
  {
    id: 'school-session-1',
    scheduled_start_at: '07:15',
    scheduled_end_at: '07:45',
    status: 'opened',
    location_name: 'Musholla Utama Sekolah',
    template: {
      id: 'tmpl-dhuha',
      nama: 'Shalat Dhuha Bersama Sekolah',
      code: 'DHUHA_SEKOLAH',
      category: 'shalat_sunnah',
      obligation_type: 'sunnah_muakkad',
      gender_scope: 'all',
    },
  },
  {
    id: 'school-session-2',
    scheduled_start_at: '12:00',
    scheduled_end_at: '12:45',
    status: 'opened',
    location_name: 'Masjid Kampus / Hall Sekolah',
    template: {
      id: 'tmpl-zhuhur',
      nama: 'Shalat Zhuhur Berjamaah Siswa',
      code: 'ZHUHUR_SEKOLAH',
      category: 'shalat_wajib',
      obligation_type: 'wajib',
      gender_scope: 'all',
    },
  },
  {
    id: 'school-session-3',
    scheduled_start_at: '15:15',
    scheduled_end_at: '15:45',
    status: 'upcoming',
    location_name: 'Musholla Utama Sekolah',
    template: {
      id: 'tmpl-ashar',
      nama: 'Shalat Ashar Berjamaah Siswa',
      code: 'ASHAR_SEKOLAH',
      category: 'shalat_wajib',
      obligation_type: 'wajib',
      gender_scope: 'all',
    },
  },
]

export default function StudentWorshipAttendancePage() {
  const authUser = useAuthStore((s) => s.user) || (() => {
    try {
      const raw = localStorage.getItem('school_erp_user') || sessionStorage.getItem('school_erp_user')
      return raw ? JSON.parse(raw) : null
    } catch {
      return null
    }
  })()

  const userRole = authUser?.role || authUser?.roles?.[0] || 'Kepala Sekolah'
  
  // Resolve exact logged in user unit name dynamically
  const userUnitName =
    authUser?.education_unit_name ||
    authUser?.education_unit?.nama ||
    authUser?.education_unit?.name ||
    authUser?.unit_name ||
    authUser?.unit?.nama ||
    authUser?.school_info?.nama_unit ||
    'SDIT 1 Dar el-Iman - 50 Kota'

  const isSuperOrYayasan = userRole === 'Superadmin' || userRole === 'Pengurus Yayasan'

  const [worshipMethod, setWorshipMethod] = useState('MANUAL') // 'MANUAL' | 'QRCODE' | 'RFID'
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10))
  const [now, setNow] = useState(new Date())

  // LIVE REAL-TIME CLOCK TIMER (1s Ticker)
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  const [sessions, setSessions] = useState(INITIAL_SCHOOL_SESSIONS)
  const [selectedSession, setSelectedSession] = useState(INITIAL_SCHOOL_SESSIONS[2]) // Zhuhur
  
  // Dynamic student list scoped 100% to active logged in unit (e.g. SDIT 1 Dar el-Iman - 50 Kota)
  const [students, setStudents] = useState(() => getScopedStudentsForUnit(userUnitName))

  // Dynamic class options based on unit level
  const availableClasses = getScopedClassesForUnit(userUnitName)

  // Filters & Search — Strictly scope filterUnit if non-superadmin
  const [searchQuery, setSearchQuery] = useState('')
  const [filterClass, setFilterClass] = useState('ALL')
  const [filterUnit, setFilterUnit] = useState(isSuperOrYayasan ? 'ALL' : userUnitName)
  const [filterStatus, setFilterStatus] = useState('ALL')
  const [perPage, setPerPage] = useState(10)

  // Modal Data Siswa Presensi Shalat
  const [isAttendingModalOpen, setIsAttendingModalOpen] = useState(false)
  const [modalStatusFilter, setModalStatusFilter] = useState('hadir')
  const [modalSearchQuery, setModalSearchQuery] = useState('')
  const [isPrintTableModalOpen, setIsPrintTableModalOpen] = useState(false)

  const handleOpenAttendingModal = (status = 'hadir') => {
    setModalStatusFilter(status)
    setModalSearchQuery('')
    setIsAttendingModalOpen(true)
  }

  // Scanning & Camera State
  const [scanInput, setScanInput] = useState('')
  const [processingScan, setProcessingScan] = useState(false)
  const [showCameraModal, setShowCameraModal] = useState(false)
  const [cameraActive, setCameraActive] = useState(false)
  const [cameraLoading, setCameraLoading] = useState(false)
  const [cameraError, setCameraError] = useState('')
  const videoRef = useRef(null)
  const streamRef = useRef(null)

  // Modal Verification & Templates State
  const [showVerifyModal, setShowVerifyModal] = useState(false)
  const [selectedStudentForVerify, setSelectedStudentForVerify] = useState(null)
  const [verifyStatus, setVerifyStatus] = useState('hadir_berjamaah')
  const [verifyNotes, setVerifyNotes] = useState('')

  // Modal Edit Manual Jam Sesi
  const [showEditSessionModal, setShowEditSessionModal] = useState(false)
  const [editSessionForm, setEditSessionForm] = useState({
    id: '',
    nama: '',
    start_time: '12:00',
    end_time: '12:45',
    location_name: '',
    status: 'opened',
  })

  // Template Form State
  const [showTemplateModal, setShowTemplateModal] = useState(false)
  const [templateForm, setTemplateForm] = useState({
    nama: '',
    code: '',
    category: 'shalat_wajib',
    obligation_type: 'wajib',
    education_unit_name: userUnitName,
    gender_scope: 'all',
    start_time: '12:00',
    end_time: '12:45',
    location_name: 'Masjid Utama Sekolah',
  })

  const { toasts, dismiss, success: toastSuccess, error: toastError, warning: toastWarning, info: toastInfo } = useToast()

  // Format Dynamic Day & Date Display (Indonesian Locale)
  const formattedDayName = new Intl.DateTimeFormat('id-ID', { weekday: 'long' }).format(now)
  const formattedFullDate = new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }).format(now)
  const formattedLiveClock = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' })

  // ── CAMERA & WEBCAM HANDLERS FOR QR SCANNER ──────────────────────────────
  const startCamera = async () => {
    setCameraLoading(true)
    setCameraError('')
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } }
        })
        streamRef.current = stream
        if (videoRef.current) {
          videoRef.current.srcObject = stream
          await videoRef.current.play()
        }
        setCameraActive(true)
        toastSuccess('Kamera Pemindai Aktif', 'Arahkan kamera ke QR Code Kartu Siswa.')
      } else {
        setCameraError('Kamera tidak didukung oleh peramban ini.')
        toastError('Kamera Tidak Didukung', 'Gunakan peramban modern atau input manual.')
      }
    } catch (err) {
      console.error('Camera access error:', err)
      setCameraError('Akses kamera ditolak atau perangkat kamera tidak ditemukan.')
      toastError('Gagal Mengakses Kamera', 'Pastikan izin kamera diizinkan pada peramban.')
    } finally {
      setCameraLoading(false)
    }
  }

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop())
      streamRef.current = null
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null
    }
    setCameraActive(false)
  }

  useEffect(() => {
    return () => stopCamera()
  }, [])

  // ── STATS CALCULATION ────────────────────────────────────────────────────
  const totalStudents = students.length
  const countHadir = students.filter((s) => s.status === 'hadir_berjamaah').length
  const countMasbuk = students.filter((s) => s.status === 'masbuk').length
  const countUzur = students.filter((s) => s.status === 'uzur_sakit').length
  const countIzin = students.filter((s) => s.status === 'izin').length
  const countAlpa = students.filter((s) => s.status === 'alpa').length
  const countBelum = students.filter((s) => s.status === 'belum_verifikasi').length
  const pctHadir = totalStudents > 0 ? ((countHadir / totalStudents) * 100).toFixed(1) : '0'

  // ── FILTERED STUDENTS ────────────────────────────────────────────────────
  const filteredStudents = students.filter((s) => {
    const matchSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase()) || s.nisn.includes(searchQuery)
    const matchClass = filterClass === 'ALL' || s.class_name === filterClass
    const matchUnit = filterUnit === 'ALL' || s.unit_name === filterUnit || !isSuperOrYayasan
    const matchStatus = filterStatus === 'ALL' || s.status === filterStatus
    return matchSearch && matchClass && matchUnit && matchStatus
  })

  // ── MANUAL CHECKLIST HANDLERS ─────────────────────────────────────────────
  const toggleSelectStudent = (id) => {
    setStudents((prev) =>
      prev.map((s) => (s.id === id ? { ...s, selected: !s.selected } : s))
    )
  }

  const toggleSelectAllFiltered = () => {
    const allSelected = filteredStudents.every((s) => s.selected)
    const filteredIds = new Set(filteredStudents.map((s) => s.id))
    setStudents((prev) =>
      prev.map((s) => (filteredIds.has(s.id) ? { ...s, selected: !allSelected } : s))
    )
  }

  const handleBulkStatusChange = (targetStatus) => {
    const selectedCount = students.filter((s) => s.selected).length
    if (selectedCount === 0) {
      toastWarning('Pilih Siswa', 'Silakan checklist siswa yang ingin diubah statusnya.')
      return
    }

    const nowStr = new Date().toLocaleTimeString('id-ID')
    setStudents((prev) =>
      prev.map((s) =>
        s.selected
          ? {
              ...s,
              status: targetStatus,
              method: 'Manual Checklist (Guru)',
              time: targetStatus === 'hadir_berjamaah' || targetStatus === 'masbuk' ? nowStr : '-',
              verified_by: 'Guru / Wali Kelas',
              selected: false,
            }
          : s
      )
    )

    const labelMap = {
      hadir_berjamaah: 'Hadir Berjamaah',
      masbuk: 'Masbuk / Terlambat',
      uzur_sakit: 'Uzur / Sakit',
      alpa: 'Alpa / Tidak Hadir',
    }

    toastSuccess('Presensi Simpan Manual', `${selectedCount} siswa berhasil ditandai "${labelMap[targetStatus] || targetStatus}".`)
  }

  // ── PROCESS SCAN CODE (QR CODE / RFID TAP) ────────────────────────────────
  const handleProcessScan = (code) => {
    if (!code.trim()) return
    setProcessingScan(true)

    setTimeout(() => {
      const match = students.find(
        (s) => s.nisn === code.trim() || s.id.toLowerCase() === code.trim().toLowerCase()
      )

      if (match) {
        const nowStr = new Date().toLocaleTimeString('id-ID')
        setStudents((prev) =>
          prev.map((s) =>
            s.id === match.id
              ? {
                  ...s,
                  status: 'hadir_berjamaah',
                  time: nowStr,
                  method: worshipMethod === 'QRCODE' ? 'Scan QR Code Kartu' : 'RFID Tap',
                  verified_by: 'Sistem Kartu Siswa',
                }
              : s
          )
        )
        toastSuccess('Scan Presensi Berhasil!', `[NISN: ${match.nisn}] ${match.name} (${match.class_name}) - Hadir Berjamaah.`)
        if (showCameraModal) {
          setShowCameraModal(false)
          stopCamera()
        }
      } else {
        toastError('Kartu Siswa Tidak Dikenali', `NISN/Kode "${code}" tidak ditemukan pada daftar kelas.`)
      }
      setScanInput('')
      setProcessingScan(false)
    }, 350)
  }

  // ── HANDLER UBAH JADWAL SHOLAT MANUAL ─────────────────────────────────────
  const handleOpenEditSessionModal = (session) => {
    setEditSessionForm({
      id: session.id,
      nama: session.template.nama,
      start_time: session.scheduled_start_at,
      end_time: session.scheduled_end_at,
      location_name: session.location_name,
      status: session.status,
    })
    setShowEditSessionModal(true)
  }

  const handleSaveEditSession = (e) => {
    e.preventDefault()
    setSessions((prev) =>
      prev.map((s) =>
        s.id === editSessionForm.id
          ? {
              ...s,
              scheduled_start_at: editSessionForm.start_time,
              scheduled_end_at: editSessionForm.end_time,
              location_name: editSessionForm.location_name,
              status: editSessionForm.status,
            }
          : s
      )
    )

    if (selectedSession?.id === editSessionForm.id) {
      setSelectedSession((prev) => ({
        ...prev,
        scheduled_start_at: editSessionForm.start_time,
        scheduled_end_at: editSessionForm.end_time,
        location_name: editSessionForm.location_name,
        status: editSessionForm.status,
      }))
    }

    toastSuccess('Jadwal Sholat Diperbarui', `Jam & lokasi ${editSessionForm.nama} berhasil disesuaikan.`)
    setShowEditSessionModal(false)
  }

  const formatStatusLabel = (st) => {
    if (st === 'hadir') return 'Hadir Berjamaah'
    if (st === 'masbuk') return 'Masbuk / Terlambat'
    if (st === 'uzur') return 'Uzur / Sakit'
    if (st === 'izin') return 'Izin'
    if (st === 'alpa') return 'Alpa'
    if (st === 'belum_verifikasi') return 'Belum Verifikasi'
    return 'Semua Status'
  }

  const filteredModalStudents = students.filter((st) => {
    const matchesSearch =
      modalSearchQuery === '' ||
      st.name.toLowerCase().includes(modalSearchQuery.toLowerCase()) ||
      st.nisn.includes(modalSearchQuery) ||
      st.class_name.toLowerCase().includes(modalSearchQuery.toLowerCase())

    let matchesStatus = true
    if (modalStatusFilter === 'hadir') matchesStatus = st.status === 'hadir'
    else if (modalStatusFilter === 'masbuk') matchesStatus = st.status === 'masbuk'
    else if (modalStatusFilter === 'uzur') matchesStatus = st.status === 'uzur'
    else if (modalStatusFilter === 'izin') matchesStatus = st.status === 'izin' || st.status === 'alpa'
    else if (modalStatusFilter === 'belum_verifikasi') matchesStatus = st.status === 'belum_verifikasi'

    return matchesSearch && matchesStatus
  })

  const handlePrintModalTable = () => {
    const columns = [
      { key: 'no', label: 'No' },
      { key: 'nisn', label: 'NISN' },
      { key: 'name', label: 'Nama Siswa' },
      { key: 'class_name', label: 'Kelas' },
      { key: 'status_label', label: 'Status Presensi Shalat' },
      { key: 'time', label: 'Waktu Presensi' },
      { key: 'method', label: 'Metode' },
    ]

    const data = filteredModalStudents.map((st, idx) => ({
      no: idx + 1,
      nisn: st.nisn,
      name: st.name,
      class_name: st.class_name,
      status_label: formatStatusLabel(st.status),
      time: st.time || '-',
      method: st.method || '-',
    }))

    printCleanTable({
      title: `DATA KEHADIRAN SISWA: ${selectedSession?.template.nama}`,
      subtitle: `Sesi: ${selectedSession?.template.nama} | Unit: ${userUnitName} | Filter: ${formatStatusLabel(modalStatusFilter)}`,
      columns,
      data,
    })
  }

  const handleDownloadPdfModalTable = () => {
    const columns = [
      { key: 'no', label: 'No' },
      { key: 'nisn', label: 'NISN' },
      { key: 'name', label: 'Nama Siswa' },
      { key: 'class_name', label: 'Kelas' },
      { key: 'status_label', label: 'Status Presensi Shalat' },
      { key: 'time', label: 'Waktu Presensi' },
      { key: 'method', label: 'Metode' },
    ]

    const data = filteredModalStudents.map((st, idx) => ({
      no: idx + 1,
      nisn: st.nisn,
      name: st.name,
      class_name: st.class_name,
      status_label: formatStatusLabel(st.status),
      time: st.time || '-',
      method: st.method || '-',
    }))

    downloadPdfTable({
      filename: `Presensi_Sholat_${selectedSession?.template.code || 'LIST'}_${date}.pdf`,
      title: `DATA KEHADIRAN SISWA: ${selectedSession?.template.nama}`,
      subtitle: `Sesi: ${selectedSession?.template.nama} | Unit: ${userUnitName} | Filter: ${formatStatusLabel(modalStatusFilter)}`,
      columns,
      data,
    })
  }

  const handlePrintCleanTableMain = () => {
    const columns = [
      { key: 'no', label: 'No' },
      { key: 'nisn', label: 'NISN' },
      { key: 'name', label: 'Nama Siswa' },
      { key: 'class_name', label: 'Kelas' },
      { key: 'status_label', label: 'Status Presensi Shalat' },
      { key: 'time', label: 'Waktu Presensi' },
      { key: 'method', label: 'Metode' },
    ]

    const data = filteredStudents.map((st, idx) => ({
      no: idx + 1,
      nisn: st.nisn,
      name: st.name,
      class_name: st.class_name,
      status_label: formatStatusLabel(st.status),
      time: st.time || '-',
      method: st.method || '-',
    }))

    printCleanTable({
      title: `DATA KEHADIRAN SISWA: ${selectedSession?.template.nama}`,
      subtitle: `Sesi: ${selectedSession?.template.nama} | Unit: ${userUnitName} | Jam: ${selectedSession?.scheduled_start_at} - ${selectedSession?.scheduled_end_at} WIB | Lokasi: ${selectedSession?.location_name}`,
      columns,
      data,
    })
  }

  const handleDownloadPdfTableMain = () => {
    const columns = [
      { key: 'no', label: 'No' },
      { key: 'nisn', label: 'NISN' },
      { key: 'name', label: 'Nama Siswa' },
      { key: 'class_name', label: 'Kelas' },
      { key: 'status_label', label: 'Status Presensi Shalat' },
      { key: 'time', label: 'Waktu Presensi' },
      { key: 'method', label: 'Metode' },
    ]

    const data = filteredStudents.map((st, idx) => ({
      no: idx + 1,
      nisn: st.nisn,
      name: st.name,
      class_name: st.class_name,
      status_label: formatStatusLabel(st.status),
      time: st.time || '-',
      method: st.method || '-',
    }))

    downloadPdfTable({
      filename: `Rekap_Presensi_Sholat_${selectedSession?.template.code || 'ROSTER'}_${date}.pdf`,
      title: `DATA KEHADIRAN SISWA: ${selectedSession?.template.nama}`,
      subtitle: `Sesi: ${selectedSession?.template.nama} | Unit: ${userUnitName} | Jam: ${selectedSession?.scheduled_start_at} - ${selectedSession?.scheduled_end_at} WIB | Lokasi: ${selectedSession?.location_name}`,
      columns,
      data,
    })
  }

  // ── SAVE SINGLE STUDENT VERIFICATION MODAL ────────────────────────────────
  const handleSaveVerify = () => {
    if (!selectedStudentForVerify) return
    const nowStr = new Date().toLocaleTimeString('id-ID')
    setStudents((prev) =>
      prev.map((s) =>
        s.id === selectedStudentForVerify.id
          ? {
              ...s,
              status: verifyStatus,
              notes: verifyNotes,
              time: verifyStatus === 'hadir_berjamaah' || verifyStatus === 'masbuk' ? nowStr : '-',
              verified_by: 'Guru / Wali Kelas',
            }
          : s
      )
    )
    toastSuccess('Status Ibadah Diperbarui', `Status ${selectedStudentForVerify.name} diperbarui menjadi "${verifyStatus}".`)
    setShowVerifyModal(false)
    setSelectedStudentForVerify(null)
    setVerifyNotes('')
  }

  // ── CREATE NEW WORSHIP TEMPLATE ───────────────────────────────────────────
  const handleCreateTemplate = (e) => {
    e.preventDefault()
    if (!templateForm.nama) {
      toastWarning('Form Belum Lengkap', 'Silakan isi nama kegiatan ibadah sekolah.')
      return
    }
    const newSession = {
      id: `school-session-${Date.now()}`,
      scheduled_start_at: templateForm.start_time,
      scheduled_end_at: templateForm.end_time,
      status: 'upcoming',
      location_name: templateForm.location_name || 'Musholla Sekolah',
      template: {
        id: `tmpl-${Date.now()}`,
        nama: templateForm.nama,
        code: templateForm.code || templateForm.nama.toUpperCase().replace(/\s+/g, '_'),
        category: templateForm.category,
        obligation_type: templateForm.obligation_type,
        gender_scope: templateForm.gender_scope,
      },
    }
    setSessions((prev) => [newSession, ...prev])
    toastSuccess('Template Ibadah Berhasil Dibuat', `Jadwal "${templateForm.nama}" ditambahkan ke sesi sekolah.`)
    setShowTemplateModal(false)
    setTemplateForm({
      nama: '',
      code: '',
      category: 'shalat_wajib',
      obligation_type: 'wajib',
      education_unit_name: userUnitName,
      gender_scope: 'all',
      start_time: '12:00',
      end_time: '12:45',
      location_name: 'Masjid Utama Sekolah',
    })
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

  function KpiTintedCard({ icon: Icon, label, subtext, value, tone = 'emerald', onClick }) {
    const tones = {
      sky: {
        card: 'border-sky-100 bg-sky-50/50 hover:border-sky-200 dark:border-sky-950/50 dark:bg-sky-950/20',
        title: 'text-sky-700 dark:text-sky-400',
        icon: 'text-sky-500',
        val: 'text-sky-600 dark:text-sky-300',
        sub: 'text-sky-600/70 dark:text-sky-400/70',
      },
      emerald: {
        card: 'border-emerald-100 bg-emerald-50/50 hover:border-emerald-200 dark:border-emerald-950/50 dark:bg-emerald-950/20',
        title: 'text-emerald-700 dark:text-emerald-400',
        icon: 'text-emerald-500',
        val: 'text-emerald-600 dark:text-emerald-300',
        sub: 'text-emerald-600/70 dark:text-emerald-400/70',
      },
      amber: {
        card: 'border-amber-100 bg-amber-50/50 hover:border-amber-200 dark:border-amber-950/50 dark:bg-amber-950/20',
        title: 'text-amber-700 dark:text-amber-400',
        icon: 'text-amber-500',
        val: 'text-amber-600 dark:text-amber-300',
        sub: 'text-amber-600/70 dark:text-amber-400/70',
      },
      purple: {
        card: 'border-purple-100 bg-purple-50/50 hover:border-purple-200 dark:border-purple-950/50 dark:bg-purple-950/20',
        title: 'text-purple-700 dark:text-purple-400',
        icon: 'text-purple-500',
        val: 'text-purple-600 dark:text-purple-300',
        sub: 'text-purple-600/70 dark:text-purple-400/70',
      },
      rose: {
        card: 'border-rose-100 bg-rose-50/50 hover:border-rose-200 dark:border-rose-950/50 dark:bg-rose-950/20',
        title: 'text-rose-700 dark:text-rose-400',
        icon: 'text-rose-500',
        val: 'text-rose-600 dark:text-rose-300',
        sub: 'text-rose-600/70 dark:text-rose-400/70',
      },
      slate: {
        card: 'border-slate-100 bg-slate-50/50 hover:border-slate-200 dark:border-slate-800 dark:bg-slate-800/20',
        title: 'text-slate-700 dark:text-slate-400',
        icon: 'text-slate-500',
        val: 'text-slate-600 dark:text-slate-300',
        sub: 'text-slate-600/70 dark:text-slate-400/70',
      },
    }
    const t = tones[tone] || tones.emerald

    return (
      <Card
        onClick={onClick}
        className={`text-left rounded-2xl border ${t.card} p-3.5 shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md ${onClick ? 'cursor-pointer' : 'cursor-default'} group min-w-0 flex flex-col gap-1`}
      >
        <CardHeader className="p-0 flex flex-row items-center justify-between gap-1 min-w-0">
          <CardDescription className={`text-[11px] font-bold ${t.title} truncate`}>{label}</CardDescription>
          <Icon className={`h-4 w-4 shrink-0 ${t.icon} opacity-60 group-hover:opacity-100 transition-opacity`} />
        </CardHeader>
        <CardContent className="p-0">
          <CardTitle className={`mt-1.5 text-xl font-black ${t.val}`}>{value ?? 0}</CardTitle>
          {subtext && (
            <p className={`mt-0.5 text-[10px] font-bold ${t.sub} flex items-center gap-0.5 truncate`}>
              {subtext}
            </p>
          )}
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-5">
      <motion.div initial="hidden" animate="visible" variants={containerVariants} className="space-y-5">
      
      {/* ── TOAST NOTIFICATIONS ──────────────────────────────────────────── */}
      <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-sm">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`flex items-start gap-3 rounded-xl p-3.5 shadow-lg border backdrop-blur-md transition-all ${
              t.type === 'success'
                ? 'bg-emerald-600/95 text-white border-emerald-400'
                : t.type === 'error'
                ? 'bg-rose-600/95 text-white border-rose-400'
                : t.type === 'warning'
                ? 'bg-amber-600/95 text-white border-amber-400'
                : 'bg-sky-600/95 text-white border-sky-400'
            }`}
          >
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold">{t.title}</p>
              <p className="text-[11px] opacity-90 mt-0.5">{t.message}</p>
            </div>
            <button onClick={() => dismiss(t.id)} className="text-white/80 hover:text-white">
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>

      {/* ── TOP SECTION CONTAINER (HEADER HERO & CARDS LANDING AREA) ──────── */}
      <motion.header variants={itemVariants} className="space-y-5">
        
        {/* HERO CARD HEADER WITH DYNAMICALLY RESOLVED USER UNIT NAME (STRICT 1 SINGLE ROW) */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 sm:p-5 shadow-xs dark:border-slate-800 dark:bg-[#111827]">
          <div className="flex items-center justify-between gap-3 flex-nowrap">
            {/* Left Title & Unit Info */}
            <div className="flex items-center gap-3 min-w-0 shrink">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-600 text-white shadow-xs">
                <School className="h-5.5 w-5.5" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 truncate">
                  <h1 className="text-base sm:text-lg font-bold tracking-tight text-slate-900 dark:text-white truncate">
                    Presensi & Absensi Ibadah Siswa
                  </h1>
                  <span className="shrink-0 rounded-full bg-sky-100 px-2.5 py-0.5 text-xs font-bold text-sky-700 dark:bg-sky-950/80 dark:text-sky-300">
                    {userUnitName}
                  </span>
                </div>
                <p className="hidden md:block truncate text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Pencatatan & Verifikasi Ibadah Harian Siswa (Shalat Dhuha, Zhuhur & Ashar Berjamaah di {userUnitName})
                </p>
              </div>
            </div>

            {/* Right Controls: Live Clock + Field Tanggal + Squircle Action Button (SINGLE ROW) */}
            <div className="flex items-center gap-2 shrink-0 flex-nowrap">
              
              {/* Real-Time Live Clock Badge */}
              <div className="hidden sm:flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50/80 px-3 py-1.5 dark:border-emerald-900 dark:bg-emerald-950/40">
                <div className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
                <div className="text-right">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-300 leading-none">
                    {formattedDayName}, {formattedFullDate}
                  </p>
                  <p className="text-xs font-black font-mono text-emerald-900 dark:text-emerald-200 leading-tight mt-0.5">
                    {formattedLiveClock} WIB
                  </p>
                </div>
              </div>

              {/* Date Picker Input (Field Tanggal) */}
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="rounded-xl border border-slate-200/80 bg-slate-50/50 px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-2xs focus:border-emerald-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-200"
              />

              {/* Squircle Action Button Icon-Only with Floating Tooltip on Hover */}
              <SquircleActionButton
                variant="primary"
                icon={Plus}
                label="Tambah Jadwal Ibadah"
                onClick={() => setShowTemplateModal(true)}
              />
            </div>
          </div>
        </div>

        {/* CARD 1: KPI STATS METRIC CARDS GRID */}
        <section className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          <KpiTintedCard
            icon={Users}
            label="Total Wajib Ibadah"
            value={`${totalStudents} Siswa`}
            subtext={userUnitName}
            tone="sky"
            onClick={() => handleOpenAttendingModal('ALL')}
          />
          <KpiTintedCard
            icon={CheckCircle2}
            label="Hadir Berjamaah"
            value={`${countHadir} Siswa`}
            subtext={`${pctHadir}% Presensi`}
            tone="emerald"
            onClick={() => handleOpenAttendingModal('hadir')}
          />
          <KpiTintedCard
            icon={Clock}
            label="Masbuk / Terlambat"
            value={`${countMasbuk} Siswa`}
            subtext="Dicatat Guru"
            tone="amber"
            onClick={() => handleOpenAttendingModal('masbuk')}
          />
          <KpiTintedCard
            icon={Heart}
            label="Uzur / Sakit"
            value={`${countUzur} Siswa`}
            subtext="Halangan Syar'i"
            tone="purple"
            onClick={() => handleOpenAttendingModal('uzur')}
          />
          <KpiTintedCard
            icon={ShieldAlert}
            label="Izin / Alpa"
            value={`${countIzin + countAlpa} Siswa`}
            subtext="Tercatat di BK/UKS"
            tone="rose"
            onClick={() => handleOpenAttendingModal('izin')}
          />
          <KpiTintedCard
            icon={ShieldCheck}
            label="Belum Verifikasi"
            value={`${countBelum} Siswa`}
            subtext="Menunggu Input"
            tone="slate"
            onClick={() => handleOpenAttendingModal('belum_verifikasi')}
          />
        </section>

        {/* CARD 2: METODE PRESENSI SISWA SELECTOR CARD WITH FRAMER MOTION ANIMATIONS */}
        <motion.div variants={itemVariants} className="rounded-2xl border border-slate-200/80 bg-white p-5 sm:p-6 shadow-xs dark:border-slate-800 dark:bg-[#111827]">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Pilih Metode Presensi Siswa
                </h3>
                <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-extrabold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                  Interactive Mode
                </span>
              </div>
              <p className="text-[11px] font-medium text-slate-400 mt-0.5">
                Pilih metode input presensi yang digunakan oleh Guru / Wali Kelas
              </p>
            </div>

            {/* Method Switcher Buttons with Framer Motion Sliding Pill (layoutId="activeWorshipMethodBg") */}
            <div className="relative flex flex-wrap items-center gap-1.5 rounded-2xl bg-slate-100/90 p-1.5 dark:bg-slate-800/90 border border-slate-200/60 dark:border-slate-700/60">
              {[
                {
                  key: 'MANUAL',
                  label: 'Manual Checklist',
                  icon: UserCheck,
                  activeColor: 'text-sky-700 dark:text-sky-300',
                  iconColor: 'text-sky-600 dark:text-sky-400',
                },
                {
                  key: 'QRCODE',
                  label: 'Scan QR Code Kartu',
                  icon: QrCode,
                  activeColor: 'text-indigo-700 dark:text-indigo-300',
                  iconColor: 'text-indigo-600 dark:text-indigo-400',
                },
                {
                  key: 'RFID',
                  label: 'Tap RFID Reader',
                  icon: Radio,
                  activeColor: 'text-emerald-700 dark:text-emerald-300',
                  iconColor: 'text-emerald-600 dark:text-emerald-400',
                },
              ].map((m) => {
                const isActive = worshipMethod === m.key
                const IconComponent = m.icon
                return (
                  <motion.button
                    key={m.key}
                    type="button"
                    onClick={() => setWorshipMethod(m.key)}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    className={`relative z-10 flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-bold transition-colors cursor-pointer ${
                      isActive
                        ? m.activeColor
                        : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
                    }`}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="activeWorshipMethodBg"
                        className="absolute inset-0 rounded-xl bg-white shadow-md dark:bg-slate-700"
                        transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                      />
                    )}
                    <span className="relative z-10 flex items-center gap-1.5">
                      <IconComponent className={`h-4 w-4 shrink-0 ${isActive ? m.iconColor : 'text-slate-400'}`} />
                      <span>{m.label}</span>
                    </span>
                  </motion.button>
                )
              })}
            </div>
          </div>

          {/* Active Mode Banner with AnimatePresence */}
          <div className="mt-4 pt-3.5 border-t border-slate-100 dark:border-slate-800">
            <AnimatePresence mode="wait">
              {worshipMethod === 'MANUAL' && (
                <motion.div
                  key="MANUAL"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.2 }}
                  className="flex items-center justify-between rounded-xl bg-sky-50/80 p-3 text-xs dark:bg-sky-950/30 border border-sky-100 dark:border-sky-900/50"
                >
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-sky-600 shrink-0" />
                    <span className="font-semibold text-sky-900 dark:text-sky-200">
                      Mode Checklist Manual Aktif — Centang nama siswa pada tabel di bawah, lalu klik "Hadir Berjamaah" / "Masbuk".
                    </span>
                  </div>
                </motion.div>
              )}

              {worshipMethod === 'QRCODE' && (
                <motion.div
                  key="QRCODE"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.2 }}
                  className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5 rounded-xl bg-indigo-50/80 p-3 text-xs dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/50"
                >
                  <div className="flex items-center gap-2">
                    <Camera className="h-4 w-4 text-indigo-600 shrink-0" />
                    <span className="font-semibold text-indigo-900 dark:text-indigo-200">
                      Mode Scan QR Code Kartu Siswa — Pemindaian aktif via Kamera / Scanner Kartu Pelajar.
                    </span>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      setShowCameraModal(true)
                      startCamera()
                    }}
                    className="flex items-center justify-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white shadow-md shadow-indigo-600/20 transition-all hover:bg-indigo-700"
                  >
                    <Camera className="h-4 w-4" />
                    <span>Buka Layar Scanner Kamera</span>
                  </motion.button>
                </motion.div>
              )}

              {worshipMethod === 'RFID' && (
                <motion.div
                  key="RFID"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.2 }}
                  className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5 rounded-xl bg-emerald-50/80 p-3 text-xs dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/50"
                >
                  <div className="flex items-center gap-2">
                    <Wifi className="h-4 w-4 text-emerald-600 shrink-0 animate-pulse" />
                    <span className="font-semibold text-emerald-900 dark:text-emerald-200">
                      Mode RFID Receiver Aktif — Tempelkan Kartu Siswa pada reader. Sinyal siap diproses.
                    </span>
                  </div>
                  <div className="relative min-w-[200px]">
                    <input
                      type="text"
                      autoFocus
                      value={scanInput}
                      onChange={(e) => setScanInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleProcessScan(scanInput)}
                      placeholder="Tap Kartu RFID..."
                      className="w-full rounded-xl border border-emerald-300 bg-white py-1.5 pl-8 pr-3 text-xs font-mono font-bold text-emerald-800 focus:border-emerald-500 focus:outline-none dark:border-emerald-700 dark:bg-slate-800 dark:text-emerald-300 shadow-2xs"
                    />
                    <Radio className="absolute left-2.5 top-2 h-3.5 w-3.5 text-emerald-500 animate-bounce" />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* CARD 3: SESI IBADAH SEKOLAH HORIZONTAL CARD */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 sm:p-6 shadow-xs dark:border-slate-800 dark:bg-[#111827]">
          <div className="mb-3.5 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400 shadow-2xs">
                <Moon className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-slate-200">
                  Sesi Ibadah Sekolah
                </h2>
                <p className="text-[11px] font-medium text-slate-400">Pilih sesi ibadah aktif untuk mencatat atau meninjau presensi siswa</p>
              </div>
            </div>
            <span className="rounded-full bg-emerald-100/90 px-3 py-1 text-xs font-extrabold text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300">
              {sessions.length} Sesi
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            {sessions.map((sess) => {
              const isSelected = selectedSession?.id === sess.id
              const isDzikir = sess.template.code.includes('DOA') || sess.template.code.includes('DZIKIR')
              const isDhuha = sess.template.code.includes('DHUHA')
              const isZhuhur = sess.template.code.includes('ZHUHUR')
              
              const SessionIconComponent = isDzikir ? Sun : isDhuha ? Sparkles : isZhuhur ? Sun : Moon

              return (
                <div
                  key={sess.id}
                  onClick={() => {
                    setSelectedSession(sess)
                    handleOpenAttendingModal('hadir')
                  }}
                  className={`cursor-pointer group relative overflow-hidden rounded-2xl border p-3.5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md ${
                    isSelected
                      ? 'border-emerald-500 bg-gradient-to-br from-emerald-50/90 via-emerald-50/40 to-white dark:border-emerald-600 dark:from-emerald-950/50 dark:to-[#111827] shadow-sm ring-2 ring-emerald-500/20'
                      : 'border-slate-200/80 bg-white hover:border-emerald-300 dark:border-slate-800 dark:bg-slate-900/60 dark:hover:border-emerald-700'
                  }`}
                >
                  {isSelected && (
                    <div className="absolute top-0 right-0 left-0 h-1.5 bg-gradient-to-r from-emerald-500 to-teal-600" />
                  )}

                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className={`flex size-9 shrink-0 items-center justify-center rounded-xl transition-all ${
                        isSelected
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300 group-hover:bg-emerald-100 group-hover:text-emerald-700'
                      }`}>
                        <SessionIconComponent className="size-4.5" />
                      </div>
                      <div className="min-w-0">
                        <h3 className={`text-xs font-black truncate ${isSelected ? 'text-emerald-950 dark:text-emerald-100' : 'text-slate-800 dark:text-slate-200'}`}>
                          {sess.template.nama}
                        </h3>
                        <div className="mt-0.5 flex items-center gap-1 text-[11px] font-black text-amber-600 dark:text-amber-400">
                          <Clock className="size-3 shrink-0" />
                          <span>{sess.scheduled_start_at} - {sess.scheduled_end_at} WIB</span>
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleOpenEditSessionModal(sess)
                      }}
                      title="Ubah Jam Sesi Manual"
                      className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 transition-colors shrink-0"
                    >
                      <Edit className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  <div className="mt-3 space-y-1.5 border-t border-slate-100 pt-2.5 dark:border-slate-800/80 text-[11px]">
                    <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
                      <span className="flex items-center gap-1 truncate font-semibold">
                        <MapPin className="size-3 text-slate-400 shrink-0" />
                        <span className="truncate">{sess.location_name}</span>
                      </span>
                    </div>
                    <div className="flex items-center justify-between pt-0.5">
                      <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Kehadiran:</span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          setSelectedSession(sess)
                          handleOpenAttendingModal('hadir')
                        }}
                        className={`rounded-full px-2.5 py-0.5 text-[10px] font-black transition-all hover:scale-105 active:scale-95 ${
                          isSelected ? 'bg-emerald-600 text-white shadow-xs' : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                        }`}
                      >
                        {countHadir}/{totalStudents} Siswa (Lihat Siswa)
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

      </motion.header>

      {/* ── MAIN CONTENT LAYOUT (FULL WIDTH DATA TABLE) ───────────────── */}
      <section className="space-y-5">
        <div className="space-y-4">
            
            {/* Toolbar Outer Container */}
            <div className="rounded-2xl border border-slate-200/80 bg-white shadow-xs dark:border-slate-800 dark:bg-[#111827] overflow-hidden">
              
              {/* Row 1: Section Title + Subtext + Action Buttons */}
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 p-4 sm:p-6 dark:border-slate-800">
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">
                      Data Kehadiran Siswa: <span className="text-sky-700 dark:text-sky-400">{selectedSession?.template.nama}</span>
                    </h3>
                    <button
                      onClick={() => handleOpenEditSessionModal(selectedSession)}
                      className="inline-flex items-center gap-1 rounded-lg bg-sky-50 border border-sky-200/80 px-2.5 py-1 text-[11px] font-bold text-sky-700 shadow-2xs transition-all hover:bg-sky-100 hover:scale-105 active:scale-95 dark:bg-sky-950/50 dark:border-sky-800 dark:text-sky-300"
                    >
                      <Edit className="h-3.5 w-3.5 text-sky-600" />
                      <span>Ubah Jam Manual</span>
                    </button>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                    <span className="flex items-center gap-1 font-medium">
                      <MapPin className="h-3.5 w-3.5 text-slate-400" />
                      <span>Lokasi: <strong className="text-slate-700 dark:text-slate-200">{selectedSession?.location_name}</strong></span>
                    </span>
                    <span className="text-slate-300 dark:text-slate-700">|</span>
                    <span className="flex items-center gap-1 font-medium">
                      <Clock className="h-3.5 w-3.5 text-slate-400" />
                      <span>Jam Sesi: <strong className="text-slate-700 dark:text-slate-200">{selectedSession?.scheduled_start_at} - {selectedSession?.scheduled_end_at} WIB</strong></span>
                    </span>
                  </div>
                </div>

                {/* Action Buttons Row */}
                <div className="flex flex-wrap items-center gap-2">
                  {worshipMethod === 'MANUAL' && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleBulkStatusChange('hadir_berjamaah')}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3.5 py-2 text-xs font-bold text-white shadow-md shadow-emerald-600/20 transition-all hover:bg-emerald-700 hover:scale-105 active:scale-95"
                      >
                        <Check className="h-4 w-4" />
                        <span>Hadir Berjamaah</span>
                      </button>
                      <button
                        onClick={() => handleBulkStatusChange('masbuk')}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-amber-500 px-3.5 py-2 text-xs font-bold text-white shadow-md shadow-amber-500/20 transition-all hover:bg-amber-600 hover:scale-105 active:scale-95"
                      >
                        <Clock className="h-4 w-4" />
                        <span>Masbuk</span>
                      </button>
                    </div>
                  )}

                  {/* TailGrids Standard Action Buttons: Import, Export, Cetak (Printer) */}
                  <SquircleActionButton
                    variant="import"
                    label="Import Data Presensi"
                    onClick={() => toastInfo('Import Presensi', 'Membuka dialog import presensi masal...')}
                  />
                  <SquircleActionButton
                    variant="export"
                    label="Export Rekap Presensi"
                    onClick={() => toastInfo('Export Presensi', 'Mengunduh rekap presensi siswa format Excel...')}
                  />
                  <SquircleActionButton
                    variant="view"
                    icon={Printer}
                    label="Cetak Data Kehadiran Siswa"
                    onClick={() => setIsPrintTableModalOpen(true)}
                  />
                </div>
              </div>

              {/* Row 2: Search + Filter Dropdowns + PerPage Select */}
              <div className="flex flex-wrap items-center gap-3 p-4 sm:px-6 bg-slate-50/50 border-b border-slate-100 dark:bg-slate-800/30 dark:border-slate-800">
                <div className="relative min-w-[220px] flex-1">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Cari Nama Siswa / NISN..."
                    className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-3 text-xs focus:border-sky-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800"
                  />
                </div>

                {/* Dynamic Unit Dropdown Scoped to Active User Unit */}
                <select
                  value={filterUnit}
                  disabled={!isSuperOrYayasan}
                  onChange={(e) => setFilterUnit(e.target.value)}
                  className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-sm focus:border-sky-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 disabled:bg-slate-100 dark:disabled:bg-slate-800/80"
                >
                  {isSuperOrYayasan && <option value="ALL">Semua Unit Pendidikan</option>}
                  <option value={userUnitName}>{userUnitName}</option>
                  {userUnitName !== 'SDIT 1 Dar el-Iman - 50 Kota' && <option value="SDIT 1 Dar el-Iman - 50 Kota">SDIT 1 Dar el-Iman - 50 Kota</option>}
                  {userUnitName !== 'SMP Terpadu' && <option value="SMP Terpadu">SMP Terpadu</option>}
                  {userUnitName !== 'SMA Terpadu' && <option value="SMA Terpadu">SMA Terpadu</option>}
                </select>

                {/* Dynamic Classes Selector Adapted to Active Unit Level */}
                <select
                  value={filterClass}
                  onChange={(e) => setFilterClass(e.target.value)}
                  className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-sm focus:border-sky-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                >
                  <option value="ALL">Semua Kelas / Rombel</option>
                  {availableClasses.map((cls) => (
                    <option key={cls} value={cls}>{cls}</option>
                  ))}
                </select>

                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-sm focus:border-sky-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                >
                  <option value="ALL">Semua Status Presensi</option>
                  <option value="hadir_berjamaah">Hadir Berjamaah</option>
                  <option value="masbuk">Masbuk / Terlambat</option>
                  <option value="uzur_sakit">Uzur / Sakit</option>
                  <option value="izin">Izin</option>
                  <option value="alpa">Alpa</option>
                  <option value="belum_verifikasi">Belum Verifikasi</option>
                </select>

                <select
                  value={perPage}
                  onChange={(e) => setPerPage(Number(e.target.value))}
                  className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-sm focus:border-sky-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                >
                  <option value={5}>5 / hal</option>
                  <option value={10}>10 / hal</option>
                  <option value={25}>25 / hal</option>
                  <option value={50}>50 / hal</option>
                </select>
              </div>

              {/* Data Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50/80 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:bg-slate-800/60 dark:text-slate-400">
                    <tr>
                      {worshipMethod === 'MANUAL' && (
                        <th className="w-10 px-4 py-3 text-center">
                          <input
                            type="checkbox"
                            checked={filteredStudents.length > 0 && filteredStudents.every((s) => s.selected)}
                            onChange={toggleSelectAllFiltered}
                            className="h-4 w-4 rounded border-slate-300 text-sky-600 focus:ring-sky-500"
                          />
                        </th>
                      )}
                      <th className="px-4 sm:px-6 py-3.5">Siswa</th>
                      <th className="px-4 py-3.5">NISN</th>
                      <th className="px-4 py-3.5">Kelas / Rombel</th>
                      <th className="px-4 py-3.5">Status Ibadah</th>
                      <th className="px-4 py-3.5">Metode & Waktu</th>
                      <th className="px-4 sm:px-6 py-3.5 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {filteredStudents.length === 0 ? (
                      <tr>
                        <td colSpan={worshipMethod === 'MANUAL' ? 7 : 6} className="px-4 py-8 text-center text-slate-400">
                          Tidak ada data siswa yang sesuai dengan filter kelas/unit.
                        </td>
                      </tr>
                    ) : (
                      filteredStudents.slice(0, perPage).map((student) => {
                        return (
                          <tr key={student.id} className={`transition-all hover:bg-slate-50/90 hover:scale-[1.001] dark:hover:bg-slate-800/40 ${student.selected ? 'bg-sky-50/50 dark:bg-sky-950/20' : ''}`}>
                            {worshipMethod === 'MANUAL' && (
                              <td className="px-4 py-3.5 text-center">
                                <input
                                  type="checkbox"
                                  checked={student.selected || false}
                                  onChange={() => toggleSelectStudent(student.id)}
                                  className="h-4 w-4 rounded border-slate-300 text-sky-600 focus:ring-sky-500"
                                />
                              </td>
                            )}
                            <td className="px-4 sm:px-6 py-3.5 font-semibold text-slate-900 dark:text-white">
                              <div className="flex items-center gap-2.5">
                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-sky-100 text-sky-700 font-bold text-xs dark:bg-sky-950 dark:text-sky-300">
                                  {student.name.charAt(0)}
                                </div>
                                <div>
                                  <p className="font-bold">{student.name}</p>
                                  <p className="text-[10px] text-slate-400">{student.unit_name}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-3.5 text-slate-600 dark:text-slate-300 font-mono">{student.nisn}</td>
                            <td className="px-4 py-3.5">
                              <span className="rounded-lg bg-slate-100 px-2.5 py-1 text-[10px] font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                                {student.class_name}
                              </span>
                            </td>
                            <td className="px-4 py-3.5">
                              <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                                student.status === 'hadir_berjamaah'
                                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                                  : student.status === 'masbuk'
                                  ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                                  : student.status === 'uzur_sakit'
                                  ? 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300'
                                  : student.status === 'izin'
                                  ? 'bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300'
                                  : student.status === 'alpa'
                                  ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                                  : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                              }`}>
                                {student.status === 'hadir_berjamaah' && 'Hadir Berjamaah'}
                                {student.status === 'masbuk' && 'Masbuk / Terlambat'}
                                {student.status === 'uzur_sakit' && 'Uzur / Sakit'}
                                {student.status === 'izin' && 'Izin'}
                                {student.status === 'alpa' && 'Alpa'}
                                {student.status === 'belum_verifikasi' && 'Belum Verifikasi'}
                              </span>
                            </td>
                            <td className="px-4 py-3.5 text-slate-500">
                              <p className="font-semibold text-slate-700 dark:text-slate-300">{student.time}</p>
                              <p className="text-[10px] text-slate-400">{student.method}</p>
                            </td>
                            <td className="px-4 sm:px-6 py-3.5 text-right">
                              <button
                                onClick={() => {
                                  setSelectedStudentForVerify(student)
                                  setVerifyStatus(student.status)
                                  setVerifyNotes(student.notes || '')
                                  setShowVerifyModal(true)
                                }}
                                className="rounded-xl bg-sky-50 px-3 py-1.5 text-xs font-bold text-sky-600 transition hover:bg-sky-100 hover:scale-105 active:scale-95 dark:bg-sky-950/60 dark:text-sky-400"
                              >
                                Edit Status
                              </button>
                            </td>
                          </tr>
                        )
                      })
                    )}
                  </tbody>
                </table>
              </div>

              {/* TailGrids Standard Pagination Row */}
              <div className="flex items-center justify-between text-xs text-slate-500 border-t border-slate-100 px-4 py-3.5 sm:px-6 dark:border-slate-800">
                <p>Menampilkan 1-{Math.min(perPage, filteredStudents.length)} dari {filteredStudents.length} Siswa</p>
                <div className="flex items-center gap-1">
                  <button disabled className="rounded-xl border border-slate-200 px-3 py-1.5 text-slate-400 disabled:opacity-50 dark:border-slate-700 font-semibold">Prev</button>
                  <button className="rounded-xl bg-sky-600 px-3.5 py-1.5 font-bold text-white shadow-sm">1</button>
                  <button disabled className="rounded-xl border border-slate-200 px-3 py-1.5 text-slate-400 disabled:opacity-50 dark:border-slate-700 font-semibold">Next</button>
                </div>
              </div>
            </div>
          </div>
        </section>

      {/* ── MODAL UBAH MANUAL JADWAL SESI IBADAH ─────────────────────────── */}
      {showEditSessionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <form onSubmit={handleSaveEditSession} className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl dark:bg-[#111827] space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Ubah Manual Jam & Lokasi Sesi Ibadah
              </h3>
              <button type="button" onClick={() => setShowEditSessionModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Nama Sesi</label>
                <p className="font-bold text-sky-700 dark:text-sky-400 text-sm">{editSessionForm.nama}</p>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Jam Mulai Sesi</label>
                  <input
                    type="time"
                    required
                    value={editSessionForm.start_time}
                    onChange={(e) => setEditSessionForm({ ...editSessionForm, start_time: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 font-bold focus:border-sky-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Jam Selesai Sesi</label>
                  <input
                    type="time"
                    required
                    value={editSessionForm.end_time}
                    onChange={(e) => setEditSessionForm({ ...editSessionForm, end_time: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 font-bold focus:border-sky-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Lokasi Ibadah</label>
                <input
                  type="text"
                  required
                  value={editSessionForm.location_name}
                  onChange={(e) => setEditSessionForm({ ...editSessionForm, location_name: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 font-semibold focus:border-sky-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Status Sesi</label>
                <select
                  value={editSessionForm.status}
                  onChange={(e) => setEditSessionForm({ ...editSessionForm, status: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 font-semibold focus:border-sky-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800"
                >
                  <option value="opened">Dibuka (Opened)</option>
                  <option value="upcoming">Akan Datang (Upcoming)</option>
                  <option value="closed">Ditutup (Closed)</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-2 border-t border-slate-100 pt-3 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setShowEditSessionModal(false)}
                className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300"
              >
                Batal
              </button>
              <button
                type="submit"
                className="rounded-xl bg-sky-600 px-4 py-2 text-xs font-bold text-white hover:bg-sky-700"
              >
                Simpan Perubahan
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ── MODAL CAMERA SCANNER QR CODE ──────────────────────────────────── */}
      {showCameraModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-md p-4">
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl dark:bg-[#111827] space-y-4 border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                  <Camera className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Scanner QR Code Kartu Siswa
                  </h3>
                  <p className="text-[11px] text-slate-400">Arahkan QR Code pada kartu siswa ke area pemindai</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowCameraModal(false)
                  stopCamera()
                }}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Video Camera Viewfinder Screen */}
            <div className="relative overflow-hidden rounded-2xl bg-black aspect-video flex items-center justify-center border-2 border-indigo-500/50 shadow-inner">
              <video
                ref={videoRef}
                playsInline
                muted
                className="h-full w-full object-cover"
              />

              {/* Viewfinder Target Box Overlay */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="h-48 w-48 rounded-2xl border-2 border-dashed border-sky-400 bg-sky-500/10 shadow-[0_0_0_9999px_rgba(0,0,0,0.5)] flex flex-col items-center justify-between p-3">
                  <div className="w-full flex justify-between">
                    <span className="h-4 w-4 border-t-2 border-l-2 border-sky-400" />
                    <span className="h-4 w-4 border-t-2 border-r-2 border-sky-400" />
                  </div>
                  <p className="text-[10px] font-bold text-white bg-black/60 px-2 py-0.5 rounded-full">
                    Arahkan QR Code Di Sini
                  </p>
                  <div className="w-full flex justify-between">
                    <span className="h-4 w-4 border-b-2 border-l-2 border-sky-400" />
                    <span className="h-4 w-4 border-b-2 border-r-2 border-sky-400" />
                  </div>
                </div>
              </div>

              {cameraLoading && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900/90 text-white gap-2">
                  <RefreshCw className="h-8 w-8 animate-spin text-sky-400" />
                  <p className="text-xs font-semibold">Mengaktifkan Kamera Pemindai...</p>
                </div>
              )}

              {cameraError && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900/95 text-white p-4 text-center gap-2">
                  <AlertCircle className="h-8 w-8 text-rose-500" />
                  <p className="text-xs font-semibold text-rose-300">{cameraError}</p>
                </div>
              )}
            </div>

            {/* Manual QR NISN Input */}
            <div className="space-y-2 pt-2">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={scanInput}
                  onChange={(e) => setScanInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleProcessScan(scanInput)}
                  placeholder="Atau masukkan NISN hasil scan..."
                  className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs focus:border-indigo-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800"
                />
                <button
                  onClick={() => handleProcessScan(scanInput)}
                  disabled={processingScan}
                  className="rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white hover:bg-indigo-700 disabled:opacity-50"
                >
                  Proses QR
                </button>
              </div>

              <div className="flex justify-between items-center pt-2 text-[11px] text-slate-400 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={cameraActive ? stopCamera : startCamera}
                  className="flex items-center gap-1.5 font-bold text-slate-600 hover:text-slate-800 dark:text-slate-300"
                >
                  {cameraActive ? <><CameraOff className="h-3.5 w-3.5 text-rose-500" /> Matikan Kamera</> : <><Camera className="h-3.5 w-3.5 text-emerald-500" /> Nyalakan Kamera</>}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowCameraModal(false)
                    stopCamera()
                  }}
                  className="text-slate-500 hover:text-slate-700 font-semibold"
                >
                  Tutup Kamera
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL VERIFIKASI STATUS IBADAH SISWA ──────────────────────────── */}
      {showVerifyModal && selectedStudentForVerify && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl dark:bg-[#111827] space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Verifikasi Status Ibadah Siswa
              </h3>
              <button onClick={() => setShowVerifyModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <p className="font-bold text-slate-800 dark:text-slate-200">{selectedStudentForVerify.name}</p>
                <p className="text-slate-400">NISN: {selectedStudentForVerify.nisn} | Kelas: {selectedStudentForVerify.class_name}</p>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Status Presensi Ibadah</label>
                <select
                  value={verifyStatus}
                  onChange={(e) => setVerifyStatus(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs font-semibold focus:border-sky-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800"
                >
                  <option value="hadir_berjamaah">Hadir Berjamaah</option>
                  <option value="masbuk">Masbuk / Terlambat</option>
                  <option value="uzur_sakit">Uzur / Sakit (Halangan Syar'i)</option>
                  <option value="izin">Izin UKS / Izin Khusus</option>
                  <option value="alpa">Alpa / Tanpa Keterangan</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Catatan Verifikator</label>
                <textarea
                  rows={3}
                  value={verifyNotes}
                  onChange={(e) => setVerifyNotes(e.target.value)}
                  placeholder="Catatan tambahan (misal: Masbuk 1 rakaat, izin UKS...)"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs focus:border-sky-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 border-t border-slate-100 pt-3 dark:border-slate-800">
              <button
                onClick={() => setShowVerifyModal(false)}
                className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300"
              >
                Batal
              </button>
              <button
                onClick={handleSaveVerify}
                className="rounded-xl bg-sky-600 px-4 py-2 text-xs font-bold text-white hover:bg-sky-700"
              >
                Simpan Verifikasi
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL TAMBAH TEMPLATE IBADAH SEKOLAH ─────────────────────────── */}
      {showTemplateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <form onSubmit={handleCreateTemplate} className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl dark:bg-[#111827] space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Tambah Jadwal Ibadah Sekolah Baru
              </h3>
              <button type="button" onClick={() => setShowTemplateModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="col-span-2">
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Nama Kegiatan Ibadah</label>
                <input
                  type="text"
                  required
                  placeholder="Misal: Shalat Zhuhur Berjamaah Siswa"
                  value={templateForm.nama}
                  onChange={(e) => setTemplateForm({ ...templateForm, nama: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs focus:border-sky-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Kategori Ibadah</label>
                <select
                  value={templateForm.category}
                  onChange={(e) => setTemplateForm({ ...templateForm, category: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs font-semibold focus:border-sky-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800"
                >
                  <option value="shalat_wajib">Shalat Wajib</option>
                  <option value="shalat_sunnah">Shalat Sunnah (Dhuha)</option>
                  <option value="ibadah_lain">Pembiasaan Doa & Dzikir</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Tipe Kewajiban</label>
                <select
                  value={templateForm.obligation_type}
                  onChange={(e) => setTemplateForm({ ...templateForm, obligation_type: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs font-semibold focus:border-sky-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800"
                >
                  <option value="wajib">Wajib Sekolah</option>
                  <option value="sunnah_muakkad">Sunnah Muakkad</option>
                  <option value="pembiasaan">Pembiasaan Harian</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Jam Mulai</label>
                <input
                  type="time"
                  value={templateForm.start_time}
                  onChange={(e) => setTemplateForm({ ...templateForm, start_time: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs focus:border-sky-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Jam Selesai</label>
                <input
                  type="time"
                  value={templateForm.end_time}
                  onChange={(e) => setTemplateForm({ ...templateForm, end_time: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs focus:border-sky-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800"
                />
              </div>

              <div className="col-span-2">
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Lokasi Pelaksanaan</label>
                <input
                  type="text"
                  placeholder="Misal: Musholla Utama Sekolah / Hall Serbaguna"
                  value={templateForm.location_name}
                  onChange={(e) => setTemplateForm({ ...templateForm, location_name: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs focus:border-sky-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 border-t border-slate-100 pt-3 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setShowTemplateModal(false)}
                className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300"
              >
                Batal
              </button>
              <button
                type="submit"
                className="rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-700"
              >
                Simpan Jadwal
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ── MODAL DATA SISWA PRESENSI SHOLAT ────────────────────────────── */}
      <Backdrop isOpen={isAttendingModalOpen} onOpenChange={setIsAttendingModalOpen}>
        <Dialog className="w-full max-w-4xl border border-slate-200/90 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900 rounded-3xl">
          <div className="space-y-4">
            {/* Header */}
            <DialogHeader className="border-b border-slate-100 pb-4 dark:border-slate-800">
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <DialogTitle className="text-lg font-black text-slate-900 dark:text-white">
                      Data Presensi Siswa Sholat
                    </DialogTitle>
                    <Badge color="emerald" size="sm">
                      {selectedSession?.template.nama}
                    </Badge>
                  </div>
                  <DialogDescription className="text-xs text-slate-500 dark:text-slate-400">
                    Sesi: <span className="font-bold text-slate-700 dark:text-slate-200">{selectedSession?.template.nama}</span> | Jam: {selectedSession?.scheduled_start_at} - {selectedSession?.scheduled_end_at} WIB | Lokasi: {selectedSession?.location_name}
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>

            {/* Filter Tabs & Search Bar */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between bg-slate-50 p-3 rounded-2xl dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
              {/* Status Filter Buttons */}
              <div className="flex flex-wrap items-center gap-1.5 text-xs font-bold">
                {[
                  { key: 'hadir', label: 'Hadir Berjamaah', color: 'bg-emerald-600 text-white' },
                  { key: 'masbuk', label: 'Masbuk / Terlambat', color: 'bg-amber-600 text-white' },
                  { key: 'uzur', label: 'Uzur / Sakit', color: 'bg-purple-600 text-white' },
                  { key: 'izin', label: 'Izin / Alpa', color: 'bg-rose-600 text-white' },
                  { key: 'belum_verifikasi', label: 'Belum Verifikasi', color: 'bg-slate-700 text-white' },
                  { key: 'ALL', label: 'Semua Siswa', color: 'bg-sky-600 text-white' },
                ].map((st) => (
                  <button
                    key={st.key}
                    onClick={() => setModalStatusFilter(st.key)}
                    className={`px-3 py-1.5 rounded-xl transition-all ${
                      modalStatusFilter === st.key
                        ? `${st.color} shadow-xs scale-105`
                        : 'bg-white text-slate-600 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {st.label}
                  </button>
                ))}
              </div>

              {/* Search & Print Actions */}
              <div className="flex items-center gap-2">
                <div className="relative flex-1 sm:w-48">
                  <Search className="absolute left-3 top-2.5 size-3.5 text-slate-400" />
                  <input
                    type="text"
                    value={modalSearchQuery}
                    onChange={(e) => setModalSearchQuery(e.target.value)}
                    placeholder="Cari nama/kelas..."
                    className="w-full rounded-xl border border-slate-200 bg-white py-1.5 pl-8 pr-3 text-xs font-medium text-slate-800 focus:border-emerald-500 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                  />
                </div>
                <button
                  onClick={handlePrintModalTable}
                  title="Cetak Data Presensi Modal"
                  className="p-2 rounded-xl bg-sky-50 border border-sky-200 text-sky-700 hover:bg-sky-100 transition-all dark:bg-sky-950 dark:border-sky-800 dark:text-sky-300 shrink-0"
                >
                  <Printer className="size-4" />
                </button>
                <button
                  onClick={handleDownloadPdfModalTable}
                  title="Unduh PDF Data Modal"
                  className="p-2 rounded-xl bg-amber-50 border border-amber-200 text-amber-700 hover:bg-amber-100 transition-all dark:bg-amber-950 dark:border-amber-800 dark:text-amber-300 shrink-0"
                >
                  <Download className="size-4" />
                </button>
              </div>
            </div>

            {/* Table List */}
            <DialogBody className="py-0 max-h-[380px] overflow-y-auto">
              {filteredModalStudents.length === 0 ? (
                <div className="py-12 text-center text-slate-400">
                  <AlertCircle className="size-8 mx-auto mb-2 text-slate-300" />
                  <p className="font-semibold text-xs">Tidak ada data siswa ditemukan untuk status ini.</p>
                </div>
              ) : (
                <div className="overflow-x-auto rounded-xl border border-slate-200/80 dark:border-slate-800">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-[11px] font-black uppercase text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                      <tr>
                        <th className="p-3">No</th>
                        <th className="p-3">Siswa</th>
                        <th className="p-3">Kelas</th>
                        <th className="p-3 text-center">Status Presensi</th>
                        <th className="p-3">Waktu</th>
                        <th className="p-3">Metode</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {filteredModalStudents.map((st, idx) => (
                        <tr key={st.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors">
                          <td className="p-3 font-semibold text-slate-500">{idx + 1}</td>
                          <td className="p-3">
                            <div className="flex items-center gap-2.5">
                              <Avatar size="sm" status="online">
                                <AvatarFallback className="bg-emerald-100 font-extrabold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200">
                                  {st.name.substring(0, 2).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-bold text-slate-900 dark:text-white">{st.name}</p>
                                <p className="text-[10px] text-slate-400">NISN: {st.nisn}</p>
                              </div>
                            </div>
                          </td>
                          <td className="p-3 font-semibold text-slate-700 dark:text-slate-300">{st.class_name}</td>
                          <td className="p-3 text-center">
                            {st.status === 'hadir' && <Badge color="success" size="sm">Hadir Berjamaah</Badge>}
                            {st.status === 'masbuk' && <Badge color="warning" size="sm">Masbuk / Terlambat</Badge>}
                            {st.status === 'uzur' && <Badge color="purple" size="sm">Uzur / Sakit</Badge>}
                            {(st.status === 'izin' || st.status === 'alpa') && <Badge color="error" size="sm">Izin / Alpa</Badge>}
                            {st.status === 'belum_verifikasi' && <Badge color="gray" size="sm">Belum Verifikasi</Badge>}
                          </td>
                          <td className="p-3 font-medium text-slate-600 dark:text-slate-400">{st.time || '-'}</td>
                          <td className="p-3 font-medium text-slate-500">{st.method || 'Manual Checklist'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </DialogBody>

            {/* Footer */}
            <DialogFooter className="border-t border-slate-100 pt-3 dark:border-slate-800 flex items-center justify-between">
              <div className="text-xs font-semibold text-slate-500">
                Menampilkan <span className="font-bold text-emerald-600">{filteredModalStudents.length}</span> dari {students.length} siswa
              </div>
              <DialogClose
                onClick={() => setIsAttendingModalOpen(false)}
                variant="ghost"
                className="px-5 py-2 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
              >
                Tutup
              </DialogClose>
            </DialogFooter>
          </div>
        </Dialog>
      </Backdrop>

      {/* ── TAILGRIDS PRINT OPTION MODAL FOR MAIN DATATABLE ─────────────── */}
      <PrintOptionModal
        isOpen={isPrintTableModalOpen}
        onClose={() => setIsPrintTableModalOpen(false)}
        title={`Daftar Kehadiran Siswa — ${selectedSession?.template.nama}`}
        subtitle={`Sesi: ${selectedSession?.template.nama} | Jam: ${selectedSession?.scheduled_start_at} - ${selectedSession?.scheduled_end_at} WIB | Lokasi: ${selectedSession?.location_name} | Unit: ${userUnitName}`}
        onPrint={() => {
          handlePrintCleanTableMain()
          setIsPrintTableModalOpen(false)
        }}
        onDownload={() => {
          handleDownloadPdfTableMain()
          setIsPrintTableModalOpen(false)
        }}
      />

      </motion.div>
    </div>
  )
}
