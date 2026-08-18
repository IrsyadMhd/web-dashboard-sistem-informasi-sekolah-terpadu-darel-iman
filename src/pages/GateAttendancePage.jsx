import React, { useState, useEffect, useRef } from 'react'
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
  Settings,
  Lock,
  Layers,
} from 'lucide-react'
import Swal from 'sweetalert2'
import { gateAttendanceService } from '../services/gateAttendanceService'
import { educationUnitService } from '../services/educationUnitService'
import { studentService } from '../services/studentService'
import { useAuthStore } from '../stores/authStore'

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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Absensi Gerbang Kedatangan & Pulang Sekolah
          </h1>
          <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
            <span>Terminal pemindaian real-time kartu siswa, QR Code, RFID, dan verifikasi kepulangan.</span>
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 font-bold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
              <Clock className="h-3 w-3" /> Jam Masuk: {scheduleConfig.jam_masuk} (Tol: {scheduleConfig.toleransi_menit}m) | Jam Pulang: {scheduleConfig.jam_pulang}
            </span>
          </div>
        </div>

        {/* Action Controls: Unit Filter & Schedule Config Button */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-2">
            {isMultiUnitUser ? (
              <Building2 className="h-4 w-4 text-slate-400" />
            ) : (
              <Lock className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            )}

            <select
              disabled={!isMultiUnitUser}
              className={`rounded-xl border px-3 py-2 text-sm font-medium transition focus:outline-none ${
                isMultiUnitUser
                  ? 'border-slate-200 bg-white text-slate-700 shadow-sm focus:border-emerald-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200'
                  : 'border-emerald-200 bg-emerald-50/70 text-emerald-900 font-bold dark:border-emerald-900 dark:bg-emerald-950/60 dark:text-emerald-300 cursor-not-allowed'
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
          </div>

          <button
            type="button"
            onClick={() => setShowScheduleModal(true)}
            className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 shadow-sm transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
          >
            <Settings className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" /> Pengaturan Jam per Unit
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-7">
        <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm transition hover:shadow-md dark:border-slate-800 dark:bg-slate-900">
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Total Siswa</p>
          <p className="mt-1 text-2xl font-extrabold text-slate-900 dark:text-white">{stats.total_siswa}</p>
        </div>
        <div className="rounded-2xl border border-emerald-100 bg-emerald-50/50 p-4 shadow-sm dark:border-emerald-950/50 dark:bg-emerald-950/20">
          <p className="text-xs font-medium text-emerald-700 dark:text-emerald-400">Hadir Tepat Waktu</p>
          <p className="mt-1 text-2xl font-extrabold text-emerald-600 dark:text-emerald-300">{stats.hadir}</p>
        </div>
        <div className="rounded-2xl border border-amber-100 bg-amber-50/50 p-4 shadow-sm dark:border-amber-950/50 dark:bg-amber-950/20">
          <p className="text-xs font-medium text-amber-700 dark:text-amber-400">Terlambat</p>
          <p className="mt-1 text-2xl font-extrabold text-amber-600 dark:text-amber-300">{stats.terlambat}</p>
        </div>
        <div className="rounded-2xl border border-blue-100 bg-blue-50/50 p-4 shadow-sm dark:border-blue-950/50 dark:bg-blue-950/20">
          <p className="text-xs font-medium text-blue-700 dark:text-blue-400">Izin / Sakit</p>
          <p className="mt-1 text-2xl font-extrabold text-blue-600 dark:text-blue-300">{stats.izin + stats.sakit}</p>
        </div>
        <div className="rounded-2xl border border-orange-100 bg-orange-50/50 p-4 shadow-sm dark:border-orange-950/50 dark:bg-orange-950/20">
          <p className="text-xs font-medium text-orange-700 dark:text-orange-400">Belum Hadir</p>
          <p className="mt-1 text-2xl font-extrabold text-orange-600 dark:text-orange-300">{stats.belum_hadir}</p>
        </div>
        <div className="rounded-2xl border border-rose-100 bg-rose-50/50 p-4 shadow-sm dark:border-rose-950/50 dark:bg-rose-950/20">
          <p className="text-xs font-medium text-rose-700 dark:text-rose-400">Alpha</p>
          <p className="mt-1 text-2xl font-extrabold text-rose-600 dark:text-rose-300">{stats.alpha}</p>
        </div>
        <div className="rounded-2xl border border-violet-100 bg-violet-50/50 p-4 shadow-sm dark:border-violet-950/50 dark:bg-violet-950/20">
          <p className="text-xs font-medium text-violet-700 dark:text-violet-400">Sudah Pulang</p>
          <p className="mt-1 text-2xl font-extrabold text-violet-600 dark:text-violet-300">{stats.sudah_pulang}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800">
        <button
          onClick={() => setActiveTab('scan')}
          className={`flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-semibold transition ${
            activeTab === 'scan'
              ? 'border-emerald-600 text-emerald-600 dark:border-emerald-400 dark:text-emerald-400'
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400'
          }`}
        >
          <QrCode className="h-4 w-4" /> Terminal Pemindaian
        </button>
        <button
          onClick={() => setActiveTab('logs')}
          className={`flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-semibold transition ${
            activeTab === 'logs'
              ? 'border-emerald-600 text-emerald-600 dark:border-emerald-400 dark:text-emerald-400'
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400'
          }`}
        >
          <Clock className="h-4 w-4" /> Log Real-Time Kedatangan & Pulang
        </button>
      </div>

      {activeTab === 'scan' && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* Main Terminal Panel */}
          <div className="space-y-6 lg:col-span-7">
            <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              {/* Scan Mode Switcher */}
              <div className="mb-6 grid grid-cols-2 gap-2 rounded-2xl bg-slate-100 p-1.5 dark:bg-slate-800">
                <button
                  type="button"
                  onClick={() => setScanMode('checkin')}
                  className={`flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold transition ${
                    scanMode === 'checkin'
                      ? 'bg-emerald-600 text-white shadow-md'
                      : 'text-slate-600 hover:text-slate-900 dark:text-slate-300'
                  }`}
                >
                  <LogIn className="h-4 w-4" /> PRESENSI KEDATANGAN
                </button>
                <button
                  type="button"
                  onClick={() => setScanMode('checkout')}
                  className={`flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold transition ${
                    scanMode === 'checkout'
                      ? 'bg-violet-600 text-white shadow-md'
                      : 'text-slate-600 hover:text-slate-900 dark:text-slate-300'
                  }`}
                >
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
                  <div className="rounded-2xl border border-emerald-100 bg-emerald-50/60 p-4 dark:border-emerald-950/50 dark:bg-emerald-950/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <h4 className="text-sm font-bold text-emerald-900 dark:text-emerald-200 flex items-center gap-2">
                        <Camera className="h-4 w-4 text-emerald-600 dark:text-emerald-400" /> Pemindai Kamera Live (Pop-up Window)
                      </h4>
                      <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                        Klik tombol untuk membuka jendela kamera web interaktif.
                      </p>
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
                  <div className="rounded-2xl border border-blue-100 bg-blue-50/60 p-4 dark:border-blue-950/50 dark:bg-blue-950/30 flex items-center justify-between">
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
                <div
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
                </div>
              ) : (
                <div className="rounded-2xl border border-dashed border-slate-200 p-8 text-center text-slate-400 dark:border-slate-700">
                  Belum ada pemindaian yang dilakukan pada sesi ini.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'logs' && (
        <div className="rounded-3xl border border-slate-100 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 overflow-hidden">
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

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600 dark:text-slate-300">
              <thead className="bg-slate-50 text-xs uppercase font-semibold text-slate-500 dark:bg-slate-800/50 dark:text-slate-400">
                <tr>
                  <th className="px-6 py-4">Siswa</th>
                  <th className="px-6 py-4">Unit / Kelas</th>
                  <th className="px-6 py-4">Jam Masuk</th>
                  <th className="px-6 py-4">Status Masuk</th>
                  <th className="px-6 py-4">Jam Pulang</th>
                  <th className="px-6 py-4">Status Pulang</th>
                  <th className="px-6 py-4">Metode</th>
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
                    <tr key={log.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                      <td className="px-6 py-4 font-semibold text-slate-900 dark:text-white">
                        {log.student?.nama_lengkap || 'Siswa'}
                        <span className="block text-xs font-normal text-slate-400">{log.student?.nisn}</span>
                      </td>
                      <td className="px-6 py-4">{log.education_unit?.nama || '-'}</td>
                      <td className="px-6 py-4 font-medium">
                        {log.check_in_time
                          ? new Date(log.check_in_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                          : '-'}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                            log.status === 'HADIR' || log.status === 'HADIR_DALAM_TOLERANSI'
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                              : log.status === 'TERLAMBAT'
                              ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                              : 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300'
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
        </div>
      )}

      {/* Per-Unit Schedule Config Modal */}
      {showScheduleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-md">
          <div className="w-full max-w-2xl overflow-hidden rounded-3xl bg-white shadow-2xl dark:bg-slate-900 border border-slate-100 dark:border-slate-800 animate-in fade-in zoom-in duration-200 max-h-[90vh] flex flex-col">
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
          </div>
        </div>
      )}

      {/* Pop-Up Camera Scanner Modal */}
      {showCameraModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-md">
          <div className="w-full max-w-xl overflow-hidden rounded-3xl bg-white shadow-2xl dark:bg-slate-900 border border-slate-100 dark:border-slate-800 animate-in fade-in zoom-in duration-200">
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
                    <span className="bg-black/60 backdrop-blur-sm px-3 py-1 text-[11px] font-bold text-emerald-300 rounded-full">
                      🔴 LIVE — Dekatkan QR Code Kartu ke Kamera
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
          </div>
        </div>
      )}
    </div>
  )
}
