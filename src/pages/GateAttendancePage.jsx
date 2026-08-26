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
  Filter,
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
  ChevronRight,
  ChevronDown,
  Settings,
  Lock,
  Layers,
} from 'lucide-react'
import Swal from 'sweetalert2'
import { gateAttendanceService } from '../services/gateAttendanceService'
import { educationUnitService } from '../services/educationUnitService'
import { studentService } from '../services/studentService'
import { useAuthStore } from '../stores/authStore'
import AppBreadcrumb from '../components/app/AppBreadcrumb'

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

  const renderStatusBadge = (status, checkOutTime) => {
    const st = String(status || '').toUpperCase()
    if (st === 'HADIR' || st === 'HADIR_DALAM_TOLERANSI') {
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-[11px] font-bold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
          <CheckCircle2 className="h-3 w-3" /> Hadir
        </span>
      )
    }
    if (st === 'TERLAMBAT') {
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-0.5 text-[11px] font-bold text-amber-800 dark:bg-amber-950 dark:text-amber-300">
          <Clock className="h-3 w-3" /> Terlambat
        </span>
      )
    }
    if (st === 'IZIN') {
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2.5 py-0.5 text-[11px] font-bold text-blue-800 dark:bg-blue-950 dark:text-blue-300">
          <ShieldCheck className="h-3 w-3" /> Izin
        </span>
      )
    }
    if (st === 'SAKIT') {
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-sky-100 px-2.5 py-0.5 text-[11px] font-bold text-sky-800 dark:bg-sky-950 dark:text-sky-300">
          <ShieldCheck className="h-3 w-3" /> Sakit
        </span>
      )
    }
    if (st === 'ALPHA') {
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-rose-100 px-2.5 py-0.5 text-[11px] font-bold text-rose-800 dark:bg-rose-950 dark:text-rose-300">
          <XCircle className="h-3 w-3" /> Alpha
        </span>
      )
    }
    if (checkOutTime) {
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-violet-100 px-2.5 py-0.5 text-[11px] font-bold text-violet-800 dark:bg-violet-950 dark:text-violet-300">
          <LogOut className="h-3 w-3" /> Sudah Pulang
        </span>
      )
    }
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-orange-100 px-2.5 py-0.5 text-[11px] font-bold text-orange-800 dark:bg-orange-950 dark:text-orange-300">
        <AlertTriangle className="h-3 w-3" /> Belum Hadir
      </span>
    )
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
      Swal.fire({
        icon: 'success',
        title: 'Pengaturan Disimpan!',
        text: res.data.message || 'Pengaturan jam masuk dan jam pulang berhasil diperbarui.',
        timer: 2000,
        showConfirmButton: false,
      })
      setShowScheduleModal(false)
      fetchScheduleConfig()
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Gagal Menyimpan',
        text: err?.response?.data?.message || 'Gagal menyimpan pengaturan jadwal jam masuk/pulang.',
      })
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

    try {
      let mediaStream = null
      try {
        mediaStream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: 'environment' }, width: { ideal: 1280 }, height: { ideal: 720 } },
        })
      } catch (e) {
        mediaStream = await navigator.mediaDevices.getUserMedia({ video: true })
      }

      streamRef.current = mediaStream

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream
        await videoRef.current.play()
      }
      setCameraActive(true)
    } catch (err) {
      console.error('Camera Access Error:', err)
      setCameraError('Kamera tidak dapat diakses. Pastikan izin (permission) kamera diizinkan di browser Anda.')
      setCameraActive(false)
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
        Swal.fire({
          icon: 'success',
          title: 'Presensi Masuk Berhasil!',
          html: `<b style="font-size:1.1rem; color:#0E5C44;">${studentName}</b> telah tercatat melakukan absensi masuk gerbang.`,
          timer: 2500,
          showConfirmButton: false,
        })
      } else {
        const res = await gateAttendanceService.scanCheckOut(payload)
        const studentName = res?.data?.data?.student?.nama_lengkap || res?.data?.data?.student?.full_name || 'Siswa'
        setLastScanResult({
          success: true,
          message: res.data.message,
          data: res.data.data,
        })
        Swal.fire({
          icon: 'success',
          title: 'Presensi Pulang Berhasil!',
          html: `<b style="font-size:1.1rem; color:#7C3AED;">${studentName}</b> telah tercatat keluar dari sekolah.`,
          timer: 2500,
          showConfirmButton: false,
        })
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
      Swal.fire({
        icon: 'error',
        title: 'Absensi Gagal',
        text: msg,
      })
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
        staggerChildren: 0.04,
        delayChildren: 0.02,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 12 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut' } },
  }

  return (
    <motion.div initial="hidden" animate="visible" variants={containerVariants} className="space-y-6">
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
      <motion.div variants={itemVariants} className="relative overflow-hidden rounded-[22px] border-2 border-emerald-500/30 bg-gradient-to-r from-emerald-500/15 via-teal-500/10 to-emerald-600/15 p-5 sm:p-6 shadow-md shadow-emerald-500/10 dark:border-emerald-600/40 dark:bg-gradient-to-r dark:from-emerald-950/70 dark:via-teal-950/50 dark:to-slate-900 print:hidden">
        {/* Ambient Glow Background Accent (Vibrant Dual Emerald-Teal Blobs) */}
        <div className="pointer-events-none absolute -top-20 -right-20 h-56 w-56 rounded-full bg-gradient-to-br from-emerald-500/40 via-teal-400/30 to-emerald-600/20 blur-3xl dark:from-emerald-500/50 dark:via-teal-400/40" />
        <div className="pointer-events-none absolute -bottom-20 -left-20 h-56 w-56 rounded-full bg-gradient-to-tr from-emerald-600/30 via-teal-500/20 to-transparent blur-3xl dark:from-emerald-600/40 dark:via-teal-500/30" />

        <div className="relative z-10 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-4 min-w-0">
            <div className="flex size-12 sm:size-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700 text-white shadow-xl shadow-emerald-600/40 border border-emerald-300/40 dark:from-emerald-400 dark:via-emerald-500 dark:to-teal-600">
              <QrCode className="size-6 sm:size-7 text-white" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2.5 flex-wrap">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-emerald-600 to-teal-600 px-3.5 py-1 text-xs font-extrabold text-white shadow-sm shadow-emerald-600/25 border border-emerald-300/40">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  Terminal Absensi Gerbang
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-0.5 text-xs font-extrabold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/60">
                  <Clock className="h-3.5 w-3.5 text-emerald-600" /> Jam Masuk: {scheduleConfig.jam_masuk} (Tol: {scheduleConfig.toleransi_menit}m) | Pulang: {scheduleConfig.jam_pulang}
                </span>
              </div>
              <h1 className="mt-1.5 text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                Absensi Gerbang Kedatangan &amp; Pulang Sekolah
              </h1>
              <p className="mt-0.5 text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300 max-w-2xl leading-relaxed">
                Terminal pemindaian real-time kartu siswa, QR Code, RFID, dan verifikasi kepulangan siswa terpadu.
              </p>
            </div>
          </div>

          {/* Action Controls: Unit Filter & Schedule Config Button */}
          <div className="flex flex-wrap items-center gap-2 shrink-0 z-10">
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
                className={`h-10 appearance-none rounded-2xl border pl-9 pr-8 text-xs font-semibold shadow-xs transition-all focus:outline-none ${
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

            {/* Schedule Config Button */}
            <div className="group relative inline-flex">
              <button
                type="button"
                title="Pengaturan Jam per Unit"
                aria-label="Pengaturan Jam per Unit"
                className="flex size-10 items-center justify-center rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white hover:from-emerald-700 hover:to-teal-700 transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer border border-emerald-300/40 shadow-md shadow-emerald-600/25"
                onClick={() => setShowScheduleModal(true)}
              >
                <Settings className="size-5" />
              </button>
              <div className="pointer-events-none absolute top-full left-1/2 mt-2 -translate-x-1/2 opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 transition-all duration-200 ease-out z-50 whitespace-nowrap rounded-lg bg-slate-900 px-2.5 py-1 text-[11px] font-bold text-white shadow-xl dark:bg-slate-100 dark:text-slate-900">
                <div className="absolute bottom-full left-1/2 -mb-1 -translate-x-1/2 border-4 border-transparent border-b-slate-900 dark:border-b-slate-100" />
                Pengaturan Jam per Unit
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* KPI Cards */}
      <motion.div variants={containerVariants} className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-7">
        {/* 1. Total Siswa */}
        <motion.button
          type="button"
          variants={itemVariants}
          whileHover={{ scale: 1.04, y: -2 }}
          whileTap={{ scale: 0.96 }}
          transition={{ type: 'spring', stiffness: 400, damping: 25 }}
          onClick={() => openKpiModal('total_siswa')}
          className="text-left rounded-2xl border border-slate-100 bg-white p-4 shadow-xs transition-all hover:shadow-md dark:border-slate-800 dark:bg-slate-900 cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-slate-500 group-hover:text-slate-700 dark:text-slate-400 dark:group-hover:text-slate-200 transition">Total Siswa</p>
            <Users className="h-4 w-4 text-slate-400 opacity-0 group-hover:opacity-100 transition" />
          </div>
          <p className="mt-1 text-2xl font-extrabold text-slate-900 dark:text-white">{stats.total_siswa}</p>
          <p className="mt-1 text-[10px] text-slate-400 dark:text-slate-500 font-semibold flex items-center gap-0.5">
            Klik detail <ChevronRight className="h-3 w-3 inline" />
          </p>
        </motion.button>

        {/* 2. Hadir Tepat Waktu */}
        <motion.button
          type="button"
          variants={itemVariants}
          whileHover={{ scale: 1.04, y: -2 }}
          whileTap={{ scale: 0.96 }}
          transition={{ type: 'spring', stiffness: 400, damping: 25 }}
          onClick={() => openKpiModal('hadir')}
          className="text-left rounded-2xl border border-emerald-100 bg-emerald-50/50 p-4 shadow-xs transition-all hover:shadow-md dark:border-emerald-950/50 dark:bg-emerald-950/20 cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-emerald-700 dark:text-emerald-400">Hadir Tepat Waktu</p>
            <UserCheck className="h-4 w-4 text-emerald-500 opacity-0 group-hover:opacity-100 transition" />
          </div>
          <p className="mt-1 text-2xl font-extrabold text-emerald-600 dark:text-emerald-300">{stats.hadir}</p>
          <p className="mt-1 text-[10px] text-emerald-600/70 dark:text-emerald-400/70 font-semibold flex items-center gap-0.5">
            Klik detail <ChevronRight className="h-3 w-3 inline" />
          </p>
        </motion.button>

        {/* 3. Terlambat */}
        <motion.button
          type="button"
          variants={itemVariants}
          whileHover={{ scale: 1.04, y: -2 }}
          whileTap={{ scale: 0.96 }}
          transition={{ type: 'spring', stiffness: 400, damping: 25 }}
          onClick={() => openKpiModal('terlambat')}
          className="text-left rounded-2xl border border-amber-100 bg-amber-50/50 p-4 shadow-xs transition-all hover:shadow-md dark:border-amber-950/50 dark:bg-amber-950/20 cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-amber-700 dark:text-amber-400">Terlambat</p>
            <Clock className="h-4 w-4 text-amber-500 opacity-0 group-hover:opacity-100 transition" />
          </div>
          <p className="mt-1 text-2xl font-extrabold text-amber-600 dark:text-amber-300">{stats.terlambat}</p>
          <p className="mt-1 text-[10px] text-amber-600/70 dark:text-amber-400/70 font-semibold flex items-center gap-0.5">
            Klik detail <ChevronRight className="h-3 w-3 inline" />
          </p>
        </motion.button>

        {/* 4. Izin / Sakit */}
        <motion.button
          type="button"
          variants={itemVariants}
          whileHover={{ scale: 1.04, y: -2 }}
          whileTap={{ scale: 0.96 }}
          transition={{ type: 'spring', stiffness: 400, damping: 25 }}
          onClick={() => openKpiModal('izin_sakit')}
          className="text-left rounded-2xl border border-blue-100 bg-blue-50/50 p-4 shadow-xs transition-all hover:shadow-md dark:border-blue-950/50 dark:bg-blue-950/20 cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-blue-700 dark:text-blue-400">Izin / Sakit</p>
            <ShieldCheck className="h-4 w-4 text-blue-500 opacity-0 group-hover:opacity-100 transition" />
          </div>
          <p className="mt-1 text-2xl font-extrabold text-blue-600 dark:text-blue-300">{stats.izin + stats.sakit}</p>
          <p className="mt-1 text-[10px] text-blue-600/70 dark:text-blue-400/70 font-semibold flex items-center gap-0.5">
            Klik detail <ChevronRight className="h-3 w-3 inline" />
          </p>
        </motion.button>

        {/* 5. Belum Hadir */}
        <motion.button
          type="button"
          variants={itemVariants}
          whileHover={{ scale: 1.04, y: -2 }}
          whileTap={{ scale: 0.96 }}
          transition={{ type: 'spring', stiffness: 400, damping: 25 }}
          onClick={() => openKpiModal('belum_hadir')}
          className="text-left rounded-2xl border border-orange-100 bg-orange-50/50 p-4 shadow-xs transition-all hover:shadow-md dark:border-orange-950/50 dark:bg-orange-950/20 cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-orange-700 dark:text-orange-400">Belum Hadir</p>
            <AlertTriangle className="h-4 w-4 text-orange-500 opacity-0 group-hover:opacity-100 transition" />
          </div>
          <p className="mt-1 text-2xl font-extrabold text-orange-600 dark:text-orange-300">{stats.belum_hadir}</p>
          <p className="mt-1 text-[10px] text-orange-600/70 dark:text-orange-400/70 font-semibold flex items-center gap-0.5">
            Klik detail <ChevronRight className="h-3 w-3 inline" />
          </p>
        </motion.button>

        {/* 6. Alpha */}
        <motion.button
          type="button"
          variants={itemVariants}
          whileHover={{ scale: 1.04, y: -2 }}
          whileTap={{ scale: 0.96 }}
          transition={{ type: 'spring', stiffness: 400, damping: 25 }}
          onClick={() => openKpiModal('alpha')}
          className="text-left rounded-2xl border border-rose-100 bg-rose-50/50 p-4 shadow-xs transition-all hover:shadow-md dark:border-rose-950/50 dark:bg-rose-950/20 cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-rose-700 dark:text-rose-400">Alpha</p>
            <UserX className="h-4 w-4 text-rose-500 opacity-0 group-hover:opacity-100 transition" />
          </div>
          <p className="mt-1 text-2xl font-extrabold text-rose-600 dark:text-rose-300">{stats.alpha}</p>
          <p className="mt-1 text-[10px] text-rose-600/70 dark:text-rose-400/70 font-semibold flex items-center gap-0.5">
            Klik detail <ChevronRight className="h-3 w-3 inline" />
          </p>
        </motion.button>

        {/* 7. Sudah Pulang */}
        <motion.button
          type="button"
          variants={itemVariants}
          whileHover={{ scale: 1.04, y: -2 }}
          whileTap={{ scale: 0.96 }}
          transition={{ type: 'spring', stiffness: 400, damping: 25 }}
          onClick={() => openKpiModal('sudah_pulang')}
          className="text-left rounded-2xl border border-violet-100 bg-violet-50/50 p-4 shadow-xs transition-all hover:shadow-md dark:border-violet-950/50 dark:bg-violet-950/20 cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-violet-700 dark:text-violet-400">Sudah Pulang</p>
            <LogOut className="h-4 w-4 text-violet-500 opacity-0 group-hover:opacity-100 transition" />
          </div>
          <p className="mt-1 text-2xl font-extrabold text-violet-600 dark:text-violet-300">{stats.sudah_pulang}</p>
          <p className="mt-1 text-[10px] text-violet-600/70 dark:text-violet-400/70 font-semibold flex items-center gap-0.5">
            Klik detail <ChevronRight className="h-3 w-3 inline" />
          </p>
        </motion.button>
      </motion.div>

      {/* Tabs */}
      <motion.div variants={itemVariants} className="flex border-b border-slate-200 dark:border-slate-800 relative">
        <button
          onClick={() => setActiveTab('scan')}
          className={`relative flex items-center gap-2 px-4 py-3 text-sm font-semibold transition ${
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
          onClick={() => setActiveTab('logs')}
          className={`relative flex items-center gap-2 px-4 py-3 text-sm font-semibold transition ${
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
              <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                {/* Scan Mode Switcher */}
                <div className="mb-6 grid grid-cols-2 gap-2 rounded-2xl bg-slate-100 p-1.5 dark:bg-slate-800">
                  <button
                    type="button"
                    onClick={() => setScanMode('checkin')}
                    className={`relative flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold transition z-10 ${
                      scanMode === 'checkin'
                        ? 'text-white'
                        : 'text-slate-600 hover:text-slate-900 dark:text-slate-300'
                    }`}
                  >
                    {scanMode === 'checkin' && (
                      <motion.div
                        layoutId="activeScanModeBg"
                        className="absolute inset-0 rounded-xl bg-emerald-600 shadow-md -z-10"
                        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                      />
                    )}
                    <LogIn className="h-4 w-4" /> PRESENSI KEDATANGAN
                  </button>
                  <button
                    type="button"
                    onClick={() => setScanMode('checkout')}
                    className={`relative flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold transition z-10 ${
                      scanMode === 'checkout'
                        ? 'text-white'
                        : 'text-slate-600 hover:text-slate-900 dark:text-slate-300'
                    }`}
                  >
                    {scanMode === 'checkout' && (
                      <motion.div
                        layoutId="activeScanModeBg"
                        className="absolute inset-0 rounded-xl bg-violet-600 shadow-md -z-10"
                        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                      />
                    )}
                    <LogOut className="h-4 w-4" /> PRESENSI PULANG
                  </button>
                </div>

                {/* Method Selector */}
                <div className="mb-6">
                  <label className="mb-2 block text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Metode Scan
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setMethod('QRCODE')}
                      className={`flex items-center justify-center gap-2 rounded-xl border p-3 text-xs font-bold transition ${
                        method === 'QRCODE'
                          ? 'border-emerald-500 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300'
                          : 'border-slate-200 bg-white text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300'
                      }`}
                    >
                      <QrCode className="h-4 w-4" /> QR Code Kartu
                    </button>
                    <button
                      type="button"
                      onClick={() => setMethod('RFID')}
                      className={`flex items-center justify-center gap-2 rounded-xl border p-3 text-xs font-bold transition ${
                        method === 'RFID'
                          ? 'border-emerald-500 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300'
                          : 'border-slate-200 bg-white text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300'
                      }`}
                    >
                      <Radio className="h-4 w-4" /> RFID Tap
                    </button>
                    <button
                      type="button"
                      onClick={() => setMethod('MANUAL')}
                      className={`flex items-center justify-center gap-2 rounded-xl border p-3 text-xs font-bold transition ${
                        method === 'MANUAL'
                          ? 'border-emerald-500 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300'
                          : 'border-slate-200 bg-white text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300'
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
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400">
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
                        className="flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white shadow transition hover:bg-emerald-700 whitespace-nowrap"
                      >
                        <Camera className="h-4 w-4" /> Buka Kamera Pemindai
                      </button>
                    </div>

                    <form onSubmit={handleScanSubmit} className="space-y-2">
                      <label className="block text-xs font-semibold text-slate-500 uppercase">Input Hardware Scanner USB</label>
                      <div className="relative">
                        <input
                          type="text"
                          autoFocus
                          value={cardInput}
                          onChange={(e) => setCardInput(e.target.value)}
                          placeholder="Scan QR Code via scanner USB..."
                          className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 pr-12 text-sm font-semibold text-slate-900 focus:border-emerald-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                        />
                        <button
                          type="submit"
                          disabled={processingScan}
                          className="absolute right-2 top-1.5 rounded-xl bg-emerald-600 px-3.5 py-2 text-xs font-bold text-white shadow transition hover:bg-emerald-700 disabled:opacity-50"
                        >
                          Proses
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
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-blue-600 dark:bg-blue-950 dark:text-blue-400">
                          <Wifi className="h-5 w-5 animate-pulse" />
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-blue-900 dark:text-blue-200">Perangkat RFID Reader Terhubung</h4>
                          <p className="text-xs text-slate-600 dark:text-slate-400">Silakan tap kartu RFID siswa pada alat pembaca.</p>
                        </div>
                      </div>
                      <span className="inline-flex items-center rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-bold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                        Standby RFID
                      </span>
                    </div>

                    <form onSubmit={handleScanSubmit} className="space-y-2">
                      <label className="block text-xs font-semibold text-slate-500 uppercase">Input RFID Card Tap Code</label>
                      <div className="relative">
                        <input
                          type="text"
                          autoFocus
                          value={cardInput}
                          onChange={(e) => setCardInput(e.target.value)}
                          placeholder="Tap kartu RFID pada alat pembaca..."
                          className="w-full rounded-2xl border border-blue-200 bg-blue-50/30 px-4 py-4 pr-12 text-base font-semibold text-slate-900 focus:border-blue-500 focus:bg-white focus:outline-none dark:border-blue-900 dark:bg-slate-800 dark:text-white"
                        />
                        <button
                          type="submit"
                          disabled={processingScan}
                          className="absolute right-2 top-2 rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white shadow transition hover:bg-blue-700 disabled:opacity-50"
                        >
                          Proses RFID
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
                    <div className="relative">
                      <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                      <input
                        type="text"
                        value={studentSearch}
                        onChange={(e) => setStudentSearch(e.target.value)}
                        placeholder="Cari berdasarkan nama siswa, NIS, atau NISN..."
                        className="w-full rounded-2xl border border-slate-200 bg-slate-50 pl-10 pr-4 py-3 text-sm font-semibold text-slate-900 focus:border-emerald-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                      />
                    </div>

                    {/* Student List View */}
                    <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                      {loadingStudents ? (
                        <p className="py-6 text-center text-xs text-slate-400">Memuat daftar siswa...</p>
                      ) : studentsList.length === 0 ? (
                        <p className="py-6 text-center text-xs text-slate-400">Siswa tidak ditemukan.</p>
                      ) : (
                        studentsList.map((st) => (
                          <div
                            key={st.id}
                            className="flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50/50 p-3 transition hover:bg-slate-100/80 dark:border-slate-800 dark:bg-slate-800/40 dark:hover:bg-slate-800"
                          >
                            <div>
                              <p className="text-sm font-bold text-slate-900 dark:text-white">
                                {st.nama_lengkap || st.full_name || 'Siswa'}
                              </p>
                              <p className="text-xs text-slate-500">
                                NISN: <span className="font-semibold text-slate-700 dark:text-slate-300">{st.nisn || '-'}</span> | Kelas: {st.kelas?.nama || '-'}
                              </p>
                            </div>
                            <button
                              type="button"
                              disabled={processingScan}
                              onClick={() => executeScan('', st.id)}
                              className={`flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-bold text-white shadow transition disabled:opacity-50 ${
                                scanMode === 'checkin'
                                  ? 'bg-emerald-600 hover:bg-emerald-700'
                                  : 'bg-violet-600 hover:bg-violet-700'
                              }`}
                            >
                              {scanMode === 'checkin' ? (
                                <>
                                  <LogIn className="h-3.5 w-3.5" /> Absen Masuk
                                </>
                              ) : (
                                <>
                                  <LogOut className="h-3.5 w-3.5" /> Absen Pulang
                                </>
                              )}
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
              <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <h3 className="mb-4 text-base font-bold text-slate-900 dark:text-white">Status Pemindaian Terakhir</h3>
                {lastScanResult ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 25 }}
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
                  <div className="rounded-2xl border border-dashed border-slate-200 p-8 text-center text-slate-400 dark:border-slate-700">
                    Belum ada pemindaian yang dilakukan pada sesi ini.
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
            className="rounded-3xl border border-slate-100 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 overflow-hidden"
          >
            <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Daftar Kehadiran Kedatangan & Pulang Hari Ini
              </h3>
              <button
                onClick={fetchLogs}
                className="flex items-center gap-2 rounded-xl bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300"
              >
                <RefreshCw className="h-3.5 w-3.5" /> Refresh
              </button>
            </div>

            <div className="overflow-x-auto rounded-2xl border-2 border-emerald-500/25 bg-white shadow-md shadow-emerald-500/5 dark:border-emerald-600/35 dark:bg-[#13221f]">
              <table className="w-full text-left text-sm text-slate-600 dark:text-slate-300">
                <thead className="bg-gradient-to-r from-emerald-600 to-teal-600 text-xs uppercase font-extrabold text-white">
                  <tr>
                    <th className="px-6 py-3.5 text-white font-extrabold">Siswa</th>
                    <th className="px-6 py-3.5 text-white font-extrabold">Unit / Kelas</th>
                    <th className="px-6 py-3.5 text-white font-extrabold">Jam Masuk</th>
                    <th className="px-6 py-3.5 text-white font-extrabold">Status Masuk</th>
                    <th className="px-6 py-3.5 text-white font-extrabold">Jam Pulang</th>
                    <th className="px-6 py-3.5 text-white font-extrabold">Status Pulang</th>
                    <th className="px-6 py-3.5 text-white font-extrabold">Metode</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {loadingLogs ? (
                    <tr>
                      <td colSpan="7" className="px-6 py-8 text-center text-slate-400">
                        Memuat data log presensi...
                      </td>
                    </tr>
                  ) : logs.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="px-6 py-8 text-center text-slate-400">
                        Belum ada data presensi gerbang.
                      </td>
                    </tr>
                  ) : (
                    logs.map((log) => (
                      <tr key={log.id} className="hover:bg-emerald-50/50 dark:hover:bg-emerald-950/40 transition-colors">
                        <td className="px-6 py-4 font-semibold text-slate-900 dark:text-white">
                          {log.student?.nama_lengkap || 'Siswa'}
                          <span className="block text-xs font-normal text-slate-400">{log.student?.nisn}</span>
                        </td>
                        <td className="px-6 py-4">{log.education_unit?.nama || '-'}</td>
                        <td className="px-6 py-4 font-medium">
                          {log.check_in_time ? new Date(log.check_in_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-'}
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold ${
                              log.status === 'HADIR'
                                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                                : log.status === 'TERLAMBAT'
                                  ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                                  : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                            }`}
                          >
                            {log.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 font-medium">
                          {log.check_out_time
                            ? new Date(log.check_out_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                            : '-'}
                        </td>
                        <td className="px-6 py-4">{log.check_out_status || '-'}</td>
                        <td className="px-6 py-4 text-xs font-semibold text-slate-500">{log.attendance_method}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
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
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-md"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ type: 'spring', stiffness: 380, damping: 26 }}
              className="w-full max-w-2xl overflow-hidden rounded-3xl bg-white shadow-2xl dark:bg-slate-900 border border-slate-100 dark:border-slate-800 max-h-[90vh] flex flex-col"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between border-b border-slate-100 p-5 dark:border-slate-800 shrink-0">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400">
                    <Settings className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">Form Pengaturan Jam Masuk & Pulang Per Unit</h3>
                    <p className="text-xs text-slate-500">Konfigurasi jadwal jam absensi spesifik masing-masing unit pendidikan.</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowScheduleModal(false)}
                  className="rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Modal Content */}
              <div className="p-6 overflow-y-auto space-y-6 flex-1">
                {/* Unit Target Selector */}
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Pilih Unit Pendidikan Target
                  </label>
                  <select
                    disabled={!isMultiUnitUser}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm font-bold text-slate-900 focus:border-emerald-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
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
                      <label className="mb-1 block text-xs font-semibold text-slate-700 dark:text-slate-300">
                        Jam Masuk Sekolah
                      </label>
                      <input
                        type="time"
                        required
                        value={scheduleConfig.jam_masuk}
                        onChange={(e) => setScheduleConfig({ ...scheduleConfig, jam_masuk: e.target.value })}
                        className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-sm font-semibold text-slate-900 focus:border-emerald-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                      />
                    </div>

                    <div>
                      <label className="mb-1 block text-xs font-semibold text-slate-700 dark:text-slate-300">
                        Toleransi Terlambat (Menit)
                      </label>
                      <input
                        type="number"
                        required
                        min="0"
                        max="120"
                        value={scheduleConfig.toleransi_menit}
                        onChange={(e) => setScheduleConfig({ ...scheduleConfig, toleransi_menit: e.target.value })}
                        className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-sm font-semibold text-slate-900 focus:border-emerald-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                      />
                    </div>

                    <div>
                      <label className="mb-1 block text-xs font-semibold text-slate-700 dark:text-slate-300">
                        Jam Pulang Sekolah
                      </label>
                      <input
                        type="time"
                        required
                        value={scheduleConfig.jam_pulang}
                        onChange={(e) => setScheduleConfig({ ...scheduleConfig, jam_pulang: e.target.value })}
                        className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-sm font-semibold text-slate-900 focus:border-emerald-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                      />
                    </div>

                    <div>
                      <label className="mb-1 block text-xs font-semibold text-slate-700 dark:text-slate-300">
                        Batas Jam Cutoff Alpha
                      </label>
                      <input
                        type="time"
                        required
                        value={scheduleConfig.jam_cutoff_alpha}
                        onChange={(e) => setScheduleConfig({ ...scheduleConfig, jam_cutoff_alpha: e.target.value })}
                        className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-sm font-semibold text-slate-900 focus:border-emerald-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end pt-2">
                    <button
                      type="submit"
                      disabled={savingSchedule}
                      className="rounded-xl bg-emerald-600 px-5 py-2.5 text-xs font-bold text-white shadow hover:bg-emerald-700 disabled:opacity-50"
                    >
                      {savingSchedule ? 'Menyimpan...' : 'Simpan Pengaturan Unit Ini'}
                    </button>
                  </div>
                </form>

                {/* Matriks Ringkasan Jam Seluruh Unit */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Layers className="h-4 w-4 text-emerald-600" /> Ringkasan Jam Absensi Seluruh Unit
                  </h4>
                  <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800">
                    <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
                      <thead className="bg-slate-50 uppercase text-[10px] font-bold text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                        <tr>
                          <th className="px-4 py-3">Unit Pendidikan</th>
                          <th className="px-4 py-3">Jam Masuk</th>
                          <th className="px-4 py-3">Toleransi</th>
                          <th className="px-4 py-3">Jam Pulang</th>
                          <th className="px-4 py-3">Cutoff Alpha</th>
                          <th className="px-4 py-3 text-right">Aksi</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {allUnitsSchedules.length === 0 ? (
                          <tr>
                            <td colSpan="6" className="px-4 py-4 text-center text-slate-400">
                              Belum ada data unit.
                            </td>
                          </tr>
                        ) : (
                          allUnitsSchedules.map((u) => (
                            <tr key={u.unit_id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                              <td className="px-4 py-3 font-bold text-slate-900 dark:text-white">
                                {u.unit_name}
                                {u.has_custom_schedule && (
                                  <span className="ml-2 inline-flex items-center rounded-full bg-emerald-100 px-2 py-0.5 text-[9px] font-bold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                                    Kustom
                                  </span>
                                )}
                              </td>
                              <td className="px-4 py-3 font-semibold text-emerald-700 dark:text-emerald-400">{u.schedule.jam_masuk}</td>
                              <td className="px-4 py-3">{u.schedule.toleransi_menit} Menit</td>
                              <td className="px-4 py-3 font-semibold text-violet-700 dark:text-violet-400">{u.schedule.jam_pulang}</td>
                              <td className="px-4 py-3">{u.schedule.jam_cutoff_alpha}</td>
                              <td className="px-4 py-3 text-right">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setTargetUnitForConfig(u.unit_id)
                                    setScheduleConfig(u.schedule)
                                  }}
                                  className="rounded-lg bg-slate-100 px-2.5 py-1 text-[11px] font-bold text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 dark:bg-slate-800 dark:text-slate-300"
                                >
                                  Edit Unit Ini
                                </button>
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
              <div className="flex items-center justify-end border-t border-slate-100 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-800/40 shrink-0">
                <button
                  type="button"
                  onClick={() => setShowScheduleModal(false)}
                  className="rounded-xl bg-slate-200 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-300 dark:bg-slate-700 dark:text-slate-200"
                >
                  Tutup Form
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Pop-Up Camera Scanner Modal */}
      <AnimatePresence>
        {showCameraModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-md"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ type: 'spring', stiffness: 380, damping: 26 }}
              className="w-full max-w-xl overflow-hidden rounded-3xl bg-white shadow-2xl dark:bg-slate-900 border border-slate-100 dark:border-slate-800"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between border-b border-slate-100 p-5 dark:border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400">
                    <Camera className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">Pemindai Kamera Web Live</h3>
                    <p className="text-xs text-slate-500">Mode: {scanMode === 'checkin' ? 'KEDATANGAN' : 'PULANG'}</p>
                  </div>
                </div>
                <button
                  onClick={closeCameraModal}
                  className="rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 space-y-4">
                {/* Camera Video View */}
                <div className="relative aspect-video w-full overflow-hidden rounded-2xl border border-slate-200 bg-black shadow-inner dark:border-slate-800">
                  <video ref={videoRef} autoPlay playsInline muted className="h-full w-full object-cover" />

                  {cameraLoading && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900/80 text-white gap-2">
                      <RefreshCw className="h-8 w-8 animate-spin text-emerald-400" />
                      <p className="text-xs font-semibold">Menghubungkan ke kamera...</p>
                    </div>
                  )}

                  {/* Target Frame Overlay */}
                  {cameraActive && (
                    <div className="absolute inset-0 border-2 border-dashed border-emerald-400/80 pointer-events-none rounded-2xl m-6 flex flex-col items-center justify-between p-4">
                      <span className="bg-black/60 backdrop-blur-sm px-3 py-1 text-[11px] font-bold text-emerald-300 rounded-full flex items-center gap-1.5">
                        <span className="h-2 w-2 rounded-full bg-rose-500 animate-ping" />
                        LIVE — Dekatkan QR Code Kartu ke Kamera
                      </span>
                    </div>
                  )}
                </div>

                {cameraError && (
                  <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs font-semibold text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/30 dark:text-rose-300">
                    {cameraError}
                  </div>
                )}

                {/* Quick Code Entry in Modal */}
                <form onSubmit={handleModalScanSubmit} className="space-y-3 pt-2">
                  <label className="block text-xs font-semibold text-slate-500 uppercase">Input / Hasil Pindai Kode Kartu</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      autoFocus
                      value={modalCardInput}
                      onChange={(e) => setModalCardInput(e.target.value)}
                      placeholder="Hasil scan QR / Ketik nomor kartu..."
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-900 focus:border-emerald-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                    />
                    <button
                      type="submit"
                      disabled={processingScan}
                      className="rounded-xl bg-emerald-600 px-5 py-3 text-sm font-bold text-white shadow hover:bg-emerald-700 disabled:opacity-50 whitespace-nowrap"
                    >
                      {processingScan ? 'Proses...' : 'Proses Absen'}
                    </button>
                  </div>
                </form>
              </div>

              {/* Modal Footer */}
              <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-800/40">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={cameraActive ? stopCamera : startCamera}
                    className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                  >
                    {cameraActive ? (
                      <>
                        <CameraOff className="h-3.5 w-3.5 text-rose-500" /> Matikan Kamera
                      </>
                    ) : (
                      <>
                        <Camera className="h-3.5 w-3.5 text-emerald-500" /> Nyalakan Ulang Kamera
                      </>
                    )}
                  </button>
                </div>
                <button
                  type="button"
                  onClick={closeCameraModal}
                  className="rounded-xl bg-slate-200 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-300 dark:bg-slate-700 dark:text-slate-200"
                >
                  Tutup Window
                </button>
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
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-md"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ type: 'spring', stiffness: 380, damping: 26 }}
              className="w-full max-w-4xl overflow-hidden rounded-3xl bg-white shadow-2xl dark:bg-slate-900 border border-slate-100 dark:border-slate-800 max-h-[90vh] flex flex-col"
            >
              {/* Header Modal */}
              <div className="flex items-center justify-between border-b border-slate-100 p-5 dark:border-slate-800 shrink-0">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400 font-bold">
                    <Users className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      {kpiModal.title}
                      <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-extrabold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                        {filteredKpiData.length} Siswa
                      </span>
                    </h3>
                    <p className="text-xs text-slate-500">
                      Daftar detail siswa berdasarkan status presensi gerbang hari ini.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={closeKpiModal}
                  className="rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200 transition"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Toolbar Filter / Search dalam Modal */}
              <div className="border-b border-slate-100 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-800/40 shrink-0 flex items-center justify-between gap-3">
                <div className="relative flex-1 max-w-sm">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={kpiModal.search}
                    onChange={(e) => setKpiModal((prev) => ({ ...prev, search: e.target.value }))}
                    placeholder="Cari nama siswa, NIS, atau NISN..."
                    className="w-full rounded-xl border border-slate-200 bg-white pl-9 pr-4 py-2 text-xs font-semibold text-slate-900 focus:border-emerald-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
                {kpiModal.search && (
                  <button
                    type="button"
                    onClick={() => setKpiModal((prev) => ({ ...prev, search: '' }))}
                    className="text-xs font-semibold text-slate-500 hover:text-slate-700 dark:text-slate-400"
                  >
                    Reset Cari
                  </button>
                )}
              </div>

              {/* Content Table Body */}
              <div className="overflow-y-auto p-5 flex-1 space-y-4">
                {kpiModal.loading ? (
                  <div className="flex flex-col items-center justify-center py-12 text-slate-400 gap-3">
                    <RefreshCw className="h-8 w-8 animate-spin text-emerald-500" />
                    <p className="text-xs font-semibold">Memuat data siswa...</p>
                  </div>
                ) : filteredKpiData.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-slate-400 gap-2">
                    <Users className="h-10 w-10 text-slate-300 dark:text-slate-600" />
                    <p className="text-sm font-bold text-slate-700 dark:text-slate-300">Tidak ada data siswa</p>
                    <p className="text-xs text-slate-500">Tidak ditemukan siswa dengan kriteria filter ini.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto rounded-2xl border border-slate-100 dark:border-slate-800">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                        <tr>
                          <th className="px-4 py-3">NO</th>
                          <th className="px-4 py-3">SISWA</th>
                          <th className="px-4 py-3">KELAS / UNIT</th>
                          <th className="px-4 py-3">JAM MASUK</th>
                          <th className="px-4 py-3">JAM PULANG</th>
                          <th className="px-4 py-3 text-center">STATUS PRESENSI</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-medium text-slate-700 dark:divide-slate-800 dark:text-slate-300">
                        {filteredKpiData.map((item, idx) => (
                          <tr key={item.student_id || item.id || idx} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition">
                            <td className="px-4 py-3 font-bold text-slate-400">{idx + 1}</td>
                            <td className="px-4 py-3">
                              <p className="font-bold text-slate-900 dark:text-white">{item.nama_lengkap || item.full_name || item.student?.nama_lengkap || 'Siswa'}</p>
                              <p className="text-[11px] text-slate-400">NIS: {item.nis || item.nisn || item.student?.nis || '-'}</p>
                            </td>
                            <td className="px-4 py-3">
                              <p className="font-semibold text-slate-800 dark:text-slate-200">{item.kelas_name || item.school_class?.name || item.school_class?.nama_kelas || '-'}</p>
                              <p className="text-[10px] text-slate-400">{item.unit_name || item.education_unit?.name || '-'}</p>
                            </td>
                            <td className="px-4 py-3 font-bold text-emerald-600 dark:text-emerald-400">
                              {item.check_in_time ? item.check_in_time.slice(0, 5) : '-'}
                            </td>
                            <td className="px-4 py-3 font-bold text-violet-600 dark:text-violet-400">
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
              <div className="flex items-center justify-end border-t border-slate-100 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-800/40 shrink-0">
                <button
                  type="button"
                  onClick={closeKpiModal}
                  className="rounded-xl bg-slate-200 px-5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-300 dark:bg-slate-700 dark:text-slate-200 transition"
                >
                  Tutup Window
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
